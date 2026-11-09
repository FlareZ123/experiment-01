'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const packet=JSON.parse(fs.readFileSync(
  process.env.AGENT6_PATH_ARCHIVE_INPUT||
  'analysis-input/agent6-path-pressure-original14.json','utf8'));
assert.equal(packet.schema,
  'agent6-path-pressure-stadium-counter-original14-native-ab-v1');
const rows=packet.treatmentFullNative.rows;
const bad=rows.filter(row=>row.error);
const report=bad.map(row=>{
  const e=row.nativeAbortEvidence;
  const audit=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
  const root=row.rootActionLedger??e?.rootActionLedger??[];
  return {
    id:row.trial.id,
    error:row.error,
    nativeStoreCauseStack:row.nativeStoreCauseStack??null,
    evidenceKeys:Object.keys(e??{}),
    errorFields:{
      errorMessage:e?.errorMessage??null,
      actionOrdinal:e?.actionOrdinal??null,
      attackingPokemon:e?.attackingPokemon??null,
      actionName:e?.actionName??null,
      preDispatchBoard:e?.preDispatchBoard??null,
      preDispatchPublic:e?.preDispatchPublic??null
    },
    rootTail:root.slice(-8),
    policyRootTail:audit?.nativeRootJoinReceipts?.slice(-8)??null,
    actorAuditCounters:{
      intentCounts:audit?.typedIntentCounts,
      pathCounterSelected:audit?.pathUnderworldStadiumCounterSelected,
      actionReceipts:audit?.nativeRootAcceptances?.slice(-8)??null
    },
    candidateRootMeta:row.rootActionLedger?.filter(x=>
      x.actorNativeActionTag?.kind==='play-path-underworld-stadium-counter')??null
  };
});
process.stdout.write('AGENT6_PATH_PRESSURE_ERROR '+JSON.stringify({
  failures:report,
  summary:packet.summary
})+'\n');
