'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,runIssue25V8WithTelepathAndDefaultConfirmFalse
}=require('../simulation/evaluation/agent32-issue25-v8-telepath-confirm-default-false.cjs');

test('combined v8 prompt treatment remains explicitly development-only',()=>{
  const result=runIssue25V8WithTelepathAndDefaultConfirmFalse({
    innerLayer:run=>({
      result:run(),
      audit:{nativeMatchCalls:8,nativeMatchAttempts:[]}
    }),
    runV8:()=>({
      manifest:{version:'base-v8',resolvedSourceAndPolicyHashes:[],releaseQualified:true},
      diagnostic:{schema:'base-v8',competitiveGamesQualified:8},
      rawDevelopment:{rows:[]}
    })
  });
  assert.equal(result.manifest.version,VERSION);
  assert.equal(result.manifest.releaseQualified,false);
  assert.equal(result.manifest.competitiveGamesQualified,0);
  assert.equal(result.diagnostic.competitiveGamesQualified,0);
  assert.equal(result.manifest.nativeOwnerPromptAudit.nativeMatchCalls,8);
  assert.deepEqual(result.rawDevelopment,{rows:[]});
});
