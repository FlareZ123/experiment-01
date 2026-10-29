'use strict';
const assert=require('node:assert/strict');
const {SOURCE_RANKS,runRanks}=
  require('./agent18-aichi-k0-stratified-native.cjs');
const {sourceDecks}=
  require('./agent18-aichi-source-k0-native-root.cjs');

const REMAINING_RANKS=Object.freeze([
  1,3,4,5,7,8,9,12,13,14,15,16,17,18,19,20,21,22,26,27,30,31,32
]);

/**
 * Exhaust the exact remaining 23 published originals, including champion
 * mirror, without importing or imputing unavailable ranks 23,25,28.
 * @returns {object} All-registered-rank failure-inclusive bounded receipts.
 */
function run(){
  const originals=sourceDecks();
  const covered=new Set([...SOURCE_RANKS,...REMAINING_RANKS]);
  assert.equal(originals.size,29,
    'Original-source field has changed; reconfirm this registered sample');
  assert.equal(covered.size,29);
  assert.deepStrictEqual([...covered].sort((a,b)=>a-b),
    [...originals.keys()].sort((a,b)=>a-b),
    'Registered tests must cover exactly every known original 60');
  const summary=runRanks(REMAINING_RANKS,
    'agents/agent18/20261029-remaining23-original-field-k0-protocol.md',
    'agent18-aichi-original-source-K0-remaining23-survey-v1');
  return {...summary,knownOriginalFieldSize:originals.size,
    otherSixAlreadyRun:[...SOURCE_RANKS],
    missingOriginalFullDecks:[23,25,28]};
}
if(require.main===module){
  const audit=run();
  process.stdout.write(JSON.stringify(audit,null,2)+'\n');
  if(audit.blocked>0)process.exitCode=1;
}
module.exports={REMAINING_RANKS,run};
