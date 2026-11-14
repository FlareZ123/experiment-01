'use strict';

const { once } = require('node:events');
const { randomBytes } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const protocol = require('./agent49-policy-protocol.cjs');
const {
  INIT_SCHEMA, READY_SCHEMA, REQUEST_SCHEMA, RESPONSE_SCHEMA,
  LIMITS, ProtocolError, fail, assertBoundedJson, assertNoForbiddenFields,
  validateInit, validateRequest, validateDecision, deepFreeze
} = protocol;

async function writeLine(value) {
  const bytes = Buffer.from(JSON.stringify(value) + '\n', 'utf8');
  if (bytes.length > LIMITS.maxResponseBytes) fail('RESPONSE_TOO_LARGE');
  if (!process.stdout.write(bytes)) await once(process.stdout, 'drain');
}

/* Physical-game RNG and seed never cross IPC. Each role process owns an
 * independent CSPRNG-backed policy stream. Draws are counted and rejected until
 * a separately approved replay protocol permits stochastic policies. */
function createWorkerLocalPolicyStream() {
  let drawCount=0;
  return {
    protocol:'worker-local-independent-crypto-stream-v1',
    next(){
      drawCount++;
      return randomBytes(4).readUInt32BE(0)/0x100000000;
    },
    get drawCount(){return drawCount;}
  };
}


function createRestrictedPolicyRuntime(policySource,policyStream) {
  if(typeof policySource!=='string'||!policyStream||typeof policyStream.next!=='function')
    fail('POLICY_SANDBOX_INPUT_INVALID');
  const sandbox=Object.assign(Object.create(null),{
    Date:undefined,Intl:undefined,Temporal:undefined,performance:undefined,
    crypto:undefined,process:undefined,require:undefined,fetch:undefined,
    setTimeout:undefined,clearTimeout:undefined,setInterval:undefined,clearInterval:undefined,
    setImmediate:undefined,clearImmediate:undefined,queueMicrotask:undefined,
    Buffer:undefined,console:undefined,SharedArrayBuffer:undefined,Atomics:undefined,
    WebAssembly:undefined,eval:undefined,Function:undefined,WebSocket:undefined,
    EventSource:undefined,XMLHttpRequest:undefined,URL:undefined,URLSearchParams:undefined,
    navigator:undefined,atob:undefined,btoa:undefined,structuredClone:undefined
  });
  const context=vm.createContext(sandbox,{codeGeneration:{strings:false,wasm:false}});
  Object.defineProperty(sandbox,'__agent49HostDraw',{
    value:()=>{
      try{policyStream.next();}catch{}
      return 1;
    },
    writable:false,configurable:true,enumerable:false
  });
  const setup=[
    '(() => {',
    '  const hostDraw=globalThis.__agent49HostDraw;',
    '  delete globalThis.__agent49HostDraw;',
    "  if(typeof hostDraw!=='function')throw new Error('POLICY_SANDBOX_BOOTSTRAP_FAILURE');",
    '  const safeRng=(()=>{',
    '    const draw=hostDraw;',
    '    return function safeRng(){',
    '      draw();',
    "      throw new Error('POLICY_RANDOM_DRAWS_UNREPLAYABLE');",
    '    };',
    '  })();',
    '  Object.freeze(safeRng);',
    "  Object.defineProperty(globalThis,'__agent49SafeRng',{value:safeRng,writable:false,configurable:false,enumerable:false});",
    "  Object.defineProperty(Math,'random',{value:function forbiddenMathRandom(){return globalThis.__agent49SafeRng();},writable:false,configurable:false,enumerable:false});",
    '  Object.freeze(Math);',
    '})();'
  ].join('\n');
  vm.runInContext(setup,context,{timeout:1000,filename:'agent49-policy-sandbox-setup.cjs'});
  const loadPolicy=[
    "(() => { 'use strict';",
    '  const module=Object.create(null);',
    "  Object.defineProperty(module,'exports',{value:Object.create(null),writable:true,configurable:false,enumerable:true});",
    '  let exports=module.exports;',
    policySource,
    "  Object.defineProperty(globalThis,'__agent49PolicyModule',{value:module.exports,writable:false,configurable:false,enumerable:false});",
    '})();'
  ].join('\n');
  vm.runInContext(loadPolicy,context,{timeout:5000,filename:'policy.cjs'});
  const policyVersion=vm.runInContext('globalThis.__agent49PolicyModule.POLICY_VERSION',context,{timeout:1000});
  const hasFactory=vm.runInContext("typeof globalThis.__agent49PolicyModule.createPolicy==='function'",context,{timeout:1000});
  const installWrappers=[
    '(() => {',
    '  const policyModule=globalThis.__agent49PolicyModule;',
    '  const safeRng=globalThis.__agent49SafeRng;',
    '  let policyInstance=null;',
    '  function deepFreeze(value){',
    "    if(value&&typeof value==='object'&&!Object.isFrozen(value)){",
    '      for(const child of Object.values(value))deepFreeze(child);',
    '      Object.freeze(value);',
    '    }',
    '    return value;',
    '  }',
    "  Object.defineProperty(globalThis,'__agent49Initialize',{value:async function initializePolicy(initJson){",
    "    if(policyInstance!==null)throw new Error('POLICY_ALREADY_INITIALIZED');",
    '    const init=deepFreeze(JSON.parse(initJson));',
    '    const policyContext=deepFreeze({role:init.role,seat:init.seat,policyVersion:init.policyVersion,config:init.config,rng:safeRng});',
    '    const instance=await policyModule.createPolicy(policyContext);',
    "    if(!instance||typeof instance.decide!=='function')throw new Error('POLICY_FACTORY_INVALID');",
    '    policyInstance=instance;',
    "    return 'READY';",
    "  },writable:false,configurable:false,enumerable:false});",
    "  Object.defineProperty(globalThis,'__agent49Decide',{value:async function decidePolicy(requestJson){",
    "    if(policyInstance===null)throw new Error('POLICY_NOT_INITIALIZED');",
    '    const request=deepFreeze(JSON.parse(requestJson));',
    '    const decision=await policyInstance.decide(request);',
    '    return JSON.stringify(decision);',
    '  },writable:false,configurable:false,enumerable:false});',
    '})();'
  ].join('\n');
  vm.runInContext(installWrappers,context,{timeout:1000,filename:'agent49-policy-sandbox-runtime.cjs'});
  function normalizeVmError(error){
    if(error&&typeof error.message==='string'&&error.message==='POLICY_RANDOM_DRAWS_UNREPLAYABLE')
      fail('POLICY_RANDOM_DRAWS_UNREPLAYABLE');
    throw error;
  }
  async function invoke(expression,filename){
    let pending;
    try{pending=vm.runInContext(expression,context,{timeout:5000,filename});}
    catch(error){normalizeVmError(error);}
    try{return await pending;}catch(error){normalizeVmError(error);}
  }
  return {
    policyVersion,
    hasFactory,
    async initialize(init){
      const initJson=JSON.stringify(init);
      await invoke('globalThis.__agent49Initialize('+JSON.stringify(initJson)+')','agent49-policy-init.cjs');
    },
    async decide(request){
      const requestJson=JSON.stringify(request);
      const decisionJson=await invoke('globalThis.__agent49Decide('+JSON.stringify(requestJson)+')','agent49-policy-decision.cjs');
      if(typeof decisionJson!=='string')fail('POLICY_RETURNED_NON_JSON');
      try{return JSON.parse(decisionJson);}catch{fail('POLICY_RETURNED_NON_JSON');}
    }
  };
}

async function run() {
  const policySource = fs.readFileSync(path.join(__dirname, 'policy.cjs'), 'utf8');
  let initialized = false;
  let init = null;
  let expectedSequence = 1;
  let messageCount = 0;
  let totalInputBytes = 0;
  const seenRequestIds = new Set();
  const policyStream=createWorkerLocalPolicyStream();
  const policyRuntime=createRestrictedPolicyRuntime(policySource,policyStream);
  let pending = Buffer.alloc(0);

  async function handleLine(line) {
    if (line.length === 0) fail('EMPTY_LINE');
    if (line.length > LIMITS.maxLineBytes) fail('LINE_TOO_LARGE');
    let message;
    try {
      message = JSON.parse(line.toString('utf8'));
    } catch {
      fail('MALFORMED_JSON');
    }
    assertBoundedJson(message);
    if (!initialized) {
      init = validateInit(message);
      if (policyRuntime.policyVersion !== init.policyVersion || !policyRuntime.hasFactory) fail('POLICY_MODULE_MISMATCH');
      await policyRuntime.initialize({
        role: init.role,
        seat: init.seat,
        policyVersion: init.policyVersion,
        config: init.config
      });
      if(policyStream.drawCount!==0)fail('POLICY_RANDOM_DRAWS_UNREPLAYABLE');
      initialized = true;
      await writeLine({
        schema: READY_SCHEMA,
        type: 'ready',
        role: init.role,
        seat: init.seat,
        policyVersion: init.policyVersion,
        bundleSha256: init.bundleSha256,
        policyStreamProtocol:policyStream.protocol,
        policyDrawCount:policyStream.drawCount
      });
      return;
    }

    const validated = validateRequest(message, init, expectedSequence, seenRequestIds);
    const rawDecision = await policyRuntime.decide(message);
    if(policyStream.drawCount!==0)fail('POLICY_RANDOM_DRAWS_UNREPLAYABLE');
    const decision = validateDecision(rawDecision, validated.prompt, validated.actionTokens);
    const response = {
      schema: RESPONSE_SCHEMA,
      type: 'response',
      requestId: message.requestId,
      sequence: message.sequence,
      role: init.role,
      seat: init.seat,
      policyVersion: init.policyVersion,
      decision
    };
    assertNoForbiddenFields(response);
    await writeLine(response);
    expectedSequence++;
  }

  try {
    for await (const chunk of process.stdin) {
      const bytes = Buffer.from(chunk);
      totalInputBytes += bytes.length;
      if (totalInputBytes > LIMITS.maxTotalInputBytes) fail('TOTAL_INPUT_TOO_LARGE');
      let offset = 0;
      while (offset < bytes.length) {
        const newline = bytes.indexOf(0x0a, offset);
        const end = newline === -1 ? bytes.length : newline;
        const part = bytes.subarray(offset, end);
        if (pending.length + part.length > LIMITS.maxLineBytes) fail('LINE_TOO_LARGE');
        pending = pending.length ? Buffer.concat([pending, part]) : Buffer.from(part);
        if (newline === -1) break;
        messageCount++;
        if (messageCount > LIMITS.maxMessages) fail('TOO_MANY_MESSAGES');
        const line = pending;
        pending = Buffer.alloc(0);
        await handleLine(line);
        offset = newline + 1;
      }
    }
    if (pending.length > 0) fail('UNTERMINATED_LINE');
    if (!initialized) fail('MISSING_INIT');
  } catch (error) {
    const code = error instanceof ProtocolError ? error.code : 'WORKER_FAILURE';
    process.stderr.write('AGENT49_POLICY_WORKER_ERROR ' + code + '\n');
    process.exitCode = 1;
    process.stdin.destroy();
  }
}

if (require.main === module) {
  run().catch(() => {
    process.stderr.write('AGENT49_POLICY_WORKER_ERROR WORKER_FAILURE\n');
    process.exitCode = 1;
    process.stdin.destroy();
  });
}

module.exports = { ...protocol, createWorkerLocalPolicyStream };
