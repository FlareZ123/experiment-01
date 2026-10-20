'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runMatch,initializeCards} = require('./headless.cjs');
const {withSpentSupporterSearch} = require('./spent-supporter-search-policy.cjs');
const {firstObservedDecisionDifference} =
  require('../evaluation/action-ledger-first-observable-difference.cjs');
const {summarize,actionSignature} =
  require('./hood-rank8-stone-policy-contrast.cjs');
const {writeLockedArtifact} =
  require('../evaluation/aichi-campaign-envelope-runner.cjs');

const SEED = 1260748957;
const CANDIDATE_SEAT = 1;
const SOURCE_RANK = 8;
const digest = value =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Read strictly actual post-choice Store actions from a single seeded game.
 * The actions are an incomplete summary and cannot prove prompt lineage.
 * @param {object} game Genuine pinned headless output.
 * @returns {object}
 */
function stonePromptLifecycle(game) {
  const trace = game.decisionTrace ?? [];
  const stars = trace.filter(x => x.playerSlot === CANDIDATE_SEAT &&
    x.action === 'UseAbilityAction' && x.ability === 'Star Alchemy');
  return stars.map(star => ({
    rootOrdinal:star.actionOrdinal,
    turn:star.turnBefore,
    candidateSubsequentChoices:trace.filter(x =>
      x.playerSlot === CANDIDATE_SEAT &&
      x.actionOrdinal > star.actionOrdinal &&
      x.actionOrdinal <= star.actionOrdinal + 12 &&
      x.cardSelection && x.cardSelection.sourceZone === 'deck'
    ).map(x => ({
      ordinal:x.actionOrdinal,
      message:x.cardSelection.message,
      selectedCards:x.cardSelection.selectedCards
    })),
    temporalAssociationOnly:true
  }));
}

/**
 * Replay the exact archived rank8 Hood second-start 60s/seed while varying
 * only candidate's prompt-ranking adapter. This seed was inspected earlier,
 * so it must never enter prospective win-rate denominators.
 * @returns {object} Complete bounded mechanic comparison.
 */
function main() {
  const candidate = require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
  const roster = require('../../results/aichi-2026/full-decklists.json');
  const source = roster.decks.find(x => x.rank === SOURCE_RANK);
  assert.ok(source);
  const plan = planAichi(candidate, {
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const opponent = plan.opponents.find(x => x.rank === SOURCE_RANK);
  assert.equal(opponent?.status,'ready');
  assert.equal(plan.candidate.cards.length,60);
  assert.equal(opponent.cards.length,60);

  const request = {
    deckA:opponent.cards,deckB:plan.candidate.cards,
    seed:SEED,maxActions:800,strictPromptValidation:true,
    forestSealSearchCorrection:true,doubleDragonRecovery:true,
    supporterDecisionCorrection:true,isolatePolicyRandomness:true,
    leleEntryAbilityLockCorrection:true,radiantGateLockCorrection:true,
    entryDrawLockCorrection:true,
    attachedToolPowerPolicy:true,captureDecisionTrace:true
  };
  initializeCards();
  const native = runMatch({...request,label:'rank8-stone-native-spent-supporter-score'});
  const adapted = withSpentSupporterSearch(CANDIDATE_SEAT, () =>
    runMatch({...request,label:'rank8-stone-corrected-spent-supporter-score'}));
  const revised = adapted.result;
  const games=[native,revised];
  for(const game of games){
    assert.equal(game.verifiedByDrawLog,true);
    assert.equal(game.firstTurnSlot,0);
    assert.equal(game.seed,SEED);
    assert.deepEqual(game.deckHashes,[digest(request.deckA),digest(request.deckB)]);
  }
  const traceA=native.decisionTrace??[];
  const traceB=revised.decisionTrace??[];
  const signaturesA=traceA.map(actionSignature);
  const signaturesB=traceB.map(actionSignature);
  const firstDifferent=Array.from({
    length:Math.max(signaturesA.length,signaturesB.length)
  },(_,i)=>i).find(i=>signaturesA[i]!==signaturesB[i])??null;
  const firstRepresented=firstObservedDecisionDifference(traceA,traceB);
  const compact=x=>({
    engine:x.engine,seed:x.seed,actions:x.actions,turns:x.turns,
    finished:x.finished,physicalWinner:x.finished?x.winner:null,
    endReason:x.endReason,prizesRemaining:x.prizesRemaining,
    starSearches:stonePromptLifecycle(x),
    candidateAttacks:(x.attackTrace??[]).filter(e=>e.seat===CANDIDATE_SEAT).length,
    opponentAttacks:(x.attackTrace??[]).filter(e=>e.seat!==CANDIDATE_SEAT).length,
    ownerDecisions:x.decisionTrace
  });
  const outcome={
    schema:'rank8-spent-supporter-source-replay-v1',
    experimentClass:'retrospectively selected same-source mechanistic policy contrast',
    frozenSeed:SEED,
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    researchRevision:process.env.GITHUB_SHA??null,
    candidate:'hood-shield-v1',candidateSeat:CANDIDATE_SEAT,
    opponent:'published-rank8-absol-garbodor',sourceRank:SOURCE_RANK,
    source60Digest:digest(request.deckA),
    candidate60Digest:digest(request.deckB),
    intervention:'candidate-seat unrestricted owner-deck one-card prompt rank changes when Supporter spent',
    correctionAudit:adapted.audit,
    firstRepresentedDecisionDifference:firstRepresented,
    firstDecisionSignatureDifference:firstDifferent,
    firstDifferentRootDecisions:firstDifferent===null?null:{
      original:traceA[firstDifferent]??null,corrected:traceB[firstDifferent]??null
    },
    sameRootDecisionPrefixCount:firstDifferent===null?
      Math.min(traceA.length,traceB.length):firstDifferent,
    baseline:compact(native),corrected:compact(revised),
    competitiveQualifiedGames:0,qualifiedForCompetitiveInference:false,
    limitations:[
      'Previously selected successful seed cannot estimate population gameplay strength',
      'Only candidate choice ranking changes; generic opponent source policy is still unqualified',
      'Own-deck prompt search and subsequent actions require Store/reducer lineage validation',
      'Actual Source prompts may change with earlier decisions and hidden deck order',
      'Clock, complete card-text parity and equal human decision policy remain unverified'
    ]
  };
  return outcome;
}
if(require.main===module){
  const result=main();
  writeLockedArtifact('rank8-spent-supporter-search-pair.json',
    JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({
    schema:result.schema,
    native:result.baseline.starSearches,
    changed:result.corrected.starSearches,
    events:result.correctionAudit.events,
    firstRepresented:result.firstRepresentedDecisionDifference,
    firstDifference:result.firstDecisionSignatureDifference,
    baselineOutcome:{finished:result.baseline.finished,
      prizes:result.baseline.prizesRemaining,actions:result.baseline.actions},
    correctedOutcome:{finished:result.corrected.finished,
      prizes:result.corrected.prizesRemaining,actions:result.corrected.actions},
    qualified:false
  },null,2));
}
module.exports={stonePromptLifecycle,main};
