'use strict';

const path = require('node:path');
const {choose} = require('./aichi-bunnelby-bench-priority.cjs');

/**
 * Exact physical 7-card opening and one turn draw. The viewed eight are
 * unordered; each possible eighth (turn-draw) physical card has equal weight.
 * At least one Bunnelby must occur in the actual first seven, while an
 * evolving Basic and a G&H/Tag Call are visible among all eight.
 *
 * @param {{b:number,e:number,h:number,other:number}} source
 * @param {number} [opening]
 * @param {number} [viewed]
 * @returns {{numerator:bigint,denominator:bigint}}
 */
function exactVisibility({b,e,h,other},opening=7,viewed=8) {
  if (![b,e,h,other,opening,viewed].every(Number.isInteger) ||
      Math.min(b,e,h,other,opening,viewed)<0 ||
      opening>viewed || viewed>b+e+h+other) {
    throw new Error('Invalid source partition or opening/view dimensions');
  }
  const total=b+e+h+other;
  const denominator=choose(total,viewed)*choose(viewed,opening);
  let numerator=0n;
  for(let nb=1;nb<=Math.min(b,viewed);nb++){
    for(let ne=1;ne<=Math.min(e,viewed-nb);ne++){
      for(let nh=1;nh<=Math.min(h,viewed-nb-ne);nh++){
        const no=viewed-nb-ne-nh;
        if(no<0||no>other)continue;
        const visibleWays=choose(b,nb)*choose(e,ne)*
          choose(h,nh)*choose(other,no);
        const actualOpeningWays=choose(viewed,opening)-
          choose(viewed-nb,opening);
        numerator+=visibleWays*actualOpeningWays;
      }
    }
  }
  return {numerator,denominator};
}

/** Source-check rank-2 visibility gate without simulating gameplay. */
function rank2Visibility() {
  const field=require(path.resolve(__dirname,'../results/aichi-2026/full-decklists.json'));
  const rank2=field.decks.find(d=>d.rank===2);
  if(rank2?.archetype!=='Vileplume Control') {
    throw new Error('Aichi printed rank-2 source changed');
  }
  const counts=new Map(rank2.cards.map(c=>[c.name,c.count]));
  const total=rank2.cards.reduce((sum,c)=>sum+c.count,0);
  const b=counts.get('Bunnelby')||0;
  const e=['Pidgey','Oddish','Lillipup'].reduce((sum,n)=>sum+(counts.get(n)||0),0);
  const h=['Guzma & Hala','Tag Call'].reduce((sum,n)=>sum+(counts.get(n)||0),0);
  const basicTotal=['Bunnelby','Pidgey','Oddish','Lillipup','Fan Rotom',
    'Relicanth','Mr. Mime','Girafarig','Budew','Jirachi']
    .reduce((sum,n)=>sum+(counts.get(n)||0),0);
  if(total!==60||b!==2||e!==6||h!==8||basicTotal!==14){
    throw new Error('Rank-2 source composition requires re-audit');
  }
  const exact=exactVisibility({b,e,h,other:total-b-e-h});
  const legal=choose(total,7)-choose(total-basicTotal,7);
  const firstSeven=choose(total,7);
  return {
    sourceRank:2,
    event:'Bunnelby in initial seven; evolving Basic and Guzma & Hala/Tag Call in first eight',
    opening:7,viewed:8,
    numerator:exact.numerator.toString(),
    denominator:exact.denominator.toString(),
    unconditionalProbability:Number(exact.numerator)/Number(exact.denominator),
    validOpeningProbability:Number(legal)/Number(firstSeven),
    conditionalOnLegalOpening:
      Number(exact.numerator*firstSeven)/Number(exact.denominator*legal),
    scope:'Visibility only; does not require unprized search resources, two acceptable discards, Special Energy, Tool, TM attack or successful evolution'
  };
}

if(require.main===module)console.log(JSON.stringify(rank2Visibility(),null,2));
module.exports={exactVisibility,rank2Visibility};
