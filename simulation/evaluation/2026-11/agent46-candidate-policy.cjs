'use strict';

/*
 * Agent46 candidate-only policy v1.
 *
 * This module is deliberately a pure worker bundle: it has no imports, engine
 * objects, native actions, Store access, filesystem/network/process access,
 * hidden deck/Prize identities, physical seed, or policy RNG. Every executable
 * choice is an opaque token copied from the current host-projected frontier.
 * Unknown prompt provenance or actor-visible state fails closed.
 */

const POLICY_VERSION = 'agent46-hood-candidate-v1';

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
  if (sourceZone === 'deck' && effectName === 'Battle Compressor') {
    return choices.map(choice => ({
      choice,
      score: hasName(choice.printing, 'Dialga-GX') &&
        opponentHasRegidrago(view) && !discardHas(view, 'Dialga-GX') ? 1000 :
        -discardValue(view, choice.printing)
    }));
  }
  if (sourceZone === 'hand') {
    return choices.map(choice => ({
      choice, score: -discardValue(view, choice.printing)
    }));
  }
  return choices.map(choice => ({
    choice, score: searchNeedScore(view, choice.printing, effectName)
  }));
}

function chooseCardCombination(view, prompt) {
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
  })).sort((a, b) => a.score - b.score ||
    String(a.choice.printing).localeCompare(String(b.choice.printing)));
  const selected = ranked.slice(0, Math.min(1, maximum));
  if (selected.length < minimum) return abstain('NO_VISIBLE_ENERGY_CHOICE');
  return { kind: 'select-choices', tokens: selected.map(row => row.choice.token) };
}

function chooseAttackPrompt(view, prompt, receipt) {
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
  ranked.sort((a, b) => b.score - a.score ||
    a.choice.token.localeCompare(b.choice.token));
  if (!Number.isFinite(ranked[0]?.score) || ranked[0].score <= 0) {
    return abstain('NO_SUPPORTED_ATTACK_CHOICE');
  }
  return { kind: 'select-choice', token: ranked[0].choice.token };
}

function choosePrizeSlots(prompt) {
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
  })).sort((a, b) => b.score - a.score ||
    String(a.choice.printing).localeCompare(String(b.choice.printing)));
  const required = metadata.count;
  if (!Number.isSafeInteger(required) || ranked.length !== required) {
    return abstain('CARD_ORDER_COUNT_MISMATCH');
  }
  return { kind: 'select-choices', tokens: ranked.map(row => row.choice.token) };
}

function choosePrompt(view, prompt, receipt) {
  if (!prompt || prompt.actingSeat !== view.actorSeat ||
      prompt.source?.classification !== 'actor-choice') {
    return abstain('UNTRUSTED_PROMPT');
  }
  switch (prompt.promptType) {
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
    case 'SelectPrompt':
    case 'SelectOptionPrompt': {
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
  const active = view.ownPublic.active;
  if (!active || !view.opponentPublic.active) return false;
  return view.opponentPublic.bench.some(slot => {
    if (!slot) return false;
    const attack = bestAttackForSlot(active, view, slot);
    return attack && attack.damage >= Math.max(0, slot.hp - slot.damage);
  });
}

function scoreTrainerPlay(item, view, receipt) {
  const name = item.actorPrinting ?? '';
  const supporterUsed = view.ownTurnResources.supporterPlayedTurn > 0;
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
    if (!target || (item.targetPrinting && item.targetPrinting !== target.printing)) continue;
    const attack = bestAttackForSlot(target, view, view.opponentPublic.active);
    if (!attack) continue;
    const improvement = attack.score - (current?.score ?? 0);
    const score = attack.score + improvement;
    if (score > (best?.score ?? -Infinity)) best = { item, score };
  }
  return best && best.score > 0 ? best.item : null;
}

function chooseRoot(view, request) {
  const items = request.actionFrontier.items.filter(item =>
    ['play-card', 'attack', 'retreat', 'use-ability', 'use-stadium', 'pass'].includes(item.kind));
  const pass = items.find(item => item.kind === 'pass');

  const plays = items.filter(item => item.kind === 'play-card');
  const scoredPlays = plays.map(item => {
    const basic = scoreBasicPlay(item, view);
    const evolution = scoreEvolutionPlay(item);
    const energy = scoreEnergyPlay(item, view);
    const trainer = scoreTrainerPlay(item, view, request.publicEventReceipt);
    return { item, score: Math.max(basic, evolution, energy, trainer) };
  }).filter(row => Number.isFinite(row.score)).sort((a, b) =>
    b.score - a.score || a.item.token.localeCompare(b.item.token));
  if (scoredPlays.length > 0) return { kind: 'select-action', token: scoredPlays[0].item.token };

  const retreat = chooseRetreat(view, items);
  if (retreat) return { kind: 'select-action', token: retreat.token };

  const active = view.ownPublic.active;
  const target = view.opponentPublic.active;
  if (active && target) {
    const attacks = items.filter(item => item.kind === 'attack' && item.attackName);
    const scoredAttacks = attacks.map(item => {
      const attack = active.attacks.find(row => row.name === item.attackName);
      return {
        item,
        score: attackScore(active, attack, view, target, {
          publicEventReceipt: request.publicEventReceipt
        })
      };
    }).filter(row => Number.isFinite(row.score)).sort((a, b) =>
      b.score - a.score || a.item.token.localeCompare(b.item.token));
    if (scoredAttacks.length > 0 && scoredAttacks[0].score > 0) {
      return { kind: 'select-action', token: scoredAttacks[0].item.token };
    }
  }

  const abilities = items.filter(item => item.kind === 'use-ability');
  const usefulAbility = abilities.find(item =>
    item.publicMetadata?.abilityName === 'Resetting Hole' &&
    hasStadiumRemovalTarget(view));
  if (usefulAbility) return { kind: 'select-action', token: usefulAbility.token };

  if (pass) return { kind: 'select-action', token: pass.token };
  return abstain('NO_SUPPORTED_ROOT_ACTION');
}

function createPolicy({ role, seat, policyVersion, config }) {
  if (role !== 'candidate' || (seat !== 0 && seat !== 1) ||
      policyVersion !== POLICY_VERSION || !config ||
      typeof config !== 'object' || Array.isArray(config) ||
      Object.keys(config).length !== 0) {
    throw new Error('AGENT46_POLICY_INIT_MISMATCH');
  }

  return {
    decide(request) {
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
  };
}

module.exports = { POLICY_VERSION, createPolicy };
