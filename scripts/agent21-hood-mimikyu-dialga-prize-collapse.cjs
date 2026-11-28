'use strict';

/*
 * Exact original Hood Shadow Rider pre-first-Prize basic-recovery model.
 *
 * A specific use requirement: access one Mimikyu (two printed copies) AND
 * one Dialga-GX (one printed copy), each a Basic Pokémon. An accessible
 * Hisuian Heavy Ball (Item) or Gladion (Supporter) can each retrieve one
 * of those Basics from the six prizes. Modeled as independent one-card
 * recovery channels when usable; lock/Supporter constraints are excluded.
 *
 * This is an optimistic *card location* model: it assumes all unprized key
 * Pokémon are searchable and all unprized Heavy Balls and Gladion playable. It does NOT
 * model attack cost, discard channel, Supporters, Item lock, K0 draw/search,
 * opponent play, Prize taking, or actual win chances.
 *
 * Outputs exact Rational numerators and denominators under two distributions:
 * 1) six uniformly drawn prizes without opener conditioning;
 * 2) six prizes from a uniform shuffled deck CONDITIONED on the initial
 *    seven containing at least one Basic (valid opening). No bonus mulligan
 *    draws from opponent and no extra cards assumed.
 */

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

function choose(n,k){
  if(!Number.isSafeInteger(n)||!Number.isSafeInteger(k))
    throw Error('integer choose required');
  if(k<0||k>n||n<0)return 0n;
  k=Math.min(k,n-k);
  let out=1n;
  for(let i=1;i<=k;i++)
    out=out*BigInt(n-k+i)/BigInt(i);
  return out;
}
function rational(num,den){
  assert.equal(typeof num,'bigint');
  assert.equal(typeof den,'bigint');
  assert.ok(den>0n);
  return {
    numerator:num.toString(),denominator:den.toString(),
    probability:Number(num)/Number(den),
    percent:100*Number(num)/Number(den)
  };
}
function printedStats(deck){
  assert.ok(deck&&Array.isArray(deck.cards));
  const count=name=>deck.cards
    .filter(c=>c.name===name).reduce((s,c)=>s+c.count,0);
  const nM=count('Mimikyu'),nD=count('Dialga-GX'),
        nH=count('Hisuian Heavy Ball'),nG=count('Gladion');
  assert.equal(nM,2,'Provisional Hood Mimikyu2 list changed');
  assert.equal(nD,1,'Provisional Hood Dialga singleton changed');
  assert.equal(nH,1,'Provisional Hood Heavy Ball singleton changed');
  assert.equal(nG,0,'Provisional Hood list must contain no Gladion');
  const pokemon=deck.cards.filter(c=>c.category==='Pokémon');
  const basicPrints=[
    'Shadow Rider Calyrex V','Lillie\'s Clefairy ex','Tapu Lele-GX',
    'Latias ex','Dialga-GX','Mimikyu','Girafarig','Marshadow',
    'Radiant Eternatus'
  ];
  const B=pokemon.filter(c=>basicPrints.includes(c.name))
    .reduce((s,c)=>s+c.count,0);
  const notKnown=pokemon.filter(c=>!basicPrints.includes(c.name));
  assert.equal(notKnown.length,1);
  assert.equal(notKnown[0].name,'Shadow Rider Calyrex VMAX');
  assert.equal(notKnown[0].count,4);
  const total=deck.cards.reduce((s,c)=>s+c.count,0);
  assert.equal(total,60);
  assert.equal(B,14);
  return {total,basicCount:B,mimikyuCopies:nM,
    dialgaCopies:nD,heavyBallCopies:nH,gladionCopies:nG};
}

function measure({
 total=60,prizes=6,hand=7,basicCount=14,
 mimikyuCopies=2,dialgaCopies=1,heavyBallCopies=1,gladionCopies=0
}={}){
  const nM=mimikyuCopies,nD=dialgaCopies,nH=heavyBallCopies,
    nG=gladionCopies,
    B=basicCount,N=total,P=prizes,H=hand;
  assert.ok([N,P,H,B,nM,nD,nH,nG].every(Number.isSafeInteger));
  assert.ok(N>P+H&&B>0&&nM>0&&nD>0&&nH>=0&&nG>=0);
  assert.ok(nG<=1,'Two Supporters cannot both be used on one turn');
  const otherBasic=B-(nM+nD);
  const otherNonBasic=N-B-nH-nG;
  assert.ok(otherBasic>=0&&otherNonBasic>=0);

  let allPrizes=0n,failedPrizes=0n;
  let allValidWays=0n,failedValidWays=0n;
  const remaining=N-P;
  const possibleHands=choose(remaining,H);
  for(let m=0;m<=nM;m++)for(let d=0;d<=nD;d++)
    for(let h=0;h<=nH;h++)for(let g=0;g<=nG;g++){
      const k=m+d+h+g;
      for(let ob=0;ob<=P-k;ob++){
        const on=P-k-ob;
        const ways=choose(nM,m)*choose(nD,d)*choose(nH,h)*
          choose(nG,g)*choose(otherBasic,ob)*choose(otherNonBasic,on);
        if(ways===0n)continue;
        const leftBasics=B-(m+d+ob);
        const validHandWays=possibleHands-choose(remaining-leftBasics,H);
        const neededRecovery=Number(m===nM)+Number(d===nD);
        const recoveryAvailable=nH-h+nG-g;
        const collapsed=neededRecovery>recoveryAvailable;
        allPrizes+=ways;
        allValidWays+=ways*validHandWays;
        if(collapsed){
          failedPrizes+=ways;
          failedValidWays+=ways*validHandWays;
        }
      }
    }
  assert.equal(allPrizes,choose(N,P));
  const simple=rational(failedPrizes,allPrizes);
  const conditional=rational(failedValidWays,allValidWays);
  return {
    model:{total:N,prizes:P,hand:H,basicCount:B,
      mimikyuCopies:nM,dialgaCopies:nD,heavyBallCopies:nH,
      gladionCopies:nG}, 
    noOpenerCondition:simple,
    validBasicOpener:conditional,
    openingBasicValid:rational(allValidWays,
      allPrizes*possibleHands)
  };
}

function pair(stats){
  const baseline=measure(stats);
  const doubled=measure({...stats,heavyBallCopies:2});
  const split=measure({...stats,heavyBallCopies:1,gladionCopies:1});
  return {baseline,doubled,split,
    absoluteValidOpenerRiskReductionPercentagePoints:
      baseline.validBasicOpener.percent-doubled.validBasicOpener.percent,
    relativeValidOpenerRiskReduction:
      baseline.validBasicOpener.probability/
      doubled.validBasicOpener.probability};
}

if(require.main===module){
  const sourcePath=path.resolve(__dirname,
    '../results/decks/hood-shadow-rider-v1-mimikyu2-challenger-60.json');
  const deck=JSON.parse(fs.readFileSync(sourcePath,'utf8'));
  process.stdout.write(JSON.stringify(pair(printedStats(deck)),null,2)+'\n');
}
module.exports={choose,rational,printedStats,measure,pair};
