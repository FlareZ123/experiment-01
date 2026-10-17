'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');
const {installForestSealSearchHook} =
  require('../simulation/twinleaf/forest-seal-search-hook.cjs');
const {attachedToolPowerTacticClass,withAttachedToolPowerTactic,
  withAttachedToolPowerPolicy} =
  require('../simulation/twinleaf/attached-tool-power-tactic.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const mod=name=>require(path.join(output,name));

/** @returns {object} */
function board() {
  const cards=initializeCards();
  let nextId=1;
  const card=name=>{
    const c=cards.getCardByName(name);
    assert.ok(c,name);
    c.id=nextId++;
    return c;
  };
  const {Store}=mod('game/store/store');
  const {Player}=mod('game/store/state/player');
  const {GamePhase}=mod('game/store/state/state');
  const {CardList}=mod('game/store/state/card-list');
  const {PokemonCardList}=mod('game/store/state/pokemon-card-list');
  const {Format}=mod('game/store/card/card-types');
  const state=new Store({onStateChange(){}}).state;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=2;
  state.activePlayer=0;
  state.gameSettings.format=Format.EXPANDED;
  const a=new Player(),b=new Player();
  a.id=101; b.id=202;
  a.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const v=new PokemonCardList();
  v.cards.push(card('Shadow Rider Calyrex V CRE'));
  const stone=card('Forest Seal Stone SIT');
  v.tools.push(stone);
  a.bench.push(v);
  b.active.cards.push(card('Dratini OBF'));
  const ranger=card('Pokemon Ranger STS');
  a.deck.cards.push(ranger,card('Psychic Energy SVE'));
  b.deck.cards.push(card('Psychic Energy SVE'));
  for(const player of [a,b]){
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  state.players=[a,b];
  const store=new Store({onStateChange(){}});
  store.state=state;
  return {state,store,a,stone,ranger};
}

test('default Ability tactic omits attached Tool power; opt-in enumerates an actionable Star Alchemy',()=>{
  const fixture=board();
  const definitions=mod('simple-bot/simple-bot-definitions');
  const {UseAbilityTactic}=mod('simple-bot/simple-tactics/use-ability-tactic');
  const {UseAbilityAction}=mod('game/store/actions/game-actions');
  const {ResolvePromptAction}=mod('game/store/actions/resolve-prompt-action');
  const opts={scores:definitions.defaultStateScores,arbiter:definitions.defaultArbiterOptions,
    promptResolvers:definitions.allPromptResolvers};
  const normal=new UseAbilityTactic(opts);
  assert.equal(normal.useTactic(fixture.state,fixture.a),undefined,
    'Printed-Pokémon-only tactic cannot enumerate the attached Stone Power');

  const Tactic=attachedToolPowerTacticClass();
  const tactic=new Tactic(opts);
  const candidates=[];
  tactic.getStateScore=()=>0;
  tactic.evaluateAction=(_state,id,action)=>{
    candidates.push(action);
    return action.name==='Star Alchemy'?1:undefined;
  };
  const selected=tactic.useTactic(fixture.state,fixture.a);
  assert.ok(selected instanceof UseAbilityAction);
  assert.equal(selected.name,'Star Alchemy');
  assert.equal(selected.clientId,fixture.a.id);
  const {SlotType}=mod('game/store/actions/play-card-action');
  assert.equal(selected.target.slot,SlotType.BENCH);
  assert.ok(candidates.some(a=>a.name==='Star Alchemy'));

  const restore=installForestSealSearchHook();
  try{
    fixture.store.dispatch(selected);
    while (fixture.state.prompts.some(p=>p.result===undefined &&
      p.constructor.name==='WaitPrompt')) {
      const wait=fixture.state.prompts.find(p=>p.result===undefined &&
        p.constructor.name==='WaitPrompt');
      fixture.store.dispatch(new ResolvePromptAction(wait.id,null));
    }
    const choose=fixture.state.prompts.find(p=>p.result===undefined);
    assert.equal(choose?.constructor.name,'ChooseCardsPrompt');
    assert.equal(choose.options.min,1);
    fixture.store.dispatch(new ResolvePromptAction(choose.id,[fixture.ranger]));
    const shuffle=fixture.state.prompts.find(p=>p.result===undefined);
    assert.equal(shuffle?.constructor.name,'ShuffleDeckPrompt');
    fixture.store.dispatch(new ResolvePromptAction(shuffle.id,[0]));
    assert.equal(fixture.a.usedVSTAR,true);
    assert.ok(fixture.a.hand.cards.includes(fixture.ranger));
  } finally { restore(); }
});

test('opt-in Tool Power tactic registration restores the shared policy on success and exception',()=>{
  initializeCards();
  const definitions=mod('simple-bot/simple-bot-definitions');
  const before=definitions.allSimpleTactics.slice();
  withAttachedToolPowerTactic(()=>{
    assert.equal(definitions.allSimpleTactics.length,before.length+1);
    assert.ok(definitions.allSimpleTactics.some(t=>t.name==='AttachedToolPowerTactic'));
  });
  assert.deepEqual(definitions.allSimpleTactics,before);
  assert.throws(()=>withAttachedToolPowerTactic(()=>{throw Error('intentional');}),/intentional/);
  assert.deepEqual(definitions.allSimpleTactics,before);
});

test('isolated Tool Power policy preserves global bot registry and card-tactic order', () => {
  initializeCards();
  const definitions=mod('simple-bot/simple-bot-definitions');
  const defaultOrder=definitions.allSimpleTactics.slice();
  const base={tactics:defaultOrder,scores:definitions.defaultStateScores,
    promptResolvers:definitions.allPromptResolvers};
  const modified=withAttachedToolPowerPolicy(base);
  const before=defaultOrder.findIndex(t=>t.name==='UseAbilityTactic');
  assert.ok(before>=0);
  assert.notEqual(modified,base);
  assert.notEqual(modified.tactics,base.tactics);
  assert.equal(modified.tactics[before].name,'AttachedToolPowerTactic');
  assert.equal(modified.tactics[before+1].name,'UseAbilityTactic');
  assert.deepEqual(modified.tactics.filter(t=>t.name!=='AttachedToolPowerTactic'),defaultOrder);
  assert.deepEqual(definitions.allSimpleTactics,defaultOrder);
  const second=withAttachedToolPowerPolicy(base);
  assert.notEqual(second.tactics,modified.tactics);
  assert.equal(second.tactics[before].name,'AttachedToolPowerTactic');
  assert.deepEqual(definitions.allSimpleTactics,defaultOrder);
});
