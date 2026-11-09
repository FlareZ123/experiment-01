'use strict';

const assert=require('node:assert/strict');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {withOwnerSecretBoxCapacityActorPrompt}=
  require('../twinleaf/agent16-secret-box-capacity-actor-prompt.cjs');
const {NEW_MOON_DCI_POLICY}=
  require('../twinleaf/agent21-secret-box-dci-payment.cjs');

const VERSION='agent16-box-root-prospective-paired-owner-policy-v1';
const seeds=Object.freeze([
  4081596557,3819579232,568190576,2478505217,
  3927876159,880229415,2559908074,214598711,
  3541838463,728344248,3981156688,2713610343
]);
const FRAME=Object.freeze(seeds.map((seed,i)=>Object.freeze({
  rank:i<6?6:11,repeat:201+i,candidateSlot:i%2?'B':'A',seed,
  candidateId:'new-moon-lockbreaker-v1',
  id:[i<6?6:11,201+i,i%2?'B':'A',
    'new-moon-lockbreaker-v1'].join(':')
})));
const POLICY=Object.freeze({...NEW_MOON_DCI_POLICY,maxTotalCost:22});
const OPTIONS=Object.freeze({
  registeredTrials:FRAME,registeredFrameName:VERSION,
  allowSingleCandidatePerGroup:true,
  actorOnlyComposition:true,nativeRootActionLimit:48
});

/** These are registered new source-deal streams, not a retrospective pick.
 * This opt-in test evaluates whether an actor-visible Box root intervention
 * creates actual paper-paid actions, with identical fixed 60 and sources. */
function runPairedRootOpportunity(){
  function arm(enableRoot){
    const wrapped=withOwnerSecretBoxCapacityActorPrompt(
      ()=>runDevelopment(OPTIONS),
      {autoPlayRoot:enableRoot,policy:POLICY});
    const rows=wrapped.result?.rows;
    assert.ok(Array.isArray(rows)&&rows.length===FRAME.length);
    const observed=rows.map(r=>({
      id:r.trial?.id??r.id,
      status:r.status??(r.finished?'native-terminal-unqualified':
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
    }));
    assert.deepEqual(observed.map(r=>r.id).sort(),
      FRAME.map(r=>r.id).sort());
    return {actorAudit:wrapped.audit,rows:observed};
  }
  const baseline=arm(false);
  const treatment=arm(true);
  const comparable=FRAME.map((trial,i)=>({
    id:trial.id,
    sameSourceDeal:baseline.rows[i].sourceDealFingerprint===
      treatment.rows[i].sourceDealFingerprint,
    sameFullPhysicalDeal:baseline.rows[i].fullPhysicalDealFingerprint===
      treatment.rows[i].fullPhysicalDealFingerprint,
    baselineStatus:baseline.rows[i].status,
    treatmentStatus:treatment.rows[i].status,
    baselineRootActions:baseline.rows[i].nativeRootActionCount,
    treatmentRootActions:treatment.rows[i].nativeRootActionCount
  }));
  return {version:VERSION,registered:FRAME,policy:POLICY,
    baseline:baseline.actorAudit,treatment:treatment.actorAudit,
    comparable,attemptedPerArm:FRAME.length,
    exactSourceDealCount:comparable.filter(x=>x.sameSourceDeal).length,
    exactFullPhysicalDealCount:
      comparable.filter(x=>x.sameFullPhysicalDeal).length,
    qualifiedCompetitiveGames:0,
    qualification:'development-only opportunity and action comparison; all capped/aborted outcomes remain censored; source deal parity is measured, not assumed'};
}
if(require.main===module){
  console.log('AGENT16_PAIRED_BOX_ROOT_OPPORTUNITY',
    JSON.stringify(runPairedRootOpportunity()));
}
module.exports={VERSION,FRAME,POLICY,OPTIONS,runPairedRootOpportunity};
