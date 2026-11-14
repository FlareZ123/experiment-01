'use strict';

/*
 * Rank-1 Shadow Rider opponent-role policy prototype.
 *
 * The policy is intentionally deterministic and consumes only the detached
 * actor observation, the current legal action frontier, the actor-visible
 * prompt projection, and the validated public event receipt. Native legality
 * remains the host's responsibility. This is a prototype, not a competence
 * certificate or a matchup result.
 */

const POLICY_VERSION = 'agent6-rank1-shadow-rider-opponent-v1';

const PRINT = Object.freeze({
  psychic: /^Psychic Energy\b/i,
  shadowRiderV: /^Shadow Rider Calyrex V CRE\b/i,
  shadowRiderVmax: /^Shadow Rider Calyrex VMAX CRE\b/i,
  latias: /^Latias ex SSP\b/i,
  trevenant: /^Trevenant & Dusknoir-GX SMP\b/i,
  girafarig: /^Girafarig LOT\b/i,
  dialga: /^Dialga-GX UPR\b/i,
  clefairy: /^Lillie's Clefairy ex JTG\b/i,
  mimikyu: /^Mimikyu GRI\b/i,
  radiantEternatus: /^Radiant Eternatus CRZ\b/i,
  tapuLele: /^Tapu Lele-GX GRI\b/i,
  marshadow: /^Marshadow UNB 81\b/i
});

function matches(value, pattern) {
  return typeof value === 'string' && pattern.test(value);
}

function includes(value, fragment) {
  return typeof value === 'string' &&
    value.toLowerCase().includes(String(fragment).toLowerCase());
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function hasPrinting(values, pattern) {
  return list(values).some(value => matches(value, pattern));
}

function countPrinting(values, pattern) {
  return list(values).filter(value => matches(value, pattern)).length;
}

function boardSlots(player) {
  return [player?.active, ...list(player?.bench)].filter(Boolean);
}

function boardHas(player, pattern) {
  return boardSlots(player).some(slot => matches(slot.printing, pattern));
}

function countBoard(player, pattern) {
  return boardSlots(player).filter(slot => matches(slot.printing, pattern)).length;
}

function knownCardCount(observation, pattern) {
  return countBoard(observation.ownPublic, pattern) +
    countPrinting(observation.ownHand, pattern);
}

function psychicCountInHand(observation) {
  return countPrinting(observation?.ownHand, PRINT.psychic);
}

function hasSupporterInHand(hand) {
  return list(hand).some(card =>
    /Tulip|Raihan|Acerola|Guzma|Teammates|Carmine|Iono|Lillie|N\b|Professor/i.test(card));
}

function psychicCountInDiscard(observation) {
  return countPrinting(observation?.ownPublic?.discard, PRINT.psychic);
}

function psychicCountOnBoard(observation) {
  return boardSlots(observation?.ownPublic).reduce((sum, slot) =>
    sum + countPrinting(slot.energies, PRINT.psychic), 0);
}

function totalEnergyCount(observation) {
  return boardSlots(observation?.ownPublic).reduce((sum, slot) =>
    sum + list(slot.energies).length, 0) +
    boardSlots(observation?.opponentPublic).reduce((sum, slot) =>
      sum + list(slot.energies).length, 0);
}

function priorOpponentTurnKO(request) {
  return request?.publicEventReceipt?.priorOpponentTurnKO?.any === true;
}

function priorPaleMoon(request) {
  return list(request?.publicEventReceipt?.opponentLastTurnAttacks)
    .some(row => row?.attackName === 'Pale Moon-GX' && row?.gxAttack === true);
}

function damagedLatias(player) {
  return boardSlots(player).find(slot =>
    matches(slot.printing, PRINT.latias) && Number(slot.damage) > 0) ?? null;
}

function countBench(player) {
  return list(player?.bench).filter(Boolean).length;
}

function activeTarget(player) {
  return player?.active ?? null;
}

function remainingHp(slot) {
  if (!slot || !Number.isFinite(slot.hp) || !Number.isFinite(slot.damage)) return -1;
  return slot.hp - slot.damage;
}

function prizeLiability(slot) {
  const printing = slot?.printing ?? '';
  if (includes(printing, 'VMAX')) return 3;
  if (/\b(GX|V|ex)\b/i.test(printing) || /-GX\b/i.test(printing)) return 2;
  return 1;
}

function psychicEnergyOn(slot) {
  return countPrinting(slot?.energies, PRINT.psychic);
}

function hasAbility(slot, name) {
  return list(slot?.abilities).some(value => value === name) ||
    list(slot?.abilityDetails).some(ability => ability?.name === name);
}

function abilityActive(slot, name, observation) {
  if (!hasAbility(slot, name)) return false;
  const suppression = list(slot?.abilitySuppressions).find(item =>
    item.abilityName === name);
  if (!suppression || suppression.suppressed !== false) return false;
  if (name === 'Fairy Zone' && pathLockStatus(observation) !== false) return false;
  return true;
}

function fairyZoneActive(observation) {
  return boardSlots(observation.ownPublic).some(slot =>
    abilityActive(slot, 'Fairy Zone', observation));
}

function hasDragonActive(observation) {
  return list(observation?.opponentPublic?.active?.printed?.types).includes('Dragon');
}

function psychicWeaknessMultiplier(request) {
  return hasDragonActive(request.observation) &&
    fairyZoneActive(request.observation) ? 2 : 1;
}

function maxGeistDamage(request) {
  return (10 + 30 * psychicCountOnBoard(request.observation)) *
    psychicWeaknessMultiplier(request);
}

function activeStadiums(observation) {
  return [
    ...list(observation?.ownPublic?.stadium),
    ...list(observation?.opponentPublic?.stadium)
  ];
}

function pathLockStatus(observation) {
  const present = activeStadiums(observation).some(stadium =>
    /Path to the Peak|Silent Lab/i.test(stadium));
  if (!present) return false;
  const epochs = [
    observation?.ownPublic?.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining,
    observation?.opponentPublic?.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining
  ];
  if (epochs.some(value => !Number.isSafeInteger(value) || value < 0)) return null;
  return epochs.some(value => value > 0) ? false : true;
}

function pathLockActive(observation) {
  return pathLockStatus(observation) === true;
}

function copycatTargetAvailable(request) {
  const attacks = list(request?.observation?.opponentPublic?.active?.attacks);
  return attacks.some(attack => attack && attack.name &&
    attack.gxAttack !== true && attack.name !== 'Night Watch');
}

function opponentHasWeakBenchTarget(observation) {
  return list(observation?.opponentPublic?.bench).some(slot =>
    slot && remainingHp(slot) > 0 && remainingHp(slot) <= 150);
}

function scoreAttack(item, request) {
  const observation = request.observation;
  const name = item.attackName ?? '';
  const opponent = activeTarget(observation.opponentPublic);
  const hp = remainingHp(opponent);
  const energies = psychicCountOnBoard(observation);
  const hand = observation.opponentPublic.handCount ?? 0;
  const opponentDiscard = list(observation.opponentPublic.discard);

  const psychicMultiplier = psychicWeaknessMultiplier(request);
  if (name === 'Max Geist') {
    const damage = maxGeistDamage(request);
    return 120 + Math.min(30, energies * 3) + (hp > 0 && damage >= hp ? 30 : 0);
  }
  if (name === 'Night Watch') {
    const damage = 150 * psychicMultiplier;
    return 124 + Math.min(24, hand * 2) + (hp > 0 && damage >= hp ? 20 : 0);
  }
  if (name === 'Pale Moon-GX') {
    const restrictions = opponent?.publicRestrictions ?? {};
    const trapped = restrictions.cannotRetreat === true ||
      restrictions.cannotRetreatNextTurn === true ||
      restrictions.cannotRetreatWhileActive === true;
    const damage = 10 * psychicMultiplier;
    return 110 + (trapped ? 35 : 0) + (hp > 0 && damage >= hp ? 12 : 0);
  }
  if (name === 'Eon Blade') {
    const damage = 200 * psychicMultiplier;
    return 105 + (hp > 0 && damage >= hp ? 30 : 0);
  }
  if (name === 'Get Lost') {
    const valuable = opponentDiscard.filter(card =>
      /Energy|VS Seeker|Raihan|Tulip|Battle Compressor|Night Stretcher/i.test(card)).length;
    return 88 + Math.min(24, valuable * 6);
  }
  if (name === 'Copycat') return copycatTargetAvailable(request) ? 132 : 0;
  if (name === 'Energy Drive') {
    const damage = totalEnergyCount(observation) * 20 * psychicMultiplier;
    return 85 + Math.min(30, totalEnergyCount(observation) * 3) +
      (hp > 0 && damage >= hp ? 18 : 0);
  }
  const printedDamage = Number.parseInt(String(
    list(observation.ownPublic.active?.attacks)
      .find(attack => attack.name === name)?.damage ?? '0'), 10) || 0;
  return 40 + Math.min(80, printedDamage / 2) +
    (hp > 0 && printedDamage >= hp ? 15 : 0);
}

function scoreAction(item, request) {
  const observation = request.observation;
  const hand = list(observation.ownHand);
  const own = observation.ownPublic;
  const opponent = observation.opponentPublic;
  const receiptKO = priorOpponentTurnKO(request);
  const psychicHand = psychicCountInHand(observation);
  const psychicDiscard = psychicCountInDiscard(observation);
  const boardV = countBoard(own, PRINT.shadowRiderV);
  const boardVmax = countBoard(own, PRINT.shadowRiderVmax);
  const supporterAvailable = observation.ownTurnResources.supporterPlayedTurn === 0;
  const paleMoon = priorPaleMoon(request);
  const latias = damagedLatias(own);
  const ownHandCount = hand.length;
  const opponentHandCount = opponent.handCount ?? 0;

  if (item.kind === 'pass') return 0;
  if (item.kind === 'attack') return scoreAttack(item, request);

  if (item.kind === 'use-ability') {
    const ability = item.publicMetadata?.abilityName ?? '';
    if (ability === 'Underworld Door' && psychicHand > 0) return 150;
    if (ability === 'Climactic Gate' && boardV > 0) return 145;
    if (ability === 'Resetting Hole') return pathLockActive(observation) ? 138 : 0;
    if (ability === 'Star Alchemy' &&
        observation.ownTurnResources.vstarUsed === false) return 132;
    if (ability === 'Wonder Tag') {
      return observation.ownTurnResources.supporterPlayedTurn === 0 ? 122 : 65;
    }
    return 20;
  }

  if (item.kind === 'play-card') {
    const card = item.actorPrinting ?? '';

    if (matches(card, PRINT.shadowRiderVmax) &&
        matches(item.targetPrinting ?? '', PRINT.shadowRiderV)) return 148;

    if (includes(card, 'Acerola') && supporterAvailable && paleMoon &&
        latias && matches(own.active?.printing ?? '', PRINT.latias)) return 175;

    if (includes(card, 'Tulip') && supporterAvailable && psychicDiscard >= 2) {
      return 160 + Math.min(9, psychicDiscard * 3);
    }

    if (includes(card, 'Raihan') && supporterAvailable && receiptKO &&
        psychicDiscard > 0) return 155;

    if (includes(card, 'Teammates') && supporterAvailable && receiptKO) return 138;

    if (includes(card, 'Unfair Stamp') &&
        (receiptKO || opponentHandCount >= ownHandCount + 3 ||
          opponent.prizeCount < 6)) return 142;

    if (includes(card, 'Field Blower') && pathLockActive(observation) &&
        boardSlots(own).some(slot => hasAbility(slot, 'Underworld Door'))) return 140;

    if (includes(card, 'Battle Compressor') &&
        (hasPrinting(hand, /Tulip PAR\b/i) || hasPrinting(hand, /VS Seeker PHF\b/i)) &&
        psychicDiscard < 3) return 118;

    if (includes(card, 'Mysterious Treasure') &&
        (boardV < 2 || (copycatTargetAvailable(request) &&
          !boardHas(own, PRINT.mimikyu) && !hasPrinting(hand, PRINT.mimikyu)) ||
          (pathLockActive(observation) && !boardHas(own, PRINT.marshadow) &&
            !hasPrinting(hand, PRINT.marshadow)) ||
          (hasDragonActive(observation) && pathLockStatus(observation) === false &&
            !fairyZoneActive(observation) && !boardHas(own, PRINT.clefairy) && !hasPrinting(hand, PRINT.clefairy))) &&
        hand.length > 1) return 132;

    if (matches(card, PRINT.marshadow) && pathLockActive(observation)) return 138;
    if (matches(card, PRINT.tapuLele) && !hasSupporterInHand(hand) &&
        observation.ownTurnResources.supporterPlayedTurn === 0) return 110;
    if (matches(card, PRINT.clefairy) && hasDragonActive(observation) &&
        pathLockStatus(observation) === false && !fairyZoneActive(observation) &&
        !boardHas(own, PRINT.clefairy)) return 130;
    if (matches(card, PRINT.mimikyu) && copycatTargetAvailable(request) &&
        !boardHas(own, PRINT.mimikyu)) return 118;

    if (includes(card, 'Fog Crystal') &&
        (psychicHand === 0 || boardV < 2 ||
          (hasDragonActive(observation) && pathLockStatus(observation) === false &&
            !fairyZoneActive(observation) && !boardHas(own, PRINT.clefairy) &&
            !hasPrinting(hand, PRINT.clefairy)))) return 108;

    if (includes(card, 'Quick Ball') &&
        (boardV < 2 || (hasDragonActive(observation) && pathLockStatus(observation) === false &&
          !fairyZoneActive(observation) && !boardHas(own, PRINT.clefairy) &&
          !hasPrinting(hand, PRINT.clefairy))) && hand.length > 1) return 102;

    if (includes(card, 'Forest Seal Stone') &&
        observation.ownTurnResources.vstarUsed === false && boardVmax > 0) return 105;

    if (includes(card, 'VS Seeker') &&
        (psychicDiscard >= 2 || receiptKO)) return 100;

    if (includes(card, 'Night Stretcher') &&
        psychicDiscard > 0 && psychicHand === 0) return 96;

    if (includes(card, 'Lillie') && includes(card, 'Determination') &&
        supporterAvailable && ownHandCount <= 4) return 86;

    if (includes(card, 'Iono') && supporterAvailable &&
        (ownHandCount <= 3 || opponentHandCount >= ownHandCount + 3)) return 90;

    if (includes(card, 'Carmine') && supporterAvailable && ownHandCount <= 4) return 82;

    if (includes(card, 'Guzma') && supporterAvailable &&
        opponentHasWeakBenchTarget(observation)) return 92;

    if (includes(card, 'Acerola') && supporterAvailable && latias &&
        remainingHp(latias) <= 120) return 92;

    if (includes(card, 'Sky Field') && countBench(own) >= 5 &&
        hand.some(value => /Pokémon|Calyrex|Latias|Mimikyu|Girafarig/i.test(value))) return 80;

    if (includes(card, 'Dimension Valley') &&
        activeStadiums(observation).length === 0) return 78;

    if (includes(card, 'Float Stone') &&
        boardSlots(own).some(slot => matches(slot.printing, PRINT.latias) &&
          !list(slot.tools).some(tool => includes(tool, 'Float Stone')))) return 76;

    return 0;
  }

  if (item.kind === 'retreat') {
    const targetIndex = item.publicMetadata?.benchIndex;
    const target = Number.isSafeInteger(targetIndex) ? own.bench[targetIndex] : null;
    const active = own.active;
    if (!target || !active) return 5;
    const targetIsAttacker = matches(target.printing, PRINT.shadowRiderVmax) ||
      matches(target.printing, PRINT.latias) ||
      matches(target.printing, PRINT.trevenant) ||
      (matches(target.printing, PRINT.mimikyu) && copycatTargetAvailable(request));
    const activeIsAttacker = matches(active.printing, PRINT.shadowRiderVmax) ||
      matches(active.printing, PRINT.latias) ||
      matches(active.printing, PRINT.trevenant);
    const activeLocked = active.publicRestrictions?.cannotAttackNextTurn === true ||
      active.publicRestrictions?.cannotRetreat === true;
    if (matches(target.printing, PRINT.shadowRiderVmax) &&
        maxGeistDamage(request) >= remainingHp(activeTarget(opponent)) &&
        (!activeIsAttacker || activeLocked)) return 128;
    return targetIsAttacker && (!activeIsAttacker || activeLocked) ? 84 : 8;
  }

  if (item.kind === 'use-stadium') {
    return 45;
  }

  return 0;
}

function bestAction(request) {
  const items = list(request.actionFrontier?.items)
    .filter(item => ['play-card', 'attack', 'retreat', 'use-ability',
      'use-stadium', 'pass'].includes(item.kind));
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

function choicePrinting(choice) {
  return choice?.printing ?? '';
}

function choiceZone(choice) {
  return choice?.publicMetadata?.targetZone ??
    choice?.publicMetadata?.sourceZone ?? '';
}

function choiceOwner(choice) {
  return choice?.publicMetadata?.ownerSeat ?? '';
}

function findVisibleSlot(player, zone, printing) {
  if (!player || typeof printing !== 'string') return null;
  if (zone === 'active' && player.active?.printing === printing) return player.active;
  if (zone === 'bench') {
    return list(player.bench).find(slot => slot?.printing === printing) ?? null;
  }
  return null;
}

function scorePokemonChoice(choice, observation, mode) {
  const meta = choice.publicMetadata ?? {};
  if (meta.ownerSeat !== 'actor') return -1;
  const slot = findVisibleSlot(observation.ownPublic, meta.targetZone, choice.printing);
  if (!slot) return -1;

  if (mode === 'underworld' || mode === 'raihan') {
    const energy = psychicEnergyOn(slot);
    const active = meta.targetZone === 'active';
    const stadiums = activeStadiums(observation);
    if (matches(slot.printing, PRINT.latias) && energy < 2) return 135 - energy * 5;
    if (matches(slot.printing, PRINT.trevenant) && energy < 3) return 125 - energy * 5;
    if (matches(slot.printing, PRINT.girafarig) && energy < 1 &&
        !stadiums.some(stadium => /Dimension Valley/i.test(stadium))) return 115;
    if (matches(slot.printing, PRINT.mimikyu) && energy < 2) return 100 - energy * 5;
    if (matches(slot.printing, PRINT.shadowRiderVmax)) return 95 - energy;
    if (matches(slot.printing, PRINT.shadowRiderV)) return 80 - energy;
    return mode === 'raihan' ? 25 - energy : 20 - energy;
  }

  if (mode === 'promotion') {
    return remainingHp(slot) > 150 ? 1000 - prizeLiability(slot) * 250 + remainingHp(slot) :
      100 - prizeLiability(slot) * 20 + remainingHp(slot);
  }

  if (mode === 'acerola') {
    return Number(slot.damage) > 0 ?
      500 + Number(slot.damage) + (matches(slot.printing, PRINT.latias) ? 100 : 0) : -1;
  }

  if (mode === 'evolution') {
    return matches(slot.printing, PRINT.shadowRiderV) ? 500 : -1;
  }

  return -1;
}

function sortedChoiceTokens(choices, score) {
  return list(choices).map((choice, index) => ({
    choice, index, score: score(choice)
  })).filter(row => row.score >= 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(row => row.choice.token);
}

function cardSearchScore(printing, request, effectName) {
  const observation = request.observation;
  const hand = observation.ownHand;
  const own = observation.ownPublic;
  const opponent = observation.opponentPublic;
  const knownV = knownCardCount(observation, PRINT.shadowRiderV);
  const knownVmax = knownCardCount(observation, PRINT.shadowRiderVmax);
  const psychicHand = psychicCountInHand(observation);
  const psychicDiscard = psychicCountInDiscard(observation);
  const psychicBoard = psychicCountOnBoard(observation);

  if (includes(effectName, 'VS Seeker') || includes(effectName, 'Wonder Tag')) {
    if (includes(printing, 'Acerola') && priorPaleMoon(request) &&
        damagedLatias(own) && matches(own.active?.printing ?? '', PRINT.latias)) return 180;
    if (includes(printing, 'Tulip') && psychicDiscard >= 2 &&
        !hasPrinting(hand, /Tulip PAR\b/i)) return 170;
    if (includes(printing, 'Raihan') && priorOpponentTurnKO(request)) return 160;
    if (includes(printing, 'Unfair Stamp') &&
        (priorOpponentTurnKO(request) ||
          (opponent.handCount ?? 0) >= hand.length + 3)) return 155;
    if (includes(printing, 'Teammates') && priorOpponentTurnKO(request)) return 150;
    if (includes(printing, 'Guzma') && opponentHasWeakBenchTarget(observation)) return 140;
    if ((includes(printing, 'Lillie') || includes(printing, 'Carmine')) &&
        hand.length <= 4) return 125;
    if (includes(printing, 'Iono') && (opponent.handCount ?? 0) >= hand.length + 3) return 130;
    return 20;
  }

  if (matches(printing, PRINT.marshadow) && pathLockActive(observation) &&
      !boardHas(own, PRINT.marshadow) && !hasPrinting(hand, PRINT.marshadow)) return 170;
  if (matches(printing, PRINT.tapuLele) && !hasSupporterInHand(hand) &&
      !boardHas(own, PRINT.tapuLele) && !hasPrinting(hand, PRINT.tapuLele)) return 115;
  if (matches(printing, PRINT.clefairy) && hasDragonActive(observation) &&
      pathLockStatus(observation) === false && !fairyZoneActive(observation) &&
      !boardHas(own, PRINT.clefairy) && !hasPrinting(hand, PRINT.clefairy)) return 160;

  if (includes(effectName, 'Star Alchemy') || includes(effectName, 'Forest Seal Stone')) {
    if (includes(printing, 'Field Blower') && pathLockActive(observation)) return 180;
    if (matches(printing, PRINT.marshadow) && pathLockActive(observation)) return 170;
    if (includes(printing, 'Unfair Stamp') &&
        (priorOpponentTurnKO(request) || (opponent.handCount ?? 0) >= hand.length + 3)) return 170;
    if (includes(printing, 'Tulip') && psychicDiscard >= 2 &&
        !hasPrinting(hand, /Tulip PAR\b/i)) return 160;
    if (includes(printing, 'Mysterious Treasure') && knownV < 2) return 150;
    if (matches(printing, PRINT.shadowRiderVmax) && knownVmax < 2) return 140;
  }

  if (includes(effectName, 'Raihan')) {
    if (matches(printing, PRINT.shadowRiderVmax) && knownVmax < 2) return 160;
    if (matches(printing, PRINT.shadowRiderV) && knownV < 2) return 150;
    if (includes(printing, 'Unfair Stamp') &&
        (priorOpponentTurnKO(request) ||
          (opponent.handCount ?? 0) >= hand.length + 3)) return 145;
    if (includes(printing, 'Mysterious Treasure') && knownV < 2) return 140;
    if (includes(printing, 'Tulip') && psychicDiscard >= 2 &&
        !hasPrinting(hand, /Tulip PAR\b/i)) return 130;
    if (matches(printing, PRINT.psychic)) return 20;
  }

  if (includes(effectName, 'Fog Crystal')) {
    const vInHand = hasPrinting(hand, PRINT.shadowRiderV);
    if (matches(printing, PRINT.shadowRiderV) && knownV < 2 && !vInHand) return 160;
    if (matches(printing, PRINT.psychic) && psychicHand === 0) return 140;
  }

  if (includes(effectName, 'Battle Compressor') &&
      (hasPrinting(hand, /Tulip PAR\b/i) || hasPrinting(hand, /VS Seeker PHF\b/i))) {
    if (matches(printing, PRINT.psychic)) return 165;
    if (includes(printing, 'VS Seeker') || includes(printing, 'Tulip')) return 120;
  }

  if (matches(printing, PRINT.psychic)) {
    if (includes(effectName, 'Tulip')) return 140;
    if (includes(effectName, 'Night Stretcher') && psychicHand === 0) return 135;
    return 80;
  }

  if (matches(printing, PRINT.mimikyu) && copycatTargetAvailable(request) &&
      !boardHas(own, PRINT.mimikyu) && !hasPrinting(hand, PRINT.mimikyu)) {
    return knownV >= 2 ? 135 : 115;
  }
  if (matches(printing, PRINT.shadowRiderV) && knownV < 2) return 130;
  if (matches(printing, PRINT.shadowRiderVmax) && knownVmax < 2) return 125;
  if (matches(printing, PRINT.radiantEternatus) && knownVmax < 2) return 118;
  if (matches(printing, PRINT.trevenant) && psychicBoard < 3) return 110;
  if (matches(printing, PRINT.latias) && !boardHas(own, PRINT.latias) &&
      !hasPrinting(hand, PRINT.latias)) return 105;
  if (matches(printing, PRINT.girafarig) && !boardHas(own, PRINT.girafarig) &&
      !hasPrinting(hand, PRINT.girafarig)) return 92;
  if (matches(printing, PRINT.dialga) && !boardHas(own, PRINT.dialga) &&
      !hasPrinting(hand, PRINT.dialga)) return 80;
  return -1;
}

function getLostChoiceScore(choice) {
  if (choiceOwner(choice) !== 'opponent' ||
      !/discard/i.test(choiceZone(choice))) return -1;
  const printing = choicePrinting(choice);
  if (/Special Charge|Energy Retrieval|Superior Energy Retrieval|Night Stretcher|Ordinary Rod|Super Rod|VS Seeker|Battle Compressor/i.test(printing)) return 150;
  if (/Double Colorless Energy|Double Dragon Energy|Rainbow Energy|Prism Energy|Special Energy/i.test(printing)) return 140;
  if (/Guzma|Raihan|Tulip|Teammates|N|Professor|Iono/i.test(printing)) return 120;
  if (/VMAX|\b-GX\b|\bex\b/i.test(printing)) return 90;
  if (matches(printing, PRINT.psychic)) return 65;
  return 30;
}

function fieldBlowerChoiceScore(choice) {
  if (choiceOwner(choice) !== 'opponent') return -1;
  const printing = choicePrinting(choice);
  if (/Path to the Peak|Silent Lab|Garbotoxin|Garbotoxin Tool/i.test(printing)) return 180;
  if (choiceZone(choice) === 'tool') return 110;
  if (choiceZone(choice) === 'stadium') return 100;
  return -1;
}

function discardChoiceScore(choice, observation) {
  const printing = choicePrinting(choice);
  const hand = observation.ownHand;
  if (matches(printing, PRINT.psychic)) {
    return psychicCountInHand(observation) > 1 ||
      hasPrinting(hand, /Tulip PAR\b/i) ? 10 : -100;
  }
  if (matches(printing, PRINT.shadowRiderVmax) &&
      countPrinting(hand, PRINT.shadowRiderVmax) > 1) return 20;
  if (includes(printing, 'Carmine') || includes(printing, 'Lillie')) return 30;
  if (includes(printing, 'Unfair Stamp') || includes(printing, 'Raihan') ||
      includes(printing, 'Tulip') || includes(printing, 'Acerola')) return -80;
  if (matches(printing, PRINT.shadowRiderV) &&
      countPrinting(hand, PRINT.shadowRiderV) > 1) return 35;
  return 50;
}

function promptDecision(request) {
  const prompt = request.prompt;
  const observation = request.observation;
  const choices = list(prompt.choices);
  const effectName = prompt.source.effectName ?? '';
  const sourcePrinting = prompt.source.sourcePrinting ?? '';
  const effect = effectName + ' ' + sourcePrinting;
  const metadata = prompt.publicMetadata ?? {};
  const selectionType = metadata.selectionType ?? '';
  const min = Number.isSafeInteger(metadata.minimumCount) ? metadata.minimumCount :
    selectionType === 'prize-slots' ? (metadata.requiredCount ?? 1) :
      selectionType === 'card-order' ? (metadata.count ?? 1) : 1;
  const max = Number.isSafeInteger(metadata.maximumCount) ? metadata.maximumCount :
    selectionType === 'energy-payment' ? (metadata.energyCount ?? metadata.count ?? 1) :
      selectionType === 'prize-slots' ? (metadata.requiredCount ?? 1) :
        selectionType === 'card-order' ? (metadata.count ?? 1) : 1;

  if (prompt.promptType === 'ChoosePokemonPrompt' || selectionType === 'pokemon') {
    let mode = '';
    if (includes(effect, 'Underworld Door')) mode = 'underworld';
    else if (includes(effect, 'Raihan')) mode = 'raihan';
    else if (includes(effect, 'Acerola')) mode = 'acerola';
    else if (includes(effect, 'Climactic Gate')) mode = 'evolution';
    else if (prompt.source.sourceKind === 'engine' && observation.ownPublic.active === null) mode = 'promotion';
    else if (includes(effect, 'Guzma')) {
      const candidates = choices.filter(choice =>
        choice.kind === 'pokemon' && choiceOwner(choice) === 'opponent');
      const scored = candidates.map((choice, index) => {
        const slot = findVisibleSlot(observation.opponentPublic,
          choiceZone(choice), choice.printing);
        const score = slot ? (500 - Math.max(0, remainingHp(slot)) +
          prizeLiability(slot) * 40) : -1;
        return { choice, index, score };
      }).filter(row => row.score >= 0)
        .sort((a, b) => b.score - a.score || a.index - b.index);
      if (scored.length > 0 && min <= 1 && max >= 1) {
        return { kind: 'select-choices', tokens: [scored[0].choice.token] };
      }
      if (min === 0) {
        const empty = choices.find(choice => choice.kind === 'empty-selection');
        if (empty) return { kind: 'select-choice', token: empty.token };
      }
    }

    if (mode === 'evolution') {
      const tokens = choices.filter(choice =>
        choice.kind === 'pokemon' && matches(choice.printing, PRINT.shadowRiderVmax))
        .slice(0, Math.min(max, choices.length)).map(choice => choice.token);
      if (tokens.length >= min && tokens.length > 0) {
        return { kind: 'select-choices', tokens };
      }
      if (min === 0) {
        const empty = choices.find(choice => choice.kind === 'empty-selection');
        if (empty) return { kind: 'select-choice', token: empty.token };
      }
    }
    if (mode && mode !== 'evolution') {
      const tokens = sortedChoiceTokens(choices.filter(choice => choice.kind === 'pokemon'),
        choice => scorePokemonChoice(choice, observation, mode)).slice(0, Math.max(1, max));
      if (tokens.length >= min && tokens.length > 0) {
        return { kind: 'select-choices', tokens };
      }
      if (min === 0) {
        const empty = choices.find(choice => choice.kind === 'empty-selection');
        if (empty) return { kind: 'select-choice', token: empty.token };
      }
    }
  }

  if (selectionType === 'card-combination' || selectionType === 'pokemon' ||
      selectionType === 'energy-payment' || selectionType === 'prize-slots' ||
      selectionType === 'card-order') {
    if (selectionType === 'card-combination') {
      const knownSearchEffect = [
        'Tulip', 'Mysterious Treasure', 'Raihan', 'Fog Crystal',
        'Night Stretcher', 'Battle Compressor', 'Teammates', 'VS Seeker',
        'Quick Ball', 'Forest Seal Stone', 'Hisuian Heavy Ball', 'Climactic Gate',
        'Field Blower', 'Get Lost', 'Wonder Tag', 'Star Alchemy'
      ].some(name => includes(effect, name));
      if (!knownSearchEffect) {
        return { kind: 'abstain', reasonCode: 'UNSUPPORTED_CARD_COMBINATION_SOURCE' };
      }
      const cardChoices = choices.filter(choice => choice.kind === 'card');
      let scored;
      if (includes(effect, 'Mysterious Treasure') &&
          cardChoices.some(choice => choiceZone(choice) === 'hand')) {
        scored = sortedChoiceTokens(cardChoices,
          choice => discardChoiceScore(choice, observation));
      } else if (includes(effect, 'Field Blower')) {
        scored = sortedChoiceTokens(cardChoices, fieldBlowerChoiceScore);
      } else if (includes(effect, 'Get Lost')) {
        scored = sortedChoiceTokens(cardChoices, getLostChoiceScore);
      } else {
        scored = sortedChoiceTokens(cardChoices, choice =>
          cardSearchScore(choicePrinting(choice), request, effect));
      }
      let tokens = scored.slice(0, Math.min(max, scored.length));
      if (tokens.length < min && includes(effect, 'Mysterious Treasure') &&
          choices.some(choice => choiceZone(choice) === 'hand')) {
        tokens = cardChoices.slice(0, min).map(choice => choice.token);
      }
      if (tokens.length >= min && tokens.length > 0) {
        return { kind: 'select-choices', tokens };
      }
      if (min === 0) {
        const empty = choices.find(choice => choice.kind === 'empty-selection');
        if (empty) return { kind: 'select-choice', token: empty.token };
      }
      return { kind: 'abstain', reasonCode: 'NO_SUPPORTED_CARD_SELECTION' };
    }

    if (selectionType === 'pokemon') {
      if (min === 0) {
        const empty = choices.find(choice => choice.kind === 'empty-selection');
        if (empty) return { kind: 'select-choice', token: empty.token };
      }
      return { kind: 'abstain', reasonCode: 'UNCLASSIFIED_POKEMON_PROMPT' };
    }

    if (selectionType === 'energy-payment') {
      const required = typeof metadata.energyType === 'string' ?
        Math.max(min, metadata.energyType.split(',').filter(Boolean).length) : min;
      if (required > max) return { kind: 'abstain', reasonCode: 'ENERGY_COST_EXCEEDS_VISIBLE_CHOICES' };
      const energyChoices = choices.filter(choice => choice.kind === 'energy');
      const tokens = energyChoices
        .slice(0, Math.min(required, max, energyChoices.length)).map(choice => choice.token);
      if (tokens.length === required && tokens.length >= min && tokens.length > 0) {
        return { kind: 'select-choices', tokens };
      }
      return { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ENERGY_PAYMENT' };
    }

    if (selectionType === 'prize-slots') {
      const prizeChoices = choices.filter(choice => choice.kind === 'prize');
      const tokens = prizeChoices
        .slice(0, Math.max(min, metadata.requiredCount ?? min))
        .map(choice => choice.token);
      if (tokens.length >= min && tokens.length > 0) {
        return { kind: 'select-choices', tokens };
      }
      if (min === 0) {
        const empty = choices.find(choice => choice.kind === 'empty-selection');
        if (empty) return { kind: 'select-choice', token: empty.token };
      }
      return { kind: 'abstain', reasonCode: 'NO_SUPPORTED_PRIZE_SELECTION' };
    }

    if (selectionType === 'card-order') {
      const orderChoices = choices.filter(choice => choice.kind === 'card-order-item');
      const tokens = sortedChoiceTokens(orderChoices, choice =>
        cardSearchScore(choicePrinting(choice), request, effect))
        .slice(0, Math.min(max, orderChoices.length));
      if (tokens.length >= min && tokens.length > 0) {
        return { kind: 'select-choices', tokens };
      }
      if (min === 0) {
        const empty = choices.find(choice => choice.kind === 'empty-selection');
        if (empty) return { kind: 'select-choice', token: empty.token };
      }
      return { kind: 'abstain', reasonCode: 'NO_SUPPORTED_CARD_ORDER' };
    }
  }

  if (prompt.promptType === 'ChoosePrizePrompt') {
    const choice = choices.filter(row => row.kind === 'prize')
      .sort((a, b) =>
        (a.publicMetadata?.choiceIndex ?? 0) - (b.publicMetadata?.choiceIndex ?? 0))[0];
    return choice ? { kind: 'select-choice', token: choice.token } :
      { kind: 'abstain', reasonCode: 'NO_VISIBLE_PRIZE_SLOT' };
  }

  if (prompt.promptType === 'ChooseAttackPrompt') {
    if (!includes(effect, 'Copycat')) {
      return { kind: 'abstain', reasonCode: 'UNSUPPORTED_ATTACK_CHOICE_SOURCE' };
    }
    const choice = choices.slice().sort((a, b) => {
      const aName = a.publicMetadata?.sourceAttack ?? a.label ?? '';
      const bName = b.publicMetadata?.sourceAttack ?? b.label ?? '';
      const aScore = aName === 'Night Watch' ? -100 :
        aName === 'Max Geist' ? 100 : aName === 'Eon Blade' ? 90 : 50;
      const bScore = bName === 'Night Watch' ? -100 :
        bName === 'Max Geist' ? 100 : bName === 'Eon Blade' ? 90 : 50;
      return bScore - aScore;
    })[0];
    return choice ? { kind: 'select-choice', token: choice.token } :
      { kind: 'abstain', reasonCode: 'NO_COPY_ATTACK_CHOICE' };
  }

  if (prompt.promptType === 'ConfirmPrompt' ||
      prompt.promptType === 'SelectPrompt' ||
      prompt.promptType === 'SelectOptionPrompt') {
    const confirmable = [
      'Climactic Gate', 'Underworld Door', 'Star Alchemy', 'Forest Seal Stone',
      'Wonder Tag', 'Skyliner', 'Pale Moon-GX'
    ].some(name => includes(effect, name));
    if (!confirmable) {
      return { kind: 'abstain', reasonCode: 'UNSUPPORTED_CONFIRMATION_SOURCE' };
    }
    const yes = choices.find(choice =>
      /^(yes|true|confirm)$/i.test(choice.label ?? ''));
    if (yes) return { kind: 'select-choice', token: yes.token };
    const safe = choices.find(choice => choice.kind === 'option' && choice.label);
    return safe ? { kind: 'select-choice', token: safe.token } :
      { kind: 'abstain', reasonCode: 'UNRECOGNIZED_SIMPLE_PROMPT' };
  }

  return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
}

function createPolicy({ role, seat, policyVersion, config }) {
  if (role !== 'opponent' || (seat !== 0 && seat !== 1) ||
      policyVersion !== POLICY_VERSION || !config ||
      Object.keys(config).length !== 0) {
    throw new Error('AGENT6_POLICY_INIT_MISMATCH');
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

module.exports = { POLICY_VERSION, createPolicy };
