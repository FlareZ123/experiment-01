'use strict';
/* Aichi rank-16 Absol/Garbodor/Budew opponent policy v1.
 * Derived from Agent44's rank-8 family worker; immutable original rank-16
 * source counts, actor-visible decision interface, and fail-closed prompts.
 * Development prototype, never a competence or native-game attestation. */
/* Agent33: rank16 original source, developmental actor-only dual lock. Fork of Agent44 rank8. */
const POLICY_VERSION = 'agent33-rank16-absol-garbodor-dual-lock-v1';
const SOURCE_RANK = 16;
const SOURCE_LIST_BLOB_SHA1 = 'ae773f6201d7aa69d31914dbfee66f3fba692200';
// Rank-8 entry hash intentionally removed; source-rank and exact inventory pinned below.
const CANDIDATE_ENTRY_JSON_SHA256 = '4c18dd93ba49fd8f7d88aad573249dc6941b4cf61d52b99f80309345b5d58c59';
const ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const WORKER_PROTOCOL_BLOB_SHA1 = 'd51ea95c457d61b50a9ee114d342eb17f4350451';
const PRINT = Object.freeze({
  mega: /^Mega Absol ex MEG 86\b/i,
  trubbish: /^Trubbish CRI 56\b/i,
  garbodor: /^Garbodor (?:LTR 68|BKP 57)\b/i,
  tapuKoko: /^RANK16_NO_TAPUKOKO$/i,
  dedenne: /^Dedenne-GX UNB 57\b/i,
  crobat: /^Crobat V DAA 104\b/i,
  squawk: /^Squawkabilly ex PAL 169\b/i,
  tapuLele: /^Tapu Lele-GX GRI 60\b/i,
  budew: /^Budew ASC 16\b/i,
  lilliesDetermination: /^Lillie's Determination MEG 119\b/i,
  carmine: /^Carmine TWM 145\b/i,
  iono: /^Iono PAL 185\b/i,
  roxanne: /^RANK16_NO_ROXANNE$/i,
  marnie: /^Marnie SSH 169\b/i,
  plumeria: /^Plumeria BUS 120\b/i,
  trainersMail: /^Trainers' Mail ROS 92\b/i,
  guzma: /^Guzma BUS 115\b/i,
  crispin: /^Crispin SCR 133\b/i,
  wally: /^Wally ROS 94\b/i,
  karen: /^Karen XYP 177\b/i,
  vip: /^Battle VIP Pass FST 225\b/i,
  quick: /^Quick Ball FST 237\b/i,
  ultra: /^Ultra Ball MEG 131\b/i,
  darkPatch: /^Dark Patch ASR 139\b/i,
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
  lightning: /^RANK16_NO_LIGHTNING$/i,
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
  [
    "Mega Absol ex MEG 86",
    2
  ],
  [
    "Trubbish CRI 56",
    2
  ],
  [
    "Garbodor LTR 68",
    2
  ],
  [
    "Garbodor BKP 57",
    1
  ],
  [
    "Budew ASC 16",
    2
  ],
  [
    "Crobat V DAA 104",
    2
  ],
  [
    "Tapu Lele-GX GRI 60",
    1
  ],
  [
    "Dedenne-GX UNB 57",
    1
  ],
  [
    "Squawkabilly ex PAL 169",
    1
  ],
  [
    "Marnie SSH 169",
    2
  ],
  [
    "Lillie's Determination MEG 119",
    1
  ],
  [
    "Carmine TWM 145",
    1
  ],
  [
    "Guzma BUS 115",
    1
  ],
  [
    "Plumeria BUS 120",
    1
  ],
  [
    "Karen XYP 177",
    1
  ],
  [
    "Quick Ball FST 237",
    4
  ],
  [
    "Ultra Ball MEG 131",
    3
  ],
  [
    "Trainers' Mail ROS 92",
    3
  ],
  [
    "VS Seeker PHF 109",
    3
  ],
  [
    "Dark Patch ASR 139",
    3
  ],
  [
    "Battle Compressor PHF 92",
    3
  ],
  [
    "Battle VIP Pass FST 225",
    2
  ],
  [
    "Boost Shake EVS 142",
    2
  ],
  [
    "Secret Box TWM 163",
    1
  ],
  [
    "Float Stone BKT 137",
    4
  ],
  [
    "Muscle Band XY 121",
    1
  ],
  [
    "Forest Seal Stone SIT 156",
    1
  ],
  [
    "Temple of Sinnoh ASR 155",
    2
  ],
  [
    "Darkness Energy MEE 15",
    7
  ]
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
function matches(value, pattern) { return pattern.test(textOf(value)); }
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
// Bench AMR: reserve physical space for the three mutually dependent axes
// (at least one Budew, one Trubbish/Garbodor, one Mega Absol attacker).
// A searchable support Pokemon is not playable if it consumes a required slot.
function rank16CoreBenchReserve(o) {
  const own=o.ownPublic;
  return (count(own,PRINT.budew)===0?1:0)+
    (!hasTrubbish(o)&&!hasGarbodor(o)?1:0)+
    (count(own,PRINT.mega)===0?1:0);
}
function rank16CanBenchSupport(o) {
  return benchCount(o.ownPublic)+rank16CoreBenchReserve(o)<5;
}
function basicScore(choice, observation) {
  if (owner(choice) !== 'actor' || zone(choice) !== 'deck') return 0;
  const printing = textOf(choice);
  const own = observation.ownPublic;
  if([PRINT.crobat,PRINT.dedenne,PRINT.tapuLele,PRINT.squawk].some(p=>matches(printing,p))&&
    (rank16LockLive(observation)||rank16OpponentBlocksSupport(observation,printing)))return 0;
  if (matches(printing, PRINT.trubbish)) return !hasTrubbish(observation) && !hasGarbodor(observation) ?
    365+(benchCount(own)>=4?40:0) : 20;
  if (matches(printing, PRINT.mega)) return count(own, PRINT.mega) === 0 ? 330 : count(own, PRINT.mega) === 1 ? 170 : 25;
  if (matches(printing, PRINT.dedenne)) return !rank16CanBenchSupport(observation) ? 0 : !hasGarbodor(observation) && handCount(observation) <= 4 ? 190 : 35;
  if (matches(printing, PRINT.crobat)) return !rank16CanBenchSupport(observation) ? 0 : handCount(observation) <= 4 ? 175 : 35;
  if (matches(printing, PRINT.squawk)) return !rank16CanBenchSupport(observation) ? 0 : observation.globalTurn <= 2 && handCount(observation) <= 2 ? 155 : 15;
  if (matches(printing, PRINT.tapuLele)) return !rank16CanBenchSupport(observation) ? 0 : supporterAvailable(observation) ? 135 : 35;
  if (matches(printing, PRINT.tapuKoko)) return !rank16CanBenchSupport(observation) ? 0 : !hasTapuKoko(observation) && discardCount(own, PRINT.lightning) >= 2 ? 145 : 45;
  if (matches(printing, PRINT.budew)) return count(own, PRINT.budew) === 0 ?
    350+(benchCount(own)>=4?200:benchCount(own)>=3?100:0) : 10;
  return 0;
}
function cardSearchScore(choice, observation) {
  if (owner(choice) !== 'actor' || zone(choice) !== 'deck') return 0;
  const printing = textOf(choice);
  if (matches(printing, PRINT.garbodor)) return hasTrubbish(observation) && !hasGarbodor(observation) ? 340 : 0;
  if (matches(printing, PRINT.boost)) return hasTrubbish(observation) && !hasGarbodor(observation) ? 285 : 0;
  if (matches(printing, PRINT.vip)) return observation.globalTurn <= 2 && benchCount(observation.ownPublic) < 5 ? 230 : 0;
  if (matches(printing, PRINT.quick)) {
    return count(observation.ownPublic, PRINT.trubbish) < 2 ||
      count(observation.ownPublic, PRINT.mega) < 2 ||
      count(observation.ownPublic, PRINT.dedenne) === 0 ? 190 : 35;
  }
  if (matches(printing, PRINT.ultra)) {
    return handCount(observation) >= 2 &&
      (count(observation.ownPublic, PRINT.trubbish) < 2 || count(observation.ownPublic, PRINT.mega) < 2) ? 170 : 0;
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
  if (matches(printing, PRINT.roxanne)) {
    return supporterAvailable(observation) && (observation.opponentPublic?.prizeCount ?? 6) <= 3 ? 175 : 0;
  }
  if (matches(printing, PRINT.lilliesDetermination)) {
    return supporterAvailable(observation) && handCount(observation) <= 3 ? 145 : 0;
  }
  if([PRINT.marnie,PRINT.plumeria,PRINT.karen].some(p=>matches(printing,p)))
    return Math.max(20,rank16SourceSupporterScore(choice,observation));
  if (matches(printing, PRINT.vs)) return rank16HasViableVsTarget(observation)?185:0;
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
  if (matches(printing, PRINT.tapuKoko) && !hasTapuKoko(observation)) return 0;
  if (matches(printing, PRINT.dedenne) && !hasGarbodor(observation) && handCount(observation) <= 4) return 0;
  if (matches(printing, PRINT.guzma) && supporterAvailable(observation) && benchCount(observation.opponentPublic) > 0) return 0;
  if ([PRINT.carmine, PRINT.iono, PRINT.roxanne, PRINT.lilliesDetermination, PRINT.crispin, PRINT.wally, PRINT.karen]
    .some(pattern => matches(printing, pattern))) return 0;
  if (matches(printing, PRINT.vs) && !rank16HasViableVsTarget(observation)) return 0;
  if (matches(printing, PRINT.forest) && !observation.ownTurnResources?.vstarUsed &&
      slots(own).some(row => matches(row.pokemon.printing, PRINT.crobat) && list(row.pokemon.tools).length === 0)) return 0;
  if (matches(printing, PRINT.float) && !hasGarbodor(observation) &&
      slots(own).some(row => matches(row.pokemon.printing, PRINT.trubbish) && list(row.pokemon.tools).length === 0)) return 0;
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
    PRINT.iono, PRINT.roxanne, PRINT.lilliesDetermination, PRINT.crispin, PRINT.wally, PRINT.karen,
    PRINT.vs, PRINT.forest, PRINT.float, PRINT.boost];
  if (patterns.some(pattern => matches(printing, pattern))) return true;
  if (matches(printing, PRINT.trubbish)) return !hasGarbodor(observation) && count(observation.ownPublic, PRINT.trubbish) < 2;
  if (matches(printing, PRINT.mega)) return count(observation.ownPublic, PRINT.mega) < 2;
  if (matches(printing, PRINT.dedenne)) return !hasGarbodor(observation) && handCount(observation) <= 4;
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

function rank16ToolSuppressed(o) {
  // The validated actor projection represents Stadiums as an array; treating
  // the array itself as a card silently misses Jamming Tower suppression.
  const stadiums = [o?.ownPublic?.stadium, o?.opponentPublic?.stadium];
  const jamming = stadiums.some(value =>
    /Jamming Tower/i.test(textOf(value)) ||
    list(value).some(card => /Jamming Tower/i.test(textOf(card))));
  const suppressedTurn = [o?.ownPublic, o?.opponentPublic].some(player =>
    Number(player?.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining) > 0);
  return jamming || suppressedTurn;
}
function rank16GarbotoxinSuppressed(pokemon) {
  // Trust the physical actor projection when a card-specific Ability is
  // suppressed. Psychic Wobbuffet exemption must not be guessed from type.
  return list(pokemon?.abilitySuppressions).some(entry=>
    /^Garbotoxin$/i.test(entry.abilityName??'')&&entry.suppressed===true);
}
function rank16LockLive(o) {
  return !rank16ToolSuppressed(o)&&slots(o?.ownPublic).some(row=>
    matches(row.pokemon.printing,PRINT.garbodor)&&
    list(row.pokemon.tools).length>0&&!rank16GarbotoxinSuppressed(row.pokemon));
}
function rank16UntooledGarb(o) {
  return slots(o?.ownPublic).some(row=>matches(row.pokemon.printing,PRINT.garbodor)&&
    list(row.pokemon.tools).length===0);
}
function rank16OpponentBlocksSupport(o,printing) {
  const opponent=o?.opponentPublic;
  const active=opponent?.active;
  const activePrint=active?.printing??'';
  const suppressed=ability=>list(active?.abilitySuppressions).some(row=>
    row.abilityName===ability&&row.suppressed===true);
  // Wobbuffet PHF36 / GEN RC11 Bide Barricade blocks non-Psychic
  // hand/Bench Abilities. Tapu Lele-GX is Psychic and remains exempt.
  if(/^Wobbuffet (?:PHF 36|GEN RC11)\b/i.test(activePrint)&&
     !suppressed('Bide Barricade')&&!matches(printing,PRINT.tapuLele))return true;
  // Iron Thorns ex TWM77 Initialization removes Abilities of Rule Box
  // non-Future Pokémon; all four original rank16 utility Basics qualify.
  if(/^Iron Thorns ex (?:TWM 77|TWM 196|PAF 32)\b/i.test(activePrint)&&
     !suppressed('Initialization'))return true;
  if(/^Galarian Weezing RCL 113\b/i.test(activePrint)&&
     !suppressed('Neutralizing Gas'))return true;
  // An opposing equipped Garbotoxin works from either Active or Bench,
  // unless the public Tool or Garbotoxin effect itself is suppressed.
  return !rank16ToolSuppressed(o)&&slots(opponent).some(row=>
    matches(row.pokemon.printing,PRINT.garbodor)&&
    list(row.pokemon.tools).length>0&&!rank16GarbotoxinSuppressed(row.pokemon));
}
function rank16UsefulOwnSetup(item,o) {
  if(rank16LockLive(o))return false;
  if(item.kind==='play-card') {
    // These draw/search Abilities are triggered by playing a Basic to Bench.
    // They often do not appear as independent use-ability roots.
    if(!rank16CanBenchSupport(o))return false;
    const print=item.actorPrinting??'';
    if(rank16OpponentBlocksSupport(o,print))return false;
    if(matches(print,PRINT.crobat))return handCount(o)<6&&deckCount(o)>0;
    if(matches(print,PRINT.tapuLele)) {
      const hasSupporter=list(o.ownHand).some(card=>
        [PRINT.marnie,PRINT.plumeria,PRINT.guzma,PRINT.carmine,
          PRINT.lilliesDetermination,PRINT.karen].some(pattern=>matches(card,pattern)));
      return supporterAvailable(o)&&!hasSupporter&&deckCount(o)>0;
    }
    if(matches(print,PRINT.dedenne))
      return handCount(o)<=3&&deckCount(o)>=6&&safeToDiscardHand(o);
    if(matches(print,PRINT.squawk))
      return o.globalTurn<=2&&handCount(o)<=2&&deckCount(o)>=6&&safeToDiscardHand(o);
    return false;
  }
  if(item.kind!=='use-ability')return false;
  const n=item.publicMetadata?.abilityName??'';
  if(/^Dark Asset$/i.test(n))return handCount(o)<6&&deckCount(o)>0;
  if(/^Wonder Tag$/i.test(n))return supporterAvailable(o)&&deckCount(o)>0;
  if(/^Star Alchemy$/i.test(n))return !o.ownTurnResources?.vstarUsed&&deckCount(o)>0;
  if(/^Dedechange$/i.test(n))return handCount(o)<=3&&deckCount(o)>=6&&safeToDiscardHand(o);
  if(/^Squawk and Seize$/i.test(n))return o.globalTurn<=2&&handCount(o)<=2&&
    deckCount(o)>=6&&safeToDiscardHand(o);
  return false;
}
function rank16PendingOwnSetup(r) {
  return list(r.actionFrontier?.items).some(i=>rank16UsefulOwnSetup(i,r.observation));
}
function rank16LethalOffered(r) {
  return list(r.actionFrontier?.items).some(i=>i.kind==='attack'&&
    i.publicMetadata?.attackCostPayable!==false&&scoreAttack(i,r.observation)>=330);
}
function scoreAttack(item, observation) {
  const attack = item.attackName ?? '';
  const metadata = item.publicMetadata ?? {};
  if (metadata.attackCostPayable === false) return 0;
  const remaining = Number.isFinite(metadata.targetHp) && Number.isFinite(metadata.targetDamage)
    ? metadata.targetHp - metadata.targetDamage : -1;
  // Mega Absol ex MEG 86: Terminal Period Knocks Out only if the target
  // has exactly SIX 10-damage counters (60 damage), not 300 damage.
  if (/^Terminal Period$/i.test(attack)) {
    // Prefer the public Active Pokémon. Frontiers may omit targetDamage,
    // but a conflicting metadata receipt is not a reliable KO proof.
    const visible = observation?.opponentPublic?.active?.damage;
    const hasPublic = Number.isSafeInteger(visible) && visible >= 0;
    const hasMeta = Number.isSafeInteger(metadata.targetDamage) && metadata.targetDamage >= 0;
    if (hasPublic && hasMeta && visible !== metadata.targetDamage) return 0;
    const damage = hasPublic ? visible : hasMeta ? metadata.targetDamage : -1;
    return damage === 60 ? 460 : 0;
  }
  if (/^Claw of Darkness$/i.test(attack)) {
    const damage = Number.isFinite(metadata.damageAfterWeakness) ? metadata.damageAfterWeakness :
      Number.isFinite(metadata.damage) ? metadata.damage : 200;
    return remaining > 0 && remaining <= damage ? 330 : 210;
  }
  if (/^Motivate$/i.test(attack)) {
    return discardHas(observation.ownPublic, PRINT.dark) &&
      slots(observation.ownPublic).some(row => row.zone === 'bench' &&
        matches(row.pokemon.printing, PRINT.mega) && energyCount(row.pokemon) < 3) ? 230 : 0;
  }
  if (/^Itchy Pollen$/i.test(attack)) return rank16LockLive(observation)?355:135;
  // Source Trubbish CRI 56 (xy9-56) has Acid Spray: 10 damage plus a
  // heads-only discard of one Energy from opponent's Active Pokémon.
  // It is a useful fallback when physically offered, not a guaranteed lock.
  if (/^Acid Spray$/i.test(attack)) {
    const energies=energyCount(observation?.opponentPublic?.active);
    return energies>=2?160:energies===1?120:45;
  }
  return 0;
}
// A Ball or Secret Box must discard *other* cards. A hand of protected
// singletons is not a playable connector merely because the root is offered.
function rank16CheapDiscardCount(o,playingPrinting) {
  let excluded=false;
  return list(o?.ownHand).filter(card=>{
    if(!excluded&&textOf(card)===playingPrinting){excluded=true;return false;}
    return discardScore(card,o)>0;
  }).length;
}
function rank16SourceSupporterScore(card,o) {
  const base=supporterScore(card,o);
  if(base>0)return base;
  if(!supporterAvailable(o))return 0;
  if(matches(card,PRINT.marnie))
    return handCount(o)<=3?225:opponentHandCount(o)>=6?200:85;
  if(matches(card,PRINT.plumeria))
    return rank16PlumeriaAvailable(o)?(energyCount(o.opponentPublic?.active)>=2?285:245):0;
  if(matches(card,PRINT.karen)) {
    const regidrago=slots(o.opponentPublic).some(row=>/Regidrago/i.test(row.pokemon.printing));
    const discard=list(o.opponentPublic?.discard);
    const dragonPayload=discard.some(card=>/Dialga|Dragapult|Giratina|Noivern|Kyurem|Goodra|Duraludon|Dragonite|Reshiram|Zekrom/i.test(textOf(card)));
    const ownPokemons=list(o.ownPublic?.discard).filter(card=>
      /Garbodor|Trubbish|Budew|Mega Absol|Dedenne|Crobat|Tapu Lele|Squawkabilly/i.test(textOf(card))).length;
    if(regidrago&&dragonPayload)return 295;
    if(ownPokemons>=2)return 155;
    return 0;
  }
  return 0;
}
function rank16HasViableVsTarget(o) {
  return list(o.ownPublic?.discard).some(card=>
    rank16SourceSupporterScore(card,o)>0);
}
function supporterScore(card, observation) {
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
// Plumeria's discard-2 cost is realistically payable only if two actor-hand
// cards are expendable; its payoff needs an opponent's visible attached Energy.
function rank16PlumeriaAvailable(o) {
  return supporterAvailable(o) &&
    // VS Seeker is never expendable while evaluating a recovery route:
    // evaluating its own discardability would recursively rescore Plumeria.
    list(o?.ownHand).filter(card=>!matches(card,PRINT.vs)&&
      discardScore(card,o)>0).length>=2 &&
    slots(o?.opponentPublic).some(row=>energyCount(row.pokemon)>0);
}
function rank16PlumeriaTargetScore(choice,o) {
  if(owner(choice)!=='opponent')return 0;
  const row=opponentPokemon(choice,o);
  if(!row||energyCount(row.pokemon)===0)return 0;
  return 90+energyCount(row.pokemon)*45+(row.zone==='active'?30:0)+prizeLiability(row.pokemon)*9;
}
function rank16PlumeriaEnergyScore(choice) {
  if(owner(choice)!=='opponent'||choice.kind!=='energy')return 0;
  // Agent36's real locateCard() projects a Pokémon's attached Energy as
  // sourceZone='energy' (not the natural-language 'attached').
  if(zone(choice)!=='energy')return 0;
  return /Double Dragon Energy|Double Colorless Energy|Special Energy|Jet Energy|Legacy Energy/i.test(textOf(choice))?225:150;
}
// Battle Compressor PHF92: choose *up to three actual cards from own deck*
// and discard. Promote Dark Patch funding, not imaginary Dragon payloads.
function rank16NeedsDarkPatchFuel(o) {
  return slots(o.ownPublic).some(row=>row.zone==='bench'&&
    matches(row.pokemon.printing,PRINT.mega)&&energyCount(row.pokemon)<3);
}
function rank16CompressorScore(choice,o) {
  if(owner(choice)!=='actor'||zone(choice)!=='deck')return 0;
  const printing=textOf(choice);
  const inDiscard=discardCount(o.ownPublic,PRINT.dark);
  const patchInHand=list(o.ownHand).some(c=>matches(c,PRINT.darkPatch));
  if(matches(printing,PRINT.dark)) {
    if(inDiscard>=2)return 0;
    return rank16NeedsDarkPatchFuel(o)?(patchInHand?260:185):0;
  }
  if(matches(printing,PRINT.vip)&&o.globalTurn>2)return 95;
  if(matches(printing,PRINT.boost)&&hasGarbodor(o))return 65;
  if([PRINT.marnie,PRINT.plumeria,PRINT.karen].some(p=>matches(printing,p)) &&
     list(o.ownHand).some(c=>matches(c,PRINT.vs)))
    return Math.min(150,Math.max(0,rank16SourceSupporterScore(choice,o)));
  return 0;
}
function rank16CompressorTargets(prompt,choices,o) {
  const meta=prompt.publicMetadata??{};
  if(meta.selectionType!=='card-combination')return {
    kind:'abstain',reasonCode:'BATTLE_COMPRESSOR_UNSUPPORTED_SELECTION'};
  const minimum=Number.isSafeInteger(meta.minimumCount)?meta.minimumCount:0;
  const maximum=Number.isSafeInteger(meta.maximumCount)?meta.maximumCount:3;
  if(maximum>3||minimum>maximum||minimum<0)return {
    kind:'abstain',reasonCode:'BATTLE_COMPRESSOR_UNEXPECTED_BOUNDS'};
  const ranked=choices.filter(c=>owner(c)==='actor'&&zone(c)==='deck')
    .map(c=>({c,score:rank16CompressorScore(c,o)}))
    .filter(row=>row.score>0).sort((a,b)=>b.score-a.score);
  const selected=[],darkCap=Math.max(0,2-discardCount(o.ownPublic,PRINT.dark));
  let darkSelected=0;
  for(const row of ranked) {
    if(selected.length===maximum)break;
    if(matches(row.c,PRINT.dark)){
      if(darkSelected>=darkCap)continue;
      darkSelected++;
    }
    selected.push(row.c.token);
  }
  if(selected.length<minimum)return {
    kind:'abstain',reasonCode:'BATTLE_COMPRESSOR_NO_SAFE_DECK_SELECTION'};
  if(!selected.length) {
    const empty=list(prompt.choices).find(c=>c.kind==='empty-selection');
    return empty?{kind:'select-choice',token:empty.token}:{
      kind:'abstain',reasonCode:'BATTLE_COMPRESSOR_NO_SAFE_DECK_SELECTION'};
  }
  return {kind:'select-choices',tokens:selected};
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
    if(rank16UsefulOwnSetup(item,observation))return 475;
    // Fail closed even if a stale/offered action erroneously exposes a
    // non-Garbotoxin own Ability through our live Garbotoxin lock.
    if(rank16LockLive(observation))return 0;
    const ability = metadata.abilityName ?? '';
    if (/^Dedechange$/i.test(ability)) {
      return !hasGarbodor(observation) && hand.length <= 4 && deckCount(observation) > 0 &&
        safeToDiscardHand(observation) ? 235 : 0;
    }
    if (/^Star Alchemy$/i.test(ability)) {
      const crobatHasStone = slots(own).some(row =>
        matches(row.pokemon.printing, PRINT.crobat) && list(row.pokemon.tools).some(tool => matches(tool, PRINT.forest)));
      return crobatHasStone && !observation.ownTurnResources?.vstarUsed && deckCount(observation) > 0
        ? (hasTrubbish(observation) && !hasGarbodor(observation) ? 255 : 205) : 0;
    }
    if (/^Dark Asset$/i.test(ability)) return hand.length < 6 && deckCount(observation) > 0 ? 180 : 0;
    if (/^Squawk and Seize$/i.test(ability)) {
      return observation.globalTurn <= 2 && hand.length <= 2 && safeToDiscardHand(observation) ? 220 : 0;
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
    if(matches(target,PRINT.budew)&&rank16LockLive(observation)&&!rank16LethalOffered(request))return 430;
    const row = slots(own).find(value => value.pokemon.printing === target);
    if (matches(target, PRINT.mega)) {
      const energies = row ? energyCount(row.pokemon) : 0;
      const activeDamage = opponent.active?.damage ?? 0;
      return energies >= 3 || (energies >= 2 && activeDamage === 60) ? 220 : 0;
    }
    if (matches(target, PRINT.garbodor)) return 65;
    return 0;
  }
  if (item.kind !== 'play-card') return 0;
  if(rank16UsefulOwnSetup(item,observation))return 480;
  // If Garbotoxin is already live, benching Ability-only utility Basics
  // consumes Bench capacity without triggering their usual draw/search.
  if((rank16LockLive(observation)||rank16OpponentBlocksSupport(observation,printing))&&
    [PRINT.crobat,PRINT.dedenne,PRINT.tapuLele,PRINT.squawk]
      .some(pattern=>matches(printing,pattern)))return 0;
  if (matches(printing, PRINT.trubbish)) return count(own, PRINT.trubbish) < 2 ? 210 : 20;
  if (matches(printing, PRINT.garbodor)) return hasTrubbish(observation) && !hasGarbodor(observation) ? 240 : 55;
  if (matches(printing, PRINT.mega)) return count(own, PRINT.mega) < 2 ? 190 : 35;
  if (matches(printing, PRINT.dedenne)) return !rank16CanBenchSupport(observation)?0:!hasGarbodor(observation) && hand.length <= 4 ? 165 : 30;
  if (matches(printing, PRINT.crobat)) return !rank16CanBenchSupport(observation)?0:hand.length <= 4 ? 125 : 30;
  if (matches(printing, PRINT.squawk)) return !rank16CanBenchSupport(observation)?0:observation.globalTurn <= 2 && hand.length <= 2 ? 100 : 10;
  if (matches(printing, PRINT.tapuLele)) return !rank16CanBenchSupport(observation)?0:supporterAvailable(observation) ? 120 : 30;
  if (matches(printing, PRINT.tapuKoko)) return !rank16CanBenchSupport(observation)?0:!hasTapuKoko(observation) ? 105 : 0;
  if (matches(printing, PRINT.budew)) return count(own, PRINT.budew) === 0 ? 265 : 0;
  if (matches(printing, PRINT.vip)) return observation.globalTurn <= 2 && benchCount(own) < 5 ? 240 : 0;
  if (matches(printing, PRINT.quick)) {
    if(rank16CheapDiscardCount(observation,printing)<1)return 0;
    return count(own, PRINT.trubbish) < 2 || count(own, PRINT.mega) < 2 || count(own, PRINT.dedenne) === 0 ? 185 : 35;
  }
  if (matches(printing, PRINT.ultra)) {
    if(rank16CheapDiscardCount(observation,printing)<2)return 0;
    return count(own, PRINT.trubbish) < 2 || count(own, PRINT.mega) < 2 ? 165 : 0;
  }
  if (matches(printing, PRINT.battleCompressor)) {
    return deckCount(observation)>0 && rank16NeedsDarkPatchFuel(observation) &&
      discardCount(own,PRINT.dark)<2?230:0;
  }
  if (matches(printing, PRINT.secret)) {
    return deckCount(observation)>0&&rank16CheapDiscardCount(observation,printing)>=3?335:0;
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
  if ([PRINT.guzma, PRINT.carmine, PRINT.iono, PRINT.roxanne, PRINT.lilliesDetermination]
    .some(pattern => matches(printing, pattern))) return supporterScore(printing, observation);
  if (matches(printing, PRINT.dark)) {
    const row = slots(own).find(value => value.pokemon.printing === item.targetPrinting);
    return row && matches(row.pokemon.printing, PRINT.mega) && energyCount(row.pokemon) < 3 ? 190 : 20;
  }
  if (matches(printing, PRINT.lightning)) {
    const row = slots(own).find(value => value.pokemon.printing === item.targetPrinting);
    return row && (matches(row.pokemon.printing, PRINT.tapuKoko) || matches(row.pokemon.printing, PRINT.mega))
      ? 90 : 10;
  }
  if ([PRINT.float, PRINT.forest, PRINT.muscle].some(pattern => matches(printing, pattern))) {
    if(rank16UntooledGarb(observation)&&!rank16ToolSuppressed(observation)&&
       !rank16PendingOwnSetup(request)&&(!item.targetPrinting||matches(item.targetPrinting,PRINT.garbodor)))return 440;
    const row = slots(own).find(value => value.pokemon.printing === item.targetPrinting);
    if (!row || list(row.pokemon.tools).length > 0) return 0;
    if (matches(printing, PRINT.float) && matches(row.pokemon.printing, PRINT.trubbish) && !hasGarbodor(observation)) return 225;
    if (matches(printing, PRINT.forest) && matches(row.pokemon.printing, PRINT.crobat)) return 180;
    if (matches(printing, PRINT.muscle) && matches(row.pokemon.printing, PRINT.mega)) return 150;
    return 25;
  }
  if(matches(printing,PRINT.plumeria)) {
    if(!rank16PlumeriaAvailable(observation))return 0;
    const n=energyCount(opponent?.active);
    return n>=2?280:n===1?245:195;
  }
  // Karen shuffles every Pokémon out of both discard piles, disrupting
  // Regidrago VSTAR Apex Dragon's live copy-attack source.
  // No additional source card-choice prompt is required for Karen itself.
  if(matches(printing,PRINT.karen))
    return rank16SourceSupporterScore({printing},observation);
  if(matches(printing,PRINT.marnie))return supporterAvailable(observation)&&hand.length<=3?220:0;
  if(matches(printing,PRINT.trainersMail))return deckCount(observation)>0?185:0;
  if (matches(printing, PRINT.vs)) return rank16HasViableVsTarget(observation)?185:0;
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
  if (!ranked.length || ranked[0].score <= 0) return { kind: 'abstain', reasonCode: reason };
  const metadata = prompt?.publicMetadata ?? {};
  // Agent49 protocol treats even one Pokémon recipient as multi-select.
  if (['pokemon', 'card-combination', 'energy-payment', 'prize-slots', 'card-order']
      .includes(metadata.selectionType)) {
    const min = Number.isSafeInteger(metadata.minimumCount) ? metadata.minimumCount : 1;
    const max = Number.isSafeInteger(metadata.maximumCount) ? metadata.maximumCount : 1;
    return min <= 1 && max >= 1
      ? { kind: 'select-choices', tokens: [ranked[0].choice.token] }
      : { kind: 'abstain', reasonCode: reason };
  }
  return { kind: 'select-choice', token: ranked[0].choice.token };
}
function category(printing) {
  if ([PRINT.quick, PRINT.ultra, PRINT.darkPatch, PRINT.boost, PRINT.battleCompressor, PRINT.nightStretcher,
    PRINT.rod, PRINT.pokemonCommunication, PRINT.heavyBall, PRINT.fieldBlower, PRINT.vs, PRINT.vip]
    .some(pattern => matches(printing, pattern))) return 'item';
  if ([PRINT.float, PRINT.forest, PRINT.muscle].some(pattern => matches(printing, pattern))) return 'tool';
  if ([PRINT.guzma, PRINT.carmine, PRINT.iono, PRINT.roxanne, PRINT.lilliesDetermination,
    PRINT.crispin, PRINT.wally, PRINT.karen, PRINT.marnie, PRINT.plumeria].some(pattern => matches(printing, pattern))) return 'supporter';
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
function promptDecision(request) {
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
    if (/plumeria/.test(source)) {
      const cost=choices.filter(c=>owner(c)==='actor'&&zone(c)==='hand');
      if(cost.length) {
        const meta=prompt.publicMetadata??{};
        if(meta.selectionType!=='card-combination'||meta.minimumCount!==2||
           meta.maximumCount!==2)return {kind:'abstain',reasonCode:'BAD_PLUMERIA_COST_SHAPE'};
        return multiSelect(prompt,cost,c=>discardScore(c,observation),
          'NO_PLUMERIA_TWO_DISPOSABLE_CARDS');
      }
      const attached=choices.filter(c=>rank16PlumeriaEnergyScore(c)>0);
      if(attached.length)return singleChoice(prompt,attached,rank16PlumeriaEnergyScore,
        'NO_PLUMERIA_ATTACHED_ENERGY');
      return {kind:'abstain',reasonCode:'UNSUPPORTED_PLUMERIA_CARD_PROMPT'};
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
      return singleChoice(prompt, deck, choice => basicScore(choice, observation), 'NO_ULTRA_BALL_POKEMON');
    }
    if(/trainers' mail/.test(source))return singleChoice(prompt,choices.filter(c=>owner(c)==='actor'),
      c=>cardSearchScore({...c,publicMetadata:{...c.publicMetadata,ownerSeat:'actor',sourceZone:'deck'}},observation),
      'NO_SAFE_TRAINERS_MAIL_ITEM');
    if(/battle compressor/.test(source))return rank16CompressorTargets(prompt,choices,observation);
    if (/vs seeker/.test(source)) {
      return singleChoice(prompt, discard, choice => rank16SourceSupporterScore(choice, observation), 'NO_VS_SEEKER_SUPPORTER');
    }
    if (/wonder tag/.test(source)) {
      return singleChoice(prompt, deck, choice => rank16SourceSupporterScore(choice, observation), 'NO_WONDER_TAG_SUPPORTER');
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
      return { kind: 'abstain', reasonCode: 'RANK16_TAPU_KOKO_PROMPT_HELD_OUT' };
    }
    if (/crispin|pokémon communication|pokemon communication|hisuian heavy ball|wally|karen/.test(source)) {
      return { kind: 'abstain', reasonCode: 'RANK16_MULTI_STEP_PROMPT_HELD_OUT' };
    }
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_CARD_PROMPT' };
  }
  if (prompt.promptType === 'ChoosePokemonPrompt') {
    if(/plumeria/.test(source))return singleChoice(prompt,
      choices.filter(c=>owner(c)==='opponent'),
      c=>rank16PlumeriaTargetScore(c,observation),
      'NO_PLUMERIA_TARGET_WITH_ENERGY');
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
        if(matches(row.pokemon.printing,PRINT.garbodor)&&!rank16ToolSuppressed(observation))return 360;
        if (/float stone/.test(source) && matches(row.pokemon.printing, PRINT.trubbish) && !hasGarbodor(observation)) return 260;
        if (/forest seal stone/.test(source) && matches(row.pokemon.printing, PRINT.crobat)) return 240;
        if (/muscle band/.test(source) && matches(row.pokemon.printing, PRINT.mega)) return 220;
        return 0;
      }, 'NO_TOOL_ATTACHMENT_TARGET');
    }
    if (/tap[u]? koko|dance of the ancients/.test(source)) {
      return { kind: 'abstain', reasonCode: 'RANK16_TAPU_KOKO_PROMPT_HELD_OUT' };
    }
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_POKEMON_PROMPT' };
  }
  if(prompt.promptType==='ChooseEnergyPrompt'&&/plumeria/.test(source)) {
    return singleChoice(prompt,choices.filter(c=>rank16PlumeriaEnergyScore(c)>0),
      rank16PlumeriaEnergyScore,'NO_PLUMERIA_ATTACHED_ENERGY');
  }
  if (['ConfirmPrompt', 'SelectPrompt', 'SelectOptionPrompt'].includes(prompt.promptType)) {
    const yes = choices.find(choice => /^(yes|true|confirm)$/i.test(choice.label ?? ''));
    const no = choices.find(choice => /^(no|false|decline|cancel)$/i.test(choice.label ?? ''));
    const accept = (/dedechange/.test(source) && !hasGarbodor(observation) &&
      handCount(observation) <= 4 && safeToDiscardHand(observation)) ||
      (/dark asset/.test(source) && handCount(observation) < 6 && deckCount(observation) > 0) ||
      (/squawk and seize/.test(source) && observation.globalTurn <= 2 &&
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
function createPolicy({ role, seat, policyVersion, config }) {
  if (role !== 'opponent' || (seat !== 0 && seat !== 1) || policyVersion !== POLICY_VERSION ||
      !config || Array.isArray(config) || Object.keys(config).length !== 0) {
    throw new Error('AGENT33_RANK16_POLICY_INIT_MISMATCH');
  }
  return Object.freeze({
    decide(request) {
      if (!request || request.role !== 'opponent' || request.seat !== seat ||
          request.observation?.actorSeat !== seat) {
        return { kind: 'abstain', reasonCode: 'ROLE_SEAT_BINDING_MISMATCH' };
      }
      const decision = request.prompt !== null ? promptDecision(request) : bestAction(request);
      if (decision.kind !== 'abstain') return decision;
      // The strict worker accepts only its fixed public abstention codebook.
      const allowed = new Set(['ROLE_SEAT_BINDING_MISMATCH', 'NO_EXECUTABLE_ACTION',
        'NO_SUPPORTED_ACTION', 'UNSUPPORTED_PROMPT_TYPE',
        'NO_SUPPORTED_CARD_SELECTION', 'NO_SUPPORTED_POKEMON_CHOICE']);
      if (allowed.has(decision.reasonCode)) return decision;
      if (request.prompt?.promptType === 'ChooseCardsPrompt')
        return { kind: 'abstain', reasonCode: 'NO_SUPPORTED_CARD_SELECTION' };
      if (request.prompt?.promptType === 'ChoosePokemonPrompt')
        return { kind: 'abstain', reasonCode: 'NO_SUPPORTED_POKEMON_CHOICE' };
      return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
    }
  });
}
module.exports = {
  POLICY_VERSION, SOURCE_RANK, SOURCE_LIST_BLOB_SHA1, 
  CANDIDATE_ENTRY_JSON_SHA256, ENGINE_PIN, WORKER_PROTOCOL_BLOB_SHA1, SOURCE_INVENTORY,
  createPolicy, scoreAction, scoreAttack, promptDecision, bestAction, basicScore,
  cardSearchScore, discardScore, opponentHandDiscardScore
};
