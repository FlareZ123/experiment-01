'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,chooseNominalGuzmaGust}=
  require('../simulation/twinleaf/agent43-guzma-nominal-gust-frontier.cjs');

const DARK=7,COLORLESS=0;
const catalog={
  basicEnergies:new Set(['Darkness Energy SVE']),
  basicEnergyTypes:{Darkness:DARK},
  colorlessEnergyType:COLORLESS,
  specialConditions:{ASLEEP:2,PARALYZED:4}
};
const pokemon=(hp,damage=0)=>({hp,damage});
const incoming={
  printing:'Mega Absol ex M2',
  energies:['Darkness Energy SVE'],
  attacks:[{name:'Clean Hit',cost:[DARK],damage:100,
    damageCalculation:null,text:'',gxAttack:false}],
  publicRestrictions:{},specialConditions:[]
};
const offered=[
  {seat:1,zone:'bench',index:0},
  {seat:1,zone:'bench',index:1},
  {seat:1,zone:'bench',index:2}
];
const plan={benchIndex:1,anticipatedMissing:0};
const view=()=>({
  decisionKind:'owner-prompt',actorSeat:0,
  ownPublic:{bench:[null,incoming]},
  opponentPublic:{bench:[pokemon(240),pokemon(80),pokemon(90)]}
});
test('nominal fixed damage target skips native-first surviving target',()=>{
  const result=chooseNominalGuzmaGust(view(),plan,offered,catalog);
  assert.match(VERSION,/v1$/);
  assert.deepEqual(result,{
    benchIndex:1,firstBenchIndex:0,maxPrintedDamage:100,
    targetRemainingHp:80,
    reason:'fixed-printed-damage-nominal-KO-where-first-native-option-survives'
  });
});
test('no change if first native opponent Bench target is already nominally KO-able',()=>{
  const x=view();x.opponentPublic.bench[0]=pokemon(70);
  assert.equal(chooseNominalGuzmaGust(x,plan,offered,catalog),null);
});
test('unfunded, incomplete, variable-damage, and Special Energy incoming attackers abstain',()=>{
  const x=view();
  assert.equal(chooseNominalGuzmaGust(x,{...plan,anticipatedMissing:1},offered,catalog),null);
  x.ownPublic.bench[1]={...incoming,energies:[]};
  assert.equal(chooseNominalGuzmaGust(x,plan,offered,catalog),null);
  x.ownPublic.bench[1]={...incoming,
    attacks:[{...incoming.attacks[0],damageCalculation:'20+'}]};
  assert.equal(chooseNominalGuzmaGust(x,plan,offered,catalog),null);
  x.ownPublic.bench[1]={...incoming,energies:['Double Colorless Energy SUM']};
  assert.equal(chooseNominalGuzmaGust(x,plan,offered,catalog),null);
});
test('zero or single genuinely offered opponent Bench recipient delegates',()=>{
  assert.equal(chooseNominalGuzmaGust(view(),plan,offered.slice(0,1),catalog),null);
  assert.equal(chooseNominalGuzmaGust(view(),plan,[],catalog),null);
  const sameSide=offered.map(row=>({...row,seat:0}));
  assert.equal(chooseNominalGuzmaGust(view(),plan,sameSide,catalog),null);
});
test('an invalid or uninspectable remaining HP is never treated as a nominal KO',()=>{
  const x=view();x.opponentPublic.bench[1]=pokemon(0);
  x.opponentPublic.bench[2]=null;
  assert.equal(chooseNominalGuzmaGust(x,plan,offered,catalog),null);
});
test('opponent hidden-hand changes cannot enter detached opponent target choice',()=>{
  const x=view();
  const a=chooseNominalGuzmaGust(x,plan,offered,catalog);
  Object.defineProperty(x.opponentPublic,'hand',{get(){
    throw Error('Concealed opponent hand must never be read');
  }});
  const b=chooseNominalGuzmaGust(x,plan,offered,catalog);
  assert.deepEqual(b,a);
});
