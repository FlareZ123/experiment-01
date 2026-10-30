'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {auditProspectiveSourceRoots}=
  require('../scripts/agent42-prospective-source-root-audit.cjs');

/** 32 complete, synthetically distinct registry entries, never cherry-picked. */
function fixture(){
  const rows=[];
  for(const rank of [6,11]){
    for(let repeat=0;repeat<8;repeat++){
      for(const candidateId of ['baseline','treatment']){
        const sourceSeat=repeat%2;
        const firstTurn=sourceSeat===0?1:2;
        const id=rank+':'+repeat+':'+candidateId;
        const sourcePass={
          actionOrdinal:repeat*10+2,playerSlot:sourceSeat,
          turnBefore:firstTurn,action:'PassTurnAction',pendingPrompt:null
        };
        const oppPass={
          actionOrdinal:repeat*10+1,playerSlot:1-sourceSeat,
          turnBefore:2,action:'PassTurnAction',pendingPrompt:null
        };
        rows.push({
          trial:{id,rank},sourceSeat,sourceActuallyFirst:sourceSeat===0,
          finished:repeat%2===0,
          endReason:repeat%2===0?'engine-game-end':'action-limit',
          rootActionLedger:[oppPass,sourcePass],
          sourceOwnerPostPassMobility:{
            totalSourcePasses:1,
            observations:[{ordinal:sourcePass.actionOrdinal,
              globalTurn:firstTurn,hasHeldMobility:repeat%2===0,
              benchNames:repeat%2===0?['Regidrago V']:[]}]
          },
          sourceLinePacket:repeat===0?
            {matchingSourceAttackDeclared:true}:null
        });
      }
    }
  }
  return rows;
}

test('complete 32-arm census keeps source seat identity, held mobility and caps',()=>{
  const outcome=auditProspectiveSourceRoots(fixture());
  assert.equal(outcome.arms,32);
  assert.equal(outcome.sourcePairs,16);
  for(const rank of [6,11]){
    const r=outcome.byRank[rank];
    assert.equal(r.attemptedArms,16);
    assert.equal(r.sourceFirstArms,8);
    assert.equal(r.sourceSecondArms,8);
    assert.equal(r.firstSourceTurnPassArms,16);
    assert.equal(r.sourcePasses,16);
    assert.equal(r.sourcePassesHoldingMobility,8);
    assert.equal(r.sourcePassesHoldingMobilityWithBench,8);
    assert.equal(r.sourcePassesHoldingMobilityFirstSixTurns,8);
    assert.equal(r.nativeTerminals,8);
    assert.equal(r.actionCaps,8);
    assert.equal(r.sourceLineVerified,2);
    assert.equal(r.sourceRootActions.PassTurnAction,16);
  }
});

test('native Boost Shake ending the first source turn is not misclassified as pass',()=>{
  const rows=fixture();
  const r=rows[16];
  r.rootActionLedger=[{actionOrdinal:9,playerSlot:r.sourceSeat,
    turnBefore:1,action:'PlayCardAction',card:'Boost Shake',
    pendingPrompt:null}];
  r.sourceOwnerPostPassMobility={totalSourcePasses:0,observations:[]};
  const result=auditProspectiveSourceRoots(rows);
  assert.equal(result.byRank[11].firstSourceTurnPassArms,15);
  assert.equal(result.byRank[11].firstSourceTurnCardActionCounts['Boost Shake'],1);
  assert.equal(result.byRank[11].sourcePasses,15);
});

test('reject missing, duplicate, mismatched owner-pass and wrong rank records',()=>{
  const baseline=fixture();
  assert.throws(()=>auditProspectiveSourceRoots(baseline.slice(1)),
    /full 32/);
  const duplicate=structuredClone(baseline);
  duplicate[31].trial.id=duplicate[0].trial.id;
  assert.throws(()=>auditProspectiveSourceRoots(duplicate),
    /Duplicate frozen trial/);
  const broken=structuredClone(baseline);
  broken[5].sourceOwnerPostPassMobility.observations[0].ordinal=999;
  assert.throws(()=>auditProspectiveSourceRoots(broken),
    /ordinal mismatch/);
  const missing=structuredClone(baseline);
  missing[2].trial.rank=23;
  assert.throws(()=>auditProspectiveSourceRoots(missing),
    /false|23/);
});
