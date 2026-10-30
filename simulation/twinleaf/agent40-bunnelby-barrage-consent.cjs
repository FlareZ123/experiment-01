'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {hasK0PossibleBenchEvolutionTarget,immediateBurrowDeckout}=
  require('./bunnelby-evolution-policy.cjs');

const VERSION='agent40-bunnelby-owner-consent-second-tm-v1';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(OUTPUT,name));

/**
 * Explicit owner-local Barrage consent when a *known-own-source* Stage
 * target remains possibly obtainable. This guard cannot tell whether every
 * copy is face-down Prized before the owner actually searches the deck.
 *
 * All information comes from the currently acting player's public/own hand,
 * discard, board and an externally registered 60, never the actual unknown
 * deck or opposing concealed zones. The ConfirmPrompt's generic message is
 * shared by other Abilities; this narrow resolver must remain opt-in.
 *
 * @param {object} player Actual current owner and publicly available state.
 * @param {object[]} ownSourceCards Exactly their own known printed 60.
 * @returns {boolean}
 */
function shouldConsentBunnelbyBarrage(player,ownSourceCards){
  assert.equal(ownSourceCards?.length,60);
  return player.active?.getPokemonCard()?.fullName==='Bunnelby PRC'&&
    player.active.tools?.some(c=>
      c.fullName==='Technical Machine: Evolution PAR')===true&&
    (hasK0PossibleBenchEvolutionTarget(player,ownSourceCards)||
      immediateBurrowDeckout({players:player.__publicPlayers??[]},player));
}

/**
 * Add an owner-only second-attack ConfirmPrompt response before generic
 * upstream choices. It does not select the attack or the evolution targets:
 * those are still resolved by the existing Bunnelby specialized resolvers.
 *
 * @param {object} options Pinned native SimpleBotOptions.
 * @param {object[]} ownSourceCards The acting player's known 60 templates.
 * @returns {object} Cloned bot options.
 */
function withBunnelbyBarrageConsent(options,ownSourceCards){
  assert.equal(ownSourceCards?.length,60);
  assert.ok(Array.isArray(options.promptResolvers));
  const {PromptResolver}=engine('simple-bot/prompt-resolver/prompt-resolver');
  const {ConfirmPrompt}=engine('game/store/prompts/confirm-prompt');
  const {ResolvePromptAction}=
    engine('game/store/actions/resolve-prompt-action');
  const {GameMessage}=engine('game/game-message');
  const {GamePhase}=engine('game/store/state/state');
  class BunnelbyBarrageConsentResolver extends PromptResolver {
    resolvePrompt(state,player,prompt){
      if(!(prompt instanceof ConfirmPrompt)||
         prompt.message!==GameMessage.WANT_TO_USE_ABILITY||
         state.phase!==GamePhase.ATTACK||
         !state.players?.includes(player)||
         !shouldConsentBunnelbyBarrage(player,ownSourceCards)||
         !prompt.validate(true))return;
      return new ResolvePromptAction(prompt.id,true);
    }
  }
  return {...options,promptResolvers:[
    BunnelbyBarrageConsentResolver,...options.promptResolvers
  ]};
}
module.exports={VERSION,shouldConsentBunnelbyBarrage,
  withBunnelbyBarrageConsent};
