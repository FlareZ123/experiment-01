'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {seedFor,registeredCases,fixedOutcome,projectOwnerRoot}=
  require('../simulation/twinleaf/agent18-original29-crossseat-native-k0.cjs');

test('all recovered Aichi sources have two distinct native seat seeds',()=>{
  const arms=registeredCases();
  assert.equal(arms.length,58);
  assert.equal(new Set(arms.map(x=>x.rank)).size,29);
  assert.equal(new Set(arms.map(x=>x.seed)).size,58);
  assert.equal(arms.filter(x=>x.orientation===0).length,29);
  assert.equal(arms.filter(x=>x.orientation===1).length,29);
  assert.ok(arms.every(x=>![23,25,28].includes(x.rank)));
  assert.equal(seedFor(10,1),seedFor(10,1));
  assert.notEqual(seedFor(10,0),seedFor(10,1));
  assert.throws(()=>seedFor(23,2));
});
test('actor-only output excludes identities of concealed Prize and deck cards',()=>{
  const root={
    seat:1,turn:1,ownActivePublicPrinting:'Bunnelby PRC',
    ownBenchPublicPrintings:['Lillipup CEC'],
    ownerKnownHand:['Stealthy Hood UNB'],
    originalDeckTop:'PRIVATE_DECK',originalPrizePrinting:'PRIVATE_PRIZE',
    nativeStoreToolActionEncodingEquivalent:true
  };
  const p=projectOwnerRoot(root);
  assert.equal(p.physicalSeat,1);
  assert.equal(p.nativeStoreToolActionEncodingEquivalent,true);
  assert.ok(!JSON.stringify(p).includes('PRIVATE_'));
});
test('original Store parity fields are preserved',()=>{
  const input={deckHashes:['a','b'],winner:null,
    actions:48,turns:10,endReason:'max-actions',prizesRemaining:[6,6],
    unimportant:'omit'};
  const p=fixedOutcome(input);
  assert.equal(p.unimportant,undefined);
  assert.equal(p.actions,48);
  assert.deepStrictEqual(p.prizesRemaining,[6,6]);
});
