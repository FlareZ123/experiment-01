'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const {auditRegisteredJapanesePrints,cardIdentitySha256,EXPECTED}=
  require('../scripts/agent2-apex-jp-print-audit.cjs');

const ROOT=path.resolve(__dirname,'..');
/** @param {string} p */
const json=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const SOURCES={
  v0:json('results/aichi-2026/agent43-apex-alchemy-paper-expanded-v0.json'),
  v1:json('results/aichi-2026/agent2-apex-alchemy-shake4-quick2-v1.json')
};
const CROSS=json('results/legality/agent2-apex-alchemy-jp-crosswalk-v1.json');
const BANS=json('results/legality/japan-expanded-aichi-2026.json');
/** @param {object} [sources] @param {object} [cross] @param {object} [bans] */
const audit=(sources=SOURCES,cross=CROSS,bans=BANS)=>
  auditRegisteredJapanesePrints(sources,cross,bans);

test('frozen v0 and v1 English 60-card identities cross to 34 Japanese prints',()=>{
  const out=audit();
  assert.equal(out.status,'necessary-print-identity-checks-pass');
  assert.equal(out.eventDate,'2026-05-10');
  for(const key of ['v0','v1']) {
    assert.equal(cardIdentitySha256(SOURCES[key].cards),EXPECTED[key]);
    assert.equal(out.candidates[key].officialJapaneseCardRecords,34);
    assert.equal(out.candidates[key].japanesePrintSlots,60);
    assert.deepEqual(out.candidates[key].categoryCopies,
      {'Pokémon':20,'Trainer':30,'Energy':10});
    assert.equal(out.candidates[key].aceSpecCopies,1);
    assert.equal(out.candidates[key].qualifiedCompetitiveGames,0);
    assert.equal(out.candidates[key].declaredPaperLegal,null);
  }
  assert.equal(out.historicalJapanesePrintReleaseDatesVerified,false);
  assert.equal(out.japaneseVersusEnglishCardTextFullyAudited,false);
  assert.equal(out.officialEventPaperLegalityProven,false);
});

test('mutating a registered source count is caught before translating',()=>{
  const source=structuredClone(SOURCES);
  source.v0.cards[0].count++;
  assert.throws(()=>audit(source),/Expected values to be strictly equal/);
});

test('mismatched English ID or number cannot masquerade as a Japanese print',()=>{
  const cross=structuredClone(CROSS);
  cross.registered_candidates.v0.prints[0].english_proxy.number='999';
  assert.throws(()=>audit(SOURCES,cross),/Expected values to be strictly equal/);
  cross.registered_candidates.v0.prints[0].english_proxy.number='135';
  cross.registered_candidates.v0.prints[0].english_proxy.cardId='alien-999';
  assert.throws(()=>audit(SOURCES,cross),/Unregistered original printing/);
});

test('foreign official URL and mismatched Japanese v0/v1 identity both fail',()=>{
  const cross=structuredClone(CROSS);
  cross.registered_candidates.v0.prints[0].official_card_url='https://example.com/card/123';
  assert.throws(()=>audit(SOURCES,cross),/Expected values to be strictly equal/);
  cross.registered_candidates.v0.prints[0].official_card_url=
    CROSS.registered_candidates.v0.prints[0].official_card_url;
  cross.registered_candidates.v1.prints[0].japanese_print.number='999/999';
  assert.throws(()=>audit(SOURCES,cross),/Japanese print changed/);
});

test('Japanese printed name four-of and historical banned name checks reject',()=>{
  const name=structuredClone(CROSS);
  for(const key of ['v0','v1']) {
    const cards=name.registered_candidates[key].prints;
    cards.find(c=>c.english_proxy.name==='Boost Shake').japanese_name=
      cards.find(c=>c.english_proxy.name==='Quick Ball').japanese_name;
  }
  assert.throws(()=>audit(SOURCES,name),/Japanese four-of name violation/);
  const banned=structuredClone(CROSS);
  for(const key of ['v0','v1'])
    banned.registered_candidates[key].prints
      .find(c=>c.english_proxy.name==='Guzma').japanese_name='レッドカード';
  assert.throws(()=>audit(SOURCES,banned),/Banned historical Japanese Trainer/);
});

test('variant swap and digest cannot drift',()=>{
  const source=structuredClone(SOURCES);
  const v1=source.v1.cards.find(c=>c.name==='Boost Shake');
  v1.count=3;
  assert.throws(()=>audit(source),/Expected values to be strictly equal/);
  const cross=structuredClone(CROSS);
  cross.registered_candidates.v1.deck_identity_sha256=EXPECTED.v0;
  assert.throws(()=>audit(SOURCES,cross),/Expected values to be strictly equal/);
});

test('unverified Japanese history and prohibited-name sensitivity are preserved',()=>{
  const snapshot=structuredClone(BANS);
  snapshot.valid_for_event='2026-11-03';
  assert.throws(()=>audit(SOURCES,CROSS,snapshot),/Expected values to be strictly equal/);
  const banned=structuredClone(BANS);
  banned.banned_identities.push({japanese_name:'スボミー',
    english_name:'Budew',selector:{type:'ability',value:'unrelated'}});
  assert.throws(()=>audit(SOURCES,CROSS,banned),/Unresolved banned Pokémon identity/);
});
