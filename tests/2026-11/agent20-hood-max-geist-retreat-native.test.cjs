'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

const ROOT = path.resolve(__dirname, '../..');
const VENDOR = path.join(ROOT, 'vendor/twinleaf');
const EXPECTED_TWINLEAF_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const PLAYER_IDS = [101, 202];

const {
  withHoodCandidateBotOptionsBySeat
} = require('../../simulation/twinleaf/hood-candidate-bot-options.cjs');

const output = path.join(VENDOR, 'ptcg-server/output');
const fromOutput = relative => require(path.join(output, relative));

const {Store} = fromOutput('game/store/store');
const {GamePhase} = fromOutput('game/store/state/state');
const {GameSettings} = fromOutput('game/core/game-settings');
const {Format} = fromOutput('game/store/card/card-types');
const {AddPlayerAction} = fromOutput('game/store/actions/add-player-action');
const {ResolvePromptAction} = fromOutput('game/store/actions/resolve-prompt-action');
const {ShuffleDeckPrompt} = fromOutput('game/store/prompts/shuffle-prompt');
const {CoinFlipPrompt} = fromOutput('game/store/prompts/coin-flip-prompt');
const {AttackAction, RetreatAction} =
  fromOutput('game/store/actions/game-actions');
const {SimpleTacticsAi} = fromOutput('simple-bot/simple-tactics-ai');
const simpleBotDefinitions = fromOutput('simple-bot/simple-bot-definitions');
const {BotFlipMode, BotShuffleMode} =
  fromOutput('game/bots/bot-arbiter');
const {CardManager} = fromOutput('game/cards/card-manager');
const sets = fromOutput('sets');

function assertPinnedEngine() {
  const actual = execFileSync('git', ['-C', VENDOR, 'rev-parse', 'HEAD'],
    {encoding: 'utf8'}).trim();
  assert.equal(actual, EXPECTED_TWINLEAF_PIN,
    'native Hood regression must run against the reviewed Twinleaf gitlink');
}

function initializeCardPool() {
  const manager = CardManager.getInstance();
  if (manager.getAllCards().length > 0) return manager;
  const startup = fs.readFileSync(
    path.join(VENDOR, 'ptcg-server/start.js'), 'utf8');
  const setNames = [...startup.matchAll(
    /^\s*cardManager\.defineSet\(sets\.(\w+)\)\s*;?/gm
  )].map(match => match[1]);
  assert.ok(setNames.length > 0,
    'pinned Twinleaf startup did not expose any card sets');
  assert.equal(new Set(setNames).size, setNames.length,
    'pinned Twinleaf startup repeated a card set');
  for (const name of setNames) {
    assert.ok(Array.isArray(sets[name]),
      'pinned startup refers to an unavailable card set: ' + name);
    manager.defineSet(sets[name]);
  }
  assert.ok(manager.getAllCards().length > 0,
    'pinned Twinleaf card pool is empty');
  return manager;
}

function buildTestDeck(manager) {
  const byPrinting = new Map();
  for (const card of manager.getAllCards()) {
    const key = JSON.stringify([card.name, card.set, String(card.setNumber)]);
    const matches = byPrinting.get(key) ?? [];
    matches.push(card);
    byPrinting.set(key, matches);
  }
  const exact = (name, set, number) => {
    const matches = byPrinting.get(JSON.stringify([
      name, set, String(number)
    ])) ?? [];
    assert.equal(matches.length, 1,
      'exact native printing must resolve once: ' + name + ' ' + set + ' ' + number);
    return matches[0];
  };
  const shadowV = exact('Shadow Rider Calyrex V', 'CRE', '74');
  const shadowVmax = exact('Shadow Rider Calyrex VMAX', 'CRE', '75');
  const mimikyu = exact('Mimikyu', 'GRI', '58');
  const latias = exact('Latias ex', 'SSP', '76');
  const psychic = manager.getAllCards()
    .filter(card => card.name === 'Psychic Energy')
    .sort((a, b) => a.fullName.localeCompare(b.fullName))[0];
  assert.ok(psychic, 'pinned native card pool must contain Basic Psychic Energy');

  // This is a legal, synthetic 60-card action-test shell, not the nominated
  // candidate deck or a competitive-game input. Use a Twinleaf-supported
  // Basic Psychic Energy printing rather than the candidate's MEE printing,
  // which is not present in this pinned engine revision.
  const names = [
    ...Array(4).fill(shadowV.fullName),
    ...Array(4).fill(shadowVmax.fullName),
    ...Array(4).fill(mimikyu.fullName),
    ...Array(4).fill(latias.fullName),
    ...Array(44).fill(psychic.fullName)
  ];
  assert.equal(names.length, 60);
  return {
    names,
    psychicEnergy: {set: psychic.set, setNumber: psychic.setNumber}
  };
}

function makeBotOptions() {
  const scoreSource = simpleBotDefinitions.defaultStateScores;
  console.log('Agent20 native bot definition exports:', Object.keys(simpleBotDefinitions).sort());
  console.log('Agent20 native defaultStateScores shape:', {
    type: typeof scoreSource,
    tag: Object.prototype.toString.call(scoreSource),
    keys: scoreSource && typeof scoreSource === 'object' ?
      Object.keys(scoreSource).slice(0, 20) : null
  });
  const scores = Array.isArray(scoreSource) ? [...scoreSource] :
    typeof scoreSource === 'function' && Array.isArray(scoreSource()) ?
      [...scoreSource()] : null;
  assert.ok(scores,
    'pinned SimpleTacticsAi must expose iterable default state scores');
  return {
    tactics: [...simpleBotDefinitions.allSimpleTactics],
    promptResolvers: [...simpleBotDefinitions.allPromptResolvers],
    scores,
    arbiter: {
      flipMode: BotFlipMode.RANDOM,
      shuffleMode: BotShuffleMode.RANDOM
    }
  };
}

function withSeededRandom(seed, fn) {
  const previous = Math.random;
  let state = seed >>> 0;
  if (state === 0) state = 0x9e3779b9;
  Math.random = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
  try {
    return fn();
  } finally {
    Math.random = previous;
  }
}

function cardArrays(player) {
  const arrays = new Set();
  const visit = (value, depth = 0) => {
    if (!value || depth > 5) return;
    if (Array.isArray(value)) {
      if (value.length === 0 ||
          value.every(card => card && typeof card.fullName === 'string')) {
        arrays.add(value);
        return;
      }
      for (const item of value) visit(item, depth + 1);
      return;
    }
    if (typeof value !== 'object') return;
    if (Array.isArray(value.cards)) arrays.add(value.cards);
    for (const key of [
      'hand', 'deck', 'discard', 'lostzone', 'supporter', 'stadium',
      'prizes', 'active', 'bench', 'energies', 'tools'
    ]) visit(value[key], depth + 1);
  };
  visit(player);
  return [...arrays];
}

function takeCard(player, name, set, number) {
  const arrays = cardArrays(player);
  for (const cards of arrays) {
    const index = cards.findIndex(card =>
      card?.name === name &&
      (set === undefined || card?.set === set) &&
      (number === undefined || String(card?.setNumber) === String(number)));
    if (index >= 0) return cards.splice(index, 1)[0];
  }
  assert.fail('physical card not found in player zones: ' +
    [name, set, number].join(' '));
}

function ensureSlot(slot, label) {
  assert.ok(slot && typeof slot.getPokemonCard === 'function',
    label + ' must be a native PokemonSlot');
  if (!Array.isArray(slot.cards)) slot.cards = [];
  if (!slot.energies || !Array.isArray(slot.energies.cards)) {
    slot.energies = {cards: []};
  }
  if (!Array.isArray(slot.tools)) slot.tools = [];
  return slot;
}

function clearSlot(slot, discard) {
  for (const cards of [
    slot.cards, slot.energies.cards, slot.tools
  ]) {
    if (!Array.isArray(cards)) continue;
    discard.push(...cards);
    cards.splice(0, cards.length);
  }
  slot.damage = 0;
}

function clearHand(player) {
  const hand = player.hand?.cards;
  if (!Array.isArray(hand)) return;
  const discard = player.discard?.cards;
  if (Array.isArray(discard)) discard.push(...hand);
  hand.splice(0, hand.length);
}

function installBoard(state, candidateSeat, testDeck) {
  const opponentSeat = 1 - candidateSeat;
  const candidate = state.players[candidateSeat];
  const opponent = state.players[opponentSeat];
  assert.ok(candidate && opponent, 'both native Store players must exist');
  assert.ok(candidate.deck?.cards && opponent.deck?.cards,
    'native AddPlayerAction must create array-backed decks');

  const activeMimikyu = takeCard(candidate, 'Mimikyu', 'GRI', '58');
  const benchV = takeCard(candidate, 'Shadow Rider Calyrex V', 'CRE', '74');
  const benchVmax = takeCard(candidate, 'Shadow Rider Calyrex VMAX', 'CRE', '75');
  const psychic = Array.from({length: 7}, () =>
    takeCard(candidate, 'Psychic Energy', testDeck.psychicEnergy.set,
      testDeck.psychicEnergy.setNumber));
  const latias = takeCard(opponent, 'Latias ex', 'SSP', '76');

  const candidateActive = ensureSlot(candidate.active, 'candidate active');
  const opponentActive = ensureSlot(opponent.active, 'opponent active');
  const candidateDiscard = candidate.discard?.cards;
  const opponentDiscard = opponent.discard?.cards;
  assert.ok(Array.isArray(candidateDiscard) && Array.isArray(opponentDiscard),
    'native players must expose discard card arrays');

  for (const slot of [candidateActive, ...(candidate.bench ?? [])]) {
    clearSlot(ensureSlot(slot, 'candidate bench slot'), candidateDiscard);
  }
  for (const slot of [opponentActive, ...(opponent.bench ?? [])]) {
    clearSlot(ensureSlot(slot, 'opponent bench slot'), opponentDiscard);
  }
  clearHand(candidate);
  clearHand(opponent);

  const promoted = candidate.bench?.[0] ??
    new candidateActive.constructor();
  ensureSlot(promoted, 'candidate promoted bench slot');
  clearSlot(promoted, candidateDiscard);
  candidate.bench = [promoted];
  opponent.bench = [];

  candidateActive.cards.push(activeMimikyu);
  candidateActive.energies.cards.push(psychic[0]);
  promoted.cards.push(benchV, benchVmax);
  promoted.energies.cards.push(...psychic.slice(1));
  opponentActive.cards.push(latias);

  state.activePlayer = candidateSeat;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 5;
  state.prompts = [];
  state.winner = null;

  assert.equal(candidateActive.getPokemonCard().name, 'Mimikyu');
  assert.equal(promoted.getPokemonCard().name, 'Shadow Rider Calyrex VMAX');
  assert.equal(candidateActive.energies.cards.length, 1);
  assert.equal(promoted.energies.cards.length, 6);
  assert.equal(opponentActive.getPokemonCard().name, 'Latias ex');
}

function createScenario(candidateSeat, hoodEnabled, testDeck) {
  const optionsBySeat = hoodEnabled ?
    withHoodCandidateBotOptionsBySeat(makeBotOptions(), candidateSeat) :
    [makeBotOptions(), makeBotOptions()];
  assert.notEqual(optionsBySeat[0], optionsBySeat[1]);
  assert.notEqual(optionsBySeat[0].tactics, optionsBySeat[1].tactics);
  const bots = PLAYER_IDS.map((id, seat) =>
    new SimpleTacticsAi({id}, optionsBySeat[seat], [...testDeck.names]));
  const settings = new GameSettings();
  settings.format = Format.EXPANDED;
  settings.recordingEnabled = false;
  assert.ok(settings.rules && typeof settings.rules === 'object');
  settings.rules.firstTurnDrawCard = true;
  settings.rules.firstTurnUseSupporter = false;
  settings.rules.attackFirstTurn = false;

  const store = new Store({onStateChange: () => {}});
  store.state.gameSettings = settings;
  store.state.rules = settings.rules;
  store.dispatch(new AddPlayerAction(PLAYER_IDS[0], 'hood-seat-0',
    [...testDeck.names]));
  store.dispatch(new AddPlayerAction(PLAYER_IDS[1], 'hood-seat-1',
    [...testDeck.names]));
  assert.equal(store.state.players.length, 2,
    'native Store must register both players');
  installBoard(store.state, candidateSeat, testDeck);
  return {store, bots, optionsBySeat};
}

function pendingPrompt(state) {
  return state.prompts?.find(prompt => prompt.result === undefined) ?? null;
}

function resolveMandatoryPrompts(store, bots, seed) {
  let resolved = 0;
  while (true) {
    const state = store.state;
    const pending = pendingPrompt(state);
    if (!pending) return resolved;
    assert.ok(resolved < 12, 'native retreat produced an unbounded prompt chain');
    let seat;
    if (pending instanceof ShuffleDeckPrompt) {
      const ownerId = pending.getPerspectivePlayerId();
      seat = state.players.findIndex(player => player.id === ownerId);
      assert.ok(seat === 0 || seat === 1);
      const owner = state.players[seat];
      const permutation = Array.from(
        {length: owner.deck.cards.length}, (_, index) => index);
      store.dispatch(new ResolvePromptAction(pending.id, permutation));
    } else if (pending instanceof CoinFlipPrompt) {
      seat = pending.playerId === undefined ? state.activePlayer :
        state.players.findIndex(player => player.id === pending.playerId);
      assert.ok(seat === 0 || seat === 1);
      store.dispatch(new ResolvePromptAction(pending.id, true));
    } else {
      const ownerId = pending.playerId ??
        pending.getPerspectivePlayerId?.();
      seat = state.players.findIndex(player => player.id === ownerId);
      assert.ok(seat === 0 || seat === 1,
        'mandatory native prompt must identify its owner');
      const action = withSeededRandom(seed + resolved,
        () => bots[seat].decodeNextAction(state));
      assert.ok(action, 'native prompt resolver must return an action');
      store.dispatch(action);
    }
    resolved++;
  }
}

function decode(bot, state, seed) {
  return withSeededRandom(seed, () => bot.decodeNextAction(state));
}

function actionContainsAttack(action, name) {
  return JSON.stringify(action).includes(name);
}

function runBaseline(candidateSeat, testDeck) {
  const scenario = createScenario(candidateSeat, false, testDeck);
  const bot = scenario.bots[candidateSeat];
  const action = decode(bot, scenario.store.state, 0x20a11 + candidateSeat);
  assert.ok(action instanceof AttackAction,
    'baseline control should attack with the Active Mimikyu');
  assert.ok(actionContainsAttack(action, 'Filch'),
    'baseline control should select Filch rather than the bench VMAX line');
  const beforeHand = scenario.store.state.players[candidateSeat].hand.cards.length;
  scenario.store.dispatch(action);
  resolveMandatoryPrompts(scenario.store, scenario.bots, 0x20b11);
  const afterHand = scenario.store.state.players[candidateSeat].hand.cards.length;
  assert.equal(afterHand - beforeHand, 2,
    'baseline Filch must be accepted and draw two cards');
  return {cardsDrawn: afterHand - beforeHand, action: action.constructor.name};
}

function runCandidate(candidateSeat, testDeck) {
  const scenario = createScenario(candidateSeat, true, testDeck);
  const candidateBot = scenario.bots[candidateSeat];
  const opponentSeat = 1 - candidateSeat;
  const candidateOptions = scenario.optionsBySeat[candidateSeat];
  const opponentOptions = scenario.optionsBySeat[opponentSeat];
  assert.ok(candidateOptions.tactics.some(item =>
    item?.name === 'HoodMaxGeistRetreatTactic'),
  'candidate physical seat must receive the Hood retreat tactic');
  assert.equal(opponentOptions.tactics.some(item =>
    item?.name === 'HoodMaxGeistRetreatTactic'), false,
  'opponent physical seat must retain baseline RetreatTactic');

  const retreat = decode(candidateBot, scenario.store.state,
    0x20c11 + candidateSeat);
  assert.ok(retreat instanceof RetreatAction,
    'candidate must choose the native RetreatAction before Max Geist');

  scenario.store.dispatch(retreat);
  resolveMandatoryPrompts(scenario.store, scenario.bots, 0x20d11);
  const afterRetreat = scenario.store.state.players[candidateSeat];
  assert.equal(afterRetreat.active.getPokemonCard().name,
    'Shadow Rider Calyrex VMAX',
    'native Store must promote the charged Benched VMAX');
  assert.equal(afterRetreat.active.energies.cards.length, 6,
    'promoted VMAX must retain its six Psychic Energy');
  assert.equal(afterRetreat.bench[0].getPokemonCard().name, 'Mimikyu',
    'retreated Mimikyu must become the candidate Bench Pokémon');
  assert.equal(afterRetreat.bench[0].energies.cards.length, 0,
    'retreated Mimikyu must pay its one Psychic Energy');

  const attack = decode(candidateBot, scenario.store.state,
    0x20e11 + candidateSeat);
  assert.ok(attack instanceof AttackAction,
    'same candidate bot must choose a native AttackAction after retreat');
  assert.ok(actionContainsAttack(attack, 'Max Geist'),
    'same candidate bot must choose Max Geist as its next root action');
  const opponentBefore =
    scenario.store.state.players[opponentSeat].active.damage ?? 0;
  scenario.store.dispatch(attack);
  resolveMandatoryPrompts(scenario.store, scenario.bots, 0x20f11);
  const opponentAfter =
    scenario.store.state.players[opponentSeat].active.damage ?? 0;
  assert.ok(opponentAfter > opponentBefore,
    'native Store must accept Max Geist and apply damage');
  return {damage: opponentAfter - opponentBefore, retreat: retreat.constructor.name,
    attack: attack.constructor.name};
}

test('pinned native Store accepts candidate-only Mimikyu retreat → 190-damage Max Geist in both physical seats, with a Filch baseline control', () => {
  assertPinnedEngine();
  const manager = initializeCardPool();
  const testDeck = buildTestDeck(manager);
  for (const candidateSeat of [0, 1]) {
    const baseline = runBaseline(candidateSeat, testDeck);
    const candidate = runCandidate(candidateSeat, testDeck);
    assert.equal(baseline.cardsDrawn, 2,
      'baseline control must preserve Mimikyu Filch');
    assert.equal(candidate.damage, 190,
      'candidate Max Geist must deal 190 damage after the one-energy retreat in seat ' +
      candidateSeat);
  }
});
