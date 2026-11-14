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
  validateInit, validateRequest, validateDecision
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

function hostMacrotaskBarrier(){return new Promise(resolve=>setImmediate(resolve));}

async function createRestrictedPolicyRuntime(policySource,policyStream) {
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
    navigator:undefined,atob:undefined,btoa:undefined,structuredClone:undefined,
    WeakRef:undefined,FinalizationRegistry:undefined
  });
  const context=vm.createContext(sandbox,{codeGeneration:{strings:false,wasm:false}});
  Object.defineProperty(sandbox,'__agent49HostDraw',{
    value:()=>{
      try{return policyStream.next();}catch{return NaN;}
    },
    writable:false,configurable:true,enumerable:false
  });
  const setup=[
    '(() => {',
    '  const realmGlobal=globalThis;',
    '  const intrinsicObject=Object;',
    '  const intrinsicJSON=JSON;',
    '  const objectDefineProperty=intrinsicObject.defineProperty.bind(intrinsicObject);',
    '  const objectFreeze=intrinsicObject.freeze.bind(intrinsicObject);',
    '  const objectValues=intrinsicObject.values.bind(intrinsicObject);',
    '  const objectIsFrozen=intrinsicObject.isFrozen.bind(intrinsicObject);',
    '  const objectHasOwn=intrinsicObject.hasOwn.bind(intrinsicObject);',
    '  const objectCreate=intrinsicObject.create.bind(intrinsicObject);',
    '  const jsonParse=intrinsicJSON.parse.bind(intrinsicJSON);',
    '  const jsonStringify=intrinsicJSON.stringify.bind(intrinsicJSON);',
    '  const hostDraw=realmGlobal.__agent49HostDraw;',
    '  delete realmGlobal.__agent49HostDraw;',
    "  objectDefineProperty(realmGlobal,'__agent49HostDraw',{value:undefined,writable:false,configurable:false,enumerable:false});",
    "  if(typeof hostDraw!=='function')throw new Error('POLICY_SANDBOX_BOOTSTRAP_FAILURE');",
    '  const safeRng=(()=>{',
    '    const draw=hostDraw;',
    '    return function safeRng(){',
    '      const value=draw();',
    "      if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>=1)throw new Error('POLICY_RNG_FAILURE');",
    '      return value;',
    '    };',
    '  })();',
    '  objectFreeze(safeRng);',
    "  objectDefineProperty(realmGlobal,'__agent49SafeRng',{value:safeRng,writable:false,configurable:false,enumerable:false});",
    "  objectDefineProperty(Math,'random',{value:function workerMathRandom(){return safeRng();},writable:false,configurable:false,enumerable:false});",
    '  const intrinsics={create:objectCreate,defineProperty:objectDefineProperty,hasOwn:objectHasOwn,values:objectValues,isFrozen:objectIsFrozen,freeze:objectFreeze,parse:jsonParse,stringify:jsonStringify};',
    '  for(const fn of objectValues(intrinsics))objectFreeze(fn);',
    '  objectFreeze(intrinsics);',
    "  objectDefineProperty(realmGlobal,'__agent49Intrinsics',{value:intrinsics,writable:false,configurable:false,enumerable:false});",
    '  objectDefineProperty(realmGlobal,"globalThis",{value:realmGlobal,writable:false,configurable:false,enumerable:false});',
    '  const globals=[["Math",Math],["JSON",JSON],["Object",Object],["Array",Array],["Promise",Promise],["Reflect",Reflect]];',
    '  for(const [name,value] of globals){',
    '    if(value&&value.prototype&&typeof value.prototype==="object")objectFreeze(value.prototype);',
    '    if(name!==\"globalThis\")objectFreeze(value);',
    '    objectDefineProperty(realmGlobal,name,{value,writable:false,configurable:false,enumerable:true});',
    '  }',
    '  const disabledGlobals=["Date","Intl","Temporal","performance","crypto","process","require","fetch","setTimeout","clearTimeout","setInterval","clearInterval","setImmediate","clearImmediate","queueMicrotask","Buffer","console","SharedArrayBuffer","Atomics","WebAssembly","WebSocket","EventSource","XMLHttpRequest","URL","URLSearchParams","navigator","atob","btoa","structuredClone","WeakRef","FinalizationRegistry","eval","Function"];',
    '  for(const name of disabledGlobals)objectDefineProperty(realmGlobal,name,{value:undefined,writable:false,configurable:false,enumerable:true});',
    '})();'
  ].join('\n');
  vm.runInContext(setup,context,{timeout:1000,filename:'agent49-policy-sandbox-setup.cjs'});
  const loadPolicy=[
    "(() => { 'use strict';",
    '  const I=globalThis.__agent49Intrinsics;',
    '  const module=I.create(null);',
    "  I.defineProperty(module,'exports',{value:I.create(null),writable:true,configurable:false,enumerable:true});",
    '  let exports=module.exports;',
    '  try {',
    '    (() => {',
    policySource,
    '    })();',
    '  } catch (_) { return false; }',
    "  if(I.hasOwn(globalThis,'__agent49PolicyModule')||I.hasOwn(globalThis,'__agent49Initialize')||I.hasOwn(globalThis,'__agent49Decide'))return false;",
    "  I.defineProperty(globalThis,'__agent49PolicyModule',{value:module.exports,writable:false,configurable:false,enumerable:false});",
    '  return true;',
    '})();'
  ].join('\n');
  const loadOk=vm.runInContext(loadPolicy,context,{timeout:5000,filename:'policy.cjs'});
  if(loadOk!==true)fail('POLICY_MODULE_LOAD_FAILED');
  const policyVersion=vm.runInContext('globalThis.__agent49PolicyModule.POLICY_VERSION',context,{timeout:1000});
  const hasFactory=vm.runInContext("typeof globalThis.__agent49PolicyModule.createPolicy==='function'",context,{timeout:1000});
  await hostMacrotaskBarrier();
  if(policyStream.drawCount!==0)fail('POLICY_RANDOM_DRAWS_UNREPLAYABLE');
  const installWrappers=[
    '(() => {',
    '  const I=globalThis.__agent49Intrinsics;',
    '  const policyModule=globalThis.__agent49PolicyModule;',
    '  const safeRng=globalThis.__agent49SafeRng;',
    '  let policyInstance=null;',
    '  function deepFreeze(value){',
    "    if(value&&typeof value==='object'&&!I.isFrozen(value)){",
    '      for(const child of I.values(value))deepFreeze(child);',
    '      I.freeze(value);',
    '    }',
    '    return value;',
    '  }',
    "  I.defineProperty(globalThis,'__agent49Initialize',{value:async function initializePolicy(initJson){",
    "    if(policyInstance!==null)return I.stringify({ok:false,code:'POLICY_ALREADY_INITIALIZED'});",
    '    try {',
    '      const init=deepFreeze(I.parse(initJson));',
    '      const policyContext=deepFreeze({role:init.role,seat:init.seat,policyVersion:init.policyVersion,config:init.config,rng:safeRng});',
    '      const instance=await policyModule.createPolicy(policyContext);',
    "      if(!instance||typeof instance.decide!=='function')return I.stringify({ok:false,code:'POLICY_FACTORY_INVALID'});",
    '      policyInstance=instance;',
    '      return I.stringify({ok:true});',
    '    } catch (_) {',
    "      return I.stringify({ok:false,code:'POLICY_FACTORY_FAILURE'});",
    '    }',
    '  },writable:false,configurable:false,enumerable:false});',
    "  I.defineProperty(globalThis,'__agent49Decide',{value:async function decidePolicy(requestJson){",
    "    if(policyInstance===null)return I.stringify({ok:false,code:'POLICY_NOT_INITIALIZED'});",
    '    try {',
    '      const request=deepFreeze(I.parse(requestJson));',
    '      const decision=await policyInstance.decide(request);',
    '      const decisionJson=I.stringify(decision);',
    "      if(typeof decisionJson!=='string')return I.stringify({ok:false,code:'POLICY_RETURNED_NON_JSON'});",
    '      return I.stringify({ok:true,decisionJson});',
    '    } catch (_) {',
    "      return I.stringify({ok:false,code:'POLICY_EXECUTION_FAILURE'});",
    '    }',
    '  },writable:false,configurable:false,enumerable:false});',
    '})();'
  ].join('\n');
  vm.runInContext(installWrappers,context,{timeout:1000,filename:'agent49-policy-sandbox-runtime.cjs'});
  async function invoke(expression,filename){
    const pending=vm.runInContext(expression,context,{timeout:5000,filename});
    return await pending;
  }
  function parseEnvelope(value){
    if(typeof value!=='string')fail('POLICY_SANDBOX_PROTOCOL_FAILURE');
    let envelope;
    try{envelope=JSON.parse(value);}catch{fail('POLICY_SANDBOX_PROTOCOL_FAILURE');}
    if(!envelope||typeof envelope!=='object'||Array.isArray(envelope)||
      typeof envelope.ok!=='boolean')fail('POLICY_SANDBOX_PROTOCOL_FAILURE');
    return envelope;
  }
  return {
    policyVersion,
    hasFactory,
    async settle(){
      await hostMacrotaskBarrier();
      if(policyStream.drawCount!==0)fail('POLICY_RANDOM_DRAWS_UNREPLAYABLE');
    },
    async initialize(init){
      const initJson=JSON.stringify(init);
      const rawEnvelope=await invoke(
        'globalThis.__agent49Initialize('+JSON.stringify(initJson)+')',
        'agent49-policy-init.cjs'
      );
      await hostMacrotaskBarrier();
      if(policyStream.drawCount!==0)fail('POLICY_RANDOM_DRAWS_UNREPLAYABLE');
      const envelope=parseEnvelope(rawEnvelope);
      if(!envelope.ok)fail(envelope.code??'POLICY_FACTORY_FAILURE');
    },
    async decide(request){
      const requestJson=JSON.stringify(request);
      const rawEnvelope=await invoke(
        'globalThis.__agent49Decide('+JSON.stringify(requestJson)+')',
        'agent49-policy-decision.cjs'
      );
      await hostMacrotaskBarrier();
      if(policyStream.drawCount!==0)fail('POLICY_RANDOM_DRAWS_UNREPLAYABLE');
      const envelope=parseEnvelope(rawEnvelope);
      if(!envelope.ok)fail(envelope.code??'POLICY_EXECUTION_FAILURE');
      if(typeof envelope.decisionJson!=='string')fail('POLICY_RETURNED_NON_JSON');
      try{return JSON.parse(envelope.decisionJson);}catch{fail('POLICY_RETURNED_NON_JSON');}
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
  const policyRuntime=await createRestrictedPolicyRuntime(policySource,policyStream);
  await policyRuntime.settle();
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
    if(policyStream.drawCount!==0)fail('POLICY_RANDOM_DRAWS_UNREPLAYABLE');
    if (!initialized) {
      init = validateInit(message);
      if (policyRuntime.policyVersion !== init.policyVersion || !policyRuntime.hasFactory) fail('POLICY_MODULE_MISMATCH');
      await policyRuntime.initialize({
        role: init.role,
        seat: init.seat,
        policyVersion: init.policyVersion,
        config: init.config
      });
      await policyRuntime.settle();
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
      policyDrawCount:policyStream.drawCount,
      decision
    };
    assertNoForbiddenFields(response);
    await writeLine(response);
    if(policyStream.drawCount!==0)fail('POLICY_RANDOM_DRAWS_UNREPLAYABLE');
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
    await policyRuntime.settle();
    if(policyStream.drawCount!==0)fail('POLICY_RANDOM_DRAWS_UNREPLAYABLE');
    if (!initialized) fail('MISSING_INIT');
  } catch (error) {
    const code = error instanceof ProtocolError ? error.code : 'WORKER_FAILURE';
    process.stderr.write('AGENT49_POLICY_WORKER_ERROR ' + code + ' policyDrawCount=' + policyStream.drawCount + '\n');
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
