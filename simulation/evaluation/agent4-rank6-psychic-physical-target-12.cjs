'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {run:runOriginal}=
  require('./agent4-v3-two-unknown-power-readout.cjs');
const {withGuardAndTypedWitness}=
  require('./agent4-rank6-owner-underworld-veto-paired-24.cjs');
const {writeAtomicLocked}=
  require('./agent20-frozen-rank6-canary-v1.cjs');
const {rootLabelMatchesNativePrinting}=
  require('../twinleaf/native-accepted-target-store-observer.cjs');
const REG=require('../../results/aichi-2026/registrations/agent4-underworld-guard-psychic-native-target-receipt-20261106.json');
const ROOT_REG=require('../../results/aichi-2026/registrations/agent4-rank6-underworld-guard-postabort-root-audit-v1-20261106.json');
const VERSION='agent4-rank6-first-native-accepted-psychic-physical-target-v1';

/**
 * Authenticated native target and public board change after Underworld veto.
 * A card played from the hand is never by itself evidence of where it landed.
 * @param {object} row Original frozen-source native outcome.
 * @param {{id:string,priorNativeErrorRoot:number,actingSeat:number}} target
 */
function physicalTargetReceipt(row,target){
  const publicRoot=row.nativeFirst28AcceptedPublicRootsAfterOriginalAbort?.[0]??null;
  const sidecars=row.nativeFirstAcceptedPhysicalTargetAtOriginalAbort??[];
  const relevant=sidecars.filter(e=>
    e.rootActionOrdinal===target.priorNativeErrorRoot);
  const sole=relevant.length===1?relevant[0]:null;
  return {
    id:target.id,priorFailedOrdinal:target.priorNativeErrorRoot,
    originalRootNowNativeAccepted:publicRoot?.actionOrdinal===
      target.priorNativeErrorRoot,
    originalRootNowPublicEnergyPlay:
      publicRoot?.action==='PlayCardAction'&&
      publicRoot?.card==='Psychic Energy',
    nativeTargetSidecarLinked:row.nativePhysicalTargetLedgerLinked===true,
    numberOfNativeAcceptedTargetEventsAtPivot:relevant.length,
    declaredTargetStatus:sole?.physicalTargetStatus??null,
    nativeAcceptedPublicCard:sole?.ownerPublicCardPrinting??null,
    nativeAcceptedActorSeat:sole?.physicalActorSeat??null,
    declaredPhysicalTarget:sole?.declaredTarget??null,
    publicAfterStoreSlotChanges:sole?.publicBoardChanges??null,
    targetCardMatchedPublicRoot:
      rootLabelMatchesNativePrinting('Psychic Energy',
        sole?.ownerPublicCardPrinting)&&
      sole?.action==='PlayCardAction'&&
      sole?.nativeStoreAccepted===true,
    publicTargetVisibleAfterNativeStore:
      sole?.visibility==='public-after-dispatch'&&
      Array.isArray(sole.publicBoardChanges)&&
      sole.publicBoardChanges.length>0,
    independentPaperEnergyTargetQualified:false
  };
}
function run(deps={}){
  const actual=(deps.native??runOriginal)({
    witness:withGuardAndTypedWitness
  });
  assert.equal(actual.actualNativeAttemptCount,12);
  const receipts=actual.modes.flatMap(mode=>
    ROOT_REG.exactHistoricalTargets.map(target=>{
      const row=mode.rows.find(x=>x.id===target.id);
      assert.ok(row, 'Missing target row '+target.id);
      return {modeId:mode.modeId,
        ...physicalTargetReceipt(row,target)};
    }));
  const checks={
    sameFrozenPhysicalStarts:actual.paired.length===4&&
      actual.paired.every(x=>x.sourceFingerprintMatchedAllThree&&
        x.fullPhysicalDealMatchedAllThree),
    allSixHaveRecordedPhysicalPublicRoot:
      receipts.length===6&&receipts.every(r=>
        r.originalRootNowNativeAccepted&&
        r.originalRootNowPublicEnergyPlay),
    allSixHaveActualNativeAcceptedLinkedTargets:
      receipts.length===6&&receipts.every(r=>
        r.nativeTargetSidecarLinked&&
        r.numberOfNativeAcceptedTargetEventsAtPivot===1&&
        r.declaredTargetStatus==='captured'&&
        r.targetCardMatchedPublicRoot&&
        r.nativeAcceptedActorSeat===ROOT_REG.exactHistoricalTargets
          .find(x=>x.id===r.id).actingSeat),
    allSixPublicBoardChangesObserved:
      receipts.length===6&&receipts.every(r=>
        r.publicTargetVisibleAfterNativeStore),
    allARepeatControlsExact:actual.paired.every(x=>
      x.aRepeatExactAcceptedPrefixAndDisposition)
  };
  return {
    schema:VERSION,registration:REG.schema,
    genuineNativeAttempts:actual.actualNativeAttemptCount,
    outputBeforeCompetitiveQualifications:true,
    predeclaredChecks:checks,physicalTargetReceipts:receipts,
    unchangedSourceAndCandidatePrintings:true,
    fieldWinRate:null,qualifiedGames:0
  };
}
if(require.main===module){
  const file=process.env.AGENT4_FIRST_ENERGY_TARGET_OUTPUT;
  assert.ok(file,'Require atomic archived target filename');
  const r=run(),bytes=JSON.stringify(r,null,2)+'\n';
  fs.mkdirSync(path.dirname(file),{recursive:true});
  writeAtomicLocked(file,bytes);
  writeAtomicLocked(file+'.sha256',
    createHash('sha256').update(bytes).digest('hex')+
      '  '+path.basename(file)+'\n');
  process.stdout.write('AGENT4_PSYCHIC_PHYSICAL_TARGET '+JSON.stringify({
    gates:r.predeclaredChecks,
    receipts:r.physicalTargetReceipts,
    competitiveQualifiedGames:0
  })+'\n');
  if(!Object.values(r.predeclaredChecks).every(Boolean))process.exitCode=1;
}
module.exports={VERSION,physicalTargetReceipt,run};
