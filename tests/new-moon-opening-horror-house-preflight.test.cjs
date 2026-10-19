'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const server=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const {GamePhase}=require(path.join(server,'game/store/state/state'));
const {AttackAction,UseAbilityAction}=require(
  path.join(server,'game/store/actions/game-actions'));
const {makeOpeningHorrorHouseTactic,withNewMoonOpeningHorrorHouse}=
  require('../simulation/twinleaf/new-moon-opening-horror-house-policy.cjs');

/** @param {string} activeFullName @param {boolean} [withDonor] */
function fixture(activeFullName,withDonor=false) {
  return {
    state:{turn:2,phase:GamePhase.PLAYER_TURN},
    player:{
      id:101,usedGX:false,
      active:{getPokemonCard:()=>({fullName:activeFullName})},
      discard:{cards:[]},
      bench:withDonor?
        [{getPokemonCard:()=>({fullName:'Gengar & Mimikyu-GX TEU'})}]:[]
    }
  };
}

/** @param {()=>object|undefined} resolution */
function policy(resolution) {
  const Tactic=makeOpeningHorrorHouseTactic();
  const tactic=Object.create(Tactic.prototype);
  tactic.simulateAction=(_state,_action)=>resolution();
  tactic.copiedHorrorHouseSelectable=()=>true;
  tactic.getStateScore=()=>{throw new Error('Hidden-state score must not be read');};
  return tactic;
}

test('a speculative reject cannot become a live printed GX attack',()=>{
  const {state,player}=fixture('Gengar & Mimikyu-GX TEU');
  let attempts=0;
  const tactic=policy(()=>{attempts++;return undefined;});
  assert.equal(tactic.useTactic(state,player),undefined);
  assert.equal(attempts,1);
});

test('a speculative reject cannot become a live copied Perfection',()=>{
  const {state,player}=fixture('Mewtwo & Mew-GX UNM',true);
  const tactic=policy(()=>undefined);
  assert.equal(tactic.useTactic(state,player),undefined);
});

test('copied Perfection declines an engine-blocked Horror House choice',()=>{
  const {state,player}=fixture('Mewtwo & Mew-GX UNM',true);
  const tactic=policy(()=>{throw new Error('Blocked copied attack must not simulate');});
  tactic.copiedHorrorHouseSelectable=()=>false;
  assert.equal(tactic.useTactic(state,player),undefined);
});

test('simulated executable native and copied attacks retain their action types',()=>{
  const tactic=policy(()=>({turn:3}));
  const native=fixture('Gengar & Mimikyu-GX TEU');
  const a=tactic.useTactic(native.state,native.player);
  assert.ok(a instanceof AttackAction);
  assert.equal(a.name,'Horror House-GX');
  const copied=fixture('Mewtwo & Mew-GX UNM',true);
  const b=tactic.useTactic(copied.state,copied.player);
  assert.ok(b instanceof UseAbilityAction);
  assert.equal(b.name,'Perfection');
});

test('noneligible turn, spent GX and missing donor never simulate',()=>{
  const tactic=policy(()=>{throw new Error('Unexpected simulation');});
  const native=fixture('Gengar & Mimikyu-GX TEU');
  native.state.turn=3;
  assert.equal(tactic.useTactic(native.state,native.player),undefined);
  native.state.turn=2;
  native.player.usedGX=true;
  assert.equal(tactic.useTactic(native.state,native.player),undefined);
  const copied=fixture('Mewtwo & Mew-GX UNM');
  assert.equal(tactic.useTactic(copied.state,copied.player),undefined);
});

test('the researched bot adapter remains idempotent',()=>{
  const {AttackTactic}=require(path.join(server,
    'simple-bot/simple-tactics/attack-tactic'));
  const {ChooseAttackPromptResolver}=require(path.join(server,
    'simple-bot/prompt-resolver/choose-attack-prompt-resolver'));
  const original={tactics:[AttackTactic],
    promptResolvers:[ChooseAttackPromptResolver]};
  const updated=withNewMoonOpeningHorrorHouse(original);
  assert.equal(updated.tactics.length,2);
  assert.equal(updated.promptResolvers.length,2);
  assert.equal(withNewMoonOpeningHorrorHouse(updated),updated);
  assert.deepEqual(original.tactics,[AttackTactic]);
});

