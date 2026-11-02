'use strict';

const VERSION='agent24-ordinary-simultaneous-end-conditions-matrix-v1';

/**
 * Reproduce only the four-column ordinary-game win/loss examples explicitly
 * presented in Advanced Player's Rulebook 3.4 section E, from the standpoint
 * of physical player seat 0. Each player earns one qualifying winning reason
 * for having taken all their Prizes and one if the opponent has no Pokémon
 * anywhere in play. The winner is the seat with more qualifying reasons;
 * equal positive reason counts are a tie. A tie may require a fresh game
 * under a tournament's tiebreak procedure.
 *
 * This is a narrow conditional rules-table projection and cannot certify
 * card effects, actual Prize transfers, deck-out, legal earlier actions,
 * event clock, or a competitively qualified outcome.
 *
 * @param {object} [args]
 * @param {boolean} [args.authenticatedOrdinaryState]
 * @param {boolean[]} [args.allPrizesTaken] Seat-indexed both statuses.
 * @param {boolean[]} [args.noPokemonInPlay] Seat-indexed both statuses.
 * @param {boolean} [args.deckOutConditionExcluded] Must positively exclude it.
 * @returns {object} Conditional rules-table disposition.
 */
function projectOrdinaryWinMatrix({
  authenticatedOrdinaryState=false,
  allPrizesTaken=null,
  noPokemonInPlay=null,
  deckOutConditionExcluded=false
}={}){
  const base={schema:VERSION,paperGameOutcomeQualified:false,
    officialClockVerified:false};
  if(authenticatedOrdinaryState!==true||
     deckOutConditionExcluded!==true)
    return {...base,status:'RULES_TABLE_PRECONDITIONS_UNVERIFIED',
      projectedWinnerSeat:null};
  if(!Array.isArray(allPrizesTaken)||allPrizesTaken.length!==2||
     !allPrizesTaken.every(x=>typeof x==='boolean')||
     !Array.isArray(noPokemonInPlay)||noPokemonInPlay.length!==2||
     !noPokemonInPlay.every(x=>typeof x==='boolean'))
    return {...base,status:'PUBLIC_END_CONDITIONS_UNVERIFIED',
      projectedWinnerSeat:null};
  const reasons=[
    Number(allPrizesTaken[0])+Number(noPokemonInPlay[1]),
    Number(allPrizesTaken[1])+Number(noPokemonInPlay[0])
  ];
  const result={
    ...base,allPrizesTaken:[...allPrizesTaken],
    noPokemonInPlay:[...noPokemonInPlay],
    winningReasonsBySeat:reasons,
    source:'Advanced Player Rulebook 3.4 section E four-condition table'
  };
  if(reasons[0]===0&&reasons[1]===0)
    return {...result,status:'NO_OBSERVED_END_CONDITION',
      projectedWinnerSeat:null};
  if(reasons[0]===reasons[1])
    return {...result,status:'SIMULTANEOUS_TIE',
      projectedWinnerSeat:null};
  return {
    ...result,status:'SEAT_WITH_MORE_WINNING_CONDITIONS',
    projectedWinnerSeat:reasons[0]>reasons[1]?0:1
  };
}

module.exports={VERSION,projectOrdinaryWinMatrix};
