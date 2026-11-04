'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {assertValidPromptAction}=require('./prompt-integrity.cjs');

const VERSION='agent4-owner-setup-starting-pokemon-v2-single-basic-bonus-decline';
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
 * The pinned setup reducer reuses CHOOSE_STARTING_POKEMONS with min=0 after
 * mulligan-compensation draws, where every selected card would go to Bench.
 * Zero is a legal optional Bench placement. Retain all new Basics in hand
 * under this deliberately conservative, deterministic baseline.
 *
 * @param {{actor:object,prompt:{kind:string,message:string,min:number}}} input
 * @returns {{kind:string,handIndices:[]}}
 */
function chooseOwnerBonusBench(input){
  assert.equal(input.actor.decisionKind,'owner-prompt');
  assert.equal(input.actor.phase,PHASE_SETUP);
  assert.equal(input.actor.globalTurn,0);
  assert.equal(input.prompt.kind,'ChooseCardsPrompt');
  assert.equal(input.prompt.message,MESSAGE);
  assert.equal(input.prompt.min,0);
  return Object.freeze({
    kind:'owner-bonus-bench-decline',
    handIndices:Object.freeze([])
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
 *   observe?:Function,choose?:Function,chooseBonus?:Function,validate?:Function}} [deps]
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
  const chooseBonus=deps.chooseBonus??chooseOwnerBonusBench;
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
    selectedInitial:0,selectedBonusDecline:0,
    acceptedInitial:0,acceptedBonusDecline:0,
    physicallyPlacedActiveConfirmed:0,
    physicallyPlacedActiveMissing:0,
    bonusDeclinePhysicalZonesPreserved:0,
    bySeat:{0:0,1:0},
    events:[],nativeScoringUsed:false,
    competitivePaperGamesQualified:0
  };
  function decode(state){
    if(state!==live?.state)return oldBot.value.call(this,state);
    const prompt=state.prompts?.find(p=>p.result===undefined)??null;
    const owner=state.players.find(p=>p.id===this.client?.id);
    if(state.phase!==PHASE_SETUP||state.turn!==0||
        prompt?.constructor?.name!=='ChooseCardsPrompt'||
        prompt.message!==MESSAGE||
        !owner||prompt.playerId!==owner.id||
        prompt.cards!==owner.hand||
        prompt.options?.allowCancel!==false){
      return oldBot.value.call(this,state);
    }
    const initial=prompt.options.min===1&&
      Number.isSafeInteger(prompt.options.max)&&prompt.options.max>=1;
    const bonus=prompt.options.min===0&&
      Number.isSafeInteger(prompt.options.max)&&prompt.options.max>=0&&
      owner.active.cards.length>0;
    if(!initial&&!bonus)return oldBot.value.call(this,state);
    const seat=state.players.indexOf(owner);
    assert.ok(seat===0||seat===1);
    const actor=observe(state,seat);
    assert.equal(actor.decisionKind,'owner-prompt');
    assert.deepEqual(actor.ownHand,owner.hand.cards.map(card=>card.fullName));
    const cards=owner.hand.cards;
    const blocked=new Set(prompt.options.blocked??[]);
    const eligible=[];
    if(initial){
      for(let index=0;index<cards.length;index++){
        if(blocked.has(index))continue;
        if(prompt.validate([cards[index]],state)!==true)continue;
        eligible.push(Object.freeze({index,printing:actor.ownHand[index]}));
      }
    }
    const input=Object.freeze({actor,prompt:Object.freeze({
      kind:'ChooseCardsPrompt',message:prompt.message,
      min:prompt.options.min,eligible:Object.freeze(eligible)
    })});
    const choice=initial?choose(input):chooseBonus(input);
    assert.equal(choice.kind,initial?
      'owner-opening-single-basic':'owner-bonus-bench-decline');
    assert.ok(Array.isArray(choice.handIndices)&&
      choice.handIndices.length===(initial?1:0));
    const chosen=initial?choice.handIndices[0]:null;
    if(initial)assert.ok(eligible.some(o=>o.index===chosen));
    const physical=initial?cards[chosen]:null;
    const action=new ResolvePromptAction(prompt.id,
      initial?[physical]:[]);
    validate(state,action);
    selected.set(action,{
      seat,initial,physical,
      beforeHand:bonus?[...owner.hand.cards]:null,
      beforeActive:bonus?[...owner.active.cards]:null,
      beforeBench:bonus?owner.bench.map(slot=>[...slot.cards]):null
    });
    audit.selected++;
    if(initial)audit.selectedInitial++;
    else audit.selectedBonusDecline++;
    audit.bySeat[seat]++;
    if(audit.events.length<16)audit.events.push({
      seat,turn:state.turn,
      decision:initial?'initial-active':'bonus-bench-decline',
      chosenOwnerHandIndex:chosen,
      printing:initial?actor.ownHand[chosen]:null,
      eligibleCount:initial?eligible.length:null
    });
    return action;
  }
  function sameCards(a,b){
    return a.length===b.length&&a.every((card,i)=>card===b[i]);
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
      const owner=this.state.players[saved.seat];
      if(saved.initial){
        audit.acceptedInitial++;
        if(owner.active.cards.includes(saved.physical))
          audit.physicallyPlacedActiveConfirmed++;
        else audit.physicallyPlacedActiveMissing++;
      }else{
        audit.acceptedBonusDecline++;
        assert.ok(sameCards(owner.hand.cards,saved.beforeHand),
          'Bonus Bench decline unexpectedly changed own hand');
        assert.ok(sameCards(owner.active.cards,saved.beforeActive),
          'Bonus Bench decline unexpectedly changed Active');
        assert.equal(owner.bench.length,saved.beforeBench.length);
        for(let i=0;i<owner.bench.length;i++)
          assert.ok(sameCards(owner.bench[i].cards,saved.beforeBench[i]),
            'Bonus Bench decline unexpectedly changed Bench');
        audit.bonusDeclinePhysicalZonesPreserved++;
      }
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
  chooseOwnerBonusBench,withOwnerStartingPokemon};
