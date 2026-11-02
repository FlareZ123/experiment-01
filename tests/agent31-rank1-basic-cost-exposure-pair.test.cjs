'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {attributeSourceSeats}=
  require('../simulation/evaluation/agent31-rank1-basic-cost-exposure-pair.cjs');

const trials=[
  {id:'1:0:A:champion-reference',rank:1,candidateId:'champion-reference',
    candidateSlot:'A',repeat:0,seed:111},
  {id:'1:0:B:new-moon-lockbreaker-v1',rank:1,
    candidateId:'new-moon-lockbreaker-v1',
    candidateSlot:'B',repeat:0,seed:222}
];
function entry(gameId,seat,hasPaid){
  return {
    gameId,seat,heldTurns:2,heldRoots:4,
    heldTurnsWithBenchEnergy:hasPaid?2:0,
    heldTurnsWithBasicFundedBenchAttack:hasPaid?1:0,
    heldTurnsWithPositiveBase:hasPaid?1:0,
    heldTurnsWithTargetAndFundedAttack:hasPaid?1:0,
    heldTurnsWithTargetQuotaAndFundedAttack:hasPaid?1:0,
    maxBenchEnergyCards:hasPaid?3:0,maxBasicFundedBenchAttacks:hasPaid?1:0
  };
}

test('correctly preserves both physical actor roles when source seat changes',()=>{
  const receipt=attributeSourceSeats({
    gameCount:2,perGameSeat:[
      entry(1,1,true),entry(1,0,false),
      entry(2,0,true),entry(2,1,false)
    ]
  },trials);
  assert.equal(receipt.gameOrdinalsVerified,true);
  assert.equal(receipt.source.heldTurns,4);
  assert.equal(receipt.source.heldTurnsWithBasicFundedBenchAttack,2);
  assert.equal(receipt.source.heldTurnsWithTargetQuotaAndFundedAttack,2);
  assert.equal(receipt.candidate.heldTurns,4);
  assert.equal(receipt.candidate.heldTurnsWithBasicFundedBenchAttack,0);
  assert.equal(receipt.registeredRoleRows.filter(r=>
    r.actorRole==='original-source').length,2);
});

test('shortened or malformed native game ordinal cannot be attributed to original',()=>{
  const shortened=attributeSourceSeats({
    gameCount:1,perGameSeat:[entry(1,1,true)]
  },trials);
  assert.equal(shortened.gameOrdinalsVerified,false);
  assert.equal(shortened.registeredRoleRows.length,0);
  assert.equal(shortened.source.heldTurns,0);

  const invalid=attributeSourceSeats({
    gameCount:2,perGameSeat:[entry(3,1,true)]
  },trials);
  assert.equal(invalid.gameOrdinalsVerified,false);
  assert.equal(invalid.registeredRoleRows.length,0);
});
