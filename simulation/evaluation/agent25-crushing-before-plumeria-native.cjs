'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent25-retrospective-source-t3-crushing-before-plumeria-v1';
const ROOT = path.resolve(__dirname, '../..');
const FRAME = 'results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json';
const TARGET = '6:3:B:champion-reference';
const ORIGINAL_SOURCE_SHA =
  'e57fb601c6a81c7db88b4b469fc8b3246a04e43e2e942141ada30b7a6f8806ce';
const ORIGINAL_FULL_SHA =
  '26e55bed202c82a70a47e84b58d26b70ed7d2235a892352cb6309d7ce1a3f7c7';

/**
 * Passive original-Store owner-public/native canPlay read, captured before
 * actual card dispatch at the archived source player's global turn three.
 * Captures only selected public actions and this owner's hand identities.
 * Never changes a proposed action or uses hidden opponent cards.
 *
 * @template T
 * @param {()=>T} execute Synchronous original native Store experiment.
 * @param {{Ai?:Function,Store?:Function}} [deps] Injected native test prototypes.
 * @returns {{result:T,audit:{observed:object[]}}}
 */
function withSourceT3CrushingProbe(execute, deps = {}) {
  assert.equal(typeof execute, 'function');
  const base = path.resolve(ROOT, 'vendor/twinleaf/ptcg-server/output');
  const Ai = deps.Ai ?? require(path.join(base,
    'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store = deps.Store ?? require(path.join(base,
    'game/store/store')).Store;
  const oldDecode = Object.getOwnPropertyDescriptor(
    Ai.prototype, 'decodeNextAction');
  const oldDispatch = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  assert.equal(typeof oldDecode?.value, 'function');
  assert.equal(typeof oldDispatch?.value, 'function');
  const audit = {version: VERSION, observed: [], passive: true,
    competitiveQualifiedGames: 0};
  let liveStore = null;
  function decode(state) {
    const proposed = oldDecode.value.call(this, state);
    if (state !== liveStore?.state || state.turn !== 3 ||
        state.activePlayer !== 0 ||
        state.prompts?.some(p => p.result === undefined)) return proposed;
    const owner = state.players?.[0], opponent = state.players?.[1];
    if (!owner || !opponent || this.client?.id !== owner.id) return proposed;
    const cards = owner.hand.cards;
    const chosen = proposed?.constructor?.name === 'PlayCardAction' ?
      cards[proposed.handIndex]?.fullName ?? null : null;
    const hammer = cards.find(card =>
      card.fullName === 'Crushing Hammer POR');
    if (!hammer || !['Plumeria BUS','Crushing Hammer POR'].includes(chosen))
      return proposed;
    let canPlay = false, error = null;
    try {canPlay = hammer.canPlay(liveStore, state, owner) === true;}
    catch (caught) {error = String(caught?.message ?? caught);}
    const visibleEnergy = [opponent.active, ...opponent.bench]
      .filter(board => board?.getPokemonCard?.())
      .map(board => ({
        pokemon: board.getPokemonCard().fullName,
        energies: board.energies.cards.map(card => card.fullName)
      }));
    audit.observed.push({globalTurn: state.turn,sourceSeat: 0,
      proposedAction: proposed.constructor.name, chosenCard: chosen,
      crushingHeldCopies: cards.filter(card =>
        card.fullName === 'Crushing Hammer POR').length,
      plumeriaHeldCopies: cards.filter(card =>
        card.fullName === 'Plumeria BUS').length,
      enhancedHeldCopies: cards.filter(card =>
        card.fullName === 'Enhanced Hammer TWM').length,
      ownerHandCount: cards.length,
      nativeCanPlayCrushing: canPlay, nativeCanPlayError: error,
      ownerItemLocked: owner.cannotPlayItemCards === true,
      opponentVisibleEnergy: visibleEnergy});
    return proposed;
  }
  function dispatch(action, ...args) {
    if (action?.constructor?.name === 'AddPlayerAction') liveStore = this;
    return oldDispatch.value.apply(this, [action, ...args]);
  }
  Object.defineProperty(Ai.prototype, 'decodeNextAction',
    {...oldDecode, value: decode});
  Object.defineProperty(Store.prototype, 'dispatch',
    {...oldDispatch, value: dispatch});
  try {return {result: execute(), audit};}
  finally {
    assert.strictEqual(Ai.prototype.decodeNextAction, decode);
    assert.strictEqual(Store.prototype.dispatch, dispatch);
    Object.defineProperty(Store.prototype, 'dispatch', oldDispatch);
    Object.defineProperty(Ai.prototype, 'decodeNextAction', oldDecode);
  }
}

/** @param {object} observed Runner output. @returns {object} */
function describeTrial(observed) {
  return observed.rows.map(row => {
    const own = row.rootActionLedger?.filter(action =>
      action.playerSlot === row.sourceSeat &&
      action.turnBefore === 3 &&
      action.pendingPrompt === null) ?? [];
    const opponent = row.rootActionLedger?.filter(action =>
      action.playerSlot !== row.sourceSeat && action.turnBefore >= 3 &&
      action.pendingPrompt === null).slice(0, 8) ?? [];
    const sourceHammer = row.actorOnlyDecisionCoverage
      ?.ownerHammerAfterPassAudit ?? null;
    return {id: row.trial.id, status: row.status ?? 'native-return',
      finished: row.finished, winner: row.winner ?? null,
      actualStarterSeat: row.actualStarterSeat,
      sourceSeat: row.sourceSeat,
      sourceDealFingerprint: row.sourceDealFingerprint ?? null,
      fullPhysicalDealFingerprint: row.fullPhysicalDealFingerprint ?? null,
      sourceT3: own.map(action => ({
        ordinal: action.actionOrdinal, kind: action.action,
        card: action.card ?? null, attack: action.attack ?? null
      })),opponentContinuation: opponent.map(action => ({
        ordinal: action.actionOrdinal,turn: action.turnBefore,
        kind: action.action, card: action.card ?? null,
        attack: action.attack ?? null
      })),
      hammerAccepted: sourceHammer?.acceptedHammerRoots ?? null,
      hammerEnergyDiscarded: sourceHammer?.acceptedEnergyDiscards ?? null,
      plumeriaAccepted: row.actorOnlyDecisionCoverage
        ?.ownerPlumeriaAfterPassAudit?.acceptedPlumeria ?? null,
      qualified: false};
  });
}

/**
 * Replays already-observed source-selected T3 cases.
 * Paired candidate list IDs are required by the existing runner. Original
 * archived source and entire physical-deal digests stay as hard witnesses.
 * An omitted or divergent root is recorded, never turned into an outcome.
 * @returns {object} Native development-only comparison and full raw arms.
 */
function runRetrospectiveT3() {
  const originalEnv = process.env.AGENT29_HAMMER_AFTER_PASS_DEV;
  const frame = require(path.join(ROOT, FRAME));
  const planned = require('./agent41-prospective-canonical-scout.cjs')
    .plannedTrials(frame);
  const trials = planned.filter(t =>
    t.rank === 6 && t.repeat === 3 && t.candidateSlot === 'B');
  assert.equal(trials.length, 2);
  assert.ok(trials.some(t => t.id === TARGET));
  assert.ok(trials.every(t => t.seed === 861838028));
  const {runDevelopment} =
    require('./agent41-bilateral-v2-development.cjs');
  const {withOwnerPlumeriaAfterPass} =
    require('../twinleaf/agent4-plumeria-after-pass.cjs');
  const options = {...frame.frozenRunOptions, registeredTrials: trials,
    registeredFrameName: FRAME, actorPlumeriaAfterPass: true};
  let control, treatment;
  try {
    process.env.AGENT29_HAMMER_AFTER_PASS_DEV = 'false';
    control = withSourceT3CrushingProbe(() =>
      runDevelopment(options));
    process.env.AGENT29_HAMMER_AFTER_PASS_DEV = 'true';
    treatment = withSourceT3CrushingProbe(() =>
      withOwnerPlumeriaAfterPass(() =>
        runDevelopment({...options, actorPlumeriaAfterPass: false})));
  } finally {
    if (originalEnv === undefined)
      delete process.env.AGENT29_HAMMER_AFTER_PASS_DEV;
    else process.env.AGENT29_HAMMER_AFTER_PASS_DEV = originalEnv;
  }
  const baseline = control.result;
  const treated = treatment.result.result;
  assert.equal(baseline.attempted, 2);
  assert.equal(treated.attempted, 2);
  assert.equal(baseline.competitiveQualifiedGames, 0);
  assert.equal(treated.competitiveQualifiedGames, 0);
  const comparisons = baseline.rows.map((row, index) => {
    const changed = treated.rows[index];
    assert.equal(row.trial.id, changed.trial.id);
    const originalTarget = row.trial.id === TARGET;
    return {trialId: row.trial.id,baselineStatus: row.status ?? null,
      treatedStatus: changed.status ?? null,
      sameActualStarter: row.actualStarterSeat === changed.actualStarterSeat,
      sameSourceDeal: Boolean(row.sourceDealFingerprint &&
        row.sourceDealFingerprint === changed.sourceDealFingerprint),
      sameFullDeal: Boolean(row.fullPhysicalDealFingerprint &&
        row.fullPhysicalDealFingerprint === changed.fullPhysicalDealFingerprint),
      originalSourceMatched: originalTarget &&
        row.sourceDealFingerprint === ORIGINAL_SOURCE_SHA,
      originalFullMatched: originalTarget &&
        row.fullPhysicalDealFingerprint === ORIGINAL_FULL_SHA,
      referencePlumeriaAtRoot29: originalTarget && Boolean(
        row.rootActionLedger?.some(action =>
          action.actionOrdinal === 29 && action.playerSlot === 0 &&
          action.turnBefore === 3 && action.card === 'Plumeria')),
      noCompetitiveInference: true};
  });
  return {version: VERSION, selectedAfterOriginalSourceObservation: true,
    experimentalOrder: 'Crushing Hammer inner before outer Plumeria',
    twinleafPin: frame.enginePin, sourceFieldRanks: [6],
    expectedOriginalTrial: TARGET, originalSourceSHA: ORIGINAL_SOURCE_SHA,
    originalFullSHA: ORIGINAL_FULL_SHA,
    trials: comparisons,
    controlProbe: control.audit, treatmentProbe: treatment.audit,
    outerPlumeriaTreatmentAudit: treatment.result.audit,
    controlSummary: describeTrial(baseline),
    treatmentSummary: describeTrial(treated),
    baseline, treated,
    competitiveQualifiedGames: 0,
    caveat: 'Retrospective source-selected two-list native policy mechanics; the existing after-Pass Hammer adapter may attempt more than one held Hammer on successive root Passes before Plumeria, so this is priority ordering rather than a controlled exactly-one-coin causal intervention. Target may not be reached; native failures remain recorded. Not a randomized prospective field comparison.'};
}

if (require.main === module)
  process.stdout.write(JSON.stringify(runRetrospectiveT3(), null, 2) + '\n');

module.exports = {VERSION,TARGET,withSourceT3CrushingProbe,
  describeTrial,runRetrospectiveT3};
