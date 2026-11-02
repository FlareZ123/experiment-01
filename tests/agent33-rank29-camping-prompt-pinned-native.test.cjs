'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {DCE,THUNDER,chooseRank29TwoPieceCampingSearch}=
  require('../simulation/twinleaf/agent33-rank29-camping-attackpair-target.cjs');
const {chooseActualCampingGearCard}=
  require('../simulation/twinleaf/agent12-native-campinggear-after-pass.cjs');

const BASE=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(BASE,name));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {Card}=native('game/store/card/card');
const {CardList}=native('game/store/state/card-list');
const {GamePhase}=native('game/store/state/state');
const {PlayCardAction,PlayerType,SlotType}=
  native('game/store/actions/play-card-action');
const {ResolvePromptAction}=
  native('game/store/actions/resolve-prompt-action');

function stage(seat){
  const manager=initializeCards();
  const get=printing=>{
    const card=manager.getCardByName(printing);
    assert.ok(card,'Pinned exact printing unavailable: '+printing);
    return card;
  };
  const store=new Store({onStateChange(){}});
  const state=store.state,players=[new Player(),new Player()];
  players[0].id=101;players[1].id=202;
  for(const [index,player] of players.entries()){
    player.active.cards.push(get(index===seat?'Iron Thorns ex TWM':'Dratini OBF'));
    player.deck.cards.push(...Array.from({length:16},()=>new Card()));
    player.prizes=Array.from({length:6},()=>{
      const slot=new CardList();
      slot.cards.push(new Card());
      return slot;
    });
  }
  const owner=players[seat];
  owner.hand.cards.push(get(DCE),get('Camping Gear BST'));
  owner.deck.cards.push(get(THUNDER),
    get('Guzma & Hala CEC'),get('Speed Lightning Energy RCL'));
  state.players=players;
  state.activePlayer=seat;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=5;
  store.state=state;
  return {store,owner,opponent:players[1-seat],seat};
}

/**
 * Use a real physical Camping Gear Item in a staged pinned Store, then
 * resolve its generated own-deck one-card prompt with the selected policy.
 */
function run(seat,mode){
  const {store,owner,opponent}=stage(seat);
  const initialOpponentHand=opponent.hand.cards.length;
  const gearIndex=owner.hand.cards.findIndex(card=>
    card.fullName==='Camping Gear BST');
  assert.ok(gearIndex>=0);
  store.dispatch(new PlayCardAction(owner.id,gearIndex,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  const prompt=store.state.prompts.find(p=>
    p.constructor?.name==='ChooseCardsPrompt'&&
    p.result===undefined&&p.cards===owner.deck);
  assert.ok(prompt,'Real native own-deck Camping Gear search prompt absent');
  assert.equal(prompt.playerId,owner.id);
  const observed=actorObservation(store.state,seat);
  assert.equal(observed.decisionKind,'owner-prompt');
  assert.equal(observed.ownHand.includes(DCE),true);
  const candidate=mode==='adaptive'?
    chooseRank29TwoPieceCampingSearch(observed,prompt.cards.cards,
      cards=>prompt.validate(cards,store.state)):
    null;
  const selected=mode==='adaptive'?candidate?.physical:
    chooseActualCampingGearCard(prompt,store.state);
  assert.ok(selected,'Missing native-valid prompt selection');
  assert.equal(prompt.validate([selected],store.state),true);
  const before=owner.deck.cards.length;
  store.dispatch(new ResolvePromptAction(prompt.id,[selected]));
  assert.equal(owner.hand.cards.includes(selected),true,
    'Physical selected card must reach owner hand');
  assert.equal(owner.deck.cards.includes(selected),false);
  assert.equal(owner.deck.cards.length,before-1);
  assert.equal(opponent.hand.cards.length,initialOpponentHand);
  return {selected:selected.fullName,mode,seat,
    ownSearchPromptObserved:true,
    physicalMoved:true,
    turnEndObserved:store.state.activePlayer!==seat||
      store.state.phase!==GamePhase.PLAYER_TURN};
}

for(const seat of [0,1]){
  test('pinned native Camping Gear fixed-vs-missing-Thunder search seat '+seat,()=>{
    const fixed=run(seat,'fixed');
    const adaptive=run(seat,'adaptive');
    assert.equal(fixed.selected,'Guzma & Hala CEC');
    assert.equal(adaptive.selected,THUNDER);
    assert.equal(fixed.turnEndObserved,true);
    assert.equal(adaptive.turnEndObserved,true);
  });
}
