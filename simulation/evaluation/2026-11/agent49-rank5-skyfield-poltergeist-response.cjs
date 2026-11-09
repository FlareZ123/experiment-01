'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {arm,firstDifference,firstPhysicalDivergence}=
  require('./agent20-rank5-gengar-tempo-aba.cjs');
const {withSourceSkyField}=require('../../twinleaf/agent49-source-skyfield-response-native.cjs');
const frozen=require('../../../results/aichi-2026/registrations/agent49-rank5-source-sky-field-poltergeist-response-aba-20261109.json');
const original=require('../../../results/aichi-2026/registrations/agent20-rank5-gengar-lillie-factorial-20261109.json');

const VERSION='agent49-rank5-source-sky-field-poltergeist-response-aba-v1';
const OUTPUT=path.resolve(__dirname,'../../../artifacts/agent49-rank5-skyfield-poltergeist-response.json');
function registration(){
  assert.equal(frozen.schema,VERSION);
  assert.equal(original.registeredTrials.length,1);
  assert.equal(original.registeredTrials[0].seed,frozen.seed);
  assert.equal(original.registeredTrials[0].id,frozen.originalPhysicalGroupId);
  assert.equal(original.sourceDealFingerprint,frozen.sourceDealFingerprint);
  assert.equal(original.fullPhysicalDealFingerprint,frozen.fullPhysicalDealFingerprint);
  assert.equal(original.enginePinnedCommit,frozen.enginePinnedCommit);
  return {...original,caseId:frozen.schema,
    rootCap:frozen.nativeRootCap};
}
function run(){
  const reg=registration();
  const settings={ownerLillieAfterPass:true,minOpponentHandCount:6};
  const baseline=arm('A-combined-baseline',true,reg,settings);
  const experiment=withSourceSkyField(
    ()=>arm('B-source-sky-field',true,reg,settings),
    {sourceSeat:frozen.sourceSeat});
  const repeated=arm('A-repeat',true,reg,settings);
  const b=experiment.result;
  const phases=[baseline,b,repeated];
  const matchedDeal=phases.every(x=>
    x.fullFingerprint===frozen.fullPhysicalDealFingerprint&&
    x.sourceFingerprint===frozen.sourceDealFingerprint);
  const actionRepeat=firstDifference(baseline,repeated);
  const physicalRepeat=firstPhysicalDivergence(baseline,repeated);
  const actionDivergence=firstDifference(baseline,b);
  const physicalDivergence=firstPhysicalDivergence(baseline,b);
  const summarize=x=>({
    phase:x.phase,roots:x.rootCount,
    nativeFinished:x.nativeFinished,error:x.nativeError,
    winner:x.nativeWinner,remainingPrizes:x.remainingPrizes,
    sourceAttacks:x.source.attacks,candidateAttacks:x.candidate.attacks,
    sourceActionRootCount:x.source.total,
    candidateActionRootCount:x.candidate.total,
    physicalIntegrity:x.physicalIntegrity,
    sourceFingerprint:x.sourceFingerprint,
    fullFingerprint:x.fullFingerprint
  });
  const record={schema:VERSION,registration:frozen,
    samePrintedSourceAndCandidateSixties:true,
    sourcePolicyOnlyOneNativePlay:true,
    sameFullAndSourcePhysicalDeal:matchedDeal,
    exactBaselineRepeatActions:actionRepeat===null,
    exactBaselineRepeatPhysicalZones:physicalRepeat===null,
    firstActionDivergence:actionDivergence,
    firstPhysicalDivergence:physicalDivergence,
    sourceSkyFieldAudit:experiment.audit,
    phases:phases.map(summarize),
    rawArms:phases,
    competitivelyPaperQualifiedGames:0,
    posthocSeed:true};
  assert.ok(matchedDeal,'exact source and candidate physical opening is mandatory');
  assert.equal(actionRepeat,null,'A/A accepted root tape must reproduce');
  assert.equal(physicalRepeat,null,'A/A physical zone tape must reproduce');
  return record;
}
function save(record){
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const tmp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(tmp,JSON.stringify(record,null,2)+'\n',{flag:'wx'});
    const file=fs.openSync(tmp,'r');
    try{fs.fsyncSync(file);}finally{fs.closeSync(file);}
    fs.renameSync(tmp,OUTPUT);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}
if(require.main===module){
  const result=run();save(result);
  console.log('AGENT49_SOURCE_SKYFIELD_POLTERGEIST',JSON.stringify({
    matched:result.sameFullAndSourcePhysicalDeal,
    exactARepeat:result.exactBaselineRepeatPhysicalZones,
    audit:result.sourceSkyFieldAudit,
    firstAction:result.firstActionDivergence,
    phases:result.phases}));
}
module.exports={VERSION,registration,run,save};
