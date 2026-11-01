'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {printCounts,printingSubstitutions,run}=
  require('../scripts/agent42-raichu-printing-sensitivity.cjs');

test('printed card IDs are distinct even for same-name cards',()=>{
  const one={cards:[{name:'A',count:59,printing:{set:'S',number:'1'}},
    {name:'Pikachu',count:1,printing:{set:'LOR',number:'52'}}]};
  const two={cards:[{name:'A',count:59,printing:{set:'S',number:'1'}},
    {name:'Pikachu',count:1,printing:{set:'XY',number:'42'}}]};
  assert.equal(printingSubstitutions(one,two),1);
  assert.equal(printingSubstitutions(two,one),1);
  assert.equal(printCounts(one).size,2);
});

test('source Raichu changes 20 names but 21 original printings',()=>{
  const a=run();
  assert.deepEqual(a.raichuRanks,[4,17]);
  assert.equal(a.nameReplacements,20);
  assert.equal(a.printedReplacements,21);
  assert.deepEqual(a.rank4Pikachu,{set:'LOR',number:'52',language:'en'});
  assert.deepEqual(a.rank17Pikachu,{set:'XY',number:'42',language:'en'});
  assert.equal(a.regidragoPairs.length,36);
  assert.equal(a.regidragoPrintingDivergencePairs.length,0);
  assert.equal(a.originalExactLists,29);
  assert.equal(a.qualifiedCompetitiveGames,0);
});
