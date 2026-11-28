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

function canPayAttack(slot, attack, view) {
  return slotEnergyCount(slot) >= effectiveAttackCost(slot, attack, view);
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
      metadata.targetZone !== 'bench') return null;
  const index = choiceBenchIndex(choice);
  if (!Number.isSafeInteger(index)) return null;
  const player = metadata.ownerSeat === 'actor'
    ? view.ownPublic : view.opponentPublic;
  const slot = player.bench[index] ?? null;
  if (!slot || (choice.printing && slot.printing !== choice.printing)) return null;
  return { slot, index, ownerSeat: metadata.ownerSeat };
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
  if (sourceZone === 'deck' && effectName === 'Battle Compressor') {
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
  const metadata = prompt.publicMetadata;
  if (!metadata || metadata.selectionType !== 'card-combination' ||
      metadata.ownerSeat !== 'actor' || metadata.isOwnerVisible !== true ||
      !['deck', 'hand', 'discard', 'prizes'].includes(metadata.sourceZone)) {
    return abstain('UNTRUSTED_CARD_SELECTION');
  }
  const choices = prompt.choices.filter(choice =>
    choice.kind === 'card' && isText(choice.printing) &&
    choice.publicMetadata?.ownerSeat === 'actor' &&
    choice.publicMetadata?.isOwnerVisible === true);
  const minimum = metadata.minimumCount;
  const maximum = metadata.maximumCount;
  if (!Number.isSafeInteger(minimum) || !Number.isSafeInteger(maximum) ||
      minimum < 0 || maximum < minimum) return abstain('BAD_CARD_SELECTION_BOUNDS');

  if (metadata.sourceZone === 'prizes' && choices.length === 0) {
    return abstain('HIDDEN_PRIZE_IDENTITY');
  }

  const ranked = searchCandidates(view, prompt, choices)
    .sort((a, b) => b.score - a.score ||
      String(a.choice.printing).localeCompare(String(b.choice.printing)));

  let selected = [];
  if (metadata.sourceZone === 'hand' ||
      (metadata.sourceZone === 'deck' && prompt.source?.effectName === 'Battle Compressor')) {
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

  if (prompt.source?.effectName === 'Arven' && selected.length >= 2) {
    const item = selected.find(choice => isItem(choice.printing));
    const tool = selected.find(choice => isTool(choice.printing));
    if (item && tool && item.token !== tool.token) {
      selected = [item, tool].slice(0, Math.min(maximum, Math.max(minimum, 2)));
    } else if (minimum >= 2) {
      return abstain('ARVEN_ITEM_TOOL_PAIR_UNAVAILABLE');
    }
  }

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
  const actorChoices = visible.filter(row => row.target.ownerSeat === 'actor');
  const opponentChoices = visible.filter(row => row.target.ownerSeat === 'opponent');

  let ranked;
  if (effectName === 'Guzma' && actorChoices.length > 0) {
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

// The pinned source Underworld Door AttachEnergyPrompt enumerates *complete*
// single Basic Psychic Energy hand-card -> Benched Psychic Pokemon assignments.
// The native prompt projector has already checked the live target's dynamic
// Psychic type and preflighted each assignment; this worker additionally
// requires the exact source, public recipient and owner-visible hand card.
function chooseUnderworldDoorAttachment(view, prompt) {
  setPolicyAuditRule('UNDERWORLD_DOOR_ASSIGNMENT', 'BENCH_TARGET_SCORE_DESC_INDEX_ASC');
  const meta=prompt.publicMetadata??{};
  if(prompt.source?.sourceKind!=='card-effect' ||
     prompt.source.effectName!=='Underworld Door' ||
     prompt.source.sourcePrinting!=='Shadow Rider Calyrex VMAX CRE 75' ||
     prompt.description!=='ATTACH_ENERGY_TO_BENCH' ||
     meta.selectionType!=='energy-attachment' ||
     meta.ownerSeat!=='actor' || meta.sourceZone!=='hand' ||
     meta.zone!=='bench' || meta.energyType!=='BASIC' ||
     meta.isOwnerVisible!==true ||
     meta.minimumCount!==1 || meta.maximumCount!==1) {
    return abstain('UNTRUSTED_UNDERWORLD_ATTACHMENT_SOURCE');
  }
  const eligible=[];
  for(const choice of prompt.choices) {
    const m=choice.publicMetadata;
    const idx=m?.benchIndex;
    const slot=Number.isSafeInteger(idx)&&idx>=0&&idx<5
      ?view.ownPublic.bench[idx]:null;
    if(choice.kind!=='energy' ||
       choice.printing!=='Psychic Energy MEE 13' ||
       !view.ownHand.includes(choice.printing) ||
       m?.ownerSeat!=='actor' || m.isOwnerVisible!==true ||
       m.sourceZone!=='hand' || m.zone!=='bench' ||
       m.energyType!=='BASIC' ||
       !slot || !slot.printed?.types?.includes('Psychic')) {
      recordPolicyAuditUnscored(choice.token,'INVALID_UNDERWORLD_ASSIGNMENT');
      continue;
    }
    let score=200-10*slotEnergyCount(slot);
    if(hasName(slot.printing,'Shadow Rider Calyrex VMAX')) score+=50;
    else if(hasName(slot.printing,'Shadow Rider Calyrex V')) score+=30;
    if(hasName(slot.printing,'Mimikyu')&&opponentHasRegidrago(view)) score+=90;
    if(hasName(slot.printing,"Lillie's Clefairy ex")&&opponentHasDragon(view)) score+=70;
    recordPolicyAuditScore(choice.token,score,'NO_VALID_UNDERWORLD_TARGET');
    eligible.push({choice,index:idx,score});
  }
  eligible.sort((a,b)=>b.score-a.score||
    a.index-b.index||String(a.choice.token).localeCompare(String(b.choice.token)));
  if(eligible.length>0)return {kind:'select-choice',token:eligible[0].choice.token};
  const cancel=prompt.choices.find(choice=>choice.kind==='cancel');
  if(meta.allowCancel===true&&cancel){
    recordPolicyAuditRule(cancel.token,'UNDERWORLD_ATTACHMENT_CANCEL');
    return {kind:'select-choice',token:cancel.token};
  }
  return abstain('NO_VALID_UNDERWORLD_ATTACHMENT');
}

const WONDER_TAG_SUPPORTERS=Object.freeze([
  "Lillie's Determination MEG 119",'Iono PAL 185','Arven SVI 166',
  'Guzma BUS 115','Pokémon Ranger STS 104','Raihan EVS 152',
  'Teammates PRC 141','Acerola BUS 112'
]);

function sourceGuzma(prompt){
  return prompt?.source?.sourceKind==='card-effect' &&
    prompt.source.sourcePrinting==='Guzma BUS 115' &&
    prompt.source.effectName==='Guzma';
}
function chooseGuzmaPokemon(view,prompt){
  setPolicyAuditRule('GUZMA_FORCED_SWITCH_AND_GUST',
    'ACTOR_BENCH_THEN_OPPONENT_BENCH');
  const meta=prompt.publicMetadata??{};
  if(!sourceGuzma(prompt) ||
     meta.selectionType!=='pokemon-choice' ||
     meta.sourceZone!=='bench' ||
     meta.minimumCount!==1||meta.maximumCount!==1 ||
     !['actor','opponent'].includes(meta.ownerSeat) ||
     ![
       'SwitchPokemonPrompt','ChoosePokemonPrompt'
      ].includes(prompt.promptType))
    return abstain('UNTRUSTED_GUZMA_POKEMON_PROMPT');
  const self=meta.ownerSeat==='actor';
  const expectedType=self?'SwitchPokemonPrompt':'ChoosePokemonPrompt';
  if(prompt.promptType!==expectedType ||
     prompt.description!==(self?'SWITCH_POKEMON':'CHOOSE_POKEMON'))
    return abstain('GUZMA_PROMPT_DIRECTION_MISMATCH');
  const bench=self?view.ownPublic.bench:view.opponentPublic.bench;
  const choices=prompt.choices.filter(c=>{
    const idx=c.publicMetadata?.benchIndex;
    return c.kind==='pokemon' &&
      c.publicMetadata?.ownerSeat===meta.ownerSeat &&
      c.publicMetadata?.sourceZone==='bench' &&
      Number.isSafeInteger(idx)&&idx>=0&&idx<bench.length &&
      bench[idx]?.printing===c.printing;
  }).map(c=>{
    const target=bench[c.publicMetadata.benchIndex];
    let score=0;
    if(self){
      const knockouts=view.opponentPublic.bench.filter(Boolean).map(victim=>{
        const attack=bestAttackForSlot(target,view,victim);
        return attack&&attack.damage>=victim.hp-victim.damage?
          150+40*(victim.prizeValue??1):0;
      });
      score=Math.max(0,...knockouts);
      const fallback=bestAttackForSlot(target,view,view.opponentPublic.active);
      if(fallback)score+=Math.min(fallback.damage,200)/4;
      if(hasName(target.printing,'Shadow Rider Calyrex VMAX'))score+=10;
    }else{
      const attacker=view.ownPublic.active;
      const attack=bestAttackForSlot(attacker,view,target);
      if(attack){
        const hp=target.hp-target.damage;
        score=attack.damage>=hp?200+50*(target.prizeValue??1):
          Math.min(attack.damage,Math.max(hp,0))/8;
      }
      score+=Math.max(0,target.damage/20);
    }
    return {choice:c,score,index:c.publicMetadata.benchIndex};
  }).sort((a,b)=>b.score-a.score||a.index-b.index||
    String(a.choice.token).localeCompare(String(b.choice.token)));
  if(choices.length===0)return abstain('GUZMA_NO_AUTHENTICATED_BENCH_TARGET');
  recordPolicyAuditRule(choices[0].choice.token,
    self?'GUZMA_PROMOTE_REAL_ATTACKER':'GUZMA_GUST_TARGET_PRIZE_ROUTE');
  return {kind:'select-choice',token:choices[0].choice.token};
}

function sourceBattleCompressor(prompt){
  return prompt?.source?.sourceKind==='card-effect' &&
    prompt.source.sourcePrinting==='Battle Compressor PHF 92' &&
    prompt.source.effectName==='Battle Compressor';
}

function chooseBattleCompressorDragonPayload(view,prompt){
  setPolicyAuditRule('BATTLE_COMPRESSOR_REGIDRAGO_COUNTER_PAYLOAD',
    'SOURCE_CERTIFIED_DISCARD_ONLY');
  const meta=prompt.publicMetadata??{};
  if(!sourceBattleCompressor(prompt) ||
     prompt.description!=='CHOOSE_CARD_TO_DISCARD' ||
     meta.selectionType!=='card-combination' ||
     meta.ownerSeat!=='actor'||meta.sourceZone!=='deck'||
     meta.isOwnerVisible!==true||
     meta.minimumCount!==0||meta.maximumCount!==3)
    return abstain('UNTRUSTED_BATTLE_COMPRESSOR_DISCARD_PROMPT');
  const needsDialga=opponentHasRegidrago(view)&&
    !discardHas(view,'Dialga-GX') &&
    (boardHas(view,'Mimikyu')||handHas(view,'Mimikyu'));
  const dragon=needsDialga?prompt.choices.filter(choice=>
    choice.kind==='card' &&
    choice.printing==='Dialga-GX UPR 82' &&
    choice.publicMetadata?.ownerSeat==='actor' &&
    choice.publicMetadata?.sourceZone==='deck' &&
    choice.publicMetadata?.isOwnerVisible===true)
    .sort((a,b)=>
      (a.publicMetadata.selectionIndex??9999)-
      (b.publicMetadata.selectionIndex??9999)||
      String(a.token).localeCompare(String(b.token)))[0]:null;
  if(dragon){
    recordPolicyAuditRule(dragon.token,'DIALGA_TIMELESS_GX_TO_DISCARD');
    return {kind:'select-choices',tokens:[dragon.token]};
  }
  // Sending arbitrary non-Dragon resources to the discard is a real
  // opportunity cost, not a reward for merely opening the connector.
  const empty=prompt.choices.find(x=>x.kind==='empty-selection');
  if(empty)return {kind:'select-choice',token:empty.token};
  return abstain('NO_RELEVANT_DRAGON_PAYLOAD');
}

function sourceVsSeeker(prompt){
  return prompt?.source?.sourceKind==='card-effect' &&
    prompt.source.sourcePrinting==='VS Seeker PHF 109' &&
    prompt.source.effectName==='VS Seeker';
}
function chooseVsSeekerSupporter(view,prompt,receipt){
  setPolicyAuditRule('VS_SEEKER_SUPPORTER_FROM_DISCARD',
    'CURRENT_GAME_PLAN_SUPPORTER_PRIORITY');
  const meta=prompt.publicMetadata??{};
  if(!sourceVsSeeker(prompt) ||
    prompt.description!=='CHOOSE_CARD_TO_HAND' ||
    meta.selectionType!=='card-combination' ||
    meta.ownerSeat!=='actor'||meta.sourceZone!=='discard'||
    meta.isOwnerVisible!==true||meta.minimumCount!==1||
    meta.maximumCount!==1)
    return abstain('UNTRUSTED_VS_SEEKER_DISCARD_PROMPT');
  const needsHood=allBoard(view).some(slot=>
    hasAnyName(slot.printing,
      ['Iron Thorns ex','Garbodor','Galarian Weezing'])) &&
    !ownBoard(view).some(slot=>
      slot.tools?.some(tool=>hasName(tool,'Stealthy Hood')));
  const ranking={"Lillie's Determination MEG 119":65,
    'Iono PAL 185':55,'Arven SVI 166':45,'Guzma BUS 115':40,
    'Pokémon Ranger STS 104':10,'Raihan EVS 152':20,
    'Teammates PRC 141':15,'Acerola BUS 112':12};
  const candidates=prompt.choices.filter(c=>
    c.kind==='card'&&WONDER_TAG_SUPPORTERS.includes(c.printing) &&
    view.ownPublic.discard.includes(c.printing) &&
    c.publicMetadata?.ownerSeat==='actor' &&
    c.publicMetadata?.sourceZone==='discard' &&
    c.publicMetadata?.isOwnerVisible===true)
    .map(c=>{
      let score=ranking[c.printing]??0;
      if(c.printing==='Arven SVI 166'&&needsHood)score+=100;
      if(c.printing==='Guzma BUS 115'&&canGuzmaForAttack(view))score+=120;
      if(c.printing==="Lillie's Determination MEG 119"&&view.ownHand.length<=3)score+=30;
      if(c.printing==='Iono PAL 185'&&view.ownHand.length<=2)score+=15;
      if(receipt?.priorOpponentTurnKO?.any===true &&
        (c.printing==='Raihan EVS 152'||c.printing==='Teammates PRC 141'))score+=45;
      return {choice:c,score};
    }).sort((a,b)=>b.score-a.score||
      (a.choice.publicMetadata.selectionIndex??9999)-
       (b.choice.publicMetadata.selectionIndex??9999)||
      String(a.choice.token).localeCompare(String(b.choice.token)));
  if(candidates.length){
    recordPolicyAuditRule(candidates[0].choice.token,'VS_SEEKER_RECOVER_SUPPORTER');
    return {kind:'select-choices',tokens:[candidates[0].choice.token]};
  }
  return abstain('NO_AUTHENTICATED_DISCARDED_SUPPORTER');
}

function sourceWonderTag(prompt){
  return prompt?.source?.sourceKind==='card-effect' &&
    prompt.source.sourcePrinting==='Tapu Lele-GX GRI 60' &&
    prompt.source.effectName==='Tapu Lele-GX';
}

function wonderTagEligible(view){
  const own=view.ownPublic;
  if(view.ownTurnResources?.supporterPlayedTurn>0 ||
     view.ownHand.some(printing=>WONDER_TAG_SUPPORTERS.includes(printing)) ||
     !Number.isSafeInteger(own.deckCount)||own.deckCount<=0) return false;
  return true;
}

function chooseWonderTagConfirm(view,prompt){
  setPolicyAuditRule('WONDER_TAG_CONFIRM','SOURCE_CERTIFIED_SUPPORTER_NEED');
  if(!sourceWonderTag(prompt) ||
    prompt.description!=='WANT_TO_USE_ABILITY' ||
    prompt.publicMetadata?.selectionType!=='confirm')
      return abstain('UNTRUSTED_WONDER_TAG_CONFIRM');
  const yes=prompt.choices.find(choice=>
    choice.kind==='confirm'&&choice.label==='Yes');
  const no=prompt.choices.find(choice=>
    choice.kind==='confirm'&&choice.label==='No');
  if(!yes||!no)return abstain('BAD_WONDER_TAG_CONFIRM_CHOICES');
  const onBench=view.ownPublic.bench.some(slot=>
    slot?.printing==='Tapu Lele-GX GRI 60');
  const eligible=onBench&&wonderTagEligible(view);
  recordPolicyAuditRule(eligible?yes.token:no.token,
    eligible?'WONDER_TAG_FIND_SUPPORTER':'WONDER_TAG_DECLINE_RESOURCE_CONTENTION');
  return {kind:'select-choice',token:eligible?yes.token:no.token};
}

function chooseWonderTagSupporter(view,prompt,receipt){
  setPolicyAuditRule('WONDER_TAG_SUPPORTER','TACTICAL_SUPPORTER_PRIORITY');
  const meta=prompt.publicMetadata??{};
  if(!sourceWonderTag(prompt)||
     prompt.description!=='CHOOSE_CARD_TO_HAND'||
     meta.selectionType!=='card-combination'||
     meta.ownerSeat!=='actor'||meta.sourceZone!=='deck'||
     meta.isOwnerVisible!==true||
     meta.minimumCount!==0||meta.maximumCount!==1)
    return abstain('UNTRUSTED_WONDER_TAG_SUPPORTER_SEARCH');
  // Snorlax PGO's Block restricts retreat; it does NOT suppress Abilities.
  // Do not use the broad stall-threat helper to infer Stealthy Hood demand.
  const needsHood=allBoard(view).some(slot=>hasAnyName(slot.printing,
    ['Iron Thorns ex','Garbodor','Galarian Weezing']))&&
    !ownBoard(view).some(slot=>
      slot.tools?.some(tool=>hasName(tool,'Stealthy Hood')));
  const ranking=Object.freeze({
    "Lillie's Determination MEG 119":65,'Iono PAL 185':55,
    'Arven SVI 166':45,'Guzma BUS 115':40,
    'Pokémon Ranger STS 104':10,'Raihan EVS 152':20,
    'Teammates PRC 141':15,'Acerola BUS 112':12
  });
  const choices=prompt.choices.filter(c=>
    c.kind==='card'&&WONDER_TAG_SUPPORTERS.includes(c.printing) &&
    c.publicMetadata?.ownerSeat==='actor' &&
    c.publicMetadata?.sourceZone==='deck' &&
    c.publicMetadata?.isOwnerVisible===true)
    .map(c=>{
      let score=ranking[c.printing]??0;
      if(c.printing==='Arven SVI 166'&&needsHood)score+=100;
      if(c.printing==='Guzma BUS 115'&&canGuzmaForAttack(view))score+=120;
      if(c.printing==="Lillie's Determination MEG 119" &&
        view.ownHand.length<=3)score+=30;
      if(c.printing==='Iono PAL 185' &&
        view.ownHand.length<=2)score+=15;
      if(receipt?.priorOpponentTurnKO?.any===true &&
         (c.printing==='Raihan EVS 152' ||
          c.printing==='Teammates PRC 141'))score+=45;
      return {choice:c,score};
    }).sort((a,b)=>b.score-a.score ||
      (a.choice.publicMetadata.selectionIndex??9999)-
      (b.choice.publicMetadata.selectionIndex??9999)||
      String(a.choice.token).localeCompare(String(b.choice.token)));
  if(choices.length>0){
    recordPolicyAuditRule(choices[0].choice.token,'WONDER_TAG_SELECTED_SUPPORTER');
    return {kind:'select-choices',tokens:[choices[0].choice.token]};
  }
  const empty=prompt.choices.find(choice=>choice.kind==='empty-selection');
  if(empty)return {kind:'select-choice',token:empty.token};
  return abstain('NO_CERTIFIED_WONDER_TAG_SUPPORTER');
}

function sourceRadiantGate(prompt){
  return prompt?.source?.sourceKind==='card-effect' &&
    prompt.source.sourcePrinting==='Radiant Eternatus CRZ 105' &&
    prompt.source.effectName==='Radiant Eternatus';
}

// A native PlayPokemonEffect triggers Radiant Eternatus's Climactic Gate.
// The attached ConfirmPrompt is genuinely yes/no; 'yes' must be chosen
// only if two free Bench slots remain after Eternatus was benched and
// the VMAX deck-search can still meaningfully establish attackers.
function chooseRadiantGateConfirm(view,prompt){
  setPolicyAuditRule('RADIANT_GATE_CONFIRM','SOURCE_CERTIFIED_YES_OR_NO');
  if(!sourceRadiantGate(prompt) ||
     prompt.description!=='WANT_TO_USE_ABILITY' ||
     prompt.publicMetadata?.selectionType!=='confirm')
    return abstain('UNTRUSTED_RADIANT_GATE_CONFIRM');
  const yes=prompt.choices.find(choice=>
    choice.kind==='confirm'&&choice.label==='Yes');
  const no=prompt.choices.find(choice=>
    choice.kind==='confirm'&&choice.label==='No');
  if(!yes||!no)return abstain('BAD_RADIANT_GATE_CONFIRM_CHOICES');
  const realRadiant=view.ownPublic.bench.some(slot=>
    slot?.printing==='Radiant Eternatus CRZ 105');
  const canUse=realRadiant &&
    Number.isSafeInteger(view.ownPublic.deckCount) &&
    view.ownPublic.deckCount>=2 &&
    countBench(view.ownPublic)<=3 &&
    ownBoard(view).filter(slot=>
      slot.printed?.subtypes?.includes('VMAX')).length<2;
  const picked=canUse?yes:no;
  recordPolicyAuditRule(picked.token,canUse?
    'RADIANT_GATE_FETCH_VM_AFFORDABLE':'RADIANT_GATE_DECLINE_NO_VALUE');
  return {kind:'select-choice',token:picked.token};
}

// Climactic Gate can place VMAX directly onto Bench without a V Basic.
// Its host projector exposes actor-owned, visible deck cards, but the
// source-bound policy must deliberately choose the specified VMAXs.
// Generic searchNeedScore would reject VMAX if no Basic V is in play.
function chooseRadiantGateVmax(view,prompt){
  setPolicyAuditRule('RADIANT_GATE_VMAX_DIRECT_BENCH','SOURCE_VMAX_INDEX_ASC');
  const meta=prompt.publicMetadata??{};
  if(!sourceRadiantGate(prompt) ||
     prompt.description!=='CHOOSE_CARD_TO_PUT_ONTO_BENCH' ||
     meta.selectionType!=='card-combination' ||
     meta.ownerSeat!=='actor'||meta.isOwnerVisible!==true||
     meta.sourceZone!=='deck'||
     meta.minimumCount!==0||
     !Number.isSafeInteger(meta.maximumCount)||
     meta.maximumCount<1||meta.maximumCount>2) {
    return abstain('UNTRUSTED_RADIANT_GATE_VMAX_PROMPT');
  }
  const affordable=Math.min(meta.maximumCount,
    Math.max(0,5-countBench(view.ownPublic)));
  const options=prompt.choices.filter(choice=>
    choice.kind==='card' &&
    choice.printing==='Shadow Rider Calyrex VMAX CRE 75' &&
    choice.publicMetadata?.ownerSeat==='actor' &&
    choice.publicMetadata?.isOwnerVisible===true &&
    choice.publicMetadata?.sourceZone==='deck')
    .sort((a,b)=>
      (a.publicMetadata.selectionIndex??9999)-
      (b.publicMetadata.selectionIndex??9999)||
      String(a.token).localeCompare(String(b.token)));
  const chosen=options.slice(0,affordable);
  if(chosen.length>0) {
    for(const choice of chosen){
      recordPolicyAuditRule(choice.token,'RADIANT_GATE_DIRECT_VM_INSERT');
    }
    return {kind:'select-choices',tokens:chosen.map(choice=>choice.token)};
  }
  const empty=prompt.choices.find(choice=>choice.kind==='empty-selection');
  if(empty)return {kind:'select-choice',token:empty.token};
  return abstain('NO_AUTHENTICATED_RADIANT_VMAX_TARGETS');
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
    case 'SwitchPokemonPrompt':
    case 'ChoosePokemonPrompt':
      return prompt.source?.sourcePrinting==='Guzma BUS 115'||
        prompt.source?.effectName==='Guzma'
        ? chooseGuzmaPokemon(view,prompt)
        : abstain('UNSUPPORTED_POKEMON_SELECTION_PROMPT');
    case 'AttachEnergyPrompt':
      return chooseUnderworldDoorAttachment(view, prompt);
    case 'ChooseCardsPrompt':
      if(prompt.source?.sourcePrinting==='Battle Compressor PHF 92'||
         prompt.source?.effectName==='Battle Compressor')
        return chooseBattleCompressorDragonPayload(view,prompt);
      if(prompt.source?.sourcePrinting==='VS Seeker PHF 109'||
         prompt.source?.effectName==='VS Seeker')
        return chooseVsSeekerSupporter(view,prompt,receipt);
      if(prompt.source?.sourcePrinting==='Tapu Lele-GX GRI 60'||
         prompt.source?.effectName==='Tapu Lele-GX')
        return chooseWonderTagSupporter(view,prompt,receipt);
      // A malformed Radiant provenance must never fall through to generic
      // deck search, where a superficially useful VMAX could be selected.
      return prompt.source?.sourcePrinting==='Radiant Eternatus CRZ 105'||
        prompt.source?.effectName==='Radiant Eternatus'
        ? chooseRadiantGateVmax(view,prompt)
        : chooseCardCombination(view,prompt);
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
      if(sourceWonderTag(prompt)) return chooseWonderTagConfirm(view,prompt);
      if(sourceRadiantGate(prompt)) return chooseRadiantGateConfirm(view,prompt);
      // Otherwise retain the intentionally narrow single-choice contract.
      if(prompt.choices.length===1){
        setPolicyAuditRule('SINGLE_UNAMBIGUOUS_CHOICE','ONLY_CHOICE');
        return {kind:'select-choice',token:prompt.choices[0].token};
      }
      return abstain('AMBIGUOUS_SIMPLE_PROMPT');
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

function scoreBasicPlay(item, view) {
  const metadata = item.publicMetadata ?? {};
  if (metadata.targetSeat !== 'actor' || metadata.targetZone !== 'bench') return -Infinity;
  const printing = item.actorPrinting ?? '';
  if (hasName(printing, 'Shadow Rider Calyrex V') &&
      !hasName(printing, 'VMAX') &&
      !boardHas(view, 'Shadow Rider Calyrex V')) return 1000;
  if (hasName(printing, 'Mimikyu') && opponentHasRegidrago(view) &&
      !boardHas(view, 'Mimikyu')) return 950;
  if (hasName(printing, "Lillie's Clefairy ex") && opponentHasDragon(view) &&
      !boardHas(view, "Lillie's Clefairy ex")) return 900;
  // Climactic Gate is a turn-ending, high-ceiling direct-Vmax setup line.
  // Delay it behind non-terminal setup and forbid it if a profitable attack
  // could already be made. At least three open Bench slots are required
  // BEFORE playing Radiant (it occupies one, VMAXs need two more).
  if(printing==='Radiant Eternatus CRZ 105' &&
     Number.isSafeInteger(view.globalTurn) &&
     view.globalTurn<=4 &&
     countBench(view.ownPublic)<=2 &&
     Number.isSafeInteger(view.ownPublic.deckCount) &&
     view.ownPublic.deckCount>=4 &&
     ownBoard(view).filter(slot=>
       slot.printed?.subtypes?.includes('VMAX')).length<2 &&
     !allBoard(view).some(slot=>hasAnyName(slot.printing,
       ['Iron Thorns ex','Garbodor','Galarian Weezing'])) &&
     ![...view.ownPublic.stadium,...view.opponentPublic.stadium]
       .some(stadium=>hasName(stadium,'Path to the Peak')) &&
     !bestAttackForSlot(view.ownPublic.active,view,view.opponentPublic.active)){
    return 520;
  }
  // Wonder Tag pays one permanent 2-Prize Bench slot to tutor a Supporter.
  // It is not a free draw, and it competes with the much higher-ceiling
  // turn-ending Radiant Eternatus turbo line. Use only if we currently lack
  // a playable Supporter and have room to preserve Shadow Rider's Bench.
  if(printing==='Tapu Lele-GX GRI 60' &&
     countBench(view.ownPublic)<=3 &&
     Number.isSafeInteger(view.globalTurn) && view.globalTurn>=2 &&
     wonderTagEligible(view) &&
     view.ownPublic.deckCount>=3 &&
     !boardHas(view,'Tapu Lele-GX') &&
     !allBoard(view).some(slot=>hasAnyName(slot.printing,
       ['Iron Thorns ex','Garbodor','Galarian Weezing'])) &&
     ![...view.ownPublic.stadium,...view.opponentPublic.stadium]
       .some(stadium=>hasName(stadium,'Path to the Peak')))
    return 480;
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

function scoreEnergyPlay(item, view) {
  const metadata = item.publicMetadata ?? {};
  if (metadata.targetSeat !== 'actor' ||
      !['active', 'bench'].includes(metadata.targetZone) ||
      !hasName(item.actorPrinting, 'Psychic Energy')) return -Infinity;
  const target = metadata.targetZone === 'active'
    ? view.ownPublic.active : view.ownPublic.bench[metadata.targetIndex];
  if (!target || (item.targetPrinting && target.printing !== item.targetPrinting)) return -Infinity;
  const count = slotEnergyCount(target);
  if (opponentHasRegidrago(view) && hasName(target.printing, 'Mimikyu') && count < 2) return 920;
  if (hasName(target.printing, 'Shadow Rider Calyrex VMAX') &&
      psychicEnergyCount(view) < 5 && count < 5) return 880;
  if (opponentHasDragon(view) && hasName(target.printing, "Lillie's Clefairy ex") &&
      count < 2) return 840;
  if (hasName(target.printing, 'Shadow Rider Calyrex V') && count < 3) return 600;
  return -Infinity;
}

function hasDiscardableHand(view, required = 1) {
  const ranked = view.ownHand.map(printing => discardValue(view, printing))
    .sort((a, b) => a - b);
  return ranked.length >= required && ranked.slice(0, required).every(value => value < 800);
}

function hasAbilityLockThreat(view) {
  return allBoard(view).some(slot =>
    hasName(slot.printing, 'Iron Thorns ex') ||
    hasName(slot.printing, 'Garbodor') ||
    hasName(slot.printing, 'Snorlax PGO'));
}

function hasStadiumRemovalTarget(view) {
  return [...view.ownPublic.stadium, ...view.opponentPublic.stadium].some(name =>
    hasName(name, 'Path to the Peak') ||
    hasName(name, 'Jamming Tower') ||
    hasName(name, 'Wondrous Labyrinth'));
}

function canGuzmaForAttack(view) {
  // Guzma MUST switch your Active with a Benched Pokemon before its gust.
  // A ready attacker in the initial Active Spot is not sufficient proof of
  // a legal follow-on attack. Require an actually ready Benched attacker.
  const enemies=view.opponentPublic.bench;
  if(!Array.isArray(enemies)||!enemies.some(Boolean))return false;
  return view.ownPublic.bench.some(ready=>{
    if(!ready)return false;
    return enemies.some(victim=>{
      if(!victim)return false;
      const attack=bestAttackForSlot(ready,view,victim);
      return attack && attack.damage>=victim.hp-victim.damage;
    });
  });
}

function scoreToolAttachment(item,view){
  const name=item.actorPrinting;
  if(!['Forest Seal Stone SIT 156','Stealthy Hood UNB 186',
       'Float Stone BKT 137'].includes(name)) return -Infinity;
  const meta=item.publicMetadata??{};
  if(meta.targetSeat!=='actor' ||
     !['active','bench'].includes(meta.targetZone))return -Infinity;
  const target=meta.targetZone==='active'?view.ownPublic.active:
    view.ownPublic.bench[meta.targetIndex];
  if(!target||!Array.isArray(target.tools)||target.tools.length!==0 ||
     (item.targetPrinting&&item.targetPrinting!==target.printing))
    return -Infinity;
  const toolSuppressed=[...view.ownPublic.stadium,...view.opponentPublic.stadium]
    .some(stadium=>hasName(stadium,'Jamming Tower'))||
    view.ownPublic.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining>0||
    view.opponentPublic.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining>0;
  if(toolSuppressed)return -Infinity;
  const targetV=target.printed?.subtypes?.some(x=>
    ['V','VMAX','VSTAR','V-UNION'].includes(x));
  const isRider=hasName(target.printing,'Shadow Rider Calyrex V');
  const hasRealAbilityLock=allBoard(view).some(slot=>
    hasAnyName(slot.printing,
      ['Iron Thorns ex','Garbodor','Galarian Weezing']));
  if(name==='Forest Seal Stone SIT 156') {
    if(!targetV||
       view.ownPublic.publicTurnRestrictions?.vstarUsed!==false ||
       !Number.isSafeInteger(view.ownPublic.deckCount) ||
       view.ownPublic.deckCount<2) return -Infinity;
    // Prefer reserving VMAX Tools for protective Hood if needed.
    return isRider && !target.printed.subtypes.includes('VMAX')?680:
      isRider?550:450;
  }
  if(name==='Stealthy Hood UNB 186'){
    if(!hasRealAbilityLock||!isRider)return -Infinity;
    return target.printed?.subtypes?.includes('VMAX')?800:700;
  }
  if(name==='Float Stone BKT 137'){
    if(meta.targetZone!=='active'||
       target.printed?.retreatCost?.length===0 ||
       freeRetreatKnown(view))return -Infinity;
    return 540;
  }
  return -Infinity;
}

function scoreTrainerPlay(item, view, receipt) {
  const name = item.actorPrinting ?? '';
  // These three non-replaceable Tools require a specific legal recipient.
  // Never revive generic name-only score when its recipient is wrong.
  if(['Forest Seal Stone SIT 156','Stealthy Hood UNB 186',
      'Float Stone BKT 137'].includes(name))return -Infinity;
  const supporterUsed = view.ownTurnResources.supporterPlayedTurn > 0;
  // VS Seeker is an Item, but consumes a finite 2-of Supporter connector.
  // Do not recover redundantly when a Supporter is already available.
  if(name==='VS Seeker PHF 109' &&
     view.ownTurnResources?.supporterPlayedTurn===0 &&
     Number.isSafeInteger(view.globalTurn)&&view.globalTurn>=2 &&
     !view.ownHand.some(c=>WONDER_TAG_SUPPORTERS.includes(c)) &&
     view.ownPublic.discard.some(c=>WONDER_TAG_SUPPORTERS.includes(c)))
    return 575;

  if (hasName(name, 'Unfair Stamp') && receipt?.priorOpponentTurnKO?.any === true) return 980;
  if (hasName(name, 'Field Blower') && hasStadiumRemovalTarget(view)) return 950;
  if (hasName(name, 'Battle Compressor') && opponentHasRegidrago(view) &&
      !discardHas(view, 'Dialga-GX') && !handHas(view, 'Dialga-GX') &&
      !boardHas(view, 'Dialga-GX') && (boardHas(view, 'Mimikyu') || handHas(view, 'Mimikyu'))) return 860;
  if (hasName(name, 'Fog Crystal') &&
      (!boardHas(view, 'Shadow Rider Calyrex V') || psychicEnergyCount(view) < 3)) return 820;
  if (hasName(name, 'Mysterious Treasure') && hasDiscardableHand(view, 1) &&
      (opponentHasRegidrago(view) || !boardHas(view, 'Shadow Rider Calyrex V'))) return 800;
  if (hasName(name, 'Quick Ball') && hasDiscardableHand(view, 1) &&
      (!boardHas(view, 'Shadow Rider Calyrex V') ||
       (opponentHasRegidrago(view) && !boardHas(view, 'Mimikyu')))) return 790;
  if (hasName(name, 'Ultra Ball') && hasDiscardableHand(view, 2) &&
      boardHas(view, 'Shadow Rider Calyrex V') &&
      !boardHas(view, 'Shadow Rider Calyrex VMAX')) return 780;
  if (hasName(name, 'Arven') && !supporterUsed &&
      (!boardHas(view, 'Shadow Rider Calyrex V') ||
       (hasAbilityLockThreat(view) && !ownBoard(view).some(slot =>
         slot.tools.some(tool => hasName(tool, 'Stealthy Hood')))))) return 760;
  if (hasName(name, 'Guzma') && !supporterUsed && canGuzmaForAttack(view)) return 750;
  if (hasName(name, "Lillie's Determination") && !supporterUsed &&
      (view.ownPublic.handCount <= 3 || view.ownPublic.deckCount <= 10)) return 700;
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

function chooseRetreat(view, items) {
  if (!freeRetreatKnown(view) || !view.opponentPublic.active) return null;
  const current = bestAttackForSlot(view.ownPublic.active, view, view.opponentPublic.active);
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
    const attack = bestAttackForSlot(target, view, view.opponentPublic.active);
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

function chooseRoot(view, request) {
  const items = request.actionFrontier.items.filter(item =>
    ['play-card', 'attack', 'retreat', 'use-ability', 'use-stadium', 'pass'].includes(item.kind));
  const pass = items.find(item => item.kind === 'pass');

  const availableDoor=items.find(item=>
    item.kind==='use-ability' &&
    item.publicMetadata?.abilityName==='Underworld Door' &&
    item.publicMetadata?.sourceSeat==='actor' &&
    ['active','bench'].includes(item.publicMetadata?.sourceZone) &&
    item.actorPrinting==='Shadow Rider Calyrex VMAX CRE 75' &&
    ownBoard(view).some(slot=>
      slot.printing===item.actorPrinting &&
      slot.abilities?.includes('Underworld Door')) &&
    view.ownPublic.bench.some(slot=>
      slot?.printed?.types?.includes('Psychic')) &&
    view.ownHand.includes('Psychic Energy MEE 13') &&
    Number.isSafeInteger(view.ownPublic.deckCount) &&
    view.ownPublic.deckCount>=3
  );

  const plays = items.filter(item => item.kind === 'play-card');
  const scoredPlays = plays.map(item => {
    const basic = scoreBasicPlay(item, view);
    const evolution = scoreEvolutionPlay(item);
    const energy = scoreEnergyPlay(item, view);
    const trainer = scoreTrainerPlay(item, view, request.publicEventReceipt);
    const tool = scoreToolAttachment(item,view);
    const score = Math.max(basic, evolution, energy, trainer, tool);
    recordPolicyAuditScore(item.token, score, 'NO_ELIGIBLE_PLAY_COMPONENT', [
      { name: 'basic-play', score: basic },
      { name: 'evolution-play', score: evolution },
      { name: 'energy-play', score: energy },
      { name: 'trainer-play', score: trainer },
      { name: 'tool-target-attachment', score: tool }
    ]);
    return { item, score };
  }).filter(row => Number.isFinite(row.score)).sort((a, b) =>
    b.score - a.score || a.item.token.localeCompare(b.item.token));
  if (scoredPlays.length > 0) {
    // One held Psychic is an exclusive resource: manual attachment now
    // prevents this turn's otherwise legal Underworld Door draw-two.
    // Underworld Door itself attaches the SAME physical Energy, and does not
    // end the turn. Keep all non-Energy plays ahead of this check, and do not
    // override a manual attachment when a second Psychic remains available.
    if (availableDoor && scoredPlays[0].item.actorPrinting === 'Psychic Energy MEE 13' &&
        view.ownHand.filter(p => p === 'Psychic Energy MEE 13').length === 1) {
      // First resolve non-Energy construction lines that remain legal and
      // profitable; e.g. Fog Crystal thinning precedes the two new draws.
      const development=scoredPlays.find(row=>
        row.item.actorPrinting !== 'Psychic Energy MEE 13' && row.score>0);
      if(development){
        setPolicyAuditRule('ROOT_NON_ENERGY_DEVELOPMENT_BEFORE_DOOR',
          'BEST_SCORED_NON_ENERGY_ACTION');
        return {kind:'select-action',token:development.item.token};
      }
      recordPolicyAuditRule(availableDoor.token,'UNDERWORLD_SINGLE_ENERGY_CONTENTION');
      setPolicyAuditRule('ROOT_UNDERWORLD_BEFORE_SINGLE_MANUAL_ATTACHMENT',
        'RETAIN_ONLY_PSYCHIC_FOR_REPEATABLE_DRAW');
      return {kind:'select-action',token:availableDoor.token};
    }
    setPolicyAuditRule('ROOT_PLAY_MAX_COMPONENT_SCORE', 'SCORE_DESC_TOKEN_ASC');
    return { kind: 'select-action', token: scoredPlays[0].item.token };
  }

  const retreat = chooseRetreat(view, items);
  if (retreat) {
    setPolicyAuditRule('ROOT_RETREAT_ATTACK_IMPROVEMENT', 'SCORE_DESC_NATIVE_FRONTIER_ORDER');
    return { kind: 'select-action', token: retreat.token };
  }

  // Underworld Door fuels Max Geist, develops a Benched Psychic attacker and
  // draws two cards without ending the turn. Unlike the fallback one-use VSTAR
  // search, this is the deck's repeatable primary engine; use it after
  // productive card plays/retreat, but *before* an attack ends this turn.
  // The pinned action frontier preflights marker/Ability suppression; here
  // require its exact source-bound printing, a real Psychic Bench recipient,
  // owner-visible Basic Psychic Energy and enough deck for the two draws.
  const door=availableDoor;
  if(door){
    recordPolicyAuditRule(door.token,'UNDERWORLD_DOOR_ENERGY_AND_TWO_DRAW');
    setPolicyAuditRule('ROOT_UNDERWORLD_DOOR_BEFORE_ATTACK','FIRST_CERTIFIED_ENERGY_ACCELERATION');
    return {kind:'select-action',token:door.token};
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

  // Forest Seal Stone gives a Pokémon V the one-use Star Alchemy search.
  // The pinned cap-free action enumerator emits this attached-Tool power as
  // USE_ABILITY_ACTION targeting that Pokémon. The ordinary printed Pokémon
  // ability list does not include the Tool power, so validate the visible
  // attached Tool and V line rather than requiring its name in abilities.
  // With no funded development/attack remaining, a low hand and live search
  // make an otherwise unused VSTAR Power meaningfully better than passing.
  const starAlchemy = abilities.find(item =>
    item.publicMetadata?.abilityName === 'Star Alchemy' &&
    item.publicMetadata?.sourceSeat === 'actor' &&
    ['active','bench'].includes(item.publicMetadata?.sourceZone) &&
    isText(item.actorPrinting) &&
    view.ownPublic.publicTurnRestrictions.vstarUsed === false &&
    Number.isSafeInteger(view.ownPublic.deckCount) &&
    view.ownPublic.deckCount >= 2 &&
    Array.isArray(view.ownHand) && view.ownHand.length <= 3 &&
    ownBoard(view).some(slot =>
      slot.printing === item.actorPrinting &&
      Array.isArray(slot.printed?.subtypes) &&
      slot.printed.subtypes.includes('V') &&
      Array.isArray(slot.tools) &&
      slot.tools.includes('Forest Seal Stone SIT 156'))
  );
  if (starAlchemy) {
    recordPolicyAuditRule(starAlchemy.token, 'STAR_ALCHEMY_RESOURCE_RECOVERY');
    setPolicyAuditRule('ROOT_LAST_RESORT_STAR_ALCHEMY', 'FIRST_CERTIFIED_ATTACHED_TOOL_ABILITY');
    return { kind: 'select-action', token: starAlchemy.token };
  }

  // Tropical Beach is a globally usable Stadium: the physical opponent may
  // own the Stadium in play, yet the candidate can still use its optional
  // effect. The actor frontier already vouches for native playability.
  // Source-print identity must be certified before this rule is admitted:
  // all available Aichi Beach lists (ranks 3, 6, 29) use BWP 50; a raw engine
  // "Tropical Beach BWP" or unmatched print is not promoted by name alone.
  //
  // Beach draws toward seven and ENDS this turn. Therefore use it only as a
  // fallback after playable card development, mobility, attacks and ability
  // lines have been considered, never before an available profitable attack.
  const stadiumItems = items.filter(item => item.kind === 'use-stadium');
  const visibleStadium = [
    ...view.ownPublic.stadium,
    ...view.opponentPublic.stadium
  ];
  const beach = stadiumItems.find(item =>
    item.actorPrinting === 'Tropical Beach BWP 50' &&
    item.publicMetadata?.stadiumEffectLive === true &&
    visibleStadium.includes(item.actorPrinting) &&
    Array.isArray(view.ownHand) && view.ownHand.length <= 5 &&
    Number.isSafeInteger(view.ownPublic.deckCount) &&
    // Preserve at least two cards in deck AFTER drawing toward seven.
    view.ownPublic.deckCount >= 9 - view.ownHand.length
  );
  for (const item of stadiumItems) {
    if (beach && item.token === beach.token) {
      recordPolicyAuditRule(item.token, 'BEACH_AFTER_OTHER_ACTIONS');
    } else {
      recordPolicyAuditUnscored(item.token, 'UNSUPPORTED_OR_UNFUNDED_STADIUM_USE');
    }
  }
  if (beach) {
    setPolicyAuditRule('ROOT_TERMINAL_BEACH_DRAW_FALLBACK', 'FIRST_SOURCE_STAMPED_LEGAL_BEACH');
    return { kind: 'select-action', token: beach.token };
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
