'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {runNativeTrainerAbaV10,writePanel}=
  require('../simulation/evaluation/agent3-issue25-native-trainer-aba-v10.cjs');

test('real compiled Twinleaf fixed 8x3 control / generic native Trainer fallback / repeated control',()=>{
  const result=runNativeTrainerAbaV10();
  const dir=process.env.ISSUE25_AGENT3_V10_RECEIPT_DIR;
  const saved=dir?writePanel(result,dir):null;
  console.log('AGENT3_ISSUE25_TRAINER_FALLBACK_ABA_V10_NATIVE',
    JSON.stringify({
      attemptsExpected:result.attemptsExpected,
      attemptsArchived:result.attemptsArchived,
      physicalMatchGroups:result.physicalMatchGroups,
      sourcePhysicalMatchGroups:result.sourcePhysicalMatchGroups,
      printedSixtiesMatchGroups:result.printedSixtiesMatchGroups,
      originalV6ControlReproducedGroups:
        result.originalV6ControlReproducedGroups,
      repeatedControlPublicRootReproducedGroups:
        result.repeatControlPublicRootReproducedGroups,
      treatedNativeFallbackAcceptedRoots:
        result.treatmentAcceptedNativeTrainerFallbackRoots,
      treatedOriginalSourceNonPassRoots:
        result.originalSourceSelectedNonPassTotalTreatment,
      baselineOriginalSourceNonPassRoots:
        result.originalSourceSelectedNonPassTotalControl,
      treatedOriginalSourceAttacks:
        result.originalSourceAttackTotalTreatment,
      baselineOriginalSourceAttacks:
        result.originalSourceAttackTotalControl,
      nativeErrors:result.treatmentNativeErrors,
      firstActionForks:result.firstPublicActionDifferences,
      perTrial:result.groups.map(g=>({
        id:g.id,physicalMatch:g.physicalInputEqual,
        originalBaselineReproduced:g.baselineReplayMatch,
        repeatControlIdentical:g.repeatedControlIdentical,
        sourceNonPassDelta:g.nativeSourceNonPassDelta,
        sourceAttackDelta:g.nativeSourceAttacksDelta,
        dispositions:g.arms.map(a=>a.status),
        treatedFallback:g.arms[1].genericNativeFallback,
        firstFork:g.firstPublicActionDifference
      })),
      competitivelyQualifiedGames:result.independentCompetitiveGames,
      artifact:saved
    }));
  assert.equal(result.attemptsArchived,24);
  assert.equal(result.physicalMatchGroups,8,
    'An A/B/A original source or contender physical opening changed');
  assert.equal(result.printedSixtiesMatchGroups,8,
    'A candidate or source deck switched during treatment');
  assert.equal(result.originalV6ControlReproducedGroups,8,
    'The same cached native v6 controls were not truly replayed');
  assert.equal(result.repeatControlPublicRootReproducedGroups,8,
    'An A/A native control drifted, invalidating causal attribution');
  assert.equal(result.independentCompetitiveGames,0);
});
