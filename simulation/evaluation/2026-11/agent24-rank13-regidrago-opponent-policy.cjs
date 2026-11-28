'use strict';

/*
 * Aichi rank-13 Regidrago opponent policy.
 *
 * Actor-view-only, deterministic and bound to the exact published rank-13
 * sixty. This is a diagnostic prototype, not a competent/qualified opponent.
 * Native Twinleaf remains the authority for legality and effect resolution.
 */

const { evaluateApexAttackChoice } = require('./agent43-regidrago-apex-choice.cjs');

const POLICY_VERSION = 'agent24-rank13-regidrago-opponent-v1';
const SOURCE_RANK = 13;
const SOURCE_FINGERPRINT_SHA256 = '54d584be865d842fd5ffaf288873c8ac127e0e9d7007f96e12a49e7a9469690b';
const CANDIDATE_FINGERPRINT_SHA256 = '1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4';
const SOURCE_LIST_BLOB_SHA1 = 'ae773f6201d7aa69d31914dbfee66f3fba692200';
const CANDIDATE_LIST_BLOB_SHA1 = '24ace2d6feb9ce5d9056bcf271827cfe31b7357b';
const ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const WORKER_PROTOCOL_BLOB_SHA1 = 'd51ea95c457d61b50a9ee114d342eb17f4350451';
const APEX_HELPER_BLOB_SHA1 = '65b299d6d1eccc4dfaa1a8fafe777cbdc9a1511b';

const PRINT = Object.freeze({
  regidragoV: /^Regidrago V SIT 135\b/i,
  regidragoVstar: /^Regidrago VSTAR SIT 136\b/i,
  salamence: /^Salamence ex JTG 114\b/i,
  dragapult: /^Dragapult ex TWM 130\b/i,
  noivern: /^Noivern ex PAL 153\b/i,
  dialga: /^Dialga-GX UPR 100\b/i,
  kyurem: /^Kyurem SFA 47\b/i,
  latias: /^Latias ex SSP 76\b/i,
  tapuLele: /^Tapu Lele-GX GRI 60\b/i,
  dedenne: /^Dedenne-GX UNB 57\b/i,
  squawk: /^Squawkabilly ex PAL 169\b/i,
  budew: /^Budew ASC 16\b/i,
  professorResearch: /^Professor's Research JTG 155\b/i,
  guzma: /^Guzma BUS 115\b/i,
  lillie: /^Lillie's Determination MEG 119\b/i,
  iono: /^Iono PAL 185\b/i,
  marnie: /^Marnie SSH 169\b/i,
  crispin: /^Crispin SCR 133\b/i,
  raihan: /^Raihan EVS 152\b/i,
  treasure: /^Mysterious Treasure FLI 113\b/i,
  quickBall: /^Quick Ball FST 237\b/i,
  battleVip: /^Battle VIP Pass FST 225\b/i,
  compressor: /^Battle Compressor(?: Team Flare Gear)? PHF 92\b/i,
  vsSeeker: /^VS Seeker PHF 109\b/i,
  heavyBall: /^Hisuian Heavy Ball ASR 146\b/i,
  superRod: /^Super Rod PAL 188\b/i,
  echoingHorn: /^Echoing Horn CRE 136\b/i,
  megatonBlower: /^Megaton Blower SSP 182\b/i,
  muscleBand: /^Muscle Band XY 121\b/i,
  silentLab: /^Silent Lab PRC 140\b/i,
  parallelCity: /^Parallel City BKT 145\b/i,
  doubleDragon: /^Double Dragon Energy ROS 97\b/i,
  grassEnergy: /^Grass Energy MEE 9\b/i,
  fireEnergy: /^Fire Energy MEE 10\b/i
});

const EXECUTABLE = new Set([
  'play-card', 'attack', 'retreat', 'use-ability', 'use-stadium', 'pass'
]);

const DRAGON_PAYLOADS = Object.freeze([
  PRINT.regidragoV, PRINT.regidragoVstar, PRINT.salamence, PRINT.dragapult,
  PRINT.noivern, PRINT.dialga, PRINT.kyurem
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
  if (typeof value?.publicMetadata?.sourcePrinting === 'string') return value.publicMetadata.sourcePrinting;
  return '';
}

function matches(value, pattern) {
  return pattern.test(printingValue(value));
}

function metadata(value) {
  return value?.publicMetadata ?? {};
}

function actionPrinting(item) {
  return item?.actorPrinting ?? item?.targetPrinting ??
    metadata(item).sourcePrinting ?? item?.label ?? '';
}

function sourceText(prompt) {
  const source = prompt?.source ?? {};
  return [
    source.sourcePrinting, source.effectName, source.sourceEffect, source.sourceAttack,
    source.copiedSourcePrinting, source.copiedAttackName, source.cardPrinting,
    source.printing, source.label, prompt?.description,
    prompt?.publicMetadata?.sourceEffect, prompt?.publicMetadata?.effectName,
    prompt?.publicMetadata?.sourcePrinting
  ].filter(Boolean).join(' ').toLowerCase();
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

function handSize(observation) {
  return list(observation?.ownHand).length;
}

function remainingHp(pokemon) {
  if (!pokemon || !Number.isFinite(pokemon.hp) || !Number.isFinite(pokemon.damage)) return -1;
  return pokemon.hp - pokemon.damage;
}

function ownEnergyCount(observation) {
  return boardSlots(observation?.ownPublic)
    .reduce((sum, pokemon) => sum + list(pokemon.energies).length, 0);
}

function hasDragonPayload(observation) {
  const own = observation?.ownPublic ?? {};
  return DRAGON_PAYLOADS.some(pattern => discardHas(own, pattern));
}

function dragonPayloadCount(observation) {
  const own = observation?.ownPublic ?? {};
  return DRAGON_PAYLOADS.filter(pattern => discardHas(own, pattern)).length;
}

function supporterInHand(observation) {
  return list(observation?.ownHand).some(card =>
    /Supporter/i.test(printingValue(card)) ||
    PRINT.professorResearch.test(printingValue(card)) ||
    PRINT.guzma.test(printingValue(card)) ||
    PRINT.lillie.test(printingValue(card)) ||
    PRINT.iono.test(printingValue(card)) ||
    PRINT.marnie.test(printingValue(card)) ||
    PRINT.crispin.test(printingValue(card)) ||
    PRINT.raihan.test(printingValue(card)));
}

function hasSupporterInDiscard(observation) {
  return list(observation?.ownPublic?.discard).some(card =>
    /Supporter/i.test(printingValue(card)) ||
    PRINT.professorResearch.test(printingValue(card)) ||
    PRINT.guzma.test(printingValue(card)) ||
    PRINT.lillie.test(printingValue(card)) ||
    PRINT.iono.test(printingValue(card)) ||
    PRINT.marnie.test(printingValue(card)) ||
    PRINT.crispin.test(printingValue(card)) ||
    PRINT.raihan.test(printingValue(card)));
}

function priorOpponentTurnKO(request) {
  return request?.publicEventReceipt?.priorOpponentTurnKO?.any === true;
}

function opponentHasStadium(observation) {
  return list(observation?.opponentPublic?.stadium).length > 0;
}

function opponentHasSpecialEnergy(observation) {
  return boardSlots(observation?.opponentPublic).some(pokemon =>
    list(pokemon.energies).some(energy =>
      /Special Energy|Double Dragon Energy|Double Colorless Energy|Jet Energy|Speed Lightning Energy|Aurora Energy|Capture Energy/i
        .test(printingValue(energy))));
}

function opponentHasTools(observation) {
  return boardSlots(observation?.opponentPublic).some(pokemon => list(pokemon.tools).length > 0);
}

function opponentHasToolsOrSpecialEnergy(observation) {
  return opponentHasTools(observation) || opponentHasSpecialEnergy(observation) ||
    opponentHasStadium(observation);
}

function opponentThreats(observation) {
  const opponent = observation?.opponentPublic ?? {};
  return {
    mimikyu: boardHas(opponent, /^Mimikyu GRI 58\b/i),
    clefairy: boardHas(opponent, /^Lillie's Clefairy ex JTG 56\b/i)
  };
}

function prizeValue(pokemon) {
  const subtypes = list(pokemon?.printed?.subtypes).map(String);
  const printing = printingValue(pokemon);
  if (subtypes.some(value => ['VMAX', 'TAG TEAM', 'V-UNION'].includes(value)) ||
      /VMAX|TAG\s*TEAM|V-UNION/i.test(printing)) return 3;
  if (subtypes.some(value => ['V', 'VSTAR', 'GX', 'ex'].includes(value)) ||
      /(?:-GX|\bVSTAR\b|\bex\b)/i.test(printing)) return 2;
  return 1;
}

function candidateTargetPriority(pokemon, observation) {
  const hp = remainingHp(pokemon);
  const value = printingValue(pokemon);
  const threats = opponentThreats(observation);
  if (/Shadow Rider Calyrex VMAX CRE 75/i.test(value)) return 260 + (hp > 0 ? Math.max(0, 320 - hp) / 20 : 0);
  if (/Lillie's Clefairy ex JTG 56/i.test(value)) return 240;
  if (/Mimikyu GRI 58/i.test(value)) return threats.mimikyu ? 220 : 200;
  if (/Dialga-GX UPR 100|Latias ex SSP 76|Tapu Lele-GX GRI 60/i.test(value)) return 190;
  return 70 + prizeValue(pokemon) * 25 + (hp > 0 ? Math.max(0, 180 - hp) / 10 : 0);
}

function targetPokemonFromChoice(choice, observation) {
  const meta = metadata(choice);
  const owner = meta.ownerSeat;
  const zone = meta.targetZone ?? meta.zone;
  const index = Number.isSafeInteger(meta.benchIndex) ? meta.benchIndex : meta.slotIndex;
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
  const owner = metadata(choice).ownerSeat;
  if (owner === 'actor') {
    const pokemon = targetPokemonFromChoice(choice, observation);
    if (matches(pokemon, PRINT.regidragoVstar) || matches(pokemon, PRINT.regidragoV)) return 190;
    if (matches(pokemon, PRINT.latias)) return 100;
    return 30;
  }
  return candidateTargetPriority(targetPokemonFromChoice(choice, observation), observation);
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
    const empty = list(choices).find(choice =>
      choice.kind === 'empty-selection' && typeof choice.token === 'string');
    if (empty) return { kind: 'select-choice', token: empty.token };
  }
  return { kind: 'abstain', reasonCode };
}

function selectionBounds(prompt) {
  const meta = metadata(prompt);
  const minimum = Number.isSafeInteger(meta.minimumCount) ? meta.minimumCount :
    (Number.isSafeInteger(meta.requiredCount) ? meta.requiredCount : 1);
  const maximum = Number.isSafeInteger(meta.maximumCount) ? meta.maximumCount :
    (Number.isSafeInteger(meta.count) ? meta.count : minimum);
  return { minimum, maximum };
}

function discardCostPriority(choice, observation) {
  const value = printingValue(choice);
  const own = observation?.ownPublic ?? {};
  if (PRINT.noivern.test(value) && !discardHas(own, PRINT.noivern)) return 240;
  if (PRINT.dialga.test(value) && !discardHas(own, PRINT.dialga)) return 230;
  if (PRINT.salamence.test(value) && !discardHas(own, PRINT.salamence)) return 220;
  if (PRINT.kyurem.test(value) && !discardHas(own, PRINT.kyurem)) return 190;
  if (PRINT.dragapult.test(value)) return 20; // Phantom Dive is blocked by the current worker prompt surface.
  if (PRINT.regidragoVstar.test(value)) return boardHas(own, PRINT.regidragoVstar) ? 90 : 0;
  if (PRINT.regidragoV.test(value)) return boardCount(own, PRINT.regidragoV) >= 2 ? 70 : 0;
  if (PRINT.budew.test(value)) return boardHas(own, PRINT.budew) ? 65 : 0;
  if (PRINT.doubleDragon.test(value)) return ownEnergyCount(observation) >= 5 ? 55 : 0;
  if (PRINT.grassEnergy.test(value) || PRINT.fireEnergy.test(value)) return ownEnergyCount(observation) >= 5 ? 50 : 0;
  if (PRINT.guzma.test(value) || PRINT.raihan.test(value)) return hasSupporterInDiscard(observation) ? 75 : 0;
  if (PRINT.professorResearch.test(value) || PRINT.marnie.test(value) ||
      PRINT.lillie.test(value) || PRINT.iono.test(value)) return hasSupporterInDiscard(observation) ? 45 : 0;
  return 10;
}

function searchPriority(choice, observation, request, context) {
  const value = printingValue(choice);
  const own = observation?.ownPublic ?? {};
  const isQuickBall = /quick ball/i.test(context);
  if (PRINT.regidragoVstar.test(value) && boardHas(own, PRINT.regidragoV) &&
      !boardHas(own, PRINT.regidragoVstar)) return 250;
  if (PRINT.regidragoV.test(value) && !boardHas(own, PRINT.regidragoV)) return 240;
  if (PRINT.budew.test(value) && !boardHas(own, PRINT.budew)) return 215;
  if (PRINT.latias.test(value) && !boardHas(own, PRINT.latias) && hasBenchSpace(own)) return 175;
  if (PRINT.tapuLele.test(value) && !supporterInHand(observation) && hasBenchSpace(own)) return 160;
  if ((PRINT.dedenne.test(value) || PRINT.squawk.test(value)) &&
      handSize(observation) <= 3 && hasBenchSpace(own)) return 150;
  if (!isQuickBall && PRINT.noivern.test(value) && !discardHas(own, PRINT.noivern)) return 115;
  if (!isQuickBall && PRINT.dialga.test(value) && !discardHas(own, PRINT.dialga)) return 110;
  if (!isQuickBall && PRINT.salamence.test(value) && !discardHas(own, PRINT.salamence)) return 105;
  return 10;
}

function legacyStarPriority(choice, observation) {
  const value = printingValue(choice);
  if (PRINT.doubleDragon.test(value)) return ownEnergyCount(observation) < 4 ? 250 : 190;
  if (PRINT.compressor.test(value) && dragonPayloadCount(observation) < 2) return 230;
  if (PRINT.treasure.test(value) && !hasDragonPayload(observation)) return 215;
  if (PRINT.quickBall.test(value) && !boardHas(observation?.ownPublic, PRINT.regidragoV)) return 205;
  if (PRINT.regidragoVstar.test(value) || PRINT.regidragoV.test(value)) return 160;
  if (PRINT.guzma.test(value) || PRINT.raihan.test(value) ||
      PRINT.professorResearch.test(value) || PRINT.lillie.test(value) ||
      PRINT.marnie.test(value) || PRINT.iono.test(value)) return 145;
  return 30;
}

function superRodPriority(choice, observation) {
  const value = printingValue(choice);
  const own = observation?.ownPublic ?? {};
  if (PRINT.regidragoVstar.test(value) && !boardHas(own, PRINT.regidragoVstar)) return 230;
  if (PRINT.regidragoV.test(value) && !boardHas(own, PRINT.regidragoV)) return 220;
  if (PRINT.budew.test(value) && !boardHas(own, PRINT.budew)) return 185;
  if (PRINT.grassEnergy.test(value) || PRINT.fireEnergy.test(value)) return ownEnergyCount(observation) < 4 ? 170 : 100;
  if (PRINT.noivern.test(value) || PRINT.dialga.test(value) || PRINT.salamence.test(value) ||
      PRINT.kyurem.test(value) || PRINT.dragapult.test(value)) return 0;
  return 10;
}

function attackName(choice) {
  return choice?.publicMetadata?.sourceAttack ?? choice?.attackName ?? choice?.label ?? '';
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

function activeDamage(base, observation, attackerType = null) {
  const attacker = observation?.ownPublic?.active;
  const target = observation?.opponentPublic?.active;
  const type = attackerType ?? list(attacker?.printed?.types)[0] ?? 'Dragon';
  const beforeWeakness = Math.max(0, base +
    (list(attacker?.tools).some(tool => matches(tool, PRINT.muscleBand)) ? 20 : 0));
  return Math.max(0, beforeWeakness * weaknessMultiplier(target, type) - resistanceAmount(target, type));
}

function scoreDirectAttackChoice(choice, observation) {
  const name = attackName(choice);
  const own = observation?.ownPublic ?? {};
  const target = observation?.opponentPublic?.active;
  const targetHp = remainingHp(target);
  const gxUsed = own.publicTurnRestrictions?.gxUsed;
  if (name === 'Shred') {
    const damage = activeDamage(80, observation);
    const ko = targetHp > 0 && damage >= targetHp;
    return ko ? 150 : 85;
  }
  if (name === 'Timeless-GX') {
    if (gxUsed !== false) return -1;
    const damage = activeDamage(150, observation);
    const ko = targetHp > 0 && damage >= targetHp;
    return ko ? 270 : 205;
  }
  if (name === 'Overclock') return handSize(observation) < 6 ? 80 + (6 - handSize(observation)) * 8 : 15;
  if (name === 'Trifrost') {
    const evaluated = evaluateApexAttackChoice(choice, observation);
    return Number(evaluated?.score ?? -1);
  }
  return -1;
}

function chooseRank13ApexAttack(choices, observation) {
  const own = observation?.ownPublic ?? {};
  const opponent = observation?.opponentPublic ?? {};
  const target = opponent.active;
  const targetHp = remainingHp(target);
  const ranked = list(choices).map((choice, index) => {
    const name = attackName(choice);
    const meta = metadata(choice);
    if (meta.eligible === false || meta.attackCostPayable === false) {
      return { choice, index, score: -1 };
    }
    if (name === 'Phantom Dive') {
      return { choice, index, score: -1 }; // PutDamagePrompt is not accepted by the V3 worker.
    }
    if (name === 'Dragon Impact') {
      return { choice, index, score: -1 }; // Its follow-up discard prompt is not yet source-validated here.
    }
    if (name === 'Dominating Echo') {
      return { choice, index, score: opponentHasStadium(observation) ||
        opponentHasSpecialEnergy(observation) ? 260 : 185 };
    }
    if (name === 'Covert Flight') {
      return { choice, index, score: list(target?.printed?.subtypes).includes('Basic') ? 135 : 55 };
    }
    if (name === 'Wide Blast') {
      const lowBench = list(opponent.bench).filter(pokemon => {
        const hp = remainingHp(pokemon);
        return hp > 0 && hp <= 50;
      }).length;
      return { choice, index, score: lowBench >= 2 ? 190 + lowBench * 5 : 75 };
    }
    if (name === 'Eon Blade') {
      const damage = activeDamage(200, observation);
      const ko = targetHp > 0 && damage >= targetHp;
      return { choice, index, score: ko ? 275 : 120 + Math.min(40, damage / 5) };
    }
    if (name === 'Shred') {
      const evaluated = evaluateApexAttackChoice(choice, observation);
      const score = evaluated?.immediateWin ? 300 :
        (evaluated?.activeKnockout ? 285 : 95);
      return { choice, index, score };
    }
    if (name === 'Jet Headbutt') return { choice, index, score: 85 };
    if (name === 'Phantom Dive') return { choice, index, score: -1 };
    const evaluated = evaluateApexAttackChoice(choice, observation);
    return { choice, index, score: Number(evaluated?.score ?? -1) };
  }).filter(row => typeof row.choice?.token === 'string' && row.choice.token.length > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const best = ranked.find(row => row.score > 0);
  return best ? { kind: 'select-choice', token: best.choice.token } :
    { kind: 'abstain', reasonCode: 'NO_SUPPORTED_RANK13_APEX_ATTACK' };
}

function chooseAttack(choices, observation, context) {
  if (/apex dragon/i.test(context)) return chooseRank13ApexAttack(choices, observation);
  const ranked = list(choices).map((choice, index) => {
    const name = attackName(choice);
    const meta = metadata(choice);
    if (meta.eligible === false || meta.attackCostPayable === false) return { choice, index, score: -1 };
    if (name === 'Phantom Dive' || name === 'Dragon Impact') return { choice, index, score: -1 };
    if (name === 'Shred' || name === 'Timeless-GX' || name === 'Overclock' || name === 'Trifrost') {
      return { choice, index, score: scoreDirectAttackChoice(choice, observation) };
    }
    if (name === 'Dominating Echo') {
      return { choice, index, score: opponentHasStadium(observation) ||
        opponentHasSpecialEnergy(observation) ? 245 : 180 };
    }
    if (name === 'Covert Flight') {
      return { choice, index, score: list(observation?.opponentPublic?.active?.printed?.subtypes)
        .includes('Basic') ? 130 : 60 };
    }
    const evaluated = evaluateApexAttackChoice(choice, observation);
    return { choice, index, score: Number(evaluated?.score ?? -1) };
  }).filter(row => typeof row.choice?.token === 'string' && row.choice.token.length > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const best = ranked.find(row => row.score > 0);
  return best ? { kind: 'select-choice', token: best.choice.token } :
    { kind: 'abstain', reasonCode: 'NO_SUPPORTED_RANK13_ATTACK' };
}

function scoreAttack(item, observation) {
  const name = item?.attackName ?? metadata(item).sourceAttack ?? item?.label ?? '';
  const own = observation?.ownPublic ?? {};
  const opponent = observation?.opponentPublic ?? {};
  if (name === 'Apex Dragon') return hasDragonPayload(observation) ? 235 : 0;
  if (name === 'Itchy Pollen') return Number(opponent.handCount ?? 0) > 0 ? 225 : 190;
  if (name === 'Celestial Roar') {
    return Number(own.deckCount ?? 0) >= 3 && ownEnergyCount(observation) < 4 ? 135 : 65;
  }
  if (name === 'Overclock') {
    return handSize(observation) < 6 ? 80 + (6 - handSize(observation)) * 8 : 15;
  }
  if (name === 'Shred' || name === 'Timeless-GX') {
    return scoreDirectAttackChoice({ ...item, publicMetadata: {
      ...metadata(item), sourceAttack: name
    } }, observation);
  }
  if (name === 'Dominating Echo') {
    return opponentHasStadium(observation) || opponentHasSpecialEnergy(observation) ? 235 : 175;
  }
  if (name === 'Covert Flight') return list(opponent.active?.printed?.subtypes).includes('Basic') ? 125 : 55;
  if (name === 'Wide Blast') {
    const lowBench = list(opponent.bench).filter(pokemon => {
      const hp = remainingHp(pokemon);
      return hp > 0 && hp <= 50;
    }).length;
    return lowBench >= 2 ? 180 : 65;
  }
  if (name === 'Eon Blade') {
    const damage = activeDamage(200, observation);
    return remainingHp(opponent.active) > 0 && damage >= remainingHp(opponent.active) ? 220 : 105;
  }
  if (name === 'Phantom Dive' || name === 'Dragon Impact') return 0;
  return 0;
}

function scoreAction(item, request) {
  const observation = request?.observation ?? {};
  const own = observation.ownPublic ?? {};
  const opponent = observation.opponentPublic ?? {};
  const hand = handSize(observation);
  const ownBench = list(own.bench).filter(Boolean);
  const opponentBench = list(opponent.bench).filter(Boolean);
  const printing = actionPrinting(item);
  const priorKO = priorOpponentTurnKO(request);
  const active = own.active;

  if (item.kind === 'attack') return scoreAttack(item, observation);
  if (item.kind === 'pass') return 0;

  if (item.kind === 'retreat') {
    const isPivot = matches(active, PRINT.budew) || matches(active, PRINT.dedenne) ||
      matches(active, PRINT.squawk) || matches(active, PRINT.tapuLele);
    if (isPivot && (boardHas(own, PRINT.regidragoVstar) || boardHas(own, PRINT.regidragoV))) {
      return boardHas(own, PRINT.latias) ? 165 : 100;
    }
    return 0;
  }

  if (item.kind === 'use-ability') {
    const effect = metadata(item).abilityName ?? item.label ?? '';
    if (/Legacy Star/i.test(effect)) return own.publicTurnRestrictions?.vstarUsed === false ? 245 : 0;
    if (/Wonder Tag/i.test(effect)) return !supporterInHand(observation) ? 180 : 0;
    if (/Dedechange/i.test(effect)) return hand <= 3 ? 175 : 0;
    if (/Squawk and Seize/i.test(effect)) return observation.globalTurn <= 2 && hand <= 3 ? 185 : 0;
    return 0;
  }

  if (item.kind === 'use-stadium') {
    if (matches(printing, PRINT.parallelCity)) return opponentBench.length >= 4 ? 145 : 0;
    return 0; // Silent Lab is deliberately not played: own Basic Ability lock is not modeled.
  }

  if (item.kind !== 'play-card') return 0;

  if (matches(printing, PRINT.regidragoV)) {
    return !boardHas(own, PRINT.regidragoV) && hasBenchSpace(own) ? 240 : 0;
  }
  if (matches(printing, PRINT.regidragoVstar)) {
    return boardHas(own, PRINT.regidragoV) && !boardHas(own, PRINT.regidragoVstar) ? 250 : 0;
  }
  if (matches(printing, PRINT.budew)) return !boardHas(own, PRINT.budew) && hasBenchSpace(own) ? 220 : 0;
  if (matches(printing, PRINT.battleVip)) return observation.globalTurn <= 2 && hasBenchSpace(own) ? 230 : 0;
  if (matches(printing, PRINT.compressor)) return dragonPayloadCount(observation) < 2 ? 210 : 80;
  if (matches(printing, PRINT.treasure)) {
    return !boardHas(own, PRINT.regidragoVstar) || !hasDragonPayload(observation) ? 185 : 90;
  }
  if (matches(printing, PRINT.quickBall)) {
    return !boardHas(own, PRINT.regidragoV) ? 185 : (!boardHas(own, PRINT.budew) ? 155 : 75);
  }
  if (matches(printing, PRINT.megatonBlower)) {
    return opponentHasToolsOrSpecialEnergy(observation) ? 235 : 0;
  }
  if (matches(printing, PRINT.guzma)) return opponentBench.length > 0 ? 195 : 0;
  if (matches(printing, PRINT.echoingHorn)) {
    const valuableBasic = list(opponent.discard).some(card =>
      /Shadow Rider Calyrex V CRE 74|Dialga-GX UPR 100|Tapu Lele-GX GRI 60|Latias ex SSP 76|Mimikyu GRI 58/i
        .test(printingValue(card)));
    // Echoing Horn revives an opponent Basic onto their Bench, not ours.
    return valuableBasic && hasBenchSpace(opponent) ? 145 : 0;
  }
  if (matches(printing, PRINT.muscleBand)) {
    return (matches(active, PRINT.regidragoVstar) || matches(active, PRINT.regidragoV) ||
      matches(active, PRINT.dialga) || matches(active, PRINT.kyurem)) &&
      !list(active.tools).some(tool => matches(tool, PRINT.muscleBand)) ? 150 : 25;
  }
  if (matches(printing, PRINT.parallelCity)) return opponentBench.length >= 4 ? 145 : 0;
  if (matches(printing, PRINT.silentLab)) return 0;
  if (matches(printing, PRINT.lillie)) return hand <= 4 ? 190 : (hand <= 5 && own.prizeCount === 6 ? 170 : 0);
  if (matches(printing, PRINT.professorResearch)) return hand <= 3 ? 175 : 0;
  if (matches(printing, PRINT.marnie)) {
    return hand <= 4 && Number(opponent.handCount ?? 0) >= 3 ? 170 : (hand <= 3 ? 150 : 0);
  }
  if (matches(printing, PRINT.iono)) return hand <= 4 || Number(opponent.handCount ?? 0) >= 5 ? 160 : 0;
  if (matches(printing, PRINT.crispin)) return ownEnergyCount(observation) < 3 ? 155 : 45;
  if (matches(printing, PRINT.raihan)) {
    const basicEnergyInDiscard = list(own.discard).some(card =>
      matches(card, PRINT.grassEnergy) || matches(card, PRINT.fireEnergy));
    return priorKO && basicEnergyInDiscard ? 180 : 0;
  }
  if (matches(printing, PRINT.vsSeeker)) return hasSupporterInDiscard(observation) ? 125 : 0;
  if (matches(printing, PRINT.superRod)) {
    return list(own.discard).some(card =>
      /Regidrago V|Regidrago VSTAR|Budew|Grass Energy|Fire Energy/i.test(printingValue(card))) ? 115 : 0;
  }
  if (matches(printing, PRINT.heavyBall)) {
    return list(own.prizeSlots).some(slot => typeof slot?.printing === 'string') ? 120 : 0;
  }
  if (matches(printing, PRINT.tapuLele)) return !supporterInHand(observation) && hasBenchSpace(own) ? 155 : 0;
  if (matches(printing, PRINT.dedenne)) {
    return hand <= 3 && hasBenchSpace(own) ? 165 : 0;
  }
  // Squawk and Seize can only fire on this player's first turn; late
  // Squawkabilly ex is otherwise an unnecessary two-Prize Bench liability.
  if (matches(printing, PRINT.squawk)) {
    return observation.globalTurn <= 2 && hand <= 3 && hasBenchSpace(own) ? 165 : 0;
  }
  if (matches(printing, PRINT.latias)) return !boardHas(own, PRINT.latias) && hasBenchSpace(own) ? 140 : 0;
  if (matches(printing, PRINT.dialga)) return !boardHas(own, PRINT.dialga) && hasBenchSpace(own) ? 105 : 0;
  return 0;
}

function promptDecision(request) {
  const prompt = request.prompt;
  const choices = list(prompt?.choices);
  const meta = metadata(prompt);
  const context = sourceText(prompt);
  const observation = request.observation;
  const own = observation?.ownPublic ?? {};
  const minimum = Number.isSafeInteger(meta.minimumCount) ? meta.minimumCount :
    (Number.isSafeInteger(meta.requiredCount) ? meta.requiredCount : 1);
  const maximum = Number.isSafeInteger(meta.maximumCount) ? meta.maximumCount :
    (Number.isSafeInteger(meta.count) ? meta.count : minimum);

  if (prompt.promptType === 'PutDamagePrompt') {
    return { kind: 'abstain', reasonCode: 'RANK13_PUT_DAMAGE_UNSUPPORTED' };
  }

  if (prompt.promptType === 'ChooseAttackPrompt') {
    return chooseAttack(choices, observation, context);
  }

  if (meta.selectionType === 'card-combination' || meta.selectionType === 'pokemon' ||
      meta.selectionType === 'card-order' || meta.selectionType === 'energy-payment' ||
      meta.selectionType === 'prize-slots') {
    if (/battle compressor/i.test(context)) {
      const priority = choice => {
        const value = printingValue(choice);
        if (PRINT.noivern.test(value) && !discardHas(own, PRINT.noivern)) return 250;
        if (PRINT.dialga.test(value) && !discardHas(own, PRINT.dialga)) return 240;
        if (PRINT.salamence.test(value) && !discardHas(own, PRINT.salamence)) return 230;
        if (PRINT.kyurem.test(value) && !discardHas(own, PRINT.kyurem)) return 205;
        if (PRINT.dragapult.test(value) && !discardHas(own, PRINT.dragapult)) return 40;
        return 0;
      };
      return selectMany(choices, priority, minimum, maximum, 'NO_RANK13_COMPRESSOR_PAYLOAD');
    }

    if (/quick ball|mysterious treasure/i.test(context) && /discard/i.test(context)) {
      return selectMany(choices, choice => discardCostPriority(choice, observation), minimum, maximum,
        'NO_RANK13_SAFE_DISCARD');
    }

    if (/battle vip pass|quick ball|mysterious treasure/i.test(context) && /search|basic|dragon|psychic/i.test(context)) {
      return selectMany(choices, choice => searchPriority(choice, observation, request, context), minimum, maximum,
        'NO_RANK13_SEARCH_TARGET');
    }

    if (/legacy star/i.test(context)) {
      return selectMany(choices, choice => legacyStarPriority(choice, observation), minimum, maximum,
        'NO_RANK13_LEGACY_STAR_TARGET');
    }

    if (/vs seeker/i.test(context)) {
      return selectMany(choices, choice => {
        const value = printingValue(choice);
        if (PRINT.guzma.test(value) && list(observation?.opponentPublic?.bench).some(Boolean)) return 240;
        if (PRINT.raihan.test(value) && priorOpponentTurnKO(request)) return 225;
        if (PRINT.lillie.test(value) || PRINT.professorResearch.test(value)) return handSize(observation) <= 3 ? 200 : 155;
        if (PRINT.marnie.test(value) || PRINT.iono.test(value)) return 150;
        if (PRINT.crispin.test(value)) return 135;
        return 10;
      }, minimum, maximum, 'NO_RANK13_SUPPORTER_RECOVERY');
    }

    if (/super rod/i.test(context)) {
      return selectMany(choices, choice => superRodPriority(choice, observation), minimum, maximum,
        'NO_RANK13_SUPER_ROD_TARGET');
    }

    if (/guzma/i.test(context) && meta.selectionType === 'pokemon') {
      return selectMany(choices, choice => gustChoicePriority(choice, observation), minimum, maximum,
        'NO_RANK13_GUZMA_TARGET');
    }

    if (/echoing horn/i.test(context) && meta.selectionType === 'pokemon') {
      return selectMany(choices, choice =>
        candidateTargetPriority(targetPokemonFromChoice(choice, observation), observation),
      minimum, maximum, 'NO_RANK13_ECHOING_HORN_TARGET');
    }

    if (/hisuian heavy ball/i.test(context) && meta.selectionType === 'prize-slots') {
      return selectMany(choices, choice => {
        const value = printingValue(choice);
        if (/face-down|unknown|prize slot/i.test(value)) return 0;
        if (PRINT.regidragoV.test(value) || PRINT.dedenne.test(value) ||
            PRINT.tapuLele.test(value) || PRINT.latias.test(value) || PRINT.budew.test(value)) return 230;
        return 40;
      }, minimum, maximum, 'RANK13_PRIZE_IDENTITY_NOT_VISIBLE');
    }

    if (/parallel city/i.test(context)) {
      return selectMany(choices, choice =>
        /opponent.*bench|bench.*3|three/i.test(choice.label ?? '') ? 220 : 0,
      minimum, maximum, 'NO_RANK13_PARALLEL_CITY_MODE');
    }

    if (/crispin/i.test(context)) {
      return selectMany(choices, choice => {
        const value = printingValue(choice);
        if (PRINT.grassEnergy.test(value)) return 210;
        if (PRINT.fireEnergy.test(value)) return 200;
        return 0;
      }, minimum, maximum, 'NO_RANK13_CRISPIN_ENERGY');
    }

    if (/raihan/i.test(context)) {
      if (meta.selectionType === 'pokemon') {
        return selectMany(choices, choice => {
          const value = printingValue(choice);
          if (PRINT.regidragoVstar.test(value)) return 240;
          if (PRINT.regidragoV.test(value)) return 225;
          return 20;
        }, minimum, maximum, 'NO_RANK13_RAIHAN_ATTACH_TARGET');
      }
      const isSearch = meta.sourceZone === 'deck' || meta.zone === 'deck' ||
        choices.some(choice => PRINT.regidragoVstar.test(printingValue(choice)) ||
          PRINT.compressor.test(printingValue(choice)) || PRINT.treasure.test(printingValue(choice)));
      if (isSearch) {
        return selectMany(choices, choice => {
          const value = printingValue(choice);
          if (PRINT.doubleDragon.test(value) && ownEnergyCount(observation) < 4) return 250;
          if (PRINT.compressor.test(value) && dragonPayloadCount(observation) < 2) return 240;
          if (PRINT.treasure.test(value) && !hasDragonPayload(observation)) return 230;
          if (PRINT.regidragoVstar.test(value) && boardHas(own, PRINT.regidragoV) &&
              !boardHas(own, PRINT.regidragoVstar)) return 225;
          if (PRINT.regidragoV.test(value) && !boardHas(own, PRINT.regidragoV)) return 220;
          if (PRINT.guzma.test(value)) return 175;
          return 20;
        }, minimum, maximum, 'NO_RANK13_RAIHAN_SEARCH_TARGET');
      }
      return selectMany(choices, choice => {
        const value = printingValue(choice);
        if (PRINT.grassEnergy.test(value) || PRINT.fireEnergy.test(value)) return 210;
        return 0;
      }, minimum, maximum, 'NO_RANK13_RAIHAN_ENERGY');
    }

    if (/crispin/i.test(context) && meta.selectionType === 'pokemon') {
      return selectMany(choices, choice => {
        const value = printingValue(choice);
        if (PRINT.regidragoVstar.test(value)) return 240;
        if (PRINT.regidragoV.test(value)) return 225;
        return 20;
      }, minimum, maximum, 'NO_RANK13_CRISPIN_ATTACH_TARGET');
    }

    if (/dragon impact/i.test(context)) {
      return selectMany(choices, choice => {
        const value = printingValue(choice);
        if (PRINT.grassEnergy.test(value) || PRINT.fireEnergy.test(value)) return 220;
        if (PRINT.doubleDragon.test(value)) return 90;
        return 0;
      }, minimum, maximum, 'NO_RANK13_DRAGON_IMPACT_ENERGY');
    }

    if (/trifrost/i.test(context) && meta.selectionType === 'pokemon') {
      return selectMany(choices, choice => {
        const pokemon = targetPokemonFromChoice(choice, observation);
        const hp = remainingHp(pokemon);
        return hp > 0 ? 220 - hp / 10 + candidateTargetPriority(pokemon, observation) / 10 : 0;
      }, minimum, maximum, 'NO_RANK13_TRIFROST_TARGET');
    }

    if (/wonder tag/i.test(context)) {
      return selectMany(choices, choice => {
        const value = printingValue(choice);
        if (PRINT.lillie.test(value) && handSize(observation) <= 4) return 230;
        if (PRINT.professorResearch.test(value) && handSize(observation) <= 3) return 220;
        if (PRINT.guzma.test(value) && list(observation?.opponentPublic?.bench).some(Boolean)) return 210;
        if (PRINT.marnie.test(value) || PRINT.iono.test(value)) return 170;
        return 20;
      }, minimum, maximum, 'NO_RANK13_WONDER_TAG_SUPPORTER');
    }

    if (/mysterious treasure|quick ball|battle vip pass|search/i.test(context)) {
      return selectMany(choices, choice => searchPriority(choice, observation, request, context), minimum, maximum,
        'NO_RANK13_SEARCH_TARGET');
    }

    if (meta.selectionType === 'energy-payment') {
      return selectMany(choices, choice => {
        const value = printingValue(choice);
        if (PRINT.grassEnergy.test(value) || PRINT.fireEnergy.test(value)) return 160;
        if (PRINT.doubleDragon.test(value)) return 100;
        return 20;
      }, minimum, maximum, 'NO_RANK13_ENERGY_PAYMENT');
    }

    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_RANK13_MULTI_SELECT_SOURCE' };
  }

  if (prompt.promptType === 'ConfirmPrompt' || prompt.promptType === 'SelectPrompt' ||
      prompt.promptType === 'SelectOptionPrompt') {
    if (/parallel city/i.test(context)) {
      return selectOne(choices, choice =>
        /opponent.*bench|bench.*3|three/i.test(choice.label ?? '') ? 220 : 0,
      'NO_RANK13_PARALLEL_CITY_MODE');
    }
    const yes = choices.find(choice => /^(yes|true|confirm)$/i.test(choice.label ?? ''));
    const no = choices.find(choice => /^(no|false|decline|cancel)$/i.test(choice.label ?? ''));
    if (/dedechange|squawk and seize/i.test(context) && yes && handSize(observation) <= 3) {
      return { kind: 'select-choice', token: yes.token };
    }
    if (/wonder tag/i.test(context) && yes && !supporterInHand(observation)) {
      return { kind: 'select-choice', token: yes.token };
    }
    if (no) return { kind: 'select-choice', token: no.token };
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_RANK13_OPTIONAL_PROMPT' };
  }

  return { kind: 'abstain', reasonCode: 'UNSUPPORTED_RANK13_PROMPT_TYPE' };
}

function bestAction(request) {
  const items = list(request.actionFrontier?.items).filter(item => EXECUTABLE.has(item.kind));
  if (items.length === 0) return { kind: 'abstain', reasonCode: 'NO_RANK13_EXECUTABLE_ACTION' };
  const ranked = items.map((item, index) => ({
    item, index, score: scoreAction(item, request)
  })).sort((a, b) => b.score - a.score || a.index - b.index);
  if (ranked[0]?.score > 0) return { kind: 'select-action', token: ranked[0].item.token };
  const pass = items.find(item => item.kind === 'pass');
  return pass ? { kind: 'select-action', token: pass.token } :
    { kind: 'abstain', reasonCode: 'NO_SUPPORTED_RANK13_ACTION' };
}

function createPolicy({ role, seat, policyVersion, config }) {
  const configKeys = config && typeof config === 'object' && !Array.isArray(config)
    ? Object.keys(config) : null;
  if (role !== 'opponent' || (seat !== 0 && seat !== 1) ||
      policyVersion !== POLICY_VERSION || configKeys === null || configKeys.length !== 0) {
    throw new Error('AGENT24_RANK13_POLICY_INIT_MISMATCH');
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
  POLICY_VERSION, SOURCE_RANK, SOURCE_FINGERPRINT_SHA256,
  CANDIDATE_FINGERPRINT_SHA256, SOURCE_LIST_BLOB_SHA1,
  CANDIDATE_LIST_BLOB_SHA1, ENGINE_PIN, WORKER_PROTOCOL_BLOB_SHA1,
  APEX_HELPER_BLOB_SHA1, createPolicy, scoreAction, scoreAttack,
  promptDecision, bestAction, chooseRank13ApexAttack, hasDragonPayload
};
