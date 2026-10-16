'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');
const {installDamagePumpSingleSourceHook} =
  require('../simulation/twinleaf/damage-pump-single-source-hook.cjs');

const root = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const engine = name => require(path.join(root, name));
const {Store} = engine('game/store/store');
const {Player} = engine('game/store/state/player');
const {PokemonCardList} = engine('game/store/state/pokemon-card-list');
const {CardList} = engine('game/store/state/card-list');
const {GamePhase} = engine('game/store/state/state');
const {GameSettings} = engine('game/core/game-settings');
const {PlayCardAction,PlayerType,SlotType} =
  engine('game/store/actions/play-card-action');
const {ResolvePromptAction} =
  engine('game/store/actions/resolve-prompt-action');

const target = index => ({
  player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index
});
const boardTarget = {
  player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
};

/**
 * Staged legal-card board with a live Store, Risky Ruins, two Exeggcute and
 * exactly six defender Prize cards. This is an effect test, not a
 * randomized 60-card opening.
 * @returns {object} Store and card references
 */
function setup() {
  const manager = initializeCards();
  let id = 7000;
  /** @param {string} fullname @returns {object} Fresh pinned card instance. */
  const card = fullname => {
    const value = manager.getCardByName(fullname);
    assert.ok(value, 'Missing card ' + fullname);
    value.id = id++;
    return value;
  };
  const store = new Store({onStateChange() {}});
  const state = store.state;
  const settings = new GameSettings();
  state.gameSettings = settings;
  state.rules = settings.rules;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 3;
  state.activePlayer = 0;
  const attacker = new Player();
  attacker.id = 101;
  attacker.name = 'Meloetta';
  attacker.active.cards.push(card('Meloetta ex SV11B'));
  const defender = new Player();
  defender.id = 202;
  defender.name = 'Opponent';
  defender.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const prize = () => {
    const pile = new CardList();
    pile.cards.push(card('Psychic Energy SVE'));
    return pile;
  };
  attacker.prizes = Array.from({length: 6}, prize);
  defender.prizes = Array.from({length: 6}, prize);
  state.players = [attacker, defender];
  attacker.stadium.cards.push(card('Risky Ruins MEG'));
  const donorNames = ['Unown AOR','Squawkabilly ex PAL','Dedenne-GX UNB'];
  const donors = donorNames.map(name => {
    const slot = new PokemonCardList();
    slot.cards.push(card(name));
    slot.damage = 20;
    attacker.bench.push(slot);
    return slot;
  });
  attacker.bench.push(new PokemonCardList(),new PokemonCardList());
  const eggs = [card('Exeggcute PLF'),card('Exeggcute PLF')];
  const pumps = [card('Damage Pump LOR'),card('Damage Pump LOR'),
    card('Damage Pump LOR')];
  attacker.hand.cards.push(...eggs,...pumps);
  return {store,state,attacker,defender,donors,eggs,pumps};
}

/** @param {object} f @param {object} card @param {object} location */
function play(f,card,location) {
  const handIndex=f.attacker.hand.cards.indexOf(card);
  assert.notEqual(handIndex,-1,'Expected card in staged hand: '+card.name);
  f.store.dispatch(new PlayCardAction(f.attacker.id,handIndex,location));
}

/** @param {object} f @returns {object|undefined} */
function pending(f) {
  return f.state.prompts.find(p=>p.result===undefined);
}

/** @param {object} f @param {number} count */
function claimPrizes(f,count) {
  const prompt=pending(f);
  assert.ok(prompt,'Expected Prize selection prompt');
  assert.equal(prompt.constructor.name,'ChoosePrizePrompt');
  assert.equal(prompt.options.count,count);
  const choices=f.defender.prizes.filter(p=>p.cards.length>0).slice(0,count);
  assert.equal(prompt.validate(choices,f.state),true);
  f.store.dispatch(new ResolvePromptAction(prompt.id,choices));
}

test('live legal Damage Pump produces two Exeggcute self-KOs and two opponent Prizes',()=>{
  const restore=installDamagePumpSingleSourceHook();
  try {
    const f=setup();
    play(f,f.eggs[0],target(3));
    play(f,f.eggs[1],target(4));
    assert.deepEqual(f.attacker.bench.slice(3,5).map(s=>s.damage),[20,20]);
    play(f,f.pumps[0],boardTarget);
    const prompt=pending(f);
    assert.equal(prompt?.constructor.name,'MoveDamagePrompt');
    const legal=[
      {from:target(0),to:target(3)},
      {from:target(0),to:target(4)}
    ];
    assert.equal(prompt.validate(legal,f.state),true);
    f.store.dispatch(new ResolvePromptAction(prompt.id,legal));
    claimPrizes(f,2);
    assert.equal(f.defender.getPrizeLeft(),4);
    assert.equal(f.attacker.discard.cards.filter(c=>c.name==='Exeggcute').length,2);
    assert.equal(f.attacker.bench[3].cards.length,0);
    assert.equal(f.attacker.bench[4].cards.length,0);
    assert.equal(f.donors[0].damage,0);
  } finally {restore();}
});
