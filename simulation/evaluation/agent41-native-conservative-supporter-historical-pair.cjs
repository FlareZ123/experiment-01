'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {plannedTrials,REGISTRATION_BLOB}=
  require('./agent41-prospective-canonical-scout.cjs');
const {withNativeLillieDrawSettlementAudit}=
  require('../twinleaf/agent24-native-lillie-settlement-audit.cjs');

const VERSION='agent41-historical-two-seat-conservative-shuffle-v1';
const ROOT=path.resolve(__dirname,'../..');
const MANIFEST='results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json';
const ENGINE='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/** Retrospective frozen positive-control seeds. Do not use as fresh evidence. */
function selectedTrials(){
  const bytes=fs.readFileSync(path.join(ROOT,MANIFEST));
  assert.equal(gitBlobHash(bytes),REGISTRATION_BLOB);
  const manifest=JSON.parse(bytes.toString('utf8'));
  assert.equal(manifest.enginePin,ENGINE);
  const trials=plannedTrials(manifest).filter(t=>t.rank===11&&
    t.candidateId==='champion-reference'&&
    ((t.repeat===2&&t.candidateSlot==='A')||
     (t.repeat===1&&t.candidateSlot==='B')));
  assert.deepEqual(trials.map(t=>[t.id,t.seed]),[
    ['11:2:A:champion-reference',340754762],
    ['11:1:B:champion-reference',3403930699]
  ]);
  return {manifest,trials};
}

/** Genuine postgame native row status. Includes all aborts and caps. */
function compact(row){
  const root=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
  return {
    id:row.trial.id,seed:row.trial.seed,status:row.status??(
      row.finished===true?'engine-terminal':'root-capped'),
    finished:row.finished===true,winner:row.finished===true?
      row.winner??null:null,error:row.error??null,
    actualStarter:row.actualStarterSeat??null,
    firstTurnVerified:row.verifiedFirstTurn===true,
    fullDeal:row.fullPhysicalDealFingerprint??null,
    sourceDeal:row.sourceDealFingerprint??null,
    rootSha:row.rootActionLedgerSha256??null,
    nativeRootAttestation:row.nativeAcceptedTargetSidecar?.observedLiveStore??null,
    physicalQualification:row.physicalZoneQualification?.status??null,
    actorRootIntentCounts:root?.typedIntentCounts??null,
    sourceAttacks:row.attackDeclarations?.source??null,
    candidateAttacks:row.attackDeclarations?.candidate??null,
    competitivelyQualified:false
  };
}

/** Strict same-initial-deal comparison, without relabeling engine terminals. */
function compareAttempts(before,after){
  assert.equal(before.rows.length,2);
  assert.equal(after.rows.length,2);
  const failures=[],rows=[];
  for(let i=0;i<2;i++){
    const a=compact(before.rows[i]),b=compact(after.rows[i]);
    if(a.id!==b.id||a.seed!==b.seed)
      failures.push('trial-identity-mismatch:'+i);
    if(!a.fullDeal||a.fullDeal!==b.fullDeal||
       !a.sourceDeal||a.sourceDeal!==b.sourceDeal)
      failures.push('initial-physical-deal-mismatch:'+a.id);
    if(!a.firstTurnVerified||!b.firstTurnVerified||
       a.actualStarter!==b.actualStarter)
      failures.push('native-first-player-mismatch:'+a.id);
    rows.push({id:a.id,sameInitialPhysicalDeal:
      a.fullDeal!==null&&a.fullDeal===b.fullDeal&&
      a.sourceDeal!==null&&a.sourceDeal===b.sourceDeal,
      baseline:a,treatment:b});
  }
  return {rows,failures,allMatched:failures.length===0};
}

/**
 * Replay two previously observed native Lillie source deals with a single
 * conservative owner-only Supporter root switch applied symmetrically to
 * physical player seats 0 and 1. This is a retrospective mechanism check.
 * @param {{runDevelopment?:(options:object)=>object,
 *   settlementAudit?:(execute:()=>object)=>{result:object,audit:object}}} deps
 */
function run(deps={}){
  const {manifest,trials}=selectedTrials();
  const runDevelopment=deps.runDevelopment??
    require('./agent41-bilateral-v2-development.cjs').runDevelopment;
  const settle=deps.settlementAudit??withNativeLillieDrawSettlementAudit;
  const core={...manifest.frozenRunOptions,
    registeredTrials:trials,
    registeredFrameName:VERSION+':historical-selected-lillie-deals',
    physicalZoneGate:true,nativeSetupCoinChoiceReceipt:true};
  assert.equal(core.actorOnlyComposition,true);
  assert.equal(core.paperSupporterQuota,true);
  const before=settle(()=>runDevelopment({
    ...core,bilateralConservativeShuffleRoot:false
  }));
  const after=settle(()=>runDevelopment({
    ...core,bilateralConservativeShuffleRoot:true
  }));
  const match=compareAttempts(before.result,after.result);
  return {schema:VERSION,manifestGitBlob:REGISTRATION_BLOB,
    enginePin:ENGINE,originalSelectedSeeds:trials.map(t=>({
      id:t.id,seed:t.seed})),oldObservedPositiveDeals:true,
    nativeAttempts:before.result.attempted+after.result.attempted,
    nativeAttemptCountVerified:before.result.attempted===2&&
      after.result.attempted===2,
    symmetricTwoSeatRoot:true,oneFactor:'bilateralConservativeShuffleRoot',
    matching:match,nativeLillieSettlement:{
      control:before.audit,treatment:after.audit},
    control:before.result,treatment:after.result,
    competitivelyQualifiedGames:0,winRateCertified:false,
    caveat:'Two rank-11 original-source champion-reference physical deals chosen after seeing prior Lillie positives. Historical regression only; no fresh matchup success inference, universal paper prompts, strong opponent bot or timed Aichi play.'};
}

if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.nativeAttemptCountVerified||!result.matching.allMatched)
    process.exitCode=1;
}

module.exports={VERSION,MANIFEST,ENGINE,selectedTrials,
  compact,compareAttempts,run};
