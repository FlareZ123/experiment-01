'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {VERSION,censusSourceRoots} =
  require('../simulation/evaluation/agent8-issue25-source-action-census.cjs');
const ids = [
  '6:100:A:champion-reference',
  '6:100:A:new-moon-lockbreaker-v1',
  '6:101:B:champion-reference',
  '6:101:B:new-moon-lockbreaker-v1',
  '11:102:A:champion-reference',
  '11:102:A:new-moon-lockbreaker-v1',
  '11:103:B:champion-reference',
  '11:103:B:new-moon-lockbreaker-v1'
];
function fixture() {
  const attempts=ids.map((id,i)=>{
    const slot=id.split(':')[2], sourceSeat=slot==='A'?1:0;
    const roots=[
      {actionOrdinal:0,playerSlot:sourceSeat,
        action:'ResolvePromptAction'},
      {actionOrdinal:1,playerSlot:sourceSeat,
        action:'PassTurnAction'},
      {actionOrdinal:2,playerSlot:sourceSeat===0?1:0,
        action:'PlayCardAction'}
    ];
    if(i===0) roots.push({actionOrdinal:3,playerSlot:sourceSeat,
      action:'PlayCardAction',turnBefore:1,card:'Speed Lightning Energy'});
    return {
      id,status:i===5?'engine-error':'returned-unqualified',
      originalSourceSeat:i===5?null:sourceSeat,
      actualRawTrialId:id,publicRootActions:roots,
      publicRootActionCount:roots.length,nativeRootActionCount:roots.length,
      publicRootActionsTruncated:false,
      publicRootLedgerDigestConsistent:true
    };
  });
  return {
    schema:'agent1-issue25-joined-v4-public-execution-receipt-v1',
    registration:{expectedIds:ids,exactJoinedByTrialId:true},
    attempts
  };
}
test('both physical source seats, eight registered records and explicit error-seat inference',()=>{
  const census=censusSourceRoots(fixture());
  assert.equal(census.version,VERSION);
  assert.equal(census.records.length,8);
  assert.equal(census.acceptedRootsOriginalSource,17);
  assert.equal(census.acceptedRootsAllSeats,25);
  assert.deepEqual(census.originalSourceActionCounts,{
    ResolvePromptAction:8,PassTurnAction:8,PlayCardAction:1
  });
  assert.equal(census.originalSourceAttackActions,0);
  assert.equal(census.qualifiedGames,0);
  assert.deepEqual(census.records[5].inferredSeatFromRegistration,true);
  assert.deepEqual(census.records[5].sourceSeat,1);
  assert.deepEqual(census.records[0].plays,[{
    ordinal:3,turn:1,action:'PlayCardAction',
    printing:'Speed Lightning Energy',attack:null
  }]);
});
test('native real source attack is counted, never inferred from a prompt',()=>{
  const receipt=fixture();
  receipt.attempts[0].publicRootActions[0].action='AttackAction';
  const result=censusSourceRoots(receipt);
  assert.equal(result.originalSourceAttackActions,1);
  assert.equal(result.originalSourceActionCounts.ResolvePromptAction,7);
});
test('fail closed on truncated, duplicated, mismatched or source-seat conflicts',()=>{
  for(const variant of ['truncated','digest','duplicate','sourceSeat','ordinal','count']){
    const a=fixture();
    if(variant==='truncated')a.attempts[0].publicRootActionsTruncated=true;
    if(variant==='digest')a.attempts[0].publicRootLedgerDigestConsistent=false;
    if(variant==='duplicate')a.attempts[0].id=a.attempts[1].id;
    if(variant==='sourceSeat')a.attempts[0].originalSourceSeat=0;
    if(variant==='ordinal')a.attempts[0].publicRootActions[1].actionOrdinal=17;
    if(variant==='count')a.attempts[0].publicRootActionCount=42;
    assert.throws(()=>censusSourceRoots(a),undefined,variant);
  }
});
