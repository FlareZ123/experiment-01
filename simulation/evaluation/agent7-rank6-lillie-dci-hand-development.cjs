'use strict';

const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {writeAtomicLocked}=require('./agent20-frozen-rank6-canary-v1.cjs');
const {withRegisteredCandidateLilliePanel}=
  require('../twinleaf/agent7-prospective-candidate-lillie-after-pass.cjs');
const root=path.resolve(__dirname,'../..');
const file=path.join(root,'results/aichi-2026/registrations/agent7-lillie-pass-rank6-prospective-20261102.json');
const profile=path.join(__dirname,'agent20-frozen-rank6-canary-v1.json');
const output=path.join(root,'agent7-rank6-lillie-dci-hand-development.json');
const expected={
 '6:73:B:champion-reference':'b15c2dfbb86da2fc23f0ec6cdf581d79d2223aac4c942634a4483e6abb14c7a5',
 '6:73:B:new-moon-lockbreaker-v1':'6537359eac9b9ddba6bc044151942664d7f75fd489a592454701aeebf4c4ef86'
};

/** Retrospective coheld-hand study on one already-observed source seed. */
function run(){
  const registration=JSON.parse(fs.readFileSync(file));
  const frozen=JSON.parse(fs.readFileSync(profile));
  const trials=registration.trials.filter(t=>t.seed===4153138373);
  assert.equal(trials.length,2);
  const selected=withRegisteredCandidateLilliePanel(
    ()=>runDevelopment({...frozen.policyOptions,registeredTrials:trials,
      registeredFrameName:path.relative(root,file)}),
    trials);
  const report={
    schema:'agent7-rank6-lillie-coheld-udp-dci-retrospective-development-v1',
    evidence:'replayed an observed prospective seed solely to inspect the actor-owned hand at a selected Supporter',
    priorObservedSeed:4153138373,
    expectedPriorNativeLedgerSha256:expected,
    resultRows:selected.result.rows.map((r,i)=>({
      trialId:r.trial.id,
      rootActionLedgerSha256:r.rootActionLedgerSha256,
      exactNativeActionLedgerReplayed:r.rootActionLedgerSha256===expected[r.trial.id],
      nativeEnded:r.endReason,
      nativeWinnerSeat:r.winner,
      sourcePhysicalDealFingerprint:r.sourceDealFingerprint,
      sourceAttackRoots:r.rootActionLedger.filter(a=>a.playerSlot===r.sourceSeat&&
        a.action==='AttackAction').map(a=>({
          ordinal:a.actionOrdinal,turn:a.turnBefore,attack:a.attack
        })),
      candidateRoots:r.rootActionLedger.filter(a=>a.playerSlot===r.candidateSeat&&
        (a.action==='PlayCardAction'&&
          String(a.card??'').startsWith("Lillie's Determination"))).map(a=>({
            ordinal:a.actionOrdinal,turn:a.turnBefore,card:a.card
        })),
      selectedPolicyOwnerHand:selected.audit.interventions[i].events,
      nativeLillieSettlement:selected.audit.interventions[i]
        .candidateLillieNativeDraws,
      competitiveQualified:false
    })),
    assertion:'Observational owner-hand printings from same previously exposed seed; no independent strength estimate',
    competitiveQualifiedGames:0
  };
  writeAtomicLocked(output,JSON.stringify(report,null,2)+'\n');
  return report;
}
if(require.main===module){
  const r=run();
  console.log(JSON.stringify({schema:r.schema,
    rows:r.resultRows.map(x=>({
      trialId:x.trialId,identicalNativeLedger:x.exactNativeActionLedgerReplayed,
      ownerHandAtLillie:x.selectedPolicyOwnerHand.map(e=>e.ownerHandPrintingsBefore)
    })),competitiveQualifiedGames:0}));
}
module.exports={run};
