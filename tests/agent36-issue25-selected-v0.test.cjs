'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {VERSION,SELECTED_OUTER_TO_INNER,runSelectedIssue25V0}=
  require('../simulation/evaluation/agent36-issue25-selected-v0.cjs');

test('actual selected profile enforces exactly one ordered closure and fixed 48-root options',()=>{
  const order=[],layers={};
  for(const key of SELECTED_OUTER_TO_INNER.slice(0,-1)){
    layers[key]=next=>{
      order.push('enter:'+key);
      const result=next();
      order.push('leave:'+key);
      return {result,audit:{selected:key}};
    };
  }
  let received=null;
  const out=runSelectedIssue25V0({layers,runner:options=>{
    received=options;
    return {rows:[]};
  }});
  assert.deepEqual(received,{actorOnlyComposition:true,nativeRootActionLimit:48});
  assert.deepEqual(order.slice(0,6),SELECTED_OUTER_TO_INNER
    .slice(0,-1).map(key=>'enter:'+key));
  assert.deepEqual(order.slice(6),SELECTED_OUTER_TO_INNER
    .slice(0,-1).reverse().map(key=>'leave:'+key));
  assert.equal(out.manifest.version,VERSION);
  assert.equal(out.manifest.selectedOpening,'agent50AllEligibleInitialBasics');
  assert.equal(out.manifest.knownStructuralVetoes.sourceRankSpecificNativeScripts,true);
  assert.equal(out.manifest.releaseQualified,false);
  assert.equal(out.diagnostic.allRegisteredAttemptsReturned,false);
  assert.equal(out.diagnostic.competitiveGamesQualified,0);
  assert.ok(out.manifest.resolvedSourceAndPolicyHashes.every(x=>
    /^[0-9a-f]{64}$/.test(x.sha256)));
});

test('fail-closed wrapper error cannot be counted as a native return or a win',()=>{
  const layers={};
  for(const key of SELECTED_OUTER_TO_INNER.slice(0,-1))
    layers[key]=next=>({result:next(),audit:{}});
  layers.nativeRawStateQuarantine=()=>{
    const error=new Error('closed');
    error.code='OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED';
    error.nativeRawStateFallbackQuarantine={
      originalNativeDecoderExecuted:false,rawStateFallbackCalls:1,
      records:[{turn:1,seat:0,promptType:'ChooseCardsPrompt'}]
    };
    throw error;
  };
  const out=runSelectedIssue25V0({
    layers,runner:()=>{throw new Error('must not execute');}
  });
  assert.equal(out.diagnostic.thrownCode,
    'OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED');
  assert.equal(out.diagnostic.allRegisteredAttemptsReturned,false);
  assert.equal(out.diagnostic.fallbackCalls,1);
  assert.equal(out.manifest.releaseQualified,false);
  assert.equal(out.diagnostic.competitiveGamesQualified,0);
});
