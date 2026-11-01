'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath @returns {any} */
const native=modulePath=>require(path.join(output,modulePath));

/**
 * Reversibly enforce Radiant Alakazam SIT59 Painful Spoons's printed single
 * source, single destination, at most two counters and physically available
 * source damage. The pinned prompt only asserts singleDestinationTarget and
 * native Store skips prompt.validate. This opt-in fixes neither all general
 * MoveDamage prompts nor other unrelated game/printed card contracts.
 * @template T
 * @param {()=>T} execute Synchronous native Store research experiment.
 * @returns {T}
 */
function withPaperPainfulSpoonsSingleSource(execute){
  assert.equal(typeof execute,'function');
  const {RadiantAlakazam}=
    native('sets/09-sword-and-shield/set-silver-tempest/radiant-alakazam');
  const {Store}=native('game/store/store');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const {WAS_POWER_USED}=native('game/store/prefabs/prefabs');
  const {MoveDamagePrompt}=
    native('game/store/prompts/move-damage-prompt');
  const {PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const proto=RadiantAlakazam.prototype;
  const priorReduce=Object.getOwnPropertyDescriptor(proto,'reduceEffect');
  const priorDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof priorReduce?.value,'function');
  assert.equal(typeof priorDispatch?.value,'function');
  const created=new WeakSet();

  function paperSpoonsReduce(store,state,effect){
    if(!WAS_POWER_USED(effect,0,this))
      return priorReduce.value.call(this,store,state,effect);
    const prior=new Set(state.prompts);
    const result=priorReduce.value.call(this,store,state,effect);
    for(const prompt of state.prompts){
      if(!prior.has(prompt)&&prompt instanceof MoveDamagePrompt){
        created.add(prompt);
        prompt.options.singleSourceTarget=true;
      }
    }
    return result;
  }

  function paperSpoonsDispatch(action,...args){
    if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts.find(p=>
        p.id===action.id&&p.result===undefined);
      if(prompt&&created.has(prompt)){
        const owner=this.state.players.find(p=>p.id===prompt.playerId);
        const opponent=this.state.players.find(p=>p.id!==prompt.playerId);
        const transfers=action.result;
        const invalid=()=>new Error(
          'PAPER_PAINFUL_SPOONS_REJECTED:INVALID_PRINTED_MOVE_SOURCE');
        if(!owner||!opponent||!Array.isArray(transfers)||
           transfers.length<1||transfers.length>2)
          throw invalid();
        const targetOf=t=>{
          if(!t||t.player!==PlayerType.TOP_PLAYER)return null;
          if(t.slot===SlotType.ACTIVE)return opponent.active;
          if(t.slot===SlotType.BENCH)
            return opponent.bench[t.index]??null;
          return null;
        };
        const sources=transfers.map(t=>targetOf(t.from));
        const targets=transfers.map(t=>targetOf(t.to));
        const source=sources[0],target=targets[0];
        if(!source||!target||
           !source.cards.length||!target.cards.length||
           source===target||
           sources.some(s=>s!==source)||
           targets.some(t=>t!==target)||
           source.damage<10*transfers.length||
           prompt.validate(transfers,this.state)!==true)
          throw invalid();
      }
    }
    return priorDispatch.value.apply(this,[action,...args]);
  }

  Object.defineProperty(proto,'reduceEffect',
    {...priorReduce,value:paperSpoonsReduce});
  Object.defineProperty(Store.prototype,'dispatch',
    {...priorDispatch,value:paperSpoonsDispatch});
  try{return execute();}
  finally{
    assert.strictEqual(proto.reduceEffect,paperSpoonsReduce);
    assert.strictEqual(Store.prototype.dispatch,paperSpoonsDispatch);
    Object.defineProperty(Store.prototype,'dispatch',priorDispatch);
    Object.defineProperty(proto,'reduceEffect',priorReduce);
  }
}
module.exports={withPaperPainfulSpoonsSingleSource};
