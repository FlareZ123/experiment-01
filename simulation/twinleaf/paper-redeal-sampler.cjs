'use strict';
const {canonicalUnseenCards}=require('./canonical-unseen-cards.cjs');

/**
 * Sample a paper-rules Prize redeal after the previous deck and Prize
 * identities have been established, but their physical ordering is unknown.
 * These are synthetic beliefs only; do not write returned arrays into a live
 * Twinleaf Store. The first array element denotes the paper draw top.
 *
 * @param {{formerDeck:Array<{fullName:string,id:number}>,
 *   oldPrizes:Array<{fullName:string,id:number}>,
 *   random:()=>number}} input
 * @returns {{newPrizes:object[],deck:object[]}}
 */
function samplePaperRedeal(input){
  const {formerDeck,oldPrizes,random}=input;
  if(!Array.isArray(formerDeck)||!Array.isArray(oldPrizes)||
      typeof random!=='function'||oldPrizes.length>formerDeck.length)
    throw new TypeError('Valid known-card multisets and independent RNG required');
  /** @param {object[]} source */
  function shuffle(source){
    const cards=canonicalUnseenCards(source);
    for(let i=cards.length-1;i>0;i--){
      const j=Math.floor(random()*(i+1));
      [cards[i],cards[j]]=[cards[j],cards[i]];
    }
    return cards;
  }
  const previousDeck=shuffle(formerDeck);
  const bottom=shuffle(oldPrizes);
  const n=oldPrizes.length;
  return {newPrizes:previousDeck.slice(0,n),
    deck:[...previousDeck.slice(n),...bottom]};
}
module.exports={samplePaperRedeal};
