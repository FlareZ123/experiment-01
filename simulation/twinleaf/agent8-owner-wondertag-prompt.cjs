'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent8-owner-wondertag-confirm-search-v1';

/**
 * Affirm a genuinely offered Wonder Tag search and choose one qualifying
 * Supporter only after the native, owner-targeted deck-search prompt opens.
 * This is a liveness baseline, not a strategy ranking or a general bot.
 * @template T
 * @param {()=>T} run Synchronous native experiment.
 * @param {object} [deps] Injectable pinned classes for pure tests.
 * @returns {{result:T,audit:object}}
 */
function withOwnerWonderTagPrompts(run, deps = {}) {
  assert.equal(typeof run, 'function');
  const base = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const load = name => require(path.join(base, name));
  const Ai = deps.SimpleTacticsAi ?? load('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store = deps.Store ?? load('game/store/store').Store;
  const TapuLeleGX = deps.TapuLeleGX ??
    load('sets/08-sun-and-moon/set-guardians-rising/tapu-lele-gx').TapuLeleGX;
  const PlayPokemonEffect = deps.PlayPokemonEffect ??
    load('game/store/effects/play-card-effects').PlayPokemonEffect;
  const ConfirmPrompt = deps.ConfirmPrompt ??
    load('game/store/prompts/confirm-prompt').ConfirmPrompt;
  const ChooseCardsPrompt = deps.ChooseCardsPrompt ??
    load('game/store/prompts/choose-cards-prompt').ChooseCardsPrompt;
  const ResolvePromptAction = deps.ResolvePromptAction ??
    load('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const GameMessage = deps.GameMessage ?? load('game/game-message').GameMessage;
  const {SuperType, TrainerType} = deps.types ??
    load('game/store/card/card-types');
  const validate = deps.assertValidPromptAction ??
    require('./prompt-integrity.cjs').assertValidPromptAction;
  const originalLele = Object.getOwnPropertyDescriptor(TapuLeleGX.prototype,'reduceEffect');
  const originalBot = Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  const originalDispatch = Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  for (const descriptor of [originalLele,originalBot,originalDispatch]) {
    assert.equal(typeof descriptor?.value,'function');
    assert.equal(descriptor.configurable,true);
  }
  const confirms = new WeakSet();
  const searches = new WeakSet();
  const submitted = new WeakMap();
  const audit = {version:VERSION,confirmOffers:0,searchOffers:0,
    confirmed:0,selectedSupporters:0,emptySearches:0,
    nativeAccepted:0,nativeRejected:0,
    bySeat:{0:0,1:0},unrelatedDelegated:0,
    readsUnrevealedDeckBeforeSearch:false,
    wholePolicyInformationSafe:false,competitiveQualifiedGames:0};
  function reduceEffect(store,state,effect) {
    if (!(effect instanceof PlayPokemonEffect) ||
        effect.pokemonCard!==this || this.fullName!=='Tapu Lele-GX GRI') {
      return originalLele.value.call(this,store,state,effect);
    }
    const owner=effect.player;
    const proxy=new Proxy(store,{
      get(target,key){
        if(key==='prompt')return (nextState,prompt,callback)=>{
          if(prompt instanceof ConfirmPrompt&&
             prompt.playerId===owner.id&&
             prompt.message===GameMessage.WANT_TO_USE_ABILITY) {
            confirms.add(prompt);
            audit.confirmOffers++;
          }
          if(prompt instanceof ChooseCardsPrompt&&
             prompt.playerId===owner.id&&prompt.cards===owner.deck&&
             prompt.message===GameMessage.CHOOSE_CARD_TO_HAND&&
             prompt.filter?.superType===SuperType.TRAINER&&
             prompt.filter?.trainerType===TrainerType.SUPPORTER&&
             prompt.options?.min===0&&prompt.options?.max===1&&
             prompt.options?.allowCancel===false){
            searches.add(prompt);
            audit.searchOffers++;
          }
          return target.prompt(nextState,prompt,callback);
        };
        const value=Reflect.get(target,key,target);
        return typeof value==='function'?value.bind(target):value;
      }
    });
    return originalLele.value.call(this,proxy,state,effect);
  }
  function decodeNextAction(state) {
    const ownerId=this.client?.id;
    const prompt=state?.prompts?.find(p=>p.playerId===ownerId&&p.result===undefined);
    if(!prompt||prompt.playerId!==ownerId){
      audit.unrelatedDelegated++;
      return originalBot.value.call(this,state);
    }
    const isConfirm=confirms.has(prompt);
    const isSearch=searches.has(prompt);
    if(!isConfirm&&!isSearch){
      audit.unrelatedDelegated++;
      return originalBot.value.call(this,state);
    }
    const actor=state.players.find(p=>p.id===ownerId);
    const seat=state.players.findIndex(p=>p.id===ownerId);
    assert.ok(actor&&(seat===0||seat===1));
    let answer;
    if(isConfirm){
      assert.ok(prompt instanceof ConfirmPrompt);
      answer=true;
    }else{
      assert.ok(prompt instanceof ChooseCardsPrompt);
      assert.strictEqual(prompt.cards,actor.deck);
      assert.equal(prompt.message,GameMessage.CHOOSE_CARD_TO_HAND);
      const candidates=prompt.cards.cards.filter(card=>
        card.superType===SuperType.TRAINER&&
        card.trainerType===TrainerType.SUPPORTER);
      answer=candidates.length>0?[candidates[0]]:[];
    }
    const action=new ResolvePromptAction(prompt.id,answer);
    validate(state,action);
    submitted.set(action,{seat,kind:isConfirm?'confirm':'search',
      count:isSearch?answer.length:0});
    return action;
  }
  function dispatch(action,...args){
    const row=submitted.get(action);
    if(!row)return originalDispatch.value.apply(this,[action,...args]);
    try{
      const result=originalDispatch.value.apply(this,[action,...args]);
      audit.nativeAccepted++;
      audit.bySeat[row.seat]++;
      if(row.kind==='confirm')audit.confirmed++;
      else if(row.count===0)audit.emptySearches++;
      else audit.selectedSupporters++;
      return result;
    }catch(error){audit.nativeRejected++;throw error;}
  }
  Object.defineProperty(TapuLeleGX.prototype,'reduceEffect',
    {...originalLele,value:reduceEffect});
  Object.defineProperty(Ai.prototype,'decodeNextAction',
    {...originalBot,value:decodeNextAction});
  Object.defineProperty(Store.prototype,'dispatch',
    {...originalDispatch,value:dispatch});
  try{return {result:run(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.agent8WonderTagAudit={...audit,aborted:true};
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',originalDispatch);
    assert.strictEqual(Ai.prototype.decodeNextAction,decodeNextAction);
    Object.defineProperty(Ai.prototype,'decodeNextAction',originalBot);
    assert.strictEqual(TapuLeleGX.prototype.reduceEffect,reduceEffect);
    Object.defineProperty(TapuLeleGX.prototype,'reduceEffect',originalLele);
  }
}

module.exports={VERSION,withOwnerWonderTagPrompts};
