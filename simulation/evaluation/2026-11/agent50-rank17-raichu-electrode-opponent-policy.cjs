'use strict';

/*
 * Rank-4 Shu Hosoda Raichu / Electrode opponent policy.
 *
 * Deterministic, actor-view-only prototype. V2 adds the Ditto Prism Star
 * Almighty Evolution line. It is deliberately fail-closed on
 * the three prompt paths absent from the current V3 worker: Extra Energy Bomb
 * AttachEnergyPrompt, Crush and Burn-GX DiscardEnergyPrompt, and Electro Rain
 * PutDamagePrompt. It is not a competence or matchup-strength attestation.
 */

const POLICY_VERSION = 'agent50-rank4-raichu-electrode-opponent-v2';
const SOURCE_RANK = 4;
const SOURCE_LIST_BLOB_SHA1 = 'ae773f6201d7aa69d31914dbfee66f3fba692200';
const SOURCE_ENTRY_JSON_SHA256 = '2dcb4c65c31103bebe9c3e3a4185f4a21e1dd0705e5bedcb777b6c07defeb106';
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

function scoreDiscardChoice(choice, request) {
  const text = printingValue(choice);
  const observation = request.observation;
  const sameInHand = hand(observation).filter(card =>
    printingValue(card) === text).length;
  if (sameInHand > 1) return 150;
  if (PRINT.carmine.test(text) && observation.globalTurn !== 1) return 80;
  if (PRINT.lillie.test(text) && handCount(observation) > 4 &&
      hand(observation).some(card => printingValue(card) !== text &&
        SUPPORTERS.some(pattern => pattern.test(printingValue(card))))) return 70;
  if (PRINT.pokemonRanger.test(text) && hand(observation).some(card =>
      SUPPORTERS.some(pattern => pattern.test(printingValue(card)) &&
        !PRINT.pokemonRanger.test(printingValue(card))))) return 60;
  return 0;
}

function discardCapacity(observation) {
  const cards = hand(observation);
  const counts = new Map();
  for (const card of cards) {
    const text = printingValue(card);
    counts.set(text, (counts.get(text) ?? 0) + 1);
  }
  let capacity = 0;
  for (const [text, count] of counts) {
    if (count > 1) {
      capacity += count - 1;
    } else if (PRINT.carmine.test(text) && observation.globalTurn !== 1) {
      capacity += 1;
    } else if (PRINT.lillie.test(text) && cards.length > 4 &&
        cards.some(card => printingValue(card) !== text &&
          SUPPORTERS.some(pattern => pattern.test(printingValue(card))))) {
      capacity += 1;
    } else if (PRINT.pokemonRanger.test(text) && cards.some(card =>
        SUPPORTERS.some(pattern => pattern.test(printingValue(card)) &&
          !PRINT.pokemonRanger.test(printingValue(card))))) {
      capacity += 1;
    }
  }
  return capacity;
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

  if (/almighty evolution/i.test(ability) || PRINT.ditto.test(actor) &&
      /evolution/i.test(ability)) {
    const ditto = slots(own(observation)).find(pokemon =>
      matches(pokemon?.printing, PRINT.ditto));
    const eligible = ditto && observation.globalTurn > 1 &&
      Number.isSafeInteger(ditto.lastPlayedOrEvolvedTurn) &&
      ditto.lastPlayedOrEvolvedTurn < observation.globalTurn;
    if (!eligible) return 0;
    const hasElectrode = hand(observation).some(card =>
      matches(card, PRINT.electrode)) && !boardHas(own(observation), PRINT.electrode);
    const hasRaichu = hand(observation).some(card =>
      matches(card, PRINT.raichu)) && !boardHas(own(observation), PRINT.raichu);
    return hasElectrode ? 215 : hasRaichu ? 205 : 0;
  }

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
    score: scoreDiscardChoice(choice, request)
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
    if (/almighty evolution/i.test(context)) {
      const score = choice => {
        const text = printingValue(choice);
        if (PRINT.electrode.test(text) &&
            !boardHas(own(observation), PRINT.electrode)) return 250;
        if (PRINT.raichu.test(text) &&
            !boardHas(own(observation), PRINT.raichu)) return 240;
        return 0;
      };
      const { minimum, maximum } = choiceBounds(prompt);
      if (meta.selectionType === 'card-combination') {
        return selectMany(choices, score, minimum, Math.min(maximum, 1),
          'NO_STAGE1_EVOLUTION_TARGET');
      }
      return selectOne(choices, score, 'NO_STAGE1_EVOLUTION_TARGET');
    }

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
  if (role !== 'opponent' || (seat !== 0 && seat !== 1) ||
      policyVersion !== POLICY_VERSION || !config ||
      typeof config !== 'object' || Array.isArray(config) ||
      Object.keys(config).length !== 0) {
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


// Rank-17 extension. Concatenate after the immutable rank-4 v2 worker source.
// No imports or native state in the resulting worker. Shared helper functions
// and fixed-attack scoring are inherited from the rank-4 family prototype.
const R17_VERSION = 'agent50-rank17-raichu-electrode-opponent-v1';
const R17_PROFILE = Object.freeze({
  rank: 17,
  sourceListBlobSha1: 'ae773f6201d7aa69d31914dbfee66f3fba692200',
  sourceEntryJsonSha256: '41743dd93f080bff72981d0245b24df7615be3b1d3a03900e673a0dc2b6a2083',
  // SHA256 of compact JSON sorted by [name,set,number,language,count].
  inventoryTupleSha256: '2f23d234c18c648170dca695c51b64554af6f036c800fd9c34eb53b6dcba2ac0',
  familyBaseBlobSha1: '6897cd7f73ad8be8c01eafb97295fed6d74d376e',
  enginePin: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
  configSha256: '44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a',
  config: Object.freeze({})
});

// Within this source-bound actor inventory, each name/set pair is unique.
// Accept actual Twinleaf fullName (normally name + set) and the corresponding
// explicit numbered printing. Reject any different explicit printing.
const R17_PRINT = Object.freeze({
  unown: /^Unown AOR(?: 30)?$/i,
  voltorb: /^Voltorb ROS(?: 21)?$/i,
  electrode: /^Electrode-GX CES(?: 48)?$/i,
  pikachu: /^Pikachu XY(?: 42)?$/i,
  raichu: /^Alolan Raichu UNM(?: 57)?$/i,
  squawk: /^Squawkabilly ex PAL(?: 169)?$/i,
  gengar: /^Gengar & Mimikyu-GX TEU(?: 53)?$/i,
  marshadow: /^Marshadow UNB(?: 81)?$/i,
  klefki: /^Klefki SVI(?: 96)?$/i,
  ditto: /^Ditto (?:♢|◇|Prism Star|\{\*\}) LOT(?: 154)?$/i,
  research: /^Professor['’]s Research JTG(?: 155)?$/i,
  carmine: /^Carmine TWM(?: 145)?$/i,
  vip: /^Battle VIP Pass FST(?: 225)?$/i,
  compressor: /^Battle Compressor(?: Team Flare Gear)? PHF(?: 92)?$/i,
  carrier: /^Rescue Carrier EVS(?: 154)?$/i,
  stretcher: /^Rescue Stretcher GRI(?: 130)?$/i,
  rope: /^Escape Rope BST(?: 125)?$/i,
  mail: /^Trainers['’] Mail ROS(?: 92)?$/i,
  ticket: /^Redeemable Ticket JTG(?: 156)?$/i,
  secret: /^Secret Box TWM(?: 163)?$/i,
  heavy: /^Hisuian Heavy Ball ASR(?: 146)?$/i,
  uturn: /^U-Turn Board UNM(?: 211)?$/i,
  sight: /^Telescopic Sight VIV(?: 160)?$/i,
  pokestop: /^Pok[eé]Stop PGO(?: 68)?$/i,
  reversal: /^Reversal Energy PAL(?: 192)?$/i,
  counter: /^Counter Energy CIN(?: 100)?$/i,
  unit: /^Unit Energy LPM UPR(?: 138)?$/i
});
const R17_BASIC = new Set(['unown','voltorb','pikachu','squawk','gengar','marshadow','klefki','ditto']);
const R17_POKEMON = new Set([...R17_BASIC,'raichu','electrode']);
const R17_ITEM = new Set(['vip','compressor','carrier','stretcher','rope','mail','ticket','secret','heavy']);
const R17_TOOL = new Set(['uturn','sight']);
const R17_SUPPORTER = new Set(['research','carmine']);
const R17_ENERGY = new Set(['unit','reversal','counter']);

function r17Key(value) {
  const text = printingValue(value);
  for (const [key, re] of Object.entries(R17_PRINT)) if (re.test(text)) return key;
  return null;
}
function r17Board(view,key) { return slots(own(view)).some(p=>r17Key(p)===key); }
function r17Hand(view,key) { return hand(view).some(p=>r17Key(p)===key); }
function r17Discard(view) { return list(own(view).discard); }
function r17Missing(view,basic,evolved) { return !r17Board(view,basic)&&!r17Board(view,evolved)&&!r17Hand(view,basic); }
function r17First(view) { return view.globalTurn===1||view.globalTurn===2; }
function r17Space(view) {
  const sky= [...list(own(view).stadium),...list(opponent(view).stadium)].some(c=>/^Sky Field ROS(?: 89)?$/i.test(printingValue(c)));
  return Math.max(0,(sky?8:5)-benchCount(own(view)));
}
function r17Deck(view) {
  const n=own(view).deckCount;
  return Number.isSafeInteger(n)&&n>=0?n:0;
}
function r17Suppressed(slot,name) {
  return list(slot?.abilitySuppressions).some(x=>x.abilityName===name&&x.suppressed===true);
}
function r17Stadium(view) {
  return [...list(own(view).stadium),...list(opponent(view).stadium)].map(printingValue).find(Boolean)||'';
}
function r17BasicLock(view) {
  if (/^Silent Lab\b/i.test(r17Stadium(view))) return true;
  for (const player of [own(view),opponent(view)]) {
    if (r17Key(active(player))==='klefki'&&!r17Suppressed(active(player),'Mischievous Lock')) return true;
    if (slots(player).some(p=>/^Garbodor\b/i.test(printingValue(p))&&
      list(p.tools).length>0&&list(p.abilities).includes('Garbotoxin')&&!r17Suppressed(p,'Garbotoxin'))) return true;
  }
  return false;
}
function r17UnownUseful(view) { return r17Deck(view)>=2&&!r17BasicLock(view); }
function r17NeedTempleRemoval(view) {
  return /^Temple of Sinnoh\b/i.test(r17Stadium(view));
}
function r17CarrierValue(key,view) {
  if (key==='voltorb'&&r17Missing(view,'voltorb','electrode')) return 300;
  if (key==='pikachu'&&r17Missing(view,'pikachu','raichu')) return 290;
  if (key==='unown'&&r17UnownUseful(view)&&r17Space(view)>0) return 150;
  if (key==='marshadow'&&r17NeedTempleRemoval(view)&&!r17Board(view,key)&&!r17Hand(view,key)) return 210;
  return 0; // Ditto is Lost Zone on discard; never assume it is recoverable.
}
function r17RecoveryValue(key,view) {
  if (key==='electrode'&&!r17Board(view,key)&&!r17Hand(view,key)&&r17Board(view,'voltorb')) return 320;
  if (key==='raichu'&&!r17Board(view,key)&&!r17Hand(view,key)&&r17Board(view,'pikachu')) return 320;
  if (key==='gengar'&&!r17Board(view,key)&&!r17Hand(view,key)&&!gxUsed(view)) return 120;
  return r17CarrierValue(key,view);
}
function r17ChoiceCards(prompt,zone) {
  return list(prompt.choices).filter(c=>c.kind==='card'&&typeof c.token==='string'&&
    metadata(c).ownerSeat==='actor'&&metadata(c).isOwnerVisible===true&&
    (!zone||metadata(c).sourceZone===zone)&&r17Key(c)!==null);
}
const R17_ABSTENTION_MAP=Object.freeze({
  R17_BAD_MULTI_PROMPT:'UNSUPPORTED_PROMPT_TYPE',R17_BAD_MULTI_BOUNDS:'BAD_CARD_SELECTION_BOUNDS',
  R17_INSUFFICIENT_SUPPORTED_CHOICES:'NO_LEGAL_CARD_SET',R17_NO_EMPTY_TOKEN:'NO_SUPPORTED_CARD_SELECTION',
  R17_CORE_COMBO_NOT_IMPLEMENTED:'NO_SUPPORTED_ROOT_ACTION',R17_NO_SUPPORTED_ROOT:'NO_SUPPORTED_ROOT_ACTION',
  R17_OPTION_UNAVAILABLE:'UNRECOGNIZED_SIMPLE_PROMPT',R17_BAD_SETUP:'UNTRUSTED_ENGINE_SETUP_PROMPT',
  R17_NO_GO_FIRST:'UNRECOGNIZED_GO_FIRST_CHOICES',R17_BAD_MULLIGAN_OPTION:'INVALID_MULLIGAN_DRAW_OPTIONS',
  R17_UNSUPPORTED_SETUP:'UNSUPPORTED_ENGINE_SETUP_PROMPT',R17_UNTRUSTED_PROMPT:'UNTRUSTED_PROMPT_SOURCE',
  R17_COMPRESSOR_NO_CARRIER_PLAN:'NO_SUPPORTED_CARD_SELECTION',R17_SECRET_BOX_UNKNOWN_ZONE:'UNTRUSTED_CARD_SELECTION',
  R17_CONFIRM_OPTION_MISSING:'UNRECOGNIZED_SIMPLE_PROMPT',R17_UNSUPPORTED_PROMPT:'UNSUPPORTED_PROMPT_TYPE',
  ROLE_SEAT_BINDING_MISMATCH:'ROLE_SEAT_BINDING_MISMATCH'
});
function r17Abstain(reasonCode) {
  return {kind:'abstain',reasonCode:R17_ABSTENTION_MAP[reasonCode]||'UNSUPPORTED_PROMPT_TYPE'};
}
function r17Multi(prompt,rows,limit=Infinity) {
  const m=metadata(prompt);
  if(m.selectionType!=='card-combination'&&m.selectionType!=='pokemon'&&m.selectionType!=='energy-payment'&&m.selectionType!=='prize-slots')
    return r17Abstain('R17_BAD_MULTI_PROMPT');
  if(!Number.isSafeInteger(m.minimumCount)||!Number.isSafeInteger(m.maximumCount)||
      m.minimumCount<0||m.maximumCount<m.minimumCount) return r17Abstain('R17_BAD_MULTI_BOUNDS');
  const selected=rows.slice(0,Math.min(m.maximumCount,limit));
  if(selected.length<m.minimumCount) return r17Abstain('R17_INSUFFICIENT_SUPPORTED_CHOICES');
  if(selected.length===0) {
    const empty=list(prompt.choices).find(c=>c.kind==='empty-selection');
    return empty?{kind:'select-choice',token:empty.token}:r17Abstain('R17_NO_EMPTY_TOKEN');
  }
  return {kind:'select-choices',tokens:selected.map(c=>c.token)};
}
function r17Rank(choices,score) {
  return choices.map((choice,index)=>({choice,index,score:score(choice)}))
    .filter(x=>Number.isFinite(x.score)&&x.score>0)
    .sort((a,b)=>b.score-a.score||a.index-b.index).map(x=>x.choice);
}
function r17UniqueCore(rows) {
  const seen=new Set();
  return rows.filter(c=>{
    const k=r17Key(c);
    if(k==='unown')return true;
    if(seen.has(k))return false;
    seen.add(k);return true;
  });
}
function r17CarrierChoices(prompt,view,zone='discard') {
  const rows=r17UniqueCore(r17Rank(r17ChoiceCards(prompt,zone),c=>r17CarrierValue(r17Key(c),view)));
  return r17Multi(prompt,rows,2);
}
function r17CompressorUseful(view) {
  if(!itemAvailable(view)||!r17Hand(view,'carrier')||r17Space(view)===0) return false;
  if(r17Discard(view).some(c=>r17CarrierValue(r17Key(c),view)>0)) return false;
  return r17Missing(view,'voltorb','electrode')||r17Missing(view,'pikachu','raichu')||
    (r17UnownUseful(view)&&!r17Hand(view,'unown')&&!r17Board(view,'unown'));
}
function r17VipValue(key,view) {
  if(key==='voltorb'&&!r17Board(view,'voltorb')&&!r17Board(view,'electrode')&&!r17Hand(view,'voltorb'))return 300;
  if(key==='pikachu'&&!r17Board(view,'pikachu')&&!r17Board(view,'raichu')&&!r17Hand(view,'pikachu'))return 290;
  if(key==='ditto'&&!r17Board(view,'ditto')&&!r17Hand(view,'ditto')&&
    (!r17Board(view,'electrode')||!r17Board(view,'raichu')))return 190;
  if(key==='unown'&&r17UnownUseful(view))return 150;
  if(key==='marshadow'&&r17NeedTempleRemoval(view)&&!r17Board(view,key))return 210;
  // Squawk and Seize is usable from play on own first turn, not a hand-play trigger.
  if(key==='squawk'&&r17First(view)&&!r17BasicLock(view)&&!r17Board(view,key)&&
     !r17Hand(view,key)&&handCount(view)<=2&&r17Deck(view)>=7)return 140;
  return 0;
}
function r17VipChoices(prompt,view) {
  const rows=r17UniqueCore(r17Rank(r17ChoiceCards(prompt,'deck'),c=>r17VipValue(r17Key(c),view)));
  return r17Multi(prompt,rows,Math.min(2,r17Space(view)));
}
function r17ProtectedHand(view) {
  return hand(view).some(c=>{
    const k=r17Key(c);
    return (k==='pikachu'&&!r17Board(view,'pikachu')&&!r17Board(view,'raichu'))||
      (k==='voltorb'&&!r17Board(view,'voltorb')&&!r17Board(view,'electrode'))||
      (k==='raichu'&&!r17Board(view,'raichu'))||(k==='electrode'&&!r17Board(view,'electrode'));
  });
}
function r17SafeDiscards(cards,view,excluded) {
  const counts=new Map();
  for(const c of hand(view)) {const k=r17Key(c);if(k)counts.set(k,(counts.get(k)||0)+1);}
  if(excluded) counts.set(excluded,Math.max(0,(counts.get(excluded)||0)-1));
  const ordered=cards.filter(c=>r17Key(c)).map((c,i)=>({c,i,k:r17Key(c)}))
    .sort((a,b)=>(Number(b.k==='vip'&&!r17First(view))-Number(a.k==='vip'&&!r17First(view)))||a.i-b.i);
  const picked=[];
  for(const row of ordered) {
    const n=counts.get(row.k)||0;
    if(row.k==='vip'&&!r17First(view)&&n>0 ||
       n>1&&(R17_ITEM.has(row.k)||R17_SUPPORTER.has(row.k)||R17_ENERGY.has(row.k))) {
      picked.push(row.c);counts.set(row.k,n-1);
    }
  }
  return picked;
}
function r17TrainerNeed(key,view) {
  if(key==='vip')return r17First(view)&&r17Space(view)>0?240:0;
  if(key==='carrier')return r17Discard(view).some(c=>r17CarrierValue(r17Key(c),view)>0)?260:90;
  if(key==='compressor')return r17CompressorUseful(view)?240:25;
  if(key==='stretcher')return r17Discard(view).some(c=>r17RecoveryValue(r17Key(c),view)>0)?230:70;
  if(key==='heavy')return r17Missing(view,'voltorb','electrode')||r17Missing(view,'pikachu','raichu')?160:40;
  if(key==='research')return supporterAvailable(view)&&!r17Hand(view,'research')&&r17Deck(view)>=8?190:45;
  if(key==='carmine')return supporterAvailable(view)&&!r17Hand(view,'research')&&r17Deck(view)>=6?145:30;
  if(key==='rope')return r17Space(view)<5?90:45;
  if(key==='uturn')return 120;
  if(key==='sight')return 50;
  if(key==='pokestop')return r17Deck(view)>=12&&benchCount(own(view))<=5?110:0;
  return 0;
}
function r17SecretChoices(prompt,view) {
  const cards=r17ChoiceCards(prompt,'deck'),groups=[R17_ITEM,R17_TOOL,R17_SUPPORTER,new Set(['pokestop'])],rows=[];
  for(const group of groups) {
    const ranked=r17Rank(cards.filter(c=>group.has(r17Key(c))),c=>r17TrainerNeed(r17Key(c),view));
    if(ranked[0])rows.push(ranked[0]);
  }
  return r17Multi(prompt,rows,4);
}
function r17Slot(view,zone,index) {
  if(zone==='active')return active(own(view));
  if(zone==='bench'&&Number.isSafeInteger(index)&&index>=0)return list(own(view).bench)[index];
  return null;
}
function r17OwnAbilitySlot(item,view) {
  const m=metadata(item);
  if(m.sourceSeat!=='actor'||m.sourceZone!=='bench')return null;
  const slot=r17Slot(view,m.sourceZone,m.sourceIndex);
  return slot&&r17Key(slot)===r17Key(item)?slot:null;
}
function r17ScoreAbility(item,view) {
  const key=r17Key(item),name=metadata(item).abilityName||'';
  if(name==='Extra Energy Bomb')return -1000;
  if(key==='unown'&&name==='Farewell Letter') {
    const slot=r17OwnAbilitySlot(item,view);
    return slot&&r17UnownUseful(view)&&!r17Suppressed(slot,name)&&
      list(slot.energies).length===0&&list(slot.tools).length===0?420:0;
  }
  if(key==='marshadow'&&name==='Resetting Hole') {
    const slot=r17OwnAbilitySlot(item,view);
    return slot&&r17NeedTempleRemoval(view)&&!r17Suppressed(slot,name)&&
      list(slot.energies).length===0&&list(slot.tools).length===0?410:0;
  }
  if(key==='squawk'&&name==='Squawk and Seize')return r17First(view)&&r17Deck(view)>=7&&
    handCount(view)<=2&&!r17ProtectedHand(view)&&!r17BasicLock(view)?210:0;
  if(key==='ditto'&&name==='Almighty Evolution') {
    return (r17Hand(view,'electrode')&&!r17Board(view,'electrode')||
      r17Hand(view,'raichu')&&!r17Board(view,'raichu'))?220:0;
  }
  return 0;
}
function r17ScorePlay(item,view) {
  const k=r17Key(item),m=metadata(item),t=r17Key(item.targetPrinting);
  if(!k)return 0;
  if(R17_ITEM.has(k)&&!itemAvailable(view))return 0;
  if(R17_SUPPORTER.has(k)&&!supporterAvailable(view))return 0;
  if(k==='unown')return r17Space(view)>0&&r17UnownUseful(view)?240:0;
  if(k==='voltorb')return r17Space(view)>0&&!r17Board(view,'voltorb')&&!r17Board(view,'electrode')?320:0;
  if(k==='pikachu')return r17Space(view)>0&&!r17Board(view,'pikachu')&&!r17Board(view,'raichu')?310:0;
  if(k==='ditto')return r17Space(view)>0&&!r17Board(view,k)&&
    (!r17Board(view,'electrode')||!r17Board(view,'raichu'))?190:0;
  if(k==='electrode'||k==='raichu')return m.targetSeat==='actor'&&
    (k==='electrode'?t==='voltorb':t==='pikachu')?340:0;
  if(k==='marshadow')return r17Space(view)>0&&r17NeedTempleRemoval(view)&&!r17BasicLock(view)?300:0;
  if(k==='squawk')return r17Space(view)>0&&r17First(view)&&r17Deck(view)>=7&&
    handCount(view)<=3&&!r17ProtectedHand(view)&&!r17BasicLock(view)?190:0;
  if(k==='gengar')return r17Space(view)>0&&!r17Board(view,k)&&!gxUsed(view)&&r17Hand(view,'unit')?145:0;
  if(k==='vip')return r17First(view)&&r17Space(view)>0?350:0;
  if(k==='carrier')return r17Discard(view).some(c=>r17CarrierValue(r17Key(c),view)>0)?290:0;
  if(k==='compressor')return r17CompressorUseful(view)?250:0;
  if(k==='stretcher')return r17Discard(view).some(c=>r17RecoveryValue(r17Key(c),view)>0)?275:0;
  if(k==='mail')return r17Deck(view)>=2?175:0;
  if(k==='heavy')return r17Missing(view,'voltorb','electrode')||r17Missing(view,'pikachu','raichu')?160:0;
  if(k==='secret')return r17SafeDiscards(hand(view),view,'secret').length>=3?155:0;
  if(k==='research'||k==='carmine')return !r17ProtectedHand(view)&&handCount(view)<=3&&
    r17Deck(view)>=(k==='research'?8:6)?205:0;
  if(k==='pokestop'&&/^Sky Field\b/i.test(r17Stadium(view))&&benchCount(own(view))>5)return 0;
  if(k==='pokestop')return r17Deck(view)>=12&&!r17NeedTempleRemoval(view)&&
    !/^Pok[eé]Stop\b/i.test(r17Stadium(view))?110:r17NeedTempleRemoval(view)?300:0;
  if(k==='uturn') {
    const s=r17Slot(view,m.targetZone,m.targetIndex);
    return m.targetSeat==='actor'&&m.targetZone==='active'&&s&&list(s.tools).length===0&&
      list(s.printed?.retreatCost).length===1&&benchCount(own(view))>0?130:0;
  }
  if(k==='sight'||k==='ticket'||k==='klefki')return 0; // tactical paths not yet implemented.
  if(k==='rope')return 0; // do not spend irreversible forced switch without the paired opponent response.
  if(R17_ENERGY.has(k)&&m.targetSeat==='actor') {
    if(k==='unit'&&t==='gengar')return 210;
    if(t==='raichu'||t==='pikachu')return k==='unit'?190:
      Number.isSafeInteger(own(view).prizeCount)&&Number.isSafeInteger(opponent(view).prizeCount)&&
      own(view).prizeCount>opponent(view).prizeCount?180:0;
  }
  return 0;
}
function r17Score(item,request) {
  const view=request.observation,m=metadata(item);
  if(item.kind==='use-ability')return r17ScoreAbility(item,view);
  if(item.kind==='play-card')return r17ScorePlay(item,view);
  if(item.kind==='use-stadium'&&r17Key(item)==='pokestop')return r17Deck(view)>=12&&m.stadiumEffectLive===true?125:0;
  if(item.kind==='attack') {
    const attack=item.attackName||'';
    if(!R17_POKEMON.has(r17Key(item)))return 0;
    if(/^(Electro Rain|Crush and Burn-GX)$/i.test(attack))return -1000;
    // Only these shared rank-4 attacks have an existing decision heuristic.
    if(/^(Horror House-GX|Poltergeist|Electric Ball|Electro Ball|Joust)$/i.test(attack))return scoreAttack(item,view);
    if(/^(Hidden Power|Quick Attack|Nuzzle|Thunder Wave|Red Knuckles|Big Explosion)$/i.test(attack))
      return attack==='Big Explosion'?0:35;
    return 0;
  }
  if(item.kind==='retreat'&&m.targetSeat==='actor'&&m.targetZone==='bench') {
    const s=r17Slot(view,'bench',m.targetIndex);
    if(s&&r17Key(s)==='raichu'&&list(s.energies).length>=1)return 115;
    if(s&&r17Key(s)==='gengar'&&list(s.energies).some(e=>r17Key(e)==='unit')&&!gxUsed(view))return 150;
  }
  return 0;
}
function r17Best(request) {
  const items=list(request.actionFrontier?.items).filter(i=>EXECUTABLE.has(i.kind));
  const ranked=r17Rank(items,i=>r17Score(i,request));
  if(ranked[0])return {kind:'select-action',token:ranked[0].token};
  if(items.some(i=>r17Score(i,request)<0))return r17Abstain('R17_CORE_COMBO_NOT_IMPLEMENTED');
  const pass=items.find(i=>i.kind==='pass');
  return pass?{kind:'select-action',token:pass.token}:r17Abstain('R17_NO_SUPPORTED_ROOT');
}
function r17Option(prompt,index) {
  const c=list(prompt.choices).find(x=>x.kind==='option'&&metadata(x).choiceIndex===index);
  return c?{kind:'select-choice',token:c.token}:r17Abstain('R17_OPTION_UNAVAILABLE');
}
function r17Setup(request) {
  const p=request.prompt,v=request.observation,s=p.source;
  if(v.phase!==1||s.sourcePrinting!==null||s.effectName!==p.description)return r17Abstain('R17_BAD_SETUP');
  if(s.effectName==='GO_FIRST'&&p.promptType==='ConfirmPrompt') {
    const c=list(p.choices).find(x=>x.kind==='confirm'&&x.label==='Yes');
    return c?{kind:'select-choice',token:c.token}:r17Abstain('R17_NO_GO_FIRST');
  }
  if(s.effectName==='WANT_TO_DRAW_CARDS'&&p.promptType==='SelectPrompt') {
    const count=metadata(p).count;
    const c=list(p.choices).find(x=>x.kind==='option'&&metadata(x).choiceIndex===0&&x.label==='Draw '+(count-1)+' card(s)');
    return Number.isSafeInteger(count)&&count>0&&c?{kind:'select-choice',token:c.token}:r17Abstain('R17_BAD_MULLIGAN_OPTION');
  }
  if(s.effectName==='CHOOSE_STARTING_POKEMONS'&&p.promptType==='ChooseCardsPrompt') {
    const rows=r17ChoiceCards(p,'hand').filter(c=>R17_BASIC.has(r17Key(c)));
    // Native order, not an assertion of optimal Active selection. Avoid
    // setup-only overcommitment of multi-Prize bodies; initial minimum=1.
    let picked=rows.filter(c=>!['gengar','squawk','klefki'].includes(r17Key(c)));
    if(metadata(p).minimumCount===1&&picked.length===0)picked=rows.slice(0,1);
    return r17Multi(p,picked);
  }
  return r17Abstain('R17_UNSUPPORTED_SETUP');
}
function r17Prompt(request) {
  const p=request.prompt,v=request.observation,s=p?.source;
  if(!s||s.classification!=='actor-choice')return r17Abstain('R17_UNTRUSTED_PROMPT');
  if(s.sourceKind==='engine')return r17Setup(request);
  if(s.sourceKind!=='card-effect')return r17Abstain('R17_UNTRUSTED_PROMPT');
  const key=r17Key(s.sourcePrinting),effect=s.effectName||'',type=p.promptType;
  if(/Extra Energy Bomb|Electro Rain|Crush and Burn/i.test(effect))return r17Abstain('R17_UNSUPPORTED_PROMPT');
  if(type==='ChooseCardsPrompt') {
    if(key==='carrier')return r17CarrierChoices(p,v);
    if(key==='compressor')return r17CompressorUseful(v)?
      r17CarrierChoices(p,v,'deck'):r17Abstain('R17_COMPRESSOR_NO_CARRIER_PLAN');
    if(key==='vip')return r17VipChoices(p,v);
    if(key==='stretcher')return r17Multi(p,r17Rank(r17ChoiceCards(p,'discard'),c=>r17RecoveryValue(r17Key(c),v)),1);
    if(key==='mail')return r17Multi(p,r17Rank(r17ChoiceCards(p,'deck'),c=>r17TrainerNeed(r17Key(c),v)),1);
    if(key==='secret') {
      const zone=metadata(p).sourceZone;
      if(zone==='hand')return r17Multi(p,r17SafeDiscards(r17ChoiceCards(p,'hand'),v,null),3);
      if(zone==='deck')return r17SecretChoices(p,v);
      return r17Abstain('R17_SECRET_BOX_UNKNOWN_ZONE');
    }
    if(key==='ditto'&&effect==='Almighty Evolution') {
      return r17Multi(p,r17Rank(r17ChoiceCards(p,'hand'),c=>{
        const k=r17Key(c);
        if(k==='raichu'&&!r17Board(v,'raichu'))return r17Board(v,'electrode')||r17Board(v,'voltorb')?240:180;
        if(k==='electrode'&&!r17Board(v,'electrode'))return r17Board(v,'raichu')||r17Board(v,'pikachu')?240:190;
        return 0;
      }),1);
    }
    if(key==='heavy')return r17Multi(p,r17Rank(r17ChoiceCards(p,'prizes'),c=>r17VipValue(r17Key(c),v)),1);
  }
  if(key==='stretcher'&&(type==='SelectOptionPrompt'||type==='SelectPrompt')) {
    // Exact printed option 0 is recover one to hand; shuffle-three mode
    // is deliberately unimplemented rather than guessed at its continuation.
    if(r17Discard(v).some(c=>r17RecoveryValue(r17Key(c),v)>0))return r17Option(p,0);
  }
  if((key==='unown'&&effect==='Farewell Letter'||key==='marshadow'&&effect==='Resetting Hole'||
      key==='squawk'&&effect==='Squawk and Seize')&&type==='ConfirmPrompt') {
    const ok=key==='unown'?r17UnownUseful(v):key==='marshadow'?r17NeedTempleRemoval(v):
      r17First(v)&&r17Deck(v)>=7&&!r17ProtectedHand(v);
    const c=list(p.choices).find(x=>x.kind==='confirm'&&x.label===(ok?'Yes':'No'));
    return c?{kind:'select-choice',token:c.token}:r17Abstain('R17_CONFIRM_OPTION_MISSING');
  }
  // Host projection for ordinary face-down Prize choice is opaque; no
  // hidden identity is inferred. Use position only for actual Prize-taking,
  // never for a Heavy Ball effect without visible owner-authorized identities.
  if(type==='ChoosePrizePrompt'&&key!=='heavy'&&key!=='ticket') {
    const choices=list(p.choices).filter(x=>x.kind==='prize'&&metadata(x).ownerSeat==='actor');
    if(choices.length&&metadata(p).selectionType==='prize-slots'&&R17_POKEMON.has(key))
      return r17Multi(p,choices,metadata(p).minimumCount);
  }
  return r17Abstain('R17_UNSUPPORTED_PROMPT');
}
function r17CreatePolicy({role,seat,policyVersion,config}) {
  if(role!=='opponent'||![0,1].includes(seat)||policyVersion!==R17_VERSION||
     !config||typeof config!=='object'||Array.isArray(config)||Object.keys(config).length)
    throw Error('AGENT50_RANK17_POLICY_INIT_MISMATCH');
  return Object.freeze({decide(request){
    if(!request||request.role!==role||request.seat!==seat||request.observation?.actorSeat!==seat)
      return r17Abstain('ROLE_SEAT_BINDING_MISMATCH');
    return request.prompt!==null?r17Prompt(request):r17Best(request);
  }});
}
module.exports = Object.freeze({
  POLICY_VERSION:R17_VERSION,SOURCE_RANK:17,
  SOURCE_LIST_BLOB_SHA1:R17_PROFILE.sourceListBlobSha1,
  SOURCE_ENTRY_JSON_SHA256:R17_PROFILE.sourceEntryJsonSha256,
  ENGINE_PIN:R17_PROFILE.enginePin,PROFILE:R17_PROFILE,createPolicy:r17CreatePolicy,
  scoreAction:r17Score,promptDecision:r17Prompt,bestAction:r17Best
});
