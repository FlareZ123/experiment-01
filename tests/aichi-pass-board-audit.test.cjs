'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {analyzeCandidatePassBoards}=require('../scripts/aichi-pass-board-audit.cjs');

function pokemon(name,energy=0) {
  return {name,energyCards:Array.from({length:energy},()=> 'Psychic Energy')};
}
function pass(playerSlot,board) {
  return {action:'PassTurnAction',playerSlot,publicBoardBeforePass:board};
}

test('candidate counts are separated by seat and VMAX Energy ownership',()=>{
  const boardA=[
    {active:pokemon('Latias ex',1),bench:[pokemon('Shadow Rider Calyrex VMAX'),pokemon('Dialga-GX',2)]},
    {active:pokemon('Iron Thorns ex'),bench:[]}
  ];
  const boardB=[
    {active:pokemon('Iron Thorns ex'),bench:[]},
    {active:pokemon('Shadow Rider Calyrex VMAX',3),bench:[pokemon('Latias ex')]}
  ];
  const archive={
    planDigest:'fixed',
    records:[
      {trialId:'a',candidateId:'hood',candidateEngineSlot:'A',status:'completed-engine-game',
        traceSummary:{chronologicalActionTrace:[
          pass(0,boardA),pass(1,boardA),pass(0,boardA)
        ]}},
      {trialId:'b',candidateId:'champion',candidateEngineSlot:'B',status:'unfinished-engine-game',
        traceSummary:{chronologicalActionTrace:[pass(1,boardB)]}}
    ]
  };
  const result=analyzeCandidatePassBoards(archive);
  assert.equal(result.trialCount,2);
  assert.equal(result.rows[0].candidatePassesRecorded,2);
  assert.equal(result.rows[0].passesWithVMAXInPlay,2);
  assert.equal(result.rows[0].passesWithAllVMAXWithoutEnergy,2);
  assert.equal(result.rows[0].unpoweredVMAXPassesWithEnergyElsewhere,2);
  assert.equal(result.rows[0].unpoweredVMAXPassesWithTwoOrMoreEnergyElsewhere,2);
  assert.equal(result.rows[1].candidatePassesRecorded,1);
  assert.equal(result.rows[1].passesWithAllVMAXWithoutEnergy,0);
  assert.equal(result.rows[1].status,'observed-incomplete-engine-game');
  assert.equal(result.evidenceScope.includes('no win-rate'),true);
});

test('a missing board snapshot is a diagnostic failure rather than an inferred zero',()=>{
  const result=analyzeCandidatePassBoards({records:[{
    candidateEngineSlot:'A',status:'completed-engine-game',
    traceSummary:{chronologicalActionTrace:[{action:'PassTurnAction',playerSlot:0}]}
  }]});
  assert.equal(result.rows[0].status,'missing-pass-board-snapshot');
  assert.equal(result.rows[0].candidatePassesRecorded,1);
  assert.equal(Object.hasOwn(result.rows[0],'passesWithVMAXInPlay'),false);
});

test('missing history and slot identity receive explicit statuses',()=>{
  const result=analyzeCandidatePassBoards({records:[
    {candidateEngineSlot:'A',traceSummary:{}},
    {candidateEngineSlot:'Z',traceSummary:{}}
  ]});
  assert.equal(result.rows[0].status,'missing-decision-trace');
  assert.equal(result.rows[1].status,'invalid-candidate-slot');
  assert.throws(()=>analyzeCandidatePassBoards({}),/records/);
});
