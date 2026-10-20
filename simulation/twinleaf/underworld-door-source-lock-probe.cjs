'use strict';

const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Read-only cloned-Store probe for an acting owner's Door Ability.
 * @param {object} state
 * @param {number} ownerId
 * @param {'active'|'bench'} source
 * @param {number} index
 * @returns {object}
 */
function probeDoorTarget(state,ownerId,source,index=0){
  const load=name=>require(path.join(output,name));
  const {deepClone}=load('utils');
  const {Store}=load('game/store/store');
  const {UseAbilityAction}=load('game/store/actions/game-actions');
  const {PlayerType,SlotType}=load('game/store/actions/play-card-action');
  const detached=new Store({onStateChange(){}});
  detached.state=deepClone(state);
  const target={player:PlayerType.BOTTOM_PLAYER,
    slot:source==='active'?SlotType.ACTIVE:SlotType.BENCH,index};
  let error=null,dispatchAccepted=false;
  const prior=Math.random;
  Math.random=()=>0.5;
  try{
    detached.dispatch(new UseAbilityAction(ownerId,'Underworld Door',target));
    dispatchAccepted=true;
  }catch(err){error=String(err?.message||err);}
  finally{Math.random=prior;}
  return {source,index,dispatchAccepted,error,
    attachPromptOpened:detached.state.prompts.some(p=>
      p.result===undefined && p.constructor.name==='AttachEnergyPrompt' &&
      p.playerId===ownerId)};
}
module.exports={probeDoorTarget};
