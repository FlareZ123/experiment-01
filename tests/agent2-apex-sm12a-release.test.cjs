'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {auditRegisteredJapanesePrints,EXPECTED}=
  require('../scripts/agent2-apex-jp-print-audit.cjs');
const json=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
const old=json('results/legality/agent2-apex-alchemy-jp-crosswalk-v1.json');
const newer=json('results/legality/agent2-apex-alchemy-jp-crosswalk-v2.json');
const dates=json('results/legality/agent2-apex-alchemy-jp-release-chronology-v2.json');
const bans=json('results/legality/japan-expanded-aichi-2026.json');
const sources={
 v0:json('results/aichi-2026/agent43-apex-alchemy-paper-expanded-v0.json'),
 v1:json('results/aichi-2026/agent2-apex-alchemy-shake4-quick2-v1.json')
};
const changes={
 'sve-1':{name:'基本草エネルギー',number:'202/173',url:'https://www.pokemon-card.com/card-search/details.php/card/37470'},
 'sve-2':{name:'基本炎エネルギー',number:'203/173',url:'https://www.pokemon-card.com/card-search/details.php/card/37471'}
};
test('Japanese 60 integrity and exact two-print energy substitution',()=>{
 assert.equal(newer.schema,'agent2-apex-alchemy-jp-crosswalk-v2');
 const compatible={...newer,schema:'agent2-apex-alchemy-jp-crosswalk-v1'};
 assert.equal(auditRegisteredJapanesePrints(sources,compatible,bans).status,
  'necessary-print-identity-checks-pass');
 for(const label of ['v0','v1']){
  assert.equal(newer.registered_candidates[label].deck_identity_sha256,EXPECTED[label]);
  const before=old.registered_candidates[label].prints;
  const after=newer.registered_candidates[label].prints;
  assert.equal(after.length,34);
  let changed=0;
  for(let i=0;i<34;i++){
   assert.deepEqual(after[i].english_proxy,before[i].english_proxy);
   assert.equal(after[i].count,before[i].count);
   const info=changes[after[i].english_proxy.cardId];
   if(info){
    assert.equal(before[i].japanese_print.set,'SV-P');
    assert.equal(after[i].japanese_name,info.name);
    assert.deepEqual(after[i].japanese_print,{set:'SM12a',number:info.number});
    assert.equal(after[i].official_card_url,info.url);
    changed+=after[i].count;
   }else assert.deepEqual(after[i],before[i]);
  }
  assert.equal(changed,6);
 }
});
test('all 29 selected Japanese products have publisher pre-event dates',()=>{
 assert.equal(dates.schema,'agent2-apex-japanese-set-release-provenance-v2');
 assert.equal(dates.eligibility_proven,false);
 assert.equal(dates.qualified_competitive_games,0);
 assert.equal(dates.records.length,29);
 const bySet=new Map(dates.records.map(r=>[r.expansion_code,r]));
 assert.equal(bySet.size,29);
 assert.equal(bySet.has('SV-P'),false);
 assert.equal(bySet.get('SM12a').original_publisher_release_date,'2019-10-04');
 assert.equal(bySet.get('SM12a').official_product_released_date_source,
  'https://www.pokemon-card.com/ex/sm12a/index.html');
 for(const row of dates.records){
  assert.match(row.original_publisher_release_date,/^\\d{4}-\\d{2}-\\d{2}$/);
  assert.ok(row.original_publisher_release_date<dates.event_date);
  assert.equal(row.pre_event_product_release_witness,true);
 }
 for(const label of ['v0','v1']){
  let slots=0;
  const byCopies=new Map();
  for(const card of newer.registered_candidates[label].prints){
   const row=bySet.get(card.japanese_print.set);
   assert.ok(row);
   assert.ok(row.registered_english_card_names.includes(card.english_proxy.name));
   slots+=card.count;
   byCopies.set(row.expansion_code,(byCopies.get(row.expansion_code)||0)+card.count);
  }
  assert.equal(slots,60);
  assert.equal(byCopies.size,29);
  for(const [set,n] of byCopies)
   assert.equal(bySet.get(set)['registered_physical_card_slots_'+label],n);
  assert.equal(dates.coverage['pre_event_dated_physical_slots_'+label],60);
 }
});
