'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { actorObservation } = require('./actor-observation-contract.cjs');
const { chooseOwnerPreAttackAceTrainer } =
  require('./agent20-owner-pre-attack-ace-trainer.cjs');

/**
 * Install an owner-only Ace Trainer continuation at the native Store
 * dispatch boundary. The headless callback and returned root ledger are
 * corrected to record the actual dispatched PlayCardAction.
 *
 * @param {()=>object} execute Synchronous native experiment.
 * @param {{minOpponentHandCount?:number,minOwnHandCount?:number,maxDecisions?:number}} [options]
 * @returns {{result:object,audit:object}}
 */
function withOwnerPreAttackAceTrainer(execute, options = {}) {
  const headless = require('./headless.cjs');
  const output = path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const native = modulePath => require(path.join(output, modulePath));
  const { AttackAction } = native('game/store/actions/game-actions');
  const { PlayCardAction, PlayerType, SlotType } =
    native('game/store/actions/play-card-action');

  const originalRun = headless.runMatch;
  assert.equal(typeof originalRun, 'function');
  const maxDecisions = options.maxDecisions ?? 1;
  const audit = {
    schema: 'agent20-owner-pre-attack-ace-trainer-audit-v2',
    policyVersion: require('./agent20-owner-pre-attack-ace-trainer.cjs').VERSION,
    ownerOnly: true,
    opponentHiddenHandRead: false,
    maxDecisions,
    decisions: [],
    rootActionLedgerRewrites: []
  };

  const observedRun = function (request) {
    const priorOnRootStoreCreated = request.onRootStoreCreated;
    const priorOnRootActionDispatched = request.onRootActionDispatched;
    const restores = [];
    const replacements = new Map();
    const replacementEvents = [];

    try {
      const game = originalRun({
        ...request,
        onRootStoreCreated(store, ...args) {
          priorOnRootStoreCreated?.(store, ...args);
          const priorOwnDispatch = Object.getOwnPropertyDescriptor(
            store, 'dispatch'
          );
          const priorDispatch = store.dispatch.bind(store);
          const wrappedDispatch = function (action, ...dispatchArgs) {
            if (action instanceof AttackAction &&
                audit.decisions.length < maxDecisions) {
              const actorId = action.clientId ?? action.id;
              if (typeof actorId === 'string') {
                const view = actorObservation(store, actorId);
                const intent = chooseOwnerPreAttackAceTrainer(
                  view, action, options
                );
                if (intent !== null) {
                  const replacement = new PlayCardAction(
                    actorId,
                    intent.handIndex,
                    { player: PlayerType.ANY, slot: SlotType.BOARD, index: 0 }
                  );
                  const event = {
                    actorSeat: view.ownPublic.seat,
                    globalTurn: view.globalTurn,
                    handIndex: intent.handIndex,
                    printing: intent.printing,
                    attackName: intent.attackName,
                    attackIndex: intent.attackIndex,
                    damage: intent.damage,
                    targetPrinting: intent.targetPrinting,
                    targetRemainingHp: intent.targetRemainingHp,
                    ownPrizeCount: intent.ownPrizeCount,
                    opponentPrizeCount: intent.opponentPrizeCount,
                    ownHandCount: intent.ownHandCount,
                    opponentHandCount: intent.opponentHandCount,
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
