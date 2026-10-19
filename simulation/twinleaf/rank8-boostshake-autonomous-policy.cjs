'use strict';

const path = require('node:path');
const engineRoot = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Information-set predicate for an early Item/Tool Garbodor commitment.
 * It sees only the player's hand and board, before any deck search.
 * Every expendable card is selected from own hand by a declared priority.
 * This source-specific tactic deliberately spends important resources.
 *
 * @param {object} own Acting player's visible-to-self state.
 * @returns {{eligible:boolean,discardNames:string[],reason:string}}
 */
function inspectBoostShakeWindow(own) {
  const hand=own?.hand?.cards || [];
  const bench=own?.bench || [];
  const required=['Secret Box','Boost Shake','Float Stone'];
  if (required.some(name=>!hand.some(card=>card.name===name))) {
    return {eligible:false,discardNames:[],reason:'missing own-hand core'};
  }
  if (!bench.some(slot=>!slot.getPokemonCard()) ||
      bench.some(slot=>slot.getPokemonCard()?.name==='Garbodor' &&
        slot.tools.length>0)) {
    return {eligible:false,discardNames:[],reason:'no unoccupied Bench or lock already established'};
  }
  const priorities=['Dark Patch','VS Seeker','Iono','Darkness Energy',
    'Battle Compressor','Field Blower','N','Pokémon Ranger'];
  const consumed=new Set();
  const discarded=[];
  for (const name of priorities) {
    const index=hand.findIndex((card,i)=>card.name===name && !consumed.has(i));
    if (index>=0) {
      discarded.push(hand[index]);
      consumed.add(index);
    }
    if (discarded.length===3) break;
  }
  if(discarded.length<3) {
    return {eligible:false,discardNames:[],reason:'fewer than three designated discard options'};
  }
  return {eligible:true,discardNames:discarded.map(card=>card.name),
    reason:'public Bench and own-hand trigger'};
}


/**
 * Versioned, opt-in expansion of the same own-hand predicate. Secret Box
 * discards three *physical cards*, so duplicated priority names may satisfy
 * its cost. Preserve the v1 three-distinct-names decisions whenever possible.
 * Choose each priority name once before taking a second physical copy.
 * @param {object} own Own visible-to-self hand and public board.
 * @returns {{eligible:boolean,discardNames:string[],reason:string}}
 */
function inspectBoostShakeWindowAllowDuplicates(own) {
  const first=inspectBoostShakeWindow(own);
  if(first.eligible || first.reason!=='fewer than three designated discard options') {
    return first;
  }
  const hand=own.hand.cards;
  const priorities=['Dark Patch','VS Seeker','Iono','Darkness Energy',
    'Battle Compressor','Field Blower','N','Pokémon Ranger'];
  const indices=[];
  const used=new Set();
  for(const name of priorities) {
    const index=hand.findIndex((card,i)=>card.name===name&&!used.has(i));
    if(index>=0) {
      used.add(index);
      indices.push(index);
    }
  }
  if(indices.length<3) {
    for(const name of priorities) {
      for(let i=0;i<hand.length && indices.length<3;i++) {
        if(hand[i].name===name&&!used.has(i)) {
          used.add(i);
          indices.push(i);
        }
      }
      if(indices.length===3)break;
    }
  }
  return indices.length>=3?{
    eligible:true,
    discardNames:indices.slice(0,3).map(i=>hand[i].name),
    reason:'three distinct physical priority cards including repeated names'
  }:first;
}

/**
 * A provisional seed-independent rank8 Tool-Garbodor policy. The only public
 * state it reads before K1 is its own hand/board, after which each searched
 * card is chosen from a real owner-authorized Store prompt. No source turn,
 * seed, opponent rank or deck contents are hard-coded into the trigger.
 *
 * Issued actions are policy proposals. Actual Store dispatches are audited
 * independently by the caller's transcript wrapper.
 *
 * @template T
 * @param {0|1} sourceSeat Physical seat of the candidate opponent policy.
 * @param {()=>T} execute Synchronous source-dealt runMatch.
 * @returns {{result:T,policyAudit:object}}
 */
function withRank8AutonomousBoostShake(sourceSeat,execute,
  {allowDuplicatePriorityDiscards=false}={}) {
  if (![0,1].includes(sourceSeat) || typeof execute!=='function') {
    throw new TypeError('Physical seat and synchronous execute callback required');
  }
  const load=relative=>require(path.join(engineRoot,relative));
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {GamePhase}=load('game/store/state/state');
  const previous=SimpleTacticsAi.prototype.decodeNextAction;
  const ownerId=sourceSeat===0?101:202;
  const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  let stage=0,attempted=false,aborted=null,verified=false;
  let initialOwnHand=null,requestedDiscardNames=[];
  const events=[];
  /** @param {object} state @param {string} explanation @param {object} action */
  function issue(state,explanation,action) {
    events.push({kind:'proposed-action',turn:state.turn,step:stage,
      explanation,action:action.constructor.name});
    stage+=1;
    return action;
  }
  /** @param {object} state @param {string} reason */
  function abort(state,reason) {
    aborted=reason;
    events.push({kind:'aborted',turn:state.turn,step:stage,reason});
  }
  /** @param {object} own @param {string} name @param {object} target */
  function fromHand(own,name,target=board) {
    const index=own.hand.cards.findIndex(card=>card.name===name);
    return index>=0?new PlayCardAction(own.id,index,target):null;
  }
  /** @param {object} pending @param {string[]} names @param {object} state */
  function chooseCards(pending,names,state) {
    const used=new Set();
    const selected=names.map(name=>{
      const index=pending.cards?.cards?.findIndex((card,i)=>
        card.name===name && !used.has(i))??-1;
      if(index<0)return null;
      used.add(index);
      return pending.cards.cards[index];
    });
    if (selected.some(card=>!card) || pending.validate(selected,state)!==true) {
      return null;
    }
    return new ResolvePromptAction(pending.id,selected);
  }
  /** @param {object} state */
  function decide(state) {
    const own=state.players.find(player=>player.id===this.client?.id);
    if (stage===11 && !verified && !aborted) {
      const previousOwner=state.players[sourceSeat];
      verified=previousOwner.bench.some(slot=>
        slot.getPokemonCard()?.name==='Garbodor' &&
        slot.tools.some(card=>card.name==='Float Stone'));
      events.push({kind:'post-resolution',turn:state.turn,
        stage,verifiedEquippedGarbodor:verified});
    }
    if (own?.id!==ownerId || aborted || stage>=11) {
      return previous.call(this,state);
    }
    const pending=state.prompts.find(prompt=>prompt.result===undefined);
    if (!attempted && !pending &&
        state.activePlayer===sourceSeat &&
        state.phase===GamePhase.PLAYER_TURN) {
      const window=allowDuplicatePriorityDiscards?
        inspectBoostShakeWindowAllowDuplicates(own):
        inspectBoostShakeWindow(own);
      if (window.eligible) {
        const action=fromHand(own,'Secret Box');
        if (action && this.isValidAction(state,action)) {
          attempted=true;
          requestedDiscardNames=window.discardNames;
          initialOwnHand=own.hand.cards.map(card=>card.fullName);
          events.push({kind:'own-information-opportunity',turn:state.turn,
            availableBenchSlots:own.bench.filter(slot=>!slot.getPokemonCard()).length,
            ownHand:initialOwnHand,discardNames:requestedDiscardNames});
          return issue(state,'play held Secret Box',action);
        }
        events.push({kind:'rejected-legal-action',turn:state.turn,
          card:'Secret Box'});
      }
    }
    if (!attempted) return previous.call(this,state);
    const pendingStages=new Map([
      [1,requestedDiscardNames],
      [2,['Quick Ball','Temple of Sinnoh']],
      [4,['Temple of Sinnoh']],
      [5,['Trubbish']],
      [9,['Garbodor']]
    ]);
    if(pending) {
      const desired=pendingStages.get(stage);
      if(desired && pending.constructor.name==='ChooseCardsPrompt') {
        const action=chooseCards(pending,desired,state);
        if(action)return issue(state,'resolve genuine '+desired.join(', ')+' prompt',action);
        abort(state,'specified source cards absent or prompt rejected at step '+stage);
        return previous.call(this,state);
      }
      if(stage===10 && pending.constructor.name==='ChoosePokemonPrompt') {
        const slot=own.bench.find(slot=>
          slot.getPokemonCard()?.name==='Trubbish' &&
          slot.tools.some(card=>card.name==='Float Stone'));
        if(slot && pending.validate([slot],state)===true) {
          return issue(state,'evolve own Float Stone Trubbish',
            new ResolvePromptAction(pending.id,[slot]));
        }
        abort(state,'no owner-valid tooled Trubbish in evolution prompt');
        return previous.call(this,state);
      }
      return previous.call(this,state);
    }
    let action=null;
    if(stage===3)action=fromHand(own,'Quick Ball');
    if(stage===6) {
      const empty=own.bench.findIndex(slot=>!slot.getPokemonCard());
      if(empty>=0)action=fromHand(own,'Trubbish',{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:empty});
    }
    if(stage===7) {
      const target=own.bench.findIndex(slot=>
        slot.getPokemonCard()?.name==='Trubbish' && slot.tools.length===0);
      if(target>=0)action=fromHand(own,'Float Stone',{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:target});
    }
    if(stage===8)action=fromHand(own,'Boost Shake');
    if(action && this.isValidAction(state,action)) {
      return issue(state,'execute source ALS step '+stage,action);
    }
    abort(state,'missing or illegal own-hand action at step '+stage);
    return previous.call(this,state);
  }
  SimpleTacticsAi.prototype.decodeNextAction=decide;
  try {
    const result=execute();
    return {result,policyAudit:{
      schema:allowDuplicatePriorityDiscards?
        'rank8-conditional-boost-shake-opponent-v2-duplicate-priority':
        'rank8-conditional-boost-shake-opponent-v1',
      allowDuplicatePriorityDiscards,
      informationScope:'own-hand/public-board-then-legitimate-own-search-prompt',
      attempted,completed:stage===11,aborted,verifiedEquippedGarbodor:verified,
      initialOwnHand,requestedDiscardNames,events,
      policyEventsAreRootDispatches:false,
      qualifiedForCompetitiveInference:false
    }};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction=previous;
  }
}

module.exports={inspectBoostShakeWindow,
  inspectBoostShakeWindowAllowDuplicates,withRank8AutonomousBoostShake};
