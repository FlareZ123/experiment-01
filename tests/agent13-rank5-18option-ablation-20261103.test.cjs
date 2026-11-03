'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {preflight,optionsForMode,runRelease}=
  require('../simulation/evaluation/agent13-rank5-18option-ablation-20261103.cjs');

test('historical selected 24 options and 18 exact additional true opt-ins are pinned',()=>{
  const {manifest,joint,trials}=preflight();
  assert.equal(manifest.historicalExplicitOptionCount,24);
  assert.equal(manifest.additionalTrueOptionCount,19);
  assert.equal(manifest.cutModeFalseOptions.length,18);
  assert.equal(trials.length,4);
  assert.equal(joint.policyOptions.allowAdditionalOriginalSourceRanks,true);
});

test('every shared v3.1 option remains identical while rank5 admission stays enabled',()=>{
  const {manifest,joint}=preflight();
  const full=optionsForMode(joint,manifest,manifest.modes[0]);
  const cut=optionsForMode(joint,manifest,manifest.modes[1]);
  const diff=Object.keys(full).filter(key=>full[key]!==cut[key]).sort();
  assert.deepEqual(diff,manifest.cutModeFalseOptions);
  for(const key of Object.keys(manifest.historicalV31SelectedExplicitOptions))
    assert.deepEqual(cut[key],full[key]);
  assert.equal(cut.allowAdditionalOriginalSourceRanks,true);
});

test('exact eight native attempts are retained and paired only if source deal fingerprint matches',()=>{
  const results=runRelease(options=>({
    attempted:4,
    rows:options.registeredTrials.map(trial=>({
      trial,sourceDealFingerprint:'source-phys-'+trial.id,
      rootActionLedgerSha256:'ledger-'+trial.id+
        (options.actorGenesectFusionDrawRoot?'-joint':'-minus18'),
      rootActionLedger:[],
      attackDeclarations:{source:Number(!options.actorGenesectFusionDrawRoot)},
      finished:false,endReason:'action-limit'
    }))
  }));
  assert.equal(results.registeredAttempts,8);
  assert.equal(results.samePhysicalSourcePairCount,4);
  assert.deepEqual(results.comparisons.map(c=>[
    c.baseline.sourceAttackDeclarations,c.cut18.sourceAttackDeclarations
  ]),[[0,1],[0,1],[0,1],[0,1]]);
  assert.ok(results.comparisons.every(c=>!c.nativeRootLedgerIdentical));
  assert.equal(results.qualifiedCompetitiveGames,0);
  assert.equal(results.modes[1].native.rows.length,4);
});

test('identical native seeds are insufficient without identical original physical source deals',()=>{
  const results=runRelease(options=>({
    attempted:4,rows:options.registeredTrials.map(trial=>({
      trial,sourceDealFingerprint:
        (options.actorGenesectFusionDrawRoot?'full-':'old-')+trial.id,
      rootActionLedger:[],finished:false,endReason:'action-limit'
    }))
  }));
  assert.equal(results.samePhysicalSourcePairCount,0);
  assert.ok(results.comparisons.every(c=>
    c.sourcePhysical==='UNVERIFIED_OR_DIFFERENT'));
});
