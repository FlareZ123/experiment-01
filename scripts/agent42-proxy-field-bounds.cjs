'use strict';

const assert = require('node:assert/strict');
const {run} = require('./agent42-missing-opponent-proxy-envelope.cjs');

/**
 * A score is a hypothetical per-opponent success probability in [0,1].
 * Source score estimates are externally supplied, under one unchanged
 * candidate, engine, policy, clock and sampling design. No score is
 * inferred from an archetype or from cards.
 * @typedef {Record<string,number>} RankScores
 */

/**
 * Compute the *hypothetical* 162-proxy field-average envelope algebraically,
 * rather than rerunning 162 identical source matches. Missing ranks 23 and
 * 28 may independently reuse any of nine published Regidrago source 60s;
 * rank 25 may reuse either published Raichu/Electrode 60.
 * 
 * @param {RankScores} scores all 29 original published ranks, by rank string
 * @returns {object}
 */
function proxyBounds(scores) {
  const field = run();
  const knownRanks = [
    1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,
    21,22,24,26,27,29,30,31,32
  ];
  assert.deepEqual(Object.keys(scores).map(Number).sort((a,b)=>a-b),
    knownRanks);
  for(const rank of knownRanks){
    assert.ok(typeof scores[rank] === 'number' &&
      Number.isFinite(scores[rank]) &&
      scores[rank]>=0 && scores[rank]<=1,
    'Invalid score for published rank '+rank);
  }
  const knownSum = knownRanks.reduce((s,r)=>s+scores[r],0);
  const regRanks=field.regidrago.ranks;
  const raiRanks=field.raichu.ranks;
  const regScores=regRanks.map(rank=>({rank,score:scores[rank]}));
  const raiScores=raiRanks.map(rank=>({rank,score:scores[rank]}));
  const lowReg=regScores.reduce((a,b)=>a.score<=b.score?a:b);
  const highReg=regScores.reduce((a,b)=>a.score>=b.score?a:b);
  const lowRai=raiScores.reduce((a,b)=>a.score<=b.score?a:b);
  const highRai=raiScores.reduce((a,b)=>a.score>=b.score?a:b);
  return {
    model:'hypothetical-29-plus-3-archetype-proxy-field',
    unknownRanks:[23,25,28],
    proxyAssignments:field.hypotheticalProxyAssignments,
    known29Sum:knownSum,
    minimum:(knownSum+2*lowReg.score+lowRai.score)/32,
    maximum:(knownSum+2*highReg.score+highRai.score)/32,
    minimumAssignment:{rank23:lowReg.rank,rank25:lowRai.rank,
      rank28:lowReg.rank},
    maximumAssignment:{rank23:highReg.rank,rank25:highRai.rank,
      rank28:highReg.rank},
    // Strictly no assumption at all about the three missing exact 60s:
    unboundedOriginalMinimum:knownSum/32,
    unboundedOriginalMaximum:(knownSum+3)/32,
    sourceOfKnownScores:'caller-supplied',
    competitiveQualifiedGames:0
  };
}

/**
 * Use a physically identical assignment of the three missing proxy 60s
 * for both candidate deck strategies. A robust candidate-A minus B
 * margin is the envelope of per-rank differences over *the same grid*.
 * The margin can be negative even if individual score envelopes overlap.
 * @param {RankScores} a
 * @param {RankScores} b
 */
function pairedDifferenceBounds(a,b) {
  proxyBounds(a);
  proxyBounds(b);
  const difference={};
  for(const [rank,score] of Object.entries(a)) {
    assert.ok(Object.prototype.hasOwnProperty.call(b,rank));
    difference[rank]=score-b[rank];
  }
  const field=run();
  const knownRanks=field.regidrago.ranks.concat(field.raichu.ranks);
  assert.ok(knownRanks.every(rank=>Number.isFinite(difference[rank])));
  // Reuse the same additive construction while allowing negative margins.
  const allRanks=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,
    20,21,22,24,26,27,29,30,31,32];
  assert.deepEqual(Object.keys(difference).map(Number).sort((x,y)=>x-y),
    allRanks);
  const sum=allRanks.reduce((s,r)=>s+difference[r],0);
  const reg=field.regidrago.ranks.map(r=>difference[r]);
  const rai=field.raichu.ranks.map(r=>difference[r]);
  return {
    model:'paired-candidate-difference-under-same-proxy-assignment',
    lower:(sum+2*Math.min(...reg)+Math.min(...rai))/32,
    upper:(sum+2*Math.max(...reg)+Math.max(...rai))/32,
    unboundedOriginalLower:(sum-3)/32,
    unboundedOriginalUpper:(sum+3)/32,
    robustlyBetterOnUnknownOriginals:sum>3,
    robustlyWorseOnUnknownOriginals:sum<-3,
    proxyAssignments:field.hypotheticalProxyAssignments,
    competitiveQualifiedGames:0
  };
}

module.exports={proxyBounds,pairedDifferenceBounds};
