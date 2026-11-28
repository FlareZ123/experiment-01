'use strict';
// Source-real bounded composition: two individually solved rank-26 models can
// demand the same one Dowsing Machine. No native Store/game is represented.
const test=require('node:test');
const assert=require('node:assert/strict');
const {planPowerMobility}=require('./power_mobility_plan.cjs');
const {planDonationResources}=require('./donk_resource_plan.cjs');
const {reconciledTurnCosts}=require('./shared_turn_costs.cjs');
const b=(kind,active)=>({id:kind,kind,active,tool:'',energy:[],counters:0});
const h=kind=>({id:kind,kind});
const e=(id,zone,counters=0)=>({id,zone,counters});
function power(board,handBasics,trainersHand){
 return planPowerMobility({
  firstTurnGoingFirst:true,ropeSafe:true,wobLocked:false,
  itemsPlayable:true,toolsPlayable:true,ruins:true,manualAvailable:true,
  retreatAvailable:true,dowsingAvailable:true,debutEffective:true,fodder:2,
  lightningHand:0,lightningDiscard:1,dceHand:1,attackerId:'M',
  board,handBasics,trainersHand,maxStates:100000
 });
}
function donation(p){
 return planDonationResources({
  finishReady:true,itemsPlayable:true,riskyRuinsActive:true,
  opponentBenchCount:0,propagationAvailable:true,farewellAvailable:true,
  opponentPrizes:6,pumps:5,carriers:0,drawCapacity:20,
  eggs:[e('e0','H'),e('e1','X')],unown:[e('u0','H'),e('u1','H')],
  fixed:[e('M','A',p.final.board.find(x=>x.id==='M').counters),
         e('S','B',p.final.board.find(x=>x.id==='S').counters)],
  handDonors:[],maxStates:100000
 });
}
function reconcile(p,d,hand){
 return reconciledTurnCosts({
  powerActions:p.actions,donationActions:d.actions,
  hand,discard:{},fodder:2,dowsingAvailable:true,kokoId:'K'
 });
}
test('independent legal setup and five-Prize donation solvers cannot both spend Dowsing',()=>{
 const p=power([b('M',true)],[h('K'),h('S')],{rope:1,tm:1});
 assert.equal(p.status,'solved');
 assert.equal(p.dowsingUsed,true);
 assert.equal(p.actions.filter(a=>a.kind==='escape-rope').length,2);
 const d=donation(p);
 assert.equal(d.status,'solved');assert.equal(d.pumpsUsed,5);
 const r=reconcile(p,d,{tm:1,rope:1,pump:4});
 assert.equal(r.status,'infeasible');
 assert.equal(r.reason,'DOWSING_ALREADY_SPENT');
 // This is a real joint physical-resource counterexample; it does not
 // establish that the whole game is impossible with different actions.
});
test('same five-Prize donation remains resource-feasible after Float pivot saves Dowsing',()=>{
 const p=power([b('S',true)],[h('M'),h('K')],{float:1,tm:1});
 assert.equal(p.status,'solved');
 assert.equal(p.dowsingUsed,false);
 assert.equal(p.actions.filter(a=>a.kind==='dance').length,1);
 const d=donation(p);
 assert.equal(d.status,'solved');assert.equal(d.pumpsUsed,5);
 const r=reconcile(p,d,{tm:1,float:1,pump:4});
 assert.equal(r.status,'feasible-resource-trace');
 assert.equal(r.dowsingUsed,true);
 assert.equal(r.spent.pump,5);
 assert.equal(r.tape.filter(a=>a.kind==='dowsing').length,1);
 assert.equal(r.tape.find(a=>a.kind==='dowsing').trainer,'pump');
});
