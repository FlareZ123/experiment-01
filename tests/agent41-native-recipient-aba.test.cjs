'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {COMMON_OPTIONS,FIXED_ROOT_ENV,summarizeRecipientABA,
  describeRootTargetDivergence,sameDealRepeatStability,
  executeRecipientABA,executePaidRetreatABA,PAID_RETREAT_VERSION}=
    require('../simulation/evaluation/agent41-native-recipient-aba.cjs');

/** @param {number} rank @param {string} candidateId */
function row(rank,candidateId){
  return {
    trial:{id:rank+':retrospective-sourcefirst:0:B:'+candidateId,
      rank,seed:rank===6?407516727:482443328,
      candidateSlot:'B',candidateId},
    candidateSeat:1,sourceSeat:0,enginePin:'pinned-engine',
    candidateDeckFingerprint:'candidate:'+candidateId,
    sourceDeckFingerprint:'source:'+rank,
    sourceDealFingerprint:'source:'+rank+':deal',
    fullPhysicalDealFingerprint:'both:'+rank+':'+candidateId,
    fullPhysicalDealProtocol:'initial-full-physical-deal-sha256-v1',
    actualStarterSeat:0,verifiedFirstTurn:true,
    rootActionLedgerSha256:'same-labels-'+rank,
    nativeAcceptedTargetSidecar:null,
    nativeAcceptedEnergyPromptSidecar:null,
    finished:rank===11,actionCount:rank===11?89:260,
    winner:rank===11?1:null
  };
}
/** @param {string} active */
function report(active){
  const ids=['champion-reference','new-moon-lockbreaker-v1'];
  return {
    attempted:4,sourceFirstRetrospective:true,
    nativeAcceptedTargetsOptIn:true,actorOnlyCompositionOptIn:true,
    competitiveQualifiedGames:0,enginePin:'pinned-engine',
    candidatePolicy:'common-v0',actorOnlyCompositionVersion:'actor-v7',
    rows:[6,11].flatMap(rank=>ids.map(candidateId=>({
      ...row(rank,candidateId),
      actorOnlyDecisionCoverage:{detailedComponentAudits:{
        root:{energyRecipientFrontierOptIn:active==='true',
          paidRetreatRootOptIn:active==='paid',
          typedIntentCounts:active==='paid'?{'paid-retreat':2}:{},
          nativePhysicalConfirmedByIntent:active==='paid'?{'paid-retreat':1}:{},
          nativePhysicalUnconfirmedByIntent:active==='paid'?{'paid-retreat':1}:{}}}}
    })))
  };
}

test('A/B/A retains every trial and only claims selective physical evidence',()=>{
  const summary=summarizeRecipientABA(report('false'),report('true'),
    report('false'));
  assert.equal(summary.attempts,12);
  assert.equal(summary.pairs.length,4);
  assert.equal(summary.summary.comparablePolicyPairs,4);
  assert.equal(summary.summary.competitiveQualifiedGames,0);
  assert.equal(summary.summary.failuresAndCaps,6);
  assert.ok(summary.pairs.every(x=>
    x.physicalAB.status==='selective-physical-evidence'&&
    x.physicalAB.root.status==='target-unobserved'));
  assert.ok(summary.pairs.every(x=>x.nominalPolicyExposureEvidence===true));
});

test('missing registered attempts and duplicate trial IDs fail closed',()=>{
  const a=report('false'),b=report('true');
  b.rows.pop();
  assert.throws(()=>summarizeRecipientABA(a,b,a),{
    name:'AssertionError'
  });
  b.rows.push(b.rows[0]);
  assert.throws(()=>summarizeRecipientABA(a,b,a),{
    name:'AssertionError'
  });
});

test('actual full two-seat deal mismatch vetoes assumed same seed pairing',()=>{
  const a=report('false'),b=report('true');
  b.rows[0].fullPhysicalDealFingerprint='different-opponent-setup';
  const x=summarizeRecipientABA(a,b,a);
  assert.equal(x.pairs[0].physicalAB.status,'incomparable');
  assert.equal(x.pairs[0].physicalAB.reason,
    'different-or-missing-both-player-physical-deal');
  assert.equal(x.summary.comparablePolicyPairs,3);
});

test('A/B/A runner freezes all other root flags and restores every env entry',()=>{
  const keys=[...Object.keys(FIXED_ROOT_ENV),
    'AGENT44_ACTOR_ENERGY_RECIPIENT_DEV'];
  const original=new Map(keys.map(key=>[key,process.env[key]]));
  const seen=[];
  try{
    process.env.AGENT10_BASIC_ENERGY_FRONTIER_DEV='external';
    process.env.AGENT44_ACTOR_ENERGY_RECIPIENT_DEV='external';
    const out=executeRecipientABA(options=>{
      assert.deepEqual(options,COMMON_OPTIONS);
      seen.push({
        recipient:process.env.AGENT44_ACTOR_ENERGY_RECIPIENT_DEV,
        root:process.env.AGENT10_BASIC_ENERGY_FRONTIER_DEV
      });
      return report(process.env.AGENT44_ACTOR_ENERGY_RECIPIENT_DEV);
    });
    assert.deepEqual(seen.map(x=>x.recipient),['false','true','false']);
    assert.ok(seen.every(x=>x.root==='true'));
    assert.equal(out.attempts,12);
    assert.equal(out.rawDevelopment.baseline.rows.length,4);
    assert.equal(process.env.AGENT44_ACTOR_ENERGY_RECIPIENT_DEV,'external');
    assert.equal(process.env.AGENT10_BASIC_ENERGY_FRONTIER_DEV,'external');
  }finally{
    for(const [key,value] of original){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
});

test('runner restores root options even if native policy crashes',()=>{
  const key='AGENT44_ACTOR_ENERGY_RECIPIENT_DEV',old=process.env[key];
  let count=0;
  try{
    assert.throws(()=>executeRecipientABA(()=>{
      count++;
      if(count===2)throw Error('native unexpected exception');
      return report('false');
    }),/native unexpected exception/);
    assert.equal(count,2);
    assert.equal(process.env[key],old);
  }finally{
    if(old===undefined)delete process.env[key];
    else process.env[key]=old;
  }
});

test('physically changed same printed Energy target is distinguished from root-path drift',()=>{
  const left=row(11,'champion-reference');
  const right=row(11,'champion-reference');
  const original={rootActionOrdinal:49,playerSlot:0,action:'PlayCardAction',
    declared:{kind:'play-card',ownerHandPrinting:'Darkness Energy SVE 7',
      handIndex:2,target:{player:2,slot:0,index:0}}};
  left.nativeAcceptedTargetSidecar={events:[original]};
  right.nativeAcceptedTargetSidecar={events:[{
    ...original,declared:{...original.declared,
      target:{player:2,slot:1,index:1}}
  }]};
  const audit={root:{status:'different',index:0}};
  const difference=describeRootTargetDivergence(left,right,audit);
  assert.equal(difference.causalAttribution,
    'same-accepted-card-different-declared-target');
  assert.equal(difference.originalRootOrdinal,49);
  assert.equal(difference.treatmentRootOrdinal,49);
  assert.deepEqual(difference.originalDeclaredTarget,
    {player:2,slot:0,index:0});
  right.nativeAcceptedTargetSidecar.events[0].rootActionOrdinal=50;
  assert.equal(describeRootTargetDivergence(left,right,audit).causalAttribution,
    'different-root-or-card-path');
  assert.equal(describeRootTargetDivergence(left,right,{
    root:{status:'same-observed-targets'}}),null);
});

test('repeat stability requires actual Store roots and prompt hash parity',()=>{
  const base=row(11,'champion-reference');
  base.nativeAcceptedTargetSidecar={sha256:'root-physical-sha'};
  base.nativeAcceptedEnergyPromptSidecar={sha256:'energy-prompt-sha'};
  const repeated={...base};
  const observed={status:'selective-physical-evidence',
    root:{status:'same-observed-targets'},
    energyPrompt:{status:'same-observed-prompt-effects'}};
  assert.equal(sameDealRepeatStability(base,repeated,observed).status,
    'identical-accepted-physical-repeat');
  assert.equal(sameDealRepeatStability(base,{
    ...repeated,nativeAcceptedEnergyPromptSidecar:{sha256:'changed-physical'}
  },observed).status,'not-reproduced-or-unverified');
  assert.equal(sameDealRepeatStability(base,repeated,{
    ...observed,root:{status:'different'}
  }).status,'not-reproduced-or-unverified');
});

test('second A/B/A changes only owner paid retreat and restores root env',()=>{
  const keys=[...Object.keys(FIXED_ROOT_ENV),
    'AGENT44_ACTOR_ENERGY_RECIPIENT_DEV'];
  const original=new Map(keys.map(k=>[k,process.env[k]]));
  const seen=[];
  try{
    process.env.AGENT44_ACTOR_ENERGY_RECIPIENT_DEV='external';
    const value=executePaidRetreatABA(options=>{
      assert.deepEqual(options,COMMON_OPTIONS);
      seen.push({
        paid:process.env.AGENT6_PAID_RETREAT_ROOT_DEV,
        recipient:process.env.AGENT44_ACTOR_ENERGY_RECIPIENT_DEV
      });
      return report('false');
    });
    assert.equal(value.schema,PAID_RETREAT_VERSION);
    assert.equal(value.attempts,12);
    assert.deepEqual(seen.map(x=>x.paid),['false','true','false']);
    assert.deepEqual(seen.map(x=>x.recipient),['false','false','false']);
    assert.equal(value.registration.treatmentProfile,
      'AGENT6_PAID_RETREAT_ROOT_DEV=true');
    assert.equal(process.env.AGENT44_ACTOR_ENERGY_RECIPIENT_DEV,'external');
  }finally{
    for(const [k,v] of original){
      if(v===undefined)delete process.env[k];
      else process.env[k]=v;
    }
  }
});

test('typed paid retreat decision counts distinguish no-exposure from accepted effects',()=>{
  const out=summarizeRecipientABA(report('false'),report('paid'),
    report('false'));
  assert.equal(out.summary.selectedPaidRetreats,8);
  assert.equal(out.summary.nativePaidRetreatConfirmed,4);
  assert.equal(out.summary.trialsWithPaidRetreatAudit,4);
  assert.ok(out.pairs.every(p=>p.nominalPaidRetreatOptIn===true));
  assert.ok(out.pairs.every(p=>p.selectedPaidRetreats===2));
  assert.ok(out.pairs.every(p=>p.nativePaidRetreatUnconfirmed===1));
});
