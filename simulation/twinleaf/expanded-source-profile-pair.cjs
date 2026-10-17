'use strict';

const path = require('node:path');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {
  runWithResearchProfile, EXPANDED_PROFILE, EXPANDED_SOURCE_PROFILE
} = require('./policy-profiles.cjs');

const SAMPLES = Object.freeze([
  {rankA: 2, rankB: 1, seed: 20261021},
  {rankA: 1, rankB: 2, seed: 20261023}
]);
const PROFILES = Object.freeze([EXPANDED_PROFILE, EXPANDED_SOURCE_PROFILE]);

/**
 * Retain only the rank-2 decisions capable of exposing the Bunnelby ALS.
 * This readout does not assess whether the choice was strategically correct.
 * @param {object} game Headless MatchRecord.
 * @param {number} rank2Seat Physical seat occupied by published rank 2.
 * @returns {object} Reproducible bounded mechanics readout.
 */
function rank2DecisionReadout(game, rank2Seat) {
  const relevant = (game.decisionTrace || []).filter(e =>
    e.playerSlot === rank2Seat && (e.card === 'Guzma & Hala' ||
    e.card === 'Technical Machine: Evolution' || e.card === 'Jet Energy' ||
    e.optionSelection || e.attack === 'Evolution' ||
    e.cardSelection?.selectedCards?.some(name =>
      name === 'Technical Machine: Evolution PAR' || name === 'Jet Energy PAL') ||
    (e.cardSelection?.sourceZone === 'hand' &&
      e.cardSelection?.selectedCards?.length === 2))).map(e => ({
      turn: e.turnBefore, action: e.action,
      ...(e.card ? {card:e.card} : {}),
      ...(e.optionSelection ? {option:e.optionSelection.selectedOption,
        optionText:e.optionSelection.selectedText} : {}),
      ...(e.cardSelection ? {sourceZone:e.cardSelection.sourceZone,
        selected:e.cardSelection.selectedCards} : {}),
      ...(e.attack ? {attack:e.attack} : {})
    }));
  return {
    status: game.finished ? 'finished-engine-game' : 'action-limited',
    actions: game.actions, turns: game.turns,
    firstTurnSlot: game.firstTurnSlot,
    verifiedByDrawLog: game.verifiedByDrawLog,
    deckHashes: game.deckHashes,
    policy: game.policy,
    rank2PlayedCards: game.cardsPlayedBySeat[rank2Seat],
    rank2EvolutionAttacks: game.attackTrace.filter(event =>
      event.seat === rank2Seat && event.attack === 'Evolution').length,
    rank2DecisionEvents: relevant
  };
}

/**
 * Pair the same source 60, seed and physical seats under independently
 * versioned bots. Different policy actions can later change deck shuffles,
 * so equal source hashes and starts do not imply paired later draws.
 * @param {{maxActions?:number,profiles?:readonly string[]}} [options]
 * @returns {object} Diagnostic, never a competitive win-rate estimate.
 */
function runSourceProfilePair({maxActions = 350,profiles = PROFILES} = {}) {
  if (!Array.isArray(profiles) || profiles.length !== 2 ||
      profiles[0] === profiles[1]) throw new Error('Require two distinct research profiles');
  const resolved = resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'), {
    allowEquivalentBasicEnergies: true, allowJapanesePromoHooks: true
  });
  const decks = new Map(resolved.decks.map(d => [d.rank, d]));
  if (!decks.get(1)?.playableUnderEngine ||
      !decks.get(2)?.playableUnderEngine) {
    throw new Error('Published rank-1 and rank-2 source 60 required');
  }

  const samples = SAMPLES.map(sample => {
    const rank2Seat = sample.rankA === 2 ? 0 : 1;
    const arms = profiles.map(profile => {
      const game = runWithResearchProfile({
        deckA: decks.get(sample.rankA).cardIds,
        deckB: decks.get(sample.rankB).cardIds,
        seed: sample.seed, maxActions, captureDecisionTrace: true,
        strictPromptValidation: true,
        label: 'Source-K0 policy contrast, rank2 seat ' + rank2Seat
      }, profile);
      return {
        profile, ...rank2DecisionReadout(game, rank2Seat),
        strictPromptValidation: game.promptValidationMode
      };
    });
    return {
      ...sample, rank2Seat, arms,
      equalSourceHashes: JSON.stringify(arms[0].deckHashes) ===
        JSON.stringify(arms[1].deckHashes),
      equalFirstTurn: arms[0].firstTurnSlot === arms[1].firstTurnSlot
    };
  });
  return {
    study: 'same-seed rank-2 source-policy diagnostic',
    engine: 'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    profiles, samples,
    caveat: 'Weak automated policies and incomplete paper mechanics; decision diagnostics only. No qualified competitive games, win-rate or proof of identical downstream draws.'
  };
}

if (require.main === module) {
  console.log(JSON.stringify(runSourceProfilePair(), null, 2));
}
module.exports = {SAMPLES, PROFILES, rank2DecisionReadout, runSourceProfilePair};
