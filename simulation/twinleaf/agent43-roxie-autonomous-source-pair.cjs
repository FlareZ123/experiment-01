'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {runMatch, initializeCards} = require('./headless.cjs');
const {observeConfirmPrompts} = require('./confirm-prompt-observer.cjs');
const {withRoxieDiscardEffectType} = require('./roxie-discard-type-hook.cjs');
const {withRoxieKoffingConfirmation} =
  require('./roxie-koffing-confirmation-policy.cjs');
const {roxieExposure} = require('./roxie-selection-evidence.cjs');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');

/**
 * One deliberately reused diagnostic seed that had a real rank-31
 * Roxie/Koffing hand discard in the preceding source trace.
 * This seed is chosen *because* it exposed the mechanism, so it cannot be
 * treated as a prospective or independent matchup-performance sample.
 */
function main() {
  const source = JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'), 'utf8'));
  const rank1 = source.decks.find(d => d.rank === 1);
  const rank31 = source.decks.find(d => d.rank === 31);
  assert.ok(rank1 && rank31);
  initializeCards();

  const prepared = planAichi({label:'champion-reference', cards:rank1.cards}, {
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const opponent = prepared.opponents.find(d => d.rank === 31);
  assert.equal(prepared.candidate.cards.length, 60);
  assert.equal(opponent.status, 'ready');
  assert.equal(opponent.cards.length, 60);

  const seed = deriveSlotSeeds(20261016, 'published-field', 31, 0).A;
  assert.equal(seed, 1098062414);
  const rank31Seat = 1;
  const request = {
    deckA:prepared.candidate.cards, deckB:opponent.cards, seed,
    label:'rank31:roxie-ability-policy-seed-selected:seatB',
    maxActions:240, strictPromptValidation:true,
    isolatePolicyRandomness:true, forestSealSearchCorrection:true,
    doubleDragonRecovery:true, supporterDecisionCorrection:true,
    leleEntryAbilityLockCorrection:true, radiantGateLockCorrection:true,
    entryDrawLockCorrection:true, grandTreeFirstTurnCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    captureDecisionTrace:true
  };
  const baseline = withRoxieDiscardEffectType(() =>
    observeConfirmPrompts(() => runMatch(request))
  );
  const experiment = withRoxieDiscardEffectType(() =>
    withRoxieKoffingConfirmation(() =>
      observeConfirmPrompts(() => runMatch(request))
    )
  );

  const summarize = (observed, modifications) => {
    const game = observed.value;
    const exposure = roxieExposure(game, rank31Seat);
    return {
      deckHashes:game.deckHashes,
      sourceFirstTurnSeat:game.firstTurnSlot,
      actions:game.actions, turns:game.turns,
      finished:game.finished,
      winnerId:game.winner ?? null,
      prizesRemaining:game.prizesRemaining,
      rank31RoxiePlays:game.cardsPlayedBySeat[rank31Seat]?.Roxie || 0,
      ...exposure,
      confirmations:observed.confirmations.filter(q => q.seat === rank31Seat),
      modifications
    };
  };
  const control = summarize(baseline, []);
  const corrected = summarize(experiment.value, experiment.accepted);
  assert.deepEqual(control.deckHashes, corrected.deckHashes);
  assert.equal(control.sourceFirstTurnSeat, corrected.sourceFirstTurnSeat);
  return {
    classification:'Selected-seed real-Store policy mechanism counterfactual; not a win-rate trial',
    sourceRank:31, referenceRank:1, sourceRankSeat:rank31Seat,
    sourceSeed:seed, seedProtocol:'decorrelated-slots-v3-selected-after-known-trigger',
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    policy:'Koffing CEC exact Roxie-trigger ConfirmPrompt object identity only',
    source:prepared.source,
    candidateDigest:prepared.candidateDigest,
    markedPrompts:experiment.marked,
    control, corrected,
    qualifiedForCompetitiveInference:false
  };
}

if (require.main === module) process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports = {main};
