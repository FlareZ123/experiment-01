'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');

const compiled = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const engine = name => require(path.join(compiled, name));

/**
 * Exact candidate Special Energy printing and a source-like Psychic board.
 * No card choice is made on the owner's behalf by this witness.
 * @param {boolean} telepath Whether to attach the Special Energy or a Basic.
 */
function scene(telepath) {
  const manager = initializeCards();
  const {Store} = engine('game/store/store');
  const {Player} = engine('game/store/state/player');
  const {CardList} = engine('game/store/state/card-list');
  const {GamePhase} = engine('game/store/state/state');
  const {Format} = engine('game/store/card/card-types');
  const {PlayCardAction, PlayerType, SlotType} =
    engine('game/store/actions/play-card-action');
  let id = 70000;
  /** @param {string} printing */
  const card = printing => {
    const c = manager.getCardByName(printing);
    assert.ok(c, 'Pinned printing absent: ' + printing);
    c.id = id++;
    return c;
  };
  const store = new Store({onStateChange() {}});
  const state = store.state;
  const owner = new Player(), opponent = new Player();
  owner.id=101; opponent.id=202;
  state.players=[owner,opponent];
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=2;
  state.activePlayer=0;
  state.gameSettings.format=Format.EXPANDED;
  owner.active.cards.push(card('Mewtwo & Mew-GX UNM'));
  opponent.active.cards.push(card('Bunnelby PRC'));
  owner.hand.cards.push(card('Telepath [P] Energy M3'),card('Psychic Energy MEE'));
  const available = [
    card('Duskull VIV'),
    card('Unown AOR')
  ];
  owner.deck.cards.push(...available);
  for (const player of state.players) {
    for (let i=0;i<12;i++) player.deck.cards.push(card('Psychic Energy MEE'));
    for (let i=0;i<6;i++) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      player.prizes.push(prize);
    }
  }
  const chosen = telepath ? 0 : 1;
  const name = owner.hand.cards[chosen].fullName;
  store.dispatch(new PlayCardAction(owner.id,chosen,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  return {state:store.state,owner,available,name,store};
}

test('pinned Telepath Psychic hand attachment exposes its owner deck search', () => {
  const {owner,state,store,available,name}=scene(true);
  assert.equal(name,'Telepath [P] Energy M3');
  assert.equal(owner.energyPlayedTurn,2);
  assert.ok(owner.active.energies.cards.some(c=>c.fullName===name));
  const unresolved=state.prompts.filter(p=>p.result===undefined);
  assert.ok(unresolved.length>0,'Expected authentic Telepath owner deck-search prompt');
  assert.ok(unresolved.some(p=>p.constructor.name==='ChooseCardsPrompt'),
    'Printed Telepath search is implemented as ChooseCardsPrompt in pinned Store');
  assert.ok(available.every(c=>owner.deck.cards.includes(c)));
  assert.equal(store.hasPrompts(),true);
});

test('same printed Psychic target with a Basic attachment exposes no search prompt',()=>{
  const {state,owner,name,store}=scene(false);
  assert.equal(name,'Psychic Energy MEE');
  assert.equal(owner.energyPlayedTurn,2);
  assert.ok(owner.active.energies.cards.some(c=>c.fullName===name));
  assert.equal(state.prompts.filter(p=>p.result===undefined).length,0);
  assert.equal(store.hasPrompts(),false);
});
