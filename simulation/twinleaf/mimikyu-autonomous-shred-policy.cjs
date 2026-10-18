'use strict';

const path=require('node:path');
const {isCopyApexShredBoard}=
  require('./mimikyu-extra-turn-shred-policy.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath @returns {any} */
const engine=modulePath=>require(path.join(output,modulePath));

/**
 * Candidate-only, turn-independent attack proposal.
 * It deliberately retains the archived board predicate's conservative
 * exact-printing, attached-Energy and Regidrago two-Prize KO preconditions.
 * This tactic never inspects hidden opponent zones or a fixed root ordinal.
 * @returns {Function}
 */
function makeAutonomousShredTactic(){
  const {SimpleTactic}=engine('simple-bot/simple-tactics/simple-tactics');
  const {AttackAction}=engine('game/store/actions/game-actions');
  return class AutonomousApexShredTactic extends SimpleTactic {
    /** @param {object} state @param {object} player */
    useTactic(state,player){
      if(!isCopyApexShredBoard(state,player))return undefined;
      return new AttackAction(player.id,'Copycat');
    }
  };
}

/**
 * Control the nested discarded-Dragon choice after the printed Copycat
 * announcement; the ordinary resolver otherwise favors Timeless-GX by
 * printed damage even after the GX attack has already been spent.
 * @returns {Function}
 */
function makeAutonomousShredResolver(){
  const {ChooseAttackPromptResolver}=
    engine('simple-bot/prompt-resolver/choose-attack-prompt-resolver');
  const {ChooseAttackPrompt}=
    engine('game/store/prompts/choose-attack-prompt');
  const {ResolvePromptAction}=
    engine('game/store/actions/resolve-prompt-action');
  const {GamePhase}=engine('game/store/state/state');
  return class AutonomousApexShredResolver extends ChooseAttackPromptResolver {
    /** @param {object} state @param {object} player @param {object} prompt */
    resolvePrompt(state,player,prompt){
      if(!(prompt instanceof ChooseAttackPrompt) ||
          prompt.playerId!==player.id || state.phase!==GamePhase.ATTACK ||
          !isCopyApexShredBoard(state,player))return undefined;
      for(const card of prompt.cards){
        if(card.fullName!=='Dialga-GX UPR' ||
            !player.discard.cards.includes(card))continue;
        const shred=card.attacks.find(attack=>attack.name==='Shred');
        if(shred&&prompt.validate(shred)){
          return new ResolvePromptAction(prompt.id,shred);
        }
      }
      return undefined;
    }
  };
}

/**
 * Idempotent opt-in policy component, installed before generic RetreatTactic.
 * No turn index, deck editing, or source-ordinal targeting is used.
 * @param {object} options Known compiled Twinleaf bot options.
 * @returns {object}
 */
function withAutonomousCopycatShredPolicy(options){
  if(options.tactics.some(t=>t.name==='AutonomousApexShredTactic'))
    return options;
  const i=options.tactics.findIndex(t=>t.name==='RetreatTactic');
  if(i<0)throw new Error('Pinned RetreatTactic required');
  return {...options,
    tactics:[...options.tactics.slice(0,i),makeAutonomousShredTactic(),
      ...options.tactics.slice(i)],
    promptResolvers:[makeAutonomousShredResolver(),...options.promptResolvers]};
}

module.exports={makeAutonomousShredTactic,makeAutonomousShredResolver,
  withAutonomousCopycatShredPolicy};
