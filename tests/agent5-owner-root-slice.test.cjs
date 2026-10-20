'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {basicEnergyPays,selectOwnerRootIntent,nativeActionForIntent}=
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');

const P='Psychic Energy SVE';
const B='Mewtwo & Mew-GX UNM';
const C='Crobat V DAA';
const catalog={
  [P]:{basicEnergyType:'PSYCHIC'},
  [B]:{basicPokemon:true,hasAbility:true},
  [C]:{basicPokemon:true,hasAbility:false}
};
function view(){
  return {
    decisionKind:'owner-root',globalTurn:2,
    ownHand:[C,P],
    ownPublic:{
      active:{
        printing:B,energies:[],specialConditions:[],
        attacks:[{name:'Psy Bolt',cost:['PSYCHIC','COLORLESS'],
          gxAttack:false}],
        publicRestrictions:{
          cannotAttackNextTurn:false,cannotUseAttacksNextTurn:[],
          blockedAttackNameNextTurn:null,
          blockedAttackNameUntilLeavesActive:null,
          onlyAllowedAttackNameNextTurn:null
        }
      },
      bench:[null,null,null,null,null],
      publicTurnRestrictions:{gxUsed:false}
    },
    ownTurnResources:{
      energyPlayedTurn:0,pokemonPlayLocked:false,
      abilityPokemonPlayLocked:false,energyPlayLocked:false,
      specialEnergyPlayLocked:false,attackLockTurnsRemaining:0
    }
  };
}
test('printed cost respects duplicate colored symbols and generic payments',()=>{
  assert.equal(basicEnergyPays(
    ['PSYCHIC','PSYCHIC','COLORLESS'],
    ['PSYCHIC','PSYCHIC','FIRE']),true);
  assert.equal(basicEnergyPays(
    ['PSYCHIC','PSYCHIC'],['PSYCHIC','FIRE']),false);
  assert.equal(basicEnergyPays(
    ['COLORLESS','COLORLESS'],['PSYCHIC','FIRE']),true);
  assert.equal(basicEnergyPays(['PSYCHIC'],[]),false);
});
test('first Basic Bench is chosen without consulting opponent hidden zones',()=>{
  const a=view(),b=view();
  a.opponentPublic={handCount:5};
  b.opponentPublic={handCount:5};
  assert.deepEqual(selectOwnerRootIntent(a,catalog),{
    kind:'bench-basic',printing:C,handIndex:0,benchSlot:0
  });
  assert.deepEqual(selectOwnerRootIntent(a,catalog),
    selectOwnerRootIntent(b,catalog));
});
test('Basic Energy play survives Special Energy lock',()=>{
  const a=view();
  a.ownPublic.bench[0]={printing:C};
  a.ownTurnResources.specialEnergyPlayLocked=true;
  assert.deepEqual(selectOwnerRootIntent(a,catalog),{
    kind:'attach-basic-energy',printing:P,handIndex:1
  });
});
test('no repeat attachment, then legal attack by Basic-only energy',()=>{
  const a=view();
  a.ownPublic.bench[0]={printing:C};
  a.ownPublic.active.energies=[P,P];
  a.ownTurnResources.energyPlayedTurn=2;
  assert.deepEqual(selectOwnerRootIntent(a,catalog),{
    kind:'attack',name:'Psy Bolt'
  });
  a.ownPublic.active.publicRestrictions.cannotAttackNextTurn=true;
  assert.equal(selectOwnerRootIntent(a,catalog).kind,'pass');
});
test('no GX after spent and no attack on first global turn',()=>{
  const a=view();
  a.ownPublic.bench[0]={printing:C};
  a.ownPublic.active.attacks=[{
    name:'Breakthrough-GX',cost:['PSYCHIC'],gxAttack:true
  }];
  a.ownPublic.active.energies=[P];
  a.ownTurnResources.energyPlayedTurn=2;
  a.ownPublic.publicTurnRestrictions.gxUsed=true;
  assert.equal(selectOwnerRootIntent(a,catalog).kind,'pass');
  a.ownPublic.publicTurnRestrictions.gxUsed=false;
  a.globalTurn=1;
  a.ownTurnResources.energyPlayedTurn=1;
  assert.equal(selectOwnerRootIntent(a,catalog).kind,'pass');
});
test('owner Ability-play lock excludes ability-bearing Basics',()=>{
  const a=view();
  a.ownHand=[B,C];
  a.ownTurnResources.abilityPokemonPlayLocked=true;
  assert.deepEqual(selectOwnerRootIntent(a,catalog),{
    kind:'bench-basic',printing:C,handIndex:1,benchSlot:0
  });
});
test('typed native translator uses owner hand index and public target',()=>{
  class PlayCardAction {
    constructor(id,handIndex,target){
      this.id=id;this.handIndex=handIndex;this.target=target;
    }
  }
  class AttackAction {
    constructor(id,name){this.id=id;this.name=name;}
  }
  class PassTurnAction {
    constructor(id){this.id=id;}
  }
  const deps={PlayCardAction,AttackAction,PassTurnAction,
    PlayerType:{BOTTOM_PLAYER:10},SlotType:{BENCH:20,ACTIVE:30}};
  const player={id:101,hand:{cards:[
    {fullName:C},{fullName:P}
  ]}};
  const bench=nativeActionForIntent({
    kind:'bench-basic',printing:C,handIndex:0,benchSlot:2
  },player,deps);
  assert.ok(bench instanceof PlayCardAction);
  assert.deepEqual(bench.target,{player:10,slot:20,index:2});
  const energy=nativeActionForIntent({
    kind:'attach-basic-energy',printing:P,handIndex:1
  },player,deps);
  assert.deepEqual(energy.target,{player:10,slot:30,index:0});
  assert.ok(nativeActionForIntent({
    kind:'attack',name:'Psy Bolt'
  },player,deps) instanceof AttackAction);
  assert.ok(nativeActionForIntent({
    kind:'pass'
  },player,deps) instanceof PassTurnAction);
  assert.throws(()=>nativeActionForIntent({
    kind:'bench-basic',printing:C,handIndex:1,benchSlot:0
  },player,deps),/Expected values to be strictly equal/);
});
