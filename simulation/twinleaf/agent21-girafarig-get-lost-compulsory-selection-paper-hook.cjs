'use strict';

/*
 * Paper Expanded / Twinleaf a9905a76 compatibility repair.
 * Girafarig LOT94 Get Lost: "Put 2 cards from your opponent's discard pile
 * in the Lost Zone." This is mandatory exact 2 if 2+ exist; otherwise move
 * as many as exist, including zero. Its pinned ChooseCardsPrompt is min=2,
 * max=2, allowCancel=true by default; the native validator also accepts
 * duplicate copies of one physical card.
 *
 * This narrowly constrains only that source-card prompt, using the public
 * opponent discard. No global prompt changes or modifications to Twinleaf.
 */
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent21-girafarig-get-lost-mandatory-distinct-targets-v1';
const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

function constrainGetLostPrompt(prompt,opponent,api) {
  assert.ok(prompt instanceof api.ChooseCardsPrompt);
  assert.equal(prompt.cards,opponent.discard);
  assert.equal(prompt.message,api.GameMessage.CHOOSE_CARD_TO_DISCARD);
  assert.equal(prompt.options?.min,2);
  assert.equal(prompt.options?.max,2);
  assert.equal(prompt.options?.allowCancel,true);
  const visible=opponent.discard.cards;
  assert.ok(Array.isArray(visible));
  const required=Math.min(2,visible.length);
  const legal=new Set(visible);
  prompt.options={...prompt.options,
    min:required,max:required,allowCancel:false};
  const originalValidate=prompt.validate;
  assert.equal(typeof originalValidate,'function');
  Object.defineProperty(prompt,'validate',{
    configurable:true,writable:true,value:function(selected){
      if(!originalValidate.call(this,selected))return false;
      if(!Array.isArray(selected)||selected.length!==required)return false;
      if(new Set(selected).size!==required)return false;
      return selected.every(card=>legal.has(card));
    }
  });
  return {required,available:visible.length,prompt};
}

function withPaperGirafarigGetLost(work,injected={}) {
  assert.equal(typeof work,'function');
  const output=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const load=name=>require(path.join(output,name));
  const Girafarig=injected.Girafarig??
    load('sets/08-sun-and-moon/set-lost-thunder/girafarig').Girafarig;
  const prefabs=injected.prefabs??load('game/store/prefabs/prefabs');
  const api={
    ChooseCardsPrompt:injected.ChooseCardsPrompt??
      load('game/store/prompts/choose-cards-prompt').ChooseCardsPrompt,
    GameMessage:injected.GameMessage??load('game/game-message').GameMessage
  };
  assert.equal(typeof prefabs.WAS_ATTACK_USED,'function');
  assert.equal(typeof api.ChooseCardsPrompt,'function');
  const proto=Girafarig?.prototype;
  const before=Object.getOwnPropertyDescriptor(proto??{},'reduceEffect');
  assert.equal(typeof before?.value,'function');
  assert.ok(before.writable||before.configurable,
    'Pinned Girafarig reducer cannot be safely replaced');
  Object.defineProperty(proto,'reduceEffect',{
    ...before,value:function paperGetLost(store,state,effect){
      if(!prefabs.WAS_ATTACK_USED(effect,0,this))
        return before.value.call(this,store,state,effect);
      const owner=effect.player;
      const opponent=effect.opponent;
      assert.ok(owner&&opponent&&owner!==opponent&&
        state.players?.includes(opponent));
      const originalPrompt=store.prompt;
      assert.equal(typeof originalPrompt,'function');
      const ownDescriptor=Object.getOwnPropertyDescriptor(store,'prompt');
      let intercepts=0;
      Object.defineProperty(store,'prompt',{
        configurable:true,writable:true,value:function(s,prompt,...args){
          if(prompt instanceof api.ChooseCardsPrompt &&
             prompt.cards===opponent.discard &&
             prompt.message===api.GameMessage.CHOOSE_CARD_TO_DISCARD &&
             prompt.getPerspectivePlayerId?.()===owner.id){
            assert.equal(intercepts,0,
              'Get Lost must create exactly one discard-target prompt');
            constrainGetLostPrompt(prompt,opponent,api);
            intercepts++;
          }
          return originalPrompt.call(this,s,prompt,...args);
        }
      });
      try{
        const result=before.value.call(this,store,state,effect);
        assert.equal(intercepts,1,
          'Pinned Get Lost prompt was not intercepted');
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
      'Do not await a temporary native Girafarig hook');
    return result;
  }finally{
    Object.defineProperty(proto,'reduceEffect',before);
  }
}
module.exports={VERSION,ENGINE_PIN,constrainGetLostPrompt,
  withPaperGirafarigGetLost};
