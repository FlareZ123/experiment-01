'use strict';
const {sourceScenarios}=require('./agent38-natural-gate-union.cjs');
const {bonusExactly,bonusAtLeast}=require('./aichi_bonus_draws.cjs');
const {mulliganProbability}=require('./aichi_opening_audit.cjs');
const R=0,S=1,H=2,M=3,V=4,B=5,W=6;

/** @param {number} n @returns {bigint[][]} */
function binomial(n) {
  const c=Array.from({length:n+1},()=>Array(n+1).fill(0n));
  for(let i=0;i<=n;i++) {
    c[i][0]=c[i][i]=1n;
    for(let k=1;k<i;k++) c[i][k]=c[i-1][k-1]+c[i-1][k];
  }
  return c;
}
/**
 * @param {number[]} available
 * @param {number} count
 * @param {bigint[][]} choose
 * @param {(chosen:number[],weight:bigint)=>void} visit
 */
function select(available,count,choose,visit) {
  const chosen=Array(available.length).fill(0);
  function walk(i,remaining,weight) {
    if(i===available.length-1) {
      if(remaining<=available[i]) {
        chosen[i]=remaining;
        visit(chosen.slice(),weight*choose[available[i]][remaining]);
      }
      return;
    }
    for(let v=0;v<=Math.min(available[i],remaining);v++) {
      chosen[i]=v;
      walk(i+1,remaining-v,weight*choose[available[i]][v]);
    }
  }
  walk(0,count,1n);
}

/**
 * Exact Gate, natural T2 and overlap resource probabilities with K optional
 * opponent mulligan bonus draws accepted after Prize setting.
 * Prize categories except Radiant and VMAX are integrated analytically.
 * Eight groups: [Radiant,search Items,Heavy Ball,VMAX,Rider V,
 * safe Basics,Wobbuffet,other nonbasics].
 * @param {{groups:number[],bonusDraws:number,openingSize?:number,prizeCount?:number}} config
 * @returns {{probabilities:Record<string,number>,counts:Record<string,string>,validOpening:number}}
 */
function jointWithBonuses(config) {
  const {groups,bonusDraws:d,openingSize:h=7,prizeCount:p=6}=config;
  if(!Array.isArray(groups)||groups.length!==8||groups[R]!==1||
     groups.some(n=>!Number.isInteger(n)||n<0)||
     ![d,h,p].every(Number.isInteger)||d<0||h<1||p<0) {
    throw new RangeError('Invalid category or setup inputs');
  }
  const n=groups.reduce((a,b)=>a+b,0);
  if(groups[M]<2||groups[V]+groups[B]+groups[W]<1||n<h+p+d+2) {
    throw new RangeError('Insufficient cards for two turn draws');
  }
  const c=binomial(n),seenLater=d+1,drawPool=n-h-p-seenLater;
  const denominator=c[n][h]*c[n-h][seenLater]*
    c[n-h-seenLater][p]*BigInt(drawPool);
  const count={valid:0n,gate:0n,natural:0n,overlap:0n};
  select(groups,h,c,(opening,ow)=>{
    if(!opening[R]&&!opening[V]&&!opening[B]&&!opening[W]) return;
    const safeStart=opening[V]+opening[B]>0;
    const afterOpening=groups.map((x,i)=>x-opening[i]);
    select(afterOpening,seenLater,c,(later,ew)=>{
      const seen=opening.map((x,i)=>x+later[i]);
      const unseen=groups.map((x,i)=>x-seen[i]);
      const uR=unseen[R],uM=unseen[M],other=n-h-seenLater-uR-uM;
      for(let prizedR=0;prizedR<=Math.min(uR,p);prizedR++) {
        for(let prizedM=0;prizedM<=Math.min(uM,p-prizedR);prizedM++) {
          const restPrized=p-prizedR-prizedM;
          if(restPrized>other) continue;
          const weight=ow*ew*c[uR][prizedR]*c[uM][prizedM]*c[other][restPrized];
          const deckR=uR-prizedR,deckM=uM-prizedM;
          const natural=seen[V]===0?0n:BigInt(seen[M]>0?drawPool:deckM);
          const gate=safeStart&&deckM>=2&&
            (seen[R]>0||(deckR>0&&seen[S]>0)||(prizedR>0&&seen[H]>0));
          count.valid+=weight*BigInt(drawPool);
          count.natural+=weight*natural;
          if(gate) {
            count.gate+=weight*BigInt(drawPool);
            count.overlap+=weight*natural;
          }
        }
      }
    });
  });
  const union=count.gate+count.natural-count.overlap;
  return {
    probabilities:Object.fromEntries(Object.entries({
      gate:count.gate,natural:count.natural,overlap:count.overlap,union
    }).map(([key,value])=>[key,Number(value)/Number(count.valid)])),
    counts:Object.fromEntries(Object.entries({...count,union,denominator})
      .map(([key,value])=>[key,value.toString()])),
    validOpening:Number(count.valid)/Number(denominator)
  };
}

/**
 * Marginalize exact two-player mulligan counts, including the capped tail.
 * @param {number} opponentBasics
 * @param {number} ownBasics
 * @param {Array<Record<string,number>>} conditionalByBonus
 * @returns {Record<string,number>}
 */
function weightedJoint(opponentBasics,ownBasics,conditionalByBonus) {
  const pa=mulliganProbability(opponentBasics),pb=mulliganProbability(ownBasics);
  const cap=conditionalByBonus.length-1;
  if(cap<1) throw new RangeError('Require at least two bonus scenarios');
  const weights=conditionalByBonus.map((_,i)=>i===cap?
    bonusAtLeast(pa,pb,cap):bonusExactly(pa,pb,i));
  return Object.fromEntries(['gate','natural','overlap','union'].map(key=>[
    key,conditionalByBonus.reduce((sum,r,i)=>sum+weights[i]*r[key],0)
  ]));
}
/**
 * All bonus counts from zero up to the maximum preserving both turn draws.
 * @param {number[]} groups
 * @param {number} [openingSize]
 * @param {number} [prizeCount]
 * @returns {Array<Record<string,number>>}
 */
function allBonusScenarios(groups,openingSize=7,prizeCount=6) {
  const cap=groups.reduce((a,b)=>a+b,0)-openingSize-prizeCount-2;
  const results=[];
  for(let d=0;d<=cap;d++) {
    results.push(jointWithBonuses({groups,bonusDraws:d,
      openingSize,prizeCount}).probabilities);
  }
  return results;
}

if(require.main===module) {
  const {loadBasicIndex,audit}=require('./aichi_opening_audit.cjs');
  const fs=require('node:fs'),path=require('node:path');
  const directory=path.resolve(__dirname,'../results/aichi-2026');
  const index=loadBasicIndex(path.resolve(__dirname,'../resources/cards/en'));
  const field=JSON.parse(fs.readFileSync(path.join(directory,'full-decklists.json'),'utf8'));
  const opponents=audit(field.decks,index).map(x=>({
    rank:x.rank,archetype:x.archetype,basics:x.basicCount
  }));
  const candidates=sourceScenarios().map(({name,groups})=>{
    const ownBasics=groups[R]+groups[V]+groups[B]+groups[W];
    const probabilitiesByBonus=allBonusScenarios(groups);
    return {name,groups,ownBasics,probabilitiesByBonus,
      byOpponentBasics:Object.fromEntries([...new Set(opponents.map(x=>x.basics))]
        .sort((a,b)=>a-b).map(b=>[
          b,weightedJoint(b,ownBasics,probabilitiesByBonus)
        ]))};
  });
  process.stdout.write(JSON.stringify({
    scope:'restricted resource opportunities with all offered mulligan bonuses accepted',
    bonusCap:45,opponents,candidates
  },null,2)+'\n');
}
module.exports={jointWithBonuses,weightedJoint,allBonusScenarios};
