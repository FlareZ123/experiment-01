'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const frozen=require('../results/als/new-moon-lockbreak-japanese-print-60.json');
const proposal=require('../results/als/new-moon-two-gengar-one-cologne-japanese-print-60.json');
const english=require('../results/als/new-moon-two-gengar-one-cologne-english-proxy-60.json');
const source=require('../results/als/new-moon-official-japanese-print-60.json');
const bans=require('../results/legality/japan-expanded-aichi-2026.json');
const {validateJapanesePrintCandidate,validateEnglishProxyInventoryParity}=
  require('./new-moon-lockbreak-japanese-provenance.cjs');
const {check:datedPrintingCheck}=require('./new-moon-lockbreak-japanese-ban-screen.cjs');

const FINGERPRINT='2ac726a7ada76126ea750917194849c4ec0e8d52b18bab22ed5c63807b3c21d4';

/**
 * Strict paper-source 60 and 59-copy printing identity comparison for the
 * predeclared one-Gengar-for-one-Cologne structural research arm.
 * @param {object} proposed
 * @param {object} original
 * @param {object} englishProxy
 * @returns {object}
 */
function verify(proposed=proposal,original=frozen,englishProxy=english){
  validateJapanesePrintCandidate(original,source);
  assert.equal(proposed.schema,
    'new-moon-two-gengar-one-cologne-proposed-japanese-prints-v1');
  assert.equal(proposed.target_event_date,original.target_event_date);
  assert.equal(proposed.target_event_date,bans.valid_for_event);
  assert.equal(proposed.source_deck_code,original.source_deck_code);
  assert.equal(proposed.source_official_url,original.source_official_url);
  assert.equal(proposed.from_baseline_japanese_candidate,
    'results/als/new-moon-lockbreak-japanese-print-60.json');
  assert.equal(proposed.matched_english_structural_manifest,
    'results/als/new-moon-two-gengar-one-cologne-english-proxy-60.json');

  assert.equal(original.entries.length,34);
  assert.equal(proposed.entries.length,34);
  const counts=new Map(original.entries.map(e=>[e.name_en,e.count]));
  assert.equal(counts.get('Gengar & Mimikyu-GX'),1);
  assert.equal(counts.get('Canceling Cologne'),2);
  counts.set('Gengar & Mimikyu-GX',2);
  counts.set('Canceling Cologne',1);
  const names=new Set();
  const ids=new Set();
  let copies=0;
  for(const e of proposed.entries){
    assert.ok(!names.has(e.name_en),'Duplicate name: '+e.name_en);
    assert.ok(!ids.has(e.japanese_card_id),'Duplicate Japanese print: '+e.japanese_card_id);
    names.add(e.name_en);
    ids.add(e.japanese_card_id);
    const sourceRow=original.entries.find(x=>x.name_en===e.name_en);
    assert.ok(sourceRow,'Invented physical name: '+e.name_en);
    assert.equal(e.japanese_card_id,sourceRow.japanese_card_id,
      'Altered official Japanese printing identity: '+e.name_en);
    assert.equal(e.japanese_set,sourceRow.japanese_set,
      'Altered official Japanese set: '+e.name_en);
    assert.equal(e.count,counts.get(e.name_en),
      'Unexpected second-candidate count: '+e.name_en);
    assert.ok(Number.isInteger(e.count)&&e.count>=1&&e.count<=4);
    copies+=e.count;
  }
  assert.equal(names.size,34);
  assert.equal(ids.size,34);
  assert.equal(copies,60);
  assert.deepEqual(proposed.counts,
    {total:60,unique:34,pokemon:20,trainer:34,energy:6});
  const rows=proposed.entries.map(e=>e.japanese_card_id+':'+e.count)
    .sort().join('\n')+'\n';
  const sha256=createHash('sha256').update(rows).digest('hex');
  assert.equal(sha256,FINGERPRINT,'Physical proposed 60 fingerprint drift');
  assert.equal(proposed.japanese_id_count_sha256,FINGERPRINT);
  const parity=validateEnglishProxyInventoryParity(proposed,englishProxy);
  const banContacts=datedPrintingCheck(proposed.entries,bans);
  assert.deepEqual([...new Set(banContacts.map(e=>e.name))].sort(),
    ['Duskull','Unown']);
  return {printedCopies:copies,names:names.size,sha256,
    identicalPrintIdentities:true,
    changes:[{name:'Gengar & Mimikyu-GX',from:1,to:2},
      {name:'Canceling Cologne',from:2,to:1}],
    englishProxyNameCopyCountParity:parity,
    explicitHistoricalBanPrintingCollisions:0,
    fullLegalityCertified:false,qualifyingCompetitiveGames:0};
}

if(require.main===module)process.stdout.write(JSON.stringify(verify(),null,2)+'\n');
module.exports={verify,FINGERPRINT};
