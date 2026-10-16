'use strict';
/** @param {number} n @param {number} confidence @param {number} [comparisons] */
function zeroLossLowerBound(n,confidence,comparisons=1){
 if(!Number.isSafeInteger(n)||n<0||
    !Number.isSafeInteger(comparisons)||comparisons<1||
    !(confidence>0&&confidence<1))throw new RangeError('Invalid evidence design');
 if(n===0)return 0;
 return Math.pow((1-confidence)/comparisons,1/n);
}
/** @param {number} target @param {number} confidence @param {number} [comparisons] */
function allWinSampleThreshold(target,confidence,comparisons=1){
 if(!(target>0&&target<1)||!(confidence>0&&confidence<1)||
    !Number.isSafeInteger(comparisons)||comparisons<1)
  throw new RangeError('Invalid evidence target');
 return Math.ceil(Math.log((1-confidence)/comparisons)/Math.log(target));
}
module.exports={zeroLossLowerBound,allWinSampleThreshold};
