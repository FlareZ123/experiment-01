'use strict';
const assert=require('node:assert/strict');
const source=require('../results/aichi-2026/full-decklists.json').decks.find(d=>d.rank===6);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(k<0||k>n)return 0n;
  let v=1n;const m=Math.min(k,n-k);
  for(let i=1;i<=m;i++)v=v*BigInt(n-m+i)/BigInt(i);
  return v;
}
/** @param {number} n @param {number} k @returns {bigint} */
function falling(n,k){
  if(k<0||n<k)return 0n;
  let v=1n;for(let i=0;i<k;i++)v*=BigInt(n-i);
  return v;
}
/** @param {bigint} a @param {bigint} b */
function gcd(a,b){while(b)[a,b]=[b,a%b];return a;}

/**
 * Inclusion-exclusion of all designated disjoint non-Basic groups appearing
 * in opening hand plus ordered ordinary draws. A valid opening has a Basic.
 * Unknown Prize locations are marginalized exactly under physical dealing.
 * No searches, triggered draws, attachments, Supporters, or attacks counted.
 * @param {{size:number,basics:number,hand:number,prizes:number,
 *   later:number,groups:number[]}} x
 */
function allGroupsDirect(x){
  const {size,basics,hand,prizes,later,groups}=x;
  assert.ok(Array.isArray(groups)&&groups.length<=10);
  assert.ok([size,basics,hand,prizes,later,...groups]
    .every(Number.isSafeInteger));
  assert.ok(size>=hand+prizes+later&&hand>0&&basics>0&&
    prizes>=0&&later>=0&&groups.every(v=>v>=0));
  assert.ok(groups.reduce((a,b)=>a+b,0)<=size-basics);
  const denominator=(choose(size,hand)-choose(size-basics,hand))*
    falling(size-hand,later);
  assert.ok(denominator>0n);
  let numerator=0n;
  for(let mask=0;mask<2**groups.length;mask++){
    let absent=0,odd=0;
    for(let i=0;i<groups.length;i++)if(mask&(1<<i)){
      absent+=groups[i];odd^=1;
    }
    const ways=(choose(size-absent,hand)-
      choose(size-absent-basics,hand))*falling(size-absent-hand,later);
    numerator+=odd?-ways:ways;
  }
  assert.ok(numerator>=0n&&numerator<=denominator);
  const d=gcd(numerator,denominator);
  return {numerator:String(numerator/d),denominator:String(denominator/d),
    percent:100*Number(numerator)/Number(denominator)};
}
/** @returns {object} */
function rank6DirectGuzmaAndEnergy(){
  assert.ok(source&&source.cards.reduce((v,c)=>v+c.count,0)===60);
  const copies=(name,set,number)=>source.cards.filter(c=>c.name===name&&
    c.printing?.set===set&&c.printing?.number===number)
    .reduce((n,c)=>n+c.count,0);
  const basics=copies('Iron Thorns ex','TWM','77');
  const speed=copies('Speed Lightning Energy','RCL','173');
  const dce=copies('Double Colorless Energy','SUM','136');
  const guzma=copies('Guzma','BUS','115');
  assert.deepEqual([basics,speed,dce,guzma],[4,4,1,3]);
  assert.equal(source.cards.filter(c=>c.category==='Pokémon')
    .reduce((n,c)=>n+c.count,0),4);
  const base={size:60,basics,hand:7,prizes:6,later:2};
  return {
    schema:'rank6-direct-t2-guzma-energy-v1',
    sourceRank:6,
    printedSource:{basics,speedLightning:speed,doubleColorless:dce,guzma},
    speedAndDce:allGroupsDirect({...base,groups:[speed,dce]}),
    guzma:allGroupsDirect({...base,groups:[guzma]}),
    fundedAndGuzma:allGroupsDirect({...base,groups:[speed,dce,guzma]}),
    scope:'Basic-valid opening seven, plus two normal draws: both Energy and Guzma seen. Either Energy can be attached first; the other by second own turn. Excludes all additional draw including Speed Lightning triggered draws, search, policy, interference, opponent Bench, and matches.',
    competitiveGamesQualified:0
  };
}
if(require.main===module)console.log(JSON.stringify(rank6DirectGuzmaAndEnergy(),null,2));
module.exports={choose,falling,allGroupsDirect,rank6DirectGuzmaAndEnergy};
