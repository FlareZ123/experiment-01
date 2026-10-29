'use strict';

const assert=require('node:assert/strict');
const VERSION='agent16-accepted-root-sequential-recovery-v1';

/**
 * Conservative identity of a root proposal based on its owner-visible
 * printing and public recipient. It is intentionally weaker than physical
 * card identity when identical printings occupy multiple hand positions.
 * @param {object} a Owner-root selected intent or alternate offer.
 * @returns {string}
 */
function opportunityKey(a){
  return JSON.stringify([
    a.kind,
    a.printing??null,
    a.slot??null,
    a.index??null
  ]);
}

/**
 * Confirm a later root accepted the same printing and public recipient.
 * Unknown recipient fields in either offer are wildcards, because a helper
 * may omit the target until constructing the native action.
 * @param {object} proposed Earlier lower-priority offer.
 * @param {object} realized Later native-accepted owner intent.
 * @returns {boolean}
 */
function equivalentPrintedIntent(proposed,realized){
  if(proposed.kind!==realized.kind)return false;
  if(proposed.printing&&realized.printing&&
    proposed.printing!==realized.printing)return false;
  if(proposed.printing&&!realized.printing)return false;
  if(proposed.slot&&realized.slot&&
    proposed.slot!==realized.slot)return false;
  if(Number.isSafeInteger(proposed.index)&&
      Number.isSafeInteger(realized.index)&&
      proposed.index!==realized.index)return false;
  return true;
}

/**
 * Recoveries only attest another proposal of the same printed action was
 * later **accepted** in the same owner turn. Missing native legality and
 * strategic value of originally offered actions remain unknown.
 *
 * Input consists only of authentic accepted actor roots in Store order.
 * Attacks and Pass close the owner's root-turn. Capped/truncated final turns
 * are separately censored rather than counted as missed actions.
 *
 * @param {object[]} events Chronological accepted native owner-root events.
 * @returns {object} Partial evidence about sequential opportunity recovery.
 */
function traceAcceptedOwnerRootRecoveries(events){
  assert.ok(Array.isArray(events));
  const open={0:new Map(),1:new Map()};
  const lastTurn={0:null,1:null};
  let previousGlobalTurn=0,previousSeat=null;
  const evidence=[];
  const counts={acceptedRoots:0,alternativeOffers:0,
    distinctDeferrableOffers:0,repeatedOffers:0,
    recoveredInSameTurn:0,recoveredPhysicalConfirmed:0,
    expiredAtTurnEnd:0,closedOnNextOwnerTurn:0,
    censoredAfterLastRoot:0,immediateCompetingQuota:0,
    immediateTurnEnding:0};
  const records={recovered:[],expired:[],censored:[]};
  const append=(group,row)=>{
    if(records[group].length<40)records[group].push(row);
  };
  const close=(seat,reason)=>{
    const pending=open[seat];
    for(const item of pending.values()){
      if(reason==='turn-ended')counts.expiredAtTurnEnd++;
      else if(reason==='next-owner-turn')counts.closedOnNextOwnerTurn++;
      else counts.censoredAfterLastRoot++;
      append(reason==='incomplete-run'?'censored':'expired',{
        seat,firstTurn:item.globalTurn,originOrdinal:item.ordinal,
        kind:item.kind,printing:item.printing,
        status:reason
      });
    }
    pending.clear();
  };
  for(const [ordinal,e] of events.entries()){
    assert.ok(e.seat===0||e.seat===1);
    assert.ok(Number.isSafeInteger(e.globalTurn)&&e.globalTurn>=1);
    assert.equal(e.accepted,true,
      'Only Store-accepted owner roots enter sequential recovery analysis');
    assert.ok(typeof e.kind==='string'&&e.kind.length>0);
    assert.ok(Array.isArray(e.alternatives));
    assert.ok(e.globalTurn>=previousGlobalTurn,
      'Split native clock resets into distinct episodes before recovery analysis');
    assert.ok(e.globalTurn!==previousGlobalTurn||
      previousSeat===null||e.seat===previousSeat,
      'Two actors cannot take independent roots on the same global turn');
    previousGlobalTurn=e.globalTurn;
    previousSeat=e.seat;
    const seat=e.seat;
    if(lastTurn[seat]!==null&&lastTurn[seat]!==e.globalTurn)
      close(seat,'next-owner-turn');
    lastTurn[seat]=e.globalTurn;
    counts.acceptedRoots++;
    for(const [key,item] of open[seat]){
      if(!equivalentPrintedIntent(item,e))continue;
      counts.recoveredInSameTurn++;
      if(e.nativePhysicalEffect==='confirmed-public-effect')
        counts.recoveredPhysicalConfirmed++;
      append('recovered',{
        seat,turn:e.globalTurn,originOrdinal:item.ordinal,
        selectedOrdinal:ordinal,kind:e.kind,printing:e.printing??null,
        physicalEffect:e.nativePhysicalEffect??null
      });
      open[seat].delete(key);
    }
    for(const alternative of e.alternatives){
      counts.alternativeOffers++;
      if(alternative.reason==='turn-ending-selection'){
        counts.immediateTurnEnding++;
        continue;
      }
      if(alternative.reason!=='later-root-may-recover'){
        counts.immediateCompetingQuota++;
        continue;
      }
      const key=opportunityKey(alternative);
      if(open[seat].has(key)){counts.repeatedOffers++;continue;}
      counts.distinctDeferrableOffers++;
      open[seat].set(key,{...alternative,globalTurn:e.globalTurn,ordinal});
    }
    if(e.kind==='attack'||e.kind==='pass')
      close(seat,'turn-ended');
  }
  for(const seat of [0,1])close(seat,'incomplete-run');
  return {version:VERSION,...counts,samples:records,
    qualification:{
      recordedNativeAcceptancesOnly:true,
      originalAlternativeLegalityCertified:false,
      realizedActionPayoffCertified:false,
      equivalentPrintingIsPhysicalIdentity:false,
      competitiveGamesCertified:false
    }};
}

module.exports={VERSION,opportunityKey,equivalentPrintedIntent,
  traceAcceptedOwnerRootRecoveries};
