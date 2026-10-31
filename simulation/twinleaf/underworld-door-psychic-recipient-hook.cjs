'use strict';
const path=require('node:path');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
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
  const {ShadowRiderCalyrexVMAX}=require(path.join(root,
    'sets/09-sword-and-shield/set-chilling-reign/shadow-rider-calyrex-vmax'));
  const {WAS_POWER_USED}=require(path.join(root,'game/store/prefabs/prefabs'));
  const {AttachEnergyPrompt}=require(path.join(root,
    'game/store/prompts/attach-energy-prompt'));
  const {CheckPokemonTypeEffect}=require(path.join(root,
    'game/store/effects/check-effects'));
  const {CardType,EnergyType}=require(path.join(root,'game/store/card/card-types'));
  const {EnergyCard}=require(path.join(root,'game/store/card/energy-card'));
  const {PlayerType,SlotType}=require(path.join(root,
    'game/store/actions/play-card-action'));
  const {GameError}=require(path.join(root,'game/game-error'));
  const {GameMessage}=require(path.join(root,'game/game-message'));
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
      if(!(prompt instanceof AttachEnergyPrompt))
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
