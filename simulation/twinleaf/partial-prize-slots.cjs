'use strict';

const assert = require('node:assert/strict');

/**
 * Partition current Prize slots by a caller-supplied observation ledger.
 * Known cards retain their exact observed slots; only the unobserved slots
 * can join a determinized hidden-deck pool. The caller must separately
 * establish that every currently remembered positional observation is listed.
 *
 * @param {{cards:object[]}[]} prizes
 * @param {{prizeIndex:number,cardIndex:number,fullName:string}[]} observedSlots
 * @returns {{card:object,prizeIndex:number,cardIndex:number}[]}
 */
function selectUnobservedPrizeSlots(prizes,observedSlots) {
  assert.ok(Array.isArray(observedSlots),'Observed Prize slots must be an array');
  const observed=new Set();
  for(const slot of observedSlots) {
    assert.ok(slot!==null && typeof slot==='object' &&
      Number.isSafeInteger(slot.prizeIndex) && slot.prizeIndex>=0 &&
      Number.isSafeInteger(slot.cardIndex) && slot.cardIndex>=0 &&
      typeof slot.fullName==='string' && slot.fullName.length>0,
      'Invalid observed Prize slot');
    const card=prizes[slot.prizeIndex]?.cards?.[slot.cardIndex];
    assert.ok(card && card.fullName===slot.fullName,
      'Observed Prize card disagrees with physical slot');
    const key=`${slot.prizeIndex}:${slot.cardIndex}`;
    assert.ok(!observed.has(key),'Duplicate observed Prize slot');
    observed.add(key);
  }
  return prizes.flatMap((prize,prizeIndex)=>prize.cards.flatMap(
    (card,cardIndex)=>observed.has(`${prizeIndex}:${cardIndex}`) ?
      [] : [{card,prizeIndex,cardIndex}]));
}

module.exports={selectUnobservedPrizeSlots};
