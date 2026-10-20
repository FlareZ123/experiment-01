'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {replayRank6EnergyWindow,ROOT_SHA}=
  require('./agent43-rank6-owner-energy-replay.cjs');
const {withRank6SourcePublicDenialLedger}=
  require('../twinleaf/agent30-rank6-source-public-denial-ledger.cjs');

const pinnedOutput=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');

/**
 * Retrospective one-deal forensic attribution. The saved original 260-root
 * canonical match is replayed without any modified policy or reducer.
 * @returns {object} Public source-card contextual windows for Energy losses.
 */
function replayRank6SourceDenial(){
  const {Store}=require(path.join(pinnedOutput,'game/store/store'));
  const recorded=withRank6SourcePublicDenialLedger(Store,1,
    replayRank6EnergyWindow);
  const prior=recorded.result;
  const ledger=recorded.audit;
  assert.equal(prior.sameRootHistory,true);
  assert.equal(prior.observedRootSha256,ROOT_SHA);
  assert.equal(prior.ownerEnergyWindow.candidateSeat,0);
  assert.equal(prior.originalCandidateSetup.candidateAttacks,0);
  assert.equal(prior.ownerEnergyWindow.nativeManualEnergyAccepted,5);
  assert.equal(prior.ownerEnergyWindow.likelyPowerglassPromptAccepted,1);
  const losses=prior.ownerEnergyWindow.publicEnergyTransitionsLedger
    .filter(e=>e.actorSeat===1&&e.attachedCardDelta<0);
  assert.deepEqual(losses.map(e=>e.turnBefore),[4,10,14,34]);
  assert.equal(losses.reduce((n,e)=>n-e.attachedCardDelta,0),5);
  assert.deepEqual(ledger.sourceAttachedEnergyLossEvents.map(e=>e.turn),
    [4,10,14,34]);
  assert.equal(ledger.attachedEnergyLossTotal,5);
  const sourceTurns=ledger.sourceAttachedEnergyLossEvents.map(row=>({
    globalTurn:row.turn,
    promptRootOrdinal:row.ordinal,
    sourceNativeAction:row.nativeAction,
    sourcePromptType:row.promptType,
    sourcePromptMessage:row.promptMessage,
    attachedCardDelta:row.attachedCardDelta,
    sourcePrintedCardsPlayedThatTurn:
      row.publiclyPlayedCardsEarlierThisSourceTurn,
    nearestSourcePublicPlay:row.lastPublicPlay,
    targetPublicEnergyBefore:row.before,
    targetPublicEnergyAfter:row.after,
    directReducerAttributionVerified:false
  }));
  return {
    schema:'agent30-original-rank6-source-energy-denial-public-action-context-v1',
    evidence:'single retrospectively selected native Store source deal',
    originalSourceOpponentRank:6,
    trial:prior.trial,
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    originalFrozenRootSha256:ROOT_SHA,
    replayRootSha256:prior.observedRootSha256,
    actualRootActions:260,
    initialSourceDealFingerprint:prior.sourcePhysicalDealFingerprint,
    frozenCommonPolicy:prior.policyVersion,
    candidateManualEnergyAttachments:
      prior.ownerEnergyWindow.nativeManualEnergyAccepted,
    candidateOwnDiscardToActiveNativeEnergyPrompts:
      prior.ownerEnergyWindow.likelyPowerglassPromptAccepted,
    sourcePromptEnergyLossEvents:sourceTurns,
    allSourcePubliclyPlayedCards:ledger.publiclyPlayedSourceCards,
    observedSourceEnergyRemovals:ledger.attachedEnergyLossTotal,
    noUnrevealedSourceHandReadsInPublishedOutput:
      !ledger.hiddenSourceHandContentsRecorded,
    limitations:{
      adjacentPublicCardsOnlyNoReducerAttribution:true,
      noSourcePrivateHandOptionsOrDeckUsed:true,
      noStoreOrPolicyMutation:true,
      noCompetitiveWinRateObservations:true,
      selectedHistoricalSeed:true,
      originalGameCensored:true
    }
  };
}
if(require.main===module)process.stdout.write(
  JSON.stringify(replayRank6SourceDenial(),null,2)+'\n');
module.exports={replayRank6SourceDenial};
