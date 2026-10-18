'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {compareElectrodeObserver, OBSERVER_TAG} =
  require('../scripts/aichi-electrode-observer-contrast.cjs');

function validPair() {
  const original = {
    researchRevision:'f'.repeat(40), planDigest:'p'.repeat(64),
    policyFlags:{
      captureDecisionTrace:true, captureElectrodeOpportunity:false,
      electrodeGXEnergyCorrection:true
    },
    counts:{'completed-engine-game':2},
    records:['A','B'].map((seat, i) => ({
      trialId:'pilot:4:0:champion-reference:' + seat,
      candidateId:'champion-reference', candidateEngineSlot:seat,
      opponentRank:4, status:'completed-engine-game',
      candidateActualTurn:i===0?'first':'second',
      seed:100+i, opponentAttacks:2+i,
      traceSummary:{
        chronologicalActionTrace:[{actionOrdinal:1,action:'PassTurnAction'}],
        chronologicalActionTraceSha256:'trace-'+i,
        prizesRemaining:[6,4], electrodeOpportunitySummary:null
      }
    }))
  };
  const observed = structuredClone(original);
  observed.policyFlags.captureElectrodeOpportunity=true;
  observed.records.forEach((record,i)=>{
    const opponentSeat=i===0?1:0;
    const empty={
      decisions:10,activeRaichu:0,benchedElectrode:0,
      both:0,bothWithDiscardSpecial:0,
      withSafePrizeWindow:0,withPostBombReversalWindow:0
    };
    const populated={
      ...empty,decisions:12,activeRaichu:3,
      benchedElectrode:4,both:1,bothWithDiscardSpecial:1,
      withSafePrizeWindow:1,withPostBombReversalWindow:1
    };
    record.traceSummary.electrodeOpportunitySummary={
      evidenceType:OBSERVER_TAG, countsBySeat:opponentSeat===0?
        [populated,empty]:[empty,populated]
    };
  });
  return {original,observed};
}

test('full trace normalized equality plus physical opponent-seat metrics',()=>{
  const {original,observed}=validPair();
  const beforeControl=JSON.stringify(original);
  const beforeObserved=JSON.stringify(observed);
  const out=compareElectrodeObserver(original,observed);
  assert.equal(out.trials,2);
  assert.equal(out.opponentDecisionTotals.decisions,24);
  assert.equal(out.opponentDecisionTotals.activeRaichu,6);
  assert.equal(out.opponentDecisionTotals.benchedElectrode,8);
  assert.equal(out.opponentDecisionTotals.both,2);
  assert.deepEqual(out.byTrial.map(row=>row.opponentSeat),[1,0]);
  assert.equal(JSON.stringify(original),beforeControl);
  assert.equal(JSON.stringify(observed),beforeObserved);
});

test('even one observer-correlated Prize, trace or seed drift fails closed',()=>{
  for(const mutate of [
    r=>{r.records[0].traceSummary.prizesRemaining[1]=3;},
    r=>{r.records[0].traceSummary.chronologicalActionTrace[0].action='RetreatAction';},
    r=>{r.records[1].seed+=1;},
    r=>{r.policyFlags.electrodeGXEnergyCorrection=false;}
  ]){
    const {original,observed}=validPair();
    mutate(observed);
    assert.throws(()=>compareElectrodeObserver(original,observed),
      /diverged outside designated telemetry field/);
  }
});

test('missing or malformed per-seat observer evidence is rejected',()=>{
  const {original,observed}=validPair();
  observed.records[0].traceSummary.electrodeOpportunitySummary.countsBySeat[1].both=4;
  assert.throws(()=>compareElectrodeObserver(original,observed),
    /Contradictory observer relation/);

  const next=validPair();
  next.observed.records[1].traceSummary.electrodeOpportunitySummary.evidenceType=
    'unrecognized';
  assert.throws(()=>compareElectrodeObserver(next.original,next.observed),
    /Missing observer evidence/);
});
