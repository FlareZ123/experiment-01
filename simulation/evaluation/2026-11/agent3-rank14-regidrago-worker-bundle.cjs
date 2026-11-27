'use strict';
/*
 * Agent3 rank14 source-bound V3 worker entrypoint, static CommonJS closure.
 * Generated from exact sources; do not edit this bundle directly.
 * agent43-regidrago-apex-choice.cjs 65b299d6d1eccc4dfaa1a8fafe777cbdc9a1511b
 * agent1-rank12-regidrago-opponent-policy-v2.cjs bfaee2205ea9d0c3b618948fe24ff81075d4ccda
 * agent3-rank32-regidrago-opponent-policy.cjs f5192e7ed66bbce1b5ffe531aedfb7bf31d57ea2
 * agent3-rank14-regidrago-opponent-policy.cjs 86a1afe73c632dfccb8ad0d388615d9a7679ff6c
 */
const __rank14Modules = Object.freeze({
"./agent43-regidrago-apex-choice.cjs": function(require, module, exports) {
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

},
"./agent1-rank12-regidrago-opponent-policy-v2.cjs": function(require, module, exports) {
'use strict';

/*
 * Rank-12 Regidrago opponent policy v2.
 *
 * This is a deterministic, actor-view-only prototype bound to the exact
 * rank-12 60-card source row and the fixed Hood Shield Shadow Rider v1
 * candidate. It reuses only the rank-agnostic Apex Dragon attack evaluator.
 * It is not a native-game or competitive-strength claim.
 */

const { evaluateApexAttackChoice } = require('./agent43-regidrago-apex-choice.cjs');

const POLICY_VERSION = 'agent1-rank12-regidrago-opponent-v2';
const SOURCE_RANK = 12;
const SOURCE_FINGERPRINT_SHA256 = 'f176d6831f91a470ec4d3ef1e18636da8e4178b294c2978bb64cc371c37d3059';
const CANDIDATE_FINGERPRINT_SHA256 = '1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4';
const SOURCE_LIST_BLOB_SHA1 = 'ae773f6201d7aa69d31914dbfee66f3fba692200';
const CANDIDATE_LIST_BLOB_SHA1 = '24ace2d6feb9ce5d9056bcf271827cfe31b7357b';
const ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const WORKER_PROTOCOL_BLOB_SHA1 = 'd51ea95c457d61b50a9ee114d342eb17f4350451';

const PRINT = Object.freeze({
  regidragoV: /^Regidrago V SIT 135\b/i,
  regidragoVstar: /^Regidrago VSTAR SIT 136\b/i,
  dialga: /^Dialga-GX UPR 100\b/i,
  dragapult: /^Dragapult ex TWM 130\b/i,
  noivern: /^Noivern ex PAL 153\b/i,
  koraidon: /^Koraidon ex TEF 120\b/i,
  kyurem: /^Kyurem SFA 47\b/i,
  dedenne: /^Dedenne-GX UNB 57\b/i,
  crobat: /^Crobat V DAA 104\b/i,
  latias: /^Latias ex SSP 76\b/i,
  tapuLele: /^Tapu Lele-GX GRI 60\b/i,
  marshadow: /^Marshadow UNB 81\b/i,
  fezandipiti: /^Fezandipiti ex ASC 142\b/i,
  budew: /^Budew ASC 16\b/i,
  professorSycamore: /^Professor Sycamore BKP 107\b/i,
  raihan: /^Raihan EVS 152\b/i,
  guzma: /^Guzma BUS 115\b/i,
  marnie: /^Marnie SSH 169\b/i,
  crispin: /^Crispin SCR 133\b/i,
  iono: /^Iono PAL 185\b/i,
  treasure: /^Mysterious Treasure FLI 113\b/i,
  quickBall: /^Quick Ball FST 237\b/i,
  vsSeeker: /^VS Seeker PHF 109\b/i,
  ultraBall: /^Ultra Ball MEG 131\b/i,
  heavyBall: /^Hisuian Heavy Ball ASR 146\b/i,
  superRod: /^Super Rod PAL 188\b/i,
  echoingHorn: /^Echoing Horn CRE 136\b/i,
  megatonBlower: /^Megaton Blower SSP 182\b/i,
  counterCatcher: /^Counter Catcher PAR 160\b/i,
  muscleBand: /^Muscle Band XY 121\b/i,
  pathToPeak: /^Path to the Peak CRE 148\b/i,
  parallelCity: /^Parallel City BKT 145\b/i,
  doubleDragon: /^Double Dragon Energy ROS 97\b/i,
  grassEnergy: /^Grass Energy MEE 9\b/i,
  fireEnergy: /^Fire Energy MEE 10\b/i
});

const EXECUTABLE = new Set([
  'play-card', 'attack', 'retreat', 'use-ability', 'use-stadium', 'pass'
]);

function list(value) {
  return Array.isArray(value) ? value : [];
}

function printingValue(value) {
  if (typeof value === 'string') return value;
  if (typeof value?.printing === 'string') return value.printing;
  if (typeof value?.fullName === 'string') return value.fullName;
  if (typeof value?.publicMetadata?.cardPrinting === 'string') return value.publicMetadata.cardPrinting;
  if (typeof value?.publicMetadata?.targetPrinting === 'string') return value.publicMetadata.targetPrinting;
  return '';
}

function matches(value, pattern) {
  return pattern.test(printingValue(value));
}

function boardSlots(player) {
  return [player?.active, ...list(player?.bench)].filter(Boolean);
}

function boardHas(player, pattern) {
  return boardSlots(player).some(pokemon => matches(pokemon, pattern));
}

function boardCount(player, pattern) {
  return boardSlots(player).filter(pokemon => matches(pokemon, pattern)).length;
}

function hasBenchSpace(player) {
  const bench = list(player?.bench);
  return bench.length < 5 || bench.some(slot => !slot);
}

function discardHas(player, pattern) {
  return list(player?.discard).some(card => matches(card, pattern));
}

function handHas(hand, pattern) {
  return list(hand).some(card => matches(card, pattern));
}

function handCount(hand, pattern) {
  return list(hand).filter(card => matches(card, pattern)).length;
}

function handSize(observation) {
  return list(observation?.ownHand).length;
}

function remainingHp(pokemon) {
  if (!pokemon || !Number.isFinite(pokemon.hp) || !Number.isFinite(pokemon.damage)) return -1;
  return pokemon.hp - pokemon.damage;
}

function metadata(item) {
  return item?.publicMetadata ?? {};
}

function actionPrinting(item) {
  return item?.actorPrinting ?? item?.targetPrinting ?? item?.label ?? '';
}

function sourceText(prompt) {
  const source = prompt?.source ?? {};
  return [
    source.sourcePrinting, source.effectName, source.copiedSourcePrinting,
    source.copiedAttackName, prompt?.description,
    prompt?.publicMetadata?.sourceEffect, prompt?.publicMetadata?.effectName
  ].filter(Boolean).join(' ').toLowerCase();
}

function ownEnergyCount(observation) {
  return boardSlots(observation?.ownPublic)
    .reduce((sum, pokemon) => sum + list(pokemon.energies).length, 0);
}

function supporterInHand(observation) {
  return list(observation?.ownHand).some(card =>
    /Supporter/i.test(printingValue(card)) ||
    /Professor Sycamore|Raihan|Guzma|Marnie|Crispin|Iono/i.test(printingValue(card)));
}

function priorOpponentTurnKO(request) {
  return request?.publicEventReceipt?.priorOpponentTurnKO?.any === true;
}

function opponentRuleBoxCount(observation) {
  return boardSlots(observation?.opponentPublic).filter(pokemon => {
    const subtypes = list(pokemon?.printed?.subtypes).map(String);
    return subtypes.some(value => ['V', 'VMAX', 'VSTAR', 'GX', 'ex', 'TAG TEAM', 'V-UNION'].includes(value));
  }).length;
}

function hasOpponentSpecialEnergy(observation) {
  const opponent = observation?.opponentPublic ?? {};
  return boardSlots(opponent).some(pokemon =>
    list(pokemon.energies).some(energy =>
      /Special Energy|Double Colorless|Double Dragon|Jet Energy|Speed Lightning|Capture Energy|Aurora Energy/i.test(printingValue(energy))));
}

function hasOpponentToolsOrSpecialEnergy(observation) {
  const opponent = observation?.opponentPublic ?? {};
  const hasTools = boardSlots(opponent).some(pokemon => list(pokemon.tools).length > 0);
  return hasTools || hasOpponentSpecialEnergy(observation);
}

function opponentHasStadium(observation) {
  return list(observation?.opponentPublic?.stadium).length > 0;
}

function candidateTargetPriority(pokemon) {
  const value = printingValue(pokemon);
  const hp = remainingHp(pokemon);
  if (/Shadow Rider Calyrex VMAX CRE 75|Trevenant & Dusknoir-GX SMP (?:SM)?217/i.test(value)) return 260 + Math.max(0, 200 - hp) / 20;
  if (/Lillie's Clefairy ex JTG 56|Tapu Lele-GX GRI 60|Dialga-GX UPR 100|Latias ex SSP 76/i.test(value)) return 220 + Math.max(0, 180 - hp) / 20;
  if (/Mimikyu GRI 58|Marshadow UNB 81|Radiant Eternatus CRZ 105/i.test(value)) return 120 + Math.max(0, 100 - hp) / 20;
  const subtypes = list(pokemon?.printed?.subtypes).map(String);
  const prizeValue = subtypes.some(x => ['VMAX', 'TAG TEAM', 'V-UNION'].includes(x)) ? 3 :
    (subtypes.some(x => ['V', 'VSTAR', 'GX', 'ex'].includes(x)) ? 2 : 1);
  return 80 + prizeValue * 35 + (hp > 0 ? Math.max(0, 180 - hp) / 20 : 0);
}

function ownSwitchPriority(pokemon) {
  if (matches(pokemon, PRINT.regidragoVstar)) return 240;
  if (matches(pokemon, PRINT.regidragoV) && list(pokemon.energies).length > 0) return 210;
  if (matches(pokemon, PRINT.latias)) return 80;
  if (matches(pokemon, PRINT.budew)) return 40;
  return 20 + Math.max(0, 180 - remainingHp(pokemon)) / 20;
}

function targetPokemonFromChoice(choice, observation) {
  const meta = choice?.publicMetadata ?? {};
  const owner = meta.ownerSeat;
  const zone = meta.targetZone ?? meta.sourceZone;
  const index = Number.isSafeInteger(meta.selectionIndex) ? meta.selectionIndex :
    (Number.isSafeInteger(meta.benchIndex) ? meta.benchIndex : meta.slotIndex);
  const player = owner === 'actor' ? observation?.ownPublic :
    (owner === 'opponent' ? observation?.opponentPublic : null);
  if (player && zone === 'active') return player.active ?? null;
  if (player && zone === 'bench' && Number.isSafeInteger(index)) return list(player.bench)[index] ?? null;
  return {
    printing: choice?.printing ?? choice?.label ?? '',
    hp: choice?.hp,
    damage: choice?.damage,
    printed: choice?.printed
  };
}

function gustChoicePriority(choice, observation) {
  const owner = choice?.publicMetadata?.ownerSeat;
  if (owner === 'actor') return ownSwitchPriority(targetPokemonFromChoice(choice, observation));
  return candidateTargetPriority(targetPokemonFromChoice(choice, observation));
}

function rankChoices(choices, score, limit) {
  return list(choices).map((choice, index) => ({ choice, index, score: score(choice) }))
    .filter(row => row.score > 0 && typeof row.choice?.token === 'string')
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, Number.isSafeInteger(limit) ? limit : list(choices).length);
}

function selectOne(choices, score, reasonCode) {
  const best = rankChoices(choices, score, 1)[0];
  return best ? { kind: 'select-choice', token: best.choice.token } :
    { kind: 'abstain', reasonCode };
}

function selectMany(choices, score, minimum, maximum, reasonCode) {
  const selected = rankChoices(choices, score, maximum).map(row => row.choice.token);
  if (selected.length >= minimum && selected.length > 0) {
    return { kind: 'select-choices', tokens: selected };
  }
  if (minimum === 0) {
    const empty = list(choices).find(choice => choice.kind === 'empty-selection' && typeof choice.token === 'string');
    if (empty) return { kind: 'select-choice', token: empty.token };
  }
  return { kind: 'abstain', reasonCode };
}

function hasSupporterInDiscard(observation) {
  return list(observation?.ownPublic?.discard).some(card =>
    /Professor Sycamore|Raihan|Guzma|Marnie|Crispin|Iono/i.test(printingValue(card)));
}

function discardCostPriority(choice, observation) {
  const value = printingValue(choice);
  const own = observation?.ownPublic ?? {};
  if (PRINT.noivern.test(value) && !discardHas(own, PRINT.noivern)) return 220;
  if (PRINT.dialga.test(value) && !discardHas(own, PRINT.dialga)) return 205;
  if (PRINT.koraidon.test(value) && !discardHas(own, PRINT.koraidon)) return 185;
  if (PRINT.kyurem.test(value) && !discardHas(own, PRINT.kyurem)) return 175;
  if (PRINT.dragapult.test(value)) return 0;
  if (PRINT.regidragoVstar.test(value)) return boardHas(own, PRINT.regidragoVstar) ? 65 : 0;
  if (PRINT.regidragoV.test(value)) return boardCount(own, PRINT.regidragoV) >= 2 ? 65 : 0;
  if (PRINT.budew.test(value)) return boardHas(own, PRINT.budew) ? 75 : 0;
  if (PRINT.doubleDragon.test(value)) return ownEnergyCount(observation) >= 5 ? 55 : 0;
  if (PRINT.grassEnergy.test(value) || PRINT.fireEnergy.test(value)) return ownEnergyCount(observation) >= 5 ? 65 : 0;
  if (PRINT.guzma.test(value) || PRINT.raihan.test(value)) {
    return discardHas(own, PRINT.guzma) || discardHas(own, PRINT.raihan) ? 85 : 0;
  }
  if (PRINT.professorSycamore.test(value) || PRINT.marnie.test(value) || PRINT.iono.test(value)) {
    return hasSupporterInDiscard(observation) ? 60 : 0;
  }
  return 10;
}

function searchPriority(choice, observation, request) {
  const value = printingValue(choice);
  const own = observation?.ownPublic ?? {};
  if (PRINT.regidragoVstar.test(value) && boardHas(own, PRINT.regidragoV) && !boardHas(own, PRINT.regidragoVstar)) return 250;
  if (PRINT.regidragoV.test(value) && !boardHas(own, PRINT.regidragoV)) return 235;
  if (PRINT.budew.test(value) && !boardHas(own, PRINT.budew)) return 205;
  if ((PRINT.dedenne.test(value) || PRINT.crobat.test(value)) && handSize(observation) <= 3 && hasBenchSpace(own)) return 170;
  if (PRINT.tapuLele.test(value) && !supporterInHand(observation) && hasBenchSpace(own)) return 160;
  if (PRINT.fezandipiti.test(value) && priorOpponentTurnKO(request) && handSize(observation) <= 4 && hasBenchSpace(own)) return 150;
  if (PRINT.latias.test(value) && !boardHas(own, PRINT.latias) && hasBenchSpace(own)) return 135;
  if (PRINT.dialga.test(value) && !discardHas(own, PRINT.dialga)) return 110;
  if (PRINT.noivern.test(value) && !discardHas(own, PRINT.noivern)) return 105;
  if (PRINT.koraidon.test(value) && !discardHas(own, PRINT.koraidon)) return 100;
  if (PRINT.kyurem.test(value) && !discardHas(own, PRINT.kyurem)) return 95;
  return 10;
}

function legacyStarPriority(choice, observation) {
  const value = printingValue(choice);
  if (PRINT.doubleDragon.test(value)) return 220;
  if (PRINT.grassEnergy.test(value) || PRINT.fireEnergy.test(value)) return ownEnergyCount(observation) < 4 ? 205 : 145;
  if (PRINT.regidragoVstar.test(value) || PRINT.regidragoV.test(value)) return boardHas(observation?.ownPublic, PRINT.regidragoVstar) ? 120 : 175;
  if (PRINT.professorSycamore.test(value) || PRINT.raihan.test(value) || PRINT.guzma.test(value) ||
      PRINT.crispin.test(value) || PRINT.iono.test(value) || PRINT.marnie.test(value)) return 150;
  if (PRINT.noivern.test(value) || PRINT.dialga.test(value) || PRINT.koraidon.test(value) || PRINT.kyurem.test(value)) return 0;
  return 35;
}

function superRodPriority(choice, observation) {
  const value = printingValue(choice);
  if (PRINT.regidragoVstar.test(value) && !boardHas(observation?.ownPublic, PRINT.regidragoVstar)) return 220;
  if (PRINT.regidragoV.test(value) && !boardHas(observation?.ownPublic, PRINT.regidragoV)) return 205;
  if (PRINT.budew.test(value) && !boardHas(observation?.ownPublic, PRINT.budew)) return 180;
  if (PRINT.grassEnergy.test(value) || PRINT.fireEnergy.test(value)) return ownEnergyCount(observation) < 4 ? 170 : 110;
  if (PRINT.noivern.test(value) || PRINT.dialga.test(value) || PRINT.koraidon.test(value) || PRINT.kyurem.test(value) ||
      PRINT.dragapult.test(value)) return 0;
  return 10;
}

function abilityUsedThisTurn(request, pokemon, abilityName) {
  const receipt = request?.publicEventReceipt;
  if (!receipt || !pokemon) return false;
  const rows = [receipt.ownerActive, ...list(receipt.ownerBench)].filter(Boolean);
  const row = rows.find(item => item.printing === pokemon.printing);
  const use = list(row?.knownAbilityUse).find(item => item.name === abilityName);
  return use?.usedThisTurn === true;
}

function pathToPeakSafe(request) {
  const own = request?.observation?.ownPublic ?? {};
  if (own.publicTurnRestrictions?.vstarUsed !== true) return false;
  for (const pokemon of boardSlots(own)) {
    const abilities = list(pokemon.abilityDetails).map(item => item.name);
    for (const abilityName of abilities) {
      if (abilityName === 'Legacy Star') continue;
      if (abilityName === 'Skyliner' || abilityName === 'Resetting Hole') continue;
      if (['Dedechange', 'Dark Asset', 'Flip the Script', 'Wonder Tag'].includes(abilityName) &&
          !abilityUsedThisTurn(request, pokemon, abilityName)) return false;
    }
  }
  return true;
}

function opponentTargetIsRuleBox(pokemon) {
  const subtypes = list(pokemon?.printed?.subtypes).map(String);
  return subtypes.some(value => ['V', 'VMAX', 'VSTAR', 'GX', 'ex', 'TAG TEAM', 'V-UNION'].includes(value));
}

function scoreAttack(item, observation) {
  const name = item?.attackName ?? metadata(item).sourceAttack ?? item?.label ?? '';
  const own = observation?.ownPublic ?? {};
  const opponent = observation?.opponentPublic ?? {};
  if (name === 'Apex Dragon') {
    const payloads = [PRINT.noivern, PRINT.dialga, PRINT.koraidon, PRINT.kyurem]
      .filter(pattern => discardHas(own, pattern)).length;
    return payloads > 0 ? 225 : 0;
  }
  if (name === 'Itchy Pollen') return Number(opponent.handCount ?? 0) > 0 ? 220 : 185;
  if (name === 'Dragon Laser') {
    const lowBench = list(opponent.bench).some(pokemon => {
      const hp = remainingHp(pokemon);
      return hp > 0 && hp <= 30;
    });
    return lowBench ? 145 : 95;
  }
  if (name === 'Overclock') return handSize(observation) < 6 ? 100 : 20;
  if (name === 'Celestial Roar') {
    return Number(own.deckCount ?? 0) >= 3 && ownEnergyCount(observation) < 3 ? 90 : 10;
  }
  return 0;
}

function chooseRank12ApexAttack(choices, observation) {
  const ranked = list(choices).map((choice, index) => {
    const name = choice?.publicMetadata?.sourceAttack ?? choice?.attackName ?? choice?.label ?? '';
    if (choice?.publicMetadata?.eligible === false) {
      return { choice, index, score: -1 };
    }
    if (name === 'Dominating Echo') {
      const score = opponentHasStadium(observation) || hasOpponentSpecialEnergy(observation) ? 260 : 185;
      return { choice, index, score };
    }
    if (name === 'Covert Flight') {
      const active = observation?.opponentPublic?.active;
      const isBasic = list(active?.printed?.subtypes).includes('Basic');
      return { choice, index, score: isBasic ? 150 : 45 };
    }
    if (name === 'Phantom Dive') {
      return { choice, index, score: -1 };
    }
    const evaluated = evaluateApexAttackChoice(choice, observation);
    return { choice, index, score: Number(evaluated?.score ?? -1) };
  }).filter(row => typeof row.choice?.token === 'string' && row.choice.token.length > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const best = ranked.find(row => row.score > 0);
  return best ? { kind: 'select-choice', token: best.choice.token } :
    { kind: 'abstain', reasonCode: 'NO_SUPPORTED_RANK12_APEX_ATTACK' };
}

function scoreAction(item, request) {
  const observation = request.observation;
  const own = observation?.ownPublic ?? {};
  const opponent = observation?.opponentPublic ?? {};
  const printing = actionPrinting(item);
  const hand = handSize(observation);
  const ownBench = list(own.bench).filter(Boolean);
  const opponentBench = list(opponent.bench).filter(Boolean);
  const priorKO = priorOpponentTurnKO(request);
  const active = own.active;

  if (item.kind === 'attack') return scoreAttack(item, observation);
  if (item.kind === 'pass') return 0;

  if (item.kind === 'retreat') {
    if ((matches(active, PRINT.dedenne) || matches(active, PRINT.crobat) ||
         matches(active, PRINT.tapuLele) || matches(active, PRINT.fezandipiti) ||
         matches(active, PRINT.budew) || matches(active, PRINT.marshadow)) &&
        (boardHas(own, PRINT.regidragoVstar) || boardHas(own, PRINT.regidragoV))) {
      return boardHas(own, PRINT.latias) ? 220 : 145;
    }
    return 0;
  }

  if (item.kind === 'use-ability') {
    const effect = metadata(item).abilityName ?? item.label ?? '';
    if (/Legacy Star/i.test(effect)) return own.publicTurnRestrictions?.vstarUsed === false ? 240 : 0;
    if (/Flip the Script/i.test(effect)) return priorKO && hand <= 5 ? 225 : 0;
    if (/Dedechange|Dark Asset/i.test(effect)) return hand <= 3 ? 185 : 0;
    if (/Wonder Tag/i.test(effect)) return !supporterInHand(observation) ? 170 : 0;
    if (/Resetting Hole/i.test(effect)) {
      return opponentHasStadium(observation) && list(own.stadium).length === 0 ? 150 : 0;
    }
    return 0;
  }

  if (item.kind === 'use-stadium') {
    if (matches(printing, PRINT.parallelCity)) return opponentBench.length >= 4 ? 135 : 0;
    if (matches(printing, PRINT.pathToPeak)) {
      return pathToPeakSafe(request) && opponentRuleBoxCount(observation) >= 2 ? 185 : 0;
    }
    return 0;
  }

  if (item.kind !== 'play-card') return 0;

  if (matches(printing, PRINT.regidragoV)) return !boardHas(own, PRINT.regidragoV) && hasBenchSpace(own) ? 220 : 0;
  if (matches(printing, PRINT.regidragoVstar)) return boardHas(own, PRINT.regidragoV) && !boardHas(own, PRINT.regidragoVstar) ? 245 : 0;
  if (matches(printing, PRINT.budew)) return !boardHas(own, PRINT.budew) && hasBenchSpace(own) ? 205 : 0;
  if (matches(printing, PRINT.dedenne) || matches(printing, PRINT.crobat)) return hand <= 3 && hasBenchSpace(own) ? 170 : 25;
  if (matches(printing, PRINT.fezandipiti)) return priorKO && hand <= 4 && hasBenchSpace(own) ? 160 : 30;
  if (matches(printing, PRINT.tapuLele)) return !supporterInHand(observation) && hasBenchSpace(own) ? 155 : 30;
  if (matches(printing, PRINT.latias)) return !boardHas(own, PRINT.latias) && hasBenchSpace(own) ? 135 : 20;
  if (matches(printing, PRINT.marshadow)) return opponentHasStadium(observation) && list(own.stadium).length === 0 && hasBenchSpace(own) ? 145 : 25;
  if (matches(printing, PRINT.dialga)) return !boardHas(own, PRINT.dialga) && hasBenchSpace(own) ? 95 : 20;

  if (matches(printing, PRINT.megatonBlower)) {
    return hasOpponentToolsOrSpecialEnergy(observation) || opponentHasStadium(observation) ? 235 : 0;
  }
  if (matches(printing, PRINT.echoingHorn)) {
    const valuableBasic = list(opponent.discard).some(card =>
      /Shadow Rider Calyrex V CRE 74|Dialga-GX UPR 100|Tapu Lele-GX GRI 60|Latias ex SSP 76|Trevenant & Dusknoir-GX SMP SM217/i.test(printingValue(card)));
    return valuableBasic && hasBenchSpace(own) ? 150 : 0;
  }
  if (matches(printing, PRINT.counterCatcher)) {
    return Number(own.prizeCount ?? 6) > Number(opponent.prizeCount ?? 6) && opponentBench.length > 0 ? 225 : 0;
  }
  if (matches(printing, PRINT.guzma)) return opponentBench.length > 0 ? 195 : 0;
  if (matches(printing, PRINT.pathToPeak)) {
    return pathToPeakSafe(request) && opponentRuleBoxCount(observation) >= 2 ? 185 : 0;
  }
  if (matches(printing, PRINT.parallelCity)) return opponentBench.length >= 4 ? 135 : 0;
  if (matches(printing, PRINT.muscleBand)) {
    return (matches(active, PRINT.regidragoVstar) || matches(active, PRINT.regidragoV)) &&
      !list(active.tools).some(tool => matches(tool, PRINT.muscleBand)) ? 130 : 25;
  }
  if (matches(printing, PRINT.treasure)) return !boardHas(own, PRINT.regidragoVstar) || !boardHas(own, PRINT.regidragoV) ? 155 : 80;
  if (matches(printing, PRINT.quickBall)) return !boardHas(own, PRINT.regidragoV) || !boardHas(own, PRINT.budew) ? 150 : 55;
  if (matches(printing, PRINT.ultraBall)) return hand >= 3 && (!boardHas(own, PRINT.regidragoVstar) || !boardHas(own, PRINT.regidragoV)) ? 125 : 45;
  if (matches(printing, PRINT.crispin)) return ownEnergyCount(observation) < 3 ? 150 : 55;
  if (matches(printing, PRINT.raihan)) return priorKO && list(own.discard).some(card => /Grass Energy|Fire Energy/i.test(printingValue(card))) ? 180 : 30;
  if (matches(printing, PRINT.professorSycamore) || matches(printing, PRINT.iono) || matches(printing, PRINT.marnie)) return hand <= 4 ? 145 : 35;
  if (matches(printing, PRINT.vsSeeker)) return hasSupporterInDiscard(observation) ? 120 : 30;
  if (matches(printing, PRINT.superRod)) {
    return list(own.discard).some(card => /Regidrago V|Regidrago VSTAR|Grass Energy|Fire Energy|Budew/i.test(printingValue(card))) ? 110 : 20;
  }
  if (matches(printing, PRINT.heavyBall)) {
    return list(own.prizeSlots).some(slot => typeof slot.printing === 'string') ? 115 : 0;
  }
  return 0;
}

function promptDecision(request) {
  const prompt = request.prompt;
  const choices = list(prompt?.choices);
  const meta = prompt?.publicMetadata ?? {};
  const context = sourceText(prompt);
  const observation = request.observation;
  const own = observation?.ownPublic ?? {};
  const minimum = Number.isSafeInteger(meta.minimumCount) ? meta.minimumCount : 1;
  const maximum = Number.isSafeInteger(meta.maximumCount) ? meta.maximumCount :
    (Number.isSafeInteger(meta.count) ? meta.count : minimum);

  if (prompt.promptType === 'PutDamagePrompt') {
    return { kind: 'abstain', reasonCode: 'RANK12_PHANTOM_DIVE_HOST_PROJECTION_BLOCKED' };
  }

  if (prompt.promptType === 'ChooseAttackPrompt' && /apex dragon/i.test(context)) {
    return chooseRank12ApexAttack(choices, observation);
  }

  if (meta.selectionType === 'card-combination' || meta.selectionType === 'pokemon' ||
      meta.selectionType === 'card-order' || meta.selectionType === 'energy-payment' ||
      meta.selectionType === 'prize-slots') {
    if (/mysterious treasure|quick ball|ultra ball/i.test(context) && /discard/i.test(context)) {
      return selectMany(choices, choice => discardCostPriority(choice, observation), minimum, maximum,
        'NO_RANK12_SAFE_DISCARD');
    }
    if (/raihan/i.test(context)) {
      return selectMany(choices, choice => {
        const value = printingValue(choice);
        if (PRINT.regidragoVstar.test(value) && boardHas(own, PRINT.regidragoV)) return 240;
        if (PRINT.regidragoV.test(value) && !boardHas(own, PRINT.regidragoV)) return 230;
        if (PRINT.doubleDragon.test(value)) return 190;
        if (PRINT.treasure.test(value) || PRINT.quickBall.test(value)) return 160;
        if (PRINT.noivern.test(value) && !discardHas(own, PRINT.noivern)) return 130;
        return 15;
      }, minimum, maximum, 'NO_RANK12_RAIHAN_TARGET');
    }
    if (/crispin/i.test(context)) {
      return selectMany(choices, choice => {
        const value = printingValue(choice);
        if (PRINT.grassEnergy.test(value)) return 190;
        if (PRINT.fireEnergy.test(value)) return 180;
        return 0;
      }, minimum, maximum, 'NO_RANK12_CRISPIN_ENERGY');
    }
    if (/vs seeker/i.test(context)) {
      return selectMany(choices, choice => {
        const value = printingValue(choice);
        if (PRINT.guzma.test(value)) return 230;
        if (PRINT.raihan.test(value) && priorOpponentTurnKO(request)) return 220;
        if (PRINT.professorSycamore.test(value) || PRINT.iono.test(value) || PRINT.marnie.test(value)) return 170;
        if (PRINT.crispin.test(value)) return 150;
        return 10;
      }, minimum, maximum, 'NO_RANK12_SUPPORTER_RECOVERY');
    }
    if (/super rod/i.test(context)) {
      return selectMany(choices, choice => superRodPriority(choice, observation), minimum, maximum,
        'NO_RANK12_SUPER_ROD_RECOVERY');
    }
    if (/legacy star/i.test(context)) {
      return selectMany(choices, choice => legacyStarPriority(choice, observation), minimum, maximum,
        'NO_RANK12_LEGACY_STAR_RECOVERY');
    }
    if (/counter catcher|guzma/i.test(context) && meta.selectionType === 'pokemon') {
      return selectMany(choices, choice => gustChoicePriority(choice, observation), minimum, maximum,
        'NO_RANK12_GUST_TARGET');
    }
    if (/echoing horn/i.test(context) && meta.selectionType === 'pokemon') {
      return selectMany(choices, choice => candidateTargetPriority(targetPokemonFromChoice(choice, observation)),
        minimum, maximum, 'NO_RANK12_ECHOING_HORN_TARGET');
    }
    if (/hisuian heavy ball/i.test(context) && meta.selectionType === 'prize-slots') {
      return selectMany(choices, choice => {
        const value = printingValue(choice);
        if (!value || /Prize slot|face-down|unknown/i.test(value)) return 0;
        if (/Regidrago V SIT 135|Budew ASC 16|Dialga-GX UPR 100|Dedenne-GX UNB 57|Crobat V DAA 104|Tapu Lele-GX GRI 60|Fezandipiti ex ASC 142|Latias ex SSP 76/i.test(value)) return 220;
        return 50;
      }, minimum, maximum, 'RANK12_PRIZE_IDENTITY_NOT_VISIBLE');
    }
    if (/parallel city/i.test(context)) {
      return selectMany(choices, choice => /opponent.*bench|opponent.*three|reduce.*opponent/i.test(choice.label ?? '') ? 220 : 0,
        minimum, maximum, 'NO_RANK12_PARALLEL_CITY_MODE');
    }
    if (/mysterious treasure|quick ball|ultra ball|wonder tag|tapu lele|search/i.test(context)) {
      return selectMany(choices, choice => searchPriority(choice, observation, request), minimum, maximum,
        'NO_RANK12_SEARCH_TARGET');
    }
    if (meta.selectionType === 'energy-payment') {
      return selectMany(choices, choice => {
        const value = printingValue(choice);
        if (PRINT.doubleDragon.test(value)) return 210;
        if (PRINT.grassEnergy.test(value) || PRINT.fireEnergy.test(value)) return 130;
        return 20;
      }, minimum, maximum, 'NO_RANK12_ENERGY_PAYMENT');
    }
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_RANK12_MULTI_SELECT_SOURCE' };
  }

  if (prompt.promptType === 'ConfirmPrompt' || prompt.promptType === 'SelectPrompt' ||
      prompt.promptType === 'SelectOptionPrompt') {
    if (/parallel city/i.test(context)) {
      return selectOne(choices, choice => /opponent.*bench|opponent.*three|reduce.*opponent/i.test(choice.label ?? '') ? 220 : 0,
        'NO_RANK12_PARALLEL_CITY_MODE');
    }
    const yes = choices.find(choice => /^(yes|true|confirm)$/i.test(choice.label ?? ''));
    const no = choices.find(choice => /^(no|false|decline|cancel)$/i.test(choice.label ?? ''));
    if (/legacy star/i.test(context) && yes && observation.ownPublic.publicTurnRestrictions?.vstarUsed === false) {
      return { kind: 'select-choice', token: yes.token };
    }
    if (/flip the script/i.test(context) && yes && priorOpponentTurnKO(request) && handSize(observation) <= 5) {
      return { kind: 'select-choice', token: yes.token };
    }
    if (/dedechange|dark asset/i.test(context) && yes && handSize(observation) <= 3) {
      return { kind: 'select-choice', token: yes.token };
    }
    if (/wonder tag/i.test(context) && yes && !supporterInHand(observation)) {
      return { kind: 'select-choice', token: yes.token };
    }
    if (/resetting hole/i.test(context) && yes && opponentHasStadium(observation) && list(own.stadium).length === 0) {
      return { kind: 'select-choice', token: yes.token };
    }
    if (no) return { kind: 'select-choice', token: no.token };
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_RANK12_OPTIONAL_PROMPT' };
  }

  return { kind: 'abstain', reasonCode: 'UNSUPPORTED_RANK12_PROMPT_TYPE' };
}

function bestAction(request) {
  const items = list(request.actionFrontier?.items).filter(item => EXECUTABLE.has(item.kind));
  if (items.length === 0) return { kind: 'abstain', reasonCode: 'NO_RANK12_EXECUTABLE_ACTION' };
  const ranked = items.map((item, index) => ({
    item, index, score: scoreAction(item, request)
  })).sort((a, b) => b.score - a.score || a.index - b.index);
  if (ranked[0]?.score > 0) return { kind: 'select-action', token: ranked[0].item.token };
  const pass = items.find(item => item.kind === 'pass');
  return pass ? { kind: 'select-action', token: pass.token } :
    { kind: 'abstain', reasonCode: 'NO_SUPPORTED_RANK12_ACTION' };
}

function createPolicy({ role, seat, policyVersion, config, rng }) {
  if (role !== 'opponent' || (seat !== 0 && seat !== 1) ||
      policyVersion !== POLICY_VERSION || !config ||
      typeof config !== 'object' || Array.isArray(config) ||
      Object.keys(config).length !== 0 || typeof rng !== 'function') {
    throw new Error('AGENT1_RANK12_POLICY_INIT_MISMATCH');
  }
  return Object.freeze({
    decide(request) {
      if (!request || request.role !== 'opponent' || request.seat !== seat ||
          request.observation?.actorSeat !== seat) {
        return { kind: 'abstain', reasonCode: 'ROLE_SEAT_BINDING_MISMATCH' };
      }
      if (request.prompt !== null && request.prompt !== undefined) return promptDecision(request);
      return bestAction(request);
    }
  });
}

module.exports = {
  POLICY_VERSION,
  SOURCE_RANK,
  SOURCE_FINGERPRINT_SHA256,
  CANDIDATE_FINGERPRINT_SHA256,
  SOURCE_LIST_BLOB_SHA1,
  CANDIDATE_LIST_BLOB_SHA1,
  ENGINE_PIN,
  WORKER_PROTOCOL_BLOB_SHA1,
  createPolicy,
  scoreAction,
  scoreAttack,
  promptDecision,
  bestAction
};

},
"./agent3-rank32-regidrago-opponent-policy.cjs": function(require, module, exports) {
'use strict';

/*
 * Aichi rank-32 original-source Regidrago policy prototype.
 * Source-specific overrides for the rank-12 family worker. In particular,
 * this sixty has Battle Compressor, Goodra VSTAR and Mega Dragonite ex, but
 * lacks Koraidon, Path to the Peak and Echoing Horn. Only actor-visible
 * observations, native-offered action tokens and prompt choices are used.
 * Development only: no claim of complete-game competence or field wins.
 */

const family = require('./agent1-rank12-regidrago-opponent-policy-v2.cjs');
const { evaluateApexAttackChoice } = require('./agent43-regidrago-apex-choice.cjs');

const POLICY_VERSION = 'agent3-rank32-regidrago-opponent-v1';
const SOURCE_RANK = 32;
const SOURCE_LIST_BLOB_SHA1 = 'ae773f6201d7aa69d31914dbfee66f3fba692200';
const ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const EXECUTABLE = new Set(['play-card', 'attack', 'retreat', 'use-ability', 'use-stadium', 'pass']);
const DONOR = Object.freeze({
  dragonite: /^Mega Dragonite ex ASC 152\b/i,
  goodra: /^Hisuian Goodra VSTAR LOR 136\b/i,
  dialga: /^Dialga-GX UPR 100\b/i,
  noivern: /^Noivern ex PAL 153\b/i,
  kyurem: /^Kyurem SFA 47\b/i,
  dragapult: /^Dragapult ex TWM 130\b/i
});

function list(v) { return Array.isArray(v) ? v : []; }
function print(v) {
  if (typeof v === 'string') return v;
  return v?.printing ?? v?.actorPrinting ?? v?.targetPrinting ??
    v?.publicMetadata?.cardPrinting ?? v?.publicMetadata?.sourcePrinting ??
    v?.label ?? '';
}
function has(x, re) { return re.test(print(x)); }
function slots(p) { return [p?.active, ...list(p?.bench)].filter(Boolean); }
function countDonors(own) {
  return Object.entries(DONOR).filter(([name,re]) => name !== 'dragapult' &&
    list(own?.discard).some(card => has(card, re))).length;
}
function context(prompt) {
  const s = prompt?.source ?? {};
  return [s.sourcePrinting, s.effectName, s.sourceEffect, s.sourceAttack,
    s.copiedSourcePrinting, s.copiedAttackName, prompt?.description,
    prompt?.publicMetadata?.sourceEffect, prompt?.publicMetadata?.effectName]
    .filter(Boolean).join(' ').toLowerCase();
}
function nativeOwnerTarget(action, observation) {
  const meta=action?.publicMetadata ?? {};
  if (meta.targetSeat !== 'actor' || typeof action.targetPrinting !== 'string') return null;
  const target=meta.targetZone === 'active' ? observation?.ownPublic?.active :
    (meta.targetZone === 'bench' && Number.isSafeInteger(meta.targetIndex) ?
      list(observation?.ownPublic?.bench)[meta.targetIndex] : null);
  return target && print(target) === action.targetPrinting ? target : null;
}
function apexTypedDeficit(pokemon, observation) {
  const energies=list(pokemon?.energies);
  const basicsGrass=energies.filter(e=>/^Grass Energy\b/i.test(print(e))).length;
  const basicsFire=energies.filter(e=>/^Fire Energy\b/i.test(print(e))).length;
  const temple=list(observation?.opponentPublic?.stadium)
    .concat(list(observation?.ownPublic?.stadium))
    .some(s=>/^Temple of Sinnoh ASR 155\b/i.test(print(s)));
  const specialDde=temple?0:energies.filter(e=>/^Double Dragon Energy ROS 97\b/i.test(print(e))).length;
  return Math.max(0,Math.max(0,2-basicsGrass)+Math.max(0,1-basicsFire)-2*specialDde);
}
function scoreEnergyAttachment(action, observation) {
  const card=print(action);
  if (!/^(?:Grass Energy|Fire Energy|Double Dragon Energy)\b/i.test(card)) return null;
  const target=nativeOwnerTarget(action,observation);
  if (!target || !/^Regidrago V(?:STAR)? SIT 13[56]\b/i.test(print(target))) return 0;
  const own=observation?.ownPublic ?? {};
  const isVstar=/^Regidrago VSTAR SIT 136\b/i.test(print(target));
  if (!isVstar && slots(own).some(p=>/^Regidrago VSTAR SIT 136\b/i.test(print(p))))
    return 0;
  const before=apexTypedDeficit(target,observation);
  const after=apexTypedDeficit({...target,energies:[...list(target.energies),card]},observation);
  if (after >= before) return 0;
  // Regidrago requires Grass+Grass+Fire. DDE counts as two flexible typed
  // Energy only while Temple of Sinnoh is not suppressing its effect.
  const reduction=before-after;
  const isActive=target===own.active;
  return 220 + (reduction*20) + (isVstar?22:0) +
    (isActive?10:0) + (after===0?30:0);
}
function isSourceSupporter(value) {
  return /^(?:Guzma BUS 115|Crispin SCR 133|Raihan EVS 152|Professor Sycamore BKP 107|Lillie's Determination MEG 119|N FCO 105|Marnie SSH 169|Pokémon Ranger STS 104|Cynthia & Caitlin CEC 189)\b/i.test(print(value));
}
function cynthiaRecoverPriority(choice, observation) {
  const name=print(choice),own=observation?.ownPublic??{};
  if (!isSourceSupporter(choice) || /^Cynthia & Caitlin CEC 189\b/i.test(name)) return 0;
  if (/^Guzma BUS 115\b/i.test(name) &&
      slots(observation?.opponentPublic).length>1) return 240;
  if (/^Crispin SCR 133\b/i.test(name) &&
      slots(own).some(p=>/^Regidrago V(?:STAR)? SIT 13[56]\b/i.test(print(p)) &&
        apexTypedDeficit(p,observation)>0)) return 230;
  if (/^Raihan EVS 152\b/i.test(name)) return 175;
  if (/^Lillie's Determination MEG 119\b/i.test(name))
    return list(observation?.ownHand).length<=4?205:155;
  if (/^Professor Sycamore BKP 107\b/i.test(name))
    return list(observation?.ownHand).length<=3?190:135;
  if (/^Pokémon Ranger STS 104\b/i.test(name))
    return own.publicTurnRestrictions?.attackLockTurnsRemaining>0?225:90;
  if (/^N FCO 105\b/i.test(name)) return 150;
  if (/^Marnie SSH 169\b/i.test(name)) return 145;
  if (/^Guzma BUS 115\b/i.test(name)) return 130;
  return 30;
}
function legacyRecoverPriority(card, observation) {
  const value=print(card),own=observation?.ownPublic??{};
  const attackers=slots(own).filter(x=>
    /^Regidrago V(?:STAR)? SIT 13[56]\b/i.test(print(x)));
  const needsFunding=attackers.some(x=>apexTypedDeficit(x,observation)>0);
  const hasActiveVstar=attackers.some(x=>/^Regidrago VSTAR SIT 136\b/i.test(print(x)));
  const hasBasicV=attackers.some(x=>/^Regidrago V SIT 135\b/i.test(print(x)));
  if (/^Double Dragon Energy ROS 97\b/i.test(value))
    return needsFunding?290:175;
  if (/^Grass Energy|^Fire Energy/i.test(value))
    return needsFunding?220:75;
  if (/^Regidrago VSTAR SIT 136\b/i.test(value))
    return hasBasicV&&!hasActiveVstar?265:0;
  if (/^Regidrago V SIT 135\b/i.test(value))
    return attackers.length===0?255:40;
  if (/^Battle Compressor PHF 92\b/i.test(value))
    return countDonors(own)===0?245:95;
  if (/^Guzma BUS 115\b/i.test(value))
    return slots(observation?.opponentPublic).length>1?235:70;
  if (/^Crispin SCR 133\b/i.test(value))return needsFunding?205:75;
  if (/^Lillie's Determination MEG 119\b/i.test(value))
    return list(observation?.ownHand).length<=3?200:70;
  if (/^VS Seeker PHF 109\b/i.test(value))
    return list(own.discard).some(isSourceSupporter)?190:65;
  if (/^Megaton Blower SSP 182\b/i.test(value))return 150;
  if (/^Super Rod PAL 188\b/i.test(value))return attackers.length===0?160:50;
  if (/^Raihan EVS 152\b/i.test(value))return 140;
  if (isSourceSupporter(card))return 90;
  // Goodra, Dragonite and other copied attacks must stay in the discard.
  // Filler is not worth using an optional recovery slot.
  return 0;
}
function superRodRecoverPriority(card, observation) {
  const value=print(card),own=observation?.ownPublic??{};
  const attackers=slots(own).filter(p=>
    /^Regidrago V(?:STAR)? SIT 13[56]\b/i.test(print(p)));
  const vstar=attackers.some(p=>/^Regidrago VSTAR SIT 136\b/i.test(print(p)));
  const basic=attackers.some(p=>/^Regidrago V SIT 135\b/i.test(print(p)));
  if (/^(?:Hisuian Goodra VSTAR LOR 136|Mega Dragonite ex ASC 152|Dialga-GX UPR 100|Noivern ex PAL 153|Kyurem SFA 47|Dragapult ex TWM 130)\b/i.test(value))
    return 0; // Apex donors should stay discarded, not shuffled into deck.
  if (/^Regidrago VSTAR SIT 136\b/i.test(value))return basic&&!vstar?260:105;
  if (/^Regidrago V SIT 135\b/i.test(value))return attackers.length<2?250:110;
  if (/^Grass Energy|^Fire Energy/i.test(value)) {
    const needs=attackers.some(p=>apexTypedDeficit(p,observation)>0);
    return needs?210:125;
  }
  if (/^Budew ASC 16\b/i.test(value))
    return slots(own).some(p=>/^Budew ASC 16\b/i.test(print(p)))?0:150;
  if (/^Dedenne-GX UNB 57|^Tapu Lele-GX GRI 60\b/i.test(value))
    return slots(own).length<4?85:0;
  return 0;
}
function canUseLegacyStar(observation) {
  const own=observation?.ownPublic??{};
  const deckCount=own.deckCount;
  if(!Number.isSafeInteger(deckCount)||deckCount<8||
      own.publicTurnRestrictions?.vstarUsed!==false)return false;
  return slots(own).some(p=>/^Regidrago VSTAR SIT 136\b/i.test(print(p)));
}
function prizeValue(pokemon) {
  const types=list(pokemon?.printed?.subtypes);
  if(types.some(x=>['VMAX','TAG TEAM','V-UNION'].includes(x))) return 3;
  if(types.some(x=>['V','VSTAR','GX','ex'].includes(x))) return 2;
  return 1;
}
function remainingHP(pokemon) {
  return Number.isFinite(pokemon?.hp)&&Number.isFinite(pokemon?.damage)?
    Math.max(0,pokemon.hp-pokemon.damage):Infinity;
}
function strongestCopiedDamage(observation,target) {
  const own=observation?.ownPublic??{};
  if(countDonors(own)===0)return 0;
  const discard=list(own.discard);
  let best=0;
  if(discard.some(x=>DONOR.dragonite.test(print(x))))
    best=Math.max(best,estimatedDragonDamage(330,observation,target));
  if(discard.some(x=>DONOR.goodra.test(print(x))))
    best=Math.max(best,estimatedDragonDamage(200,observation,target));
  if(own.publicTurnRestrictions?.gxUsed===false &&
      discard.some(x=>DONOR.dialga.test(print(x))))
    best=Math.max(best,estimatedDragonDamage(150,observation,target));
  return best;
}
function canAttackNow(pokemon,observation) {
  return /^Regidrago VSTAR SIT 136\b/i.test(print(pokemon)) &&
    apexTypedDeficit(pokemon,observation)===0 &&
    countDonors(observation?.ownPublic??{})>0;
}
function gustTargetPriority(pokemon,observation,attacker) {
  if(!pokemon||!attacker||!canAttackNow(attacker,observation))return 0;
  const targetHP=remainingHP(pokemon);
  const damage=strongestCopiedDamage({...observation,
    ownPublic:{...observation.ownPublic,active:attacker}},pokemon);
  if(!Number.isFinite(targetHP)||targetHP<=0||targetHP>damage)return 0;
  const prizes=prizeValue(pokemon), ownPrizes=observation?.ownPublic?.prizeCount;
  return (Number.isSafeInteger(ownPrizes)&&prizes>=ownPrizes?400:260)+prizes*12;
}
function tacticalGustScore(action,observation) {
  const own=observation?.ownPublic??{},opp=observation?.opponentPublic??{};
  const actorActive=own.active, opponentActive=opp.active;
  const name=print(action);
  const isCounter=/^Counter Catcher PAR 160\b/i.test(name);
  const isGuzma=/^Guzma BUS 115\b/i.test(name);
  if(!isCounter&&!isGuzma)return null;
  const attacker = isCounter ? actorActive :
    list(own.bench).find(p=>canAttackNow(p,observation));
  // Guzma necessarily switches your own Active. If it already attacks and
  // there is no independently ready benched attacker, do not sacrifice it.
  if(isGuzma && canAttackNow(actorActive,observation)&&!attacker)return 0;
  if(!attacker)return isCounter?0:null;
  const bestBench=list(opp.bench).reduce((best,p)=>
    Math.max(best,gustTargetPriority(p,observation,attacker)),0);
  if(bestBench<=0)return isCounter?0:20;
  const currentCanKO=gustTargetPriority(opponentActive,observation,attacker)>0;
  if(currentCanKO&&bestBench<400)return isCounter?0:20;
  return isCounter?Math.min(410,bestBench+30):
    Math.min(395,bestBench+10);
}
function targetFromGustChoice(choice,observation) {
  const meta=choice?.publicMetadata??{};
  const player=meta.ownerSeat==='opponent'?observation?.opponentPublic:
    (meta.ownerSeat==='actor'?observation?.ownPublic:null);
  // V3 ChoosePokemon projection's selectionIndex is the ordinal in
  // currently offered choices, not the real board's bench slot.
  const index=Number.isSafeInteger(meta.benchIndex)?meta.benchIndex:
    (Number.isSafeInteger(meta.targetIndex)?meta.targetIndex:
      (Number.isSafeInteger(meta.slotIndex)?meta.slotIndex:null));
  const zone=meta.targetZone??meta.sourceZone;
  if(player&&zone==='bench'&&index!==null)
    return list(player.bench)[index]??null;
  if(player&&zone==='active')return player.active;
  const printing=print(choice);
  if(!player||typeof printing!=='string')return null;
  return slots(player).find(p=>print(p)===printing)??null;
}
function scoreAction(action, request) {
  const obs = request?.observation ?? {};
  const own = obs.ownPublic ?? {};
  const opp = obs.opponentPublic ?? {};
  const name = print(action);
  const hand = list(obs.ownHand).length;
  const active = own.active;
  const enabledVstar = slots(own).some(p => /^Regidrago VSTAR SIT 136\b/i.test(print(p)));
  const gustScore=tacticalGustScore(action,obs);
  if(gustScore !== null) return gustScore;
  const enabledV = slots(own).some(p => /^Regidrago V SIT 135\b/i.test(print(p)));
  if (action.kind === 'attack' && /^(Apex Dragon)$/i.test(action.attackName ?? action.label ?? '')) {
    return countDonors(own) ? 230 : 0;
  }
  if (action.kind === 'use-ability' &&
      /Legacy Star/i.test(action?.publicMetadata?.abilityName??action?.label??'')) {
    if (!canUseLegacyStar(obs)) return 0;
    const useful=list(own.discard).some(c=>legacyRecoverPriority(c,obs)>0);
    if (useful && hand<=4) return 275;
    if (countDonors(own)===0 && own.deckCount>=16) return 210;
    return 50;
  }
  if (action.kind === 'play-card') {
    const attachScore=scoreEnergyAttachment(action,obs);
    if (attachScore !== null) return attachScore;
    if (/^(Ultra Ball MEG 131|Mysterious Treasure FLI 113|Quick Ball FST 237)\b/i.test(name)) {
      const required = /^Ultra Ball\b/i.test(name) ? 2 : 1;
      const safe = list(obs.ownHand).filter(card=>print(card)!==name)
        .filter(card=>safeBallCost(card,obs)>0).length;
      if (safe < required) return 0;
    }
    if (/^Super Rod PAL 188\b/i.test(name)) {
      const useful=list(own.discard).filter(c=>superRodRecoverPriority(c,obs)>0).length;
      const underdeveloped=slots(own).filter(p=>
        /^Regidrago V(?:STAR)? SIT 13[56]\b/i.test(print(p))).length<2;
      return useful? (underdeveloped?170:125):0;
    }
    if (/^Battle Compressor(?: Team Flare Gear)? PHF 92\b/i.test(name)) {
      // Not an unconditional burn: a non-Regidrago board should prioritize setup.
      return enabledVstar && countDonors(own) < 3 ? 255 :
        (enabledV && countDonors(own) < 2 ? 175 : 25);
    }
    if (/^Lillie's Determination MEG 119\b/i.test(name)) return hand <= 4 ? 170 : 25;
    if (/^N FCO 105\b/i.test(name)) {
      return hand <= 3 ? 165 : (Number(own.prizeCount ?? 6) > Number(opp.prizeCount ?? 6) ? 135 : 25);
    }
    if (/^Cynthia & Caitlin CEC 189\b/i.test(name)) {
      const available=list(own.discard).some(isSourceSupporter);
      return available && hand<=4?155:(available?40:0);
    }
    if (/^Pokémon Ranger STS 104\b/i.test(name)) {
      return active?.publicRestrictions?.cannotAttackNextTurn === true ||
        active?.publicRestrictions?.cannotRetreatNextTurn === true ||
        own.publicTurnRestrictions?.attackLockTurnsRemaining > 0 ? 155 : 0;
    }
    const temple = list(opp.stadium).concat(list(own.stadium))
      .some(x=>/^Temple of Sinnoh ASR 155\b/i.test(print(x)));
    const attachedDde = slots(own).some(p=>
      list(p.energies).some(e=>/^Double Dragon Energy ROS 97\b/i.test(print(e))));
    const pendingDde = list(obs.ownHand).some(e=>
      /^Double Dragon Energy ROS 97\b/i.test(print(e))) &&
      slots(own).some(p=>/^Regidrago V(?:STAR)? SIT 13[56]\b/i.test(print(p)) &&
        apexTypedDeficit(p,obs)>0);
    const threatenedDde = temple && (attachedDde || pendingDde);
    const ownUnusedBasicSupport = slots(own).some(p =>
      /Dedenne-GX|Crobat V|Tapu Lele-GX|Fezandipiti ex/i.test(print(p)) &&
      list(p?.abilityDetails).length > 0);
    // Lockbridge's Temple turns DDE colorless, removing the typed Energy
    // which funds Apex. Prefer a regular Stadium to consuming our ACE SPEC.
    if (/^Parallel City BKT 145\b/i.test(name) && threatenedDde) return 270;
    if (/^Silent Lab PRC 140\b/i.test(name)) {
      if (threatenedDde && !ownUnusedBasicSupport) return 255;
      const opponentBasicAbility = slots(opp).some(p =>
        list(p?.printed?.subtypes).includes('Basic') &&
        list(p?.abilityDetails).length > 0);
      return opponentBasicAbility && !ownUnusedBasicSupport ? 115 : 0;
    }
    if (/^Stealthy Hood UNB 186\b/i.test(name)) {
      const enemyWobbuffet = /^Wobbuffet PHF 36\b/i.test(print(opp.active));
      const unusedVstar = own.publicTurnRestrictions?.vstarUsed === false;
      // Play-card root items carry their actual targetPrinting and targetSeat.
      // An otherwise strong Hood line must never choose a token that attaches
      // the Tool to a utility Basic instead of the threatened Regidrago VSTAR.
      const targetPrinting = action?.targetPrinting ?? '';
      const targetSeat = action?.publicMetadata?.targetSeat;
      const targetZone = action?.publicMetadata?.targetZone;
      const targetIndex = action?.publicMetadata?.targetIndex;
      const exactTarget = targetZone === 'active' ? own.active :
        (targetZone === 'bench' && Number.isSafeInteger(targetIndex) ?
          list(own.bench)[targetIndex] : null);
      const aligned = exactTarget &&
        /^Regidrago VSTAR SIT 136\b/i.test(targetPrinting) &&
        targetSeat === 'actor' && print(exactTarget) === targetPrinting &&
        list(exactTarget.tools).length === 0;
      return enemyWobbuffet && unusedVstar && aligned ? 265 : 0;
    }
    // Stage-2 Mega Dragonite has no evolution chain in the original 60:
    // it is an Apex donor, never proactively benched/evolved by this policy.
    if (DONOR.dragonite.test(name) || DONOR.goodra.test(name)) return 0;
  }
  return family.scoreAction(action, request);
}
function estimatedDragonDamage(base, observation, chosenTarget=null) {
  // Approximation with printed Weakness/Resistance and a known Muscle Band;
  // native engine remains authoritative for effects, prevention and modifiers.
  const target=chosenTarget??observation?.opponentPublic?.active ?? {};
  const attacker=observation?.ownPublic?.active ?? {};
  const band=list(attacker.tools).some(x=>/^Muscle Band XY 121\b/i.test(print(x)))?20:0;
  let damage=base+band;
  const weakness=list(target?.printed?.weakness).find(x=>x?.type==='Dragon');
  if(weakness){
    const w=String(weakness.value??'×2').replace(/\s/g,'').replace('×','x').toLowerCase();
    const multi=Number.parseFloat(w.replace(/^x/,'').replace(/x$/,''));
    damage*=Number.isFinite(multi)&&multi>1?multi:2;
  }
  const resistance=list(target?.printed?.resistance).find(x=>x?.type==='Dragon');
  if(resistance){
    const minus=Number.parseInt(String(resistance.value??'-30').replace(/[^0-9-]/g,''),10);
    damage-=Number.isFinite(minus)?Math.abs(minus):30;
  }
  return Math.max(0,damage);
}
function chooseRank32Apex(choices, observation) {
  const target = observation?.opponentPublic?.active;
  const hp = Number(target?.hp) - Number(target?.damage ?? 0);
  const energyCards = list(observation?.ownPublic?.active?.energies).length;
  const ownPrizes = Number(observation?.ownPublic?.prizeCount ?? 6);
  const rollingChoice = list(choices).find(c=>
    (c?.publicMetadata?.sourceAttack??c?.attackName??c?.label)==='Rolling Iron' &&
    c?.publicMetadata?.eligible!==false &&
    c?.publicMetadata?.attackCostPayable!==false);
  const rolling = rollingChoice ? evaluateApexAttackChoice(rollingChoice,observation):null;
  const rows = list(choices).map((choice, index) => {
    const name = choice?.publicMetadata?.sourceAttack ?? choice?.attackName ?? choice?.label ?? '';
    let score = Number(evaluateApexAttackChoice(choice, observation)?.score ?? -1);
    if (choice?.publicMetadata?.eligible === false || choice?.publicMetadata?.attackCostPayable === false) score = -1;
    else if (name === 'Ryuno Glide') {
      // Printed 330 attack, two attached Energy discarded. Native computes
      // actual damage, prevention and energy-discard requirements; this is only
      // a decision heuristic based on visible HP.
      const knockout = Number.isFinite(hp) && hp > 0 &&
        hp <= estimatedDragonDamage(330,observation);
      // When a legal Rolling Iron already Knocks Out the same Active,
      // discard-two Ryuno is connector-dominated: it loses future Energy
      // and the 80-damage defensive reduction for no additional Prize.
      if (rolling?.activeKnockout === true) score=65;
      else score = knockout ? (ownPrizes <= 2 ? 300 : 240) : 125;
      if (energyCards <= 2 && rolling?.activeKnockout!==true) score -= 20;
    } else if (name === 'Dominating Echo') {
      const hasStadium = list(observation?.opponentPublic?.stadium).length > 0;
      const hasSpecial = slots(observation?.opponentPublic).some(p =>
        list(p.energies).some(e => /Special Energy|Double Dragon|Double Colorless/i.test(print(e))));
      score = hasStadium || hasSpecial ? 255 : 175;
    } else if (name === 'Covert Flight') {
      score = list(target?.printed?.subtypes).includes('Basic') ? 165 : 50;
    } else if (name === 'Phantom Dive') {
      // Until native PutDamagePrompt is projected, do not start an unfinishable
      // copied attack merely because the base helper scores it highly.
      score = -1;
    }
    return { choice, index, score };
  }).filter(r => typeof r.choice?.token === 'string' && r.choice.token &&
      r.score > 0).sort((a,b) => b.score-a.score || a.index-b.index);
  return rows.length ? { kind: 'select-choice', token: rows[0].choice.token } :
    { kind: 'abstain', reasonCode: 'RANK32_APEX_NO_COMPLETE_SUPPORTED_ATTACK' };
}
function chooseMany(choices, scoreFn, minimum, maximum, reason) {
  const rows = list(choices).map((choice,index)=>({choice,index,score:scoreFn(choice)}))
    .filter(r=>r.score>0 && typeof r.choice?.token==='string')
    .sort((a,b)=>b.score-a.score || a.index-b.index)
    .slice(0,maximum);
  if (rows.length >= minimum && rows.length) {
    return {kind:'select-choices', tokens:rows.map(r=>r.choice.token)};
  }
  if (minimum === 0) {
    const empty = list(choices).find(c=>c.kind==='empty-selection' && typeof c.token==='string');
    if (empty) return {kind:'select-choice',token:empty.token};
  }
  return {kind:'abstain',reasonCode:reason};
}
function donorScore(card, observation, aggressive) {
  const name = print(card);
  const own = observation?.ownPublic ?? {};
  const already = Object.values(DONOR).some(re => re.test(name) &&
    list(own.discard).some(x=>has(x,re)));
  if (already) return 0;
  // Goodra and Mega Dragonite are in the 60 solely as copyable attacks.
  if (DONOR.dragonite.test(name)) return 245;
  if (DONOR.goodra.test(name)) return 225;
  if (DONOR.dialga.test(name)) return own.publicTurnRestrictions?.gxUsed === true ? 110 : 220;
  if (DONOR.noivern.test(name)) return 210;
  if (DONOR.kyurem.test(name)) return 185;
  if (DONOR.dragapult.test(name)) return 0; // Native damage-allocation continuation is not supported.
  if (!aggressive) return 0;
  // Battle Compressor says 'up to 3': never pad a donor selection by
  // discarding a valuable Energy or an attacker just to reach three cards.
  return 0;
}
function safeBallCost(card, observation) {
  const own = observation?.ownPublic ?? {};
  const name = print(card);
  const donor = donorScore(card, observation, false);
  if (donor > 0) return donor;
  const energyAttached = slots(own).reduce((n,p)=>n+list(p.energies).length,0);
  const handBasicEnergy = list(observation?.ownHand)
    .filter(x=>/^Grass Energy|^Fire Energy/i.test(print(x))).length;
  // Keep basic energy while the attacker is still unfunded. DDE is protected.
  if (/^Grass Energy|^Fire Energy/i.test(name) &&
      energyAttached >= 3 && handBasicEnergy >= 2) return 25;
  if (/^Regidrago V SIT 135\b/i.test(name) &&
      slots(own).filter(x=>/^Regidrago V SIT 135\b/i.test(print(x))).length >= 2)
    return 30;
  if (/^Stealthy Hood UNB 186\b/i.test(name) &&
      slots(own).some(x=>list(x.tools).some(t=>/^Stealthy Hood UNB 186\b/i.test(print(t)))))
    return 20;
  return 0;
}
function setupActiveScore(printing) {
  if (/^Regidrago V SIT 135\b/i.test(printing)) return 100;
  if (/^Budew ASC 16\b/i.test(printing)) return 82;
  if (/^Latias ex SSP 76\b/i.test(printing)) return 62;
  if (/^Fezandipiti ex ASC 142\b/i.test(printing)) return 42;
  if (/^Marshadow UNB 81\b/i.test(printing)) return 32;
  if (/^Crobat V DAA 104\b/i.test(printing)) return 25;
  if (/^Dedenne-GX UNB 57\b/i.test(printing)) return 20;
  if (/^Tapu Lele-GX GRI 60\b/i.test(printing)) return 15;
  return 1;
}
function setupBenchScore(printing, alreadyPicked) {
  // Setup benching is not equivalent to playing a Basic from hand during
  // the turn: it cannot trigger Dedechange, Dark Asset, Wonder Tag, or Let Loose.
  if (/^Regidrago V SIT 135\b/i.test(printing))
    return alreadyPicked.filter(x=>/^Regidrago V SIT 135\b/i.test(x)).length < 3 ? 100 : 0;
  if (/^Latias ex SSP 76\b/i.test(printing)) return 75;
  if (/^Budew ASC 16\b/i.test(printing))
    return alreadyPicked.some(x=>/^Budew ASC 16\b/i.test(x)) ? 0 : 60;
  return 0;
}
function engineSetupDecision(prompt, observation, choices) {
  const meta=prompt?.publicMetadata ?? {};
  if (observation?.phase !== 1 || prompt?.source?.sourceKind !== 'engine' ||
      prompt?.source?.sourcePrinting !== null ||
      prompt?.source?.classification !== 'actor-choice') return null;
  const name=prompt.description;
  if (name === 'CHOOSE_STARTING_POKEMONS' && prompt.promptType === 'ChooseCardsPrompt') {
    const min=meta.minimumCount,max=meta.maximumCount;
    if (meta.selectionType!=='card-combination' || meta.sourceZone!=='hand' ||
        meta.ownerSeat!=='actor' || meta.isOwnerVisible!==true ||
        meta.allowCancel!==false || meta.isSecret!==false ||
        !Number.isSafeInteger(min) || !Number.isSafeInteger(max) ||
        min < 0 || max < min)
      return {kind:'abstain',reasonCode:'INVALID_STARTING_POKEMON_PROMPT'};
    const bench=list(observation?.ownPublic?.bench);
    if (!Array.isArray(observation?.ownPublic?.bench))
      return {kind:'abstain',reasonCode:'MISSING_PUBLIC_BENCH_FOR_SETUP'};
    const capacity=bench.filter(x=>x===null).length;
    const handChoices=choices.filter(c=>c.kind==='card' &&
      typeof c.token==='string' && typeof c.printing==='string' &&
      c.publicMetadata?.sourceZone==='hand' &&
      c.publicMetadata?.ownerSeat==='actor' &&
      c.publicMetadata?.isOwnerVisible===true);
    const picks=[];
    if (min === 1) {
      if (observation.ownPublic.active!==null || handChoices.length===0)
        return {kind:'abstain',reasonCode:'NO_VISIBLE_STARTING_POKEMON'};
      const selected=handChoices.slice().sort((a,b)=>
        setupActiveScore(b.printing)-setupActiveScore(a.printing));
      picks.push(selected[0]);
      const remainder=selected.slice(1);
      while (picks.length < Math.min(max,1+capacity)) {
        let index=-1,best=0;
        for(let i=0;i<remainder.length;i++) {
          const score=setupBenchScore(remainder[i].printing,picks.map(x=>x.printing));
          if(score>best){best=score;index=i;}
        }
        if(index<0)break;
        picks.push(remainder.splice(index,1)[0]);
      }
    } else if (min === 0) {
      if (observation.ownPublic.active===null)
        return {kind:'abstain',reasonCode:'MISSING_ACTIVE_FOR_EXTRA_BENCH'};
      const remainder=handChoices.slice(),onBoard=[observation.ownPublic.active.printing];
      while(picks.length < Math.min(max,capacity)) {
        let index=-1,best=0;
        for(let i=0;i<remainder.length;i++){
          const score=setupBenchScore(remainder[i].printing,
            [...onBoard,...picks.map(x=>x.printing)]);
          if(score>best){best=score;index=i;}
        }
        if(index<0)break;
        picks.push(remainder.splice(index,1)[0]);
      }
    } else return {kind:'abstain',reasonCode:'UNSUPPORTED_STARTING_POKEMON_CARDINALITY'};
    if(picks.length>=Math.max(min,1))
      return {kind:'select-choices',tokens:picks.map(c=>c.token)};
    const empty=choices.find(c=>c.kind==='empty-selection'&&typeof c.token==='string');
    return min===0 && empty ?
      {kind:'select-choice',token:empty.token} :
      {kind:'abstain',reasonCode:'NO_EMPTY_BENCH_SELECTION'};
  }
  if (name === 'GO_FIRST' && prompt.promptType === 'ConfirmPrompt') {
    if (meta.selectionType!=='confirm')
      return {kind:'abstain',reasonCode:'INVALID_GO_FIRST_CONFIRMATION'};
    const yes=choices.find(c=>c.kind==='confirm'&&/^Yes$/i.test(c.label??''));
    const no=choices.find(c=>c.kind==='confirm'&&/^No$/i.test(c.label??''));
    if (!yes||!no) return {kind:'abstain',reasonCode:'UNRECOGNIZED_GO_FIRST_CHOICES'};
    // Regidrago has a meaningful first turn going second: Supporter,
    // Celestial Roar and Budew's Item-lock attack. This is a policy
    // assumption; choosing second is not a demonstrated win-rate result.
    return {kind:'select-choice',token:no.token};
  }
  if (name === 'WANT_TO_DRAW_CARDS' && prompt.promptType === 'SelectPrompt') {
    const count=meta.count;
    if(meta.selectionType!=='option'||!Number.isSafeInteger(count)||count<1)
      return {kind:'abstain',reasonCode:'INVALID_MULLIGAN_DRAW_OPTIONS'};
    const options=choices.filter(c=>c.kind==='option');
    if(options.length!==count)return {kind:'abstain',reasonCode:'INCOMPLETE_MULLIGAN_DRAW_OPTIONS'};
    const seen=new Set(),ranked=[];
    for(const c of options) {
      const index=c.publicMetadata?.choiceIndex;
      const match=String(c.label??'').match(/^Draw (\d+) card\(s\)$/i);
      if(!Number.isSafeInteger(index)||index<0||index>=count||seen.has(index)||
          !match||Number(match[1])!==count-1-index)
        return {kind:'abstain',reasonCode:'INVALID_MULLIGAN_DRAW_INDEX'};
      seen.add(index);
      ranked.push({choice:c,count:count-1-index});
    }
    return {kind:'select-choice',token:ranked.sort((a,b)=>b.count-a.count)[0].choice.token};
  }
  return null;
}
function promptDecision(request) {
  const p = request?.prompt ?? {};
  const choices = list(p.choices);
  const source = context(p);
  const obs = request?.observation ?? {};
  const meta = p.publicMetadata ?? {};
  const engine = engineSetupDecision(p,obs,choices);
  if (engine !== null) return engine;
  const min = Number.isSafeInteger(meta.minimumCount) ? meta.minimumCount : 1;
  const max = Number.isSafeInteger(meta.maximumCount) ? meta.maximumCount :
    (Number.isSafeInteger(meta.count) ? meta.count : Math.max(1,min));
  if (p.promptType === 'ChooseAttackPrompt' && /apex dragon/.test(source)) {
    return chooseRank32Apex(choices, obs);
  }
  if (/legacy star/.test(source)) {
    // The native seven-card mill has already resolved before this prompt;
    // its offered tokens are authoritative even if the observation's earlier
    // discard snapshot or VSTAR-used flag has not yet been updated.
    if (p.promptType==='ChooseCardsPrompt' &&
        meta.selectionType==='card-combination'&&
        meta.sourceZone==='discard') {
      return chooseMany(choices,c=>legacyRecoverPriority(c,obs),min,Math.min(max,2),
        'RANK32_LEGACY_NO_SAFE_RECOVERY');
    }
    if (p.promptType==='ConfirmPrompt' && meta.selectionType==='confirm') {
      const useful=list(obs.ownPublic?.discard).some(c=>legacyRecoverPriority(c,obs)>0);
      const enabled=canUseLegacyStar(obs)&&
        (useful||countDonors(obs.ownPublic??{})===0);
      const target=choices.find(c=>c.kind==='confirm' &&
        new RegExp(enabled?'^yes$':'^no$','i').test(c.label??''));
      return target?{kind:'select-choice',token:target.token}:
        {kind:'abstain',reasonCode:'UNRECOGNIZED_SIMPLE_PROMPT'};
    }
    return {kind:'abstain',reasonCode:'RANK32_LEGACY_PROMPT_UNPROJECTED'};
  }
  if (/counter catcher|guzma/.test(source) && meta.selectionType==='pokemon') {
    const own=obs.ownPublic??{};
    const isGuzma=/guzma/.test(source);
    const attacker=isGuzma?
      list(own.bench).find(p=>canAttackNow(p,obs)):
      own.active;
    return chooseMany(choices,c=>{
      const target=targetFromGustChoice(c,obs);
      if(c?.publicMetadata?.ownerSeat==='actor') {
        return isGuzma&&canAttackNow(target,obs)?300:0;
      }
      return gustTargetPriority(target,obs,attacker);
    },min,Math.min(max,1),'RANK32_GUST_NO_LETHAL_TARGET');
  }
  if (/cynthia\s*&\s*caitlin/.test(source)) {
    if (p.promptType === 'ChooseCardsPrompt' &&
        meta.selectionType === 'card-combination') {
      if (meta.sourceZone === 'discard') {
        return chooseMany(choices,c=>cynthiaRecoverPriority(c,obs),min,Math.min(max,1),
          'RANK32_CYNTHIA_NO_SUPPORTER_TO_RECOVER');
      }
      if (meta.sourceZone === 'hand') {
        return chooseMany(choices,c=>donorScore(c,obs,false),min,Math.min(max,1),
          'RANK32_CYNTHIA_NO_SAFE_DRAW_DISCARD');
      }
    }
    if (p.promptType === 'ConfirmPrompt' && meta.selectionType === 'confirm') {
      const safe=list(obs.ownHand).some(c=>donorScore(c,obs,false)>0);
      const desired=choices.find(c=>c.kind==='confirm'&&
        new RegExp(safe?'^yes$':'^no$','i').test(c.label??''));
      return desired?
        {kind:'select-choice',token:desired.token}:
        {kind:'abstain',reasonCode:'UNRECOGNIZED_SIMPLE_PROMPT'};
    }
    return {kind:'abstain',reasonCode:'RANK32_CYNTHIA_PROMPT_UNPROJECTED'};
  }
  if (/super rod/.test(source)) {
    if (p.promptType==='ChooseCardsPrompt' &&
        meta.selectionType==='card-combination' && meta.sourceZone==='discard')
      return chooseMany(choices,c=>superRodRecoverPriority(c,obs),min,Math.min(max,3),
        'RANK32_SUPER_ROD_NO_SAFE_RECOVERY');
    return {kind:'abstain',reasonCode:'RANK32_SUPER_ROD_PROMPT_UNPROJECTED'};
  }
  if (/battle compressor/.test(source) && p.promptType === 'ChooseCardsPrompt') {
    return chooseMany(choices, c=>donorScore(c,obs,true), min, Math.min(max,3),
      'RANK32_COMPRESSOR_NO_SAFE_PAYLOAD');
  }
  if (/mysterious treasure|quick ball|ultra ball/.test(source) && /discard/.test(source) &&
      p.promptType === 'ChooseCardsPrompt') {
    return chooseMany(choices,c=>safeBallCost(c,obs), min,max,
      'RANK32_BALL_NO_SAFE_DISCARD');
  }
  if (/ryuno glide/.test(source) && p.promptType === 'ChooseEnergyPrompt') {
    // V3 protocol represents energy-payment as ChooseEnergyPrompt, not
    // DiscardEnergyPrompt. Its cardinality is 1..energyCount, NOT min/max.
    if (meta.selectionType !== 'energy-payment' ||
        !Number.isSafeInteger(meta.energyCount) || meta.energyCount < 1 ||
        meta.energyCount > choices.length ||
        choices.some(c=>c.kind !== 'energy' || typeof c.token !== 'string')) {
      return {kind:'abstain',reasonCode:'RANK32_RYUNO_ENERGY_PROMPT_UNPROJECTED'};
    }
    const basic = choices.filter(c=>/^Grass Energy|^Fire Energy/i.test(print(c)));
    const dde = choices.filter(c=>/^Double Dragon Energy/i.test(print(c)));
    // Two separate Basic Energy cards pay a two-Energy discard without
    // sacrificing DDE; one DDE may provide two Energy if needed.
    if (basic.length >= 2) {
      return {kind:'select-choices',tokens:basic.slice(0,2).map(c=>c.token)};
    }
    if (dde.length) return {kind:'select-choices',tokens:[dde[0].token]};
    return {kind:'abstain',reasonCode:'RANK32_RYUNO_NO_SUPPORTED_ENERGY_PAYMENT'};
  }
  if (/stealthy hood/.test(source) && meta.selectionType === 'pokemon') {
    const enemyWobbuffet = /^Wobbuffet PHF 36\b/i.test(print(obs?.opponentPublic?.active));
    if (!enemyWobbuffet || obs?.ownPublic?.publicTurnRestrictions?.vstarUsed !== false) {
      return {kind:'abstain',reasonCode:'RANK32_HOOD_LOCK_WINDOW_ABSENT'};
    }
    return chooseMany(choices,c=>/^Regidrago VSTAR SIT 136\b/i.test(print(c)) ? 250 : 0,
      min,Math.min(max,1),'RANK32_HOOD_NO_SAFE_VSTAR_TARGET');
  }
  if (/ryuno glide/.test(source)) {
    return {kind:'abstain',reasonCode:'RANK32_RYUNO_ENERGY_PROMPT_UNPROJECTED'};
  }
  const inherited = family.promptDecision(request);
  if (inherited?.kind === 'abstain' && typeof inherited.reasonCode === 'string') {
    return {...inherited, reasonCode:inherited.reasonCode.replaceAll('RANK12','RANK32')};
  }
  return inherited;
}
function bestAction(request) {
  const actions = list(request?.actionFrontier?.items).filter(a=>EXECUTABLE.has(a.kind));
  if (!actions.length) return {kind:'abstain',reasonCode:'RANK32_NO_EXECUTABLE_ACTION'};
  const ranked = actions.map((a,index)=>({a,index,score:scoreAction(a,request)}))
    .sort((a,b)=>b.score-a.score || a.index-b.index);
  if (ranked[0].score > 0) return {kind:'select-action',token:ranked[0].a.token};
  const pass = actions.find(a=>a.kind==='pass');
  return pass ? {kind:'select-action',token:pass.token} :
    {kind:'abstain',reasonCode:'RANK32_NO_SUPPORTED_ACTION'};
}
function protocolSafeDecision(decision, request) {
  if (!decision || decision.kind !== 'abstain') return decision;
  const reason = decision.reasonCode ?? '';
  if (reason === 'ROLE_SEAT_BINDING_MISMATCH') return decision;
  // The production V3 worker has a frozen, finite abstention codebook.
  // Internal diagnostic reason codes can be source-specific, but the worker
  // must publish only protocol-enumerated codes.
  let code = 'UNSUPPORTED_PROMPT_TYPE';
  if (request?.prompt === null || request?.prompt === undefined)
    code = 'NO_SUPPORTED_ROOT_ACTION';
  else if (/PRIZE|HEAVY_BALL/i.test(reason)) code = 'NO_VISIBLE_PRIZE_SLOT';
  else if (/RYUNO|ENERGY_PAYMENT|ENERGY_PROMPT/i.test(reason))
    code = 'NO_SUPPORTED_ENERGY_PAYMENT';
  else if (/APEX|ATTACK/i.test(reason)) code = 'NO_SUPPORTED_ATTACK_CHOICE';
  else if (/POKEMON|HOOD|SKY_TRANSPORT|GUST/i.test(reason))
    code = 'NO_SUPPORTED_POKEMON_CHOICE';
  else if (/CARD|BALL|DISCARD|COMPRESSOR|SUPPORTER|SEARCH/i.test(reason))
    code = 'NO_SUPPORTED_CARD_SELECTION';
  return {kind:'abstain',reasonCode:code};
}
function createPolicy({role,seat,policyVersion,config,rng}) {
  if (role!=='opponent' || (seat!==0 && seat!==1) ||
      policyVersion!==POLICY_VERSION || !config ||
      typeof config!=='object' || Array.isArray(config) ||
      Object.keys(config).length!==0 || typeof rng!=='function') {
    throw Error('AGENT3_RANK32_POLICY_INIT_MISMATCH');
  }
  return Object.freeze({
    decide(request) {
      if (!request || request.role!=='opponent' || request.seat!==seat ||
          request.observation?.actorSeat!==seat) {
        return {kind:'abstain',reasonCode:'ROLE_SEAT_BINDING_MISMATCH'};
      }
      const decision = request.prompt !== null && request.prompt !== undefined ?
        promptDecision(request) : bestAction(request);
      return protocolSafeDecision(decision,request);
    }
  });
}
module.exports = {POLICY_VERSION,SOURCE_RANK,SOURCE_LIST_BLOB_SHA1,ENGINE_PIN,
  createPolicy,scoreAction,promptDecision,bestAction,chooseRank32Apex,donorScore,
  protocolSafeDecision,apexTypedDeficit,scoreEnergyAttachment,nativeOwnerTarget,
  engineSetupDecision,setupActiveScore,setupBenchScore,
  isSourceSupporter,cynthiaRecoverPriority,
  legacyRecoverPriority,canUseLegacyStar,superRodRecoverPriority,estimatedDragonDamage,
  strongestCopiedDamage,canAttackNow,tacticalGustScore,gustTargetPriority,targetFromGustChoice};

},
"./agent3-rank14-regidrago-opponent-policy.cjs": function(require, module, exports) {
'use strict';

/*
 * Aichi rank 14 original-source Regidrago family worker.
 * Deliberately shares rank32's donor, Apex, resource, and engine-setup
 * policy, but supersedes the printed differences in this source 60:
 * Sky Field, Squawkabilly ex, Oricorio-GX, Sudowoodo, Carmine,
 * Professor's Research. Not a game-competence or win-rate claim.
 */

const base = require('./agent3-rank32-regidrago-opponent-policy.cjs');

const POLICY_VERSION='agent3-rank14-regidrago-opponent-v1';
const SOURCE_RANK=14;
const SOURCE_LIST_BLOB_SHA1='ae773f6201d7aa69d31914dbfee66f3fba692200';
const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const EXECUTABLE=new Set(['play-card','attack','retreat','use-ability','use-stadium','pass']);

function list(x){return Array.isArray(x)?x:[];}
function print(x) {
  if(typeof x==='string')return x;
  return x?.printing??x?.actorPrinting??x?.targetPrinting??
    x?.publicMetadata?.cardPrinting??x?.label??'';
}
function board(p){return[p?.active,...list(p?.bench)].filter(Boolean);}
function benchCapacity(p) {
  const bench=list(p?.bench);
  return bench.length>0 ? bench.filter(x=>x===null).length : Math.max(0,5-bench.filter(Boolean).length);
}
function turnOne(obs){
  return Number.isSafeInteger(obs?.globalTurn)&&obs.globalTurn>=1&&obs.globalTurn<=2;
}
function isDonor(x){
  return /^(?:Dialga-GX UPR 100|Hisuian Goodra VSTAR LOR 136|Mega Dragonite ex ASC 152|Noivern ex PAL 153|Kyurem SFA 47|Dragapult ex TWM 130)\b/i.test(print(x));
}
function discardCost(ownHand) {
  // Only burn entire hand while preserving enough attack Energy/resources.
  const hand=list(ownHand);
  const hasProtectedDde=hand.some(x=>/^Double Dragon Energy ROS 97\b/i.test(print(x)));
  // Discarding the entire hand loses the DDE regardless of how many copyable
  // donors are simultaneously present; donor presence does not refund Energy.
  return hasProtectedDde ? 70 : 0;
}
function rank14RootScore(item,request){
  const obs=request?.observation??{},own=obs.ownPublic??{},opp=obs.opponentPublic??{};
  const name=print(item),hand=list(obs.ownHand),cardCount=hand.length;
  const open=benchCapacity(own),priorKO=request?.publicEventReceipt?.priorOpponentTurnKO?.any===true;
  const opponentBench=board(opp).slice(1).length;
  if(item.kind==='play-card') {
    if(/^Sky Field ROS 89\b/i.test(name)){
      const supports=hand.filter(x=>/^(?:Dedenne-GX UNB 57|Squawkabilly ex PAL 169|Tapu Lele-GX GRI 60|Oricorio-GX CEC 95|Regidrago V SIT 135)\b/i.test(print(x))).length;
      // Only pay the Stadium slot to unlock a real occupancy constraint.
      return open===0&&supports>0?258:(open===1&&supports>=2?180:0);
    }
    if(/^Squawkabilly ex PAL 169\b/i.test(name)){
      const existing=board(own).some(x=>/^Squawkabilly ex PAL 169\b/i.test(print(x)));
      return turnOne(obs)&&open>0&&!existing&&cardCount<=4 &&
        discardCost(hand)===0 ? 225 : 0;
    }
    if(/^Oricorio-GX CEC 95\b/i.test(name)){
      const existing=board(own).some(x=>/^Oricorio-GX CEC 95\b/i.test(print(x)));
      return priorKO&&open>0&&!existing?200:0;
    }
    if(/^Sudowoodo GRI 66\b/i.test(name)){
      const existing=board(own).some(x=>/^Sudowoodo GRI 66\b/i.test(print(x)));
      return opponentBench>=4 && open>0 && !existing ? 145 : 0;
    }
    if(/^Professor's Research JTG 155\b/i.test(name)){
      // Discarding a singleton DDE hand without another payload can destroy
      // the copied-attacker route; make the risk explicit.
      return discardCost(hand)>0?0:(cardCount<=3?180:25);
    }
    if(/^Carmine TWM 145\b/i.test(name)){
      const already=obs.ownTurnResources?.supporterPlayedTurn;
      return turnOne(obs)&&cardCount<=3&&already!==obs.globalTurn &&
        discardCost(hand)===0 ? 165 : 0;
    }
  }
  if(item.kind==='use-ability') {
    const name=String(item?.publicMetadata?.abilityName??item?.label??'');
    if(/Squawk and Seize/i.test(name))
      return turnOne(obs)&&cardCount<=4?Math.max(0,260-discardCost(hand)):0;
    if(/Dance of Tribute/i.test(name)) return priorKO?200:0;
  }
  return null;
}
function bestAction(request) {
  const listActions=list(request?.actionFrontier?.items).filter(a=>EXECUTABLE.has(a.kind));
  if(!listActions.length)return {kind:'abstain',reasonCode:'NO_SUPPORTED_ROOT_ACTION'};
  const ranked=listActions.map((a,i)=>{
    const special=rank14RootScore(a,request);
    return {item:a,index:i,score:special===null?base.scoreAction(a,request):special};
  }).sort((a,b)=>b.score-a.score||a.index-b.index);
  if(ranked[0].score>0)return {kind:'select-action',token:ranked[0].item.token};
  const pass=listActions.find(a=>a.kind==='pass');
  return pass?{kind:'select-action',token:pass.token}:
    {kind:'abstain',reasonCode:'NO_SUPPORTED_ROOT_ACTION'};
}
function promptDecision(request) {
  const p=request?.prompt??{},meta=p.publicMetadata??{};
  const source=[p?.source?.effectName,p?.source?.sourcePrinting,
    p?.description].filter(Boolean).join(' ');
  if(/Squawk and Seize|Dance of Tribute/i.test(source) &&
     p.promptType==='ConfirmPrompt'&&meta.selectionType==='confirm') {
    const req=request??{},obs=req.observation??{};
    const turn=turnOne(obs),priorKO=req.publicEventReceipt?.priorOpponentTurnKO?.any===true;
    const enabled=/Squawk and Seize/i.test(source)?
      (turn&&list(obs.ownHand).length<=4&&discardCost(obs.ownHand)===0):priorKO;
    const choice=list(p.choices).find(c=>c.kind==='confirm'&&
      new RegExp(enabled?'^yes$':'^no$','i').test(c.label??''));
    return choice?{kind:'select-choice',token:choice.token}:
      {kind:'abstain',reasonCode:'UNRECOGNIZED_SIMPLE_PROMPT'};
  }
  return base.promptDecision(request);
}
function createPolicy({role,seat,policyVersion,config,rng}){
  if(role!=='opponent'||(seat!==0&&seat!==1)||
     policyVersion!==POLICY_VERSION||!config||
     typeof config!=='object'||Array.isArray(config)||
     Object.keys(config).length!==0||typeof rng!=='function')
    throw Error('AGENT3_RANK14_POLICY_INIT_MISMATCH');
  return Object.freeze({decide(request){
    if(!request||request.role!=='opponent'||request.seat!==seat||
       request.observation?.actorSeat!==seat)
      return {kind:'abstain',reasonCode:'ROLE_SEAT_BINDING_MISMATCH'};
    const decision=request.prompt!==null&&request.prompt!==undefined?
      promptDecision(request):bestAction(request);
    return base.protocolSafeDecision(decision,request);
  }});
}
module.exports={POLICY_VERSION,SOURCE_RANK,SOURCE_LIST_BLOB_SHA1,ENGINE_PIN,
  createPolicy,bestAction,promptDecision,rank14RootScore,discardCost,turnOne};

}
});
const __rank14Cache = Object.create(null);
function __rank14Load(id) {
  if (!Object.prototype.hasOwnProperty.call(__rank14Modules,id)) throw new Error('UNKNOWN_RANK14_MODULE');
  if (Object.prototype.hasOwnProperty.call(__rank14Cache,id)) return __rank14Cache[id].exports;
  const internal = {exports:{}};
  __rank14Cache[id] = internal;
  __rank14Modules[id](__rank14Load,internal,internal.exports);
  return internal.exports;
}
module.exports = __rank14Load("./agent3-rank14-regidrago-opponent-policy.cjs");
