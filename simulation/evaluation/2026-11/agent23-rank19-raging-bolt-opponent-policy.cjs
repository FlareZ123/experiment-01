'use strict';

/*
 * Aichi rank-19 Mark Takahashi Raging Bolt opponent-role policy, v1.
 *
 * Deterministic and actor-view-only. It is a research prototype, not a
 * competence attestation. The exact source-60 identity is bound below.
 * Native Twinleaf legality remains authoritative; unsupported prompts abstain.
 * First actor turn includes global turns 1 and 2; Wait and See Hammer is
 * limited specifically to the second player's first turn (global turn 2).
 */

const POLICY_VERSION = 'agent23-rank19-raging-bolt-opponent-v1';
const SOURCE_RANK = 19;
const SOURCE_LIST_BLOB_SHA1 = 'ae773f6201d7aa69d31914dbfee66f3fba692200';
const SOURCE_FINGERPRINT_SHA256 = '8fc9b7cf236a50ea34cdf10746bfc01d5f226739d106e4afcf438ed5c8f491eb';
const ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const WORKER_PROTOCOL_BLOB_SHA1 = 'd51ea95c457d61b50a9ee114d342eb17f4350451';

const PRINT = Object.freeze({
  ragingBolt: /^Raging Bolt ex TEF 123\b/i,
  dedenne: /^Dedenne-GX UNB 57\b/i,
  adp: /^Arceus & Dialga & Palkia-GX CEC 156\b/i,
  sandyShocks: /^Sandy Shocks ex PAR 108\b/i,
  moltres: /^Galarian Moltres V CRE 97\b/i,
  hoOh: /^Ho-Oh-EX DRX 22\b/i,
  tapuKoko: /^Tapu Koko [◇♢] TEU 51\b/i,
  crobat: /^Crobat V DAA 104\b/i,
  squawk: /^Squawkabilly ex PAL 169\b/i,
  tapuLele: /^Tapu Lele-GX GRI 60\b/i,
  latias: /^Latias ex SSP 76\b/i,
  marshadow: /^Marshadow UNB 81\b/i,
  sudowoodo: /^Sudowoodo GRI 66\b/i,
  flutterMane: /^Flutter Mane TEF 78\b/i,
  sada: /^Professor Sada's Vitality PAR 170\b/i,
  guzma: /^Guzma BUS 115\b/i,
  raihan: /^Raihan EVS 152\b/i,
  arven: /^Arven OBF 186\b/i,
  iono: /^Iono PAL 185\b/i,
  carmine: /^Carmine TWM 145\b/i,
  quickBall: /^Quick Ball FST 237\b/i,
  compressor: /^Battle Compressor PHF 92\b/i,
  vsSeeker: /^VS Seeker PHF 109\b/i,
  vipPass: /^Battle VIP Pass FST 225\b/i,
  nightStretcher: /^Night Stretcher ASC 196\b/i,
  hammer: /^Wait and See Hammer LOT 192\b/i,
  fieldBlower: /^Field Blower GRI 125\b/i,
  cherishBall: /^Cherish Ball UNM 191\b/i,
  heavyBall: /^Hisuian Heavy Ball ASR 146\b/i,
  secretBox: /^Secret Box TWM 163\b/i,
  floatStone: /^Float Stone BKT 137\b/i,
  forestSealStone: /^Forest Seal Stone SIT 156\b/i,
  skyField: /^Sky Field ROS 89\b/i,
  doubleDragon: /^Double Dragon Energy ROS 97\b/i
});

const EXECUTABLE = new Set([
  'play-card', 'attack', 'retreat', 'use-ability', 'use-stadium', 'pass'
]);
const SUPPORTER_PATTERNS = [
  PRINT.sada, PRINT.guzma, PRINT.raihan, PRINT.arven, PRINT.iono, PRINT.carmine
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
  if (typeof value?.label === 'string') return value.label;
  return '';
}
function matches(value, pattern) {
  return pattern.test(printingValue(value));
}
function metadata(value) {
  return value?.publicMetadata ?? {};
}
function boardSlots(player) {
  return [player?.active, ...list(player?.bench)].filter(Boolean);
}
function boardHas(player, pattern) {
  return boardSlots(player).some(slot => matches(slot, pattern));
}
function boardCount(player, pattern) {
  return boardSlots(player).filter(slot => matches(slot, pattern)).length;
}
function benchCount(player) {
  return list(player?.bench).filter(Boolean).length;
}
function stadiums(player) {
  return list(player?.stadium).map(printingValue);
}
function hasSkyField(player) {
  return stadiums(player).some(value => PRINT.skyField.test(value));
}
function hasBenchSpace(player) {
  return benchCount(player) < (hasSkyField(player) ? 8 : 5);
}
function handSize(observation) {
  return list(observation?.ownHand).length;
}
function handHas(observation, pattern) {
  return list(observation?.ownHand).some(card => matches(card, pattern));
}
function hasSupporterInHand(observation) {
  return list(observation?.ownHand).some(card => SUPPORTER_PATTERNS.some(pattern => matches(card, pattern)));
}
function discardHas(player, pattern) {
  return list(player?.discard).some(card => matches(card, pattern));
}
function basicEnergyType(value) {
  const match = /^(?:Basic )?(Lightning|Fighting|Darkness|Water|Metal|Psychic|Grass|Fire|Fairy) Energy(?:\s+[A-Z0-9]+\s+\d+)?$/i.exec(printingValue(value).trim());
  return match ? match[1].toLowerCase() : null;
}
function isBasicEnergy(value) {
  return basicEnergyType(value) !== null;
}
function discardEnergyTypes(player) {
  return new Set(list(player?.discard).map(basicEnergyType).filter(Boolean));
}
function attachedEnergy(pokemon, pattern) {
  return list(pokemon?.energies).filter(value => pattern.test(printingValue(value))).length;
}
function attachedBasicEnergyTypes(player) {
  const types = new Set();
  for (const pokemon of boardSlots(player)) {
    for (const energy of list(pokemon.energies)) {
      const type = basicEnergyType(energy);
      if (type) types.add(type);
    }
  }
  return types;
}
function attachedBasicEnergyCount(player) {
  let count = 0;
  for (const pokemon of boardSlots(player)) {
    count += list(pokemon.energies).filter(isBasicEnergy).length;
  }
  return count;
}
function nonActiveBasicEnergyCount(player) {
  const active = player?.active;
  return boardSlots(player).filter(pokemon => pokemon !== active)
    .reduce((sum, pokemon) => sum + list(pokemon.energies).filter(isBasicEnergy).length, 0);
}
function ancientPokemon(pokemon) {
  return matches(pokemon, PRINT.ragingBolt) ||
    matches(pokemon, PRINT.sandyShocks) ||
    matches(pokemon, PRINT.flutterMane);
}
function ancientBoardCount(player) {
  return boardSlots(player).filter(ancientPokemon).length;
}
function abilityLive(pokemon, name) {
  if (!pokemon) return false;
  const suppression = list(pokemon.abilitySuppressions).find(row => row.abilityName === name);
  return suppression?.suppressed === false;
}
function currentStadium(observation) {
  return [...stadiums(observation?.ownPublic), ...stadiums(observation?.opponentPublic)];
}
function hasAnyStadium(observation) {
  return currentStadium(observation).length > 0;
}
function hasHostileStadium(observation) {
  return currentStadium(observation).some(value =>
    /Temple of Sinnoh|Path to the Peak|Silent Lab/i.test(value));
}
function activePokemon(observation) {
  return observation?.ownPublic?.active ?? null;
}
function opponentActive(observation) {
  return observation?.opponentPublic?.active ?? null;
}
function hasDdeOnAdp(observation) {
  const adp = boardSlots(observation?.ownPublic).find(pokemon => matches(pokemon, PRINT.adp));
  return attachedEnergy(adp, PRINT.doubleDragon) > 0;
}
function ownFreeRetreat(observation) {
  const latias = boardSlots(observation?.ownPublic).find(pokemon => matches(pokemon, PRINT.latias));
  return Boolean(latias && abilityLive(latias, 'Skyliner'));
}
function remainingHp(pokemon) {
  if (!pokemon || !Number.isFinite(pokemon.hp) || !Number.isFinite(pokemon.damage)) return -1;
  return pokemon.hp - pokemon.damage;
}
function actionPrinting(item) {
  return item?.actorPrinting ?? item?.targetPrinting ?? metadata(item).sourcePrinting ?? item?.label ?? '';
}
function sourceContext(prompt) {
  return [
    prompt?.source?.effectName, prompt?.source?.sourcePrinting,
    prompt?.source?.sourceAttack, prompt?.publicMetadata?.sourceEffect,
    prompt?.publicMetadata?.sourcePrinting
  ].filter(Boolean).join(' ').toLowerCase();
}
function priorOpponentTurnKo(request) {
  return request?.publicEventReceipt?.priorOpponentTurnKO?.any === true;
}
function opponentHasVisibleAbility(observation) {
  const active = opponentActive(observation);
  if (!active) return false;
  const abilities = list(active.abilities);
  return abilities.some(name => abilityLive(active, name));
}
function opponentHasAttachedEnergy(observation) {
  return boardSlots(observation?.opponentPublic).some(pokemon => list(pokemon.energies).length > 0);
}
function opponentHasToolsOrStadium(observation) {
  const relevantTool = boardSlots(observation?.opponentPublic).some(pokemon =>
    list(pokemon.tools).some(tool => /Stealthy Hood|Forest Seal Stone|Float Stone/i.test(printingValue(tool))));
  const relevantStadium = currentStadium(observation).some(value =>
    /Temple of Sinnoh|Path to the Peak|Silent Lab/i.test(value));
  return relevantTool || relevantStadium;
}
function targetPrizeCount(pokemon) {
  const subtypes = list(pokemon?.printed?.subtypes);
  if (subtypes.includes('TAG TEAM')) return 3;
  if (subtypes.includes('VMAX') || subtypes.includes('VSTAR')) return 3;
  if (subtypes.includes('ex') || subtypes.includes('EX') || subtypes.includes('GX') || subtypes.includes('V')) return 2;
  return 1;
}
function targetPriority(pokemon, observation) {
  if (!pokemon) return 0;
  const active = activePokemon(observation);
  const activeIsRagingBolt = matches(active, PRINT.ragingBolt);
  const hp = remainingHp(pokemon);
  let score = 70 + targetPrizeCount(pokemon) * 24;
  if (hp > 0 && hp <= 100) score += 80;
  else if (hp > 0 && hp <= 170) score += 35;
  if (matches(pokemon, PRINT.sudowoodo)) score += 25;
  if (matches(pokemon, PRINT.tapuLele) || matches(pokemon, PRINT.crobat) ||
      matches(pokemon, PRINT.dedenne) || matches(pokemon, PRINT.squawk)) score += 25;
  if (matches(pokemon, /^Mimikyu GRI 58\b/i) && activeIsRagingBolt) score -= 100;
  return score;
}
function ownSwitchPriority(pokemon, observation) {
  if (!pokemon) return 0;
  if (matches(pokemon, PRINT.ragingBolt)) {
    const energies = list(pokemon.energies);
    const hasDde = energies.some(value => PRINT.doubleDragon.test(printingValue(value)));
    const types = energies.map(basicEnergyType).filter(Boolean);
    const hasLightning = types.includes('lightning');
    const hasFighting = types.includes('fighting');
    return hasDde || (hasLightning && hasFighting) ? 240 : 170;
  }
  if (matches(pokemon, PRINT.adp)) return attachedEnergy(pokemon, PRINT.doubleDragon) > 0 ? 225 : 130;
  if (matches(pokemon, PRINT.sandyShocks)) {
    return list(pokemon.energies).filter(value => basicEnergyType(value) === 'fighting').length >= 2 ? 160 : 110;
  }
  if (matches(pokemon, PRINT.moltres)) {
    return list(pokemon.energies).filter(value => basicEnergyType(value) === 'darkness').length >= 2 ? 150 : 100;
  }
  if (matches(pokemon, PRINT.flutterMane) && opponentHasVisibleAbility(observation)) return 215;
  if (matches(pokemon, PRINT.latias)) return 65;
  return 30 + Math.max(0, 200 - remainingHp(pokemon)) / 20;
}
function choicePokemon(choice, observation) {
  const meta = metadata(choice);
  const player = meta.ownerSeat === 'opponent' ? observation?.opponentPublic : observation?.ownPublic;
  const printing = printingValue(choice);
  if (!player) return null;
  return boardSlots(player).find(pokemon => printingValue(pokemon) === printing) ??
    boardSlots(player).find(pokemon => printing && printingValue(pokemon).startsWith(printing));
}
function rankChoices(choices, score, limit) {
  return list(choices).map((choice, index) => ({ choice, index, score: score(choice) }))
    .filter(row => row.score > 0 && typeof row.choice?.token === 'string' &&
      row.choice.kind !== 'cancel' && row.choice.kind !== 'empty-selection')
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, Number.isSafeInteger(limit) ? limit : list(choices).length);
}
function selectOne(choices, score, reasonCode) {
  const best = rankChoices(choices, score, 1)[0];
  return best ? { kind: 'select-choice', token: best.choice.token } : { kind: 'abstain', reasonCode };
}
function promptBounds(prompt) {
  const meta = prompt?.publicMetadata ?? {};
  if (meta.selectionType === 'energy-payment') {
    const maximumCount = meta.energyCount ?? meta.count;
    return Number.isSafeInteger(maximumCount) ? { minimumCount: 1, maximumCount } : null;
  }
  if (meta.selectionType === 'card-combination' || meta.selectionType === 'pokemon') {
    if (Number.isSafeInteger(meta.minimumCount) && Number.isSafeInteger(meta.maximumCount)) {
      return { minimumCount: meta.minimumCount, maximumCount: meta.maximumCount };
    }
  }
  if (meta.selectionType === 'prize-slots' && Number.isSafeInteger(meta.requiredCount)) {
    return { minimumCount: meta.requiredCount, maximumCount: meta.requiredCount };
  }
  if (meta.selectionType === 'card-order' && Number.isSafeInteger(meta.count)) {
    return { minimumCount: meta.count, maximumCount: meta.count };
  }
  return null;
}
function selectMany(prompt, score, reasonCode, limitOverride) {
  const bounds = promptBounds(prompt);
  if (!bounds) return { kind: 'abstain', reasonCode: 'BAD_CARD_SELECTION_BOUNDS' };
  const limit = Math.min(bounds.maximumCount, Number.isSafeInteger(limitOverride) ? limitOverride : bounds.maximumCount);
  const selected = rankChoices(prompt.choices, score, limit).map(row => row.choice.token);
  if (selected.length < bounds.minimumCount) {
    if (bounds.minimumCount === 0) {
      const empty = list(prompt.choices).find(choice => choice.kind === 'empty-selection');
      return empty ? { kind: 'select-choice', token: empty.token } : { kind: 'abstain', reasonCode };
    }
    return { kind: 'abstain', reasonCode };
  }
  if (selected.length === 0) {
    const empty = list(prompt.choices).find(choice => choice.kind === 'empty-selection');
    return empty ? { kind: 'select-choice', token: empty.token } : { kind: 'abstain', reasonCode };
  }
  return { kind: 'select-choices', tokens: selected };
}
function supporterPriority(choice, request) {
  const value = printingValue(choice);
  const observation = request.observation;
  const own = observation.ownPublic;
  const hand = handSize(observation);
  if (PRINT.sada.test(value)) {
    return discardEnergyTypes(own).size > 0 && ancientBoardCount(own) > 0 ? 250 : 0;
  }
  if (PRINT.carmine.test(value)) return observation.globalTurn === 1 && hand <= 5 ? 220 : 40;
  if (PRINT.raihan.test(value)) return priorOpponentTurnKo(request) && discardEnergyTypes(own).size > 0 ? 235 : 0;
  if (PRINT.guzma.test(value)) return benchCount(observation.opponentPublic) > 0 && benchCount(own) > 0 ? 200 : 0;
  if (PRINT.iono.test(value)) {
    return hand <= 3 || observation.opponentPublic.handCount >= hand + 3 ? 165 : 45;
  }
  if (PRINT.arven.test(value)) {
    return !handHas(observation, PRINT.floatStone) || !handHas(observation, PRINT.forestSealStone) ? 135 : 50;
  }
  return 25;
}
function searchTargetPriority(choice, request, context) {
  const value = printingValue(choice);
  const observation = request.observation;
  const own = observation.ownPublic;
  const hand = handSize(observation);
  const inPlay = pattern => boardHas(own, pattern);
  if (context.includes('cherish ball')) {
    if (PRINT.adp.test(value) && !inPlay(PRINT.adp)) return 240;
    if (PRINT.dedenne.test(value) && hand <= 3 && !inPlay(PRINT.dedenne)) return 190;
    if (PRINT.tapuLele.test(value) && !inPlay(PRINT.tapuLele) && !hasSupporterInHand(observation)) return 180;
    return 0;
  }
  if (context.includes('wonder tag')) return supporterPriority(choice, request);
  if (context.includes('arven')) {
    const hasV = boardSlots(own).some(pokemon => matches(pokemon, PRINT.crobat) || matches(pokemon, PRINT.moltres));
    if (PRINT.forestSealStone.test(value) && hasV &&
        observation.ownPublic.publicTurnRestrictions?.vstarUsed === false) return 240;
    if (PRINT.floatStone.test(value) && !ownFreeRetreat(observation)) return 220;
    if (PRINT.quickBall.test(value) && (!boardHas(own, PRINT.ragingBolt) || !boardHas(own, PRINT.adp))) return 120;
    if (PRINT.compressor.test(value) && discardEnergyTypes(own).size < 3) return 110;
    if (PRINT.fieldBlower.test(value) && opponentHasToolsOrStadium(observation)) return 100;
    return 0;
  }
  if (context.includes('secret box')) {
    if (SUPPORTER_PATTERNS.some(pattern => pattern.test(value))) return supporterPriority(choice, request);
    if (PRINT.skyField.test(value)) {
      if (currentStadium(observation).some(stadium => /Temple of Sinnoh/i.test(stadium)) &&
          boardHas(own, PRINT.adp) && hasDdeOnAdp(observation)) return 230;
      return benchCount(own) >= 4 && benchCount(observation.opponentPublic) <= 2 ? 140 : 0;
    }
    const hasV = boardSlots(own).some(pokemon => matches(pokemon, PRINT.crobat) || matches(pokemon, PRINT.moltres));
    if (PRINT.forestSealStone.test(value) && hasV &&
        observation.ownPublic.publicTurnRestrictions?.vstarUsed === false) return 210;
    if (PRINT.floatStone.test(value) && !ownFreeRetreat(observation)) return 190;
    if (PRINT.quickBall.test(value) && (!boardHas(own, PRINT.ragingBolt) || !boardHas(own, PRINT.adp))) return 180;
    if (PRINT.compressor.test(value) && discardEnergyTypes(own).size < 3) return 170;
    if (PRINT.vsSeeker.test(value) && list(own.discard).some(card =>
        SUPPORTER_PATTERNS.some(pattern => pattern.test(printingValue(card))))) return 160;
    if (PRINT.nightStretcher.test(value) && list(own.discard).some(card =>
        PRINT.ragingBolt.test(card) || isBasicEnergy(card))) return 150;
    if (PRINT.fieldBlower.test(value) && opponentHasToolsOrStadium(observation)) return 150;
    if (PRINT.cherishBall.test(value) && (!boardHas(own, PRINT.adp) || !boardHas(own, PRINT.dedenne))) return 140;
    return 0;
  }
  if (context.includes('raihan')) {
    if (PRINT.doubleDragon.test(value) && inPlay(PRINT.adp) && !hasDdeOnAdp(observation)) return 250;
    if (PRINT.ragingBolt.test(value) && !inPlay(PRINT.ragingBolt)) return 230;
    if (PRINT.sada.test(value) && discardEnergyTypes(own).size > 0) return 210;
    return supporterPriority(choice, request) / 2;
  }
  if (context.includes('star alchemy')) {
    if (PRINT.ragingBolt.test(value) && !inPlay(PRINT.ragingBolt)) return 250;
    if (PRINT.doubleDragon.test(value) && inPlay(PRINT.adp) && !hasDdeOnAdp(observation)) return 245;
    if (PRINT.sada.test(value) && discardEnergyTypes(own).size > 0) return 225;
    if (PRINT.adp.test(value) && !inPlay(PRINT.adp)) return 210;
    return 40;
  }
  if (context.includes('night stretcher')) {
    if (PRINT.ragingBolt.test(value) && !inPlay(PRINT.ragingBolt)) return 230;
    if (PRINT.hoOh.test(value) && discardEnergyTypes(own).size >= 3) return 0;
    if (PRINT.hoOh.test(value) && discardEnergyTypes(own).size < 3) return 90;
    if (isBasicEnergy(value) && discardEnergyTypes(own).size === 0) return 120;
    return 20;
  }
  if (context.includes('vs seeker')) return supporterPriority(choice, request);
  if (context.includes('hisuian heavy ball')) {
    if (PRINT.adp.test(value) || PRINT.ragingBolt.test(value) || PRINT.tapuKoko.test(value) ||
        PRINT.hoOh.test(value) || PRINT.sandyShocks.test(value)) return 220;
    return 20;
  }
  if (PRINT.ragingBolt.test(value) && !inPlay(PRINT.ragingBolt)) return 240;
  if (PRINT.adp.test(value) && !inPlay(PRINT.adp)) return 225;
  if (PRINT.dedenne.test(value) && hand <= 3 && !inPlay(PRINT.dedenne)) return 180;
  if (PRINT.crobat.test(value) && hand <= 3 && !inPlay(PRINT.crobat)) return 175;
  if (PRINT.squawk.test(value) && observation.globalTurn <= 2 && hand <= 4 && !inPlay(PRINT.squawk)) return 160;
  if (PRINT.tapuLele.test(value) && !hasSupporterInHand(observation) && !inPlay(PRINT.tapuLele)) return 165;
  if (PRINT.latias.test(value) && !inPlay(PRINT.latias)) return 150;
  if (PRINT.tapuKoko.test(value) && discardEnergyTypes(own).has('lightning') && !inPlay(PRINT.tapuKoko)) return 145;
  if (PRINT.sandyShocks.test(value) && observation.opponentPublic.prizeCount <= 4 && !inPlay(PRINT.sandyShocks)) return 140;
  if (PRINT.moltres.test(value) && discardEnergyTypes(own).has('darkness') && !inPlay(PRINT.moltres)) return 135;
  if (PRINT.hoOh.test(value) && discardEnergyTypes(own).size >= 3 && !inPlay(PRINT.hoOh)) return 130;
  return 10;
}
function discardPriority(choice, request, context) {
  const value = printingValue(choice);
  const observation = request.observation;
  const own = observation.ownPublic;
  const energyType = basicEnergyType(value);
  if (PRINT.doubleDragon.test(value)) return 0;
  if (PRINT.hoOh.test(value)) {
    return discardEnergyTypes(own).size >= 3 && !boardHas(own, PRINT.hoOh) ? 155 : 0;
  }
  if (PRINT.adp.test(value) || PRINT.ragingBolt.test(value) || PRINT.tapuKoko.test(value) ||
      PRINT.sandyShocks.test(value) || PRINT.moltres.test(value)) return 0;
  if (SUPPORTER_PATTERNS.some(pattern => pattern.test(value))) {
    const copiesInHand = list(observation.ownHand).filter(card => printingValue(card) === value).length;
    return copiesInHand > 1 ? 90 : 0;
  }
  if (energyType) return discardEnergyTypes(own).has(energyType) ? 80 : 45;
  if (PRINT.floatStone.test(value) && !boardHas(own, PRINT.latias)) return 0;
  if (PRINT.forestSealStone.test(value) && own.publicTurnRestrictions?.vstarUsed === false) return 0;
  if (/Energy/i.test(value)) return 20;
  if (/Battle VIP Pass/i.test(value) && observation.globalTurn <= 2) return 0;
  if (/Quick Ball|Battle Compressor|VS Seeker|Night Stretcher/i.test(value)) return 10;
  if (context.includes('secret box')) return 100;
  return 60;
}
function compressorPriority(choice, request) {
  const value = printingValue(choice);
  const types = discardEnergyTypes(request.observation.ownPublic);
  const type = basicEnergyType(value);
  if (PRINT.doubleDragon.test(value)) return 0;
  if (PRINT.hoOh.test(value) && types.size >= 1 && !discardHas(request.observation.ownPublic, PRINT.hoOh) &&
      !boardHas(request.observation.ownPublic, PRINT.hoOh)) return 230;
  if (type && !types.has(type)) {
    const bonus = type === 'darkness' && !boardHas(request.observation.ownPublic, PRINT.moltres) ? 20 : 0;
    return 200 + bonus;
  }
  if (type) return 0;
  if (PRINT.ragingBolt.test(value) && !boardHas(request.observation.ownPublic, PRINT.ragingBolt)) return 0;
  return 0;
}
function attachTargetPriority(choice, request, context) {
  const pokemon = choicePokemon(choice, request.observation);
  if (!pokemon) return 0;
  const own = request.observation.ownPublic;
  if (context.includes('professor sada')) {
    if (!ancientPokemon(pokemon)) return 0;
    if (matches(pokemon, PRINT.ragingBolt)) {
      return list(pokemon.energies).filter(isBasicEnergy).length < 2 ? 240 : 190;
    }
    if (matches(pokemon, PRINT.sandyShocks)) {
      const hasFighting = list(pokemon.energies).some(value => basicEnergyType(value) === 'fighting');
      return request.observation.opponentPublic.prizeCount <= 4 ? (hasFighting ? 165 : 215) : 140;
    }
    if (matches(pokemon, PRINT.flutterMane)) return 100;
  }
  if (context.includes('dance of the ancients')) {
    if (matches(pokemon, PRINT.ragingBolt)) {
      return list(pokemon.energies).some(value => basicEnergyType(value) === 'lightning') ? 190 : 250;
    }
    if (matches(pokemon, PRINT.adp)) {
      return list(pokemon.energies).some(value => basicEnergyType(value) === 'lightning') ? 170 : 230;
    }
    if (matches(pokemon, PRINT.sandyShocks)) return 150;
  }
  if (context.includes('ultimate ray')) {
    if (matches(pokemon, PRINT.ragingBolt)) return list(pokemon.energies).filter(isBasicEnergy).length < 2 ? 250 : 180;
    if (matches(pokemon, PRINT.sandyShocks)) {
      return list(pokemon.energies).some(value => basicEnergyType(value) === 'fighting') ? 170 : 220;
    }
    if (matches(pokemon, PRINT.moltres)) {
      return list(pokemon.energies).some(value => basicEnergyType(value) === 'darkness') ? 150 : 190;
    }
    if (matches(pokemon, PRINT.adp)) return 100;
  }
  return 0;
}
function prizeTargetPriority(choice, request) {
  const value = typeof choice.printing === 'string' ? choice.printing :
    (typeof metadata(choice).cardPrinting === 'string' ? metadata(choice).cardPrinting : '');
  if (!value) return 0;
  const own = request.observation.ownPublic;
  if (PRINT.ragingBolt.test(value) && boardCount(own, PRINT.ragingBolt) < 2) return 250;
  if (PRINT.adp.test(value) && !boardHas(own, PRINT.adp)) return 230;
  if (PRINT.latias.test(value) && !boardHas(own, PRINT.latias)) return 210;
  if (PRINT.tapuLele.test(value) && !hasSupporterInHand(request.observation)) return 185;
  if ((PRINT.dedenne.test(value) || PRINT.crobat.test(value)) && handSize(request.observation) <= 3) return 170;
  if (PRINT.hoOh.test(value) && discardEnergyTypes(own).size >= 3 && !boardHas(own, PRINT.hoOh)) return 160;
  return 0;
}
function bellowingDamageModel(target) {
  if (!target?.printed || !Array.isArray(target.printed.weakness) || !Array.isArray(target.printed.resistance)) return null;
  let multiplier = 1;
  let resistance = 0;
  const weakness = target.printed.weakness.find(row => row.type === 'Dragon');
  const resistanceRow = target.printed.resistance.find(row => row.type === 'Dragon');
  if (weakness) {
    if (String(weakness.value).includes('2')) multiplier = 2;
    else return null;
  }
  if (resistanceRow) {
    const amount = Number(String(resistanceRow.value).replace(/[^\d-]/g, ''));
    if (!Number.isFinite(amount)) return null;
    resistance = Math.abs(amount);
  }
  return { multiplier, resistance };
}
function bellowingEnergyDecision(prompt, request) {
  const choices = list(prompt.choices).filter(choice => choice.kind === 'energy');
  const own = request.observation.ownPublic;
  const active = own.active;
  if (!matches(active, PRINT.ragingBolt)) {
    return { kind: 'abstain', reasonCode: 'UNTRUSTED_ENERGY_SELECTION' };
  }
  if (nonActiveBasicEnergyCount(own) > 0) {
    return { kind: 'abstain', reasonCode: 'UNTRUSTED_ENERGY_SELECTION' };
  }
  const target = opponentActive(request.observation);
  const hp = remainingHp(target);
  const damageModel = bellowingDamageModel(target);
  if (own.publicTurnRestrictions?.gxUsed !== false || opponentHasVisibleAbility(request.observation)) {
    return { kind: 'abstain', reasonCode: 'UNTRUSTED_ENERGY_SELECTION' };
  }
  if (hp <= 0 || damageModel === null) return { kind: 'abstain', reasonCode: 'UNTRUSTED_ENERGY_SELECTION' };
  const required = Math.max(1, Math.ceil((hp + damageModel.resistance) / (70 * damageModel.multiplier)));
  const availableBasic = choices.filter(choice => isBasicEnergy(choice.printing ?? choice.label));
  if (availableBasic.length === 0) return { kind: 'abstain', reasonCode: 'NO_VISIBLE_ENERGY_CHOICE' };
  const bounds = promptBounds(prompt);
  if (!bounds) return { kind: 'abstain', reasonCode: 'ENERGY_COST_EXCEEDS_VISIBLE_CHOICES' };
  const count = Math.min(bounds.maximumCount, required, availableBasic.length);
  const chosen = availableBasic.slice(0, count).map(choice => choice.token);
  if (chosen.length < bounds.minimumCount) return { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ENERGY_PAYMENT' };
  return { kind: 'select-choices', tokens: chosen };
}
function scoreAttack(item, request) {
  const name = item?.attackName ?? metadata(item).sourceAttack ?? item?.label ?? '';
  const observation = request.observation;
  const own = observation.ownPublic;
  const active = own.active;
  const oppActive = observation.opponentPublic.active;
  const meta = metadata(item);
  const damage = [meta.damageAfterResistance, meta.damageAfterWeakness, meta.damage]
    .find(value => Number.isFinite(value));
  const targetHp = Number.isFinite(meta.targetHp) ? meta.targetHp : oppActive?.hp;
  const targetDamage = Number.isFinite(meta.targetDamage) ? meta.targetDamage : oppActive?.damage;
  const lethal = Number.isFinite(damage) && Number.isFinite(targetHp) &&
    Number.isFinite(targetDamage) && damage >= targetHp - targetDamage;

  if (name === 'Altered Creation-GX') {
    return own.publicTurnRestrictions?.gxUsed === false && matches(active, PRINT.adp) &&
      attachedEnergy(active, PRINT.doubleDragon) > 0 ? 250 : 0;
  }
  if (name === 'Ultimate Ray') {
    return matches(active, PRINT.adp) && own.deckCount > 0 &&
      (boardHas(own, PRINT.ragingBolt) || boardHas(own, PRINT.sandyShocks) || boardHas(own, PRINT.moltres)) ? 225 : 160;
  }
  if (name === 'Bellowing Thunder') {
    if (!matches(active, PRINT.ragingBolt) || nonActiveBasicEnergyCount(own) > 0 ||
        own.publicTurnRestrictions?.gxUsed !== false || opponentHasVisibleAbility(observation) ||
        attachedBasicEnergyCount(own) === 0) return 0;
    if (lethal) return 260;
    return 150;
  }
  if (name === 'Burst Roar') return handSize(observation) <= 2 && observation.globalTurn <= 3 ? 125 : 0;
  if (name === 'Earthen Spike') return lethal ? 175 : 90;
  if (name === 'Aura Burn') return lethal ? 170 : 80;
  if (name === 'Rainbow Burn') {
    const damageValue = 20 + 20 * attachedBasicEnergyTypes({ active }).size;
    return Number.isFinite(targetHp) && Number.isFinite(targetDamage) &&
      damageValue >= targetHp - targetDamage ? 165 : 65;
  }
  if (name === 'Motivate') {
    return list(own.discard).some(isBasicEnergy) && benchCount(own) > 0 ? 125 : 0;
  }
  if (name === 'Tapu Cure-GX') {
    return own.publicTurnRestrictions?.gxUsed === false &&
      boardSlots(own).filter(pokemon => pokemon !== active && pokemon.damage > 0).length >= 2 ? 135 : 0;
  }
  if (name === 'Tingly Return-GX') {
    return own.publicTurnRestrictions?.gxUsed === false && !boardHas(own, PRINT.adp) ? 110 : 0;
  }
  if (name === 'Energy Drive') return 70;
  if (name === 'Mach Bolt') return 75;
  if (name === 'Hex Hurl') return 75;
  if (name === 'Static Shock') return 45;
  return 0;
}
function scoreAction(item, request) {
  const observation = request.observation;
  const own = observation.ownPublic;
  const opponent = observation.opponentPublic;
  const printing = actionPrinting(item);
  const hand = handSize(observation);
  const turn = Number(observation.globalTurn ?? 0);
  const meta = metadata(item);
  const active = own.active;
  const opponentPrizes = Number(opponent.prizeCount ?? 6);

  if (item.kind === 'attack') return scoreAttack(item, request);
  if (item.kind === 'pass') return 0;

  if (item.kind === 'retreat') {
    if (ownFreeRetreat(observation)) {
      if (matches(active, PRINT.dedenne) || matches(active, PRINT.crobat) ||
          matches(active, PRINT.tapuLele) || matches(active, PRINT.flutterMane)) {
        return boardSlots(own).filter(pokemon => pokemon !== active)
          .reduce((best, pokemon) => Math.max(best, ownSwitchPriority(pokemon, observation)), 0);
      }
    }
    if ((matches(active, PRINT.dedenne) || matches(active, PRINT.crobat) ||
        matches(active, PRINT.tapuLele) || matches(active, PRINT.squawk)) &&
        boardSlots(own).some(pokemon => matches(pokemon, PRINT.ragingBolt) || matches(pokemon, PRINT.adp))) return 105;
    return 0;
  }

  if (item.kind === 'use-ability') {
    const effect = String(meta.sourceEffect ?? meta.abilityName ?? item.label ?? '').toLowerCase();
    if (effect.includes('rebirth')) return discardEnergyTypes(own).size >= 3 && hasBenchSpace(own) ? 235 : 0;
    if (effect.includes('star alchemy')) return own.publicTurnRestrictions?.vstarUsed === false ? 215 : 0;
    if (effect.includes('dance of the ancients')) return discardEnergyTypes(own).has('lightning') &&
      benchCount(own) >= 2 ? 220 : 0;
    if (effect.includes('direflame wings')) return discardEnergyTypes(own).has('darkness') ? 205 : 0;
    if (effect.includes('magnetic absorption')) return opponentPrizes <= 4 &&
      discardEnergyTypes(own).has('fighting') ? 200 : 0;
    if (effect.includes('dedechange')) return hand <= 3 && !hasSupporterInHand(observation) ? 170 : 0;
    if (effect.includes('dark asset')) return hand <= 4 ? 180 : 0;
    if (effect.includes('squawk and seize')) return turn <= 2 && hand <= 4 && !hasSupporterInHand(observation) ? 165 : 0;
    if (effect.includes('wonder tag')) return !hasSupporterInHand(observation) ? 190 : 0;
    if (effect.includes('resetting hole')) return hasHostileStadium(observation) ? 135 : 0;
    return 0;
  }

  if (item.kind === 'use-stadium') {
    if (PRINT.skyField.test(printing)) {
      const temple = currentStadium(observation).some(value => /Temple of Sinnoh/i.test(value));
      if (temple && boardHas(own, PRINT.adp) && hasDdeOnAdp(observation)) return 250;
      return benchCount(own) >= 4 && benchCount(opponent) <= 2 ? 175 : 0;
    }
    return 0;
  }

  if (item.kind !== 'play-card') return 0;

  if (PRINT.vipPass.test(printing)) return turn <= 2 && hasBenchSpace(own) ? 230 : 0;
  if (PRINT.ragingBolt.test(printing)) {
    const count = boardCount(own, PRINT.ragingBolt);
    return count < 2 && hasBenchSpace(own) ? (count === 0 ? 220 : 145) : 0;
  }
  if (PRINT.adp.test(printing)) return !boardHas(own, PRINT.adp) && hasBenchSpace(own) ? 205 : 0;
  if (PRINT.sada.test(printing)) return discardEnergyTypes(own).size > 0 && ancientBoardCount(own) > 0 ? 250 : 0;
  if (PRINT.carmine.test(printing)) return turn <= 2 && hand <= 5 ? 225 : 0;
  if (PRINT.raihan.test(printing)) return priorOpponentTurnKo(request) && discardEnergyTypes(own).size > 0 ? 235 : 0;
  if (PRINT.guzma.test(printing)) return benchCount(opponent) > 0 && benchCount(own) > 0 ? 200 : 0;
  if (PRINT.iono.test(printing)) return hand <= 3 || opponent.handCount >= hand + 3 ? 165 : 0;
  if (PRINT.arven.test(printing)) {
    const hasV = boardSlots(own).some(pokemon => matches(pokemon, PRINT.crobat) || matches(pokemon, PRINT.moltres));
    const wantsTool = (!ownFreeRetreat(observation) && !handHas(observation, PRINT.floatStone)) ||
      (hasV && own.publicTurnRestrictions?.vstarUsed === false && !handHas(observation, PRINT.forestSealStone));
    const wantsItem = (!boardHas(own, PRINT.ragingBolt) || !boardHas(own, PRINT.adp)) ||
      (discardEnergyTypes(own).size < 3 && !handHas(observation, PRINT.compressor)) ||
      (opponentHasToolsOrStadium(observation) && !handHas(observation, PRINT.fieldBlower));
    return wantsTool && wantsItem ? 145 : (wantsTool || wantsItem ? 85 : 0);
  }
  if (PRINT.quickBall.test(printing)) return !boardHas(own, PRINT.ragingBolt) || !boardHas(own, PRINT.adp) ? 190 : 95;
  if (PRINT.compressor.test(printing)) {
    const hasHoOhVisible = boardHas(own, PRINT.hoOh) || discardHas(own, PRINT.hoOh) ||
      handHas(observation, PRINT.hoOh);
    return discardEnergyTypes(own).size < 3 ? 190 : (hasHoOhVisible ? 0 : 80);
  }
  if (PRINT.vsSeeker.test(printing)) return list(own.discard).some(card => SUPPORTER_PATTERNS.some(pattern => pattern.test(printingValue(card)))) ? 130 : 0;
  if (PRINT.nightStretcher.test(printing)) return list(own.discard).some(card =>
    PRINT.ragingBolt.test(card) || PRINT.hoOh.test(card) || isBasicEnergy(card)) ? 125 : 0;
  if (PRINT.hammer.test(printing)) return turn === 2 && opponentHasAttachedEnergy(observation) ? 150 : 0;
  if (PRINT.fieldBlower.test(printing)) return opponentHasToolsOrStadium(request.observation) ? 135 : 0;
  if (PRINT.cherishBall.test(printing)) return !boardHas(own, PRINT.adp) || !boardHas(own, PRINT.dedenne) ? 150 : 0;
  if (PRINT.heavyBall.test(printing)) return 0; // The current prize projector hides identities; fail closed.
  if (PRINT.secretBox.test(printing)) return hand >= 4 ? 130 : 0;
  if (PRINT.floatStone.test(printing)) return !ownFreeRetreat(observation) &&
    active && Number.isFinite(active.printed?.retreatCost?.length) && active.printed.retreatCost.length > 0 ? 100 : 0;
  if (PRINT.forestSealStone.test(printing)) return own.publicTurnRestrictions?.vstarUsed === false &&
    boardSlots(own).some(pokemon => matches(pokemon, PRINT.crobat) || matches(pokemon, PRINT.moltres)) ? 145 : 0;
  if (PRINT.skyField.test(printing)) {
    const temple = currentStadium(observation).some(value => /Temple of Sinnoh/i.test(value));
    if (temple && boardHas(own, PRINT.adp)) return 250;
    return benchCount(own) >= 4 && benchCount(opponent) < 5 ? 175 : 0;
  }
  if (PRINT.sandyShocks.test(printing)) return !boardHas(own, PRINT.sandyShocks) &&
    opponentPrizes <= 4 && hasBenchSpace(own) ? 155 : 0;
  if (PRINT.moltres.test(printing)) return !boardHas(own, PRINT.moltres) &&
    discardEnergyTypes(own).has('darkness') && hasBenchSpace(own) ? 150 : 0;
  if (PRINT.hoOh.test(printing)) return 0; // Rebirth requires Ho-Oh in the discard, not played from hand.
  if (PRINT.tapuKoko.test(printing)) return !boardHas(own, PRINT.tapuKoko) &&
    discardEnergyTypes(own).has('lightning') && benchCount(own) >= 2 ? 165 : 0;
  if (PRINT.latias.test(printing)) return !boardHas(own, PRINT.latias) && hasBenchSpace(own) ? 145 : 0;
  if (PRINT.flutterMane.test(printing)) return !boardHas(own, PRINT.flutterMane) &&
    handHas(observation, PRINT.sada) && hasBenchSpace(own) ? 100 : 0;
  if (PRINT.sudowoodo.test(printing)) return !boardHas(own, PRINT.sudowoodo) &&
    benchCount(opponent) >= 5 && hasBenchSpace(own) ? 160 : 0;
  if (PRINT.marshadow.test(printing)) return !boardHas(own, PRINT.marshadow) &&
    hasHostileStadium(observation) && hasBenchSpace(own) ? 135 : 0;
  if (PRINT.dedenne.test(printing)) return !boardHas(own, PRINT.dedenne) && hand <= 3 &&
    !hasSupporterInHand(observation) && hasBenchSpace(own) ? 150 : 0;
  if (PRINT.crobat.test(printing)) return !boardHas(own, PRINT.crobat) && hand <= 4 && hasBenchSpace(own) ? 155 : 0;
  if (PRINT.squawk.test(printing)) return !boardHas(own, PRINT.squawk) && turn <= 2 && hand <= 4 &&
    !hasSupporterInHand(observation) && hasBenchSpace(own) ? 145 : 0;
  if (PRINT.tapuLele.test(printing)) return !boardHas(own, PRINT.tapuLele) && !hasSupporterInHand(observation) && hasBenchSpace(own) ? 160 : 0;

  if (PRINT.doubleDragon.test(printing)) {
    const target = meta.targetPrinting ?? '';
    const targetPokemon = boardSlots(own).find(pokemon => printingValue(pokemon) === target);
    if (PRINT.adp.test(target) && attachedEnergy(targetPokemon, PRINT.doubleDragon) === 0) return 240;
    if (PRINT.ragingBolt.test(target)) return 170;
    return 80;
  }
  const energyType = basicEnergyType(printing);
  if (energyType) {
    const target = meta.targetPrinting ?? '';
    if (PRINT.ragingBolt.test(target) && (energyType === 'lightning' || energyType === 'fighting')) return 180;
    if (PRINT.sandyShocks.test(target) && energyType === 'fighting' && opponentPrizes <= 4) return 155;
    if (PRINT.moltres.test(target) && energyType === 'darkness') return 150;
    if (PRINT.adp.test(target) && energyType === 'lightning' && hasDdeOnAdp(observation)) return 135;
    return 70;
  }
  return 0;
}
function promptDecision(request) {
  const prompt = request?.prompt;
  if (!prompt) return { kind: 'abstain', reasonCode: 'UNTRUSTED_PROMPT' };
  const context = sourceContext(prompt);
  const lower = context.toLowerCase();
  const meta = prompt.publicMetadata ?? {};
  const choices = list(prompt.choices);
  const observation = request.observation;
  const own = observation.ownPublic;

  if (prompt.promptType === 'ChooseEnergyPrompt') {
    if (lower.includes('bellowing thunder')) return bellowingEnergyDecision(prompt, request);
    if (lower.includes('wait and see hammer')) {
      return selectMany(prompt, choice => {
        if (metadata(choice).ownerSeat !== 'opponent') return 0;
        const value = printingValue(choice);
        if (PRINT.doubleDragon.test(value)) return 250;
        if (/Special Energy/i.test(value)) return 180;
        return isBasicEnergy(value) ? 100 : 60;
      }, 'NO_OPPONENT_ENERGY_TARGET', 1);
    }
    if (lower.includes('rebirth')) {
      const byType = new Set();
      const selected = rankChoices(prompt.choices, choice => {
        const type = basicEnergyType(choice.printing ?? choice.label);
        if (!type || byType.has(type)) return 0;
        byType.add(type);
        return 100;
      }, 3).map(row => row.choice.token);
      return selected.length === 3
        ? { kind: 'select-choices', tokens: selected }
        : { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ENERGY_PAYMENT' };
    }
    if (lower.includes('professor sada')) {
      return selectMany(prompt, choice => {
        const type = basicEnergyType(choice.printing ?? choice.label);
        if (!type) return 0;
        if (type === 'lightning' || type === 'fighting') return 120;
        return 80;
      }, 'NO_SADA_BASIC_ENERGY', 2);
    }
    if (lower.includes('dance of the ancients')) {
      return selectMany(prompt, choice =>
        basicEnergyType(choice.printing ?? choice.label) === 'lightning' ? 200 : 0,
      'NO_TAPU_KOKO_LIGHTNING', 2);
    }
    if (lower.includes('ultimate ray')) {
      const usedTypes = new Set();
      return selectMany(prompt, choice => {
        const type = basicEnergyType(choice.printing ?? choice.label);
        if (!type) return 0;
        if (!usedTypes.has(type)) {
          usedTypes.add(type);
          return 150;
        }
        return 45;
      }, 'NO_ULTIMATE_RAY_BASIC_ENERGY', 3);
    }
    return { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ENERGY_PAYMENT' };
  }

  if (prompt.promptType === 'ChoosePokemonPrompt') {
    if (lower.includes('guzma')) {
      const owner = choices.some(choice => metadata(choice).ownerSeat === 'opponent') ? 'opponent' : 'actor';
      if (owner === 'opponent') {
        return selectMany(prompt, choice => metadata(choice).ownerSeat === 'opponent'
          ? targetPriority(choicePokemon(choice, observation), observation) : 0, 'NO_GUZMA_OPPONENT_TARGET', 1);
      }
      return selectMany(prompt, choice => metadata(choice).ownerSeat === 'actor'
        ? ownSwitchPriority(choicePokemon(choice, observation), observation) : 0, 'NO_GUZMA_OWN_SWITCH_TARGET', 1);
    }
    if (lower.includes('professor sada')) {
      return selectMany(prompt, choice => metadata(choice).ownerSeat === 'actor' &&
        attachTargetPriority(choice, request, lower), 'NO_SADA_ANCIENT_TARGETS');
    }
    if (lower.includes('dance of the ancients')) {
      return selectMany(prompt, choice => metadata(choice).ownerSeat === 'actor' &&
        attachTargetPriority(choice, request, lower), 'NO_TAPU_KOKO_TARGETS');
    }
    if (lower.includes('ultimate ray')) {
      return selectMany(prompt, choice => metadata(choice).ownerSeat === 'actor' &&
        attachTargetPriority(choice, request, lower), 'NO_ULTIMATE_RAY_TARGETS');
    }
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_POKEMON_PROMPT' };
  }

  if (prompt.promptType === 'ChooseEnergyPrompt') {
    return { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ENERGY_PAYMENT' };
  }

  if (prompt.promptType === 'ChooseCardsPrompt') {
    if (lower.includes('battle compressor')) {
      return selectMany(prompt, choice => compressorPriority(choice, request), 'NO_COMPRESSOR_SETUP_TARGETS');
    }
    if (lower.includes('quick ball') && (meta.sourceZone === 'hand' || /discard/i.test(lower))) {
      return selectMany(prompt, choice => discardPriority(choice, request, lower), 'NO_SAFE_QUICK_BALL_DISCARD', 1);
    }
    if (lower.includes('secret box') && (meta.sourceZone === 'hand' || /discard/i.test(lower))) {
      return selectMany(prompt, choice => discardPriority(choice, request, lower), 'NO_SAFE_SECRET_BOX_DISCARDS');
    }
    if (lower.includes('vs seeker')) {
      return selectMany(prompt, choice => supporterPriority(choice, request), 'NO_VS_SEEKER_SUPPORTER', 1);
    }
    if (lower.includes('night stretcher')) {
      return selectMany(prompt, choice => searchTargetPriority(choice, request, lower), 'NO_NIGHT_STRETCHER_TARGET', 1);
    }
    if (lower.includes('hisuian heavy ball')) {
      return selectMany(prompt, choice => searchTargetPriority(choice, request, lower), 'NO_KNOWN_HEAVY_BALL_TARGET', 1);
    }
    if (lower.includes('cherish ball') || lower.includes('wonder tag') ||
        lower.includes('star alchemy') || lower.includes('raihan') || lower.includes('arven')) {
      return selectMany(prompt, choice => searchTargetPriority(choice, request, lower), 'NO_SEARCH_TARGET', 1);
    }
    if (lower.includes('secret box') && meta.sourceZone === 'deck') {
      return selectMany(prompt, choice => searchTargetPriority(choice, request, lower), 'NO_SECRET_BOX_SEARCH_TARGET', 1);
    }
    if (lower.includes('quick ball') || lower.includes('battle vip pass') ||
        lower.includes('search')) {
      return selectMany(prompt, choice => searchTargetPriority(choice, request, lower), 'NO_SEARCH_TARGET');
    }
    if (lower.includes('field blower')) {
      return selectMany(prompt, choice => {
        const value = printingValue(choice);
        const ownerSeat = metadata(choice).ownerSeat;
        if (/Sky Field|Dimension Valley|Temple of Sinnoh|Path to the Peak|Silent Lab/i.test(value) &&
            hasHostileStadium(request.observation)) return 180;
        if (ownerSeat === 'opponent' && /Stealthy Hood|Float Stone|Forest Seal Stone/i.test(value)) return 170;
        return 0;
      }, 'NO_FIELD_BLOWER_TARGET');
    }
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_CARD_COMBINATION_SOURCE' };
  }

  if (prompt.promptType === 'ChooseAttackPrompt') {
    return selectOne(choices, choice => {
      const name = metadata(choice).sourceAttack ?? choice.label ?? '';
      if (name === 'Altered Creation-GX') return own.publicTurnRestrictions?.gxUsed === false ? 250 : 0;
      if (name === 'Ultimate Ray') return 220;
      if (name === 'Bellowing Thunder') return 210;
      if (name === 'Earthen Spike') return 150;
      if (name === 'Aura Burn') return 140;
      return 30;
    }, 'NO_SUPPORTED_ATTACK_CHOICE');
  }

  if (prompt.promptType === 'ChoosePrizePrompt') {
    if (!lower.includes('hisuian heavy ball')) {
      return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PRIZE_SELECTION' };
    }
    return selectMany(prompt, choice => prizeTargetPriority(choice, request),
      'NO_VISIBLE_PRIZE_SLOT');
  }

  if (prompt.promptType === 'ConfirmPrompt') {
    const yes = choices.find(choice => /^(yes|true|confirm)$/i.test(choice.label ?? ''));
    const no = choices.find(choice => /^(no|false|decline|cancel)$/i.test(choice.label ?? ''));
    if (yes && (lower.includes('rebirth') && discardEnergyTypes(own).size >= 3)) {
      return { kind: 'select-choice', token: yes.token };
    }
    if (yes && (lower.includes('direflame wings') && discardEnergyTypes(own).has('darkness'))) {
      return { kind: 'select-choice', token: yes.token };
    }
    if (yes && (lower.includes('magnetic absorption') && observation.opponentPublic.prizeCount <= 4 &&
      discardEnergyTypes(own).has('fighting'))) {
      return { kind: 'select-choice', token: yes.token };
    }
    if (yes && (lower.includes('dedechange') || lower.includes('dark asset') ||
      lower.includes('squawk and seize') || lower.includes('wonder tag'))) {
      return { kind: 'select-choice', token: yes.token };
    }
    if (no) return { kind: 'select-choice', token: no.token };
    return { kind: 'abstain', reasonCode: 'UNRECOGNIZED_SIMPLE_PROMPT' };
  }

  if (prompt.promptType === 'SelectPrompt' || prompt.promptType === 'SelectOptionPrompt') {
    return { kind: 'abstain', reasonCode: 'UNRECOGNIZED_SIMPLE_PROMPT' };
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
  const configKeys = config && typeof config === 'object' && !Array.isArray(config)
    ? Object.keys(config) : null;
  if (role !== 'opponent' || (seat !== 0 && seat !== 1) ||
      policyVersion !== POLICY_VERSION || configKeys === null || configKeys.length !== 0) {
    throw new Error('AGENT23_RANK19_POLICY_INIT_MISMATCH');
  }
  return Object.freeze({
    decide(request) {
      if (!request || request.role !== 'opponent' || request.seat !== seat ||
          request.observation?.actorSeat !== seat) {
        return { kind: 'abstain', reasonCode: 'ROLE_SEAT_BINDING_MISMATCH' };
      }
      if (request.prompt) return promptDecision(request);
      return bestAction(request);
    }
  });
}

module.exports = {
  POLICY_VERSION, SOURCE_RANK, SOURCE_LIST_BLOB_SHA1, SOURCE_FINGERPRINT_SHA256,
  ENGINE_PIN, WORKER_PROTOCOL_BLOB_SHA1, createPolicy, scoreAction, scoreAttack,
  promptDecision, bestAction, basicEnergyType, discardEnergyTypes,
  bellowingDamageModel
};
