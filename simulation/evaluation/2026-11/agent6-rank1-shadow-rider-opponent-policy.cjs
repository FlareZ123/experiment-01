'use strict';

/*
 * Rank-1 Shadow Rider opponent-role policy prototype.
 *
 * The policy is intentionally deterministic and consumes only the detached
 * actor observation, the current legal action frontier, the actor-visible
 * prompt projection, and the validated public event receipt. Native legality
 * remains the host's responsibility. This is a prototype, not a competence
 * certificate or a matchup result.
 */

const POLICY_VERSION = 'agent6-rank1-shadow-rider-opponent-v3';

let activePolicyAudit = null;

function createPolicyAuditContext(request) {
  const source = request?.prompt ? request.prompt.choices : request?.actionFrontier?.items;
  const evaluations = Array.isArray(source) ? source.map(item => ({
    token: item.token,
    status: 'not-evaluated',
    score: null,
    reasonCode: 'NOT_EVALUATED_BY_SELECTED_BRANCH'
  })) : [];
  return {
    policyVersion: POLICY_VERSION,
    decisionKind: request?.observation?.decisionKind ?? 'unknown',
    selectionRuleCode: 'POLICY_BRANCH_NOT_SET',
    tieBreakCode: 'NONE',
    evaluations,
    byToken: new Map(evaluations.map(row => [row.token, row]))
  };
}

function setPolicyAuditRule(selectionRuleCode, tieBreakCode = 'NONE') {
  if (!activePolicyAudit) return;
  activePolicyAudit.selectionRuleCode = selectionRuleCode;
  activePolicyAudit.tieBreakCode = tieBreakCode;
}

function recordPolicyAuditScore(token, score, reasonCode = 'NO_SCORING_BRANCH', components = null) {
  if (!activePolicyAudit) return;
  const row = activePolicyAudit.byToken.get(token);
  if (!row) return;
  if (Number.isFinite(score)) {
    row.status = 'scored';
    row.score = score;
    row.reasonCode = null;
  } else {
    row.status = 'not-evaluated';
    row.score = null;
    row.reasonCode = reasonCode;
  }
  if (Array.isArray(components)) {
    row.componentScores = components.map(component => ({
      name: component.name,
      score: Number.isFinite(component.score) ? component.score : null,
      reasonCode: Number.isFinite(component.score) ? null : 'NO_MATCHING_SCORE_BRANCH'
    }));
  }
}

function recordPolicyAuditRule(token, reasonCode = 'RULE_SELECTED') {
  if (!activePolicyAudit) return;
  const row = activePolicyAudit.byToken.get(token);
  if (!row || row.status === 'scored') return;
  row.status = 'rule-selected';
  row.score = null;
  row.reasonCode = reasonCode;
}

function finishPolicyAudit(decision) {
  const selectedTokens = decision.kind === 'select-action' || decision.kind === 'select-choice'
    ? [decision.token]
    : decision.kind === 'select-choices' ? decision.tokens.slice() : [];
  if (decision.kind === 'abstain') {
    activePolicyAudit.selectionRuleCode = 'ABSTAIN_POLICY_DECISION';
    activePolicyAudit.tieBreakCode = 'NONE';
  } else if (activePolicyAudit.selectionRuleCode === 'POLICY_BRANCH_NOT_SET') {
    activePolicyAudit.selectionRuleCode = 'POLICY_SELECTED_BY_BRANCH';
  }
  for (const token of selectedTokens) {
    const row = activePolicyAudit.byToken.get(token);
    if (row && row.status === 'not-evaluated') {
      row.status = 'rule-selected';
      row.score = null;
      if (row.reasonCode === 'NOT_EVALUATED_BY_SELECTED_BRANCH') {
        row.reasonCode = 'SELECTED_BY_POLICY_RULE';
      }
    }
  }
  return {
    schema: 'agent6-policy-audit-v1',
    policyVersion: activePolicyAudit.policyVersion,
    decisionKind: activePolicyAudit.decisionKind,
    decisionType: decision.kind,
    selectionRuleCode: activePolicyAudit.selectionRuleCode,
    tieBreakCode: activePolicyAudit.tieBreakCode,
    selectedTokens,
    evaluations: activePolicyAudit.evaluations.map(row => ({
      token: row.token,
      status: row.status,
      score: row.score,
      reasonCode: row.reasonCode,
      ...(row.componentScores ? { componentScores: row.componentScores } : {})
    }))
  };
}

const PRINT = Object.freeze({
  psychic: /^Psychic Energy\b/i,
  shadowRiderV: /^Shadow Rider Calyrex V CRE\b/i,
  shadowRiderVmax: /^Shadow Rider Calyrex VMAX CRE\b/i,
  latias: /^Latias ex SSP\b/i,
  trevenant: /^Trevenant & Dusknoir-GX SMP\b/i,
  girafarig: /^Girafarig LOT\b/i,
  dialga: /^Dialga-GX UPR\b/i,
  clefairy: /^Lillie's Clefairy ex JTG\b/i,
  mimikyu: /^Mimikyu GRI\b/i,
  radiantEternatus: /^Radiant Eternatus CRZ\b/i,
  wobbuffet: /^Wobbuffet PHF 36\b/i,
  ironThorns: /^Iron Thorns ex TWM 77\b/i,
  garbodor: /^Garbodor BKP 57\b/i,
  pathToPeak: /^Path to the Peak\b/i,
  tapuLele: /^Tapu Lele-GX GRI\b/i,
  marshadow: /^Marshadow UNB 81\b/i
});

function matches(value, pattern) {
  return typeof value === 'string' && pattern.test(value);
}

function includes(value, fragment) {
  return typeof value === 'string' &&
    value.toLowerCase().includes(String(fragment).toLowerCase());
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function hasPrinting(values, pattern) {
  return list(values).some(value => matches(value, pattern));
}

function countPrinting(values, pattern) {
  return list(values).filter(value => matches(value, pattern)).length;
}

function boardSlots(player) {
  return [player?.active, ...list(player?.bench)].filter(Boolean);
}

function boardHas(player, pattern) {
  return boardSlots(player).some(slot => matches(slot.printing, pattern));
}

function countBoard(player, pattern) {
  return boardSlots(player).filter(slot => matches(slot.printing, pattern)).length;
}

function knownCardCount(observation, pattern) {
  return countBoard(observation.ownPublic, pattern) +
    countPrinting(observation.ownHand, pattern);
}

const SHADOW_RIDER_VMAX_DECK_COPIES = 4;
const CLIMACTIC_GATE_MIN_EXPECTED_FETCHES = 0.75;

// The owner can know cards in play, hand, discard, Lost Zone, resolving
// Supporter, and face-up prizes. All remaining copies are distributed only
// between the deck and face-down prizes. Estimate P(at least one VMAX in deck)
// from those public counts; never treat an unknown VMAX as guaranteed in deck.
function knownVmaxOutsideHiddenZones(observation) {
  const own = observation?.ownPublic ?? {};
  const visiblePrizeCards = list(own.prizeSlots).filter(slot =>
    typeof slot?.printing === 'string');
  const visiblePrizeVmax = visiblePrizeCards.filter(slot =>
    matches(slot.printing, PRINT.shadowRiderVmax)).length;
  const knownOutsideHidden =
    countBoard(own, PRINT.shadowRiderVmax) +
    countPrinting(observation?.ownHand, PRINT.shadowRiderVmax) +
    countPrinting(own.discard, PRINT.shadowRiderVmax) +
    countPrinting(own.lostZone, PRINT.shadowRiderVmax) +
    countPrinting(own.resolvingSupporter, PRINT.shadowRiderVmax) +
    visiblePrizeVmax;
  return {
    knownOutsideHidden,
    visiblePrizeCount: visiblePrizeCards.length
  };
}

function combination(n, k) {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(k) ||
      n < 0 || k < 0 || k > n) return 0;
  const steps = Math.min(k, n - k);
  let result = 1;
  for (let i = 1; i <= steps; i += 1) {
    result *= (n - steps + i) / i;
  }
  return result;
}

function climacticGateDeckEstimate(observation, maxFetch) {
  const own = observation?.ownPublic ?? {};
  const deckCount = own.deckCount;
  const prizeCount = own.prizeCount;
  const cap = Math.max(0, Math.min(2, Number.isSafeInteger(maxFetch) ? maxFetch : 0));
  if (!Number.isSafeInteger(deckCount) || deckCount < 0 ||
      !Number.isSafeInteger(prizeCount) || prizeCount < 0) {
    return { probabilityZero: 1, probabilityOne: 0, expectedFetchCount: 0 };
  }

  const visible = knownVmaxOutsideHiddenZones(observation);
  if (visible.knownOutsideHidden > SHADOW_RIDER_VMAX_DECK_COPIES ||
      visible.visiblePrizeCount > prizeCount) {
    return { probabilityZero: 1, probabilityOne: 0, expectedFetchCount: 0 };
  }
  const remainingCopies = SHADOW_RIDER_VMAX_DECK_COPIES -
    visible.knownOutsideHidden;
  const hiddenPrizeCount = prizeCount - visible.visiblePrizeCount;
  const hiddenTotal = deckCount + hiddenPrizeCount;
  if (remainingCopies > hiddenTotal || hiddenTotal < 0) {
    return { probabilityZero: 1, probabilityOne: 0, expectedFetchCount: 0 };
  }

  const denominator = combination(hiddenTotal, remainingCopies);
  if (denominator <= 0) {
    return { probabilityZero: 1, probabilityOne: 0, expectedFetchCount: 0 };
  }
  const probabilityZero = combination(hiddenPrizeCount, remainingCopies) /
    denominator;
  const probabilityOne = deckCount *
    combination(hiddenPrizeCount, remainingCopies - 1) / denominator;
  const expectedFetchCount = cap === 0 ? 0
    : cap === 1 ? 1 - probabilityZero
      : 2 - 2 * probabilityZero - probabilityOne;
  return {
    probabilityZero: Math.max(0, Math.min(1, probabilityZero)),
    probabilityOne: Math.max(0, Math.min(1, probabilityOne)),
    expectedFetchCount: Math.max(0, Math.min(cap, expectedFetchCount))
  };
}

function abilityIsSuppressed(slot, abilityName) {
  return list(slot?.abilitySuppressions).some(entry =>
    entry?.abilityName === abilityName && entry.suppressed === true);
}

function isGateAbilitySuppressed(observation) {
  const own = observation?.ownPublic ?? {};
  const opponent = observation?.opponentPublic ?? {};
  const players = [own, opponent];

  const pathToPeakInPlay = players.some(player =>
    hasPrinting(player.stadium, PRINT.pathToPeak));
  const stadiumEffectsDisabled =
    (own.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining ?? 0) > 0;
  if (pathToPeakInPlay && !stadiumEffectsDisabled) return true;

  const activeWobbuffet = players.some(player =>
    matches(player.active?.printing ?? '', PRINT.wobbuffet) &&
    !abilityIsSuppressed(player.active, 'Bide Barricade'));
  if (activeWobbuffet) return true;

  const activeIronThorns = players.some(player =>
    matches(player.active?.printing ?? '', PRINT.ironThorns) &&
    !abilityIsSuppressed(player.active, 'Initialization'));
  if (activeIronThorns) return true;

  const liveGarbotoxin = players.some(player =>
    boardSlots(player).some(slot =>
      matches(slot.printing ?? '', PRINT.garbodor) &&
      list(slot.tools).length > 0 &&
      !abilityIsSuppressed(slot, 'Garbotoxin')));
  return liveGarbotoxin;
}

function shouldUseClimacticGate(observation) {
  const own = observation?.ownPublic ?? {};
  const radiantAlreadyInPlay = list(own.bench).some(slot =>
    matches(slot?.printing ?? '', PRINT.radiantEternatus));
  const emptyBenchSlots = 5 - list(own.bench).filter(Boolean).length;
  const maxFetch = Math.min(2, emptyBenchSlots - (radiantAlreadyInPlay ? 0 : 1));
  if (maxFetch <= 0 || countBoard(own, PRINT.shadowRiderVmax) >= 2 ||
      isGateAbilitySuppressed(observation)) return false;

  // Expected VMAX fetched, capped by both the Ability's two-card limit and
  // the actual open Bench. The 0.75 cutoff is a conservative terminal-turn
  // heuristic, not a calibrated optimum.
  const estimate = climacticGateDeckEstimate(observation, maxFetch);
  return estimate.expectedFetchCount >= CLIMACTIC_GATE_MIN_EXPECTED_FETCHES;
}

function isActorBenchPlacement(item, observation) {
  const metadata = item?.publicMetadata ?? {};
  const index = metadata.targetIndex;
  return metadata.cardType === 'pokemon' &&
    metadata.targetSeat === 'actor' &&
    metadata.targetZone === 'bench' &&
    metadata.isOwnerVisible === true &&
    Number.isSafeInteger(index) && index >= 0 && index < 5 &&
    list(observation?.ownPublic?.bench)[index] === null &&
    item.targetPrinting == null;
}

function actionTargetSlot(item, observation) {
  const metadata = item?.publicMetadata ?? {};
  if (metadata.targetSeat !== 'actor' || metadata.isOwnerVisible !== true) return null;
  if (metadata.targetZone === 'active') return observation?.ownPublic?.active ?? null;
  if (metadata.targetZone === 'bench' &&
      Number.isSafeInteger(metadata.targetIndex) &&
      metadata.targetIndex >= 0 && metadata.targetIndex < 5) {
    return list(observation?.ownPublic?.bench)[metadata.targetIndex] ?? null;
  }
  return null;
}

function scoreManualPsychicEnergy(item, request) {
  const observation = request.observation;
  const own = observation.ownPublic;
  const resources = observation.ownTurnResources ?? {};
  const metadata = item.publicMetadata ?? {};
  if (!matches(item.actorPrinting ?? '', PRINT.psychic) ||
      metadata.cardType !== 'energy' ||
      resources.energyPlayedTurn !== false ||
      resources.energyPlayLocked === true ||
      own.publicTurnRestrictions?.energyPlayLocked === true) return 0;

  const target = actionTargetSlot(item, observation);
  if (!target || target.printing !== item.targetPrinting) return 0;
  const energy = psychicEnergyOn(target);
  if (matches(target.printing, PRINT.shadowRiderVmax)) {
    return energy < 6 ? 180 - energy * 5 : 0;
  }
  if (matches(target.printing, PRINT.shadowRiderV)) {
    return energy < 3 ? 165 - energy * 5 : 0;
  }
  if (matches(target.printing, PRINT.trevenant)) {
    return energy < 3 ? 155 - energy * 5 : 0;
  }
  if (matches(target.printing, PRINT.latias)) {
    return energy < 2 ? 145 - energy * 5 : 0;
  }
  if (matches(target.printing, PRINT.girafarig)) return energy < 1 ? 135 : 0;
  if (matches(target.printing, PRINT.mimikyu)) {
    return energy < 2 ? 125 - energy * 5 : 0;
  }
  return 0;
}

function psychicCountInHand(observation) {
  return countPrinting(observation?.ownHand, PRINT.psychic);
}

function hasSupporterInHand(hand) {
  return list(hand).some(card =>
    /Tulip|Raihan|Acerola|Guzma|Teammates|Carmine|Iono|Lillie|N\b|Professor/i.test(card));
}

function psychicCountInDiscard(observation) {
  return countPrinting(observation?.ownPublic?.discard, PRINT.psychic);
}

function psychicCountOnBoard(observation) {
  return boardSlots(observation?.ownPublic).reduce((sum, slot) =>
    sum + countPrinting(slot.energies, PRINT.psychic), 0);
}

function totalEnergyCount(observation) {
  return boardSlots(observation?.ownPublic).reduce((sum, slot) =>
    sum + list(slot.energies).length, 0) +
    boardSlots(observation?.opponentPublic).reduce((sum, slot) =>
      sum + list(slot.energies).length, 0);
}

function priorOpponentTurnKO(request) {
  return request?.publicEventReceipt?.priorOpponentTurnKO?.any === true;
}

function priorPaleMoon(request) {
  return list(request?.publicEventReceipt?.opponentLastTurnAttacks)
    .some(row => row?.attackName === 'Pale Moon-GX' && row?.gxAttack === true);
}

function damagedLatias(player) {
  return boardSlots(player).find(slot =>
    matches(slot.printing, PRINT.latias) && Number(slot.damage) > 0) ?? null;
}

function countBench(player) {
  return list(player?.bench).filter(Boolean).length;
}

function activeTarget(player) {
  return player?.active ?? null;
}

function remainingHp(slot) {
  if (!slot || !Number.isFinite(slot.hp) || !Number.isFinite(slot.damage)) return -1;
  return slot.hp - slot.damage;
}

function prizeLiability(slot) {
  const printing = slot?.printing ?? '';
  if (includes(printing, 'VMAX')) return 3;
  if (/\b(GX|V|ex)\b/i.test(printing) || /-GX\b/i.test(printing)) return 2;
  return 1;
}

function psychicEnergyOn(slot) {
  return countPrinting(slot?.energies, PRINT.psychic);
}

function hasAbility(slot, name) {
  return list(slot?.abilities).some(value => value === name) ||
    list(slot?.abilityDetails).some(ability => ability?.name === name);
}

function abilityActive(slot, name, observation) {
  if (!hasAbility(slot, name)) return false;
  const suppression = list(slot?.abilitySuppressions).find(item =>
    item.abilityName === name);
  if (!suppression || suppression.suppressed !== false) return false;
  if (name === 'Fairy Zone' && pathLockStatus(observation) !== false) return false;
  return true;
}

function fairyZoneActive(observation) {
  return boardSlots(observation.ownPublic).some(slot =>
    abilityActive(slot, 'Fairy Zone', observation));
}

function hasDragonActive(observation) {
  return list(observation?.opponentPublic?.active?.printed?.types).includes('Dragon');
}

function psychicWeaknessMultiplier(request) {
  return hasDragonActive(request.observation) &&
    fairyZoneActive(request.observation) ? 2 : 1;
}

function maxGeistDamage(request) {
  return (10 + 30 * psychicCountOnBoard(request.observation)) *
    psychicWeaknessMultiplier(request);
}

function activeStadiums(observation) {
  return [
    ...list(observation?.ownPublic?.stadium),
    ...list(observation?.opponentPublic?.stadium)
  ];
}

function pathLockStatus(observation) {
  const present = activeStadiums(observation).some(stadium =>
    /Path to the Peak|Silent Lab/i.test(stadium));
  if (!present) return false;
  const epochs = [
    observation?.ownPublic?.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining,
    observation?.opponentPublic?.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining
  ];
  if (epochs.some(value => !Number.isSafeInteger(value) || value < 0)) return null;
  return epochs.some(value => value > 0) ? false : true;
}

function pathLockActive(observation) {
  return pathLockStatus(observation) === true;
}

function copycatTargetAvailable(request) {
  const attacks = list(request?.observation?.opponentPublic?.active?.attacks);
  return attacks.some(attack => attack && attack.name &&
    attack.gxAttack !== true && attack.name !== 'Night Watch');
}

function opponentHasWeakBenchTarget(observation) {
  return list(observation?.opponentPublic?.bench).some(slot =>
    slot && remainingHp(slot) > 0 && remainingHp(slot) <= 150);
}

function scoreAttack(item, request) {
  const observation = request.observation;
  const name = item.attackName ?? '';
  const opponent = activeTarget(observation.opponentPublic);
  const hp = remainingHp(opponent);
  const energies = psychicCountOnBoard(observation);
  const hand = observation.opponentPublic.handCount ?? 0;
  const opponentDiscard = list(observation.opponentPublic.discard);

  const psychicMultiplier = psychicWeaknessMultiplier(request);
  if (name === 'Max Geist') {
    const damage = maxGeistDamage(request);
    return 120 + Math.min(30, energies * 3) + (hp > 0 && damage >= hp ? 30 : 0);
  }
  if (name === 'Night Watch') {
    const damage = 150 * psychicMultiplier;
    return 124 + Math.min(24, hand * 2) + (hp > 0 && damage >= hp ? 20 : 0);
  }
  if (name === 'Pale Moon-GX') {
    const restrictions = opponent?.publicRestrictions ?? {};
    const trapped = restrictions.cannotRetreat === true ||
      restrictions.cannotRetreatNextTurn === true ||
      restrictions.cannotRetreatWhileActive === true;
    const damage = 10 * psychicMultiplier;
    return 110 + (trapped ? 35 : 0) + (hp > 0 && damage >= hp ? 12 : 0);
  }
  if (name === 'Eon Blade') {
    const damage = 200 * psychicMultiplier;
    return 105 + (hp > 0 && damage >= hp ? 30 : 0);
  }
  if (name === 'Get Lost') {
    const valuable = opponentDiscard.filter(card =>
      /Energy|VS Seeker|Raihan|Tulip|Battle Compressor|Night Stretcher/i.test(card)).length;
    return 88 + Math.min(24, valuable * 6);
  }
  if (name === 'Copycat') return copycatTargetAvailable(request) ? 132 : 0;
  if (name === 'Energy Drive') {
    const damage = totalEnergyCount(observation) * 20 * psychicMultiplier;
    return 85 + Math.min(30, totalEnergyCount(observation) * 3) +
      (hp > 0 && damage >= hp ? 18 : 0);
  }
  const printedDamage = Number.parseInt(String(
    list(observation.ownPublic.active?.attacks)
      .find(attack => attack.name === name)?.damage ?? '0'), 10) || 0;
  return 40 + Math.min(80, printedDamage / 2) +
    (hp > 0 && printedDamage >= hp ? 15 : 0);
}

function scoreAction(item, request) {
  const observation = request.observation;
  const hand = list(observation.ownHand);
  const own = observation.ownPublic;
  const opponent = observation.opponentPublic;
  const receiptKO = priorOpponentTurnKO(request);
  const psychicHand = psychicCountInHand(observation);
  const psychicDiscard = psychicCountInDiscard(observation);
  const boardV = countBoard(own, PRINT.shadowRiderV);
  const boardVmax = countBoard(own, PRINT.shadowRiderVmax);
  const supporterAvailable = observation.ownTurnResources.supporterPlayedTurn === 0;
  const paleMoon = priorPaleMoon(request);
  const latias = damagedLatias(own);
  const ownHandCount = hand.length;
  const opponentHandCount = opponent.handCount ?? 0;

  if (item.kind === 'pass') return 0;
  if (item.kind === 'attack') return scoreAttack(item, request);

  if (item.kind === 'use-ability') {
    const ability = item.publicMetadata?.abilityName ?? '';
    if (ability === 'Climactic Gate') return 0;
    if (ability === 'Underworld Door' && psychicHand > 0) return 150;
    if (ability === 'Resetting Hole') return pathLockActive(observation) ? 138 : 0;
    if (ability === 'Star Alchemy' &&
        observation.ownTurnResources.vstarUsed === false) return 132;
    if (ability === 'Wonder Tag') {
      return observation.ownTurnResources.supporterPlayedTurn === 0 ? 122 : 65;
    }
    return 20;
  }

  if (item.kind === 'play-card') {
    const card = item.actorPrinting ?? '';

    // The primary V line must be reachable from hand. The native frontier
    // already proves the play is legal; require an actor-owned empty Bench slot.
    if (matches(card, PRINT.shadowRiderV) &&
        isActorBenchPlacement(item, observation)) return boardV < 2 ? 160 : 0;

    // Manual Basic Psychic Energy is projected as a play-card action with an
    // actor-owned active/Bench target, not as an energy-payment prompt.
    if (matches(card, PRINT.psychic)) return scoreManualPsychicEnergy(item, request);

    if (matches(card, PRINT.latias) &&
        isActorBenchPlacement(item, observation) &&
        !boardHas(own, PRINT.latias) &&
        boardSlots(own).some(slot => String(slot.printed?.stage ?? '').toUpperCase() === 'BASIC')) return 112;

    if (matches(card, PRINT.girafarig) &&
        isActorBenchPlacement(item, observation) &&
        !boardHas(own, PRINT.girafarig)) {
      const valuableDiscard = list(opponent.discard).filter(value =>
        /Energy|VS Seeker|Raihan|Tulip|Battle Compressor|Night Stretcher/i.test(value)).length;
      if (valuableDiscard > 0) return 104 + Math.min(12, valuableDiscard * 3);
    }

    if (matches(card, PRINT.trevenant) &&
        isActorBenchPlacement(item, observation) &&
        !boardHas(own, PRINT.trevenant)) {
      const restrictions = opponent.active?.publicRestrictions ?? {};
      const trapped = restrictions.cannotRetreat === true ||
        restrictions.cannotRetreatNextTurn === true ||
        restrictions.cannotRetreatWhileActive === true;
      if ((opponent.handCount ?? 0) >= 2 || trapped) {
        return 108 + Math.min(8, opponent.handCount ?? 0);
      }
    }

    // Climactic Gate is turn-ending. Its root play is deliberately deferred
    // until bestAction has exhausted every positive non-terminal action.
    if (matches(card, PRINT.radiantEternatus) &&
        isActorBenchPlacement(item, observation)) {
      return shouldUseClimacticGate(observation) ? 145 : 0;
    }

    if (matches(card, PRINT.shadowRiderVmax) &&
        matches(item.targetPrinting ?? '', PRINT.shadowRiderV)) return 148;

    if (includes(card, 'Acerola') && supporterAvailable && paleMoon &&
        latias && matches(own.active?.printing ?? '', PRINT.latias)) return 175;

    if (includes(card, 'Tulip') && supporterAvailable && psychicDiscard >= 2) {
      return 160 + Math.min(9, psychicDiscard * 3);
    }

    if (includes(card, 'Raihan') && supporterAvailable && receiptKO &&
        psychicDiscard > 0) return 155;

    if (includes(card, 'Teammates') && supporterAvailable && receiptKO) return 138;

    if (includes(card, 'Unfair Stamp') &&
        (receiptKO || opponentHandCount >= ownHandCount + 3 ||
          opponent.prizeCount < 6)) return 142;

    if (includes(card, 'Field Blower') && pathLockActive(observation) &&
        boardSlots(own).some(slot => hasAbility(slot, 'Underworld Door'))) return 140;

    if (includes(card, 'Battle Compressor') &&
        (hasPrinting(hand, /Tulip PAR\b/i) || hasPrinting(hand, /VS Seeker PHF\b/i)) &&
        psychicDiscard < 3) return 118;

    if (includes(card, 'Mysterious Treasure') &&
        (boardV < 2 || (copycatTargetAvailable(request) &&
          !boardHas(own, PRINT.mimikyu) && !hasPrinting(hand, PRINT.mimikyu)) ||
          (pathLockActive(observation) && !boardHas(own, PRINT.marshadow) &&
            !hasPrinting(hand, PRINT.marshadow)) ||
          (hasDragonActive(observation) && pathLockStatus(observation) === false &&
            !fairyZoneActive(observation) && !boardHas(own, PRINT.clefairy) && !hasPrinting(hand, PRINT.clefairy))) &&
        hand.length > 1) return 132;

    if (matches(card, PRINT.marshadow) && pathLockActive(observation)) return 138;
    if (matches(card, PRINT.tapuLele) && !hasSupporterInHand(hand) &&
        observation.ownTurnResources.supporterPlayedTurn === 0) return 110;
    if (matches(card, PRINT.clefairy) && hasDragonActive(observation) &&
        pathLockStatus(observation) === false && !fairyZoneActive(observation) &&
        !boardHas(own, PRINT.clefairy)) return 130;
    if (matches(card, PRINT.mimikyu) && copycatTargetAvailable(request) &&
        !boardHas(own, PRINT.mimikyu)) return 118;

    if (includes(card, 'Fog Crystal') &&
        (psychicHand === 0 || boardV < 2 ||
          (hasDragonActive(observation) && pathLockStatus(observation) === false &&
            !fairyZoneActive(observation) && !boardHas(own, PRINT.clefairy) &&
            !hasPrinting(hand, PRINT.clefairy)))) return 108;

    if (includes(card, 'Quick Ball') &&
        (boardV < 2 || (hasDragonActive(observation) && pathLockStatus(observation) === false &&
          !fairyZoneActive(observation) && !boardHas(own, PRINT.clefairy) &&
          !hasPrinting(hand, PRINT.clefairy))) && hand.length > 1) return 102;

    if (includes(card, 'Forest Seal Stone') &&
        observation.ownTurnResources.vstarUsed === false && boardVmax > 0) return 105;

    if (includes(card, 'VS Seeker') &&
        (psychicDiscard >= 2 || receiptKO)) return 100;

    if (includes(card, 'Night Stretcher') &&
        psychicDiscard > 0 && psychicHand === 0) return 96;

    if (includes(card, 'Lillie') && includes(card, 'Determination') &&
        supporterAvailable && ownHandCount <= 4) return 86;

    if (includes(card, 'Iono') && supporterAvailable &&
        (ownHandCount <= 3 || opponentHandCount >= ownHandCount + 3)) return 90;

    if (includes(card, 'Carmine') && supporterAvailable && ownHandCount <= 4) return 82;

    if (includes(card, 'Guzma') && supporterAvailable &&
        opponentHasWeakBenchTarget(observation)) return 92;

    if (includes(card, 'Acerola') && supporterAvailable && latias &&
        remainingHp(latias) <= 120) return 92;

    if (includes(card, 'Sky Field') && countBench(own) >= 5 &&
        hand.some(value => /Pokémon|Calyrex|Latias|Mimikyu|Girafarig/i.test(value))) return 80;

    if (includes(card, 'Dimension Valley') &&
        activeStadiums(observation).length === 0) return 78;

    if (includes(card, 'Float Stone') &&
        boardSlots(own).some(slot => matches(slot.printing, PRINT.latias) &&
          !list(slot.tools).some(tool => includes(tool, 'Float Stone')))) return 76;

    return 0;
  }

  if (item.kind === 'retreat') {
    const targetIndex = item.publicMetadata?.benchIndex;
    const target = Number.isSafeInteger(targetIndex) ? own.bench[targetIndex] : null;
    const active = own.active;
    if (!target || !active) return 5;
    const targetIsAttacker = matches(target.printing, PRINT.shadowRiderVmax) ||
      matches(target.printing, PRINT.latias) ||
      matches(target.printing, PRINT.trevenant) ||
      (matches(target.printing, PRINT.mimikyu) && copycatTargetAvailable(request));
    const activeIsAttacker = matches(active.printing, PRINT.shadowRiderVmax) ||
      matches(active.printing, PRINT.latias) ||
      matches(active.printing, PRINT.trevenant);
    const activeLocked = active.publicRestrictions?.cannotAttackNextTurn === true ||
      active.publicRestrictions?.cannotRetreat === true;
    if (matches(target.printing, PRINT.shadowRiderVmax) &&
        maxGeistDamage(request) >= remainingHp(activeTarget(opponent)) &&
        (!activeIsAttacker || activeLocked)) return 128;
    return targetIsAttacker && (!activeIsAttacker || activeLocked) ? 84 : 8;
  }

  if (item.kind === 'use-stadium') {
    return 45;
  }

  return 0;
}

function bestAction(request) {
  const items = list(request.actionFrontier?.items)
    .filter(item => ['play-card', 'attack', 'retreat', 'use-ability',
      'use-stadium', 'pass'].includes(item.kind));
  if (items.length === 0) return { kind: 'abstain', reasonCode: 'NO_EXECUTABLE_ACTION' };

  // Radiant Eternatus is not an ordinary high-score play: using Climactic Gate
  // ends the turn. Always exhaust positive non-terminal actions first, then
  // reconsider the Gate play on the next root decision.
  const terminalGateItems = items.filter(item =>
    item.kind === 'play-card' &&
    matches(item.actorPrinting ?? '', PRINT.radiantEternatus));
  const ordinaryItems = items.filter(item => !terminalGateItems.includes(item));

  let best = null;
  let bestScore = -1;
  for (const item of ordinaryItems) {
    const score = scoreAction(item, request);
    recordPolicyAuditScore(item.token, score, 'NO_ROOT_ACTION_SCORE');
    if (score > bestScore) {
      best = item;
      bestScore = score;
    }
  }
  if (best && bestScore > 0) {
    setPolicyAuditRule('ROOT_MAX_ACTION_SCORE', 'STRICT_GREATER_THAN_FIRST_NATIVE_FRONTIER_ORDER');
    return { kind: 'select-action', token: best.token };
  }

  let gate = null;
  let gateScore = -1;
  for (const item of terminalGateItems) {
    const score = scoreAction(item, request);
    recordPolicyAuditScore(item.token, score, 'NO_TERMINAL_GATE_SCORE');
    if (score > gateScore) {
      gate = item;
      gateScore = score;
    }
  }
  if (gate && gateScore > 0) {
    setPolicyAuditRule('ROOT_CLIMACTIC_GATE_LAST_USE',
      'ONLY_WHEN_NO_POSITIVE_NONTERMINAL_ACTION');
    return { kind: 'select-action', token: gate.token };
  }

  const pass = items.find(item => item.kind === 'pass');
  if (pass) {
    setPolicyAuditRule('ROOT_PASS_FALLBACK', 'FIRST_NATIVE_FRONTIER_ORDER');
    recordPolicyAuditRule(pass.token, 'PASS_FALLBACK');
    return { kind: 'select-action', token: pass.token };
  }
  return { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ACTION' };
}

function choicePrinting(choice) {
  return choice?.printing ?? '';
}

function choiceZone(choice) {
  return choice?.publicMetadata?.targetZone ??
    choice?.publicMetadata?.sourceZone ?? '';
}

function choiceOwner(choice) {
  return choice?.publicMetadata?.ownerSeat ?? '';
}

function findVisibleSlot(player, zone, printing) {
  if (!player || typeof printing !== 'string') return null;
  if (zone === 'active' && player.active?.printing === printing) return player.active;
  if (zone === 'bench') {
    return list(player.bench).find(slot => slot?.printing === printing) ?? null;
  }
  return null;
}

function isRadiantClimacticGatePrompt(prompt, observation) {
  const sourcePrinting = prompt?.source?.sourcePrinting ?? '';
  return prompt?.source?.classification === 'actor-choice' &&
    prompt.source.sourceKind === 'card-effect' &&
    matches(sourcePrinting, PRINT.radiantEternatus) &&
    prompt.source.effectName === 'Climactic Gate' &&
    list(observation?.ownPublic?.bench).some(slot =>
      matches(slot?.printing ?? '', PRINT.radiantEternatus));
}

function scorePokemonChoice(choice, observation, mode) {
  const meta = choice.publicMetadata ?? {};
  if (meta.ownerSeat !== 'actor') return -1;
  const slot = findVisibleSlot(observation.ownPublic, meta.targetZone, choice.printing);
  if (!slot) return -1;

  if (mode === 'underworld' || mode === 'raihan') {
    const energy = psychicEnergyOn(slot);
    const active = meta.targetZone === 'active';
    const stadiums = activeStadiums(observation);
    if (matches(slot.printing, PRINT.latias) && energy < 2) return 135 - energy * 5;
    if (matches(slot.printing, PRINT.trevenant) && energy < 3) return 125 - energy * 5;
    if (matches(slot.printing, PRINT.girafarig) && energy < 1 &&
        !stadiums.some(stadium => /Dimension Valley/i.test(stadium))) return 115;
    if (matches(slot.printing, PRINT.mimikyu) && energy < 2) return 100 - energy * 5;
    if (matches(slot.printing, PRINT.shadowRiderVmax)) return 95 - energy;
    if (matches(slot.printing, PRINT.shadowRiderV)) return 80 - energy;
    return mode === 'raihan' ? 25 - energy : 20 - energy;
  }

  if (mode === 'promotion') {
    return remainingHp(slot) > 150 ? 1000 - prizeLiability(slot) * 250 + remainingHp(slot) :
      100 - prizeLiability(slot) * 20 + remainingHp(slot);
  }

  if (mode === 'acerola') {
    return Number(slot.damage) > 0 ?
      500 + Number(slot.damage) + (matches(slot.printing, PRINT.latias) ? 100 : 0) : -1;
  }

  if (mode === 'evolution') {
    return matches(slot.printing, PRINT.shadowRiderV) ? 500 : -1;
  }

  return -1;
}

function sortedChoiceTokens(choices, score) {
  return list(choices).map((choice, index) => {
    const value = score(choice);
    recordPolicyAuditScore(choice.token, value, 'NO_PROMPT_SCORE');
    return { choice, index, score: value };
  }).filter(row => row.score >= 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(row => row.choice.token);
}

function cardSearchScore(printing, request, effectName) {
  const observation = request.observation;
  const hand = observation.ownHand;
  const own = observation.ownPublic;
  const opponent = observation.opponentPublic;
  const knownV = knownCardCount(observation, PRINT.shadowRiderV);
  const knownVmax = knownVmaxOutsideHiddenZones(observation).knownOutsideHidden;
  const psychicHand = psychicCountInHand(observation);
  const psychicDiscard = psychicCountInDiscard(observation);
  const psychicBoard = psychicCountOnBoard(observation);

  if (includes(effectName, 'VS Seeker') || includes(effectName, 'Wonder Tag')) {
    if (includes(printing, 'Acerola') && priorPaleMoon(request) &&
        damagedLatias(own) && matches(own.active?.printing ?? '', PRINT.latias)) return 180;
    if (includes(printing, 'Tulip') && psychicDiscard >= 2 &&
        !hasPrinting(hand, /Tulip PAR\b/i)) return 170;
    if (includes(printing, 'Raihan') && priorOpponentTurnKO(request)) return 160;
    if (includes(printing, 'Unfair Stamp') &&
        (priorOpponentTurnKO(request) ||
          (opponent.handCount ?? 0) >= hand.length + 3)) return 155;
    if (includes(printing, 'Teammates') && priorOpponentTurnKO(request)) return 150;
    if (includes(printing, 'Guzma') && opponentHasWeakBenchTarget(observation)) return 140;
    if ((includes(printing, 'Lillie') || includes(printing, 'Carmine')) &&
        hand.length <= 4) return 125;
    if (includes(printing, 'Iono') && (opponent.handCount ?? 0) >= hand.length + 3) return 130;
    return 20;
  }

  if (matches(printing, PRINT.marshadow) && pathLockActive(observation) &&
      !boardHas(own, PRINT.marshadow) && !hasPrinting(hand, PRINT.marshadow)) return 170;
  if (matches(printing, PRINT.tapuLele) && !hasSupporterInHand(hand) &&
      !boardHas(own, PRINT.tapuLele) && !hasPrinting(hand, PRINT.tapuLele)) return 115;
  if (matches(printing, PRINT.clefairy) && hasDragonActive(observation) &&
      pathLockStatus(observation) === false && !fairyZoneActive(observation) &&
      !boardHas(own, PRINT.clefairy) && !hasPrinting(hand, PRINT.clefairy)) return 160;

  if (includes(effectName, 'Star Alchemy') || includes(effectName, 'Forest Seal Stone')) {
    if (includes(printing, 'Field Blower') && pathLockActive(observation)) return 180;
    if (matches(printing, PRINT.marshadow) && pathLockActive(observation)) return 170;
    if (includes(printing, 'Unfair Stamp') &&
        (priorOpponentTurnKO(request) || (opponent.handCount ?? 0) >= hand.length + 3)) return 170;
    if (includes(printing, 'Tulip') && psychicDiscard >= 2 &&
        !hasPrinting(hand, /Tulip PAR\b/i)) return 160;
    if (includes(printing, 'Mysterious Treasure') && knownV < 2) return 150;
    if (matches(printing, PRINT.shadowRiderVmax) && knownVmax < 2) return 140;
  }

  if (includes(effectName, 'Raihan')) {
    if (matches(printing, PRINT.shadowRiderVmax) && knownVmax < 2) return 160;
    if (matches(printing, PRINT.shadowRiderV) && knownV < 2) return 150;
    if (includes(printing, 'Unfair Stamp') &&
        (priorOpponentTurnKO(request) ||
          (opponent.handCount ?? 0) >= hand.length + 3)) return 145;
    if (includes(printing, 'Mysterious Treasure') && knownV < 2) return 140;
    if (includes(printing, 'Tulip') && psychicDiscard >= 2 &&
        !hasPrinting(hand, /Tulip PAR\b/i)) return 130;
    if (matches(printing, PRINT.psychic)) return 20;
  }

  if (includes(effectName, 'Fog Crystal')) {
    const vInHand = hasPrinting(hand, PRINT.shadowRiderV);
    if (matches(printing, PRINT.shadowRiderV) && knownV < 2 && !vInHand) return 160;
    if (matches(printing, PRINT.psychic) && psychicHand === 0) return 140;
  }

  if (includes(effectName, 'Battle Compressor') &&
      (hasPrinting(hand, /Tulip PAR\b/i) || hasPrinting(hand, /VS Seeker PHF\b/i))) {
    if (matches(printing, PRINT.psychic)) return 165;
    if (includes(printing, 'VS Seeker') || includes(printing, 'Tulip')) return 120;
  }

  if (matches(printing, PRINT.psychic)) {
    if (includes(effectName, 'Tulip')) return 140;
    if (includes(effectName, 'Night Stretcher') && psychicHand === 0) return 135;
    return 80;
  }

  if (matches(printing, PRINT.mimikyu) && copycatTargetAvailable(request) &&
      !boardHas(own, PRINT.mimikyu) && !hasPrinting(hand, PRINT.mimikyu)) {
    return knownV >= 2 ? 135 : 115;
  }
  if (matches(printing, PRINT.shadowRiderV) && knownV < 2) return 130;
  if (matches(printing, PRINT.shadowRiderVmax) && knownVmax < 2) return 125;
  if (matches(printing, PRINT.radiantEternatus) &&
      shouldUseClimacticGate(observation)) return 118;
  if (matches(printing, PRINT.trevenant) && psychicBoard < 3) return 110;
  if (matches(printing, PRINT.latias) && !boardHas(own, PRINT.latias) &&
      !hasPrinting(hand, PRINT.latias)) return 105;
  if (matches(printing, PRINT.girafarig) && !boardHas(own, PRINT.girafarig) &&
      !hasPrinting(hand, PRINT.girafarig)) return 92;
  if (matches(printing, PRINT.dialga) && !boardHas(own, PRINT.dialga) &&
      !hasPrinting(hand, PRINT.dialga)) return 80;
  return -1;
}

function getLostChoiceScore(choice) {
  if (choiceOwner(choice) !== 'opponent' ||
      !/discard/i.test(choiceZone(choice))) return -1;
  const printing = choicePrinting(choice);
  if (/Special Charge|Energy Retrieval|Superior Energy Retrieval|Night Stretcher|Ordinary Rod|Super Rod|VS Seeker|Battle Compressor/i.test(printing)) return 150;
  if (/Double Colorless Energy|Double Dragon Energy|Rainbow Energy|Prism Energy|Special Energy/i.test(printing)) return 140;
  if (/Guzma|Raihan|Tulip|Teammates|N|Professor|Iono/i.test(printing)) return 120;
  if (/VMAX|\b-GX\b|\bex\b/i.test(printing)) return 90;
  if (matches(printing, PRINT.psychic)) return 65;
  return 30;
}

function fieldBlowerChoiceScore(choice) {
  if (choiceOwner(choice) !== 'opponent') return -1;
  const printing = choicePrinting(choice);
  if (/Path to the Peak|Silent Lab|Garbotoxin|Garbotoxin Tool/i.test(printing)) return 180;
  if (choiceZone(choice) === 'tool') return 110;
  if (choiceZone(choice) === 'stadium') return 100;
  return -1;
}

function discardChoiceScore(choice, observation) {
  const printing = choicePrinting(choice);
  const hand = observation.ownHand;
  if (matches(printing, PRINT.psychic)) {
    return psychicCountInHand(observation) > 1 ||
      hasPrinting(hand, /Tulip PAR\b/i) ? 10 : -100;
  }
  if (matches(printing, PRINT.shadowRiderVmax) &&
      countPrinting(hand, PRINT.shadowRiderVmax) > 1) return 20;
  if (includes(printing, 'Carmine') || includes(printing, 'Lillie')) return 30;
  if (includes(printing, 'Unfair Stamp') || includes(printing, 'Raihan') ||
      includes(printing, 'Tulip') || includes(printing, 'Acerola')) return -80;
  if (matches(printing, PRINT.shadowRiderV) &&
      countPrinting(hand, PRINT.shadowRiderV) > 1) return 35;
  return 50;
}

function engineSetupPromptDecision(prompt, observation, choices, metadata) {
  // These three native setup prompts are the only engine-origin prompts this
  // policy accepts. Keep the phase guard exact: Twinleaf emits them in SETUP=1.
  if (observation.phase !== 1 || prompt.source.sourceKind !== 'engine' ||
      prompt.source.sourcePrinting !== null) {
    return null;
  }

  if (prompt.promptType === 'ChooseCardsPrompt' &&
      prompt.description === 'CHOOSE_STARTING_POKEMONS') {
    setPolicyAuditRule('ENGINE_STARTING_BASICS_ORDER', 'SHADOW_RIDER_V_FIRST_THEN_NATIVE_ORDER');
    const min = metadata.minimumCount;
    const max = metadata.maximumCount;
    const validPrompt = metadata.selectionType === 'card-combination' &&
      metadata.sourceZone === 'hand' &&
      metadata.ownerSeat === 'actor' &&
      metadata.isOwnerVisible === true &&
      metadata.allowCancel === false &&
      metadata.isSecret === false &&
      Number.isSafeInteger(min) && min >= 0 &&
      Number.isSafeInteger(max) && max >= min;
    if (!validPrompt) {
      return { kind: 'abstain', reasonCode: 'INVALID_STARTING_POKEMON_PROMPT' };
    }

    const own = observation.ownPublic;
    const bench = Array.isArray(own?.bench) ? own.bench : null;
    if (!bench) {
      return { kind: 'abstain', reasonCode: 'MISSING_PUBLIC_BENCH_FOR_SETUP' };
    }
    const active = own.active ?? null;
    const emptyBenchSlots = bench.filter(slot => slot === null).length;
    const cardChoices = choices.filter(choice =>
      choice.kind === 'card' &&
      typeof choice.token === 'string' &&
      typeof choice.printing === 'string' &&
      choice.publicMetadata?.sourceZone === 'hand' &&
      choice.publicMetadata?.ownerSeat === 'actor' &&
      choice.publicMetadata?.isOwnerVisible === true);

    if (min === 1) {
      if (active !== null || cardChoices.length === 0) {
        return { kind: 'abstain', reasonCode: 'NO_VISIBLE_STARTING_POKEMON' };
      }
      // The first selected card becomes Active. Prefer the deck's primary
      // Shadow Rider V; preserve native hand order for all remaining Basics.
      const ordered = cardChoices.slice();
      const primaryIndex = ordered.findIndex(choice =>
        matches(choice.printing, PRINT.shadowRiderV));
      if (primaryIndex > 0) {
        ordered.unshift(ordered.splice(primaryIndex, 1)[0]);
      }
      const capacity = 1 + emptyBenchSlots;
      const tokens = ordered.slice(0, Math.min(max, capacity))
        .map(choice => choice.token);
      return tokens.length >= min
        ? { kind: 'select-choices', tokens }
        : { kind: 'abstain', reasonCode: 'NO_VISIBLE_STARTING_POKEMON' };
    }

    if (min === 0) {
      if (active === null) {
        return { kind: 'abstain', reasonCode: 'MISSING_ACTIVE_FOR_EXTRA_BENCH' };
      }
      const tokens = cardChoices.slice(0, Math.min(max, emptyBenchSlots))
        .map(choice => choice.token);
      if (tokens.length > 0) return { kind: 'select-choices', tokens };
      const empty = choices.find(choice => choice.kind === 'empty-selection');
      return empty
        ? { kind: 'select-choice', token: empty.token }
        : { kind: 'abstain', reasonCode: 'NO_EMPTY_BENCH_SELECTION' };
    }

    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_STARTING_POKEMON_CARDINALITY' };
  }

  if (prompt.promptType === 'ConfirmPrompt' &&
      prompt.description === 'GO_FIRST') {
    setPolicyAuditRule('ENGINE_GO_FIRST_AFFIRMATIVE', 'YES_CHOICE');
    if (metadata.selectionType !== 'confirm') {
      return { kind: 'abstain', reasonCode: 'INVALID_GO_FIRST_CONFIRMATION' };
    }
    const yes = choices.find(choice =>
      choice.kind === 'confirm' && /^yes$/i.test(choice.label ?? ''));
    const no = choices.find(choice =>
      choice.kind === 'confirm' && /^no$/i.test(choice.label ?? ''));
    if (!yes || !no) {
      return { kind: 'abstain', reasonCode: 'UNRECOGNIZED_GO_FIRST_CHOICES' };
    }
    // This prompt is offered to the coin-flip winner. Yes deterministically
    // elects the first turn; this is a policy default, not a win-rate claim.
    return { kind: 'select-choice', token: yes.token };
  }

  if (prompt.promptType === 'SelectPrompt' &&
      prompt.description === 'WANT_TO_DRAW_CARDS') {
    setPolicyAuditRule('ENGINE_MAX_MULLIGAN_DRAW', 'DRAW_COUNT_DESC_CHOICE_INDEX_ASC');
    const count = metadata.count;
    if (metadata.selectionType !== 'option' ||
        !Number.isSafeInteger(count) || count < 1) {
      return { kind: 'abstain', reasonCode: 'INVALID_MULLIGAN_DRAW_OPTIONS' };
    }
    const options = choices.filter(choice => choice.kind === 'option');
    if (options.length !== count) {
      return { kind: 'abstain', reasonCode: 'INCOMPLETE_MULLIGAN_DRAW_OPTIONS' };
    }

    const seen = new Set();
    const ranked = [];
    for (const choice of options) {
      const choiceIndex = choice.publicMetadata?.choiceIndex;
      if (!Number.isSafeInteger(choiceIndex) ||
          choiceIndex < 0 || choiceIndex >= count || seen.has(choiceIndex)) {
        return { kind: 'abstain', reasonCode: 'INVALID_MULLIGAN_DRAW_INDEX' };
      }
      seen.add(choiceIndex);
      const expectedDrawCount = count - 1 - choiceIndex;
      recordPolicyAuditScore(choice.token, expectedDrawCount, 'MULLIGAN_DRAW_COUNT');
      const labelMatch = String(choice.label ?? '').match(/^Draw (\d+) card\(s\)$/i);
      if (!labelMatch || Number(labelMatch[1]) !== expectedDrawCount) {
        return { kind: 'abstain', reasonCode: 'MULLIGAN_DRAW_LABEL_INDEX_MISMATCH' };
      }
      ranked.push({ choice, drawCount: expectedDrawCount, choiceIndex });
    }
    if (seen.size !== count) {
      return { kind: 'abstain', reasonCode: 'INCOMPLETE_MULLIGAN_DRAW_INDEXES' };
    }
    ranked.sort((a, b) =>
      b.drawCount - a.drawCount || a.choiceIndex - b.choiceIndex);
    return { kind: 'select-choice', token: ranked[0].choice.token };
  }

  return null;
}

function promptDecision(request) {
  const prompt = request.prompt;
  const observation = request.observation;
  const choices = list(prompt.choices);
  const effectName = prompt.source.effectName ?? '';
  const sourcePrinting = prompt.source.sourcePrinting ?? '';
  const effect = effectName + ' ' + sourcePrinting;
  const metadata = prompt.publicMetadata ?? {};
  if (effectName === 'Climactic Gate' && !isRadiantClimacticGatePrompt(prompt, observation)) {
    return {
      kind: 'abstain',
      reasonCode: prompt.promptType === 'ConfirmPrompt'
        ? 'UNSUPPORTED_CONFIRMATION_SOURCE'
        : 'UNSUPPORTED_POKEMON_PROMPT'
    };
  }
  const selectionType = metadata.selectionType ?? '';
  const engineSetupDecision = engineSetupPromptDecision(prompt, observation, choices, metadata);
  if (engineSetupDecision) return engineSetupDecision;
  const min = Number.isSafeInteger(metadata.minimumCount) ? metadata.minimumCount :
    selectionType === 'prize-slots' ? (metadata.requiredCount ?? 1) :
      selectionType === 'card-order' ? (metadata.count ?? 1) : 1;
  const max = Number.isSafeInteger(metadata.maximumCount) ? metadata.maximumCount :
    selectionType === 'energy-payment' ? (metadata.energyCount ?? metadata.count ?? 1) :
      selectionType === 'prize-slots' ? (metadata.requiredCount ?? 1) :
        selectionType === 'card-order' ? (metadata.count ?? 1) : 1;

  // The pinned Underworld Door projects each legal (hand Psychic Energy, Psychic
  // Bench target) pair as one energy-attachment choice. This is not an Energy
  // *payment* prompt: select exactly one paired assignment, never bare Energy.
  // Require both the exact source and a typed actor Bench index; do not guess on
  // unrelated AttachEnergyPrompt shapes or expose non-actor state.
  if (prompt.promptType === 'AttachEnergyPrompt') {
    if (selectionType !== 'energy-attachment' || min !== 1 || max !== 1 ||
        prompt.source.sourceKind !== 'card-effect' ||
        effectName !== 'Underworld Door' ||
        !matches(sourcePrinting, PRINT.shadowRiderVmax)) {
      return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
    }
    setPolicyAuditRule('UNDERWORLD_ATTACH_BENCH_SCORE', 'SCORE_DESC_CHOICE_INDEX_ASC');
    const legalPairs = choices.filter(choice =>
      choice.kind === 'energy' &&
      choice.publicMetadata?.sourceZone === 'hand' &&
      choice.publicMetadata?.ownerSeat === 'actor' &&
      choice.publicMetadata?.isOwnerVisible === true &&
      choice.publicMetadata?.energyType === 'BASIC' &&
      choice.publicMetadata?.zone === 'bench' &&
      choice.publicMetadata?.selectedCount === 1);
    const ranked = sortedChoiceTokens(legalPairs, choice => {
      const index = choice.publicMetadata?.benchIndex;
      const slot = Number.isSafeInteger(index) && index >= 0 && index < 5 ?
        list(observation.ownPublic.bench)[index] : null;
      if (!slot || !matches(choice.printing, PRINT.psychic)) return -1;
      const energy = psychicEnergyOn(slot);
      const stadiums = activeStadiums(observation);
      if (matches(slot.printing, PRINT.latias) && energy < 2) return 135 - energy * 5;
      if (matches(slot.printing, PRINT.trevenant) && energy < 3) return 125 - energy * 5;
      if (matches(slot.printing, PRINT.girafarig) && energy < 1 &&
          !stadiums.some(stadium => /Dimension Valley/i.test(stadium))) return 115;
      if (matches(slot.printing, PRINT.mimikyu) && energy < 2) return 100 - energy * 5;
      if (matches(slot.printing, PRINT.shadowRiderVmax)) return 95 - energy;
      if (matches(slot.printing, PRINT.shadowRiderV)) return 80 - energy;
      return 20 - energy;
    });
    return ranked.length > 0 ? { kind: 'select-choice', token: ranked[0] } :
      { kind: 'abstain', reasonCode: 'NO_VISIBLE_ENERGY_CHOICE' };
  }

  if (prompt.promptType === 'ChoosePokemonPrompt' || selectionType === 'pokemon') {
    let mode = '';
    if (includes(effect, 'Underworld Door')) mode = 'underworld';
    else if (includes(effect, 'Raihan')) mode = 'raihan';
    else if (includes(effect, 'Acerola')) mode = 'acerola';
    else if (effectName === 'Climactic Gate' &&
        isRadiantClimacticGatePrompt(prompt, observation)) mode = 'evolution';
    else if (prompt.source.sourceKind === 'engine' && observation.ownPublic.active === null) mode = 'promotion';
    else if (includes(effect, 'Guzma')) {
      const candidates = choices.filter(choice =>
        choice.kind === 'pokemon' && choiceOwner(choice) === 'opponent');
      setPolicyAuditRule('GUZMA_OPPONENT_TARGET_SCORE', 'SCORE_DESC_CHOICE_INDEX_ASC');
      const scored = candidates.map((choice, index) => {
        const slot = findVisibleSlot(observation.opponentPublic,
          choiceZone(choice), choice.printing);
        const score = slot ? (500 - Math.max(0, remainingHp(slot)) +
          prizeLiability(slot) * 40) : -1;
        recordPolicyAuditScore(choice.token, score, 'NO_VISIBLE_TARGET_SCORE');
        return { choice, index, score };
      }).filter(row => row.score >= 0)
        .sort((a, b) => b.score - a.score || a.index - b.index);
      if (scored.length > 0 && min <= 1 && max >= 1) {
        return { kind: 'select-choices', tokens: [scored[0].choice.token] };
      }
      if (min === 0) {
        const empty = choices.find(choice => choice.kind === 'empty-selection');
        if (empty) return { kind: 'select-choice', token: empty.token };
      }
    }

    if (mode === 'evolution') {
      setPolicyAuditRule('CLIMACTIC_GATE_VMAX_ONLY',
        'ACTOR_DECK_VMAX_IN_NATIVE_CHOICE_ORDER');
      if (!shouldUseClimacticGate(observation)) {
        if (min === 0) {
          const empty = choices.find(choice => choice.kind === 'empty-selection');
          if (empty) return { kind: 'select-choice', token: empty.token };
        }
        return { kind: 'abstain', reasonCode: 'NO_SUPPORTED_POKEMON_CHOICE' };
      }
      const tokens = choices.filter(choice =>
        choice.kind === 'pokemon' &&
        matches(choice.printing, PRINT.shadowRiderVmax) &&
        choice.publicMetadata?.ownerSeat === 'actor' &&
        choice.publicMetadata?.targetZone === 'deck' &&
        choice.publicMetadata?.isOwnerVisible === true)
        .slice(0, Math.min(max, choices.length)).map(choice => choice.token);
      if (tokens.length >= min && tokens.length > 0) {
        return { kind: 'select-choices', tokens };
      }
      if (min === 0) {
        const empty = choices.find(choice => choice.kind === 'empty-selection');
        if (empty) return { kind: 'select-choice', token: empty.token };
      }
    }
    if (mode && mode !== 'evolution') {
      setPolicyAuditRule('POKEMON_TARGET_SCORE_DESC', 'SCORE_DESC_CHOICE_INDEX_ASC');
      const tokens = sortedChoiceTokens(choices.filter(choice => choice.kind === 'pokemon'),
        choice => scorePokemonChoice(choice, observation, mode)).slice(0, Math.max(1, max));
      if (tokens.length >= min && tokens.length > 0) {
        return { kind: 'select-choices', tokens };
      }
      if (min === 0) {
        const empty = choices.find(choice => choice.kind === 'empty-selection');
        if (empty) return { kind: 'select-choice', token: empty.token };
      }
    }
  }

  if (selectionType === 'card-combination' || selectionType === 'pokemon' ||
      selectionType === 'energy-payment' || selectionType === 'prize-slots' ||
      selectionType === 'card-order') {
    if (selectionType === 'card-combination') {
      setPolicyAuditRule('CARD_SEARCH_SCORE_DESC', 'SCORE_DESC_CHOICE_INDEX_ASC');
      const knownSearchEffect = [
        'Tulip', 'Mysterious Treasure', 'Raihan', 'Fog Crystal',
        'Night Stretcher', 'Battle Compressor', 'Teammates', 'VS Seeker',
        'Quick Ball', 'Forest Seal Stone', 'Hisuian Heavy Ball', 'Climactic Gate',
        'Field Blower', 'Get Lost', 'Wonder Tag', 'Star Alchemy'
      ].some(name => includes(effect, name));
      if (!knownSearchEffect) {
        return { kind: 'abstain', reasonCode: 'UNSUPPORTED_CARD_COMBINATION_SOURCE' };
      }
      const cardChoices = choices.filter(choice => choice.kind === 'card');
      let scored;
      if (includes(effect, 'Mysterious Treasure') &&
          cardChoices.some(choice => choiceZone(choice) === 'hand')) {
        scored = sortedChoiceTokens(cardChoices,
          choice => discardChoiceScore(choice, observation));
      } else if (includes(effect, 'Field Blower')) {
        scored = sortedChoiceTokens(cardChoices, fieldBlowerChoiceScore);
      } else if (includes(effect, 'Get Lost')) {
        scored = sortedChoiceTokens(cardChoices, getLostChoiceScore);
      } else {
        scored = sortedChoiceTokens(cardChoices, choice =>
          cardSearchScore(choicePrinting(choice), request, effect));
      }
      let tokens = scored.slice(0, Math.min(max, scored.length));
      if (tokens.length < min && includes(effect, 'Mysterious Treasure') &&
          choices.some(choice => choiceZone(choice) === 'hand')) {
        tokens = cardChoices.slice(0, min).map(choice => choice.token);
      }
      if (tokens.length >= min && tokens.length > 0) {
        return { kind: 'select-choices', tokens };
      }
      if (min === 0) {
        const empty = choices.find(choice => choice.kind === 'empty-selection');
        if (empty) return { kind: 'select-choice', token: empty.token };
      }
      return { kind: 'abstain', reasonCode: 'NO_SUPPORTED_CARD_SELECTION' };
    }

    if (selectionType === 'pokemon') {
      if (min === 0) {
        const empty = choices.find(choice => choice.kind === 'empty-selection');
        if (empty) return { kind: 'select-choice', token: empty.token };
      }
      return { kind: 'abstain', reasonCode: 'UNCLASSIFIED_POKEMON_PROMPT' };
    }

    if (selectionType === 'energy-payment') {
      setPolicyAuditRule('ENERGY_PAYMENT_FIRST_ELIGIBLE', 'NATIVE_CHOICE_ORDER');
      const required = typeof metadata.energyType === 'string' ?
        Math.max(min, metadata.energyType.split(',').filter(Boolean).length) : min;
      if (required > max) return { kind: 'abstain', reasonCode: 'ENERGY_COST_EXCEEDS_VISIBLE_CHOICES' };
      const energyChoices = choices.filter(choice => choice.kind === 'energy');
      const tokens = energyChoices
        .slice(0, Math.min(required, max, energyChoices.length)).map(choice => choice.token);
      if (tokens.length === required && tokens.length >= min && tokens.length > 0) {
        return { kind: 'select-choices', tokens };
      }
      return { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ENERGY_PAYMENT' };
    }

    if (selectionType === 'prize-slots') {
      setPolicyAuditRule('PRIZE_SLOTS_FIRST_NATIVE_ORDER', 'NATIVE_CHOICE_ORDER');
      const prizeChoices = choices.filter(choice => choice.kind === 'prize');
      const tokens = prizeChoices
        .slice(0, Math.max(min, metadata.requiredCount ?? min))
        .map(choice => choice.token);
      if (tokens.length >= min && tokens.length > 0) {
        return { kind: 'select-choices', tokens };
      }
      if (min === 0) {
        const empty = choices.find(choice => choice.kind === 'empty-selection');
        if (empty) return { kind: 'select-choice', token: empty.token };
      }
      return { kind: 'abstain', reasonCode: 'NO_SUPPORTED_PRIZE_SELECTION' };
    }

    if (selectionType === 'card-order') {
      setPolicyAuditRule('CARD_ORDER_SEARCH_SCORE_DESC', 'SCORE_DESC_CHOICE_INDEX_ASC');
      const orderChoices = choices.filter(choice => choice.kind === 'card-order-item');
      const tokens = sortedChoiceTokens(orderChoices, choice =>
        cardSearchScore(choicePrinting(choice), request, effect))
        .slice(0, Math.min(max, orderChoices.length));
      if (tokens.length >= min && tokens.length > 0) {
        return { kind: 'select-choices', tokens };
      }
      if (min === 0) {
        const empty = choices.find(choice => choice.kind === 'empty-selection');
        if (empty) return { kind: 'select-choice', token: empty.token };
      }
      return { kind: 'abstain', reasonCode: 'NO_SUPPORTED_CARD_ORDER' };
    }
  }

  if (prompt.promptType === 'ChoosePrizePrompt') {
    setPolicyAuditRule('CHOOSE_PRIZE_LOWEST_CHOICE_INDEX', 'CHOICE_INDEX_ASC');
    const choice = choices.filter(row => row.kind === 'prize')
      .sort((a, b) =>
        (a.publicMetadata?.choiceIndex ?? 0) - (b.publicMetadata?.choiceIndex ?? 0))[0];
    return choice ? { kind: 'select-choice', token: choice.token } :
      { kind: 'abstain', reasonCode: 'NO_VISIBLE_PRIZE_SLOT' };
  }

  if (prompt.promptType === 'ChooseAttackPrompt') {
    if (!includes(effect, 'Copycat')) {
      return { kind: 'abstain', reasonCode: 'UNSUPPORTED_ATTACK_CHOICE_SOURCE' };
    }
    setPolicyAuditRule('COPYCAT_ATTACK_SCORE_DESC', 'SCORE_DESC_NATIVE_CHOICE_ORDER');
    const ranked = choices.map((choice, index) => {
      const name = choice.publicMetadata?.sourceAttack ?? choice.label ?? '';
      const score = name === 'Night Watch' ? -100 :
        name === 'Max Geist' ? 100 : name === 'Eon Blade' ? 90 : 50;
      recordPolicyAuditScore(choice.token, score, 'COPYCAT_ATTACK_SCORE');
      return { choice, index, score };
    }).sort((a, b) => b.score - a.score || a.index - b.index);
    const choice = ranked[0]?.choice ?? null;
    return choice ? { kind: 'select-choice', token: choice.token } :
      { kind: 'abstain', reasonCode: 'NO_COPY_ATTACK_CHOICE' };
  }

  if (prompt.promptType === 'ConfirmPrompt' && effectName === 'Climactic Gate') {
    setPolicyAuditRule('CLIMACTIC_GATE_EXPECTED_FETCH_THRESHOLD',
      'YES_IF_EXPECTED_FETCH_COUNT_GE_0_75');
    if (!isRadiantClimacticGatePrompt(prompt, observation)) {
      return { kind: 'abstain', reasonCode: 'UNSUPPORTED_CONFIRMATION_SOURCE' };
    }
    const yes = choices.find(choice =>
      choice.kind === 'confirm' && /^(yes|true|confirm)$/i.test(choice.label ?? ''));
    const no = choices.find(choice =>
      choice.kind === 'confirm' && /^(no|false|decline)$/i.test(choice.label ?? ''));
    if (!yes || !no) {
      return { kind: 'abstain', reasonCode: 'UNRECOGNIZED_SIMPLE_PROMPT' };
    }
    return {
      kind: 'select-choice',
      token: shouldUseClimacticGate(observation) ? yes.token : no.token
    };
  }

  if (prompt.promptType === 'ConfirmPrompt' ||
      prompt.promptType === 'SelectPrompt' ||
      prompt.promptType === 'SelectOptionPrompt') {
    setPolicyAuditRule('CONFIRM_YES_THEN_FIRST_SAFE', 'YES_FIRST_THEN_NATIVE_ORDER');
    const confirmable = [
      'Underworld Door', 'Star Alchemy', 'Forest Seal Stone',
      'Wonder Tag', 'Skyliner', 'Pale Moon-GX'
    ].some(name => includes(effect, name));
    if (!confirmable) {
      return { kind: 'abstain', reasonCode: 'UNSUPPORTED_CONFIRMATION_SOURCE' };
    }
    const yes = choices.find(choice =>
      /^(yes|true|confirm)$/i.test(choice.label ?? ''));
    if (yes) return { kind: 'select-choice', token: yes.token };
    const safe = choices.find(choice => choice.kind === 'option' && choice.label);
    return safe ? { kind: 'select-choice', token: safe.token } :
      { kind: 'abstain', reasonCode: 'UNRECOGNIZED_SIMPLE_PROMPT' };
  }

  return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
}

function createPolicy({ role, seat, policyVersion, config }) {
  if (role !== 'opponent' || (seat !== 0 && seat !== 1) ||
      policyVersion !== POLICY_VERSION || !config ||
      Object.keys(config).length !== 0) {
    throw new Error('AGENT6_POLICY_INIT_MISMATCH');
  }

  function evaluateRequest(request) {
    if (!request || request.role !== 'opponent' || request.seat !== seat ||
        request.observation?.actorSeat !== seat) {
      return { kind: 'abstain', reasonCode: 'ROLE_SEAT_BINDING_MISMATCH' };
    }
    if (request.prompt !== null) return promptDecision(request);
    return bestAction(request);
  }

  return Object.freeze({
    decide(request) {
      return evaluateRequest(request);
    },
    decideWithAudit(request) {
      if (activePolicyAudit !== null) throw new Error('POLICY_AUDIT_REENTRANT');
      activePolicyAudit = createPolicyAuditContext(request);
      try {
        const decision = evaluateRequest(request);
        return { decision, policyAudit: finishPolicyAudit(decision) };
      } finally {
        activePolicyAudit = null;
      }
    }
  });
}

module.exports = { POLICY_VERSION, createPolicy };
