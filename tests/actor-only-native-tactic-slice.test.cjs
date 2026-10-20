'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {decideActorRootIntent,basicOnlyAttackPayable,
  withActorOnlyNativeRootTactics}=require(
    '../simulation/twinleaf/actor-only-native-tactic-slice.cjs');

const defs={
  'Mewtwo & Mew-GX UNM':{superType:1,stage:2,hasAbility:true},
  'Wobbuffet PHF':{superType:1,stage:2,hasAbility:false},
  'Psychic Energy SVE':{superType:3,energyType:0},
  'Double Colorless Energy SUM':{superType:3,energyType:1},
  'Secret Box TWM':{superType:2}
};
const catalog=k=>defs[k]||null;
const enums={pokemon:1,energy:3,basicStage:2,basicEnergy:0};
function pokemon(print='Wobbuffet PHF',energies=[]){
  return {printing:print,energies,specialConditions:[],
    publicRestrictions:{cannotAttackNextTurn:false,
      cannotUseAttacksNextTurn:[],blockedAttackNameNextTurn:null,
      blockedAttackNameUntilLeavesActive:null,
      onlyAllowedAttackNameNextTurn:null},
    attacks:[{name:'Attack Psychic',damage:120,cost:['PSYCHIC']},
      {name:'Attack Colorless',damage:40,cost:['COLORLESS']}]};
}
function view(){return {decisionKind:'owner-root',globalTurn:3,
  ownHand:['Mewtwo & Mew-GX UNM','Psychic Energy SVE'],
  ownTurnResources:{pokemonPlayLocked:false,energyPlayLocked:false,
    abilityPokemonPlayLocked:false,energyPlayedTurn:2},
  ownPublic:{active:pokemon(),bench:[null,null,null],
    publicTurnRestrictions:{attackLockTurnsRemaining:0,gxUsed:false,
      cannotUseGXAttacks:false}},
  opponentPublic:{handCount:3,deckCount:22,prizeCount:5}};}

test('Basic Energy costs require matching colors and reject unknown multipliers',()=>{
  assert.equal(basicOnlyAttackPayable(['PSYCHIC','COLORLESS'],
    ['Psychic Energy SVE','Fighting Energy SVE']),true);
  assert.equal(basicOnlyAttackPayable(['PSYCHIC','PSYCHIC'],
    ['Psychic Energy SVE','Fighting Energy SVE']),false);
  assert.equal(basicOnlyAttackPayable(['COLORLESS'],
    ['Double Colorless Energy SUM']),false);
});

test('detached actor Bench and Energy choices respect root resources',()=>{
  const o=view();
  assert.deepEqual(decideActorRootIntent(o,'bench',catalog,enums),
    {kind:'bench',handIndex:0,printing:'Mewtwo & Mew-GX UNM',benchIndex:0});
  assert.equal(decideActorRootIntent(o,'energy',catalog,enums).targetSlot,'ACTIVE');
  o.ownTurnResources.abilityPokemonPlayLocked=true;
  assert.equal(decideActorRootIntent(o,'bench',catalog,enums),null);
  o.ownTurnResources.energyPlayedTurn=3;
  assert.equal(decideActorRootIntent(o,'energy',catalog,enums),null);
});

test('attack selection is public-state constrained and opponent-hand blind',()=>{
  const o=view();o.ownPublic.active.energies=['Psychic Energy SVE'];
  const selected=decideActorRootIntent(o,'attack',catalog,enums);
  assert.deepEqual(selected,{kind:'attack',attackName:'Attack Psychic'});
  const changed=structuredClone(o);
  changed.opponentPublic.secretPhysicalContents=['concealed other world'];
  assert.deepEqual(decideActorRootIntent(changed,'attack',catalog,enums),selected);
  o.ownPublic.active.publicRestrictions.cannotUseAttacksNextTurn=['Attack Psychic'];
  assert.equal(decideActorRootIntent(o,'attack',catalog,enums).attackName,'Attack Colorless');
  o.ownPublic.active.specialConditions=['ASLEEP'];
  assert.equal(decideActorRootIntent(o,'attack',catalog,enums),null);
});

/** Minimal source-independent pinned-like real State shape. */
function fixture(){
  const c=name=>({fullName:name,name,hp:100,attacks:[],powers:[]});
  const slot=name=>({
    cards:name?[c(name)]:[],getPokemonCard(){return this.cards[0]??null;},
    energies:{cards:[]},tools:[],damage:0,specialConditions:[]
  });
  const owner=(id,hasBasic)=>({
    id,active:slot('Wobbuffet PHF'),
    bench:[slot(),slot(),slot(),slot(),slot()],
    hand:{cards:hasBasic?[c('Mewtwo & Mew-GX UNM')]:[c('Secret Box TWM')]},
    deck:{cards:[c('Psychic Energy SVE')]},
    prizes:[{cards:[c('Secret Box TWM')]}],
    discard:{cards:[]},lostzone:{cards:[]},
    stadium:{cards:[]},supporter:{cards:[]},
    energyPlayedTurn:0,supporterTurn:0,stadiumPlayedTurn:0,
    usedVSTAR:false,usedGX:false
  });
  return {players:[owner(101,true),owner(202,false)],
    activePlayer:0,turn:3,phase:3,prompts:[]};
}
test('actor-owned native typed Store dispatch and transactional prototype restoration',()=>{
  class Basic {useTactic(){return 'original';}}
  class Energy {useTactic(){return 'original';}}
  class Attack {useTactic(){return 'original';}}
  class Store {dispatch(action){this.actions.push(action);return true;}}
  class PlayCardAction {constructor(clientId,handIndex,target){
    this.clientId=clientId;this.handIndex=handIndex;this.target=target;}}
  class AttackAction {constructor(clientId,name){this.clientId=clientId;this.name=name;}}
  const manager={getCardByName:name=>defs[name]||null};
  const deps={PlayBasicTactic:Basic,AttachEnergyTactic:Energy,
    AttackTactic:Attack,Store,cardManager:manager,
    playCards:{PlayCardAction,PlayerType:{BOTTOM_PLAYER:1},
      SlotType:{BENCH:1,ACTIVE:0}},
    gameActions:{AttackAction},cardTypes:{
      SuperType:{POKEMON:1,ENERGY:3},Stage:{BASIC:2},
      EnergyType:{BASIC:0}}};
  const original=Basic.prototype.useTactic;
  const originalDispatch=Store.prototype.dispatch;
  const result=withActorOnlyNativeRootTactics(()=>{
    const store=new Store();store.actions=[];
    store.dispatch({constructor:{name:'AddPlayerAction'}});
    const state=fixture();
    const action=new Basic().useTactic(state,state.players[0]);
    assert.equal(action.constructor.name,'PlayCardAction');
    assert.equal(action.handIndex,0);
    store.dispatch(action);
    return store.actions.length;
  },deps);
  assert.equal(result.result,2);
  assert.equal(result.audit.nativeAcceptedActions,1);
  assert.equal(result.audit.events[0].intent.printing,'Mewtwo & Mew-GX UNM');
  assert.strictEqual(Basic.prototype.useTactic,original);
  assert.strictEqual(Store.prototype.dispatch,originalDispatch);
  assert.throws(()=>withActorOnlyNativeRootTactics(
    ()=>{throw new Error('boom')},deps),/boom/);
  assert.strictEqual(Basic.prototype.useTactic,original);
});
