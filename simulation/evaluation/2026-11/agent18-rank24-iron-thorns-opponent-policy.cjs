'use strict';

/*
 * Exact-source rank-24 Aichi Iron Thorns policy prototype.
 *
 * Exact-source development policy for rank 24 under the shared Iron Thorns
 * family interface. It now covers terminal deck-out, deterministic setup and
 * funding, visible control denial, Volt Cyclone, search continuations, and
 * conservative hand disruption. Unsupported lines still abstain rather than
 * importing rank-6-only behavior.
 */

const POLICY_VERSION = 'agent18-rank24-iron-thorns-opponent-v1-terminal-mill';
const SOURCE_RANK = 24;
const SOURCE_LIST_BLOB_SHA1 = 'ae773f6201d7aa69d31914dbfee66f3fba692200';
const SOURCE_INVENTORY_SHA256 = '82ef5571dc3ee91c30bb490faeab86d16082109042928e4dadbde7951fccc18a';
const ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

const SOURCE_CARD_COUNTS = Object.freeze({
  'Iron Thorns ex TWM 77': 4,
  'Plumeria BUS 120': 4,
  'Lusamine CIN 96': 2,
  'Guzma & Hala CEC 193': 2,
  'Guzma BUS 115': 2,
  'Sidney FST 241': 2,
  'Eri TEF 146': 2,
  'Team Flare Grunt XY 129': 2,
  'Cynthia & Caitlin CEC 189': 1,
  'Bellelba & Brycen-Man CEC 186': 1,
  'Team Skull Grunt SUM 133': 1,
  'Faba LOT 173': 1,
  'N FCO 105': 1,
  "Lillie's Determination MEG 119": 1,
  'Gladion CIN 95': 1,
  "Xerosic's Machinations SFA 64": 1,
  "Trainers' Mail ROS 92": 4,
  'VS Seeker PHF 109': 3,
  'Nest Ball SVI 181': 2,
  'Tag Call CEC 206': 2,
  'Enhanced Hammer TWM 148': 2,
  'Palace Book SMP NAN25': 2,
  'Heavy Ball BKT 140': 1,
  'Megaton Blower SSP 182': 1,
  'Handheld Fan TWM 150': 2,
  'Tool Jammer BST 136': 1,
  "Player's Ceremony SP 127": 2,
  'Thunder Mountain ♢ LOT 191': 1,
  'Wondrous Labyrinth ♢ TEU 158': 1,
  'Speed Lightning Energy RCL 173': 4,
  'Double Colorless Energy SUM 136': 3,
  'Capture Energy RCL 171': 1
});

const BELLELBA = /^Bellelba & Brycen-Man\b/i;
const VS_SEEKER = /^VS Seeker\b/i;
const N_SUPPORTER = /^N(?:\s+FCO\s+105)?$/i;
const PALE_MOON = /^Pale Moon-GX$/i;
const IRON_THORNS = /^Iron Thorns ex\b/i;
const SPEED_LIGHTNING = /^Speed Lightning Energy\b/i;
const DOUBLE_COLORLESS = /^Double Colorless Energy\b/i;
const CAPTURE_ENERGY = /^Capture Energy\b/i;
const THUNDER_MOUNTAIN = /^Thunder Mountain(?: ♢| Prism Star)?\b/i;
const WONDROUS_LABYRINTH = /^Wondrous Labyrinth(?: ♢| Prism Star)?\b/i;
const TOOL_JAMMER = /^Tool Jammer\b/i;
const TAG_CALL = /^Tag Call\b/i;
const GUZMA_HALA = /^Guzma & Hala\b/i;
const CYNTHIA_CAITLIN = /^Cynthia & Caitlin\b/i;
const TRAINERS_MAIL = /^Trainers['’] Mail\b/i;
const PLAYER_CEREMONY = /^Player['’]s Ceremony\b/i;
const PALACE_BOOK = /^Palace Book\b/i;
const HANDHELD_FAN = /^Handheld Fan\b/i;
const NEST_BALL = /^Nest Ball\b/i;
const HEAVY_BALL = /^Heavy Ball\b/i;
const ENHANCED_HAMMER = /^Enhanced Hammer\b/i;
const TEAM_FLARE_GRUNT = /^Team Flare Grunt\b/i;
const PLUMERIA = /^Plumeria\b/i;
const FABA = /^Faba\b/i;
const MEGATON_BLOWER = /^Megaton Blower\b/i;
const VOLT_CYCLONE = /^Volt Cyclone$/i;
const ERI = /^Eri\b/i;
const SIDNEY = /^Sidney\b/i;
const TEAM_SKULL_GRUNT = /^Team Skull Grunt\b/i;
const XEROSIC_MACHINATIONS = /^Xerosic['’]s Machinations\b/i;
const LILLIE_DETERMINATION = /^Lillie['’]s Determination\b/i;

function list(value) {
  return Array.isArray(value) ? value : [];
}

function textOf(value) {
  if (typeof value === 'string') return value;
  if (typeof value?.printing === 'string') return value.printing;
  if (typeof value?.actorPrinting === 'string') return value.actorPrinting;
  if (typeof value?.label === 'string') return value.label;
  if (typeof value?.name === 'string') return value.name;
  return '';
}

function matches(value, pattern) {
  return pattern.test(textOf(value));
}

function supporterAvailable(observation) {
  const turn = observation?.ownTurnResources ?? {};
  const restrictions = observation?.ownPublic?.publicTurnRestrictions ?? {};
  return turn.supporterPlayedTurn === 0 &&
    turn.supporterPlayLocked !== true && restrictions.supporterPlayLocked !== true;
}

function itemAvailable(observation) {
  const turn = observation?.ownTurnResources ?? {};
  const restrictions = observation?.ownPublic?.publicTurnRestrictions ?? {};
  return turn.itemPlayLocked !== true && restrictions.itemPlayLocked !== true;
}

function energyAvailable(observation) {
  const turn = observation?.ownTurnResources ?? {};
  const restrictions = observation?.ownPublic?.publicTurnRestrictions ?? {};
  return turn.energyPlayedTurn !== true && turn.energyPlayLocked !== true &&
    restrictions.energyPlayLocked !== true;
}

function specialEnergyAvailable(observation) {
  const turn = observation?.ownTurnResources ?? {};
  const restrictions = observation?.ownPublic?.publicTurnRestrictions ?? {};
  return energyAvailable(observation) && turn.specialEnergyPlayLocked !== true &&
    restrictions.specialEnergyPlayLocked !== true;
}

function stadiumAvailable(observation) {
  const turn = observation?.ownTurnResources ?? {};
  const restrictions = observation?.ownPublic?.publicTurnRestrictions ?? {};
  return turn.stadiumPlayedTurn !== true && turn.stadiumPlayLocked !== true &&
    restrictions.stadiumPlayLocked !== true;
}

function toolAvailable(observation) {
  const turn = observation?.ownTurnResources ?? {};
  const restrictions = observation?.ownPublic?.publicTurnRestrictions ?? {};
  return turn.toolPlayLocked !== true && restrictions.toolPlayLocked !== true;
}

function ownActive(observation) { return observation?.ownPublic?.active ?? null; }
function opponentActive(observation) { return observation?.opponentPublic?.active ?? null; }
function ownDeckCount(observation) {
  return Number.isSafeInteger(observation?.ownPublic?.deckCount) ? observation.ownPublic.deckCount : null;
}
function opponentHandCount(observation) {
  return Number.isSafeInteger(observation?.opponentPublic?.handCount)
    ? observation.opponentPublic.handCount : null;
}
function ownPrizeCount(observation) {
  return Number.isSafeInteger(observation?.ownPublic?.prizeCount)
    ? observation.ownPublic.prizeCount : null;
}
function energyUnits(pokemon) {
  return list(pokemon?.energies).reduce((sum, card) => sum + (matches(card, DOUBLE_COLORLESS) ? 2 : 1), 0);
}
function hasActiveEnergy(pokemon, pattern) { return list(pokemon?.energies).some(card => matches(card, pattern)); }
function hasStadium(observation, pattern) {
  return [...list(observation?.ownPublic?.stadium), ...list(observation?.opponentPublic?.stadium)]
    .some(card => matches(card, pattern));
}
function opponentActiveHasTool(observation) { return list(opponentActive(observation)?.tools).length > 0; }
function activeHasTool(observation) { return list(ownActive(observation)?.tools).length > 0; }
function benchOpen(observation) {
  const bench = list(observation?.ownPublic?.bench);
  return bench.length < 5 || bench.some(slot => slot === null);
}
function ownThornsInPlay(observation) {
  let count = IRON_THORNS.test(ownActive(observation)?.printing ?? '') ? 1 : 0;
  for (const slot of list(observation?.ownPublic?.bench)) {
    if (slot && IRON_THORNS.test(slot.printing ?? '')) count += 1;
  }
  return count;
}
function basicEnergyPrinting(value) {
  return /^(?:Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy(?:\b|$)/i
    .test(textOf(value));
}
function specialEnergyPrinting(value) {
  return !!textOf(value) && !basicEnergyPrinting(value);
}
function opponentPokemon(observation) {
  const out = [];
  const active = opponentActive(observation);
  if (active) out.push({ zone: 'active', index: 0, pokemon: active });
  list(observation?.opponentPublic?.bench).forEach((pokemon, index) => {
    if (pokemon) out.push({ zone: 'bench', index, pokemon });
  });
  return out;
}
function opponentSpecialEnergyCount(observation) {
  return opponentPokemon(observation).reduce((sum, row) =>
    sum + list(row.pokemon?.energies).filter(specialEnergyPrinting).length, 0);
}
function opponentToolCount(observation) {
  return opponentPokemon(observation).reduce((sum, row) =>
    sum + list(row.pokemon?.tools).length, 0);
}
function opponentEnergyCount(observation) {
  return opponentPokemon(observation).reduce((sum, row) =>
    sum + list(row.pokemon?.energies).length, 0);
}
function canPayPlumeria(observation) {
  const hand = list(observation?.ownHand).filter(card => !matches(card, PLUMERIA));
  return hand.filter(card => discardPriority(card, observation) >= 60).length >= 2;
}
function remainingHp(pokemon) {
  const hp = pokemon?.hp;
  const damage = pokemon?.damage;
  return Number.isFinite(hp) && Number.isFinite(damage) ? hp - damage : null;
}
function hasVoltCycloneFrontier(request) {
  return list(request?.actionFrontier?.items).some(item =>
    item?.kind === 'attack' && /Volt Cyclone/i.test(item.attackName ?? ''));
}
function targetIsOwnIronThorns(item, observation) {
  const target = item?.targetPrinting || ownActive(observation)?.printing || '';
  return IRON_THORNS.test(target);
}
function canPayGuzmaHala(observation) {
  const hand = list(observation?.ownHand).filter(card => !matches(card, GUZMA_HALA));
  return hand.filter(card => discardPriority(card, observation) >= 60).length >= 2;
}
function discardPriority(value, observation) {
  if (matches(value, PLAYER_CEREMONY)) return 100;
  if (matches(value, PALACE_BOOK)) return 95;
  if (matches(value, HANDHELD_FAN)) return 90;
  if (matches(value, TRAINERS_MAIL) &&
      list(observation?.ownHand).filter(x => matches(x, TRAINERS_MAIL)).length > 1) return 82;
  if (matches(value, CAPTURE_ENERGY) && hasActiveEnergy(ownActive(observation), DOUBLE_COLORLESS)) return 72;
  if (matches(value, DOUBLE_COLORLESS) && hasActiveEnergy(ownActive(observation), DOUBLE_COLORLESS)) return 68;
  if (matches(value, SPEED_LIGHTNING) && hasActiveEnergy(ownActive(observation), SPEED_LIGHTNING)) return 66;
  return 0;
}
function trainersMailChoiceScore(value, observation) {
  if (matches(value, MEGATON_BLOWER)) return 300;
  if (matches(value, ENHANCED_HAMMER)) return opponentSpecialEnergyCount(observation) > 0 ? 275 : 160;
  if (matches(value, NEST_BALL)) return ownThornsInPlay(observation) < 2 && benchOpen(observation) ? 250 : 80;
  if (matches(value, TAG_CALL)) return 235;
  if (matches(value, VS_SEEKER)) {
    return hasCard(observation?.ownPublic?.discard, BELLELBA) ? 230 : 125;
  }
  if (matches(value, TOOL_JAMMER)) return opponentActiveHasTool(observation) ? 220 : 95;
  if (matches(value, GUZMA_HALA)) return 210;
  if (matches(value, PLUMERIA)) return opponentEnergyCount(observation) > 0 ? 205 : 100;
  if (matches(value, TEAM_FLARE_GRUNT)) return list(opponentActive(observation)?.energies).length > 0 ? 200 : 95;
  if (matches(value, FABA)) return 195;
  if (matches(value, XEROSIC_MACHINATIONS)) return (opponentHandCount(observation) ?? 0) > 3 ? 190 : 70;
  if (matches(value, LILLIE_DETERMINATION)) return list(observation?.ownHand).length <= 3 ? 180 : 80;
  if (matches(value, ERI)) return (opponentHandCount(observation) ?? 0) >= 6 ? 170 : 70;
  if (matches(value, SIDNEY)) return (opponentHandCount(observation) ?? 0) >= 6 ? 165 : 65;
  if (matches(value, TEAM_SKULL_GRUNT)) return (opponentHandCount(observation) ?? 0) >= 6 ? 160 : 60;
  if (matches(value, CYNTHIA_CAITLIN)) return 140;
  return 0;
}

function usefulGuzmaHalaTargets(observation) {
  const active = ownActive(observation);
  return {
    needThunder: !hasStadium(observation, THUNDER_MOUNTAIN) && energyUnits(active) >= 2,
    needDce: !hasActiveEnergy(active, DOUBLE_COLORLESS) &&
      !list(observation?.ownHand).some(x => matches(x, DOUBLE_COLORLESS)),
    needJammer: opponentActiveHasTool(observation) && !activeHasTool(observation) &&
      !list(observation?.ownHand).some(x => matches(x, TOOL_JAMMER))
  };
}

function opponentDeckCount(observation) {
  return Number.isSafeInteger(observation?.opponentPublic?.deckCount)
    ? observation.opponentPublic.deckCount : null;
}

function nForcesOpponentDeckZero(observation) {
  const deck = opponentDeckCount(observation);
  const hand = observation?.opponentPublic?.handCount;
  const prizes = observation?.opponentPublic?.prizeCount;
  if (![deck, hand, prizes].every(Number.isSafeInteger)) return false;
  if (deck < 0 || hand < 0 || prizes < 0) return false;
  return deck + hand > 0 && deck + hand <= prizes;
}

function hasCard(collection, pattern) {
  return list(collection).some(card => matches(card, pattern));
}

function findAction(request, pattern) {
  return list(request?.actionFrontier?.items).find(item =>
    item?.kind === 'play-card' && matches(item.actorPrinting, pattern));
}

function passAction(request) {
  return list(request?.actionFrontier?.items).find(item => item?.kind === 'pass');
}

/*
 * Fail closed on the risks represented by the current actor-view contract.
 * The public event receipt is required because it is the only current contract
 * field that exposes the opponent's complete last-turn attack names. This lets
 * us detect Pale Moon-GX without native state. Any Special Condition is also
 * treated as unsafe in this narrow terminal slice rather than trying to infer
 * Checkup lethality from incomplete condition metadata.
 */
function damagingSpecialCondition(condition) {
  if (typeof condition === 'string') {
    return /^(?:POISONED|BURNED)$/i.test(condition);
  }
  // Pinned Twinleaf SpecialCondition enum: 0 PARALYZED, 1 CONFUSED,
  // 2 ASLEEP, 3 POISONED, 4 BURNED.
  return condition === 3 || condition === 4;
}

function activeKoWouldEndGame(observation) {
  const hasBackup = list(observation?.ownPublic?.bench).some(Boolean);
  const opponentPrizes = observation?.opponentPublic?.prizeCount;
  // Rank 24 contains only Iron Thorns ex, so an Active KO yields 2 Prizes.
  return !hasBackup || !Number.isSafeInteger(opponentPrizes) || opponentPrizes <= 2;
}

function terminalEndTurnSafety(request) {
  const observation = request?.observation;
  const active = observation?.ownPublic?.active;
  const receipt = request?.publicEventReceipt;
  if (!active || !receipt || !Array.isArray(receipt.opponentLastTurnAttacks)) return false;

  // Poison/Burn can cause Checkup KOs, and their damage can be modified by other
  // public effects that this first slice does not yet normalize. Fail closed.
  if (list(active.specialConditions).some(damagingSpecialCondition)) return false;

  const paleMoonPending = receipt.opponentLastTurnAttacks.some(row =>
    PALE_MOON.test(row?.attackName ?? ''));
  if (paleMoonPending && activeKoWouldEndGame(observation)) return false;
  return true;
}

function terminalWindow(request) {
  const observation = request?.observation;
  const deckCount = opponentDeckCount(observation);
  return Number.isSafeInteger(deckCount) && deckCount >= 1 && deckCount <= 3 &&
    supporterAvailable(observation) && terminalEndTurnSafety(request);
}

function fundingScore(item, request) {
  const observation = request?.observation;
  const active = ownActive(observation);
  const card = item?.actorPrinting ?? '';
  if (!IRON_THORNS.test(active?.printing ?? '')) return 0;

  if (item.kind === 'attack' && VOLT_CYCLONE.test(item?.attackName ?? '')) {
    const hp = remainingHp(opponentActive(observation));
    return Number.isFinite(hp) && hp <= 140 ? 290 : 120;
  }

  if (item.kind === 'play-card' && matches(card, MEGATON_BLOWER)) {
    return itemAvailable(observation) &&
      (opponentSpecialEnergyCount(observation) > 0 || opponentToolCount(observation) > 0) ? 300 : 0;
  }
  if (item.kind === 'play-card' && matches(card, ENHANCED_HAMMER)) {
    return itemAvailable(observation) && opponentSpecialEnergyCount(observation) > 0 ? 270 : 0;
  }
  if (item.kind === 'play-card' && matches(card, PLUMERIA)) {
    return supporterAvailable(observation) && opponentEnergyCount(observation) > 0 &&
      canPayPlumeria(observation) ? 260 : 0;
  }
  if (item.kind === 'play-card' && matches(card, TEAM_FLARE_GRUNT)) {
    return supporterAvailable(observation) &&
      list(opponentActive(observation)?.energies).length > 0 ? 250 : 0;
  }
  if (item.kind === 'play-card' && matches(card, FABA)) {
    const stadiumVisible = list(observation?.ownPublic?.stadium).length > 0 ||
      list(observation?.opponentPublic?.stadium).length > 0;
    return supporterAvailable(observation) &&
      (opponentSpecialEnergyCount(observation) > 0 || opponentToolCount(observation) > 0 ||
       stadiumVisible) ? 240 : 0;
  }

  if (item.kind === 'play-card' && matches(card, XEROSIC_MACHINATIONS)) {
    const hand = opponentHandCount(observation);
    return supporterAvailable(observation) && Number.isSafeInteger(hand) && hand > 3 ?
      (hand >= 6 ? 225 : 190) : 0;
  }
  if (item.kind === 'play-card' && matches(card, LILLIE_DETERMINATION)) {
    const hand = list(observation?.ownHand).length;
    const deck = ownDeckCount(observation);
    const prizes = ownPrizeCount(observation);
    if (!supporterAvailable(observation) || !Number.isSafeInteger(deck) || deck <= 0) return 0;
    const targetDraw = prizes === 6 ? 8 : 6;
    return hand <= 2 && deck >= Math.min(targetDraw, 4) ? 218 :
      hand <= 3 && deck >= Math.min(targetDraw, 4) ? 178 : 0;
  }
  if (item.kind === 'play-card' && matches(card, TRAINERS_MAIL)) {
    return itemAvailable(observation) && (ownDeckCount(observation) ?? 0) > 0 ? 172 : 0;
  }
  if (item.kind === 'play-card' && matches(card, ERI)) {
    const hand = opponentHandCount(observation);
    return supporterAvailable(observation) && Number.isSafeInteger(hand) && hand >= 6 ? 170 : 0;
  }
  if (item.kind === 'play-card' && matches(card, SIDNEY)) {
    const hand = opponentHandCount(observation);
    return supporterAvailable(observation) && Number.isSafeInteger(hand) && hand >= 6 ? 165 : 0;
  }
  if (item.kind === 'play-card' && matches(card, TEAM_SKULL_GRUNT)) {
    const hand = opponentHandCount(observation);
    return supporterAvailable(observation) && Number.isSafeInteger(hand) && hand >= 6 ? 160 : 0;
  }

  if (item.kind === 'play-card' && matches(card, IRON_THORNS)) {
    return benchOpen(observation) && ownThornsInPlay(observation) < 2 ? 235 : 0;
  }
  if (item.kind === 'play-card' && matches(card, NEST_BALL)) {
    return itemAvailable(observation) && (ownDeckCount(observation) ?? 0) > 0 &&
      benchOpen(observation) && ownThornsInPlay(observation) < 2 ? 210 : 0;
  }
  if (item.kind === 'play-card' && matches(card, HEAVY_BALL)) {
    return itemAvailable(observation) && (ownDeckCount(observation) ?? 0) > 0 &&
      benchOpen(observation) && ownThornsInPlay(observation) < 2 ? 185 : 0;
  }
  if (item.kind === 'play-card' && matches(card, CAPTURE_ENERGY)) {
    if (!specialEnergyAvailable(observation) || !targetIsOwnIronThorns(item, observation)) return 0;
    return benchOpen(observation) && ownThornsInPlay(observation) < 2 ? 175 : 105;
  }
  if (item.kind === 'play-card' && matches(card, SPEED_LIGHTNING)) {
    return specialEnergyAvailable(observation) && targetIsOwnIronThorns(item, observation) &&
      !hasActiveEnergy(active, SPEED_LIGHTNING) ? 220 : 0;
  }
  if (item.kind === 'play-card' && matches(card, DOUBLE_COLORLESS)) {
    return specialEnergyAvailable(observation) && targetIsOwnIronThorns(item, observation) &&
      !hasActiveEnergy(active, DOUBLE_COLORLESS) ? 205 : 0;
  }
  if (item.kind === 'play-card' && matches(card, TOOL_JAMMER)) {
    return toolAvailable(observation) && targetIsOwnIronThorns(item, observation) &&
      !activeHasTool(observation) && opponentActiveHasTool(observation) ? 195 : 0;
  }
  if (item.kind === 'play-card' && matches(card, THUNDER_MOUNTAIN)) {
    if (!stadiumAvailable(observation) || hasStadium(observation, THUNDER_MOUNTAIN)) return 0;
    const units = energyUnits(active);
    if (units >= 2 && !hasVoltCycloneFrontier(request)) return 215;
    return hasVoltCycloneFrontier(request) ? 80 : 0;
  }
  if (item.kind === 'play-card' && matches(card, WONDROUS_LABYRINTH)) {
    const opp = opponentActive(observation);
    const nonFairy = !list(opp?.printed?.types).some(type => /Fairy/i.test(type));
    return stadiumAvailable(observation) && !hasStadium(observation, WONDROUS_LABYRINTH) &&
      nonFairy && !hasVoltCycloneFrontier(request) && energyUnits(opp) >= 2 ? 150 : 0;
  }
  if (item.kind === 'play-card' && matches(card, TAG_CALL)) {
    return itemAvailable(observation) && (ownDeckCount(observation) ?? 0) > 0 &&
      !list(observation?.ownHand).some(x => matches(x, GUZMA_HALA)) ? 165 : 0;
  }
  if (item.kind === 'play-card' && matches(card, GUZMA_HALA)) {
    if (!supporterAvailable(observation) || (ownDeckCount(observation) ?? 0) <= 0) return 0;
    const needs = usefulGuzmaHalaTargets(observation);
    if (needs.needThunder && canPayGuzmaHala(observation)) return 200;
    if ((needs.needDce || needs.needJammer) && canPayGuzmaHala(observation)) return 190;
    if (needs.needThunder) return 145;
  }
  return 0;
}

function fundingDecision(request) {
  let best = null;
  let bestScore = 0;
  for (const item of list(request?.actionFrontier?.items)) {
    const score = fundingScore(item, request);
    if (score > bestScore) { best = item; bestScore = score; }
  }
  return best ? { kind: 'select-action', token: best.token } : null;
}

function rootDecision(request) {
  const observation = request?.observation;
  const deckCount = opponentDeckCount(observation);

  if (deckCount === 0 && terminalEndTurnSafety(request)) {
    const pass = passAction(request);
    if (pass) return { kind: 'select-action', token: pass.token };
  }

  if (terminalWindow(request)) {
    const bellelba = findAction(request, BELLELBA);
    if (bellelba && hasCard(observation?.ownHand, BELLELBA)) {
      return { kind: 'select-action', token: bellelba.token };
    }

    const n = findAction(request, N_SUPPORTER);
    if (n && hasCard(observation?.ownHand, N_SUPPORTER) &&
        nForcesOpponentDeckZero(observation)) {
      return { kind: 'select-action', token: n.token };
    }

    const seeker = findAction(request, VS_SEEKER);
    if (seeker && itemAvailable(observation) &&
        hasCard(observation?.ownPublic?.discard, BELLELBA)) {
      return { kind: 'select-action', token: seeker.token };
    }
  } else if (supporterAvailable(observation) && terminalEndTurnSafety(request)) {
    const n = findAction(request, N_SUPPORTER);
    if (n && hasCard(observation?.ownHand, N_SUPPORTER) &&
        nForcesOpponentDeckZero(observation)) {
      return { kind: 'select-action', token: n.token };
    }
  }

  const funding = fundingDecision(request);
  if (funding) return funding;
  return { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ROOT_ACTION' };
}

function sourceText(prompt) {
  return [
    prompt?.source?.sourcePrinting,
    prompt?.source?.effectName,
    prompt?.publicMetadata?.sourcePrinting,
    prompt?.publicMetadata?.sourceEffect,
    prompt?.description
  ].filter(value => typeof value === 'string').join(' ');
}

function chooseDecline(choices) {
  return list(choices).find(choice => /^(?:no|false|decline|cancel)$/i.test(choice?.label ?? '')) ??
    list(choices).find(choice => choice?.kind === 'cancel') ?? null;
}

function bellelbaPromptDecision(prompt) {
  const choices = list(prompt?.choices);
  if (prompt?.promptType === 'ChooseCardsPrompt') {
    const minimum = prompt?.publicMetadata?.minimumCount;
    if (minimum === 0) {
      const empty = choices.find(choice => choice?.kind === 'empty-selection');
      if (empty) return { kind: 'select-choice', token: empty.token };
      const cancel = choices.find(choice => choice?.kind === 'cancel');
      if (cancel) return { kind: 'select-choice', token: cancel.token };
    }
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_CARD_COMBINATION_SOURCE' };
  }

  if (['ConfirmPrompt', 'SelectPrompt', 'SelectOptionPrompt'].includes(prompt?.promptType)) {
    const decline = chooseDecline(choices);
    if (decline) return { kind: 'select-choice', token: decline.token };
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_CONFIRMATION_SOURCE' };
  }

  return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
}

function vsSeekerPromptDecision(prompt) {
  if (prompt?.promptType !== 'ChooseCardsPrompt') {
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
  }
  const choices = list(prompt.choices);
  const bellelba = choices.find(choice =>
    matches(choice, BELLELBA) &&
    (choice?.publicMetadata?.ownerSeat === undefined || choice.publicMetadata.ownerSeat === 'actor') &&
    (choice?.publicMetadata?.sourceZone === undefined || choice.publicMetadata.sourceZone === 'discard'));
  if (!bellelba) return { kind: 'abstain', reasonCode: 'NO_USEFUL_CARD_CHOICE' };

  const selectionType = prompt?.publicMetadata?.selectionType;
  if (selectionType === 'card-combination') {
    return { kind: 'select-choices', tokens: [bellelba.token] };
  }
  return { kind: 'select-choice', token: bellelba.token };
}

function choiceOwner(choice) { return choice?.publicMetadata?.ownerSeat ?? null; }
function choiceZone(choice) {
  return choice?.publicMetadata?.sourceZone ?? choice?.publicMetadata?.targetZone ??
    choice?.publicMetadata?.zone ?? null;
}
function promptMaximum(prompt) {
  const m = prompt?.publicMetadata?.maximumCount;
  return Number.isSafeInteger(m) ? m :
    (Number.isSafeInteger(prompt?.publicMetadata?.count) ? prompt.publicMetadata.count : 1);
}
function chooseOption(prompt, pattern) {
  const row = list(prompt?.choices).find(choice => pattern.test(choice?.label ?? ''));
  return row ? { kind: 'select-choice', token: row.token } : null;
}
function guzmaHalaPromptDecision(request) {
  const prompt = request.prompt;
  const observation = request.observation;
  const choices = list(prompt?.choices);
  if (prompt?.promptType === 'SelectOptionPrompt' || prompt?.promptType === 'SelectPrompt') {
    const needs = usefulGuzmaHalaTargets(observation);
    const pay = canPayGuzmaHala(observation) &&
      (needs.needDce || needs.needJammer || needs.needThunder);
    const wanted = pay ? /Discard 2/i : /Stadium card/i;
    return chooseOption(prompt, wanted) ??
      { kind: 'abstain', reasonCode: 'NO_USEFUL_CARD_CHOICE' };
  }
  if (prompt?.promptType !== 'ChooseCardsPrompt') {
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
  }
  const handChoices = choices.filter(choice =>
    choiceOwner(choice) === 'actor' && choiceZone(choice) === 'hand');
  if (handChoices.length) {
    const ranked = handChoices
      .map(choice => ({ choice, score: discardPriority(choice, observation) }))
      .filter(row => row.score > 0)
      .sort((a, b) => b.score - a.score ||
        String(a.choice.token).localeCompare(String(b.choice.token)));
    if (ranked.length < 2) return { kind: 'abstain', reasonCode: 'NO_USEFUL_CARD_CHOICE' };
    return { kind: 'select-choices', tokens: ranked.slice(0, 2).map(row => row.choice.token) };
  }
  const max = promptMaximum(prompt);
  const selected = [];
  function add(pattern) {
    if (selected.length >= max) return;
    const row = choices.find(choice => !selected.includes(choice) &&
      choiceOwner(choice) === 'actor' && choiceZone(choice) === 'deck' &&
      matches(choice, pattern));
    if (row) selected.push(row);
  }
  const needs = usefulGuzmaHalaTargets(observation);
  if (needs.needThunder) add(THUNDER_MOUNTAIN);
  else add(WONDROUS_LABYRINTH);
  if (max > 1 && needs.needDce) add(DOUBLE_COLORLESS);
  if (max > 1 && needs.needJammer) add(TOOL_JAMMER);
  if (!selected.length) add(THUNDER_MOUNTAIN);
  if (!selected.length) return { kind: 'abstain', reasonCode: 'NO_USEFUL_CARD_CHOICE' };
  return { kind: 'select-choices', tokens: selected.map(choice => choice.token) };
}

function pokemonFromChoice(choice, observation) {
  if (choiceOwner(choice) !== 'opponent') return null;
  const zone = choice?.publicMetadata?.targetZone ?? choiceZone(choice);
  const index = choice?.publicMetadata?.selectionIndex ??
    choice?.publicMetadata?.targetIndex ?? 0;
  if (zone === 'active') return opponentActive(observation);
  if (zone === 'bench' && Number.isSafeInteger(index)) {
    return list(observation?.opponentPublic?.bench)[index] ?? null;
  }
  return null;
}
function opponentPokemonChoice(prompt, observation, mode = 'energy') {
  const rows = list(prompt?.choices).filter(choice => choiceOwner(choice) === 'opponent');
  let best = null;
  let bestScore = -1;
  for (const choice of rows) {
    const pokemon = pokemonFromChoice(choice, observation);
    let score = choice?.publicMetadata?.targetZone === 'active' ? 2 : 0;
    if (mode === 'special') {
      score += list(pokemon?.energies).filter(specialEnergyPrinting).length * 20;
    } else if (mode === 'tool') {
      score += list(pokemon?.tools).length * 20;
    } else {
      score += list(pokemon?.energies).length * 10;
    }
    if (score > bestScore) { best = choice; bestScore = score; }
  }
  return best ? { kind: 'select-choices', tokens: [best.token] } :
    { kind: 'abstain', reasonCode: 'NO_USEFUL_CARD_CHOICE' };
}
function attachedCardChoice(prompt, preferSpecial = false) {
  const cards = list(prompt?.choices).filter(choice =>
    choice?.kind !== 'empty-selection' && choice?.kind !== 'cancel');
  const preferred = preferSpecial ? cards.find(choice => specialEnergyPrinting(choice)) : null;
  const row = preferred ?? cards.find(choice => specialEnergyPrinting(choice)) ?? cards[0];
  return row ? { kind: 'select-choices', tokens: [row.token] } :
    { kind: 'abstain', reasonCode: 'NO_USEFUL_CARD_CHOICE' };
}
function plumeriaPromptDecision(request) {
  const prompt = request.prompt;
  const observation = request.observation;
  if (prompt?.promptType === 'ChoosePokemonPrompt') {
    return opponentPokemonChoice(prompt, observation, 'energy');
  }
  if (prompt?.promptType !== 'ChooseCardsPrompt') {
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
  }
  const hand = list(prompt.choices).filter(choice =>
    choiceOwner(choice) === 'actor' && choiceZone(choice) === 'hand');
  if (hand.length) {
    const ranked = hand
      .map(choice => ({ choice, score: discardPriority(choice, observation) }))
      .filter(row => row.score > 0)
      .sort((a, b) => b.score - a.score ||
        String(a.choice.token).localeCompare(String(b.choice.token)));
    if (ranked.length < 2) {
      return { kind: 'abstain', reasonCode: 'NO_USEFUL_CARD_CHOICE' };
    }
    return { kind: 'select-choices', tokens: ranked.slice(0, 2).map(row => row.choice.token) };
  }
  return attachedCardChoice(prompt, true);
}
function enhancedHammerPromptDecision(request) {
  if (request.prompt?.promptType === 'ChoosePokemonPrompt') {
    return opponentPokemonChoice(request.prompt, request.observation, 'special');
  }
  if (request.prompt?.promptType === 'ChooseCardsPrompt') {
    return attachedCardChoice(request.prompt, true);
  }
  return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
}
function teamFlarePromptDecision(request) {
  if (request.prompt?.promptType === 'ChooseCardsPrompt') {
    return attachedCardChoice(request.prompt, true);
  }
  return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
}
function fabaPromptDecision(request) {
  const prompt = request.prompt;
  if (prompt?.promptType === 'SelectPrompt' || prompt?.promptType === 'SelectOptionPrompt') {
    return chooseOption(prompt, /Special Energy/i) ?? chooseOption(prompt, /Tool/i) ??
      chooseOption(prompt, /Stadium/i) ??
      { kind: 'abstain', reasonCode: 'NO_USEFUL_CARD_CHOICE' };
  }
  if (prompt?.promptType === 'ChoosePokemonPrompt') {
    const special = opponentPokemonChoice(prompt, request.observation, 'special');
    if (special.kind === 'select-choices') return special;
    return opponentPokemonChoice(prompt, request.observation, 'tool');
  }
  if (prompt?.promptType === 'ChooseCardsPrompt') {
    return attachedCardChoice(prompt, true);
  }
  return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
}

function eligiblePromptCards(prompt) {
  return list(prompt?.choices).filter(choice =>
    choice?.kind !== 'empty-selection' && choice?.kind !== 'cancel');
}
function chooseUpToTwo(prompt, scoreFn) {
  const rows = eligiblePromptCards(prompt)
    .map(choice => ({ choice, score: scoreFn(choice) }))
    .sort((a, b) => b.score - a.score ||
      String(a.choice.token).localeCompare(String(b.choice.token)));
  if (!rows.length) {
    const empty = list(prompt?.choices).find(choice => choice?.kind === 'empty-selection');
    return empty ? { kind: 'select-choice', token: empty.token } :
      { kind: 'abstain', reasonCode: 'NO_USEFUL_CARD_CHOICE' };
  }
  return { kind: 'select-choices', tokens: rows.slice(0, Math.min(2, promptMaximum(prompt)))
    .map(row => row.choice.token) };
}
function blindDisruptionPromptDecision(request, mode) {
  const prompt = request.prompt;
  if (prompt?.promptType !== 'ChooseCardsPrompt') {
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
  }
  if (mode === 'eri') {
    return chooseUpToTwo(prompt, choice => {
      const p = textOf(choice);
      if (VS_SEEKER.test(p)) return 100;
      if (NEST_BALL.test(p) || TAG_CALL.test(p)) return 90;
      if (ENHANCED_HAMMER.test(p)) return 85;
      return 50;
    });
  }
  if (mode === 'sidney') {
    return chooseUpToTwo(prompt, choice => {
      const meta = choice?.publicMetadata ?? {};
      if (meta.energyType === 'Special' ||
          (/Energy\b/i.test(textOf(choice)) && specialEnergyPrinting(choice))) return 100;
      if ((meta.cardType ?? '').toLowerCase().includes('tool')) return 90;
      if ((meta.cardType ?? '').toLowerCase().includes('stadium')) return 80;
      return 50;
    });
  }
  return chooseUpToTwo(prompt, choice =>
    (choice?.publicMetadata?.energyType === 'Special' || specialEnergyPrinting(choice)) ? 100 : 60);
}
function trainersMailPromptDecision(request) {
  const prompt = request.prompt;
  if (prompt?.promptType !== 'ChooseCardsPrompt') {
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
  }
  const rows = eligiblePromptCards(prompt)
    .map(choice => ({ choice, score: trainersMailChoiceScore(choice, request.observation) }))
    .sort((a, b) => b.score - a.score ||
      String(a.choice.token).localeCompare(String(b.choice.token)));
  if (rows.length && rows[0].score > 0) {
    return { kind: 'select-choices', tokens: [rows[0].choice.token] };
  }
  const empty = list(prompt.choices).find(choice => choice?.kind === 'empty-selection');
  return empty ? { kind: 'select-choice', token: empty.token } :
    { kind: 'abstain', reasonCode: 'NO_USEFUL_CARD_CHOICE' };
}

function voltCyclonePromptDecision(request) {
  const prompt = request.prompt;
  if (prompt?.promptType !== 'AttachEnergyPrompt') {
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
  }
  const bench = list(request?.observation?.ownPublic?.bench);
  let best = null;
  let bestScore = -1;
  for (const choice of list(prompt.choices)) {
    if (choice?.kind !== 'energy') continue;
    let score = matches(choice, CAPTURE_ENERGY) ? 100 :
      matches(choice, SPEED_LIGHTNING) ? 90 :
      matches(choice, DOUBLE_COLORLESS) ? 60 : 80;
    const index = choice?.publicMetadata?.targetIndex ??
      choice?.publicMetadata?.benchIndex ??
      choice?.publicMetadata?.selectionIndex;
    if (Number.isSafeInteger(index)) {
      score -= list(bench[index]?.energies).length * 5;
    }
    if (score > bestScore) { best = choice; bestScore = score; }
  }
  return best ? { kind: 'select-choice', token: best.token } :
    { kind: 'abstain', reasonCode: 'NO_USEFUL_CARD_CHOICE' };
}

function ironThornsSearchPromptDecision(prompt) {
  if (prompt?.promptType !== 'ChooseCardsPrompt') {
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
  }
  const row = list(prompt.choices).find(choice =>
    choiceOwner(choice) === 'actor' && choiceZone(choice) === 'deck' &&
    matches(choice, IRON_THORNS));
  if (row) return { kind: 'select-choices', tokens: [row.token] };
  const empty = list(prompt.choices).find(choice => choice?.kind === 'empty-selection');
  if (empty) return { kind: 'select-choice', token: empty.token };
  return { kind: 'abstain', reasonCode: 'NO_USEFUL_CARD_CHOICE' };
}

function tagCallPromptDecision(prompt) {
  if (prompt?.promptType !== 'ChooseCardsPrompt') {
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
  }
  const max = promptMaximum(prompt);
  const deck = list(prompt.choices).filter(choice =>
    choiceOwner(choice) === 'actor' && choiceZone(choice) === 'deck');
  const selected = [];
  for (const pattern of [GUZMA_HALA, CYNTHIA_CAITLIN]) {
    if (selected.length >= max) break;
    const row = deck.find(choice => matches(choice, pattern));
    if (row) selected.push(row);
  }
  if (!selected.length) return { kind: 'abstain', reasonCode: 'NO_USEFUL_CARD_CHOICE' };
  return { kind: 'select-choices', tokens: selected.map(choice => choice.token) };
}

function promptDecision(request) {
  const prompt = request?.prompt;
  const source = sourceText(prompt);
  if (BELLELBA.test(source)) return bellelbaPromptDecision(prompt);
  if (VS_SEEKER.test(source)) return vsSeekerPromptDecision(prompt);
  if (GUZMA_HALA.test(source)) return guzmaHalaPromptDecision(request);
  if (TAG_CALL.test(source)) return tagCallPromptDecision(prompt);
  if (PLUMERIA.test(source)) return plumeriaPromptDecision(request);
  if (ENHANCED_HAMMER.test(source)) return enhancedHammerPromptDecision(request);
  if (TEAM_FLARE_GRUNT.test(source)) return teamFlarePromptDecision(request);
  if (FABA.test(source)) return fabaPromptDecision(request);
  if (ERI.test(source)) return blindDisruptionPromptDecision(request, 'eri');
  if (SIDNEY.test(source)) return blindDisruptionPromptDecision(request, 'sidney');
  if (TEAM_SKULL_GRUNT.test(source)) return blindDisruptionPromptDecision(request, 'energy');
  if (TRAINERS_MAIL.test(source)) return trainersMailPromptDecision(request);
  if (VOLT_CYCLONE.test(prompt?.source?.effectName ?? '') ||
      VOLT_CYCLONE.test(prompt?.publicMetadata?.sourceAttack ?? '')) {
    return voltCyclonePromptDecision(request);
  }
  if (NEST_BALL.test(source) || HEAVY_BALL.test(source) || CAPTURE_ENERGY.test(source)) {
    return ironThornsSearchPromptDecision(prompt);
  }
  return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
}

function createPolicy({ role, seat, policyVersion, config }) {
  if (role !== 'opponent' || (seat !== 0 && seat !== 1) ||
      policyVersion !== POLICY_VERSION || !config ||
      typeof config !== 'object' || Array.isArray(config) ||
      Object.keys(config).length !== 0) {
    throw new Error('AGENT18_RANK24_POLICY_INIT_MISMATCH');
  }
  return Object.freeze({
    decide(request) {
      if (!request || request.role !== 'opponent' || request.seat !== seat ||
          request.observation?.actorSeat !== seat) {
        return { kind: 'abstain', reasonCode: 'ROLE_SEAT_BINDING_MISMATCH' };
      }
      return request.prompt === null ? rootDecision(request) : promptDecision(request);
    }
  });
}

module.exports = {
  POLICY_VERSION,
  SOURCE_RANK,
  SOURCE_LIST_BLOB_SHA1,
  SOURCE_INVENTORY_SHA256,
  SOURCE_CARD_COUNTS,
  ENGINE_PIN,
  createPolicy,
  rootDecision,
  promptDecision,
  terminalEndTurnSafety,
  terminalWindow,
  nForcesOpponentDeckZero,
  activeKoWouldEndGame,
  damagingSpecialCondition,
  fundingScore,
  fundingDecision,
  guzmaHalaPromptDecision,
  tagCallPromptDecision,
  energyUnits,
  ironThornsSearchPromptDecision,
  ownThornsInPlay,
  benchOpen,
  specialEnergyPrinting,
  opponentSpecialEnergyCount,
  plumeriaPromptDecision,
  enhancedHammerPromptDecision,
  teamFlarePromptDecision,
  fabaPromptDecision,
  voltCyclonePromptDecision,
  remainingHp,
  trainersMailChoiceScore,
  trainersMailPromptDecision,
  blindDisruptionPromptDecision,
  opponentHandCount
};
