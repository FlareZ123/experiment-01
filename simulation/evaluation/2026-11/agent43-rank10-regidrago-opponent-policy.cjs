'use strict';

/*
 * Aichi diagnostic rank-10 Regidrago opponent-role policy prototype.
 * Actor-view-only and deterministic. Native Twinleaf remains the legality
 * authority. This is a starting policy, not a competitive-strength claim.
 */

const POLICY_VERSION = 'agent43-rank10-regidrago-opponent-v1';
const { chooseApexAttack } = require('./agent43-regidrago-apex-choice.cjs');

const PRINT = Object.freeze({
  regidragoV: /^Regidrago V SIT 135\b/i,
  regidragoVstar: /^Regidrago VSTAR SIT 136\b/i,
  budew: /^Budew ASC 16\b/i,
  dragapult: /^Dragapult ex TWM 130\b/i,
  dialga: /^Dialga-GX UPR 100\b/i,
  koraidon: /^Koraidon ex TEF 120\b/i,
  kyurem: /^Kyurem SFA 47\b/i,
  goodra: /^Hisuian Goodra VSTAR LOR 136\b/i,
  dedenne: /^Dedenne-GX UNB 57\b/i,
  squawk: /^Squawkabilly ex PAL 169\b/i,
  tapuLele: /^Tapu Lele-GX GRI 60\b/i,
  latias: /^Latias ex SSP 76\b/i,
  marshadow: /^Marshadow UNB 81\b/i,
  wobbuffet: /^Wobbuffet PHF 36\b/i,
  battleVip: /^Battle VIP Pass FST 225\b/i,
  quickBall: /^Quick Ball SSH 179\b/i,
  treasure: /^Mysterious Treasure FLI 113\b/i,
  compressor: /^Battle Compressor PHF 92\b/i,
  heavyBall: /^Hisuian Heavy Ball ASR 146\b/i,
  primeCatcher: /^Prime Catcher TEF 157\b/i,
  muscleBand: /^Muscle Band XY 121\b/i,
  parallelCity: /^Parallel City BKT 145\b/i,
  doubleDragon: /^Double Dragon Energy ROS 97\b/i,
  grassEnergy: /^Grass Energy MEE\b/i,
  fireEnergy: /^Fire Energy MEE\b/i,
  research: /^Professor's Research /i,
  guzma: /^Guzma BUS 115\b/i,
  raihan: /^Raihan EVS 152\b/i,
  crispin: /^Crispin SCR 133\b/i,
  faba: /^Faba LOT 208\b/i,
  iono: /^Iono PAL 185\b/i,
  carmine: /^Carmine TWM 145\b/i,
  lillie: /^Lillie's Determination /i,
  marnie: /^Marnie CPA 56\b/i,
  superRod: /^Super Rod PAL 188\b/i,
  vsSeeker: /^VS Seeker PHF 109\b/i,
});

const EXECUTABLE = new Set(['play-card', 'attack', 'retreat', 'use-ability', 'use-stadium', 'pass']);

function list(value) { return Array.isArray(value) ? value : []; }
function printingValue(value) {
  if (typeof value === 'string') return value;
  if (typeof value?.printing === 'string') return value.printing;
  if (typeof value?.fullName === 'string') return value.fullName;
  if (typeof value?.publicMetadata?.cardPrinting === 'string') return value.publicMetadata.cardPrinting;
  if (typeof value?.publicMetadata?.targetPrinting === 'string') return value.publicMetadata.targetPrinting;
  if (typeof value?.publicMetadata?.printing === 'string') return value.publicMetadata.printing;
  if (typeof value?.publicMetadata?.sourcePrinting === 'string') return value.publicMetadata.sourcePrinting;
  return '';
}
function matches(value, pattern) { return pattern.test(printingValue(value)); }
function boardSlots(player) { return [player?.active, ...list(player?.bench)].filter(Boolean); }
function boardHas(player, pattern) { return boardSlots(player).some(pokemon => matches(pokemon, pattern)); }
function boardCount(player, pattern) { return boardSlots(player).filter(pokemon => matches(pokemon, pattern)).length; }
function hasBenchSpace(player) { const bench = list(player?.bench); return bench.length < 5 || bench.some(slot => !slot); }
function discardHas(player, pattern) { return list(player?.discard).some(card => matches(card, pattern)); }
function handHas(hand, pattern) { return list(hand).some(card => matches(card, pattern)); }
function handSize(observation) { return list(observation?.ownHand).length; }
function remainingHp(pokemon) {
  if (!pokemon || !Number.isFinite(pokemon.hp) || !Number.isFinite(pokemon.damage)) return -1;
  return pokemon.hp - pokemon.damage;
}
function metadata(item) { return item?.publicMetadata ?? {}; }
function actionPrinting(item) { return item?.actorPrinting ?? item?.targetPrinting ?? metadata(item).sourcePrinting ?? item?.label ?? ''; }
function sourceText(prompt) {
  return [prompt?.source?.effectName, prompt?.source?.sourceEffect, prompt?.source?.sourceAttack,
    prompt?.source?.printing, prompt?.source?.sourcePrinting, prompt?.source?.cardPrinting,
    prompt?.source?.label, prompt?.publicMetadata?.sourceEffect, prompt?.publicMetadata?.effectName,
    prompt?.publicMetadata?.cardPrinting].filter(Boolean).join(' ').toLowerCase();
}
function opponentThreats(observation) {
  const opponent = observation?.opponentPublic ?? {};
  return {
    mimikyu: boardHas(opponent, /^Mimikyu GRI 58\b/i),
    clefairy: boardHas(opponent, /^Lillie's Clefairy ex JTG 56\b/i)
  };
}
function payloadCount(own) {
  return [PRINT.dragapult, PRINT.dialga, PRINT.koraidon, PRINT.kyurem, PRINT.goodra]
    .filter(pattern => discardHas(own, pattern)).length;
}
function stadiumName(observation) {
  return [...list(observation?.ownPublic?.stadium), ...list(observation?.opponentPublic?.stadium)]
    .map(printingValue).join(' ');
}
function hasSupporterInHand(observation) {
  return list(observation?.ownHand).some(card => /Supporter/i.test(printingValue(card)) ||
    /Professor's Research|Guzma|Iono|Carmine|Raihan|Crispin|Faba|Marnie|Lillie's Determination/i.test(printingValue(card)));
}
function ownEnergyCount(observation) {
  return boardSlots(observation?.ownPublic).reduce((sum, pokemon) => sum + list(pokemon.energies).length, 0);
}
function hasRegidragoReady(observation) {
  const own = observation?.ownPublic ?? {};
  return boardHas(own, PRINT.regidragoVstar) || boardHas(own, PRINT.regidragoV);
}
function candidateTargetPriority(pokemon, observation) {
  if (matches(pokemon, /^Mimikyu GRI 58\b/i)) {
    return discardHas(observation.opponentPublic, PRINT.dialga) ? 240 : 200;
  }
  if (matches(pokemon, /^Lillie's Clefairy ex JTG 56\b/i)) return 190;
  if (matches(pokemon, /^Shadow Rider Calyrex VMAX CRE 75\b/i)) return 150;
  if (matches(pokemon, /^Latias ex SSP 76\b/i)) return 120;
  return 50 + Math.max(0, 200 - remainingHp(pokemon)) / 10;
}
function rankChoices(choices, score, limit) {
  return list(choices).map((choice, index) => ({ choice, index, score: score(choice) }))
    .filter(row => row.score > 0 && typeof row.choice?.token === 'string')
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, Number.isSafeInteger(limit) ? limit : list(choices).length);
}
function selectOne(choices, score, reasonCode) {
  const best = rankChoices(choices, score, 1)[0];
  return best ? { kind: 'select-choice', token: best.choice.token } : { kind: 'abstain', reasonCode };
}
function selectMany(choices, score, minimum, maximum, reasonCode) {
  const selected = rankChoices(choices, score, maximum).map(row => row.choice.token);
  if (selected.length < minimum) return { kind: 'abstain', reasonCode };
  return { kind: 'select-choices', tokens: selected };
}

function supporterPriority(choice, observation) {
  const value = printingValue(choice);
  const threats = opponentThreats(observation);
  if (PRINT.guzma.test(value)) return threats.mimikyu || threats.clefairy ? 240 : 90;
  if (PRINT.primeCatcher.test(value)) return threats.mimikyu || threats.clefairy ? 250 : 120;
  if (PRINT.research.test(value) || PRINT.iono.test(value) || PRINT.carmine.test(value) ||
      PRINT.lillie.test(value) || PRINT.marnie.test(value)) return handSize(observation) <= 3 ? 190 : 80;
  if (PRINT.crispin.test(value)) return ownEnergyCount(observation) < 3 ? 180 : 75;
  if (PRINT.raihan.test(value)) return 155;
  if (PRINT.faba.test(value)) return 140;
  return 30;
}

function discardCostPriority(choice, observation) {
  const value = printingValue(choice);
  const own = observation?.ownPublic ?? {};
  if (PRINT.dragapult.test(value) || PRINT.dialga.test(value) || PRINT.koraidon.test(value) ||
      PRINT.kyurem.test(value) || PRINT.goodra.test(value)) {
    const pattern = [PRINT.dragapult, PRINT.dialga, PRINT.koraidon, PRINT.kyurem, PRINT.goodra]
      .find(candidate => candidate.test(value));
    return discardHas(own, pattern) ? 180 : 0;
  }
  if (/Grass Energy|Fire Energy/i.test(value)) return ownEnergyCount(observation) >= 4 ? 150 : 70;
  if (/Double Dragon Energy/i.test(value)) return ownEnergyCount(observation) >= 5 ? 130 : 0;
  if (/Professor's Research|Marnie|Iono|Carmine|Lillie's Determination/i.test(value)) {
    return list(observation?.ownHand).filter(card => /Professor's Research|Marnie|Iono|Carmine|Lillie's Determination/i.test(printingValue(card))).length > 1 ? 120 : 35;
  }
  if (/Budew ASC 16/i.test(value) && boardHas(own, PRINT.budew)) return 95;
  return 20;
}

function scoreAttack(item, observation) {
  const name = item?.attackName ?? metadata(item).sourceAttack ?? item?.label ?? '';
  const own = observation?.ownPublic ?? {};
  if (name === 'Apex Dragon') return payloadCount(own) > 0 ? 210 : 75;
  if (name === 'Itchy Pollen') return 205;
  if (name === 'Dragon Laser') return 105;
  if (name === 'Celestial Roar') return ownEnergyCount(observation) < 4 ? 125 : 35;
  return 0;
}

function scoreAction(item, request) {
  const observation = request.observation;
  const own = observation.ownPublic;
  const opponent = observation.opponentPublic;
  const threats = opponentThreats(observation);
  const printing = actionPrinting(item);
  const hand = handSize(observation);
  const turn = Number(observation.globalTurn ?? 0);
  const active = own.active;
  const activeIsBudew = matches(active, PRINT.budew);
  const vstarUsed = own.publicTurnRestrictions?.vstarUsed;

  if (item.kind === 'attack') return scoreAttack(item, observation);
  if (item.kind === 'pass') return 0;

  if (item.kind === 'retreat') {
    if (activeIsBudew && hasRegidragoReady(observation) && boardHas(own, PRINT.latias)) return 145;
    if ((matches(active, PRINT.dedenne) || matches(active, PRINT.squawk) || matches(active, PRINT.tapuLele)) &&
        hasRegidragoReady(observation)) return 110;
    return 0;
  }

  if (item.kind === 'use-ability') {
    const effect = metadata(item).sourceEffect ?? metadata(item).abilityName ?? item.label ?? '';
    if (/Legacy Star/i.test(effect) && vstarUsed === false) return 220;
    if (/Dedechange|Squawk and Seize/i.test(effect) && hand <= 3) return 160;
    if (/Resetting Hole/i.test(effect) && /Sky Field|Parallel City/i.test(stadiumName(observation))) return 125;
    return 0;
  }

  if (item.kind === 'use-stadium') {
    return matches(printing, PRINT.parallelCity) && list(opponent.bench).filter(Boolean).length >= 3 ? 95 : 0;
  }

  if (item.kind !== 'play-card') return 0;

  if (matches(printing, PRINT.battleVip)) return turn <= 1 && !boardHas(own, PRINT.regidragoV) && hasBenchSpace(own) ? 210 : 0;
  if (matches(printing, PRINT.regidragoV)) return !boardHas(own, PRINT.regidragoV) && hasBenchSpace(own) ? 185 : 0;
  if (matches(printing, PRINT.regidragoVstar)) return boardHas(own, PRINT.regidragoV) && !boardHas(own, PRINT.regidragoVstar) ? 205 : 0;
  if (matches(printing, PRINT.budew)) return !boardHas(own, PRINT.budew) && hasBenchSpace(own) ? 190 : 0;
  if (matches(printing, PRINT.latias)) return !boardHas(own, PRINT.latias) && hasBenchSpace(own) ? 140 : 0;
  if (matches(printing, PRINT.compressor)) return payloadCount(own) < 3 ? 170 : 65;
  if (matches(printing, PRINT.treasure)) return !boardHas(own, PRINT.regidragoVstar) ? 150 : 90;
  if (matches(printing, PRINT.quickBall)) return !boardHas(own, PRINT.regidragoV) || !boardHas(own, PRINT.budew) ? 140 : 55;
  if (matches(printing, PRINT.dedenne) || matches(printing, PRINT.squawk)) return hand <= 3 ? 155 : 35;
  if (matches(printing, PRINT.tapuLele)) return !hasSupporterInHand(observation) ? 135 : 40;
  const gustPriority = threats.mimikyu ? (discardHas(opponent, PRINT.dialga) ? 250 : 230) :
    (threats.clefairy ? 225 : 95);
  if (matches(printing, PRINT.guzma)) return gustPriority - 10;
  if (matches(printing, PRINT.primeCatcher)) return gustPriority;
  if (matches(printing, PRINT.muscleBand)) return matches(active, PRINT.regidragoVstar) && !list(active.tools).some(tool => matches(tool, PRINT.muscleBand)) ? 120 : 35;
  if (matches(printing, PRINT.parallelCity)) return list(opponent.bench).filter(Boolean).length >= 3 ? 105 : 35;
  if (matches(printing, PRINT.faba)) return boardSlots(opponent).some(pokemon =>
    list(pokemon.tools).some(tool => /Stealthy Hood|Float Stone/i.test(printingValue(tool)))) ? 130 : 35;
  if (matches(printing, PRINT.marshadow)) return /Sky Field/i.test(stadiumName(observation)) ? 130 : 35;
  if (matches(printing, PRINT.crispin)) return ownEnergyCount(observation) < 3 ? 135 : 55;
  if (matches(printing, PRINT.raihan)) return request.publicEventReceipt?.priorOpponentTurnKO?.any === true ? 155 : 40;
  if (matches(printing, PRINT.research) || matches(printing, PRINT.iono) || matches(printing, PRINT.carmine) ||
      matches(printing, PRINT.lillie) || matches(printing, PRINT.marnie)) return hand <= 4 ? 130 : 35;
  if (matches(printing, PRINT.vsSeeker)) return list(own.discard).some(card => /Guzma|Professor's Research|Raihan|Crispin/i.test(printingValue(card))) ? 110 : 35;
  if (matches(printing, PRINT.superRod)) return list(own.discard).some(card => /Energy|Regidrago|Dragapult|Dialga|Koraidon|Kyurem|Goodra/i.test(printingValue(card))) ? 95 : 25;
  if (matches(printing, PRINT.heavyBall)) return 100;
  if (matches(printing, PRINT.wobbuffet)) return 45;
  return 0;
}

function ownSwitchPriority(choice, observation) {
  const pokemon = targetPokemonFromChoice(choice, observation);
  if (matches(pokemon, PRINT.regidragoVstar)) return 220;
  if (matches(pokemon, PRINT.regidragoV) && list(pokemon.energies).length > 0) return 190;
  if (matches(pokemon, PRINT.latias)) return 130;
  if (matches(pokemon, PRINT.budew)) return 70;
  return 30 + Math.max(0, 200 - remainingHp(pokemon)) / 20;
}

function gustChoicePriority(choice, observation) {
  if (choice?.publicMetadata?.ownerSeat === 'actor') {
    return ownSwitchPriority(choice, observation);
  }
  return candidateTargetPriority(choice, observation);
}

function targetPokemonFromChoice(choice, observation) {
  const meta = choice?.publicMetadata ?? {};
  if (meta.targetPokemon) return meta.targetPokemon;
  const owner = meta.ownerSeat;
  const zone = meta.zone;
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

function promptDecision(request) {
  const prompt = request.prompt;
  const choices = list(prompt?.choices);
  const metadata = prompt?.publicMetadata ?? {};
  const context = sourceText(prompt);
  const own = request.observation.ownPublic;
  const min = Number.isSafeInteger(metadata.minimumCount) ? metadata.minimumCount : 1;
  const max = Number.isSafeInteger(metadata.maximumCount) ? metadata.maximumCount :
    (Number.isSafeInteger(metadata.count) ? metadata.count : min);

  if (prompt.promptType === 'ChooseAttackPrompt' && /apex dragon/i.test(context)) {
    return chooseApexAttack(choices, request.observation);
  }

  if (metadata.selectionType === 'card-combination' || metadata.selectionType === 'pokemon' ||
      metadata.selectionType === 'card-order' || metadata.selectionType === 'energy-payment') {
    if (/wonder tag|vs seeker/i.test(context)) {
      return selectMany(choices, choice => supporterPriority(choice, request.observation), min, max,
        'NO_SUPPORTER_TARGET');
    }
    if (/super rod/i.test(context)) {
      return selectMany(choices, choice => {
        const value = printingValue(choice);
        if (PRINT.grassEnergy.test(value) || PRINT.fireEnergy.test(value)) return 180;
        if (PRINT.regidragoVstar.test(value) || PRINT.regidragoV.test(value)) return 170;
        if (PRINT.dragapult.test(value) || PRINT.dialga.test(value) || PRINT.koraidon.test(value) ||
            PRINT.goodra.test(value) || PRINT.kyurem.test(value)) return 150;
        return 20;
      }, min, max, 'NO_SUPER_ROD_RECOVERY');
    }
    if (/raihan/i.test(context)) {
      return selectMany(choices, choice => {
        const value = printingValue(choice);
        if (PRINT.primeCatcher.test(value) && (opponentThreats(request.observation).mimikyu || opponentThreats(request.observation).clefairy)) return 240;
        if (PRINT.regidragoVstar.test(value) && !boardHas(own, PRINT.regidragoVstar)) return 220;
        if (PRINT.compressor.test(value)) return 180;
        if (PRINT.doubleDragon.test(value)) return 160;
        return 30;
      }, min, max, 'NO_RAIHAN_SEARCH_TARGET');
    }
    if (/battle compressor/i.test(context)) {
      const priorities = [
        [PRINT.dialga, 220], [PRINT.dragapult, 205], [PRINT.koraidon, 195],
        [PRINT.goodra, 180], [PRINT.kyurem, 160], [PRINT.regidragoV, 120]
      ];
      return selectMany(choices, choice => {
        const value = printingValue(choice);
        const row = priorities.find(([pattern]) => pattern.test(value));
        return row && !discardHas(own, row[0]) ? row[1] : 0;
      }, min, max, 'NO_UNDISCARDED_DRAGON_PAYLOAD');
    }
    if (/legacy star/i.test(context)) {
      return selectMany(choices, choice => {
        const value = printingValue(choice);
        if (/Prime Catcher|Double Dragon Energy/i.test(value)) return 220;
        if (/Regidrago VSTAR|Guzma|Battle Compressor/i.test(value)) return 185;
        if (/Dragapult|Dialga|Koraidon|Goodra|Kyurem/i.test(value)) return 150;
        return 30;
      }, min, max, 'NO_LEGACY_STAR_RECOVERY');
    }
    if (/guzma|prime catcher/i.test(context) && metadata.selectionType === 'pokemon') {
      return selectMany(choices, choice => gustChoicePriority(choice, request.observation), min, max, 'NO_GUST_TARGET');
    }
    if (/phantom dive/i.test(context) && metadata.selectionType === 'pokemon') {
      return { kind: 'abstain', reasonCode: 'PHANTOM_DIVE_COUNTER_ALLOCATION_UNSUPPORTED' };
    }
    if (/trifrost/i.test(context) && metadata.selectionType === 'pokemon') {
      return selectMany(choices, choice => {
        const pokemon = targetPokemonFromChoice(choice, request.observation);
        const hp = remainingHp(pokemon);
        return hp > 0 && hp <= 110 ? 220 - hp + candidateTargetPriority(pokemon, request.observation) / 10 : 20;
      }, min, max, 'NO_TRIFROST_TARGET');
    }
    if (/dragon laser|frost spear/i.test(context) && metadata.selectionType === 'pokemon') {
      const threshold = /dragon laser/i.test(context) ? 30 : 20;
      return selectMany(choices, choice => {
        const pokemon = targetPokemonFromChoice(choice, request.observation);
        const hp = remainingHp(pokemon);
        return hp > 0 ? (hp <= threshold ? 220 : 80) + candidateTargetPriority(pokemon, request.observation) / 10 - hp / 20 : 0;
      }, min, max, 'NO_BENCH_DAMAGE_TARGET');
    }
    if (/parallel city/i.test(context)) {
      return selectMany(choices, choice => /opponent.*bench|bench.*3|three/i.test(choice.label ?? '') ? 200 : 40,
        min, max, 'NO_PARALLEL_CITY_MODE');
    }
    if (/faba/i.test(context)) {
      return selectMany(choices, choice => /Stealthy Hood|Float Stone|Special Energy|Double Dragon Energy/i.test(printingValue(choice)) ? 200 : 30,
        min, max, 'NO_FABA_TARGET');
    }
    if (/hisuian heavy ball/i.test(context)) {
      return selectMany(choices, choice => /Regidrago VSTAR|Regidrago V|Dialga-GX|Dragapult ex/i.test(printingValue(choice)) ? 180 : 40,
        min, max, 'NO_HEAVY_BALL_TARGET');
    }
    if (/quick ball|mysterious treasure/i.test(context) && /discard/i.test(context)) {
      return selectMany(choices, choice => discardCostPriority(choice, request.observation), min, max, 'NO_SAFE_DISCARD');
    }
    if (/quick ball|mysterious treasure|battle vip pass|wonder tag|search/i.test(context)) {
      return selectMany(choices, choice => {
        const value = printingValue(choice);
        if (PRINT.regidragoVstar.test(value) && boardHas(own, PRINT.regidragoV) && !boardHas(own, PRINT.regidragoVstar)) return 220;
        if (PRINT.regidragoV.test(value) && !boardHas(own, PRINT.regidragoV)) return 210;
        if (PRINT.budew.test(value) && !boardHas(own, PRINT.budew)) return 190;
        if (PRINT.latias.test(value) && !boardHas(own, PRINT.latias)) return 160;
        if (PRINT.squawk.test(value) && handSize(request.observation) <= 3) return 120;
        if (PRINT.dedenne.test(value) && handSize(request.observation) <= 3) return 115;
        if (PRINT.dragapult.test(value) || PRINT.dialga.test(value) || PRINT.koraidon.test(value) ||
            PRINT.goodra.test(value) || PRINT.kyurem.test(value)) return 80;
        return 10;
      }, min, max, 'NO_SEARCH_TARGET');
    }
    if (metadata.selectionType === 'energy-payment') {
      return selectMany(choices, choice => matches(choice, PRINT.doubleDragon) ? 160 :
        (matches(choice, PRINT.grassEnergy) || matches(choice, PRINT.fireEnergy) ? 100 : 40),
      min, max, 'NO_ENERGY_PAYMENT');
    }
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_MULTI_SELECT_SOURCE' };
  }

  if (prompt.promptType === 'ConfirmPrompt' || prompt.promptType === 'SelectPrompt' ||
      prompt.promptType === 'SelectOptionPrompt') {
    if (/parallel city/i.test(context)) {
      return selectOne(choices, choice => /opponent.*bench|bench.*3|three/i.test(choice.label ?? '') ? 200 : 40,
        'NO_PARALLEL_CITY_MODE');
    }
    const yes = choices.find(choice => /^(yes|true|confirm)$/i.test(choice.label ?? ''));
    const no = choices.find(choice => /^(no|false|decline|cancel)$/i.test(choice.label ?? ''));
    if (/legacy star|dedechange|squawk and seize/i.test(context) && yes) return { kind: 'select-choice', token: yes.token };
    if (no) return { kind: 'select-choice', token: no.token };
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_OPTIONAL_PROMPT' };
  }

  return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
}

function bestAction(request) {
  const items = list(request.actionFrontier?.items).filter(item => EXECUTABLE.has(item.kind));
  if (items.length === 0) return { kind: 'abstain', reasonCode: 'NO_EXECUTABLE_ACTION' };
  const ranked = items.map((item, index) => ({ item, index, score: scoreAction(item, request) }))
    .sort((a, b) => b.score - a.score || a.index - b.index);
  if (ranked[0]?.score > 0) return { kind: 'select-action', token: ranked[0].item.token };
  const pass = items.find(item => item.kind === 'pass');
  return pass ? { kind: 'select-action', token: pass.token } :
    { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ACTION' };
}

function createPolicy({ role, seat, policyVersion, config }) {
  if (role !== 'opponent' || (seat !== 0 && seat !== 1) ||
      policyVersion !== POLICY_VERSION || !config || Object.keys(config).length !== 0) {
    throw new Error('AGENT43_POLICY_INIT_MISMATCH');
  }
  return Object.freeze({
    decide(request) {
      if (!request || request.role !== 'opponent' || request.seat !== seat ||
          request.observation?.actorSeat !== seat) {
        return { kind: 'abstain', reasonCode: 'ROLE_SEAT_BINDING_MISMATCH' };
      }
      if (request.prompt && request.prompt.promptType) return promptDecision(request);
      return bestAction(request);
    }
  });
}

module.exports = { POLICY_VERSION, createPolicy, scoreAction, scoreAttack, promptDecision, bestAction };
