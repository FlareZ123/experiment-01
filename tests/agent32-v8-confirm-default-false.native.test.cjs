'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const test=require('node:test');
const {runStewardBroaderV8}=require('../simulation/evaluation/agent36-issue25-common-v8.cjs');
const {runIssue25V8WithTelepathAndDefaultConfirmFalse}=require('../simulation/evaluation/agent32-issue25-v8-telepath-confirm-default-false.cjs');
const {writeReceipt}=require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');

function idOf(row){return row.trial?.id??row.id??null;}
function rootsOf(row){return row.rootActionLedger??[];}
function sum(rows,key){return rows.reduce((total,row)=>total+(row[key]??0),0);}

test('same-eight v8 Telepath plus default Confirm false treatment reaches the 128-root cap',()=>{
  const control=runStewardBroaderV8();
  const treatment=runIssue25V8WithTelepathAndDefaultConfirmFalse();
  const controlRaw=control.rawDevelopment?.rows??[];
  const treatmentRaw=treatment.rawDevelopment?.rows??[];
  const controlSummary=new Map(control.diagnostic.actualAttemptRows.map(row=>[row.id,row]));
  const treatmentSummary=new Map(treatment.diagnostic.actualAttemptRows.map(row=>[row.id,row]));
  const controlById=new Map(controlRaw.map(row=>[idOf(row),row]));
  const matchAudits=treatment.diagnostic.nativeOwnerPromptAudit.nativeMatchAttempts;
  const auditFor=id=>matchAudits.find(row=>row.label?.endsWith(id))?.telepath??null;
  const pairs=treatmentRaw.map(row=>{
    const id=idOf(row),before=controlById.get(id);
    const old=controlSummary.get(id),current=treatmentSummary.get(id);
    const match=auditFor(id);
    return {
      id,
      controlStatus:old?.status??null,
      treatmentStatus:current?.status??null,
      sameInitialSourceDeal:!!old?.sourceDealFingerprint&&
        old.sourceDealFingerprint===current?.sourceDealFingerprint,
      sameInitialFullPhysicalDeal:!!old?.fullPhysicalDealFingerprint&&
        old.fullPhysicalDealFingerprint===current?.fullPhysicalDealFingerprint,
      controlRootCount:before?rootsOf(before).length:0,
      treatmentRootCount:rootsOf(row).length,
      exactControlRootPrefix:!!before&&
        rootsOf(row).length>=rootsOf(before).length&&
        JSON.stringify(rootsOf(row).slice(0,rootsOf(before).length))===
          JSON.stringify(rootsOf(before)),
      telepath:match?.telepath??null,
      confirm:match?.confirm??null
    };
  });
  const confirmRows=pairs.map(row=>row.confirm).filter(Boolean);
  const confirmTotals={
    offers:sum(confirmRows,'confirmOffers'),
    submitted:sum(confirmRows,'submitted'),
    accepted:sum(confirmRows,'nativeAccepted'),
    rejected:sum(confirmRows,'nativeRejected'),
    unsettled:sum(confirmRows,'nativeUnsettled'),
    bySeat:{
      0:confirmRows.reduce((n,row)=>n+(row.bySeat?.[0]??0),0),
      1:confirmRows.reduce((n,row)=>n+(row.bySeat?.[1]??0),0)
    },
    byMessage:confirmRows.reduce((out,row)=>{
      for(const [key,value] of Object.entries(row.byMessage??{}))
        out[key]=(out[key]??0)+value;
      return out;
    },{})
  };
  const archiveDir=process.env.ISSUE25_STEWARD_V8_CONFIRM_DIR;
  const archive=archiveDir?{
    control:writeReceipt(control,path.join(archiveDir,'control'),{
      prefix:'issue25-steward-v8',policyEntryPoint:control.manifest.policyEntryPoint
    }),
    treatment:writeReceipt(treatment,path.join(archiveDir,'treatment'),{
      prefix:'issue25-steward-v8',policyEntryPoint:treatment.manifest.policyEntryPoint
    })
  }:null;
  const report={
    schema:'agent32-v8-telepath-plus-default-confirm-false-native-v1',
    registered:control.diagnostic.registered,
    controlAttempts:controlRaw.length,
    treatmentAttempts:treatmentRaw.length,
    sameRegistration:pairs.length===8&&pairs.every(row=>controlById.has(row.id)),
    sameInitialSourceDeals:pairs.every(row=>row.sameInitialSourceDeal),
    sameInitialFullPhysicalDeals:pairs.every(row=>row.sameInitialFullPhysicalDeal),
    exactPriorRootPrefixAllArms:pairs.every(row=>row.exactControlRootPrefix),
    allTreatmentRoots128:pairs.every(row=>row.treatmentRootCount===128),
    nativeMatchCalls:treatment.diagnostic.nativeOwnerPromptAudit.nativeMatchCalls,
    confirmTotals,
    pairs,
    archive,
    competitiveGamesQualified:0,
    releaseQualified:false
  };
  console.log('AGENT32_V8_TELEPATH_CONFIRM_DEFAULT_FALSE_NATIVE',JSON.stringify(report));
  assert.equal(report.controlAttempts,8);
  assert.equal(report.treatmentAttempts,8);
  assert.equal(report.sameRegistration,true);
  assert.equal(report.sameInitialSourceDeals,true);
  assert.equal(report.sameInitialFullPhysicalDeals,true);
  assert.equal(report.exactPriorRootPrefixAllArms,true);
  assert.equal(report.allTreatmentRoots128,true);
  assert.equal(report.nativeMatchCalls,8);
  assert.deepEqual(confirmTotals,{
    offers:3,submitted:3,accepted:3,rejected:0,unsettled:0,
    bySeat:{0:1,1:2},
    byMessage:{WANT_TO_USE_ABILITY:3}
  });
  for(const id of [
    '6:210:B:new-moon-lockbreaker-v1',
    '11:211:A:new-moon-lockbreaker-v1'
  ]){
    const row=pairs.find(pair=>pair.id===id);
    assert.ok(row?.telepath?.matchingOwnerSearches>0);
    assert.equal(row.telepath.settled,row.telepath.matchingOwnerSearches);
    assert.ok(row.telepath.physicallyBenched>0);
    assert.equal(row.telepath.shuffleMissing,0);
    assert.equal(row.telepath.custodyFailures,0);
  }
  for(const id of [
    '1:212:B:champion-reference',
    '3:213:A:champion-reference',
    '3:213:A:new-moon-lockbreaker-v1'
  ]){
    const row=pairs.find(pair=>pair.id===id);
    assert.ok(row?.confirm?.confirmOffers>0);
    assert.equal(row.confirm.nativeAccepted,row.confirm.confirmOffers);
    assert.equal(row.confirm.nativeRejected,0);
    assert.equal(row.confirm.nativeUnsettled,0);
    assert.equal(row.confirm.defaultAnswer,false);
    assert.equal(row.confirm.readsOpponentHidden,false);
    assert.equal(row.confirm.readsDeckCards,false);
  }
  assert.equal(treatment.manifest.releaseQualified,false);
  assert.equal(treatment.diagnostic.competitiveGamesQualified,0);
});
