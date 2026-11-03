'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const FILE=path.resolve(__dirname,'../../results/aichi-2026/registrations/agent8-established-quickball-retrospective-20261103.json');
function preflightEstablished(){
 const p=JSON.parse(fs.readFileSync(FILE,'utf8'));
 assert.equal(p.schema,'agent8-established-quickball-retrospective-native-v1');
 assert.equal(p.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
 assert.equal(p.expectedNativeAttempts,4);
 assert.deepEqual(p.previouslyObservedSourceSeedGroups,[
   {sourceSeat:1,seed:2686109268},{sourceSeat:0,seed:1481213574}
 ]);
 return p;
}
if(require.main===module)console.log('ESTABLISHED_QUICKBALL_PREFLIGHT',JSON.stringify(preflightEstablished().previouslyObservedSourceSeedGroups));
module.exports={preflightEstablished};
