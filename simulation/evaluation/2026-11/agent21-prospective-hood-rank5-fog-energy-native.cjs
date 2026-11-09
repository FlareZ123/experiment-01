'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');
const sourceFunding=require('./agent8-source-mew-funding-v6.cjs');
const {chooseEnergyDeficitFogPrinting,VERSION:CHOICE_VERSION}=
  require('../../twinleaf/agent21-owner-fog-energy-deficit-choice.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const REG='results/aichi-2026/registrations/agent21-prospective-hood-rank5-fog-energy-target-20261109.json';
const OUTPUT=path.join(ROOT,'artifacts/agent21-prospective-hood-rank5-fog-energy-native.json');
const checksum=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/** Exact immutable pre-execution trial and original inventory assertions. */
function registered(){
  const raw=fs.readFileSync(path.join(ROOT,REG),'utf8'),reg=JSON.parse(raw);
  assert.equal(reg.status,'FROZEN_BEFORE_ANY_NATIVE_EXECUTION');
  assert.equal(reg.schema,'agent21-prospective-rank5-hood-fog-energy-policy-comparison-v1');
  assert.equal(reg.trials.length,4);
  assert.deepEqual(reg.trials.map(t=>t.seed),[
    3080253347,3574742336,3208201201,2718601640
  ]);
  assert.deepEqual(reg.trials.map(t=>t.candidateSlot),['A','B','A','B']);
  assert.equal(reg.enginePinnedCommit,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  const hood=require('../../../results/aichi-2026/candidate-hood-shadow-rider.json');
  assert.equal(hood.cards.reduce((n,c)=>n+c.count,0),60);
  const ranked=require('../../../results/aichi-2026/original-printed60-admission-v1.json');
  const source=ranked.rows.find(x=>x.rank===5);
  assert.equal(source.printed60Sha256,reg.originalSource60Sha256);
  return {reg,hood,registrationSha256:createHash('sha256')
    .update(raw).digest('hex'),hoodPrinted60Sha256:checksum(hood.cards)};
}

/** Install exactly one policy-agnostic owner Fog chooser for both real seats. */
function withSymmetricFogEnergyTarget(run,enabled){
  assert.equal(typeof run,'function');
  const adapter=require('../../twinleaf/agent9-fog-actor-prompt.cjs');
  const previous=Object.getOwnPropertyDescriptor(adapter,'withActorFogCrystalPrompt');
  assert.equal(typeof previous?.value,'function');
  if(!enabled)return {result:run(),audit:{optIn:false,interventions:[]}};
  const interventions=[];
  function fogAdapter(inner,deps){
    const chosen=previous.value.call(adapter,inner,{
      ...(deps??{}),choosePrinting:chooseEnergyDeficitFogPrinting
    });
    interventions.push({
      schema:CHOICE_VERSION,
      fogItemRoots:chosen.audit.fogItemRootNativeAccepted,
      fogPromptNativeAccepted:chosen.audit.fogPromptNativeAccepted,
      nativeRejectedChoices:chosen.audit.rejectedNativeChoices,
      ownerDeckSearchEvents:chosen.audit.events.filter(x=>
        x.kind==='fog-search')
    });
    return chosen;
  }
  Object.defineProperty(adapter,'withActorFogCrystalPrompt',
    {...previous,value:fogAdapter});
  try{return {result:run(),audit:{optIn:true,
    choiceVersion:CHOICE_VERSION,interventions}};}
  finally{
    assert.strictEqual(adapter.withActorFogCrystalPrompt,fogAdapter);
    Object.defineProperty(adapter,'withActorFogCrystalPrompt',previous);
  }
}

/** Execute all precommitted original rank5 source deals without stopping early. */
function evaluate(){
  const {reg,hood,registrationSha256,hoodPrinted60Sha256}=registered();
  const frozen=require('../agent41-frozen-bilateral-development-v2.json');
  assert.equal(frozen.policyOptions.actorOnlyComposition,true);
  const conditions=[];
  for(const [name,energyPriority] of [
    ['existing-basic-first',false],['owner-energy-deficit',true]
  ]){
    const observed=withSymmetricFogEnergyTarget(()=>runDevelopment({
      ...frozen.policyOptions,...sourceFunding.options(true),
      sourceIndependentCommonPolicy:true,
      bilateralPerfectionRoot:true,
      actorVipAfterPass:true,
      actorMewMaxMiracleOverSelfCopy:true,
      sourceScopedQuickBallRoot:true,
      actorMewQuickBallPaymentGuard:true,
      actorMewUltraBallPaymentGuard:true,
      actorMewUltraBallRoot:true,
      actorMewUltraBallSearch:true,
      actorOnlySingleSearch:true,
      actorMewGenesectQuickBallSearch:true,
      nativeAcceptedTargets:true,
      nativeSetupCoinChoiceReceipt:true,
      nativeSetupCompensationAudit:true,
      nativePublicMulliganRevealsAudit:true,
      physicalZoneGate:true,
      losslessNativeRootJoin:true,
      paperSupporterQuota:true,
      paperSameTargetAttachEnergy:true,
      isolatePolicyRandomness:true,
      isolatePhysicalShuffleRandomnessAfterSetup:true,
      specialRedCardPaperPreselection:true,
      specialRedCardPaperCorrection:true,
      specialRedCardPaperSpeculativeShuffle:true,
      allowExtendedRegisteredNativeRootCap:true,
      allowSingleCandidatePerGroup:true,
      allowAdditionalOriginalSourceRanks:true,
      registeredCandidateDecks:{[reg.candidateId]:{cards:hood.cards}},
      registeredTrials:reg.trials,
      registeredFrameName:'agent21-prospective-hood-fog-'+name,
      nativeRootActionLimit:reg.nativeRootCap
    }),energyPriority);
    assert.equal(observed.result.rows.length,reg.trials.length);
    for(const [index,row] of observed.result.rows.entries()){
      assert.equal(row.trial.id,reg.trials[index].id,
        'Registered original-source order must never change');
    }
    conditions.push({name,energyPriority,adapterAudit:observed.audit,
      development:observed.result});
  }
  const pairs=reg.trials.map((trial,index)=>{
    const baseline=conditions[0].development.rows[index];
    const treated=conditions[1].development.rows[index];
    const describe=row=>{
      const root=row.rootActionLedger??[];
      const candidateSeat=trial.candidateSlot==='A'?0:1;
      const fog=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.fog??{};
      return {
        finished:row.finished===true&&row.error==null,
        winner:row.finished===true?row.winner??null:null,
        candidateSeat,candidateNativeWin:row.finished===true?
          row.winner===candidateSeat:null,
        finalNativePrizes:row.finalPrizes??null,
        acceptedStoreRoots:root.length,
        sourceAttacks:root.filter(a=>a.playerSlot===1-candidateSeat&&
          a.action==='AttackAction').length,
        candidateAttacks:root.filter(a=>a.playerSlot===candidateSeat&&
          a.action==='AttackAction').length,
        ownerFogSearchEvents:(fog.events??[]).filter(a=>
          a.kind==='fog-search'&&a.seat===candidateSeat),
        nativePaperSupporterQuota:row.nativeSupporterQuotaQualified??null,
        physicalIntegrity:row.physicalZoneQualification?.physicalIntegrityQualified??null,
        error:row.error??null
      };
    };
    return {
      trial,sourcePhysicalDealSame:baseline.sourceDealFingerprint===
        treated.sourceDealFingerprint,
      fullPhysicalDealSame:baseline.fullPhysicalDealFingerprint===
        treated.fullPhysicalDealFingerprint,
      sourcePhysicalDealFingerprintBaseline:baseline.sourceDealFingerprint,
      sourcePhysicalDealFingerprintTreatment:treated.sourceDealFingerprint,
      fullPhysicalDealFingerprintBaseline:baseline.fullPhysicalDealFingerprint,
      fullPhysicalDealFingerprintTreatment:treated.fullPhysicalDealFingerprint,
      baseline:describe(baseline),treatment:describe(treated)
    };
  });
  return {
    schema:'agent21-prospective-hood-rank5-symmetric-fog-choice-native-v1',
    registeredUtc:reg.registeredUtc,
    registrationSha256,registration:reg,
    candidatePrinted60Sha256:hoodPrinted60Sha256,
    policyVersions:{
      root:conditions[0].development.actorOnlyCompositionVersion??null,
      fogBaseline:'agent9-fog-crystal-owner-prompt-v2-live-state',
      fogTreatment:CHOICE_VERSION
    },
    allRegisteredTrialsExecuted:true,
    pairs,conditions,
    everySourceDealPaired:pairs.every(p=>p.sourcePhysicalDealSame),
    everyFullDealPaired:pairs.every(p=>p.fullPhysicalDealSame),
    paperCompetitiveQualifiedGames:0,
    note:'Four precommitted fresh source deals, two actor policies symmetric by physical seat. Native development only; no independently certified game result.'
  };
}

/** Durable output with exclusive lock and atomic rename. */
function save(value){
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const temp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temp,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
    const sync=fs.openSync(temp,'r');
    try{fs.fsyncSync(sync);}finally{fs.closeSync(sync);}
    fs.renameSync(temp,OUTPUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}
function main(){
  const value=evaluate();
  save(value);
  const pairs=value.pairs.map(pair=>({
    id:pair.trial.id,sourceDealPaired:pair.sourcePhysicalDealSame,
    fullDealPaired:pair.fullPhysicalDealSame,
    baseline:pair.baseline,treatment:pair.treatment
  }));
  console.log('AGENT21_PROSPECTIVE_HOOD_FOG',JSON.stringify({
    count:value.pairs.length,allSourcePaired:value.everySourceDealPaired,
    allFullPaired:value.everyFullDealPaired,pairs,
    paperCompetitiveQualifiedGames:0
  }));
  assert.ok(value.everySourceDealPaired&&value.everyFullDealPaired,
    'Original source/complete physical deals must match all eight registered games');
  return value;
}
if(require.main===module)main();
module.exports={registered,withSymmetricFogEnergyTarget,evaluate,save,main};
