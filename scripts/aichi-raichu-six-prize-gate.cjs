'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {choose}=require('./aichi-champion-critical-prize-collapse.cjs');

/** @param {bigint} x @param {bigint} y @returns {bigint} */
function gcd(x,y) {
  while(y!==0n)[x,y]=[y,x%y];
  return x;
}

/**
 * Exact sampling without replacement: choose a uniform initial hand with
 * at least one Basic, then a uniform face-down Prize selection from the
 * remaining physical deck. Order within zones is irrelevant.
 *
 * This reports a necessary static inventory gate for accessing an exact
 * six-card Energy combination without taking/replacing any Prize cards.
 * It does not model draws, recovery, legal setup or actual attacks.
 *
 * @param {{deckSize:number,basics:number,reversal:number,counter:number,
 *   openingSize:number,prizeSize:number,needReversal:number,needCounter:number}} config
 */
function energyPrizeGate(config) {
  const {deckSize,basics,reversal,counter,openingSize,prizeSize,needReversal,needCounter}=config;
  const all=[deckSize,basics,reversal,counter,openingSize,prizeSize,needReversal,needCounter];
  const other=deckSize-basics-reversal-counter;
  if(all.some(n=>!Number.isInteger(n)||n<0) || basics===0 || other<0 ||
    deckSize<=openingSize+prizeSize || needReversal>reversal ||
    needCounter>counter || openingSize===0 || prizeSize===0){
    throw new Error('Invalid physical deck or Prize requirements');
  }

  let denominator=0n;
  let clearReversal=0n;
  let sufficientPair=0n;
  for(let bp=0;bp<=Math.min(basics,prizeSize);bp++){
    for(let rp=0;rp<=Math.min(reversal,prizeSize-bp);rp++){
      for(let cp=0;cp<=Math.min(counter,prizeSize-bp-rp);cp++){
        const op=prizeSize-bp-rp-cp;
        if(op<0||op>other)continue;
        const configurations=
          choose(basics,bp)*choose(reversal,rp)*
          choose(counter,cp)*choose(other,op);
        const availableBasics=basics-bp;
        const remain=deckSize-prizeSize;
        const legalHands=choose(remain,openingSize)-
          choose(remain-availableBasics,openingSize);
        const deals=configurations*legalHands;
        denominator+=deals;
        if(rp===0)clearReversal+=deals;
        if(rp<=reversal-needReversal&&cp<=counter-needCounter){
          sufficientPair+=deals;
        }
      }
    }
  }
  if(denominator===0n)throw new Error('No legal initial hands');
  /** @param {bigint} wins */
  const fraction=wins=>{
    const divisor=gcd(wins,denominator);
    return {
      numerator:wins/divisor,
      denominator:denominator/divisor,
      probability:Number(wins)/Number(denominator)
    };
  };
  return {legalDealCount:denominator,
    allReversalUnprized:fraction(clearReversal),
    requisitePairUnprized:fraction(sufficientPair)};
}

/** @returns {object[]} Conditional Prize gate for exact source ranks 4/17. */
function publishedRaichuPrizeGate(){
  const source=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  return [4,17].map(rank=>{
    const deck=source.decks.find(d=>d.rank===rank);
    if(!deck||deck.archetype!=='Raichu Electrode Combo'||
      deck.cards.reduce((s,c)=>s+c.count,0)!==60)throw Error('Missing source Raichu rank '+rank);
    const count=name=>deck.cards.filter(c=>c.name===name)
      .reduce((s,c)=>s+c.count,0);
    if(count('Electrode-GX')!==3||count('Alolan Raichu')!==2||
      count('Reversal Energy')!==4||count('Counter Energy')!==4||
      count('Unit Energy LPM')!==4){
      throw Error('Source Pokémon or Energy signature changed for rank '+rank);
    }
    // Both printed lists' only Evolution Pokémon are Electrode-GX and Alolan Raichu.
    const basics=deck.cards.filter(c=>c.category==='Pokémon')
      .reduce((s,c)=>s+c.count,0)-5;
    if(basics!==13)throw Error('Source Basic count changed for rank '+rank);
    return {rank,player:deck.player,basics,
      ...energyPrizeGate({deckSize:60,basics,reversal:4,counter:4,
        openingSize:7,prizeSize:6,needReversal:4,needCounter:2})};
  });
}

if(require.main===module){
  const rows=publishedRaichuPrizeGate().map(({rank,player,basics,
    allReversalUnprized,requisitePairUnprized})=>({
    rank,player,basics,
    noPrizedReversal:allReversalUnprized.probability,
    all4ReversalAnd2CounterUnprized:requisitePairUnprized.probability,
    exactFraction:String(requisitePairUnprized.numerator)+'/'+
      String(requisitePairUnprized.denominator)
  }));
  process.stdout.write(JSON.stringify(rows,null,2)+'\n');
}
module.exports={energyPrizeGate,publishedRaichuPrizeGate};
