'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,pairRows}=require(
  '../simulation/evaluation/agent50-rank19-float-stone-paired-development.cjs');

/** @param {object} extra */
function row(extra={}){
  return {
    trialId:'19:0:B:champion-reference',seed:177123,
    sourceSeat:0,candidateId:'champion-reference',
    sourceDealSha256:'a'.repeat(64),
    status:'CENSORED_OR_NATIVE_ERROR',
    ragingActiveRoots:0,...extra
  };
}
test('rank19 pairing requires actual 64-hex source deal parity',()=>{
  assert.equal(VERSION,
    'agent50-rank19-float-stone-original-source-paired-development-v1');
  const matching=pairRows(row(),row({ragingActiveRoots:3}));
  assert.equal(matching.physicalDealParity,'EXACT_SOURCE_DEAL_MATCH');
  assert.equal(matching.control.ragingActiveRoots,0);
  assert.equal(matching.treatment.ragingActiveRoots,3);
  assert.equal(matching.competitivelyQualified,false);
});
test('same seed with different physical source deal is unpaired',()=>{
  assert.equal(pairRows(row(),row({sourceDealSha256:'b'.repeat(64)}))
    .physicalDealParity,'SOURCE_DEAL_DIFFERENT');
});
test('unobserved source deal never becomes a matched source encounter',()=>{
  assert.equal(pairRows(row(),row({sourceDealSha256:null}))
    .physicalDealParity,'UNVERIFIED');
  assert.equal(pairRows(row({sourceDealSha256:null}),row())
    .physicalDealParity,'UNVERIFIED');
});
test('invalid digest strings cannot masquerade as an exact SHA-256 deal',()=>{
  assert.equal(pairRows(
    row({sourceDealSha256:'z'.repeat(64)}),
    row({sourceDealSha256:'z'.repeat(64)})
  ).physicalDealParity,'UNVERIFIED');
  assert.equal(pairRows(
    row({sourceDealSha256:'a'.repeat(63)}),
    row({sourceDealSha256:'a'.repeat(63)})
  ).physicalDealParity,'UNVERIFIED');
});
test('a comparison must preserve the registered seed and candidate printing 60',()=>{
  assert.throws(()=>pairRows(row(),row({seed:177124})));
  assert.throws(()=>pairRows(row(),row({candidateId:'new-moon-lockbreaker-v1'})));
});
test('a comparison cannot silently change rank trial or seat',()=>{
  assert.throws(()=>pairRows(row(),row({trialId:'19:0:A:champion-reference'})));
  assert.throws(()=>pairRows(row(),row({sourceSeat:1})));
});
