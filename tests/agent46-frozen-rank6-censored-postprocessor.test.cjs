'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {frozenRank6ToCensoredPairs} = require('../simulation/evaluation/agent46-frozen-rank6-censored-postprocessor.cjs');
const profile = require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.json');
const roster = require('../results/aichi-2026/original-printed60-admission-v1.json');

/** @param {{missing?:boolean,shift?:boolean}} opts */
function native(opts={}) {
  const rows=profile.registeredTrials.map(trial=>({
    trial:{id:trial.id,candidateId:trial.candidateId},
    candidateSeat:trial.candidateSlot==='A'?0:1,
    verifiedFirstTurn:true,
    sourceDealFingerprint:(trial.candidateSlot==='A'?'a':'b').repeat(64),
    nativeWinnerSeat:trial.candidateSlot==='A'?0:1,
    finished:true,qualifiesForCompetitiveInference:true
  }));
  if(opts.missing)rows.pop();
  if(opts.shift)rows[1].sourceDealFingerprint='c'.repeat(64);
  return {rawNativeResult:{rows}};
}

test('unaltered four-arm frozen manifest and 29-source ledger stay censored',()=>{
  const x=frozenRank6ToCensoredPairs(profile,roster,native());
  assert.equal(x.paired.registeredPairs,2);
  assert.equal(x.paired.observedArms,4);
  assert.equal(x.paired.matchedSourcePairs,2);
  assert.equal(x.paired.unadmittedOriginalPrintPairs,0);
  assert.equal(x.paired.cells[10].length,1);
  assert.equal(x.paired.cells[11].length,1);
  assert.equal(x.paired.cells[10][0].referenceStatus,'CENSORED');
  assert.equal(x.paired.cells[11][0].challengerStatus,'CENSORED');
  assert.equal(x.statisticalStatus.censoredPairs,2);
  assert.equal(x.statisticalStatus.decision,'INSUFFICIENT_INFORMATION');
  assert.equal(x.competitiveGameQualified,false);
});

test('missing native arm preserves registered denominator and uncertainty',()=>{
  const x=frozenRank6ToCensoredPairs(profile,roster,native({missing:true}));
  assert.equal(x.paired.registeredArms,4);
  assert.equal(x.paired.observedArms,3);
  assert.equal(x.paired.missingArms,1);
  assert.equal(x.statisticalStatus.unmatchedPairs,1);
});

test('same numeric seed does not paper over changed source physical setup',()=>{
  const x=frozenRank6ToCensoredPairs(profile,roster,native({shift:true}));
  assert.equal(x.paired.registeredPairs,2);
  assert.equal(x.paired.matchedSourcePairs,1);
  assert.equal(x.statisticalStatus.unmatchedPairs,1);
});

test('different source manifest and candidate identity reject',()=>{
  assert.throws(()=>frozenRank6ToCensoredPairs(profile,
    {...roster,sourceGitBlobSha:'0'.repeat(40)},native()));
  assert.throws(()=>frozenRank6ToCensoredPairs(
    {...profile,candidateIds:['wrong','new-moon-lockbreaker-v1']},roster,native()));
  const bad=native();bad.rawNativeResult.rows[0].trial.candidateId='wrong';
  assert.throws(()=>frozenRank6ToCensoredPairs(profile,roster,bad),
    /misidentified observed trial/);
});
