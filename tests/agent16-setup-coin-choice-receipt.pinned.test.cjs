'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {runMatch,upstreamSmokeDeck}=require(
  '../simulation/twinleaf/headless.cjs');
const {sourceFirstFromSeed}=require(
  '../scripts/agent6-frozen-first-coin-census.cjs');

// These seeds were archived BEFORE this test, and are not drawn from the
// prospectively registered November rank6/rank11 source/cohort frame.
for(const [seed,heads] of [[1460221882,true],[861838028,false]]){
  test('genuine native Store setup prompt receipt and nonperturbation '+seed,()=>{
    const deck=upstreamSmokeDeck();
    assert.equal(deck.length,60);
    const request={deckA:deck,deckB:deck,seed,maxActions:80,
      isolatePolicyRandomness:true,captureDecisionTrace:true};
    const control=runMatch(request);
    const audited=runMatch({...request,captureSetupCoinChoiceReceipt:true});
    const receipt=audited.setupCoinChoiceReceipt;
    assert.equal(receipt.version,'agent16-accepted-native-setup-coin-and-first-choice-v1');
    assert.equal(receipt.status,
      'consistent-accepted-native-setup-and-first-draw');
    assert.equal(receipt.coin.heads,heads);
    assert.equal(receipt.choice.choseFirst,false);
    assert.equal(receipt.choice.choiceOwnerSeat,heads?0:1);
    assert.equal(receipt.firstSeatFromAcceptedSetup,heads?1:0);
    assert.equal(receipt.firstSeatFromVerifiedDraw,audited.firstTurnSlot);
    assert.equal(receipt.coin.resolution,'accepted-native-prompt');
    assert.equal(receipt.choice.resolution,'accepted-native-prompt');
    assert.equal(receipt.firstSeatFromVerifiedDraw,
      sourceFirstFromSeed('A',seed).firstSeat);
    assert.equal(receipt.competitiveGameQualified,false);
    assert.equal(control.setupCoinChoiceReceipt,undefined);
    for(const key of ['actions','winner','turns','finished','firstTurnSlot',
      'firstDrawLogName','seed','attackDeclarationTrace','rootActionLedger',
      'deckHashes','actionCounts','cardsPlayedBySeat']){
      assert.deepEqual(audited[key],control[key],
        'Coin telemetry perturbed native Store or policy: '+key);
    }
  });
}

test('original rank6 printed 60 vs fixed champion captures true source-first setup coin',()=>{
  const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
  const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
  initializeCards();
  const plan=planAichi(1,{allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
  const source=plan.opponents.find(row=>row.rank===6);
  assert.equal(source.status,'ready');
  assert.equal(source.cards.length,60);
  assert.equal(plan.candidate.cards.length,60);
  const base={deckA:plan.candidate.cards,deckB:source.cards,
    seed:20261019,maxActions:60,isolatePolicyRandomness:true,
    captureDecisionTrace:true};
  const control=runMatch(base);
  const audited=runMatch({...base,captureSetupCoinChoiceReceipt:true});
  assert.equal(audited.setupCoinChoiceReceipt.status,
    'consistent-accepted-native-setup-and-first-draw');
  assert.equal(audited.setupCoinChoiceReceipt.coin.coinWinnerSeat,0);
  assert.equal(audited.setupCoinChoiceReceipt.choice.choseFirst,false);
  assert.equal(audited.firstTurnSlot,1);
  for(const key of ['actions','turns','finished','winner','firstTurnSlot',
    'deckHashes','rootActionLedger','attackDeclarationTrace',
    'cardsPlayedBySeat']){
    assert.deepEqual(audited[key],control[key],
      'Authentic rank6 source policy perturbed by passive coin receipt: '+key);
  }
});
