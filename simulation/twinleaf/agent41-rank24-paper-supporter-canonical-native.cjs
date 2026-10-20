'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch,initializeCards}=require('./headless.cjs');
const {withBroadThornsSourceAttack}=
  require('./rank6-broad-thorns-policy.cjs');
const {withNativePaperSupporterDiscipline,VERSION}=
  require('./agent41-paper-supporter-discipline.cjs');
const {TIER_NAMES}=require('../../scripts/aichi-thorns-crossrank-opening.cjs');

const SEED=2966203069;
const digest=object=>createHash('sha256')
  .update(JSON.stringify(object)).digest('hex');

/** Exact independently selected Agent 34/8 paper-illegal native owner fixture. */
function main(){
  initializeCards();
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(entry=>entry.rank===24);
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
  const guarded=withNativePaperSupporterDiscipline(
    ()=>withBroadThornsSourceAttack(
      ()=>runMatch(request),{
        seat:1,turn:2,discardPriority:priority,
        k1ReplanAfterTagCall:true
      })
  );
  const game=guarded.result.result;
  const native=guarded.audit;
  const sourceTurn2=(game.decisionTrace??[])
    .filter(row=>row.playerSlot===1&&row.turnBefore===2)
    .map(row=>({
      ordinal:row.actionOrdinal,action:row.action,
      card:row.card??null,attack:row.attackName??null
    }));
  const firstSourceSupporter=native.nativeSupporterEvents.find(row=>
    row.seat===1&&row.turn===2&&row.name==='Cynthia & Caitlin CEC');
  const report={
    schema:'agent41-rank24-native-paper-quota-continuation-v1',
    sourceRank:24,candidateRank:1,seed:SEED,
    enginePin:game.engine,policyVersion:VERSION,
    researchRevision:process.env.GITHUB_SHA??null,
    sourceDeckSha256:digest(source.cards),
    candidateDeckSha256:digest(plan.candidate.cards),
    originalKnownNegative:{
      gameSeed:SEED,sourceSeat:1,turn:2,
      illegalSecondSupporter:'Sidney FST 241',
      witness:'results/twinleaf/agent34-native-settled-multiple-supporters.md'
    },
    guarded:{
      verifiedByDrawLog:game.verifiedByDrawLog,
      firstTurnSlot:game.firstTurnSlot,
      sourcePhysicalDeal:game.initialSourceDealFingerprint??null,
      totalActions:game.actions,turns:game.turns,
      finished:game.finished,winner:game.finished?game.winner:null,
      endReason:game.endReason,
      nativeSupporterQuotaQualified:native.nativeSupporterQuotaQualified,
      acceptedLegalSupporters:native.nativeSupporterEvents,
      suppressionCount:native.ownerProposalSuppressionCount,
      suppressedProposals:native.ownerProposalSuppressions,
      rejectedDirectRoots:native.rootDispatchVetoes,
      actualSourceTurn2Roots:sourceTurn2,
      firstSourceSupporter:firstSourceSupporter??null,
      rootLedgerSha256:digest(game.rootActionLedger??[])
    },
    competitiveQualifiedGames:0,
    caveat:'Selected retrospective source-bias fixture; native quota control only. No paper-clock, actor-hidden-information, other-card rule or decision-policy competence certification.'
  };
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  assert.equal(game.firstTurnSlot,0,
    'Frozen original source seat B must actually take the second turn');
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(game.initialSourceDealFingerprint?.seat,1);
  assert.ok(firstSourceSupporter?.settled,
    'First legal Cynthia & Caitlin must settle in genuine native Store');
  assert.equal(firstSourceSupporter.supporterTurnBefore,0);
  assert.equal(native.nativeSupporterQuotaQualified,true,
    'Pinned native Store paper-quota audit must certify both actor seats');
  assert.equal(native.rootDispatchVetoes.length,0,
    'Filtered bot must not propose any illegal direct root');
  assert.ok(native.ownerProposalSuppressionCount>=1,
    'The exact known violation case must exercise owner-visible suppression');
  assert.ok(game.actions>24,
    'Guarded real match must continue past original second-Supporter root');
  assert.ok(sourceTurn2.some(row=>row.card==='Cynthia & Caitlin'),
    'Require actual source first Supporter on real turn 2');
  return report;
}
if(require.main===module)main();
module.exports={SEED,main};
