'use strict';

/** @param {Array<{fullName:string,id?:number}>} cards */
function canonicalUnseenCards(cards) {
  return cards.slice().sort((a,b)=>{
    const name=a.fullName.localeCompare(b.fullName);
    if(name!==0)return name;
    return Number.isSafeInteger(a.id)&&Number.isSafeInteger(b.id)?a.id-b.id:0;
  });
}
module.exports={canonicalUnseenCards};
