'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {runSymmetricIssue25V1}=
  require('../simulation/evaluation/agent36-issue25-symmetric-v1.cjs');
const {SELECTED_OUTER_TO_INNER}=
  require('../simulation/evaluation/agent36-issue25-selected-v0.cjs');

test('v1 executes one selected owner chain with true symmetric runner option',()=>{
  const order=[],layers={};
  const keys=SELECTED_OUTER_TO_INNER.slice(0,-1);
  for(const key of keys)layers[key]=next=>{
    order.push('enter:'+key);
    const result=next();
    order.push('leave:'+key);
    return {result,audit:{key}};
  };
  let options;
  const out=runSymmetricIssue25V1({layers,runner:opts=>{
    options=opts;
    return {rows:[],sourceIndependentCommonPolicyOptIn:true};
  }});
  assert.deepEqual(options,{
    actorOnlyComposition:true,nativeRootActionLimit:48,
    sourceIndependentCommonPolicy:true
  });
  assert.deepEqual(order,[
    ...keys.map(key=>'enter:'+key),
    ...[...keys].reverse().map(key=>'leave:'+key)
  ]);
  assert.equal(out.manifest.actualRunnerConfirmedOption,true);
  assert.equal(out.manifest.selectedOpening,'agent50AllEligibleInitialBasics');
  assert.equal(out.manifest.knownStructuralVetoes.sourceRankSpecificNativeScripts,false);
  assert.equal(out.manifest.releaseQualified,false);
  assert.equal(out.diagnostic.competitiveGamesQualified,0);
});

test('v1 preserves typed error and zero game qualifications',()=>{
  const layers={};
  for(const key of SELECTED_OUTER_TO_INNER.slice(0,-1))
    layers[key]=next=>({result:next(),audit:{}});
  const out=runSymmetricIssue25V1({
    layers,runner:()=>{throw new Error('native blocked');}
  });
  assert.equal(out.diagnostic.thrownMessage,'native blocked');
  assert.equal(out.diagnostic.allRegisteredAttemptsReturned,false);
  assert.equal(out.manifest.releaseQualified,false);
});
