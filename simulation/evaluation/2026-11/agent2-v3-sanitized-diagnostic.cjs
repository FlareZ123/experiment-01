'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');

function stableJson(value) {
  if(value===null)return 'null';
  if(typeof value==='string'||typeof value==='boolean')return JSON.stringify(value);
  if(typeof value==='number') {
    assert.ok(Number.isFinite(value),'Sanitized diagnostic contains a non-finite number');
    return JSON.stringify(value);
  }
  if(Array.isArray(value))return '['+value.map(stableJson).join(',')+']';
  assert.equal(typeof value,'object','Sanitized diagnostic contains an unsupported value');
  return '{'+Object.keys(value).sort().map(key=>
    JSON.stringify(key)+':'+stableJson(value[key])).join(',')+'}';
}

function sha256Json(value) {
  return createHash('sha256').update(stableJson(value)).digest('hex');
}

function pick(source,keys) {
  if(!source||typeof source!=='object')return {};
  const out={};
  for(const key of keys) {
    const value=source[key];
    if(value===null||typeof value==='string'||typeof value==='boolean'||
        (typeof value==='number'&&Number.isFinite(value)))out[key]=value;
  }
  return out;
}

function strings(value) {
  return Array.isArray(value)?value.filter(item=>typeof item==='string').slice(0,256):[];
}

function sanitizePublicPokemon(pokemon) {
  if(!pokemon||typeof pokemon!=='object')return null;
  const printed=pick(pokemon.printed,[
    'stage','subtypes','types','retreatCost'
  ]);
  if(Array.isArray(pokemon.printed?.weakness))
    printed.weakness=pokemon.printed.weakness.map(row=>pick(row,['type','value']));
  if(Array.isArray(pokemon.printed?.resistance))
    printed.resistance=pokemon.printed.resistance.map(row=>pick(row,['type','value']));
  const restrictions=pick(pokemon.publicRestrictions,[
    'cannotAttackNextTurn','blockedAttackNameNextTurn',
    'blockedAttackNameUntilLeavesActive','onlyAllowedAttackNameNextTurn',
    'attackCostIncreaseNextTurn','attackCostIncreaseWhileActive',
    'cannotRetreat','cannotRetreatNextTurn','cannotRetreatWhileActive',
    'cannotEvolveNextTurn'
  ]);
  if(Array.isArray(pokemon.publicRestrictions?.cannotUseAttacksNextTurn))
    restrictions.cannotUseAttacksNextTurn=strings(pokemon.publicRestrictions.cannotUseAttacksNextTurn);
  const attacks=Array.isArray(pokemon.attacks)?pokemon.attacks.map(attack=>({
    ...pick(attack,['name','damage','damageCalculation','text','gxAttack','barrage','canUseOnFirstTurn']),
    cost:strings(attack?.cost)
  })): [];
  const abilityDetails=Array.isArray(pokemon.abilityDetails)?pokemon.abilityDetails.map(ability=>
    pick(ability,['name','powerType','text'])):[];
  return {
    ...pick(pokemon,['printing','name','hp','damage','lastPlayedOrEvolvedTurn']),
    printed,
    specialConditions:Array.isArray(pokemon.specialConditions)?
      pokemon.specialConditions.filter(value=>typeof value==='string'||typeof value==='number'):[ ],
    publicRestrictions:restrictions,
    evolutionPrintings:strings(pokemon.evolutionPrintings),
    energies:strings(pokemon.energies),
    tools:strings(pokemon.tools),
    attacks,
    abilities:strings(pokemon.abilities),
    abilityDetails
  };
}

function sanitizePublicPlayer(player,hideSetupPokemon=false) {
  if(!player||typeof player!=='object')return null;
  const bench=Array.isArray(player.bench)?player.bench:[];
  return {
    active:hideSetupPokemon?null:sanitizePublicPokemon(player.active),
    ...(hideSetupPokemon?{
      activeOccupied:player.active!==null&&player.active!==undefined
    }:{}),
    bench:bench.map(slot=>hideSetupPokemon?null:sanitizePublicPokemon(slot)),
    ...(hideSetupPokemon?{
      benchOccupied:bench.map(slot=>slot!==null&&slot!==undefined)
    }:{}),
    stadium:strings(player.stadium),
    discard:strings(player.discard),
    lostZone:strings(player.lostZone),
    resolvingSupporter:strings(player.resolvingSupporter),
    publicHand:Array.isArray(player.publicHand)?strings(player.publicHand):null,
    prizeSlots:Array.isArray(player.prizeSlots)?player.prizeSlots.map(slot=>pick(slot,['index','printing'])):[],
    publicTurnRestrictions:pick(player.publicTurnRestrictions,[
      'gxUsed','vstarUsed','attackLockTurnsRemaining','attackMaxEnergy',
      'attackMaxEnergyTurnsRemaining','ignoreAttackCostTurnsRemaining',
      'cannotUseGXAttacks','pokemonPlayLocked','abilityPokemonPlayLocked',
      'evolutionPlayLocked','itemPlayLocked','supporterPlayLocked',
      'stadiumPlayLocked','toolPlayLocked','energyPlayLocked',
      'specialEnergyPlayLocked'
    ]),
    handCount:Number.isSafeInteger(player.handCount)?player.handCount:null,
    deckCount:Number.isSafeInteger(player.deckCount)?player.deckCount:null,
    prizeCount:Number.isSafeInteger(player.prizeCount)?player.prizeCount:null
  };
}

function sanitizeActorObservation(observation) {
  if(!observation||typeof observation!=='object')return null;
  // Public artifacts must hide both sides' face-down setup Pokémon, including the actor's own.
  const hideSetupPokemon=!Number.isSafeInteger(observation.phase)||
    observation.phase===0||observation.phase===1;
  const ownerK1=observation.ownerK1&&typeof observation.ownerK1==='object'?
    {
      epoch:Number.isSafeInteger(observation.ownerK1.epoch)?observation.ownerK1.epoch:null,
      exactMembershipKnown:observation.ownerK1.exactMembershipKnown===true,
      knownPrintingsCount:Array.isArray(observation.ownerK1.knownPrintings)?
        observation.ownerK1.knownPrintings.length:null
    }:null;
  const resources=pick(observation.ownTurnResources,[
    'supporterPlayedTurn','retreatedTurn','extraTurnActive',
    'energyPlayedTurn','stadiumPlayedTurn','stadiumUsedTurn',
    'vstarUsed','pokemonPlayLocked','abilityPokemonPlayLocked',
    'evolutionPlayLocked','itemPlayLocked','supporterPlayLocked',
    'stadiumPlayLocked','toolPlayLocked','energyPlayLocked',
    'specialEnergyPlayLocked'
  ]);
  return {
    ...pick(observation,[
      'actorSeat','globalTurn','phase','decisionKind',
      'pendingPromptType','pendingOwnerDeckSearch'
    ]),
    ownHandCount:Array.isArray(observation.ownHand)?
      observation.ownHand.length:
      (Number.isSafeInteger(observation.ownPublic?.handCount)?
        observation.ownPublic.handCount:null),
    ownPublic:sanitizePublicPlayer(observation.ownPublic,hideSetupPokemon),
    opponentPublic:sanitizePublicPlayer(observation.opponentPublic,hideSetupPokemon),
    ownTurnResources:resources,
    ownerK1
  };
}

function sanitizePublicState(state) {
  if(!state||typeof state!=='object')return null;
  // Global snapshots expose both seats; unknown phases fail closed as hidden setup.
  const hideSetupPokemon=!Number.isSafeInteger(state.phase)||
    state.phase===0||state.phase===1;
  return {
    ...pick(state,['phase','turn','activePlayer']),
    pendingPrompts:strings(state.pendingPrompts),
    players:Array.isArray(state.players)?state.players.map(player=>{
      const bench=Array.isArray(player.bench)?player.bench:[];
      return {
        ...pick(player,['seat','handCount','deckCount','prizeCount','discardCount']),
        active:hideSetupPokemon?null:
          (typeof player.active==='string'?player.active:null),
        ...(hideSetupPokemon?{
          activeOccupied:typeof player.active==='string'
        }:{}),
        bench:bench.map(value=>hideSetupPokemon?null:
          (typeof value==='string'?value:null)),
        ...(hideSetupPokemon?{
          benchOccupied:bench.map(value=>typeof value==='string')
        }:{})
      };
    }):[]
  };
}

function sanitizePromptContext(context) {
  if(!context||typeof context!=='object')return null;
  const options=context.availableOptions??{};
  const optionCounts={};
  for(const key of [
    'cards','options','choices','targets','availableCards',
    'eligibleCards','selectedCards'
  ]) {
    if(Array.isArray(options[key]))optionCounts[key]=options[key].length;
  }
  return {
    ...pick(context,['promptId','promptType','playerId','perspectivePlayerId','actingSeat','resolver']),
    optionCounts,
    ...pick(options,['min','max','minCards','maxCards','allowCancel'])
  };
}

function sanitizePromptResolution(resolution) {
  if(!resolution||typeof resolution!=='object')return null;
  if(resolution.kind==='coin-flip')
    return {kind:'coin-flip',result:resolution.result===true};
  if(resolution.kind==='shuffle')
    return {
      kind:'shuffle',
      ...pick(resolution,['ownerSeat','cardCount'])
    };
  if(resolution.kind==='engine-wait')
    return {
      kind:'engine-wait',
      ...pick(resolution,['ownerSeat'])
    };
  return pick(resolution,['kind','ownerSeat']);
}

function sanitizeFailure(failure) {
  if(!failure||typeof failure!=='object')return null;
  return pick(failure,['name','code','messageSha256','messageLength','stage']);
}

function sanitizeTarget(target) {
  if(!target||typeof target!=='object')return null;
  return pick(target,['player','slot','index','position']);
}

function sanitizeDecisionRecord(record) {
  const observation=sanitizeActorObservation(record.actorObservationBefore);
  const selectedCardPublicPrinting=record.dispatchStatus==='succeeded'&&
    typeof record.selectedCardIdentity?.fullName==='string'?
      record.selectedCardIdentity.fullName:null;
  return {
    ...pick(record,[
      'actionOrdinal','actingSeat','turnBefore','phaseBefore',
      'activePlayerBefore','pendingPromptType','isRootDecision',
      'policyInputKind','actionName','actionType','dispatchStatus'
    ]),
    actorObservation:observation,
    actorObservationSha256:observation?sha256Json(observation):null,
    selectedCardPublicPrinting,
    targetProjection:sanitizeTarget(record.targetProjection),
    publicStateBefore:sanitizePublicState(record.publicStateBefore),
    publicStateAfter:sanitizePublicState(record.publicStateAfter),
    promptResolution:sanitizePromptResolution(record.promptResolution),
    promptContext:sanitizePromptContext(record.promptResolverContext),
    failure:sanitizeFailure(record.failure),
    diagnosticSnapshotFailure:sanitizeFailure(record.diagnosticSnapshotFailure)
  };
}

const ROLE_BOUNDARY_COUNTER_FIELDS=Object.freeze([
  'unsupportedPromptFallbacks','nonLiveSpeculativeFallbacks',
  'nonOwnerNativeDelegations','nonTurnPhaseFallbacks',
  'nonOwnerSeatBypassCalls','ownerDecisionCalls','peerRoleDelegations',
  'setupStartingBasicPromptsHandled','setupGoFirstPromptsHandled',
  'setupPromptActionsSubmitted','setupPromptActionsRejected',
  'nativeOwnerTrainerFallbackAttemptedUnsupportedPasses'
]);
const ROLE_BOUNDARY_BOOLEAN_FIELDS=Object.freeze([
  'nativeOwnerTrainerFallbackEnabled','ownerFallbackDiagnosticViewEnabled',
  'nativePolicyMayUseHiddenInformation','peerRoleDispatchEnabled'
]);
const ROLE_BOUNDARY_TEXT_FIELDS=Object.freeze([
  'version','origin','observationSchema'
]);
const ROLE_BOUNDARY_ARRAY_FIELDS=Object.freeze([
  'setupStartingBasicPromptsBySeat','setupGoFirstPromptsBySeat'
]);
const ROLE_BOUNDARY_FAILURE_SUFFIXES=Object.freeze([
  'audit-missing-or-invalid','policy-owner-seat-mismatch',
  'wrapper-version-missing','observation-origin-invalid',
  'observation-schema-invalid','native-owner-trainer-fallback-enabled',
  'owner-fallback-diagnostic-view-enabled','native-policy-may-use-hidden-information',
  ...ROLE_BOUNDARY_COUNTER_FIELDS.filter(key=>![
    'ownerDecisionCalls','peerRoleDelegations',
    'setupStartingBasicPromptsHandled','setupGoFirstPromptsHandled',
    'setupPromptActionsSubmitted','setupPromptActionsRejected'
  ].includes(key)).flatMap(key=>[key+'-missing-or-invalid',key+'-nonzero']),
  'peerRoleDispatchEnabled-missing-or-invalid',
  'ownerDecisionCalls-missing-or-invalid',
  'peerRoleDelegations-missing-or-invalid'
]);
const ROLE_BOUNDARY_FAILURE_CODES=new Set([
  ...['candidate','opponent'].flatMap(role=>
    ROLE_BOUNDARY_FAILURE_SUFFIXES.map(suffix=>role+'-'+suffix)),
  'candidate-peer-role-dispatch-disabled',
  'opponent-peer-role-dispatch-enabled',
  'candidate-peer-role-delegation-count-mismatch',
  'opponent-peer-role-delegation-count-nonzero'
]);

function sanitizeRoleBoundarySummary(source,expectedRole) {
  if(!source||typeof source!=='object'||Array.isArray(source))return null;
  const result={
    role:source.role===expectedRole?expectedRole:null,
    roleMatches:source.role===expectedRole
  };
  if(source.policyOwnerSeat===0||source.policyOwnerSeat===1||
      source.policyOwnerSeat===null)result.policyOwnerSeat=source.policyOwnerSeat;
  for(const key of ROLE_BOUNDARY_TEXT_FIELDS) {
    const value=source[key];
    if(typeof value==='string'&&value.length<=128)result[key]=value;
  }
  for(const key of ROLE_BOUNDARY_BOOLEAN_FIELDS) {
    if(typeof source[key]==='boolean')result[key]=source[key];
  }
  for(const key of ROLE_BOUNDARY_COUNTER_FIELDS) {
    if(Number.isSafeInteger(source[key])&&source[key]>=0)result[key]=source[key];
  }
  for(const key of ROLE_BOUNDARY_ARRAY_FIELDS) {
    const value=source[key];
    if(Array.isArray(value)&&value.length===2&&
        value.every(item=>Number.isSafeInteger(item)&&item>=0))
      result[key]=value.slice();
  }
  return result;
}

function sanitizeBoundary(boundary) {
  if(!boundary||typeof boundary!=='object'||Array.isArray(boundary))return null;
  const result={
    valid:typeof boundary.valid==='boolean'?boundary.valid:null
  };
  if(boundary.schema==='aichi-actor-only-execution-boundary-v2')
    result.schema=boundary.schema;
  // This field is not emitted by the current role composer. Preserve it only
  // when an upstream source explicitly provides a boolean; never invent false.
  if(typeof boundary.hiddenInformationSafe==='boolean')
    result.hiddenInformationSafe=boundary.hiddenInformationSafe;
  if(Array.isArray(boundary.failures)) {
    const allowed=boundary.failures.filter(code=>
      typeof code==='string'&&ROLE_BOUNDARY_FAILURE_CODES.has(code));
    result.failures=allowed.slice(0,64);
    result.unrecognizedFailureCount=boundary.failures.length-allowed.length;
  }
  result.candidate=sanitizeRoleBoundarySummary(boundary.candidate,'candidate');
  result.opponent=sanitizeRoleBoundarySummary(boundary.opponent,'opponent');
  if(typeof boundary.nativePolicyMayUseHiddenInformation==='boolean')
    result.nativePolicyMayUseHiddenInformation=boundary.nativePolicyMayUseHiddenInformation;
  return result;
}

function sanitizeQuickBallAudit(audit) {
  if(!audit||typeof audit!=='object')return null;
  return pick(audit,[
    'quickBallRootsAccepted','paymentPhysicalAcceptances',
    'targetPhysicalRetrievals','targetPhysicalBenchPlacements',
    'completedPhysicalChains','completedSetupChains',
    'pendingBenchPlacementsAtEnd','rejectedNativeReplies'
  ]);
}

function sanitizeIdentity(identity) {
  if(!identity||typeof identity!=='object')return null;
  const projection=pick(identity,[
    'policyProducerId','deckSha256','policySha256',
    'entryManifestSha256','challengeSuiteSha256'
  ]);
  return {
    identitySha256:sha256Json(projection),
    policyProducerId:projection.policyProducerId??null,
    deckSha256:projection.deckSha256??null,
    policySha256:projection.policySha256??null,
    entryManifestSha256:projection.entryManifestSha256??null,
    challengeSuiteSha256:projection.challengeSuiteSha256??null
  };
}

function sanitizeFixtureArtifact(artifact) {
  assert.ok(artifact&&artifact.fixtureOnly===true,
    'Only a fixture-only artifact may be converted to a sanitized diagnostic');
  const rawGame=artifact.nativeGame??artifact.fixtureGamePartial??{};
  const rawTrace=Array.isArray(rawGame.decisionTrace)?rawGame.decisionTrace:[];
  const actorDecisions=rawTrace.map(sanitizeDecisionRecord);
  const rootDecisions=actorDecisions.filter(row=>row.isRootDecision===true).map(row=>({
    actionOrdinal:row.actionOrdinal??null,
    actingSeat:row.actingSeat??null,
    turnBefore:row.turnBefore??null,
    actionName:row.actionName??null,
    selectedCardPublicPrinting:row.selectedCardPublicPrinting,
    dispatchStatus:row.dispatchStatus??null,
    actorObservationSha256:row.actorObservationSha256
  }));
  const safeGame={
    finished:rawGame.finished===true,
    endReason:rawGame.endReason??artifact.summary?.endReason??'unknown',
    winner:rawGame.winner??artifact.summary?.winner??null,
    winnerSeat:rawGame.winnerSeat===0||rawGame.winnerSeat===1?rawGame.winnerSeat:null,
    actualFirstPlayerSeat:rawGame.actualFirstPlayerSeat===0||rawGame.actualFirstPlayerSeat===1?
      rawGame.actualFirstPlayerSeat:
      (artifact.trial?.actualFirstPlayerSeat===0||artifact.trial?.actualFirstPlayerSeat===1?
        artifact.trial.actualFirstPlayerSeat:null),
    actions:Number.isSafeInteger(rawGame.actions)?rawGame.actions:
      (Number.isSafeInteger(rawGame.acceptedActions)?rawGame.acceptedActions:0),
    attemptedActions:Number.isSafeInteger(rawGame.attemptedActions)?
      rawGame.attemptedActions:actorDecisions.length,
    turns:Number.isSafeInteger(rawGame.turns)?rawGame.turns:
      (Number.isSafeInteger(artifact.summary?.turns)?artifact.summary.turns:null),
    actionCountsBySeat:Array.isArray(rawGame.actionCountsBySeat)?
      rawGame.actionCountsBySeat.filter(Number.isSafeInteger).slice(0,2):null,
    actorDecisions,
    rootDecisions,
    actorDecisionsSha256:sha256Json(actorDecisions),
    rootDecisionsSha256:sha256Json(rootDecisions),
    finalPublicState:sanitizePublicState(rawGame.finalPublicState)
  };
  const candidate=artifact.candidate??{};
  const opponent=artifact.opponent??{};
  const engine=artifact.engine??{};
  const policy=artifact.policy??{};
  const trial=artifact.trial??{};
  const summary=artifact.summary??{};
  const boundary=sanitizeBoundary(artifact.actorOnlyExecutionBoundary??trial.actorOnlyExecutionBoundary);
  const quickBall=sanitizeQuickBallAudit(
    artifact.roleComposerAudit?.quickBall??artifact.quickBallAudit);
  return {
    schema:'aichi-v3-actor-observation-sanitized-diagnostic-v1',
    diagnosticMode:'sanitized-only-no-full-state-capture',
    fixtureOnly:true,
    admissionEligible:false,
    competitiveGameQualified:false,
    benchmark:artifact.benchmark??'Aichi Open League 2026 Top 32',
    benchmarkFormat:artifact.benchmarkFormat??null,
    engineFormat:artifact.engineFormat??null,
    candidateFormat:artifact.candidateFormat??trial.candidateFormat??null,
    gameRuleset:artifact.gameRuleset??trial.gameRuleset??null,
    opponentSourceEventFormat:artifact.opponentSourceEventFormat??trial.opponentSourceEventFormat??null,
    formatReviewStatus:artifact.formatReviewStatus??trial.formatReviewStatus??null,
    candidate:{
      label:candidate.label??null,
      sourcePath:candidate.sourcePath??null,
      sourceGitBlobSha:candidate.sourceGitBlobSha??null,
      printed60Sha256:candidate.printed60Sha256??null
    },
    opponent:{
      rank:opponent.rank??null,
      sourceStatus:opponent.sourceStatus??null,
      formatStatus:opponent.formatStatus??null,
      player:opponent.player??null,
      archetype:opponent.archetype??null,
      sourcePath:opponent.sourcePath??null,
      sourceGitBlobSha:opponent.sourceGitBlobSha??null,
      printed60Sha256:opponent.printed60Sha256??null
    },
    engine:{
      twinleafCommitSha:engine.twinleafCommitSha??null,
      researchRevisionSha:engine.researchRevisionSha??null,
      nodeVersion:engine.nodeVersion??null,
      format:engine.format??null,
      gameRuleset:engine.gameRuleset??null,
      cardPoolInitializationReceiptSha256:engine.cardPoolInitializationReceipt?
        sha256Json(engine.cardPoolInitializationReceipt):null
    },
    policy:{
      candidateProfile:policy.candidateProfile??null,
      opponentProfile:policy.opponentProfile??null,
      candidatePolicyOptions:policy.candidatePolicyOptions??null,
      opponentPolicyOptions:policy.opponentPolicyOptions??null,
      policyCompetenceIndependentlyReviewed:policy.policyCompetenceIndependentlyReviewed===true,
      identityScope:policy.identityScope??null,
      challengeSuiteSha256:policy.challengeSuiteSha256??null,
      challengeSuiteScope:policy.challengeSuiteScope??null
    },
    policyPlanSha256:artifact.preDealFixtureEnvelope?.policyPlanSha256??null,
    candidatePolicyIdentity:sanitizeIdentity(artifact.candidatePolicyIdentity),
    opponentPolicyIdentity:sanitizeIdentity(artifact.opponentPolicyIdentity),
    runtime:{
      runtimePinUnionSha256:artifact.runtimePinEvidence?.runtimePinUnionSha256??null,
      loadedProcessClosureSha256:artifact.runtimePinEvidence?.loadedProcessClosureSha256??null,
      guardRestored:artifact.runtimePinAudit?.guardRestored===true,
      runtimePatchReceipts:Array.isArray(artifact.runtimePatchReceipts)?
        artifact.runtimePatchReceipts.map(receipt=>pick(receipt,[
          'patchId','modulePath','moduleSha256','target'
        ])):[]
    },
    trial:{
      trialId:trial.trialId??null,
      candidateSeat:trial.candidateSeat??null,
      originalSourceSeat:trial.originalSourceSeat??null,
      actualFirstPlayerSeat:safeGame.actualFirstPlayerSeat,
      seed:trial.seed??null,
      seed32:trial.seed32??rawGame.seed32??null,
      vendorCommitSha:trial.vendorCommitSha??null,
      researchRevisionSha:trial.researchRevisionSha??null,
      candidatePrinted60Sha256:trial.candidatePrinted60Sha256??null,
      originalPrinted60Sha256:trial.originalPrinted60Sha256??null
    },
    actorOnlyExecutionBoundary:boundary,
    quickBallAudit:quickBall,
    game:safeGame,
    fixtureFailure:sanitizeFailure(artifact.fixtureFailure),
    summary:{
      winner:safeGame.winner,
      winnerSeat:safeGame.winnerSeat,
      endReason:safeGame.endReason,
      actionCount:safeGame.actions,
      attemptedActionCount:safeGame.attemptedActions,
      turns:safeGame.turns,
      actionCountsBySeat:safeGame.actionCountsBySeat,
      actualFirstPlayerSeat:safeGame.actualFirstPlayerSeat,
      actorOnlyExecutionBoundaryValid:boundary?.valid===true,
      quickBallRootsAccepted:quickBall?.quickBallRootsAccepted??0,
      quickBallPaymentPhysicalAcceptances:quickBall?.paymentPhysicalAcceptances??0,
      quickBallTargetPhysicalRetrievals:quickBall?.targetPhysicalRetrievals??0,
      quickBallTargetPhysicalBenchPlacements:quickBall?.targetPhysicalBenchPlacements??null,
      quickBallCompletedSearchChains:quickBall?.completedPhysicalChains??0,
      actorDecisionsSha256:safeGame.actorDecisionsSha256,
      rootDecisionsSha256:safeGame.rootDecisionsSha256,
      fixtureOnly:true,
      winRateEstimate:null
    },
    privacyBoundary:{
      fullStateCaptured:false,
      actorHandIdentitiesEmitted:false,
      ownerPrizeIdentitiesEmitted:false,
      promptOptionIdentitiesEmitted:false,
      opponentConcealedZonesEmitted:false,
      setupPokemonIdentitiesEmitted:false,
      policyApplicationReceiptEmitted:false,
      note:'This is a sanitized fixture diagnostic, not a policy-competence or competitive-game admission artifact.'
    }
  };
}

function formatSanitizedTraceText(artifact) {
  const rows=[
    'schema='+artifact.schema,
    'diagnosticMode='+artifact.diagnosticMode,
    'fixtureOnly=true',
    'competitiveGameQualified=false',
    'engine='+String(artifact.engine?.twinleafCommitSha??'unknown'),
    'candidate='+String(artifact.candidate?.printed60Sha256??'unknown'),
    'opponentRank='+String(artifact.opponent?.rank??'unknown'),
    'winnerSeat='+String(artifact.game?.winnerSeat??'unknown'),
    'endReason='+String(artifact.game?.endReason??'unknown'),
    'turns='+String(artifact.game?.turns??'unknown')
  ];
  for(const row of artifact.game?.actorDecisions??[]) {
    rows.push([
      'action',row.actionOrdinal??'?', 'turn',row.turnBefore??'?',
      'seat',row.actingSeat??'?',row.isRootDecision?'root':'prompt',
      row.actionName??'unknown',row.selectedCardPublicPrinting??'',
      row.dispatchStatus??'unknown',
      'handCount',row.actorObservation?.ownHandCount??'unknown'
    ].join(' '));
  }
  return rows.join('\n')+'\n';
}

module.exports={
  stableJson,sha256Json,sanitizeActorObservation,sanitizePromptContext,
  sanitizeDecisionRecord,sanitizeFixtureArtifact,formatSanitizedTraceText
};
