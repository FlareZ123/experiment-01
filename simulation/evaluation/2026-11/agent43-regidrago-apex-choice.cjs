'use strict';

/*
 * Actor-view-only attack-choice evaluator for Regidrago VSTAR's Apex Dragon.
 * This is a reusable helper, not a complete opponent policy. It ranks only
 * attack choices already offered by the native prompt; native Twinleaf remains
 * the legality authority.
 */

function list(value) {
  return Array.isArray(value) ? value : [];
}

function printingValue(value) {
  if (typeof value === 'string') return value;
  if (typeof value?.printing === 'string') return value.printing;
  if (typeof value?.fullName === 'string') return value.fullName;
  return '';
}

function remainingHp(pokemon) {
  if (!pokemon || !Number.isFinite(pokemon.hp) || !Number.isFinite(pokemon.damage)) {
    return -1;
  }
  return pokemon.hp - pokemon.damage;
}

function occupiedBench(player) {
  return list(player?.bench).filter(Boolean);
}

function prizeValue(pokemon) {
  const subtypes = list(pokemon?.printed?.subtypes).map(String);
  const printing = printingValue(pokemon?.printing ?? pokemon);
  if (subtypes.includes('VMAX') || subtypes.includes('TAG TEAM') || subtypes.includes('V-UNION') ||
      /VMAX|TAG\s*TEAM|V-UNION/i.test(printing)) return 3;
  if (subtypes.some(value => ['V', 'VSTAR', 'GX', 'ex'].includes(value)) ||
      /(?:-GX|\bVSTAR\b|\bex\b)/i.test(printing)) return 2;
  return 1;
}

function winNow(prizeValueTaken, ownPublic) {
  const remaining = Number(ownPublic?.prizeCount);
  return Number.isSafeInteger(remaining) && remaining > 0 && prizeValueTaken >= remaining;
}

function weaknessMultiplier(target, attackerType = 'Dragon') {
  const rows = list(target?.printed?.weakness);
  const row = rows.find(value => value?.type === attackerType);
  if (!row) return 1;
  const value = String(row.value ?? '×2').toLowerCase().replace(/\s/g, '');
  if (value === '×2' || value === 'x2' || value === '2' || value === '2x') return 2;
  const parsed = Number.parseFloat(value.replace('×', '').replace('x', ''));
  return Number.isFinite(parsed) && parsed > 1 ? parsed : 2;
}

function resistanceAmount(target, attackerType = 'Dragon') {
  const rows = list(target?.printed?.resistance);
  const row = rows.find(value => value?.type === attackerType);
  if (!row) return 0;
  const parsed = Number.parseInt(String(row.value ?? '-30').replace(/[^0-9-]/g, ''), 10);
  return Number.isFinite(parsed) ? Math.abs(parsed) : 30;
}

function muscleBandBonus(attacker) {
  return list(attacker?.tools).some(tool => /Muscle Band/i.test(printingValue(tool))) ? 20 : 0;
}

function activeDamage(base, observation) {
  const attacker = observation?.ownPublic?.active;
  const target = observation?.opponentPublic?.active;
  const beforeWeakness = Math.max(0, base + muscleBandBonus(attacker));
  const multiplied = beforeWeakness * weaknessMultiplier(target, 'Dragon');
  return Math.max(0, multiplied - resistanceAmount(target, 'Dragon'));
}

function maxBenchPrizeValueWithCounters(bench, counters) {
  const targets = occupiedBench({ bench }).map(pokemon => ({
    counters: Math.ceil(Math.max(0, remainingHp(pokemon)) / 10),
    prizes: prizeValue(pokemon)
  })).filter(target => target.counters > 0 && target.counters <= counters);
  const dp = Array.from({ length: counters + 1 }, () => ({ prizes: 0, kos: 0, spent: 0 }));
  for (const target of targets) {
    for (let budget = counters; budget >= target.counters; budget -= 1) {
      const previous = dp[budget - target.counters];
      const candidate = {
        prizes: previous.prizes + target.prizes,
        kos: previous.kos + 1,
        spent: previous.spent + target.counters
      };
      const current = dp[budget];
      if (candidate.prizes > current.prizes ||
          (candidate.prizes === current.prizes && candidate.kos > current.kos)) {
        dp[budget] = candidate;
      }
    }
  }
  return dp.reduce((best, candidate) =>
    candidate.prizes > best.prizes ||
    (candidate.prizes === best.prizes && candidate.kos > best.kos) ? candidate : best,
  { prizes: 0, kos: 0, spent: 0 });
}

function maxPrizeValueForThreeTargets(observation, activeDamageAmount, benchDamageAmount) {
  const opponent = observation?.opponentPublic ?? {};
  const rows = [];
  const active = opponent.active;
  if (active) {
    const hp = remainingHp(active);
    if (hp > 0 && hp <= activeDamageAmount) {
      rows.push({ prizes: prizeValue(active), hp, zone: 'active' });
    }
  }
  for (const pokemon of occupiedBench(opponent)) {
    const hp = remainingHp(pokemon);
    if (hp > 0 && hp <= benchDamageAmount) {
      rows.push({ prizes: prizeValue(pokemon), hp, zone: 'bench' });
    }
  }
  rows.sort((a, b) => b.prizes - a.prizes || a.hp - b.hp);
  const selected = rows.slice(0, 3);
  return {
    prizes: selected.reduce((sum, row) => sum + row.prizes, 0),
    kos: selected.length
  };
}

function attackName(choice) {
  return choice?.publicMetadata?.sourceAttack ?? choice?.attackName ?? choice?.label ?? '';
}

function evaluateApexAttackChoice(choice, observation) {
  const name = attackName(choice);
  const own = observation?.ownPublic ?? {};
  const opponent = observation?.opponentPublic ?? {};
  const attacker = own.active;
  const target = opponent.active;
  const targetHp = remainingHp(target);
  const ownHp = remainingHp(attacker);
  const gxUsed = own.publicTurnRestrictions?.gxUsed;
  const payable = choice?.publicMetadata?.attackCostPayable;
  if (payable === false) return { attackName: name, score: -1, reason: 'ATTACK_COST_NOT_PAYABLE' };

  if (name === 'Timeless-GX') {
    if (gxUsed !== false) return { attackName: name, score: -1, reason: 'GX_STATUS_NOT_KNOWN_UNUSED' };
    const damage = activeDamage(150, observation);
    const knockout = targetHp > 0 && damage >= targetHp;
    const immediateWin = knockout && winNow(prizeValue(target), own);
    return {
      attackName: name,
      score: immediateWin ? 300 : (knockout ? 255 : 230),
      damage,
      activeKnockout: knockout,
      immediateWin,
      reason: 'EXTRA_TURN_GX'
    };
  }

  if (name === 'Kaiser Tackle') {
    const damage = activeDamage(280, observation);
    const knockout = targetHp > 0 && damage >= targetHp;
    const selfKnockout = ownHp > 0 && ownHp <= 60;
    const immediateWin = knockout && winNow(prizeValue(target), own);
    return {
      attackName: name,
      score: immediateWin ? 300 : ((knockout ? 210 : 115) - (selfKnockout ? 100 : 0)),
      damage,
      activeKnockout: knockout,
      selfKnockout,
      immediateWin,
      reason: 'HIGH_DAMAGE_WITH_SELF_DAMAGE'
    };
  }

  if (name === 'Phantom Dive') {
    const damage = activeDamage(200, observation);
    const knockout = targetHp > 0 && damage >= targetHp;
    const bench = maxBenchPrizeValueWithCounters(opponent.bench, 6);
    const prizesTaken = bench.prizes + (knockout ? prizeValue(target) : 0);
    const immediateWin = winNow(prizesTaken, own);
    return {
      attackName: name,
      score: immediateWin ? 300 : (135 + (knockout ? 35 : 0) + bench.prizes * 38 + bench.kos * 8),
      damage,
      activeKnockout: knockout,
      benchPrizeValue: bench.prizes,
      benchKnockouts: bench.kos,
      immediateWin,
      reason: 'ACTIVE_DAMAGE_PLUS_SIX_BENCH_COUNTERS'
    };
  }

  if (name === 'Trifrost') {
    const damage = activeDamage(110, observation);
    const targets = maxPrizeValueForThreeTargets(observation, damage, 110);
    const hasEnergyInHand = list(observation?.ownHand).some(card => /Energy/i.test(printingValue(card)));
    const immediateWin = winNow(targets.prizes, own);
    return {
      attackName: name,
      score: immediateWin ? 300 : (92 + targets.prizes * 48 + targets.kos * 12 - (hasEnergyInHand ? 0 : 18)),
      damage,
      targetPrizeValue: targets.prizes,
      targetKnockouts: targets.kos,
      immediateWin,
      reason: 'THREE_TARGET_SPREAD_DISCARDS_ALL_ENERGY'
    };
  }

  if (name === 'Rolling Iron') {
    const damage = activeDamage(200, observation);
    const knockout = targetHp > 0 && damage >= targetHp;
    const defensiveBonus = ownHp > 0 && ownHp <= 280 ? 20 : 0;
    const immediateWin = knockout && winNow(prizeValue(target), own);
    return {
      attackName: name,
      score: immediateWin ? 300 : (142 + (knockout ? 38 : 0) + defensiveBonus),
      damage,
      activeKnockout: knockout,
      immediateWin,
      reason: 'DAMAGE_PLUS_EIGHTY_REDUCTION'
    };
  }

  if (name === 'Dragon Laser') {
    const damage = activeDamage(130, observation);
    const knockout = targetHp > 0 && damage >= targetHp;
    const benchKo = occupiedBench(opponent).some(pokemon => remainingHp(pokemon) > 0 && remainingHp(pokemon) <= 30);
    const prizesTaken = (knockout ? prizeValue(target) : 0) + (benchKo ? 1 : 0);
    const immediateWin = winNow(prizesTaken, own);
    return {
      attackName: name,
      score: immediateWin ? 300 : (88 + (knockout ? 38 : 0) + (benchKo ? 14 : 0)),
      damage,
      activeKnockout: knockout,
      benchKnockoutPotential: benchKo,
      immediateWin,
      reason: 'ACTIVE_130_PLUS_BENCH_30'
    };
  }

  if (name === 'Frost Spear') {
    const damage = activeDamage(100, observation);
    const knockout = targetHp > 0 && damage >= targetHp;
    const benchKo = occupiedBench(opponent).some(pokemon => remainingHp(pokemon) > 0 && remainingHp(pokemon) <= 20);
    const prizesTaken = (knockout ? prizeValue(target) : 0) + (benchKo ? 1 : 0);
    const immediateWin = winNow(prizesTaken, own);
    return {
      attackName: name,
      score: immediateWin ? 300 : (82 + (knockout ? 38 : 0) + (benchKo ? 12 : 0)),
      damage,
      activeKnockout: knockout,
      benchKnockoutPotential: benchKo,
      immediateWin,
      reason: 'ACTIVE_100_PLUS_BENCH_20'
    };
  }

  if (name === 'Outrage' || name === 'Retribution Strike') {
    const damageCounters = Math.max(0, Math.floor(Number(attacker?.damage ?? 0) / 10));
    const damage = activeDamage(20 + damageCounters * 10, observation);
    const knockout = targetHp > 0 && damage >= targetHp;
    const immediateWin = knockout && winNow(prizeValue(target), own);
    return {
      attackName: name,
      score: immediateWin ? 300 : (78 + Math.min(70, damage * 0.35) + (knockout ? 35 : 0)),
      damage,
      activeKnockout: knockout,
      immediateWin,
      reason: 'DAMAGE_SCALES_WITH_ATTACKER_DAMAGE_COUNTERS'
    };
  }

  if (name === 'Shred') {
    const damage = activeDamage(80, observation);
    const knockout = targetHp > 0 && damage >= targetHp;
    const immediateWin = knockout && winNow(prizeValue(target), own);
    return {
      attackName: name,
      score: immediateWin ? 300 : (76 + (knockout ? 38 : 0)),
      damage,
      activeKnockout: knockout,
      immediateWin,
      reason: 'EFFECT_PIERCING_ATTACK'
    };
  }

  if (name === 'Overclock') {
    const handSize = list(observation?.ownHand).length;
    return {
      attackName: name,
      score: handSize < 6 ? 72 + (6 - handSize) * 9 : 15,
      reason: 'DRAW_TO_SIX'
    };
  }

  if (name === 'Celestial Roar') {
    const energyCount = list(attacker?.energies).length;
    const deckCount = Number(own.deckCount ?? 0);
    return {
      attackName: name,
      score: deckCount >= 3 && energyCount < 3 ? 68 : 12,
      reason: 'TOP_THREE_ENERGY_ACCELERATION'
    };
  }

  return { attackName: name, score: -1, reason: 'UNSUPPORTED_ATTACK' };
}

function rankApexChoices(choices, observation) {
  return list(choices).map((choice, index) => ({
    choice,
    index,
    evaluation: evaluateApexAttackChoice(choice, observation)
  })).filter(row => typeof row.choice?.token === 'string' && row.choice.token.length > 0)
    .sort((a, b) => b.evaluation.score - a.evaluation.score || a.index - b.index);
}

function chooseApexAttack(choices, observation) {
  const best = rankApexChoices(choices, observation).find(row => row.evaluation.score > 0);
  return best ? { kind: 'select-choice', token: best.choice.token } :
    { kind: 'abstain', reasonCode: 'NO_SUPPORTED_APEX_ATTACK' };
}

module.exports = {
  chooseApexAttack,
  evaluateApexAttackChoice,
  maxBenchPrizeValueWithCounters,
  maxPrizeValueForThreeTargets,
  rankApexChoices,
  remainingHp
};
