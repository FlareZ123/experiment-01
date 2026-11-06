'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const test=require('node:test');
const {runStewardBroaderV8}=require('../simulation/evaluation/agent36-issue25-common-v8.cjs');
const {runIssue25V8WithTelepath}=require('../simulation/evaluation/agent32-issue25-v8-telepath-development.cjs');
const {writeReceipt}=require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');

function idOf(row){return row.trial?.id??row.id??null;}
function rootsOf(row){return row.rootActionLedger??[];}

test('retrospective same-eight v8 Telepath treatment preserves deals and prior native roots',()=>{
  const control=runStewardBroaderV8();
  const treatment=runIssue25V8WithTelepath();
  const controlRaw=control.rawDevelopment?.rows??[];
  const treatmentRaw=treatment.rawDevelopment?.rows??[];
  const controlSummary=new Map(control.diagnostic.actualAttemptRows.map(row=>[row.id,row]));
  const treatmentSummary=new Map(treatment.diagnostic.actualAttemptRows.map(row=>[row.id,row]));
  const controlById=new Map(controlRaw.map(row=>[idOf(row),row]));
  const telepathAttempts=treatment.diagnostic.nativeOwnerTelepathicAudit.nativeMatchAttempts;
  const telepathFor=id=>telepathAttempts.find(row=>row.label?.endsWith(id))?.telepath??null;
  const pairs=treatmentRaw.map(row=>{
    const id=idOf(row);
    const before=controlById.get(id);
    const controlRoots=before?rootsOf(before):[];
    const treatmentRoots=rootsOf(row);
    const old=controlSummary.get(id);
    const current=treatmentSummary.get(id);
    return {
      id,
      controlStatus:old?.status??null,
      treatmentStatus:current?.status??null,
      sameInitialSourceDeal:!!old?.sourceDealFingerprint&&
        old.sourceDealFingerprint===current?.sourceDealFingerprint,
      sameInitialFullPhysicalDeal:!!old?.fullPhysicalDealFingerprint&&
        old.fullPhysicalDealFingerprint===current?.fullPhysicalDealFingerprint,
      controlRootCount:controlRoots.length,
      treatmentRootCount:treatmentRoots.length,
      exactControlRootPrefix:treatmentRoots.length>=controlRoots.length&&
        JSON.stringify(treatmentRoots.slice(0,controlRoots.length))===
          JSON.stringify(controlRoots),
      telepath:telepathFor(id)
    };
  });
  const archiveDir=process.env.ISSUE25_STEWARD_V8_TELEPATH_DIR;
  const archive=archiveDir?{
    control:writeReceipt(control,path.join(archiveDir,'control'),{
      prefix:'issue25-steward-v8',
      policyEntryPoint:control.manifest.policyEntryPoint
    }),
    treatment:writeReceipt(treatment,path.join(archiveDir,'treatment'),{
      prefix:'issue25-steward-v8',
      policyEntryPoint:treatment.manifest.policyEntryPoint
    })
  }:null;
  const report={
    schema:'agent32-issue25-v8-telepath-retrospective-eight-native-v1',
    controlPolicy:control.manifest.version,
    treatmentPolicy:treatment.manifest.version,
    registered:control.diagnostic.registered,
    controlAttempts:controlRaw.length,
    treatmentAttempts:treatmentRaw.length,
    exactSameRegistration:pairs.length===8&&
      pairs.every(row=>controlById.has(row.id)),
    sameInitialSourceDeals:pairs.every(row=>row.sameInitialSourceDeal),
    sameInitialFullPhysicalDeals:pairs.every(row=>row.sameInitialFullPhysicalDeal),
    exactPriorRootPrefixAllArms:pairs.every(row=>row.exactControlRootPrefix),
    telepathNativeMatchCalls:
      treatment.diagnostic.nativeOwnerTelepathicAudit.nativeMatchCalls,
    telepathNativeMatchAttempts:telepathAttempts,
    pairs,
    lockedOriginalArchives:archive,
    paperGamesQualified:0,
    fieldWinRate:null,
    releaseQualified:false
  };
  console.log('AGENT32_ISSUE25_V8_TELEPATH_NATIVE',JSON.stringify(report));
  assert.equal(report.controlAttempts,8);
  assert.equal(report.treatmentAttempts,8);
  assert.equal(report.exactSameRegistration,true);
  assert.equal(report.sameInitialSourceDeals,true);
  assert.equal(report.sameInitialFullPhysicalDeals,true);
  assert.equal(report.exactPriorRootPrefixAllArms,true);
  assert.equal(report.telepathNativeMatchCalls,8);
  assert.equal(treatment.manifest.nativeOwnerTelepathicAudit.nativeMatchCalls,8);
  assert.deepEqual(treatment.manifest.nativeOwnerTelepathicAudit,
    treatment.diagnostic.nativeOwnerTelepathicAudit);
  assert.equal(treatment.manifest.releaseQualified,false);
  assert.equal(treatment.diagnostic.competitiveGamesQualified,0);
  for(const id of [
    '6:210:B:new-moon-lockbreaker-v1',
    '11:211:A:new-moon-lockbreaker-v1'
  ]){
    const pair=pairs.find(row=>row.id===id);
    assert.ok(pair,'Missing registered Telepath-shaped v8 arm '+id);
    assert.ok(pair.telepath?.matchingOwnerSearches>0,
      'The exact owner-deck Telepath prompt was not observed in '+id);
    assert.equal(pair.telepath.settled,pair.telepath.matchingOwnerSearches);
    assert.ok(pair.telepath.physicallyBenched>0);
    assert.equal(pair.telepath.shuffleMissing,0);
    assert.equal(pair.telepath.custodyFailures,0);
    assert.ok(pair.treatmentRootCount>pair.controlRootCount);
  }
});
