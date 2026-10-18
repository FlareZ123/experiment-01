'use strict';

const fs = require('node:fs');

const DECLARATION_PROTOCOL = 'real-store-attack-log-declarations-v1';

/**
 * Reduce one source-opponent record without treating an unobserved attack
 * channel as zero. Player seats are physical seats, not candidate order.
 *
 * @param {object} record
 * @returns {object}
 */
function sourceRecordBrief(record) {
  const candidateSeat = record.candidateEngineSlot === 'A' ? 0 :
    record.candidateEngineSlot === 'B' ? 1 : null;
  if (candidateSeat === null) {
    throw new TypeError('Source report requires physical candidate seat');
  }
  const sourceSeat = 1 - candidateSeat;
  const declared = record.attackDeclarationTraceProtocol === DECLARATION_PROTOCOL &&
    Array.isArray(record.attackDeclarationTrace) ?
    record.attackDeclarationTrace : null;
  const ownDeclarations = declared?.filter(event =>
    event.playerSlot === sourceSeat) ?? null;
  const ownRaw = Array.isArray(record.attackTrace) ?
    record.attackTrace.filter(event => event.seat === sourceSeat) : null;
  const actions = Array.isArray(record.decisionTrace) ?
    record.decisionTrace.filter(event => event.playerSlot === sourceSeat) : null;
  const candidateDeclarations = declared?.filter(event =>
    event.playerSlot === candidateSeat) ?? null;
  const firstAttack = ownDeclarations?.[0] ?? null;
  const firstReply = firstAttack && Array.isArray(record.decisionTrace) ?
    record.decisionTrace.find(row => row.playerSlot === candidateSeat &&
      row.actionOrdinal > firstAttack.actionOrdinal) : null;
  const relevantActions = actions?.filter(event =>
    event.action === 'UseAbilityAction' ||
    event.action === 'PlayCardAction' ||
    event.action === 'AttackAction' ||
    event.action === 'PassTurnAction') ?? null;
  const handPlayCount = name => relevantActions?.filter(event =>
    event.action === 'PlayCardAction' &&
    event.card === name).length ?? null;
  const abilityCount = name => relevantActions?.filter(event =>
    event.action === 'UseAbilityAction' &&
    event.ability === name).length ?? null;
  return {
    trialId:record.trialId,
    candidateId:record.candidateId,
    opponentRank:record.rank,
    candidatePhysicalSeat:candidateSeat,
    sourcePhysicalSeat:sourceSeat,
    actualCandidateStart:record.candidateTrueTurn ?? 'unverified',
    sourceFirstTurnFromLog:record.firstTurn?.verifiedByDrawLog === true ?
      record.firstTurn.firstTurnSlot === sourceSeat : null,
    engineStatus:record.status,
    seed:record.seed,
    sourceDigest:record.opponentDigest || null,
    candidateDigest:record.candidateDigest || null,
    sourceNativeRootAttackActions:ownRaw?.length ?? null,
    sourceLoggedAttackDeclarations:ownDeclarations?.length ?? null,
    sourceDeclaredAttacks:ownDeclarations?.map(event => ({
      name:event.attackName,turn:event.turnBefore,ordinal:event.actionOrdinal,
      initiatedBy:event.triggerAction,
      status:event.resolutionStatus ?? 'not-independently-verified'
    })) ?? null,
    candidateLoggedAttackDeclarations:candidateDeclarations?.length ?? null,
    sourcePlayCounts:relevantActions ? {
      'Path to the Peak':handPlayCount('Path to the Peak'),
      'Double Colorless Energy':handPlayCount('Double Colorless Energy'),
      'Karen':handPlayCount('Karen'),
      'Wally':handPlayCount('Wally'),
      'Mew VMAX':handPlayCount('Mew VMAX'),
      'Genesect V':handPlayCount('Genesect V')
    } : null,
    sourceFusionStrikeSystemUses:abilityCount('Fusion Strike System'),
    sourcePassCount:relevantActions?.filter(a =>
      a.action === 'PassTurnAction').length ?? null,
    sourceFirstAttackActionOrdinal:firstAttack?.actionOrdinal ?? null,
    firstCandidateRootReplyAfterSourceAttack:firstReply ? {
      turn:firstReply.turnBefore,ordinal:firstReply.actionOrdinal,
      action:firstReply.action,card:firstReply.card??null,
      attack:firstReply.attack??null,ability:firstReply.ability??null
    } : null,
    capturedSourceDecisions:actions?.length ?? null,
    actionBudgetReached:record.endReason === 'action-limit',
    engineTerminal:record.observedFinished === true,
    engineTerminalLabel:record.winner ?? null,
    error:record.error ?? null,
    independentEffectVerification:false,
    qualifiedForCompetitiveInference:false
  };
}

/**
 * @param {object} archive
 * @param {string[]} expectedIds Explicit preregistered accepted trial IDs.
 */
function summarizeSourceOpponent(archive, expectedIds) {
  if (archive?.purpose !== 'exploratory-engine-feasibility' ||
      archive.competitiveWinRateCertified !== false ||
      !Array.isArray(archive.records) ||
      !Array.isArray(archive.selectedTrialIds) ||
      !Array.isArray(expectedIds) || expectedIds.length === 0 ||
      expectedIds.length !== archive.records.length ||
      new Set(expectedIds).size !== expectedIds.length ||
      JSON.stringify(archive.selectedTrialIds) !== JSON.stringify(expectedIds) ||
      archive.records.some((record,index) => record.trialId !== expectedIds[index])) {
    throw new TypeError('Full predeclared source-opponent campaign archive required');
  }
  const rows = archive.records.map(sourceRecordBrief);
  const declared = rows.filter(row =>
    row.sourceLoggedAttackDeclarations !== null);
  return {
    schema:'source-opponent-root-action-brief-v1',
    seedProtocol:archive.seedProtocol,
    planDigest:archive.planDigest,
    observedProfile:archive.expectedPolicyProfile,
    declaredTrials:expectedIds.length,
    observedAttackChannels:declared.length,
    sourceTrialsWithLoggedAttack:declared.filter(row =>
      row.sourceLoggedAttackDeclarations > 0).length,
    sourceTrialsWithObservedNoAttack:declared.filter(row =>
      row.sourceLoggedAttackDeclarations === 0).length,
    attackChannelUnobserved:rows.length - declared.length,
    completedEngineGames:rows.filter(row =>
      row.engineStatus === 'completed').length,
    qualifiedCompetitiveGames:0,
    records:rows,
    caveat:'Real Store log declarations and observed actions only; no proof of attack completion, competent opponent choices, card-rule fidelity or actual tournament clock.'
  };
}

if (require.main === module) {
  if (process.argv.length < 3) {
    throw new Error('Provide the source campaign report JSON file');
  }
  const archive=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const expected=process.argv.slice(3).length ? process.argv.slice(3) :
    (process.env.CAMPAIGN_TRIAL_IDS || '').split(',').filter(Boolean);
  const brief=summarizeSourceOpponent(archive,expected);
  process.stdout.write(JSON.stringify(brief,null,2)+'\n');
}
module.exports={DECLARATION_PROTOCOL,sourceRecordBrief,summarizeSourceOpponent};
