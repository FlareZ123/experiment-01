'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorEnergyRecipient}=
  require('../simulation/twinleaf/agent44-actor-energy-recipient.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {choosePublicClawUpgrade,PRINTING}=
  require('../simulation/twinleaf/agent12-active-claw-upgrade.cjs');

const DARK=7,COLORLESS=9;
const ENERGY='Darkness Energy MEE';
const catalog={
  basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set([ENERGY]),
  basicEnergyTypes:{Darkness:DARK},colorlessEnergyType:COLORLESS,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};

/** @returns {object} Deep-cloneable actor-public exact-printing state. */
function view(){
  return {
    decisionKind:'owner-root',globalTurn:34,
    ownHand:[ENERGY],
    ownTurnResources:{
      pokemonPlayLocked:false,energyPlayLocked:false,energyPlayedTurn:0
    },
    ownPublic:{
      active:{
        printing:PRINTING,name:'Mega Absol ex',
        energies:[ENERGY,ENERGY],specialConditions:[],
        publicRestrictions:{cannotUseAttacksNextTurn:[]},
        attacks:[
          {name:'Terminal Period',cost:[DARK,COLORLESS],damage:0,gxAttack:false},
          {name:'Claw of Darkness',cost:[DARK,DARK,COLORLESS],damage:200,gxAttack:false}
        ],
        printed:{types:[DARK]}
      },
      bench:[
        {printing:'Trubbish MEE',name:'Trubbish',energies:[],
          publicRestrictions:{cannotUseAttacksNextTurn:[]},
          attacks:[{name:'Call for Family',cost:[DARK],damage:0,gxAttack:false}]},
        null,null,null,null
      ],
      stadium:[],
      publicTurnRestrictions:{attackLockTurnsRemaining:0,gxUsed:false}
    },
    opponentPublic:{active:{printing:'Duskull VIV',damage:0}},
    // These explicit poisoned sentinels must never influence the choice.
    opponentHidden:{hand:['concealed'],prizes:['concealed']}
  };
}

test('source Mega Absol at two Darkness: baseline funds Bench, upgrade funds actual Claw',()=>{
  const v=view();
  const base=chooseActorEnergyRecipient(v,catalog);
  assert.equal(base.slot,'bench');
  assert.equal(base.attackName,'Call for Family');
  const upgrade=choosePublicClawUpgrade(v,catalog,base);
  assert.deepEqual(upgrade,{
    handIndex:0,printing:ENERGY,slot:'active',index:0,
    attackName:'Claw of Darkness',gapBefore:1,gapAfter:0,
    knownBasicEnergyOnly:true,
    upgradeReason:'publicly-dead-terminal-period-unlocks-claw'
  });
  assert.equal(chooseActorRootIntent(v,catalog,{
    energyRecipientFrontier:true
  }).slot,'bench');
  const upgraded=chooseActorRootIntent(v,catalog,{
    energyRecipientFrontier:true,activeClawUpgrade:true
  });
  assert.equal(upgraded.kind,'attach-basic-energy');
  assert.equal(upgraded.slot,'active');
  assert.equal(upgraded.attackName,'Claw of Darkness');
});

test('third Darkness plus shared known-dead attack selector proposes Claw',()=>{
  const v=view();
  v.ownHand=[];
  v.ownPublic.active.energies.push(ENERGY);
  const intent=chooseActorRootIntent(v,catalog,{
    energyRecipientFrontier:true,activeClawUpgrade:true,
    knownDeadAttackRoot:true
  });
  assert.deepEqual(intent,{kind:'attack',attackName:'Claw of Darkness'});
});

test('terminal-six-counter KO state keeps existing Bench preference',()=>{
  const v=view();
  v.opponentPublic.active.damage=60;
  const baseline=chooseActorEnergyRecipient(v,catalog);
  assert.equal(choosePublicClawUpgrade(v,catalog,baseline),null);
  assert.equal(chooseActorRootIntent(v,catalog,{
    energyRecipientFrontier:true,activeClawUpgrade:true
  }).slot,'bench');
});

test('exact printing, eligible attack and Basic Energy are required',()=>{
  for(const change of [
    v=>{v.ownPublic.active.printing='Other ex M1L';},
    v=>{v.ownPublic.active.attacks[1].damage=150;},
    v=>{v.ownPublic.active.attacks[1].cost=[DARK,COLORLESS];},
    v=>{v.ownPublic.active.energies[0]='Double Colorless Energy';},
    v=>{v.ownHand=[];},
    v=>{v.ownPublic.active.specialConditions=[0];},
    v=>{v.ownPublic.active.publicRestrictions.cannotAttackNextTurn=true;},
    v=>{v.ownPublic.active.publicRestrictions.blockedAttackNameNextTurn='Claw of Darkness';}
  ]){
    const v=view();
    change(v);
    const baseline={slot:'bench'};
    assert.equal(choosePublicClawUpgrade(v,catalog,baseline),null);
  }
});

test('no opponent-hidden-identity dependency and no effect when baseline already uses Active',()=>{
  const x=view(),y=view();
  y.opponentHidden={hand:['other-private-data'],prizes:['other-private-data']};
  y.ownHiddenDeck=['arbitrary'];
  assert.deepEqual(choosePublicClawUpgrade(x,catalog,{slot:'bench'}),
    choosePublicClawUpgrade(y,catalog,{slot:'bench'}));
  assert.equal(choosePublicClawUpgrade(x,catalog,{slot:'active'}),null);
});
