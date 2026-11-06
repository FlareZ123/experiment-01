'use strict';
const assert=require('node:assert/strict');
const VERSION='agent42-original-source-real-store-root-joined-two-psychic-v1';
const VMAX='Shadow Rider Calyrex VMAX CRE';

/** @param {unknown} x @param {number} size */
function psychic(x,size){
  return Array.isArray(x)&&x.length===size&&x.every(y=>
    typeof y==='string'&&y.startsWith('Psychic Energy '));
}

/**
 * Genuine accepted Store target-sidecar face-up state change. This proves
 * a two-card public Energy loss at one accepted root, not individual object
 * identity or whole-game rules fidelity.
 * @param {object} e Authenticated native accepted-target sidecar event.
 * @param {0|1} seat Physical original-source seat.
 * @returns {boolean}
 */
function visiblePaidRetreat(e,seat){
  if(!e||e.action!=='RetreatAction'||e.storeAccepted!==true||
    e.playerSlot!==seat||
    !Number.isSafeInteger(e.declared?.benchIndex)||
    e.declared.benchIndex<0)return false;
  const changes=e.publicBoardChanges??[];
  const a=changes.filter(v=>v.seat===seat&&v.position==='active'&&
    v.index===0);
  const b=changes.filter(v=>v.seat===seat&&v.position==='bench'&&
    v.index===e.declared.benchIndex);
  if(a.length!==1||b.length!==1)return false;
  const before=a[0].before,now=a[0].after;
  const priorTarget=b[0].before,oldNow=b[0].after;
  return before?.pokemon===VMAX&&now?.pokemon===VMAX&&
    priorTarget?.pokemon===VMAX&&oldNow?.pokemon===VMAX&&
    psychic(before.energies,2)&&psychic(oldNow.energies,0)&&
    psychic(priorTarget.energies,3)&&psychic(now.energies,3)&&
    Array.isArray(before.tools)&&before.tools.length===0&&
    Array.isArray(oldNow.tools)&&oldNow.tools.length===0;
}

/**
 * Join real accepted native roots and target-sidecar public consequences.
 * A globally wrapped Store prototype can also see speculative AI Store
 * activity, so its independent payment counts are only corroborative.
 * @param {object} row Actual native game row, including accepted root ledger.
 * @param {object} wrapperAudit Global physical card payment hook receipt.
 * @param {0|1} sourceSeat Physical original-source seat.
 * @returns {object} Strict public real-game evidence packet.
 */
function join(row,wrapperAudit,sourceSeat){
  assert.ok(sourceSeat===0||sourceSeat===1);
  assert.ok(Array.isArray(row?.rootActionLedger));
  const events=row.nativeAcceptedTargetSidecar?.events??[];
  const receipts=wrapperAudit?.receipts??[];
  const attacks=row.sourceAttackSettlement?.attacks??[];
  const results=[];
  for(const root of row.rootActionLedger){
    if(root.playerSlot!==sourceSeat||root.action!=='RetreatAction')continue;
    const observed=events.filter(e=>e.rootActionOrdinal===root.actionOrdinal&&
      e.playerSlot===sourceSeat&&e.action==='RetreatAction');
    if(observed.length!==1||!visiblePaidRetreat(observed[0],sourceSeat))
      continue;
    const benchIndex=observed[0].declared.benchIndex;
    const matchingReceipts=receipts.filter(v=>
      v.status==='EXACT_TWO_PHYSICAL_PSYCHIC_PAID_RETREAT'&&
      v.turn===root.turnBefore&&v.sourceSeat===sourceSeat&&
      v.benchIndex===benchIndex);
    const next=attacks.find(a=>a.actionOrdinal>root.actionOrdinal&&
      a.turnBefore===root.turnBefore&&a.attackName==='Max Geist'&&
      a.settledPromptChain===true&&
      a.settlementCrossesClockReset!==true)??null;
    const prizesBefore=next?.prizesBefore?.[sourceSeat]??null;
    const prizesAfter=next?.prizesAfter?.[sourceSeat]??null;
    results.push({
      acceptedRootOrdinal:root.actionOrdinal,turn:root.turnBefore,
      sourceSeat,benchIndex,
      publiclyObservedTwoPsychicPayment:true,
      independentGlobalWrapperReceiptCount:matchingReceipts.length,
      globallyWrappedIdentityClaimCannotBeAttributedToThisRoot:true,
      paidAttackerMaxGeistRoot:next?.actionOrdinal??null,
      attackPromptChainSettled:next!==null,
      sourcePrizeCountBefore:prizesBefore,
      sourcePrizeCountAfter:prizesAfter,
      sameEpochOpponentReply:next?.nextSourceSameEpochProven===true,
      competitiveGameQualified:false
    });
  }
  return {
    schema:VERSION,trialId:row.trial?.id??null,sourceSeat,
    sourceAcceptedRetreatRoots:row.rootActionLedger.filter(root=>
      root.playerSlot===sourceSeat&&root.action==='RetreatAction').length,
    globalWrapperPhysicalPaidRetreats:
      wrapperAudit?.exactPhysicalPaidRetreats??null,
    certifiedRealStorePublicPaidRetreatRoots:results.length,
    settledMaxGeistFollowingPaidRetreat:results.filter(x=>
      x.attackPromptChainSettled).length,
    paidRetreatWithSameEpochReply:results.filter(x=>
      x.sameEpochOpponentReply).length,
    results,
    paperQualifiedGames:0,fieldWinRate:null,
    scope:'Authenticated real Store root plus public Energy transition. Private physical-object proof is unbound to a specific root and remains corroboration only.'
  };
}
module.exports={VERSION,visiblePaidRetreat,join};
