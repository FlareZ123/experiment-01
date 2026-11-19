'use strict';

/*
 * Rank-10 Phantom Dive allocation helpers.
 *
 * Host-side projection: enumerate complete legal target allocations from the
 * native PutDamagePrompt's permitted target geometry, then map one opaque
 * select-choice token back to the exact native placement array.
 * Worker-side policy: score only the flat public label and actor-visible board.
 * No Twinleaf, Store, runner, filesystem, RNG, or hidden-state imports.
 */

const ALLOCATION_LABEL_PREFIX = 'PD1|';
const MAX_PHANTOM_DIVE_CHOICES = 512;
const PHANTOM_DIVE_DAMAGE = 60;
const DAMAGE_MULTIPLE = 10;

function list(value) {
  return Array.isArray(value) ? value : [];
}

function remainingHp(pokemon) {
  if (!pokemon || !Number.isFinite(pokemon.hp) || !Number.isFinite(pokemon.damage)) return -1;
  return pokemon.hp - pokemon.damage;
}

function prizeValue(pokemon) {
  const subtypes = list(pokemon?.printed?.subtypes).map(String);
  const printing = typeof pokemon?.printing === 'string' ? pokemon.printing : '';
  if (subtypes.includes('VMAX') || subtypes.includes('TAG TEAM') || subtypes.includes('V-UNION') ||
      /VMAX|TAG\s*TEAM|V-UNION/i.test(printing)) return 3;
  if (subtypes.some(value => ['V', 'VSTAR', 'GX', 'ex'].includes(value)) ||
      /(?:-GX|\bVSTAR\b|\bex\b)/i.test(printing)) return 2;
  return 1;
}

function targetPriority(pokemon, observation) {
  const printing = typeof pokemon?.printing === 'string' ? pokemon.printing : '';
  const opponentDiscard = list(observation?.opponentPublic?.discard)
    .map(card => typeof card === 'string' ? card : card?.printing ?? '')
    .join(' ');
  if (/^Mimikyu GRI 58\b/i.test(printing)) {
    return /Dialga-GX UPR 100/i.test(opponentDiscard) ? 240 : 200;
  }
  if (/^Lillie's Clefairy ex JTG 56\b/i.test(printing)) return 190;
  if (/^Shadow Rider Calyrex VMAX CRE 75\b/i.test(printing)) return 150;
  if (/^Latias ex SSP 76\b/i.test(printing)) return 120;
  return 50 + Math.max(0, 200 - remainingHp(pokemon)) / 10;
}

function enumerateWeakCompositions(total, parts) {
  if (!Number.isSafeInteger(total) || total < 0 ||
      !Number.isSafeInteger(parts) || parts < 1) return [];
  const result = [];
  const current = Array(parts).fill(0);
  function visit(index, remaining) {
    if (index === parts - 1) {
      current[index] = remaining;
      result.push(current.slice());
      return;
    }
    for (let value = 0; value <= remaining; value += 1) {
      current[index] = value;
      visit(index + 1, remaining - value);
    }
  }
  visit(0, total);
  return result;
}

function allocationLabel(targets, units, multiple = DAMAGE_MULTIPLE) {
  const entries = [];
  for (let i = 0; i < targets.length; i += 1) {
    if (units[i] === 0) continue;
    entries.push('b' + targets[i].index + '=' + (units[i] * multiple));
  }
  return ALLOCATION_LABEL_PREFIX + entries.join(',');
}

function parsePhantomDiveAllocationLabel(label) {
  if (typeof label !== 'string' || !label.startsWith(ALLOCATION_LABEL_PREFIX)) return null;
  const body = label.slice(ALLOCATION_LABEL_PREFIX.length);
  if (!body) return null;
  const rows = [];
  const seen = new Set();
  let previousIndex = -1;
  for (const part of body.split(',')) {
    const match = /^b(0|[1-9]\d*)=(10|[1-9]\d*0)$/.exec(part);
    if (!match) return null;
    const index = Number(match[1]);
    const damage = Number(match[2]);
    if (!Number.isSafeInteger(index) || !Number.isSafeInteger(damage) ||
        damage <= 0 || damage % DAMAGE_MULTIPLE !== 0 || seen.has(index) ||
        index <= previousIndex) return null;
    seen.add(index);
    previousIndex = index;
    rows.push({ ownerSeat: 'opponent', zone: 'bench', index, damage });
  }
  if (rows.reduce((sum, row) => sum + row.damage, 0) !== PHANTOM_DIVE_DAMAGE) return null;
  return rows;
}

/**
 * Build worker-safe complete-allocation choices and the host-only token map.
 * targets must be derived from genuine PutDamagePrompt.maxAllowedDamage rows
 * after the host has mapped PlayerType/SlotType to actor-relative geometry.
 * Positive maxAllowedDamage values are not treated as caps: the existing
 * paper guard establishes only zero-cap exclusion; positive values may be UI
 * or HP hints. The native target is retained only in choiceByToken, never exposed.
 */
function enumeratePhantomDiveAllocationChoices({
  damage,
  damageMultiple,
  allowPlacePartialDamage,
  targets,
  maxChoices = MAX_PHANTOM_DIVE_CHOICES
} = {}) {
  if (damage !== PHANTOM_DIVE_DAMAGE || damageMultiple !== DAMAGE_MULTIPLE ||
      allowPlacePartialDamage === true) {
    return { ok: false, reasonCode: 'UNSUPPORTED_PUT_DAMAGE_CONTRACT', choices: [], choiceByToken: new Map() };
  }
  if (!Number.isSafeInteger(maxChoices) || maxChoices < 1 || maxChoices > MAX_PHANTOM_DIVE_CHOICES ||
      !Array.isArray(targets) || targets.length < 1 || targets.length > 6) {
    return { ok: false, reasonCode: 'UNSUPPORTED_PHANTOM_DIVE_TARGET_COUNT', choices: [], choiceByToken: new Map() };
  }
  const seen = new Set();
  const eligible = [];
  for (const row of targets) {
    if (!row || row.ownerSeat !== 'opponent' || row.zone !== 'bench' ||
        !Number.isSafeInteger(row.index) || row.index < 0 ||
        !row.target || typeof row.target !== 'object' ||
        !Number.isSafeInteger(row.target.player) ||
        !Number.isSafeInteger(row.target.slot) ||
        row.target.index !== row.index ||
        !Number.isSafeInteger(row.maxAllowedDamage) || row.maxAllowedDamage < 0) {
      return { ok: false, reasonCode: 'INVALID_PHANTOM_DIVE_TARGET_DESCRIPTOR', choices: [], choiceByToken: new Map() };
    }
    const key = 'opponent:bench:' + row.index;
    if (seen.has(key)) {
      return { ok: false, reasonCode: 'DUPLICATE_PHANTOM_DIVE_TARGET', choices: [], choiceByToken: new Map() };
    }
    seen.add(key);
    if (row.maxAllowedDamage === 0) continue;
    eligible.push(row);
  }
  eligible.sort((a, b) => a.index - b.index);
  if (eligible.length < 1 || eligible.length > 6) {
    return { ok: false, reasonCode: 'NO_LEGAL_PHANTOM_DIVE_TARGETS', choices: [], choiceByToken: new Map() };
  }
  const allocations = enumerateWeakCompositions(PHANTOM_DIVE_DAMAGE / DAMAGE_MULTIPLE, eligible.length);
  if (allocations.length > maxChoices) {
    return { ok: false, reasonCode: 'PHANTOM_DIVE_CHOICE_LIMIT_EXCEEDED', choices: [], choiceByToken: new Map() };
  }
  const choices = [];
  const choiceByToken = new Map();
  for (const units of allocations) {
    const label = allocationLabel(eligible, units);
    const token = 'pd1:' + label.slice(ALLOCATION_LABEL_PREFIX.length);
    const placements = eligible.flatMap((target, index) => units[index] > 0
      ? [{ target: target.target, damage: units[index] * DAMAGE_MULTIPLE }]
      : []);
    if (parsePhantomDiveAllocationLabel(label) === null || choiceByToken.has(token)) {
      return { ok: false, reasonCode: 'PHANTOM_DIVE_ALLOCATION_ENCODING_FAILURE', choices: [], choiceByToken: new Map() };
    }
    choices.push({ token, kind: 'allocation', label });
    choiceByToken.set(token, placements);
  }
  return { ok: true, reasonCode: null, choices, choiceByToken };
}

function evaluatePhantomDiveAllocationChoice(choice, observation) {
  const rows = parsePhantomDiveAllocationLabel(choice?.label);
  if (!rows) return null;
  const bench = list(observation?.opponentPublic?.bench);
  let prizes = 0;
  let kos = 0;
  let progress = 0;
  let wasted = 0;
  for (const row of rows) {
    const pokemon = bench[row.index];
    const hp = remainingHp(pokemon);
    if (!pokemon || hp <= 0) return null;
    const effective = Math.min(row.damage, hp);
    const knockedOut = row.damage >= hp;
    if (knockedOut) {
      prizes += prizeValue(pokemon);
      kos += 1;
      wasted += Math.max(0, row.damage - hp) / DAMAGE_MULTIPLE;
    } else {
      const counters = effective / DAMAGE_MULTIPLE;
      const nearKoBonus = hp - row.damage <= 30 ? 30 : 0;
      progress += counters * (targetPriority(pokemon, observation) + prizeValue(pokemon) * 10) + nearKoBonus;
    }
  }
  const ownPrizeCount = observation?.ownPublic?.prizeCount;
  const active = observation?.opponentPublic?.active;
  const activeHp = remainingHp(active);
  const activePrizes = activeHp >= 0 && activeHp <= 0 ? prizeValue(active) : 0;
  const immediateWin = Number.isSafeInteger(ownPrizeCount) && ownPrizeCount > 0 &&
    prizes + activePrizes >= ownPrizeCount;
  const score = (immediateWin ? 1e12 : 0) + prizes * 1e9 + kos * 1e7 + progress * 100 - wasted * 10;
  return { score, prizes, kos, progress, wasted, immediateWin, allocations: rows };
}

function choosePhantomDiveAllocation(choices, observation) {
  const ranked = list(choices).map((choice, index) => ({
    choice,
    index,
    evaluation: evaluatePhantomDiveAllocationChoice(choice, observation)
  })).filter(row => row.evaluation && row.choice?.kind === 'allocation' &&
    typeof row.choice?.token === 'string' && row.choice.token.length > 0)
    .sort((a, b) => b.evaluation.score - a.evaluation.score || a.index - b.index);
  return ranked.length > 0
    ? { kind: 'select-choice', token: ranked[0].choice.token }
    : { kind: 'abstain', reasonCode: 'NO_LEGAL_PHANTOM_DIVE_ALLOCATION' };
}

module.exports = {
  ALLOCATION_LABEL_PREFIX,
  DAMAGE_MULTIPLE,
  MAX_PHANTOM_DIVE_CHOICES,
  PHANTOM_DIVE_DAMAGE,
  choosePhantomDiveAllocation,
  enumeratePhantomDiveAllocationChoices,
  enumerateWeakCompositions,
  evaluatePhantomDiveAllocationChoice,
  parsePhantomDiveAllocationLabel
};
