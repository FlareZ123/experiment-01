'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const test=require('node:test');
const {VERSION,runOwnerPokemonAba}=
  require('../simulation/evaluation/agent3-issue25-v14-owner-pokemon-aba.cjs');

const ROOT=path.resolve(__dirname,'..');
const sha=buf=>createHash('sha256').update(buf).digest('hex');

/**
 * Write archived native A/B/A receipts with an exclusive file lock.
 * @param {object} object
 * @param {string} dir
 * @returns {{sha256:string,bytes:number}}
 */
function archive(object,dir){
  fs.mkdirSync(dir,{recursive:true});
  const lock=path.join(dir,'.agent3-v14.lock');
  const fd=fs.openSync(lock,'wx');
  const base='issue25-v14-owner-pokemon-aba.json';
  const json=path.join(dir,base);
  const side=json+'.sha256';
  const temp=json+'.'+process.pid+'.tmp';
  const sideTemp=side+'.'+process.pid+'.tmp';
  const bytes=Buffer.from(JSON.stringify(object,null,2)+'\n');
  const digest=sha(bytes);
  try{
    fs.writeFileSync(temp,bytes,{flag:'wx'});
    fs.renameSync(temp,json);
    fs.writeFileSync(sideTemp,digest+'  '+base+'\n',{flag:'wx'});
    fs.renameSync(sideTemp,side);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    if(fs.existsSync(sideTemp))fs.unlinkSync(sideTemp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
  return {sha256:digest,bytes:bytes.length};
}

test('genuine source-locked A/B/A: owner Pokemon after accepted Prize selection',()=>{
  const reg=fs.readFileSync(path.join(ROOT,
    'results/aichi-2026/registrations/agent3-issue25-v8-four-campaign-root-replay-v11-20261105.json'));
  const expected=JSON.parse(reg.toString('utf8'));
  const panel=runOwnerPokemonAba();
  assert.equal(panel.schema,VERSION);
  assert.deepEqual(panel.sourceTrialIds,expected.trialIds);
  assert.equal(panel.totalRegisteredNativeAttempts,24);
  panel.provenance={
    originalFrozenV11RegisteredSha256:sha(reg),
    observedGitHubCommit:process.env.GITHUB_SHA??null,
    nativeGithubRun:process.env.GITHUB_RUN_ID??null,
    sourceSha256:sha(fs.readFileSync(path.join(ROOT,
      'simulation/evaluation/agent3-issue25-v14-owner-pokemon-aba.cjs'))),
    testSha256:sha(fs.readFileSync(__filename)),
    singleTreatment:'owner-visible mandatory ChoosePokemon baseline',
    noNewIndependentOpponentSeeds:true,
    qualifiedCompetitiveSample:false
  };
  const dir=process.env.AGENT3_V14_OUTPUT_DIR;
  const receipt=dir?archive(panel,dir):null;
  console.log('AGENT3_V14_OWNER_POKEMON_NATIVE',JSON.stringify({
    controlStatus:panel.baselineReplayVerdict,
    matchedPrechoice:panel.matchingNativeOwnerPrechoice,
    matchedNativeRequests:panel.matchingNativeRequests,
    allThreeSourceDealsMatched:panel.equalAllThreePhysicalSourceDealRows,
    acceptedOwnerPokemon:panel.treatmentSelectedPromptAudit
      ?.ownerChoosePokemonPromptBaseline?.accepted??null,
    pokemonMenuSelections:panel.treatmentSelectedPromptAudit
      ?.ownerChoosePokemonPromptBaseline?.boundedSelections??[],
    changedNativeStatuses:panel.rows
      .filter(r=>r.newPokemonChoiceChangesDisposition)
      .map(r=>({id:r.id,control:r.modalPrizeBaseline.status,
        intervention:r.withOwnerPokemon.status,
        newAbort:r.withOwnerPokemon.nativeAbortPendingPrompt})),
    allNativeErrors:panel.rows.filter(r=>
      r.withOwnerPokemon.status==='engine-error').map(r=>({
        id:r.id,stage:r.withOwnerPokemon.nativeAbortFailureStage,
        prompt:r.withOwnerPokemon.nativeAbortPendingPrompt
      })),
    competitivePaperGames:panel.certifiedPaperGames,
    receipt
  }));
  assert.equal(panel.certifiedPaperGames,0);
  assert.equal(panel.causalDeckStrengthEstablished,false);
});
