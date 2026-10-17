'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {classify} = require('../simulation/twinleaf/meloetta-rank26-firstturn-source-window.cjs');

/** @returns {object} Public root snapshot with one physically active opponent. */
function state() {
  return {
    attackerSeat:0,firstTurnSlot:0,
    attackerActive:'Meloetta ex SV11B',
    attackerBench:['Crobat V DAA'],
    attackerHand:['Canceling Cologne ASR','Order Pad UPR',
      'Forest Seal Stone SIT','Damage Pump LOR','Risky Ruins MEG'],
    defenderActive:'Iron Thorns ex TWM',
    defenderBench:[]
  };
}
test('classify the authenticated physical starting player and direct Cologne hand',()=>{
  assert.deepEqual(classify(state()),{
    rank26ActuallyFirst:true,
    defenderLoneIronThorns:true,
    meloettaInitiallyActive:true,
    directCologne:true,
    orderPadsVisible:1,
    stoneVisible:true,
    crobatAvailableFromHandOrBench:true,
    riskRuinsVisible:true,
    pumpsVisible:1
  });
});
test('a second defending Basic and opposite first seat revoke the initial target',()=>{
  const s=state();
  s.firstTurnSlot=1;
  s.defenderBench=['Iron Thorns ex TWM'];
  s.attackerHand=['Damage Pump LOR','Damage Pump LOR'];
  const x=classify(s);
  assert.equal(x.rank26ActuallyFirst,false);
  assert.equal(x.defenderLoneIronThorns,false);
  assert.equal(x.directCologne,false);
  assert.equal(x.orderPadsVisible,0);
  assert.equal(x.pumpsVisible,2);
});
test('absence of Meloetta in Active Spot is detected independently of access',()=>{
  const s=state();
  s.attackerActive='Exeggcute PLF';
  assert.equal(classify(s).meloettaInitiallyActive,false);
  assert.equal(classify(s).directCologne,true);
});
