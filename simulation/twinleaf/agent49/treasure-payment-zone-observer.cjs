'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const VERSION='agent49-original-treasure-physical-owner-zones-v1';
const TREASURE='Mysterious Treasure FLI';

/**
 * Observe authenticated real Store prompt payments and owner deck searches.
 * The observer never chooses a card or reads hidden deck contents. Selection
 * identities come from the actual owner-supplied ResolvePromptAction.
 * @template T
 * @param {()=>T} work Full original-source native match runner.
 * @param {{Store?:Function}} [deps] Test-only native Store override.
 * @returns {{result:T,audit:object}} Same result and read-only physical receipts.
 */
function withTreasurePhysicalZoneReceipt(work,deps={}){
  assert.equal(typeof work,'function');
  const Store=deps.Store??require(path.resolve(__dirname,
    '../../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const previous=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof previous?.value,'function');
  const liveStores=new WeakSet();
  const receipts=[];
  let rejectedObserved=0;

  function observed(action,...args){
    if(action?.constructor?.name==='AddPlayerAction')
      liveStores.add(this);
    const state=this.state;
    const pending=liveStores.has(this)&&
      action?.constructor?.name==='ResolvePromptAction'?
      state.prompts?.find(p=>p.id===action.id&&p.result===undefined):null;
    const owner=pending&&state.players?.find(p=>p.id===pending.playerId);
    const zone=pending?.cards===owner?.hand?'owner-hand':
      pending?.cards===owner?.deck?'owner-deck':null;
    const relevant=pending?.constructor?.name==='ChooseCardsPrompt'&&
      pending.sourceCard?.fullName===TREASURE&&zone!==null&&
      Array.isArray(action.result)&&action.result.length===1;
    const selected=relevant?action.result[0]:null;
    const seat=relevant?state.players.indexOf(owner):null;
    const before=relevant?{
      inHand:owner.hand.cards.includes(selected),
      inDeck:owner.deck.cards.includes(selected),
      inDiscard:owner.discard.cards.includes(selected),
      nativeValidatorAccepted:pending.validate(action.result,state)===true
    }:null;
    try{
      const result=previous.value.call(this,action,...args);
      if(relevant){
        const after=state.players[seat];
        const zoneMoveVerified=zone==='owner-hand'?
          before.inHand&&!before.inDiscard&&
          !after.hand.cards.includes(selected)&&
          after.discard.cards.includes(selected):
          before.inDeck&&!before.inHand&&
          !after.deck.cards.includes(selected)&&
          after.hand.cards.includes(selected);
        receipts.push({
          seat,turn:state.turn,promptId:pending.id,
          sourcePrinting:TREASURE,sourceZone:zone,
          selectedPrinting:selected.fullName,selectedCardId:selected.id,
          realStore:liveStores.has(this),before,
          zoneMoveVerified,
          after:{
            inHand:after.hand.cards.includes(selected),
            inDeck:after.deck.cards.includes(selected),
            inDiscard:after.discard.cards.includes(selected)
          },
          status:'native-accepted',
          paperGameQualified:false
        });
      }
      return result;
    }catch(error){
      if(relevant){
        rejectedObserved++;
        receipts.push({seat,turn:state.turn,promptId:pending.id,
          sourcePrinting:TREASURE,sourceZone:zone,
          selectedPrinting:selected.fullName,selectedCardId:selected.id,
          nativeValidatorAccepted:before.nativeValidatorAccepted,
          zoneMoveVerified:false,status:'native-rejected',
          error:String(error?.message??error).slice(0,250)});
      }
      throw error;
    }
  }

  Object.defineProperty(Store.prototype,'dispatch',{
    ...previous,value:observed
  });
  try{
    return {result:work(),audit:{
      version:VERSION,realNativeOnly:true,
      sourceOwnerDecisionRewritten:false,
      ownerHiddenDeckRead:false,opponentPrivateCardsRead:false,
      physicalReceipts:receipts,rejectedObserved,
      verifiedOwnerPayments:receipts.filter(x=>
        x.sourceZone==='owner-hand'&&x.zoneMoveVerified).length,
      verifiedOwnerSearches:receipts.filter(x=>
        x.sourceZone==='owner-deck'&&x.zoneMoveVerified).length,
      competitiveQualifiedGames:0
    }};
  }finally{
    assert.strictEqual(Store.prototype.dispatch,observed);
    Object.defineProperty(Store.prototype,'dispatch',previous);
  }
}

module.exports={VERSION,withTreasurePhysicalZoneReceipt};
