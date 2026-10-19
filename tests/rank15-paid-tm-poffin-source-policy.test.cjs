'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {paidTmPoffinHandIndex}=
  require('../simulation/twinleaf/rank15-paid-tm-poffin-source-policy.cjs');

const pokemon=name=>({getPokemonCard:()=>name?{fullName:name}:null});
const owner=()=>({
  active:{
    ...pokemon('Bunnelby PRC'),
    tools:[{fullName:'Technical Machine: Evolution PAR'}],
    energies:{cards:[{fullName:'Grass Energy MEE'}]}
  },
  bench:[pokemon('Budew ASC'),pokemon('Eldegoss V RCL'),
    pokemon(null),pokemon(null),pokemon(null)],
  hand:{cards:[{fullName:'Buddy-Buddy Poffin TEF'},{fullName:'Tag Call CEC'}]}
});
const state=()=>({activePlayer:1,phase:4,turn:16,prompts:[]});

test('actor-only paid TM state offers held Poffin with three free Bench slots',()=>{
  const p=owner(),s=state();
  Object.defineProperty(p,'deck',{get(){throw Error('hidden deck peek');}});
  Object.defineProperty(p,'prizes',{get(){throw Error('hidden Prize peek');}});
  assert.equal(paidTmPoffinHandIndex(s,p,1,4),0);
});

test('an absent physical Stage target on Bench is necessary for this bounded probe',()=>{
  const p=owner(),s=state();
  p.bench[2]=pokemon('Oddish UNB');
  assert.equal(paidTmPoffinHandIndex(s,p,1,4),-1);
  p.bench[2]=pokemon('Gloom UNB');
  assert.equal(paidTmPoffinHandIndex(s,p,1,4),-1);
});

test('excludes unpaid TM, absent Energy, no room and off-turn source',()=>{
  const p=owner(),s=state();
  p.active.tools=[];
  assert.equal(paidTmPoffinHandIndex(s,p,1,4),-1);
  p.active.tools=[{fullName:'Technical Machine: Evolution PAR'}];
  p.active.energies.cards=[];
  assert.equal(paidTmPoffinHandIndex(s,p,1,4),-1);
  p.active.energies.cards=[{fullName:'Grass Energy MEE'}];
  p.bench[2]=pokemon('Fan Rotom SCR');
  p.bench[3]=pokemon('Buneary M2');
  p.bench[4]=pokemon('Tatsugiri TWM');
  assert.equal(paidTmPoffinHandIndex(s,p,1,4),-1);
  p.bench[4]=pokemon(null);
  s.activePlayer=0;
  assert.equal(paidTmPoffinHandIndex(s,p,1,4),-1);
  s.activePlayer=1;
  s.phase=3;
  assert.equal(paidTmPoffinHandIndex(s,p,1,4),-1);
  s.phase=4;
  s.prompts=[{result:undefined}];
  assert.equal(paidTmPoffinHandIndex(s,p,1,4),-1);
});

test('other hand resources and unrelated player identity do not trigger',()=>{
  const p=owner(),s=state();
  p.hand.cards=[{fullName:'Tag Call CEC'}];
  assert.equal(paidTmPoffinHandIndex(s,p,1,4),-1);
  p.hand.cards=[{fullName:'Tag Call CEC'},
    {fullName:'Buddy-Buddy Poffin TEF'}];
  assert.equal(paidTmPoffinHandIndex(s,p,1,4),1);
  p.active.getPokemonCard=()=>({fullName:'Fan Rotom SCR'});
  assert.equal(paidTmPoffinHandIndex(s,p,1,4),-1);
});
