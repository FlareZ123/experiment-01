'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');

const VERSION='agent29-rank9-owner-compressor-after-pass-v1';
const LATE_VERSION='agent29-rank9-owner-compressor-after-pass-anyturn-v2';
const ITEM='Battle Compressor PHF';
const ENERGY_PREFIXES=['Prism Energy ','Darkness Energy ','Telepath [P] Energy ',
  'Telepathic Psychic Energy '];
/** @param {string} printing */
const sourceEnergy=printing=>ENERGY_PREFIXES.some(p=>printing.startsWith(p));
/** @param {object|null} slot */
const sourceMega=slot=>slot?.name==='Mega Absol ex';
/** @param {object|null} slot */
const sourceVoltorb=slot=>slot?.name==='Voltorb'||
  slot?.name==='Electrode-GX';

/**
 * Deliberately narrow original rank9 owner-only preparation line, considered
 * AFTER the underlying actor has selected Pass. Only own exact hand and
 * public board/discard are consulted. Own deck contents remain concealed.
 *
 * @param {object} view Detached actorObservation, not live native State.
 * @param {{maxGlobalTurn?:number}} [options] Defaults to the historical v1 cutoff.
 * @returns {{handIndex:number,printing:string,reason:string}|null}
 */
function chooseRank9CompressorAfterPass(view,{maxGlobalTurn=12}={}){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,resources=view.ownTurnResources;
  if(view.globalTurn>maxGlobalTurn||resources.itemPlayLocked||
    own.deckCount<3||view.opponentPublic.prizeCount<=2)return null;
  const index=view.ownHand.indexOf(ITEM);
  if(index<0)return null;
  const all=[own.active,...own.bench];
  if(!all.some(sourceMega)||!all.some(sourceVoltorb))return null;
  if(own.discard.filter(sourceEnergy).length>=3)return null;
  return {handIndex:index,printing:ITEM,
    reason:'owner-visible-voltorb-mega-discard-energy-deficit'};
}

/**
 * Choose original source-owned Energy only AFTER a legitimate owner-deck
 * search prompt exists. This is a proof-of-mechanics research policy rather
 * than a certified optimal use of the owner's one Battle Compressor.
 *
 * @param {object} prompt Actual native owner ChooseCardsPrompt.
 * @param {object} owner Actual prompted owner, whose deck is exposed by prompt.
 * @returns {object[]} Native physical Energy card references.
 */
function chooseRank9CompressorDiscard(prompt,owner){
  assert.strictEqual(prompt.cards,owner.deck);
  const already=owner.discard.cards.filter(c=>sourceEnergy(c.fullName)).length;
  const wanted=Math.min(3,Math.max(0,3-already));
  const priority=['Prism Energy ','Darkness Energy ','Telepath [P] Energy ',
    'Telepathic Psychic Energy '];
  const cards=owner.deck.cards.filter(c=>sourceEnergy(c.fullName));
  cards.sort((a,b)=>priority.findIndex(x=>a.fullName.startsWith(x))-
    priority.findIndex(x=>b.fullName.startsWith(x)));
  return cards.slice(0,wanted);
}

/**
 * A reversible source-seat hook installed INSIDE canonical actor root
 * composition, so it can observe the actor's actual terminal Pass. It tracks
 * only the actual Store first created by accepted AddPlayerAction. Simulator
 * speculative clones are never counted as native policy/game receipts.
 *
 * @template T
 * @param {()=>T} run
 * @param {0|1} sourceSeat
 * @param {object} [deps] Test-only injectable native classes, observation,
 *   or maxGlobalTurn (12 for historical v1, Infinity for v2 late probe).
 * @returns {{result:T,audit:object}}
 */
function withRank9CompressorAfterPass(run,sourceSeat,deps={}){
  assert.equal(typeof run,'function');
  assert.ok(sourceSeat===0||sourceSeat===1);
  const maxGlobalTurn=deps.maxGlobalTurn??12;
  assert.ok(maxGlobalTurn===Infinity||
    (Number.isSafeInteger(maxGlobalTurn)&&maxGlobalTurn>=12));
  const compiled=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const native=name=>require(path.join(compiled,name));
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??native('game/store/store').Store;
  const GamePhase=deps.GamePhase??native('game/store/state/state').GamePhase;
  const {PlayCardAction,PlayerType,SlotType}=deps.cardActions??
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=deps.promptActions??
    native('game/store/actions/resolve-prompt-action');
  const observation=deps.actorObservation??actorObservation;
  const originalDecode=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const originalDispatch=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof originalDecode?.value,'function');
  assert.equal(typeof originalDispatch?.value,'function');
  let liveStore=null;
  const pendingByOwner=new Map();
  const proposalByAction=new WeakMap();
  const promptByAction=new WeakMap();
  const audit={version:maxGlobalTurn===12?VERSION:LATE_VERSION,sourceSeat,
    maxGlobalTurn:maxGlobalTurn===Infinity?'unbounded':maxGlobalTurn,
    actualPasses:0,heldItemPasses:0,
    beforeTurnLimitOtherwiseEligible:0,heldLatePasses:0,
    observedHeldPasses:[],
    eligiblePasses:0,proposedCompressor:0,
    nativeAcceptedCompressor:0,nativeRejectedCompressor:0,
    ownerDeckPromptDecisions:0,
    nativeSettledDeckToDiscard:0,
    actualOwnerSelectedEnergyCount:0,
    sourceOnly:true,competitivelyQualifiedGames:0,
    events:[]};

  function selected(state){
    const previous=originalDecode.value.call(this,state);
    const actorSeat=state.players?.findIndex(p=>p.id===this.client?.id);
    if(this.client?.id===undefined||actorSeat!==sourceSeat||
      state!==liveStore?.state||
      state.phase!==GamePhase.PLAYER_TURN||
      state.activePlayer!==sourceSeat)return previous;
    const source=state.players[sourceSeat];
    const waiting=state.prompts?.find(p=>p.result===undefined);
    const inflight=pendingByOwner.get(source.id);
    if(inflight&&waiting&&waiting.playerId===source.id&&
      waiting.constructor.name==='ChooseCardsPrompt'&&
      waiting.cards===source.deck&&
      waiting.message==='CHOOSE_CARD_TO_DISCARD'){
      const chosen=chooseRank9CompressorDiscard(waiting,source);
      assert.equal(waiting.validate(chosen,state),true);
      const action=new ResolvePromptAction(waiting.id,chosen);
      promptByAction.set(action,{inflight,chosen,
        before:source.discard.cards.slice()});
      audit.ownerDeckPromptDecisions++;
      return action;
    }
    if(previous?.constructor?.name!=='PassTurnAction'||waiting)return previous;
    audit.actualPasses++;
    const view=observation(state,sourceSeat);
    if(view.ownHand.includes(ITEM)){
      audit.heldItemPasses++;
      const own=view.ownPublic;
      const board=[own.active,...own.bench];
      const picture={
        turn:view.globalTurn,
        deckCount:own.deckCount,
        megaPresent:board.some(sourceMega),
        voltorbPresent:board.some(sourceVoltorb),
        itemLocked:view.ownTurnResources.itemPlayLocked===true,
        ownDiscardEnergy:own.discard.filter(sourceEnergy).length,
        opponentPrizes:view.opponentPublic.prizeCount
      };
      if(view.globalTurn>12)audit.heldLatePasses++;
      if(picture.deckCount>=3&&picture.megaPresent&&
        picture.voltorbPresent&&!picture.itemLocked&&
        picture.ownDiscardEnergy<3&&picture.opponentPrizes>2)
        audit.beforeTurnLimitOtherwiseEligible++;
      if(audit.observedHeldPasses.length<30)
        audit.observedHeldPasses.push(picture);
    }
    const choice=chooseRank9CompressorAfterPass(view,{maxGlobalTurn});
    if(!choice)return previous;
    audit.eligiblePasses++;
    const physical=source.hand.cards[choice.handIndex];
    assert.equal(physical?.fullName,ITEM);
    if(physical.canPlay(liveStore,state,source)!==true)return previous;
    const action=new PlayCardAction(source.id,choice.handIndex,
      {player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
    const event={sourceSeat,turn:state.turn,printing:ITEM,
      nativeAccepted:null,physicalEnergyMoved:0,ownerPromptUsed:false};
    proposalByAction.set(action,event);
    audit.proposedCompressor++;audit.events.push(event);
    return action;
  }
  function dispatched(action,...args){
    if(action?.constructor?.name==='AddPlayerAction')
      liveStore=this;
    const event=this===liveStore?proposalByAction.get(action):null;
    const promptEvent=this===liveStore?promptByAction.get(action):null;
    const state=this.state;
    try{
      const result=originalDispatch.value.call(this,action,...args);
      if(event){
        event.nativeAccepted=true;
        audit.nativeAcceptedCompressor++;
        const owner=state.players[sourceSeat];
        pendingByOwner.set(owner.id,event);
      }
      if(promptEvent){
        const owner=state.players[sourceSeat];
        const moved=promptEvent.chosen.filter(c=>
          owner.discard.cards.includes(c)&&!owner.deck.cards.includes(c));
        promptEvent.inflight.ownerPromptUsed=true;
        promptEvent.inflight.physicalEnergyMoved=moved.length;
        audit.actualOwnerSelectedEnergyCount+=promptEvent.chosen.length;
        audit.nativeSettledDeckToDiscard+=moved.length;
        pendingByOwner.delete(owner.id);
      }
      return result;
    }catch(error){
      if(event){
        event.nativeAccepted=false;
        audit.nativeRejectedCompressor++;
      }
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...originalDecode,value:selected});
  Object.defineProperty(Store.prototype,'dispatch',
    {...originalDispatch,value:dispatched});
  try{return {result:run(),audit};}
  finally{
    Object.defineProperty(Store.prototype,'dispatch',originalDispatch);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',originalDecode);
  }
}

module.exports={VERSION,LATE_VERSION,sourceEnergy,chooseRank9CompressorAfterPass,
  chooseRank9CompressorDiscard,withRank9CompressorAfterPass};
