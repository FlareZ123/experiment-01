'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {runStewardBilateralProbeV9,writeJsonAtomic}=
  require('./agent36-issue25-common-v9-bilateral-competence.cjs');

const VERSION='agent7-v9-bilateral-known-dead-retrospective-v1';
const ARTIFACT=path.resolve(__dirname,
  '../../artifacts/agent36-bilateral-competence-v9/issue25-common-v9.json');

/**
 * Add the existing exact-printing, owner-visible known-dead attack preference
 * symmetrically. This does not touch the registration, physical 60s, RNG,
 * source owner prompt adapters, or pinned Twinleaf source.
 *
 * @param {Function} runner Existing canonical real-game runner.
 * @returns {Function} Runner with a single additional bilateral policy flag.
 */
function bilateralKnownDeadRunner(runner){
  assert.equal(typeof runner,'function');
  return options=>{
    assert.equal(options.actorOnlyComposition,true);
    assert.equal(options.sourceIndependentCommonPolicy,true);
    assert.equal(options.allowAdditionalOriginalSourceRanks,false);
    assert.notEqual(options.candidateOnlyKnownDeadRoot,true);
    return runner({...options,bilateralKnownDeadAttackRoot:true,
      candidateOnlyKnownDeadRoot:false});
  };
}

/**
 * @param {{runProbe?:Function,runner?:Function}} [deps]
 * @returns {object} Unqualified native developmental receipt.
 */
function runAgent7KnownDeadV9(deps={}){
  const probe=deps.runProbe??runStewardBilateralProbeV9;
  const runner=deps.runner??runDevelopment;
  const output=probe({runner:bilateralKnownDeadRunner(runner)});
  assert.equal(output?.manifest?.samePolicyBothSeats,true);
  assert.equal(output.manifest.sourceIndependentCommonPolicy,true);
  assert.equal(output.manifest.actorOnlyComposition,true);
  assert.equal(output.manifest.registeredTrialCount,1);
  assert.deepEqual(output.manifest.originalSourceRanks,[11]);
  assert.equal(output.manifest.candidateSlot,'B');
  assert.equal(output.manifest.competitiveGamesQualified,0);
  const wrapperHash=createHash('sha256')
    .update(fs.readFileSync(__filename)).digest('hex');
  output.manifest.agent7RetrospectiveVariant={
    version:VERSION,
    fromPreviouslyExposedNativePhysicalSeed:true,
    historicalOnly:true,prospective:false,
    sourceIndependentBothSeats:true,
    ownerVisibleExactPrintedAttackChoice:true,
    firstPayableKnownDeadPreferenceOnly:true,
    sourcePolicyUnchangedExceptDeclaredFlag:true,
    bilateralKnownDeadAttackRoot:true,
    candidateOnlyKnownDeadRoot:false,
    wrapperFile:path.relative(path.resolve(__dirname,'../..'),__filename)
      .replaceAll('\\','/'),
    wrapperSha256:wrapperHash
  };
  output.manifest.historicalOnly=true;
  output.manifest.prospective=false;
  output.manifest.postExposureOwnerPolicyRepair=true;
  output.manifest.confirmatoryTrial=false;
  output.qualification.bilateralMaterialEpisodeQualified=false;
  output.qualification.competitiveAdmission=false;
  output.qualification.reason=
    'Known-dead attack preference introduced after exposure of this physical '+
    'rank11/New Moon seed. Retrospective one-game development only; independent '+
    'paper, hidden-zone, clock and full-field audits are absent.';
  return output;
}

function main(){
  const output=runAgent7KnownDeadV9();
  writeJsonAtomic(ARTIFACT,output);
  process.stdout.write(JSON.stringify({
    version:VERSION,
    id:output.nativeAttempt.id,
    sourceDealFingerprint:output.nativeAttempt.sourceDealFingerprint,
    fullPhysicalDealFingerprint:output.nativeAttempt.fullPhysicalDealFingerprint,
    rootActionCount:output.nativeAttempt.rootActionCount,
    status:output.nativeAttempt.status,
    finished:output.nativeAttempt.finished,
    finalPrizes:output.nativeAttempt.finalPrizes,
    sourceAttackSequenceContexts:
      output.agent45ArchiveScreen.anySourceAttackSequenceContexts,
    competitiveGamesQualified:0,
    artifact:ARTIFACT
  },null,2)+'\n');
}

if(require.main===module)main();

module.exports={VERSION,ARTIFACT,bilateralKnownDeadRunner,
  runAgent7KnownDeadV9};
