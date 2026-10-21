'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent8-rank6-t34-owner-k1-psychic-bridge-v1';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const ARTICUNO='Galarian Articuno V CRE';
const BASIC='Psychic Energy MEE';
const COMPRESSOR='Battle Compressor PHF';
const POWERGLASS='Powerglass SFA';

/**
 * A deliberately one-state experimental root bridge. K1 membership must
 * have been authenticated from a genuine native owner-deck search at T16.
 * Caller supplies only printed owner/public zones and the deck count.
 * This decides an opportunity, not whether its full attack path can survive.
 *
 * @param {{turn:number,activePrinting:string|null,activeEnergies:string[],
 * activeTools:string[],handPrintings:string[],itemPlayLocked:boolean,
 * deckCount:number,k1T16BasicPsychic:number|null,stage:number,
 * discardBasicPsychic:number}} view
 * @returns {{kind:'play-compressor'|'equip-powerglass',handIndex:number}|null}
 */
function chooseT34PsychicBridgeRoot(view){
  if(view.turn!==34||view.activePrinting!==ARTICUNO||
      view.itemPlayLocked||view.deckCount<=0||view.activeTools.length>0||
      view.activeEnergies.filter(x=>x===BASIC).length!==1)return null;
  if(view.stage===0&&view.k1T16BasicPsychic===3&&
      view.discardBasicPsychic===0&&
      view.handPrintings.includes(POWERGLASS)){
    const i=view.handPrintings.indexOf(COMPRESSOR);
    return i<0?null:{kind:'play-compressor',handIndex:i};
  }
  if(view.stage===2&&view.discardBasicPsychic>=2){
    const i=view.handPrintings.indexOf(POWERGLASS);
    return i<0?null:{kind:'equip-powerglass',handIndex:i};
  }
  return null;
}

/**
 * Proof-oriented, reversible live pinned Store intervention. It runs only
 * on the user-selected historical rank-6/New Moon source-first experiment.
 * It never inspects any hidden deck except during an authenticated pending
 * owner's own-deck ChooseCardsPrompt. It reads zero opponent private zones.
 * All actual choices pass through the untouched native Store dispatcher.
 *
 * @template T
 * @param {()=>T} execute Unchanged canonical source-first runner.
 * @param {{seat:0|1,targetTurn:number}} options
 * @param {{SimpleTacticsAi?:Function,Store?:Function,GamePhase?:object,
 * PlayCardAction?:Function,PlayerType?:object,SlotType?:object,
 * ResolvePromptAction?:Function}} [deps] Injectable native classes for tests.
 * @returns {{result:T,audit:object}}
 */
function withRank6T34PsychicBridge(execute,options,deps={}){
  assert.equal(typeof execute,'function');
  assert.ok(options&&[0,1].includes(options.seat));
  assert.equal(options.targetTurn,34);
  const load=name=>require(path.join(OUTPUT,name));
  const {SimpleTacticsAi}=deps.SimpleTacticsAi?
    {SimpleTacticsAi:deps.SimpleTacticsAi}:load('simple-bot/simple-tactics-ai');
  const {Store}=deps.Store?{Store:deps.Store}:load('game/store/store');
  const {GamePhase}=deps.GamePhase?{GamePhase:deps.GamePhase}:
    load('game/store/state/state');
  const actionTypes=deps.PlayCardAction?{
    PlayCardAction:deps.PlayCardAction,PlayerType:deps.PlayerType,
    SlotType:deps.SlotType}:load('game/store/actions/play-card-action');
  const {PlayCardAction,PlayerType,SlotType}=actionTypes;
  const {ResolvePromptAction}=deps.ResolvePromptAction?
    {ResolvePromptAction:deps.ResolvePromptAction}:
    load('game/store/actions/resolve-prompt-action');
  const beforeDecode=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const beforeDispatch=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof beforeDecode?.value,'function');
  assert.equal(typeof beforeDispatch?.value,'function');
  let nativeStore=null,stage=0,k1T16BasicPsychic=null;
  const recordedSearchIds=new Set();
  const chosen=new WeakMap();
  const audit={
    version:VERSION,seat:options.seat,targetTurn:34,
    sourceDealQualification:'retrospectively-chosen-development-only',
    ownerAuthenticatedK1Searches:[],k1T16BasicPsychic:null,
    rootChoices:[],promptChoices:[],dispatchAccepted:0,
    dispatchRejected:0,reason:null,stages:[],
    originalDecoderDelegations:0,nonNativeDelegations:0,
    actualTwoBasicSelected:false,
    acceptedPowerglassAttachments:0,
    competitiveQualified:false
  };

  function decoder(state){
    if(state!==nativeStore?.state){
      audit.nonNativeDelegations++;
      return beforeDecode.value.call(this,state);
    }
    const seat=options.seat,owner=state.players?.[seat];
    if(!owner||this.client?.id!==owner.id){
      return beforeDecode.value.call(this,state);
    }
    const pending=state.prompts?.find(p=>p.result===undefined);
    // Legal K1 boundary: a live unresolved prompt explicitly reveals this
    // actual player's own deck to them; never read deck IDs at other times.
    if(pending?.constructor?.name==='ChooseCardsPrompt'&&
        pending.playerId===owner.id&&pending.cards===owner.deck&&
        !recordedSearchIds.has(pending.id)){
      recordedSearchIds.add(pending.id);
      const basicCount=pending.cards.cards.filter(c=>c.fullName===BASIC).length;
      audit.ownerAuthenticatedK1Searches.push({
        turn:state.turn,deckSize:pending.cards.cards.length,
        basicPsychicCount:basicCount,promptId:String(pending.id)
      });
      if(state.turn===16){
        k1T16BasicPsychic=basicCount;
        audit.k1T16BasicPsychic=basicCount;
      }
    }
    if(stage===1&&pending?.constructor?.name==='ChooseCardsPrompt'&&
        pending.playerId===owner.id&&pending.cards===owner.deck&&
        state.turn===34){
      const physical=pending.cards.cards.filter(c=>c.fullName===BASIC).slice(0,2);
      if(physical.length===2&&pending.validate(physical)){
        const action=new ResolvePromptAction(pending.id,physical);
        chosen.set(action,{kind:'compressor-two-basics',turn:34,
          selected:physical.map(c=>c.fullName),promptId:pending.id,
          basicBefore:owner.discard.cards.filter(c=>c.fullName===BASIC).length});
        return action;
      }
      audit.reason='native-compressor-prompt-rejected-two-basics';
    }
    if((stage===3||stage===4)&&
        pending?.constructor?.name==='AttachEnergyPrompt'&&
        pending.playerId===owner.id&&pending.cardList===owner.discard&&
        state.turn>=34&&state.turn<=36){
      const basic=owner.discard.cards.find(c=>c.fullName===BASIC);
      if(basic){
        const assignment=[{card:basic,to:{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
        }}];
        if(pending.validate(assignment,state)){
          const action=new ResolvePromptAction(pending.id,assignment);
          chosen.set(action,{kind:'powerglass-basic-attachment',
            turn:state.turn,card:BASIC,promptId:pending.id,
            basicBefore:owner.active.energies.cards.filter(
              c=>c.fullName===BASIC).length});
          return action;
        }
      }
      audit.reason='powerglass-owner-prompt-could-not-attach-basic';
    }
    if(pending||state.turn!==34||
        state.activePlayer!==seat||
        state.phase!==GamePhase.PLAYER_TURN){
      audit.originalDecoderDelegations++;
      return beforeDecode.value.call(this,state);
    }
    const own=owner;
    const v={
      turn:state.turn,
      activePrinting:own.active.getPokemonCard()?.fullName??null,
      activeEnergies:own.active.energies.cards.map(c=>c.fullName),
      activeTools:own.active.tools.map(c=>c.fullName),
      handPrintings:own.hand.cards.map(c=>c.fullName),
      itemPlayLocked:own.cannotPlayItemCards===true,
      deckCount:own.deck.cards.length,
      k1T16BasicPsychic,
      stage,
      discardBasicPsychic:own.discard.cards.filter(c=>c.fullName===BASIC).length
    };
    const intent=chooseT34PsychicBridgeRoot(v);
    if(!intent){
      audit.originalDecoderDelegations++;
      return beforeDecode.value.call(this,state);
    }
    const target=intent.kind==='equip-powerglass'?
      {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0}:
      {player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
    const action=new PlayCardAction(owner.id,intent.handIndex,target);
    chosen.set(action,{kind:intent.kind,turn:34,
      handIndex:intent.handIndex,printing:v.handPrintings[intent.handIndex]});
    return action;
  }
  function dispatcher(action,...rest){
    if(action?.constructor?.name==='AddPlayerAction'&&!nativeStore)
      nativeStore=this;
    const record=this===nativeStore?chosen.get(action):null;
    if(!record)return beforeDispatch.value.call(this,action,...rest);
    const owner=this.state.players[options.seat];
    try{
      const result=beforeDispatch.value.call(this,action,...rest);
      audit.dispatchAccepted++;
      const row={...record,accepted:true};
      if(record.kind==='play-compressor'){
        stage=1;
        audit.rootChoices.push(row);
      }else if(record.kind==='compressor-two-basics'){
        const count=owner.discard.cards.filter(c=>c.fullName===BASIC).length;
        audit.actualTwoBasicSelected=count>=record.basicBefore+2;
        row.discardBasicAfter=count;
        stage=2;
        audit.promptChoices.push(row);
      }else if(record.kind==='equip-powerglass'){
        row.equipped=owner.active.tools.some(c=>c.fullName===POWERGLASS);
        stage=3;
        audit.rootChoices.push(row);
      }else if(record.kind==='powerglass-basic-attachment'){
        const count=owner.active.energies.cards.filter(c=>c.fullName===BASIC).length;
        row.activeBasicAfter=count;
        row.physicalConfirmed=count>=record.basicBefore+1;
        if(row.physicalConfirmed)audit.acceptedPowerglassAttachments++;
        stage=stage===3?4:5;
        audit.promptChoices.push(row);
      }
      audit.stages.push({kind:record.kind,stage,turn:this.state.turn});
      return result;
    }catch(error){
      audit.dispatchRejected++;
      audit.reason=String(error);
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...beforeDecode,value:decoder});
  Object.defineProperty(Store.prototype,'dispatch',{
    ...beforeDispatch,value:dispatcher});
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decoder);
    assert.strictEqual(Store.prototype.dispatch,dispatcher);
    Object.defineProperty(Store.prototype,'dispatch',beforeDispatch);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',beforeDecode);
  }
}

module.exports={VERSION,chooseT34PsychicBridgeRoot,withRank6T34PsychicBridge};
