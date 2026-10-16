'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {installForestSealSearchHook} = require('./forest-seal-search-hook.cjs');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const mod = name => require(path.join(output, name));

/**
 * Prepared-board actual Store-action test. The previous Budew lock is produced
 * by its printed attack reducer. Star Alchemy is resolved via actual Store
 * prompts with the opt-in unlimited-name mandatory search correction.
 * @param {{path?:boolean,rangerPrized?:boolean,supporterSpent?:boolean}} options
 */
function probeStoneRanger(options = {}) {
  const cards = initializeCards();
  let nextId = 1;
  const card = name => {
    const c = cards.getCardByName(name);
    assert.ok(c, 'Pinned source printing missing: ' + name);
    c.id = nextId++;
    return c;
  };
  const {Store} = mod('game/store/store');
  const {Player} = mod('game/store/state/player');
  const {CardList} = mod('game/store/state/card-list');
  const {PokemonCardList} = mod('game/store/state/pokemon-card-list');
  const {GamePhase} = mod('game/store/state/state');
  const {Format} = mod('game/store/card/card-types');
  const {AttackEffect, PowerEffect} = mod('game/store/effects/game-effects');
  const {CheckPokemonPowersEffect} = mod('game/store/effects/check-effects');
  const {PlayCardAction,PlayerType,SlotType} = mod('game/store/actions/play-card-action');
  const {ResolvePromptAction} = mod('game/store/actions/resolve-prompt-action');
  const store = new Store({onStateChange(){}});
  const state = store.state;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 4;
  state.activePlayer = 1;
  state.gameSettings.format = Format.EXPANDED;
  const opponent = new Player(); opponent.id = 101;
  const defender = new Player(); defender.id = 202;
  state.players = [opponent, defender];
  const budew = card('Budew ASC');
  opponent.active.cards.push(budew);
  if (options.path) opponent.stadium.cards.push(card('Path to the Peak CRE'));
  defender.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const benchV = new PokemonCardList();
  benchV.cards.push(card('Shadow Rider Calyrex V CRE'));
  defender.bench.push(benchV);
  const stone = card('Forest Seal Stone SIT');
  const ranger = card('Pokemon Ranger STS');
  const item = card('Switch SVI');
  defender.hand.cards.push(stone,item);
  defender.deck.cards.push(card('Psychic Energy SVE'),
    ...(options.rangerPrized ? [] : [ranger]),
    card('Psychic Energy SVE'), card('Psychic Energy SVE'));
  opponent.deck.cards.push(card('Psychic Energy SVE'));
  for (const side of state.players) {
    for (let i=0; i<6; i++) {
      const prize = new CardList();
      prize.cards.push(options.rangerPrized && side === defender && i === 0
        ? ranger : card('Psychic Energy SVE'));
      side.prizes.push(prize);
    }
  }
  budew.reduceEffect(store,state,new AttackEffect(opponent,defender,budew.attacks[0]));
  assert.equal(defender.cannotPlayItemCards,true);
  if(options.supporterSpent) defender.supporterTurn = state.turn;
  const play = (c,target) => {
    const index = defender.hand.cards.indexOf(c);
    assert.ok(index >= 0, 'Played card is in hand');
    store.dispatch(new PlayCardAction(defender.id,index,target));
  };
  const pending=()=>state.prompts.find(p=>p.result===undefined);
  const resolve = answer => {const p=pending();assert.ok(p);store.dispatch(new ResolvePromptAction(p.id,answer));};
  play(stone,{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0});
  assert.ok(benchV.tools.includes(stone),'Stone must legally attach under the Item lock');
  assert.equal(defender.cannotPlayItemCards,true);
  const powers=new CheckPokemonPowersEffect(defender,benchV.getPokemonCard());
  store.reduceEffect(state,powers);
  assert.ok(powers.powers.some(p=>p.name==='Star Alchemy'),
    'Star Alchemy must remain available while Item lock is active');
  store.reduceEffect(state,new PowerEffect(defender,stone.powers[0],stone,benchV));
  const select=pending();
  assert.equal(select?.constructor.name,'ChooseCardsPrompt');
  assert.equal(select.options.min,1);
  const chosen=options.rangerPrized ? [defender.deck.cards[0]] : [ranger];
  assert.equal(select.validate(chosen),true);
  resolve(chosen);
  while(pending()) {
    const p=pending();
    if(p.constructor.name==='ShuffleDeckPrompt') resolve(Array.from({length:defender.deck.cards.length},(_,i)=>i));
    else if(p.constructor.name==='ShowCardsPrompt') resolve(true);
    else throw Error('Unexpected power prompt: '+p.constructor.name);
  }
  assert.equal(defender.usedVSTAR,true);
  const rangerInHand=defender.hand.cards.includes(ranger);
  let rangerPlayed=false;
  if(rangerInHand&&!options.supporterSpent){
    play(ranger,{player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
    rangerPlayed=true;
  }
  assert.equal(defender.cannotPlayItemCards,!rangerPlayed);
  let itemPrompt=null;
  if(rangerPlayed){
    play(item,{player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
    itemPrompt=pending()?.constructor.name||null;
    assert.equal(itemPrompt,'ChoosePokemonPrompt');
  }
  return {options,stoneAttached:benchV.tools.includes(stone),
    starAlchemyVisible:powers.powers.some(p=>p.name==='Star Alchemy'),
    rangerInHand,rangerPlayed,itemLockedAfter: defender.cannotPlayItemCards,
    usedVSTAR:defender.usedVSTAR,itemPrompt};
}

function runFixture() {
  const restore=installForestSealSearchHook();
  try {
    const rows=[{}, {path:true}, {rangerPrized:true}, {supporterSpent:true}]
      .map(probeStoneRanger);
    for(const r of rows){
      assert.equal(r.stoneAttached,true);
      assert.equal(r.starAlchemyVisible,true);
      assert.equal(r.usedVSTAR,true);
      assert.equal(r.rangerPlayed,!r.options.rangerPrized&&!r.options.supporterSpent);
      assert.equal(r.itemPrompt,r.rangerPlayed?'ChoosePokemonPrompt':null);
    }
    return {pinned:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      scope:'staged board actual Store actions/effects, no full match or bot policy',rows};
  } finally { restore(); }
}
if(require.main===module)console.log(JSON.stringify(runFixture(),null,2));
module.exports={probeStoneRanger,runFixture};
