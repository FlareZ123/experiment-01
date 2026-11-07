'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const originalEn=require('../results/als/new-moon-lockbreak-english-proxy-60.json');
const originalJp=require('../results/als/new-moon-lockbreak-japanese-print-60.json');
const alternatives=[
  require('../results/als/agent21-night-stretcher-carrier-fork-english-proxy-60.json'),
  require('../results/als/agent21-night-stretcher-carrier-fork-japanese-print-60.json')
];
const cardDb=require('../resources/cards/en/sv6pt5.json');
const {recoveryOrFogAvailability,initialSevenAtLeastOne}=
  require('../simulation/evaluation/agent21-secretbox-retrieval-item-fork.cjs');
const {twoTargetSearchAvailability}=
  require('../simulation/evaluation/agent21-root93-k0-two-target-availability.cjs');

/** @param {object} d @returns {Map<string,number>} */
const names=d=>new Map(d.entries.map(c=>[c.name_en,c.count]));

/** @param {Map<string,number>} m @returns {number} */
const sum=m=>[...m.values()].reduce((total,x)=>total+x,0);

test('candidate conserves two original 60s, changes only one Carrier into Night Stretcher',()=>{
  for(let i=0;i<2;i++){
    const before=names([originalEn,originalJp][i]);
    const after=names(alternatives[i]);
    assert.equal(sum(before),60);
    assert.equal(sum(after),60);
    assert.equal(after.get('Fog Crystal'),4);
    assert.equal(after.get('Rescue Carrier'),1);
    assert.equal(after.get('Night Stretcher'),1);
    const changed=[...new Set([...before.keys(),...after.keys()])]
      .map(name=>[name,(after.get(name)??0)-(before.get(name)??0)])
      .filter(row=>row[1]!==0).sort(([a],[b])=>a.localeCompare(b));
    assert.deepEqual(changed,[['Night Stretcher',1],['Rescue Carrier',-1]]);
  }
});

test('English and Japanese names share a complete 60 multiset',()=>{
  assert.deepEqual(
    [...names(alternatives[0])].sort(([a],[b])=>a.localeCompare(b)),
    [...names(alternatives[1])].sort(([a],[b])=>a.localeCompare(b))
  );
});

test('verified source card text prints Night Stretcher as Expanded-legal Item',()=>{
  const x=cardDb.find(c=>c.id==='sv6pt5-61');
  assert.equal(x.name,'Night Stretcher');
  assert.equal(x.supertype,'Trainer');
  assert.ok(x.subtypes.includes('Item'));
  assert.equal(x.legalities.expanded,'Legal');
  assert.ok(x.rules.some(t=>t===
    'Put a Pokémon or a Basic Energy card from your discard pile into your hand.'));
});

test('paper print ID and native print alias deliberately pinned',()=>{
  const e=alternatives[0].entries.find(c=>c.name_en==='Night Stretcher');
  const j=alternatives[1].entries.find(c=>c.name_en==='Night Stretcher');
  assert.equal(e.english_proxy_card_id,'sv6pt5-61');
  assert.equal(e.twinleaf_full_name,'Night Stretcher SFA');
  assert.equal(j.japanese_card_id,45931);
  assert.equal(j.japanese_set,'SV6a');
  assert.equal(j.japanese_number,'056/064');
  assert.equal(j.printing_source,
    'https://www.pokemon-card.com/card-search/details.php/card/45931');
});

test('slot fork keeps four-Fog initial seven incidence and original ACE SPEC',()=>{
  const before=names(originalEn),after=names(alternatives[0]);
  assert.equal(before.get('Fog Crystal'),after.get('Fog Crystal'));
  assert.equal(initialSevenAtLeastOne(4).numerator,'38962');
  assert.equal(initialSevenAtLeastOne(4).denominator,'97527');
  assert.equal(after.get('Secret Box'),1);
  for(const [name,count] of after){
    if(name!=='Basic Psychic Energy') assert.ok(count<=4,name);
    assert.ok(count>=1);
  }
});

test('three candidate conditional K0 paths correctly ordered, no win-rate inference',()=>{
  const source=twoTargetSearchAvailability({
    deckCount:35,prizeCount:6,firstTargetRemaining:1,
    secondTargetRemaining:3
  });
  const minusFog=recoveryOrFogAvailability({
    deckCount:35,prizeCount:6,basicUnresolved:1,
    fogUnresolved:2,retrievalUnresolved:1,basicInDiscard:2
  });
  const minusCarrier=recoveryOrFogAvailability({
    deckCount:35,prizeCount:6,basicUnresolved:1,
    fogUnresolved:3,retrievalUnresolved:1,basicInDiscard:2
  });
  assert.deepEqual(source.bothAvailable,{
    numerator:'17255',denominator:'20254',decimal:17255/20254
  });
  assert.equal(minusFog.bothRoutesAccessible.numerator,'39697');
  assert.equal(minusFog.bothRoutesAccessible.denominator,'40508');
  assert.equal(minusCarrier.bothRoutesAccessible.numerator,'1471169');
  assert.equal(minusCarrier.bothRoutesAccessible.denominator,'1498796');
  assert.equal(minusCarrier.residualFailure.numerator,'27627');
  assert.equal(minusCarrier.residualFailure.denominator,'1498796');
  assert.ok(minusCarrier.bothRoutesAccessible.decimal>
    minusFog.bothRoutesAccessible.decimal);
  assert.ok(minusFog.bothRoutesAccessible.decimal>
    source.bothAvailable.decimal);
  assert.equal(minusCarrier.gameWinRateEstimate,null);
  assert.equal(minusCarrier.empiricalNativeGameProbability,false);
});

test('without a discarded Basic the late rescue route cannot be funded',()=>{
  const withNoDiscard=recoveryOrFogAvailability({
    deckCount:35,prizeCount:6,basicUnresolved:1,
    fogUnresolved:3,retrievalUnresolved:1,basicInDiscard:0
  });
  assert.equal(withNoDiscard.recoveredBasicInDiscard,false);
  const original=twoTargetSearchAvailability({
    deckCount:35,prizeCount:6,firstTargetRemaining:1,secondTargetRemaining:3
  });
  assert.deepEqual(withNoDiscard.bothRoutesAccessible,
    original.bothAvailable);
});

test('two Rescue Carrier versus one exact seven-card hand incidence',()=>{
  const two=initialSevenAtLeastOne(2);
  const one=initialSevenAtLeastOne(1);
  assert.equal(one.numerator,'7');
  assert.equal(one.denominator,'60');
  assert.ok(two.decimal>one.decimal);
});

test('all candidate status flags reject attribution and competitive claims',()=>{
  assert.match(alternatives[0].status,/HYPOTHETICAL/);
  assert.match(alternatives[1].status,/PROPOSED/);
  assert.equal(alternatives[0].counts.total,60);
  assert.equal(alternatives[1].counts.total,60);
});
