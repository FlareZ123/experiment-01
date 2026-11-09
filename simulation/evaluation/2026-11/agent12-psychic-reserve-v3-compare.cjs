'use strict';
const assert=require('node:assert/strict');
const {compact,pairedContribution}=
  require('./agent12-thorns-fixed60-eight-rank-native.cjs');

/**
 * Original-source physical match, actual first player and full-censor treatment
 * are mandatory. Outcomes are native observations, never paper win rates.
 * @param {object} control Actual v1 runner result.
 * @param {object} reserve Actual v3 runner result.
 * @param {object} reg Frozen registration.
 */
function compare(control,reserve,reg){
  assert.equal(control.rows.length,reg.groups.length);
  assert.equal(reserve.rows.length,reg.groups.length);
  const rows=reg.groups.map((g,i)=>{
    const a=compact(control.rows[i]),b=compact(reserve.rows[i]);
    const matched=Boolean(a.sourceDealFingerprint &&
      a.sourceDealFingerprint===b.sourceDealFingerprint &&
      a.actualStarterSeat!==null&&a.actualStarterSeat===b.actualStarterSeat);
    const bounds=matched?pairedContribution(a.candidateWins,b.candidateWins):null;
    const ghostEye=(row)=> (row.candidateAttackSettlement?.attacks??[])
      .filter(x=>x.attackName==='Ghost Eye'&&x.settledPromptChain===true).length;
    return {
      rank:g.rank,repeat:g.repeat,candidateSlot:g.candidateSlot,seed:g.seed,
      sourcePhysicalMatched:matched,
      bothNativeTerminals:a.candidateWins!==null&&b.candidateWins!==null,
      sharpReserveMinusControl:bounds,
      v1:a,v3:b,
      ghostEyeV1:ghostEye(control.rows[i]),
      ghostEyeV3:ghostEye(reserve.rows[i]),
      firstPlayerCoinReceiptV1:control.rows[i].nativeSetupCoinChoiceReceipt??null,
      firstPlayerCoinReceiptV3:reserve.rows[i].nativeSetupCoinChoiceReceipt??null,
      nativeTargetsV1:control.rows[i].nativeAcceptedTargetSidecar?.observedLiveStore===true,
      nativeTargetsV3:reserve.rows[i].nativeAcceptedTargetSidecar?.observedLiveStore===true
    };
  });
  const matched=rows.filter(x=>x.sourcePhysicalMatched);
  const sum=(key)=>({
    wins:rows.filter(x=>x[key].candidateWins===1).length,
    losses:rows.filter(x=>x[key].candidateWins===0).length,
    capped:rows.filter(x=>x[key].nativeDisposition==='right-censored').length,
    engineErrors:rows.filter(x=>x[key].nativeDisposition==='engine-error').length,
    terminalNonbinary:rows.filter(x=>x[key].nativeDisposition==='terminal-nonbinary').length,
    ghostEyeSettled:rows.reduce((n,x)=>n+x[key==='v1'?'ghostEyeV1':'ghostEyeV3'],0)
  });
  const v1=sum('v1'),v3=sum('v3');
  return {
    summary:{
      registeredGroups:rows.length,nativeAttempts:rows.length*2,
      physicallySourceMatched:matched.length,
      sourceUnmatched:rows.length-matched.length,
      bothNativeTerminalMatched:matched.filter(x=>x.bothNativeTerminals).length,
      sharpReserveMinusV1NativeWinCount:{
        low:matched.reduce((n,x)=>n+x.sharpReserveMinusControl.low,0),
        high:matched.reduce((n,x)=>n+x.sharpReserveMinusControl.high,0)
      },
      competitivePaperQualifiedGames:0
    },
    field:{v1,v3},
    byRank:reg.sourceRanks.map(rank=>{
      const group=rows.filter(x=>x.rank===rank);
      return {rank,groups:group.length,
        physicalMatches:group.filter(x=>x.sourcePhysicalMatched).length,
        v1NativeWins:group.filter(x=>x.v1.candidateWins===1).length,
        v3NativeWins:group.filter(x=>x.v3.candidateWins===1).length,
        v1GhostEyes:group.reduce((n,x)=>n+x.ghostEyeV1,0),
        v3GhostEyes:group.reduce((n,x)=>n+x.ghostEyeV3,0)
      };
    }),
    rows
  };
}
module.exports={compare};
