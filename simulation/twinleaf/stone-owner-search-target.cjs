'use strict';

/** @param {{name:string}[]} cards @param {string} name @returns {{name:string}|null} */
function selectOwnerSearchTarget(cards,name){
  return cards.find(card=>card.name===name)||null;
}

module.exports={selectOwnerSearchTarget};
