'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {blockedDowsingProposal}=
  require('../simulation/twinleaf/rank26-dowsing-hold.cjs');
function fixture(){
  const own={id:101,
    hand:{cards:[{name:'Dowsing Machine',fullName:'Dowsing Machine PLS'},
      {name:'Bicycle',fullName:'Bicycle PLS'}]},
    discard:{cards:[{name:'Iono',fullName:'Iono PAL'}]}};
  const state={turn:1,activePlayer:0,phase:12,players:[own,{id:202}],prompts:[]};
  const proposal={type:'PLAY_CARD_ACTION',handIndex:0};
  return {own,state,proposal};
}
test('veto only proposed source firstturn Dowsing with discarded Iono',()=>{
  const {own,state,proposal}=fixture();
  assert.deepEqual(blockedDowsingProposal(state,own,0,proposal,12),{
    card:'Dowsing Machine PLS',
    reason:'Hold single ACE SPEC instead of immediately reclaiming firstturn-discarded Iono'
  });
});
test('accept other source Items, different seats and absent Iono',()=>{
  const {own,state,proposal}=fixture();
  proposal.handIndex=1;
  assert.equal(blockedDowsingProposal(state,own,0,proposal,12),null);
  proposal.handIndex=0;
  assert.equal(blockedDowsingProposal(state,own,1,proposal,12),null);
  own.discard.cards=[];
  assert.equal(blockedDowsingProposal(state,own,0,proposal,12),null);
});
test('respect player turn, native phase, outstanding prompts and action class',()=>{
  const {own,state,proposal}=fixture();
  state.turn=2;
  assert.equal(blockedDowsingProposal(state,own,0,proposal,12),null);
  state.turn=1;state.phase=13;
  assert.equal(blockedDowsingProposal(state,own,0,proposal,12),null);
  state.phase=12;state.prompts.push({result:undefined});
  assert.equal(blockedDowsingProposal(state,own,0,proposal,12),null);
  state.prompts=[];proposal.type='ATTACK_ACTION';
  assert.equal(blockedDowsingProposal(state,own,0,proposal,12),null);
});
