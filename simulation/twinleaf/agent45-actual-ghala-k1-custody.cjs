'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent45-owner-ghala-actual-k1-selection-custody-v1';
const HALA='Guzma & Hala CEC';

/**
 * Read-only observer for real owner-deck G&H cards selected at the native
 * ChooseCardsPrompt. The actual Store's accepted dispatch and the physical
 * card-object relocation are required before an event can be certified.
 * @template T
 * @param {()=>T} execute Original, unaltered native match.
 * @param {{Store?:Function,trialId?:string}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withActualGuzmaHalaK1Custody(execute,deps={}){
  assert.equal(typeof execute,'function');
  const Store=deps.Store??require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  const audit={
    schema:VERSION,trialId:deps.trialId??null,actualStores:0,
    acceptedGuzmaHalaOwnerRoots:[],
    nativeOwnDeckSearchResults:[],
    selectedOrMutatedActions:false,opponentConcealedZoneRead:false,
    unopenedOwnerDeckRead:false,qualifiedCompetitiveGames:0
  };
  let actualStore=null,dispatchOrdinal=0;
  const playedByOwner=new Map();

  function dispatch(action,...args){
    const kind=action?.constructor?.name;
    if(kind==='AddPlayerAction'&&actualStore===null){
      actualStore=this;
      audit.actualStores++;
    }
    if(this!==actualStore)
      return original.value.call(this,action,...args);
    const thisOrdinal=++dispatchOrdinal;
    const before=this.state;
    const seat=kind==='PlayCardAction'?
      before.players.findIndex(p=>p.id===action.id):-1;
    const physical=seat>=0?
      before.players[seat].hand.cards[action.handIndex]:null;
    const isHala=physical?.fullName===HALA;
    const pending=kind==='ResolvePromptAction'?
      (before.prompts??[]).find(p=>p.id===action.id&&
        p.result===undefined&&p.constructor?.name==='ChooseCardsPrompt'&&
        p.message==='CHOOSE_CARD_TO_HAND'):null;
    const owner=pending?
      before.players.find(p=>p.id===pending.playerId):null;
    const ownerSeat=owner?before.players.indexOf(owner):-1;
    const token=owner?playedByOwner.get(owner.id):null;
    const isOwnDeckHala=Boolean(token&&token.turn===before.turn&&
      pending.cards===owner.deck&&ownerSeat===token.seat);
    const selected=isOwnDeckHala&&Array.isArray(action.result)?
      [...action.result]:null;
    const fromOwnDeck=selected?
      selected.every(c=>owner.deck.cards.includes(c)):false;
    // The existing engine remains the sole authority on accepting a root.
    const result=original.value.call(this,action,...args);
    if(isHala){
      const player=this.state.players[seat];
      const accepted=!player.hand.cards.includes(physical);
      if(accepted){
        playedByOwner.set(player.id,{turn:before.turn,seat});
        audit.acceptedGuzmaHalaOwnerRoots.push({
          seat,turn:before.turn,StoreDispatchOrdinal:thisOrdinal,
          playedPrintedCard:physical.fullName
        });
      }
    }
    if(isOwnDeckHala){
      const after=this.state.players[ownerSeat];
      const physicalTransfer=Boolean(selected&&fromOwnDeck&&
        selected.every(c=>after.hand.cards.includes(c)&&
          !after.deck.cards.includes(c)));
      audit.nativeOwnDeckSearchResults.push({
        seat:ownerSeat,turn:before.turn,promptId:String(pending.id),
        StoreDispatchOrdinal:thisOrdinal,
        selectedPrintedCards:selected?.map(c=>c.fullName)??null,
        selectedCount:selected?.length??null,
        realOwnerDeckPrompt:true,selectedOriginallyInOwnDeck:fromOwnDeck,
        samePhysicalCardsMovedToOwnHand:physicalTransfer,
        nativeStoreResolvedWithoutThrow:true
      });
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...original,value:dispatch});
  try{return {result:execute(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.agent45ActualGuzmaHalaK1Audit={...audit};
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',original);
  }
}

module.exports={VERSION,HALA,withActualGuzmaHalaK1Custody};
