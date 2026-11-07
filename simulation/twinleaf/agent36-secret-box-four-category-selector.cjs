'use strict';

const {secretBoxSearchCategoryNegative}=
  require('./agent4-secret-box-paper-search-hook.cjs');

const VERSION='agent36-secret-box-four-category-selector-v1';
const CATEGORY_SPECS=[
  {key:'ITEM',maxKey:'maxItems'},
  {key:'TOOL',maxKey:'maxTools'},
  {key:'SUPPORTER',maxKey:'maxSupporters'},
  {key:'STADIUM',maxKey:'maxStadiums'}
];

const ROOT93_NEW_MOON_PREFERENCES=Object.freeze({
  ITEM:Object.freeze(['Fog Crystal CRE']),
  TOOL:Object.freeze(['Powerglass SFA']),
  SUPPORTER:Object.freeze(['Ace Trainer XY7']),
  STADIUM:Object.freeze(['Sky Field ROS'])
});

/**
 * Selects up to one distinct physical owner-deck Trainer per Secret Box category.
 * The caller must pass the live owner, source-stamped prompt, native card classes,
 * and a preference map. Unavailable preferred categories are skipped.
 *
 * @param {object} prompt Genuine live Secret Box TWM search prompt.
 * @param {object} owner Player who owns the prompted deck.
 * @param {object} state Current native Store state for prompt validation.
 * @param {{TrainerCard:Function,TrainerType:object}} types Native card classes.
 * @param {Record<string,string[]>} preferences Exact fullName priority per category.
 * @returns {object[]|null} Valid physical card array, or null when the prompt is not eligible.
 */
function chooseSecretBoxCategories(prompt,owner,state,types,preferences){
  if(prompt?.sourceCard?.fullName!=='Secret Box TWM'||
     prompt?.message!=='CHOOSE_CARD_TO_HAND'||
     prompt?.cards!==owner?.deck||
     prompt?.playerId!==owner?.id||
     !Array.isArray(owner?.deck?.cards)||
     typeof prompt.validate!=='function'||
     typeof types?.TrainerCard!=='function'||
     !types.TrainerType)return null;

  const selected=[];
  for(const spec of CATEGORY_SPECS){
    const max=Number(prompt[spec.maxKey]??prompt.options?.[spec.maxKey]??1);
    if(!(max>0))continue;
    const category=types.TrainerType[spec.key];
    const names=preferences?.[spec.key]??[];
    const card=owner.deck.cards.find(candidate=>
      candidate instanceof types.TrainerCard&&
      candidate.trainerType===category&&
      names.includes(candidate.fullName)&&
      !selected.includes(candidate));
    if(card)selected.push(card);
  }

  if(selected.length===0||
     secretBoxSearchCategoryNegative(prompt,selected,owner,types)!==null||
     prompt.validate(selected,state)!==true)return null;
  return selected;
}

module.exports={VERSION,CATEGORY_SPECS,ROOT93_NEW_MOON_PREFERENCES,
  chooseSecretBoxCategories};
