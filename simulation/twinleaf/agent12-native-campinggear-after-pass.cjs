'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {actorObservation} = require('./actor-observation-contract.cjs');

const VERSION = 'agent12-original-owner-campinggear-after-pass-v1';
const GEAR = 'Camping Gear BST';
const TARGET_ORDER = Object.freeze([
  'Double Colorless Energy SUM','Guzma & Hala CEC','Speed Lightning Energy RCL'
]);

/**
 * Owner-visible, native-neutral Pass alternative for a known printed Item.
 * Search contents are deliberately unavailable until a real original Store
 * owner-deck prompt. No side is selected by access to unseen deck/Prizes.
 * @param {object} view The detached authenticated actor-root observation.
 * @returns {object|null} A candidate, not a native legality certificate.
 */
function chooseCampingGearBeforePass(view){
  assert.equal(view?.decisionKind,'owner-root');
  const r=view.ownTurnResources,publicBoard=view.ownPublic;
  if(view.globalTurn!==1||
     r.itemPlayLocked===true||
     publicBoard.publicTurnRestrictions?.itemPlayLocked===true||
     publicBoard.deckCount<1)return null;
  const handIndex=view.ownHand.indexOf(GEAR);
  return handIndex<0?null:
    {kind:'play-camping-gear',handIndex,printing:GEAR,
      terminalIfSettled:true};
}

/**
 * Select exactly ONE actual own-deck card for printed Camping Gear.
 * Search order is a declared reproducible developmental heuristic, not
 * competitive optimization. Test the native prompt validator before use.
 *
 * @param {object} prompt The real, owner-authorized deck ChooseCardsPrompt.
 * @param {object} liveState Original Store state for native validation only.
 * @returns {object} Actual physical original Store card reference.
 */
function chooseActualCampingGearCard(prompt,liveState){
  assert.equal(prompt.constructor?.name,'ChooseCardsPrompt');
  const cards=[...prompt.cards.cards].sort((a,b)=>{
    const ia=TARGET_ORDER.indexOf(a.fullName),ib=TARGET_ORDER.indexOf(b.fullName);
    const ra=ia<0?TARGET_ORDER.length:ia;
    const rb=ib<0?TARGET_ORDER.length:ib;
    return ra-rb||a.fullName.localeCompare(b.fullName);
  });
  const selected=cards.find(card=>prompt.validate([card],liveState)===true);
  assert.ok(selected,'Exact printed unrestricted owner-deck prompt has no legal one-card selection');
  return selected;
}

/**
 * Source-seat-only, original-Store, reversible native intervention installed
 * INSIDE withCanonicalActorOnlyPolicy() so it can observe a chosen real Pass.
 * Never dereference an opponent private zone, and never modify a decklist.
 * The native Store, not this module, decides whether an Item can be played
 * and whether its deferred search/turn end resolves.
 *
 * @template T
 * @param {()=>T} run Existing pinned source-dealt native run.
 * @param {{sourceSeat:0|1,observe?:Function,deps?:object}} options
 * @returns {{result:T,audit:object}}
 */
function withNativeCampingGearAfterPass(run,options){
  assert.equal(typeof run,'function');
  assert.ok(options?.sourceSeat===0||options?.sourceSeat===1);
  const sourceSeat=options.sourceSeat;
  const engine=n=>require(path.join(__dirname,
    '../../vendor/twinleaf/ptcg-server/output',n));
  const deps=options.deps??{};
  const SimpleTacticsAi=deps.SimpleTacticsAi??engine('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??engine('game/store/store').Store;
  const play=deps.play??engine('game/store/actions/play-card-action');
  const ResolvePromptAction=deps.ResolvePromptAction??
    engine('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const GamePhase=deps.GamePhase??engine('game/store/state/state').GamePhase;
  const observe=options.observe??actorObservation;
  const beforeDecode=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const beforeDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof beforeDecode?.value,'function');
  assert.equal(typeof beforeDispatch?.value,'function');
  let nativeStore=null;
  const awaiting=new Map();
  const marked=new WeakMap();
  const audit={version:VERSION,sourceSeat,liveStoreSeen:false,
    originalPassesOnSourceFirst:0,heldGearAtPass:0,
    originalPassOtherActionCount:0,
    proposedRoot:0,nativeLegalProposed:0,
    nativeRejectedAtRoot:0,nativePlayAccepted:0,
    ownerSearchPromptSeen:0,ownerSearchProposed:0,
    ownerSearchAccepted:0,ownerSearchRejected:0,
    searchNativePostconditionConfirmed:0,
    selectedPrintings:[],events:[],
    competitiveQualifiedGames:0,
    paperEffectCertified:false,
    directOpponentResponseCertified:false};
  const add=event=>{
    if(audit.events.length<24)audit.events.push(event);
  };
  function decision(state){
    if(state!==nativeStore?.state||
       state.phase!==GamePhase.PLAYER_TURN||
       state.activePlayer!==sourceSeat)return beforeDecode.value.call(this,state);
    const source=state.players[sourceSeat];
    if(this.client?.id!==source?.id)return beforeDecode.value.call(this,state);
    const pending=state.prompts?.find(x=>x.result===undefined);
    const wait=awaiting.get(source.id);
    if(wait&&pending?.constructor?.name==='ChooseCardsPrompt'&&
       pending.playerId===source.id&&pending.cards===source.deck){
      audit.ownerSearchPromptSeen++;
      const card=chooseActualCampingGearCard(pending,state);
      const action=new ResolvePromptAction(pending.id,[card]);
      marked.set(action,{kind:'owner-gear-search',seat:sourceSeat,
        ownerId:source.id,printing:card.fullName,physicalCard:card,
        turn:state.turn});
      audit.ownerSearchProposed++;
      return action;
    }
    if(pending)return beforeDecode.value.call(this,state);
    const original=beforeDecode.value.call(this,state);
    if(original?.constructor?.name!=='PassTurnAction'||
       state.turn!==1)return original;
    audit.originalPassesOnSourceFirst++;
    const view=observe(state,sourceSeat);
    if(view.ownHand.includes(GEAR))audit.heldGearAtPass++;
    const proposal=chooseCampingGearBeforePass(view);
    if(!proposal)return original;
    assert.equal(source.hand.cards[proposal.handIndex].fullName,GEAR);
    const replacement=new play.PlayCardAction(source.id,proposal.handIndex,{
      player:play.PlayerType.ANY,slot:play.SlotType.BOARD,index:0});
    audit.proposedRoot++;
    const nativeLegal=this.isValidAction(state,replacement);
    add({kind:'source-owner-campinggear-vs-pass',turn:state.turn,
      actorSeat:sourceSeat,printing:proposal.printing,nativeLegal});
    if(!nativeLegal){
      audit.nativeRejectedAtRoot++;
      return original;
    }
    audit.nativeLegalProposed++;
    marked.set(replacement,{kind:'owner-gear-play',seat:sourceSeat,
      ownerId:source.id,turn:state.turn,handIndex:proposal.handIndex});
    return replacement;
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&!nativeStore){
      nativeStore=this;
      audit.liveStoreSeen=true;
    }
    const markedAction=this===nativeStore?marked.get(action):null;
    if(!markedAction)return beforeDispatch.value.apply(this,[action,...args]);
    const source=this.state.players[markedAction.seat];
    const deckBefore=source.deck.cards.length;
    const handBefore=source.hand.cards.length;
    try{
      const result=beforeDispatch.value.apply(this,[action,...args]);
      if(markedAction.kind==='owner-gear-play'){
        audit.nativePlayAccepted++;
        awaiting.set(source.id,{turn:markedAction.turn});
        add({kind:'native-play-accepted',seat:sourceSeat,
          turn:markedAction.turn,deckBefore,handBefore,
          deckAfter:source.deck.cards.length,
          handAfter:source.hand.cards.length});
      }else{
        audit.ownerSearchAccepted++;
        audit.selectedPrintings.push(markedAction.printing);
        const physicalOwnerHasCard=source.hand.cards.includes(
          markedAction.physicalCard);
        const physicalDeckLostCard=!source.deck.cards.includes(
          markedAction.physicalCard);
        if(physicalOwnerHasCard&&physicalDeckLostCard)
          audit.searchNativePostconditionConfirmed++;
        add({kind:'native-owner-search-accepted',seat:sourceSeat,
          turn:markedAction.turn,selected:markedAction.printing,
          physicalOwnerHasCard,physicalDeckLostCard,
          deckBefore,deckAfter:source.deck.cards.length,
          handBefore,handAfter:source.hand.cards.length});
        awaiting.delete(source.id);
      }
      return result;
    }catch(error){
      if(markedAction.kind==='owner-gear-play')audit.nativeRejectedAtRoot++;
      else audit.ownerSearchRejected++;
      add({kind:'native-gear-rejected',error:String(error.message),
        action:markedAction.kind,turn:markedAction.turn});
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...beforeDecode,value:decision});
  Object.defineProperty(Store.prototype,'dispatch',{
    ...beforeDispatch,value:dispatch});
  try{
    return {result:run(),audit};
  }finally{
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,decision);
    assert.equal(Store.prototype.dispatch,dispatch);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',beforeDecode);
    Object.defineProperty(Store.prototype,'dispatch',beforeDispatch);
  }
}

module.exports={VERSION,GEAR,TARGET_ORDER,chooseCampingGearBeforePass,
  chooseActualCampingGearCard,withNativeCampingGearAfterPass};
