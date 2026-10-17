'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {
  directGarbotoxinProbability,
  countCard,
  buildRows
}=require('../scripts/absol-garbotoxin-direct-lock.cjs');
const {loadBasicIndex}=require('../scripts/aichi_opening_audit.cjs');

/** @param {number} actual @param {number} expected @param {number} [tolerance] */
function near(actual,expected,tolerance=0.000001) {
  assert.ok(Math.abs(actual-expected)<=tolerance,
    'Expected '+actual+' to approximate '+expected);
}

/** @returns {{manifest:object,basics:Map<string,boolean|null>}} */
function source() {
  const root=path.resolve(__dirname,'..');
  return {
    manifest:JSON.parse(fs.readFileSync(
      path.join(root,'results/aichi-2026/full-decklists.json'),'utf8')),
    basics:loadBasicIndex(path.join(root,'resources/cards/en'))
  };
}

test('impossible natural three-part access remains zero',()=>{
  const x={basics:10,trubbish:2,enablers:0,floatStone:4,garbodor:2};
  assert.equal(directGarbotoxinProbability(x),0);
  assert.equal(directGarbotoxinProbability({...x,enablers:1,floatStone:0}),0);
  assert.equal(directGarbotoxinProbability({...x,enablers:1,garbodor:0}),0);
});

test('rejects disjoint or physically impossible card compositions',()=>{
  assert.throws(()=>directGarbotoxinProbability({
    basics:2,trubbish:3,enablers:1,floatStone:4,garbodor:2
  }),RangeError);
  assert.throws(()=>directGarbotoxinProbability({
    basics:10,trubbish:2,enablers:1,floatStone:4,garbodor:61
  }),RangeError);
});

test('source card census is independently rank-specific',()=>{
  const {manifest,basics}=source();
  const rows=buildRows(manifest,basics);
  assert.deepEqual(rows.map(x=>x.rank),[8,11,16,22]);
  assert.deepEqual(rows.map(x=>[
    x.basics,x.trubbish,x.garbodor,x.floatStone,x.boostShake,x.wally
  ]),[
    [10,2,2,4,1,1],
    [11,2,2,3,2,0],
    [11,2,3,4,2,0],
    [12,2,2,4,0,1]
  ]);
  const rank16=manifest.decks.find(x=>x.rank===16);
  assert.equal(countCard(rank16,'Garbodor'),3);
});

test('exact natural opener probabilities match independent enumeration',()=>{
  const {manifest,basics}=source();
  const rows=buildRows(manifest,basics);
  const values=new Map([
    [8,[0.0134893,0.0257604]],
    [11,[0.0193832,0.0193832]],
    [16,[0.0254620,0.0254620]],
    [22,[0,0.0124959]]
  ]);
  for(const row of rows) {
    const [first,second]=values.get(row.rank);
    near(row.firstTurnGoingFirst,first);
    near(row.firstTurnGoingSecond,second);
    assert.ok(row.firstTurnGoingSecond>=row.firstTurnGoingFirst);
  }
});

test('first-turn Wally is excluded from first-player enabler category',()=>{
  const {manifest,basics}=source();
  const rows=buildRows(manifest,basics);
  const rank8=rows.find(x=>x.rank===8);
  const rank22=rows.find(x=>x.rank===22);
  assert.ok(rank8.firstTurnGoingSecond>rank8.firstTurnGoingFirst);
  assert.equal(rank22.firstTurnGoingFirst,0);
  assert.ok(rank22.firstTurnGoingSecond>0);
});
