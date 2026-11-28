'use strict';

/*
 * Rank-5 Mew Genesect opponent-role policy, version 8.
 *
 * Deterministic actor-view-only policy bound to the unchanged Aichi rank-5
 * source 60 and the current Hood Shield v1 challenger. This is a policy
 * prototype, not an independent competence attestation or game result.
 * Unsupported or ambiguous prompts abstain; native Store legality is final.
 */

const POLICY_VERSION = 'agent20-rank5-mew-genesect-opponent-v8';
const SOURCE_RANK = 5;
const SOURCE_LIST_BLOB_SHA1 = 'ae773f6201d7aa69d31914dbfee66f3fba692200';
const SOURCE_FINGERPRINT_SHA256 = 'a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05';
const CANDIDATE_FINGERPRINT_SHA256 = '1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4';
const ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const WORKER_PROTOCOL_BLOB_SHA1 = 'd51ea95c457d61b50a9ee114d342eb17f4350451';

const PRINT = Object.freeze({
  mewV: /^Mew V FST 113\b/i,
  mewVMAX: /^Mew VMAX FST 114\b/i,
  genesect: /^Genesect V FST 185\b/i,
  dedenne: /^Dedenne-GX UNB 57\b/i,
  crobat: /^Crobat V DAA 104\b/i,
  clefairy: /^Lillie's Clefairy ex JTG 56\b/i,
  wally: /^Wally ROS 94\b/i,
  guzma: /^Guzma BUS 115\b/i,
  karen: /^Karen XYP 177\b/i,
  marnie: /^Marnie SSH 169\b/i,
  ranger: /^Pokémon Ranger STS 104\b/i,
  quickBall: /^Quick Ball FST 237\b/i,
  ultraBall: /^Ultra Ball MEG 131\b/i,
  trainersMail: /^Trainers' Mail ROS 92\b/i,
  vipPass: /^Battle VIP Pass FST 225\b/i,
  specialCharge: /^Special Charge STS 105\b/i,
  vsSeeker: /^VS Seeker PHF 109\b/i,
  specialRedCard: /^Special Red Card CRI 82\b/i,
  enhancedHammer: /^Enhanced Hammer TWM 148\b/i,
  fieldBlower: /^Field Blower GRI 125\b/i,
  lostVacuum: /^Lost Vacuum LOR 162\b/i,
  escapeRope: /^Escape Rope BST 125\b/i,
  heavyBall: /^Hisuian Heavy Ball ASR 146\b/i,
  secretBox: /^Secret Box TWM 163\b/i,
  muscleBand: /^Muscle Band XY 121\b/i,
  floatStone: /^Float Stone BKT 137\b/i,
  forestSealStone: /^Forest Seal Stone SIT 156\b/i,
  skyField: /^Sky Field ROS 89\b/i,
  pathToPeak: /^Path to the Peak CRE 148\b/i,
  dce: /^Double Colorless Energy SUM 136\b/i
});

const SOURCE_INVENTORY = Object.freeze([
  [PRINT.mewV, 4], [PRINT.mewVMAX, 3], [PRINT.genesect, 4],
  [PRINT.dedenne, 1], [PRINT.crobat, 1], [PRINT.clefairy, 1],
  [PRINT.guzma, 2], [PRINT.karen, 2], [PRINT.wally, 1], [PRINT.marnie, 1],
  [PRINT.ranger, 1], [PRINT.quickBall, 4], [PRINT.ultraBall, 4],
  [PRINT.trainersMail, 3], [PRINT.vipPass, 3], [PRINT.specialCharge, 2],
  [PRINT.vsSeeker, 2], [PRINT.specialRedCard, 2], [PRINT.enhancedHammer, 1],
  [PRINT.fieldBlower, 1], [PRINT.lostVacuum, 1], [PRINT.escapeRope, 1],
  [PRINT.heavyBall, 1], [PRINT.secretBox, 1], [PRINT.muscleBand, 2],
  [PRINT.floatStone, 2], [PRINT.forestSealStone, 1], [PRINT.skyField, 2],
  [PRINT.pathToPeak, 2], [PRINT.dce, 4]
]);

const EXECUTABLE = new Set([
  'play-card', 'attack', 'retreat', 'use-ability', 'use-stadium', 'pass'
]);

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

function boardCount(player, pattern) {
  return slots(player).filter(row => matches(row.pokemon.printing, pattern)).length;
}

function benchCount(player) {
  return list(player?.bench).filter(pokemon => pokemon && pokemon.concealed !== true).length;
}

function boardHas(player, pattern) {
  return boardCount(player, pattern) > 0;
}

function energyCount(pokemon) {
  return list(pokemon?.energies).length;
}

function hasDce(pokemon) {
  return list(pokemon?.energies).some(energy => matches(energy, PRINT.dce));
}

function remainingHp(pokemon) {
  if (!pokemon || !Number.isFinite(pokemon.hp) || !Number.isFinite(pokemon.damage)) return -1;
  return pokemon.hp - pokemon.damage;
}

function expectedMewDamage(observation) {
  const active = observation?.ownPublic?.active;
  if (!matches(active?.printing ?? '', PRINT.mewVMAX) || !hasDce(active)) return 0;
  const genesectBench = list(observation.ownPublic.bench).some(pokemon =>
    pokemon && matches(pokemon.printing, PRINT.genesect));
  if (genesectBench) {
    const muscleBand = list(active.tools).some(tool => matches(tool, PRINT.muscleBand));
    return muscleBand ? 230 : 210;
  }
  const mewBench = list(observation.ownPublic.bench).some(pokemon =>
    pokemon && matches(pokemon.printing, PRINT.mewV));
  return mewBench ? 70 : 0;
}

function handHas(observation, pattern) {
  return list(observation?.ownHand).some(card => matches(card, pattern));
}

function handCount(observation) {
  return list(observation?.ownHand).length;
}

function ownDeckCount(observation) {
  return Number.isSafeInteger(observation?.ownPublic?.deckCount) ?
    observation.ownPublic.deckCount : 0;
}

function opponentHandCount(observation) {
  return Number.isSafeInteger(observation?.opponentPublic?.handCount) ?
    observation.opponentPublic.handCount : 0;
}

function opponentPrizeCount(observation) {
  return Number.isSafeInteger(observation?.opponentPublic?.prizeCount) ?
    observation.opponentPublic.prizeCount : 6;
}

function supporterAvailable(observation) {
  const resources = observation?.ownTurnResources ?? {};
  return resources.supporterPlayedTurn === 0 &&
    resources.supporterPlayLocked !== true &&
    observation?.ownPublic?.publicTurnRestrictions?.supporterPlayLocked !== true;
}

function isFusionStrike(pokemon) {
  const subtypes = list(pokemon?.printed?.subtypes);
  return subtypes.some(value => /fusion strike/i.test(value)) ||
    matches(pokemon?.printing, PRINT.mewV) ||
    matches(pokemon?.printing, PRINT.mewVMAX) ||
    matches(pokemon?.printing, PRINT.genesect);
}

function fusionStrikeCount(player) {
  return slots(player).filter(row => isFusionStrike(row.pokemon)).length;
}

function candidateHasShadowRider(observation) {
  return slots(observation?.opponentPublic).some(row =>
    /Shadow Rider Calyrex VMAX CRE 75/i.test(row.pokemon.printing));
}

function candidateHasDragon(observation) {
  return slots(observation?.opponentPublic).some(row =>
    list(row.pokemon.printed?.types).some(type => /dragon/i.test(type)));
}

function candidateToolOrStadiumTargets(observation) {
  const opponent = observation?.opponentPublic ?? {};
  const targets = [];
  for (const row of slots(opponent)) {
    for (const tool of list(row.pokemon.tools)) {
      if (matches(tool, PRINT.forestSealStone) || matches(tool, PRINT.floatStone) ||
          /Stealthy Hood/i.test(valueText(tool))) {
        targets.push(tool);
      }
    }
  }
  for (const stadium of list(opponent.stadium)) targets.push(stadium);
  return targets;
}

function pokemonByActionTarget(player, printing, actionItem) {
  const rows = slots(player).filter(row =>
    row.pokemon.printing === printing || row.pokemon.printing.includes(printing));
  const metadata = actionItem?.publicMetadata ?? {};
  const zone = metadata.targetZone ?? metadata.zone ?? null;
  if (zone === 'active') return rows.find(row => row.zone === 'active') ?? null;
  if (zone === 'bench' && Number.isInteger(metadata.benchIndex)) {
    return rows.find(row => row.zone === 'bench' && row.index === metadata.benchIndex) ?? null;
  }
  return rows.length === 1 ? rows[0] : null;
}

function ownPokemonByPrinting(observation, printing, actionItem = null) {
  return pokemonByActionTarget(observation?.ownPublic, printing, actionItem);
}

function opponentPokemonByPrinting(observation, printing, actionItem = null) {
  return pokemonByActionTarget(observation?.opponentPublic, printing, actionItem);
}

function choiceOwner(choice) {
  return choice?.publicMetadata?.ownerSeat ?? null;
}

function choiceZone(choice) {
  return choice?.publicMetadata?.sourceZone ??
    choice?.publicMetadata?.targetZone ??
    choice?.publicMetadata?.zone ?? null;
}

function choiceText(choice) {
  return [
    valueText(choice),
    choice?.label ?? '',
    choice?.publicMetadata?.sourceAttack ?? '',
    choice?.publicMetadata?.sourceEffect ?? ''
  ].join(' ');
}

function prizeLiability(pokemon) {
  const subtypes = list(pokemon?.printed?.subtypes).join(' ').toLowerCase();
  if (/\bvmax\b/.test(subtypes) || /VMAX/.test(pokemon?.printing ?? '')) return 3;
  if (/\b(?:v|gx|ex)\b/.test(subtypes) ||
      /(?: Pokémon )?(?:V|GX|ex)\b/.test(pokemon?.printing ?? '')) return 2;
  return 1;
}

function opponentPokemonScore(choice, observation, expectedDamage = 210) {
  if (choiceOwner(choice) !== 'opponent' ||
      !['bench', 'active'].includes(choiceZone(choice))) return 0;
  const row = opponentPokemonByPrinting(observation, valueText(choice), choice);
  if (!row) return 5;
  const pokemon = row.pokemon;
  const hp = remainingHp(pokemon);
  const ko = hp > 0 && hp <= expectedDamage;
  return prizeLiability(pokemon) * 55 +
    (ko ? 190 : 0) +
    energyCount(pokemon) * 12 +
    Math.max(0, pokemon.damage ?? 0) * 0.15;
}

function ownSwitchScore(choice, observation) {
  if (choiceOwner(choice) !== 'actor' || choiceZone(choice) !== 'bench') return 0;
  const row = ownPokemonByPrinting(observation, valueText(choice), choice);
  if (!row) return 0;
  if (matches(row.pokemon.printing, PRINT.mewVMAX) && hasDce(row.pokemon)) return 240;
  if (matches(row.pokemon.printing, PRINT.mewV) && hasDce(row.pokemon)) return 145;
  if (matches(row.pokemon.printing, PRINT.genesect)) return 70;
  return 20 + energyCount(row.pokemon) * 5;
}

function scoreSearchPokemon(printing, observation, context = '') {
  const own = observation.ownPublic;
  const mewVCount = boardCount(own, PRINT.mewV);
  const mewVMAXCount = boardCount(own, PRINT.mewVMAX);
  const genesectCount = boardCount(own, PRINT.genesect);

  if (matches(printing, PRINT.mewVMAX)) {
    if (context === 'wally') {
      return mewVCount > 0 && mewVMAXCount === 0 ? 260 : 0;
    }
    return mewVCount > 0 && mewVMAXCount === 0 ? 250 :
      mewVMAXCount === 0 ? 155 : 40;
  }
  if (matches(printing, PRINT.mewV)) return mewVCount < 2 ? 220 : 55;
  if (matches(printing, PRINT.genesect)) return genesectCount < 2 ? 230 :
    genesectCount < 3 ? 145 : 35;
  const protectedCard = list(observation.ownHand).some(card =>
    matches(card, PRINT.dce) || matches(card, PRINT.mewVMAX) ||
    matches(card, PRINT.wally) || matches(card, PRINT.secretBox));
  if (matches(printing, PRINT.dedenne)) {
    return handCount(observation) <= 2 && !protectedCard &&
      !list(own.stadium).some(value => matches(value, PRINT.pathToPeak)) ? 130 : 20;
  }
  if (matches(printing, PRINT.crobat)) {
    return handCount(observation) <= 4 &&
      !list(own.stadium).some(value => matches(value, PRINT.pathToPeak)) ? 125 : 35;
  }
  if (matches(printing, PRINT.clefairy)) return candidateHasDragon(observation) ? 95 : 5;
  return 0;
}

function scoreTrainerSearch(printing, observation) {
  if (matches(printing, PRINT.wally)) {
    const freshMew = slots(observation.ownPublic).some(row =>
      matches(row.pokemon.printing, PRINT.mewV) &&
      row.pokemon.lastPlayedOrEvolvedTurn === observation.globalTurn);
    return freshMew && boardCount(observation.ownPublic, PRINT.mewVMAX) === 0 ? 235 : 40;
  }
  if (matches(printing, PRINT.ultraBall) || matches(printing, PRINT.quickBall)) {
    return 170;
  }
  if (matches(printing, PRINT.vipPass)) {
    return observation.globalTurn <= 2 && benchCount(observation.ownPublic) < 5 ? 180 : 0;
  }
  if (matches(printing, PRINT.vsSeeker)) {
    return list(observation.ownPublic.discard).some(card =>
      [PRINT.wally, PRINT.guzma, PRINT.marnie, PRINT.karen].some(pattern => matches(card, pattern))) ? 150 : 60;
  }
  if (matches(printing, PRINT.specialCharge)) {
    return list(observation.ownPublic.discard).filter(card => matches(card, PRINT.dce)).length >= 2 ? 145 : 35;
  }
  if (matches(printing, PRINT.secretBox)) return 125;
  if (matches(printing, PRINT.fieldBlower) || matches(printing, PRINT.lostVacuum)) {
    return candidateToolOrStadiumTargets(observation).length > 0 ? 115 : 30;
  }
  if (matches(printing, PRINT.specialRedCard)) {
    return opponentPrizeCount(observation) <= 3 && opponentHandCount(observation) >= 3 ? 145 : 20;
  }
  if (matches(printing, PRINT.trainersMail)) return 120;
  if (matches(printing, PRINT.heavyBall)) return 70;
  if (matches(printing, PRINT.pathToPeak)) return candidateHasShadowRider(observation) ? 130 : 20;
  if (matches(printing, PRINT.skyField)) return slots(observation.ownPublic).length >= 5 ? 100 : 15;
  return 35;
}

function scoreDiscardCard(choice, observation) {
  const printing = valueText(choice);
  const own = observation.ownPublic;
  const hand = list(observation.ownHand);
  const dceInHand = hand.filter(card => matches(card, PRINT.dce)).length;
  const mewVMAXInHand = hand.some(card => matches(card, PRINT.mewVMAX));
  const mewVMAXCountInHand = hand.filter(card => matches(card, PRINT.mewVMAX)).length;
  const freshMew = slots(own).some(row =>
    matches(row.pokemon.printing, PRINT.mewV) &&
    row.pokemon.lastPlayedOrEvolvedTurn === observation.globalTurn);

  if (matches(printing, PRINT.dce)) return dceInHand > 2 ? 55 : 0;
  if (matches(printing, PRINT.mewVMAX) && boardCount(own, PRINT.mewV) > 0 &&
      boardCount(own, PRINT.mewVMAX) === 0 && mewVMAXCountInHand <= 1) return 0;
  if (matches(printing, PRINT.wally) && freshMew &&
      boardCount(own, PRINT.mewVMAX) === 0 && !mewVMAXInHand) return 0;
  if (matches(printing, PRINT.mewV) && boardCount(own, PRINT.mewV) === 0) return 0;
  if (matches(printing, PRINT.genesect) && boardCount(own, PRINT.genesect) < 2) return 0;
  if (matches(printing, PRINT.secretBox)) return 0;
  if (matches(printing, PRINT.specialCharge) &&
      list(own.discard).filter(card => matches(card, PRINT.dce)).length < 2) return 0;
  if (matches(printing, PRINT.vsSeeker) &&
      list(own.discard).some(card => [PRINT.wally, PRINT.guzma, PRINT.marnie].some(pattern => matches(card, pattern)))) {
    return 5;
  }
  if (matches(printing, PRINT.vipPass) && observation.globalTurn > 2) return 100;
  if (matches(printing, PRINT.clefairy) && !candidateHasDragon(observation)) return 95;
  if (matches(printing, PRINT.mewV) && boardCount(own, PRINT.mewV) >= 2) return 65;
  if (matches(printing, PRINT.genesect) && boardCount(own, PRINT.genesect) >= 3) return 55;
  if (matches(printing, PRINT.crobat) || matches(printing, PRINT.dedenne)) return 45;
  if (matches(printing, PRINT.ranger) || matches(printing, PRINT.karen)) return 35;
  if (matches(printing, PRINT.marnie) && opponentHandCount(observation) < 3) return 30;
  if (matches(printing, PRINT.trainersMail) || matches(printing, PRINT.quickBall) ||
      matches(printing, PRINT.ultraBall)) return 25;
  return 15;
}

function multiSelectDecision(prompt, rankedChoices, minimum, maximum, reasonCode) {
  const ranked = rankedChoices.slice().filter(row => row.score > 0)
    .sort((a, b) => b.score - a.score);
  const selected = ranked.slice(0, maximum).map(row => row.choice);
  if (selected.length < minimum) {
    if (minimum === 0) {
      const empty = prompt.choices.find(choice => choice.kind === 'empty-selection');
      if (empty) return { kind: 'select-choice', token: empty.token };
    }
    return { kind: 'abstain', reasonCode };
  }
  if (selected.length === 0) {
    const empty = prompt.choices.find(choice => choice.kind === 'empty-selection');
    return empty ? { kind: 'select-choice', token: empty.token } :
      { kind: 'abstain', reasonCode };
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

function sourcePokemonDiscardCount(player) {
  return list(player?.discard).filter(card =>
    matches(card, PRINT.mewV) || matches(card, PRINT.mewVMAX) ||
    matches(card, PRINT.genesect) || matches(card, PRINT.dedenne) ||
    matches(card, PRINT.crobat) || matches(card, PRINT.clefairy)).length;
}

function scoreForestSealSearch(choice, observation) {
  if (choiceOwner(choice) !== 'actor' || choiceZone(choice) !== 'deck') return 0;
  const printing = valueText(choice);
  const own = observation.ownPublic;
  const hand = list(observation.ownHand);
  const mewVMAXOnBoard = slots(own).some(row => matches(row.pokemon.printing, PRINT.mewVMAX));
  const unpoweredMewVMAXOnBoard = slots(own).some(row =>
    matches(row.pokemon.printing, PRINT.mewVMAX) && !hasDce(row.pokemon));
  const activeMewVMAX = matches(own.active?.printing ?? '', PRINT.mewVMAX) ? own.active : null;

  if (matches(printing, PRINT.mewVMAX) && boardCount(own, PRINT.mewV) > 0 &&
      boardCount(own, PRINT.mewVMAX) === 0) return 300;
  if (matches(printing, PRINT.dce) && unpoweredMewVMAXOnBoard) return 290;
  if (matches(printing, PRINT.genesect) && boardCount(own, PRINT.genesect) < 2) return 250;
  if (matches(printing, PRINT.mewV) && boardCount(own, PRINT.mewV) < 2) return 240;
  if (matches(printing, PRINT.vipPass) && observation.globalTurn <= 2 &&
      benchCount(own) < 5) return 220;
  if (matches(printing, PRINT.wally) && freshMew(observation) &&
      supporterAvailable(observation)) return 210;
  if (matches(printing, PRINT.specialCharge) &&
      list(own.discard).filter(card => matches(card, PRINT.dce)).length >= 2) return 200;
  if (matches(printing, PRINT.specialRedCard) &&
      opponentPrizeCount(observation) <= 3 && opponentHandCount(observation) >= 3) return 185;
  if (matches(printing, PRINT.guzma) && supporterAvailable(observation) &&
      list(observation.opponentPublic?.bench).some(Boolean)) return 180;
  if (matches(printing, PRINT.marnie) && supporterAvailable(observation) &&
      opponentHandCount(observation) >= 4) return 170;
  if (matches(printing, PRINT.pathToPeak) && candidateHasShadowRider(observation) &&
      hand.length >= 4 && !hand.some(card => matches(card, PRINT.dedenne) || matches(card, PRINT.crobat)) &&
      !list(own.stadium).some(card => matches(card, PRINT.pathToPeak))) return 160;
  if (matches(printing, PRINT.muscleBand) && activeMewVMAX &&
      remainingHp(observation.opponentPublic?.active) >= 211 &&
      remainingHp(observation.opponentPublic?.active) <= 230) return 150;
  if (matches(printing, PRINT.fieldBlower) &&
      candidateToolOrStadiumTargets(observation).length > 0) return 140;
  if (matches(printing, PRINT.lostVacuum) &&
      candidateToolOrStadiumTargets(observation).length > 0) return 130;
  if (matches(printing, PRINT.karen) && sourcePokemonDiscardCount(own) >= 2 &&
      (ownDeckCount(observation) <= 20 || !mewVMAXOnBoard)) return 120;
  if (matches(printing, PRINT.ultraBall) && !mewVMAXOnBoard &&
      boardCount(own, PRINT.mewV) > 0) return 110;
  if (matches(printing, PRINT.quickBall) &&
      (boardCount(own, PRINT.mewV) < 2 || boardCount(own, PRINT.genesect) < 2)) return 100;
  if (matches(printing, PRINT.trainersMail)) return 90;
  if (matches(printing, PRINT.floatStone) && activeMewVMAX) return 80;
  return 0;
}

function scoreSearchChoice(choice, observation, context) {
  const printing = valueText(choice);
  if (context === 'pokemon' || context === 'quick-ball' || context === 'ultra-ball' ||
      context === 'battle-vip-pass') {
    return choiceOwner(choice) === 'actor' && choiceZone(choice) === 'deck' ?
      scoreSearchPokemon(printing, observation, context) : 0;
  }
  if (context === 'wally') {
    return choiceOwner(choice) === 'actor' && choiceZone(choice) === 'deck' ?
      scoreSearchPokemon(printing, observation, 'wally') : 0;
  }
  if (context === 'forest-seal-stone') {
    return scoreForestSealSearch(choice, observation);
  }
  if (context === 'trainers-mail') {
    if (choiceOwner(choice) !== 'actor' || choiceZone(choice) !== 'deck') return 0;
    return scoreTrainerSearch(printing, observation);
  }
  if (context === 'vs-seeker') {
    if (choiceOwner(choice) !== 'actor' || choiceZone(choice) !== 'discard') return 0;
    if (matches(printing, PRINT.wally)) return 230;
    if (matches(printing, PRINT.guzma)) return 210;
    if (matches(printing, PRINT.marnie)) return opponentHandCount(observation) >= 4 ? 170 : 80;
    if (matches(printing, PRINT.karen)) return 120;
    if (matches(printing, PRINT.ranger)) return 20;
    return 0;
  }
  if (context === 'special-charge') {
    return choiceOwner(choice) === 'actor' && choiceZone(choice) === 'discard' &&
      matches(printing, PRINT.dce) ? 200 : 0;
  }
  if (context === 'energy-mix') {
    return choiceOwner(choice) === 'actor' && choiceZone(choice) === 'deck' &&
      matches(printing, PRINT.dce) ? 220 : 0;
  }
  if (context === 'hisui-heavy-ball') {
    if (choiceOwner(choice) !== 'actor') return 0;
    return scoreSearchPokemon(printing, observation, 'pokemon');
  }
  if (context === 'secret-box') {
    if (choiceOwner(choice) !== 'actor' || choiceZone(choice) !== 'deck') return 0;
    const type = choice.publicMetadata?.cardType;
    if (type === 'supporter' && (matches(printing, PRINT.wally) || matches(printing, PRINT.guzma))) return 240;
    if (type === 'item' && (matches(printing, PRINT.ultraBall) || matches(printing, PRINT.quickBall))) return 220;
    if (type === 'tool' && (matches(printing, PRINT.muscleBand) || matches(printing, PRINT.forestSealStone))) return 180;
    if (type === 'stadium' && matches(printing, PRINT.pathToPeak)) return 230;
    return 0;
  }
  return 0;
}

function targetToolScore(choice, observation) {
  if (choiceOwner(choice) !== 'opponent') return 0;
  const printing = valueText(choice);
  if (matches(printing, PRINT.forestSealStone)) return 230;
  if (matches(printing, PRINT.floatStone)) return 175;
  if (/Stealthy Hood/i.test(printing)) return 130;
  if (/Sky Field|Dimension Valley/i.test(printing)) return 90;
  return 0;
}

function secretBoxDecision(prompt, choices, observation, minimum, maximum) {
  const categories = ['supporter', 'item', 'tool', 'stadium'];
  const selected = [];
  for (const category of categories) {
    const candidates = choices.filter(choice => {
      if (choiceOwner(choice) !== 'actor' || choiceZone(choice) !== 'deck') return false;
      const type = String(choice.publicMetadata?.cardType ??
        choice.publicMetadata?.sourceCardType ?? '').toLowerCase();
      return type === category;
    }).map(choice => ({
      choice,
      score: scoreSearchChoice(choice, observation, 'secret-box')
    })).filter(row => row.score > 0).sort((a, b) => b.score - a.score);
    if (candidates.length) selected.push(candidates[0].choice);
  }
  if (selected.length < minimum) {
    return { kind: 'abstain', reasonCode: 'NO_SUPPORTED_CARD_SELECTION' };
  }
  const bounded = selected.slice(0, maximum);
  if (!bounded.length) return { kind: 'abstain', reasonCode: 'NO_SUPPORTED_CARD_SELECTION' };
  return { kind: 'select-choices', tokens: bounded.map(choice => choice.token) };
}

function promptDecision(request) {
  const prompt = request.prompt;
  const observation = request.observation;
  const choices = list(prompt?.choices);
  const source = [
    prompt?.source?.sourcePrinting ?? '',
    prompt?.source?.effectName ?? '',
    prompt?.source?.copiedAttackName ?? '',
    prompt?.description ?? ''
  ].join(' ').toLowerCase();
  const metadata = prompt?.publicMetadata ?? {};
  const selectionType = metadata.selectionType ?? null;

  if (prompt.promptType === 'ChooseAttackPrompt') {
    if (!/cross fusion strike/i.test(source)) {
      return { kind: 'abstain', reasonCode: 'UNSUPPORTED_ATTACK_CHOICE_SOURCE' };
    }
    const techno = choices.find(choice => /Techno Blast/i.test(choiceText(choice)));
    if (techno) return { kind: 'select-choice', token: techno.token };
    const energyMix = choices.find(choice => /Energy Mix/i.test(choiceText(choice)));
    if (energyMix && /cross fusion strike/i.test(source)) {
      return { kind: 'select-choice', token: energyMix.token };
    }
    const leap = choices.find(choice => /Psychic Leap/i.test(choiceText(choice)));
    if (leap && /cross fusion strike/i.test(source) &&
        remainingHp(observation.ownPublic?.active) > 0 &&
        remainingHp(observation.ownPublic?.active) <= 210) {
      return { kind: 'select-choice', token: leap.token };
    }
    return { kind: 'abstain', reasonCode: 'NO_VISIBLE_ATTACK_CHOICE' };
  }

  if (prompt.promptType === 'ChooseCardsPrompt') {
    if (selectionType) {
      const minimum = Number.isSafeInteger(metadata.minimumCount) ? metadata.minimumCount : 1;
      const maximum = Number.isSafeInteger(metadata.maximumCount) ? metadata.maximumCount : minimum;

      if (/ultra ball|quick ball|lost vacuum/i.test(source) &&
          choices.some(choice => choiceOwner(choice) === 'actor' && choiceZone(choice) === 'hand')) {
        const handChoices = choices.filter(choice =>
          choiceOwner(choice) === 'actor' && choiceZone(choice) === 'hand');
        return multiSelectDecision(prompt, handChoices.map(choice => ({
          choice, score: scoreDiscardCard(choice, observation)
        })), minimum, maximum, 'NO_LEGAL_CARD_SET');
      }

      if (/secret box/i.test(source) &&
          choices.some(choice => choiceOwner(choice) === 'actor' && choiceZone(choice) === 'hand')) {
        const handChoices = choices.filter(choice =>
          choiceOwner(choice) === 'actor' && choiceZone(choice) === 'hand');
        return multiSelectDecision(prompt, handChoices.map(choice => ({
          choice, score: scoreDiscardCard(choice, observation)
        })), minimum, maximum, 'NO_LEGAL_CARD_SET');
      }

      if (/star alchemy|forest seal stone/i.test(source)) {
        const targets = choices.filter(choice => choiceOwner(choice) === 'actor' &&
          choiceZone(choice) === 'deck');
        return multiSelectDecision(prompt, targets.map(choice => ({
          choice, score: scoreSearchChoice(choice, observation, 'forest-seal-stone')
        })), minimum, maximum, 'NO_USEFUL_CARD_CHOICE');
      }

      if (/battle vip pass/i.test(source)) {
        const targets = choices.filter(choice => choiceOwner(choice) === 'actor' &&
          choiceZone(choice) === 'deck');
        return multiSelectDecision(prompt, targets.map(choice => ({
          choice, score: scoreSearchChoice(choice, observation, 'battle-vip-pass')
        })), minimum, maximum, 'NO_USEFUL_CARD_CHOICE');
      }

      if (/secret box/i.test(source)) {
        const targets = choices.filter(choice => choiceOwner(choice) === 'actor' &&
          choiceZone(choice) === 'deck');
        return secretBoxDecision(prompt, targets, observation, minimum, maximum);
      }

      if (/field blower/i.test(source)) {
        const targets = choices.filter(choice => choiceOwner(choice) === 'opponent');
        return multiSelectDecision(prompt, targets.map(choice => ({
          choice, score: targetToolScore(choice, observation)
        })), minimum, maximum, 'NO_USEFUL_CARD_CHOICE');
      }

      if (/special charge/i.test(source)) {
        const targets = choices.filter(choice => choiceOwner(choice) === 'actor' &&
          choiceZone(choice) === 'discard');
        return multiSelectDecision(prompt, targets.map(choice => ({
          choice, score: scoreSearchChoice(choice, observation, 'special-charge')
        })), minimum, maximum, 'NO_USEFUL_CARD_CHOICE');
      }

      if (/energy mix/i.test(source)) {
        const targets = choices.filter(choice => choiceOwner(choice) === 'actor' &&
          choiceZone(choice) === 'deck');
        return multiSelectDecision(prompt, targets.map(choice => ({
          choice, score: scoreSearchChoice(choice, observation, 'energy-mix')
        })), minimum, maximum, 'NO_USEFUL_CARD_CHOICE');
      }

      return { kind: 'abstain', reasonCode: 'UNSUPPORTED_CARD_COMBINATION_SOURCE' };
    }

    if (/quick ball|lost vacuum/i.test(source) &&
        choices.some(choice => choiceOwner(choice) === 'actor' && choiceZone(choice) === 'hand')) {
      const handChoices = choices.filter(choice =>
        choiceOwner(choice) === 'actor' && choiceZone(choice) === 'hand');
      return singleChoice(prompt, handChoices,
        choice => scoreDiscardCard(choice, observation), 'NO_LEGAL_CARD_SET');
    }
    if (/ultra ball/i.test(source) &&
        choices.some(choice => choiceOwner(choice) === 'actor' && choiceZone(choice) === 'hand')) {
      const handChoices = choices.filter(choice =>
        choiceOwner(choice) === 'actor' && choiceZone(choice) === 'hand');
      return singleChoice(prompt, handChoices,
        choice => scoreDiscardCard(choice, observation), 'NO_LEGAL_CARD_SET');
    }
    if (/star alchemy|forest seal stone/i.test(source)) {
      return singleChoice(prompt, choices.filter(choice =>
        choiceOwner(choice) === 'actor' && choiceZone(choice) === 'deck'),
      choice => scoreSearchChoice(choice, observation, 'forest-seal-stone'),
      'NO_USEFUL_CARD_CHOICE');
    }
    if (/wally/i.test(source)) {
      return singleChoice(prompt, choices, choice =>
        scoreSearchChoice(choice, observation, 'wally'), 'NO_USEFUL_CARD_CHOICE');
    }
    if (/ultra ball/i.test(source)) {
      return singleChoice(prompt, choices, choice =>
        scoreSearchChoice(choice, observation, 'ultra-ball'), 'NO_USEFUL_CARD_CHOICE');
    }
    if (/quick ball/i.test(source)) {
      return singleChoice(prompt, choices, choice =>
        scoreSearchChoice(choice, observation, 'quick-ball'), 'NO_USEFUL_CARD_CHOICE');
    }
    if (/battle vip pass/i.test(source)) {
      return singleChoice(prompt, choices, choice =>
        scoreSearchChoice(choice, observation, 'battle-vip-pass'), 'NO_USEFUL_CARD_CHOICE');
    }
    if (/trainers' mail/i.test(source)) {
      return singleChoice(prompt, choices, choice =>
        scoreSearchChoice(choice, observation, 'trainers-mail'), 'NO_USEFUL_CARD_CHOICE');
    }
    if (/vs seeker/i.test(source)) {
      return singleChoice(prompt, choices, choice =>
        scoreSearchChoice(choice, observation, 'vs-seeker'), 'NO_USEFUL_CARD_CHOICE');
    }
    if (/special charge/i.test(source)) {
      return singleChoice(prompt, choices, choice =>
        scoreSearchChoice(choice, observation, 'special-charge'), 'NO_USEFUL_CARD_CHOICE');
    }
    if (/hisui(an)? heavy ball/i.test(source)) {
      return singleChoice(prompt, choices, choice =>
        scoreSearchChoice(choice, observation, 'hisui-heavy-ball'), 'HIDDEN_PRIZE_IDENTITY');
    }
    if (/energy mix/i.test(source)) {
      return singleChoice(prompt, choices, choice =>
        scoreSearchChoice(choice, observation, 'energy-mix'), 'NO_USEFUL_CARD_CHOICE');
    }
    if (/field blower|lost vacuum/i.test(source)) {
      return singleChoice(prompt, choices, choice => targetToolScore(choice, observation),
        'NO_USEFUL_CARD_CHOICE');
    }
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_CARD_COMBINATION_SOURCE' };
  }

  if (prompt.promptType === 'ChoosePokemonPrompt') {
    if (/energy mix/i.test(source)) {
      return singleChoice(prompt, choices.filter(choice => choiceOwner(choice) === 'actor'),
        choice => {
          const row = ownPokemonByPrinting(observation, valueText(choice), choice);
          if (!row || !isFusionStrike(row.pokemon)) return 0;
          if (matches(row.pokemon.printing, PRINT.mewVMAX)) return hasDce(row.pokemon) ? 40 : 230;
          if (matches(row.pokemon.printing, PRINT.mewV)) return 160;
          if (matches(row.pokemon.printing, PRINT.genesect)) return 80;
          return 0;
        }, 'NO_VISIBLE_POKEMON_TARGET');
    }
    if (/guzma/i.test(source)) {
      const opponentChoices = choices.filter(choice => choiceOwner(choice) === 'opponent');
      if (opponentChoices.length) {
        return singleChoice(prompt, opponentChoices,
          choice => opponentPokemonScore(choice, observation, expectedMewDamage(observation)), 'NO_VISIBLE_POKEMON_TARGET');
      }
      return singleChoice(prompt, choices,
        choice => ownSwitchScore(choice, observation), 'NO_VISIBLE_POKEMON_TARGET');
    }
    if (/escape rope/i.test(source)) {
      const opponentChoices = choices.filter(choice => choiceOwner(choice) === 'opponent');
      if (opponentChoices.length) {
        return singleChoice(prompt, opponentChoices,
          choice => opponentPokemonScore(choice, observation, expectedMewDamage(observation)), 'NO_VISIBLE_POKEMON_TARGET');
      }
      return singleChoice(prompt, choices,
        choice => ownSwitchScore(choice, observation), 'NO_VISIBLE_POKEMON_TARGET');
    }
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_POKEMON_PROMPT' };
  }

  if (prompt.promptType === 'ChooseEnergyPrompt') {
    if (/energy mix/i.test(source)) {
      return singleChoice(prompt, choices.filter(choice =>
        choiceOwner(choice) === 'actor' && choiceZone(choice) === 'deck'),
      choice => matches(choice, PRINT.dce) ? 220 : 0, 'NO_USEFUL_CARD_CHOICE');
    }
    return { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ENERGY_PAYMENT' };
  }

  if (prompt.promptType === 'ChoosePrizePrompt') {
    return singleChoice(prompt, choices, choice => {
      const printing = valueText(choice);
      if (matches(printing, PRINT.mewVMAX)) return 230;
      if (matches(printing, PRINT.genesect) || matches(printing, PRINT.mewV)) return 180;
      return 20;
    }, 'HIDDEN_PRIZE_IDENTITY');
  }

  if (prompt.promptType === 'ConfirmPrompt' ||
      prompt.promptType === 'SelectPrompt' ||
      prompt.promptType === 'SelectOptionPrompt') {
    const yes = choices.find(choice => /^(yes|true|confirm)$/i.test(choice.label ?? ''));
    const no = choices.find(choice => /^(no|false|decline|cancel)$/i.test(choice.label ?? ''));
    const protectedInHand = list(observation.ownHand).some(card =>
      matches(card, PRINT.dce) || matches(card, PRINT.mewVMAX) ||
      matches(card, PRINT.wally) || matches(card, PRINT.secretBox));
    const accept =
      (/dedechange/i.test(source) && handCount(observation) <= 3 && !protectedInHand) ||
      (/dark asset/i.test(source) && handCount(observation) < 6 && ownDeckCount(observation) > 0);
    if (accept && yes) return { kind: 'select-choice', token: yes.token };
    if (no) return { kind: 'select-choice', token: no.token };
    return { kind: 'abstain', reasonCode: 'UNRECOGNIZED_SIMPLE_PROMPT' };
  }

  return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
}

function scoreAttack(item, observation) {
  const attack = item.attackName ?? '';
  const own = observation.ownPublic;
  const active = own.active;
  const metadata = item.publicMetadata ?? {};
  if (metadata.attackCostPayable === false) return 0;

  if (/^Cross Fusion Strike$/i.test(attack) &&
      matches(active?.printing ?? '', PRINT.mewVMAX)) {
    const genesectBench = list(own.bench).some(pokemon =>
      pokemon && matches(pokemon.printing, PRINT.genesect));
    if (metadata.attackCostPayable === true || hasDce(active)) {
      return genesectBench ? 260 : 170;
    }
    return 0;
  }

  if (/^Techno Blast$/i.test(attack) &&
      matches(item.actorPrinting ?? active?.printing ?? '', PRINT.genesect)) {
    return metadata.attackCostPayable === true ? 130 : 0;
  }

  // The source 60 has four DCE and no Basic Energy. Do not infer that the
  // Psychic- or Metal-cost attacks are payable from Colorless-only Energy.
  if (/^(?:Energy Mix|Psychic Leap|Max Miracle|Full Moon Rondo)$/i.test(attack)) {
    return metadata.attackCostPayable === true ? 40 : 0;
  }
  return 0;
}

function scoreBasicPlay(printing, observation) {
  const own = observation.ownPublic;
  if (matches(printing, PRINT.mewV)) {
    return boardCount(own, PRINT.mewV) < 2 ? 205 : 55;
  }
  if (matches(printing, PRINT.genesect)) {
    return boardCount(own, PRINT.genesect) < 2 ? 220 :
      boardCount(own, PRINT.genesect) < 3 ? 135 : 35;
  }
  if (matches(printing, PRINT.dedenne)) {
    const protectedCard = list(observation.ownHand).some(value =>
      matches(value, PRINT.dce) || matches(value, PRINT.mewVMAX) ||
      matches(value, PRINT.wally) || matches(value, PRINT.secretBox));
    return handCount(observation) <= 2 && !protectedCard ? 135 : 0;
  }
  if (matches(printing, PRINT.crobat)) {
    return handCount(observation) <= 4 &&
      !list(own.stadium).some(value => matches(value, PRINT.pathToPeak)) ? 130 : 0;
  }
  if (matches(printing, PRINT.clefairy)) {
    return candidateHasDragon(observation) ? 95 : 5;
  }
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
    if (ability === 'Fusion Strike System' &&
        matches(card, PRINT.genesect)) {
      return hand.length < fusionStrikeCount(own) && ownDeckCount(observation) > 0 ? 250 : 0;
    }
    if (ability === 'Dedechange' && matches(card, PRINT.dedenne)) {
      const protectedCard = hand.some(value =>
        matches(value, PRINT.dce) || matches(value, PRINT.mewVMAX) ||
        matches(value, PRINT.wally) || matches(value, PRINT.secretBox));
      return hand.length <= 3 && !protectedCard ? 190 : 0;
    }
    if (ability === 'Dark Asset' && matches(card, PRINT.crobat)) {
      return hand.length < 6 && ownDeckCount(observation) > 0 ? 175 : 0;
    }
    if (ability === 'Star Alchemy') {
      const vstarUsed = request.observation.ownTurnResources?.vstarUsed === true ||
        own.publicTurnRestrictions?.vstarUsed === true;
      if (vstarUsed || ownDeckCount(observation) <= 0) return 0;
      const usefulDrawAbilityAvailable = list(request.actionFrontier?.items).some(row => {
        if (row.kind !== 'use-ability') return false;
        const name = row.publicMetadata?.abilityName ?? '';
        if (/Fusion Strike System/i.test(name)) return hand.length < fusionStrikeCount(own);
        if (/Dark Asset/i.test(name)) return hand.length < 6;
        if (/Dedechange/i.test(name)) {
          const protectedCard = hand.some(value => matches(value, PRINT.dce) ||
            matches(value, PRINT.mewVMAX) || matches(value, PRINT.wally) ||
            matches(value, PRINT.secretBox));
          return hand.length <= 3 && !protectedCard;
        }
        return false;
      });
      if (usefulDrawAbilityAvailable) return 100;
      return boardCount(own, PRINT.mewV) > 0 && boardCount(own, PRINT.mewVMAX) === 0 ? 245 : 225;
    }
    return 0;
  }

  if (item.kind === 'use-stadium') {
    const stadium = card || metadata.stadiumPrinting || '';
    if (matches(stadium, PRINT.pathToPeak)) {
      const drawAbilitiesStillAvailable = list(request.actionFrontier?.items).some(row =>
        row.kind === 'use-ability' &&
        /Fusion Strike System|Dark Asset|Dedechange/i.test(row.publicMetadata?.abilityName ?? ''));
      const futureDrawBodyInHand = hand.some(value =>
        matches(value, PRINT.dedenne) || matches(value, PRINT.crobat));
      return candidateHasShadowRider(observation) &&
        !drawAbilitiesStillAvailable && !futureDrawBodyInHand && hand.length >= 4 ? 220 : 0;
    }
    if (matches(stadium, PRINT.skyField)) {
      return benchCount(own) >= 5 && benchCount(opponent) <= 4 &&
        fusionStrikeCount(own) >= 5 ? 105 : 0;
    }
    return 0;
  }

  if (item.kind === 'retreat') {
    const row = ownPokemonByPrinting(observation, target, item);
    if (row && matches(row.pokemon.printing, PRINT.mewVMAX) && hasDce(row.pokemon)) return 220;
    if (row && matches(row.pokemon.printing, PRINT.mewV) && hasDce(row.pokemon)) return 150;
    if (row && matches(row.pokemon.printing, PRINT.genesect)) return 55;
    return 0;
  }

  if (item.kind !== 'play-card') return 0;

  if (matches(card, PRINT.mewVMAX)) {
    const evolvable = slots(own).some(row =>
      matches(row.pokemon.printing, PRINT.mewV) &&
      row.pokemon.lastPlayedOrEvolvedTurn < observation.globalTurn &&
      row.pokemon.publicRestrictions?.cannotEvolveNextTurn !== true);
    return evolvable && boardCount(own, PRINT.mewVMAX) === 0 ? 235 : 0;
  }

  if (metadata.cardType === 'pokemon' ||
      [PRINT.mewV, PRINT.genesect, PRINT.dedenne, PRINT.crobat, PRINT.clefairy]
        .some(pattern => matches(card, pattern))) {
    return scoreBasicPlay(card, observation);
  }

  if (matches(card, PRINT.dce)) {
    const row = ownPokemonByPrinting(observation, target, item);
    if (!row) return 0;
    if (matches(row.pokemon.printing, PRINT.mewVMAX)) return hasDce(row.pokemon) ? 15 : 240;
    if (matches(row.pokemon.printing, PRINT.mewV)) {
      return boardCount(own, PRINT.mewVMAX) === 0 ? (hasDce(row.pokemon) ? 10 : 175) : 75;
    }
    if (matches(row.pokemon.printing, PRINT.genesect)) return 20;
    return 0;
  }

  if (matches(card, PRINT.wally)) {
    const freshMew = slots(own).some(row =>
      matches(row.pokemon.printing, PRINT.mewV) &&
      row.pokemon.lastPlayedOrEvolvedTurn === observation.globalTurn);
    return supporterAvailable(observation) && freshMew &&
      boardCount(own, PRINT.mewVMAX) === 0 ? 245 : 0;
  }

  if (matches(card, PRINT.guzma)) {
    const benchTargets = slots(opponent).filter(row => row.zone === 'bench');
    const best = Math.max(0, ...benchTargets.map(row =>
      opponentPokemonScore({
        printing: row.pokemon.printing,
        publicMetadata: { ownerSeat: 'opponent', targetZone: 'bench' }
      }, observation, expectedMewDamage(observation))));
    return supporterAvailable(observation) && best > 0 ? 210 : 0;
  }

  if (matches(card, PRINT.marnie)) {
    return supporterAvailable(observation) &&
      opponentHandCount(observation) >= 4 && hand.length <= 5 ? 135 : 0;
  }

  if (matches(card, PRINT.specialRedCard)) {
    return opponentPrizeCount(observation) <= 3 &&
      opponentHandCount(observation) >= 3 ? 170 : 0;
  }

  if (matches(card, PRINT.karen)) {
    const pokemonInDiscard = list(own.discard).filter(value =>
      [PRINT.mewV, PRINT.mewVMAX, PRINT.genesect, PRINT.dedenne, PRINT.crobat]
        .some(pattern => matches(value, pattern))).length;
    return supporterAvailable(observation) && pokemonInDiscard >= 2 &&
      (ownDeckCount(observation) <= 20 || boardCount(own, PRINT.mewVMAX) === 0) ? 125 : 0;
  }

  if (matches(card, PRINT.ranger)) {
    const constrained = slots(own).some(row =>
      row.pokemon.publicRestrictions?.cannotAttackNextTurn === true ||
      row.pokemon.publicRestrictions?.blockedAttackNameNextTurn !== null);
    return supporterAvailable(observation) && constrained ? 100 : 0;
  }

  if (matches(card, PRINT.vipPass)) {
    return observation.globalTurn <= 2 && benchCount(own) < 5 ? 225 : 0;
  }

  if (matches(card, PRINT.quickBall)) {
    return boardCount(own, PRINT.mewV) < 2 || boardCount(own, PRINT.genesect) < 2 ? 190 : 65;
  }

  if (matches(card, PRINT.ultraBall)) {
    return boardCount(own, PRINT.mewVMAX) === 0 && boardCount(own, PRINT.mewV) > 0 ? 220 : 165;
  }

  if (matches(card, PRINT.trainersMail)) return 115;

  if (matches(card, PRINT.vsSeeker)) {
    const usefulSupporter = list(own.discard).some(value =>
      [PRINT.wally, PRINT.guzma, PRINT.marnie, PRINT.karen].some(pattern => matches(value, pattern)));
    return usefulSupporter && supporterAvailable(observation) ? 155 : 40;
  }

  if (matches(card, PRINT.specialCharge)) {
    const dceDiscard = list(own.discard).filter(value => matches(value, PRINT.dce)).length;
    return dceDiscard >= 2 ? 160 : 0;
  }

  if (matches(card, PRINT.fieldBlower)) {
    return candidateToolOrStadiumTargets(observation).length > 0 ? 115 : 0;
  }

  if (matches(card, PRINT.lostVacuum)) {
    return candidateToolOrStadiumTargets(observation).some(value =>
      matches(value, PRINT.forestSealStone) || matches(value, PRINT.floatStone)) ? 115 : 0;
  }

  if (matches(card, PRINT.secretBox)) {
    const expendable = hand.filter(value => scoreDiscardCard({ printing: value }, observation) > 0).length;
    return expendable >= 3 ? 120 : 0;
  }

  if (matches(card, PRINT.heavyBall)) {
    return own.prizeCount > 0 &&
      boardCount(own, PRINT.mewVMAX) === 0 && boardCount(own, PRINT.genesect) === 0 ? 85 : 0;
  }

  if (matches(card, PRINT.escapeRope)) {
    return slots(opponent).some(row => row.zone === 'bench') ? 75 : 0;
  }

  if (matches(card, PRINT.enhancedHammer)) {
    const specialEnergy = slots(opponent).some(row =>
      list(row.pokemon.energies).some(energy =>
        /Special Energy|Double Dragon Energy|Jet Energy|Capture Energy/i.test(valueText(energy))));
    return specialEnergy ? 120 : 0;
  }

  if (matches(card, PRINT.forestSealStone)) {
    const row = ownPokemonByPrinting(observation, target, item);
    if (!row || observation.ownTurnResources?.vstarUsed === true) return 0;
    return /(?:Mew V|Genesect V|Crobat V)/i.test(row.pokemon.printing) &&
      !list(row.pokemon.tools).some(tool => matches(tool, PRINT.forestSealStone)) ? 135 : 0;
  }

  if (matches(card, PRINT.muscleBand)) {
    const row = ownPokemonByPrinting(observation, target, item);
    if (!row || !matches(row.pokemon.printing, PRINT.mewVMAX)) return 0;
    const active = opponent.active;
    return remainingHp(active) > 210 && remainingHp(active) <= 230 &&
      list(row.pokemon.tools).length === 0 ? 150 : 50;
  }

  if (matches(card, PRINT.floatStone)) {
    const row = ownPokemonByPrinting(observation, target, item);
    if (!row || list(row.pokemon.tools).length > 0) return 0;
    return row.zone === 'active' &&
      (matches(row.pokemon.printing, PRINT.mewVMAX) ||
       matches(row.pokemon.printing, PRINT.genesect)) ? 85 : 35;
  }

  return 0;
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
  return pass ? { kind: 'select-action', token: pass.token } :
    { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ACTION' };
}

// The current actor protocol requires select-choices for multi-select
// classes (cards, Pokémon, Energy payment), even at cardinality one.
function currentPromptDecision(prompt,decision) {
  if(!prompt||decision?.kind!=='select-choice')return decision;
  const chosen=prompt.choices.find(choice=>choice.token===decision.token);
  if(!chosen||chosen.kind==='cancel'||chosen.kind==='empty-selection')return decision;
  const type=prompt.publicMetadata?.selectionType;
  if(['card-combination','pokemon','energy-payment','prize-slots','card-order'].includes(type))
    return {kind:'select-choices',tokens:[decision.token]};
  return decision;
}

function createPolicy({ role, seat, policyVersion, config }) {
  if (role !== 'opponent' || (seat !== 0 && seat !== 1) ||
      policyVersion !== POLICY_VERSION || !config ||
      typeof config !== 'object' || Array.isArray(config) ||
      Object.keys(config).length !== 0) {
    throw new Error('AGENT20_RANK5_POLICY_INIT_MISMATCH');
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
  SOURCE_INVENTORY,
  createPolicy,
  scoreAction,
  scoreAttack,
  promptDecision,
  scoreSearchPokemon,
  scoreSearchChoice,
  scoreDiscardCard
};
