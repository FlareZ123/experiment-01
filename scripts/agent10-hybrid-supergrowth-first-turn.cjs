'use strict';

const assert=require('node:assert/strict');
const {
  ROWLET,SOURCE,CHALLENGER,loadDeck,makePhysicalDeck,
  xorshift32,shuffle,state,superGrowth,tmBarrage,wilson95,run:runTwo
}=require('./agent10-super-growth-first-turn.cjs');

const VERSION='agent10-hybrid-supergrowth-barrage-first-turn-v1';
const HYBRID='results/aichi-2026/candidate-hybrid-supergrowth-sentinel-v1.psv';

/**
 * Decide the starting Active from the actual legal first seven only.
 * If a Rowlet starts, take the free-attack route; otherwise keep Bunnelby.
 * Both prospective routes share this physical Active, including when one fails.
 * @param {string[]} shuffled
 */
function hybridState(shuffled){
  return state(shuffled,shuffled.slice(0,7).includes(ROWLET)?'super':'tm');
}

/**
 * First legal opportunity, with a single fixed starter for both alternative
 * lines; selects neither after looking at hidden Prize cards.
 * @param {ReturnType<typeof state>} s
 */
function hybridOpportunity(s){
  const first=superGrowth(s);
  const second=tmBarrage(s);
  if(first==='REACHABLE')return 'REACHABLE_SUPERGROWTH';
  if(second==='REACHABLE')return 'REACHABLE_TM_BARRAGE';
  return 'UNREACHABLE';
}

/** @param {number} trials @param {number} seed */
function simulateHybrid(trials,seed){
  const cards=makePhysicalDeck(loadDeck(HYBRID));
  assert.equal(cards.length,60);
  const next=xorshift32(seed);
  const reasons={};
  let accepted=0,success=0;
  for(let trial=0;trial<trials;trial++){
    shuffle(cards,next);
    const s=hybridState(cards);
    if(s===null)continue;
    accepted++;
    const reason=hybridOpportunity(s);
    reasons[reason]=(reasons[reason]??0)+1;
    if(reason!=='UNREACHABLE')success++;
  }
  assert.equal(Object.values(reasons).reduce((a,b)=>a+b,0),accepted);
  return {
    shuffles:trials,validSeven:accepted,reachable:success,
    conditionalOpportunity:success/accepted,wilson95:wilson95(success,accepted),
    routeBreakdown:reasons
  };
}

/** @param {number} samples */
function run(samples=1000000){
  assert.ok(Number.isSafeInteger(samples)&&samples>0);
  const source=loadDeck(SOURCE),two=loadDeck(CHALLENGER),
    hybrid=loadDeck(HYBRID);
  assert.equal(source.get('Technical Machine: Evolution'),2);
  assert.equal(two.get(ROWLET),2);
  assert.equal(hybrid.get(ROWLET),1);
  assert.equal(hybrid.get('Technical Machine: Evolution'),1);
  for(const name of new Set([...source.keys(),...hybrid.keys()])){
    if(name!==ROWLET&&name!=='Technical Machine: Evolution')
      assert.equal(hybrid.get(name),source.get(name),'Unexpected changed slot '+name);
  }
  const prior=runTwo(samples);
  const combined=simulateHybrid(samples,20261111);
  return {
    schema:VERSION,
    sampleUnits:'independent complete 60-card permutations per fixed list',
    sourcePrinted60:SOURCE,superOnlyPrinted60:CHALLENGER,
    hybridPrinted60:HYBRID,
    startsSelectedBeforePrizeMapping:true,
    frozenStarterPriority:'Rowlet if present; else Bunnelby; else Oddish; else first available Basic',
    sourceTM:prior.baseline,
    superOnly:prior.treatment,
    hybrid:combined,
    hybridMinusSuperOnly:combined.conditionalOpportunity-
      prior.treatment.conditionalOpportunity,
    hybridMinusSource:combined.conditionalOpportunity-
      prior.baseline.conditionalOpportunity,
    sourceAndSuperDoNotSharePhysicalDeals:true,
    countsWins:false,competitiveQualifiedGames:0,
    limitations:'Restricted turn-two deterministic reachability. Search results assume physical deck availability and remaining discard payment, with no extra draw, opponent action, actual Store replay, full game or match wins. Decision to take either available line is optimistic.'
  };
}

if(require.main===module){
  const samples=Number(process.env.AGENT10_HYBRID_SAMPLES??1000000);
  console.log(JSON.stringify(run(samples),null,2));
}

module.exports={VERSION,HYBRID,hybridState,hybridOpportunity,simulateHybrid,run};
