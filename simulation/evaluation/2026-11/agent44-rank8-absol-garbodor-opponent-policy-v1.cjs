'use strict';

/*
 * Rank-8 Yusuke Kobayashi Mega Absol ex / Garbodor opponent-policy prototype.
 * Deterministic, actor-view-only, and bound to the exact source 60.
 * Unknown prompts fail closed. This prototype is not a competence attestation.
 */

const POLICY_VERSION = 'agent44-rank8-absol-garbodor-opponent-v1';
const SOURCE_RANK = 8;
const SOURCE_LIST_BLOB_SHA1 = 'ae773f6201d7aa69d31914dbfee66f3fba692200';
const SOURCE_FINGERPRINT_SHA256 = '984c3fdd3c9f6136919640ecd40d2c9215ea25410c5a10b28b2f08a41b355e69';
const CANDIDATE_FINGERPRINT_SHA256 = '1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4';
const ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const WORKER_PROTOCOL_BLOB_SHA1 = 'd51ea95c457d61b50a9ee114d342eb17f4350451';
const WORKER_PROTOCOL_SHA256 = '5405d2c86865e3c423b9b14e6da14c3551c5aba3675dfb6c3c6ddc4cc1450751';

const P = Object.freeze({
  mega: /^Mega Absol ex MEG 86\b/i,
  trubbish: /^Trubbish PAR 116\b/i,
  garbodor: /^Garbodor LTR 68\b/i,
  budew: /^Budew ASC 16\b/i,
  tapuLele: /^Tapu Lele-GX GRI 60\b/i,
  dedenne: /^Dedenne-GX UNB 57\b/i,
  crobat: /^Crobat V DAA 104\b/i,
  squawk: /^Squawkabilly ex PAL 169\b/i,
  quickBall: /^Quick Ball FST 237\b/i,
  ultraBall: /^Ultra Ball MEG 131\b/i,
  darkPatch: /^Dark Patch ASR 139\b/i,
  vsSeeker: /^VS Seeker PHF 109\b/i,
  battleVip: /^Battle VIP Pass FST 225\b/i,
  boostShake: /^Boost Shake EVS 142\b/i,
  secretBox: /^Secret Box TWM 163\b/i,
  floatStone: /^Float Stone BKT 137\b/i,
  muscleBand: /^Muscle Band XY 121\b/i,
  temple: /^Temple of Sinnoh ASR 155\b/i,
  carmine: /^Carmine TWM 145\b/i,
  iono: /^Iono PAL 185\b/i,
  lillie: /^Lillie's Determination MEG 119\b/i,
  roxanne: /^Roxanne ASR 150\b/i,
  wally: /^Wally ROS 94\b/i,
  darkness: /^Darkness Energy MEE 15\b/i,
  lightning: /^Lightning Energy MEE 12\b/i
});

const EXECUTABLE = new Set([
  'play-card', 'attack', 'retreat', 'use-ability', 'use-stadium', 'pass'
]);

function arr(value) { return Array.isArray(value) ? value : []; }
function textOf(value) {
  if (typeof value === 'string') return value;
  if (typeof value?.printing === 'string') return value.printing;
  if (typeof value?.actorPrinting === 'string') return value.actorPrinting;
  if (typeof value?.targetPrinting === 'string') return value.targetPrinting;
  if (typeof value?.label === 'string') return value.label;
  if (typeof value?.publicMetadata?.cardPrinting === 'string') return value.publicMetadata.cardPrinting;
  return '';
}
function is(value, pattern) { return pattern.test(textOf(value)); }
function own(view) { return view?.ownPublic ?? {}; }
function opp(view) { return view?.opponentPublic ?? {}; }
function hand(view) { return arr(view?.ownHand); }
function handSize(view) { return hand(view).length; }
function slots(player) {
  return [
    { zone: 'active', pokemon: player?.active ?? null },
    ...arr(player?.bench).map(pokemon => ({ zone: 'bench', pokemon }))
  ].filter(row => row.pokemon && row.pokemon.concealed !== true);
}
function findSlot(player, pattern) {
  return slots(player).find(row => is(row.pokemon.printing, pattern)) ?? null;
}
function has(player, pattern) { return Boolean(findSlot(player, pattern)); }
function hasHand(view, pattern) { return hand(view).some(card => is(card, pattern)); }
function countHand(view, pattern) { return hand(view).filter(card => is(card, pattern)).length; }
function deckCount(view) {
  return Number.isSafeInteger(own(view).deckCount) ? own(view).deckCount : 99;
}
function oppHandCount(view) {
  return Number.isSafeInteger(opp(view).handCount) ? opp(view).handCount : 0;
}
function supporterAvailable(view) {
  const r = view?.ownTurnResources ?? {};
  const p = own(view).publicTurnRestrictions ?? {};
  return r.supporterPlayedTurn === 0 &&
    r.supporterPlayLocked !== true && p.supporterPlayLocked !== true;
}
function itemAvailable(view) {
  const r = view?.ownTurnResources ?? {};
  const p = own(view).publicTurnRestrictions ?? {};
  return r.itemPlayLocked !== true && p.itemPlayLocked !== true;
}
function hasTool(pokemon) { return arr(pokemon?.tools).length > 0; }
function garbodorLock(view) {
  return slots(own(view)).some(row => is(row.pokemon.printing, P.garbodor) && hasTool(row.pokemon));
}
function liveAbilityCount(player) {
  return slots(player).filter(row => {
    const names = [
      ...arr(row.pokemon.abilities),
      ...arr(row.pokemon.abilityDetails).map(item => item?.name).filter(Boolean)
    ];
    return names.some(name => !arr(row.pokemon.abilitySuppressions).some(
      suppression => suppression?.abilityName === name && suppression?.suppressed === true
    ));
  }).length;
}
function needsGarbodor(view) {
  return !garbodorLock(view) && !has(own(view), P.garbodor) && liveAbilityCount(opp(view)) > 0;
}
function hasDarknessInDiscard(view) {
  return arr(own(view).discard).some(card => is(card, P.darkness));
}
function isBasicEnergy(value) {
  return /^(Basic )?(Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal) Energy\b/i
    .test(textOf(value));
}
function hasOpponentSpecialEnergy(view) {
  return slots(opp(view)).some(row => arr(row.pokemon.energies).some(energy =>
    /Energy\b/i.test(textOf(energy)) && !isBasicEnergy(energy)));
}
function hasOpponentStadium(view) {
  return arr(own(view).stadium).length > 0 || arr(opp(view).stadium).length > 0;
}
function canEvolveTrubbishThisTurn(view) {
  const row = findSlot(own(view), P.trubbish);
  return Boolean(row && (view?.globalTurn === 1 ||
    row.pokemon.lastPlayedOrEvolvedTurn === view?.globalTurn));
}
function safeDiscardScore(card, view) {
  if (is(card, P.battleVip) && view?.globalTurn > 1) return 1000;
  if (is(card, P.quickBall) && countHand(view, P.quickBall) > 1 &&
      (has(own(view), P.mega) || has(own(view), P.trubbish))) return 800;
  if (is(card, P.darkPatch) && countHand(view, P.darkPatch) > 1 &&
      hasDarknessInDiscard(view)) return 750;
  if (is(card, P.vsSeeker) && countHand(view, P.vsSeeker) > 1 &&
      arr(own(view).discard).some(item =>
        /Carmine|Iono|Roxanne|Guzma|Crispin|Wally|Lillie/i.test(textOf(item)))) return 700;
  if (is(card, P.floatStone) && countHand(view, P.floatStone) > 1 &&
      slots(own(view)).every(row => hasTool(row.pokemon))) return 650;
  if (is(card, P.muscleBand) && countHand(view, P.muscleBand) > 1 &&
      (findSlot(own(view), P.mega)?.pokemon.tools ?? []).length > 0) return 600;
  return 0;
}
function safeDiscards(view, count) {
  return hand(view).map((card, index) => ({ card, index, score: safeDiscardScore(card, view) }))
    .filter(row => row.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, count);
}

function scoreAttack(item, view) {
  if (item?.publicMetadata?.attackCostPayable === false) return 0;
  const target = opp(view).active;
  const damage = Number.isFinite(target?.damage) ? target.damage : null;
  const remaining = Number.isFinite(target?.hp) && Number.isFinite(target?.damage) ?
    target.hp - target.damage : null;
  if (item?.attackName === 'Terminal Period') return damage === 60 ? 600 : 0;
  if (item?.attackName === 'Claw of Darkness') {
    if (remaining === null || remaining <= 0) return 220;
    return remaining <= 200 ? 360 : 300;
  }
  if (item?.attackName === 'Sludge Toss') return remaining !== null && remaining <= 60 ? 140 : 80;
  if (item?.attackName === 'Itchy Pollen') {
    return oppHandCount(view) > 0 &&
      opp(view).publicTurnRestrictions?.itemPlayLocked !== true ? 190 : 70;
  }
  return 0;
}

function scoreAbility(item, view) {
  if (garbodorLock(view)) return 0;
  const label = String(item?.label ?? '');
  if (/Squawk and Seize/i.test(label)) {
    return view?.globalTurn <= 1 && handSize(view) >= 3 ? 230 : 0;
  }
  if (/Dedechange/i.test(label)) return handSize(view) <= 3 ? 210 : 0;
  if (/Dark Asset/i.test(label)) return handSize(view) <= 4 ? 200 : 0;
  if (/Wonder Tag/i.test(label)) {
    return !hand(view).some(card =>
      [P.carmine, P.iono, P.lillie, P.roxanne, P.wally].some(pattern => is(card, pattern))
    ) ? 180 : 0;
  }
  // Tapu Koko's two-recipient Energy allocation is deliberately unsupported.
  return 0;
}

function scoreBasic(printing, view) {
  const benchOpen = arr(own(view).bench).includes(null);
  if (is(printing, P.mega)) return has(own(view), P.mega) || !benchOpen ? 0 : 280;
  if (is(printing, P.trubbish)) {
    if (has(own(view), P.trubbish) || has(own(view), P.garbodor) ||
        garbodorLock(view) || !benchOpen) return 0;
    return liveAbilityCount(opp(view)) > 0 ? 340 : 170;
  }
  if (is(printing, P.budew)) {
    if (has(own(view), P.budew) || garbodorLock(view) || !benchOpen) return 0;
    return view?.globalTurn <= 2 && oppHandCount(view) > 0 ? 180 : 70;
  }
  if (garbodorLock(view) || !benchOpen) return 0;
  if (is(printing, P.squawk)) return view?.globalTurn <= 1 && handSize(view) >= 3 ? 170 : 0;
  if (is(printing, P.dedenne)) return handSize(view) <= 3 ? 160 : 0;
  if (is(printing, P.crobat)) return handSize(view) <= 4 ? 155 : 0;
  if (is(printing, P.tapuLele)) {
    return !hand(view).some(card =>
      [P.carmine, P.iono, P.lillie, P.roxanne, P.wally].some(pattern => is(card, pattern))
    ) ? 145 : 60;
  }
  return 0;
}

function scoreAction(item, request) {
  const view = request.observation;
  const player = own(view);
  const card = item.actorPrinting ?? item.publicMetadata?.cardPrinting ?? '';
  const target = item.targetPrinting ?? '';
  if (!EXECUTABLE.has(item.kind)) return -1;
  if (item.kind === 'pass') return 0;
  if (item.kind === 'attack') return scoreAttack(item, view);
  if (item.kind === 'use-ability') return scoreAbility(item, view);
  if (item.kind === 'use-stadium') {
    return is(card, P.temple) &&
      (hasOpponentSpecialEnergy(view) || hasOpponentStadium(view)) ? 210 : 0;
  }
  if (item.kind === 'retreat') {
    if (is(player.active?.printing ?? '', P.mega)) return 0;
    const targetRow = slots(player).find(row => row.pokemon.printing === target);
    if (targetRow && is(targetRow.pokemon.printing, P.mega)) {
      return arr(targetRow.pokemon.energies).length >= 2 ? 150 : 90;
    }
    if (targetRow && is(targetRow.pokemon.printing, P.garbodor) &&
        hasTool(targetRow.pokemon)) return 110;
    return 10;
  }
  if (item.kind !== 'play-card') return 0;
  if ([P.mega, P.trubbish, P.budew, P.dedenne, P.crobat, P.squawk, P.tapuLele]
    .some(pattern => is(card, pattern))) return scoreBasic(card, view);
  if (is(card, P.floatStone)) {
    const row = slots(player).find(slot => slot.pokemon.printing === target);
    if (!row || hasTool(row.pokemon)) return 0;
    if (is(row.pokemon.printing, P.garbodor)) return 460;
    if (is(row.pokemon.printing, P.trubbish) &&
        (hasHand(view, P.boostShake) || hasHand(view, P.wally))) return 350;
    if (is(row.pokemon.printing, P.mega)) return 185;
    return 30;
  }
  if (is(card, P.muscleBand)) {
    const row = slots(player).find(slot => slot.pokemon.printing === target);
    return row && is(row.pokemon.printing, P.mega) && !hasTool(row.pokemon) ? 220 : 0;
  }
  if (is(card, P.darkPatch)) {
    const row = slots(player).find(slot => slot.pokemon.printing === target);
    return row && row.zone === 'bench' && is(row.pokemon.printing, P.mega) &&
      hasDarknessInDiscard(view) ? 330 : 0;
  }
  if (is(card, P.quickBall)) {
    const needsBasic = !has(player, P.trubbish) || !has(player, P.mega);
    return itemAvailable(view) && needsBasic && deckCount(view) > 0 &&
      safeDiscards(view, 1).length === 1 ? 260 : 0;
  }
  if (is(card, P.ultraBall)) {
    const needsPokemon = (has(player, P.trubbish) && !has(player, P.garbodor)) ||
      !has(player, P.mega);
    return itemAvailable(view) && needsPokemon && deckCount(view) > 0 &&
      safeDiscards(view, 2).length === 2 ? 285 : 0;
  }
  if (is(card, P.boostShake)) {
    return itemAvailable(view) && has(player, P.trubbish) && !has(player, P.garbodor) &&
      !hasHand(view, P.wally) ? 320 : 0;
  }
  if (is(card, P.wally)) {
    return supporterAvailable(view) && has(player, P.trubbish) &&
      !has(player, P.garbodor) && canEvolveTrubbishThisTurn(view) ? 420 : 0;
  }
  if (is(card, P.battleVip)) {
    return itemAvailable(view) && view?.globalTurn <= 1 && arr(player.bench).includes(null) ? 250 : 0;
  }
  if (is(card, P.temple)) {
    return hasOpponentSpecialEnergy(view) || hasOpponentStadium(view) ? 200 : 0;
  }
  if (is(card, P.carmine)) {
    return supporterAvailable(view) && view?.globalTurn <= 1 && handSize(view) <= 3 ? 230 : 0;
  }
  if (is(card, P.iono)) {
    return supporterAvailable(view) && oppHandCount(view) >= handSize(view) + 3 &&
      handSize(view) <= 5 ? 210 : 0;
  }
  if (is(card, P.lillie)) {
    return supporterAvailable(view) && own(view).prizeCount === 6 && handSize(view) <= 3 ? 195 : 0;
  }
  if (is(card, P.roxanne)) {
    return supporterAvailable(view) && opp(view).prizeCount <= 3 && handSize(view) <= 5 ? 220 : 0;
  }
  // Secret Box, Tapu Koko, Crispin, Guzma, Field Blower, Adventure Bag,
  // Pokémon Communication and Battle Compressor await verified prompt contracts.
  return 0;
}

function choiceOwner(choice) { return choice?.publicMetadata?.ownerSeat ?? null; }
function choiceZone(choice) {
  return choice?.publicMetadata?.sourceZone ??
    choice?.publicMetadata?.zone ??
    choice?.publicMetadata?.targetZone ?? null;
}
function scoreCardChoice(choice, view, context) {
  const printing = textOf(choice);
  const owner = choiceOwner(choice);
  const zone = choiceZone(choice);
  if (context === 'hand-discard') {
    return owner === 'actor' && zone === 'hand' ? safeDiscardScore(printing, view) : 0;
  }
  if (context === 'claw-discard') {
    if (owner !== 'opponent' || zone !== 'hand') return 0;
    if (is(printing, P.secretBox)) return 1000;
    if ([P.quickBall, P.ultraBall, P.darkPatch, P.vsSeeker, P.boostShake,
      P.carmine, P.iono, P.lillie, P.roxanne].some(pattern => is(printing, pattern))) return 850;
    if ([P.dedenne, P.crobat, P.squawk, P.tapuLele].some(pattern => is(printing, pattern))) return 650;
    if (is(printing, P.darkness) || is(printing, P.lightning)) return 20;
    return 100;
  }
  if (context === 'basic-search' || context === 'pokemon-search') {
    if (owner !== 'actor' || zone !== 'deck') return 0;
    if (is(printing, P.trubbish)) return needsGarbodor(view) ? 520 : !has(own(view), P.trubbish) ? 320 : 0;
    if (is(printing, P.mega)) return !has(own(view), P.mega) ? 500 : 100;
    if (is(printing, P.garbodor)) return has(own(view), P.trubbish) &&
      !has(own(view), P.garbodor) ? 600 : 0;
    if (is(printing, P.budew)) return view?.globalTurn <= 2 && !has(own(view), P.budew) ? 240 : 0;
    if (is(printing, P.dedenne)) return handSize(view) <= 3 ? 140 : 0;
    if (is(printing, P.crobat)) return handSize(view) <= 4 ? 130 : 0;
    return 0;
  }
  if (context === 'evolution-search') {
    return owner === 'actor' && zone === 'deck' && is(printing, P.garbodor) &&
      has(own(view), P.trubbish) && !has(own(view), P.garbodor) ? 600 : 0;
  }
  if (context === 'supporter-search') {
    if (owner !== 'actor' || zone !== 'deck') return 0;
    if (is(printing, P.wally) && has(own(view), P.trubbish) &&
        canEvolveTrubbishThisTurn(view) && !has(own(view), P.garbodor)) return 500;
    if (is(printing, P.carmine) && view?.globalTurn <= 1 && handSize(view) <= 3) return 350;
    if (is(printing, P.iono) && oppHandCount(view) >= handSize(view) + 3) return 300;
    if (is(printing, P.roxanne) && opp(view).prizeCount <= 3) return 280;
    if (is(printing, P.lillie) && own(view).prizeCount === 6 && handSize(view) <= 3) return 260;
    return 0;
  }
  return 0;
}
function scorePokemonChoice(choice, context) {
  const owner = choiceOwner(choice);
  const zone = choiceZone(choice);
  if (owner !== 'actor' || zone !== 'bench') return 0;
  if (context === 'dark-patch-target' && is(choice, P.mega)) return 600;
  if (context === 'evolution-target' && is(choice, P.trubbish)) return 600;
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
  const ranked = arr(choices).map((choice, index) => ({ choice, index, score: scorer(choice) }))
    .filter(row => row.score > 0 && typeof row.choice?.token === 'string')
    .sort((a, b) => b.score - a.score || a.index - b.index);
  return ranked[0] ? { kind: 'select-choice', token: ranked[0].choice.token } :
    { kind: 'abstain', reasonCode };
}
function selectMany(prompt, choices, scorer, min, max, reasonCode) {
  const ranked = arr(choices).map((choice, index) => ({ choice, index, score: scorer(choice) }))
    .filter(row => row.score > 0 && typeof row.choice?.token === 'string')
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, max);
  if (ranked.length < min) return { kind: 'abstain', reasonCode };
  if (!ranked.length) {
    const empty = arr(prompt.choices).find(choice => choice.kind === 'empty-selection');
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
  const choices = arr(prompt?.choices);
  const source = sourceText(prompt);
  const bounds = multiBounds(prompt);
  if (prompt.promptType === 'ChooseCardsPrompt') {
    const handChoices = choices.some(choice =>
      choiceOwner(choice) === 'actor' && choiceZone(choice) === 'hand');
    if (source.includes('quick ball') || source.includes('ultra ball')) {
      if (handChoices) {
        const count = source.includes('ultra ball') ? 2 : 1;
        return bounds ? selectMany(prompt, choices,
          choice => scoreCardChoice(choice, view, 'hand-discard'),
          count, count, 'BALL_COST_HAS_NO_SAFE_DISCARD') :
          count === 1 ? selectOne(choices,
            choice => scoreCardChoice(choice, view, 'hand-discard'),
            'BALL_COST_HAS_NO_SAFE_DISCARD') :
            { kind: 'abstain', reasonCode: 'ULTRA_BALL_COST_BOUNDS_MISSING' };
      }
      return selectOne(choices, choice => scoreCardChoice(choice, view,
        source.includes('quick ball') ? 'basic-search' : 'pokemon-search'),
        'BALL_SEARCH_TARGET_UNAVAILABLE');
    }
    if (source.includes('boost shake') || source.includes('wally')) {
      return selectOne(choices, choice => scoreCardChoice(choice, view, 'evolution-search'),
        'GARBODOR_EVOLUTION_UNAVAILABLE');
    }
    if (source.includes('claw of darkness')) {
      return selectOne(choices, choice => scoreCardChoice(choice, view, 'claw-discard'),
        'CLAW_REVEALED_OPPONENT_CARD_UNAVAILABLE');
    }
    if (source.includes('wonder tag')) {
      return selectOne(choices, choice => scoreCardChoice(choice, view, 'supporter-search'),
        'WONDER_TAG_SUPPORTER_UNAVAILABLE');
    }
    if (source.includes('secret box')) {
      return { kind: 'abstain', reasonCode: 'SECRET_BOX_MULTI_CATEGORY_PROMPT_UNSUPPORTED' };
    }
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_CARD_PROMPT' };
  }
  if (prompt.promptType === 'ChoosePokemonPrompt') {
    if (source.includes('dark patch')) {
      return selectOne(choices, choice => scorePokemonChoice(choice, 'dark-patch-target'),
        'DARK_PATCH_BENCHED_MEGA_ABSOL_UNAVAILABLE');
    }
    if (source.includes('boost shake') || source.includes('wally')) {
      return selectOne(choices, choice => scorePokemonChoice(choice, 'evolution-target'),
        'TRUBBISH_EVOLUTION_TARGET_UNAVAILABLE');
    }
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_POKEMON_PROMPT' };
  }
  if (prompt.promptType === 'SelectPrompt' ||
      prompt.promptType === 'ConfirmPrompt' ||
      prompt.promptType === 'SelectOptionPrompt') {
    const yes = choices.find(choice => /^(yes|true|confirm|use)$/i.test(choice.label ?? ''));
    const no = choices.find(choice => /^(no|false|decline|cancel|skip)$/i.test(choice.label ?? ''));
    if (yes && (
      source.includes('dedechange') && handSize(view) <= 3 ||
      source.includes('dark asset') && handSize(view) <= 4 ||
      source.includes('squawk and seize') && view.globalTurn <= 1 ||
      source.includes('wonder tag') && !hand(view).some(card =>
        [P.carmine, P.iono, P.lillie, P.roxanne, P.wally].some(pattern => is(card, pattern)))
    )) return { kind: 'select-choice', token: yes.token };
    if (no) return { kind: 'select-choice', token: no.token };
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_OPTIONAL_PROMPT' };
  }
  return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
}
function bestAction(request) {
  const items = arr(request.actionFrontier?.items).filter(item => EXECUTABLE.has(item.kind));
  if (!items.length) return { kind: 'abstain', reasonCode: 'NO_EXECUTABLE_ACTION' };
  let best = null;
  let bestScore = 0;
  for (const item of items) {
    const score = scoreAction(item, request);
    if (score > bestScore) { best = item; bestScore = score; }
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
    throw new Error('AGENT44_RANK8_POLICY_INIT_MISMATCH');
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
  WORKER_PROTOCOL_SHA256, createPolicy, scoreAction, scoreAttack, scoreAbility,
  promptDecision, bestAction, safeDiscards
};
