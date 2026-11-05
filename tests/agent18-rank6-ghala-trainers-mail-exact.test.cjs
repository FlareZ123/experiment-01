'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,MAX_MAIL,FOUR_CARD_DENOMINATOR,
  rank6MailCounts,exactMailExtension
}=require('../simulation/evaluation/agent18-rank6-ghala-trainers-mail-exact.cjs');
const {exactOpeningAccess}=
  require('../simulation/evaluation/agent18-rank6-ghala-direct-access-exact.cjs');

const REPORT=exactMailExtension();
const DIRECT=exactOpeningAccess();

/** @param {object} result @param {string} key @param {string} n @param {string} d */
function equalsFraction(result,key,n,d){
  assert.deepEqual([
    result.probabilities[key].numerator,
    result.probabilities[key].denominator
  ],[n,d]);
}

test('authenticated original rank6 60 and true printed four-card Mail count',()=>{
  assert.equal(VERSION,
    'agent18-original-rank6-trainers-mail-marginal-exact-v1');
  assert.deepEqual(rank6MailCounts(),[4,2,2,1,1,3,47]);
  assert.equal(MAX_MAIL,3);
  assert.equal(FOUR_CARD_DENOMINATOR,163185n);
});

test('all Basic-conditioned 7 / 6 / 1 real-card allocations counted exactly',()=>{
  assert.equal(REPORT.setup.exhaustiveWeightedPartitionVerified,true);
  assert.equal(REPORT.setup.remainingOwnerDeckAfterDraw,46);
  assert.ok(REPORT.setup.enumeratedWeightedStates>100000);
  assert.equal(REPORT.competitivelyQualifiedGames,0);
  assert.equal(REPORT.originalPrintedCounts.reduce((a,b)=>a+b,0),60);
});

test('exact old direct physically payable fraction agrees with independent earlier model',()=>{
  equalsFraction(REPORT,'heldDirectPaid',
    '148690835231','451798286940');
  assert.deepEqual(REPORT.probabilities.heldDirectPaid,
    DIRECT.probabilities.physicallyPayableDirectRoute);
});

test('top-four Mail access exact finite-population resampling probabilities',()=>{
  equalsFraction(REPORT,'mailOnlyExtra',
    '2036962192386516832799','41010331343049635767200');
  equalsFraction(REPORT,'firstMailExtra',
    '4497386169583','98391626933600');
  equalsFraction(REPORT,'combinedPaidAccess',
    '15533827047272343835079','41010331343049635767200');
  equalsFraction(REPORT,'combinedPaidAccessWithBench',
    '7179304406648793452273','102525828357624089418000');
  assert.ok(REPORT.probabilities.secondMailExtra.probability>0);
  assert.ok(REPORT.probabilities.thirdMailExtra.probability>0);
  assert.ok(REPORT.probabilities.combinedPaidAccessWithBench.probability<
    REPORT.probabilities.combinedPaidAccess.probability);
  assert.ok(Math.abs(REPORT.probabilities.combinedPaidAccess.probability-
    REPORT.probabilities.heldDirectPaid.probability-
    REPORT.probabilities.mailOnlyExtra.probability)<1e-12);
});

test('wrong original rank6 card count must fail before calculating',()=>{
  const original={decks:[{rank:6,cards:[
    {name:'Iron Thorns ex',count:4},
    {name:'Guzma & Hala',count:2},
    {name:'Tag Call',count:2},
    {name:'Thunder Mountain ♢',count:1},
    {name:'Double Colorless Energy',count:1},
    {name:"Trainers' Mail",count:4},
    {name:'Other',count:46}
  ]}]};
  assert.throws(()=>rank6MailCounts(original),/Original Rank6/);
  assert.throws(()=>exactMailExtension([4,2,2,1,1,4,46]));
});
