'use strict';
const path = require('node:path');
const root = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(root,name));
const {SpentGxAwareChooseAttackPromptResolver} =
  require('./spent-gx-copy-prompt-resolver.cjs');

/**
 * Combine the already-tested Agent12 spent-GX correction with whichever
 * copied-attack resolver was registered first (generic or Agent37 spread).
 * After the parent policy chooses, substitute its guarded legal non-GX
 * selection iff it chose a forbidden already-spent GX payload.
 *
 * @returns {()=>void} exact registry restoration
 */
function installHeadlessSpentGxCopyPolicy() {
  const definitions = load('simple-bot/simple-bot-definitions');
  const {ChooseAttackPrompt} = load('game/store/prompts/choose-attack-prompt');
  const {GamePhase} = load('game/store/state/state');
  const {GameMessage} = load('game/game-message');
  const registry=definitions.allPromptResolvers;
  const i=registry.findIndex(Ctor =>
    Ctor.name==='ChooseAttackPromptResolver' ||
    Ctor.name==='SpreadAwareCopyResolver');
  if(i<0)throw new Error('Missing pinned choice resolver composition point');
  const parent=registry[i];
  class SpentGxIntegratedCopyResolver extends parent {
    /** @param {object} state @param {object} player @param {object} prompt */
    resolvePrompt(state,player,prompt){
      const selected=super.resolvePrompt(state,player,prompt);
      if(player.usedGX!==true ||
          state.phase!==GamePhase.ATTACK ||
          !(prompt instanceof ChooseAttackPrompt) ||
          prompt.message!==GameMessage.CHOOSE_ATTACK_TO_COPY ||
          !selected?.result?.gxAttack){
        return selected;
      }
      return SpentGxAwareChooseAttackPromptResolver.prototype.resolvePrompt
        .call(this,state,player,prompt);
    }
  }
  registry[i]=SpentGxIntegratedCopyResolver;
  return ()=>{registry[i]=parent;};
}
module.exports={installHeadlessSpentGxCopyPolicy};
