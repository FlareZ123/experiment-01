'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {preflight,gameplayWitness,REGISTRATION,PIN}=
  require('../simulation/evaluation/agent1-rank17-electrode-owner-native-aba.cjs');

test('four source-native groups and twelve A/B/A arms are fully frozen',()=>{
  const reg=preflight();
  assert.strictEqual(reg,REGISTRATION);
  assert.equal(reg.sourceOriginalRank,17);
  assert.equal(reg.opponentOriginalRank,1);
  assert.deepEqual(reg.sourceSeatByGroup,[0,1,0,1]);
  assert.equal(reg.nativeSeedsByGroup.length,4);
  assert.equal(new Set(reg.nativeSeedsByGroup).size,4);
  assert.equal(reg.arms.length,3);
  assert.equal(reg.nativeSeedsByGroup.length*reg.arms.length,12);
  assert.equal(reg.enginePinnedCommit,PIN.split('/')[1]);
  assert.equal(reg.nativeMaxActionsPerArm,140);
});
test('frozen original source and common policy cannot vary with observer flag',()=>{
  const reg=preflight();
  assert.deepEqual(reg.nativeRootOptions,{
    naturalEvolutionRoot:true,specialEnergyRoot:true
  });
  assert.deepEqual(reg.arms,[
    'canonical-control','canonical-readonly-observer',
    'canonical-control-repeat'
  ]);
  assert.equal(reg.sourcePrinted60Sha256.length,64);
  assert.equal(reg.opponentPrinted60Sha256.length,64);
});
test('gameplay witness excludes observer-private audit fields',()=>{
  const baseline={
    deckHashes:['source','opponent'],firstTurnSlot:1,
    initialFullPhysicalDealFingerprint:{digestSha256:'same-deal'},
    decisionTrace:[{action:'PassTurnAction'}],
    rootActionLedger:[{seat:1,action:'PassTurnAction'}],
    finished:false,winner:null,actionCount:9,
    observerAudit:{physicalNecessaryRoots:0}
  };
  const withObserver={
    ...baseline,observerAudit:{physicalNecessaryRoots:3},
    hiddenDeckIdentityShouldNeverBeUsed:['private']
  };
  assert.deepEqual(gameplayWitness(baseline),
    gameplayWitness(withObserver));
});
