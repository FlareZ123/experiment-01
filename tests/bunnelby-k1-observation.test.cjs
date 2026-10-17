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

function implementations(source) {
  const optionsWithObserver=withBunnelbyEvolutionLine(options(),{
    sourceCards:source,observeFirstOwnDeckSearch:true});
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
  const {optionsWithObserver,Tactic,Observer}=implementations(source);
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
  const {optionsWithObserver,Tactic,Observer}=implementations(source);
  const tactic=new Tactic(optionsWithObserver);
  assert.equal(tactic.useTactic(state,a)?.name,'Evolution');
  new Observer(optionsWithObserver).resolvePrompt(state,a,showZone(state,a,a.deck));
  assert.equal(tactic.useTactic(state,a)?.name,'Evolution');
});

test('K1 observation cannot be enabled without a complete source inventory',()=>{
  assert.throws(()=>withBunnelbyEvolutionLine(options(),{
    observeFirstOwnDeckSearch:true}),/source 60/);
});
