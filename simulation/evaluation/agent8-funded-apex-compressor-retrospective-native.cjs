'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards}=require('../twinleaf/headless.cjs');
const {registration,executeOne,writeRegisteredReport}=
  require('../twinleaf/agent8-rank13-donor-paired-original-native.cjs');
const {sourceSummary}=
  require('./agent8-rank13-treasure-native-transport.cjs');

const VERSION='agent8-funded-apex-compressor-retrospective-native-v1';
const REGISTER=path.resolve(__dirname,
  '../../results/aichi-2026/registrations/agent8-funded-apex-compressor-retrospective-20261103.json');
const FLAG='AGENT8_PUBLIC_FLAT_COPY_DEV';

/** Strict input preflight performs no engine calls or selections. */
function preflight(){
  const buffer=fs.readFileSync(REGISTER);
  const p=JSON.parse(buffer.toString('utf8'));
  assert.equal(p.schema,'agent8-funded-apex-compressor-retrospective-v1');
  assert.equal(p.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.deepEqual(p.previouslyInspectedSourceDeals.map(x=>
    ({seed:x.seed,sourceSeat:x.sourceSeat})),[
      {seed:3588534981,sourceSeat:1},
      {seed:1571178812,sourceSeat:0}
    ]);
  assert.deepEqual(p.registeredModes,[
    'control','source-compressor-after-Pass','repeat-control'
  ]);
  assert.equal(p.plannedNativeAttempts,6);
  assert.equal(p.sampledPreviously,true);
  assert.equal(p.fixedControls.battleCompressorMinimumPaperHook,true);
  assert.ok(p.previouslyInspectedSourceDeals.every(x=>
    Number.isSafeInteger(x.seed)&&x.seed>=0&&x.seed<=0xffffffff&&
    (x.sourceSeat===0||x.sourceSeat===1)));
  return {manifest:p,sha256:createHash('sha256').update(buffer).digest('hex')};
}

/**
 * All arms receive the pinned public copied-attack preference and correction
 * hooks; the sole policy toggle is the actual owner-eligible Compressor after
 * canonical otherwise-Pass. This remains a retrospective mechanics study.
 */
function arm(trial,byRank,treatment){
  const prior=process.env[FLAG];
  process.env[FLAG]='true';
  try{
    return executeOne(trial,byRank,true,true,true,true,true,true,false,
      treatment,true);
  }finally{
    if(prior===undefined)delete process.env[FLAG];
    else process.env[FLAG]=prior;
  }
}

function main(){
  const {manifest,sha256}=preflight();
  initializeCards();
  const {byRank}=registration();
  const pairs=[];
  for(const trial of manifest.previouslyInspectedSourceDeals){
    const control=arm(trial,byRank,false);
    const treatment=arm(trial,byRank,true);
    const repeat=arm(trial,byRank,false);
    const modes=[control,treatment,repeat];
    const returned=modes.every(x=>x.status==='native-returned');
    const allSameSource=returned&&
      control.sourceDealSha256!==null&&
      modes.every(x=>x.sourceDealSha256===control.sourceDealSha256);
    const allSameFullPhysical=returned&&
      control.fullPhysicalDealSha256!==null&&
      modes.every(x=>x.fullPhysicalDealSha256===control.fullPhysicalDealSha256);
    const repeatControlIdentical=returned&&
      control.gameDecisionTraceSha256===repeat.gameDecisionTraceSha256&&
      JSON.stringify(control.publicAttackTransitions)===
        JSON.stringify(repeat.publicAttackTransitions)&&
      JSON.stringify(control.prizesRemaining)===
        JSON.stringify(repeat.prizesRemaining);
    pairs.push({trial,returned,allSameSource,allSameFullPhysical,
      repeatControlIdentical,
      summaries:modes.map(x=>sourceSummary(x,trial.sourceSeat)),
      arms:modes,competitivelyQualifiedGames:0});
  }
  return {
    version:VERSION,registrationSha256:sha256,
    sourceRank:13,opponentRank:1,originalSixtiesUnchanged:true,
    nativeAttempts:pairs.length*3,registeredNativeAttempts:6,
    allNativeReturned:pairs.every(x=>x.returned),
    physicalMatchedPairs:pairs.filter(x=>x.allSameFullPhysical).length,
    repeatedControlMatchedPairs:pairs.filter(x=>x.repeatControlIdentical).length,
    acceptedCompressorRoots:pairs.reduce((sum,x)=>
      sum+(x.arms[1].nativeCompressorAudit?.acceptedItems??0),0),
    physicalDragonMoves:pairs.reduce((sum,x)=>
      sum+(x.arms[1].nativeCompressorAudit?.physicalDragonMoved??0),0),
    selectedCompressorAudit:pairs.map(x=>({
      trial:x.trial,sourceSeat:x.trial.sourceSeat,
      audit:x.arms[1].nativeCompressorAudit
    })),
    pairs,officialClockModeled:false,
    policyCompetitivelyQualified:false,
    achievedCompetitiveGames:0,claimedFieldWinRate:null,
    caveat:'Previously inspected favorable and negative source seed groups; weak generic bot; resource-specific after-Pass diagnostic, not prospective evidence or a paper-valid competitive outcome.'
  };
}
if(require.main===module){
  const result=main();
  const output=process.env.AGENT8_FUNDED_COMPRESSOR_JSON;
  if(output)writeRegisteredReport(result,output);
  process.stdout.write('AGENT8_FUNDED_APEX_COMPRESSOR_NATIVE '+
    JSON.stringify({
      sourceGroups:result.pairs.length,attempts:result.nativeAttempts,
      returned:result.allNativeReturned,
      matchedPhysical:result.physicalMatchedPairs,
      repeatedControlMatched:result.repeatedControlMatchedPairs,
      itemAccepted:result.acceptedCompressorRoots,
      dragonMoves:result.physicalDragonMoves,
      rows:result.pairs.map(x=>({
        trial:x.trial,returned:x.returned,
        fullPhysicalParity:x.allSameFullPhysical,
        repeatedControlParity:x.repeatControlIdentical,
        compressor:x.arms[1].nativeCompressorAudit,
        copiedChoices:x.summaries.map(s=>
          s.sourceNativeCopiedChoices?.length??null),
        nativeWinners:x.summaries.map(s=>s.winner)
      }))
    })+'\n');
  if(!output)process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.allNativeReturned||
     result.physicalMatchedPairs!==result.pairs.length||
     result.repeatedControlMatchedPairs!==result.pairs.length)
    process.exitCode=1;
}
module.exports={VERSION,preflight,arm,main};
