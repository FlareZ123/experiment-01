'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {examineSource,pairedPhysical,inspect}=
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
        declared:{ownerHandPrinting:'Darkness Energy MEE',target:{slot:'active',index:0}},
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
