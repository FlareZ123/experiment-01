'use strict';

/*
 * Rank-4 Shu Hosoda Raichu / Electrode opponent policy.
 *
 * Deterministic, actor-view-only prototype. It is deliberately fail-closed on
 * the three prompt paths absent from the current V3 worker: Extra Energy Bomb
 * AttachEnergyPrompt, Crush and Burn-GX DiscardEnergyPrompt, and Electro Rain
 * PutDamagePrompt. It is not a competence or matchup-strength attestation.
 */

const POLICY_VERSION = 'agent50-rank4-raichu-electrode-opponent-v1';
const SOURCE_RANK = 4;
const SOURCE_LIST_BLOB_SHA1 = 'ae773f6201d7aa69d31914dbfee66f3fba692200';
const SOURCE_ENTRY_JSON_SHA256 = '0025740b7eb19347dcca8e85e713bee5e0d79f0b9f1944b54a7678e55ce15fb8';
const CANDIDATE_FINGERPRINT_SHA256 = '1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4';
const ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const WORKER_PROTOCOL_BLOB_SHA1 = 'd51ea95c457d61b50a9ee114d342eb17f4350451';

const PRINT = Object.freeze({
  voltorb: /^Voltorb ROS 21\b/i,
  electrode: /^Electrode-GX CES 48\b/i,
  pikachu: /^Pikachu LOR 52\b/i,
  raichu: /^Alolan Raichu UNM 57\b/i,
  dedenne: /^Dedenne-GX UNB 57\b/i,
  crobat: /^Crobat V DAA 104\b/i,
  squawk: /^Squawkabilly ex PAL 169\b/i,
  tapuLele: /^Tapu Lele-GX GRI 60\b/i,
  eldegoss: /^Eldegoss V RCL 19\b/i,
  gengarMimikyu: /^Gengar & Mimikyu-GX TEU 53\b/i,
  klefki: /^Klefki SVI 96\b/i,
  ditto: /^Ditto ♢ LOT 154\b/i,
  quickBall: /^Quick Ball FST 237\b/i,
  battleCompressor: /^Battle Compressor PHF 92\b/i,
  rescueStretcher: /^Rescue Stretcher GRI 130\b/i,
  escapeRope: /^Escape Rope BST 125\b/i,
  heavyBall: /^Hisuian Heavy Ball ASR 146\b/i,
  ultraBall: /^Ultra Ball MEG 131\b/i,
  vipPass: /^Battle VIP Pass FST 225\b/i,
  secretBox: /^Secret Box TWM 163\b/i,
  telescopicSight: /^Telescopic Sight VIV 160\b/i,
  uTurnBoard: /^U-Turn Board UNM 211\b/i,
  forestSealStone: /^Forest Seal Stone SIT 156\b/i,
  skyField: /^Sky Field ROS 89\b/i,
  reversalEnergy: /^Reversal Energy PAL 192\b/i,
  counterEnergy: /^Counter Energy CIN 100\b/i,
  unitEnergy: /^Unit Energy LPM UPR 138\b/i,
  carmine: /^Carmine TWM 145\b/i,
  pokemonRanger: /^Pokémon Ranger STS 104\b/i,
  lillie: /^Lillie's Determination MEG 119\b/i,
  gladion: /^Gladion CIN 95\b/i
});

const EXECUTABLE = new Set([
  'play-card', 'attack', 'retreat', 'use-ability', 'use-stadium', 'pass'
]);

const SUPPORTERS = [
  PRINT.carmine, PRINT.pokemonRanger, PRINT.lillie, PRINT.gladion
];

function list(value) {
  return Array.isArray(value) ? value : [];
}

function printingValue(value) {
  if (typeof value === 'string') return value;
  if (typeof value?.printing === 'string') return value.printing;
  if (typeof value?.fullName === 'string') return value.fullName;
  if (typeof value?.actorPrinting === 'string') return value.actorPrinting;
  if (typeof value?.targetPrinting === 'string') return value.targetPrinting;
  if (typeof value?.publicMetadata?.cardPrinting === 'string') return value.publicMetadata.cardPrinting;
  if (typeof value?.publicMetadata?.sourcePrinting === 'string') return value.publicMetadata.sourcePrinting;
  if (typeof value?.publicMetadata?.targetPrinting === 'string') return value.publicMetadata.targetPrinting;
  return '';
}

function matches(value, pattern) {
  return pattern.test(printingValue(value));
}

function metadata(value) {
  return value?.publicMetadata ?? {};
}

function slots(player) {
  return [player?.active ?? null, ...list(player?.bench)].filter(Boolean);
}

function boardHas(player, pattern) {
  return slots(player).some(pokemon => matches(pokemon?.printing, pattern));
}

function boardCount(player, pattern) {
  return slots(player).filter(pokemon => matches(pokemon?.printing, pattern)).length;
}

function own(observation) {
  return observation?.ownPublic ?? {};
}

function opponent(observation) {
  return observation?.opponentPublic ?? {};
}

function hand(observation) {
  return list(observation?.ownHand);
}

function handCount(observation) {
  return hand(observation).length;
}

function deckCount(observation) {
  const count = own(observation).deckCount;
  return Number.isSafeInteger(count) ? count : 99;
}

function supporterAvailable(observation) {
  const resources = observation?.ownTurnResources ?? {};
  const restrictions = own(observation).publicTurnRestrictions ?? {};
  return resources.supporterPlayedTurn === 0 &&
    resources.supporterPlayLocked !== true &&
    restrictions.supporterPlayLocked !== true;
}

function itemAvailable(observation) {
  const resources = observation?.ownTurnResources ?? {};
  const restrictions = own(observation).publicTurnRestrictions ?? {};
  return resources.itemPlayLocked !== true && restrictions.itemPlayLocked !== true;
}

function gxUsed(observation) {
  return own(observation).publicTurnRestrictions?.gxUsed === true ||
    observation?.ownTurnResources?.gxUsed === true;
}

function vstarUsed(observation) {
  return own(observation).publicTurnRestrictions?.vstarUsed === true ||
    observation?.ownTurnResources?.vstarUsed === true;
}

function active(player) {
  return player?.active ?? null;
}

function opponentHandCount(observation) {
  const count = opponent(observation).handCount;
  return Number.isSafeInteger(count) ? count : null;
}

function hasSupporterInHand(observation) {
  return hand(observation).some(card => SUPPORTERS.some(pattern => matches(card, pattern)) ||
    /\bSupporter\b/i.test(printingValue(card)));
}

function hasSupporterInDiscard(observation) {
  return list(own(observation).discard).some(card =>
    SUPPORTERS.some(pattern => matches(card, pattern)) ||
    /\bSupporter\b/i.test(printingValue(card)));
}

function countEnergies(player) {
  return slots(player).reduce((total, pokemon) => total + list(pokemon?.energies).length, 0);
}

function activeEnergyCount(player) {
  return list(active(player)?.energies).length;
}

function stadiumActive(observation, pattern) {
  return [...list(own(observation).stadium), ...list(opponent(observation).stadium)]
    .some(card => matches(card, pattern));
}

function benchCount(player) {
  return list(player?.bench).filter(Boolean).length;
}

function benchLimit(observation) {
  return stadiumActive(observation, PRINT.skyField) ? 8 : 5;
}

function hasBenchSpace(observation) {
  return benchCount(own(observation)) < benchLimit(observation);
}

function sourceText(prompt) {
  return [
    prompt?.source?.sourcePrinting,
    prompt?.source?.effectName,
    prompt?.description
  ].filter(Boolean).join(' ').toLowerCase();
}

function sourceIs(prompt, pattern) {
  return pattern.test(sourceText(prompt));
}

function cardPriority(value, observation, source) {
  const text = printingValue(value);
  const ownPlayer = own(observation);
  const handSize = handCount(observation);
  const firstTurn = observation?.globalTurn === 1;

  if (/wonder tag|tapu lele/i.test(source)) {
    if (PRINT.carmine.test(text) && firstTurn && handSize <= 4) return 240;
    if (PRINT.lillie.test(text) && handSize <= 3) return 220;
    if (PRINT.gladion.test(text)) return 130;
    if (PRINT.pokemonRanger.test(text)) return 40;
    return 10;
  }

  if (/happy match|eldegoss/i.test(source)) {
    return SUPPORTERS.some(pattern => pattern.test(text)) ? 180 : 0;
  }

  if (/rescue stretcher/i.test(source)) {
    if (PRINT.raichu.test(text) && !boardHas(ownPlayer, PRINT.raichu)) return 240;
    if (PRINT.electrode.test(text) && !boardHas(ownPlayer, PRINT.electrode)) return 220;
    if (PRINT.gengarMimikyu.test(text) && !boardHas(ownPlayer, PRINT.gengarMimikyu)) return 190;
    if (PRINT.voltorb.test(text) && !boardHas(ownPlayer, PRINT.voltorb)) return 170;
    if (PRINT.pikachu.test(text) && !boardHas(ownPlayer, PRINT.pikachu)) return 160;
    return 20;
  }

  if (/battle vip pass/i.test(source)) {
    if (PRINT.voltorb.test(text) && !boardHas(ownPlayer, PRINT.voltorb)) return 240;
    if (PRINT.pikachu.test(text) && !boardHas(ownPlayer, PRINT.pikachu)) return 230;
    if (PRINT.dedenne.test(text) && handSize <= 3 && !boardHas(ownPlayer, PRINT.dedenne)) return 180;
    if (PRINT.crobat.test(text) && handSize <= 3 && !boardHas(ownPlayer, PRINT.crobat)) return 170;
    if (PRINT.squawk.test(text) && firstTurn && !boardHas(ownPlayer, PRINT.squawk)) return 160;
    if (PRINT.gengarMimikyu.test(text) && !boardHas(ownPlayer, PRINT.gengarMimikyu)) return 130;
    return 5;
  }

  if (/quick ball/i.test(source)) {
    if (PRINT.voltorb.test(text) && !boardHas(ownPlayer, PRINT.voltorb)) return 230;
    if (PRINT.pikachu.test(text) && !boardHas(ownPlayer, PRINT.pikachu)) return 220;
    if (PRINT.dedenne.test(text) && handSize <= 3 && !boardHas(ownPlayer, PRINT.dedenne)) return 170;
    if (PRINT.crobat.test(text) && handSize <= 3 && !boardHas(ownPlayer, PRINT.crobat)) return 160;
    if (PRINT.squawk.test(text) && firstTurn && !boardHas(ownPlayer, PRINT.squawk)) return 150;
    if (PRINT.tapuLele.test(text) && supporterAvailable(observation) && !hasSupporterInHand(observation)) return 120;
    return 5;
  }

  if (/ultra ball|secret box|star alchemy|forest seal stone/i.test(source)) {
    if (PRINT.electrode.test(text) && boardHas(ownPlayer, PRINT.voltorb) &&
        !boardHas(ownPlayer, PRINT.electrode)) return 230;
    if (PRINT.raichu.test(text) && boardHas(ownPlayer, PRINT.pikachu) &&
        !boardHas(ownPlayer, PRINT.raichu)) return 220;
    if (PRINT.voltorb.test(text) && !boardHas(ownPlayer, PRINT.voltorb)) return 210;
    if (PRINT.pikachu.test(text) && !boardHas(ownPlayer, PRINT.pikachu)) return 200;
    if (PRINT.dedenne.test(text) && handSize <= 3 && !boardHas(ownPlayer, PRINT.dedenne)) return 160;
    if (PRINT.crobat.test(text) && handSize <= 3 && !boardHas(ownPlayer, PRINT.crobat)) return 150;
    if (PRINT.gengarMimikyu.test(text) && !boardHas(ownPlayer, PRINT.gengarMimikyu)) return 130;
    if (SUPPORTERS.some(pattern => pattern.test(text)) && !hasSupporterInHand(observation)) return 120;
    return 10;
  }

  if (/gladion/i.test(source)) {
    if (PRINT.raichu.test(text) && !boardHas(ownPlayer, PRINT.raichu)) return 260;
    if (PRINT.electrode.test(text) && boardHas(ownPlayer, PRINT.voltorb) &&
        !boardHas(ownPlayer, PRINT.electrode)) return 250;
    if (PRINT.voltorb.test(text) && !boardHas(ownPlayer, PRINT.voltorb)) return 240;
    if (PRINT.pikachu.test(text) && !boardHas(ownPlayer, PRINT.pikachu)) return 230;
    if (PRINT.gengarMimikyu.test(text) && !boardHas(ownPlayer, PRINT.gengarMimikyu)) return 190;
    if (PRINT.dedenne.test(text) && !boardHas(ownPlayer, PRINT.dedenne)) return 180;
    return 10;
  }

  if (/hisuian heavy ball/i.test(source)) {
    if (PRINT.voltorb.test(text)) return 230;
    if (PRINT.pikachu.test(text)) return 220;
    if (PRINT.dedenne.test(text)) return 180;
    if (PRINT.tapuLele.test(text)) return 160;
    if (PRINT.squawk.test(text)) return 150;
    if (PRINT.crobat.test(text)) return 140;
    if (PRINT.gengarMimikyu.test(text)) return 130;
    return 10;
  }

  if (PRINT.voltorb.test(text) && !boardHas(ownPlayer, PRINT.voltorb)) return 120;
  if (PRINT.pikachu.test(text) && !boardHas(ownPlayer, PRINT.pikachu)) return 115;
  if (PRINT.raichu.test(text) && boardHas(ownPlayer, PRINT.pikachu) &&
      !boardHas(ownPlayer, PRINT.raichu)) return 210;
  if (PRINT.electrode.test(text) && boardHas(ownPlayer, PRINT.voltorb) &&
      !boardHas(ownPlayer, PRINT.electrode)) return 200;
  if (SUPPORTERS.some(pattern => pattern.test(text))) return 70;
  return 5;
}

function scoreDiscardChoice(choice, request, needed) {
  const text = printingValue(choice);
  const observation = request.observation;
  const sameInHand = hand(observation).filter(card =>
    printingValue(card) === text).length;
  if (sameInHand > 1) return 150;
  if (PRINT.pokemonRanger.test(text) || PRINT.gladion.test(text)) return 90;
  if (PRINT.carmine.test(text) && observation.globalTurn !== 1) return 80;
  if (PRINT.lillie.test(text) && handCount(observation) > 3) return 70;
  if (PRINT.unitEnergy.test(text) || PRINT.reversalEnergy.test(text) ||
      PRINT.counterEnergy.test(text)) return needed >= 3 ? 25 : 10;
  if (PRINT.voltorb.test(text) && boardHas(own(observation), PRINT.electrode)) return 60;
  if (PRINT.pikachu.test(text) && boardHas(own(observation), PRINT.raichu)) return 55;
  if (PRINT.dedenne.test(text) && boardHas(own(observation), PRINT.dedenne)) return 45;
  if (PRINT.crobat.test(text) && boardHas(own(observation), PRINT.crobat)) return 40;
  return 0;
}

function scorePokemonPlay(value, observation) {
  const ownPlayer = own(observation);
  const handSize = handCount(observation);
  if (!hasBenchSpace(observation)) return 0;

  if (matches(value, PRINT.voltorb)) {
    return boardCount(ownPlayer, PRINT.voltorb) < 2 &&
      !boardHas(ownPlayer, PRINT.electrode) ? 150 : 20;
  }
  if (matches(value, PRINT.pikachu)) {
    return !boardHas(ownPlayer, PRINT.pikachu) &&
      !boardHas(ownPlayer, PRINT.raichu) ? 145 : 15;
  }
  if (matches(value, PRINT.dedenne)) {
    return handSize <= 3 && !boardHas(ownPlayer, PRINT.dedenne) ? 135 : 35;
  }
  if (matches(value, PRINT.crobat)) {
    return handSize <= 4 && !boardHas(ownPlayer, PRINT.crobat) ? 130 : 30;
  }
  if (matches(value, PRINT.squawk)) {
    return observation.globalTurn === 1 && handSize <= 2 &&
      !boardHas(ownPlayer, PRINT.squawk) ? 125 : 10;
  }
  if (matches(value, PRINT.tapuLele)) {
    return supporterAvailable(observation) && !hasSupporterInHand(observation) &&
      !boardHas(ownPlayer, PRINT.tapuLele) ? 120 : 25;
  }
  if (matches(value, PRINT.eldegoss)) {
    return supporterAvailable(observation) && hasSupporterInDiscard(observation) &&
      !boardHas(ownPlayer, PRINT.eldegoss) ? 115 : 15;
  }
  if (matches(value, PRINT.gengarMimikyu)) {
    return !boardHas(ownPlayer, PRINT.gengarMimikyu) ? 90 : 15;
  }
  if (matches(value, PRINT.klefki)) {
    const opposingActiveTools = list(active(opponent(observation))?.tools);
    return !boardHas(ownPlayer, PRINT.klefki) && opposingActiveTools.length > 0 ? 80 : 0;
  }
  if (matches(value, PRINT.ditto)) {
    return !boardHas(ownPlayer, PRINT.ditto) ? 65 : 5;
  }
  return 10;
}

function scoreAbility(item, observation) {
  const ability = metadata(item).abilityName ?? item.abilityName ?? '';
  const actor = printingValue(item);
  const handSize = handCount(observation);

  if (/extra energy bomb/i.test(ability) || PRINT.electrode.test(actor) &&
      /extra energy bomb/i.test(ability)) return -1000;

  if (/dedechange/i.test(ability)) {
    return handSize <= 3 && deckCount(observation) > 6 ? 245 : 0;
  }
  if (/dark asset/i.test(ability)) {
    return handSize <= 4 && deckCount(observation) > 6 ? 235 : 0;
  }
  if (/squawk and seize/i.test(ability)) {
    return observation.globalTurn === 1 && handSize <= 2 &&
      deckCount(observation) > 6 ? 225 : 0;
  }
  if (/wonder tag/i.test(ability)) {
    return supporterAvailable(observation) && !hasSupporterInHand(observation) ? 205 : 0;
  }
  if (/happy match/i.test(ability)) {
    return supporterAvailable(observation) && hasSupporterInDiscard(observation) ? 195 : 0;
  }
  if (/star alchemy/i.test(ability)) {
    return !vstarUsed(observation) && (handSize <= 3 ||
      !boardHas(own(observation), PRINT.raichu) ||
      !boardHas(own(observation), PRINT.electrode)) ? 175 : 70;
  }
  return 0;
}

function scoreAttack(item, observation) {
  const name = item.attackName ?? metadata(item).attackName ??
    metadata(item).sourceAttack ?? '';
  const ownPlayer = own(observation);
  const opponentPlayer = opponent(observation);
  const ownActive = active(ownPlayer);
  const opponentActive = active(opponentPlayer);
  const opponentCards = opponentHandCount(observation);
  const opponentBench = slots(opponentPlayer);

  if (/electro rain/i.test(name)) return -1000;
  if (/crush and burn/i.test(name)) return -1000;

  if (/horror house-gx/i.test(name)) {
    return !gxUsed(observation) ? (opponentCards === null ? 175 :
      180 + Math.min(20, opponentCards * 3)) : 0;
  }
  if (/poltergeist/i.test(name)) {
    return opponentCards !== null && opponentCards >= 3 ? 120 : 45;
  }
  if (/tingly return-gx/i.test(name)) {
    return !gxUsed(observation) && opponentActive ? 145 : 0;
  }
  if (/tapu cure-gx/i.test(name)) {
    const damaged = list(ownPlayer.bench).filter(pokemon =>
      pokemon && Number.isFinite(pokemon.damage) && pokemon.damage >= 30).length;
    return !gxUsed(observation) && damaged >= 2 ? 135 : 0;
  }
  if (/energy drive/i.test(name)) {
    const total = activeEnergyCount(ownPlayer) + activeEnergyCount(opponentPlayer);
    return 75 + Math.min(60, total * 10);
  }
  if (/electric ball/i.test(name)) return 105;
  if (/electro ball/i.test(name)) return 80;
  if (/venomous fang/i.test(name)) return 60;
  if (/pika ball/i.test(name)) return 35;
  if (/joust/i.test(name)) return list(opponentActive?.tools).length > 0 ? 100 : 0;
  if (/motivate/i.test(name)) return 0;

  if (opponentBench.length > 0 && /spread|bench/i.test(name)) return 60;
  if (ownActive && opponentActive) return 25;
  return 10;
}

function scoreTrainer(item, observation) {
  const card = printingValue(item);
  const target = item.targetPrinting ?? metadata(item).targetPrinting ?? '';
  const handSize = handCount(observation);
  const firstTurn = observation.globalTurn === 1;
  const ownPlayer = own(observation);
  const opponentPlayer = opponent(observation);

  if (PRINT.battleCompressor.test(card)) return 0;
  if (PRINT.vipPass.test(card)) {
    return firstTurn && hasBenchSpace(observation) ? 220 : 0;
  }
  if (PRINT.quickBall.test(card)) {
    return hasBenchSpace(observation) && discardCapacity(observation) >= 1 ? 145 : 0;
  }
  if (PRINT.ultraBall.test(card)) {
    return hasBenchSpace(observation) && discardCapacity(observation) >= 2 ? 135 : 0;
  }
  if (PRINT.rescueStretcher.test(card)) {
    const discard = list(ownPlayer.discard);
    return discard.some(value => [PRINT.raichu, PRINT.electrode, PRINT.gengarMimikyu,
      PRINT.voltorb, PRINT.pikachu].some(pattern => matches(value, pattern))) ? 155 : 35;
  }
  if (PRINT.heavyBall.test(card)) return 95;
  if (PRINT.secretBox.test(card)) {
    return handSize >= 4 && discardCapacity(observation) >= 3 ? 120 : 0;
  }
  if (PRINT.escapeRope.test(card)) {
    const targetIsThreat = matches(active(opponentPlayer)?.printing, /^Shadow Rider Calyrex VMAX CRE 75\b/i) ||
      matches(active(opponentPlayer)?.printing, /^Trevenant & Dusknoir-GX SMP 217\b/i);
    return targetIsThreat ? 90 : 55;
  }
  if (PRINT.forestSealStone.test(card)) {
    const validTarget = matches(target, PRINT.crobat) || matches(target, PRINT.eldegoss);
    return validTarget && !vstarUsed(observation) ? 105 : 15;
  }
  if (PRINT.skyField.test(card)) {
    return benchCount(ownPlayer) >= 4 && benchCount(opponentPlayer) <= 5 ? 110 : 0;
  }
  if (PRINT.uTurnBoard.test(card)) {
    const activePokemon = active(ownPlayer);
    const retreat = list(activePokemon?.printed?.retreatCost).length;
    return retreat > 0 && !list(activePokemon?.tools).length ? 65 : 0;
  }
  if (PRINT.telescopicSight.test(card)) return 15;
  if (PRINT.carmine.test(card)) return firstTurn && handSize <= 4 ? 160 : 0;
  if (PRINT.lillie.test(card)) return handSize <= 3 ? 150 : 35;
  if (PRINT.gladion.test(card)) return 80;
  if (PRINT.pokemonRanger.test(card)) return 30;

  if (PRINT.unitEnergy.test(card)) {
    return matches(target, PRINT.raichu) ? 150 :
      (matches(target, PRINT.gengarMimikyu) ? 125 : 50);
  }
  if (PRINT.reversalEnergy.test(card)) {
    return matches(target, PRINT.raichu) ? 145 : 35;
  }
  if (PRINT.counterEnergy.test(card)) {
    return matches(target, PRINT.raichu) ? 110 : 25;
  }

  if (/\bPokémon\b/i.test(card) || [
    PRINT.voltorb, PRINT.pikachu, PRINT.dedenne, PRINT.crobat, PRINT.squawk,
    PRINT.tapuLele, PRINT.eldegoss, PRINT.gengarMimikyu, PRINT.klefki, PRINT.ditto
  ].some(pattern => pattern.test(card))) {
    return scorePokemonPlay(card, observation);
  }
  return 10;
}

function scoreAction(item, request) {
  const observation = request.observation;
  if (item.kind === 'pass') return 0;
  if (item.kind === 'attack') return scoreAttack(item, observation);
  if (item.kind === 'use-ability') return scoreAbility(item, observation);
  if (item.kind === 'play-card') return scoreTrainer(item, observation);
  if (item.kind === 'use-stadium') return scoreTrainer(item, observation);
  if (item.kind === 'retreat') {
    const target = item.targetPrinting ?? metadata(item).targetPrinting ?? '';
    if (matches(target, PRINT.raichu) && list(metadata(item).targetEnergies).length >= 1) return 115;
    if (matches(target, PRINT.gengarMimikyu) && list(metadata(item).targetEnergies).length >= 1) return 100;
    if (matches(target, PRINT.klefki) || matches(target, PRINT.electrode)) return 65;
    return 15;
  }
  return 0;
}

function bestAction(request) {
  const items = list(request.actionFrontier?.items)
    .filter(item => EXECUTABLE.has(item.kind));
  if (items.length === 0) {
    return { kind: 'abstain', reasonCode: 'NO_EXECUTABLE_ACTION' };
  }

  let best = null;
  let bestScore = 0;
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    const score = scoreAction(item, request);
    if (score > bestScore) {
      best = item;
      bestScore = score;
    }
  }

  if (best) return { kind: 'select-action', token: best.token };
  const pass = items.find(item => item.kind === 'pass');
  return pass ? { kind: 'select-action', token: pass.token } :
    { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ACTION' };
}

function selectOne(choices, scorer, reasonCode) {
  const ranked = list(choices).map((choice, index) => ({
    choice, index, score: scorer(choice)
  })).filter(row => row.score > 0 && typeof row.choice?.token === 'string')
    .sort((a, b) => b.score - a.score || a.index - b.index);
  return ranked[0] ? { kind: 'select-choice', token: ranked[0].choice.token } :
    { kind: 'abstain', reasonCode };
}

function selectMany(choices, scorer, minimum, maximum, reasonCode) {
  const ranked = list(choices).map((choice, index) => ({
    choice, index, score: scorer(choice)
  })).filter(row => row.score > 0 && typeof row.choice?.token === 'string')
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, maximum);
  if (ranked.length < minimum) return { kind: 'abstain', reasonCode };
  return { kind: 'select-choices', tokens: ranked.map(row => row.choice.token) };
}

function choiceBounds(prompt) {
  const meta = metadata(prompt);
  const minimum = Number.isSafeInteger(meta.minimumCount) ? meta.minimumCount : 1;
  const maximum = Number.isSafeInteger(meta.maximumCount) ? meta.maximumCount : minimum;
  return { minimum, maximum: Math.max(minimum, maximum) };
}

function selectSafeDiscards(choices, request, minimum, maximum, multiSelect) {
  const counts = new Map();
  for (const card of hand(request.observation)) {
    const text = printingValue(card);
    counts.set(text, (counts.get(text) ?? 0) + 1);
  }
  const ranked = list(choices).map((choice, index) => ({
    choice,
    index,
    score: scoreDiscardChoice(choice, request, minimum)
  })).filter(row => row.score > 0 && typeof row.choice?.token === 'string')
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const selected = [];
  for (const row of ranked) {
    const text = printingValue(row.choice);
    const remaining = counts.get(text) ?? 0;
    const originalCount = hand(request.observation).filter(card =>
      printingValue(card) === text).length;
    const singletonIsDead = (PRINT.carmine.test(text) &&
      request.observation.globalTurn !== 1) ||
      (PRINT.lillie.test(text) && handCount(request.observation) > 4 &&
        hand(request.observation).some(card => printingValue(card) !== text &&
          SUPPORTERS.some(pattern => pattern.test(printingValue(card))))) ||
      (PRINT.pokemonRanger.test(text) && hand(request.observation).some(card =>
        SUPPORTERS.some(pattern => pattern.test(printingValue(card)) &&
          !PRINT.pokemonRanger.test(printingValue(card)))));
    if (remaining > 1 || (remaining === 1 && originalCount === 1 && singletonIsDead)) {
      selected.push(row.choice.token);
      counts.set(text, remaining - 1);
    }
    if (selected.length >= maximum) break;
  }
  if (selected.length < minimum) return { kind: 'abstain', reasonCode: 'NO_SAFE_DISCARD_COST' };
  return multiSelect ? { kind: 'select-choices', tokens: selected } :
    { kind: 'select-choice', token: selected[0] };
}

function selectSecretBox(choices, observation, prompt) {
  const categories = [
    {
      name: 'item',
      patterns: [PRINT.quickBall, PRINT.heavyBall, PRINT.rescueStretcher,
        PRINT.escapeRope, PRINT.ultraBall, PRINT.vipPass]
    },
    {
      name: 'tool',
      patterns: [PRINT.forestSealStone, PRINT.uTurnBoard, PRINT.telescopicSight]
    },
    { name: 'supporter', patterns: SUPPORTERS },
    { name: 'stadium', patterns: [PRINT.skyField] }
  ];
  const selected = [];
  for (const category of categories) {
    const candidates = list(choices).filter(choice =>
      category.patterns.some(pattern => matches(choice, pattern)));
    if (candidates.length === 0) {
      return { kind: 'abstain', reasonCode: 'SECRET_BOX_CATEGORY_MISSING' };
    }
    const ranked = candidates.map((choice, index) => ({
      choice,
      index,
      score: cardPriority(choice, observation, category.name === 'supporter' ?
        'wonder tag' : category.name)
    })).sort((a, b) => b.score - a.score || a.index - b.index);
    selected.push(ranked[0].choice.token);
  }
  const { minimum, maximum } = choiceBounds(prompt);
  if (selected.length < minimum || selected.length > maximum) {
    return { kind: 'abstain', reasonCode: 'SECRET_BOX_SELECTION_BOUNDS' };
  }
  return { kind: 'select-choices', tokens: selected };
}

function promptDecision(request) {
  const prompt = request.prompt;
  const choices = list(prompt?.choices);
  const context = sourceText(prompt);
  const observation = request.observation;
  const meta = metadata(prompt);

  if (/extra energy bomb/i.test(context)) {
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_EXTRA_ENERGY_BOMB_PROMPT' };
  }
  if (/crush and burn/i.test(context)) {
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_CRUSH_AND_BURN_PROMPT' };
  }
  if (/electro rain/i.test(context)) {
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_ELECTRO_RAIN_PROMPT' };
  }
  if (/battle compressor/i.test(context)) {
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_ENERGY_BOMB_SETUP' };
  }

  if (prompt?.promptType === 'ChooseCardsPrompt') {
    if (/quick ball|ultra ball|secret box/i.test(context) &&
        choices.some(choice => metadata(choice).sourceZone === 'hand')) {
      const { minimum, maximum } = choiceBounds(prompt);
      return selectSafeDiscards(choices, request, minimum, maximum,
        meta.selectionType === 'card-combination');
    }

    if (/secret box/i.test(context)) {
      return selectSecretBox(choices, observation, prompt);
    }

    if (/rescue stretcher/i.test(context)) {
      const { minimum, maximum } = choiceBounds(prompt);
      return selectMany(choices, choice => cardPriority(choice, observation, context),
        minimum, Math.min(maximum, 1), 'NO_RECOVERABLE_POKEMON');
    }

    const { minimum, maximum } = choiceBounds(prompt);
    const score = choice => cardPriority(choice, observation, context);
    if (meta.selectionType === 'card-combination' ||
        meta.selectionType === 'pokemon' ||
        meta.selectionType === 'energy-payment' ||
        meta.selectionType === 'card-order') {
      return selectMany(choices, score, minimum, maximum, 'NO_SUPPORTED_SEARCH_TARGET');
    }
    return selectOne(choices, score, 'NO_SUPPORTED_SEARCH_TARGET');
  }

  if (prompt?.promptType === 'ChoosePrizePrompt') {
    const visible = choices.filter(choice =>
      metadata(choice).ownerSeat === 'actor' &&
      metadata(choice).isOwnerVisible === true);
    if (visible.length !== choices.length || visible.length === 0) {
      return { kind: 'abstain', reasonCode: 'PRIZE_IDENTITY_UNAVAILABLE' };
    }
    return selectOne(visible, choice => cardPriority(choice, observation, context),
      'NO_USEFUL_VISIBLE_PRIZE');
  }

  if (prompt?.promptType === 'ChoosePokemonPrompt') {
    const ownChoices = choices.filter(choice =>
      metadata(choice).ownerSeat === 'actor' &&
      metadata(choice).targetZone === 'bench');
    if (ownChoices.length === 0) {
      return { kind: 'abstain', reasonCode: 'NO_ACTOR_BENCH_SWITCH' };
    }
    return selectOne(ownChoices, choice => {
      if (matches(choice, PRINT.raichu) &&
          list(choice.energies).length > 0) return 180;
      if (matches(choice, PRINT.gengarMimikyu) &&
          list(choice.energies).length > 0) return 160;
      if (matches(choice, PRINT.electrode)) return 70;
      if (matches(choice, PRINT.klefki)) return 55;
      if (matches(choice, PRINT.voltorb)) return 30;
      return 10;
    }, 'NO_SAFE_SWITCH_TARGET');
  }

  if (prompt?.promptType === 'ConfirmPrompt' ||
      prompt?.promptType === 'SelectPrompt' ||
      prompt?.promptType === 'SelectOptionPrompt') {
    const yes = choices.find(choice => /^(yes|true|confirm)$/i.test(choice.label ?? ''));
    const no = choices.find(choice => /^(no|false|decline|cancel)$/i.test(choice.label ?? ''));

    if (/extra energy bomb/i.test(context)) {
      return no ? { kind: 'select-choice', token: no.token } :
        { kind: 'abstain', reasonCode: 'UNSUPPORTED_EXTRA_ENERGY_BOMB_CONFIRM' };
    }
    if (/dedechange/i.test(context) && yes &&
        handCount(observation) <= 3 && deckCount(observation) > 6) {
      return { kind: 'select-choice', token: yes.token };
    }
    if (/squawk and seize/i.test(context) && yes &&
        observation.globalTurn === 1 && handCount(observation) <= 2 &&
        deckCount(observation) > 6) {
      return { kind: 'select-choice', token: yes.token };
    }
    if (/dark asset/i.test(context) && yes &&
        handCount(observation) <= 4 && deckCount(observation) > 6) {
      return { kind: 'select-choice', token: yes.token };
    }
    if (no) return { kind: 'select-choice', token: no.token };
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_OPTIONAL_PROMPT' };
  }

  return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
}

function createPolicy({ role, seat, policyVersion, config }) {
  const expectedKeys = ['candidateFingerprint', 'rank', 'sourceFingerprint'];
  if (role !== 'opponent' || (seat !== 0 && seat !== 1) ||
      policyVersion !== POLICY_VERSION || !config ||
      Array.isArray(config) ||
      Object.keys(config).sort().join(',') !== expectedKeys.join(',') ||
      config.rank !== SOURCE_RANK ||
      config.sourceFingerprint !== SOURCE_ENTRY_JSON_SHA256 ||
      config.candidateFingerprint !== CANDIDATE_FINGERPRINT_SHA256) {
    throw new Error('AGENT50_RANK4_POLICY_INIT_MISMATCH');
  }

  return Object.freeze({
    decide(request) {
      if (!request || request.role !== 'opponent' || request.seat !== seat ||
          request.observation?.actorSeat !== seat) {
        return { kind: 'abstain', reasonCode: 'ROLE_SEAT_BINDING_MISMATCH' };
      }
      if (request.prompt !== null) return promptDecision(request);
      return bestAction(request);
    }
  });
}

module.exports = {
  POLICY_VERSION,
  SOURCE_RANK,
  SOURCE_LIST_BLOB_SHA1,
  SOURCE_ENTRY_JSON_SHA256,
  CANDIDATE_FINGERPRINT_SHA256,
  ENGINE_PIN,
  WORKER_PROTOCOL_BLOB_SHA1,
  createPolicy,
  scoreAction,
  scoreAttack,
  promptDecision,
  bestAction,
  cardPriority
};
