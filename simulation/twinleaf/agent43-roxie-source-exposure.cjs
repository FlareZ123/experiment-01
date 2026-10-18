'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {runMatch, initializeCards} = require('./headless.cjs');
const {withRoxieDiscardEffectType} = require('./roxie-discard-type-hook.cjs');
const {observeConfirmPrompts} = require('./confirm-prompt-observer.cjs');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');

/** @param {string[]} cards @returns {string} */
function digest(cards) {
  return crypto.createHash('sha256').update(JSON.stringify(cards)).digest('hex');
}

/**
 * Summarize actual bot decisions without reconstructing hidden opponent cards.
 * No optional-confirmation response is inferred from an absent prompt log.
 * @param {object} game
 * @param {number} rank31Seat
 * @returns {object}
 */
function roxieExposure(game, rank31Seat) {
  const actions = (game.decisionTrace || []).filter(
    entry => entry.playerSlot === rank31Seat
  );
  const roxiePlays = actions.filter(entry =>
    entry.action === 'PlayCardAction' && entry.card === 'Roxie'
  ).map(entry => ({
    ordinal: entry.actionOrdinal, turn: entry.turnBefore
  }));
  const handDiscards = actions.filter(entry =>
    entry.cardSelection?.message === 'CHOOSE_CARD_TO_DISCARD' &&
    entry.cardSelection?.sourceZone === 'hand' &&
    entry.cardSelection?.sourcePlayerSlot === rank31Seat &&
    entry.cardSelection?.selectedCards?.some(card =>
      typeof card === 'string' && card.startsWith('Koffing CEC')
    )
  ).map(entry => ({
    ordinal: entry.actionOrdinal,
    turn: entry.turnBefore,
    promptMessage: entry.cardSelection.message,
    selectedCards: entry.cardSelection.selectedCards
  }));
  return {roxiePlays, koffingHandDiscards: handDiscards};
}

/**
 * Two source-dealt rank31-versus-reference observations, physical seats A/B.
 * Game terminal outcomes remain unqualified, with no strategic intervention.
 * @returns {object}
 */
function main() {
  const source = JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'), 'utf8'));
  const rank1 = source.decks.find(deck => deck.rank === 1);
  const rank31 = source.decks.find(deck => deck.rank === 31);
  assert.ok(rank1 && rank31);
  assert.equal(rank31.cards.find(card => card.name === 'Koffing')?.count, 3);
  assert.equal(rank31.cards.find(card => card.name === 'Roxie')?.count, 4);

  const seeds = deriveSlotSeeds(20261016, 'published-field', 31, 0);
  assert.deepEqual(seeds, {A:1098062414, B:1295587841});
  initializeCards();
  const prepared = planAichi({label:'champion-reference', cards:rank1.cards}, {
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const other = prepared.opponents.find(deck => deck.rank === 31);
  assert.equal(prepared.candidate.cards?.length, 60);
  assert.equal(other?.status, 'ready');
  assert.equal(other.cards.length, 60);

  const trials = [];
  for (const slot of ['A', 'B']) {
    const referenceSeat = slot === 'A' ? 0 : 1;
    const rank31Seat = 1 - referenceSeat;
    const deckA = slot === 'A' ? prepared.candidate.cards : other.cards;
    const deckB = slot === 'B' ? prepared.candidate.cards : other.cards;
    try {
      const observed = withRoxieDiscardEffectType(() =>
        observeConfirmPrompts(() => runMatch({
        deckA, deckB, seed:seeds[slot], maxActions:240,
        label:'rank31:roxie-published-field:0:' + slot,
        strictPromptValidation:true,
        isolatePolicyRandomness:true,
        forestSealSearchCorrection:true,
        doubleDragonRecovery:true,
        supporterDecisionCorrection:true,
        leleEntryAbilityLockCorrection:true,
        radiantGateLockCorrection:true,
        entryDrawLockCorrection:true,
        grandTreeFirstTurnCorrection:true,
        battleCompressorPositiveSelectionCorrection:true,
        captureDecisionTrace:true
      })));
      const game = observed.value;
      assert.deepEqual(game.deckHashes, [digest(deckA), digest(deckB)]);
      const exposure = roxieExposure(game, rank31Seat);
      trials.push({slot, seed:seeds[slot], status:'engine-observation',
        rank31Seat, actualFirstTurnSeat:game.firstTurnSlot,
        actions:game.actions, turns:game.turns, finished:game.finished,
        rank31RoxiePlays:game.cardsPlayedBySeat[rank31Seat]?.Roxie || 0,
        ...exposure,
        rank31Confirmations:observed.confirmations.filter(
          event => event.seat === rank31Seat
        ),
        deckHashes:game.deckHashes});
    } catch (error) {
      trials.push({slot, seed:seeds[slot], status:'engine-error',
        rank31Seat, reason:String(error?.message || error)});
    }
  }
  return {
    purpose:'Natural rank31 Roxie/Koffing choice exposure in source-dealt generic-bot play',
    sourceRank:31, againstRank:1, seedProtocol:'decorrelated-slots-v3',
    seeds, source:prepared.source,
    candidateDigest:prepared.candidateDigest,
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    reversibleHook:'RoxieDiscardEffectType',
    confirmationResultCapture:'Passive pinned generic resolver observation',
    qualifiedForCompetitiveInference:false, trials
  };
}
if (require.main === module) console.log(JSON.stringify(main(), null, 2));
module.exports = {main, roxieExposure};
