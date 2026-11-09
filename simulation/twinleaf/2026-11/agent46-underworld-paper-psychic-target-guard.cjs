'use strict';

const path=require('node:path');
const OUTPUT=path.resolve(__dirname,'../../../vendor/twinleaf/ptcg-server/output');
let installed=null;

/**
 * Restrict the pinned native Shadow Rider VMAX Underworld Door prompt
 * to the printed "Benched Psychic Pokemon" target rule. The native
 * implementation mistakenly checks PokemonCardList entries as though
 * they were PokemonCard, then passes the resulting indices as blocked
 * source-energy indices instead of target indices. Its general
 * AttachEnergyPrompt validator also does not check recipient type.
 *
 * The research-owned hook is reversible and never edits vendor code.
 * @returns {()=>void} Restore both native prototypes.
 */
function installUnderworldPsychicTargetGuard(){
  if(installed)return installed.restore;
  const {ShadowRiderCalyrexVMAX}=require(path.join(OUTPUT,
    'sets/09-sword-and-shield/set-chilling-reign/shadow-rider-calyrex-vmax'));
  const {Store}=require(path.join(OUTPUT,'game/store/store'));
  const {PowerEffect}=require(path.join(OUTPUT,'game/store/effects/game-effects'));
  const {ResolvePromptAction}=require(path.join(OUTPUT,
    'game/store/actions/resolve-prompt-action'));
  const {PlayerType,SlotType}=require(path.join(OUTPUT,
    'game/store/actions/play-card-action'));
  const {AttachEnergyPrompt}=require(path.join(OUTPUT,
    'game/store/prompts/attach-energy-prompt'));
  const {EnergyCard}=require(path.join(OUTPUT,
    'game/store/card/energy-card'));
  const {EnergyType,CardType}=require(path.join(OUTPUT,
    'game/store/card/card-types'));
  const {pokemonHasCardType}=require(path.join(OUTPUT,
    'game/store/card/pokemon-card'));
  const {GameError}=require(path.join(OUTPUT,'game/game-error'));
  const {GameMessage}=require(path.join(OUTPUT,'game/game-message'));
  const marked=new WeakMap();
  const beforeReduce=ShadowRiderCalyrexVMAX.prototype.reduceEffect;
  const beforeDispatch=Store.prototype.dispatch;

  /** @param {object} player @param {number} index @returns {boolean} */
  function targetIsPsychic(player,index){
    const pokemon=player.bench[index]?.getPokemonCard();
    return Boolean(pokemon&&pokemonHasCardType(pokemon,CardType.PSYCHIC));
  }

  function guardedUnderworldReduce(store,state,effect){
    const isDoor=effect instanceof PowerEffect&&
      effect.card===this&&effect.power===this.powers[0];
    if(!isDoor)return beforeReduce.call(this,store,state,effect);
    const owner=effect.player;
    if(!owner.bench.some((_,index)=>targetIsPsychic(owner,index))){
      throw new GameError(GameMessage.CANNOT_USE_POWER);
    }
    const pending=new Set(state.prompts);
    const result=beforeReduce.call(this,store,state,effect);
    for(const prompt of state.prompts){
      if(pending.has(prompt)||!(prompt instanceof AttachEnergyPrompt)||
        prompt.playerId!==owner.id||
        prompt.cardList!==owner.hand||
        prompt.message!=='ATTACH_ENERGY_TO_BENCH')continue;
      marked.set(prompt,owner);
      const existing=prompt.options.blockedTo??[];
      const extra=owner.bench.flatMap((_,index)=>
        targetIsPsychic(owner,index)?[]:[{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index
        }]);
      prompt.options.blockedTo=[...existing,...extra];
      const parentValidate=prompt.validate.bind(prompt);
      prompt.validate=function(assignments){
        if(!parentValidate(assignments))return false;
        if(assignments===null)return true;
        return assignments.every(({to,card})=>
          to?.player===PlayerType.BOTTOM_PLAYER&&
          to?.slot===SlotType.BENCH&&
          Number.isInteger(to.index)&&
          targetIsPsychic(owner,to.index)&&
          prompt.cardList.cards.includes(card)&&
          card instanceof EnergyCard&&
          card.energyType===EnergyType.BASIC&&
          card.provides.includes(CardType.PSYCHIC));
      };
    }
    return result;
  }

  function guardedDispatch(action){
    if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts.find(item=>
        item.id===action.id&&item.result===undefined);
      if(prompt&&marked.has(prompt)&&!prompt.validate(action.result)){
        throw new GameError(GameMessage.INVALID_PROMPT_RESULT);
      }
    }
    return beforeDispatch.call(this,action);
  }

  ShadowRiderCalyrexVMAX.prototype.reduceEffect=guardedUnderworldReduce;
  Store.prototype.dispatch=guardedDispatch;

  function restore(){
    if(ShadowRiderCalyrexVMAX.prototype.reduceEffect===guardedUnderworldReduce){
      ShadowRiderCalyrexVMAX.prototype.reduceEffect=beforeReduce;
    }
    if(Store.prototype.dispatch===guardedDispatch){
      Store.prototype.dispatch=beforeDispatch;
    }
    if(installed?.restore===restore)installed=null;
  }
  installed={restore};
  return restore;
}
module.exports={installUnderworldPsychicTargetGuard};
