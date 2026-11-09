'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');

const VERSION='agent33-shadow-active-funding-116-native-audit-v1';
const VMAX='Shadow Rider Calyrex VMAX CRE';
const MARSHADOW='Marshadow UNB';

/** @param {object|null} p */
function psychicCount(p){
  return (p?.energyCards??[]).filter(x=>
    typeof x==='string'&&x.includes('Psychic Energy')).length;
}

/**
 * Diagnose physical, printed attack headroom in the *actual final public
 * board*. This is not a diagnosis of why a game ended or proof that an
 * earlier different energy choice would have changed its outcome.
 * @param {object} row Native full trial row.
 * @returns {object} Source-matched exact trial diagnostic.
 */
function summarizeNativeTrial(row){
  assert.ok(row?.trial&&['A','B'].includes(row.trial.candidateSlot));
  const seat=row.trial.candidateSlot==='A'?0:1;
  const board=Array.isArray(row.finalBoard)?
    row.finalBoard[seat]:null;
  const active=board?.active??null;
  const bench=board?.bench??[];
  const activePsychic=psychicCount(active);
  const benchPsychic=bench.reduce((s,p)=>s+psychicCount(p),0);
  const promptEvents=(row.nativeAcceptedEnergyPromptSidecar?.events??[])
    .filter(e=>e.playerSlot===seat);
  const marshadowPromptEvents=promptEvents.filter(event=>
    (event.publicChanges??[]).some(p=>
      p.after?.pokemon===MARSHADOW&&
      psychicCount({energyCards:p.after.energies})>
      psychicCount({energyCards:p.before?.energies})));
  const manualEnergy=(row.nativeAcceptedTargetSidecar?.events??[])
    .filter(event=>
      event.playerSlot===seat&&event.action==='PlayCardAction'&&
      event.declared?.ownerHandPrinting?.startsWith('Psychic Energy '))
    .map(event=>({
      turn:event.turnBefore,ordinal:event.actionOrdinal,
      slot:event.declared?.target?.slot,
      index:event.declared?.target?.index
    }));
  return {
    trialId:row.trial.id,
    candidate:row.trial.candidateId,
    rank:row.trial.rank,
    candidateSeat:seat,
    seed:row.trial.seed,
    sourceDealFingerprint:row.sourceDealFingerprint,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint,
    finished:row.finished,
    winnerSeat:row.winner,
    nativeTurn:row.turns,
    candidateAttackDeclarations:row.attackDeclarations?.candidate??0,
    finalActive:active?.printing??null,
    finalActivePsychic:activePsychic,
    finalBenchPsychic:benchPsychic,
    finalBenchedPsychicTargets:bench.filter(p=>psychicCount(p)>0)
      .map(p=>({printing:p.printing,psychic:psychicCount(p)})),
    nativeUnderworldPromptChoices:promptEvents.length,
    underworldToMarshadow:marshadowPromptEvents.length,
    manualEnergy,
    strandedActiveVmax:active?.printing===VMAX&&
      activePsychic<3&&benchPsychic>=3
  };
}

/**
 * Analyze the archived 116 pinned native attempts without introducing
 * invented wins or simulated actions. Both numerator and denominator are
 * explicit; an endpoint state must not be counted as a missed viable action.
 * @param {object} archive Unmodified Agent3 all29 JSON artifact.
 * @returns {object}
 */
function summarizeArchive(archive){
  assert.ok(Array.isArray(archive?.actualNativeRuns));
  const rows=archive.actualNativeRuns.flatMap(run=>
    run.rows.map(summarizeNativeTrial));
  const counts={};
  for(const candidate of ['champion-reference','hood-shield-v1']){
    const r=rows.filter(row=>row.candidate===candidate);
    counts[candidate]={
      attempts:r.length,
      activeVmaxAtFinal:r.filter(row=>row.finalActive===VMAX).length,
      strandedActiveVmaxAtFinal:r.filter(row=>row.strandedActiveVmax).length,
      strandedWithZeroCandidateAttacks:r.filter(row=>
        row.strandedActiveVmax&&row.candidateAttackDeclarations===0).length,
      nativeUnderworldPromptChoices:r.reduce((n,row)=>
        n+row.nativeUnderworldPromptChoices,0),
      underworldToMarshadow:r.reduce((n,row)=>
        n+row.underworldToMarshadow,0),
      candidateAttackDeclarations:r.reduce((n,row)=>
        n+row.candidateAttackDeclarations,0)
    };
  }
  const rank7b=rows.filter(r=>r.rank===7&&r.candidateSeat===1);
  assert.equal(rank7b.length,2);
  assert.equal(rank7b[0].sourceDealFingerprint,
    rank7b[1].sourceDealFingerprint,
    'Rank7 B must be an identical original-source deal');
  return {
    schema:VERSION,
    enginePin:archive.actualNativeRuns[0].enginePin,
    counts,
    rank7b,
    otherStranded:rows.filter(row=>row.strandedActiveVmax&&
      !(row.rank===7&&row.candidateSeat===1))
      .map(({trialId,candidate,finished,winnerSeat,
        finalActivePsychic,finalBenchPsychic,candidateAttackDeclarations})=>({
        trialId,candidate,finished,winnerSeat,
        finalActivePsychic,finalBenchPsychic,candidateAttackDeclarations
      })),
    competitiveQualifiedGames:0
  };
}

if(require.main===module){
  assert.equal(process.argv.length,3,
    'Pass one local, uncompressed Agent3 full native archive JSON path');
  const input=fs.readFileSync(process.argv[2]);
  const data=JSON.parse(input.toString('utf8'));
  const report={
    rawSha256:crypto.createHash('sha256').update(input).digest('hex'),
    ...summarizeArchive(data)
  };
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
}

module.exports={VERSION,psychicCount,summarizeNativeTrial,summarizeArchive};
