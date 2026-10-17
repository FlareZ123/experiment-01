'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stageGuzmaHand}=require('../simulation/twinleaf/bunnelby-gh-discard-policy-probe.cjs');
const {withGhBunnelbyResourceSelection}=require('../simulation/twinleaf/bunnelby-gh-search-policy.cjs');
const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(root,name));
function select(prized,guard=true){
  const f=stageGuzmaHand(prized);
  const {PlayCardAction,PlayerType,SlotType}=engine('game/store/actions/play-card-action');
  const index=f.player.hand.cards.findIndex(c=>c.fullName==='Guzma & Hala CEC');
  f.store.dispatch(new PlayCardAction(f.player.id,index,{player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
  const mode=f.bot.decodeNextAction(f.state);
  assert.equal(mode.result,1);
  f.store.dispatch(mode);
  f.store.dispatch(f.bot.decodeNextAction(f.state));
  const prompt=f.state.prompts.find(p=>p.result===undefined);
  assert.equal(prompt.constructor.name,'ChooseCardsPrompt');
  assert.equal(prompt.cards,f.player.deck);
  const defs=engine('simple-bot/simple-bot-definitions');
  const options=withGhBunnelbyResourceSelection({tactics:defs.allSimpleTactics,
    promptResolvers:defs.allPromptResolvers,scores:defs.defaultStateScores,
    arbiter:defs.defaultArbiterOptions},()=>guard);
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const bot=new SimpleTacticsAi({id:f.player.id},options,null);
  const action=bot.decodeNextAction(f.state);
  assert.ok(action);
  assert.equal(prompt.validate(action.result),true);
  return {names:action.result.map(c=>c.fullName),prompt,f,action};
}
test('authentic source rank2 GH selects TM Evolution and Jet when searchable',()=>{
  const a=select(false);
  assert.ok(a.names.includes('Technical Machine: Evolution PAR'));
  assert.ok(a.names.includes('Jet Energy PAL'));
  assert.ok(a.names.includes('Artazon PAL'));
  a.f.store.dispatch(a.action);
  assert.ok(a.f.player.hand.cards.some(c=>c.fullName==='Jet Energy PAL'));
  assert.ok(a.f.player.hand.cards.some(c=>c.fullName==='Technical Machine: Evolution PAR'));
});
test('when stage is actually prized, guarded search falls back to generic',()=>{
  const a=select(true);
  assert.deepEqual(a.names,['Counter Gain SSP','Artazon PAL','Capture Energy RCL']);
});
test('hypothetical Store and other contexts are rejected by live-root guard',()=>{
  const a=select(false,false);
  assert.deepEqual(a.names,['Counter Gain SSP','Artazon PAL','Capture Energy RCL']);
});
