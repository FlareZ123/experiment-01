'use strict';

const {withRank11DirectBoostShake} = require('./rank11-direct-boostshake.cjs');
const {withRank11HeldSeal} = require('./rank11-held-seal-policy.cjs');

/**
 * Give the first owner-visible eligible rank-11 opening route exclusive
 * ownership of its target resources. Both underlying policies retain their
 * original search, action and abort semantics.
 *
 * @template T
 * @param {0|1} sourceSeat
 * @param {()=>T} execute
 * @returns {{result:T,policyAudit:object}}
 */
function withRank11ExclusiveOpeners(sourceSeat,execute) {
  let selected=null;
  let blockedOtherRoute=0;
  const competing=[];
  /**
   * @param {'direct'|'held-seal'} kind
   * @param {object} state
   * @param {object} player
   * @param {{route:string,tool:string}} opening
   * @returns {boolean}
   */
  function claim(kind,state,player,opening) {
    if(selected===null) {
      selected={kind,turn:state.turn,route:opening.route,
        tool:opening.tool,sourcePlayerId:player.id};
    }
    if(selected.kind===kind)return true;
    blockedOtherRoute++;
    if(competing.length<8) {
      competing.push({kind,turn:state.turn,route:opening.route,
        blockedBy:selected.kind});
    }
    return false;
  }

  const outer=withRank11DirectBoostShake(sourceSeat,
    ()=>withRank11HeldSeal(sourceSeat,execute,
      {claimOpportunity:claim}),{
      k0AvoidAllGarbodorHeld:true,
      k1AvoidMissingGarbodor:true,
      claimOpportunity:claim
    });
  return {result:outer.result.result,policyAudit:{
    version:'rank11-exclusive-openers-v1',
    sourceSeat,selected,blockedOtherRoute,competing,
    direct:outer.policyAudit,held:outer.result.policyAudit,
    qualifiedForCompetitiveInference:false
  }};
}

module.exports={withRank11ExclusiveOpeners};
