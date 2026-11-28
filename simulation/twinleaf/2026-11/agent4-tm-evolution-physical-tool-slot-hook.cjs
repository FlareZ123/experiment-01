'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

// Research-side, opt-in, reversible hook for the exact pinned Twinleaf.
// Do not modify vendor source or claim the hook makes a game paper-qualified.
const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const VERSION='agent4-pinned-par178-native-physical-tool-slot-v3-v3root-verified';
const engineRoot=path.resolve(__dirname,
  '../../../vendor/twinleaf/ptcg-server/output');
const native=modulePath=>require(path.join(engineRoot,modulePath));

/**
 * Run one synchronous native Store experiment with one source-pin-scoped fix.
 *
 * Pinned PAR178 reducer erroneously checks
 * effect.player.active.getPokemonCard()?.tools.includes(this)
 * when enumerating attached Tool attacks. Physical Tools live on the
 * PokemonCardList (effect.player.active.tools), independently of the
 * PokemonCard.tools default empty array. Consequently real AttackAction
 * does not ordinarily receive TM Evolution in CheckPokemonAttacksEffect.
 *
 * Only the attached PAR178 Tool's CheckPokemonAttacksEffect is corrected;
 * other TM reducer paths (effect cost, attack, tool expiration) are left to
 * the genuine pinned native card implementation. Tool lock must suppress
 * the virtual attack. All other card effects pass through unchanged.
 *
 * The V3 research runner does NOT use the bare upstream ActionEnumerator
 * attackActions: agent3-known-cap-free-action-enumerator.cjs replaces the
 * instance attackActions and already emits physical Tool-sourced attack
 * actions with immutable __agent3AttackSource provenance. This hook fixes
 * only the still-broken native CheckPokemonAttacksEffect admission gate.
 * The bare upstream ActionEnumerator omits Tools, but it is not V3's one.
 *
 * This hook alters only a compiled class's method within run() and restores
 * the exact descriptor on return or throw. It never edits a vendor file.
 * The engine pin is an explicit mandatory argument: fail closed if a future
 * upstream revision requires independent reinvestigation.
 *
 * @template T
 * @param {()=>T} run One synchronous native Store experiment.
 * @param {{
 *  enginePin:string,TechnicalMachineEvolution?:Function,
 *  CheckPokemonAttacksEffect?:Function,IS_TOOL_BLOCKED?:Function
 * }} deps
 * @returns {{result:T,audit:object}}
 */
function withPinnedTmEvolutionPhysicalToolSlot(run,deps){
  assert.equal(typeof run,'function');
  assert.ok(deps&&typeof deps==='object','explicit pinned dependencies required');
  assert.equal(deps.enginePin,ENGINE_PIN,'unreviewed Twinleaf engine pin');
  const TechnicalMachineEvolution=deps.TechnicalMachineEvolution??
    native('sets/10-scarlet-and-violet/set-paradox-rift/technical-machine-evolution')
      .TechnicalMachineEvolution;
  const CheckPokemonAttacksEffect=deps.CheckPokemonAttacksEffect??
    native('game/store/effects/check-effects').CheckPokemonAttacksEffect;
  const IS_TOOL_BLOCKED=deps.IS_TOOL_BLOCKED??
    native('game/store/prefabs/prefabs').IS_TOOL_BLOCKED;
  assert.equal(typeof TechnicalMachineEvolution,'function');
  assert.equal(typeof CheckPokemonAttacksEffect,'function');
  assert.equal(typeof IS_TOOL_BLOCKED,'function');

  const prototype=TechnicalMachineEvolution.prototype;
  const descriptor=Object.getOwnPropertyDescriptor(prototype,'reduceEffect');
  assert.equal(typeof descriptor?.value,'function','pinned PAR178 reducer missing');
  const audit={
    version:VERSION,enginePin:ENGINE_PIN,
    checked:0,attached:0,added:0,alreadyPresent:0,
    blocked:0,unattached:0,passthrough:0,
    nativeStoreGames:0,qualifiedGames:0
  };

  function correctedReduce(store,state,effect,...args){
    if(!(effect instanceof CheckPokemonAttacksEffect)){
      audit.passthrough++;
      return descriptor.value.call(this,store,state,effect,...args);
    }
    // Exact printing guard protects other inherited or alternative Tool
    // objects even if they share this class prototype.
    assert.equal(this.set,'PAR','unexpected TM Evolution set');
    assert.equal(String(this.setNumber),'178','unexpected TM Evolution printing');
    audit.checked++;
    const attached=effect?.player?.active?.tools;
    if(!Array.isArray(attached)||!attached.includes(this)){
      audit.unattached++;
      return state;
    }
    audit.attached++;
    if(IS_TOOL_BLOCKED(store,state,effect.player,this)){
      audit.blocked++;
      return state;
    }
    if(!Array.isArray(this.attacks)||!this.attacks[0]||
        !Array.isArray(effect.attacks)){
      throw new Error('TM_EVOLUTION_UNEXPECTED_NATIVE_ATTACK_SCHEMA');
    }
    if(effect.attacks.includes(this.attacks[0])){
      audit.alreadyPresent++;
      return state;
    }
    effect.attacks.push(this.attacks[0]);
    audit.added++;
    return state;
  }
  Object.defineProperty(prototype,'reduceEffect',{
    ...descriptor,value:correctedReduce
  });
  try {
    const result=run();
    assert.ok(!result||typeof result.then!=='function',
      'TM Evolution scoped hook requires synchronous native Store work');
    return {result,audit:{...audit}};
  }finally{
    assert.strictEqual(prototype.reduceEffect,correctedReduce,
      'PAR178 hook lost prototype ownership');
    Object.defineProperty(prototype,'reduceEffect',descriptor);
  }
}

module.exports={ENGINE_PIN,VERSION,withPinnedTmEvolutionPhysicalToolSlot};
