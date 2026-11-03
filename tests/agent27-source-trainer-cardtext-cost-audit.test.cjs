'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  printedHandDiscardModes,auditBundledSourceCardText
}=require('../scripts/agent27-source-trainer-cardtext-cost-audit.cjs');

test('actual bundled source exact prints have the advertised discard costs',()=>{
  const a=auditBundledSourceCardText();
  assert.equal(a.originalDecks,29);
  assert.equal(a.verifiedExactSourcePrintings,8);
  assert.equal(a.verifiedOriginalTrainerCopies,231);
  assert.equal(a.originalUnverifiedTrainerCopies,804);
  assert.equal(a.sourceCardTextVerified,true);
  assert.ok(a.records.every(r=>r.printedVariants.length>=1&&
    r.printedVariants.every(v=>v.discardModes.join(',')===
      [...r.ruleModes].sort((x,y)=>x-y).join(','))));
  const map=new Map(a.records.map(r=>[r.printing,r]));
  assert.deepEqual(map.get('Guzma & Hala CEC').ruleModes,[0,2]);
  assert.deepEqual(map.get('Secret Box TWM').ruleModes,[3]);
  assert.deepEqual(map.get('Mysterious Treasure FLI').ruleModes,[1]);
});

test('unknown hand discard wording cannot silently downgrade to zero cost',()=>{
  assert.throws(()=>printedHandDiscardModes([
    'You must discard your entire hand to play this.']),/Unknown discard/);
  assert.throws(()=>printedHandDiscardModes([
    'You may discard 2 other cards from your hand.',
    'You must discard another card from your hand.']),/Ambiguous/);
  assert.deepEqual(printedHandDiscardModes(['Search your deck.']),[0]);
});
