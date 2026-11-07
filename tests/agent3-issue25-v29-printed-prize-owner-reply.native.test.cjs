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

const {VERSION:ATTACK_JOIN_VERSION,joinNativePrizeExitsToSettledAttacks}=
  require('../simulation/evaluation/agent3-accepted-prize-attack-join.cjs');

const {VERSION:VICTIM_VERSION,withNativePublicKoVictims}=
  require('../simulation/twinleaf/agent3-public-ko-victim-print-observer.cjs');

const {VERSION:BASE_SCREEN_VERSION,screenNativeKoBasePrizes}=
  require('../simulation/evaluation/agent3-printed-base-prize-screen.cjs');
const {VERSION:SECOND_SCREEN_VERSION,
  auditNativeKoPrintedPrizeValues:crossCheckPublicNativeKoPrizes}=
  require('../simulation/evaluation/agent3-native-ko-printed-prize-audit.cjs');
const {VERSION:NOMINAL_ATTACK_SCREEN_VERSION,screenNativeAttackDamage}=
  require('../simulation/evaluation/agent3-v28-public-attack-damage-screen.cjs');
const {VERSION:PRE_ATTACK_BOARD_VERSION,joinNativePreAttackBoard}=
  require('../simulation/evaluation/agent3-native-pre-attack-public-board-join.cjs');
const {VERSION:COPYCAT_ELIGIBILITY_VERSION,auditMimikyuCopycatEonBlade}=
  require('../simulation/evaluation/agent3-mimikyu-copycat-eon-blade-eligibility.cjs');
const {VERSION:OWNER_REPLY_VERSION,projectOwnerRepliesAfterSourcePrize}=
  require('../simulation/evaluation/agent3-postprize-owner-reply-projection.cjs');
const {VERSION:RESPONSE_SEQUENCE_VERSION,
  createPostPrizeResponseActionSequenceObserver,
  joinPostPrizeResponseActionSequences}=
  require('../simulation/evaluation/agent3-postprize-response-action-sequence.cjs');
const {publicBoardSnapshot}=require(
  '../simulation/twinleaf/public-board-telemetry.cjs');

const ROOT=path.resolve(__dirname,'..');
const hash=b=>createHash('sha256').update(b).digest('hex');

/** Only original-registered native attempts; no reroll, prospective change, or deck change. */
function save(receipt,dir){
  fs.mkdirSync(dir,{recursive:true});
  const lock=path.join(dir,'.agent3-v29-v8-source.lock');
  const fd=fs.openSync(lock,'wx');
  const name='agent3-v29-selected-v8-ko-source-physical.json';
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
  const postPrizeResponseActionObserver=createPostPrizeResponseActionSequenceObserver({
    registeredTrials:registered.trials,rootBinding,publicBoardSnapshot
  });
  const {result:koObserved,audit:originAudit}=withCheckStateGeneratorOriginToken(
    ()=>withKoSourcePromptPhysical(
    ()=>withNativePublicKoVictims(
    ()=>withAuthoritativeRootPrizeExitObserver(
      ()=>runIssue25V8WithTelepathAndDefaultConfirmFalse({
      v8Deps:{runner:options=>runDevelopment({
        ...options,
        onRootActionDispatched:(store,action,ordinal,seat,turnBefore)=>{
          rootBinding.bindAuthoritativePrizeRootOrdinal(
            store,action,ordinal,seat,turnBefore);
          postPrizeResponseActionObserver.onRootActionDispatched(
            store,action,ordinal,seat,turnBefore);
        },
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
    }),{rootBinding,bindAcceptedRootOrdinals:true}),{rootBinding}),{rootBinding}),{rootBinding});
  const {result:victimObserved,audit}=koObserved;
  const {result:exitObserved,audit:publicVictimAudit}=victimObserved;
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
  assert.equal(physicalExitAudit.rootOrdinalBindingEnabled,true);
  assert.equal(physicalExitAudit.actualHeadlessRootCallbacks,1006);
  assert.equal(physicalExitAudit.inferredKoCount,null);
  assert.equal(physicalExitAudit.competitivelyQualifiedGames,0);
  assert.equal(publicVictimAudit.version,VICTIM_VERSION);
  assert.equal(publicVictimAudit.eligibleNativeKoEffects,8);
  assert.equal(publicVictimAudit.recordedKoVictims.length,8);
  assert.equal(publicVictimAudit.omittedVictims,0);
  assert.equal(publicVictimAudit.readHiddenPrizeCards,false);
  assert.equal(publicVictimAudit.paperPrizeAwardValidityCertified,false);
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
  // Join three INDEPENDENT read-only measurements for every observed award:
  // unique checkState generator ancestry, exact trial-bound prompt settlement,
  // and actual outer Store root physical Prize-zone exit. An aggregate count
  // cannot pass if two unrelated game roots swap their associations.
  // Verify each Prize movement against the real headless accepted-root ledger.
  // The earlier v25 field "exactPhysicalRootOrdinal" was only a filtered
  // physical-exit event array index, not a game-action ordinal.
  assert.equal(physicalExitAudit.prizeExitRecordsBoundToAcceptedRoots,8);
  const trialLedgerById=new Map(selected.rawDevelopment.rows.map(row=>[
    row.trial.id,row.rootActionLedger??row.nativePublicRootArchive?.rootActionLedger
  ]));
  const acceptedPhysicalRootJoins=[];
  for(const event of perTrialPhysicalExits){
    const roots=trialLedgerById.get(event.registeredTrialId);
    assert.ok(Array.isArray(roots),'Exact trial needs accepted public root tape');
    assert.ok(Number.isSafeInteger(event.acceptedRootActionOrdinal));
    const matching=roots.filter(row=>
      row.actionOrdinal===event.acceptedRootActionOrdinal);
    assert.equal(matching.length,1,'Physical exit needs unique actual headless root');
    const root=matching[0];
    assert.equal(root.action,event.actionType);
    assert.equal(root.playerSlot,event.acceptedRootActorSeat);
    assert.equal(root.turnBefore,event.acceptedRootTurnBefore);
    assert.equal(root.turnAfter,event.turn);
    acceptedPhysicalRootJoins.push({
      registeredTrialId:event.registeredTrialId,
      eventIndex:acceptedPhysicalRootJoins.length,
      acceptedRootActionOrdinal:event.acceptedRootActionOrdinal,
      headlessAction:root.action,
      actorSeat:root.playerSlot,
      turnBefore:root.turnBefore,turnAfter:root.turnAfter,
      exactExitedCards:event.exactExitedCards,
      takingSeat:event.ownerSeat
    });
  }
  assert.equal(acceptedPhysicalRootJoins.length,8);
  const attackPrizeRootJoins=joinNativePrizeExitsToSettledAttacks(
    selected.rawDevelopment.rows,perTrialPhysicalExits);
  assert.equal(attackPrizeRootJoins.length,8);
  assert.deepEqual(attackPrizeRootJoins.map(x=>x.exactPhysicalPrizeCards),
    [1,1,2,1,3,1,2,3]);
  assert.deepEqual(attackPrizeRootJoins.map(x=>x.actualPrizeExitRootOrdinal),
    [88,100,86,42,104,63,79,109]);
  assert.equal(attackPrizeRootJoins.every(x=>
    x.acceptedStoreAndAttackLineageVerified===true&&
    x.paperValidityCertified===false),true);
  const matchedVictimKeys=new Set();
  const fullyRootedPublicVictimJoins=attackPrizeRootJoins.map((attack,index)=>{
    const matches=publicVictimAudit.recordedKoVictims.map((victim,i)=>
      ({victim,i})).filter(({victim})=>
      victim.registeredTrialId===attack.registeredTrialId &&
      victim.koOwnerSeat===1-attack.attackSeat &&
      victim.nativeTurn===attack.sameTurn &&
      victim.postNativePrizeCount===attack.exactPhysicalPrizeCards &&
      victim.preventDefault===false);
    assert.equal(matches.length,1,
      'Each unique attack/Prize event must have one native printed KO victim');
    const {victim,i}=matches[0];
    assert.equal(matchedVictimKeys.has(i),false,
      'Cannot attribute the same KO victim twice');
    matchedVictimKeys.add(i);
    assert.ok(victim.publicVictim?.name&&victim.publicVictim?.fullName);
    assert.ok(Number.isSafeInteger(victim.publicVictim.printedHp));
    assert.ok(Array.isArray(victim.publicVictim.cardTags));
    assert.ok(Array.isArray(victim.attachedPublicEnergyCards));
    return {
      prizeEventIndex:index,registeredTrialId:attack.registeredTrialId,
      actualPrizeExitRootOrdinal:attack.actualPrizeExitRootOrdinal,
      attackName:attack.attackName,attackSeat:attack.attackSeat,
      victimOwnerSeat:victim.koOwnerSeat,victimNativeTurn:victim.nativeTurn,
      victimPrinting:victim.publicVictim,
      victimLocation:victim.location,
      victimDamageBeforeNativeKo:victim.damageCountersValue,
      victimNativeHpCache:victim.targetNativeHpCache,
      evolutionCardPrintings:victim.evolutionCards,
      publicEnergyCardsOnVictim:victim.attachedPublicEnergyCards,
      publicToolsOnVictim:victim.attachedPublicTools,
      nativePrizeCount:victim.postNativePrizeCount,
      paperPrintedKoAndPrizeValidated:false
    };
  });
  assert.equal(matchedVictimKeys.size,publicVictimAudit.recordedKoVictims.length);
  const independentlyPrintedBasePrizeScreens=screenNativeKoBasePrizes(
    fullyRootedPublicVictimJoins,path.join(ROOT,'resources'));
  assert.equal(independentlyPrintedBasePrizeScreens.length,8);
  assert.equal(independentlyPrintedBasePrizeScreens.every(row=>
    row.independentPrintedBasePrizeScreenPass===true &&
    row.competitiveGameQualified===false),true);
  // Independent exact-ID and KO-damage-threshold verification against the
  // supplied card pool. Neither screen qualifies game play or attack legality.
  const independentlyRecheckedPrintedKoPrizes=
    crossCheckPublicNativeKoPrizes(fullyRootedPublicVictimJoins);
  assert.equal(independentlyRecheckedPrintedKoPrizes.allMatched,true);
  assert.equal(independentlyRecheckedPrintedKoPrizes.rows.length,8);
  assert.deepEqual(independentlyRecheckedPrintedKoPrizes.rows.map(row=>row.cardId),
    independentlyPrintedBasePrizeScreens.map(row=>row.matchedEnglishCardDbId));
  assert.deepEqual(independentlyRecheckedPrintedKoPrizes.rows.map(row=>row.printedPrizeCount),
    independentlyPrintedBasePrizeScreens.map(row=>row.paperPrintedBasePrizes));
  assert.deepEqual(independentlyRecheckedPrintedKoPrizes.rows.map(row=>row.nativePrizeCount),
    attackPrizeRootJoins.map(row=>row.exactPhysicalPrizeCards));
  assert.equal(independentlyRecheckedPrintedKoPrizes.paperGameCertified,false);
  assert.equal(independentlyRecheckedPrintedKoPrizes.qualifiedCompetitiveGames,0);
  // Source-roster unique printed attack witnesses; native KO victim damage
  // remains cumulative, and the model deliberately cannot certify payment.
  const originalField=JSON.parse(fs.readFileSync(path.join(ROOT,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const printedNativeAttackNominals=screenNativeAttackDamage(
    fullyRootedPublicVictimJoins.map((victim,i)=>({
      ...victim,attackRole:attackPrizeRootJoins[i].attackRole
    })),originalField);
  assert.deepEqual(printedNativeAttackNominals.rows.map(row=>
    row.rosterAttackerPrintedId),
    ['sv6-77','sv6-77','sv2-169','swsh10-133','swsh10-133',
      'sv8-76','sv8-76','sv8-76']);
  assert.deepEqual(printedNativeAttackNominals.rows.map(row=>
    row.unmodifiedPrintedFinalAttackDamage),
    [140,140,20,130,130,200,200,200]);
  assert.deepEqual(printedNativeAttackNominals.rows.map(row=>
    row.nominalDamageDifference),
    [0,0,160,0,230,0,0,200]);
  assert.equal(printedNativeAttackNominals.paperGameCertified,false);
  assert.equal(printedNativeAttackNominals.qualifiedCompetitiveGames,0);
  // Reconcile actual Store pre-declaration public Active board against the
  // physically attributed KO. The end-of-KO damage is cumulative, so retain
  // the actual before-root damage and attacker Energy without inferring wins.
  const actualPreAttackBoardJoins=joinNativePreAttackBoard(
    selected.rawDevelopment.rows,attackPrizeRootJoins,
    fullyRootedPublicVictimJoins,printedNativeAttackNominals.rows,originalField);
  assert.equal(actualPreAttackBoardJoins.version,
    'agent3-native-pre-attack-public-board-join-v3');
  assert.equal(actualPreAttackBoardJoins.rows.length,8);
  assert.equal(actualPreAttackBoardJoins.nativeDamageDeltaPrintMatches,8);
  assert.equal(actualPreAttackBoardJoins.declarationRootBoardsCaptured,8);
  assert.equal(actualPreAttackBoardJoins.finalBoardsCaptured,8);
  assert.equal(actualPreAttackBoardJoins.physicalActiveIdentityComplete,8);
  assert.equal(Object.values(
    actualPreAttackBoardJoins.declarationRootClassificationCounts
  ).reduce((sum,count)=>sum+count,0),8);
  assert.equal(actualPreAttackBoardJoins.rows.every(row=>
    row.nativeDeltaEqualsPrintedNominal===true&&
    row.directPrintedEnergySufficiency?.status==='POSSIBLE'&&
    row.actualPrintedAttackCostMatchesSourceScreen===true&&
    row.physicalActiveAtActualNativeAttackObserved===true&&
    row.physicalActivePrintingAccountedForByOriginal60===true&&
    row.physicalActiveIdentityComplete===true&&
    row.declarationRootBoardCaptured===true&&
    row.finalBoardCaptured===true&&
    Number.isSafeInteger(row.declarationRootActionOrdinal)&&
    (Number.isSafeInteger(row.initiatingRootActionOrdinal)||
      row.initiatingRootActionOrdinal===null)&&
    Number.isSafeInteger(row.declarationRootTurnAfter)&&
    typeof row.declarationRootPromptPendingAfter==='boolean'&&
    Array.isArray(row.publicBoardImmediatelyAfterDeclarationRoot)&&
    Array.isArray(row.publicBoardAfterPromptClosure)&&
    typeof row.declarationRootVsPromptClosureClassification==='string'&&
    !row.declarationRootVsPromptClosureClassification.startsWith('UNKNOWN')&&
    !row.declarationRootVsPromptClosureClassification.startsWith('INCONSISTENT')&&
    (row.targetDamageThresholdReachedImmediatelyAfterDeclarationRoot===null||
      typeof row.targetDamageThresholdReachedImmediatelyAfterDeclarationRoot==='boolean')&&
    (row.targetKnockedOutDuringLaterPromptResolution===null||
      typeof row.targetKnockedOutDuringLaterPromptResolution==='boolean')&&
    (row.targetDamageThresholdReachedDuringLaterPromptResolution===null||
      typeof row.targetDamageThresholdReachedDuringLaterPromptResolution==='boolean')&&
    row.paperGameCertified===false&&
    row.actualAttachedEnergyPaymentCertified===false),true);
  assert.equal(actualPreAttackBoardJoins.qualifiedCompetitiveGames,0);
  console.log('AGENT3_V29_ACTUAL_PRE_ATTACK_BOARD_KO_JOIN',
    JSON.stringify(actualPreAttackBoardJoins.rows));
  console.log('AGENT3_V29_DECLARATION_ROOT_TIMING',
    JSON.stringify({
      version:actualPreAttackBoardJoins.version,
      classificationCounts:
        actualPreAttackBoardJoins.declarationRootClassificationCounts,
      rows:actualPreAttackBoardJoins.rows.map(row=>({
        registeredTrialId:row.registeredTrialId,
        attackRole:row.attackRole,attackSeat:row.attackSeat,
        attackName:row.attackName,
        declarationRootActionOrdinal:row.declarationRootActionOrdinal,
        initiatingRootActionOrdinal:row.initiatingRootActionOrdinal,
        declarationRootTurnAfter:row.declarationRootTurnAfter,
        declarationRootPromptPendingAfter:row.declarationRootPromptPendingAfter,
        physicalActivePrintingBefore:row.physicalActivePrintingBefore,
        physicalActivePrintedAttackNamesBefore:
          row.physicalActivePrintedAttackNamesBefore,
        attackNamePrintedOnPhysicalActiveBefore:
          row.attackNamePrintedOnPhysicalActiveBefore,
        directAttackPrintedOnPhysicalActiveBefore:
          row.directAttackPrintedOnPhysicalActiveBefore,
        targetDamageImmediatelyAfterDeclarationRoot:
          row.targetDamageImmediatelyAfterDeclarationRoot,
        targetDamageAfterPromptClosure:row.targetDamageAfterPromptClosure,
        targetDamageDeltaFromPreAttackToDeclarationRoot:
          row.targetDamageDeltaFromPreAttackToDeclarationRoot,
        targetDamageDeltaFromDeclarationRootToActualNativeKo:
          row.targetDamageDeltaFromDeclarationRootToActualNativeKo,
        targetKnockedOutDuringLaterPromptResolution:
          row.targetKnockedOutDuringLaterPromptResolution,
        targetDamageThresholdReachedDuringLaterPromptResolution:
          row.targetDamageThresholdReachedDuringLaterPromptResolution,
        classification:row.declarationRootVsPromptClosureClassification
      }))
    }));

  // Independently reconcile the physical Mimikyu's Copycat cost and the
  // opponent's immediately preceding non-GX Eon Blade, not the donor's cost.
  // This is a postgame evidence join and cannot alter the selected policy.
  const mimikyuCopycatEligibility=auditMimikyuCopycatEonBlade(
    selected.rawDevelopment.rows,originalField);
  assert.ok(mimikyuCopycatEligibility.scannedAttackCount>0,
    'No settled attacks were scanned for Mimikyu Copycat events');
  assert.equal(mimikyuCopycatEligibility.rows.every(row=>
    row.physicalActive==='Mimikyu GRI'&&
    row.currentAttackDelegatedCopy===true&&
    row.currentCopycatChoiceRootValid===true&&
    row.priorOpponentAttackObserved===true&&
    row.priorOpponentAttackWasImmediatelyPreviousTurn===true&&
    row.priorOpponentAttackSettled===true&&
    row.priorOpponentAttackRootValid===true&&
    row.priorOpponentAttackNonGx===true&&
    ['POSSIBLE','UNVERIFIED'].includes(row.copycatCostFunding?.status)&&
    row.actualAttachedEnergyPaymentCertified===false&&
    row.paperGameCertified===false),true,
    JSON.stringify(mimikyuCopycatEligibility.rows));
  assert.equal(mimikyuCopycatEligibility.paperGameCertified,false);
  assert.equal(mimikyuCopycatEligibility.qualifiedCompetitiveGames,0);
  console.log('AGENT3_V31_MIMIKYU_COPYCAT_EON_BLADE_ELIGIBILITY',
    JSON.stringify(mimikyuCopycatEligibility));
  const exactPostPrizeOwnerReplies=projectOwnerRepliesAfterSourcePrize(
    selected.rawDevelopment.rows,attackPrizeRootJoins);
  const postPrizeResponseActionObservation=postPrizeResponseActionObserver.result();
  assert.equal(postPrizeResponseActionObservation.version,RESPONSE_SEQUENCE_VERSION);
  assert.equal(postPrizeResponseActionObservation.hiddenHandReadBeforeCandidateResponse,false);
  assert.equal(postPrizeResponseActionObservation.policyInputModified,false);
  assert.equal(postPrizeResponseActionObservation.paperLegalityCertified,false);
  const postPrizeResponseActionSequences=joinPostPrizeResponseActionSequences(
    selected.rawDevelopment.rows,exactPostPrizeOwnerReplies,
    postPrizeResponseActionObservation);
  assert.equal(postPrizeResponseActionSequences.length,exactPostPrizeOwnerReplies.length);
  const fogCrystalResponse=postPrizeResponseActionSequences.find(row=>
    row.registeredTrialId==='11:211:A:champion-reference'&&
    row.firstCandidateResponseRootOrdinal===90);
  console.log('AGENT3_V29_POST_PRIZE_RESPONSE_ACTION_OBSERVER',JSON.stringify({
    version:postPrizeResponseActionObservation.version,
    sequences:postPrizeResponseActionObservation.sequences.map(sequence=>({
      registeredTrialId:sequence.registeredTrialId,
      sourcePrizeRootOrdinals:sequence.sourcePrizeRootOrdinals,
      sourceTurn:sequence.sourceTurn,candidateTurn:sequence.candidateTurn,
      firstResponseRootOrdinal:sequence.firstResponseRootOrdinal,
      actionOrdinals:sequence.actions.map(action=>action.rootOrdinal),
      actionTypes:sequence.actions.map(action=>action.actionType),
      completedByPass:sequence.completedByPass,turnEndObserved:sequence.turnEndObserved
    })),
    pendingPrizeExits:postPrizeResponseActionObservation.pendingPrizeExits,
    diagnostics:postPrizeResponseActionObservation.diagnostics
  }));
  assert.ok(fogCrystalResponse,'Fog Crystal first response must join to a post-dispatch sequence');
  const fogCrystalSequence=fogCrystalResponse.postPrizeResponseActionSequence;
  assert.ok(fogCrystalSequence,'Fog Crystal response sequence must be present');
  assert.equal(fogCrystalSequence.candidateTurn,fogCrystalResponse.candidateReplyNativeTurn);
  assert.ok(fogCrystalSequence.sourcePrizeRootOrdinals.includes(
    fogCrystalResponse.causalSourcePrizeRootOrdinal));
  assert.equal(fogCrystalSequence.firstProjectedResponseAction?.rootOrdinal,90);
  assert.equal(fogCrystalSequence.firstProjectedResponseAction?.actionType,'PlayCardAction');
  assert.equal(fogCrystalSequence.firstProjectedResponseAction?.playedCard,'Fog Crystal');
  assert.equal(fogCrystalSequence.firstProjectedResponseAction?.playedCardInDiscard,true);
  assert.ok(fogCrystalSequence.firstProjectedResponseAction?.handCardsRemoved?.some(name=>
    name.startsWith('Fog Crystal')));
  assert.equal(exactPostPrizeOwnerReplies.length,5);
  assert.equal(exactPostPrizeOwnerReplies.every(row=>
    row.sameEpochCandidateReplyVerified===true),true);
  console.log('AGENT3_V29_SOURCE_PRIZE_REPLY_FRONTIER',
    JSON.stringify(exactPostPrizeOwnerReplies.map(row=>({
      id:row.registeredTrialId,attack:row.causalOriginalAttackOrdinal,
      prize:row.causalSourcePrizeRootOrdinal,
      firstResponse:row.firstCandidateResponseRootOrdinal,
      finalPass:row.nativeObservedFinalPassRootOrdinal,
      response:row.completeCandidateTurnActions,
      ownerHandCaptured:row.ownerHandCapturedAfterPolicyChoice
    }))));
  assert.ok(exactPostPrizeOwnerReplies.filter(row=>
    Number.isSafeInteger(row.nativeObservedFinalPassRootOrdinal)).length>=4,
  'Missing full final owner Pass needs explicit censoring');
  assert.ok(exactPostPrizeOwnerReplies.filter(row=>
    row.ownerHandCapturedAfterPolicyChoice===true).length>=4,
  'At least four original post-Prize owner reply hands must be captured');
  assert.equal(exactPostPrizeOwnerReplies.every(row=>
    row.alternateActionPaperLegalityCertified===false),true);
  console.log('AGENT3_V29_INDEPENDENT_PRINTED_BASE_PRIZE_SCREEN',
    JSON.stringify(independentlyPrintedBasePrizeScreens));
  console.log('AGENT3_V29_POST_PRIZE_OWNER_REPLY_HANDS',
    JSON.stringify(exactPostPrizeOwnerReplies));
  console.log('AGENT3_V29_POST_PRIZE_RESPONSE_ACTION_SEQUENCES',
    JSON.stringify({observation:postPrizeResponseActionObservation,
      joined:postPrizeResponseActionSequences}));
  console.log('AGENT3_V29_PUBLIC_KO_VICTIMS',
    JSON.stringify(fullyRootedPublicVictimJoins));
  console.log('AGENT3_V29_SETTLED_ATTACK_TO_PHYSICAL_PRIZE',
    JSON.stringify(attackPrizeRootJoins));
  const nativeOriginGroups=originAudit.tokenGroups.filter(g=>g.ko.length>0);
  assert.equal(nativeOriginGroups.length,8);
  assert.equal(nativeOriginGroups.length,perTrialPhysicalExits.length);
  assert.equal(nativeOriginGroups.length,physicalExitAudit.rootsWithPrizeCardExit);
  assert.equal(nativeOriginGroups.length,originAudit.nativeDrawPrizesEffects);
  const usedExitOrdinals=new Set();
  const usedPromptOrdinals=new Set();
  const exhaustiveSourceJoins=[];
  for(const group of nativeOriginGroups){
    assert.equal(group.ko.length,1,'Each observed source group has one KO');
    assert.equal(group.draws.length,1,'Each observed source group has one Prize draw');
    const ko=group.ko[0],draw=group.draws[0];
    assert.equal(ko.preventDefault,false);
    assert.equal(draw.preventDefault,false);
    assert.equal(draw.destination,'hand');
    assert.equal(ko.count,draw.count);
    assert.notEqual(ko.ownerSeat,draw.takingSeat);
    const matchingExits=perTrialPhysicalExits.map((row,index)=>({row,index}))
      .filter(({row})=>
        row.registeredTrialId===group.trialId &&
        row.ownerSeat===draw.takingSeat &&
        row.turn===group.turn &&
        row.exactExitedCards===draw.count &&
        row.byDestination.hand===draw.count);
    assert.equal(matchingExits.length,1,
      'Each checkState-origin KO needs exactly one physical Prize exit');
    const exitOrdinal=matchingExits[0].index;
    assert.equal(usedExitOrdinals.has(exitOrdinal),false);
    usedExitOrdinals.add(exitOrdinal);
    let promptOrdinal=null;
    if(group.prompts.length){
      assert.equal(group.prompts.length,1);
      assert.equal(group.prompts[0].seat,draw.takingSeat);
      assert.equal(group.prompts[0].count,draw.count);
      const matchingPrompts=perTrialPrizeEvents
        .map((row,index)=>({row,index}))
        .filter(({row})=>row.registeredTrialId===group.trialId &&
          row.seat===draw.takingSeat &&
          row.turn===group.turn &&
          row.selectedPhysicalCards===draw.count &&
          row.destination==='owner-hand');
      assert.equal(matchingPrompts.length,1,
        'Each originated native Prize prompt needs one exact settled physical answer');
      promptOrdinal=matchingPrompts[0].index;
      assert.equal(usedPromptOrdinals.has(promptOrdinal),false);
      usedPromptOrdinals.add(promptOrdinal);
    }
    exhaustiveSourceJoins.push({
      token:group.token,registeredTrialId:group.trialId,
      turn:group.turn,koOwnerSeat:ko.ownerSeat,
      takingSeat:draw.takingSeat,prizeCardObjects:draw.count,
      physicalExitEventIndex:exitOrdinal,
      trueAcceptedRootActionOrdinal:matchingExits[0].row.acceptedRootActionOrdinal,
      exactSettledPromptOrdinal:promptOrdinal
    });
  }
  assert.equal(usedExitOrdinals.size,physicalExitAudit.rootsWithPrizeCardExit);
  assert.equal(usedPromptOrdinals.size,perTrialPrizeEvents.length);
  assert.deepEqual(exhaustiveSourceJoins.map(r=>r.prizeCardObjects),
    [1,1,2,1,3,1,2,3]);
  assert.equal(exhaustiveSourceJoins.reduce((n,r)=>n+r.prizeCardObjects,0),
    physicalExitAudit.exactPhysicalPrizeCardsExited);
  assert.equal(exhaustiveSourceJoins.filter(r=>
    r.exactSettledPromptOrdinal===null).length,1);
  console.log('AGENT3_V29_EXHAUSTIVE_THREE_VIEW_PRIZE_JOINS',
    JSON.stringify(exhaustiveSourceJoins));
  const terminalId='1:212:B:champion-reference';
  const terminalOriginGroups=originAudit.tokenGroups.filter(group=>
    group.trialId===terminalId && group.ko.length>0);
  const terminalAutoOriginGroups=terminalOriginGroups.filter(group=>
    group.draws.some(draw=>draw.count===3 &&
      draw.takingSeat===1 && draw.destination==='hand' &&
      !draw.preventDefault));
  console.log('AGENT3_V29_CHECKSTATE_ORIGIN_TERMINAL',JSON.stringify({
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
    schema:'agent3-v29-selected-v8-real-store-source-prompt-custody',
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
    exhaustiveIndependentThreeViewPrizeJoins:exhaustiveSourceJoins,
    authoritativeAcceptedRootOrdinalJoins:acceptedPhysicalRootJoins,
    settledAttackPrizeJoinVersion:ATTACK_JOIN_VERSION,
    settledAttackPrizeJoinHash:hash(fs.readFileSync(path.join(ROOT,
      'simulation/evaluation/agent3-accepted-prize-attack-join.cjs'))),
    physicallyRootedSettledAttackPrizeJoins:attackPrizeRootJoins,
    publicKoVictimPrintVersion:VICTIM_VERSION,
    publicKoVictimPrintHash:hash(fs.readFileSync(path.join(ROOT,
      'simulation/twinleaf/agent3-public-ko-victim-print-observer.cjs'))),
    publicKoVictimObserver:publicVictimAudit,
    fullyRootedPublicKoVictimJoins:fullyRootedPublicVictimJoins,
    separatePrintedKoPrizeCrosscheckVersion:SECOND_SCREEN_VERSION,
    separatePrintedKoPrizeCrosscheckHash:hash(fs.readFileSync(path.join(ROOT,
      'simulation/evaluation/agent3-native-ko-printed-prize-audit.cjs'))),
    independentlyRecheckedPrintedKoPrizes,
    originalFieldSourceHash:hash(fs.readFileSync(path.join(ROOT,
      'results/aichi-2026/full-decklists.json'))),
    nominalPrintedAttackerScreenVersion:NOMINAL_ATTACK_SCREEN_VERSION,
    nominalPrintedAttackerScreenHash:hash(fs.readFileSync(path.join(ROOT,
      'simulation/evaluation/agent3-v28-public-attack-damage-screen.cjs'))),
    printedNativeAttackNominals,
    actualPreAttackBoardJoinVersion:PRE_ATTACK_BOARD_VERSION,
    actualPreAttackBoardJoinHash:hash(fs.readFileSync(path.join(ROOT,
      'simulation/evaluation/agent3-native-pre-attack-public-board-join.cjs'))),
    actualPreAttackBoardJoins,
    mimikyuCopycatEligibilityVersion:COPYCAT_ELIGIBILITY_VERSION,
    mimikyuCopycatEligibilityHash:hash(fs.readFileSync(path.join(ROOT,
      'simulation/evaluation/agent3-mimikyu-copycat-eon-blade-eligibility.cjs'))),
    mimikyuCopycatEligibility,
    printedBasePrizeScreenVersion:BASE_SCREEN_VERSION,
    printedBasePrizeScreenHash:hash(fs.readFileSync(path.join(ROOT,
      'simulation/evaluation/agent3-printed-base-prize-screen.cjs'))),
    independentlyPrintedBasePrizeScreens,
    postPrizeOwnerReplyProjectionVersion:OWNER_REPLY_VERSION,
    postPrizeOwnerReplyProjectionHash:hash(fs.readFileSync(path.join(ROOT,
      'simulation/evaluation/agent3-postprize-owner-reply-projection.cjs'))),
    exactPostPrizeOwnerReplies,
    postPrizeResponseActionSequenceVersion:RESPONSE_SEQUENCE_VERSION,
    postPrizeResponseActionSequenceHash:hash(fs.readFileSync(path.join(ROOT,
      'simulation/evaluation/agent3-postprize-response-action-sequence.cjs'))),
    postPrizeResponseActionObservation,
    postPrizeResponseActionSequences,
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
  const dir=process.env.AGENT3_V29_V8_PRIZE_DIR;
  const archive=dir?save(receipt,dir):null;
  console.log('AGENT3_V29_SELECTED_V8_KO_SOURCE_PHYSICAL',JSON.stringify({
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
    independentlyThreeViewJoinedPrizeEvents:exhaustiveSourceJoins.length,
    physicallyBoundAcceptedRootOrdinals:acceptedPhysicalRootJoins.length,
    exactSettledAttackPrizeJoins:attackPrizeRootJoins.length,
    completeNativePublicVictimJoins:fullyRootedPublicVictimJoins.length,
    paperBasePayoutScreensPassed:independentlyPrintedBasePrizeScreens.filter(
      row=>row.independentPrintedBasePrizeScreenPass).length,
    settledSourcePrizeReplyHandsCaptured:exactPostPrizeOwnerReplies.filter(
      row=>row.ownerHandCapturedAfterPolicyChoice===true).length,
    postPrizeResponseSequencesCaptured:postPrizeResponseActionObservation.sequences.length,
    fogCrystalPostActionCaptured:!!fogCrystalSequence.firstProjectedResponseAction,
    sameTokenKoDrawPrizes:originAudit.sameTokenKoDrawPrizes,
    terminalFinalThreeOriginCount:terminalAutoOriginGroups.length,
    qualifiedGames:0,archive
  }));
});
