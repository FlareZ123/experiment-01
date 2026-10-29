'use strict';

const assert = require('node:assert/strict');
const {
  choose, rank11Counts, enumerate
} = require('../scripts/aichi-rank11-direct-hand8.cjs');

const rows = [
  ['Mega Absol ex',3],['Trubbish',2],['Garbodor',2],
  ['Oranguru V',2],['Latias ex',1],['Tapu Lele-GX',1],
  ['Crobat V',1],['Squawkabilly ex',1],
  ['Carmine',3],['Marnie',3],['Guzma',2],
  ['Battle VIP Pass',4],['Quick Ball',4],['Professor\'s Letter',4],
  ['Dark Patch',3],['Boost Shake',2],['Escape Rope',1],
  ['Super Rod',1],['VS Seeker',1],['Secret Box',1],
  ['Float Stone',3],['Forest Seal Stone',2],['Muscle Band',1],
  ['Shopping Center',2],['Temple of Sinnoh',2],['Darkness Energy',8]
];
const corpus = {decks:[{rank:11,cards:rows.map(([name,count])=>({name,count}))}]};

function close(actual,expected,tolerance=1e-12) {
  assert.ok(Math.abs(actual-expected)<=tolerance,actual+' vs '+expected);
}

const checks = [];
function check(name, test) {
  test();
  checks.push(name);
  process.stdout.write('PASS '+checks.length+' '+name+'\n');
}
check('exact binomial arithmetic',()=>{
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(5,6),0n);
  assert.equal(choose(4,2),6n);
});
const counts=rank11Counts(corpus);
check('source rank11 is disjoint exact 60',()=>{
  assert.deepEqual(counts,[2,6,2,4,4,2,9,31]);
});
const result=enumerate(counts);
check('initial seven Basic validity',()=>{
  close(result.validOpening.decimal,0.7775788585041408);
  assert.equal(result.validOpening.numerator,'1137524');
  assert.equal(result.validOpening.denominator,'1462905');
});
check('direct eight-card access, exact benchmark',()=>{
  close(result.directUnconditional.decimal,0.05228984113118956);
  close(result.directConditionalValid.decimal,0.06724699438431442);
});
check('live post-Prize Garbodor and Trubbish requirements',()=>{
  close(result.directLiveConditionalValid.decimal,0.06455506120208007);
  assert.ok(result.directLiveConditionalValid.decimal<
    result.directConditionalValid.decimal);
});
check('Quick Ball is a permissive connector expansion',()=>{
  close(result.quickBallLiveConditionalValid.decimal,0.08566735044641544);
  assert.ok(result.quickBallLiveConditionalValid.decimal>
    result.directLiveConditionalValid.decimal);
});
check('removing Quick Ball opportunity preserves strict route probability',()=>{
  const changed=counts.slice();
  changed[7]+=changed[4];
  changed[4]=0;
  const next=enumerate(changed);
  close(next.directLiveConditionalValid.decimal,
    result.directLiveConditionalValid.decimal);
  close(next.quickBallLiveConditionalValid.decimal,
    next.directLiveConditionalValid.decimal);
});
check('no Boost Shake cannot satisfy the direct route',()=>{
  const changed=counts.slice();
  changed[7]+=changed[0];
  changed[0]=0;
  assert.equal(enumerate(changed).directLiveConditionalValid.decimal,0);
});
check('zero exposure across 6 independent valid openings is unsurprising',()=>{
  close(result.noDirectLiveInSixIndependentDealsModel,0.6700533418461605);
});
process.stdout.write('PASS '+checks.length+'/'+checks.length+' standalone checks\n');
