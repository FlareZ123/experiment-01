'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {runPreservedMailTurn5Aba}=require('../simulation/evaluation/agent7-preserved-mail-turn5-original48-aba.cjs');
test('native original eight paid Mail continuation A/B/A',()=>{
 const result=runPreservedMailTurn5Aba();
 assert.equal(result.registeredOriginalArmsPerCondition,8);
 assert.equal(result.allTrials.length,8);
 assert.equal(result.paperQualifiedGames,0);
 console.log('AGENT7_PRESERVED_MAIL_T5_NATIVE '+JSON.stringify(result));
});
