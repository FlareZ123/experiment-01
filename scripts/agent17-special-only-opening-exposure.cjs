'use strict';
const assert=require('node:assert/strict');
const {auditSourceRootCoverage}=require('./aichi-source-root-coverage.cjs');

const STAGES=Object.freeze({
  4:{basic:['Voltorb','Pikachu','Dedenne-GX','Crobat V',
    'Squawkabilly ex','Tapu Lele-GX','Eldegoss V','Gengar & Mimikyu-GX',
    'Klefki','Ditto ♢'],evolved:['Electrode-GX','Alolan Raichu']},
  5:{basic:['Mew V','Genesect V','Dedenne-GX','Crobat V',
    "Lillie's Clefairy ex"],evolved:['Mew VMAX']},
  6:{basic:['Iron Thorns ex'],evolved:[]},
  7:{basic:['Wobbuffet','Mimikyu','Snorlax','Regirock',
    'Electrike','Girafarig'],evolved:[]},
  17:{basic:['Unown','Voltorb','Pikachu','Squawkabilly ex',
    'Gengar & Mimikyu-GX','Marshadow','Klefki','Ditto ♢'],
    evolved:['Electrode-GX','Alolan Raichu']},
  24:{basic:['Iron Thorns ex'],evolved:[]},
  29:{basic:['Iron Thorns ex'],evolved:[]}
});

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  assert.ok(Number.isSafeInteger(n)&&n>=0);
  assert.ok(Number.isSafeInteger(k)&&k>=0);
  if(k>n)return 0n;
  let result=1n;
  for(let i=1;i<=Math.min(k,n-k);i++){
    result=result*BigInt(n-i+1)/BigInt(i);
  }
  return result;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b){
  while(b!==0n){const c=a%b;a=b;b=c;}
  return a;
}

/**
 * Exact conditional opening exposure for disjoint Basic Pokémon and
 * Special Energy categories. Accepted first hands require >=1 Basic.
 * Ordinary draws are random cards AFTER the initial 7 and Prize placement.
 * The latter does not alter the draw's marginal distribution; a target
 * may have been Prized, but it is never selectively removed in this model.
 *
 * @param {number} basics Printed Basic Pokémon copies.
 * @param {number} specials Printed Special Energy copies.
 * @param {number} [draws] Ordinary subsequent draws, default 0.
 * @param {number} [deckSize] Total cards, default 60.
 * @param {number} [handSize] Initial cards, default 7.
 * @returns {{numerator:string,denominator:string,probability:number}}
 */
function conditionalSpecialExposure(basics,specials,draws=0,deckSize=60,handSize=7){
  for(const v of [basics,specials,draws,deckSize,handSize]){
    assert.ok(Number.isSafeInteger(v)&&v>=0);
  }
  assert.ok(basics>=1&&basics+specials<=deckSize);
  assert.ok(handSize>=1&&handSize<=deckSize);
  assert.ok(draws<=deckSize-handSize);
  const accepted=choose(deckSize,handSize)-
    choose(deckSize-basics,handSize);
  assert.ok(accepted>0n);
  const withoutSpecial=choose(deckSize-specials,handSize)-
    choose(deckSize-specials-basics,handSize);
  let all=accepted,no=withoutSpecial;
  for(let i=0;i<draws;i++){
    all*=BigInt(deckSize-handSize-i);
    no*=BigInt(deckSize-specials-handSize-i);
  }
  const numerator=all-no;
  const factor=gcd(numerator,all);
  return {
    numerator:String(numerator/factor),
    denominator:String(all/factor),
    probability:Number(numerator)/Number(all)
  };
}

/**
 * Read-only original-printing exposure. Each Basic/Evolution classification
 * is an explicit paper-card roster; unexpected Pokémon or Special-only ranks
 * fail closed rather than silently receiving invented Basic classification.
 * @param {object} corpus The original Aichi printed deck source manifest.
 * @returns {object}
 */
function auditSpecialOnlySourceOpenings(corpus){
  const staticAudit=auditSourceRootCoverage(corpus);
  const ranks=staticAudit.twoSourceGates.zeroBasicEnergySpecialOnly;
  assert.deepEqual(ranks,[4,5,6,7,17,24,29]);
  const rows=ranks.map(rank=>{
    const source=corpus.decks.find(d=>d.rank===rank);
    const exposure=staticAudit.decks.find(d=>d.rank===rank);
    const stage=STAGES[rank];
    const basic=new Set(stage.basic),evolved=new Set(stage.evolved);
    const pokemons=source.cards.filter(c=>c.category==='Pokémon');
    let basicCopies=0;
    for(const card of pokemons){
      assert.ok(basic.has(card.name)||evolved.has(card.name),
        'Unclassified source Pokémon: rank '+rank+' '+card.name);
      assert.ok(!(basic.has(card.name)&&evolved.has(card.name)));
      if(basic.has(card.name))basicCopies+=card.count;
    }
    const specialCopies=exposure.specialEnergy;
    const firstSeven=conditionalSpecialExposure(basicCopies,specialCopies,0);
    const afterOneOrdinaryDraw=conditionalSpecialExposure(
      basicCopies,specialCopies,1);
    return {rank,archetype:source.archetype,basicCopies,specialCopies,
      firstSeven,afterOneOrdinaryDraw};
  });
  return {protocol:'agent17-special-only-k0-opening-exposure-v1',
    sourceCount:staticAudit.exactPrintedSources,
    missingRanks:staticAudit.missingFullPrintedRanks,
    rows,qualification:{
      countsOnlyInitialNaturalHeldEnergy:true,
      printedSpecialEnergyPlayable:false,
      gameWinnerEvidence:false,
      candidatePerformanceEvidence:false
    }};
}

module.exports={choose,conditionalSpecialExposure,
  auditSpecialOnlySourceOpenings};
