'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const VERSION='agent12-nightwatch-native-zone-replay-readout-v1';

/**
 * Compact faithful readout of the existing development runner's exact native
 * source-prompt and physical-zone receipts. A known false/absent witness is
 * preserved as a negative; never convert a native turn into a paper win.
 * @param {object} data Unchanged runner result; original source trials only.
 * @returns {object} Full-denominator diagnostic, zero qualified wins.
 */
function summarizeNightWatchPhysicalReplays(data){
  assert.equal(data?.gameArmsAttempted,8);
  assert.equal(data.registeredGroups,2);
  assert.equal(data.competitiveQualifiedGameCount,0);
  assert.ok(Array.isArray(data.groups)&&data.groups.length===2);
  const groups=[],violations=[];
  let sourceRootCount=0,physicalPromptDispatches=0,zoneMoves=0,
    revealAndShuffleCreated=0,revealAndShuffleResolved=0;
  for(const group of data.groups){
    assert.ok(Array.isArray(group.baseline)&&group.baseline.length===2);
    assert.ok(Array.isArray(group.uniform)&&group.uniform.length===2);
    assert.ok(group.sourcePhysicalMovement);
    const p=group.sourcePhysicalMovement;
    const events=group.randomHookAudit?.nativeMovementEvents;
    assert.ok(Array.isArray(events),
      'Missing actual native post-dispatch physical movement event ledger');
    assert.equal(p.acceptedStoreDispatchesObserved,events.length);
    assert.equal(p.sourceNamedNativePrompts,
      group.uniform.reduce((sum,arm)=>
        sum+arm.nativeNightWatchPromptCount,0));
    const summary={
      originalRegisteredGroup:group.registration,
      originalPhysicalSeed:group.seed,
      namedAcceptedNightWatchPrompts:p.sourceNamedNativePrompts,
      originalLiveStoreChooseCardsDispatches:p.acceptedStoreDispatchesObserved,
      physicalHandToDeckConserved:p.completeSelectedHandToDeckMoves,
      generatedRevealAndShuffle:p.showAndShuffleBothPrompted,
      bothPromptsResolved:p.bothFollowupsNativelyResolved,
      allObservedNativePromptStagesComplete:p.confirmsNativeGameAllEvents,
      paperQualified:false
    };
    groups.push(summary);
    sourceRootCount+=summary.namedAcceptedNightWatchPrompts;
    physicalPromptDispatches+=summary.originalLiveStoreChooseCardsDispatches;
    zoneMoves+=summary.physicalHandToDeckConserved;
    revealAndShuffleCreated+=summary.generatedRevealAndShuffle;
    revealAndShuffleResolved+=summary.bothPromptsResolved;
    for(const event of events){
      const hasShow=event.followupResolutions.filter(x=>
        x.promptKind==='ShowCardsPrompt'&&x.promptRemovedAfter).length===1;
      const hasShuffle=event.followupResolutions.filter(x=>
        x.promptKind==='ShuffleDeckPrompt'&&x.promptRemovedAfter).length===1;
      if(!event.physicalHandDeckMovementConfirmed||!hasShow||!hasShuffle){
        violations.push({
          registeredGroup:group.registration,
          nativePromptId:event.promptId,turn:event.turn,
          handCountBefore:event.handCountBefore,
          handCountAfter:event.handCountAfter,
          deckCountBefore:event.deckCountBefore,
          deckCountAfter:event.deckCountAfter,
          moved:event.physicalHandDeckMovementConfirmed,
          revealed:hasShow,shuffledPromptResolved:hasShuffle
        });
      }
    }
  }
  return {version:VERSION,registeredGroups:groups.length,
    developmentGameArms:data.gameArmsAttempted,
    namedGenuineNightWatchRoots:sourceRootCount,
    acceptedNativePromptDispatches:physicalPromptDispatches,
    handToDeckMovementVerified:zoneMoves,
    revealShufflePromptsGenerated:revealAndShuffleCreated,
    revealShufflePromptsNativelyResolved:revealAndShuffleResolved,
    evidenceGaps:violations,
    nativeZoneAndPromptComplete:
      sourceRootCount===physicalPromptDispatches&&
      zoneMoves===physicalPromptDispatches&&
      revealAndShuffleCreated===physicalPromptDispatches&&
      revealAndShuffleResolved===physicalPromptDispatches,
    individualMatchPaperCorrectnessCertified:false,
    physicalSelectionRandomnessQualified:false,
    independentOpponentDecisionPolicyQualified:false,
    tournamentClockQualified:false,
    competitivelyQualifiedGames:0,
    groups};
}
if(require.main===module){
  const jsonPath=process.argv[2];
  assert.ok(jsonPath,'Expected existing native replay JSON file path');
  process.stdout.write(JSON.stringify(
    summarizeNightWatchPhysicalReplays(
      JSON.parse(fs.readFileSync(jsonPath,'utf8'))),null,2)+'\n');
}
module.exports={VERSION,summarizeNightWatchPhysicalReplays};
