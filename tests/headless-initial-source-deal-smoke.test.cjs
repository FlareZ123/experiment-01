'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {runMatch,upstreamSmokeDeck}=
  require('../simulation/twinleaf/headless.cjs');

test('real setup then opt-in source digest does not perturb seeded Store',()=>{
  const deck=upstreamSmokeDeck();
  assert.equal(deck.length,60);
  const request={
    deckA:deck,deckB:deck,seed:20261019,maxActions:80,
    isolatePolicyRandomness:true,
    captureDecisionTrace:true
  };
  const control=runMatch(request);
  const observed=runMatch({
    ...request,captureInitialSourceDealFingerprintSeat:0
  });
  const evidence=observed.initialSourceDealFingerprint;
  assert.ok(evidence,'Stable first-turn source root never observed');
  assert.equal(evidence.seat,0);
  assert.equal(evidence.schema,'initial-source-physical-position-sha256-v1');
  assert.match(evidence.digestSha256,/^[a-f0-9]{64}$/);
  assert.equal(control.initialSourceDealFingerprint,undefined);
  for(const key of ['actions','winner','turns','finished','firstTurnSlot',
    'seed','engine','attackDeclarationTrace','rootActionLedger','deckHashes',
    'actionCounts']) {
    assert.deepEqual(observed[key],control[key],
      'Read-only digest changed the live game: '+key);
  }
});

test('each physical source seat can be selected for a postgame-only digest',()=>{
  const deck=upstreamSmokeDeck();
  const request={deckA:deck,deckB:deck,
    seed:20261020,maxActions:80,
    isolatePolicyRandomness:true,
    captureInitialSourceDealFingerprintSeat:1};
  const observed=runMatch(request);
  assert.equal(observed.initialSourceDealFingerprint?.seat,1);
  assert.match(observed.initialSourceDealFingerprint?.digestSha256,
    /^[a-f0-9]{64}$/);
});
