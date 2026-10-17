'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/bunnelby-k0-action-contrast.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {resolveManifestFile}=require('../simulation/twinleaf/resolve-field.cjs');
const {hasBenchEvolutionTarget,hasK0PossibleBenchEvolutionTarget,
  withBunnelbyEvolutionLine}=require('../simulation/twinleaf/bunnelby-evolution-policy.cjs');
const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const engine=p=>require(path.join(root,p));

function options() {
  const d=engine('simple-bot/simple-bot-definitions');
  return {tactics:d.allSimpleTactics,promptResolvers:d.allPromptResolvers,
    scores:d.defaultStateScores,arbiter:d.defaultArbiterOptions};
}

function source60() {
  const f=resolveManifestFile(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),
    {allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const rank2=f.decks.find(e=>e.rank===2);
  assert.ok(rank2?.playableUnderEngine);
  const manager=initializeCards();
  return rank2.cardIds.map(name=>manager.getCardByName(name));
}

function implementations(source,liveState) {
  const optionsWithObserver=withBunnelbyEvolutionLine(options(),{
    sourceCards:source,observeFirstOwnDeckSearch:true,
    isLivePrompt:state=>state===liveState});
  const Tactic=optionsWithObserver.tactics.find(t=>t.name==='BunnelbyEvolutionTactic');
  const Observer=optionsWithObserver.promptResolvers.find(
    r=>r.name==='ObserveOwnerDeckSearchResolver');
  assert.ok(Tactic);
  assert.ok(Observer);
  return {optionsWithObserver,Tactic,Observer};
}

function showZone(state,player,cards) {
  const {ChooseCardsPrompt}=engine('game/store/prompts/choose-cards-prompt');
  const {GameMessage}=engine('game/game-message');
  return new ChooseCardsPrompt(player,GameMessage.CHOOSE_CARD_TO_HAND,cards,{},
    {min:0,max:1,allowCancel:false,isSecret:true});
}

test('observed owner deck search changes K0 source possibility to K1 actual target',()=>{
  const {state,a,f}=stage(true);
  const source=source60();
  const {optionsWithObserver,Tactic,Observer}=implementations(source,state);
  const tactic=new Tactic(optionsWithObserver);
  const observer=new Observer(optionsWithObserver);
  assert.equal(hasBenchEvolutionTarget(a),false);
  assert.equal(hasK0PossibleBenchEvolutionTarget(a,source),true);
  assert.equal(tactic.useTactic(state,a)?.name,'Evolution');
  assert.equal(observer.resolvePrompt(state,a,showZone(state,a,a.hand)),undefined);
  assert.equal(tactic.useTactic(state,a)?.name,'Evolution');
  const other=state.players.find(player=>player.id!==a.id);
  assert.ok(other);
  assert.equal(observer.resolvePrompt(state,a,showZone(state,other,other.deck)),undefined);
  assert.equal(tactic.useTactic(state,a)?.name,'Evolution');
  assert.equal(observer.resolvePrompt(state,a,showZone(state,a,a.deck)),undefined);
  assert.equal(tactic.useTactic(state,a),undefined);
});

test('observed owner search does not suppress a genuinely available stage',()=>{
  const {state,a}=stage(false);
  const source=source60();
  const {optionsWithObserver,Tactic,Observer}=implementations(source,state);
  const tactic=new Tactic(optionsWithObserver);
  assert.equal(tactic.useTactic(state,a)?.name,'Evolution');
  new Observer(optionsWithObserver).resolvePrompt(state,a,showZone(state,a,a.deck));
  assert.equal(tactic.useTactic(state,a)?.name,'Evolution');
});

test('K1 observation cannot be enabled without a complete source inventory',()=>{
  assert.throws(()=>withBunnelbyEvolutionLine(options(),{
    observeFirstOwnDeckSearch:true}),/source 60/);
});

test('per-bot K1 observation closure is isolated from an untouched peer bot',()=>{
  const {state,a}=stage(true);
  const source=source60();
  const first=implementations(source,state);
  const second=implementations(source,state);
  const tacticA=new first.Tactic(first.optionsWithObserver);
  const tacticB=new second.Tactic(second.optionsWithObserver);
  assert.equal(tacticA.useTactic(state,a)?.name,'Evolution');
  assert.equal(tacticB.useTactic(state,a)?.name,'Evolution');
  new first.Observer(first.optionsWithObserver)
    .resolvePrompt(state,a,showZone(state,a,a.deck));
  assert.equal(tacticA.useTactic(state,a),undefined);
  assert.equal(tacticB.useTactic(state,a)?.name,'Evolution');
});

test('after legitimate K1 exposure, target existence ignores unseen deck order',()=>{
  const source=source60();
  const first=stage(false);
  const second=stage(false);
  second.a.deck.cards.reverse();
  const a=implementations(source,first.state),b=implementations(source,second.state);
  const t1=new a.Tactic(a.optionsWithObserver),t2=new b.Tactic(b.optionsWithObserver);
  new a.Observer(a.optionsWithObserver)
    .resolvePrompt(first.state,first.a,showZone(first.state,first.a,first.a.deck));
  new b.Observer(b.optionsWithObserver)
    .resolvePrompt(second.state,second.a,showZone(second.state,second.a,second.a.deck));
  assert.equal(t1.useTactic(first.state,first.a)?.name,'Evolution');
  assert.equal(t2.useTactic(second.state,second.a)?.name,'Evolution');
});


test('hypothetical owner deck-search prompt cannot trigger K1',()=>{
  const live=stage(true),imaginary=stage(true),source=source60();
  const {optionsWithObserver,Tactic,Observer}=implementations(source,live.state);
  const tactic=new Tactic(optionsWithObserver);
  const observer=new Observer(optionsWithObserver);
  assert.equal(tactic.useTactic(live.state,live.a)?.name,'Evolution');
  observer.resolvePrompt(imaginary.state,imaginary.a,
    showZone(imaginary.state,imaginary.a,imaginary.a.deck));
  assert.equal(tactic.useTactic(live.state,live.a)?.name,'Evolution',
    'Speculation must leave root knowledge at K0');
  observer.resolvePrompt(live.state,live.a,
    showZone(live.state,live.a,live.a.deck));
  assert.equal(tactic.useTactic(live.state,live.a),undefined,
    'A live owner deck search legitimately establishes K1');
});

test('observer refuses an unguarded K1 configuration',()=>{
  assert.throws(()=>withBunnelbyEvolutionLine(options(),{
    sourceCards:source60(),observeFirstOwnDeckSearch:true
  }),/live-Store prompt guard/);
});
