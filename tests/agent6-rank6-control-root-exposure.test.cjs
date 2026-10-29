'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {rank6ControlExposure}=
  require('../simulation/evaluation/agent6-rank6-control-root-exposure.cjs');
const root=(playerSlot,action,card)=>({playerSlot,action,card});

test('zero attacks can coexist with multiple intentional LO actions',()=>{
  const rows=[
    root(1,'PlayCardAction','Crushing Hammer'),
    root(1,'PlayCardAction','Plumeria'),
    root(1,'PlayCardAction','Guzma'),
    root(1,'PlayCardAction',"Team Rocket's Handiwork"),
    root(1,'PlayCardAction','Lusamine'),
    root(0,'AttackAction'),
    root(0,'PlayCardAction','Crushing Hammer')
  ];
  const r=rank6ControlExposure(rows,1);
  assert.equal(r.attacks,0);
  assert.equal(r.groups.energyDenial.acceptedRootCount,2);
  assert.equal(r.groups.trapAccess.acceptedRootCount,1);
  assert.equal(r.groups.milling.acceptedRootCount,1);
  assert.equal(r.groups.sustain.acceptedRootCount,1);
  assert.equal(r.competitiveQualified,false);
});

test('an irrelevant card play cannot be credited to denial',()=>{
  const r=rank6ControlExposure([
    root(0,'PlayCardAction','Plumeria'),
    root(0,'ResolvePromptAction','Crushing Hammer'),
    root(0,'PlayCardAction','Forest Seal Stone')
  ],0);
  assert.equal(r.groups.energyDenial.acceptedRootCount,1);
  assert.equal(r.groups.milling.acceptedRootCount,0);
});

test('source physical identity and roots are required',()=>{
  assert.throws(()=>rank6ControlExposure([],2));
  assert.throws(()=>rank6ControlExposure(null,0));
});
