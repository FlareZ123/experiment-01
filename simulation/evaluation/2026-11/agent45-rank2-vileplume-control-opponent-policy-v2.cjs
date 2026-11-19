'use strict';

/*
 * Aichi rank-2 Vileplume Control opponent-role policy.
 *
 * Deterministic, actor-view-only prototype for the authenticated rank-2
 * source-list reconstruction. It consumes only the detached actor
 * observation, public event receipt, legal native action frontier, and
 * actor-visible prompt choices. The native Store remains the legality
 * authority. This is not a competitive-strength certificate.
 */

const POLICY_VERSION = 'agent45-rank2-vileplume-control-opponent-v2';

const PRINT = Object.freeze({
  oddish: /^Oddish UNB(?: \d+)?\b/i,
  gloom: /^Gloom UNB(?: \d+)?\b/i,
  vileplume: /^Vileplume AOR(?: \d+)?\b/i,
  vileplumeGx: /^Vileplume-GX CEC(?: \d+)?\b/i,
  lillipup: /^Lillipup CEC(?: \d+)?\b/i,
  herdier: /^Herdier SUM(?: \d+)?\b/i,
  stoutland: /^Stoutland BCR(?: \d+)?\b/i,
  pidgey: /^Pidgey MEW(?: \d+)?\b/i,
  pidgeotto: /^Pidgeotto TEU(?: \d+)?\b/i,
  pidgeot: /^Pidgeot ex OBF(?: \d+)?\b/i,
  bunnelby: /^Bunnelby PRC(?: \d+)?\b/i,
  fanRotom: /^Fan Rotom SCR(?: \d+)?\b/i,
  relicanth: /^Relicanth TEF(?: \d+)?\b/i,
  mrMime: /^Mr\. Mime PLF(?: \d+)?\b/i,
  girafarig: /^Girafarig LOT(?: \d+)?\b/i,
  budew: /^Budew ASC(?: \d+)?\b/i,
  jirachi: /^Jirachi XYP(?: \d+)?\b/i,
  tagCall: /^Tag Call CEC(?: \d+)?\b/i,
  guzmaHala: /^Guzma & Hala CEC(?: \d+)?\b/i,
  tmEvolution: /^Technical Machine: Evolution PAR(?: \d+)?\b/i,
  grandTree: /^Grand Tree SCR(?: \d+)?\b/i,
  artazon: /^Artazon PAL(?: \d+)?\b/i,
  jetEnergy: /^Jet Energy PAL(?: \d+)?\b/i,
  captureEnergy: /^Capture Energy RCL(?: \d+)?\b/i,
  memoryEnergy: /^Memory Energy LOT(?: \d+)?\b/i,
  stealthyHood: /^Stealthy Hood UNB(?: \d+)?\b/i,
  grassEnergy: /^Grass Energy MEE(?: \d+)?\b/i,
  guzma: /^Guzma BUS(?: \d+)?\b/i,
  cassius: /^Cassius XY(?: \d+)?\b/i,
  karen: /^Karen XYP(?: \d+)?\b/i,
  plumeria: /^Plumeria BUS(?: \d+)?\b/i,
  gladion: /^Gladion CIN(?: \d+)?\b/i,
  faba: /^Faba LOT(?: \d+)?\b/i,
  lusamine: /^Lusamine CIN(?: \d+)?\b/i,
  bellelba: /^Bellelba & Brycen-Man CEC(?: \d+)?\b/i,
  peonia: /^Peonia CRE(?: \d+)?\b/i,
  teamYell: /^Team Yell's Cheer BRS(?: \d+)?\b/i,
  counterGain: /^Counter Gain SSP(?: \d+)?\b/i
});

const EXECUTABLE = new Set([
  'play-card', 'attack', 'retreat', 'use-ability', 'use-stadium', 'pass'
]);

function list(value) {
  return Array.isArray(value) ? value : [];
}

function canonicalPrinting(value) {
  return typeof printingValue(value) === 'string' ? printingValue(value).replace(/ \d+$/, '') : '';
}

function samePrinting(left, right) {
  return canonicalPrinting(left) === canonicalPrinting(right);
}

function matches(value, pattern) {
  return typeof printingValue(value) === 'string' && pattern.test(printingValue(value));
}

function printingValue(value) {
  if (typeof value === 'string') return value;
  if (typeof value?.printing === 'string') return value.printing;
  if (typeof value?.fullName === 'string') return value.fullName;
  return '';
}

const SOURCE_COPIES = Object.freeze([
  [PRINT.guzmaHala, 4],
  [PRINT.gloom, 2],
  [PRINT.vileplume, 2],
  [PRINT.vileplumeGx, 1],
  [PRINT.herdier, 2],
  [PRINT.stoutland, 1],
  [PRINT.pidgeotto, 2],
  [PRINT.pidgeot, 2],
  [PRINT.tmEvolution, 2],
  [PRINT.jetEnergy, 2],
  [PRINT.grandTree, 1],
  [PRINT.artazon, 2],
  [PRINT.counterGain, 1],
  [PRINT.stealthyHood, 3]
]);

function countMatching(values, pattern) {
  return list(values).filter(value => matches(printingValue(value), pattern)).length;
}

function pokemonStackPrintings(pokemon) {
  const stack = list(pokemon?.evolutionPrintings).map(printingValue).filter(Boolean);
  if (pokemon?.printing && !stack.some(value => samePrinting(value, pokemon.printing))) {
    stack.push(pokemon.printing);
  }
  return stack;
}

function visibleSourceCopies(observation, pattern) {
  const own = observation?.ownPublic ?? {};
  let count = countMatching(observation?.ownHand, pattern);
  for (const zone of ['discard', 'lostZone', 'resolvingSupporter', 'stadium']) {
    count += countMatching(own[zone], pattern);
  }
  // ownHand is authoritative. publicHand mirrors the same physical cards
  // when exposed, so counting both would double-count the actor's hand.
  if (!Array.isArray(observation?.ownHand)) {
    count += countMatching(own.publicHand, pattern);
  }
  for (const row of boardSlots(own)) {
    count += countMatching(pokemonStackPrintings(row.pokemon), pattern);
    count += countMatching(row.pokemon.tools, pattern);
    count += countMatching(row.pokemon.energies, pattern);
  }
  return count;
}

function sourceCopyPossible(observation, pattern) {
  const source = SOURCE_COPIES.find(([candidate]) => candidate === pattern);
  return Boolean(source && source[1] - visibleSourceCopies(observation, pattern) > 0);
}

function hasK0PossibleStageFor(observation, printing) {
  if (matches(printing, PRINT.oddish)) return sourceCopyPossible(observation, PRINT.gloom);
  if (matches(printing, PRINT.lillipup)) return sourceCopyPossible(observation, PRINT.herdier);
  if (matches(printing, PRINT.pidgey)) return sourceCopyPossible(observation, PRINT.pidgeotto);
  if (matches(printing, PRINT.gloom)) {
    return sourceCopyPossible(observation, PRINT.vileplume) ||
      sourceCopyPossible(observation, PRINT.vileplumeGx);
  }
  if (matches(printing, PRINT.herdier)) return sourceCopyPossible(observation, PRINT.stoutland);
  if (matches(printing, PRINT.pidgeotto)) return sourceCopyPossible(observation, PRINT.pidgeot);
  return false;
}

function hasK0PossibleBenchEvolutionTarget(observation) {
  return list(observation?.ownPublic?.bench).some(pokemon =>
    pokemon && hasK0PossibleStageFor(observation, pokemon.printing));
}

function grandTreeTargetPossible(observation, pokemon) {
  if (!pokemon || !Number.isFinite(pokemon.lastPlayedOrEvolvedTurn) ||
      pokemon.lastPlayedOrEvolvedTurn >= observation.globalTurn) return false;
  if (matches(pokemon.printing, PRINT.oddish)) {
    return sourceCopyPossible(observation, PRINT.gloom) &&
      (sourceCopyPossible(observation, PRINT.vileplume) ||
        sourceCopyPossible(observation, PRINT.vileplumeGx));
  }
  if (matches(pokemon.printing, PRINT.lillipup)) {
    return sourceCopyPossible(observation, PRINT.herdier) &&
      sourceCopyPossible(observation, PRINT.stoutland);
  }
  if (matches(pokemon.printing, PRINT.pidgey)) {
    return sourceCopyPossible(observation, PRINT.pidgeotto) &&
      sourceCopyPossible(observation, PRINT.pidgeot);
  }
  return false;
}

function hasK0PossibleGrandTreeTarget(observation) {
  return boardSlots(observation?.ownPublic).some(row =>
    grandTreeTargetPossible(observation, row.pokemon));
}

function bunnelbyActive(observation) {
  return matches(observation?.ownPublic?.active?.printing ?? '', PRINT.bunnelby);
}

function bunnelbyOnBench(observation) {
  return list(observation?.ownPublic?.bench).some(pokemon =>
    pokemon && matches(pokemon.printing, PRINT.bunnelby));
}

function bunnelbyHasTool(observation, pattern) {
  const slots = boardSlots(observation?.ownPublic);
  const slot = slots.find(row => matches(row.pokemon.printing, PRINT.bunnelby));
  return Boolean(slot && list(slot.pokemon.tools).some(tool => matches(printingValue(tool), pattern)));
}

function bunnelbyInPlay(observation) {
  return bunnelbyActive(observation) || bunnelbyOnBench(observation);
}

function boardSlots(player) {
  return [
    { zone: 'active', index: 0, pokemon: player?.active ?? null },
    ...list(player?.bench).map((pokemon, index) => ({
      zone: 'bench', index, pokemon
    }))
  ].filter(row => row.pokemon);
}

function boardHas(player, pattern) {
  return boardSlots(player).some(row => matches(row.pokemon.printing, pattern));
}

function boardCount(player, pattern) {
  return boardSlots(player).filter(row => matches(row.pokemon.printing, pattern)).length;
}

function handCount(hand, pattern) {
  return list(hand).filter(card => matches(card, pattern)).length;
}

function discardCount(player, pattern) {
  return list(player?.discard).filter(card => matches(card, pattern)).length;
}

function remainingHp(pokemon) {
  if (!pokemon || !Number.isFinite(pokemon.hp) || !Number.isFinite(pokemon.damage)) {
    return -1;
  }
  return pokemon.hp - pokemon.damage;
}

function ownItemLocked(observation) {
  return observation?.ownTurnResources?.itemPlayLocked === true ||
    observation?.ownPublic?.publicTurnRestrictions?.itemPlayLocked === true;
}

function supporterAvailable(observation) {
  return observation?.ownTurnResources?.supporterPlayedTurn === 0 &&
    observation?.ownTurnResources?.supporterPlayLocked !== true &&
    observation?.ownPublic?.publicTurnRestrictions?.supporterPlayLocked !== true;
}

function hasUnevolvedBasicFromPriorTurn(player, globalTurn) {
  return boardSlots(player).some(({ pokemon }) =>
    pokemon.printed?.stage === 'BASIC' &&
    Number.isSafeInteger(pokemon.lastPlayedOrEvolvedTurn) &&
    pokemon.lastPlayedOrEvolvedTurn < globalTurn);
}

function ownDeckLow(observation) {
  return (observation?.ownPublic?.deckCount ?? 99) <= 5;
}

function ownBehindOnPrizes(observation) {
  return Number.isFinite(observation?.ownPublic?.prizeCount) &&
    Number.isFinite(observation?.opponentPublic?.prizeCount) &&
    observation.ownPublic.prizeCount > observation.opponentPublic.prizeCount;
}

function opponentHasSpecialEnergy(player) {
  return boardSlots(player).some(({ pokemon }) =>
    list(pokemon.energies).some(energy =>
      /Energy/i.test(energy) &&
      !/^(?:Basic )?(?:Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal) Energy\b/i.test(energy)));
}

function opponentHasGarbotoxin(player) {
  return boardSlots(player).some(({ pokemon }) =>
    list(pokemon.abilities).includes('Garbotoxin'));
}

function hasStealthyHood(pokemon) {
  return list(pokemon?.tools).some(tool => matches(tool, PRINT.stealthyHood));
}

function opponentHasAnyEnergy(player) {
  return boardSlots(player).some(({ pokemon }) => list(pokemon.energies).length > 0);
}

function opponentHasFabaTarget(player) {
  return opponentHasSpecialEnergy(player) ||
    boardSlots(player).some(({ pokemon }) => list(pokemon.tools).length > 0) ||
    list(player?.stadium).length > 0;
}

function sourceText(prompt) {
  return [
    prompt?.source?.sourcePrinting ?? '',
    prompt?.source?.effectName ?? '',
    prompt?.description ?? ''
  ].join(' ').toLowerCase();
}

function choicePrinting(choice) {
  return choice?.printing ?? '';
}

function choiceZone(choice) {
  return choice?.publicMetadata?.targetZone ??
    choice?.publicMetadata?.sourceZone ??
    choice?.publicMetadata?.zone ?? null;
}

function choiceOwner(choice) {
  return choice?.publicMetadata?.ownerSeat ?? null;
}

function missingLinePriority(observation) {
  const own = observation?.ownPublic ?? {};
  const hand = list(observation?.ownHand);
  if (!boardHas(own, PRINT.vileplume) && !hand.some(card => matches(card, PRINT.vileplume))) {
    if (boardHas(own, PRINT.gloom) || hand.some(card => matches(card, PRINT.gloom))) return 100;
    if (boardHas(own, PRINT.oddish) || hand.some(card => matches(card, PRINT.oddish))) return 90;
  }
  if (!boardHas(own, PRINT.stoutland) && !hand.some(card => matches(card, PRINT.stoutland))) {
    if (boardHas(own, PRINT.herdier) || hand.some(card => matches(card, PRINT.herdier))) return 88;
    if (boardHas(own, PRINT.lillipup) || hand.some(card => matches(card, PRINT.lillipup))) return 78;
  }
  if (!boardHas(own, PRINT.pidgeot) && !hand.some(card => matches(card, PRINT.pidgeot))) {
    if (boardHas(own, PRINT.pidgeotto) || hand.some(card => matches(card, PRINT.pidgeotto))) return 75;
    if (boardHas(own, PRINT.pidgey) || hand.some(card => matches(card, PRINT.pidgey))) return 65;
  }
  return 0;
}

function scoreEvolution(card, target, observation) {
  const own = observation.ownPublic;
  const hand = list(observation.ownHand);
  const canFetchGuzmaHala = hand.some(value => matches(value, PRINT.tagCall)) &&
    sourceCopyPossible(observation, PRINT.guzmaHala) &&
    canUseGuzmaHalaMode1(observation, {
      excludePatterns: [PRINT.tagCall], guzmaInHand: true
    });
  const canPlayGuzmaHala = hand.some(value => matches(value, PRINT.guzmaHala)) &&
    supporterAvailable(observation) &&
    canUseGuzmaHalaMode1(observation, {
      excludePatterns: [PRINT.guzmaHala], guzmaInHand: true
    });
  const canUseEvolutionTool = hand.some(value => matches(value, PRINT.tmEvolution)) &&
    !bunnelbyHasTool(observation, PRINT.tmEvolution) &&
    bunnelbyInPlay(observation) && hasK0PossibleBenchEvolutionTarget(observation);
  const canUseHood = hand.some(value => matches(value, PRINT.stealthyHood)) &&
    opponentHasGarbotoxin(observation.opponentPublic);
  const canUseCounterGain = hand.some(value => matches(value, PRINT.counterGain)) &&
    ownBehindOnPrizes(observation);
  const preLockSetupStillNeeded = !ownItemLocked(observation) &&
    (canFetchGuzmaHala || canPlayGuzmaHala || canUseEvolutionTool ||
      canUseHood || canUseCounterGain);
  if (matches(card, PRINT.vileplume) && matches(target, PRINT.gloom) &&
      !boardHas(own, PRINT.vileplume)) return preLockSetupStillNeeded ? 175 : 245;
  if (matches(card, PRINT.stoutland) && matches(target, PRINT.herdier) &&
      !boardHas(own, PRINT.stoutland)) return 235;
  if (matches(card, PRINT.pidgeot) && matches(target, PRINT.pidgeotto) &&
      !boardHas(own, PRINT.pidgeot)) return 210;
  if (matches(card, PRINT.gloom) && matches(target, PRINT.oddish) &&
      !boardHas(own, PRINT.vileplume)) return 185;
  if (matches(card, PRINT.herdier) && matches(target, PRINT.lillipup) &&
      !boardHas(own, PRINT.stoutland)) return 178;
  if (matches(card, PRINT.pidgeotto) && matches(target, PRINT.pidgey) &&
      !boardHas(own, PRINT.pidgeot)) return 165;
  if (matches(card, PRINT.vileplumeGx) && matches(target, PRINT.gloom)) return 90;
  return 0;
}

function scoreBasicPlay(card, observation) {
  const own = observation.ownPublic;
  if (matches(card, PRINT.fanRotom) && !boardHas(own, PRINT.fanRotom)) {
    return observation.globalTurn <= 2 ? 145 : 24;
  }
  if (matches(card, PRINT.oddish) && !boardHas(own, PRINT.oddish) &&
      !boardHas(own, PRINT.vileplume)) return 132;
  if (matches(card, PRINT.lillipup) && !boardHas(own, PRINT.lillipup) &&
      !boardHas(own, PRINT.stoutland)) return 128;
  if (matches(card, PRINT.pidgey) && !boardHas(own, PRINT.pidgey) &&
      !boardHas(own, PRINT.pidgeot)) return 118;
  if (matches(card, PRINT.bunnelby) && boardCount(own, PRINT.bunnelby) < 2) return 92;
  if (matches(card, PRINT.budew) && !boardHas(own, PRINT.vileplume) &&
      !boardHas(own, PRINT.stoutland)) return 82;
  if (matches(card, PRINT.girafarig) && !boardHas(own, PRINT.girafarig)) return 64;
  if (matches(card, PRINT.relicanth) && !boardHas(own, PRINT.relicanth)) return 60;
  if (matches(card, PRINT.mrMime) && !boardHas(own, PRINT.mrMime)) return 54;
  if (matches(card, PRINT.jirachi) && !boardHas(own, PRINT.jirachi)) return 48;
  return 0;
}

function scoreAttack(item, observation) {
  const name = item.attackName ?? '';
  const own = observation.ownPublic;
  const opponent = observation.opponentPublic;
  const opponentDeck = opponent.deckCount ?? 0;
  const ownDeck = own.deckCount ?? 0;
  const opponentDiscard = list(opponent.discard);

  if (name === 'Evolution') {
    const ready = bunnelbyActive(observation) &&
      bunnelbyHasTool(observation, PRINT.tmEvolution) &&
      hasK0PossibleBenchEvolutionTarget(observation) && opponentDeck > 1;
    return ready ? (ownDeck <= 4 ? 140 : 155) : 20;
  }
  if (name === 'Burrow') {
    return 92 + (opponentDeck <= 8 ? 32 : 0) +
      (opponentDeck < ownDeck ? 8 : 0);
  }
  if (name === 'Rototiller') {
    const keyRecovery = list(own.discard).some(card =>
      matches(card, PRINT.guzmaHala) || matches(card, PRINT.grandTree) ||
      matches(card, PRINT.jetEnergy) || matches(card, PRINT.memoryEnergy) ||
      matches(card, PRINT.teamYell));
    return ownDeck <= 4 ? 150 : (keyRecovery ? 78 : 12);
  }
  if (name === 'Get Lost') {
    const targets = opponentDiscard.filter(card =>
      /VS Seeker|Lusamine|Team Yell|Karen|Guzma|Guzma & Hala|Special Charge|Double Dragon Energy|Double Colorless Energy|Rare Candy|Forest Seal Stone|Battle Compressor/i.test(card));
    return targets.length >= 2 ? 125 + Math.min(40, targets.length * 8) :
      (targets.length === 1 ? 95 : 22);
  }
  if (name === 'Itchy Pollen') {
    const itemLockLive = boardHas(own, PRINT.vileplume) &&
      !opponentHasGarbotoxin(observation.opponentPublic);
    const supporterLockLive = matches(own.active?.printing ?? '', PRINT.stoutland);
    return !itemLockLive && !supporterLockLive ? 128 : 15;
  }
  if (name === 'Baby-Doll Eyes') {
    const active = opponent.active;
    const trapped = active?.publicRestrictions?.cannotRetreat === true ||
      active?.publicRestrictions?.cannotRetreatNextTurn === true ||
      active?.publicRestrictions?.cannotRetreatWhileActive === true;
    return trapped ? 60 : 122;
  }
  if (name === 'Wild Tackle') return 84;
  if (name === 'Blustery Wind') {
    return 116 + (list(opponent.stadium).length > 0 ? 8 : 0);
  }
  if (name === 'Solar Beam') return 56;
  if (name === 'Allergic Explosion-GX') {
    return observation.ownPublic?.publicTurnRestrictions?.gxUsed === true ? 20 : 140;
  }
  if (name === 'Massive Bloom') {
    return 92 + (Number(own.active?.damage ?? 0) > 0 ? 12 : 0);
  }
  if (name === 'Stardust') return opponentHasSpecialEnergy(opponent) ? 145 : 45;
  if (name === 'Dream Dance') return 58;
  if (name === 'Gust') return 50;
  return 20;
}

function scoreAction(item, request, config = {}) {
  const observation = request.observation;
  const own = observation.ownPublic;
  const opponent = observation.opponentPublic;
  const hand = list(observation.ownHand);
  const metadata = item.publicMetadata ?? {};
  const card = item.actorPrinting ?? '';
  const target = item.targetPrinting ?? '';

  if (item.kind === 'pass') return 0;
  if (item.kind === 'attack') return scoreAttack(item, observation);

  if (item.kind === 'use-ability') {
    const ability = metadata.abilityName ?? '';
    if (ability === 'Quick Search') return 250;
    if (ability === 'Fan Call') return 245;
    if (ability === 'Air Mail') return 225;
    if (ability === 'Fragrant Flower Garden') {
      return boardSlots(own).some(row => row.pokemon.damage > 0) ? 155 : 25;
    }
    if (ability === 'Treasure Hunt') return ownItemLocked(observation) ? 8 : 86;
    // Irresistible Aroma puts an opponent Basic onto their Bench; do not
    // volunteer this optional effect without a matchup-specific reason.
    if (ability === 'Irresistible Aroma') return 0;
    return 0;
  }

  if (item.kind === 'use-stadium') {
    const stadium = item.actorPrinting ?? metadata.stadiumPrinting ?? '';
    if (matches(stadium, PRINT.grandTree)) {
      return hasK0PossibleGrandTreeTarget(observation) ? 190 : 0;
    }
    if (matches(stadium, PRINT.artazon)) {
      return list(own.bench).some(slot => slot === null) &&
        missingLinePriority(observation) > 0 ? 118 : 35;
    }
    return 0;
  }

  if (item.kind === 'retreat') {
    if (matches(target, PRINT.stoutland)) {
      const targetPokemon = boardSlots(own).find(row =>
        samePrinting(row.pokemon.printing, target))?.pokemon ?? null;
      const alreadyLocked = opponent.publicTurnRestrictions?.supporterPlayLocked === true;
      const garbotoxinDisablesTarget = opponentHasGarbotoxin(opponent) &&
        !hasStealthyHood(targetPokemon);
      return alreadyLocked || garbotoxinDisablesTarget ? 0 : 185;
    }
    if (matches(own.active?.printing ?? '', PRINT.stoutland) &&
        opponent.publicTurnRestrictions?.supporterPlayLocked === true) return 0;
    return 10;
  }

  if (item.kind !== 'play-card') return 0;

  if (metadata.cardType === 'pokemon') {
    return scoreEvolution(card, target, observation) ||
      scoreBasicPlay(card, observation);
  }

  if (matches(card, PRINT.tagCall)) {
    const canFetch = sourceCopyPossible(observation, PRINT.guzmaHala) &&
      canUseGuzmaHalaMode1(observation, {
        excludePatterns: [PRINT.tagCall], guzmaInHand: true
      });
    return ownItemLocked(observation) ? 0 : (canFetch ? 205 : 0);
  }
  if (matches(card, PRINT.guzmaHala)) {
    if (!supporterAvailable(observation)) return 0;
    if (canUseGuzmaHalaMode1(observation, {
      excludePatterns: [PRINT.guzmaHala], guzmaInHand: true
    })) return 215;
    return canUseGuzmaHalaMode0(observation) ? 142 : 0;
  }
  if (matches(card, PRINT.tmEvolution)) {
    const bunnelby = boardSlots(own).some(row => matches(row.pokemon.printing, PRINT.bunnelby));
    const bunnelbyActive = matches(own.active?.printing ?? '', PRINT.bunnelby);
    const hasJet = handCount(hand, PRINT.jetEnergy) > 0;
    const targetReady = hasK0PossibleBenchEvolutionTarget(observation);
    return bunnelby && (hasJet || bunnelbyActive) && targetReady ? 178 : 88;
  }
  if (matches(card, PRINT.jetEnergy)) {
    const targetIsBunnelby = matches(target, PRINT.bunnelby);
    const targetIsStoutland = matches(target, PRINT.stoutland);
    const hasTm = boardSlots(own).some(row =>
      list(row.pokemon.tools).some(tool => matches(tool, PRINT.tmEvolution)));
    if (targetIsBunnelby && hasTm) return 225;
    if (targetIsStoutland && !matches(own.active?.printing ?? '', PRINT.stoutland)) return 198;
    return 80;
  }
  if (matches(card, PRINT.captureEnergy)) {
    return list(own.bench).some(slot => slot === null) &&
      missingLinePriority(observation) > 0 ? 102 : 18;
  }
  if (matches(card, PRINT.counterGain)) {
    return ownBehindOnPrizes(observation) &&
      samePrinting(target, own.active?.printing) ? 190 : 0;
  }
  if (matches(card, PRINT.memoryEnergy)) {
    return boardHas(own, PRINT.stoutland) && !boardSlots(own).some(row =>
      list(row.pokemon.energies).some(energy => matches(energy, PRINT.memoryEnergy))) ? 116 : 50;
  }
  if (matches(card, PRINT.stealthyHood)) {
    const targetSlot = boardSlots(own).find(row =>
      target ? row.pokemon.printing === target : matches(row.pokemon.printing, PRINT.vileplume));
    const threatened = opponentHasGarbotoxin(opponent);
    return targetSlot && threatened && !ownItemLocked(observation) ? 205 : 65;
  }
  if (matches(card, PRINT.grandTree)) {
    return hasUnevolvedBasicFromPriorTurn(own, observation.globalTurn) &&
      missingLinePriority(observation) > 0 ? 180 : 95;
  }
  if (matches(card, PRINT.artazon)) {
    return list(own.bench).some(slot => slot === null) &&
      missingLinePriority(observation) > 0 ? 128 : 70;
  }
  if (matches(card, PRINT.guzma)) {
    const targetIndex = metadata.targetIndex;
    const targetPokemon = metadata.targetSeat === 'opponent' &&
      metadata.targetZone === 'bench' && Number.isSafeInteger(targetIndex) ?
      opponent.bench?.[targetIndex] : null;
    return targetPokemon ?
      (remainingHp(targetPokemon) > 0 && remainingHp(targetPokemon) <= 90 ? 88 : 42) : 0;
  }
  if (matches(card, PRINT.faba)) return opponentHasFabaTarget(opponent) ? 94 : 0;
  if (matches(card, PRINT.plumeria)) return opponentHasAnyEnergy(opponent) ? 78 : 0;
  if (matches(card, PRINT.cassius)) {
    return boardSlots(own).some(row =>
      remainingHp(row.pokemon) > 0 && remainingHp(row.pokemon) <= 40) ? 108 : 12;
  }
  if (matches(card, PRINT.teamYell)) {
    return ownDeckLow(observation) && discardCount(own, PRINT.guzmaHala) > 0 ? 112 : 60;
  }
  if (matches(card, PRINT.lusamine)) {
    return lusamineRecoverableSupporters(observation, config).length >= 2 ? 142 : 0;
  }
  if (matches(card, PRINT.karen)) {
    return ownDeckLow(observation) && list(own.discard).some(value =>
      /Pokémon/i.test(value)) ? 88 : 10;
  }
  if (matches(card, PRINT.bellelba)) {
    return opponent.deckCount <= (own.deckCount ?? 99) - 5 ? 82 : 5;
  }
  if (matches(card, PRINT.peonia)) {
    return observation.ownPublic.prizeCount >= 3 &&
      peoniaSafeReplacementCount(observation) >= 3 &&
      discardCount(own, PRINT.peonia) === 0 ? 132 : 0;
  }
  if (matches(card, PRINT.gladion)) {
    const missingCore = missingLinePriority(observation) > 0 ||
      !boardHas(own, PRINT.vileplume) ||
      !boardHas(own, PRINT.stoutland) ||
      !boardHas(own, PRINT.pidgeot);
    return config.gladionPrizeIdentityProjection === true &&
      observation.ownPublic.prizeCount > 0 && missingCore ? 138 : 0;
  }
  return 0;
}

function lusamineRecoverableSupporters(observation, config = {}) {
  const own = observation?.ownPublic ?? {};
  return list(own.discard).filter(value =>
    matches(value, PRINT.guzmaHala) ||
    matches(value, PRINT.guzma) ||
    matches(value, PRINT.faba) ||
    matches(value, PRINT.plumeria) ||
    matches(value, PRINT.karen) ||
    matches(value, PRINT.teamYell) ||
    matches(value, PRINT.bellelba) ||
    (config.gladionPrizeIdentityProjection === true && matches(value, PRINT.gladion)) ||
    (config.peoniaAcceptedLedger === true && matches(value, PRINT.peonia))
  );
}

function cardPriority(printing, observation, context, config = {}) {
  const own = observation.ownPublic;
  const hand = list(observation.ownHand);

  if (context.includes('tag call')) {
    if (matches(printing, PRINT.guzmaHala)) return 150;
    if (matches(printing, PRINT.bellelba)) return 20;
    return 0;
  }
  if (context.includes('fan call')) {
    if (matches(printing, PRINT.pidgey) && !boardHas(own, PRINT.pidgey)) return 120;
    if (matches(printing, PRINT.lillipup) && !boardHas(own, PRINT.lillipup)) return 115;
    if (matches(printing, PRINT.bunnelby) && boardCount(own, PRINT.bunnelby) < 2) return 108;
    if (matches(printing, PRINT.fanRotom) && !boardHas(own, PRINT.fanRotom)) return 90;
    return 0;
  }
  if (context.includes('guzma & hala')) {
    if (matches(printing, PRINT.grandTree)) return hasK0PossibleGrandTreeTarget(observation) ? 180 : 65;
    if (matches(printing, PRINT.artazon)) {
      return list(own.bench).some(slot => slot === null) ? 165 : 65;
    }
    if (matches(printing, PRINT.tmEvolution)) {
      return handCount(hand, PRINT.tmEvolution) === 0 &&
        !bunnelbyHasTool(observation, PRINT.tmEvolution) ? 175 : 70;
    }
    if (matches(printing, PRINT.stealthyHood)) {
      const hoodHeld = handCount(hand, PRINT.stealthyHood) > 0 ||
        boardSlots(own).some(row => list(row.pokemon.tools).some(tool => matches(tool, PRINT.stealthyHood)));
      return opponentHasGarbotoxin(observation.opponentPublic) && !hoodHeld ? 160 : 35;
    }
    if (matches(printing, PRINT.counterGain)) {
      return ownBehindOnPrizes(observation) && handCount(hand, PRINT.counterGain) === 0 ? 135 : 50;
    }
    if (matches(printing, PRINT.jetEnergy)) {
      const jetInPlay = boardSlots(own).some(row =>
        list(row.pokemon.energies).some(energy => matches(energy, PRINT.jetEnergy)));
      return handCount(hand, PRINT.jetEnergy) === 0 && !jetInPlay ? 160 : 80;
    }
    if (matches(printing, PRINT.captureEnergy)) {
      return list(own.bench).some(slot => slot === null) && missingLinePriority(observation) > 0 ? 125 : 60;
    }
    if (matches(printing, PRINT.memoryEnergy)) {
      const memoryInPlay = boardSlots(own).some(row =>
        list(row.pokemon.energies).some(energy => matches(energy, PRINT.memoryEnergy)));
      return boardHas(own, PRINT.stoutland) && !memoryInPlay ? 100 : 40;
    }
    return 0;
  }
  if (context.includes('artazon')) {
    if (matches(printing, PRINT.oddish) && !boardHas(own, PRINT.oddish)) return 130;
    if (matches(printing, PRINT.lillipup) && !boardHas(own, PRINT.lillipup)) return 125;
    if (matches(printing, PRINT.pidgey) && !boardHas(own, PRINT.pidgey)) return 115;
    if (matches(printing, PRINT.bunnelby) && boardCount(own, PRINT.bunnelby) < 2) return 100;
    if (matches(printing, PRINT.girafarig) && !boardHas(own, PRINT.girafarig)) return 70;
    if (matches(printing, PRINT.budew) && !boardHas(own, PRINT.budew)) return 65;
    return 0;
  }
  if (context.includes('rototiller')) {
    if (matches(printing, PRINT.guzmaHala)) return 150;
    if (matches(printing, PRINT.teamYell) || matches(printing, PRINT.lusamine)) return 135;
    if (matches(printing, PRINT.jetEnergy) || matches(printing, PRINT.memoryEnergy)) return 115;
    if (matches(printing, PRINT.grandTree)) return hasK0PossibleGrandTreeTarget(observation) ? 110 : 35;
    return 40;
  }
  if (context.includes('get lost')) {
    if (/VS Seeker|Lusamine|Team Yell|Karen|Guzma|Guzma & Hala|Special Charge/i.test(printing)) return 150;
    if (/Double Dragon Energy|Double Colorless Energy|Special Energy/i.test(printing)) return 125;
    if (/Forest Seal Stone|Rare Candy|Battle Compressor/i.test(printing)) return 110;
    return 20;
  }
  if (context.includes('treasure hunt')) {
    if (matches(printing, PRINT.tmEvolution) || matches(printing, PRINT.tagCall)) return 150;
    if (matches(printing, PRINT.stealthyHood) || matches(printing, PRINT.teamYell)) return 100;
    return 20;
  }
  if (context.includes('team yell') || context.includes('lusamine')) {
    if (matches(printing, PRINT.gladion)) {
      return config.gladionPrizeIdentityProjection === true ? 175 : 0;
    }
    if (matches(printing, PRINT.peonia)) {
      return config.peoniaAcceptedLedger === true ? 165 : 0;
    }
    if (/Guzma & Hala|Guzma|Faba|Plumeria|Karen|Team Yell|Lusamine|Bellelba/i.test(printing)) return 150;
    return 0;
  }
  if (context.includes('faba') || context.includes('plumeria')) {
    if (/Special Energy|Jet Energy|Capture Energy|Double Dragon Energy|Double Colorless Energy/i.test(printing)) return 160;
    if (/Tool|Pokémon Tool|Stadium|Grand Tree|Artazon/i.test(printing)) return 110;
    return 0;
  }

  // Pidgeot ex Quick Search and Pidgeotto Air Mail are unrestricted searches.
  if (context.includes('quick search') || context.includes('air mail')) {
    if (matches(printing, PRINT.vileplume) && boardHas(own, PRINT.gloom) && !boardHas(own, PRINT.vileplume)) return 175;
    if (matches(printing, PRINT.stoutland) && boardHas(own, PRINT.herdier) && !boardHas(own, PRINT.stoutland)) return 168;
    if (matches(printing, PRINT.pidgeot) && boardHas(own, PRINT.pidgeotto) && !boardHas(own, PRINT.pidgeot)) return 160;
    if (matches(printing, PRINT.gloom) && boardHas(own, PRINT.oddish)) return 150;
    if (matches(printing, PRINT.herdier) && boardHas(own, PRINT.lillipup)) return 145;
    if (matches(printing, PRINT.pidgeotto) && boardHas(own, PRINT.pidgey)) return 140;
    if (matches(printing, PRINT.tmEvolution) && bunnelbyInPlay(observation) && hasK0PossibleBenchEvolutionTarget(observation) && !bunnelbyHasTool(observation, PRINT.tmEvolution) && handCount(hand, PRINT.tmEvolution) === 0) return 155;
    if (matches(printing, PRINT.grandTree)) return hasK0PossibleGrandTreeTarget(observation) ? 150 : 45;
    if (matches(printing, PRINT.artazon)) return list(own.bench).some(slot => slot === null) && missingLinePriority(observation) > 0 ? 135 : 50;
    if (matches(printing, PRINT.jetEnergy)) {
      const jetInPlay = boardSlots(own).some(row => list(row.pokemon.energies).some(energy => matches(energy, PRINT.jetEnergy)));
      return handCount(hand, PRINT.jetEnergy) === 0 && !jetInPlay ? 140 : 55;
    }
    if (matches(printing, PRINT.counterGain) && ownBehindOnPrizes(observation)) return 130;
    if (matches(printing, PRINT.stealthyHood) && opponentHasGarbotoxin(observation.opponentPublic)) return 125;
    if (matches(printing, PRINT.guzmaHala) && canUseGuzmaHalaMode1(observation, { guzmaInHand: true })) return 120;
    if (matches(printing, PRINT.tagCall) && sourceCopyPossible(observation, PRINT.guzmaHala) && canUseGuzmaHalaMode1(observation, { excludePatterns: [PRINT.tagCall], guzmaInHand: true })) return 115;
    if (matches(printing, PRINT.oddish) && !boardHas(own, PRINT.oddish)) return 105;
    if (matches(printing, PRINT.lillipup) && !boardHas(own, PRINT.lillipup)) return 100;
    if (matches(printing, PRINT.pidgey) && !boardHas(own, PRINT.pidgey)) return 95;
    if (matches(printing, PRINT.bunnelby) && boardCount(own, PRINT.bunnelby) < 2) return 90;
    if (matches(printing, PRINT.teamYell) || matches(printing, PRINT.lusamine)) return 60;
  }
  return 0;
}

function protectedDuplicateHandIndex(hand, pattern, observation) {
  const indices = hand.map((card, index) =>
    matches(card, pattern) ? index : -1).filter(index => index >= 0);
  if (indices.length < 2) return -1;
  const own = observation?.ownPublic ?? {};
  const liveEvolutionLine = bunnelbyInPlay(observation) &&
    hasK0PossibleBenchEvolutionTarget(observation);
  if (pattern === PRINT.jetEnergy &&
      bunnelbyOnBench(observation) && !bunnelbyActive(observation) &&
      !boardSlots(own).some(row => list(row.pokemon.energies).some(energy =>
        matches(energy, PRINT.jetEnergy)))) return indices[0];
  if (pattern === PRINT.tmEvolution && liveEvolutionLine &&
      !bunnelbyHasTool(observation, PRINT.tmEvolution)) return indices[0];
  return -1;
}

function discardPriority(choice, observation) {
  const printing = choicePrinting(choice);
  const hand = list(observation.ownHand);
  const copies = hand.filter(card => samePrinting(card, printing)).length;
  if (matches(printing, PRINT.jetEnergy) || matches(printing, PRINT.tmEvolution)) {
    const pattern = matches(printing, PRINT.jetEnergy) ? PRINT.jetEnergy : PRINT.tmEvolution;
    const protectedIndex = protectedDuplicateHandIndex(hand, pattern, observation);
    if (protectedIndex >= 0) {
      const selectedIndex = choice?.publicMetadata?.selectionIndex;
      // Without a projected hand index, do not guess which physical copy is surplus.
      if (!Number.isSafeInteger(selectedIndex) || selectedIndex === protectedIndex) return 0;
      return 150 + copies;
    }
  }
  if (copies > 1) return 150 + copies;
  if (matches(printing, PRINT.tagCall) && handCount(hand, PRINT.guzmaHala) > 0) return 120;
  if (matches(printing, PRINT.oddish) && boardHas(observation.ownPublic, PRINT.oddish)) return 90;
  if (matches(printing, PRINT.lillipup) && boardHas(observation.ownPublic, PRINT.lillipup)) return 88;
  if (matches(printing, PRINT.pidgey) && boardHas(observation.ownPublic, PRINT.pidgey)) return 84;
  if (matches(printing, PRINT.grassEnergy) &&
      boardHas(observation.ownPublic, PRINT.vileplumeGx)) return 5;
  if (/Supporter|ACE SPEC|Grand Tree|Jet Energy|Technical Machine: Evolution|Stealthy Hood/i.test(printing) ||
      (matches(printing, PRINT.counterGain) && ownBehindOnPrizes(observation))) return 0;
  if (/Energy/i.test(printing)) return 48;
  if (/Pokémon/i.test(printing)) return 38;
  return 60;
}

function canUseGuzmaHalaMode1(observation, options = {}) {
  const hand = list(observation.ownHand).slice();
  for (const pattern of list(options.excludePatterns)) {
    const index = hand.findIndex(printing => matches(printing, pattern));
    if (index >= 0) hand.splice(index, 1);
  }
  if (hand.length < 2) return false;
  const discardable = hand.filter(printing =>
    discardPriority({ printing }, observation) >= 48);
  if (discardable.length < 2) return false;
  if (!bunnelbyInPlay(observation) ||
      !hasK0PossibleBenchEvolutionTarget(observation)) return false;

  const hasTool = hand.some(printing => matches(printing, PRINT.tmEvolution)) ||
    bunnelbyHasTool(observation, PRINT.tmEvolution);
  const wantTool = !hasTool && sourceCopyPossible(observation, PRINT.tmEvolution);
  const hasJet = hand.some(printing => matches(printing, PRINT.jetEnergy)) ||
    bunnelbyHasTool(observation, PRINT.jetEnergy);
  const wantJet = bunnelbyOnBench(observation) && !bunnelbyActive(observation) &&
    !hasJet && sourceCopyPossible(observation, PRINT.jetEnergy);
  const guzmaAvailable = options.guzmaInHand === true ||
    sourceCopyPossible(observation, PRINT.guzmaHala);
  return guzmaAvailable && (wantTool || wantJet);
}

function canUseGuzmaHalaMode0(observation) {
  const own = observation?.ownPublic ?? {};
  const hasGrandTree = sourceCopyPossible(observation, PRINT.grandTree) &&
    hasK0PossibleGrandTreeTarget(observation);
  const hasArtazon = sourceCopyPossible(observation, PRINT.artazon) &&
    list(own.bench).some(slot => slot === null) &&
    missingLinePriority(observation) > 0;
  return hasGrandTree || hasArtazon;
}

function peoniaReplacementPriority(choice, observation) {
  const printing = choicePrinting(choice);
  const selectedIndex = choice?.publicMetadata?.selectionIndex;
  if (!Number.isSafeInteger(selectedIndex)) return 0;
  const hand = list(observation?.ownHand);
  const copies = hand.map((card, index) =>
    samePrinting(card, printing) ? index : -1).filter(index => index >= 0);
  // Preserve one copy of each printing; only exact surplus copies are safe.
  return copies.length > 1 && selectedIndex !== copies[0] ? 160 + copies.length : 0;
}

function peoniaSafeReplacementCount(observation) {
  return list(observation?.ownHand).reduce((count, printing, index) =>
    count + (peoniaReplacementPriority({
      printing,
      publicMetadata: { selectionIndex: index }
    }, observation) > 0 ? 1 : 0), 0);
}

function originalPrizeSlotIndex(choice) {
  const match = /Prize slot\\s+(\\d+)/i.exec(choice?.label ?? '');
  return match ? Number(match[1]) - 1 : choice?.publicMetadata?.selectionIndex;
}

function gladionPrizePriority(choice, observation) {
  const printing = choicePrinting(choice);
  const own = observation?.ownPublic ?? {};
  if (matches(printing, PRINT.vileplume) && boardHas(own, PRINT.gloom) &&
      !boardHas(own, PRINT.vileplume)) return 220;
  if (matches(printing, PRINT.stoutland) && boardHas(own, PRINT.herdier) &&
      !boardHas(own, PRINT.stoutland)) return 210;
  if (matches(printing, PRINT.pidgeot) && boardHas(own, PRINT.pidgeotto) &&
      !boardHas(own, PRINT.pidgeot)) return 200;
  if (matches(printing, PRINT.gloom) && boardHas(own, PRINT.oddish) &&
      !boardHas(own, PRINT.gloom)) return 175;
  if (matches(printing, PRINT.herdier) && boardHas(own, PRINT.lillipup) &&
      !boardHas(own, PRINT.herdier)) return 170;
  if (matches(printing, PRINT.pidgeotto) && boardHas(own, PRINT.pidgey) &&
      !boardHas(own, PRINT.pidgeotto)) return 165;
  if (matches(printing, PRINT.tmEvolution) && bunnelbyInPlay(observation) &&
      hasK0PossibleBenchEvolutionTarget(observation) &&
      !bunnelbyHasTool(observation, PRINT.tmEvolution)) return 160;
  if (matches(printing, PRINT.jetEnergy) && bunnelbyOnBench(observation) &&
      !bunnelbyActive(observation)) return 150;
  if (matches(printing, PRINT.guzmaHala)) return 125;
  return 0;
}

function scorePokemonChoice(choice, observation, context) {
  const printing = choicePrinting(choice);
  const owner = choiceOwner(choice);
  const zone = choiceZone(choice);
  const opponentChoice = context.includes('guzma') || context.includes('irresistible aroma');
  if (owner && owner !== (opponentChoice ? 'opponent' : 'actor')) return -100;
  if (zone && zone !== 'bench' && !context.includes('irresistible aroma') &&
      !context.includes('cassius') && !context.includes('grand tree')) return -100;
  if (context.includes('guzma')) {
    const target = list(observation.opponentPublic?.bench).find(slot =>
      slot && samePrinting(slot.printing, printing));
    if (!target) return -100;
    const hp = remainingHp(target);
    const multiPrize = /(?:-GX|\b(?:V|VMAX|VSTAR|ex)\b)/i.test(printing) ? 2 : 1;
    return 100 + (hp > 0 && hp <= 90 ? 50 : 0) + multiPrize * 8;
  }
  if (context.includes('cassius')) {
    const target = boardSlots(observation.ownPublic).find(row =>
      samePrinting(row.pokemon.printing, printing));
    if (!target) return -100;
    return remainingHp(target.pokemon) > 0 &&
      remainingHp(target.pokemon) <= 50 ? 160 : 15;
  }
  if (context.includes('grand tree')) {
    const target = boardSlots(observation.ownPublic).find(row =>
      samePrinting(row.pokemon.printing, printing) &&
      grandTreeTargetPossible(observation, row.pokemon));
    if (!target) return -100;
    if (matches(printing, PRINT.oddish)) return 140;
    if (matches(printing, PRINT.lillipup)) return 135;
    if (matches(printing, PRINT.pidgey)) return 125;
    return -100;
  }
  if (context.includes('evolution') || context.includes('technical machine')) {
    if (matches(printing, PRINT.gloom)) return hasK0PossibleStageFor(observation, printing) ? 180 : -100;
    if (matches(printing, PRINT.herdier)) return hasK0PossibleStageFor(observation, printing) ? 172 : -100;
    if (matches(printing, PRINT.pidgeotto)) return hasK0PossibleStageFor(observation, printing) ? 160 : -100;
    if (matches(printing, PRINT.oddish)) return hasK0PossibleStageFor(observation, printing) ? 145 : -100;
    if (matches(printing, PRINT.lillipup)) return hasK0PossibleStageFor(observation, printing) ? 138 : -100;
    if (matches(printing, PRINT.pidgey)) return hasK0PossibleStageFor(observation, printing) ? 128 : -100;
    return 0;
  }
  if (context.includes('irresistible aroma')) {
    // The root policy declines this optional effect. If already in a forced
    // prompt, prefer a low-impact, low-setup-value Basic from the revealed hand.
    if (matches(printing, PRINT.budew)) return 30;
    if (matches(printing, PRINT.jirachi)) return 25;
    if (matches(printing, PRINT.mrMime)) return 20;
    if (matches(printing, PRINT.bunnelby)) return 10;
    return -100;
  }
  return 0;
}

function rankedChoices(choices, scorer, limit) {
  return list(choices)
    .filter(choice => choice.kind !== 'cancel' && choice.kind !== 'empty-selection')
    .map((choice, index) => ({ choice, index, score: scorer(choice) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit);
}

function guzmaHalaSearchCategory(printing) {
  if (matches(printing, PRINT.grandTree) || matches(printing, PRINT.artazon)) return 'stadium';
  if (matches(printing, PRINT.tmEvolution) || matches(printing, PRINT.stealthyHood) ||
      matches(printing, PRINT.counterGain)) return 'tool';
  if (matches(printing, PRINT.jetEnergy) || matches(printing, PRINT.captureEnergy) ||
      matches(printing, PRINT.memoryEnergy)) return 'energy';
  return null;
}

function guzmaHalaSearchSelection(choices, observation, minimum, maximum) {
  const categories = ['stadium', 'tool', 'energy'];
  const best = [];
  for (const category of categories) {
    const candidates = list(choices).filter(choice =>
      guzmaHalaSearchCategory(choicePrinting(choice)) === category);
    const selected = rankedChoices(candidates,
      choice => cardPriority(choicePrinting(choice), observation, 'guzma & hala'), 1)[0];
    if (selected && selected.score > 0) best.push(selected);
  }
  best.sort((a, b) => b.score - a.score || a.index - b.index);
  const limit = Math.min(3, maximum);
  const selected = best.slice(0, limit);
  if (selected.length < minimum || selected.length === 0) return null;
  return selected.map(row => row.choice.token);
}

function guzmaHalaModeZeroSelection(choices, observation, minimum, maximum) {
  const stadiums = list(choices).filter(choice =>
    guzmaHalaSearchCategory(choicePrinting(choice)) === 'stadium');
  const ranked = rankedChoices(stadiums,
    choice => cardPriority(choicePrinting(choice), observation, 'guzma & hala'), maximum)
    .filter(row => row.score > 100);
  if (ranked.length < minimum || ranked.length === 0) return null;
  return ranked.map(row => row.choice.token);
}

function emptyOrAbstain(prompt, choices, reasonCode) {
  const metadata = prompt.publicMetadata ?? {};
  const empty = list(choices).find(choice => choice.kind === 'empty-selection');
  const zeroAllowed = metadata.minimumCount === 0 ||
    metadata.requiredCount === 0 || metadata.count === 0;
  if (zeroAllowed && empty) {
    return { kind: 'select-choice', token: empty.token };
  }
  return { kind: 'abstain', reasonCode };
}

function promptDecision(request, config = {}) {
  const prompt = request.prompt;
  const choices = list(prompt?.choices);
  const metadata = prompt?.publicMetadata ?? {};
  const context = sourceText(prompt);
  const min = Number.isSafeInteger(metadata.minimumCount) ? metadata.minimumCount : 1;
  const max = Number.isSafeInteger(metadata.maximumCount) ? metadata.maximumCount :
    (Number.isSafeInteger(metadata.count) ? metadata.count : min);
  const selectionType = metadata.selectionType ?? null;

  if (selectionType === 'card-combination' || selectionType === 'pokemon' ||
      selectionType === 'energy-payment' || selectionType === 'prize-slots' ||
      selectionType === 'card-order') {
    const recognizedCardSource = context.includes('tag call') ||
      context.includes('fan call') || context.includes('guzma & hala') ||
      context.includes('artazon') || context.includes('rototiller') ||
      context.includes('get lost') || context.includes('quick search') ||
      context.includes('air mail') || context.includes('treasure hunt') ||
      context.includes('team yell') || context.includes('lusamine') ||
      context.includes('faba') || context.includes('plumeria') ||
      context.includes('peonia') || context.includes('gladion');
    if ((selectionType === 'card-combination' || selectionType === 'card-order') &&
        !recognizedCardSource) {
      return { kind: 'abstain', reasonCode: 'UNSUPPORTED_CARD_SELECTION_SOURCE' };
    }
    let ranked;
    if (selectionType === 'pokemon') {
      ranked = rankedChoices(choices,
        choice => scorePokemonChoice(choice, request.observation, context), max)
        .filter(row => row.score > 0);
    } else if (selectionType === 'card-combination') {
      const discardPrompt = (context.includes('guzma & hala') ||
        context.includes('plumeria') || context.includes('peonia')) &&
        choices.some(choice => choiceZone(choice) === 'hand');
      if (!discardPrompt && context.includes('guzma & hala')) {
        const modeOne = canUseGuzmaHalaMode1(request.observation, { guzmaInHand: true });
        const selected = modeOne ?
          guzmaHalaSearchSelection(choices, request.observation, min, max) :
          guzmaHalaModeZeroSelection(choices, request.observation, min, max);
        return selected ? { kind: 'select-choices', tokens: selected } :
          { kind: 'abstain', reasonCode: 'NO_VALID_GUZMA_HALA_SEARCH_SET' };
      }
      ranked = rankedChoices(choices, choice => {
        if (discardPrompt && context.includes('peonia')) {
          return peoniaReplacementPriority(choice, request.observation);
        }
        if (discardPrompt) return discardPriority(choice, request.observation);
        return cardPriority(choicePrinting(choice), request.observation, context, config);
      }, max);
      if (!discardPrompt) ranked = ranked.filter(row => row.score > 0);
    } else if (selectionType === 'energy-payment') {
      const required = typeof metadata.energyType === 'string' ?
        Math.max(min, metadata.energyType.split(',').filter(Boolean).length) : min;
      ranked = rankedChoices(choices, choice => {
        const printing = choicePrinting(choice);
        if (context.includes('plumeria')) {
          return /^(?:Basic )?(?:Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal) Energy\b/i.test(printing) ? 5 : 100;
        }
        if (matches(printing, PRINT.captureEnergy)) return 100;
        if (matches(printing, PRINT.grassEnergy)) return 80;
        if (matches(printing, PRINT.jetEnergy)) return 30;
        if (matches(printing, PRINT.memoryEnergy)) return 10;
        return 50;
      }, required);
    } else if (selectionType === 'prize-slots') {
      const required = Number.isSafeInteger(metadata.requiredCount) ?
        metadata.requiredCount : min;
      if (context.includes('peonia')) {
        const safeCount = peoniaSafeReplacementCount(request.observation);
        const own = request.observation?.ownPublic ?? {};
        const slots = choices.filter(choice =>
          choice.kind === 'prize' &&
          choice.publicMetadata?.ownerSeat === 'actor' &&
          choice.publicMetadata?.isOwnerVisible === false &&
          choice.publicMetadata?.sourceZone === 'prizes');
        // Pinned native Peonia currently requires three. Until its paper
        // "up to three" correction is integrated, fail closed below three.
        if (required !== 3 || safeCount < required ||
            discardCount(own, PRINT.peonia) > 0 || slots.length < required) {
          return { kind: 'abstain', reasonCode: 'PEONIA_REPLACEMENT_OR_NATIVE_MINIMUM_UNSUPPORTED' };
        }
        const ordered = slots.slice().sort((a, b) =>
          (originalPrizeSlotIndex(a) ?? 99) - (originalPrizeSlotIndex(b) ?? 99));
        ranked = ordered.slice(0, required).map((choice, index) =>
          ({ choice, index, score: 1 }));
      } else if (context.includes('gladion')) {
        if (config.gladionPrizeIdentityProjection !== true) {
          return { kind: 'abstain', reasonCode: 'GLADION_PRIZE_IDENTITY_PROJECTION_DISABLED' };
        }
        const visible = choices.filter(choice =>
          choice.kind === 'prize' &&
          choice.publicMetadata?.ownerSeat === 'actor' &&
          choice.publicMetadata?.isOwnerVisible === true &&
          typeof choice.printing === 'string');
        ranked = rankedChoices(visible,
          choice => gladionPrizePriority(choice, request.observation), required)
          .filter(row => row.score > 0);
        if (ranked.length < required) {
          return { kind: 'abstain', reasonCode: 'GLADION_PRIZE_IDENTITIES_NOT_ACTOR_VISIBLE' };
        }
      } else {
        ranked = rankedChoices(choices, choice =>
          Number.isSafeInteger(choice.publicMetadata?.choiceIndex) ?
            -choice.publicMetadata.choiceIndex : 0, required);
      }
    } else {
      ranked = rankedChoices(choices,
        choice => cardPriority(choicePrinting(choice), request.observation, context, config), max);
    }

    const tokens = ranked.map(row => row.choice.token);
    const required = selectionType === 'prize-slots' &&
      Number.isSafeInteger(metadata.requiredCount) ? metadata.requiredCount : min;
    if (tokens.length < required) {
      return emptyOrAbstain(prompt, choices, 'INSUFFICIENT_SUPPORTED_PROMPT_CHOICES');
    }
    if (tokens.length > 0) return { kind: 'select-choices', tokens };
    return emptyOrAbstain(prompt, choices, 'NO_SUPPORTED_MULTI_SELECT');
  }

  if (prompt.promptType === 'SelectOptionPrompt' && context.includes('guzma & hala')) {
    const modeOne = choices.find(choice =>
      choice.publicMetadata?.choiceIndex === 1 &&
      /Discard 2 cards/i.test(choice.label ?? ''));
    const modeZero = choices.find(choice => choice.publicMetadata?.choiceIndex === 0);
    if (modeOne && canUseGuzmaHalaMode1(request.observation, { guzmaInHand: true })) {
      return { kind: 'select-choice', token: modeOne.token };
    }
    if (modeZero) return { kind: 'select-choice', token: modeZero.token };
    return { kind: 'abstain', reasonCode: 'NO_SAFE_GUZMA_HALA_MODE' };
  }

  if (prompt.promptType === 'ChooseAttackPrompt') {
    const relicanthChoice = context.includes('memory dive') || context.includes('relicanth');
    const bunnelbyChoice = bunnelbyActive(request.observation);
    if (!relicanthChoice && !bunnelbyChoice) {
      return { kind: 'abstain', reasonCode: 'UNSUPPORTED_ATTACK_CHOICE_SOURCE' };
    }
    const known = new Set([
      'Evolution', 'Burrow', 'Rototiller', 'Get Lost', 'Itchy Pollen',
      'Baby-Doll Eyes', 'Wild Tackle', 'Blustery Wind', 'Solar Beam',
      'Allergic Explosion-GX', 'Massive Bloom', 'Stardust', 'Dream Dance', 'Gust'
    ]);
    const ranked = choices.map((choice, index) => {
      const attackName = choice.publicMetadata?.sourceAttack ?? choice.label ?? '';
      return {
        choice, index, attackName,
        score: known.has(attackName) ?
          scoreAttack({ attackName }, request.observation) : -100
      };
    }).filter(row => row.score > 20)
      .sort((a, b) => b.score - a.score || a.index - b.index);
    return ranked[0] ?
      { kind: 'select-choice', token: ranked[0].choice.token } :
      { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ATTACK_CHOICE' };
  }

  if (prompt.promptType === 'ChoosePrizePrompt') {
    if (context.includes('peonia') || context.includes('gladion')) {
      return { kind: 'abstain', reasonCode: 'UNSUPPORTED_SOURCE_SPECIFIC_PRIZE_METADATA' };
    }
    const choice = choices.slice().sort((a, b) =>
      (a.publicMetadata?.choiceIndex ?? 0) - (b.publicMetadata?.choiceIndex ?? 0))[0];
    return choice ? { kind: 'select-choice', token: choice.token } :
      { kind: 'abstain', reasonCode: 'NO_VISIBLE_PRIZE_SLOT' };
  }

  if (prompt.promptType === 'ConfirmPrompt' ||
      prompt.promptType === 'SelectPrompt' ||
      prompt.promptType === 'SelectOptionPrompt') {
    const no = choices.find(choice => /^(no|false|decline|cancel)$/i.test(choice.label ?? ''));
    const yes = choices.find(choice => /^(yes|true|confirm)$/i.test(choice.label ?? ''));
    if (context.includes('irresistible aroma') && no) {
      return { kind: 'select-choice', token: no.token };
    }
    if (context.includes('fragrant flower garden') && yes &&
        boardSlots(request.observation.ownPublic).some(row => row.pokemon.damage > 0)) {
      return { kind: 'select-choice', token: yes.token };
    }
    if (context.includes('treasure hunt') && yes && !ownItemLocked(request.observation)) {
      return { kind: 'select-choice', token: yes.token };
    }
    if (no) return { kind: 'select-choice', token: no.token };
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_OPTIONAL_PROMPT' };
  }

  return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
}

function bestAction(request, config = {}) {
  const items = list(request.actionFrontier?.items)
    .filter(item => EXECUTABLE.has(item.kind));
  if (items.length === 0) return { kind: 'abstain', reasonCode: 'NO_EXECUTABLE_ACTION' };

  let best = null;
  let bestScore = -1;
  for (const item of items) {
    const score = scoreAction(item, request, config);
    if (score > bestScore) {
      best = item;
      bestScore = score;
    }
  }
  if (best && bestScore > 0) return { kind: 'select-action', token: best.token };
  const pass = items.find(item => item.kind === 'pass');
  return pass ? { kind: 'select-action', token: pass.token } :
    { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ACTION' };
}

function createPolicy({ role, seat, policyVersion, config }) {
  const validConfig = config && typeof config === 'object' &&
    !Array.isArray(config) &&
    Object.keys(config).every(key => key === 'gladionPrizeIdentityProjection') &&
    (config.gladionPrizeIdentityProjection === undefined ||
      typeof config.gladionPrizeIdentityProjection === 'boolean');
  if (role !== 'opponent' || (seat !== 0 && seat !== 1) ||
      policyVersion !== POLICY_VERSION || !validConfig) {
    throw new Error('AGENT45_POLICY_INIT_MISMATCH');
  }
  const policyConfig = Object.freeze({
    gladionPrizeIdentityProjection: config.gladionPrizeIdentityProjection === true
  });

  return Object.freeze({
    decide(request) {
      if (!request || request.role !== 'opponent' || request.seat !== seat ||
          request.observation?.actorSeat !== seat) {
        return { kind: 'abstain', reasonCode: 'ROLE_SEAT_BINDING_MISMATCH' };
      }
      if (request.prompt !== null) return promptDecision(request, policyConfig);
      return bestAction(request, policyConfig);
    }
  });
}

module.exports = {
  POLICY_VERSION,
  createPolicy,
  scoreAction,
  scoreAttack,
  promptDecision,
  cardPriority,
  visibleSourceCopies,
  sourceCopyPossible,
  discardPriority,
  canUseGuzmaHalaMode0,
  peoniaSafeReplacementCount,
  gladionPrizePriority,
  lusamineRecoverableSupporters,
  PRINT
};
