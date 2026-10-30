'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {offerOranguruStarVip,PRINT}=
  require('./agent32-owner-oranguru-starvip-plan-offer.cjs');

const VERSION='agent1-owner-observable-starvip-native-continuation-v1';
const ROOT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} p */
const load=p=>require(path.join(ROOT,p));

/** @param {object} actor Current player's native state. @param {string} printing */
function handIndex(actor,printing){
  return actor.hand.cards.findIndex(card=>card.fullName===printing);
}

/** @param {object} actor */
function trubbishIndex(actor){
  return actor.bench.findIndex(slot=>
    slot.getPokemonCard()?.fullName===PRINT.trubbish&&slot.tools.length===0);
}

/**
 * A candidate first-turn owner plan must be explicitly admitted by a pure,
 * actor-observable external arbitration callback. Source identities, ranks,
 * seats, deck hashes, and seeds are deliberately absent from the proposer.
 * The adapter does not assert strategic dominance over the existing decoder.
 *
 * @template T
 * @param {()=>T} execute Actual pinned Store workload.
 * @param {{chooseOffer?:(view:object,offer:object)=>boolean}} [options]
 * @param {{SimpleTacticsAi?:Function,Store?:Function,GamePhase?:object,
 *   play?:object,ability?:object,prompt?:object,liveStore?:object}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerOranguruStarVipPlan(execute,options={},deps={}){
  assert.equal(typeof execute,'function');
  const chooseOffer=options.chooseOffer??(()=>false);
  assert.equal(typeof chooseOffer,'function');
  const {SimpleTacticsAi}=deps.SimpleTacticsAi?
    {SimpleTacticsAi:deps.SimpleTacticsAi}:load('simple-bot/simple-tactics-ai');
  const {Store}=deps.Store?{Store:deps.Store}:load('game/store/store');
  const {GamePhase}=deps.GamePhase?{GamePhase:deps.GamePhase}:
    load('game/store/state/state');
  const {PlayCardAction,PlayerType,SlotType}=deps.play??
    load('game/store/actions/play-card-action');
  const {UseAbilityAction}=deps.ability??load('game/store/actions/game-actions');
  const {ResolvePromptAction}=deps.prompt??
    load('game/store/actions/resolve-prompt-action');
  const decoder=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const dispatcher=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof decoder?.value,'function');
  assert.equal(typeof dispatcher?.value,'function');
  let liveStore=deps.liveStore??null;
  const chosen=new WeakMap();
  const planBySeat=new Map();
  const attemptedTurnBySeat=new Map();
  const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  const active={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0};
  const audit={
    version:VERSION,opportunities:0,plansChosen:0,offersDeclined:0,
    nativeAccepted:0,nativeRejected:0,ownerPromptAccepted:0,
    reachedEndTurn:0,completedEquippedGarbodor:0,
    failedOrAborted:0,abortReasons:{},
    bySeat:{0:{opportunities:0,chosen:0,accepted:0,completed:0},
      1:{opportunities:0,chosen:0,accepted:0,completed:0}},
    nonLiveDelegations:0,nonOwnerDelegations:0,
    events:[],originalOwnK0AtOffer:[],
    decisionInput:'detached authenticated actorObservation',
    deckSearchScope:'only acting owner pending native ChooseCardsPrompt',
    wholePolicyInformationSetSafe:false,
    competitiveQualifiedGames:0
  };
  /** @param {object} ctx @param {string} reason */
  const abort=(ctx,reason)=>{
    if(ctx.aborted)return;
    ctx.aborted=true;ctx.abortReason=reason;
    audit.failedOrAborted++;
    audit.abortReasons[reason]=(audit.abortReasons[reason]??0)+1;
    audit.events.push({seat:ctx.seat,turn:ctx.turn,kind:'abort',reason});
  };
  /** @param {object} state @param {object} owner @param {object} ctx */
  function next(state,owner,ctx){
    const pending=state.prompts.find(p=>p.result===undefined);
    const step=ctx.step;
    const allowOwnerDeckSearch=()=>pending?.constructor?.name===
      'ChooseCardsPrompt'&&pending.playerId===owner.id&&
      pending.cards===owner.deck;
    /** @param {string[]} wanted */
    function chooseDeck(wanted){
      if(!allowOwnerDeckSearch())return null;
      const pool=[...pending.cards.cards];
      const picked=[];
      for(const name of wanted){
        const i=pool.findIndex(card=>card.fullName===name);
        if(i<0)return null;
        picked.push(pool.splice(i,1)[0]);
      }
      return pending.validate(picked,state)?
        new ResolvePromptAction(pending.id,picked):null;
    }
    /** @param {string} name @param {object} target */
    function play(name,target){
      const i=handIndex(owner,name);
      return i<0?null:new PlayCardAction(owner.id,i,target);
    }
    if(pending){
      if(pending.playerId!==owner.id)return null;
      switch(step){
        case 1:return chooseDeck(ctx.missingTools);
        case 4:return chooseDeck([PRINT.vip]);
        case 6:return chooseDeck([PRINT.trubbish]);
        case 9:return chooseDeck([PRINT.garbodor]);
        case 10:{
          // Boost Shake evolves the Float Stone holder. The untooled
          // Trubbish selector used before attachment is wrong here.
          const i=owner.bench.findIndex(slot=>
            slot.getPokemonCard()?.fullName===PRINT.trubbish&&
            slot.tools.some(tool=>tool.fullName===PRINT.float));
          if(i<0||pending.constructor?.name!=='ChoosePokemonPrompt')
            return null;
          const target=owner.bench[i];
          return pending.validate([target],state)?
            new ResolvePromptAction(pending.id,[target]):null;
        }
        default:return null;
      }
    }
    switch(step){
      case 0:return new UseAbilityAction(owner.id,'Back Order',active);
      case 2:
        return owner.active.tools.length===0?
          play(PRINT.forest,active):null;
      case 3:
        return !owner.usedVSTAR&&owner.active.tools.some(card=>
          card.fullName===PRINT.forest)?
          new UseAbilityAction(owner.id,'Star Alchemy',active):null;
      case 5:return play(PRINT.vip,board);
      case 7:{
        const i=trubbishIndex(owner);
        return i<0?null:play(PRINT.float,{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:i});
      }
      case 8:{
        const attached=owner.bench.some(slot=>
          slot.getPokemonCard()?.fullName===PRINT.trubbish&&
          slot.tools.some(card=>card.fullName===PRINT.float));
        return attached?play(PRINT.shake,board):null;
      }
      default:return null;
    }
  }

  function decide(state){
    if(state!==liveStore?.state){
      audit.nonLiveDelegations++;
      return decoder.value.call(this,state);
    }
    const seat=state.players.findIndex(p=>p.id===this.client?.id);
    if(seat<0){
      audit.nonOwnerDelegations++;
      return decoder.value.call(this,state);
    }
    const owner=state.players[seat];
    const pending=state.prompts.find(p=>p.result===undefined);
    let ctx=planBySeat.get(seat)??null;
    if(!ctx&&state.activePlayer===seat&&
        state.phase===GamePhase.PLAYER_TURN&&!pending&&
        attemptedTurnBySeat.get(seat)!==state.turn){
      const view=actorObservation(state,seat);
      const offer=offerOranguruStarVip(view);
      if(offer.eligible){
        audit.opportunities++;audit.bySeat[seat].opportunities++;
        const approved=chooseOffer(view,offer)===true;
        if(approved){
          attemptedTurnBySeat.set(seat,state.turn);
          audit.plansChosen++;audit.bySeat[seat].chosen++;
          ctx={seat,ownerId:owner.id,turn:state.turn,
            step:offer.missingTools.length>0?0:2,
            missingTools:[...offer.missingTools],aborted:false};
          planBySeat.set(seat,ctx);
          const sourceHandSha256=createHash('sha256')
            .update(JSON.stringify(view.ownHand)).digest('hex');
          audit.originalOwnK0AtOffer.push({seat,turn:state.turn,
            handSha256:sourceHandSha256,
            bench:view.ownPublic.bench.map(slot=>slot?.printing??null)});
          audit.events.push({seat,turn:state.turn,kind:'chosen',
            firstStep:ctx.step,missingToolCount:ctx.missingTools.length});
        }else{
          audit.offersDeclined++;
        }
      }
    }
    if(!ctx||ctx.aborted)return decoder.value.call(this,state);
    if(ctx.ownerId!==owner.id){
      abort(ctx,'owner-id-changed');
      return decoder.value.call(this,state);
    }
    if(ctx.step===11){
      const equipped=owner.bench.some(slot=>
        slot.getPokemonCard()?.fullName===PRINT.garbodor&&
        slot.tools.some(tool=>tool.fullName===PRINT.float));
      if(equipped&&owner.usedVSTAR===true){
        audit.completedEquippedGarbodor++;
        audit.bySeat[seat].completed++;
      }else{
        abort(ctx,'end-turn-board-witness-not-established');
      }
      audit.events.push({seat,turn:state.turn,kind:'end-turn-witness',
        equippedGarbodor:equipped,usedVSTAR:owner.usedVSTAR===true});
      planBySeat.delete(seat);
      return decoder.value.call(this,state);
    }
    // A real owner prompt may occur even when the owner is not the active
    // physical seat. Never allow a different player's private selection.
    if(pending&&pending.playerId!==owner.id)
      return decoder.value.call(this,state);
    // Store presents native WaitPrompt before the actual owner deck
    // ChooseCardsPrompt for Back Order, Star Alchemy and Boost Shake.
    // It must be settled by the baseline bot while preserving this plan's
    // unchanged next stage; otherwise an actual K1 owner search is skipped.
    if(pending?.constructor?.name==='WaitPrompt'){
      audit.events.push({seat,turn:state.turn,kind:'native-wait-delegated',
        stage:ctx.step});
      return decoder.value.call(this,state);
    }
    if(!pending&&(state.activePlayer!==seat||
        state.phase!==GamePhase.PLAYER_TURN)){
      if(state.turn>ctx.turn)abort(ctx,'turn-ended-before-plan-completed');
      return decoder.value.call(this,state);
    }
    const action=next(state,owner,ctx);
    if(!action){
      if(!pending||pending.playerId===owner.id){
        audit.events.push({seat,turn:state.turn,kind:'missing-next-diagnostic',
          stage:ctx.step,pendingType:pending?.constructor?.name??null,
          pendingOwnedByActor:pending?.playerId===owner.id,
          pendingIsOwnerDeck:pending?.cards===owner.deck,
          pendingSourceCount:pending?.cards?.cards?.length??null,
          expectedPrintings:ctx.step===1?[...ctx.missingTools]:
            ctx.step===4?[PRINT.vip]:ctx.step===6?[PRINT.trubbish]:
            ctx.step===9?[PRINT.garbodor]:[],
          knownK1Available:pending?.cards===owner.deck?
            pending.cards.cards.filter(card=>
              [PRINT.forest,PRINT.float,PRINT.vip,PRINT.trubbish,
                PRINT.garbodor].includes(card.fullName))
              .map(card=>card.fullName):null});
        abort(ctx,'missing-legitimate-next-action-at-stage-'+ctx.step);
        planBySeat.delete(seat);
      }
      return decoder.value.call(this,state);
    }
    // The authentic Store.dispatch is the move legality authority; the
    // SimpleTacticsAi simulator probe can reject legal multi-step roots and
    // cannot evaluate unresolved prompts. The K1 branch already validated
    // owner-only search/target prompts. Record stage advancement only after
    // the real Store accepts the proposed action below.
    chosen.set(action,{seat,step:ctx.step,ctx,prompt:Boolean(pending)});
    return action;
  }

  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&liveStore===null)
      liveStore=this;
    const tracked=this===liveStore?chosen.get(action):null;
    try{
      const value=dispatcher.value.call(this,action,...args);
      if(tracked){
        const {seat,ctx,step,prompt}=tracked;
        assert.equal(ctx.step,step);
        ctx.step=step+1;
        audit.nativeAccepted++;audit.bySeat[seat].accepted++;
        if(prompt)audit.ownerPromptAccepted++;
        if(ctx.step===11)audit.reachedEndTurn++;
        audit.events.push({seat,turn:ctx.turn,kind:'accepted',
          stage:step,action:action.constructor.name,
          prompt});
      }
      return value;
    }catch(error){
      if(tracked){
        audit.nativeRejected++;
        abort(tracked.ctx,'native-dispatch-rejected-at-stage-'+tracked.step);
      }
      throw error;
    }
  }

  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...decoder,value:decide});
  Object.defineProperty(Store.prototype,'dispatch',{
    ...dispatcher,value:dispatch});
  try{
    const result=execute();
    return {result,audit};
  }catch(error){
    if(error&&typeof error==='object'){
      error.agent1OwnerPlanDiagnostic={
        opportunities:audit.opportunities,chosen:audit.plansChosen,
        accepted:audit.nativeAccepted,promptAccepted:audit.ownerPromptAccepted,
        abortReasons:audit.abortReasons,
        stages:[...planBySeat.entries()].map(([seat,ctx])=>({seat,
          turn:ctx.turn,step:ctx.step,aborted:ctx.aborted})),
        events:audit.events.slice(0,18)
      };
    }
    throw error;
  }finally{
    assert.equal(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',dispatcher);
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,decide);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',decoder);
  }
}
module.exports={VERSION,handIndex,trubbishIndex,
  withOwnerOranguruStarVipPlan};
