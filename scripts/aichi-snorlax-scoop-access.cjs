'use strict';

const {choose} = require('./aichi-snorlax-solo-block.cjs');

/** @param {number} basics @param {number} lele */
function singletonAccess(basics, lele) {
  const other = basics-lele;
  const filler = 59-basics;
  const denominator = choose(60,7)-choose(60-basics,7);
  let inHand = 0;
  let throughLele = 0;
  for (let l=0;l<=lele;l++) for (let b=0;b<=other;b++) {
    if (l+b<2) continue;
    inHand += choose(lele,l)*choose(other,b)*choose(filler,6-l-b);
    if (l>=1) throughLele += choose(lele,l)*choose(other,b)*choose(filler,7-l-b);
  }
  return {
    inHand:inHand/denominator,
    leleAvailableAndSingletonUnprized:throughLele/denominator*47/53,
    combined:inHand/denominator+throughLele/denominator*47/53,
    denominator,inHandCount:inHand,leleHandCount:throughLele
  };
}

module.exports={singletonAccess};
