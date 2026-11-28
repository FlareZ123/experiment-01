'use strict';

/*
 * Rank-3 Snorlax Stall opponent-role policy, version 1.2.
 *
 * This is a deterministic actor-view-only prototype, not a competent-policy
 * attestation. It is bound to the exact rank-3 source inventory and the
 * current Hood Shield v1 challenger. Unsupported or ambiguous prompts abstain.
 * Native Store legality remains authoritative.
 */

const POLICY_VERSION = 'agent17-rank3-snorlax-stall-opponent-v1.4-development';
const SOURCE_RANK = 3;
const SOURCE_LIST_BLOB_SHA1 = 'ae773f6201d7aa69d31914dbfee66f3fba692200';
const SOURCE_FINGERPRINT_SHA256 = '0a2cf5a36c4a8b813cf8e1b8889893356427ac33cd5fa73a576a35590c3da368';
const CANDIDATE_FINGERPRINT_SHA256 = '1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4';
const ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const WORKER_PROTOCOL_BLOB_SHA1 = 'd51ea95c457d61b50a9ee114d342eb17f4350451';

const PRINT = Object.freeze({
  snorlax: /^Snorlax PGO(?: 0?55)?$/i,
  wobbuffet: /^Wobbuffet PHF(?: 0?36)?$/i,
  dialga: /^Dialga-GX UPR(?: 100)?$/i,
  stunfisk: /^Galarian Stunfisk SSH 132\b/i,
  regirock: /^Regirock XYP 49\b/i,
  mimikyu: /^Mimikyu PAL 97\b/i,
  girafarig: /^Girafarig LOT 94\b/i,
  bunnelby: /^Bunnelby PRC 121\b/i,
  articuno: /^Articuno-GX CES(?: 31)?$/i,
  rotom: /^Rotom V LOR 58\b/i,
  plumeria: /^Plumeria BUS 120\b/i,
  arven: /^Arven OBF(?: 186)?$/i,
  teamFlare: /^Team Flare Grunt XY 129\b/i,
  teammates: /^Teammates PRC 141\b/i,
  lusamine: /^Lusamine CIN 96\b/i,
  handiwork: /^Team Rocket's Handiwork FCO 112\b/i,
  gladion: /^Gladion CIN 95\b/i,
  guzma: /^Guzma BUS(?: 115)?$/i,
  faba: /^Faba LOT 173\b/i,
  penny: /^Penny SVI 183\b/i,
  eri: /^Eri TEF 146\b/i,
  lillie: /^Lillie's Determination MEG 119\b/i,
  nestBall: /^Nest Ball SVI 181\b/i,
  vsSeeker: /^VS Seeker PHF(?: 109)?$/i,
  enhancedHammer: /^Enhanced Hammer TWM 148\b/i,
  trainersMail: /^Trainers' Mail ROS 92\b/i,
  counterCatcher: /^Counter Catcher PAR(?: 160)?$/i,
  scoopCyclone: /^Scoop Up Cyclone TWM 162\b/i,
  quickBall: /^Quick Ball FST 237\b/i,
  heavyBall: /^Hisuian Heavy Ball ASR 146\b/i,
  nightStretcher: /^Night Stretcher ASC 196\b/i,
  floatStone: /^Float Stone BKT 137\b/i,
  stealthyHood: /^Stealthy Hood UNB(?: 186)?$/i,
  toolJammer: /^Tool Jammer BST(?: 136)?$/i,
  forestSealStone: /^Forest Seal Stone SIT 156\b/i,
  tropicalBeach: /^Tropical Beach BWP 50\b/i,
  playersCeremony: /^Player's Ceremony SP 127\b/i,
  temple: /^Temple of Sinnoh ASR 155\b/i,
  captureEnergy: /^Capture Energy RCL 171\b/i,
  waterEnergy: /^Water Energy\b/i
});

const SOURCE_COPIES = Object.freeze([
  [PRINT.snorlax, 3], [PRINT.stunfisk, 2], [PRINT.regirock, 1],
  [PRINT.mimikyu, 1], [PRINT.girafarig, 1], [PRINT.bunnelby, 1],
  [PRINT.articuno, 1], [PRINT.rotom, 1],
  [PRINT.plumeria, 4], [PRINT.arven, 4], [PRINT.teamFlare, 2],
  [PRINT.teammates, 2], [PRINT.lusamine, 2], [PRINT.handiwork, 1],
  [PRINT.gladion, 1], [PRINT.guzma, 1], [PRINT.faba, 1], [PRINT.penny, 1],
  [PRINT.eri, 1], [PRINT.lillie, 1], [PRINT.nestBall, 3], [PRINT.vsSeeker, 3],
  [PRINT.enhancedHammer, 2], [PRINT.trainersMail, 2], [PRINT.counterCatcher, 2],
  [PRINT.scoopCyclone, 1], [PRINT.quickBall, 1], [PRINT.heavyBall, 1],
  [PRINT.nightStretcher, 1], [PRINT.floatStone, 1], [PRINT.stealthyHood, 1],
  [PRINT.toolJammer, 1], [PRINT.forestSealStone, 1], [PRINT.tropicalBeach, 1],
  [PRINT.playersCeremony, 1], [PRINT.temple, 1], [PRINT.captureEnergy, 3],
  [PRINT.waterEnergy, 2]
]);

const EXECUTABLE = new Set([
  'play-card', 'attack', 'retreat', 'use-ability', 'use-stadium', 'pass'
]);
const ITEM_PATTERNS = [
  PRINT.nestBall, PRINT.vsSeeker, PRINT.enhancedHammer, PRINT.trainersMail,
  PRINT.counterCatcher, PRINT.scoopCyclone, PRINT.quickBall, PRINT.heavyBall,
  PRINT.nightStretcher
];
const TOOL_PATTERNS = [PRINT.toolJammer, PRINT.floatStone, PRINT.stealthyHood, PRINT.forestSealStone];
const BASIC_SEARCH_PATTERNS = Object.freeze([
  PRINT.snorlax, PRINT.stunfisk, PRINT.regirock, PRINT.mimikyu,
  PRINT.girafarig, PRINT.bunnelby, PRINT.articuno, PRINT.rotom
]);

// The fixed candidate's VS Seeker can recover Supporters from discard. It cannot
// recover spent Items such as VS Seeker or Night Stretcher themselves.
const CANDIDATE_RECOVERABLE_SUPPORTER_PRIORITIES = Object.freeze([
  { pattern: /^Arven SVI 166\b/i, score: 280 },
  { pattern: /^Guzma BUS 115\b/i, score: 270 },
  { pattern: /^Acerola BUS 112\b/i, score: 260 },
  { pattern: /^Raihan EVS 152\b/i, score: 250 },
  { pattern: /^Teammates PRC 141\b/i, score: 240 },
  { pattern: /^Pokémon Ranger STS 104\b/i, score: 230 },
  { pattern: /^Iono PAL 185\b/i, score: 220 },
  { pattern: /^Lillie's Determination MEG 119\b/i, score: 210 }
]);

const VS_SEEKER_SUPPORTER_PATTERNS = Object.freeze([
  PRINT.arven, PRINT.plumeria, PRINT.teamFlare, PRINT.teammates,
  PRINT.lusamine, PRINT.handiwork, PRINT.gladion, PRINT.guzma,
  PRINT.faba, PRINT.penny, PRINT.eri, PRINT.lillie
]);

const LUSAMINE_TARGET_PATTERNS = Object.freeze([
  PRINT.arven, PRINT.plumeria, PRINT.teamFlare, PRINT.teammates, PRINT.lusamine,
  PRINT.handiwork, PRINT.gladion, PRINT.guzma, PRINT.faba, PRINT.penny, PRINT.eri,
  PRINT.lillie, PRINT.tropicalBeach, PRINT.playersCeremony, PRINT.temple
]);
// Despite pre-Scarlet & Violet card-pool metadata listing both Item and
// Pokémon Tool, the current rules treat older Pokémon Tools only as Tools.
// In particular, Eri cannot discard Forest Seal Stone (SIT 156).
const ERI_ITEM_PATTERNS = [
  /^Field Blower GRI 125\b/i,
  /^Unfair Stamp TWM 165\b/i,
  /^Mysterious Treasure FLI 113\b/i,
  /^Fog Crystal CRE 140\b/i,
  PRINT.vsSeeker,
  PRINT.nightStretcher,
  /^Battle Compressor PHF 92\b/i,
  PRINT.quickBall,
  PRINT.heavyBall
];

function list(value) {
  return Array.isArray(value) ? value : [];
}

function valueText(value) {
  if (typeof value === 'string') return value;
  if (typeof value?.printing === 'string') return value.printing;
  if (typeof value?.fullName === 'string') return value.fullName;
  if (typeof value?.label === 'string') return value.label;
  return '';
}

function matches(value, pattern) {
  return pattern.test(valueText(value));
}

function slots(player) {
  return [
    { zone: 'active', index: 0, pokemon: player?.active ?? null },
    ...list(player?.bench).map((pokemon, index) => ({ zone: 'bench', index, pokemon }))
  ].filter(row => row.pokemon && row.pokemon.concealed !== true);
}

function boardHas(player, pattern) {
  return slots(player).some(row => matches(row.pokemon.printing, pattern));
}

function boardCount(player, pattern) {
  return slots(player).filter(row => matches(row.pokemon.printing, pattern)).length;
}

function hasTool(pokemon, pattern) {
  return list(pokemon?.tools).some(tool => matches(tool, pattern));
}

function boardHasTool(player, pattern) {
  return slots(player).some(row => hasTool(row.pokemon, pattern));
}

function energyCount(pokemon) {
  return list(pokemon?.energies).length;
}

function playerEnergyCount(player) {
  return slots(player).reduce((total, row) => total + energyCount(row.pokemon), 0);
}

function opponentHasSpecialEnergy(player) {
  return slots(player).some(row => list(row.pokemon.energies).some(energy =>
    /Energy/i.test(valueText(energy)) &&
    !/^(?:Basic )?(?:Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal) Energy\b/i.test(valueText(energy))
  ));
}

function opponentPublicHand(observation) {
  return list(observation?.opponentPublic?.publicHand);
}

function opponentHasVisibleItem(observation) {
  return opponentPublicHand(observation).some(card =>
    ERI_ITEM_PATTERNS.some(pattern => matches(card, pattern))
  );
}

function opponentHasTool(observation, pattern) {
  return slots(observation?.opponentPublic).some(row => hasTool(row.pokemon, pattern));
}

function opponentHasAnyTool(observation) {
  return TOOL_PATTERNS.some(pattern => opponentHasTool(observation, pattern));
}

function stadiumsInPlay(observation) {
  return [
    ...list(observation?.ownPublic?.stadium),
    ...list(observation?.opponentPublic?.stadium)
  ];
}

function hasStadium(observation, pattern) {
  return stadiumsInPlay(observation).some(card => matches(card, pattern));
}

function ownActive(observation) {
  return observation?.ownPublic?.active ?? null;
}

function opponentActive(observation) {
  return observation?.opponentPublic?.active ?? null;
}

function ownDeckCount(observation) {
  return Number.isSafeInteger(observation?.ownPublic?.deckCount) ?
    observation.ownPublic.deckCount : 99;
}

function opponentDeckCount(observation) {
  return Number.isSafeInteger(observation?.opponentPublic?.deckCount) ?
    observation.opponentPublic.deckCount : 99;
}

function remainingHp(pokemon) {
  if (!pokemon || !Number.isFinite(pokemon.hp) || !Number.isFinite(pokemon.damage)) return -1;
  return pokemon.hp - pokemon.damage;
}

function supporterAvailable(observation) {
  const resources = observation?.ownTurnResources ?? {};
  return resources.supporterPlayedTurn === 0 &&
    resources.supporterPlayLocked !== true &&
    observation?.ownPublic?.publicTurnRestrictions?.supporterPlayLocked !== true;
}

function itemLocked(observation) {
  return observation?.ownTurnResources?.itemPlayLocked === true ||
    observation?.ownPublic?.publicTurnRestrictions?.itemPlayLocked === true;
}

function gxUsed(observation) {
  return observation?.ownTurnResources?.gxUsed === true ||
    observation?.ownPublic?.publicTurnRestrictions?.gxUsed === true;
}

function visibleOwnCards(observation) {
  const own = observation?.ownPublic ?? {};
  const visible = [
    ...list(observation?.ownHand),
    ...list(own.discard),
    ...list(own.lostZone),
    ...list(own.resolvingSupporter),
    ...list(own.stadium)
  ];
  for (const row of slots(own)) {
    const pokemon = row.pokemon;
    visible.push(pokemon.printing, ...list(pokemon.evolutionPrintings),
      ...list(pokemon.tools), ...list(pokemon.energies));
  }
  return visible;
}

function sourceCopiesRemaining(observation, pattern) {
  const entry = SOURCE_COPIES.find(([candidate]) => candidate === pattern);
  if (!entry) return 0;
  const seen = visibleOwnCards(observation).filter(card => matches(card, pattern)).length;
  return Math.max(0, entry[1] - seen);
}

function hasUnseenArvenSearchTargets(observation) {
  // A zero remainder proves there is no Item/Tool target outside visible zones.
  // A positive remainder is only a possibility because unknown Prizes are hidden.
  const itemPossible = ITEM_PATTERNS.some(pattern => sourceCopiesRemaining(observation, pattern) > 0);
  const toolPossible = TOOL_PATTERNS.some(pattern => sourceCopiesRemaining(observation, pattern) > 0);
  // Arven's native min=0 search can take just one category if the other is gone.
  return itemPossible || toolPossible;
}

function hasUnseenBasicSearchTargets(observation) {
  // A zero remainder proves no Basic Pokémon can remain in the deck.
  return BASIC_SEARCH_PATTERNS.some(pattern => sourceCopiesRemaining(observation, pattern) > 0);
}

function hasNightStretcherTargets(observation) {
  return list(observation.ownPublic?.discard).some(card =>
    BASIC_SEARCH_PATTERNS.some(pattern => matches(card, pattern)) ||
    matches(card, PRINT.waterEnergy)
  );
}

function hasBasicBenchSpace(observation) {
  return list(observation?.ownPublic?.bench).some(slot => slot === null);
}

function opponentActiveEnergy(observation) {
  return energyCount(opponentActive(observation));
}

function opponentDiscardHasRecoverableSupporter(observation) {
  return list(observation?.opponentPublic?.discard).some(card =>
    CANDIDATE_RECOVERABLE_SUPPORTER_PRIORITIES.some(entry => matches(card, entry.pattern))
  );
}

function lusamineTargetCount(observation) {
  return list(observation?.ownPublic?.discard).filter(card =>
    LUSAMINE_TARGET_PATTERNS.some(pattern => matches(card, pattern))
  ).length;
}

function opponentSpecialEnergyCount(observation) {
  return slots(observation?.opponentPublic).reduce((total, row) =>
    total + list(row.pokemon.energies).filter(energy =>
      /Energy/i.test(valueText(energy)) &&
      !/^(?:Basic )?(?:Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal) Energy\b/i.test(valueText(energy))
    ).length, 0);
}

function scorePlayersCeremonyUse(observation) {
  const handSize = list(observation?.ownHand).length;
  const deckCount = ownDeckCount(observation);
  if (deckCount <= 2 || handSize > 5) return 0;
  const baseScores = [95, 90, 80, 65, 50, 35];
  const opponentHandCount = Number.isSafeInteger(observation?.opponentPublic?.handCount) ?
    observation.opponentPublic.handCount : null;
  const sharedDrawPenalty = opponentHandCount !== null && opponentHandCount <= 2 ? 15 : 0;
  const thinDeckPenalty = deckCount <= 4 ? 20 : 0;
  return Math.max(0, baseScores[handSize] - sharedDrawPenalty - thinDeckPenalty);
}

function scorePlayersCeremonyPlay(observation) {
  // Do not replace an already useful Stadium; this shared effect is optional.
  if (stadiumsInPlay(observation).length > 0) return 0;
  const useScore = scorePlayersCeremonyUse(observation);
  return useScore > 0 ? Math.max(0, useScore - 10) : 0;
}

// Rank-3 exact-pair tactical slice. Both fixed candidate 60s contain only
// Basic Psychic Energy; Dialga-GX UPR 100 requires Metal for every attack.
// The native frontier remains the authority for action legality. These
// scores are policy hypotheses, not a proof that the opponent cannot escape.
function activeTargetIsActorSnorlax(item, observation) {
  const meta = item.publicMetadata ?? {};
  return meta.targetSeat === 'actor' && meta.targetZone === 'active' &&
    matches(item.targetPrinting ?? '', PRINT.snorlax) &&
    matches(observation.ownPublic?.active?.printing ?? '', PRINT.snorlax);
}

function opponentWobbuffetActive(observation) {
  return matches(observation.opponentPublic?.active?.printing ?? '', PRINT.wobbuffet);
}

function liveToolWindow(observation) {
  return [observation.ownPublic, observation.opponentPublic].every(player =>
    !(player?.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining > 0));
}

function snorlaxHoodWindow(observation) {
  const own = observation.ownPublic?.active;
  const opposing = observation.opponentPublic?.active;
  if (!matches(own?.printing ?? '', PRINT.snorlax) ||
      !opponentWobbuffetActive(observation) ||
      !liveToolWindow(observation) ||
      hasTool(opposing, PRINT.stealthyHood) ||
      list(own?.tools).length > 0 ||
      !Number.isFinite(own?.damage) || remainingHp(own) <= 0 ||
      !slots(observation.opponentPublic).some(row => row.zone === 'bench')) return false;
  // Do not spend the singleton Hood to trap a Wobbuffet that is already
  // prevented from retreating by a visible attack/status effect.
  if (opposing?.publicRestrictions?.cannotRetreat === true ||
      opposing?.publicRestrictions?.cannotRetreatNextTurn === true ||
      opposing?.publicRestrictions?.cannotRetreatWhileActive === true) return false;
  // Psychic Assault: 10 + existing damage (no modifiers in the two fixed
  // candidate lists for this exact attacker/defender pairing). One ordinary
  // attachment on the next turn is possible. This is a conservative veto,
  // not a complete opponent-action prediction.
  if (energyCount(opposing) >= 1 && 10 + own.damage >= remainingHp(own)) return false;
  return true;
}

function accessibleHoodThisTurn(observation) {
  const hand = list(observation.ownHand);
  if (hand.some(card => matches(card, PRINT.stealthyHood))) return true;
  if (sourceCopiesRemaining(observation, PRINT.stealthyHood) === 0 ||
      !supporterAvailable(observation) || !hasUnseenArvenSearchTargets(observation)) return false;
  if (hand.some(card => matches(card, PRINT.arven))) return true;
  return !itemLocked(observation) &&
    hand.some(card => matches(card, PRINT.vsSeeker)) &&
    list(observation.ownPublic?.discard).some(card => matches(card, PRINT.arven));
}

function attacklessDialga(pokemon) {
  return matches(pokemon?.printing ?? '', PRINT.dialga) &&
    list(pokemon?.energies).every(energy => /^(?:Basic )?Psychic Energy\b/i.test(valueText(energy)));
}

// Block's prohibition is on the opposing Active Pokémon. Conservatively
// decline a Hood-protected trap unless the exact active Snorlax has a live
// Tool Jammer, which suppresses that Active Pokémon's Hood. Tool-off epochs
// suppress both Tools, so an attached Hood does not itself prevent Block.
function dialgaBlockWorks(observation, snorlax, dialga) {
  return matches(snorlax?.printing ?? '', PRINT.snorlax) && attacklessDialga(dialga) &&
    (!liveToolWindow(observation) || !hasTool(dialga, PRINT.stealthyHood) ||
      hasTool(snorlax, PRINT.toolJammer));
}

function dialgaTrapHeld(observation) {
  return dialgaBlockWorks(observation, observation.ownPublic?.active,
    observation.opponentPublic?.active);
}

function dialgaTrapAvailable(observation, viaGuzma = false) {
  const own = observation.ownPublic;
  const opponent = observation.opponentPublic;
  if (dialgaTrapHeld(observation) || matches(opponent?.active?.printing ?? '', PRINT.dialga)) return false;
  const eligible = viaGuzma
    ? slots(own).filter(row => row.zone === 'bench' && matches(row.pokemon.printing, PRINT.snorlax))
    : slots(own).filter(row => row.zone === 'active' && matches(row.pokemon.printing, PRINT.snorlax));
  // When Guzma will later need to distinguish duplicate Snorlax printings,
  // only claim a Hooded-Dialga trap if every possible Snorlax promotion
  // restores Block; this avoids relying on an ambiguous target projection.
  return eligible.length > 0 && slots(opponent).some(row => row.zone === 'bench' &&
    eligible.every(s => dialgaBlockWorks(observation, s.pokemon, row.pokemon)));
}

function scoreSearchCard(printing, observation, context = '') {
  const own = observation.ownPublic;
  const opponent = observation.opponentPublic ?? {};
  if (matches(printing, PRINT.stealthyHood) &&
      ['arven', 'trainers-mail', 'star-alchemy', 'teammates', ''].includes(context)) {
    return snorlaxHoodWindow(observation) &&
      !list(observation.ownHand).some(card => matches(card, PRINT.stealthyHood)) ? 280 : 0;
  }
  if (context === 'basic-search') return scoreBasicPlay(printing, observation);
  if (context === 'night-stretcher') {
    if ([PRINT.snorlax, PRINT.bunnelby, PRINT.girafarig, PRINT.articuno, PRINT.rotom]
      .some(pattern => matches(printing, pattern))) return scoreBasicPlay(printing, observation);
    return matches(printing, PRINT.waterEnergy) ? 60 : 0;
  }
  if (context === 'vs-seeker') {
    if (matches(printing, PRINT.faba)) {
      return opponentHasAnyTool(observation) ||
        opponentHasSpecialEnergy(observation.opponentPublic) ||
        stadiumsInPlay(observation).length > 0 ? 220 : 0;
    }
    if (matches(printing, PRINT.plumeria)) {
      return playerEnergyCount(observation.opponentPublic) > 0 &&
        list(observation.ownHand).length >= 3 ? 190 : 0;
    }
    if (matches(printing, PRINT.teamFlare)) return opponentActiveEnergy(observation) > 0 ? 190 : 0;
    if (matches(printing, PRINT.handiwork)) return opponentDeckCount(observation) <= 15 ? 175 : 95;
    if (matches(printing, PRINT.guzma)) {
      return slots(observation.opponentPublic).some(row => row.zone === 'bench') ? 175 : 0;
    }
    if (matches(printing, PRINT.eri)) {
      const opponentHandCount = Number.isSafeInteger(observation.opponentPublic?.handCount) ?
        observation.opponentPublic.handCount : 0;
      return opponentHasVisibleItem(observation) ? 155 :
        opponentHandCount >= 3 ? 135 : opponentHandCount >= 1 ? 90 : 0;
    }
    if (matches(printing, PRINT.lusamine)) {
      const targets = lusamineTargetCount(observation);
      return targets >= 2 ? 180 : targets === 1 ? 100 : 0;
    }
    if (matches(printing, PRINT.arven)) return hasUnseenArvenSearchTargets(observation) ?
      (!boardHasTool(own, PRINT.toolJammer) ? 155 : 95) : 0;
    if (matches(printing, PRINT.lillie)) return list(observation.ownHand).length <= 3 ? 130 : 0;
    if (matches(printing, PRINT.penny)) {
      return slots(own).some(row => row.pokemon.damage > 0 &&
        row.pokemon.printed?.stage === 'BASIC') ? 100 : 0;
    }
    if (matches(printing, PRINT.gladion)) return 75;
    return 0;
  }
  if (context === 'trainers-mail') {
    if (matches(printing, PRINT.faba)) {
      return opponentHasAnyTool(observation) ||
        opponentHasSpecialEnergy(observation.opponentPublic) ||
        stadiumsInPlay(observation).length > 0 ? 190 : 0;
    }
    if (matches(printing, PRINT.arven)) return hasUnseenArvenSearchTargets(observation) ? 190 : 0;
    if (matches(printing, PRINT.plumeria)) {
      return playerEnergyCount(observation.opponentPublic) > 0 &&
        list(observation.ownHand).length >= 3 ? 170 : 0;
    }
    if (matches(printing, PRINT.teamFlare)) return opponentActiveEnergy(observation) > 0 ? 170 : 0;
    if (matches(printing, PRINT.handiwork)) return opponentDeckCount(observation) <= 15 ? 155 : 95;
    if (matches(printing, PRINT.guzma)) {
      return slots(observation.opponentPublic).some(row => row.zone === 'bench') ? 155 : 0;
    }
    if (matches(printing, PRINT.lusamine)) {
      const targets = lusamineTargetCount(observation);
      return targets >= 2 ? 155 : targets === 1 ? 100 : 0;
    }
    if (matches(printing, PRINT.eri)) {
      const opponentHandCount = Number.isSafeInteger(observation.opponentPublic?.handCount) ?
        observation.opponentPublic.handCount : 0;
      return opponentHasVisibleItem(observation) ? 160 :
        opponentHandCount >= 3 ? 135 : opponentHandCount >= 1 ? 90 : 0;
    }
    if (matches(printing, PRINT.lillie)) return list(observation.ownHand).length <= 3 ? 120 : 0;
    if (matches(printing, PRINT.penny)) {
      return slots(own).some(row => row.pokemon.damage > 0 &&
        row.pokemon.printed?.stage === 'BASIC') ? 90 : 0;
    }
    if (matches(printing, PRINT.gladion)) return 75;
    if (matches(printing, PRINT.counterCatcher)) {
      return own.prizeCount > opponent.prizeCount &&
        slots(opponent).some(row => row.zone === 'bench') ? 135 : 0;
    }
    if (matches(printing, PRINT.nightStretcher)) {
      return hasNightStretcherTargets(observation) ? 125 : 0;
    }
    if (ITEM_PATTERNS.some(pattern => matches(printing, pattern))) return 125;
    if (TOOL_PATTERNS.some(pattern => matches(printing, pattern))) return 115;
    return 0;
  }
  if (context === 'get-lost') {
    const recoveryTarget = CANDIDATE_RECOVERABLE_SUPPORTER_PRIORITIES.find(entry =>
      matches(printing, entry.pattern)
    );
    return recoveryTarget?.score ?? 0;
  }
  if (context === 'land-maker') {
    if (matches(printing, PRINT.tropicalBeach)) return 230;
    if (matches(printing, PRINT.temple)) return 190;
    if (matches(printing, PRINT.playersCeremony)) return 150;
    return 0;
  }
  if (matches(printing, PRINT.toolJammer)) {
    return !boardHasTool(own, PRINT.toolJammer) ? 230 : 45;
  }
  if (matches(printing, PRINT.faba)) {
    return opponentHasAnyTool(observation) ||
      opponentHasSpecialEnergy(observation.opponentPublic) ||
      stadiumsInPlay(observation).length > 0 ? 190 : 75;
  }
  if (matches(printing, PRINT.lusamine)) {
    const targets = lusamineTargetCount(observation);
    return targets >= 2 ? 155 : targets === 1 ? 100 : 35;
  }
  if (matches(printing, PRINT.forestSealStone)) {
    return !boardHasTool(own, PRINT.forestSealStone) && boardHas(own, PRINT.rotom) ? 165 : 65;
  }
  if (matches(printing, PRINT.snorlax)) {
    return !boardHas(own, PRINT.snorlax) ? 205 : 70;
  }
  if (matches(printing, PRINT.bunnelby)) {
    return !boardHas(own, PRINT.bunnelby) ? 180 : 55;
  }
  if (matches(printing, PRINT.girafarig)) {
    return !boardHas(own, PRINT.girafarig) ? 165 : 40;
  }
  if (matches(printing, PRINT.mimikyu)) {
    return !boardHas(own, PRINT.mimikyu) ? 150 : 35;
  }
  if (matches(printing, PRINT.rotom)) {
    return !boardHas(own, PRINT.rotom) && list(observation.ownHand).length <= 5 ? 135 : 35;
  }
  if (matches(printing, PRINT.plumeria)) {
    return playerEnergyCount(observation.opponentPublic) > 0 &&
      list(observation.ownHand).length >= 3 ? 170 : 60;
  }
  if (matches(printing, PRINT.teamFlare)) {
    return opponentActiveEnergy(observation) > 0 ? 155 : 55;
  }
  if (matches(printing, PRINT.handiwork)) {
    return opponentDeckCount(observation) <= 15 ? 160 : 95;
  }
  if (matches(printing, PRINT.guzma)) {
    return !matches(own.active?.printing ?? '', PRINT.snorlax) &&
      boardHas(own, PRINT.snorlax) ? 185 : 85;
  }
  if (matches(printing, PRINT.vsSeeker)) {
    return list(own.discard).some(card =>
      [PRINT.faba, PRINT.plumeria, PRINT.teamFlare, PRINT.handiwork, PRINT.guzma, PRINT.eri]
        .some(pattern => matches(card, pattern))) ? 150 : 55;
  }
  if (matches(printing, PRINT.tropicalBeach)) {
    return !hasStadium(observation, PRINT.tropicalBeach) &&
      list(observation.ownHand).length <= 6 ? 145 : 45;
  }
  if (matches(printing, PRINT.floatStone)) {
    return !boardHasTool(own, PRINT.floatStone) ? 125 : 30;
  }
  if (matches(printing, PRINT.trainersMail)) return 105;
  if (matches(printing, PRINT.nestBall) || matches(printing, PRINT.quickBall)) {
    return hasBasicBenchSpace(observation) ? 95 : 20;
  }
  if (matches(printing, PRINT.nightStretcher)) {
    return hasNightStretcherTargets(observation) ? 115 : 0;
  }
  if (matches(printing, PRINT.enhancedHammer)) {
    return opponentSpecialEnergyCount(observation) > 0 ? 130 : 0;
  }
  if (matches(printing, PRINT.temple)) {
    return opponentHasSpecialEnergy(observation.opponentPublic) ? 140 : 0;
  }
  if (matches(printing, PRINT.eri)) {
    return opponentHasVisibleItem(observation) ? 155 : 45;
  }
  if (matches(printing, PRINT.lillie)) {
    return list(observation.ownHand).length <= 3 ? 120 : 30;
  }
  if (matches(printing, PRINT.playersCeremony)) return 0;
  return context ? 10 : 0;
}

function scoreBasicPlay(printing, observation) {
  const own = observation.ownPublic;
  if (matches(printing, PRINT.snorlax)) {
    return matches(own.active?.printing ?? '', PRINT.snorlax) ? 20 :
      boardHas(own, PRINT.snorlax) ? 65 : 160;
  }
  if (matches(printing, PRINT.bunnelby)) return boardHas(own, PRINT.bunnelby) ? 55 : 120;
  if (matches(printing, PRINT.girafarig)) return boardHas(own, PRINT.girafarig) ? 35 : 110;
  if (matches(printing, PRINT.mimikyu)) {
    // PAL 97 Safeguard prevents attack damage from Pokémon ex AND Pokémon V.
    // Lowercase ex is intentional: the older Pokémon-EX mechanic is distinct.
    // This is only a benching heuristic, not a universal damage/lock evaluator.
    const opponentHasProtectedAttacker = slots(observation.opponentPublic).some(row =>
      /(?:^| )V(?:MAX|STAR|-UNION)?(?: |$)/.test(row.pokemon.printing) ||
      /(?:^| )ex(?: |$)/.test(row.pokemon.printing));
    return !boardHas(own, PRINT.mimikyu) && opponentHasProtectedAttacker ? 135 : 0;
  }
  if (matches(printing, PRINT.rotom)) return boardHas(own, PRINT.rotom) ? 25 : 100;
  if (matches(printing, PRINT.articuno)) return boardHas(own, PRINT.articuno) ? 25 : 85;
  if (matches(printing, PRINT.stunfisk)) return boardHas(own, PRINT.stunfisk) ? 25 : 75;
  if (matches(printing, PRINT.regirock)) return boardHas(own, PRINT.regirock) ? 10 : 45;
  return 0;
}

function scoreAttack(item, observation) {
  const name = item.attackName ?? '';
  const own = observation.ownPublic;
  const opponent = observation.opponentPublic;
  const activeHp = remainingHp(opponent.active);

  if (name === 'Burrow') {
    return opponentDeckCount(observation) <= 10 ? 165 :
      opponentDeckCount(observation) <= 20 ? 135 : 105;
  }
  if (name === 'Get Lost') {
    if (opponentDiscardHasRecoverableSupporter(observation)) return 150;
    return list(opponent.discard).length > 0 ? 65 : 10;
  }
  if (name === 'Rototiller') {
    const recoverable = list(own.discard).some(card =>
      [PRINT.faba, PRINT.handiwork, PRINT.plumeria, PRINT.teamFlare, PRINT.tropicalBeach, PRINT.toolJammer]
        .some(pattern => matches(card, pattern)));
    return ownDeckCount(observation) <= 8 && recoverable ? 110 : recoverable ? 45 : 5;
  }
  if (name === 'Cold Crush-GX') {
    return !gxUsed(observation) && opponentActiveEnergy(observation) >= 2 &&
      energyCount(own.active) <= 1 ? 185 : 0;
  }
  if (name === 'Collapse') {
    if (dialgaTrapHeld(observation)) {
      // A nonlethal hit enables Acerola on previously undamaged Dialga;
      // a non-winning KO frees the opponent to promote a real attacker.
      // Keep the stall unless this very attack wins by prizes/no Pokémon.
      const winsNow = activeHp > 0 && activeHp <= 150 &&
        (own.prizeCount <= 2 || !slots(opponent).some(row => row.zone === 'bench'));
      return winsNow ? 1000 : 0;
    }
    return activeHp > 0 && activeHp <= 150 ? 175 : 85;
  }
  if (name === 'Ice Wing') return activeHp > 0 && activeHp <= 130 ? 155 : 90;
  if (name === 'Damage Rush') return 70;
  if (name === 'Ghost Eye') return activeHp > 0 && activeHp <= 70 ? 155 : 65;
  if (name === 'Land Maker') {
    return list(own.discard).some(card => matches(card, PRINT.tropicalBeach) || matches(card, PRINT.temple)) ? 100 : 40;
  }
  if (name === 'Stone Edge') return activeHp > 0 && activeHp <= 80 ? 100 : 55;
  if (name === 'Mind Shock') return 60;
  if (name === 'Tail Trickery') return 45;
  if (name === 'Scrap Short') return 45;
  return 0;
}

function scoreAction(item, request) {
  const observation = request.observation;
  const own = observation.ownPublic;
  const opponent = observation.opponentPublic;
  const metadata = item.publicMetadata ?? {};
  const card = item.actorPrinting ?? '';
  const target = item.targetPrinting ?? '';
  const hand = list(observation.ownHand);

  if (!EXECUTABLE.has(item.kind)) return -1;
  if (item.kind === 'pass') return 0;
  if (item.kind === 'attack') return scoreAttack(item, observation);

  if (item.kind === 'use-ability') {
    const ability = metadata.abilityName ?? '';
    if (ability === 'Instant Charge') {
      return matches(item.actorPrinting ?? '', PRINT.rotom) &&
        hand.length <= 4 && ownDeckCount(observation) > 3 &&
        !hasStadium(observation, PRINT.tropicalBeach) ? 115 : 0;
    }
    if (ability === 'Star Alchemy') {
      if (!matches(item.actorPrinting ?? '', PRINT.forestSealStone)) return 0;
      return observation.ownTurnResources?.vstarUsed !== true &&
        (!boardHasTool(own, PRINT.toolJammer) ||
          !list(own.discard).some(x => matches(x, PRINT.faba))) ? 170 : 45;
    }
    return 0;
  }

  if (item.kind === 'use-stadium') {
    const stadium = card || metadata.stadiumPrinting || '';
    if (matches(stadium, PRINT.tropicalBeach)) {
      return hand.length <= 5 && ownDeckCount(observation) > 5 ? 110 : 0;
    }
    if (matches(stadium, PRINT.temple)) {
      return opponentHasSpecialEnergy(opponent) ? 100 : 0;
    }
    if (matches(stadium, PRINT.playersCeremony)) return scorePlayersCeremonyUse(observation);
    return 0;
  }

  if (item.kind === 'retreat') {
    if (matches(target, PRINT.snorlax)) {
      const targetSlot = publicRootTargetSlot(item,own);
      return hasTool(targetSlot?.pokemon, PRINT.toolJammer) ? 180 :
        opponentHasAnyTool(observation) ? 140 : 110;
    }
    if (matches(own.active?.printing ?? '', PRINT.snorlax)) {
      return (own.active.damage ?? 0) >= 100 ? 75 : 5;
    }
    return 15;
  }

  if (item.kind !== 'play-card') return 0;

  if (metadata.cardType === 'pokemon' ||
      [PRINT.snorlax, PRINT.stunfisk, PRINT.regirock, PRINT.mimikyu,
        PRINT.girafarig, PRINT.bunnelby, PRINT.articuno, PRINT.rotom]
        .some(pattern => matches(card, pattern))) {
    return scoreBasicPlay(card, observation);
  }

  if (matches(card, PRINT.waterEnergy)) {
    const targetSlot = publicRootTargetSlot(item,own);
    if (!targetSlot) return 0;
    if (matches(targetSlot.pokemon.printing, PRINT.articuno)) {
      return energyCount(targetSlot.pokemon) < 2 ?
        (opponentActiveEnergy(observation) >= 2 ? 190 : 145) : 20;
    }
    if (matches(targetSlot.pokemon.printing, PRINT.bunnelby) ||
        matches(targetSlot.pokemon.printing, PRINT.girafarig)) {
      return energyCount(targetSlot.pokemon) === 0 ? 125 : 20;
    }
    if (matches(targetSlot.pokemon.printing, PRINT.snorlax)) {
      return energyCount(targetSlot.pokemon) < 4 ? 65 : 5;
    }
    return 25;
  }
  if (matches(card, PRINT.captureEnergy)) {
    const targetSlot = publicRootTargetSlot(item,own);
    if (!targetSlot) return 0;
    if (matches(targetSlot.pokemon.printing, PRINT.bunnelby) ||
        matches(targetSlot.pokemon.printing, PRINT.girafarig)) {
      return energyCount(targetSlot.pokemon) === 0 ? 165 : 70;
    }
    if (matches(targetSlot.pokemon.printing, PRINT.snorlax)) {
      return targetSlot.zone === 'active' ? 150 : 105;
    }
    if (matches(targetSlot.pokemon.printing, PRINT.articuno)) {
      return energyCount(targetSlot.pokemon) === 0 ? 125 : 55;
    }
    return 45;
  }
  if (matches(card, PRINT.forestSealStone)) {
    if (observation.ownTurnResources?.vstarUsed === true) return 0;
    return matches(target, PRINT.rotom) && !boardHasTool(own, PRINT.forestSealStone) ? 180 : 40;
  }
  if (matches(card, PRINT.toolJammer)) {
    // Jammer cannot restore Block. Preserve the Active Tool slot while a
    // held or immediately tutor-accessible Hood could do so.
    if (activeTargetIsActorSnorlax(item, observation) &&
        snorlaxHoodWindow(observation) && accessibleHoodThisTurn(observation)) return 0;
    return matches(target, PRINT.snorlax) ||
      (!target && matches(own.active?.printing ?? '', PRINT.snorlax)) ? 220 : 105;
  }
  if (matches(card, PRINT.floatStone)) return matches(target, PRINT.snorlax) ? 10 : 95;
  if (matches(card, PRINT.stealthyHood)) {
    // No arbitrary attachment: the target must be the specific Active slot.
    return activeTargetIsActorSnorlax(item, observation) &&
      snorlaxHoodWindow(observation) ? 250 : 0;
  }
  if (matches(card, PRINT.tropicalBeach)) {
    return !hasStadium(observation, PRINT.tropicalBeach) && hand.length <= 6 &&
      ownDeckCount(observation) > 7 ? 130 : 15;
  }
  if (matches(card, PRINT.playersCeremony)) return scorePlayersCeremonyPlay(observation);
  if (matches(card, PRINT.temple)) return opponentHasSpecialEnergy(opponent) ? 115 : 0;

  if ([PRINT.arven, PRINT.plumeria, PRINT.teamFlare, PRINT.teammates, PRINT.lusamine,
    PRINT.handiwork, PRINT.gladion, PRINT.guzma, PRINT.faba, PRINT.penny, PRINT.eri,
    PRINT.lillie].some(pattern => matches(card, pattern))) {
    if (!supporterAvailable(observation)) return 0;
    if (matches(card, PRINT.arven)) {
      if (!hasUnseenArvenSearchTargets(observation)) return 0;
      return !boardHasTool(own, PRINT.toolJammer) ? 175 : 95;
    }
    if (matches(card, PRINT.faba)) return opponentHasAnyTool(observation) ||
      opponentHasSpecialEnergy(opponent) ||
      stadiumsInPlay(observation).length > 0 ? 155 : 0;
    if (matches(card, PRINT.plumeria)) return playerEnergyCount(opponent) > 0 && hand.length >= 3 ?
      145 + Math.min(20, playerEnergyCount(opponent) * 5) : 0;
    if (matches(card, PRINT.teamFlare)) return opponentActiveEnergy(observation) > 0 ? 135 : 0;
    if (matches(card, PRINT.teammates)) {
      return request.publicEventReceipt?.priorOpponentTurnKO?.any === true ? 140 : 0;
    }
    if (matches(card, PRINT.guzma)) {
      if (dialgaTrapAvailable(observation, true)) return 290;
      if (dialgaTrapHeld(observation)) return 0;
      if (!slots(opponent).some(row => row.zone === 'bench')) return 0;
      const activeIsSnorlax = matches(own.active?.printing ?? '', PRINT.snorlax);
      const damagedSnorlaxCanRotate = activeIsSnorlax && (own.active.damage ?? 0) >= 100 &&
        slots(own).some(row => row.zone === 'bench' &&
          matches(row.pokemon.printing, PRINT.snorlax) && hasTool(row.pokemon, PRINT.toolJammer));
      return !activeIsSnorlax && boardHas(own, PRINT.snorlax) ? 185 :
        damagedSnorlaxCanRotate ? 150 : 0;
    }
    if (matches(card, PRINT.eri)) {
      const opponentHandCount = Number.isSafeInteger(opponent.handCount) ? opponent.handCount : 0;
      return opponentHasVisibleItem(observation) ? 160 :
        opponentHandCount >= 3 ? 135 : opponentHandCount >= 1 ? 90 : 0;
    }
    if (matches(card, PRINT.handiwork)) return opponentDeckCount(observation) <= 15 ? 130 : 65;
    if (matches(card, PRINT.lusamine)) {
      const targets = lusamineTargetCount(observation);
      return targets >= 2 ? 120 : targets === 1 ? 85 : 0;
    }
    if (matches(card, PRINT.lillie)) return hand.length <= 3 ? 110 : 0;
    if (matches(card, PRINT.gladion)) return 75;
    if (matches(card, PRINT.penny)) {
      // A root Penny line is executable only if the subsequent Pokémon
      // prompt would actually select a target. In particular, an Active
      // Snorlax with damage is intentionally protected by ownPickupScore:
      // if it is the sole damaged Basic, choosing Penny would dead-end at
      // NO_VISIBLE_POKEMON_TARGET. Evaluate the same known public features
      // as ownPickupScore, leaving strict native legality to the Store.
      const usable = slots(own).some(row => {
        // Reuse exact downstream prompt scoring with *physical slot identity*.
        // One protected Active Snorlax and one damaged Bench Snorlax can have
        // the same source printing; print-only lookup collapses them.
        if (row.pokemon.printed?.stage !== 'BASIC') return false;
        return ownPickupScore({
          printing: row.pokemon.printing,
          publicMetadata: {
            ownerSeat: 'actor',
            targetZone: row.zone,
            ...(row.zone === 'bench' ? { benchIndex: row.index } : { slotIndex: 0 })
          }
        }, observation) > 0;
      });
      return usable ? 90 : 0;
    }
  }

  if (itemLocked(observation)) return 0;
  if (matches(card, PRINT.enhancedHammer)) return opponentSpecialEnergyCount(observation) > 0 ? 130 : 0;
  if (matches(card, PRINT.vsSeeker)) {
    const recoverableSupporters = list(own.discard).filter(candidate =>
      VS_SEEKER_SUPPORTER_PATTERNS.some(pattern => matches(candidate, pattern))
    );
    return recoverableSupporters.reduce((best, candidate) =>
      Math.max(best, scoreSearchCard(candidate, observation, 'vs-seeker')), 0);
  }
  if (matches(card, PRINT.trainersMail)) return hand.length <= 5 ? 90 : 45;
  if (matches(card, PRINT.nestBall) || matches(card, PRINT.quickBall)) {
    if (!hasBasicBenchSpace(observation) || !hasUnseenBasicSearchTargets(observation)) return 0;
    if (matches(card, PRINT.quickBall) && hand.length < 2) return 0;
    return (!boardHas(own, PRINT.snorlax) || !boardHas(own, PRINT.bunnelby) ||
      !boardHas(own, PRINT.girafarig)) ? 100 : 25;
  }
  if (matches(card, PRINT.nightStretcher)) {
    return hasNightStretcherTargets(observation) ? 90 : 0;
  }
  if (matches(card, PRINT.counterCatcher)) {
    if (!(own.prizeCount > opponent.prizeCount)) return 0;
    if (dialgaTrapAvailable(observation)) return 300;
    if (dialgaTrapHeld(observation)) return 0;
    return slots(opponent).some(row => row.zone === 'bench') ? 135 : 0;
  }
  if (matches(card, PRINT.scoopCyclone)) {
    return slots(own).some(row => row.pokemon.damage >= 80 &&
      !(row.zone === 'active' && matches(row.pokemon.printing, PRINT.snorlax))) ? 105 : 0;
  }
  if (matches(card, PRINT.heavyBall)) return 35;
  return 0;
}

function choiceZone(choice) {
  const meta = choice?.publicMetadata ?? {};
  return meta.sourceZone ?? meta.targetZone ?? meta.zone ?? null;
}

function choiceOwner(choice) {
  return choice?.publicMetadata?.ownerSeat ?? null;
}

function cardChoiceScore(choice, observation, context) {
  const printing = valueText(choice);
  if (context === 'faba') {
    if (matches(printing, PRINT.stealthyHood)) return 250;
    if (matches(printing, PRINT.forestSealStone)) return 225;
    if (matches(printing, PRINT.floatStone)) return 200;
    if (matches(printing, PRINT.temple) || /Sky Field|Dimension Valley/i.test(printing)) return 170;
    if (/Special Energy|Double Dragon Energy|Jet Energy|Capture Energy/i.test(printing)) return 120;
    return 10;
  }
  if (context === 'eri') {
    if (/Field Blower GRI 125/i.test(printing)) return 260;
    if (/Unfair Stamp TWM 165/i.test(printing)) return 250;
    if (/Mysterious Treasure FLI 113/i.test(printing)) return 215;
    if (/Fog Crystal CRE 140/i.test(printing)) return 205;
    if (matches(printing, PRINT.vsSeeker)) return 190;
    if (matches(printing, PRINT.nightStretcher)) return 180;
    if (/Battle Compressor PHF 92/i.test(printing)) return 175;
    if (matches(printing, PRINT.quickBall)) return 150;
    if (matches(printing, PRINT.heavyBall)) return 140;
    return 0;
  }
  if (context === 'lusamine') {
    if (matches(printing, PRINT.faba)) return 230;
    if (matches(printing, PRINT.handiwork)) return 210;
    if (matches(printing, PRINT.plumeria)) return 190;
    if (matches(printing, PRINT.teamFlare)) return 175;
    if (matches(printing, PRINT.guzma)) return 160;
    if (matches(printing, PRINT.tropicalBeach) || matches(printing, PRINT.temple)) return 145;
    if (matches(printing, PRINT.playersCeremony)) return 135;
    return 0;
  }
  if (context === 'plumeria-cost') {
    if (matches(printing, PRINT.toolJammer) || matches(printing, PRINT.faba) ||
        matches(printing, PRINT.guzma) || matches(printing, PRINT.handiwork) ||
        matches(printing, PRINT.arven) || matches(printing, PRINT.lusamine) ||
        matches(printing, PRINT.eri) || matches(printing, PRINT.teammates)) return 5;
    if (matches(printing, PRINT.waterEnergy) || matches(printing, PRINT.captureEnergy)) return 35;
    if (matches(printing, PRINT.nestBall) || matches(printing, PRINT.quickBall) ||
        matches(printing, PRINT.trainersMail)) return 100;
    return 60;
  }
  return scoreSearchCard(printing, observation, context);
}

function multiSelectDecision(prompt, rankedChoices, minimum, maximum) {
  const ranked = rankedChoices.slice().sort((a, b) => b.score - a.score);
  const selected = ranked.slice(0, maximum).map(row => row.choice);
  if (selected.length < minimum) {
    const empty = prompt.choices.find(choice => choice.kind === 'empty-selection');
    if (minimum === 0 && empty) return { kind: 'select-choice', token: empty.token };
    return { kind: 'abstain', reasonCode: 'NO_SUPPORTED_CARD_SELECTION' };
  }
  if (selected.length === 0) {
    const empty = prompt.choices.find(choice => choice.kind === 'empty-selection');
    return empty ? { kind: 'select-choice', token: empty.token } :
      { kind: 'abstain', reasonCode: 'NO_SUPPORTED_CARD_SELECTION' };
  }
  return { kind: 'select-choices', tokens: selected.map(choice => choice.token) };
}

function singleChoice(prompt, choices, scoreFn, reasonCode) {
  if (!choices.length) return { kind: 'abstain', reasonCode };
  const ranked = choices.map(choice => ({ choice, score: scoreFn(choice) }))
    .sort((a, b) => b.score - a.score);
  if (ranked[0].score <= 0) return { kind: 'abstain', reasonCode };
  return { kind: 'select-choice', token: ranked[0].choice.token };
}

function publicRootTargetSlot(item,player) {
  const rows = slots(player);
  const printing = item?.targetPrinting ?? '';
  const meta = item?.publicMetadata ?? {};
  if (meta.targetSeat && meta.targetSeat !== 'actor') return null;
  const row = meta.targetZone === 'active' ?
    rows.find(entry => entry.zone === 'active') :
    meta.targetZone === 'bench' && Number.isSafeInteger(meta.targetIndex) ?
      rows.find(entry => entry.zone === 'bench' && entry.index === meta.targetIndex) :
      rows.find(entry => entry.pokemon.printing === printing);
  return row?.pokemon.printing === printing ? row : null;
}

function publicChoiceSlot(player,choice) {
  const rows = slots(player);
  const printing = valueText(choice);
  const meta = choice?.publicMetadata ?? {};
  const zone = meta.targetZone ?? meta.sourceZone ?? meta.zone ?? null;
  const row = zone === 'active' ?
    rows.find(item => item.zone === 'active') :
    zone === 'bench' && Number.isSafeInteger(meta.benchIndex) ?
      rows.find(item => item.zone === 'bench' && item.index === meta.benchIndex) :
      rows.find(item => item.pokemon.printing === printing);
  return row?.pokemon.printing === printing ? row : null;
}

function opponentPokemonScore(choice, observation, gustMode = '') {
  if (choiceOwner(choice) !== 'opponent' ||
      !['bench', 'active'].includes(choiceZone(choice))) return 0;
  const row = publicChoiceSlot(observation.opponentPublic,choice);
  const pokemon = row?.pokemon;
  if (!pokemon) return 10;
  if (gustMode && choiceZone(choice) === 'bench' &&
      matches(valueText(choice), PRINT.dialga) &&
      dialgaTrapAvailable(observation, gustMode === 'guzma') &&
      attacklessDialga(pokemon)) return 1000;
  return 40 + energyCount(pokemon) * 30 +
    (pokemon.printed?.retreatCost?.length ?? 0) * 8 +
    (pokemon.printed?.stage === 'BASIC' ? 5 : 15);
}

function ownPickupScore(choice, observation) {
  if (choiceOwner(choice) !== 'actor') return 0;
  const row = publicChoiceSlot(observation.ownPublic,choice);
  if (!row) return 0;
  if (row.zone === 'active' && matches(row.pokemon.printing, PRINT.snorlax)) return 0;
  return (row.pokemon.damage ?? 0) * 2 + energyCount(row.pokemon) * 10 +
    (matches(row.pokemon.printing, PRINT.rotom) || matches(row.pokemon.printing, PRINT.articuno) ? 20 : 0);
}

function ownSwitchScore(choice, observation) {
  if (choiceOwner(choice) !== 'actor' || choiceZone(choice) !== 'bench') return 0;
  const row = publicChoiceSlot(observation.ownPublic,choice);
  if (!row) return 0;
  if (matches(row.pokemon.printing, PRINT.snorlax)) {
    return hasTool(row.pokemon, PRINT.toolJammer) ? 260 : 220;
  }
  if (matches(row.pokemon.printing, PRINT.bunnelby) ||
      matches(row.pokemon.printing, PRINT.girafarig)) return 65;
  return 35 + energyCount(row.pokemon) * 5;
}

function promptDecision(request) {
  const prompt = request.prompt;
  const observation = request.observation;
  const choices = list(prompt?.choices);
  const source = [
    prompt?.source?.sourcePrinting ?? '',
    prompt?.source?.effectName ?? '',
    prompt?.description ?? ''
  ].join(' ').toLowerCase();
  const sourcePrinting = prompt?.source?.sourcePrinting ?? '';
  const metadata = prompt?.publicMetadata ?? {};
  const selectionType = metadata.selectionType ?? null;

  if (prompt.promptType === 'ChooseCardsPrompt') {
    // Quick Ball's hand-discard cost is distinct from its deck search.
    if (/quick ball/i.test(source) &&
        choices.length>0 && choices.every(choice=>choiceZone(choice)==='hand')) {
      const min=Number.isSafeInteger(metadata.minimumCount)?metadata.minimumCount:1;
      const max=Number.isSafeInteger(metadata.maximumCount)?metadata.maximumCount:min;
      return multiSelectDecision(prompt,choices.map(choice=>({
        choice,score:cardChoiceScore(choice,observation,'plumeria-cost')
      })),min,max);
    }
    if (selectionType && !/faba|enhanced hammer|star alchemy|trainers|nest ball|quick ball|capture energy|vs seeker|night stretcher/i.test(source)) {
      const min = selectionType === 'energy-payment' ? 1 :
        (Number.isSafeInteger(metadata.minimumCount) ? metadata.minimumCount : 1);
      const max = selectionType === 'energy-payment' ?
        (Number.isSafeInteger(metadata.energyCount) ? metadata.energyCount :
          (Number.isSafeInteger(metadata.count) ? metadata.count : min)) :
        (Number.isSafeInteger(metadata.maximumCount) ? metadata.maximumCount : min);
      if (source.includes('arven')) {
        const itemChoices = choices.filter(choice => choiceOwner(choice) === 'actor' &&
          choiceZone(choice) === 'deck' && ITEM_PATTERNS.some(pattern => matches(choice, pattern)));
        const toolChoices = choices.filter(choice => choiceOwner(choice) === 'actor' &&
          choiceZone(choice) === 'deck' && TOOL_PATTERNS.some(pattern => matches(choice, pattern)));
        let bestPair = null;
        let bestPairScore = -1;
        for (const item of itemChoices) {
          for (const tool of toolChoices) {
            if (item.token === tool.token) continue;
            const score = cardChoiceScore(item, observation, 'arven') +
              cardChoiceScore(tool, observation, 'arven');
            if (score > bestPairScore) {
              bestPair = [item, tool];
              bestPairScore = score;
            }
          }
        }
        if (bestPair && min <= 2 && max >= 2) {
          return { kind: 'select-choices', tokens: bestPair.map(choice => choice.token) };
        }
        // Arven's pinned native prompt permits just an Item or just a Tool
        // (min=0, max=1) when no eligible card remains in the other category.
        const singles = [...itemChoices, ...toolChoices]
          .map((choice, index) => ({
            choice, index, score: cardChoiceScore(choice, observation, 'arven')
          }))
          .filter(row => row.score > 0)
          .sort((a, b) => b.score - a.score || a.index - b.index);
        if (singles.length && min <= 1 && max >= 1) {
          return { kind: 'select-choices', tokens: [singles[0].choice.token] };
        }
        // A zero-target native Arven search is still a legal empty choice.
        const empty = choices.find(choice => choice.kind === 'empty-selection');
        if (min === 0 && empty) return { kind: 'select-choice', token: empty.token };
        return { kind: 'abstain', reasonCode: 'ARVEN_ITEM_TOOL_PAIR_UNAVAILABLE' };
      }
      if (source.includes('plumeria')) {
        const handChoices = choices.filter(choice => choiceOwner(choice) === 'actor' &&
          choiceZone(choice) === 'hand');
        return multiSelectDecision(prompt, handChoices.map(choice => ({
          choice, score: cardChoiceScore(choice, observation, 'plumeria-cost')
        })), min, max);
      }
      if (source.includes('quick ball')) {
        const handChoices = choices.filter(choice => choiceOwner(choice) === 'actor' &&
          choiceZone(choice) === 'hand');
        return multiSelectDecision(prompt, handChoices.map(choice => ({
          choice, score: cardChoiceScore(choice, observation, 'plumeria-cost')
        })), min, max);
      }
      if (source.includes('get lost')) {
        const discardChoices = choices.filter(choice => choiceOwner(choice) === 'opponent' &&
          choiceZone(choice) === 'discard');
        return multiSelectDecision(prompt, discardChoices.map(choice => ({
          choice, score: cardChoiceScore(choice, observation, 'get-lost')
        })).filter(row => row.score > 0), min, max);
      }
      if (source.includes('land maker')) {
        const stadiumChoices = choices.filter(choice => choiceOwner(choice) === 'actor' &&
          choiceZone(choice) === 'discard');
        return multiSelectDecision(prompt, stadiumChoices.map(choice => ({
          choice, score: cardChoiceScore(choice, observation, 'land-maker')
        })).filter(row => row.score > 0), min, max);
      }
      if (source.includes('eri')) {
        const itemChoices = choices.filter(choice => choiceOwner(choice) === 'opponent' &&
          choiceZone(choice) === 'hand' &&
          ERI_ITEM_PATTERNS.some(pattern => matches(choice, pattern)));
        return multiSelectDecision(prompt, itemChoices.map(choice => ({
          choice, score: cardChoiceScore(choice, observation, 'eri')
        })).filter(row => row.score > 0), min, max);
      }
      if (source.includes('lusamine')) {
        const discardChoices = choices.filter(choice => choiceOwner(choice) === 'actor' &&
          choiceZone(choice) === 'discard');
        return multiSelectDecision(prompt, discardChoices.map(choice => ({
          choice, score: cardChoiceScore(choice, observation, 'lusamine')
        })).filter(row => row.score > 0), min, max);
      }
      if (source.includes('teammates')) {
        const deckChoices = choices.filter(choice => choiceOwner(choice) === 'actor' &&
          choiceZone(choice) === 'deck');
        return multiSelectDecision(prompt, deckChoices.map(choice => ({
          choice, score: cardChoiceScore(choice, observation, 'teammates')
        })), min, max);
      }
      return { kind: 'abstain', reasonCode: 'UNSUPPORTED_CARD_COMBINATION_SOURCE' };
    }

    if (source.includes('faba')) {
      const targets = choices.filter(choice => choiceOwner(choice) === 'opponent' ||
        choiceZone(choice) === 'stadium' || choice.kind === 'stadium');
      return singleChoice(prompt, targets,
        choice => cardChoiceScore(choice, observation, 'faba'), 'NO_USEFUL_CARD_CHOICE');
    }
    if (source.includes('enhanced hammer')) {
      return singleChoice(prompt, choices.filter(choice => choiceOwner(choice) === 'opponent'),
        choice => /Special Energy|Double Dragon Energy|Jet Energy|Capture Energy/i.test(valueText(choice)) ? 100 : 0,
        'NO_USEFUL_CARD_CHOICE');
    }
    if (source.includes('star alchemy')) {
      return singleChoice(prompt, choices.filter(choice => choiceOwner(choice) === 'actor' &&
        choiceZone(choice) === 'deck'),
        choice => cardChoiceScore(choice, observation, 'star-alchemy'), 'NO_USEFUL_CARD_CHOICE');
    }
    if (source.includes('trainers')) {
      return singleChoice(prompt, choices, choice => cardChoiceScore(choice, observation, 'trainers-mail'),
        'NO_USEFUL_CARD_CHOICE');
    }
    if (/nest ball|quick ball|capture energy/i.test(source)) {
      return singleChoice(prompt, choices, choice => cardChoiceScore(choice, observation, 'basic-search'),
        'NO_USEFUL_CARD_CHOICE');
    }
    if (source.includes('vs seeker')) {
      return singleChoice(prompt, choices.filter(choice => choiceOwner(choice) === 'actor' &&
        choiceZone(choice) === 'discard'),
        choice => cardChoiceScore(choice, observation, 'vs-seeker'), 'NO_USEFUL_CARD_CHOICE');
    }
    if (source.includes('night stretcher')) {
      return singleChoice(prompt, choices.filter(choice => choiceOwner(choice) === 'actor' &&
        choiceZone(choice) === 'discard'),
        choice => cardChoiceScore(choice, observation, 'night-stretcher'), 'NO_USEFUL_CARD_CHOICE');
    }
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_CARD_COMBINATION_SOURCE' };
  }

  if (prompt.promptType === 'ChoosePokemonPrompt') {
    if (/guzma/i.test(source)) {
      const opponentChoices = choices.filter(choice => choiceOwner(choice) === 'opponent');
      if (opponentChoices.length) {
        return singleChoice(prompt, opponentChoices,
          choice => opponentPokemonScore(choice, observation, 'guzma'), 'NO_VISIBLE_POKEMON_TARGET');
      }
      return singleChoice(prompt, choices,
        choice => ownSwitchScore(choice, observation), 'NO_VISIBLE_POKEMON_TARGET');
    }
    if (/counter catcher/i.test(source)) {
      return singleChoice(prompt, choices,
        choice => opponentPokemonScore(choice, observation, 'counter-catcher'), 'NO_VISIBLE_POKEMON_TARGET');
    }
    if (/team flare grunt/i.test(source)) {
      const activeTargets = choices.filter(choice => choiceOwner(choice) === 'opponent' &&
        choiceZone(choice) === 'active');
      return singleChoice(prompt, activeTargets,
        choice => opponentPokemonScore(choice, observation), 'NO_VISIBLE_POKEMON_TARGET');
    }
    if (/plumeria/i.test(source)) {
      return singleChoice(prompt, choices.filter(choice => choiceOwner(choice) === 'opponent'),
        choice => opponentPokemonScore(choice, observation), 'NO_VISIBLE_ENERGY_CHOICE');
    }
    if (/penny|scoop up cyclone/i.test(source)) {
      return singleChoice(prompt, choices,
        choice => ownPickupScore(choice, observation), 'NO_VISIBLE_POKEMON_TARGET');
    }
    if (/nest ball|quick ball|capture energy/i.test(source)) {
      return singleChoice(prompt, choices,
        choice => cardChoiceScore(choice, observation, 'basic-search'), 'NO_USEFUL_CARD_CHOICE');
    }
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_POKEMON_PROMPT' };
  }

  if (prompt.promptType === 'MoveEnergyPrompt') {
    // The pinned Articuno-GX CES Legendary Ascent prompt transfers attached
    // Water Energy from an actor-owned Bench slot to the physical Active.
    // This is not a ChooseEnergyPrompt payment; use each unique native token.
    if (!matches(sourcePrinting, PRINT.articuno) ||
        !['Legendary Ascent', 'Articuno-GX'].includes(prompt.source?.effectName) ||
        selectionType !== 'energy-transfer' ||
        metadata.ownerSeat !== 'actor' ||
        metadata.sourceZone !== 'bench' ||
        metadata.targetZone !== 'active' ||
        metadata.allowCancel !== false) {
      return { kind: 'abstain', reasonCode: 'UNTRUSTED_ENERGY_SELECTION' };
    }
    const water = choices.filter(choice =>
      choice.kind === 'energy' &&
      choiceOwner(choice) === 'actor' &&
      choiceZone(choice) === 'bench' &&
      choice.publicMetadata?.targetZone === 'active' &&
      Number.isSafeInteger(choice.publicMetadata?.benchIndex) &&
      /^Water Energy\b/i.test(valueText(choice)));
    const min = Number.isSafeInteger(metadata.minimumCount) ? metadata.minimumCount : 1;
    const max = Number.isSafeInteger(metadata.maximumCount) ? metadata.maximumCount : min;
    return multiSelectDecision(prompt, water.map((choice, index) => ({
      choice, score: 100 - index
    })), min, max);
  }

  if (prompt.promptType === 'ChooseEnergyPrompt') {
    if (/legendary ascent/i.test(source)) {
      // Native actor prompt is multi-Energy payment, not a deck card search.
      const count=Number.isSafeInteger(metadata.energyCount)?metadata.energyCount:1;
      const water=choices.filter(choice=>choiceOwner(choice)==='actor' &&
        matches(choice,PRINT.waterEnergy));
      return multiSelectDecision(prompt,water.map(choice=>({choice,score:100})),
        Math.min(count,water.length),count);
    }
    const owner = choices.filter(choice => choiceOwner(choice) === 'opponent');
    if (owner.length) {
      return singleChoice(prompt, owner, choice =>
        /Special Energy|Double Dragon Energy|Jet Energy|Capture Energy/i.test(valueText(choice)) ? 120 : 60,
      'NO_VISIBLE_ENERGY_CHOICE');
    }
    return { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ENERGY_PAYMENT' };
  }

  if (prompt.promptType === 'ChoosePrizePrompt') {
    if (selectionType === 'prize-slots') {
      // The native projection deliberately keeps ordinary Prize slots opaque.
      // Accept only source-bound damaging rank-3 attacks, not a search effect
      // (Gladion / Hisuian Heavy Ball require actual Prize identities).
      const provenance = prompt.source ?? {};
      const awardSources = [
        [PRINT.snorlax, 'Collapse'], [PRINT.stunfisk, 'Damage Rush'],
        [PRINT.regirock, 'Stone Edge'], [PRINT.mimikyu, 'Ghost Eye'],
        [PRINT.girafarig, 'Mind Shock'], [PRINT.articuno, 'Ice Wing'],
        [PRINT.rotom, 'Scrap Short']
      ];
      if (matches(provenance.sourcePrinting, PRINT.gladion) ||
          matches(provenance.sourcePrinting, PRINT.heavyBall)) {
        return { kind: 'abstain', reasonCode: 'HIDDEN_PRIZE_IDENTITY' };
      }
      if (provenance.classification !== 'actor-choice' ||
          provenance.sourceKind !== 'card-effect' ||
          !awardSources.some(([pattern, attack]) =>
            matches(provenance.sourcePrinting, pattern) && provenance.effectName === attack) ||
          metadata.ownerSeat !== 'actor' || metadata.sourceZone !== 'prizes' ||
          metadata.isOwnerVisible !== false) {
        return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PRIZE_SELECTION' };
      }
      const count = metadata.requiredCount;
      const offered = choices.filter(choice => choice.kind === 'prize');
      if (!Number.isSafeInteger(count) || count < 0 || count > offered.length ||
          offered.some(choice => !Number.isSafeInteger(choice.publicMetadata?.selectionIndex) ||
            choice.publicMetadata.selectionIndex < 0 ||
            choice.publicMetadata.requiredCount !== count ||
            choice.publicMetadata.ownerSeat !== 'actor' ||
            choice.publicMetadata.sourceZone !== 'prizes' ||
            choice.publicMetadata.isOwnerVisible !== false ||
            typeof choice.token !== 'string' || !choice.token || choice.printing !== undefined) ||
          new Set(offered.map(choice => choice.publicMetadata.selectionIndex)).size !== offered.length ||
          new Set(offered.map(choice => choice.token)).size !== offered.length) {
        return { kind: 'abstain', reasonCode: 'NO_LEGAL_PRIZE_SELECTION' };
      }
      if (count === 0) {
        const empty = choices.filter(choice => choice.kind === 'empty-selection');
        return empty.length === 1 && offered.length === 0 ?
          { kind: 'select-choice', token: empty[0].token } :
          { kind: 'abstain', reasonCode: 'NO_EMPTY_PRIZE_CHOICE' };
      }
      const tokens = offered.slice().sort((a,b) =>
        a.publicMetadata.selectionIndex - b.publicMetadata.selectionIndex)
        .slice(0,count).map(choice => choice.token);
      return { kind: 'select-choices', tokens };
    }
    return singleChoice(prompt, choices, choice => {
      if (matches(choice, PRINT.snorlax) || matches(choice, PRINT.bunnelby) ||
          matches(choice, PRINT.girafarig) || matches(choice, PRINT.toolJammer) ||
          matches(choice, PRINT.faba)) return 150;
      return choice.printing ? 20 : 0;
    }, 'HIDDEN_PRIZE_IDENTITY');
  }

  if (prompt.promptType === 'ConfirmPrompt' ||
      prompt.promptType === 'SelectPrompt' ||
      prompt.promptType === 'SelectOptionPrompt') {
    const yes = choices.find(choice => /^(yes|true|confirm)$/i.test(choice.label ?? ''));
    const no = choices.find(choice => /^(no|false|decline|cancel)$/i.test(choice.label ?? ''));
    // The pinned Ability offers the Active switch before its native
    // MoveEnergyPrompt. Do not decline a credible immediate Cold Crush-GX
    // setup, but preserve Snorlax's Block and already-spent GX plans.
    const ascentSource = matches(sourcePrinting, PRINT.articuno) &&
      ['Legendary Ascent', 'Articuno-GX'].includes(prompt.source?.effectName);
    const benchWater = slots(observation.ownPublic).some(row =>
      row.zone === 'bench' && !matches(row.pokemon.printing, PRINT.articuno) &&
      list(row.pokemon.energies).some(energy => /^Water Energy\b/i.test(valueText(energy))));
    // Legendary Ascent asks before switching Articuno into Active. The old
    // Active becomes Benched *with its attached Water Energy* before the
    // native MoveEnergyPrompt is offered. Bench-only inspection incorrectly
    // declines this physical, payable continuation.
    const preSwitchActive = observation.ownPublic?.active ?? null;
    const futureBenchWater = !matches(preSwitchActive?.printing ?? '', PRINT.articuno) &&
      list(preSwitchActive?.energies).some(energy =>
        /^Water Energy\b/i.test(valueText(energy)));
    const acceptAscent = ascentSource && (benchWater || futureBenchWater) && !gxUsed(observation) &&
      !matches(observation.ownPublic?.active?.printing ?? '', PRINT.snorlax) &&
      opponentActiveEnergy(observation) >= 2;
    const shouldAccept = acceptAscent ||
      (/instant charge/i.test(source) && list(observation.ownHand).length <= 4 &&
        ownDeckCount(observation) > 3) ||
      (/tropical beach/i.test(source) && list(observation.ownHand).length < 7 &&
        ownDeckCount(observation) > 0) ||
      (/cold crush/i.test(source) && opponentActiveEnergy(observation) >= 2 &&
        energyCount(ownActive(observation)) <= 1 && !gxUsed(observation));
    if (shouldAccept && yes) return { kind: 'select-choice', token: yes.token };
    if (no) return { kind: 'select-choice', token: no.token };
    return { kind: 'abstain', reasonCode: 'UNRECOGNIZED_SIMPLE_PROMPT' };
  }

  return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
}

function isTurnEndingAction(item) {
  if (item.kind === 'attack' || item.kind === 'pass') return true;
  // Rotom V's Instant Charge ends the turn, unlike Star Alchemy.
  if (item.kind === 'use-ability' && item.publicMetadata?.abilityName === 'Instant Charge') return true;
  if (item.kind !== 'use-stadium') return false;
  const stadium = item.actorPrinting ?? item.publicMetadata?.stadiumPrinting ?? '';
  return matches(stadium, PRINT.tropicalBeach) || matches(stadium, PRINT.playersCeremony);
}

function bestAction(request) {
  const items = list(request.actionFrontier?.items).filter(item => EXECUTABLE.has(item.kind));
  if (!items.length) return { kind: 'abstain', reasonCode: 'NO_EXECUTABLE_ACTION' };
  const scored = items.map(item => ({ item, score: scoreAction(item, request) }));
  // Draw-and-end-turn Stadium effects and attacks are terminal choices. Finish
  // every positively scored non-terminal action first, then compare terminal lines.
  const nonTerminal = scored.filter(row => !isTurnEndingAction(row.item) && row.score > 0);
  const candidates = nonTerminal.length ? nonTerminal : scored;
  let best = null;
  let bestScore = 0;
  for (const row of candidates) {
    if (row.score > bestScore) {
      best = row.item;
      bestScore = row.score;
    }
  }
  if (best) return { kind: 'select-action', token: best.token };
  const pass = items.find(item => item.kind === 'pass');
  return pass ? { kind: 'select-action', token: pass.token } :
    { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ACTION' };
}

// Multi-select classes require select-choices even for one card or Pokémon.
function currentPromptDecision(prompt,decision) {
  if(!prompt||decision?.kind!=='select-choice')return decision;
  const selected=prompt.choices.find(choice=>choice.token===decision.token);
  if(!selected||selected.kind==='cancel'||selected.kind==='empty-selection')return decision;
  if(['card-combination','pokemon','energy-payment','energy-transfer','prize-slots','card-order'].includes(prompt.publicMetadata?.selectionType))
    return {kind:'select-choices',tokens:[decision.token]};
  return decision;
}

function createPolicy({ role, seat, policyVersion, config }) {
  // The shared worker accepts only a zero-key config. Exact rank/source/candidate
  // identity is immutable in this module and its dependency manifest.
  if (role !== 'opponent' || (seat !== 0 && seat !== 1) ||
      policyVersion !== POLICY_VERSION || !config ||
      typeof config !== 'object' || Array.isArray(config) ||
      Object.keys(config).length !== 0) {
    throw new Error('AGENT17_RANK3_POLICY_INIT_MISMATCH');
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
  SOURCE_RANK,
  SOURCE_LIST_BLOB_SHA1,
  SOURCE_FINGERPRINT_SHA256,
  CANDIDATE_FINGERPRINT_SHA256,
  ENGINE_PIN,
  WORKER_PROTOCOL_BLOB_SHA1,
  createPolicy,
  scoreAction,
  scoreAttack,
  promptDecision,
  scoreSearchCard
};
