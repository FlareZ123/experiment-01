'use strict';

/*
 * Rank-12 Regidrago opponent policy.
 *
 * This is a deterministic, actor-view-only prototype bound to the exact
 * rank-12 60-card source row and the fixed Hood Shield Shadow Rider v1
 * candidate. It reuses only the rank-agnostic Apex Dragon attack evaluator.
 * It is not a native-game or competitive-strength claim.
 */

const { evaluateApexAttackChoice } = require('./agent43-regidrago-apex-choice.cjs');

const POLICY_VERSION = 'agent1-rank12-regidrago-opponent-v1';
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

function createPolicy({ role, seat, policyVersion, config }) {
  const configKeys = config && typeof config === 'object' && !Array.isArray(config)
    ? Object.keys(config).sort() : null;
  const expectedKeys = ['candidateFingerprint', 'rank', 'sourceFingerprint'];
  if (role !== 'opponent' || (seat !== 0 && seat !== 1) ||
      policyVersion !== POLICY_VERSION || configKeys === null ||
      configKeys.length !== expectedKeys.length ||
      configKeys.some((key, index) => key !== expectedKeys[index]) ||
      config.rank !== SOURCE_RANK ||
      config.sourceFingerprint !== SOURCE_FINGERPRINT_SHA256 ||
      config.candidateFingerprint !== CANDIDATE_FINGERPRINT_SHA256) {
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
