'use strict';

const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} relative */
const engine=relative=>require(path.join(output,relative));

/**
 * Select a requested printing only after Gladion has genuinely revealed
 * all remaining own Prizes. A target is a bounded tactical hypothesis,
 * supplied explicitly by the caller, not an automatic claim of card value.
 *
 * @param {object} state Actual or speculative pinned State.
 * @param {object} player Prompt owner.
 * @param {object} prompt Authenticated ChoosePrizePrompt.
 * @param {string} targetFullName Physical printing to retrieve.
 * @returns {object|null} A source Prize CardList, or no special choice.
 */
function chooseRevealedGladionPrize(state,player,prompt,targetFullName){
  if(prompt.playerId!==player.id ||
      prompt.options?.count!==1 ||
      prompt.options?.useOpponentPrizes===true ||
      !player.supporter?.cards.some(card=>card.fullName==='Gladion CIN'))return null;
  const occupied=player.prizes.filter(slot=>slot.cards.length>0);
  if(occupied.length===0 || occupied.some(slot=>slot.isSecret!==false))return null;
  const blocked=prompt.options.blocked||[];
  const chosen=player.prizes.find((slot,index)=>
    !blocked.includes(index)&&slot.cards.length===1&&
    slot.cards[0].fullName===targetFullName);
  return chosen&&prompt.validate([chosen],state)?chosen:null;
}

/**
 * The root prompt guard prevents speculative AI branches using physical
 * hidden Prize membership to value a not-yet-played Gladion.
 * @param {string} targetFullName Exact priority print.
 * @param {(state:object,player:object,prompt:object)=>boolean} isLivePrompt
 * @returns {Function} Research-side resolver constructor.
 */
function makeGladionVisiblePrizeResolver(targetFullName,isLivePrompt){
  if(typeof targetFullName!=='string'||targetFullName.length===0 ||
      typeof isLivePrompt!=='function')throw Error('Target print and root guard required');
  const {PromptResolver}=engine('simple-bot/prompt-resolver/prompt-resolver');
  const {ChoosePrizePrompt}=engine('game/store/prompts/choose-prize-prompt');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  return class GladionVisiblePrizeResolver extends PromptResolver{
    resolvePrompt(state,player,prompt){
      if(!(prompt instanceof ChoosePrizePrompt) ||
          !isLivePrompt(state,player,prompt))return;
      const chosen=chooseRevealedGladionPrize(state,player,prompt,targetFullName);
      if(chosen)return new ResolvePromptAction(prompt.id,[chosen]);
    }
  };
}

/**
 * Opt-in, composable pinned-bot configuration. The original fallback
 * ChoosePrizePromptResolver remains present and unchanged.
 * @param {object} options SimpleBotOptions.
 * @param {{targetFullName:string,isLivePrompt:Function}} settings
 * @returns {object} New options.
 */
function withGladionVisiblePrizeChoice(options,{targetFullName,isLivePrompt}){
  if(!Array.isArray(options.promptResolvers) ||
      options.promptResolvers.some(ctor=>ctor.name==='GladionVisiblePrizeResolver')){
    throw Error('Missing prompt resolvers or duplicate Gladion policy');
  }
  const Policy=makeGladionVisiblePrizeResolver(targetFullName,isLivePrompt);
  return {...options,promptResolvers:[Policy,...options.promptResolvers]};
}

module.exports={
  chooseRevealedGladionPrize,
  makeGladionVisiblePrizeResolver,
  withGladionVisiblePrizeChoice
};
