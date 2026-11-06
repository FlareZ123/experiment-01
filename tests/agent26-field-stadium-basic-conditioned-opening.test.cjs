'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  conditionalBasicStadiumSeven,sourcePokemonIsPrintedBasic,run
}=require('../scripts/agent26-field-stadium-basic-conditioned-opening.cjs');

test('exact conditional two-Stadium hypergeometric counts',()=>{
  assert.deepEqual(conditionalBasicStadiumSeven([1,1],4),{
    numerator:1419606n,denominator:154289520n
  });
  assert.deepEqual(conditionalBasicStadiumSeven([2,1],6),{
    numerator:3821202n,denominator:209106360n
  });
  assert.deepEqual(conditionalBasicStadiumSeven([1,1,1],4),{
    numerator:4054448n,denominator:154289520n
  });
  assert.equal(conditionalBasicStadiumSeven([4],4).numerator,0n);
  assert.equal(conditionalBasicStadiumSeven([],4).numerator,0n);
});

test('Basic Pokémon exactly identified by matched source set and number',()=>{
  const source={category:'Pokémon',name:'Sample',
    printing:{set:'TST',number:'17'}};
  const sets=[{id:'testset',ptcgoCode:'TST'}];
  assert.equal(sourcePokemonIsPrintedBasic(source,sets,()=>[
    {number:'17',name:'Sample',supertype:'Pokémon',subtypes:['Basic']}
  ]),true);
  assert.equal(sourcePokemonIsPrintedBasic(source,sets,()=>[
    {number:'17',name:'Sample',supertype:'Pokémon',subtypes:['Stage 1']}
  ]),false);
  assert.throws(()=>sourcePokemonIsPrintedBasic(source,sets,()=>[]),
    /unresolved exact Pokémon print/);
  assert.throws(()=>sourcePokemonIsPrintedBasic(source,sets,()=>[
    {number:'17',name:'Different',supertype:'Pokémon',subtypes:['Basic']}
  ]),/printed Pokémon identity mismatch/);
});

test('Basic-conditioned count fails on impossible copy partition',()=>{
  assert.throws(()=>conditionalBasicStadiumSeven([30,20],20),
    /disjoint cards/);
  assert.throws(()=>conditionalBasicStadiumSeven([1,2],61));
});

test('entire 29-original field resolves authentic Pokémon printings',()=>{
  const result=run();
  assert.equal(result.authenticatedDeckCount,29);
  assert.equal(result.rows.length,29);
  assert.equal(result.rows.filter(r=>r.distinctStadiumNames>1).length,18);
  const ranks=new Set(result.rows.map(x=>x.rank));
  for(const missing of [23,25,28])
    assert.equal(ranks.has(missing),false);
  const sixth=result.rows.find(x=>x.rank===6);
  assert.equal(sixth.printedBasicPokemonCount,4);
  assert.equal(sixth.distinctStadiumNames,3);
  assert.ok(sixth.conditionalPercent>0&&sixth.conditionalPercent<3.3548);
  for(const row of result.rows){
    assert.ok(row.printedBasicPokemonCount>=1&&
      row.printedBasicPokemonCount<=60);
    assert.ok(row.conditionalPercent!==null&&
      row.conditionalPercent>=0&&row.conditionalPercent<=100);
  }
  console.log('AGENT26_CONDITIONAL_BASIC_STADIUM_SUMMARY',
    JSON.stringify({mean:result.unweightedConditionalMeanPercent,
      rows:result.rows.map(x=>({
        rank:x.rank,basics:x.printedBasicPokemonCount,
        stadiumNames:x.distinctStadiumNames,
        conditionalPercent:x.conditionalPercent
      }))}));
});
