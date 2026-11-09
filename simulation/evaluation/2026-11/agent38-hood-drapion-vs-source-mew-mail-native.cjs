'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');
const {sourceSummary}=
  require('../agent37-rank5-fusion-mobility-prospective.cjs');
const {saveAtomic}=
  require('../agent37-rank5-source-quickball-discard-retrospective.cjs');

const VERSION='agent38-hood-one-slot-drapion-vs-original-mew-mail-native-v1';
const ROOT=path.resolve(__dirname,'../../..');
const REGPATH='results/aichi-2026/registrations/agent38-fresh-hood-drapion-source-mail-20261109.json';
const OUTPUT=path.join(ROOT,'agent38-hood-drapion-mew-native-32games.json');
const CANDIDATES=['hood-shield-v1','hood-drapion-mew-responder-v1'];

/** Strictly precommitted source deals and one exactly 60-card alternate. */
function readRegistration(){
  const raw=fs.readFileSync(path.join(ROOT,REGPATH));
  const r=JSON.parse(raw.toString('utf8'));
  assert.equal(r.schema,VERSION);
  assert.equal(r.status,'FROZEN_BEFORE_EXECUTION');
  assert.deepEqual(r.candidateIds,CANDIDATES);
  assert.equal(r.groups.length,16);
  assert.equal(r.expectedNativeGames,32);
  assert.equal(new Set(r.groups.map(x=>x.seed)).size,16);
  assert.equal(r.groups.filter(x=>x.candidateSlot==='A').length,8);
  assert.equal(r.groups.filter(x=>x.candidateSlot==='B').length,8);
  const hood=require('../../../results/aichi-2026/candidate-hood-shadow-rider.json');
  const variant=require('../../../results/aichi-2026/candidate-hood-drapion-mew-responder-v1.json');
  assert.equal(hood.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(variant.cards.reduce((n,c)=>n+c.count,0),60);
  const key=x=>[x.name,x.printing?.set,x.printing?.number].join(':');
  const diff=new Map();
  for(const c of hood.cards)diff.set(key(c),(diff.get(key(c))??0)-c.count);
  for(const c of variant.cards)diff.set(key(c),(diff.get(key(c))??0)+c.count);
  assert.deepEqual([...diff].filter(([,v])=>v!==0).sort((a,b)=>a[0].localeCompare(b[0])),
    [['Drapion V:LOR:118',1],["Lillie's Clefairy ex:JTG:56",-1]]);
  return {r,hood,variant,
    registrationSha256:createHash('sha256').update(raw).digest('hex')};
}

/** Real root action evidence. Candidate item count alone is never an attack. */
function summarize(row){
  const s=sourceSummary(row);
  const candidateSeat=1-s.sourceSeat;
  const roots=row.rootActionLedger??[];
  const ownRoots=roots.filter(x=>x.playerSlot===candidateSeat);
  const drapionBench=ownRoots.filter(x=>x.action==='PlayCardAction'&&
    x.card==='Drapion V LOR');
  const drapionAttack=ownRoots.filter(x=>x.action==='AttackAction'&&
    x.attack==='Dynamic Tail');
  return {
    trial:row.trial,sourceSeat:s.sourceSeat,candidateSeat,
    sourceDeal:s.sourceDealFingerprint,
    fullPhysicalDeal:s.fullPhysicalDealFingerprint,
    firstPlayer:s.actualStarterSeat,
    nativeDisposition:s.nativeDisposition,
    nativeActions:row.actionCount??null,
    finished:row.finished===true,
    candidateWon:row.finished===true?row.winner===candidateSeat:null,
    sourceWon:row.finished===true?row.winner===s.sourceSeat:null,
    sourcePrizes:row.finalPrizes?.[s.sourceSeat]??null,
    candidatePrizes:row.finalPrizes?.[candidateSeat]??null,
    originalSourceAttacks:s.sourceAttackDeclarations,
    candidateDeclaredAttacks:row.attackDeclarations?.candidate??null,
    acceptedDrapionPlayRoots:drapionBench,
    acceptedDrapionDynamicTailRoots:drapionAttack,
    finalCandidateBoard:row.finalBoard?.[candidateSeat]??null,
    originalMailAccepted:row.ownerMailAfterPassAudit?.mailStoreAccepted??
      row.ownerMailAfterPassAbortAudit?.mailStoreAccepted??null,
    error:row.error?String(row.error?.message??row.error).slice(0,500):null,
    competitiveQualified:false};
}

/** Two legally constructed 60s, same original Mew source and source Mail. */
function execute(){
  const {r,hood,variant,registrationSha256}=readRegistration();
  const frozen=require('../agent41-frozen-bilateral-development-v2.json');
  assert.equal(frozen.policyOptions.actorOnlyComposition,true);
  const common={
    ...frozen.policyOptions,
    actorNaturalEvolutionRoot:true,
    actorMewGenesectTechnoBlast:true,
    sourceScopedQuickBallRoot:true,
    actorHandDiscard:true,actorOnlySingleSearch:true,
    actorMewGenesectQuickBallSearch:true,
    actorDceMewMobilityRoot:true,
    actorMewDceRecipientRoot:true,
    actorMewDceRecipientSourceOnly:true,
    actorGenesectFusionDrawRoot:true,
    actorMewUltraBallRoot:true,
    actorMewUltraBallSearch:true,
    actorMewUltraBallPaymentGuard:true,
    actorMewQuickBallPaymentGuard:true,
    actorOwnerMailAfterPass:true,
    actorOwnerMailAfterPassSourceOnly:true,
    registeredCandidateDecks:{
      'hood-shield-v1':{label:'hood-shield-v1',cards:hood.cards},
      'hood-drapion-mew-responder-v1':{
        label:'hood-drapion-mew-responder-v1',cards:variant.cards
      }
    },
    allowSingleCandidatePerGroup:true,
    allowAdditionalOriginalSourceRanks:true
  };
  const variants={};
  for(const id of CANDIDATES){
    const trials=r.groups.map(g=>({...g,candidateId:id,
      id:[g.rank,g.repeat,g.candidateSlot,id].join(':')}));
    try{
      const raw=runDevelopment({...common,registeredTrials:trials,
        registeredFrameName:VERSION+'-'+id});
      assert.equal(raw.attempted,16);
      assert.deepEqual(raw.rows.map(x=>x.trial.id),trials.map(x=>x.id));
      variants[id]={rows:raw.rows.map(summarize),
        rawNative:raw,batchError:null};
    }catch(error){
      variants[id]={rows:trials.map(trial=>({
        trial,sourceDeal:null,fullPhysicalDeal:null,firstPlayer:null,
        nativeDisposition:'NATIVE_BATCH_ERROR',finished:false,
        error:String(error?.message??error),competitiveQualified:false
      })),rawNative:null,batchError:String(error?.stack??error)};
    }
  }
  const comparisons=r.groups.map((g,i)=>{
    const a=variants[CANDIDATES[0]].rows[i];
    const b=variants[CANDIDATES[1]].rows[i];
    const sameSource=Boolean(a.sourceDeal&&a.sourceDeal===b.sourceDeal&&
      a.firstPlayer===b.firstPlayer);
    const sameFull=Boolean(a.fullPhysicalDeal&&
      a.fullPhysicalDeal===b.fullPhysicalDeal);
    return {originalRank:g.rank,sourceSeed:g.seed,sourceSlot:g.candidateSlot,
      sameSourceOpening:sameSource,sameFullDeal:sameFull,
      originalHood:a,drapionHood:b,
      independentPaperQualified:false};
  });
  return {schema:VERSION,registration:REGPATH,registrationSha256,
    sourceRank:5,pinnedStore:r.pinnedEngine,
    nativeAttempts:r.expectedNativeGames,
    sourceOpeningMatched:comparisons.filter(x=>x.sameSourceOpening).length,
    completeNativeBoth:comparisons.filter(x=>
      x.originalHood.finished&&x.drapionHood.finished).length,
    drapionActualBenchCount:variants[CANDIDATES[1]].rows.reduce((n,x)=>
      n+(x.acceptedDrapionPlayRoots?.length??0),0),
    drapionActualAttacks:variants[CANDIDATES[1]].rows.reduce((n,x)=>
      n+(x.acceptedDrapionDynamicTailRoots?.length??0),0),
    comparisons,variants,qualifiedPaperGames:0,
    certifiedWinRate:null};
}

if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const {r,registrationSha256}=readRegistration();
    process.stdout.write(JSON.stringify({
      schema:VERSION,registrationSha256,
      trials:r.groups,expectedGames:r.expectedNativeGames
    },null,2)+'\n');
  }else{
    const z=execute();
    saveAtomic(OUTPUT,z);
    process.stdout.write(JSON.stringify({
      schema:VERSION,registrationSha256:z.registrationSha256,
      sourceMatched:z.sourceOpeningMatched,
      bothNaturalTerminals:z.completeNativeBoth,
      nativeDrapionBenchRoots:z.drapionActualBenchCount,
      nativeDrapionAttackRoots:z.drapionActualAttacks,
      perOpening:z.comparisons.map(x=>({
        seed:x.sourceSeed,sourceSlot:x.sourceSlot,
        sameSourceOpening:x.sameSourceOpening,
        hood:{finished:x.originalHood.finished,
          candidateWon:x.originalHood.candidateWon,
          sourcePrizes:x.originalHood.sourcePrizes,
          candidateAttacks:x.originalHood.candidateDeclaredAttacks},
        drapion:{finished:x.drapionHood.finished,
          candidateWon:x.drapionHood.candidateWon,
          sourcePrizes:x.drapionHood.sourcePrizes,
          candidateAttacks:x.drapionHood.candidateDeclaredAttacks,
          bench:x.drapionHood.acceptedDrapionPlayRoots?.length??0,
          dynamicTail:x.drapionHood.acceptedDrapionDynamicTailRoots?.length??0},
      })),
      batchErrors:Object.fromEntries(Object.entries(z.variants)
        .filter(([,x])=>x.batchError).map(([id,x])=>[id,x.batchError])),
      qualifiedPaperGames:0
    },null,2)+'\n');
    if(Object.values(z.variants).some(x=>x.batchError))process.exitCode=1;
  }
}
module.exports={VERSION,REGPATH,readRegistration,summarize,execute};
