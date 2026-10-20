'use strict';

const assert=require('node:assert/strict');

/**
 * Capture only publicly attached Energy, with one entry per board position.
 * This intentionally never reads either player's deck or Prize composition.
 * @param {object} player Genuine Store player with public in-play Pokemon.
 * @returns {object[]} Public Energy-card occupancy of each board position.
 */
function publicBoardEnergy(player) {
  const one=(slot,location)=>({
    location,
    pokemon:slot.getPokemonCard()?.fullName??null,
    energy:slot.energies.cards.map(c=>c.fullName)
  });
  return [one(player.active,'active'),...player.bench.map((slot,i)=>
    one(slot,'bench-'+i))];
}

/**
 * Read an opponent source card only at its actual publicly revealed play.
 * Earlier unrevealed source-hand contents are never returned or stored.
 * @param {object} state Authentic pre-dispatch Store state.
 * @param {object} action Native action.
 * @param {0|1} sourceSeat Opposing player seat.
 * @returns {string|null} Printed name when a played card is face-up.
 */
function publiclyPlayedSourceCard(state,action,sourceSeat) {
  if(state.activePlayer!==sourceSeat||
      action?.constructor?.name!=='PlayCardAction')return null;
  const source=state.players[sourceSeat];
  if(!source||action.id!==source.id)return null;
  return source.hand.cards[action.handIndex]?.fullName??null;
}

/**
 * Source-side prompt roots that decrease candidate's public Energy occupancy.
 * Adjacent played-card names are contextual candidate causes and are not
 * independently certified as the specific reducer responsible for a loss.
 *
 * @template T
 * @param {Function} Store Actual pinned Twinleaf Store class.
 * @param {0|1} sourceSeat Authentic opponent seat.
 * @param {()=>T} execute Native source-dealt replay.
 * @returns {{result:T,audit:object}} Recorded public causal windows.
 */
function withRank6SourcePublicDenialLedger(Store,sourceSeat,execute) {
  assert.equal(typeof execute,'function');
  assert.ok(sourceSeat===0||sourceSeat===1);
  const desc=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof desc?.value,'function');
  const candidateSeat=1-sourceSeat;
  const publicPlays=[];
  const losses=[];
  const sourceActionWindows=[];
  let originalStore=null,ordinal=0;

  /** @param {object} action @returns {unknown} */
  function observe(action){
    if(!originalStore && action?.constructor?.name==='AddPlayerAction')
      originalStore=this;
    if(this!==originalStore)return desc.value.call(this,action);
    ordinal++;
    const state=this.state;
    const source=state?.players[sourceSeat];
    const candidate=state?.players[candidateSeat];
    const turn=state?.turn??null;
    const activePlayer=state?.activePlayer??null;
    const type=action?.constructor?.name??null;
    const before=candidate?publicBoardEnergy(candidate):null;
    const revealed=source?publiclyPlayedSourceCard(state,action,sourceSeat):null;
    // A pending prompt's identity and generic type are inspected, without
    // accessing offered concealed options or the source player's hand.
    const prompt=activePlayer===sourceSeat &&
      type==='ResolvePromptAction'?state.prompts.find(p=>
        p.id===action.id && p.playerId===source.id):null;
    const result=desc.value.call(this,action);
    if(!before || activePlayer!==sourceSeat)return result;
    const after=publicBoardEnergy(this.state.players[candidateSeat]);
    if(revealed){
      publicPlays.push({ordinal,turn,printedCard:revealed,
        publicAfterPlay:true, action:type});
    }
    const oldTotal=before.reduce((n,s)=>n+s.energy.length,0);
    const newTotal=after.reduce((n,s)=>n+s.energy.length,0);
    if(oldTotal>newTotal){
      const context=publicPlays.filter(p=>p.turn===turn);
      losses.push({
        ordinal,turn,actorSeat:sourceSeat,nativeAction:type,
        promptType:prompt?.constructor?.name??null,
        promptMessage:prompt?.message??null,
        publiclyPlayedCardsEarlierThisSourceTurn:context,
        lastPublicPlay:context.at(-1)??null,
        before,after,attachedCardDelta:newTotal-oldTotal,
        observerCannotAttributeReducer:true,
        genuineStoreRoot:true
      });
    }
    if(revealed||oldTotal>newTotal){
      sourceActionWindows.push({ordinal,turn,action:type,
        printedPublicPlay:revealed,
        candidateAttachedCardDelta:newTotal-oldTotal});
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...desc,value:observe});
  try{
    return {result:execute(),audit:{
      schema:'agent30-rank6-public-source-energy-denial-root-v1',
      sourceSeat,candidateSeat,rootDispatchCount:ordinal,
      publiclyPlayedSourceCards:publicPlays,
      sourceAttachedEnergyLossEvents:losses,
      attachedEnergyLossTotal:losses.reduce((n,e)=>
        n-e.attachedCardDelta,0),
      sourcePublicActionWindows:sourceActionWindows,
      hiddenSourceHandContentsRecorded:false,
      opponentDeckOrPrizeContentsInspected:false,
      speculativeCloneActionsRecorded:false,
      cardEffectAttributionCertified:false,
      modifiesDecisionsOrReducers:false,
      qualifiesForCompetitiveInference:false
    }};
  } finally {
    assert.equal(Store.prototype.dispatch,observe,
      'A nested wrapper failed to restore Store.dispatch');
    Object.defineProperty(Store.prototype,'dispatch',desc);
  }
}

module.exports={
  publicBoardEnergy,publiclyPlayedSourceCard,
  withRank6SourcePublicDenialLedger
};
