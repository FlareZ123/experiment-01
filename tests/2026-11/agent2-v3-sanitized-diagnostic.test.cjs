'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  sanitizeActorObservation,sanitizePromptContext,
  sanitizeDecisionRecord,sanitizeFixtureArtifact,formatSanitizedTraceText
}=require('../../simulation/evaluation/2026-11/agent2-v3-sanitized-diagnostic.cjs');

test('actor observation projection preserves public context but removes private hand and Prize identities',()=>{
  const view=sanitizeActorObservation({
    actorSeat:0,globalTurn:4,phase:2,decisionKind:'owner-root',
    pendingPromptType:null,pendingOwnerDeckSearch:false,
    ownHand:['PRIVATE_HAND_SENTINEL','PRIVATE_HAND_2'],
    ownPublic:{
      handCount:2,deckCount:40,prizeCount:6,
      active:{printing:'Public Active',hp:'320',damage:20,
        energies:['Psychic Energy SVE'],attacks:[{name:'Attack',cost:['Psychic'],text:'Public attack'}]},
      bench:[null],stadium:['Public Stadium'],discard:['Public Discard'],
      lostZone:[],resolvingSupporter:[],publicHand:null,
      prizeSlots:[{index:0}],
      publicTurnRestrictions:{gxUsed:false,vstarUsed:false}
    },
    opponentPublic:{
      handCount:5,deckCount:30,prizeCount:6,
      active:{printing:'Public Opponent Active'},bench:[],
      stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
      publicHand:null,prizeSlots:[{index:0}],
      publicTurnRestrictions:{gxUsed:false}
    },
    ownTurnResources:{energyPlayedTurn:3,supporterPlayedTurn:2,extraTurnActive:false},
    ownerK1:{epoch:7,exactMembershipKnown:true,
      knownPrintings:[{printing:'PRIVATE_PRIZE_SENTINEL',copies:1}]}
  });
  assert.equal(view.ownHandCount,2);
  assert.equal(view.ownPublic.active.printing,'Public Active');
  assert.equal(view.opponentPublic.active.printing,'Public Opponent Active');
  assert.equal(view.ownerK1.knownPrintingsCount,1);
  assert.equal(Object.prototype.hasOwnProperty.call(view,'ownHand'),false);
  assert.equal(Object.prototype.hasOwnProperty.call(view.ownerK1,'knownPrintings'),false);
  assert.doesNotMatch(JSON.stringify(view),/PRIVATE_HAND_SENTINEL|PRIVATE_PRIZE_SENTINEL/);
});

test('actor observation projection hides face-down setup Pokemon identities for both players',()=>{
  for(const phase of [0,1,undefined]){
    const view=sanitizeActorObservation({
      actorSeat:0,globalTurn:1,phase,decisionKind:'owner-root',
      pendingPromptType:null,pendingOwnerDeckSearch:false,ownHand:[],
      ownPublic:{
        handCount:0,deckCount:40,prizeCount:6,
        active:{printing:'PRIVATE_SETUP_OWN_ACTIVE_'+phase},
        bench:[{printing:'PRIVATE_SETUP_OWN_BENCH_'+phase},null],
        stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
        publicHand:null,prizeSlots:[{index:0}],publicTurnRestrictions:{}
      },
      opponentPublic:{
        handCount:0,deckCount:40,prizeCount:6,
        active:{concealed:true},bench:[{concealed:true},null],
        stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
        publicHand:null,prizeSlots:[{index:0}],publicTurnRestrictions:{}
      },
      ownTurnResources:{},ownerK1:null
    });
    for(const player of [view.ownPublic,view.opponentPublic]){
      assert.equal(player.active,null);
      assert.equal(player.activeOccupied,true);
      assert.deepEqual(player.bench,[null,null]);
      assert.deepEqual(player.benchOccupied,[true,false]);
    }
    assert.doesNotMatch(JSON.stringify(view),/PRIVATE_SETUP_/);
  }
});

test('prompt projection retains option counts and bounds without exposing offered card identities',()=>{
  const view=sanitizePromptContext({
    promptId:17,promptType:'ChooseCardsPrompt',playerId:101,
    perspectivePlayerId:101,actingSeat:0,resolver:'native-prompt-resolver',
    availableOptions:{
      cards:['PRIVATE_PROMPT_CARD_A','PRIVATE_PROMPT_CARD_B'],
      options:['PRIVATE_PROMPT_OPTION'],min:1,max:1,allowCancel:false
    },
    promptSnapshot:{cards:['PRIVATE_PROMPT_CARD_A']}
  });
  assert.equal(view.optionCounts.cards,2);
  assert.equal(view.optionCounts.options,1);
  assert.equal(view.min,1);
  assert.equal(view.max,1);
  assert.equal(view.allowCancel,false);
  assert.equal(Object.prototype.hasOwnProperty.call(view,'promptSnapshot'),false);
  assert.doesNotMatch(JSON.stringify(view),/PRIVATE_PROMPT_CARD|PRIVATE_PROMPT_OPTION/);
});

test('decision projection only emits a selected card after successful native dispatch',()=>{
  const base={
    actionOrdinal:9,actingSeat:0,turnBefore:2,phaseBefore:2,
    pendingPromptType:null,isRootDecision:true,policyInputKind:'actor-observation',
    actionName:'PlayCardAction',actionType:1,dispatchStatus:'succeeded',
    actorObservationBefore:{actorSeat:0,ownHand:['PRIVATE_HAND_SENTINEL'],
      ownPublic:{handCount:1,active:null,bench:[],stadium:[],discard:[],lostZone:[],
        resolvingSupporter:[],prizeSlots:[],publicTurnRestrictions:{}},
      opponentPublic:{handCount:6,active:null,bench:[],stadium:[],discard:[],lostZone:[],
        resolvingSupporter:[],prizeSlots:[],publicTurnRestrictions:{}},
      ownTurnResources:{}},
    selectedCardIdentity:{fullName:'PubliclyPlayedCard',handIndex:0},
    promptResolverContext:{availableOptions:{cards:['PRIVATE_PROMPT_CARD']}}
  };
  const succeeded=sanitizeDecisionRecord(base);
  assert.equal(succeeded.selectedCardPublicPrinting,'PubliclyPlayedCard');
  assert.equal(succeeded.actorObservation.ownHandCount,1);
  assert.doesNotMatch(JSON.stringify(succeeded),/PRIVATE_HAND_SENTINEL|PRIVATE_PROMPT_CARD/);
  const failed=sanitizeDecisionRecord({...base,dispatchStatus:'failed',
    selectedCardIdentity:{fullName:'PRIVATE_NOT_PLAYED'}});
  assert.equal(failed.selectedCardPublicPrinting,null);
  assert.doesNotMatch(JSON.stringify(failed),/PRIVATE_NOT_PLAYED/);
});

test('fixture artifact is failure-inclusive, replay-identified, and non-admitting without private trace fields',()=>{
  const artifact={
    fixtureOnly:true,competitiveGameQualified:false,admissionEligible:false,
    benchmark:'Aichi Open League 2026 Top 32',
    benchmarkFormat:'Japanese Extra',engineFormat:'Expanded',
    candidateFormat:'Expanded',gameRuleset:'Expanded',
    opponentSourceEventFormat:'Japanese Extra',formatReviewStatus:'unverified-fixture-only',
    candidate:{label:'Hood Shadow Rider v1',sourcePath:'candidate.json',
      sourceGitBlobSha:'a'.repeat(40),printed60Sha256:'b'.repeat(64)},
    opponent:{rank:1,sourceStatus:'authenticated',formatStatus:'unverified',
      player:'Rank 1',archetype:'Shadow Rider',sourcePath:'field.json',
      sourceGitBlobSha:'c'.repeat(40),printed60Sha256:'d'.repeat(64)},
    engine:{twinleafCommitSha:'e'.repeat(40),researchRevisionSha:'f'.repeat(40),
      nodeVersion:'v22.16.0',format:'EXPANDED',gameRuleset:'Expanded',
      cardPoolInitializationReceipt:{enginePin:'e'.repeat(40),cardCount:1000}},
    policy:{candidateProfile:'candidate',opponentProfile:'opponent',
      candidatePolicyOptions:{quickBallRoot:true},opponentPolicyOptions:{},
      policyCompetenceIndependentlyReviewed:false,identityScope:'fixture',
      challengeSuiteSha256:'1'.repeat(64),challengeSuiteScope:'mechanical-only'},
    preDealFixtureEnvelope:{policyPlanSha256:'2'.repeat(64)},
    candidatePolicyIdentity:{policyProducerId:'candidate',deckSha256:'b'.repeat(64),
      policySha256:'3'.repeat(64),entryManifestSha256:'4'.repeat(64),
      challengeSuiteSha256:'1'.repeat(64)},
    opponentPolicyIdentity:{policyProducerId:'opponent',deckSha256:'d'.repeat(64),
      policySha256:'5'.repeat(64),entryManifestSha256:'6'.repeat(64),
      challengeSuiteSha256:'1'.repeat(64)},
    runtimePinEvidence:{runtimePinUnionSha256:'7'.repeat(64),
      loadedProcessClosureSha256:'8'.repeat(64)},
    runtimePinAudit:{guardRestored:true},
    runtimePatchReceipts:[{patchId:'patch',modulePath:'module.cjs',
      moduleSha256:'9'.repeat(64),target:'target'}],
    actorOnlyExecutionBoundary:{valid:false,hiddenInformationSafe:false,
      privateField:'PRIVATE_BOUNDARY_SENTINEL'},
    roleComposerAudit:{quickBall:{
      quickBallRootsAccepted:1,paymentPhysicalAcceptances:1,
      targetPhysicalRetrievals:1,targetPhysicalBenchPlacements:1,
      completedPhysicalChains:1,completedSetupChains:0,
      pendingBenchPlacementsAtEnd:0,rejectedNativeReplies:0,
      privateField:'PRIVATE_AUDIT_SENTINEL'
    }},
    trial:{trialId:'fixture-1',candidateSeat:0,originalSourceSeat:1,
      actualFirstPlayerSeat:1,seed:'fixed-seed',seed32:123,
      vendorCommitSha:'e'.repeat(40),researchRevisionSha:'f'.repeat(40),
      candidatePrinted60Sha256:'b'.repeat(64),originalPrinted60Sha256:'d'.repeat(64),
      decisionTraceSha256:'a'.repeat(64)},
    summary:{winner:'candidate',winnerSeat:0,endReason:'engine-game-end',
      actionCount:2,attemptedActionCount:2,turns:3,actionCountsBySeat:[1,1],
      privateField:'PRIVATE_SUMMARY_SENTINEL'},
    nativeGame:{
      finished:true,endReason:'engine-game-end',winner:'candidate',winnerSeat:0,
      actualFirstPlayerSeat:1,actions:2,attemptedActions:2,turns:3,
      actionCountsBySeat:[1,1],
      decisionTrace:[{
        actionOrdinal:1,actingSeat:0,turnBefore:2,phaseBefore:2,
        isRootDecision:true,policyInputKind:'actor-observation',
        actionName:'PlayCardAction',actionType:1,dispatchStatus:'succeeded',
        actorObservationBefore:{
          actorSeat:0,globalTurn:2,phase:2,decisionKind:'owner-root',
          ownHand:['PRIVATE_HAND_SENTINEL'],
          ownPublic:{handCount:1,deckCount:40,prizeCount:6,active:null,bench:[],
            stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
            publicHand:null,prizeSlots:[{index:0}],
            publicTurnRestrictions:{}},
          opponentPublic:{handCount:6,deckCount:35,prizeCount:6,active:null,bench:[],
            stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
            publicHand:null,prizeSlots:[{index:0}],publicTurnRestrictions:{}},
          ownTurnResources:{energyPlayedTurn:1},
          ownerK1:{epoch:1,exactMembershipKnown:true,
            knownPrintings:[{printing:'PRIVATE_PRIZE_SENTINEL',copies:1}]}
        },
        selectedCardIdentity:{fullName:'PubliclyPlayedCard',handIndex:0},
        promptResolverContext:{
          promptType:'ChooseCardsPrompt',
          availableOptions:{cards:['PRIVATE_PROMPT_CARD']}
        }
      },{
        actionOrdinal:0,actingSeat:0,turnBefore:1,phaseBefore:0,
        isRootDecision:false,policyInputKind:'setup',
        actionName:'AddPlayerAction',actionType:0,dispatchStatus:'succeeded',
        actorObservationBefore:{
          actorSeat:0,globalTurn:1,phase:0,decisionKind:'owner-root',
          ownHand:[],
          ownPublic:{handCount:0,deckCount:40,prizeCount:6,
            active:{printing:'PRIVATE_SETUP_OWN_ACTIVE_ARTIFACT'},
            bench:[{printing:'PRIVATE_SETUP_OWN_BENCH_ARTIFACT'},null],
            stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
            publicHand:null,prizeSlots:[{index:0}],publicTurnRestrictions:{}},
          opponentPublic:{handCount:0,deckCount:40,prizeCount:6,
            active:{concealed:true},bench:[{concealed:true},null],
            stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
            publicHand:null,prizeSlots:[{index:0}],publicTurnRestrictions:{}},
          ownTurnResources:{},ownerK1:null
        },
        publicStateBefore:{phase:0,turn:1,activePlayer:0,pendingPrompts:[],
          players:[
            {seat:0,handCount:0,deckCount:40,prizeCount:6,discardCount:0,
              active:'PRIVATE_SETUP_STATE_ACTIVE_0',
              bench:['PRIVATE_SETUP_STATE_BENCH_0',null]},
            {seat:1,handCount:0,deckCount:40,prizeCount:6,discardCount:0,
              active:'PRIVATE_SETUP_STATE_ACTIVE_1',
              bench:['PRIVATE_SETUP_STATE_BENCH_1',null]}
          ]},
        publicStateAfter:{phase:1,turn:1,activePlayer:0,pendingPrompts:[],
          players:[
            {seat:0,handCount:0,deckCount:40,prizeCount:6,discardCount:0,
              active:'PRIVATE_SETUP_AFTER_ACTIVE_0',
              bench:['PRIVATE_SETUP_AFTER_BENCH_0',null]},
            {seat:1,handCount:0,deckCount:40,prizeCount:6,discardCount:0,
              active:'PRIVATE_SETUP_AFTER_ACTIVE_1',
              bench:['PRIVATE_SETUP_AFTER_BENCH_1',null]}
          ]}
      },{
        actionOrdinal:1,actingSeat:0,turnBefore:1,phaseBefore:null,
        isRootDecision:false,policyInputKind:'unknown-phase',
        actionName:'UnknownPhaseSnapshot',actionType:0,dispatchStatus:'succeeded',
        publicStateBefore:{turn:1,activePlayer:0,pendingPrompts:[],
          players:[{seat:0,handCount:0,deckCount:40,prizeCount:6,discardCount:0,
            active:'PRIVATE_UNKNOWN_PHASE_ACTIVE',
            bench:['PRIVATE_UNKNOWN_PHASE_BENCH',null]}]}
      }],
      finalPublicState:{phase:3,turn:3,activePlayer:0,pendingPrompts:[],
        players:[{seat:0,handCount:2,deckCount:35,prizeCount:5,discardCount:1,
          active:'Public Active',bench:[]}]},
      finalFullState:{privateField:'FULL_STATE_SENTINEL'}
    },
    fixtureGamePartial:{finalFullState:{privateField:'PARTIAL_FULL_STATE_SENTINEL'}},
    fixtureFailure:{name:'Error',code:'TEST',stage:'fixture',
      messageSha256:'f'.repeat(64),messageLength:10}
  };
  const sanitized=sanitizeFixtureArtifact(artifact);
  const json=JSON.stringify(sanitized);
  for(const secret of [
    'PRIVATE_HAND_SENTINEL','PRIVATE_PRIZE_SENTINEL','PRIVATE_PROMPT_CARD',
    'PRIVATE_BOUNDARY_SENTINEL','PRIVATE_AUDIT_SENTINEL',
    'PRIVATE_SUMMARY_SENTINEL','FULL_STATE_SENTINEL',
    'PARTIAL_FULL_STATE_SENTINEL','PRIVATE_SETUP_OWN_ACTIVE_0',
    'PRIVATE_SETUP_OWN_BENCH_0','PRIVATE_SETUP_OWN_ACTIVE_ARTIFACT',
    'PRIVATE_SETUP_OWN_BENCH_ARTIFACT','PRIVATE_SETUP_STATE_ACTIVE_0',
    'PRIVATE_SETUP_STATE_ACTIVE_1','PRIVATE_SETUP_STATE_BENCH_0',
    'PRIVATE_SETUP_STATE_BENCH_1','PRIVATE_SETUP_AFTER_ACTIVE_0',
    'PRIVATE_SETUP_AFTER_ACTIVE_1','PRIVATE_SETUP_AFTER_BENCH_0',
    'PRIVATE_SETUP_AFTER_BENCH_1','PRIVATE_UNKNOWN_PHASE_ACTIVE','PRIVATE_UNKNOWN_PHASE_BENCH'
  ])assert.equal(json.includes(secret),false,'sanitized output leaked '+secret);
  assert.equal(sanitized.fixtureOnly,true);
  assert.equal(sanitized.competitiveGameQualified,false);
  assert.equal(sanitized.privacyBoundary.fullStateCaptured,false);
  assert.equal(sanitized.game.actorDecisions[0].actorObservation.ownHandCount,1);
  assert.equal(sanitized.game.actorDecisions[0].selectedCardPublicPrinting,'PubliclyPlayedCard');
  assert.equal(sanitized.game.finalPublicState.players[0].active,'Public Active');
  assert.equal(sanitized.privacyBoundary.setupPokemonIdentitiesEmitted,false);
  const setupRecord=sanitized.game.actorDecisions[1];
  assert.equal(setupRecord.actorObservation.ownPublic.active,null);
  assert.equal(setupRecord.actorObservation.ownPublic.activeOccupied,true);
  assert.deepEqual(setupRecord.actorObservation.ownPublic.bench,[null,null]);
  assert.deepEqual(setupRecord.actorObservation.ownPublic.benchOccupied,[true,false]);
  assert.equal(setupRecord.actorObservation.opponentPublic.active,null);
  assert.equal(setupRecord.actorObservation.opponentPublic.activeOccupied,true);
  assert.deepEqual(setupRecord.actorObservation.opponentPublic.bench,[null,null]);
  assert.deepEqual(setupRecord.actorObservation.opponentPublic.benchOccupied,[true,false]);
  for(const snapshot of [setupRecord.publicStateBefore,setupRecord.publicStateAfter]){
    for(const player of snapshot.players){
      assert.equal(player.active,null);
      assert.equal(player.activeOccupied,true);
      assert.deepEqual(player.bench,[null,null]);
      assert.deepEqual(player.benchOccupied,[true,false]);
    }
  }
  const unknownPhaseRecord=sanitized.game.actorDecisions[2];
  assert.equal(unknownPhaseRecord.publicStateBefore.phase,undefined);
  assert.equal(unknownPhaseRecord.publicStateBefore.players[0].active,null);
  assert.equal(unknownPhaseRecord.publicStateBefore.players[0].activeOccupied,true);
  assert.deepEqual(unknownPhaseRecord.publicStateBefore.players[0].bench,[null,null]);
  assert.deepEqual(unknownPhaseRecord.publicStateBefore.players[0].benchOccupied,[true,false]);
  assert.doesNotMatch(formatSanitizedTraceText(sanitized),/PRIVATE_SETUP_|PRIVATE_UNKNOWN_PHASE_/);
  assert.equal(sanitized.quickBallAudit.quickBallCompletedSearchChains,undefined);
  assert.equal(sanitized.quickBallAudit.completedPhysicalChains,1);
  assert.equal(Object.prototype.hasOwnProperty.call(sanitized,'nativeGame'),false);
  assert.equal(Object.prototype.hasOwnProperty.call(sanitized,'fixtureGamePartial'),false);
  assert.equal(Object.prototype.hasOwnProperty.call(sanitized.game,'decisionTrace'),false);
  assert.match(formatSanitizedTraceText(sanitized),/handCount 1/);
  assert.doesNotMatch(formatSanitizedTraceText(sanitized),/PRIVATE_HAND_SENTINEL|PRIVATE_PROMPT_CARD/);
});

test('partial fixture failure is converted to a safe non-admitting diagnostic',()=>{
  const sanitized=sanitizeFixtureArtifact({
    fixtureOnly:true,trial:{seed:'fixed',seed32:1},
    fixtureGamePartial:{
      finished:false,endReason:'fixture-execution-failed',attemptedActions:1,
      decisionTrace:[{actionOrdinal:1,actingSeat:1,dispatchStatus:'failed',
        actorObservationBefore:{actorSeat:1,ownHand:['PRIVATE_FAILURE_HAND'],
          ownPublic:{handCount:1,active:null,bench:[],stadium:[],discard:[],
            lostZone:[],resolvingSupporter:[],prizeSlots:[],publicTurnRestrictions:{}},
          opponentPublic:{handCount:6,active:null,bench:[],stadium:[],discard:[],
            lostZone:[],resolvingSupporter:[],prizeSlots:[],publicTurnRestrictions:{}}}}],
      finalPublicState:{phase:2,turn:3,activePlayer:1,pendingPrompts:[],players:[]},
      finalFullState:{secret:'PRIVATE_FAILURE_FULL_STATE'}
    },
    summary:{endReason:'fixture-execution-failed'}
  });
  assert.equal(sanitized.game.finished,false);
  assert.equal(sanitized.game.endReason,'fixture-execution-failed');
  assert.doesNotMatch(JSON.stringify(sanitized),/PRIVATE_FAILURE_HAND|PRIVATE_FAILURE_FULL_STATE/);
});

test('actor-only boundary projection preserves allowlisted role diagnostics without inventing safety fields',()=>{
  const sanitized=sanitizeFixtureArtifact({
    fixtureOnly:true,
    actorOnlyExecutionBoundary:{
      schema:'aichi-actor-only-execution-boundary-v2',
      valid:false,
      failures:[
        'candidate-unsupportedPromptFallbacks-nonzero',
        'opponent-peer-role-dispatch-enabled',
        'PRIVATE_BOUNDARY_FAILURE_SENTINEL'
      ],
      candidate:{
        role:'candidate',policyOwnerSeat:0,
        version:'agent34-actor-only-root-policy-v17',
        origin:'detached-actor-observation',
        observationSchema:'agent2-public-native-dispatch-diff-v1',
        nativeOwnerTrainerFallbackEnabled:false,
        ownerFallbackDiagnosticViewEnabled:false,
        nativePolicyMayUseHiddenInformation:false,
        unsupportedPromptFallbacks:2,
        nonLiveSpeculativeFallbacks:0,
        nonOwnerNativeDelegations:0,
        nonTurnPhaseFallbacks:0,
        nonOwnerSeatBypassCalls:0,
        peerRoleDispatchEnabled:true,
        ownerDecisionCalls:8,peerRoleDelegations:8,
        setupStartingBasicPromptsHandled:1,
        setupStartingBasicPromptsBySeat:[1,0],
        setupGoFirstPromptsHandled:1,
        setupGoFirstPromptsBySeat:[0,1],
        setupPromptActionsSubmitted:2,setupPromptActionsRejected:0,
        nativeOwnerTrainerFallbackAttemptedUnsupportedPasses:0,
        nativeOwnerTrainerFallback:{firstUnsupportedOwnerRoot:{
          printing:'PRIVATE_FIRST_UNSUPPORTED_ROOT_SENTINEL'
        }},
        privateField:'PRIVATE_ROLE_SUMMARY_SENTINEL'
      },
      opponent:{
        role:'opponent',policyOwnerSeat:1,
        version:'agent34-actor-only-root-policy-v17',
        origin:'detached-actor-observation',
        observationSchema:'agent2-public-native-dispatch-diff-v1',
        nativeOwnerTrainerFallbackEnabled:false,
        ownerFallbackDiagnosticViewEnabled:false,
        nativePolicyMayUseHiddenInformation:false,
        unsupportedPromptFallbacks:0,
        nonLiveSpeculativeFallbacks:0,
        nonOwnerNativeDelegations:0,
        nonTurnPhaseFallbacks:0,
        nonOwnerSeatBypassCalls:0,
        peerRoleDispatchEnabled:false,
        ownerDecisionCalls:8,peerRoleDelegations:0,
        setupStartingBasicPromptsHandled:1,
        setupStartingBasicPromptsBySeat:[0,1],
        setupGoFirstPromptsHandled:1,
        setupGoFirstPromptsBySeat:[1,0],
        setupPromptActionsSubmitted:2,setupPromptActionsRejected:0,
        nativeOwnerTrainerFallbackAttemptedUnsupportedPasses:0,
        privateField:'PRIVATE_OPPONENT_SUMMARY_SENTINEL'
      },
      privateField:'PRIVATE_BOUNDARY_SENTINEL'
    }
  });
  const boundary=sanitized.actorOnlyExecutionBoundary;
  assert.equal(boundary.valid,false);
  assert.equal(boundary.schema,'aichi-actor-only-execution-boundary-v2');
  assert.deepEqual(boundary.failures,[
    'candidate-unsupportedPromptFallbacks-nonzero',
    'opponent-peer-role-dispatch-enabled'
  ]);
  assert.equal(boundary.unrecognizedFailureCount,1);
  assert.equal(boundary.candidate.role,'candidate');
  assert.equal(boundary.candidate.policyOwnerSeat,0);
  assert.equal(boundary.candidate.unsupportedPromptFallbacks,2);
  assert.deepEqual(boundary.candidate.setupStartingBasicPromptsBySeat,[1,0]);
  assert.equal(boundary.opponent.role,'opponent');
  assert.equal(boundary.opponent.peerRoleDispatchEnabled,false);
  assert.deepEqual(boundary.opponent.setupGoFirstPromptsBySeat,[1,0]);
  assert.equal(Object.hasOwn(boundary,'hiddenInformationSafe'),false);
  assert.doesNotMatch(JSON.stringify(boundary),/PRIVATE_|FIRST_UNSUPPORTED/);
});

