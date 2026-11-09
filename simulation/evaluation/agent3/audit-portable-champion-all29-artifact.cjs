'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {save}=require('../agent43-guzma-original-source-pair.cjs');

const VERSION='agent3-portable-champion-all29-immutable-artifact-audit-v1';

/** @param {object} a Actual original registered native report, no rerunning games. */
function audit(a){
  assert.equal(a.schema,'agent3-prospective-all29-champion-portable-bothowner-v1');
  assert.equal(a.pinnedNativeEngine,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(a.fixed60,'champion-reference');
  assert.equal(a.qualifiedPaperGames,0);
  assert.equal(a.pairs?.length,58);
  assert.equal(a.summary?.attempts,116);
  const expectedRanks=[...Array.from({length:22},(_,i)=>i+1),
    24,26,27,29,30,31,32];
  assert.deepEqual(a.exactOriginalRanks,expectedRanks);
  const ids=new Set();
  for(const p of a.pairs){
    assert.equal(ids.has(p.id),false);
    ids.add(p.id);
    assert.ok(p.candidateSeat===0||p.candidateSeat===1);
    assert.equal(p.control?.id,p.id);
    assert.equal(p.treatment?.id,p.id);
    assert.equal(p.bothTerminal,
      p.control.status==='native-terminal'&&
      p.treatment.status==='native-terminal');
    assert.equal(p.nativeWinnerChanged,
      p.bothTerminal&&p.control.winner!==p.treatment.winner);
    const isOriginalWinner=(arm)=>arm.status==='native-terminal'&&
      arm.winner===1-p.candidateSeat;
    const isCandidateWinner=(arm)=>arm.status==='native-terminal'&&
      arm.winner===p.candidateSeat;
    assert.equal(p.sourceLossToCandidateWin,p.bothTerminal&&
      isOriginalWinner(p.control)&&isCandidateWinner(p.treatment));
    assert.equal(p.candidateWinToSourceLoss,p.bothTerminal&&
      isCandidateWinner(p.control)&&isOriginalWinner(p.treatment));
  }
  const eligible=a.pairs.filter(p=>p.physicalMatched);
  const complete=eligible.filter(p=>p.bothTerminal);
  const flips=complete.filter(p=>p.nativeWinnerChanged);
  const rankRows=expectedRanks.map(rank=>{
    const rows=a.pairs.filter(p=>p.rank===rank);
    assert.equal(rows.length,2);
    assert.deepEqual(rows.map(p=>p.candidateSeat),[0,1]);
    const valid=rows.filter(p=>p.physicalMatched);
    const both=valid.filter(p=>p.bothTerminal);
    const changes=both.filter(p=>p.nativeWinnerChanged);
    return {
      originalRank:rank,registeredPhysicalDeals:2,
      physicallyMatched:valid.length,bothNativeTerminal:both.length,
      nativeWinnerReversals:changes.length,
      candidateGainedNativeWin:changes.filter(p=>
        p.sourceLossToCandidateWin).length,
      candidateLostNativeWin:changes.filter(p=>
        p.candidateWinToSourceLoss).length,
      nativeStatuses:rows.map(p=>({
        id:p.id,seat:p.candidateSeat,physicalMatched:p.physicalMatched,
        control:p.control.status,treatment:p.treatment.status
      }))
    };
  });
  assert.equal(rankRows.reduce((n,r)=>n+r.physicallyMatched,0),
    eligible.length);
  const allFlips=a.pairs.filter(p=>p.nativeWinnerChanged);
  return {
    schema:VERSION,originalRunId:42552656722,
    originalHead:a.githubSha,
    nativeEngine:a.pinnedNativeEngine,fixedContender:a.fixed60,
    immutableRegisteredGroups:58,actualNativeAttempts:116,
    paperCompetitiveQualifiedGames:0,
    panelStatus:eligible.length===58?'PAIRED_PANEL_COMPLETE':
      'INVALID_MISSING_OR_UNMATCHED_PHYSICAL_FINGERPRINTS',
    totals:{
      physicallyMatched:eligible.length,
      unmatched:a.pairs.length-eligible.length,
      bothNativeTerminalMatched:complete.length,
      nativeWinnerReversalsMatched:flips.length,
      championWinGainsMatched:flips.filter(p=>
        p.sourceLossToCandidateWin).length,
      championWinLossesMatched:flips.filter(p=>
        p.candidateWinToSourceLoss).length,
      unqualifiedNativeWinnerReversalsAllDeals:allFlips.length,
      controlNativeTerminals:a.summary.nativeTerminalsControl,
      treatmentNativeTerminals:a.summary.nativeTerminalsTreatment,
      rootCaps:a.summary.caps,
      engineErrors:a.summary.errors,
      paperQualifiedGames:0
    },
    changedWinnersMatched:flips.map(p=>({
      id:p.id,rank:p.rank,candidateSeat:p.candidateSeat,
      controlWinner:p.control.winner,treatmentWinner:p.treatment.winner,
      controlPrizeCounts:p.control.finalPrizes,
      treatmentPrizeCounts:p.treatment.finalPrizes,
      firstDifferentAcceptedRootIndex:p.firstRootDifference,
      controlFirstDifferentRoot:p.control.rootActionLedger?.[
        p.firstRootDifference]??null,
      treatmentFirstDifferentRoot:p.treatment.rootActionLedger?.[
        p.firstRootDifference]??null,
      sourceLostToChampion:p.sourceLossToCandidateWin,
      championLostToSource:p.candidateWinToSourceLoss
    })),
    unmatchedGroups:a.pairs.filter(p=>!p.physicalMatched).map(p=>({
      id:p.id,rank:p.rank,controlStatus:p.control.status,
      treatmentStatus:p.treatment.status,
      hasControlSourceFingerprint:!!p.control.sourceDealFingerprint,
      hasTreatmentSourceFingerprint:!!p.treatment.sourceDealFingerprint,
      hasControlFullFingerprint:!!p.control.fullPhysicalDealFingerprint,
      hasTreatmentFullFingerprint:!!p.treatment.fullPhysicalDealFingerprint,
      controlError:p.control.error,
      treatmentError:p.treatment.error,
      nativeWinnerChanged:p.nativeWinnerChanged
    })),
    byOriginalRank:rankRows,
    limitation:'Retrospective analysis of pre-registered immutable native archive. Root caps, engine errors and paper clock remain unqualified; a native winner is not an official match win.'
  };
}

/**
 * Audit archived native physical deals offline, retaining the original ZIP as
 * a separate immutable source. No bot or engine is reexecuted here.
 */
function run(file){
  const bytes=fs.readFileSync(file);
  const report=JSON.parse(bytes.toString('utf8'));
  const result=audit(report);
  result.inputJsonSha256=createHash('sha256').update(bytes).digest('hex');
  return result;
}

if(require.main===module){
  const input=process.env.AGENT3_PORTABLE_ALL29_AUDIT_INPUT;
  assert.ok(input,'An exact preexisting native artifact path is required');
  const result=run(path.resolve(input));
  if(process.env.AGENT3_PORTABLE_ALL29_AUDIT_OUTPUT)
    save(process.env.AGENT3_PORTABLE_ALL29_AUDIT_OUTPUT,result);
  process.stdout.write('AGENT3_PORTABLE_ALL29_ARCHIVE_AUDIT '+
    JSON.stringify({
      status:result.panelStatus,runId:result.originalRunId,
      totals:result.totals,changed:result.changedWinnersMatched,
      unmatched:result.unmatchedGroups,byRank:result.byOriginalRank
    })+'\n');
}
module.exports={VERSION,audit,run};
