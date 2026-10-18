'use strict';

/** @param {number} same @param {number} k @param {number} [total] @returns {number} */
function samplingProbability(same,k,total=60) {
  let p=1;
  for(let i=0;i<k;i+=1) p*=(same-i)/(total-i);
  return k>same ? 0 : p;
}
module.exports={samplingProbability};
