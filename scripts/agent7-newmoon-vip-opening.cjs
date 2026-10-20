'use strict';

const assert=require('node:assert/strict');
const source=require('../results/als/new-moon-perfection-source-60.json');
const field=require('../results/aichi-2026/full-decklists.json');

/** @param {bigint} n @param {bigint} k @returns {bigint} */
function choose(n,k) {
  assert.ok(n>=0n&&k>=0n);
  if(k>n)return 0n;
  let result=1n;
  for(let i=1n;i<=k;i++)result=result*(n-i+1n)/i;
  return result;
}
/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b){while(b!==0n)[a,b]=[b,a%b];return a;}
/** @param {bigint} n @param {bigint} d @returns {{n:bigint,d:bigint}} */
function frac(n,d){assert.ok(d>0n);const k=gcd(n,d);return {n:n/k,d:d/k};}
/** @param {{n:bigint,d:bigint}} a @param {{n:bigint,d:bigint}} b */
function minus(a,b){return frac(a.n*b.d-b.n*a.d,a.d*b.d);}
/** @param {{n:bigint,d:bigint}} a @param {{n:bigint,d:bigint}} b */
function divide(a,b){return frac(a.n*b.d,a.d*b.n);}

/**
 * Resource-only probability that the specified Item occurs in an original
 * starting 7 plus the player's first ordinary turn draw, conditioned on at
 * least one Basic in the opening 7. Random 6 Prizes are exchangeable with
 * remaining slots. Excludes mulligan bonus draws, search, opponent locks,
 * hand disposal and Board constraints.
 * @param {number} basics Actual count of Basic Pokémon in frozen 60.
 * @param {number} copies Item copies in frozen 60.
 * @returns {{n:bigint,d:bigint}}
 */
function firstEightItemGivenLegalSeven(basics,copies) {
  const N=60n,B=BigInt(basics),V=BigInt(copies);
  assert.ok(B>=1n&&V>=0n&&B+V<=N);
  const legal=frac(choose(N,7n)-choose(N-B,7n),choose(N,7n));
  const noItem=frac(choose(N-V,8n),choose(N,8n));
  // Seven initial cards are neither Item nor Basic; next is any non-Item.
  const noItemNoBasic=frac(choose(N-B-V,7n)*(N-V-7n),
    choose(N,7n)*(N-7n));
  return divide(minus(legal,minus(noItem,noItemNoBasic)),legal);
}

/** @returns {object} Frozen two-candidate resource comparison. */
function run(){
  assert.equal(source.entries.reduce((n,c)=>n+c.count,0),60);
  const count=(entries,name,field)=>entries
    .filter(row=>row[field]===name).reduce((n,row)=>n+row.count,0);
  const reference=field.decks.find(row=>row.rank===1);
  assert.ok(reference);
  const vipNewMoon=count(source.entries,'Battle VIP Pass','name_en');
  const vipReference=count(reference.cards,'Battle VIP Pass','name');
  const pokemon=source.entries.filter(row=>row.type==='Pokémon');
  const allPokemon=pokemon.reduce((n,row)=>n+row.count,0);
  const dusclops=count(pokemon,'Dusclops','name_en');
  // Frozen source contains exactly this one Evolution family stage in its
  // Pokémon collection; all other Pokémon in this source are Basic.
  assert.equal(allPokemon,19);
  assert.equal(dusclops,2);
  assert.equal(vipNewMoon,4);
  assert.equal(vipReference,0);
  const basics=allPokemon-dusclops;
  const probability=firstEightItemGivenLegalSeven(basics,vipNewMoon);
  return {schema:'agent7-vip-resource-opportunity-v1',
    source:'new-moon-perfection-source-60.json and full-decklists.json',
    bothUnchangedDecks:[60,60],newMoonBasics:basics,
    newMoonBattleVipPassCopies:vipNewMoon,
    championBattleVipPassCopies:vipReference,
    newMoonConditionalFirstEightVipFraction:
      probability.n.toString()+'/'+probability.d.toString(),
    newMoonConditionalFirstEightVipPercent:
      Number(probability.n)*100/Number(probability.d),
    championFirstEightVipPercent:0,
    conditioning:'legal first seven with at least one Basic',
    excluded:'Item locks, other draw/search, Bench occupancy, discard costs, alternate optimal tactics, match performance',
    competitiveQualifiedGames:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={choose,firstEightItemGivenLegalSeven,run};
