'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {writeAtomicLocked}=require('./agent20-frozen-rank6-canary-v1.cjs');
const {withRegisteredCandidateLilliePanel,VERSION}=
  require('../twinleaf/agent7-prospective-candidate-lillie-after-pass.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent7-lillie-pass-rank6-prospective-20261102.json';
const FROZEN='simulation/evaluation/agent20-frozen-rank6-canary-v1.json';
const OUTPUT=path.join(ROOT,'agent7-rank6-lillie-prospective-paired-output.json');
const hash=x=>createHash('sha256').update(x).digest('hex');

/** @param {object} row @returns {object} Real engine results, never competitive games. */
function summarizeRow(row) {
  const roots=row.rootActionLedger??[];
  return {
    trialId:row.trial.id,physicalCandidateSeat:row.candidateSeat,
    actualStarterSeat:row.actualStarterSeat,
    sourcePhysicalDealFingerprint:row.sourceDealFingerprint,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint,
    rootActionLedgerSha256:row.rootActionLedgerSha256,
    candidateTurnPasses:roots.filter(r=>r.playerSlot===row.candidateSeat&&
      r.action==='PassTurnAction').map(r=>({
        ordinal:r.actionOrdinal,turn:r.turnBefore
      })),
    candidateLillieRoots:roots.filter(r=>r.playerSlot===row.candidateSeat&&
      r.action==='PlayCardAction'&&String(r.card??'').startsWith("Lillie's Determination"))
      .map(r=>({ordinal:r.actionOrdinal,turn:r.turnBefore,card:r.card})),
    sourceAttacks:roots.filter(r=>r.playerSlot===row.sourceSeat&&
      r.action==='AttackAction').map(r=>({
        ordinal:r.actionOrdinal,turn:r.turnBefore,attack:r.attack
      })),
    candidateAttacks:roots.filter(r=>r.playerSlot===row.candidateSeat&&
      r.action==='AttackAction').map(r=>({
        ordinal:r.actionOrdinal,turn:r.turnBefore,attack:r.attack
      })),
    nativeFinished:row.finished===true,
    nativeEndReason:row.endReason,
    nativeWinnerSeat:row.winner,
    nativeActions:row.actionCount,
    finalPrizeCounts:row.finalPrizes,
    sourceFollowupStatus:row.candidateFollowupStatus??null,
    paperQualified:false,
    competitiveQualified:false
  };
}

/** Two exactly preregistered source-game cohorts: unchanged vs one candidate-only owner rule. */
function run(){
  const registrationBytes=fs.readFileSync(path.join(ROOT,REG));
  const profileBytes=fs.readFileSync(path.join(ROOT,FROZEN));
  const registration=JSON.parse(registrationBytes);
  const profile=JSON.parse(profileBytes);
  assert.equal(registration.schema,'agent7-rank6-two-seat-lillie-pass-controlled-prospective-v1');
  assert.equal(profile.schema,'agent20-frozen-bilateral-rank6-canary-v1');
  assert.equal(hash(profileBytes),registration.sourceFrozenProfileSha256);
  const trials=registration.trials;
  assert.equal(trials.length,8);
  assert.equal(new Set(trials.map(t=>t.id)).size,8);
  const options={...profile.policyOptions,registeredTrials:trials,
    registeredFrameName:REG};
  const control=runDevelopment(options);
  const selected=withRegisteredCandidateLilliePanel(
    ()=>runDevelopment(options),trials);
  const treatment=selected.result;
  assert.deepEqual(control.rows.map(r=>r.trial.id),trials.map(t=>t.id));
  assert.deepEqual(treatment.rows.map(r=>r.trial.id),trials.map(t=>t.id));

  const pairs=trials.map((t,i)=>{
    const a=control.rows[i],b=treatment.rows[i];
    const candidateEvents=selected.audit.interventions[i];
    assert.equal(candidateEvents?.trialId,t.id);
    return {
      trialId:t.id,rank:t.rank,candidateId:t.candidateId,
      candidateSlot:t.candidateSlot,seed:t.seed,
      exactSourceInitialPhysicalDealMatched:Boolean(
        a.sourceDealFingerprint&&
        a.sourceDealFingerprint===b.sourceDealFingerprint),
      exactFullInitialPhysicalDealMatched:Boolean(
        a.fullPhysicalDealFingerprint&&
        a.fullPhysicalDealFingerprint===b.fullPhysicalDealFingerprint),
      control:summarizeRow(a),
      treatment:summarizeRow(b),
      nativePolicyIntervention:candidateEvents
    };
  });
  const output={
    schema:VERSION,
    evidenceClass:'precommitted-seed-conditional-owner-rule-native-engine-diagnostic',
    registration:REG,registrationSha256:hash(registrationBytes),
    unchangedOriginalFrozenProfile:FROZEN,
    originalFrozenProfileSha256:hash(profileBytes),
    pinnedTwinleaf:registration.pinnedTwinleafRevision,
    codeSha256:hash(fs.readFileSync(path.resolve(
      __dirname,'../twinleaf/agent7-prospective-candidate-lillie-after-pass.cjs'))),
    controlTrialCount:control.rows.length,
    treatmentTrialCount:treatment.rows.length,
    rootAdapterCompositions:selected.audit.rootCompositions,
    exactSourcePairCount:pairs.filter(x=>x.exactSourceInitialPhysicalDealMatched).length,
    exactFullPhysicalPairCount:pairs.filter(x=>x.exactFullInitialPhysicalDealMatched).length,
    totalProposedNativeLillieRoots:pairs.reduce((sum,x)=>
      sum+x.nativePolicyIntervention.proposed,0),
    totalNativeAcceptedLillieRoots:pairs.reduce((sum,x)=>
      sum+x.nativePolicyIntervention.accepted,0),
    totalNativeRejectedLillieRoots:pairs.reduce((sum,x)=>
      sum+x.nativePolicyIntervention.rejected,0),
    nativeSourcePairIntegrityControl:control.sourcePairs,
    nativeSourcePairIntegrityTreatment:treatment.sourcePairs,
    pairs,
    sourceGameCompetitiveQualified:false,
    competitiveQualifiedGames:0,
    limitations:'Rank6-only, four fresh source seeds (two per physical candidate seat), two fixed candidate sixties; native-policy diagnostic without complete paper-rule proof, independent expert opponent or broad Top32 coverage. Numerical native winners are not competitive win-rate estimates.'
  };
  writeAtomicLocked(OUTPUT,JSON.stringify(output,null,2)+'\n');
  return output;
}
if(require.main===module){
  let output;
  try {
    output=run();
    console.log(JSON.stringify({
      schema:output.schema,
      controlGames:output.controlTrialCount,
      treatmentGames:output.treatmentTrialCount,
      allSourcePhysicalPairsMatched:output.exactSourcePairCount===8,
      totalCandidateLillieAttempts:output.totalProposedNativeLillieRoots,
      totalNativeAccepted:output.totalNativeAcceptedLillieRoots,
      totalNativeRejected:output.totalNativeRejectedLillieRoots,
      rowPairedSummary:output.pairs.map(x=>({
        trialId:x.trialId,
        sourceDealMatched:x.exactSourceInitialPhysicalDealMatched,
        treatmentLillieRoots:x.nativePolicyIntervention.accepted,
        controlWinner:x.control.nativeWinnerSeat,
        treatmentWinner:x.treatment.nativeWinnerSeat,
        controlEndReason:x.control.nativeEndReason,
        treatmentEndReason:x.treatment.nativeEndReason
      })),
      competitivelyQualifiedGames:0
    })+'\n');
  } catch(error){
    const failure={schema:VERSION,error:String(error?.stack??error),
      competitiveQualifiedGames:0};
    writeAtomicLocked(OUTPUT,JSON.stringify(failure,null,2)+'\n');
    process.stderr.write(failure.error+'\n');
    process.exitCode=1;
  }
}
module.exports={run,summarizeRow};
