'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { runMatch, initializeCards } = require('../twinleaf/headless.cjs');
const { planAichi } = require('./aichi-pilot.cjs');
const { deriveSlotSeeds } = require('../../scripts/aichi-decorrelated-seeds.cjs');
const { actorObservation, publicPlayer } =
  require('../twinleaf/actor-observation-contract.cjs');
const { trainerPrintCatalog } =
  require('../twinleaf/agent5-generic-owner-trainer-opportunity.cjs');
const { chooseOwnerStadiumAfterPass, VERSION: BRIDGE_VERSION } =
  require('../twinleaf/agent7-owner-stadium-pass-bridge.cjs');

const REGISTRATION = require('../../results/aichi-2026/registrations/agent7-original6v9-own-stadium-pass-retro-20261103.json');
const OUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const native = name => require(path.join(OUT, name));

/** @param {object} state @param {0|1} ownerSeat */
function publicReceipt(state, ownerSeat) {
  const own = publicPlayer(state.players[ownerSeat]);
  const opponent = publicPlayer(state.players[1 - ownerSeat]);
  return {
    turn: state.turn,
    activePlayer: state.activePlayer,
    own: {
      stadium: own.stadium,
      discard: own.discard,
      lostZone: own.lostZone,
      active: own.active?.printing ?? null,
      activeEnergy: own.active?.energies ?? [],
      bench: own.bench.filter(Boolean).map(p => p.printing),
      prizeCount: own.prizeCount
    },
    opponent: {
      stadium: opponent.stadium,
      active: opponent.active?.printing ?? null,
      activeEnergy: opponent.active?.energies ?? [],
      prizeCount: opponent.prizeCount
    }
  };
}

/**
 * Scoped, reversible owner-only paper Stadium action after the native Pass.
 * This is a retrospective native-bot counterfactual. The native bot itself
 * remains unqualified and may use speculative information; intervention
 * eligibility and card selection use only detached owner-visible state.
 *
 * @template T
 * @param {()=>T} play Run exactly one native game synchronously.
 * @param {object} deps Pinned native types and a preregistered fixture.
 * @returns {{result:T,audit:object}}
 */
function withSelectedSourceStadium(play, deps) {
  const { Store, SimpleTacticsAi, GamePhase, PlayCardAction,
    PlayerType, SlotType, ActionEnumerator, catalog, fixture } = deps;
  assert.equal(typeof play, 'function');
  const priorAi = Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype, 'decodeNextAction');
  const priorStore = Object.getOwnPropertyDescriptor(
    Store.prototype, 'dispatch');
  assert.equal(typeof priorAi?.value, 'function');
  assert.equal(typeof priorStore?.value, 'function');
  const nativeEnumerator = new ActionEnumerator();
  const selectedActions = new WeakMap();
  const audit = {
    bridgeVersion: BRIDGE_VERSION,
    fixtureId: fixture.id, actorSeat: fixture.sourceSeat,
    targetTurn: fixture.sourceTurn,
    observedTargetNativeRoots: [],
    selectedRoots: 0,
    dispatches: [],
    postSelectedStoreEvents: [],
    alternativePaperValidity: 'not-encountered',
    selectedNativeStore: 'not-dispatched',
    competitiveQualifiedGames: 0
  };
  let liveStore = null;
  let selected = false;

  function trackedDecode(state, ...args) {
    const seat = state?.activePlayer;
    const owner = state?.players?.[seat];
    const realOwnerRoot = liveStore &&
      state === liveStore.state &&
      seat === fixture.sourceSeat &&
      owner?.id === this.client?.id &&
      state.phase === GamePhase.PLAYER_TURN &&
      !state.prompts.some(prompt => prompt.result === undefined);
    if (!realOwnerRoot) return priorAi.value.call(this, state, ...args);

    const view = actorObservation(state, seat);
    const nativeAction = priorAi.value.call(this, state, ...args);
    const nativeIsPass = nativeAction?.constructor?.name === 'PassTurnAction';
    const check = chooseOwnerStadiumAfterPass(
      view, catalog, fixture, nativeIsPass);
    if (view.globalTurn === fixture.sourceTurn) {
      const index = view.ownHand.indexOf(fixture.ownerHeldReplacement);
      const nativeOffered = new ActionEnumerator()
        .enumerate(state, owner, owner.id)
        .some(a => a instanceof PlayCardAction && a.handIndex === index && index >= 0);
      audit.observedTargetNativeRoots.push({
        globalTurn: view.globalTurn, seat,
        nativeAction: nativeAction?.constructor?.name ?? null,
        nativeIsPass, nativeOffered,
        candidateHandIndex: index,
        heldPhysicalRegisteredIndex: index === fixture.heldPhysicalHandIndex,
        ownStadium: view.ownPublic.stadium,
        opponentStadium: view.opponentPublic.stadium,
        lastStadiumTurn: view.ownTurnResources.stadiumPlayedTurn,
        stadiumLocked: view.ownTurnResources.stadiumPlayLocked,
        paperGate: check.reason,
        eligible: check.eligible
      });
    }
    if (!selected && check.eligible) {
      selected = true;
      audit.selectedRoots++;
      audit.alternativePaperValidity = 'name-quota-lock-hand-index-verified';
      const action = new PlayCardAction(owner.id, check.handIndex, {
        player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
      });
      const receipt = {
        globalTurn: view.globalTurn, seat,
        originalNativeChoice: 'PassTurnAction',
        selectedAction: 'PlayCardAction',
        originalStadium: check.oldStadium,
        replacement: check.newStadium,
        handIndex: check.handIndex,
        before: publicReceipt(state, seat),
        nativeStore: 'not-dispatched'
      };
      audit.dispatches.push(receipt);
      selectedActions.set(action, receipt);
      return action;
    }
    return nativeAction;
  }

  function trackedStoreDispatch(action, ...args) {
    const receipt = selectedActions.get(action);
    const isRealStore = this === liveStore;
    const priorState = isRealStore && selected ?
      publicReceipt(this.state, fixture.sourceSeat) : null;
    const actionName = action?.constructor?.name ?? null;
    let result;
    try {
      result = priorStore.value.call(this, action, ...args);
    } catch (error) {
      if (receipt) {
        receipt.nativeStore = 'rejected';
        receipt.error = String(error?.message ?? error);
        audit.selectedNativeStore = 'rejected';
      }
      if (isRealStore && selected && audit.postSelectedStoreEvents.length < 110) {
        audit.postSelectedStoreEvents.push({
          action: actionName, state: 'rejected',
          before: priorState, error: String(error?.message ?? error)
        });
      }
      throw error;
    }

    if (!liveStore && actionName === 'AddPlayerAction' &&
        this.state.players?.length === 1 &&
        this.state.players[0].id === 101) {
      liveStore = this;
    }

    if (receipt) {
      receipt.nativeStore = 'accepted';
      audit.selectedNativeStore = 'accepted';
      receipt.after = publicReceipt(this.state, fixture.sourceSeat);
      receipt.originalInOwnLostZone =
        receipt.after.own.lostZone.includes(fixture.sourceOriginal);
      receipt.originalInOwnDiscard =
        receipt.after.own.discard.includes(fixture.sourceOriginal);
      receipt.replacementOnOwnStadium =
        receipt.after.own.stadium.includes(fixture.ownerHeldReplacement);
    }
    if (isRealStore && selected && audit.postSelectedStoreEvents.length < 110) {
      audit.postSelectedStoreEvents.push({
        action: actionName,
        clientId: action?.clientId ?? null,
        fromTurn: priorState?.turn ?? null,
        state: 'accepted',
        after: publicReceipt(this.state, fixture.sourceSeat)
      });
    }
    return result;
  }

  Object.defineProperty(SimpleTacticsAi.prototype, 'decodeNextAction',
    { ...priorAi, value: trackedDecode });
  Object.defineProperty(Store.prototype, 'dispatch',
    { ...priorStore, value: trackedStoreDispatch });
  try {
    const result = play();
    return { result, audit };
  } finally {
    Object.defineProperty(Store.prototype, 'dispatch', priorStore);
    Object.defineProperty(SimpleTacticsAi.prototype, 'decodeNextAction', priorAi);
  }
}

/** @param {object} result Completed or censored native match */
function digestResult(result) {
  return createHash('sha256').update(JSON.stringify({
    deckHashes: result.deckHashes,
    firstTurnSlot: result.firstTurnSlot,
    fullDeal: result.initialFullPhysicalDealFingerprint,
    decisionTrace: result.decisionTrace,
    rootActionLedger: result.rootActionLedger,
    finished: result.finished,
    winner: result.winner
  })).digest('hex');
}

/** Execute every registered arm and retain errors without selection. */
function run() {
  assert.equal(REGISTRATION.originalRanks.join(','), '6,9');
  const manager = initializeCards();
  const rank6 = planAichi(6, {
    allowEquivalentBasicEnergies: true, allowJapanesePromoHooks: true
  });
  const deck6 = rank6.candidate.cards;
  const deck9 = rank6.opponents.find(row => row.rank === 9)?.cards;
  assert.equal(deck6.length, 60);
  assert.equal(deck9.length, 60);

  const { Store } = native('game/store/store');
  const { SimpleTacticsAi } = native('simple-bot/simple-tactics-ai');
  const { GamePhase } = native('game/store/state/state');
  const { PlayCardAction, PlayerType, SlotType } =
    native('game/store/actions/play-card-action');
  const { TrainerCard } = native('game/store/card/trainer-card');
  const { TrainerType } = native('game/store/card/card-types');
  const { ActionEnumerator } = native('advanced-bot/action-enumerator');
  const catalog = trainerPrintCatalog(manager.getAllCards(), {
    TrainerCard, TrainerType
  });

  const seeds = deriveSlotSeeds(20261114, 'pilot', 6, 0);
  assert.deepEqual(seeds, REGISTRATION.physicalSeedPlan.slots);
  const rows = [];
  for (const fixture of REGISTRATION.registeredCases) {
    const seat = fixture.primaryRankSeat;
    const deckA = seat === 0 ? deck6 : deck9;
    const deckB = seat === 0 ? deck9 : deck6;
    const request = {
      deckA, deckB, seed: seeds[fixture.slot], maxActions: 90,
      strictPromptValidation: true, isolatePolicyRandomness: true,
      captureDecisionTrace: true, captureInitialFullPhysicalDeal: true,
      label: 'agent7-original6v9-stadium-intervention-' + fixture.slot
    };
    const capture = (name, play) => {
      try {
        return { arm: name, status: 'executed', payload: play() };
      } catch (error) {
        return { arm: name, status: 'native-error',
          error: String(error?.stack ?? error) };
      }
    };
    const original = capture('native-control', () => runMatch(request));
    const intervention = capture('paper-stadium-after-pass', () =>
      withSelectedSourceStadium(() => runMatch(request), {
        Store, SimpleTacticsAi, GamePhase, PlayCardAction,
        PlayerType, SlotType, ActionEnumerator, catalog, fixture
      }));
    const repeated = capture('native-control-repeat', () => runMatch(request));
    const control = original.payload, selected = intervention.payload?.result;
    const repeat = repeated.payload;
    const fingerprints = [control, selected, repeat].map(game =>
      game?.initialFullPhysicalDealFingerprint?.digestSha256 ?? null);
    const parity = {
      controlsEqual: !!control && !!repeat &&
        digestResult(control) === digestResult(repeat),
      allPhysicalDealsEqual: fingerprints.every(x =>
        x !== null && x === fingerprints[0]),
      equalsRegisteredPreviousSourceDeal: fingerprints[0] ===
        fixture.previousSourcePhysicalDealSha256,
      fingerprints,
      controlDecisionSha256: control ? digestResult(control) : null,
      repeatedControlDecisionSha256: repeat ? digestResult(repeat) : null,
      selectedDecisionSha256: selected ? digestResult(selected) : null
    };
    const compact = obj => obj ? ({
      finished: obj.finished, winner: obj.winner,
      firstTurnSlot: obj.firstTurnSlot, nativeActions: obj.decisionTrace?.length ?? null,
      fullPhysicalDealSha256:
        obj.initialFullPhysicalDealFingerprint?.digestSha256 ?? null,
      rootActionLedger: obj.rootActionLedger ?? null,
      decisionTrace: obj.decisionTrace ?? null
    }) : null;
    rows.push({
      fixtureId: fixture.id, seed: request.seed, sourceRank: fixture.sourceRank,
      sourceSeat: fixture.sourceSeat, primaryRankSeat: fixture.primaryRankSeat,
      initialRegistration: fixture, parity,
      controls: {
        first: { status: original.status, error: original.error ?? null,
          result: compact(control) },
        repeat: { status: repeated.status, error: repeated.error ?? null,
          result: compact(repeat) }
      },
      selected: {
        status: intervention.status, error: intervention.error ?? null,
        audit: intervention.payload?.audit ?? null,
        result: compact(selected)
      }
    });
  }
  return {
    schema: 'agent7-original6v9-stadium-selected-retrospective-v1',
    registration: REGISTRATION.schema,
    enginePin: REGISTRATION.vendor,
    researchHead: process.env.GITHUB_SHA ?? null,
    originalRanks: [6, 9],
    totalOriginalPhysicalGroups: rows.length,
    totalNativeAttempts: rows.length * 3,
    nativeErrors: rows.filter(r => r.controls.first.status !== 'executed' ||
      r.controls.repeat.status !== 'executed' ||
      r.selected.status !== 'executed').length,
    physicalFullDealMatched: rows.every(r => r.parity.allPhysicalDealsEqual),
    repeatedControlsIdentical: rows.every(r => r.parity.controlsEqual),
    selectedStadiumActions: rows.reduce((sum, r) =>
      sum + (r.selected.audit?.selectedRoots ?? 0), 0),
    nativeStadiumAccepted: rows.reduce((sum, r) =>
      sum + (r.selected.audit?.selectedNativeStore === 'accepted' ? 1 : 0), 0),
    originalSourceGames: rows.length,
    competitiveQualifiedGames: 0,
    strengthInference: 'not-available; selected root change only, no competent policy qualification',
    rows
  };
}

if (require.main === module) {
  const output = run();
  process.stdout.write(JSON.stringify(output, null, 2) + '\n');
  process.stderr.write('AGENT7_ORIGINAL6V9_STADIUM_CANARY ' + JSON.stringify({
    engine: output.enginePin, attempted: output.totalNativeAttempts,
    errors: output.nativeErrors,
    matchedDeals: output.physicalFullDealMatched,
    stableControls: output.repeatedControlsIdentical,
    selected: output.selectedStadiumActions,
    accepted: output.nativeStadiumAccepted,
    cases: output.rows.map(r => ({
      id: r.fixtureId, seed: r.seed, registeredPhysical:
        r.parity.equalsRegisteredPreviousSourceDeal,
      selectedRoots: r.selected.audit?.selectedRoots ?? null,
      nativeStore: r.selected.audit?.selectedNativeStore ?? 'error',
      firstEligibility: r.selected.audit?.observedTargetNativeRoots?.[0] ?? null
    }))
  }) + '\n');
  if (!output.physicalFullDealMatched || !output.repeatedControlsIdentical ||
      output.nativeErrors > 0) process.exitCode = 1;
}

module.exports = { run, withSelectedSourceStadium, digestResult, publicReceipt };
