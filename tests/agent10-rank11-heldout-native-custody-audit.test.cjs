'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {examineSource,pairedPhysical,firstNativeRootDifference,acceptedSourceTargets,compareAcceptedTargetSequence,inspect}=
  require('../scripts/agent10-rank11-heldout-native-custody-audit.cjs');
const reg=require('../results/aichi-2026/registrations/agent10-rank11-heldout-headway-4seed-20261103.json');

test('source evidence separates actual accepted owner Energy from rejected and other-seat events',()=>{
  const row={
    rootActionLedger:[
      {playerSlot:0,action:'AttackAction',attack:'Claw of Darkness',turnBefore:17},
      {playerSlot:1,action:'AttackAction',attack:'Claw of Darkness',turnBefore:18}
    ],
    nativeAcceptedTargetSidecar:{events:[
      {playerSlot:0,storeAccepted:true,turnBefore:7,
        declared:{kind:'play-card',status:'captured',
        ownerHandPrinting:'Darkness Energy MEE',target:{slot:'active',index:0}},
        publicBoardChanges:[{after:{pokemon:'Mega Absol ex M1L'}}]},
      {playerSlot:1,storeAccepted:true,turnBefore:9,
        declared:{ownerHandPrinting:'Darkness Energy MEE'}},
      {playerSlot:0,storeAccepted:false,turnBefore:11,
        declared:{ownerHandPrinting:'Darkness Energy MEE'}}
    ]},
    sourceAttackSettlement:{attacks:[
      {attackName:'Claw of Darkness',turnBefore:17,
        settledPromptChain:true,prizesBefore:[6,6],prizesAfter:[4,6],
        nextSourceRoot:{turnBefore:18}}
    ]},
    finished:true,winner:0,actionCount:72,endReason:'engine-game-end',
    finalPrizes:[0,6]
  };
  const s=examineSource(row,0);
  assert.equal(s.firstClaw,17);
  assert.equal(s.nativeSourceClawCount,1);
  assert.equal(s.acceptedOriginalSourceDarknessEnergy.length,1);
  assert.deepEqual(s.acceptedOriginalSourceDarknessEnergy[0].target,{slot:'active',index:0});
  assert.equal(s.settledClawEvidence[0].settledPromptChain,true);
  assert.equal(s.settledClawEvidence[0].nextOpponentRoot.turnBefore,18);
});

test('source deal must match physically and cannot be inferred from identical source prints',()=>{
  const a={sourceDeckFingerprint:'deck',candidateDeckFingerprint:'candidate',
    sourceDealFingerprint:'source-1',fullPhysicalDealFingerprint:'full-1',
    actualStarterSeat:0,verifiedFirstTurn:true};
  assert.equal(pairedPhysical(a,{...a}).sameFullDeal,true);
  const b={...a,sourceDealFingerprint:'source-2'};
  assert.equal(pairedPhysical(a,b).sameSourceSixty,true);
  assert.equal(pairedPhysical(a,b).sameSourceDeal,false);
});

test('native first-root difference distinguishes same-root and recipient divergence',()=>{
  const control=[
    {playerSlot:1,turnBefore:1,action:'PlayCardAction',card:'Darkness Energy'},
    {playerSlot:1,turnBefore:17,action:'PlayCardAction',
      card:'Darkness Energy MEE',target:{slot:'active',index:0}}
  ];
  const staged=[control[0],{...control[1],target:{slot:'bench',index:3}}];
  const changed=firstNativeRootDifference(control,staged);
  assert.equal(changed.rootIndex,1);
  assert.equal(changed.control.globalTurn,17);
  assert.equal(changed.control.declaredTarget.slot,'active');
  assert.equal(changed.alternative.declaredTarget.slot,'bench');
  assert.equal(firstNativeRootDifference(control,control),null);
});

test('same root sequence can conceal a different physically accepted source target',()=>{
  const mk=slot=>({
    rootActionLedger:[{playerSlot:1,turnBefore:19,
      action:'PlayCardAction',card:'Darkness Energy MEE'}],
    nativeAcceptedTargetSidecar:{events:[{
      playerSlot:1,turnBefore:19,rootActionOrdinal:75,storeAccepted:true,
      declared:{kind:'play-card',status:'captured',
        ownerHandPrinting:'Darkness Energy MEE',target:{
        player:2,slot:slot==='active'?1:2,index:slot==='active'?0:3
      }},
      visibility:'public-after-dispatch',
      publicBoardChanges:[{seat:1,position:slot,index:slot==='active'?0:3}]

    }]}
  });
  const ctrl=mk('active'),changed=mk('bench');
  assert.equal(firstNativeRootDifference(ctrl.rootActionLedger,
    changed.rootActionLedger),null);
  const c=compareAcceptedTargetSequence(
    acceptedSourceTargets(ctrl,1),acceptedSourceTargets(changed,1));
  assert.equal(c.identical,false);
  assert.equal(c.firstDifferentIndex,0);
  assert.equal(c.control.acceptedTarget.slot,1);
  assert.equal(c.alternative.acceptedTarget.slot,2);
  assert.equal(c.control.nativePublicRecipientClassification.category,
    'declared-own-slot-public-delta-confirmed');
  assert.equal(c.alternative.nativePublicRecipientClassification.category,
    'declared-own-slot-public-delta-confirmed');
  const same=compareAcceptedTargetSequence(
    acceptedSourceTargets(ctrl,1),acceptedSourceTargets(ctrl,1));
  assert.equal(same.identical,true);
});

test('whole archive integrity gate retains all 24 attempts and rejects physically mismatched rows',()=>{
  const factors=Object.keys(reg.factors);
  const archive={
    schema:'agent10-rank11-heldout-headway-4seed-v1',
    actualNativeAttempts:24,competitiveQualifiedGames:0,
    rawFactors:Object.fromEntries(factors.map((f,j)=>[f,{
      rows:reg.trialRows.map((trial,i)=>({
        trial:{id:trial.id},
        sourceDeckFingerprint:'source',
        candidateDeckFingerprint:trial.candidateId,
        sourceDealFingerprint:'seed-'+trial.seed,
        fullPhysicalDealFingerprint:'full-'+trial.id,
        actualStarterSeat:trial.candidateSlot==='A'?1:0,
        finished:false,endReason:'action-limit',actionCount:260,
        error:null,rootActionLedger:
          trial.seed===315928076&&trial.candidateId==='new-moon-lockbreaker-v1'?
            [{playerSlot:1,action:'AttackAction',
              attack:'Claw of Darkness',turnBefore:[17,33,17][j]}]:[],
        nativeAcceptedTargetSidecar:{events:[]}
      }))
    }]))
  };
  const report=inspect(archive);
  assert.equal(report.verifiedWithinCandidatePhysicalComparisons,24);
  assert.equal(report.verifiedCrossCandidateSourceComparisons,12);
  assert.equal(report.dispositions.activeHeadway.contextsWithClaw,1);
  assert.equal(report.keyFreshSource.factors.staged.firstClaw,33);
  archive.rawFactors.staged.rows[1].sourceDealFingerprint='reroll';
  assert.throws(()=>inspect(archive),/Within-context exact physical pairing/);
});
