'use strict';

const path = require('node:path');
const { initializeCards, seededRandom, deckPermutation } = require('./headless.cjs');
const { resolveManifestFile } = require('./resolve-field.cjs');

const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Execute initial seven-card setup with both real Aichi lists.
 * Count every redraw from deck shuffle prompts, including simultaneous
 * mulligans. No attack or turn decisions are evaluated here.
 *
 * @param {string[]} deck0
 * @param {string[]} deck1
 * @param {number} seed
 * @returns {{mulligans:number[], bonusOffered:number[],setupActions:number,firstSeat:number}}
 */
function oneSetup(deck0, deck1, seed) {
  const { Store } = require(path.join(root, 'game/store/store'));
  const { AddPlayerAction } = require(path.join(root, 'game/store/actions/add-player-action'));
  const { ResolvePromptAction } = require(path.join(root, 'game/store/actions/resolve-prompt-action'));
  const { CoinFlipPrompt } = require(path.join(root, 'game/store/prompts/coin-flip-prompt'));
  const { ShuffleDeckPrompt } = require(path.join(root, 'game/store/prompts/shuffle-prompt'));
  const { GamePhase } = require(path.join(root, 'game/store/state/state'));
  const { Format } = require(path.join(root, 'game/store/card/card-types'));
  const { GameSettings } = require(path.join(root, 'game/core/game-settings'));
  const { SimpleTacticsAi } = require(path.join(root, 'simple-bot/simple-tactics-ai'));
  const definitions = require(path.join(root, 'simple-bot/simple-bot-definitions'));

  const settings = new GameSettings();
  settings.format = Format.EXPANDED;
  settings.recordingEnabled = false;
  settings.rules.firstTurnUseSupporter = false;

  const rand = seededRandom(seed);
  const original = Math.random;
  Math.random = rand;
  try {
    const store = new Store({ onStateChange() {} });
    store.state.gameSettings = settings;
    store.state.rules = settings.rules;
    const seats = [
      new SimpleTacticsAi({ id: 101 }, {
        tactics: definitions.allSimpleTactics, promptResolvers: definitions.allPromptResolvers,
        scores: definitions.defaultStateScores
      }, deck0),
      new SimpleTacticsAi({ id: 202 }, {
        tactics: definitions.allSimpleTactics, promptResolvers: definitions.allPromptResolvers,
        scores: definitions.defaultStateScores
      }, deck1)
    ];
    store.dispatch(new AddPlayerAction(101, 'Shadow Rider', deck0));
    store.dispatch(new AddPlayerAction(202, 'Iron Thorns', deck1));
    const shuffles = [0, 0];
    let actions = 0;
    while (store.state.phase === GamePhase.SETUP && actions < 200) {
      const state = store.state;
      const prompt = state.prompts.find(p => p.result === undefined);
      if (!prompt) throw new Error('Setup phase without actionable prompt.');
      let action;
      if (prompt instanceof ShuffleDeckPrompt) {
        const seat = state.players.findIndex(p => p.id === prompt.getPerspectivePlayerId());
        if (seat < 0) throw new Error('Unowned setup shuffle.');
        const length = state.players[seat].deck.cards.length;
        shuffles[seat] += 1;
        action = new ResolvePromptAction(prompt.id, deckPermutation(length, rand));
      } else if (prompt instanceof CoinFlipPrompt) {
        action = new ResolvePromptAction(prompt.id, rand() < 0.5);
      } else {
        const seat = state.players.findIndex(p => p.id === prompt.playerId);
        if (seat < 0) throw new Error('Unowned setup prompt: ' + prompt.constructor.name);
        action = seats[seat].decodeNextAction(state);
      }
      if (!action) throw new Error('Unresolved setup prompt: ' + prompt.constructor.name);
      store.dispatch(action);
      actions += 1;
    }
    if (store.state.phase !== GamePhase.PLAYER_TURN) {
      throw new Error('Failed to complete setup before action limit.');
    }
    const mulligans = shuffles.map(n => n - 1);
    if (mulligans.some(n => n < 0)) throw new Error('Initial deck shuffle was missing.');
    return {
      mulligans,
      bonusOffered: [
        Math.max(0, mulligans[1] - mulligans[0]),
        Math.max(0, mulligans[0] - mulligans[1])
      ],
      setupActions: actions,
      firstSeat: store.state.activePlayer
    };
  } finally {
    Math.random = original;
  }
}

/**
 * @param {number} trials
 * @returns {object} Simulation-vs-hypergeometric setup calibration.
 */
function auditMulligans(trials = 2000) {
  initializeCards();
  const manifest = resolveManifestFile(
    path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json'),
    { allowEquivalentBasicEnergies: true, allowJapanesePromoHooks: true }
  );
  const byRank = new Map(manifest.decks.map(deck => [deck.rank, deck]));
  const a = byRank.get(1).cardIds;
  const b = byRank.get(6).cardIds;
  const stats = {
    initialMulligans: [0, 0], totalMulligans: [0, 0],
    totalOfferedBonus: [0, 0], firstSeatCount: [0, 0], setupActions: 0
  };
  for (let i = 0; i < trials; i++) {
    const sample = oneSetup(a, b, (0x4e15 + i * 2654435761) >>> 0);
    for (let seat = 0; seat < 2; seat++) {
      stats.initialMulligans[seat] += Number(sample.mulligans[seat] > 0);
      stats.totalMulligans[seat] += sample.mulligans[seat];
      stats.totalOfferedBonus[seat] += sample.bonusOffered[seat];
    }
    stats.firstSeatCount[sample.firstSeat] += 1;
    stats.setupActions += sample.setupActions;
  }
  const expected = [14, 4].map(basicCount => {
    let p = 1;
    for (let i = 0; i < 7; i++) {
      p *= (60 - basicCount - i) / (60 - i);
    }
    return p;
  });
  return {
    trials, ranks: [1, 6], seatNames: ['Shadow Rider', 'Iron Thorns'],
    initialMulliganRates: stats.initialMulligans.map(n => n / trials),
    totalMulligansPerGame: stats.totalMulligans.map(n => n / trials),
    optionalBonusDrawsOfferedPerGame: stats.totalOfferedBonus.map(n => n / trials),
    expectedInitialMulliganRates: expected,
    firstSeatRates: stats.firstSeatCount.map(n => n / trials),
    averageSetupActions: stats.setupActions / trials,
    source: 'Real pinned Twinleaf setup, not complete game performance'
  };
}

if (require.main === module) {
  const result = auditMulligans();
  console.log(JSON.stringify(result, null, 2));
  const tolerance = 0.04;
  for (let seat = 0; seat < 2; seat++) {
    if (Math.abs(result.initialMulliganRates[seat] -
      result.expectedInitialMulliganRates[seat]) > tolerance) {
      throw new Error('Mulligan frequency deviated from exact seven-card expectation.');
    }
  }
}

module.exports = { oneSetup, auditMulligans };
