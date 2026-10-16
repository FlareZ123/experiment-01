'use strict';
const field = require('../results/aichi-2026/full-decklists.json');
const {choose, regidragoTempleResponses} = require('./regidrago-temple-answers.cjs');

const BASIC_ENERGY = new Set([
  'Grass Energy','Fire Energy','Water Energy','Lightning Energy',
  'Psychic Energy','Fighting Energy','Darkness Energy',
  'Metal Energy','Fairy Energy'
]);

/**
 * Exact opening-seven + next-draw + hidden-six-Prize probability of holding
 * a direct Temple answer or a usable route from a ball/treasure to an
 * unprized Resetting Hole Marshadow.
 *
 * A searcher pays its one-card discard if another searcher or a card in the
 * designated spendable category is among the observed eight cards.
 * All categories are disjoint. Strategic value, actions and locks are
 * deliberately outside the model.
 *
 * @param {{size?:number,opening?:number,prizes?:number,basics:number,
 *   outs:number,marshadow:number,searchers:number,spendable:number}} p
 * @returns {{numerator:string,denominator:string,probability:number}}
 */
function discardSensitiveSearchAccess(p) {
  const {size=60,opening=7,prizes=6,basics,outs,marshadow,searchers,spendable}=p;
  if (![size,opening,prizes,basics,outs,marshadow,searchers,spendable]
    .every(Number.isInteger) || size<=opening+prizes ||
    opening<1 || prizes<0 || basics<1 || marshadow<0 || marshadow>1 ||
    marshadow>basics || outs<0 || searchers<0 || spendable<0 ||
    basics+outs+searchers+spendable>size) {
    throw new RangeError('Invalid disjoint deck category counts');
  }
  const otherBasics=basics-marshadow;
  const other=size-basics-outs-searchers-spendable;
  const counts=[outs,marshadow,searchers,otherBasics,spendable,other];
  const remainder=BigInt(size-opening-1);
  const liveDeck=remainder-BigInt(prizes);
  let valid=0n,denominator=0n,numerator=0n;
  for(let u=0;u<=Math.min(opening,outs);u++)
    for(let m=0;m<=Math.min(opening-u,marshadow);m++)
      for(let q=0;q<=Math.min(opening-u-m,searchers);q++)
        for(let b=0;b<=Math.min(opening-u-m-q,otherBasics);b++)
          for(let d=0;d<=Math.min(opening-u-m-q-b,spendable);d++) {
            const n=opening-u-m-q-b-d;
            if(n<0||n>other||m+b===0)continue;
            const ways=choose(outs,u)*choose(marshadow,m)*
              choose(searchers,q)*choose(otherBasics,b)*
              choose(spendable,d)*choose(other,n);
            valid+=ways;
            const drawn=[u,m,q,b,d,n];
            for(let next=0;next<counts.length;next++) {
              const remaining=counts[next]-drawn[next];
              if(remaining<=0)continue;
              const weight=ways*BigInt(remaining);
              denominator+=weight*remainder;
              const direct=u>0||next===0||(m>0&&b>0)||next===1;
              const seenSearchers=q+(next===2?1:0);
              const seenSpendable=d+(next===4?1:0);
              const canPay=seenSearchers>=2||seenSpendable>=1;
              const searchable=marshadow===1&&m===0&&next!==1&&
                seenSearchers>=1&&canPay;
              if(direct)numerator+=weight*remainder;
              else if(searchable)numerator+=weight*liveDeck;
            }
          }
  const expected=choose(size,opening)-choose(size-basics,opening);
  if(valid!==expected||
      denominator!==valid*BigInt(size-opening)*remainder) {
    throw new Error('Exact hand/draw/Prize partition failed');
  }
  return {
    numerator:numerator.toString(),
    denominator:denominator.toString(),
    probability:Number(numerator)/Number(denominator)
  };
}

/** @returns {object[]} Sensitivity scenarios for nine source-printed Regidrago lists. */
function aichiDiscardSensitivity() {
  const source=regidragoTempleResponses().rows;
  return source.map(row=>{
    const deck=field.decks.find(d=>d.rank===row.rank);
    const count=predicate=>deck.cards
      .reduce((sum,card)=>sum+(predicate(card)?card.count:0),0);
    const searchers=count(c=>c.name==='Quick Ball'||c.name==='Mysterious Treasure');
    const basicEnergy=count(c=>BASIC_ENERGY.has(c.name));
    const allEnergy=count(c=>c.name.endsWith('Energy'));
    const base={
      basics:row.basics,
      outs:row.stadiums+row.removalItems,
      marshadow:row.marshadow,
      searchers
    };
    const evaluate=spendable=>discardSensitiveSearchAccess({
      ...base,spendable
    }).probability;
    return {
      rank:row.rank,searchers,basicEnergy,allEnergy,
      direct:row.includingBenchMarshadow,
      duplicatedSearchersOnly:evaluate(0),
      basicEnergySpendable:evaluate(basicEnergy),
      allEnergySpendable:evaluate(allEnergy)
    };
  });
}

if(require.main===module)
  process.stdout.write(JSON.stringify(aichiDiscardSensitivity(),null,2)+'\n');
module.exports={discardSensitiveSearchAccess,aichiDiscardSensitivity};
