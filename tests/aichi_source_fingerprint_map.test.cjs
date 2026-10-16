'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {fingerprintPublishedField}=require('../scripts/aichi-source-fingerprint-map.cjs');
const {canonicalCards,parseField}=require('../scripts/aichi-comparison-campaign.cjs');
const dir=path.resolve(__dirname,'../results/aichi-2026');
const fieldCsv=fs.readFileSync(path.join(dir,'field.csv'),'utf8');
const published=JSON.parse(fs.readFileSync(path.join(dir,'full-decklists.json'),'utf8'));
const hash=value=>createHash('sha256').update(value).digest('hex');

/** @returns {object} Synthetic 32-rank inventory for structure tests only. */
function syntheticFull() {
  const source=structuredClone(published);
  const fields=parseField(fieldCsv);
  for (const row of fields.filter(row=>!row.published)) {
    source.decks.push({
      rank:row.rank,player:row.player,archetype:row.archetype,
      cards:structuredClone(source.decks[0].cards)
    });
  }
  const completeCsv=fieldCsv.replaceAll(',no\n',',yes\n');
  return {source,completeCsv};
}

test('exact 29 source ranks are fingerprinted; missing ranks retain no hash',()=>{
  const x=fingerprintPublishedField(published,fieldCsv);
  assert.equal(x.rankCount,32);
  assert.equal(x.publishedSourceCount,29);
  assert.deepEqual(x.missingRanks,[23,25,28]);
  assert.equal(x.sourceInventoryDigestSha256,null);
  assert.equal(x.complete,false);
  assert.equal(x.fieldManifestSha256,hash(fieldCsv));
  assert.equal(x.ranked.find(r=>r.rank===1).sourceDeckSha256,
    hash(JSON.stringify(canonicalCards(published.decks[0].cards))));
});

test('per-deck row order is irrelevant but exact printing changes a digest',()=>{
  const a=structuredClone(published);
  const x=fingerprintPublishedField(a,fieldCsv);
  a.decks[0].cards.reverse();
  const reordered=fingerprintPublishedField(a,fieldCsv);
  assert.equal(reordered.ranked[0].sourceDeckSha256,x.ranked[0].sourceDeckSha256);
  a.decks[0].cards[0].printing.number+='-not-source';
  const changed=fingerprintPublishedField(a,fieldCsv);
  assert.notEqual(changed.ranked[0].sourceDeckSha256,x.ranked[0].sourceDeckSha256);
});

test('synthetic complete field seal matches ordered rank/digest JSON bytes',()=>{
  const {source,completeCsv}=syntheticFull();
  const x=fingerprintPublishedField(source,completeCsv);
  assert.equal(x.complete,true);
  assert.deepEqual(x.missingRanks,[]);
  assert.equal(x.publishedSourceCount,32);
  assert.match(x.sourceInventoryDigestSha256,/^[0-9a-f]{64}$/);
  const expected=hash(JSON.stringify(
    x.ranked.map(r=>[r.rank,r.sourceDeckSha256])));
  assert.equal(x.sourceInventoryDigestSha256,expected);
});

test('source/membership/provenance disagreements fail closed',()=>{
  const absent=structuredClone(published);
  absent.decks.splice(0,1);
  assert.throws(()=>fingerprintPublishedField(absent,fieldCsv),/mismatch/);
  const duplicate=structuredClone(published);
  duplicate.decks.push(structuredClone(duplicate.decks[0]));
  assert.throws(()=>fingerprintPublishedField(duplicate,fieldCsv),/Duplicate/);
  const changed=structuredClone(published);
  changed.decks[0].player='wrong attribution';
  assert.throws(()=>fingerprintPublishedField(changed,fieldCsv),/mismatch/);
  const malformed=structuredClone(published);
  malformed.decks[0].cards[0].count=0;
  assert.throws(()=>fingerprintPublishedField(malformed,fieldCsv),/Invalid card row/);
});

test('the 29-inventory manifest cannot masquerade as full coverage',()=>{
  assert.throws(()=>fingerprintPublishedField(published,
    fieldCsv.replaceAll(',no\n',',yes\n')),/mismatch/);
});
