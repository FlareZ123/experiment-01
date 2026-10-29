'use strict';

const assert=require('node:assert/strict');
const {frozenInputs,runVariant}=
  require('./agent3-source-vip-k1-native-pair.cjs');
const {executeOwnerVip}=
  require('./agent9-original-rank11-vip-native.cjs');

/**
 * A second already-reported source-first original physical deal (seat zero)
 * complements the rank11 candidate-slot-A, source-seat-one fixture. This
 * retains the exact source sixty, seed, engine and common two-seat policy.
 * @returns {object} Frozen original fields with candidate/source seats reversed.
 */
function seatZeroFixture(){
  const fixture=frozenInputs();
  const seed=2246176619;
  const trial={rank:11,repeat:0,candidateSlot:'B',
    candidateId:'champion-reference',seed,
    id:'11:0:B:champion-reference'};
  return {...fixture,trial};
}

function run(){
  const fixture=seatZeroFixture();
  // Agent3's baseline helper does not install its seat-one VIP bridge in the
  // baseline variant. Its source-seat label in that helper is unused here.
  const baseline=runVariant('baseline',fixture);
  const treatment=executeOwnerVip(fixture);
  assert.equal(baseline.status,'native-returned');
  assert.equal(treatment.sourceSeat,0);
  assert.equal(treatment.candidateSeat,1);
  assert.equal(baseline.sourceDealFingerprint,treatment.sourceDealFingerprint,
    'Exact source physical deal differs between policy variants');
  assert.equal(baseline.fullPhysicalDealFingerprint,
    treatment.fullPhysicalDealFingerprint,
    'Physical candidate+source setup differs');
  assert.equal(baseline.actualStarterSeat,treatment.actualStarterSeat,
    'Actual first player changed across same-deal policies');
  const evidence={
    sourcePlayCount:treatment.sourceVipRoots.length,
    nativeItems:treatment.nativeVipAudit.bySeat[0].items,
    nativeSearches:treatment.nativeVipAudit.bySeat[0].searches,
    nativeBenchWitnesses:treatment.nativeVipAudit.bySeat[0].benchConfirmed,
    rejectedItems:treatment.nativeVipAudit.rejectedItems,
    rejectedSearches:treatment.nativeVipAudit.rejectedSearches,
    opponentNextRoot:Boolean(treatment.firstCandidateReplyAfterVip)
  };
  const gatePassed=evidence.sourcePlayCount>=1&&
    evidence.nativeItems>=1&&evidence.nativeSearches>=1&&
    evidence.nativeBenchWitnesses>=1&&
    evidence.rejectedItems===0&&evidence.rejectedSearches===0&&
    evidence.opponentNextRoot;
  return {
    schema:'agent9-native-original-rank11-source-seat0-vip-v1',
    originalSourceRank:11,printedSourceUnchanged:true,
    originalSeed:fixture.trial.seed,sourceSeat:0,candidateSeat:1,
    originalSourceDeal:baseline.sourceDealFingerprint,
    originalFullSetup:baseline.fullPhysicalDealFingerprint,
    originalActualStarter:baseline.actualStarterSeat,
    controlAcceptedRootHash:baseline.rootActionLedgerSha256,
    controlRootCount:baseline.rootActionCount,
    treatment,gatePassed,evidence,
    competitiveQualifiedGames:0,
    caveat:'Retrospectively identified VIP-held physical source opening. Native action and reply mechanism only; no game-strength inference.'
  };
}

if(require.main===module){
  const output=run();
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
  process.stderr.write('AGENT9_SEAT0_VIP '+JSON.stringify({
    gatePassed:output.gatePassed,evidence:output.evidence,
    audit:output.treatment.nativeVipAudit,
    selected:output.treatment.sourceVipFirstTurnRoot,
    reply:output.treatment.firstCandidateReplyAfterVip
  })+'\n');
  if(!output.gatePassed)process.exitCode=1;
}
module.exports={seatZeroFixture,run};
