'use strict';

const fs=require('node:fs');
const path=require('node:path');

const BASICS=Object.freeze([
  // Exact Aichi rank-2 source printings, manually matched to the bundled
  // card database. HP, numeric printed attack sum, Ability and Retreat
  // counts are inputs to Twinleaf's pinned SimpleScore.getPokemonScoreBy.
  {name:'Bunnelby',count:2,hp:60,damage:0,abilities:0,retreat:2,stage:false},
  {name:'Oddish',count:2,hp:50,damage:20,abilities:0,retreat:1,stage:true},
  {name:'Pidgey',count:2,hp:50,damage:20,abilities:0,retreat:1,stage:true},
  {name:'Lillipup',count:2,hp:60,damage:40,abilities:0,retreat:1,stage:true},
  {name:'Fan Rotom',count:1,hp:70,damage:70,abilities:1,retreat:1,stage:false},
  {name:'Relicanth',count:1,hp:100,damage:30,abilities:1,retreat:1,stage:false},
  {name:'Mr. Mime',count:1,hp:70,damage:20,abilities:1,retreat:1,stage:false},
  {name:'Girafarig',count:1,hp:90,damage:70,abilities:0,retreat:1,stage:false},
  {name:'Budew',count:1,hp:30,damage:10,abilities:0,retreat:0,stage:false},
  {name:'Jirachi',count:1,hp:60,damage:30,abilities:0,retreat:1,stage:false}
]);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k) {
  if(!Number.isInteger(n)||!Number.isInteger(k)||n<0) {
    throw new Error('Combination requires integer nonnegative n,k');
  }
  if(k<0||k>n)return 0n;
  let value=1n;
  for(let i=1;i<=Math.min(k,n-k);i++) {
    value=value*BigInt(n-i+1)/BigInt(i);
  }
  return value;
}

/** @param {object} card @returns {number} */
function genericPokemonScore(card) {
  return .3*card.hp+.4*card.damage+card.abilities-5*card.retreat;
}

/**
 * Exact joint probabilities of an initial Bunnelby Active and stage-capable
 * Bench from an unordered viewed group, weighted by its possible first-hand
 * permutations. Only the actual first hand can supply the opening Bunnelby.
 * Cards of the remaining non-Basic category are indistinguishable for scores.
 *
 * @param {{cards:object[],otherCount:number,hand:number,viewed:number,benchLimit:number}} request
 * @returns {object} BigInt numerator and denominator for each event.
 */
function exactPriorityEvents({cards,otherCount,hand,viewed,benchLimit}) {
  const size=otherCount+cards.reduce((sum,c)=>sum+c.count,0);
  if(!cards.some(c=>c.name==='Bunnelby') ||
      hand>viewed || viewed>size || hand<1 || otherCount<0) {
    throw new Error('Invalid source counts or opening dimensions');
  }
  const sampleChoices=choose(viewed,hand);
  const denominator=choose(size,viewed)*sampleChoices;
  let conditioned=0n,nonStageDisplacement=0n,anyStageOmitted=0n,fullBenchExcluded=0n;
  const allocations=Array(cards.length).fill(0);
  const scores=cards.map(genericPokemonScore);
  const recurse=(index,chosenBasics,ways)=>{
    if(index<cards.length) {
      const card=cards[index];
      for(let k=0;k<=card.count && chosenBasics+k<=viewed;k++){
        allocations[index]=k;
        recurse(index+1,chosenBasics+k,ways*choose(card.count,k));
      }
      return;
    }
    const otherDraws=viewed-chosenBasics;
    const multi=ways*choose(otherCount,otherDraws);
    if(!multi)return;
    const bIndex=cards.findIndex(c=>c.name==='Bunnelby');
    const drawnB=allocations[bIndex];
    const openingWays=sampleChoices-choose(viewed-drawnB,hand);
    if(!openingWays)return;
    const weight=multi*openingWays;
    const basicCount=chosenBasics-1;
    if(basicCount>benchLimit){
      fullBenchExcluded+=weight;
      return;
    }
    const bench=[];
    for(let i=0;i<cards.length;i++){
      const copies=allocations[i]-(i===bIndex?1:0);
      for(let j=0;j<copies;j++)bench.push({stage:cards[i].stage,score:scores[i]});
    }
    const stages=bench.filter(c=>c.stage).length;
    if(!stages)return;
    conditioned+=weight;
    const chosen=bench.sort((a,b)=>b.score-a.score).slice(0,2);
    const missed=stages-chosen.filter(c=>c.stage).length;
    if(missed>0){
      anyStageOmitted+=weight;
      if(chosen.some(c=>!c.stage))nonStageDisplacement+=weight;
    }
  };
  recurse(0,0,1n);
  return {conditioned,nonStageDisplacement,anyStageOmitted,fullBenchExcluded,denominator};
}

/** @param {bigint} numerator @param {bigint} denominator @returns {number} */
const fraction=(numerator,denominator)=>Number(numerator)/Number(denominator);

/** Source-list assertion plus exact eight-card opening model. */
function run() {
  const manifest=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  const rank2=manifest.decks.find(deck=>deck.rank===2);
  if(!rank2)throw new Error('Rank-2 published source missing');
  const counts=new Map(rank2.cards.map(x=>[x.name,x.count]));
  for(const card of BASICS){
    if(counts.get(card.name)!==card.count) {
      throw new Error('Printed source count changed: '+card.name);
    }
  }
  const basicTotal=BASICS.reduce((n,c)=>n+c.count,0);
  if(basicTotal!==14 ||
      rank2.cards.reduce((n,c)=>n+c.count,0)!==60) {
    throw new Error('Published source-60 invariant failed');
  }
  const countsExact=exactPriorityEvents({
    cards:BASICS,otherCount:60-basicTotal,hand:7,viewed:8,benchLimit:5
  });
  return {
    sourceRank:2,drawnCards:8,startingHand:7,sourceBasicCount:basicTotal,
    engineScore:'0.3 HP + 0.4 numeric printed damage + Abilities - 5 retreat icons',
    condition:'Opening Bunnelby in first seven; every other observed Basic placed on Bench up to five slots; at least one Stage-capable Bench target',
    ...Object.fromEntries(
      Object.entries(countsExact).map(([name,n])=>[name,n.toString()])),
    P_conditioned:fraction(countsExact.conditioned,countsExact.denominator),
    P_displacement:fraction(countsExact.nonStageDisplacement,countsExact.denominator),
    P_stageOmitted:fraction(countsExact.anyStageOmitted,countsExact.denominator),
    P_displacement_given_condition:fraction(
      countsExact.nonStageDisplacement,countsExact.conditioned),
    scope:'Exact printed Basic-count and pinned static score model; no Energy/Tool access, legal action sequence, Prize Stage survival, bot Bench policy, or game-win inference'
  };
}

if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={BASICS,choose,genericPokemonScore,exactPriorityEvents,fraction,run};
