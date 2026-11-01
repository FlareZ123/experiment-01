'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const VERSION='agent50-ces48-crash-burn-paper-v1';
/** Reversible card-specific correction around the pinned CES48 prompt callback. */
function withElectrodeCrashBurnPaper(run,deps={}){
 assert.equal(typeof run,'function');
 const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
 const native=name=>require(path.join(base,name));
 const cls=deps.ElectrodeGX??native('sets/08-sun-and-moon/set-celestial-storm/electrode-gx').ElectrodeGX;
 const {WAS_ATTACK_USED}=deps.prefabs??native('game/store/prefabs/prefabs');
 const original=Object.getOwnPropertyDescriptor(cls.prototype,'reduceEffect');
 assert.equal(typeof original?.value,'function');
 const audit={version:VERSION,markedPrompts:0,settled:[],competitiveQualifiedGames:0};
 function patched(store,state,effect){
  if(!WAS_ATTACK_USED(effect,1,this))
   return original.value.call(this,store,state,effect);
  const prior=store.prompt;
  store.prompt=function(s,p,then){
   if(p?.constructor?.name!=='DiscardEnergyPrompt'||
      p.playerId!==effect.player.id)
    return prior.call(store,s,p,then);
   audit.markedPrompts++;
   assert.equal(p.options.allowCancel,false);
   p.options.min=0;
   return prior.call(store,s,p,transfers=>{
    assert.ok(Array.isArray(transfers));
    assert.equal(p.validate(transfers),true);
    const n=transfers.length;
    const before=effect.damage;
    const result=then(transfers);
