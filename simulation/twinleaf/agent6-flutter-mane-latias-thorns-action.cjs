'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { installToolJammerHook } = require('./tool-jammer-hook.cjs');
const { installRadiantGateLockHook } = require('./radiant-gate-lock-hook.cjs');

const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const engine = name => require(path.join(OUTPUT, name));

function getCards() {
  const manager = initializeCards();
  return name => {
    const card = manager.getCardByName(name);
    assert.ok(card, 'Missing pinned card: ' + name);
    return card;
  };
}

/**
 * Staged real-Store action: Flutter Mane suppresses Active Iron Thorns long
 * enough for Underworld Door, then Latias ex permits a zero-cost retreat. The
 * test deliberately does not claim a source-dealt match or deck performance.
 * @param {{seat:0|1,latias:boolean,jammer:boolean}} options
 */
function runActionCase(options) {
  const { Store } = engine('game/store/store');
  const { GamePhase } = engine('game/store/state/state');
  const { Player } = engine('game/store/state/player');
  const { PokemonCardList } = engine('game/store/state/pokemon-card-list');
  const { CardList } = engine('game/store/state/card-list');
  const { CheckRetreatCostEffect, CheckPokemonPowersEffect } =
    engine('game/store/effects/check-effects');
  const { PowerEffect } = engine('game/store/effects/game-effects');
  const { RetreatAction, AttackAction } = engine('game/store/actions/game-actions');
  const { ResolvePromptAction } = engine('game/store/actions/resolve-prompt-action');
  const { AttachEnergyPrompt } = engine('game/store/prompts/attach-energy-prompt');
  const { PlayerType, SlotType } = engine('game/store/actions/play-card-action');

  const get = getCards();
  const ours = new Player();
  ours.id = 601 + options.seat;
  ours.name = 'Flutter Mane owner';
  const theirs = new Player();
  theirs.id = 701 + options.seat;
  theirs.name = 'Iron Thorns opponent';
  ours.prizes = [new CardList()];
  theirs.prizes = [new CardList()];
  ours.prizes[0].cards.push(get('Psychic Energy SVE'));
  theirs.prizes[0].cards.push(get('Psychic Energy SVE'));

  const flutter = get('Flutter Mane TEF');
  const thorns = get('Iron Thorns ex TWM');
  const vmax = get('Shadow Rider Calyrex VMAX CRE');
  ours.active.cards.push(flutter);
  theirs.active.cards.push(thorns);
  if (options.jammer) theirs.active.tools.push(get('Tool Jammer BST'));

  if (options.latias) {
    const latiasSlot = new PokemonCardList();
    latiasSlot.cards.push(get('Latias ex SSP'));
    ours.bench.push(latiasSlot);
  }
  const vmaxSlot = new PokemonCardList();
  vmaxSlot.cards.push(get('Shadow Rider Calyrex V CRE'), vmax);
  const preload = [get('Psychic Energy SVE'), get('Psychic Energy SVE')];
  vmaxSlot.cards.push(...preload);
  vmaxSlot.energies.cards.push(...preload);
  const vmaxIndex = ours.bench.length;
  ours.bench.push(vmaxSlot);
  const energy = get('Psychic Energy SVE');
  ours.hand.cards.push(energy);
  ours.deck.cards.push(get('Psychic Energy SVE'), get('Psychic Energy SVE'));

  const store = new Store({ onStateChange() {} });
  const state = store.state;
  state.players = options.seat === 0 ? [ours, theirs] : [theirs, ours];
  state.turn = 3;
  state.activePlayer = options.seat;
  state.phase = GamePhase.PLAYER_TURN;

  const powers = (player, pokemon) => {
    const check = new CheckPokemonPowersEffect(player, pokemon);
    store.reduceEffect(state, check);
    return check.powers.map(power => power.name);
  };

  assert.ok(powers(ours, flutter).includes('Midnight Fluttering'),
    'Flutter Mane must retain its Active Spot Ability');
  assert.ok(!powers(theirs, thorns).includes('Initialization'),
    'Active Flutter Mane must suppress opposing Active Iron Thorns');
  assert.ok(powers(ours, vmax).includes('Underworld Door'),
    'Shadow Rider VMAX must retain Underworld Door while Flutter Mane is Active');

  const door = vmax.powers.find(power => power.name === 'Underworld Door');
  assert.ok(door, 'Pinned Shadow Rider VMAX must expose Underworld Door');
  store.reduceEffect(state, new PowerEffect(ours, door, vmax, vmaxSlot));
  const prompt = state.prompts.find(item => item.result === undefined);
  assert.ok(prompt instanceof AttachEnergyPrompt, 'Underworld Door attachment prompt');
  store.dispatch(new ResolvePromptAction(prompt.id, [{
    to: {
      player: options.seat === 0 ? PlayerType.TOP_PLAYER : PlayerType.BOTTOM_PLAYER,
      slot: SlotType.BENCH,
      index: vmaxIndex
    },
    card: energy
  }]));
  assert.equal(vmaxSlot.energies.cards.length, 3,
    'Underworld Door must attach one Psychic Energy to the Benched VMAX');
  assert.equal(ours.hand.cards.length, 2,
    'Underworld Door must draw exactly two cards');

  const retreatCost = new CheckRetreatCostEffect(ours);
  store.reduceEffect(state, retreatCost);
  let retreated = true;
  let retreatError = null;
  try {
    store.dispatch(new RetreatAction(ours.id, vmaxIndex));
  } catch (error) {
    retreated = false;
    retreatError = String(error.message);
  }

  assert.equal(retreated, options.latias,
    JSON.stringify({ options, retreatError }));
  assert.equal(retreatCost.cost.length, options.latias ? 0 : 1,
    'Latias Skyliner, not a Tool, must provide the zero-retreat route');

  let attackDamage = null;
  if (retreated) {
    assert.equal(ours.active.getPokemonCard().name, vmax.name);
    assert.equal(ours.active.energies.cards.length, 3,
      'Underworld Door Energy must remain attached after promotion');
    assert.ok(ours.bench.some(slot => slot.getPokemonCard()?.name === flutter.name),
      'Flutter Mane must be Benched after retreat');
    assert.ok(powers(theirs, thorns).includes('Initialization'),
      'Iron Thorns Initialization must resume after Flutter Mane leaves Active');
    assert.ok(!powers(ours, vmax).includes('Underworld Door'),
      'Rule Box VMAX must be suppressed after Initialization resumes');
    store.dispatch(new AttackAction(ours.id, 'Max Geist'));
    assert.equal(state.playerLastAttack[ours.id]?.attack?.name, 'Max Geist');
    for (let i = 0; i < 8 && theirs.active.damage === 0; i += 1) {
      const wait = state.prompts.find(item =>
        item.result === undefined && item.constructor.name === 'WaitPrompt');
      if (!wait) break;
      store.dispatch(new ResolvePromptAction(wait.id, null));
    }
    attackDamage = theirs.active.damage;
    assert.equal(attackDamage, 100,
      'Three Psychic Energy must resolve 100 Max Geist damage after the retreat');
  } else {
    assert.equal(ours.active.getPokemonCard().name, flutter.name);
    assert.ok(!powers(theirs, thorns).includes('Initialization'),
      'Flutter Mane continues suppressing Initialization when retreat is unavailable');
    assert.ok(powers(ours, vmax).includes('Underworld Door'),
      'Underworld Door remains available while Flutter Mane stays Active');
  }

  return {
    ...options,
    retreatCost: retreatCost.cost.length,
    retreated,
    retreatError,
    attackDamage,
    cardsDrawn: 2,
    vmaxEnergyAfter: (retreated ? ours.active : vmaxSlot).energies.cards.length,
    initializationAfter: powers(theirs, thorns).includes('Initialization'),
    underworldDoorAfter: powers(ours, vmax).includes('Underworld Door')
  };
}

/**
 * Check that Flutter Mane's Active-only Ability can release Radiant Eternatus
 * Climactic Gate against Iron Thorns. This uses the pinned native Store's
 * PlayPokemonEffect; the existing research-owned gate-lock hook corrects a
 * known upstream ability-lock visibility defect without editing vendor code.
 * @param {{seat:0|1,flutterActive:boolean}} options
 */
function runRadiantGateCase(options) {
  const { Store } = engine('game/store/store');
  const { State, GamePhase } = engine('game/store/state/state');
  const { Player } = engine('game/store/state/player');
  const { PokemonCardList } = engine('game/store/state/pokemon-card-list');
  const { PlayPokemonEffect } = engine('game/store/effects/play-card-effects');
  const { CheckPokemonPowersEffect } = engine('game/store/effects/check-effects');
  const { ConfirmPrompt } = engine('game/store/prompts/confirm-prompt');
  const { GameSettings } = engine('game/core/game-settings');

  const get = getCards();
  const ours = new Player();
  ours.id = 801 + options.seat;
  const theirs = new Player();
  theirs.id = 901 + options.seat;
  const flutter = get('Flutter Mane TEF');
  const thorns = get('Iron Thorns ex TWM');
  const fallback = get('Shadow Rider Calyrex V CRE');
  if (options.flutterActive) {
    ours.active.cards.push(flutter);
  } else {
    ours.active.cards.push(fallback);
    const flutterSlot = new PokemonCardList();
    flutterSlot.cards.push(flutter);
    ours.bench.push(flutterSlot);
  }
  theirs.active.cards.push(thorns);

  const gateTarget = new PokemonCardList();
  ours.bench.push(gateTarget, new PokemonCardList(), new PokemonCardList());
  const radiant = get('Radiant Eternatus CRZ');
  ours.hand.cards.push(radiant);
  ours.deck.cards.push(
    get('Shadow Rider Calyrex VMAX CRE'),
    get('Shadow Rider Calyrex VMAX CRE'),
    get('Psychic Energy SVE')
  );

  const store = new Store({ onStateChange() {} });
  const state = new State();
  const settings = new GameSettings();
  state.gameSettings = settings;
  state.rules = settings.rules;
  state.phase = GamePhase.WAITING_FOR_PLAYERS;
  state.turn = 3;
  state.players = options.seat === 0 ? [ours, theirs] : [theirs, ours];
  state.activePlayer = options.seat;
  store.state = state;

  const thornsCheck = new CheckPokemonPowersEffect(theirs, thorns);
  store.reduceEffect(state, thornsCheck);
  const initializationVisible = thornsCheck.powers.some(power => power.name === 'Initialization');
  store.reduceEffect(state, new PlayPokemonEffect(ours, radiant, gateTarget));
  const gatePrompt = state.prompts.some(prompt =>
    prompt instanceof ConfirmPrompt && prompt.result === undefined);
  return {
    ...options,
    initializationVisible,
    gatePrompt,
    radiantBenched: gateTarget.cards.includes(radiant)
  };
}

function runTest() {
  const restoreJammer = installToolJammerHook();
  const restoreGate = installRadiantGateLockHook();
  try {
    const actionCases = [];
    for (const seat of [0, 1]) {
      actionCases.push(runActionCase({ seat, latias: true, jammer: false }));
      actionCases.push(runActionCase({ seat, latias: true, jammer: true }));
      actionCases.push(runActionCase({ seat, latias: false, jammer: true }));
    }
    const gateCases = [];
    for (const seat of [0, 1]) {
      gateCases.push(runRadiantGateCase({ seat, flutterActive: true }));
      gateCases.push(runRadiantGateCase({ seat, flutterActive: false }));
    }
    assert.ok(actionCases.filter(row => row.latias).every(row =>
      row.retreated && row.attackDamage === 100 && row.initializationAfter &&
      !row.underworldDoorAfter));
    assert.ok(actionCases.filter(row => !row.latias).every(row =>
      !row.retreated && !row.initializationAfter && row.underworldDoorAfter));
    assert.ok(gateCases.filter(row => row.flutterActive).every(row =>
      !row.initializationVisible && row.gatePrompt && row.radiantBenched));
    assert.ok(gateCases.filter(row => !row.flutterActive).every(row =>
      row.initializationVisible && !row.gatePrompt && row.radiantBenched));
    return { actionCases, gateCases };
  } finally {
    restoreGate();
    restoreJammer();
  }
}

if (require.main === module) {
  console.log(JSON.stringify({
    kind: 'staged-flutter-mane-latias-iron-thorns-and-radiant-gate-actions',
    engine: 'twinleadgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    cases: runTest()
  }, null, 2));
}

module.exports = { runActionCase, runRadiantGateCase, runTest };
