'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {underworldDoorAction}=
  require('../../simulation/twinleaf/underworld-door-action.cjs');

test('pinned Store keeps a Hooded Benched VMAX Underworld Door live under Garbotoxin plus opponent Active Tool Jammer',()=>{
  const result=underworldDoorAction({
    hood:true,jammer:true,active:false,
    garbodorPrint:'BKP',garbodorTool:true,
    stadium:'Sky Field ROS',actingSeat:true
  });
  assert.equal(result.allowed,true);
  assert.equal(result.powerListed,true);
  assert.equal(result.attached,1);
  assert.equal(result.drawn,2);
});

test('same pinned Store board without Hood suppresses the Benched VMAX ability',()=>{
  const result=underworldDoorAction({
    hood:false,jammer:true,active:false,
    garbodorPrint:'BKP',garbodorTool:true,
    stadium:'Sky Field ROS',actingSeat:true
  });
  assert.equal(result.allowed,false);
  assert.equal(result.powerListed,false);
  assert.equal(result.attached,0);
  assert.equal(result.drawn,0);
  assert.match(result.blockedReason,/BLOCKED|CANNOT_USE_POWER|UNKNOWN_POWER/);
});
