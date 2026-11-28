'use strict';

/*
 * Pin a9905a76, paper-Expanded effect count:
 * Kyurem SFA47 Trifrost says "110 damage to 3 of your opponent's Pokémon".
 * The native attack registers ChoosePokemonPrompt(min:1,max:3), which
 * illegally lets a player choose fewer than min(3, available opposing Pokémon).
 * The native prompt also accepts duplicate slots / the wrong player's slots.
 *
 * Scope correction ONLY to Kyurem SFA Trifrost (including Regidrago Apex
 * Dragon's copied call to Kyurem.reduceEffect.call(copycat, ...)).
 * It amends the exact native prompt before store.prompt registers it; the
 * prompt retains the required count + validation after the hook is restored.
 * No vendor files, hidden-zone reads, game runner or owner V3 change.
 */
const assert=require('node:assert/strict');
const path=require('node:path');
const VERSION='agent21-kyurem-trifrost-three-distinct-opponent-targets-v1';
const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

function liveOpposingSlots(opponent) {
  const slots=[opponent?.active,...(opponent?.bench??[])];
  return slots.filter(slot=>slot&&
    typeof slot.getPokemonCard==='function'&&
    slot.getPokemonCard()!==undefined);
}

/**
 * Exact native ChoosePokemonPrompt only; no generic prompt weakening.
 * Replaces instance validation, preserving the native method's checks.
 */
function constrainTrifrostPrompt(prompt,opponent,api) {
  assert.ok(prompt instanceof api.ChoosePokemonPrompt);
  assert.equal(prompt.message,api.GameMessage.CHOOSE_POKEMON_TO_DAMAGE);
  assert.equal(prompt.playerType,api.PlayerType.TOP_PLAYER);
  assert.deepEqual(prompt.slots,[api.SlotType.ACTIVE,api.SlotType.BENCH]);
  assert.equal(prompt.options?.min,1);
  assert.equal(prompt.options?.max,3);
  assert.equal(prompt.options?.allowCancel,false);

  const eligible=liveOpposingSlots(opponent);
  const required=Math.min(3,eligible.length);
  assert.ok(required>0,'Trifrost requires at least one opposing Pokémon');
  const selectedSet=new Set(eligible);
  prompt.options={...prompt.options,min:required,max:required,allowCancel:false};
  const nativeValidate=prompt.validate;
  assert.equal(typeof nativeValidate,'function');
  Object.defineProperty(prompt,'validate',{
    configurable:true,writable:true,value:function(selected,state){
      if(!nativeValidate.call(this,selected,state))return false;
      if(!Array.isArray(selected)||selected.length!==required)return false;
      if(new Set(selected).size!==required)return false;
      return selected.every(slot=>selectedSet.has(slot));
    }
  });
  return {required,available:eligible.length,prompt};
}

function withPaperKyuremTrifrostTargets(work,injected={}) {
  assert.equal(typeof work,'function');
  const output=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const load=name=>require(path.join(output,name));
  const Kyurem=injected.Kyurem??
    load('sets/10-scarlet-and-violet/set-shrouded-fable/kyurem').Kyurem;
  const prefabs=injected.prefabs??load('game/store/prefabs/prefabs');
  const api={
    ChoosePokemonPrompt:injected.ChoosePokemonPrompt??
      load('game/store/prompts/choose-pokemon-prompt').ChoosePokemonPrompt,
    GameMessage:injected.GameMessage??load('game/game-message').GameMessage,
    PlayerType:injected.PlayerType??
      load('game/store/actions/play-card-action').PlayerType,
    SlotType:injected.SlotType??
      load('game/store/actions/play-card-action').SlotType
  };
  for(const name of Object.keys(api))
    assert.ok(api[name]!==undefined,'Pinned prompt interface missing '+name);
  assert.equal(typeof prefabs.WAS_ATTACK_USED,'function');
  const proto=Kyurem?.prototype;
  const before=Object.getOwnPropertyDescriptor(proto??{},'reduceEffect');
  assert.equal(typeof before?.value,'function');
  assert.ok(before.writable||before.configurable,
    'Kyurem reducer cannot be reversibly patched');

  Object.defineProperty(proto,'reduceEffect',{
    ...before,value:function rank21PaperTrifrost(store,state,effect){
      if(!prefabs.WAS_ATTACK_USED(effect,0,this))
        return before.value.call(this,store,state,effect);

      const opponent=effect.opponent;
      assert.ok(opponent&&state.players?.includes(opponent));
      const owner=effect.player;
      assert.ok(owner&&owner!==opponent);
      assert.equal(typeof store.prompt,'function');
      const nativePrompt=store.prompt;
      const ownDescriptor=Object.getOwnPropertyDescriptor(store,'prompt');
      let intercepted=0;

      Object.defineProperty(store,'prompt',{
        configurable:true,writable:true,value:function(s,prompt,...args){
          if(prompt instanceof api.ChoosePokemonPrompt &&
            prompt.message===api.GameMessage.CHOOSE_POKEMON_TO_DAMAGE &&
            prompt.playerType===api.PlayerType.TOP_PLAYER &&
            prompt.slots?.length===2 &&
            prompt.slots[0]===api.SlotType.ACTIVE &&
            prompt.slots[1]===api.SlotType.BENCH &&
            typeof prompt.getPerspectivePlayerId==='function' &&
            prompt.getPerspectivePlayerId()===owner.id){
            assert.equal(intercepted,0,
              'Trifrost must not issue multiple target-selection prompts');
            constrainTrifrostPrompt(prompt,opponent,api);
            intercepted++;
          }
          return nativePrompt.call(this,s,prompt,...args);
        }
      });
      try{
        const result=before.value.call(this,store,state,effect);
        if(liveOpposingSlots(opponent).length>0)
          assert.equal(intercepted,1,
            'Pinned Trifrost target-selection prompt was not intercepted');
        return result;
      }finally{
        if(ownDescriptor)
          Object.defineProperty(store,'prompt',ownDescriptor);
        else delete store.prompt;
      }
    }
  });
  try{
    const result=work();
    assert.ok(!result||typeof result.then!=='function',
      'Do not await across temporary native Kyurem hook');
    return result;
  }finally{
    Object.defineProperty(proto,'reduceEffect',before);
  }
}

module.exports={
  VERSION,ENGINE_PIN,liveOpposingSlots,constrainTrifrostPrompt,
  withPaperKyuremTrifrostTargets
};
