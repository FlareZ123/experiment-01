'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  FROM_HAND_BENCH,auditOriginalVipBenchEntry,run
}=require('../scripts/agent9-vip-source-archive-trigger-crosscheck.cjs');

test('owner-deck entry text is narrower than an arbitrary first-turn Ability',()=>{
  assert.equal(FROM_HAND_BENCH.test(
    'When you play this Pokémon from your hand onto your Bench during your turn, you may draw 6 cards.'),true);
  assert.equal(FROM_HAND_BENCH.test(
    'Once during your turn, you may use this Ability. Discard your hand and draw 6 cards.'),false);
});

test('unmatched or different-printing cards remain unknown',()=>{
  const original={decks:[{rank:99,archetype:'Fixture',cards:[
    {name:'Battle VIP Pass',category:'Trainer',count:1},
    {name:'A',category:'Pokémon',count:2,
      printing:{set:'SIM',number:'1'}},
    {name:'B',category:'Pokémon',count:1,
      printing:{set:'SIM',number:'2'}},
    {name:'C',category:'Pokémon',count:1,
      printing:{set:'MISSING',number:'3'}},
    {name:'Mismatch',category:'Pokémon',count:1,
      printing:{set:'SIM',number:'4'}}
  ]}]};
  const sets=[{ptcgoCode:'SIM',id:'sim'}];
  const cards=[
    {number:'1',name:'A',subtypes:['Basic'],abilities:[
      {name:'From Hand',text:'When you play this Pokémon from your hand onto your Bench during your turn, you may draw 2 cards.'}]},
    {number:'2',name:'B',subtypes:['Basic'],abilities:[
      {name:'Anytime',text:'Once during your turn, you may draw 2 cards.'}]},
    {number:'4',name:'Other Name',subtypes:['Basic'],abilities:[]}
  ];
  const audited=auditOriginalVipBenchEntry(original,sets,()=>cards);
  assert.equal(audited.handOnlyCopyCount,2);
  assert.equal(audited.handOnlySourceCount,1);
  assert.equal(audited.matchedBasicOtherCopyCount,1);
  assert.equal(audited.unresolvedPokemonCopies,2);
  assert.deepEqual(audited.rows[0].unresolved.map(c=>c.reason),[
    'unmapped-set','printed-card-missing-or-name-mismatch']);
});

test('authenticated original VIP field has four and only four matched hand-entry printings',()=>{
  const audited=run();
  assert.equal(audited.originalSourceCount,29);
  assert.equal(audited.vipSourceCount,15);
  assert.equal(audited.handOnlySourceCount,14);
  assert.equal(audited.handOnlyCopyCount,39);
  const printings=new Set(audited.rows.flatMap(r=>r.handOnly.map(c=>
    c.name+'|'+c.set+'|'+c.number)));
  assert.deepEqual([...printings].sort(),[
    'Crobat V|DAA|104',
    'Dedenne-GX|UNB|57',
    'Eldegoss V|RCL|19',
    'Tapu Lele-GX|GRI|60'
  ]);
  assert.equal(audited.rows.find(r=>r.rank===17).handOnly.length,0);
  assert.ok(audited.rows.some(r=>r.rank===10&&
    r.otherMatched.some(c=>c.name==='Marshadow'&&c.set==='UNB'&&c.number==='81')),
    'Marshadow UNB81 is the Resetting Hole printing, not Let Loose');
});
