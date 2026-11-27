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
// Fixed own inventory only. K1 inference never consumes opponent hidden
// state, RNG, Prize order, or a native object. Missing/invalid certificate
// and any unresolved ownership discrepancy fail closed.
const R17_COUNTS=Object.freeze({
  unown:4,voltorb:2,electrode:3,pikachu:1,raichu:2,squawk:2,gengar:1,
  marshadow:1,klefki:1,ditto:1,research:3,carmine:1,vip:4,compressor:4,
  carrier:4,stretcher:3,rope:3,mail:2,ticket:1,secret:1,heavy:1,uturn:1,
  sight:1,pokestop:1,reversal:4,counter:4,unit:4
});
function r17CardCounts(rows) {
  if(!Array.isArray(rows))return null;
  const out={};
  for(const c of rows){const k=r17Key(c);if(!k)return null;out[k]=(out[k]||0)+1;}
  return out;
}
function r17SameCounts(a,b) {
  return Object.keys(R17_COUNTS).every(k=>(a[k]||0)===(b[k]||0));
}
function r17KnownOwnZones(view) {
  const p=own(view),k1=view.ownerK1;
  if(view.decisionKind!=='owner-root'||view.pendingPromptType!=null||
     !k1||k1.exactMembershipKnown!==true||k1.invalidationReason!==null||
     !Number.isSafeInteger(k1.epoch)||k1.epoch<0||!Array.isArray(k1.knownPrintings)||
     !Array.isArray(view.ownHand)||!Array.isArray(p.bench)||!Array.isArray(p.prizeSlots)||
     !Number.isSafeInteger(p.deckCount)||p.deckCount<0||
     !Number.isSafeInteger(p.prizeCount)||p.prizeCount<0||p.prizeCount>6||
     p.prizeSlots.length!==p.prizeCount||view.ownHand.length!==p.handCount||
     !Array.isArray(p.resolvingSupporter)||p.resolvingSupporter.length!==0)return null;
  const deck={},publicCounts={},lost={},prizes={...R17_COUNTS},faceUp={};
  function add(into,key,n=1){into[key]=(into[key]||0)+n;}
  function addRows(into,rows){
    const counts=r17CardCounts(rows);if(!counts)return false;
    for(const [k,n] of Object.entries(counts))add(into,k,n);
    return true;
  }
  for(const row of k1.knownPrintings){
    const key=r17Key(row?.printing);
    if(!key||!Number.isSafeInteger(row.copies)||row.copies<=0||
       Object.hasOwn(deck,key))return null;
    deck[key]=row.copies;
  }
  if(Object.values(deck).reduce((n,c)=>n+c,0)!==p.deckCount)return null;
  for(const zone of [view.ownHand,p.discard,p.stadium])
    if(!addRows(publicCounts,zone))return null;
  if(!addRows(lost,p.lostZone))return null;
  for(const slot of [p.active,...p.bench]){
    if(slot===null||slot===undefined)continue;
    const top=r17Key(slot),stack=r17CardCounts(slot.evolutionPrintings),
      energies=r17CardCounts(slot.energies),tools=r17CardCounts(slot.tools);
    if(!R17_POKEMON.has(top)||!stack||!energies||!tools||!(stack[top]>0))return null;
    const pokemon={},stackEnergy={},stackTools={};
    for(const [key,n] of Object.entries(stack)) {
      if(R17_POKEMON.has(key))pokemon[key]=n;
      else if(R17_ENERGY.has(key))stackEnergy[key]=n;
      else if(R17_TOOL.has(key))stackTools[key]=n;
      else return null;
    }
    const depth=Object.values(pokemon).reduce((n,c)=>n+c,0);
    if(depth<1||depth>2||
       Object.keys(energies).some(k=>!R17_ENERGY.has(k))||
       Object.keys(tools).some(k=>!R17_TOOL.has(k))||
       (Object.keys(stackEnergy).length&&!r17SameCounts(stackEnergy,energies))||
       (Object.keys(stackTools).length&&!r17SameCounts(stackTools,tools)))return null;
    // Evolution stack may duplicate attachment projections; count each
    // physical Pokémon and the authoritative attachment lists exactly once.
    for(const counts of [pokemon,energies,tools])
      for(const [key,n] of Object.entries(counts))add(publicCounts,key,n);
  }
  for(const key of Object.keys(R17_COUNTS)){
    prizes[key]-=(deck[key]||0)+(publicCounts[key]||0)+(lost[key]||0);
    if(prizes[key]<0)return null;
  }
  if(Object.values(prizes).reduce((n,c)=>n+c,0)!==p.prizeCount)return null;
  const indices=new Set();
  for(const slot of p.prizeSlots){
    if(!Number.isSafeInteger(slot?.index)||slot.index<0||slot.index>=6||indices.has(slot.index))return null;
    indices.add(slot.index);
    if(slot.printing!=null){
      const key=r17Key(slot.printing);if(!key)return null;add(faceUp,key);
    }
  }
  if(Object.entries(faceUp).some(([key,n])=>n>prizes[key]))return null;
  return {epoch:k1.epoch,deck,prizes,publicCounts,lost};
}
function r17TicketPlan(view) {
  const zones=r17KnownOwnZones(view),p=own(view);
  if(!zones||!itemAvailable(view)||!r17Hand(view,'ticket')||
     p.prizeCount===0||p.deckCount<p.prizeCount)return null;
  const isolated=key=>zones.prizes[key]>0&&(zones.deck[key]||0)===0&&
    (zones.publicCounts[key]||0)===0;
  const compressor=r17Hand(view,'compressor'),stretcher=r17HandCount(view,'stretcher'),
    carrier=r17HandCount(view,'carrier'),vip=r17First(view)&&r17Hand(view,'vip');
  // Ticket puts old Prizes at the bottom, NOT into hand. Require an
  // already-funded subsequent whole-deck search/recovery route.
  const evos=r17EvolutionDemand(view),discard=new Set(r17Discard(view).map(r17Key));
  const existingEvos=evos.filter(k=>discard.has(k)).length;
  for(const key of evos){
    if(isolated(key)&&compressor&&stretcher>existingEvos)
      return {target:key,followup:'compressor-stretcher',epoch:zones.epoch};
  }
  // A singleton Marshadow can be just as strategically isolated as a
  // starter when a hostile Stadium blocks the engine. Ticket only becomes
  // useful if the rerolled card has a funded deck->discard->hand route.
  if(r17NeedStadiumRemoval(view)&&isolated('marshadow')&&!r17Hand(view,'heavy')&&
     !r17Board(view,'marshadow')&&!r17Hand(view,'marshadow')) {
    const carrierDemand=r17CoreAccess(view).carrierKeys.length;
    if(vip&&r17Space(view)>0)
      return {target:'marshadow',followup:'vip',epoch:zones.epoch};
    if(compressor&&2*carrier>carrierDemand)
      return {target:'marshadow',followup:'compressor-carrier',epoch:zones.epoch};
  }
  const missing=r17MissingCore(view),existingBases=missing.filter(k=>discard.has(k)).length;
  if(r17Space(view)>existingBases&&!r17Hand(view,'heavy')&&
     (!r17CoreBaseReady(view,'ditto')||r17AbilityBlocked(view,'ditto'))&&
     !(vip&&(zones.deck.ditto||0)>0&&!r17AbilityBlocked(view,'ditto'))){
    for(const key of missing){
      const carrierSlot=2*carrier>existingBases;
      const stretcherSlot=carrier===0&&stretcher>existingEvos+existingBases&&
        r17Hand(view,key==='pikachu'?'raichu':'electrode');
      if(isolated(key)&&(vip||compressor&&(carrierSlot||stretcherSlot)))
        return {target:key,followup:vip?'vip':carrierSlot?'compressor-carrier':'compressor-stretcher',epoch:zones.epoch};
    }
  }
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
  if(r17StadiumToolLive(view)&&/^Silent Lab\b/i.test(r17Stadium(view)))return true;
  if(r17Garbotoxin(view))return true;
  if([own(view),opponent(view)].some(player=>r17LiveKlefki(view,active(player))))return true;
  if(slots(opponent(view)).some(p=>/^Alolan Muk\b/i.test(printingValue(p))&&
    list(p.abilities).includes('Power of Alchemy')&&!r17Suppressed(p,'Power of Alchemy')))return true;
  return false;
}
function r17IsWob(p) {return /^Wobbuffet PHF(?: 36)?$/i.test(printingValue(p));}
function r17LiveHood(view,p) {return r17ToolEffectsLive(view)&&list(p?.tools).some(t=>/^Stealthy Hood UNB(?: 186)?$/i.test(printingValue(t)));}
function r17Garbotoxin(view) {
  return r17StadiumToolLive(view)&&[own(view),opponent(view)].some(player=>slots(player).some(p=>
    /^Garbodor\b/i.test(printingValue(p))&&list(p.tools).length>0&&
    list(p.abilities).includes('Garbotoxin')&&!r17Suppressed(p,'Garbotoxin')));
}
function r17LiveKlefki(view,p) {
  return r17Key(p)==='klefki'&&!r17Suppressed(p,'Mischievous Lock')&&
    !r17Garbotoxin(view)&&!(r17StadiumToolLive(view)&&/^Silent Lab\b/i.test(r17Stadium(view)));
}
function r17WobLive(view) {
  const wob=active(opponent(view));
  if(!r17IsWob(wob)||r17Suppressed(wob,'Bide Barricade')||r17Garbotoxin(view)||
    r17StadiumToolLive(view)&&/^Silent Lab\b/i.test(r17Stadium(view)))return false;
  // Psychic Klefki is not suppressed by Bide Barricade. Its Basic lock
  // suppresses the opposing Wobbuffet unless live Hood protects it.
  if(r17LiveKlefki(view,active(own(view)))&&!r17LiveHood(view,wob))return false;
  return true;
}
function r17AbilityBlocked(view,key,slot=null,name='') {
  if(slot&&name&&r17Suppressed(slot,name))return true;
  if(r17Garbotoxin(view))return true;
  const oppActive=active(opponent(view));
  if(/^Galarian Weezing\b/i.test(printingValue(oppActive))&&
     list(oppActive?.abilities).includes('Neutralizing Gas')&&!r17Suppressed(oppActive,'Neutralizing Gas'))return true;
  const ruleBox=key==='electrode'||key==='squawk'||key==='ditto';
  if(ruleBox&&r17StadiumToolLive(view)&&/^Path to the Peak\b/i.test(r17Stadium(view)))return true;
  if(key==='electrode'&&r17StadiumToolLive(view)&&/^Power Plant\b/i.test(r17Stadium(view)))return true;
  if(ruleBox&&/^Iron Thorns ex\b/i.test(printingValue(oppActive))&&
     list(oppActive?.abilities).includes('Initialization')&&!r17Suppressed(oppActive,'Initialization'))return true;
  if(['electrode','ditto','squawk'].includes(key)&&r17WobLive(view))return true;
  if(R17_BASIC.has(key)&&key!=='klefki'&&r17BasicLock(view))return true;
  return false;
}
function r17LiveBombs(view) {
  const o=opponent(view);
  if(!Number.isSafeInteger(o.prizeCount)||o.prizeCount<=2)return [];
  return slots(own(view)).filter(p=>r17Key(p)==='electrode'&&
    !r17AbilityBlocked(view,'electrode',p,'Extra Energy Bomb')).slice(0,Math.min(2,Math.floor((o.prizeCount-1)/2)));
}
function r17DepartingKlefkiRelocks(view) {
  const a=active(own(view)),w=active(opponent(view));
  return r17LiveKlefki(view,a)&&r17IsWob(w)&&!r17LiveHood(view,w)&&
    !r17WobLive(view)&&r17LiveBombs(view).length>0;
}
function r17JoustUnlocksBomb(view) {
  const a=active(own(view)),w=active(opponent(view));
  if(!r17LiveKlefki(view,a)||!r17IsWob(w)||!r17LiveHood(view,w))return false;
  const stripped={...view,opponentPublic:{...opponent(view),active:{...w,tools:[]}}};
  return r17LiveBombs(stripped).length>0;
}
function r17UnownUseful(view) { return r17Deck(view)>=2&&!r17AbilityBlocked(view,'unown'); }
function r17StadiumToolLive(view) {
  return ![own(view),opponent(view)].some(p=>Number(p.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining)>0);
}
function r17ToolEffectsLive(view) {
  return r17StadiumToolLive(view)&&!/^Jamming Tower\b/i.test(r17Stadium(view));
}
function r17NeedTempleRemoval(view) {
  return r17StadiumToolLive(view)&&/^Temple of Sinnoh\b/i.test(r17Stadium(view));
}
function r17NeedStadiumRemoval(view) {
  if(!r17StadiumToolLive(view))return false;
  const stadium=r17Stadium(view);
  if(/^Temple of Sinnoh\b/i.test(stadium))return true;
  if(/^Path to the Peak\b/i.test(stadium))
    return slots(own(view)).some(p=>{
      const k=r17Key(p);
      if(k==='electrode')return r17AbilityBlocked(view,k,p);
      if(k==='ditto')return r17AbilityBlocked(view,k,p)&&
        ['raichu','electrode'].some(e=>r17Hand(view,e)&&r17DittoEvolutionScore(e,view)>0);
      if(k==='squawk')return r17AbilityBlocked(view,k,p)&&r17First(view)&&r17DrawDiscardScore(view,6)>0;
      return false;
    });
  if(/^Power Plant\b/i.test(stadium))
    return slots(own(view)).some(p=>r17Key(p)==='electrode'&&r17AbilityBlocked(view,'electrode',p));
  if(/^Silent Lab\b/i.test(stadium))
    return slots(own(view)).some(p=>{
      const k=r17Key(p);
      if(k==='ditto')return r17AbilityBlocked(view,k,p)&&
        ['raichu','electrode'].some(e=>r17Hand(view,e)&&r17DittoEvolutionScore(e,view)>0);
      if(k==='squawk')return r17AbilityBlocked(view,k,p)&&r17First(view)&&r17DrawDiscardScore(view,6)>0;
      return false;
    });
  if(/^Jamming Tower\b/i.test(stadium)){
    const cleared=r17ProjectStadiumRemoved(view);
    return slots(own(view)).some((p,index)=>{
      if(r17Key(p)!=='raichu'||!list(p.tools).some(t=>r17Key(t)==='sight'))return false;
      const q=index===0?active(own(cleared)):own(cleared).bench[index-1];
      return r17CompareProjection(r17RainProjection(cleared,q),r17RainProjection(view,p))>0;
    });
  }
  return false;
}
function r17CarrierValue(key,view) {
  if (key==='voltorb'&&r17Missing(view,'voltorb','electrode')) return 300;
  if (key==='pikachu'&&r17Missing(view,'pikachu','raichu')) return 290;
  if (key==='unown'&&r17UnownUseful(view)&&r17Space(view)>0) return 150;
  if (key==='marshadow'&&r17NeedStadiumRemoval(view)&&!r17Board(view,key)&&!r17Hand(view,key)) return 500;
  return 0; // Ditto is Lost Zone on discard; never assume it is recoverable.
}
function r17HandCount(view,key) { return hand(view).filter(c=>r17Key(c)===key).length; }
function r17CoreBaseReady(view,key) {
  return r17Board(view,key)||(r17Hand(view,key)&&r17Space(view)>0);
}
function r17EvolutionDemand(view,plannedBasics=[]) {
  const demand=[];
  const ditto=r17CoreBaseReady(view,'ditto')&&!r17AbilityBlocked(view,'ditto');
  let dittoUsed=false;
  // First reserve an actual species-compatible base. Only the remaining
  // demand may consume a single Ditto; one Ditto never supplies two Stage 1s.
  for(const [e,b] of [['raichu','pikachu'],['electrode','voltorb']]) {
    if(r17Board(view,e)||r17Hand(view,e))continue;
    if(r17CoreBaseReady(view,b)||plannedBasics.includes(b))demand.push(e);
  }
  // If a held evolution already needs the single Ditto, reserve it.
  // A second evolution is not a second independent compatible base.
  if(ditto)dittoUsed=[['raichu','pikachu'],['electrode','voltorb']].some(([e,b])=>
    !r17Board(view,e)&&r17Hand(view,e)&&!r17CoreBaseReady(view,b)&&!plannedBasics.includes(b));
  for(const [e,b] of [['raichu','pikachu'],['electrode','voltorb']]) {
    if(!ditto||dittoUsed||r17Board(view,e)||r17Hand(view,e)||demand.includes(e))continue;
    demand.push(e);dittoUsed=true;
  }
  return demand;
}
function r17RecoveryValue(key,view) {
  const evolutions=r17EvolutionDemand(view);
  if(evolutions.includes(key))return key==='raichu'?335:330;
  if(key==='gengar'&&!r17Board(view,key)&&!r17Hand(view,key)&&!gxUsed(view))return 120;
  // A Carrier already in hand can retrieve low-HP Basics for two slots.
  // Do not spend the scarce one-card Stretcher on the same target if
  // Carrier is available; its future role is Stage 1 recovery.
  const basic=r17CarrierValue(key,view);
  if(basic>0&&r17Hand(view,'carrier'))return 0;
  return basic;
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
  const minimum=m.selectionType==='prize-slots'?m.requiredCount:m.minimumCount;
  const maximum=m.selectionType==='prize-slots'?m.requiredCount:m.maximumCount;
  if(!Number.isSafeInteger(minimum)||!Number.isSafeInteger(maximum)||
      minimum<0||maximum<minimum) return r17Abstain('R17_BAD_MULTI_BOUNDS');
  const selected=rows.slice(0,Math.min(maximum,limit));
  if(selected.length<minimum) return r17Abstain('R17_INSUFFICIENT_SUPPORTED_CHOICES');
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
function r17TakeKeys(cards,keys,limit=Infinity) {
  const remaining=cards.slice(),rows=[];
  for(const key of keys){
    if(rows.length>=limit)break;
    const i=remaining.findIndex(c=>r17Key(c)===key);
    if(i>=0)rows.push(...remaining.splice(i,1));
  }
  return rows;
}
function r17CarrierChoices(prompt,view,zone='discard') {
  const cards=r17ChoiceCards(prompt,zone),counts=r17CardCounts(cards)||{};
  const plan=r17CoreAccess(view,{}, {carrier:1,discardCounts:{voltorb:counts.voltorb||0,pikachu:counts.pikachu||0}});
  const urgent=r17Rank(cards.filter(c=>r17Key(c)==='marshadow'),
    c=>r17CarrierValue('marshadow',view))[0]||null;
  // A hostile Stadium makes Marshadow a prerequisite rather than a filler.
  // Reserve one of Carrier's two physical recovery slots before selecting
  // core starters; otherwise two missing basics can crowd out the answer.
  const seed=urgent?[urgent]:[],used=new Set(seed.map(c=>c.token));
  const core=r17TakeKeys(cards.filter(c=>!used.has(c.token)),plan.carrierKeys,2-seed.length);
  core.forEach(c=>used.add(c.token));
  const fill=r17Rank(cards.filter(c=>!used.has(c.token)&&!R17_CORE_KEYS.includes(r17Key(c))),
    c=>r17CarrierValue(r17Key(c),view));
  return r17Multi(prompt,[...seed,...core,...fill],2);
}
function r17StretcherShuffleValue(key,view) {
  if(key==='raichu')return 500;
  if(key==='electrode')return 480;
  if(key==='pikachu')return 420;
  if(key==='voltorb')return 410;
  if(key==='gengar')return gxUsed(view)?160:360;
  if(key==='marshadow')return 300;
  if(key==='unown')return 260;
  if(key==='klefki')return 220;
  if(key==='squawk')return 200;
  return 0;
}
function r17StretcherShufflePlan(view,cards=r17Discard(view)) {
  if(r17Deck(view)>2)return [];
  const rows=cards.filter(c=>R17_POKEMON.has(r17Key(c))&&r17Key(c)!=='ditto');
  if(rows.length<3)return [];
  return r17Rank(rows,c=>r17StretcherShuffleValue(r17Key(c),view)).slice(0,3);
}
function r17StretcherChoices(prompt,view) {
  const cards=r17ChoiceCards(prompt,'discard'),m=metadata(prompt);
  const shuffleMode=(m.requiredCount===3)||(m.minimumCount===3&&m.maximumCount===3);
  if(shuffleMode)return r17Multi(prompt,r17StretcherShufflePlan(view,cards),3);
  const counts=r17CardCounts(cards)||{},discardCounts={};
  for(const key of R17_CORE_KEYS)discardCounts[key]=counts[key]||0;
  const plan=r17CoreAccess(view,{}, {stretcher:1,discardCounts});
  const rows=r17TakeKeys(cards,plan.stretcherKeys,1);
  if(rows.length)return r17Multi(prompt,rows,1);
  return r17Multi(prompt,r17Rank(cards.filter(c=>!R17_CORE_KEYS.includes(r17Key(c))),
    c=>r17RecoveryValue(r17Key(c),view)),1);
}
function r17MissingCore(view) {
  return [['voltorb','electrode'],['pikachu','raichu']].filter(([b,e])=>r17Missing(view,b,e)).map(([b])=>b);
}
function r17BoardCount(view,key) {return slots(own(view)).filter(p=>r17Key(p)===key).length;}
function r17SecondBombUseful(view) {
  const p=own(view),o=opponent(view);
  // Two Electrode self-KOs cost four opposing Prize cards. Do not set up
  // that second liability solely for the simultaneous combo when it would
  // already lose, or when too little Special Energy remains to benefit.
  const energyLost=list(p.lostZone).filter(c=>R17_ENERGY.has(r17Key(c))).length;
  return (view.phase===1||Number.isSafeInteger(o.prizeCount)&&o.prizeCount>=5&&
    Number.isSafeInteger(p.prizeCount)&&p.prizeCount>=4)&&12-energyLost>=6;
}
const R17_CORE_KEYS=Object.freeze(['voltorb','pikachu','raichu','electrode']);
function r17CoreSequence(n) {
  // First distinct species before duplicate copies, then second copies.
  // This order serves both physical prompt selection and Carrier capacity.
  const result=[];
  for(let i=1;i<=3;i++)for(const k of R17_CORE_KEYS)if((n[k]||0)>=i)result.push(k);
  return result;
}
function r17CoreAccess(view,deckCounts={},extra={}) {
  const desiredE=r17SecondBombUseful(view)?2:1,desiredR=1,space=r17Space(view);
  const b={},h={},d={...(r17CardCounts(r17Discard(view))||{}),...(extra.discardCounts||{})};
  for(const k of [...R17_CORE_KEYS,'ditto']){b[k]=r17BoardCount(view,k);h[k]=r17HandCount(view,k);}
  const carrier=2*(r17HandCount(view,'carrier')+(extra.carrier||0));
  const stretcher=r17HandCount(view,'stretcher')+(extra.stretcher||0);
  const max={
    voltorb:Math.max(0,desiredE-b.electrode-b.voltorb-h.voltorb),
    pikachu:Math.max(0,desiredR-b.raichu-b.pikachu-h.pikachu),
    electrode:Math.max(0,desiredE-b.electrode-h.electrode),
    raichu:Math.max(0,desiredR-b.raichu-h.raichu)
  };
  const budget=Math.min(3,Math.max(0,extra.searchLimit??3));
  const dittoEnabled=!r17AbilityBlocked(view,'ditto');
  let best=null;
  function compare(a,z){
    if(!z)return 1;
    for(let i=0;i<a.length;i++)if(a[i]!==z[i])return a[i]>z[i]?1:-1;
    return 0;
  }
  // Enumerate recovery counts, not card permutations: at most
  // 3*2*2*3=36 vectors. Derive the minimum Compressor search count and
  // exact Carrier/Stretcher consumption for each, then enumerate bench
  // placements and the mutually exclusive assignment of one Ditto.
  for(let v=0;v<=max.voltorb;v++)for(let p=0;p<=max.pikachu;p++)
    for(let r=0;r<=max.raichu;r++)for(let e=0;e<=max.electrode;e++){
      const rec={voltorb:v,pikachu:p,raichu:r,electrode:e},search={};
      const baseRec=v+p,evoRec=r+e,carrierUsed=Math.min(carrier,baseRec),
        stretcherUsed=evoRec+baseRec-carrierUsed;
      if(stretcherUsed>stretcher)continue;
      let valid=true,totalSearch=0;
      for(const key of R17_CORE_KEYS){
        const n=Math.max(0,rec[key]-(d[key]||0));
        if(n>(deckCounts[key]||0)){valid=false;break;}
        search[key]=n;totalSearch+=n;
      }
      if(!valid||totalSearch>budget)continue;
      for(let bv=0;bv<=Math.min(h.voltorb+v,space);bv++)
        for(let bp=0;bp<=Math.min(h.pikachu+p,space-bv);bp++)
          for(let bd=0;bd<=Math.min(dittoEnabled?h.ditto:0,space-bv-bp);bd++){
            const ditto=dittoEnabled?Math.min(1,b.ditto+bd):0;
            for(let de=0;de<=ditto;de++)for(let dr=0;dr<=ditto-de;dr++){
              const baseE=Math.min(desiredE,b.electrode+b.voltorb+bv+de);
              const baseR=Math.min(desiredR,b.raichu+b.pikachu+bp+dr);
              const readyE=Math.min(desiredE,b.electrode+Math.min(b.voltorb+bv+de,h.electrode+e));
              const readyR=Math.min(desiredR,b.raichu+Math.min(b.pikachu+bp+dr,h.raichu+r));
              const combo=Number(readyR>=1&&readyE>=1);
              const objective=[combo,Number(readyR>=1)+Number(readyE>=1),Number(readyR>=1),
                Number(baseR>=1)+Number(baseE>=1),Number(baseR>=1),
                Number(readyE>=2),Number(baseE>=2),
                -totalSearch,-(baseRec+evoRec),-stretcherUsed,-(de+dr),-(bv+bp+bd)];
              if(compare(objective,best?.objective)<=0)continue;
              const basicKeys=r17CoreSequence({voltorb:v,pikachu:p});
              best={objective,desiredE,readyE,readyR,baseE,baseR,
                searchKeys:r17CoreSequence(search),
                carrierKeys:basicKeys.slice(0,carrierUsed),
                stretcherKeys:[...r17CoreSequence({raichu:r,electrode:e}),...basicKeys.slice(carrierUsed)],
                placements:{voltorb:bv,pikachu:bp,ditto:bd},dittoAssignment:{electrode:de,raichu:dr}};
            }
          }
    }
  return best||{searchKeys:[],carrierKeys:[],stretcherKeys:[],placements:{voltorb:0,pikachu:0,ditto:0}};
}
function r17OptimisticDeck(view) {
  const z=r17KnownOwnZones(view);if(z)return z.deck;
  // K0: only upper bounds from own fixed inventory and already visible
  // copies. An actual deck-search prompt supplies exact available counts.
  const result={};
  const d=r17CardCounts(r17Discard(view))||{},lost=r17CardCounts(list(own(view).lostZone))||{};
  for(const k of R17_CORE_KEYS)result[k]=Math.max(0,R17_COUNTS[k]-r17BoardCount(view,k)-r17HandCount(view,k)-(d[k]||0)-(lost[k]||0));
  return result;
}
// Same-turn Energy search is evaluated against the immediate Prize exchange,
// not the number of cards discarded. K0 deck counts are upper bounds only;
// the actual search prompt re-solves against its legal physical choices.
const R17_ENERGY_PRINTING=Object.freeze({reversal:'Reversal Energy PAL',counter:'Counter Energy CIN',unit:'Unit Energy LPM UPR'});
function r17EnergyDeckBounds(view) {
  const z=r17KnownOwnZones(view);if(z)return z.deck;
  const counts={...R17_COUNTS};
  for(const c of [...hand(view),...r17Discard(view),...list(own(view).lostZone),
    ...slots(own(view)).flatMap(p=>list(p.energies))]){
    const key=r17Key(c);if(R17_ENERGY.has(key))counts[key]--;
  }
  return Object.fromEntries([...R17_ENERGY].map(k=>[k,Math.max(0,counts[k]||0)]));
}
function r17LoadPlan(view,p,deckCounts,maxLoad=3,options={}) {
  if(!r17RainWindow(view,p)||!r17LiveBombs(view).length||
    r17NeedTempleRemoval(view)&&!options.ignoreTemple)return null;
  const baseline=r17RainProjection(view,p,options);
  let best=null;
  const bound=k=>Math.max(0,Math.min(4,deckCounts[k]||0,maxLoad));
  for(let r=0;r<=bound('reversal');r++)for(let c=0;c<=bound('counter');c++)
    for(let u=0;u<=bound('unit');u++){
      const n=r+c+u;if(n===0||n>maxLoad)continue;
      const keys=[...Array(r).fill('reversal'),...Array(c).fill('counter'),...Array(u).fill('unit')];
      const projected=r17RainProjection(view,p,{...options,
        extraDiscard:[...list(options.extraDiscard),...keys.map(k=>R17_ENERGY_PRINTING[k])]});
      if(!projected||projected.bombs===0||r17CompareProjection(projected,baseline)<=0)continue;
      const compare=r17CompareProjection(projected,best?.projection);
      if(compare>0||(compare===0&&n<best.keys.length))best={keys,projection:projected};
    }
  return best;
}
function r17PublicFreePivot(view) {
  const a=active(own(view)),t=view.ownTurnResources?.retreatedTurn,r=a?.publicRestrictions||{};
  if(!a||!Number.isSafeInteger(t)||t===view.globalTurn||
    r.cannotRetreat||r.cannotRetreatNextTurn||r.cannotRetreatWhileActive||
    list(a.specialConditions).length)return false;
  const cost=a.printed?.retreatCost;
  if(!Array.isArray(cost))return false;
  return cost.length===0||cost.length===1&&r17ToolEffectsLive(view)&&list(a.tools).some(t=>r17Key(t)==='uturn');
}
function r17ReadyRainAttackers(view) {
  const a=active(own(view));
  if(r17RainWindow(view,a))return [a];
  // An Active Electrode may KO itself and promote a Benched attacker.
  // Otherwise a known free retreat is required. When Klefki suppresses
  // Wobbuffet, that retreat must occur only after Bomb resolves.
  const selfKO=r17Key(a)==='electrode'&&r17LiveBombs(view).includes(a);
  if(!selfKO&&!r17PublicFreePivot(view))return [];
  return list(own(view).bench).filter(p=>r17RainWindow(view,p));
}
function r17FundedRainProjection(view,p,options={}) {
  let best=null;
  const held=hand(view),bounds=r17EnergyDeckBounds(view),copies=r17HandCount(view,'compressor');
  const manual=[null,...(r17ManualAvailable(view)?[...new Set(held.map(r17Key).filter(k=>R17_ENERGY.has(k)))]:[])];
  const sight=[false,...(r17Hand(view,'sight')&&list(p.tools).length===0&&r17ToolEffectsLive(view)&&
    !own(view).publicTurnRestrictions?.toolPlayLocked&&!view.ownTurnResources?.toolPlayLocked?[true]:[])];
  for(const energy of manual)for(const forceSight of sight){
    const opts={...options,forceSight:options.forceSight||forceSight,
      extraAttached:[...list(options.extraAttached),...(energy?[R17_ENERGY_PRINTING[energy]]:[])]};
    const direct=r17RainProjection(view,p,opts);
    const loading=copies&&itemAvailable(view)?r17LoadPlan(view,p,bounds,Math.min(12,3*copies),opts):null;
    const plan=loading&&r17CompareProjection(loading.projection,direct)>0?loading.projection:direct;
    if(plan&&r17CompareProjection(plan,best)>0)
      best={...plan,needsManual:energy,needsSight:forceSight,needsLoad:loading&&plan===loading.projection?loading.keys:[],
        deckSearchOptimistic:Boolean(loading&&plan===loading.projection&&!r17KnownOwnZones(view))};
  }
  return best;
}
function r17ActiveLoadPlan(view,deckCounts=null,searching=false) {
  if(!itemAvailable(view))return null;
  const attackers=r17ReadyRainAttackers(view);
  if(!attackers.length)return null;
  // During the choice prompt the current Compressor has left the hand.
  // Plan across distinct held copies, but spend at most three cards now.
  const copies=r17HandCount(view,'compressor')+Number(searching);
  if(copies<1)return null;
  const known=deckCounts||r17EnergyDeckBounds(view);
  let best=null;
  for(const p of attackers){
    const plan=r17LoadPlan(view,p,known,Math.min(12,copies*3));
    if(plan&&r17CompareProjection(plan.projection,best?.projection)>0)best=plan;
  }
  return best?{...best,now:best.keys.slice(0,3)}:null;
}
function r17CompressorPlan(view,deckCounts=null,searching=false) {
  if(!itemAvailable(view))return [];
  const counts=deckCounts||r17OptimisticDeck(view);
  const z=r17KnownOwnZones(view);
  const marshadowAvailable=searching?(counts.marshadow||0)>0:
    z?(z.deck.marshadow||0)>0:true;
  const stadiumAnswer=r17NeedStadiumRemoval(view)&&r17Hand(view,'carrier')&&
    !r17Board(view,'marshadow')&&!r17Hand(view,'marshadow')&&
    !r17Discard(view).some(c=>r17Key(c)==='marshadow')&&marshadowAvailable;
  const core=r17CoreAccess(view,counts).searchKeys;
  const load=r17ActiveLoadPlan(view,deckCounts,searching);
  // Under a hostile Stadium, Compressor->Carrier is a concrete singleton
  // access line. It precedes ordinary setup because Bomb/Special Energy
  // development is otherwise stranded.
  if(stadiumAnswer)return ['marshadow',...(load?.now||[]),...core].slice(0,3);
  if(!load)return core;
  // A projected same-turn terminal or positive Prize trade precedes future
  // development only when Raichu and Bomb are already ready.
  return [...load.now,...core].slice(0,3);
}
function r17CompressorGain(view) {return r17CompressorPlan(view).length;}
function r17CompressorUseful(view) {
  if(!itemAvailable(view))return false;
  if(r17CompressorGain(view)>0)return true;
  if(!r17Hand(view,'carrier')||r17Space(view)===0)return false;
  if(r17Discard(view).some(c=>r17CarrierValue(r17Key(c),view)>0))return false;
  const z=r17KnownOwnZones(view);
  return r17UnownUseful(view)&&!r17Hand(view,'unown')&&!r17Board(view,'unown')&&(!z||(z.deck.unown||0)>0);
}
function r17CompressorChoices(prompt,view) {
  const cards=r17ChoiceCards(prompt,'deck');
  const keys=r17CompressorPlan(view,r17CardCounts(cards)||{},true);
  if(keys.length) {
    const remaining=cards.slice(),rows=[];
    for(const key of keys){const index=remaining.findIndex(c=>r17Key(c)===key);if(index>=0)rows.push(...remaining.splice(index,1));}
    return r17Multi(prompt,rows,3);
  }
  const canRecycle=r17Hand(view,'carrier')&&r17Space(view)>0&&
    !r17Discard(view).some(c=>r17CarrierValue(r17Key(c),view)>0);
  return r17Multi(prompt,r17Rank(cards,c=>canRecycle&&
    r17Key(c)==='unown'&&r17UnownUseful(view)?150:0),2);
}
function r17VipValue(key,view) {
  if(key==='voltorb'){
    const n=r17BoardCount(view,'voltorb')+r17BoardCount(view,'electrode')+r17HandCount(view,'voltorb');
    if(n===0)return 300;
    if(n===1&&r17SecondBombUseful(view)&&
       (r17CoreBaseReady(view,'pikachu')||r17Board(view,'raichu')||r17CoreBaseReady(view,'ditto')))return 180;
  }
  if(key==='pikachu'&&!r17Board(view,'pikachu')&&!r17Board(view,'raichu')&&!r17Hand(view,'pikachu'))return 290;
  if(key==='ditto'&&!r17Board(view,'ditto')&&!r17Hand(view,'ditto')&&!r17AbilityBlocked(view,'ditto')){
    if(r17MissingCore(view).length>0)return 190;
    if(r17SecondBombUseful(view)&&r17BoardCount(view,'voltorb')+r17BoardCount(view,'electrode')+r17HandCount(view,'voltorb')<2)return 165;
  }
  if(key==='unown'&&r17UnownUseful(view))return 150;
  if(key==='marshadow'&&r17NeedStadiumRemoval(view)&&!r17Board(view,key))return 500;
  // Squawk and Seize is usable from play on own first turn, not a hand-play trigger.
  if(key==='squawk'&&r17First(view)&&!r17AbilityBlocked(view,'squawk')&&!r17Board(view,key)&&
     !r17Hand(view,key)&&handCount(view)<=2&&r17Deck(view)>=7)return 140;
  return 0;
}
function r17VipChoices(prompt,view) {
  const cards=r17ChoiceCards(prompt,'deck'),rows=[],used=new Set();
  const heldV=r17HandCount(view,'voltorb'),heldP=r17HandCount(view,'pikachu');
  // Reserve room for already-held missing natural bases. A directly
  // Benched search target must not crowd out the other core line.
  const reserve=Number(heldV>0&&!r17Board(view,'voltorb')&&!r17Board(view,'electrode'))+
    Number(heldP>0&&!r17Board(view,'pikachu')&&!r17Board(view,'raichu'));
  const limit=Math.min(2,Math.max(0,r17Space(view)-reserve));
  const picked=k=>rows.filter(c=>r17Key(c)===k).length;
  const score=c=>{
    const key=r17Key(c);
    const v=r17BoardCount(view,'voltorb')+r17BoardCount(view,'electrode')+heldV+picked('voltorb');
    const p=r17BoardCount(view,'pikachu')+r17BoardCount(view,'raichu')+heldP+picked('pikachu');
    if(key==='voltorb')return v===0?300:v===1&&r17SecondBombUseful(view)&&(p>0||picked('ditto')>0||r17Board(view,'ditto'))?180:0;
    if(key==='pikachu')return p===0?290:0;
    if(key==='ditto')return !picked(key)&&!r17Board(view,key)&&!r17Hand(view,key)&&!r17AbilityBlocked(view,'ditto')?
      (p===0||v===0?190:r17SecondBombUseful(view)&&v<2?165:0):0;
    if(key!=='unown'&&picked(key))return 0;
    return r17VipValue(key,view);
  };
  while(rows.length<limit){
    const c=r17Rank(cards.filter(c=>!used.has(c.token)),score)[0];
    if(!c)break;
    rows.push(c);used.add(c.token);
  }
  return r17Multi(prompt,rows,limit);
}
function r17PublicGetLostThreat(view) {
  return slots(opponent(view)).some(p=>/^Girafarig LOT(?: 94)?$/i.test(printingValue(p)));
}
function r17ProtectedHand(view) {
  return hand(view).some(c=>{
    const k=r17Key(c);
    return (k==='pikachu'&&!r17Board(view,'pikachu')&&!r17Board(view,'raichu'))||
      (k==='voltorb'&&!r17Board(view,'voltorb')&&!r17Board(view,'electrode'))||
      (k==='raichu'&&!r17Board(view,'raichu'))||(k==='electrode'&&!r17Board(view,'electrode'))||
      // With live Temple, a visible Get Lost threat can turn the singleton
      // Resetting Hole answer into an unrecoverable Lost Zone resource after
      // a hand-discard Supporter. Preserve it until it can be used or Temple
      // is otherwise removed. This uses only actor-visible board identities.
      (k==='marshadow'&&r17NeedTempleRemoval(view)&&!r17Board(view,'marshadow')&&r17PublicGetLostThreat(view));
  });
}
// Value the hand's actual remaining connectors, not its raw size.
// Draw-discard is a fallback after funded evolution/recovery and manual
// attachment, but a seven-card hand of redundant Energy is not "healthy".
function r17HandUtility(view,excluded=null) {
  const counts=r17CardCounts(hand(view))||{};
  if(excluded)counts[excluded]=Math.max(0,(counts[excluded]||0)-1);
  let value=0;
  for(const [key,n] of Object.entries(counts)){
    if(!n)continue;
    if(R17_ENERGY.has(key)){value+=Math.min(n,1)*0.5;continue;}
    if(R17_CORE_KEYS.includes(key)){
      value+=Math.min(n,2)*((key==='voltorb'||key==='pikachu')?1.4:1.7);continue;
    }
    if(key==='vip'){if(r17First(view)&&r17Space(view)>0)value+=Math.min(n,2)*1.5;continue;}
    if(key==='compressor'){value+=r17CompressorGain(view)>0?Math.min(n,2)*1.5:0.3;continue;}
    if(key==='carrier'){value+=r17CoreAccess(view,{}, {carrier:1}).carrierKeys.length?1.6:0.6;continue;}
    if(key==='stretcher'){value+=r17CoreAccess(view,{}, {stretcher:1}).stretcherKeys.length?1.6:0.6;continue;}
    if(key==='secret'){value+=r17SafeDiscards(hand(view),view,'secret').length>=3?2:0.6;continue;}
    if(key==='mail'){value+=1.1;continue;}
    if(key==='unown'){value+=r17Space(view)>0&&r17UnownUseful(view)?Math.min(n,2)*0.8:0.3;continue;}
    if(key==='ditto'){value+=r17MissingCore(view).length&&!r17AbilityBlocked(view,'ditto')?1.5:0.3;continue;}
    if(key==='heavy'){value+=r17MissingCore(view).length?1:0.3;continue;}
    if(key==='rope'||key==='sight'||key==='pokestop'){value+=0.7;continue;}
    if(key==='research'||key==='carmine'){value+=0.4;continue;}
    value+=0.5;
  }
  return value;
}
function r17DrawDiscardScore(view,draw,excluded=null) {
  if(r17Deck(view)<=draw||r17ProtectedHand(view))return 0;
  // Do not discard a held singleton Ditto that is the only current base
  // alternative, even when the rest of the hand has little value.
  if(r17Hand(view,'ditto')&&r17MissingCore(view).length&&!r17Board(view,'ditto'))return 0;
  const p=active(own(view)),pressure=r17RainProjection(view,p);
  if(pressure?.terminalProjection)return 0;
  const utility=r17HandUtility(view,excluded);
  const handAfter=Math.max(0,hand(view).length-Number(excluded!==null));
  const benefit=draw*0.72-utility;
  if(benefit<=0.6&&handAfter>=4)return 0;
  return Math.max(0,Math.min(205,Math.round(95+25*benefit)));
}
function r17EarlyEnergyScore(key,target,view,p) {
  if(!R17_ENERGY.has(key)||!p||list(p.energies).length>=2)return 0;
  if(target==='gengar')return key==='unit'&&r17GengarPsychic(view,p)<2?210:0;
  if(target!=='raichu'&&target!=='pikachu')return 0;
  const ownP=own(view).prizeCount,oppP=opponent(view).prizeCount;
  if(!Number.isSafeInteger(ownP)||!Number.isSafeInteger(oppP))return 0;
  const safeBombs=Math.min(2,Math.max(0,Math.floor((oppP-1)/2)));
  const canActivate=ownP>oppP||safeBombs>0&&ownP>oppP-2*safeBombs;
  if(key!=='unit'&&!canActivate)return 0;
  const base=key==='reversal'?225:key==='counter'?215:205;
  // Reserve Psychic Unit for a credible first-turn Gengar attack if that
  // alternative is already established. Otherwise preserve a manual card
  // on the actual attacker before a full-hand discard.
  if(key==='unit'&&r17First(view)&&slots(own(view)).some(q=>r17Key(q)==='gengar'&&r17GengarPsychic(view,q)<1))return 170;
  return base;
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
// Secret Box is both a search connector and a three-card discard outlet.
// Do not require three duplicates if distinct Special Energy pay for a
// strictly better immediate exchange. Preserve any needed manual attachment.
function r17ManualAvailable(view) {
  const t=view.ownTurnResources?.energyPlayedTurn;
  return Number.isSafeInteger(t)&&t!==view.globalTurn;
}
function r17HandRainProjection(view,p,rows,options={}) {
  let best=r17RainProjection(view,p,options);
  if(!r17ManualAvailable(view))return best;
  for(const k of new Set(rows.map(r17Key).filter(k=>R17_ENERGY.has(k)))){
    const next=r17RainProjection(view,p,{...options,extraAttached:[...list(options.extraAttached),R17_ENERGY_PRINTING[k]]});
    if(r17CompareProjection(next,best)>0)best=next;
  }
  return best;
}
function r17SecretPayment(cards,view,excluded=null) {
  const ordinary=r17SafeDiscards(cards,view,excluded).slice(0,3);
  const p=active(own(view));
  if(!r17RainWindow(view,p)||!r17LiveBombs(view).length||r17NeedTempleRemoval(view))return ordinary;
  const physical=cards.filter(c=>r17Key(c)&&r17Key(c)!=='secret');
  if(physical.length<3)return ordinary;
  const original=hand(view).filter(c=>r17Key(c)!=='secret');
  const baseline=r17HandRainProjection(view,p,original);
  const counts=r17CardCounts(original)||{};
  let best=null;
  for(const rows of r17Combinations(physical,3)){
    const spent=r17CardCounts(rows)||{};
    const energy=rows.filter(c=>R17_ENERGY.has(r17Key(c)));
    if(!energy.length)continue;
    // All non-energy payment remains subject to the protected-copy rule.
    if(Object.entries(spent).some(([k,n])=>!R17_ENERGY.has(k)&&
      !(k==='vip'&&!r17First(view))&&(!(R17_ITEM.has(k)||R17_SUPPORTER.has(k))||n>=(counts[k]||0))))continue;
    const remaining={...spent};
    const held=original.filter(c=>{const k=r17Key(c);if(remaining[k]>0){remaining[k]--;return false;}return true;});
    const projected=r17HandRainProjection(view,p,held,{extraDiscard:energy});
    if(!projected||projected.bombs===0||r17CompareProjection(projected,baseline)<=0)continue;
    const comparison=r17CompareProjection(projected,best?.projection);
    if(comparison>0||(comparison===0&&energy.length<best.energyCount))
      best={rows,projection:projected,energyCount:energy.length};
  }
  return best?.rows||ordinary;
}
function r17TrainerNeed(key,view) {
  if(key==='vip')return r17First(view)&&r17Space(view)>0?240:0;
  if(key==='carrier')return r17CoreAccess(view,{}, {carrier:1}).carrierKeys.length||
    r17Discard(view).some(c=>!R17_CORE_KEYS.includes(r17Key(c))&&r17CarrierValue(r17Key(c),view)>0)?260:90;
  if(key==='compressor'){
    const p=active(own(view));
    return r17LoadPlan(view,p,r17EnergyDeckBounds(view),3)?420:r17CompressorUseful(view)?240:25;
  }
  if(key==='stretcher'){
    if(r17StretcherShufflePlan(view).length===3)return 390;
    return r17CoreAccess(view,{}, {stretcher:1}).stretcherKeys.length||
      r17Discard(view).some(c=>!R17_CORE_KEYS.includes(r17Key(c))&&r17RecoveryValue(r17Key(c),view)>0)?230:70;
  }
  if(key==='secret'){
    const payment=r17SecretPayment(hand(view),view,null);
    if(payment.length<3)return 0;
    return payment.some(c=>R17_ENERGY.has(r17Key(c)))&&r17RainWindow(view,active(own(view)))?380:250;
  }
  if(key==='heavy')return r17Missing(view,'voltorb','electrode')||r17Missing(view,'pikachu','raichu')?160:40;
  if(key==='research')return supporterAvailable(view)&&!r17Hand(view,'research')&&r17Deck(view)>=8?190:45;
  if(key==='carmine')return supporterAvailable(view)&&!r17Hand(view,'research')&&r17Deck(view)>=6?145:30;
  if(key==='rope'){
    if(r17Hand(view,'rope'))return 0;
    const line=r17RopeRainPlan({observation:view});
    if(line?.plan)return line.plan.terminalProjection?440:300;
    return r17Space(view)<5?90:45;
  }
  if(key==='uturn')return 120;
  if(key==='sight'){
    const p=active(own(view));
    const a=r17RainProjection(view,p),b=r17RainProjection(view,p,{forceSight:true});
    return b&&r17CompareProjection(b,a)>0?420:50;
  }
  if(key==='pokestop')return r17NeedStadiumRemoval(view)?420:r17Deck(view)>=12&&benchCount(own(view))<=5?110:0;
  return 0;
}
function r17SecretChoices(prompt,view) {
  const cards=r17ChoiceCards(prompt,'deck'),groups=[R17_ITEM,R17_TOOL,R17_SUPPORTER,new Set(['pokestop'])];
  const lists=groups.map(group=>{
    const seen=new Set();
    return cards.filter(c=>{const k=r17Key(c);if(!group.has(k)||seen.has(k))return false;seen.add(k);return true;});
  });
  const ordinary=lists.map(rows=>r17Rank(rows,c=>r17TrainerNeed(r17Key(c),view))[0]).filter(Boolean);
  const p=active(own(view));
  if(!r17RainWindow(view,p)||!r17LiveBombs(view).length)return r17Multi(prompt,ordinary,4);
  // Joint search: the Item, Tool and Stadium slots may be complements,
  // not independent upgrades. Assess the whole bundle against the
  // presently available line. Energy availability is only a K0 upper
  // bound until the subsequent Compressor search supplies exact choices.
  const ignoreTemple=r17NeedTempleRemoval(view)&&r17StadiumAnswerPossible(view);
  const baseline=r17RainProjection(view,p,{ignoreTemple});
  const bound=r17EnergyDeckBounds(view),held=r17HandCount(view,'compressor');
  let best=null;
  for(const item of lists[0].length?lists[0]:[null])
    for(const tool of lists[1].length?lists[1]:[null])
      for(const supporter of lists[2].length?lists[2]:[null])
        for(const stadium of lists[3].length?lists[3]:[null]){
          const rows=[item,tool,supporter,stadium].filter(Boolean);
          const forceSight=r17Key(tool)==='sight'&&list(p.tools).length===0&&r17ToolEffectsLive(view)&&
            !own(view).publicTurnRestrictions?.toolPlayLocked&&!view.ownTurnResources?.toolPlayLocked;
          const removeTemple=ignoreTemple||r17NeedTempleRemoval(view)&&r17Key(stadium)==='pokestop'&&
            !own(view).publicTurnRestrictions?.stadiumPlayLocked&&view.ownTurnResources?.stadiumPlayedTurn!==view.globalTurn;
          const options={forceSight,ignoreTemple:removeTemple};
          const capacity=Math.min(12,3*(held+Number(r17Key(item)==='compressor')));
          let projected=r17RainProjection(view,p,options);
          const load=r17LoadPlan(view,p,bound,capacity,options);
          if(load&&r17CompareProjection(load.projection,projected)>0)projected=load.projection;
          if(!projected||r17CompareProjection(projected,baseline)<=0)continue;
          const value=rows.reduce((n,c)=>n+r17TrainerNeed(r17Key(c),view),0);
          const cmp=r17CompareProjection(projected,best?.projection);
          if(cmp>0||cmp===0&&value>best.value)best={rows,projection:projected,value};
        }
  return r17Multi(prompt,best?.rows||ordinary,4);
}
function r17Slot(view,zone,index) {
  if(zone==='active')return active(own(view));
  if(zone==='bench'&&Number.isSafeInteger(index)&&index>=0)return list(own(view).bench)[index];
  return null;
}
function r17OwnAbilitySlot(item,view,benchOnly=true) {
  const m=metadata(item);
  if(m.sourceSeat!=='actor'||benchOnly&&m.sourceZone!=='bench')return null;
  const slot=r17Slot(view,m.sourceZone,m.sourceIndex);
  return slot&&r17Key(slot)===r17Key(item)?slot:null;
}
function r17GengarReady(view,p) {
  if(r17Key(p)!=='gengar'||gxUsed(view)||r17NeedTempleRemoval(view)||
     Number(opponent(view).prizeCount)<=3||!list(p?.energies).some(e=>r17Key(e)==='unit')||
     view.globalTurn===1||own(view).publicTurnRestrictions?.cannotUseGXAttacks===true||
     Number(own(view).publicTurnRestrictions?.attackLockTurnsRemaining)>0||
     p.publicRestrictions?.cannotAttackNextTurn===true||
     list(p.publicRestrictions?.cannotUseAttacksNextTurn).includes('Horror House-GX')||
     p.publicRestrictions?.attackCostIncreaseWhileActive>0||p.publicRestrictions?.attackCostIncreaseNextTurn>0)
     return false;
  return true;
}
function r17FreeRetreat(item,view) {
  const m=metadata(item);
  if(m.freeRetreat===true||m.isFreeRetreat===true||m.retreatEnergyCost===0)return true;
  if(m.freeRetreat===false||m.isFreeRetreat===false||Number(m.retreatEnergyCost)>0)return false;
  const a=active(own(view)),cost=a?.printed?.retreatCost;
  if(!Array.isArray(cost))return false;
  if(cost.length===0)return true;
  return cost.length===1&&r17ToolEffectsLive(view)&&list(a.tools).some(t=>r17Key(t)==='uturn');
}
// Narrow public-board tactical pressure model. It deliberately does not
// certify terminal wins: printed HP and visible Tools/Stadium do not prove
// every transient native damage modifier. Only exact known visible
// printings receive a price/hit estimate; other targets fail closed.
const R17_TARGET_ROWS=Object.freeze([
  [/^Shadow Rider Calyrex VMAX CRE(?: 75)?$/i,3,true],
  [/^Shadow Rider Calyrex V CRE(?: 74)?$/i,2,true],
  // Exact New Moon Lockbreaker English mechanics-proxy printings.
  [/^Mewtwo & Mew-GX UNM(?: 71)?$/i,3,true],
  [/^Gengar & Mimikyu-GX TEU(?: 53)?$/i,3,true],
  [/^Galarian Articuno V CRE(?: 58)?$/i,2,true],
  [/^Squawkabilly ex PAL(?: 169)?$/i,2,false],
  [/^Unown AOR(?: 30)?$/i,1,false],
  [/^Dusclops SFA(?: 19)?$/i,1,false],
  [/^Duskull VIV(?: 69)?$/i,1,false],
  [/^Solrock CES(?: 62)?$/i,1,false],
  [/^Lunatone OBF(?: 92)?$/i,1,false],
  [/^Lillie['’]s Clefairy ex JTG(?: 56)?$/i,2,false],
  [/^Tapu Lele-GX GRI(?: 60)?$/i,2,true],
  [/^Trevenant & Dusknoir-GX SMP(?: 217)?$/i,3,true],
  [/^Latias ex SSP(?: 76)?$/i,2,false],
  [/^Dialga-GX UPR(?: 100)?$/i,2,true],
  [/^Mimikyu GRI(?: 58)?$/i,1,false],
  [/^Girafarig LOT(?: 94)?$/i,1,false],
  [/^Marshadow UNB(?: 81)?$/i,1,false],
  [/^Klefki SVI(?: 96)?$/i,1,false],
  [/^Radiant Eternatus CRZ(?: 105)?$/i,1,false],
  [/^Wobbuffet PHF(?: 36)?$/i,1,false]
]);
function r17RainWindow(view,p) {
  if(r17Key(p)!=='raichu'||view.globalTurn<2||
     own(view).publicTurnRestrictions?.attackLockTurnsRemaining>0||
     own(view).publicTurnRestrictions?.attackMaxEnergyTurnsRemaining>0||
     p.publicRestrictions?.cannotAttackNextTurn||
     p.publicRestrictions?.attackCostIncreaseNextTurn>0||
     p.publicRestrictions?.attackCostIncreaseWhileActive>0||
     list(p.publicRestrictions?.cannotUseAttacksNextTurn).includes('Electro Rain')||
     p.publicRestrictions?.blockedAttackNameNextTurn==='Electro Rain'||
     p.publicRestrictions?.blockedAttackNameUntilLeavesActive==='Electro Rain'||
     p.publicRestrictions?.onlyAllowedAttackNameNextTurn&&
       p.publicRestrictions.onlyAllowedAttackNameNextTurn!=='Electro Rain'||
     list(p.specialConditions).length>0)return false;
  return true;
}
function r17RainCapacity(view,p,{extraDiscard=[],extraAttached=[],ignoreTemple=false}={}) {
  if(!r17RainWindow(view,p)||r17NeedTempleRemoval(view)&&!ignoreTemple)return [];
  const ownP=own(view).prizeCount,oppP=opponent(view).prizeCount;
  if(!Number.isSafeInteger(ownP)||!Number.isSafeInteger(oppP)||ownP<1||oppP<1)return [];
  const attached=[...list(p.energies),...extraAttached];
  if(attached.some(c=>!R17_ENERGY.has(r17Key(c))))return [];
  const discard=[...r17Discard(view).filter(c=>R17_ENERGY.has(r17Key(c))),...extraDiscard];
  if(discard.some(c=>!R17_ENERGY.has(r17Key(c))))return [];
  const result=[];
  for(let bombs=0;bombs<=r17LiveBombs(view).length;bombs++){
    const post=oppP-2*bombs;if(post<=0)continue;
    if(bombs>0&&discard.length<=5*(bombs-1))continue;
    const supply=c=>r17EnergyProvision(c,ownP,post,false)?.lightning||0;
    const loaded=discard.map(supply).sort((a,b)=>b-a).slice(0,5*bombs);
    const units=attached.reduce((n,c)=>n+supply(c),0)+loaded.reduce((n,c)=>n+c,0);
    if(units>0)result.push({bombs,units});
  }
  return result;
}
function r17NewMoonSunbeamLive(view) {
  const solrock=slots(opponent(view)).find(q=>/^Solrock CES(?: 62)?$/i.test(printingValue(q))&&
    list(q.abilities).includes('Sunbeam'));
  if(!solrock)return false;
  // Actor projection carries printed HP, not effect-modified max HP. Treat
  // an unresolved suppression state conservatively as live; only an
  // explicit source-attributed suppression can lower Lunatone back to 90.
  return !r17Suppressed(solrock,'Sunbeam')&&!r17BasicLock(view);
}
function r17VisibleRainTargets(view,p,forceSight=false) {
  const stad=r17Stadium(view);
  if(stad&&!/^(Sky Field ROS|Dimension Valley PHF|Temple of Sinnoh ASR|Pok[eé]Stop PGO|Path to the Peak CRE|Power Plant UNB|Jamming Tower TWM)(?: \d+)?$/i.test(stad))return null;
  const sight=r17ToolEffectsLive(view)&&(forceSight||list(p?.tools).some(c=>r17Key(c)==='sight'));
  const targets=[];
  for(const [zone,rows] of [['active',[active(opponent(view))]],['bench',list(opponent(view).bench)]]){
    for(let index=0;index<rows.length;index++){
      const q=rows[index];if(!q)continue;
      const row=R17_TARGET_ROWS.find(x=>x[0].test(printingValue(q)));
      if(!row||!Number.isSafeInteger(q.hp)||!Number.isSafeInteger(q.damage)||
         q.hp<=0||q.damage<0||q.damage>=q.hp||
         list(q.tools).some(t=>!/^(Stealthy Hood UNB|Forest Seal Stone SIT|Float Stone BKT|Powerglass SFA)(?: \d+)?$/i.test(printingValue(t))))return null;
      const modifier=zone==='bench'&&sight&&row[2]?30:0;
      const maxHp=/^Lunatone OBF(?: 92)?$/i.test(printingValue(q))&&r17NewMoonSunbeamLive(view)?
        Math.max(q.hp,130):q.hp;
      targets.push({zone,index,printing:printingValue(q),prizes:row[1],
        hits:Math.max(1,Math.ceil((maxHp-q.damage-modifier)/30))});
    }
  }
  return targets.length?targets:null;
}
function r17CompareProjection(a,b){
  if(!a)return -1;if(!b)return 1;
  const av=[Number(a.terminalProjection),a.netPrizeSwing,a.prizes,-a.bombs,-a.hitsRequired];
  const bv=[Number(b.terminalProjection),b.netPrizeSwing,b.prizes,-b.bombs,-b.hitsRequired];
  for(let i=0;i<av.length;i++)if(av[i]!==bv[i])return av[i]>bv[i]?1:-1;
  return 0;
}
function r17RainProjection(view,p,options={}) {
  const targets=r17VisibleRainTargets(view,p,options.forceSight===true);
  if(!targets||targets.length>9)return null;
  let best=null;
  for(const {bombs,units} of r17RainCapacity(view,p,options)){
    for(let mask=1;mask<(1<<targets.length);mask++){
      let prizes=0,hitsRequired=0,koCount=0;
      for(let i=0;i<targets.length;i++)if(mask&(1<<i)){
        prizes+=targets[i].prizes;hitsRequired+=targets[i].hits;koCount++;
      }
      if(hitsRequired>units)continue;
      const terminalProjection=prizes>=own(view).prizeCount||koCount===targets.length;
      const netPrizeSwing=Math.min(prizes,own(view).prizeCount)-2*bombs;
      if(!terminalProjection&&netPrizeSwing<=0)continue;
      const plan={terminalProjection,prizes:Math.min(prizes,own(view).prizeCount),
        netPrizeSwing,bombs,units,hitsRequired,assumption:'printed-HP-and-visible-tools-only'};
      if(r17CompareProjection(plan,best)>0)best=plan;
    }
  }
  return best;
}
function r17StadiumAnswerPossible(view) {
  if(!r17NeedStadiumRemoval(view))return true;
  const p=own(view),turn=view.ownTurnResources||{};
  if(r17Hand(view,'pokestop')&&!p.publicTurnRestrictions?.stadiumPlayLocked&&
     turn.stadiumPlayedTurn!==view.globalTurn)return true;
  const benched=list(p.bench).some(q=>r17Key(q)==='marshadow'&&
    !r17AbilityBlocked(view,'marshadow',q,'Resetting Hole')&&
    list(q.energies).length===0&&list(q.tools).length===0);
  const canBench=!p.publicTurnRestrictions?.pokemonPlayLocked&&
    !view.ownTurnResources?.pokemonPlayLocked&&r17Hand(view,'marshadow')&&r17Space(view)>0&&
    !r17AbilityBlocked(view,'marshadow');
  return benched||canBench;
}
function r17ProjectStadiumRemoved(view) {
  return {...view,ownPublic:{...own(view),stadium:[]},opponentPublic:{...opponent(view),stadium:[]}};
}
function r17ClearDepartedLock(slot,departed) {
  if(!slot||!Array.isArray(slot.abilitySuppressions))return slot;
  const names=new Set(departed.map(printingValue));
  return {...slot,abilitySuppressions:slot.abilitySuppressions.map(row=>
    row.suppressed===true&&names.has(row.sourcePrinting)?
      {...row,suppressed:null,reasonCode:null,sourcePrinting:null}:row)};
}
function r17SwitchProjection(view,nextOwn,nextOpponent) {
  const p=own(view),o=opponent(view),oldP=active(p),oldO=active(o);
  const departed=[oldP,oldO].filter((q,i)=>q&&q!==(i===0?nextOwn:nextOpponent));
  const moved=(player,next,old)=>{
    const bench=list(player.bench).map(q=>q===next?old:q);
    return {...player,active:r17ClearDepartedLock(next,departed),
      bench:bench.map(q=>r17ClearDepartedLock(q,departed))};
  };
  return {...view,ownPublic:moved(p,nextOwn,oldP),opponentPublic:moved(o,nextOpponent,oldO)};
}
// A second mobility line handles an opposing Wobbuffet that Rope cannot
// remove (e.g. no opposing Bench, or another unhooded Wobbuffet).
// Rope to Psychic Klefki, use the now-live evolved Electrode, then free
// retreat to Raichu. The opponent's choice is quantified, not assumed.
function r17KlefkiFreeAfter(view,p) {
  const t=view.ownTurnResources?.retreatedTurn,r=p?.publicRestrictions||{};
  if(!Number.isSafeInteger(t)||t===view.globalTurn||
    r.cannotRetreat||r.cannotRetreatNextTurn||r.cannotRetreatWhileActive||
    list(p?.specialConditions).length)return false;
  const cost=p?.printed?.retreatCost;
  if(!Array.isArray(cost))return false;
  if(cost.length===0)return true;
  if(cost.length!==1||!r17ToolEffectsLive(view))return false;
  if(list(p.tools).some(t=>r17Key(t)==='uturn'))return true;
  return !list(p.tools).length&&r17Hand(view,'uturn')&&
    !own(view).publicTurnRestrictions?.toolPlayLocked&&!view.ownTurnResources?.toolPlayLocked;
}
function r17KlefkiDestinationPlan(view,klefki) {
  if(r17Key(klefki)!=='klefki'||r17Key(active(own(view)))==='klefki')return null;
  const projected=r17SwitchProjection(view,klefki,active(opponent(view)));
  const k=active(own(projected));
  if(!r17LiveKlefki(projected,k)||!r17KlefkiFreeAfter(projected,k)||
    !r17StadiumAnswerPossible(projected))return null;
  const needAnswer=r17NeedStadiumRemoval(projected),answered=needAnswer?r17ProjectStadiumRemoved(projected):projected;
  if(!r17LiveBombs(answered).length)return null;
  let best=null;
  for(const p of list(own(answered).bench).filter(q=>r17Key(q)==='raichu')){
    const raw=r17FundedRainProjection(answered,p);
    const plan=raw&&needAnswer?{...raw,needsStadiumAnswer:r17Stadium(projected)}:raw;
    if(plan&&plan.bombs>0&&r17CompareProjection(plan,best?.plan)>0)best={raichu:p,plan};
  }
  return best;
}
function r17KlefkiPivotPlan(view,allowHeld=false) {
  if(!r17Hand(view,'rope')||!itemAvailable(view)||view.globalTurn<2||
    !r17IsWob(active(opponent(view)))||r17Key(active(own(view)))==='klefki')return null;
  let board=view,choices=list(own(view).bench).filter(p=>r17Key(p)==='klefki');
  if(!choices.length&&allowHeld&&r17Hand(view,'klefki')&&r17Space(view)>0){
    const p={printing:'Klefki SVI',hp:70,damage:0,energies:[],tools:[],
      printed:{retreatCost:['Colorless']},abilities:['Mischievous Lock'],abilitySuppressions:[]};
    board={...view,ownPublic:{...own(view),bench:[...list(own(view).bench),p]}};
    choices=[p];
  }
  let best=null;
  for(const k of choices){
    let worst=null,valid=true;
    const opponents=list(opponent(board).bench).filter(Boolean);
    for(const next of opponents.length?opponents:[active(opponent(board))]){
      // The opponent's forced switch resolves before our choice.
      const changed=r17SwitchProjection(board,active(own(board)),next);
      const liveK=list(own(changed).bench).find(p=>r17Key(p)==='klefki');
      const plan=r17KlefkiDestinationPlan(changed,liveK);
      if(!plan){valid=false;break;}
      if(!worst||r17CompareProjection(plan.plan,worst.plan)<0)worst=plan;
    }
    if(valid&&worst&&(!best||r17CompareProjection(worst.plan,best.plan)>0))
      best={...worst,klefki:k,route:'rope-klefki-bomb-retreat',needsBench:board!==view};
  }
  return best;
}
function r17RopeRainPlan(request) {
  const v=request.observation,p=own(v),o=opponent(v),old=active(p);
  if(!itemAvailable(v)||v.globalTurn<2||r17Key(old)==='raichu')return null;
  const direct=list(request.actionFrontier?.items).filter(a=>
    a.kind==='retreat'&&metadata(a).targetSeat==='actor'&&r17FreeRetreat(a,v)&&r17Key(a.targetPrinting)==='raichu');
  // Retain the protected live Bomb connector and promote after self-KO,
  // or after Bomb through a free retreat, when available.
  if(r17DepartingKlefkiRelocks(v)&&direct.length)return null;
  let best=null;
  for(const raichu of list(p.bench).filter(q=>r17Key(q)==='raichu')){
    let worst=null,valid=true;
    const choices=list(o.bench).filter(Boolean);
    // Rope switches our own Pokémon even if the opponent has no Bench.
    // A second Wobbuffet, if available, is a real adversarial alternative.
    for(const next of choices.length?choices:[active(o)]){
      const projected=r17SwitchProjection(v,raichu,next);
      if(!r17StadiumAnswerPossible(projected)){valid=false;break;}
      const needAnswer=r17NeedStadiumRemoval(projected),answered=needAnswer?r17ProjectStadiumRemoved(projected):projected;
      const raw=r17FundedRainProjection(answered,active(own(answered)));
      const plan=raw&&needAnswer?{...raw,needsStadiumAnswer:r17Stadium(projected)}:raw;
      if(!plan){valid=false;break;}
      if(!worst||r17CompareProjection(plan,worst)<0)worst=plan;
    }
    if(valid&&worst&&(!best||r17CompareProjection(worst,best.plan)>0))best={raichu,plan:worst};
  }
  const pivot=r17KlefkiPivotPlan(v,false);
  if(pivot&&r17CompareProjection(pivot.plan,best?.plan)>0)best=pivot;
  if(!best)return null;
  // A free direct retreat cannot be worse if it provides the same
  // immediate Prize objective without conceding opponent switch choice.
  for(const a of direct){
    const q=r17Slot(v,'bench',metadata(a).targetIndex??metadata(a).benchIndex);
    if(!q)continue;
    const projected=r17SwitchProjection(v,q,active(o));
    if(!r17StadiumAnswerPossible(projected))continue;
    const answered=r17NeedStadiumRemoval(projected)?r17ProjectStadiumRemoved(projected):projected;
    const plan=r17FundedRainProjection(answered,active(own(answered)));
    if(plan&&r17CompareProjection(plan,best.plan)>=0)return null;
  }
  return best;
}

function r17RopeScore(request) {
  const v=request.observation;
  const rain=r17RopeRainPlan(request);if(rain)return 315;
  if(!itemAvailable(v)||v.globalTurn===1||!r17First(v)||r17GengarReady(v,active(own(v))))return 0;
  // Horror House locks cards from hand, not attacks/Abilities. Avoid
  // exposing a new three-Prize Active if the opposing public board is
  // already heavily energized. This is a conservative tempo heuristic.
  if(slots(opponent(v)).reduce((n,p)=>n+list(p.energies).length,0)>1)return 0;
  if(!list(own(v).bench).some(p=>r17GengarReady(v,p)))return 0;
  // Free retreat to the ready attacker dominates spending Rope and giving
  // the opponent a choice. Paid-retreat prompts are not allowlisted by the
  // current engine provenance projection; use Rope instead if needed.
  const hasFree=list(request.actionFrontier?.items).some(a=>
    a.kind==='retreat'&&metadata(a).targetSeat==='actor'&&
    r17GengarReady(v,r17Slot(v,'bench',metadata(a).targetIndex??metadata(a).benchIndex))&&r17FreeRetreat(a,v));
  return hasFree?0:230;
}
// Static public card-type classification, never rank/deck/hidden-hand
// inference. A revealed card from any opponent is treated identically.
const R17_KNOWN_TRAINERS=new Set(["Acerola BUS","Adventure Bag LOT","Artazon PAL","Arven OBF","Arven SVI","Battle Compressor PHF","Battle VIP Pass FST","Bellelba & Brycen-Man CEC","Bicycle PLS","Boost Shake EVS","Buddy-Buddy Poffin TEF","Camping Gear BST","Canceling Cologne ASR","Captivating Poké Puff STS","Carmine TWM","Cassius XY","Chaotic Swell CEC","Cherish Ball UNM","Choice Belt PAL","Counter Catcher PAR","Counter Gain SSP","Crispin SCR","Crushing Hammer POR","Cynthia & Caitlin CEC","Damage Pump LOR","Dark Patch ASR","Dimension Valley PHF","Dowsing Machine PLS","Echoing Horn CRE","Enhanced Hammer TWM","Eri TEF","Escape Rope BST","Faba LOT","Field Blower GRI","Float Stone BKT","Fog Crystal CRE","Forest Seal Stone SIT","Gladion CIN","Grand Tree SCR","Guzma & Hala CEC","Guzma BUS","Handheld Fan TWM","Heavy Ball BKT","Hisuian Heavy Ball ASR","Iono PAL","Karen XYP","Lillie's Determination MEG","Lillie's Poké Doll CEC","Lost Vacuum LOR","Lusamine CIN","Marnie SSH","Megaton Blower SSP","Muscle Band XY","Mysterious Treasure FLI","N FCO","Nest Ball SVI","Net Ball LOT","Night Stretcher ASC","Order Pad UPR","Palace Belt BWP","Palace Book SMP","Parallel City BKT","Path to the Peak CRE","Penny SVI","Peonia CRE","Player's Ceremony SP","Plumeria BUS","PokéStop PGO","Pokémon Communication TEU","Pokémon Ranger STS","Prime Catcher TEF","Professor Sada's Vitality PAR","Professor Sycamore BKP","Professor's Letter BKT","Professor's Research JTG","Quick Ball FST","Raihan EVS","Random Receiver FCO","Rare Candy MEG","Redeemable Ticket JTG","Rescue Carrier EVS","Rescue Stretcher GRI","Risky Ruins MEG","Robo Substitute PHF","Roxanne ASR","Roxie CEC","Scoop Up Cyclone TWM","Secret Box TWM","Shopping Center EVS","Sidney FST","Silent Lab PRC","Sky Field ROS","Special Charge STS","Special Red Card CRI","Stadium Nav UNM","Stealthy Hood UNB","Steven's Resolve CES","Super Rod PAL","Tag Call CEC","Target Whistle PHF","Team Flare Grunt XY","Team Rocket's Handiwork FCO","Team Skull Grunt SUM","Team Yell Grunt SSH","Team Yell's Cheer BRS","Teammates PRC","Technical Machine: Crisis Punch PAF","Technical Machine: Evolution PAR","Telescopic Sight VIV","Temple of Sinnoh ASR","Thunder Mountain ♢ LOT","Tool Jammer BST","Town Map BKT","Trainers' Mail ROS","Tropical Beach BWP","Tulip PAR","U-Turn Board UNM","Ultra Ball MEG","Unfair Stamp TWM","VS Seeker PHF","Wait and See Hammer LOT","Wally ROS","Wondrous Labyrinth ♢ TEU","Wondrous Patch PFL","Xerosic's Machinations SFA","Xtransceiver NVI"]);
// Trainer card categories are stable across these reprints; use name-only
// classification only for names independently present in the known Trainer set.
const R17_TRAINER_NAMES=new Set([...R17_KNOWN_TRAINERS].map(s=>s.replace(/\s+[A-Z0-9]+$/,'')));
R17_TRAINER_NAMES.add("Boss's Orders");
function r17PublicTrainerCount(view) {
  const rows=opponent(view).publicHand;
  if(!Array.isArray(rows))return null;
  return rows.filter(c=>{
    const name=printingValue(c);return R17_KNOWN_TRAINERS.has(name)||R17_KNOWN_TRAINERS.has(name.replace(/\s+\d+$/,''))||R17_TRAINER_NAMES.has(name.replace(/\s+[A-Z0-9]+(?:\s+\d+)?$/,''));
  }).length;
}
function r17GengarPsychic(view,p) {
  if(r17Key(p)!=='gengar'||r17NeedTempleRemoval(view))return 0;
  return list(p.energies).filter(e=>r17Key(e)==='unit').length;
}
function r17GengarDirect(view,p) {
  if(r17GengarPsychic(view,p)<2||view.globalTurn<2)return null;
  const r=p.publicRestrictions||{};
  if(r.cannotAttackNextTurn||r.attackCostIncreaseNextTurn>0||r.attackCostIncreaseWhileActive>0||
    list(p.specialConditions).length||list(r.cannotUseAttacksNextTurn).includes('Poltergeist')||
    r.blockedAttackNameNextTurn==='Poltergeist'||r.blockedAttackNameUntilLeavesActive==='Poltergeist'||
    r.onlyAllowedAttackNameNextTurn&&r.onlyAllowedAttackNameNextTurn!=='Poltergeist'||
    own(view).publicTurnRestrictions?.attackLockTurnsRemaining>0)return null;
  const t=r17PublicTrainerCount(view);
  return {known:t!==null,trainers:t,handCount:opponent(view).handCount};
}
function r17DirectPressure(view,item) {
  const p=active(own(view)),q=active(opponent(view)),key=r17Key(p),attack=item.attackName||'';
  if(r17Key(item)!==key||!q||!Number.isSafeInteger(q.hp)||!Number.isSafeInteger(q.damage)||q.damage>=q.hp)return null;
  const targets=r17VisibleRainTargets(view,p);
  if(!targets)return null;
  const target=targets.find(t=>t.zone==='active');if(!target)return null;
  let damage=null,psychic=false;
  if(key==='raichu'&&attack==='Electric Ball')damage=90;
  else if(key==='electrode'&&attack==='Electro Ball')damage=50;
  else if(key==='klefki'&&attack==='Joust'){damage=10;psychic=true;}
  else if(key==='unown'&&attack==='Hidden Power'){damage=10;psychic=true;}
  else if(key==='marshadow'&&attack==='Red Knuckles'){damage=10;psychic=true;}
  else if(key==='pikachu'&&attack==='Quick Attack')damage=20;
  else if(key==='squawk'&&attack==='Motivate')damage=20;
  else if(key==='gengar'&&attack==='Poltergeist'){
    const count=r17PublicTrainerCount(view);if(count===null)return null;
    damage=50*count;psychic=true;
  }
  if(damage===null||damage<=0)return null;
  // The visible target family has no Lightning or Colorless W/R.
  // Psychic weakness applies exactly to these two printed targets.
  if(psychic&&/^(Girafarig LOT|Wobbuffet PHF)(?: \d+)?$/i.test(printingValue(q)))damage*=2;
  if(metadata(item).hasPrevention===true)return null;
  const ko=damage>=q.hp-q.damage;
  return {damage,ko,prizes:ko?target.prizes:0,
    terminalProjection:ko&&(target.prizes>=own(view).prizeCount||!list(opponent(view).bench).some(Boolean)),
    assumption:'visible-printed-damage-only'};
}
function r17GengarAttackThreat(view,p) {
  const q=active(opponent(view));
  if(!/^Shadow Rider Calyrex VMAX CRE(?: 75)?$/i.test(printingValue(q)))return false;
  const total=slots(opponent(view)).reduce((n,s)=>n+list(s.energies).filter(e=>/^Psychic Energy(?:\b|$)/i.test(printingValue(e))).length,0);
  const activeEnergy=list(q.energies).filter(e=>/^Psychic Energy(?:\b|$)/i.test(printingValue(e))).length;
  const cost=/^Dimension Valley PHF(?: \d+)?$/i.test(r17Stadium(view))&&r17StadiumToolLive(view)?2:3;
  return activeEnergy>=cost&&10+30*total>=p.hp-p.damage;
}
function r17SwitchValue(p,v) {
  if(r17GengarReady(v,p)&&!r17GengarAttackThreat(v,p))return 300;
  const gengar=r17GengarDirect(v,p);
  if(gengar&&(gengar.known&&gengar.trainers>=3||!gengar.known&&gengar.handCount>=5)&&
    (opponent(v).prizeCount>3||gengar.known&&gengar.trainers*50>=active(opponent(v))?.hp-active(opponent(v))?.damage))return 280;
  const key=r17Key(p);
  const energies=list(p?.energies),units=energies.reduce((n,e)=>n+(r17EnergyProvision(e,own(v).prizeCount,opponent(v).prizeCount,r17NeedTempleRemoval(v))?.total||0),0);
  const lightning=energies.some(e=>(r17EnergyProvision(e,own(v).prizeCount,opponent(v).prizeCount,r17NeedTempleRemoval(v))?.lightning||0)>0);
  if(key==='raichu'&&r17FundedRainProjection(v,p,{ignoreTemple:r17NeedTempleRemoval(v)&&r17StadiumAnswerPossible(v)}))return 360;
  if(key==='raichu'&&units>=3&&lightning)return 240;
  if(key==='klefki'){
    const route=r17KlefkiDestinationPlan(v,p);
    if(route){
      const direct=list(own(v).bench).filter(q=>r17Key(q)==='raichu').some(q=>{
        const projected=r17SwitchProjection(v,q,active(opponent(v)));
        const plan=r17FundedRainProjection(projected,active(own(projected)),{ignoreTemple:r17NeedTempleRemoval(projected)&&r17StadiumAnswerPossible(projected)});
        return plan&&r17CompareProjection(plan,route.plan)>=0;
      });
      if(!direct)return 370;
    }
    if(!r17Board(v,'unown')&&!r17NeedTempleRemoval(v)&&!r17Suppressed(p,'Mischievous Lock'))return 150;
  }
  if(key==='unown')return 110;
  if(key==='marshadow'&&!r17NeedTempleRemoval(v))return 90;
  if(key==='voltorb')return r17Board(v,'electrode')?75:30;
  if(key==='pikachu')return r17Board(v,'raichu')?75:25;
  if(key==='ditto')return 20;
  if(key==='squawk')return 15;
  if(key==='electrode'||key==='raichu'||key==='gengar')return 5;
  return 0;
}
function r17SwitchChoices(prompt,view) {
  const rows=r17Rank(list(prompt.choices).filter(c=>{
    const m=metadata(c);
    if(c.kind!=='pokemon'||m.ownerSeat!=='actor'||m.targetZone!=='bench'||m.isOwnerVisible!==true)return false;
    const p=r17Slot(view,'bench',m.benchIndex);
    return p&&r17Key(p)!==null&&r17Key(p)===r17Key(c);
  }),c=>r17SwitchValue(r17Slot(view,'bench',metadata(c).benchIndex),view));
  return r17Multi(prompt,rows,1);
}
function r17DittoEvolutionScore(key,view) {
  if(key==='raichu'&&!r17Board(view,'raichu')&&!r17CoreBaseReady(view,'pikachu'))return 340;
  if(key==='electrode'){
    const need=(r17SecondBombUseful(view)?2:1)-r17BoardCount(view,'electrode');
    const natural=r17BoardCount(view,'voltorb')+r17HandCount(view,'voltorb');
    if(need>natural&&need>0)return r17Board(view,'electrode')?220:330;
  }
  return 0;
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
    return slot&&r17NeedStadiumRemoval(view)&&!r17AbilityBlocked(view,'marshadow',slot,name)&&
      list(slot.energies).length===0&&list(slot.tools).length===0?410:0;
  }
  if(key==='squawk'&&name==='Squawk and Seize'){
    const p=r17OwnAbilitySlot(item,view,false);
    return p&&!r17Suppressed(p,name)&&r17First(view)&&!r17AbilityBlocked(view,'squawk',p,name)?
      r17DrawDiscardScore(view,6):0;
  }
  if(key==='ditto'&&name==='Almighty Evolution') {
    const p=r17OwnAbilitySlot(item,view,false);
    return p&&!r17AbilityBlocked(view,'ditto',p,name)&&
      ['raichu','electrode'].some(k=>r17Hand(view,k)&&r17DittoEvolutionScore(k,view)>0)?220:0;
  }
  return 0;
}
function r17ScorePlay(item,view) {
  const k=r17Key(item),m=metadata(item),t=r17Key(item.targetPrinting);
  if(!k)return 0;
  if(R17_ITEM.has(k)&&!itemAvailable(view))return 0;
  if(R17_SUPPORTER.has(k)&&!supporterAvailable(view))return 0;
  if(k==='unown')return r17Space(view)>0&&r17UnownUseful(view)?240:0;
  if(k==='voltorb'){
    const n=r17BoardCount(view,'voltorb')+r17BoardCount(view,'electrode');
    if(r17Space(view)>0&&n===0)return 320;
    const missingP=Number(!r17Board(view,'pikachu')&&!r17Board(view,'raichu')&&!r17Board(view,'ditto'));
    return n===1&&r17SecondBombUseful(view)&&r17Space(view)>missingP?185:0;
  }
  if(k==='pikachu')return r17Space(view)>0&&!r17Board(view,'pikachu')&&!r17Board(view,'raichu')?310:0;
  if(k==='ditto')return r17Space(view)>0&&!r17Board(view,k)&&!r17AbilityBlocked(view,'ditto')?
    (r17MissingCore(view).length>0?190:r17SecondBombUseful(view)&&r17BoardCount(view,'voltorb')+r17BoardCount(view,'electrode')+r17HandCount(view,'voltorb')<2?165:0):0;
  if(k==='electrode'||k==='raichu')return m.targetSeat==='actor'&&
    (k==='electrode'?t==='voltorb'&&r17BoardCount(view,'electrode')<(r17SecondBombUseful(view)?2:1):
      t==='pikachu'&&!r17Board(view,'raichu'))?340:0;
  if(k==='marshadow')return r17Space(view)>0&&r17NeedStadiumRemoval(view)&&!r17AbilityBlocked(view,'marshadow')?300:0;
  if(k==='squawk')return r17Space(view)>0&&r17First(view)&&!r17AbilityBlocked(view,'squawk')&&
    !r17Hand(view,'research')&&!r17Hand(view,'carmine')&&r17DrawDiscardScore(view,6,'squawk')>0?190:0;
  if(k==='gengar')return r17Space(view)>0&&!r17Board(view,k)&&!gxUsed(view)&&r17Hand(view,'unit')?145:0;
  if(k==='vip'){const z=r17KnownOwnZones(view);return r17First(view)&&r17Space(view)>0&&(!z||Object.keys(z.deck).some(k=>r17VipValue(k,view)>0))?350:0;}
  if(k==='carrier')return r17CoreAccess(view).carrierKeys.length||
    r17Discard(view).some(c=>!R17_CORE_KEYS.includes(r17Key(c))&&r17CarrierValue(r17Key(c),view)>0)?290:0;
  if(k==='compressor')return r17ActiveLoadPlan(view)?395:r17CompressorUseful(view)?(r17CompressorGain(view)>0?305:250):0;
  if(k==='stretcher'){
    const shuffle=r17StretcherShufflePlan(view);
    if(shuffle.length===3)return 360-20*r17Deck(view);
    return r17CoreAccess(view).stretcherKeys.length||
      r17Discard(view).some(c=>!R17_CORE_KEYS.includes(r17Key(c))&&r17RecoveryValue(r17Key(c),view)>0)?275:0;
  }
  if(k==='mail')return r17Deck(view)>=2?175:0;
  if(k==='heavy'){
    const z=r17KnownOwnZones(view);
    if(r17NeedStadiumRemoval(view)&&!r17Board(view,'marshadow')&&!r17Hand(view,'marshadow')&&
      (z?.prizes?.marshadow||0)>0)return 405;
    if(z&&((r17Missing(view,'voltorb','electrode')&&(z.prizes.voltorb||0)>0)||
      (r17Missing(view,'pikachu','raichu')&&(z.prizes.pikachu||0)>0)))return 245;
    return r17Missing(view,'voltorb','electrode')||r17Missing(view,'pikachu','raichu')?160:0;
  }
  if(k==='secret'){
    const payment=r17SecretPayment(hand(view),view,'secret');
    return payment.length>=3?(payment.some(c=>R17_ENERGY.has(r17Key(c)))&&r17RainWindow(view,active(own(view)))?380:155):0;
  }
  if(k==='research'||k==='carmine')return r17DrawDiscardScore(view,k==='research'?7:5,k);
  if(k==='pokestop'&&/^Sky Field\b/i.test(r17Stadium(view))&&benchCount(own(view))>5)return 0;
  if(k==='pokestop')return r17Deck(view)>=12&&!r17NeedStadiumRemoval(view)&&
    !/^Pok[eé]Stop\b/i.test(r17Stadium(view))?110:r17NeedStadiumRemoval(view)?300:0;
  if(k==='uturn') {
    if(!r17ToolEffectsLive(view)||own(view).publicTurnRestrictions?.toolPlayLocked===true||view.ownTurnResources?.toolPlayLocked===true)return 0;
    const s=r17Slot(view,m.targetZone,m.targetIndex);
    if(m.targetSeat==='actor'&&m.targetZone==='bench'&&r17Key(s)==='klefki'&&!list(s.tools).length&&r17KlefkiPivotPlan(view,false))return 340;
    return m.targetSeat==='actor'&&m.targetZone==='active'&&s&&list(s.tools).length===0&&
      list(s.printed?.retreatCost).length===1&&benchCount(own(view))>0?130:0;
  }
  if(k==='ticket')return r17TicketPlan(view)?390:0;
  if(k==='sight'){
    const p=r17Slot(view,m.targetZone,m.targetIndex);
    if(m.targetSeat!=='actor'||r17Key(p)!=='raichu'||list(p.tools).length||!r17ToolEffectsLive(view)||own(view).publicTurnRestrictions?.toolPlayLocked||view.ownTurnResources?.toolPlayLocked)return 0;
    const baseline=r17RainProjection(view,p),boosted=r17RainProjection(view,p,{forceSight:true});
    if(boosted&&r17CompareProjection(boosted,baseline)>0)return 400;
    const bounds=r17EnergyDeckBounds(view),capacity=Math.min(12,3*r17HandCount(view,'compressor'));
    const base=r17LoadPlan(view,p,bounds,capacity),withSight=r17LoadPlan(view,p,bounds,capacity,{forceSight:true});
    return withSight&&r17CompareProjection(withSight.projection,base?.projection)>0?375:0;
  }
  if(k==='klefki')return !r17Board(view,'klefki')&&r17KlefkiPivotPlan(view,true)?350:0;
  if(k==='rope')return 0; // do not spend irreversible forced switch without the paired opponent response.
  if(R17_ENERGY.has(k)&&m.targetSeat==='actor') {
    const p=r17Slot(view,m.targetZone,m.targetIndex);
    if(t==='raichu'&&r17Key(p)==='raichu'&&r17RainWindow(view,p)&&!r17NeedTempleRemoval(view)){
      const extraAttached=[R17_ENERGY_PRINTING[k]],baseline=r17RainProjection(view,p);
      const immediate=r17RainProjection(view,p,{extraAttached});
      if(immediate&&r17CompareProjection(immediate,baseline)>0)return 390+({reversal:3,counter:2,unit:1}[k]);
      const bounds=r17EnergyDeckBounds(view),capacity=Math.min(12,3*r17HandCount(view,'compressor'));
      const before=r17LoadPlan(view,p,bounds,capacity),after=r17LoadPlan(view,p,bounds,capacity,{extraAttached});
      if(after&&r17CompareProjection(after.projection,before?.projection)>0)return 365+({reversal:3,counter:2,unit:1}[k]);
    }
    if(t==='klefki'&&m.targetZone==='active'&&r17Key(p)==='klefki'&&
      r17IsWob(active(opponent(view)))&&r17LiveHood(view,active(opponent(view)))&&
      list(p.energies).length===0)return 260+({unit:3,counter:2,reversal:1}[k]);
    const early=r17EarlyEnergyScore(k,t,view,p);
    if(early>0)return early;
  }
  return 0;
}
function r17PokestopUseScore(view) {
  if(r17Deck(view)<12)return 0;
  const z=r17KnownOwnZones(view);
  if(z&&(z.deck.ditto||0)>0&&!r17Board(view,'ditto')&&!r17Hand(view,'ditto')) {
    const strandedRaichu=r17Hand(view,'raichu')&&!r17Board(view,'raichu')&&
      !r17Board(view,'pikachu')&&!r17Hand(view,'pikachu')&&(z.deck.pikachu||0)===0;
    const strandedElectrode=r17Hand(view,'electrode')&&!r17Board(view,'electrode')&&
      !r17Board(view,'voltorb')&&!r17Hand(view,'voltorb')&&(z.deck.voltorb||0)===0;
    if(strandedRaichu||strandedElectrode)return 0;
  }
  return 125;
}
function r17Score(item,request) {
  const view=request.observation,m=metadata(item);
  if(item.kind==='use-ability')return r17ScoreAbility(item,view);
  if(item.kind==='play-card')return r17Key(item)==='rope'?r17RopeScore(request):r17ScorePlay(item,view);
  if(item.kind==='use-stadium'&&r17Key(item)==='pokestop')return m.stadiumEffectLive===true?r17PokestopUseScore(view):0;
  if(item.kind==='attack') {
    const attack=item.attackName||'';
    if(!R17_POKEMON.has(r17Key(item)))return 0;
    if(/^(Electro Rain|Crush and Burn-GX)$/i.test(attack))return -1000;
    // Only these shared rank-4 attacks have an existing decision heuristic.
    const direct=r17DirectPressure(view,item);
    if(direct?.terminalProjection)return 850;
    if(direct?.ko)return 285+20*direct.prizes;
    if(attack==='Horror House-GX'&&r17GengarAttackThreat(view,active(own(view))))return 35;
    if(attack==='Poltergeist'){
      const count=r17PublicTrainerCount(view);
      return count!==null?Math.min(190,40+20*count):scoreAttack(item,view);
    }
    if(attack==='Joust'&&r17JoustUnlocksBomb(view))return 235;
    if(/^(Horror House-GX|Electric Ball|Electro Ball|Joust)$/i.test(attack))return scoreAttack(item,view);
    if(attack==='Motivate')return 35;
    if(/^(Hidden Power|Quick Attack|Nuzzle|Thunder Wave|Red Knuckles|Big Explosion)$/i.test(attack))
      return attack==='Big Explosion'?0:35;
    return 0;
  }
  if(item.kind==='retreat'&&m.targetSeat==='actor'&&m.targetZone==='bench'&&r17FreeRetreat(item,view)) {
    const s=r17Slot(view,'bench',m.targetIndex??m.benchIndex);
    if(r17Key(s)==='gengar'&&r17SwitchValue(s,view)>=280&&r17SwitchValue(active(own(view)),view)<240)return 240;
    if(s&&r17Key(s)==='raichu'&&r17SwitchValue(s,view)>=240&&r17SwitchValue(active(own(view)),view)<240){
      // Departing Klefki can either reactivate an unhooded Wob or abandon
      // the funded Joust line that removes Hood. Preserve that connector.
      if(r17JoustUnlocksBomb(view))return 0;
      if(r17DepartingKlefkiRelocks(view)&&(r17Discard(view).some(c=>R17_ENERGY.has(r17Key(c)))||r17ActiveLoadPlan(view)))return 0;
      return 115;
    }
  }
  return 0;
}
function r17Best(request) {
  const items=list(request.actionFrontier?.items).filter(i=>EXECUTABLE.has(i.kind));
  const ranked=r17Rank(items,i=>r17Score(i,request));
  // Do not hide a terminal but unsupported Rain line behind a weaker,
  // supported attack. A directly terminal supported attack still wins.
  const terminal=ranked.find(i=>i.kind==='attack'&&r17DirectPressure(request.observation,i)?.terminalProjection===true);
  if(terminal)return {kind:'select-action',token:terminal.token};
  const rainRoot=items.some(i=>i.kind==='attack'&&r17Key(i)==='raichu'&&i.attackName==='Electro Rain');
  if(rainRoot) {
    const projection=r17RainProjection(request.observation,active(own(request.observation)));
    if(projection?.terminalProjection===true&&projection.bombs===0)
      return r17Abstain('R17_CORE_COMBO_NOT_IMPLEMENTED');
  }
  if(ranked[0])return {kind:'select-action',token:ranked[0].token};
  if(items.some(i=>r17Score(i,request)<0))return r17Abstain('R17_CORE_COMBO_NOT_IMPLEMENTED');
  const pass=items.find(i=>i.kind==='pass');
  return pass?{kind:'select-action',token:pass.token}:r17Abstain('R17_NO_SUPPORTED_ROOT');
}
function r17Option(prompt,index) {
  const c=list(prompt.choices).find(x=>x.kind==='option'&&metadata(x).choiceIndex===index);
  return c?{kind:'select-choice',token:c.token}:r17Abstain('R17_OPTION_UNAVAILABLE');
}
function r17SetupActiveValue(key,view) {
  const goingSecond=Number.isSafeInteger(view.turnSeat)&&view.turnSeat!==view.actorSeat;
  if(key==='gengar'&&goingSecond&&r17Hand(view,'unit'))return 1000;
  if(key==='klefki'){
    const mobility=r17Hand(view,'rope')||r17Hand(view,'uturn');
    const selfLock=r17Hand(view,'unown')||r17Hand(view,'squawk')||r17Hand(view,'ditto');
    if(mobility||!selfLock)return 800;
    return 400; // avoid trapping the own draw engine behind Basic lock
  }
  if(key==='unown')return 650;
  if(key==='marshadow')return 600;
  // Protect scarce species-compatible bases and multi-Prize support bodies.
  if(key==='voltorb')return 350;
  if(key==='ditto')return 300;
  if(key==='pikachu')return 250;
  if(key==='squawk')return 150;
  if(key==='gengar')return 100;
  return 0;
}
function r17SetupChoices(prompt,view) {
  const cards=r17ChoiceCards(prompt,'hand').filter(c=>R17_BASIC.has(r17Key(c)));
  const m=metadata(prompt),initial=m.minimumCount===1;
  const rows=[],used=new Set();
  const add=c=>{if(c&&!used.has(c.token)){rows.push(c);used.add(c.token);return true;}return false;};
  if(initial){
    if(!add(r17Rank(cards,c=>r17SetupActiveValue(r17Key(c),view))[0]))return r17Abstain('R17_BAD_SETUP');
  }
  const cap=Math.min(m.maximumCount,(initial?1:0)+r17Space(view));
  const count=k=>r17BoardCount(view,k)+rows.filter(c=>r17Key(c)===k).length;
  const find=k=>cards.find(c=>!used.has(c.token)&&r17Key(c)===k);
  const take=k=>rows.length<cap&&add(find(k));
  // Both natural core bases, then a second Electrode base when the four
  // Prize self-KO budget remains viable. A Ditto only fills one deficit.
  if(count('pikachu')+count('raichu')===0)take('pikachu');
  if(count('voltorb')+count('electrode')===0)take('voltorb');
  const needE=r17SecondBombUseful(view)?2:1;
  if(count('voltorb')+count('electrode')<needE&&
     (count('pikachu')+count('raichu')+count('ditto')>0))take('voltorb');
  if(count('ditto')===0&&
    (count('pikachu')+count('raichu')===0||count('voltorb')+count('electrode')<needE))take('ditto');
  const activeKey=initial?r17Key(rows[0]):r17Key(active(own(view)));
  // Keep space for a missing line rather than fill all five Bench slots.
  const reserve=Number(count('pikachu')+count('raichu')===0&&count('ditto')===0)+
    Number(count('voltorb')+count('electrode')===0);
  if(activeKey!=='klefki'){
    while(rows.length<cap-reserve&&count('unown')-(activeKey==='unown'?1:0)<2&&take('unown')){}
  }
  // If there is an actual second Basic available, do not begin with a
  // gratuitously sole Active. Prefer a one-Prize backup to support ex/GX.
  const alreadyBench=benchCount(own(view))+rows.length-(initial?1:0);
  if(alreadyBench===0&&rows.length<cap){
    for(const key of ['unown','marshadow','klefki','voltorb','pikachu','ditto','squawk','gengar'])
      if(take(key))break;
  }
  return r17Multi(prompt,rows);
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
    return r17SetupChoices(p,v);
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
    if(key==='compressor')return (r17ActiveLoadPlan(v,r17CardCounts(r17ChoiceCards(p,'deck'))||{},true)||r17CompressorUseful(v))?
      r17CompressorChoices(p,v):r17Abstain('R17_COMPRESSOR_NO_CARRIER_PLAN');
    if(key==='vip')return r17VipChoices(p,v);
    if(key==='stretcher')return r17StretcherChoices(p,v);
    if(key==='mail')return r17Multi(p,r17Rank(r17ChoiceCards(p,'deck'),c=>r17TrainerNeed(r17Key(c),v)),1);
    if(key==='secret') {
      const zone=metadata(p).sourceZone;
      if(zone==='hand')return r17Multi(p,r17SecretPayment(r17ChoiceCards(p,'hand'),v,null),3);
      if(zone==='deck')return r17SecretChoices(p,v);
      return r17Abstain('R17_SECRET_BOX_UNKNOWN_ZONE');
    }
    if(key==='ditto'&&effect==='Almighty Evolution') {
      return r17Multi(p,r17Rank(r17ChoiceCards(p,'hand'),c=>{
        const k=r17Key(c);
        return r17DittoEvolutionScore(k,v);
      }),1);
    }
    if(key==='heavy')return r17Multi(p,r17Rank(r17ChoiceCards(p,'prizes'),c=>r17VipValue(r17Key(c),v)),1);
  }
  if(key==='rope'&&type==='ChoosePokemonPrompt')return r17SwitchChoices(p,v);
  if(key==='stretcher'&&(type==='SelectOptionPrompt'||type==='SelectPrompt')) {
    if(r17StretcherShufflePlan(v).length===3)return r17Option(p,1);
    if(r17CoreAccess(v,{}, {stretcher:1}).stretcherKeys.length||
      r17Discard(v).some(c=>!R17_CORE_KEYS.includes(r17Key(c))&&r17RecoveryValue(r17Key(c),v)>0))
      return r17Option(p,0);
  }
  if((key==='unown'&&effect==='Farewell Letter'||key==='marshadow'&&effect==='Resetting Hole'||
      key==='squawk'&&effect==='Squawk and Seize')&&type==='ConfirmPrompt') {
    const ok=key==='unown'?r17UnownUseful(v):key==='marshadow'?r17NeedStadiumRemoval(v):
      r17First(v)&&r17DrawDiscardScore(v,6)>0;
    const c=list(p.choices).find(x=>x.kind==='confirm'&&x.label===(ok?'Yes':'No'));
    return c?{kind:'select-choice',token:c.token}:r17Abstain('R17_CONFIRM_OPTION_MISSING');
  }
  // Host projection for ordinary face-down Prize choice is opaque; no
  // hidden identity is inferred. Use position only for actual Prize-taking,
  // never for a Heavy Ball effect without visible owner-authorized identities.
  if(type==='ChoosePrizePrompt'&&key!=='heavy'&&key!=='ticket') {
    const choices=list(p.choices).filter(x=>x.kind==='prize'&&metadata(x).ownerSeat==='actor');
    if(choices.length&&metadata(p).selectionType==='prize-slots'&&R17_POKEMON.has(key))
      return r17Multi(p,choices,metadata(p).requiredCount);
  }
  return r17Abstain('R17_UNSUPPORTED_PROMPT');
}
// Narrow *executable* direct Rain window. Do not infer any unseen Energy,
// opponent hidden Bench card or favorable reduction effect. The actor must
// already have a paid, legal Electro Rain attack and a fully printed public
// target board with no attached opponent Tools or live Stadium. A one-turn
// board-out/Prize-terminal plan is favored over a zero-benefit fallback.
function r17DirectRainWindow(request){
  const v=request?.observation,p=active(own(v));
  if(!v||!p||r17Key(p)!=='raichu'||!r17RainWindow(v,p)||
     r17NeedTempleRemoval(v)||list(own(v).stadium).length||
     list(opponent(v).stadium).length||
     !Number.isSafeInteger(own(v).prizeCount)||
     !Number.isSafeInteger(opponent(v).prizeCount))return null;
  const items=list(request.actionFrontier?.items);
  if(items.some(x=>x.kind==='attack'&&
     r17DirectPressure(v,x)?.terminalProjection===true))return null;
  const attack=items.find(x=>x.kind==='attack'&&
    x.attackName==='Electro Rain'&&r17Key(x)==='raichu'&&
    metadata(x).attackCostPayable===true);
  if(!attack)return null;
  const targets=r17VisibleRainTargets(v,p);
  if(!targets||targets.length>9||targets.some(t=>{
    const q=t.zone==='active'?active(opponent(v)):opponent(v).bench?.[t.index];
    return !q||list(q.tools).length!==0||!Number.isSafeInteger(q.hp)||
      !Number.isSafeInteger(q.damage)||q.damage<0||q.damage>=q.hp||
      (q.publicDamageEffects!==undefined&&(
        q.publicDamageEffects.prevention!=='none'||
        q.publicDamageEffects.effectsPrevention!=='none'||
        q.publicDamageEffects.reduction!==0));
  }))return null;
  const energies=list(p.energies);
  if(energies.length===0||energies.length>12||
     energies.some(c=>!R17_ENERGY.has(r17Key(c))))return null;
  const attached=energies.map((c,i)=>({
    printing:printingValue(c),token:'attached-'+i
  }));
  const input={
    attackWindowKnown:true,modifiersComplete:true,temple:false,
    ownPrizes:own(v).prizeCount,opponentPrizes:opponent(v).prizeCount,
    availableBombs:0,attached,discard:[],
    targets:targets.map(t=>({
      id:t.zone+':'+t.index,remainingHp:t.hits*30,
      prizes:t.prizes,threat:0,damageAllowed:true,
      flatDamageModifier:0,requiresNoSpecialAttached:false,
      minRemainingEnergy:0
    }))
  };
  const plan=r17PlanRainTurn(input);
  if(plan?.status!=='immediate-ko-plan'||plan.win!==true||
     plan.bombsUsed!==0||plan.discardTokens.length===0||
     plan.lightningUnits<=0||plan.lightningUnits>512)return null;
  return {action:attack,plan,targets,
    printedEnergyByToken:new Map(attached.map(c=>[c.token,c.printing]))};
}
function r17RainEnergyDecision(req,chain){
  const p=req.prompt,src=p?.source,m=metadata(p);
  if(req.sequence!==chain.sequence+1||
     p?.promptType!=='ChooseCardsPrompt'||
     src?.sourceKind!=='card-effect'||
     src.sourcePrinting!=='Alolan Raichu UNM'||
     src.effectName!=='Electro Rain'||
     m.selectionType!=='card-combination'||
     m.ownerSeat!=='actor'||m.isOwnerVisible!==true||
     !['board','energy'].includes(m.sourceZone)||
     !Number.isSafeInteger(m.minimumCount)||
     !Number.isSafeInteger(m.maximumCount)||
     m.minimumCount>chain.plan.discardTokens.length||
     m.maximumCount<chain.plan.discardTokens.length)
    return null;
  const used=new Set(),tokens=[];
  for(const id of chain.plan.discardTokens){
    const name=chain.printedEnergyByToken.get(id);
    if(!name)return null;
    const rows=list(p.choices).filter(c=>c.kind==='card'&&
      metadata(c).ownerSeat==='actor'&&metadata(c).isOwnerVisible===true&&
      !used.has(c.token)&&r17Key(c)===r17Key(name));
    if(rows.length<1)return null;
    tokens.push(rows[0].token);used.add(rows[0].token);
  }
  return {kind:'select-choices',tokens};
}
function r17RainPacketsDecision(req,chain){
  const p=req.prompt,src=p?.source,m=metadata(p),items=list(p?.choices);
  if(req.sequence!==chain.sequence+1||
     p?.promptType!=='PutDamagePrompt'||
     src?.sourceKind!=='card-effect'||
     src.sourcePrinting!=='Alolan Raichu UNM'||
     src.effectName!=='Electro Rain'||
     m.selectionType!=='damage-packets'||
     m.minimumCount!==chain.plan.lightningUnits||
     m.maximumCount!==chain.plan.lightningUnits||
     m.amount!==30*chain.plan.lightningUnits||
     m.ownerSeat!=='opponent')return null;
  const tokens=[];let ordinal=0;
  for(const allocation of chain.plan.allocation){
    const [zone,idx]=String(allocation.targetId).split(':');
    const index=Number(idx);
    const row=chain.targets.find(x=>x.zone===zone&&x.index===index);
    const actual=zone==='active'?active(opponent(req.observation)):
      opponent(req.observation).bench?.[index];
    if(!row||!actual||printingValue(actual)!==row.printing||
       !Number.isSafeInteger(allocation.hits)||allocation.hits<=0)return null;
    for(let j=0;j<allocation.hits;j++){
      const found=items.filter(c=>c.kind==='pokemon'&&
        metadata(c).ownerSeat==='opponent'&&
        metadata(c).isOwnerVisible===true&&
        metadata(c).selectionIndex===ordinal&&
        metadata(c).amount===30&&
        metadata(c).targetZone===zone&&
        (zone==='active'?metadata(c).slotIndex===0:
          metadata(c).benchIndex===index)&&
        printingValue(c)===row.printing);
      if(found.length!==1)return null;
      tokens.push(found[0].token);
      ordinal++;
    }
  }
  if(tokens.length!==chain.plan.lightningUnits||
     new Set(tokens).size!==tokens.length)return null;
  return {kind:'select-choices',tokens};
}
function r17CreatePolicy({role,seat,policyVersion,config}) {
  if(role!=='opponent'||![0,1].includes(seat)||policyVersion!==R17_VERSION||
     !config||typeof config!=='object'||Array.isArray(config)||Object.keys(config).length)
    throw Error('AGENT50_RANK17_POLICY_INIT_MISMATCH');
  let rain=null;
  return Object.freeze({decide(request){
    if(!request||request.role!==role||request.seat!==seat||request.observation?.actorSeat!==seat)
      return r17Abstain('ROLE_SEAT_BINDING_MISMATCH');
    if(rain){
      const bad=!request.prompt||rain.turn!==request.observation.globalTurn||
        !Number.isSafeInteger(request.sequence)||request.sequence!==rain.sequence+1;
      if(bad){rain=null;return r17Abstain('R17_UNTRUSTED_PROMPT');}
      const decision=rain.stage==='discard'?
        r17RainEnergyDecision(request,rain):r17RainPacketsDecision(request,rain);
      if(!decision){rain=null;return r17Abstain('R17_UNTRUSTED_PROMPT');}
      if(rain.stage==='discard'){
        rain={...rain,stage:'damage',sequence:request.sequence};
      }else rain=null;
      return decision;
    }
    if(request.prompt!==null)return r17Prompt(request);
    const candidate=r17DirectRainWindow(request);
    if(candidate){
      rain={stage:'discard',turn:request.observation.globalTurn,
        sequence:request.sequence,...candidate};
      return {kind:'select-action',token:candidate.action.token};
    }
    return r17Best(request);
  }});
}

// Pure source-family tactical kernel. It is NOT an engine adapter and is not
// called by createPolicy until the shared native Bomb/Rain prompt contract
// supports all mandatory continuations. Only immediate, fully specified
// attack windows are solved. Callers must establish legality, mobility,
// exact public HP/Prize values, and complete target modifiers.
function r17EnergyProvision(printing, ownPrizes, opponentPrizes, temple) {
  const k=r17Key(printing);
  if(!R17_ENERGY.has(k))return null;
  if(temple)return {lightning:0,total:1};
  if(k==='unit')return {lightning:1,total:1};
  if(ownPrizes>opponentPrizes) {
    const n=k==='reversal'?3:2;
    return {lightning:n,total:n};
  }
  return {lightning:0,total:1};
}
function r17Combinations(values,n) {
  const result=[];
  function visit(start,selected) {
    if(selected.length===n){result.push(selected.slice());return;}
    for(let i=start;i<=values.length-(n-selected.length);i++){
      selected.push(values[i]);visit(i+1,selected);selected.pop();
    }
  }
  visit(0,[]);
  return result;
}
function r17RainTargetCost(target,remainingEnergy,remainingSpecial) {
  if(!target.damageAllowed||
     target.requiresNoSpecialAttached&&remainingSpecial>0||
     remainingEnergy<target.minRemainingEnergy)return Infinity;
  // Attack damage, not counters. The flat modifier is applied once to a
  // targeted Pokemon, never multiplied by the number of selected hits.
  return Math.max(1,Math.ceil((target.remainingHp-target.flatDamageModifier)/30));
}
function r17RainCmp(a,b) {
  if(!b)return 1;
  // Within an immediate win, save the self-KOs and resources. Otherwise
  // optimize net immediate Prize swing, then denied threat and Prizes.
  const av=a.win?[1,-a.bombsUsed,-a.discardTokens.length,-a.lightningUnits,a.prizesTaken,a.threatRemoved]:
    [0,a.netPrizeSwing,a.threatRemoved,a.prizesTaken,-a.bombsUsed,-a.discardTokens.length,-a.lightningUnits];
  const bv=b.win?[1,-b.bombsUsed,-b.discardTokens.length,-b.lightningUnits,b.prizesTaken,b.threatRemoved]:
    [0,b.netPrizeSwing,b.threatRemoved,b.prizesTaken,-b.bombsUsed,-b.discardTokens.length,-b.lightningUnits];
  for(let i=0;i<av.length;i++)if(av[i]!==bv[i])return av[i]>bv[i]?1:-1;
  return 0;
}
function r17ValidateRainInput(input) {
  if(!input||input.attackWindowKnown!==true||input.modifiersComplete!==true||
     typeof input.temple!=='boolean'||!Number.isSafeInteger(input.ownPrizes)||
     input.ownPrizes<1||input.ownPrizes>6||
     !Number.isSafeInteger(input.opponentPrizes)||input.opponentPrizes<1||input.opponentPrizes>6||
     !Number.isSafeInteger(input.availableBombs)||input.availableBombs<0||input.availableBombs>2||
     !Array.isArray(input.attached)||!Array.isArray(input.discard)||
     input.attached.length+input.discard.length>12||!Array.isArray(input.targets)||
     input.targets.length<1||input.targets.length>9)return false;
  const tokens=new Set(),counts=new Map();
  for(const card of [...input.attached,...input.discard]){
    const k=r17Key(card?.printing);
    if(!R17_ENERGY.has(k)||typeof card.token!=='string'||!card.token||tokens.has(card.token))return false;
    tokens.add(card.token);counts.set(k,(counts.get(k)||0)+1);
    if(counts.get(k)>4)return false;
  }
  const ids=new Set();
  for(const t of input.targets){
    if(!t||typeof t.id!=='string'||!t.id||ids.has(t.id)||
       !Number.isSafeInteger(t.remainingHp)||t.remainingHp<=0||
       !Number.isSafeInteger(t.prizes)||t.prizes<0||t.prizes>6||
       !Number.isFinite(t.threat)||t.threat<0||
       typeof t.damageAllowed!=='boolean'||!Number.isSafeInteger(t.flatDamageModifier)||
       typeof t.requiresNoSpecialAttached!=='boolean'||
       !Number.isSafeInteger(t.minRemainingEnergy)||t.minRemainingEnergy<0)return false;
    ids.add(t.id);
  }
  return true;
}
// Physically distinct tokens are retained, but identical printings are
// interchangeable for this immediate all-to-one-Raichu calculation.
// Enumerate three type counts instead of every permutation of copies.
function r17EnergySubsets(cards,minimum,maximum) {
  const types=['reversal','counter','unit'],counts=types.map(k=>cards.filter(c=>r17Key(c.printing)===k).length),rows=[];
  for(let r=0;r<=counts[0];r++)for(let c=0;c<=counts[1];c++)for(let u=0;u<=counts[2];u++){
    const n=r+c+u;if(n<minimum||n>maximum)continue;
    const left={reversal:r,counter:c,unit:u};
    rows.push(cards.filter(card=>{const k=r17Key(card.printing);if(left[k]<=0)return false;left[k]--;return true;}));
  }
  return rows;
}
function r17BestTargetSubset(targets,ownPrizes,bombs,units,remain,special) {
  const costs=targets.map(t=>r17RainTargetCost(t,remain,special));
  let best=null;
  // 9 targets maximum. Each mask describes one attainable set of KOs;
  // unavoidable surplus selections go onto an already defeated target.
  for(let tm=1;tm<(1<<targets.length);tm++){
    let needed=0,prizes=0,threat=0;
    const hitRows=[];
    for(let i=0;i<targets.length;i++)if(tm&(1<<i)){
      needed+=costs[i];if(needed>units)break;
      prizes+=targets[i].prizes;threat+=targets[i].threat;
      hitRows.push({targetId:targets[i].id,hits:costs[i]});
    }
    if(needed>units)continue;
    const win=prizes>=ownPrizes||hitRows.length===targets.length;
    if(!win&&prizes<=2*bombs)continue;
    const candidate={win,prizesTaken:Math.min(ownPrizes,prizes),threatRemoved:threat,
      netPrizeSwing:Math.min(ownPrizes,prizes)-2*bombs,
      allocation:hitRows.map((row,i)=>({...row,hits:row.hits+(i===0?units-needed:0)}))};
    if(!best||Number(candidate.win)>Number(best.win)||
      candidate.win===best.win&&(candidate.prizesTaken>best.prizesTaken||
        candidate.prizesTaken===best.prizesTaken&&candidate.threatRemoved>best.threatRemoved))best=candidate;
  }
  return best;
}
function r17PlanRainTurn(input) {
  if(!r17ValidateRainInput(input))return {status:'unsupported-public-window'};
  const {ownPrizes,opponentPrizes,temple,attached,discard,targets}=input;
  if(temple)return {status:'no-lightning-under-temple'};
  let best=null;
  // The same target DP is shared across load/discard vectors with equal
  // resulting unit budget and post-discard protection state.
  for(let bombs=0;bombs<=input.availableBombs;bombs++){
    const enemyAfter=opponentPrizes-2*bombs;
    if(enemyAfter<=0)break;
    const nAttach=Math.min(discard.length,5*bombs);
    if(bombs>0&&nAttach<=5*(bombs-1))break;
    const cache=new Map();
    for(const load of r17EnergySubsets(discard,nAttach,nAttach)){
      const all=[...attached,...load].map(card=>({...card,...r17EnergyProvision(card.printing,ownPrizes,enemyAfter,temple)}));
      const lightning=all.filter(c=>c.lightning>0);
      const totalEnergy=all.reduce((n,c)=>n+c.total,0);
      for(const used of r17EnergySubsets(lightning,1,lightning.length)){
        const units=used.reduce((n,c)=>n+c.lightning,0);
        const remain=totalEnergy-used.reduce((n,c)=>n+c.total,0);
        const special=all.length-used.length;
        const key=units+'/'+remain+'/'+special;
        if(!cache.has(key))cache.set(key,r17BestTargetSubset(targets,ownPrizes,bombs,units,remain,special));
        const targetPlan=cache.get(key);if(!targetPlan)continue;
        const plan={status:'immediate-ko-plan',...targetPlan,bombsUsed:bombs,
          opponentPrizesAfterBomb:enemyAfter,attachTokens:load.map(c=>c.token),
          discardTokens:used.map(c=>c.token),lightningUnits:units};
        if(r17RainCmp(plan,best)>0)best=plan;
      }
    }
  }
  return best||{status:'no-favorable-immediate-ko'};
}

module.exports = Object.freeze({
  POLICY_VERSION:R17_VERSION,SOURCE_RANK:17,
  SOURCE_LIST_BLOB_SHA1:R17_PROFILE.sourceListBlobSha1,
  SOURCE_ENTRY_JSON_SHA256:R17_PROFILE.sourceEntryJsonSha256,
  ENGINE_PIN:R17_PROFILE.enginePin,PROFILE:R17_PROFILE,createPolicy:r17CreatePolicy,
  scoreAction:r17Score,promptDecision:r17Prompt,bestAction:r17Best,
  planRainTurn:r17PlanRainTurn,knownOwnZones:r17KnownOwnZones,ticketPlan:r17TicketPlan,planCoreAccess:r17CoreAccess,wobbuffetLive:r17WobLive,abilityBlocked:r17AbilityBlocked,liveBombs:r17LiveBombs,rainProjection:r17RainProjection,ropeRainPlan:r17RopeRainPlan,energyProvision:r17EnergyProvision,loadPlan:r17LoadPlan,activeLoadPlan:r17ActiveLoadPlan,secretPayment:r17SecretPayment,fundedRainProjection:r17FundedRainProjection,readyRainAttackers:r17ReadyRainAttackers,directPressure:r17DirectPressure,publicTrainerCount:r17PublicTrainerCount,drawDiscardScore:r17DrawDiscardScore,handUtility:r17HandUtility,klefkiPivotPlan:r17KlefkiPivotPlan
});
