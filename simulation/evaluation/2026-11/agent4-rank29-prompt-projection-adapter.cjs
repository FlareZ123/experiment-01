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

const adapter=Object.freeze({
  ...base,
  projectPrompt(args){
    return projectRank29RevealedHandPrompt({
      ...args,baseProjectPrompt:base.projectPrompt
    });
  },
  rank29RevealAdapterVersion:VERSION
});
module.exports=adapter;
