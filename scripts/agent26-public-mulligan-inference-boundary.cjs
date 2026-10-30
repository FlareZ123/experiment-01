'use strict';
const assert=require('node:assert/strict');
const {choose}=require('./aichi-opening-basics.cjs');
const {revealedMulliganSignature}=require('./aichi-mulligan-public-reveal.cjs');
const VERSION='agent26-public-mulligan-posterior-information-boundary-v1';
/**
 * Freshly reshuffled, known deck. Earlier failed-seven disclosures do not
 * alter the next Basic-valid opening-hand distribution.
 * @param {{deckSize?:number,handSize?:number,basics:number,markers:number}} x
 * @returns {number} Chance >=1 non-Basic marker in next valid opening hand.
 */
function nextValidHandMarkerChance(x){
  const {deckSize=60,handSize=7,basics,markers}=x;
  assert.ok(Number.isSafeInteger(deckSize)&&deckSize>=1);
  assert.ok(Number.isSafeInteger(handSize)&&handSize>=1&&handSize<=deckSize);
  assert.ok(Number.isSafeInteger(basics)&&basics>=1&&basics<=deckSize);
  assert.ok(Number.isSafeInteger(markers)&&markers>=0&&
    markers<=deckSize-basics);
  const valid=choose(deckSize,handSize)-choose(deckSize-basics,handSize);
  assert.ok(valid>0n);
  const noMarkerValid=choose(deckSize-markers,handSize)-
    choose(deckSize-basics-markers,handSize);
  return 1-Number(noMarkerValid)/Number(valid);
}
/**
 * Likelihood of a genuinely opponent-public event for one hypothetical
 * source composition. Failed sevens return fully to the same deck.
 * @param {{deckSize?:number,handSize?:number,basics:number,markers:number}} x
 * @param {'no-mulligan'|'first-invalid-marker'|'marker-ever'} event
 * @returns {number}
 */
function publicEventLikelihood(x,event){
  const {deckSize=60,handSize=7,basics,markers}=x;
  const m=revealedMulliganSignature({deckSize,openingSize:handSize,
    basics,namedNonBasics:markers});
  if(event==='no-mulligan')return 1-m.firstAttemptInvalidProbability;
  if(event==='first-invalid-marker')
    return m.firstAttemptInvalidProbability*m.namedGivenInvalidHand;
  if(event==='marker-ever')return m.anyNamedRevealedBeforeValid;
  throw new RangeError('Unsupported public reveal event');
}
/**
 * Bayesian belief update over deck hypotheses. Only hypotheses' weights
 * change; no observed failed-hand card is removed from a deck's remaining
 * inventory, no concealed opponent card becomes a policy input.
 * @param {{id:string,prior:number,basics:number,markers:number,
 *   deckSize?:number,handSize?:number}[]} hypotheses
 * @param {'no-mulligan'|'first-invalid-marker'|'marker-ever'} event
 * @returns {object}
 */
function updateDeckHypotheses(hypotheses,event){
  assert.ok(Array.isArray(hypotheses)&&hypotheses.length>0);
  const ids=new Set();
  let priorTotal=0,normalizer=0;
  const rows=hypotheses.map(x=>{
    assert.ok(typeof x.id==='string'&&x.id.length>0&&!ids.has(x.id));
    ids.add(x.id);
    assert.ok(typeof x.prior==='number'&&Number.isFinite(x.prior)&&
      x.prior>=0);
    priorTotal+=x.prior;
    const likelihood=publicEventLikelihood(x,event);
    const weight=x.prior*likelihood;
    normalizer+=weight;
    return {id:x.id,prior:x.prior,likelihood,weight,
      nextValidHandMarkerChance:nextValidHandMarkerChance(x)};
  });
  assert.ok(Math.abs(priorTotal-1)<1e-12,'Prior must sum to one');
  assert.ok(normalizer>0,'Observed event impossible under all hypotheses');
  const models=rows.map(({weight,...x})=>({...x,posterior:weight/normalizer}));
  return {version:VERSION,event,models,
    posteriorPredictiveMarkerChance:models.reduce((p,x)=>
      p+x.posterior*x.nextValidHandMarkerChance,0)};
}
module.exports={VERSION,nextValidHandMarkerChance,
  publicEventLikelihood,updateDeckHypotheses};
