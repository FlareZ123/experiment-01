'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const reg=require('../results/aichi-2026/registrations/agent4-bilateral-mail-seat-shuffle-aba-v1-20261105.json');
const {RNG_PROTOCOL,withSeatPhysicalShuffleProtocol,publicTurnRoots,run}=
  require('../simulation/evaluation/agent4-bilateral-mail-seat-shuffle-aba-v1.cjs');

const ids=reg.seededOriginalTrialIds;
function headlessStub(log){
  return {runMatch(request){
    log.push(request);
    return {randomnessProtocol:request.isolatePhysicalShuffleRandomness?
      RNG_PROTOCOL:'legacy-shared-prng',
    physicalShuffleRandomIsolation:request.isolatePhysicalShuffleRandomness===true};
  }};
}
test('all 24 real entry requests are isolated without changing printed source registration',()=>{
  const observed=[],headless=headlessStub(observed),original=headless.runMatch;
  const outcome=withSeatPhysicalShuffleProtocol(()=>
    ['A','B','A2'].flatMap(()=>ids.map(id=>
      headless.runMatch({label:'registered:'+id,seed:100,
        deckA:['source'],deckB:['candidate']}))),{
    headless,trialIds:ids
  });
  assert.strictEqual(headless.runMatch,original);
  assert.equal(outcome.result.length,24);
  assert.equal(outcome.audit.actualNativeRequests,24);
  assert.equal(outcome.audit.all24ExactRegisteredOrder,true);
  assert.equal(outcome.audit.nativeReturnedProtocolMatches,24);
  assert.equal(outcome.audit.everyRequestIsolationApplied,true);
  assert.ok(observed.every(x=>x.isolatePhysicalShuffleRandomness===true));
  assert.ok(observed.every(x=>x.isolatePolicyRandomness===undefined));
  assert.ok(observed.every(x=>x.deckA[0]==='source'&&x.deckB[0]==='candidate'));
});
test('unknown trial cannot be silently mixed into registered RNG comparison',()=>{
  const observed=[],headless=headlessStub(observed),original=headless.runMatch;
  assert.throws(()=>withSeatPhysicalShuffleProtocol(()=>
    headless.runMatch({label:'unknown-original'}),{headless,trialIds:ids}),
    /Unregistered native match/);
  assert.strictEqual(headless.runMatch,original);
  assert.equal(observed.length,0);
});
test('native failure does not leak the patched headless export',()=>{
  const error=new Error('pinned bot decoder failure');
  const headless={runMatch:()=>{throw error;}},original=headless.runMatch;
  assert.throws(()=>withSeatPhysicalShuffleProtocol(()=>
    headless.runMatch({label:ids[0]}),{headless,trialIds:ids}),e=>e===error);
  assert.strictEqual(headless.runMatch,original);
});
test('public turn projection is explicitly scoped to actual seat and root, not prompts',()=>{
  const roots=[
    {seat:0,turn:4,action:'PlayCardAction',card:'Klefki FST',attack:null,
      ordinal:4,pendingPrompt:null},
    {seat:0,turn:4,action:'ResolvePromptAction',card:null,attack:null,
      ordinal:5,pendingPrompt:'ChooseCardsPrompt'},
    {seat:1,turn:4,action:'AttackAction',attack:'Shadow Mist',
      ordinal:6,pendingPrompt:null}
  ];
  assert.deepEqual(publicTurnRoots(roots,0,4),[
    {ordinal:4,action:'PlayCardAction',card:'Klefki FST',attack:null}
  ]);
});
test('full research facade keeps all synthetic failed/capped native statuses and zero games',()=>{
  const received=[],headless=headlessStub(received);
  const panel=ids.map(id=>({
    id,sourceSeat:id.includes(':A:')?1:0,
    fullOpeningParity:true,sourceOpeningParity:true,
    ARepeatRootTapeParity:true,firstTreatedRootDivergence:14,
    originalDisposition:'censored',treatmentDisposition:
      id.includes('11:102:A:new-moon')?'engine-error':'censored',
    repeatedDisposition:'censored',
    changeAudit:{baselinePublicRootTape:[
      {seat:0,turn:4,ordinal:25,action:'PlayCardAction',
        card:'Klefki FST',attack:null,pendingPrompt:null}],
      treatedPublicRootTape:[
      {seat:0,turn:4,ordinal:26,action:'PassTurnAction',
        card:null,attack:null,pendingPrompt:null}]}
  }));
  const record=run({
    headless,
    mailABA:()=>{
      for(let phase=0;phase<3;phase++)
        for(const id of ids)headless.runMatch({label:'original:'+id});
      return {panel,sameAllPhysicalOpenings:true,
        ARepeatFullyDeterministic:true,
        bilateralMailAudit:{actualMailItemRootsBySeat:[0,4]}};
    }
  });
  assert.equal(received.length,24);
  assert.ok(Object.values(record.gates).every(Boolean));
  assert.equal(record.competitiveGamesQualified,0);
  assert.equal(record.winRate,null);
  assert.equal(record.focusCandidateTurn4.length,2);
  assert.equal(record.focusCandidateTurn4[0].mailTreatment[0].action,
    'PassTurnAction');
  assert.ok(record.originalEightAba.panel.some(x=>
    x.treatmentDisposition==='engine-error'));
});
