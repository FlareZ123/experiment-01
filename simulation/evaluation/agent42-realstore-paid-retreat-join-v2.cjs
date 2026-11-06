'use strict';
const assert=require('node:assert/strict');
const VERSION='agent42-any-target-two-psychic-retreat-root-custody-join-v2';
const SOURCE='Shadow Rider Calyrex VMAX CRE';

function twoPsychic(cards){
  return Array.isArray(cards)&&cards.length===2&&
    cards.every(x=>typeof x==='string'&&
      x.startsWith('Psychic Energy '));
}

function visiblePaidRetreat(event,seat){
  if(event?.action!=='RetreatAction'||event.storeAccepted!==true||
     event.playerSlot!==seat||
     !Number.isSafeInteger(event.declared?.benchIndex)||
     event.declared.benchIndex<0)return false;
  const changes=event.publicBoardChanges??[];
  const active=changes.filter(x=>x.seat===seat&&
    x.position==='active'&&x.index===0);
  const bench=changes.filter(x=>x.seat===seat&&
    x.position==='bench'&&x.index===event.declared.benchIndex);
  if(active.length!==1||bench.length!==1)return false;
  const old=active[0].before,now=active[0].after;
  const target=bench[0].before,oldNow=bench[0].after;
  return old?.pokemon===SOURCE&&oldNow?.pokemon===SOURCE&&
    twoPsychic(old.energies)&&Array.isArray(oldNow.energies)&&
    oldNow.energies.length===0&&
    typeof target?.pokemon==='string'&&target.pokemon.length>0&&
    now?.pokemon===target.pokemon&&Array.isArray(target.energies)&&
    target.energies.length>0&&Array.isArray(now.energies)&&
    JSON.stringify(now.energies)===JSON.stringify(target.energies)&&
    Array.isArray(old.tools)&&old.tools.length===0&&
    Array.isArray(oldNow.tools)&&oldNow.tools.length===0&&
    Array.isArray(target.tools)&&Array.isArray(now.tools)&&
    JSON.stringify(target.tools)===JSON.stringify(now.tools);
}

function join(row,wrapperAudit,sourceSeat){
  assert.ok(sourceSeat===0||sourceSeat===1);
  assert.ok(Array.isArray(row?.rootActionLedger));
  const side=row.nativeAcceptedTargetSidecar?.events??[];
  const attacks=row.sourceAttackSettlement?.attacks??[];
  const receipts=wrapperAudit?.receipts??[];
  const results=[];
  for(const root of row.rootActionLedger){
    if(root.playerSlot!==sourceSeat||root.action!=='RetreatAction')continue;
    const events=side.filter(e=>e.rootActionOrdinal===root.actionOrdinal&&
      e.playerSlot===sourceSeat&&e.action==='RetreatAction');
    if(events.length!==1||!visiblePaidRetreat(events[0],sourceSeat))continue;
    const event=events[0],benchIndex=event.declared.benchIndex;
    const targetPrinting=event.publicBoardChanges.find(x=>
      x.seat===sourceSeat&&x.position==='active'&&x.index===0)?.after?.pokemon;
    const matching=receipts.filter(r=>
      r.status==='EXACT_TWO_PHYSICAL_PSYCHIC_PAID_RETREAT'&&
      r.turn===root.turnBefore&&r.sourceSeat===sourceSeat&&
      r.benchIndex===benchIndex&&r.targetPrinting===targetPrinting);
    const attack=attacks.find(a=>a.actionOrdinal>root.actionOrdinal&&
      a.turnBefore===root.turnBefore&&a.settledPromptChain===true&&
      a.settlementCrossesClockReset!==true)??null;
    const before=attack?.prizesBefore?.[sourceSeat]??null;
    const after=attack?.prizesAfter?.[sourceSeat]??null;
    const prizeDecrease=Number.isInteger(before)&&
      Number.isInteger(after)&&after<before;
    const nativeWon=row.finished===true&&row.winner===sourceSeat&&
      row.finalPrizes?.[sourceSeat]===0;
    results.push({
      acceptedRootOrdinal:root.actionOrdinal,turn:root.turnBefore,
      sourceSeat,benchIndex,targetPrinting,
      publiclyObservedTwoPsychicPayment:true,
      independentPhysicalCustodyReceiptCount:matching.length,
      physicalPaymentObjectCustodyConfirmed:matching.length===1&&
        matching[0].physicalPaymentObjectCustodyConfirmed===true,
      nextSettledSourceAttackOrdinal:attack?.actionOrdinal??null,
      nextSettledSourceAttackName:attack?.attackName??null,
      nextSettledAttackTookPrize:prizeDecrease,
      sourcePrizesBefore:before,sourcePrizesAfter:after,
      sourceNativeTerminalWin:nativeWon,competitiveGameQualified:false
    });
  }
  return {
    schema:VERSION,trialId:row.trial?.id??null,sourceSeat,
    sourceAcceptedRetreatRoots:row.rootActionLedger.filter(x=>
      x.playerSlot===sourceSeat&&x.action==='RetreatAction').length,
    globalWrapperPhysicalPaidRetreats:wrapperAudit?.exactPhysicalPaidRetreats??null,
    certifiedRealStorePublicPaidRetreatRoots:results.length,
    physicallyCustodiedPaidRetreatRoots:results.filter(x=>
      x.physicalPaymentObjectCustodyConfirmed).length,
    settledAttackFollowingPaidRetreat:results.filter(x=>
      x.nextSettledSourceAttackOrdinal!==null).length,
    paidRetreatWithPrize:results.filter(x=>x.nextSettledAttackTookPrize).length,
    paidRetreatWithNativeTerminalWin:results.filter(x=>
      x.sourceNativeTerminalWin).length,
    results,paperQualifiedGames:0,fieldWinRate:null
  };
}
module.exports={VERSION,visiblePaidRetreat,join};
