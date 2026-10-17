'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const source = require('../results/aichi-2026/full-decklists.json');
const {canonicalCards} = require('../scripts/aichi-comparison-campaign.cjs');
const {stablePrintingOrder, auditPrintingOrder} =
  require('../scripts/aichi-printing-order-audit.cjs');

/** @param {string} name @param {number} count */
const card = (name, count) => ({
  name, count, printing: {set: 'TST', number: '1', language: 'en'}
});

test('explicit code-unit order differs from collation on hyphen/quotation boundary', () => {
  const inventory = [card('Vileplume-GX', 30), card('Vileplume', 30)];
  const legacy = canonicalCards(inventory);
  const stable = stablePrintingOrder(inventory);
  assert.deepEqual(stable.map(row => row[0]), [...stable.map(row => row[0])].sort());
  assert.notDeepEqual(legacy, stable);
  assert.match(legacy[0][0], /Vileplume-GX/);
  assert.match(stable[0][0], /Vileplume"/);
});

test('stable printing digest is input-order invariant without changing live campaign', () => {
  const inventory = [card('Vileplume-GX', 30), card('Vileplume', 30)];
  assert.deepEqual(stablePrintingOrder(inventory), stablePrintingOrder([...inventory].reverse()));
  const report = auditPrintingOrder(source);
  assert.equal(report.currentCampaignChanged, false);
  assert.equal(report.records.length, 29);
  const mismatches = report.records.filter(row => row.differ).map(row => row.rank);
  assert.deepEqual(mismatches, [2, 9, 22, 31]);
  for (const record of report.records) {
    assert.match(record.legacyLocaleDigest, /^[a-f0-9]{64}$/);
    assert.match(record.stableCodeUnitDigest, /^[a-f0-9]{64}$/);
    assert.equal(record.differ, record.legacyLocaleDigest !== record.stableCodeUnitDigest);
  }
});
