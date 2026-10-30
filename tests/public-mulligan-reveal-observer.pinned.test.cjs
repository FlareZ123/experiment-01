'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
const {runMatch}=require('../simulation/twinleaf/headless.cjs');

// Three independently sampled seeds, frozen before native execution.
// Both physical seat orientations and both observer states are retained.
// This is an observer noninterference test; no game here qualifies as a win.
const SEEDS=[4136149016,1514735430,3730833191];

/** @param {object} candidate @param {object} source */
function runPair(candidate,source,seed,candidateSeat){
  const common={
    deckA:candidateSeat===0?candidate:source,
    deckB:candidateSeat===1?candidate:source,
    seed,maxActions:110,
    captureInitialFullPhysicalDeal:true,
    captureSetupCompensation:true,
    captureDecisionTrace:true,
    label:'agent31-public-mulligan-noninterference-v1'
  };
  return [
    runMatch({...common,capturePublicMulliganReveals:false}),
    runMatch({...common,capturePublicMulliganReveals:true})
  ];
}

test('pinned original Store public-mulligan read-only capture preserves all native gameplay and matches actual shuffles',()=>{
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  assert.ok(Array.isArray(plan.candidate.cards)&&plan.candidate.cards.length===60);
  const source=plan.opponents.find(x=>x.rank===6);
  assert.equal(source.status,'ready');
  let positive=0,total=0;
  const examples=[];
  for(const seed of SEEDS)for(const candidateSeat of [0,1]){
    const [before,after]=runPair(
      plan.candidate.cards,source.cards,seed,candidateSeat);
    total++;
    assert.equal(before.initialPublicMulliganReveals,undefined);
    assert.equal(before.initialFullPhysicalDealFingerprint?.digestSha256,
      after.initialFullPhysicalDealFingerprint?.digestSha256,
      'Public read-only observer changed original two-seat physical deal');
    assert.deepEqual(before.initialSetupCompensation,
      after.initialSetupCompensation,
      'Public read-only observer changed native optional bonus');
    assert.equal(before.actions,after.actions);
    assert.equal(before.turns,after.turns);
    assert.equal(before.finished,after.finished);
    assert.equal(before.winner,after.winner);
    assert.deepEqual(before.decisionTrace,after.decisionTrace,
      'Public read-only observer changed actual root and prompt actions');
    const reveal=after.initialPublicMulliganReveals;
    assert.equal(reveal?.schema,'native-public-opponent-mulligan-reveal-v1');
    assert.equal(reveal.excludesPrivateCurrentHandDeckPrize,true);
    assert.equal(reveal.effectOnActorPolicy,false);
    assert.deepEqual(reveal.revealedHandCounts,
      after.initialSetupCompensation.mulligans,
      'Public original-Store mulligan reveal count disagrees with shuffles');
    const sourceSeat=1-candidateSeat;
    if(reveal.revealedHandCounts[sourceSeat]>0)positive++;
    for(const seat of [0,1])for(const hand of reveal.handsByOwner[seat]){
      assert.equal(hand.length,7);
      for(const card of hand)
        assert.ok(typeof card==='string'&&card.length>0);
    }
    examples.push({
      seed,candidateSeat,firstTurnSlot:after.firstTurnSlot,
      perSeatPublicInvalidHands:reveal.revealedHandCounts,
      sourcePublicNames:reveal.handsByOwner[sourceSeat]
        .slice(0,1).flat().slice(0,7),
      acceptedDraws:after.initialSetupCompensation.bonusDrawn,
      samePhysicalDeal:true,identicalActionTrace:true
    });
  }
  console.log('AGENT31_NATIVE_PUBLIC_MULLIGAN_RECEIPTS',
    JSON.stringify({total,positiveSourceMulliganSetups:positive,
      unqualifiedGames:total,examples}));
  assert.equal(total,6);
});
