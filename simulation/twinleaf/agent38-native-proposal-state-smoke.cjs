'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch,initializeCards}=require('./headless.cjs');
const {withBroadThornsSourceAttack}=
  require('./rank6-broad-thorns-policy.cjs');
const {withNativePaperSupporterDiscipline,VERSION}=
  require('./agent41-paper-supporter-discipline.cjs');
const {installOriginalStateNoninterferenceGate}=
  require('./original-state-noninterference-gate.cjs');
const {TIER_NAMES}=require('../../scripts/aichi-thorns-crossrank-opening.cjs');

const SEED=2966203069;
const hash=value=>createHash('sha256').update(JSON.stringify(value))
  .digest('hex');

/**
 * Compare two actual Store executions; this cannot certify a decision as
 * legal or competitive. A changed root sequence invalidates causal attribution.
 * @param {object} baseline Actual uninstrumented game.
 * @param {object} observed Actual read-only instrumented game.
 * @param {object} audit Original live-State noninterference report.
 * @returns {object}
 */
function assessNativeDecisionIntegrity(baseline,observed,audit) {
  const a=baseline.initialSourceDealFingerprint?.digestSha256??null;
  const b=observed.initialSourceDealFingerprint?.digestSha256??null;
  const actualLedgerA=baseline.rootActionLedger??[];
  const actualLedgerB=observed.rootActionLedger??[];
  const stableDeal=Boolean(a&&a===b);
  const stableRoots=hash(actualLedgerA)===hash(actualLedgerB);
  const violations=audit.violations??[];
  return {
    nativeStoreEvidence:true,
    proposalBoundary:'SimpleTacticsAi.decodeNextAction start/end',
    originalStateMutationsObserved:violations.length,
    decisionCalls:audit.calls,
    violations,
    sameOriginalSourceDeal:stableDeal,
    sameActualStoreRootLedger:stableRoots,
    baselineRootSha256:hash(actualLedgerA),
    instrumentedRootSha256:hash(actualLedgerB),
    firstTurnSlots:[baseline.firstTurnSlot,observed.firstTurnSlot],
    baselineRootActions:baseline.actions,
    instrumentedRootActions:observed.actions,
    policyOutcomeQualified:false,
    criticRejectedProposalWitness:false,
    note:'A changed owner State proves a proposal-side write only at this boundary. This experiment does not isolate the rejected-isValidAction case, score parity, hidden-information safety, or matchup strength.'
  };
}

/**
 * Reuse the exact authenticated rank24 105-root Supporter fixture for both
 * actual physical players under the canonical opt-in paper quota wrapper.
 * Records source play and State purity, without staging hands or decks.
 */
function main() {
  initializeCards();
  const compiled=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const {SimpleTacticsAi}=require(path.join(compiled,
    'simple-bot/simple-tactics-ai'));
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(row=>row.rank===24);
  assert.equal(source?.status,'ready');
  assert.equal(source.cards.length,60);
  const request={
    deckA:plan.candidate.cards,deckB:source.cards,
    seed:SEED,maxActions:105,strictPromptValidation:true,
    forestSealSearchCorrection:true,doubleDragonRecovery:true,
    supporterDecisionCorrection:true,isolatePolicyRandomness:true,
    captureDecisionTrace:true,leleEntryAbilityLockCorrection:true,
    radiantGateLockCorrection:true,entryDrawLockCorrection:true,
    captureInitialSourceDealFingerprintSeat:1
  };
  const priority=TIER_NAMES.slice(1,4).flat();
  const execute=()=>withNativePaperSupporterDiscipline(
    ()=>withBroadThornsSourceAttack(
      ()=>runMatch(request),{
        seat:1,turn:2,discardPriority:priority,
        k1ReplanAfterTagCall:true
      })
  );
  const baseline=execute();
  const guard=installOriginalStateNoninterferenceGate(SimpleTacticsAi,{
    failOnMutation:false,maxExamples:12
  });
  let observed,readOnlyAudit;
  try {
    observed=execute();
    readOnlyAudit=guard.report;
  } finally {
    guard.restore();
  }
  const gameA=baseline.result.result;
  const gameB=observed.result.result;
  const decision=assessNativeDecisionIntegrity(gameA,gameB,readOnlyAudit);
  const report={
    schema:'agent38-native-rank24-proposal-state-purity-v1',
    enginePin:gameB.engine,
    researchRevision:process.env.GITHUB_SHA??null,
    seed:SEED,sourceRank:24,candidateRank:1,
    candidateDeckSha256:hash(plan.candidate.cards),
    sourceDeckSha256:hash(source.cards),
    policyVersion:VERSION,
    baselineNativeQuotaQualified:baseline.audit.nativeSupporterQuotaQualified,
    instrumentedNativeQuotaQualified:observed.audit.nativeSupporterQuotaQualified,
    sourceSupporters:observed.audit.nativeSupporterEvents
      .filter(row=>row.seat===1)
      .map(row=>({turn:row.turn,name:row.name,settled:row.settled,
        supporterTurnBefore:row.supporterTurnBefore})),
    proposalIntegrity:decision,
    competitiveQualifiedGames:0
  };
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  assert.equal(gameA.firstTurnSlot,0);
  assert.equal(gameB.firstTurnSlot,0);
  assert.equal(gameA.verifiedByDrawLog,true);
  assert.equal(gameB.verifiedByDrawLog,true);
  assert.equal(baseline.audit.nativeSupporterQuotaQualified,true);
  assert.equal(observed.audit.nativeSupporterQuotaQualified,true);
  assert.equal(decision.sameOriginalSourceDeal,true);
  assert.equal(decision.sameActualStoreRootLedger,true,
    'Read-only observer changed real Store actions; result unqualified');
  assert.ok(decision.decisionCalls>0);
  return report;
}

if(require.main===module)main();
module.exports={SEED,assessNativeDecisionIntegrity,main};
