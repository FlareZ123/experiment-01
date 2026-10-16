'use strict';
function splitKnownTop(knownTop,unknownSuffix,replaceCount){
 if(replaceCount>knownTop.length+unknownSuffix.length)throw new RangeError('Insufficient cards');
 const takenFromUnknown=Math.max(0,replaceCount-knownTop.length);
 return {newPrizePrefix:knownTop.slice(0,replaceCount),unknownNewPrizeCount:takenFromUnknown,remainingKnownTop:knownTop.slice(replaceCount)};
}
module.exports={splitKnownTop};
