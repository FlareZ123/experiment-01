'use strict';

/**
 * Read-only matched-source native opportunity -> payoff lineage.
 * This module does not qualify gameplay, independently validate paper
 * payment, infer winners, or compare win probabilities.
 */

/** @param {unknown} value @returns {string} */
function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(
      key => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

/** @param {object} row @param {number} root @returns {object|null} */
function settledAttack(row, root) {
  return (row.sourceAttackSettlement?.attacks ?? [])
    .find(attack => attack.actionOrdinal === root &&
      attack.settledPromptChain === true) ?? null;
}

/**
 * @param {object} row
 * @param {number} anchorRoot
 * @returns {object|null}
 */
function nextSourceTurnAction(row, anchorRoot) {
  const attack = settledAttack(row, anchorRoot);
  if (!attack) return null;
  const sourceSeat = row.sourceSeat;
  const roots = row.rootActionLedger ?? [];
  return roots.find(root =>
    root.actionOrdinal > attack.completionRootOrdinal &&
    root.turnBefore > attack.turnBefore &&
    root.playerSlot === sourceSeat &&
    (root.action === 'AttackAction' || root.action === 'PassTurnAction')
  ) ?? null;
}

/**
 * @param {object} row
 * @param {number} anchorRoot
 * @returns {object}
 */
function immediateFollowThrough(row, anchorRoot) {
  const anchor = settledAttack(row, anchorRoot);
  if (!anchor) throw new Error('ANCHOR_NOT_SETTLED');
  const sourceSeat = row.sourceSeat;
  const sourcePublicAfter = anchor.publicBoardAfter?.[sourceSeat];
  if (!sourcePublicAfter || !Array.isArray(anchor.prizesAfter) ||
      !Number.isInteger(anchor.prizesAfter[sourceSeat]))
    throw new Error('ANCHOR_PUBLIC_STATE_UNVERIFIED');
  const next = nextSourceTurnAction(row, anchorRoot);
  const opponent = next
    ? (row.rootActionLedger ?? []).filter(root =>
      root.actionOrdinal > anchor.completionRootOrdinal &&
      root.actionOrdinal < next.actionOrdinal &&
      root.playerSlot !== sourceSeat &&
      ['AttackAction', 'PassTurnAction'].includes(root.action))
    : [];
  const nextSettled = next?.action === 'AttackAction'
    ? settledAttack(row, next.actionOrdinal) : null;
  const prizeBefore = nextSettled?.prizesBefore?.[sourceSeat];
  const prizeAfter = nextSettled?.prizesAfter?.[sourceSeat];
  const nextAttackPrizesTaken = Number.isInteger(prizeBefore) &&
    Number.isInteger(prizeAfter) ? prizeBefore - prizeAfter : null;
  return {
    anchorTurn: anchor.turnBefore,
    anchorAttackName: anchor.attackName,
    anchorCompletionRoot: anchor.completionRootOrdinal,
    sourcePublicAfter,
    anchorPrizesAfter: anchor.prizesAfter ?? null,
    opponentActions: opponent.map(root => ({
      root: root.actionOrdinal, turn: root.turnBefore, action: root.action
    })),
    nextSourceTurn: next?.turnBefore ?? null,
    nextSourceRoot: next?.actionOrdinal ?? null,
    nextSourceAction: next?.action ?? 'UNOBSERVED',
    nextAttackSettled: !!nextSettled,
    nextAttackName: nextSettled?.attackName ?? null,
    nextAttackPrizesBefore: nextSettled?.prizesBefore ?? null,
    nextAttackPrizesAfter: nextSettled?.prizesAfter ?? null,
    nextAttackPrizesTaken
  };
}

/**
 * Compare raw game trajectories only where original physical source deal
 * and player/deck identity are actually verified. Native root parity does
 * not imply unchanged public state or unchanged physical prompt choice.
 * @param {object} control Native original row.
 * @param {object} treatment Native variant row.
 * @param {number} anchorRoot Settled common source attack action ordinal.
 * @returns {object}
 */
function compareNativeOpportunity(control, treatment, anchorRoot) {
  if (!Number.isInteger(anchorRoot) || anchorRoot < 0)
    throw new Error('INVALID_ANCHOR');
  if (!control?.trial?.id || control.trial.id !== treatment?.trial?.id)
    throw new Error('TRIAL_ID_MISMATCH');
  if (control.verifiedFirstTurn !== true ||
      treatment.verifiedFirstTurn !== true ||
      control.actualStarterSeat !== treatment.actualStarterSeat)
    throw new Error('FIRST_PLAYER_UNVERIFIED');
  if (!control.sourceDealFingerprint ||
      control.sourceDealFingerprint !== treatment.sourceDealFingerprint)
    throw new Error('PHYSICAL_SOURCE_DEAL_MISMATCH');
  if (!control.sourceDeckFingerprint ||
      control.sourceDeckFingerprint !== treatment.sourceDeckFingerprint ||
      !control.candidateDeckFingerprint ||
      control.candidateDeckFingerprint !== treatment.candidateDeckFingerprint ||
      control.sourceSeat !== treatment.sourceSeat)
    throw new Error('SOURCE_OR_CANDIDATE_DIFFERENT');
  const original = immediateFollowThrough(control, anchorRoot);
  const changed = immediateFollowThrough(treatment, anchorRoot);
  if (original.anchorTurn !== changed.anchorTurn ||
      original.anchorAttackName !== changed.anchorAttackName ||
      original.anchorCompletionRoot !== changed.anchorCompletionRoot ||
      stable(original.anchorPrizesAfter) !== stable(changed.anchorPrizesAfter))
    throw new Error('ANCHOR_LINE_DIFFERENT');
  const left = control.rootActionLedger ?? [];
  const right = treatment.rootActionLedger ?? [];
  let equalRoots = 0;
  while (equalRoots < left.length && equalRoots < right.length &&
         stable(left[equalRoots]) === stable(right[equalRoots])) equalRoots++;
  const sourceBoardDifferedAtAnchor =
    stable(original.sourcePublicAfter) !== stable(changed.sourcePublicAfter);
  return {
    trialId: control.trial.id,
    sourceSeat: control.sourceSeat,
    exactPhysicalSourceDealMatched: true,
    actualFirstPlayerMatched: true,
    sameDecks: true,
    anchorRoot,
    identicalAcceptedRootPrefix: equalRoots,
    sourceBoardDifferedAtAnchor,
    rawLedgerFirstDivergentRoot:
      left[equalRoots]?.actionOrdinal ?? right[equalRoots]?.actionOrdinal ?? null,
    control: original, treatment: changed,
    sameOpponentRootKindsBeforeNextSourceDecision:
      stable(original.opponentActions) === stable(changed.opponentActions),
    qualifiesForCompetitiveInference: false
  };
}


/**
 * Independent public-state card-name conservation check for an attack's
 * Active-to-own-Bench Energy donation. An equal named multiset is weaker
 * than a native physical card-identity receipt; neither alone proves paper
 * legality or the opponent's strategic response.
 * @param {object} row
 * @param {number} attackRoot
 * @param {string} donorName
 * @param {number} targetBenchIndex
 * @returns {object}
 */
function inspectPublicEnergyDonation(row, attackRoot, donorName, targetBenchIndex) {
  const attack = settledAttack(row, attackRoot);
  const seat = row?.sourceSeat;
  const before = attack?.publicBoardBefore?.[seat];
  const after = attack?.publicBoardAfter?.[seat];
  if (!before || !after || !Number.isInteger(targetBenchIndex) ||
      targetBenchIndex < 0 || !before.bench?.[targetBenchIndex] ||
      !after.bench?.[targetBenchIndex] || typeof donorName !== 'string')
    throw new Error('DONATION_PUBLIC_STATE_UNAVAILABLE');
  const beforeActive = before.active?.energyCards;
  const afterActive = after.active?.energyCards;
  const beforeTarget = before.bench[targetBenchIndex]?.energyCards;
  const afterTarget = after.bench[targetBenchIndex]?.energyCards;
  if (![beforeActive, afterActive, beforeTarget, afterTarget]
    .every(Array.isArray)) throw new Error('DONATION_ENERGY_ZONES_UNAVAILABLE');
  const oneRemoved = beforeActive.slice();
  const index = oneRemoved.indexOf(donorName);
  if (index >= 0) oneRemoved.splice(index, 1);
  const oneAdded = [...beforeTarget, donorName];
  const same = (a,b) => stable([...a].sort()) === stable([...b].sort());
  const otherBenchesIntact = before.bench.length === after.bench.length &&
    before.bench.every((member,i) =>
      i === targetBenchIndex ||
      (member.name === after.bench[i]?.name &&
        Array.isArray(member.energyCards) &&
        Array.isArray(after.bench[i].energyCards) &&
        same(member.energyCards, after.bench[i].energyCards)));
  return {
    donorName,targetBenchIndex,
    matchedPublicActiveToBenchTransfer:index >= 0 &&
      before.active?.name === after.active?.name &&
      before.bench[targetBenchIndex]?.name ===
        after.bench[targetBenchIndex]?.name &&
      same(oneRemoved, afterActive) &&
      same(oneAdded, afterTarget) && otherBenchesIntact,
    paperLegalityIndependentlyVerified:false,
    physicalCardInstanceIdentityVerified:false
  };
}

module.exports = {settledAttack, nextSourceTurnAction,
  immediateFollowThrough, compareNativeOpportunity, inspectPublicEnergyDonation};
