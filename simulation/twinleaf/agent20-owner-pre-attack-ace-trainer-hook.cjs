'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { actorObservation } = require('./actor-observation-contract.cjs');
const { chooseOwnerPreAttackAceTrainer } =
  require('./agent20-owner-pre-attack-ace-trainer.cjs');

/**
 * Summarize only owner-held and public information for a pending attack.
 *
 * @param {object} view
 * @param {object} action
 * @returns {object}
 */
function summarizeAttempt(view, action) {
  const own = view.ownPublic ?? {};
  const opponent = view.opponentPublic ?? {};
  const active = own.active ?? {};
  const target = opponent.active ?? {};
  const ownHand = Array.isArray(view.ownHand) ? view.ownHand : [];
  const requestedName = action.attackName ?? action.attack?.name ?? action.name;
  const attacks = active.attacks ?? [];
  const attackIndex = typeof requestedName === 'string'
    ? attacks.findIndex(attack => attack.name === requestedName)
    : attacks.length === 1 ? 0 : -1;
  const attack = attacks[attackIndex] ?? null;
  const targetHp = Number(target.hp);
  const targetDamage = Number(target.damage);

  return {
    decisionKind: view.decisionKind,
    actorSeat: own.seat ?? null,
    globalTurn: view.globalTurn ?? null,
    ownHandCount: ownHand.length,
    opponentHandCount: opponent.handCount ?? null,
    aceTrainerHandIndex: ownHand.findIndex(card =>
      String(card).includes('Ace Trainer')),
    ownPrizeCount: own.prizeCount ?? null,
    opponentPrizeCount: opponent.prizeCount ?? null,
    supporterPlayedTurn: view.ownTurnResources?.supporterPlayedTurn ?? null,
    supporterPlayLocked: view.ownTurnResources?.supporterPlayLocked ?? null,
    ownActivePrinting: active.printing ?? null,
    targetPrinting: target.printing ?? null,
    attackName: attack?.name ?? requestedName ?? null,
    attackDamage: attack?.damage ?? null,
    attackText: attack?.text ?? null,
    attackCostCount: Array.isArray(attack?.cost) ? attack.cost.length : null,
    attachedEnergyCount: Array.isArray(active.energies)
      ? active.energies.length : null,
    targetHp: Number.isFinite(targetHp) ? targetHp : null,
    targetDamage: Number.isFinite(targetDamage) ? targetDamage : null,
    targetRemainingHp: Number.isFinite(targetHp) &&
      Number.isFinite(targetDamage) ? targetHp - targetDamage : null,
    targetToolCount: (target.tools ?? []).length,
    targetAbilityCount: (target.abilities ?? []).length,
    opponentStadiumCount: (opponent.stadium ?? []).length,
    targetResistanceCount: (target.printed?.resistance ?? []).length
  };
}

/**
 * Resolve the physical actor from the same native identifier used by
 * headless.runMatch, then construct the observation from the real Store state.
 *
 * @param {object} store Actual native match Store.
 * @param {object} action Pending native action.
 * @returns {null|{seat:number,view:object}}
 */
function ownerAttackObservation(store, action) {
  const state = store?.state;
  const actorId = action?.clientId ?? action?.id;
  const seat = state?.players?.findIndex(player => player.id === actorId) ?? -1;
  if (seat < 0) return null;
  return { seat, view: actorObservation(state, seat) };
}

/**
 * Install an owner-only Ace Trainer continuation at the native Store
 * dispatch boundary. The headless callback and returned root ledger are
 * corrected to record the actual dispatched PlayCardAction.
 *
 * @param {()=>object} execute Synchronous native experiment.
 * @param {{minOpponentHandCount?:number,minOwnHandCount?:number,maxDecisions?:number}} [options]
 * @param {{headless?:object,native?:(modulePath:string)=>object}} [deps]
 * @returns {{result:object,audit:object}}
 */
function withOwnerPreAttackAceTrainer(execute, options = {}, deps = {}) {
  const headless = deps.headless ?? require('./headless.cjs');
  const output = path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const native = deps.native ?? (modulePath => require(path.join(output, modulePath)));
  const { AttackAction } = native('game/store/actions/game-actions');
  const { PlayCardAction, PlayerType, SlotType } =
    native('game/store/actions/play-card-action');

  const originalRun = headless.runMatch;
  assert.equal(typeof originalRun, 'function');
  const maxDecisions = options.maxDecisions ?? 1;
  const audit = {
    schema: 'agent20-owner-pre-attack-ace-trainer-audit-v3',
    policyVersion: require('./agent20-owner-pre-attack-ace-trainer.cjs').VERSION,
    ownerOnly: true,
    opponentHiddenHandRead: false,
    maxDecisions,
    storeInstances: 0,
    dispatchCalls: 0,
    attackDispatchCalls: 0,
    invalidActorIdAttempts: 0,
    attempts: [],
    decisions: [],
    rootActionLedgerRewrites: []
  };

  const observedRun = function (request) {
    const priorOnRootStoreCreated = request.onRootStoreCreated;
    const priorOnRootActionDispatched = request.onRootActionDispatched;
    const restores = [];
    const replacements = new Map();
    const attemptsByAction = new Map();
    const replacementEvents = [];

    try {
      const game = originalRun({
        ...request,
        onRootStoreCreated(store, ...args) {
          priorOnRootStoreCreated?.(store, ...args);
          audit.storeInstances++;
          const priorOwnDispatch = Object.getOwnPropertyDescriptor(
            store, 'dispatch'
          );
          const priorDispatch = store.dispatch.bind(store);
          const wrappedDispatch = function (action, ...dispatchArgs) {
            audit.dispatchCalls++;
            const isAttackAction = action instanceof AttackAction ||
              action?.constructor?.name === 'AttackAction';
            if (isAttackAction) {
              audit.attackDispatchCalls++;
              const actorId = action.clientId ?? action.id;
              const resolved = ownerAttackObservation(store, action);
              if (resolved !== null) {
                const { seat, view } = resolved;
                const attempt = summarizeAttempt(view, action);
                attempt.actorIdType = typeof actorId;
                attempt.actorSeat = seat;
                attempt.constructorName = action.constructor?.name ?? null;
                const intent = audit.decisions.length < maxDecisions
                  ? chooseOwnerPreAttackAceTrainer(view, action, options)
                  : null;
                attempt.policyStatus = intent === null
                  ? 'declined-or-limit-reached' : 'selected';
                audit.attempts.push(attempt);
                attemptsByAction.set(action, attempt);
                if (intent !== null) {
                  const replacement = new PlayCardAction(
                    actorId,
                    intent.handIndex,
                    { player: PlayerType.ANY, slot: SlotType.BOARD, index: 0 }
                  );
                  const event = {
                    ...attempt,
                    handIndex: intent.handIndex,
                    printing: intent.printing,
                    damage: intent.damage,
                    targetRemainingHp: intent.targetRemainingHp,
                    reason: intent.reason,
                    opponentHiddenHandRead: false,
                    accepted: false
                  };
                  audit.decisions.push(event);
                  replacements.set(action, replacement);
                  replacementEvents.push({
                    originalAction: action,
                    replacementAction: replacement,
                    event
                  });
                  return priorDispatch(replacement, ...dispatchArgs);
                }
              } else {
                audit.invalidActorIdAttempts++;
                audit.attempts.push({
                  actorIdType: typeof actorId,
                  constructorName: action?.constructor?.name ?? null,
                  policyStatus: 'declined-invalid-actor-id'
                });
              }
            }
            return priorDispatch(action, ...dispatchArgs);
          };
          store.dispatch = wrappedDispatch;
          restores.push(() => {
            if (store.dispatch !== wrappedDispatch) return;
            if (priorOwnDispatch) {
              Object.defineProperty(store, 'dispatch', priorOwnDispatch);
            } else {
              delete store.dispatch;
            }
          });
        },
        onRootActionDispatched(store, action, actionOrdinal, seat, turnBefore) {
          const attempt = attemptsByAction.get(action);
          if (attempt) attempt.actionOrdinal = actionOrdinal;
          const replacement = replacements.get(action);
          if (replacement !== undefined) {
            const event = replacementEvents.find(row =>
              row.originalAction === action
            ).event;
            event.accepted = true;
            event.actionOrdinal = actionOrdinal;
            event.turnBefore = turnBefore;
            priorOnRootActionDispatched?.(
              store, replacement, actionOrdinal, seat, turnBefore
            );
          } else {
            priorOnRootActionDispatched?.(
              store, action, actionOrdinal, seat, turnBefore
            );
          }
        }
      });

      for (const row of replacementEvents) {
        const actionOrdinal = row.event.actionOrdinal;
        assert.ok(Number.isInteger(actionOrdinal),
          'Ace Trainer replacement was not observed after dispatch');
        const ledgerRow = game.rootActionLedger?.find(entry =>
          entry.actionOrdinal === actionOrdinal
        );
        assert.ok(ledgerRow,
          'Missing root-action ledger entry for Ace Trainer replacement');
        ledgerRow.action = 'PlayCardAction';
        ledgerRow.card = 'Ace Trainer';
        delete ledgerRow.attack;
        delete ledgerRow.attackChoice;
        delete ledgerRow.actorPolicyDecisionOrdinal;
        ledgerRow.agent20Policy = 'owner-public-pre-attack-ace-trainer';
        ledgerRow.replacedAction = 'AttackAction';
        audit.rootActionLedgerRewrites.push({
          actionOrdinal,
          replacedAction: 'AttackAction',
          actualAction: 'PlayCardAction',
          card: 'Ace Trainer'
        });
      }
      return game;
    } finally {
      for (const restore of restores.reverse()) restore();
    }
  };

  headless.runMatch = observedRun;
  try {
    return { result: execute(), audit };
  } catch (error) {
    if (error && typeof error === 'object') {
      error.agent20AceTrainerAudit = audit;
    }
    throw error;
  } finally {
    assert.strictEqual(headless.runMatch, observedRun);
    headless.runMatch = originalRun;
  }
}

module.exports = { withOwnerPreAttackAceTrainer };
