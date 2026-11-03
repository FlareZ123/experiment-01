'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const fixture = JSON.parse(fs.readFileSync(path.join(root,
  'results/aichi-2026/fixtures/agent9-rank5-turn16-public-owner-offer-v1.json'),'utf8'));
const registered = JSON.parse(fs.readFileSync(path.join(root,
  'results/aichi-2026/full-decklists.json'),'utf8'));

/** Exact binomial coefficient for small observed card-pool populations.
 * @param {number} n Population size.
 * @param {number} k Sample size.
 * @returns {bigint} Number of k-subsets of n.
 */
function choose(n,k){
  assert.ok(Number.isSafeInteger(n)&&Number.isSafeInteger(k));
  assert.ok(0<=k&&k<=n);
  const s=Math.min(k,n-k);
  let result=1n;
  for(let i=1;i<=s;i++)result=result*BigInt(n-s+i)/BigInt(i);
  return result;
}

/** @param {number} population @param {number} excluded @param {number} draws */
function noHitProbability(population,excluded,draws){
  return Number(choose(excluded,draws))/Number(choose(population,draws));
}

/**
 * Derive K0 conditional probabilities using only the original printed 60,
 * physical owner's observed hand and public board/prize/deck counts. Assumes
 * a uniformly random hidden Prize allocation and deck order conditional on
 * this information. Returns modeling quantities, never a native win estimate.
 */
function modelRank5K0(){
  const owner=fixture.owner;
  const registeredFive=registered.decks.find(x=>x.rank===5);
  assert.ok(registeredFive);
  const total=registeredFive.cards.reduce((n,c)=>n+c.count,0);
  assert.equal(total,60);
  assert.equal(owner.deckCount+owner.prizesRemaining+owner.hand.length+
    1+owner.bench.length,total);

  const copies=(name,category)=>registeredFive.cards.filter(x=>
    x.name===name&&(category===undefined||x.category===category))
    .reduce((n,c)=>n+c.count,0);
  const countCategory=category=>registeredFive.cards.filter(x=>
    x.category===category).reduce((n,c)=>n+c.count,0);
  const held=name=>owner.hand.filter(x=>x===name).length;
  const knownInPlayName=name=>Number(owner.active===name)+
    owner.bench.filter(x=>x===name).length;
  const ownTrainersInHand=owner.hand.filter(x=>
    x!=='Mew VMAX FST').length;
  assert.equal(countCategory('Trainer'),42);
  assert.equal(countCategory('Pokémon'),14);
  assert.equal(countCategory('Energy'),4);
  assert.equal(ownTrainersInHand,13);
  assert.equal(held("Trainers' Mail ROS"),1);
  assert.equal(held('Mew VMAX FST'),1);
  assert.equal(owner.opponentPrizesRemaining,6);
  assert.equal(owner.stadium.length,0);

  const hidden=owner.deckCount+owner.prizesRemaining;
  const mailOther= countCategory('Trainer')-
    copies("Trainers' Mail")-
    (ownTrainersInHand-held("Trainers' Mail ROS"));
  const otherMail=copies("Trainers' Mail")-held("Trainers' Mail ROS");
  const pokemonUnknown=countCategory('Pokémon')-1-
    (1+owner.bench.length);
  const energyUnknown=countCategory('Energy');
  const totalCheck=mailOther+otherMail+pokemonUnknown+energyUnknown;
  assert.equal(totalCheck,hidden);

  const unseenMew=copies('Mew V')-held('Mew V FST')-
    knownInPlayName('Mew V');
  const unseenFloatStone=copies('Float Stone')-held('Float Stone BKT');
  const unseenDce=copies('Double Colorless Energy')-
    held('Double Colorless Energy SUM');
  assert.equal(unseenMew,4);
  assert.equal(unseenFloatStone,2);
  assert.equal(unseenDce,4);

  const pMailOtherTrainer=1-noHitProbability(
    hidden,hidden-mailOther,4);
  const pMailFloatStone=1-noHitProbability(
    hidden,hidden-unseenFloatStone,4);
  const pMewInDeck=1-Number(choose(owner.prizesRemaining,unseenMew))/
    Number(choose(hidden,unseenMew));

  // Conditioning on >=1 searchable Mew in deck excludes the all-four-
  // Mew-Prized cases. It mildly alters expected DCE Prize occupancy.
  const pNoMew=1-pMewInDeck;
  const meanEnergyPrizes=owner.prizesRemaining*unseenDce/hidden;
  const meanEnergyPrizesNoMew=
    (owner.prizesRemaining-unseenMew)*unseenDce/(hidden-unseenMew);
  const meanEnergyPrizesWithMew=
    (meanEnergyPrizes-pNoMew*meanEnergyPrizesNoMew)/pMewInDeck;
  const pNextDceAfterQuickBallToMew=
    (unseenDce-meanEnergyPrizesWithMew)/(owner.deckCount-1);

  const handAfterOneBallBench=owner.hand.length-2+1-1;
  const handAfterSecondBallBench=handAfterOneBallBench-2+1-1;
  const genesectDrawCount=Math.max(0,2-handAfterOneBallBench);
  const crobatDrawCount=Math.max(0,6-handAfterSecondBallBench);

  return {
    schema:'agent9-rank5-turn16-k0-paper-line-probabilities-v1',
    seed:fixture.physical.seed,sourceRank:5,ownerSeat:owner.seat,
    hiddenCards:hidden,
    unknownComposition:{otherTrainerEligibleForMail:mailOther,
      otherTrainersMail:otherMail,pokemon:pokemonUnknown,
      doubleColorlessEnergy:energyUnknown},
    mewVUnseen:unseenMew,floatStoneUnseen:unseenFloatStone,
    mailTopFourAnyEligibleTrainer:pMailOtherTrainer,
    mailTopFourAnyFloatStone:pMailFloatStone,
    quickBallMewAvailableInDeck:pMewInDeck,
    nextDrawDoubleColorlessAfterMewQuickBall:pNextDceAfterQuickBallToMew,
    handAfterQuickBallBenchMew:handAfterOneBallBench,
    genesectDrawsAtThatState:genesectDrawCount,
    handAfterNextQuickBallBenchCrobat:handAfterSecondBallBench,
    crobatDrawsAtThatState:crobatDrawCount,
    modelAssumptions:'uniform random unrevealed physical locations, unchanged owner source, no opponent disruption, one ordinary next draw',
    originalNativePolicyQualified:false,
    observedGameWinRate:null
  };
}

if(require.main===module){
  process.stdout.write(JSON.stringify(modelRank5K0(),null,2)+'\n');
}
module.exports={choose,noHitProbability,modelRank5K0};
