'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
 seededRandom,deckPermutation,physicalShuffleRandomStreams,
 choosePhysicalShuffleRandom
}=require('../simulation/twinleaf/headless.cjs');
const {REG}=require('../simulation/evaluation/agent4-bilateral-mail-seat-shuffle-aba-v1.cjs');
const {IDS,RNG_PROTOCOL,withAfterSetupPhysicalShuffles,run}=
  require('../simulation/evaluation/agent4-mail-postsetup-seat-shuffle-aba-v2.cjs');

test('turn-zero physical shuffle retains the original shared RNG source and deck permutation',()=>{
  for(const seed of [1,1492376549,1787484121,1760478218,811955552]){
    const original=seededRandom(seed),treatment=seededRandom(seed);
    const separate=physicalShuffleRandomStreams(seed);
    for(const seat of [0,1]){
      const chosen=choosePhysicalShuffleRandom(treatment,separate,seat,0,true);
      assert.strictEqual(chosen,treatment);
      assert.deepEqual(deckPermutation(53,chosen),deckPermutation(53,original));
    }
    assert.strictEqual(
      choosePhysicalShuffleRandom(treatment,separate,0,1,true),separate[0]);
    assert.strictEqual(
      choosePhysicalShuffleRandom(treatment,separate,1,7,true),separate[1]);
    assert.strictEqual(
      choosePhysicalShuffleRandom(treatment,separate,1,0,false),separate[1]);
    assert.strictEqual(
      choosePhysicalShuffleRandom(treatment,null,1,4,true),treatment);
  }
});
test('postsetup source-only shuffles preserve candidate own random permutation',()=>{
  const first=physicalShuffleRandomStreams(1492376549);
  const baseline=deckPermutation(43,
    choosePhysicalShuffleRandom(seededRandom(1),first,0,4,true));
  const second=physicalShuffleRandomStreams(1492376549);
  const shared=seededRandom(1);
  deckPermutation(44,choosePhysicalShuffleRandom(shared,second,1,3,true));
  deckPermutation(43,choosePhysicalShuffleRandom(shared,second,1,3,true));
  const actual=deckPermutation(43,
    choosePhysicalShuffleRandom(shared,second,0,4,true));
  assert.deepEqual(actual,baseline);
});
test('24 authentic-looking match requests retain true policy isolation and after-setup physical flags',()=>{
  const accepted=[],headless={runMatch:r=>{
    accepted.push(r);
    return {
      physicalShuffleRandomIsolationAfterSetup:true,
      randomnessProtocol:RNG_PROTOCOL
    };
  }};
  const before=headless.runMatch;
  const outcome=withAfterSetupPhysicalShuffles(()=>
    ['A','B','A'].flatMap(()=>IDS.map(id=>
      headless.runMatch({label:'native-'+id,
        isolatePolicyRandomness:true,isolatePhysicalShuffleRandomness:false}))),{
    headless,trialIds:IDS
  });
  assert.strictEqual(headless.runMatch,before);
  assert.equal(outcome.result.length,24);
  assert.equal(outcome.audit.correctRegistered24NativeRequestOrder,true);
  assert.equal(outcome.audit.all24ActualRequestFlags,true);
  assert.equal(outcome.audit.returnedNativeProtocolConfirmed,24);
  assert.ok(accepted.every(x=>
    x.isolatePhysicalShuffleRandomnessAfterSetup===true &&
    x.isolatePolicyRandomness===true));
});
test('match error and unregistered trial retain fail-closed original headless function',()=>{
  const err=new Error('native unsupported card');
  const headless={runMatch:()=>{throw err;}},original=headless.runMatch;
  assert.throws(()=>withAfterSetupPhysicalShuffles(()=>
    headless.runMatch({label:IDS[0],isolatePolicyRandomness:true}),
    {headless,trialIds:IDS}),e=>e===err);
  assert.strictEqual(headless.runMatch,original);
  assert.throws(()=>withAfterSetupPhysicalShuffles(()=>
    headless.runMatch({label:'unknown-seed'}),
    {headless,trialIds:IDS}),/lacks registered original ID/);
  assert.strictEqual(headless.runMatch,original);
});
test('legacy original source and whole deal are compared to A/B/A with all eight retained',()=>{
  const registered=IDS.map(id=>({
    id,sourcePhysicalDealFingerprint:'source:'+id,
    fullPhysicalDealFingerprint:'full:'+id,
    status:id.includes('11:102:A:new-moon')?'engine-error':null
  }));
  const made=()=>({
    manifest:{version:'selected-v5',observedTwinleafGitCommit:'pin'},
    diagnostic:{selectedNativeAttempts:registered.map(x=>({...x}))}
  });
  const headless={runMatch:r=>({
    physicalShuffleRandomIsolationAfterSetup:true,
    randomnessProtocol:RNG_PROTOCOL
  })};
  const panel=IDS.map(id=>({
    id,sourceSeat:id.includes(':A:')?1:0,
    originalRoots:48,treatedRoots:48,
    firstTreatedRootDivergence:null,
    changeAudit:null
  }));
  const selected=run({
    headless,legacyRunner:made,
    mailABA:({runner})=>{
      runner();
      for(const id of IDS)headless.runMatch({
        label:id,isolatePolicyRandomness:true});
      runner();
      for(const id of IDS)headless.runMatch({
        label:id,isolatePolicyRandomness:true});
      runner();
      for(const id of IDS)headless.runMatch({
        label:id,isolatePolicyRandomness:true});
      return {
        panel,sameAllPhysicalOpenings:true,
        ARepeatFullyDeterministic:true,
        bilateralMailAudit:{actualMailItemRootsBySeat:[0,0],
          nativeStoreResolvedBySeat:[0,0]}
      };
    }
  });
  assert.ok(Object.values(selected.gates).every(Boolean));
  assert.equal(selected.allRegisteredIdInitialDealParity.length,8);
  assert.ok(selected.allRegisteredIdInitialDealParity.some(x=>
    x.legacyStatus==='engine-error'));
  assert.equal(selected.competitiveGamesQualified,0);
  assert.equal(selected.winRate,null);
  assert.equal(selected.rank6PublicContinuations.length,2);
});
