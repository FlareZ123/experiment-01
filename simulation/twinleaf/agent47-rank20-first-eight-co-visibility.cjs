'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const SOURCE=require('../../results/aichi-2026/full-decklists.json');
const SETS=require('../../resources/sets/en.json');

/** Exact finite-deck combination count, using BigInt throughout. */
function choose(n,k){
  if(k<0||k>n)return 0n;
  let x=1n;
  for(let j=1;j<=Math.min(k,n-k);j++)
    x=x*BigInt(n-Math.min(k,n-k)+j)/BigInt(j);
  return x;
}
function gcd(a,b){
  while(b){const r=a%b;a=b;b=r;}
  return a;
}
function rational(a,b){
  assert.ok(b>0n);
  const g=gcd(a,b);
  return {numerator:String(a/g),denominator:String(b/g),
    probability:Number(a)/Number(b)};
}

/**
 * Independent source card-print classification, no simulator assumptions.
 * @param {object} card Published manifest entry.
 * @returns {boolean}
 */
function printedBasic(card){
  const sameSet=SETS.filter(s=>s.ptcgoCode===card.printing.set);
  for(const s of sameSet){
    const p=path.resolve(__dirname,'../../resources/cards/en',s.id+'.json');
    const rows=require(p);
    const printing=rows.find(c=>c.name===card.name &&
      c.number===card.printing.number);
    if(printing)return printing.subtypes?.includes('Basic')===true;
  }
  throw Error('Cannot classify source printed stage '+card.name+' '+card.printing.set);
}

/**
 * Exact probability of at least one listed connector and one single payload
 * across opening 7 plus first ordinary draw, conditional on a Basic in 7.
 * Eight-card order is accounted for by choosing the opening seven first.
 * The six Prize cards are exchangeable and need no hidden identities.
 */
function firstEightJoint({deckSize,basicCount,connectorCount,payloadCount=1}){
  const N=deckSize,B=basicCount,U=connectorCount,D=payloadCount,
    O=N-B-U-D;
  assert.ok(Number.isSafeInteger(N)&&N===60&&
    Number.isSafeInteger(B)&&B>=1&&
    Number.isSafeInteger(U)&&U>=1&&
    D===1&&O>=0);
  const denom=choose(N,7)*BigInt(N-7);
  let legalStarterAndJoint=0n,legalStarter=0n;
  for(let b=0;b<=Math.min(7,B);b++)
    for(let u=0;u<=Math.min(7,U);u++)
      for(let d=0;d<=1;d++){
        const o=7-b-u-d;
        if(o<0||o>O)continue;
        const ways=choose(B,b)*choose(U,u)*choose(D,d)*choose(O,o);
        if(b===0)continue;
        legalStarter+=ways*BigInt(N-7);
        const eighthChoices=u>=1&&d===1?N-7:
          (u===0&&d===1?U-u:u>=1&&d===0?D-d:0);
        legalStarterAndJoint+=ways*BigInt(eighthChoices);
      }
  return {basicCount:B,connectorCount:U,payloadCount:D,
    legalStarter:rational(legalStarter,denom),
    jointUnconditional:rational(legalStarterAndJoint,denom),
    jointGivenLegalStarter:rational(legalStarterAndJoint,legalStarter)};
}

/** Actual source rank20 Basic and printing multiplicities, no label guesses. */
function sourceRank20CoVisibility(){
  const source=SOURCE.decks.find(x=>x.rank===20);
  assert.ok(source&&source.cards.reduce((sum,c)=>sum+c.count,0)===60);
  const basics=source.cards.filter(c=>c.category==='Pokémon'&&printedBasic(c))
    .reduce((sum,c)=>sum+c.count,0);
  const count=(name,set)=>source.cards.filter(c=>
    c.name===name&&c.printing.set===set).reduce((sum,c)=>sum+c.count,0);
  const ultra=count('Ultra Ball','MEG'),dragapult=count('Dragapult ex','TWM');
  assert.equal(dragapult,1);
  assert.equal(ultra,2);
  return {rank:20,sourcePlayer:source.player,
    window:'opening 7 plus next ordinary draw only',
    model:'uniform 60-card shuffle, six Prize cards exchangeable, at least one printed Basic in opening seven',
    ...firstEightJoint({deckSize:60,basicCount:basics,
      connectorCount:ultra,payloadCount:dragapult}),
    caveat:'Only direct card co-visibility. No attachment, evolution, Item cost, opponent, Prize mapping or subsequent search. Not a probability of the staged Apex line.'};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(sourceRank20CoVisibility(),null,2)+'\n');
module.exports={choose,printedBasic,firstEightJoint,sourceRank20CoVisibility};
