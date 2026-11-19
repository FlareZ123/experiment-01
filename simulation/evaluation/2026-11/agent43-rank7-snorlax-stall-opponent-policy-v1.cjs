'use strict';

/*
 * Rank-7 Hiroto Fuji Snorlax Stall opponent policy, v1.
 * Deterministic actor-view-only prototype bound to the exact rank-7 source
 * entry and Hood Shield v1. It prioritizes the public Faba -> Jet Energy ->
 * Wobbuffet -> Item-unlock line, then bounded stall/resource actions.
 * Unknown or ambiguous prompts abstain. Native Store legality is authoritative.
 */

const POLICY_VERSION = 'agent43-rank7-snorlax-stall-opponent-v1';
const SOURCE_RANK = 7;
const SOURCE_LIST_BLOB_SHA1 = 'ae773f6201d7aa69d31914dbfee66f3fba692200';
const SOURCE_FINGERPRINT_SHA256 = 'a66fa49dbeaa886c5509ff5edff727577bba5e4c9f4bbe9800b152975f8b4734';
const CANDIDATE_FINGERPRINT_SHA256 = '1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4';
const ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const WORKER_PROTOCOL_BLOB_SHA1 = 'd51ea95c457d61b50a9ee114d342eb17f4350451';

const P = Object.freeze({
  snorlax: /^Snorlax PGO 55\b/i,
  wobbuffet: /^Wobbuffet PHF 36\b/i,
  mimikyu: /^Mimikyu PAL 97\b/i,
  regirock: /^Regirock XYP 49\b/i,
  electrike: /^Electrike PRC 60\b/i,
  girafarig: /^Girafarig LOT 94\b/i,
  vileplume: /^Vileplume AOR\b/i,
  alolanMuk: /^Alolan Muk\b/i,
  faba: /^Faba LOT 173\b/i,
  jet: /^Jet Energy PAL 190\b/i,
  nest: /^Nest Ball SVI 181\b/i,
  fieldBlower: /^Field Blower GRI 125\b/i,
  megatonBlower: /^Megaton Blower SSP 182\b/i,
  toolJammer: /^Tool Jammer BST 136\b/i,
  chaoticSwell: /^Chaotic Swell CEC 187\b/i,
  artazon: /^Artazon PAL 171\b/i,
  capture: /^Capture Energy RCL 171\b/i,
  recycle: /^Recycle Energy UNM 212\b/i,
  hood: /^Stealthy Hood UNB 186\b/i,
  floatStone: /^Float Stone BKT 137\b/i,
  forestSeal: /^Forest Seal Stone SIT 156\b/i,
  vsSeeker: /^VS Seeker PHF 109\b/i,
  counterCatcher: /^Counter Catcher PAR 160\b/i,
  enhancedHammer: /^Enhanced Hammer TWM 148\b/i,
  teammates: /^Teammates PRC 141\b/i,
  steven: /^Steven's Resolve CES 145\b/i,
  n: /^N FCO 105\b/i,
  lusamine: /^Lusamine CIN 96\b/i,
  lillie: /^Lillie's Determination MEG 119\b/i,
  plumeria: /^Plumeria BUS 120\b/i,
  teamFlare: /^Team Flare Grunt XY 129\b/i,
  guzma: /^Guzma BUS 115\b/i,
  handiwork: /^Team Rocket's Handiwork FCO 112\b/i,
  bellelba: /^Bellelba & Brycen-Man CEC 186\b/i,
  gladion: /^Gladion CIN 95\b/i,
  targetWhistle: /^Target Whistle PHF 106\b/i,
  rescueStretcher: /^Rescue Stretcher GRI 130\b/i,
  robo: /^Robo Substitute PHF 102\b/i,
  doll: /^Lillie's Poké Doll CEC 197\b/i,
  palaceBook: /^Palace Book SMP NAN25\b/i,
  basicEnergy: /^(?:Basic )?(?:Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal) Energy\b/i
});

const EXECUTABLE = new Set(['play-card', 'attack', 'retreat', 'use-ability', 'use-stadium', 'pass']);

function list(value) { return Array.isArray(value) ? value : []; }

function textOf(value) {
  if (typeof value === 'string') return value;
  if (typeof value?.printing === 'string') return value.printing;
  if (typeof value?.fullName === 'string') return value.fullName;
  if (typeof value?.actorPrinting === 'string') return value.actorPrinting;
  if (typeof value?.targetPrinting === 'string') return value.targetPrinting;
  if (typeof value?.label === 'string') return value.label;
  if (typeof value?.publicMetadata?.cardPrinting === 'string') return value.publicMetadata.cardPrinting;
  return '';
}

function matches(value, pattern) { return pattern.test(textOf(value)); }
function own(view) { return view?.ownPublic ?? {}; }
function opp(view) { return view?.opponentPublic ?? {}; }
function hand(view) { return list(view?.ownHand); }

function slots(player) {
  return [
    { zone: 'active', index: 0, pokemon: player?.active ?? null },
    ...list(player?.bench).map((pokemon, index) => ({ zone: 'bench', index, pokemon }))
  ].filter(row => row.pokemon && row.pokemon.concealed !== true);
}

function boardHas(player, pattern) {
  return slots(player).some(row => matches(row.pokemon.printing, pattern));
}

function hasTool(pokemon, pattern) {
  return list(pokemon?.tools).some(tool => matches(tool, pattern));
}

function hasAbility(pokemon, name) {
  return list(pokemon?.abilities).includes(name) ||
    list(pokemon?.abilityDetails).some(ability => ability?.name === name);
}

function hasHand(view, pattern) { return hand(view).some(card => matches(card, pattern)); }
function handIndex(view, pattern) { return hand(view).findIndex(card => matches(card, pattern)); }
function handSize(view) { return hand(view).length; }
function deckCount(view) { return Number.isSafeInteger(own(view).deckCount) ? own(view).deckCount : 99; }
function opponentDeckCount(view) { return Number.isSafeInteger(opp(view).deckCount) ? opp(view).deckCount : 99; }
function opponentHandCount(view) { return Number.isSafeInteger(opp(view).handCount) ? opp(view).handCount : 0; }
function benchSpace(view) { return list(own(view).bench).some(slot => slot === null); }
function ownPrizeCount(view) { return Number.isSafeInteger(own(view).prizeCount) ? own(view).prizeCount : 6; }
function opponentPrizeCount(view) { return Number.isSafeInteger(opp(view).prizeCount) ? opp(view).prizeCount : 6; }

function supporterAvailable(view) {
  const r = view?.ownTurnResources ?? {};
  const p = own(view).publicTurnRestrictions ?? {};
  return r.supporterPlayedTurn === 0 && r.supporterPlayLocked !== true &&
    p.supporterPlayLocked !== true;
}

function itemAvailable(view) {
  const r = view?.ownTurnResources ?? {};
  const p = own(view).publicTurnRestrictions ?? {};
  return r.itemPlayLocked !== true && p.itemPlayLocked !== true;
}

function energyAvailable(view) {
  const r = view?.ownTurnResources ?? {};
  const p = own(view).publicTurnRestrictions ?? {};
  return r.energyPlayedTurn !== true && r.energyPlayedTurn !== view?.globalTurn &&
    r.energyPlayLocked !== true && r.specialEnergyPlayLocked !== true &&
    p.energyPlayLocked !== true && p.specialEnergyPlayLocked !== true;
}

function allStadiums(view) { return [...list(own(view).stadium), ...list(opp(view).stadium)]; }
function hasTemple(view) { return allStadiums(view).some(card => /Temple of Sinnoh/i.test(textOf(card))); }

function hasAlolanMuk(view) {
  return [...slots(own(view)), ...slots(opp(view))].some(row =>
    matches(row.pokemon.printing, P.alolanMuk) && hasAbility(row.pokemon, 'Power of Alchemy'));
}

function vileplumeLocks(view) {
  return slots(opp(view)).filter(row =>
    matches(row.pokemon.printing, P.vileplume) && hasAbility(row.pokemon, 'Irritating Pollen'));
}

function hoodedVileplumes(view) {
  return vileplumeLocks(view).filter(row => hasTool(row.pokemon, P.hood));
}

function fabaUnlockTarget(view) {
  const protectedLocks = hoodedVileplumes(view);
  if (protectedLocks.length !== 1 || list(protectedLocks[0].pokemon.tools).length !== 1) return null;
  return protectedLocks[0];
}

/*
 * This is the narrow public precondition for the known Faba/Jet/Nest line.
 * It never inspects an opponent hand, deck, Prize identity, or private state.
 */
function source7FabaJetNestReady(view) {
  const target = fabaUnlockTarget(view);
  if (!target || hasAlolanMuk(view) || view?.globalTurn <= 1 ||
      !supporterAvailable(view) || !hasHand(view, P.faba) ||
      !hasHand(view, P.nest) || !benchSpace(view) || deckCount(view) <= 0) return null;

  if (matches(own(view).active?.printing ?? '', P.wobbuffet)) return target;
  if (!boardHas(own(view), P.wobbuffet) || !hasHand(view, P.jet) ||
      !energyAvailable(view) || hasTemple(view)) return null;
  return target;
}

function source7JetWobbuffetReady(view) {
  const locks = vileplumeLocks(view);
  return locks.length > 0 && locks.every(row => !hasTool(row.pokemon, P.hood)) &&
    !hasAlolanMuk(view) &&
    !matches(own(view).active?.printing ?? '', P.wobbuffet) &&
    boardHas(own(view), P.wobbuffet) && hasHand(view, P.jet) &&
    hasHand(view, P.nest) && benchSpace(view) && deckCount(view) > 0 &&
    energyAvailable(view) && !hasTemple(view);
}

function source7NestReady(view) {
  const locks = vileplumeLocks(view);
  const itemLockCleared = locks.length === 0 ||
    (matches(own(view).active?.printing ?? '', P.wobbuffet) &&
      locks.every(row => !hasTool(row.pokemon, P.hood)) && !hasAlolanMuk(view));
  return itemLockCleared && itemAvailable(view) && benchSpace(view) &&
    deckCount(view) > 0 && hasHand(view, P.nest);
}

function opponentHasTool(view) {
  return slots(opp(view)).some(row => list(row.pokemon.tools).length > 0);
}

function opponentHasSpecialEnergy(view) {
  return slots(opp(view)).some(row => list(row.pokemon.energies).some(energy =>
    /Energy/i.test(textOf(energy)) && !P.basicEnergy.test(textOf(energy))));
}

function opponentHasEnergy(view) {
  return slots(opp(view)).some(row => list(row.pokemon.energies).length > 0);
}

function opponentHasVOrEx(view) {
  return slots(opp(view)).some(row =>
    /\b(?:Pokémon )?(?:V(?:MAX|STAR)?|ex)\b/i.test(textOf(row.pokemon.printing)));
}

function opponentHasRemovalTarget(view) {
  return opponentHasTool(view) || opponentHasSpecialEnergy(view) || allStadiums(view).length > 0;
}

function opponentDiscardHasRecovery(view) {
  return list(opp(view).discard).some(card =>
    /VS Seeker|Lusamine|Faba|Rescue Stretcher|Super Rod|Ordinary Rod/i.test(textOf(card)));
}

function remainingHp(pokemon) {
  return pokemon && Number.isFinite(pokemon.hp) && Number.isFinite(pokemon.damage) ?
    pokemon.hp - pokemon.damage : -1;
}

function scoreAttack(item, view) {
  const name = item.attackName ?? '';
  const meta = item.publicMetadata ?? {};
  const targetHp = remainingHp(opp(view).active);
  if (meta.attackCostPayable === false) return 0;
  if (name === 'Get Lost') return opponentDiscardHasRecovery(view) ? 230 :
    list(opp(view).discard).length > 0 ? 125 : 0;
  if (name === 'Collapse') {
    const damage = Number.isFinite(meta.damageAfterWeakness) ? meta.damageAfterWeakness :
      Number.isFinite(meta.damage) ? meta.damage : 150;
    return targetHp > 0 && damage >= targetHp ? 220 :
      targetHp > 0 && targetHp <= 150 ? 150 : 35;
  }
  if (name === 'Ghost Eye') return targetHp > 0 && targetHp <= 70 ? 195 : 65;
  if (name === 'Psychic Assault') return (opp(view).active?.damage ?? 0) > 0 ? 135 : 65;
  if (name === 'Land Maker') return list(own(view).discard).some(card =>
    matches(card, P.chaoticSwell) || matches(card, P.artazon)) ? 145 : 45;
  if (name === 'Thunder Fang') return 75;
  if (name === 'Mind Shock') return 70;
  if (name === 'Stone Edge') return 65;
  return 0;
}

function scoreBasicPlay(printing, view) {
  const player = own(view);
  if (matches(printing, P.snorlax)) return boardHas(player, P.snorlax) ? 35 : 175;
  if (matches(printing, P.wobbuffet)) return boardHas(player, P.wobbuffet) ? 25 :
    vileplumeLocks(view).length > 0 ? 155 : 100;
  if (matches(printing, P.mimikyu)) return boardHas(player, P.mimikyu) ? 25 :
    opponentHasVOrEx(view) ? 155 : 75;
  if (matches(printing, P.girafarig)) return boardHas(player, P.girafarig) ? 20 :
    opponentDiscardHasRecovery(view) ? 135 : 90;
  if (matches(printing, P.regirock)) return boardHas(player, P.regirock) ? 20 :
    list(player.discard).some(card => matches(card, P.chaoticSwell) || matches(card, P.artazon)) ? 125 : 75;
  if (matches(printing, P.electrike)) return boardHas(player, P.electrike) ? 10 : 35;
  return 0;
}

function choiceOwner(choice) { return choice?.publicMetadata?.ownerSeat ?? null; }
function choiceZone(choice) {
  const meta = choice?.publicMetadata ?? {};
  return meta.sourceZone ?? meta.targetZone ?? meta.zone ?? null;
}

function scoreCardChoice(choice, view, context) {
  const printing = textOf(choice);
  const owner = choiceOwner(choice);
  const zone = choiceZone(choice);
  const player = own(view);

  if (context === 'basic-search') {
    if (owner !== 'actor' || zone !== 'deck') return 0;
    if (matches(printing, P.snorlax)) return boardHas(player, P.snorlax) ? 30 : 250;
    if (matches(printing, P.wobbuffet)) return boardHas(player, P.wobbuffet) ? 20 : 235;
    if (matches(printing, P.mimikyu)) return boardHas(player, P.mimikyu) ? 20 :
      opponentHasVOrEx(view) ? 220 : 170;
    if (matches(printing, P.regirock)) return boardHas(player, P.regirock) ? 20 : 180;
    if (matches(printing, P.girafarig)) return boardHas(player, P.girafarig) ? 20 : 150;
    if (matches(printing, P.electrike)) return boardHas(player, P.electrike) ? 10 : 25;
    return 0;
  }

  if (context === 'steven' || context === 'teammates') {
    if (owner !== 'actor' || zone !== 'deck') return 0;
    if (matches(printing, P.faba)) return 300;
    if (matches(printing, P.jet)) return 290;
    if (matches(printing, P.nest)) return 280;
    if (matches(printing, P.megatonBlower)) return 260;
    if (matches(printing, P.toolJammer)) return boardHas(player, P.toolJammer) ? 80 : 240;
    if (matches(printing, P.snorlax)) return boardHas(player, P.snorlax) ? 70 : 225;
    if (matches(printing, P.wobbuffet)) return boardHas(player, P.wobbuffet) ? 60 : 215;
    if (matches(printing, P.mimikyu)) return boardHas(player, P.mimikyu) ? 60 : 195;
    if (matches(printing, P.fieldBlower)) return 185;
    if (matches(printing, P.vsSeeker)) return 175;
    if (matches(printing, P.chaoticSwell)) return 165;
    if (matches(printing, P.artazon)) return 155;
    if (matches(printing, P.regirock)) return boardHas(player, P.regirock) ? 35 : 145;
    return 10;
  }

  if (context === 'lusamine') {
    if (owner !== 'actor' || zone !== 'discard') return 0;
    if (matches(printing, P.faba)) return 280;
    if (matches(printing, P.teamFlare)) return 250;
    if (matches(printing, P.guzma)) return 235;
    if (matches(printing, P.steven)) return 220;
    if (matches(printing, P.n)) return 210;
    if (matches(printing, P.plumeria)) return 190;
    if (matches(printing, P.chaoticSwell)) return 180;
    if (matches(printing, P.artazon)) return 170;
    return 0;
  }

  if (context === 'vs-seeker') {
    if (owner !== 'actor' || zone !== 'discard') return 0;
    if (matches(printing, P.faba)) return 280;
    if (matches(printing, P.teamFlare)) return 250;
    if (matches(printing, P.guzma)) return 235;
    if (matches(printing, P.steven)) return 220;
    if (matches(printing, P.n)) return 210;
    if (matches(printing, P.plumeria)) return 190;
    if (matches(printing, P.lusamine)) return 180;
    return 0;
  }

  if (context === 'field-blower') {
    if (owner !== 'opponent' || !['attached', 'tool', 'tools', 'stadium'].includes(zone)) return 0;
    if (matches(printing, P.hood)) return 300;
    if (matches(printing, P.floatStone)) return 270;
    if (matches(printing, P.forestSeal)) return 250;
    if (matches(printing, P.toolJammer)) return 230;
    if (matches(printing, P.chaoticSwell)) return 180;
    if (matches(printing, P.artazon)) return 170;
    return 80;
  }

  if (context === 'get-lost') {
    if (owner !== 'opponent' || zone !== 'discard') return 0;
    if (matches(printing, P.vsSeeker)) return 300;
    if (matches(printing, P.lusamine)) return 280;
    if (matches(printing, P.faba)) return 270;
    if (matches(printing, P.teamFlare)) return 250;
    if (matches(printing, P.guzma)) return 240;
    if (/Special Energy|Jet Energy|Capture Energy|Recycle Energy/i.test(printing)) return 200;
    if (/Rescue Stretcher|Super Rod|Ordinary Rod/i.test(printing)) return 190;
    return 25;
  }

  if (context === 'plumeria-cost' || context === 'bellelba-cost') {
    if (owner !== 'actor' || zone !== 'hand') return 0;
    if ([P.faba, P.jet, P.nest, P.megatonBlower, P.toolJammer, P.vsSeeker,
      P.chaoticSwell, P.artazon].some(pattern => matches(printing, pattern))) return -100;
    const copies = hand(view).filter(card => textOf(card) === printing).length;
    if (copies > 1) return 100;
    if (matches(printing, P.electrike) || matches(printing, P.robo) || matches(printing, P.doll)) return 85;
    if (matches(printing, P.regirock) && boardHas(player, P.regirock)) return 75;
    if (matches(printing, P.mimikyu) && boardHas(player, P.mimikyu)) return 65;
    if (/Energy/i.test(printing) && !P.basicEnergy.test(printing)) return 5;
    return 25;
  }

  if (context === 'enhanced-hammer') {
    return owner === 'opponent' && zone === 'attached' &&
      /Energy/i.test(printing) && !P.basicEnergy.test(printing) ? 150 : 0;
  }

  if (context === 'target-whistle') {
    if (owner !== 'opponent' || zone !== 'discard') return 0;
    return /Pokémon|Snorlax|Wobbuffet|Mimikyu|Regirock|Girafarig|Electrike/i.test(printing) ? 80 : 0;
  }

  if (context === 'rescue-stretcher') {
    if (owner !== 'actor' || zone !== 'discard') return 0;
    return [P.snorlax, P.wobbuffet, P.mimikyu, P.regirock, P.girafarig, P.electrike]
      .some(pattern => matches(printing, pattern)) ? 100 : 0;
  }

  return 0;
}

function scorePokemonChoice(choice, view, context) {
  const owner = choiceOwner(choice);
  const zone = choiceZone(choice);
  const printing = textOf(choice);
  const ownPlayer = own(view);
  const opponentPlayer = opp(view);

  if (context === 'faba') {
    const target = fabaUnlockTarget(view);
    return owner === 'opponent' && target &&
      matches(printing, P.vileplume) && target.pokemon.printing === printing ? 500 : 0;
  }
  if (context === 'team-flare') {
    return owner === 'opponent' && zone === 'active' &&
      opponentPlayer.active?.printing === printing &&
      list(opponentPlayer.active.energies).length > 0 ? 250 : 0;
  }
  if (context === 'plumeria') {
    if (owner !== 'opponent') return 0;
    const row = slots(opponentPlayer).find(item => item.pokemon.printing === printing);
    return row ? list(row.pokemon.energies).length * 100 + (row.zone === 'active' ? 15 : 0) : 0;
  }
  if (context === 'guzma-opponent' || context === 'counter-catcher') {
    if (owner !== 'opponent' || zone !== 'bench') return 0;
    const row = slots(opponentPlayer).find(item => item.pokemon.printing === printing);
    return row ? 40 + list(row.pokemon.energies).length * 40 +
      (row.pokemon.printed?.retreatCost?.length ?? 0) * 18 : 0;
  }
  if (context === 'guzma-own') {
    if (owner !== 'actor' || zone !== 'bench') return 0;
    const row = slots(ownPlayer).find(item => item.pokemon.printing === printing);
    if (!row) return 0;
    if (matches(printing, P.snorlax)) return hasTool(row.pokemon, P.toolJammer) ? 320 : 270;
    if (matches(printing, P.wobbuffet) && vileplumeLocks(view).length > 0 &&
        vileplumeLocks(view).every(lock => !hasTool(lock.pokemon, P.hood)) &&
        !hasAlolanMuk(view)) return 250;
    return 20;
  }
  if (context === 'basic-search') return scoreCardChoice(choice, view, 'basic-search');
  return 0;
}

function multiBounds(prompt) {
  const meta = prompt?.publicMetadata ?? {};
  if (!['card-combination', 'pokemon', 'energy-payment', 'prize-slots', 'card-order']
    .includes(meta.selectionType)) return null;
  const min = meta.selectionType === 'energy-payment' ? 1 :
    meta.selectionType === 'prize-slots' ? meta.requiredCount :
      meta.selectionType === 'card-order' ? meta.count :
        Number.isSafeInteger(meta.minimumCount) ? meta.minimumCount : 1;
  const max = meta.selectionType === 'energy-payment' ? (meta.energyCount ?? meta.count) :
    meta.selectionType === 'prize-slots' ? meta.requiredCount :
      meta.selectionType === 'card-order' ? meta.count :
        Number.isSafeInteger(meta.maximumCount) ? meta.maximumCount : min;
  return Number.isSafeInteger(min) && Number.isSafeInteger(max) ? { min, max } : null;
}

function selectOne(choices, scorer, reasonCode) {
  const ranked = list(choices).map((choice, index) => ({ choice, index, score: scorer(choice) }))
    .filter(row => row.score > 0 && typeof row.choice?.token === 'string')
    .sort((a, b) => b.score - a.score || a.index - b.index);
  return ranked[0] ? { kind: 'select-choice', token: ranked[0].choice.token } :
    { kind: 'abstain', reasonCode };
}

function selectMany(prompt, choices, scorer, min, max, reasonCode) {
  const ranked = list(choices).map((choice, index) => ({ choice, index, score: scorer(choice) }))
    .filter(row => row.score > 0 && typeof row.choice?.token === 'string')
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, max);
  if (ranked.length < min) return { kind: 'abstain', reasonCode };
  if (ranked.length === 0) {
    const empty = list(prompt.choices).find(choice => choice.kind === 'empty-selection');
    return min === 0 && empty ? { kind: 'select-choice', token: empty.token } :
      { kind: 'abstain', reasonCode };
  }
  return { kind: 'select-choices', tokens: ranked.map(row => row.choice.token) };
}

function sourceText(prompt) {
  return [prompt?.source?.sourcePrinting ?? '', prompt?.source?.effectName ?? '',
    prompt?.description ?? ''].join(' ').toLowerCase();
}

function promptDecision(request) {
  const prompt = request.prompt;
  const view = request.observation;
  const choices = list(prompt?.choices);
  const source = sourceText(prompt);
  const sourcePrinting = prompt?.source?.sourcePrinting ?? '';
  const bounds = multiBounds(prompt);

  if (matches(sourcePrinting, P.palaceBook) || /palace book/i.test(source)) {
    return { kind: 'abstain', reasonCode: 'PALACE_BOOK_ENGINE_TEXT_UNVERIFIED' };
  }
  if (prompt.promptType === 'ChoosePrizePrompt' && source.includes('gladion')) {
    return { kind: 'abstain', reasonCode: 'GLADION_PRIZE_IDENTITIES_UNVERIFIED' };
  }

  if (prompt.promptType === 'SelectPrompt' || prompt.promptType === 'ConfirmPrompt' ||
      prompt.promptType === 'SelectOptionPrompt') {
    if (source.includes('faba')) {
      return selectOne(choices, choice =>
        /tool/i.test(textOf(choice)) ? 100 : 0, 'FABA_TOOL_OPTION_UNAVAILABLE');
    }
    if (source.includes('bellelba')) {
      const oppBench = list(opp(view).bench).filter(Boolean).length;
      const ownBench = list(own(view).bench).filter(Boolean).length;
      const useful = oppBench > 3 && ownBench <= 3 ||
        deckCount(view) >= opponentDeckCount(view) + 3;
      const yes = choices.find(choice => /^(yes|true|confirm)$/i.test(choice.label ?? ''));
      const no = choices.find(choice => /^(no|false|decline|cancel)$/i.test(choice.label ?? ''));
      if (useful && yes) return { kind: 'select-choice', token: yes.token };
      if (no) return { kind: 'select-choice', token: no.token };
    }
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_OPTIONAL_PROMPT' };
  }

  if (prompt.promptType === 'ChoosePokemonPrompt') {
    if (bounds) return { kind: 'abstain', reasonCode: 'UNSUPPORTED_MULTI_POKEMON_PROMPT' };
    if (source.includes('faba')) return selectOne(choices,
      choice => scorePokemonChoice(choice, view, 'faba'), 'FABA_HOODED_VILEPLUME_TARGET_UNAVAILABLE');
    if (source.includes('team flare grunt')) return selectOne(choices,
      choice => scorePokemonChoice(choice, view, 'team-flare'), 'TEAM_FLARE_ACTIVE_ENERGY_TARGET_UNAVAILABLE');
    if (source.includes('plumeria')) return selectOne(choices,
      choice => scorePokemonChoice(choice, view, 'plumeria'), 'PLUMERIA_ENERGY_TARGET_UNAVAILABLE');
    if (source.includes('guzma')) {
      const opponentChoices = choices.filter(choice => choiceOwner(choice) === 'opponent');
      return opponentChoices.length ? selectOne(opponentChoices,
        choice => scorePokemonChoice(choice, view, 'guzma-opponent'),
        'GUZMA_OPPONENT_BENCH_TARGET_UNAVAILABLE') :
        selectOne(choices, choice => scorePokemonChoice(choice, view, 'guzma-own'),
          'GUZMA_OWN_SWITCH_TARGET_UNAVAILABLE');
    }
    if (source.includes('counter catcher')) return selectOne(choices,
      choice => scorePokemonChoice(choice, view, 'counter-catcher'),
      'COUNTER_CATCHER_BENCH_TARGET_UNAVAILABLE');
    if (/nest ball|capture energy|artazon/i.test(source)) return selectOne(choices,
      choice => scorePokemonChoice(choice, view, 'basic-search'), 'BASIC_SEARCH_TARGET_UNAVAILABLE');
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_POKEMON_PROMPT' };
  }

  if (prompt.promptType === 'ChooseEnergyPrompt') {
    const score = choice => scoreCardChoice(choice, view, 'enhanced-hammer');
    return bounds ? selectMany(prompt, choices, score, bounds.min, bounds.max,
      'ENHANCED_HAMMER_SPECIAL_ENERGY_UNAVAILABLE') :
      selectOne(choices, score, 'ENHANCED_HAMMER_SPECIAL_ENERGY_UNAVAILABLE');
  }

  if (prompt.promptType === 'ChooseCardsPrompt') {
    if (bounds) {
      let context = null;
      if (source.includes('steven')) context = 'steven';
      else if (source.includes('teammates')) context = 'teammates';
      else if (source.includes('field blower')) context = 'field-blower';
      else if (source.includes('get lost')) context = 'get-lost';
      else if (source.includes('plumeria')) context = 'plumeria-cost';
      else if (source.includes('lusamine')) context = 'lusamine';
      else if (source.includes('bellelba')) context = 'bellelba-cost';
      else if (/nest ball|capture energy|artazon/i.test(source)) context = 'basic-search';
      else if (source.includes('enhanced hammer')) context = 'enhanced-hammer';
      else if (source.includes('target whistle')) context = 'target-whistle';
      else if (source.includes('rescue stretcher')) context = 'rescue-stretcher';
      if (!context) return { kind: 'abstain', reasonCode: 'UNSUPPORTED_MULTI_SELECT_SOURCE' };
      if (context === 'bellelba-cost') {
        const oppBench = list(opp(view).bench).filter(Boolean).length;
        const ownBench = list(own(view).bench).filter(Boolean).length;
        if (!(oppBench > 3 && ownBench <= 3 ||
            deckCount(view) >= opponentDeckCount(view) + 3)) {
          return { kind: 'abstain', reasonCode: 'BELLELBA_BENCH_OR_DECK_TRADE_UNFAVORABLE' };
        }
      }
      return selectMany(prompt, choices,
        choice => scoreCardChoice(choice, view, context), bounds.min, bounds.max,
        'NO_SUPPORTED_MULTI_SELECT_TARGETS');
    }

    if (source.includes('faba')) return selectOne(choices, choice =>
      choiceOwner(choice) === 'opponent' && matches(choice, P.hood) ? 250 : 0,
      'FABA_HOOD_CARD_UNAVAILABLE');
    if (source.includes('vs seeker')) return selectOne(choices,
      choice => scoreCardChoice(choice, view, 'vs-seeker'), 'VS_SEEKER_SUPPORTER_UNAVAILABLE');
    if (/nest ball|capture energy|artazon/i.test(source)) return selectOne(choices,
      choice => scoreCardChoice(choice, view, 'basic-search'), 'BASIC_SEARCH_TARGET_UNAVAILABLE');
    if (source.includes('target whistle')) return selectOne(choices,
      choice => scoreCardChoice(choice, view, 'target-whistle'), 'TARGET_WHISTLE_BASIC_UNAVAILABLE');
    if (source.includes('enhanced hammer')) return selectOne(choices,
      choice => scoreCardChoice(choice, view, 'enhanced-hammer'),
      'ENHANCED_HAMMER_SPECIAL_ENERGY_UNAVAILABLE');
    if (source.includes('rescue stretcher')) return selectOne(choices,
      choice => scoreCardChoice(choice, view, 'rescue-stretcher'),
      'RESCUE_STRETCHER_POKEMON_UNAVAILABLE');
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_SINGLE_CARD_PROMPT' };
  }

  return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
}

function scoreAction(item, request) {
  const view = request.observation;
  const player = own(view);
  const opponent = opp(view);
  const meta = item.publicMetadata ?? {};
  const card = item.actorPrinting ?? '';
  const target = item.targetPrinting ?? '';
  const handSize = handSizeOf(view);

  if (!EXECUTABLE.has(item.kind)) return -1;
  if (item.kind === 'pass') return 0;
  if (item.kind === 'attack') return scoreAttack(item, view);

  if (item.kind === 'retreat') {
    if (matches(player.active?.printing ?? '', P.snorlax)) return 0;
    const targetSlot = slots(player).find(row => row.pokemon.printing === target);
    if (targetSlot && matches(targetSlot.pokemon.printing, P.snorlax)) {
      return hasTool(targetSlot.pokemon, P.toolJammer) ? 210 : 165;
    }
    if (targetSlot && matches(targetSlot.pokemon.printing, P.wobbuffet) &&
        source7JetWobbuffetReady(view)) return 150;
    return 10;
  }

  if (item.kind === 'use-stadium') {
    const stadium = card || meta.stadiumPrinting || '';
    if (matches(stadium, P.artazon)) return benchSpace(view) && deckCount(view) > 0 &&
      !allStadiums(view).some(value => matches(value, P.artazon)) ? 165 : 0;
    if (matches(stadium, P.chaoticSwell)) return opponent.stadium.length > 0 &&
      !allStadiums(view).some(value => matches(value, P.chaoticSwell)) ? 175 : 0;
    return 0;
  }

  if (item.kind !== 'play-card') return 0;

  if ([P.snorlax, P.wobbuffet, P.mimikyu, P.regirock, P.electrike, P.girafarig]
    .some(pattern => matches(card, pattern))) return scoreBasicPlay(card, view);

  if (matches(card, P.faba)) {
    if (source7FabaJetNestReady(view)) return 360;
    if (vileplumeLocks(view).length === 0 && supporterAvailable(view) &&
        opponentHasRemovalTarget(view)) return 175;
    return 0;
  }
  if (matches(card, P.jet)) {
    if (matches(target, P.wobbuffet) && source7JetWobbuffetReady(view)) return 350;
    const targetSlot = slots(player).find(row => row.pokemon.printing === target);
    if (targetSlot && matches(targetSlot.pokemon.printing, P.snorlax) &&
        !matches(player.active?.printing ?? '', P.snorlax) &&
        hasTool(targetSlot.pokemon, P.toolJammer) && energyAvailable(view) && !hasTemple(view)) return 230;
    return 0;
  }
  if (matches(card, P.nest)) {
    if (source7NestReady(view)) return 290;
    const missing = [P.snorlax, P.wobbuffet, P.mimikyu, P.regirock, P.girafarig]
      .some(pattern => !boardHas(player, pattern));
    return itemAvailable(view) && benchSpace(view) && deckCount(view) > 0 &&
      missing && vileplumeLocks(view).length === 0 ? 155 : 0;
  }
  if (matches(card, P.megatonBlower)) return itemAvailable(view) && opponentHasRemovalTarget(view) ? 260 : 0;
  if (matches(card, P.fieldBlower)) return itemAvailable(view) && opponentHasRemovalTarget(view) ? 215 : 0;
  if (matches(card, P.toolJammer)) {
    const targetSlot = slots(player).find(row => row.pokemon.printing === target);
    if (!targetSlot || hasTool(targetSlot.pokemon, P.toolJammer)) return 0;
    if (matches(targetSlot.pokemon.printing, P.snorlax)) return targetSlot.zone === 'active' ? 255 : 175;
    return 0;
  }
  if (matches(card, P.enhancedHammer)) return itemAvailable(view) && opponentHasSpecialEnergy(view) ? 155 : 0;
  if (matches(card, P.counterCatcher)) return itemAvailable(view) &&
    ownPrizeCount(view) > opponentPrizeCount(view) && list(opponent.bench).some(Boolean) ? 145 : 0;
  if (matches(card, P.vsSeeker)) return itemAvailable(view) &&
    list(player.discard).some(card => [P.faba, P.teamFlare, P.guzma, P.steven, P.n, P.plumeria]
      .some(pattern => matches(card, pattern))) ? 150 : 65;
  if (matches(card, P.rescueStretcher)) return itemAvailable(view) &&
    list(player.discard).some(card => [P.snorlax, P.wobbuffet, P.mimikyu, P.regirock, P.girafarig, P.electrike]
      .some(pattern => matches(card, pattern))) ? 120 : 0;
  if (matches(card, P.targetWhistle)) return itemAvailable(view) && benchSpace(view) &&
    list(opponent.discard).some(card => /Pokémon|Snorlax|Wobbuffet|Mimikyu|Regirock|Girafarig|Electrike/i.test(textOf(card))) ? 95 : 0;
  if (matches(card, P.robo) || matches(card, P.doll)) return itemAvailable(view) && benchSpace(view) ? 65 : 0;
  if (matches(card, P.captivatingPokePuff) || matches(card, P.palaceBook) ||
      matches(card, P.gladion)) return 0;

  if (matches(card, P.artazon)) return !allStadiums(view).some(value => matches(value, P.artazon)) &&
    benchSpace(view) && deckCount(view) > 0 ? 165 : 0;
  if (matches(card, P.chaoticSwell)) return opponent.stadium.length > 0 &&
    !allStadiums(view).some(value => matches(value, P.chaoticSwell)) ? 175 : 0;
  if (matches(card, P.capture)) return energyAvailable(view) && benchSpace(view) && deckCount(view) > 0 ? 150 : 45;
  if (matches(card, P.recycle)) return energyAvailable(view) ? 70 : 0;

  if (matches(card, P.steven)) return supporterAvailable(view) && handSize <= 3 && deckCount(view) > 3 ? 215 : 0;
  if (matches(card, P.teammates)) return supporterAvailable(view) && handSize <= 4 ? 205 : 0;
  if (matches(card, P.n)) return supporterAvailable(view) &&
    opponentHandCount(view) >= handSize + 3 && handSize <= 5 ? 170 : 0;
  if (matches(card, P.lillie)) return supporterAvailable(view) && handSize <= 3 && deckCount(view) >= 6 ? 165 : 0;
  if (matches(card, P.lusamine)) return supporterAvailable(view) &&
    list(player.discard).some(card => [P.faba, P.teamFlare, P.guzma, P.steven, P.n, P.chaoticSwell, P.artazon]
      .some(pattern => matches(card, pattern))) ? 185 : 0;
  if (matches(card, P.plumeria)) return supporterAvailable(view) && handSize >= 3 && opponentHasEnergy(view) ? 150 : 0;
  if (matches(card, P.teamFlare)) return supporterAvailable(view) && list(opponent.active?.energies).length > 0 ? 155 : 0;
  if (matches(card, P.guzma)) return supporterAvailable(view) &&
    ((!matches(player.active?.printing ?? '', P.snorlax) && boardHas(player, P.snorlax)) ||
      list(opponent.bench).some(Boolean)) ? 185 : 0;
  if (matches(card, P.handiwork)) return supporterAvailable(view) &&
    opponentDeckCount(view) <= 15 && deckCount(view) > 3 ? 145 : 0;
  if (matches(card, P.bellelba)) {
    const oppBench = list(opponent.bench).filter(Boolean).length;
    const ownBench = list(player.bench).filter(Boolean).length;
    return supporterAvailable(view) &&
      (oppBench > 3 && ownBench <= 3 || deckCount(view) >= opponentDeckCount(view) + 3) ? 150 : 0;
  }
  return 0;
}

function handSizeOf(view) { return hand(view).length; }

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

function createPolicy({ role, seat, policyVersion, config }) {
  if (role !== 'opponent' || (seat !== 0 && seat !== 1) ||
      policyVersion !== POLICY_VERSION || !config ||
      Array.isArray(config) || Object.keys(config).length !== 0) {
    throw new Error('AGENT43_RANK7_POLICY_INIT_MISMATCH');
  }
  return Object.freeze({
    decide(request) {
      if (!request || request.role !== 'opponent' || request.seat !== seat ||
          request.observation?.actorSeat !== seat) {
        return { kind: 'abstain', reasonCode: 'ROLE_SEAT_BINDING_MISMATCH' };
      }
      return request.prompt !== null ? promptDecision(request) : bestAction(request);
    }
  });
}

module.exports = {
  POLICY_VERSION, SOURCE_RANK, SOURCE_LIST_BLOB_SHA1, SOURCE_FINGERPRINT_SHA256,
  CANDIDATE_FINGERPRINT_SHA256, ENGINE_PIN, WORKER_PROTOCOL_BLOB_SHA1,
  createPolicy, scoreAction, scoreAttack, promptDecision, bestAction,
  source7FabaJetNestReady, source7JetWobbuffetReady, source7NestReady
};
