'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const registration=require('../../../results/aichi-2026/registrations/agent41-prospective-guzma-omega-all29-20261109.json');
const {runArm,summarize}=
  require('../agent3/portable-champion-all29-20261109.cjs');
const {runDevelopment}=
  require('../agent41-bilateral-v2-development.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {installRegidragoCelestialRoarPaperCustodyHook}=
  require('../../twinleaf/regidrago-celestial-roar-paper-custody-hook.cjs');

const VERSION='agent41-prospective-all29-omega-barrier-Guzma-owner-choice-v1';
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/** @returns {object[]} Frozen before this investigation's native execution. */
function preregistered(){
  assert.equal(registration.status,'FROZEN BEFORE FIRST NATIVE GAME');
  assert.equal(registration.physicalGroups,58);
  assert.equal(registration.nativeAttempts,116);
  assert.equal(registration.frozenChampionCandidate,'champion-reference');
  assert.equal(registration.groups.length,58);
  assert.equal(new Set(registration.groups.map(g=>g.seed)).size,58);
  assert.equal(new Set(registration.groups.map(g=>g.id)).size,58);
  assert.equal(new Set(registration.groups.map(g=>g.rank)).size,29);
  assert.deepEqual(registration.missingOriginalRanks,[23,25,28]);
  for(const rank of registration.exactOriginalRanks){
    assert.deepEqual(registration.groups.filter(g=>g.rank===rank)
      .map(g=>g.candidateSlot),['A','B']);
  }
  return registration.groups.map(g=>({...g}));
}

/** A/B only changes printed Omega Barrier-aware target selection. */
function runArmForFactor(avoidanceEnabled,groups){
  const previous=process.env.AGENT41_GUZMA_OMEGA_BARRIER_PREF_OFF;
  process.env.AGENT41_GUZMA_OMEGA_BARRIER_PREF_OFF=
    avoidanceEnabled?'false':'true';
  try{
    return runArm(false,groups,options=>runDevelopment({
      ...options,
      registeredFrameName:VERSION+(avoidanceEnabled?'-B-on':'-A-off')
    }));
  }finally{
    if(previous===undefined)
      delete process.env.AGENT41_GUZMA_OMEGA_BARRIER_PREF_OFF;
    else process.env.AGENT41_GUZMA_OMEGA_BARRIER_PREF_OFF=previous;
  }
}

/** @param {object} row Complete native row. */
function synopsis(row){
  const n=summarize(row);
  const counts=row.actorOnlyDecisionCoverage?.nativeDecisionCounts??{};
  return {
    id:n.id,rank:n.rank,candidateSeat:n.candidateSeat,
    status:n.status,winner:n.winner,rootCount:n.rootCount,
    error:n.error,finalPrizes:n.finalPrizes,
    sourceDealFingerprint:n.sourceDealFingerprint,
    fullPhysicalDealFingerprint:n.fullPhysicalDealFingerprint,
    rootLedgerSha256:n.rootLedgerSha256,
    choosePokemonAccepted:counts.choosePokemonAccepted??null,
    choosePokemonSettled:counts.choosePokemonSettled??null,
    choosePokemonNativeFiltered:counts.choosePokemonNativeFiltered??null
  };
}

/** Same exact two physical starting deals are mandatory for a pair. */
function compare(control,treatment){
  assert.equal(control.rows.length,58);
  assert.equal(treatment.rows.length,58);
  return control.rows.map((first,i)=>{
    const a=synopsis(first),b=synopsis(treatment.rows[i]);
    assert.equal(a.id,b.id,'Pair IDs differ');
    assert.ok(a.sourceDealFingerprint&&b.sourceDealFingerprint);
    assert.ok(a.fullPhysicalDealFingerprint&&b.fullPhysicalDealFingerprint);
    assert.equal(JSON.stringify(a.sourceDealFingerprint),
      JSON.stringify(b.sourceDealFingerprint),'Original source deal drift');
    assert.equal(JSON.stringify(a.fullPhysicalDealFingerprint),
      JSON.stringify(b.fullPhysicalDealFingerprint),'Two-player deal drift');
    const bothTerminal=a.status==='native-terminal'&&
      b.status==='native-terminal';
    const trial=registration.groups[i];
    const candidateSeat=trial.candidateSlot==='A'?0:1;
    return {
      id:a.id,rank:a.rank,candidateSeat:trial.candidateSlot,
      physicalMatched:true,bothTerminal,
      winnerReversed:bothTerminal&&a.winner!==b.winner,
      candidateWinGain:bothTerminal&&a.winner!==candidateSeat&&
        b.winner===candidateSeat,
      candidateWinLoss:bothTerminal&&a.winner===candidateSeat&&
        b.winner!==candidateSeat,
      control:a,treatment:b
    };
  });
}

/**
 * Run both preregistered arms on all 58 exact printed deals. Preserve
 * terminal, error and cap rows instead of treating failures as losses.
 */
function run(){
  const groups=preregistered();
  const prior=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  const restoreDoor=installUnderworldDoorPsychicRecipientHook();
  let restoreRoar=null,a,b;
  try{
    restoreRoar=installRegidragoCelestialRoarPaperCustodyHook();
    a=runArmForFactor(false,groups);
    b=runArmForFactor(true,groups);
  }finally{
    try{if(restoreRoar)restoreRoar();}
    finally{
      restoreDoor();
      if(prior===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
      else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=prior;
    }
  }
  const pairs=compare(a,b);
  const terminal=pairs.filter(p=>p.bothTerminal);
  const summary={
    exactOriginalRanks:29,missingOriginalRanks:[23,25,28],
    fixedSixty:'champion-reference',physicalPairs:58,
    attemptedGames:116,allPhysicalPairsMatched:true,
    controlTerminals:pairs.filter(p=>p.control.status==='native-terminal').length,
    treatmentTerminals:pairs.filter(p=>p.treatment.status==='native-terminal').length,
    bothTerminalPairs:terminal.length,
    candidateWinGains:terminal.filter(p=>p.candidateWinGain).length,
    candidateWinLosses:terminal.filter(p=>p.candidateWinLoss).length,
    controlErrors:pairs.filter(p=>p.control.status==='engine-error').length,
    treatmentErrors:pairs.filter(p=>p.treatment.status==='engine-error').length,
    controlCaps:pairs.filter(p=>p.control.status==='root-cap').length,
    treatmentCaps:pairs.filter(p=>p.treatment.status==='root-cap').length,
    controlNativeFiltered:pairs.reduce((n,p)=>
      n+(p.control.choosePokemonNativeFiltered??0),0),
    treatmentNativeFiltered:pairs.reduce((n,p)=>
      n+(p.treatment.choosePokemonNativeFiltered??0),0),
    paperQualifiedGames:0
  };
  return {
    schema:VERSION,registration:registration.schema,
    registrationSha256:hash(registration),
    enginePin:registration.enginePin,
    codeRevision:process.env.GITHUB_SHA??null,
    fixedCandidate60:'champion-reference',
    policyComparison:'exactly same canonical common policies except Omega Barrier-aware opponent Guzma prompt choice',
    noPaperCompetitiveQualification:true,
    summary,
    rankRows:registration.exactOriginalRanks.map(rank=>{
      const rows=pairs.filter(p=>p.rank===rank);
      return {
        rank,matched:rows.length,
        bothTerminal:rows.filter(p=>p.bothTerminal).length,
        candidateWinGains:rows.filter(p=>p.candidateWinGain).length,
        candidateWinLosses:rows.filter(p=>p.candidateWinLoss).length,
        controlErrors:rows.filter(p=>p.control.status==='engine-error').length,
        treatmentErrors:rows.filter(p=>p.treatment.status==='engine-error').length,
        controlCaps:rows.filter(p=>p.control.status==='root-cap').length,
        treatmentCaps:rows.filter(p=>p.treatment.status==='root-cap').length
      };
    }),
    pairs,rawControl:a,rawTreatment:b,competitiveQualified:false
  };
}

/**
 * Single-writer, locked, rename-atomic CI artifact; no partially written
 * shared result can be mistaken for a complete prospective panel.
 */
function saveAtomic(filename,object){
  const file=path.resolve(filename);
  fs.mkdirSync(path.dirname(file),{recursive:true});
  const lock=file+'.lock',temporary=file+'.tmp.'+process.pid;
  const lockFd=fs.openSync(lock,'wx');
  try{
    fs.writeFileSync(temporary,JSON.stringify(object)+'\n');
    fs.renameSync(temporary,file);
  }finally{
    if(fs.existsSync(temporary))fs.unlinkSync(temporary);
    fs.closeSync(lockFd);fs.unlinkSync(lock);
  }
}

if(require.main===module) {
  const report=run();
  if(process.env.AGENT41_OMEGA_FIELD_OUTPUT)
    saveAtomic(process.env.AGENT41_OMEGA_FIELD_OUTPUT,report);
  process.stdout.write('AGENT41_OMEGA_PROSPECTIVE_ALL29 '+
    JSON.stringify({schema:report.schema,summary:report.summary,
      changes:report.pairs.filter(p=>p.winnerReversed).map(p=>({
        id:p.id,rank:p.rank,candidateSeat:p.candidateSeat,
        controlWinner:p.control.winner,treatmentWinner:p.treatment.winner,
        controlRoots:p.control.rootCount,
        treatmentRoots:p.treatment.rootCount
      }))})+'\n');
}

module.exports={VERSION,preregistered,runArmForFactor,synopsis,compare,run,saveAtomic};
