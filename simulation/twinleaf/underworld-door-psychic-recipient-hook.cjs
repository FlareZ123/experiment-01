'use strict';
let uninstall=null;

/**
 * Opt-in pinned Twinleaf compatibility for Shadow Rider Calyrex VMAX CRE75.
 * Underworld Door must attach to a Benched Psychic Pokemon. The pinned
 * card's blocked-target construction inspects PokemonCardList objects as
 * PokemonCard and never excludes non-Psychic recipients.
 *
 * Guard both the user-visible prompt validator and the real Store callback.
 * Store.reducePrompt does not itself call Prompt.validate, so changing only
 * that method would leave a direct ResolvePromptAction bypass.
 *
 * No vendor files are modified. This hook remains opt-in pending real native
 * paired tests and evaluation of all dynamic Pokemon typing cases.
 * @returns {()=>void} Restores the pinned original reducer.
 */
function installUnderworldDoorPsychicRecipientHook(){
  if(uninstall)return uninstall;
  const {ShadowRiderCalyrexVMAX}=require('../../vendor/twinleaf/ptcg-server/output/sets/09-sword-and-shield/set-chilling-reign/shadow-rider-calyrex-vmax');
  const {WAS_POWER_USED}=require('../../vendor/twinleaf/ptcg-server/output/game/store/prefabs/prefabs');
  const {AttachEnergyPrompt}=require('../../vendor/twinleaf/ptcg-server/output/game/store/prompts/attach-energy-prompt');
  const {CheckPokemonTypeEffect}=require('../../vendor/twinleaf/ptcg-server/output/game/store/effects/check-effects');
  const {CardType,EnergyType,SuperType}=require('../../vendor/twinleaf/ptcg-server/output/game/store/card/card-types');
  const {EnergyCard}=require('../../vendor/twinleaf/ptcg-server/output/game/store/card/energy-card');
  const {PlayerType,SlotType}=require('../../vendor/twinleaf/ptcg-server/output/game/store/actions/play-card-action');
  const {GameError}=require('../../vendor/twinleaf/ptcg-server/output/game/game-error');
  const {GameMessage}=require('../../vendor/twinleaf/ptcg-server/output/game/game-message');
  const original=ShadowRiderCalyrexVMAX.prototype.reduceEffect;

  /** @param {object} store @param {object} state @param {object} effect */
  function corrected(store,state,effect){
    if(!WAS_POWER_USED(effect,0,this))
      return original.call(this,store,state,effect);
    const owner=effect.player;
    const isPsychicSlot=slot=>{
      if(!slot?.getPokemonCard())return false;
      const check=new CheckPokemonTypeEffect(slot);
      store.reduceEffect(state,check);
      return check.cardTypes.includes(CardType.PSYCHIC);
    };
    if(!owner.bench.some(isPsychicSlot))
      throw new GameError(GameMessage.CANNOT_USE_POWER);
    /** @param {Array<{to:object,card:object}>|null} transfers */
    function recipientsPsychic(transfers){
      if(transfers===null)return true;
      if(Array.isArray(transfers)&&transfers.length===0)return true;
      if(!Array.isArray(transfers)||transfers.length!==1)return false;
      return transfers.every(({to,card})=>{
        if(!(card instanceof EnergyCard)||
           !owner.hand.cards.includes(card)||
           card.energyType!==EnergyType.BASIC||
           !card.provides.includes(CardType.PSYCHIC))return false;
        if(to?.player!==PlayerType.BOTTOM_PLAYER||
            to.slot!==SlotType.BENCH||
            !Number.isInteger(to.index))return false;
        return isPsychicSlot(owner.bench[to.index]);
      });
    }
    const before=store.prompt;
    /** @param {object} current @param {object} prompt @param {Function} then */
    function patchedPrompt(current,prompt,then){
      const isUnderworldDoorPrompt=
        prompt instanceof AttachEnergyPrompt&&
        prompt.getPerspectivePlayerId()===owner.id&&
        prompt.message===GameMessage.ATTACH_ENERGY_TO_BENCH&&
        prompt.cardList===owner.hand&&
        prompt.playerType===PlayerType.BOTTOM_PLAYER&&
        Array.isArray(prompt.slots)&&
        prompt.slots.length===1&&
        prompt.slots[0]===SlotType.BENCH&&
        prompt.filter?.superType===SuperType.ENERGY&&
        prompt.filter?.energyType===EnergyType.BASIC&&
        prompt.filter?.name==='Psychic Energy'&&
        prompt.options?.min===1&&
        prompt.options?.max===1;
      if(!isUnderworldDoorPrompt)
        return before.call(store,current,prompt,then);
      const originalValidate=prompt.validate.bind(prompt);
      prompt.validate=result=>
        originalValidate(result)&&recipientsPsychic(result);
      return before.call(store,current,prompt,transfers=>{
        if(!recipientsPsychic(transfers))
          throw new GameError(GameMessage.INVALID_PROMPT_RESULT);
        return then(transfers);
      });
    }
    store.prompt=patchedPrompt;
    try{return original.call(this,store,state,effect);}
    finally{store.prompt=before;}
  }

  ShadowRiderCalyrexVMAX.prototype.reduceEffect=corrected;
  uninstall=()=>{
    if(ShadowRiderCalyrexVMAX.prototype.reduceEffect!==corrected)
      throw new Error('Underworld Door hook lost reducer ownership');
    ShadowRiderCalyrexVMAX.prototype.reduceEffect=original;
    uninstall=null;
  };
  return uninstall;
}

module.exports={installUnderworldDoorPsychicRecipientHook};
