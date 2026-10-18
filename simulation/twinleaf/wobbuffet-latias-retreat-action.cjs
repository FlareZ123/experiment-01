'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { installToolJammerHook } = require('./tool-jammer-hook.cjs');

/**
 * Staged turn-3 Store test of a legal Wobbuffet -> charged Shadow Rider VMAX
 * retreat, after a real Underworld Door attachment/draw. Each configuration
 * creates fresh game objects; this is not a source-dealt match.
 * @param {{latias:boolean,jammer:boolean,floatStone:boolean,extraWobbuffetPsychic?:boolean}} options
 */
function runCase(options) {
  const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const engine = name => require(path.join(output, name));
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

  const manager = initializeCards();
  const get = name => {
    const item = manager.getCardByName(name);
    assert.ok(item, 'Missing pinned card: ' + name);
    return item;
  };
  const ours = new Player();
  ours.id = 101;
  ours.name = 'Temple';
  const theirs = new Player();
  theirs.id = 202;
  theirs.name = 'Iron Thorns';
  // A live PLAYER_TURN Store check requires nonempty Prize zones; otherwise
  // both zero-Prize players trigger sudden-death re-setup after the prompt.
  ours.prizes = [new CardList()];
  theirs.prizes = [new CardList()];
  ours.prizes[0].cards.push(get('Psychic Energy SVE'));
  theirs.prizes[0].cards.push(get('Psychic Energy SVE'));
  const wobbuffet = get('Wobbuffet PHF');
  const thorns = get('Iron Thorns ex TWM');
  const vmax = get('Shadow Rider Calyrex VMAX CRE');
  ours.active.cards.push(wobbuffet);
  if (options.extraWobbuffetPsychic) {
    const booster = get('Psychic Energy SVE');
    ours.active.cards.push(booster);
    ours.active.energies.cards.push(booster);
  }
  theirs.active.cards.push(thorns);
  if (options.jammer) theirs.active.tools.push(get('Tool Jammer BST'));
  if (options.floatStone) ours.active.tools.push(get('Float Stone BKT'));
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
  // Match the pinned engine's BOTTOM_PLAYER target mapping used by Door.
  state.players = [theirs, ours];
  state.turn = 3;
  state.activePlayer = 1;
  state.phase = GamePhase.PLAYER_TURN;

  const powers = (player, pokemon) => {
    const check = new CheckPokemonPowersEffect(player, pokemon);
    store.reduceEffect(state, check);
    return check.powers.map(p => p.name);
  };
  assert.ok(!powers(theirs, thorns).includes('Initialization'),
    'Active Wobbuffet should disable opposing Initialization');
  assert.ok(powers(ours, vmax).includes('Underworld Door'),
    'Active Wobbuffet should retain Psychic VMAX ability');
  store.reduceEffect(state, new PowerEffect(ours, vmax.powers[0], vmax, vmaxSlot));
  const prompt = state.prompts.find(p => p.result === undefined);
  assert.ok(prompt instanceof AttachEnergyPrompt, 'Underworld Door attachment prompt');
  store.dispatch(new ResolvePromptAction(prompt.id, [{
    to: { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: vmaxIndex },
    card: energy
  }]));
  if (vmaxSlot.energies.cards.length !== 3) {
    console.log(JSON.stringify({
      diagnostic: 'unexpected-post-door-energy-state',
      options,
      stage: state.phase,
      prompts: state.prompts.map(p => ({ type: p.constructor.name, id: p.id, result: p.result })),
      ours: {
        active: { cards: ours.active.cards.map(c => c.name), hp: ours.active.hp },
        bench: ours.bench.map(slot => ({
          pokemon: slot.getPokemonCard()?.name, hp: slot.hp,
          cards: slot.cards.map(c => c.name),
          indexedEnergy: slot.energies.cards.map(c => c.name)
        })),
        discard: ours.discard.cards.map(c => c.name),
        hand: ours.hand.cards.map(c => c.name),
        deck: ours.deck.cards.map(c => c.name)
      }
    }, null, 2));
  }
  assert.equal(vmaxSlot.energies.cards.length, 3);
  assert.equal(ours.hand.cards.length, 2, 'Underworld Door must draw two cards');

  const cost = new CheckRetreatCostEffect(ours);
  store.reduceEffect(state, cost);
  let retreated = true;
  let retreatError = null;
  try {
    store.dispatch(new RetreatAction(ours.id, vmaxIndex));
  } catch (error) {
    retreated = false;
    retreatError = String(error.message);
  }

  const expectedRetreat = options.latias || (options.floatStone && !options.jammer);
  assert.equal(retreated, expectedRetreat, JSON.stringify({ options, retreatError }));
  assert.equal(cost.cost.length, expectedRetreat ? 0 : 2,
    'Retreat cost must distinguish Latias from Tool Jammer suppressed Float Stone');
  let attackDamage = null;
  if (retreated) {
    assert.equal(ours.active.getPokemonCard().name, vmax.name);
    assert.equal(ours.active.energies.cards.length, 3,
      'Underworld Door and previously attached Energy must survive promotion');
    assert.ok(ours.bench.some(slot => slot.getPokemonCard()?.name === wobbuffet.name),
      'Wobbuffet must be Benched');
    assert.ok(powers(theirs, thorns).includes('Initialization'),
      'Initialization must resume when Wobbuffet leaves Active');
    assert.ok(!powers(ours, vmax).includes('Underworld Door'),
      'Rule Box VMAX must become suppressed by resumed Initialization');
    store.dispatch(new AttackAction(ours.id, 'Max Geist'));
    assert.equal(state.playerLastAttack[ours.id]?.attack?.name, 'Max Geist');
    for (let i = 0; i < 8 && theirs.active.damage === 0; i++) {
      const wait = state.prompts.find(p =>
        p.result === undefined && p.constructor.name === 'WaitPrompt');
      if (!wait) break;
      store.dispatch(new ResolvePromptAction(wait.id, null));
    }
    attackDamage = theirs.active.damage;
    const expectedAttackDamage = options.extraWobbuffetPsychic ? 130 : 100;
    if (attackDamage !== expectedAttackDamage) {
      console.log(JSON.stringify({
        attackDiagnostic: true, phase: state.phase, turn: state.turn,
        activePlayer: state.activePlayer,
        active: ours.active.getPokemonCard()?.name,
        energy: ours.active.energies.cards.map(c => c.name),
        opponentActive: theirs.active.getPokemonCard()?.name,
        opposingDamage: theirs.active.damage,
        prompts: state.prompts.filter(p => p.result === undefined)
          .map(p => p.constructor.name)
      }));
    }
    assert.equal(attackDamage, expectedAttackDamage,
      'Max Geist must count Psychic Energy retained on the Benched Wobbuffet');
  } else {
    assert.equal(ours.active.getPokemonCard().name, wobbuffet.name);
    assert.equal(vmaxSlot.energies.cards.length, 3);
    assert.equal(ours.hand.cards.length, 2);
  }

  return {
    options, retreatCost: cost.cost.length, retreated, retreatError,
    activeAfter: ours.active.getPokemonCard().name,
    vmaxEnergyAfter: (retreated ? ours.active : vmaxSlot).energies.cards.length,
    cardsDrawn: 2,
    attackDamage,
    thornsInitializationAfter: powers(theirs, thorns).includes('Initialization'),
    vmaxUnderworldDoorAfter: powers(ours, vmax).includes('Underworld Door')
  };
}

function runTest() {
  const rows = [
    { latias: true, jammer: false, floatStone: false },
    { latias: true, jammer: true, floatStone: false },
    { latias: true, jammer: true, floatStone: true },
    { latias: false, jammer: false, floatStone: true },
    { latias: false, jammer: true, floatStone: true },
    { latias: false, jammer: false, floatStone: false },
    { latias: true, jammer: true, floatStone: false, extraWobbuffetPsychic: true },
    { latias: false, jammer: false, floatStone: true, extraWobbuffetPsychic: true }
  ];
  const restore = installToolJammerHook();
  try {
    return rows.map(runCase);
  } finally {
    restore();
  }
}

if (require.main === module) {
  console.log(JSON.stringify({
    kind: 'staged-wobbuffet-latias-underworld-door-retreat-action',
    engine: 'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    cases: runTest()
  }, null, 2));
}
module.exports = { runCase, runTest };
