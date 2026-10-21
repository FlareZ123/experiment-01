'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {assertValidPromptAction}=require('./prompt-integrity.cjs');

const VERSION='agent41-owner-only-powerglass-basic-psychic-prompt-v1';

/**
 * Accept only a genuine Powerglass end-turn attachment source owned by the
 * responding player. The card source is the public discard pile, never an
 * unrevealed deck or Prize zone. Types are pinned native enum constants.
 *
 * @param {object} state Genuine native Store State.
 * @param {0|1} seat Authenticated responding seat.
 * @param {{basicEnergyType:number,bottomPlayer:number,activeSlot:number}} types
 * @param {Function} [observe] Detached acting-player observer.
 * @returns {object|null} Frozen owner-observable prompt input.
 */
function ownerPowerglassAttachInput(state,seat,types,observe=actorObservation){
  assert.ok(seat===0||seat===1);
  const owner=state.players?.[seat];
  const pending=state.prompts?.find(p=>p.result===undefined);
  if(pending?.constructor?.name!=='AttachEnergyPrompt'||
     pending.playerId!==owner?.id||
     typeof pending.getPerspectivePlayerId!=='function'||
     pending.getPerspectivePlayerId()!==owner.id||
     pending.cardList!==owner.discard||
     pending.options?.min!==0||
     pending.options?.max<1||
     !Array.isArray(pending.slots)||
     !pending.slots.includes(types.activeSlot)||
     ![0,types.bottomPlayer].includes(pending.playerType))return null;

  const blockedTarget={player:types.bottomPlayer,slot:types.activeSlot,index:0};
  if((pending.options.blockedTo??[]).some(t=>
    t.player===blockedTarget.player&&
    t.slot===blockedTarget.slot&&t.index===blockedTarget.index))return null;

  const actor=observe(state,seat);
  assert.equal(actor.decisionKind,'owner-prompt');
  if(actor.ownPublic?.active?.printing!=='Mewtwo & Mew-GX UNM'||
     !(actor.ownPublic.active.tools??[]).includes('Powerglass SFA'))
    return null;

  // Every chosen printing is already public in the owner's discard and
  // physically eligible under the prompt's original native source filter.
  const allowed=new Set(pending.cardList.filter(pending.filter));
  const blocked=new Set(pending.options.blocked??[]);
  const offered=Object.freeze(pending.cardList.cards.map((card,index)=>
    Object.freeze({
      index,printing:card.fullName,
      eligible:allowed.has(card)&&!blocked.has(index)&&
        card.energyType===types.basicEnergyType&&
        card.name==='Psychic Energy'
    })));
  return Object.freeze({
    actor,
    prompt:Object.freeze({
      kind:'AttachEnergyPrompt',id:pending.id,
      offered,sourceZone:'own-public-discard',
      target:Object.freeze(blockedTarget)
    })
  });
}

/**
 * The studied Powerglass line needs Psychic on the owner's Active Mewtwo.
 * No concealed identities or native Card instances enter this decision.
 * @param {object} input Detached owner-only prompt input.
 * @returns {{sourceIndex:number,target:object}|null}
 */
function chooseOwnerPowerglassAttach(input){
  assert.equal(input.actor.decisionKind,'owner-prompt');
  assert.equal(input.prompt.kind,'AttachEnergyPrompt');
  const found=input.prompt.offered.find(row=>row.eligible);
  return found?{sourceIndex:found.index,target:input.prompt.target}:null;
}

/**
 * Reversible both-seat original-Store prompt policy. All other decisions
 * retain the caller's original behavior, including hypothetical clones.
 * Unsupported native prompts are delegated without earning competence.
 *
 * @template T
 * @param {()=>T} execute Existing synchronous original Store experiment.
 * @param {object} [deps] Injectable native classes and accessors for tests.
 * @returns {{result:T,audit:object}}
 */
function withOwnerPowerglassAttachPrompt(execute,deps={}){
  assert.equal(typeof execute,'function');
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const pinned=name=>require(path.join(output,name));
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    pinned('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??pinned('game/store/store').Store;
  const ResolvePromptAction=deps.ResolvePromptAction??
    pinned('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const types=deps.types??(()=>{
    const {EnergyType}=pinned('game/store/card/card-types');
    const {PlayerType,SlotType}=
      pinned('game/store/actions/play-card-action');
    return {basicEnergyType:EnergyType.BASIC,
      bottomPlayer:PlayerType.BOTTOM_PLAYER,activeSlot:SlotType.ACTIVE};
  })();
  const observe=deps.observe??actorObservation;
  const validate=deps.validate??assertValidPromptAction;
  const original=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const originalDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  assert.equal(typeof originalDispatch?.value,'function');

  let liveStore=null;
  const selected=new WeakMap();
  const audit={
    version:VERSION,decisionOrigin:'owner-public-discard-and-physical-prompt',
    nativeStores:0,selected:0,accepted:0,rejected:0,
    confirmedPhysicalBasicAttachments:0,missingPhysicalAttachments:0,
    unsupportedPrompts:0,speculativeFallbacks:0,
    boundedSelections:[],competitiveGameQualified:false
  };
  function decide(state){
    if(state!==liveStore?.state){
      audit.speculativeFallbacks++;
      return original.value.call(this,state);
    }
    const seat=state.players?.findIndex(p=>p.id===this.client?.id)??-1;
    const input=seat>=0?ownerPowerglassAttachInput(state,seat,types,observe):null;
    if(!input){
      if(state.prompts?.some(p=>p.result===undefined&&
          p.playerId===this.client?.id&&
          p.constructor?.name==='AttachEnergyPrompt'))
        audit.unsupportedPrompts++;
      return original.value.call(this,state);
    }
    const choice=chooseOwnerPowerglassAttach(input);
    if(!choice){
      audit.unsupportedPrompts++;
      return original.value.call(this,state);
    }
    const prompt=state.prompts.find(p=>
      p.id===input.prompt.id&&p.result===undefined);
    assert.ok(prompt,'Owner Powerglass prompt changed before construction');
    const card=prompt.cardList.cards[choice.sourceIndex];
    assert.ok(card,'Missing selected physical Basic Psychic');
    const action=new ResolvePromptAction(prompt.id,[{
      card,to:{...choice.target}
    }]);
    validate(state,action,{enforceAttachEnergyGeometry:true});
    selected.set(action,{seat,turn:input.actor.globalTurn,promptId:prompt.id,
      card,printing:card.fullName});
    audit.selected++;
    if(audit.boundedSelections.length<32)
      audit.boundedSelections.push({seat,turn:input.actor.globalTurn,
        printing:card.fullName,sourceZone:'own-public-discard',
        recipient:'own-active'});
    return action;
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&this!==liveStore){
      liveStore=this;
      audit.nativeStores++;
    }
    const proof=this===liveStore?selected.get(action):undefined;
    if(!proof)return originalDispatch.value.apply(this,[action,...args]);
    const owner=this.state.players[proof.seat];
    assert.ok(owner.discard.cards.includes(proof.card),
      'Powerglass physical Energy no longer in owner discard');
    try{
      const result=originalDispatch.value.apply(this,[action,...args]);
      audit.accepted++;
      if(owner.active.energies.cards.includes(proof.card)&&
         !owner.discard.cards.includes(proof.card))
        audit.confirmedPhysicalBasicAttachments++;
      else audit.missingPhysicalAttachments++;
      return result;
    }catch(error){
      audit.rejected++;
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...original,value:decide});
  Object.defineProperty(Store.prototype,'dispatch',
    {...originalDispatch,value:dispatch});
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decide);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',originalDispatch);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',original);
  }
}

module.exports={VERSION,ownerPowerglassAttachInput,
  chooseOwnerPowerglassAttach,withOwnerPowerglassAttachPrompt};
