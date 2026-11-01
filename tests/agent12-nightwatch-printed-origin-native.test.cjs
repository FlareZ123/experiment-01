'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {withUniformNightWatchOpponentSelection}=
  require('../simulation/twinleaf/agent12-nightwatch-paper-random-chooser.cjs');
const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} sourceModule */
const load=sourceModule=>require(path.join(root,sourceModule));

const {Store}=load('game/store/store');
const {Player}=load('game/store/state/player');
const {GamePhase}=load('game/store/state/state');
const {AttackEffect}=load('game/store/effects/game-effects');
const {ChooseCardsPrompt}=load('game/store/prompts/choose-cards-prompt');
const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
const {TrevenantDusknoirGX}=load(
  'sets/08-sun-and-moon/set-sun-and-moon-promos/trevenant-dusknoir-gx');
const {runDelegatedCopiedAttack,clearCopyAttackSessionsForTests}=
  load('game/store/prefabs/copy-attack-delegation');

/** @returns {object} Native pinned source-Pokémon fixture, no full-game claim. */
function board(){
  const manager=initializeCards();
  const source=manager.getCardByName('Trevenant & Dusknoir-GX SMP');
  const target=manager.getCardByName('Shadow Rider Calyrex V CRE');
  const mewtwo=manager.getCardByName('Mewtwo & Mew-GX UNM');
  const hand=['Ace Trainer AOR','VS Seeker PHF','Ultra Ball SUM']
    .map(name=>manager.getCardByName(name));
  assert.ok(source instanceof TrevenantDusknoirGX);
  assert.ok(target&&mewtwo&&hand.every(Boolean));
  const store=new Store({onStateChange(){}}),state=store.state;
  const actor=new Player(),victim=new Player();
  actor.id=101;victim.id=202;
  actor.active.cards.push(mewtwo);
  actor.discard.cards.push(source);
  victim.active.cards.push(target);
  victim.hand.cards.push(...hand);
  state.players=[actor,victim];
  state.phase=GamePhase.ATTACK;
  state.activePlayer=0;
  state.turn=4;
  return {store,state,actor,victim,source,mewtwo,hand};
}

test('actual pinned printed Night Watch marks delegated copy prompt before uniform draw',()=>{
  const beforeSource=TrevenantDusknoirGX.prototype.reduceEffect;
  const beforeAi=SimpleTacticsAi.prototype.resolvePrompt;
  const f=board();
  const observed=withUniformNightWatchOpponentSelection(()=>{
    runDelegatedCopiedAttack({
      store:f.store,state:f.state,player:f.actor,opponent:f.victim,
      copycatCard:f.mewtwo,sourceCard:f.source,
      selectedAttack:f.source.attacks[0],
      sourceSlot:f.actor.active,skipLog:true
    });
    const prompts=f.state.prompts.filter(p=>p instanceof ChooseCardsPrompt&&
      p.result===undefined);
    assert.equal(prompts.length,1);
    assert.strictEqual(prompts[0].cards,f.victim.hand);
    const ai=Object.create(SimpleTacticsAi.prototype);
    const action=ai.resolvePrompt(f.actor,f.state,prompts[0]);
    assert.ok(action instanceof ResolvePromptAction);
    assert.equal(action.result.length,2);
    assert.equal(new Set(action.result).size,2);
    assert.ok(action.result.every(card=>f.hand.includes(card)));
    return {action,prompt:prompts[0]};
  },{committedSeed:'native-fixed-printed',requirePrintedOrigin:true});
  assert.equal(observed.audit.printedSourceReducerInvocations,1);
  assert.equal(observed.audit.printedNightWatchPromptMarks,1);
  assert.equal(observed.audit.structuralCandidates,1);
  assert.equal(observed.audit.skippedUnmarkedStructuralPrompts,0);
  assert.equal(observed.audit.events.length,1);
  assert.strictEqual(TrevenantDusknoirGX.prototype.reduceEffect,beforeSource);
  assert.strictEqual(SimpleTacticsAi.prototype.resolvePrompt,beforeAi);
  clearCopyAttackSessionsForTests();
});

test('standalone pinned printed Night Watch directly creates marked selection',()=>{
  const f=board();
  f.actor.active.cards=[f.source];
  const observed=withUniformNightWatchOpponentSelection(()=>{
    f.source.reduceEffect(f.store,f.state,new AttackEffect(
      f.actor,f.victim,f.source.attacks[0]));
    const p=f.state.prompts.find(p=>p instanceof ChooseCardsPrompt&&
      p.result===undefined);
    assert.ok(p);
    const ai=Object.create(SimpleTacticsAi.prototype);
    return ai.resolvePrompt(f.actor,f.state,p);
  },{committedSeed:'native-fixed-direct',requirePrintedOrigin:true});
  assert.ok(observed.result instanceof ResolvePromptAction);
  assert.equal(observed.audit.printedNightWatchPromptMarks,1);
  assert.equal(observed.audit.structuralCandidates,1);
});
