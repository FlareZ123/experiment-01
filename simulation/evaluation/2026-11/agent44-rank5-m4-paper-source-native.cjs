'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runDevelopment}=
  require('../agent41-bilateral-v2-development.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const REGPATH='results/aichi-2026/registrations/agent44-rank5-m4-paper-source-v1-20261109.json';
const OUTPUT=path.join(ROOT,'artifacts/agent44-rank5-m4-paper-source-native-v1.json');
const VERSION='agent44-rank5-m4-paper-source-v1';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/** Verify frozen registration against unchanged original printed source and candidate. */
function registration(){
  const raw=fs.readFileSync(path.join(ROOT,REGPATH),'utf8');
  const reg=JSON.parse(raw);
  assert.equal(reg.schema,VERSION);
  assert.equal(reg.status,'FROZEN_BEFORE_NATIVE_EXECUTION');
  assert.equal(reg.enginePin,PIN);
  assert.equal(reg.sourceRank,5);
  assert.equal(reg.candidateId,'hood-shield-v1');
  assert.equal(reg.registeredTrials.length,4);
  assert.equal(reg.maxNativeRootActions,320);
  assert.equal(new Set(reg.registeredTrials.map(x=>x.seed)).size,4);
  assert.equal(new Set(reg.registeredTrials.map(x=>x.id)).size,4);
  for(const trial of reg.registeredTrials){
    assert.equal(trial.rank,5);
    assert.equal(trial.candidateId,'hood-shield-v1');
    assert.equal(trial.id,[trial.rank,trial.repeat,trial.candidateSlot,
      trial.candidateId].join(':'));
    assert.ok(Number.isSafeInteger(trial.seed)&&
      trial.seed>0&&trial.seed<=0xffffffff);
  }
  const admission=require('../../../results/aichi-2026/original-printed60-admission-v1.json')
    .rows.find(x=>x.rank===5);
  assert.equal(admission.printed60Sha256,reg.sourceOriginalPrinted60Sha256);
  assert.equal(admission.physicalCards,60);
  const source=require('../../../results/aichi-2026/full-decklists.json')
    .decks.find(x=>x.rank===5);
  assert.equal(source.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(source.cards.find(c=>c.name==='Special Red Card')?.count,2);
  const candidate=require('../../../results/aichi-2026/candidate-hood-shadow-rider.json');
  assert.equal(candidate.cards.reduce((n,c)=>n+c.count,0),60);
  const sha=createHash('sha256').update(raw).digest('hex');
  return {reg,candidate,registrationSha256:sha,
    sourceManifestSha256:digest(source.cards),
    contenderManifestSha256:digest(candidate.cards)};
}

/**
 * A source-preserving owner policy. Same opponent/candidate source lists as
 * previous frozen Hood v1 runs, with exact paper M4 correction enabled.
 * Native Mail on source-only otherwise Pass improves original source quality.
 * All outcomes remain developmental and non-competitive.
 */
function run(){
  const {reg,candidate,registrationSha256,
    sourceManifestSha256,contenderManifestSha256}=registration();
  const frozen=require('../agent41-frozen-bilateral-development-v2.json');
  assert.equal(frozen.policyOptions.actorOnlyComposition,true);
  const data=runDevelopment({
    ...frozen.policyOptions,
    actorNaturalEvolutionRoot:true,
    actorMewGenesectTechnoBlast:true,
    actorMewMaxMiracleOverSelfCopy:true,
    sourceScopedQuickBallRoot:true,
    actorHandDiscard:true,
    actorOnlySingleSearch:true,
    actorMewGenesectQuickBallSearch:true,
    actorDceMewMobilityRoot:true,
    actorMewDceRecipientRoot:true,
    actorMewDceRecipientSourceOnly:true,
    actorGenesectFusionDrawRoot:true,
    actorMewUltraBallRoot:true,
    actorMewUltraBallSearch:true,
    actorMewUltraBallPaymentGuard:true,
    actorMewQuickBallPaymentGuard:true,
    actorArvenHoodSearchRoot:true,
    actorOwnerMailAfterPass:true,
    actorOwnerMailAfterPassSourceOnly:true,
    nativeOwnerTrainerFallback:true,
    paperSupporterQuota:true,
    paperSameTargetAttachEnergy:true,
    physicalZoneGate:true,
    isolatePolicyRandomness:true,
    isolatePhysicalShuffleRandomnessAfterSetup:true,
    specialRedCardPaperPreselection:true,
    specialRedCardPaperCorrection:true,
    specialRedCardPaperSpeculativeShuffle:true,
    registeredCandidateDecks:{
      'hood-shield-v1':{label:'hood-shield-v1',cards:candidate.cards}
    },
    allowSingleCandidatePerGroup:true,
    allowAdditionalOriginalSourceRanks:true,
    allowExtendedRegisteredNativeRootCap:true,
    registeredTrials:reg.registeredTrials,
    registeredFrameName:VERSION,
    nativeRootActionLimit:reg.maxNativeRootActions
  });
  assert.equal(data.attempted,4);
  assert.deepEqual(data.rows.map(x=>x.trial.id),
    reg.registeredTrials.map(x=>x.id));
  const rows=data.rows.map(row=>{
    const sourceSeat=row.trial.candidateSlot==='A'?1:0;
    const audits=(row.specialRedCardPaperPreselectionAudits??[])
      .filter(x=>x.actorSeat===sourceSeat);
    const nativeRoots=row.rootActionLedger??row.nativeAbortEvidence?.rootActionLedger??[];
    const nativeDisposition=row.error?'engine-error':
      row.finished===true?'native-terminal':
      nativeRoots.length>=reg.maxNativeRootActions?'native-root-cap':
      'native-unfinished';
    const m4Played=nativeRoots.filter(root=>
      root.playerSlot===sourceSeat && root.action==='PlayCardAction' &&
      root.card==='Special Red Card M4');
    return {trial:row.trial,sourceSeat,candidateSeat:1-sourceSeat,
      nativeDisposition,finished:row.finished===true,
      error:row.error?String(row.error?.message??row.error).slice(0,1000):null,
      nativeWinner:row.finished===true?row.winner:null,
      sourceNativeWin:row.finished===true?row.winner===sourceSeat:null,
      sourceActualM4StorePlays:m4Played.length,
      sourceM4HeldOwnerRoots:audits.length,
      sourceM4PaperVetoRoots:audits.filter(a=>a.provenPaperBlockedCopies>0).length,
      sourceM4SelectedOwnerRoots:audits.filter(a=>a.selectedM4Printing).length,
      sourceM4RootOrdinals:m4Played.map(r=>r.actionOrdinal),
      actorPaperM4HooksQualified:row.specialRedCardPaperPreselection===true&&
        row.specialRedCardPaperCorrection===true&&
        row.specialRedCardPaperSpeculativeShuffle===true,
      sourcePhysicalOpening:row.sourceDealFingerprint??null,
      fullPhysicalOpening:row.fullPhysicalDealFingerprint??null,
      initialFirstSeat:row.actualStarterSeat??null,
      sourceAttacks:row.sourceAttackSettlement?.attacks?.length??null,
      sourcePrizesRemaining:row.finalPrizes?.[sourceSeat]??null,
      candidatePrizesRemaining:row.finalPrizes?.[1-sourceSeat]??null,
      nativePhysicalQualification:row.physicalZoneQualification?.status??null,
      originalRootLedgerSha256:digest(nativeRoots),
      nativeRootCount:nativeRoots.length,
      competitiveQualified:false
    };
  });
  const summary={registeredGames:reg.registeredTrials.length,
    recordedGames:rows.length,
    nativeTerminalGames:rows.filter(x=>x.nativeDisposition==='native-terminal').length,
    nativeErrors:rows.filter(x=>x.nativeDisposition==='engine-error').length,
    nativeCaps:rows.filter(x=>x.nativeDisposition==='native-root-cap').length,
    originalSourceActualM4StorePlays:rows.reduce((n,x)=>n+x.sourceActualM4StorePlays,0),
    originalSourcePaperVetoOwnerRoots:rows.reduce((n,x)=>n+x.sourceM4PaperVetoRoots,0),
    m4HookedRows:rows.filter(x=>x.actorPaperM4HooksQualified).length,
    qualifiedPaperGames:0,certifiedWinRate:null};
  const result={schema:VERSION,registrationPath:REGPATH,registrationSha256,
    enginePin:PIN,sourceManifestSha256,contenderManifestSha256,
    sameFixedCandidate60AcrossAllGames:true,allOriginalSource60Unchanged:true,
    summary,rows,rawDevelopment:data,
    competitiveQualifiedGames:0,finalDeckSelection:'none'};
  return result;
}

/** Small archive writers need both an exclusive process lock and atomic rename. */
function save(result){
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const tmp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(tmp,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
    const file=fs.openSync(tmp,'r');
    try{fs.fsyncSync(file);}finally{fs.closeSync(file);}
    fs.renameSync(tmp,OUTPUT);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}

if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const {reg,registrationSha256}=registration();
    console.log('AGENT44_M4_PROSPECTIVE_REGISTRATION',JSON.stringify({
      registrationSha256,trialIds:reg.registeredTrials.map(x=>x.id),
      rootCap:reg.maxNativeRootActions,competitivelyQualifiedGames:0
    }));
  }else{
    const result=run();
    save(result);
    console.log('AGENT44_M4_RANK5_PAPER_SOURCE_NATIVE',
      JSON.stringify({summary:result.summary,rows:result.rows}));
  }
}
module.exports={VERSION,REGPATH,registration,run,save};
