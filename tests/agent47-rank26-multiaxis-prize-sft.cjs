'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');

const MARKED=15;
const TICKET=1;
const COLOGNE=2;
const DCE=4;
const LIGHTNING=8|16;
const CRISIS_TOOLS=32|64;
const PUMPS=[128,256,512,1024];
const RUINS=2048|4096|8192|16384;

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  assert.ok(Number.isSafeInteger(n)&&n>=0);
  assert.ok(Number.isSafeInteger(k));
  if(k<0||k>n)return 0n;
  let value=1n;
  const m=Math.min(k,n-k);
  for(let i=1;i<=m;i++)value=value*BigInt(n-m+i)/BigInt(i);
  return value;
}
/** @param {number} mask @returns {number} */
function popcount(mask){
  let n=0;
  for(;mask;mask&=mask-1)n++;
  return n;
}
/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b){while(b)[a,b]=[b,a%b];return a;}
/** @param {bigint} a @param {bigint} b */
function fraction(a,b){
  assert.ok(b>0n&&a>=0n);
  const g=gcd(a,b);
  return {numerator:a/g,denominator:b/g};
}

/**
 * Weight for a particular exact marked-card Prize subset with p cards.
 * The other 60-15=45 cards comprise 12 Basics and 33 other cards.
 * Choose a Basic-valid opening seven first, then six Prizes from the
 * remaining 53 cards. No extra marked card may be in the Prize subset.
 * @param {number} p @returns {bigint}
 */
function prizeSubsetWeight(p){
  assert.ok(Number.isInteger(p)&&p>=0&&p<=6);
  let count=0n;
  for(let h=0;h<=Math.min(7,MARKED-p);h++){
    const markedInHand=choose(MARKED-p,h);
    const validUnmarkedHand=
      choose(60-MARKED,7-h)-choose(48-MARKED,7-h);
    const otherPrizes=choose(53-MARKED+h,6-p);
    count+=markedInHand*validUnmarkedHand*otherPrizes;
  }
  return count;
}

/**
 * F is the old 5-marked source obstruction.
 * G also covers both Crisis Punch Tools or >=3 Damage Pumps trapped.
 * H further covers all four Risky Ruins trapped.
 * Every event requires the unique Prize-reset Redeemable Ticket Prized.
 * @param {number} mask
 */
function predicates(mask){
  const ticket=(mask&TICKET)!==0;
  const F=ticket&&((mask&COLOGNE)!==0||
    (mask&DCE)!==0||(mask&LIGHTNING)===LIGHTNING);
  const pumps=PUMPS.reduce((n,b)=>n+Number((mask&b)!==0),0);
  const G=F||(ticket&&((mask&CRISIS_TOOLS)===CRISIS_TOOLS||pumps>=3));
  const H=G||(ticket&&(mask&RUINS)===RUINS);
  return {F,G,H};
}

/**
 * Enumerate each possible exact subset of all 15 distinct marked copies.
 * Aggregating weights over every subset avoids independence assumptions
 * among the six joint Prize cards.
 */
function exactPrizeBlockers(){
  const validOpening=choose(60,7)-choose(48,7);
  const denominator=validOpening*choose(53,6);
  const weights=Array.from({length:7},(_,p)=>prizeSubsetWeight(p));
  const totalBySubsetSize=weights.reduce((acc,w,p)=>
    acc+choose(MARKED,p)*w,0n);
  assert.equal(totalBySubsetSize,denominator,
    'Marked Prizes must partition every Basic-valid source setup');
  const numerators={F:0n,G:0n,H:0n};
  const subsetCounts={F:0,G:0,H:0};
  for(let mask=0;mask<(1<<MARKED);mask++){
    const n=popcount(mask);
    if(n>6)continue;
    const flags=predicates(mask);
    for(const key of ['F','G','H']){
      if(!flags[key])continue;
      numerators[key]+=weights[n];
      subsetCounts[key]++;
    }
  }
  return {
    weights,denominator,subsetCounts,
    F:fraction(numerators.F,denominator),
    G:fraction(numerators.G,denominator),
    H:fraction(numerators.H,denominator),
    extraHAboveF:fraction(numerators.H-numerators.F,denominator)
  };
}

const inventories=JSON.parse(fs.readFileSync(path.join(__dirname,'..',
  'results','aichi-2026','full-decklists.json'),'utf8'));
const rank=n=>inventories.decks.find(x=>x.rank===n);

test('each source component has the exact historical printed multiplicity',()=>{
  const source=rank(26);
  assert.equal(source.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(source.cards.filter(x=>x.category==='Pokémon')
    .reduce((n,c)=>n+c.count,0),12);
  for(const [name,count,printingSet,number] of [
    ['Redeemable Ticket',1,'JTG','156'],
    ['Canceling Cologne',1,'ASR','136'],
    ['Double Colorless Energy',1,'SUM','136'],
    ['Lightning Energy',2,'MEE','12'],
    ['Technical Machine: Crisis Punch',2,'PAF','90'],
    ['Damage Pump',4,'LOR','156'],
    ['Risky Ruins',4,'MEG','127'],
    ['Dowsing Machine',1,'PLS','128']
  ]){
    const card=source.cards.find(x=>x.name===name);
    assert.equal(card?.count,count);
    assert.equal(card?.printing?.set,printingSet);
    assert.equal(String(card?.printing?.number),number);
  }
  for(const defenderRank of [6,24,29]){
    const defender=rank(defenderRank);
    assert.equal(defender.cards.reduce((n,c)=>n+c.count,0),60);
    assert.deepEqual(defender.cards.filter(x=>x.category==='Pokémon')
      .map(x=>[x.name,x.count]),[['Iron Thorns ex',4]]);
  }
});

test('15-labelled Prize-subset enumeration is normalized and extends old proof',()=>{
  const r=exactPrizeBlockers();
  assert.deepEqual(r.F,{
    numerator:2564127669643n,denominator:149499993622980n
  });
  assert.deepEqual(r.G,{
    numerator:5590706351n,denominator:314075616855n
  });
  assert.deepEqual(r.H,{
    numerator:40323343509n,denominator:2265151418530n
  });
  assert.ok(r.H.numerator* r.G.denominator>
    r.G.numerator*r.H.denominator);
});

test('new direct-print Prize collapse strengthens necessary first-turn bound',()=>{
  const r=exactPrizeBlockers();
  const prizeFailure=Number(r.H.numerator)/Number(r.H.denominator);
  const defenderSolo=0.8367357777206609;
  const firstTurnCeiling=defenderSolo*(1-prizeFailure);
  assert.ok(Math.abs(prizeFailure-0.017801610602777438)<1e-14);
  assert.ok(Math.abs(firstTurnCeiling-0.8218405332282656)<1e-12);
  console.log('AGENT47_EXTENDED_SOURCE_PRIZE_VETO',JSON.stringify({
    sourceRank:26,defenderRanks:[6,24,29],
    conditionalSourcePrizeFailure:prizeFailure,
    defenderSingleBasicWithBonusBenchAll:defenderSolo,
    conditionalFirstTurnUpperCeiling:firstTurnCeiling,
    oldObstruction:FRACTION(r.F),
    newObstruction:FRACTION(r.H),
    qualifiedGames:0
  }));
});

/** @param {{numerator:bigint,denominator:bigint}} x */
function FRACTION(x){return String(x.numerator)+'/'+String(x.denominator);}
module.exports={exactPrizeBlockers,prizeSubsetWeight,predicates};
