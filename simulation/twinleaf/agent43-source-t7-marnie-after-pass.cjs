'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');

const VERSION='agent43-source-t7-held-marnie-after-pass-v1';
const PRINTING='Marnie SSH';

/**
 * One predeclared original-Store root counterfactual: the source owner
 * plays its genuinely held Marnie rather than passing behind an empty
 * Active Garbodor on the original rank11 source-first Rope deal.
 * The action decision reads only actorObservation for the source player.
 *
 * @param {object} view Detached source-owned observer at a real root.
 * @returns {{handIndex:number,printing:string}|null}
 */
function chooseSourceMarnie(view){
  if(view?.decisionKind!=='owner-root'||view.actorSeat!==0||
     view.globalTurn!==7)return null;
  const own=view.ownPublic,r=view.ownTurnResources;
  if(!r||r.supporterPlayLocked===true||
     own?.publicTurnRestrictions?.supporterPlayLocked===true||
     (Number.isInteger(r.supporterPlayedTurn)&&
       r.supporterPlayedTurn>0)||
     !(own?.deckCount>0)||
     !own.active||own.active.printing!=='Garbodor BKP'||
     !Array.isArray(own.active.energies)||
     own.active.energies.length!==0||
     !Array.isArray(own.bench)||
     !own.bench.some(p=>p&&Array.isArray(p.energies)&&
       p.energies.length>0))return null;
  const handIndex=view.ownHand.indexOf(PRINTING);
  return handIndex<0?null:{handIndex,printing:PRINTING};
}

/**
 * T9 Guzma extension to the genuinely held post-Marnie source root.
 * Called only after a native Pass by the source; the Store validates all
 * targeting and prompt rules. No opponent-concealed zones are considered.
 * @param {object} view Authenticated source-only owner-root observation.
 * @returns {{handIndex:number,printing:string}|null}
 */
function chooseSourceGuzmaT9(view){
  if(view?.decisionKind!=='owner-root'||view.actorSeat!==0||
     view.globalTurn!==9)return null;
  const own=view.ownPublic,r=view.ownTurnResources;
  if(!r||r.supporterPlayLocked===true||
     own?.publicTurnRestrictions?.supporterPlayLocked===true||
     r.supporterPlayedTurn!==0||
     own.active?.printing!=='Garbodor BKP'||
     !Array.isArray(own.active.tools)||
     own.active.tools.length>0||
     !Array.isArray(own.bench)||
     !own.bench.some(p=>p?.printing==='Oranguru V ASR'&&
       Array.isArray(p.energies)&&p.energies.length>0)||
     !Array.isArray(view.opponentPublic?.bench)||
     !view.opponentPublic.bench.some(Boolean))return null;
  const handIndex=view.ownHand.indexOf('Guzma BUS');
  return handIndex<0?null:{handIndex,printing:'Guzma BUS'};
}

/**
 * @template T
 * @param {()=>T} execute Existing exact-match synchronous runner.
 * @param {{SimpleTacticsAi?:Function,Store?:Function,headless?:object,
 *   cardActions?:object,observe?:Function}} [deps] Test seams.
 * @returns {{result:T,audit:object}}
 */
function withSourceMarnieAfterPass(execute,deps={}){
  assert.equal(typeof execute,'function');
  const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Bot=deps.SimpleTacticsAi??
    require(path.join(root,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??
    require(path.join(root,'game/store/store')).Store;
  const {PlayCardAction,PlayerType,SlotType}=deps.cardActions??
    require(path.join(root,'game/store/actions/play-card-action'));
  const observe=deps.observe??actorObservation;
  const headless=deps.headless??require('./headless.cjs');
  const originalRun=headless.runMatch;
  assert.equal(typeof originalRun,'function');
  const selected=new WeakMap();
  const audit={
    version:VERSION,liveMatchCalls:0,passRootsAtSourceT7:0,
    eligibleMarniePasses:0,StoreAccepted:0,StoreRejected:0,
    originalOtherActionsPreserved:0,firstProposal:null,postDispatch:null,
    candidateConcealedCardsRead:false,competitiveQualifiedGames:0,
    postMarnieOwnerDecisionRoots:[],
    sourceOwnerReadOnlyObservation:true,
    guzmaT9Proposals:0,guzmaT9Accepted:0,guzmaT9Rejected:0,
    guzmaPromptResponses:[]
  };
  function wrappedRun(request){
    audit.liveMatchCalls++;
    const botProto=Bot.prototype,storeProto=Store.prototype;
    const bot=Object.getOwnPropertyDescriptor(botProto,'decodeNextAction');
    const store=Object.getOwnPropertyDescriptor(storeProto,'dispatch');
    assert.equal(typeof bot?.value,'function');
    assert.equal(typeof store?.value,'function');
    function decide(state,...args){
      const original=bot.value.apply(this,[state,...args]);
      const actor=state.players?.[0];
      if(audit.StoreAccepted>0&&state.turn>=7&&state.turn<=13&&
         state.activePlayer===0&&actor?.id===this.client?.id&&
         !state.prompts?.some(p=>p.result===undefined)&&
         audit.postMarnieOwnerDecisionRoots.length<12){
        const owned=observe(state,0);
        audit.postMarnieOwnerDecisionRoots.push({
          globalTurn:owned.globalTurn,
          sourceOwnedHand:owned.ownHand.slice(),
          sourceOwnDeckCount:owned.ownPublic.deckCount,
          sourceSupporterPlayedTurn:owned.ownTurnResources.supporterPlayedTurn,
          active:{
            printing:owned.ownPublic.active?.printing??null,
            energies:owned.ownPublic.active?.energies??[],
            tools:owned.ownPublic.active?.tools??[]
          },
          bench:owned.ownPublic.bench.filter(Boolean).map(p=>({
            printing:p.printing,energies:p.energies,tools:p.tools
          })),
          originalBotAction:original?.constructor?.name??null,
          observationPassedToPolicy:false
        });
      }
      if(deps.guzmaT9===true&&audit.StoreAccepted>0&&
         state.turn===9&&state.activePlayer===0&&
         actor?.id===this.client?.id&&
         !state.prompts?.some(p=>p.result===undefined)&&
         original?.constructor?.name==='PassTurnAction'){
        const ownerView=observe(state,0);
        const guzma=chooseSourceGuzmaT9(ownerView);
        if(guzma){
          const action=new PlayCardAction(actor.id,guzma.handIndex,{
            player:PlayerType.ANY,slot:SlotType.BOARD,index:0
          });
          selected.set(action,{kind:'guzma-t9',sourceTurn:9,
            handIndex:guzma.handIndex,printing:guzma.printing,
            previous:'PassTurnAction'});
          audit.guzmaT9Proposals++;
          return action;
        }
      }
      if(state.turn!==7||state.activePlayer!==0||
         actor?.id!==this.client?.id||
         state.prompts?.some(p=>p.result===undefined)||
         original?.constructor?.name!=='PassTurnAction'){
        audit.originalOtherActionsPreserved++;
        return original;
      }
      audit.passRootsAtSourceT7++;
      const view=observe(state,0);
      const proposal=chooseSourceMarnie(view);
      if(!proposal)return original;
      const action=new PlayCardAction(actor.id,proposal.handIndex,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      });
      selected.set(action,{kind:'marnie-t7',sourceTurn:7,handIndex:proposal.handIndex,
        printing:proposal.printing,previous:'PassTurnAction'});
      audit.eligibleMarniePasses++;
      audit.firstProposal??={
        sourceTurn:7,printing:proposal.printing,
        sourceOwnedHandIndex:proposal.handIndex,
        printedActive:view.ownPublic.active.printing,
        sourceHandLength:view.ownHand.length,
        sourceSupporterPlayedTurn:view.ownTurnResources.supporterPlayedTurn
      };
      return action;
    }
    function dispatch(action,...args){
      const proposed=selected.get(action);
      if(!proposed){
        const pending=this.state?.prompts?.find(p=>p.result===undefined);
        const capture=deps.guzmaT9===true&&audit.guzmaT9Accepted>0&&
          this.state?.turn===9&&
          action?.constructor?.name==='ResolvePromptAction'&&
          pending?.constructor?.name==='ChoosePokemonPrompt';
        const result=store.value.apply(this,[action,...args]);
        if(capture&&audit.guzmaPromptResponses.length<6){
          audit.guzmaPromptResponses.push({
            promptOwnerId:pending.playerId,
            choiceResultType:action.constructor.name,
            sourceActive:this.state.players[0].active
              .getPokemonCard?.()?.fullName??null,
            candidateActive:this.state.players[1].active
              .getPokemonCard?.()?.fullName??null,
            nativeAccepted:true
          });
        }
        return result;
      }
      try{
        const outcome=store.value.apply(this,[action,...args]);
        audit.StoreAccepted++;
        if(proposed.kind==='guzma-t9')audit.guzmaT9Accepted++;
        audit.postDispatch={
          ...proposed,
          sourceHandSize:this.state?.players?.[0]?.hand?.cards?.length??null,
          actionType:action.constructor.name,
          nativeDispatchReturned:true
        };
        return outcome;
      }catch(error){
        audit.StoreRejected++;
        if(proposed.kind==='guzma-t9')audit.guzmaT9Rejected++;
        audit.postDispatch={...proposed,error:String(error?.message??error)};
        throw error;
      }
    }
    Object.defineProperty(botProto,'decodeNextAction',{...bot,value:decide});
    Object.defineProperty(storeProto,'dispatch',{...store,value:dispatch});
    try{return originalRun.call(this,request);}
    finally{
      const owned=botProto.decodeNextAction===decide&&
        storeProto.dispatch===dispatch;
      Object.defineProperty(storeProto,'dispatch',store);
      Object.defineProperty(botProto,'decodeNextAction',bot);
      assert.ok(owned,'Source Marnie hooks lost ownership');
    }
  }
  headless.runMatch=wrappedRun;
  try{return {result:execute(),audit};}
  finally{
    const owned=headless.runMatch===wrappedRun;
    headless.runMatch=originalRun;
    assert.ok(owned,'Source Marnie headless hook lost ownership');
  }
}

module.exports={VERSION,PRINTING,chooseSourceMarnie,
  chooseSourceGuzmaT9,withSourceMarnieAfterPass};
