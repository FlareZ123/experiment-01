'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {summarizeNightWatchPhysicalReplays}=require('../simulation/evaluation/agent12-nightwatch-zone-summary.cjs');
const event={promptId:7,turn:21,physicalHandDeckMovementConfirmed:true,followupResolutions:[{promptKind:'ShowCardsPrompt',promptResultRecorded:true,nativeCallbackDequeued:true},{promptKind:'ShuffleDeckPrompt',promptResultRecorded:true,nativeCallbackDequeued:true}]};
function data(){
  return {gameArmsAttempted:8,registeredGroups:2,competitiveQualifiedGameCount:0,groups:[0,1].map((i)=>({registration:{rank:11,repeat:i},seed:100+i,baseline:[{},{}],uniform:[{nativeNightWatchPromptCount:i===0?1:0},{nativeNightWatchPromptCount:0}],randomHookAudit:{nativeMovementEvents:i===0?[{...event,followupResolutions:event.followupResolutions.slice()}]:[]},sourcePhysicalMovement:{sourceNamedNativePrompts:i===0?1:0,acceptedStoreDispatchesObserved:i===0?1:0,completeSelectedHandToDeckMoves:i===0?1:0,showAndShuffleBothPrompted:i===0?1:0,bothFollowupsNativelyResolved:i===0?1:0,confirmsNativeGameAllEvents:true}}))};
}
test('full printed native prompt and physical-movement denominator stays unchanged',()=>{
  const x=summarizeNightWatchPhysicalReplays(data());
  assert.equal(x.namedGenuineNightWatchRoots,1);
  assert.equal(x.handToDeckMovementVerified,1);
  assert.equal(x.revealShufflePromptsNativelyResolved,1);
  assert.equal(x.nativeZoneAndPromptComplete,true);
  assert.equal(x.competitivelyQualifiedGames,0);
});
test('missing real shuffle prompt settlement creates explicit negative',()=>{
  const x=data();x.groups[0].randomHookAudit.nativeMovementEvents[0].followupResolutions.pop();
  x.groups[0].sourcePhysicalMovement.bothFollowupsNativelyResolved=0;
  const r=summarizeNightWatchPhysicalReplays(x);
  assert.equal(r.nativeZoneAndPromptComplete,false);
  assert.equal(r.evidenceGaps[0].shuffledPromptResolved,false);
});
test('unobserved source native dispatch does not disappear',()=>{
  const x=data();const group=x.groups[0];group.randomHookAudit.nativeMovementEvents=[];
  for(const k of ['acceptedStoreDispatchesObserved','completeSelectedHandToDeckMoves','showAndShuffleBothPrompted','bothFollowupsNativelyResolved'])group.sourcePhysicalMovement[k]=0;
  const r=summarizeNightWatchPhysicalReplays(x);
  assert.equal(r.namedGenuineNightWatchRoots,1);
  assert.equal(r.acceptedNativePromptDispatches,0);
  assert.equal(r.nativeZoneAndPromptComplete,false);
});
