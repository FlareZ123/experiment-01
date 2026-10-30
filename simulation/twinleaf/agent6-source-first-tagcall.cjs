'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent6-original-source-first-tag-call-v2-k1-thunder-localization';

/**
 * Reversible original Store source-first Tag Call to owner-deck Guzma & Hala.
 * The first turn may bank a searched Supporter for the following turn;
 * the owner cannot play a Supporter on the first turn when going first.
 * No deck/prize identities are inspected before an authenticated owner search.
 *
 * Deliberately opt-in and source-only. This is an action execution witness,
 * not proof that spending Tag Call now is a good strategic choice.
 *
 * @template T
 * @param {0|1} sourceSeat Physical seat of original Aichi rank6 source.
 * @param {()=>T} execute Synchronous genuine pinned Store match.
 * @returns {{result:T,audit:object}}
 */
function withSourceFirstTagCall(sourceSeat,execute){
  assert.ok(sourceSeat===0||sourceSeat===1);
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const engine=name=>require(path.join(base,name));
  const {Store}=engine('game/store/store');
  const {GamePhase}=engine('game/store/state/state');
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    engine('game/store/actions/resolve-prompt-action');
  const botDesc=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const storeDesc=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof botDesc?.value,'function');
  assert.equal(typeof storeDesc?.value,'function');
  let live=null,phase='idle';
  const audit={
    version:VERSION,sourceSeat,firstOwnTurnTagCallSelected:false,
    genuineOwnerDeckPromptSelected:false,
    revealedGuzmaHalaAvailable:null,
    ownerSelectedPrintings:[],
    k1ThunderMountainZones:null,
    realStoreRootAccepted:false,realStorePromptAccepted:false,
    firstOwnTurnTagCallFailure:null,
    hiddenDeckReadBeforeOwnerPrompt:false,
    competitiveQualifiedGames:0
  };
  const proposed=new WeakMap();
  function dispatch(action,...rest){
    if(!live&&action?.constructor?.name==='AddPlayerAction')live=this;
    const kind=proposed.get(action);
    try{
      const result=storeDesc.value.apply(this,[action,...rest]);
      if(this===live&&kind==='tag')audit.realStoreRootAccepted=true;
      if(this===live&&kind==='search')audit.realStorePromptAccepted=true;
      return result;
    }catch(error){
      if(this===live&&kind)
        audit.firstOwnTurnTagCallFailure=String(error?.message??error);
      throw error;
    }
  }
  function decode(state){
    const source=state.players?.[sourceSeat];
    if(state!==live?.state || this.client?.id!==source?.id)
      return botDesc.value.call(this,state);
    const pending=state.prompts.find(p=>p.result===undefined);
    if(phase==='search' && pending &&
      pending.playerId===source.id &&
      pending.constructor?.name==='ChooseCardsPrompt'){
      if(pending.cards!==source.deck){
        audit.firstOwnTurnTagCallFailure=
          'Pending Tag Call search is not the native owner deck';
        phase='done';
        return botDesc.value.call(this,state);
      }
      // This is the first and only permitted read of the owner's deck
      // contents, since it is now genuinely visible at the Tag Call prompt.
      // The owner can examine the entire remaining deck only at this
      // authenticated K1 search. Count the unique source Thunder Mountain
      // through all other owner-known physical non-Prize zones, without
      // ever opening or directly inspecting a face-down Prize card.
      const isThunder=c=>c.name==='Thunder Mountain Prism Star';
      const count=cards=>cards.filter(isThunder).length;
      const zones={
        ownDeck:count(source.deck.cards),
        ownHand:count(source.hand.cards),
        ownDiscard:count(source.discard.cards),
        ownLostZone:count(source.lostzone.cards),
        ownStadium:count(source.stadium.cards)
      };
      audit.k1ThunderMountainZones={
        ...zones,sourceDeckKnownSingletonCount:1,
        // Valid only for this authentic source-first original-60
        // board, and only because card uniqueness is authenticated.
        inferredPrized: Object.values(zones).every(n=>n===0),
        directlyInspectedPrizes:false
      };
      const gh=source.deck.cards.find(c=>c.name==='Guzma & Hala');
      const selected=gh&&pending.validate([gh],state)?[gh]:[];
      if(!pending.validate(selected,state)){
        audit.firstOwnTurnTagCallFailure=
          'No valid Tag Call selection under native prompt validation';
        phase='done';
        return botDesc.value.call(this,state);
      }
      audit.revealedGuzmaHalaAvailable=Boolean(gh);
      audit.ownerSelectedPrintings=selected.map(c=>c.fullName);
      audit.genuineOwnerDeckPromptSelected=true;
      phase='done';
      const choice=new ResolvePromptAction(pending.id,selected);
      proposed.set(choice,'search');
      return choice;
    }
    if(phase==='idle' &&
      state.turn===1 && state.activePlayer===sourceSeat &&
      state.phase===GamePhase.PLAYER_TURN && !pending &&
      source.active.getPokemonCard()?.name==='Iron Thorns ex' &&
      source.cannotPlayItemCards!==true){
      const handIndex=source.hand.cards.findIndex(c=>c.name==='Tag Call');
      if(handIndex>=0){
        phase='search';
        audit.firstOwnTurnTagCallSelected=true;
        const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
        const play=new PlayCardAction(source.id,handIndex,board);
        proposed.set(play,'tag');
        return play;
      }
    }
    return botDesc.value.call(this,state);
  }
  Object.defineProperty(Store.prototype,'dispatch',{...storeDesc,value:dispatch});
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...botDesc,value:decode});
  try{return {result:execute(),audit};}
  catch(error){
    error.sourceFirstTagCallEvidence={...audit};
    throw error;
  }finally{
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',botDesc);
    Object.defineProperty(Store.prototype,'dispatch',storeDesc);
  }
}
module.exports={VERSION,withSourceFirstTagCall};
