'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {loadCampaignInputs}=require('./aichi-campaign-runner.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {deckDigest,emitNativeRegisteredSetupPair}=
  require('./agent42-registered-setup-native-bridge.cjs');
const {CELLS,accruePairedFourCells}=
  require('../../scripts/aichi-paired-four-cell-accrual.cjs');

/**
 * Predeclared original-Store initial-state smoke: unchanged champion vs New
 * Moon source IDs, published ranks 6/11, each candidate physical seat. Seeds
 * are fixed in this committed source before native execution. It stops at
 * settled turn-1 setup. The plan's execution-time content hashes remain
 * reproducible from the source Git revision but lack separate pre-registration.
 */
const SCHEDULE=Object.freeze([
  {rank:6,candidateSeat:0,seed:21061021},
  {rank:6,candidateSeat:1,seed:21061022},
  {rank:11,candidateSeat:0,seed:21111021},
  {rank:11,candidateSeat:1,seed:21111022}
]);
const IDS=Object.freeze(['champion-reference','new-moon-lockbreaker-v1']);
const SETTINGS=Object.freeze({
  allowEquivalentBasicEnergies:true,
  allowBasicEnergyMirrorPrintings:true,
  allowJapanesePromoHooks:true
});

/** Native compiled pinned-Store diagnostic; never samples gameplay. */
function run(){
  const inputs=loadCampaignInputs();
  const candidates=Object.fromEntries(IDS.map(id=>{
    const row=inputs.candidates.find(c=>c.id===id);
    assert.ok(row);
    return [id,planAichi({label:id,cards:row.cards},SETTINGS)];
  }));
  const candidateDecks=Object.fromEntries(IDS.map(id=>{
    const ids=candidates[id].candidate.cards;
    assert.ok(Array.isArray(ids)&&ids.length===60);
    return [id,ids];
  }));
  const sourceDecks={};
  for(const rank of [6,11]){
    const row=candidates[IDS[0]].opponents.find(o=>o.rank===rank);
    assert.equal(row?.status,'ready');
    assert.equal(row.cards.length,60);
    sourceDecks[rank]=row.cards;
  }
  const attempts=SCHEDULE.map((s,i)=>({
    ...s,pairId:`registered-${i}-rank${s.rank}-seat${s.candidateSeat}-${s.seed}`,
    arms:IDS.map(candidateId=>({
      candidateId,armId:`registered-${i}-${candidateId}`
    }))
  }));
  const plan={
    schema:'aichi-fourcell-paired-start-plan-v2',
    status:'precommitted',candidateIds:[...IDS],ranks:[6,11],
    candidateDeckHashes:Object.fromEntries(IDS.map(id=>[
      id,deckDigest(candidateDecks[id])
    ])),
    sourceDeckHashes:Object.fromEntries([6,11].map(rank=>[
      rank,deckDigest(sourceDecks[rank])
    ])),
    quotas:Object.fromEntries([6,11].map(rank=>[rank,
      Object.fromEntries(CELLS.map(cell=>[cell,1]))])),
    attempts
  };
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(base,'game/store/store'));
  const {runMatch}=require('../twinleaf/headless.cjs');
  const observations=[];
  let intake=accruePairedFourCells(plan,[]);
  for(const pair of attempts){
    const obs=emitNativeRegisteredSetupPair(plan,pair.pairId,
      candidateDecks,sourceDecks[pair.rank],{Store,runMatch});
    observations.push(obs);
    intake=accruePairedFourCells(plan,observations);
    // A failed setup must not be skipped, and all later seeds remain unused.
    if(intake.blocked||intake.complete)break;
  }
  return {
    schema:'agent42-original-store-fourcell-setup-smoke-v1',
    status:'setup-only-development-proof',
    enginePin:candidates[IDS[0]].engineRevision,
    printedSourceManifestSha256:candidates[IDS[0]].manifestDigest,
    registrationExternallyTimeSealed:false,
    plan,observations,intake,
    attemptedPairs:observations.length,
    untouchedRegisteredPairs:attempts.length-observations.length,
    completedGames:0,qualifiedCompetitiveGames:0,
    sourceOpponentPolicyQualified:false,
    candidatePolicyQualified:false,
    paperClockQualified:false
  };
}
if(require.main===module){
  const report=run();
  process.stdout.write(JSON.stringify(report,null,2)+'\\n');
  process.stderr.write(JSON.stringify({
    schema:report.schema,
    attemptedPairs:report.attemptedPairs,
    registeredPairs:report.plan.attempts.length,
    verifiedArms:report.observations.flatMap(row=>row.arms)
      .filter(row=>row.settledSetupVerified).length,
    sourceAlignedPairs:report.intake.retainedAttempts.filter(row=>
      row.reason==='accepted-preoutcome-quota' ||
      row.reason==='surplus-preoutcome-stratum').length,
    failedOrUnverified:report.intake.retainedAttempts.filter(row=>
      row.reason==='unverified-setup').map(row=>row.pairId),
    retainedReasons:report.intake.retainedAttempts.map(row=>row.reason),
    firstPlayerCells:report.intake.counts,
    evidenceQualified:false
  })+'\\n');
  if(report.intake.blocked ||
    report.attemptedPairs!==report.plan.attempts.length ||
    report.observations.some(row=>!row.allArmsVerified))process.exitCode=1;
}
module.exports={SCHEDULE,IDS,SETTINGS,run};
