'use strict';
const assert=require('node:assert/strict');
const {choose,countsFromSource}=
  require('./agent4-garbotoxin-literal-open.cjs');

function gcd(a,b){
  while(b!==0n){[a,b]=[b,a%b];}
  return a;
}

/** Exact fraction in lowest terms; all counts are BigInt. */
function fraction(n,d){
  assert.ok(n>=0n&&d>0n&&n<=d);
  const g=gcd(n,d);
  return {numerator:String(n/g),denominator:String(d/g),
    probability:Number(n)/Number(d)};
}

/**
 * Distinct literal first-turn resource axes in a physical K0 hand.
 * Budew is available as a setup Active from opening cards.
 * The separate Garbotoxin axis requires Trubbish, Float Stone, Boost
 * Shake among opening+one draw and a Garbodor in the deck after Prizes.
 * For a source going second, Budew's zero-Energy attack and turn-ending
 * Boost Shake contend as alternative first-turn plans. This does not
 * assume either is selected or universally legal under opposing effects.
 *
 * @param {{budew:number,trubbish:number,floatStone:number,
 *   boostShake:number,garbodor:number,basic:number,
 *   deckSize?:number,openingSize?:number,prizeCount?:number}} p
 * @returns {{budew:object,directGarbotoxin:object,
 *   both:object,either:object,denominator:string}}
 */
function openingAxes(p){
  const {budew:u,trubbish:a,floatStone:b,boostShake:c,
    garbodor:d,basic,deckSize=60,openingSize=7,prizeCount=6}=p;
  for(const x of [u,a,b,c,d,basic,deckSize,openingSize,prizeCount])
    assert.ok(Number.isSafeInteger(x)&&x>=0);
  assert.ok(basic>=u+a);
  assert.ok(openingSize>=1&&openingSize<deckSize);
  const n=deckSize,k=openingSize+1;
  const cells=[u,a,b,c,d,basic-u-a,n-basic-b-c-d];
  assert.ok(cells.every(x=>x>=0)&&cells.reduce((sum,x)=>sum+x,0)===n);
  const unseen=n-k;
  assert.ok(prizeCount<=unseen);
  const prizeWays=choose(unseen,prizeCount);
  const startWays=choose(n,openingSize)-
    choose(n-basic,openingSize);
  const denominator=startWays*BigInt(n-openingSize)*prizeWays;
  let budewWays=0n,directWays=0n,bothWays=0n,total=0n;
  const hand=new Array(cells.length).fill(0);

  /** @param {number} i @param {number} left @param {bigint} ways */
  function visit(i,left,ways){
    if(i<cells.length){
      for(let copies=0;copies<=Math.min(cells[i],left);copies++){
        hand[i]=copies;
        visit(i+1,left-copies,ways*choose(cells[i],copies));
      }
      return;
    }
    if(left!==0)return;
    const basics=hand[0]+hand[1]+hand[5];
    const validOpeners=basics>=2?k:(basics===1?openingSize:0);
    if(!validOpeners)return;
    const budewOpeners=hand[0]>=2?k:(hand[0]===1?openingSize:0);
    const paid=ways*prizeWays;
    total+=paid*BigInt(validOpeners);
    budewWays+=paid*BigInt(budewOpeners);

    if(hand[1]===0||hand[2]===0||hand[3]===0)return;
    const garbUnseen=d-hand[4];
    const garbUnprizedWays=prizeWays-
      choose(unseen-garbUnseen,prizeCount-garbUnseen);
    directWays+=ways*BigInt(validOpeners)*garbUnprizedWays;
    bothWays+=ways*BigInt(budewOpeners)*garbUnprizedWays;
  }
  visit(0,k,1n);
  assert.equal(total,denominator,'exhaustive K0 weighted sample');
  assert.ok(bothWays<=budewWays&&bothWays<=directWays);
  return {
    budew:fraction(budewWays,denominator),
    directGarbotoxin:fraction(directWays,denominator),
    both:fraction(bothWays,denominator),
    either:fraction(budewWays+directWays-bothWays,denominator),
    denominator:String(denominator)
  };
}

/** Original published source 60, with validated Basic and Stage split. */
function originalRank(roster,rank){
  assert.ok([8,11,16,22].includes(rank));
  const deck=roster.decks.find(x=>x.rank===rank);
  assert.ok(deck);
  const base=countsFromSource(deck);
  const budew=deck.cards.filter(x=>x.name==='Budew')
    .reduce((sum,x)=>sum+x.count,0);
  return {rank,player:deck.player,counts:{...base,budew},
    ...openingAxes({...base,budew})};
}

module.exports={openingAxes,originalRank};
