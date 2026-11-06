'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const test=require('node:test');
const {runStewardBroaderV8}=require('../simulation/evaluation/agent36-issue25-common-v8.cjs');
const {runIssue25V8WithTelepathAndDefaultConfirmFalse}=require('../simulation/evaluation/agent32-issue25-v8-telepath-confirm-default-false.cjs');
const {writeReceipt}=require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');

function idOf(row){return row.trial?.id??row.id??null;}
function rootsOf(row){
  const direct=row.rootActionLedger;
  const archived=row.nativePublicRootArchive?.rootActionLedger;
  const aborted=row.nativeAbortEvidence?.rootActionLedger;
  if(Array.isArray(direct)&&direct.length>0)return direct;
  if(Array.isArray(archived))return archived;
  if(Array.isArray(aborted))return aborted;
  return Array.isArray(direct)?direct:[];
}
function sum(rows,key){return rows.reduce((total,row)=>total+(row[key]??0),0);}

function preservePublicTerminalFields(execution){
  const rawById=new Map((execution.rawDevelopment?.rows??[])
    .map(row=>[idOf(row),row]));
  execution.diagnostic.attemptedRows=
    (execution.diagnostic.attemptedRows??[]).map(status=>{
      const raw=rawById.get(status.id);
      if(!raw)return status;
      const direct=raw.rootActionLedger;
      const archived=raw.nativePublicRootArchive?.rootActionLedger;
      const aborted=raw.nativeAbortEvidence?.rootActionLedger;
      const observed=Array.isArray(direct)&&direct.length>0?direct:
        Array.isArray(archived)?archived:
        Array.isArray(aborted)?aborted:Array.isArray(direct)?direct:null;
      const nativeRootActionCount=raw.rootActionCount??
        (Array.isArray(observed)?observed.length:
          status.nativeRootActionCount??null);
      const nativeOutcome=status.status==='engine-error'||
        raw.nativeAbortProvenance?.aborted===true||
        raw.nativeAbortEvidence?.aborted===true||
        raw.error!==undefined&&raw.error!==null?'engine-error':
        raw.finished===true?'native-terminal':
        raw.finished===false&&raw.actionCount===128&&
          nativeRootActionCount===128?'action-cap':'returned-unqualified';
      return {
        ...status,
        status:nativeOutcome==='native-terminal'?
          'native-terminal-unqualified':
          nativeOutcome==='action-cap'?'root-cap-unqualified':status.status,
        nativeOutcome,
        actionCount:raw.actionCount??null,
        finished:raw.finished??status.finished??null,
        winner:raw.winner??null,
        endReason:raw.endReason??null,
        finalPrizes:raw.finalPrizes??null,
        finalBoard:raw.finalBoard??null,
        candidateAttackSettlement:raw.candidateAttackSettlement??null,
        settledPublicAttackCount:raw.settledPublicAttackCount??null,
        attackDeclarations:raw.attackDeclarations??null,
        firstSettledPublicAttack:raw.firstSettledPublicAttack??null,
        nativeRootActionCount,
        terminalWinnerMatchesCandidate:raw.finished===true&&
          raw.winner===(raw.candidateSeat??status.candidateSeat)
      };
    });
}

test('same-eight v8 Telepath plus default Confirm false preserves terminal-or-cap outcomes',()=>{
  const control=runStewardBroaderV8();
  const treatment=runIssue25V8WithTelepathAndDefaultConfirmFalse();
  const controlRaw=control.rawDevelopment?.rows??[];
  const treatmentRaw=treatment.rawDevelopment?.rows??[];
  preservePublicTerminalFields(control);
  preservePublicTerminalFields(treatment);
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
      candidateSeat:current?.candidateSeat??row.candidateSeat??null,
      treatmentNativeOutcome:current?.nativeOutcome??null,
      treatmentFinished:current?.finished??null,
      treatmentWinner:current?.winner??null,
      treatmentEndReason:current?.endReason??null,
      treatmentActionCount:current?.actionCount??null,
      treatmentFinalPrizes:current?.finalPrizes??null,
      treatmentFinalBoard:current?.finalBoard??null,
      treatmentTerminalWinnerMatchesCandidate:
        current?.terminalWinnerMatchesCandidate??false,
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
    nativeTerminalCount:pairs.filter(row=>
      row.treatmentNativeOutcome==='native-terminal').length,
    rootCapCount:pairs.filter(row=>
      row.treatmentNativeOutcome==='action-cap').length,
    allTreatmentOutcomesTerminalOrCap:pairs.length===8&&pairs.every(row=>
      row.treatmentNativeOutcome==='native-terminal'||
      row.treatmentNativeOutcome==='action-cap'),
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
  assert.equal(report.allTreatmentOutcomesTerminalOrCap,true);
  assert.equal(report.nativeTerminalCount,1);
  assert.equal(report.rootCapCount,7);
  const terminal=pairs.find(row=>
    row.treatmentNativeOutcome==='native-terminal');
  assert.ok(terminal);
  assert.equal(terminal.id,'1:212:B:champion-reference');
  assert.equal(terminal.treatmentRootCount,110);
  assert.equal(terminal.treatmentActionCount,110);
  assert.equal(terminal.treatmentFinished,true);
  assert.equal(terminal.treatmentWinner,terminal.candidateSeat);
  assert.equal(terminal.treatmentTerminalWinnerMatchesCandidate,true);
  assert.ok(terminal.treatmentEndReason);
  assert.equal(terminal.candidateAttackSettlement?.candidateSeat,
    terminal.candidateSeat);
  assert.equal(terminal.candidateAttackSettlement?.declarations,4);
  assert.equal(terminal.candidateAttackSettlement?.attacks?.length,4);
  assert.equal(terminal.candidateAttackSettlement?.qualifiedForCompetitiveInference,
    false);
  assert.equal(report.nativeMatchCalls,8);
  assert.equal(treatment.manifest.nativeOwnerPromptAudit.nativeMatchCalls,8);
  assert.deepEqual(treatment.manifest.nativeOwnerPromptAudit,
    treatment.diagnostic.nativeOwnerPromptAudit);
  assert.ok(confirmTotals.offers>=3);
  assert.equal(confirmTotals.submitted,confirmTotals.offers);
  assert.equal(confirmTotals.accepted,confirmTotals.offers);
  assert.equal(confirmTotals.rejected,0);
  assert.equal(confirmTotals.unsettled,0);
  assert.ok(confirmTotals.bySeat[0]>=1);
  assert.ok(confirmTotals.bySeat[1]>=2);
  assert.ok(confirmTotals.byMessage.WANT_TO_USE_ABILITY>=3);
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
