'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {combination,validOpening}=
  require('./agent11-field-simultaneous-mulligan-compensation.cjs');
const VERSION='agent11-original-all-thorns-solo-basic-opening-v1';

/** @param {object} roster @returns {void} */
function verifyThornsSources(roster) {
  for(const rank of [6,24,29]) {
    const deck=roster.decks.find(x=>x.rank===rank);
    assert.ok(deck,'Original published source rank '+rank+' absent');
    assert.equal(deck.cards.reduce((s,c)=>s+c.count,0),60);
    const pokemon=deck.cards.filter(c=>c.category==='Pokémon');
    assert.equal(pokemon.length,1);
    assert.equal(pokemon[0].name,'Iron Thorns ex');
    assert.equal(pokemon[0].printing.set,'TWM');
    assert.equal(pokemon[0].printing.number,'77');
    assert.equal(pokemon[0].count,4);
  }
}

/** @param {number} n @param {number} k @returns {number} */
const c=(n,k)=>Number(combination(n,k));

/**
 * P(original four-Basic Thorns has exactly one observed Basic) conditional on
 * a valid opening seven, and upon accepting every possible opponent mulligan
 * bonus. Optionally append 0..4 ordinary draws. The physical six Prize cards
 * are marginalized and no post-start search/draw/Bench decisions are modeled.
 * @param {14|17} candidateBasics
 * @param {number} ordinaryDraws
 * @returns {object}
 */
function soloEnvelope(candidateBasics,ordinaryDraws=0){
  assert.ok(candidateBasics===14||candidateBasics===17);
  assert.ok(Number.isInteger(ordinaryDraws)&&ordinaryDraws>=0&&ordinaryDraws<=4);
  const pS=validOpening(4),pC=validOpening(candidateBasics);
  const qS=1-pS,qC=1-pC,den=1-qS*qC;
  const oneBasicOpening=4*c(56,6)/(c(60,7)-c(56,7));
  let probability=0;
  const maxBonus=47-ordinaryDraws;
  for(let k=0;k<=maxBonus;k++){
    const bonusWeight=k===0?pC/den:pS*pC*qC**k/den;
    const n=k+ordinaryDraws;
    const noSecondBasic=c(50,n)/c(53,n);
    probability+=bonusWeight*oneBasicOpening*noSecondBasic;
  }
  const excessBonusMass=pS*qC**(maxBonus+1)/den;
  return {
    version:VERSION,
    candidateBasics,ordinaryDraws,
    originalThornsBasics:4,
    singleThornsInValidSeven:oneBasicOpening,
    zeroBonusProbability:pC/den,
    forcedSoloBasicLower:probability,
    forcedSoloBasicUpper:probability+excessBonusMass,
    unresolvedOptionalExcessBonusUpper:excessBonusMass,
    noSearchOrAbilityDraw:true,
    noBenchActionOrWinInference:true
  };
}

/** @returns {object[]} */
function fromRepo(){
  const file=path.resolve(__dirname,'../results/aichi-2026/full-decklists.json');
  verifyThornsSources(JSON.parse(fs.readFileSync(file,'utf8')));
  return [14,17].map(b=>[0,1,2,3,4].map(d=>soloEnvelope(b,d)));
}
module.exports={VERSION,verifyThornsSources,soloEnvelope,fromRepo};
