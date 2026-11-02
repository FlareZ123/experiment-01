'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const registration=require('../../results/aichi-2026/registrations/agent39-rank16-quickbridge-prospective-20261102.json');
const {summarizeGame,validateSource,rootPublic}=
  require('./agent39-rank16-direct-source-shake.cjs');

const ROOT=path.resolve(__dirname,'../..');
const VERSION='agent39-original-rank16-quick-to-direct-native-source-v1';
const MAX_ACTIONS=96;
const IDS=['champion-reference','new-moon-lockbreaker-v1'];
const sha256=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/** Assert all 64 immutable original source deal groups, paired candidate arms. */
function scheduledArms(){
  assert.equal(registration.schema,
    'agent39-rank16-real-quick-to-direct-shake-prospective-v1');
  assert.equal(registration.seedGroups,64);
  assert.equal(registration.groupsPerPartition,16);
  assert.equal(registration.partitionCount,4);
  assert.deepEqual(registration.candidateIds,IDS);
  assert.equal(registration.originalSourceRank,16);
  assert.equal(registration.budget.sourceArms,128);
  assert.equal(registration.budget.totalNativeGames,256);
  assert.equal(registration.budget.rootActionCapPerGame,MAX_ACTIONS);
  assert.equal(registration.nativeEnginePin,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  const frame=registration.sourceFrame;
  assert.equal(frame.length,64);
  assert.equal(sha256(frame),registration.sourceFrameSha256);
  const distinct=new Set();
  for(const [index,row] of frame.entries()){
    assert.equal(row.group,index);
    assert.equal(row.sourceSeat,index%2);
    assert.equal(row.seed,createHash('sha256')
      .update(registration.seedLabel+':'+index)
      .digest().readUInt32BE(0));
    assert.ok(!distinct.has(row.seed));
    distinct.add(row.seed);
  }
  return frame.flatMap(row=>IDS.map(candidateId=>({...row,
    candidateId,id:[16,row.group,row.sourceSeat,candidateId].join(':')})));
}

/** Do not conflate an owner acquisition root with a completed Garbodor line. */
function classify(control,treatment,sourceAudit,quickAudit){
  if(control.error||treatment.error)return 'NATIVE_ERROR';
  if(!control.game?.sourceDeal||!treatment.game?.sourceDeal)
    return 'SOURCE_PHYSICAL_UNVERIFIED';
  if(JSON.stringify(control.game.sourceDeal)!==
     JSON.stringify(treatment.game.sourceDeal))
    return 'SOURCE_PHYSICAL_MISMATCH';
  if(quickAudit?.attempted===null||!quickAudit){
    return control.game.decisionTraceSha256===
      treatment.game.decisionTraceSha256?
      'NO_QUICK_OFFER_TRACE_IDENTICAL':'NO_QUICK_OFFER_TRACE_DIVERGED';
  }
  if(quickAudit.aborted)
    return 'QUICK_BRIDGE_ABORTED:'+quickAudit.aborted.reason;
  if(quickAudit.completed!==true)return 'QUICK_BRIDGE_STARTED_INCOMPLETE';
  if(sourceAudit?.aborted)
    return 'TRUBBISH_BENCHED_GARBODOR_ABORTED';
  if(sourceAudit?.completed===true)
    return 'QUICK_BRIDGE_AND_GARBODOR_NATIVE_COMPLETE';
  return 'TRUBBISH_BENCHED_GARBODOR_NOT_COMPLETED';
}

/** @param {object} trial Exact registered original source deal and candidate. */
function runTrial(trial,prepared,Store){
  const sourceSeat=trial.sourceSeat;
  const plan=prepared.get(trial.candidateId).plan;
  const original=plan.opponents.find(x=>x.rank===16);
  assert.equal(original?.status,'ready');
  assert.equal(original.cards.length,60);
  assert.equal(plan.candidate.cards.length,60);
  const request={
    deckA:sourceSeat===0?original.cards:plan.candidate.cards,
    deckB:sourceSeat===1?original.cards:plan.candidate.cards,
    seed:trial.seed,maxActions:MAX_ACTIONS,
    label:VERSION+':'+trial.id,
    strictPromptValidation:true,
    forestSealSearchCorrection:true,
    doubleDragonRecovery:true,
    supporterDecisionCorrection:true,
    isolatePolicyRandomness:true,
    leleEntryAbilityLockCorrection:true,
    radiantGateLockCorrection:true,
    entryDrawLockCorrection:true,
    captureDecisionTrace:true,
    captureInitialSourceDealFingerprintSeat:sourceSeat,
    captureInitialFullPhysicalDeal:true
  };
  const {runMatch}=require('../twinleaf/headless.cjs');
  const {withRank11DirectBoostShake}=
    require('../twinleaf/rank11-direct-boostshake.cjs');
  const {withOriginalRank16QuickToShake}=
    require('../twinleaf/agent39-rank16-quickshake.cjs');
  const {withRank8AuthenticK0Observer}=
    require('../twinleaf/agent44-rank8-box-k0-source-census.cjs');
  const {withOriginalSourcePowerReply}=
    require('../twinleaf/agent39-rank16-original-power-reply.cjs');
  /** @param {boolean} combined */
  const execute=combined=>{
    try{
      const sourceObserver=withRank8AuthenticK0Observer(Store,sourceSeat,
        ()=>withOriginalSourcePowerReply(Store,sourceSeat,
          ()=>withRank11DirectBoostShake(sourceSeat,
            combined?()=>withOriginalRank16QuickToShake(sourceSeat,
              ()=>runMatch(request)):()=>runMatch(request),
            {k0AvoidAllGarbodorHeld:false,
              k1AvoidMissingGarbodor:true,allowLaterTurns:false})));
      const powers=sourceObserver.result;
      const direct=powers.result;
      const quick=combined?direct.result:null;
      const game=combined?quick?.result:direct.result;
      assert.ok(game);
      return {error:null,game:summarizeGame(game,sourceSeat),
        sourceK0:sourceObserver.sourceK0,
        directAudit:direct.policyAudit,
        quickAudit:quick?.audit??null,
        powerReply:powers.audit,
        rootEvidence:{
          sourceFirst:game.rootActionLedger?.filter(x=>
            x.playerSlot===sourceSeat&&
            x.turnBefore===(game.firstTurnSlot===sourceSeat?1:2)&&
            x.pendingPrompt==null).map(rootPublic)??[],
          opponentNext:game.rootActionLedger?.filter(x=>
            x.playerSlot===1-sourceSeat&&
            x.turnBefore===(game.firstTurnSlot===sourceSeat?2:3)&&
            x.pendingPrompt==null).slice(0,14).map(rootPublic)??[]
        }
      };
    }catch(error){
      return {error:{name:error?.name??'Error',
        message:String(error?.message??error).slice(0,500)},
        game:null,sourceK0:null,directAudit:null,
        quickAudit:null,powerReply:null,rootEvidence:null};
    }
  };
  const baseline=execute(false),intervention=execute(true);
  const status=classify(baseline,intervention,
    intervention.directAudit,intervention.quickAudit);
  return {...trial,status,baseline,intervention,
    identicalSourcePhysicalDeal:baseline.game?.sourceDeal&&
      intervention.game?.sourceDeal?
      JSON.stringify(baseline.game.sourceDeal)===
        JSON.stringify(intervention.game.sourceDeal):null,
    identicalFirstOwnerVisibleHand:baseline.sourceK0&&intervention.sourceK0?
      JSON.stringify(baseline.sourceK0.ownerHandPrintings)===
        JSON.stringify(intervention.sourceK0.ownerHandPrintings):null,
    paperCompetitivelyQualified:false,
    realOpposingTacticalAbilityUseCertified:false};
}

/** @param {number} partition Frozen groups of 16, no seed choice or posthoc exclusions. */
function run(partition=0){
  assert.ok(Number.isSafeInteger(partition)&&partition>=0&&partition<4);
  const trials=scheduledArms().filter(row=>
    Math.floor(row.group/16)===partition);
  assert.equal(trials.length,32);
  const original=validateSource();
  assert.equal(original.player,registration.originalSourcePlayer);
  const {planAichi}=require('./aichi-pilot.cjs');
  const {loadNewMoonCandidate}=
    require('../../scripts/aichi-new-moon-candidate.cjs');
  const published=JSON.parse(fs.readFileSync(path.join(ROOT,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const champion=published.decks.find(x=>x.rank===1);
  const moon=loadNewMoonCandidate();
  const selected=[
    ['champion-reference',{label:'champion-reference',cards:champion.cards}],
    ['new-moon-lockbreaker-v1',{label:'new-moon-lockbreaker-v1',cards:moon.cards}]
  ];
  const prepared=new Map(selected.map(([id,manifest])=>[
    id,{plan:planAichi(manifest,{
      allowEquivalentBasicEnergies:true,
      allowBasicEnergyMirrorPrintings:true,
      allowJapanesePromoHooks:true
    })}
  ]));
  for(const item of prepared.values()){
    assert.equal(item.plan.engineRevision,registration.nativeEnginePin);
    assert.equal(item.plan.candidate.cards.length,60);
  }
  const {initializeCards}=require('../twinleaf/headless.cjs');
  initializeCards();
  const {Store}=require(path.join(ROOT,
    'vendor/twinleaf/ptcg-server/output/game/store/store'));
  const rows=trials.map(row=>runTrial(row,prepared,Store));
  const statuses={};
  for(const row of rows)statuses[row.status]=(statuses[row.status]??0)+1;
  const candidateSourcePairs=[];
  for(let group=16*partition;group<16*(partition+1);group++){
    const x=rows.filter(row=>row.group===group);
    assert.equal(x.length,2);
    const a=x[0].intervention.game?.sourceDeal,
      b=x[1].intervention.game?.sourceDeal;
    candidateSourcePairs.push({group,status:!a||!b?'UNVERIFIED':
      JSON.stringify(a)===JSON.stringify(b)?'MATCH':'DIFFERENT'});
  }
  return {schema:VERSION,
    registration:'results/aichi-2026/registrations/agent39-rank16-quickbridge-prospective-20261102.json',
    nativePin:registration.nativeEnginePin,
    runHeadSha:process.env.GITHUB_SHA??null,
    partition,sourceRank:16,
    preRegisteredIndependentSeedGroups:64,
    candidateConditionedRegisteredArms:128,
    totalNativeGamesRegistered:256,
    rootCap:MAX_ACTIONS,
    sourceCandidateSixtiesUntouched:true,
    sourcePolicyComparison:'direct-only baseline vs direct+Quick native bridge',
    partitionAttempted:rows.length,
    nativeGameExecutions:rows.length*2,
    statuses,quickOffers:rows.filter(row=>
      row.intervention.quickAudit?.attempted!==null&&
      row.intervention.quickAudit?.attempted!==undefined).length,
    nativeQuickToGarbodorComplete:rows.filter(row=>
      row.status==='QUICK_BRIDGE_AND_GARBODOR_NATIVE_COMPLETE').length,
    nativeQuickAborts:rows.filter(row=>
      row.status.startsWith('QUICK_BRIDGE_ABORTED:')).length,
    candidateSourcePairs,
    competitivelyQualifiedGames:0,
    denominatorsNotFiltered:true,
    caveat:'Prospectively registered original rank16 source; native K0/K1 accepted card actions and blocked candidate Power queries are not paper qualified human game wins; original max 96 root cap.',
    rows};
}
if(require.main===module){
  const partition=Number(process.env.AGENT39_RANK16_QUICK_PARTITION??'0');
  process.stdout.write(JSON.stringify(run(partition),null,2)+'\n');
}
module.exports={VERSION,scheduledArms,classify,runTrial,run};
