'use strict';

const VERSION='agent10-strict-vip-treatment-attribution-v2';
const VIP_NAME='Battle VIP Pass';
const VIP_PRINTING='Battle VIP Pass FST';

/** @param {object|null} value @param {string[]} keys @returns {unknown|null} */
function consistentField(value,keys){
  if(!value||typeof value!=='object')return null;
  const present=keys.filter(key=>
    Object.prototype.hasOwnProperty.call(value,key)&&
    value[key]!==null&&value[key]!==undefined);
  if(present.length===0)return null;
  const first=value[present[0]];
  return present.every(key=>value[key]===first)?first:null;
}

/** @param {object|null} event @returns {string|null} */
function rootAction(event){
  const value=consistentField(event,
    ['action','actionType','type','constructorName']);
  return typeof value==='string'?value:null;
}

/** @param {object|null} event @returns {0|1|null} */
function actorSeat(event){
  const value=consistentField(event,['playerSlot','seat','actorSeat']);
  return value===0||value===1?value:null;
}

/** @param {object|null} event @returns {number|null} */
function actorTurn(event){
  const value=consistentField(event,['turnBefore','turn','globalTurn']);
  return Number.isSafeInteger(value)&&value>=0?value:null;
}

/** @param {object|null} event @returns {number|null} */
function rootOrdinal(event){
  const value=event?.actionOrdinal;
  return Number.isSafeInteger(value)&&value>=0?value:null;
}

/** @param {object|null} event @returns {string|null} */
function rootCardName(event){
  const value=consistentField(event,['card','cardName']);
  return typeof value==='string'&&value.length>0?value:null;
}

/**
 * Validate the complete accepted-root ordinal spine. A root's initiating
 * ordinal may point to itself or an earlier initiating action.
 * @param {object[]} ledger
 * @param {number|null} [expectedCount]
 * @returns {boolean}
 */
function validRootLedger(ledger,expectedCount=null){
  if(!Array.isArray(ledger)||
     (expectedCount!==null&&expectedCount!==ledger.length))return false;
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

/**
 * Require the complete uncapped VIP audit event sequence to reconcile
 * one-to-one with exact Store roots. The Store ledger carries the item root
 * ordinal and the initiating-root ordinal of its owner ChooseCardsPrompt.
 * @param {object[]} ledger
 * @param {object} vipAudit
 * @returns {object[]|null}
 */
function reconcileVipAudit(ledger,vipAudit){
  const examples=vipAudit?.examples;
  if(!Array.isArray(examples))return null;
  const counters=[
    vipAudit.acceptedItems,vipAudit.rejectedItems,
    vipAudit.acceptedSearches,vipAudit.rejectedSearches
  ];
  if(!counters.every(value=>Number.isSafeInteger(value)&&value>=0))
    return null;
  const itemEvents=examples.filter(event=>event?.kind==='vip-item');
  const searchEvents=examples.filter(event=>event?.kind==='vip-search');
  if(examples.length!==itemEvents.length+searchEvents.length||
     itemEvents.length!==vipAudit.acceptedItems+vipAudit.rejectedItems||
     searchEvents.length!==vipAudit.acceptedSearches+vipAudit.rejectedSearches)
    return null;
  if(!examples.every(event=>
    event&&typeof event.accepted==='boolean'&&
    (event.kind==='vip-item'||event.kind==='vip-search')))return null;

  const itemRoots=ledger.filter(root=>
    rootAction(root)==='PlayCardAction'&&rootCardName(root)===VIP_NAME);
  if(itemRoots.length!==itemEvents.length||
     itemRoots.length!==searchEvents.length)return null;

  const pairs=[];
  for(let i=0;i<itemRoots.length;i++){
    const itemRoot=itemRoots[i];
    const itemEvent=itemEvents[i];
    const seat=actorSeat(itemRoot);
    const turn=actorTurn(itemRoot);
    if(seat===null||turn===null||(turn!==1&&turn!==2)||
       itemEvent.accepted!==true||
       itemEvent.printing!==VIP_PRINTING||
       actorSeat(itemEvent)!==seat||actorTurn(itemEvent)!==turn)
      return null;

    const itemRootOrdinal=rootOrdinal(itemRoot);
    const searchRoots=ledger.filter(root=>
      rootAction(root)==='ResolvePromptAction'&&
      root.pendingPrompt==='ChooseCardsPrompt'&&
      root.initiatingRootActionOrdinal===itemRootOrdinal);
    if(searchRoots.length!==1)return null;
    const searchRoot=searchRoots[0];
    const searchRootOrdinal=rootOrdinal(searchRoot);
    const searchEvent=searchEvents[i];
    if(searchRootOrdinal===null||searchRootOrdinal<=itemRootOrdinal||
       actorSeat(searchRoot)!==seat||actorTurn(searchRoot)!==turn||
       searchEvent?.accepted!==true||
       searchEvent.nativeBenchConfirmed!==true||
       actorSeat(searchEvent)!==seat||actorTurn(searchEvent)!==turn)
      return null;

    const printings=searchEvent.printings;
    if(!Array.isArray(printings)||printings.length<1||printings.length>2||
       !printings.every(printing=>
         typeof printing==='string'&&printing.length>0))return null;
    const {benchBefore,benchAfter,deckBefore,deckAfter}=searchEvent;
    if(![benchBefore,benchAfter,deckBefore,deckAfter].every(value=>
      Number.isSafeInteger(value)&&value>=0)||
       benchAfter-benchBefore!==printings.length||
       deckBefore-deckAfter!==printings.length)return null;

    const itemEventIndex=examples.indexOf(itemEvent);
    const searchEventIndex=examples.indexOf(searchEvent);
    if(itemEventIndex<0||searchEventIndex<=itemEventIndex)return null;
    if(i>0){
      const priorSearchIndex=examples.indexOf(searchEvents[i-1]);
      const priorSearchRootOrdinal=rootOrdinal(
        ledger.find(root=>rootOrdinal(root)===pairs[i-1].searchRootOrdinal));
      if(itemEventIndex<=priorSearchIndex||
         itemRootOrdinal<=pairs[i-1].itemRootOrdinal||
         itemRootOrdinal<=priorSearchRootOrdinal)return null;
    }
    if(i+1<itemRoots.length){
      const nextItemEventIndex=examples.indexOf(itemEvents[i+1]);
      if(searchEventIndex>=nextItemEventIndex||
         searchRootOrdinal>=rootOrdinal(itemRoots[i+1]))return null;
    }
    pairs.push({
      itemEventIndex,searchEventIndex,seat,turn,
      itemRootOrdinal,searchRootOrdinal,
      selectedBasicCount:printings.length
    });
  }
  return pairs;
}

/**
 * Strictly attribute a treatment's first changed root to the exact Battle VIP
 * Pass root and its lineage-linked, physically confirmed owner deck search.
 *
 * Root ledger rows use card names, while the accepted VIP audit event preserves
 * the exact physical printing. The two ordered streams are reconciled one to
 * one, and each search root must be a ChooseCardsPrompt descended from its
 * exact VIP item root. This avoids seat/turn-only attribution when multiple
 * VIP plays occur in the same turn.
 *
 * @param {object[]} controlLedger
 * @param {object[]} treatmentLedger
 * @param {object} vipAudit Sanitized nativeVipOutcome(row) audit.
 * @returns {{attributed:boolean,reason:string,divergenceIndex?:number,
 *   seat?:number,turn?:number,physicalSearch?:object}}
 */
function strictVipTreatmentAttribution(
  controlLedger,treatmentLedger,vipAudit
){
  if(!validRootLedger(controlLedger)||
     !validRootLedger(treatmentLedger,vipAudit?.rootActionCount))
    return {attributed:false,reason:'root-ledger-integrity-mismatch'};
  if(vipAudit?.policyRecorded!==true)
    return {attributed:false,reason:'native-vip-audit-not-recorded'};

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

  const pairs=reconcileVipAudit(treatmentLedger,vipAudit);
  if(!pairs)return {
    attributed:false,reason:'vip-audit-does-not-reconcile-to-store-roots'
  };
  const physicalSearch=pairs.find(pair=>
    pair.itemRootOrdinal===rootOrdinal(after));
  if(!physicalSearch||physicalSearch.seat!==afterSeat||
     physicalSearch.turn!==afterTurn)
    return {
      attributed:false,reason:'first-vip-root-lacks-its-own-physical-search'
    };

  return {
    attributed:true,
    reason:'exact-pass-to-vip-root-with-lineage-linked-physical-search',
    divergenceIndex:index,seat:afterSeat,turn:afterTurn,
    physicalSearch
  };
}

/** @param {object[]} controlLedger @param {object[]} treatmentLedger @param {object} vipAudit */
function firstTreatmentDifferenceIsVip(
  controlLedger,treatmentLedger,vipAudit
){
  return strictVipTreatmentAttribution(
    controlLedger,treatmentLedger,vipAudit
  ).attributed;
}

module.exports={
  VERSION,VIP_NAME,VIP_PRINTING,validRootLedger,firstDivergence,
  reconcileVipAudit,strictVipTreatmentAttribution,
  firstTreatmentDifferenceIsVip
};
