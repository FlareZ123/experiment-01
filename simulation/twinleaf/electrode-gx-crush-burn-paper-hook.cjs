'use strict';
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(output,name));

const PINNED_COMMIT='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const PRINTING='Electrode-GX CES';
const NATIVE_ATTACK='Crash and Burn-GX';
const PAPER_ATTACK='Crush and Burn-GX';
const STEP_DAMAGE=50;
let activeRestore=null;

/**
 * Exact-print correction. Pinned Twinleaf spells the CES48 GX attack
 * "Crash", whereas the English card says "Crush". Preserve attack identity,
 * other attacks and the GX flag. Record each edited clone for restoration.
 */
function normalizeElectrodeGXPrintedAttack(card,replacements){
  if(card?.fullName!==PRINTING)return false;
  const attacks=card.attacks;
  if(!Array.isArray(attacks)||attacks.length!==2||
     attacks[1]?.gxAttack!==true||typeof attacks[1]?.name!=='string')
    throw new TypeError('Unexpected pinned CES48 attack shape');
  const old=attacks[1].name;
  if(old===PAPER_ATTACK)return false;
  if(old!==NATIVE_ATTACK)throw new TypeError('Unexpected pinned CES48 GX attack name');
  if(replacements.has(card))throw new TypeError('Duplicate mutable card registration');
  replacements.set(card,old);
  attacks[1].name=PAPER_ATTACK;
  return true;
}

/**
 * Exact pinned GX callback defect: it loops over n selected Energy cards
 * and inside EACH iteration adds n*50 to attack damage, producing
 * 30+50*n*n instead of the printed 30+50*n. Preserve native legality,
 * physical card moves, one-GX marker and attack resolver. Adjust only delta.
 */
function wrapElectrodeGXCrushBurnReducer(
  original,AttackEffect,DiscardEnergyPrompt,GameMessage
){
  if(typeof original!=='function'||typeof AttackEffect!=='function'||
     typeof DiscardEnergyPrompt!=='function'||
     typeof GameMessage?.CHOOSE_ENERGIES_TO_DISCARD!=='string')
    throw new TypeError('Pinned GX reducer dependencies not provided');
  return function correctedCrushBurn(store,state,effect){
    if(this?.fullName!==PRINTING||!(effect instanceof AttackEffect)||
       effect.attack!==this.attacks?.[1]||effect.attack?.name!==PAPER_ATTACK)
      return original.call(this,store,state,effect);
    let intercepts=0;
    const wrapped=new Proxy(store,{
      get(target,property){
        if(property==='prompt')return (nextState,prompt,callback)=>{
          const matched=prompt instanceof DiscardEnergyPrompt&&
            prompt.message===GameMessage.CHOOSE_ENERGIES_TO_DISCARD;
          if(!matched)return target.prompt(nextState,prompt,callback);
          intercepts++;
          if(intercepts!==1||
             !Number.isSafeInteger(prompt.options?.max)||
             prompt.options.min!==1||prompt.options.allowCancel!==false||
             prompt.options.max<1||typeof callback!=='function')
            throw new TypeError('Unexpected CES48 mandatory GX discard prompt');
          return target.prompt(nextState,prompt,transfers=>{
            const n=transfers?.length;
            if(!Array.isArray(transfers)||!Number.isSafeInteger(n)||
               n<1||n>prompt.options.max)
              throw new TypeError('Malformed CES48 physical Energy transfer count');
            const before=effect.damage;
            const result=callback(transfers);
            if(effect.damage-before!==STEP_DAMAGE*n*n)
              throw new TypeError('Pinned CES48 native damage equation changed');
            effect.damage=before+STEP_DAMAGE*n;
            return result;
          });
        };
        const value=Reflect.get(target,property,target);
        return typeof value==='function'?value.bind(target):value;
      }
    });
    const result=original.call(this,wrapped,state,effect);
    if(intercepts!==1)throw new TypeError('Pinned CES48 discard prompt not emitted');
    return result;
  };
}

/**
 * Opt-in paper Expanded adapter. Install AFTER CardManager card-set load
 * but BEFORE constructing game deck clones. Uninstall after the game.
 * Restoration must be LIFO with other patches to CES48's reducer.
 */
function installElectrodeGXCrushBurnPaperHook(){
  if(activeRestore)return activeRestore;
  const {ElectrodeGX}=native('sets/08-sun-and-moon/set-celestial-storm/electrode-gx');
  const {CardManager}=native('game/cards/card-manager');
  const {AttackEffect}=native('game/store/effects/game-effects');
  const {DiscardEnergyPrompt}=native('game/store/prompts/discard-energy-prompt');
  const {GameMessage}=native('game/game-message');
  const beforeReducer=ElectrodeGX.prototype.reduceEffect;
  const beforeGetCard=CardManager.prototype.getCardByName;
  const replacements=new Map();
  const repairedGetCard=function(name){
    const card=beforeGetCard.call(this,name);
    normalizeElectrodeGXPrintedAttack(card,replacements);
    return card;
  };
  const repairedReducer=wrapElectrodeGXCrushBurnReducer(
    beforeReducer,AttackEffect,DiscardEnergyPrompt,GameMessage
  );
  const manager=CardManager.getInstance();
  for(const card of manager.getAllCards())
    normalizeElectrodeGXPrintedAttack(card,replacements);
  CardManager.prototype.getCardByName=repairedGetCard;
  ElectrodeGX.prototype.reduceEffect=repairedReducer;
  activeRestore=()=>{
    if(ElectrodeGX.prototype.reduceEffect===repairedReducer)
      ElectrodeGX.prototype.reduceEffect=beforeReducer;
    if(CardManager.prototype.getCardByName===repairedGetCard)
      CardManager.prototype.getCardByName=beforeGetCard;
    for(const [card,name] of replacements)
      if(card?.attacks?.[1]?.name===PAPER_ATTACK)card.attacks[1].name=name;
    replacements.clear();
    activeRestore=null;
  };
  return activeRestore;
}

module.exports={
  PINNED_COMMIT,PRINTING,NATIVE_ATTACK,PAPER_ATTACK,
  normalizeElectrodeGXPrintedAttack,
  wrapElectrodeGXCrushBurnReducer,
  installElectrodeGXCrushBurnPaperHook
};
