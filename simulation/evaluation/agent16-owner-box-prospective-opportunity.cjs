'use strict';

const assert=require('node:assert/strict');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {withOwnerSecretBoxCapacityActorPrompt}=
  require('../twinleaf/agent16-secret-box-capacity-actor-prompt.cjs');

const VERSION='agent16-fresh-original-source-secret-box-prompt-opportunity-v1';
const FRAME=Object.freeze([
  Object.freeze({rank:6,repeat:161,candidateSlot:'A',seed:2632824815}),
  Object.freeze({rank:11,repeat:162,candidateSlot:'B',seed:800329691})
]);
const CANDIDATES=Object.freeze([
  'champion-reference','new-moon-lockbreaker-v1'
]);
const TRIALS=Object.freeze(FRAME.flatMap(f=>CANDIDATES.map(id=>
  Object.freeze({...f,candidateId:id,
    id:[f.rank,f.repeat,f.candidateSlot,id].join(':')}))));

/**
 * Two genuinely new, prefixed PRNG streams across two published source
 * opponents, each paired across exactly two unchanged 60-card candidates.
 * Intended solely to find actual Secret Box prompt opportunities under
 * the existing actor root and a newly opt-in owner prompt responder.
 *
 * No historical run or result was consulted to select these seeds.
 * Zero completed / source-validated games is an explicit possible result.
 */
function runProspectiveOpportunity(){
  const wrapped=withOwnerSecretBoxCapacityActorPrompt(()=>
    runDevelopment({
      registeredTrials:TRIALS,
      registeredFrameName:VERSION,
      actorOnlyComposition:true,
      nativeRootActionLimit:48
    }));
  const rows=wrapped.result?.rows;
  assert.ok(Array.isArray(rows)&&rows.length===TRIALS.length,
    'All registered source trial identities must return a row');
  const ids=rows.map(r=>r.trial?.id??r.id);
  assert.deepEqual(ids.slice().sort(),
    TRIALS.map(t=>t.id).sort(),'Source trial identities must reconcile');
  return {
    version:VERSION,registered:TRIALS,actorAudit:wrapped.audit,
    rows:rows.map(r=>({
      id:r.trial?.id??r.id,
      status:r.status??(r.finished===true?'native-terminal-unqualified':
        'returned-unqualified'),
      sourceSeat:r.sourceSeat??null,
      candidateSeat:r.candidateSeat??null,
      sourceDealFingerprint:r.sourceDealFingerprint??null,
      fullPhysicalDealFingerprint:r.fullPhysicalDealFingerprint??null,
      verifiedFirstTurn:r.verifiedFirstTurn??null,
      nativeRootActionCount:r.nativeRootActionCount??
        r.rootActionCount??null,
      finished:r.finished??false,
      nativeAbortProvenance:r.nativeAbortProvenance??null
    })),
    attempted:rows.length,qualifiedCompetitiveGames:0,
    limitation:'Fresh paired original-source developmental native attempts; actor payment and search interventions count only if actually reached. No competitive win rate inference.'
  };
}
if(require.main===module){
  const result=runProspectiveOpportunity();
  console.log('AGENT16_PROSPECTIVE_CAPACITY_OPPORTUNITY',JSON.stringify(result));
}
module.exports={VERSION,FRAME,CANDIDATES,TRIALS,runProspectiveOpportunity};
