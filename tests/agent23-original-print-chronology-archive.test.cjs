'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {auditEnglishDisplayDates}=require('../scripts/agent23-original-print-chronology.cjs');
const archive=require('../results/aichi-2026/full-decklists.json');
const englishSets=require('../resources/sets/en.json');
const crosswalk=require('../results/aichi-2026/agent23-english-CRI-japanese-M4-provenance-20261105.json');

test('actual frozen Aichi original 60 English chronology agrees with documented Japanese crosswalk',()=>{
  const audit=auditEnglishDisplayDates(archive,englishSets);
  assert.ok(audit.sourceDeckCount>=29);
  assert.equal(audit.originalCardCopies,audit.sourceDeckCount*60);
  assert.equal(audit.japaneseLegalityCertified,false);
  assert.equal(crosswalk.paperExpandedLegalityCertified,false);
  assert.equal(crosswalk.originalSourceNameCountSixtiesUnchanged,true);
  assert.equal(crosswalk.benchmarkEventDate,audit.eventDate);
  const byPrinting=entry=>[entry.rank,entry.name,entry.copies,
    entry.englishSetCode,entry.englishSetNumber??entry.englishPrinting?.split(' ').at(-1)]
    .join('|');
  const normalizedCrosswalk=crosswalk.sourceRows.map(row=>({
    rank:row.rank,name:row.name,copies:row.count,englishSetCode:
      row.englishPrinting.split(' ')[0],englishSetNumber:
      row.englishPrinting.split(' ')[1]
  }));
  assert.deepEqual(audit.englishDisplayAfterEvent.map(byPrinting).sort(),
    normalizedCrosswalk.map(byPrinting).sort());
  assert.equal(crosswalk.recordedRows,crosswalk.sourceRows.length);
  assert.equal(crosswalk.recordedCopies,crosswalk.sourceRows.reduce(
    (n,row)=>n+row.count,0));
  for(const row of crosswalk.sourceRows){
    const original=archive.decks.find(deck=>deck.rank===row.rank);
    assert.ok(original,'crosswalk rank missing from original archive');
    const card=original.cards.find(card=>card.name===row.name&&
      card.printing.set===row.englishPrinting.split(' ')[0]&&
      card.printing.number===row.englishPrinting.split(' ')[1]);
    assert.ok(card,'crosswalk printing missing from original source');
    assert.equal(card.count,row.count);
    assert.ok(row.japaneseOriginalPreEvent);
    assert.ok(row.englishDisplayPostEvent);
    assert.match(row.japaneseOfficialCardSource,
      /^https:\/\/www\.pokemon-card\.com\/card-search\//);
    assert.match(row.japaneseOriginal,/^M4 0\d{2}\/083$/);
  }
});

test('historical English chronology refuses to classify promo and Energy set identifiers',()=>{
  const audit=auditEnglishDisplayDates(archive,englishSets);
  const unresolved=new Map(audit.unresolvedEnglishCodes.map(x=>
    [x.code,x.copies]));
  for(const code of ['SMP','XYP','BWP','SP','MEE'])
    assert.ok(unresolved.has(code),'unresolved source code lost: '+code);
  assert.equal(audit.unresolvedEnglishCodeCopies,
    audit.unresolvedEnglishCodes.reduce((n,x)=>n+x.copies,0));
});
