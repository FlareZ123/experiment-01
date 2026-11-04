'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  printedHandDiscardModes,auditBundledSourceCardText
}=require('../scripts/agent27-source-trainer-cardtext-cost-audit.cjs');

test('actual bundled source exact prints have the advertised discard costs',()=>{
  const a=auditBundledSourceCardText();
  assert.equal(a.originalDecks,29);
  assert.equal(a.verifiedExactSourcePrintings,12);
  assert.equal(a.verifiedOriginalTrainerCopies,259);
  assert.equal(a.originalUnverifiedTrainerCopies,776);
  assert.equal(a.sourceCardTextVerified,true);
  assert.ok(a.records.every(r=>r.printedVariants.length>=1&&
    r.printedVariants.every(v=>v.discardModes.join(',')===
      [...r.ruleModes].sort((x,y)=>x-y).join(','))));
  const map=new Map(a.records.map(r=>[r.printing,r]));
  assert.deepEqual(map.get('Guzma & Hala CEC').ruleModes,[0,2]);
  assert.deepEqual(map.get('Secret Box TWM').ruleModes,[3]);
  assert.deepEqual(map.get('Mysterious Treasure FLI').ruleModes,[1]);
  for(const [printing,copies,modes] of [
    ['Plumeria BUS',20,[2]],
    ['Bellelba & Brycen-Man CEC',3,[0,3]],
    ['Cynthia & Caitlin CEC',4,[0,1]],
    ['Dowsing Machine PLS',1,[2]]
  ]){
    assert.equal(map.get(printing)?.copies,copies,printing);
    assert.deepEqual(map.get(printing)?.ruleModes,modes,printing);
  }
});

test('unknown hand discard wording cannot silently downgrade to zero cost',()=>{
  assert.throws(()=>printedHandDiscardModes([
    'You must discard your entire hand to play this.']),/Unknown discard/);
  assert.throws(()=>printedHandDiscardModes([
    'You may discard 2 other cards from your hand.',
    'You must discard another card from your hand.']),/Ambiguous/);
  assert.deepEqual(printedHandDiscardModes(['Search your deck.']),[0]);
});

test('optional additional hand discard modes require exact source language',()=>{
  assert.deepEqual(printedHandDiscardModes([
    'When you play this card, you may discard 3 other cards from your hand. If you do, each player discards Benched Pokémon.'
  ]),[0,3]);
  assert.deepEqual(printedHandDiscardModes([
    'When you play this card, you may discard another card from your hand. If you do, draw 3 cards.'
  ]),[0,1]);
  assert.deepEqual(printedHandDiscardModes([
    'Discard 2 cards from your hand. (If you cannot, you cannot play this card.)'
  ]),[2]);
  assert.throws(()=>printedHandDiscardModes([
    'When you play this card, you may discard 3 other cards from your hand. You must discard another card from your hand.'
  ]),/Ambiguous/);
});

// Include the strict source-identity regression in the existing paper card audit.
require('./agent27-original-trainer-print-identity-audit.test.cjs');
