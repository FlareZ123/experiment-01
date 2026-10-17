'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {assertMatchedMatrix}=require('../simulation/twinleaf/aichi-rank10-pale-moon-choice-matrix.cjs');

function matrix() {
  return ['pass','attack','retreat'].flatMap(choice=>
    ['raw','retreat-corrected'].map(semantics=>({
      choice,semantics,sourceDigest:'same-physical-deal',
      deckHashes:{A:'fixed-A',B:'fixed-B'},winner:1,prizes:[2,1],
      removedRootPending:choice==='retreat'&&semantics==='retreat-corrected'?1:0,
      window:[{action:choice}]
    })));
}
test('six-source-cell contract accepts matching source and exact profile matrix',()=>{
  assert.equal(assertMatchedMatrix(matrix()),true);
});
test('reject a different predecision source graph',()=>{
  const cells=matrix();
  cells[4].sourceDigest='different';
  assert.throws(()=>assertMatchedMatrix(cells),/Source divergence/);
});
test('reject loss of an actual source Pending KO cleanup',()=>{
  const cells=matrix();
  cells[5].removedRootPending=0;
  assert.throws(()=>assertMatchedMatrix(cells),/must remove/);
});
test('reject correction accidentally touching unchanged Active',()=>{
  const cells=matrix();
  cells[1].removedRootPending=1;
  assert.throws(()=>assertMatchedMatrix(cells),/must not trigger/);
});
test('reject duplicate arm or altered physical printing',()=>{
  const cells=matrix();
  cells[1].semantics='raw';
  assert.throws(()=>assertMatchedMatrix(cells),/Duplicate/);
  const altered=matrix();
  altered[3].deckHashes={A:'different',B:'fixed-B'};
  assert.throws(()=>assertMatchedMatrix(altered),/printing identity/);
});
