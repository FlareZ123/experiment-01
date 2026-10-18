'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(!Number.isInteger(n)||!Number.isInteger(k)||k<0||k>n)return 0n;
  let result=1n;
  const m=Math.min(k,n-k);
  for(let i=1;i<=m;i++)result=result*BigInt(n-m+i)/BigInt(i);
  return result;
}
/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b){while(b!==0n){const t=a%b;a=b;b=t;}return a;}
/** @param {bigint} numerator @param {bigint} denominator */
function fraction(numerator,denominator){
  assert.ok(numerator>=0n&&denominator>0n);
  const d=gcd(numerator,denominator);
  return {numerator:String(numerator/d),denominator:String(denominator/d),
    percent:Number(numerator)*100/Number(denominator)};
}

/**
 * Exact physical deal among mulligan-accepted hands. Two specified unique
 * non-Basic cards are Gladion and Grand Tree. The probability considers the
 * initial seven, six face-down Prizes, and one mandatory draw, with no other
 * searches, mulligan bonuses or Prize-changing effects.
 *
 * @param {{size:number,hand:number,prizes:number,basics:number}} params
 */
function opportunity({size,hand,prizes,basics}){
  assert.ok([size,hand,prizes,basics].every(Number.isInteger)&&
    size>hand+prizes&&hand>0&&prizes>0&&basics>0&&basics<=size-2);
  const valid=choose(size,hand)-choose(size-basics,hand);
  const gInitially=choose(size-2,hand-1)-
    choose(size-2-basics,hand-1);
  const bothOutside=choose(size-2,hand)-
    choose(size-2-basics,hand);
  const unprized=size-hand;
  const numerator=BigInt(prizes)*
    (gInitially*BigInt(unprized-1)+bothOutside);
  const denominator=valid*BigInt(unprized)*BigInt(unprized-1);
  return {
    validOpeningHands:String(valid),
    grandTreePrizedAndGladionInFirstEight:fraction(numerator,denominator),
    grandTreeBeyondFirstPrizeSlot:fraction(
      numerator*BigInt(prizes-1),denominator*BigInt(prizes))
  };
}

/** Source-printing and Basic-count verification for the exact Aichi rank 2. */
function run(){
  const manifest=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  const deck=manifest.decks.find(d=>d.rank===2);
  assert.ok(deck);
  const count=name=>deck.cards.filter(c=>c.name===name)
    .reduce((sum,c)=>sum+c.count,0);
  const basicNames=['Pidgey','Oddish','Lillipup','Bunnelby','Fan Rotom',
    'Relicanth','Mr. Mime','Girafarig','Budew','Jirachi'];
  const basics=basicNames.reduce((sum,name)=>sum+count(name),0);
  const size=deck.cards.reduce((sum,c)=>sum+c.count,0);
  assert.deepEqual([size,basics,count('Gladion'),count('Grand Tree')],
    [60,14,1,1]);
  assert.ok(deck.cards.some(c=>c.name==='Gladion'&&
    c.printing.set==='CIN'&&c.printing.number==='95'));
  assert.ok(deck.cards.some(c=>c.name==='Grand Tree'&&
    c.printing.set==='SCR'&&c.printing.number==='136'));
  return {rank:2,sourcePlayer:deck.player,basics,
    ...opportunity({size,hand:7,prizes:6,basics}),
    interpretation:'Restricted direct-resource opportunity, not actual Gladion play, tactical superiority or win rate'};
}

if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={choose,fraction,opportunity,run};
