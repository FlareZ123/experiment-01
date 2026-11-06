'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {runIssue25V8WithTelepath,VERSION}=require('../simulation/evaluation/agent32-issue25-v8-telepath-development.cjs');
test('v8 Telepath wrapper preserves development-only status',()=>{
 const original=()=>{};
 const headless={runMatch:original};
 const runV8=()=>({manifest:{version:'base',resolvedSourceAndPolicyHashes:[],releaseQualified:true},diagnostic:{schema:'base',competitiveGamesQualified:4},rawDevelopment:{rows:[]}});
 const telepath=run=>({result:run(),audit:{nativeMatchCalls:0,nativeMatchAttempts:[]}});
 const result=runIssue25V8WithTelepath({headless,telepath,runV8});
 assert.equal(result.manifest.version,VERSION);
 assert.equal(result.manifest.releaseQualified,false);
 assert.equal(result.diagnostic.competitiveGamesQualified,0);
 assert.equal(headless.runMatch,original);
});
