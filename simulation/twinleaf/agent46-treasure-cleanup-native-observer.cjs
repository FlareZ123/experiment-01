'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {Store}=require(path.join(__dirname,
  '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
const {runSeat}=require('./agent49-mysterious-treasure-native-probe.cjs');
const {withPaperPromptContractPortfolio}=
  require('./agent41-paper-prompt-contract-portfolio.cjs');

const PRINTING='Mysterious Treasure FLI';

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
      return {native:runSeat(seat),snapshots:rows};
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
  assert.ok(result.snapshots.length>2);
  return {
    seat,sourcePrinting:PRINTING,
    originalNativeProbeCardCleanupReported:
      result.native.nativeEffect.itemDiscarded,
    snapshots:result.snapshots,
    acceptedNativeRootEvents:result.snapshots.length-1,
    entirePaperGameQualified:false,
    competitiveQualifiedGames:0
  };
}
function run(){
  const all={schema:'agent46-treasure-fli-genuine-printed-item-cleanup-zone-audit-v1',
    nativeEnginePinned:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    onlyNativeAcceptedEvents:true,
    noPlayerDecisionRewrites:true,
    seats:[observeSeat(0),observeSeat(1)],
    qualifiedCompetitiveGames:0};
  console.log('AGENT46_MYSTERIOUS_TREASURE_ITEM_CLEANUP '+
    JSON.stringify(all));
  return all;
}
if(require.main===module)run();
module.exports={observeSeat,run};
