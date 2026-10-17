'use strict';

const path=require('node:path');
const {hasK0PossibleStageFor}=require('./bunnelby-evolution-policy.cjs');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine=name=>require(path.join(root,name));

/**
 * Can the named printing still be in the unknown deck from a known source 60?
 * Hidden deck contents and the owner's face-down Prize cards are never read.
 * Each attached Tool is a separate physical card outside the slot.cards array.
 *
 * @param {object} player
 * @param {object[]} sourceCards
 * @param {string} fullName
 * @returns {boolean}
 */
function sourceCopyPossible(player,sourceCards,fullName) {
  let remaining=sourceCards.filter(card=>card.fullName===fullName).length;
  for(const zone of [
    player.hand,player.discard,player.lostzone,player.supporter,
    player.stadium,player.active,...player.bench
  ]) {
    if(!zone) continue;
    for(const card of zone.cards || []) {
      if(card.fullName===fullName) remaining--;
    }
  }
  for(const zone of [player.active,...player.bench]) {
    for(const card of zone.tools || []) {
      if(card.fullName===fullName) remaining--;
    }
  }
  return remaining>0;
}

/**
 * Restrict the optional Guzma & Hala mode-1 preference to an observable,
 * source-aware rank-2 Bunnelby Evolution resource opportunity. Merely
 * selecting mode 1 does not establish discards as strategically acceptable.
 *
 * @param {object} player
 * @param {object[]} sourceCards
 * @returns {boolean}
 */
function canPreferGuzmaHalaMode1(player,sourceCards) {
  if(player.hand.cards.length<2) return false;
  const currentActive=player.active.getPokemonCard();
  const bunnelbyActive=currentActive?.fullName==='Bunnelby PRC';
  const bunnelbyBenched=player.bench.some(slot=>
    slot.getPokemonCard()?.fullName==='Bunnelby PRC');
  if(!bunnelbyActive && !bunnelbyBenched) return false;
  const canEvolve=player.bench.some(slot=>{
    const name=slot.getPokemonCard()?.name;
    return Boolean(name && hasK0PossibleStageFor(player,sourceCards,name));
  });
  if(!canEvolve) return false;

  const hasTool=player.hand.cards.some(card=>
    card.fullName==='Technical Machine: Evolution PAR') ||
    [player.active,...player.bench].some(slot=>
      slot.tools.some(card=>card.fullName==='Technical Machine: Evolution PAR'));
  const hasJet=player.hand.cards.some(card=>
    card.fullName==='Jet Energy PAL') ||
    [player.active,...player.bench].some(slot=>
      slot.energies.cards.some(card=>card.fullName==='Jet Energy PAL'));
  const wantTool=!hasTool && sourceCopyPossible(
    player,sourceCards,'Technical Machine: Evolution PAR');
  const wantJet=bunnelbyBenched && !bunnelbyActive && !hasJet &&
    sourceCopyPossible(player,sourceCards,'Jet Energy PAL');
  return wantTool || wantJet;
}

/**
 * Opt-in research resolver before generic MandatoryOptionResolver. It
 * recognizes the actual Guzma & Hala mode prompt after the Supporter is
 * committed; no persistent hidden-zone observations are retained.
 * @param {object[]} sourceCards
 * @returns {Function}
 */
function makeBunnelbyGuzmaHalaModeResolver(sourceCards) {
  const {PromptResolver}=engine('simple-bot/prompt-resolver/prompt-resolver');
  const {SelectOptionPrompt}=engine('game/store/prompts/select-option-prompt');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {GameMessage}=engine('game/game-message');
  return class BunnelbyGuzmaHalaModeResolver extends PromptResolver {
    resolvePrompt(state,player,prompt) {
      if(!(prompt instanceof SelectOptionPrompt) ||
          prompt.playerId!==player.id ||
          prompt.message!==GameMessage.CHOOSE_OPTION ||
          prompt.options.allowCancel!==false ||
          prompt.options.disabled?.[1]===true ||
          !player.supporter.cards.some(card=>card.fullName==='Guzma & Hala CEC') ||
          !String(prompt.values[1]).includes('Discard 2 cards')) return;
      if(!canPreferGuzmaHalaMode1(player,sourceCards)) return;
      return new ResolvePromptAction(prompt.id,1);
    }
  };
}

/**
 * @param {object} options Upstream bot options.
 * @param {object[]} sourceCards Full printing-aware source 60.
 * @returns {object} New bot options, preserving unchanged defaults.
 */
function withBunnelbyGuzmaHalaMode1(options,sourceCards) {
  if(!Array.isArray(options.promptResolvers)) {
    throw new Error('Guzma & Hala policy requires prompt resolvers');
  }
  if(!Array.isArray(sourceCards)||sourceCards.length!==60) {
    throw new Error('Bunnelby Guzma & Hala mode requires source 60');
  }
  if(options.promptResolvers.some(x=>x.name==='BunnelbyGuzmaHalaModeResolver')) {
    throw new Error('Bunnelby Guzma & Hala mode already installed');
  }
  return {...options,promptResolvers:[
    makeBunnelbyGuzmaHalaModeResolver(sourceCards),
    ...options.promptResolvers
  ]};
}

module.exports={
  sourceCopyPossible,canPreferGuzmaHalaMode1,
  makeBunnelbyGuzmaHalaModeResolver,withBunnelbyGuzmaHalaMode1
};
