'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {captureSetupOnly}=require('./aichi-setup-only-capture.cjs');
const {openingInventoriesMatch}=require('../twinleaf/opening-setup-zones.cjs');
const {accruePairedFourCells}=
  require('../../scripts/aichi-paired-four-cell-accrual.cjs');

const SOURCE_SCHEMA='initial-source-physical-position-sha256-v1';
/** @param {string[]} deck Ordered pinned-engine physical printing IDs. */
function deckDigest(deck){
  assert.ok(Array.isArray(deck)&&deck.length===60);
  assert.ok(deck.every(id=>typeof id==='string'&&id.length>0));
  return createHash('sha256').update(JSON.stringify(deck)).digest('hex');
}

/**
 * Execute only the original pinned Store setup for both immutable comparison
 * decks in one registered physical seed/seat block. Neither arm reaches a
 * normal turn decision or has an observed game outcome. This is an intake
 * bridge, not a simulator policy or a performance test.
 *
 * @param {object} plan Externally frozen v2 four-cell registration.
 * @param {string} pairId Registered chronological pair identifier.
 * @param {Record<string,string[]>} candidateDecks Original resolved engine 60s.
 * @param {string[]} sourceDeck Original resolved 60 of this opponent rank.
 * @param {{Store:Function,runMatch:Function}} dependencies Actual pinned Store and synchronous runner.
 * @returns {object} Setup-only observation for accruePairedFourCells.
 */
function emitNativeRegisteredSetupPair(plan,pairId,candidateDecks,sourceDeck,
  {Store,runMatch}){
  // Enforce complete registration and disallow a changed sixty before any
  // Store call, including when the source initial cards happen to look equal.
  accruePairedFourCells(plan,[]);
  const pair=plan.attempts.find(row=>row.pairId===pairId);
  assert.ok(pair,'Unknown registered pair');
  assert.equal(typeof runMatch,'function');
  assert.equal(typeof Store?.prototype?.dispatch,'function');
  assert.ok(candidateDecks&&typeof candidateDecks==='object');
  assert.equal(deckDigest(sourceDeck),plan.sourceDeckHashes[pair.rank],
    'Source 60 changed after registration');
  for(const arm of pair.arms){
    assert.equal(deckDigest(candidateDecks[arm.candidateId]),
      plan.candidateDeckHashes[arm.candidateId],
      'Candidate 60 changed after registration');
  }
  const sourceSeat=1-pair.candidateSeat;
  const arms=pair.arms.map(arm=>{
    const candidateDeck=candidateDecks[arm.candidateId];
    const request={
      deckA:pair.candidateSeat===0?candidateDeck:sourceDeck,
      deckB:pair.candidateSeat===1?candidateDeck:sourceDeck,
      seed:pair.seed,maxActions:150,strictPromptValidation:true,
      isolatePolicyRandomness:true,
      label:'agent42-registered-setup-only-'+arm.armId
    };
    let snapshot=null,error=null;
    try{
      snapshot=captureSetupOnly(Store,()=>runMatch(request),{
        sourceSeat,captureFirstTurnEvidence:true
      });
    }catch(failure){
      // Preserve the failure as an unverified original attempt. Never replace
      // or silently rerun a malformed setup under the same registered ID.
      error=String(failure?.message??failure);
    }
    const first=snapshot?.firstTurnEvidence;
    const inventoryVerified=openingInventoriesMatch(
      snapshot?.setupZones?.seats,[request.deckA,request.deckB]);
    const source=snapshot?.sourcePhysicalDeal;
    const verified=snapshot?.stoppedAtFirstTurn===true &&
      inventoryVerified && first?.verifiedByDrawLog===true &&
      source?.schema===SOURCE_SCHEMA && source.seat===sourceSeat;
    return {
      candidateId:arm.candidateId,armId:arm.armId,
      candidateDeckSha256:deckDigest(candidateDeck),
      sourceDeckSha256:deckDigest(sourceDeck),
      firstTurnSlot:first?.firstTurnSlot??null,
      firstTurnPlayerId:first?.firstTurnPlayerId??null,
      firstTurnPlayerName:first?.firstTurnPlayerName??null,
      firstDrawLogName:first?.firstDrawLogName??null,
      verifiedByDrawLog:verified,
      sourcePhysicalDealSha256:source?.digestSha256??null,
      settledSetupVerified:verified,
      inventoryVerified,
      setupInterruptedBeforeFirstDecision:
        snapshot?.stoppedAtFirstTurn===true,
      setupError:error
    };
  });
  return {
    schema:'agent42-native-preoutcome-setup-pair-v1',
    pairId:pair.pairId,rank:pair.rank,seed:pair.seed,
    candidateSeat:pair.candidateSeat,
    arms,allArmsVerified:arms.every(a=>a.settledSetupVerified),
    gameOutcomesRead:false,
    fullyPaperGameQualified:false
  };
}

module.exports={deckDigest,emitNativeRegisteredSetupPair};
