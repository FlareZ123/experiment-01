'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {reconciledTurnCosts:solve}=require('./shared_turn_costs.cjs');
const empty=()=>({tm:0,float:0,col:0,rope:0,pump:0,carrier:0});
function input(power=[],donation=[],override={}){
 return {powerActions:power,donationActions:donation,
  hand:{...empty(),pump:4,tm:1},discard:{...empty()},
  dowsingAvailable:true,fodder:2,...override};
}
const pump=(n)=>Array.from({length:n},(_,i)=>({kind:'damage-pump',from:'donor',moves:[{id:'egg',counters:1}],knocked:i%2?[`egg${i}`]:[]}));
test('four real Pumps available with Dowsing used to recover missing TM',()=>{
 const r=solve(input([{kind:'dowsing',trainer:'tm'},{kind:'attach-tm',id:'m'}],pump(4),
   {hand:{...empty(),pump:4},discard:{...empty(),tm:1}}));
 assert.equal(r.status,'feasible-resource-trace');
 assert.equal(r.dowsingUsed,true);assert.equal(r.spent.pump,4);assert.equal(r.spent.tm,1);
});
test('five Pumps require same Dowsing as discarded TM and cannot be combined',()=>{
 const r=solve(input([{kind:'dowsing',trainer:'tm'},{kind:'attach-tm',id:'m'}],pump(5),
   {hand:{...empty(),pump:4},discard:{...empty(),tm:1}}));
 assert.equal(r.status,'infeasible');assert.equal(r.reason,'DOWSING_ALREADY_SPENT');
 assert.equal(r.at,6);
});
test('one Dowsing can recover the fifth Pump if TM is already in hand',()=>{
 const r=solve(input([{kind:'attach-tm',id:'m'}],pump(5)));
 assert.equal(r.status,'feasible-resource-trace');assert.equal(r.spent.pump,5);
 assert.equal(r.tape.filter(a=>a.kind==='dowsing').length,1);
 assert.deepEqual(r.tape.filter(a=>a.kind==='dowsing')[0],
  {kind:'dowsing',trainer:'pump',implicit:true,at:5});
});
test('one Dowsing cannot be reused for a sixth Pump even if test passes bad count',()=>{
 const r=solve(input([],pump(6)));
 assert.equal(r.status,'infeasible');assert.equal(r.reason,'DOWSING_ALREADY_SPENT');
});
test('two Rescue Carriers and four Pumps can be paid, third cannot',()=>{
 const donor=[...pump(4),{kind:'rescue-carrier',ids:['eggA']},{kind:'rescue-carrier',ids:['eggB']}];
 const r=solve(input([],donor,{hand:{...empty(),pump:4,carrier:2}}));
 assert.equal(r.status,'feasible-resource-trace');assert.equal(r.spent.carrier,2);
 const r2=solve(input([],donor.concat({kind:'rescue-carrier',ids:['eggA']}),
  {hand:{...empty(),pump:4,carrier:2}}));
 assert.equal(r2.status,'infeasible');assert.equal(r2.reason,'ITEM_NOT_IN_HAND');
});
test('Koko tool discard becomes eligible for a later explicit Dowsing',()=>{
 const r=solve(input([{kind:'dance'},{kind:'dowsing',trainer:'float'},
   {kind:'attach-float',id:'m'}],[],{
   hand:{...empty()},discard:{...empty()},equippedTools:{koko:'float'},kokoId:'koko'}));
 assert.equal(r.status,'feasible-resource-trace');assert.equal(r.spent.float,1);
});
test('does not invent a Koko tool discard without an identified physical Koko',()=>{
 const r=solve(input([{kind:'dance'}],[],{equippedTools:{koko:'float'}}));
 assert.equal(r.status,'unsupported');assert.equal(r.reason,'KOKO_ID_NOT_SUPPLIED');
});
test('rejects missing starter Trainer, impossible counts, two-card costs and phase inversion',()=>{
 assert.equal(solve(input([{kind:'attach-tm',id:'m'}],[],{hand:{...empty(),pump:4}})).reason,
   'ITEM_NOT_IN_HAND');
 assert.equal(solve(input([],[],{hand:{...empty(),pump:5}})).reason,'TRAINER_INVENTORY');
 assert.equal(solve(input([{kind:'dowsing',trainer:'tm'}],[],
  {hand:{...empty()},discard:{...empty(),tm:1},fodder:1})).reason,'INSUFFICIENT_DOWSING_FODDER');
 assert.equal(solve(input([{kind:'dance'}],[],{kokoId:'koko',equippedTools:{koko:'fss'}})).reason,
   'FSS_DISCARD_NOT_MODELED');
 assert.equal(solve(input([], [{kind:'attach-tm',id:'m'}])).reason,
   'POWER_ACTION_AFTER_DONATION_BOUNDARY');
});
