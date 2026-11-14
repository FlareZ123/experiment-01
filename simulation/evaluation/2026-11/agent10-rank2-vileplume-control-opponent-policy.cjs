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

const POLICY_VERSION = 'agent10-rank2-vileplume-control-opponent-v1';

const PRINT = Object.freeze({
  oddish: /^Oddish UNB(?: \\d+)?\\b/i,
  gloom: /^Gloom UNB(?: \\d+)?\\b/i,
  vileplume: /^Vileplume AOR(?: \\d+)?\\b/i,
  vileplumeGx: /^Vileplume-GX CEC(?: \\d+)?\\b/i,
  lillipup: /^Lillipup CEC(?: \\d+)?\\b/i,
  herdier: /^Herdier SUM(?: \\d+)?\\b/i,
  stoutland: /^Stoutland BCR(?: \\d+)?\\b/i,
  pidgey: /^Pidgey MEW(?: \\d+)?\\b/i,
  pidgeotto: /^Pidgeotto TEU(?: \\d+)?\\b/i,
  pidgeot: /^Pidgeot ex OBF(?: \\d+)?\\b/i,
  bunnelby: /^Bunnelby PRC(?: \\d+)?\\b/i,
  fanRotom: /^Fan Rotom SCR(?: \\d+)?\\b/i,
  relicanth: /^Relicanth TEF(?: \\d+)?\\b/i,
  mrMime: /^Mr\. Mime PLF(?: \\d+)?\\b/i,
  girafarig: /^Girafarig LOT(?: \\d+)?\\b/i,
  budew: /^Budew ASC(?: \\d+)?\\b/i,
  jirachi: /^Jirachi XYP(?: \\d+)?\\b/i,
  tagCall: /^Tag Call CEC(?: \\d+)?\\b/i,
  guzmaHala: /^Guzma & Hala CEC(?: \\d+)?\\b/i,
  tmEvolution: /^Technical Machine: Evolution PAR(?: \\d+)?\\b/i,
  grandTree: /^Grand Tree SCR(?: \\d+)?\\b/i,
  artazon: /^Artazon PAL(?: \\d+)?\\b/i,
  jetEnergy: /^Jet Energy PAL(?: \\d+)?\\b/i,
  captureEnergy: /^Capture Energy RCL(?: \\d+)?\\b/i,
  memoryEnergy: /^Memory Energy LOT(?: \\d+)?\\b/i,
  stealthyHood: /^Stealthy Hood UNB(?: \\d+)?\\b/i,
  grassEnergy: /^Grass Energy MEE(?: \\d+)?\\b/i,
  guzma: /^Guzma BUS(?: \\d+)?\\b/i,
  cassius: /^Cassius XY(?: \\d+)?\\b/i,
  karen: /^Karen XYP(?: \\d+)?\\b/i,
  plumeria: /^Plumeria BUS(?: \\d+)?\\b/i,
  gladion: /^Gladion CIN(?: \\d+)?\\b/i,
  faba: /^Faba LOT(?: \\d+)?\\b/i,
  lusamine: /^Lusamine CIN(?: \\d+)?\\b/i,
  bellelba: /^Bellelba & Brycen-Man CEC(?: \\d+)?\\b/i,
  peonia: /^Peonia CRE(?: \\d+)?\\b/i,
  teamYell: /^Team Yell's Cheer BRS(?: \\d+)?\\b/i,
  counterGain: /^Counter Gain SSP(?: \\d+)?\\b/i
});

const EXECUTABLE = new Set([
  'play-card', 'attack', 'retreat', 'use-ability', 'use-stadium', 'pass'
]);

function list(value) {
  return Array.isArray(value) ? value : [];
}

function canonicalPrinting(value) {
  return typeof value === 'string' ? value.replace(/ \\d+$/, '') : '';
}

function samePrinting(left, right) {
  return canonicalPrinting(left) === canonicalPrinting(right);
}

function matches(value, pattern) {
  return typeof value === 'string' && pattern.test(value);
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
  const preLockSetupStillNeeded = !ownItemLocked(observation) && hand.some(value =>
    matches(value, PRINT.tagCall) || matches(value, PRINT.tmEvolution) ||
    (matches(value, PRINT.stealthyHood) &&
      opponentHasGarbotoxin(observation.opponentPublic)) ||
    (matches(value, PRINT.counterGain) && ownBehindOnPrizes(observation)) ||
    (matches(value, PRINT.guzmaHala) && supporterAvailable(observation)));
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

function scoreAction(item, request) {
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
      return hasUnevolvedBasicFromPriorTurn(own, observation.globalTurn) &&
        missingLinePriority(observation) > 0 ? 190 : 25;
    }
    if (matches(stadium, PRINT.artazon)) {
      return list(own.bench).some(slot => slot === null) &&
        missingLinePriority(observation) > 0 ? 118 : 35;
    }
    return 0;
  }

  if (item.kind === 'retreat') {
    if (matches(target, PRINT.stoutland)) {
      const supporterLocked = opponent.publicTurnRestrictions?.supporterPlayLocked === true ||
        opponentHasGarbotoxin(opponent);
      return supporterLocked ? 0 : 185;
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
    return ownItemLocked(observation) ? 0 :
      (handCount(hand, PRINT.guzmaHala) === 0 ? 205 : 128);
  }
  if (matches(card, PRINT.guzmaHala)) {
    if (!supporterAvailable(observation)) return 0;
    const needToolOrEnergy = handCount(hand, PRINT.tmEvolution) === 0 ||
      handCount(hand, PRINT.jetEnergy) === 0;
    const needStage2 = !boardHas(own, PRINT.vileplume) ||
      !boardHas(own, PRINT.stoutland) || !boardHas(own, PRINT.pidgeot);
    return needToolOrEnergy || needStage2 ? 215 : 145;
  }
  if (matches(card, PRINT.tmEvolution)) {
    const bunnelby = boardSlots(own).some(row => matches(row.pokemon.printing, PRINT.bunnelby));
    const bunnelbyActive = matches(own.active?.printing ?? '', PRINT.bunnelby);
    const hasJet = handCount(hand, PRINT.jetEnergy) > 0;
    const targetReady = boardSlots(own).some(row =>
      matches(row.pokemon.printing, PRINT.oddish) ||
      matches(row.pokemon.printing, PRINT.lillipup) ||
      matches(row.pokemon.printing, PRINT.pidgey) ||
      matches(row.pokemon.printing, PRINT.gloom) ||
      matches(row.pokemon.printing, PRINT.herdier) ||
      matches(row.pokemon.printing, PRINT.pidgeotto));
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
    return discardCount(own, PRINT.guzmaHala) > 0 ||
      discardCount(own, PRINT.grandTree) > 0 ? 98 : 45;
  }
  if (matches(card, PRINT.karen)) {
    return ownDeckLow(observation) && list(own.discard).some(value =>
      /Pokémon/i.test(value)) ? 88 : 10;
  }
  if (matches(card, PRINT.bellelba)) {
    return opponent.deckCount <= (own.deckCount ?? 99) - 5 ? 82 : 5;
  }
  if (matches(card, PRINT.gladion) || matches(card, PRINT.peonia)) return 0;
  return 0;
}

function cardPriority(printing, observation, context) {
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
    if (matches(printing, PRINT.grandTree)) return 160;
    if (matches(printing, PRINT.tmEvolution)) return handCount(hand, PRINT.tmEvolution) === 0 ? 150 : 75;
    if (matches(printing, PRINT.counterGain) && ownBehindOnPrizes(observation)) return 135;
    if (matches(printing, PRINT.jetEnergy)) return 155;
    if (matches(printing, PRINT.stealthyHood)) {
      return opponentHasGarbotoxin(observation.opponentPublic) ? 145 :
        (boardHas(own, PRINT.vileplume) ? 80 : 35);
    }
    if (matches(printing, PRINT.artazon)) return 90;
    if (matches(printing, PRINT.captureEnergy)) return 85;
    if (matches(printing, PRINT.memoryEnergy)) return boardHas(own, PRINT.stoutland) ? 80 : 45;
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
    if (matches(printing, PRINT.grandTree)) return 110;
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
    if (/Guzma & Hala|Guzma|Faba|Plumeria|Karen|Team Yell|Lusamine|Bellelba/i.test(printing)) return 150;
    if (/Grand Tree|Artazon/i.test(printing)) return 120;
    return 0;
  }
  if (context.includes('faba') || context.includes('plumeria')) {
    if (/Special Energy|Jet Energy|Capture Energy|Double Dragon Energy|Double Colorless Energy/i.test(printing)) return 160;
    if (/Tool|Pokémon Tool|Stadium|Grand Tree|Artazon/i.test(printing)) return 110;
    return 0;
  }

  // Pidgeot ex Quick Search and Pidgeotto Air Mail are unrestricted searches.
  if (context.includes('quick search') || context.includes('air mail')) {
  if (matches(printing, PRINT.vileplume) && !boardHas(own, PRINT.vileplume)) return 160;
  if (matches(printing, PRINT.stoutland) && !boardHas(own, PRINT.stoutland)) return 155;
  if (matches(printing, PRINT.pidgeot) && !boardHas(own, PRINT.pidgeot)) return 140;
  if (matches(printing, PRINT.gloom) && !boardHas(own, PRINT.gloom)) return 125;
  if (matches(printing, PRINT.herdier) && !boardHas(own, PRINT.herdier)) return 120;
  if (matches(printing, PRINT.pidgeotto) && !boardHas(own, PRINT.pidgeotto)) return 110;
  if (matches(printing, PRINT.oddish) && !boardHas(own, PRINT.oddish)) return 100;
  if (matches(printing, PRINT.lillipup) && !boardHas(own, PRINT.lillipup)) return 96;
  if (matches(printing, PRINT.pidgey) && !boardHas(own, PRINT.pidgey)) return 90;
  if (matches(printing, PRINT.jetEnergy) && handCount(hand, PRINT.jetEnergy) === 0) return 85;
  if (matches(printing, PRINT.tmEvolution) && handCount(hand, PRINT.tmEvolution) === 0) return 80;
  if (matches(printing, PRINT.counterGain) && ownBehindOnPrizes(observation)) return 95;
  if (matches(printing, PRINT.grandTree)) return 75;
  if (matches(printing, PRINT.guzmaHala)) return 70;
  if (matches(printing, PRINT.teamYell) || matches(printing, PRINT.lusamine)) return 60;
  }
  return 0;
}

function discardPriority(choice, observation) {
  const printing = choicePrinting(choice);
  const hand = list(observation.ownHand);
  const copies = hand.filter(card => samePrinting(card, printing)).length;
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

function scorePokemonChoice(choice, observation, context) {
  const printing = choicePrinting(choice);
  const owner = choiceOwner(choice);
  const zone = choiceZone(choice);
  const opponentChoice = context.includes('guzma') || context.includes('irresistible aroma');
  if (owner && owner !== (opponentChoice ? 'opponent' : 'actor')) return -100;
  if (zone && zone !== 'bench' && !context.includes('irresistible aroma') &&
      !context.includes('cassius')) return -100;
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
    if (matches(printing, PRINT.oddish)) return 140;
    if (matches(printing, PRINT.lillipup)) return 135;
    if (matches(printing, PRINT.pidgey)) return 125;
    return 0;
  }
  if (context.includes('evolution') || context.includes('technical machine')) {
    if (matches(printing, PRINT.gloom)) return 180;
    if (matches(printing, PRINT.herdier)) return 172;
    if (matches(printing, PRINT.pidgeotto)) return 160;
    if (matches(printing, PRINT.oddish)) return 145;
    if (matches(printing, PRINT.lillipup)) return 138;
    if (matches(printing, PRINT.pidgey)) return 128;
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

function promptDecision(request) {
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
      context.includes('faba') || context.includes('plumeria');
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
        context.includes('plumeria')) &&
        choices.some(choice => choiceZone(choice) === 'hand');
      ranked = rankedChoices(choices, choice => {
        if (discardPrompt) return discardPriority(choice, request.observation);
        return cardPriority(choicePrinting(choice), request.observation, context);
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
      ranked = rankedChoices(choices, choice =>
        Number.isSafeInteger(choice.publicMetadata?.choiceIndex) ?
          -choice.publicMetadata.choiceIndex : 0, required);
    } else {
      ranked = rankedChoices(choices,
        choice => cardPriority(choicePrinting(choice), request.observation, context), max);
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

  if (prompt.promptType === 'ChooseAttackPrompt') {
    if (!context.includes('memory dive') && !context.includes('relicanth')) {
      return { kind: 'abstain', reasonCode: 'UNSUPPORTED_ATTACK_CHOICE_SOURCE' };
    }
    const choice = choices.slice().sort((a, b) => {
      const name = row => row.publicMetadata?.sourceAttack ?? row.label ?? '';
      const score = value => {
        if (value === 'Baby-Doll Eyes') return 125;
        if (value === 'Burrow') return 110;
        if (value === 'Rototiller') return ownDeckLow(request.observation) ? 150 : 35;
        if (value === 'Itchy Pollen') return 115;
        return 20;
      };
      return score(name(b)) - score(name(a));
    })[0];
    return choice ? { kind: 'select-choice', token: choice.token } :
      { kind: 'abstain', reasonCode: 'NO_VISIBLE_ATTACK_CHOICE' };
  }

  if (prompt.promptType === 'ChoosePrizePrompt') {
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

function bestAction(request) {
  const items = list(request.actionFrontier?.items)
    .filter(item => EXECUTABLE.has(item.kind));
  if (items.length === 0) return { kind: 'abstain', reasonCode: 'NO_EXECUTABLE_ACTION' };

  let best = null;
  let bestScore = -1;
  for (const item of items) {
    const score = scoreAction(item, request);
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
  if (role !== 'opponent' || (seat !== 0 && seat !== 1) ||
      policyVersion !== POLICY_VERSION || !config ||
      Object.keys(config).length !== 0) {
    throw new Error('AGENT10_POLICY_INIT_MISMATCH');
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
  createPolicy,
  scoreAction,
  scoreAttack,
  promptDecision,
  cardPriority
};
