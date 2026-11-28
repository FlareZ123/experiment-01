'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {
 configureRank18SourceProjection,ENGINE_PIN,ROUTER_VERSION
}=require('../../simulation/evaluation/2026-11/agent2-rank18-source-projection-router.cjs');
const {
 SOURCE_RANK,SOURCE_BLOB_SHA1
}=require('../../simulation/evaluation/2026-11/agent2-rank18-regidrago-opponent-policy.cjs');
const base={
 projectPrompt(options){return {delegated:true,prompt:options?.prompt??null}},
 makeSource(){return {sourceKind:'engine'}},
 validateRawPromptResult(){return {valid:false}}
};
const config={rank:SOURCE_RANK,sourceBlobSha1:SOURCE_BLOB_SHA1,
 enginePin:ENGINE_PIN,baseProjector:base};
class ChooseCardsPrompt{}
class AttachEnergyPrompt{}
class SelectPrompt{}
test('source identity binds rank18 original and exact pinned engine',()=>{
 assert.equal(ROUTER_VERSION,'agent2-rank18-exact-source-router-v1');
 assert.equal(SOURCE_RANK,18);
 for(const bad of [
  {rank:27},{sourceBlobSha1:'forged'},{enginePin:'future'},
  {enableMotivate:'yes'},{enableHeavyBall:1},
  {baseProjector:{projectPrompt(){}}}
 ]){
  assert.throws(()=>configureRank18SourceProjection({...config,...bad}));
 }
});
test('both extensions default off: no change to any generic projection',()=>{
 const router=configureRank18SourceProjection(config);
 assert.equal(router.settings.enableMotivate,false);
 assert.equal(router.settings.enableHeavyBall,false);
 for(const prompt of [new ChooseCardsPrompt(),new AttachEnergyPrompt(),new SelectPrompt()]){
  const out=router.projectPrompt({prompt});
  assert.equal(out.delegated,true);
  assert.equal(out.prompt,prompt);
 }
});
test('source extension flags independently select only their native prompt types',()=>{
 const motivate=configureRank18SourceProjection({...config,enableMotivate:true});
 const heavy=configureRank18SourceProjection({...config,enableHeavyBall:true});
 assert.equal(motivate.projectPrompt({prompt:new ChooseCardsPrompt()}).delegated,true);
 assert.equal(heavy.projectPrompt({prompt:new AttachEnergyPrompt()}).delegated,true);
 // Enabled source projector enforces owner/phase before any unsafe prompt
 // path; no hidden cards or fabricated default successful decision.
 assert.throws(()=>motivate.projectPrompt({
  prompt:new AttachEnergyPrompt(),actorSeat:0,
  provenanceHook:{getPromptProvenance:()=>({sourceCard:{name:'Squawkabilly ex'}})}
 }),x=>x?.code==='R18_MOTIVATE_ACTOR_PHASE');
 assert.throws(()=>heavy.projectPrompt({
  prompt:new ChooseCardsPrompt(),actorSeat:0,
  provenanceHook:{getPromptProvenance:()=>({sourceCard:{name:'Hisuian Heavy Ball'}})}
 }),x=>x?.code==='R18_HEAVY_BALL_ACTOR_PHASE');
});
test('unrelated prompt class delegates even when both source flags are on',()=>{
 const router=configureRank18SourceProjection({
  ...config,enableMotivate:true,enableHeavyBall:true});
 const prompt=new SelectPrompt();
 const out=router.projectPrompt({prompt,actorSeat:0});
 assert.deepEqual(out,{delegated:true,prompt});
 assert.equal(router.settings.schema,ROUTER_VERSION);
 assert.equal(Object.isFrozen(router),true);
 assert.equal(Object.isFrozen(router.settings),true);
});
