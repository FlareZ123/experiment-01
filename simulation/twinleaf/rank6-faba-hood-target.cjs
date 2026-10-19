'use strict';

/**
 * Pure, owner/public-board decisions for Faba's actual pinned prompts.
 * Faba LOT first asks which class to remove, then which opposing Pokemon;
 * if that Pokemon has multiple Tools it also asks for the exact card.
 * Every chosen Pokemon/Tool is public. The caller must only activate this
 * after its own actual Faba PlayCardAction was selected.
 *
 * The returned result is intended for a real ResolvePromptAction and must
 * still be accepted by the Store. Unknown prompts delegate to the engine.
 *
 * @param {object} args
 * @param {object} args.state Current source-visible Store State.
 * @param {object} args.source The acting source player.
 * @param {object} args.opponent Opponent's public board.
 * @param {object|null} args.prompt Unresolved owner prompt.
 * @param {'choice'|'pokemon'|'tool'} args.stage Frozen Faba prompt stage.
 * @param {object|null} [args.targetZone] Previously chosen public Pokemon zone.
 * @returns {{result:number|object[],nextStage:string,targetZone:object|null,kind:string}|null}
 */
function sourceFabaHoodPromptChoice({state,source,opponent,prompt,stage,targetZone=null}){
  if(!prompt||prompt.result!==undefined||prompt.playerId!==source.id){
    return null;
  }
  if(stage==='choice'){
    if(prompt.constructor?.name!=='SelectPrompt'||
      prompt.message!=='DISCARD_STADIUM_OR_TOOL_OR_SPECIAL_ENERGY'){
      return null;
    }
    const index=prompt.values?.indexOf('CHOICE_TOOL')??-1;
    if(index<0)return null;
    return {result:index,nextStage:'pokemon',targetZone:null,kind:'faba-tool-menu'};
  }
  if(stage==='pokemon'){
    if(prompt.constructor?.name!=='ChoosePokemonPrompt'||
      prompt.message!=='CHOOSE_POKEMON_TO_DISCARD_CARDS'||
      typeof prompt.validate!=='function'){
      return null;
    }
    const candidates=opponent.bench.filter(zone=>
      ['Shadow Rider Calyrex VMAX','Shadow Rider Calyrex V'].includes(
        zone.getPokemonCard()?.name) &&
      zone.tools.some(card=>card.name==='Stealthy Hood'));
    candidates.sort((a,b)=>Number(b.getPokemonCard().name==='Shadow Rider Calyrex VMAX')-
      Number(a.getPokemonCard().name==='Shadow Rider Calyrex VMAX'));
    const target=candidates.find(zone=>prompt.validate([zone],state));
    if(!target)return null;
    return {result:[target],nextStage:'tool',targetZone:target,
      kind:'faba-hooded-shadow-target'};
  }
  if(stage==='tool'){
    if(prompt.constructor?.name!=='ChooseCardsPrompt'||
      prompt.message!=='CHOOSE_CARD_TO_DISCARD'||
      prompt.cards!==targetZone||typeof prompt.validate!=='function'){
      return null;
    }
    const hood=targetZone?.tools.find(card=>card.name==='Stealthy Hood');
    if(!hood||!prompt.validate([hood],state))return null;
    return {result:[hood],nextStage:'done',targetZone,
      kind:'faba-specific-hood'};
  }
  return null;
}

module.exports={sourceFabaHoodPromptChoice};
