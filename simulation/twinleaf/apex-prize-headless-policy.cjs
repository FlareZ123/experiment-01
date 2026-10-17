'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {spreadAwareCopyResolverClass}=require('./apex-spread-copy-resolver.cjs');
const {prizeWindowPutDamageResolverClass}=require('./apex-spread-damage-resolver.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** Install tested copy-selection and six-counter prompt policies for one synchronous game. @returns {()=>void} Restore the original resolver constructors. */
function installApexPrizeWindowPolicy(){
 const {allPromptResolvers}=require(path.join(output,'simple-bot/simple-bot-definitions'));
 const a=allPromptResolvers.findIndex(ctor=>ctor.name==='ChooseAttackPromptResolver');
 const b=allPromptResolvers.findIndex(ctor=>ctor.name==='PutDamagePromptResolver');
 if(a<0||b<0)throw Error('Pinned Apex prompt factories changed');
 const oldA=allPromptResolvers[a],oldB=allPromptResolvers[b];
 const nextA=spreadAwareCopyResolverClass();
 const nextB=prizeWindowPutDamageResolverClass();
 allPromptResolvers[a]=nextA;allPromptResolvers[b]=nextB;
 return ()=>{
  assert.strictEqual(allPromptResolvers[a],nextA);
  assert.strictEqual(allPromptResolvers[b],nextB);
  allPromptResolvers[a]=oldA;allPromptResolvers[b]=oldB;
 };
}
module.exports={installApexPrizeWindowPolicy};
