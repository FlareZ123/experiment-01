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
