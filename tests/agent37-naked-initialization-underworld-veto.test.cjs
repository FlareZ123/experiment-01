'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {nakedInitializationVeto}=
  require('../simulation/twinleaf/agent37-naked-initialization-underworld-veto.cjs');
const THORNS='Iron Thorns ex TWM';
const RIDER='Shadow Rider Calyrex VMAX CRE';
/** @returns {object} Synthetic public actor contract, no hidden cards. */
function fixture(){
  return {decisionKind:'owner-root',ownPublic:{
    active:{printing:'Mimikyu GRI',tools:[]},
    bench:[null,{printing:RIDER,tools:[],abilities:['Underworld Door']},
      null,null,null],stadium:[]},opponentPublic:{
    active:{printing:THORNS,tools:[],abilities:['Initialization']},
    bench:[{printing:THORNS,tools:[]},null,null,null,null],
    stadium:[]}};
}
const intent={kind:'use-underworld-door',position:'bench',
  benchIndex:1,abilityName:'Underworld Door'};
test('exact exposed rank6 T8 geometry produces conservative veto',()=>{
  const result=nakedInitializationVeto(fixture(),intent);
  assert.equal(result?.reason,'naked-opposing-active-initialization');
  assert.equal(result.nativeEffectVerified,false);
});
test('same actor-relative view works for either physical seat',()=>{
  for(const seat of [0,1]){
    const f=fixture();f.actorSeat=seat;
    assert.ok(nakedInitializationVeto(f,intent));
  }
});
for(const [name,edit] of [
  ['source no longer Rider',f=>{f.ownPublic.bench[1].printing='Mew VMAX FST';}],
  ['different Active',f=>{f.opponentPublic.active.printing='Iron Thorns ex TWM-alt';}],
  ['Path Stadium',f=>{f.ownPublic.stadium.push('Path to the Peak CRE');}],
  ['source Tool',f=>{f.ownPublic.bench[1].tools.push('Stealthy Hood UNB');}],
  ['opponent Tool',f=>{f.opponentPublic.active.tools.push('Tool X');}],
  ['another own Pokemon',f=>{f.ownPublic.bench[0]={printing:'Marshadow UNB',tools:[]};}],
  ['another foe Pokemon',f=>{f.opponentPublic.bench[1]={printing:THORNS,tools:[]};}],
  ['missing initialization print',f=>{f.opponentPublic.active.abilities=[];}]
])test('declines ambiguous '+name,()=>{
  const f=fixture();edit(f);
  assert.equal(nakedInitializationVeto(f,intent),null);
});
test('only applies to Underworld Door proposed action',()=>{
  assert.equal(nakedInitializationVeto(fixture(),{kind:'attack'}),null);
});
test('incorrect physical source index yields no veto',()=>{
  assert.equal(nakedInitializationVeto(fixture(),{
    ...intent,benchIndex:0}),null);
});
