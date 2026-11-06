'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {auditOwnerSeekerPasses} =
  require('../scripts/agent31-postgust-seeker-census.cjs');

function row({seat=1,withSeeker=true,priorGuzma=true,funded=true,root=30,turn=6}={}) {
  const hand=withSeeker?['VS Seeker PHF']:[];
  const bench=[{name:'Shadow Rider Calyrex VMAX',
    printing:'Shadow Rider Calyrex VMAX CRE',
    energyCards:funded?['Psychic Energy','Psychic Energy','Psychic Energy']:['Psychic Energy']}];
  const board=[{active:{printing:'Crobat V DAA'},bench:[]},
    {active:{printing:'Dialga-GX UPR'},bench}];
  if(seat===0)board.reverse();
  return {trial:{id:'11:3:B:champion-reference'},candidateSeat:seat,
    rootActionLedger:[...(priorGuzma?[{actionOrdinal:4,playerSlot:seat,
      action:'PlayCardAction',card:'Guzma',turnBefore:2}]:[]),
      {actionOrdinal:root,playerSlot:seat,action:'PassTurnAction',turnBefore:turn}],
    nativeAllOwnerPassFrontier:{completeNativePassCoverage:true,receipts:[{
      actionOrdinal:root,turn,actorSeat:seat,role:'candidate',
      ownerHandAtChosenPass:hand,ownerHandSha256:'hand',
      publicBoardSha256:'board',publicBoardBeforePass:board}]}};
}

test('held VS Seeker, past Guzma and funded Bench flag a possible line, not a qualified action',()=>{
  const result=auditOwnerSeekerPasses([row()]);
  assert.equal(result.earlierGuzmaAndFundedBenchPassRoots,1);
  assert.equal(result.candidateHeldSeekerPhysicalGames,1);
  assert.equal(result.competitivePaperQualifiedGames,0);
});
test('no held VS Seeker means no matched candidate Pass',()=>{
  assert.equal(auditOwnerSeekerPasses([row({withSeeker:false})]).candidateHeldSeekerPassRoots,0);
});
test('past Guzma is only an archive clue, not a discard-state certificate',()=>{
  const result=auditOwnerSeekerPasses([row({priorGuzma:false})]);
  assert.equal(result.earlierGuzmaHeldSeekerPassRoots,0);
  assert.equal(result.candidateHeldSeekerPassRoots,1);
});
test('funded Bench is counted independently from VS Seeker and earlier Guzma',()=>{
  const result=auditOwnerSeekerPasses([row({funded:false})]);
  assert.equal(result.earlierGuzmaHeldSeekerPassRoots,1);
  assert.equal(result.earlierGuzmaAndFundedBenchPassRoots,0);
});
test('owner-only board handling supports either physical seat',()=>{
  assert.equal(auditOwnerSeekerPasses([row({seat:0})]).earlierGuzmaAndFundedBenchPassRoots,1);
});
test('retains unobserved error row in source group denominator',()=>{
  const bad={trial:{id:'5:0:A:new-moon-lockbreaker-v1'},
    rootActionLedger:[],nativeAllOwnerPassFrontier:null,
    error:{message:'UNKNOWN_POWER'}};
  const result=auditOwnerSeekerPasses([row(),bad]);
  assert.equal(result.sourceSeedGroups,2);
  assert.equal(result.registeredGameRows,2);
  assert.equal(result.rowsWithoutCompletePassCoverage.length,1);
});
test('requires actual accepted Pass root, actor, and turn, rejecting invalid joins',()=>{
  const invalid=row();
  invalid.rootActionLedger.at(-1).action='AttackAction';
  assert.throws(()=>auditOwnerSeekerPasses([invalid]),/PassTurnAction/);
  const wrongSeat=row();
  wrongSeat.rootActionLedger.at(-1).playerSlot=0;
  assert.throws(()=>auditOwnerSeekerPasses([wrongSeat]),/0 !== 1/);
});
test('repeated Pass roots are correlated within one physical game',()=>{
  const repeated=row();
  repeated.nativeAllOwnerPassFrontier.receipts.push({
    ...repeated.nativeAllOwnerPassFrontier.receipts[0],actionOrdinal:33,turn:8});
  repeated.rootActionLedger.push({
    actionOrdinal:33,playerSlot:1,action:'PassTurnAction',turnBefore:8});
  const result=auditOwnerSeekerPasses([repeated]);
  assert.equal(result.candidateHeldSeekerPassRoots,2);
  assert.equal(result.candidateHeldSeekerPhysicalGames,1);
  assert.equal(result.sourceSeedGroups,1);
});
test('already played Guzma in the same turn is not a past-turn retrieval signal',()=>{
  const same=row();
  same.rootActionLedger[0].turnBefore=6;
  assert.equal(auditOwnerSeekerPasses([same]).earlierGuzmaHeldSeekerPassRoots,0);
});
