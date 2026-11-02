'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {rootPhysicalWitness}=
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');

const intent={kind:'use-farewell-letter',benchIndex:1,
  printing:'Unown AOR',abilityName:'Farewell Letter'};
const original=()=>({farewellBenchPrinting:'Unown AOR',
  farewellDiscardCount:0,deckCount:23,handCount:2,
  farewellPrizeCounts:[6,6]});
const settled=()=>({farewellBenchPrinting:null,
  farewellDiscardCount:1,deckCount:22,handCount:3,
  farewellPrizeCounts:[6,6]});
const classify=after=>rootPhysicalWitness(intent,original(),after,{});

test('native self-discard and draw is physically confirmed',()=>{
  assert.equal(classify(settled()),'confirmed-public-effect');
});
test('root accepted without a card drawn is unconfirmed',()=>{
  assert.equal(classify({...settled(),handCount:2}),
    'no-confirmed-public-effect');
});
test('root accepted without a deck draw is unconfirmed',()=>{
  assert.equal(classify({...settled(),deckCount:23}),
    'no-confirmed-public-effect');
});
test('ordinary draw with retained Bench Unown cannot count',()=>{
  assert.equal(classify({...settled(),farewellBenchPrinting:'Unown AOR'}),
    'no-confirmed-public-effect');
});
test('wrong discarded printing cannot count',()=>{
  assert.equal(classify({...settled(),farewellDiscardCount:0}),
    'no-confirmed-public-effect');
});
test('a KO that awards a Prize is not Farewell Letter settlement',()=>{
  assert.equal(classify({...settled(),farewellPrizeCounts:[6,5]}),
    'no-confirmed-public-effect');
});
