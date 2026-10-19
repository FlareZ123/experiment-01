'use strict';

/**
 * Read only what the player holding the current Gladion prompt knows: own
 * hand/discard and face-up board on both sides. Do not inspect either deck,
 * the opposing hand, or any concealed Prize card.
 *
 * @param {object} state Genuine Store state.
 * @param {0|1} seat Physical actor seat.
 * @returns {object} Detached JSON-friendly owner-information snapshot.
 */
function gladionOwnerBoardContext(state,seat){
  const own=state.players[seat],opponent=state.players[1-seat];
  /** @param {object} slot */
  const visibleSlot=slot=>{
    const pokemon=slot?.getPokemonCard?.();
    if(!pokemon)return null;
    return {
      pokemon:pokemon.fullName,
      stackPrintings:(slot.cards||[]).map(card=>card.fullName),
      toolPrintings:(slot.tools||[]).map(card=>card.fullName),
      energyPrintings:(slot.energies?.cards||[]).map(card=>card.fullName),
      damage:slot.damage
    };
  };
  return {
    turn:state.turn,
    ownHandPrintings:own.hand.cards.map(card=>card.fullName),
    ownDiscardPrintings:own.discard.cards.map(card=>card.fullName),
    ownStadiumPrintings:own.stadium.cards.map(card=>card.fullName),
    supporterAlreadyPlayed:own.supporterTurn===state.turn,
    ownActive:visibleSlot(own.active),
    ownBench:own.bench.map(visibleSlot).filter(Boolean),
    opponentActive:visibleSlot(opponent.active),
    opponentBench:opponent.bench.map(visibleSlot).filter(Boolean)
  };
}

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
 * @param {boolean} [captureContext=false] Opt-in owner-visible board/hand.
 * @returns {object|null} In-memory observation, or no permitted observation
 */
function beforeGladionRootPrizeChoice(state,pending,action,seat,actionOrdinal,captureContext=false){
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
    refs:rows,
    ...(captureContext?{ownerContextBefore:gladionOwnerBoardContext(state,seat)}:{})
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
    ...(prior.ownerContextBefore?{
      ownerVisibleContext:{
        before:prior.ownerContextBefore,
        after:gladionOwnerBoardContext(state,prior.seat)
      }
    }:{}),
    competitiveGameQualified:false
  };
}

module.exports={gladionOwnerBoardContext,
  beforeGladionRootPrizeChoice,afterGladionRootPrizeChoice};
