'use strict';

const fs=require('node:fs');
const {firstPhysicalTargetDifference}=
  require('../twinleaf/native-accepted-target-sidecar.cjs');

const VERSION='agent41-flexible-special-original-source-evidence-summary-v1';

/** @param {object} row */
function sidecarSummary(row){
  const s=row?.nativeTargetSidecar;
  if(!s||s.observedLiveStore!==true)return null;
  const energies=(s.events??[]).filter(event=>
    event.action==='PlayCardAction'&&
    event.declared?.ownerHandPrinting?.includes(' Energy ')&&
    event.storeAccepted===true);
  return {
    linked:s.rootOrdinalLinked===true,
    acceptedTargets:s.acceptedTargetDispatches,
    targetUnobserved:s.targetUnobserved,
    energyAttachments:energies.map(event=>({
      rootOrdinal:event.rootActionOrdinal,
      printing:event.declared.ownerHandPrinting,
      target:event.declared.target,
      publicChangeCount:event.publicBoardChanges?.length??null
    })).slice(0,20)
  };
}

/** @param {object} raw */
function summarize(raw){
  const rows=(raw.rows??[]).map(pair=>{
    const a=pair.control,b=pair.treatment,c=pair.comparison;
    const error=row=>row.status==='native-error-unqualified'?{
      message:String(row.error?.message??row.error??'unknown').slice(0,350),
      nativeStack:String(row.nativeStoreCauseStack??'').slice(0,400),
      nativeAbortAction:row.nativeAbortEvidence?.action??null
    }:null;
    return {
      sourceRank:pair.trial.rank,candidateSeat:pair.trial.candidateSlot,
      fixedDealAuthenticated:c.fullDealMatch&&c.sourceDealMatch&&
        c.firstPlayerMatch&&c.deckAndEngineMatch,
      statuses:[c.controlStatus,c.treatmentStatus],
      selectedSpecialRoots:[c.controlSpecialSelected,c.treatmentSpecialSelected],
      acceptedSpecialSample:[
        c.controlSpecialSampleAccepted,c.treatmentSpecialSampleAccepted],
      sourceAttackDeclarations:[c.controlSourceAttacks,c.treatmentSourceAttacks],
      firstDifferentRoot:c.firstDifferentLedgerIndex,
      targetComparison:firstPhysicalTargetDifference(
        a.nativeTargetSidecar,b.nativeTargetSidecar),
      controlTargetSummary:sidecarSummary(a),
      treatmentTargetSummary:sidecarSummary(b),
      controlError:error(a),treatmentError:error(b),
      nativeWinner:[c.controlNativeWinner,c.treatmentNativeWinner],
      competitiveQualified:false
    };
  });
  return {
    schema:VERSION,mode:raw.comparisonMode,
    originalSixties:raw.candidate,
    attempted:raw.attempts,required:raw.expectedAttempts,
    physicallyAuthenticatedPairs:raw.pairedPhysicalStarts,
    nativeErrors:raw.nativeErrors,
    specialSelectionTreatment:raw.treatmentSpecialSelections,
    acceptedSpecialSampleLowerBound:raw.treatmentSpecialSampleAcceptedLowerBound,
    sourceAttacks:[raw.sourceAttackControl,raw.sourceAttackTreatment],
    rows,competitiveQualifiedGames:0
  };
}

if(require.main===module){
  const file=process.argv[2];
  const r=summarize(JSON.parse(fs.readFileSync(file,'utf8')));
  process.stdout.write('AGENT41_COMPACT_NATIVE_EVIDENCE '+JSON.stringify(r)+'\n');
}
module.exports={VERSION,sidecarSummary,summarize};
