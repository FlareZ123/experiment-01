'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const test = require('node:test');

const {runOwnerPokemonAba} =
  require('../simulation/evaluation/agent3-issue25-v14-owner-pokemon-aba.cjs');
const {withOwnerKoPrizeSettlementEvidence} =
  require('../simulation/twinleaf/agent3-owner-ko-prize-settlement-evidence.cjs');
const {VERSION,withKoEffectPromptProvenance} =
  require('../simulation/twinleaf/agent3-ko-effect-prompt-provenance.cjs');

const ROOT=path.resolve(__dirname,'..');
const digest=b=>createHash('sha256').update(b).digest('hex');

/** Locked, atomic storage of the original 24 registered outcomes and audits. */
function save(record,dir) {
  fs.mkdirSync(dir,{recursive:true});
  const lock=path.join(dir,'.agent3-v17-origin.lock');
  const fd=fs.openSync(lock,'wx');
  const name='issue25-v17-ko-effect-prompt-provenance.json';
  const output=path.join(dir,name);
  const bytes=Buffer.from(JSON.stringify(record,null,2)+'\n');
  const stage=output+'.'+process.pid+'.tmp';
  const sidecar=output+'.sha256';
  const stageHash=sidecar+'.'+process.pid+'.tmp';
  try {
    fs.writeFileSync(stage,bytes,{flag:'wx'});
    fs.writeFileSync(stageHash,digest(bytes)+'  '+name+'\n',{flag:'wx'});
    fs.renameSync(stage,output);
    fs.renameSync(stageHash,sidecar);
  } finally {
    for(const file of [stage,stageHash])
      if(fs.existsSync(file))fs.unlinkSync(file);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
  return {bytes:bytes.length,sha256:digest(bytes)};
}

test('real pinned Store KO source events, prompt creation, exact Prize transfer',()=>{
  const vendor=execFileSync('git',['rev-parse','HEAD'],{
    cwd:path.join(ROOT,'vendor/twinleaf'),encoding:'utf8'
  }).trim();
  assert.equal(vendor,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  const registration=fs.readFileSync(path.join(ROOT,
    'results/aichi-2026/registrations/agent3-issue25-v8-four-campaign-root-replay-v11-20261105.json'));
  const {result:custody,audit:origin}=withKoEffectPromptProvenance(
    ()=>withOwnerKoPrizeSettlementEvidence(()=>runOwnerPokemonAba()));
  const panel=custody.result, physical=custody.audit;
  assert.equal(origin.version,VERSION);
  assert.deepEqual(panel.sourceTrialIds,JSON.parse(registration).trialIds);
  assert.equal(panel.totalRegisteredNativeAttempts,24);
  assert.equal(panel.matchingNativeOwnerPrechoice,32);
  assert.equal(panel.matchingNativeRequests,32);
  assert.equal(panel.matchingNativeFirstPlayer,32);
  assert.equal(panel.equalControlPublicRootAndStatusRows,8);
  assert.equal(panel.equalAllThreePhysicalSourceDealRows,8);
  assert.equal(panel.certifiedPaperGames,0);
  assert.equal(origin.competitivelyQualifiedGames,0);
  assert.equal(physical.competitivelyQualifiedGames,0);
  assert.equal(origin.uniqueCheckStateOriginCertified,false);
  assert.equal(origin.realStoreIdentityProofComplete,false);
  assert.ok(origin.settledKoCorrelatedAnswers<=origin.koCorrelatedPrompts);
  assert.equal(physical.observedKoShapedSelections,
    physical.nativeResolved+physical.nativeRejected+physical.nativeUnresolved);

  const provenance={
    researchCommit:process.env.GITHUB_SHA??null,
    githubRun:process.env.GITHUB_RUN_ID??null,
    vendor,
    registrationSha256:digest(registration),
    sourceSha256:digest(fs.readFileSync(path.join(ROOT,
      'simulation/twinleaf/agent3-ko-effect-prompt-provenance.cjs'))),
    nativeTestSha256:digest(fs.readFileSync(__filename)),
    unchangedV14RunnerSha256:digest(fs.readFileSync(path.join(ROOT,
      'simulation/evaluation/agent3-issue25-v14-owner-pokemon-aba.cjs')))
  };
  const receipt={
    schema:VERSION,provenance,trialIds:panel.sourceTrialIds,
    originalDispositionRows:panel.rows,
    registeredAttempts:panel.totalRegisteredNativeAttempts,
    sourcePhysicalDealMatches:panel.equalAllThreePhysicalSourceDealRows,
    controlsIdentical:panel.equalControlPublicRootAndStatusRows,
    sourceOriginAudit:origin,physicalPrizeAudit:physical,
    strictOriginAndPhysicalCountMatch:
      origin.settledKoCorrelatedAnswers===physical.nativeResolved,
    competitivelyQualifiedGames:0,provenFieldWinRate:null
  };
  const dir=process.env.AGENT3_V17_ORIGIN_RECEIPT_DIR;
  const archive=dir?save(receipt,dir):null;
  console.log('AGENT3_V17_KO_ORIGIN_NATIVE',JSON.stringify({
    registeredAttempts:panel.totalRegisteredNativeAttempts,
    exactSourceDealMatches:panel.equalAllThreePhysicalSourceDealRows,
    repeatedControls:panel.equalControlPublicRootAndStatusRows,
    sourceKoEffects:origin.eligibleKoEffects,
    sourceKoPrompts:origin.koCorrelatedPrompts,
    sourcePromptAnswers:origin.settledKoCorrelatedAnswers,
    physicalChosenPrizes:physical.exactOwnerHandTransfers,
    nativePrizeResolutions:physical.nativeResolved,
    correlationMatched:receipt.strictOriginAndPhysicalCountMatch,
    qualifiedGames:0,archive
  }));
});
