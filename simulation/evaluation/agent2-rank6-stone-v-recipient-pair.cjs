'use strict';
const assert=require('node:assert/strict');
const {scheduledArms,assertManifest,executeArm}=
  require('./agent41-crossrank-actual-decisions.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {withStoneVRecipient}=
  require('../twinleaf/forest-stone-v-recipient-policy.cjs');

/** @returns {object} One original source-dealt retrospective two-policy audit. */
function run(){
  assertManifest();
  const trial=scheduledArms().find(r=>
    r.id==='6:0:A:new-moon-lockbreaker-v1');
  assert.ok(trial);
  assert.equal(trial.seed,407516727);
  const {loadNewMoonCandidate}=require('../../scripts/aichi-new-moon-candidate.cjs');
  const raw=loadNewMoonCandidate();
  const plan=planAichi({label:raw.id,cards:raw.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true});
  const prepared=new Map([['new-moon-lockbreaker-v1',{plan}]]);
  const baseline=executeArm(trial,prepared);
  assert.equal(baseline.rootActionLedgerSha256,
    '9a9007f302a6e84084eb75c77f0a86db0e037c58384d7ff2076de828ba0ba913');
  const variant=withStoneVRecipient(0,()=>executeArm(trial,prepared));
  const treated=variant.result;
  for(const record of [baseline,treated]){
    assert.equal(record.engineFirstTurnSlot,0);
    assert.equal(record.verifiedFirstTurn,true);
  }
  assert.deepEqual(baseline.engineDeckHashes,treated.engineDeckHashes);
  const compact=r=>({
    sourcePolicyTurn2Complete:r.sourcePolicyAudit.turn2.completed,
    sourcePolicyTurn3Complete:r.sourcePolicyAudit.turn3.completed,
    firstSourceHandHash:r.sourceFirstRecordedOwnHandSha256,
    candidateReply:r.responseDecisions,
    candidateAttackDeclarations:r.candidateAttackDeclarations,
    sourceAttackDeclarations:r.sourceAttackDeclarations,
    actions:r.actions,turns:r.turns,status:r.status,
    prizesRemaining:r.prizesRemaining,
    rootLedgerSha256:r.rootActionLedgerSha256
  });
  return {
    schema:'agent2-rank6-stone-v-recipient-retrospective-v1',
    registration:'results/aichi-2026/registrations/agent2-rank6-stone-v-recipient-v1-20261019.md',
    trialId:trial.id,seed:trial.seed,
    baselineOriginalLedgerVerified:true,
    equalStartingOrderAndInventories:true,
    sameSourceFirstHand:baseline.sourceFirstRecordedOwnHandSha256===
      treated.sourceFirstRecordedOwnHandSha256,
    baseline:compact(baseline),treated:compact(treated),
    stonePolicyEvents:variant.audit.events,
    competitiveQualifiedGames:0
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
