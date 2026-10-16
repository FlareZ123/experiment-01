'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const {
  phantomDiveBenchWindows,
  preferredPhantomDive,
  spreadAwareCopyResolverClass,
  withSpreadAwareCopyResolver
} = require('../simulation/twinleaf/apex-spread-copy-resolver.cjs');

/** Minimal pinned-interface fixture for deterministic source-free tests. */
function fakeFixture(damage = 270, blocked = []) {
  const phantom = {name:'Phantom Dive',damage:200,cost:['FIRE','PSYCHIC']};
  const rolling = {name:'Rolling Iron',damage:200,cost:['WATER','METAL','COLORLESS']};
  const me = {id:101,active:{getPokemonCard:()=>({name:'Regidrago VSTAR'})}};
  const bench = {hp:320,hpBonus:0,damage,getPokemonCard:()=>({hp:320})};
  const opponent={id:202,bench:[bench]};
  const state={phase:3,players:[me,opponent]};
  const prompt={cards:[{attacks:[phantom]},{attacks:[rolling]}],
    options:{blocked},validate:attack=>attack!==null};
  const baseline={result:rolling};
  return {state,me,opponent,prompt,baseline,phantom};
}

test('detects a 50 HP Benched prize window and no window above 60 HP',()=>{
  const f=fakeFixture();
  assert.equal(phantomDiveBenchWindows(f.opponent),1);
  assert.equal(phantomDiveBenchWindows(fakeFixture(250).opponent),0);
  assert.equal(phantomDiveBenchWindows({bench:[]}),0);
});

test('does not treat Tool or Ability-bearing targets as certain Bench knockouts',()=>{
  const f=fakeFixture();
  const slot=f.opponent.bench[0];
  slot.tools=[{name:'uncertain Tool'}];
  assert.equal(phantomDiveBenchWindows(f.opponent),0);
  assert.equal(preferredPhantomDive(f.state,f.me,f.prompt,f.baseline),null);
  slot.tools=[];
  slot.getPokemonCard=()=>({hp:320,powers:[{name:'uncertain Ability'}]});
  assert.equal(phantomDiveBenchWindows(f.opponent),0);
  assert.equal(preferredPhantomDive(f.state,f.me,f.prompt,f.baseline),null);
});

test('known effect-protecting attached Energy blocks an assumed counter KO',()=>{
  for(const name of ['Mist Energy','Wash Water Energy','Wonder Energy']){
    const f=fakeFixture();
    f.opponent.bench[0].cards=[{name}];
    assert.equal(phantomDiveBenchWindows(f.opponent),0,name);
    assert.equal(preferredPhantomDive(f.state,f.me,f.prompt,f.baseline),null,name);
  }
});

test('prefers the exact Phantom Dive attack instance in a tied 200-damage choice',()=>{
  const f=fakeFixture();
  assert.equal(preferredPhantomDive(f.state,f.me,f.prompt,f.baseline),f.phantom);
});

test('leaves upstream policy intact when no valid bench KO opportunity',()=>{
  const f=fakeFixture(0);
  assert.equal(preferredPhantomDive(f.state,f.me,f.prompt,f.baseline),null);
});

test('does not bypass prompt blocked list',()=>{
  const f=fakeFixture(270,[{index:0,attack:'Phantom Dive'}]);
  assert.equal(preferredPhantomDive(f.state,f.me,f.prompt,f.baseline),null);
});

test('only changes Regidrago copy decisions on the attack phase',()=>{
  const f=fakeFixture();
  f.state.phase=2;
  assert.equal(preferredPhantomDive(f.state,f.me,f.prompt,f.baseline),null);
  f.state.phase=3;
  f.me.active.getPokemonCard=()=>({name:'Mimikyu'});
  assert.equal(preferredPhantomDive(f.state,f.me,f.prompt,f.baseline),null);
});

test('does not override a default attack besides Rolling Iron',()=>{
  const f=fakeFixture();
  assert.equal(preferredPhantomDive(f.state,f.me,f.prompt,{result:{name:'Trifrost',damage:0}}),null);
});

test('pinned resolver chooses Rolling Iron; opt-in copies Phantom Dive when a prize is exposed',
  {skip: !fs.existsSync(path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output/game'))},()=>{
  const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
  /** @param {string} name */
  const load=name=>require(path.join(root,name));
  const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
  const cards=initializeCards();
  const dragapult=cards.getCardByName('Dragapult ex TWM');
  const goodra=cards.getCardByName('Hisuian Goodra VSTAR LOR');
  const regidrago=cards.getCardByName('Regidrago VSTAR SIT');
  assert.ok(dragapult && goodra && regidrago);
  const {State,GamePhase}=load('game/store/state/state');
  const {Player}=load('game/store/state/player');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {ChooseAttackPrompt}=load('game/store/prompts/choose-attack-prompt');
  const {GameMessage}=load('game/game-message');
  const {ChooseAttackPromptResolver}=load(
    'simple-bot/prompt-resolver/choose-attack-prompt-resolver');
  const {defaultStateScores,allPromptResolvers}=load('simple-bot/simple-bot-definitions');
  const state=new State();
  state.phase=GamePhase.ATTACK;
  const player=new Player();
  player.id=101;
  player.active.cards.push(regidrago);
  const opponent=new Player();
  opponent.id=202;
  opponent.active.cards.push(goodra);
  const slot=new PokemonCardList();
  slot.cards.push(dragapult);
  slot.damage=270; // Printed 320 HP leaves 50 HP.
  opponent.bench.push(slot);
  state.players=[player,opponent];
  const prompt=new ChooseAttackPrompt(player.id,GameMessage.CHOOSE_ATTACK_TO_COPY,
    [dragapult,goodra]);
  const generic=new ChooseAttackPromptResolver({scores:defaultStateScores})
    .resolvePrompt(state,player,prompt);
  assert.equal(generic.result.name,'Rolling Iron');
  const Patched=spreadAwareCopyResolverClass();
  const altered=new Patched({scores:defaultStateScores})
    .resolvePrompt(state,player,prompt);
  assert.equal(altered.result.name,'Phantom Dive');
  assert.equal(prompt.validate(altered.result),true);
  assert.equal(slot.hp || dragapult.hp,320);
  slot.damage=0;
  const noWindow=new Patched({scores:defaultStateScores})
    .resolvePrompt(state,player,prompt);
  assert.equal(noWindow.result.name,'Rolling Iron');
  slot.damage=270;
  const blocked=new ChooseAttackPrompt(player.id,GameMessage.CHOOSE_ATTACK_TO_COPY,
    [dragapult,goodra],{blocked:[{index:0,attack:'Phantom Dive'}]});
  const blockedChoice=new Patched({scores:defaultStateScores})
    .resolvePrompt(state,player,blocked);
  assert.equal(blockedChoice.result.name,'Rolling Iron');

  const oldIndex=allPromptResolvers.findIndex(c=>c.name==='ChooseAttackPromptResolver');
  assert.ok(oldIndex>=0);
  const original=allPromptResolvers[oldIndex];
  assert.equal(withSpreadAwareCopyResolver(()=>allPromptResolvers[oldIndex].name),
    'SpreadAwareCopyResolver');
  assert.equal(allPromptResolvers[oldIndex],original);
  assert.throws(()=>withSpreadAwareCopyResolver(()=>{throw new Error('test throw');}),
    /test throw/);
  assert.equal(allPromptResolvers[oldIndex],original);
});
