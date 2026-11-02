'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,PIN,withActiveToolJammerToolEffectGuard}=
  require('../simulation/twinleaf/agent6-tool-jammer-tool-effect-guard.cjs');

class ToolEffect{
  constructor(player,card){this.player=player;this.card=card;}
}
class OtherEffect{}
function sample(){
  const stone={fullName:'Float Stone BKT'};
  const jammer={fullName:'Tool Jammer BST'};
  const owner={id:101,active:{
    tools:[stone],getPokemonCard:()=>({fullName:'Latias ex SSP'})}};
  const opponent={id:202,active:{
    tools:[jammer],getPokemonCard:()=>({fullName:'Iron Thorns ex TWM'})}};
  const state={activePlayer:0,players:[owner,opponent]};
  const store={calls:[],reduceEffect(s,e){
    this.calls.push(e.constructor.name);return s;
  }};
  return {stone,jammer,owner,opponent,state,store};
}
test('intercepts owner Active ToolEffect and preserves read-only return receipt',()=>{
  const x=sample(),before=x.store.reduceEffect;
  const r=withActiveToolJammerToolEffectGuard(
    x.store,x.owner,x.opponent,()=>{
      assert.throws(()=>x.store.reduceEffect(x.state,
        new ToolEffect(x.owner,x.stone)),/AGENT6_PAPER_TOOL_JAMMER/);
      return 'native-sequence';
    },{isJammerBlocked:()=>false});
  assert.match(VERSION,/agent6/);
  assert.equal(PIN.length,40);
  assert.equal(r.result,'native-sequence');
  assert.equal(r.patches.length,1);
  assert.equal(r.patches[0].outcome,'PAPER_TOOL_EFFECT_BLOCKED');
  assert.deepEqual(x.store.calls,[]);
  assert.strictEqual(x.store.reduceEffect,before);
});
test('no opposing active Jammer means no new ToolEffect block',()=>{
  const x=sample();
  x.opponent.active.tools=[];
  const r=withActiveToolJammerToolEffectGuard(
    x.store,x.owner,x.opponent,
    ()=>x.store.reduceEffect(x.state,new ToolEffect(x.owner,x.stone)),
    {isJammerBlocked:()=>false});
  assert.strictEqual(r.result,x.state);
  assert.deepEqual(x.store.calls,['ToolEffect']);
  assert.equal(r.patches.length,0);
});
test('opponent Tool Jammer disabled by another native effect stays inactive',()=>{
  const x=sample();
  const r=withActiveToolJammerToolEffectGuard(
    x.store,x.owner,x.opponent,
    ()=>x.store.reduceEffect(x.state,new ToolEffect(x.owner,x.stone)),
    {isJammerBlocked:()=>true});
  assert.equal(r.patches.length,0);
  assert.deepEqual(x.store.calls,['ToolEffect']);
});
test('does not disable Bench tools or your own Tool Jammer exemption',()=>{
  const x=sample();
  const benchTool={fullName:'Air Balloon SSH'};
  const r=withActiveToolJammerToolEffectGuard(
    x.store,x.owner,x.opponent,()=>{
      x.store.reduceEffect(x.state,new ToolEffect(x.owner,benchTool));
      x.store.reduceEffect(x.state,new ToolEffect(x.owner,x.jammer));
      return true;
    },{isJammerBlocked:()=>false});
  assert.equal(r.patches.length,0);
  assert.deepEqual(x.store.calls,['ToolEffect','ToolEffect']);
});
test('does not intercept other actor or unrelated effects',()=>{
  const x=sample();
  const r=withActiveToolJammerToolEffectGuard(
    x.store,x.owner,x.opponent,()=>{
      x.store.reduceEffect(x.state,new ToolEffect(x.opponent,x.jammer));
      x.store.reduceEffect(x.state,new OtherEffect());
      return true;
    },{isJammerBlocked:()=>false});
  assert.equal(r.patches.length,0);
  assert.deepEqual(x.store.calls,['ToolEffect','OtherEffect']);
});
test('restores original native reduction after any thrown execution',()=>{
  const x=sample(),before=x.store.reduceEffect;
  assert.throws(()=>withActiveToolJammerToolEffectGuard(
    x.store,x.owner,x.opponent,()=>{throw Error('external failure');},
    {isJammerBlocked:()=>false}),/external failure/);
  assert.strictEqual(x.store.reduceEffect,before);
});
