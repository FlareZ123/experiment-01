'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const SOURCE_BASIC_NAMES=[
  'Mega Absol ex','Trubbish','Oranguru V','Latias ex',
  'Tapu Lele-GX','Crobat V','Squawkabilly ex'
];

/**
 * @param {{decks:{rank:number,cards:{name:string,count:number}[]}[]}} roster
 * @returns {{vip:number,trubbish:number,garbodor:number,otherBasic:number,other:number}}
 */
function rank11Counts(roster){
  const entries=roster.decks.find(d=>d.rank===11)?.cards;
  assert.ok(entries,'Original Aichi rank11 sixty required');
  const counts=new Map(entries.map(c=>[c.name,c.count]));
  const total=entries.reduce((n,c)=>n+c.count,0);
  const basic=SOURCE_BASIC_NAMES.reduce((n,name)=>n+(counts.get(name)??0),0);
  const vip=counts.get('Battle VIP Pass')??0;
  const trubbish=counts.get('Trubbish')??0;
  const garbodor=counts.get('Garbodor')??0;
  const otherBasic=basic-trubbish;
  const other=total-vip-trubbish-garbodor-otherBasic;
  assert.equal(total,60);
  assert.deepEqual([vip,trubbish,garbodor,otherBasic,other],[4,2,2,9,43]);
  return {vip,trubbish,garbodor,otherBasic,other};
}

/** @param {number} n @param {number} k @returns {bigint} */
function combination(n,k){
  if(k<0||k>n)return 0n;
  let result=1n;
  for(let i=1;i<=Math.min(k,n-k);i++){
    result=result*BigInt(n-i+1)/BigInt(i);
  }
  return result;
}

/**
 * Exact multivariate hypergeometric placement under the standard setup:
 * 7 initial hand cards, 6 random Prize cards, and 1 initial turn draw.
 * All cards are physical identities. Conditional denominator includes
 * only hands with at least one Basic, so it models a legal opening seven
 * after the player's own mulligan re-draws.
 *
 * The target event is 1+ VIP in the eight seen cards; 1+ Trubbish left
 * in the searchable 46-card deck; 1+ Garbodor outside the six Prizes.
 * It does not assert legal VIP play, open Bench, other setup or tactical use.
 *
 * @param {{vip:number,trubbish:number,garbodor:number,otherBasic:number,other:number}} counts
 * @returns {object} BigInt exact counts and normalized ratios.
 */
function exactRank11VipWindow(counts){
  const categories=Object.entries(counts);
  const total=categories.reduce((sum,[,n])=>sum+n,0);
  assert.equal(total,60);
  let states=new Map([['0:0:0:0:0:0:0',1n]]);
  for(const [name,n] of categories){
    const next=new Map();
    for(const [state,ways] of states){
      const [H,P,D,B,V,T,G]=state.split(':').map(Number);
      for(let h=0;h<=Math.min(n,7-H);h++){
        for(let p=0;p<=Math.min(n-h,6-P);p++){
          for(let d=0;d<=Math.min(n-h-p,1-D);d++){
            const flagBasic=B||(
              (name==='trubbish'||name==='otherBasic')&&h>0);
            const flagVip=V||(name==='vip'&&(h+d)>0);
            const flagTrubbish=T||(name==='trubbish'&&n-h-p-d>0);
            const flagGarbodor=G||(name==='garbodor'&&p<n);
            const key=[H+h,P+p,D+d,Number(flagBasic),Number(flagVip),
              Number(flagTrubbish),Number(flagGarbodor)].join(':');
            const factor=combination(n,h)*combination(n-h,p)*
              combination(n-h-p,d);
            next.set(key,(next.get(key)??0n)+ways*factor);
          }
        }
      }
    }
    states=next;
  }
  let all=0n,valid=0n,vip=0n,vipTrubbish=0n,vipTrubbishGarbodor=0n;
  for(const [key,ways] of states){
    const [H,P,D,B,V,T,G]=key.split(':').map(Number);
    if(H!==7||P!==6||D!==1)continue;
    all+=ways;
    if(!B)continue;
    valid+=ways;
    if(!V)continue;
    vip+=ways;
    if(!T)continue;
    vipTrubbish+=ways;
    if(G)vipTrubbishGarbodor+=ways;
  }
  assert.equal(all,combination(60,7)*combination(53,6)*47n);
  const conditional=number=>Number(number)/Number(valid);
  return {counts,denominatorUnconditional:all,denominatorValidOpening:valid,
    numeratorVipSeen:vip,numeratorVipWithTrubbishDeck:vipTrubbish,
    numeratorVipTrubbishAndGarbodorAccessible:vipTrubbishGarbodor,
    probabilityValidOpening:Number(valid)/Number(all),
    probabilityVipSeenGivenValid:conditional(vip),
    probabilityVipAndTrubbishGivenValid:conditional(vipTrubbish),
    probabilityAllGivenValid:conditional(vipTrubbishGarbodor),
    qualification:'Card-location combinatorics only; VIP legal action and any Garbotoxin turn remain unverified.'};
}

if(require.main===module){
  const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  const exact=exactRank11VipWindow(rank11Counts(roster));
  process.stdout.write(JSON.stringify(exact,(k,v)=>typeof v==='bigint'?
    v.toString():v,null,2)+'\n');
}
module.exports={SOURCE_BASIC_NAMES,rank11Counts,combination,
  exactRank11VipWindow};
