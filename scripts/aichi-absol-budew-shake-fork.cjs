'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {choose,audit}=require('./aichi-absol-garbotoxin-window.cjs');
const {shakeTurnOneWindow}=require('./aichi-absol-boost-shake-direct.cjs');

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b){
  while(b!==0n)[a,b]=[b,a%b];
  return a;
}

/** @param {bigint} numerator @param {bigint} denominator */
function fraction(numerator,denominator){
  const d=gcd(numerator,denominator);
  return {numerator:String(numerator/d),denominator:String(denominator/d),
    probability:Number(numerator)/Number(denominator)};
}

/**
 * Count a first-turn **decision fork** under actual printed inventory:
 * Budew in the initial seven permits selecting Budew Active, while Trubbish,
 * Float Stone and Boost Shake in the first seven plus first normal draw
 * permit a separate Boost Shake route into a still-decked Garbodor.
 *
 * For a source player going second, the mutually exclusive first-turn
 * paths are a Budew Itchy Pollen attack and an Item Boost Shake that
 * ends the turn. No searches or bonus draws,
 * opponent ability/Item restrictions or decision policies are modeled.
 *
 * The first seven must contain a Basic. Six Prize cards are sampled
 * without replacement, independently of the first-turn draw by
 * random-deal exchangeability. The same computation supports miniature
 * decks for exhaustive independent testing.
 *
 * @param {{basics:number,budew:number,trubbish:number,garbodor:number,
 *   floatStone:number,boostShake:number}} cards
 * @param {{deckSize?:number,openingSize?:number,prizeCount?:number,
 *   requireDirectPieces?:boolean}} [options]
 *   Setting requireDirectPieces=false counts the broader visible-Shake
 *   envelope while allowing hypothetical searches for Trubbish and Tool.
 *   It is not a universal ceiling for searches which obtain Shake itself.
 */
function budewShakeFork(cards,options={}){
  const N=options.deckSize??60,H=options.openingSize??7,
    P=options.prizeCount??6,requireDirect=options.requireDirectPieces!==false;
  assert.ok([N,H,P,cards.basics,cards.budew,cards.trubbish,
    cards.garbodor,cards.floatStone,cards.boostShake].every(
    n=>Number.isInteger(n)&&n>=0));
  assert.ok(H>0&&H+P<N&&cards.basics>0);
  const pops=[
    cards.budew,cards.trubbish,cards.garbodor,
    cards.floatStone,cards.boostShake,
    cards.basics-cards.budew-cards.trubbish,
    N-cards.basics-cards.garbodor-cards.floatStone-cards.boostShake
  ];
  assert.ok(pops.every(n=>n>=0));
  assert.equal(pops.reduce((a,b)=>a+b,0),N);
  const validOpening=choose(N,H)-choose(N-cards.basics,H);
  assert.ok(validOpening>0n);
  const prizeAll=choose(N-H-1,P);
  const opening=Array(pops.length).fill(0);
  let numerator=0n;

  /** @param {number} index @param {number} remaining @param {bigint} ways */
  function visit(index,remaining,ways){
    if(index===pops.length){
      if(remaining!==0||opening[0]===0)return;
      for(let draw=0;draw<pops.length;draw++){
        const available=pops[draw]-opening[draw];
        if(available<=0)continue;
        const hasTrubbish=opening[1]+Number(draw===1)>0;
        const hasStone=opening[3]+Number(draw===3)>0;
        const hasShake=opening[4]+Number(draw===4)>0;
        if(!hasShake||(requireDirect&&(!hasTrubbish||!hasStone)))continue;
        const garbodorInDeckBeforePrizes=
          cards.garbodor-opening[2]-Number(draw===2);
        if(garbodorInDeckBeforePrizes<=0)continue;
        const prizeAllGarbodor=choose(
          N-H-1-garbodorInDeckBeforePrizes,
          P-garbodorInDeckBeforePrizes);
        numerator+=ways*BigInt(available)*
          (prizeAll-prizeAllGarbodor);
      }
      return;
    }
    for(let n=0;n<=Math.min(remaining,pops[index]);n++){
      opening[index]=n;
      visit(index+1,remaining-n,ways*choose(pops[index],n));
    }
    opening[index]=0;
  }
  visit(0,H,1n);
  return fraction(numerator,validOpening*BigInt(N-H)*prizeAll);
}

/** @param {object} deck @param {string} name @returns {number} */
function copies(deck,name){
  return deck.cards.filter(c=>c.name===name).reduce((s,c)=>s+c.count,0);
}

/** @param {object} source */
function sourceReport(source){
  const four=audit(source).ranks;
  return {
    version:'agent16-budew-vs-boost-shake-mutually-exclusive-direct-fork-v1',
    source:'results/aichi-2026/full-decklists.json',
    condition:'source going second; valid seven-card Basic opener, initial Budew, first normal draw, six unseen Prizes, unprized and undrawn Garbodor available in deck',
    qualification:'physical resource coaccess only; no selected actions, lock application, or certified games',
    ranks:four.map(row=>{
      const deck=source.decks.find(d=>d.rank===row.rank);
      const boostShake=copies(deck,'Boost Shake');
      const result=budewShakeFork({...row,boostShake});
      return {rank:row.rank,basics:row.basics,budew:row.budew,
        trubbish:row.trubbish,garbodor:row.garbodor,
        floatStone:row.floatStone,boostShake,
        directShakeWindow:shakeTurnOneWindow({...row,boostShake}),
        directBudewVersusShakeFork:result,
        initiallyVisibleShakeEnvelope:budewShakeFork(
          {...row,boostShake},{requireDirectPieces:false})};
    })
  };
}

if(require.main===module){
  const source=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  process.stdout.write(JSON.stringify(sourceReport(source),null,2)+'\n');
}
module.exports={budewShakeFork,sourceReport};
