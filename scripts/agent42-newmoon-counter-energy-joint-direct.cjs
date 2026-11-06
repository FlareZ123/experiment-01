'use strict';

const assert=require('node:assert/strict');
const {choose}=require('./new-moon-lockbreak-access.cjs');
const manifest=require('../results/als/new-moon-lockbreak-english-proxy-60.json');

/** @param {number} n Nonnegative segment size. */
function allocations(n){
  const a=[];
  for(let basics=0;basics<=n;basics++){
    for(let item=0;item<=n-basics;item++){
      for(let energy=0;energy<=n-basics-item;energy++){
        const other=n-basics-item-energy;
        a.push([basics,item,energy,other]);
      }
    }
  }
  return a;
}

/** @param {number[]} stock @param {number[]} taken @returns {bigint} */
function ways(stock,taken){
  let result=1n;
  for(let i=0;i<4;i++){
    if(taken[i]>stock[i])return 0n;
    result*=choose(stock[i],taken[i]);
  }
  return result;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b){
  while(b!==0n)[a,b]=[b,a%b];
  return a;
}

/** @param {bigint} numerator @param {bigint} denominator */
function ratio(numerator,denominator){
  assert.ok(denominator>0n);
  const d=gcd(numerator,denominator);
  return Object.freeze({
    numerator:String(numerator/d),denominator:String(denominator/d),
    probability:Number(numerator)/Number(denominator)
  });
}

/**
 * Exact disjoint physical windows of a fixed shuffled sixty, conditional on
 * an initial seven with at least one Basic. The six face-down Prize positions
 * remain exchangeable with future draw positions before setup; this is an
 * access-only combinatorial screen, not a playable attack or win metric.
 *
 * Categories: 17 Basic Pokemon, 2 of one named counter Item, 6 Energy cards,
 * 35 other cards. Windows: starting seven; first mandatory draw; next two
 * mandatory draws. Does not grant the attacker any additional search, draw,
 * acceleration, opponent-mulligan bonus or discarded attack donor.
 * @returns {object} Exact reduced fractions and decimal probabilities.
 */
function directEarlyCounterAndEnergy(){
  const counts=name=>manifest.entries.filter(e=>e.name_en===name)
    .reduce((sum,e)=>sum+e.count,0);
  assert.equal(manifest.counts.total,60);
  assert.equal(manifest.counts['Pokémon'],19);
  assert.equal(manifest.counts.Energy,6);
  assert.equal(counts('Canceling Cologne'),2);
  assert.equal(counts('Field Blower'),2);
  const stock=[17,2,6,35];
  let legal=0n,itemWindow=0n,joint=0n;
  for(const first of allocations(7)){
    if(first[0]===0)continue;
    const w0=ways(stock,first);
    if(w0===0n)continue;
    const afterFirst=stock.map((x,i)=>x-first[i]);
    for(const draw of allocations(1)){
      const w1=ways(afterFirst,draw);
      if(w1===0n)continue;
      const afterDraw=afterFirst.map((x,i)=>x-draw[i]);
      for(const nextTwo of allocations(2)){
        const w2=ways(afterDraw,nextTwo);
        if(w2===0n)continue;
        const weight=w0*w1*w2;
        legal+=weight;
        if(first[1]+draw[1]>=1){
          itemWindow+=weight;
          if(first[2]+draw[2]+nextTwo[2]>=3)joint+=weight;
        }
      }
    }
  }
  const expected=require('./new-moon-lockbreak-access.cjs')
    .directByFirstDraw(17,2);
  const item=ratio(itemWindow,legal);
  assert.equal(item.numerator,expected.numerator);
  assert.equal(item.denominator,expected.denominator);
  return Object.freeze({
    schema:'agent42-newmoon-direct-item-and-three-energy-window-v1',
    fixedListHash:manifest.canonical_id_count_sha256,
    initialSevenCondition:'at least one of 17 Basic Pokemon',
    randomWindow:'7 starting +1 first draw +2 next draws, excludes Prize cards',
    categories:Object.freeze({basics:17,namedCounterItem:2,energy:6,other:35}),
    firstEightCounterItem:item,
    firstEightCounterAndFirstTenThreeEnergy:ratio(joint,legal),
    qualification:'Direct-only resource visibility; no search, Powerglass, donor, Item/Ability legality, turns attached, opponent bonus draws, counterplay, or game outcomes'
  });
}

if(require.main===module){
  process.stdout.write(JSON.stringify(directEarlyCounterAndEnergy(),null,2)+'\n');
}
module.exports={allocations,ways,directEarlyCounterAndEnergy};
