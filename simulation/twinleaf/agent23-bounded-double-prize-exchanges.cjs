'use strict';

const assert=require('node:assert/strict');
const {selectBoundedDoubleExchanges}=
  require('./agent23-bounded-double-exchanges.cjs');

/**
 * Enumerate two disjoint exchanges between opponent concealed hand cards and
 * *two separate* face-down, single-card Prize slots. Reuse the established
 * exact net-printing hand-composition selector, including its explicit
 * physical-path denominator and default bounded diversity ordering.
 *
 * A physically present face-down Prize is not evidence that its printing has
 * remained unknown throughout a real match. The caller must separately
 * authenticate historical public reveals before making information-set claims.
 * Actual card printings may be inspected only in a detached postgame audit.
 *
 * @param {object[]} hand Opponent's current physical concealed hand cards.
 * @param {object[]} prizes Opponent's native CardList Prize positions.
 * @param {number} [limit] Number of disjoint physical paths, maximum 64.
 * @returns {object} Unqualified physical-path sample and net-hand counts.
 */
function selectBoundedDoubleHandPrizeExchanges(hand,prizes,limit=16){
  assert.ok(Array.isArray(hand)&&Array.isArray(prizes));
  const slots=[];
  for(let pi=0;pi<prizes.length;pi++){
    const pile=prizes[pi];
    if(pile?.cards?.length!==1)continue;
    slots.push({prizeIndex:pi,card:pile.cards[0]});
  }
  const selected=selectBoundedDoubleExchanges(
    hand,slots.map(slot=>slot.card),limit);
  return {
    ...selected,
    exchanges:selected.exchanges.map(path=>({
      ...path,
      swaps:path.swaps.map(({deckIndex,...swap})=>({
        ...swap,prizeIndex:slots[deckIndex].prizeIndex
      }))
    })),
    sourceZone:'opponent-face-down-prizes',
    completeRevealedHistoryVerified:false
  };
}

module.exports={selectBoundedDoubleHandPrizeExchanges};
