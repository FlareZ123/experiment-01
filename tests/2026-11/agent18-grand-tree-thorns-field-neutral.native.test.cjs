'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {underworldDoorAction}=require(
  '../../simulation/twinleaf/underworld-door-action.cjs');
const {
  CANONICAL,withCanonicalGrandTreeLookup
}=require('../../simulation/twinleaf/2026-11/agent18-grand-tree-printing-alias.cjs');

test('printed Grand Tree SCR preserves native Iron Thorns Initialization lock, Hood relief in both physical seats',()=>{
  const results=[];
  for(const actingSeat of [false,true]){
    let beforeBlocked=null;
    const blocked=withCanonicalGrandTreeLookup(()=>
      underworldDoorAction({
        hood:false,jammer:false,active:false,actingSeat,
        stadium:CANONICAL,
        observeOwnerBeforePower:view=>{beforeBlocked=view;}
      }));
    assert.ok(beforeBlocked);
    assert.deepEqual(beforeBlocked.opponentPublic.stadium,[CANONICAL]);
    assert.equal(beforeBlocked.opponentPublic.active.printing,'Iron Thorns ex TWM');
    assert.equal(blocked.allowed,false);
    assert.equal(blocked.powerListed,false);
    let beforeHood=null;
    const relieved=withCanonicalGrandTreeLookup(()=>
      underworldDoorAction({
        hood:true,jammer:false,active:false,actingSeat,
        stadium:CANONICAL,
        observeOwnerBeforePower:view=>{beforeHood=view;}
      }));
    assert.ok(beforeHood);
    assert.deepEqual(beforeHood.opponentPublic.stadium,[CANONICAL]);
    assert.deepEqual(beforeHood.ownPublic.bench[0].tools,['Stealthy Hood UNB']);
    assert.equal(relieved.allowed,true);
    assert.equal(relieved.attached,1);
    assert.equal(relieved.drawn,2);
    results.push({actingSeat,stadium:CANONICAL,
      blockedPowerListed:blocked.powerListed,
      blockedAllowed:blocked.allowed,
      hoodPowerAllowed:relieved.allowed,
      hoodAttached:relieved.attached,hoodDrawn:relieved.drawn});
  }
  console.log('AGENT18_GRAND_TREE_THORNS_LOCK',JSON.stringify(results));
});
