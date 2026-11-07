'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent4-raw-state-native-fallback-quarantine-v1';
const CODE = 'OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED';
const QUARANTINE_ACTIVE = Symbol.for(
  'experiment-01.agent4.rawStateFallbackQuarantine.active'
);

/**
 * Stop any call reaching the original SimpleTacticsAi root/prompt decoder.
 * Canonical actor adapters may implement decisions before that point. This
 * guard reports the first unresolved delegation without permitting the
 * generic scorer to inspect the supplied raw State or speculative clone.
 *
 * This only certifies absence of calls to this decoder, not that all other
 * research-owned policy components are owner-information-safe.
 *
 * @template T
 * @param {()=>T} run Synchronous genuine native experiment.
 * @param {{SimpleTacticsAi?:Function,maxRecords?:number}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withNativeRawStateFallbackQuarantine(run, deps={}) {
  assert.equal(typeof run,'function');
  const nativeRoot=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const Ai=deps.SimpleTacticsAi??
    require(path.join(nativeRoot,'simple-bot/simple-tactics-ai'))
      .SimpleTacticsAi;
  const maxRecords=deps.maxRecords??64;
  assert.ok(Number.isSafeInteger(maxRecords)&&maxRecords>=0);
  const descriptor=Object.getOwnPropertyDescriptor(
    Ai.prototype,'decodeNextAction');
  assert.equal(typeof descriptor?.value,'function');
  assert.equal(descriptor.configurable,true);
  const markerDescriptor=Object.getOwnPropertyDescriptor(Ai.prototype,QUARANTINE_ACTIVE);
  const activeMarker=Object.freeze({version:VERSION,code:CODE});
  Object.defineProperty(Ai.prototype,QUARANTINE_ACTIVE,{
    configurable:true,enumerable:false,writable:false,value:activeMarker
  });
  const audit={
    version:VERSION,activeMarkerInstalled:true,
    policyBoundary:'original-native-bot-decoder',
    rawStateFallbackCalls:0,records:[],recordsOmitted:0,
    originalNativeDecoderExecuted:false,
    failureCode:CODE,
    ownerInformationSafeWholePolicyCertified:false,
    gameCompetitiveQualified:false
  };
  function violation(){
    const error=new Error(
      'Native raw-State decision fallback reached before owner-safe policy closure');
    error.code=CODE;
    return error;
  }
  function guardedDecode(state) {
    audit.rawStateFallbackCalls++;
    const players=Array.isArray(state?.players)?state.players:null;
    const seat=players?players.findIndex(player=>
      player.id===this?.client?.id):-1;
    const pending=state?.prompts?.find(prompt=>
      prompt.result===undefined)??null;
    const record={
      seat:seat===0||seat===1?seat:null,
      turn:Number.isSafeInteger(state?.turn)?state.turn:null,
      phase:Number.isSafeInteger(state?.phase)?state.phase:null,
      decisionKind:pending?'pending-prompt':'root-or-setup',
      promptType:pending?.constructor?.name??null
    };
    if(audit.records.length<maxRecords)audit.records.push(record);
    else audit.recordsOmitted++;
    throw violation();
  }

  Object.defineProperty(Ai.prototype,'decodeNextAction',{
    ...descriptor,value:guardedDecode
  });
  try {
    const result=run();
    // Native callers may swallow the error. Such a run still fails the gate.
    if(audit.rawStateFallbackCalls>0)throw violation();
    return {result,audit};
  } catch(error) {
    if(error&&typeof error==='object')
      error.nativeRawStateFallbackQuarantine={...audit,
        records:[...audit.records],aborted:true};
    throw error;
  } finally {
    try {
      assert.strictEqual(Ai.prototype.decodeNextAction,guardedDecode);
    } finally {
      try {
        Object.defineProperty(Ai.prototype,'decodeNextAction',descriptor);
      } finally {
        if(markerDescriptor) {
          Object.defineProperty(Ai.prototype,QUARANTINE_ACTIVE,markerDescriptor);
        } else {
          delete Ai.prototype[QUARANTINE_ACTIVE];
        }
      }
    }
  }
}

module.exports={VERSION,CODE,QUARANTINE_ACTIVE,withNativeRawStateFallbackQuarantine};
