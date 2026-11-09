'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const registration=require('../../../results/aichi-2026/registrations/agent3-hood-consistency-v2-targeted-20261109.json');
const hood=require('../../../results/aichi-2026/candidate-hood-shadow-rider.json');
const consistency=require('../../../results/aichi-2026/candidate-hood-consistency-v2.json');
const frozen=require('../agent41-frozen-bilateral-development-v2.json');
const {runDevelopment,validateRegisteredTrialGroups}=
  require('../agent41-bilateral-v2-development.cjs');
const {withPaperSemanticsProfileV1,PINNED_TWINLEAF,VERSION:PROFILE_VERSION}=
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');
const {classifyNativeAttempt}=
  require('../agent41-native-attempt-disposition.cjs');
const {save}=require('../agent43-guzma-original-source-pair.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const VERSION='agent3-hood-consistency-v2-targeted-native-prospective-v1';
const OUTPUT=process.env.AGENT3_HOOD_CONSISTENCY_OUTPUT??
  path.join(ROOT,'artifacts/agent3-hood-consistency-v2-targeted.json');
const SOURCE_POLICY=Object.freeze({
  actorOnlyComposition:true,
  actorMewMaxMiracleOverSelfCopy:true,
  actorMewGenesectTechnoBlast:true,
  actorMewDceRecipientRoot:true,
  actorMewDceRecipientSourceOnly:true,
  actorDceMewMobilityRoot:true,
  actorGenesectFusionDrawRoot:true,
  actorNaturalEvolutionRoot:true,
  bilateralBasicEnergyRecipientFrontier:true,
  actorUnderworldDoorPromptOwner:true,
  actorUnderworldDoorRoot:true,
  nativeAllOwnerPassFrontier:true,
  actorGuzmaPromptContinuation:true,
  actorZeroEnergyStrandFloatStoneRoot:true,
  actorSeekerGuzmaNominalKo:true,
  actorZeroEnergyStrandFloatStoneTargetTurn:null,
  actorZeroEnergyStrandFloatStoneOwnerSeat:null,
  actorSeekerGuzmaOwnerSeat:null,
  actorSeekerGuzmaGlobalTurn:null
});
const PAPER_PROFILE=Object.freeze({
  celestialRoar:true,mewEnergyMix:true,attachEnergyTarget:true
});
/** @param {Buffer} b @returns {string} Git's content-addressed SHA-1. */
function blob(b){
  return createHash('sha1').update('blob '+b.length+'\0').update(b)
    .digest('hex');
}
function digest(x){
  return createHash('sha256').update(JSON.stringify(x)).digest('hex');
}
/** Require unmodified fixed-sixty candidates, roster, frozen policy and seed board. */
function preflight(){
  assert.equal(registration.schema,
    'agent3-hood-rebalanced-lele-seeker-fixed60-targeted-prospective-v1');
  assert.equal(registration.status,'FROZEN BEFORE FIRST NATIVE MATCH');
  assert.equal(registration.registeredGroups,44);
  assert.equal(registration.registeredNativeGames,88);
  assert.equal(registration.rootCap,260);
  assert.equal(registration.pinnedTwinleaf,PINNED_TWINLEAF);
  assert.equal(frozen.pinnedVendorRevision,PINNED_TWINLEAF);
  assert.equal(registration.profile,PROFILE_VERSION);
  assert.deepEqual(registration.originalSourceRanks,
    [1,2,5,6,7,11,12,13,24,29,31]);
  for(const manifest of registration.fixedContenders){
    const bytes=fs.readFileSync(path.join(ROOT,manifest.path));
    assert.equal(blob(bytes),manifest.gitBlobSha,
      'Frozen fixed 60 modified after registration: '+manifest.id);
    const candidate=JSON.parse(bytes);
    assert.equal(candidate.cards.reduce((s,x)=>s+x.count,0),60);
    assert.ok(candidate.cards.every(x=>
      x.count>=1&&x.count<=4 || x.category==='Energy'&&
      x.name==='Psychic Energy'&&x.count===11));
  }
  for(const [file,sha] of [
    [registration.originalRosterPath,registration.originalRosterGitBlobSha],
    [registration.commonPolicyPath,registration.commonPolicyGitBlobSha]
  ])assert.equal(blob(fs.readFileSync(path.join(ROOT,file))),sha,
    'Registered source or shared policy drift: '+file);
  assert.equal(registration.registeredTrials.length,88);
  const admitted=require('../agent25-authenticated-source-admission.cjs')
    .authenticatedSourceRanks(
      require('../../../results/aichi-2026/full-decklists.json'),true);
  for(const id of ['hood-shield-v1','hood-consistency-v2'])
    validateRegisteredTrialGroups(registration.registeredTrials.filter(t=>
      t.candidateId===id),admitted,false,true);
  assert.equal(new Set(registration.sourceGroups.map(x=>x.seed)).size,44);
  assert.deepEqual(registration.fixedContenders.map(x=>x.id),
    ['hood-shield-v1','hood-consistency-v2']);
  for(let i=0;i<registration.registeredTrials.length;i+=2){
    const a=registration.registeredTrials[i];
    const b=registration.registeredTrials[i+1];
    assert.equal(a.id,[a.rank,a.repeat,a.candidateSlot,a.candidateId].join(':'));
    assert.equal(b.id,[b.rank,b.repeat,b.candidateSlot,b.candidateId].join(':'));
    assert.equal(a.rank,b.rank);
    assert.equal(a.seed,b.seed);
    assert.equal(a.candidateSlot,b.candidateSlot);
    assert.equal(a.candidateId,'hood-shield-v1');
    assert.equal(b.candidateId,'hood-consistency-v2');
  }
  return {ranks:registration.originalSourceRanks,registeredGroups:44,
    nativeAttempts:88,printBlobs:registration.fixedContenders.map(x=>({
      id:x.id,sha:x.gitBlobSha})),enginePin:PINNED_TWINLEAF};
}
/** @param {object} row @returns {object} An attempt without imputed caps. */
function receipt(row){
  const trial=row.trial,seat=trial.candidateSlot==='A'?0:1;
  const roots=row.rootActionLedger??row.nativeAbortEvidence?.rootActionLedger??[];
  const kind=classifyNativeAttempt(row).kind;
  const finished=kind==='ENGINE_TERMINAL'&&row.finished===true;
  const own=roots.filter(x=>x.playerSlot===seat);
  const plays=name=>own.filter(x=>x.action==='PlayCardAction'&&
    (x.card===name||x.card?.startsWith(name+' '))).length;
  return {id:trial.id,rank:trial.rank,seed:trial.seed,seat,
    candidateId:trial.candidateId,status:kind,
    finished,candidateWin:finished&&row.winner===seat,
    nativeWinner:finished?row.winner:null,
    candidateOpening:row.fullPhysicalDealFingerprint??null,
    originalSourceOpening:row.sourceDealFingerprint??null,
    actualStarterSeat:row.actualStarterSeat??null,
    roots:roots.length,rootDigest:digest(roots),
    playedHood:plays('Stealthy Hood'),
    playedRanger:plays('Pokémon Ranger'),
    playedArven:plays('Arven'),
    playedLele:plays('Tapu Lele-GX'),
    playedSeeker:plays('VS Seeker'),
    paidCopyAttacks:own.filter(x=>x.action==='AttackAction'&&
      x.attack==='Cross Fusion Strike').length,
    error:row.error?String(row.error).slice(0,1200):null,
    rootActionLedger:roots,paperQualified:false};
}
/** Sharp source-paired unknown-outcome envelope, no censor imputation. */
function compare(records){
  const byId=new Map(records.map(x=>[x.id,x]));
  const groups=registration.sourceGroups.map(g=>{
    const key=[g.rank,g.repeat,g.candidateSlot].join(':');
    const a=byId.get(key+':hood-shield-v1');
    const b=byId.get(key+':hood-consistency-v2');
    assert.ok(a&&b,'Registered source pair lost '+key);
    const matched=Boolean(a.originalSourceOpening&&
      b.originalSourceOpening&&
      a.originalSourceOpening===b.originalSourceOpening&&
      a.actualStarterSeat!==null&&
      a.actualStarterSeat===b.actualStarterSeat);
    const al=a.finished?a.candidateWin?1:0:null;
    const bl=b.finished?b.candidateWin?1:0:null;
    const lower=matched?(bl??0)-(al??1):null;
    const upper=matched?(bl??1)-(al??0):null;
    let firstDifferentRoot=null;
    for(let i=0;i<Math.max(a.rootActionLedger.length,
      b.rootActionLedger.length);i++){
      const x=a.rootActionLedger[i]??null,y=b.rootActionLedger[i]??null;
      const shape=q=>q?[q.playerSlot,q.action,q.card??null,
        q.attack??null,q.turnBefore]:null;
      if(JSON.stringify(shape(x))!==JSON.stringify(shape(y))){
        firstDifferentRoot=i;break;
      }
    }
    return {rank:g.rank,repeat:g.repeat,slot:g.candidateSlot,seed:g.seed,
      matchedSourceAndActualStarter:matched,bothTerminal:a.finished&&b.finished,
      comparableBothTerminal:matched&&a.finished&&b.finished,
      observedDelta:lower===upper?lower:null,
      possibleV2MinusV1:{lower,upper},
      firstDifferentRoot,
      firstV1Action:firstDifferentRoot===null?null:
        a.rootActionLedger[firstDifferentRoot]??null,
      firstV2Action:firstDifferentRoot===null?null:
        b.rootActionLedger[firstDifferentRoot]??null,
      v1:a,v2:b,paperQualified:false};
  });
  const compared=groups.filter(g=>g.matchedSourceAndActualStarter);
  const total=(fn)=>compared.reduce((n,g)=>n+fn(g),0);
  const states={};
  for(const [id,key] of [['hood-shield-v1','v1'],['hood-consistency-v2','v2']]){
    const rows=groups.map(g=>g[key]);
    states[id]={attempts:rows.length,
      nativeTerminals:rows.filter(x=>x.finished).length,
      nativeWins:rows.filter(x=>x.candidateWin).length,
      capped:rows.filter(x=>x.status==='ACTION_CAP').length,
      errors:rows.filter(x=>x.status==='NATIVE_ABORT').length,
      hoodPlayed:rows.reduce((n,x)=>n+x.playedHood,0),
      arvenPlayed:rows.reduce((n,x)=>n+x.playedArven,0),
      rangerPlayed:rows.reduce((n,x)=>n+x.playedRanger,0),
      lelePlayed:rows.reduce((n,x)=>n+x.playedLele,0),
      seekerPlayed:rows.reduce((n,x)=>n+x.playedSeeker,0)};
  }
  return {groups,summary:{
    allRegisteredGroups:groups.length,nativeAttempts:records.length,
    sourceAndStarterMatched:compared.length,
    differentSourceOrStarter:groups.length-compared.length,
    matchedBothNaturallyTerminal:compared.filter(g=>g.bothTerminal).length,
    matchedTerminalV2Gains:compared.filter(g=>g.observedDelta===1).length,
    matchedTerminalV1Gains:compared.filter(g=>g.observedDelta===-1).length,
    sharpPairedV2MinusV1WinCount:{
      lower:total(g=>g.possibleV2MinusV1.lower),
      upper:total(g=>g.possibleV2MinusV1.upper)},
    ...states,
    competitivelyQualifiedPaperGames:0}};
}
/**
 * Execute exact preregistered original-source fixed-deck pairs on pinned Store.
 * The same owner source policy and identical research paper correction runs in
 * both contenders and both seats. No opponent-specific deck changes occur.
 */
function run({runner=runDevelopment,profile=withPaperSemanticsProfileV1}={}){
  const p=preflight();
  const prior=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
  let result;
  try{
    result=profile(()=>{
      const all=[];
      for(const id of ['hood-shield-v1','hood-consistency-v2']){
        const registeredTrials=registration.registeredTrials.filter(t=>
          t.candidateId===id);
        const arm=runner({
          ...frozen.policyOptions,...SOURCE_POLICY,
          registeredCandidateDecks:{
            'hood-shield-v1':hood,'hood-consistency-v2':consistency},
          registeredTrials,
          registeredFrameName:VERSION+':'+id,
          allowSingleCandidatePerGroup:true,
          allowAdditionalOriginalSourceRanks:true,
          nativeRootActionLimit:260,
          isolatePolicyRandomness:true,
          isolatePhysicalShuffleRandomnessAfterSetup:true
        });
        assert.equal(arm.attempted,44);
        assert.equal(arm.rows.length,44);
        all.push(...arm.rows);
      }
      const byId=new Map(all.map(row=>[row.trial.id,row]));
      assert.equal(byId.size,88);
      return {attempted:88,rows:registration.registeredTrials.map(t=>{
        const row=byId.get(t.id);
        assert.ok(row,'Missing candidate-source native result '+t.id);
        return row;
      })};
    },PAPER_PROFILE);
  }finally{
    if(prior===undefined)
      delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=prior;
  }
  const native=result.result;
  assert.equal(native.attempted,88);
  assert.equal(native.rows.length,88);
  assert.deepEqual(native.rows.map(row=>row.trial.id),
    registration.registeredTrials.map(x=>x.id));
  const rows=native.rows.map(receipt);
  const comparison=compare(rows);
  return {schema:VERSION,preflight:p,registration,
    sourcePolicy:SOURCE_POLICY,
    sharedPaperProfile:PROFILE_VERSION,
    sharedPaperAudit:result.audit,
    nativeEngine:PINNED_TWINLEAF,
    checkoutCommit:process.env.GITHUB_SHA??null,
    summary:comparison.summary,comparison,allNativeRows:native.rows,
    allRecordedNativeAttempts:88,developmentOnly:true,
    competitiveAdmission:false};
}
if(require.main===module){
  const result=run();
  save(OUTPUT,result);
  process.stdout.write('AGENT3_HOOD_V2_TARGETED '+
    JSON.stringify({summary:result.summary,
      profile:result.sharedPaperProfile,output:OUTPUT})+'\n');
  if(result.summary.sourceAndStarterMatched===0)process.exitCode=1;
}
module.exports={VERSION,SOURCE_POLICY,PAPER_PROFILE,preflight,receipt,compare,run};
