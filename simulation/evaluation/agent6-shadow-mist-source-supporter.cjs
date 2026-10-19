'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const {executeArm,scheduledArms,assertManifest}=
  require('./agent41-crossrank-actual-decisions.cjs');
const {planAichi}=require('./aichi-pilot.cjs');

/**
 * Historical same-deal three-policy diagnostic:
 *   (1) source original fails at a real Store action;
 *   (2) unchanged source with opt-in final-dispatch guard;
 *   (3) opt-in source opening lock eligibility, plus the same dispatch guard.
 * Never recycle this selected seed as a held-out sample.
 *
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
  assert.equal(baseline.rejection.ownerSupporterTurn,1,
    'The original source had already spent its Supporter');

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
  const common={
    captureRejectedActionEvidence:true,
    enforceVisiblePlayLockGuard:true,
    visiblePlayLockSupporterResponse:true
  };

  const guardOnly=executeArm(trial,prepared,common);
  const originalDenied=guardOnly.playLockDispatchGuardEvents.find(row=>
    row.turn===3 && row.seat===1 &&
    row.reason==='stadium-lock' &&
    row.originalCard==='Thunder Mountain Prism Star LOT');
  assert.ok(originalDenied,
    'The final-dispatch guard failed to veto the original forbidden Stadium');
  assert.equal(originalDenied.alternative,'PassTurnAction',
    'The source had already spent a Supporter and must decline held Lillie');
  assert.ok(guardOnly.rootActionCount>33,
    'The fallback Pass did not advance the Store beyond root 33');

  let sourceGate=null,sourceGateError=null,sourceGateRejection=null;
  try {
    sourceGate=executeArm(trial,prepared,{
      ...common,sourceOpeningPublicLocks:true
    });
  } catch(error) {
    sourceGateError=String(error?.stack||error);
    sourceGateRejection=error?.rejectedActionEvidence??null;
  }
  const concise=x=>x?{
    status:x.status,rootActions:x.rootActionCount,turns:x.turns,
    sourceAttackDeclarations:x.sourceAttackDeclarations,
    candidateAttackDeclarations:x.candidateAttackDeclarations,
    prizesRemaining:x.prizesRemaining,
    engineFinished:x.engineFinished,engineWinner:x.engineWinner,
    rootActionLedgerSha256:x.rootActionLedgerSha256,
    sourcePolicyAudit:x.sourcePolicyAudit
  }:null;
  return {
    schema:'rank6-shadow-mist-three-version-source-policy-regression-v3',
    frozenTrialId:trial.id,seed:trial.seed,
    originalFailureRoot:baseline.rejection.actionOrdinal,
    originalFailedAction:baseline.rejection.playedCardPrinting,
    originalPublicLock:baseline.rejection.ownerPlayLockFlags,
    originalSupporterTurn:baseline.rejection.ownerSupporterTurn,
    archivedSourceRun:39193837824,
    historicalSelectedFailure:true,
    sourceRank:trial.rank,candidateId:trial.candidateId,
    guardOnly:{
      supportedLegalAlternative:false,
      heldSupporterDeclined:true,
      guardDecisions:guardOnly.playLockDispatchGuardEvents,
      game:concise(guardOnly)
    },
    sourceOpeningPublicLockGate:{
      enabled:true,guardDecisions:sourceGate?.playLockDispatchGuardEvents??null,
      game:concise(sourceGate),error:sourceGateError,
      rejectedAction:sourceGateRejection
    },
    qualifiedCompetitiveGames:0,
    caveat:'Three treatments on one retrospectively selected source deal. The original v1 source policy is preserved exactly by default. All outcomes are mechanics and policy feasibility only; no causal inventory or win-rate estimate.'
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
