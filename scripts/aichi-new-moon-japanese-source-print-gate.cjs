'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const projectFile=relative=>JSON.parse(fs.readFileSync(
  path.resolve(__dirname,'..',relative),'utf8'));

/**
 * Cross-check the exact 33 Japanese printing identifiers from the official
 * deck-code export against the source image, the currently frozen English
 * effects map and the date-specific Japanese ban inventory.
 *
 * A matched set prefix excludes only the printed variants explicitly named
 * by that ban record; reprint/errata classes need their own source audit.
 *
 * @param {object} official
 * @param {object} source
 * @param {object} english
 * @param {object} bans
 * @returns {object}
 */
function audit(official,source,english,bans) {
  assert.equal(official.schema,'new-moon-official-japanese-prints-v1');
  assert.equal(official.event_date,'2026-05-10');
  assert.equal(bans.valid_for_event,official.event_date);
  assert.equal(official.source_code,source.official_japanese_deck_code);
  assert.equal(english.source_code,official.source_code);
  assert.equal(official.entries.length,33);
  assert.equal(english.entries.length,33);
  assert.equal(source.entries.length,33);
  let printedCount=0;
  const identifiers=new Set();
  const sameNameBanContacts=[];
  for(let index=0;index<official.entries.length;index++) {
    const japanese=official.entries[index];
    const observed=source.entries[index];
    const proxy=english.entries[index];
    assert.equal(japanese.name_en,observed.name_en);
    assert.equal(japanese.name_en,proxy.name);
    assert.equal(japanese.count,observed.count);
    assert.equal(japanese.count,proxy.count);
    assert.ok(Number.isSafeInteger(japanese.japanese_card_id));
    assert.ok(japanese.japanese_card_id>0);
    assert.match(japanese.japanese_set,/^[A-Za-z0-9+-]+$/);
    assert.ok(!identifiers.has(japanese.japanese_card_id),
      'Duplicate Japanese printing ID across distinct source names');
    identifiers.add(japanese.japanese_card_id);
    printedCount+=japanese.count;
    for(const ban of bans.banned_identities) {
      if(ban.english_name!==japanese.name_en) continue;
      sameNameBanContacts.push({
        name:japanese.name_en,
        sourceJapaneseId:japanese.japanese_card_id,
        sourceJapaneseSet:japanese.japanese_set,
        namedBanPrinting:ban.japanese_printing||null,
        banSelector:ban.selector
      });
      if(ban.selector.type==='trainer_name'||ban.selector.type==='pokemon_name')
        assert.fail('Entire card identity prohibited: '+japanese.name_en);
      assert.ok(japanese.japanese_set!==ban.japanese_printing,
        'Selected Japanese set collides with specifically banned printing: '+japanese.name_en);
    }
  }
  assert.equal(printedCount,60);
  assert.equal(identifiers.size,33);
  assert.deepEqual([...new Set(sameNameBanContacts.map(x=>x.name))].sort(),
    ['Duskull','Unown']);
  const duskull=official.entries.find(x=>x.name_en==='Duskull');
  const unown=official.entries.find(x=>x.name_en==='Unown');
  assert.equal(duskull.japanese_set,'S4');
  assert.equal(duskull.japanese_card_id,38541);
  assert.equal(unown.japanese_set,'XY');
  assert.equal(unown.japanese_card_id,33598);
  return {
    schema:'new-moon-japanese-source-print-ban-collision-screen-v1',
    sourceDeckCode:official.source_code,
    eventDate:official.event_date,
    printedCopies:printedCount,sourceRows:identifiers.size,
    originalJapaneseCardIdsPresent:true,
    datedBannedNameMatches:sameNameBanContacts,
    namedBannedPrintingCollision:false,
    historicalReleaseDateFullyVerified:false,
    errataAndRelatedReprintsFullyVerified:false,
    paperLegalityCertified:false,
    qualifiedForCompetitiveInference:false
  };
}

function auditFromResources() {
  return audit(
    projectFile('results/als/new-moon-official-japanese-print-60.json'),
    projectFile('results/als/new-moon-perfection-source-60.json'),
    projectFile('results/als/new-moon-perfection-english-map.json'),
    projectFile('results/legality/japan-expanded-aichi-2026.json')
  );
}

if(require.main===module)process.stdout.write(JSON.stringify(auditFromResources(),null,2)+'\n');
module.exports={audit,auditFromResources};
