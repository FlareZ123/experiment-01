'use strict';

const ARVEN = 'Arven OBF';
const VERSION = 'agent7-owner-mail-selected-arven-and-printed-item-tool-v1';

/**
 * Propose playing an actual Mail-selected physical Arven on a later turn.
 * The caller must attest the indices by physical object identity at native Store.
 * @param {object} view Detached actor-only observation.
 * @param {number[]} selectedHandIndices Physical Mail-search receipt-backed indices.
 * @returns {{kind:string,handIndex:number,printing:string}|null}
 */
function chooseMailSelectedArven(view,selectedHandIndices){
  if(view?.decisionKind!=='owner-root'||!Array.isArray(selectedHandIndices)||
     !Array.isArray(view.ownHand)||!Number.isSafeInteger(view.globalTurn)||
     view.globalTurn<=1)return null;
  const r=view.ownTurnResources;
  if(!r||r.supporterPlayLocked===true||r.supporterPlayedTurn>0||
     view.ownPublic?.publicTurnRestrictions?.supporterPlayLocked===true)return null;
  const index=selectedHandIndices.find(i=>Number.isSafeInteger(i)&&i>=0&&
    i<view.ownHand.length&&view.ownHand[i]===ARVEN);
  return index===undefined?null:{kind:'play-mail-selected-arven',
    handIndex:index,printing:ARVEN};
}

const ITEMS=['Nest Ball',"Trainers' Mail",'VS Seeker','Hisuian Heavy Ball',
  'Counter Catcher','Enhanced Hammer','Scoop Up Cyclone','Night Stretcher',
  'Quick Ball'];
const TOOLS=['Float Stone','Forest Seal Stone','Stealthy Hood','Tool Jammer'];
/**
 * Choose Item+Tool only during the genuinely pending acting player's Arven
 * search of their own deck. Native prompt validation is authoritative.
 * @param {object} prompt Genuine ChooseCardsPrompt.
 * @param {object} owner Acting Player object.
 * @param {object} types Pinned native CardTypes exports.
 * @param {object} state Actual native State for validation only.
 * @returns {object[]|null} Physical card objects, or no legal resolution.
 */
function chooseArvenSearch(prompt,owner,types,state){
  if(prompt?.constructor?.name!=='ChooseCardsPrompt'||
     prompt.cards!==owner?.deck||!Array.isArray(owner.deck.cards)||
     !types?.TrainerType)return null;
  const pool=owner.deck.cards;
  const rank=(card,names)=>{
    const p=names.indexOf(card.name);
    return p<0?names.length:p;
  };
  const items=pool.filter(c=>c.trainerType===types.TrainerType.ITEM)
    .sort((a,b)=>rank(a,ITEMS)-rank(b,ITEMS));
  const tools=pool.filter(c=>c.trainerType===types.TrainerType.TOOL)
    .sort((a,b)=>rank(a,TOOLS)-rank(b,TOOLS));
  for(const item of items)for(const tool of tools){
    const pair=[item,tool];
    if(prompt.validate(pair,state)===true)return pair;
  }
  for(const card of [...items,...tools]){
    if(prompt.validate([card],state)===true)return [card];
  }
  return prompt.validate([],state)===true?[]:null;
}

module.exports={VERSION,ARVEN,chooseMailSelectedArven,chooseArvenSearch};
