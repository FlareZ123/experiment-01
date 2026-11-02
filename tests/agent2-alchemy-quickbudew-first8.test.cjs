'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const base=require('../results/aichi-2026/agent43-apex-alchemy-paper-expanded-v0.json');
const variant=require('../results/aichi-2026/agent2-apex-alchemy-shake4-quick2-v1.json');
const treasure=require('../resources/cards/en/sm6.json').find(c=>c.id==='sm6-113');
const budew=require('../resources/cards/en/me2pt5.json').find(c=>c.id==='me2pt5-16');
const quick=require('../resources/cards/en/swsh8.json').find(c=>c.id==='swsh8-237');
const {targetBasicQuickAccess}=require('../simulation/evaluation/agent2-alchemy-quickbudew-first8.cjs');

/** @param {number} actual @param {number} expected */
function percent(actual,expected){
  assert.ok(Math.abs(100*actual-expected)<1e-8,'Expected '+expected+'%, observed '+100*actual+'%');
}
/** @param {object} deck @param {string} id @returns {number} */
function count(deck,id){return deck.cards.find(x=>x.cardId===id)?.count??0;}

test('actual frozen 60s and printed Item-search eligibility',()=>{
  assert.equal(base.total_cards,60);
  assert.equal(variant.total_cards,60);
  assert.equal(base.deck_identity_sha256,variant.base_deck_identity_sha256);
  for(const [id,b,v] of [['me2pt5-16',1,1],['swsh8-237',3,2],
    ['sm6-113',4,4],['swsh7-142',3,4]]){
    assert.equal(count(base,id),b,id);
    assert.equal(count(variant,id),v,id);
  }
  assert.ok(budew.subtypes.includes('Basic'));
  assert.deepEqual(budew.types,['Grass']);
  assert.ok(treasure.rules.some(t=>/search your deck for a Psychic or Dragon Pokémon/i.test(t)));
  assert.ok(quick.rules.some(t=>/search your deck for a Basic Pokémon/i.test(t)));
});
test('exact six-Prize conditional first-eight one-Budew access tradeoff',()=>{
  const b=targetBasicQuickAccess({targetCopies:1,quickCopies:3,totalBasic:12});
  const v=targetBasicQuickAccess({targetCopies:1,quickCopies:2,totalBasic:12});
  percent(b.basicValidInitialSeven,80.93533073);
  percent(v.basicValidInitialSeven,80.93533073);
  percent(b.directConditional,16.02961584);
  percent(v.directConditional,16.02961584);
  percent(b.idealizedQuickSearchConditional,25.47435977);
  percent(v.idealizedQuickSearchConditional,17.98426598);
  percent(b.unionConditional,41.50397560);
  percent(v.unionConditional,34.01388181);
  assert.equal(b.itemPaymentModeled,false);
  assert.equal(v.activeMobilityModeled,false);
});
test('zero-Quick and two-target bounds are internally coherent',()=>{
  const b=targetBasicQuickAccess({targetCopies:1,quickCopies:0,totalBasic:12});
  percent(b.unionConditional,16.02961584);
  percent(b.idealizedQuickSearchConditional,0);
  const pair=targetBasicQuickAccess({targetCopies:2,quickCopies:3,totalBasic:12});
  percent(pair.unionConditional,54.07785452);
  const cut=targetBasicQuickAccess({targetCopies:2,quickCopies:2,totalBasic:12});
  percent(cut.unionConditional,47.04203514);
  assert.throws(()=>targetBasicQuickAccess({
    targetCopies:20,quickCopies:50,totalBasic:12
  }),RangeError);
});
console.log('AGENT2_ALCHEMY_BUDEW_COST '+JSON.stringify({
  sourceHash:base.deck_identity_sha256,
  challengerHash:variant.deck_identity_sha256,
  baseline:targetBasicQuickAccess({targetCopies:1,quickCopies:3,totalBasic:12}),
  variant:targetBasicQuickAccess({targetCopies:1,quickCopies:2,totalBasic:12}),
  scope:'exact opportunity only; neither discard payment nor active mobility modeled'
}));
