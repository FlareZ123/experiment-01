'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const model=require('../scripts/agent11-newmoon-forced-lowhp-opening.cjs');
const ranks=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,
  19,20,21,22,24,26,27,29,30,31,32];
const basics=[14,14,11,13,11,4,12,10,11,15,11,15,11,14,14,11,
  13,16,16,14,14,12,4,12,15,4,16,15,13];
const mockInputs=()=>({
  manifest:{
    canonical_id_count_sha256:
      'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4',
    counts:{total:60,'Pokémon':19},
    entries:[
      {type:'Pokémon',name_en:'Dusclops',english_proxy_card_id:'sv6pt5-19',count:2},
      {type:'Pokémon',name_en:'Unown',english_proxy_card_id:'xy7-30',count:3},
      {type:'Pokémon',name_en:'Duskull',english_proxy_card_id:'swsh4-69',count:2},
      {type:'Pokémon',name_en:'Other Basic',english_proxy_card_id:'test-1',count:12},
      {type:'Trainer',name_en:'Battle VIP Pass',english_proxy_card_id:'swsh8-225',count:4},
      {type:'Trainer',name_en:'Fog Crystal',english_proxy_card_id:'swsh6-140',count:4}
    ]},
  audit:{fully_resolved:29,decks:ranks.map((rank,i)=>({
    rank,archetype:'authentic-source',basic_count_known:basics[i],
    basic_hp_at_most_60_known:rank===1?0:1,unresolved_pokemon:[]
  }))}
});
const approx=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,
  'Expected '+b+', got '+a);
test('frozen source inventory and 60 HP printing cardinality',()=>{
  const {manifest,audit}=mockInputs();
  assert.deepEqual(model.verifyPrintedInventories(manifest,audit),
    {newMoonBasics:17,newMoonLowHpBasics:5,
      championBasics:14,championLowHpBasics:0,directBasicAccessItems:8});
  manifest.entries[1].count=4;
  assert.throws(()=>model.verifyPrintedInventories(manifest,audit));
});
test('exact opening seven forced 60 HP Basic event',()=>{
  approx(model.forcedLowHpInSeven(17,5),0.08611228987206797);
  assert.equal(model.forcedLowHpInSeven(14,0),0);
  approx(model.forcedLowHpInSeven(17,17),
    0.2927817855650311);
});
test('all opponent mulligan bonus draws reduce solo 60 HP starter',()=>{
  approx(model.sourceConditionalExposure(17,5,4),0.059928507812890226);
  approx(model.sourceConditionalExposure(17,5,14),0.0824063037503438);
  approx(model.sourceConditionalExposure(17,5,16),0.08354738358708996);
  assert.ok(model.sourceConditionalExposure(17,5,4,1)<
    model.sourceConditionalExposure(17,5,4));
});
test('29 authentic ranks and two immutable candidate source baselines',()=>{
  const {manifest,audit}=mockInputs();
  const result=model.analyze(manifest,audit);
  assert.equal(result.rows.length,29);
  assert.equal(result.competitiveQualifiedGames,0);
  approx(result.allMaximumBonusDraws.newMoonAverage,0.07934050625640332);
  approx(result.allMaximumBonusDraws.reference,0);
  assert.ok(result.rows.filter(x=>x.sourceBasics===4).length===3);
  const tampered=mockInputs();
  tampered.audit.decks[0].basic_hp_at_most_60_known=1;
  assert.throws(()=>model.analyze(tampered.manifest,tampered.audit));
});

test('eight immediate Basic-search Items narrow uncovered solo starters',()=>{
  const {manifest,audit}=mockInputs();
  const gap=model.analyze(manifest,audit).directBasicSearcherAbsent;
  approx(gap.firstSeven,0.022927102284171396);
  approx(gap.meanOver29Sources,0.02042247352512743);
  approx(gap.sourceRank6,0.013917792366635089);
  assert.ok(gap.meanOver29Sources<0.07934050625640332);
  const invalid=mockInputs();
  invalid.manifest.entries.find(e=>e.name_en==='Fog Crystal').count=3;
  assert.throws(()=>model.analyze(invalid.manifest,invalid.audit));
});
