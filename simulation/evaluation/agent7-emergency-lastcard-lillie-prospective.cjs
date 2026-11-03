'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {withRegisteredOwnerEmergencyLillie,VERSION}=
  require('../twinleaf/agent7-emergency-lillie-before-terminal-root.cjs');
const {writeAtomicLocked}=
  require('./agent20-frozen-rank6-canary-v1.cjs');

const root=path.resolve(__dirname,'../..');
const PROSPECTIVE=
  'results/aichi-2026/registrations/agent7-emergency-lastcard-lillie-prospective-20261103.json';
const HISTORICAL=
  'results/aichi-2026/registrations/agent7-lillie-pass-rank6-prospective-20261102.json';
const FROZEN='simulation/evaluation/agent20-frozen-rank6-canary-v1.json';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const originalHistorical={
  '6:71:A:champion-reference':
    '5d6dece97c6f8f90b51c41805741fd4229b035cbbc027b1643e0fad738f47e8f',
  '6:71:A:new-moon-lockbreaker-v1':
    'd0f8f0c4d5df72810739dd32ddfe5b209bdcde87064d0787b7c4f09013db7eb8'
};

/**
 * Stable compact row projection with native source attack and terminal evidence.
 * @param {object} row Compiled native original/source game result.
 * @returns {object}
 */
function summarize(row){
  const roots=row.rootActionLedger??[];
  const sourceSeat=row.sourceSeat;
  const candidateSeat=row.candidateSeat;
  return {
    trialId:row.trial.id,sourceSeat,candidateSeat,
    actualStarterSeat:row.actualStarterSeat,
    originalPhysicalSourceDealFingerprint:row.sourceDealFingerprint,
    fullPhysicalInitialDealFingerprint:row.fullPhysicalDealFingerprint,
    nativeRootLedgerSha256:row.rootActionLedgerSha256,
    nativeEndReason:row.endReason,nativeFinished:row.finished,
    nativeWinnerSeat:row.winner,nativeActionCount:row.actionCount,
    finalPrizes:row.finalPrizes,
    sourceAttacks:roots.filter(r=>r.playerSlot===sourceSeat&&
      r.action==='AttackAction').map(r=>({
        turn:r.turnBefore,ordinal:r.actionOrdinal,attack:r.attack??null
      })),
    candidateAttacks:roots.filter(r=>r.playerSlot===candidateSeat&&
      r.action==='AttackAction').map(r=>({
        turn:r.turnBefore,ordinal:r.actionOrdinal,attack:r.attack??null
      })),
    candidateLillieRoots:roots.filter(r=>r.playerSlot===candidateSeat&&
      r.action==='PlayCardAction'&&String(r.card).startsWith("Lillie's Determination")
    ).map(r=>({turn:r.turnBefore,ordinal:r.actionOrdinal,card:r.card})),
    sourceLillieRoots:roots.filter(r=>r.playerSlot===sourceSeat&&
      r.action==='PlayCardAction'&&String(r.card).startsWith("Lillie's Determination")
    ).map(r=>({turn:r.turnBefore,ordinal:r.actionOrdinal,card:r.card})),
    paperGameQualified:false,competitiveGameQualified:false
  };
}

/**
 * Run exactly the registered original source/deck pair panel in both policy
 * conditions. Historical flag makes the original already exposed candidate
 * physical seed explicitly retrospective, excluded from prospective counts.
 * @param {boolean} [historical]
 * @returns {object}
 */
function run(historical=false){
  const regPath=historical?HISTORICAL:PROSPECTIVE;
  const registrationBytes=fs.readFileSync(path.join(root,regPath));
  const registration=JSON.parse(registrationBytes);
  const profileBytes=fs.readFileSync(path.join(root,FROZEN));
  const profile=JSON.parse(profileBytes);
  assert.equal(sha(profileBytes),registration.sourceFrozenProfileSha256??
    registration.originalFrozenProfileSha256);
  assert.equal(profile.pinnedVendorRevision,registration.pinnedTwinleafRevision);
  const trials=historical?
    registration.trials.filter(t=>t.seed===1855410067):
    registration.trials;
  assert.equal(trials.length,historical?2:16);
  assert.equal(new Set(trials.map(x=>x.id)).size,trials.length);
  for(const t of trials){
    assert.equal(t.rank,6);
    assert.ok(t.candidateSlot==='A'||t.candidateSlot==='B');
    assert.ok(['champion-reference','new-moon-lockbreaker-v1']
      .includes(t.candidateId));
  }
  const options={...profile.policyOptions,registeredTrials:trials,
    registeredFrameName:regPath};
  const baseline=runDevelopment(options);
  const modified=withRegisteredOwnerEmergencyLillie(
    ()=>runDevelopment(options),trials);
  const treatment=modified.result;
  assert.deepEqual(baseline.rows.map(x=>x.trial.id),trials.map(x=>x.id));
  assert.deepEqual(treatment.rows.map(x=>x.trial.id),trials.map(x=>x.id));
  assert.equal(modified.audit.realRootCompositions,trials.length);
  const comparisons=trials.map((trial,i)=>{
    const a=baseline.rows[i],b=treatment.rows[i],agent=modified.audit.interventions[i];
    assert.equal(agent.trialId,trial.id);
    if(historical)assert.equal(a.rootActionLedgerSha256,
      originalHistorical[trial.id],'Historical control original roots changed');
    const selected=agent.events.filter(e=>e.accepted);
    const confirmed=agent.nativeLillieDrawSettlement?.events?.filter(e=>
      selected.some(s=>e.seat===s.seat&&e.before?.turn===s.turn&&
        e.printedDrawPostcondition===true))??[];
    return {
      trial,
      originalSourcePhysicalDealMatched:a.sourceDealFingerprint===
        b.sourceDealFingerprint,
      fullInitialPhysicalDealMatched:a.fullPhysicalDealFingerprint===
        b.fullPhysicalDealFingerprint,
      control:summarize(a),treatment:summarize(b),
      ownerRootInterventionCount:agent.eligible,
      ownerRootAcceptedCount:agent.accepted,
      ownerRootRejectedCount:agent.rejected,
      printedNativeLillieEffectConfirmedCount:confirmed.length,
      interventionAudit:agent,
      nativeTerminalDispositionsDifferent:a.endReason!==b.endReason||
        a.winner!==b.winner,
      controlFullNativeRootLedger:a.rootActionLedger,
      treatmentFullNativeRootLedger:b.rootActionLedger,
      wholePaperGameQualified:false
    };
  });
  const output={
    schema:VERSION,
    evidenceClass:historical?
      'already-observed physical seed retrospective causal native policy development':
      'preregistered fresh physical seed matched control/treatment native policy panel',
    historical,
    registration:regPath,
    registrationSha256:sha(registrationBytes),
    frozenPolicy:FROZEN,
    frozenPolicySha256:sha(profileBytes),
    pinnedTwinleafRevision:registration.pinnedTwinleafRevision,
    emergencyPolicySha256:sha(fs.readFileSync(path.join(root,
      'simulation/twinleaf/agent7-emergency-lillie-before-terminal-root.cjs'))),
    originalNativeTrialCount:trials.length,
    controlNativeAttempts:baseline.rows.length,
    treatmentNativeAttempts:treatment.rows.length,
    exactSourcePhysicalPairs:comparisons.filter(x=>
      x.originalSourcePhysicalDealMatched).length,
    exactFullPhysicalPairs:comparisons.filter(x=>
      x.fullInitialPhysicalDealMatched).length,
    acceptedOwnerEmergencyLillie:comparisons.reduce((n,x)=>
      n+x.ownerRootAcceptedCount,0),
    physicallyConfirmedPrintedLillie:comparisons.reduce((n,x)=>
      n+x.printedNativeLillieEffectConfirmedCount,0),
    rejectedOwnerEmergencyLillie:comparisons.reduce((n,x)=>
      n+x.ownerRootRejectedCount,0),
    nativeTerminalDispositionChanges:comparisons.filter(x=>
      x.nativeTerminalDispositionsDifferent).length,
    originalSourcePairChecks:baseline.sourcePairs,
    changedSourcePairChecks:treatment.sourcePairs,
    comparisons,
    competitiveQualifiedGames:0,
    interpretation:'Policy-development-only. Engine winners are not evidence of legal competitive paper matches. Rescue may sacrifice other hand lines, and the opponent is unqualified.'
  };
  const name=historical?
    'agent7-emergency-lastcard-lillie-original-seed-development.json':
    'agent7-emergency-lastcard-lillie-prospective-results.json';
  writeAtomicLocked(path.join(root,name),JSON.stringify(output,null,2)+'\n');
  return output;
}
if(require.main===module){
  const historical=process.argv.includes('--historical');
  const result=run(historical);
  console.log(JSON.stringify({
    schema:result.schema,historical,
    registeredNativeTrials:result.originalNativeTrialCount,
    exactPhysicalMatched:result.exactFullPhysicalPairs,
    acceptedEmergencyLillie:result.acceptedOwnerEmergencyLillie,
    physicallyConfirmedLillie:result.physicallyConfirmedPrintedLillie,
    nativeDispositionChanges:result.nativeTerminalDispositionChanges,
    games:result.comparisons.map(x=>({
      id:x.trial.id,accepted:x.ownerRootAcceptedCount,
      confirmed:x.printedNativeLillieEffectConfirmedCount,
      originalWinner:x.control.nativeWinnerSeat,
      treatmentWinner:x.treatment.nativeWinnerSeat,
      originalEnd:x.control.nativeEndReason,
      treatmentEnd:x.treatment.nativeEndReason
    })),competitiveQualifiedGames:0
  }));
}
module.exports={run,summarize};
