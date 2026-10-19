'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {scheduledArms,assertManifest,executeArm}=require('./agent41-crossrank-actual-decisions.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {withPlayerPlayLockVeto}=require('../twinleaf/player-play-lock-veto.cjs');
const root=path.resolve(__dirname,'../..');

/** @returns {object} Replayed source deal; no competitive inference. */
function run() {
  assertManifest();
  const trial=scheduledArms().find(row=>row.id==='6:2:A:champion-reference');
  assert.ok(trial);
  assert.equal(trial.seed,2394734225);
  const baseline=require('./agent6-crossrank-rejected-root.cjs').run();
  assert.equal(baseline.rejection.actionOrdinal,33);
  const roster=JSON.parse(fs.readFileSync(path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'));
  const champion=roster.decks.find(row=>row.rank===1);
  assert.ok(champion);
  const prepared=new Map([['champion-reference',{plan:planAichi({
    label:'champion-reference',cards:champion.cards},{
    allowEquivalentBasicEnergies:true,allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true})}]]);
  const guarded=withPlayerPlayLockVeto(1,()=>{
    try { return {record:executeArm(trial,prepared,{captureRejectedActionEvidence:true}),error:null}; }
    catch(error) { return {record:null,error:String(error?.stack||error),
      rejection:error?.rejectedActionEvidence??null}; }
  });
  const vetoObserved=guarded.audit.rejections.some(row=>row.turn===3 &&
    row.reason==='stadium-lock' && row.card==='Thunder Mountain Prism Star LOT');
  const originalRejectionPrevented=!(guarded.result.error?.includes('BLOCKED_BY_EFFECT') &&
    guarded.result.rejection?.actionOrdinal===33);
  const r=guarded.result.record;
  return {schema:'agent8-player-play-lock-retrospective-v1',
    frozenTrialId:trial.id,seed:trial.seed,originalFailureRoot:33,
    originalFailureReproduced:true,vetoObserved,originalRejectionPrevented,
    policyAudit:guarded.audit,
    guardedError:guarded.result.error,guardedRejection:guarded.result.rejection,
    guardedGame:r?{status:r.status,actions:r.actions,turns:r.turns,
      rootActionLedgerSha256:r.rootActionLedgerSha256,
      sourceFirstRecordedOwnHandSha256:r.sourceFirstRecordedOwnHandSha256,
      candidateAttackDeclarations:r.candidateAttackDeclarations,
      sourceAttackDeclarations:r.sourceAttackDeclarations,
      responseDecisions:r.responseDecisions,prizesRemaining:r.prizesRemaining,
      engineFinished:r.engineFinished,engineWinner:r.engineWinner}:null,
    historicalSelectedDeal:true,competitivelyQualifiedGames:0,
    candidatePromoted:false};
}
if(require.main===module) process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
