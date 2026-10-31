'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const VERSION='agent7-same-root-original-store-readonly-parity-v1';
const OPTION_FIELDS=[
  'sameRootProposalChoiceOptIn','sameRootChoiceApplyOptIn',
  'sameRootProbeAllOptIn','sameRootPublicEventReceiptOptIn',
  'sameRootProposalAuditedArms','sameRootChangedRoots'
];

/**
 * Remove only same-root instrumentation. Preserve all engine results,
 * original physical deal hashes, actual prompts, full root actions,
 * accepted physical target sidecars, failure classifications and sources.
 * @param {object} report Four-arm original Store output.
 * @returns {object}
 */
function gameplayWithoutSameRootInstrumentation(report){
  const copy=structuredClone(report);
  for(const key of OPTION_FIELDS)delete copy[key];
  for(const row of copy.rows??[]){
    delete row.actorOnlyDecisionCoverage;
    delete row.actorOnlyPolicyVersion;
  }
  return copy;
}

/**
 * Compare same-checkout original Store gameplay with the all-proposer
 * observer OFF versus ON. All proposer choices must remain the baseline.
 * This is a development noninterference gate, never game-win evidence.
 * @param {object} control
 * @param {object} observed
 * @returns {object}
 */
function compareNativeSameRootObservation(control,observed){
  for(const r of [control,observed]){
    assert.equal(r.attempted,4);
    assert.equal(r.rows?.length,4);
    assert.equal(r.competitiveQualifiedGames,0);
    assert.equal(r.actorOnlyCompositionOptIn,true);
    assert.equal(r.nativeAcceptedTargetsOptIn,true,
      'Physical target receipts must be enabled in both arms');
  }
  assert.equal(control.sameRootProposalChoiceOptIn,false);
  assert.equal(observed.sameRootProposalChoiceOptIn,true);
  assert.equal(observed.sameRootChoiceApplyOptIn,false);
  assert.equal(observed.sameRootProbeAllOptIn,true);
  assert.equal(observed.sameRootProposalAuditedArms,4);
  assert.equal(observed.sameRootChangedRoots,0);
  assert.deepStrictEqual(
    gameplayWithoutSameRootInstrumentation(observed),
    gameplayWithoutSameRootInstrumentation(control),
    'Read-only same-root probing changed actual Store actions, physical targets, prompts, engine outcomes or error evidence');
  const bySeat={0:{ownerRoots:0,independentOfferRoots:0},
    1:{ownerRoots:0,independentOfferRoots:0}};
  const kindCounts={},selectorErrors=[];
  const arms=[];
  for(let i=0;i<control.rows.length;i++){
    const a=control.rows[i],b=observed.rows[i];
    assert.equal(a.trial.id,b.trial.id);
    assert.equal(a.sourceDealFingerprint,b.sourceDealFingerprint);
    assert.equal(a.fullPhysicalDealFingerprint,b.fullPhysicalDealFingerprint);
    assert.equal(a.actualStarterSeat,b.actualStarterSeat);
    assert.equal(a.rootActionLedgerSha256,b.rootActionLedgerSha256);
    assert.deepStrictEqual(a.nativeAcceptedTargetSidecar,
      b.nativeAcceptedTargetSidecar);
    assert.deepStrictEqual(a.nativeAcceptedEnergyPromptSidecar,
      b.nativeAcceptedEnergyPromptSidecar);
    const audit=b.actorOnlyDecisionCoverage?.detailedComponentAudits?.root
      ?.sameRootProposalChoice;
    assert.ok(audit&&audit.ownerRoots>0,
      'No genuine owner-root receipts from actual Store');
    assert.equal(audit.changedRoots,0);
    assert.ok(audit.offerRoots<=audit.ownerRoots);
    for(const seat of [0,1]){
      bySeat[seat].ownerRoots+=audit.bySeat[seat].ownerRoots;
      bySeat[seat].independentOfferRoots+=
        audit.samples.filter(sample=>sample.seat===seat&&
          sample.supportedAlternativeCount>0).length;
    }
    for(const [kind,count] of Object.entries(audit.offerKindCounts)){
      kindCounts[kind]=(kindCounts[kind]??0)+count;
    }
    if(audit.selectorErrorRoots){
      selectorErrors.push({trial:b.trial.id,
        roots:audit.selectorErrorRoots,
        samples:audit.selectorErrorSamples});
    }
    arms.push({trial:b.trial.id,sourceSeat:b.sourceSeat,
      sourceDeal:b.sourceDealFingerprint,rootSha:b.rootActionLedgerSha256,
      physicalTargetReceiptPresent:b.nativeAcceptedTargetSidecar!=null,
      ownerRoots:audit.ownerRoots,
      independentOfferRoots:audit.offerRoots,
      selectorErrorRoots:audit.selectorErrorRoots,
      status:b.status??(b.finished?'terminal':'censored')});
  }
  return {
    version:VERSION,pairedOriginalStoreArms:4,
    samePhysicalDeals:true,identicalRootLedger:true,
    identicalNativeTargetAndPromptEvidence:true,
    gameAndFullNonActorAuditsIdentical:true,
    bySeat,observedOfferKinds:kindCounts,
    selectorErrors,arms,competitiveQualifiedGames:0,
    caveat:'Read-only native parity is not native playability of alternatives, policy competence or a win-rate estimate'
  };
}

if(require.main===module){
  assert.equal(process.argv.length,4,
    'Usage: node scripts/agent7-same-root-native-parity.cjs CONTROL.json OBSERVED.json');
  const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
  const report=compareNativeSameRootObservation(
    read(process.argv[2]),read(process.argv[3]));
  process.stdout.write('SAME_ROOT_NATIVE_READONLY_PARITY '+
    JSON.stringify(report)+'\n');
}

module.exports={VERSION,gameplayWithoutSameRootInstrumentation,
  compareNativeSameRootObservation};
