'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {choosePathToPeakOpposingAbility}=require('../simulation/twinleaf/agent33-path-to-peak-public-lock.cjs');
const {publicFusionUsageAtRoot,MARKER}=
  require('../simulation/twinleaf/agent33-public-fusion-usage.cjs');
const BASE=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(BASE,name));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {Card}=native('game/store/card/card');
const {CardList}=native('game/store/state/card-list');
const {GamePhase}=native('game/store/state/state');
const {PlayCardAction,PlayerType,SlotType}=native('game/store/actions/play-card-action');
const {CheckPokemonPowersEffect}=native('game/store/effects/check-effects');
const PRINTED={
  ruleboxAbilityPrintings:new Set([
    'Genesect V FST','Dedenne-GX UNB','Regidrago VSTAR SIT']),
  ruleboxPokemonPrintings:new Set([
    'Genesect V FST','Dedenne-GX UNB','Regidrago VSTAR SIT'])
};
/**
 * Stage a real native Store with exact printings in both seats.
 * Synthetic zones are not a competitive source-original game.
 * @param {0|1} seat
 * @param {'arrived-dedenne'|'spent-legacy-star'|'spent-fusion'} kind
 */
function staged(seat,kind){
  const manager=initializeCards();
  const get=printing=>{
    const card=manager.getCardByName(printing);
    assert.ok(card,'Missing pinned printing '+printing);
    return card;
  };
  const store=new Store({onStateChange(){}});
  const state=store.state,players=[new Player(),new Player()];
  players[0].id=101;players[1].id=202;
  for(const p of players){
    p.active.cards.push(get('Dratini OBF'));
    p.deck.cards.push(...Array.from({length:12},()=>new Card()));
    p.prizes=Array.from({length:6},()=>{
      const prize=new CardList();prize.cards.push(new Card());return prize;
    });
  }
  const owner=players[seat],opp=players[1-seat];
  const bench=new PokemonCardList();
  if(kind==='arrived-dedenne')bench.cards.push(get('Dedenne-GX UNB'));
  else if(kind==='spent-legacy-star'){
    bench.cards.push(get('Regidrago V SIT'));
    bench.cards.push(get('Regidrago VSTAR SIT'));
    owner.usedVSTAR=true;
  }else{
    assert.equal(kind,'spent-fusion');
    const usedSource=get('Genesect V FST');
    bench.cards.push(usedSource);
    // An already announced Fusion Strike System use, represented with
    // the actual pinned Player's physical Card-identity marker.
    owner.marker.addMarker(MARKER,usedSource);
  }
  owner.bench.push(bench);
  opp.active.cards.length=0;opp.active.cards.push(get('Genesect V FST'));
  owner.hand.cards.push(get('Path to the Peak CRE'));
  state.players=players;state.turn=5;
  state.phase=GamePhase.PLAYER_TURN;state.activePlayer=seat;
  store.state=state;
  return {store,owner,opp};
}
/** @param {object} store @param {object} opponent */
function powers(store,opponent){
  const probe=new CheckPokemonPowersEffect(opponent,
    opponent.active.getPokemonCard());
  store.reduceEffect(store.state,probe);
  return probe.powers.map(x=>x.name);
}
for(const seat of [0,1]){
 for(const kind of ['arrived-dedenne','spent-legacy-star','spent-fusion']){
  test('native temporal Path proposal '+kind+' seat '+seat,()=>{
    const {store,owner,opp}=staged(seat,kind);
    assert.ok(powers(store,opp).includes('Fusion Strike System'));
    const view=actorObservation(store.state,seat);
    const usage=kind==='spent-fusion'?
      publicFusionUsageAtRoot(store.state,seat):null;
    if(kind==='spent-fusion'){
      assert.equal(choosePathToPeakOpposingAbility(view,PRINTED),null,
        'No untrusted apparent Genesect exhaustions admitted');
      assert.equal(usage.usedCount,1);
    }
    const proposal=choosePathToPeakOpposingAbility(view,PRINTED,{
      ownFusionUsage:usage
    });
    assert.equal(proposal?.kind,'play-path-to-peak');
    assert.equal(proposal?.printing,'Path to the Peak CRE');
    store.dispatch(new PlayCardAction(owner.id,proposal.handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    assert.equal(owner.stadium.cards[0]?.fullName,'Path to the Peak CRE');
    assert.equal(powers(store,opp).includes('Fusion Strike System'),false);
  });
 }
}
