'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {visiblePaidRetreat,join}=
  require('../simulation/evaluation/agent42-realstore-paid-retreat-join.cjs');
const PSY='Psychic Energy MEE',VMAX='Shadow Rider Calyrex VMAX CRE';
const pok=n=>({pokemon:VMAX,energies:Array(n).fill(PSY),tools:[]});
function setup(seat=1){
  const target={rootActionOrdinal:7,playerSlot:seat,
    action:'RetreatAction',storeAccepted:true,
    declared:{benchIndex:2},publicBoardChanges:[
      {seat,position:'active',index:0,before:pok(2),after:pok(3)},
      {seat,position:'bench',index:2,before:pok(3),after:pok(0)}]};
  const row={trial:{id:'fixture-original'},
    rootActionLedger:[
      {actionOrdinal:7,playerSlot:seat,turnBefore:34,action:'RetreatAction'},
      {actionOrdinal:8,playerSlot:seat,turnBefore:34,action:'AttackAction'}],
    nativeAcceptedTargetSidecar:{events:[target]},
    sourceAttackSettlement:{attacks:[{
      actionOrdinal:8,turnBefore:34,attackName:'Max Geist',
      settledPromptChain:true,settlementCrossesClockReset:false,
      prizesBefore:[6,6],prizesAfter:seat===1?[6,5]:[5,6],
      nextSourceSameEpochProven:true}]}};
  const wrapper={exactPhysicalPaidRetreats:1,receipts:[{
    status:'EXACT_TWO_PHYSICAL_PSYCHIC_PAID_RETREAT',
    turn:34,sourceSeat:seat,benchIndex:2}]};
  return {target,row,wrapper};
}
for(const seat of [0,1])test('exact public two-Psychic root seat '+seat,()=>{
  const {target,row,wrapper}=setup(seat);
  assert.equal(visiblePaidRetreat(target,seat),true);
  const r=join(row,wrapper,seat);
  assert.equal(r.certifiedRealStorePublicPaidRetreatRoots,1);
  assert.equal(r.settledMaxGeistFollowingPaidRetreat,1);
  assert.equal(r.results[0].sourcePrizeCountAfter,5);
  assert.equal(r.results[0].independentGlobalWrapperReceiptCount,1);
  assert.equal(r.paperQualifiedGames,0);
});
test('a speculative global receipt without real accepted root proves zero',()=>{
  const {row,wrapper}=setup();
  row.rootActionLedger=[];
  const r=join(row,wrapper,1);
  assert.equal(r.certifiedRealStorePublicPaidRetreatRoots,0);
  assert.equal(r.globalWrapperPhysicalPaidRetreats,1);
});
test('unpaid Float Stone, wrong source seat and duplicate sidecar veto',()=>{
  const a=setup();
  a.target.publicBoardChanges[1].after.energies=[PSY];
  assert.equal(join(a.row,a.wrapper,1).certifiedRealStorePublicPaidRetreatRoots,0);
  const b=setup();
  b.target.playerSlot=0;
  assert.equal(join(b.row,b.wrapper,1).certifiedRealStorePublicPaidRetreatRoots,0);
  const c=setup();
  c.row.nativeAcceptedTargetSidecar.events.push(c.target);
  assert.equal(join(c.row,c.wrapper,1).certifiedRealStorePublicPaidRetreatRoots,0);
});
test('public paid root retained without unbound speculative object-count',()=>{
  const {row}=setup();
  const r=join(row,{exactPhysicalPaidRetreats:0,receipts:[]},1);
  assert.equal(r.certifiedRealStorePublicPaidRetreatRoots,1);
  assert.equal(r.results[0].independentGlobalWrapperReceiptCount,0);
  assert.equal(r.results[0].globallyWrappedIdentityClaimCannotBeAttributedToThisRoot,true);
});
test('unsettled Max Geist yields no followthrough credit',()=>{
  const {row,wrapper}=setup();
  row.sourceAttackSettlement.attacks[0].settledPromptChain=false;
  const r=join(row,wrapper,1);
  assert.equal(r.certifiedRealStorePublicPaidRetreatRoots,1);
  assert.equal(r.settledMaxGeistFollowingPaidRetreat,0);
  assert.equal(r.paidRetreatWithSameEpochReply,0);
});
