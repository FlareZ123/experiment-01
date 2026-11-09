'use strict';

const assert=require('node:assert/strict');
const reg=require('../../../results/aichi-2026/registrations/agent8-source-challenger-prospective-v2-20261109.json');
const original=require('./agent8-source-challenger-2x2.cjs');
const {runNativeBatch,summarizeRow}=require('../agent32-fresh-perfection-field.cjs');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');

const VERSION='agent8-source-search-quickball-mail-adversarial-2x2-prospective-v2';
const PHASES=original.PHASES;

/** @returns {object[]} Eight new precommitted physical encounters, both seats. */
function registered(){
  assert.equal(reg.schema,'agent8-prospective-original-source-adversarial-2x2-v2');
  assert.equal(reg.nativePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(reg.physicalGroups,8);
  assert.equal(reg.nativeAttempts,32);
  assert.deepEqual(reg.originalSourceRanks,[5,11,13,31]);
  const groups=reg.groups;
  assert.equal(groups.length,8);
  assert.equal(new Set(groups.map(x=>x.seed)).size,8);
  assert.equal(new Set(groups.map(x=>x.id)).size,8);
  for(const group of groups){
    assert.equal(group.id,
      [group.rank,group.repeat,group.candidateSlot,group.candidateId].join(':'));
    assert.ok(['A','B'].includes(group.candidateSlot));
    assert.equal(group.candidateId,reg.candidate);
  }
  for(const rank of reg.originalSourceRanks)
    assert.deepEqual(groups.filter(group=>group.rank===rank)
      .map(group=>group.candidateSlot).sort(),['A','B']);
  return groups.map(row=>({...row}));
}

/**
 * The source challenge now has two actually reusable owner-search channels.
 * Both-seat hand-discard and deck-search prompt bridges are common across
 * all four arms, avoiding a prompt-competence confound in S0/S1.
 * @param {boolean} challenge
 */
function options(challenge){
  assert.equal(typeof challenge,'boolean');
  return {
    ...original.sourceChallengeRootOptions(challenge),
    sourceScopedQuickBallRoot:challenge,
    actorOwnerMailAfterPass:challenge,
    actorOwnerMailAfterPassSourceOnly:challenge,
    actorOnlySingleSearch:true,
    actorHandDiscard:true
  };
}

/** @param {object} phase @param {Function} [nativeRunner] */
function runPhase(phase,nativeRunner=runDevelopment){
  assert.ok(PHASES.some(row=>row.id===phase.id));
  return runNativeBatch(true,runOptions=>nativeRunner({
    ...runOptions,...options(phase.sourceChallenge)
  }),{
    registeredTrials:registered(),
    registeredFrameName:reg.schema+'-'+phase.id,
    nativeRootActionLimit:reg.rootLimit,
    vipAfterPass:true,
    vipPreferMewtwoDonor:true,
    perfectionTransition:phase.pivot
  });
}

/**
 * Identify source-owned genuine root card plays in the pinned ledger.
 * These are developmental action receipts, never paper game qualification.
 * @param {object} native
 * @returns {object}
 */
function sourceActions(native){
  const trial=native.trial??{};
  const sourceSeat=trial.candidateSlot==='A'?1:0;
  const roots=Array.isArray(native.rootActionLedger)?
    native.rootActionLedger:[];
  const owned=roots.filter(row=>row.playerSlot===sourceSeat);
  const played=owned.filter(row=>row.action==='PlayCardAction');
  const pick=label=>played.filter(row=>
    typeof row.card==='string'&&
    (row.card===label||row.card.startsWith(label+' '))).length;
  return {
    seat:sourceSeat,rootActions:owned.length,
    quickBall:pick('Quick Ball'),
    trainersMail:pick("Trainers' Mail"),
    vsSeeker:pick('VS Seeker'),
    floatStone:pick('Float Stone'),
    attacks:owned.filter(row=>row.action==='AttackAction').length,
    terminal:native.finished===true,error:native.error?String(native.error).slice(0,200):null
  };
}

/**
 * True prospective all-four original-source responses. The v1 pure analyzer
 * is reused only for comparison logic, with explicit v2 identity and pins.
 * @param {{runPhase?:Function}} [deps]
 */
function run(deps={}){
  const groups=registered();
  const summaries={},rawNativeRows={},sourceActionReceipts={};
  for(const phase of PHASES){
    const result=(deps.runPhase??runPhase)(phase);
    assert.ok(Array.isArray(result?.selected?.rawDevelopment?.rows));
    const rows=result.selected.rawDevelopment.rows;
    assert.equal(rows.length,groups.length);
    rawNativeRows[phase.id]=rows;
    summaries[phase.id]=rows.map(row=>summarizeRow(row,true));
    sourceActionReceipts[phase.id]=rows.map(sourceActions);
  }
  const comparison=original.analyze(summaries,groups);
  const sourceChangedRoot=phase=>{
    return comparison.pairs.filter(pair=>{
      const first=phase==='withoutPivot'?
        pair.sourceChallengerFirstDifferenceWithoutPivot:
        pair.sourceChallengerFirstDifferenceWithPivot;
      return first&&Number.isSafeInteger(first.ordinal);
    }).length;
  };
  return {
    ...comparison,version:VERSION,registration:reg.schema,
    enginePin:reg.nativePin,nativeRootLimit:reg.rootLimit,
    phaseOrder:PHASES,sourceFactor:reg.factors.opponentResponse,
    promptOptionsConstantAcrossPhases:true,
    sourceChallengeOptions:options(true),
    originalSourceSixtiesUnchanged:true,
    prospectivelyRegisteredBeforeFirstRun:true,
    qualifiedPaperGames:0,
    totals:{
      ...comparison.totals,
      sourceChangedFirstRootWithoutPivot:sourceChangedRoot('withoutPivot'),
      sourceChangedFirstRootWithPivot:sourceChangedRoot('withPivot'),
      sourceQuickBallRootsS1:sourceActionReceipts.P0S1.reduce((n,x)=>n+x.quickBall,0)+
        sourceActionReceipts.P1S1.reduce((n,x)=>n+x.quickBall,0),
      sourceMailRootsS1:sourceActionReceipts.P0S1.reduce((n,x)=>n+x.trainersMail,0)+
        sourceActionReceipts.P1S1.reduce((n,x)=>n+x.trainersMail,0)
    },
    sourceActionReceipts,phaseSummaries:summaries,rawNativeRows
  };
}

if(require.main===module){
  const output=run();
  original.save(process.env.AGENT8_SOURCE_CHALLENGER_V2_OUTPUT??
    'artifacts/agent8-source-challenger-v2.json',output);
  const compact=output.pairs.map(pair=>({
    id:pair.id,
    samePhysical:pair.physicallyMatchedAcrossFour,
    sourceChangedWithoutPivot:
      pair.sourceChallengerFirstDifferenceWithoutPivot?.ordinal??null,
    sourceChangedWithPivot:
      pair.sourceChallengerFirstDifferenceWithPivot?.ordinal??null,
    statuses:PHASES.map(phase=>pair[phase.id].status),
    winners:PHASES.map(phase=>pair[phase.id].winner)
  }));
  process.stdout.write('AGENT8_SOURCE_CHALLENGER_V2 '+
    JSON.stringify({totals:output.totals,pairs:compact})+'\n');
  if(output.status!=='PHYSICAL-MATCHED-DEVELOPMENT-ONLY')
    process.exitCode=1;
}
module.exports={
  VERSION,PHASES,registered,options,runPhase,
  sourceActions,run
};
