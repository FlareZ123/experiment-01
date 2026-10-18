'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {initializeCards} = require('./headless.cjs');
const {RANK26_COLOGNE_PROFILE,RANK26_COLOGNE_PUMP_PROFILE,
  DEFAULT_PROFILE,runWithResearchProfile} =
  require('./policy-profiles.cjs');
const {SOURCE} = require('./rank26-cologne-autonomous-source-regression.cjs');

/** Compare real first-turn choices on an identical printed-source seed. */
function compare() {
  initializeCards();
  const plan=planAichi(26,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const source=plan.candidate;
  const opponent=plan.opponents.find(x=>x.rank===6);
  assert.equal(source.cards.length,60);
  assert.equal(opponent?.status,'ready');
  const base={
    deckA:opponent.cards,deckB:source.cards,
    seed:SOURCE.seed,maxActions:65,
    label:'rank26-held-Cologne-choice-counterfactual',
    strictPromptValidation:true,
    forestSealSearchCorrection:true,
    isolatePolicyRandomness:true,
    captureDecisionTrace:true,
    leleEntryAbilityLockCorrection:true,
    entryDrawLockCorrection:true
  };

  /** @param {string} profile */
  function run(profile) {
    const game=runWithResearchProfile({
      ...base, rank26SourceSeat:SOURCE.rank26Seat
    },profile);
    assert.equal(game.seed,base.seed);
    assert.equal(game.firstTurnSlot,SOURCE.rank26Seat);
    assert.equal(game.verifiedByDrawLog,true);
    const trace=(game.decisionTrace||[])
      .filter(row=>row.playerSlot===SOURCE.rank26Seat);
    const ownActions=trace.filter(row=>row.turnBefore===1);
    const cologneCount=game.cardsPlayedBySeat[SOURCE.rank26Seat]
      ['Canceling Cologne']||0;
    return {
      profile,engine:game.engine,
      actualTurnOrder:game.firstTurnSlot,firstDraw:game.firstDrawLogName,
      playedCologneTotal:cologneCount,
      firstTurnCologneUse:ownActions.some(
        row=>row.card==='Canceling Cologne'),
      firstTurnDecisions:ownActions.slice(0,24).map(row=>({
        actionOrdinal:row.actionOrdinal,
        action:row.action,card:row.card??null,
        ability:row.ability??null
      })),
      sourceRank26DecisionCount:trace.length,
      experimentalSelection:game.rank26ColognePolicy||null,
      experimentalPump:game.rank26PumpPolicy||null,
      pumpSingleSourceCorrected:game.damagePumpSingleSourceCorrection===true,
      finished:game.finished,observedWinner:game.winner,
      firstAttack:game.attackTrace
        .find(entry=>entry.seat===SOURCE.rank26Seat)||null
    };
  }
  const baseline=run(DEFAULT_PROFILE);
  const automatic=run(RANK26_COLOGNE_PROFILE);
  const combined=run(RANK26_COLOGNE_PUMP_PROFILE);
  assert.equal(baseline.engine,automatic.engine);
  assert.equal(baseline.engine,combined.engine);
  assert.equal(automatic.experimentalSelection?.opportunitiesSelected,1);
  assert.equal(automatic.firstTurnCologneUse,true);
  assert.equal(automatic.playedCologneTotal,1);
  assert.equal(combined.experimentalSelection?.opportunitiesSelected,1);
  assert.equal(combined.firstTurnDecisions[0]?.card,'Canceling Cologne');
  assert.equal(combined.pumpSingleSourceCorrected,true);
  return {
    schema:'rank26-cologne-identical-source-seed-bot-decision-counterfactual-v1',
    sourceRank:26,opponentRank:6,seed:SOURCE.seed,
    engine:baseline.engine,
    identicalDecksAndSetupSeed:true,
    candidatePhysicalSeat:SOURCE.rank26Seat,
    baseline,automatic,combined,
    strictlyDifferentDecision:
      JSON.stringify(baseline.firstTurnDecisions) !==
      JSON.stringify(automatic.firstTurnDecisions),
    competitiveGameQualified:false,
    sourcePolicyQualification:'Actual printed 60s and root decisions; baseline and intervention can diverge real game RNG and tactical context after first differing action. No game win-rate inference.'
  };
}
if(require.main===module) {
  process.stdout.write(JSON.stringify(compare(),null,2)+'\n');
}
module.exports={compare};
