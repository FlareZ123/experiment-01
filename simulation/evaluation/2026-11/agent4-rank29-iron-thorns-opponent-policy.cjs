'use strict';

/*
 * Rank-29 Kohei Hamamichi Iron Thorns opponent-policy prototype.
 *
 * This is a deterministic, actor-view-only policy for the original rank-29
 * 60-card source list. The common rank-6 engine was copied as a frozen base;
 * rank-29 differences add Field Blower, Target Whistle and Palace Belt.
 * Peonia Prize exchanges remain explicitly unsupported. It is not installed in Agent49's ./policy.cjs loader,
 * is not a Twinleaf bot, and has no native-game or competitive evidence.
 */

const POLICY_VERSION = 'agent4-rank29-iron-thorns-opponent-v1';
const SOURCE_RANK = 29;
const SOURCE_LIST_BLOB_SHA1 = 'ae773f6201d7aa69d31914dbfee66f3fba692200';
const SOURCE_FINGERPRINT_SHA256 = null; // Source rank+full-decklists Git blob are the identity; 29-specific fingerprint uncomputed.
const CANDIDATE_FINGERPRINT_SHA256 = '1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4';
const ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const WORKER_PROTOCOL_BLOB_SHA1 = 'd51ea95c457d61b50a9ee114d342eb17f4350451';

const PRINT = Object.freeze({
  ironThorns: /^Iron Thorns ex\b/i,
  speedLightning: /^Speed Lightning Energy\b/i,
  captureEnergy: /^Capture Energy\b/i,
  spikyEnergy: /^Spiky Energy\b/i,
  doubleColorless: /^Double Colorless Energy\b/i,
  thunderMountain: /^Thunder Mountain/i,
  wondrousLabyrinth: /^Wondrous Labyrinth/i,
  tropicalBeach: /^Tropical Beach\b/i,
  playersCeremony: /^Player'?s Ceremony\b/i,
  palaceBook: /^Palace Book\b/i,
  palaceBelt: /^Palace Belt\b/i,
  targetWhistle: /^Target Whistle(?: Team Flare Gear)?\b/i,
  fieldBlower: /^Field Blower\b/i,
  peonia: /^Peonia\b/i,
  toolJammer: /^Tool Jammer\b/i,
  plumeria: /^Plumeria\b/i,
  teamFlare: /^Team Flare Grunt\b/i,
  crushingHammer: /^Crushing Hammer\b/i,
  enhancedHammer: /^Enhanced Hammer\b/i,
  megatonBlower: /^Megaton Blower\b/i,
  faba: /^Faba\b/i,
  guzma: /^Guzma(?!\s*&\s*Hala)\b/i,
  guzmaHala: /^Guzma & Hala\b/i,
  tagCall: /^Tag Call\b/i,
  lusamine: /^Lusamine\b/i,
  handiwork: /^Team Rocket'?s Handiwork\b/i,
  cynthiaCaitlin: /^Cynthia & Caitlin\b/i,
  lillie: /^Lillie'?s Determination\b/i,
  eri: /^Eri\b/i,
  sidney: /^Sidney\b/i,
  teamSkull: /^Team Skull Grunt\b/i,
  gladion: /^Gladion\b/i,
  trainersMail: /^Trainers'? Mail\b/i,
  campingGear: /^Camping Gear\b/i,
  captivatingPuff: /^Captivating Pok[eé] Puff\b/i,
  echoingHorn: /^Echoing Horn\b/i,
  handheldFan: /^Handheld Fan\b/i,
  budew: /^Budew\b/i
});

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
  if (typeof value?.name === 'string') return value.name;
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

function energyCount(pokemon) {
  return list(pokemon?.energies).length;
}

function playerEnergyCount(player) {
  return slots(player).reduce((sum, row) => sum + energyCount(row.pokemon), 0);
}

function isBasicEnergy(value) {
  return /^(?:Basic )?(?:Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal) Energy\b/i.test(valueText(value));
}

function isSpecialEnergy(value) {
  return /Energy/i.test(valueText(value)) && !isBasicEnergy(value);
}

function opponentSpecialEnergyCount(observation) {
  return slots(observation?.opponentPublic).reduce((sum, row) =>
    sum + list(row.pokemon.energies).filter(isSpecialEnergy).length, 0);
}

function opponentEnergyRows(observation) {
  return slots(observation?.opponentPublic).flatMap(row =>
    list(row.pokemon.energies).map((energy, index) => ({
      ...row, energy, energyIndex: index
    }))
  );
}

function opponentHasAnyEnergy(observation) {
  return opponentEnergyRows(observation).length > 0;
}

function opponentActiveEnergy(observation) {
  return energyCount(observation?.opponentPublic?.active);
}

function opponentHasTool(observation) {
  return slots(observation?.opponentPublic).some(row => list(row.pokemon.tools).length > 0);
}

function opponentHasVisibleItem(observation) {
  return list(observation?.opponentPublic?.publicHand).some(card =>
    /Item\b|VS Seeker|Battle Compressor|Mysterious Treasure|Fog Crystal|Quick Ball|Nest Ball|Ultra Ball|Field Blower|Unfair Stamp|Night Stretcher/i.test(valueText(card))
  );
}

function opponentHasVisibleEnergy(observation) {
  return list(observation?.opponentPublic?.publicHand).some(card => /Energy/i.test(valueText(card)));
}

function opponentHasVisibleToolOrSpecial(observation) {
  return list(observation?.opponentPublic?.publicHand).some(card =>
    /Special Energy|Pok[eé]mon Tool|Tool\b|Double Colorless|Speed Lightning|Capture Energy|Spiky Energy/i.test(valueText(card))
  );
}

function ownHand(observation) {
  return list(observation?.ownHand);
}

function handCount(observation, pattern) {
  return ownHand(observation).filter(card => matches(card, pattern)).length;
}

function discardCount(observation, pattern) {
  return list(observation?.ownPublic?.discard).filter(card => matches(card, pattern)).length;
}

function hasStadium(observation, pattern) {
  return [
    ...list(observation?.ownPublic?.stadium),
    ...list(observation?.opponentPublic?.stadium)
  ].some(card => matches(card, pattern));
}

function stadiumsInPlay(observation) {
  return [
    ...list(observation?.ownPublic?.stadium),
    ...list(observation?.opponentPublic?.stadium)
  ];
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

function toolLocked(observation) {
  return observation?.ownTurnResources?.toolPlayLocked === true ||
    observation?.ownPublic?.publicTurnRestrictions?.toolPlayLocked === true;
}

function stadiumLocked(observation) {
  return observation?.ownTurnResources?.stadiumPlayLocked === true ||
    observation?.ownPublic?.publicTurnRestrictions?.stadiumPlayLocked === true ||
    observation?.ownTurnResources?.stadiumPlayedTurn === true;
}

function energyAvailable(observation) {
  return observation?.ownTurnResources?.energyPlayedTurn === false &&
    observation?.ownTurnResources?.energyPlayLocked !== true &&
    observation?.ownPublic?.publicTurnRestrictions?.energyPlayLocked !== true;
}

function specialEnergyLocked(observation) {
  return observation?.ownTurnResources?.specialEnergyPlayLocked === true ||
    observation?.ownPublic?.publicTurnRestrictions?.specialEnergyPlayLocked === true;
}

function ownActive(observation) {
  return observation?.ownPublic?.active ?? null;
}

function opponentActive(observation) {
  return observation?.opponentPublic?.active ?? null;
}

function ownActiveIsThorns(observation) {
  return matches(ownActive(observation)?.printing, PRINT.ironThorns);
}

function remainingHp(pokemon) {
  if (!pokemon || !Number.isFinite(pokemon.hp) || !Number.isFinite(pokemon.damage)) return -1;
  return pokemon.hp - pokemon.damage;
}

function opponentDeckCount(observation) {
  return Number.isSafeInteger(observation?.opponentPublic?.deckCount) ?
    observation.opponentPublic.deckCount : null;
}

function ownDeckCount(observation) {
  return Number.isSafeInteger(observation?.ownPublic?.deckCount) ?
    observation.ownPublic.deckCount : null;
}

function hasBasicBenchSpace(player) {
  return list(player?.bench).some(slot => slot === null);
}

function boardHasTool(player, pattern) {
  return slots(player).some(row => list(row.pokemon.tools).some(tool => matches(tool, pattern)));
}

function boardHasPrinting(player, pattern) {
  return slots(player).some(row => matches(row.pokemon.printing, pattern));
}

function handCopies(hand, pattern) {
  return list(hand).filter(card => matches(card, pattern)).length;
}

function discardPriority(card, observation) {
  const hand = ownHand(observation);
  const critical = [
    PRINT.lusamine, PRINT.handiwork, PRINT.guzmaHala, PRINT.gladion,
    PRINT.doubleColorless, PRINT.speedLightning, PRINT.captureEnergy
  ];
  if (critical.some(pattern => matches(card, pattern))) return -100;
  if (matches(card, PRINT.tagCall) && handCopies(hand, PRINT.guzmaHala) === 0) return -90;
  if (matches(card, PRINT.lillie) && hand.length <= 3) return -80;
  if (matches(card, PRINT.plumeria) && handCopies(hand, PRINT.plumeria) <= 1) return -40;
  if (matches(card, PRINT.teamFlare) && handCopies(hand, PRINT.teamFlare) <= 1) return -35;
  if (matches(card, PRINT.guzma) && handCopies(hand, PRINT.guzma) <= 1) return -30;
  if (matches(card, PRINT.faba) && handCopies(hand, PRINT.faba) <= 1) return -25;
  if (matches(card, PRINT.trainersMail)) return 120;
  if (matches(card, PRINT.campingGear)) return 115;
  if (matches(card, PRINT.captivatingPuff)) return 110;
  if (matches(card, PRINT.echoingHorn)) return 105;
  if (matches(card, PRINT.playersCeremony)) return 100;
  if (matches(card, PRINT.palaceBook) || matches(card, PRINT.palaceBelt)) return 95;
  if (matches(card, PRINT.handheldFan)) return 90;
  if (matches(card, PRINT.crushingHammer) && handCopies(hand, PRINT.crushingHammer) > 1) return 85;
  if (matches(card, PRINT.enhancedHammer) && handCopies(hand, PRINT.enhancedHammer) > 1) return 82;
  if (matches(card, PRINT.toolJammer) && boardHasTool(observation.ownPublic, PRINT.toolJammer)) return 80;
  if (matches(card, PRINT.eri) || matches(card, PRINT.sidney) || matches(card, PRINT.teamSkull)) return 75;
  if (matches(card, PRINT.cynthiaCaitlin) && hand.length > 4) return 70;
  if (matches(card, PRINT.faba) || matches(card, PRINT.plumeria) ||
      matches(card, PRINT.teamFlare) || matches(card, PRINT.guzma)) return 45;
  if (/Energy/i.test(valueText(card))) return 10;
  return 30;
}

function canPayPlumeria(observation) {
  const hand = ownHand(observation).filter(card => !matches(card, PRINT.plumeria));
  const eligible = hand.filter(card => discardPriority(card, observation) >= 0);
  return eligible.length >= 2;
}

function choiceOwner(choice) {
  return choice?.publicMetadata?.ownerSeat ?? null;
}

function choiceZone(choice) {
  const meta = choice?.publicMetadata ?? {};
  return meta.targetZone ?? meta.sourceZone ?? meta.zone ?? null;
}

function choicePrinting(choice) {
  return valueText(choice);
}

function cardChoiceScore(choice, observation, context) {
  const printing = choicePrinting(choice);
  if (context === 'plumeria-cost') {
    const priority = discardPriority(printing, observation);
    return priority < 0 ? -100 : priority;
  }
  if (context === 'field-blower') {
    if (choiceOwner(choice) !== 'opponent' && choiceZone(choice) !== 'stadium' &&
        choice.kind !== 'stadium') return 0;
    if (/Stealthy Hood/i.test(printing)) return 300;
    if (/Tool Jammer|Forest Seal Stone/i.test(printing)) return 250;
    if (/Float Stone|Palace Belt|Handheld Fan/i.test(printing)) return 220;
    if (/Tool\\b/i.test(printing)) return 175;
    if (choiceZone(choice) === 'stadium' || choice.kind === 'stadium') return 100;
    return 0;
  }
  if (context === 'target-whistle') {
    if (choiceOwner(choice) !== 'opponent' ||
        (choiceZone(choice) !== 'discard' && choice?.publicMetadata?.sourceZone !== 'discard')) return 0;
    if (/Radiant Eternatus|Tapu Lele-GX|Latias ex/i.test(printing)) return 180;
    if (/Shadow Rider Calyrex V(?!MAX)|Regidrago V(?!STAR)/i.test(printing)) return 160;
    return choice.kind === 'pokemon' || /\\b(?:V|ex|GX)\\b/i.test(printing) ? 120 : 30;
  }
  if (context === 'faba') {
    if (/Stealthy Hood/i.test(printing)) return 280;
    if (/Float Stone/i.test(printing)) return 260;
    if (/Forest Seal Stone/i.test(printing)) return 245;
    if (matches(printing, PRINT.toolJammer)) return 220;
    if (/Pok[eé]mon Tool|Tool\b/i.test(printing)) return 180;
    if (isSpecialEnergy(printing)) return 160;
    if (/Stadium/i.test(printing) || /Mountain|Labyrinth|Beach|Ceremony/i.test(printing)) return 150;
    return 0;
  }
  if (context === 'enhanced-hammer') return isSpecialEnergy(printing) ? 200 : 0;
  if (context === 'plumeria-energy' || context === 'crushing-hammer' || context === 'team-flare-energy') {
    if (!/Energy/i.test(printing)) return 0;
    if (context === 'team-flare-energy' && choiceZone(choice) !== 'active') return 0;
    if (isSpecialEnergy(printing)) return 120;
    return 100;
  }
  if (context === 'lusamine') {
    if (matches(printing, PRINT.handiwork)) return 280;
    if (matches(printing, PRINT.lusamine)) return 250;
    if (matches(printing, PRINT.plumeria)) return 225;
    if (matches(printing, PRINT.teamFlare)) return 215;
    if (matches(printing, PRINT.guzma)) return 205;
    if (matches(printing, PRINT.faba)) return 195;
    if (matches(printing, PRINT.cynthiaCaitlin)) return 180;
    if (matches(printing, PRINT.eri) || matches(printing, PRINT.sidney) || matches(printing, PRINT.teamSkull)) return 170;
    if (matches(printing, PRINT.tropicalBeach)) return 155;
    if (matches(printing, PRINT.thunderMountain) || matches(printing, PRINT.wondrousLabyrinth)) return 150;
    return 0;
  }
  if (context === 'guzma-hala-payment') return cardChoiceScore(choice, observation, 'plumeria-cost');
  if (context === 'guzma-hala-search') {
    if (matches(printing, PRINT.thunderMountain)) return 230;
    if (matches(printing, PRINT.wondrousLabyrinth)) return 180;
    if (matches(printing, PRINT.tropicalBeach)) return 160;
    if (matches(printing, PRINT.toolJammer)) return 220;
    if (matches(printing, PRINT.doubleColorless)) return 240;
    if (matches(printing, PRINT.speedLightning)) return 200;
    if (matches(printing, PRINT.spikyEnergy)) return 170;
    if (matches(printing, PRINT.captureEnergy)) return 150;
    return 0;
  }
  if (context === 'tag-call') {
    if (matches(printing, PRINT.guzmaHala)) return 250;
    if (matches(printing, PRINT.cynthiaCaitlin)) return 190;
    return 0;
  }
  if (context === 'eri') {
    if (/VS Seeker|Battle Compressor|Mysterious Treasure|Fog Crystal|Quick Ball|Nest Ball|Ultra Ball|Field Blower|Unfair Stamp|Night Stretcher/i.test(printing)) return 200;
    if (/Item\b/i.test(printing)) return 120;
    return 0;
  }
  if (context === 'sidney') {
    if (isSpecialEnergy(printing)) return 220;
    if (/Pok[eé]mon Tool|Tool\b|Float Stone|Stealthy Hood|Forest Seal Stone/i.test(printing)) return 200;
    return 0;
  }
  if (context === 'team-skull') return /Energy/i.test(printing) ? 200 : 0;
  if (context === 'trainers-mail' || context === 'camping-gear') {
    if (matches(printing, PRINT.plumeria) || matches(printing, PRINT.teamFlare) ||
        matches(printing, PRINT.guzma) || matches(printing, PRINT.lusamine) ||
        matches(printing, PRINT.handiwork) || matches(printing, PRINT.guzmaHala)) return 240;
    if (matches(printing, PRINT.faba) || matches(printing, PRINT.eri) ||
        matches(printing, PRINT.sidney) || matches(printing, PRINT.teamSkull)) return 220;
    if (matches(printing, PRINT.crushingHammer) || matches(printing, PRINT.enhancedHammer) ||
        matches(printing, PRINT.megatonBlower) || matches(printing, PRINT.tagCall)) return 180;
    if (/Stadium|Tool|Energy/i.test(printing)) return 100;
    return 0;
  }
  if (context === 'captivating-puff' || context === 'echoing-horn') {
    if (choice?.kind === 'pokemon' || /Pok[eé]mon/i.test(printing)) return 100;
    return 0;
  }
  if (context === 'megaton-blower') {
    if (/Pok[eé]mon Tool|Tool\b/i.test(printing) || isSpecialEnergy(printing)) return 200;
    return 0;
  }
  return 0;
}

function rankedChoices(choices, scorer, maximum) {
  return list(choices)
    .filter(choice => choice.kind !== 'cancel' && choice.kind !== 'empty-selection')
    .map((choice, index) => ({ choice, index, score: scorer(choice) }))
    .filter(row => row.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, maximum);
}

function multiSelectDecision(prompt, rows, minimum, maximum) {
  const selected = rows.slice().sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, maximum).map(row => row.choice);
  if (selected.length < minimum) {
    const empty = list(prompt?.choices).find(choice => choice.kind === 'empty-selection');
    if (minimum === 0 && empty) return { kind: 'select-choice', token: empty.token };
    return { kind: 'abstain', reasonCode: 'NO_LEGAL_CARD_SET' };
  }
  if (selected.length === 0) {
    const empty = list(prompt?.choices).find(choice => choice.kind === 'empty-selection');
    return empty ? { kind: 'select-choice', token: empty.token } :
      { kind: 'abstain', reasonCode: 'NO_LEGAL_CARD_SET' };
  }
  return { kind: 'select-choices', tokens: selected.map(choice => choice.token) };
}

function singleChoice(choices, scorer, reasonCode) {
  const ranked = list(choices).map((choice, index) => ({
    choice, index, score: scorer(choice)
  })).filter(row => row.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);
  if (!ranked.length) return { kind: 'abstain', reasonCode };
  return { kind: 'select-choice', token: ranked[0].choice.token };
}

function opponentPokemonScore(choice, observation, context) {
  if (choiceOwner(choice) !== 'opponent') return 0;
  const zone = choiceZone(choice);
  const printing = choicePrinting(choice);
  const slotIndex = choice?.publicMetadata?.selectionIndex ?? choice?.publicMetadata?.benchIndex;
  const row = slots(observation.opponentPublic).find(item =>
    item.zone === zone && (Number.isSafeInteger(slotIndex) ? item.index === slotIndex :
      item.pokemon.printing === printing));
  const pokemon = row?.pokemon;
  if (context === 'guzma' && zone !== 'bench') return 0;
  if (context === 'plumeria' && energyCount(pokemon) === 0) return 0;
  if (context === 'team-flare' && zone !== 'active') return 0;
  if (!pokemon) return 20;
  const retreat = list(pokemon.printed?.retreatCost).length;
  const energies = energyCount(pokemon);
  const hp = remainingHp(pokemon);
  if (context === 'guzma') return 100 + retreat * 30 - energies * 35 +
    (pokemon.printed?.stage === 'BASIC' ? 8 : 0) + (hp > 0 && hp <= 100 ? 12 : 0);
  return 80 + energies * 35 + (zone === 'active' ? 15 : 0);
}

function ownSwitchScore(choice, observation) {
  if (choiceOwner(choice) !== 'actor' || choiceZone(choice) !== 'bench') return 0;
  const slotIndex = choice?.publicMetadata?.selectionIndex ?? choice?.publicMetadata?.benchIndex;
  const row = slots(observation.ownPublic).find(item =>
    item.zone === 'bench' && (Number.isSafeInteger(slotIndex) ? item.index === slotIndex :
      item.pokemon.printing === choicePrinting(choice)));
  if (!row || !matches(row.pokemon.printing, PRINT.ironThorns)) return 0;
  return 100 + energyCount(row.pokemon) * 30 - (row.pokemon.damage ?? 0);
}

function bestGuzmaHalaSearch(choices, observation, maximum) {
  const categories = ['stadium', 'tool', 'energy'];
  const selected = [];
  for (const category of categories) {
    const candidates = list(choices).filter(choice => {
      const printing = choicePrinting(choice);
      if (choiceOwner(choice) !== 'actor' || choiceZone(choice) !== 'deck') return false;
      if (category === 'stadium') return matches(printing, PRINT.thunderMountain) ||
        matches(printing, PRINT.wondrousLabyrinth) || matches(printing, PRINT.tropicalBeach);
      if (category === 'tool') return matches(printing, PRINT.toolJammer);
      return matches(printing, PRINT.doubleColorless) || matches(printing, PRINT.speedLightning) ||
        matches(printing, PRINT.spikyEnergy) || matches(printing, PRINT.captureEnergy);
    });
    const row = rankedChoices(candidates,
      choice => cardChoiceScore(choice, observation, 'guzma-hala-search'), 1)[0];
    if (row) selected.push(row);
  }
  return selected.slice(0, maximum);
}


function engineSetupDecision(request) {
  const prompt = request.prompt;
  const observation = request.observation;
  const meta = prompt?.publicMetadata ?? {};
  const choices = list(prompt?.choices);
  if (observation?.phase !== 1)
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_ENGINE_SETUP_PHASE' };
  if (prompt?.source?.classification !== 'actor-choice' ||
      prompt.source.sourceKind !== 'engine' ||
      prompt.source.sourcePrinting !== null ||
      prompt.source.effectName !== prompt.description)
    return { kind: 'abstain', reasonCode: 'UNTRUSTED_ENGINE_SETUP_PROMPT' };

  if (prompt.promptType === 'ConfirmPrompt' && prompt.description === 'GO_FIRST') {
    if (meta.selectionType !== 'confirm' || choices.length !== 2)
      return { kind: 'abstain', reasonCode: 'BAD_GO_FIRST_SETUP_PROMPT' };
    const yes = choices.filter(c => c.kind === 'confirm' && c.label === 'Yes');
    const no = choices.filter(c => c.kind === 'confirm' && c.label === 'No');
    if (yes.length !== 1 || no.length !== 1)
      return { kind: 'abstain', reasonCode: 'BAD_GO_FIRST_CONFIRM_CHOICES' };
    // Source policy: choose second to make Guzma & Hala live on the first own
    // turn; unlike the candidate baseline, this is a source-specific heuristic.
    return { kind: 'select-choice', token: no[0].token };
  }

  if (prompt.promptType === 'ChooseCardsPrompt' &&
      prompt.description === 'CHOOSE_STARTING_POKEMONS') {
    if (meta.selectionType !== 'card-combination' ||
        meta.sourceZone !== 'hand' || meta.ownerSeat !== 'actor' ||
        meta.isOwnerVisible !== true || meta.isSecret !== false ||
        meta.allowCancel !== false ||
        !Number.isSafeInteger(meta.minimumCount) ||
        !Number.isSafeInteger(meta.maximumCount) ||
        ![0, 1].includes(meta.minimumCount) ||
        meta.maximumCount < meta.minimumCount || meta.maximumCount > 6)
      return { kind: 'abstain', reasonCode: 'BAD_STARTING_POKEMON_SETUP_PROMPT' };
    const cards = choices.filter(c => c.kind === 'card');
    const empty = choices.filter(c => c.kind === 'empty-selection');
    if (cards.length + empty.length !== choices.length ||
        empty.length !== (meta.minimumCount === 0 ? 1 : 0))
      return { kind: 'abstain', reasonCode: 'BAD_STARTING_POKEMON_EMPTY_CHOICE' };
    let previous = -1;
    for (const c of cards) {
      const data = c.publicMetadata ?? {};
      if (typeof c.printing !== 'string' ||
          !matches(c.printing, PRINT.ironThorns) ||
          data.ownerSeat !== 'actor' || data.sourceZone !== 'hand' ||
          data.isOwnerVisible !== true || data.selectedCount !== 1 ||
          !Number.isSafeInteger(data.selectionIndex) ||
          data.selectionIndex <= previous)
        return { kind: 'abstain', reasonCode: 'UNTRUSTED_STARTING_POKEMON_CHOICE' };
      previous = data.selectionIndex;
    }
    // Only Iron Thorns ex is Basic in the exact rank-29 60. Accept the legal
    // native selection order and retain Bench copies for Volt Cyclone handoff.
    const selected = cards.slice(0, meta.maximumCount);
    if (selected.length < meta.minimumCount)
      return { kind: 'abstain', reasonCode: 'INSUFFICIENT_STARTING_POKEMON_CHOICES' };
    if (!selected.length) {
      return empty.length
        ? { kind: 'select-choice', token: empty[0].token }
        : { kind: 'abstain', reasonCode: 'NO_STARTING_POKEMON_CHOICE' };
    }
    return { kind: 'select-choices', tokens: selected.map(c => c.token) };
  }

  if (prompt.promptType === 'SelectPrompt' && prompt.description === 'WANT_TO_DRAW_CARDS') {
    if (meta.selectionType !== 'option' || meta.allowCancel !== false ||
        !Number.isSafeInteger(meta.count) || meta.count < 1)
      return { kind: 'abstain', reasonCode: 'BAD_MULLIGAN_DRAW_SETUP_PROMPT' };
    const seen = new Set();
    let chosen = null;
    let bestCount = -1;
    for (const c of choices) {
      const index = c.publicMetadata?.choiceIndex;
      if (c.kind !== 'option' || !Number.isSafeInteger(index) ||
          index < 0 || index >= meta.count || seen.has(index))
        return { kind: 'abstain', reasonCode: 'BAD_MULLIGAN_DRAW_CHOICE_INDEX' };
      seen.add(index);
      const count = meta.count - 1 - index;
      if (c.label !== `Draw ${count} card(s)`)
        return { kind: 'abstain', reasonCode: 'MULLIGAN_DRAW_LABEL_INDEX_MISMATCH' };
      if (count > bestCount) { chosen = c; bestCount = count; }
    }
    return chosen ? { kind: 'select-choice', token: chosen.token } :
      { kind: 'abstain', reasonCode: 'NO_MULLIGAN_DRAW_OPTION' };
  }
  return { kind: 'abstain', reasonCode: 'UNSUPPORTED_ENGINE_SETUP_PROMPT' };
}

function promptDecision(request) {
  const prompt = request.prompt;
  if (prompt?.source?.sourceKind === 'engine') return engineSetupDecision(request);
  const observation = request.observation;
  const choices = list(prompt?.choices);
  const sourcePrinting = prompt?.source?.sourcePrinting ?? '';
  const source = [
    sourcePrinting, prompt?.source?.effectName ?? '', prompt?.description ?? ''
  ].join(' ').toLowerCase();
  const metadata = prompt?.publicMetadata ?? {};
  const selectionType = metadata.selectionType ?? null;

  if (matches(sourcePrinting, PRINT.peonia)) {
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PRIZE_SELECTION' };
  }
  if (/player'?s ceremony|palace book|handheld fan|gladion/i.test(source) ||
      selectionType === 'prize-slots') {
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
  }

  if (prompt.promptType === 'ChooseCardsPrompt') {
    if (selectionType) {
      const minimum = selectionType === 'energy-payment' ? 1 :
        (Number.isSafeInteger(metadata.minimumCount) ? metadata.minimumCount : 1);
      const maximum = selectionType === 'energy-payment' ?
        (Number.isSafeInteger(metadata.energyCount) ? metadata.energyCount :
          (Number.isSafeInteger(metadata.count) ? metadata.count : minimum)) :
        (Number.isSafeInteger(metadata.maximumCount) ? metadata.maximumCount :
          (Number.isSafeInteger(metadata.count) ? metadata.count : minimum));

      if (source.includes('plumeria') &&
          choices.some(choice => choiceOwner(choice) === 'actor' && choiceZone(choice) === 'hand')) {
        const handChoices = choices.filter(choice =>
          choiceOwner(choice) === 'actor' && choiceZone(choice) === 'hand');
        return multiSelectDecision(prompt, rankedChoices(handChoices,
          choice => cardChoiceScore(choice, observation, 'plumeria-cost'), maximum),
        minimum, maximum);
      }

      if (source.includes('guzma & hala')) {
        const handPayment = choices.some(choice =>
          choiceOwner(choice) === 'actor' && choiceZone(choice) === 'hand');
        if (handPayment) {
          const payment = choices.filter(choice =>
            choiceOwner(choice) === 'actor' && choiceZone(choice) === 'hand');
          return multiSelectDecision(prompt, rankedChoices(payment,
            choice => cardChoiceScore(choice, observation, 'guzma-hala-payment'), maximum),
          minimum, maximum);
        }
        const search = bestGuzmaHalaSearch(choices, observation, maximum);
        return multiSelectDecision(prompt, search, minimum, maximum);
      }

      if (source.includes('tag call')) {
        const deckChoices = choices.filter(choice =>
          choiceOwner(choice) === 'actor' && choiceZone(choice) === 'deck');
        return multiSelectDecision(prompt, rankedChoices(deckChoices,
          choice => cardChoiceScore(choice, observation, 'tag-call'), maximum),
        minimum, maximum);
      }

      if (source.includes('lusamine')) {
        const discardChoices = choices.filter(choice =>
          choiceOwner(choice) === 'actor' && choiceZone(choice) === 'discard');
        return multiSelectDecision(prompt, rankedChoices(discardChoices,
          choice => cardChoiceScore(choice, observation, 'lusamine'), maximum),
        minimum, maximum);
      }

      if (source.includes('eri') || source.includes('sidney') ||
          source.includes('team skull')) {
        const context = source.includes('eri') ? 'eri' :
          source.includes('sidney') ? 'sidney' : 'team-skull';
        const opponentHand = choices.filter(choice =>
          choiceOwner(choice) === 'opponent' && choiceZone(choice) === 'hand');
        return multiSelectDecision(prompt, rankedChoices(opponentHand,
          choice => cardChoiceScore(choice, observation, context), maximum),
        minimum, maximum);
      }

      if (matches(sourcePrinting, PRINT.fieldBlower)) {
        const targets = choices.filter(choice =>
          choiceOwner(choice) === 'opponent' || choiceZone(choice) === 'stadium' ||
          choice.kind === 'stadium');
        return multiSelectDecision(prompt, rankedChoices(targets,
          choice => cardChoiceScore(choice, observation, 'field-blower'), maximum),
        minimum, maximum);
      }

      if (matches(sourcePrinting, PRINT.targetWhistle)) {
        const targets = choices.filter(choice =>
          choiceOwner(choice) === 'opponent' &&
          (choiceZone(choice) === 'discard' || choice?.publicMetadata?.sourceZone === 'discard'));
        return multiSelectDecision(prompt, rankedChoices(targets,
          choice => cardChoiceScore(choice, observation, 'target-whistle'), maximum),
        minimum, maximum);
      }

      if (source.includes('megaton blower')) {
        const targets = choices.filter(choice => choiceOwner(choice) === 'opponent');
        return multiSelectDecision(prompt, rankedChoices(targets,
          choice => cardChoiceScore(choice, observation, 'megaton-blower'), maximum),
        minimum, maximum);
      }

      if (source.includes('captivating pok')) {
        const targets = choices.filter(choice =>
          choiceOwner(choice) === 'opponent' && choiceZone(choice) === 'hand');
        return multiSelectDecision(prompt, rankedChoices(targets,
          choice => cardChoiceScore(choice, observation, 'captivating-puff'), maximum),
        minimum, maximum);
      }

      if (source.includes('echoing horn')) {
        const targets = choices.filter(choice =>
          choiceOwner(choice) === 'opponent' &&
          (choiceZone(choice) === 'discard' || choice?.publicMetadata?.sourceZone === 'discard'));
        return multiSelectDecision(prompt, rankedChoices(targets,
          choice => cardChoiceScore(choice, observation, 'echoing-horn'), maximum),
        minimum, maximum);
      }

      return { kind: 'abstain', reasonCode: 'UNSUPPORTED_CARD_COMBINATION_SOURCE' };
    }

    if (matches(sourcePrinting, PRINT.fieldBlower)) {
      return singleChoice(choices, choice =>
        cardChoiceScore(choice, observation, 'field-blower'), 'NO_USEFUL_CARD_CHOICE');
    }
    if (matches(sourcePrinting, PRINT.targetWhistle)) {
      return singleChoice(choices, choice =>
        cardChoiceScore(choice, observation, 'target-whistle'), 'NO_USEFUL_CARD_CHOICE');
    }
    if (source.includes('faba')) {
      return singleChoice(choices.filter(choice =>
        choiceOwner(choice) === 'opponent' || choiceZone(choice) === 'stadium' ||
        choice.kind === 'stadium'),
      choice => cardChoiceScore(choice, observation, 'faba'), 'NO_USEFUL_CARD_CHOICE');
    }
    if (source.includes('enhanced hammer')) {
      return singleChoice(choices.filter(choice => choiceOwner(choice) === 'opponent'),
        choice => cardChoiceScore(choice, observation, 'enhanced-hammer'),
        'NO_VISIBLE_ENERGY_CHOICE');
    }
    if (source.includes('trainers')) {
      return singleChoice(choices, choice =>
        cardChoiceScore(choice, observation, 'trainers-mail'), 'NO_USEFUL_CARD_CHOICE');
    }
    if (source.includes('camping gear')) {
      return singleChoice(choices, choice =>
        cardChoiceScore(choice, observation, 'camping-gear'), 'NO_USEFUL_CARD_CHOICE');
    }
    if (matches(sourcePrinting, PRINT.targetWhistle)) {
      return singleChoice(choices.filter(choice =>
        choiceOwner(choice) === 'opponent' &&
          (choiceZone(choice) === 'discard' || choice?.publicMetadata?.sourceZone === 'discard')),
      choice => cardChoiceScore(choice, observation, 'target-whistle'),
      'NO_USEFUL_CARD_CHOICE');
    }
    if (source.includes('echoing horn')) {
      return singleChoice(choices.filter(choice =>
        choiceOwner(choice) === 'opponent' &&
          (choiceZone(choice) === 'discard' || choice?.publicMetadata?.sourceZone === 'discard')),
      choice => cardChoiceScore(choice, observation, 'echoing-horn'),
      'NO_USEFUL_CARD_CHOICE');
    }
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_CARD_COMBINATION_SOURCE' };
  }

  if (prompt.promptType === 'ChoosePokemonPrompt') {
    if (source.includes('guzma')) {
      const opponentChoices = choices.filter(choice =>
        choiceOwner(choice) === 'opponent' && choiceZone(choice) === 'bench');
      if (opponentChoices.length) {
        return singleChoice(opponentChoices,
          choice => opponentPokemonScore(choice, observation, 'guzma'),
          'NO_VISIBLE_POKEMON_TARGET');
      }
      return singleChoice(choices,
        choice => ownSwitchScore(choice, observation),
        'NO_VISIBLE_POKEMON_TARGET');
    }
    if (source.includes('plumeria')) {
      return singleChoice(choices.filter(choice =>
        choiceOwner(choice) === 'opponent'),
      choice => opponentPokemonScore(choice, observation, 'plumeria'),
      'NO_VISIBLE_ENERGY_CHOICE');
    }
    if (source.includes('team flare')) {
      return singleChoice(choices.filter(choice =>
        choiceOwner(choice) === 'opponent' && choiceZone(choice) === 'active'),
      choice => opponentPokemonScore(choice, observation, 'team-flare'),
      'NO_VISIBLE_POKEMON_TARGET');
    }
    if (source.includes('captivating pok')) {
      return singleChoice(choices.filter(choice =>
        choiceOwner(choice) === 'opponent' && choiceZone(choice) === 'hand'),
      choice => cardChoiceScore(choice, observation, 'captivating-puff'),
      'NO_USEFUL_CARD_CHOICE');
    }
    if (source.includes('echoing horn')) {
      return singleChoice(choices.filter(choice =>
        choiceOwner(choice) === 'opponent' &&
          (choiceZone(choice) === 'discard' || choice?.publicMetadata?.sourceZone === 'discard')),
      choice => cardChoiceScore(choice, observation, 'echoing-horn'),
      'NO_USEFUL_CARD_CHOICE');
    }
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_POKEMON_PROMPT' };
  }

  if (prompt.promptType === 'ChooseEnergyPrompt') {
    if (source.includes('handheld fan')) {
      return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
    }
    const context = source.includes('enhanced hammer') ? 'enhanced-hammer' :
      source.includes('team flare') ? 'team-flare-energy' :
      source.includes('crushing hammer') ? 'crushing-hammer' : 'plumeria-energy';
    const opponentChoices = choices.filter(choice => choiceOwner(choice) === 'opponent');
    return singleChoice(opponentChoices,
      choice => cardChoiceScore(choice, observation, context),
      'NO_VISIBLE_ENERGY_CHOICE');
  }

  if (prompt.promptType === 'ChoosePrizePrompt') {
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PRIZE_SELECTION' };
  }

  if (prompt.promptType === 'ConfirmPrompt' ||
      prompt.promptType === 'SelectPrompt' ||
      prompt.promptType === 'SelectOptionPrompt') {
    const yes = choices.find(choice => /^(yes|true|confirm)$/i.test(choice.label ?? ''));
    const no = choices.find(choice => /^(no|false|decline|cancel)$/i.test(choice.label ?? ''));
    if (/tropical beach/i.test(source) &&
        ownHand(observation).length < 7 && ownDeckCount(observation) > 0 && yes) {
      return { kind: 'select-choice', token: yes.token };
    }
    if (no) return { kind: 'select-choice', token: no.token };
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_CONFIRMATION_SOURCE' };
  }

  return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
}

function hasUsefulDiscardForLusamine(observation) {
  const discard = list(observation?.ownPublic?.discard);
  return discard.some(card => matches(card, PRINT.handiwork)) &&
    (discard.some(card => matches(card, PRINT.lusamine)) ||
     discard.some(card => matches(card, PRINT.plumeria)) ||
     discard.some(card => matches(card, PRINT.teamFlare)) ||
     discard.some(card => matches(card, PRINT.guzma)) ||
     discard.some(card => matches(card, PRINT.faba)));
}

function hasUrgentEnergyPressure(observation) {
  return opponentActiveEnergy(observation) > 0 ||
    opponentSpecialEnergyCount(observation) > 0;
}

function scoreAttack(item, request) {
  if (!/Volt Cyclone/i.test(item.attackName ?? '')) return 0;
  if (item.publicMetadata?.attackCostPayable === false) return 0;
  const observation = request.observation;
  const target = opponentActive(observation);
  if (!target) return 20;
  const hp = remainingHp(target);
  if (matches(target.printing, PRINT.budew)) return 220;
  if (hp > 0 && hp <= 140) return 150;
  if (opponentActiveEnergy(observation) >= 3 &&
      !list(request.actionFrontier?.items).some(action =>
        action.kind === 'play-card' &&
        [PRINT.plumeria, PRINT.teamFlare, PRINT.crushingHammer, PRINT.enhancedHammer]
          .some(pattern => matches(action.actorPrinting, pattern)))) return 100;
  return 25;
}

function scorePlayCard(item, request) {
  const observation = request.observation;
  const own = observation.ownPublic;
  const opponent = observation.opponentPublic;
  const card = item.actorPrinting ?? '';
  const target = item.targetPrinting ?? '';
  const hand = ownHand(observation);
  const supporter = [
    PRINT.plumeria, PRINT.teamFlare, PRINT.guzma, PRINT.guzmaHala,
    PRINT.lusamine, PRINT.handiwork, PRINT.cynthiaCaitlin, PRINT.lillie,
    PRINT.eri, PRINT.sidney, PRINT.teamSkull, PRINT.faba, PRINT.gladion
  ].some(pattern => matches(card, pattern));
  const itemCard = [
    PRINT.crushingHammer, PRINT.enhancedHammer, PRINT.megatonBlower,
    PRINT.trainersMail, PRINT.campingGear, PRINT.tagCall,
    PRINT.captivatingPuff, PRINT.echoingHorn, PRINT.targetWhistle, PRINT.fieldBlower
  ].some(pattern => matches(card, pattern));
  if (supporter && !supporterAvailable(observation)) return 0;
  if (itemCard && itemLocked(observation)) return 0;

  if (matches(card, PRINT.peonia) || matches(card, PRINT.gladion) ||
      matches(card, PRINT.playersCeremony) ||
      matches(card, PRINT.palaceBook) || matches(card, PRINT.handheldFan)) return 0;

  if (matches(card, PRINT.speedLightning)) {
    return energyAvailable(observation) && !specialEnergyLocked(observation) &&
      matches(target || own.active?.printing, PRINT.ironThorns) &&
      !hasStadium(observation, /Temple of Sinnoh/i) &&
      !list(own.active?.energies).some(energy => matches(energy, PRINT.speedLightning)) ?
      155 : 0;
  }
  if (matches(card, PRINT.doubleColorless)) {
    const activeHasDce = list(own.active?.energies).some(energy => matches(energy, PRINT.doubleColorless));
    return energyAvailable(observation) && !specialEnergyLocked(observation) &&
      matches(target || own.active?.printing, PRINT.ironThorns) && !activeHasDce ? 125 : 0;
  }
  if (matches(card, PRINT.spikyEnergy) || matches(card, PRINT.captureEnergy)) {
    return energyAvailable(observation) && !specialEnergyLocked(observation) &&
      matches(target || own.active?.printing, PRINT.ironThorns) ? 75 : 0;
  }
  if (matches(card, PRINT.palaceBelt)) {
    const destination = target || own.active?.printing;
    const activeHasTool = list(own.active?.tools).length > 0;
    return !toolLocked(observation) && !activeHasTool &&
      matches(destination, PRINT.ironThorns) && ownDeckCount(observation) > 2 ? 125 : 0;
  }
  if (matches(card, PRINT.toolJammer)) {
    return !toolLocked(observation) && !boardHasTool(own, PRINT.toolJammer) &&
      matches(target || own.active?.printing, PRINT.ironThorns) &&
      (opponentHasTool(observation) || opponentActiveEnergy(observation) > 0) ? 135 : 0;
  }
  if (matches(card, PRINT.thunderMountain)) {
    const activeEnergy = energyCount(own.active);
    return !stadiumLocked(observation) &&
      !hasStadium(observation, PRINT.thunderMountain) &&
      (activeEnergy >= 2 || list(request.actionFrontier.items).some(action =>
        action.kind === 'attack' && /Volt Cyclone/i.test(action.attackName ?? ''))) ? 115 : 0;
  }
  if (matches(card, PRINT.wondrousLabyrinth)) {
    const opponentActive = opponent.active;
    const nonFairy = !list(opponentActive?.printed?.types).some(type => /Fairy/i.test(type));
    const sourceCanAttack = list(request.actionFrontier.items).some(action =>
      action.kind === 'attack' && /Volt Cyclone/i.test(action.attackName ?? ''));
    return !stadiumLocked(observation) && !hasStadium(observation, PRINT.wondrousLabyrinth) &&
      nonFairy && !sourceCanAttack && opponentActiveEnergy(observation) >= 2 ? 95 : 0;
  }
  if (matches(card, PRINT.tropicalBeach)) {
    return !stadiumLocked(observation) && !hasStadium(observation, PRINT.tropicalBeach) &&
      hand.length <= 4 && ownDeckCount(observation) > 4 ? 85 : 0;
  }

  if (matches(card, PRINT.fieldBlower)) {
    const opponentHood = slots(opponent).some(row =>
      list(row.pokemon.tools).some(t => /Stealthy Hood/i.test(valueText(t))));
    return opponentHood ? 205 :
      opponentHasTool(observation) ? 150 :
      list(opponent.stadium).length > 0 ? 95 : 0;
  }
  if (matches(card, PRINT.targetWhistle)) {
    return hasBasicBenchSpace(opponent) && list(opponent.discard).length > 0 ? 75 : 0;
  }
  if (matches(card, PRINT.megatonBlower)) {
    return opponentHasTool(observation) || opponentSpecialEnergyCount(observation) > 0 ? 185 : 0;
  }
  if (matches(card, PRINT.enhancedHammer)) {
    return opponentSpecialEnergyCount(observation) > 0 ? 170 : 0;
  }
  if (matches(card, PRINT.crushingHammer)) {
    return opponentHasAnyEnergy(observation) ? 125 : 0;
  }
  if (matches(card, PRINT.plumeria)) {
    return opponentHasAnyEnergy(observation) && canPayPlumeria(observation) ?
      (opponentActiveEnergy(observation) > 0 ? 190 : 160) : 0;
  }
  if (matches(card, PRINT.teamFlare)) {
    return opponentActiveEnergy(observation) > 0 ? 185 : 0;
  }
  if (matches(card, PRINT.faba)) {
    return opponentHasTool(observation) || opponentSpecialEnergyCount(observation) > 0 ||
      stadiumsInPlay(observation).length > 0 ? 175 : 0;
  }
  if (matches(card, PRINT.teamSkull)) {
    return opponentHasVisibleEnergy(observation) ? 145 : 0;
  }
  if (matches(card, PRINT.sidney)) {
    return opponentHasVisibleToolOrSpecial(observation) ? 145 : 0;
  }
  if (matches(card, PRINT.eri)) {
    return opponentHasVisibleItem(observation) ? 145 : 0;
  }
  if (matches(card, PRINT.guzma)) {
    const ownBench = slots(own).filter(row => row.zone === 'bench' &&
      matches(row.pokemon.printing, PRINT.ironThorns));
    const trapTarget = slots(opponent).some(row => row.zone === 'bench' &&
      energyCount(row.pokemon) === 0 &&
      list(row.pokemon.printed?.retreatCost).length >= 2);
    return ownBench.length > 0 && trapTarget ? 135 : 0;
  }
  if (matches(card, PRINT.guzmaHala)) {
    const needDce = !list(own.active?.energies).some(energy => matches(energy, PRINT.doubleColorless)) &&
      handCopies(hand, PRINT.doubleColorless) === 0;
    const needThunder = !hasStadium(observation, PRINT.thunderMountain) &&
      !hand.some(value => matches(value, PRINT.thunderMountain));
    const needJammer = opponentHasTool(observation) &&
      !boardHasTool(own, PRINT.toolJammer) &&
      !hand.some(value => matches(value, PRINT.toolJammer));
    return needDce || needThunder || needJammer ? 140 : 0;
  }
  if (matches(card, PRINT.lusamine)) {
    return hasUsefulDiscardForLusamine(observation) ? 155 : 0;
  }
  if (matches(card, PRINT.handiwork)) {
    const ownDeck = ownDeckCount(observation);
    const opponentDeck = opponentDeckCount(observation);
    if (ownDeck === null || opponentDeck === null || ownDeck === 0 || opponentDeck === 0) return 0;
    return hasUrgentEnergyPressure(observation) ? 90 :
      (opponentDeck <= ownDeck + 8 ? 140 : 115);
  }
  if (matches(card, PRINT.cynthiaCaitlin)) {
    const useful = list(own.discard).some(value =>
      [PRINT.plumeria, PRINT.teamFlare, PRINT.guzma, PRINT.lusamine, PRINT.handiwork, PRINT.faba]
        .some(pattern => matches(value, pattern)));
    return useful && hand.length <= 4 ? 110 : 0;
  }
  if (matches(card, PRINT.lillie)) {
    return hand.length <= 2 && ownDeckCount(observation) > 7 ? 115 : 0;
  }
  if (matches(card, PRINT.tagCall)) {
    return !hand.some(value => matches(value, PRINT.guzmaHala)) &&
      ownDeckCount(observation) > 0 ? 105 : 0;
  }
  if (matches(card, PRINT.trainersMail)) {
    return hand.length <= 5 && ownDeckCount(observation) > 0 ? 85 : 0;
  }
  if (matches(card, PRINT.campingGear)) {
    const hasUsefulSupporter = hand.some(value =>
      [PRINT.plumeria, PRINT.teamFlare, PRINT.guzma, PRINT.lusamine, PRINT.handiwork,
        PRINT.guzmaHala, PRINT.faba].some(pattern => matches(value, pattern)));
    return !hasUsefulSupporter && hand.length <= 3 && ownDeckCount(observation) > 0 ? 75 : 0;
  }
  if (matches(card, PRINT.echoingHorn)) {
    const hasTarget = list(opponent.discard).some(value => /Pok[eé]mon/i.test(valueText(value)));
    return hasBasicBenchSpace(opponent) && hasTarget ? 75 : 0;
  }
  if (matches(card, PRINT.captivatingPuff)) {
    return hasBasicBenchSpace(opponent) && Number.isSafeInteger(opponent.handCount) &&
      opponent.handCount > 0 ? 65 : 0;
  }
  return 0;
}

function scoreStadiumUse(item, request) {
  const observation = request.observation;
  const card = item.actorPrinting ?? item.publicMetadata?.stadiumPrinting ?? '';
  if (matches(card, PRINT.playersCeremony)) return 0;
  if (matches(card, PRINT.tropicalBeach)) {
    return ownHand(observation).length <= 4 && ownDeckCount(observation) > 0 &&
      (observation.ownTurnResources?.supporterPlayedTurn === 1 ||
       !supporterAvailable(observation)) ? 120 : 0;
  }
  if (matches(card, PRINT.wondrousLabyrinth)) {
    return opponentActiveEnergy(observation) >= 2 &&
      !list(opponentActive(observation)?.printed?.types).some(type => /Fairy/i.test(type)) ? 90 : 0;
  }
  return 0;
}

function scoreRetreat(item, observation) {
  const active = ownActive(observation);
  const target = item.targetPrinting ?? '';
  if (!matches(active?.printing, PRINT.ironThorns)) {
    const targetRow = slots(observation.ownPublic).find(row =>
      row.zone === 'bench' && matches(row.pokemon.printing, PRINT.ironThorns) &&
      row.pokemon.printing === target);
    return targetRow ? 110 + energyCount(targetRow.pokemon) * 20 -
      (targetRow.pokemon.damage ?? 0) : 0;
  }
  // The source strategy values a single Active Initialization lock and does
  // not pay a four-Energy retreat merely to rotate equivalent Iron Thorns.
  return 0;
}

function scoreAction(item, request) {
  if (!EXECUTABLE.has(item.kind)) return -1;
  const observation = request.observation;
  if (item.kind === 'pass') return 0;
  if (item.kind === 'attack') return scoreAttack(item, request);
  if (item.kind === 'retreat') return scoreRetreat(item, observation);
  if (item.kind === 'use-stadium') return scoreStadiumUse(item, request);
  if (item.kind === 'use-ability') return 0;
  if (item.kind === 'play-card') return scorePlayCard(item, request);
  return 0;
}

function bestAction(request) {
  const items = list(request.actionFrontier?.items)
    .filter(item => EXECUTABLE.has(item.kind));
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
    { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ROOT_ACTION' };
}

function createPolicy({ role, seat, policyVersion, config }) {
  // The shared Agent49 worker's init-v2 contract permits only config: {}.
  // Rank/source/candidate identity is immutable in this module and its suite
  // manifest; it must not be transported as per-rank runtime configuration.
  if (role !== 'opponent' || (seat !== 0 && seat !== 1) ||
      policyVersion !== POLICY_VERSION || !config ||
      typeof config !== 'object' || Array.isArray(config) ||
      Object.keys(config).length !== 0) {
    throw new Error('AGENT4_RANK29_POLICY_INIT_MISMATCH');
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
  SOURCE_FINGERPRINT_SHA256,
  CANDIDATE_FINGERPRINT_SHA256,
  ENGINE_PIN,
  WORKER_PROTOCOL_BLOB_SHA1,
  createPolicy,
  scoreAction,
  scoreAttack,
  promptDecision,
  cardChoiceScore,
  opponentPokemonScore
};
