'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {runMatch,upstreamSmokeDeck}=require(
  '../simulation/twinleaf/headless.cjs');
const {withLiveCardInstanceReceipts}=require(
  '../simulation/twinleaf/agent34-live-card-instance-receipts.cjs');

test('read-only original Store printing receipts preserve a native seeded game',()=>{
  const cards=upstreamSmokeDeck();
  assert.equal(cards.length,60);
  const request={deckA:cards,deckB:cards,seed:20261019,
    maxActions:80,isolatePolicyRandomness:true,
    captureDecisionTrace:true};
  const baseline=runMatch(request);
  const observed=withLiveCardInstanceReceipts(()=>runMatch(request));
  const actual=observed.result;
  for(const key of ['actions','turns','finished','winner','seed',
    'firstTurnSlot','deckHashes','actionCounts','rootActionLedger',
    'attackDeclarationTrace']){
    assert.deepEqual(actual[key],baseline[key],
      'Read-only Store instance inspection changed native output '+key);
  }
  const receipts=observed.audit;
  assert.equal(receipts.originalStoreCaptured,true);
  assert.equal(receipts.rejectedPlayCardRoots,0);
  assert.equal(receipts.acceptedPlayCardRoots,
    actual.rootActionLedger.filter(row=>row.action==='PlayCardAction').length,
    'PlayCard Store receipts must cover exactly the real ledger roots');
  assert.ok(receipts.acceptedPlayCardRoots>0,
    'Real native source deal must expose at least one played card');
  for(const row of receipts.accepted){
    assert.ok(row.seat===0||row.seat===1);
    assert.equal(typeof row.printing,'string');
    assert.ok(row.printing.length>0);
    assert.equal(typeof row.executableConstructor,'string');
    assert.ok(Number.isSafeInteger(row.executablePrototypeToken));
    assert.equal(row.paperEffectVerified,false);
  }
  assert.equal(receipts.headlessOrdinalJoinVerified,false);
  assert.equal(receipts.competitiveGameQualified,false);
  console.log('AGENT34_LIVE_CARD_INSTANCES',JSON.stringify({
    source:'upstream-pinned-smoke-deck',
    seed:request.seed,actions:actual.actions,
    nativePlayRoots:receipts.acceptedPlayCardRoots,
    bySeat:{0:receipts.accepted.filter(x=>x.seat===0).length,
      1:receipts.accepted.filter(x=>x.seat===1).length},
    examples:receipts.accepted.slice(0,6).map(x=>({
      printing:x.printing,constructor:x.executableConstructor,
      token:x.executablePrototypeToken,seat:x.seat})),
    gameChanged:false,competitiveQualified:false
  }));
});
