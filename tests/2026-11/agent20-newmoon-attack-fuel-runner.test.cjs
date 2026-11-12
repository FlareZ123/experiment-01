'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {comparePayments,compareSettlements,discardSummary}=
  require('../../simulation/evaluation/2026-11/agent20-newmoon-perfection-attack-fuel-fresh-eight.cjs');

test('pairs changed native discard payments by physical seat',()=>{
  const control={records:[{
    id:'rank5:seed1:A',seed:1,candidateSeat:0,sourceSeat:1,
    handDiscardAudit:{attackFuelSelected:0,selections:[
      {seat:0,turn:2,promptId:7,requiredCount:2,printings:['Trainer A','Psychic Energy']},
      {seat:1,turn:3,promptId:8,requiredCount:1,printings:['Trainer B']}
    ]}
  }]};
  const treatment={records:[{
    id:'rank5:seed1:A',seed:1,candidateSeat:0,sourceSeat:1,
    handDiscardAudit:{attackFuelSelected:1,selections:[
      {seat:0,turn:2,promptId:7,requiredCount:2,printings:['Trainer A','Trainer C']},
      {seat:1,turn:3,promptId:8,requiredCount:1,printings:['Trainer B']}
    ]}
  }]};
  const [row]=comparePayments([control,treatment]);
  assert.equal(row.candidateAcceptedChangedPayments,1);
  assert.equal(row.sourceAcceptedChangedPayments,0);
  assert.equal(row.acceptedChangedPayments[0].actorRole,'candidate');
  assert.deepEqual(row.acceptedChangedPayments[0].controlPrintings,
    ['Trainer A','Psychic Energy']);
  assert.deepEqual(row.acceptedChangedPayments[0].treatmentPrintings,
    ['Trainer A','Trainer C']);
});

test('preserves unmatched treatment prompt selections after divergence',()=>{
  const control={records:[{
    id:'rank5:seed2:B',seed:2,candidateSeat:1,sourceSeat:0,
    handDiscardAudit:{attackFuelSelected:0,selections:[]}
  }]};
  const treatment={records:[{
    id:'rank5:seed2:B',seed:2,candidateSeat:1,sourceSeat:0,
    handDiscardAudit:{attackFuelSelected:1,selections:[
      {seat:1,turn:4,promptId:91,requiredCount:2,printings:['Trainer D','Energy']}
    ]}
  }]};
  const [row]=comparePayments([control,treatment]);
  assert.equal(row.unmatchedTreatmentSelections.length,1);
  assert.equal(row.acceptedChangedPayments.length,0);
  assert.equal(row.treatmentAttackFuelSelected,1);
});

test('counts settled Perfection declarations separately from ordinary roots',()=>{
  const base={
    id:'rank5:seed3:A',seed:3,candidateSeat:0,sourceSeat:1,
    fullFingerprint:'full',sourceFingerprint:'source',
    physicalTapeSha256:'physical',
    candidateAttackSettlement:{
      declarations:1,settled:0,withImmediateSourceReturn:0,
      attacks:[{attackName:'Poltergeist',triggerAction:'ResolvePromptAction',
        settledPromptChain:false,nextSourceRoot:null}]
    },
    sourceAttackSettlement:{declarations:0,settled:0}
  };
  const control={records:[{...base}]};
  const treatment={records:[{
    ...base,physicalTapeSha256:'physical-treatment',
    candidateAttackSettlement:{
      declarations:1,settled:1,withImmediateSourceReturn:1,
      attacks:[{attackName:'Poltergeist',triggerAction:'ResolvePromptAction',
        settledPromptChain:true,nextSourceRoot:{ordinal:30,turn:4,action:'PlayCardAction'}}]
    }
  }]};
  const repeat={records:[{...base}]};
  const [row]=compareSettlements([control,treatment,repeat]);
  assert.equal(row.controlCandidateDeclarations,1);
  assert.equal(row.treatmentCandidateDeclarations,1);
  assert.equal(row.controlCandidateSettled,0);
  assert.equal(row.treatmentCandidateSettled,1);
  assert.equal(row.candidateSettledAttackIncrease,true);
  assert.equal(row.treatmentCandidateAttackNames[0].attack,'Poltergeist');
  assert.equal(row.treatmentCandidateAttackNames[0].triggerAction,'ResolvePromptAction');
});

test('does not drop incomplete attempts when a hand-discard audit is absent',()=>{
  const [row]=discardSummary([{id:'A',records:[{
    id:'rank5:seed4:B',finished:false,error:'native abort',
    candidateSeat:0,sourceSeat:1,candidateAttackSettlement:null
  }]}]);
  assert.equal(row.attempts,1);
  assert.equal(row.auditRows,0);
  assert.equal(row.missingAuditRows.length,1);
  assert.equal(row.completedGamesMissingAudit,0);
  assert.equal(row.attackFuelSelected,0);
});
