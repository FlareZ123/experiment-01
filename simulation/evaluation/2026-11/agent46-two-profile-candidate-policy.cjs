'use strict';

/*
 * Agent46 candidate-only policy v1.
 *
 * This module is deliberately a pure worker bundle: it has no imports, engine
 * objects, native actions, Store access, filesystem/network access,
 * hidden deck/Prize identities, physical seed, or policy RNG. Every executable
 * choice is an opaque token copied from the current host-projected frontier.
 * Unknown prompt provenance or actor-visible state fails closed.
 */

const POLICY_VERSION = 'agent46-two-profile-v1';
const PROFILE_SCHEMA = 'agent46-candidate-profile-v1';
const PROFILE_DECKS = Object.freeze({
  'hood-shield-shadow-rider-v1': '1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924',
  'lockbridge-shadow-rider-v1': '011cb8481b473c8566935d6835fc9a2a5762e4f09349f23c8284ec19b0cac642'
});
function isCandidateProfile(config) {
  return !!config && typeof config === 'object' && !Array.isArray(config) &&
    Object.keys(config).sort().join(',') === 'deckSha256,profileId,schema' &&
    config.schema === PROFILE_SCHEMA &&
    typeof config.profileId === 'string' &&
    Object.prototype.hasOwnProperty.call(PROFILE_DECKS, config.profileId) &&
    config.deckSha256 === PROFILE_DECKS[config.profileId];
}

let activePolicyAudit = null;

function createPolicyAuditContext(request) {
  const source = request?.prompt ? request.prompt.choices : request?.actionFrontier?.items;
  const evaluations = Array.isArray(source) ? source.map(item => ({
    token: item.token,
    status: 'not-evaluated',
    score: null,
    reasonCode: 'NOT_EVALUATED_BY_SELECTED_BRANCH'
  })) : [];
  return {
    policyVersion: POLICY_VERSION,
    decisionKind: request?.observation?.decisionKind ?? 'unknown',
    selectionRuleCode: 'POLICY_BRANCH_NOT_SET',
    tieBreakCode: 'NONE',
    evaluations,
    byToken: new Map(evaluations.map(row => [row.token, row]))
  };
}

function setPolicyAuditRule(selectionRuleCode, tieBreakCode = 'NONE') {
  if (!activePolicyAudit) return;
  activePolicyAudit.selectionRuleCode = selectionRuleCode;
  activePolicyAudit.tieBreakCode = tieBreakCode;
}

function recordPolicyAuditScore(token, score, reasonCode = 'NO_SCORING_BRANCH', components = null) {
  if (!activePolicyAudit) return;
  const row = activePolicyAudit.byToken.get(token);
  if (!row) return;
  if (Number.isFinite(score)) {
    row.status = 'scored';
    row.score = score;
    row.reasonCode = null;
  } else {
    row.status = 'not-evaluated';
    row.score = null;
    row.reasonCode = reasonCode;
  }
  if (Array.isArray(components)) {
    row.componentScores = components.map(component => ({
      name: component.name,
      score: Number.isFinite(component.score) ? component.score : null,
      reasonCode: Number.isFinite(component.score) ? null : 'NO_MATCHING_SCORE_BRANCH'
    }));
  }
}

function recordPolicyAuditUnscored(token, reasonCode) {
  if (!activePolicyAudit) return;
  const row = activePolicyAudit.byToken.get(token);
  if (!row || row.status === 'scored') return;
  row.status = 'not-evaluated';
  row.score = null;
  row.reasonCode = reasonCode;
}

function recordPolicyAuditRule(token, reasonCode = 'RULE_SELECTED') {
  if (!activePolicyAudit) return;
  const row = activePolicyAudit.byToken.get(token);
  if (!row || row.status === 'scored') return;
  row.status = 'rule-selected';
  row.score = null;
  row.reasonCode = reasonCode;
}

function finishPolicyAudit(decision) {
  const selectedTokens = decision.kind === 'select-action' || decision.kind === 'select-choice'
    ? [decision.token]
    : decision.kind === 'select-choices' ? decision.tokens.slice() : [];
  if (decision.kind === 'abstain') {
    activePolicyAudit.selectionRuleCode = 'ABSTAIN_POLICY_DECISION';
    activePolicyAudit.tieBreakCode = 'NONE';
  } else if (activePolicyAudit.selectionRuleCode === 'POLICY_BRANCH_NOT_SET') {
    activePolicyAudit.selectionRuleCode = 'POLICY_SELECTED_BY_BRANCH';
  }
  for (const token of selectedTokens) {
    const row = activePolicyAudit.byToken.get(token);
    if (row && row.status === 'not-evaluated') {
      row.status = 'rule-selected';
      row.score = null;
      if (row.reasonCode === 'NOT_EVALUATED_BY_SELECTED_BRANCH') {
        row.reasonCode = 'SELECTED_BY_POLICY_RULE';
      }
    }
  }
  return {
    schema: 'agent6-policy-audit-v1',
    policyVersion: activePolicyAudit.policyVersion,
    decisionKind: activePolicyAudit.decisionKind,
    decisionType: decision.kind,
    selectionRuleCode: activePolicyAudit.selectionRuleCode,
    tieBreakCode: activePolicyAudit.tieBreakCode,
    selectedTokens,
    evaluations: activePolicyAudit.evaluations.map(row => ({
      token: row.token,
      status: row.status,
      score: row.score,
      reasonCode: row.reasonCode,
      ...(row.componentScores ? { componentScores: row.componentScores } : {})
    }))
  };
}

const P = Object.freeze({
  SHADOW_RIDER_V: 'Shadow Rider Calyrex V CRE',
  SHADOW_RIDER_VMAX: 'Shadow Rider Calyrex VMAX CRE',
  MIMIKYU: 'Mimikyu GRI',
  CLEFAIRY: "Lillie's Clefairy ex JTG",
  LATIAS: 'Latias ex SSP',
  DIALGA: 'Dialga-GX UPR',
  RADIANT_ETERNATUS: 'Radiant Eternatus CRZ',
  TREVENANT_DUSKNOIR: 'Trevenant & Dusknoir-GX UNM'
});

const CORE_PRINTINGS = Object.freeze([
  P.SHADOW_RIDER_V, P.SHADOW_RIDER_VMAX, P.MIMIKYU, P.CLEFAIRY,
  P.LATIAS, P.DIALGA, P.RADIANT_ETERNATUS, P.TREVENANT_DUSKNOIR
]);

const TOOL_NAMES = Object.freeze([
  'Stealthy Hood', 'Float Stone', 'Forest Seal Stone', 'Choice Belt',
  'Muscle Band', 'Big Charm', 'Air Balloon', 'Tool Jammer'
]);

const ITEM_NAMES = Object.freeze([
  'Fog Crystal', 'Mysterious Treasure', 'Quick Ball', 'Ultra Ball',
  'Battle Compressor', 'Hisuian Heavy Ball', 'VS Seeker', 'Field Blower',
  'Unfair Stamp', 'Computer Search', 'Battle VIP Pass', 'Night Stretcher'
]);

function abstain(reasonCode) {
  return { kind: 'abstain', reasonCode };
}

function isText(value) {
  return typeof value === 'string' && value.length > 0;
}

function hasName(value, name) {
  return isText(value) && value.includes(name);
}

function hasAnyName(value, names) {
  return names.some(name => hasName(value, name));
}

function ownBoard(view) {
  return [view.ownPublic.active, ...view.ownPublic.bench].filter(Boolean);
}

function opponentBoard(view) {
  return [view.opponentPublic.active, ...view.opponentPublic.bench].filter(Boolean);
}

function allBoard(view) {
  return [...ownBoard(view), ...opponentBoard(view)];
}

function boardHas(view, name) {
  return ownBoard(view).some(slot => hasName(slot.printing, name));
}

function isBasicShadowRiderVPrinting(printing) {
  return hasName(printing, 'Shadow Rider Calyrex V') &&
    !hasName(printing, 'Shadow Rider Calyrex VMAX');
}

function isBasicShadowRiderV(slot) {
  return isBasicShadowRiderVPrinting(slot?.printing) &&
    !(slot?.printed?.subtypes ?? []).includes('VMAX');
}

function isShadowRiderVmax(slot) {
  return hasName(slot?.printing, 'Shadow Rider Calyrex VMAX');
}

function hasBasicShadowRiderV(view) {
  return ownBoard(view).some(isBasicShadowRiderV);
}

function handHasBasicShadowRiderV(view) {
  return view.ownHand.some(isBasicShadowRiderVPrinting);
}

function hasUnevolvedShadowRiderV(view) {
  return ownBoard(view).some(isBasicShadowRiderV);
}

function effectiveBenchCapacity(view) {
  const ownStadium = Array.isArray(view.ownPublic?.stadium) ? view.ownPublic.stadium : [];
  const opponentStadium = Array.isArray(view.opponentPublic?.stadium) ? view.opponentPublic.stadium : [];
  const ownParallelCity = ownStadium.some(name => hasName(name, 'Parallel City'));
  const opponentParallelCity = opponentStadium.some(name => hasName(name, 'Parallel City'));
  const allStadiums = [...ownStadium, ...opponentStadium];
  const hasSkyField = allStadiums.some(name => hasName(name, 'Sky Field'));
  const hasParallelCity = ownParallelCity || opponentParallelCity;
  if (!hasSkyField && !hasParallelCity) return 5;
  const effectsLive = stadiumAndToolEffectsLive(view);
  if (effectsLive === null) return null;
  if (effectsLive === false) return 5;
  if (hasSkyField && hasParallelCity) return null;
  if (hasSkyField) return 8;
  if (ownParallelCity && opponentParallelCity) return null;
  if (ownParallelCity && !['up', 'down'].includes(view.ownPublic.stadiumDirection)) return null;
  if (opponentParallelCity && !['up', 'down'].includes(view.opponentPublic.stadiumDirection)) return null;
  return parallelCityLimitsActor(view) ? 3 : 5;
}
function openBenchSlots(view) {
  const bench = view.ownPublic?.bench;
  const capacity = effectiveBenchCapacity(view);
  if (!Array.isArray(bench) || !Number.isSafeInteger(capacity)) return null;
  return Math.max(0, capacity - bench.filter(Boolean).length);
}

function hasOpenBench(view) {
  const open = openBenchSlots(view);
  return open !== null && open > 0;
}

function handHas(view, name) {
  return view.ownHand.some(printing => hasName(printing, name));
}

function discardHas(view, name) {
  return view.ownPublic.discard.some(printing => hasName(printing, name));
}

function opponentHasRegidrago(view) {
  return opponentBoard(view).some(slot => hasName(slot.printing, 'Regidrago'));
}

function opponentHasDragon(view) {
  return opponentBoard(view).some(slot =>
    Array.isArray(slot.printed?.types) && slot.printed.types.includes('Dragon'));
}

function isDragon(slot) {
  return Boolean(slot && (
    slot.printed?.types?.includes('Dragon') ||
    hasName(slot.printing, 'Regidrago')
  ));
}

function abilityStatus(slot, abilityName) {
  if (!slot || !Array.isArray(slot.abilities) ||
      !slot.abilities.includes(abilityName)) return false;
  if (!Array.isArray(slot.abilitySuppressions)) return null;
  const row = slot.abilitySuppressions.find(item => item.abilityName === abilityName);
  if (!row || row.suppressed === null) return null;
  return row.suppressed === false;
}

function boardAbilityStatus(view, abilityName) {
  const holders = ownBoard(view).filter(slot =>
    Array.isArray(slot.abilities) && slot.abilities.includes(abilityName));
  if (holders.length === 0) return false;
  if (holders.some(slot => abilityStatus(slot, abilityName) === true)) return true;
  if (holders.some(slot => abilityStatus(slot, abilityName) === null)) return null;
  return false;
}

function isBasicPokemon(slot) {
  return (slot?.printed?.subtypes ?? []).includes('Basic');
}

function isFuturePokemon(slot) {
  const labels = [
    ...(slot?.printed?.subtypes ?? []),
    ...(slot?.printed?.types ?? [])
  ].map(value => String(value).toLowerCase());
  return labels.includes('future');
}

function isRuleBoxPokemon(slot) {
  const subtypes = (slot?.printed?.subtypes ?? []).map(value =>
    String(value).toUpperCase());
  return subtypes.some(value =>
    ['EX', 'GX', 'V', 'VMAX', 'VSTAR', 'V-UNION', 'TAG TEAM', 'RADIANT'].includes(value));
}

function fairyZoneLockSources(view) {
  const sources = [];
  const add = (seat, zone, slot, cardName, abilityName, scope) => {
    if (!slot || !hasName(slot.printing, cardName) ||
        !Array.isArray(slot.abilities) || !slot.abilities.includes(abilityName)) return;
    if (cardName === 'Garbodor' &&
        (!Array.isArray(slot.tools) || slot.tools.length === 0)) return;
    sources.push({
      seat, zone, slot, cardName, abilityName, scope,
      status: abilityStatus(slot, abilityName),
      // Zero is Twinleaf's "no established Active locker" sentinel.
      activationOrder: Number.isSafeInteger(slot.abilityLockActivationOrder) &&
        slot.abilityLockActivationOrder > 0
          ? slot.abilityLockActivationOrder : null
    });
  };

  for (const [seat, player] of [
    ['actor', view.ownPublic], ['opponent', view.opponentPublic]
  ]) {
    const active = player.active;
    add(seat, 'active', active, 'Klefki', 'Mischievous Lock', 'active-basic-both');
    add(seat, 'active', active, 'Iron Thorns ex', 'Initialization', 'active-rulebox-both');
    add(seat, 'active', active, 'Flutter Mane', 'Midnight Fluttering', 'active-opponent-active');
    add(seat, 'active', active, 'Galarian Weezing', 'Neutralizing Gas', 'active-opponent-all');
    add(seat, 'active', active, 'Slaking', 'Lazy', 'active-opponent-all');
    add(seat, 'active', active, 'Wobbuffet', 'Bide Barricade', 'active-non-psychic');

    for (const slot of [player.active, ...(player.bench ?? [])].filter(Boolean)) {
      const zone = slot === player.active ? 'active' : 'bench';
      add(seat, zone, slot, 'Alolan Muk', 'Power of Alchemy', 'basic-all');
      add(seat, zone, slot, 'Garbodor', 'Garbotoxin', 'all-tool-attached');
    }
  }
  return sources;
}

function fairyZoneSourceTargetsHolder(view, source, holderSeat, holder) {
  const sameSide = source.seat === holderSeat;
  const holderPlayer = holderSeat === 'actor'
    ? view.ownPublic : view.opponentPublic;
  switch (source.scope) {
    case 'active-basic-both':
      return source.zone === 'active' && isBasicPokemon(holder);
    case 'active-rulebox-both':
      return source.zone === 'active' && isRuleBoxPokemon(holder) &&
        !isFuturePokemon(holder);
    case 'active-opponent-active':
      return source.zone === 'active' && !sameSide &&
        holderPlayer.active === holder;
    case 'active-opponent-all':
      return source.zone === 'active' && !sameSide;
    case 'active-non-psychic':
      return source.zone === 'active' &&
        !(holder.printed?.types ?? []).includes('Psychic');
    case 'basic-all':
      return !sameSide && isBasicPokemon(holder);
    case 'all-tool-attached':
      // Garbotoxin suppresses every Pokémon in play, including Rule Box Pokémon.
      return true;
    default:
      return false;
  }
}

function abilityLockSourceStadiumSuppression(source, view) {
  const stadiums = [...view.ownPublic.stadium, ...view.opponentPublic.stadium];
  const pathToPeak = stadiums.some(name => hasName(name, 'Path to the Peak'));
  const silentLab = stadiums.some(name => hasName(name, 'Silent Lab'));
  const affectedByPath = pathToPeak && isRuleBoxPokemon(source.slot);
  const affectedBySilentLab = silentLab && isBasicPokemon(source.slot);
  if (!affectedByPath && !affectedBySilentLab) return false;

  const effectsLive = stadiumAndToolEffectsLive(view);
  if (effectsLive === null) return null;
  return effectsLive === true;
}

function abilityLockSourcePhysicalSeat(source, view) {
  return source.seat === 'actor' ? view.actorSeat : 1 - view.actorSeat;
}

function orderAbilityLockSources(sources, view) {
  if (sources.length <= 1) return sources;
  if (sources.some(source => !Number.isSafeInteger(source.activationOrder) ||
      source.activationOrder <= 0)) return null;

  const groups = new Map();
  for (const source of sources) {
    const group = groups.get(source.activationOrder) ?? [];
    group.push(source);
    groups.set(source.activationOrder, group);
  }

  const ordered = [];
  for (const order of [...groups.keys()].sort((a, b) => a - b)) {
    const group = groups.get(order);
    if (group.length === 1) {
      ordered.push(group[0]);
      continue;
    }
    const seats = group.map(source => abilityLockSourcePhysicalSeat(source, view));
    // Twinleaf resolves simultaneous starting Active lockers in favor of
    // the current turn player. Same-seat or otherwise ambiguous ties fail closed.
    if (group.length !== 2 || seats[0] === seats[1] ||
        (view.turnSeat !== seats[0] && view.turnSeat !== seats[1])) return null;
    ordered.push(group.find(source =>
      abilityLockSourcePhysicalSeat(source, view) === view.turnSeat));
    ordered.push(group.find(source =>
      abilityLockSourcePhysicalSeat(source, view) !== view.turnSeat));
  }
  return ordered;
}

function abilityLockSourceSuppressesTarget(source, targetSeat, target, view) {
  if (source.slot === target) return false;
  if (!fairyZoneSourceTargetsHolder(view, source, targetSeat, target)) return false;
  const sameAbilityExceptions = [
    'Mischievous Lock', 'Neutralizing Gas', 'Lazy',
    'Garbotoxin', 'Midnight Fluttering'
  ];
  if (sameAbilityExceptions.includes(source.abilityName) &&
      Array.isArray(target.abilities) &&
      target.abilities.includes(source.abilityName)) return false;
  if (source.seat !== targetSeat) {
    const hood = hasEffectiveStealthyHood(target, view, targetSeat);
    if (hood === true) return false;
    if (hood === null) return null;
  }
  return true;
}
function resolveAbilityLockSources(view) {
  const sources = fairyZoneLockSources(view).filter(source => source.status !== false);
  if (sources.length === 0) return { active: [], unknown: false };

  const hasUnknownStatus = sources.some(source => source.status === null);
  if (!hasUnknownStatus) {
    return { active: sources.filter(source => source.status === true), unknown: false };
  }

  if (sources.length === 1) {
    const stadium = abilityLockSourceStadiumSuppression(sources[0], view);
    if (stadium === true) return { active: [], unknown: false };
    if (stadium === null) return { active: [], unknown: true };
    return { active: [sources[0]], unknown: false };
  }

  const ordered = orderAbilityLockSources(sources, view);
  if (!ordered) return { active: [], unknown: true };

  const active = [];
  for (const source of ordered) {
    if (source.status === true) {
      active.push(source);
      continue;
    }

    const stadium = abilityLockSourceStadiumSuppression(source, view);
    if (stadium === true) continue;
    if (stadium === null) return { active, unknown: true };

    let definitelySuppressed = false;
    let uncertain = false;
    for (const earlier of active) {
      const suppresses = abilityLockSourceSuppressesTarget(
        earlier, source.seat, source.slot, view);
      if (suppresses === true) {
        definitelySuppressed = true;
        break;
      }
      if (suppresses === null) uncertain = true;
    }
    if (definitelySuppressed) continue;
    if (uncertain) return { active, unknown: true };
    active.push(source);
  }
  return { active, unknown: false };
}

function viewAfterRemovingAbilityStadiums(view) {
  const cloneSlot = slot => {
    if (!slot) return slot;
    const suppressions = Array.isArray(slot.abilitySuppressions)
      ? slot.abilitySuppressions.filter(row => {
          const source = row.sourcePrinting ?? row.sourceName ?? '';
          const reason = String(row.reasonCode ?? '').toUpperCase();
          return !hasName(source, 'Path to the Peak') &&
            !hasName(source, 'Silent Lab') &&
            !reason.includes('PATH_TO_THE_PEAK') &&
            !reason.includes('SILENT_LAB');
        })
      : slot.abilitySuppressions;
    return { ...slot, abilitySuppressions: suppressions };
  };
  const clonePlayer = player => ({
    ...player, stadium: [], stadiumDirection: null,
    active: cloneSlot(player.active),
    bench: Array.isArray(player.bench) ? player.bench.map(cloneSlot) : []
  });
  return { ...view, ownPublic: clonePlayer(view.ownPublic),
    opponentPublic: clonePlayer(view.opponentPublic) };
}

function holderAfterStadiumRemoval(view, holder, after) {
  if (view.ownPublic.active === holder) return after.ownPublic.active;
  const index = view.ownPublic.bench.indexOf(holder);
  return index >= 0 ? after.ownPublic.bench[index] : null;
}

function hasOpponentAbilityLockOnFairyZoneHolder(view, holder) {
  if (!holder || !Array.isArray(holder.abilities) ||
      !holder.abilities.includes('Fairy Zone') ||
      !Array.isArray(holder.tools) || holder.tools.length !== 0) return false;
  const isSuppressedByOpponentSource = (candidateView, candidateHolder) => {
    const resolved = resolveAbilityLockSources(candidateView);
    return resolved.active.some(source =>
      source.seat === 'opponent' &&
      abilityLockSourceSuppressesTarget(source, 'actor', candidateHolder, candidateView) === true
    );
  };
  if (isSuppressedByOpponentSource(view, holder)) return true;
  if (!hasStadiumRemovalTarget(view)) return false;
  const after = viewAfterRemovingAbilityStadiums(view);
  const afterHolder = holderAfterStadiumRemoval(view, holder, after);
  return afterHolder ? isSuppressedByOpponentSource(after, afterHolder) : false;
}

function hasOwnFairyZoneHolderLockThreat(view) {
  return ownBoard(view).some(holder =>
    hasOpponentAbilityLockOnFairyZoneHolder(view, holder)
  );
}

function hasStealthyHoodSearchNeed(view) {
  const openShadowRider = ownBoard(view).some(slot =>
    (isShadowRiderVmax(slot) || isBasicShadowRiderV(slot)) &&
    Array.isArray(slot.tools) && slot.tools.length === 0
  );
  return (hasAbilityLockThreat(view) && openShadowRider) ||
    hasActiveStealthyHoodThreat(view) ||
    hasOpponentFairyZoneThreat(view) ||
    hasOwnFairyZoneHolderLockThreat(view);
}

function effectiveAbilityStatus(slot, abilityName, seat, view) {
  const direct = abilityStatus(slot, abilityName);
  if (direct !== null) return direct;

  const stadiumSuppression = abilityLockSourceStadiumSuppression({ slot }, view);
  if (stadiumSuppression === true) return false;
  if (stadiumSuppression === null) return null;

  const resolution = resolveAbilityLockSources(view);
  let unknown = resolution.unknown;
  for (const source of resolution.active) {
    const suppresses = abilityLockSourceSuppressesTarget(source, seat, slot, view);
    if (suppresses === true) return false;
    if (suppresses === null) unknown = true;
  }
  return unknown ? null : true;
}

function fairyZoneHolderStatus(view, holderSeat, holder) {
  const direct = abilityStatus(holder, 'Fairy Zone');
  if (direct !== null) return direct;

  const stadiumSuppression = abilityLockSourceStadiumSuppression({ slot: holder }, view);
  if (stadiumSuppression === true) return false;
  if (stadiumSuppression === null) return null;

  const resolution = resolveAbilityLockSources(view);
  let unknown = resolution.unknown;
  for (const source of resolution.active) {
    const suppresses = abilityLockSourceSuppressesTarget(
      source, holderSeat, holder, view);
    if (suppresses === true) return false;
    if (suppresses === null) unknown = true;
  }
  return unknown ? null : true;
}

function fairyZoneStatusForSeat(view, holderSeat) {
  const board = holderSeat === 'actor' ? ownBoard(view) : opponentBoard(view);
  const holders = board.filter(slot =>
    Array.isArray(slot.abilities) && slot.abilities.includes('Fairy Zone'));
  if (holders.length === 0) return false;
  const statuses = holders.map(holder =>
    fairyZoneHolderStatus(view, holderSeat, holder));
  if (statuses.includes(true)) return true;
  if (statuses.includes(null)) return null;
  return false;
}

function fairyZoneStatus(view) {
  return fairyZoneStatusForSeat(view, 'actor');
}

function opponentFairyZoneStatus(view) {
  return fairyZoneStatusForSeat(view, 'opponent');
}

function hasOpponentFairyZoneThreat(view) {
  if (opponentFairyZoneStatus(view) !== true) return false;
  return ownBoard(view).some(slot =>
    isDragon(slot) && Array.isArray(slot.tools) && slot.tools.length === 0 &&
    hasEffectiveStealthyHood(slot, view, 'actor') !== true);
}

function skylinerStatus(view) {
  return boardAbilityStatus(view, 'Skyliner');
}

function psychicEnergyCount(view) {
  return ownBoard(view).reduce((sum, slot) =>
    sum + (slot.energies ?? []).filter(printing =>
      hasName(printing, 'Psychic Energy')).length, 0);
}

function countBench(player) {
  return player.bench.filter(Boolean).length;
}

function slotEnergyCount(slot) {
  return Array.isArray(slot?.energies) ? slot.energies.length : 0;
}

function slotByPrinting(player, printing) {
  if (!printing) return null;
  if (player.active?.printing === printing) return player.active;
  return player.bench.find(slot => slot?.printing === printing) ?? null;
}

function prizeLiability(slot) {
  if (!slot) return 1;
  const subtypes = slot.printed?.subtypes ?? [];
  const printing = slot.printing ?? '';
  if (subtypes.some(value => ['VMAX', 'V-UNION', 'TAG TEAM'].includes(value)) ||
      hasName(printing, 'VMAX') || hasName(printing, 'V-UNION') ||
      hasName(printing, ' & ') && hasName(printing, '-GX')) return 3;
  if (subtypes.some(value => ['ex', 'GX', 'V', 'VSTAR'].includes(value)) ||
      hasName(printing, '-GX') || / ex(?: |$)/.test(printing) ||
      / V(?: |$)/.test(printing) || / VSTAR(?: |$)/.test(printing)) return 2;
  return 1;
}

function parseDamage(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const match = /^\s*(\d+)/.exec(value);
  return match ? Number(match[1]) : null;
}

function isUltraBeast(slot) {
  return Boolean(slot?.printed?.subtypes?.includes('Ultra Beast') ||
    hasName(slot?.printing, 'Ultra Beast'));
}

function dimensionValleyStatus(view) {
  const stadiums = [...view.ownPublic.stadium, ...view.opponentPublic.stadium];
  if (!stadiums.some(printing => hasName(printing, 'Dimension Valley'))) return false;
  const ownSuppression =
    view.ownPublic.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining;
  const opponentSuppression =
    view.opponentPublic.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining;
  if (ownSuppression === null || opponentSuppression === null) return null;
  if (ownSuppression > 0 || opponentSuppression > 0) return false;

  const newMoonHolders = allBoard(view).filter(slot =>
    hasName(slot.printing, 'Lunatone') || hasName(slot.printing, 'Solrock'));
  for (const slot of newMoonHolders) {
    const newMoon = abilityStatus(slot, 'New Moon');
    if (newMoon === true) return false;
    if (newMoon === null && slot.abilities?.includes('New Moon')) return null;
  }
  if (stadiums.some(printing => hasName(printing, 'Wondrous Labyrinth'))) return null;
  return true;
}

function effectiveAttackCost(slot, attack, view) {
  const cost = Array.isArray(attack?.cost) ? attack.cost : [];
  let required = cost.length;
  if (required > 0 && cost.includes('Colorless') &&
      slot?.printed?.types?.includes('Psychic') &&
      dimensionValleyStatus(view) === true) {
    required -= 1;
  }
  return required;
}

function canPayAttack(slot, attack, view) {
  // Both exact candidate decks have ONLY basic Psychic Energy. Refuse to
  // model foreign energy as equivalent to Psychic, or count Metal/Fire/
  // Darkness costs as generic units. Native frontier remains authoritative.
  if (!slot || !Array.isArray(slot.energies) || !Array.isArray(attack?.cost)) return false;
  if (slot.energies.some(p => !hasName(p,'Psychic Energy'))) return false;
  if (attack.cost.some(c => c !== 'Psychic' && c !== 'Colorless')) return false;
  return slot.energies.length >= effectiveAttackCost(slot,attack,view);
}

function isPokemonV(slot) {
  const subtypes = slot?.printed?.subtypes ?? [];
  return subtypes.some(value => ['V', 'VMAX', 'VSTAR', 'V-UNION'].includes(value));
}

function stadiumAndToolEffectsLive(view) {
  const own = view.ownPublic.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining;
  const opponent = view.opponentPublic.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining;
  if (!Number.isSafeInteger(own) || own < 0 ||
      !Number.isSafeInteger(opponent) || opponent < 0) return null;
  return own === 0 && opponent === 0;
}

function hasEffectiveStealthyHood(target, view, targetSeat) {
  if (!target || (targetSeat !== 'actor' && targetSeat !== 'opponent')) return null;
  if (!Array.isArray(target.tools)) return null;
  if (!target.tools.some(tool => hasName(tool, 'Stealthy Hood'))) return false;

  // Stealthy Hood is itself a Pokémon Tool. Unknown or suppressed Tool state
  // must not be converted into an assumed failure of protection.
  const effectsLive = stadiumAndToolEffectsLive(view);
  if (effectsLive === null) return null;
  if (effectsLive === false) return false;

  const stadiums = [...view.ownPublic.stadium, ...view.opponentPublic.stadium];
  if (stadiums.some(name => hasName(name, 'Jamming Tower'))) return false;

  const targetPlayer = targetSeat === 'actor' ? view.ownPublic : view.opponentPublic;
  const opposingPlayer = targetSeat === 'actor' ? view.opponentPublic : view.ownPublic;
  const toolJammerAttached = Array.isArray(opposingPlayer.active?.tools) &&
    opposingPlayer.active.tools.some(tool => hasName(tool, 'Tool Jammer'));
  if (toolJammerAttached && target === targetPlayer.active) return false;
  return true;
}

function weaknessMultiplier(attacker, target, view) {
  if (isDragon(target) && fairyZoneStatus(view) === true &&
      hasEffectiveStealthyHood(target, view, 'opponent') === false) return 2;
  const types = attacker?.printed?.types ?? [];
  const weakness = (target?.printed?.weakness ?? []).find(row =>
    types.includes(row.type));
  if (!weakness || weakness.value === null) return 1;
  const value = String(weakness.value);
  if (value.includes('2')) return 2;
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) && numeric > 1 ? numeric : 1;
}

function resistancePenalty(attacker, target) {
  const types = attacker?.printed?.types ?? [];
  const resistance = (target?.printed?.resistance ?? []).find(row =>
    types.includes(row.type));
  if (!resistance || resistance.value === null) return 0;
  const value = Number.parseInt(String(resistance.value), 10);
  return Number.isFinite(value) ? Math.abs(value) : 0;
}

function attackBaseDamage(attacker, attack, view, target) {
  if (!attack) return null;
  if (attack.name === 'Max Geist') {
    return 10 + 30 * psychicEnergyCount(view);
  }
  if (attack.name === 'Psychic Assault') return 10 + Math.max(0,target.damage);
  if (attack.name === 'Energy Drive') return 20*(slotEnergyCount(attacker)+slotEnergyCount(target));
  if (attack.name === 'Full Moon Rondo') {
    return 20 + 20 * (
      countBench(view.ownPublic) + countBench(view.opponentPublic)
    );
  }
  if (attack.name === 'Timeless-GX') return 150;
  if (attack.name === 'Red Knuckles') {
    return 10 + (isUltraBeast(target) ? 60 : 0);
  }
  if (attack.name === 'Power Beam') return 200;
  if (attack.name === 'Night Watch') return 150;
  if (attack.name === 'Shadow Mist') return 10;
  if (attack.name === 'Filch' || attack.name === 'Copycat' ||
      attack.name === 'Apex Dragon' || attack.name === 'Astral Barrage') return 0;
  return parseDamage(attack.damage);
}

function estimatedDamage(attacker, attack, view, target) {
  const base = attackBaseDamage(attacker, attack, view, target);
  if (base === null) return null;
  if (attack.name === 'Energy Drive' || attack.name === 'Mind Shock') return Math.max(0,base);
  const multiplier = weaknessMultiplier(attacker, target, view);
  const damage = Math.max(0, base * multiplier -
    resistancePenalty(attacker, target));
  return Number.isFinite(damage) ? damage : null;
}

function canFuelNightWatch(view) {
  return handHas(view, 'Psychic Energy') &&
    (view.ownTurnResources.energyPlayedTurn === false ||
     boardAbilityStatus(view, 'Underworld Door') === true);
}

function energyCardUnits(slot, energy) {
  const subtypes = slot.subtypes ?? slot.printed?.subtypes ?? [];
  const evolution = subtypes.some(type => ['Stage 1', 'Stage 2', 'VMAX', 'VSTAR', 'BREAK'].includes(type));
  if (hasName(energy, 'Double Colorless Energy') || hasName(energy, 'Double Turbo Energy')) return 2;
  if (hasName(energy, 'Double Dragon Energy')) return isDragon(slot) ? 2 : 1;
  if (hasName(energy, 'Twin Energy')) return isRuleBoxPokemon(slot) ? 1 : 2;
  if (hasName(energy, 'Rapid Strike Energy')) return subtypes.includes('Rapid Strike') ? 2 : 1;
  if (hasName(energy, 'Single Strike Energy')) return subtypes.includes('Single Strike') ? 2 : 1;
  if (hasName(energy, 'Triple Acceleration Energy') || hasName(energy, 'Boost Energy')) return evolution ? 3 : 1;
  if (hasName(energy, 'Double Rainbow Energy')) return evolution ? 2 : 1;
  return 1;
}

function energyUnitCount(slot, energies = slot.energies) {
  if (!Array.isArray(energies)) return null;
  return energies.reduce((sum, energy) => sum + energyCardUnits(slot, energy), 0);
}

function psychicEnergyUnitCount(slot) {
  if (!Array.isArray(slot.energies)) return null;
  return slot.energies.reduce((sum, energy) => {
    const psychic = hasName(energy, 'Psychic Energy') ||
      hasName(energy, 'Horror Psychic Energy') || hasName(energy, 'Mystery Energy') ||
      hasName(energy, 'Spiral Energy') || hasName(energy, 'Aurora Energy') ||
      hasName(energy, 'Rainbow Energy') || hasName(energy, 'Prism Energy') ||
      hasName(energy, 'Luminous Energy') || hasName(energy, 'Double Rainbow Energy');
    return sum + (psychic ? energyCardUnits(slot, energy) : 0);
  }, 0);
}

function paleMoonExtraPsychicAvailable(attacker, attack, view) {
  const cost = effectiveAttackCost(attacker, attack, view);
  const psychicUnits = psychicEnergyUnitCount(attacker);
  const totalUnits = energyUnitCount(attacker);
  if (!Number.isFinite(cost) || psychicUnits === null || totalUnits === null) return null;
  const nonPsychicUnits = Math.max(0, totalUnits - psychicUnits);
  const colorlessCost = Math.max(0, cost - 1);
  const psychicUsedForColorless = Math.max(0, colorlessCost - nonPsychicUnits);
  return psychicUnits - 1 - psychicUsedForColorless >= 1;
}

function toolsEffectiveForRetreat(view, target, targetSeat) {
  const effectsLive = stadiumAndToolEffectsLive(view);
  if (effectsLive !== true) return effectsLive;
  const stadiums = [...view.ownPublic.stadium, ...view.opponentPublic.stadium];
  if (stadiums.some(stadium => hasName(stadium, 'Jamming Tower'))) return false;
  const targetPlayer = targetSeat === 'actor' ? view.ownPublic : view.opponentPublic;
  const opposingPlayer = targetSeat === 'actor' ? view.opponentPublic : view.ownPublic;
  const toolJammer = opposingPlayer.active?.tools?.some(tool => hasName(tool, 'Tool Jammer'));
  if (toolJammer && target === targetPlayer.active) return false;
  return true;
}

const SPECIAL_CONDITION_NAMES_BY_CODE = Object.freeze([
  'paralyzed', 'confused', 'asleep', 'poisoned', 'burned'
]);
const SPECIAL_CONDITION_NAME_SET = new Set(SPECIAL_CONDITION_NAMES_BY_CODE);
function normalizeSpecialConditionNames(values) {
  if (!Array.isArray(values)) return null;
  const names = [];
  for (const value of values) {
    let name;
    if (typeof value === 'string') {
      name = value.toLowerCase();
    } else if (Number.isSafeInteger(value) && value >= 0 &&
        value < SPECIAL_CONDITION_NAMES_BY_CODE.length) {
      name = SPECIAL_CONDITION_NAMES_BY_CODE[value];
    } else {
      return null;
    }
    if (!SPECIAL_CONDITION_NAME_SET.has(name)) return null;
    names.push(name);
  }
  return names;
}

function paleMoonRetreatStatus(target, view, energyAfterAttack) {
  const benchCount = view.opponentPublic.bench.filter(Boolean).length;
  if (benchCount === 0) return { canRetreat: false, cost: null, free: false };
  const restrictions = target.publicRestrictions ?? {};
  if (restrictions.cannotRetreat === true || restrictions.cannotRetreatNextTurn === true ||
      restrictions.cannotRetreatWhileActive === true || restrictions.retreatLocked === true) {
    return { canRetreat: false, cost: null, free: false };
  }
  const conditions = normalizeSpecialConditionNames(target.specialConditions ?? []);
  if (conditions === null) return null;
  const asleep = conditions.includes('asleep');
  const paralyzed = conditions.includes('paralyzed');
  const toolsLive = toolsEffectiveForRetreat(view, target, 'opponent');
  if (toolsLive === null && (!Array.isArray(target.tools) || target.tools.length > 0)) return null;
  if (toolsLive === true && !Array.isArray(target.tools)) return null;
  const escapeBoard = toolsLive === true && target.tools.some(tool => hasName(tool, 'Escape Board'));
  if ((asleep || paralyzed) && !escapeBoard) {
    return { canRetreat: false, cost: null, free: false };
  }

  const snorlax = view.ownPublic.active;
  if (hasName(snorlax?.printing, 'Snorlax PGO 55')) {
    const block = effectiveAbilityStatus(snorlax, 'Block', 'actor', view);
    const hood = hasEffectiveStealthyHood(target, view, 'opponent');
    if (block === null || hood === null) return null;
    if (block === true && hood !== true) return { canRetreat: false, cost: null, free: false };
  }

  const subtypes = target.subtypes ?? target.printed?.subtypes ?? [];
  const isBasic = subtypes.includes('Basic');
  if (isBasic) {
    const skyliner = opponentBoard(view).some(slot =>
      hasName(slot.printing, 'Latias ex') &&
      effectiveAbilityStatus(slot, 'Skyliner', 'opponent', view) !== false
    );
    if (skyliner) return { canRetreat: true, cost: 0, free: true };
  }

  const printedRetreat = target.printed?.retreatCost ?? target.retreatCost;
  const printedCost = Array.isArray(printedRetreat) ? printedRetreat.length :
    Number.isInteger(printedRetreat) ? printedRetreat : null;
  if (printedCost === null) return null;
  let cost = printedCost;
  const targetTypes = target.types ?? target.printed?.types ?? [];
  if (targetTypes.includes('Psychic') && Array.isArray(energyAfterAttack)) {
    cost -= energyAfterAttack.filter(energy => hasName(energy, 'Mystery Energy')).length;
  }
  const stadiumEffects = stadiumAndToolEffectsLive(view);
  if (stadiumEffects === true) {
    const stadiums = [...view.ownPublic.stadium, ...view.opponentPublic.stadium];
    if (stadiums.some(stadium => hasName(stadium, 'Galar Mine'))) cost += 2;
    if (isBasic && stadiums.some(stadium => hasName(stadium, 'Skyarrow Bridge'))) cost -= 1;
    if (isBasic && targetTypes.includes('Darkness') &&
        stadiums.some(stadium => hasName(stadium, 'Dark City'))) cost -= 2;
  } else if (stadiumEffects === null &&
      [view.ownPublic.stadium, view.opponentPublic.stadium].some(Boolean)) return null;
  if (toolsLive === true) {
    if (target.tools.some(tool => hasName(tool, 'Float Stone'))) cost = 0;
    else if (target.tools.some(tool => hasName(tool, 'Air Balloon'))) cost -= 2;
    else if (target.tools.some(tool => hasName(tool, 'U-Turn Board') || hasName(tool, 'Escape Board'))) cost -= 1;
  }
  cost = Math.max(0, cost);
  const energyUnits = energyUnitCount(target, energyAfterAttack);
  if (energyUnits === null) return null;
  return { canRetreat: energyUnits >= cost, cost, free: cost === 0, energyUnits };
}

function paleMoonScore(attacker, attack, view, target) {
  if (!attacker || !attack || !target ||
      view.ownPublic.publicTurnRestrictions?.gxUsed === true ||
      !canPayAttack(attacker, attack, view)) return -Infinity;
  const extraPsychic = paleMoonExtraPsychicAvailable(attacker, attack, view);
  if (extraPsychic === null) return -Infinity;
  const targetEnergyCount = slotEnergyCount(target);
  const energyAfterAttack = extraPsychic ? [] : target.energies;
  const retreat = paleMoonRetreatStatus(target, view, energyAfterAttack);
  const opponentBenchCount = view.opponentPublic.bench.filter(Boolean).length;
  const base = 900 + targetEnergyCount * 80 + prizeLiability(target) * 100 +
    (extraPsychic ? 350 : 0);
  if (retreat === null) return extraPsychic ? base - 300 : 0;
  if (!retreat.canRetreat) return base + (opponentBenchCount === 0 ? 700 : 350);
  if (retreat.free) return extraPsychic ? base - 700 : 0;
  return base - 700 + Math.min(600, retreat.cost * 180);
}
function attackScore(attacker, attack, view, target, options = {}) {
  if (!attacker || !attack || !target) return -Infinity;
  if (attack.gxAttack && view.ownPublic.publicTurnRestrictions.gxUsed) return -Infinity;
  if (options.requirePayable === true && !canPayAttack(attacker, attack, view)) {
    return -Infinity;
  }

  if (attack.name === 'Copycat') return -Infinity; // separate copied-attack admission required
  if (attack.name === 'Pale Moon-GX') {
    return paleMoonScore(attacker, attack, view, target);
  }

  const damage = estimatedDamage(attacker, attack, view, target);
  if (damage === null) return -Infinity;
  const remaining = Math.max(0, target.hp - target.damage);
  let score = damage * 10;
  if (attack.name === 'Night Watch') {
    score += Math.min(120, view.opponentPublic.handCount * 20);
  }
  if (damage >= remaining) {
    score += 10000 + prizeLiability(target) * 500;
  }

  if (attack.name === 'Timeless-GX' && !view.ownPublic.publicTurnRestrictions.gxUsed) {
    score += 750;
  }
  if (attack.name === 'Filch' && view.ownPublic.deckCount > 2 &&
      view.ownPublic.handCount <= 3) {
    score = Math.max(score, 100);
  }
  if (attack.name === 'Shadow Mist' &&
      (view.opponentPublic.stadium.length > 0 ||
       view.opponentPublic.active?.energies?.some(name =>
         !hasName(name, 'Basic Energy')))) {
    score += 100;
  }
  return score;
}

function bestAttackForSlot(slot, view, target, options = {}) {
  if (!slot || !Array.isArray(slot.attacks)) return null;
  let best = null;
  for (const attack of slot.attacks) {
    const score = attackScore(slot, attack, view, target, {
      ...options, requirePayable: true
    });
    if (score > (best?.score ?? -Infinity)) {
      best = { attack, score, damage: estimatedDamage(slot, attack, view, target) };
    }
  }
  return best && Number.isFinite(best.score) ? best : null;
}

function choiceBenchIndex(choice) {
  const metadataIndex = choice?.publicMetadata?.targetIndex ??
    choice?.publicMetadata?.benchIndex;
  if (Number.isSafeInteger(metadataIndex) && metadataIndex >= 0) {
    return metadataIndex;
  }
  const label = choice?.label ?? '';
  const match = /^(?:Your|Opponent) bench ([1-9][0-9]*)(?::|$)/i.exec(label);
  return match ? Number(match[1]) - 1 : null;
}

function slotForPokemonChoice(view, choice) {
  const metadata = choice.publicMetadata;
  const ownerSeat = metadata.ownerSeat;
  const zone = metadata.targetZone;
  if (!['actor', 'opponent'].includes(ownerSeat) || metadata.isOwnerVisible !== true) return null;
  const player = ownerSeat === 'actor' ? view.ownPublic : view.opponentPublic;
  if (zone === 'active') {
    const slot = player.active;
    if (!slot || (choice.printing && slot.printing !== choice.printing)) return null;
    return { ownerSeat, zone: 'active', index: -1, slot };
  }
  if (zone !== 'bench') return null;
  const index = choiceBenchIndex(choice);
  if (!Number.isSafeInteger(index) || index < 0) return null;
  const slot = player.bench[index];
  if (!slot || (choice.printing && slot.printing !== choice.printing)) return null;
  return { ownerSeat, zone: 'bench', index, slot };
}
function isFieldBlowerPrompt(prompt) {
  return prompt?.source?.effectName === 'Field Blower' &&
    hasName(prompt.source.sourcePrinting, 'Field Blower');
}

function slotForFieldBlowerChoice(view, choice) {
  const metadata = choice?.publicMetadata;
  if (!metadata || metadata.isOwnerVisible !== true ||
      !['actor', 'opponent'].includes(metadata.ownerSeat)) return null;
  const player = metadata.ownerSeat === 'actor'
    ? view.ownPublic : view.opponentPublic;
  const zone = metadata.targetZone;
  let index;
  let slot;
  if (zone === 'active') {
    if (metadata.slotIndex !== 0) return null;
    index = -1;
    slot = player.active ?? null;
  } else if (zone === 'bench') {
    index = metadata.benchIndex ?? metadata.targetIndex;
    if (!Number.isSafeInteger(index) || index < 0) return null;
    slot = player.bench[index] ?? null;
  } else {
    return null;
  }
  if (!slot || (choice.printing && slot.printing !== choice.printing) ||
      !Array.isArray(slot.tools) || slot.tools.length === 0) return null;
  return { slot, index, ownerSeat: metadata.ownerSeat, zone };
}

function chooseFieldBlowerMode(view, prompt) {
  setPolicyAuditRule('FIELD_BLOWER_MODE_CHOICE',
    'STADIUM_PRIORITY_THEN_TWO_OPPONENT_TOOLS');
  if (!isFieldBlowerPrompt(prompt) ||
      prompt.publicMetadata?.selectionType !== 'option') {
    return abstain('UNTRUSTED_PROMPT');
  }
  const options = prompt.choices.filter(choice =>
    choice.kind === 'option' && typeof choice.label === 'string');
  const stadiumOptions = options.filter(choice =>
    choice.label.toLowerCase().includes('stadium'));
  const toolOnlyOptions = options.filter(choice => {
    const label = choice.label.toLowerCase();
    return label.includes('tool') && !label.includes('stadium');
  });
  let selected = null;
  if (hasStadiumRemovalTarget(view)) {
    if (stadiumOptions.length === 1) selected = stadiumOptions[0];
  } else if (toolOnlyOptions.length === 1) {
    // The native prompt is emitted only when a Stadium and at least one Tool
    // are in play. If the Stadium does not constrain us, choose the Tool line;
    // the follow-up may legally select zero targets.
    selected = toolOnlyOptions[0];
  }
  if (!selected) return abstain('AMBIGUOUS_SIMPLE_PROMPT');
  return { kind: 'select-choice', token: selected.token };
}

function canFairyZoneBeActiveAfterStadiumRemoval(view) {
  const after = viewAfterRemovingAbilityStadiums(view);
  const holders = ownBoard(after).filter(slot =>
    Array.isArray(slot.abilities) && slot.abilities.includes('Fairy Zone')
  );
  if (holders.length === 0) return false;
  const resolved = resolveAbilityLockSources(after);
  if (resolved.unknown) return false;
  return holders.some(holder => {
    if (abilityStatus(holder, 'Fairy Zone') === false) return false;
    return !resolved.active.some(source =>
      abilityLockSourceSuppressesTarget(source, 'actor', holder, after) === true
    );
  });
}

function fieldBlowerHoodBlocksFairyZone(view, target) {
  if (!target || target.ownerSeat !== 'opponent' || !isDragon(target.slot) ||
      !Array.isArray(target.slot.tools) ||
      !target.slot.tools.some(tool => hasName(tool, 'Stealthy Hood'))) return false;
  if (!canFairyZoneBeActiveAfterStadiumRemoval(view)) return false;
  if (stadiumAndToolEffectsLive(view) !== true) return false;
  if (target.zone === 'active' &&
      view.ownPublic.active?.tools?.some(tool => hasName(tool, 'Tool Jammer'))) return false;
  return hasEffectiveStealthyHood(target.slot, view, 'opponent') === true;
}

function chooseFieldBlowerPokemon(view, prompt) {
  setPolicyAuditRule('FIELD_BLOWER_TOOL_TARGET_SCORE',
    'FAIRY_ZONE_HOOD_BLOCKER_THEN_ACTIVE_TARGET_VALUE_DESC');
  const metadata = prompt.publicMetadata;
  if (!isFieldBlowerPrompt(prompt) || metadata?.selectionType !== 'pokemon') {
    return abstain('UNTRUSTED_PROMPT');
  }
  const minimum = metadata.minimumCount;
  const maximum = metadata.maximumCount;
  if (!Number.isSafeInteger(minimum) || !Number.isSafeInteger(maximum) ||
      minimum < 0 || maximum < minimum || maximum > 2) {
    return abstain('BAD_POKEMON_SELECTION_BOUNDS');
  }
  const ranked = prompt.choices.filter(choice => choice.kind === 'pokemon')
    .map(choice => ({ choice, target: slotForFieldBlowerChoice(view, choice) }))
    .filter(row => row.target !== null)
    .map(row => {
      const hoodPriority = fieldBlowerHoodBlocksFairyZone(view, row.target) ? 2000 : 0;
      const toolValue =
        Math.min(200, row.target.slot.tools.length * 100) +
        (row.target.slot.tools.some(tool => hasName(tool, 'Tool Jammer')) ? 100 : 0) +
        (row.target.slot.tools.some(tool => hasName(tool, 'Stealthy Hood')) ? 50 : 0);
      return {
        ...row,
        score: row.target.ownerSeat === 'opponent'
          ? (row.target.zone === 'active' ? 1000 : 700) + toolValue + hoodPriority
          : -Infinity
      };
    });
  for (const row of ranked) recordPolicyAuditScore(row.choice.token, row.score, 'NO_OPPONENT_TOOL_TARGET');
  ranked.sort((a, b) => b.score - a.score || a.target.index - b.target.index);
  const selected = ranked.filter(row => Number.isFinite(row.score) && row.score > 0).slice(0, maximum);
  if (selected.length < minimum) return abstain('NO_SUPPORTED_POKEMON_CHOICE');
  if (selected.length === 0) {
    const empty = prompt.choices.find(choice => choice.kind === 'empty-selection');
    return minimum === 0 && empty
      ? { kind: 'select-choice', token: empty.token }
      : abstain('NO_POKEMON_SELECTION');
  }
  return { kind: 'select-choices', tokens: selected.map(row => row.choice.token) };
}
function itemLocked(view) {
  return view.ownTurnResources?.itemPlayLocked === true ||
    view.ownPublic.publicTurnRestrictions?.itemPlayLocked === true;
}
function supporterAvailable(view) {
  return view.globalTurn > 1 && view.ownTurnResources?.supporterPlayedTurn === 0 &&
    view.ownTurnResources?.supporterPlayLocked !== true &&
    view.ownPublic.publicTurnRestrictions?.supporterPlayLocked !== true;
}
function gateAccessNeed(view) {
  return !boardHas(view, 'Radiant Eternatus') && !handHas(view, 'Radiant Eternatus') &&
    !discardHas(view, 'Radiant Eternatus') &&
    !(view.ownPublic.lostZone ?? []).some(p => hasName(p, 'Radiant Eternatus')) &&
    view.ownPublic.deckCount > 0 && openBenchSlots(view) >= 3 && canPlayRadiantForGate(view);
}
function forestSealAccessNeed(view) {
  return gateAccessNeed(view) && !handHas(view, 'Forest Seal Stone') &&
    !ownBoard(view).some(slot => (slot.tools ?? []).some(p => hasName(p, 'Forest Seal Stone'))) &&
    view.ownTurnResources?.vstarUsed !== true &&
    view.ownPublic.publicTurnRestrictions?.vstarUsed !== true &&
    ownBoard(view).some(slot => isShadowRiderVTarget(slot) &&
      Array.isArray(slot.tools) && slot.tools.length === 0 &&
      toolsEffectiveForRetreat(view, slot, 'actor') === true && !hasStarAlchemyLock(view, slot));
}
function usefulRanger(view) {
  const r = view.ownPublic.publicTurnRestrictions ?? {};
  const active = view.ownPublic.active;
  const a = active?.publicRestrictions ?? {};
  // Native persistent effect flags, not absence of a legal action, support this decision.
  const unlockItems = itemLocked(view) && view.ownHand.some(isItem);
  const unlockOther = r.stadiumPlayLocked === true &&
    view.ownHand.some(p => hasAnyName(p, ['Sky Field','Dimension Valley','Temple of Sinnoh'])) ||
    r.energyPlayLocked === true && handHas(view, 'Psychic Energy') ||
    r.evolutionPlayLocked === true && handHas(view, 'Shadow Rider Calyrex VMAX');
  const unlockAttack = (r.attackLockTurnsRemaining > 0 ||
    r.attackMaxEnergyTurnsRemaining > 0 || a.cannotAttackNextTurn === true ||
    (a.cannotUseAttacksNextTurn ?? []).length > 0 || isText(a.blockedAttackNameNextTurn)) &&
    Array.isArray(active?.attacks) && active.attacks.some(attack => canPayAttack(active, attack, view));
  return unlockItems || unlockOther || unlockAttack;
}
function bestRecoverableSupporter(view, receipt) {
  if (!supporterAvailable(view)) return -Infinity;
  const held = Math.max(0, ...view.ownHand.map(p => supporterNeedScore(view, p, receipt)));
  const recover = Math.max(-Infinity, ...view.ownPublic.discard
    .filter(p => !view.ownHand.includes(p)).map(p => supporterNeedScore(view, p, receipt)));
  return recover >= 40 && recover > held ? recover : -Infinity;
}
function recoveryNeedScore(view, printing, receipt) {
  if (hasName(printing, 'Psychic Energy')) {
    const handEnergy = view.ownHand.filter(p => hasName(p, 'Psychic Energy')).length;
    return handEnergy === 0 && (view.ownTurnResources?.energyPlayedTurn === false ||
      boardAbilityStatus(view,'Underworld Door') === true) ? 95 : handEnergy < 2 ? 25 : -5;
  }
  if (hasName(printing, 'Dialga-GX')) return -5;
  if (hasName(printing, 'Radiant Eternatus')) {
    return !boardHas(view,'Radiant Eternatus') && !handHas(view,'Radiant Eternatus') &&
      canPlayRadiantForGate(view) ? 100 : -5;
  }
  if (hasName(printing, 'Tapu Lele-GX')) {
    return supporterAvailable(view) && !handHas(view,'Tapu Lele-GX') &&
      !boardHas(view,'Tapu Lele-GX') && hasOpenBench(view) && !hasWonderTagLock(view) ? 70 : -5;
  }
  return hasAnyName(printing, ['Shadow Rider Calyrex V','Mimikyu',"Lillie's Clefairy ex",'Latias ex','Trevenant & Dusknoir-GX','Girafarig','Marshadow','Wobbuffet'])
    ? searchNeedScore(view, printing, 'recovery', receipt) : -Infinity;
}
function supporterNeedScore(view, printing, receipt) {
  const priorOpponentKO = receipt?.priorOpponentTurnKO?.any === true;
  if (hasName(printing, 'Teammates')) return priorOpponentKO ? 100 : -5;
  if (hasName(printing, 'Raihan')) {
    return priorOpponentKO && discardHas(view, 'Psychic Energy') &&
      view.ownTurnResources.energyPlayedTurn === false ? 96 : -5;
  }
  if (hasName(printing, 'Guzma')) return canGuzmaForAttack(view) ? 92 : -5;
  if (hasName(printing, 'Arven')) {
    const missingV = !hasBasicShadowRiderV(view) && hasOpenBench(view);
    const missingHood = hasStealthyHoodSearchNeed(view);
    return forestSealAccessNeed(view) ? 101 : missingV || missingHood ? 90 : 40;
  }
  if (hasName(printing, 'Acerola')) {
    return ownBoard(view).some(slot =>
      slot.damage > 0 && slot.hp - slot.damage <= 120) ? 88 : -5;
  }
  if (hasName(printing, "Lillie's Determination")) {
    return view.ownPublic.handCount <= 3 || view.ownPublic.deckCount <= 10 ? 85 : 35;
  }
  if (hasName(printing, 'Iono')) {
    return view.opponentPublic.handCount >= 5 && view.ownPublic.handCount >= 4 ? 80 : 25;
  }
  if (hasName(printing, 'Pokémon Ranger')) return usefulRanger(view) ? 110 : -5;
  return -5;
}

function searchNeedScore(view, printing, effectName = '', receipt = null) {
  if (!isText(printing)) return -Infinity;
  if (effectName === 'Wonder Tag' || effectName === 'VS Seeker') return supporterNeedScore(view, printing, receipt);
  if (effectName === 'Star Alchemy') {
    const ordinary = searchNeedScore(view, printing, '', receipt);
    const supporter = supporterNeedScore(view, printing, receipt);
    const score = Math.max(ordinary, supporter);
    return score > 0 ? score + 10 : score;
  }
  if (hasName(printing, 'Radiant Eternatus')) return gateAccessNeed(view) ? 120 : -5;
  if (hasName(printing, 'Forest Seal Stone')) return forestSealAccessNeed(view) ? 115 : 0;
  const regidrago = opponentHasRegidrago(view);
  const dragon = opponentHasDragon(view);
  const board = ownBoard(view);
  const hasShadowV = hasBasicShadowRiderV(view);
  const hasMimikyu = board.some(slot => hasName(slot.printing, 'Mimikyu'));
  const hasClefairy = board.some(slot => hasName(slot.printing, "Lillie's Clefairy ex"));
  const hasLatias = board.some(slot => hasName(slot.printing, 'Latias ex'));

  if (hasName(printing, 'Dialga-GX')) return -10; // unsupported copied-attack route
  if (hasName(printing, 'Mimikyu')) {
    if (regidrago && !hasMimikyu && !handHas(view, 'Mimikyu')) return 15;
    return -5;
  }
  if (effectName === 'Climactic Gate') {
    return hasName(printing, 'Shadow Rider Calyrex VMAX') ? 100 : -5;
  }
  if (hasName(printing, 'Trevenant & Dusknoir-GX')) {
    return view.opponentPublic.handCount >= 4 &&
      !boardHas(view, 'Trevenant & Dusknoir-GX') &&
      !handHas(view, 'Trevenant & Dusknoir-GX') &&
      canFuelNightWatch(view) ? 90 : -5;
  }
  if (hasName(printing, 'Shadow Rider Calyrex VMAX')) {
    if (hasUnevolvedShadowRiderV(view) &&
        !handHas(view, 'Shadow Rider Calyrex VMAX')) return 94;
    return -5;
  }
  if (isBasicShadowRiderVPrinting(printing)) {
    if (!hasShadowV && !handHasBasicShadowRiderV(view) &&
        hasOpenBench(view)) return 100;
    return -5;
  }
  if (hasName(printing, "Lillie's Clefairy ex")) {
    if (dragon && !hasClefairy && !handHas(view, "Lillie's Clefairy ex")) return 92;
    return -5;
  }
  if (hasName(printing, 'Latias ex')) {
    if (!hasLatias && !handHas(view, 'Latias ex')) return 65;
    return -5;
  }
  if (hasName(printing, 'Psychic Energy')) {
    return psychicEnergyCount(view) < 5 ? 45 : 5;
  }
  if (hasName(printing, 'Fog Crystal')) {
    const missingBasicV = !hasShadowV &&
      !handHas(view, 'Shadow Rider Calyrex V') && hasOpenBench(view);
    return missingBasicV || psychicEnergyCount(view) < 3 ? 60 : 10;
  }
  if (hasName(printing, 'Stealthy Hood')) {
    return hasStealthyHoodSearchNeed(view) ? 85 : 0;
  }
  if (hasName(printing, 'Field Blower')) {
    return hasStadiumRemovalTarget(view) || hasOpponentToolRemovalTarget(view) ? 72 : 0;
  }
  if (hasName(printing, 'VS Seeker')) {
    return !itemLocked(view) && Number.isFinite(bestRecoverableSupporter(view,receipt)) ? 85 : 0;
  }
  if (hasName(printing, 'Hisuian Heavy Ball')) {
    return 25;
  }
  if (hasName(printing, 'Night Stretcher')) return !itemLocked(view) && view.ownPublic.discard.some(p=>recoveryNeedScore(view,p,receipt)>=70) ? 75 : 0;
  if (hasName(printing, 'Unfair Stamp')) {
    return receipt?.priorOpponentTurnKO?.any === true ? 80 : 0;
  }
  if (effectName === 'Arven' && hasAnyName(printing, TOOL_NAMES)) return 70;
  return 0;
}

function discardValue(view, printing) {
  if (!isText(printing)) return 1000;
  const duplicates = view.ownHand.filter(item => item === printing).length;
  if (hasName(printing, 'Battle VIP Pass') && view.globalTurn > 1) return 1;
  if (hasName(printing, 'Psychic Energy')) {
    return psychicEnergyCount(view) >= 5 ? 2 : 80;
  }
  if (hasName(printing, 'Dialga-GX')) {
    return opponentHasRegidrago(view) && !discardHas(view, 'Dialga-GX') ? 1000 : 35;
  }
  if (hasName(printing, 'Mimikyu')) {
    return opponentHasRegidrago(view) && !boardHas(view, 'Mimikyu') ? 1000 : 30;
  }
  if (hasName(printing, 'Shadow Rider Calyrex VMAX') &&
      ownBoard(view).filter(slot => hasName(slot.printing, 'Shadow Rider Calyrex VMAX')).length < 2) return 900;
  if (hasName(printing, "Lillie's Clefairy ex") && opponentHasDragon(view) &&
      !boardHas(view, "Lillie's Clefairy ex")) return 900;
  if (hasName(printing, 'Unfair Stamp') || hasName(printing, 'Forest Seal Stone') ||
      hasName(printing, 'Computer Search')) return 1000;
  if (hasAnyName(printing, ['Guzma', 'Raihan', 'Acerola', 'Teammates', 'Lillie'])) return 850;
  if (hasAnyName(printing, ['Fog Crystal', 'Quick Ball', 'Mysterious Treasure']) &&
      duplicates > 1) return 10;
  if (duplicates > 1 && !hasAnyName(printing, CORE_PRINTINGS)) return 15;
  if (hasAnyName(printing, CORE_PRINTINGS)) return 700;
  return 50;
}

function isTool(printing) {
  return hasAnyName(printing, TOOL_NAMES);
}

function isItem(printing) {
  return hasAnyName(printing, ITEM_NAMES);
}

function searchCandidates(view, prompt, choices, receipt = null) {
  const effectName = prompt.source?.effectName ?? '';
  const sourcePrinting = prompt.source?.sourcePrinting ?? '';
  const sourceZone = prompt.publicMetadata?.sourceZone;
  const scoringEffectName = sourceZone === 'deck' &&
    hasName(sourcePrinting, 'Tapu Lele-GX') ? 'Wonder Tag' :
    sourceZone === 'deck' && hasName(sourcePrinting, 'Radiant Eternatus')
      ? 'Climactic Gate' : effectName;
  let rows;
  if (sourceZone === 'deck' && effectName === 'Battle Compressor') {
    rows = choices.map(choice => ({
      choice,
      score: hasName(choice.printing, 'Dialga-GX') &&
        opponentHasRegidrago(view) && !discardHas(view, 'Dialga-GX') ? 1000 :
        -discardValue(view, choice.printing)
    }));
  } else if (sourceZone === 'hand') {
    rows = choices.map(choice => ({
      choice, score: -discardValue(view, choice.printing)
    }));
  } else {
    rows = choices.map(choice => ({
      choice, score: sourceZone === 'discard' && hasName(sourcePrinting,'VS Seeker')
        ? supporterNeedScore(view,choice.printing,receipt)
        : (sourceZone === 'discard' && hasName(sourcePrinting,'Night Stretcher') ||
           sourceZone === 'prizes' && hasName(sourcePrinting,'Hisuian Heavy Ball'))
          ? recoveryNeedScore(view,choice.printing,receipt)
          : searchNeedScore(view, choice.printing, scoringEffectName, receipt)
    }));
  }
  for (const row of rows) {
    recordPolicyAuditScore(row.choice.token, row.score, 'NO_SEARCH_CANDIDATE_SCORE');
  }
  return rows;
}

function fieldBlowerToolTarget(view, choice) {
  const metadata = choice?.publicMetadata ?? {};
  if (metadata.ownerSeat && metadata.ownerSeat !== 'opponent') return null;
  if (metadata.isOwnerVisible === false) return null;
  if (metadata.targetZone === 'active') {
    const slot = view.opponentPublic.active;
    if (!slot || !Array.isArray(slot.tools) || !slot.tools.includes(choice.printing)) return null;
    return { ownerSeat: 'opponent', zone: 'active', index: -1, slot };
  }
  if (metadata.targetZone === 'bench') {
    const index = Number.isSafeInteger(metadata.benchIndex) ? metadata.benchIndex :
      Number.isSafeInteger(metadata.targetIndex) ? metadata.targetIndex :
      Number.isSafeInteger(metadata.slotIndex) ? metadata.slotIndex : null;
    const slot = index === null ? null : view.opponentPublic.bench[index];
    if (!slot || !Array.isArray(slot.tools) || !slot.tools.includes(choice.printing)) return null;
    return { ownerSeat: 'opponent', zone: 'bench', index, slot };
  }
  const candidates = [
    { ownerSeat: 'opponent', zone: 'active', index: -1, slot: view.opponentPublic.active },
    ...view.opponentPublic.bench.map((slot, index) => ({ ownerSeat: 'opponent', zone: 'bench', index, slot }))
  ].filter(row => row.slot && Array.isArray(row.slot.tools) && row.slot.tools.includes(choice.printing));
  return candidates.length === 1 ? candidates[0] : null;
}
function fieldBlowerToolRemovalScore(view, choice, target) {
  const printing = choice.printing;
  const active = target?.zone === 'active';
  let score = active ? 100 : 50;
  if (hasName(printing, 'Tool Jammer')) score += active ? 100 : 40;
  if (hasAnyName(printing, ['Big Charm', 'Fighting Fury Belt'])) score += active ? 80 : 30;
  if (hasAnyName(printing, ['Float Stone', 'Air Balloon', 'Big Air Balloon'])) score += active ? 75 : 25;
  if (hasName(printing, 'Choice Band')) score += active ? 65 : 20;
  if (hasName(printing, 'Stealthy Hood')) score += active ? 55 : 20;
  if (hasName(printing, 'Stealthy Hood') && fieldBlowerHoodBlocksFairyZone(view, target)) score += 2000;
  return score;
}
function chooseFieldBlowerToolChoice(view, prompt) {
  setPolicyAuditRule('FIELD_BLOWER_TOOL_REMOVAL_SCORE',
    'FAIRY_ZONE_HOOD_BLOCKER_THEN_ACTIVE_TARGET_VALUE_DESC_PRINTING_ASC');
  const metadata = prompt.publicMetadata;
  if (!isFieldBlowerPrompt(prompt) ||
      metadata?.selectionType !== 'card-combination' ||
      metadata.sourceZone !== 'tool' || metadata.ownerSeat !== 'opponent' ||
      metadata.isOwnerVisible !== true || metadata.minimumCount !== 1 ||
      metadata.maximumCount !== 1 || metadata.allowCancel !== false ||
      metadata.isSecret !== false) return abstain('UNTRUSTED_CARD_SELECTION');
  const choices = prompt.choices.filter(choice =>
    choice.kind === 'card' && isText(choice.printing) &&
    choice.publicMetadata?.sourceZone === 'tool' &&
    choice.publicMetadata?.ownerSeat === 'opponent' &&
    choice.publicMetadata?.isOwnerVisible === true);
  if (choices.length !== prompt.choices.length || choices.length < 2) {
    return abstain('UNTRUSTED_CARD_SELECTION');
  }
  const visibleTools = [
    view.opponentPublic?.active,
    ...(Array.isArray(view.opponentPublic?.bench) ? view.opponentPublic.bench : [])
  ].filter(Boolean).flatMap(slot => Array.isArray(slot.tools) ? slot.tools : []);
  const remaining = new Map();
  for (const printing of visibleTools) if (isText(printing)) {
    remaining.set(printing, (remaining.get(printing) ?? 0) + 1);
  }
  for (const choice of choices) {
    const count = remaining.get(choice.printing) ?? 0;
    if (count < 1) return abstain('NO_SUPPORTED_CARD_SELECTION');
    remaining.set(choice.printing, count - 1);
  }
  const ranked = choices.map(choice => {
    const target = fieldBlowerToolTarget(view, choice);
    return { choice, target, score: target ? fieldBlowerToolRemovalScore(view, choice, target) : -Infinity };
  });
  if (ranked.some(row => !row.target)) return abstain('NO_SUPPORTED_CARD_SELECTION');
  ranked.sort((a, b) => b.score - a.score ||
    String(a.choice.printing).localeCompare(String(b.choice.printing)) ||
    String(a.choice.token).localeCompare(String(b.choice.token)));
  for (const row of ranked) recordPolicyAuditScore(row.choice.token, row.score, 'NO_FIELD_BLOWER_TOOL_REMOVAL_SCORE');
  return { kind: 'select-choices', tokens: [ranked[0].choice.token] };
}
function chooseCardCombination(view, prompt, receipt = null) {
  setPolicyAuditRule('CARD_COMBINATION_SEARCH_SCORE', 'SCORE_DESC_PRINTING_ASC');
  const metadata = prompt.publicMetadata;
  if (!metadata || metadata.selectionType !== 'card-combination' ||
      metadata.ownerSeat !== 'actor' || metadata.isOwnerVisible !== true ||
      !['deck', 'hand', 'discard', 'prizes'].includes(metadata.sourceZone)) {
    return abstain('UNTRUSTED_CARD_SELECTION');
  }
  const choices = prompt.choices.filter(choice =>
    choice.kind === 'card' && isText(choice.printing) &&
    choice.publicMetadata?.ownerSeat === 'actor' &&
    choice.publicMetadata?.isOwnerVisible === true);
  const minimum = metadata.minimumCount;
  const maximum = metadata.maximumCount;
  if (!Number.isSafeInteger(minimum) || !Number.isSafeInteger(maximum) ||
      minimum < 0 || maximum < minimum) return abstain('BAD_CARD_SELECTION_BOUNDS');

  if (metadata.sourceZone === 'prizes' && choices.length === 0) {
    const empty = prompt.choices.find(choice => choice.kind === 'empty-selection');
    if (minimum === 0 && empty && hasName(prompt.source?.sourcePrinting,'Hisuian Heavy Ball'))
      return {kind:'select-choice',token:empty.token};
    return abstain('HIDDEN_PRIZE_IDENTITY');
  }

  const ranked = searchCandidates(view, prompt, choices, receipt)
    .sort((a, b) => b.score - a.score ||
      String(a.choice.printing).localeCompare(String(b.choice.printing)));

  let selected = [];
  if (metadata.sourceZone === 'deck' && hasName(prompt.source?.sourcePrinting,'Arven')) {
    const item = ranked.find(row => isItem(row.choice.printing));
    const tool = ranked.find(row => isTool(row.choice.printing));
    const pair = [item,tool].filter(Boolean).sort((a,b)=>b.score-a.score);
    selected = pair.filter((row,index)=>row.score>0 || index<minimum)
      .slice(0,maximum).map(row=>row.choice);
  } else if (metadata.sourceZone === 'hand' ||
      (metadata.sourceZone === 'deck' && prompt.source?.effectName === 'Battle Compressor')) {
    selected = ranked.slice(0, minimum).filter(row => Number.isFinite(row.score))
      .map(row => row.choice);
  } else {
    selected = ranked.filter(row => row.score > 0)
      .slice(0, maximum).map(row => row.choice);
    if (selected.length < minimum) {
      selected = ranked.slice(0, minimum).map(row => row.choice);
    }
  }

  if (selected.length === 0 && minimum === 0) {
    const empty = prompt.choices.find(choice => choice.kind === 'empty-selection');
    return empty ? { kind: 'select-choice', token: empty.token } :
      abstain('NO_USEFUL_CARD_CHOICE');
  }
  if (selected.length < minimum || selected.length > maximum) {
    return abstain('NO_LEGAL_CARD_SET');
  }

  if (hasName(prompt.source?.sourcePrinting,'Arven') && selected.length >= 2) {
    const item = selected.find(choice => isItem(choice.printing));
    const tool = selected.find(choice => isTool(choice.printing));
    if (item && tool && item.token !== tool.token) {
      selected = [item, tool].slice(0, Math.min(maximum, Math.max(minimum, 2)));
    } else if (minimum >= 2) {
      return abstain('ARVEN_ITEM_TOOL_PAIR_UNAVAILABLE');
    }
  }

  return { kind: 'select-choices', tokens: selected.map(choice => choice.token) };
}

function choosePokemonRecipient(view, prompt) {
  setPolicyAuditRule('POKEMON_TARGET_SCORE', 'SCORE_DESC_NATIVE_TARGET_INDEX');
  const metadata = prompt.publicMetadata;
  if (!metadata || metadata.selectionType !== 'pokemon') {
    return abstain('UNSUPPORTED_POKEMON_PROMPT');
  }
  const minimum = metadata.minimumCount;
  const maximum = metadata.maximumCount;
  if (!Number.isSafeInteger(minimum) || !Number.isSafeInteger(maximum) ||
      minimum < 0 || maximum < minimum) return abstain('BAD_POKEMON_SELECTION_BOUNDS');

  const visible = prompt.choices.map(choice => ({
    choice, target: slotForPokemonChoice(view, choice)
  })).filter(row => row.target !== null);

  if (visible.length === 0) {
    const empty = prompt.choices.find(choice => choice.kind === 'empty-selection');
    if (minimum === 0 && empty) return { kind: 'select-choice', token: empty.token };
    return abstain('NO_VISIBLE_POKEMON_TARGET');
  }

  const effectName = prompt.source?.effectName ?? '';
  const actorChoices = visible.filter(row => row.target.ownerSeat === 'actor');
  const opponentChoices = visible.filter(row => row.target.ownerSeat === 'opponent');

  let ranked;
  if ((hasName(prompt.source?.sourcePrinting, 'Stealthy Hood') ||
       effectName === 'Stealthy Hood') && actorChoices.length > 0) {
    ranked = actorChoices.map(row => {
      const slot = row.target.slot;
      let score = -Infinity;
      if (hasOpponentAbilityLockOnFairyZoneHolder(view, slot)) score = 2400;
      if (row.target.zone === 'active' &&
          (isShadowRiderVmax(slot) || isBasicShadowRiderV(slot)) &&
          hasActiveStealthyHoodThreat(view) &&
          Array.isArray(slot.tools) && slot.tools.length === 0) {
        score = Math.max(score, 1800);
      }
      if (isDragon(slot) && hasOpponentFairyZoneThreat(view) &&
          Array.isArray(slot.tools) && slot.tools.length === 0) {
        score = Math.max(score, 1700);
      }
      return { ...row, score };
    });
  } else if (effectName === 'Acerola' && actorChoices.length > 0) {
    ranked = actorChoices.map(row => {
      const slot = row.target.slot;
      if (slot.damage <= 0) return { ...row, score: -Infinity };
      const remaining = Math.max(0, slot.hp - slot.damage);
      return {
        ...row,
        score: 1000 + Math.min(600, slot.damage * 2) +
          slotEnergyCount(slot) * 80 + (remaining <= 120 ? 400 : 0) +
          prizeLiability(slot) * 100
      };
    });
  } else if (effectName === 'Guzma' && actorChoices.length > 0) {
    const target = view.opponentPublic.active;
    ranked = actorChoices.map(row => {
      const attack = bestAttackForSlot(row.target.slot, view, target);
      if (!attack) return { ...row, score: -Infinity };
      const liability = prizeLiability(row.target.slot);
      const lethal = attack.damage !== null &&
        attack.damage >= Math.max(0, target.hp - target.damage);
      return {
        ...row,
        score: attack.score + (lethal ? 100000 : 0) - liability * 2000
      };
    });
  } else if (effectName === 'Guzma' && opponentChoices.length > 0) {
    const attacker = view.ownPublic.active;
    ranked = opponentChoices.map(row => {
      const attack = bestAttackForSlot(attacker, view, row.target.slot);
      const liability = prizeLiability(row.target.slot);
      return {
        ...row,
        score: (attack?.score ?? -1000) + liability * 1200 -
          Math.max(0, row.target.slot.hp - row.target.slot.damage)
      };
    });
  } else {
    ranked = actorChoices.map(row => {
      const slot = row.target.slot;
      let score = 100 - slotEnergyCount(slot) * 5;
      if (opponentHasRegidrago(view) && hasName(slot.printing, 'Mimikyu') &&
          slotEnergyCount(slot) < 2) score += 1000;
      if (isShadowRiderVmax(slot) && psychicEnergyCount(view) < 5) score += 700;
      if (opponentHasDragon(view) && hasName(slot.printing, "Lillie's Clefairy ex") &&
          slotEnergyCount(slot) < 2) score += 600;
      if (hasName(slot.printing, 'Trevenant & Dusknoir-GX') &&
          view.opponentPublic.handCount >= 4 && slotEnergyCount(slot) < 3) {
        score += 850 + Math.min(100, (view.opponentPublic.handCount - 4) * 20);
      }
      if (isBasicShadowRiderV(slot)) score += 100;
      return { ...row, score };
    });
  }

  for (const row of ranked) recordPolicyAuditScore(row.choice.token, row.score, 'NO_POKEMON_TARGET_SCORE');
  ranked.sort((a, b) => b.score - a.score ||
    a.target.index - b.target.index);
  const selected = ranked.filter(row => Number.isFinite(row.score))
    .slice(0, Math.max(minimum, Math.min(maximum, 1)));
  if (selected.length < minimum) return abstain('NO_SUPPORTED_POKEMON_CHOICE');
  if (minimum === 0 && selected.length === 0) {
    const empty = prompt.choices.find(choice => choice.kind === 'empty-selection');
    return empty ? { kind: 'select-choice', token: empty.token } :
      abstain('NO_POKEMON_SELECTION');
  }
  if (maximum === 1 && selected.length === 1) {
    return { kind: 'select-choices', tokens: [selected[0].choice.token] };
  }
  return { kind: 'select-choices', tokens: selected.map(row => row.choice.token) };
}

function chooseEnergyPayment(view, prompt) {
  setPolicyAuditRule('ENERGY_DISCARD_VALUE_ASC', 'SCORE_ASC_PRINTING_ASC');
  const metadata = prompt.publicMetadata;
  if (!metadata || metadata.selectionType !== 'energy-payment') {
    return abstain('UNTRUSTED_ENERGY_SELECTION');
  }
  const minimum = 1;
  const maximum = Math.min(
    metadata.energyCount ?? metadata.count ?? 1,
    prompt.choices.filter(choice => choice.kind === 'energy').length
  );
  const choices = prompt.choices.filter(choice =>
    choice.kind === 'energy' && choice.publicMetadata?.ownerSeat === 'actor' &&
    choice.publicMetadata?.isOwnerVisible === true && isText(choice.printing));
  const ranked = choices.map(choice => ({
    choice,
    score: discardValue(view, choice.printing)
  }));
  for (const row of ranked) recordPolicyAuditScore(row.choice.token, row.score, 'NO_DISCARD_VALUE_SCORE');
  ranked.sort((a, b) => a.score - b.score ||
    String(a.choice.printing).localeCompare(String(b.choice.printing)));
  const requested = metadata.energyCount ?? metadata.count;
  if (!Number.isSafeInteger(requested) || requested < 1 || requested > maximum)
    return abstain('NO_VISIBLE_ENERGY_CHOICE');
  const selected = ranked.slice(0, requested);
  if (selected.length !== requested) return abstain('NO_VISIBLE_ENERGY_CHOICE');
  return { kind: 'select-choices', tokens: selected.map(row => row.choice.token) };
}

function chooseEnergyAttachment(view, prompt) {
  setPolicyAuditRule('UNDERWORLD_DOOR_ENERGY_TARGET_SCORE', 'SCORE_DESC_BENCH_INDEX_TOKEN_ASC');
  const metadata = prompt.publicMetadata;
  if (!metadata || metadata.selectionType !== 'energy-attachment' ||
      metadata.minimumCount !== 1 || metadata.maximumCount !== 1 ||
      metadata.sourceZone !== 'hand' || metadata.ownerSeat !== 'actor' ||
      metadata.isOwnerVisible !== true || metadata.energyType !== 'BASIC' ||
      metadata.zone !== 'bench' || typeof metadata.allowCancel !== 'boolean' ||
      prompt.source?.effectName !== 'Underworld Door' ||
      !hasName(prompt.source?.sourcePrinting, 'Shadow Rider Calyrex VMAX')) {
    return abstain('UNTRUSTED_ENERGY_SELECTION');
  }

  const ranked = prompt.choices.map(choice => {
    const item = choice.publicMetadata;
    const index = choiceBenchIndex(choice);
    const target = Number.isSafeInteger(index)
      ? view.ownPublic.bench[index] ?? null : null;
    const valid = choice.kind === 'energy' &&
      hasName(choice.printing, 'Psychic Energy') &&
      item?.sourceZone === 'hand' && item?.ownerSeat === 'actor' &&
      item?.isOwnerVisible === true && item?.energyType === 'BASIC' &&
      item?.zone === 'bench' && target && target.printed?.types?.includes('Psychic');
    if (!valid) return { choice, index: Number.MAX_SAFE_INTEGER, score: -Infinity };

    const attached = slotEnergyCount(target);
    let score = 100 - attached * 20;
    // Copycat remains unadmitted. Mimikyu receives only residual Filch value.
    if (opponentHasDragon(view) && hasName(target.printing, "Lillie's Clefairy ex") &&
        attached < 2) score += 900;
    if (hasName(target.printing, 'Trevenant & Dusknoir-GX') &&
        view.opponentPublic.handCount >= 4 && attached < 3) {
      score += 850 + Math.min(100, (view.opponentPublic.handCount - 4) * 20);
    }
    if (isShadowRiderVmax(target) && psychicEnergyCount(view) < 5 &&
        attached < 5) score += 800;
    if (isBasicShadowRiderV(target) && hasUnevolvedShadowRiderV(view)) score += 700;
    return { choice, index, score };
  });
  for (const row of ranked) {
    recordPolicyAuditScore(row.choice.token, row.score, 'INVALID_UNDERWORLD_ASSIGNMENT');
  }
  ranked.sort((a, b) => b.score - a.score ||
    a.index - b.index || a.choice.token.localeCompare(b.choice.token));
  if (!Number.isFinite(ranked[0]?.score)) {
    const cancel = metadata.allowCancel === true
      ? prompt.choices.find(choice => choice.kind === 'cancel') : null;
    if (cancel) {
      recordPolicyAuditRule(cancel.token, 'SELECTED_BY_POLICY_RULE');
      return { kind: 'select-choice', token: cancel.token };
    }
    return abstain('NO_VISIBLE_ENERGY_CHOICE');
  }
  return { kind: 'select-choice', token: ranked[0].choice.token };
}

function chooseAttackPrompt(view, prompt, receipt) {
  return abstain('NO_SUPPORTED_ATTACK_CHOICE'); // copied-attack path outside successor scope
}

function choosePrizeSlots(prompt) {
  setPolicyAuditRule('PRIZE_SELECTION_INDEX_ASC', 'SELECTION_INDEX_ASC');
  const metadata = prompt.publicMetadata;
  if (!metadata || metadata.selectionType !== 'prize-slots' ||
      !Number.isSafeInteger(metadata.requiredCount)) {
    return abstain('UNSUPPORTED_PRIZE_SELECTION');
  }
  const required = metadata.requiredCount;
  const choices = prompt.choices.filter(choice =>
    choice.kind === 'prize' && Number.isSafeInteger(choice.publicMetadata?.selectionIndex));
  const selected = choices.sort((a, b) =>
    a.publicMetadata.selectionIndex - b.publicMetadata.selectionIndex).slice(0, required);
  if (selected.length !== required || required < 0) {
    return abstain('NO_LEGAL_PRIZE_SELECTION');
  }
  if (required === 0) {
    const empty = prompt.choices.find(choice => choice.kind === 'empty-selection');
    return empty ? { kind: 'select-choice', token: empty.token } : abstain('NO_EMPTY_PRIZE_CHOICE');
  }
  return { kind: 'select-choices', tokens: selected.map(choice => choice.token) };
}

function chooseCardOrder(view, prompt) {
  setPolicyAuditRule('CARD_ORDER_SEARCH_NEED_SCORE_DESC', 'SCORE_DESC_PRINTING_ASC');
  const metadata = prompt.publicMetadata;
  if (!metadata || metadata.selectionType !== 'card-order') {
    return abstain('UNSUPPORTED_CARD_ORDER');
  }
  const choices = prompt.choices.filter(choice =>
    choice.kind === 'card-order-item' && isText(choice.printing) &&
    choice.publicMetadata?.ownerSeat === 'actor' &&
    choice.publicMetadata?.isOwnerVisible === true);
  const ranked = choices.map(choice => ({
    choice, score: searchNeedScore(view, choice.printing, prompt.source?.effectName ?? '')
  }));
  for (const row of ranked) recordPolicyAuditScore(row.choice.token, row.score, 'NO_CARD_ORDER_SCORE');
  ranked.sort((a, b) => b.score - a.score ||
    String(a.choice.printing).localeCompare(String(b.choice.printing)));
  const required = metadata.count;
  if (!Number.isSafeInteger(required) || ranked.length !== required) {
    return abstain('CARD_ORDER_COUNT_MISMATCH');
  }
  return { kind: 'select-choices', tokens: ranked.map(row => row.choice.token) };
}

// Setup is not an in-turn play: retaining Lele and Radiant preserves their entry triggers.
// Initial selection order determines Active; the repeated min=0 prompt only fills Bench.
// Heuristic priorities are provisional and see no opponent setup or hidden zones.
function openingActiveScore(printing, {lockbridge, radiantAvailable, pivotAvailable}) {
  if (isBasicShadowRiderVPrinting(printing)) return 100;
  if (hasName(printing, 'Wobbuffet')) {
    if (!lockbridge) return -1000;
    return radiantAvailable && !pivotAvailable ? 65 : 115;
  }
  if (hasName(printing, 'Latias ex')) return 75;
  if (hasName(printing, 'Girafarig')) return 70;
  if (hasName(printing, 'Mimikyu')) return 68;
  if (hasName(printing, "Lillie's Clefairy ex")) return 55;
  if (hasName(printing, 'Trevenant & Dusknoir-GX')) return 35;
  if (hasName(printing, 'Marshadow')) return 30;
  if (hasName(printing, 'Tapu Lele-GX')) return 15;
  if (hasName(printing, 'Radiant Eternatus')) return 5;
  if (hasName(printing, 'Dialga-GX')) return -20; // no Metal in either profile
  return -1000;
}
function isSetupTrigger(printing) {
  return hasAnyName(printing, ['Radiant Eternatus', 'Tapu Lele-GX']);
}
function chooseStartingPokemonSetup(view, prompt, profile) {
  setPolicyAuditRule('STRATEGIC_STARTING_BASICS', 'SCORE_DESC_NATIVE_INDEX_ASC');
  const metadata = prompt.publicMetadata;
  if (!metadata || metadata.selectionType !== 'card-combination' ||
      metadata.sourceZone !== 'hand' || metadata.ownerSeat !== 'actor' ||
      metadata.isOwnerVisible !== true || metadata.isSecret !== false ||
      metadata.allowCancel !== false ||
      !Number.isSafeInteger(metadata.minimumCount) ||
      !Number.isSafeInteger(metadata.maximumCount) ||
      (metadata.minimumCount !== 0 && metadata.minimumCount !== 1) ||
      metadata.maximumCount < metadata.minimumCount ||
      (metadata.minimumCount === 1 && metadata.maximumCount > 6) ||
      !Array.isArray(prompt.choices)) {
    return abstain('BAD_STARTING_POKEMON_SETUP_PROMPT');
  }

  const cardChoices = [];
  const emptyChoices = [];
  for (const choice of prompt.choices) {
    if (choice.kind === 'empty-selection') {
      emptyChoices.push(choice);
      continue;
    }
    if (choice.kind !== 'card') {
      return abstain('UNEXPECTED_STARTING_POKEMON_CHOICE');
    }
    const item = choice.publicMetadata;
    if (!isText(choice.token) || !isText(choice.printing) ||
        choice.label !== choice.printing || !item ||
        !Number.isSafeInteger(item.selectionIndex) ||
        item.selectionIndex < 0 ||
        item.sourceZone !== 'hand' || item.ownerSeat !== 'actor' ||
        item.isOwnerVisible !== true || item.selectedCount !== 1) {
      return abstain('UNTRUSTED_STARTING_POKEMON_CHOICE');
    }
    cardChoices.push(choice);
  }

  if (emptyChoices.length !== (metadata.minimumCount === 0 ? 1 : 0) ||
      emptyChoices.some(choice => !isText(choice.token) ||
        choice.label !== 'Choose no items')) {
    return abstain('BAD_STARTING_POKEMON_EMPTY_CHOICE');
  }

  let previousIndex = -1;
  for (const choice of cardChoices) {
    const index = choice.publicMetadata.selectionIndex;
    if (index <= previousIndex) {
      return abstain('UNORDERED_STARTING_POKEMON_CHOICES');
    }
    previousIndex = index;
  }

  if (!Array.isArray(view.ownPublic?.bench) || !Array.isArray(view.ownHand)) {
    return abstain('MISSING_PUBLIC_BENCH_FOR_SETUP');
  }
  const initial = metadata.minimumCount === 1;
  if (!initial && !view.ownPublic.active) {
    return abstain('MISSING_ACTIVE_FOR_EXTRA_BENCH');
  }
  const visible = [...view.ownHand, ...cardChoices.map(choice => choice.printing)];
  const bench = view.ownPublic.bench.filter(Boolean);
  const lockbridge = profile.profileId === 'lockbridge-shadow-rider-v1';
  const radiantAvailable = visible.some(p => hasName(p, 'Radiant Eternatus'));
  const pivotAvailable = visible.some(p => hasAnyName(p, ['Latias ex', 'Float Stone'])) ||
    bench.some(slot => hasName(slot.printing, 'Latias ex'));
  const context = { lockbridge, radiantAvailable, pivotAvailable };
  const nativeIndex = row => row.choice.publicMetadata.selectionIndex;
  const ranked = cardChoices.map(choice => ({
    choice, score: openingActiveScore(choice.printing, context)
  })).sort((a,b) => b.score-a.score || nativeIndex(a)-nativeIndex(b));
  if (ranked.some(row => row.score === -1000)) {
    return abstain('UNTRUSTED_STARTING_POKEMON_CHOICE');
  }
  const selected = [];
  if (initial) {
    if (!ranked.length) return abstain('INSUFFICIENT_STARTING_POKEMON_CHOICES');
    for (const row of ranked) recordPolicyAuditScore(row.choice.token, row.score, 'STARTER_SCORE');
    selected.push(ranked.shift().choice);
  }
  const activePrinting = initial ? selected[0].printing : view.ownPublic.active.printing;
  // Keep three empty Bench slots for Radiant + two VMAX unless its trigger is already spent.
  const radiantSpent = [activePrinting, ...bench.map(slot => slot.printing)]
    .some(p => hasName(p, 'Radiant Eternatus'));
  const benchLimit = radiantSpent ? 4 : 2;
  const room = Math.max(0, Math.min(5-bench.length, benchLimit-bench.length,
    metadata.maximumCount-selected.length));
  const benchScore = printing => {
    if (isBasicShadowRiderVPrinting(printing)) return 100;
    if (hasName(printing, 'Latias ex') &&
        !hasName(activePrinting,'Latias ex') &&
        !bench.some(slot => hasName(slot.printing,'Latias ex'))) {
      return hasName(activePrinting,'Wobbuffet') ? 120 : 80;
    }
    // Bench a one-Prize alternative to prevent an exposed lone starter, but never
    // populate surplus slots with low-value targets merely because they are legal.
    if (hasAnyName(printing,['Girafarig','Mimikyu','Marshadow','Wobbuffet'])) return 30;
    if (hasName(printing,"Lillie's Clefairy ex")) return 20;
    if (hasName(printing,'Trevenant & Dusknoir-GX')) return 10;
    if (isSetupTrigger(printing)) return -100;
    return -200;
  };
  const candidates = ranked.map(row=>({choice:row.choice,score:benchScore(row.choice.printing)}))
    .sort((a,b)=>b.score-a.score||nativeIndex(a)-nativeIndex(b));
  let placed=0;
  for (const row of candidates) {
    if (!initial) recordPolicyAuditScore(row.choice.token,row.score,'OPTIONAL_BENCH_SCORE');
    if (placed>=room || row.score<=0) continue;
    if (row.score<80 && bench.length+placed>0) continue;
    selected.push(row.choice);
    placed++;
  }
  // If the sole starter is a fragile single-Prize body and there is literally no
  // other safe Bench candidate, give up Wonder Tag rather than risk a lone-board
  // loss. Radiant is retained instead; its setup payoff is the shared engine.
  if (room>0 && bench.length+placed===0 &&
      hasAnyName(activePrinting,['Girafarig','Mimikyu','Marshadow'])) {
    const lele=candidates.find(row=>hasName(row.choice.printing,'Tapu Lele-GX'));
    if (lele) selected.push(lele.choice);
  }
  setPolicyAuditRule(initial ? 'STRATEGIC_INITIAL_ACTIVE_AND_BENCH' :
    'POST_BONUS_RETAIN_TRIGGERS_AND_RESERVE_BENCH', 'SCORE_DESC_NATIVE_INDEX_ASC');
  if (selected.length < metadata.minimumCount) return abstain('INSUFFICIENT_STARTING_POKEMON_CHOICES');
  if (selected.length===0) return {kind:'select-choice',token:emptyChoices[0].token};
  return {kind:'select-choices',tokens:selected.map(choice=>choice.token)};
}

function chooseGoFirstSetup(prompt, profile) {
  // Pre-deal field prior, not a prediction from the future hand. Both profiles
  // provisionally prefer second for first-turn Supporter access and protection
  // from a first-opponent-turn attack; Lockbridge can also start Wobbuffet.
  setPolicyAuditRule(profile.profileId==='lockbridge-shadow-rider-v1' ?
    'PREDEAL_SECOND_LOCKBRIDGE' : 'PREDEAL_SECOND_HOOD', 'UNIQUE_NO_CHOICE');
  if (prompt.publicMetadata?.selectionType !== 'confirm' ||
      !Array.isArray(prompt.choices) || prompt.choices.length !== 2) {
    return abstain('BAD_GO_FIRST_SETUP_PROMPT');
  }
  const yes = prompt.choices.filter(choice =>
    choice.kind === 'confirm' && choice.label === 'Yes');
  const no = prompt.choices.filter(choice =>
    choice.kind === 'confirm' && choice.label === 'No');
  if (yes.length !== 1 || no.length !== 1 ||
      !isText(yes[0].token) || !isText(no[0].token) ||
      yes[0].token === no[0].token) {
    return abstain('BAD_GO_FIRST_CONFIRM_CHOICES');
  }
  return { kind: 'select-choice', token: no[0].token };
}

function chooseMulliganDrawSetup(prompt) {
  setPolicyAuditRule('MULLIGAN_MAX_DRAW_COUNT', 'DRAW_COUNT_DESC_CHOICE_INDEX_ASC');
  const metadata = prompt.publicMetadata;
  if (!metadata || metadata.selectionType !== 'option' ||
      metadata.allowCancel !== false ||
      !Number.isSafeInteger(metadata.count) || metadata.count < 1 ||
      !Array.isArray(prompt.choices) || prompt.choices.length === 0) {
    return abstain('BAD_MULLIGAN_DRAW_SETUP_PROMPT');
  }

  const seenIndices = new Set();
  let best = null;
  for (const choice of prompt.choices) {
    if (choice.kind !== 'option' || !isText(choice.token)) {
      return abstain('UNEXPECTED_MULLIGAN_DRAW_CHOICE');
    }
    const index = choice.publicMetadata?.choiceIndex;
    if (!Number.isSafeInteger(index) || index < 0 ||
        index >= metadata.count || seenIndices.has(index)) {
      return abstain('BAD_MULLIGAN_DRAW_CHOICE_INDEX');
    }
    seenIndices.add(index);
    const drawCount = metadata.count - 1 - index;
    recordPolicyAuditScore(choice.token, drawCount, 'MULLIGAN_DRAW_COUNT');
    if (choice.label !== `Draw ${drawCount} card(s)`) {
      return abstain('MULLIGAN_DRAW_LABEL_INDEX_MISMATCH');
    }
    if (!best || drawCount > best.drawCount) {
      best = { choice, drawCount };
    }
  }

  return best
    ? { kind: 'select-choice', token: best.choice.token }
    : abstain('NO_MULLIGAN_DRAW_OPTION');
}

function chooseEngineSetupPrompt(view, prompt, profile) {
  if (prompt.description === 'CHOOSE_STARTING_POKEMONS') setPolicyAuditRule('STARTING_BASICS_NATIVE_ORDER', 'NATIVE_SELECTION_INDEX_ASC');
  else if (prompt.description === 'GO_FIRST') setPolicyAuditRule('GO_FIRST_AFFIRMATIVE_DEFAULT', 'UNIQUE_YES_CHOICE');
  else if (prompt.description === 'WANT_TO_DRAW_CARDS') setPolicyAuditRule('MULLIGAN_MAX_DRAW_COUNT', 'DRAW_COUNT_DESC_CHOICE_INDEX_ASC');
  if (view.phase !== 1) return abstain('UNSUPPORTED_ENGINE_SETUP_PHASE');
  if (prompt.source?.sourceKind !== 'engine' ||
      prompt.source.sourcePrinting !== null ||
      prompt.source.effectName !== prompt.description) {
    return abstain('UNTRUSTED_ENGINE_SETUP_PROMPT');
  }

  if (prompt.promptType === 'ChooseCardsPrompt' &&
      prompt.description === 'CHOOSE_STARTING_POKEMONS') {
    return chooseStartingPokemonSetup(view, prompt, profile);
  }
  if (prompt.promptType === 'ConfirmPrompt' &&
      prompt.description === 'GO_FIRST') {
    return chooseGoFirstSetup(prompt, profile);
  }
  if (prompt.promptType === 'SelectPrompt' &&
      prompt.description === 'WANT_TO_DRAW_CARDS') {
    return chooseMulliganDrawSetup(prompt);
  }
  return abstain('UNSUPPORTED_ENGINE_SETUP_PROMPT');
}

function chooseConfirmPrompt(view, prompt) {
  if (prompt.description !== 'WANT_TO_USE_ABILITY' ||
      prompt.publicMetadata?.selectionType !== 'confirm') {
    return abstain('UNSUPPORTED_CONFIRMATION_SOURCE');
  }

  const sourcePrinting = prompt.source?.sourcePrinting ?? '';
  let useAbility;
  let rule;
  if (hasName(sourcePrinting, 'Radiant Eternatus')) {
    useAbility = canUseClimacticGate(view, true);
    rule = useAbility ? 'RADIANT_CLIMACTIC_GATE_EXPECTED_VALUE_ACCEPT'
      : 'RADIANT_CLIMACTIC_GATE_EXPECTED_VALUE_DECLINE';
  } else if (hasName(sourcePrinting, 'Tapu Lele-GX')) {
    useAbility = Number.isSafeInteger(view.ownPublic.deckCount) &&
      view.ownPublic.deckCount > 0;
    rule = useAbility ? 'TAPU_LELE_WONDER_TAG_DECK_AVAILABLE'
      : 'TAPU_LELE_WONDER_TAG_EMPTY_DECK';
  } else {
    return abstain('UNSUPPORTED_CONFIRMATION_SOURCE');
  }

  const wantedLabel = useAbility ? 'Yes' : 'No';
  const choice = prompt.choices.find(row =>
    row.kind === 'confirm' && row.label === wantedLabel);
  if (!choice) return abstain('UNSUPPORTED_CONFIRMATION_SOURCE');
  setPolicyAuditRule(rule, 'SOURCE_BOUND_YES_NO');
  recordPolicyAuditRule(choice.token, rule);
  return { kind: 'select-choice', token: choice.token };
}

function choosePrompt(view, prompt, receipt, profile) {
  if (!prompt || prompt.actingSeat !== view.actorSeat ||
      prompt.source?.classification !== 'actor-choice') {
    return abstain('UNTRUSTED_PROMPT');
  }
  if (prompt.source.sourceKind === 'engine') {
    return chooseEngineSetupPrompt(view, prompt, profile);
  }
  if (prompt.source.sourceKind !== 'card-effect') {
    return abstain('UNTRUSTED_PROMPT_SOURCE');
  }
  switch (prompt.promptType) {
    case 'ChooseCardsPrompt':
      return isFieldBlowerPrompt(prompt) &&
        prompt.publicMetadata?.sourceZone === 'tool'
        ? chooseFieldBlowerToolChoice(view, prompt)
        : chooseCardCombination(view, prompt, receipt);
    case 'ChoosePokemonPrompt':
      return isFieldBlowerPrompt(prompt)
        ? chooseFieldBlowerPokemon(view, prompt)
        : choosePokemonRecipient(view, prompt);
    case 'ChooseEnergyPrompt':
      return chooseEnergyPayment(view, prompt);
    case 'AttachEnergyPrompt':
      return chooseEnergyAttachment(view, prompt);
    case 'ChooseAttackPrompt':
      return chooseAttackPrompt(view, prompt, receipt);
    case 'ChoosePrizePrompt':
      return choosePrizeSlots(prompt);
    case 'OrderCardsPrompt':
      return chooseCardOrder(view, prompt);
    case 'ConfirmPrompt':
      return chooseConfirmPrompt(view, prompt);
    case 'SelectOptionPrompt':
      if (isFieldBlowerPrompt(prompt)) return chooseFieldBlowerMode(view, prompt);
      // Other multi-option effects remain fail-closed until source-bound support exists.
    case 'SelectPrompt': {
      setPolicyAuditRule('SINGLE_UNAMBIGUOUS_CHOICE', 'ONLY_CHOICE');
      if (prompt.choices.length === 1) {
        return { kind: 'select-choice', token: prompt.choices[0].token };
      }
      return abstain('AMBIGUOUS_SIMPLE_PROMPT');
    }
    default:
      return abstain('UNSUPPORTED_PROMPT_TYPE');
  }
}

function scoreBasicPlay(item, view, profile) {
  const metadata = item.publicMetadata ?? {};
  if (metadata.targetSeat !== 'actor' || metadata.targetZone !== 'bench') return -Infinity;
  const printing = item.actorPrinting ?? '';
  if (!hasOpenBench(view)) return -Infinity;
  const reserveGate = handHas(view,'Radiant Eternatus') &&
    !boardHas(view,'Radiant Eternatus') && openBenchSlots(view)<=3 &&
    expectedClimacticGateTargets(view,2)>=1;
  if (reserveGate && !hasName(printing,'Latias ex')) return -Infinity;
  if (isBasicShadowRiderVPrinting(printing) &&
      !hasBasicShadowRiderV(view)) return 1000;
  if (isBasicShadowRiderVPrinting(printing) &&
      ownBoard(view).filter(isShadowRiderVTarget).length<2 && !reserveGate) return 780;
  if (hasName(printing,'Wobbuffet') && profile?.profileId==='lockbridge-shadow-rider-v1' &&
      !boardHas(view,'Wobbuffet') && !reserveGate &&
      opponentBoard(view).some(p=>hasName(p.printing,'Regidrago') ||
        (!(p.printed?.types??[]).includes('Psychic') && (p.abilities??[]).length>0))) return 660;
  if (hasName(printing, 'Tapu Lele-GX') &&
      !boardHas(view, 'Tapu Lele-GX') && hasOpenBench(view) &&
      view.ownPublic.deckCount > 0 && !hasWonderTagLock(view)) {
    return supporterAvailable(view) ? 720 : -Infinity;
  }
  if (hasName(printing, 'Trevenant & Dusknoir-GX') &&
      !boardHas(view, 'Trevenant & Dusknoir-GX') && hasOpenBench(view) &&
      view.opponentPublic.handCount >= 4 && canFuelNightWatch(view)) {
    return 700 + Math.min(100, (view.opponentPublic.handCount - 4) * 25);
  }
  // Mimikyu Copycat is not an admitted attack path.
  if (hasName(printing, "Lillie's Clefairy ex") && opponentHasDragon(view) &&
      !boardHas(view, "Lillie's Clefairy ex")) return 900;
  if (hasName(printing, 'Latias ex') && !boardHas(view, 'Latias ex')) return 650;
  if (hasName(printing, 'Girafarig') && opponentHasRegidrago(view) &&
      !boardHas(view, 'Girafarig')) return 450;
  if (hasName(printing, 'Marshadow') &&
      view.opponentPublic.stadium.length > 0 && !boardHas(view, 'Marshadow')) return 400;
  return -Infinity;
}

function knownShadowRiderVmaxCount(view) {
  const revealedPrizePrintings = Array.isArray(view.ownPublic.prizeSlots)
    ? view.ownPublic.prizeSlots.filter(slot => isText(slot?.printing))
      .map(slot => slot.printing)
    : [];
  const visiblePrintings = [
    ...ownBoard(view).map(slot => slot.printing),
    ...view.ownHand,
    ...view.ownPublic.discard,
    ...(Array.isArray(view.ownPublic.lostZone) ? view.ownPublic.lostZone : []),
    ...revealedPrizePrintings
  ];
  return visiblePrintings.filter(printing =>
    hasName(printing, 'Shadow Rider Calyrex VMAX')).length;
}

// A terminal Gate line must offer at least 0.75 expected VMAX targets.
const MIN_EXPECTED_CLIMACTIC_GATE_TARGETS = 0.75;

function binomialCoefficient(n, k) {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(k) ||
      n < 0 || k < 0 || k > n) return 0;
  const count = Math.min(k, n - k);
  let result = 1;
  for (let index = 1; index <= count; index += 1) {
    result = result * (n - count + index) / index;
  }
  return result;
}

// Expected number of VMAX cards Climactic Gate can place, capped at two.
// The four-copy population is partitioned only across the actor's known zones,
// deck and prizes; malformed/incomplete counts fail closed.
function expectedClimacticGateTargets(view, maxTargets = 2) {
  if (!Number.isSafeInteger(maxTargets) || maxTargets < 0 || maxTargets > 2) {
    return null;
  }
  if (maxTargets === 0) return 0;
  const deck = view.ownPublic.deckCount;
  const prizeCount = view.ownPublic.prizeCount;
  const revealedPrizeSlots = Array.isArray(view.ownPublic.prizeSlots)
    ? view.ownPublic.prizeSlots.filter(slot => isText(slot?.printing))
    : [];
  const prizes = prizeCount - revealedPrizeSlots.length;
  if (!Number.isSafeInteger(deck) || !Number.isSafeInteger(prizeCount) ||
      deck < 0 || prizeCount < 0 || prizes < 0) return null;
  const remaining = 4 - knownShadowRiderVmaxCount(view);
  const hidden = deck + prizes;
  if (remaining < 0 || remaining > hidden || hidden === 0) return null;
  if (remaining === 0 || deck === 0) return 0;
  const denominator = binomialCoefficient(hidden, remaining);
  if (denominator <= 0) return null;
  const probabilityZero = binomialCoefficient(prizes, remaining) / denominator;
  if (maxTargets === 1) {
    const expected = 1 - probabilityZero;
    return Number.isFinite(expected) ? Math.max(0, Math.min(1, expected)) : null;
  }
  const probabilityOne = deck *
    binomialCoefficient(prizes, remaining - 1) / denominator;
  const expected = 2 - 2 * probabilityZero - probabilityOne;
  return Number.isFinite(expected) ? Math.max(0, Math.min(2, expected)) : null;
}

function canUseClimacticGate(view, alreadyBenched = false) {
  // Radiant Eternatus itself occupies one effective Bench slot before Gate
  // resolves. Estimate only the VMAX targets that can fit after that payment.
  const openBench = openBenchSlots(view);
  if (openBench === null) return false;
  const maxTargets = Math.min(2, Math.max(0, openBench - (alreadyBenched ? 0 : 1)));
  const expectedTargets = expectedClimacticGateTargets(view, maxTargets);
  return maxTargets > 0 && expectedTargets !== null &&
    expectedTargets >= MIN_EXPECTED_CLIMACTIC_GATE_TARGETS &&
    !hasRadiantGateLock(view);
}

function canPlayRadiantForGate(view) {
  return canUseClimacticGate(view) &&
    view.ownTurnResources?.abilityPokemonPlayLocked !== true &&
    view.ownPublic.publicTurnRestrictions?.abilityPokemonPlayLocked !== true;
}

function scoreClimacticGatePlay(item, view) {
  if (!hasName(item.actorPrinting, 'Radiant Eternatus') ||
      !canPlayRadiantForGate(view)) return -Infinity;
  const openBench = openBenchSlots(view);
  return openBench >= 3 ? 1800 : 850;
}

function scoreEvolutionPlay(item) {
  if (hasName(item.actorPrinting, 'Shadow Rider Calyrex VMAX') &&
      hasName(item.targetPrinting, 'Shadow Rider Calyrex V')) return 970;
  return -Infinity;
}

function scoreEnergyPlay(item, view) {
  const metadata = item.publicMetadata ?? {};
  if (view.ownTurnResources?.energyPlayedTurn !== false ||
      view.ownTurnResources?.energyPlayLocked === true ||
      view.ownPublic.publicTurnRestrictions?.energyPlayLocked === true ||
      metadata.targetSeat !== 'actor' ||
      !['active', 'bench'].includes(metadata.targetZone) ||
      !hasName(item.actorPrinting, 'Psychic Energy')) return -Infinity;
  const target = metadata.targetZone === 'active'
    ? view.ownPublic.active : view.ownPublic.bench[metadata.targetIndex];
  if (!target || (item.targetPrinting && target.printing !== item.targetPrinting)) return -Infinity;
  const count = slotEnergyCount(target);
  const charged = {...target,energies:[...target.energies,item.actorPrinting]};
  const chargedView = {...view,ownPublic:{...view.ownPublic,
    active:metadata.targetZone==='active'?charged:view.ownPublic.active,
    bench:view.ownPublic.bench.map((slot,index)=>metadata.targetZone==='bench' &&
      index===metadata.targetIndex?charged:slot)}};
  const defender=view.opponentPublic.active;
  if (defender && metadata.targetZone==='active' && view.globalTurn>1) {
    const before=bestAttackForSlot(target,view,defender);
    const after=bestAttackForSlot(charged,chargedView,defender);
    if (after && after.score>=10000 && (before?.score??0)<10000) return 2200;
    if (after && after.score>Math.max(700,(before?.score??0)+200)) return 1050;
  }
  if (hasName(target.printing,'Trevenant & Dusknoir-GX') &&
      view.opponentPublic.handCount>=4 && count<3) return 930-count*20;
  if (isShadowRiderVmax(target) && count<3) return 910-count*20;
  if (opponentHasDragon(view) && hasName(target.printing,"Lillie's Clefairy ex") && count<2) return 890;
  if (isBasicShadowRiderV(target) && count<3) return 760-count*20;
  if (hasName(target.printing,'Latias ex') && count<3) return 510-count*30;
  if (hasName(target.printing,'Tapu Lele-GX') && count<2) return 480;
  if (hasName(target.printing,'Wobbuffet') && count<2) return 460;
  if (hasName(target.printing,'Girafarig') && count<3) return 400;
  if (hasName(target.printing,'Marshadow') && count<1) return 340;
  if (hasName(target.printing,'Mimikyu') && count<1 && view.ownPublic.handCount<=3) return 320;
  // Do not strand manual energy on a Metal-only Dialga or Dragon Radiant.
  if (isShadowRiderVmax(target)) return 330-count;
  return -Infinity;
}

function hasDiscardableHand(view, required = 1, playedPrinting = null) {
  const hand = view.ownHand.slice();
  const index = hand.indexOf(playedPrinting);
  if (index >= 0) hand.splice(index,1);
  const ranked = hand.map(printing => discardValue({...view,ownHand:hand}, printing))
    .sort((a, b) => a - b);
  return ranked.length >= required && ranked.slice(0, required).every(value => value < 800);
}

function abilityMayBeActive(slot, abilityName) {
  if (!slot) return false;
  if (!Array.isArray(slot.abilities)) return true;
  if (!slot.abilities.includes(abilityName)) return false;
  return abilityStatus(slot, abilityName) !== false;
}

function hasActiveAbilityOnEitherSide(view, cardName, abilityName) {
  return [view.ownPublic.active, view.opponentPublic.active].some(slot =>
    hasName(slot?.printing, cardName) && abilityMayBeActive(slot, abilityName));
}

function hasActiveStadiumLock(view, stadiumName) {
  const stadiums = [...view.ownPublic.stadium, ...view.opponentPublic.stadium];
  if (!stadiums.some(name => hasName(name, stadiumName))) return false;
  // Unknown suppression epochs fail closed: do not assume a lock Stadium is inert.
  return stadiumAndToolEffectsLive(view) !== false;
}

function hasActiveIronThorns(view) {
  return hasActiveAbilityOnEitherSide(view, 'Iron Thorns ex', 'Initialization');
}

function hasActiveWobbuffet(view) {
  return hasActiveAbilityOnEitherSide(view, 'Wobbuffet', 'Bide Barricade');
}

function hasActiveGarbotoxin(view) {
  return allBoard(view).some(slot =>
    hasName(slot.printing, 'Garbodor') &&
    (!Array.isArray(slot.tools) || slot.tools.length > 0) &&
    abilityMayBeActive(slot, 'Garbotoxin'));
}

function hasRadiantGateLock(view) {
  if (hasActiveStadiumLock(view, 'Path to the Peak') ||
      hasActiveStadiumLock(view, 'Silent Lab')) return true;

  // Climactic Gate triggers as Radiant Eternatus enters the Bench. Resolve
  // every public lock source against that Basic Rule Box target, including
  // Active Klefki and source-order interactions; unknown mixed-zone order
  // fails closed rather than treating a default-zero Bench source as first.
  const radiant = {
    printing: 'Radiant Eternatus CRZ 105',
    name: 'Radiant Eternatus',
    subtypes: ['Basic', 'Radiant'],
    printed: { subtypes: ['Basic', 'Radiant'], types: ['Dragon'] },
    types: ['Dragon'],
    abilities: ['Climactic Gate'],
    tools: []
  };
  const resolved = resolveAbilityLockSources(view);
  if (resolved.unknown) return true;
  return resolved.active.some(source =>
    abilityLockSourceSuppressesTarget(source, 'actor', radiant, view) !== false);
}

function hasAbilityLockThreat(view) {
  const opponentActive = view.opponentPublic.active;
  const opponentIronThorns = hasName(opponentActive?.printing, 'Iron Thorns ex') &&
    abilityMayBeActive(opponentActive, 'Initialization');
  const opponentGarbotoxin = opponentBoard(view).some(slot =>
    hasName(slot.printing, 'Garbodor') &&
    (!Array.isArray(slot.tools) || slot.tools.length > 0) &&
    abilityMayBeActive(slot, 'Garbotoxin'));
  return opponentIronThorns || opponentGarbotoxin;
}

function hasActiveStealthyHoodThreat(view) {
  const source = view.opponentPublic.active;
  const target = view.ownPublic.active;
  const targetIsShadowRider = hasName(target?.printing, 'Shadow Rider Calyrex V') ||
    hasName(target?.printing, 'Shadow Rider Calyrex VMAX');
  if (!targetIsShadowRider || !Array.isArray(target.tools) ||
      target.tools.length !== 0 || stadiumAndToolEffectsLive(view) !== true) return false;

  const stadiums = [...view.ownPublic.stadium, ...view.opponentPublic.stadium];
  if (stadiums.some(name =>
    hasAnyName(name, ['Jamming Tower', 'Silent Lab']))) return false;
  if (Array.isArray(source?.tools) &&
      source.tools.some(tool => hasName(tool, 'Tool Jammer'))) return false;

  const flutterMane = hasName(source?.printing, 'Flutter Mane') &&
    effectiveAbilityStatus(source, 'Midnight Fluttering', 'opponent', view) === true;
  const snorlaxBlock = hasName(source?.printing, 'Snorlax PGO 55') &&
    effectiveAbilityStatus(source, 'Block', 'opponent', view) === true;
  return flutterMane || snorlaxBlock;
}

function hasWonderTagLock(view) {
  if (hasActiveStadiumLock(view, 'Path to the Peak') ||
      hasActiveStadiumLock(view, 'Silent Lab')) return true;
  if (view.ownTurnResources?.abilityPokemonPlayLocked === true ||
      view.ownPublic.publicTurnRestrictions?.abilityPokemonPlayLocked === true) return true;
  return hasActiveIronThorns(view) || hasActiveGarbotoxin(view);
}

function parallelCityLimitsActor(view) {
  const ownParallelCity = view.ownPublic.stadium.some(name =>
    hasName(name, 'Parallel City'));
  const opponentParallelCity = view.opponentPublic.stadium.some(name =>
    hasName(name, 'Parallel City'));
  // Pinned Twinleaf Parallel City: DOWN limits its owner; UP limits the
  // non-owner. The actor is capped only for own/DOWN or opponent/UP.
  return (ownParallelCity && view.ownPublic.stadiumDirection === 'down') ||
    (opponentParallelCity && view.opponentPublic.stadiumDirection === 'up');
}

function hasStadiumRemovalTarget(view) {
  // Lock Stadiums can be removed on either side. Parallel City is a target
  // only when its public direction actually caps the actor's Bench.
  const lockStadium = [...view.ownPublic.stadium, ...view.opponentPublic.stadium].some(name =>
    hasName(name, 'Path to the Peak') ||
    hasName(name, 'Silent Lab') ||
    hasName(name, 'Jamming Tower') ||
    hasName(name, 'Wondrous Labyrinth'));
  return lockStadium || parallelCityLimitsActor(view);
}

function hasOpponentToolRemovalTarget(view) {
  return [view.opponentPublic.active, ...view.opponentPublic.bench].some(slot =>
    slot && Array.isArray(slot.tools) && slot.tools.length > 0);
}

function canGuzmaForAttack(view) {
  const active = view.ownPublic.active;
  if (!active || !view.opponentPublic.active) return false;
  return view.opponentPublic.bench.some(slot => {
    if (!slot) return false;
    const attack = bestAttackForSlot(active, view, slot);
    return attack && attack.damage >= Math.max(0, slot.hp - slot.damage);
  });
}

function actionTargetSlot(view, metadata) {
  if (metadata?.targetSeat !== 'actor' || metadata?.isOwnerVisible !== true) return null;
  if (metadata.targetZone === 'active') return view.ownPublic.active ?? null;
  if (metadata.targetZone === 'bench' && Number.isSafeInteger(metadata.targetIndex)) {
    return view.ownPublic.bench[metadata.targetIndex] ?? null;
  }
  return null;
}

function isShadowRiderVTarget(slot) {
  return isBasicShadowRiderV(slot) || isShadowRiderVmax(slot);
}

function hasStarAlchemyLock(view, target) {
  if (hasActiveStadiumLock(view, 'Path to the Peak')) return true;
  if (hasActiveGarbotoxin(view)) return true;
  if (isShadowRiderVTarget(target) && hasActiveIronThorns(view)) return true;
  if (isBasicShadowRiderV(target) &&
      hasActiveStadiumLock(view, 'Silent Lab')) return true;
  return false;
}

function hasStarAlchemyBottleneck(view, receipt) {
  const missingBasicV = !hasBasicShadowRiderV(view) &&
    !handHasBasicShadowRiderV(view) && hasOpenBench(view);
  const missingVmax = hasUnevolvedShadowRiderV(view) &&
    !handHas(view, 'Shadow Rider Calyrex VMAX');
  const missingDialga = opponentHasRegidrago(view) &&
    !boardHas(view, 'Dialga-GX') && !handHas(view, 'Dialga-GX') &&
    !discardHas(view, 'Dialga-GX');
  const missingMimikyu = opponentHasRegidrago(view) &&
    !boardHas(view, 'Mimikyu') && !handHas(view, 'Mimikyu');
  const missingClefairy = opponentHasDragon(view) &&
    !boardHas(view, "Lillie's Clefairy ex") &&
    !handHas(view, "Lillie's Clefairy ex");
  const missingStadiumAnswer = hasStadiumRemovalTarget(view) &&
    !handHas(view, 'Field Blower') && !boardHas(view, 'Marshadow');
  const missingStamp = receipt?.priorOpponentTurnKO?.any === true &&
    !handHas(view, 'Unfair Stamp') && !discardHas(view, 'Unfair Stamp');
  const lowHand = view.ownPublic.handCount <= 1 && view.ownPublic.deckCount > 0;
  if (gateAccessNeed(view)) return true;
  const critical = missingBasicV || missingVmax ||
    missingClefairy || missingStadiumAnswer || missingStamp || lowHand;
  if (!critical) return false;

  const alternativeTrainerPlay = view.ownHand.some(printing =>
    !hasName(printing, 'Forest Seal Stone') &&
    Number.isFinite(scoreTrainerPlay({ actorPrinting: printing }, view, receipt)));
  return !alternativeTrainerPlay;
}

function scoreTrainerPlay(item, view, receipt, profile) {
  const name = item.actorPrinting ?? '';
  const supporterUsed = !supporterAvailable(view);
  if (isItem(name) && itemLocked(view)) return -Infinity;
  if (isTool(name) && view.ownTurnResources?.toolPlayLocked === true) return -Infinity;
  if (hasName(name,'Pokémon Ranger') && profile?.profileId==='hood-shield-shadow-rider-v1' && !supporterUsed && usefulRanger(view)) return 1100;
  if (hasName(name,'Temple of Sinnoh') && profile?.profileId==='lockbridge-shadow-rider-v1') return usefulTemple(view);
  if (hasName(name,'Float Stone')) {
    const target=actionTargetSlot(view,item.publicMetadata);
    if (!target || target.tools?.length!==0 || toolsEffectiveForRetreat(view,target,'actor')!==true ||
        !view.ownPublic.bench.some(Boolean) || hasStealthyHoodSearchNeed(view)) return -Infinity;
    if (target.printed?.subtypes?.includes('Basic') && skylinerStatus(view)===true) return -Infinity;
    if (target===view.ownPublic.active && (ownRetreatCost(view)??0)>0 &&
        (handHas(view,'Radiant Eternatus') && hasName(target.printing,'Wobbuffet') ||
         view.ownPublic.bench.some(slot=>slot && bestAttackForSlot(slot,view,view.opponentPublic.active)?.score>
           (bestAttackForSlot(target,view,view.opponentPublic.active)?.score??0)))) return 870;
    return -Infinity;
  }
  if (hasName(name,'VS Seeker') && Number.isFinite(bestRecoverableSupporter(view,receipt)))
    return 700 + bestRecoverableSupporter(view,receipt);
  if (hasName(name,'Night Stretcher')) {
    const value = Math.max(-Infinity,...view.ownPublic.discard.map(p=>recoveryNeedScore(view,p,receipt)));
    if (value>=70) return 770+value;
  }
  if (hasName(name,'Hisuian Heavy Ball') && view.ownPublic.prizeCount > 0 &&
      (!hasBasicShadowRiderV(view) && !handHasBasicShadowRiderV(view) && hasOpenBench(view) || gateAccessNeed(view))) return 675;
  if (hasName(name, 'Unfair Stamp') && receipt?.priorOpponentTurnKO?.any === true) return 980;
  if (hasName(name, 'Forest Seal Stone')) {
    const target = actionTargetSlot(view, item.publicMetadata);
    if (target && isShadowRiderVTarget(target) &&
        Array.isArray(target.tools) && target.tools.length === 0 &&
        toolsEffectiveForRetreat(view,target,'actor') === true &&
        view.ownTurnResources.vstarUsed !== true &&
        view.ownPublic.publicTurnRestrictions?.vstarUsed !== true &&
        !hasStarAlchemyLock(view, target) &&
        hasStarAlchemyBottleneck(view, receipt)) return gateAccessNeed(view) ? 930 : 550;
  }
  if (hasName(name, 'Field Blower')) {
    if (hasStadiumRemovalTarget(view)) return 950;
    if (hasOpponentToolRemovalTarget(view)) return 720;
  }
  if (hasName(name, 'Teammates') && !supporterUsed &&
      receipt?.priorOpponentTurnKO?.any === true) return 900;
  if (hasName(name, 'Raihan') && !supporterUsed &&
      receipt?.priorOpponentTurnKO?.any === true &&
      discardHas(view, 'Psychic Energy') &&
      view.ownTurnResources.energyPlayedTurn === false) return 880;
  if (hasName(name, 'Acerola') && !supporterUsed &&
      ownBoard(view).some(slot =>
        slot.damage > 0 && slot.hp - slot.damage <= 120)) return 850;
  // Battle Compressor's copied-attack setup is deliberately unsupported.
  const missingBasicV = !hasBasicShadowRiderV(view) &&
    !handHasBasicShadowRiderV(view) && hasOpenBench(view);
  if (hasName(name, 'Fog Crystal') &&
      (missingBasicV ||
       (opponentHasDragon(view) &&
        !boardHas(view, "Lillie's Clefairy ex") &&
        !handHas(view, "Lillie's Clefairy ex")) ||
       psychicEnergyCount(view) < 3)) return 820;
  const needNightWatch = view.opponentPublic.handCount >= 4 &&
    !boardHas(view, 'Trevenant & Dusknoir-GX') &&
    !handHas(view, 'Trevenant & Dusknoir-GX') && canFuelNightWatch(view);
  if (hasName(name, 'Mysterious Treasure') && hasDiscardableHand(view, 1, name) &&
      (gateAccessNeed(view) || missingBasicV || needNightWatch)) return 800;
  if (hasName(name, 'Quick Ball') && hasDiscardableHand(view, 1, name) &&
      (missingBasicV || needNightWatch || gateAccessNeed(view))) return 790;
  if (hasName(name, 'Ultra Ball') && hasDiscardableHand(view, 2, name) &&
      hasUnevolvedShadowRiderV(view) &&
      !handHas(view, 'Shadow Rider Calyrex VMAX')) return 780;
  if (hasName(name, 'Arven') && !supporterUsed &&
      (missingBasicV || hasStealthyHoodSearchNeed(view) || forestSealAccessNeed(view)))
    return forestSealAccessNeed(view) ? 925 : 760;
  if (hasName(name, 'Guzma') && !supporterUsed && canGuzmaForAttack(view)) return 750;
  if (hasName(name, 'Iono') && !supporterUsed &&
      view.opponentPublic.handCount >= 5 && view.ownPublic.handCount >= 4) {
    return 740 + Math.min(40, (view.opponentPublic.handCount - 5) * 10);
  }
  if (hasName(name, "Lillie's Determination") && !supporterUsed &&
      (view.ownPublic.handCount <= 3 || view.ownPublic.deckCount <= 10)) return 700;
  if (hasName(name, 'Sky Field') && !view.ownPublic.stadium.some(s => hasName(s, 'Sky Field')) &&
      countBench(view.ownPublic) + countBench(view.opponentPublic) < 6 &&
      boardHas(view, "Lillie's Clefairy ex")) return 620;
  if (hasName(name, 'Dimension Valley') &&
      dimensionValleyStatus(view) === false &&
      ownBoard(view).some(slot => slot.printed.types.includes('Psychic'))) return 600;
  if (isTool(name) && hasName(name, 'Stealthy Hood') &&
      hasStealthyHoodSearchNeed(view)) return 580;
  return -Infinity;
}

function templePressure(view) {
  const special = opponentBoard(view).flatMap(slot=>slot.energies??[])
    .filter(p=>hasAnyName(p,['Double Dragon Energy','Double Colorless Energy','Twin Energy',
      'Double Turbo Energy','Reversal Energy','Rainbow Energy','Aurora Energy','Prism Energy',
      'Luminous Energy','Mist Energy','Jet Energy','Legacy Energy','Capture Energy','Gift Energy',
      'Powerful Colorless Energy','Rapid Strike Energy','Single Strike Energy']));
  const double = special.filter(p=>hasAnyName(p,['Double Dragon Energy','Double Colorless Energy',
      'Twin Energy','Double Turbo Energy','Reversal Energy','Rapid Strike Energy'])).length;
  return Math.min(1200,double*750 + (special.length-double)*250);
}
function usefulTemple(view) {
  if (view.ownTurnResources?.stadiumPlayedTurn === true ||
      view.ownTurnResources?.stadiumPlayLocked === true ||
      stadiumAndToolEffectsLive(view)!==true ||
      [...view.ownPublic.stadium,...view.opponentPublic.stadium].some(p=>hasName(p,'Temple of Sinnoh'))) return -Infinity;
  // Never force a discard of own occupied Sky Field bench in this slice.
  if (countBench(view.ownPublic)>5) return -Infinity;
  let pressure=templePressure(view);
  if (opponentBoard(view).some(slot=>hasName(slot.printing,'Marshadow') &&
      abilityStatus(slot,'Resetting Hole')===true)) pressure-=250;
  if (view.ownPublic.stadium.some(p=>hasName(p,'Dimension Valley')) &&
      ownBoard(view).some(slot=>slot.printed?.types?.includes('Psychic') &&
        (slot.attacks??[]).some(a=>a.cost?.includes('Colorless') &&
          canPayAttack(slot,a,view) && slotEnergyCount(slot)<a.cost.length))) pressure-=500;
  return pressure>=300 ? 660+pressure/4 : -Infinity;
}
function wobLockValue(view, slot) {
  if (!slot || !hasName(slot.printing,'Wobbuffet') || abilityStatus(slot,'Bide Barricade')===false)
    return 0;
  const board=opponentBoard(view);
  // Known active Klefki and equipped Garbotoxin can suppress Bide Barricade.
  if (hasName(view.opponentPublic.active?.printing,'Klefki') &&
      abilityStatus(view.opponentPublic.active,'Mischievous Lock')!==false) return 0;
  if (hasActiveGarbotoxin(view)) return 0;
  const abilities=board.filter(p=>!(p.printed?.types??[]).includes('Psychic') &&
    (p.abilities??[]).length>0 && p.abilities.some(a=>abilityStatus(p,a)!==false));
  return Math.min(1300,abilities.length*400+
    (board.some(p=>hasName(p.printing,'Regidrago'))?500:0));
}
function ownRetreatCost(view) {
  const active=view.ownPublic.active;
  if (!active || !Array.isArray(active.printed?.retreatCost)) return null;
  const flags=active.publicRestrictions??{};
  const status=normalizeSpecialConditionNames(active.specialConditions??[]);
  if (status===null || status.includes('asleep') || status.includes('paralyzed') ||
      flags.cannotRetreat===true || flags.cannotRetreatNextTurn===true ||
      flags.cannotRetreatWhileActive===true) return null;
  if (active.printed?.subtypes?.includes('Basic') && skylinerStatus(view)===true) return 0;
  const tools=toolsEffectiveForRetreat(view,active,'actor');
  if (tools===true && active.tools?.some(p=>hasName(p,'Float Stone'))) return 0;
  if (tools===null && active.tools?.length) return null;
  let cost=active.printed.retreatCost.length;
  const stadium=[...view.ownPublic.stadium,...view.opponentPublic.stadium];
  if (stadiumAndToolEffectsLive(view)===true) {
    if(stadium.some(p=>hasName(p,'Galar Mine'))) cost+=2;
    if(active.printed?.subtypes?.includes('Basic') &&
      stadium.some(p=>hasName(p,'Skyarrow Bridge'))) cost--;
  }
  return Math.max(0,cost);
}
function freeRetreatKnown(view) {
  return ownRetreatCost(view)===0;
}

function chooseRetreat(view, items, profile) {
  const cost=ownRetreatCost(view);
  if (cost===null || !view.opponentPublic.active || slotEnergyCount(view.ownPublic.active)<cost) return null;
  const current=bestAttackForSlot(view.ownPublic.active,view,view.opponentPublic.active);
  const retreats=items.filter(item=>item.kind==='retreat');
  let best=null;
  for (const item of retreats) {
    const index=item.publicMetadata?.benchIndex;
    if (!Number.isSafeInteger(index)) continue;
    const target=view.ownPublic.bench[index];
    if (!target || (item.targetPrinting && item.targetPrinting!==target.printing)) {
      recordPolicyAuditUnscored(item.token,'RETREAT_TARGET_UNAVAILABLE');continue;
    }
    const old=view.ownPublic.active;
    const moved={...old,energies:old.energies.slice(cost)};
    const movedView={...view,ownPublic:{...view.ownPublic,active:target,
      bench:view.ownPublic.bench.map((p,i)=>i===index?moved:p)}};
    const attack=bestAttackForSlot(target,movedView,view.opponentPublic.active);
    let score=(attack?.score??0)-(current?.score??0)-cost*350;
    if (profile?.profileId==='lockbridge-shadow-rider-v1') {
      const gate=hasName(old.printing,'Wobbuffet') && handHas(view,'Radiant Eternatus') &&
        !hasName(target.printing,'Wobbuffet') && canPlayRadiantForGate(movedView);
      if (gate && (current?.score??0)<10000) score=Math.max(score,1800-cost*350);
      if (!handHas(view,'Radiant Eternatus')) score+=wobLockValue(view,target)-wobLockValue(view,old);
    }
    recordPolicyAuditScore(item.token,score,'RETREAT_SCORE_NOT_FINITE');
    if (score>(best?.score??-Infinity)) best={item,score};
  }
  return best && best.score>100 ? best.item : null;
}

function abilitySourceSlot(view, item) {
  const metadata = item.publicMetadata ?? {};
  if (metadata.sourceSeat !== 'actor') return null;
  if (metadata.sourceZone === 'active') return view.ownPublic.active ?? null;
  if (metadata.sourceZone === 'bench' && Number.isSafeInteger(metadata.sourceIndex)) {
    return view.ownPublic.bench[metadata.sourceIndex] ?? null;
  }
  return null;
}

function underworldDoorSourceIsUnspent(receipt, metadata, source) {
  if (receipt?.version !== 'agent8-public-event-receipt-v3-turn-stamped') return false;
  const ownerSource = metadata.sourceZone === 'active'
    ? receipt.ownerActive
    : metadata.sourceZone === 'bench' && Number.isSafeInteger(metadata.sourceIndex)
      ? receipt.ownerBench?.[metadata.sourceIndex] : null;
  if (!ownerSource || ownerSource.printing !== source.printing ||
      !Array.isArray(ownerSource.knownAbilityUse)) return false;
  const markers = ownerSource.knownAbilityUse.filter(row => row?.name === 'Underworld Door');
  return markers.length === 1 && markers[0].usedThisTurn === false;
}
function canUseUnderworldDoor(view, item, receipt) {
  const metadata = item.publicMetadata ?? {};
  const source = abilitySourceSlot(view, item);
  return metadata.abilityName === 'Underworld Door' &&
    source !== null && isShadowRiderVmax(source) &&
    (!item.actorPrinting || item.actorPrinting === source.printing) &&
    abilityStatus(source, 'Underworld Door') === true &&
    underworldDoorSourceIsUnspent(receipt, metadata, source) &&
    handHas(view, 'Psychic Energy') &&
    view.ownPublic.bench.some(slot =>
      slot && slot.printed?.types?.includes('Psychic'));
}

function canUseStarAlchemy(view, item, receipt) {
  const metadata = item.publicMetadata ?? {};
  const source = abilitySourceSlot(view, item);
  return metadata.abilityName === 'Star Alchemy' &&
    source !== null &&
    (!item.actorPrinting || item.actorPrinting === source.printing) &&
    (source.tools ?? []).some(tool => hasName(tool, 'Forest Seal Stone')) &&
    view.ownTurnResources.vstarUsed !== true &&
    view.ownPublic.publicTurnRestrictions?.vstarUsed !== true &&
    !hasStarAlchemyLock(view, source) &&
    hasStarAlchemyBottleneck(view, receipt);
}

function chooseRoot(view, request, profile) {
  const items = request.actionFrontier.items.filter(item =>
    ['play-card', 'attack', 'retreat', 'use-ability', 'use-stadium', 'pass'].includes(item.kind));
  const pass = items.find(item => item.kind === 'pass');

  const plays = items.filter(item => item.kind === 'play-card');
  const terminalPlays = [];
  const scoredPlays = plays.map(item => {
    const basic = scoreBasicPlay(item, view, profile);
    const evolution = scoreEvolutionPlay(item);
    const energy = scoreEnergyPlay(item, view);
    const trainer = scoreTrainerPlay(item, view, request.publicEventReceipt, profile);
    const terminal = scoreClimacticGatePlay(item, view);
    const score = Math.max(basic, evolution, energy, trainer, terminal);
    recordPolicyAuditScore(item.token, score, 'NO_ELIGIBLE_PLAY_COMPONENT', [
      { name: 'basic-play', score: basic },
      { name: 'evolution-play', score: evolution },
      { name: 'energy-play', score: energy },
      { name: 'trainer-play', score: trainer },
      { name: 'terminal-climactic-gate', score: terminal }
    ]);
    if (Number.isFinite(terminal)) {
      terminalPlays.push({ item, score: terminal });
      return null;
    }
    return { item, score };
  }).filter(row => row && Number.isFinite(row.score)).sort((a, b) =>
    b.score - a.score || a.item.token.localeCompare(b.item.token));
  if (scoredPlays.length > 0) {
    setPolicyAuditRule('ROOT_PLAY_MAX_COMPONENT_SCORE', 'SCORE_DESC_TOKEN_ASC');
    return { kind: 'select-action', token: scoredPlays[0].item.token };
  }

  const retreat = chooseRetreat(view, items, profile);
  if (retreat) {
    setPolicyAuditRule('ROOT_RETREAT_ATTACK_IMPROVEMENT', 'SCORE_DESC_NATIVE_FRONTIER_ORDER');
    return { kind: 'select-action', token: retreat.token };
  }

  const abilities = items.filter(item => item.kind === 'use-ability');
  const resettingHole = abilities.find(item =>
    item.publicMetadata?.abilityName === 'Resetting Hole' &&
    hasStadiumRemovalTarget(view));
  const underworldDoor = abilities.find(item => canUseUnderworldDoor(view, item, request.publicEventReceipt));
  const starAlchemy = abilities.find(item =>
    canUseStarAlchemy(view, item, request.publicEventReceipt));
  const usefulAbility = resettingHole ?? underworldDoor ?? starAlchemy;
  for (const item of abilities) {
    if (usefulAbility && item.token === usefulAbility.token) {
      recordPolicyAuditRule(item.token,
        usefulAbility === resettingHole ? 'RESETTING_HOLE_STADIUM_REMOVAL' :
          usefulAbility === underworldDoor ? 'UNDERWORLD_DOOR_OWNER_ENERGY_SETUP' :
            'STAR_ALCHEMY_GENUINE_BOTTLENECK');
    } else {
      recordPolicyAuditUnscored(item.token, 'UNSUPPORTED_ABILITY_BRANCH');
    }
  }
  if (usefulAbility) {
    setPolicyAuditRule(usefulAbility === resettingHole
      ? 'ROOT_RESETTING_HOLE_RULE' :
        usefulAbility === underworldDoor ? 'ROOT_UNDERWORLD_DOOR_RULE' :
          'ROOT_STAR_ALCHEMY_RULE', 'FIRST_FRONTIER_MATCH');
    return { kind: 'select-action', token: usefulAbility.token };
  }

  const active = view.ownPublic.active;
  const target = view.opponentPublic.active;
  if (active && target) {
    const attacks = items.filter(item => item.kind === 'attack' && item.attackName);
    const scoredAttacks = attacks.map(item => {
      const attack = active.attacks.find(row => row.name === item.attackName);
      const score = attackScore(active, attack, view, target, {
        publicEventReceipt: request.publicEventReceipt
      });
      recordPolicyAuditScore(item.token, score, 'NO_ELIGIBLE_ATTACK_SCORE');
      return { item, score };
    }).filter(row => Number.isFinite(row.score)).sort((a, b) =>
      b.score - a.score || a.item.token.localeCompare(b.item.token));
    if (scoredAttacks.length > 0 && scoredAttacks[0].score > 0 &&
        scoredAttacks[0].score >= Math.max(-Infinity,...terminalPlays.map(row=>row.score))) {
      setPolicyAuditRule('ROOT_ATTACK_SCORE', 'SCORE_DESC_TOKEN_ASC');
      return { kind: 'select-action', token: scoredAttacks[0].item.token };
    }
  }

  if (terminalPlays.length > 0) {
    terminalPlays.sort((a, b) => b.score - a.score ||
      a.item.token.localeCompare(b.item.token));
    setPolicyAuditRule('ROOT_CLIMACTIC_GATE_TERMINAL', 'SCORE_DESC_TOKEN_ASC');
    recordPolicyAuditRule(terminalPlays[0].item.token, 'CLIMACTIC_GATE_ENDS_TURN');
    return { kind: 'select-action', token: terminalPlays[0].item.token };
  }

  if (pass) {
    setPolicyAuditRule('ROOT_PASS_FALLBACK', 'FIRST_FRONTIER_MATCH');
    recordPolicyAuditRule(pass.token, 'PASS_FALLBACK');
    return { kind: 'select-action', token: pass.token };
  }
  return abstain('NO_SUPPORTED_ROOT_ACTION');
}

function createPolicy({ role, seat, policyVersion, config }) {
  if (role !== 'candidate' || (seat !== 0 && seat !== 1) ||
      policyVersion !== POLICY_VERSION || !isCandidateProfile(config)) {
    throw new Error('AGENT46_POLICY_INIT_MISMATCH');
  }

  function evaluateRequest(request) {
    if (!request || request.role !== 'candidate' || request.seat !== seat ||
        !request.observation || request.observation.actorSeat !== seat) {
      return abstain('ROLE_SEAT_OBSERVATION_MISMATCH');
    }
    const view = request.observation;
    if (request.prompt === null && view.decisionKind === 'owner-root') {
      return chooseRoot(view, request, config);
    }
    if (request.prompt && view.decisionKind === 'owner-prompt' &&
        request.prompt.actingSeat === seat) {
      return choosePrompt(view, request.prompt, request.publicEventReceipt, config);
    }
    return abstain('DECISION_KIND_MISMATCH');
  }

  return {
    decide(request) {
      return evaluateRequest(request);
    },
    decideWithAudit(request) {
      if (activePolicyAudit !== null) throw new Error('POLICY_AUDIT_REENTRANT');
      activePolicyAudit = createPolicyAuditContext(request);
      try {
        const decision = evaluateRequest(request);
        return { decision, policyAudit: finishPolicyAudit(decision) };
      } finally {
        activePolicyAudit = null;
      }
    }
  };
}

module.exports = { POLICY_VERSION, createPolicy };
Object.defineProperty(module.exports, '__test', {
  enumerable: false,
  value: Object.freeze({
    abilityLockSourceSuppressesTarget, abilityLockSourceStadiumSuppression,
    orderAbilityLockSources, resolveAbilityLockSources, hasRadiantGateLock,
    isRuleBoxPokemon, effectiveBenchCapacity, fairyZoneStatusForSeat,
    hasOpponentAbilityLockOnFairyZoneHolder, hasOwnFairyZoneHolderLockThreat,
    viewAfterRemovingAbilityStadiums, fieldBlowerHoodBlocksFairyZone,
    paleMoonExtraPsychicAvailable, paleMoonRetreatStatus, paleMoonScore
  })
});
