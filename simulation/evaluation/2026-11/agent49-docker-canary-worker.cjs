'use strict';

// Test-only worker used to exercise the Docker OS boundary with a policy that
// deliberately probes Node APIs. Production role policies use
// agent49-policy-worker.cjs, which evaluates policy source inside a restricted
// VM. This canary must never be used for competitive fixture execution.

const {once}=require('node:events');
const {randomBytes}=require('node:crypto');
const protocol=require('./agent49-policy-protocol.cjs');
const {
  READY_SCHEMA,RESPONSE_SCHEMA,LIMITS,ProtocolError,fail,
  assertBoundedJson,assertNoForbiddenFields,deepFreeze,
  validateInit,validateRequest,validateDecision
}=protocol;
const policyModule=require('./policy.cjs');

function createWorkerLocalPolicyStream(){
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

async function writeLine(value){
  const bytes=Buffer.from(JSON.stringify(value)+'\\n','utf8');
  if(bytes.length>LIMITS.maxResponseBytes)fail('RESPONSE_TOO_LARGE');
  if(!process.stdout.write(bytes))await once(process.stdout,'drain');
}

async function run(){
  const policyStream=createWorkerLocalPolicyStream();
  let initialized=false;
  let init=null;
  let policy=null;
  let expectedSequence=1;
  let messageCount=0;
  let totalInputBytes=0;
  const seenRequestIds=new Set();
  let pending=Buffer.alloc(0);

  async function handleLine(line){
    if(line.length===0)fail('EMPTY_LINE');
    if(line.length>LIMITS.maxLineBytes)fail('LINE_TOO_LARGE');
    let message;
    try{message=JSON.parse(line.toString('utf8'));}catch{fail('MALFORMED_JSON');}
    assertBoundedJson(message);
    if(!initialized){
      init=validateInit(message);
      if(policyModule.POLICY_VERSION!==init.policyVersion||
        typeof policyModule.createPolicy!=='function')fail('POLICY_MODULE_MISMATCH');
      policy=await policyModule.createPolicy(deepFreeze({
        role:init.role,seat:init.seat,policyVersion:init.policyVersion,
        config:init.config,rng:policyStream.next
      }));
      if(!policy||typeof policy.decide!=='function')fail('POLICY_FACTORY_INVALID');
      if(policyStream.drawCount!==0)fail('POLICY_RANDOM_DRAWS_UNREPLAYABLE');
      initialized=true;
      await writeLine({
        schema:READY_SCHEMA,type:'ready',role:init.role,seat:init.seat,
        policyVersion:init.policyVersion,bundleSha256:init.bundleSha256,
        policyStreamProtocol:policyStream.protocol,policyDrawCount:policyStream.drawCount
      });
      return;
    }
    const validated=validateRequest(message,init,expectedSequence,seenRequestIds);
    const rawDecision=await policy.decide(deepFreeze(message));
    if(policyStream.drawCount!==0)fail('POLICY_RANDOM_DRAWS_UNREPLAYABLE');
    const decision=validateDecision(rawDecision,validated.prompt,validated.actionTokens);
    const response={
      schema:RESPONSE_SCHEMA,type:'response',requestId:message.requestId,
      sequence:message.sequence,role:init.role,seat:init.seat,
      policyVersion:init.policyVersion,policyDrawCount:policyStream.drawCount,decision
    };
    assertNoForbiddenFields(response);
    await writeLine(response);
    expectedSequence++;
  }

  try{
    for await(const chunk of process.stdin){
      const bytes=Buffer.from(chunk);
      totalInputBytes+=bytes.length;
      if(totalInputBytes>LIMITS.maxTotalInputBytes)fail('TOTAL_INPUT_TOO_LARGE');
      let offset=0;
      while(offset<bytes.length){
        const newline=bytes.indexOf(0x0a,offset);
        const end=newline===-1?bytes.length:newline;
        const part=bytes.subarray(offset,end);
        if(pending.length+part.length>LIMITS.maxLineBytes)fail('LINE_TOO_LARGE');
        pending=pending.length?Buffer.concat([pending,part]):Buffer.from(part);
        if(newline===-1)break;
        messageCount++;
        if(messageCount>LIMITS.maxMessages)fail('TOO_MANY_MESSAGES');
        const line=pending;
        pending=Buffer.alloc(0);
        await handleLine(line);
        offset=newline+1;
      }
    }
    if(pending.length>0)fail('UNTERMINATED_LINE');
    if(!initialized)fail('MISSING_INIT');
  }catch(error){
    const code=error instanceof ProtocolError?error.code:'WORKER_FAILURE';
    process.stderr.write('AGENT49_DOCKER_CANARY_WORKER_ERROR '+code+' policyDrawCount='+policyStream.drawCount+'\n');
    process.exitCode=1;
    process.stdin.destroy();
  }
}

if(require.main===module){
  run().catch(()=>{
    process.stderr.write('AGENT49_DOCKER_CANARY_WORKER_ERROR WORKER_FAILURE\\n');
    process.exitCode=1;
    process.stdin.destroy();
  });
}

module.exports={createWorkerLocalPolicyStream,run};
