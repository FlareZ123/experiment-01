'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {createHash} = require('node:crypto');
const temple = require('../../results/aichi-2026/candidate-temple-shadow-rider.json');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runWithResearchProfile, EXPANDED_PROFILE} = require('./policy-profiles.cjs');

const ENGINE_OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const RANKS = Object.freeze([6, 24, 29]);
const SEEDS = Object.freeze([2026101851, 2026101852, 2026101853, 2026101854]);
const PROFILE = EXPANDED_PROFILE;

/** @param {unknown} data @returns {string} */
function digest(data) {
  return createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

/** @param {object} player @returns {object} */
function ownerBoard(player) {
  const active = player.active.getPokemonCard();
  const bench = player.bench.map(slot => ({
    name: slot.getPokemonCard()?.name || null,
    psychic: slot.energies.cards.filter(card => card.name === 'Psychic Energy').length
  })).filter(slot => slot.name);
  const vmax = bench.filter(slot => slot.name === 'Shadow Rider Calyrex VMAX');
  const latias = bench.some(slot => slot.name === 'Latias ex');
  const psychicActive = player.active.energies.cards
    .filter(card => card.name === 'Psychic Energy').length;
  const psychicInPlay = psychicActive +
    bench.reduce((sum, slot) => sum + slot.psychic, 0);
  return {
    active: active?.name || null,
    latiasBenched: latias,
    vmaxBenched: vmax.length,
    vmaxWithThreePsychic: vmax.filter(slot => slot.psychic >= 3).length,
    psychicInPlay,
    psychicInHand: player.hand.cards
      .filter(card => card.name === 'Psychic Energy').length,
    bench
  };
}

/**
 * Wrap ordinary autonomous decisions with an owner-visible, read-only audit.
 * The owner hand is visible only to the owner's player; no deck order, opponent
 * hand, opponent Prizes or private source structure enters a decision.
 * @template T
 * @param {0|1} seat
 * @param {()=>T} execute
 * @returns {{result:T,events:object[]}}
 */
function withOwnerWindowObserver(seat, execute) {
  const {SimpleTacticsAi} = require(path.join(ENGINE_OUTPUT,
    'simple-bot/simple-tactics-ai'));
  const {GamePhase} = require(path.join(ENGINE_OUTPUT,
    'game/store/state/state'));
  const {GameMessage} = require(path.join(ENGINE_OUTPUT,
    'game/game-message'));
  const original = SimpleTacticsAi.prototype.decodeNextAction;
  const expectedId = seat === 0 ? 101 : 202;
  const events = [];
  const previous = new Set();
  const wrapper = function templeSourceObserver(state) {
    const player = state.players.find(side => side.id === this.client?.id);
    const pending = state.prompts.find(prompt => prompt.result === undefined);
    if (player?.id === expectedId && pending?.playerId === expectedId &&
        pending.message === GameMessage.CHOOSE_STARTING_POKEMONS) {
      const wobbuffetInHand = player.hand.cards
        .some(card => card.name === 'Wobbuffet');
      const action = original.call(this, state);
      const chosenNames = Array.isArray(action?.result) ?
        action.result.map(card => card?.name || null) : null;
      events.push({
        kind: 'owner-actual-setup-choice', turn: state.turn,
        prompt: pending.constructor.name,
        wobbuffetInHand,
        chosenNames,
        wobbuffetSelectedActive: chosenNames?.[0] === 'Wobbuffet'
      });
      return action;
    }
    if (player?.id === expectedId &&
        state.phase === GamePhase.PLAYER_TURN &&
        state.activePlayer === seat &&
        !state.prompts.some(prompt => prompt.result === undefined)) {
      const board = ownerBoard(player);
      const once = 'turn:' + state.turn;
      if (!previous.has(once)) {
        previous.add(once);
        events.push({
          kind: 'first-own-turn-decision', turn: state.turn,
          ownerActive: board.active,
          ownBench: board.bench.map(slot => slot.name),
          psychicInPlay: board.psychicInPlay
        });
      }
      if (board.active === 'Wobbuffet') {
        const key = JSON.stringify({
          turn: state.turn, bench: board.bench,
          psychicInPlay: board.psychicInPlay,
          psychicInHand: board.psychicInHand
        });
        if (!previous.has(key) && events.length < 200) {
          previous.add(key);
          events.push({
            kind: 'wobbuffet-active-window', turn: state.turn,
            ...board,
            readyToPromote: board.latiasBenched &&
              board.vmaxWithThreePsychic > 0
          });
        }
      }
    }
    return original.call(this, state);
  };
  SimpleTacticsAi.prototype.decodeNextAction = wrapper;
  try {
    return {result: execute(), events};
  } finally {
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction, wrapper,
      'Read-only source observer lost exclusive prototype ownership');
    SimpleTacticsAi.prototype.decodeNextAction = original;
  }
}

/** @param {object} game @returns {string} */
function gameSignature(game) {
  return digest({
    seed: game.seed, actions: game.actions, turns: game.turns,
    firstTurnSlot: game.firstTurnSlot,
    winner: game.winner, finished: game.finished,
    endReason: game.endReason, prizeCount: game.prizesRemaining,
    deckHashes: game.deckHashes, actionCounts: game.actionCounts,
    cardsPlayedBySeat: game.cardsPlayedBySeat,
    attackTrace: game.attackTrace,
    attackDeclarationTrace: game.attackDeclarationTrace,
    finalState: game.finalState
  });
}

/**
 * All source trials use exact fixed 60-card paper candidate/opponent printings.
 * The source plan resolver explicitly documents equivalent Basic Energy IDs.
 * @param {object} prepared
 * @param {number} rank
 * @param {number} seed
 * @param {0|1} seat
 * @param {boolean} observed
 */
function sourceGame(prepared, rank, seed, seat, observed) {
  const opponent = prepared.opponents.find(row => row.rank === rank);
  assert.equal(opponent?.status, 'ready');
  assert.equal(opponent.cards.length, 60);
  const deckA = seat === 0 ? prepared.candidate.cards : opponent.cards;
  const deckB = seat === 1 ? prepared.candidate.cards : opponent.cards;
  // Explicit opt-in diagnostic of the already archived rank-24 source deal.
  const traceDetail = process.env.TEMPLE_SOURCE_TRACE === 'true' &&
    rank === 24 && seed === 2026101854 && seat === 0;
  const run = () => runWithResearchProfile({
    deckA, deckB, seed, maxActions: 220,
    isolatePolicyRandomness: true, strictPromptValidation: true,
    captureStartingBoard: true,
    captureDecisionTrace: traceDetail,
    label: 'agent42-temple-source-rank-' + rank + '-seed-' + seed + '-seat-' + seat
  }, PROFILE);
  const wrapped = observed ? withOwnerWindowObserver(seat, run) :
    {result:run(),events:[]};
  const game = wrapped.result;
  assert.equal(game.seed, seed);
  assert.deepEqual(game.deckHashes, [digest(deckA), digest(deckB)]);
  assert.equal(game.verifiedByDrawLog, true,
    'Source player turn must have independent draw-log proof');
  if (traceDetail) {
    // Verify that extra trace capture did not change the authentic v3 game.
    assert.equal(gameSignature(game),
      '1af3f79119d6492794977146126aeeedec0c98c79aa62fc182b3bde30eaeb9bf');
  }
  return {
    rank, seed, candidateSeat: seat,
    actualCandidateFirst: game.firstTurnSlot === seat,
    engine: game.engine, policy: game.researchPolicyProfile,
    sourceDeckHashes: game.deckHashes, gameSignature: gameSignature(game),
    actions: game.actions, turns: game.turns, finished: game.finished,
    winner: game.winner, endReason: game.endReason,
    prizesRemaining: game.prizesRemaining,
    initialBoard: game.initialBoardAtFirstTurn,
    maxGeistDeclarations: (game.attackDeclarationTrace || [])
      .filter(entry => entry.playerSlot === seat &&
        entry.attackName === 'Max Geist').length,
    wobbuffetWindows: wrapped.events
      .filter(event => event.kind === 'wobbuffet-active-window'),
    firstOwnTurnDecisions: wrapped.events
      .filter(event => event.kind === 'first-own-turn-decision'),
    ownerSetupChoices: wrapped.events
      .filter(event => event.kind === 'owner-actual-setup-choice'),
    ...(traceDetail ? {
      archivedActionTrace: game.rootActionLedger
        .filter(row => row.turnBefore <= 15)
        .map(row => ({
          ordinal: row.actionOrdinal,
          turn: row.turnBefore,
          actorSeat: row.playerSlot,
          action: row.action,
          ...(row.card ? {card: row.card} : {}),
          ...(row.ability ? {ability: row.ability} : {}),
          ...(row.attack ? {attack: row.attack} : {}),
          ...(row.pendingPrompt ? {prompt: row.pendingPrompt} : {})
        }))
    } : {}),
    mechanicalOnly: true
  };
}

/** @returns {object} */
function runPanel() {
  const prepared = planAichi(temple, {
    allowEquivalentBasicEnergies: true,
    allowBasicEnergyMirrorPrintings: true,
    allowJapanesePromoHooks: true
  });
  assert.equal(prepared.candidate.cards.length, 60);
  const planned = RANKS.flatMap(rank => SEEDS.flatMap(seed =>
    [0, 1].map(seat => ({rank, seed, seat}))));
  const registrationDigest = digest(planned);
  const selectedRank = Number(process.env.TEMPLE_SOURCE_RANK);
  if (!RANKS.includes(selectedRank)) {
    throw new Error('Source panel rank must be one of the three registered Iron Thorns opponents');
  }
  const selected = planned.filter(entry => entry.rank === selectedRank);
  const records = [];
  let parity = null;
  for (const entry of selected) {
    const observed = sourceGame(prepared, entry.rank, entry.seed, entry.seat, true);
    if (parity === null) {
      const control = sourceGame(prepared, entry.rank, entry.seed, entry.seat, false);
      assert.equal(control.gameSignature, observed.gameSignature,
        'Read-only owner observation changed the authentic Store outcome');
      parity = {
        rank:entry.rank, seed:entry.seed,seat:entry.seat,
        controlSignature:control.gameSignature,
        observedSignature:observed.gameSignature,
        identical:true
      };
    }
    records.push(observed);
  }
  assert.equal(records.length, 8);
  return {
    schema:'agent42-temple-thorns-source-window-v3-setup-choice',
    targetRanks:RANKS, seedSet:SEEDS, profile:PROFILE,
    printedDeckManifestDigest:prepared.candidateDigest,
    registeredTrials:planned, registrationDigest, selectedRank, parity,
    count:records.length,
    wobbuffetStartingActive:records.filter(row =>
      row.initialBoard?.players?.[row.candidateSeat]?.active?.startsWith('Wobbuffet ')).length,
    wobbuffetInSetupHand:records.filter(row =>
      row.ownerSetupChoices.some(choice => choice.wobbuffetInHand)).length,
    wobbuffetOfferedButNotChosen:records.filter(row =>
      row.ownerSetupChoices.some(choice =>
        choice.wobbuffetInHand && choice.wobbuffetSelectedActive === false)).length,
    setupChoiceEvents:records.reduce((n,row) =>
      n+row.ownerSetupChoices.length,0),
    wobbuffetLiveWindows:records.reduce((n,row) =>
      n+row.wobbuffetWindows.length,0),
    fullyReadyLiveWindows:records.reduce((n,row) => n +
      row.wobbuffetWindows.filter(w=>w.readyToPromote).length,0),
    successfulEngineGames:records.filter(row=>row.finished).length,
    competitiveQualifiedGames:0,
    limitation:'Autonomous expanded probe bot, partial root telemetry, unverified game mechanics and paper clock; not a win-rate sample',
    records
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(runPanel(),null,2)+'\n');
}

module.exports = {
  RANKS, SEEDS, PROFILE, ownerBoard, withOwnerWindowObserver,
  gameSignature, sourceGame, runPanel
};
