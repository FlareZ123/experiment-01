'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');
const {
  FIELD_RANKS, FIELD_TARGET, NECESSARY_RANK_WIN_RATE,
  MAX_EXPECTED_PAIR_NONWINS, E_THRESHOLD, COMPONENTS,
  pairedRankLogEValue, assessPairedFieldRejection
} = require('../simulation/evaluation/agent15-aichi-995-paired-seat-rejection.cjs');

const candidateId = 'synthetic-unchanged-deck-60';

/**
 * @param {string} id
 * @param {number} rank
 * @param {string} seat0Outcome
 * @param {string} seat1Outcome
 * @returns {object}
 */
function pair(id, rank, seat0Outcome, seat1Outcome) {
  return {
    id, originalRank: rank, candidateId,
    seatAssignment: 'COMPLETE_0_1_PAIR',
    blockSampling: 'FRESH_PREDECLARED_PAIR',
    games: [
      {id:`${id}-0`,sourceSeat:0,outcome:seat0Outcome,qualification:'QUALIFIED'},
      {id:`${id}-1`,sourceSeat:1,outcome:seat1Outcome,qualification:'QUALIFIED'}
    ]
  };
}

test('SFT field target algebra, fixed e-weights and absent-games neutrality', () => {
  assert.equal(FIELD_RANKS,32);
  assert.equal(FIELD_TARGET,0.995);
  assert.equal(MAX_EXPECTED_PAIR_NONWINS,0.32000000000000006);
  assert.ok(Math.abs((31+NECESSARY_RANK_WIN_RATE)/32-FIELD_TARGET)<1e-12);
  assert.equal(E_THRESHOLD,640);
  assert.equal(COMPONENTS.reduce((s,x)=>s+x.weight,0),1);
  assert.ok(Math.abs(pairedRankLogEValue(0,0))<1e-12);
});

test('SFT optional-stopping check is only after a complete pair; 3 worst pairs fail, 4 cross', () => {
  const pairs=Array.from({length:4},(_,i)=>pair(`p${i+1}`,6,'loss','loss'));
  const three=assessPairedFieldRejection(pairs.slice(0,3),candidateId);
  const four=assessPairedFieldRejection(pairs,candidateId);
  assert.equal(three.rejectionFlag,false);
  assert.equal(four.rejectionFlag,true);
  assert.equal(four.firstCrossing.pairOrdinal,4);
  assert.equal(four.firstCrossing.originalRank,6);
  assert.equal(four.ranks[5].seatNonwins[0],4);
  assert.equal(four.ranks[5].seatNonwins[1],4);
  assert.ok(Math.exp(three.ranks[5].logEValue)<640);
  assert.ok(Math.exp(four.ranks[5].logEValue)>640);
  console.log('PAIRED_SFT',JSON.stringify({
    threePairE:Math.exp(three.ranks[5].logEValue),
    fourPairE:Math.exp(four.ranks[5].logEValue),
    threshold:E_THRESHOLD,qualifiedGamesInRepo:0
  }));
});

test('SFT interleaved ranks and switched game order leave full-pair evidence invariant', () => {
  const first=pair('a',11,'loss','win');
  const reverse=pair('b',11,'win','loss');
  reverse.games.reverse();
  const other=pair('c',6,'win','win');
  const out=assessPairedFieldRejection([first,other,reverse],candidateId);
  assert.equal(out.ranks[10].nonwins,2);
  assert.equal(out.ranks[10].completeBlocks,2);
  assert.equal(out.ranks[5].wins,2);
  assert.ok(Math.abs(out.ranks[10].logEValue - pairedRankLogEValue(2,2))<1e-12);
});

test('SFT null boundary joint distributions, including perfect seat correlation', () => {
  for(const {base} of COMPONENTS) {
    const z=(1-MAX_EXPECTED_PAIR_NONWINS/2) + (MAX_EXPECTED_PAIR_NONWINS/2)*base*base;
    const fullCorrelation=(.84+ .16*base*base)/z;
    const allLossOnlySeat0=(.68+.32*base)/z;
    const alwaysWin=1/z;
    assert.ok(Math.abs(fullCorrelation-1)<1e-12);
    assert.ok(allLossOnlySeat0<=1+1e-12);
    assert.ok(alwaysWin<=1+1e-12);
  }
});

test('SFT exact 4-block worst-correlated null stopping probability is below allocation', () => {
  // Under the boundary coupling L=0 with .84, L=2 with .16 each
  // independent block. Enumerate 2^4 paths and all complete-block stops.
  const n=4;
  let crossingProbability=0;
  for(let mask=0;mask<1<<n;mask++) {
    let nonwins=0,heads=0,crossed=false;
    for(let i=0;i<n;i++) {
      if((mask & (1<<i))!==0) {nonwins+=2; heads++;}
      if(pairedRankLogEValue(nonwins,i+1)>=Math.log(E_THRESHOLD))
        crossed=true;
    }
    if(crossed) crossingProbability += .16**heads * .84**(n-heads);
  }
  assert.ok(Math.abs(crossingProbability - .16**4)<1e-12);
  assert.ok(crossingProbability<=.05/32);
});

test('SFT fail closed for partial blocks, duplicate outcomes, false qualification and false schedule', () => {
  const b=pair('first',6,'loss','win');
  assert.throws(()=>assessPairedFieldRejection([{...b,games:[b.games[0]]}],candidateId),/complete two-game/);
  assert.throws(()=>assessPairedFieldRejection([{...b,games:[b.games[0],{...b.games[1],sourceSeat:0}]}],candidateId),/exactly once/);
  assert.throws(()=>assessPairedFieldRejection([b,{...b,id:'second'}],candidateId),/globally unique/);
  assert.throws(()=>assessPairedFieldRejection([{...b,originalRank:33}],candidateId));
  assert.throws(()=>assessPairedFieldRejection([{...b,candidateId:'another 60'}],candidateId),/cannot mix/);
  assert.throws(()=>assessPairedFieldRejection([{...b,blockSampling:'ADAPTIVE_SELECTED_DEAL'}],candidateId),/FRESH_PREDECLARED_PAIR/);
  assert.throws(()=>assessPairedFieldRejection([{...b,seatAssignment:'FAIR_COIN'}],candidateId),/COMPLETE_0_1_PAIR/);
  assert.throws(()=>assessPairedFieldRejection([{...b,games:[{...b.games[0],qualification:'ENGINE_ONLY'},b.games[1]]}],candidateId),/paper-invalid/);
  assert.throws(()=>assessPairedFieldRejection([{...b,games:[{...b.games[0],outcome:'cap'},b.games[1]]}],candidateId));
});

test('SFT 20k blocks retain finite numerically stable log evidence', () => {
  const logE=pairedRankLogEValue(40000,20000);
  assert.ok(Number.isFinite(logE));
  assert.ok(logE>Math.log(E_THRESHOLD));
  const empty=assessPairedFieldRejection([],candidateId);
  assert.equal(empty.rejectionFlag,false);
  assert.equal(empty.qualifiedGameClaims,0);
  assert.equal(empty.qualificationVerifiedExternally,false);
});
