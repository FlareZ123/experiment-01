'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseBellowingPayment}=require('../simulation/twinleaf/agent50-bellowing-public-payment.cjs');
const basic=new Set(['Lightning Energy MEE','Fighting Energy MEE','Darkness Energy MEE']);
function view(hp,damage){return {decisionKind:'owner-prompt',ownPublic:{active:{printing:'Raging Bolt ex TEF',energies:['Double Dragon Energy ROS','Lightning Energy MEE','Fighting Energy MEE']},bench:[{energies:['Darkness Energy MEE']}]},opponentPublic:{active:{hp,damage}}};}
test('minimal raw KO uses public Bench Basic before Active',()=>{
 const p=chooseBellowingPayment(view(230,90),basic);
 assert.equal(p.count,2);
 assert.deepEqual(p.choices.map(x=>[x.slot,x.energyIndex]),[['bench',0],['active',1]]);
});
test('insufficient Basic cards cannot offer an immediate raw KO',()=>{
 assert.equal(chooseBellowingPayment(view(281,0),basic),null);
});
test('source confirmation prevents cross-attack payment',()=>{
 const v=view(70,0);
 assert.equal(chooseBellowingPayment({...v,decisionKind:'owner-root'},basic),null);
 v.ownPublic.active.printing='Regidrago V SIT';
 assert.equal(chooseBellowingPayment(v,basic),null);
});
test('special Energy cannot substitute for Basic attack discards',()=>{
 const v=view(70,0);
 v.ownPublic.active.energies=['Double Dragon Energy ROS'];
 v.ownPublic.bench=[];
 assert.equal(chooseBellowingPayment(v,basic),null);
});
test('pure payment chooser preserves input state',()=>{
 const v=view(230,90),before=JSON.stringify(v);
 chooseBellowingPayment(v,basic);
 assert.equal(JSON.stringify(v),before);
});
