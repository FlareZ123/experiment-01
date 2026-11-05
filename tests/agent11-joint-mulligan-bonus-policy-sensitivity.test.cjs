'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {bonusChoiceSensitivity,fromRepo}=
  require('../scripts/agent11-joint-mulligan-bonus-policy-sensitivity.cjs');

const frozen={basic:17,vulnerable:5,direct:16,safe:27,
  compressor:2,carrier:2,neutral:23};

test('four separately defined player bonus policies preserve exact original source profiles',()=>{
  const expected=[
    [1,3,0.00027445602170182427,0.00027236154012173053,
      0.0005207123518736979,0.0005186178702936041],
    [3,4,0.0003295422556391752,0.0003270469221746253,
      0.0006252425032318927,0.0006227471697673428],
    [1,2,0.00026304277774004136,0.0002609923488530192,
      0.0004990196267575506,0.0004969691978705285]
  ];
  for(const [dce,mail,bothAll,candidateAllSourceNone,
      candidateNoneSourceAll,bothNone] of expected){
    const r=bonusChoiceSensitivity(dce,mail,frozen);
    const p=r.probabilities;
    for(const [actual,reference] of [
      [p.candidateAll_sourceAll,bothAll],
      [p.candidateAll_sourceNone,candidateAllSourceNone],
      [p.candidateNone_sourceAll,candidateNoneSourceAll],
      [p.candidateNone_sourceNone,bothNone]
    ])assert.ok(Math.abs(actual-reference)<1e-12,
      'exact source '+dce+'/'+mail+' '+actual+' != '+reference);
    assert.ok(p.candidateAll_sourceAll>=p.candidateAll_sourceNone);
    assert.ok(p.candidateNone_sourceAll>=p.candidateNone_sourceNone);
    assert.ok(p.candidateAll_sourceAll<p.candidateNone_sourceAll);
    assert.ok(r.sourceAcceptAllTailAbsoluteBound<1e-15);
    assert.equal(r.claimedGameWins,0);
  }
});

test('frozen complete original rank6/rank24/rank29 categories and contender source are authenticated',()=>{
  const r=fromRepo();
  assert.deepEqual(r.profiles.map(p=>p.rank),[6,24,29]);
  assert.deepEqual(r.profiles.map(p=>p.mail),[3,4,2]);
  assert.deepEqual(r.profiles.map(p=>p.dce),[1,3,1]);
  assert.equal(r.competitiveQualifiedGames,0);
});
