'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseRoot,chooseOwnerCompressorCards,ARTICUNO,BASIC,
  COMPRESSOR,POWERGLASS}=
  require('../simulation/twinleaf/agent5-articuno-powerglass-native.cjs');

/** @param {object} [overrides] */
function view(overrides={}){
  return {
    decisionKind:'owner-root',globalTurn:34,
    ownHand:[COMPRESSOR,POWERGLASS],
    ownPublic:{
      active:{printing:ARTICUNO,energies:[BASIC],tools:[]},
      discard:[],publicTurnRestrictions:{}
    },
    ownTurnResources:{itemPlayLocked:false,toolPlayLocked:false},
    ...overrides
  };
}

test('T34 owner root proposes Compressor from actual held slot',()=>{
  assert.deepEqual(chooseRoot(view()),{
    kind:'compressor',printing:COMPRESSOR,handIndex:0
  });
});

test('actor-only eligibility rejects early, wrong Active and missing Tool',()=>{
  assert.equal(chooseRoot(view({globalTurn:32})),null);
  assert.equal(chooseRoot(view({decisionKind:'owner-prompt'})),null);
  assert.equal(chooseRoot(view({ownPublic:{
    active:{printing:'Mewtwo & Mew-GX UNM',
      energies:[BASIC],tools:[]},discard:[]
  }})),null);
  assert.equal(chooseRoot(view({ownHand:[COMPRESSOR]})),null);
});

test('Item lock prevents Compressor; Tool lock prevents otherwise funded Tool',()=>{
  assert.equal(chooseRoot(view({ownTurnResources:{
    itemPlayLocked:true,toolPlayLocked:false
  }})),null);
  assert.equal(chooseRoot(view({ownPublic:{
    active:{printing:ARTICUNO,energies:[BASIC],tools:[]},
    discard:[BASIC]
  },ownTurnResources:{itemPlayLocked:false,toolPlayLocked:true}})),null);
});

test('After actual discard, Tool replaces Compressor and uses true hand index',()=>{
  assert.deepEqual(chooseRoot(view({
    ownHand:[POWERGLASS,COMPRESSOR],
    ownPublic:{
      active:{printing:ARTICUNO,energies:[BASIC],tools:[]},
      discard:[BASIC,BASIC]
    }
  })),{kind:'tool',printing:POWERGLASS,handIndex:0});
  assert.equal(chooseRoot(view({ownPublic:{
    active:{printing:ARTICUNO,energies:[BASIC],tools:[POWERGLASS]},
    discard:[BASIC]
  }})),null);
});

test('Only a legal owner-deck prompt may expose and choose physical Basics',()=>{
  const cards=[
    {fullName:'Random Supporter'},
    {fullName:BASIC,id:1},
    {fullName:BASIC,id:2},
    {fullName:BASIC,id:3}
  ];
  const prompt={
    options:{max:3},cards:{cards},
    validate(chosen){return chosen.length<=3&&
      chosen.every(c=>cards.includes(c));}
  };
  assert.deepEqual(chooseOwnerCompressorCards(prompt,{}),
    [cards[1],cards[2]]);
  prompt.options.max=1;
  assert.deepEqual(chooseOwnerCompressorCards(prompt,{}),[cards[1]]);
  prompt.options.max=0;
  assert.equal(chooseOwnerCompressorCards(prompt,{}),null);
  prompt.options.max=3;
  prompt.validate=()=>false;
  assert.equal(chooseOwnerCompressorCards(prompt,{}),null);
});

test('No positive result when owning no Basic Psychic in searched deck',()=>{
  const prompt={
    options:{max:3},cards:{cards:[{fullName:'Basic Fighting Energy'}]},
    validate:()=>true
  };
  assert.equal(chooseOwnerCompressorCards(prompt,{}),null);
});
