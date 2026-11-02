'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseRank9SpecialFundedGuzma}=require(
  '../simulation/twinleaf/agent2-rank9-special-guzma-frontier.cjs');

const D=7,P=5,C=9,BASIC=0;
const catalog={
  stages:{BASIC},
  basics:new Set(['Mega Absol ex ME1']),
  basicEnergies:new Set(['Psychic Energy MEE']),
  specialEnergies:new Set([
    'Prism Energy BW4','Telepathic Psychic Energy SMP'
  ]),
  basicEnergyTypes:{Darkness:D,Psychic:P},
  colorlessEnergyType:C,
  specialConditions:{ASLEEP:2,PARALYZED:3}
};
const claw={
  name:'Claw of Darkness',cost:[D,D,C],damage:200,
  damageCalculation:null,
  text:'Your opponent reveals their hand, and you discard a card you find there.',
  gxAttack:false
};
function board(){
  const attacker={
    name:'Mega Absol ex',printing:'Mega Absol ex ME1',
    printed:{stage:BASIC,types:[D],weakness:[],resistance:[]},
    attacks:[claw],energies:[
      'Prism Energy BW4','Prism Energy BW4',
      'Telepathic Psychic Energy SMP'
    ],
    specialConditions:[],publicRestrictions:{},tools:[],hp:280,damage:0
  };
  const target={
    name:'Trevenant & Dusknoir-GX',
    printing:'Trevenant & Dusknoir-GX SMP',
    printed:{stage:BASIC,types:[P],
      weakness:[{type:D,value:'×2'}],resistance:[]},
    hp:270,damage:0,tools:[],attacks:[],energies:[]
  };
  return {
    decisionKind:'owner-root',globalTurn:42,actorSeat:1,
    ownHand:['Guzma BUS'],
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false},
    ownPublic:{
      active:{name:'Electrode-GX',printing:'Electrode-GX CES',
        attacks:[],energies:[],publicRestrictions:{},printed:{types:[]}},
      bench:[null,attacker,null,null,null],
      stadium:[],resolvingSupporter:[],prizeCount:6,
      publicTurnRestrictions:{supporterPlayLocked:false,
        attackLockTurnsRemaining:0}
    },
    opponentPublic:{
      active:{name:'Klefki',hp:60,damage:0},
      bench:[null,null,target,null,null],
      stadium:[],prizeCount:6
    }
  };
}
test('exact public rank9 line nominates held Guzma, funded Mega Absol and three-Prize target',()=>{
  const v=board();
  const plan=chooseRank9SpecialFundedGuzma(v,catalog);
  assert.equal(plan.kind,'play-guzma-forced-nominal-ko');
  assert.equal(plan.handIndex,0);
  assert.equal(plan.benchIndex,1);
  assert.equal(plan.opponentBenchIndex,2);
  assert.equal(plan.attackName,'Claw of Darkness');
  assert.equal(plan.nominalDamage,400);
  assert.equal(plan.targetRemainingHp,270);
  assert.equal(plan.planFamily,'rank9-special-funded-weakness-guzma');
  assert.equal(plan.actualKoAndTacticalBenefitUnverified,true);
});
test('Special Energy type availability is physical, not mere attachment count',()=>{
  const v=board();
  v.ownPublic.bench[1].energies=['Prism Energy BW4',
    'Telepathic Psychic Energy SMP','Telepathic Psychic Energy SMP'];
  assert.equal(chooseRank9SpecialFundedGuzma(v,catalog),null);
  v.ownPublic.bench[1].energies=[
    'Prism Energy BW4','Prism Energy BW4','Telepathic Psychic Energy SMP'];
  v.opponentPublic.stadium=['Temple of Sinnoh BRS'];
  assert.equal(chooseRank9SpecialFundedGuzma(v,catalog),null);
});
test('exact printed weakness and native public print identity are required',()=>{
  const v=board();
  v.opponentPublic.bench[2].printed.weakness=[];
  assert.equal(chooseRank9SpecialFundedGuzma(v,catalog),null);
  v.opponentPublic.bench[2].printed.weakness=[{type:D,value:2}];
  assert.equal(chooseRank9SpecialFundedGuzma(v,catalog).nominalDamage,400);
  v.ownPublic.bench[1].printing='Other Absol ex ME1';
  assert.equal(chooseRank9SpecialFundedGuzma(v,catalog),null);
});
test('unknown target Tools, Resistance and attack change all veto proposal',()=>{
  const v=board(),t=v.opponentPublic.bench[2],a=v.ownPublic.bench[1];
  t.tools=['Hero Cape TEF'];
  assert.equal(chooseRank9SpecialFundedGuzma(v,catalog),null);
  t.tools=['Eviolite NVI'];
  assert.equal(chooseRank9SpecialFundedGuzma(v,catalog).nominalDamage,380);
  t.tools=[];
  t.printed.resistance=[{type:D,value:-30}];
  assert.equal(chooseRank9SpecialFundedGuzma(v,catalog),null);
  t.printed.resistance=[];
  a.attacks[0]={...claw,text:'Discard all Energy from this Pokémon.'};
  assert.equal(chooseRank9SpecialFundedGuzma(v,catalog),null);
});
test('held exact Guzma, open Supporter and legal turn are necessary',()=>{
  const v=board();
  v.ownHand=['Guzma & Hala CEC'];
  assert.equal(chooseRank9SpecialFundedGuzma(v,catalog),null);
  v.ownHand=['Guzma BUS'];
  v.ownTurnResources.supporterPlayedTurn=1;
  assert.equal(chooseRank9SpecialFundedGuzma(v,catalog),null);
  v.ownTurnResources.supporterPlayedTurn=0;
  v.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;
  assert.equal(chooseRank9SpecialFundedGuzma(v,catalog),null);
  v.ownPublic.publicTurnRestrictions.supporterPlayLocked=false;
  v.globalTurn=1;
  assert.equal(chooseRank9SpecialFundedGuzma(v,catalog),null);
});
test('opponent concealed zones are inaccessible by construction',()=>{
  const v=board();
  const plan=chooseRank9SpecialFundedGuzma(v,catalog);
  Object.defineProperty(v,'opponentHidden',{get(){
    throw Error('Forbidden concealed opponent information accessed');
  }});
  assert.deepEqual(chooseRank9SpecialFundedGuzma(v,catalog),plan);
});
test('unsupported opportunity does not nominate an unrelated recipient',()=>{
  const v=board();
  v.opponentPublic.bench[2].name='Dedenne-GX';
  assert.equal(chooseRank9SpecialFundedGuzma(v,catalog),null);
  v.opponentPublic.bench=[null,null,null,null,null];
  assert.equal(chooseRank9SpecialFundedGuzma(v,catalog),null);
});
