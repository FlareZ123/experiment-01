'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const source = require('../results/aichi-2026/full-decklists.json');
const {FEATURES, GROUPS, countPrintings, analyse} =
  require('../scripts/aichi-printing-lock-surface.cjs');

test('source completeness and precise counts are preserved', () => {
  const output = analyse(source);
  assert.equal(output.coverage, 29);
  assert.equal(output.fieldTotal, 32);
  assert.deepEqual(output.missingRanks, [23,25,28]);
  assert.equal(output.rows.length, 29);
  const copies = {
    garbotoxin: 9, vileplumeItemLock: 4,
    vileplumeBasicAttackBlock: 1, ironThornsInitialization: 12,
    wobbuffetBideBarricade: 5, klefkiMischievousLock: 2,
    budewItchyPollen: 19, pathToPeak: 8,
    fieldBlower: 11, lostVacuum: 1, pokemonRanger: 5,
    stealthyHood: 7, cancelingCologne: 2, escapeRope: 11
  };
  for (const [name, physicalCopies] of Object.entries(copies)) {
    assert.equal(output.features[name].physicalCopies, physicalCopies, name);
  }
  assert.equal(output.features.garbotoxin.listedDecks, 4);
  assert.equal(output.features.vileplumeItemLock.listedDecks, 2);
  assert.equal(output.features.budewItchyPollen.listedDecks, 14);
  assert.equal(output.features.fieldBlower.listedDecks, 9);
  assert.equal(output.features.lostVacuum.listedDecks, 1);
  assert.equal(output.features.pokemonRanger.listedDecks, 5);
  assert.equal(output.features.stealthyHood.listedDecks, 4);
  assert.equal(output.groups.itemPressurePrinted.listedDecks, 14);
  assert.equal(output.groups.persistentBoardConstraintsPrinted.listedDecks, 18);
  assert.equal(output.groups.anySelectedConstraintPrinted.listedDecks, 23);
  assert.equal(output.groups.printedItemToolRemoval.listedDecks, 9);
  assert.deepEqual(output.groups.printedItemToolRemoval.ranks,
    [1,5,7,8,19,22,29,30,31]);
});

test('identical names can have different rules on different original printings', () => {
  const output = analyse(source);
  const byRank = new Map(output.rows.map(row => [row.rank, row]));
  assert.equal(byRank.get(15).counts.vileplumeItemLock, 2);
  assert.equal(byRank.get(15).counts.vileplumeBasicAttackBlock, 1);
  assert.equal(byRank.get(2).counts.vileplumeItemLock, 2);
  assert.equal(byRank.get(2).counts.vileplumeBasicAttackBlock, 0);
  assert.equal(byRank.get(16).counts.garbotoxin, 3);
  assert.equal(byRank.get(8).counts.garbotoxin, 2);
  assert.equal(byRank.get(11).counts.garbotoxin, 2);
  assert.equal(byRank.get(5).counts.fieldBlower, 1);
  assert.equal(byRank.get(5).counts.lostVacuum, 1);
  assert.equal(byRank.get(22).counts.lostVacuum, 0);
});

test('printing identity changes a count even when card name agrees', () => {
  const toy = {cards: [
    {name:'Vileplume', count:2, printing:{set:'AOR',number:'3'}},
    {name:'Vileplume', count:1, printing:{set:'BUS',number:'6'}},
    {name:'Garbodor', count:2, printing:{set:'LTR',number:'68'}},
    {name:'Garbodor', count:1, printing:{set:'BKP',number:'57'}},
    {name:'Garbodor', count:1, printing:{set:'XY',number:'4'}}
  ]};
  assert.equal(countPrintings(toy, FEATURES.vileplumeItemLock), 2);
  assert.equal(countPrintings(toy, FEATURES.vileplumeBasicAttackBlock), 1);
  assert.equal(countPrintings(toy, FEATURES.garbotoxin), 3);
  assert.equal(Object.keys(GROUPS).length, 4);
});
