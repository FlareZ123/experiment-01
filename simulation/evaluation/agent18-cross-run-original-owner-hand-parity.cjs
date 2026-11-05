'use strict';

const {createHash}=require('node:crypto');
const hash=cards=>createHash('sha256').update(JSON.stringify(cards))
  .digest('hex');

/**
 * Join independently executed original-v5 source-owner evidence snapshots:
 * pre-decision owner-only actor view (Agent20) and post-choice native
 * Pass receipt (Agent35). Pair only exact original native root/custody.
 * Return no source hand inventory or offline-guessable hand fingerprints.
 *
 * @param {object} prechoice Agent20 archived original owner view.
 * @param {object} postchoice Agent35 original all-owner Pass archive.
 * @returns {object} Failure-inclusive, privacy-preserving parity verdicts.
 */
function auditOriginalSourceHandCrossRunParity(prechoice,postchoice){
  const refs=Array.isArray(prechoice?.opportunities)?
    prechoice.opportunities:[];
  const attempts=Array.isArray(postchoice?.attempts)?
    postchoice.attempts:[];
  const rows=refs.map(ref=>{
    const base={id:ref?.id??null,originalSourcePassRootOrdinal:
      ref?.passRootOrdinal??null,
      status:'UNVERIFIED',competitivelyQualifiedGames:0};
    if(ref?.sourceDealMatched!==true||
       ref?.fullDealMatched!==true||
       ref?.rootTapeMatched!==true||
       ref?.exactHistoricRootReproduced!==true||
       ref?.actualPassAccepted!==true||
       ref?.ownerActorObservationVerified!==true||
       !Number.isSafeInteger(ref.passRootOrdinal))
      return {...base,status:'PRECHOICE_SOURCE_OR_ROOT_UNVERIFIED'};
    const matching=attempts.filter(x=>x.id===ref.id);
    if(matching.length!==1||
       matching[0].completeNativeOwnerPassCoverage!==true)
      return {...base,status:'POSTCHOICE_RUN_OR_COVERAGE_UNVERIFIED'};
    const same=matching[0].ownerPassObservations?.filter(x=>
      x.ordinal===ref.passRootOrdinal&&
      x.turn===ref.globalTurn)??[];
    if(same.length!==1)return {...base,
      status:'POSTCHOICE_SOURCE_ROOT_UNVERIFIED'};
    const before=ref.ownerVisibleBeforeChoice?.ownHand;
    const after=same[0].ownerHandAtPass;
    if(!Array.isArray(before)||!Array.isArray(after)||
       !before.every(x=>typeof x==='string')||
       !after.every(x=>typeof x==='string')||
       same[0].ownerHandSha256!==hash(after)||
       ref.ownerVisibleBeforeChoice.actorSeat!==ref.sourceSeat||
       matching[0].sourceSeat!==ref.sourceSeat||
       ref.ownerVisibleBeforeChoice.globalTurn!==ref.globalTurn)
      return {...base,status:'OWNER_PREPOST_HAND_OR_SEAT_UNVERIFIED'};
    return {...base,status:hash(before)===hash(after)?
      'INDEPENDENT_PREPOST_SOURCE_HAND_EQUAL':
      'INDEPENDENT_PREPOST_SOURCE_HAND_CHANGED',
      cardsBefore:before.length,cardsAfter:after.length,
      sourceSeat:ref.sourceSeat,sourceTurn:ref.globalTurn};
  });
  return {schema:'agent18-independent-original-source-hand-parity-v1',
    registeredOriginalOpportunities:rows.length,
    verifiedUnchangedHands:rows.filter(r=>
      r.status==='INDEPENDENT_PREPOST_SOURCE_HAND_EQUAL').length,
    changedOrUnverifiedHands:rows.filter(r=>
      r.status!=='INDEPENDENT_PREPOST_SOURCE_HAND_EQUAL').length,
    noPrivateHandHashesExposed:true,
    prechoiceAndPostchoiceSeparateReruns:true,
    sameInvocationMutationDefinitelyExcluded:false,
    paperPlayableAlternativeCertified:false,
    competitivelyQualifiedGames:0,rows};
}

module.exports={auditOriginalSourceHandCrossRunParity};
