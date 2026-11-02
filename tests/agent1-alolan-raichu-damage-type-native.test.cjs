'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');

const ROOT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load=name=>require(path.join(ROOT,name));

const {State,GamePhase}=load('game/store/state/state');
const {Player}=load('game/store/state/player');
const {AlolanRaichu}=load('sets/08-sun-and-moon/set-unified-minds/alolan-raichu');
const {Voltorb}=load('sets/08-sun-and-moon/set-roaring-skies/voltorb');
const {AttackEffect}=load('game/store/effects/game-effects');
const {PutDamageEffect,PutCountersEffect}=load('game/store/effects/attack-effects');
const {shouldPreventAttackEffects}=load('game/store/effects/effect-of-attack-effects');
const {attackReducer}=load('game/store/effect-reducers/attack-effect');

/**
 * A minimal actual-state adversarial cross-effect fixture. This is a game
 * engine fidelity test and does not qualify an original-field match.
 */
function nativeFixture(){
  const state=new State();
  const source=new Player();
  const opponent=new Player();
  source.id=1;source.name='Raichu';
  opponent.id=2;opponent.name='Defender';
  const card=new AlolanRaichu();
  source.active.cards.push(card);
  const targetCard=new Voltorb();
  opponent.active.cards.push(targetCard);
  state.players.push(source,opponent);
  state.phase=GamePhase.ATTACK;
  const base=new AttackEffect(source,opponent,card.attacks[0]);
  return {state,source,opponent,base,target:opponent.active};
}

test('printed Electro Rain says damage but pinned compiled callback dispatches PutCountersEffect',()=>{
  const printed=new AlolanRaichu().attacks[0].text;
  assert.match(printed,/do 30 damage to it/i);
  const sourceFile=fs.readFileSync(path.join(ROOT,
    'sets/08-sun-and-moon/set-unified-minds/alolan-raichu.js'),'utf8');
  assert.match(sourceFile,/new attack_effects_1\.PutCountersEffect\(effect, result\.damage\)/);
  assert.doesNotMatch(sourceFile,/new attack_effects_1\.PutDamageEffect\(effect, result\.damage\)/);
});

test('effect-immunity gate treats copied Electro Rain PutCounters as an effect, unlike damage',()=>{
  const {state,base,target}=nativeFixture();
  target.preventEffectsOfAttacksNextTurn={};
  const counters=new PutCountersEffect(base,30);
  const damage=new PutDamageEffect(base,30);
  counters.target=target;damage.target=target;
  assert.equal(shouldPreventAttackEffects(state,counters),true);
  assert.equal(shouldPreventAttackEffects(state,damage),false);
});

test('native attack reducer applies Electro Rain type to a damage-protected target',()=>{
  const {state,base,target}=nativeFixture();
  target.preventDamageNextTurn={};
  const counters=new PutCountersEffect(base,30);
  const damage=new PutDamageEffect(base,30);
  counters.target=target;damage.target=target;
  const fakeStore={log(){},reduceEffect(current,effect){
    return attackReducer(this,current,effect);
  }};
  assert.equal(target.damage,0);
  attackReducer(fakeStore,state,counters);
  assert.equal(target.damage,30,
    'Native PUT_COUNTERS path bypasses attack-damage prevention');
  target.damage=0;
  attackReducer(fakeStore,state,damage);
  assert.equal(target.damage,0,
    'Native PUT_DAMAGE path honors the same prevention');
});
