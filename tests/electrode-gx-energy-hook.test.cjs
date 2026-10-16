'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {runCase}=require('../simulation/twinleaf/electrode-gx-ability-contract.cjs');
const {installElectrodeGXEnergyHook}=
  require('../simulation/twinleaf/electrode-gx-energy-hook.cjs');

test('Electrode-GX must attach all five available or reject activation',()=>{
  const restore=installElectrodeGXEnergyHook();
  try {
    assert.equal(installElectrodeGXEnergyHook(),restore);
    const valid=runCase(5);
    assert.equal(valid.transferred,5);
    assert.equal(valid.remainingEnergy,0);
    assert.equal(valid.opponentPrizesTaken,2);
    assert.throws(()=>runCase(4),/./);
    assert.throws(()=>runCase(0),/./);
  } finally {
    restore();
  }
});

test('Electrode rejects blocked recipients',()=>{
 const restore=installElectrodeGXEnergyHook();
 try { assert.throws(()=>runCase(0,true)); assert.throws(()=>runCase(0,true,true)); }
 finally { restore(); }
});

test('Electrode rejects partial discard and bot decisions',()=>{
 const restore=installElectrodeGXEnergyHook();
 try { assert.throws(()=>runCase(1,false,false,2)); assert.throws(()=>runCase(0,false,true)); }
 finally { restore(); }
});
