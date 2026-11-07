'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {Store}=require(path.join(__dirname,
  '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
const {ResolvePromptAction}=require(path.join(__dirname,
  '../../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action'));
const {runSeat}=require('./agent49-mysterious-treasure-native-probe.cjs');
const {withPaperPromptContractPortfolio}=
  require('./agent41-paper-prompt-contract-portfolio.cjs');

const PRINTING='Mysterious Treasure FLI';

/**
 * Continue the genuine staged Store after the Item's optional search has
 * physically moved the searched Pokemon to hand. Previous probes stopped at
 * outstanding ShowCards/ShuffleDeck prompts, which is too early to judge
 * whether the spent Item leaves its temporary play zone.
 *
 * An identity deck-order permutation is intentionally used ONLY to study
 * engine cleanup semantics: this fixture does not certify paper shuffling.
 * Unknown prompts fail rather than being silently guessed.
 *
 * @param {object} x Staged native owner Store returned by Agent49's probe.
 * @returns {object} Accepted continuation and physical final Item location.
 */
function finishStagedNativeItem(x){
  const accepted=[];
  for(let i=0;i<16;i++){
    const prompt=x.store.state.prompts.find(p=>p.result===undefined);
    if(!prompt){
      const item=x.owner.supporter?.cards?.find(
        c=>c.fullName===PRINTING)||
        x.owner.discard.cards.find(c=>c.fullName===PRINTING);
      return {accepted,unresolvedPrompts:0,
        itemInOwnerDiscard:x.owner.discard.cards.includes(item),
        itemInTemporaryPlayZone:x.owner.supporter?.cards?.includes(item)===true,
        deterministicIdentityShuffleOnly:true,
        printedShufflePaperCertified:false};
    }
    const kind=prompt.constructor.name;
    let answer;
    if(kind==='ShowCardsPrompt')answer=true;
    else if(kind==='WaitPrompt')answer=null;
    else if(kind==='ShuffleDeckPrompt'){
      const actor=x.store.state.players.find(p=>p.id===prompt.playerId);
      assert.ok(actor,'Shuffle prompt must have an actual player');
      answer=Array.from({length:actor.deck.cards.length},(_,n)=>n);
    }else throw Error('UNHANDLED_TREASURE_CLEANUP_PROMPT:'+kind);
    if(typeof prompt.validate==='function')
      assert.equal(prompt.validate(answer,x.store.state),true,
        'Pinned native '+kind+' reply must pass the actual prompt validator');
    x.store.dispatch(new ResolvePromptAction(prompt.id,answer));
    accepted.push({kind,physicalPromptOwner:prompt.playerId,
      nativeDispatchAccepted:true});
  }
  throw Error('TREASURE_CLEANUP_PROMPTS_EXCEEDED_16');
}

/**
 * Observe the real physical Item source as the genuine pinned Store resolves
 * original owner's native payment and search prompts, no actions supplied or
 * state changed. The observer is installed inside Agent41's paper wrapper,
 * restored atomically, and sees only already public acceptance/owner zones.
 *
 * @param {0|1} seat Physical native source player seat.
 * @returns {object} Item zone after each actual accepted Store action.
 */
function observeSeat(seat){
  const {result,audit}=withPaperPromptContractPortfolio(()=>{
    const old=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
    assert.equal(typeof old?.value,'function');
    let owner=null,item=null;
    const rows=[];
    const snapshot=(event,state)=>{
      if(!item||!owner)return;
      const zones={
        ownHand:owner.hand?.cards?.includes(item)===true,
        ownSupporterPlayZone:owner.supporter?.cards?.includes(item)===true,
        ownDiscard:owner.discard?.cards?.includes(item)===true,
        ownLostZone:owner.lostzone?.cards?.includes(item)===true,
        ownDeck:owner.deck?.cards?.includes(item)===true
      };
      rows.push({event,rootIndex:rows.length,globalTurn:state.turn,
        unresolvedPromptCount:state.prompts?.filter(p=>
          p.result===undefined).length??null,
        unresolvedPromptTypes:state.prompts?.filter(p=>
          p.result===undefined).map(p=>({
          kind:p.constructor?.name??null,
          physicalOwner:p.playerId===owner.id
        }))??[],zones,
        paperCleanupEstablished:zones.ownDiscard||zones.ownLostZone});
    };
    function dispatch(action,...args){
      const state=this.state;
      if(!item&&action?.constructor?.name==='PlayCardAction'){
        const actor=state.players.find(p=>p.id===action.id);
        const candidate=actor?.hand?.cards?.[action.handIndex];
        if(candidate?.fullName===PRINTING){
          owner=actor;
          item=candidate;
          snapshot('before-native-original-item-root',state);
        }
      }
      const result=old.value.call(this,action,...args);
      if(item) snapshot('native-accepted-'+action.constructor.name,this.state);
      return result;
    }
    Object.defineProperty(Store.prototype,'dispatch',{...old,value:dispatch});
    try{
      return {native:runSeat(seat,{afterSearch:finishStagedNativeItem}),
        snapshots:rows};
    }finally{
      assert.strictEqual(Store.prototype.dispatch,dispatch);
      Object.defineProperty(Store.prototype,'dispatch',old);
    }
  });
  assert.equal(audit.inspectedTreasurePlayCardRoots,1);
  assert.equal(audit.inspectedTreasurePaymentPrompts,1);
  assert.equal(audit.vetoedTreasureInsufficientRoots,0);
  assert.equal(audit.statusCounts.PAPER_PROMPT_INVALID,0);
  assert.equal(result.native.nativeEffect?.costDiscarded,true);
  assert.equal(result.native.nativeEffect?.selectedTargetInHand,true);
  assert.ok(result.snapshots.length>4);
  assert.equal(result.native.continuation.unresolvedPrompts,0);
  assert.equal(result.native.continuation.printedShufflePaperCertified,false);
  return {
    seat,sourcePrinting:PRINTING,
    originalNativeProbeCardCleanupReported:
      result.native.nativeEffect.itemDiscarded,
    snapshots:result.snapshots,
    cleanupContinuation:result.native.continuation,
    itemInOwnerDiscardAfterPromptCompletion:
      result.native.continuation.itemInOwnerDiscard,
    acceptedNativeFixtureDispatches:result.snapshots.length-1,
    actualGameRootOrdinalsClaimed:false,
    entirePaperGameQualified:false,
    competitiveQualifiedGames:0
  };
}
function run(){
  const all={schema:'agent46-treasure-fli-genuine-printed-item-cleanup-zone-audit-v2',
    nativeEnginePinned:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    onlyNativeAcceptedEvents:true,
    nativeFixtureDispatchOrdinalsNotGameRoots:true,
    paperShufflingUnverified:true,
    noPlayerDecisionRewrites:true,
    seats:[observeSeat(0),observeSeat(1)],
    qualifiedCompetitiveGames:0};
  console.log('AGENT46_MYSTERIOUS_TREASURE_ITEM_CLEANUP '+
    JSON.stringify(all));
  return all;
}
if(require.main===module)run();
module.exports={observeSeat,run};
