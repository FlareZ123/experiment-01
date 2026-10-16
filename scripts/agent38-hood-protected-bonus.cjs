'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {bonusExactly,bonusAtLeast}=require('./aichi_bonus_draws.cjs');
const {mulliganProbability,loadBasicIndex,audit}=require('./aichi_opening_audit.cjs');
const V=0,M=1,H=2,A=3,B=4;
/** @param {number} n @returns {bigint[][]} */
function binomial(n) {
  const c=Array.from({length:n+1},()=>Array(n+1).fill(0n));
  for(let i=0;i<=n;i++) {
    c[i][0]=c[i][i]=1n;
    for(let k=1;k<i;k++)c[i][k]=c[i-1][k-1]+c[i-1][k];
  }
  return c;
}
/**
 * @param {number[]} available
 * @param {number} count
 * @param {bigint[][]} choose
 * @param {(picked:number[],weight:bigint)=>void} visit
 */
function select(available,count,choose,visit) {
  const picked=Array(available.length).fill(0);
  function walk(i,left,weight) {
    if(i===available.length-1) {
      if(left<=available[i]) {
        picked[i]=left;
        visit(picked.slice(),weight*choose[available[i]][left]);
      }
      return;
    }
    for(let n=0;n<=Math.min(available[i],left);n++) {
      picked[i]=n;
      walk(i+1,left-n,weight*choose[available[i]][n]);
    }
  }
  walk(0,count,1n);
}
/**
 * Exact natural turn-two Shadow Rider VMAX with direct Stealthy Hood or Arven
 * and a remaining Hood in deck. Counts are conditional on valid opening.
 * Groups [Shadow Rider V,VMAX,Hood,Arven,other Basics,other nonbasics].
 * @param {{groups:number[],bonusDraws:number,openingSize?:number,prizeCount?:number}} config
 */
function exactProtectedHood(config) {
  const {groups,bonusDraws:d,openingSize:h=7,prizeCount:p=6}=config;
  if(!Array.isArray(groups)||groups.length!==6||
     groups.some(x=>!Number.isInteger(x)||x<0)||
     ![d,h,p].every(Number.isInteger)||d<0||h<1||p<0) {
    throw new RangeError('Invalid source categories, opening or bonuses');
  }
  const total=groups.reduce((a,b)=>a+b,0);
  if(groups[V]<1||groups[M]<1||groups[H]<1||total<h+p+d+2) {
    throw new RangeError('Insufficient resources or available ordinary draws');
  }
  const c=binomial(total),seenCount=h+d+1;
  const unknown=total-seenCount,pool=unknown-p;
  const denominator=c[total][h]*c[total-h][d+1]*
    c[unknown][p]*BigInt(pool);
  const sums={valid:0n,ready:0n,direct:0n,arven:0n,available:0n};
  select(groups,h,c,(opening,ow)=>{
    if(opening[V]+opening[B]===0)return;
    select(groups.map((x,i)=>x-opening[i]),d+1,c,(extra,ew)=>{
      const seen=opening.map((x,i)=>x+extra[i]);
      if(seen[V]===0) {
        sums.valid+=ow*ew*c[unknown][p]*BigInt(pool);
        return;
      }
      const remain=groups.map((x,i)=>x-seen[i]);
      const other=unknown-remain[M]-remain[H]-remain[A];
      for(let pm=0;pm<=Math.min(remain[M],p);pm++)
      for(let ph=0;ph<=Math.min(remain[H],p-pm);ph++)
      for(let pa=0;pa<=Math.min(remain[A],p-pm-ph);pa++) {
        const pOther=p-pm-ph-pa;
        if(pOther>other)continue;
        const base=ow*ew*c[remain[M]][pm]*c[remain[H]][ph]*
          c[remain[A]][pa]*c[other][pOther];
        const dm=remain[M]-pm,dh=remain[H]-ph,da=remain[A]-pa;
        const otherDraws=pool-dm-dh-da;
        for(const [draw,frequency] of [
          ['M',dm],['H',dh],['A',da],['O',otherDraws]
        ]) {
          if(!frequency)continue;
          const weight=base*BigInt(frequency);
          const ready=seen[M]>0||draw==='M';
          const direct=seen[H]>0||draw==='H';
          const arven=seen[A]>0||draw==='A';
          sums.valid+=weight;
          if(ready) {
            sums.ready+=weight;
            if(direct) {
              sums.direct+=weight;
              sums.available+=weight;
            } else if(arven&&dh>0) {
              sums.arven+=weight;
              sums.available+=weight;
            }
          }
        }
      }
    });
  });
  return {
    probabilities:Object.fromEntries(Object.entries(sums)
      .filter(([name])=>name!=='valid')
      .map(([name,count])=>[name,Number(count)/Number(sums.valid)])),
    counts:Object.fromEntries(Object.entries({...sums,denominator})
      .map(([name,count])=>[name,count.toString()])),
    validOpening:Number(sums.valid)/Number(denominator)
  };
}
/**
 * Exact two-player mulligan weighting, all bonuses taken, excess capped to
 * preserve first and second turn ordinary draws.
 * @param {number} opponentBasics
 * @param {number} ownBasics
 * @param {Array<Record<string,number>>} perK
 */
function weightedHood(opponentBasics,ownBasics,perK) {
  const a=mulliganProbability(opponentBasics),b=mulliganProbability(ownBasics);
  const cap=perK.length-1;
  if(cap<1)throw new RangeError('Incomplete bonus count array');
  const weights=perK.map((_,k)=>k===cap?
    bonusAtLeast(a,b,cap):bonusExactly(a,b,k));
  return Object.fromEntries(['ready','direct','arven','available'].map(key=>[
    key,perK.reduce((s,row,k)=>s+row[key]*weights[k],0)
  ]));
}
/**
 * @param {number[]} groups
 * @param {number} [openingSize]
 * @param {number} [prizeCount]
 * @returns {Array<Record<string,number>>}
 */
function allHoodBonuses(groups,openingSize=7,prizeCount=6) {
  const cap=groups.reduce((s,x)=>s+x,0)-openingSize-prizeCount-2;
  const result=[];
  for(let d=0;d<=cap;d++) result.push(exactProtectedHood({
    groups,bonusDraws:d,openingSize,prizeCount
  }).probabilities);
  return result;
}
/** @returns {number[]} */
function sourceHoodGroups() {
  const root=path.resolve(__dirname,'..');
  const {countsFromDeck}=require('./first-evolution-natural.cjs');
  const deck=JSON.parse(fs.readFileSync(path.join(
    root,'results/aichi-2026/candidate-hood-shadow-rider.json'),'utf8'));
  const stages=loadBasicIndex(path.join(root,'resources/cards/en'));
  const {basicCount,targetBasicCount,stageOneCount}=countsFromDeck(deck,stages);
  const copies=name=>deck.cards.filter(card=>card.name===name)
    .reduce((s,c)=>s+c.count,0);
  const hood=copies('Stealthy Hood'),arven=copies('Arven');
  const otherBasics=basicCount-targetBasicCount;
  const other=60-targetBasicCount-stageOneCount-hood-arven-otherBasics;
  return [targetBasicCount,stageOneCount,hood,arven,otherBasics,other];
}
if(require.main===module) {
  const root=path.resolve(__dirname,'..');
  const source=JSON.parse(fs.readFileSync(path.join(
    root,'results/aichi-2026/full-decklists.json'),'utf8'));
  const stages=loadBasicIndex(path.join(root,'resources/cards/en'));
  const rankBasics=audit(source.decks,stages).map(x=>({
    rank:x.rank,basics:x.basicCount
  }));
  const groups=sourceHoodGroups(),byBonus=allHoodBonuses(groups);
  const ownBasics=groups[V]+groups[B];
  const byOpponentBasics=Object.fromEntries([...new Set(rankBasics.map(x=>x.basics))]
    .sort((a,b)=>a-b).map(n=>[n,weightedHood(n,ownBasics,byBonus)]));
  process.stdout.write(JSON.stringify({
    groups,bonusCap:byBonus.length-1,byBonus,byOpponentBasics,rankBasics
  },null,2)+'\n');
}
module.exports={exactProtectedHood,weightedHood,allHoodBonuses,sourceHoodGroups};
