'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  decideAbilityConfirm,chooseRadiantVmaxTargets
}=require('../simulation/twinleaf/agent36-owner-ability-confirm-policy.cjs');

const types={
  CardType:{WATER:'WATER'},
  Stage:{VMAX:'VMAX',BASIC:'BASIC'},
  SuperType:{POKEMON:'POKEMON'}
};
const water=()=>({name:'Water Energy',fullName:'Water Energy',cardType:['WATER']});
const psychic=()=>({name:'Psychic Energy',fullName:'Psychic Energy',cardType:['PSYCHIC']});
const slot=(pokemon=[],energies=[])=>({cards:pokemon,energies:{cards:energies}});
const pokemon=(name,id)=>({name,fullName:name,id,superType:'POKEMON'});

test('Radiant Eternatus is accepted only when the owner has bench capacity',()=>{
  const card=pokemon('Radiant Eternatus','radiant');
  const open=decideAbilityConfirm({
    card,types,
    owner:{bench:[slot([card]),slot(),slot([pokemon('Tapu Lele-GX','lele')]),slot(),slot()]}
  });
  assert.equal(open.decision,true);
  assert.equal(open.reason,'radiant-has-bench-capacity');
  assert.equal(open.details.openBenchSlots,3);

  const full=decideAbilityConfirm({
    card,types,
    owner:{bench:Array.from({length:5},(_,i)=>slot([pokemon('P'+i,String(i))]))}
  });
  assert.equal(full.decision,false);
  assert.equal(full.reason,'radiant-bench-full');
});

test('Articuno-GX is declined when no Water Energy can be moved',()=>{
  const card=pokemon('Articuno-GX','articuno');
  const result=decideAbilityConfirm({
    card,types,
    owner:{active:slot([pokemon('Snorlax','snorlax')]),bench:[slot([card]),slot(),slot()]}
  });
  assert.equal(result.decision,false);
  assert.equal(result.reason,'articuno-insufficient-or-excess-water-transfer');
  assert.equal(result.details.otherWaterCount,0);
});

test('Articuno-GX is accepted only when the exact Water transfer makes Ice Wing payable',()=>{
  const card=pokemon('Articuno-GX','articuno');
  const result=decideAbilityConfirm({
    card,types,
    owner:{
      active:slot([pokemon('Snorlax','snorlax')],[water(),water(),water()]),
      bench:[slot([card]),slot()]
    }
  });
  assert.equal(result.decision,true);
  assert.equal(result.details.moveNeeded,3);
  assert.equal(result.details.otherWaterCount,3);

  const excess=decideAbilityConfirm({
    card,types,
    owner:{
      active:slot([pokemon('Snorlax','snorlax')],[water(),water(),water(),water()]),
      bench:[slot([card]),slot()]
    }
  });
  assert.equal(excess.decision,false);
});

test('Radiant search selects only VMAX cards and respects open bench slots',()=>{
  const basic={name:'Basic Pokémon',fullName:'Basic Pokémon',id:'basic',
    superType:'POKEMON',stage:'BASIC'};
  const vmax1={name:'VMAX One',fullName:'VMAX One',id:'vmax1',
    superType:'POKEMON',stage:'VMAX'};
  const vmax2={name:'VMAX Two',fullName:'VMAX Two',id:'vmax2',
    superType:'POKEMON',stage:'VMAX'};
  const owner={bench:[slot([pokemon('Radiant Eternatus','radiant')]),slot(),slot(),
    slot([pokemon('Tapu Lele-GX','lele')]),slot()]};
  const selected=chooseRadiantVmaxTargets({
    owner,types,
    prompt:{cards:{cards:[basic,vmax2,vmax1]},options:{min:0,max:2}}
  });
  assert.deepEqual(selected,[vmax1]);
  assert.ok(selected.every(card=>card.stage==='VMAX'));
});

test('Radiant search returns an empty legal selection when the deck has no VMAX target',()=>{
  const owner={bench:[slot([pokemon('Radiant Eternatus','radiant')]),slot(),
    slot(),slot(),slot()]};
  const selected=chooseRadiantVmaxTargets({
    owner,types,
    prompt:{cards:{cards:[{name:'Basic',superType:'POKEMON',stage:'BASIC'}]},
      options:{min:0,max:2}}
  });
  assert.deepEqual(selected,[]);
});
