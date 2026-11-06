'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  assert.ok(Number.isSafeInteger(n)&&n>=0);
  assert.ok(Number.isSafeInteger(k));
  if(k<0||k>n)return 0n;
  const length=Math.min(k,n-k);
  let value=1n;
  for(let i=1;i<=length;i++)
    value=value*BigInt(n-length+i)/BigInt(i);
  return value;
}
/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b){while(b)[a,b]=[b,a%b];return a;}
/** @param {bigint} numerator @param {bigint} denominator */
function rational(numerator,denominator){
  assert.ok(denominator>0n&&numerator>=0n);
  const d=gcd(numerator,denominator);
  return {numerator:numerator/d,denominator:denominator/d};
}
/** @param {number} x @returns {number} */
function popcount(x){
  let count=0;
  for(;x;x&=x-1)count++;
  return count;
}

/**
 * Brute force all assignments of five labelled non-Basics among opening
 * hand, Prizes and remainder. Other 55 copies are 12 Basics + 43 others.
 * Require the opening seven to include a Basic, then deal six Prizes.
 * Labels: 1 Ticket, 2 Cologne, 4 DCE, 8/16 Lightning copies.
 */
function brutePrizeFailure(){
  const denominator=(choose(60,7)-choose(48,7))*choose(53,6);
  let numerator=0n;
  for(let hand=0;hand<32;hand++){
    const labelledHand=popcount(hand);
    let completions=0n;
    for(let basic=1;basic<=7-labelledHand;basic++)
      completions+=choose(12,basic)*choose(43,7-labelledHand-basic);
    for(let prizes=0;prizes<32;prizes++){
      if(hand&prizes)continue;
      const obstruction=(prizes&1)!==0&&
        ((prizes&2)!==0||(prizes&4)!==0||(prizes&24)===24);
      if(obstruction)
        numerator+=completions*choose(48+labelledHand,
          6-popcount(prizes));
    }
  }
  return rational(numerator,denominator);
}

/** Independent formula by inclusion-exclusion of specified-Prize events. */
function closedPrizeFailure(){
  const denominator=(choose(60,7)-choose(48,7))*choose(53,6);
  const q=k=>(choose(60-k,7)-choose(48-k,7))*choose(53-k,6-k);
  return rational(2n*q(2)-2n*q(4)+q(5),denominator);
}

/**
 * After both players achieve Basic-valid starting sevens, the defender takes
 * all optional source-mulligan compensation draws and Benches all Basics.
 * The k>=48 tail is omitted, with upper probability under 3e-35 here.
 * @param {number} sourceBasics @param {number} defenderBasics
 * @returns {number}
 */
function defenderOnlyOneBasic(sourceBasics,defenderBasics){
  const total=Number(choose(60,7));
  const qs=Number(choose(60-sourceBasics,7))/total;
  const qd=Number(choose(60-defenderBasics,7))/total;
  const ps=1-qs,pd=1-qd,D=1-qs*qd;
  const oneGivenValid=defenderBasics*
    Number(choose(60-defenderBasics,6))/
    (total-Number(choose(60-defenderBasics,7)));
  let bonus=0,sourceFailed=1;
  for(let k=1;k<=47;k++){
    sourceFailed*=qs;
    bonus+=ps*pd*sourceFailed/D*
      (Number(choose(54-defenderBasics,k))/Number(choose(53,k)));
  }
  return oneGivenValid*(1-pd*qs/D+bonus);
}

const data=JSON.parse(fs.readFileSync(path.join(__dirname,'..',
  'results','aichi-2026','full-decklists.json'),'utf8'));
const getRank=rank=>data.decks.find(d=>d.rank===rank);

test('source inventory and all three historical Thorns-only 60s',()=>{
  const source=getRank(26);
  assert.ok(source);
  assert.equal(source.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(source.cards.filter(c=>c.category==='Pokémon')
    .reduce((n,c)=>n+c.count,0),12);
  for(const [name,count] of [
    ['Redeemable Ticket',1],['Canceling Cologne',1],
    ['Double Colorless Energy',1],['Lightning Energy',2]
  ])assert.equal(source.cards.find(c=>c.name===name)?.count,count);
  for(const rank of [6,24,29]){
    const defender=getRank(rank);
    assert.equal(defender.cards.reduce((n,c)=>n+c.count,0),60);
    assert.deepEqual(defender.cards.filter(c=>c.category==='Pokémon')
      .map(c=>[c.name,c.count]),[['Iron Thorns ex',4]]);
  }
});

test('independent exact label enumeration matches closed derivation',()=>{
  const expected={
    numerator:2564127669643n,denominator:149499993622980n
  };
  assert.deepEqual(brutePrizeFailure(),expected);
  assert.deepEqual(closedPrizeFailure(),expected);
});

test('full bilateral setup and joint first-turn upper ceiling',()=>{
  const f=closedPrizeFailure();
  const failure=Number(f.numerator)/Number(f.denominator);
  const solo=defenderOnlyOneBasic(12,4);
  const ceiling=solo*(1-failure);
  assert.ok(Math.abs(failure-0.017151356381388247)<1e-14);
  assert.ok(Math.abs(solo-0.8367357777206609)<1e-12);
  assert.ok(Math.abs(ceiling-0.8223846241999158)<1e-12);
  console.log('RANK26_PAPER_SETUP_BOUND',JSON.stringify({
    conditionalPrizeFailure:failure,
    defenderSoloWithAllBonusBasicsBenched:solo,
    necessaryFirstTurnWinCeiling:ceiling,
    authenticatedOriginalDefenders:[6,24,29],
    qualifiedGames:0
  }));
});

module.exports={brutePrizeFailure,closedPrizeFailure,defenderOnlyOneBasic};
