'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

/** Analyze a downloaded immutable CI JSON packet without rerunning a game. */
function inspect(file){
  const result=JSON.parse(fs.readFileSync(file,'utf8'));
  assert.equal(result.schema,'agent44-rank5-m4-paper-source-v1');
  assert.equal(result.rows.length,4);
  assert.equal(result.rawDevelopment.rows.length,4);
  const observations=result.rawDevelopment.rows.map((row,i)=>{
    const summary=result.rows[i];
    assert.equal(row.trial.id,summary.trial.id);
    const nativeRoots=row.rootActionLedger??[];
    const m4RootAudits=row.specialRedCardPaperPreselectionAudits??[];
    const flagged=m4RootAudits.filter(a=>a.selectedM4Printing);
    const played=nativeRoots.filter(root=>root.action==='PlayCardAction'&&
      /red.?card/i.test(String(root.card??'')));
    const nearest=flagged.map(a=>{
      const ordinal=a.actionOrdinal;
      return {auditOrdinal:ordinal,
        printing:a.selectedM4Printing,
        opponentPrizes:a.observedOpponentPrizesRemaining,
        opponentHandCount:a.observedOpponentHandCount,
        localRootWindow:nativeRoots.filter(r=>Number.isSafeInteger(ordinal)&&
          Math.abs(r.actionOrdinal-ordinal)<=1).map(r=>({
          ordinal:r.actionOrdinal,action:r.action,card:r.card??null,
          playerSlot:r.playerSlot,turn:r.turnBefore
        }))};
    });
    const target=row.nativeAcceptedTargetSidecarAbort??null;
    const keys=target&&typeof target==='object'?Object.keys(target):[];
    const scalars=Object.fromEntries(keys.filter(k=>{
      const x=target[k];
      return x===null||typeof x==='boolean'||typeof x==='number'||
        (typeof x==='string'&&x.length<128);
    }).map(k=>[k,target[k]]));
    const resultRow={trial:row.trial.id,status:row.status??null,
      summaryDisposition:summary.nativeDisposition,
      m4AuditCount:m4RootAudits.length,
      m4AuditSelected:nearest,realRedCardPlayedActions:played,
      originalRootLedgerActions:nativeRoots.length,
      sourceSeat:summary.sourceSeat,sourceWin:summary.sourceNativeWin,
      targetRootAbortEvidenceKeys:keys,
      targetRootAbortEvidenceScalars:scalars};
    return resultRow;
  });
  return {schema:'agent44-m4-immutable-source-archive-public-root-inspection-v1',
    registrationSha256:result.registrationSha256,
    observedRows:observations,
    regeneratedCompetitiveGames:0,originalNativeTrialsRerun:false};
}
if(require.main===module){
  assert.ok(process.argv[2],'Pass downloaded archived JSON path');
  console.log('AGENT44_M4_ARCHIVE_ROOT_RECONCILIATION',
    JSON.stringify(inspect(process.argv[2])));
}
module.exports={inspect};
