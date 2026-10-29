'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {COMMON_OPTIONS,FIXED_ROOT_ENV,summarizeRecipientABA,
  executeRecipientABA}=require('../simulation/evaluation/agent41-native-recipient-aba.cjs');

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
        root:{energyRecipientFrontierOptIn:active==='true'}}}
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
