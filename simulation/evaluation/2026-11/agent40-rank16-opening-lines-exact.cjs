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
function twoCopyCorePrizeCollapse(){
 // Initial 7 must include >=1 of 11 Basic Pokémon.
 // Six face-down Prizes are dealt from the 53 after those 7.
 // These are three disjoint two-copy BASIC families in the original 60.
 // Inclusion-exclusion counts opening hands & Prize subsets jointly, thus
 // avoids the error of treating unconditional C(58,4)/C(60,6) as the
 // prize risk conditional on a *legal* starting seven.
 const twoCopyCategories=['Mega Absol ex MEG 86','Trubbish CRI 56','Budew ASC 16'];
 if(twoCopyCategories.some(p=>SOURCE_INVENTORY.find(x=>x[0]===p)?.[1]!==2))
  throw Error('source core two-copy groups changed');
 const valid7=choose(60,7)-choose(49,7);
 const denominator=valid7*choose(53,6);
 const exactlyAllOfOne=(choose(58,7)-choose(49,7))*choose(51,4);
 const allOfTwo=(choose(56,7)-choose(49,7))*choose(49,2);
 const allOfThree=choose(54,7)-choose(49,7);
 const atLeastOne=3n*exactlyAllOfOne-3n*allOfTwo+allOfThree;
 const frac=n=>Number(n)/Number(denominator);
 return Object.freeze({
  sourceRank:16,groups:twoCopyCategories,
  conditioning:'legal opening seven with >=1 Basic and six Prize cards drawn from remaining 53',
  denominator:denominator.toString(),
  anyOneSpecifiedCoreCompletelyPrized:{numerator:exactlyAllOfOne.toString(),probability:frac(exactlyAllOfOne)},
  anyTwoSpecifiedCoresCompletelyPrized:{numerator:allOfTwo.toString(),probability:frac(allOfTwo)},
  allThreeCoresCompletelyPrized:{numerator:allOfThree.toString(),probability:frac(allOfThree)},
  atLeastOneOfThreeCoresCompletelyPrized:{numerator:atLeastOne.toString(),probability:frac(atLeastOne)},
  interpretation:'conditional six-Prize configuration event; not a game loss or full setup failure'
 });
}
function firstTurnDrawEnvelope(){
 // Starting 7 are checked for the at-least-one-Basic setup rule.
 // After six Prizes are dealt, the ordinary turn draw is uniformly one
 // of the 53 remaining cards *marginally*. We enumerate this 7+1 event
 // exactly, without making the player's six Prize identities visible.
 const kinds=[2,9,4,6,39]; // Budew, other Basics, Float, Quick/VIP, other
 const subsets={direct:0n,drawBudewWithFloat:0n,searchFloatWithoutBudew:0n};
 for(let b=0;b<=2;b++){
  for(let a=0;a<=Math.min(9,7-b);a++){
   for(let f=0;f<=Math.min(4,7-b-a);f++){
    for(let q=0;q<=Math.min(6,7-b-a-f);q++){
     const other=7-b-a-f-q;
     if(other<0||other>39||b+a<1)continue;
     const selected=[b,a,f,q,other];
     let ways=1n;
     selected.forEach((n,i)=>{ways*=choose(kinds[i],n)});
     for(let drawn=0;drawn<5;drawn++){
      const rem=kinds[drawn]-selected[drawn];
      if(rem<1)continue;
      const count=ways*BigInt(rem);
      if(b>0){
       subsets.direct+=count;
      }else if(drawn===0&&f>0){
       // Budew arrives in the ordinary turn draw; Float already in seven.
       subsets.drawBudewWithFloat+=count;
      }else if(drawn!==0&&(f+(drawn===2?1:0))>0&&(q+(drawn===3?1:0))>0){
       // Budew absent among eight seen; Quick/VIP can search it *unless*
       // both Budew are sequestered among the six face-down Prizes.
       subsets.searchFloatWithoutBudew+=count;
      }
     }
    }
   }
  }
 }
 const denominator=(choose(60,7)-choose(49,7))*53n;
 const total=subsets.direct+subsets.drawBudewWithFloat+subsets.searchFloatWithoutBudew;
 // Conditional on all 8 seen excluding Budew: 6 Prizes are uniformly a
 // subset of the 52 unseen cards, 2 of which are Budew. Both inaccessible:
 // C(50,4)/C(52,6) = 6*5/(52*51). Full calculation uses exact integers.
 const prizeDen=choose(52,6);
 const prizeBoth=choose(50,4);
 const prizedAdjustedNumerator=
  (subsets.direct+subsets.drawBudewWithFloat)*prizeDen+
  subsets.searchFloatWithoutBudew*(prizeDen-prizeBoth);
 const fraction=n=>Number(n)/Number(denominator);
 return{
  denominator:denominator.toString(),
  direct:{count:subsets.direct.toString(),probability:fraction(subsets.direct)},
  firstDrawBudewPlusFloat:{count:subsets.drawBudewWithFloat.toString(),
    probability:fraction(subsets.drawBudewWithFloat)},
  searchFloatNoBudewSeen:{count:subsets.searchFloatWithoutBudew.toString(),
    probability:fraction(subsets.searchFloatWithoutBudew)},
  union:{count:total.toString(),probability:fraction(total)},
  chanceBothUnseenBudewPrizeGivenNoBudewSeenEight:
   Number(prizeBoth)/Number(prizeDen),
  prizeAdjustedUnion:{
   numerator:prizedAdjustedNumerator.toString(),
   denominator:(denominator*prizeDen).toString(),
   probability:Number(prizedAdjustedNumerator)/Number(denominator*prizeDen)
  },
  interpretation:'resource-presence upper envelope; does not model Quick Ball discard or available tools/attack effects, may miss other search routes'
 };
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
  firstTurnDrawResourceEnvelope:firstTurnDrawEnvelope(),
  twoCopyCorePrizeCollapse:twoCopyCorePrizeCollapse(),
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
module.exports={HAND,basicNames,choose,intersectAllPresent,twoCopyCorePrizeCollapse,firstTurnDrawEnvelope,calculate};
