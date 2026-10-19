'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const {executeArm,scheduledArms,assertManifest}=
  require('./agent41-crossrank-actual-decisions.cjs');
const {planAichi}=require('./aichi-pilot.cjs');

/**
 * Retrospective original seed, with one actor-owned legal Supporter response
 * selected at the actual Store action-dispatch boundary. The independent
 * original rejected-root result is preserved unchanged.
 * @returns {object}
 */
function run() {
  assertManifest();
  const trial=scheduledArms().find(x=>x.id==='6:2:A:champion-reference');
  assert.ok(trial);
  assert.equal(trial.seed,2394734225);
  const baseline=require('./agent6-crossrank-rejected-root.cjs').run();
  assert.equal(baseline.rejection.actionOrdinal,33);
  assert.equal(baseline.rejection.playedCardName,
    'Thunder Mountain Prism Star');
  assert.equal(baseline.rejection.ownerPlayLockFlags.stadium,true);

  const inventory=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const champion=inventory.decks.find(x=>x.rank===1);
  assert.ok(champion);
  const prepared=new Map([['champion-reference',{
    plan:planAichi({label:'champion-reference',cards:champion.cards},{
      allowEquivalentBasicEnergies:true,
      allowBasicEnergyMirrorPrintings:true,
      allowJapanesePromoHooks:true
    })
  }]]);

  const treated=executeArm(trial,prepared,{
    captureRejectedActionEvidence:true,
    enforceVisiblePlayLockGuard:true,
    visiblePlayLockSupporterResponse:true
  });
  const decisions=treated.playLockDispatchGuardEvents;
  const originalDenied=decisions.find(row=>
    row.turn===3 && row.seat===1 &&
    row.reason==='stadium-lock' &&
    row.originalCard==='Thunder Mountain Prism Star LOT');
  assert.ok(originalDenied,
    'The live Store policy failed to observe the source Shadow Mist lock');
  assert.equal(originalDenied.alternative,"Lillie's Determination");
  assert.ok(treated.rootActionCount>33,
    'The substituted Supporter action did not advance the Store');

  return {
    schema:'rank6-shadow-mist-one-source-supporter-response-v2',
    frozenTrialId:trial.id,seed:trial.seed,
    originalFailureRoot:baseline.rejection.actionOrdinal,
    originalFailedAction:baseline.rejection.playedCardPrinting,
    originalPublicLock:baseline.rejection.ownerPlayLockFlags,
    archivedSourceRun:39193837824,
    historicalSelectedFailure:true,
    candidateId:trial.candidateId,sourceRank:trial.rank,
    sourceSupporterReplacementSelected:true,
    guardDecisions:decisions,
    treated:{
      status:treated.status,actions:treated.actions,turns:treated.turns,
      sourceAttackDeclarations:treated.sourceAttackDeclarations,
      candidateAttackDeclarations:treated.candidateAttackDeclarations,
      prizesRemaining:treated.prizesRemaining,
      engineFinished:treated.engineFinished,engineWinner:treated.engineWinner,
      sourcePolicyAudit:treated.sourcePolicyAudit
    },
    competitiveQualifiedGames:0,
    caveat:'Single previously selected source deal, one opt-in live owner-held Lillie response after a public Shadow Mist lock. This is a policy regression, not an independent game or win-rate observation.'
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
