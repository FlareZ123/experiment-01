'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const registration=require('../../../results/aichi-2026/registrations/agent15-first-actual-cursed-blast-four-group-20261109.json');
const {runNativeBatch,summarizeRow}=
  require('../agent32-fresh-perfection-field.cjs');
const {firstRootDivergence}=
  require('../agent24-v8-perfection-paired-native.cjs');
const {withOwnerCursedBlastAfterPass,VERSION:POLICY}=
  require('../../twinleaf/agent15/owner-cursed-blast-after-pass.cjs');

const VERSION='agent15-preregistered-original11-31-cursed-blast-native-pair-v1';

/** @returns {object[]} Previously committed, unreplayed four physical trials. */
function registered(){
  assert.equal(registration.schema,
    'agent15-fresh-two-rank-cursed-blast-after-pass-v1');
  assert.equal(registration.status,'FROZEN_BEFORE_FIRST_NATIVE_DISPATCH');
  assert.deepEqual(registration.sourceRanks,[11,31]);
  assert.equal(registration.groups.length,4);
  assert.equal(registration.nativeGameAttemptsPlanned,8);
  assert.equal(registration.candidateId,'new-moon-lockbreaker-v1');
  assert.equal(registration.nativeRootLimit,260);
  assert.equal(registration.enginePin,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(new Set(registration.groups.map(x=>x.seed)).size,4);
  assert.equal(new Set(registration.groups.map(x=>x.id)).size,4);
  for(const group of registration.groups){
    assert.ok([11,31].includes(group.rank));
    assert.ok(['A','B'].includes(group.candidateSlot));
    assert.equal(group.candidateId,registration.candidateId);
    assert.equal(group.id,[group.rank,group.repeat,
      group.candidateSlot,group.candidateId].join(':'));
    assert.ok(Number.isSafeInteger(group.seed)&&group.seed>=0&&
      group.seed<=0xffffffff);
  }
  for(const rank of registration.sourceRanks)
    for(const seat of ['A','B'])
      assert.equal(registration.groups.filter(x=>
        x.rank===rank&&x.candidateSlot===seat).length,1);
  return registration.groups.map(x=>({...x}));
}

/** @param {object} row @returns {object} */
function compact(row){
  return {
    id:row.id,rank:row.rank,candidateSeat:row.candidateSeat,
    sourceSeat:row.sourceSeat,seed:row.seed,status:row.status,
    finished:row.finished,winner:row.status==='native-terminal'?
      row.winner:null,remainingPrizes:row.remainingPrizes,
    rootActions:row.rootActions,
    sourceDealFingerprint:row.sourceDealFingerprint,
    fullDealFingerprint:row.fullPhysicalDealFingerprint,
    nativeRootDigest:row.nativeLedgerDigest,
    error:row.error,
    qualifiedCompetitive:false
  };
}

/** @param {object} control @param {object} treatment @returns {object} */
function paired(control,treatment){
  assert.equal(control.id,treatment.id);
  assert.equal(control.seed,treatment.seed);
  const haveFull=control.fullPhysicalDealFingerprint&&
    treatment.fullPhysicalDealFingerprint;
  const haveSource=control.sourceDealFingerprint&&
    treatment.sourceDealFingerprint;
  const fullMatched=Boolean(haveFull&&
    JSON.stringify(control.fullPhysicalDealFingerprint)===
      JSON.stringify(treatment.fullPhysicalDealFingerprint));
  const sourceMatched=Boolean(haveSource&&
    JSON.stringify(control.sourceDealFingerprint)===
      JSON.stringify(treatment.sourceDealFingerprint));
  const settled=control.status==='native-terminal'&&
    treatment.status==='native-terminal';
  const firstChange=Array.isArray(control.rootActionLedger)&&
    Array.isArray(treatment.rootActionLedger)?
    firstRootDivergence(control.rootActionLedger,treatment.rootActionLedger):null;
  return {
    id:control.id,rank:control.rank,seed:control.seed,
    candidateSeat:control.candidateSeat,sourceSeat:control.sourceSeat,
    matchedPhysicalDeal:fullMatched&&sourceMatched,
    matchedFullDeal:fullMatched,matchedOriginalSourceDeal:sourceMatched,
    bothNativeTerminal:settled,
    changedWinner:settled&&control.winner!==treatment.winner,
    firstNativeRootDivergence:firstChange,
    control:compact(control),treatment:compact(treatment),
    paperQualified:false
  };
}

/**
 * Exactly eight native attempts, all four preregistered physical groups.
 * No candidate deck change or source-deck mutation. Report censor/error and
 * effective activation instead of attributing an improved win rate.
 *
 * @param {{runner?:Function,runBatch?:Function,wrapper?:Function}} [deps]
 * @returns {object}
 */
function run(deps={}){
  const groups=registered();
  const runBatch=deps.runBatch??runNativeBatch;
  const wrapper=deps.wrapper??withOwnerCursedBlastAfterPass;
  const options={
    registeredTrials:groups,registeredFrameName:registration.schema,
    nativeRootActionLimit:registration.nativeRootLimit,
    vipAfterPass:true,vipPreferMewtwoDonor:true
  };
  const common=()=>runBatch(true,deps.runner,options);
  const control=common();
  const treated=wrapper(common);
  const policyAudit=treated.audit;
  const left=control.selected.rawDevelopment.rows.map(x=>summarizeRow(x,true));
  const right=treated.result.selected.rawDevelopment.rows
    .map(x=>summarizeRow(x,true));
  assert.equal(left.length,4);
  assert.equal(right.length,4);
  const byId=new Map(right.map(x=>[x.id,x]));
  assert.equal(byId.size,4);
  const pairs=left.map(x=>{
    assert.ok(byId.has(x.id),'Missing preregistered native treatment');
    return paired(x,byId.get(x.id));
  });
  const allMatched=pairs.every(x=>x.matchedPhysicalDeal);
  const controlNat=pairs.filter(x=>x.control.status==='native-terminal').length;
  const treatedNat=pairs.filter(x=>x.treatment.status==='native-terminal').length;
  const errorCount=pairs.reduce((n,x)=>n+
    Number(x.control.status==='engine-error')+
    Number(x.treatment.status==='engine-error'),0);
  return {
    version:VERSION,policy:POLICY,
    registration:registration.schema,
    registeredUtc:registration.registeredUtc,
    cohortRanks:registration.sourceRanks,
    fixedCandidate:registration.candidateId,
    registeredGroups:4,actualNativeAttempts:8,
    enginePin:registration.enginePin,
    nativeRootLimit:registration.nativeRootLimit,
    cause:'Same two-seat native owner policy, plus optional Cursed Blast at otherwise Pass',
    status:allMatched?'all-four-physical-deals-matched':
      'INVALID-ONE-OR-MORE-PHYSICAL-DEALS-UNVERIFIED',
    counts:{
      terminalControls:controlNat,terminalTreatments:treatedNat,
      completedPairedOutcomes:pairs.filter(x=>x.bothNativeTerminal).length,
      changedNativeWinners:pairs.filter(x=>x.changedWinner).length,
      nativeErrors:errorCount,
      acceptedCursedBlastRootActions:policyAudit.acceptedAbilityRoots,
      acceptedOwnerTargetReplies:policyAudit.acceptedTargetReplies,
      failedCursedBlastActions:policyAudit.nativeErrors.length,
      competitivelyQualifiedGames:0
    },
    sourceOriginalSixtiesUnchanged:true,
    candidateSixtyUnchanged:true,
    developmentOnly:true,
    caveat:'Unseen physical seeds registered before native dispatch. Real native results remain development-only because two-seat actor competence, paper-effect fidelity and match-clock requirements are unqualified.',
    policyAudit,pairs
  };
}

if(require.main===module){
  const report=run();
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  process.stderr.write('AGENT15_NATIVE_PAIRED_SUMMARY '+JSON.stringify({
    status:report.status,counts:report.counts,
    pairs:report.pairs.map(x=>({id:x.id,matched:x.matchedPhysicalDeal,
      control:x.control.status,treatment:x.treatment.status,
      source:x.control.sourceSeat,candidate:x.control.candidateSeat,
      error:x.treatment.error??x.control.error}))
  })+'\n');
  if(report.status!=='all-four-physical-deals-matched'||
     report.counts.nativeErrors>0)process.exitCode=1;
}
module.exports={VERSION,registered,compact,paired,run};
