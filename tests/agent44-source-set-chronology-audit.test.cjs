'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {auditEnglishProxySetChronology} =
  require('../simulation/evaluation/agent44-source-set-chronology-audit.cjs');

const sets = [
  {id:'me4',ptcgoCode:'CRI',name:'Chaos Rising',releaseDate:'2026/05/22'},
  {id:'me3',ptcgoCode:'POR',name:'Perfect Order',releaseDate:'2026/03/27'},
  {id:'x',ptcgoCode:'DUO',name:'One',releaseDate:'2025/01/01'},
  {id:'y',ptcgoCode:'DUO',name:'Two',releaseDate:'2025/02/01'}
];
const cards = [
  {category:'Trainer',name:'Special Red Card',count:2,printing:{set:'CRI',number:'82'}},
  {category:'Pokémon',name:'Trubbish',count:3,printing:{set:'CRI',number:'56'}},
  {category:'Pokémon',name:'Pikachu',count:1,printing:{set:'POR',number:'1'}},
  {category:'Energy',name:'Psychic Energy',count:4,printing:{set:'MEE',number:'13'}},
  {category:'Trainer',name:'Fixture',count:1,printing:{set:'DUO',number:'2'}}
];
const data = {decks:[{rank:5,player:'Test',cards}]};

test('counts only known later English release labels and records unresolved codes', () => {
  const original = structuredClone(data);
  const result = auditEnglishProxySetChronology(data, sets);
  assert.equal(result.sourceDecks,1);
  assert.equal(result.postdatedRows,2);
  assert.equal(result.postdatedCopies,5);
  assert.deepEqual(result.affectedRanks,[5]);
  assert.equal(result.unresolvedRows,2);
  assert.equal(result.unresolvedCopies,5);
  assert.deepEqual(result.unresolvedRowDetails.map(row=>row.reason),
    ['unknown-english-set-code','ambiguous-english-set-code']);
  assert.deepEqual(data,original);
  assert.equal(result.historicalPrintingEstablished,false);
  assert.equal(result.paperLegalityEstablished,false);
});

test('date boundary is strict and category is retained without legal inference', () => {
  const result = auditEnglishProxySetChronology(data,sets,'2026/05/22');
  assert.equal(result.postdatedCopies,0);
  assert.equal(result.knownSetRows,3);
  assert.equal(result.originalNamesAndCountsChanged,false);
});

test('all 29 original rosters flag five CRI copies without changing any row', () => {
  const roster = require('../results/aichi-2026/full-decklists.json');
  const fullSets = require('../resources/sets/en.json');
  const result = auditEnglishProxySetChronology(roster,fullSets);
  assert.equal(result.sourceDecks,29);
  assert.equal(result.postdatedRows,3);
  assert.equal(result.postdatedCopies,5);
  assert.deepEqual(result.affectedRanks,[5,16,26]);
  assert.deepEqual(result.postdatedRowDetails.map(x=>[x.rank,x.name,x.copies,x.sourceSetCode,x.sourceNumber]),[
    [5,'Special Red Card',2,'CRI','82'],
    [16,'Trubbish',2,'CRI','56'],
    [26,'Special Red Card',1,'CRI','82']
  ]);
  assert.equal(result.historicalPrintingEstablished,false);
  assert.equal(result.qualifiedCompetitiveGames,0);
});
