'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch} = require('./headless.cjs');
const {observeAttackScores,gameSummary} =
  require('./attack-pass-score-diagnostic.cjs');

/**
 * Same-head source-rank10 score comparison under the pinned default and
 * opt-in post-super source-graph reconciliation. The observer is passive.
 *
 * @returns {object}
 */
function compareKoraidonScoreCloneProfiles() {
  const flags={
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  };
  const plan=planAichi(1,flags);
  const opponent=plan.opponents.find(deck=>deck.rank===10);
  assert.equal(plan.candidate.cards.length,60);
  assert.equal(opponent?.cards.length,60);
  const seed=deriveSlotSeeds(20261016,'pilot',10,0).A;
  assert.equal(seed,3162592764);

  const request={
    deckA:plan.candidate.cards,deckB:opponent.cards,
    seed,maxActions:600,
    label:'agent48-rank10-koraidon-score-post-super-comparison',
    strictPromptValidation:true,
    forestSealSearchCorrection:true,
    doubleDragonRecovery:true,
    supporterDecisionCorrection:true,
    isolatePolicyRandomness:true,
    captureDecisionTrace:true,
    captureAttackPassProbes:true,
    leleEntryAbilityLockCorrection:true,
    radiantGateLockCorrection:true,
    entryDrawLockCorrection:true
  };

  /** @param {object} extra */
  function run(extra) {
    const args={...request,...extra};
    const baseline=runMatch(args);
    const observed=observeAttackScores(()=>runMatch(args));
    assert.deepEqual(gameSummary(observed.game),gameSummary(baseline),
      'Passive attack-scoring observation changed the game');
    assert.deepEqual(observed.game.deckHashes,baseline.deckHashes);
    const turnFive=observed.passes.filter(row=>
      row.turn===5 && row.energy.some(item=>
        item.includes('Double Dragon Energy')));
    return {game:baseline,turnFive};
  }

  const original=run({});
  const repaired=run({postSuperAliasRepairIsolation:true});
  assert.deepEqual(original.game.deckHashes,repaired.game.deckHashes);
  assert.equal(original.game.firstTurnSlot,repaired.game.firstTurnSlot);
  assert.equal(original.game.seed,repaired.game.seed);

  const left=original.game.decisionTrace,right=repaired.game.decisionTrace;
  let firstActionDifference=null;
  for(let i=0;i<Math.max(left.length,right.length);i++) {
    if(JSON.stringify(left[i])!==JSON.stringify(right[i])){
      firstActionDifference=i;break;
    }
  }
  /** @param {object} arm */
  const summarize=arm=>({
    winner:arm.game.winner,
    finished:arm.game.finished,
    actions:arm.game.actions,
    firstTurnSlot:arm.game.firstTurnSlot,
    turnFive:arm.turnFive
  });
  return {
    analysis:'frozen rank10 Koraidon source-score by Simulator profile',
    sourceRanks:[1,10],sourceSeed:seed,
    engine:original.game.engine,
    sourceDeckHashes:original.game.deckHashes,
    original:summarize(original),
    postSuper:summarize(repaired),
    firstCapturedMeaningfulActionDifference:firstActionDifference,
    qualifiedForCompetitiveInference:false,
    caveat:'A changed speculative score can reflect different cloned State semantics or altered history. Scores are not demonstrated optimal strategy or competitive strength.'
  };
}

if(require.main===module) {
  process.stdout.write(JSON.stringify(compareKoraidonScoreCloneProfiles(),null,2)+'\n');
}

module.exports={compareKoraidonScoreCloneProfiles};
