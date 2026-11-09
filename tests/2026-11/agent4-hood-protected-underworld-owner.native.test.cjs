'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  underworldDoorAction
} = require('../../simulation/twinleaf/underworld-door-action.cjs');
const original = require('../../simulation/twinleaf/agent31-underworld-door-owner-frontier.cjs');
const policy = require('../../simulation/twinleaf/2026-11/agent4-hood-protected-underworld-owner-exception.cjs');

const SOURCE = 'Shadow Rider Calyrex VMAX CRE';
const THORNS = 'Iron Thorns ex TWM';
const HOOD = 'Stealthy Hood UNB';

function actual(scenario) {
  let ownerView = null;
  const native = underworldDoorAction({
    ...scenario,actingSeat:true,
    observeOwnerBeforePower:view => {ownerView=view;}
  });
  assert.ok(ownerView,'Genuine pinned Store must expose the actual actor view');
  assert.equal(ownerView.opponentPublic.active.printing,THORNS);
  const psychic = ownerView.ownPublic.bench[0].printed.types[0];
  const catalog = {
    basicEnergyTypes:{Psychic:psychic},
    basicEnergies:new Set(['Psychic Energy SVE'])
  };
  const markers = {activeUnspent:false,
    benchUnspent:ownerView.ownPublic.bench.map(slot =>
      slot?.printing===SOURCE)};
  const base=original.chooseUnderworldDoorRoot(ownerView,catalog,markers);
  const chosen=policy.chooseProtectedHoodUnderworld(ownerView,catalog,
    markers,original.chooseUnderworldDoorRoot);
  return {ownerView,native,base,chosen};
}
test('real pinned native Hood protected Underworld resolves Energy and two draws',()=>{
  const outcome=actual({hood:true,jammer:false,active:false,
    stadium:'Sky Field ROS'});
  assert.equal(outcome.base,null,
    'Shared conservative owner policy abstains on all active Thorns');
  assert.equal(outcome.chosen?.position,'bench');
  assert.equal(outcome.chosen?.benchIndex,0);
  assert.deepEqual(outcome.ownerView.ownPublic.bench[0].tools,[HOOD]);
  assert.equal(outcome.native.allowed,true);
  assert.equal(outcome.native.powerListed,true);
  assert.equal(outcome.native.attached,1);
  assert.equal(outcome.native.drawn,2);
});
test('same real native source without Hood remains suppressed by Initialization',()=>{
  const outcome=actual({hood:false,jammer:false,active:false,
    stadium:'Sky Field ROS'});
  assert.equal(outcome.chosen,null);
  assert.equal(outcome.native.allowed,false);
  assert.equal(outcome.native.powerListed,false);
  assert.equal(outcome.native.attached,0);
});
test('real native Jamming Tower shuts off the protected Hood counterline',()=>{
  const outcome=actual({hood:true,jammer:false,active:false,
    stadium:'Jamming Tower TWM'});
  assert.equal(outcome.chosen,null);
  assert.equal(outcome.native.allowed,false);
  assert.equal(outcome.native.powerListed,false);
  assert.equal(outcome.native.attached,0);
});

test('native owner pays held Hood onto Bench and then succeeds at Underworld',()=>{
  let viewBefore=null;
  const native=underworldDoorAction({
    hood:false,heldHoodBeforePower:true,payHeldHoodBeforePower:true,
    jammer:false,active:false,stadium:'Sky Field ROS',actingSeat:true,
    observeOwnerBeforePower:view=>{viewBefore=view;}
  });
  assert.ok(viewBefore);
  const source=viewBefore.ownPublic.bench[0];
  assert.equal(source.printing,SOURCE);
  assert.deepEqual(source.tools,[]);
  const intent=policy.chooseHoodToolPreparation(viewBefore,{
    toolPrintings:new Set([HOOD])
  });
  assert.deepEqual(intent,{
    kind:'attach-tool-candidate',printing:HOOD,
    handIndex:1,slot:'bench',index:0
  });
  assert.equal(native.hoodPayment.actualPhysicalToolAttached,true);
  assert.equal(native.hoodPayment.actualPhysicalToolLeavesHand,true);
  assert.equal(native.hoodPayment.handBefore,2);
  assert.equal(native.hoodPayment.handAfter,1);
  assert.equal(native.hoodPayment.sourceBenchToolCount,1);
  assert.deepEqual(native.hoodPayment.pendingPrompts,[]);
  assert.equal(native.allowed,true);
  assert.equal(native.powerListed,true);
  assert.equal(native.attached,1);
  assert.equal(native.drawn,2);
});
