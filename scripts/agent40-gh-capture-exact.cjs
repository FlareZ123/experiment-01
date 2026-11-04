'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const VERSION='agent40-exact-three-channel-physical-discard-gates-v1';
const ROSTER='results/aichi-2026/full-decklists.json';
const ROSTER_BLOB='ae773f6201d7aa69d31914dbfee66f3bfa692200';
const KEYS=Object.freeze([
  'B','O','P','TC','GH','A','C','TM',
  'Gloom','Pidgeotto','VileplumeAOR','Pidgeot','OTHER'
]);
const STAGES=Object.freeze(['Gloom','Pidgeotto','VileplumeAOR','Pidgeot']);
const READILY_PLAYABLE=Object.freeze(['O','P','A','C','TM']);
const EXPECTED=Object.freeze({
  2:Object.freeze({B:2,O:2,P:2,TC:4,GH:4,A:2,C:2,TM:2,
    Gloom:2,Pidgeotto:2,VileplumeAOR:2,Pidgeot:2,OTHER:32}),
  15:Object.freeze({B:2,O:2,P:2,TC:4,GH:3,A:2,C:1,TM:2,
    Gloom:2,Pidgeotto:2,VileplumeAOR:2,Pidgeot:2,OTHER:34})
});
const BASIC_NAMES=Object.freeze({
  2:['Pidgey','Oddish','Lillipup','Bunnelby','Fan Rotom',
    'Relicanth','Mr. Mime','Girafarig','Budew','Jirachi'],
  15:['Oddish','Buneary','Pidgey','Bunnelby','Fan Rotom',
    'Budew','Eldegoss V','Tatsugiri']
});

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  assert.ok(Number.isInteger(n)&&n>=0);
  if(!Number.isInteger(k)||k<0||k>n)return 0n;
  let result=1n;
  for(let j=1;j<=k;j++)result=result*BigInt(n-j+1)/BigInt(j);
  return result;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b){
  while(b!==0n){const temp=a%b;a=b;b=temp;}
  return a;
}

/**
 * The native source's exact-printing inventory; no set-number inference.
 * Categories intentionally match the published Agent7 resource screen.
 * @param {object} card Original source entry.
 * @returns {string}
 */
function classify(card){
  if(card.name==='Vileplume')return card.printing?.set==='AOR'&&
    String(card.printing?.number)==='3'?'VileplumeAOR':'OTHER';
  const names={Bunnelby:'B',Oddish:'O',Pidgey:'P',
    'Tag Call':'TC','Guzma & Hala':'GH',Artazon:'A',
    'Capture Energy':'C','Technical Machine: Evolution':'TM',
    Gloom:'Gloom',Pidgeotto:'Pidgeotto','Pidgeot ex':'Pidgeot'};
  return names[card.name]??'OTHER';
}

/**
 * @param {string} root Repo root with the authenticated original-source JSON.
 * @param {2|15} rank
 * @returns {Record<string,number>}
 */
function sourceCounts(root,rank){
  assert.ok(EXPECTED[rank]);
  const bytes=fs.readFileSync(path.join(root,ROSTER));
  const blob=createHash('sha1').update('blob '+bytes.length+String.fromCharCode(0))
    .update(bytes).digest('hex');
  assert.equal(blob,ROSTER_BLOB,'Original 29-list printed source changed');
  const source=JSON.parse(bytes.toString('utf8')).decks.find(d=>d.rank===rank);
  assert.ok(source);
  const counts=Object.fromEntries(KEYS.map(key=>[key,0]));
  const names=new Map();
  for(const card of source.cards){
    counts[classify(card)]+=card.count;
    names.set(card.name,(names.get(card.name)??0)+card.count);
  }
  assert.deepEqual(counts,EXPECTED[rank],
    'Printed original rank '+rank+' no longer matches category gate');
  assert.equal(BASIC_NAMES[rank].reduce((sum,n)=>sum+(names.get(n)??0),0),
    14,'The valid-opening denominator requires exactly 14 eligible Basics');
  return counts;
}

/**
 * Exact number of uniformly chosen Prize subsets that leave every required
 * physical category represented in the deck. Groups with held copies may
 * qualify without any searchable copies, except the four TM Stage targets.
 * @param {Record<string,number>} counts Entire sixty by disjoint groups.
 * @param {Record<string,number>} held First eight unordered group counts.
 * @param {number} [prizeCount=6]
 * @returns {bigint}
 */
function allowedPrizeSubsets(counts,held,prizeCount=6){
  assert.ok(Number.isInteger(prizeCount)&&prizeCount>=0);
  const required=[...STAGES];
  if(held.GH===0)required.push('GH');
  for(const name of READILY_PLAYABLE){
    if(held[name]===0)required.push(name);
  }
  const remaining=required.map(name=>counts[name]-held[name]);
  if(remaining.some(r=>r===0))return 0n;
  const unseen=KEYS.reduce((n,key)=>n+counts[key]-held[key],0);
  const free=unseen-remaining.reduce((n,r)=>n+r,0);
  return prizePolynomial(remaining,free,prizeCount);
}

/**
 * Coefficient of x^prizeCount in (1+x)^free times the product over
 * required groups of ((1+x)^r - x^r). Generalized for toy brute force.
 * @param {number[]} remaining Physical cards in each required group.
 * @param {number} free Physical cards in all other groups.
 * @param {number} prizeCount Face-down Prizes to choose.
 * @returns {bigint}
 */
function prizePolynomial(remaining,free,prizeCount){
  assert.ok(remaining.every(r=>Number.isInteger(r)&&r>0));
  assert.ok(Number.isInteger(free)&&free>=0);
  let polynomial=Array.from({length:prizeCount+1},(_,i)=>choose(free,i));
  for(const r of remaining){
    const next=Array(prizeCount+1).fill(0n);
    for(let k=0;k<=prizeCount;k++){
      for(let t=0;t<=Math.min(k,r-1);t++){
        next[k]+=polynomial[k-t]*choose(r,t);
      }
    }
    polynomial=next;
  }
  return polynomial[prizeCount];
}

/**
 * Condition on Basic-valid opening seven. Draw seven, set six Prizes, draw
 * eighth on turn one. Fix an unordered first-eight physical multiset. The
 * sole Bunnelby is in opening seven with probability 7/8; if two Bunnelby
 * are in first eight, one must be in the seven. Multivariate hypergeometric
 * Prize enumeration accounts for all actual six-card Prize arrangements.
 *
 * minimumConnectors 1: at least one Tag Call / G&H in eight.
 * minimumConnectors 2: one other such card remains after use.
 * minimumConnectors 3: two other such cards remain as an explicit possible
 * two-card G&H payment without giving up a key immediate resource.
 * Extra connectors are not guaranteed strategically disposable forever.
 *
 * threeChannelSearch requires Artazon/Capture/TM all missing in first eight,
 * so G&H must retrieve each from the actual deck.
 *
 * @param {Record<string,number>} counts The registered disjoint sixty.
 * @param {{minimumConnectors?:1|2|3,threeChannelSearch?:boolean}} [options]
 * @returns {object} Exact conditional rational and method provenance.
 */
function exactOpening(counts,options={}){
  const minimumConnectors=options.minimumConnectors??1;
  const threeChannelSearch=options.threeChannelSearch===true;
  assert.ok([1,2,3].includes(minimumConnectors));
  assert.deepEqual(Object.keys(counts),KEYS);
  assert.equal(KEYS.reduce((n,k)=>n+counts[k],0),60);
  assert.ok(KEYS.every(k=>Number.isInteger(counts[k])&&counts[k]>=0));
  const held=Object.fromEntries(KEYS.map(k=>[k,0]));
  let numeratorScaled=0n,handVectors=0,admissiblePrizeVectors=0;
  /** @param {number} i @param {number} left @param {bigint} weight */
  function visit(i,left,weight){
    if(i===KEYS.length){
      if(left!==0||held.B===0||
          held.TC+held.GH<minimumConnectors)return;
      handVectors++;
      const prize=allowedPrizeSubsets(counts,held);
      if(prize===0n)return;
      admissiblePrizeVectors++;
      assert.ok(held.B<=2);
      numeratorScaled+=weight*BigInt(held.B===1?7:8)*prize;
      return;
    }
    const key=KEYS[i];
    const max=threeChannelSearch&&['A','C','TM'].includes(key)?
      0:Math.min(counts[key],left);
    for(let copies=0;copies<=max;copies++){
      held[key]=copies;
      visit(i+1,left-copies,weight*choose(counts[key],copies));
    }
    held[key]=0;
  }
  visit(0,8,1n);
  const openingValidNumerator=choose(60,7)-choose(46,7);
  const numerator=numeratorScaled*choose(60,7);
  const denominator=8n*choose(60,8)*choose(52,6)*openingValidNumerator;
  const divisor=gcd(numerator,denominator);
  const p=numerator/divisor,q=denominator/divisor;
  return {
    version:VERSION,minimumConnectors,threeChannelSearch,
    handVectors,admissiblePrizeVectors,
    numerator:p.toString(),denominator:q.toString(),
    conditionalProbability:Number(p)/Number(q),
    conditionalPercent:100*Number(p)/Number(q),
    note:'Physical resource-access subset only; no native decision, Prize inspection, opponent response, strategic discardability or game wins'
  };
}

if(require.main===module){
  const root=path.resolve(__dirname,'..');
  for(const rank of [2,15]){
    const counts=sourceCounts(root,rank);
    for(const threeChannelSearch of [false,true]){
      for(const minimumConnectors of [1,2,3]){
        console.log(JSON.stringify({rank,...exactOpening(counts,{
          minimumConnectors,threeChannelSearch
        })}));
      }
    }
  }
}

module.exports={VERSION,ROSTER_BLOB,KEYS,EXPECTED,choose,gcd,classify,
  sourceCounts,allowedPrizeSubsets,prizePolynomial,exactOpening};
