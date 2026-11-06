'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {runPalaceAba,VERSION:SOURCE_VERSION}=
  require('./agent9-rank6-palace-book-native-aba.cjs');
const {writeLocked}=
  require('./agent5-rank6-paid-dce-thunder-volt-v10.cjs');
const VERSION='agent26-original-rank6-palace-book-postwait-handoff-v1';

/**
 * Read only the genuine original same-deal native Store action trace emitted
 * by the already-registered Agent9 A/B/A runner. An action trace contains
 * voluntary native roots, not interim WaitPrompt settlement actions.
 * @param {object} receipt Actual original 24-attempt A/B/A return.
 * @returns {object}
 */
function extractDeferredHandoff(receipt){
  assert.equal(receipt.version,SOURCE_VERSION);
  assert.equal(receipt.actualOriginalAttempts,24);
  assert.equal(receipt.physicalDealsAndUnchangedV9ControlMatched,true);
  assert.equal(receipt.repeatedV10AcceptedRootTapesIdentical,true);
  assert.equal(receipt.sevenNonTargetTreatmentTapesUnchanged,true);
  assert.equal(receipt.originalRootBeforeItemSame,true);
  const item=receipt.treatmentItemRoot;
  assert.equal(item.action,'PlayCardAction');
  assert.equal(item.card,'Palace Book');
  assert.equal(item.playerSlot,0);
  assert.equal(item.turnBefore,4);
  const suffix=receipt.targetPostDivergenceTreatment;
  assert.ok(Array.isArray(suffix)&&suffix.length>1);
  const after=suffix.filter(x=>x.actionOrdinal>item.actionOrdinal);
  // Native accepted-root tapes include automation/prompt settlements; a
  // ResolvePromptAction can occur on the outgoing player's old turn or on
  // the incoming player's next turn and is not a voluntary turn decision.
  const deferredPromptRoots=after.filter(x=>
    x.action==='ResolvePromptAction');
  const voluntary=after.filter(x=>
    x.action!=='ResolvePromptAction');
  const sameTurnAfter=voluntary.filter(x=>
    x.turnBefore===4&&x.playerSlot===0);
  const oppositeNext=voluntary.find(x=>
    x.turnBefore===5&&x.playerSlot===1)??null;
  const nextOwn=voluntary.find(x=>
    x.turnBefore===6&&x.playerSlot===0)??null;
  const immediate=voluntary[0]??null;
  return {
    version:VERSION,sourceVersion:SOURCE_VERSION,
    originalTrial:'6:101:B:champion-reference',
    originalPassRoot:receipt.originalPassTurnRoot,
    replacementBookRoot:item,
    nextVoluntaryRoot:immediate,
    postItemDeferredPromptRoots:deferredPromptRoots,
    firstPostItemRawAcceptedRoot:after[0]??null,
    sourceOwnerVoluntaryRootsAfterBookOnTurn4:sameTurnAfter,
    firstOpponentTurn5Root:oppositeNext,
    firstSourceTurn6Root:nextOwn,
    nativeRootSupportsItemEndedSourceTurn:
      !!immediate&&immediate.playerSlot===1&&
      immediate.turnBefore===5&&sameTurnAfter.length===0&&
      deferredPromptRoots.some(x=>
        x.playerSlot===0&&x.turnBefore===4),
    itemSynchronousSnapshot:receipt.selectedBookAudit?.physicalBookSettlement??null,
    observedSourceTurn6Decisions:
      receipt.selectedBookAudit?.sourceTurn6NativeDecisions??[],
    originalV10AbaControlsMatched:true,
    otherSevenUnchanged:true,
    fixed24AttemptOriginalAba:true,
    targetStatuses:receipt.targetStatuses,
    traceSuffixCensoredToFirst20: true,
    allVisibleSelectedSuffixRoots:suffix,
    evidenceScope:'Developmental original native root and staged source effects, not a competitive game',
    competitiveQualifiedGames:0
  };
}
function run(){
  return extractDeferredHandoff(runPalaceAba());
}
if(require.main===module){
  const result=run();
  const directory=process.env.AGENT26_PALACE_DEFERRED_DIR;
  assert.ok(directory,'Existing workflow must provide output directory');
  writeLocked(path.join(directory,'agent26-palace-book-postwait-root-handoff.json'),result);
  process.stdout.write('AGENT26_ORIGINAL_PALACE_POSTWAIT_HANDOFF '+
    JSON.stringify({
      rawPostItemRoots:result.allVisibleSelectedSuffixRoots.slice(0,14),
      deferredPromptRoots:result.postItemDeferredPromptRoots.slice(0,8),
      nextVoluntaryRoot:result.nextVoluntaryRoot,
      sourceOwnerVoluntaryRootsAfterBookOnTurn4:
        result.sourceOwnerVoluntaryRootsAfterBookOnTurn4,
      firstOpponentTurn5Root:result.firstOpponentTurn5Root,
      firstSourceTurn6Root:result.firstSourceTurn6Root,
      nativeRootSupportsItemEndedSourceTurn:
        result.nativeRootSupportsItemEndedSourceTurn,
      targetStatuses:result.targetStatuses,
      competitiveQualifiedGames:0
    })+'\n');
}
module.exports={VERSION,extractDeferredHandoff,run};
