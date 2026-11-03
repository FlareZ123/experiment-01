'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {
  VERSION,recoveryHeldAfterOneDraw,
  sourceBasicCopyCensus,sourceFieldFirstRecoveryWindow
}=require('../scripts/agent15-first-root-recovery-no-target.cjs');
const {loadBundledPublicPrintMetadata,withSourcePromoAliases}=
  require('../simulation/twinleaf/planning/owner-public-discard-target-necessary.cjs');

const index=withSourcePromoAliases(loadBundledPublicPrintMetadata(
  path.join(__dirname,'../resources')));

test('brute physical tiny-deck opening + eighth parity, Basic-before-next draw',()=>{
  const x=recoveryHeldAfterOneDraw({
    deckSize:6,openingHand:2,basics:2,recoveries:2
  });
  assert.equal(x.conditionalOnBasicValidSeven.numerator,'26');
  assert.equal(x.conditionalOnBasicValidSeven.denominator,'36');
  assert.equal(x.unconditionalFirstEight.numerator,'16');
  assert.equal(x.unconditionalFirstEight.denominator,'20');
  assert.equal(x.sixHiddenPrizesMarginalized,true);
});

test('null recovery copies have zero numerator; no Basic is invalid',()=>{
  const r=recoveryHeldAfterOneDraw({
    deckSize:60,openingHand:7,basics:11,recoveries:0});
  assert.equal(r.conditionalOnBasicValidSeven.numerator,'0');
  assert.throws(()=>recoveryHeldAfterOneDraw({
    deckSize:60,openingHand:7,basics:0,recoveries:4}));
});

test('original-rank5 and original-rank11 equal-Basic exact opening envelopes',()=>{
  const a=recoveryHeldAfterOneDraw({
    deckSize:60,openingHand:7,basics:11,recoveries:4});
  assert.equal(a.conditionalOnBasicValidSeven.numerator,'6775884588');
  assert.equal(a.conditionalOnBasicValidSeven.denominator,'15916235808');
  const b=recoveryHeldAfterOneDraw({
    deckSize:60,openingHand:7,basics:11,recoveries:2});
  assert.equal(b.conditionalOnBasicValidSeven.numerator,'3789323769');
  assert.equal(b.conditionalOnBasicValidSeven.denominator,'15916235808');
});

test('source print variants agree on native-style Basic classification',()=>{
  const source={cards:[
    {category:'Pokémon',count:2,name:'Regirock',
      printing:{set:'XYP',number:'49'}},
    {category:'Pokémon',count:3,name:'Shadow Rider Calyrex VMAX',
      printing:{set:'CRE',number:'75'}},
    {category:'Pokémon',count:1,name:'Bouffalant',
      printing:{set:'BLW',number:'90'}}
  ]};
  const result=sourceBasicCopyCensus(source,index);
  assert.deepEqual(result.unresolved,[]);
  assert.equal(result.basics,3);
});

test('unknown original Pokémon stage cannot be silently classified Basic',()=>{
  const source={cards:[{category:'Pokémon',count:3,name:'Unavailable',
    printing:{set:'UNKNOWN',number:'1'}}]};
  const r=sourceBasicCopyCensus(source,index);
  assert.equal(r.basics,null);
  assert.equal(r.lowerBoundBasics,0);
  assert.equal(r.unresolved.length,1);
});

test('two mocked physical original 60s preserve rank and aggregate held items',()=>{
  const cards=[
    {category:'Pokémon',count:11,name:'Regirock',
      printing:{set:'XYP',number:'49'}},
    {category:'Trainer',count:4,name:'VS Seeker',
      printing:{set:'PHF',number:'109'}},
    {category:'Trainer',count:45,name:'Training Arena',
      printing:{set:'ABC',number:'1'}}
  ];
  const field={decks:[{rank:5,archetype:'mock',cards}]};
  const result=sourceFieldFirstRecoveryWindow(field,index);
  assert.equal(result.version,VERSION);
  assert.equal(result.authenticatedOriginals,1);
  assert.equal(result.sourceRecoveryCopySum,4);
  assert.equal(result.sourcesWithUnresolvedBasicCopies,0);
  assert.equal(result.rows[0].opening.conditionalOnBasicValidSeven.numerator,
    '6775884588');
  assert.equal(result.qualifiedGames,0);
  assert.throws(()=>sourceFieldFirstRecoveryWindow({decks:[
    {rank:5,archetype:'mock',cards},{rank:5,archetype:'mock',cards}
  ]},index));
});
