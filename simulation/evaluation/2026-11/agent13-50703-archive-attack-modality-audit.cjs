'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const {postgameAttackModalityLedger}=
  require('./agent13-postgame-attack-modality-ledger.cjs');

const ORIGINAL_JSON_SHA256=
  'dbeda0ca529218883f83f13173682483f6fbb10adf32a8767dd756ff606ad9a7';
const EXPECTED_PERFECTION_ROOTS=[87,103,122];
const EXPECTED_PERFECTION_PRIZES=[2,3,1];
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Audit only the existing, retrospective source-physical A/B/A game.
 * This audit must never be counted as a new experiment or as paper evidence.
 * @param {object} archived Frozen native artifact.
 * @returns {object} Human-readable machine-checkable native witness.
 */
function audit(archived){
  assert.equal(archived.schema,
    'agent36-posthoc-real-native-gengar-resource-v3-50703-aba-v1');
  assert.equal(archived.posthocTargetSelection,true);
  assert.equal(archived.qualifiedPaperGames,0);
  assert.equal(archived.matchedCompletePhysicalDeal,true);
  assert.equal(archived.controlRepeatActionDifference,null);
  assert.equal(archived.controlRepeatPhysicalDifference,null);
  assert.equal(archived.arms.length,3);
  const outputs=archived.arms.map((arm,index)=>{
    assert.equal(arm.roots.length,arm.physicalTape.postAcceptedRoots.length);
    // Historical artifact versions can omit redundant seat fields. The
    // frozen trial's candidateSlot A fixes candidate=0/source=1.
    assert.equal(archived.trial.candidateSlot,'A');
    if(arm.candidateSeat!==undefined)assert.equal(arm.candidateSeat,0);
    if(arm.sourceSeat!==undefined)assert.equal(arm.sourceSeat,1);
    const result=postgameAttackModalityLedger({
      rootActionLedger:arm.roots,
      physicalZoneTape:arm.physicalTape,
      nativeFinished:arm.nativeFinished
    });
    const candidate=result.events.filter(e=>e.ownerSeat===0);
    const copied=candidate.filter(e=>
      e.modality==='perfection-copied-attack-initiation');
    const ordinary=candidate.filter(e=>
      e.modality==='ordinary-root-attack');
    const prizeSum=copied.reduce((n,e)=>n+(e.observedSameTurnPrizeDelta??0),0);
    return {
      phase:arm.phase,
      nativeWinner:arm.nativeWinner,
      candidateOrdinaryAttackRootCount:ordinary.length,
      candidatePerfectionInitiations:copied.length,
      candidateCopiedChoicesObserved:copied.filter(e=>
        e.copyChoiceStatus==='observed').length,
      candidatePerfectionRoots:copied.map(e=>e.initiatingRootOrdinal),
      candidatePerfectionPrizeChanges:copied.map(e=>
        e.observedSameTurnPrizeDelta),
      candidatePositivePrizeEpisodes:copied.filter(e=>
        e.observedSameTurnPrizeDelta>0).map(e=>({
          root:e.initiatingRootOrdinal,prizes:e.observedSameTurnPrizeDelta,
          printedCopyChoice:e.copyChoice?.attackName??null,
          copyChoiceStatus:e.copyChoiceStatus,
          nativeSettlementStatus:e.nativeSettlementStatus
        })),
      candidatePhysicalPerfectionReceiptPrizes:copied.map(e=>
        e.physicalPerfectionReceipt?.actualPrizesTaken??null),
      candidateTotalPerfectionPhysicalPrizes:prizeSum,
      sourceOrdinaryAttackRootCount:result.events.filter(e=>
        e.ownerSeat===1&&e.modality==='ordinary-root-attack').length,
      rootLedgerSha256:digest(arm.roots),
      storePhysicalTapeSha256:digest(arm.physicalTape),
      physicalTapeAvailable:result.physicalTapeAvailable,
      nativeFinished:arm.nativeFinished,
      paperQualified:false
    };
  });
  const [baseline,treatment,repeat]=outputs;
  // Actual source tape contains attempted Perfection roots in every arm;
  // the observed native six-Prize sequence is a *subset* of B initiations.
  assert.deepEqual([baseline.candidatePerfectionInitiations,
    treatment.candidatePerfectionInitiations,repeat.candidatePerfectionInitiations],
    [2,4,2]);
  assert.deepEqual(treatment.candidatePositivePrizeEpisodes.map(e=>e.root),
    EXPECTED_PERFECTION_ROOTS);
  assert.deepEqual(treatment.candidatePositivePrizeEpisodes.map(e=>e.prizes),
    EXPECTED_PERFECTION_PRIZES);
  assert.deepEqual(treatment.candidatePhysicalPerfectionReceiptPrizes
    .filter(x=>x>0),EXPECTED_PERFECTION_PRIZES);
  assert.equal(baseline.candidateTotalPerfectionPhysicalPrizes,0);
  assert.equal(repeat.candidateTotalPerfectionPhysicalPrizes,0);
  assert.equal(treatment.candidateOrdinaryAttackRootCount,0);
  assert.equal(treatment.candidateTotalPerfectionPhysicalPrizes,6);
  assert.equal(treatment.nativeWinner,0);
  assert.equal(baseline.nativeWinner,1);
  assert.equal(repeat.nativeWinner,1);
  assert.equal(baseline.rootLedgerSha256,repeat.rootLedgerSha256);
  assert.equal(baseline.storePhysicalTapeSha256,repeat.storePhysicalTapeSha256);
  return {
    schema:'agent13-real-50703-attack-modality-archive-audit-v1',
    provenance:'single posthoc original-source native A/B/A',
    originalNativeJsonSha256:ORIGINAL_JSON_SHA256,
    originalCaseId:archived.caseId,
    modalityFixRequiresNoNativeReplay:true,
    originalPhysicalDealMatched:true,
    passed:true,
    counts:outputs,
    qualifiedPaperGames:0,
    legitimateProspectivePerformanceSamples:0,
    finalDeckSelected:false
  };
}

function main(file){
  assert.equal(typeof file,'string');
  const bytes=fs.readFileSync(file);
  const actual=createHash('sha256').update(bytes).digest('hex');
  assert.equal(actual,ORIGINAL_JSON_SHA256,
    'Original native artifact SHA must match before analyzing its content');
  const result=audit(JSON.parse(bytes.toString('utf8')));
  process.stdout.write('AGENT13_REAL_50703_POSTGAME_ATTACK_LEDGER '+
    JSON.stringify(result)+'\n');
  return result;
}
if(require.main===module)main(process.argv[2]);
module.exports={ORIGINAL_JSON_SHA256,EXPECTED_PERFECTION_ROOTS,
  EXPECTED_PERFECTION_PRIZES,audit,main};
