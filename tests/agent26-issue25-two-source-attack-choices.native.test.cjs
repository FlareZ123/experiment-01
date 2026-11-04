'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {developmentTrials,runDevelopment}=
  require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const {withGoFirstChoice}=
  require('../simulation/twinleaf/agent6-go-first-choice.cjs');
const {withOwnerStartingBasicChoice}=
  require('../simulation/twinleaf/agent50-owner-starting-basic-choice.cjs');
const {withOwnerPublicAcknowledgements}=
  require('../simulation/twinleaf/agent50-owner-public-acknowledgements.cjs');
const {withOwnerMandatoryShowCards}=
  require('../simulation/twinleaf/agent50-owner-mandatory-showcards.cjs');
const {withOwnerFutureSightNeutralOrder}=
  require('../simulation/twinleaf/agent30-owner-futuresight-neutral-order.cjs');
const {withOwnerOriginBoundAttackChoices}=
  require('../simulation/twinleaf/agent26-origin-bound-attack-choices.cjs');
const {installGirafarigGetLostPaperHook}=
  require('../simulation/twinleaf/agent29-girafarig-getlost-paper-hook.cjs');
const {CODE,withNativeRawStateFallbackQuarantine:quarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

/**
 * Historical original-source four-arm compatibility canary. Source 60s,
 * seeds, hands, starting seats and policy registration are unchanged.
 * Selection records are proposals until independently tied to a true
 * Store settlement and physical zone/Prize consequence.
 */
test('Issue25 exact-source Night Watch and Get Lost owner choices reach native Store',()=>{
  assert.equal(developmentTrials().length,4);
  let developed=null,choices=null,ordering=null,guard=null,blocked=null;
  let restoreGetLost=null;
  try{
    restoreGetLost=installGirafarigGetLostPaperHook();
    const out=quarantine(()=>withGoFirstChoice([false,false],()=>
      withOwnerStartingBasicChoice(()=>withOwnerPublicAcknowledgements(()=>
        withOwnerMandatoryShowCards(()=>{
          const attacks=withOwnerOriginBoundAttackChoices(()=>{
            const future=withOwnerFutureSightNeutralOrder(()=>{
              developed=runDevelopment({
                actorOnlyComposition:true,nativeRootActionLimit:48});
              return developed;
            });
            ordering=future.audit;
            return future.result;
          },{committedSeed:'agent26-origin-bound-v1-20261104-frozen',
            captureNativeZoneAudit:true});
          choices=attacks.audit;
          return attacks.result;
        }).result).result).result).result,{maxRecords:16});
    guard=out.audit;
  }catch(error){
    blocked=error;
    guard=error.nativeRawStateFallbackQuarantine??null;
    choices=error.agent26OriginBoundAttackChoices??choices;
  }finally{
    restoreGetLost?.();
  }
  const rows=developed?.rows??[];
  console.log('AGENT26_ISSUE25_EXACT_PRINT_CHOICES',JSON.stringify({
    registeredArms:developmentTrials().map(r=>r.id),
    attempts:rows.map(r=>({
      id:r.trial?.id??r.id??null,
      status:r.status??'returned',turn:r.turns??null,
      roots:r.rootActionCount??null,
      sourceDealFingerprint:r.sourceDealFingerprint??null
    })),
    sourceChoiceAudit:choices,
    rank6ChampionNightWatchNativePrompts:rows
      .find(r=>r.trial?.id==='6:0:A:champion-reference')
      ?.rootActionLedger?.filter(e=>e.turnBefore===5&&
        ['ShowCardsPrompt','ShuffleDeckPrompt'].includes(e.pendingPrompt))
      .map(e=>({ordinal:e.actionOrdinal,seat:e.playerSlot,
        prompt:e.pendingPrompt,action:e.action}))??null,
    futureSightMarks:ordering?.markedOrderPrompts??null,
    genericQuarantine:guard,
    nextFailureCode:blocked?.code??null,
    completedPaperQualifiedGames:0
  }));
  assert.equal(rows.length,4);
  assert.ok(choices,'selected source-print choice audit must be preserved');
  assert.ok(guard,'raw-state quarantine must remain active');
  assert.equal(guard.originalNativeDecoderExecuted,false);
  const kinds=choices.selected.map(e=>e.kind);
  assert.ok(kinds.includes('night-watch'),'expected printed Night Watch');
  assert.ok(kinds.includes('get-lost'),'expected printed Get Lost');
  assert.ok(choices.selected.every(e=>e.privateCardIdentitiesExposed===false));
  assert.ok(choices.printedSourceInvocations.length>=2);
  assert.equal(choices.nativeZoneAuditEnabled,true);
  assert.ok(choices.nativeRootStoreCount>=4);
  assert.ok(choices.nativeZoneEvents.some(e=>
    e.kind==='night-watch'&&e.physicalTransferConfirmed===true));
  assert.ok(choices.nativeZoneEvents.some(e=>
    e.kind==='get-lost'&&e.selectedCount===0&&
    e.physicalTransferConfirmed===true));
  assert.ok(choices.nativeZoneEvents.some(e=>
    e.kind==='night-watch-shuffle'&&e.permutationAppliedExactly===true));
  assert.ok(choices.nativeZoneEvents.every(e=>
    e.acceptedByActualStore===true&&
    e.sourceCardIdentityExposed===false));

  assert.ok(choices.resolvedFollowups.some(e=>
    e.kind==='night-watch-reveal'));
  const rank6=rows.find(r=>r.trial?.id==='6:0:A:champion-reference');
  assert.ok(rank6?.rootActionLedger);
  const nightWatchNativePrompts=rank6.rootActionLedger.filter(e=>
    e.turnBefore===5&&e.action==='ResolvePromptAction');
  // The current headless game loop resolves ShuffleDeckPrompt directly from
  // its seeded native RNG, before invoking SimpleTacticsAi.decodeNextAction.
  // The bridge must not pretend this headless bypass was an AI policy call.
  assert.ok(nightWatchNativePrompts.some(e=>
    e.pendingPrompt==='ShowCardsPrompt'&&e.playerSlot===0));
  assert.ok(nightWatchNativePrompts.some(e=>
    e.pendingPrompt==='ShuffleDeckPrompt'&&e.playerSlot===1));
  assert.equal(choices.resolvedFollowups.some(e=>
    e.kind==='night-watch-shuffle'),false);
  assert.ok(choices.markedFollowups.some(e=>
    e.kind==='night-watch-shuffle'));
  assert.ok(choices.resolvedFollowups.every(e=>
    e.hiddenCardIdentitiesInspected===false));
  assert.ok(ordering?.ownerPromptSelections>=1);
  if(guard.rawStateFallbackCalls>0)
    assert.equal(blocked?.code,CODE);
  else assert.equal(blocked,null);
});
