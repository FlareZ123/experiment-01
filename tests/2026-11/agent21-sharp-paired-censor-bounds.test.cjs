'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {parse,analyze}=require('../../scripts/2026-11/agent21-sharp-paired-censor-bounds.cjs');
const matrix=path.resolve(__dirname,
  '../../results/methodology/2026-11/agent21-hood-full29-paired-censor-matrix-20261109.tsv');

test('registered 58 native pairs, sharp 55 matched-deal Hood/champion bounds',()=>{
  const output=analyze(parse(fs.readFileSync(matrix,'utf8')));
  assert.equal(output.registered,58);
  assert.equal(output.sourceMatched,55);
  assert.equal(output.sourceUnmatched,3);
  assert.deepEqual(output.statusCounts,{
    'both-terminal':41,'both-unresolved':8,'champion-unresolved':1,
    'hood-unresolved':5,unmatched:3
  });
  assert.equal(output.knownPairedDifference,3);
  assert.equal(output.lower,-9);
  assert.equal(output.upper,13);
  assert.equal(output.competitivePaperQualifiedGames,0);
  assert.deepEqual(output.perRank.filter(r=>r.unmatched).map(r=>r.rank),[8,16,26]);
});
test('both censored retain sharp -1 to +1 bounds',()=>{
  const out=analyze(parse('2 A 1 ? ?'));
  assert.deepEqual([out.lower,out.upper],[-1,1]);
});
test('one native champion win and missing Hood resolution yields -1 to zero',()=>{
  const out=analyze(parse('2 A 1 1 ?'));
  assert.deepEqual([out.lower,out.upper],[-1,0]);
});
test('one native Hood win and missing champion resolution yields zero to +1',()=>{
  const out=analyze(parse('2 A 1 ? 1'));
  assert.deepEqual([out.lower,out.upper],[0,1]);
});
test('mispaired and duplicate game rows are rejected',()=>{
  assert.throws(()=>parse('2 A 1 1 X'),/strictEqual|false/);
  assert.throws(()=>parse('2 A 1 1 1\n2 A 2 0 0'),/one observation/);
});
