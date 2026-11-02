'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const assert=require('node:assert/strict');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {writeAtomicLocked}=require('./agent20-frozen-rank6-canary-v1.cjs');
const {withNativeTerminalPhysicalPredicates,VERSION}=
  require('../twinleaf/agent7-native-terminal-physical-predicates.cjs');
const root=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent7-lillie-pass-rank6-prospective-20261102.json';
const original=path.join(__dirname,'agent20-frozen-rank6-canary-v1.json');
const OUTPUT=path.join(root,'agent7-rank6-no-prize-terminal-native-diagnostic.json');
const eligible={
 '6:71:A:champion-reference':'5d6dece97c6f8f90b51c41805741fd4229b035cbbc027b1643e0fad738f47e8f',
 '6:72:B:champion-reference':'4304a5ce71f8df866b7a61f96931ebcac7b5d4d7e29f5c8e679c776cb10241db'
};

/** Revisit only two already seen and selected no-six-Prize terminal trials. */
function run(){
  const frozen=JSON.parse(fs.readFileSync(original));
  const registered=JSON.parse(fs.readFileSync(path.join(root,REG)));
  // The shared canonical runner requires both fixed candidate 60s for each
  // original physical seed, so retain the two companion pairs as controls.
  const trials=registered.trials.filter(t=>
    t.seed===1855410067||t.seed===2335986362);
  assert.equal(trials.length,4);
  const observed=withNativeTerminalPhysicalPredicates(()=>runDevelopment({
    ...frozen.policyOptions,registeredTrials:trials,
    registeredFrameName:REG
  }));
  const rows=observed.result.rows;
  assert.equal(rows.length,4);
  const ledgerWitness=rows.map((r,i)=>{
    const terminal=observed.audit.events.find(e=>e.gameOrdinal===i);
    const isTarget=r.trial.id in eligible;
    const sourceSeat=r.sourceSeat;
    return {
      trialId:r.trial.id,sourcePhysicalSeat:sourceSeat,
      isSelectedNonPrizeSourceTerminal:isTarget,
      originalDecisionLedgerSha256:eligible[r.trial.id]??null,
      replayDecisionLedgerSha256:r.rootActionLedgerSha256,
      exactReplayMatched:isTarget?
        r.rootActionLedgerSha256===eligible[r.trial.id]:null,
      sourceNativeWin:r.winner===sourceSeat,
      sourcePrizesRemaining:r.finalPrizes[sourceSeat],
      candidatePrizesRemaining:r.finalPrizes[1-sourceSeat],
      sourceAttackCount:r.rootActionLedger.filter(a=>
        a.playerSlot===sourceSeat&&a.action==='AttackAction').length,
      nativeEndReason:r.endReason,
      nativeTerminalPhysicalReceipt:terminal??null
    };
  });
  const output={
    schema:VERSION,
    context:'retrospective of two already observed rank6 original source non-six-Prize native wins',
    originalRegistration:REG,
    pinnedVendor:registered.pinnedTwinleafRevision,
    readOnlyObserverSha256:createHash('sha256')
      .update(fs.readFileSync(path.resolve(
        __dirname,'../twinleaf/agent7-native-terminal-physical-predicates.cjs')))
      .digest('hex'),
    observedLiveGames:observed.audit.observedGames,
    exactNativeTerminalTransitions:observed.audit.nativeTerminalTransitions,
    outcomes:ledgerWitness,
    sourcePerformanceQualified:false,
    competitiveQualifiedGames:0,
    scope:'Read-only physical winner/deck/board/prizes at first real Store FINISHED transition, exact original root-ledger replay, no alternate intervention or independent trial'
  };
  writeAtomicLocked(OUTPUT,JSON.stringify(output,null,2)+'\n');
  return output;
}
if(require.main===module) {
  const x=run();
  console.log(JSON.stringify({
    schema:x.schema,
    rows:x.outcomes.map(o=>({
      trialId:o.trialId,rootLedgerMatched:o.exactReplayMatched,
      sourcePrizesRemaining:o.sourcePrizesRemaining,
      nativeWon:o.sourceNativeWin,
      physicalPredicates:o.nativeTerminalPhysicalReceipt?.
        compatibleTerminalPredicates,
      lastAction:o.nativeTerminalPhysicalReceipt?.action,
      finalDecks:o.nativeTerminalPhysicalReceipt?.after?.sides?.map(s=>s.deckRemaining)
    })),
    competitiveQualifiedGames:0
  }));
}
module.exports={run};
