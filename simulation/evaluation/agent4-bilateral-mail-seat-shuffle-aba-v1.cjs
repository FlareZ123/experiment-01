'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {run:runMailABA}=
  require('./agent4-bilateral-mail-original-eight-aba-v1.cjs');
const {writeAtomicLocked}=
  require('./agent20-frozen-rank6-canary-v1.cjs');
const REG=require('../../results/aichi-2026/registrations/agent4-bilateral-mail-seat-shuffle-aba-v1-20261105.json');

const VERSION='agent4-bilateral-mail-per-seat-physical-shuffle-ABA-v1';
const RNG_PROTOCOL='per-seat-physical-shuffle-only-prng-v1';

/**
 * Install one request-level, reversible physical-shuffle protocol outside all
 * innermost owner prompt layers. This reaches the actual headless.runMatch
 * even when the selected v5 and Mail layers each replace that export.
 *
 * @template T
 * @param {()=>T} next Complete synchronous A/B/A.
 * @param {{headless:{runMatch:Function},trialIds:string[]}} deps
 * @returns {{result:T,audit:object}}
 */
function withSeatPhysicalShuffleProtocol(next,deps){
  assert.equal(typeof next,'function');
  const {headless,trialIds}=deps;
  const original=headless.runMatch;
  assert.equal(typeof original,'function');
  assert.equal(new Set(trialIds).size,8);
  const records=[];
  function runIsolated(request){
    assert.ok(request&&typeof request==='object');
    const id=trialIds.find(value=>
      typeof request.label==='string'&&request.label.endsWith(value));
    assert.ok(id,'Unregistered native match cannot be included in RNG A/B/A');
    const index=records.length,phase=Math.floor(index/8);
    const record={
      id,phase:['A-control','B-mail','A-repeat'][phase]??'extra',
      ordinal:index,originalRequestedPhysicalIsolation:
        request.isolatePhysicalShuffleRandomness===true,
      appliedPhysicalIsolation:true,
      appliedPolicyIsolation:request.isolatePolicyRandomness===true,
      nativeDisposition:'pending',nativeRandomnessProtocol:null
    };
    records.push(record);
    const prepared={...request,isolatePhysicalShuffleRandomness:true};
    try{
      const result=original(prepared);
      record.nativeDisposition='returned';
      record.nativeRandomnessProtocol=result?.randomnessProtocol??null;
      record.nativeConfirmsIsolation=
        result?.physicalShuffleRandomIsolation===true;
      return result;
    }catch(error){
      record.nativeDisposition='engine-error';
      record.nativeErrorCode=error?.code??null;
      throw error;
    }
  }
  headless.runMatch=runIsolated;
  try{
    const result=next();
    const expected=trialIds.flatMap(()=>[]);
    const exact24=records.length===24&&records.every((row,index)=>
      row.id===trialIds[index%8]&&row.phase===
        ['A-control','B-mail','A-repeat'][Math.floor(index/8)]);
    return {result,audit:{
      version:VERSION,randomnessProtocol:RNG_PROTOCOL,
      actualNativeRequests:records.length,all24ExactRegisteredOrder:exact24,
      everyRequestIsolationApplied:records.every(row=>row.appliedPhysicalIsolation),
      nativeReturnedProtocolChecks:records.filter(row=>
        row.nativeDisposition==='returned').length,
      nativeReturnedProtocolMatches:records.filter(row=>
        row.nativeDisposition==='returned'&&
        row.nativeRandomnessProtocol===RNG_PROTOCOL&&
        row.nativeConfirmsIsolation===true).length,
      records,qualifiedGames:0
    }};
  }finally{
    assert.strictEqual(headless.runMatch,runIsolated,
      'A nested native hook failed to restore prior headless match wrapper');
    headless.runMatch=original;
  }
}

/** @param {object[]} roots @param {number} seat @param {number} turn */
function publicTurnRoots(roots,seat,turn){
  return roots.filter(root=>root.seat===seat&&root.turn===turn&&
    root.pendingPrompt===null).map(root=>({
      ordinal:root.ordinal,action:root.action,card:root.card,
      attack:root.attack
    }));
}

/**
 * All eight frozen original rank6/11 v5 arms, A/B/A, with the identical
 * per-seat physical-shuffle protocol on both control and Mail treatment.
 * @param {{headless?:object,mailABA?:Function,protocol?:Function}} [deps]
 */
function run(deps={}){
  const headless=deps.headless??require('../twinleaf/headless.cjs');
  const layer=deps.protocol??withSeatPhysicalShuffleProtocol;
  const experiment=layer(()=>(deps.mailABA??runMailABA)({headless}),{
    headless,trialIds:REG.seededOriginalTrialIds
  });
  const comparison=experiment.result,audit=experiment.audit;
  const rank6=comparison.panel.filter(row=>
    row.id.startsWith('6:100:A:'));
  const candidateTurn4=rank6.map(row=>{
    const change=row.changeAudit;
    return {id:row.id,sourceSeat:row.sourceSeat,candidateSeat:0,
      physicallyMatchedStart:row.fullOpeningParity&&row.sourceOpeningParity,
      firstNativeRootDivergence:row.firstTreatedRootDivergence,
      control:change?publicTurnRoots(change.baselinePublicRootTape,0,4):null,
      mailTreatment:change?publicTurnRoots(change.treatedPublicRootTape,0,4):null,
      censoredIfNoTurn:!change
    };
  });
  const returned=audit.records.filter(row=>row.nativeDisposition==='returned');
  const gates={
    all24RequestFlags:audit.actualNativeRequests===24&&
      audit.everyRequestIsolationApplied,
    exactAbaRequestOrder:audit.all24ExactRegisteredOrder,
    allReturnedNativeConfirmsProtocol:
      audit.nativeReturnedProtocolMatches===returned.length,
    samePhysicalInitialOpenings:comparison.sameAllPhysicalOpenings===true,
    ARepeatRootTapes:comparison.ARepeatFullyDeterministic===true
  };
  return {schema:VERSION,preregistration:REG.schema,
    selectedParentPolicy:REG.selectedCommonPolicy,
    pinnedTwinleaf:REG.pinnedTwinleaf,
    nativeRootCap:REG.nativeRootCap,
    fieldScope:REG.seededOriginalTrialIds,
    gates,
    actualNativeShuffleRequestAudit:audit,
    originalEightAba:comparison,
    focusCandidateTurn4: candidateTurn4,
    unisolatedEarlierRun:42095285003,
    preregisteredNewRngProtocol:RNG_PROTOCOL,
    perSeatShuffleOnly:true,
    coinsAndOtherRandomEffectsRemainShared:true,
    competitiveGamesQualified:0,winRate:null,
    paperGameConclusion:'FAIL-development-only'
  };
}

if(require.main===module){
  const file=process.env.AGENT4_SEAT_SHUFFLE_MAIL_ABA_OUTPUT;
  assert.ok(file,'Require atomic native output filename');
  const record=run();
  const body=JSON.stringify(record,null,2)+'\n';
  fs.mkdirSync(path.dirname(file),{recursive:true});
  writeAtomicLocked(file,body);
  writeAtomicLocked(file+'.sha256',
    createHash('sha256').update(body).digest('hex')+'  '+
    path.basename(file)+'\n');
  process.stdout.write('AGENT4_MAIL_SEAT_SHUFFLE_ABA '+JSON.stringify({
    gates:record.gates,
    sourceMail:record.originalEightAba.bilateralMailAudit.actualMailItemRootsBySeat,
    nativeStatuses:record.originalEightAba.panel.map(x=>[x.id,x.treatmentDisposition]),
    rank6CandidateTurn4:record.focusCandidateTurn4,
    competitiveGamesQualified:0
  })+'\n');
}

module.exports={VERSION,RNG_PROTOCOL,withSeatPhysicalShuffleProtocol,
  publicTurnRoots,run};
