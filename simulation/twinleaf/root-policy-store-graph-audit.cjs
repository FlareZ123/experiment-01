'use strict';
const assert = require('node:assert/strict');
const {storeDataGraphFingerprint} = require('./store-data-graph-fingerprint.cjs');
const {firstMismatch} = require('./source-state-continuity.cjs');

/**
 * Observe the actual first AddPlayerAction Store during each live bot decision.
 * Exact own-data Store graph equality is a stronger leakage probe than zone or
 * Card history snapshots, but closures and inherited methods remain opaque.
 * This wrapper only observes. It restores both method descriptors in finally.
 * @template T
 * @param {Function} Store Upstream root game Store class.
 * @param {Function} Bot SimpleTacticsAi class.
 * @param {()=>T} work Run one genuine source-dealt full game.
 * @returns {{result:T,rootPolicyCalls:number,otherPolicyCalls:number,changes:object[],graphContract:string}}
 */
function withRootPolicyStoreGraphAudit(Store,Bot,work) {
  const storeDesc=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const botDesc=Object.getOwnPropertyDescriptor(Bot.prototype,'decodeNextAction');
  assert.equal(typeof storeDesc?.value,'function');
  assert.equal(typeof botDesc?.value,'function');
  assert.equal(typeof work,'function');
  let root=null,rootPolicyCalls=0,otherPolicyCalls=0;
  const changes=[];
  let graphContract=null;
  const dispatch=function(...args) {
    if(!root && args[0]?.constructor?.name==='AddPlayerAction') root=this;
    return storeDesc.value.apply(this,args);
  };
  const decode=function(state,...args) {
    if(!root || state!==root.state) {
      otherPolicyCalls++;
      return botDesc.value.call(this,state,...args);
    }
    rootPolicyCalls++;
    const before=storeDataGraphFingerprint(root,{includeGraph:true});
    graphContract=before.schema;
    const turn=state.turn;
    let action;
    try {return (action=botDesc.value.call(this,state,...args));}
    finally {
      const after=storeDataGraphFingerprint(root,{includeGraph:true});
      assert.equal(after.schema,before.schema);
      if(before.digest!==after.digest) {
        changes.push({call:rootPolicyCalls,turn,
          chosenAction:action?.constructor?.name??null,
          previousDigest:before.digest,currentDigest:after.digest,
          firstDifference:firstMismatch(before.graph,after.graph)});
      }
    }
  };
  Object.defineProperty(Store.prototype,'dispatch',{...storeDesc,value:dispatch});
  Object.defineProperty(Bot.prototype,'decodeNextAction',{...botDesc,value:decode});
  let result;
  try {result=work();}
  finally {
    Object.defineProperty(Bot.prototype,'decodeNextAction',botDesc);
    Object.defineProperty(Store.prototype,'dispatch',storeDesc);
  }
  return {result,rootPolicyCalls,otherPolicyCalls,changes,graphContract,
    liveStoreOnly:true,sourceReplayMechanicsVerified:false,
    qualifiedForCompetitiveInference:false};
}
module.exports={withRootPolicyStoreGraphAudit};
