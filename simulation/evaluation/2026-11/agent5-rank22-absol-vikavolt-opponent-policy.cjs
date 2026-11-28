'use strict';
/* Rank-22 Aichi Absol/Garbodor/Vikavolt V opponent policy v1.
   Adapted from Agent44's rank-8 actor-only worker; rank-22 additions by Agent5.
   Deterministic, actor-view-only and fail-closed. This is a source-bound prototype,
   not a competent-opponent attestation or native matchup result. */
const POLICY_VERSION = 'agent5-rank22-absol-vikavolt-opponent-v1';
const SOURCE_RANK = 22;
const SOURCE_LIST_BLOB_SHA1 = 'ae773f6201d7aa69d31914dbfee66f3fba692200';
const SOURCE_ENTRY_JSON_SHA256 = null; // Not separately source-entry hash-certified.
const CANDIDATE_ENTRY_JSON_SHA256 = '4c18dd93ba49fd8f7d88aad573249dc6941b4cf61d52b99f80309345b5d58c59';
const ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const WORKER_PROTOCOL_BLOB_SHA1 = null; // Bind to current protocol before native admission.
const PRINT = Object.freeze({
  mega: /^Mega Absol ex MEG 86\b/i,
  vikavolt: /^Vikavolt V DAA 60\b/i,
  trubbish: /^Trubbish (?:FST 168|NVI 48)\b/i,
  garbodor: /^Garbodor BKP 57\b/i,
  tapuKoko: /^Tapu Koko [♢◇] TEU 51\b/i,
  dedenne: /^Dedenne-GX UNB 57\b/i,
  crobat: /^Crobat V DAA 104\b/i,
  squawk: /^Squawkabilly ex PAL 169\b/i,
  tapuLele: /^Tapu Lele-GX GRI 60\b/i,
  budew: /^Budew ASC 16\b/i,
  lilliesDetermination: /^Lillie's Determination MEG 119\b/i,
  carmine: /^Carmine TWM 145\b/i,
  marnie: /^Marnie SSH 169\b/i,
  iono: /^Iono PAL 185\b/i,
  roxanne: /^Roxanne ASR 150\b/i,
  guzma: /^Guzma BUS 115\b/i,
  crispin: /^Crispin SCR 133\b/i,
  wally: /^Wally ROS 94\b/i,
  karen: /^Karen XYP 177\b/i,
  vip: /^Battle VIP Pass FST 225\b/i,
  quick: /^Quick Ball FST 237\b/i,
  ultra: /^Ultra Ball MEG 131\b/i,
  darkPatch: /^Dark Patch ASR 139\b/i,
  enhancedHammer: /^Enhanced Hammer TWM 148\b/i,
  boost: /^Boost Shake EVS 142\b/i,
  battleCompressor: /^Battle Compressor PHF 92\b/i,
  secret: /^Secret Box TWM 163\b/i,
  nightStretcher: /^Night Stretcher ASC 196\b/i,
  rod: /^Super Rod PAL 188\b/i,
  pokemonCommunication: /^Pokémon Communication TEU 152\b/i,
  heavyBall: /^Hisuian Heavy Ball ASR 146\b/i,
  fieldBlower: /^Field Blower GRI 125\b/i,
  adventureBag: /^Adventure Bag LOT 167\b/i,
  vs: /^VS Seeker PHF 109\b/i,
  float: /^Float Stone BKT 137\b/i,
  forest: /^Forest Seal Stone SIT 156\b/i,
  muscle: /^Muscle Band XY 121\b/i,
  temple: /^Temple of Sinnoh ASR 155\b/i,
  dark: /^Darkness Energy MEE 15\b/i,
  lightning: /^Lightning Energy MEE 12\b/i,
  stealthyHood: /^Stealthy Hood UNB 186\b/i,
  unfairStamp: /^Unfair Stamp TWM 165\b/i,
  shadowVmax: /^Shadow Rider Calyrex VMAX CRE 75\b/i,
  shadowV: /^Shadow Rider Calyrex V CRE 74\b/i,
  clefairy: /^Lillie's Clefairy ex JTG 56\b/i,
  radiantEternatus: /^Radiant Eternatus CRZ 105\b/i,
  mysteriousTreasure: /^Mysterious Treasure FLI 113\b/i,
  fogCrystal: /^Fog Crystal CRE 140\b/i,
  psychicEnergy: /^Psychic Energy MEE 13\b/i,
  arven: /^Arven SVI 166\b/i
});
const SOURCE_INVENTORY = Object.freeze([
  ["Mega Absol ex MEG 86", 2],
  ["Vikavolt V DAA 60", 2],
  ["Trubbish FST 168", 1],
  ["Trubbish NVI 48", 1],
  ["Garbodor BKP 57", 2],
  ["Crobat V DAA 104", 1],
  ["Squawkabilly ex PAL 169", 1],
  ["Tapu Lele-GX GRI 60", 1],
  ["Dedenne-GX UNB 57", 1],
  ["Tapu Koko ♢ TEU 51", 1],
  ["Budew ASC 16", 1],
  ["Lillie's Determination MEG 119", 2],
  ["Marnie SSH 169", 1],
  ["Iono PAL 185", 1],
  ["Roxanne ASR 150", 1],
  ["Guzma BUS 115", 1],
  ["Wally ROS 94", 1],
  ["Karen XYP 177", 1],
  ["Quick Ball FST 237", 4],
  ["VS Seeker PHF 109", 3],
  ["Dark Patch ASR 139", 3],
  ["Battle Compressor PHF 92", 2],
  ["Battle VIP Pass FST 225", 2],
  ["Night Stretcher ASC 196", 2],
  ["Secret Box TWM 163", 1],
  ["Ultra Ball MEG 131", 1],
  ["Pokémon Communication TEU 152", 1],
  ["Enhanced Hammer TWM 148", 1],
  ["Field Blower GRI 125", 1],
  ["Adventure Bag LOT 167", 1],
  ["Float Stone BKT 137", 4],
  ["Forest Seal Stone SIT 156", 1],
  ["Muscle Band XY 121", 1],
  ["Temple of Sinnoh ASR 155", 2],
  ["Darkness Energy MEE 15", 5],
  ["Lightning Energy MEE 12", 3],
]);
const EXECUTABLE = new Set(['play-card', 'attack', 'retreat', 'use-ability', 'use-stadium', 'pass']);
function list(value) { return Array.isArray(value) ? value : []; }
function textOf(value) {
  if (typeof value === 'string') return value;
  if (typeof value?.printing === 'string') return value.printing;
  if (typeof value?.fullName === 'string') return value.fullName;
  if (typeof value?.label === 'string') return value.label;
  return '';
}
function matches(value, pattern) {
  const raw = textOf(value);
  if (pattern.test(raw)) return true;
  // Twinleaf's pinned card.fullName frequently omits the card number.
  // Bind only to an exact source rank-22 identity and matching native set,
  // not to a similarly named printing from a different set.
  for (const [canonical] of SOURCE_INVENTORY) {
    if (!pattern.test(canonical)) continue;
    const parts = /^(.*) ([A-Z0-9]{2,5}) ([A-Z0-9]+)$/i.exec(canonical);
    if (!parts) continue;
    const [, name, set, number] = parts;
    if (raw === name || raw === name + ' ' + set) return true;
    if (set === 'MEG' && (raw === name + ' M1L' ||
        raw === name + ' M1S')) return true;
  }
  return false;
}
function slots(player) {
  return [{ zone: 'active', index: 0, pokemon: player?.active ?? null },
    ...list(player?.bench).map((pokemon, index) => ({ zone: 'bench', index, pokemon }))]
    .filter(row => row.pokemon && row.pokemon.concealed !== true);
}
function count(player, pattern) { return slots(player).filter(row => matches(row.pokemon.printing, pattern)).length; }
function benchCount(player) { return list(player?.bench).filter(Boolean).length; }
function handCount(observation) { return list(observation?.ownHand).length; }
function deckCount(observation) {
  return Number.isSafeInteger(observation?.ownPublic?.deckCount) ? observation.ownPublic.deckCount : 0;
}
function opponentHandCount(observation) {
  return Number.isSafeInteger(observation?.opponentPublic?.handCount) ? observation.opponentPublic.handCount : 0;
}
function supporterAvailable(observation) {
  return observation?.ownTurnResources?.supporterPlayedTurn === 0 &&
    observation?.ownTurnResources?.supporterPlayLocked !== true &&
    observation?.ownPublic?.publicTurnRestrictions?.supporterPlayLocked !== true;
}
function energyCount(pokemon) { return list(pokemon?.energies).length; }
function discardCount(player, pattern) { return list(player?.discard).filter(card => matches(card, pattern)).length; }
function hasGarbodor(observation) { return count(observation?.ownPublic, PRINT.garbodor) > 0; }
function garbotoxinLive(observation) {
  return [observation?.ownPublic, observation?.opponentPublic].some(player =>
    slots(player).some(row => matches(row.pokemon.printing, PRINT.garbodor) &&
      list(row.pokemon.tools).length > 0));
}
function supportWindowBeforeSelfLock(observation) {
  if (garbotoxinLive(observation) || benchCount(observation?.ownPublic) >= 5) return false;
  const hand = list(observation.ownHand);
  return hand.length <= 4 && hand.some(card => matches(card, PRINT.crobat)) ||
    supporterAvailable(observation) && hand.some(card => matches(card, PRINT.tapuLele));
}
function hasTrubbish(observation) { return count(observation?.ownPublic, PRINT.trubbish) > 0; }
function hasMegaAbsol(observation) { return count(observation?.ownPublic, PRINT.mega) > 0; }
function hasTapuKoko(observation) { return count(observation?.ownPublic, PRINT.tapuKoko) > 0; }
function discardHas(player, pattern) { return discardCount(player, pattern) > 0; }
function remainingHp(pokemon) {
  return pokemon && Number.isFinite(pokemon.hp) && Number.isFinite(pokemon.damage)
    ? pokemon.hp - pokemon.damage : -1;
}
function owner(choice) { return choice?.publicMetadata?.ownerSeat ?? null; }
function zone(choice) {
  return choice?.publicMetadata?.sourceZone ??
    choice?.publicMetadata?.targetZone ??
    choice?.publicMetadata?.zone ?? null;
}
function ownPokemon(choice, observation) {
  const printing = textOf(choice);
  const targetZone = choice?.publicMetadata?.targetZone ?? choice?.publicMetadata?.zone ?? null;
  const index = choice?.publicMetadata?.benchIndex ?? choice?.publicMetadata?.targetIndex;
  if (targetZone === 'active') {
    const pokemon = observation.ownPublic?.active;
    return pokemon && pokemon.printing === printing ? { zone: targetZone, index: 0, pokemon } : null;
  }
  if (targetZone === 'bench' && Number.isSafeInteger(index)) {
    const pokemon = observation.ownPublic?.bench?.[index];
    return pokemon && pokemon.printing === printing ? { zone: targetZone, index, pokemon } : null;
  }
  const found = slots(observation.ownPublic).filter(row =>
    row.zone === targetZone && row.pokemon.printing === printing);
  return found.length === 1 ? found[0] : null;
}
function opponentPokemon(choice, observation) {
  const printing = textOf(choice);
  const targetZone = choice?.publicMetadata?.targetZone ?? choice?.publicMetadata?.zone ?? null;
  const index = choice?.publicMetadata?.benchIndex ?? choice?.publicMetadata?.targetIndex;
  if (targetZone === 'active') {
    const pokemon = observation.opponentPublic?.active;
    return pokemon && pokemon.printing === printing ? { zone: targetZone, index: 0, pokemon } : null;
  }
  if (targetZone === 'bench' && Number.isSafeInteger(index)) {
    const pokemon = observation.opponentPublic?.bench?.[index];
    return pokemon && pokemon.printing === printing ? { zone: targetZone, index, pokemon } : null;
  }
  const found = slots(observation.opponentPublic).filter(row =>
    row.zone === targetZone && row.pokemon.printing === printing);
  return found.length === 1 ? found[0] : null;
}
function prizeLiability(pokemon) {
  const subtypes = list(pokemon?.printed?.subtypes).join(' ').toLowerCase();
  if (/\bvmax\b/.test(subtypes) || /VMAX/i.test(pokemon?.printing ?? '')) return 3;
  if (/\b(?:v|gx|ex)\b/.test(subtypes) || /(?: Pokémon )?(?:V|GX|ex)\b/.test(pokemon?.printing ?? '')) return 2;
  return 1;
}
function opponentTargetScore(choice, observation, damage = 220) {
  if (owner(choice) !== 'opponent' || !['bench', 'active'].includes(zone(choice))) return 0;
  const row = opponentPokemon(choice, observation);
  if (!row) return 0;
  const hp = remainingHp(row.pokemon);
  return prizeLiability(row.pokemon) * 60 +
    (hp > 0 && hp <= damage ? 190 : 0) +
    energyCount(row.pokemon) * 14 +
    Math.max(0, row.pokemon.damage ?? 0) * 0.2;
}
function ownSwitchScore(choice, observation) {
  if (owner(choice) !== 'actor' || zone(choice) !== 'bench') return 0;
  const row = ownPokemon(choice, observation);
  if (!row) return 0;
  if (matches(row.pokemon.printing, PRINT.mega) && energyCount(row.pokemon) >= 2) return 250;
  if (matches(row.pokemon.printing, PRINT.mega)) return 175;
  if (matches(row.pokemon.printing, PRINT.garbodor)) return 80;
  if (matches(row.pokemon.printing, PRINT.tapuKoko)) return 55;
  return 20 + energyCount(row.pokemon) * 5;
}
function toolScore(choice, observation) {
  if (owner(choice) !== 'actor' || zone(choice) !== 'deck') return 0;
  const printing = textOf(choice);
  const own = observation.ownPublic;
  if (matches(printing, PRINT.forest)) {
    const target = slots(own).some(row =>
      matches(row.pokemon.printing, PRINT.crobat) && list(row.pokemon.tools).length === 0);
    return target && !observation.ownTurnResources?.vstarUsed ? 270 : 35;
  }
  if (matches(printing, PRINT.float)) {
    const garbodorNeedsTool = slots(own).some(row =>
      matches(row.pokemon.printing, PRINT.garbodor) && list(row.pokemon.tools).length === 0);
    if (garbodorNeedsTool) return 280;
    const trubbishNeedsTool = slots(own).some(row =>
      matches(row.pokemon.printing, PRINT.trubbish) && list(row.pokemon.tools).length === 0);
    if (trubbishNeedsTool && !hasGarbodor(observation)) return 260;
    const megaNeedsTool = slots(own).some(row =>
      matches(row.pokemon.printing, PRINT.mega) && list(row.pokemon.tools).length === 0);
    return megaNeedsTool ? 120 : 45;
  }
  if (matches(printing, PRINT.muscle)) {
    return slots(own).some(row =>
      matches(row.pokemon.printing, PRINT.mega) && list(row.pokemon.tools).length === 0) ? 180 : 35;
  }
  return 0;
}
function basicScore(choice, observation) {
  if (owner(choice) !== 'actor' || zone(choice) !== 'deck') return 0;
  const printing = textOf(choice);
  const own = observation.ownPublic;
  if (matches(printing, PRINT.trubbish)) return !hasGarbodor(observation) && count(own, PRINT.trubbish) < 2 ? 320 : 20;
  if (matches(printing, PRINT.vikavolt)) return count(own, PRINT.vikavolt) < 1 ? 305 : 45;
  if (matches(printing, PRINT.mega)) return count(own, PRINT.mega) < 2 ? 275 : 25;
  if (matches(printing, PRINT.dedenne)) return !garbotoxinLive(observation) && handCount(observation) <= 4 ? 190 : 35;
  if (matches(printing, PRINT.crobat)) return !garbotoxinLive(observation) && handCount(observation) <= 4 ? 175 : 35;
  if (matches(printing, PRINT.squawk)) return observation.globalTurn <= 2 && handCount(observation) <= 2 ? 155 : 15;
  if (matches(printing, PRINT.tapuLele)) return !garbotoxinLive(observation) && supporterAvailable(observation) ? 135 : 35;
  if (matches(printing, PRINT.tapuKoko)) return !hasTapuKoko(observation) && discardCount(own, PRINT.lightning) >= 2 ? 145 : 45;
  if (matches(printing, PRINT.budew)) return count(own, PRINT.budew) === 0 && observation.globalTurn <= 3 ? 75 : 10;
  return 0;
}
function ultraBallSearchScore(choice, observation) {
  if (owner(choice) !== 'actor' || zone(choice) !== 'deck') return 0;
  if (matches(choice, PRINT.garbodor)) {
    return hasTrubbish(observation) && !hasGarbodor(observation) ? 390 : 0;
  }
  return basicScore(choice, observation);
}
function ultraBallUsablePayment(observation) {
  const hand = list(observation.ownHand);
  const spentIndex = hand.findIndex(card => matches(card, PRINT.ultra));
  if (spentIndex < 0) return false;
  const remaining = hand.filter((_, index) => index !== spentIndex);
  return remaining.filter(card => discardScore(card, {
    ...observation, ownHand: remaining
  }) > 0).length >= 2;
}
function cardSearchScore(choice, observation) {
  if (owner(choice) !== 'actor' || zone(choice) !== 'deck') return 0;
  const printing = textOf(choice);
  if (matches(printing, PRINT.garbodor)) return hasTrubbish(observation) && !hasGarbodor(observation) ? 340 : 0;
  if (matches(printing, PRINT.enhancedHammer)) return hammerLive(observation);
  if (matches(printing, PRINT.wally) || matches(printing, PRINT.karen))
    return supporterScore(printing, observation);
  if (matches(printing, PRINT.vikavolt)) return count(observation.ownPublic, PRINT.vikavolt) < 1 ? 270 : 35;
  if (matches(printing, PRINT.boost)) return hasTrubbish(observation) && !hasGarbodor(observation) ? 285 : 0;
  if (matches(printing, PRINT.vip)) return observation.globalTurn <= 2 && benchCount(observation.ownPublic) < 5 ? 230 : 0;
  if (matches(printing, PRINT.quick)) {
    return count(observation.ownPublic, PRINT.trubbish) < 2 ||
      count(observation.ownPublic, PRINT.mega) < 2 ||
      count(observation.ownPublic, PRINT.vikavolt) < 1 ||
      count(observation.ownPublic, PRINT.dedenne) === 0 ? 190 : 35;
  }
  if (matches(printing, PRINT.ultra)) {
    return ultraBallUsablePayment(observation) &&
      (hasTrubbish(observation) && !hasGarbodor(observation) ||
       count(observation.ownPublic, PRINT.vikavolt) < 1 ||
       count(observation.ownPublic, PRINT.mega) < 2) ? 190 : 0;
  }
  if (matches(printing, PRINT.darkPatch)) {
    return discardHas(observation.ownPublic, PRINT.dark) &&
      slots(observation.ownPublic).some(row =>
        row.zone === 'bench' && matches(row.pokemon.printing, PRINT.mega) && energyCount(row.pokemon) < 3) ? 195 : 0;
  }
  if ([PRINT.float, PRINT.forest, PRINT.muscle].some(pattern => matches(printing, pattern))) {
    return toolScore({ ...choice, publicMetadata: { ownerSeat: 'actor', sourceZone: 'deck' } }, observation);
  }
  if (matches(printing, PRINT.guzma)) {
    return supporterAvailable(observation) && benchCount(observation.opponentPublic) > 0 ? 205 : 0;
  }
  if (matches(printing, PRINT.carmine)) {
    return supporterAvailable(observation) && handCount(observation) <= 4 ? 160 : 0;
  }
  if (matches(printing, PRINT.iono)) {
    return supporterAvailable(observation) && opponentHandCount(observation) >= 4 ? 150 : 0;
  }
  if (matches(printing, PRINT.marnie)) {
    return supporterScore(printing, observation);
  }
  if (matches(printing, PRINT.roxanne)) {
    return supporterAvailable(observation) && (observation.opponentPublic?.prizeCount ?? 6) <= 3 ? 175 : 0;
  }
  if (matches(printing, PRINT.lilliesDetermination)) {
    return supporterAvailable(observation) && handCount(observation) <= 3 ? 145 : 0;
  }
  if (matches(printing, PRINT.vs)) {
    return supporterAvailable(observation) &&
      [PRINT.guzma, PRINT.karen, PRINT.marnie, PRINT.wally, PRINT.carmine, PRINT.iono, PRINT.roxanne, PRINT.lilliesDetermination]
        .some(pattern => discardHas(observation.ownPublic, pattern)) ? 155 : 0;
  }
  if (matches(printing, PRINT.temple)) return list(observation.opponentPublic?.stadium).length > 0 ? 95 : 15;
  return 0;
}
function discardScore(choice, observation) {
  const printing = textOf(choice);
  const own = observation.ownPublic;
  const hand = list(observation.ownHand);
  if (matches(printing, PRINT.secret)) return 0;
  if (matches(printing, PRINT.garbodor) && !hasGarbodor(observation)) return 0;
  if (matches(printing, PRINT.trubbish) && !hasGarbodor(observation) && count(own, PRINT.trubbish) < 2) return 0;
  if (matches(printing, PRINT.mega) && count(own, PRINT.mega) < 2) return 0;
  if (matches(printing, PRINT.vikavolt) && count(own, PRINT.vikavolt) < 1) return 0;
  if (matches(printing, PRINT.tapuKoko) && !hasTapuKoko(observation)) return 0;
  if (matches(printing, PRINT.dedenne) && !hasGarbodor(observation) && handCount(observation) <= 4) return 0;
  if (matches(printing, PRINT.guzma) && supporterAvailable(observation) && benchCount(observation.opponentPublic) > 0) return 0;
  if (matches(printing, PRINT.marnie) && supporterScore(printing, observation) > 0) return 0;
  if ([PRINT.carmine, PRINT.iono, PRINT.roxanne, PRINT.lilliesDetermination, PRINT.crispin, PRINT.wally]
    .some(pattern => matches(printing, pattern))) return 0;
  if (matches(printing, PRINT.karen) && karenScore(observation) > 0) return 0;
  if (matches(printing, PRINT.vs) &&
      ![PRINT.guzma, PRINT.carmine, PRINT.iono, PRINT.roxanne, PRINT.lilliesDetermination]
        .some(pattern => discardHas(own, pattern))) return 0;
  if (matches(printing, PRINT.forest) && !observation.ownTurnResources?.vstarUsed &&
      slots(own).some(row => matches(row.pokemon.printing, PRINT.crobat) && list(row.pokemon.tools).length === 0)) return 0;
  if (matches(printing, PRINT.float) && slots(own).some(row =>
      list(row.pokemon.tools).length === 0 &&
      (matches(row.pokemon.printing, PRINT.garbodor) ||
        !hasGarbodor(observation) && matches(row.pokemon.printing, PRINT.trubbish)))) return 0;
  if (matches(printing, PRINT.dark)) return hand.filter(card => matches(card, PRINT.dark)).length > 2 ? 65 : 0;
  if (matches(printing, PRINT.lightning)) {
    return hand.filter(card => matches(card, PRINT.lightning)).length > 1 ? 55 : 0;
  }
  if (matches(printing, PRINT.vip)) return observation.globalTurn > 2 ? 110 : 0;
  if (matches(printing, PRINT.carmine)) return hand.length > 4 ? 35 : 10;
  if (matches(printing, PRINT.boost)) return hasGarbodor(observation) ? 75 : 0;
  if (matches(printing, PRINT.rod)) return 30;
  if (matches(printing, PRINT.ultra) || matches(printing, PRINT.quick)) return 20;
  return 0;
}
function protectedHandCard(card, observation) {
  const printing = textOf(card);
  const patterns = [PRINT.secret, PRINT.garbodor, PRINT.tapuKoko, PRINT.guzma, PRINT.carmine,
    PRINT.marnie,
    PRINT.iono, PRINT.roxanne, PRINT.lilliesDetermination, PRINT.crispin, PRINT.wally, PRINT.karen,
    PRINT.vs, PRINT.forest, PRINT.float, PRINT.boost];
  if (patterns.some(pattern => matches(printing, pattern))) return true;
  if (matches(printing, PRINT.trubbish)) return !hasGarbodor(observation) && count(observation.ownPublic, PRINT.trubbish) < 2;
  if (matches(printing, PRINT.mega)) return count(observation.ownPublic, PRINT.mega) < 2;
  if (matches(printing, PRINT.vikavolt)) return count(observation.ownPublic, PRINT.vikavolt) < 1;
  if (matches(printing, PRINT.dedenne)) return !garbotoxinLive(observation) && handCount(observation) <= 4;
  return false;
}
function safeToDiscardHand(observation) {
  return !list(observation.ownHand).some(card => protectedHandCard(card, observation));
}
function opponentHandDiscardScore(choice, observation) {
  if (owner(choice) !== 'opponent' || zone(choice) !== 'hand') return 0;
  const printing = textOf(choice);
  if (matches(printing, PRINT.fieldBlower)) return 320;
  if (matches(printing, PRINT.stealthyHood)) return 300;
  if (matches(printing, PRINT.unfairStamp)) return 280;
  if (matches(printing, PRINT.shadowVmax)) return 265;
  if (matches(printing, PRINT.guzma)) return 250;
  if (matches(printing, PRINT.shadowV)) return 240;
  if (matches(printing, PRINT.clefairy)) return 230;
  if (matches(printing, PRINT.radiantEternatus)) return 220;
  if (matches(printing, PRINT.mysteriousTreasure) || matches(printing, PRINT.fogCrystal)) return 190;
  if (matches(printing, PRINT.iono)) return 180;
  if (matches(printing, PRINT.vs) || matches(printing, PRINT.nightStretcher)) return 170;
  if (matches(printing, PRINT.arven) || matches(printing, PRINT.lilliesDetermination)) return 160;
  if (matches(printing, PRINT.psychicEnergy)) return 10;
  const type = choice?.publicMetadata?.cardType ?? '';
  if (/pokemon/i.test(type)) return 120;
  if (/energy/i.test(type)) return 10;
  if (/trainer|supporter|item|tool/i.test(type)) return 100;
  return 30;
}
function scoreAttack(item, observation) {
  const attack = item.attackName ?? '';
  const metadata = item.publicMetadata ?? {};
  if (metadata.attackCostPayable === false) return 0;
  const remaining = Number.isFinite(metadata.targetHp) && Number.isFinite(metadata.targetDamage)
    ? metadata.targetHp - metadata.targetDamage : -1;
  if (/^Terminal Period$/i.test(attack)) return metadata.targetDamage === 60 ? 340 : 0;
  if (/^Claw of Darkness$/i.test(attack)) {
    const damage = Number.isFinite(metadata.damageAfterWeakness) ? metadata.damageAfterWeakness :
      Number.isFinite(metadata.damage) ? metadata.damage : 200;
    return remaining > 0 && remaining <= damage ? 330 : 210;
  }
  if (/^Paralyzing Bolt$/i.test(attack)) {
    const damage = Number.isFinite(metadata.damageAfterWeakness) ? metadata.damageAfterWeakness : 50;
    return remaining > 0 && remaining <= damage ? 415 :
      (observation.opponentPublic?.handCount ?? 0) > 1 ? 265 : 205;
  }
  if (/^Super Zap Cannon$/i.test(attack)) {
    const damage = Number.isFinite(metadata.damageAfterWeakness) ? metadata.damageAfterWeakness : 190;
    return remaining > 0 && remaining <= damage ? 395 : 90; // Two-Energy discard is costly.
  }
  if (/^Motivate$/i.test(attack)) {
    return discardHas(observation.ownPublic, PRINT.dark) &&
      slots(observation.ownPublic).some(row => row.zone === 'bench' &&
        matches(row.pokemon.printing, PRINT.mega) && energyCount(row.pokemon) < 3) ? 230 : 0;
  }
  if (/^Itchy Pollen$/i.test(attack)) return 85;
  if (/^Suffocating Gas$/i.test(attack) || /^Venomous Hit$/i.test(attack)) return 25;
  return 0;
}
function regidragoThreat(observation) {
  const board = slots(observation.opponentPublic);
  const hasVstar = board.some(row => /^Regidrago VSTAR\b/i.test(row.pokemon.printing));
  const hasBasic = board.some(row => /^Regidrago V\b/i.test(row.pokemon.printing));
  return hasVstar ? 2 : hasBasic ? 1 : 0;
}
function regidragoDonorCount(observation) {
  const names = /^(?:Dragapult ex|Dialga-GX|Kyurem|Hisuian Goodra VSTAR|Noivern ex|Mega Dragonite ex)\b/i;
  return list(observation.opponentPublic?.discard)
    .filter(card => names.test(textOf(card))).length;
}
function karenScore(observation) {
  if (!supporterAvailable(observation)) return 0;
  const opponent = regidragoThreat(observation);
  const donors = regidragoDonorCount(observation);
  if (!opponent || !donors) return 0;
  return opponent === 2 ? 210 + Math.min(donors, 3) * 45 :
    155 + Math.min(donors, 3) * 40;
}
function secretBoxAffordable(observation) {
  const hand = list(observation.ownHand);
  const boxIndex = hand.findIndex(card => matches(card, PRINT.secret));
  if (boxIndex < 0) return false;
  const remaining = hand.filter((_, index) => index !== boxIndex);
  return remaining.filter(card => discardScore(card, {
    ...observation, ownHand: remaining
  }) > 0).length >= 3;
}
function secretBoxSetupValue(observation) {
  if (!secretBoxAffordable(observation) || deckCount(observation) === 0)
    return 0;
  const own = observation.ownPublic;
  if (hasTrubbish(observation) && !hasGarbodor(observation) &&
      supporterAvailable(observation)) return 340;
  if (count(own, PRINT.trubbish) === 0 && benchCount(own) < 5 &&
      supporterAvailable(observation)) return 295;
  if (slots(own).some(row => matches(row.pokemon.printing, PRINT.garbodor) &&
      list(row.pokemon.tools).length === 0)) return 275;
  return 0;
}
function wallyLineReady(observation) {
  return supporterAvailable(observation) && hasTrubbish(observation) &&
    !hasGarbodor(observation) && deckCount(observation) > 0;
}
function supporterScore(card, observation) {
  if (matches(card, PRINT.karen)) return karenScore(observation);
  if (matches(card, PRINT.marnie)) {
    const opponentHand = opponentHandCount(observation);
    const ownHand = handCount(observation);
    return supporterAvailable(observation) && deckCount(observation) > 0 &&
      (opponentHand >= 5 && ownHand <= 4) ?
      (opponentHand >= 7 ? 240 : 185) : 0;
  }
  if (matches(card, PRINT.wally)) return wallyLineReady(observation) ?
    (observation.globalTurn <= 2 ? 330 : 260) : 0;
  if (matches(card, PRINT.guzma)) {
    const target = slots(observation.opponentPublic).some(row => row.zone === 'bench' && prizeLiability(row.pokemon) >= 2);
    return supporterAvailable(observation) && target ? 215 : 0;
  }
  if (matches(card, PRINT.carmine)) {
    return supporterAvailable(observation) && handCount(observation) <= 4 && safeToDiscardHand(observation) ? 160 : 0;
  }
  if (matches(card, PRINT.iono)) {
    return supporterAvailable(observation) && opponentHandCount(observation) >= 4 && handCount(observation) <= 4 ? 155 : 0;
  }
  if (matches(card, PRINT.roxanne)) {
    return supporterAvailable(observation) && (observation.opponentPublic?.prizeCount ?? 6) <= 3 &&
      handCount(observation) <= 4 ? 180 : 0;
  }
  if (matches(card, PRINT.lilliesDetermination)) {
    return supporterAvailable(observation) && handCount(observation) <= 3 ? 145 : 0;
  }
  return 0;
}
function scoreAction(item, request) {
  const observation = request.observation;
  const own = observation.ownPublic;
  const opponent = observation.opponentPublic;
  const metadata = item.publicMetadata ?? {};
  const printing = item.actorPrinting ?? '';
  const hand = list(observation.ownHand);
  if (!EXECUTABLE.has(item.kind)) return -1;
  if (item.kind === 'pass') return 0;
  if (item.kind === 'attack') return scoreAttack(item, observation);
  if (item.kind === 'use-ability') {
    const ability = metadata.abilityName ?? '';
    if (/^Dedechange$/i.test(ability)) {
      return !garbotoxinLive(observation) && hand.length <= 4 && deckCount(observation) > 0 &&
        safeToDiscardHand(observation) ? 235 : 0;
    }
    if (/^Star Alchemy$/i.test(ability)) {
      const crobatHasStone = slots(own).some(row =>
        matches(row.pokemon.printing, PRINT.crobat) && list(row.pokemon.tools).some(tool => matches(tool, PRINT.forest)));
      return crobatHasStone && !garbotoxinLive(observation) && !observation.ownTurnResources?.vstarUsed && deckCount(observation) > 0
        ? (hasTrubbish(observation) && !hasGarbodor(observation) ? 255 : 205) : 0;
    }
    if (/^Dark Asset$/i.test(ability)) return !garbotoxinLive(observation) && hand.length < 6 && deckCount(observation) > 0 ? (hasGarbodor(observation) ? 310 : 180) : 0;
    if (/^Squawk and Seize$/i.test(ability)) {
      return !garbotoxinLive(observation) && observation.globalTurn <= 2 && hand.length <= 2 && safeToDiscardHand(observation) ? 220 : 0;
    }
    /* Dance of the Ancients is deliberately held out until its two-recipient
       native prompt sequence and Lost Zone settlement are source-verified. */
    return 0;
  }
  if (item.kind === 'use-stadium') {
    const stadium = printing || metadata.stadiumPrinting || '';
    if (matches(stadium, PRINT.temple)) {
      const special = slots(opponent).some(row =>
        list(row.pokemon.energies).some(energy => /Special Energy|Double Dragon|Jet Energy/i.test(textOf(energy))));
      return special ? 120 : (list(opponent.stadium).length > 0 ? 75 : 0);
    }
    return 0;
  }
  if (item.kind === 'retreat') {
    const target = item.targetPrinting ?? '';
    const row = slots(own).find(value => value.pokemon.printing === target);
    if (matches(target, PRINT.mega)) {
      const energies = row ? energyCount(row.pokemon) : 0;
      const activeDamage = opponent.active?.damage ?? 0;
      return energies >= 3 || (energies >= 2 && activeDamage === 300) ? 220 : 0;
    }
    if (matches(target, PRINT.vikavolt)) return row && energyCount(row.pokemon) >= 2 ? 230 : 90;
    if (matches(target, PRINT.garbodor)) return 65;
    return 0;
  }
  if (item.kind !== 'play-card') return 0;
  if (matches(printing, PRINT.trubbish)) return count(own, PRINT.trubbish) < 2 ? 210 : 20;
  if (matches(printing, PRINT.vikavolt)) return count(own, PRINT.vikavolt) < 1 ? 205 : 30;
  if (matches(printing, PRINT.garbodor)) return hasTrubbish(observation) && !hasGarbodor(observation) ? 240 : 55;
  if (matches(printing, PRINT.mega)) return count(own, PRINT.mega) < 2 ? 190 : 35;
  if (matches(printing, PRINT.dedenne)) return !garbotoxinLive(observation) && hand.length <= 4 && safeToDiscardHand(observation) ? 165 : 0;
  if (matches(printing, PRINT.crobat)) return !garbotoxinLive(observation) && hand.length <= 4 ? (hasGarbodor(observation) ? 310 : 125) : 0;
  if (matches(printing, PRINT.squawk)) return !garbotoxinLive(observation) && observation.globalTurn <= 2 && hand.length <= 2 && safeToDiscardHand(observation) ? 100 : 0;
  if (matches(printing, PRINT.tapuLele)) return !garbotoxinLive(observation) && supporterAvailable(observation) ? (hasGarbodor(observation) ? 305 : 120) : 0;
  if (matches(printing, PRINT.tapuKoko)) return !hasTapuKoko(observation) ? 105 : 0;
  if (matches(printing, PRINT.budew)) return count(own, PRINT.budew) === 0 ? 65 : 0;
  if (matches(printing, PRINT.vip)) return observation.globalTurn <= 2 && benchCount(own) < 5 ? 240 : 0;
  if (matches(printing, PRINT.quick)) {
    return count(own, PRINT.trubbish) < 2 || count(own, PRINT.mega) < 2 ||
      count(own, PRINT.vikavolt) < 1 || count(own, PRINT.dedenne) === 0 ? 185 : 35;
  }
  if (matches(printing, PRINT.ultra)) {
    return ultraBallUsablePayment(observation) &&
      (hasTrubbish(observation) && !hasGarbodor(observation) ||
       count(own, PRINT.trubbish) < 2 ||
       count(own, PRINT.vikavolt) < 1 ||
       count(own, PRINT.mega) < 2) ? 185 : 0;
  }
  if (matches(printing, PRINT.enhancedHammer)) return hammerLive(observation);
  if (matches(printing, PRINT.secret)) return secretBoxSetupValue(observation);
  if (matches(printing, PRINT.battleCompressor)) {
    const needsDarkPatchPayload = hasMegaAbsol(observation) &&
      slots(own).some(row => row.zone === 'bench' &&
        matches(row.pokemon.printing, PRINT.mega) && energyCount(row.pokemon) < 3) &&
      discardCount(own, PRINT.dark) < 2;
    return deckCount(observation) > 0 && needsDarkPatchPayload ?
      (hand.some(card => matches(card, PRINT.darkPatch)) ? 260 : 200) : 0;
  }
  if (matches(printing, PRINT.darkPatch)) {
    return discardHas(own, PRINT.dark) &&
      slots(own).some(row => row.zone === 'bench' && matches(row.pokemon.printing, PRINT.mega) && energyCount(row.pokemon) < 3)
      ? 205 : 0;
  }
  if (matches(printing, PRINT.boost)) {
    const target = slots(own).some(row =>
      matches(row.pokemon.printing, PRINT.trubbish) && row.pokemon.lastPlayedOrEvolvedTurn <= observation.globalTurn);
    return target && !hasGarbodor(observation) ? 170 : 0;
  }
  if ([PRINT.guzma, PRINT.karen, PRINT.wally, PRINT.marnie, PRINT.carmine, PRINT.iono, PRINT.roxanne, PRINT.lilliesDetermination]
    .some(pattern => matches(printing, pattern))) return supporterScore(printing, observation);
  if (matches(printing, PRINT.dark)) {
    const row = slots(own).find(value => value.pokemon.printing === item.targetPrinting);
    if (!row) return 0;
    const attached = list(row.pokemon.energies);
    const darkness = attached.filter(e => matches(e, PRINT.dark)).length;
    const lightning = attached.filter(e => matches(e, PRINT.lightning)).length;
    if (matches(row.pokemon.printing, PRINT.mega)) {
      // Terminal Period needs [D][C]; Claw of Darkness needs [D][D][C].
      if (darkness < 1) return 240;
      if (darkness < 2) return 220;
      return attached.length < 3 ? 200 : 15;
    }
    if (matches(row.pokemon.printing, PRINT.vikavolt)) {
      // First aim for [L][C] Paralyzing Bolt without wasting a second Lightning.
      if (lightning >= 1 && attached.length < 2) return 235;
      if (lightning >= 2 && attached.length < 3) return 150;
      return 0;
    }
    return 0;
  }
  if (matches(printing, PRINT.lightning)) {
    const row = slots(own).find(value => value.pokemon.printing === item.targetPrinting);
    if (!row) return 0;
    const attached = list(row.pokemon.energies);
    const lightning = attached.filter(e => matches(e, PRINT.lightning)).length;
    if (matches(row.pokemon.printing, PRINT.vikavolt)) {
      if (lightning < 1) return 260; // Enables [L] half of Paralyzing Bolt.
      if (lightning < 2 && attached.length < 3) return 175;
      return attached.length < 3 ? 85 : 0;
    }
    if (matches(row.pokemon.printing, PRINT.mega)) {
      const darkness = attached.filter(e => matches(e, PRINT.dark)).length;
      if (darkness >= 2 && attached.length < 3) return 165;
      if (darkness >= 1 && attached.length < 2) return 125;
    }
    return matches(row.pokemon.printing, PRINT.tapuKoko) ? 90 : 0;
  }
  if ([PRINT.float, PRINT.forest, PRINT.muscle].some(pattern => matches(printing, pattern))) {
    const row = slots(own).find(value => value.pokemon.printing === item.targetPrinting);
    if (!row || list(row.pokemon.tools).length > 0) return 0;
    if (matches(printing, PRINT.float) && matches(row.pokemon.printing, PRINT.garbodor))
      return supportWindowBeforeSelfLock(observation) ? 60 : 270;
    if (matches(printing, PRINT.float) && matches(row.pokemon.printing, PRINT.trubbish) && !hasGarbodor(observation)) return 225;
    if (matches(printing, PRINT.forest) && matches(row.pokemon.printing, PRINT.crobat)) return 180;
    if (matches(printing, PRINT.muscle) && matches(row.pokemon.printing, PRINT.mega)) return 150;
    return 25;
  }
  if (matches(printing, PRINT.vs)) {
    return supporterAvailable(observation) &&
      [PRINT.guzma, PRINT.carmine, PRINT.iono, PRINT.roxanne, PRINT.lilliesDetermination]
        .some(pattern => discardHas(own, pattern)) ? 150 : 15;
  }
  if (matches(printing, PRINT.temple)) return list(opponent.stadium).length > 0 ? 85 : 15;
  return 0;
}
function multiSelect(prompt, choices, score, reason) {
  const metadata = prompt.publicMetadata ?? {};
  const minimum = Number.isSafeInteger(metadata.minimumCount) ? metadata.minimumCount : 1;
  const maximum = Number.isSafeInteger(metadata.maximumCount) ? metadata.maximumCount : minimum;
  const ranked = choices.map(choice => ({ choice, score: score(choice) }))
    .filter(row => row.score > 0).sort((a, b) => b.score - a.score);
  const selected = ranked.slice(0, maximum).map(row => row.choice);
  if (selected.length < minimum) {
    if (minimum === 0) {
      const empty = list(prompt.choices).find(choice => choice.kind === 'empty-selection');
      if (empty) return { kind: 'select-choice', token: empty.token };
    }
    return { kind: 'abstain', reasonCode: reason };
  }
  if (selected.length === 0) {
    const empty = list(prompt.choices).find(choice => choice.kind === 'empty-selection');
    return empty ? { kind: 'select-choice', token: empty.token } : { kind: 'abstain', reasonCode: reason };
  }
  return { kind: 'select-choices', tokens: selected.map(choice => choice.token) };
}
function singleChoice(prompt, choices, score, reason) {
  const ranked = choices.map(choice => ({ choice, score: score(choice) })).sort((a, b) => b.score - a.score);
  return !ranked.length || ranked[0].score <= 0
    ? { kind: 'abstain', reasonCode: reason }
    : { kind: 'select-choice', token: ranked[0].choice.token };
}
function category(printing) {
  if ([PRINT.quick, PRINT.ultra, PRINT.darkPatch, PRINT.boost, PRINT.battleCompressor, PRINT.nightStretcher,
    PRINT.rod, PRINT.pokemonCommunication, PRINT.heavyBall, PRINT.fieldBlower, PRINT.vs, PRINT.vip]
    .some(pattern => matches(printing, pattern))) return 'item';
  if ([PRINT.float, PRINT.forest, PRINT.muscle].some(pattern => matches(printing, pattern))) return 'tool';
  if ([PRINT.guzma, PRINT.marnie, PRINT.carmine, PRINT.iono, PRINT.roxanne, PRINT.lilliesDetermination,
    PRINT.crispin, PRINT.wally, PRINT.karen].some(pattern => matches(printing, pattern))) return 'supporter';
  if (matches(printing, PRINT.temple)) return 'stadium';
  return null;
}
function secretBoxTargets(prompt, choices, observation) {
  if (!prompt.publicMetadata?.selectionType) return { kind: 'abstain', reasonCode: 'SECRET_BOX_MULTI_SELECT_UNSUPPORTED' };
  const best = new Map();
  for (const choice of choices) {
    if (owner(choice) !== 'actor' || zone(choice) !== 'deck') continue;
    const cardCategory = category(textOf(choice));
    if (!cardCategory) continue;
    const score = cardSearchScore(choice, observation);
    const old = best.get(cardCategory);
    if (score > 0 && (!old || score > old.score)) best.set(cardCategory, { choice, score });
  }
  const selected = ['item', 'tool', 'supporter', 'stadium'].map(key => best.get(key)?.choice).filter(Boolean);
  const minimum = Number.isSafeInteger(prompt.publicMetadata.minimumCount) ? prompt.publicMetadata.minimumCount : 4;
  const maximum = Number.isSafeInteger(prompt.publicMetadata.maximumCount) ? prompt.publicMetadata.maximumCount : 4;
  if (selected.length < minimum) return { kind: 'abstain', reasonCode: 'SECRET_BOX_CATEGORY_SET_INCOMPLETE' };
  return { kind: 'select-choices', tokens: selected.slice(0, maximum).map(choice => choice.token) };
}
const AICHI_SPECIAL_ENERGY_NAMES = /^(?:Double Dragon Energy|Capture Energy|Speed Lightning Energy|Double Colorless Energy|Reversal Energy|Counter Energy|Unit Energy LPM|Telepathic Psychic Energy|Jet Energy|Prism Energy|Spiky Energy|Memory Energy|Recycle Energy|Powerful Colorless Energy)\b/i;
function isSpecialEnergy(card) {
  const marker = card?.energyType ?? card?.publicMetadata?.energyType ??
    card?.printed?.energyType;
  if (typeof marker === 'string' && /special/i.test(marker)) return true;
  if (typeof marker === 'string' && /basic/i.test(marker)) return false;
  return AICHI_SPECIAL_ENERGY_NAMES.test(textOf(card));
}
function specialEnergyValue(card) {
  if (!isSpecialEnergy(card)) return 0;
  const printing = textOf(card);
  if (/Double Dragon Energy/i.test(printing)) return 295;
  if (/Double Colorless Energy|Reversal Energy|Counter Energy/i.test(printing)) return 250;
  if (/Jet Energy|Telepathic Psychic Energy/i.test(printing)) return 230;
  return 185;
}
function hammerTargetScore(row) {
  if (!row) return 0;
  const values = list(row.pokemon?.energies).map(specialEnergyValue);
  const best = values.length ? Math.max(...values) : 0;
  return best > 0 ? best + (row.zone === 'active' ? 10 : 0) : 0;
}
function hammerLive(observation) {
  return slots(observation?.opponentPublic).reduce((best, row) =>
    Math.max(best, hammerTargetScore(row)), 0);
}
function rank22CompressorTargets(prompt, deck, observation) {
  const metadata = prompt.publicMetadata ?? {};
  const min = metadata.minimumCount, max = metadata.maximumCount;
  if (metadata.selectionType !== 'card-combination' ||
      !Number.isSafeInteger(min) || !Number.isSafeInteger(max) ||
      min < 0 || min > max || max > 3) {
    return { kind: 'abstain', reasonCode: 'RANK22_COMPRESSOR_SCHEMA_UNSUPPORTED' };
  }
  const targetDark = Math.max(0, 2 - discardCount(observation.ownPublic, PRINT.dark));
  const darks = deck.filter(choice => matches(choice, PRINT.dark)).slice(0, targetDark);
  const deadVip = observation.globalTurn > 2 ?
    deck.filter(choice => matches(choice, PRINT.vip)) : [];
  const selected = [...darks, ...deadVip].slice(0, max);
  if (selected.length < min) {
    return { kind: 'abstain', reasonCode: 'RANK22_COMPRESSOR_NO_SAFE_PAYLOAD' };
  }
  if (!selected.length) {
    // Paper ruling requires at least one selected discard (even if pinned
    // native source still exposes min:0 without its paper correction hook).
    return { kind: 'abstain', reasonCode: 'RANK22_COMPRESSOR_NO_SAFE_PAYLOAD' };
  }
  return { kind: 'select-choices', tokens: selected.map(choice => choice.token) };
}
function rank22SetupDecision(prompt, observation) {
  if (observation?.phase !== 1 || prompt?.source?.sourceKind !== 'engine' ||
      prompt.source.sourcePrinting !== null ||
      prompt.source.effectName !== prompt.description) return null;
  const source = String(prompt.description || '').toLowerCase();
  const choices = list(prompt.choices);
  if (prompt.promptType === 'ConfirmPrompt' && /go_first/.test(source)) {
    const yes = choices.find(choice => /^yes$/i.test(choice.label ?? ''));
    return yes ? { kind: 'select-choice', token: yes.token } :
      { kind: 'abstain', reasonCode: 'RANK22_GO_FIRST_OPTION_MISSING' };
  }
  if (prompt.promptType === 'SelectPrompt' && /want_to_draw_cards/.test(source)) {
    const ranked = choices.map(choice => ({
      choice,
      value: Number(choice.publicMetadata?.value ?? choice.label)
    })).filter(row => Number.isSafeInteger(row.value) && row.value >= 0)
      .sort((a, b) => b.value - a.value);
    return ranked.length ? { kind: 'select-choice', token: ranked[0].choice.token } :
      { kind: 'abstain', reasonCode: 'RANK22_MULLIGAN_OPTION_MISSING' };
  }
  if (prompt.promptType !== 'ChooseCardsPrompt' || !/choose_starting_pokemons/.test(source))
    return null;
  const meta = prompt.publicMetadata ?? {};
  const min = meta.minimumCount, max = meta.maximumCount;
  if (meta.sourceZone !== 'hand' || meta.ownerSeat !== 'actor' ||
      meta.isOwnerVisible !== true || meta.selectionType !== 'card-combination' ||
      (min !== 0 && min !== 1) || !Number.isSafeInteger(max) ||
      max < min || max > 6) {
    return { kind: 'abstain', reasonCode: 'RANK22_SETUP_SCHEMA_MISMATCH' };
  }
  const allowed = [
    PRINT.vikavolt, PRINT.trubbish, PRINT.mega, PRINT.crobat, PRINT.squawk,
    PRINT.tapuLele, PRINT.dedenne, PRINT.tapuKoko, PRINT.budew
  ];
  const basicChoices = choices.filter(choice => choice.kind === 'card' &&
    choice.publicMetadata?.ownerSeat === 'actor' &&
    choice.publicMetadata?.sourceZone === 'hand' &&
    choice.publicMetadata?.isOwnerVisible === true);
  if (basicChoices.some(choice => !allowed.some(p => matches(choice, p))))
    return { kind: 'abstain', reasonCode: 'RANK22_UNKNOWN_SETUP_BASIC' };
  const hasLightning = list(observation.ownHand).some(card => matches(card, PRINT.lightning));
  const activeRank = choice =>
    matches(choice, PRINT.vikavolt) ? (hasLightning ? 110 : 85) :
    matches(choice, PRINT.trubbish) ? 95 :
    matches(choice, PRINT.mega) ? 70 :
    matches(choice, PRINT.budew) ? 55 :
    matches(choice, PRINT.tapuKoko) ? 45 : 15;
  const selected = [];
  const known = slots(observation.ownPublic).map(row => row.pokemon.printing);
  const ordered = basicChoices.slice().sort((a, b) => activeRank(b) - activeRank(a));
  if (min === 1) {
    if (!ordered.length) return { kind: 'abstain', reasonCode: 'RANK22_NO_STARTING_BASIC' };
    selected.push(ordered.shift());
    known.push(textOf(selected[0]));
  } else if (!observation.ownPublic?.active) {
    return { kind: 'abstain', reasonCode: 'RANK22_POST_BONUS_ACTIVE_MISSING' };
  }
  const availableBench = Math.max(0, 5 - benchCount(observation.ownPublic));
  const benchLimit = Math.min(max - selected.length, availableBench, 3);
  const benchPreference = [PRINT.trubbish, PRINT.vikavolt, PRINT.mega, PRINT.crobat, PRINT.dedenne];
  let placed = 0;
  for (const pattern of benchPreference) {
    if (placed >= benchLimit || known.some(printing => matches(printing, pattern))) continue;
    const choice = ordered.find(c => matches(c, pattern) && !selected.includes(c));
    if (!choice) continue;
    selected.push(choice);
    known.push(textOf(choice));
    placed++;
  }
  if (!selected.length) {
    const empty = choices.find(choice => choice.kind === 'empty-selection');
    return empty ? { kind: 'select-choice', token: empty.token } :
      { kind: 'abstain', reasonCode: 'RANK22_NO_EMPTY_SETUP_CHOICE' };
  }
  return { kind: 'select-choices', tokens: selected.map(choice => choice.token) };
}
function promptDecision(request) {
  const setup = rank22SetupDecision(request.prompt, request.observation);
  if (setup !== null) return setup;
  const prompt = request.prompt;
  const observation = request.observation;
  const choices = list(prompt?.choices);
  const source = [prompt?.source?.sourcePrinting ?? '', prompt?.source?.effectName ?? '',
    prompt?.source?.copiedAttackName ?? '', prompt?.description ?? ''].join(' ').toLowerCase();
  if (prompt.promptType === 'ChooseCardsPrompt') {
    const hand = choices.filter(choice => owner(choice) === 'actor' && zone(choice) === 'hand');
    const deck = choices.filter(choice => owner(choice) === 'actor' && zone(choice) === 'deck');
    const discard = choices.filter(choice => owner(choice) === 'actor' && zone(choice) === 'discard');
    const multi = ['card-combination', 'pokemon', 'energy-payment', 'prize-slots', 'card-order'].includes(prompt.publicMetadata?.selectionType);
    if (/enhanced hammer/.test(source)) {
      const selected = choices.filter(c => c.kind === 'card' && owner(c) === 'opponent' &&
        zone(c) !== null && !['hand', 'deck', 'discard', 'prize', 'prizes', 'lost-zone'].includes(zone(c)) &&
        isSpecialEnergy(c))
        .sort((a, b) => specialEnergyValue(b) - specialEnergyValue(a))[0];
      if (!selected) return { kind: 'abstain', reasonCode: 'RANK22_HAMMER_NO_VISIBLE_SPECIAL' };
      return { kind: 'select-choices', tokens: [selected.token] };
    }
    if (/battle compressor/.test(source)) {
      return rank22CompressorTargets(prompt, deck, observation);
    }
    if (/wally/.test(source)) {
      return singleChoice(prompt, deck, choice =>
        matches(choice, PRINT.garbodor) && hasTrubbish(observation) &&
        !hasGarbodor(observation) ? 350 : 0, 'RANK22_WALLY_NO_GARBODOR');
    }
    if (/claw of darkness/.test(source)) {
      return singleChoice(prompt, choices.filter(choice => owner(choice) === 'opponent' && zone(choice) === 'hand'),
        choice => opponentHandDiscardScore(choice, observation), 'NO_REVEALED_OPPONENT_HAND_CARD');
    }
    if (/quick ball|ultra ball/.test(source) && hand.length) {
      const minimum = /ultra ball/.test(source) ? 2 : (Number.isSafeInteger(prompt.publicMetadata?.minimumCount) ? prompt.publicMetadata.minimumCount : 1);
      if (!multi) return singleChoice(prompt, hand, choice => discardScore(choice, observation), 'NO_SAFE_BALL_DISCARD');
      const decision = multiSelect(prompt, hand, choice => discardScore(choice, observation), 'NO_SAFE_BALL_DISCARD');
      if (minimum === 2 && decision.kind === 'select-choices' && decision.tokens.length !== 2) {
        return { kind: 'abstain', reasonCode: 'ULTRA_BALL_TWO_CARD_COST_UNAVAILABLE' };
      }
      return decision;
    }
    if (/quick ball/.test(source)) {
      return singleChoice(prompt, deck, choice => basicScore(choice, observation), 'NO_QUICK_BALL_BASIC');
    }
    if (/ultra ball/.test(source)) {
      return singleChoice(prompt, deck, choice => ultraBallSearchScore(choice, observation),
        'NO_ULTRA_BALL_POKEMON');
    }
    if (/vs seeker/.test(source)) {
      return singleChoice(prompt, discard, choice => supporterScore(choice, observation), 'NO_VS_SEEKER_SUPPORTER');
    }
    if (/wonder tag/.test(source)) {
      return singleChoice(prompt, deck, choice => supporterScore(choice, observation), 'NO_WONDER_TAG_SUPPORTER');
    }
    if (/secret box/.test(source) && hand.length) {
      return multi ? multiSelect(prompt, hand, choice => discardScore(choice, observation), 'SECRET_BOX_DISCARD_COST_UNAVAILABLE')
        : { kind: 'abstain', reasonCode: 'SECRET_BOX_DISCARD_REQUIRES_MULTISELECT' };
    }
    if (/secret box/.test(source)) return secretBoxTargets(prompt, deck, observation);
    if (/battle vip pass/.test(source)) {
      return multi ? multiSelect(prompt, deck, choice => basicScore(choice, observation), 'NO_VIP_PASS_BASICS')
        : singleChoice(prompt, deck, choice => basicScore(choice, observation), 'NO_VIP_PASS_BASIC');
    }
    if (/boost shake/.test(source)) {
      return singleChoice(prompt, deck, choice =>
        matches(choice, PRINT.garbodor) && hasTrubbish(observation) && !hasGarbodor(observation) ? 320 : 0,
      'NO_GARBODOR_EVOLUTION_TARGET');
    }
    if (/star alchemy|forest seal stone/.test(source)) {
      return singleChoice(prompt, deck, choice => cardSearchScore(choice, observation), 'NO_STAR_ALCHEMY_TARGET');
    }
    if (/motivate/.test(source)) {
      return multi ? multiSelect(prompt, discard, choice => matches(choice, PRINT.dark) ? 180 : 0, 'NO_MOTIVATE_ENERGY')
        : singleChoice(prompt, discard, choice => matches(choice, PRINT.dark) ? 180 : 0, 'NO_MOTIVATE_ENERGY');
    }
    if (/dark patch/.test(source)) {
      return singleChoice(prompt, choices, choice =>
        owner(choice) === 'actor' && zone(choice) === 'discard' && matches(choice, PRINT.dark) ? 180 : 0,
      'NO_DARKNESS_ENERGY_TO_ATTACH');
    }
    if (/night stretcher/.test(source)) {
      return singleChoice(prompt, discard, choice => {
        if (matches(choice, PRINT.mega) && count(observation.ownPublic, PRINT.mega) < 2) return 230;
        if (matches(choice, PRINT.trubbish) && !hasGarbodor(observation) && count(observation.ownPublic, PRINT.trubbish) < 2) return 210;
        if (matches(choice, PRINT.garbodor) && hasTrubbish(observation) && !hasGarbodor(observation)) return 190;
        if (matches(choice, PRINT.dark) && !discardHas(observation.ownPublic, PRINT.dark)) return 130;
        if (matches(choice, PRINT.lightning) && discardCount(observation.ownPublic, PRINT.lightning) < 2) return 120;
        return 0;
      }, 'NO_NIGHT_STRETCHER_TARGET');
    }
    if (/super rod/.test(source)) {
      return multi ? multiSelect(prompt, discard, choice =>
        [PRINT.mega, PRINT.trubbish, PRINT.garbodor, PRINT.tapuKoko, PRINT.dark, PRINT.lightning]
          .some(pattern => matches(choice, pattern)) ? 120 : 0, 'NO_SUPER_ROD_RECOVERY_TARGETS')
        : singleChoice(prompt, discard, choice =>
          [PRINT.mega, PRINT.trubbish, PRINT.garbodor, PRINT.tapuKoko, PRINT.dark, PRINT.lightning]
            .some(pattern => matches(choice, pattern)) ? 120 : 0, 'NO_SUPER_ROD_TARGET');
    }
    if (/adventure bag/.test(source)) {
      return multi ? multiSelect(prompt, deck, choice => toolScore(choice, observation), 'NO_ADVENTURE_BAG_TOOLS')
        : singleChoice(prompt, deck, choice => toolScore(choice, observation), 'NO_ADVENTURE_BAG_TOOL');
    }
    if (/field blower/.test(source)) {
      return multi ? multiSelect(prompt, choices, choice =>
        owner(choice) === 'opponent' && ['tool', 'stadium', 'in-play'].includes(zone(choice)) ? 180 : 0,
      'NO_OPPONENT_FIELD_BLOWER_TARGETS')
        : singleChoice(prompt, choices, choice =>
          owner(choice) === 'opponent' && ['tool', 'stadium', 'in-play'].includes(zone(choice)) ? 180 : 0,
        'NO_OPPONENT_FIELD_BLOWER_TARGET');
    }
    if (/tap[u]? koko|dance of the ancients/.test(source)) {
      return { kind: 'abstain', reasonCode: 'RANK22_TAPU_KOKO_PROMPT_HELD_OUT' };
    }
    if (/crispin|pokémon communication|pokemon communication|hisuian heavy ball|karen/.test(source)) {
      return { kind: 'abstain', reasonCode: 'RANK22_MULTI_STEP_PROMPT_HELD_OUT' };
    }
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_CARD_PROMPT' };
  }
  if (prompt.promptType === 'ChoosePokemonPrompt') {
    if (/wally/.test(source)) {
      return singleChoice(prompt, choices.filter(choice => owner(choice) === 'actor'),
        choice => {
          const row = ownPokemon(choice, observation);
          return row && matches(row.pokemon.printing, PRINT.trubbish) &&
            !hasGarbodor(observation) ?
            (list(row.pokemon.tools).length > 0 ? 360 : 310) : 0;
        }, 'RANK22_WALLY_NO_EVOLUTION_TARGET');
    }
    if (/enhanced hammer/.test(source)) {
      return singleChoice(prompt, choices.filter(choice => owner(choice) === 'opponent'),
        choice => hammerTargetScore(opponentPokemon(choice, observation)),
        'RANK22_HAMMER_NO_SPECIAL_TARGET');
    }
    if (/motivate/.test(source)) {
      return singleChoice(prompt, choices.filter(choice => owner(choice) === 'actor' && zone(choice) === 'bench'),
        choice => {
          const row = ownPokemon(choice, observation);
          return row && matches(row.pokemon.printing, PRINT.mega) && energyCount(row.pokemon) < 3 ? 250 : 0;
        }, 'NO_MOTIVATE_TARGET');
    }
    if (/guzma/.test(source)) {
      const opponentChoices = choices.filter(choice => owner(choice) === 'opponent');
      if (opponentChoices.length) return singleChoice(prompt, opponentChoices,
        choice => opponentTargetScore(choice, observation, 220), 'NO_GUZMA_TARGET');
      return singleChoice(prompt, choices.filter(choice => owner(choice) === 'actor'),
        choice => ownSwitchScore(choice, observation), 'NO_GUZMA_SWITCH_TARGET');
    }
    if (/dark patch/.test(source)) {
      return singleChoice(prompt, choices.filter(choice => owner(choice) === 'actor' && zone(choice) === 'bench'),
        choice => {
          const row = ownPokemon(choice, observation);
          return row && matches(row.pokemon.printing, PRINT.mega) && energyCount(row.pokemon) < 3 ? 220 : 0;
        }, 'NO_DARK_PATCH_BENCH_TARGET');
    }
    if (/float stone|forest seal stone|muscle band/.test(source)) {
      return singleChoice(prompt, choices.filter(choice => owner(choice) === 'actor'), choice => {
        const row = ownPokemon(choice, observation);
        if (!row || list(row.pokemon.tools).length > 0) return 0;
        if (/float stone/.test(source) && matches(row.pokemon.printing, PRINT.garbodor)) return 300;
        if (/float stone/.test(source) && matches(row.pokemon.printing, PRINT.trubbish) && !hasGarbodor(observation)) return 260;
        if (/forest seal stone/.test(source) && matches(row.pokemon.printing, PRINT.crobat)) return 240;
        if (/muscle band/.test(source) && matches(row.pokemon.printing, PRINT.mega)) return 220;
        return 0;
      }, 'NO_TOOL_ATTACHMENT_TARGET');
    }
    if (/tap[u]? koko|dance of the ancients/.test(source)) {
      return { kind: 'abstain', reasonCode: 'RANK8_TAPU_KOKO_PROMPT_HELD_OUT' };
    }
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_POKEMON_PROMPT' };
  }
  if (['ConfirmPrompt', 'SelectPrompt', 'SelectOptionPrompt'].includes(prompt.promptType)) {
    const yes = choices.find(choice => /^(yes|true|confirm)$/i.test(choice.label ?? ''));
    const no = choices.find(choice => /^(no|false|decline|cancel)$/i.test(choice.label ?? ''));
    const accept = (/dedechange/.test(source) && !garbotoxinLive(observation) &&
      handCount(observation) <= 4 && safeToDiscardHand(observation)) ||
      (/dark asset/.test(source) && !garbotoxinLive(observation) && handCount(observation) < 6 && deckCount(observation) > 0) ||
      (/squawk and seize/.test(source) && !garbotoxinLive(observation) && observation.globalTurn <= 2 &&
        handCount(observation) <= 2 && safeToDiscardHand(observation));
    if (accept && yes) return { kind: 'select-choice', token: yes.token };
    if (no) return { kind: 'select-choice', token: no.token };
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_OPTIONAL_PROMPT' };
  }
  return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
}
function bestAction(request) {
  const items = list(request.actionFrontier?.items).filter(item => EXECUTABLE.has(item.kind));
  if (!items.length) return { kind: 'abstain', reasonCode: 'NO_EXECUTABLE_ACTION' };
  let best = null;
  let bestScore = 0;
  for (const item of items) {
    const score = scoreAction(item, request);
    if (score > bestScore) {
      best = item;
      bestScore = score;
    }
  }
  if (best) return { kind: 'select-action', token: best.token };
  const pass = items.find(item => item.kind === 'pass');
  return pass ? { kind: 'select-action', token: pass.token } : { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ACTION' };
}
function normalizeRank22Selection(prompt, decision) {
  if (decision?.kind !== 'select-choice' || !prompt) return decision;
  const selectionType = prompt.publicMetadata?.selectionType;
  if (!['card-combination', 'pokemon', 'energy-payment', 'prize-slots', 'card-order']
    .includes(selectionType)) return decision;
  const selected = list(prompt.choices).find(choice => choice.token === decision.token);
  if (!selected || selected.kind === 'cancel' || selected.kind === 'empty-selection')
    return decision;
  const meta = prompt.publicMetadata ?? {};
  const min = selectionType === 'energy-payment' ? 1 :
    selectionType === 'prize-slots' ? meta.requiredCount :
    selectionType === 'card-order' ? meta.count : meta.minimumCount;
  if (Number.isSafeInteger(min) && min > 1) {
    return { kind: 'abstain', reasonCode: 'RANK22_SINGLE_DECISION_BELOW_PROMPT_MINIMUM' };
  }
  return { kind: 'select-choices', tokens: [decision.token] };
}
function createPolicy({ role, seat, policyVersion, config }) {
  if (role !== 'opponent' || (seat !== 0 && seat !== 1) || policyVersion !== POLICY_VERSION ||
      !config || Array.isArray(config) || Object.keys(config).length !== 0) {
    throw new Error('AGENT5_RANK22_POLICY_INIT_MISMATCH');
  }
  return Object.freeze({
    decide(request) {
      if (!request || request.role !== 'opponent' || request.seat !== seat ||
          request.observation?.actorSeat !== seat) {
        return { kind: 'abstain', reasonCode: 'ROLE_SEAT_BINDING_MISMATCH' };
      }
      return request.prompt !== null ?
        normalizeRank22Selection(request.prompt, promptDecision(request)) : bestAction(request);
    }
  });
}
module.exports = {
  POLICY_VERSION, SOURCE_RANK, SOURCE_LIST_BLOB_SHA1, SOURCE_ENTRY_JSON_SHA256,
  CANDIDATE_ENTRY_JSON_SHA256, ENGINE_PIN, WORKER_PROTOCOL_BLOB_SHA1, SOURCE_INVENTORY,
  createPolicy, scoreAction, scoreAttack, promptDecision, bestAction, basicScore,
  cardSearchScore, discardScore, opponentHandDiscardScore
};
