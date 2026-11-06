'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {execFileSync}=require('node:child_process');

const {VERSION:TREATMENT_VERSION,
  runIssue25V8WithTelepathAndDefaultConfirmFalse}=require(
  '../simulation/evaluation/agent32-issue25-v8-telepath-confirm-default-false.cjs');
const {VERSION,withKoSourcePromptPhysical}=require(
  '../simulation/twinleaf/agent3-ko-source-prompt-physical-v4.cjs');
const {runDevelopment}=require(
  '../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const {VERSION:EXIT_VERSION,withAuthoritativeRootPrizeExitObserver}=require(
  '../simulation/twinleaf/agent3-authoritative-root-prize-exit-observer.cjs');
const {VERSION:ORIGIN_VERSION,withCheckStateGeneratorOriginToken}=require(
  '../simulation/twinleaf/agent3-checkstate-generator-origin-token.cjs');

const ROOT=path.resolve(__dirname,'..');
const hash=b=>createHash('sha256').update(b).digest('hex');

/** Only original-registered native attempts; no reroll, prospective change, or deck change. */
function save(receipt,dir){
  fs.mkdirSync(dir,{recursive:true});
  const lock=path.join(dir,'.agent3-v24-v8-source.lock');
  const fd=fs.openSync(lock,'wx');
  const name='agent3-v24-selected-v8-ko-source-physical.json';
  const output=path.join(dir,name);
  const stage=output+'.'+process.pid+'.tmp';
  const sidecar=output+'.sha256';
  const stageHash=sidecar+'.'+process.pid+'.tmp';
  const bytes=Buffer.from(JSON.stringify(receipt,null,2)+'\n');
  try{
    fs.writeFileSync(stage,bytes,{flag:'wx'});
    fs.writeFileSync(stageHash,hash(bytes)+'  '+name+'\n',{flag:'wx'});
    fs.renameSync(stage,output);
    fs.renameSync(stageHash,sidecar);
  }finally{
    for(const x of [stage,stageHash])if(fs.existsSync(x))fs.unlinkSync(x);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
  return {bytes:bytes.length,sha256:hash(bytes)};
}

test('same-eight retrospective Telepath Confirm treatment captures terminal physical Prize exits',()=>{
  const vendor=execFileSync('git',['rev-parse','HEAD'],{
    cwd:path.join(ROOT,'vendor/twinleaf'),encoding:'utf8'
  }).trim();
  assert.equal(vendor,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  const registrationPath=
    'results/aichi-2026/registrations/agent36-issue25-common-v8-broader-prospective-20261106.json';
  const registration=fs.readFileSync(path.join(ROOT,registrationPath));
  const registered=JSON.parse(registration.toString('utf8'));
  const expectedTrialIds=registered.trials.map(row=>row.id);
  const rootBinding={current:null,currentTrialId:null,callbackCount:0,trialIds:[]};
  const {result:koObserved,audit:originAudit}=withCheckStateGeneratorOriginToken(
    ()=>withKoSourcePromptPhysical(
    ()=>withAuthoritativeRootPrizeExitObserver(
      ()=>runIssue25V8WithTelepathAndDefaultConfirmFalse({
      v8Deps:{runner:options=>runDevelopment({
        ...options,
        onRootStoreCreated:(store,trialId)=>{
          assert.ok(store&&typeof store.dispatch==='function');
          assert.equal(typeof trialId,'string');
          assert.equal(trialId,expectedTrialIds[rootBinding.callbackCount]);
          rootBinding.current=store;
          rootBinding.currentTrialId=trialId;
          rootBinding.trialIds.push(trialId);
          rootBinding.callbackCount++;
        }
      })}
    }),{rootBinding}),{rootBinding}),{rootBinding});
  const {result:exitObserved,audit}=koObserved;
  const selected=exitObserved.result;
  const physicalExitAudit=exitObserved.audit;
  const d=selected.diagnostic;
  const actualRows=d.actualAttemptRows;
  assert.equal(selected.manifest.version,TREATMENT_VERSION);
  assert.equal(selected.manifest.originalRegisteredTrialCount,8);
  assert.equal(actualRows.length,8);
  assert.equal(registered.trials.length,8);
  assert.equal(rootBinding.callbackCount,8);
  assert.deepEqual(rootBinding.trialIds,expectedTrialIds);
  assert.equal(physicalExitAudit.version,EXIT_VERSION);
  assert.equal(physicalExitAudit.registeredRootStores,8);
  assert.equal(physicalExitAudit.hiddenPrizeFacesRead,false);
  assert.equal(physicalExitAudit.inferredKoCount,null);
  assert.equal(physicalExitAudit.competitivelyQualifiedGames,0);
  assert.equal(originAudit.version,ORIGIN_VERSION);
  assert.equal(originAudit.authoritativeChecks>0,true);
  assert.equal(originAudit.foreignChecks,0);
  assert.equal(originAudit.observedHiddenPrizeCardFaces,false);
  assert.equal(originAudit.paperCompetitiveGamesQualified,0);
  const perTrialPrizeEvents=audit.records.map(record=>({
    ...record,registeredTrialId:rootBinding.trialIds[record.session-1]
  }));
  assert.ok(perTrialPrizeEvents.length>=6,
    'The continued treatment must retain the six historical prompt receipts');
  const knownOriginalPromptIds=[
    expectedTrialIds[0],expectedTrialIds[1],expectedTrialIds[2],
    expectedTrialIds[3],expectedTrialIds[4],expectedTrialIds[4]
  ];
  for(const id of knownOriginalPromptIds)
    assert.ok(perTrialPrizeEvents.some(r=>r.registeredTrialId===id),
      'Expected original prompt observed in continued treatment: '+id);
  const perTrialPhysicalExits=physicalExitAudit.records.map(event=>({
    ...event,registeredTrialId:rootBinding.trialIds[event.session-1]
  }));
  const promptToRootMatches=perTrialPrizeEvents.map(event=>
    perTrialPhysicalExits.filter(root=>
      root.session===event.session &&
      root.ownerSeat===event.seat &&
      root.turn===event.turn &&
      root.exactExitedCards===event.selectedPhysicalCards &&
      root.byDestination.hand===event.selectedPhysicalCards));
  assert.ok(promptToRootMatches.every(rows=>rows.length>=1),
    'Every prompt-mediated KO Prize transfer needs a matching physical root exit');
  const terminalId='1:212:B:champion-reference';
  const terminalOriginGroups=originAudit.tokenGroups.filter(group=>
    group.trialId===terminalId && group.ko.length>0);
  const terminalAutoOriginGroups=terminalOriginGroups.filter(group=>
    group.draws.some(draw=>draw.count===3 &&
      draw.takingSeat===1 && draw.destination==='hand' &&
      !draw.preventDefault));
  console.log('AGENT3_V24_CHECKSTATE_ORIGIN_TERMINAL',JSON.stringify({
    nativeCheckStateCalls:originAudit.authoritativeChecks,
    nativeKoEffects:originAudit.nativeKoEffects,
    koWithoutToken:originAudit.nativeKoEffectsWithoutToken,
    sourcePrizePrompts:originAudit.sourcePrizePrompts,
    drawPrizeEffects:originAudit.nativeDrawPrizesEffects,
    sameTokenKoPrompts:originAudit.sameTokenKoPrizePrompts,
    sameTokenKoDraws:originAudit.sameTokenKoDrawPrizes,
    deferredRegistered:originAudit.deferredContinuationsRegistered,
    deferredResumed:originAudit.deferredContinuationsResumed,
    promptCallbacksResumed:originAudit.promptCallbacksResumed,
    terminalKoGroups:terminalOriginGroups,
    terminalFinalThreeSourceGroups:terminalAutoOriginGroups
  }));
  assert.ok(terminalAutoOriginGroups.length>=1,
    'Native final-three DrawPrizesEffect must share unique checkState token with KO');
  assert.ok(terminalAutoOriginGroups.every(group=>group.prompts.length===0),
    'Terminal final three should have no native ChoosePrizePrompt');
  const terminalExits=perTrialPhysicalExits.filter(row=>
    row.registeredTrialId===terminalId &&
    row.ownerSeat===1 && (row.byDestination.hand??0)>0);
  assert.deepEqual(terminalExits.map(r=>r.exactExitedCards),[1,2,3],
    'The final three automatically taken Prize cards must be physical');
  const terminalPrompts=perTrialPrizeEvents.filter(row=>
    row.registeredTrialId===terminalId && row.seat===1);
  assert.deepEqual(terminalPrompts.map(r=>r.selectedPhysicalCards),[1,2]);
  const promptKey=row=>[row.session,row.seat??row.ownerSeat,
    row.turn,row.selectedPhysicalCards??row.exactExitedCards].join(':');
  const promptKeys=new Set(terminalPrompts.map(promptKey));
  const unpromptedTerminalExits=terminalExits.filter(row=>
    !promptKeys.has(promptKey(row)));
  assert.equal(unpromptedTerminalExits.length,1);
  assert.equal(unpromptedTerminalExits[0].exactExitedCards,3);

  assert.equal(audit.registeredStoreSessions,8);
  assert.equal(audit.ignoredUnboundAddPlayerActions,0);
  assert.equal(audit.rootStoreCallbackBindingRequired,true);
  assert.deepEqual(actualRows.map(row=>[
    row.status,row.acceptedNativeRootCount]),[
    ['root-cap-unqualified',128],['root-cap-unqualified',128],
    ['root-cap-unqualified',128],['root-cap-unqualified',128],
    ['native-terminal-unqualified',110],['root-cap-unqualified',128],
    ['root-cap-unqualified',128],['root-cap-unqualified',128]
  ]);
  const terminal=actualRows.find(row=>
    row.id==='1:212:B:champion-reference');
  assert.equal(terminal.nativeOutcome,'native-terminal');
  assert.equal(terminal.finished,true);
  assert.equal(terminal.terminalWinnerMatchesCandidate,true);
  assert.deepEqual(terminal.finalPrizes,[6,0]);
  assert.deepEqual(actualRows.map(x=>x.id).sort(),
    registered.trials.map(x=>x.id).sort());
  assert.equal(d.registeredAttemptReconciliation.exactUniqueMatch,true);
  assert.equal(selected.manifest.releaseQualified,false);
  assert.equal(audit.paperKoCertified,false);
  assert.equal(audit.uniqueCheckStateOriginCertified,false);
  assert.equal(audit.realStoreIdentityProofComplete,false);
  assert.equal(audit.competitivelyQualifiedGames,0);
  assert.equal(audit.chosenPrizeFacesReadByPolicy,false);
  assert.ok(audit.expiredUnjoinedKoEffects>=0);
  assert.ok(audit.expiredUnjoinedKoEffects<=audit.eligibleKoEffects);
  assert.equal(audit.nativeSourceSettledAnswers,
    audit.exactSourceJoinedHandTransfers+
    audit.exactSourceJoinedLostZoneTransfers+
    audit.sourceJoinedOtherDestinations);
  assert.equal(audit.records.length+audit.recordsOmitted,
    audit.nativeSourceSettledAnswers);

  // Counts are prompt-mediated only. Automatic native KO Prize taking may have
  // no ChoosePrizePrompt, so never infer total native Prizes from this audit.
  const receipt={
    schema:'agent3-v24-selected-v8-real-store-source-prompt-custody',
    researchCommit:process.env.GITHUB_SHA??null,
    githubRun:process.env.GITHUB_RUN_ID??null,
    vendor,
    registrationPath,
    registrationHash:hash(registration),
    observerVersion:VERSION,
    observerHash:hash(fs.readFileSync(path.join(ROOT,
      'simulation/twinleaf/agent3-ko-source-prompt-physical-v4.cjs'))),
    nativeTestHash:hash(fs.readFileSync(__filename)),
    executingTreatmentVersion:TREATMENT_VERSION,
    selectedV8EntrySha256:hash(fs.readFileSync(path.join(ROOT,
      'simulation/evaluation/agent36-issue25-common-v8.cjs'))),
    registrationIds:registered.trials.map(x=>x.id),
    actualOriginalDispositionRows:actualRows,
    actualRegisteredReconciliation:d.registeredAttemptReconciliation,
    nativeObserver:audit,
    uniqueGeneratorOriginWitness:originAudit,
    originVersion:ORIGIN_VERSION,
    originCodeHash:hash(fs.readFileSync(path.join(ROOT,
      'simulation/twinleaf/agent3-checkstate-generator-origin-token.cjs'))),
    terminalFinalThreeOriginGroups:terminalAutoOriginGroups,

    physicalExitObserverVersion:EXIT_VERSION,
    physicalExitObserverHash:hash(fs.readFileSync(path.join(ROOT,
      'simulation/twinleaf/agent3-authoritative-root-prize-exit-observer.cjs'))),
    physicalExitObserver:physicalExitAudit,
    exactTrialLinkedEveryPhysicalPrizeExit:perTrialPhysicalExits,
    promptKoPhysicalExitRootJoins:promptToRootMatches.map(rows=>rows.length),

    actualHeadlessRootCallbacks:rootBinding.callbackCount,
    trialIdsBoundAtRealStoreCreation:rootBinding.trialIds,
    exactTrialLinkedPhysicalPrizeEvents:perTrialPrizeEvents,
    callbackTrialJoinPassed:true,
    authoritativeRootStoreFromHeadlessCallback:true,
    originalSelectedV8GamePolicyUnchanged:true,
    retrospectivePromptResolverTreatment:true,
    actualNativeTerminalWitness:terminal,
    automaticLastThreePrizeCards:unpromptedTerminalExits,
    promptMediatedKOsOnly:true,
    acceptedStoreNotPaperProof:true,
    competitivelyQualifiedGames:0,
    provenFieldWinRate:null
  };
  const dir=process.env.AGENT3_V24_V8_PRIZE_DIR;
  const archive=dir?save(receipt,dir):null;
  console.log('AGENT3_V24_SELECTED_V8_KO_SOURCE_PHYSICAL',JSON.stringify({
    registeredOriginalAttempts:actualRows.length,
    dispositions:actualRows.map(r=>({id:r.id,status:r.status,
      roots:r.acceptedNativeRootCount,sourceSeat:r.sourceSeat,
      candidateSeat:r.candidateSeat})),
    koEffects:audit.eligibleKoEffects,
    orphanRootKoEffects:audit.expiredUnjoinedKoEffects,
    promptMediatedKoSources:audit.nativeSourcePrompts,
    exactJoinedOwnerHand:audit.exactSourceJoinedHandTransfers,
    exactJoinedLostZone:audit.exactSourceJoinedLostZoneTransfers,
    unknownJoinedDestinations:audit.sourceJoinedOtherDestinations,
    sourcePromptSettled:audit.nativeSourceSettledAnswers,
    nativeStoreSessions:audit.registeredStoreSessions,
    headlessRootCallbacks:rootBinding.callbackCount,
    prizeEventsByRegisteredTrial:perTrialPrizeEvents.map(r=>({
      id:r.registeredTrialId,seat:r.seat,turn:r.turn,
      cards:r.selectedPhysicalCards,destination:r.destination
    })),
    rejectedForeignStoreRegistrations:audit.ignoredUnboundAddPlayerActions,
    physicalPrizeExitRoots:physicalExitAudit.rootsWithPrizeCardExit,
    physicalPrizeCardsExited:physicalExitAudit.exactPhysicalPrizeCardsExited,
    physicalPrizeExitDestinations:physicalExitAudit.byDestination,
    allPhysicalExitRootsByTrial:perTrialPhysicalExits.map(r=>({
      id:r.registeredTrialId,seat:r.ownerSeat,turn:r.turn,action:r.actionType,
      cards:r.exactExitedCards,destinations:r.byDestination
    })),

    checkStateOriginCalls:originAudit.authoritativeChecks,
    sameTokenKoDrawPrizes:originAudit.sameTokenKoDrawPrizes,
    terminalFinalThreeOriginCount:terminalAutoOriginGroups.length,
    qualifiedGames:0,archive
  }));
});
