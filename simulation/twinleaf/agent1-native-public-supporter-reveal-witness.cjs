'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const VERSION='agent1-native-owner-search-public-supporter-reveal-witness-v1';

/**
 * Record the printing of a selected Supporter only after the actual recipient
 * has accepted a native ShowCardsPrompt exposing that exact physical card.
 * This passive Store observer does not enumerate anyone's concealed deck,
 * influence player choices, or infer a public name from an unaccepted search.
 *
 * @template T
 * @param {()=>T} run
 * @param {{Store?:Function,ResolvePromptAction?:Function,
 *   ChooseCardsPrompt?:Function,ShowCardsPrompt?:Function,
 *   types?:{SuperType:object,TrainerType:object}}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withPublicSupporterRevealWitness(run,deps={}){
  assert.equal(typeof run,'function');
  const load=name=>require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output',name));
  const Store=deps.Store??load('game/store/store').Store;
  const ResolvePromptAction=deps.ResolvePromptAction??
    load('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const ChooseCardsPrompt=deps.ChooseCardsPrompt??
    load('game/store/prompts/choose-cards-prompt').ChooseCardsPrompt;
  const ShowCardsPrompt=deps.ShowCardsPrompt??
    load('game/store/prompts/show-cards-prompt').ShowCardsPrompt;
  const {SuperType,TrainerType}=deps.types??
    load('game/store/card/card-types');
  const previous=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof previous?.value,'function');
  assert.equal(previous.configurable,true);
  const selectedByStore=new WeakMap();
  const revealedByStore=new WeakMap();
  const audit={version:VERSION,eligibleAcceptedSourceSearches:0,
    matchedNativeAcceptedPublicSupporterReveals:0,
    unmatchedAcceptedPublicSupporterReveals:0,
    publicReveals:[],sourceOwnerPassAfterPublicReveal:[],
    readsOpponentHiddenDeck:false,
    emitsSelectedPrintingBeforeOpponentNativeReveal:false,
    wholePolicyInformationSafe:false,
    competitivelyQualifiedGames:0};

  function dispatch(action,...args){
    const before=this.state;
    const prompt=action instanceof ResolvePromptAction?
      before?.prompts?.find(p=>p.id===action.id&&p.result===undefined):null;
    const isSearch=prompt instanceof ChooseCardsPrompt&&
      prompt.filter?.superType===SuperType.TRAINER&&
      prompt.filter?.trainerType===TrainerType.SUPPORTER&&
      Array.isArray(action.result)&&action.result.length===1&&
      before.players.some(player=>player.id===prompt.playerId&&
        player.deck===prompt.cards);
    const isReveal=prompt instanceof ShowCardsPrompt;
    const answer=isSearch?action.result:null;
    const revealed=revealedByStore.get(this);
    const activeSeat=before?.activePlayer;
    const activeOwner=activeSeat===0||activeSeat===1?
      before.players[activeSeat]:null;
    const passingPubliclyRevealedSource=action?.constructor?.name===
      'PassTurnAction'&&revealed&&activeOwner&&
      activeOwner.id===revealed.ownerId&&before.turn===revealed.turn;
    let passWitness=null;
    if(passingPubliclyRevealedSource){
      let nullTargetCanPlay='not-available';
      if(typeof revealed.card.canPlay==='function'){
        try{
          const answer=revealed.card.canPlay(null,before,activeOwner);
          nullTargetCanPlay=answer===true?'true':
            answer===false?'false':'nonboolean';
        }catch(error){nullTargetCanPlay='threw';}
      }
      passWitness={
        sourceOwnerSeat:activeSeat,turn:before.turn,
        revealedSupporterPrinting:revealed.card.fullName,
        samePhysicalSelectedSupporterStillHeld:
          activeOwner.hand.cards.includes(revealed.card),
        nativeSupporterTurnQuotaBeforePass:activeOwner.supporterTurn??null,
        nativeSupporterPlayLockBeforePass:
          activeOwner.cannotPlaySupporterCards===true,
        nativeNullTargetCanPlay,
        nullTargetCanPlayDoesNotCertifyTargetLegality:true,
        publishedOnlyAfterOpponentAcceptedReveal:true,
        actualNativePassAccepted:false
      };
    }
    const result=previous.value.apply(this,[action,...args]);
    if(passWitness){
      passWitness.actualNativePassAccepted=true;
      audit.sourceOwnerPassAfterPublicReveal.push(passWitness);
      revealedByStore.delete(this);
    }
    // For these native prompt types, the Store must actually accept the
    // selected action before any audit field changes.
    if(!prompt||prompt.result!==action.result)return result;
    if(isSearch){
      const owner=before.players.find(p=>p.id===prompt.playerId);
      selectedByStore.set(this,{
        ownerId:owner.id,card:answer[0],sourcePromptId:prompt.id,
        selectionTurn:before.turn
      });
      audit.eligibleAcceptedSourceSearches++;
    }else if(isReveal){
      const selected=selectedByStore.get(this);
      if(selected&&prompt.playerId!==selected.ownerId&&
         prompt.cards.length===1&&prompt.cards[0]===selected.card&&
         selected.card.trainerType===TrainerType.SUPPORTER){
        // Reveal resolved, so this exact card name has now been shown to
        // its opponent by the native game. No pre-reveal identity is emitted.
        audit.matchedNativeAcceptedPublicSupporterReveals++;
        const ownerSeat=before.players.findIndex(p=>p.id===selected.ownerId);
        const opponentSeat=before.players.findIndex(p=>p.id===prompt.playerId);
        assert.ok((ownerSeat===0||ownerSeat===1)&&
          (opponentSeat===0||opponentSeat===1)&&
          ownerSeat!==opponentSeat);
        audit.publicReveals.push({
          ownerSeat,opponentSeat,turn:selected.selectionTurn,
          printedSupporterRevealed:selected.card.fullName,
          selectedSearchPromptId:selected.sourcePromptId,
          revealPromptId:prompt.id,
          nativeOpponentAcknowledged:true
        });
        revealedByStore.set(this,{
          card:selected.card,ownerId:selected.ownerId,
          turn:selected.selectionTurn
        });
        selectedByStore.delete(this);
      }else if(prompt.cards.some(card=>
        card.trainerType===TrainerType.SUPPORTER)){
        audit.unmatchedAcceptedPublicSupporterReveals++;
      }
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...previous,value:dispatch});
  try{return {result:run(),audit};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',previous);
  }
}

module.exports={VERSION,withPublicSupporterRevealWitness};
