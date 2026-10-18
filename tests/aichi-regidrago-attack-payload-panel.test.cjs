'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const manifest = require('../results/aichi-2026/full-decklists.json');
const {loadPrintedPokemon, regidragoAttackPayloadPanels} =
  require('../scripts/aichi-regidrago-attack-payload-panel.cjs');

const root = path.resolve(__dirname, '../resources');
const printed = loadPrintedPokemon(manifest, root);
const source = regidragoAttackPayloadPanels(manifest, printed);

test('source Dragon payloads and printed attack census', () => {
  assert.deepEqual(source.publishedRanks, [10,12,13,14,18,20,21,27,32]);
  assert.equal(source.distinctPayloads, 8);
  assert.equal(source.distinctPrintedAttacks, 14);
  assert.deepEqual(source.payloads.map(p => p.card), [
    'Dialga-GX','Dragapult ex','Hisuian Goodra VSTAR','Koraidon ex',
    'Kyurem','Mega Dragonite ex','Noivern ex','Salamence ex'
  ]);
  assert.equal(source.inventoryOnly,true);
  assert.equal(source.sourcePrintScope,'bundled-English-print-snapshot');
  assert.equal(source.payloads.find(p=>p.card==='Salamence ex').attacks.length,2);
});

test('optimal rank10 attack-library panel is ranks 10,13,32', () => {
  assert.equal(source.panels[0].attackCount,9);
  assert.equal(source.panels[0].payloadCount,5);
  assert.deepEqual(source.panels[0].ranks,[10]);
  assert.deepEqual(source.panels[1].ranks,[10,13]);
  assert.equal(source.panels[1].attackCount,13);
  assert.deepEqual(source.panels[1].missingPayloads,['Mega Dragonite ex']);
  assert.equal(source.minimumCompletePanelSize,3);
  assert.deepEqual(source.completeSmallestPanels.map(p=>p.ranks),[
    [10,13,32],[10,13,14],[10,13,20]
  ]);
  assert.deepEqual(source.panels[2].ranks,[10,13,32]);
  assert.equal(source.panels[2].attackCount,14);
  assert.equal(source.panels[2].distinctCardNames,51);
  assert.equal(source.panels.at(-1).attackCount,14);
});

test('source row splitting and ordering preserve printing-and-attack coverage', () => {
  const alt=structuredClone(manifest);
  alt.decks.reverse();
  for(const deck of alt.decks){
    deck.cards.reverse();
    const card=deck.cards.find(c=>c.count>1);
    card.count--;
    deck.cards.push({...card,count:1});
  }
  assert.deepEqual(regidragoAttackPayloadPanels(alt,loadPrintedPokemon(alt,root)),source);
});

test('source Pokémon print mismatch fails closed', () => {
  const alt=structuredClone(manifest);
  alt.decks.find(d=>d.rank===13).cards.find(c=>c.name==='Salamence ex').printing.number='999';
  assert.throws(()=>loadPrintedPokemon(alt,root),/not uniquely resolved/);
});

test('bad copy counts and duplicate source ranks are rejected', () => {
  const changed=structuredClone(manifest);
  changed.decks.find(d=>d.rank===10).cards[0].count=0;
  assert.throws(()=>regidragoAttackPayloadPanels(changed,printed),/Invalid source card count/);
  changed.decks.find(d=>d.rank===10).cards[0].count=1;
  assert.throws(()=>regidragoAttackPayloadPanels(changed,printed),/exactly 60/);
  const doubled=structuredClone(manifest);
  doubled.decks.push(structuredClone(doubled.decks.find(d=>d.rank===10)));
  assert.throws(()=>regidragoAttackPayloadPanels(doubled,printed),/distinct published Regidrago ranks/);
});
