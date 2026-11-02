'use strict';
const {label}=require('./agent1-frozen-row-audit.cjs');
/** Reconcile machine-readable statuses without changing any original evidence. */
function audit(archive){
  const raw=archive.rawNativeResult.rows;
  const attempts=archive.releaseDisposition.attempts;
  const byId=new Map(raw.map(row=>[row.trial.id,row]));
  if(byId.size!==raw.length||raw.length!==attempts.length)throw Error('row count mismatch');
  const rows=attempts.map(a=>{
    const row=byId.get(a.trialId);
    if(!row)throw Error('unmatched native trial');
    const status=label(row);
    return {
      trialId:a.trialId,status,reported:a.nativeStatus,
      nativeWinner:status==='NATIVE_TERMINAL'?row.winner:null,
      nativeWinnerRole:status==='NATIVE_TERMINAL'?
        row.winner===row.sourceSeat?'original-source':'candidate':null,
      statusMismatch:status!==a.nativeStatus,
      terminalMismatch:(status==='NATIVE_TERMINAL')!==a.observedEngineTerminal,
      competitiveGameQualified:false
    };
  });
  return {rows,firstBlocker:archive.releaseDisposition.firstBlocker,
    competitiveGameQualified:false};
}
module.exports={audit};
