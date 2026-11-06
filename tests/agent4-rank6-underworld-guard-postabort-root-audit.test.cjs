'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {publicPostBlockEpisode,run}=
  require('../simulation/evaluation/agent4-rank6-underworld-guard-postabort-root-audit.cjs');
const REG=require('../results/aichi-2026/registrations/agent4-rank6-underworld-guard-postabort-root-audit-v1-20261106.json');

function root(index,seat,attack=false){
  return {actionOrdinal:index,turnBefore:32+(index>142?1:0),
    playerSlot:seat,action:attack?'AttackAction':'PassTurnAction',
    attack:attack?'Volt Cyclone':null,card:null};
}
test('original error ordinal replaced with native accepted root, opponent separately',()=>{
  const target=REG.exactHistoricalTargets[0];
  const row={status:null,nativeFinished:false,acceptedRootCount:180,
    nativeFirst28AcceptedPublicRootsAfterOriginalAbort:[
      root(141,0),root(142,1,true),root(143,1)
    ]};
  const episode=publicPostBlockEpisode(row,target);
  assert.equal(episode.originallyFailedOrdinalNowAccepted,true);
  assert.equal(episode.actualFirstSubstitutedAcceptedRoot.action,'PassTurnAction');
  assert.equal(episode.opposingNativeAttackRootCount,1);
  assert.equal(episode.observedOpposingRootAfterOriginalFailure,true);
  assert.equal(episode.qualifiedPaperGames,0);
});
test('wrong postfailure source seat or postcut action fails evidence receipt',()=>{
  const target=REG.exactHistoricalTargets[0];
  const row={status:null,nativeFinished:false,acceptedRootCount:180,
    nativeFirst28AcceptedPublicRootsAfterOriginalAbort:[root(142,0)]};
  const episode=publicPostBlockEpisode(row,target);
  assert.equal(episode.originallyFailedOrdinalNowAccepted,false);
  assert.equal(episode.observedOpposingRootAfterOriginalFailure,false);
});
function sampleNative(){
  return {
    actualNativeAttemptCount:12,
    paired:Array.from({length:4},(_,i)=>({id:String(i),
      sourceFingerprintMatchedAllThree:true,
      fullPhysicalDealMatchedAllThree:true,
      aRepeatExactAcceptedPrefixAndDisposition:true})),
    provenanceDriftAudit:{},
    modes:REG.modes.map(modeId=>({
      modeId,publicUnderworldVetoAudit:{provenVetoes:6},
      rows:REG.exactHistoricalTargets.map(target=>({
        id:target.id,status:null,nativeFinished:false,
        acceptedRootCount:180,rejectedUnknownPowerActions:[],
        nativeFirst28AcceptedPublicRootsAfterOriginalAbort:[
          root(target.priorNativeErrorRoot,target.actingSeat),
          root(target.priorNativeErrorRoot+1,target.opponentSeat,true)
        ]
      }))
    }))
  };
}
test('all six accepted native roots with actual opposing root satisfy gates',()=>{
  const x=run({native:()=>sampleNative()});
  assert.equal(x.postBlockPublicEpisodes.length,6);
  assert.equal(x.totalGuardedVetoes,18);
  assert.ok(Object.values(x.gates).every(Boolean));
  assert.equal(x.winRate,null);
});
test('missing actual opposing root forces false gate and no promotion',()=>{
  const x=run({native:()=>{
    const sample=sampleNative();
    sample.modes[0].rows[0]
      .nativeFirst28AcceptedPublicRootsAfterOriginalAbort=
      [root(141,0)];
    return sample;
  }});
  assert.equal(x.gates.observedOpponentActionAfterEachBlock,false);
  assert.equal(x.noCompetitiveGameQualified,true);
});
