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
  [PRINT.oddish, 2],
  [PRINT.lillipup, 2],
  [PRINT.pidgey, 2],
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
  // ownHand is already complete for the acting player. If the same hand is
  // publicly revealed, ownPublic.publicHand is a second view, not new cards.
  for (const zone of ['discard', 'lostZone', 'resolvingSupporter', 'stadium']) {
    count += countMatching(own[zone], pattern);
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
      !/^(?:Basic )?(?:Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy\b/i.test(energy)));
}

function printedAbilityLive(pokemon, abilityName) {
  if (!pokemon || !list(pokemon.abilities).includes(abilityName)) return false;
  const suppression = list(pokemon.abilitySuppressions).find(row =>
    row.abilityName === abilityName);
  return suppression?.suppressed !== true;
}

function opponentHasAbilityLock(player) {
  // Garbotoxin is Bench-capable but needs an attached Pokémon Tool.
  const garbotoxin = boardSlots(player).some(({ pokemon }) =>
    printedAbilityLive(pokemon, 'Garbotoxin') &&
    list(pokemon.tools).length > 0);
  if (garbotoxin) return true;
  const active = player?.active;
  // Wobbuffet PHF Bide Barricade and Weezing RCL Neutralizing Gas
  // only suppress other Pokémon while their owner occupies Active.
  return (matches(active?.printing ?? '', /^Wobbuffet PHF(?: |$)/i) &&
      printedAbilityLive(active, 'Bide Barricade')) ||
    (matches(active?.printing ?? '', /^Galarian Weezing RCL(?: |$)/i) &&
      printedAbilityLive(active, 'Neutralizing Gas'));
}

function opponentHasAnyEnergy(player) {
  return boardSlots(player).some(({ pokemon }) => list(pokemon.energies).length > 0);
}

function opponentHasFabaTarget(player) {
  return opponentHasSpecialEnergy(player) ||
    boardSlots(player).some(({ pokemon }) => list(pokemon.tools).length > 0) ||
    list(player?.stadium).length > 0;
}


function opposingAbilityLockAppliesTo(pokemon, observation) {
  if (!opponentHasAbilityLock(observation.opponentPublic)) return false;
  const own = observation.ownPublic ?? {};
  const other = observation.opponentPublic ?? {};
  const jammingTower = [...list(own.stadium), ...list(other.stadium)]
    .some(printing => /Jamming Tower/i.test(printing));
  const toolSuppressed = [own, other].some(player =>
    (player.publicTurnRestrictions?.
      stadiumAndToolHaveNoEffectTurnsRemaining ?? 0) > 0);
  const liveHood = !jammingTower && !toolSuppressed &&
    list(pokemon?.tools).some(tool => matches(tool, PRINT.stealthyHood));
  return !liveHood;
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

// The native prompt offers physical board-slot indices. Matching the first
// identical printing can act on a different Pokémon than the chosen token.
function choiceBoardPokemon(choice, observation) {
  const metadata = choice?.publicMetadata ?? {};
  if (metadata.isOwnerVisible === false) return null;
  const player = metadata.ownerSeat === 'actor' ? observation?.ownPublic :
    metadata.ownerSeat === 'opponent' ? observation?.opponentPublic : null;
  if (!player) return null;
  const zone = metadata.targetZone;
  const index = zone === 'bench' ? metadata.benchIndex :
    zone === 'active' ? metadata.slotIndex : null;
  if (!Number.isSafeInteger(index) || index < 0 ||
      (zone === 'active' && index !== 0)) return null;
  const pokemon = zone === 'bench' ? list(player.bench)[index] :
    zone === 'active' ? player.active : null;
  return pokemon && samePrinting(pokemon.printing, choicePrinting(choice)) ? pokemon : null;
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


function basicSetupWanted(observation) {
  const own=observation.ownPublic??{},hand=list(observation.ownHand);
  return [PRINT.oddish,PRINT.lillipup,PRINT.pidgey].some(pattern=>
    !boardHas(own,pattern)&&!hand.some(printing=>matches(printing,pattern))&&
    sourceCopyPossible(observation,pattern));
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
    opponentHasAbilityLock(observation.opponentPublic);
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
    // Taking the last deck card wins when the opponent next attempts to draw.
    // Do not spend this attack on a slower recursion line if Burrow is terminal.
    if (opponentDeck === 1) return 400;
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
    // Use the same matchup-aware target values as the subsequent prompt.
    // A root score based on a different name-only whitelist can otherwise
    // decline Get Lost immediately before its high-value Dragon payload cut.
    const ranked = opponentDiscard.map(printing =>
      cardPriority(printing, observation, 'get lost')).sort((a, b) => b - a);
    const first = ranked[0] ?? 0, second = ranked[1] ?? 0;
    const twoDecisive = first >= 200 && second >= 200;
    if (twoDecisive) return 190;
    if (first >= 200 && second >= 20) return 155;
    if (first >= 125 && second >= 125) return 141;
    if (first >= 125) return 95;
    return 22;
  }
  if (name === 'Itchy Pollen') {
    const itemLockLive = boardSlots(own).some(({ pokemon }) =>
      matches(pokemon.printing, PRINT.vileplume) &&
      !opposingAbilityLockAppliesTo(pokemon, observation));
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


function actionTargetPokemon(item, observation) {
  const meta = item?.publicMetadata ?? {};
  if (meta.targetSeat !== 'actor' || meta.isOwnerVisible !== true ||
      !Number.isSafeInteger(meta.targetIndex) || meta.targetIndex < 0) return null;
  const own = observation?.ownPublic ?? {};
  let pokemon;
  if (meta.targetZone === 'active' && meta.targetIndex === 0) {
    pokemon = own.active;
  } else if (meta.targetZone === 'bench') {
    pokemon = list(own.bench)[meta.targetIndex] ?? null;
  } else return null;
  return pokemon && samePrinting(pokemon.printing, item.targetPrinting) ? pokemon : null;
}


function attachmentScore(card, recipient, observation, zone) {
  if (!recipient || !['active','bench'].includes(zone)) return 0;
  const own=observation.ownPublic??{},opponent=observation.opponentPublic??{};
  if (matches(card,PRINT.tmEvolution)) {
    if(list(recipient.tools).length>0 || !hasK0PossibleBenchEvolutionTarget(observation))return 0;
    return matches(recipient.printing,PRINT.bunnelby) &&
      (zone==='active' || (zone==='bench'&&
      handCount(observation.ownHand,PRINT.jetEnergy)>0))?178:0;
  }
  if(matches(card,PRINT.captureEnergy)){
    const openSlot=list(own.bench).some(slot=>slot===null);
    const setup=basicSetupWanted(observation)||
      missingLinePriority(observation)>0;
    const activeBunnelby=zone==='active'&&
      matches(recipient.printing,PRINT.bunnelby)&&
      list(recipient.energies).length===0;
    if(openSlot&&setup)return activeBunnelby?136:120;
    if(activeBunnelby&&(opponent.deckCount??99)<=3)return 174;
    return 22;
  }
  if(matches(card,PRINT.jetEnergy)){
    if(zone==='bench'&&matches(recipient.printing,PRINT.bunnelby)&&
      list(recipient.tools).some(tool=>matches(tool,PRINT.tmEvolution))&&
      hasK0PossibleBenchEvolutionTarget(observation))return 225;
    if(zone==='bench'&&matches(recipient.printing,PRINT.stoutland))
      return opposingAbilityLockAppliesTo(recipient,observation)?0:198;
    return 80;
  }
  if(matches(card,PRINT.memoryEnergy)){
    const previous=list(recipient.evolutionPrintings).some(printing=>
      matches(printing,PRINT.lillipup));
    const equipped=list(recipient.energies).some(printing=>
      matches(printing,PRINT.memoryEnergy));
    if(matches(recipient.printing,PRINT.stoutland)&&previous&&!equipped)
      return zone==='active'?218:178;
    if(zone==='active'&&matches(recipient.printing,PRINT.bunnelby)&&
      list(recipient.energies).length===0)
      return (opponent.deckCount??99)<=3||(own.deckCount??99)<=3?174:64;
    return 0;
  }
  if(matches(card,PRINT.stealthyHood)){
    if(list(recipient.tools).length>0)return 0;
    const itemLock=matches(recipient.printing,PRINT.vileplume)||
      matches(recipient.printing,PRINT.gloom);
    const supporterLock=matches(recipient.printing,PRINT.stoutland);
    const engine=matches(recipient.printing,PRINT.pidgeot);
    if(!itemLock&&!supporterLock&&!engine)return 0;
    if(opponentHasAbilityLock(opponent)){
      if(itemLock)return 205;
      if(supporterLock)return zone==='active'?200:175;
      return 110;
    }
    return itemLock?65:0;
  }
  return 0;
}

function scoredAttachmentRoot(item,observation){
  const meta=item.publicMetadata??{};
  const recipient=actionTargetPokemon(item,observation);
  if(recipient)return attachmentScore(item.actorPrinting,recipient,observation,meta.targetZone);
  if(meta.targetSeat!==undefined||meta.targetZone!==undefined||
     meta.targetIndex!==undefined||item.targetPrinting!==undefined)return 0;
  const own=observation.ownPublic??{};
  const rows=[...(own.active?[{pokemon:own.active,zone:'active'}]:[]),
    ...list(own.bench).filter(Boolean).map(pokemon=>({pokemon,zone:'bench'}))];
  const best=Math.max(0,...rows.map(row=>
    attachmentScore(item.actorPrinting,row.pokemon,observation,row.zone)));
  return best>0?best-5:0;
}

function attachmentCardFromPrompt(prompt){
  const source=prompt?.source??{},printing=source.sourcePrinting;
  if(matches(printing,PRINT.tmEvolution)&&
    String(source.effectName??'').toLowerCase()!=='evolution')return printing;
  if(matches(printing,PRINT.jetEnergy)||matches(printing,PRINT.memoryEnergy)||
    matches(printing,PRINT.stealthyHood)||matches(printing,PRINT.captureEnergy))
    return printing;
  return null;
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
      const physicalTarget = boardSlots(own).find(row =>
        samePrinting(row.pokemon.printing, target))?.pokemon ?? null;
      const supporterLocked = opponent.publicTurnRestrictions?.supporterPlayLocked === true ||
        opposingAbilityLockAppliesTo(physicalTarget, observation);
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
    const canFetch = sourceCopyPossible(observation, PRINT.guzmaHala) &&
      canUseGuzmaHalaMode1(observation, {
        excludePatterns: [PRINT.tagCall], guzmaInHand: true
      });
    return ownItemLocked(observation) ? 0 : (canFetch ? 205 : 0);
  }
  if (matches(card, PRINT.guzmaHala)) {
    if (!supporterAvailable(observation)) return 0;
    // The printed effect always searches a Stadium. Discarding 2 additional
    // cards is optional and only unlocks Tool + Special Energy searches.
    const fullMode = canUseGuzmaHalaMode1(observation, {
      excludePatterns: [PRINT.guzmaHala], guzmaInHand: true
    });
    if (fullMode) return 215;
    const grandTreeLive = sourceCopyPossible(observation, PRINT.grandTree) &&
      !hand.some(printing => matches(printing, PRINT.grandTree)) &&
      hasK0PossibleGrandTreeTarget(observation);
    const artazonLive = sourceCopyPossible(observation, PRINT.artazon) &&
      !hand.some(printing => matches(printing, PRINT.artazon)) &&
      list(own.bench).some(slot => slot === null) &&
      (basicSetupWanted(observation) || missingLinePriority(observation) > 0);
    return grandTreeLive ? 118 : artazonLive ? 106 : 0;
  }
  if (matches(card, PRINT.tmEvolution) || matches(card, PRINT.jetEnergy) ||
      matches(card, PRINT.memoryEnergy) || matches(card, PRINT.stealthyHood) ||
      matches(card, PRINT.captureEnergy))
    return scoredAttachmentRoot(item, observation);
  if (matches(card, PRINT.counterGain)) {
    return ownBehindOnPrizes(observation) &&
      samePrinting(target, own.active?.printing) ? 190 : 0;
  }
  if (matches(card, PRINT.grandTree)) {
    const liveEvolution = hasUnevolvedBasicFromPriorTurn(own, observation.globalTurn) &&
      hasK0PossibleGrandTreeTarget(observation) && missingLinePriority(observation) > 0;
    if (liveEvolution) return 180;
    // This singleton Stadium is symmetric: do not activate it solely for
    // future value when the opponent could use it first.
    const disruptiveStadium = [...list(own.stadium), ...list(opponent.stadium)]
      .some(printing => /Path to the Peak|Jamming Tower|Silent Lab/i.test(printing));
    return disruptiveStadium ? 120 : 0;
  }
  if (matches(card, PRINT.artazon)) {
    const canUseNow = list(own.bench).some(slot => slot === null) &&
      (basicSetupWanted(observation) || missingLinePriority(observation) > 0);
    if (canUseNow) return 128;
    const disruptiveStadium = [...list(own.stadium), ...list(opponent.stadium)]
      .some(printing => /Path to the Peak|Jamming Tower|Silent Lab/i.test(printing));
    // Artazon is symmetric and replaces the current Stadium: do not spend
    // it on a full Bench unless it immediately dislodges a suppressor.
    return disruptiveStadium ? 95 : 0;
  }
  if (matches(card, PRINT.guzma)) {
    // Guzma's opponent gust is still meaningful with no own Bench; its
    // conditional second switch is skipped if no own replacement exists.
    // Native Supporter PlayCardAction may not carry a target until the prompt.
    const targetIndex = metadata.targetIndex;
    const targetPokemon = metadata.targetSeat === 'opponent' &&
      metadata.targetZone === 'bench' && Number.isSafeInteger(targetIndex) ?
      opponent.bench?.[targetIndex] : null;
    const targets = targetPokemon ? [targetPokemon] :
      metadata.targetSeat === undefined && metadata.targetZone === undefined ?
        list(opponent.bench).filter(Boolean) : [];
    if (targets.length === 0) return 0;
    return targets.some(pokemon => remainingHp(pokemon) > 0 &&
      remainingHp(pokemon) <= 90) ? 88 : 42;
  }
  if (matches(card, PRINT.faba)) return opponentHasFabaTarget(opponent) ? 94 : 0;
  if (matches(card, PRINT.plumeria)) {
    if (!opponentHasAnyEnergy(opponent)) return 0;
    const remaining = hand.slice();
    const index = Number.isSafeInteger(metadata.handIndex) &&
      matches(remaining[metadata.handIndex], PRINT.plumeria) ?
      metadata.handIndex : remaining.findIndex(value => matches(value, PRINT.plumeria));
    if (index < 0) return 0;
    remaining.splice(index, 1);
    const afterPlay = { ...observation, ownHand: remaining };
    const usable = remaining.filter(printing =>
      discardPriority({ printing }, afterPlay) >= 48);
    return usable.length >= 2 ? 78 : 0;
  }
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
      return opponentHasAbilityLock(observation.opponentPublic) && !hoodHeld ? 160 : 35;
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
  if (context.includes('grand tree')) {
    // Grand Tree has *two* separate deck-search continuations: Basic->Stage1
    // followed, if it evolved, by Stage1->Stage2. Both must be answered.
    if (matches(printing,PRINT.vileplume) && boardHas(own,PRINT.gloom))
      return 240;
    if (matches(printing,PRINT.stoutland) && boardHas(own,PRINT.herdier))
      return 220;
    if (matches(printing,PRINT.pidgeot) && boardHas(own,PRINT.pidgeotto))
      return 205;
    if (matches(printing,PRINT.vileplumeGx) && boardHas(own,PRINT.gloom))
      return 105;
    if (matches(printing,PRINT.gloom) && boardHas(own,PRINT.oddish))
      return 195;
    if (matches(printing,PRINT.herdier) && boardHas(own,PRINT.lillipup))
      return 188;
    if (matches(printing,PRINT.pidgeotto) && boardHas(own,PRINT.pidgey))
      return 175;
    return 0;
  }
  if (context.includes('technical machine: evolution')) {
    if (matches(printing, PRINT.gloom) && boardHas(own, PRINT.oddish)) return 195;
    if (matches(printing, PRINT.herdier) && boardHas(own, PRINT.lillipup)) return 188;
    if (matches(printing, PRINT.pidgeotto) && boardHas(own, PRINT.pidgey)) return 175;
    return 0;
  }
  if (context.includes('artazon') || context.includes('capture energy')) {
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
    const regidragoEstablished = boardSlots(observation.opponentPublic).some(
      ({ pokemon }) => /^Regidrago (?:VSTAR|V) SIT(?: \\d+)?/i.test(pokemon.printing));
    // The published Aichi Regidrago lists repeatedly use these Dragon
    // attack payloads in discard; Apex Dragon loses access if they are Lost.
    if (regidragoEstablished) {
      if (/^Dialga-GX UPR(?: \\d+)?/i.test(printing)) return observation.opponentPublic?.publicTurnRestrictions?.gxUsed === true ? 70 : 250;
      if (/^Dragapult ex TWM(?: \\d+)?/i.test(printing)) return 245;
      if (/^(?:Kyurem SFA|Noivern ex PAL|Hisuian Goodra VSTAR LOR|Koraidon ex TEF|Mega Dragonite ex ASC|Salamence ex JTG)(?: \\d+)?/i.test(printing)) return 215;
    }
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
  if (context.includes('faba')) {
    const opponent = observation.opponentPublic;
    const matchesSpecial = boardSlots(opponent).some(({ pokemon }) =>
      list(pokemon.energies).some(energy => samePrinting(energy, printing) &&
        !/^(?:Basic )?(?:Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy/i.test(energy)));
    const matchesTool = boardSlots(opponent).some(({ pokemon }) =>
      list(pokemon.tools).some(tool => samePrinting(tool, printing)));
    const matchesStadium = [...list(observation.ownPublic.stadium),
      ...list(opponent.stadium)].some(stadium => samePrinting(stadium, printing));
    return matchesSpecial ? 170 : matchesTool ? 150 : matchesStadium ? 125 : 0;
  }
  if (context.includes('plumeria')) {
    if (/Special Energy|Jet Energy|Capture Energy|Double Dragon Energy|Double Colorless Energy/i.test(printing)) return 160;
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
    if (matches(printing, PRINT.stealthyHood) && opponentHasAbilityLock(observation.opponentPublic)) return 125;
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

function discardPriority(choice, observation) {
  const printing = choicePrinting(choice);
  const hand = list(observation.ownHand);
  const copies = hand.filter(card => samePrinting(card, printing)).length;
  if (copies > 1) return 150 + copies;
  if (matches(printing, PRINT.tagCall) && handCount(hand, PRINT.guzmaHala) > 0) return 120;
  if (matches(printing, PRINT.oddish) && boardHas(observation.ownPublic, PRINT.oddish)) return 90;
  if (matches(printing, PRINT.lillipup) && boardHas(observation.ownPublic, PRINT.lillipup)) return 88;
  if (matches(printing, PRINT.pidgey) && boardHas(observation.ownPublic, PRINT.pidgey)) return 84;
  // The original fallback rated name-only singleton Supporters and Stage2
  // evolutions as junk. Those are the lock and recovery payloads, not costs.
  const criticalSingleton = [
    PRINT.guzmaHala, PRINT.guzma, PRINT.cassius, PRINT.faba, PRINT.plumeria,
    PRINT.lusamine, PRINT.karen, PRINT.bellelba, PRINT.teamYell, PRINT.gladion,
    PRINT.peonia, PRINT.vileplume, PRINT.vileplumeGx, PRINT.stoutland,
    PRINT.pidgeot, PRINT.gloom, PRINT.herdier, PRINT.pidgeotto
  ];
  if (criticalSingleton.some(pattern => matches(printing, pattern))) return 0;
  // The first Basic of a missing setup line must enter play, not the discard.
  if ([PRINT.oddish, PRINT.lillipup, PRINT.pidgey, PRINT.bunnelby].some(pattern =>
    matches(printing, pattern) && !boardHas(observation.ownPublic, pattern)))
    return 0;
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

function scorePokemonChoice(choice, observation, context, attachmentCard = null) {
  const printing = choicePrinting(choice);
  const owner = choiceOwner(choice);
  const zone = choiceZone(choice);
  if (attachmentCard) {
    if (owner !== 'actor' || !['active','bench'].includes(zone)) return -100;
    const recipient = choiceBoardPokemon(choice, observation);
    return recipient ?
      attachmentScore(attachmentCard, recipient, observation, zone) : -100;
  }
  const guzmaPrompt = context.includes('guzma') && !context.includes('guzma & hala');
  const plumeriaPrompt = context.includes('plumeria');
  const fabaPrompt = context.includes('faba');
  const opponentChoice = context.includes('irresistible aroma') ||
    plumeriaPrompt || fabaPrompt;
  // Guzma has two different prompts: opposing Bench first, then own Bench.
  if (guzmaPrompt ? !['actor', 'opponent'].includes(owner) :
      (owner && owner !== (opponentChoice ? 'opponent' : 'actor'))) return -100;
  if (zone && zone !== 'bench' && !context.includes('irresistible aroma') &&
      !plumeriaPrompt && !fabaPrompt && !context.includes('cassius') &&
      !context.includes('grand tree')) return -100;
  if (fabaPrompt) {
    if (owner !== 'opponent' || !['active', 'bench'].includes(zone)) return -100;
    const target = choiceBoardPokemon(choice, observation);
    if (!target) return -100;
    const specials = list(target.energies).filter(printing =>
      /Energy/i.test(printing) &&
      !/^(?:Basic )?(?:Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy/i.test(printing));
    const tools = list(target.tools);
    if (specials.length === 0 && tools.length === 0) return -100;
    return 110 + (specials.length ? 70 : 0) + (tools.length ? 30 : 0) +
      (zone === 'active' ? 10 : 0);
  }
  if (plumeriaPrompt) {
    if (owner !== 'opponent' || !['active', 'bench'].includes(zone)) return -100;
    const target = choiceBoardPokemon(choice, observation);
    const attached = list(target?.energies);
    if (attached.length === 0) return -100;
    const special = attached.some(printing => !
      /^(?:Basic )?(?:Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy/i.test(printing));
    return 100 + (special ? 70 : 0) + (zone === 'active' ? 20 : 0) + attached.length;
  }
  if (guzmaPrompt) {
    const target = choiceBoardPokemon(choice, observation);
    if (!target || zone !== 'bench') return -100;
    if (owner === 'actor') {
      // On the mandatory self-switch, preserve the main lock when its
      // Ability is live. Otherwise prefer a Bunnelby attack/mill pivot.
      if (matches(printing, PRINT.stoutland)) {
        return opposingAbilityLockAppliesTo(target, observation) ? 20 : 190;
      }
      if (matches(printing, PRINT.bunnelby)) {
        return observation.opponentPublic?.deckCount <= 8 ? 180 : 160;
      }
      if (matches(printing, PRINT.budew)) return 80;
      return 30;
    }
    const hp = remainingHp(target);
    const multiPrize = /(?:-GX|\b(?:V|VMAX|VSTAR|ex)\b)/i.test(printing) ? 2 : 1;
    return 100 + (hp > 0 && hp <= 90 ? 50 : 0) + multiPrize * 8;
  }
  if (context.includes('cassius')) {
    const target = choiceBoardPokemon(choice, observation);
    if (!target) return -100;
    return remainingHp(target) > 0 &&
      remainingHp(target) <= 50 ? 160 : 15;
  }
  if (context.includes('grand tree')) {
    const target = choiceBoardPokemon(choice, observation);
    if (!target || !grandTreeTargetPossible(observation, target)) return -100;
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


function engineSetupDecision(request) {
  const prompt=request.prompt, meta=prompt?.publicMetadata??{}, source=prompt?.source??{};
  const abstain=reasonCode=>({kind:'abstain',reasonCode});
  if(request.observation?.phase!==1) return abstain('UNSUPPORTED_ENGINE_SETUP_PHASE');
  if(source.classification!=='actor-choice'||source.sourceKind!=='engine'||
     source.sourcePrinting!==null||source.effectName!==prompt.description)
    return abstain('UNTRUSTED_ENGINE_SETUP_PROMPT');
  const choices=list(prompt.choices);
  if(prompt.description==='CHOOSE_STARTING_POKEMONS'&&prompt.promptType==='ChooseCardsPrompt') {
    if(meta.selectionType!=='card-combination'||meta.sourceZone!=='hand'||
       meta.ownerSeat!=='actor'||meta.isOwnerVisible!==true||meta.isSecret!==false||
       meta.allowCancel!==false||![0,1].includes(meta.minimumCount)||
       !Number.isSafeInteger(meta.maximumCount)||
       meta.maximumCount<meta.minimumCount||meta.maximumCount>6)
      return abstain('BAD_STARTING_POKEMON_SETUP_PROMPT');
    const selected=[]; let empty=null,last=-1;
    for(const choice of choices) {
      if(choice.kind==='empty-selection') {
        if(empty) return abstain('BAD_STARTING_POKEMON_EMPTY_CHOICE');
        empty=choice;continue;
      }
      const m=choice.publicMetadata??{};
      if(choice.kind!=='card'||typeof choice.printing!=='string'||
         choice.label!==choice.printing||!Number.isSafeInteger(m.selectionIndex)||
         m.selectionIndex<=last||m.selectedCount!==1||
         m.sourceZone!=='hand'||m.ownerSeat!=='actor'||m.isOwnerVisible!==true)
        return abstain('UNTRUSTED_STARTING_POKEMON_CHOICE');
      last=m.selectionIndex;
      selected.push({token:choice.token,printing:choice.printing,index:m.selectionIndex});
    }
    if(meta.minimumCount===0&&selected.length===0)
      return empty&&empty.label==='Choose no items'?
        {kind:'select-choice',token:empty.token}:abstain('NO_STARTING_POKEMON_CHOICE');
    // The first selected Basic becomes Active. Hand order is not a strategy:
    // leading a first-turn Bunnelby enables Barrage/Technical Machine: Evolution.
    // Do not automatically fill all five Bench slots with incidental Basics;
    // this deck needs room for three distinct evolution lines and a pivot.
    const setupHand=list(request.observation?.ownHand);
    const hasStageBasic=selected.some(row=>
      [PRINT.oddish,PRINT.lillipup,PRINT.pidgey].some(p=>matches(row.printing,p)));
    const hasFanCall=selected.some(row=>matches(row.printing,PRINT.fanRotom));
    const tm=setupHand.some(card=>matches(card,PRINT.tmEvolution));
    const energy=setupHand.some(card=>
      matches(card,PRINT.jetEnergy)||matches(card,PRINT.captureEnergy)||
      matches(card,PRINT.memoryEnergy)||matches(card,PRINT.grassEnergy));
    const immediateEvolutionRoute=tm&&energy&&(hasStageBasic||hasFanCall);
    // Budew's Itchy Pollen is a guaranteed zero-Energy one-turn Item lock.
    // Prefer it to an idle Bunnelby only with a complete observed hand and no
    // directly funded TM Evolution attack route for the opening turn.
    const budewLockLead=setupHand.length>=7&&!immediateEvolutionRoute&&
      selected.some(row=>matches(row.printing,PRINT.budew))&&
      selected.some(row=>matches(row.printing,PRINT.bunnelby));
    const activeRank=printing=>
      matches(printing,PRINT.budew)&&budewLockLead?440:
      matches(printing,PRINT.bunnelby)?400:
      matches(printing,PRINT.budew)?380:
      matches(printing,PRINT.fanRotom)?360:
      matches(printing,PRINT.girafarig)?280:
      matches(printing,PRINT.jirachi)?270:
      matches(printing,PRINT.relicanth)?260:
      matches(printing,PRINT.mrMime)?240:
      matches(printing,PRINT.lillipup)?220:
      matches(printing,PRINT.pidgey)?210:
      matches(printing,PRINT.oddish)?200:100;
    const active=selected.slice().sort((a,b)=>
      activeRank(b.printing)-activeRank(a.printing)||a.index-b.index)[0];
    if(!active) return abstain('INSUFFICIENT_STARTING_POKEMON_CHOICES');
    const tokens=[active.token],used=new Set(tokens);
    // Four starting Bench occupants at most leaves one emergency/pivot slot.
    // A second copy of an already represented Basic stays in hand.
    const desiredBench=budewLockLead?
      [PRINT.oddish,PRINT.lillipup,PRINT.bunnelby,PRINT.fanRotom,
        PRINT.pidgey,PRINT.relicanth]:
      [PRINT.oddish,PRINT.lillipup,PRINT.pidgey,
        PRINT.fanRotom,PRINT.relicanth,PRINT.bunnelby];
    for(const pattern of desiredBench) {
      if(tokens.length>=Math.min(meta.maximumCount,5))break;
      if(matches(active.printing,pattern))continue;
      const candidate=selected.find(row=>!used.has(row.token)&&
        matches(row.printing,pattern));
      if(candidate){tokens.push(candidate.token);used.add(candidate.token);}
    }
    return tokens.length>=meta.minimumCount&&tokens.length<=meta.maximumCount?
      {kind:'select-choices',tokens}:abstain('INSUFFICIENT_STARTING_POKEMON_CHOICES');
  }
  if(prompt.description==='GO_FIRST'&&prompt.promptType==='ConfirmPrompt'){
    if(meta.selectionType!=='confirm'||choices.length!==2||
       choices.filter(c=>c.kind==='confirm'&&c.label==='Yes').length!==1||
       choices.filter(c=>c.kind==='confirm'&&c.label==='No').length!==1)
      return abstain('BAD_GO_FIRST_SETUP_PROMPT');
    // Rank-2 Bunnelby's T1 TM Evolution attack becomes available going second.
    return {kind:'select-choice',token:choices.find(c=>c.label==='No').token};
  }
  if(prompt.description==='WANT_TO_DRAW_CARDS'&&prompt.promptType==='SelectPrompt'){
    if(meta.selectionType!=='option'||meta.allowCancel!==false||
       !Number.isSafeInteger(meta.count)||meta.count<1)
      return abstain('BAD_MULLIGAN_DRAW_SETUP_PROMPT');
    const seen=new Set();let best=null;
    for(const choice of choices){
      const i=choice.publicMetadata?.choiceIndex;
      if(choice.kind!=='option'||!Number.isSafeInteger(i)||i<0||
         i>=meta.count||seen.has(i)||
         choice.label!=='Draw '+(meta.count-1-i)+' card(s)')
        return abstain('BAD_MULLIGAN_DRAW_CHOICE_INDEX');
      seen.add(i);if(!best||i<best.publicMetadata.choiceIndex)best=choice;
    }
    return best?{kind:'select-choice',token:best.token}:abstain('NO_MULLIGAN_DRAW_OPTION');
  }
  return abstain('UNSUPPORTED_ENGINE_SETUP_PROMPT');
}

function promptDecision(request) {
  if (['CHOOSE_STARTING_POKEMONS','GO_FIRST','WANT_TO_DRAW_CARDS'].includes(request.prompt?.description)) {
    return engineSetupDecision(request);
  }
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
    const tmEvolutionAttack = matches(prompt.source?.sourcePrinting, PRINT.tmEvolution) &&
      String(prompt.source?.effectName ?? '').toLowerCase() === 'evolution';
    const grandTreeSearch = matches(prompt.source?.sourcePrinting,PRINT.grandTree) &&
      String(prompt.source?.effectName ?? '').toLowerCase() === 'grand tree';
    const recognizedCardSource = tmEvolutionAttack || grandTreeSearch || context.includes('tag call') ||
      context.includes('fan call') || context.includes('guzma & hala') ||
      context.includes('artazon') || context.includes('capture energy') ||
      context.includes('rototiller') ||
      context.includes('get lost') || context.includes('quick search') ||
      context.includes('air mail') || context.includes('treasure hunt') ||
      context.includes('team yell') || context.includes('lusamine') ||
      context.includes('faba') || context.includes('plumeria');
    if ((selectionType === 'card-combination' || selectionType === 'card-order') &&
        !recognizedCardSource) {
      return { kind: 'abstain', reasonCode: 'UNSUPPORTED_CARD_COMBINATION_SOURCE' };
    }
    let ranked;
    if (selectionType === 'pokemon') {
      ranked = rankedChoices(choices,
        choice => scorePokemonChoice(choice, request.observation, context,
          attachmentCardFromPrompt(prompt)), max)
        .filter(row => row.score > 0);
    } else if (selectionType === 'card-combination') {
      const discardPrompt = (context.includes('guzma & hala') ||
        context.includes('plumeria')) &&
        choices.some(choice => choiceZone(choice) === 'hand');
      if (!discardPrompt && context.includes('guzma & hala')) {
        const selected = guzmaHalaSearchSelection(choices, request.observation, min, max);
        return selected ? { kind: 'select-choices', tokens: selected } :
          { kind: 'abstain', reasonCode: 'NO_USEFUL_CARD_CHOICE' };
      }
      ranked = rankedChoices(choices, choice => {
        if (discardPrompt) return discardPriority(choice, request.observation);
        return cardPriority(choicePrinting(choice), request.observation, context);
      }, max);
      // Do not force protected singleton Evolutions or Supporters into a
      // discard cost merely to meet the prompt's requested card count.
      ranked = ranked.filter(row => row.score >= (discardPrompt ? 48 : 1));
    } else if (selectionType === 'energy-payment') {
      const required = typeof metadata.energyType === 'string' ?
        Math.max(min, metadata.energyType.split(',').filter(Boolean).length) : min;
      ranked = rankedChoices(choices, choice => {
        const printing = choicePrinting(choice);
        if (context.includes('plumeria')) {
          return /^(?:Basic )?(?:Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy\b/i.test(printing) ? 5 : 100;
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
      return emptyOrAbstain(prompt, choices, 'NO_SUPPORTED_CARD_SELECTION');
    }
    if (tokens.length > 0) return { kind: 'select-choices', tokens };
    return emptyOrAbstain(prompt, choices, 'NO_SUPPORTED_CARD_SELECTION');
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
    return { kind: 'abstain', reasonCode: 'UNRECOGNIZED_SIMPLE_PROMPT' };
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
    return { kind: 'abstain', reasonCode: 'UNRECOGNIZED_SIMPLE_PROMPT' };
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

// Multi-select prompts require select-choices, including single-target cases.
function currentPromptDecision(prompt,decision) {
  if(!prompt||decision?.kind!=='select-choice')return decision;
  const selected=prompt.choices.find(choice=>choice.token===decision.token);
  if(!selected||selected.kind==='cancel'||selected.kind==='empty-selection')return decision;
  if(['card-combination','pokemon','energy-payment','prize-slots','card-order'].includes(prompt.publicMetadata?.selectionType))
    return {kind:'select-choices',tokens:[decision.token]};
  return decision;
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
      if (request.prompt !== null) return currentPromptDecision(request.prompt,promptDecision(request));
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
