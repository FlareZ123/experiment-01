'use strict';

const VERSION='agent10-strict-vip-treatment-attribution-v1';
const VIP_PRINTING='Battle VIP Pass FST';

/**
 * Read a consistent scalar identity from the public root/audit event schema.
 * Conflicting aliases fail closed.
 * @param {object|null} value
 * @param {string[]} keys
 * @returns {unknown|null}
 */
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
  return Number.isSafeInteger(value)&&value>0?value:null;
}

/** @param {object|null} event @returns {string|null} */
function cardPrinting(event){
  const value=consistentField(event,
    ['card','printing','cardPrinting','fullName']);
  return typeof value==='string'&&value.length>0?value:null;
}

/**
 * Find the first exact public-ledger divergence. A later matching VIP action
 * cannot rescue an earlier unrelated treatment difference.
 * @param {object[]} before
 * @param {object[]} after
 * @returns {{index:number,before:object|null,after:object|null}|null}
 */
function firstDivergence(before,after){
  if(!Array.isArray(before)||!Array.isArray(after))return null;
  const limit=Math.min(before.length,after.length);
  for(let index=0;index<limit;index++){
    if(JSON.stringify(before[index])!==JSON.stringify(after[index])){
      return {index,before:before[index],after:after[index]};
    }
  }
  if(before.length!==after.length){
    return {index:limit,before:before[limit]??null,after:after[limit]??null};
  }
  return null;
}

/**
 * Require a native accepted VIP item followed by a native accepted,
 * physically confirmed owner-deck search in the same actor turn.
 * @param {object[]} examples Sanitized native VIP audit events.
 * @param {0|1} seat
 * @param {number} turn
 * @returns {object|null}
 */
function matchingPhysicalVipPair(examples,seat,turn){
  if(!Array.isArray(examples))return null;
  for(let itemIndex=0;itemIndex<examples.length;itemIndex++){
    const item=examples[itemIndex];
    if(item?.kind!=='vip-item'||item.accepted!==true||
       item.printing!==VIP_PRINTING||
       actorSeat(item)!==seat||actorTurn(item)!==turn)continue;
    for(let searchIndex=itemIndex+1;searchIndex<examples.length;searchIndex++){
      const search=examples[searchIndex];
      if(search?.kind!=='vip-search'||search.accepted!==true||
         search.nativeBenchConfirmed!==true||
         actorSeat(search)!==seat||actorTurn(search)!==turn)continue;
      const printings=search.printings;
      if(!Array.isArray(printings)||printings.length<1||
         printings.length>2||
         !printings.every(printing=>
           typeof printing==='string'&&printing.length>0))continue;
      const {benchBefore,benchAfter,deckBefore,deckAfter}=search;
      if(![benchBefore,benchAfter,deckBefore,deckAfter].every(value=>
        Number.isSafeInteger(value)&&value>=0))continue;
      if(benchAfter-benchBefore!==printings.length||
         deckBefore-deckAfter!==printings.length)continue;
      return {
        itemIndex,searchIndex,seat,turn,
        selectedBasicCount:printings.length
      };
    }
  }
  return null;
}

/**
 * Strictly attribute a treatment's first root divergence to Battle VIP Pass.
 * The first changed root must be the same owner's Pass -> exact VIP PlayCard,
 * and the native audit must prove an accepted VIP item plus physical search.
 *
 * @param {object[]} controlLedger Public accepted root ledger from phase A.
 * @param {object[]} treatmentLedger Public accepted root ledger from phase B.
 * @param {object} vipAudit Sanitized nativeVipOutcome(row) audit.
 * @returns {{attributed:boolean,reason:string,divergenceIndex?:number,
 *   seat?:number,turn?:number,physicalSearch?:object}}
 */
function strictVipTreatmentAttribution(
  controlLedger,treatmentLedger,vipAudit
){
  const divergence=firstDivergence(controlLedger,treatmentLedger);
  if(!divergence)return {
    attributed:false,reason:'missing-ledger-or-no-treatment-divergence'
  };
  const {before,after,index}=divergence;
  if(!before||!after)return {
    attributed:false,reason:'first-divergence-lacks-paired-root'
  };
  if(rootAction(before)!=='PassTurnAction')return {
    attributed:false,reason:'control-root-is-not-pass'
  };
  if(rootAction(after)!=='PlayCardAction'||
     cardPrinting(after)!==VIP_PRINTING)return {
    attributed:false,reason:'treatment-root-is-not-exact-vip-play'
  };
  const beforeSeat=actorSeat(before),afterSeat=actorSeat(after);
  const beforeTurn=actorTurn(before),afterTurn=actorTurn(after);
  if(beforeSeat===null||afterSeat===null||beforeSeat!==afterSeat||
     beforeTurn===null||afterTurn===null||beforeTurn!==afterTurn){
    return {attributed:false,reason:'first-divergence-seat-or-turn-mismatch'};
  }
  const beforeOrdinal=consistentField(before,['actionOrdinal','ordinal']);
  const afterOrdinal=consistentField(after,['actionOrdinal','ordinal']);
  const hasOrdinal=beforeOrdinal!==null||afterOrdinal!==null||
    Object.prototype.hasOwnProperty.call(before,'actionOrdinal')||
    Object.prototype.hasOwnProperty.call(before,'ordinal')||
    Object.prototype.hasOwnProperty.call(after,'actionOrdinal')||
    Object.prototype.hasOwnProperty.call(after,'ordinal');
  if(hasOrdinal&&(!Number.isSafeInteger(beforeOrdinal)||
     !Number.isSafeInteger(afterOrdinal)||beforeOrdinal!==afterOrdinal)){
    return {attributed:false,reason:'first-divergence-ordinal-mismatch'};
  }
  if(vipAudit?.policyRecorded!==true){
    return {attributed:false,reason:'native-vip-audit-not-recorded'};
  }
  const physicalSearch=matchingPhysicalVipPair(
    vipAudit.examples,beforeSeat,beforeTurn);
  if(!physicalSearch)return {
    attributed:false,reason:'accepted-item-and-physical-search-pair-missing'
  };
  return {
    attributed:true,
    reason:'exact-pass-to-vip-play-with-accepted-physical-search',
    divergenceIndex:index+1,seat:beforeSeat,turn:beforeTurn,physicalSearch
  };
}

function firstTreatmentDifferenceIsVip(
  controlLedger,treatmentLedger,vipAudit
){
  return strictVipTreatmentAttribution(
    controlLedger,treatmentLedger,vipAudit
  ).attributed;
}

module.exports={
  VERSION,VIP_PRINTING,firstDivergence,matchingPhysicalVipPair,
  strictVipTreatmentAttribution,firstTreatmentDifferenceIsVip
};
