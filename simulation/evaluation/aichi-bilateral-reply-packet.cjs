'use strict';

const assert = require('node:assert/strict');

const ROOT_PROTOCOL = 'actual-store-root-action-ledger-v1';
const ATTACK_PROTOCOL = 'real-store-attack-log-declarations-v1';

/** @param {object} event @returns {object} */
function publicAction(event) {
  return {
    ordinal: event.actionOrdinal,
    turn: event.turnBefore,
    playerSlot: event.playerSlot,
    action: event.action,
    ...(event.card === undefined ? {} : {card: event.card}),
    ...(event.ability === undefined ? {} : {ability: event.ability}),
    ...(event.attack === undefined ? {} : {attack: event.attack}),
    ...(event.attackChoice?.attackName === undefined ? {} : {
      chosenAttack: event.attackChoice.attackName,
      chosenPrinting: event.attackChoice.printing ?? null
    })
  };
}

/**
 * Extract a bounded post-game audit without copying either hidden hand or
 * unseen deck and Prize cards. Only accepted Store roots and logged attack
 * declarations count as actions. This is not a replay, damage certificate,
 * legality ruling or evidence of competent policy.
 *
 * @param {object} game Completed headless runMatch output, including capped games.
 * @param {{sourceSeat:0|1,triggerTurn:number,expectedSourceAction:string,
 *   expectedSourceDetail:string,tailLength?:number,
 *   requirePublicAttackTransitions?:boolean}} options
 * @returns {object}
 */
function buildBilateralReplyPacket(game, options) {
  assert(game && options && [0,1].includes(options.sourceSeat));
  assert(Number.isSafeInteger(options.triggerTurn) && options.triggerTurn >= 0);
  assert(['PlayCardAction','AttackAction','UseAbilityAction'].includes(
    options.expectedSourceAction));
  assert(typeof options.expectedSourceDetail === 'string' &&
    options.expectedSourceDetail.length > 0);
  const tailLength = options.tailLength ?? 8;
  assert(Number.isSafeInteger(tailLength) && tailLength >= 1 && tailLength <= 32);
  const roots = game.rootActionLedger;
  const attacks = game.attackDeclarationTrace;
  assert.equal(game.rootActionLedgerProtocol, ROOT_PROTOCOL,
    'Full Store root capture required');
  assert.equal(game.attackDeclarationTraceProtocol, ATTACK_PROTOCOL,
    'Live Store attack declarations required');
  assert(Array.isArray(roots) && Array.isArray(attacks));
  assert(Number.isSafeInteger(game.actions) && roots.length === game.actions,
    'Missing successful root Store dispatch');
  for (const [ordinal, event] of roots.entries()) {
    assert(event && event.actionOrdinal === ordinal &&
      [-1,0,1].includes(event.playerSlot) &&
      Number.isSafeInteger(event.turnBefore) &&
      Number.isSafeInteger(event.turnAfter) &&
      event.turnAfter >= event.turnBefore,
    'Malformed chronological Store root');
    if (ordinal) assert.equal(event.turnBefore, roots[ordinal-1].turnAfter,
      'Discontinuous Store turn clock');
  }
  for (const attack of attacks) {
    const root = roots[attack.actionOrdinal];
    assert(root && root.action === attack.triggerAction &&
      root.playerSlot === attack.triggerPlayerSlot &&
      root.playerSlot === attack.playerSlot &&
      root.turnBefore === attack.turnBefore &&
      root.turnAfter === attack.turnAfter &&
      typeof attack.attackName === 'string' && attack.attackName.length > 0,
    'Store declaration mismatches its executing actor/root');
  }

  const publicAttackTransitions=game.publicAttackTransitions;
  if (options.requirePublicAttackTransitions === true) {
    assert.equal(game.publicAttackTransitionsProtocol,
      'actual-store-public-attack-transitions-v1',
      'Expected opted-in real Store public attack observation');
    assert(Array.isArray(publicAttackTransitions));
  }
  if (Array.isArray(publicAttackTransitions)) {
    for (const event of publicAttackTransitions) {
      const root=roots[event.actionOrdinal];
      const actual=attacks.filter(a=>a.actionOrdinal===event.actionOrdinal);
      assert(root && actual.length>0 &&
        root.playerSlot===event.triggerPlayerSlot &&
        root.action===event.triggerAction &&
        root.turnBefore===event.turnBefore &&
        root.turnAfter===event.turnAfter &&
        Array.isArray(event.before) && event.before.length===2 &&
        Array.isArray(event.after) && event.after.length===2 &&
        typeof event.promptPendingAfter==='boolean' &&
        Array.isArray(event.declarations) &&
        event.declarations.length===actual.length,
      'Public attack observation does not match real Store root');
      for (let i=0;i<actual.length;i++) {
        assert.equal(event.declarations[i].attackName,actual[i].attackName);
        assert.equal(event.declarations[i].playerName,actual[i].playerName);
      }
      if (event.settled !== undefined && event.settled !== null) {
        const completion=event.settled.completionRootActionOrdinal;
        const closingRoot=roots[completion];
        assert(Number.isSafeInteger(completion) &&
          completion>=event.actionOrdinal && closingRoot &&
          (completion===event.actionOrdinal ||
            closingRoot.action==='ResolvePromptAction') &&
          (completion===event.actionOrdinal ||
            closingRoot.initiatingRootActionOrdinal===
              event.initiatingRootActionOrdinal) &&
          Array.isArray(event.settled.after) &&
          event.settled.after.length===2 &&
          Array.isArray(event.settled.prizesRemaining) &&
          event.settled.prizesRemaining.length===2 &&
          Array.isArray(event.settled.deckRemaining) &&
          event.settled.deckRemaining.length===2,
        'Resolved public attack observation has no authentic prompt-chain terminator');
      }
    }
  }
  const detailField = {
    PlayCardAction: 'card', AttackAction: 'attack', UseAbilityAction: 'ability'
  }[options.expectedSourceAction];
  const sourceAction = roots.find(root =>
    root.playerSlot === options.sourceSeat &&
    root.turnBefore === options.triggerTurn &&
    root.action === options.expectedSourceAction &&
    root[detailField] === options.expectedSourceDetail);
  const candidateSeat = 1 - options.sourceSeat;
  const activeSource = sourceAction !== undefined;
  const opponentAttackLog = attacks.filter(attack =>
    attack.playerSlot === options.sourceSeat &&
    activeSource && attack.actionOrdinal >= sourceAction.actionOrdinal);
  const signatureDeclared = activeSource &&
    options.expectedSourceAction === 'AttackAction' &&
    attacks.some(attack =>
      attack.actionOrdinal === sourceAction.actionOrdinal &&
      attack.playerSlot === options.sourceSeat &&
      attack.attackName === options.expectedSourceDetail);
  const candidate = activeSource ? roots.find(root =>
    root.actionOrdinal > sourceAction.actionOrdinal &&
    root.playerSlot === candidateSeat &&
    root.action !== 'ResolvePromptAction' &&
    root.turnBefore === sourceAction.turnBefore+1) : null;
  // A later unrelated action cannot stand in for the immediate reply.
  const sourceReturns = candidate ? roots.find(root =>
    root.actionOrdinal > candidate.actionOrdinal &&
    root.playerSlot === options.sourceSeat &&
    root.action !== 'ResolvePromptAction' &&
    root.turnBefore === candidate.turnBefore+1) : null;
  const candidateAttackDeclarations = candidate ? attacks.filter(attack =>
    attack.playerSlot === candidateSeat &&
    attack.turnBefore === candidate.turnBefore &&
    attack.actionOrdinal >= candidate.actionOrdinal &&
    (sourceReturns === null ||
      attack.actionOrdinal < sourceReturns.actionOrdinal)) : [];
  const terminal = game.finished === true ? {
    engineWinner: game.winner ?? null,
    remainingPrizes: Array.isArray(game.prizesRemaining) ?
      [...game.prizesRemaining] : null,
    remainingDeck: Array.isArray(game.finalState) ?
      game.finalState.map(player => player.deckRemaining) : null,
    engineEndReason: game.endReason ?? null
  } : null;
  return {
    schema: 'accepted-source-action-bilateral-reply-packet-v1',
    sourceSeat: options.sourceSeat,
    candidateSeat,
    sourceTriggerTurn: options.triggerTurn,
    expectedSourceAction: options.expectedSourceAction,
    expectedSourceDetail: options.expectedSourceDetail,
    executedSourceRoot: sourceAction ? publicAction(sourceAction) : null,
    // A live Store attack declaration is not printed damage/effect proof.
    matchingSourceAttackDeclared: Boolean(signatureDeclared),
    sourceImmediatePublicAttackTransition: sourceAction ?
      publicAttackTransitions?.find(row=>
        row.actionOrdinal===sourceAction.actionOrdinal)??null : null,
    laterSourceAttackDeclarations: opponentAttackLog.map(attack => ({
      ordinal: attack.actionOrdinal,
      turn: attack.turnBefore,
      attackName: attack.attackName
    })),
    firstCandidateNextTurnRoot: candidate ? publicAction(candidate) : null,
    // Genuine Store turns; effect-closure provenance is audited separately.
    immediateRootLineage: {
      sourceActionTurnBefore: sourceAction?.turnBefore ?? null,
      candidateReplyTurnBefore: candidate?.turnBefore ?? null,
      sourceContinuationTurnBefore: sourceReturns?.turnBefore ?? null,
      sourceEffectCompletionTurnBefore: (
        sourceAction && options.expectedSourceAction === 'AttackAction'
          ? (() => {
            const effect = publicAttackTransitions?.find(row =>
              row.actionOrdinal === sourceAction.actionOrdinal);
            const complete = effect?.settled?.completionRootActionOrdinal;
            return Number.isSafeInteger(complete) ?
              roots[complete]?.turnBefore ?? null : null;
          })()
          : null)
    },
    candidateImmediatePublicAttackTransitions: candidate ?
      publicAttackTransitions?.filter(row=>
        row.actionOrdinal>=candidate.actionOrdinal &&
        row.turnBefore===candidate.turnBefore &&
        (sourceReturns===null ||
          row.actionOrdinal<sourceReturns.actionOrdinal))??[] : [],
    candidateSameTurnAttackDeclarations: candidateAttackDeclarations.map(attack=>({
      ordinal: attack.actionOrdinal,turn: attack.turnBefore,
      attackName: attack.attackName
    })),
    nextSourceTurnRoot: sourceReturns ? publicAction(sourceReturns) : null,
    finalRootTail: roots.slice(-tailLength).map(publicAction),
    terminal,
    sourceEffectVerified: false,
    candidateReplyCompetenceVerified: false,
    qualifiedCompetitiveGame: false
  };
}

module.exports = {buildBilateralReplyPacket};
