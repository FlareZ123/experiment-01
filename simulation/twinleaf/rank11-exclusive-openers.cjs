'use strict';

const {withRank11DirectBoostShake} = require('./rank11-direct-boostshake.cjs');
const {withRank11HeldSeal} = require('./rank11-held-seal-policy.cjs');

/**
 * Create a first-eligible-route latch, independently testable without the
 * compiled game engine. Callers must establish eligibility using their
 * owner-visible game-state predicates before offering a claim.
 */
function createExclusiveClaim() {
  const audit={selected:null,blockedOtherRoute:0,competing:[]};
  /** @param {'direct'|'held-seal'} kind @param {object} state
   * @param {object} player @param {{route:string,tool:string}} opening */
  function claim(kind,state,player,opening) {
    if(audit.selected===null) {
      audit.selected={kind,turn:state.turn,route:opening.route,
        tool:opening.tool,sourcePlayerId:player.id};
    }
    if(audit.selected.kind===kind)return true;
    audit.blockedOtherRoute++;
    if(audit.competing.length<8) {
      audit.competing.push({kind,turn:state.turn,route:opening.route,
        blockedBy:audit.selected.kind});
    }
    return false;
  }
  return {claim,audit};
}

/**
 * Give the first owner-visible eligible rank-11 opening route exclusive
 * ownership of its target resources. Both underlying policies retain their
 * original search, action and abort semantics.
 * @template T
 * @param {0|1} sourceSeat
 * @param {()=>T} execute
 * @returns {{result:T,policyAudit:object}}
 */
function withRank11ExclusiveOpeners(sourceSeat,execute) {
  const {claim,audit}=createExclusiveClaim();
  const outer=withRank11DirectBoostShake(sourceSeat,
    ()=>withRank11HeldSeal(sourceSeat,execute,
      {claimOpportunity:claim}),{
      k0AvoidAllGarbodorHeld:true,
      k1AvoidMissingGarbodor:true,
      claimOpportunity:claim
    });
  return {result:outer.result.result,policyAudit:{
    version:'rank11-exclusive-openers-v1',
    sourceSeat,selected:audit.selected,
    blockedOtherRoute:audit.blockedOtherRoute,
    competing:audit.competing,
    direct:outer.policyAudit,held:outer.result.policyAudit,
    qualifiedForCompetitiveInference:false
  }};
}

module.exports={withRank11ExclusiveOpeners,createExclusiveClaim};
