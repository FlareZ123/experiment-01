'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {underworldDoorAction}=
  require('../../simulation/twinleaf/underworld-door-action.cjs');

for(const scenario of [
  {stadium:'Sky Field ROS'},
  {sourceTool:'Float Stone BKT'},
  {stadium:'Thunder Mountain Prism Star LOT'},
  {stadium:'Tropical Beach BWP',sourceTool:'Float Stone BKT'}
]){
  test('native manual Basic Psychic fallback after proven blocked Underworld: '+
      JSON.stringify(scenario),()=>{
    const native=underworldDoorAction({
      hood:false,jammer:false,active:false,actingSeat:true,
      ...scenario,manualActiveEnergyIfV3Veto:true
    });
    assert.equal(native.allowed,false,
      'Opposing Active Iron Thorns still suppresses Underworld');
    assert.equal(native.powerListed,false);
    assert.equal(native.attached,0,
      'No blocked Underworld attachment to Bench occurred');
    assert.ok(native.manualFallback);
    assert.equal(native.manualFallback.decisionReason,
      'known-ability-inert-stadium-tool-lock');
    assert.equal(native.manualFallback.attachedPhysicalCard,true,
      JSON.stringify(native.manualFallback));
    assert.equal(native.manualFallback.activeEnergiesBefore,0);
    assert.equal(native.manualFallback.activeEnergiesAfter,1);
    assert.equal(native.manualFallback.handCountBefore,1);
    assert.equal(native.manualFallback.handCountAfter,0);
    assert.equal(native.manualFallback.nativePlayCardAccepted,true);
  });
}
