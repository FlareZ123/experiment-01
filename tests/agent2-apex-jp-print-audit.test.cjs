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


test('core-mechanics publisher source notes stay pinned to the 34 Japanese identities',()=>{
  const notes=json('results/legality/agent2-apex-alchemy-japanese-core-mechanics-v1.json');
  assert.equal(notes.schema,'agent2-apex-japanese-core-mechanics-source-screen-v1');
  assert.equal(notes.reviewed_count,34);
  assert.equal(notes.items.length,34);
  const byId=new Map(notes.items.map(x=>[x.english_card_id,x]));
  assert.equal(byId.size,34);
  for(const card of CROSS.registered_candidates.v0.prints){
    const actual=byId.get(card.english_proxy.cardId);
    assert.ok(actual,'Missing source-referenced Japanese core note');
    assert.equal(actual.english_name,card.english_proxy.name);
    assert.equal(actual.japanese_name,card.japanese_name);
    assert.deepEqual(actual.japanese_print,card.japanese_print);
    assert.equal(actual.official_japanese_record,card.official_card_url);
    assert.equal(actual.primary_effect_screen_status,
      'consistent-at-mechanic-summary-level');
    assert.equal(actual.event_print_release_and_errata_certification,'unverified');
  }
  assert.equal(notes.competitive_qualified_games,0);
});


test('publisher 28-family historical chronology and six 2025 promo slots remain traceable',()=>{
  const dates=json('results/legality/agent2-apex-alchemy-jp-release-chronology-v1.json');
  const event=dates.event_date;
  assert.equal(dates.schema,'agent2-apex-japanese-set-release-provenance-v1');
  assert.equal(event,'2026-05-10');
  const byCode=new Map(dates.records.map(r=>[r.expansion_code,r]));
  assert.equal(dates.records.length,29);
  assert.equal(byCode.size,29);
  for(const label of ['v0','v1']){
    let slots=0;
    for(const c of CROSS.registered_candidates[label].prints){
      const r=byCode.get(c.japanese_print.set);
      assert.ok(r,'Unknown Japanese printing expansion');
      assert.ok(r.registered_english_card_names.includes(c.english_proxy.name));
      slots+=c.count;
    }
    assert.equal(slots,60);
    assert.equal(dates.coverage['total_physical_slots_'+label],60);
    assert.equal(dates.coverage['pre_event_dated_physical_slots_'+label],54);
    assert.equal(dates.coverage['pre_event_distribution_supported_slots_'+label],60);
  }
  const published=dates.records.filter(r=>r.original_publisher_release_date!==null);
  assert.equal(published.length,28);
  for(const r of published){
    assert.match(r.original_publisher_release_date,/^\d{4}-\d{2}-\d{2}$/);
    assert.ok(r.original_publisher_release_date<event,'Published after Aichi event');
    assert.equal(r.pre_event_product_release_witness,true);
    assert.equal(new URL(r.official_product_released_date_source).hostname,
      'www.pokemon-card.com');
  }
  const promo=byCode.get('SV-P');
  assert.equal(promo.original_publisher_release_date,null);
  assert.equal(promo.pre_event_product_release_witness,null);
  assert.equal(promo.pre_event_distribution_evidenced_by_triangulation,true);
  assert.equal(promo.earliest_publisher_award_event_date,'2024-09-22');
  assert.equal(promo.earliest_numbered_card_release_day_confirmed,false);
  assert.equal(new URL(promo.primary_publisher_award_announcement).hostname,
    'www.pokemon-card.com');
  assert.deepEqual(dates.coverage.undated_promo_family,['SV-P']);
  assert.equal(dates.eligibility_proven,false);
  assert.equal(dates.qualified_competitive_games,0);
});

test('historical print chronology cannot be silently postdated or misassign card slots',()=>{
  const dates=json('results/legality/agent2-apex-alchemy-jp-release-chronology-v1.json');
  const wrong=structuredClone(dates);
  const v0=CROSS.registered_candidates.v0.prints;
  wrong.records.find(r=>r.expansion_code==='S12').original_publisher_release_date='2026-12-31';
  assert.ok(wrong.records.some(r=>r.original_publisher_release_date!==null &&
    r.original_publisher_release_date>=wrong.event_date));
  assert.equal(v0.reduce((n,c)=>n+c.count,0),60);
  const assigned=new Set(wrong.records.flatMap(r=>r.registered_english_card_names));
  assert.equal(assigned.size,34);
  wrong.records.find(r=>r.expansion_code==='S12').registered_english_card_names=[];
  const reassigned=new Set(wrong.records.flatMap(r=>r.registered_english_card_names));
  assert.ok(reassigned.size<34,'Detect lost Japanese card identity mapping');
});
