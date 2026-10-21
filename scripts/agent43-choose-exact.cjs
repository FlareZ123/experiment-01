'use strict';
/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(k<0||k>n)return 0n;
  let x=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)x=x*BigInt(n-Math.min(k,n-k)+i)/BigInt(i);
  return x;
}
module.exports={choose};
