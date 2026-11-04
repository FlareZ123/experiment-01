'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {assertValidPromptAction}=require('./prompt-integrity.cjs');

const VERSION='agent4-owner-setup-starting-pokemon-v1-single-basic';
const PHASE_SETUP=1;
const MESSAGE='CHOOSE_STARTING_POKEMONS';

/**
 * Conservatively select one legal opening Active Pokemon from the actual
 * owner's hand. Bench construction remains deliberately unoptimized.
 *
 * @param {{actor:object,prompt:{kind:string,message:string,eligible:Array<{index:number,printing:string}>}}} input
 * @returns {{kind:string,handIndices:[number]}}
 */
function chooseOwnerStartingPokemon(input){
  assert.equal(input.actor.decisionKind,'owner-prompt');
  assert.equal(input.actor.phase,PHASE_SETUP);
  assert.equal(input.actor.globalTurn,0);
  assert.equal(input.prompt.kind,'ChooseCardsPrompt');
  assert.equal(input.prompt.message,MESSAGE);
  assert.ok(input.prompt.eligible.length>0);
  return Object.freeze({
    kind:'owner-opening-single-basic',
    handIndices:Object.freeze([input.prompt.eligible[0].index])
  });
}

/**
 * Reversible same-Store opening Pokemon prompt adapter. The decision function
 * receives detached own-hand printings and indices that the native validator
 * accepts. It receives no opponent hand/deck/Prizes and no native Card objects.
 * Normal Store dispatch confirms physical placement in the Active slot.
 *
 * Setup-only baseline: unmodeled setup-tag Ability choices and optimal Bench
 * occupancy remain open research questions. Do not count these games as
 * qualified competitive play.
 *
 * @template T
 * @param {()=>T} run Synchronous pinned Store game.
 * @param {{SimpleTacticsAi?:Function,Store?:Function,ResolvePromptAction?:Function,
 *   observe?:Function,choose?:Function,validate?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerStartingPokemon(run,deps={}){
  assert.equal(typeof run,'function');
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Ai=deps.SimpleTacticsAi??
    require(path.join(output,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??
    require(path.join(output,'game/store/store')).Store;
  const ResolvePromptAction=deps.ResolvePromptAction??
    require(path.join(output,'game/store/actions/resolve-prompt-action'))
      .ResolvePromptAction;
  const observe=deps.observe??actorObservation;
  const choose=deps.choose??chooseOwnerStartingPokemon;
  const validate=deps.validate??assertValidPromptAction;
  const oldBot=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  const oldDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof oldBot?.value,'function');
  assert.equal(typeof oldDispatch?.value,'function');
  let live=null;
  const selected=new WeakMap();
  const audit={
    version:VERSION,stores:0,
    selected:0,accepted:0,rejected:0,
    physicallyPlacedActiveConfirmed:0,
    physicallyPlacedActiveMissing:0,
    bySeat:{0:0,1:0},
    events:[],nativeScoringUsed:false,
    competitivePaperGamesQualified:0
  };
  function decode(state){
    if(state!==live?.state)return oldBot.value.call(this,state);
    const prompt=state.prompts?.find(p=>p.result===undefined)??null;
    if(state.phase!==PHASE_SETUP||state.turn!==0||
        prompt?.constructor?.name!=='ChooseCardsPrompt'||
        prompt.message!==MESSAGE||
        prompt.playerId!==this.client?.id||
        prompt.cards!==state.players.find(p=>p.id===this.client.id)?.hand||
        prompt.options?.min!==1||prompt.options.max<1||
        prompt.options.allowCancel!==false){
      return oldBot.value.call(this,state);
    }
    const seat=state.players.findIndex(p=>p.id===this.client.id);
    assert.ok(seat===0||seat===1);
    const actor=observe(state,seat);
    assert.equal(actor.decisionKind,'owner-prompt');
    assert.deepEqual(actor.ownHand,state.players[seat].hand.cards.map(
      card=>card.fullName));
    const cards=prompt.cards.cards;
    const blocked=new Set(prompt.options.blocked);
    const eligible=[];
    for(let index=0;index<cards.length;index++){
      if(blocked.has(index))continue;
      if(prompt.validate([cards[index]],state)!==true)continue;
      eligible.push(Object.freeze({index,printing:actor.ownHand[index]}));
    }
    const input=Object.freeze({actor,prompt:Object.freeze({
      kind:'ChooseCardsPrompt',message:prompt.message,
      eligible:Object.freeze(eligible)
    })});
    const choice=choose(input);
    assert.equal(choice.kind,'owner-opening-single-basic');
    assert.ok(Array.isArray(choice.handIndices)&&
      choice.handIndices.length===1);
    const chosen=choice.handIndices[0];
    assert.ok(eligible.some(o=>o.index===chosen));
    const physical=cards[chosen];
    const action=new ResolvePromptAction(prompt.id,[physical]);
    validate(state,action);
    selected.set(action,{seat,physical,printing:actor.ownHand[chosen]});
    audit.selected++;
    audit.bySeat[seat]++;
    if(audit.events.length<16)audit.events.push({
      seat,turn:state.turn,chosenOwnerHandIndex:chosen,
      printing:actor.ownHand[chosen],eligibleCount:eligible.length
    });
    return action;
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&this!==live){
      live=this;
      audit.stores++;
    }
    const saved=this===live?selected.get(action):null;
    if(!saved)return oldDispatch.value.apply(this,[action,...args]);
    try{
      const result=oldDispatch.value.apply(this,[action,...args]);
      audit.accepted++;
      const same=this.state.players[saved.seat].active.cards.includes(saved.physical);
      if(same)audit.physicallyPlacedActiveConfirmed++;
      else audit.physicallyPlacedActiveMissing++;
      return result;
    }catch(error){
      audit.rejected++;
      throw error;
    }
  }
  Object.defineProperty(Ai.prototype,'decodeNextAction',{
    ...oldBot,value:decode
  });
  Object.defineProperty(Store.prototype,'dispatch',{
    ...oldDispatch,value:dispatch
  });
  try{
    return {result:run(),audit};
  }catch(error){
    if(error&&typeof error==='object')
      error.ownerStartingPokemonAudit={...audit,
        events:[...audit.events],aborted:true};
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',oldDispatch);
    assert.strictEqual(Ai.prototype.decodeNextAction,decode);
    Object.defineProperty(Ai.prototype,'decodeNextAction',oldBot);
  }
}

module.exports={VERSION,MESSAGE,PHASE_SETUP,chooseOwnerStartingPokemon,
  withOwnerStartingPokemon};
