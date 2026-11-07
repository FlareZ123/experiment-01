'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {assertValidPromptAction}=require('./prompt-integrity.cjs');

const VERSION='agent36-owner-ability-confirm-policy-v3-owned-articuno-water';

/**
 * Load actual classes exported by pinned Twinleaf (not a nonexistent package
 * alias). Keep the direct dependency injection path for isolated tests.
 * @returns {{ptcgServer:object,types:object}}
 */
function loadNativeAbilityDependencies(){
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const load=name=>require(path.join(output,name));
  const {CardType,SuperType,Stage}=
    load('game/store/card/card-types');
  return {
    ptcgServer:{
      Store:load('game/store/store').Store,
      SimpleTacticsAi:load('simple-bot/simple-tactics-ai').SimpleTacticsAi,
      ConfirmPrompt:load('game/store/prompts/confirm-prompt').ConfirmPrompt,
      ChooseCardsPrompt:load('game/store/prompts/choose-cards-prompt').ChooseCardsPrompt,
      ResolvePromptAction:load('game/store/actions/resolve-prompt-action')
        .ResolvePromptAction
    },
    types:{CardType,SuperType,Stage,
      GameMessage:load('game/game-message').GameMessage,
      ...load('game/store/actions/play-card-action')}
  };
}

/** @param {object} slot */
function energyCards(slot){return slot?.energies?.cards??[];}

/** @param {object} slot */
function pokemonCards(slot){return slot?.cards??[];}

/** @param {object} card @param {object} types */
function isWaterEnergy(card,types){
  return Array.isArray(card?.cardType)&&
    card.cardType.includes(types.CardType.WATER);
}

/**
 * Find the owner's in-play slot containing the exact Pokémon played from hand.
 * @param {object} owner
 * @param {object} card
 * @returns {object|null}
 */
function findPlayedSlot(owner,card){
  const slots=[owner?.active,...(owner?.bench??[])].filter(Boolean);
  return slots.find(slot=>pokemonCards(slot).some(candidate=>
    candidate===card||(card?.id!==undefined&&candidate?.id===card.id)))??null;
}

/**
 * Owner-only, state-based decision for the two v8 ConfirmPrompt sources.
 * The policy never reads an unopened deck. Radiant targets are selected only
 * after Twinleaf has opened the genuine VMAX ChooseCardsPrompt.
 *
 * @param {{card:object,owner:object,types:object}} args
 * @returns {{decision:boolean,reason:string,details:object}}
 */
function decideAbilityConfirm({card,owner,types}){
  const name=card?.name??null;
  if(name==='Radiant Eternatus'){
    const openBenchSlots=(owner?.bench??[]).filter(slot=>
      (slot.cards??[]).length===0).length;
    return {
      decision:openBenchSlots>0,
      reason:openBenchSlots>0?'radiant-has-bench-capacity':'radiant-bench-full',
      details:{openBenchSlots}
    };
  }
  if(name==='Articuno-GX'){
    const articunoSlot=findPlayedSlot(owner,card);
    if(!articunoSlot){
      return {decision:false,reason:'articuno-not-in-play',details:{}};
    }
    const allSlots=[owner?.active,...(owner?.bench??[])].filter(Boolean);
    const ownEnergy=energyCards(articunoSlot);
    const articunoWater=ownEnergy.filter(energy=>isWaterEnergy(energy,types)).length;
    const otherWater=allSlots.filter(slot=>slot!==articunoSlot)
      .flatMap(energyCards)
      .filter(energy=>isWaterEnergy(energy,types)).length;
    const moveNeeded=Math.max(0,2-articunoWater,3-ownEnergy.length);
    // The stock resolver moves all offered Water Energy. Accept only when that
    // exact transfer is enough to ready Ice Wing without stripping extras.
    const decision=moveNeeded>0&&otherWater===moveNeeded;
    return {
      decision,
      reason:decision?'articuno-exact-water-transfer-readies-ice-wing':
        'articuno-insufficient-or-excess-water-transfer',
      details:{
        articunoEnergyCount:ownEnergy.length,
        articunoWaterCount:articunoWater,
        otherWaterCount:otherWater,
        moveNeeded
      }
    };
  }
  return {
    decision:false,
    reason:'unrecognized-ability-default-false',
    details:{}
  };
}

/**
 * Select only legal VMAX cards from the genuine open Radiant search prompt.
 * @param {{prompt:object,owner:object,types:object}} args
 * @returns {object[]}
 */
function chooseRadiantVmaxTargets({prompt,owner,types}){
  const pool=prompt.cards?.cards??[];
  const openBenchSlots=(owner?.bench??[]).filter(slot=>
    (slot.cards??[]).length===0).length;
  const maxOption=Number.isInteger(prompt.options?.max)?prompt.options.max:2;
  const minOption=Number.isInteger(prompt.options?.min)?prompt.options.min:0;
  const limit=Math.max(0,Math.min(2,maxOption,openBenchSlots));
  const eligible=pool.filter(card=>
    card.superType===types.SuperType.POKEMON&&card.stage===types.Stage.VMAX);
  eligible.sort((a,b)=>
    String(a.fullName??a.name).localeCompare(String(b.fullName??b.name))||
    String(a.id??'').localeCompare(String(b.id??'')));
  const selected=eligible.slice(0,limit);
  if(selected.length<minOption){
    throw new Error('Radiant Eternatus VMAX search has fewer legal targets than the prompt minimum.');
  }
  return selected;
}

/**
 * Resolve only the physical owner's printed Basic Water Energy movement after
 * an accepted Articuno-GX Legendary Ascent. The opened native prompt exposes
 * only the move geometry; no opponent hand, Prize card or unopened deck is read.
 *
 * @param {{prompt:object,owner:object,played:object,types:object}} args
 * @returns {object[]}
 */
function chooseArticunoOwnedWaterTransfers({prompt,owner,played,types}){
  const {PlayerType,SlotType,SuperType,GameMessage}=types;
  if(prompt?.constructor?.name!=='MoveEnergyPrompt' ||
      prompt.message!==GameMessage.MOVE_ENERGY_TO_ACTIVE ||
      prompt.playerType!==PlayerType.BOTTOM_PLAYER ||
      !prompt.slots.includes(SlotType.ACTIVE) ||
      !prompt.slots.includes(SlotType.BENCH) ||
      prompt.filter?.superType!==SuperType.ENERGY ||
      prompt.filter?.name!=='Water Energy'){
    throw new Error('Articuno Ascent transfer prompt does not match its printed native geometry.');
  }
  const active=owner?.active;
  if(!(active?.cards??[]).some(card=>card===played?.card||
      card?.id!==undefined&&card.id===played?.card?.id)){
    throw new Error('Articuno Ascent recipient is no longer the played Active Pokémon.');
  }
  const destination={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0};
  const sameTarget=(a,b)=>a?.player===b?.player &&
    a?.slot===b?.slot&&a?.index===b?.index;
  if(prompt.options.blockedTo.some(target=>sameTarget(target,destination))){
    throw new Error('Articuno Ascent native prompt forbids its Active recipient.');
  }
  const available=[];
  for(let i=0;i<(owner.bench??[]).length;i++){
    const source={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:i};
    if(prompt.options.blockedFrom.some(target=>sameTarget(target,source)))
      continue;
    const slot=owner.bench[i];
    const forbidden=new Set(prompt.options.blockedMap
      .filter(entry=>sameTarget(entry.source,source))
      .flatMap(entry=>entry.blocked));
    for(const card of slot?.energies?.cards??[]){
      const index=slot.cards.indexOf(card);
      if(index<0||forbidden.has(index) ||
          card?.superType!==SuperType.ENERGY ||
          card.name!=='Water Energy')continue;
      available.push({from:source,to:destination,card});
    }
  }
  const max=Number.isInteger(prompt.options.max)?
    prompt.options.max:available.length;
  const selected=available.slice(0,max);
  if(selected.length<prompt.options.min){
    throw new Error('Articuno Ascent has fewer legal owner Water cards than its native prompt minimum.');
  }
  return selected;
}

/**
 * Install an owner-only Confirm policy and real Store receipts around a native
 * match callback. Unknown Confirm prompts retain the conservative false
 * default. All custom prompt actions are validated before Store.dispatch.
 *
 * @param {()=>any} run
 * @param {{ptcgServer?:object,types?:object,validate?:Function}} [deps]
 * @returns {{result:any,audit:object}}
 */
function withOwnerAbilityConfirmPolicy(run,deps={}){
  assert.equal(typeof run,'function');
  const native=deps.ptcgServer&&deps.types?null:loadNativeAbilityDependencies();
  const ptcg=deps.ptcgServer??native.ptcgServer;
  const types=deps.types??native.types;
  const validate=deps.validate??assertValidPromptAction;
  const {Store,SimpleTacticsAi,ConfirmPrompt,ChooseCardsPrompt,
    ResolvePromptAction}=ptcg;
  assert.ok(Store?.prototype&&SimpleTacticsAi?.prototype);
  assert.equal(typeof ResolvePromptAction,'function');


  const originalDispatch=Store.prototype.dispatch;
  const originalDecode=SimpleTacticsAi.prototype.decodeNextAction;
  const submitted=new WeakMap();
  // Prompt IDs may be reused by independent Stores; retain exact prompt identity.
  const pendingByPrompt=new Map();
  const pendingAbilityByOwner=new Map();
  const audit={
    version:VERSION,
    readsOpponentHidden:false,
    readsUnopenedDeck:false,
    readsDeckCardsOnlyAfterGenuineSearchPrompt:true,
    usesOwnerHandOnlyToIdentifyPlayedCard:true,
    confirmOffers:0,
    confirmSettled:0,
    confirmUnsettled:0,
    confirmEvents:[],
    radiantSearchOffers:0,
    radiantSearchSubmitted:0,
    radiantSearchEvents:[],
    articunoMoveEnergyEvents:[]
  };

  Store.prototype.dispatch=function(action,...args){
    const stateBefore=this.state;
    const beforePrompts=new Set(stateBefore?.prompts??[]);
    let played=null;
    if(action?.constructor?.name==='PlayCardAction'){
      const owner=stateBefore.players.find(player=>player.id===action.id);
      const card=owner?.hand?.cards?.[action.handIndex]??null;
      if(card){
        played={
          ownerId:action.id,card,cardName:card.name??null,
          fullName:card.fullName??card.name??null,turn:stateBefore.turn
        };
      }
    }
    const meta=action&&typeof action==='object'?submitted.get(action):null;
    const result=originalDispatch.call(this,action,...args);

    for(const prompt of this.state?.prompts??[]){
      if(!beforePrompts.has(prompt)&&prompt instanceof ConfirmPrompt&&
          prompt.message==='WANT_TO_USE_ABILITY'){
        // Source attribution is from this exact accepted PlayCardAction only.
        // A previously played Pokémon cannot authenticate a later prompt.
        if(played&&played.ownerId===prompt.playerId&&
           played.turn===this.state.turn)
          pendingByPrompt.set(prompt,played);
      }
    }

    if(meta?.kind==='confirm'){
      const settled=meta.prompt.result===meta.decision;
      if(settled){
        pendingByPrompt.delete(meta.prompt);
        audit.confirmSettled++;
        if(meta.decision&&meta.played){
          pendingAbilityByOwner.set(meta.ownerId,meta.played);
        }else{
          pendingAbilityByOwner.delete(meta.ownerId);
        }
      }else{
        audit.confirmUnsettled++;
      }
      audit.confirmEvents.push({
        ownerId:meta.ownerId,turn:meta.turn,seat:meta.seat,
        message:meta.message,cardName:meta.played?.cardName??null,
        decision:meta.decision,reason:meta.reason,settled
      });
    }

    if(meta?.kind==='radiant-search'){
      const owner=this.state.players.find(player=>player.id===meta.ownerId);
      const sameCard=(left,right)=>left===right||
        left?.id!==undefined&&left.id===right?.id;
      const physicallyBenched=meta.selected.every(card=>
        (owner?.bench??[]).some(slot=>(slot.cards??[]).some(candidate=>
          sameCard(candidate,card))));
      const stillInDeck=meta.selected.some(card=>
        (owner?.deck?.cards??[]).some(candidate=>sameCard(candidate,card)));
      const settled=meta.prompt.result!==undefined;
      const event={
        ownerId:meta.ownerId,turn:meta.turn,
        offered:meta.offered,targetCount:meta.selected.length,
        targets:meta.selected.map(card=>card.fullName??card.name??null),
        allTargetsVmax:meta.selected.every(card=>
          card.superType===types.SuperType.POKEMON&&card.stage===types.Stage.VMAX),
        promptSettled:settled,physicallyBenched,stillInDeck
      };
      audit.radiantSearchEvents.push(event);
      if(settled&&physicallyBenched&&!stillInDeck){
        pendingAbilityByOwner.delete(meta.ownerId);
      }
      if(!settled||!physicallyBenched||stillInDeck||!event.allTargetsVmax){
        throw new Error('Radiant Eternatus search did not settle into legal VMAX Bench custody.');
      }
    }

    if(meta?.kind==='articuno-move-energy'){
      // Retire the one-shot association only after the actual Store action.
      pendingAbilityByOwner.delete(meta.ownerId);
      const transfers=Array.isArray(meta.prompt.result)?meta.prompt.result:[];
      const owner=this.state.players.find(player=>player.id===meta.ownerId);
      const physicallyMoved=transfers.length===meta.selected.length &&
        meta.selected.every(transfer=>
          (owner?.active?.energies?.cards??[]).includes(transfer.card) &&
          !(owner?.bench?.[transfer.from.index]?.energies?.cards??[])
            .includes(transfer.card));
      const settled=meta.prompt.result!==undefined;
      audit.articunoMoveEnergyEvents.push({
        ownerId:meta.ownerId,turn:meta.turn,
        transferCount:transfers.length,promptSettled:settled,
        physicallyMoved,
        allWaterEnergy:transfers.every(entry=>isWaterEnergy(entry?.card,types)),
        transfers:transfers.map(entry=>({
          card:entry?.card?.fullName??entry?.card?.name??null,
          from:entry?.from??null,to:entry?.to??null
        }))
      });
      if(!settled||!physicallyMoved ||
          !transfers.every(entry=>isWaterEnergy(entry?.card,types))){
        throw new Error('Articuno Ascent owner Water movement did not settle into physical custody.');
      }
    }
    return result;
  };

  SimpleTacticsAi.prototype.decodeNextAction=function(state){
    const ownerId=this.client?.id;
    const owner=state.players.find(player=>player.id===ownerId);
    const prompt=state.prompts.find(candidate=>
      candidate.playerId===ownerId&&candidate.result===undefined);

    if(prompt instanceof ConfirmPrompt){
      const played=pendingByPrompt.get(prompt)??null;
      const choice=prompt.message==='GO_FIRST'?
        {decision:false,reason:'go-first-default-second',details:{}}:
        prompt.message==='WANT_TO_USE_ABILITY'&&played?
          decideAbilityConfirm({card:played.card,owner,types}):
          {decision:false,reason:'unrecognized-confirm-default-false',details:{}};
      audit.confirmOffers++;
      const seat=state.players.findIndex(player=>player.id===ownerId);
      const action=new ResolvePromptAction(prompt.id,choice.decision);
      validate(state,action);
      submitted.set(action,{
        kind:'confirm',prompt,decision:choice.decision,played,ownerId,
        turn:state.turn,seat,message:prompt.message,reason:choice.reason
      });
      return action;
    }

    const ability=pendingAbilityByOwner.get(ownerId);
    if(ability?.cardName==='Radiant Eternatus'&&
        prompt instanceof ChooseCardsPrompt&&
        prompt.message===types.GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH&&
        prompt.filter?.superType===types.SuperType.POKEMON&&
        prompt.cards===owner?.deck&&
        prompt.options?.min===0&&prompt.options?.max<=2){
      audit.radiantSearchOffers++;
      const selected=chooseRadiantVmaxTargets({prompt,owner,types});
      const action=new ResolvePromptAction(prompt.id,selected);
      validate(state,action);
      submitted.set(action,{
        kind:'radiant-search',prompt,selected,ownerId,
        turn:state.turn,offered:(prompt.cards?.cards??[]).length
      });
      audit.radiantSearchSubmitted++;
      return action;
    }

    if(ability?.cardName==='Articuno-GX'&&
        prompt?.constructor?.name==='MoveEnergyPrompt'&&
        prompt.message===types.GameMessage.MOVE_ENERGY_TO_ACTIVE){
      const selected=chooseArticunoOwnedWaterTransfers({
        prompt,owner,played:ability,types
      });
      const action=new ResolvePromptAction(prompt.id,selected);
      validate(state,action);
      submitted.set(action,{
        kind:'articuno-move-energy',prompt,selected,ownerId,turn:state.turn
      });
      return action;
    }

    return originalDecode.call(this,state);
  };

  try{
    return {result:run(),audit};
  }catch(error){
    // Preserve read-only receipts even if the native run aborts before a root.
    if(error&&typeof error==='object')
      error.ownerAbilityConfirmAudit={
        ...audit,
        confirmEvents:[...audit.confirmEvents],
        radiantSearchEvents:[...audit.radiantSearchEvents],
        articunoMoveEnergyEvents:[...audit.articunoMoveEnergyEvents]
      };
    throw error;
  }finally{
    Store.prototype.dispatch=originalDispatch;
    SimpleTacticsAi.prototype.decodeNextAction=originalDecode;
  }
}

module.exports={
  VERSION,loadNativeAbilityDependencies,decideAbilityConfirm,
  chooseRadiantVmaxTargets,chooseArticunoOwnedWaterTransfers,
  withOwnerAbilityConfirmPolicy
};
