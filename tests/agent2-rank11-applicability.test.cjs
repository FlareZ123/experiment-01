'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {rank11CandidateApplicability:classify}=require(
  '../simulation/evaluation/agent2-rank11-applicability.cjs');
function row(){
  return {rank:11,actualStarterSeat:0,verifiedFirstTurn:true,
    firstTurnPlayerId:101,firstTurnPlayerName:'research-A',
    firstDrawLogName:'research-A',garbotoxinWindowAudit:{
      schema:'agent41-authentic-rank11-garbotoxin-ability-window-v1',
      sourceSeat:0,candidateSeat:1,turn:2,realStoreOnly:true,
      before:{globalTurn:2,sourceGarbodorHasTool:true,
        candidateActive:'Unown AOR',candidatePrintedPowerNames:[],
        candidatePrintedPowerChecks:[],
        candidateInPlayPrintedPowerChecks:[{
          zone:'Bench',benchIndex:0,printing:'Shadow Rider Calyrex VMAX CRE',
          name:'Underworld Door',blocked:true
        }]}
    }};
}
test('Benched-only blocked Power is a positive target',()=>{
  assert.equal(classify(row(),0),'blocked-eligible-target');
});
test('no eligible Power remains countable under source lock',()=>{
  const r=row();r.garbotoxinWindowAudit.before
    .candidateInPlayPrintedPowerChecks=[];
  assert.equal(classify(r,0),'no-eligible-target');
});
test('visible unblocked Power is descriptive',()=>{
  const r=row();r.garbotoxinWindowAudit.before
    .candidateInPlayPrintedPowerChecks[0].blocked=false;
  assert.equal(classify(r,0),'eligible-no-block-observed');
});
test('candidate-first legitimate draw is separate',()=>{
  const r=row();r.actualStarterSeat=1;r.firstTurnPlayerId=202;
  r.firstTurnPlayerName='research-B';r.firstDrawLogName='research-B';
  assert.equal(classify(r,0),'candidate-first');
});
test('missing Tool or window cannot assert lock',()=>{
  const r=row();r.garbotoxinWindowAudit.before.sourceGarbodorHasTool=false;
  assert.equal(classify(r,0),'unverified');
  r.garbotoxinWindowAudit.before=null;
  assert.equal(classify(r,0),'unverified');
});
test('malformed native field and stale active-only count fail closed',()=>{
  const r=row();const b=r.garbotoxinWindowAudit.before;
  b.candidateInPlayPrintedPowerChecks[0].blocked='true';
  assert.equal(classify(r,0),'unverified');
  b.candidateInPlayPrintedPowerChecks[0].blocked=true;
  b.candidatePrintedPowerNames=['New Moon'];
  assert.equal(classify(r,0),'unverified');
});

test('an Active Power contradiction cannot fabricate a native block',()=>{
  const r=row();const before=r.garbotoxinWindowAudit.before;
  before.candidateActive='Mewtwo & Mew-GX UNM';
  before.candidatePrintedPowerNames=['Perfection'];
  before.candidatePrintedPowerChecks=[{name:'Perfection',blocked:false}];
  before.candidateInPlayPrintedPowerChecks=[{
    zone:'Active',benchIndex:null,printing:'Mewtwo & Mew-GX UNM',
    name:'Perfection',blocked:true
  }];
  assert.equal(classify(r,0),'unverified');
  before.candidatePrintedPowerChecks[0].blocked=true;
  assert.equal(classify(r,0),'blocked-eligible-target');
});
