'use strict';
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');

const VERSION='agent23-canonical-actor-native-input-pair-v1';
const opts={
  actorOnlyComposition:true,
  paperSupporterQuota:true,
  mandatoryOptionFallback:true
};
const control=runDevelopment(opts);
const observed=runDevelopment({...opts,nativeActionInputWitness:true,
  nativeActionInputTapeOrdinal:10});

/** @param {object} report @returns {object} */
function omitInstrumentation(report){
  const copy=JSON.parse(JSON.stringify(report));
  delete copy.nativeActionInputWitnessOptIn;
  delete copy.nativeActionInputTapeOrdinal;
  for(const row of copy.rows)delete row.nativeActionInputAudit;
  return copy;
}
/** @param {object} value @returns {string} */
function sha256(value){
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}
const controlCore=omitInstrumentation(control);
const observedCore=omitInstrumentation(observed);
const exactSameReport=JSON.stringify(controlCore)===JSON.stringify(observedCore);
const report={
  schema:VERSION,
  pinnedEngine:control.enginePin,
  casesExpected:4,
  controlCases:control.rows.length,
  observedCases:observed.rows.length,
  sourceRegistration:control.sourceRegistration,
  exactSameReportedNativeDevelopmentGameData:exactSameReport,
  controlDataSha256:sha256(controlCore),
  observedDataSha256:sha256(observedCore),
  rows:observed.rows.map((row,index)=>{
    const baseline=control.rows[index]??null;
    const audit=row.nativeActionInputAudit??null;
    return {
      trialId:row.trial?.id??null,
      sourceRank:row.trial?.rank??null,
      candidateId:row.trial?.candidateId??null,
      controlStatus:baseline?.status??null,
      observedStatus:row.status??null,
      sourceDealPreserved:Boolean(row.sourceDealFingerprint&&
        row.sourceDealFingerprint===baseline?.sourceDealFingerprint),
      rootDigestPreserved:Boolean(row.rootActionLedgerSha256&&
        row.rootActionLedgerSha256===baseline?.rootActionLedgerSha256),
      nativeWitnessPresent:Boolean(audit),
      authenticNativePolicyRngTape:(audit?.nativePolicyTapes??[]).map(t=>({
        gameIndex:t.gameIndex,ordinal:t.ordinal,seat:t.seat,turn:t.turn,
        recorderStatus:t.status,sha256:t.sha256,values:t.values,
        selectedActionInputSha256:t.selectedAction?.sha256??null,
        actualDispatchInputSha256:t.dispatchAction?.sha256??null,
        unchangedPortableInput:t.unchangedPortableInput,
        dispatchReturnedWithoutThrow:t.dispatchReturnedWithoutThrow,
        detachedSameWorldDecisionReplayQualified:false
      })),
      observedLiveStores:audit?.observedLiveStores??null,
      originalNativeDecisions:audit?.originalLiveDecisions??null,
      selectedObjectDispatches:audit?.matchedObjectDispatches??null,
      exactPortableInputMatches:audit?.verifiedUnchangedInputs??null,
      unsupportedInputComparisons:audit?.unsupportedInputComparisons??null,
      demonstratedInputMutations:audit?.changedChoiceToDispatch??null,
      rejectedMatchedDispatches:audit?.rejectedMatchedDispatches??null,
      unmatchedStoreDispatches:audit?.unmatchedLiveDispatches??null,
      excludedFromCompetitiveWins:true
    };
  }),
  competitiveQualifiedGames:0,
  limitations:'Retrospective selected historical arms, source policy competence and paper clock unqualified; native witness covers only returned SimpleTacticsAi objects with portable inputs.'
};
assert.equal(report.controlCases,4);
assert.equal(report.observedCases,4);
console.log(JSON.stringify(report,null,2));
if(!exactSameReport)process.exitCode=1;
