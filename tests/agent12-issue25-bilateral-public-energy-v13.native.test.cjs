'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {createHash}=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {runBilateralPublicEnergyIssue25V13}=
  require('../simulation/evaluation/agent12-issue25-bilateral-public-energy-v13.cjs');
const {saveResult}=
  require('../simulation/twinleaf/agent3-rank26-compressor-settlement-prospective-v2.cjs');
const registration=require(
  '../results/aichi-2026/registrations/agent16-issue25-v6-vip-after-pass-same-physical-20261104.json');

const digest=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

test('v13 owner-public Special Energy both-seat native source canary against eight unchanged real v6 seeds',()=>{
  assert.equal(registration.referenceAttempts.length,8);
  const outcome=runBilateralPublicEnergyIssue25V13();
  const {manifest,diagnostic,rawDevelopment}=outcome;
  const reference=new Map(registration.referenceAttempts
    .map(item=>[item.id,item]));
  const raw=rawDevelopment?.rows??[];
  const byId=new Map(raw.map(row=>[row.trial?.id??row.id,row]));
  const receipt=diagnostic.attemptedRows.map(status=>{
    const ref=reference.get(status.id);
    const native=byId.get(status.id);
    const roots=native?.rootActionLedger??
      native?.nativePublicRootArchive?.rootActionLedger??
      native?.nativeAbortEvidence?.rootActionLedger??null;
    const root=native?.actorOnlyDecisionCoverage?.detailedComponentAudits?.root??null;
    return {
      id:status.id,
      sourceSeat:status.originalSourceSeat??
        status.nativeAbortProvenance?.sourceSeat??null,
      sourceDealFingerprint:status.sourceDealFingerprint,
      fullPhysicalDealFingerprint:status.fullPhysicalDealFingerprint,
      referenceSourceDealFingerprint:ref?.sourceDealFingerprint??null,
      referenceFullPhysicalDealFingerprint:ref?.fullPhysicalDealFingerprint??null,
      sourceDealMatchedReference:
        ref?.sourceDealFingerprint===status.sourceDealFingerprint,
      fullPhysicalMatchedReference:
        ref?.fullPhysicalDealFingerprint===status.fullPhysicalDealFingerprint,
      actualStarterSeat:status.actualStarterSeat,
      nativeStatus:status.status,
      rootActionCount:status.nativeRootActionCount,
      rootLedgerHash:Array.isArray(roots)?digest(roots):null,
      actorPublicSpecialFlag:root?.publicContextSpecialEnergyOptIn??null,
      nativeTwoSeatPublicSpecialProfile:
        native?.bilateralPublicContextSpecialProfile??null,
      diagnostic:diagnostic.publicSpecialSourceEvidence.find(row=>
        row.id===status.id)??null,
      finished:status.finished===true,
      competitiveGamesQualified:0
    };
  });
  const data={
    schema:'agent12-issue25-v13-symmetric-context-energy-eight-native-v1',
    baselineReference:'archived-v6-original-eighthands-and-v11-canonical-vip',
    useExistingActor17PublicContextSpecialEnergy:true,
    sourceIndependentCommonPolicy:manifest.actualRunnerConfirmedOption===true,
    canonicalOwnerVipSelected:manifest.selectedInnerCanonicalOwnerVip===true,
    candidateAndOriginalSixtiesUnchanged:true,
    nativeRootBudget:manifest.nativeRootActionLimit,
    observedTwinleafCommit:manifest.observedTwinleafGitCommit,
    observedRepositoryCommit:manifest.observedRepositoryGitCommit,
    v13NativeBothSeatProfileRows:diagnostic.nativeBothSeatPublicSpecialProfileRows,
    v13SourceEnergyRootCount:diagnostic.acceptedSourceEnergyRootsObserved,
    v13SourceAttackRootCount:diagnostic.sourceAttackRootsObserved,
    physicalSourceDealMatches:receipt.filter(row=>row.sourceDealMatchedReference).length,
    fullPhysicalDealMatches:receipt.filter(row=>row.fullPhysicalMatchedReference).length,
    returnedAllRegistered:diagnostic.registeredAttemptReconciliation?.exactUniqueMatch===true,
    allAttempts:receipt.length,
    uncappedTerminals:receipt.filter(row=>row.finished===true).length,
    errors:receipt.filter(row=>row.nativeStatus==='engine-error').length,
    competitivelyQualifiedGames:0,
    rows:receipt
  };
  const filename=process.env.AGENT12_ISSUE25_V13_RECEIPT;
  if(filename){
    fs.mkdirSync(path.dirname(filename),{recursive:true});
    saveResult(filename,data);
  }
  console.log('AGENT12_ISSUE25_V13',JSON.stringify({
    trials:receipt.length,physicalMatches:data.fullPhysicalDealMatches,
    publicSpecialProfiles:data.v13NativeBothSeatProfileRows,
    sourceEnergyRoots:data.v13SourceEnergyRootCount,
    sourceAttackRoots:data.v13SourceAttackRootCount,
    errors:data.errors,terminals:data.uncappedTerminals,
    competitiveGames:0
  }));
  assert.equal(receipt.length,8);
  assert.equal(byId.size,8);
  assert.equal(data.returnedAllRegistered,true);
  assert.equal(data.sourceIndependentCommonPolicy,true);
  assert.equal(data.canonicalOwnerVipSelected,true);
  assert.equal(manifest.selectedBothSeatPublicSpecialEnergy,true);
  assert.equal(manifest.releaseQualified,false);
  assert.equal(data.fullPhysicalDealMatches,8);
  assert.ok(data.v13NativeBothSeatProfileRows>0,
    'Real canonical owner policy must install the public Special Energy model');
  assert.equal(data.competitivelyQualifiedGames,0);
});
