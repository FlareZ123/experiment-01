'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {randomUUID} = require('node:crypto');
const {run} = require('./agent43-v8-snaptrap-exact-prompt-blocker.cjs');

const VERSION = 'agent43-v8-snaptrap-energy-recipient-treatment-v1';

/** Count actual Basic Psychic attachments per public in-play slot. */
function psychicDistribution(board, seat) {
  const p = Array.isArray(board) ? board[seat] : null;
  if (!p) return null;
  const slots = [{zone:'active',slot:p.active},
    ...(p.bench??[]).map((slot,i)=>({zone:'bench-'+i,slot}))];
  return slots.filter(x=>x.slot).map(x=>({
    zone:x.zone,printing:x.slot.printing,
    attachedPsychic:(x.slot.energyCards??[])
      .filter(x=>x==='Psychic Energy').length,
    totalEnergies:(x.slot.energyCards??[]).length
  }));
}

/**
 * Prospective one-axis optimization. Existing v3 owner-Ability settlement
 * remains enabled in both arms; treatment adds only the previously authored
 * owner-basic-energy recipient frontier to both physical seats.
 */
function runTreatment() {
  const report = run({ownerAbilityConfirm:true,energyRecipient:true});
  assert.equal(report.experimentalOwnerAbilityConfirm,true);
  assert.equal(report.experimentalBasicEnergyRecipient,true);
  assert.equal(report.exactOriginalTrialIds.length,4);
  const rows = report.attempts.map(x=>({
    id:x.id,
    candidateSeat:x.candidateSeat,
    sourceSeat:x.sourceSeat,
    acceptedRoots:x.acceptedRootCount,
    finished:x.nativeFinished,
    winner:x.nativeWinner,
    endReason:x.nativeEndReason,
    turns:x.nativeTurnCount,
    finalPrizes:x.nativeFinalPrizes,
    failureStage:x.nativeFailureStage,
    candidatePsychicEnergy:psychicDistribution(x.nativeFinalPublicBoard,
      x.candidateSeat),
    sourcePsychicEnergy:psychicDistribution(x.nativeFinalPublicBoard,
      x.sourceSeat),
    rootActionMix:x.nativeRootActionMix,
    finalThirtyPublicRoots:x.nativeFinalThirtyPublicRoots
  }));
  return {
    schema:VERSION,
    comparisonControlRunId:42519222572,
    sameOriginalFourArmRegistration:report.originalFrameName,
    sameSourceChampionSixtiesAndSeeds:true,
    nativeRootActionLimit:report.preservedNativeRootCap,
    oneAdditionalStrategyAxis:'bilateralBasicEnergyRecipientFrontier',
    bothSeatsEqualDecisionPolicy:true,
    ownerAbilityConfirmOptIn:true,
    totalAbilityConfirmsSettled:report.ownerAbilityConfirmAudit?.confirmSettled??0,
    nativeQuarantineFallbackCalls:report.nativeQuarantineFallbackCalls,
    finishedCount:rows.filter(x=>x.finished===true).length,
    rows,
    competitiveGamesQualified:0,
    competitiveWinRate:null
  };
}

/** Atomic locked evidence output, disjoint from other experiment JSONs. */
function writeReport(data) {
  const dir=path.resolve(__dirname,
    '../../artifacts/agent43-v8-snaptrap-owner-root');
  fs.mkdirSync(dir,{recursive:true});
  const file=path.join(dir,'energy-recipient-treatment.json');
  const fd=fs.openSync(file+'.lock','wx');
  const temp=file+'.'+process.pid+'.'+randomUUID()+'.tmp';
  try {
    fs.writeFileSync(temp,JSON.stringify(data,null,2)+'\n',{flag:'wx'});
    fs.renameSync(temp,file);
  } finally {
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);
    fs.unlinkSync(file+'.lock');
  }
  return file;
}

if(require.main===module){
  const data=runTreatment();
  const target=writeReport(data);
  process.stdout.write(JSON.stringify({
    schema:VERSION,
    target,
    totalAbilityConfirmsSettled:data.totalAbilityConfirmsSettled,
    nativeQuarantineFallbackCalls:data.nativeQuarantineFallbackCalls,
    finishedCount:data.finishedCount,
    rows:data.rows.map(x=>({
      id:x.id,finished:x.finished,winner:x.winner,
      endReason:x.endReason,acceptedRoots:x.acceptedRoots,
      turns:x.turns,finalPrizes:x.finalPrizes,
      candidatePsychicEnergy:x.candidatePsychicEnergy,
      candidateRootActionMix:Object.fromEntries(
        Object.entries(x.rootActionMix).filter(([k])=>
          k.startsWith(x.candidateSeat+':'))
      )
    })),
    competitiveGamesQualified:0
  },null,2)+'\n');
}
module.exports={VERSION,psychicDistribution,runTreatment,writeReport};
