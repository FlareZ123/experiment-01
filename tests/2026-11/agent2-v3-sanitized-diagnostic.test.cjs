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
    promptId:'PRIVATE_PROMPT_ID',promptType:'ChooseCardsPrompt',
    playerId:'PRIVATE_PLAYER_ID',perspectivePlayerId:'PRIVATE_PERSPECTIVE_PLAYER_ID',
    actingSeat:0,resolver:'native-prompt-resolver',
    selectedHandIndices:[0,1],selectedPrintings:['PRIVATE_SELECTED_PRINTING'],
    nativeError:'PRIVATE_NATIVE_ERROR',
    availableOptions:{
      cards:['PRIVATE_PROMPT_CARD_A','PRIVATE_PROMPT_CARD_B'],
      options:['PRIVATE_PROMPT_OPTION'],selectedCards:[0,1],
      selectedHandIndices:[0,1],min:1,max:1,allowCancel:false
    },
    promptSnapshot:{cards:['PRIVATE_PROMPT_CARD_A']}
  });
  assert.equal(view.optionCounts.cards,2);
  assert.equal(view.optionCounts.options,1);
  assert.equal(view.optionCounts.selectedCards,2);
  assert.equal(view.min,1);
  assert.equal(view.max,1);
  assert.equal(view.allowCancel,false);
  assert.equal(view.promptType,'ChooseCardsPrompt');
  assert.equal(view.actingSeat,0);
  for(const key of [
    'promptId','playerId','perspectivePlayerId','selectedHandIndices',
    'selectedPrintings','nativeError','availableOptions','promptSnapshot'
  ])
    assert.equal(Object.prototype.hasOwnProperty.call(view,key),false);
  assert.doesNotMatch(JSON.stringify(view),
    /PRIVATE_PROMPT_CARD|PRIVATE_PROMPT_OPTION|PRIVATE_PROMPT_ID|PRIVATE_PLAYER_ID|PRIVATE_PERSPECTIVE_PLAYER_ID|PRIVATE_SELECTED_PRINTING|PRIVATE_NATIVE_ERROR/);
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
    candidateAudit:{setupPromptDecisions:[{
      promptId:'PRIVATE_SETUP_PROMPT_ID',selectedHandIndices:[0],
      selectedPrintings:['PRIVATE_SETUP_PRINTING'],
      nativeError:'PRIVATE_SETUP_NATIVE_ERROR'
    }]},
    opponentAudit:{setupPromptDecisions:[{
      promptId:'PRIVATE_OPPONENT_SETUP_PROMPT_ID',selectedHandIndices:[1],
      selectedPrintings:['PRIVATE_OPPONENT_SETUP_PRINTING'],
      nativeError:'PRIVATE_OPPONENT_SETUP_NATIVE_ERROR'
    }]},
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
          promptId:'PRIVATE_SETUP_PROMPT_ID',
          playerId:'PRIVATE_SETUP_PLAYER_ID',
          perspectivePlayerId:'PRIVATE_SETUP_PERSPECTIVE_ID',
          promptType:'ChooseCardsPrompt',
          selectedHandIndices:[0],
          selectedPrintings:['PRIVATE_SETUP_PRINTING'],
          nativeError:'PRIVATE_SETUP_NATIVE_ERROR',
          availableOptions:{cards:['PRIVATE_PROMPT_CARD'],selectedCards:[0]}
        },
        workerDecisionTrace:{
          actorInput:{ownHand:['PRIVATE_WORKER_ACTOR_INPUT']},
          promptProjection:{promptId:'PRIVATE_WORKER_PROMPT_ID',
            choices:['PRIVATE_WORKER_PROMPT_CHOICE']},
          actionFrontier:{items:[{token:'PRIVATE_WORKER_FRONTIER_TOKEN',
            card:'PRIVATE_WORKER_FRONTIER_CARD'}]},
          selectedTokens:['PRIVATE_WORKER_SELECTED_TOKEN'],
          selectedItems:[{card:'PRIVATE_WORKER_SELECTED_CARD'}],
          policyAudit:{evaluations:[{token:'PRIVATE_WORKER_POLICY_TOKEN',score:99}]},
          validationReceipt:{nativeError:'PRIVATE_WORKER_VALIDATION_ERROR'}
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
        promptResolverContext:{
          promptId:'PRIVATE_SETUP_NATIVE_PROMPT_ID',
          playerId:'PRIVATE_SETUP_NATIVE_PLAYER_ID',
          perspectivePlayerId:'PRIVATE_SETUP_NATIVE_PERSPECTIVE_ID',
          promptType:'ChooseCardsPrompt',selectedHandIndices:[0],
          selectedPrintings:['PRIVATE_SETUP_NATIVE_PRINTING'],
          nativeError:'PRIVATE_SETUP_NATIVE_ERROR',
          availableOptions:{cards:['PRIVATE_SETUP_NATIVE_PROMPT_CARD'],selectedCards:[0]}
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
        selectedCardIdentity:{fullName:'PRIVATE_PROMPT_CARD'},
        publicStateBefore:{turn:1,activePlayer:0,pendingPrompts:[],
          players:[{seat:0,handCount:0,deckCount:40,prizeCount:6,discardCount:0,
            active:'PRIVATE_UNKNOWN_PHASE_ACTIVE',
            bench:['PRIVATE_UNKNOWN_PHASE_BENCH',null]}]}
      },{
        actionOrdinal:2,actingSeat:1,turnBefore:17,phaseBefore:2,
        isRootDecision:true,policyInputKind:'actor-observation',
        actionName:null,actionType:null,dispatchStatus:'not-dispatched',
        failure:{name:'GameError',nativeErrorKind:'GameError',
          nativeActionType:'PLAY_CARD_ACTION',nativeActionFamily:'ITEM'}
      }],
      finalPublicState:{phase:3,turn:3,activePlayer:0,pendingPrompts:[],
        players:[{seat:0,handCount:2,deckCount:35,prizeCount:5,discardCount:1,
          active:'Public Active',bench:[]}]},
      finalFullState:{privateField:'FULL_STATE_SENTINEL'}
    },
    fixtureGamePartial:{finalFullState:{privateField:'PARTIAL_FULL_STATE_SENTINEL'}},
    fixtureFailure:{name:'Error',code:'TEST',stage:'fixture',
      messageSha256:'f'.repeat(64),messageLength:10,
      nativeFixtureFailure:{
        name:'GameError',code:'NATIVE_FIXTURE_FAILURE',stage:'dispatch',
        messageSha256:'e'.repeat(64),messageLength:21,
        nativeErrorKind:'GameError',nativeGameMessage:'CANNOT_PLAY_THIS_CARD',
        nativeActionType:'PLAY_CARD_ACTION',nativeActionFamily:'ITEM',
        stackSite:{
          file:'simulation/evaluation/2026-11/agent49-native-fixture-game.cjs',
          line:456,column:12
        }
      }}
  };
  const sanitized=sanitizeFixtureArtifact(artifact,{
    nativeGameMessageValues:['CANNOT_PLAY_THIS_CARD']
  });
  const json=JSON.stringify(sanitized);
  assert.doesNotMatch(json,
    /"(?:candidateAudit|opponentAudit|setupPromptDecisions|selectedHandIndices|selectedPrintings|nativeError|promptId|playerId|perspectivePlayerId|workerDecisionTrace|actorInput|promptProjection|selectedItems|policyAudit|validationReceipt)"\s*:/);
  for(const secret of [
    'PRIVATE_HAND_SENTINEL','PRIVATE_PRIZE_SENTINEL','PRIVATE_PROMPT_CARD',
    'PRIVATE_SETUP_PROMPT_ID','PRIVATE_SETUP_PLAYER_ID','PRIVATE_SETUP_PERSPECTIVE_ID',
    'PRIVATE_SETUP_PRINTING','PRIVATE_SETUP_NATIVE_ERROR',
    'PRIVATE_SETUP_NATIVE_PROMPT_ID','PRIVATE_SETUP_NATIVE_PLAYER_ID',
    'PRIVATE_SETUP_NATIVE_PERSPECTIVE_ID','PRIVATE_SETUP_NATIVE_PRINTING',
    'PRIVATE_SETUP_NATIVE_PROMPT_CARD',
    'PRIVATE_OPPONENT_SETUP_PROMPT_ID','PRIVATE_OPPONENT_SETUP_PRINTING',
    'PRIVATE_OPPONENT_SETUP_NATIVE_ERROR',
    'PRIVATE_WORKER_ACTOR_INPUT','PRIVATE_WORKER_PROMPT_ID','PRIVATE_WORKER_PROMPT_CHOICE',
    'PRIVATE_WORKER_FRONTIER_TOKEN','PRIVATE_WORKER_FRONTIER_CARD',
    'PRIVATE_WORKER_SELECTED_TOKEN','PRIVATE_WORKER_SELECTED_CARD',
    'PRIVATE_WORKER_POLICY_TOKEN','PRIVATE_WORKER_VALIDATION_ERROR',
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
  assert.equal(sanitized.fixtureFailure.messageSha256,undefined);
  assert.equal(sanitized.fixtureFailure.messageLength,10);
  assert.equal(sanitized.fixtureFailure.nativeFixtureFailure.nativeErrorKind,'GameError');
  assert.equal(sanitized.fixtureFailure.nativeFixtureFailure.nativeGameMessage,
    'CANNOT_PLAY_THIS_CARD');
  assert.equal(sanitized.fixtureFailure.nativeFixtureFailure.nativeActionType,
    'PLAY_CARD_ACTION');
  assert.equal(sanitized.fixtureFailure.nativeFixtureFailure.nativeActionFamily,undefined,
    'public sanitizer must not expose private card family');
  assert.equal(sanitized.game.actorDecisions[3].failure.nativeActionType,'PLAY_CARD_ACTION');
  assert.equal(sanitized.game.actorDecisions[3].failure.nativeActionFamily,undefined,
    'public actor decision failure must not expose private card family');
  assert.deepEqual(sanitized.fixtureFailure.nativeFixtureFailure.stackSite,{
    file:'simulation/evaluation/2026-11/agent49-native-fixture-game.cjs',
    line:456,column:12
  });
  assert.equal(sanitized.fixtureFailure.nativeFixtureFailure.messageSha256,undefined);
  assert.doesNotMatch(json,/f{64}|e{64}/);

  const yesArtifact=structuredClone(artifact);
  yesArtifact.fixtureFailure.nativeFixtureFailure.nativeGameMessage='Yes';
  const yesSanitized=sanitizeFixtureArtifact(yesArtifact,{
    nativeGameMessageValues:['CANNOT_PLAY_THIS_CARD','Yes']
  });
  assert.equal(yesSanitized.fixtureFailure.nativeFixtureFailure.nativeGameMessage,'Yes');

  const invalidActionArtifact=structuredClone(artifact);
  invalidActionArtifact.fixtureFailure.nativeFixtureFailure.nativeActionType='PRIVATE_ACTION_TYPE';
  invalidActionArtifact.fixtureFailure.nativeFixtureFailure.nativeActionFamily='PRIVATE_FAMILY';
  const invalidActionSanitized=sanitizeFixtureArtifact(invalidActionArtifact,{
    nativeGameMessageValues:['CANNOT_PLAY_THIS_CARD']
  });
  assert.equal(invalidActionSanitized.fixtureFailure.nativeFixtureFailure.nativeActionType,undefined);
  assert.equal(invalidActionSanitized.fixtureFailure.nativeFixtureFailure.nativeActionFamily,undefined);

  for(const stackSite of [
    {file:'/tmp/private.cjs',line:1,column:1},
    {file:'simulation/../private/secret.cjs',line:1,column:1},
    {file:'simulation/evaluation/private.cjs',line:0,column:-1}
  ]){
    const invalidArtifact=structuredClone(artifact);
    invalidArtifact.fixtureFailure.nativeFixtureFailure.nativeGameMessage='PRIVATE_CUSTOM_GAME_ERROR';
    invalidArtifact.fixtureFailure.nativeFixtureFailure.stackSite=stackSite;
    const invalid=sanitizeFixtureArtifact(invalidArtifact,{
      nativeGameMessageValues:['CANNOT_PLAY_THIS_CARD']
    });
    assert.equal(invalid.fixtureFailure.nativeFixtureFailure.nativeErrorKind,'GameError');
    assert.equal(invalid.fixtureFailure.nativeFixtureFailure.nativeGameMessage,undefined);
    assert.equal(invalid.fixtureFailure.nativeFixtureFailure.stackSite,undefined);
    assert.doesNotMatch(JSON.stringify(invalid),/PRIVATE_CUSTOM_GAME_ERROR/);
  }
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


test('worker execution audit preserves allowlisted counters and hashes while redacting container and raw receipts',()=>{
  const sanitized=sanitizeFixtureArtifact({
    fixtureOnly:true,
    trial:{},
    nativeGame:{finished:true,endReason:'engine-game-end',decisionTrace:[]},
    workerExecutionAudit:{
      schema:'agent49-v3-worker-execution-audit-v1',
      workerProcessPerRole:true,
      physicalSeedDisclosureDecision:'public-reproducible',
      physicalSeedDisclosedToWorker:false,
      policySeedDisclosedToWorker:false,
      nativeStateDisclosedToWorker:false,
      opponentPrivateZonesDisclosedToWorker:false,
      workerInputScope:'actor-observation-v3+actor-prompt-projection+public-event-receipt-v3+typed-action-frontier-v1',
      roles:{
        candidate:{
          role:'candidate',seat:0,policyVersion:'candidate-v1',
          bundleSha256:'a'.repeat(64),policySha256:'b'.repeat(64),
          decisionCount:5,rootDecisionCount:4,promptDecisionCount:1,
          rootActionFrontierAdmissionCount:4,
          rootActionFrontierAdmissionReceipts:[{private:'PRIVATE_FRONTIER_RECEIPT'}],
          actionFrontierAdmissionFailureCount:0,hostOnlyPromptCount:1,
          abstentionCount:0,failureCount:0,timeoutCount:0,lastFailureCode:null,
          workerProcessClosed:true,containerRemoved:true,policyBundleRemoved:true,
          containerId:'PRIVATE_CONTAINER_ID',containerIdSha256:'c'.repeat(64),
          policyStreamProtocol:'agent49-worker-jsonl-v1',
          policyDrawCount:0,policyDrawCounts:[0,0,0,0,0],
          policyDrawViolationCount:0,policyRngReplayable:true,
          stderr:'PRIVATE_WORKER_STDERR',privatePolicySource:'PRIVATE_POLICY_SOURCE'
        },
        opponent:{
          role:'opponent',seat:1,policyVersion:'opponent-v1',
          bundleSha256:'d'.repeat(64),policySha256:'e'.repeat(64),
          decisionCount:4,rootDecisionCount:3,promptDecisionCount:1,
          rootActionFrontierAdmissionCount:3,
          actionFrontierAdmissionFailureCount:0,hostOnlyPromptCount:1,
          abstentionCount:0,failureCount:0,timeoutCount:0,
          workerProcessClosed:true,containerRemoved:true,policyBundleRemoved:true,
          containerId:'PRIVATE_OPPONENT_CONTAINER',containerIdSha256:'f'.repeat(64),
          policyStreamProtocol:'agent49-worker-jsonl-v1',
          policyDrawCount:0,policyDrawCounts:[0,0,0,0],
          policyDrawViolationCount:0,policyRngReplayable:true
        }
      },
      totalWorkerDecisions:9,totalHostOnlyPrompts:2,totalAbstentions:0,
      totalFailures:0,policyRngViolations:0,replayableEvidence:true,
      actionFrontierAdapterSchema:'agent3-known-cap-free-native-frontier-v1',
      actionFrontierAdapterEnginePin:'1'.repeat(40),
      cleanupVerified:true,cleanupFailureCount:0,
      cleanupReceipts:[{
        role:'candidate',processClosed:true,containerRemoved:true,
        containerId:'PRIVATE_CLEANUP_CONTAINER'
      }],
      promptProvenanceHook:{
        installed:true,restored:true,activeEffectDepth:0,
        privateStack:'PRIVATE_PROMPT_PROVENANCE_STACK'
      },
      privateField:'PRIVATE_WORKER_AUDIT_SENTINEL'
    }
  });
  const audit=sanitized.workerExecutionAudit;
  assert.equal(audit.totalWorkerDecisions,9);
  assert.equal(audit.roles.candidate.rootActionFrontierAdmissionCount,4);
  assert.equal(audit.roles.candidate.containerIdSha256,'c'.repeat(64));
  assert.equal(audit.roles.candidate.policyDrawViolationCount,0);
  assert.equal(audit.physicalSeedDisclosedToWorker,false);
  assert.equal(audit.policySeedDisclosedToWorker,false);
  assert.equal(audit.nativeStateDisclosedToWorker,false);
  assert.equal(audit.opponentPrivateZonesDisclosedToWorker,false);
  assert.equal(audit.workerInputScope,
    'actor-observation-v3+actor-prompt-projection+public-event-receipt-v3+typed-action-frontier-v1');
  assert.equal(audit.roles.candidate.rootActionFrontierAdmissionReceipts,undefined);
  assert.equal(audit.cleanupReceipts[0].containerId,undefined);
  assert.equal(audit.promptProvenanceHook.activeEffectDepth,0);
  assert.equal(audit.promptProvenanceHook.privateStack,undefined);
  assert.equal(sanitized.workerExecutionAuditSha256.length,64);
  assert.doesNotMatch(JSON.stringify(sanitized),
    /PRIVATE_FRONTIER_RECEIPT|PRIVATE_CONTAINER_ID|PRIVATE_OPPONENT_CONTAINER|PRIVATE_CLEANUP_CONTAINER|PRIVATE_WORKER_STDERR|PRIVATE_POLICY_SOURCE|PRIVATE_PROMPT_PROVENANCE_STACK|PRIVATE_WORKER_AUDIT_SENTINEL/);
  assert.match(formatSanitizedTraceText(sanitized),/workerDecisionCount=9/);
});

test('worker execution audit fails closed on unknown boundary flags and noncanonical scope',()=>{
  const sanitized=sanitizeFixtureArtifact({
    fixtureOnly:true,
    trial:{},
    nativeGame:{finished:false,endReason:'unknown',decisionTrace:[]},
    workerExecutionAudit:{
      schema:'agent49-v3-worker-execution-audit-v1',
      physicalSeedDisclosedToWorker:'false',
      policySeedDisclosedToWorker:0,
      nativeStateDisclosedToWorker:'false',
      opponentPrivateZonesDisclosedToWorker:0,
      workerInputScope:'actor-observation-v3+untrusted-extension'
    }
  });
  assert.equal(sanitized.workerExecutionAudit.physicalSeedDisclosedToWorker,null);
  assert.equal(sanitized.workerExecutionAudit.policySeedDisclosedToWorker,null);
  assert.equal(sanitized.workerExecutionAudit.nativeStateDisclosedToWorker,null);
  assert.equal(sanitized.workerExecutionAudit.opponentPrivateZonesDisclosedToWorker,null);
  assert.equal(sanitized.workerExecutionAudit.workerInputScope,null);
});
