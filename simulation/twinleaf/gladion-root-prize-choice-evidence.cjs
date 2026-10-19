'use strict';

/**
 * Observe only a live, already-selected root ChoosePrizePrompt resolution,
 * after Gladion has genuinely made every remaining own Prize visible.
 * The underlying Card references are kept local to the observer; they are
 * never passed to a decision policy or included in a serialized result.
 *
 * @param {object} state Actual pre-dispatch Store state
 * @param {object|null} pending Actual unresolved prompt
 * @param {object} action Already chosen root action
 * @param {0|1} seat Physical prompt-owner seat
 * @param {number} actionOrdinal Root action ordinal
 * @returns {object|null} In-memory observation, or no permitted observation
 */
function beforeGladionRootPrizeChoice(state,pending,action,seat,actionOrdinal){
  const owner=state.players?.[seat];
  if(!owner || pending?.constructor?.name!=='ChoosePrizePrompt' ||
     action?.constructor?.name!=='ResolvePromptAction' ||
     pending.playerId!==owner.id || pending.options?.count!==1 ||
     pending.options?.useOpponentPrizes===true ||
     !owner.supporter?.cards?.some(card=>card.fullName==='Gladion CIN'))return null;
  const rows=owner.prizes.flatMap((slot,i)=>
    slot.cards.length===1 ? [{slot:i,card:slot.cards[0],secret:slot.isSecret}] : []);
  if(rows.length===0 || rows.some(row=>row.secret!==false))return null;
  return {
    actionOrdinal,seat,turn:state.turn,
    revealedPrizes:rows.map(row=>({slot:row.slot,printing:row.card.fullName})),
    refs:rows
  };
}

/**
 * Verify the actual physical selected Prize card arrived in the owner's hand
 * after a successful root dispatch. No policy is invoked or modified.
 * @param {object} prior The begin-observation, holding private card references
 * @param {object} state Post-dispatch actual Store state
 * @returns {object} Serializable owner-visible root choice evidence
 */
function afterGladionRootPrizeChoice(prior,state){
  const owner=state.players[prior.seat];
  const enteredHand=prior.refs.filter(row=>owner.hand.cards.includes(row.card));
  const chosen=enteredHand.length===1?enteredHand[0]:null;
  return {
    evidenceType:'actual-root-gladion-revealed-prize-selection-v1',
    actionOrdinal:prior.actionOrdinal,turn:prior.turn,seat:prior.seat,
    revealedPrizes:prior.revealedPrizes,
    selectedSlot:chosen?.slot??null,
    selectedPrinting:chosen?.card.fullName??null,
    selectedPhysicalPrizeReachedHand:chosen!==null,
    selectionCount:enteredHand.length,
    competitiveGameQualified:false
  };
}

module.exports={beforeGladionRootPrizeChoice,afterGladionRootPrizeChoice};
