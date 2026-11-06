'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {physicalTargetReceipt,run}=
  require('../simulation/evaluation/agent4-rank6-psychic-physical-target-12.cjs');
const ROOT_REG=require('../results/aichi-2026/registrations/agent4-rank6-underworld-guard-postabort-root-audit-v1-20261106.json');
function row(target,linked=true,change=true){
  return {
    id:target.id,
    nativeFirst28AcceptedPublicRootsAfterOriginalAbort:[{
      actionOrdinal:target.priorNativeErrorRoot,
      action:'PlayCardAction',card:'Psychic Energy',
      playerSlot:target.actingSeat
    }],
    nativePhysicalTargetLedgerLinked:linked,
    nativeFirstAcceptedPhysicalTargetAtOriginalAbort:[{
      rootActionOrdinal:target.priorNativeErrorRoot,
      physicalActorSeat:target.actingSeat,action:'PlayCardAction',
      ownerPublicCardPrinting:'Psychic Energy MEE',
      declaredTarget:{player:2,slot:2,index:0},
      physicalTargetStatus:'captured',
      publicBoardChanges:change?[{seat:target.actingSeat,
        position:'bench',index:0}]:[],
      nativeStoreAccepted:true,visibility:'public-after-dispatch'
    }]
  };
}
test('specific physical target and after-board change are distinguished',()=>{
  const target=ROOT_REG.exactHistoricalTargets[0];
  const x=physicalTargetReceipt(row(target),target);
  assert.equal(x.originalRootNowNativeAccepted,true);
  assert.equal(x.originalRootNowPublicEnergyPlay,true);
  assert.equal(x.targetCardMatchedPublicRoot,true);
  assert.equal(x.publicTargetVisibleAfterNativeStore,true);
  assert.equal(x.independentPaperEnergyTargetQualified,false);
});
test('unlinked or missing actual public Board change fails physical gate',()=>{
  const target=ROOT_REG.exactHistoricalTargets[1];
  const a=physicalTargetReceipt(row(target,false,false),target);
  assert.equal(a.nativeTargetSidecarLinked,false);
  assert.equal(a.publicTargetVisibleAfterNativeStore,false);
});
function fake(){
  return {
    actualNativeAttemptCount:12,
    paired:Array.from({length:4},(_,i)=>({id:String(i),
      sourceFingerprintMatchedAllThree:true,
      fullPhysicalDealMatchedAllThree:true,
      aRepeatExactAcceptedPrefixAndDisposition:true})),
    modes:['corrected-bilateral-control-a',
      'selected-v3-paper-plus-funded-mobility',
      'corrected-bilateral-control-b'].map(modeId=>({
      modeId,rows:ROOT_REG.exactHistoricalTargets.map(target=>row(target))
    }))
  };
}
test('six real native targets pass strict physical provenance mock gate',()=>{
  const result=run({native:()=>fake()});
  assert.equal(result.physicalTargetReceipts.length,6);
  assert.ok(Object.values(result.predeclaredChecks).every(Boolean));
  assert.equal(result.qualifiedGames,0);
  assert.equal(result.fieldWinRate,null);
});
test('any single failed public native target receipt fails physical gate',()=>{
  const result=run({native:()=>{
    const o=fake();
    o.modes[1].rows[1].nativePhysicalTargetLedgerLinked=false;
    return o;
  }});
  assert.equal(
    result.predeclaredChecks.allSixHaveActualNativeAcceptedLinkedTargets,false);
});
