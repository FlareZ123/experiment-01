'use strict';
const assert=require('node:assert/strict');

/**
 * Group two-card discard payments by the observable card-printing multiset
 * after a Supporter is played. Retains every physical source hand-index
 * selection, because the real Store still requires an exact physical choice.
 *
 * Equality of printing multisets is a bounded actor-hand abstraction. It is
 * not a proof of equal public history, card identity, native canPlay, hidden
 * card contents, or future strategic value.
 *
 * @param {readonly string[]} hand Exact printings in the actor's own hand.
 * @param {string} supporterPrinting Printed Supporter chosen to play.
 * @returns {{supporterPrinting:string,physicalChoices:number,
 *   uniquePrintingCosts:number,classes:Array<{discardPrintings:string[],
 *   physicalChoices:Array<{supporterIndex:number,discardIndices:[number,number]}>}>}}
 */
function groupTwoDiscardSupporterPayments(hand,supporterPrinting){
  assert.ok(Array.isArray(hand)&&hand.every(x=>typeof x==='string'));
  assert.ok(typeof supporterPrinting==='string'&&supporterPrinting.length>0);
  const grouped=new Map();
  let physicalChoices=0;
  for(let supporterIndex=0;supporterIndex<hand.length;supporterIndex++){
    if(hand[supporterIndex]!==supporterPrinting)continue;
    for(let first=0;first<hand.length;first++){
      if(first===supporterIndex)continue;
      for(let second=first+1;second<hand.length;second++){
        if(second===supporterIndex)continue;
        const discardPrintings=[hand[first],hand[second]].sort();
        const signature=JSON.stringify(discardPrintings);
        const bucket=grouped.get(signature)??{
          discardPrintings,physicalChoices:[]
        };
        bucket.physicalChoices.push({
          supporterIndex,discardIndices:[first,second]
        });
        grouped.set(signature,bucket);
        physicalChoices++;
      }
    }
  }
  return {supporterPrinting,physicalChoices,
    uniquePrintingCosts:grouped.size,classes:[...grouped.values()]};
}
module.exports={groupTwoDiscardSupporterPayments};
