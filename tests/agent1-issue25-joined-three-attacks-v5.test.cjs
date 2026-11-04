'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  VERSION,withThreePrintedOwnerAttackFrontiers,runJoinedIssue25V5
}=require('../simulation/evaluation/agent1-issue25-joined-three-attacks-v5.cjs');
const {SELECTED_OUTER_TO_INNER}=
  require('../simulation/evaluation/agent36-issue25-selected-v0.cjs');
const {buildReceipt}=
  require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');

test('source-printed Get Lost is actually nested in joined Night Watch / Future Sight boundary',()=>{
  const order=[];
  const result=withThreePrintedOwnerAttackFrontiers(()=>{
    order.push('real-native-run');
    return 'native-settled';
  },{
    joinedAttackLayer:child=>{
      order.push('joined-outer');
      const value=child();
      order.push('joined-return');
      return {result:value,audit:{sourceStampedNightWatch:{acceptedDispatches:2}}};
    },
    getLostLayer:(child,options)=>{
      assert.equal(options.followSequentialNativeStores,true);
      order.push('getlost-inner');
      const value=child();
      order.push('getlost-return');
      return {result:value,audit:{actualOwnerSelections:1}};
    }
  });
  assert.equal(result.result,'native-settled');
  assert.deepEqual(order,[
    'joined-outer','getlost-inner','real-native-run',
    'getlost-return','joined-return'
  ]);
  assert.equal(result.audit.sourceStampedNightWatch.acceptedDispatches,2);
  assert.equal(result.audit.sourceStampedGetLost.actualOwnerSelections,1);
  assert.equal(result.audit.paperEffectCoverageComplete,false);
  assert.equal(result.audit.competitiveGamesQualified,0);
});

test('joined v5 executes both-seat source-independent resources with all three selected attack adapters',()=>{
  const layers={};
  for(const key of SELECTED_OUTER_TO_INNER.slice(0,-1)){
    layers[key]=next=>({result:next(),audit:{key}});
  }
  let selectedOptions=null;
  const out=runJoinedIssue25V5({
    layers,attackLayer:next=>({result:next(),audit:{
      sourceStampedNightWatch:{realStoreSelectedActions:2},
      sourceStampedFutureSight:{ownerPromptSelections:1},
      sourceStampedGetLost:{actualOwnerSelections:1},
      preRunUnpredictableSeedCommitmentSha256:'b'.repeat(64)
    }}),
    runner:options=>{
      selectedOptions=options;
      return {rows:[],sourceIndependentCommonPolicyOptIn:true};
    }
  });
  assert.deepEqual(selectedOptions,{
    actorOnlyComposition:true,nativeRootActionLimit:48,
    sourceIndependentCommonPolicy:true
  });
  assert.equal(out.manifest.version,VERSION);
  assert.equal(out.manifest.originalSourceRankScriptsDisabledByOptIn,true);
  assert.equal(out.manifest.actualRunnerConfirmedOption,true);
  assert.equal(out.manifest.sourceStampedGetLostSelected,true);
  assert.equal(out.manifest.getLostPaperEffectGloballyCertified,false);
  assert.equal(out.diagnostic.joinedPrintedAttackCount,3);
  assert.equal(out.diagnostic.sourceStampedGetLost.actualOwnerSelections,1);
  assert.equal(out.diagnostic.nightWatchSeedCommitmentSha256,'b'.repeat(64));
  assert.equal(out.manifest.releaseQualified,false);
  assert.equal(out.diagnostic.competitiveGamesQualified,0);
  assert.ok(out.manifest.resolvedSourceAndPolicyHashes.every(x=>
    /^[0-9a-f]{64}$/.test(x.sha256)));
  assert.equal(out.diagnostic.allRegisteredAttemptsReturned,false);
  const receipt=buildReceipt(out,{policyEntryPoint:
    'simulation/evaluation/agent1-issue25-joined-three-attacks-v5.cjs'});
  assert.equal(receipt.actuallyExecutingManifest.version,VERSION);
  assert.equal(receipt.observedSelectedAttackLayers.getLostPublicDiscard
    .actualOwnerSelections,1);
  assert.equal(receipt.developmentGate.overall,'FAIL-development-only');
});

test('v5 source-scoped attack policy failure never becomes a passed match',()=>{
  const layers={};
  for(const key of SELECTED_OUTER_TO_INNER.slice(0,-1))
    layers[key]=next=>({result:next(),audit:{}});
  const out=runJoinedIssue25V5({
    layers,attackLayer:()=>{throw new Error('native Get Lost refused');},
    runner:()=>{throw new Error('must never reach runner');}
  });
  assert.equal(out.diagnostic.thrownMessage,'native Get Lost refused');
  assert.equal(out.diagnostic.allRegisteredAttemptsReturned,false);
  assert.equal(out.manifest.releaseQualified,false);
  assert.equal(out.diagnostic.competitiveGamesQualified,0);
});
