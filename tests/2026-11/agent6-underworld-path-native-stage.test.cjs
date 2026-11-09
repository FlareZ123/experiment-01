'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../../simulation/twinleaf/headless.cjs');
const {actorObservation}=
  require('../../simulation/twinleaf/actor-observation-contract.cjs');
const {rootPhysicalSnapshot,rootPhysicalWitness}=
  require('../../simulation/twinleaf/agent5-owner-root-slice.cjs');
const {chooseUnderworldDoorRoot,ownerUnderworldMarkerReceipt}=
  require('../../simulation/twinleaf/agent31-underworld-door-owner-frontier.cjs');
const {planPathUnderworldStadiumCounter}=require(
  '../../simulation/twinleaf/2026-11/agent6-path-underworld-stadium-counter.cjs');
const OUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUT,name));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {Card}=native('game/store/card/card');
const {CardList}=native('game/store/state/card-list');
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {GamePhase}=native('game/store/state/state');
const {CardType}=native('game/store/card/card-types');
const {PlayCardAction,PlayerType,SlotType}=
  native('game/store/actions/play-card-action');
const {CheckPokemonPowersEffect}=
  native('game/store/effects/check-effects');

/** @param {0|1} sourceSeat */
function staged(sourceSeat){
  const manager=initializeCards();
  const get=printing=>{
    const found=manager.getCardByName(printing);
    assert.ok(found,'Pinned physical printing missing: '+printing);
    return found;
  };
  const store=new Store({onStateChange(){}});
  const state=store.state,players=[new Player(),new Player()];
  players[0].id=101;players[1].id=202;
  for(const player of players){
    player.active.cards.push(get('Dratini OBF'));
    player.deck.cards.push(...Array.from({length:12},()=>new Card()));
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(new Card());
      return prize;
    });
  }
  const owner=players[sourceSeat],opponent=players[1-sourceSeat];
  owner.active.cards.length=0;
  owner.active.cards.push(get('Shadow Rider Calyrex V CRE'));
  owner.active.cards.push(get('Shadow Rider Calyrex VMAX CRE'));
  owner.bench=Array.from({length:5},()=>new PokemonCardList());
  owner.bench[0].cards.push(get('Mew UNB'));
  owner.hand.cards.push(get('Psychic Energy SVE'));
  opponent.hand.cards.push(get('Path to the Peak CRE'));
  state.players=players;state.turn=5;state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=sourceSeat;store.state=state;
  const catalog={
    basicEnergies:new Set(['Psychic Energy SVE']),
    basicEnergyTypes:{Psychic:CardType.PSYCHIC}
  };
  const doorPowers=()=>{
    const current=store.state.players[sourceSeat];
    const pokemon=current.active.getPokemonCard();
    const effect=new CheckPokemonPowersEffect(current,pokemon);
    store.reduceEffect(store.state,effect);
    return effect.powers.map(power=>power.name);
  };
  const offer=()=>{
    const view=actorObservation(store.state,sourceSeat);
    const markers=ownerUnderworldMarkerReceipt(
      store.state.players[sourceSeat]);
    return chooseUnderworldDoorRoot(view,catalog,markers);
  };
  return {store,sourceSeat,doorPowers,offer,opponent,owner,get,catalog};
}

for(const seat of [0,1]){
  test('native opponent Path suppresses funded Underworld Door seat '+seat,()=>{
    const {store,sourceSeat,doorPowers,offer}=staged(seat);
    assert.ok(doorPowers().includes('Underworld Door'));
    assert.equal(offer()?.kind,'use-underworld-door');
    store.state.activePlayer=1-sourceSeat;
    const player=store.state.players[1-sourceSeat];
    const stadium=player.hand.cards.find(c=>
      c.fullName==='Path to the Peak CRE');
    assert.ok(stadium);
    store.dispatch(new PlayCardAction(player.id,
      player.hand.cards.indexOf(stadium),{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      }));
    assert.ok(store.state.players[1-sourceSeat].stadium.cards.some(c=>
      c.fullName==='Path to the Peak CRE'));
    assert.equal(doorPowers().includes('Underworld Door'),false);
    store.state.activePlayer=sourceSeat;
    assert.equal(offer(),null);
    store.state.players[1-sourceSeat].stadium.cards.length=0;
    assert.ok(doorPowers().includes('Underworld Door'));
    assert.equal(offer()?.kind,'use-underworld-door');
  });
}

for(const seat of [0,1]){
  test('native owner Stadium counter physically replaces Path and restores Underworld seat '+seat,()=>{
    const {store,sourceSeat,doorPowers,offer,get,catalog}=staged(seat);
    const blocker=store.state.players[1-sourceSeat];
    const pathCard=blocker.hand.cards.find(c=>c.fullName==='Path to the Peak CRE');
    store.state.activePlayer=1-sourceSeat;
    store.dispatch(new PlayCardAction(blocker.id,
      blocker.hand.cards.indexOf(pathCard),{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      }));
    assert.equal(doorPowers().includes('Underworld Door'),false);

    store.state.activePlayer=sourceSeat;
    const actor=store.state.players[sourceSeat];
    actor.hand.cards.push(get('Sky Field ROS'));
    const printCatalog=new Map([
      ['Sky Field ROS',{name:'Sky Field',type:'Stadium'}]
    ]);
    const ownerView=actorObservation(store.state,sourceSeat);
    const marker=ownerUnderworldMarkerReceipt(actor);
    const proposal=planPathUnderworldStadiumCounter(
      ownerView,catalog,printCatalog,marker);
    assert.equal(proposal?.kind,'replace-path-then-underworld');
    const selected=proposal.options[0];
    const selectedCard=actor.hand.cards[selected.handIndex];
    assert.equal(selectedCard.fullName,'Sky Field ROS');

    const intent={
      kind:'play-path-underworld-stadium-counter',
      printing:selected.printing,handIndex:selected.handIndex
    };
    const before=rootPhysicalSnapshot(store.state,sourceSeat,intent);
    store.dispatch(new PlayCardAction(actor.id,selected.handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    const after=rootPhysicalSnapshot(store.state,sourceSeat,intent);
    assert.equal(rootPhysicalWitness(intent,before,after,GamePhase),
      'confirmed-public-effect');
    const current=store.state.players[sourceSeat];
    assert.ok(current.stadium.cards.some(c=>c.fullName==='Sky Field ROS'));
    assert.equal(store.state.players[1-sourceSeat].stadium.cards.length,0);
    assert.ok(doorPowers().includes('Underworld Door'));
    assert.equal(offer()?.kind,'use-underworld-door');
  });
}
