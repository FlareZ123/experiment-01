'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {run} = require('../scripts/aichi-event-era-proxy-audit.cjs');
test('English event-era proxies have pre-event Japanese counterparts',()=>{
  const audit=run();
  assert.equal(audit.publishedDeckCount,29);
  assert.equal(audit.laterEnglishPrintEntryCount,3);
  assert.equal(audit.laterEnglishPhysicalCopies,5);
  assert.deepEqual(audit.lateEnglish.map(x=>[x.rank,x.cardName,x.copies]),[
    [5,'Special Red Card',2], [16,'Trubbish',2], [26,'Special Red Card',1]
  ]);
  assert.ok(audit.lateEnglish.every(x=> x.englishRelease==='2026-05-22' &&
    x.originalJapanese?.japaneseRelease==='2026-03-13' &&
    x.japanesePredatesEvent && !x.paperLegalityCertified));
  assert.equal(audit.unmappedSetEntryCount,57);
  assert.equal(audit.fullPaperLegalityCertified,false);
});
