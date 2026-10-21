'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');

const VERSION='agent5-articuno-compressor-powerglass-native-development-v1';
const ARTICUNO='Galarian Articuno V CRE';
const BASIC='Psychic Energy MEE';
const COMPRESSOR='Battle Compressor PHF';
const POWERGLASS='Powerglass SFA';

/**
 * Decide from the immutable actor hand and public board. Never inspect the
 * current deck, Prize cards, opponent hand or other unlicensed identities.
 * Min-turn is a preregistered historical fork boundary, not a strength rule.
 * @param {object} view Detached actor observation.
 * @param {number} minTurn First eligible global turn.
 * @returns {{kind:string,printing:string,handIndex:number}|null}
 */
function chooseRoot(view,minTurn=34){
  if(view.decisionKind!=='owner-root'||view.globalTurn<minTurn)return null;
  const active=view.ownPublic?.active;
  if(active?.printing!==ARTICUNO||(active.tools??[]).length>0)return null;
  if(!(active.energies??[]).includes(BASIC))return null;
  const h=view.ownHand,disc=view.ownPublic?.discard??[];
  const glass=h.indexOf(POWERGLASS);
  if(glass<0)return null;
  const discPsychic=disc.filter(c=>c===BASIC).length;
  if(discPsychic>0&&view.ownTurnResources.toolPlayLocked!==true){
    return {kind:'tool',printing:POWERGLASS,handIndex:glass};
  }
  const comp=h.indexOf(COMPRESSOR);
  if(discPsychic===0&&comp>=0&&
    view.ownTurnResources.itemPlayLocked!==true){
    return {kind:'compressor',printing:COMPRESSOR,handIndex:comp};
  }
  return null;
}

/**
 * Search is offered only inside the native, owner-authenticated Compressor
 * ChooseCardsPrompt, at which point owner-deck identities are legally visible.
 * @param {object} prompt Genuine ChooseCardsPrompt with owner deck source.
 * @param {object} state Genuine native Store state.
 * @returns {object[]|null} Selected physical cards or null.
 */
function chooseOwnerCompressorCards(prompt,state){
  const max=prompt.options?.max??0;
  const cards=prompt.cards.cards.filter(c=>c.fullName===BASIC)
    .slice(0,Math.min(2,max));
  return cards.length>0&&prompt.validate(cards,state)?cards:null;
}

/**
 * One reversible candidate-seat-only intervention. The original Store judges
 * every action and supplied prompts. Other seats, clones and all unsupported
 * action types continue through their existing policy.
 * @template T
 * @param {0|1} seat Candidate physical seat.
 * @param {()=>T} execute Complete existing synchronous game.
 * @param {{minTurn?:number,SimpleTacticsAi?:Function,Store?:Function,
 *   PlayCardAction?:Function,ResolvePromptAction?:Function,
 *   GamePhase?:object,PlayerType?:object,SlotType?:object}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withArticunoPowerglass(seat,execute,deps={}){
  assert.ok(seat===0||seat===1);
  assert.equal(typeof execute,'function');
  const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const pinned=p=>require(path.join(root,p));
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    pinned('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??pinned('game/store/store').Store;
  const PlayCardAction=deps.PlayCardAction??
    pinned('game/store/actions/play-card-action').PlayCardAction;
  const ResolvePromptAction=deps.ResolvePromptAction??
    pinned('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const GamePhase=deps.GamePhase??pinned('game/store/state/state').GamePhase;
  const actionEnums=deps.PlayerType&&deps.SlotType?deps:
    pinned('game/store/actions/play-card-action');
  const PlayerType=deps.PlayerType??actionEnums.PlayerType;
  const SlotType=deps.SlotType??actionEnums.SlotType;
  const EnergyType=deps.EnergyType??
    pinned('game/store/card/card-types').EnergyType;

  const original=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const dispatchOriginal=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  assert.equal(typeof dispatchOriginal?.value,'function');
  let liveStore=null;
  const selected=new WeakMap();
  const audit={version:VERSION,seat,minTurn:deps.minTurn??34,
    nativeRoots:0,searchPrompts:0,toolRoots:0,energyPrompts:0,
    accepted:0,physicalConfirmed:0,failedPhysical:0,
    genericFallbacks:0,speculativeFallbacks:0,
    events:[],competitiveGameQualified:false};

  /** @param {object} item Bounded event with no deck/Prize/opponent secrets. */
  function log(item){if(audit.events.length<64)audit.events.push(item);}
  /** @param {object} state @returns {object|null} */
  function actorState(state){
    const player=state.players?.[seat];
    if(!player||this.client?.id!==player.id)return null;
    return player;
  }
  function decoded(state,...args){
    if(state!==liveStore?.state){
      audit.speculativeFallbacks++;
      return original.value.call(this,state,...args);
    }
    const owner=actorState.call(this,state);
    if(!owner){
      audit.genericFallbacks++;
      return original.value.call(this,state,...args);
    }
    const pending=state.prompts?.find(p=>p.result===undefined);
    const active=owner.active?.getPokemonCard()?.fullName;
    // An unresolved native owner-deck search alone grants physical deck access.
    if(pending&&pending.constructor?.name==='ChooseCardsPrompt'&&
      pending.player===owner&&pending.playerId===owner.id&&
      pending.cards===owner.deck&&
      owner.supporter.cards.some(c=>c.fullName===COMPRESSOR)&&
      state.turn>=audit.minTurn){
      const chosen=chooseOwnerCompressorCards(pending,state);
      if(chosen){
        const action=new ResolvePromptAction(pending.id,chosen);
        selected.set(action,{kind:'search',turn:state.turn,seat,
          chosen:chosen.map(c=>c.fullName),cards:chosen});
        audit.searchPrompts++;
        return action;
      }
    }
    if(pending&&pending.constructor?.name==='AttachEnergyPrompt'&&
      pending.playerId===owner.id&&
      pending.getPerspectivePlayerId?.()===owner.id&&
      pending.cardList===owner.discard&&
      active===ARTICUNO&&
      owner.active.tools.some(c=>c.fullName===POWERGLASS)&&
      state.turn>=audit.minTurn){
      const eligible=new Set(pending.cardList.filter(pending.filter));
      const card=pending.cardList.cards.find(c=>c.fullName===BASIC&&
        c.energyType===EnergyType.BASIC&&eligible.has(c));
      if(card){
        const chosen=[{card,to:{player:PlayerType.BOTTOM_PLAYER,
          slot:SlotType.ACTIVE,index:0}}];
        if(pending.validate(chosen,state)){
          const action=new ResolvePromptAction(pending.id,chosen);
          selected.set(action,{kind:'endturn-energy',turn:state.turn,
            seat,printing:card.fullName,card});
          audit.energyPrompts++;
          return action;
        }
      }
    }
    if(pending||state.phase!==GamePhase.PLAYER_TURN||
      state.activePlayer!==seat){
      audit.genericFallbacks++;
      return original.value.call(this,state,...args);
    }
    const view=actorObservation(state,seat);
    const choice=chooseRoot(view,audit.minTurn);
    if(!choice){
      audit.genericFallbacks++;
      return original.value.call(this,state,...args);
    }
    assert.equal(owner.hand.cards[choice.handIndex]?.fullName,
      choice.printing,'Owner hand changed after detached decision');
    const target=choice.kind==='compressor'?
      {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}:
      {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0};
    const action=new PlayCardAction(owner.id,choice.handIndex,target);
    selected.set(action,{kind:choice.kind,turn:state.turn,seat,
      printing:choice.printing});
    audit.nativeRoots++;
    if(choice.kind==='tool')audit.toolRoots++;
    return action;
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&!liveStore)liveStore=this;
    const event=this===liveStore?selected.get(action):null;
    if(!event)return dispatchOriginal.value.apply(this,[action,...args]);
    const owner=this.state.players[seat];
    const before={hand:owner.hand.cards.length,
      deck:owner.deck.cards.length,
      discardPsychic:owner.discard.cards.filter(c=>c.fullName===BASIC).length,
      activePsychic:owner.active.energies.cards.filter(c=>
        c.fullName===BASIC).length,
      activeTool:owner.active.tools.some(c=>c.fullName===POWERGLASS)};
    try{
      const result=dispatchOriginal.value.apply(this,[action,...args]);
      audit.accepted++;
      const after={hand:owner.hand.cards.length,
        deck:owner.deck.cards.length,
        discardPsychic:owner.discard.cards.filter(c=>c.fullName===BASIC).length,
        activePsychic:owner.active.energies.cards.filter(c=>
          c.fullName===BASIC).length,
        activeTool:owner.active.tools.some(c=>c.fullName===POWERGLASS)};
      const physicallyConfirmed=event.kind==='compressor'?
        before.hand>after.hand:
        event.kind==='search'?
          after.deck<before.deck&&after.discardPsychic>before.discardPsychic:
        event.kind==='tool'?
          !before.activeTool&&after.activeTool:
          after.activePsychic>before.activePsychic;
      if(physicallyConfirmed)audit.physicalConfirmed++;
      else audit.failedPhysical++;
      log({kind:event.kind,turn:event.turn,
        ...(event.chosen?{selected:event.chosen}:{}),
        physicallyConfirmed,before,after});
      return result;
    }catch(error){
      log({kind:event.kind,turn:event.turn,error:String(error)});
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...original,value:decoded});
  Object.defineProperty(Store.prototype,'dispatch',{
    ...dispatchOriginal,value:dispatch});
  try{
    const result=execute();
    return {result,audit};
  }catch(error){
    error.agent5ArticunoPowerglassAudit=audit;
    throw error;
  }finally{
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',original);
    Object.defineProperty(Store.prototype,'dispatch',dispatchOriginal);
  }
}

module.exports={VERSION,ARTICUNO,BASIC,COMPRESSOR,POWERGLASS,
  chooseRoot,chooseOwnerCompressorCards,withArticunoPowerglass};
