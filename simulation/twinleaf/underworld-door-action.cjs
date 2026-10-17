'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { installToolJammerHook } = require('./tool-jammer-hook.cjs');

/**
 * An exact midgame action probe of the protected Underworld Door:
 * announce PowerEffect, resolve its Energy-attachment prompt and verify both
 * attachment and the two-card draw. Full-turn setup rules are outside scope.
 *
 * @param {{hood:boolean,jammer:boolean,active:boolean,garbodorPrint?:'BKP'|'LTR',garbodorTool?:boolean,stadium?:string,wobbuffetActive?:boolean}} options
 * @returns {{allowed:boolean, attached:number, drawn:number, handCount:number}}
 */
function underworldDoorAction(options) {
  const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const engine = name => require(path.join(root, name));
  const { Store } = engine('game/store/store');
  const { State } = engine('game/store/state/state');
  const { Player } = engine('game/store/state/player');
  const { PokemonCardList } = engine('game/store/state/pokemon-card-list');
  const { PowerEffect } = engine('game/store/effects/game-effects');
  const { ResolvePromptAction } = engine('game/store/actions/resolve-prompt-action');
  const { AttachEnergyPrompt } = engine('game/store/prompts/attach-energy-prompt');
  const { PlayerType, SlotType } = engine('game/store/actions/play-card-action');

  const manager = initializeCards();
  const get = fullname => {
    const value = manager.getCardByName(fullname);
    assert.ok(value, 'Pinned engine card missing ' + fullname);
    return value;
  };
  const locker = new Player();
  locker.id = 101;
  if (options.garbodorPrint) {
    locker.active.cards.push(get('Shadow Rider Calyrex V CRE'));
    const garbodorSlot = new PokemonCardList();
    garbodorSlot.cards.push(get('Trubbish BKP'), get('Garbodor ' + options.garbodorPrint));
    if (options.garbodorTool !== false) {
      garbodorSlot.tools.push(get('Stealthy Hood UNB'));
    }
    locker.bench.push(garbodorSlot);
  } else {
    locker.active.cards.push(get('Iron Thorns ex TWM'));
    if (options.jammer) locker.active.tools.push(get('Tool Jammer BST'));
  }

  if (options.stadium) locker.stadium.cards.push(get(options.stadium));

  const player = new Player();
  player.id = 202;
  const vmaxSlot = new PokemonCardList();
  vmaxSlot.cards.push(get('Shadow Rider Calyrex V CRE'));
  const vmax = get('Shadow Rider Calyrex VMAX CRE');
  vmaxSlot.cards.push(vmax);
  if (options.hood) vmaxSlot.tools.push(get('Stealthy Hood UNB'));

  const other = new PokemonCardList();
  other.cards.push(get('Shadow Rider Calyrex V CRE'));
  if (options.wobbuffetActive) {
    const wobSlot = new PokemonCardList();
    wobSlot.cards.push(get('Wobbuffet PHF'));
    player.active = wobSlot;
    player.bench.push(vmaxSlot, other);
  } else if (options.active) {
    player.active = vmaxSlot;
    player.bench.push(other);
  } else {
    player.active = other;
    player.bench.push(vmaxSlot);
  }
  const psychic = get('Psychic Energy SVE');
  player.hand.cards.push(psychic);
  player.deck.cards.push(get('Psychic Energy SVE'), get('Psychic Energy SVE'));
  const initialDeck = player.deck.cards.length;

  const state = new State();
  state.players = [locker, player];
  const store = new Store({onStateChange() {}});
  store.state = state;
  const target = player.bench[0];

  let allowed = true;
  let blockedReason;
  try {
    store.reduceEffect(state, new PowerEffect(player, vmax.powers[0], vmax, vmaxSlot));
  } catch (error) {
    allowed = false;
    blockedReason = String(error.message);
    assert.ok(/BLOCKED|CANNOT_USE_POWER|UNKNOWN_POWER/.test(String(error.message)),
      'Unexpected Ability failure: ' + String(error.message));
  }
  if (!allowed) {
    assert.equal(state.prompts.filter(p => p.result === undefined).length, 0);
    return { allowed, blockedReason, attached: 0, drawn: 0, handCount: player.hand.cards.length };
  }

  const pending = state.prompts.find(p => p.result === undefined);
  assert.ok(pending instanceof AttachEnergyPrompt, 'Underworld Door must request Energy attachment');
  store.dispatch(new ResolvePromptAction(pending.id, [{
    to: {player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0},
    card: psychic
  }]));
  return {
    allowed,
    attached: target.energies.cards.filter(c => c.name === 'Psychic Energy').length,
    drawn: initialDeck - player.deck.cards.length,
    handCount: player.hand.cards.length
  };
}

/** @returns {object} Deterministic raw source and patched effect traces. */
function runTest() {
  const cases = [
    {hood:true,jammer:false,active:false,allowed:true},
    {hood:true,jammer:true,active:false,allowed:true},
    {hood:true,jammer:true,active:true,allowed:false},
    {hood:false,jammer:true,active:false,allowed:false},
    {hood:false,jammer:false,active:false,wobbuffetActive:true,allowed:false},
    {hood:false,jammer:true,active:false,wobbuffetActive:true,allowed:false},
    {hood:true,jammer:false,active:false,garbodorPrint:'BKP',allowed:true},
    {hood:true,jammer:false,active:false,garbodorPrint:'LTR',allowed:true},
    {hood:false,jammer:false,active:false,garbodorPrint:'BKP',allowed:false},
    {hood:false,jammer:false,active:false,garbodorPrint:'LTR',allowed:false},
    {hood:false,jammer:false,active:false,garbodorPrint:'BKP',garbodorTool:false,allowed:true},
    {hood:true,jammer:false,active:false,stadium:'Path to the Peak CRE',allowed:false},
    {hood:true,jammer:true,active:false,stadium:'Jamming Tower TWM',allowed:false}
  ];
  const restore = installToolJammerHook();
  try {
    return cases.map(row => {
      const result = underworldDoorAction(row);
      assert.equal(result.allowed, row.allowed, JSON.stringify(row));
      assert.equal(result.attached, row.allowed ? 1 : 0, JSON.stringify(row));
      assert.equal(result.drawn, row.allowed ? 2 : 0, JSON.stringify(row));
      assert.equal(result.handCount, row.allowed ? 2 : 1, JSON.stringify(row));
      return {...row, result};
    });
  } finally {
    restore();
  }
}

if (require.main === module) {
  console.log(JSON.stringify({
    kind:'midgame-underworld-door-full-action',
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    cases:runTest()
  }, null, 2));
}

module.exports = {underworldDoorAction, runTest};
