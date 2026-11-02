'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {pairArms,summarizePairs,investmentBySeat}=
  require('../simulation/evaluation/agent2-rank11-basic-recipient-matched-development.cjs');

/** Synthetic physical deal, never a claim of paper/engine game result. */
function makeRows(treatment=false){
  return Array.from({length:16},(_,i)=>{
    const sourceSeat=i%2;
    return {
      trial:{id:'11:'+i+':A:champion-reference',
        rank:11,seed:300+i,candidateSlot:'A',
        candidateId:'champion-reference'},
      sourceSeat,sourceActuallyFirst:sourceSeat===0,
      actualStarterSeat:sourceSeat,
      sourceDealFingerprint:'source-'+i,
      fullPhysicalDealFingerprint:'full-'+i,
      sourceDeckFingerprint:'fixed-original-sixty',
      candidateDeckFingerprint:'fixed-candidate-sixty',
      rootActionLedgerSha256:(treatment?'treatment-':'baseline-')+i,
      rootActionCount:45,
      finished:i<8,winner:i<8?0:null,
      attackDeclarations:{source:2,candidate:3},
      ownerSupporterOpportunityAudit:{firstRoots:[{
        ownerSeat:sourceSeat,
        publicGuzmaGeometry:{ownActiveEnergyCards:2,
          ownBenchedEnergyCards:treatment?1:0}
      },{
        ownerSeat:1-sourceSeat,
        publicGuzmaGeometry:{ownActiveEnergyCards:1,
          ownBenchedEnergyCards:treatment?1:0}
      }]},
      ...(treatment?{bilateralBasicEnergyRecipientProfile:{
        bothPhysicalSeats:true,developmentOnly:true}}:{})
    };
  });
}

test('same-deal symmetric counterfactual pairs 16 authentic metadata slots',()=>{
  const before=makeRows(),after=makeRows(true);
  const pairs=pairArms(before,after);
  assert.equal(pairs.length,16);
  assert.equal(pairs.filter(p=>!p.matchedNativeRootDigest).length,16);
  const counted=summarizePairs(pairs);
  assert.equal(counted.control.engineTerminal,8);
  assert.equal(counted.treatment.engineTerminal,8);
  assert.equal(counted.control.sourceFirstTurnWithBenchEnergy,0);
  assert.equal(counted.treatment.sourceFirstTurnWithBenchEnergy,16);
  assert.equal(counted.treatment.candidateFirstTurnWithBenchEnergy,16);
  assert.equal(counted.treatment.sourceObservedTurns,16);
  assert.equal(counted.treatment.changedNativeRoots,16);
});

test('refuses same seed when one complete native physical deal differs',()=>{
  const control=makeRows(),treatment=makeRows(true);
  treatment[5].fullPhysicalDealFingerprint='different-physical-deal';
  assert.throws(()=>pairArms(control,treatment),
    /Complete physical setup changed/);
});

test('refuses no evidence or missing bilateral policy activation',()=>{
  const control=makeRows(),treatment=makeRows(true);
  treatment[1].bilateralBasicEnergyRecipientProfile=null;
  assert.throws(()=>pairArms(control,treatment),
    /Treatment not enabled/);
  treatment[1].bilateralBasicEnergyRecipientProfile={
    bothPhysicalSeats:true
  };
  control[2].sourceDealFingerprint=null;
  treatment[2].sourceDealFingerprint=null;
  assert.throws(()=>pairArms(control,treatment),
    /Missing authentic initial physical deal/);
});

test('counts observer source and candidate by genuine owner seat',()=>{
  const row=makeRows(true)[1];
  const data=investmentBySeat(row);
  assert.equal(data[row.sourceSeat].turns,1);
  assert.equal(data[row.sourceSeat].benchInvested,1);
  assert.equal(data[1-row.sourceSeat].activeInvested,1);
  row.ownerSupporterOpportunityAudit.firstRoots[1]
    .publicGuzmaGeometry.ownActiveEnergyCards=undefined;
  assert.throws(()=>investmentBySeat(row),
    /Missing native face-up Energy witness/);
});
