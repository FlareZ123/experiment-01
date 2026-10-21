'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

/**
 * Compare original rank-11 source-locked printed-copying policies. Both
 * packets must be actual independently executed pinned Store games, and the
 * only requested treatment factor is the public zero-hand attack decision.
 * This retrospective pair cannot qualify a competitive win.
 *
 * @param {object} baseline Unchanged Poltergeist-preferring source packet.
 * @param {object} treatment Same source and policy with the opt-in alternative.
 * @returns {object} Failure-inclusive physical-deal and choice comparison.
 */
function compareNativePair(baseline,treatment){
  for(const row of [baseline,treatment]){
    assert.equal(row.sourceRank,11);
    assert.equal(row.sourceSeed,1244180408);
    assert.equal(row.sourceSeat,0);
    assert.equal(row.candidateSeat,1);
    assert.equal(row.retrospectivelySelected,true);
    assert.equal(row.firstTurnSlot,0);
    assert.equal(row.sourceLineCompleted,true);
    assert.equal(row.competitiveQualifiedGames,0);
    assert.equal(row.preferGengarPoltergeist,true);
    assert.equal(row.sourceTurn49QuickBalls,false);
    assert.equal(row.decisions.rejected,0);
    assert.ok(row.decisions.accepted>=1);
    assert.ok(Array.isArray(row.decisions.selections));
    assert.ok(Array.isArray(row.candidateChoices));
  }
  assert.equal(baseline.preferZeroHandPrintedDamage,false);
  assert.equal(treatment.preferZeroHandPrintedDamage,true);
  assert.equal(baseline.attackerPolicyVersion.endsWith(
    '+agent13-gengar-poltergeist-first-v1'),true);
  assert.equal(treatment.attackerPolicyVersion,
    baseline.attackerPolicyVersion+'+agent50-zero-hand-poltergeist-v1');

  // Equal seed alone cannot authenticate a real same-physical-origin pair.
  // Require actual original-source starter and pre-first-copy Store prefix
  // plus physical list fingerprints to coincide.
  assert.deepEqual(treatment.deckHashes,baseline.deckHashes);
  assert.ok(baseline.firstCopyPrecedingRootCount>0);
  assert.equal(treatment.firstCopyPrecedingRootCount,
    baseline.firstCopyPrecedingRootCount);
  assert.equal(treatment.firstCopyPrecedingRootSha256,
    baseline.firstCopyPrecedingRootSha256,
    'Native accepted roots differed before any copy-prompt treatment opportunity');

  const changedSelections=treatment.decisions.selections.filter(row=>
    row.zeroHandAlternativeApplied===true);
  for(const selection of changedSelections){
    assert.equal(selection.publicOpponentHandCount,0);
    assert.deepEqual(selection.withoutZeroHandOption?.constructor,Object);
    assert.ok(selection.withoutZeroHandOption.sourceIndex>=0);
    assert.notEqual(selection.attack,'Poltergeist',
      'Treatment must actually select another printed attack');
  }

  const original=baseline.decisions.selections;
  const experimental=treatment.decisions.selections;
  let firstDifferentSelection=null;
  for(let i=0;i<Math.max(original.length,experimental.length);i++){
    const a=original[i]??null,b=experimental[i]??null;
    if(!a||!b||a.seat!==b.seat||a.turn!==b.turn||
        a.printing!==b.printing||a.attack!==b.attack){
      firstDifferentSelection={index:i,baseline:a,treatment:b};
      break;
    }
  }

  return {
    schema:'agent50-zero-hand-copied-attack-native-pair-v1',
    date:'2026-10-21',
    exactFrozenSource:'Aichi rank11 source 60 versus unchanged New Moon proxy 60',
    sourceRank:11,seed:1244180408,
    originalStarterSeat:baseline.firstTurnSlot,
    firstCopyPrecedingNativeRoots:baseline.firstCopyPrecedingRootCount,
    sameNativePrefixBeforeFirstCopy:true,
    firstCopyPrefixSha256:baseline.firstCopyPrecedingRootSha256,
    samePhysicalPrintingsFingerprint:true,
    onlyIntendedDifference:'preferZeroHandPrintedDamage false versus true',
    baselineVersion:baseline.attackerPolicyVersion,
    treatmentVersion:treatment.attackerPolicyVersion,
    baselineCopySelections:original.length,
    treatmentCopySelections:experimental.length,
    confirmedPublicZeroHandAlternatives:changedSelections.length,
    nativeTriggerSelections:changedSelections,
    firstDifferentSelection,
    baselineOutcomes:{
      storeActions:baseline.nativeActionCount,
      candidateAttacks:baseline.declarations,
      candidateCopyChoices:baseline.candidateChoices,
      prizes:baseline.prizesRemaining,winnerSeat:baseline.winnerSeat,
      finished:baseline.finished,endReason:baseline.endReason,
      sourceResponseRoots:baseline.sourceRank11ActionsAfterFirstCopy
    },
    treatmentOutcomes:{
      storeActions:treatment.nativeActionCount,
      candidateAttacks:treatment.declarations,
      candidateCopyChoices:treatment.candidateChoices,
      prizes:treatment.prizesRemaining,winnerSeat:treatment.winnerSeat,
      finished:treatment.finished,endReason:treatment.endReason,
      sourceResponseRoots:treatment.sourceRank11ActionsAfterFirstCopy
    },
    sameFullNativeRootDigest:
      baseline.sourceActionLedgerDigest===treatment.sourceActionLedgerDigest,
    interpretation:changedSelections.length>0?
      'At least one genuinely Store-selected alternative was triggered by publicly zero opponent hand; inspect effect and response before tactical inference':
      'No changed copy prompt was observed; this selected retrospective source game does not exercise the proposed treatment',
    limitations:[
      'Retrospectively selected seed and incomplete generic two-player policies',
      'Native and paper attack effects not fully independently certified',
      'Printed positive damage does not prove a real knockout or tactical superiority',
      'The single matched game is not a win-rate sample or an actual tournament clock'
    ],
    qualifiedCompetitiveGames:0
  };
}

if(require.main===module){
  assert.equal(process.argv.length,4,'Supply baseline and treatment JSON files');
  const baseline=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const treatment=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
  process.stdout.write(JSON.stringify(compareNativePair(baseline,treatment),null,2)+'\n');
}

module.exports={compareNativePair};
