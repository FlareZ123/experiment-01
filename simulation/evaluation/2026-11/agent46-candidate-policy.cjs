'use strict';

/*
 * Agent46 candidate-only policy v1.
 *
 * This module is deliberately a pure worker bundle: it has no imports, engine
 * objects, native actions, Store access, filesystem/network access,
 * hidden deck/Prize identities, physical seed, or policy RNG. Every executable
 * choice is an opaque token copied from the current host-projected frontier.
 * Unknown prompt provenance or actor-visible state fails closed.
 */

const POLICY_VERSION = 'agent46-hood-candidate-v1';

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

function recordPolicyAuditUnscored(token, reasonCode) {
  if (!activePolicyAudit) return;
  const row = activePolicyAudit.byToken.get(token);
  if (!row || row.status === 'scored') return;
  row.status = 'not-evaluated';
  row.score = null;
  row.reasonCode = reasonCode;
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

const P = Object.freeze({
  SHADOW_RIDER_V: 'Shadow Rider Calyrex V CRE',
  SHADOW_RIDER_VMAX: 'Shadow Rider Calyrex VMAX CRE',
  MIMIKYU: 'Mimikyu GRI',
  CLEFAIRY: "Lillie's Clefairy ex JTG",
  LATIAS: 'Latias ex SSP',
  DIALGA: 'Dialga-GX UPR',
  RADIANT_ETERNATUS: 'Radiant Eternatus CRZ',
  TREVENANT_DUSKNOIR: 'Trevenant & Dusknoir-GX UNM'
});

const CORE_PRINTINGS = Object.freeze([
  P.SHADOW_RIDER_V, P.SHADOW_RIDER_VMAX, P.MIMIKYU, P.CLEFAIRY,
  P.LATIAS, P.DIALGA, P.RADIANT_ETERNATUS, P.TREVENANT_DUSKNOIR
]);

const TOOL_NAMES = Object.freeze([
  'Stealthy Hood', 'Float Stone', 'Forest Seal Stone', 'Choice Belt',
  'Muscle Band', 'Big Charm', 'Air Balloon', 'Tool Jammer'
]);

const ITEM_NAMES = Object.freeze([
  'Fog Crystal', 'Mysterious Treasure', 'Quick Ball', 'Ultra Ball',
  'Battle Compressor', 'Hisuian Heavy Ball', 'VS Seeker', 'Field Blower',
  'Unfair Stamp', 'Computer Search', 'Battle VIP Pass', 'Night Stretcher'
]);

function abstain(reasonCode) {
  return { kind: 'abstain', reasonCode };
}

function isText(value) {
  return typeof value === 'string' && value.length > 0;
}

function hasName(value, name) {
  return isText(value) && value.includes(name);
}

function hasAnyName(value, names) {
  return names.some(name => hasName(value, name));
}

function ownBoard(view) {
  return [view.ownPublic.active, ...view.ownPublic.bench].filter(Boolean);
}

function opponentBoard(view) {
  return [view.opponentPublic.active, ...view.opponentPublic.bench].filter(Boolean);
}

function allBoard(view) {
  return [...ownBoard(view), ...opponentBoard(view)];
}

function boardHas(view, name) {
  return ownBoard(view).some(slot => hasName(slot.printing, name));
}

function handHas(view, name) {
  return view.ownHand.some(printing => hasName(printing, name));
}

function discardHas(view, name) {
  return view.ownPublic.discard.some(printing => hasName(printing, name));
}

function opponentHasRegidrago(view) {
  return opponentBoard(view).some(slot => hasName(slot.printing, 'Regidrago'));
}

function opponentHasDragon(view) {
  return opponentBoard(view).some(slot =>
    Array.isArray(slot.printed?.types) && slot.printed.types.includes('Dragon'));
}

function isDragon(slot) {
  return Boolean(slot && (
    slot.printed?.types?.includes('Dragon') ||
    hasName(slot.printing, 'Regidrago')
  ));
}

function abilityStatus(slot, abilityName) {
  if (!slot || !Array.isArray(slot.abilities) ||
      !slot.abilities.includes(abilityName)) return false;
  if (!Array.isArray(slot.abilitySuppressions)) return null;
  const row = slot.abilitySuppressions.find(item => item.abilityName === abilityName);
  if (!row || row.suppressed === null) return null;
  return row.suppressed === false;
}

function boardAbilityStatus(view, abilityName) {
  const holders = ownBoard(view).filter(slot =>
    Array.isArray(slot.abilities) && slot.abilities.includes(abilityName));
  if (holders.length === 0) return false;
  if (holders.some(slot => abilityStatus(slot, abilityName) === true)) return true;
  if (holders.some(slot => abilityStatus(slot, abilityName) === null)) return null;
  return false;
}

function fairyZoneStatus(view) {
  return boardAbilityStatus(view, 'Fairy Zone');
}

function skylinerStatus(view) {
  return boardAbilityStatus(view, 'Skyliner');
}

function psychicEnergyCount(view) {
  return ownBoard(view).reduce((sum, slot) =>
    sum + (slot.energies ?? []).filter(printing =>
      hasName(printing, 'Psychic Energy')).length, 0);
}

function countBench(player) {
  return player.bench.filter(Boolean).length;
}

function slotEnergyCount(slot) {
  return Array.isArray(slot?.energies) ? slot.energies.length : 0;
}

function slotByPrinting(player, printing) {
  if (!printing) return null;
  if (player.active?.printing === printing) return player.active;
  return player.bench.find(slot => slot?.printing === printing) ?? null;
}

function prizeLiability(slot) {
  if (!slot) return 1;
  const subtypes = slot.printed?.subtypes ?? [];
  const printing = slot.printing ?? '';
  if (subtypes.some(value => ['VMAX', 'V-UNION', 'TAG TEAM'].includes(value)) ||
      hasName(printing, 'VMAX') || hasName(printing, 'V-UNION') ||
      hasName(printing, ' & ') && hasName(printing, '-GX')) return 3;
  if (subtypes.some(value => ['ex', 'GX', 'V'].includes(value)) ||
      hasName(printing, '-GX') || / ex(?: |$)/.test(printing) ||
      / V(?: |$)/.test(printing)) return 2;
  return 1;
}

function parseDamage(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const match = /^\s*(\d+)/.exec(value);
  return match ? Number(match[1]) : null;
}

function isUltraBeast(slot) {
  return Boolean(slot?.printed?.subtypes?.includes('Ultra Beast') ||
    hasName(slot?.printing, 'Ultra Beast'));
}

function dimensionValleyStatus(view) {
  const stadiums = [...view.ownPublic.stadium, ...view.opponentPublic.stadium];
  if (!stadiums.some(printing => hasName(printing, 'Dimension Valley'))) return false;
  const ownSuppression =
    view.ownPublic.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining;
  const opponentSuppression =
    view.opponentPublic.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining;
  if (ownSuppression === null || opponentSuppression === null) return null;
  if (ownSuppression > 0 || opponentSuppression > 0) return false;

  const newMoonHolders = allBoard(view).filter(slot =>
    hasName(slot.printing, 'Lunatone') || hasName(slot.printing, 'Solrock'));
  for (const slot of newMoonHolders) {
    const newMoon = abilityStatus(slot, 'New Moon');
    if (newMoon === true) return false;
    if (newMoon === null && slot.abilities?.includes('New Moon')) return null;
  }
  if (stadiums.some(printing => hasName(printing, 'Wondrous Labyrinth'))) return null;
  return true;
}

function effectiveAttackCost(slot, attack, view) {
  const cost = Array.isArray(attack?.cost) ? attack.cost : [];
  let required = cost.length;
  if (required > 0 && cost.includes('Colorless') &&
      slot?.printed?.types?.includes('Psychic') &&
      dimensionValleyStatus(view) === true) {
    required -= 1;
  }
  return required;
}

// Wondrous Labyrinth taxes non-Fairy attacks by one Colorless while active.
 // Null means the actor-visible suppression state cannot justify a playable
 // hypothetical attack; the native action frontier still decides real legality.
function wondrousLabyrinthTax(slot, view) {
  if (slot?.printed?.types?.includes('Fairy')) return 0;
  const stadiums = [...view.ownPublic.stadium, ...view.opponentPublic.stadium];
  if (!stadiums.some(name => hasName(name, 'Wondrous Labyrinth'))) return 0;
  const own = view.ownPublic.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining;
  const opponent = view.opponentPublic.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining;
  if (own === null || opponent === null) return null;
  if (own > 0 || opponent > 0) return 0;
  for (const holder of allBoard(view)) {
    if (!holder.abilities?.includes('New Moon')) continue;
    const status = abilityStatus(holder, 'New Moon');
    if (status === true) return 0;
    if (status === null) return null;
  }
  return 1;
}

function canPayAttack(slot, attack, view) {
  // Fixed Hood Shadow Rider 60 has ONLY Basic Psychic Energy MEE 13:
  // five Psychic cards cannot pay Dialga-GX's Metal-heavy attacks.
  // Source-specific hypothetical-play estimator; native roots remain authoritative.
  if (!Array.isArray(attack?.cost)) return false;
  const attached = Array.isArray(slot?.energies) ? slot.energies : [];
  const labyrinthTax = wondrousLabyrinthTax(slot, view);
  if (labyrinthTax === null ||
      attached.length < effectiveAttackCost(slot, attack, view) + labyrinthTax) {
    return false;
  }
  const typed = attack.cost.filter(type => type !== 'Colorless');
  return typed.every(type => type === 'Psychic') &&
    attached.filter(id => hasName(id, 'Psychic Energy')).length >= typed.length;
}

function weaknessMultiplier(attacker, target, view) {
  if (isDragon(target) && fairyZoneStatus(view) === true) return 2;
  const types = attacker?.printed?.types ?? [];
  const weakness = (target?.printed?.weakness ?? []).find(row =>
    types.includes(row.type));
  if (!weakness || weakness.value === null) return 1;
  const value = String(weakness.value);
  if (value.includes('2')) return 2;
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) && numeric > 1 ? numeric : 1;
}

function resistancePenalty(attacker, target) {
  const types = attacker?.printed?.types ?? [];
  const resistance = (target?.printed?.resistance ?? []).find(row =>
    types.includes(row.type));
  if (!resistance || resistance.value === null) return 0;
  const value = Number.parseInt(String(resistance.value), 10);
  return Number.isFinite(value) ? Math.abs(value) : 0;
}

function attackBaseDamage(attacker, attack, view, target) {
  if (!attack) return null;
  if (attack.name === 'Max Geist') {
    return 10 + 30 * psychicEnergyCount(view);
  }
  if (attack.name === 'Full Moon Rondo') {
    return 20 + 20 * (
      countBench(view.ownPublic) + countBench(view.opponentPublic)
    );
  }
  if (attack.name === 'Timeless-GX') return 150;
  if (attack.name === 'Red Knuckles') {
    return 10 + (isUltraBeast(target) ? 60 : 0);
  }
  if (attack.name === 'Power Beam') return 200;
  if (attack.name === 'Night Watch') return 150;
  if (attack.name === 'Shadow Mist') return 10;
  if (attack.name === 'Filch' || attack.name === 'Copycat' ||
      attack.name === 'Apex Dragon' || attack.name === 'Astral Barrage') return 0;
  return parseDamage(attack.damage);
}

function estimatedDamage(attacker, attack, view, target) {
  const base = attackBaseDamage(attacker, attack, view, target);
  if (base === null) return null;
  const multiplier = weaknessMultiplier(attacker, target, view);
  const damage = Math.max(0, base * multiplier -
    resistancePenalty(attacker, target));
  return Number.isFinite(damage) ? damage : null;
}

function attackScore(attacker, attack, view, target, options = {}) {
  if (!attacker || !attack || !target) return -Infinity;
  if (attack.gxAttack && view.ownPublic.publicTurnRestrictions.gxUsed) return -Infinity;
  if (options.requirePayable === true && !canPayAttack(attacker, attack, view)) {
    return -Infinity;
  }

  if (attack.name === 'Get Lost') {
    const pressure = getLostPressure(view);
    return pressure > 0 ? pressure : -Infinity;
  }

  if (attack.name === 'Copycat') {
    const receipt = options.publicEventReceipt ?? null;
    const eligible = receipt?.opponentCopycatChoices;
    const dialgaReady = discardHas(view, 'Dialga-GX') &&
      !view.ownPublic.publicTurnRestrictions.gxUsed &&
      isDragon(target);
    const apex = Array.isArray(eligible) && eligible.some(row =>
      row.attackName === 'Apex Dragon' &&
      hasName(row.sourcePrinting, 'Regidrago VSTAR'));
    return dialgaReady && apex ? 50000 : -Infinity;
  }

  const damage = estimatedDamage(attacker, attack, view, target);
  if (damage === null) return -Infinity;
  const remaining = Math.max(0, target.hp - target.damage);
  let score = damage * 10;
  if (damage >= remaining) {
    score += 10000 + prizeLiability(target) * 500;
  }

  if (attack.name === 'Timeless-GX' && !view.ownPublic.publicTurnRestrictions.gxUsed) {
    score += 750;
  }
  if (attack.name === 'Filch' && view.ownPublic.deckCount > 2 &&
      view.ownPublic.handCount <= 3) {
    score = Math.max(score, 100);
  }
  if (attack.name === 'Shadow Mist' &&
      (view.opponentPublic.stadium.length > 0 ||
       view.opponentPublic.active?.energies?.some(name =>
         !hasName(name, 'Basic Energy')))) {
    score += 100;
  }
  return score;
}

function bestAttackForSlot(slot, view, target, options = {}) {
  if (!slot || !Array.isArray(slot.attacks)) return null;
  let best = null;
  for (const attack of slot.attacks) {
    const score = attackScore(slot, attack, view, target, {
      ...options, requirePayable: true
    });
    if (score > (best?.score ?? -Infinity)) {
      best = { attack, score, damage: estimatedDamage(slot, attack, view, target) };
    }
  }
  return best && Number.isFinite(best.score) ? best : null;
}

function choiceBenchIndex(choice) {
  const label = choice?.label ?? '';
  const match = /^(?:Your|Opponent) bench ([1-9][0-9]*)(?::|$)/i.exec(label);
  return match ? Number(match[1]) - 1 : null;
}

function slotForPokemonChoice(view, choice) {
  const metadata = choice?.publicMetadata;
  if (!metadata || metadata.isOwnerVisible !== true ||
      !['actor', 'opponent'].includes(metadata.ownerSeat) ||
      !['active', 'bench'].includes(metadata.targetZone)) return null;
  const player = metadata.ownerSeat === 'actor'
    ? view.ownPublic : view.opponentPublic;
  const index = metadata.targetZone === 'active'
    ? -1 : choiceBenchIndex(choice);
  if (!Number.isSafeInteger(index)) return null;
  const slot = index === -1 ? player.active : player.bench[index] ?? null;
  if (!slot || (choice.printing && slot.printing !== choice.printing)) return null;
  return { slot, index, ownerSeat: metadata.ownerSeat };
}

// Source-specific disruption heuristic. Girafarig LOT Get Lost moves two
// cards out of the opponent's PUBLIC discard, with Dragon attack payloads
// unusually important against Regidrago's Apex Dragon recursion.
const GET_LOST_DRAGON_TARGETS = Object.freeze([
  'Dialga-GX', 'Dragapult ex', 'Noivern', 'Hisuian Goodra',
  'Altaria', 'Duraludon', 'Dragonite', 'Giratina', 'Regidrago',
  'Salamence', 'Kyurem', 'Goodra', 'Raging Bolt'
]);
function getLostCardPriority(printing) {
  if (!isText(printing)) return 0;
  if (hasAnyName(printing, GET_LOST_DRAGON_TARGETS)) return 900;
  if (hasAnyName(printing, ['Battle Compressor', 'Energy', 'VS Seeker'])) return 200;
  return 50;
}
function getLostPressure(view) {
  if (!opponentHasRegidrago(view)) return 0;
  const visible = view.opponentPublic.discard ?? [];
  if (visible.length === 0) return 0;
  const dragonCount = visible.filter(printing =>
    getLostCardPriority(printing) >= 900).length;
  return 550 + Math.min(2, dragonCount) * 180;
}

// Tapu Lele-GX's actual GRI Wonder Tag is an on-Bench deck-to-hand
// Supporter search (native ChooseCardsPrompt, not a Yes/No confirmation).
function wonderTagSupporterScore(view, printing) {
  if (hasName(printing, 'Arven')) {
    return !boardHas(view, 'Shadow Rider Calyrex V') ||
      !boardHas(view, 'Shadow Rider Calyrex VMAX') ? 1350 : 520;
  }
  if (hasName(printing, "Lillie's Determination"))
    return view.ownPublic.handCount <= 5 ? 1200 : 520;
  if (hasName(printing, 'Guzma'))
    return canGuzmaForAttack(view, null) ? 1270 : 200;
  if (hasName(printing, 'Acerola'))
    return ownBoard(view).some(slot => slot.damage >= 80) ? 850 : 120;
  if (hasName(printing, 'Iono')) return 680;
  if (hasName(printing, 'Pokémon Ranger')) return 450;
  if (hasName(printing, 'Teammates') || hasName(printing, 'Raihan'))
    return 350;
  return -Infinity;
}

function nightStretcherRecoveryScore(view, printing) {
  if (!isText(printing)) return 0;
  if (hasName(printing, 'Mimikyu') && opponentHasRegidrago(view) &&
      !boardHas(view, 'Mimikyu') && !handHas(view, 'Mimikyu')) return 1050;
  if (hasName(printing, 'Shadow Rider Calyrex VMAX') &&
      boardHas(view, 'Shadow Rider Calyrex V') &&
      !boardHas(view, 'Shadow Rider Calyrex VMAX') &&
      !handHas(view, 'Shadow Rider Calyrex VMAX')) return 950;
  if (hasName(printing, 'Shadow Rider Calyrex V') &&
      !hasName(printing, 'VMAX') && !boardHas(view, 'Shadow Rider Calyrex V') &&
      !handHas(view, 'Shadow Rider Calyrex V')) return 920;
  if (hasName(printing, "Lillie's Clefairy ex") && opponentHasDragon(view) &&
      !boardHas(view, "Lillie's Clefairy ex") &&
      !handHas(view, "Lillie's Clefairy ex")) return 850;
  if (hasName(printing, 'Psychic Energy') &&
      !handHas(view, 'Psychic Energy')) return 600;
  if (hasName(printing, 'Latias ex') && !boardHas(view, 'Latias ex'))
    return 450;
  return 0;
}

function searchNeedScore(view, printing, effectName = '') {
  if (!isText(printing)) return -Infinity;
  const regidrago = opponentHasRegidrago(view);
  const dragon = opponentHasDragon(view);
  const board = ownBoard(view);
  const hasShadowV = board.some(slot => hasName(slot.printing, 'Shadow Rider Calyrex V'));
  const hasShadowVmax = board.some(slot => hasName(slot.printing, 'Shadow Rider Calyrex VMAX'));
  const hasMimikyu = board.some(slot => hasName(slot.printing, 'Mimikyu'));
  const hasClefairy = board.some(slot => hasName(slot.printing, "Lillie's Clefairy ex"));
  const hasLatias = board.some(slot => hasName(slot.printing, 'Latias ex'));

  if (hasName(printing, 'Dialga-GX')) {
    if (regidrago && !discardHas(view, 'Dialga-GX') &&
        !handHas(view, 'Dialga-GX') && !boardHas(view, 'Dialga-GX')) return 98;
    return -10;
  }
  if (hasName(printing, 'Mimikyu')) {
    if (regidrago && !hasMimikyu && !handHas(view, 'Mimikyu')) return 96;
    return -5;
  }
  if (hasName(printing, 'Shadow Rider Calyrex VMAX')) {
    if (hasShadowV && !hasShadowVmax && !handHas(view, 'Shadow Rider Calyrex VMAX')) return 94;
    return -5;
  }
  if (hasName(printing, 'Shadow Rider Calyrex V')) {
    if (!hasShadowV && !hasShadowVmax && !handHas(view, 'Shadow Rider Calyrex V')) return 100;
    return -5;
  }
  if (hasName(printing, "Lillie's Clefairy ex")) {
    if (dragon && !hasClefairy && !handHas(view, "Lillie's Clefairy ex")) return 92;
    return -5;
  }
  if (hasName(printing, 'Latias ex')) {
    if (!hasLatias && !handHas(view, 'Latias ex')) return 65;
    return -5;
  }
  if (hasName(printing, 'Psychic Energy')) {
    return psychicEnergyCount(view) < 5 ? 45 : 5;
  }
  if (hasName(printing, 'Fog Crystal')) {
    return (!hasShadowV && !hasShadowVmax) || psychicEnergyCount(view) < 3 ? 60 : 10;
  }
  if (hasName(printing, 'Stealthy Hood')) {
    const lock = allBoard(view).some(slot =>
      hasName(slot.printing, 'Iron Thorns ex') ||
      hasName(slot.printing, 'Garbodor') ||
      hasName(slot.printing, 'Snorlax PGO'));
    const protectedTarget = board.some(slot =>
      hasName(slot.printing, 'Shadow Rider Calyrex V') ||
      hasName(slot.printing, 'Shadow Rider Calyrex VMAX'));
    return lock && protectedTarget ? 70 : 0;
  }
  if (hasName(printing, 'Field Blower')) {
    return view.opponentPublic.stadium.some(name =>
      hasName(name, 'Path to the Peak') || hasName(name, 'Jamming Tower')) ? 72 : 0;
  }
  if (hasName(printing, 'VS Seeker')) {
    return view.ownPublic.discard.some(name =>
      hasAnyName(name, ['Guzma', 'Raihan', 'Acerola', 'Lillie'])) ? 30 : 0;
  }
  if (hasName(printing, 'Hisuian Heavy Ball')) {
    return 25;
  }
  if (hasName(printing, 'Night Stretcher')) {
    return board.length < 3 ? 20 : 0;
  }
  if (hasName(printing, 'Unfair Stamp')) {
    return view.publicEventReceipt?.priorOpponentTurnKO?.any === true ? 80 : 0;
  }
  if (effectName === 'Arven' && hasAnyName(printing, TOOL_NAMES)) return 70;
  return 0;
}

function discardValue(view, printing) {
  if (!isText(printing)) return 1000;
  const duplicates = view.ownHand.filter(item => item === printing).length;
  if (hasName(printing, 'Battle VIP Pass') && view.globalTurn > 1) return 1;
  if (hasName(printing, 'Psychic Energy')) {
    return psychicEnergyCount(view) >= 5 ? 2 : 80;
  }
  if (hasName(printing, 'Dialga-GX')) {
    return opponentHasRegidrago(view) && !discardHas(view, 'Dialga-GX') ? 1000 : 35;
  }
  if (hasName(printing, 'Mimikyu')) {
    return opponentHasRegidrago(view) && !boardHas(view, 'Mimikyu') ? 1000 : 30;
  }
  if (hasName(printing, 'Shadow Rider Calyrex VMAX') &&
      ownBoard(view).filter(slot => hasName(slot.printing, 'Shadow Rider Calyrex VMAX')).length < 2) return 900;
  if (hasName(printing, "Lillie's Clefairy ex") && opponentHasDragon(view) &&
      !boardHas(view, "Lillie's Clefairy ex")) return 900;
  if (hasName(printing, 'Unfair Stamp') || hasName(printing, 'Forest Seal Stone') ||
      hasName(printing, 'Computer Search')) return 1000;
  if (hasAnyName(printing, ['Guzma', 'Raihan', 'Acerola', 'Teammates', 'Lillie'])) return 850;
  if (hasAnyName(printing, ['Fog Crystal', 'Quick Ball', 'Mysterious Treasure']) &&
      duplicates > 1) return 10;
  if (duplicates > 1 && !hasAnyName(printing, CORE_PRINTINGS)) return 15;
  if (hasAnyName(printing, CORE_PRINTINGS)) return 700;
  return 50;
}

function isTool(printing) {
  return hasAnyName(printing, TOOL_NAMES);
}

function isItem(printing) {
  return hasAnyName(printing, ITEM_NAMES);
}

function searchCandidates(view, prompt, choices) {
  const effectName = prompt.source?.effectName ?? '';
  const sourceZone = prompt.publicMetadata?.sourceZone;
  let rows;
  if (sourceZone === 'discard' && effectName === 'VS Seeker' &&
      prompt.source?.sourcePrinting === 'VS Seeker PHF 109') {
    rows = choices.map(choice => ({
      choice, score: wonderTagSupporterScore(view, choice.printing)
    }));
  } else if (sourceZone === 'discard' && effectName === 'Night Stretcher' &&
      prompt.source?.sourcePrinting === 'Night Stretcher ASC 196') {
    rows = choices.map(choice => ({
      choice, score: nightStretcherRecoveryScore(view, choice.printing)
    }));
  } else if (sourceZone === 'deck' && effectName === 'Wonder Tag' &&
      prompt.source?.sourcePrinting === 'Tapu Lele-GX GRI 60') {
    rows = choices.map(choice => ({
      choice, score: wonderTagSupporterScore(view, choice.printing)
    }));
  } else if (sourceZone === 'discard' && effectName === 'Get Lost' &&
      prompt.source?.sourcePrinting === 'Girafarig LOT 94') {
    rows = choices.map(choice => ({
      choice, score: getLostCardPriority(choice.printing)
    }));
  } else if (sourceZone === 'deck' &&
      effectName === 'Climactic Gate' &&
      prompt.source?.sourcePrinting === 'Radiant Eternatus CRZ 105') {
    // Direct-to-Bench VMAX needs no Shadow Rider V pre-evolution.
    rows = choices.map(choice => ({
      choice,
      score: hasName(choice.printing, 'Shadow Rider Calyrex VMAX CRE') ? 1000 : -Infinity
    }));
  } else if (sourceZone === 'deck' && effectName === 'Battle Compressor') {
    rows = choices.map(choice => ({
      choice,
      score: hasName(choice.printing, 'Dialga-GX') &&
        opponentHasRegidrago(view) && !discardHas(view, 'Dialga-GX') ? 1000 :
        -discardValue(view, choice.printing)
    }));
  } else if (sourceZone === 'hand') {
    rows = choices.map(choice => ({
      choice, score: -discardValue(view, choice.printing)
    }));
  } else {
    rows = choices.map(choice => ({
      choice, score: searchNeedScore(view, choice.printing, effectName)
    }));
  }
  for (const row of rows) {
    recordPolicyAuditScore(row.choice.token, row.score, 'NO_SEARCH_CANDIDATE_SCORE');
  }
  return rows;
}

function chooseCardCombination(view, prompt) {
  setPolicyAuditRule('CARD_COMBINATION_SEARCH_SCORE', 'SCORE_DESC_PRINTING_ASC');
  const ownerSourceBindings = {
    'Wonder Tag': 'Tapu Lele-GX GRI 60',
    'Climactic Gate': 'Radiant Eternatus CRZ 105',
    'Get Lost': 'Girafarig LOT 94',
    'VS Seeker': 'VS Seeker PHF 109',
    'Night Stretcher': 'Night Stretcher ASC 196',
    'Star Alchemy': 'Forest Seal Stone SIT 156',
    'Arven': 'Arven SVI 166',
    'Teammates': 'Teammates PRC 141'
  };
  const effect = prompt.source?.effectName;
  if (Object.hasOwn(ownerSourceBindings, effect) &&
      prompt.source?.sourcePrinting !== ownerSourceBindings[effect]) {
    return abstain('UNTRUSTED_PROMPT_SOURCE');
  }
  const metadata = prompt.publicMetadata;
  const opponentGetLost =
    prompt.source?.sourceKind === 'card-effect' &&
    prompt.source?.sourcePrinting === 'Girafarig LOT 94' &&
    prompt.source?.effectName === 'Get Lost' &&
    metadata?.sourceZone === 'discard' &&
    metadata?.ownerSeat === 'opponent';
  const expectedOwner = opponentGetLost ? 'opponent' : 'actor';
  if (!metadata || metadata.selectionType !== 'card-combination' ||
      metadata.ownerSeat !== expectedOwner ||
      metadata.isOwnerVisible !== true ||
      !['deck', 'hand', 'discard', 'prizes'].includes(metadata.sourceZone)) {
    return abstain('UNTRUSTED_CARD_SELECTION');
  }
  const choices = prompt.choices.filter(choice =>
    choice.kind === 'card' && isText(choice.printing) &&
    choice.publicMetadata?.ownerSeat === expectedOwner &&
    choice.publicMetadata?.isOwnerVisible === true);
  const minimum = metadata.minimumCount;
  let maximum = metadata.maximumCount;
  if (!Number.isSafeInteger(minimum) || !Number.isSafeInteger(maximum) ||
      minimum < 0 || maximum < minimum) return abstain('BAD_CARD_SELECTION_BOUNDS');
  if (prompt.source?.effectName === 'Climactic Gate' &&
      prompt.source?.sourcePrinting === 'Radiant Eternatus CRZ 105') {
    // Radiant is already Benched at this native prompt; do not choose more
    // VMAX than the remaining ordinary Bench slots (Sky Field can expand it).
    const skyField = [...view.ownPublic.stadium, ...view.opponentPublic.stadium]
      .some(name => hasName(name, 'Sky Field'));
    const cap = skyField ? 8 : 5;
    maximum = Math.min(maximum, Math.max(0, cap - countBench(view.ownPublic)));
  }

  if (metadata.sourceZone === 'prizes' && choices.length === 0) {
    return abstain('HIDDEN_PRIZE_IDENTITY');
  }

  const ranked = searchCandidates(view, prompt, choices)
    .sort((a, b) => b.score - a.score ||
      String(a.choice.printing).localeCompare(String(b.choice.printing)));

  let selected = [];
  if (effect === 'Arven' && metadata.sourceZone === 'deck') {
    // Printed Arven permits at most one Item and one Pokémon Tool. Two
    // individually valuable Items are NOT a valid two-card selection.
    const positive = ranked.filter(row => row.score > 0);
    const bestItem = positive.find(row => isItem(row.choice.printing));
    const bestTool = positive.find(row => isTool(row.choice.printing));
    const groups = [bestItem, bestTool].filter(Boolean)
      .sort((a,b) => b.score - a.score ||
        String(a.choice.printing).localeCompare(String(b.choice.printing)));
    selected = groups.slice(0, maximum).map(row => row.choice);
    // Connector contention: Arven can reach exactly ONE Item + ONE Tool.
    // If an original CRE74 V is already Active with one Psychic and the
    // second Psychic is held, Mysterious Treasure must locate a VMAX while
    // Forest Seal Stone's only Star Alchemy locates the missing Dimension
    // Valley. Fog Crystal would satisfy an already-filled Energy channel
    // and leave one independently missing attack component untouched.
    // This is a narrow owner-visible line; unknown/prized targets remain
    // a native deck-search uncertainty, not an assertion of availability.
    const a=view.ownPublic.active;
    const r=view.ownTurnResources??{};
    const undisruptedStadium=[...(view.ownPublic.stadium??[]),
      ...(view.opponentPublic.stadium??[])].length===0;
    const heldDisposable=view.ownHand.some(card =>
      !hasAnyName(card,['Psychic Energy','Dimension Valley',
        'Forest Seal Stone','Shadow Rider Calyrex VMAX']) &&
      discardValue(view,card)<800);
    const readyForBridge =
      maximum>=2 && Number.isSafeInteger(view.globalTurn) &&
      r.energyPlayedTurn!==view.globalTurn &&
      r.stadiumPlayedTurn!==view.globalTurn &&
      r.itemPlayLocked!==true &&
      (r.vstarUsed===false||r.vstarUsed===undefined) &&
      view.ownPublic.publicTurnRestrictions?.vstarUsed===false &&
      undisruptedStadium &&
      a && hasName(a.printing,'Shadow Rider Calyrex V CRE 74') &&
      !hasName(a.printing,'Shadow Rider Calyrex VMAX') &&
      (a.tools??[]).length===0 &&
      slotEnergyCount(a)===1 &&
      handHas(view,'Psychic Energy') && heldDisposable &&
      !handHas(view,'Shadow Rider Calyrex VMAX') &&
      !handHas(view,'Forest Seal Stone') &&
      !handHas(view,'Dimension Valley') &&
      !ownBoard(view).some(slot =>
        hasName(slot.printing,'Shadow Rider Calyrex VMAX'));
    if(readyForBridge){
      const treasure=ranked.find(row =>
        hasName(row.choice.printing,'Mysterious Treasure FLI 113'));
      const forest=ranked.find(row =>
        hasName(row.choice.printing,'Forest Seal Stone SIT 156'));
      if(treasure && forest){
        // Preserve the typed Item+Tool pair and opaque source tokens;
        // do NOT invent the subsequent search/attachment actions.
        recordPolicyAuditScore(treasure.choice.token,96);
        selected=[treasure.choice,forest.choice];
        setPolicyAuditRule('ARVEN_T2_TREASURE_FOREST_DUAL_AXIS',
          'MYSTERIOUS_ITEM_THEN_FOREST_TOOL');
      }
    }
  } else if (metadata.sourceZone === 'hand' ||
      (metadata.sourceZone === 'deck' && effect === 'Battle Compressor')) {
    selected = ranked.slice(0, minimum).filter(row => Number.isFinite(row.score))
      .map(row => row.choice);
  } else {
    selected = ranked.filter(row => row.score > 0)
      .slice(0, maximum).map(row => row.choice);
    if (selected.length < minimum) {
      selected = ranked.slice(0, minimum).map(row => row.choice);
    }
  }

  if (selected.length === 0 && minimum === 0) {
    const empty = prompt.choices.find(choice => choice.kind === 'empty-selection');
    return empty ? { kind: 'select-choice', token: empty.token } :
      abstain('NO_USEFUL_CARD_CHOICE');
  }
  if (selected.length < minimum || selected.length > maximum) {
    return abstain('NO_LEGAL_CARD_SET');
  }

  // Arven's type-limited pair was selected atomically before cardinality checks.

  return { kind: 'select-choices', tokens: selected.map(choice => choice.token) };
}

function choosePokemonRecipient(view, prompt) {
  setPolicyAuditRule('POKEMON_TARGET_SCORE', 'SCORE_DESC_NATIVE_TARGET_INDEX');
  const metadata = prompt.publicMetadata;
  if (!metadata || metadata.selectionType !== 'pokemon') {
    return abstain('UNSUPPORTED_POKEMON_PROMPT');
  }
  const minimum = metadata.minimumCount;
  const maximum = metadata.maximumCount;
  if (!Number.isSafeInteger(minimum) || !Number.isSafeInteger(maximum) ||
      minimum < 0 || maximum < minimum) return abstain('BAD_POKEMON_SELECTION_BOUNDS');

  const visible = prompt.choices.map(choice => ({
    choice, target: slotForPokemonChoice(view, choice)
  })).filter(row => row.target !== null);

  if (visible.length === 0) {
    const empty = prompt.choices.find(choice => choice.kind === 'empty-selection');
    if (minimum === 0 && empty) return { kind: 'select-choice', token: empty.token };
    return abstain('NO_VISIBLE_POKEMON_TARGET');
  }

  const effectName = prompt.source?.effectName ?? '';
  if (effectName === 'Acerola' &&
      (prompt.source?.sourceKind !== 'card-effect' ||
       prompt.source?.sourcePrinting !== 'Acerola BUS 112')) {
    return abstain('UNTRUSTED_PROMPT_SOURCE');
  }
  const actorChoices = visible.filter(row => row.target.ownerSeat === 'actor');
  const opponentChoices = visible.filter(row => row.target.ownerSeat === 'opponent');

  let ranked;
  if (effectName === 'Acerola' && actorChoices.length > 0) {
    ranked = actorChoices.map(row => {
      const slot = row.target.slot;
      const safeToRemoveActive = slot !== view.ownPublic.active ||
        view.ownPublic.bench.some(Boolean);
      const score = safeToRemoveActive && slot.damage > 0
        ? prizeLiability(slot) * 1000 + slot.damage * 4 -
          slotEnergyCount(slot) * 50
        : -Infinity;
      return { ...row, score };
    });
  } else if (effectName === 'Guzma' && actorChoices.length > 0) {
    const target = view.opponentPublic.active;
    ranked = actorChoices.map(row => {
      const attack = bestAttackForSlot(row.target.slot, view, target);
      if (!attack) return { ...row, score: -Infinity };
      const liability = prizeLiability(row.target.slot);
      const lethal = attack.damage !== null &&
        attack.damage >= Math.max(0, target.hp - target.damage);
      return {
        ...row,
        score: attack.score + (lethal ? 100000 : 0) - liability * 2000
      };
    });
  } else if (effectName === 'Guzma' && opponentChoices.length > 0) {
    const attacker = view.ownPublic.active;
    ranked = opponentChoices.map(row => {
      const attack = bestAttackForSlot(attacker, view, row.target.slot);
      const liability = prizeLiability(row.target.slot);
      return {
        ...row,
        score: (attack?.score ?? -1000) + liability * 1200 -
          Math.max(0, row.target.slot.hp - row.target.slot.damage)
      };
    });
  } else {
    ranked = actorChoices.map(row => {
      const slot = row.target.slot;
      let score = 100 - slotEnergyCount(slot) * 5;
      if (opponentHasRegidrago(view) && hasName(slot.printing, 'Mimikyu') &&
          slotEnergyCount(slot) < 2) score += 1000;
      if (hasName(slot.printing, 'Shadow Rider Calyrex VMAX') &&
          psychicEnergyCount(view) < 5) score += 700;
      if (opponentHasDragon(view) && hasName(slot.printing, "Lillie's Clefairy ex") &&
          slotEnergyCount(slot) < 2) score += 600;
      if (hasName(slot.printing, 'Shadow Rider Calyrex V')) score += 100;
      return { ...row, score };
    });
  }

  for (const row of ranked) recordPolicyAuditScore(row.choice.token, row.score, 'NO_POKEMON_TARGET_SCORE');
  ranked.sort((a, b) => b.score - a.score ||
    a.target.index - b.target.index);
  const selected = ranked.filter(row => Number.isFinite(row.score))
    .slice(0, Math.max(minimum, Math.min(maximum, 1)));
  if (selected.length < minimum) return abstain('NO_SUPPORTED_POKEMON_CHOICE');
  if (minimum === 0 && selected.length === 0) {
    const empty = prompt.choices.find(choice => choice.kind === 'empty-selection');
    return empty ? { kind: 'select-choice', token: empty.token } :
      abstain('NO_POKEMON_SELECTION');
  }
  if (maximum === 1 && selected.length === 1) {
    return { kind: 'select-choices', tokens: [selected[0].choice.token] };
  }
  return { kind: 'select-choices', tokens: selected.map(row => row.choice.token) };
}

function chooseEnergyPayment(view, prompt) {
  setPolicyAuditRule('ENERGY_DISCARD_VALUE_ASC', 'SCORE_ASC_PRINTING_ASC');
  const metadata = prompt.publicMetadata;
  if (!metadata || metadata.selectionType !== 'energy-payment') {
    return abstain('UNTRUSTED_ENERGY_SELECTION');
  }
  const minimum = 1;
  const maximum = Math.min(
    metadata.energyCount ?? metadata.count ?? 1,
    prompt.choices.filter(choice => choice.kind === 'energy').length
  );
  const choices = prompt.choices.filter(choice =>
    choice.kind === 'energy' && choice.publicMetadata?.ownerSeat === 'actor' &&
    choice.publicMetadata?.isOwnerVisible === true && isText(choice.printing));
  const ranked = choices.map(choice => ({
    choice,
    score: discardValue(view, choice.printing)
  }));
  for (const row of ranked) recordPolicyAuditScore(row.choice.token, row.score, 'NO_DISCARD_VALUE_SCORE');
  ranked.sort((a, b) => a.score - b.score ||
    String(a.choice.printing).localeCompare(String(b.choice.printing)));
  const selected = ranked.slice(0, Math.min(1, maximum));
  if (selected.length < minimum) return abstain('NO_VISIBLE_ENERGY_CHOICE');
  return { kind: 'select-choices', tokens: selected.map(row => row.choice.token) };
}

function chooseAttackPrompt(view, prompt, receipt) {
  setPolicyAuditRule('ATTACK_CHOICE_SCORE_DESC', 'SCORE_DESC_TOKEN_ASC');
  const choices = prompt.choices.filter(choice =>
    choice.kind === 'attack' && isText(choice.publicMetadata?.sourceAttack));
  if (choices.length === 0) return abstain('NO_VISIBLE_ATTACK_CHOICE');

  const effectName = prompt.source?.effectName ?? '';
  const hasDialga = discardHas(view, 'Dialga-GX');
  const gxUnused = !view.ownPublic.publicTurnRestrictions.gxUsed;
  const target = view.opponentPublic.active;
  const dragonTarget = isDragon(target);
  let ranked = choices.map(choice => {
    const attackName = choice.publicMetadata.sourceAttack;
    let score = 0;
    if (effectName === 'Apex Dragon' && attackName === 'Timeless-GX' &&
        hasDialga && gxUnused && dragonTarget &&
        fairyZoneStatus(view) === true) score = 50000;
    else if (effectName === 'Apex Dragon' && attackName === 'Timeless-GX' &&
        hasDialga && gxUnused) {
      // The extra-turn effect is a discrete tempo resource, not merely
      // Timeless-GX's 150 written damage; preserve it without Fairy Zone.
      score = 3000;
    }
    else if (effectName === 'Copycat' && attackName === 'Apex Dragon' &&
        Array.isArray(receipt?.opponentCopycatChoices) &&
        receipt.opponentCopycatChoices.some(row =>
          row.attackName === 'Apex Dragon' &&
          hasName(row.sourcePrinting, 'Regidrago VSTAR')) &&
        hasDialga && gxUnused) score = 50000;
    else if (attackName === 'Power Beam') score = 200;
    else if (attackName === 'Timeless-GX' && hasDialga && gxUnused) score = 150;
    else if (attackName === 'Max Geist') score = 10 + 30 * psychicEnergyCount(view);
    else if (attackName === 'Full Moon Rondo') {
      score = 20 + 20 * (countBench(view.ownPublic) + countBench(view.opponentPublic));
    } else if (attackName === 'Night Watch') score = 150;
    else score = parseDamage(attackName);
    return { choice, score };
  });
  for (const row of ranked) recordPolicyAuditScore(row.choice.token, row.score, 'NO_ATTACK_CHOICE_SCORE');
  ranked.sort((a, b) => b.score - a.score ||
    a.choice.token.localeCompare(b.choice.token));
  if (!Number.isFinite(ranked[0]?.score) || ranked[0].score <= 0) {
    return abstain('NO_SUPPORTED_ATTACK_CHOICE');
  }
  return { kind: 'select-choice', token: ranked[0].choice.token };
}

function choosePrizeSlots(prompt) {
  setPolicyAuditRule('PRIZE_SELECTION_INDEX_ASC', 'SELECTION_INDEX_ASC');
  const metadata = prompt.publicMetadata;
  if (!metadata || metadata.selectionType !== 'prize-slots' ||
      !Number.isSafeInteger(metadata.requiredCount)) {
    return abstain('UNSUPPORTED_PRIZE_SELECTION');
  }
  const required = metadata.requiredCount;
  const choices = prompt.choices.filter(choice =>
    choice.kind === 'prize' && Number.isSafeInteger(choice.publicMetadata?.selectionIndex));
  const selected = choices.sort((a, b) =>
    a.publicMetadata.selectionIndex - b.publicMetadata.selectionIndex).slice(0, required);
  if (selected.length !== required || required < 0) {
    return abstain('NO_LEGAL_PRIZE_SELECTION');
  }
  if (required === 0) {
    const empty = prompt.choices.find(choice => choice.kind === 'empty-selection');
    return empty ? { kind: 'select-choice', token: empty.token } : abstain('NO_EMPTY_PRIZE_CHOICE');
  }
  return { kind: 'select-choices', tokens: selected.map(choice => choice.token) };
}

function chooseCardOrder(view, prompt) {
  setPolicyAuditRule('CARD_ORDER_SEARCH_NEED_SCORE_DESC', 'SCORE_DESC_PRINTING_ASC');
  const metadata = prompt.publicMetadata;
  if (!metadata || metadata.selectionType !== 'card-order') {
    return abstain('UNSUPPORTED_CARD_ORDER');
  }
  const choices = prompt.choices.filter(choice =>
    choice.kind === 'card-order-item' && isText(choice.printing) &&
    choice.publicMetadata?.ownerSeat === 'actor' &&
    choice.publicMetadata?.isOwnerVisible === true);
  const ranked = choices.map(choice => ({
    choice, score: searchNeedScore(view, choice.printing, prompt.source?.effectName ?? '')
  }));
  for (const row of ranked) recordPolicyAuditScore(row.choice.token, row.score, 'NO_CARD_ORDER_SCORE');
  ranked.sort((a, b) => b.score - a.score ||
    String(a.choice.printing).localeCompare(String(b.choice.printing)));
  const required = metadata.count;
  if (!Number.isSafeInteger(required) || ranked.length !== required) {
    return abstain('CARD_ORDER_COUNT_MISMATCH');
  }
  return { kind: 'select-choices', tokens: ranked.map(row => row.choice.token) };
}

function chooseStartingPokemonSetup(prompt) {
  setPolicyAuditRule('STARTING_BASICS_NATIVE_ORDER', 'NATIVE_SELECTION_INDEX_ASC');
  const metadata = prompt.publicMetadata;
  if (!metadata || metadata.selectionType !== 'card-combination' ||
      metadata.sourceZone !== 'hand' || metadata.ownerSeat !== 'actor' ||
      metadata.isOwnerVisible !== true || metadata.isSecret !== false ||
      metadata.allowCancel !== false ||
      !Number.isSafeInteger(metadata.minimumCount) ||
      !Number.isSafeInteger(metadata.maximumCount) ||
      (metadata.minimumCount !== 0 && metadata.minimumCount !== 1) ||
      metadata.maximumCount < metadata.minimumCount ||
      (metadata.minimumCount === 1 && metadata.maximumCount > 6) ||
      !Array.isArray(prompt.choices)) {
    return abstain('BAD_STARTING_POKEMON_SETUP_PROMPT');
  }

  const cardChoices = [];
  const emptyChoices = [];
  for (const choice of prompt.choices) {
    if (choice.kind === 'empty-selection') {
      emptyChoices.push(choice);
      continue;
    }
    if (choice.kind !== 'card') {
      return abstain('UNEXPECTED_STARTING_POKEMON_CHOICE');
    }
    const item = choice.publicMetadata;
    if (!isText(choice.token) || !isText(choice.printing) ||
        choice.label !== choice.printing || !item ||
        !Number.isSafeInteger(item.selectionIndex) ||
        item.selectionIndex < 0 ||
        item.sourceZone !== 'hand' || item.ownerSeat !== 'actor' ||
        item.isOwnerVisible !== true || item.selectedCount !== 1) {
      return abstain('UNTRUSTED_STARTING_POKEMON_CHOICE');
    }
    cardChoices.push(choice);
  }

  if (emptyChoices.length !== (metadata.minimumCount === 0 ? 1 : 0) ||
      emptyChoices.some(choice => !isText(choice.token) ||
        choice.label !== 'Choose no items')) {
    return abstain('BAD_STARTING_POKEMON_EMPTY_CHOICE');
  }

  let previousIndex = -1;
  for (const choice of cardChoices) {
    const index = choice.publicMetadata.selectionIndex;
    if (index <= previousIndex) {
      return abstain('UNORDERED_STARTING_POKEMON_CHOICES');
    }
    previousIndex = index;
  }

  const selected = cardChoices.slice(0, metadata.maximumCount);
  if (selected.length < metadata.minimumCount ||
      (metadata.minimumCount === 0 && cardChoices.length > 0 && selected.length === 0)) {
    return abstain('INSUFFICIENT_STARTING_POKEMON_CHOICES');
  }
  if (metadata.minimumCount === 0 && cardChoices.length === 0) {
    const empty = emptyChoices[0];
    return empty
      ? { kind: 'select-choice', token: empty.token }
      : abstain('NO_STARTING_POKEMON_CHOICE');
  }

  // The native prompt has already filtered non-Basics through blocked indices.
  // Preserve its order and let the pinned reducer's callback place cards only
  // while Bench slots remain; do not impose a second capacity cap here.
  return { kind: 'select-choices', tokens: selected.map(choice => choice.token) };
}

function chooseGoFirstSetup(prompt) {
  setPolicyAuditRule('GO_FIRST_AFFIRMATIVE_DEFAULT', 'UNIQUE_YES_CHOICE');
  if (prompt.publicMetadata?.selectionType !== 'confirm' ||
      !Array.isArray(prompt.choices) || prompt.choices.length !== 2) {
    return abstain('BAD_GO_FIRST_SETUP_PROMPT');
  }
  const yes = prompt.choices.filter(choice =>
    choice.kind === 'confirm' && choice.label === 'Yes');
  const no = prompt.choices.filter(choice =>
    choice.kind === 'confirm' && choice.label === 'No');
  if (yes.length !== 1 || no.length !== 1 ||
      !isText(yes[0].token) || !isText(no[0].token) ||
      yes[0].token === no[0].token) {
    return abstain('BAD_GO_FIRST_CONFIRM_CHOICES');
  }
  // The first integration policy uses the deterministic affirmative choice.
  return { kind: 'select-choice', token: yes[0].token };
}

function chooseMulliganDrawSetup(prompt) {
  setPolicyAuditRule('MULLIGAN_MAX_DRAW_COUNT', 'DRAW_COUNT_DESC_CHOICE_INDEX_ASC');
  const metadata = prompt.publicMetadata;
  if (!metadata || metadata.selectionType !== 'option' ||
      metadata.allowCancel !== false ||
      !Number.isSafeInteger(metadata.count) || metadata.count < 1 ||
      !Array.isArray(prompt.choices) || prompt.choices.length === 0) {
    return abstain('BAD_MULLIGAN_DRAW_SETUP_PROMPT');
  }

  const seenIndices = new Set();
  let best = null;
  for (const choice of prompt.choices) {
    if (choice.kind !== 'option' || !isText(choice.token)) {
      return abstain('UNEXPECTED_MULLIGAN_DRAW_CHOICE');
    }
    const index = choice.publicMetadata?.choiceIndex;
    if (!Number.isSafeInteger(index) || index < 0 ||
        index >= metadata.count || seenIndices.has(index)) {
      return abstain('BAD_MULLIGAN_DRAW_CHOICE_INDEX');
    }
    seenIndices.add(index);
    const drawCount = metadata.count - 1 - index;
    recordPolicyAuditScore(choice.token, drawCount, 'MULLIGAN_DRAW_COUNT');
    if (choice.label !== `Draw ${drawCount} card(s)`) {
      return abstain('MULLIGAN_DRAW_LABEL_INDEX_MISMATCH');
    }
    if (!best || drawCount > best.drawCount) {
      best = { choice, drawCount };
    }
  }

  return best
    ? { kind: 'select-choice', token: best.choice.token }
    : abstain('NO_MULLIGAN_DRAW_OPTION');
}

function chooseEngineSetupPrompt(view, prompt) {
  if (prompt.description === 'CHOOSE_STARTING_POKEMONS') setPolicyAuditRule('STARTING_BASICS_NATIVE_ORDER', 'NATIVE_SELECTION_INDEX_ASC');
  else if (prompt.description === 'GO_FIRST') setPolicyAuditRule('GO_FIRST_AFFIRMATIVE_DEFAULT', 'UNIQUE_YES_CHOICE');
  else if (prompt.description === 'WANT_TO_DRAW_CARDS') setPolicyAuditRule('MULLIGAN_MAX_DRAW_COUNT', 'DRAW_COUNT_DESC_CHOICE_INDEX_ASC');
  if (view.phase !== 1) return abstain('UNSUPPORTED_ENGINE_SETUP_PHASE');
  if (prompt.source?.sourceKind !== 'engine' ||
      prompt.source.sourcePrinting !== null ||
      prompt.source.effectName !== prompt.description) {
    return abstain('UNTRUSTED_ENGINE_SETUP_PROMPT');
  }

  if (prompt.promptType === 'ChooseCardsPrompt' &&
      prompt.description === 'CHOOSE_STARTING_POKEMONS') {
    return chooseStartingPokemonSetup(prompt);
  }
  if (prompt.promptType === 'ConfirmPrompt' &&
      prompt.description === 'GO_FIRST') {
    return chooseGoFirstSetup(prompt);
  }
  if (prompt.promptType === 'SelectPrompt' &&
      prompt.description === 'WANT_TO_DRAW_CARDS') {
    return chooseMulliganDrawSetup(prompt);
  }
  return abstain('UNSUPPORTED_ENGINE_SETUP_PROMPT');
}

/**
 * Native Underworld Door is one AttachEnergyPrompt with one physically
 * addressed Energy-to-Bench assignment, NOT ChooseCards + ChoosePokemon.
 * Trust only the typed, source-certified, actor-visible native choices,
 * retaining their opaque token and exact Bench index.
 */
function chooseUnderworldEnergyAssignment(view, prompt) {
  setPolicyAuditRule('UNDERWORLD_ENERGY_TO_PSYCHIC_BENCH', 'SCORE_DESC_INDEX_ASC');
  const meta=prompt.publicMetadata;
  const source=prompt.source;
  if (source?.sourceKind !== 'card-effect' ||
      source.effectName !== 'Underworld Door' ||
      source.sourcePrinting !== 'Shadow Rider Calyrex VMAX CRE 75' ||
      meta?.selectionType !== 'energy-attachment' ||
      meta.ownerSeat !== 'actor' || meta.isOwnerVisible !== true ||
      meta.sourceZone !== 'hand' || meta.zone !== 'bench' ||
      meta.energyType !== 'BASIC' ||
      meta.minimumCount !== 1 || meta.maximumCount !== 1) {
    return abstain('UNTRUSTED_PROMPT_SOURCE');
  }
  const eligible=[];
  for(const choice of prompt.choices) {
    const m=choice.publicMetadata;
    const i=m?.benchIndex;
    const slot=Number.isSafeInteger(i)&&i>=0?
      view.ownPublic.bench[i]:null;
    if(choice.kind !== 'energy' ||
        !hasName(choice.printing, 'Psychic Energy') ||
        m?.sourceZone !== 'hand' || m.ownerSeat !== 'actor' ||
        m.isOwnerVisible !== true || m.energyType !== 'BASIC' ||
        m.zone !== 'bench' || !slot ||
        !slot.printed?.types?.includes('Psychic')) {
      recordPolicyAuditUnscored(choice.token, 'UNTRUSTED_ENERGY_SELECTION');
      continue;
    }
    let score=120-slotEnergyCount(slot)*10;
    if (hasName(slot.printing, 'Shadow Rider Calyrex VMAX')) score+=420;
    if (hasName(slot.printing, 'Shadow Rider Calyrex V')) score+=220;
    if (opponentHasRegidrago(view) &&
        hasName(slot.printing, 'Mimikyu') && slotEnergyCount(slot)<2) score+=1000;
    if (opponentHasDragon(view) &&
        hasName(slot.printing, "Lillie's Clefairy ex") &&
        slotEnergyCount(slot)<2) score+=700;
    recordPolicyAuditScore(choice.token,score);
    eligible.push({choice,score,benchIndex:i});
  }
  eligible.sort((a,b)=>b.score-a.score||a.benchIndex-b.benchIndex||
    a.choice.token.localeCompare(b.choice.token));
  return eligible.length ? {kind:'select-choice',token:eligible[0].choice.token} :
    abstain('NO_VISIBLE_ENERGY_CHOICE');
}

function chooseClimacticGateConfirm(view, prompt) {
  setPolicyAuditRule('RADIANT_CLIMACTIC_GATE_CONFIRM', 'ONE_YES_CHOICE');
  if (prompt.source?.sourcePrinting !== 'Radiant Eternatus CRZ 105' ||
      prompt.source?.effectName !== 'Climactic Gate' ||
      prompt.publicMetadata?.selectionType !== 'confirm') {
    return abstain('UNTRUSTED_PROMPT_SOURCE');
  }
  const yes = prompt.choices.filter(choice =>
    choice.kind === 'confirm' && choice.label === 'Yes');
  if (yes.length !== 1) return abstain('AMBIGUOUS_SIMPLE_PROMPT');
  recordPolicyAuditRule(yes[0].token, 'CLIMACTIC_GATE_USE');
  return { kind: 'select-choice', token: yes[0].token };
}

function choosePrompt(view, prompt, receipt) {
  if (!prompt || prompt.actingSeat !== view.actorSeat ||
      prompt.source?.classification !== 'actor-choice') {
    return abstain('UNTRUSTED_PROMPT');
  }
  if (prompt.source.sourceKind === 'engine') {
    return chooseEngineSetupPrompt(view, prompt);
  }
  if (prompt.source.sourceKind !== 'card-effect') {
    return abstain('UNTRUSTED_PROMPT_SOURCE');
  }
  switch (prompt.promptType) {
    case 'AttachEnergyPrompt':
      return chooseUnderworldEnergyAssignment(view,prompt);
    case 'ChooseCardsPrompt':
      return chooseCardCombination(view, prompt);
    case 'ChoosePokemonPrompt':
      return choosePokemonRecipient(view, prompt);
    case 'ChooseEnergyPrompt':
      return chooseEnergyPayment(view, prompt);
    case 'ChooseAttackPrompt':
      return chooseAttackPrompt(view, prompt, receipt);
    case 'ChoosePrizePrompt':
      return choosePrizeSlots(prompt);
    case 'OrderCardsPrompt':
      return chooseCardOrder(view, prompt);
    case 'ConfirmPrompt':
      if (prompt.source?.effectName === 'Climactic Gate') {
        return chooseClimacticGateConfirm(view, prompt);
      }
      // Other optional Abilities remain unsupported absent source policy.
      if (prompt.choices.length !== 1) return abstain('AMBIGUOUS_SIMPLE_PROMPT');
      setPolicyAuditRule('SINGLE_UNAMBIGUOUS_CHOICE', 'ONLY_CHOICE');
      return { kind: 'select-choice', token: prompt.choices[0].token };
    case 'SelectPrompt':
    case 'SelectOptionPrompt': {
      setPolicyAuditRule('SINGLE_UNAMBIGUOUS_CHOICE', 'ONLY_CHOICE');
      if (prompt.choices.length === 1) {
        return { kind: 'select-choice', token: prompt.choices[0].token };
      }
      return abstain('AMBIGUOUS_SIMPLE_PROMPT');
    }
    default:
      return abstain('UNSUPPORTED_PROMPT_TYPE');
  }
}

function scoreBasicPlay(item, view, receipt) {
  const metadata = item.publicMetadata ?? {};
  if (metadata.targetSeat !== 'actor' || metadata.targetZone !== 'bench') return -Infinity;
  const printing = item.actorPrinting ?? '';
  if (hasName(printing, 'Tapu Lele-GX GRI')) {
    if (view.ownTurnResources.supporterPlayedTurn > 0 ||
        countBench(view.ownPublic) >= 4 ||
        boardHas(view, 'Tapu Lele-GX') ||
        hasName(view.opponentPublic.active?.printing, 'Iron Thorns ex') ||
        handHas(view, "Lillie's Determination") ||
        handHas(view, 'Arven')) return -Infinity;
    return 660;
  }
  if (hasName(printing, 'Radiant Eternatus CRZ')) {
    // Active Iron Thorns ex's Initialization removes non-Future Pokémon
    // Abilities, including this Radiant's on-Bench entry. Do not spend a
    // precious Bench slot expecting a disabled Climactic Gate trigger.
    if (hasName(view.opponentPublic.active?.printing, 'Iron Thorns ex')) {
      return -Infinity;
    }
    // Climactic Gate is a turn-ending line; finish search, evolution, and
    // normal energy first. Radiant takes one Bench slot and needs at least
    // one more for a VMAX searched directly onto the Bench.
    if (countBench(view.ownPublic) > 3 ||
        ownBoard(view).filter(slot =>
          hasName(slot.printing, 'Shadow Rider Calyrex VMAX')).length >= 2) {
      return -Infinity;
    }
    const currentAttack = view.opponentPublic.active
      ? bestAttackForSlot(view.ownPublic.active, view, view.opponentPublic.active,
        { publicEventReceipt: receipt })
      : null;
    if (currentAttack && currentAttack.score > 350) return -Infinity;
    return 320;
  }
  if (hasName(printing, 'Shadow Rider Calyrex V') &&
      !hasName(printing, 'VMAX') &&
      !boardHas(view, 'Shadow Rider Calyrex V')) return 1000;
  if (hasName(printing, 'Mimikyu') && opponentHasRegidrago(view) &&
      !boardHas(view, 'Mimikyu')) return 950;
  if (hasName(printing, "Lillie's Clefairy ex") && opponentHasDragon(view) &&
      !boardHas(view, "Lillie's Clefairy ex")) return 900;
  if (hasName(printing, 'Latias ex') && !boardHas(view, 'Latias ex')) return 650;
  if (hasName(printing, 'Girafarig') && opponentHasRegidrago(view) &&
      !boardHas(view, 'Girafarig')) return 450;
  if (hasName(printing, 'Marshadow') &&
      view.opponentPublic.stadium.length > 0 && !boardHas(view, 'Marshadow')) return 400;
  return -Infinity;
}

function scoreEvolutionPlay(item) {
  if (hasName(item.actorPrinting, 'Shadow Rider Calyrex VMAX') &&
      hasName(item.targetPrinting, 'Shadow Rider Calyrex V')) return 970;
  return -Infinity;
}

function scoreEnergyPlay(item, view, receipt) {
  const metadata = item.publicMetadata ?? {};
  if (metadata.targetSeat !== 'actor' ||
      !['active', 'bench'].includes(metadata.targetZone) ||
      !hasName(item.actorPrinting, 'Psychic Energy')) return -Infinity;
  const target = metadata.targetZone === 'active'
    ? view.ownPublic.active : view.ownPublic.bench[metadata.targetIndex];
  if (!target || (item.targetPrinting && target.printing !== item.targetPrinting)) return -Infinity;
  const count = slotEnergyCount(target);
  // Do not divert the last held Psychic into a Benched Underworld Door
  // recipient while Max Geist in the Active Spot remains underfunded.
  // This priority is ONLY an Active one-of-three funding state:
  // with two held Psychic, Door can consume one and still leave a manual
  // attachment to the Active; other stronger playable actions keep priority.
  if (metadata.targetZone === 'active' &&
      hasName(target.printing, 'Shadow Rider Calyrex VMAX') &&
      count === 1 && psychicEnergyCount(view) >= 5 &&
      view.ownHand.filter(card => hasName(card, 'Psychic Energy')).length === 1 &&
      target.attacks?.some(attack => attack.name === 'Max Geist' &&
        Array.isArray(attack.cost) && attack.cost.length === 3)) {
    return 895;
  }
  if (hasName(target.printing, 'Girafarig LOT') &&
      opponentHasRegidrago(view) &&
      (view.opponentPublic.discard ?? []).length > 0 &&
      count === 0) return 720;
  // Do not pass with a Psychic in hand when one manual Active attachment
  // would make the first printed attack payable. This checks a hypothetical
  // actor-owned attachment only; the host still authorizes real root actions.
  if (metadata.targetZone === 'active' && view.opponentPublic.active) {
    const before = bestAttackForSlot(target, view, view.opponentPublic.active,
      { publicEventReceipt: receipt });
    const funded = {
      ...target, energies: [...(target.energies ?? []), item.actorPrinting]
    };
    const after = bestAttackForSlot(funded, view, view.opponentPublic.active,
      { publicEventReceipt: receipt });
    if (!before && after) return 1120;
  }
  if (opponentHasRegidrago(view) && hasName(target.printing, 'Mimikyu') && count < 2) return 920;
  if (hasName(target.printing, 'Shadow Rider Calyrex VMAX') &&
      psychicEnergyCount(view) < 5 && count < 5) return 880;
  if (opponentHasDragon(view) && hasName(target.printing, "Lillie's Clefairy ex") &&
      count < 2) return 840;
  if (hasName(target.printing, 'Shadow Rider Calyrex V') && count < 3) return 600;
  return -Infinity;
}

function hasDiscardableHand(view, required = 1, playingPrinting = null) {
  // The Item being played leaves the hand *before* its discard-cost prompt;
  // counting it as a discard target overstates Ultra/Quick/Mysterious AMR.
  let omittedPlayedCard = false;
  const available = view.ownHand.filter(printing => {
    if (!omittedPlayedCard && printing === playingPrinting) {
      omittedPlayedCard = true;
      return false;
    }
    return true;
  });
  const ranked = available.map(printing => discardValue(view, printing))
    .sort((a, b) => a - b);
  return ranked.length >= required &&
    ranked.slice(0, required).every(value => value < 800);
}

function hasAbilityLockThreat(view) {
  return allBoard(view).some(slot =>
    hasName(slot.printing, 'Iron Thorns ex') ||
    hasName(slot.printing, 'Garbodor') ||
    hasName(slot.printing, 'Snorlax PGO'));
}

function hasStadiumRemovalTarget(view) {
  // Wondrous Labyrinth ◇ prevents all effects of Items and Supporters done
  // to itself, so Field Blower cannot remove it. A different Stadium may.
  return [...view.ownPublic.stadium, ...view.opponentPublic.stadium].some(name =>
    hasName(name, 'Path to the Peak') ||
    hasName(name, 'Jamming Tower'));
}

// Guzma requires our Active to switch only when we have a Bench to switch
// into; with an empty Bench its opponent gust still resolves, and our Active
// remains. When a Bench exists, evaluate the forced post-switch attacker
// rather than wrongly counting the departing Active's damage.
function canGuzmaForAttack(view, receipt) {
  const opponents = view.opponentPublic.bench.filter(Boolean);
  if (opponents.length === 0) return false;
  const benchAttackers = view.ownPublic.bench.filter(Boolean);
  const attackers = benchAttackers.length > 0
    ? benchAttackers : [view.ownPublic.active].filter(Boolean);
  return opponents.some(target => attackers.some(attacker => {
    const attack = bestAttackForSlot(attacker, view, target,
      { publicEventReceipt: receipt });
    return attack && attack.damage !== null &&
      attack.damage >= Math.max(0, target.hp - target.damage);
  }));
}

function stoneSearchNeed(view) {
  const hasVMAX = ownBoard(view).some(slot =>
    hasName(slot.printing, 'Shadow Rider Calyrex VMAX'));
  const needsCounter = opponentHasRegidrago(view) &&
    !boardHas(view, 'Mimikyu') && !handHas(view, 'Mimikyu');
  const needsEnergy = psychicEnergyCount(view) < 3 &&
    !handHas(view, 'Psychic Energy');
  return (!hasVMAX && !handHas(view, 'Shadow Rider Calyrex VMAX')) ||
    needsCounter || needsEnergy;
}

function opponentToolJammerActive(view) {
  return (view.opponentPublic.active?.tools ?? [])
    .some(tool => hasName(tool, 'Tool Jammer'));
}

function currentActiveCanRetreat(view) {
  const active = view.ownPublic.active;
  if (!active) return false;
  const restrictions = active.publicRestrictions ?? {};
  if (restrictions.cannotRetreat === true ||
      restrictions.cannotRetreatNextTurn === true ||
      restrictions.cannotRetreatWhileActive === true) return false;
  const conditions = active.specialConditions ?? [];
  return !conditions.some(condition =>
    /ASLEEP|PARALYZED/i.test(String(condition)));
}

function toolsKnownLive(view) {
  const own = view.ownPublic.publicTurnRestrictions
    .stadiumAndToolHaveNoEffectTurnsRemaining;
  const opp = view.opponentPublic.publicTurnRestrictions
    .stadiumAndToolHaveNoEffectTurnsRemaining;
  return own === 0 && opp === 0 &&
    ![...view.ownPublic.stadium, ...view.opponentPublic.stadium]
      .some(stadium => hasName(stadium, 'Jamming Tower')) &&
    !opponentToolJammerActive(view);
}

function ownedToolRecipient(item, view) {
  const m = item.publicMetadata ?? {};
  if (m.targetSeat !== 'actor' ||
      !['active', 'bench'].includes(m.targetZone)) return null;
  const target = m.targetZone === 'active'
    ? view.ownPublic.active : view.ownPublic.bench[m.targetIndex];
  if (!target || (item.targetPrinting && item.targetPrinting !== target.printing) ||
      !Array.isArray(target.tools) || target.tools.length !== 0) return null;
  return target;
}

const KNOWN_ITEM_LOCK_ATTACKS = Object.freeze([
  'Itchy Pollen', 'Quaking Punch', 'Oceanic Gloom'
]);
function attackImposedLockNeedsRanger(view, receipt) {
  const history = receipt?.opponentLastTurnAttacks;
  if (!Array.isArray(history) || history.length === 0) return false;
  const itemLocked = view.ownPublic.publicTurnRestrictions.itemPlayLocked === true;
  if (itemLocked && history.some(row =>
    KNOWN_ITEM_LOCK_ATTACKS.includes(row.attackName))) return true;
  const activeRestriction = view.ownPublic.active?.publicRestrictions ?? {};
  return [
    'cannotAttackNextTurn', 'cannotUseAttacksNextTurn',
    'cannotRetreatNextTurn'
  ].some(field => activeRestriction[field] === true);
}

function scoreTrainerPlay(item, view, receipt) {
  const name = item.actorPrinting ?? '';
  const supporterUsed = view.ownTurnResources.supporterPlayedTurn > 0;
  if (hasName(name, 'Forest Seal Stone SIT')) {
    const target = ownedToolRecipient(item, view);
    const vstarUsed = view.ownPublic.publicTurnRestrictions.vstarUsed;
    if (target && hasName(target.printing, 'Shadow Rider Calyrex V') &&
        vstarUsed === false && toolsKnownLive(view) &&
        view.ownPublic.deckCount > 0 && stoneSearchNeed(view) &&
        !hasName(view.opponentPublic.active?.printing, 'Iron Thorns ex')) {
      return 680;
    }
    return -Infinity;
  }
  if (hasName(name, 'Float Stone BKT')) {
    const target = ownedToolRecipient(item, view);
    const fundedSuccessor = view.opponentPublic.active &&
      view.ownPublic.bench.some(slot => slot &&
        bestAttackForSlot(slot, view, view.opponentPublic.active));
    if (target && target === view.ownPublic.active && fundedSuccessor &&
        toolsKnownLive(view) && currentActiveCanRetreat(view) &&
        !freeRetreatKnown(view)) return 650;
    return -Infinity;
  }
  if (hasName(name, 'Unfair Stamp') &&
      receipt?.priorOpponentTurnKO?.any === true) return 980;
  if (hasName(name, 'Teammates PRC') && !supporterUsed &&
      receipt?.priorOpponentTurnKO?.any === true &&
      view.ownPublic.deckCount > 0) return 945;
  if (hasName(name, 'Pokémon Ranger STS') && !supporterUsed &&
      attackImposedLockNeedsRanger(view, receipt)) return 840;
  if (hasName(name, 'VS Seeker') && !supporterUsed &&
      !handHas(view, 'Arven') && !handHas(view, "Lillie's Determination") &&
      view.ownPublic.discard.some(printing =>
        wonderTagSupporterScore(view, printing) > 0)) return 745;
  if (hasName(name, 'Night Stretcher') &&
      view.ownPublic.discard.some(printing =>
        nightStretcherRecoveryScore(view, printing) > 0)) return 690;
  if (hasName(name, 'Field Blower') && hasStadiumRemovalTarget(view)) return 950;
  if (hasName(name, 'Battle Compressor') && opponentHasRegidrago(view) &&
      !discardHas(view, 'Dialga-GX') && !handHas(view, 'Dialga-GX') &&
      !boardHas(view, 'Dialga-GX') && (boardHas(view, 'Mimikyu') || handHas(view, 'Mimikyu'))) return 860;
  if (hasName(name, 'Fog Crystal') &&
      (!boardHas(view, 'Shadow Rider Calyrex V') || psychicEnergyCount(view) < 3)) return 820;
  if (hasName(name, 'Mysterious Treasure') && hasDiscardableHand(view, 1, name) &&
      (opponentHasRegidrago(view) || !boardHas(view, 'Shadow Rider Calyrex V'))) return 800;
  if (hasName(name, 'Quick Ball') && hasDiscardableHand(view, 1, name) &&
      (!boardHas(view, 'Shadow Rider Calyrex V') ||
       (opponentHasRegidrago(view) && !boardHas(view, 'Mimikyu')))) return 790;
  if (hasName(name, 'Ultra Ball') && hasDiscardableHand(view, 2, name) &&
      boardHas(view, 'Shadow Rider Calyrex V') &&
      !boardHas(view, 'Shadow Rider Calyrex VMAX')) return 780;
  if (hasName(name, 'Arven') && !supporterUsed &&
      (!boardHas(view, 'Shadow Rider Calyrex V') ||
       (hasAbilityLockThreat(view) && !ownBoard(view).some(slot =>
         slot.tools.some(tool => hasName(tool, 'Stealthy Hood')))))) return 760;
  if (hasName(name, 'Guzma') && !supporterUsed && canGuzmaForAttack(view, receipt)) return 750;
  if (hasName(name, 'Acerola BUS') && !supporterUsed &&
      ownBoard(view).some(slot =>
        (slot !== view.ownPublic.active ||
         view.ownPublic.bench.some(Boolean)) &&
        prizeLiability(slot) >= 2 && slot.damage >= 80 &&
        slot.hp - slot.damage <= 150)) return 850;
  if (hasName(name, "Lillie's Determination") && !supporterUsed &&
      (view.ownPublic.handCount <= 5 ||
       (!boardHas(view, 'Shadow Rider Calyrex V') &&
        view.ownPublic.handCount <= 8) ||
       view.ownPublic.deckCount <= 10)) return 700;
  if (hasName(name, 'Iono PAL') && !supporterUsed) {
    const mine = view.ownPublic.prizeCount;
    const theirs = view.opponentPublic.prizeCount;
    if (Number.isSafeInteger(mine) && Number.isSafeInteger(theirs)) {
      // Late opposing low-Prize hand reset is discrete tactical value.
      if (theirs <= 2 && mine >= 2 &&
          view.opponentPublic.handCount >= 4) return 925;
      // At 4-6 remaining Prizes this is also a legitimate replenishment.
      if (mine >= 4 && view.ownPublic.handCount <= 3) return 690;
      if (mine >= 4 && view.ownPublic.handCount <= 5 &&
          !boardHas(view, 'Shadow Rider Calyrex VMAX')) return 550;
    }
  }
  if (hasName(name, 'Sky Field') && !view.ownPublic.stadium.some(s => hasName(s, 'Sky Field')) &&
      countBench(view.ownPublic) + countBench(view.opponentPublic) < 6 &&
      boardHas(view, "Lillie's Clefairy ex")) return 620;
  if (hasName(name, 'Dimension Valley') &&
      dimensionValleyStatus(view) === false &&
      ownBoard(view).some(slot => slot.printed.types.includes('Psychic'))) return 600;
  if (isTool(name) && hasName(name, 'Stealthy Hood') && hasAbilityLockThreat(view) &&
      ownBoard(view).some(slot => hasName(slot.printing, 'Shadow Rider Calyrex V'))) return 580;
  return -Infinity;
}

function freeRetreatKnown(view) {
  const active = view.ownPublic.active;
  if (!active) return false;
  const hasFloatStone = active.tools.some(tool => hasName(tool, 'Float Stone'));
  if (hasFloatStone) {
    const ownSuppression =
      view.ownPublic.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining;
    const opponentSuppression =
      view.opponentPublic.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining;
    if (ownSuppression === 0 && opponentSuppression === 0) return true;
  }
  const isBasic = active.printed.subtypes.includes('Basic');
  return isBasic && skylinerStatus(view) === true;
}

function chooseRetreat(view, items, receipt) {
  if (!freeRetreatKnown(view) || !view.opponentPublic.active) return null;
  const current = bestAttackForSlot(view.ownPublic.active, view,
    view.opponentPublic.active, { publicEventReceipt: receipt });
  const retreats = items.filter(item => item.kind === 'retreat');
  let best = null;
  for (const item of retreats) {
    const index = item.publicMetadata?.benchIndex;
    if (!Number.isSafeInteger(index)) continue;
    const target = view.ownPublic.bench[index];
    if (!target || (item.targetPrinting && item.targetPrinting !== target.printing)) {
      recordPolicyAuditUnscored(item.token, 'RETREAT_TARGET_UNAVAILABLE');
      continue;
    }
    const attack = bestAttackForSlot(target, view,
      view.opponentPublic.active, { publicEventReceipt: receipt });
    if (!attack) {
      recordPolicyAuditUnscored(item.token, 'RETREAT_ATTACK_NOT_PAYABLE');
      continue;
    }
    const improvement = attack.score - (current?.score ?? 0);
    const score = attack.score + improvement;
    recordPolicyAuditScore(item.token, score, 'RETREAT_SCORE_NOT_FINITE');
    if (score > (best?.score ?? -Infinity)) best = { item, score };
  }
  return best && best.score > 0 ? best.item : null;
}

// Native root legality is authoritative.  In the fixed Psychic-only 60,
// Underworld Door attaches a Psychic to an eligible Benched Psychic and draws
// two, preserving the ordinary once-per-turn hand attachment.  Refuse stale
// native offers when public/owner-visible prerequisites are missing.
function eligibleCandidateDoor(view, actions) {
  if (!handHas(view, 'Psychic Energy') ||
      view.ownPublic.deckCount < 3 ||
      !view.ownPublic.bench.some(p => p?.printed?.types?.includes('Psychic'))) {
    return null;
  }
  return actions.find(a => a.kind === 'use-ability' &&
    a.publicMetadata?.abilityName === 'Underworld Door' &&
    hasName(a.actorPrinting, 'Shadow Rider Calyrex VMAX')) ?? null;
}

function chooseRoot(view, request) {
  const items = request.actionFrontier.items.filter(item =>
    ['play-card', 'attack', 'retreat', 'use-ability', 'use-stadium', 'pass'].includes(item.kind));
  const pass = items.find(item => item.kind === 'pass');

  const plays = items.filter(item => item.kind === 'play-card');
  const scoredPlays = plays.map(item => {
    const basic = scoreBasicPlay(item, view, request.publicEventReceipt);
    const evolution = scoreEvolutionPlay(item);
    const energy = scoreEnergyPlay(item, view, request.publicEventReceipt);
    const trainer = scoreTrainerPlay(item, view, request.publicEventReceipt);
    const score = Math.max(basic, evolution, energy, trainer);
    recordPolicyAuditScore(item.token, score, 'NO_ELIGIBLE_PLAY_COMPONENT', [
      { name: 'basic-play', score: basic },
      { name: 'evolution-play', score: evolution },
      { name: 'energy-play', score: energy },
      { name: 'trainer-play', score: trainer }
    ]);
    return { item, score };
  }).filter(row => Number.isFinite(row.score)).sort((a, b) =>
    b.score - a.score || a.item.token.localeCompare(b.item.token));
  const door = eligibleCandidateDoor(view, items);
  const best = scoredPlays[0]?.item ?? null;
  // Do not burn the last hand Psychic as a normal BENCH attachment before
  // the legal accelerating/drawing Ability. Preserve higher-priority search
  // and evolution and manual ACTIVE attack-enabling attachments.
  if (door && (!best || (
    hasName(best.actorPrinting, 'Psychic Energy') &&
    best.publicMetadata?.targetZone === 'bench'))) {
    setPolicyAuditRule('ROOT_UNDERWORLD_DOOR_BEFORE_BENCH_ENERGY',
      'FIRST_NATIVE_FRONTIER_MATCH');
    recordPolicyAuditRule(door.token, 'UNDERWORLD_DOOR_ENERGY_DRAW');
    return {kind:'select-action',token:door.token};
  }
  if (scoredPlays.length > 0) {
    setPolicyAuditRule('ROOT_PLAY_MAX_COMPONENT_SCORE', 'SCORE_DESC_TOKEN_ASC');
    return { kind: 'select-action', token: scoredPlays[0].item.token };
  }

  const retreat = chooseRetreat(view, items, request.publicEventReceipt);
  if (retreat) {
    setPolicyAuditRule('ROOT_RETREAT_ATTACK_IMPROVEMENT', 'SCORE_DESC_NATIVE_FRONTIER_ORDER');
    return { kind: 'select-action', token: retreat.token };
  }

  const active = view.ownPublic.active;
  const target = view.opponentPublic.active;
  if (active && target) {
    const attacks = items.filter(item => item.kind === 'attack' && item.attackName);
    const scoredAttacks = attacks.map(item => {
      const attack = active.attacks.find(row => row.name === item.attackName);
      const score = attackScore(active, attack, view, target, {
        publicEventReceipt: request.publicEventReceipt
      });
      recordPolicyAuditScore(item.token, score, 'NO_ELIGIBLE_ATTACK_SCORE');
      return { item, score };
    }).filter(row => Number.isFinite(row.score)).sort((a, b) =>
      b.score - a.score || a.item.token.localeCompare(b.item.token));
    if (scoredAttacks.length > 0 && scoredAttacks[0].score > 0) {
      setPolicyAuditRule('ROOT_ATTACK_SCORE', 'SCORE_DESC_TOKEN_ASC');
      return { kind: 'select-action', token: scoredAttacks[0].item.token };
    }
  }

  const abilities = items.filter(item => item.kind === 'use-ability');
  const usefulAbility = abilities.find(item =>
    item.publicMetadata?.abilityName === 'Resetting Hole' &&
    hasStadiumRemovalTarget(view));
  const starAlchemy = abilities.find(item => {
    if (item.publicMetadata?.abilityName !== 'Star Alchemy' ||
        view.ownPublic.publicTurnRestrictions.vstarUsed !== false ||
        !stoneSearchNeed(view) ||
        view.ownPublic.deckCount <= 0 ||
        !toolsKnownLive(view) ||
        hasName(view.opponentPublic.active?.printing, 'Iron Thorns ex')) return false;
    return ownBoard(view).some(slot =>
      hasName(slot.printing, 'Shadow Rider Calyrex V') &&
      slot.tools.some(tool => hasName(tool, 'Forest Seal Stone')));
  });
  if (starAlchemy) {
    setPolicyAuditRule('ROOT_FOREST_SEAL_STONE_STAR_ALCHEMY',
      'FIRST_NATIVE_FRONTIER_MATCH');
    recordPolicyAuditRule(starAlchemy.token, 'VSTAR_ONE_CARD_SEARCH');
    return {kind:'select-action',token:starAlchemy.token};
  }
  for (const item of abilities) {
    if (usefulAbility && item.token === usefulAbility.token) {
      recordPolicyAuditRule(item.token, 'RESETTING_HOLE_STADIUM_REMOVAL');
    } else {
      recordPolicyAuditUnscored(item.token, 'UNSUPPORTED_ABILITY_BRANCH');
    }
  }
  if (usefulAbility) {
    setPolicyAuditRule('ROOT_RESETTING_HOLE_RULE', 'FIRST_FRONTIER_MATCH');
    return { kind: 'select-action', token: usefulAbility.token };
  }

  if (pass) {
    setPolicyAuditRule('ROOT_PASS_FALLBACK', 'FIRST_FRONTIER_MATCH');
    recordPolicyAuditRule(pass.token, 'PASS_FALLBACK');
    return { kind: 'select-action', token: pass.token };
  }
  return abstain('NO_SUPPORTED_ROOT_ACTION');
}

function createPolicy({ role, seat, policyVersion, config }) {
  if (role !== 'candidate' || (seat !== 0 && seat !== 1) ||
      policyVersion !== POLICY_VERSION || !config ||
      typeof config !== 'object' || Array.isArray(config) ||
      Object.keys(config).length !== 0) {
    throw new Error('AGENT46_POLICY_INIT_MISMATCH');
  }

  function evaluateRequest(request) {
    if (!request || request.role !== 'candidate' || request.seat !== seat ||
        !request.observation || request.observation.actorSeat !== seat) {
      return abstain('ROLE_SEAT_OBSERVATION_MISMATCH');
    }
    const view = request.observation;
    if (request.prompt === null && view.decisionKind === 'owner-root') {
      return chooseRoot(view, request);
    }
    if (request.prompt && view.decisionKind === 'owner-prompt' &&
        request.prompt.actingSeat === seat) {
      return choosePrompt(view, request.prompt, request.publicEventReceipt);
    }
    return abstain('DECISION_KIND_MISMATCH');
  }

  return {
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
  };
}

module.exports = { POLICY_VERSION, createPolicy };
