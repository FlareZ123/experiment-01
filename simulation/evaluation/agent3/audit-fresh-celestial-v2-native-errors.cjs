'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {save}=require('../agent43-guzma-original-source-pair.cjs');

const VERSION='agent3-20261109-all29-celestial-v2-native-error-portfolio-v1';

/**
 * Reduce the immutable native source run's 12 actual engine/policy errors
 * without resimulating or changing any already-scored game.
 * @param {object} report Original complete 116-attempt full-field archive.
 * @returns {object} Exact rank, failing action, prompt, and error class.
 */
function audit(report){
  assert.equal(report.schema,
    'agent3-prospective-all29-paper-celestial-v2-portable-bothactor-v1');
  assert.equal(report.summary.nativeAttempts,116);
  assert.equal(report.summary.physicalDealPairsMatched,58);
  const source=[
    ...report.fullNativeControl.rows.map(row=>({arm:'control',row})),
    ...report.fullNativeTreatment.rows.map(row=>({arm:'treatment',row}))
  ];
  assert.equal(source.length,116);
  const rows=source.flatMap(({arm,row})=>{
    if(!row.error)return [];
    const witness=row.nativeAbortEvidence??null;
    const type=String(row.error).split('\n')[0];
    const p=row.physicalZoneQualification??null;
    return [{
      id:row.trial.id,rank:row.trial.rank,
      arm,error:type,
      failureStage:witness?.failureStage??null,
      failingAction:witness?.actionName??null,
      failingTurn:witness?.turnBefore??null,
      ordinal:witness?.actionOrdinal??null,
      sourcePhysicalIntegrity:p?.status??null,
      pendingPrompt:witness?.pendingPrompt??null,
      firstRootBeforeFailure:witness?.rootActionLedger?.slice(-3)
        .map(r=>({ordinal:r.actionOrdinal,turn:r.turnBefore,
          seat:r.playerSlot,action:r.action,card:r.card??null,
          attack:r.attack??null}))??null,
      availablePublicActives:witness?.preDispatchBoard?.
        map(p=>p?.active?.name??p?.active?.printing??null)??null,
      failureCode:witness?.errorMessage??null
    }];
  });
  assert.equal(rows.length,report.summary.nativeErrors);
  const classMap=new Map();
  for(const row of rows){
    const group=classMap.get(row.error)??{error:row.error,count:0,ranks:new Set()};
    group.count++;
    group.ranks.add(row.rank);
    classMap.set(row.error,group);
  }
  return {
    schema:VERSION,sourceRunId:42556056635,
    sourceHead:report.githubSha,sourcePin:report.pinnedTwinleaf,
    paperGameQualified:false,
    nativeAttempts:116,nativeErrors:rows.length,
    errorClasses:[...classMap.values()].map(x=>({
      error:x.error,count:x.count,ranks:[...x.ranks].sort((a,b)=>a-b)
    })),
    rows
  };
}
if(require.main===module){
  const input=process.env.AGENT3_CELESTIAL_V2_AUDIT_INPUT;
  assert.ok(input);
  const result=audit(JSON.parse(fs.readFileSync(input,'utf8')));
  if(process.env.AGENT3_CELESTIAL_V2_AUDIT_OUTPUT)
    save(process.env.AGENT3_CELESTIAL_V2_AUDIT_OUTPUT,result);
  process.stdout.write('AGENT3_CELESTIAL_V2_ERROR_PORTFOLIO '+
    JSON.stringify(result)+'\n');
}
module.exports={VERSION,audit};
