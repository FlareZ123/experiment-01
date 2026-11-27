'use strict';
/**
 * Branch-scoped drop-in adapter for createV3WorkerDecisionResolver's
 * promptProjection dependency. In the canonical runner, this is the
 * separately injected promptProjection object; it is not globally patched.
 *
 * Only the exact original rank-29 opponent's source-authenticated
 * Eri/Sidney/Team Skull opponent-hand reveal continuation diverges from
 * baseline. All other prompt projection, token dispatch and host-only
 * resolution remain the pinned canonical implementation.
 *
 * Not installed on main and not a native matchup qualification.
 */
const base=require('./agent36-prompt-projection.cjs');
const {
  VERSION,
  projectRank29RevealedHandPrompt
}=require('./agent4-rank29-revealed-hand-projection.cjs');

function createRank29ProjectionAdapter({opponentSeat}={}){
  if(opponentSeat!==0 && opponentSeat!==1)
    throw Error('RANK29_ADAPTER_REQUIRES_EXACT_OPPONENT_SEAT');
  return Object.freeze({
    ...base,
    projectPrompt(args){
      if(args?.actorSeat!==opponentSeat)return base.projectPrompt(args);
      return projectRank29RevealedHandPrompt({
        ...args,baseProjectPrompt:base.projectPrompt
      });
    },
    rank29RevealAdapterVersion:VERSION,
    rank29OpponentSeat:opponentSeat
  });
}
// Importing this module alone never changes the canonical implementation.
// The owning runner must explicitly create and pass a role/seat-bound adapter.
module.exports=Object.freeze({
  ...base,createRank29ProjectionAdapter,
  rank29RevealAdapterVersion:VERSION
});
