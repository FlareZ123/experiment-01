'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {ownerApexPublicGates}=require('../simulation/evaluation/agent8-rank13-apex-public-conjunction.cjs');
test('two Double Dragon Energy cards can satisfy the public cost',()=>{
const x=ownerApexPublicGates({turn:12,activePrinting:'Regidrago VSTAR SIT',activeAttachedEnergyPrintings:['Double Dragon Energy ROS','Double Dragon Energy ROS'],eligiblePublicDragonDiscard:['Dragapult ex TWM'],templeOfSinnohPublicInPlay:false});
assert.equal(x.allThreeNecessaryPublicGates,true);
});
