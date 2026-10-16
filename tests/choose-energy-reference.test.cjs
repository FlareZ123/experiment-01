'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {captureChooseEnergyReference,restoreChooseEnergyReference}=
  require('../simulation/twinleaf/choose-energy-reference.cjs');
class ChooseEnergyPrompt {
  constructor(energy,cost){this.energy=energy;this.cost=cost;this.message='CHOOSE_ENERGY';}
}
class ResolvePromptAction {constructor(result){this.result=result;}}
const entry=(fullName,provides)=>({card:{fullName},provides:provides.slice()});
const fixture=()=>new ChooseEnergyPrompt([
  entry('Double Dragon Energy ROS',[1,2]),
  entry('Double Dragon Energy ROS',[1,2]),
  entry('Psychic Energy MEE',[5])
],[1,2]);

test('duplicate printings are preserved as different EnergyMap object references',()=>{
  const start=fixture();
  const record=captureChooseEnergyReference(start,
    new ResolvePromptAction([start.energy[1],start.energy[0]]));
  assert.deepEqual(record.selections.map(s=>s.index),[1,0]);
  const replay=fixture();
  assert.deepEqual(restoreChooseEnergyReference(replay,record),
    [replay.energy[1],replay.energy[0]]);
  assert.notEqual(restoreChooseEnergyReference(replay,record)[0],replay.energy[0]);
});

test('cancel remains distinct from empty selection',()=>{
  const start=fixture();
  const n=captureChooseEnergyReference(start,new ResolvePromptAction(null));
  const e=captureChooseEnergyReference(start,new ResolvePromptAction([]));
  assert.equal(restoreChooseEnergyReference(fixture(),n),null);
  assert.deepEqual(restoreChooseEnergyReference(fixture(),e),[]);
});

test('changed cost or alternate provides blocks restoration',()=>{
  const start=fixture();
  const record=captureChooseEnergyReference(start,
    new ResolvePromptAction([start.energy[1]]));
  const changedCost=fixture();
  changedCost.cost=[5];
  assert.throws(()=>restoreChooseEnergyReference(changedCost,record),/identity/);
  const changedProvides=fixture();
  changedProvides.energy[1].provides=[2];
  assert.throws(()=>restoreChooseEnergyReference(changedProvides,record),/candidate/);
});

test('forged same-print EnergyMap object not a valid source',()=>{
  const start=fixture();
  assert.throws(()=>captureChooseEnergyReference(start,
    new ResolvePromptAction([entry('Double Dragon Energy ROS',[1,2])])),
  /absent from prompt/);
});
