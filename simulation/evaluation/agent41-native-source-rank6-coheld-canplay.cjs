'use strict';

const assert=require('node:assert/strict');
const {readRegistration}=require('./agent41-rank6-grouped-denial-source-panel.cjs');

const VERSION='agent41-two-candidate-natural-rank6-source-canplay-v1';
const SOURCE_DEAL_SHA='29db5b5feaf15b2eec86b19e7d1bbe46738f63ef8e479da9a22ecb46970a1dab';

/** Focus on the exact early registered source state, preserving both candidate replies. */
function runFocusedNativeEligibility(){
  const plan=readRegistration();
  const focus=plan.trials.filter(t=>t.rank===6&&t.repeat===10);
  assert.equal(focus.length,2);
  assert.equal(focus[0].seed,296638747);
  assert.ok(focus.every(t=>t.seed===focus[0].seed&&
    t.candidateSlot==='A'));
  const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
  const original=runDevelopment({
    actorOnlyComposition:true,
    mandatoryOptionFallback:true,
    paperSupporterQuota:true,
    nativePressureWindows:true,
    nativeAcceptedTargets:true,
    sameRootProposalChoice:true,
    sameRootProbeAll:true,
    sameRootChoiceApply:false,
    nativeCoheldDenialCanPlay:true,
    registeredTrials:focus,
    registeredFrameName:
      'agent41-preregistered-rank6-physical-source-seed-296638747-native-canplay'
  });
  assert.equal(original.attempted,2);
  assert.equal(original.competitiveQualifiedGames,0);
  const rows=original.rows.map(row=>{
    const audit=row.actorOnlyDecisionCoverage?.detailedComponentAudits
      ?.root??null;
    const physical=audit?.nativeCoheldDenialCanPlayWitnesses??[];
    return {
      trial:row.trial.id,
      sourceSeat:row.sourceSeat??null,
      sourceDealFingerprint:row.sourceDealFingerprint??null,
      fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
      nativeStatus:row.status??(row.finished?'engine-terminal':'censored'),
      originalActionLedgerSha256:row.rootActionLedgerSha256??null,
      naturalCoheldRootCount:audit?.nativeCoheldDenialCanPlayRoots??null,
      bothNativeCardCanPlayRoots:audit?.nativeCoheldDenialBothPlayableRoots??null,
      firstAuthenticCoheldRoot:physical[0]??null,
      allBoundedNativeCanPlayReceipts:physical,
      noActualSupporterBranchDispatched:true,
      qualification:false
    };
  });
  const champion=rows.find(r=>
    r.trial==='6:10:A:champion-reference');
  assert.ok(champion&&champion.sourceSeat===1);
  assert.equal(champion.sourceDealFingerprint,SOURCE_DEAL_SHA,
    'Exact natural original full-source physical deal must be reproduced');
  const first=champion.firstAuthenticCoheldRoot;
  assert.ok(first,'The genuine original early coheld root disappeared');
  assert.equal(first.globalTurn,2);
  assert.equal(first.rootOrdinal,4);
  assert.equal(first.seat,1);
  assert.ok(first.plumeria.length>=1&&first.teamFlare.length>=1);
  return {
    schema:VERSION,manifestBlob:
      '6f4a694403069674f33daf81eff18971e214b758',
    originalSourceSeed:296638747,originalSourceRank:6,
    candidatePhysicalSlot:'A',pinnedTwinleafRevision:
      'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    rows,competitiveQualifiedGames:0,
    caveat:'Exact native owner-hand canPlay and owner-public nonmutation only. Neither alternate Supporter was dispatched; their multi-step prompt settlements, followthrough and competitive strength are unknown.'
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(runFocusedNativeEligibility(),null,2)+'\n');

module.exports={VERSION,runFocusedNativeEligibility};
