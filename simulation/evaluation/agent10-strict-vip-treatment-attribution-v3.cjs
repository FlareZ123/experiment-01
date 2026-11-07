'use strict';

const VERSION='agent10-strict-vip-treatment-attribution-v3-explicit-root-ordinals';
const VIP_NAME='Battle VIP Pass';
const VIP_PRINTING='Battle VIP Pass FST';
const ROOT_ORDINAL_PROTOCOL=
  'headless-match-loop-after-two-add-player-actions-v1';

/**
 * Validate an actual Store root ledger against an independently retained
 * successful-dispatch count. The expected count must come from the headless
 * action counter, never from ledger.length.
 * @param {object[]} ledger
 * @param {number} expectedCount
 * @returns {boolean}
 */
function validRootLedger(ledger,expectedCount){
  if(!Array.isArray(ledger)||
     !Number.isSafeInteger(expectedCount)||
     expectedCount<0||expectedCount!==ledger.length)return false;
  for(let i=0;i<ledger.length;i++){
    const root=ledger[i];
    if(!root||root.actionOrdinal!==i||
       ![-1,0,1].includes(root.playerSlot)||
       typeof root.action!=='string'||root.action.length===0||
       !Number.isSafeInteger(root.turnBefore)||root.turnBefore<0)return false;
    const origin=root.initiatingRootActionOrdinal;
    if(origin!==null&&origin!==undefined&&
       (!Number.isSafeInteger(origin)||origin<0||origin>i))return false;
  }
  return true;
}

/**
 * Find the first exact public accepted-root divergence.
 * @param {object[]} before
 * @param {object[]} after
 * @returns {{index:number,before:object|null,after:object|null}|null}
 */
function firstDivergence(before,after){
  if(!Array.isArray(before)||!Array.isArray(after))return null;
  const limit=Math.min(before.length,after.length);
  for(let index=0;index<limit;index++){
    if(JSON.stringify(before[index])!==JSON.stringify(after[index]))
      return {index,before:before[index],after:after[index]};
  }
  if(before.length!==after.length)
    return {index:limit,before:before[limit]??null,after:after[limit]??null};
  return null;
}

function rootAction(root){
  return typeof root?.action==='string'?root.action:null;
}
function rootCardName(root){
  return typeof root?.card==='string'?root.card:null;
}
function rootOrdinal(root){
  return Number.isSafeInteger(root?.actionOrdinal)?root.actionOrdinal:null;
}
function actorSeat(root){
  return [0,1].includes(root?.playerSlot)?root.playerSlot:null;
}
function actorTurn(root){
  return Number.isSafeInteger(root?.turnBefore)&&root.turnBefore>=0?
    root.turnBefore:null;
}
function rootAt(ledger,ordinal){
  if(!Number.isSafeInteger(ordinal)||ordinal<0)return null;
  const root=ledger[ordinal];
  return root?.actionOrdinal===ordinal?root:null;
}

/**
 * Validate that the bounded intervention-only archive is complete against
 * its own counters. Natural policy VIP roots are deliberately not expected
 * in this archive.
 * @param {object} vipAudit
 * @returns {{itemEvents:object[],searchEvents:object[]}|null}
 */
function completeVipExamples(vipAudit){
  const examples=vipAudit?.examples;
  if(!Array.isArray(examples))return null;
  const counters=[
    vipAudit.acceptedItems,vipAudit.rejectedItems,
    vipAudit.acceptedSearches,vipAudit.rejectedSearches
  ];
  if(!counters.every(value=>Number.isSafeInteger(value)&&value>=0))
    return null;
  if(examples.length!==counters.reduce((sum,value)=>sum+value,0))
    return null;
  if(!examples.every(event=>event&&typeof event.accepted==='boolean'&&
      (event.kind==='vip-item'||event.kind==='vip-search')))return null;
  const itemEvents=examples.filter(event=>event.kind==='vip-item');
  const searchEvents=examples.filter(event=>event.kind==='vip-search');
  if(itemEvents.length!==vipAudit.acceptedItems+vipAudit.rejectedItems||
     searchEvents.length!==vipAudit.acceptedSearches+
       vipAudit.rejectedSearches)return null;
  return {itemEvents,searchEvents};
}

/**
 * Check every accepted event in the intervention archive against its exact
 * successful Store root. The ledger may also contain natural VIP roots that
 * have no event here; those roots are intentionally ignored.
 * @param {object[]} ledger
 * @param {object[]} itemEvents
 * @param {object[]} searchEvents
 * @returns {boolean}
 */
function acceptedEventsMatchRoots(ledger,itemEvents,searchEvents){
  const itemOrdinals=new Set();
  for(const event of itemEvents){
    if(event.accepted!==true)continue;
    const ordinal=event.itemRootOrdinal;
    if(!Number.isSafeInteger(ordinal)||itemOrdinals.has(ordinal))
      return false;
    const root=rootAt(ledger,ordinal);
    if(!root||rootAction(root)!=='PlayCardAction'||
       rootCardName(root)!==VIP_NAME||
       event.printing!==VIP_PRINTING||
       actorSeat(root)!==event.seat||actorTurn(root)!==event.turn)
      return false;
    itemOrdinals.add(ordinal);
  }

  const searchOrdinals=new Set();
  const searchedItems=new Set();
  for(const event of searchEvents){
    if(event.accepted!==true)continue;
    const itemOrdinal=event.itemRootOrdinal;
    const searchOrdinal=event.searchRootOrdinal;
    if(!Number.isSafeInteger(itemOrdinal)||
       !Number.isSafeInteger(searchOrdinal)||
       searchOrdinals.has(searchOrdinal)||
       searchedItems.has(itemOrdinal))return false;
    const itemRoot=rootAt(ledger,itemOrdinal);
    const searchRoot=rootAt(ledger,searchOrdinal);
    if(!itemOrdinals.has(itemOrdinal)||
       !itemRoot||!searchRoot||
       rootAction(searchRoot)!=='ResolvePromptAction'||
       searchRoot.pendingPrompt!=='ChooseCardsPrompt'||
       searchRoot.initiatingRootActionOrdinal!==itemOrdinal||
       searchOrdinal<=itemOrdinal||
       actorSeat(searchRoot)!==event.seat||
       actorTurn(searchRoot)!==event.turn||
       actorSeat(itemRoot)!==event.seat||
       actorTurn(itemRoot)!==event.turn)return false;
    const printings=event.printings;
    if(event.nativeBenchConfirmed!==true||
       !Array.isArray(printings)||printings.length<1||printings.length>2||
       !printings.every(value=>typeof value==='string'&&value.length>0))
      return false;
    const {benchBefore,benchAfter,deckBefore,deckAfter}=event;
    if(![benchBefore,benchAfter,deckBefore,deckAfter].every(value=>
      Number.isSafeInteger(value)&&value>=0)||
       benchAfter-benchBefore!==printings.length||
       deckBefore-deckAfter!==printings.length)return false;
    const itemEvent=itemEvents.find(candidate=>
      candidate.accepted===true&&candidate.itemRootOrdinal===itemOrdinal);
    if(!itemEvent)return false;
    const itemIndex=vipAuditIndex(itemEvents,itemEvent);
    const searchIndex=vipAuditIndex(searchEvents,event);
    if(itemIndex===null||searchIndex===null)return false;
    searchOrdinals.add(searchOrdinal);
    searchedItems.add(itemOrdinal);
  }
  return true;
}

/**
 * @param {object[]} events
 * @param {object} event
 * @returns {number|null}
 */
function vipAuditIndex(events,event){
  const index=events.indexOf(event);
  return index<0?null:index;
}

/**
 * Attribute a first Pass -> Battle VIP Pass treatment divergence only when
 * the intervention event carries explicit item and prompt root ordinals.
 *
 * Input root counts must be independent headless counters. The v4 VIP hook's
 * dispatchRootCount is a separate counter that must equal the treatment
 * counter, validating the hook's ordinal alignment with the Store ledger.
 *
 * @param {{
 *   controlLedger:object[],
 *   controlRootActionCount:number,
 *   treatmentLedger:object[],
 *   treatmentRootActionCount:number,
 *   vipAudit:object
 * }} input
 * @returns {{attributed:boolean,reason:string,divergenceIndex?:number,
 *   seat?:number,turn?:number,physicalSearch?:object}}
 */
function strictVipTreatmentAttribution(input){
  const controlLedger=input?.controlLedger;
  const treatmentLedger=input?.treatmentLedger;
  const controlCount=input?.controlRootActionCount;
  const treatmentCount=input?.treatmentRootActionCount;
  const vipAudit=input?.vipAudit;
  if(!validRootLedger(controlLedger,controlCount)||
     !validRootLedger(treatmentLedger,treatmentCount))
    return {attributed:false,reason:'independent-root-count-or-ledger-mismatch'};
  if(vipAudit?.policyRecorded!==true)
    return {attributed:false,reason:'native-vip-audit-not-recorded'};
  if(vipAudit.rootOrdinalProtocol!==ROOT_ORDINAL_PROTOCOL||
     vipAudit.rootOrdinalInitialized!==true||
     !Number.isSafeInteger(vipAudit.dispatchRootCount)||
     vipAudit.dispatchRootCount!==treatmentCount)
    return {attributed:false,reason:'vip-hook-root-ordinal-counter-mismatch'};

  const complete=completeVipExamples(vipAudit);
  if(!complete)return {
    attributed:false,reason:'vip-intervention-event-archive-incomplete'
  };
  const {itemEvents,searchEvents}=complete;
  if(!acceptedEventsMatchRoots(treatmentLedger,itemEvents,searchEvents))
    return {
      attributed:false,reason:'accepted-vip-event-root-join-invalid'
    };

  const divergence=firstDivergence(controlLedger,treatmentLedger);
  if(!divergence)return {
    attributed:false,reason:'missing-ledger-or-no-treatment-divergence'
  };
  const {before,after,index}=divergence;
  if(!before||!after)return {
    attributed:false,reason:'first-divergence-lacks-paired-root'
  };
  if(rootAction(before)!=='PassTurnAction')
    return {attributed:false,reason:'control-root-is-not-pass'};
  if(rootAction(after)!=='PlayCardAction'||
     rootCardName(after)!==VIP_NAME)
    return {attributed:false,reason:'treatment-root-is-not-vip-play'};

  const beforeSeat=actorSeat(before);
  const afterSeat=actorSeat(after);
  const beforeTurn=actorTurn(before);
  const afterTurn=actorTurn(after);
  if(beforeSeat===null||afterSeat===null||beforeSeat!==afterSeat||
     beforeTurn===null||afterTurn===null||beforeTurn!==afterTurn)
    return {attributed:false,reason:'first-divergence-seat-or-turn-mismatch'};
  if(rootOrdinal(before)!==index||rootOrdinal(after)!==index)
    return {attributed:false,reason:'first-divergence-ordinal-mismatch'};

  const matchingItems=itemEvents.filter(event=>
    event.accepted===true&&event.itemRootOrdinal===index);
  if(matchingItems.length!==1)
    return {
      attributed:false,reason:'first-divergent-vip-root-lacks-unique-item-event'
    };
  const itemEvent=matchingItems[0];
  const matchingSearches=searchEvents.filter(event=>
    event.accepted===true&&event.itemRootOrdinal===index);
  if(matchingSearches.length!==1)
    return {
      attributed:false,reason:'first-divergent-vip-root-lacks-unique-search-event'
    };
  const searchEvent=matchingSearches[0];
  const itemEventIndex=vipAudit.examples.indexOf(itemEvent);
  const searchEventIndex=vipAudit.examples.indexOf(searchEvent);
  if(itemEventIndex<0||searchEventIndex<=itemEventIndex||
     itemEvent.seat!==afterSeat||itemEvent.turn!==afterTurn||
     searchEvent.seat!==afterSeat||searchEvent.turn!==afterTurn)
    return {attributed:false,reason:'first-divergent-vip-event-order-or-owner-mismatch'};

  const itemRoot=rootAt(treatmentLedger,itemEvent.itemRootOrdinal);
  const searchRoot=rootAt(treatmentLedger,searchEvent.searchRootOrdinal);
  if(!itemRoot||!searchRoot||
     rootOrdinal(itemRoot)!==index||
     rootOrdinal(searchRoot)<=index||
     searchRoot.initiatingRootActionOrdinal!==index||
     searchRoot.pendingPrompt!=='ChooseCardsPrompt')
    return {
      attributed:false,reason:'first-divergent-vip-prompt-lineage-mismatch'
    };

  return {
    attributed:true,
    reason:'exact-divergent-vip-root-with-ordinal-linked-physical-search',
    divergenceIndex:index,seat:afterSeat,turn:afterTurn,
    physicalSearch:{
      itemEventIndex,searchEventIndex,
      itemRootOrdinal:index,
      searchRootOrdinal:rootOrdinal(searchRoot),
      seat:afterSeat,turn:afterTurn,
      selectedBasicCount:searchEvent.printings.length,
      benchIncrease:searchEvent.benchAfter-searchEvent.benchBefore,
      deckDecrease:searchEvent.deckBefore-searchEvent.deckAfter
    }
  };
}

module.exports={
  VERSION,VIP_NAME,VIP_PRINTING,ROOT_ORDINAL_PROTOCOL,
  validRootLedger,firstDivergence,completeVipExamples,
  acceptedEventsMatchRoots,strictVipTreatmentAttribution
};
