'use strict';

const CARRIER='Rescue Carrier EVS';
const VERSION='agent16-owner-visible-printed-rescue-carrier-two-target-choice-v1';

/**
 * Pick at most two actual owner-discard Pokémon with printed HP <= 90 for
 * Rescue Carrier EVS. Unlike generic search, eligible physical cards must
 * be in the public owner discard at the moment of the native prompt.
 * \`targetValuesByPrinting\` is an optional explicit heuristic, not a
 * claim of matchup optimality.
 * @param {object} prompt Real source-stamped pinned ChooseCardsPrompt
 * @param {object} owner Prompted native owner
 * @param {object} state Live native Store State
 * @param {{targetValuesByPrinting?:Record<string,number>}} [options]
 * @returns {object[]|null} Exact native physical selection or null
 */
function chooseOwnerCarrierRecovery(prompt,owner,state,options={}){
  if(prompt?.sourceCard?.fullName!==CARRIER||
    prompt.message!=='CHOOSE_CARD_TO_HAND'||
    prompt.playerId!==owner?.id||
    !Array.isArray(prompt.cards?.cards)||
    !Array.isArray(owner.discard?.cards)||
    typeof prompt.validate!=='function')return null;
  const targets=prompt.cards.cards.filter(card=>
    owner.discard.cards.includes(card)&&
    Number.isFinite(card.hp)&&card.hp>0&&card.hp<=90);
  const values=options.targetValuesByPrinting??{};
  targets.sort((a,b)=>
    (values[b.fullName]??1)-(values[a.fullName]??1));
  const count=Math.min(2,targets.length);
  if(count<1)return null;
  for(let k=count;k>=1;k--){
    const selected=targets.slice(0,k);
    if(prompt.validate(selected,state)===true)return selected;
  }
  return null;
}

module.exports={CARRIER,VERSION,chooseOwnerCarrierRecovery};
