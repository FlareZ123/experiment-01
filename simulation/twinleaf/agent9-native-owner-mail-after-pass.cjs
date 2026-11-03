'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {
  PRINTING,planOwnerMailAfterPass
}=require('./agent9-owner-mail-after-pass-planner.cjs');

const VERSION='agent9-native-owner-mail-after-pass-v1';

/**
 * Reversible, symmetric, exact-original-60 owner-only Mail bridge. It
 * presents a deterministic Mail candidate only when the incumbent root is
 * an unsupported Pass. Any actual Mail search prompt is resolved after the
 * source Store exposes its own four cards to the owner. Never inspect the
 * unrevealed owner deck order or the opponent's private zones.
 *
 * Native Store acceptance and prompt settlement are distinct diagnostics.
 * This is developmental, not evidence of a complete competent opponent.
 *
 * Install inside the canonical actor-root selection, as the inner runner.
 * @template T
 * @param {()=>T} execute Synchronous original Store headless run.
 * @param {[string[],string[]]} registeredSixties Exact source 60s per seat.
 * @returns {{result:T,audit:object}}
 */
function withOwnerMailAfterPass(execute,registeredSixties){
  assert.equal(typeof execute,'function');
  assert.ok(Array.isArray(registeredSixties)&&registeredSixties.length===2&&
    registeredSixties.every(row=>Array.isArray(row)&&row.length===60));
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const native=p=>require(path.join(base,p));
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const {Store}=native('game/store/store');
  const {GamePhase}=native('game/store/state/state');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const {TrainerCard}=native('game/store/card/trainer-card');
  const types=native('game/store/card/card-types');
  const {CardManager}=native('game/cards/card-manager');
  const {trainerPrintCatalog}=
    require('./agent5-generic-owner-trainer-opportunity.cjs');
  const {actorObservation}=
    require('./actor-observation-contract.cjs');
  const catalog=trainerPrintCatalog(
    CardManager.getInstance().getAllCards(),{
      TrainerCard,TrainerType:types.TrainerType
    });
  assert.equal(catalog.get(PRINTING)?.type,'Item');

  const ai=SimpleTacticsAi.prototype,store=Store.prototype;
  const previousAi=Object.getOwnPropertyDescriptor(ai,'decodeNextAction');
  const previousStore=Object.getOwnPropertyDescriptor(store,'dispatch');
  assert.equal(typeof previousAi?.value,'function');
  assert.equal(typeof previousStore?.value,'function');
  const selected=new WeakMap(),awaiting=new Map();
  let liveStore=null;
  const audit={
    version:VERSION,policySymmetricBothSeats:true,
    sourceRegisteredSixties:[...registeredSixties.map(x=>x.length)],
    authenticOwnerRoots:0,unsupportedPassRoots:0,
    sourceCountEligibleOffers:0,mailActionSelected:0,
    mailStoreAccepted:0,mailStoreRejected:0,
    liveOwnerMailSearchPrompts:0,
    promptSelected:0,promptAccepted:0,promptRejected:0,
    chosenCardsSettledInHand:0,unsettledPrompts:0,
    bothSeatAccepted:{0:0,1:0},
    selectedReceipts:[],omittedReceipts:0,
    nativeSourceHiddenOrderReadByThisBridge:false,
    nativePromptDelegateMayStillUseHiddenInfo:true,
    paperGamePolicyCertified:false,competitiveGamesQualified:0
  };
  const note=row=>{
    if(audit.selectedReceipts.length<80)audit.selectedReceipts.push(row);
    else audit.omittedReceipts++;
  };
  function decoded(state,...args){
    const seat=state?.players?.findIndex(
      player=>player.id===this.client?.id)??-1;
    const live=liveStore!==null&&state===liveStore.state&&
      (seat===0||seat===1);
    const owner=live?state.players[seat]:null;
    const pending=state.prompts?.find(prompt=>prompt.result===undefined);

    if(live&&owner&&awaiting.has(owner.id)&&
       pending?.playerId===owner.id&&
       pending.constructor?.name==='ChooseCardsPrompt'&&
       pending.cards!==owner.deck&&
       pending.cards?.cards?.length<=4){
      // This temporary CardList is from the Mail top-four reveal. The owner
      // is legally allowed to inspect these exact cards at this prompt.
      const choices=pending.cards.cards.filter(card=>
        card instanceof TrainerCard&&card.name!=="Trainers' Mail")
        .slice().sort((a,b)=>a.fullName.localeCompare(b.fullName));
      const chosen=choices.find(card=>pending.validate([card],state)===true);
      const answer=chosen?[chosen]:[];
      if(pending.validate(answer,state)===true){
        const action=new ResolvePromptAction(pending.id,answer);
        const receipt=awaiting.get(owner.id);
        selected.set(action,{kind:'mail-prompt',seat,ownerId:owner.id,
          turn:state.turn,source:receipt.printing,
          chosen:[...answer],beforeHand:owner.hand.cards.slice(),
          rootReceipt:receipt});
        audit.promptSelected++;
        return action;
      }
    }

    const incumbent=previousAi.value.call(this,state,...args);
    if(!live||!owner||pending||
       state.phase!==GamePhase.PLAYER_TURN||state.activePlayer!==seat)
      return incumbent;
    audit.authenticOwnerRoots++;
    if(incumbent?.constructor?.name!=='PassTurnAction')return incumbent;
    audit.unsupportedPassRoots++;
    const view=actorObservation(state,seat);
    const proposal=planOwnerMailAfterPass(view,catalog,
      registeredSixties[seat],{kind:'pass',
        reason:'no-supported-owner-visible-root'});
    if(!proposal.selected)return incumbent;
    audit.sourceCountEligibleOffers++;
    const {handIndex,printing}=proposal.selected;
    assert.equal(owner.hand.cards[handIndex]?.fullName,printing,
      'Source-count candidate must bind an actual held printing');
    const action=new PlayCardAction(owner.id,handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    const receipt={kind:'mail',seat,turn:state.turn,
      handIndex,printing,ownerId:owner.id,
      minimumEligibleInDeck:proposal.targetBounds.minimumInDeck,
      publicDeckSize:proposal.targetBounds.deckSize,
      nativeStore:'not-dispatched',
      mailPrompt:'not-seen',
      paperOutcomeCertified:false
    };
    selected.set(action,receipt);
    audit.mailActionSelected++;
    note(receipt);
    return action;
  }

  function dispatched(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&liveStore===null)
      liveStore=this;
    const entry=this===liveStore?selected.get(action):null;
    if(!entry)return previousStore.value.apply(this,[action,...args]);
    try{
      const result=previousStore.value.apply(this,[action,...args]);
      const owner=this.state.players[entry.seat];
      if(entry.kind==='mail'){
        entry.nativeStore='accepted';
        audit.mailStoreAccepted++;
        audit.bothSeatAccepted[entry.seat]++;
        const pending=this.state.prompts?.find(prompt=>
          prompt.result===undefined&&prompt.playerId===entry.ownerId&&
          prompt.constructor?.name==='ChooseCardsPrompt'&&
          prompt.cards!==owner.deck&&
          prompt.cards?.cards?.length<=4);
        if(pending){
          entry.mailPrompt='pending-owner-top-four';
          audit.liveOwnerMailSearchPrompts++;
          awaiting.set(entry.ownerId,entry);
        }else{
          entry.mailPrompt='no-prompt-created';
          awaiting.delete(entry.ownerId);
        }
      }else{
        audit.promptAccepted++;
        awaiting.delete(entry.ownerId);
        const settled=entry.chosen.every(card=>
          owner.hand.cards.includes(card));
        if(settled)audit.chosenCardsSettledInHand+=entry.chosen.length;
        else audit.unsettledPrompts++;
        entry.rootReceipt.mailPrompt='owner-prompt-accepted';
        entry.rootReceipt.chosen=entry.chosen.map(card=>card.fullName);
        entry.rootReceipt.chosenPhysicallySettled=settled;
      }
      return result;
    }catch(error){
      if(entry.kind==='mail'){
        audit.mailStoreRejected++;
        entry.nativeStore='rejected';
      }else{
        audit.promptRejected++;
        entry.rootReceipt.mailPrompt='owner-prompt-rejected';
      }
      entry.nativeError=String(error?.message??error).slice(0,300);
      throw error;
    }
  }

  Object.defineProperty(ai,'decodeNextAction',{...previousAi,value:decoded});
  Object.defineProperty(store,'dispatch',{...previousStore,value:dispatched});
  try{
    const result=execute();
    audit.unresolvedOwnerPrompts=awaiting.size;
    return {result,audit};
  }finally{
    assert.strictEqual(ai.decodeNextAction,decoded);
    assert.strictEqual(store.dispatch,dispatched);
    Object.defineProperty(store,'dispatch',previousStore);
    Object.defineProperty(ai,'decodeNextAction',previousAi);
  }
}

module.exports={VERSION,withOwnerMailAfterPass};
