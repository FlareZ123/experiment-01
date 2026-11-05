'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {createHash}=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {runPublicFlexibleContestIssue25V14,KEY}=
  require('../simulation/evaluation/agent12-issue25-public-flexible-contest-v14.cjs');
const {saveResult}=
  require('../simulation/twinleaf/agent3-rank26-compressor-settlement-prospective-v2.cjs');
const registration=require(
  '../results/aichi-2026/registrations/agent16-issue25-v6-vip-after-pass-same-physical-20261104.json');

const digest=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

test('v14 source-independent coheld Special-vs-Basic option: eight frozen live original Store attempts',()=>{
  assert.equal(registration.referenceAttempts.length,8);
  const prior=process.env[KEY];
  const existed=Object.hasOwn(process.env,KEY);
  const outcome=runPublicFlexibleContestIssue25V14();
  assert.equal(Object.hasOwn(process.env,KEY),existed);
  assert.equal(process.env[KEY],prior);

  const {manifest,diagnostic,rawDevelopment}=outcome;
  const baseline=new Map(registration.referenceAttempts
    .map(item=>[item.id,item]));
  const nativeRows=rawDevelopment?.rows??[];
  const byId=new Map(nativeRows.map(row=>
    [row.trial?.id??row.id,row]));
  const attempted=diagnostic.attemptedRows??[];
  const receipts=attempted.map(status=>{
    const original=baseline.get(status.id);
    const native=byId.get(status.id);
    const ledger=native?.rootActionLedger??
      native?.nativePublicRootArchive?.rootActionLedger??
      native?.nativeAbortEvidence?.rootActionLedger??null;
    const actor=native?.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
    const sourceSeat=status.originalSourceSeat??
      status.nativeAbortProvenance?.sourceSeat??null;
    const sourceActions=Array.isArray(ledger)&&sourceSeat!==null?
      ledger.filter(event=>event.playerSlot===sourceSeat).map(event=>({
        actionOrdinal:event.actionOrdinal,
        turnBefore:event.turnBefore,
        action:event.action,
        card:event.card??null,
        attack:event.attack??null
      })):null;
    const sourceAttackRoots=sourceActions?.filter(event=>
      event.action==='AttackAction')??null;
    const originalSpecialEnergyRoots=sourceActions?.filter(event=>
      event.action==='PlayCardAction'&&
      /Energy$/.test(event.card??''))??null;
    return {
      id:status.id,sourceSeat,
      candidateSeat:status.candidateSeat??null,
      nativeStatus:status.status,
      rootActionCount:status.nativeRootActionCount,
      actualStarterSeat:status.actualStarterSeat,
      sourceDealFingerprint:status.sourceDealFingerprint,
      fullPhysicalDealFingerprint:status.fullPhysicalDealFingerprint,
      baselineV6SourceFingerprint:original?.sourceDealFingerprint??null,
      baselineV6FullFingerprint:original?.fullPhysicalDealFingerprint??null,
      sourceDealMatchesBaseline:
        original?.sourceDealFingerprint===status.sourceDealFingerprint,
      fullPhysicalMatchesBaseline:
        original?.fullPhysicalDealFingerprint===status.fullPhysicalDealFingerprint,
      nativeRootLedgerSha256:Array.isArray(ledger)?digest(ledger):null,
      actorPublicSpecialFlag:actor?.publicContextSpecialEnergyOptIn??null,
      actorContestFlag:actor?.publicFlexibleEnergyContestOptIn??null,
      actorRootAudit:actor?{
        version:actor.version??null,
        actionsSelected:actor.actionsSelected??null
      }:null,
      sourceActions,sourceAttackRoots,originalSpecialEnergyRoots,
      abort:native?.nativeAbortEvidence?{
        failureStage:native.nativeAbortEvidence.failureStage??null,
        actionOrdinal:native.nativeAbortEvidence.actionOrdinal??null,
        actingSeat:native.nativeAbortEvidence.actingSeat??null,
        pendingPrompt:native.nativeAbortEvidence.pendingPrompt??null
      }:null,
      finished:status.finished===true,
      competitiveGameQualified:false
    };
  });
  const result={
    schema:'agent12-issue25-v14-public-flexible-contest-eight-native-v1',
    sourceBaseline:'agent12-issue25-v13 eight frozen original-source attempts (CI 41934656653); original v6 deal hashes',
    comparisonCausalScope:'same frozen seeds, printed original and candidate 60s; compare actual pre-treatment physical deals before paired interpretation',
    selectedOwnerPublicContest:manifest.bothSeatOwnerPublicFlexibleContestSelected,
    contestRootAudits:diagnostic.actorContestSelectedRows,
    actorPublicEnergyOriginalProfile:
      diagnostic.nativeBothSeatPublicSpecialProfileRows??null,
    observedTwinleafCommit:manifest.observedTwinleafGitCommit,
    observedRepositoryCommit:manifest.observedRepositoryGitCommit,
    manifestHashes:manifest.resolvedSourceAndPolicyHashes,
    registeredAttemptExactUniqueMatch:
      diagnostic.registeredAttemptReconciliation?.exactUniqueMatch===true,
    registeredTrials:registration.referenceAttempts.length,
    originalSourceDealMatches:receipts.filter(x=>x.sourceDealMatchesBaseline).length,
    fullPhysicalDealMatches:receipts.filter(x=>x.fullPhysicalMatchesBaseline).length,
    errors:receipts.filter(x=>x.nativeStatus==='engine-error').length,
    actionCaps:receipts.filter(x=>x.rootActionCount===48&&!x.finished).length,
    sourceSelectedAttackRoots:receipts.reduce((n,row)=>
      n+(row.sourceAttackRoots?.length??0),0),
    sourceSelectedEnergyRoots:receipts.reduce((n,row)=>
      n+(row.originalSpecialEnergyRoots?.length??0),0),
    terminals:receipts.filter(x=>x.finished).length,
    competitivelyQualifiedGames:0,
    rows:receipts
  };
  const target=process.env.AGENT12_ISSUE25_V14_RECEIPT;
  if(target){
    fs.mkdirSync(path.dirname(target),{recursive:true});
    saveResult(target,result);
  }
  console.log('AGENT12_ISSUE25_V14',JSON.stringify({
    attempts:receipts.length,matchedFullInitialDeals:result.fullPhysicalDealMatches,
    flaggedContestProfiles:result.contestRootAudits,
    sourceAttackRoots:result.sourceSelectedAttackRoots,
    sourceEnergyRoots:result.sourceSelectedEnergyRoots,
    errors:result.errors,caps:result.actionCaps,
    competitiveGames:0
  }));
  console.log('AGENT12_ISSUE25_V14_ROWS',JSON.stringify(receipts.map(x=>({
    id:x.id,sourceSeat:x.sourceSeat,status:x.nativeStatus,
    roots:x.rootActionCount,contest:x.actorContestFlag,
    sourceAttacks:x.sourceAttackRoots?.length??null,
    energy:x.originalSpecialEnergyRoots?.length??null
  }))));
  assert.equal(receipts.length,8);
  assert.equal(byId.size,8);
  assert.equal(result.registeredAttemptExactUniqueMatch,true);
  assert.equal(manifest.actualRunnerConfirmedOption,true);
  assert.equal(result.originalSourceDealMatches,8);
  assert.equal(result.fullPhysicalDealMatches,8);
  assert.ok(result.contestRootAudits>0,
    'A genuine native canonical owner root policy must install the contest');
  assert.equal(manifest.releaseQualified,false);
  assert.equal(result.competitivelyQualifiedGames,0);
});
