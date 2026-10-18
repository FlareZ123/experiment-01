'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {initializeCards} = require('./headless.cjs');
const {RANK26_COLOGNE_PROFILE,runWithResearchProfile} =
  require('./policy-profiles.cjs');

const SOURCE = Object.freeze({
  rank:26, opponentRank:6,
  seed:49957955, rank26Seat:1,
  expectedAttacker:'Meloetta ex',
  expectedDefender:'Iron Thorns ex'
});

/** A real source-dealt automatic firstturn action, never an injected move. */
function run() {
  initializeCards();
  const plan = planAichi(SOURCE.rank,{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  });
  const attacker=plan.candidate;
  const opponent=plan.opponents.find(x=>x.rank===SOURCE.opponentRank);
  assert.equal(attacker.cards.length,60);
  assert.equal(opponent?.status,'ready');
  assert.equal(opponent.cards.length,60);
  const game=runWithResearchProfile({
    deckA:opponent.cards,
    deckB:attacker.cards,
    rank26SourceSeat:SOURCE.rank26Seat,
    seed:SOURCE.seed,
    maxActions:65,
    label:'Rank26SourceCologneAutonomous-v1',
    strictPromptValidation:true,
    forestSealSearchCorrection:true,
    leleEntryAbilityLockCorrection:true,
    entryDrawLockCorrection:true,
    isolatePolicyRandomness:true,
    captureDecisionTrace:true
  },RANK26_COLOGNE_PROFILE);
  assert.equal(game.seed,SOURCE.seed);
  assert.equal(game.firstTurnSlot,SOURCE.rank26Seat);
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(game.researchPolicyProfile,RANK26_COLOGNE_PROFILE);
  assert.ok(game.rank26ColognePolicy.opportunitiesSelected>=1,
    'Actual source root should trigger automatic held-Cologne action');
  assert.equal(game.rank26ColognePolicy.actions[0].card,'Canceling Cologne ASR');
  assert.equal(game.rank26ColognePolicy.actions[0].target,'Iron Thorns ex');
  assert.ok((game.cardsPlayedBySeat[SOURCE.rank26Seat]['Canceling Cologne ASR']||0)>=1,
    'Engine must actually process the bot-selected Item from source hand');
  const sequence=(game.decisionTrace||[]).filter(
    action=>action.playerSlot===SOURCE.rank26Seat).slice(0,12);
  return {
    schema:'rank26-source-autonomous-cologne-decision-v1',
    candidateSourceRank:SOURCE.rank,
    opponentRank:SOURCE.opponentRank,
    sourcePrintedDecks:[attacker.cards.length,opponent.cards.length],
    firstTurnVerified:true,
    seed:SOURCE.seed,rank26Seat:SOURCE.rank26Seat,
    engine:game.engine,
    researchPolicyProfile:RANK26_COLOGNE_PROFILE,
    policyAudit:game.rank26ColognePolicy,
    actualItemPlayedBySourceSeat:
      game.cardsPlayedBySeat[SOURCE.rank26Seat]['Canceling Cologne ASR'],
    firstSourceActions:sequence,
    finished:game.finished,
    observedWinner:game.winner,
    sourceRootQualified:true,
    firstActionLegallyChosenAndDispatched:true,
    completeComboQualified:false,
    opponentDecisionQualified:false,
    competitiveGameQualified:false,
    caveat:'The visible-hand rule chooses only a real available Cologne against active lock. Generic policy governs the rest, with no five-self-KO Meloetta attack strategy. Engine outcomes are diagnostic, not wins.'
  };
}
if(require.main===module) {
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
}
module.exports={run,SOURCE};
