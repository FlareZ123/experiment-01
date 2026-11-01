'use strict';
const assert=require('node:assert/strict');

const VERSION='agent39-print-specific-live-prompt-root-reconciliation-v1';

/**
 * Compare positively paper-checked live Store replies with distinct accepted
 * native root actions. Avoid counting auxiliary Simulator Store activity.
 * The only certified source here is original rank-6 TWM Volt Cyclone.
 *
 * @param {object} row Completed development trial.
 * @param {0|1} sourceSeat Physical original-source seat.
 * @returns {object} Bounded provenance report; zero competitive-game claims.
 */
function reconcileVoltCycloneRoot(row,sourceSeat){
  assert.ok(sourceSeat===0||sourceSeat===1);
  const trace=row?.rootActionLedger??[];
  const audit=row?.paperPromptPortfolioAudit??null;
  assert.ok(Array.isArray(trace));
  const byOrdinal=new Map(trace.map(e=>[e.actionOrdinal,e]));
  const actual=trace.filter(root=>{
    if(root.action!=='ResolvePromptAction'||
       root.pendingPrompt!=='AttachEnergyPrompt'||
       root.playerSlot!==sourceSeat)return false;
    const parent=byOrdinal.get(root.initiatingRootActionOrdinal);
    return parent?.action==='AttackAction'&&
      parent.attack==='Volt Cyclone'&&parent.playerSlot===sourceSeat;
  });
  const rawEvents=audit?.events??[];
  const allStoreVerified=rawEvents.filter(e=>
    e.status==='PAPER_PROMPT_VERIFIED'&&e.nativeAccepted===true&&
    e.sourcePrinting==='Iron Thorns ex TWM');
  const liveVerified=allStoreVerified.filter(e=>
    e.storeScope==='live'&&e.sourceSeat===sourceSeat);
  const otherStoreVerified=allStoreVerified.length-liveVerified.length;
  const key=(turn,seat)=>String(turn)+':'+String(seat);
  const frequencies=(items,project)=>{
    const counts=Object.create(null);
    for(const x of items){
      const k=project(x);
      counts[k]=(counts[k]??0)+1;
    }
    return Object.fromEntries(Object.entries(counts)
      .sort(([a],[b])=>a.localeCompare(b)));
  };
  const rootTurns=frequencies(actual,e=>key(e.turnBefore,e.playerSlot));
  const auditedTurns=frequencies(liveVerified,e=>key(e.turn,e.sourceSeat));
  const allTurnsAligned=JSON.stringify(rootTurns)===JSON.stringify(auditedTurns);
  const liveObserved=audit?.liveStoreObserved===true;
  const status=!liveObserved?'LIVE_STORE_UNOBSERVED':
    actual.length===0&&liveVerified.length===0?'NO_SOURCE_VOLT_PROMPTS':
    actual.length===liveVerified.length&&allTurnsAligned?
      'LIVE_PRINTED_SOURCE_PROMPTS_MATCHED':'LIVE_ROOT_RECONCILIATION_MISMATCH';
  return {schema:VERSION,sourceSeat,status,
    genuineAcceptedOriginalSourceVoltRoots:actual.length,
    liveCheckedSourceVoltReplies:liveVerified.length,
    checkedOtherStoreOrUnattributedEvents:otherStoreVerified,
    rawAllStoreVerifiedEvents:allStoreVerified.length,
    actualSourceTurnSeatHistogram:rootTurns,
    auditedSourceTurnSeatHistogram:auditedTurns,
    liveStoreObserved:liveObserved,
    paperPromptRootDenominatorReconciled:
      status==='LIVE_PRINTED_SOURCE_PROMPTS_MATCHED',
    entireAttackPaperQualified:false,
    competitiveQualifiedGames:0};
}

module.exports={VERSION,reconcileVoltCycloneRoot};
