'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,REG,rootPrefixComparison,outcome} =
  require('../../simulation/evaluation/agent38-extended-520root-mail-nest.cjs');

test('extension is preregistered for the same frozen 4 deals and fixed 60s',()=>{
  assert.equal(VERSION,REG.schema);
  assert.equal(REG.status,'FROZEN_BEFORE_EXECUTION');
  assert.equal(REG.newNativeRootActionCap,520);
  assert.equal(REG.previousNativeCap,260);
  assert.equal(REG.exactOriginalTrialIds.length,4);
  assert.equal(REG.originalFixedSixtiesUnchanged,true);
  assert.deepEqual(new Set(REG.seeds),
    new Set([2404595552,948758444]));
  for(const key of Object.keys(REG.baseline))
    if(key!=='preferSinglePrizeNestBasic')
      assert.deepEqual(REG.baseline[key],REG.treatment[key]);
});

test('root prefix treats native added tail as continuation and detects drift',()=>{
  const row={trialId:'t',ordinal:1,action:'PassTurnAction',
    seat:0,turn:2,promptId:null,responseType:null,
    ownerMailAfterPassAction:false,
    previouslyMailSelectedTrainerPlayed:false};
  const another={...row,ordinal:2,action:'PlayCardAction'};
  assert.deepEqual(rootPrefixComparison([row],[row,another]),{
    compared:1,identicalPrefix:true,firstMismatchIndex:null,
    originalN:1,extendedN:2
  });
  const drift=rootPrefixComparison([row],[{...row,seat:1},another]);
  assert.equal(drift.identicalPrefix,false);
  assert.equal(drift.firstMismatchIndex,0);
});

test('source attack census uses registered physical source seat',()=>{
  const result={attempts:[{
    id:'t',sourceSeat:1,seed:99,nativeStatus:null,
    nativeFinished:false,nativeWinner:null,nativeEndReason:'action-limit',
    nativeActionCount:520,nativeTurnCount:88,nativeFinalPrizes:[6,5],
    nativeFailureStage:null,nativeFinalPublicBoard:[],
    nativeRootActionMix:{
      '0:AttackAction':10,'0:PassTurnAction':0,
      '1:AttackAction':2,'1:PassTurnAction':35
    }
  }]};
  const row=outcome(result,'t');
  assert.equal(row.sourceSeat,1);
  assert.equal(row.sourceAttackActions,2);
  assert.equal(row.opponentAttackActions,10);
  assert.equal(row.sourcePassActions,35);
});
