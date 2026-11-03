'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const FILE=path.resolve(__dirname,'../../results/aichi-2026/registrations/agent8-established-quickball-prospective-24-20261103.json');
function preflightEstablishedProspective(){
 const p=JSON.parse(fs.readFileSync(FILE,'utf8'));
 assert.equal(p.schema,'agent8-established-quickball-prospective-native-v1');
 assert.equal(p.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
 assert.equal(p.sourceRank,13);assert.equal(p.opponentRank,1);
 assert.equal(p.expectedNativeAttempts,48);
 assert.equal(p.sourceSeedGroups.length,24);
 const seen=new Set(),counts=[0,0];
 for(const x of p.sourceSeedGroups){
  assert.ok(x.sourceSeat===0||x.sourceSeat===1);
  counts[x.sourceSeat]++;
  assert.ok(Number.isSafeInteger(x.seed)&&x.seed>=0&&x.seed<=0xffffffff);
  assert.ok(!seen.has(x.seed));seen.add(x.seed);
 }
 assert.deepEqual(counts,[12,12]);
 return p;
}
if(require.main===module)console.log('QUICKBALL_PROSPECTIVE_PREFLIGHT',preflightEstablishedProspective().expectedNativeAttempts);
module.exports={preflightEstablishedProspective};
