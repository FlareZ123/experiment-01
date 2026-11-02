'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobHash}=require('./agent36-profile-provenance-gate.cjs');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const {scheduledArms,preflight:sourcePreflight}=
  require('./agent10-original-rank9-absol-electrode-development.cjs');
const {witness}=require('./agent2-rank9-special-guzma-retro-native.cjs');
const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent2-rank9-mega-funding-matched-retro-20261102.json';
const REG_BLOB='31cd6201017020e23a64fa4e405899d602f3bcc5';
const VERSION='agent2-rank9-staged-mega-funding-vs-greedy-original-samedeal-v1';
function preflight(){
  const raw=fs.readFileSync(path.join(ROOT,REG));
  assert.equal(gitBlobHash(raw),REG_BLOB,'Staged-funding registration modified');
  const manifest=JSON.parse(raw.toString('utf8'));
  assert.equal(manifest.pinnedVendorRevision,profile.pinnedVendorRevision);
  const known=require('../../results/aichi-2026/original-printed60-admission-v1.json')
    .rows.find(x=>x.rank===9);
  assert.equal(manifest.sourcePrinted60Sha256,known.printed60Sha256);
  sourcePreflight();
  const trials=scheduledArms();
  assert.deepEqual(manifest.sourceGroups,trials
    .filter(x=>x.candidateId==='champion-reference')
    .map(x=>({rank:x.rank,repeat:x.repeat,
      candidateSlot:x.candidateSlot,seed:x.seed})));
  for(const [name,sha] of Object.entries(manifest.executableCodeGitBlobShas))
    assert.equal(gitBlobHash(fs.readFileSync(path.join(ROOT,name))),sha,
      'Executable changed after original registration: '+name);
  const base={...profile.policyOptions,...manifest.commonBaselineOptions};
  assert.equal(base.actorOnlyComposition,true);
  assert.equal(base.actorGuzmaPromptContinuation,true);
  assert.equal(base.actorRank9SpecialFundedGuzma,true);
  return {manifest,trials,base};
}
/**
 * @param {object} row
 * @returns {object}
 */
function sourceSummary(row){
  const original=witness(row);
  const sourceSeat=row.trial.candidateSlot==='A'?1:0;
  const sourceRoots=(row.rootActionLedger??[]).filter(x=>
    x.playerSlot===sourceSeat);
  const nativeIntentCounts=row.actorOnlyDecisionCoverage
    ?.detailedComponentAudits?.root?.typedIntentCounts??
    row.actorOnlyDecisionCoverage?.typedIntentCounts??null;
  return {
    ...original,
    nativeDisposition:original.disposition,
    nativeIntentCounts,
    actualSourceRootCount:sourceRoots.length,
    sourceEnergyPlayRoots:sourceRoots.filter(x=>
      x.action==='PlayCardAction'&&
      /(?:Prism Energy|Darkness Energy|Telepathic Psychic Energy)/.test(
        x.card??'')).map(x=>({
          turn:x.turnBefore,ordinal:x.actionOrdinal,card:x.card,
          target:x.target??null
        })),
    sourceAttackDeclarations:row.attackDeclarations?.source??null,
    sourceAttackSettlement:row.sourceAttackSettlement??null,
    sourcePrizeSettlementPaperQualified:false
  };
}
function run(deps={}){
  const {manifest,trials,base}=preflight();
  const strict=require('./agent41-frozen-bilateral-development-v1.cjs');
  strict.assertNoUnreviewedAmbientAgentEnvironment(process.env,profile);
  if(deps.pinNative!==false)strict.assertPinnedNativeStore(ROOT,profile);
  const runner=deps.runDevelopment??require('./agent41-bilateral-v2-development.cjs')
    .runDevelopment;
  const old={};
  for(const [key,value] of Object.entries(profile.injectedResearchEnvironment)){
    old[key]=process.env[key];process.env[key]=value;
  }
  const modes={};
  try{
    for(const mode of ['control','staged']){
      try{
        const executed=runner({
          ...base,actorRank9MegaAbsolFundingRoot:mode==='staged',
          registeredTrials:trials,
          registeredFrameName:VERSION+'-'+mode,
          allowAdditionalOriginalSourceRanks:true});
        assert.equal(executed.attempted,trials.length);
        assert.deepEqual(executed.rows.map(r=>r.trial.id),
          trials.map(t=>t.id));
        modes[mode]={
          nativeReport:executed,
          attempts:executed.rows.map(row=>({
            trial:row.trial,evidence:sourceSummary(row),rawNativeRow:row
          }))
        };
      }catch(e){
        modes[mode]={
          batchError:String(e?.stack??e),
          attempts:trials.map(trial=>({
            trial,rawNativeRow:null,
            evidence:{nativeDisposition:'NATIVE_ERROR',
              sourceDealFingerprint:null,
              error:String(e?.message??e),
              competitivelyQualified:false}
          }))
        };
      }
    }
  }finally{
    for(const [k,v] of Object.entries(old)){
      if(v===undefined)delete process.env[k];else process.env[k]=v;
    }
  }
  const paired=trials.map((t,i)=>{
    const a=modes.control.attempts[i].evidence;
    const b=modes.staged.attempts[i].evidence;
    const matching=typeof a.sourceDealFingerprint==='string'&&
      typeof b.sourceDealFingerprint==='string'&&
      a.sourceDealFingerprint===b.sourceDealFingerprint;
    return {
      trial:t.id,
      sameOriginalSourceDeal:matching?'MATCH':'UNVERIFIED_OR_MISMATCH',
      control:a,staged:b,
      guzmaRootDifference:matching&&a.guzmaRoots&&b.guzmaRoots?
        b.guzmaRoots.length-a.guzmaRoots.length:null,
      sourceAttackDeclarationDifference:matching&&
        Number.isSafeInteger(a.sourceAttackDeclarations)&&
        Number.isSafeInteger(b.sourceAttackDeclarations)?
        b.sourceAttackDeclarations-a.sourceAttackDeclarations:null,
      paperGameQualified:false
    };
  });
  return {
    schema:VERSION,registrationGitBlobSha:REG_BLOB,
    sourceRank:9,sourcePrinted60Sha256:manifest.sourcePrinted60Sha256,
    vendorPin:manifest.pinnedVendorRevision,
    researchHead:process.env.GITHUB_SHA??null,
    attemptsIntended:8,
    executedAttemptCounts:Object.fromEntries(Object.entries(modes).map(
      ([k,v])=>[k,v.nativeReport?.attempted??null])),
    paired,modes,competitiveQualifiedGames:0,winRateCertified:false,
    limitations:'Previously inspected original 60 and seeds, no paper-whole-turn/effect/clock qualification'
  };
}
if(require.main===module){
  const out=process.argv.includes('--inspect-only')?
    {schema:VERSION,preflight:preflight(),mode:'NO_NATIVE_EXECUTION'}:run();
  const file=process.env.AICHI_RANK9_STAGED_FUNDING_OUTPUT;
  if(file){
    const tmp=file+'.tmp-'+process.pid;
    fs.writeFileSync(tmp,JSON.stringify(out,null,2)+'\n');
    fs.renameSync(tmp,file);
    process.stdout.write(JSON.stringify({
      schema:VERSION,attemptsIntended:out.attemptsIntended,
      paired:out.paired.map(x=>({
        trial:x.trial,matched:x.sameOriginalSourceDeal,
        controlStatus:x.control.nativeDisposition,
        stagedStatus:x.staged.nativeDisposition,
        controlMegaEnergyRoots:x.control.sourceEnergyPlayRoots?.length??null,
        stagedMegaEnergyRoots:x.staged.sourceEnergyPlayRoots?.length??null,
        guzmaRootDifference:x.guzmaRootDifference,
        sourceAttackDeclarationDifference:x.sourceAttackDeclarationDifference
      })),competitiveQualifiedGames:0
    },null,2)+'\n');
  }else process.stdout.write(JSON.stringify(out,null,2)+'\n');
}
module.exports={VERSION,REG_BLOB,preflight,sourceSummary,run};
