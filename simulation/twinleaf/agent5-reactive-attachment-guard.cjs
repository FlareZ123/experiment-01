'use strict';

const {evaluatePublicAttachmentReaction}=
  require('./agent5-public-attachment-reaction.cjs');

const VERSION='agent5-possible-terminal-reactive-attachment-hold-v1';

/**
 * Preserve an already selected attack when a later nonterminal Energy
 * proposal has a public, immediate opponent-terminal knockout hazard.
 *
 * This conservative pure wrapper is intended for integration by the common
 * owner-root arbiter. Its default-off opt-in and any native legality/
 * complete effect settlement remain the responsibility of its caller.
 *
 * @param {object} view Detached actor observation, including only owner hand
 *   and both public boards.
 * @param {{kind:string}} first First-return native-neutral intent.
 * @param {{intent:object,receipt:object}} selected Bounded arbitration result.
 * @returns {{intent:object,receipt:object,safety:object}}
 */
function holdPotentialReactiveTerminalLoss(view,first,selected){
  const exposure=evaluatePublicAttachmentReaction(view,selected.intent);
  if(first.kind!=='attack'||!exposure.terminalLossPossible){
    return {...selected,safety:{version:VERSION,held:false,exposure}};
  }
  return {
    intent:first,
    receipt:{
      ...selected.receipt,
      version:selected.receipt.version+'+'+VERSION,
      selectedKind:first.kind,
      selectedPrinting:null,
      selectedTarget:null,
      reason:'hold-visible-opponent-terminal-buddy-pulse'
    },
    safety:{version:VERSION,held:true,exposure}
  };
}

module.exports={VERSION,holdPotentialReactiveTerminalLoss};
