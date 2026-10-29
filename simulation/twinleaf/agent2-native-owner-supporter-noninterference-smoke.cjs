'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {runDevelopment}=require('../evaluation/agent41-bilateral-v2-development.cjs');
const {plannedTrials}=require('../evaluation/agent41-prospective-canonical-scout.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json';

/**
 * Bounded historical same-physical-source-deal noninterference gate.
 * The registered 32-arm cohort was previously observed. These 2 arms are
 * retrospective execution fixtures, not fresh strength evidence.
 * @returns {object}
 */
function main(){
  const plan=JSON.parse(fs.readFileSync(path.join(ROOT,REG),'utf8'));
  const trials=plannedTrials(plan).filter(x=>
    x.rank===6&&x.repeat===2&&x.candidateSlot==='A');
  assert.equal(trials.length,2);
  const options={...plan.frozenRunOptions,registeredTrials:trials,
    registeredFrameName:REG};
  const before=runDevelopment(options);
  const after=runDevelopment({...options,
    nativeOwnerSupporterOpportunity:true});
  assert.equal(before.rows.length,2);
  assert.equal(after.rows.length,2);
  const sample=[];
  for(let i=0;i<2;i++){
    const a=before.rows[i],b=after.rows[i];
    assert.equal(a.trial.id,b.trial.id);
    assert.equal(a.status,undefined,'Baseline Store did not complete');
    assert.equal(b.status,undefined,'Audited Store did not complete');
    assert.equal(a.sourceDealFingerprint,b.sourceDealFingerprint);
    assert.equal(a.rootActionLedgerSha256,b.rootActionLedgerSha256,
      'Owner Supporter observer changed native accepted root choices');
    assert.equal(a.finished,b.finished);
    assert.equal(a.winner,b.winner);
    assert.equal(a.actionCount,b.actionCount);
    const audit=b.ownerSupporterOpportunityAudit;
    assert.ok(audit?.observedLiveStore);
    assert.equal(audit.ownerOnly,true);
    assert.equal(audit.decisionsChanged,false);
    assert.ok(audit.counts.firstRoots>0);
    assert.ok(audit.counts.acceptedPasses>0);
    assert.ok(audit.firstRoots.every(row=>row.ownerSeat===0||
      row.ownerSeat===1));
    sample.push({id:b.trial.id,sourceDeal:b.sourceDealFingerprint,
      rootSha:b.rootActionLedgerSha256,
      baselineRootCount:a.actionCount,auditedRootCount:b.actionCount,
      counts:audit.counts,
      roleTotals:[0,1].map(seat=>{
        const root=audit.firstRoots.filter(x=>x.ownerSeat===seat);
        const passes=audit.passes.filter(x=>x.ownerSeat===seat);
        return {role:seat===b.candidateSeat?'candidate':'source',
          seat,firstRoots:root.length,firstRootsWithHeld:root.filter(x=>
            x.heldCount>0).length,
          passRoots:passes.length,passesWithHeld:passes.filter(x=>
            x.heldCount>0).length,
          passesBeyondFirstGlobalWithNativeNullTrue:passes.filter(x=>
            x.nativeNullTrueBeyondFirstGlobalTurn>0).length};
      }),
      nativeAcceptedSupporterRoots:audit.supporterRoots.map(x=>({
        ...x,role:x.seat===b.candidateSeat?'candidate':'source'
      })),
      meaningfulPassExamples:audit.passes.filter(x=>
        x.turn>1&&x.nativeNullTrueCount>0).slice(0,12).map(x=>({
        role:x.ownerSeat===b.candidateSeat?'candidate':'source',
        seat:x.ownerSeat,turn:x.turn,heldCount:x.heldCount,
        quota:x.supporterQuota,lock:x.ownerSupporterLock,
        nativeCanPlayPrintings:x.supporters.filter(s=>
          s.nativeNullCanPlay==='true').map(s=>s.printing)
      })),
      firstOwnerSupporters:audit.firstRoots.map(x=>({
        seat:x.ownerSeat,turn:x.turn,
        held:x.heldCount,nativeNullTrue:x.nativeNullTrueCount
      })).slice(0,16),
      passOwnerSupporters:audit.passes.map(x=>({
        seat:x.ownerSeat,turn:x.turn,
        held:x.heldCount,nativeNullTrue:x.nativeNullTrueCount
      })).slice(0,16)});
  }
  const result={
    schema:'agent2-historical-owner-supporter-native-noninterference-v1',
    registration:REG,exactOriginalSixties:true,
    attempts:2,comparativeStrengthQualified:false,
    paperLegalOpportunityCertified:false,policyCompetenceCertified:false,
    sample
  };
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  return result;
}
if(require.main===module)main();
module.exports={main};
