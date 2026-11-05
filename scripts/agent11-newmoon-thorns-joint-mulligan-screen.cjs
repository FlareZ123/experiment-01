'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {choose}=require('./agent11-thorns-first-volt-access.cjs');
const {singleMailAccess}=require('./agent11-thorns-single-trainers-mail.cjs');
const {candidateCategories}=require('./agent11-newmoon-thorns-firstturn-exposure.cjs');

/**
 * Independent exact hand-card combinatorics for a restrictive New Moon
 * *setup exposure screen*, conditional on its first seven being valid.
 * Initial seven must contain the sole fragile Basic. The other H-1 hand
 * cards through all accepted mulligan-bonus draws and its ordinary draw
 * must be "safe"; their union may not contain both Compressor and
 * Rescue Carrier. This is NOT a forced actual KO or board-state witness.
 *
 * @param {{basic:number,vulnerable:number,direct:number,safe:number,compressor:number,carrier:number}} categories
 * @param {number} compensation Number of opposing mulligan bonus cards taken.
 * @returns {{numerator:bigint,denominator:bigint,conditionalProbability:number}}
 */
function candidateSoloScreen(categories,compensation=0){
  const c=categories;
  assert.ok(Number.isInteger(compensation)&&compensation>=0);
  assert.ok([c.basic,c.vulnerable,c.direct,c.safe,c.compressor,c.carrier]
    .every(n=>Number.isInteger(n)&&n>=0));
  assert.equal(c.basic+c.direct+c.safe,60);
  assert.ok(c.vulnerable<=c.basic&&c.compressor+c.carrier<=c.safe);
  const H=8+compensation;
  const pairless=choose(c.safe-c.compressor,H-1)+
    choose(c.safe-c.carrier,H-1)-
    choose(c.safe-c.compressor-c.carrier,H-1);
  const numer=BigInt(c.vulnerable)*7n*pairless;
  const denom=BigInt(H)*choose(60,H);
  const initialValidNumer=choose(60,7)-choose(60-c.basic,7);
  const initialValidDenom=choose(60,7);
  const numerator=numer*initialValidDenom;
  const denominator=denom*initialValidNumer;
  return {numerator,denominator,
    conditionalProbability:Number(numerator)/Number(denominator)};
}

/**
 * Exact conditional *source* named first-own-turn resource-access probability
 * for a four-Basic original Iron Thorns profile. Uses preexisting source
 * all-held-Mail model and its physical Prize and accepted-bonus handling.
 * No opponent effects, actual paid Search, or attack settlement.
 *
 * @param {1|3} d
 * @param {2|3|4} mailCopies
 * @param {number} bonus
 */
function sourceResourceAccess(d,mailCopies,bonus=0){
  const result=singleMailAccess(d,mailCopies,bonus);
  return Number(result.allHeldMailNumerator)/
    Number(result.allHeldMailDenominator);
}

/**
 * Sum the actual joint two-player mulligan process:
 * - both initial valid (no extras to either);
 * - candidate initially valid while Thorns mulligans k>=1
 *   (candidate receives k optional bonus cards; source none);
 * - source initially valid while candidate mulligans t>=1
 *   (source receives t bonus cards; candidate none).
 *
 * Both-invalid rounds restart. The final valid starting-seven hands
 * remain independent conditional on each branch. Source going second is
 * a separate coin-choice condition, not a random 50% multiplier here.
 *
 * @param {1|3} d
 * @param {2|3|4} mailCopies
 * @param {object} categories Frozen 60-card New Moon category partition.
 * @param {number} [maximumSourceBonus=10]
 */
function jointExposure(d,mailCopies,categories,maximumSourceBonus=10){
  assert.ok(Number.isInteger(maximumSourceBonus)&&
    maximumSourceBonus>=0&&maximumSourceBonus<=30);
  const sourceValid=1-Number(choose(56,7))/Number(choose(60,7));
  const candidateValid=1-
    Number(choose(60-categories.basic,7))/Number(choose(60,7));
  const normalized=sourceValid+candidateValid-
    sourceValid*candidateValid;
  const bothFirstRound=sourceValid*candidateValid/normalized;
  const screen0=candidateSoloScreen(categories,0).conditionalProbability;
  const source0=sourceResourceAccess(d,mailCopies,0);
  const bothValid=bothFirstRound*screen0*source0;
  let candidateCompensation=0;
  let screenedCandidateBonusTerms=0;
  for(let k=1;k<=categories.safe;k++){
    const screen=candidateSoloScreen(categories,k).conditionalProbability;
    if(screen===0)break;
    const weight=bothFirstRound*(1-sourceValid)**k;
    candidateCompensation+=weight*source0*screen;
    screenedCandidateBonusTerms++;
  }
  let sourceCompensation=0;
  for(let k=1;k<=maximumSourceBonus;k++){
    const weight=bothFirstRound*(1-candidateValid)**k;
    sourceCompensation+=weight*
      sourceResourceAccess(d,mailCopies,k)*screen0;
  }
  const uncomputedUpperBound=
    sourceValid*(1-candidateValid)**(maximumSourceBonus+1)/
    normalized*screen0;
  const total=bothValid+candidateCompensation+sourceCompensation;
  return {
    d,mailCopies,sourceValid,candidateValid,bothFirstRound,
    candidateGetsAtLeastOneBonus:candidateValid*(1-sourceValid)/normalized,
    sourceGetsAtLeastOneBonus:sourceValid*(1-candidateValid)/normalized,
    naiveBothValidConditionalConjunction:source0*screen0,
    bothValidContribution:bothValid,
    candidateCompensationContribution:candidateCompensation,
    sourceCompensationContribution:sourceCompensation,
    observedJointConjunction:total,
    relativeToNaiveConditional:total/(source0*screen0),
    maximumSourceBonus,screenedCandidateBonusTerms,
    uncomputedJointUpperBound:uncomputedUpperBound,
    verdict:'Physical named-resource and restricted solo-screen conjunction; not game win/loss'
  };
}

/** @returns {object} */
function fromRepo(){
  const root=path.resolve(__dirname,'..');
  const manifest=JSON.parse(fs.readFileSync(path.join(root,
    'results/als/new-moon-lockbreak-english-proxy-60.json'),'utf8'));
  const field=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const categories=candidateCategories(manifest);
  const profiles=[[6,1,3],[24,3,4],[29,1,2]];
  return {
    schema:'agent11-newmoon-original-thorns-joint-mulligan-screen-v1',
    sourceSecond:true,candidateFirst:true,
    bothTakeAllOptionalMulliganCompensation:true,
    categories,
    profiles:profiles.map(([rank,d,mail])=>{
      const deck=field.decks.find(entry=>entry.rank===rank);
      assert.ok(deck&&deck.cards.reduce((n,c)=>n+c.count,0)===60);
      const actualMail=deck.cards
        .filter(c=>c.name==="Trainers' Mail"&&c.printing.set==='ROS')
        .reduce((n,c)=>n+c.count,0);
      const actualDce=deck.cards
        .filter(c=>c.name==='Double Colorless Energy')
        .reduce((n,c)=>n+c.count,0);
      assert.deepEqual([actualDce,actualMail],[d,mail]);
      return {rank,...jointExposure(d,mail,categories)};
    }),
    competitiveQualifiedGames:0
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(fromRepo(),null,2)+'\n');
module.exports={candidateSoloScreen,sourceResourceAccess,jointExposure,fromRepo};
