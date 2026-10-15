'use strict';
const field=require('../results/aichi-2026/full-decklists.json');
const {choose,regidragoTempleResponses}=require('./regidrago-temple-answers.cjs');

/**
 * Restricted ideal search: direct Stadium/Item/benchable Marshadow response,
 * or a Quick Ball / Mysterious Treasure in the first eight with its single
 * Marshadow still in the post-Prize deck. Search discards, Item locks and
 * strategic opportunity costs are deliberately assumed away.
 *
 * @param {{size?:number,opening?:number,prizes?:number,basics:number,outs:number,marshadow:number,searchers:number}} p
 * @returns {{numerator:string,denominator:string,probability:number}}
 */
function optimisticSearchAccess(p) {
  const {size=60,opening=7,prizes=6,basics,outs,marshadow,searchers}=p;
  if (![size,opening,prizes,basics,outs,marshadow,searchers].every(Number.isInteger) ||
      opening<1 || prizes<0 || size-opening-1-prizes<0 || basics<1 ||
      marshadow<0 || marshadow>1 || marshadow>basics ||
      outs<0 || searchers<0 || basics+outs+searchers>size) {
    throw new RangeError('Invalid search model category counts');
  }
  const otherBasics=basics-marshadow;
  const other=size-basics-outs-searchers;
  const counts=[outs,marshadow,searchers,otherBasics,other];
  const scale=BigInt(size-opening-1);
  const liveDeck=scale-BigInt(prizes);
  let valid=0n,denominator=0n,numerator=0n;
  for(let u=0;u<=Math.min(opening,outs);u++)
    for(let m=0;m<=Math.min(opening-u,marshadow);m++)
      for(let q=0;q<=Math.min(opening-u-m,searchers);q++)
        for(let b=0;b<=Math.min(opening-u-m-q,otherBasics);b++) {
          const n=opening-u-m-q-b;
          if(n<0||n>other||m+b===0)continue;
          const ways=choose(outs,u)*choose(marshadow,m)*
            choose(searchers,q)*choose(otherBasics,b)*choose(other,n);
          valid+=ways;
          const hand=[u,m,q,b,n];
          for(let next=0;next<counts.length;next++) {
            const left=counts[next]-hand[next];
            if(left<=0)continue;
            const w=ways*BigInt(left);
            denominator+=w*scale;
            const direct=(u>0||next===0||(m>0&&b>0)||next===1);
            const canSearch=(marshadow===1 && m===0 && next!==1 &&
              (q>0||next===2));
            if(direct)numerator+=w*scale;
            else if(canSearch)numerator+=w*liveDeck;
          }
        }
  const expected=choose(size,opening)-choose(size-basics,opening);
  if(valid!==expected ||
      denominator!==valid*BigInt(size-opening)*scale) {
    throw new Error('Invalid exact probability partition');
  }
  return {
    numerator:numerator.toString(),denominator:denominator.toString(),
    probability:Number(numerator)/Number(denominator)
  };
}

/** @returns {object[]} Exact source counts and restricted search opportunities. */
function aichiSearchAccess() {
  const original=regidragoTempleResponses().rows;
  return original.map(row=>{
    const deck=field.decks.find(x=>x.rank===row.rank);
    const searchers=deck.cards.filter(c=>
      c.name==='Quick Ball'||c.name==='Mysterious Treasure')
      .reduce((sum,c)=>sum+c.count,0);
    const calc=faba=>optimisticSearchAccess({
      basics:row.basics,outs:row.stadiums+row.removalItems+(faba?row.faba:0),
      marshadow:row.marshadow,searchers
    }).probability;
    return {...row,searchers,idealAccess:calc(false),idealWithFaba:calc(true)};
  });
}
if(require.main===module)console.log(JSON.stringify(aichiSearchAccess(),null,2));
module.exports={optimisticSearchAccess,aichiSearchAccess};
