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
  const { SelectPrompt } = require(path.join(root, 'game/store/prompts/select-prompt'));
  const { GameMessage } = require(path.join(root, 'game/game-message'));
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
    const bonusPromptCount = [0, 0];
    const bonusPromptOffers = [0, 0];
    let actions = 0;
    while (store.state.phase === GamePhase.SETUP && actions < 200) {
      const state = store.state;
      const prompt = state.prompts.find(p => p.result === undefined);
      if (!prompt) throw new Error('Setup phase without actionable prompt.');
      if (prompt instanceof SelectPrompt && prompt.message === GameMessage.WANT_TO_DRAW_CARDS) {
        const offeredSeat = state.players.findIndex(p => p.id === prompt.playerId);
        if (offeredSeat < 0) throw new Error('Unknown recipient for bonus-card offer.');
        const offeredCounts = prompt.values.map(value => {
          const match = /^Draw (\\d+) card\\(s\\)$/.exec(value);
          if (!match) throw new Error('Unexpected bonus-card offer option: ' + value);
          return Number(match[1]);
        });
        bonusPromptCount[offeredSeat] += 1;
        bonusPromptOffers[offeredSeat] += Math.max(...offeredCounts);
      }
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
    const bonusOffered = [
      Math.max(0, mulligans[1] - mulligans[0]),
      Math.max(0, mulligans[0] - mulligans[1])
    ];
    if (bonusPromptCount.reduce((sum, count) => sum + count, 0) > 1 ||
        bonusPromptOffers.some((count, seat) => count !== bonusOffered[seat])) {
      throw new Error('Observed Twinleaf bonus prompts disagree with redraw-count evidence.');
    }
    return {
      mulligans, bonusOffered, bonusPromptCount, bonusPromptOffers,
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
    totalOfferedBonus: [0, 0], bonusCases: [0, 0],
    noBonusCases: 0, firstSeatCount: [0, 0], setupActions: 0
  };
  for (let i = 0; i < trials; i++) {
    const sample = oneSetup(a, b, (0x4e15 + i * 2654435761) >>> 0);
    for (let seat = 0; seat < 2; seat++) {
      stats.initialMulligans[seat] += Number(sample.mulligans[seat] > 0);
      stats.totalMulligans[seat] += sample.mulligans[seat];
      stats.totalOfferedBonus[seat] += sample.bonusOffered[seat];
      stats.bonusCases[seat] += Number(sample.bonusPromptCount[seat] > 0);
    }
    stats.noBonusCases += Number(sample.bonusPromptCount[0] === 0 &&
      sample.bonusPromptCount[1] === 0);
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
  const { bilateralBonus } = require('../../scripts/aichi_bilateral_bonus.cjs');
  const exact = bilateralBonus(4, 14);
  return {
    trials, ranks: [1, 6], seatNames: ['Shadow Rider', 'Iron Thorns'],
    bilateralOfferCalibration: {
      observedOneOrMore: stats.bonusCases.map(n => n / trials),
      observedNeither: stats.noBonusCases / trials,
      exactOneOrMore: [exact.candidateAtLeastOne, exact.opponentAtLeastOne],
      exactNeither: exact.neither,
      exactExpectedOffers: [exact.candidateExpected, exact.opponentExpected],
      mutualExclusivityVerifiedPerSetup: true,
      promptsCrossCheckedAgainstRedrawCounts: true
    },
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
    if (Math.abs(result.bilateralOfferCalibration.observedOneOrMore[seat] -
      result.bilateralOfferCalibration.exactOneOrMore[seat]) > 0.05 ||
        Math.abs(result.optionalBonusDrawsOfferedPerGame[seat] -
          result.bilateralOfferCalibration.exactExpectedOffers[seat]) >
        (seat === 0 ? 0.26 : 0.08)) {
      throw new Error('Twinleaf bilateral offer frequency deviated from exact setup law.');
    }
  }
  if (Math.abs(result.bilateralOfferCalibration.observedNeither -
      result.bilateralOfferCalibration.exactNeither) > 0.05) {
    throw new Error('Twinleaf no-bonus share deviated from the exact bilateral law.');
  }
}

module.exports = { oneSetup, auditMulligans };
