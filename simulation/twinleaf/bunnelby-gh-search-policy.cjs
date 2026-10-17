'use strict';
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(output,name));
/** An observed owner-deck search is a K1 information event. */
function makeGhBunnelbyResourceResolver(isLivePrompt){
  if(typeof isLivePrompt!=='function')throw Error('Live prompt guard required');
  const {PromptResolver}=engine('simple-bot/prompt-resolver/prompt-resolver');
  const {ChooseCardsPrompt}=engine('game/store/prompts/choose-cards-prompt');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  return class GhBunnelbyResourceResolver extends PromptResolver{
    resolvePrompt(state,player,prompt){
      if(!(prompt instanceof ChooseCardsPrompt)||prompt.playerId!==player.id||
        prompt.cards!==player.deck||prompt.options.max!==3||
        !player.supporter.cards.some(c=>c.fullName==='Guzma & Hala CEC')||
        !isLivePrompt(state,player,prompt))return;
      const bunnelby=player.active.getPokemonCard()?.fullName==='Bunnelby PRC'||
        player.bench.some(s=>s.getPokemonCard()?.fullName==='Bunnelby PRC');
      const stages=player.bench.some(s=>player.deck.cards.some(c=>
        c.stage!==undefined&&c.evolvesFrom===s.getPokemonCard()?.name));
      if(!bunnelby||!stages)return;
      const find=name=>player.deck.cards.find(c=>c.fullName===name);
      const wanted=[find('Technical Machine: Evolution PAR'),
        find('Jet Energy PAL')].filter(Boolean);
      if(!wanted.length)return;
      const stadium=find('Artazon PAL');
      const choices=stadium?[...wanted,stadium]:wanted;
      if(prompt.validate(choices,state))return new ResolvePromptAction(prompt.id,choices);
      if(prompt.validate(wanted,state))return new ResolvePromptAction(prompt.id,wanted);
    }
  };
}
function withGhBunnelbyResourceSelection(options,isLivePrompt){
  if(!Array.isArray(options.promptResolvers))throw Error('Missing prompt resolvers');
  if(options.promptResolvers.some(C=>C.name==='GhBunnelbyResourceResolver'))
    throw Error('Already installed');
  return {...options,promptResolvers:[makeGhBunnelbyResourceResolver(isLivePrompt),
    ...options.promptResolvers]};
}
module.exports={makeGhBunnelbyResourceResolver,withGhBunnelbyResourceSelection};
