'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const VERSION = 'agent22-original-aichi-promo-chronology-audit-v1';
const CODES = new Set(['BWP', 'SMP', 'SP', 'XYP']);

/**
 * Audit precise source promo aliases against documented distribution upper bounds.
 * A release-date bound establishes availability only, not physical provenance,
 * tournament legality, or an English-language printed equivalent.
 *
 * @param {{decks:Array<{rank:number,cards:Array<{name:string,count:number,printing:{set:string,number:string}}>}>,[key:string]:unknown}} archive
 * @param {{eventDate:string,entries:Array<{sourceSet:string,sourceNumber:string,name:string,copies:number,availableBy:string}>,sourceRows:number,sourceCopies:number}} manifest
 * @returns {object} Chronological coverage with unresolved aliases preserved.
 */
function auditPromoChronology(archive, manifest) {
  assert.ok(Array.isArray(archive.decks));
  assert.ok(Array.isArray(manifest.entries));
  assert.match(manifest.eventDate, /^\d{4}-\d{2}-\d{2}$/);

  const byPrinting = new Map();
  for (const entry of manifest.entries) {
    assert.ok(CODES.has(entry.sourceSet));
    assert.match(entry.availableBy, /^\d{4}-\d{2}-\d{2}$/);
    const key = entry.sourceSet + ':' + entry.sourceNumber;
    assert.ok(!byPrinting.has(key), 'duplicate promo printing ' + key);
    byPrinting.set(key, entry);
  }

  const sourceRows = [];
  const uncovered = [];
  let sourceCopies = 0;
  const observedCounts = new Map();
  for (const deck of archive.decks) {
    assert.ok(Number.isSafeInteger(deck.rank) && deck.rank > 0);
    let deckCopies = 0;
    for (const card of deck.cards) {
      assert.ok(Number.isSafeInteger(card.count) && card.count > 0);
      deckCopies += card.count;
      if (!CODES.has(card.printing.set)) continue;
      sourceCopies += card.count;
      const key = card.printing.set + ':' + card.printing.number;
      const proof = byPrinting.get(key);
      const row = {rank:deck.rank, name:card.name, copies:card.count,
        sourceSet:card.printing.set, sourceNumber:card.printing.number,
        availableBy:proof?.availableBy ?? null};
      sourceRows.push(row);
      if (!proof || proof.name !== card.name ||
          proof.availableBy > manifest.eventDate) {
        uncovered.push({...row,reason:!proof?'unmapped-printing':
          proof.name !== card.name?'name-mismatch':'post-event-bound'});
      } else {
        observedCounts.set(key,(observedCounts.get(key) ?? 0) + card.count);
      }
    }
    assert.equal(deckCopies,60,'original source is not 60 cards at rank '+deck.rank);
  }
  const countMismatches = manifest.entries
    .map(e=>({printing:e.sourceSet+':'+e.sourceNumber,
      expected:e.copies,observed:observedCounts.get(e.sourceSet+':'+e.sourceNumber)??0}))
    .filter(e=>e.expected!==e.observed);
  return {
    schema:VERSION, eventDate:manifest.eventDate,
    originalSourceDecks:archive.decks.length,
    promoRows:sourceRows.length, promoCopies:sourceCopies,
    documentedRows:sourceRows.length-uncovered.length,
    documentedCopies:sourceCopies-uncovered.reduce((s,x)=>s+x.copies,0),
    sourceRows, uncovered, countMismatches,
    expectedRows:manifest.sourceRows, expectedCopies:manifest.sourceCopies,
    releaseDateCoverageComplete:uncovered.length===0 &&
      countMismatches.length===0 && sourceRows.length===manifest.sourceRows &&
      sourceCopies===manifest.sourceCopies,
    historicalPhysicalPrintingsCertified:false,
    paperExpandedLegalityCertified:false,
    competitiveGamesQualified:0
  };
}

if (require.main === module) {
  const root=path.resolve(__dirname,'..');
  const archive=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const manifest=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/agent22-original-promo-source-chronology-20261105.json'),'utf8'));
  process.stdout.write(JSON.stringify(auditPromoChronology(archive,manifest),null,2)+'\n');
}
module.exports={VERSION,CODES,auditPromoChronology};
