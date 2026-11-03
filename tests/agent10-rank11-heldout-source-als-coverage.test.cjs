'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {originalTrainerRoot,extractSourceRoots,inspect}=
  require('../scripts/agent10-rank11-heldout-source-als-coverage.cjs');
const reg=require('../results/aichi-2026/registrations/agent10-rank11-heldout-headway-4seed-20261103.json');

test('only actual source-list Trainer printing names qualify as Trainer roots',()=>{
  assert.deepEqual(originalTrainerRoot('Boost Shake EVS'),{
    name:'Boost Shake',category:'Item'
  });
  assert.deepEqual(originalTrainerRoot('Carmine TWM'),{
    name:'Carmine',category:'Supporter'
  });
  assert.deepEqual(originalTrainerRoot('Float Stone BKT'),{
    name:'Float Stone',category:'Tool'
  });
  assert.equal(originalTrainerRoot('Fog Crystal'),null);
  assert.equal(originalTrainerRoot('Mega Absol ex M1L'),null);
  assert.equal(originalTrainerRoot(null),null);
});

test('counts original source-only Trainer roots; darkness native receipt excludes rejected events',()=>{
  const row={
    rootActionLedger:[
      {playerSlot:1,turnBefore:1,action:'PlayCardAction',
        card:'Battle VIP Pass',actionOrdinal:4},
      {playerSlot:0,turnBefore:1,action:'PlayCardAction',
        card:'Carmine TWM',actionOrdinal:5},
      {playerSlot:1,turnBefore:1,action:'PlayCardAction',
        card:'Boost Shake EVS',actionOrdinal:6},
      {playerSlot:1,turnBefore:3,action:'PlayCardAction',
        card:'Dark Patch ASR',actionOrdinal:19},
      {playerSlot:1,turnBefore:3,action:'AttackAction',
        attack:'Claw of Darkness'},
      {playerSlot:1,turnBefore:5,action:'PlayCardAction',card:'Fog Crystal'},
      {playerSlot:1,turnBefore:5,action:'PassTurnAction',
        actorPolicyDecisionOrdinal:39,actionOrdinal:35}
    ],
    nativeAcceptedTargetSidecar:{events:[
      {playerSlot:1,storeAccepted:true,
        declared:{ownerHandPrinting:'Darkness Energy MEE'},
        publicBoardChanges:[{seat:1,before:{energies:[]},
          after:{energies:['Darkness Energy MEE']}}]},
      {playerSlot:1,storeAccepted:false,
        declared:{ownerHandPrinting:'Darkness Energy MEE'},
        publicBoardChanges:[]},
      {playerSlot:0,storeAccepted:true,
        declared:{ownerHandPrinting:'Darkness Energy MEE'},
        publicBoardChanges:[{seat:0,before:{energies:[]},
          after:{energies:['Darkness Energy MEE']}}]}
    ]},
    finished:false,endReason:'action-limit'
  };
  const a=extractSourceRoots(row,1);
  assert.equal(a.sourceSelectedCardRoots,4);
  assert.equal(a.countByCategory.Item,3);
  assert.equal(a.countByCategory.Supporter,0);
  assert.equal(a.firstTwoSourceTurnTrainerRoots.length,3);
  assert.equal(a.darknessPhysicalAttachments,1);
  assert.equal(a.sourceAttackRoots.length,1);
  assert.deepEqual(a.firstTwoOriginalSourceTurns,[1,3]);
  assert.equal(a.sourceUnclassifiedCardRoots.length,1);
  assert.equal(a.sourcePassRoots,1);
  assert.equal(a.sourceActorTaggedPassRoots,1);
});

test('all twenty-four archived rows required, and no cross-factor source sixty drift',()=>{
  const archive={
    schema:'agent10-rank11-heldout-headway-4seed-v1',
    actualNativeAttempts:24,
    rawFactors:Object.fromEntries(Object.keys(reg.factors).map(f=>[f,{
      rows:reg.trialRows.map(t=>({
        trial:{id:t.id},sourceDeckFingerprint:'source60',
        rootActionLedger:[],nativeAcceptedTargetSidecar:{events:[]},
        finished:false,endReason:'action-limit'
      }))
    }]))
  };
  const result=inspect(archive);
  assert.equal(result.rows.length,24);
  assert.equal(result.aggregate.control.sourceContexts,8);
  assert.equal(result.aggregate.activeHeadway.contextsWithSourceTrainerRoot,0);
  assert.equal(result.aggregate.activeHeadway.sourcePassRoots,0);
  archive.rawFactors.activeHeadway.rows[3].sourceDeckFingerprint='wrong60';
  assert.throws(()=>inspect(archive),/AssertionError|falsy|expression/);
});
