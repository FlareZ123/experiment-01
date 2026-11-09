'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {runDevelopment} = require('../agent41-bilateral-v2-development.cjs');
const {sourceSummary} =
  require('../agent37-rank5-fusion-mobility-prospective.cjs');
const {saveAtomic} =
  require('../agent37-rank5-source-quickball-discard-retrospective.cjs');

const VERSION = 'agent37-mew-search-dce-funding-factorial-v1';
const ROOT = path.resolve(__dirname, '../../..');
const REGISTRATION =
  'results/aichi-2026/registrations/agent37-rank5-mew-search-funding-factorial-20261109.json';
const OUTPUT =
  path.join(ROOT, 'agent37-rank5-mew-search-dce-funding-factorial-32arm.json');
const SOURCE_SHA =
  'a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05';
const FIXED_CANDIDATES = ['champion-reference', 'new-moon-lockbreaker-v1'];

/** Return the source physical deals registered before execution. */
function registration() {
  const bytes = fs.readFileSync(path.join(ROOT, REGISTRATION));
  const reg = JSON.parse(bytes.toString('utf8'));
  assert.equal(reg.schema, 'agent37-rank5-mew-search-dce-funding-native-factorial-v1');
  assert.equal(reg.status, 'frozen-before-native-outcomes');
  assert.equal(reg.originalSourceRank, 5);
  assert.equal(reg.originalSourcePrinted60Sha256, SOURCE_SHA);
  assert.deepEqual(reg.candidateIds, FIXED_CANDIDATES);
  assert.equal(reg.plannedNativeAttempts, 32);
  assert.equal(reg.registeredGroups.length, 4);
  assert.deepEqual(reg.factorialAxes.mewOwnerQuickBallTarget, [false, true]);
  assert.deepEqual(reg.factorialAxes.sourceOnlyMewDceRecipient, [false, true]);
  assert.equal(reg.registeredGroups.filter(x=>x.candidateSlot==='A').length, 2);
  assert.equal(reg.registeredGroups.filter(x=>x.candidateSlot==='B').length, 2);
  const seeds = new Set();
  for (const group of reg.registeredGroups) {
    assert.equal(group.rank, 5);
    assert.ok(Number.isSafeInteger(group.repeat) && group.repeat>=0);
    assert.ok(['A','B'].includes(group.candidateSlot));
    assert.ok(Number.isSafeInteger(group.seed) &&
      group.seed>0 && group.seed<0x80000000);
    assert.ok(!seeds.has(group.seed));
    seeds.add(group.seed);
  }
  for (const old of reg.priorUsedSeedsExcluded) {
    assert.ok(!seeds.has(old), 'Historical exposed deal was reused');
  }
  const sourceAdmission =
    require('../../../results/aichi-2026/original-printed60-admission-v1.json');
  const source = sourceAdmission.rows.find(x=>x.rank===5);
  assert.equal(source?.physicalCards,60);
  assert.equal(source.printed60Sha256,SOURCE_SHA);
  const trials = reg.registeredGroups.flatMap(g => FIXED_CANDIDATES.map(
    candidateId => ({...g,candidateId,
      id:[g.rank,g.repeat,g.candidateSlot,candidateId].join(':')})));
  assert.equal(trials.length,8);
  return {reg,trials,digest:createHash('sha256').update(bytes).digest('hex')};
}

const AXES = Object.freeze([
  {id:'genericUnfunded',mewSearch:false,mewFunding:false},
  {id:'targetUnfunded',mewSearch:true,mewFunding:false},
  {id:'genericFunded',mewSearch:false,mewFunding:true},
  {id:'targetFunded',mewSearch:true,mewFunding:true}
]);

/**
 * Execute all four owner-only source decision policies on the exact same
 * eight original physical source/candidate initial deals. The two source
 * decision axes are frozen and tested across both fixed candidate sixties.
 * @returns {object} All outcomes including caps/errors, plus paired receipts.
 */
function runFactorial() {
  const {reg,trials,digest}=registration();
  const frozen=require('../agent41-frozen-bilateral-development-v2.json');
  assert.equal(frozen.policyOptions.actorOnlyComposition,true);
  const common = {
    ...frozen.policyOptions,
    actorNaturalEvolutionRoot:true,
    actorMewGenesectTechnoBlast:true,
    sourceScopedQuickBallRoot:true,
    actorHandDiscard:true,
    actorOnlySingleSearch:true,
    actorDceMewMobilityRoot:true,
    actorGenesectFusionDrawRoot:true
  };
  const modes={};
  for (const axis of AXES) {
    const options={
      ...common,
      actorMewGenesectQuickBallSearch:axis.mewSearch,
      actorMewDceRecipientRoot:axis.mewFunding,
      actorMewDceRecipientSourceOnly:axis.mewFunding
    };
    try {
      const data=runDevelopment({
        ...options,registeredTrials:trials,
        registeredFrameName:VERSION+'-'+axis.id,
        allowAdditionalOriginalSourceRanks:true
      });
      assert.equal(data.attempted,trials.length);
      assert.deepEqual(data.rows.map(x=>x.trial.id),
        trials.map(x=>x.id));
      modes[axis.id]={
        axis,
        attempts:data.rows.map(x=>({
          trial:x.trial,
          summary:sourceSummary(x),
          nativeStatus:x.status??null,
          rawNativeRow:x
        })),
        nativeReport:data,batchError:null
      };
    } catch (error) {
      modes[axis.id]={
        axis,
        attempts:trials.map(trial=>({
          trial,summary:{nativeDisposition:'NATIVE_BATCH_ERROR',
            sourceDealFingerprint:null,fullPhysicalDealFingerprint:null,
            sourceAttackDeclarations:null,competitiveGameQualified:false},
          nativeStatus:'batch-error',rawNativeRow:null
        })),
        nativeReport:null,batchError:String(error?.stack??error)
      };
    }
  }
  const comparison=trials.map((trial,index)=>{
    const arms=Object.fromEntries(AXES.map(axis=>{
      const attempt=modes[axis.id].attempts[index];
      const row=attempt.rawNativeRow,summary=attempt.summary;
      return [axis.id,{
        sourceDealFingerprint:summary.sourceDealFingerprint??null,
        fullPhysicalDealFingerprint:summary.fullPhysicalDealFingerprint??null,
        sourceSeat:summary.sourceSeat??null,
        sourceAttackDeclarations:summary.sourceAttackDeclarations??null,
        sourceSettledAttacks:row?.sourceAttackSettlement?.settled??null,
        sourcePrizesRemaining:row?.finalPrizes?.[summary.sourceSeat]??null,
        nativeFinished:row?.finished===true,
        nativeWinner:row?.winner??null,
        disposition:summary.nativeDisposition,
        rootActions:summary.rawNativeActions??null,
        nativeStatus:attempt.nativeStatus
      }];
    }));
    const sourceFingerprints=AXES.map(x=>arms[x.id].sourceDealFingerprint);
    const fullFingerprints=AXES.map(x=>arms[x.id].fullPhysicalDealFingerprint);
    const sourceMatch=sourceFingerprints.every(x=>x&&x===sourceFingerprints[0]);
    const fullMatch=fullFingerprints.every(x=>x&&x===fullFingerprints[0]);
    const allMatched=sourceMatch&&fullMatch;
    const differences=allMatched?{
      searchNoFunding:arms.targetUnfunded.sourceAttackDeclarations-
        arms.genericUnfunded.sourceAttackDeclarations,
      searchWithFunding:arms.targetFunded.sourceAttackDeclarations-
        arms.genericFunded.sourceAttackDeclarations,
      fundingGenericSearch:arms.genericFunded.sourceAttackDeclarations-
        arms.genericUnfunded.sourceAttackDeclarations,
      fundingTargetSearch:arms.targetFunded.sourceAttackDeclarations-
        arms.targetUnfunded.sourceAttackDeclarations
    }:null;
    return {trial,sourceMatch,fullMatch,allMatched,arms,differences,
      competitiveQualified:false};
  });
  return {
    schema:VERSION,
    preregistration:REGISTRATION,preregistrationSha256:digest,
    unchangedCandidateIds:reg.candidateIds,
    originalSourcePrinted60Sha256:SOURCE_SHA,
    frozenPolicyManifest:'simulation/evaluation/agent41-frozen-bilateral-development-v2.json',
    experimentalArms:AXES,
    plannedNativeAttempts:32,
    actualNativeAttempts:Object.values(modes).reduce(
      (n,m)=>n+m.attempts.length,0),
    fourArmPhysicalSourceAndFullMatches:comparison.filter(x=>x.allMatched).length,
    comparison,modes,
    competitiveQualifiedGames:0,certifiedWinRate:null,
    notes:['All native errors and root caps retained','This is developmental source-policy evidence, not a competitive matchup win rate']
  };
}

if(require.main===module) {
  if(process.argv.includes('--inspect-only')){
    const {reg,trials,digest}=registration();
    process.stdout.write(JSON.stringify({
      schema:VERSION,preregistrationSha256:digest,
      ids:trials.map(x=>x.id),modes:AXES.map(x=>x.id),
      plannedNativeAttempts:reg.plannedNativeAttempts
    },null,2)+'\n');
  }else {
    const result=runFactorial();
    saveAtomic(OUTPUT,result);
    process.stdout.write(JSON.stringify({
      schema:result.schema,preregistrationSha256:result.preregistrationSha256,
      plannedNativeAttempts:result.plannedNativeAttempts,
      actualNativeAttempts:result.actualNativeAttempts,
      fourArmPhysicalSourceAndFullMatches:result.fourArmPhysicalSourceAndFullMatches,
      comparison:result.comparison,
      batchErrors:Object.fromEntries(Object.entries(result.modes)
        .filter(([,m])=>m.batchError).map(([k,m])=>[k,m.batchError])),
      competitiveQualifiedGames:0
    },null,2)+'\n');
    if(Object.values(result.modes).some(m=>m.batchError))process.exitCode=1;
  }
}

module.exports={VERSION,REGISTRATION,OUTPUT,registration,AXES,runFactorial};
