'use strict';

const assert=require('node:assert/strict');
const VERSION='agent41-bilateral-forced-singlebench-guzma-contract-v1';

/**
 * A single, default-off release switch for the existing native-neutral
 * one-Bench nominal-KO Guzma root and its independent owner-only two-prompt
 * native continuation. Never enable just the root or just the continuation.
 *
 * @param {{enabled:boolean,actorOnlyComposition:boolean,
 *   actorGuzmaPromptContinuation:boolean}} flags
 * @returns {{root:object,prompt:object,enabled:boolean}}
 */
function pairedForcedGuzmaOptions(flags){
  assert.ok(flags&&typeof flags==='object');
  for(const key of ['enabled','actorOnlyComposition',
    'actorGuzmaPromptContinuation'])
    assert.equal(typeof flags[key],'boolean',key+' must be Boolean');
  assert.ok(!flags.enabled||(
    flags.actorOnlyComposition&&flags.actorGuzmaPromptContinuation),
  'Forced Guzma needs both-seat actor root and real native prompt continuation');
  return Object.freeze(flags.enabled?{
    root:Object.freeze({forcedGuzmaNominalKo:true}),
    prompt:Object.freeze({forcedGuzmaNominalKo:true}),
    enabled:true
  }:{
    root:Object.freeze({}),prompt:Object.freeze({}),enabled:false
  });
}
module.exports={VERSION,pairedForcedGuzmaOptions};
