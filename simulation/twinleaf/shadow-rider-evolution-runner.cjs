'use strict';

const path=require('node:path');
const {makeShadowRiderEvolutionTactic,withShadowRiderEvolutionPriority}=
  require('./shadow-rider-evolution-priority.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Run one synchronous research experiment under the opt-in evolution tactic.
 * The tactic list is restored even when the experiment throws.
 * @template T
 * @param {()=>T} fn
 * @param {{definitions?:{allSimpleTactics:Function[]},tactic?:Function}} [options]
 * @returns {T}
 */
function withShadowRiderEvolutionCounterfactual(fn,options={}) {
  const definitions=options.definitions || require(path.join(output,
    'simple-bot/simple-bot-definitions'));
  const tactics=definitions.allSimpleTactics;
  const original=tactics.slice();
  const modified=withShadowRiderEvolutionPriority(
    {tactics:original},options.tactic).tactics;
  tactics.splice(0,tactics.length,...modified);
  try {
    return fn();
  } finally {
    tactics.splice(0,tactics.length,...original);
  }
}

/**
 * Both seats receive the identical policy when they play Shadow Rider.
 * Every other tactic is left in the original relative order.
 * @param {object} request Pinned headless runner MatchRequest.
 * @returns {object} Policy-labelled bounded match.
 */
function runShadowRiderEvolutionCounterfactual(request) {
  const proposals=[];
  const Base=makeShadowRiderEvolutionTactic();
  class ObservedShadowRiderEvolutionTactic extends Base {
    useTactic(state,player) {
      const action=super.useTactic(state,player);
      if(action) proposals.push({
        turn:state.turn,playerId:player.id,slot:action.target.slot,
        index:action.target.index,handIndex:action.handIndex
      });
      return action;
    }
  }
  const result=withShadowRiderEvolutionCounterfactual(()=>
    require('./headless.cjs').runMatch(request),{
      tactic:ObservedShadowRiderEvolutionTactic
    });
  return {
    ...result,
    policy:result.policy+'+ShadowRiderEvolutionEnergyPriority-v1',
    shadowRiderEvolutionPriority:true,
    experimentalPolicy:'ShadowRiderEvolutionEnergyPriority-v1',
    experimentalEvolutionProposals:proposals,
    proposalQualification:'Tactic emitted a candidate action; simulator may still reject it'
  };
}

module.exports={
  withShadowRiderEvolutionCounterfactual,
  runShadowRiderEvolutionCounterfactual
};
