'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const source = require('../results/aichi-2026/full-decklists.json');
const {auditPostdatedMEE} =
  require('../simulation/evaluation/agent17-may2026-future-energy-print-audit.cjs');

test('May 10 original 29-deck source contains 120 physically future MEE print variants across 22 ranks', () => {
  const a = auditPostdatedMEE(source);
  assert.equal(a.tournamentDate,'2026-05-10');
  assert.equal(a.postdatedArtworkRelease,'2026-09-16');
  assert.equal(a.decksChecked,29);
  assert.equal(a.affectedDecks,22);
  assert.equal(a.rows,35);
  assert.equal(a.copies,120);
  assert.deepEqual(a.affectedRanks,[
    1,2,3,8,9,10,11,12,13,14,15,16,18,19,20,21,22,26,27,30,31,32
  ]);
  assert.deepEqual(a.postdatedRows.filter(row=>row.rank===1), [{
    rank:1,player:'Yasunori Kato',name:'Psychic Energy',
    set:'MEE',number:13,copies:11
  }]);
  assert.equal(a.exactOriginalPrintingProven,false);
  assert.equal(a.sourceDeckCardIdentityUnchanged,true);
  assert.equal(a.qualifiedCompetitiveGames,0);
});

test('date audit is pure and cannot invent missing source ranks or normalize names',()=>{
  const copy=structuredClone(source);
  const a=auditPostdatedMEE(copy);
  assert.deepEqual(copy,source);
  assert.equal(a.postdatedRows.some(row=>[23,25,28].includes(row.rank)),false);
  assert.ok(a.postdatedRows.every(row=>
    /^\w+ Energy$/u.test(row.name)&&Number.isInteger(row.copies)&&
    row.number>=9&&row.number<=16));
});

test('only explicit dated MEE art family is flagged; other energy stays unchanged',()=>{
  const x={decks:[{rank:1,player:'Fixture',cards:[
    {name:'Psychic Energy',count:2,printing:{set:'MEE',number:'5'}},
    {name:'Psychic Energy',count:1,printing:{set:'MEE',number:'13'}},
    {name:'Special Energy',count:1,printing:{set:'CEC',number:'13'}},
    {name:'Psychic Energy',count:1,printing:{set:'MEE',number:'17'}}
  ]}]};
  const a=auditPostdatedMEE(x);
  assert.equal(a.rows,1);
  assert.equal(a.copies,1);
  assert.equal(a.postdatedRows[0].number,13);
});
