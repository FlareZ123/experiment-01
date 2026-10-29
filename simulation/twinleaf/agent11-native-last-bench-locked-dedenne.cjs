'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {buildActorCardCatalog,chooseActorRootIntent}=
  require('./agent34-actor-only-root-policy.cjs');
const {installEntryDrawLockHook}=require('./entry-draw-lock-hook.cjs');

const OUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=p=>require(path.join(OUT,p));
const DRAW='Dedenne GX UNB',ATTACKER='Regidrago V SIT';

function stage(seat){
  assert.ok(seat===0||seat===1);
  const manager=initializeCards();
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {CardList}=load('game/store/state/card-list');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format}=load('game/store/card/card-types');
  let next=1;
  const card=name=>{const c=manager.getCardByName(name);
    assert.ok(c,'Missing pinned printing '+name);c.id=next++;return c;};
  const owner=new Player(),opponent=new Player();
  owner.id=101;opponent.id=202;
  owner.active.cards.push(card('Budew ASC'));
  for(const name of [ATTACKER,'Budew ASC','Latias ex SSP','Marshadow UNB']){
    const slot=new PokemonCardList();slot.cards.push(card(name));owner.bench.push(slot);
  }
  owner.bench.push(new PokemonCardList());
  owner.hand.cards.push(card(DRAW),card(ATTACKER));
  opponent.active.cards.push(card('Iron Thorns ex TWM'));
  for(let i=0;i<5;i++)opponent.bench.push(new PokemonCardList());
  opponent.hand.cards.push(card('Lightning Energy SVE'));
  for(const player of [owner,opponent]){
    for(let i=0;i<12;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  const store=new Store({onStateChange(){}}),state=store.state;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=seat;state.turn=2;state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  const t={
    PokemonCard:load('game/store/card/pokemon-card').PokemonCard,
    EnergyCard:load('game/store/card/energy-card').EnergyCard,
    ...load('game/store/card/card-types'),
    PowerType:load('game/store/card/pokemon-types').PowerType
  };
  return {store,state,owner,opponent,seat,
    catalog:buildActorCardCatalog(manager.getAllCards(),t)};
}

function exercise(seat){
  const first=stage(seat),other=stage(seat);
  const av=actorObservation(first.state,seat);
  const bv=actorObservation(other.state,seat);
  assert.deepEqual(av,bv,'Both branches must share exact owner-visible root');
  const proposed=chooseActorRootIntent(av,first.catalog);
  assert.deepEqual(proposed,{kind:'bench-basic',handIndex:0,
    benchIndex:4,printing:DRAW});
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {CheckPokemonPowersEffect}=load('game/store/effects/check-effects');
  const visible=new CheckPokemonPowersEffect(first.opponent,
    first.opponent.active.getPokemonCard());
  first.store.reduceEffect(first.state,visible);
  assert.ok(visible.powers.some(p=>p.name==='Initialization'),
    'Printed Iron Thorns ability must be visible before play');
  const before=first.owner.deck.cards.length;
  first.store.dispatch(new PlayCardAction(first.owner.id,0,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:4}));
  assert.equal(first.owner.bench[4].getPokemonCard().fullName,DRAW);
  assert.equal(first.owner.deck.cards.length,before,
    'Guarded Dedenne entry must not draw under Initialization');
  assert.equal(first.owner.hand.cards.length,1);
  assert.equal(first.owner.hand.cards[0].fullName,ATTACKER);
  assert.equal(first.store.hasPrompts(),false);
  other.store.dispatch(new PlayCardAction(other.owner.id,1,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:4}));
  assert.equal(other.owner.bench[4].getPokemonCard().fullName,ATTACKER);
  assert.equal(other.owner.hand.cards.length,1);
  assert.equal(other.owner.hand.cards[0].fullName,DRAW);
  assert.equal(other.store.hasPrompts(),false);
  for(const state of [first,other]){
    assert.equal(state.owner.bench.filter(x=>x.cards.length>0).length,5);
    assert.equal(state.store.state.turn,2);
    assert.equal(state.store.state.activePlayer,seat);
  }
  return {seat,initialObservationEqual:true,
    firstReturnPrinting:proposed.printing,
    suppressedDrawCards:before-first.owner.deck.cards.length,
    nativeChosenBenchPrinting:first.owner.bench[4].getPokemonCard().fullName,
    nativeAlternativeBenchPrinting:other.owner.bench[4].getPokemonCard().fullName,
    chosenRemainingHand:first.owner.hand.cards.map(c=>c.fullName),
    alternateRemainingHand:other.owner.hand.cards.map(c=>c.fullName),
    fullBenchInBoth:true,
    separatelyNativePlayableBoth:true,
    opponentTurnNotYetPlayed:true};
}
function run(){
  const restore=installEntryDrawLockHook();
  try{
    return {schema:'agent11-staged-sourceprinted-lastbench-v1',
      enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      lockGuard:'entryDrawLockCorrection research-owned opt-in',
      records:[exercise(0),exercise(1)],competitiveQualifiedGames:0,
      caveat:'Staged owner root and true Store Bench actions in both seats; no natural opening probability, autonomous opponent reply, or competitive win evidence.'};
  }finally{restore();}
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={stage,exercise,run};
