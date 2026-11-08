'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {randomUUID} = require('node:crypto');
const v1 = require('./agent36-v8-snap-trap-vertical-slice-v1.cjs');
const {runSelectedIssue25V0} =
  require('./agent36-issue25-selected-v0.cjs');
const {runDevelopment} =
  require('./agent41-bilateral-v2-development.cjs');
const {withStewardOwnerPromptFrontier} =
  require('./agent36-issue25-steward-selected-v4.cjs');
const {withStewardInnermostOwnerPrompts} =
  require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const {withCommonOwnerThornsRoot} =
  require('./agent36-issue25-common-v6.cjs');
const {withOwnerVoltAcrossNativeMatches} =
  require('./agent36-issue25-common-v7.cjs');
const {withSnapTrapInsideNativeMatchesV3} =
  require('../twinleaf/agent36/snap-trap-native-match-integration-v3.cjs');

const VERSION = 'agent43-v8-snaptrap-exact-prompt-blocker-v1';
const ROOT_LIMIT = 260;
const ROOT = path.resolve(__dirname, '../..');
const REGISTRATION =
  require('../../results/aichi-2026/registrations/agent36-v8-snap-trap-vertical-slice-v1-20261108.json');

/**
 * Identify prompt zones by container identity alone. Nothing enumerates hidden
 * deck/hand/Prize cards to characterize an untrusted source zone.
 * @param {object} prompt
 * @param {object[]} players
 * @returns {string}
 */
function promptZone(prompt, players) {
  for (let seat = 0; seat < players.length; seat++) {
    const player = players[seat];
    for (const key of ['hand', 'deck', 'prizes', 'discard', 'lostZone']) {
      if (prompt?.cards === player?.[key]) return 'seat' + seat + '-' + key;
    }
    if (prompt?.cards === player?.active) return 'seat' + seat + '-active';
    for (let i = 0; i < (player?.bench?.length ?? 0); i++) {
      if (prompt?.cards === player.bench[i])
        return 'seat' + seat + '-bench-' + i;
    }
  }
  return 'unclassified';
}

/**
 * Snapshot only the structural public options in a single emitted prompt.
 * @param {object} store
 * @param {object} prompt
 * @param {string|null} trialId
 * @param {object} gameMessages
 */
function safePrompt(store, prompt, trialId, gameMessages) {
  const state = store?.state;
  const players = Array.isArray(state?.players) ? state.players : [];
  const sameId = (left, right) => left != null && right != null &&
    String(left) === String(right);
  const controllerSeat = players.findIndex(x => sameId(x.id, prompt?.playerId));
  const resourceSeat = players.findIndex(x =>
    x === prompt?.player || sameId(x.id, prompt?.player?.id));
  const o = prompt?.options ?? {};
  const message = Object.entries(gameMessages)
    .find(([name, value]) => !/^\d+$/.test(name) && value === prompt?.message);
  return {
    trialId,
    promptId: prompt?.id == null ? null : String(prompt.id),
    promptType: prompt?.constructor?.name ?? null,
    message: message?.[0] ?? (typeof prompt?.message === 'string'
      ? prompt.message : null),
    turn: Number.isSafeInteger(state?.turn) ? state.turn : null,
    phase: state?.phase ?? null,
    controllerSeat: controllerSeat < 0 ? null : controllerSeat,
    resourceOwnerSeat: resourceSeat < 0 ? null : resourceSeat,
    activeSeat: Number.isSafeInteger(state?.activePlayer)
      ? state.activePlayer : null,
    min: Number.isSafeInteger(o.min ?? prompt?.min) ? (o.min ?? prompt?.min) : null,
    max: Number.isSafeInteger(o.max ?? prompt?.max) ? (o.max ?? prompt?.max) : null,
    allowCancel: typeof (o.allowCancel ?? prompt?.allowCancel) === 'boolean'
      ? (o.allowCancel ?? prompt?.allowCancel) : null,
    isSecret: typeof (o.isSecret ?? prompt?.isSecret) === 'boolean'
      ? (o.isSecret ?? prompt?.isSecret) : null,
    offeredCount: Array.isArray(prompt?.cards) ? prompt.cards.length
      : Array.isArray(prompt?.cards?.cards) ? prompt.cards.cards.length : null,
    sourceZone: promptZone(prompt, players),
    sourceCardPresent: prompt?.sourceCard != null,
    noCardIdentitiesRead: true
  };
}

/**
 * Observe only native Store.prompt creation, preserving every real action.
 * @param {()=>any} run
 * @param {{Store:Function,GameMessage:object,byStore:WeakMap,events:object[]}} deps
 */
function withExactRegisteredPromptTrace(run, deps) {
  const {Store, GameMessage, byStore, events} = deps;
  const old = Object.getOwnPropertyDescriptor(Store.prototype, 'prompt');
  assert.equal(typeof old?.value, 'function');
  const wrapped = function(...args) {
    const requested = Array.isArray(args[1]) ? args[1] : [args[1]];
    const response = old.value.apply(this, args);
    for (const prompt of requested) {
      if (!prompt) continue;
      events.push(safePrompt(
        this, prompt, byStore.get(this) ?? null, GameMessage
      ));
    }
    return response;
  };
  Object.defineProperty(Store.prototype, 'prompt', {...old, value: wrapped});
  try { return run(); }
  finally {
    assert.strictEqual(Store.prototype.prompt, wrapped);
    Object.defineProperty(Store.prototype, 'prompt', old);
  }
}

/** @param {object} x */
function compactRoot(x) {
  return {
    ordinal: x.ordinal,
    action: x.action,
    seat: x.seat,
    turn: x.turn,
    promptId: x.promptId,
    responseType: x.responseType
  };
}

/**
 * Identify genuinely unresolved prompts by ID on the exact registered Store,
 * after considering accepted ResolvePromptAction roots from that Store.
 * @param {object[]} events
 * @param {object[]} roots
 * @param {string} trialId
 */
function pendingByTrial(events, roots, trialId) {
  const settled = new Set(
    roots.filter(x => x.trialId === trialId &&
        x.action === 'ResolvePromptAction' && x.promptId !== null)
      .map(x => x.promptId)
  );
  return events.filter(x => x.trialId === trialId &&
    x.promptId !== null && !settled.has(x.promptId));
}

/**
 * Reproduce the original Snap Trap game frame with a passive prompt observer.
 * Explicit treatment is a single verified owner-ability-confirm policy hook.
 * @param {{ownerAbilityConfirm?:boolean,energyRecipient?:boolean,ownerMailAfterPass?:boolean,captureRootTape?:boolean}} [settings]
 */
function run(settings = {}) {
  const ownerAbilityConfirm = settings.ownerAbilityConfirm === true;
  const energyRecipient = settings.energyRecipient === true;
  const ownerMailAfterPass = settings.ownerMailAfterPass === true;
  const registeredTrials = v1.trials();
  assert.equal(registeredTrials.length, 4);
  assert.equal(REGISTRATION.registeredFrameName,
    'agent36-selected-v8-common-policy-snap-trap-owner-prompt-two-seeds-both-seats-260root-v1');
  const headless = require('../twinleaf/headless.cjs');
  const output = path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const {Store} = require(path.join(output, 'game/store/store'));
  const {GameMessage} = require(path.join(output, 'game/game-message'));
  const trace = {byStore: new WeakMap(), events: [], roots: []};
  const acceptedMailActionRefs = new WeakSet();
  const onRootStoreCreated = (store, trialId) => {
    trace.byStore.set(store, trialId);
  };
  const onRootActionDispatched = (store, action, ordinal, seat, turn) => {
    trace.roots.push({
      trialId: trace.byStore.get(store) ?? null,
      ordinal,
      action: action?.constructor?.name ?? null,
      ownerMailAfterPassAction: acceptedMailActionRefs.has(action),
      seat, turn,
      promptId: action?.constructor?.name === 'ResolvePromptAction'
        ? String(action.id) : null,
      responseType: action?.constructor?.name === 'ResolvePromptAction'
        ? (Array.isArray(action.result) ? 'array' : typeof action.result) : null
    });
  };
  let selectedResult = null, ownerAbilityConfirmAudit = null, ownerMailAudit = null;
  const execute = () => withCommonOwnerThornsRoot(() => {
    selectedResult = runSelectedIssue25V0({
      runner: options => {
        const executeDevelopment = () => runDevelopment({
        ...options,
        actorOnlyComposition: true,
        sourceIndependentCommonPolicy: true,
        bilateralSpecialEnergyRoot: true,
        bilateralBasicEnergyRecipientFrontier: energyRecipient,
        nativeAcceptedTargets: true,
        nativeRootActionLimit: ROOT_LIMIT,
        registeredTrials: registeredTrials.map(t => ({...t})),
        registeredFrameName: REGISTRATION.registeredFrameName,
        allowAdditionalOriginalSourceRanks: true,
        allowSingleCandidatePerGroup: true,
        capturePublicAttackTransitions: true,
        nativeSetupCoinChoiceReceipt: true,
        isolatePolicyRandomness: true,
        isolatePhysicalShuffleRandomnessAfterSetup: true,
        onRootStoreCreated,
        onRootActionDispatched
        });
        const withConfirmation = () => {
          if (!ownerAbilityConfirm) return executeDevelopment();
          const observed =
            require('../twinleaf/agent36-owner-ability-confirm-policy.cjs')
              .withOwnerAbilityConfirmPolicy(executeDevelopment);
          ownerAbilityConfirmAudit = observed.audit;
          return observed.result;
        };
        if (!ownerMailAfterPass) return withConfirmation();
        const native = relative => require(path.join(output, relative));
        const mail = require('../twinleaf/agent38-v8-four-arm-owner-mail-native.cjs')
          .withBilateralOwnerMail(withConfirmation, {
            headless,
            SimpleTacticsAi: native('simple-bot/simple-tactics-ai').SimpleTacticsAi,
            Store,
            PlayCardAction: native('game/store/actions/play-card-action').PlayCardAction,
            ResolvePromptAction: native('game/store/actions/resolve-prompt-action').ResolvePromptAction,
            types: native('game/store/card/card-types'),
            trialIds: registeredTrials.map(t => t.id),
            onMailActionCommitted: action => acceptedMailActionRefs.add(action)
          });
        ownerMailAudit = mail.audit;
        return mail.result;
      },
      layers: {firstBlockedPromptEnvelope: withStewardOwnerPromptFrontier},
      registeredTrialIds: registeredTrials.map(t => t.id),
      nativeRootActionLimit: ROOT_LIMIT
    });
    return selectedResult;
  });
  const wrapped = () => withSnapTrapInsideNativeMatchesV3(() =>
    withOwnerVoltAcrossNativeMatches(() =>
      withStewardInnermostOwnerPrompts(execute, {headless}), {headless}
    ).result.result, {headless}
  );
  const result = withExactRegisteredPromptTrace(wrapped, {
    Store, GameMessage, byStore: trace.byStore, events: trace.events
  });
  const selected = selectedResult ?? result?.result;
  const rawRows = selected?.rawDevelopment?.rows ?? [];
  const attempts = registeredTrials.map(t => {
    const row = rawRows.find(x => (x.trial?.id ?? x.id) === t.id) ?? {};
    const prompts = trace.events.filter(x => x.trialId === t.id);
    const roots = trace.roots.filter(x => x.trialId === t.id);
    const pending = pendingByTrial(trace.events, trace.roots, t.id);
    return {
      id: t.id,
      sourceSeat: t.candidateSlot === 'A' ? 1 : 0,
      candidateSeat: t.candidateSlot === 'A' ? 0 : 1,
      seed: t.seed,
      nativeFailureStage: row.nativeAbortEvidence?.failureStage ?? null,
      nativeFailureActionOrdinal: row.nativeAbortEvidence?.actionOrdinal ?? null,
      nativeFailureActingSeat: row.nativeAbortEvidence?.actingSeat ?? null,
      nativeFailureTurn: row.nativeAbortEvidence?.turnBefore ?? null,
      selectedReturnedRow: Object.keys(row).length > 0,
      nativeStatus: row.status ?? null,
      nativeFinished: row.finished ?? null,
      nativeWinner: row.finished === true ? row.winner ?? null : null,
      nativeEndReason: row.endReason ?? null,
      nativeTurnCount: row.turns ?? null,
      nativeFinalPrizes: row.finalPrizes ?? null,
      nativeFinalPublicBoard: row.finalBoard ?? null,
      nativeActionCount: row.actionCount ?? null,
      nativeRootActionMix: Array.isArray(row.rootActionLedger) ?
        row.rootActionLedger.reduce((map, root) => {
          const key = String(root.playerSlot) + ':' + String(root.action);
          map[key] = (map[key] ?? 0) + 1;
          return map;
        }, {}) : {},
      nativeFinalThirtyPublicRoots: Array.isArray(row.rootActionLedger) ?
        row.rootActionLedger.slice(-30).map(root => ({
          actionOrdinal: root.actionOrdinal,
          turnBefore: root.turnBefore,
          playerSlot: root.playerSlot,
          action: root.action,
          card: root.card ?? null,
          attack: root.attack ?? null,
          pendingPromptId: root.pendingPromptId ?? null
        })) : [],
      promptCount: prompts.length,
      acceptedRootCount: roots.length,
      recentPromptEvents: prompts.slice(-8),
      pendingPrompts: pending.slice(-8),
      recentAcceptedRoots: roots.slice(-12).map(compactRoot)
    };
  });
  return {
    schema: VERSION,
    originalFrameName: REGISTRATION.registeredFrameName,
    exactOriginalTrialIds: registeredTrials.map(t => t.id),
    preservedNativeRootCap: ROOT_LIMIT,
    changedDecisions: ownerMailAfterPass ? null : false,
    observedPromptEvents: trace.events.length,
    observedRootActions: trace.roots.length,
    publicRootTape: settings.captureRootTape === true ? trace.roots : null,
    experimentalOwnerAbilityConfirm: ownerAbilityConfirm,
    experimentalBasicEnergyRecipient: energyRecipient,
    experimentalOwnerMailAfterPass: ownerMailAfterPass,
    ownerMailAudit: ownerMailAudit === null ? null : {
      version: ownerMailAudit.schema,
      registeredTrialIds: ownerMailAudit.trialIds,
      attempts: ownerMailAudit.attempts,
      ownerRootPassesSeen: ownerMailAudit.ownerRootPassesSeen,
      proposalCountsBySeat: ownerMailAudit.proposalCountsBySeat,
      actualMailItemRootsBySeat: ownerMailAudit.actualMailItemRootsBySeat,
      nativeOwnerTop4PromptsBySeat: ownerMailAudit.nativeOwnerTop4PromptsBySeat,
      nativeStoreResolvedBySeat: ownerMailAudit.nativeStoreResolvedBySeat,
      physicalTrainerToHandBySeat: ownerMailAudit.physicalTrainerToHandBySeat,
      physicalOtherTopCardsToDeckBySeat:
        ownerMailAudit.physicalOtherTopCardsToDeckBySeat,
      noPromptAfterMailBySeat: ownerMailAudit.noPromptAfterMailBySeat,
      rejectedPromptActions: ownerMailAudit.rejectedPromptActions,
      unsettledPromptActions: ownerMailAudit.unsettledPromptActions,
      actualMailEvents: ownerMailAudit.actualMailEvents,
      revealedTrainers: ownerMailAudit.revealedTrainers,
      opponentPrivateZonesRead: ownerMailAudit.opponentPrivateZonesRead,
      competitiveGamesQualified: 0
    },
    ownerAbilityConfirmAudit: ownerAbilityConfirmAudit === null ? null : {
      version: ownerAbilityConfirmAudit.version,
      confirmOffers: ownerAbilityConfirmAudit.confirmOffers,
      confirmSettled: ownerAbilityConfirmAudit.confirmSettled,
      confirmUnsettled: ownerAbilityConfirmAudit.confirmUnsettled,
      confirmEvents: ownerAbilityConfirmAudit.confirmEvents,
      radiantSearchOffers: ownerAbilityConfirmAudit.radiantSearchOffers,
      radiantSearchEvents: ownerAbilityConfirmAudit.radiantSearchEvents,
      articunoMoveEnergyEvents: ownerAbilityConfirmAudit.articunoMoveEnergyEvents
    },
    rawStateDecoderExecuted: selected?.diagnostic?.rawDecoderExecuted ?? null,
    nativeQuarantineFallbackCalls: selected?.diagnostic?.fallbackCalls ?? null,
    nativeQuarantineRecords:
      selected?.diagnostic?.audit?.nativeRawStateQuarantine?.records ?? [],
    originalBlockedPromptEnvelopes:
      selected?.diagnostic?.fallbackPromptEnvelopes ?? [],
    attempts,
    blockedAttemptCount: attempts.filter(x => x.nativeFailureStage === 'bot-decoder').length,
    competitiveGamesQualified: 0,
    estimatedWinRate: null
  };
}

/** @param {object} report */
function writeReport(report) {
  const dir = path.join(ROOT, 'artifacts/agent43-v8-snaptrap-owner-root');
  fs.mkdirSync(dir, {recursive: true});
  const target = path.join(dir, 'exact-prompt.json');
  const lock = target + '.lock';
  const fd = fs.openSync(lock, 'wx');
  const temp = target + '.' + process.pid + '.' + randomUUID() + '.tmp';
  try {
    fs.writeFileSync(temp, JSON.stringify(report, null, 2) + '\n', {flag:'wx'});
    fs.renameSync(temp, target);
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
  return target;
}
if (require.main === module) {
  const report = run();
  const target = writeReport(report);
  process.stdout.write(JSON.stringify({
    schema: VERSION,
    target,
    originalTrialCount: report.exactOriginalTrialIds.length,
    nativeQuarantineFallbackCalls: report.nativeQuarantineFallbackCalls,
    blockedAttemptCount: report.blockedAttemptCount,
    attempts: report.attempts.filter(x =>
      x.nativeFailureStage === 'bot-decoder'
    ),
    competitiveGamesQualified: 0
  }, null, 2) + '\n');
  if (report.blockedAttemptCount !== 2) process.exitCode = 1;
}
module.exports = {VERSION, ROOT_LIMIT, promptZone, safePrompt,
  withExactRegisteredPromptTrace, pendingByTrial, run, writeReport};
