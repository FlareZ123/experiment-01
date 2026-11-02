'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {run}=require('./agent10-rank9-known-dead-attack-counterfactual.cjs');
const {Store}=require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
const VERSION='agent34-rank9-last-bench-mewtwo-own-location-v1';
const CORE='Mewtwo & Mew-GX UNM';
const TARGET='Duskull VIV';

/** Post-decision, read-only original owner zones. No decision code receives this.
 * @param {object} owner Actual owner Player from the original native Store.
 * @param {string} fullName One printed source card identity.
 * @returns {object} Count of the known fixed-deck copies by physical zone.
 */
function ownerZoneCounts(owner,fullName=CORE){
  const count=cards=>cards.filter(c=>c.fullName===fullName).length;
  const slots=[owner.active,...owner.bench];
  const counts={
    hand:count(owner.hand.cards),
    deck:count(owner.deck.cards),
    prizes:count(owner.prizes.flatMap(p=>p.cards)),
    discard:count(owner.discard.cards),
    lostzone:count(owner.lostzone.cards),
    active:count(owner.active.cards),
    bench:owner.bench.reduce((sum,p)=>sum+count(p.cards),0)
  };
  return {...counts,total:Object.values(counts).reduce((a,b)=>a+b,0),
    inPlay:slots.some(p=>p.getPokemonCard()?.fullName===fullName)};
}

/** Reversible owner-only forensic wrapper around original Store dispatch.
 * It reads owner private zones only AFTER an actor selected a native root action.
 * All data is retained for postgame audit, never passed back to bot policy.
 * @template T
 * @param {()=>T} execute Unmodified, frozen source-dealt four-arm runner.
 * @param {{Store:Function}} [deps] Actual native Store or pure-test seam.
 * @returns {{result:T,audit:object}}
 */
function withOwnerLastBenchReadOnlyAudit(execute,deps={Store}){
  const NativeStore=deps.Store;
  const original=Object.getOwnPropertyDescriptor(NativeStore.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  const originalStores=new WeakMap();
  let liveStoreCount=0,originalStoreDispatches=0;
  const matches=[],searches=[];
  function observed(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&
       !originalStores.has(this)){
      originalStores.set(this,{run:++liveStoreCount,dispatches:0});
    }
    const live=originalStores.get(this);
    if(!live)return original.value.apply(this,[action,...args]);
    const root=++live.dispatches;
    originalStoreDispatches++;
    const state=this.state;
    let before=null;
    if(action?.constructor?.name==='ResolvePromptAction'&&
       state?.turn===23&&Array.isArray(action.result)){
      const pending=state.prompts?.find(p=>
        p.id===action.id&&p.result===undefined);
      const seat=state.players.findIndex(p=>p.id===pending?.playerId);
      const owner=state.players[seat];
      const requested=action.result.map(card=>card?.fullName??null);
      if(seat===0&&pending?.constructor?.name==='ChooseCardsPrompt'&&
         pending.cards===owner.deck&&requested.includes(TARGET)){
        const alternative=owner.deck.cards.find(card=>card.fullName===CORE);
        searches.push({
          storeRunIndex:live.run,originalDispatchOrdinal:root,
          globalTurn:state.turn,ownerSeat:seat,
          promptId:pending.id,promptClass:pending.constructor.name,
          promptOwnerDeck:true,
          originalChosenPrintings:requested,
          candidateAlternative:alternative?.fullName??null,
          candidateInOwnerDeck:!!alternative,
          nativePromptValidatesAlternative:alternative?
            pending.validate([alternative]):false,
          ownerPrivateCoreLocations:ownerZoneCounts(owner),
          observerOnly:true
        });
      }
    }
    if(action?.constructor?.name==='PlayCardAction'&&
      state?.turn===23&&Array.isArray(state?.players)){
      const seat=state.players.findIndex(p=>
        p.id===(action.clientId??action.id));
      const owner=state.players[seat];
      const played=owner?.hand?.cards?.[action.handIndex];
      const benches=owner?.bench?.map(slot=>
        slot.getPokemonCard()?.fullName??null)??[];
      if(seat===0&&played?.fullName===TARGET&&
         owner.active.getPokemonCard()?.fullName==='Klefki SVI'&&
         benches.filter(Boolean).length===4&&
         !benches.includes(CORE)){
        before={
          storeRunIndex:live.run,originalDispatchOrdinal:root,
          globalTurn:state.turn,ownerSeat:seat,
          physicalSelectedPrinting:played.fullName,
          ownerActive:owner.active.getPokemonCard()?.fullName??null,
          benchBefore:benches,
          ownerPrivateCoreLocations:ownerZoneCounts(owner),
          observedAfterActionAlreadySelected:true,
          privateZonesFedBackToBot:false
        };
      }
    }
    const returnValue=original.value.apply(this,[action,...args]);
    if(before){
      const owner=this.state.players[before.ownerSeat];
      const after=owner.bench.map(slot=>
        slot.getPokemonCard()?.fullName??null);
      matches.push({...before,benchAfter:after,
        physicalBenchSlotConsumed:after.filter(Boolean).length===
          before.benchBefore.filter(Boolean).length+1&&
          after.includes(TARGET),
        ownerPrivateCoreLocationsAfter:ownerZoneCounts(owner)});
    }
    return returnValue;
  }
  Object.defineProperty(NativeStore.prototype,'dispatch',
    {...original,value:observed});
  try{
    const result=execute();
    return {result,audit:{version:VERSION,
      originalStores:liveStoreCount,originalStoreDispatches,
      matchingOriginalRootCount:matches.length,
      events:matches,searchPromptEvents:searches,
      gameQualifyingEvidence:false,
      paperComplete:false,
      observerIsReadOnly:true
    }};
  }finally{
    assert.strictEqual(NativeStore.prototype.dispatch,observed);
    Object.defineProperty(NativeStore.prototype,'dispatch',original);
  }
}

function main(){
  const {result,audit}=withOwnerLastBenchReadOnlyAudit(run);
  const rows=result.rows??[];
  const record={
    version:VERSION,compiledNativeStore:Store.name,
    enginePin:result.enginePin,
    originalSourceRank:result.originalSourceRank,
    registeredTrials:result.originalSourceInspection?.registeredTrials??
      result.originalSourceInspection?.trials??null,
    sourceClosureSha256:result.sourceClosureSha256,
    attempted:result.attempted,expectedAttempts:result.expectedAttempts,
    complete:result.complete,
    observedRows:rows.map((row,index)=>({
      rowIndex:index,trialId:row.trial?.id??row.id??null,
      sourceDealFingerprint:row.sourceDealFingerprint??null,
      fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
      rootActionLedgerSha256:row.rootActionLedgerSha256??null,
      gameFinished:row.finished??null,
      engineWinner:row.winner??null
    })),
    audit,
    competitiveQualifiedGames:0,
    explanation:'Retrospective, owner-private post-choice inspection. The generic native bot never receives these hidden-zone facts. This does not compare an alternative Bench action or establish paper-valid wins.'
  };
  return record;
}
if(require.main===module)process.stdout.write(
  JSON.stringify(main(),null,2)+'\n');
module.exports={VERSION,CORE,TARGET,ownerZoneCounts,
  withOwnerLastBenchReadOnlyAudit,main};
