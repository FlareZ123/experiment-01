'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { actorObservation } = require('./actor-observation-contract.cjs');
const { chooseOwnerPreAttackAceTrainer } =
  require('./agent20-owner-pre-attack-ace-trainer.cjs');

/**
 * Install a one-shot, owner-only Ace Trainer continuation after the Box/Fog
 * adapter has installed its own native AI hook.
 *
 * The continuation wraps decodeNextAction on the AI prototype, then restores
 * the exact prior descriptor as soon as it returns Ace Trainer. If the
 * Box/Fog sequence reaches its attack without selecting Ace Trainer, the
 * root-action observer restores the prototype after that attack instead.
 *
 * @param {()=>object} execute Synchronous native experiment.
 * @param {{minOpponentHandCount?:number,minOwnHandCount?:number}} [options]
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
  const { SimpleTacticsAi } = native('simple-bot/simple-tactics-ai');

  const originalRun = headless.runMatch;
  assert.equal(typeof originalRun, 'function');
  const audit = {
    schema: 'agent20-owner-pre-attack-ace-trainer-audit-v1',
    policyVersion: require('./agent20-owner-pre-attack-ace-trainer.cjs').VERSION,
    ownerOnly: true,
    opponentHiddenHandRead: false,
    decisions: []
  };

  let restoreDecode = null;
  let pendingDecisionAction = null;
  let boxOwnerId = null;
  let boxSeen = false;
  let restored = false;

  function restoreAiDecode() {
    if (restored || restoreDecode === null) return;
    restoreDecode();
    restored = true;
    audit.decodeHookRestored = true;
  }

  const observedRun = function (request) {
    const priorOnRootStoreCreated = request.onRootStoreCreated;
    const priorOnRootActionDispatched = request.onRootActionDispatched;

    return originalRun({
      ...request,
      onRootStoreCreated(store, ...args) {
        priorOnRootStoreCreated?.(store, ...args);
        if (restoreDecode !== null) return;

        const priorDescriptor = Object.getOwnPropertyDescriptor(
          SimpleTacticsAi.prototype, 'decodeNextAction'
        );
        assert.ok(priorDescriptor && typeof priorDescriptor.value === 'function');
        const priorDecode = priorDescriptor.value;

        restoreDecode = () => {
          Object.defineProperty(
            SimpleTacticsAi.prototype, 'decodeNextAction', priorDescriptor
          );
        };

        const wrappedDecode = function (...decodeArgs) {
          const action = priorDecode.apply(this, decodeArgs);
          if (!(action instanceof AttackAction)) return action;

          const actorId = action.clientId ?? action.id;
          if (typeof actorId !== 'string') return action;
          const view = actorObservation(store, actorId);
          const intent = chooseOwnerPreAttackAceTrainer(view, action, options);
          if (intent === null) return action;

          const decision = {
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
          audit.decisions.push(decision);

          pendingDecisionAction = new PlayCardAction(
            actorId,
            intent.handIndex,
            { player: PlayerType.ANY, slot: SlotType.BOARD, index: 0 }
          );
          restoreAiDecode();
          return pendingDecisionAction;
        };

        Object.defineProperty(SimpleTacticsAi.prototype, 'decodeNextAction', {
          ...priorDescriptor,
          value: wrappedDecode
        });
      },
      onRootActionDispatched(store, action, actionOrdinal, seat, turnBefore) {
        priorOnRootActionDispatched?.(
          store, action, actionOrdinal, seat, turnBefore
        );

        if (action === pendingDecisionAction) {
          const decision = audit.decisions[audit.decisions.length - 1];
          decision.accepted = true;
          decision.actionOrdinal = actionOrdinal;
          decision.turnBefore = turnBefore;
        }

        const actorId = action?.clientId ?? action?.id;
        const player = store.state.players.find(candidate =>
          candidate.id === actorId
        );
        if (player && (player.discard.cards ?? []).some(card =>
          String(card.fullName ?? card.name ?? '').includes('Secret Box')
        )) {
          boxOwnerId = player.id;
          boxSeen = true;
        }

        if (!restored && boxSeen &&
            action instanceof AttackAction &&
            actorId === boxOwnerId) {
          restoreAiDecode();
          audit.fallbackRestoredAfterBoxAttack = true;
        }
      }
    });
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
    restoreAiDecode();
    assert.strictEqual(headless.runMatch, observedRun);
    headless.runMatch = originalRun;
  }
}

module.exports = { withOwnerPreAttackAceTrainer };
