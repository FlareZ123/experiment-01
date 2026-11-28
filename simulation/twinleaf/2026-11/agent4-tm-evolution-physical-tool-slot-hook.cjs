'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const VERSION='agent4-pinned-par178-native-physical-tool-slot-and-root-enumerator-v2';
const engineRoot=path.resolve(__dirname,
  '../../../vendor/twinleaf/ptcg-server/output');
const native=modulePath=>require(path.join(engineRoot,modulePath));

/**
 * One opt-in, reversible, exact-pin research hook for attached TM Evolution
 * (PAR178), covering BOTH native root enumeration and attack admission.
 *
 * Pinned Twinleaf has two independent faults:
 * (1) native TechnicalMachineEvolution.reduceEffect consults the top
 *     PokemonCard.tools (unrelated/empty) instead of Active
 *     PokemonCardList.tools (where attached Tools physically reside),
 *     so CheckPokemonAttacksEffect never injects this Tool's Evolution;
 * (2) native advanced-bot ActionEnumerator.attackActions only maps
 *     active.getPokemonCard().attacks. The actor's legal-ish root frontier
 *     therefore never even considers the Tool attack.
 *
 * The native ActionEnumerator is not a rules oracle: it generates a legal-ish
 * candidate. Native Simulator validation in the caller MUST still reject
 * unaffordable/Tool-locked/otherwise illegal attacks. In the Store reducer,
 * the actual CheckPokemonAttacksEffect only receives an attached,
 * unsuppressed PAR178 Tool's genuine attacks[0], once, and all other native
 * methods are unchanged.
 *
 * This never edits vendor/ or contacts upstream. After the synchronous
 * Store workload, both prototype descriptors are restored even on throw.
 * The hook is OFF unless explicitly called with the known engine pin;
 * runs under this patch must not be compared to unpatched runs as if the
 * simulation semantics were identical.
 *
 * @template T
 * @param {()=>T} run Synchronous native Store/actor frontier workload.
 * @param {{
 *  enginePin:string,TechnicalMachineEvolution?:Function,
 *  CheckPokemonAttacksEffect?:Function,IS_TOOL_BLOCKED?:Function,
 *  ActionEnumerator?:Function,AttackAction?:Function,
 *  SpecialCondition?:object
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
  const ActionEnumerator=deps.ActionEnumerator??
    native('advanced-bot/action-enumerator').ActionEnumerator;
  const AttackAction=deps.AttackAction??
    native('game/store/actions/game-actions').AttackAction;
  const SpecialCondition=deps.SpecialCondition??
    native('game/store/card/card-types').SpecialCondition;
  for(const [name,ctor] of [
    ['TechnicalMachineEvolution',TechnicalMachineEvolution],
    ['CheckPokemonAttacksEffect',CheckPokemonAttacksEffect],
    ['ActionEnumerator',ActionEnumerator],['AttackAction',AttackAction]
  ])assert.equal(typeof ctor,'function',name+' native class missing');
  assert.equal(typeof IS_TOOL_BLOCKED,'function');
  assert.ok(SpecialCondition&&typeof SpecialCondition==='object');

  const toolProto=TechnicalMachineEvolution.prototype;
  const enumeratorProto=ActionEnumerator.prototype;
  const toolDescriptor=Object.getOwnPropertyDescriptor(toolProto,'reduceEffect');
  const enumDescriptor=Object.getOwnPropertyDescriptor(enumeratorProto,'enumerate');
  assert.equal(typeof toolDescriptor?.value,'function',
    'pinned PAR178 reducer missing');
  assert.equal(typeof enumDescriptor?.value,'function',
    'pinned ActionEnumerator enumerate missing');
  const audit={
    version:VERSION,enginePin:ENGINE_PIN,
    checked:0,attached:0,added:0,alreadyPresent:0,
    blocked:0,unattached:0,passthrough:0,
    rootEnumerations:0,rootCandidatesAdded:0,
    rootCandidatesAlreadyPresent:0,rootNoTool:0,
    rootCannotAttackCondition:0,
    nativeStoreGames:0,qualifiedGames:0
  };
  function isSourceTm(card){
    return card instanceof TechnicalMachineEvolution &&
      card.set==='PAR'&&String(card.setNumber)==='178';
  }

  function correctedReduce(store,state,effect,...args){
    if(!(effect instanceof CheckPokemonAttacksEffect)){
      audit.passthrough++;
      return toolDescriptor.value.call(this,store,state,effect,...args);
    }
    assert.ok(isSourceTm(this),'unexpected TM Evolution printing');
    audit.checked++;
    const physicalTools=effect?.player?.active?.tools;
    if(!Array.isArray(physicalTools)||!physicalTools.includes(this)){
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

  function correctedEnumerate(state,player,clientId,...args){
    const original=enumDescriptor.value.call(this,state,player,clientId,...args);
    assert.ok(Array.isArray(original),'native enumerator not array');
    audit.rootEnumerations++;
    const active=player?.active;
    const pokemon=active?.getPokemonCard?.();
    const attached=Array.isArray(active?.tools) ?
      active.tools.find(isSourceTm) : null;
    if(!pokemon||!attached){
      audit.rootNoTool++;
      return original;
    }
    const conditions=active.specialConditions??[];
    if(conditions.includes(SpecialCondition.ASLEEP)||
        conditions.includes(SpecialCondition.PARALYZED)){
      audit.rootCannotAttackCondition++;
      return original;
    }
    const attackName=attached.attacks?.[0]?.name;
    assert.equal(attackName,'Evolution','unreviewed PAR178 attack');
    if(original.some(action=>action instanceof AttackAction&&
        action.name===attackName)){
      audit.rootCandidatesAlreadyPresent++;
      return original;
    }
    // Candidate, not a legality assertion: original V3 preflight Simulator
    // must vet root attack cost and suppression. Do not use hidden-zone data.
    const candidate=new AttackAction(clientId,attackName);
    audit.rootCandidatesAdded++;
    return [...original,candidate];
  }

  Object.defineProperty(toolProto,'reduceEffect',{
    ...toolDescriptor,value:correctedReduce
  });
  Object.defineProperty(enumeratorProto,'enumerate',{
    ...enumDescriptor,value:correctedEnumerate
  });
  try{
    const result=run();
    assert.ok(!result||typeof result.then!=='function',
      'TM Evolution scoped hook requires synchronous native Store work');
    return {result,audit:{...audit}};
  }finally{
    // Restore irrespective of nested Store/prompt errors. Both original
    // descriptors were validated before any patch was installed.
    const retainedTool=toolProto.reduceEffect===correctedReduce;
    const retainedEnumerator=enumeratorProto.enumerate===correctedEnumerate;
    Object.defineProperty(enumeratorProto,'enumerate',enumDescriptor);
    Object.defineProperty(toolProto,'reduceEffect',toolDescriptor);
    assert.ok(retainedTool&&retainedEnumerator,
      'PAR178 root hook lost exclusive prototype ownership');
  }
}

module.exports={ENGINE_PIN,VERSION,withPinnedTmEvolutionPhysicalToolSlot};
