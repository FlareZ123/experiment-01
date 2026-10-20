'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {rank4PositionSummary}=require(
  '../scripts/agent45-rank4-position-summary.cjs');

function fixture(){
  const records=[];
  for(const candidateId of ['champion-reference','hood-shield',
    'temple','new-moon']){
    for(const candidateEngineSlot of ['A','B']){
      const opponentSeat=candidateEngineSlot==='A'?1:0;
      const old={decisions:3,activeRaichu:0,benchedElectrode:3,both:0};
      const positions={
        decisions:3,benchedRaichu:2,benchedElectrode:3,bothBenched:1,
        bothBenchedWithThreeDiscardSpecial:1,
        bothBenchedWithHeldEscapeRope:1,heldEscapeRopePrizeWindow:1,
        bothBasicPredecessorsVisible:1,heldRaichuEvolution:1,
        heldElectrodeEvolution:2
      };
      const bySeat=[{},{}];
      bySeat[opponentSeat]=old;
      const positionBySeat=[{},{}];
      positionBySeat[opponentSeat]=positions;
      records.push({
        opponentRank:4,
        trialId:candidateId+'-'+candidateEngineSlot,
        candidateId,candidateEngineSlot,status:'completed-engine-game',
        candidateActualTurn:'first',candidateAttacks:0,opponentAttacks:1,
        traceSummary:{electrodeOpportunitySummary:{
          evidenceType:'live-aichi-electrode-public-necessary-conditions-v1',
          countsBySeat:bySeat,
          positionFrontier:{
            schema:'aichi-raichu-electrode-owner-position-frontier-v1',
            countsBySeat:positionBySeat,
            nativeRetreatOrEscapeRopeLegalityVerified:false,
            opponentPrivateZonesInspected:false
          }
        }}
      });
    }
  }
  return {schemaVersion:1,seedProtocol:'decorrelated-slots-v3',
    planDigest:'test-only',records};
}

test('eight physical arms preserve owner-slot orientation and correlated counts',()=>{
  const out=rank4PositionSummary(fixture());
  assert.equal(out.trials,8);
  assert.equal(out.totals.decisions,24);
  assert.equal(out.totals.benchedRaichu,16);
  assert.equal(out.totals.bothBenched,8);
  assert.equal(out.totals.heldEscapeRopePrizeWindow,8);
  assert.equal(out.gamesWithBothBenched,8);
  assert.equal(out.gamesWithHeldRopeWindow,8);
  assert.equal(out.perTrial.filter(row=>row.sourceSeat===1).length,4);
  assert.equal(out.perTrial.filter(row=>row.sourceSeat===0).length,4);
  assert.equal(out.qualifiedGames,0);
});

test('wrong owner seat, unverified environment or action-exposure schema veto',()=>{
  const missing=fixture();
  delete missing.records[0].traceSummary.electrodeOpportunitySummary
    .positionFrontier.countsBySeat[1];
  assert.throws(()=>rank4PositionSummary(missing));
  const unfinished=fixture();
  unfinished.records[0].status='unfinished-engine-game';
  assert.throws(()=>rank4PositionSummary(unfinished));
  const overclaim=fixture();
  overclaim.records[0].traceSummary.electrodeOpportunitySummary
    .positionFrontier.nativeRetreatOrEscapeRopeLegalityVerified=true;
  assert.throws(()=>rank4PositionSummary(overclaim));
});

test('subset contradictions and repeated physical IDs veto',()=>{
  const x=fixture();
  x.records[0].traceSummary.electrodeOpportunitySummary
    .positionFrontier.countsBySeat[1].bothBenched=0;
  assert.throws(()=>rank4PositionSummary(x));
  const y=fixture();
  y.records[1].trialId=y.records[0].trialId;
  assert.throws(()=>rank4PositionSummary(y));
});
