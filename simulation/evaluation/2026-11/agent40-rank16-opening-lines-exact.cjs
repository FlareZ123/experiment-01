'use strict';
/*
 * Exact, source-bound seven-card opening event counts for original Aichi rank16.
 * Not a turn simulator and not a game win-rate estimator.
 */
const {SOURCE_INVENTORY} = require('./agent40-rank16-budew-garbotoxin-opponent-v0.cjs');
const HAND=7;
const basicNames=[
 'Mega Absol ex MEG 86','Trubbish CRI 56','Budew ASC 16',
 'Crobat V DAA 104','Tapu Lele-GX GRI 60','Dedenne-GX UNB 57',
 'Squawkabilly ex PAL 169'
];
const size=name=>SOURCE_INVENTORY.find(([printing])=>printing===name)?.[1]??0;
function choose(n,k){
 if(!Number.isInteger(n)||!Number.isInteger(k))throw Error('integer-only choose');
 if(n<k||k<0)return 0n;
 let result=1n;
 for(let i=1;i<=Math.min(k,n-k);i++){
  result=result*BigInt(n-i+1)/BigInt(i);
 }
 return result;
}
function intersectAllPresent(groupSizes,excluded=0){
 const deckSize=SOURCE_INVENTORY.reduce((s,r)=>s+r[1],0);
 if(groupSizes.some(n=>!Number.isInteger(n)||n<=0)||
    excluded<0||groupSizes.reduce((a,b)=>a+b,0)+excluded>deckSize)
  throw Error('non-disjoint or nonexistent source category groups');
 let favorable=0n;
 for(let mask=0;mask<(1<<groupSizes.length);mask++){
  let left=deckSize-excluded,exclusions=0;
  for(let j=0;j<groupSizes.length;j++)if(mask & (1<<j)){
   left-=groupSizes[j];exclusions++;
  }
  favorable+=(exclusions%2?-1n:1n)*choose(left,HAND);
 }
 return favorable;
}
function calculate(){
 const deckSize=SOURCE_INVENTORY.reduce((a,b)=>a+b[1],0);
 if(deckSize!==60||SOURCE_INVENTORY.length!==29)throw Error('source inventory changed');
 const basics=basicNames.reduce((n,x)=>n+size(x),0);
 const budew=size('Budew ASC 16'),trubbish=size('Trubbish CRI 56'),
   float=size('Float Stone BKT 137'),
   search=size('Quick Ball FST 237')+size('Battle VIP Pass FST 225');
 if(basics!==11||budew!==2||trubbish!==2||float!==4||search!==6)
  throw Error('rank16 opening subset counts changed');
 const denominator=choose(deckSize,HAND);
 const legal=denominator-choose(deckSize-basics,HAND);
 const directBudew=intersectAllPresent([budew]);
 const budewAndTrubbish=intersectAllPresent([budew,trubbish]);
 const budewTrubbishFloat=intersectAllPresent([budew,trubbish,float]);
 const trubbishFloatSearchNoBudew=intersectAllPresent([trubbish,float,search],budew);
 const otherBasicFloatSearchNoBudew=intersectAllPresent([basics-budew,float,search],budew);
 const unionDirectOrReachableCore=directBudew+otherBasicFloatSearchNoBudew;
 const proportion=n=>Number(n)/Number(legal);
 const count=n=>n.toString();
 return Object.freeze({
  evidence:'exact 7-card combinatorics, conditioning on at least one Basic; no full game or playability assertion',
  sourceRank:16,deckSize,openingHandSize:HAND,basicCopies:basics,
  unconditionalMulliganProbability:1-Number(legal)/Number(denominator),
  denominator:count(denominator),
  validOpenings:count(legal),
  conditionalOnValidOpening:{
   directBudew:{count:count(directBudew),probability:proportion(directBudew)},
   budewAndTrubbish:{count:count(budewAndTrubbish),probability:proportion(budewAndTrubbish)},
   budewTrubbishFloat:{count:count(budewTrubbishFloat),probability:proportion(budewTrubbishFloat)},
   noBudewTrubbishFloatQuickOrVip:{count:count(trubbishFloatSearchNoBudew),probability:proportion(trubbishFloatSearchNoBudew)},
   noBudewOtherBasicFloatQuickOrVip:{count:count(otherBasicFloatSearchNoBudew),probability:proportion(otherBasicFloatSearchNoBudew)},
   directBudewOrNoBudewOtherBasicFloatSearchCore:{
    count:count(unionDirectOrReachableCore),probability:proportion(unionDirectOrReachableCore)
   }
  }
 });
}
if(require.main===module)process.stdout.write(JSON.stringify(calculate(),null,2)+'\n');
module.exports={HAND,basicNames,choose,intersectAllPresent,calculate};
