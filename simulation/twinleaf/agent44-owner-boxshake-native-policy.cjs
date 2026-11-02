'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {chooseOwnedBoxFetchShake}=
  require('./agent44-secretbox-owner-prompt.cjs');

const VERSION='agent44-shared-firstturn-secretbox-shake-v1';
const FLEX_VERSION='agent44-shared-firstturn-secretbox-shake-v3-physical-multiplicity';
const BASE=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const DISCARD_PRIORITY=[
  'Battle VIP Pass','Quick Ball','Dark Patch','VS Seeker',
  'Mysterious Treasure','Ultra Ball','Iono','Carmine'
];

/**
 * Protect one physical copy of each indispensable hand resource.
 * A second copy of a Tool is expendable to fund a held Basic searcher.
 * This fixes the original rank8 source index289 failure in the prior v2
 * policy, which protected all same-named Tools by name-only membership.
 *
 * @param {string[]} handNames Genuine owner hand at native cost prompt.
 * @param {number} requiredDiscardCount Current native searcher payment.
 * @param {string|null} toolName Tool retained for upcoming Garbodor.
 * @returns {string[]} Exactly those physical payment names, or [].
 */
function selectLaterBasicDiscardNames(handNames,requiredDiscardCount,toolName){
  assert.ok(Array.isArray(handNames));
  assert.ok(Number.isSafeInteger(requiredDiscardCount)&&
    requiredDiscardCount>=1&&requiredDiscardCount<=2);
  const protectedIndices=new Set();
  for(const required of ['Boost Shake',toolName,'Trubbish']){
    if(!required)continue;
    const i=handNames.findIndex((name,index)=>
      name===required&&!protectedIndices.has(index));
    if(i>=0)protectedIndices.add(i);
  }
  const available=handNames.map((name,index)=>({name,index}))
    .filter(card=>!protectedIndices.has(card.index));
  available.sort((a,b)=>{
    const i=DISCARD_PRIORITY.indexOf(a.name),
      j=DISCARD_PRIORITY.indexOf(b.name);
    return (i<0?DISCARD_PRIORITY.length:i)-
      (j<0?DISCARD_PRIORITY.length:j)||a.index-b.index;
  });
  return available.slice(0,requiredDiscardCount).map(card=>card.name);
}

/**
 * Pure K0 offer using only the actor's current hand and public board.
 * The strict subset requires a held Trubbish, a held compatible Tool, and
 * three disposable physical cards. Unseen Shake and Garbodor remain K1 risks.
 *
 * @param {{handNames:string[],benchNames:(string|null)[],activeName?:string|null,itemLocked:boolean,toolLocked:boolean,turn:number}} view
 * @returns {{eligible:boolean,reason:string,discardNames:string[],toolName:string|null}}
 */
function firstTurnBoxOffer(view){
  assert.ok(Array.isArray(view.handNames));
  assert.ok(Array.isArray(view.benchNames));
  const names=view.handNames;
  if(!Number.isSafeInteger(view.turn)||view.turn<1||view.turn>2)
    return {eligible:false,reason:'NOT_FIRST_GLOBAL_TURN',discardNames:[],toolName:null};
  if(view.itemLocked||view.toolLocked)
    return {eligible:false,reason:'PUBLIC_LOCK',discardNames:[],toolName:null};
  if(!names.includes('Secret Box')||names.includes('Boost Shake'))
    return {eligible:false,reason:'MISSING_BOX_OR_SHAKE_ALREADY_HELD',discardNames:[],toolName:null};
  const toolName=['Float Stone','Muscle Band'].find(name=>names.includes(name))??null;
  if(!toolName||!names.includes('Trubbish')||
     !view.benchNames.includes(null)||
     view.activeName==='Trubbish'||view.benchNames.includes('Trubbish'))
    return {eligible:false,reason:'NO_HELD_FREE_TRUBBISH_TOOL_LINE',discardNames:[],toolName};
  const reserved=new Set();
  for(const name of ['Secret Box','Trubbish',toolName]){
    const index=names.findIndex((card,i)=>card===name&&!reserved.has(i));
    assert.ok(index>=0);
    reserved.add(index);
  }
  const available=names.map((name,i)=>({name,i}))
    .filter(card=>!reserved.has(card.i));
  available.sort((a,b)=>{
    const pa=DISCARD_PRIORITY.indexOf(a.name);
    const pb=DISCARD_PRIORITY.indexOf(b.name);
    return (pa<0?DISCARD_PRIORITY.length:pa)-
      (pb<0?DISCARD_PRIORITY.length:pb)||a.i-b.i;
  });
  if(available.length<3)
    return {eligible:false,reason:'CANNOT_PAY_BOX_THREE',discardNames:[],toolName};
  return {eligible:true,reason:'K0_PHYSICAL_OFFER',
    discardNames:available.slice(0,3).map(card=>card.name),toolName};
}

/**
 * Witness native settlement only from the opposing actor's next decision
 * boundary. A source AI is not called while the opponent is acting.
 *
 * @param {Map<number,object>} stages Both physical-seat flow states.
 * @param {object} audit Append-only public witness.
 * @param {object} state Actual native public board at decision.
 * @param {object|null} pending Unresolved native prompt.
 * @param {object} GamePhase Pinned native phase enum.
 */
function witnessOpponentTurn(stages,audit,state,pending,GamePhase){
  for(const [sourceSeat,completed] of stages){
    if(completed.stage!=='complete'||completed.opponentObserved||
       state.activePlayer===sourceSeat||
       state.phase!==GamePhase.PLAYER_TURN||pending)continue;
    const source=state.players[sourceSeat];
    completed.opponentObserved=true;
    audit.opponentContinuations.push({sourceSeat,
      opponentSeat:state.activePlayer,turn:state.turn,
      originalBotDecisionRequested:true,
      equippedGarbodor:[source.active,...source.bench].some(slot=>
        slot.getPokemonCard()?.name==='Garbodor'&&
        slot.tools.some(tool=>tool.name===completed.toolName))});
  }
}

/**
 * Installs the same default-off decision rule for both physical seats.
 * Native prompts authorize own-deck K1; a failed K1 attempt is recorded
 * and delegated to the original bot instead of inventing search targets.
 * Does not inspect opponent hand, deck or Prizes.
 *
 * @template T
 * @param {()=>T} execute Synchronous pinned native match
 * @param {{flexible?:boolean}} [options] Wider K0-only Basic/Tool access.
 * @returns {{result:T,audit:object}}
 */
function withSharedFirstTurnBoxShake(execute,options={}){
  assert.equal(typeof execute,'function');
  const {SimpleTacticsAi}=require(path.join(BASE,'simple-bot/simple-tactics-ai'));
  const {PlayCardAction,PlayerType,SlotType}=
    require(path.join(BASE,'game/store/actions/play-card-action'));
  const {ResolvePromptAction}=
    require(path.join(BASE,'game/store/actions/resolve-prompt-action'));
  const {GamePhase}=require(path.join(BASE,'game/store/state/state'));
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const stages=new Map();
  const flexible=options.flexible===true;
  const audit={version:flexible?FLEX_VERSION:VERSION,
    flexibleOwnerAccessOptIn:flexible,
    symmetricBothSeats:true,originalDealsUnchanged:true,
    ownerVisibleK0Only:true,ownerDeckReadOnlyAfterNativeSearch:true,
    offers:[],events:[],failures:[],opponentContinuations:[],
    completeNativeEvolutions:0};
  const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  function chooseNative(prompt,names,state){
    const used=new Set();
    const cards=names.map(name=>{
      const i=prompt.cards.cards.findIndex((c,index)=>
        c.name===name&&!used.has(index));
      if(i<0)return null;
      used.add(i);
      return prompt.cards.cards[i];
    });
    if(cards.some(card=>card===null)||prompt.validate(cards,state)!==true)
      return null;
    return new ResolvePromptAction(prompt.id,cards);
  }
  function play(owner,name,target=board){
    const handIndex=owner.hand.cards.findIndex(card=>card.name===name);
    if(handIndex<0)return null;
    return new PlayCardAction(owner.id,handIndex,target);
  }
  function event(seat,state,detail){
    audit.events.push({seat,turn:state.turn,detail});
  }
  function fail(seat,state,flow,reason,details={}){
    audit.failures.push({seat,turn:state.turn,at:flow.stage,reason,
      ...details});
    stages.set(seat,{...flow,stage:'aborted'});
  }
  SimpleTacticsAi.prototype.decodeNextAction=function(state){
    const seat=state.players.findIndex(player=>player.id===this.client?.id);
    const pending=state.prompts.find(prompt=>prompt.result===undefined);
    if(seat<0)return original.call(this,state);
    const owner=state.players[seat];
    // The opposing bot is called after native Shake and turn transition.
    witnessOpponentTurn(stages,audit,state,pending,GamePhase);
    let flow=stages.get(seat);
    if(!flow&&state.activePlayer===seat&&
       state.phase===GamePhase.PLAYER_TURN&&!pending){
      const view={
        turn:state.turn,
        handNames:owner.hand.cards.map(card=>card.name),
        activeName:owner.active.getPokemonCard()?.name??null,
        benchNames:owner.bench.map(slot=>slot.getPokemonCard()?.name??null),
        itemLocked:owner.cannotPlayItemCards===true,
        toolLocked:owner.cannotPlayToolCards===true
      };
      const offer=flexible?
        require('./agent44-flexible-box-k0-plan.cjs')
          .flexibleFirstTurnBoxOffer(view):firstTurnBoxOffer(view);
      if(offer.eligible){
        flow={stage:'box-discard',toolName:offer.toolName,
          discardNames:offer.discardNames,firstTurn:state.turn,
          trubbishMode:offer.trubbishMode??'held-basic',
          basicSearcher:offer.basicSearcher??null,
          laterBasicSearcherPayment:offer.laterBasicSearcherPayment??0};
        stages.set(seat,flow);
        audit.offers.push({seat,turn:state.turn,
          handNames:view.handNames,discardNames:offer.discardNames,
          toolName:offer.toolName,trubbishMode:flow.trubbishMode,
          basicSearcher:flow.basicSearcher,
          laterBasicSearcherPayment:flow.laterBasicSearcherPayment});
        event(seat,state,'play native Secret Box from unmodified owner hand');
        return play(owner,'Secret Box');
      }
    }
    if(!flow||['complete','aborted'].includes(flow.stage)||
       state.activePlayer!==seat)
      return original.call(this,state);

    if(pending){
      if(pending.playerId!==owner.id)return original.call(this,state);
      if(flow.stage==='box-discard'&&
         pending.constructor?.name==='ChooseCardsPrompt'){
        const action=chooseNative(pending,flow.discardNames,state);
        if(!action){fail(seat,state,flow,'BOX_UPFRONT_NATIVE_REJECT');
          return original.call(this,state);}
        flow.stage='box-search';
        event(seat,state,'native three-card upfront discard accepted');
        return action;
      }
      if(flow.stage==='box-search'&&
         pending.constructor?.name==='ChooseCardsPrompt'){
        let planned;
        try{planned=chooseOwnedBoxFetchShake(pending,owner,state);}
        catch(error){fail(seat,state,flow,'K1_OWNER_SIGNATURE_'+error.message);
          return original.call(this,state);}
        const selected=planned.selectedNames;
        const toolFetched=flow.toolName===null;
        if(!planned.eligible||selected[0]!=='Boost Shake'||
           (toolFetched?
             selected.length!==2||!['Float Stone','Muscle Band']
               .includes(selected[1]):
             selected.length!==1)){
          fail(seat,state,flow,'UNAVAILABLE_SHAKE_TOOL_OR_GARBODOR_K1');
          return original.call(this,state);
        }
        if(toolFetched)flow.toolName=selected[1];
        flow.stage=flow.trubbishMode==='held-searcher'?
          'play-basic-searcher':flow.trubbishMode==='already-in-play'?
          'attach-tool':'bench-trubbish';
        event(seat,state,'native owner-deck Shake and Tool allocation accepted');
        return new ResolvePromptAction(pending.id,planned.selectedCards);
      }
      if(flow.stage==='basic-search-discard'&&
         pending.constructor?.name==='ChooseCardsPrompt'){
        const names=selectLaterBasicDiscardNames(
          owner.hand.cards.map(card=>card.name),
          flow.laterBasicSearcherPayment,flow.toolName);
        const action=names.length===flow.laterBasicSearcherPayment?
          chooseNative(pending,names,state):null;
        if(!action){
          fail(seat,state,flow,'LATER_BASIC_PAYMENT_REJECT',{
            sourceSearcher:flow.basicSearcher,
            requiredPayments:flow.laterBasicSearcherPayment,
            plannedPayments:names,
            nativePromptType:pending.constructor?.name??null,
            promptSourceMatchesOwnerHand:pending.cards===owner.hand,
            promptCardNames:pending.cards?.cards?.map(card=>card.name)??null,
            ownerHandNames:owner.hand.cards.map(card=>card.name),
            nativePromptMinCards:pending.options?.minCards??null,
            nativePromptMaxCards:pending.options?.maxCards??null
          });
          return original.call(this,state);
        }
        flow.stage='basic-search-target';
        event(seat,state,'native held Basic-search discard accepted');
        return action;
      }
      if(flow.stage==='basic-search-target'&&
         pending.constructor?.name==='ChooseCardsPrompt'){
        const action=chooseNative(pending,['Trubbish'],state);
        if(!action){
          fail(seat,state,flow,'TRUBBISH_OWNER_DECK_SEARCH_REJECT');
          return original.call(this,state);
        }
        flow.stage='bench-trubbish';
        event(seat,state,'native Basic-search Trubbish accepted');
        return action;
      }
      if(flow.stage==='shake-evolution-search'&&
         pending.constructor?.name==='ChooseCardsPrompt'){
        const action=chooseNative(pending,['Garbodor'],state);
        if(!action){fail(seat,state,flow,'EVOLUTION_SEARCH_REJECT');
          return original.call(this,state);}
        flow.stage='shake-evolution-target';
        event(seat,state,'native unprized Garbodor search accepted');
        return action;
      }
      if(flow.stage==='shake-evolution-target'&&
         pending.constructor?.name==='ChoosePokemonPrompt'){
        const slot=[owner.active,...owner.bench].find(s=>
          s.getPokemonCard()?.name==='Trubbish'&&
          s.tools.some(tool=>tool.name===flow.toolName));
        if(!slot||pending.validate([slot],state)!==true){
          fail(seat,state,flow,'SHAKE_TARGET_NATIVE_REJECT');
          return original.call(this,state);
        }
        flow.stage='complete';
        audit.completeNativeEvolutions++;
        event(seat,state,'native first-turn evolution target accepted');
        return new ResolvePromptAction(pending.id,[slot]);
      }
      return original.call(this,state);
    }
    if(flow.stage==='play-basic-searcher'){
      const action=play(owner,flow.basicSearcher);
      if(!action){
        fail(seat,state,flow,'HELD_BASIC_SEARCH_ITEM_MISSING');
        return original.call(this,state);
      }
      flow.stage='basic-search-discard';
      event(seat,state,'play held native Quick or Ultra Ball for Trubbish');
      return action;
    }
    if(flow.stage==='bench-trubbish'){
      const index=owner.bench.findIndex(slot=>!slot.getPokemonCard());
      const action=index<0?null:play(owner,'Trubbish',{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index});
      if(!action){fail(seat,state,flow,'TRUBBISH_BENCH_UNAVAILABLE');
        return original.call(this,state);}
      flow.stage='attach-tool';
      event(seat,state,'bench held Trubbish through native PlayCardAction');
      return action;
    }
    if(flow.stage==='attach-tool'){
      const index=owner.bench.findIndex(slot=>
        slot.getPokemonCard()?.name==='Trubbish'&&slot.tools.length===0);
      const active=owner.active.getPokemonCard()?.name==='Trubbish'&&
        owner.active.tools.length===0;
      const target=index>=0?{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index
      }:active?{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
      }:null;
      const action=target?play(owner,flow.toolName,target):null;
      if(!action){fail(seat,state,flow,'HELD_TOOL_ATTACHMENT_UNAVAILABLE');
        return original.call(this,state);}
      flow.stage='play-shake';
      event(seat,state,'attach held Tool through native PlayCardAction');
      return action;
    }
    if(flow.stage==='play-shake'){
      const action=play(owner,'Boost Shake');
      if(!action){fail(seat,state,flow,'SEARCHED_SHAKE_NOT_IN_HAND');
        return original.call(this,state);}
      flow.stage='shake-evolution-search';
      event(seat,state,'play Box-fetched Boost Shake');
      return action;
    }
    return original.call(this,state);
  };
  try{
    const result=execute();
    return {result,audit};
  }finally{
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

module.exports={VERSION,FLEX_VERSION,DISCARD_PRIORITY,
  firstTurnBoxOffer,selectLaterBasicDiscardNames,
  witnessOpponentTurn,withSharedFirstTurnBoxShake};
