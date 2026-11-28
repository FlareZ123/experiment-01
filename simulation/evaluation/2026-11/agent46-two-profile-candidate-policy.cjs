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
const PAPER_ASTRAL_BARRAGE_TARGETS = 'agent4-cre74-hook-v1';
const PROFILE_DECKS = Object.freeze({
  'hood-shield-shadow-rider-v1': '1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924',
  'lockbridge-shadow-rider-v1': '011cb8481b473c8566935d6835fc9a2a5762e4f09349f23c8284ec19b0cac642'
});
function isCandidateProfile(config) {
  if(!config || typeof config !== 'object' || Array.isArray(config))return false;
  const keys=Object.keys(config).sort().join(',');
  const base=keys==='deckSha256,profileId,schema';
  const paper=keys==='deckSha256,paperAstralBarrageTargets,profileId,schema';
  return (base || paper) &&
    config.schema === PROFILE_SCHEMA &&
    typeof config.profileId === 'string' &&
    Object.prototype.hasOwnProperty.call(PROFILE_DECKS, config.profileId) &&
    config.deckSha256 === PROFILE_DECKS[config.profileId] &&
    (!paper || config.paperAstralBarrageTargets===PAPER_ASTRAL_BARRAGE_TARGETS);
}
function paperAstralBarrageTargetsEnabled(profile){
  return profile?.paperAstralBarrageTargets===PAPER_ASTRAL_BARRAGE_TARGETS;
}

// Twinleaf supplies last-used global-turn indices for Energy and Retreat.
// Unlike supporterPlayedTurn (a per-turn count), these are not Booleans.
// Keep Boolean false only for existing synthetic planning/fixture views.
function energyAvailableNow(view) {
  const stamp=view?.ownTurnResources?.energyPlayedTurn, turn=view?.globalTurn;
  return stamp===false ||
    (Number.isSafeInteger(stamp)&&Number.isSafeInteger(turn)&&stamp!==turn);
}
function retreatAvailableNow(view) {
  const stamp=view?.ownTurnResources?.retreatedTurn, turn=view?.globalTurn;
  return Number.isSafeInteger(stamp)&&Number.isSafeInteger(turn)&&stamp!==turn;
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
  if (holders.some(slot => effectiveAbilityStatus(slot, abilityName, 'actor',view) === true)) return true;
  if (holders.some(slot => effectiveAbilityStatus(slot, abilityName, 'actor',view) === null)) return null;
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
      return isBasicPokemon(holder);
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
  if(knownFullyPrized(view,'Stealthy Hood'))return false;
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

function isBasicEnergyPrinting(name){
  return /^(?:Basic )?(?:Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy(?: |$)/.test(name??'');
}
const ZERO_PRIZE_TRAINER_DOLL_NAMES=new Set([
  'Robo Substitute','Robo Substitute Team Flare Gear',"Lillie's Poké Doll",'Snorlax Doll'
]);
function zeroPrizeTrainerDoll(slot){
  if(!slot)return false;
  if(ZERO_PRIZE_TRAINER_DOLL_NAMES.has(slot.name))return true;
  const printing=slot.printing??'';
  return /^Robo Substitute(?: Team Flare Gear)? PHF(?: |$)/.test(printing)||
    /^Lillie's Poké Doll CEC(?: |$)/.test(printing)||
    /^Snorlax Doll PAR(?: |$)/.test(printing);
}
function prizeLiability(slot) {
  if (!slot) return 1;
  if(zeroPrizeTrainerDoll(slot))return 0;
  const subtypes = slot.printed?.subtypes ?? [];
  const printing = slot.printing ?? '';
  if (subtypes.some(value => ['VMAX', 'V-UNION', 'TAG TEAM'].includes(value)) ||
      hasName(printing, 'VMAX') || hasName(printing, 'V-UNION') ||
      hasName(printing, ' & ') && hasName(printing, '-GX') ||
      /^Mega .+ ex(?: |$)/.test(printing) ||
      (subtypes.includes('MEGA')&&subtypes.includes('ex'))) return 3;
  if (subtypes.some(value => ['ex', 'EX', 'GX', 'V', 'VSTAR'].includes(value)) ||
      hasName(printing, '-EX') || hasName(printing, '-GX') || / ex(?: |$)/.test(printing) ||
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
  if(Number.isSafeInteger(slot?.publicRestrictions?.attackCostIncreaseWhileActive)&&
     (slot===view.ownPublic.active||slot===view.opponentPublic.active))
    required+=Math.max(0,slot.publicRestrictions.attackCostIncreaseWhileActive);
  // Wondrous Labyrinth Prism Star increases non-Fairy attack costs by C.
  // Under unknown Stadium status, conservatively count the extra unit.
  if(!slot?.printed?.types?.includes('Fairy') &&
      [...view.ownPublic.stadium,...view.opponentPublic.stadium].some(name=>
        hasName(name,'Wondrous Labyrinth')) &&
      stadiumAndToolEffectsLive(view)!==false)required+=1;
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

function weaknessMultiplier(attacker, target, view, attackerSeat='actor') {
  const types = attacker?.printed?.types ?? [];
  const targetSeat=attackerSeat==='actor'?'opponent':'actor';
  if (isDragon(target) && fairyZoneStatusForSeat(view,attackerSeat) === true &&
      hasEffectiveStealthyHood(target, view, targetSeat) === false)
    return types.includes('Psychic')?2:1;
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
  if (attack.name === 'Energy Drive') {
    const specialSuppressed=[...view.ownPublic.stadium,...view.opponentPublic.stadium].some(p=>hasName(p,'Temple of Sinnoh')) &&
      stadiumAndToolEffectsLive(view)===true;
    const units=slot=>slot.energies.reduce((sum,p)=>sum+(specialSuppressed&&!isBasicEnergyPrinting(p)?1:energyCardUnits(slot,p)),0);
      const a=publicEnergySupply(attacker,view,specialSuppressed,'actor'),
      b=publicEnergySupply(target,view,specialSuppressed,'opponent');
    return a&&b?20*(a.length+b.length):null;
  }
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

function filterMatchesAttacker(filter,attacker){
  if(filter==='none')return false;
  if(filter==='all')return true;
  if(filter==='basic')return isBasicPokemon(attacker);
  if(filter==='evolution')return !isBasicPokemon(attacker);
  return null;
}
function modernVOrEx(slot){
  return (slot?.printed?.subtypes??[]).some(t=>['V','VMAX','VSTAR','V-UNION','ex'].includes(t)) ||
    / (?:V|VMAX|VSTAR|V-UNION|ex)(?: |$)/.test(slot?.printing??'');
}
function cannotAttackPublicly(attacker,target,view){
  const r=attacker?.publicRestrictions??{};
  const status=normalizeSpecialConditionNames(attacker?.specialConditions??[]);
  if(status===null||status.includes('asleep')||status.includes('paralyzed'))return true;
  if(r.cannotAttackNextTurn===true)return true;
  if(view.ownPublic.publicTurnRestrictions?.attackLockTurnsRemaining>0)return true;
  if(isBasicPokemon(attacker)&&hasName(target?.printing,'Vileplume BUS')&&
    effectiveAbilityStatus(target,'Disgusting Pollen','opponent',view)!==false)return true;
  return false;
}
function damageProtection(attacker, target, view) {
  if(hasName(target.printing,'Mimikyu PAL')&&modernVOrEx(attacker)){
    const live=effectiveAbilityStatus(target,'Safeguard','opponent',view);
    if(live!==false)return live===true?'prevented':'unknown';
  }
  // Only an active, normalized public effect is evidence for an attack wall.
  const d=target.publicDamageEffects;
  if(!d)return 'none';
  const applies=filterMatchesAttacker(d.prevention,attacker);
  if(applies===true)return 'prevented';
  if(applies===null||d.chancePrevention===true)return 'unknown';
  return 'none';
}
function attackEffectsBlocked(attacker,target,view){
  if(hasName(target?.printing,'Skeledirge SSP')&&
      effectiveAbilityStatus(target,'Unaware','opponent',view)!==false)return true;
  const d=target.publicDamageEffects;
  if(d&&filterMatchesAttacker(d.effectsPrevention,attacker)!==false)return true;
  if((target.energies??[]).some(e=>hasName(e,'Mist Energy')) &&
      ![...view.ownPublic.stadium,...view.opponentPublic.stadium].some(e=>hasName(e,'Temple of Sinnoh')))return true;
  if((target.energies??[]).length&&opponentBoard(view).some(p=>
    hasName(p.printing,'Espeon VMAX')&&effectiveAbilityStatus(p,'Solar Revelation','opponent',view)!==false))return true;
  if((view.opponentPublic.active?.tools??[]).some(t=>hasName(t,'Big Parasol'))&&
    stadiumAndToolEffectsLive(view)!==false&&
    ![...view.ownPublic.stadium,...view.opponentPublic.stadium].some(e=>hasName(e,'Jamming Tower')))return true;
  return false;
}
function estimatedDamage(attacker, attack, view, target, ignoreWeakness=false) {
  if(cannotAttackPublicly(attacker,target,view))return null;
  const base = attackBaseDamage(attacker, attack, view, target);
  if (!Number.isFinite(base)) return null;
  const protection=damageProtection(attacker,target,view);
  if(protection==='prevented')return 0;
  if(protection==='unknown')return null;
  const a=attacker.publicDamageEffects,d=target.publicDamageEffects;
  if(a&&(a.chanceAttackFailure!==0||a.outgoingReduction===null||a.outgoingAfterWeaknessReduction===null))return null;
  if(d&&(d.beforeWeaknessReduction===null||d.reduction===null))return null;
  const pre=Math.max(0,base-(a?.outgoingReduction??0)-(d?.beforeWeaknessReduction??0));
  const bypass=attack.name==='Energy Drive'||attack.name==='Mind Shock';
  const multiplier=bypass||ignoreWeakness?1:weaknessMultiplier(attacker,target,view);
  if(multiplier===null)return null;
  let damage=Math.max(0,pre*multiplier-(bypass?0:resistancePenalty(attacker,target))-(a?.outgoingAfterWeaknessReduction??0));
  if(d?.reduction>0){
    const applies=d.reductionFilter==='none'?true:filterMatchesAttacker(d.reductionFilter,attacker);
    if(applies===null)return null;
    if(applies)damage=Math.max(0,damage-d.reduction);
  }
  return Number.isFinite(damage)?damage:null;
}
function astralTargetScore(attacker,target,view){
  if(!target||attackEffectsBlocked(attacker,target,view))return 0;
  const remaining=Math.max(0,target.hp-target.damage);
  if(remaining<=0)return 0;
  return 500+(remaining<=50?10000+500*prizeLiability(target):Math.min(300,target.damage));
}
function astralBarragePlan(attacker,view,paperTargetHook=false){
  // Unhooked pinned CRE74 requests min(2, Bench size), so only >=2 Bench is
  // paper-equivalent. The exact Agent4 hook repairs this to min(2, all opposing
  // Pokemon); capability-bound profiles may therefore admit Active + one Bench.
  const benchCount=view.opponentPublic.bench.filter(Boolean).length;
  if(!isBasicShadowRiderV(attacker)||
    (paperTargetHook ? opponentBoard(view).length<1 : benchCount<2)||
    cannotAttackPublicly(attacker,view.opponentPublic.active,view))return -Infinity;
  const legalTargets=paperTargetHook?opponentBoard(view):view.opponentPublic.bench.filter(Boolean);
  const scores=legalTargets.map(p=>astralTargetScore(attacker,p,view)).sort((a,b)=>b-a);
  return scores.length>=1&&scores[0]>0?scores[0]+(scores[1]??0):-Infinity;
}

function canFuelNightWatch(view) {
  return handHas(view, 'Psychic Energy') &&
    (energyAvailableNow(view) ||
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
// Only cards already in the public opponent discard are considered.
function observedThornsControl(view) {
  const board=opponentBoard(view);
  return board.length>0&&board.every(slot=>hasName(slot.printing,'Iron Thorns ex'));
}
function observedElectroRainThreat(view){
 return opponentBoard(view).some(p=>hasAnyName(p.printing,['Alolan Raichu UNM','Electrode-GX CES']));
}
function rainDiscardEnergyValue(view,printing){
 if(!observedElectroRainThreat(view)||
   !hasAnyName(printing,['Reversal Energy','Counter Energy','Unit Energy LPM']))return null;
 if(hasActiveStadiumLock(view,'Temple of Sinnoh'))return 100;
 const bombs=opponentBoard(view).filter(p=>hasName(p.printing,'Electrode-GX CES')).length;
 const own=view.ownPublic.prizeCount,opp=view.opponentPublic.prizeCount;
 const usable=Math.min(bombs,Math.floor((own-1)/2));
 const behind=opp>own-2*usable;
 if(hasName(printing,'Reversal Energy'))return behind?900:180;
 if(hasName(printing,'Counter Energy'))return behind?600:180;
 return 300;
}
function publicTempleResettingHoleRisk(view) {
  const board=opponentBoard(view);
  return stadiumAndToolEffectsLive(view)===true&&
    view.ownPublic.stadium.some(p=>hasName(p,'Temple of Sinnoh'))&&
    board.some(p=>hasAnyName(p.printing,['Alolan Raichu','Electrode-GX']))&&
    board.some(p=>(p.energies??[]).some(e=>!isBasicEnergyPrinting(e)))&&
    !board.some(p=>(p.energies??[]).some(isBasicEnergyPrinting));
}
function exposedMoltresEnergyThreat(view){
 const board=opponentBoard(view), discard=view.opponentPublic.discard;
 const birds=board.filter(p=>hasName(p.printing,'Galarian Moltres V'));
 if(!birds.length&&!discard.some(p=>hasName(p,'Galarian Moltres V')))return false;
 if(birds.some(p=>(p.energies??[]).filter(e=>hasName(e,'Darkness Energy')).length>=2))return false;
 return ownBoard(view).some(p=>hasName(p.printing,'Shadow Rider Calyrex V')||hasName(p.printing,'Shadow Rider Calyrex VMAX'))||
   view.ownHand.some(p=>hasAnyName(p,['Shadow Rider Calyrex V','Shadow Rider Calyrex VMAX']));
}
function exposedVileplumeRecoveryThreat(view){
 const board=opponentBoard(view),discard=view.opponentPublic.discard;
 if(board.some(p=>hasAnyName(p.printing,['Oddish','Gloom','Vileplume'])))return false;
 const grass=discard.some(p=>hasAnyName(p,['Oddish UNB','Gloom UNB']));
 return grass&&(discard.some(p=>hasName(p,'Vileplume'))||
   board.some(p=>hasAnyName(p.printing,['Pidgey FLF','Bunnelby PRC','Mega Lopunny ex PFL'])));
}
function observedDenialThreat(view){
 return observedThornsControl(view)||observedElectroRainThreat(view)||
   exposedMoltresEnergyThreat(view)||exposedVileplumeRecoveryThreat(view);
}
function publicResourcePairBonus(view,names){
 if(exposedMoltresEnergyThreat(view)&&names.every(p=>isBasicEnergyPrinting(p)&&hasName(p,'Darkness Energy')))return 1200;
 if(exposedVileplumeRecoveryThreat(view)&&
   (names.every(p=>hasName(p,'Oddish UNB'))||names.every(p=>hasName(p,'Gloom UNB'))))return 1100;
 return 0;
}
function controlPairBonus(view,names) {
  const resource=publicResourcePairBonus(view,names);if(resource)return resource;
  if(!observedThornsControl(view))return 0;
  const ls=names.filter(n=>hasName(n,'Lusamine')).length;
  if(ls===2)return 500;
  if(ls===1&&names.some(n=>hasName(n,'Cynthia & Caitlin')))return 300;
  return 0;
}
function affordableControlGetLostAccess(view){
  if(!observedDenialThreat(view))return false;
  if(!hasOpenBench(view)||boardHas(view,'Girafarig')||
     !retreatAvailableNow(view)||view.globalTurn<=1||
     view.ownTurnResources.pokemonPlayLocked||
     view.ownPublic.publicTurnRestrictions?.attackLockTurnsRemaining!==0)return false;
  const cost=ownRetreatCost(view);
  if(cost===null||cost>1||slotEnergyCount(view.ownPublic.active)<cost)return false;
  if(dimensionValleyStatus(view)!==true&&
     (!energyAvailableNow(view)||view.ownTurnResources.energyPlayLocked||!handHas(view,'Psychic Energy')))return false;
  const plan=getLostPlan(view);
  if(!Number.isFinite(plan))return false;
  const current=bestAttackForSlot(view.ownPublic.active,view,view.opponentPublic.active);
  return plan>(current?.score??0)+cost*350+100;
}
function needControlGirafarig(view){
 return affordableControlGetLostAccess(view)&&!handHas(view,'Girafarig')&&
    !knownFullyPrized(view,'Girafarig');
}
function getLostValue(view,printing) {
  if(hasName(printing,'Marshadow UNB')&&publicTempleResettingHoleRisk(view))return 950;
  const rain=rainDiscardEnergyValue(view,printing);if(rain!==null)return rain;
  if(exposedMoltresEnergyThreat(view)&&isBasicEnergyPrinting(printing)&&hasName(printing,'Darkness Energy'))return 200;
  if(exposedVileplumeRecoveryThreat(view)&&hasAnyName(printing,['Oddish UNB','Gloom UNB']))return 180;
  if(observedThornsControl(view)){
    if(hasAnyName(printing,["Team Rocket's Handiwork","Bellelba & Brycen-Man"]))
      return view.ownPublic.deckCount<=8?1200:600;
    if(hasName(printing,'Faba'))return view.ownPublic.stadium.some(p=>hasName(p,'Temple of Sinnoh'))||
      ownBoard(view).some(p=>(p.tools??[]).some(t=>hasAnyName(t,['Stealthy Hood','Float Stone'])))?900:500;
    if(hasName(printing,'Lusamine'))return 230;
    if(hasName(printing,'Cynthia & Caitlin'))return 190;
  }

  const regidrago=opponentHasRegidrago(view);
  if(regidrago&&hasAnyName(printing,['Dialga-GX','Dragapult ex','Giratina VSTAR','Goodra VSTAR',
    'Hisuian Goodra VSTAR','Noivern ex','Haxorus','Flygon ex','Altaria-GX','Dragonite ex',
    'Garchomp ex','Alolan Exeggutor ex','Duraludon VMAX','Kyurem']))return 500;
  if(regidrago&&hasName(printing,'Regidrago VSTAR'))return 300;
  if(hasAnyName(printing,['ACE SPEC','Computer Search','Dowsing Machine','Unfair Stamp','Secret Box',
    'Legacy Energy','Double Dragon Energy','Double Colorless Energy','Pokémon Ranger',
    'Forest Seal Stone','VS Seeker']))return 160;
  return 15;
}
// Adapted from Agent26's public prize planners and Get Lost denial cut-set.
// Runtime input is only the observed opposing Active and public discard;
// no fixed-field list, rank, concealed hand, or future draw is consulted.
// This optimistic hazard bound is a policy estimate, not native outcomes.
const APEX_PAYLOADS=[
  ['Kyurem SFA','Trifrost',110],['Dragapult ex TWM','Phantom Dive',200],
  ['Dialga-GX UPR','Timeless-GX',150],['Giratina VSTAR LOR','Lost Impact',280],
  ['Mega Dragonite ex ASC','Ryuno Glide',330],['Koraidon SSP','Unrelenting Onslaught',180],
  ['Alolan Exeggutor ex SSP','Tropical Frenzy',150],
  ['Hisuian Goodra VSTAR LOR','Rolling Iron',200],['Noivern ex PAL','Covert Flight',70],
  ['Garchomp & Giratina-GX UNM','Calamitous Slash',160],['Garchomp ex PAR','Hydro Lander',160]
];
function observedPayloads(discard,view){
  return APEX_PAYLOADS.filter(([printing,name])=>discard.some(p=>hasName(p,printing))&&
    (name!=='Timeless-GX'||view.opponentPublic.publicTurnRestrictions?.gxUsed===false));
}
function hazardBoard(view){
  return ownBoard(view).map((slot,index)=>({key:index,printing:slot.printing,
    hp:Math.max(0,slot.hp-slot.damage),prizes:prizeLiability(slot),
    basic:isBasicPokemon(slot),isV:modernVOrEx(slot)&&!(/ ex(?: |$)/.test(slot.printing)),
    damaged:slot.damage>0,slot}));
}
function hazardCombinations(rows,max){
  const out=[[]];
  for(const row of rows){for(const group of out.slice())if(group.length<max)out.push([...group,row])}
  return out;
}
function hazardModifier(view,row){
  const tools=view.opponentPublic.active?.tools??[];
  let damage=view.opponentPublic.publicTurnRestrictions?.alteredCreationDamage===true?30:0;
  if(stadiumAndToolEffectsLive(view)!==true)return damage;
  if(tools.some(p=>hasName(p,'Muscle Band')))damage+=20;
  if(tools.some(p=>hasName(p,'Choice Belt'))&&row.isV)damage+=30;
  if(tools.some(p=>hasName(p,'Defiance Band'))&&view.opponentPublic.prizeCount>view.ownPublic.prizeCount)damage+=30;
  return damage;
}
function hazardVariants(view,rows,activeKey,payload){
  const active=rows.find(r=>r.key===activeKey);if(!active)return [];
  const [,name,base]=payload;
  const alteredPrizeKey=view.opponentPublic.publicTurnRestrictions?.usedAlteredCreation===true?activeKey:null;
  const modified=row=>base+(row.key===activeKey?hazardModifier(view,row):0);
  if(name==='Trifrost')return hazardCombinations(rows,3).filter(x=>x.length===Math.min(3,rows.length))
    .map(group=>({name,hits:group.map(row=>[row.key,modified(row)]),
      alteredPrizeKey:group.some(row=>row.key===activeKey)?alteredPrizeKey:null}));
  if(name==='Phantom Dive'){
    const bench=rows.filter(r=>r.key!==activeKey);
    // 60 damage counters' worth can be allocated in 10-damage increments.
    // Only the Active 200 is attack damage; bench counters never receive the
    // Altered Creation extra-Prize modifier.
    const variants=[];
    for(const group of hazardCombinations(bench,6)){
      const needed=group.reduce((n,r)=>n+Math.ceil(r.hp/10)*10,0);
      if(needed<=60)variants.push({name,alteredPrizeKey,
        hits:[[active.key,modified(active)],...group.map(r=>[r.key,Math.ceil(r.hp/10)*10])]});
    }
    for(const row of bench)variants.push({name,alteredPrizeKey,
      hits:[[active.key,modified(active)],[row.key,60]]});
    return variants;
  }
  if(name==='Calamitous Slash')return [{name,alteredPrizeKey,
    hits:[[active.key,modified(active)+(active.damaged?80:0)]]}];
  return [{name,alteredPrizeKey,hits:[[active.key,modified(active)]]}];
}
function hazardResolve(rows,variant){
  const totals=new Map(variant.hits);
  const after=[],ko=[];
  for(const row of rows){
    const hp=row.hp-(totals.get(row.key)??0);
    if(hp<=0)ko.push(row);else after.push({...row,hp,damaged:row.damaged||hp<row.hp});
  }
  const alteredPrize=variant.alteredPrizeKey!==null&&variant.alteredPrizeKey!==undefined&&
    ko.some(row=>row.key===variant.alteredPrizeKey)?1:0;
  return {after,ko,prizes:ko.reduce((n,r)=>n+r.prizes,0)+alteredPrize};
}
function apexHazard(view,discard=view.opponentPublic.discard,rows=hazardBoard(view)){
  const attacker=view.opponentPublic.active;
  if(!attacker||!hasName(attacker.printing,'Regidrago VSTAR')||!rows.length)return {direct:0,extra:0,maximum:0,known:false};
  const paid=publicEnergyCanPay(attacker,{name:'Apex Dragon',cost:['Grass','Grass','Fire']},view,templeLive(view));
  if(paid!==true)return {direct:0,extra:0,maximum:0,known:paid===false};
  const payloads=observedPayloads(discard,view);
  const original=rows[0].key;
  const directFor=(board,key,allowTimeless)=>Math.max(0,...payloads.filter(p=>allowTimeless||p[1]!=='Timeless-GX')
    .flatMap(payload=>hazardVariants(view,board,key,payload).map(v=>hazardResolve(board,v).prizes)));
  const one=(keys)=>{
    let direct=0,extra=0;
    for(const key of keys){
      direct=Math.max(direct,directFor(rows,key,true));
      if(!payloads.some(p=>p[1]==='Timeless-GX'))continue;
      for(const variant of hazardVariants(view,rows,key,APEX_PAYLOADS.find(p=>p[1]==='Timeless-GX'))){
        const first=hazardResolve(rows,variant);
        if(!first.after.length){extra=Math.max(extra,first.prizes);continue;}
        const survives=first.after.find(r=>r.key===key);
        const promotions=survives?[survives]:first.after;
        const second=Math.min(...promotions.map(row=>directFor(first.after,row.key,false)));
        extra=Math.max(extra,first.prizes+second);
      }
    }
    return {direct,extra,maximum:Math.max(direct,extra)};
  };
  const fixed=one([original]);
  // Gust is a conditional opportunity, not a claim the opponent holds one.
  const potential=view.opponentPublic.handCount>0&&view.opponentPublic.bench.some(Boolean)?
    one(rows.map(r=>r.key)):fixed;
  return {...fixed,potential:potential.maximum,known:true};
}
function getLostPairs(view,rows){
  const before=apexHazard(view);
  const discarded=view.opponentPublic.discard;
  let best=null;
  const cache=new Map();
  for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){
    const a=rows[i],b=rows[j],names=[a.printing,b.printing].sort();
    const key=names.join('\u0000');
    let after=cache.get(key);
    if(!after){
      const remain=discarded.slice();
      for(const name of names){const k=remain.indexOf(name);if(k>=0)remain.splice(k,1)}
      after=apexHazard(view,remain);cache.set(key,after);
    }
    const needed=view.opponentPublic.prizeCount;
    const score=(before.maximum>=needed&&after.maximum<needed?5000:0)+
      (before.maximum-after.maximum)*1800+
      ((before.potential??before.maximum)-(after.potential??after.maximum))*400+
      getLostValue(view,a.printing)+getLostValue(view,b.printing)+controlPairBonus(view,names);
    if(!best||score>best.score)best={rows:[a,b],score,after};
  }
  return best;
}
function getLostPlan(view) {
  const discard=view.opponentPublic.discard;
  const values=discard.map(p=>getLostValue(view,p)).sort((a,b)=>b-a);
  if(values.length<2)return -Infinity;
  const best=getLostPairs(view,discard.map((printing,index)=>({printing,index})));
  if(values[0]<300&&(!best||controlPairBonus(view,best.rows.map(r=>r.printing))===0))return -Infinity;
  return (best?.score??values[0]+values[1])+100;
}
function tapuCureValue(view,slot){
  if(!slot||slot.damage<=0)return 0;
  const threat=visibleCounterattackThreat(view,slot);
  const exposed=slot.hp-slot.damage<=threat;
  return slot.damage*2+prizeLiability(slot)*(exposed?450:100);
}
function tapuCureScore(view){
  const rows=view.ownPublic.bench.filter(p=>p&&p.damage>0).map(p=>tapuCureValue(view,p)).sort((a,b)=>b-a);
  if(rows.length<2)return -Infinity;
  const score=rows[0]+rows[1];
  return score>=1100?score:-Infinity;
}
function attackScore(attacker, attack, view, target, options = {}) {
  if (!attacker || !attack || !target) return -Infinity;
  if (attack.gxAttack && view.ownPublic.publicTurnRestrictions.gxUsed) return -Infinity;
  if(cannotAttackPublicly(attacker,target,view))return -Infinity;
  const restrictions=attacker.publicRestrictions??{};
  if((restrictions.cannotUseAttacksNextTurn??[]).includes(attack.name)||
      restrictions.blockedAttackNameNextTurn===attack.name||
      restrictions.blockedAttackNameUntilLeavesActive===attack.name||
      (restrictions.onlyAllowedAttackNameNextTurn&&restrictions.onlyAllowedAttackNameNextTurn!==attack.name))return -Infinity;
  if (options.requirePayable === true && !canPayAttack(attacker, attack, view)) {
    return -Infinity;
  }

  if (attack.name==='Tapu Cure-GX'&&hasName(attacker.printing,'Tapu Lele-GX'))return tapuCureScore(view);
  if (attack.name === 'Copycat') return -Infinity; // separate copied-attack admission required
  if (attack.name==='Get Lost'&&hasName(attacker.printing,'Girafarig')) return getLostPlan(view);
  if (attack.name==='Astral Barrage') return astralBarragePlan(attacker,view,
    options.paperAstralBarrageTargets===PAPER_ASTRAL_BARRAGE_TARGETS);
  if (attack.name === 'Pale Moon-GX') {
    return attackEffectsBlocked(attacker,target,view)?-Infinity:paleMoonScore(attacker, attack, view, target);
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
         !isBasicEnergyPrinting(name)))) {
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
// Only a host-certified, current, complete prize inference can veto deck search.
function knownFullyPrized(view, name) {
  const k = view.ownerK1, f = k?.prizeFacts;
  if (!f || k.invalidationReason !== null || f.schema !== 'agent46-owner-fully-prized-v1' ||
      f.actorSeat !== view.actorSeat || f.epoch !== k.epoch ||
      f.turn !== view.globalTurn || f.prizeCount !== view.ownPublic.prizeCount ||
      !Array.isArray(f.fullyPrized)) return false;
  const matches = f.fullyPrized.filter(row => row.cardName === name &&
    typeof row.printing === 'string' && row.printing.startsWith(name + ' ') &&
    Number.isInteger(row.copies) && row.copies > 0);
  return matches.length === 1;
}
function gateAccessNeed(view) {
  return !knownFullyPrized(view, 'Radiant Eternatus') && gateWantedIgnoringPrize(view);
}
function heavyBallNeed(view) {
  if (itemLocked(view) || view.ownPublic.prizeCount <= 0) return 0;
  if (knownFullyPrized(view, 'Radiant Eternatus') && gateWantedIgnoringPrize(view)) return 1050;
  if (knownFullyPrized(view,'Wobbuffet') && !boardHas(view,'Wobbuffet') && !handHas(view,'Wobbuffet') && opponentHasRegidrago(view)&&hasOpenBench(view))return 870;
  if (knownFullyPrized(view,"Lillie's Clefairy ex") && opponentHasDragon(view)&&!boardHas(view,"Lillie's Clefairy ex")&&hasOpenBench(view))return 880;
  if (knownFullyPrized(view, 'Shadow Rider Calyrex V') && !hasBasicShadowRiderV(view) &&
      !handHasBasicShadowRiderV(view) && hasOpenBench(view)) return 1000;
  if ((!hasBasicShadowRiderV(view) && !handHasBasicShadowRiderV(view) && hasOpenBench(view)) ||
      gateAccessNeed(view)) return 675;
  return 0;
}
// Evaluate the actual post-pivot state: leaving Bide Barricade can also
// reactivate the opponent's Initialization, so a pivot is not sufficient.
function invalidateDepartedWobbuffet(view, old) {
  if (!hasName(old?.printing,'Wobbuffet') ||
      hasName(view.ownPublic.active?.printing,'Wobbuffet') ||
      hasName(view.opponentPublic.active?.printing,'Wobbuffet')) return view;
  const clear = slot => !slot || !Array.isArray(slot.abilitySuppressions) ? slot :
    {...slot, abilitySuppressions:slot.abilitySuppressions.filter(row =>
      !(row.suppressed===true && hasName(row.sourcePrinting??row.sourceName??'','Wobbuffet')))};
  const player = p => ({...p,active:clear(p.active),bench:p.bench.map(clear)});
  return {...view,ownPublic:player(view.ownPublic),opponentPublic:player(view.opponentPublic)};
}
function gatePivotView(view) {
  if(!hasName(view.ownPublic.active?.printing,'Wobbuffet') ||
      !retreatAvailableNow(view)) return null;
  const cost=ownRetreatCost(view);
  if(cost===null) return null;
  const active=view.ownPublic.active;
  const heldStone=handHas(view,'Float Stone') && active.tools?.length===0 &&
      !view.ownTurnResources?.toolPlayLocked &&
      toolsEffectiveForRetreat(view,active,'actor')===true;
  if(slotEnergyCount(active)<cost&&!heldStone)return null;
  for(const [index,slot] of view.ownPublic.bench.entries()){
    if(!slot)continue;
    const moved={...view,ownPublic:{...view.ownPublic,active:slot,
      bench:view.ownPublic.bench.map((p,i)=>i===index?active:p)}};
    const projected=invalidateDepartedWobbuffet(moved,active); if(canPlayRadiantForGate(projected))return projected;
  }
  return null;
}
function preserveStallSoloNightWatch(view){
  const active=view.ownPublic.active,target=view.opponentPublic.active;
  if(!hasName(active?.printing,'Trevenant & Dusknoir-GX')||
     view.ownPublic.bench.some(Boolean)||active.hp-active.damage<=150)return false;
  const board=opponentBoard(view);
  if(!board.some(p=>hasName(p.printing,'Snorlax PGO'))||
     !board.every(p=>hasAnyName(p.printing,['Snorlax PGO','Mimikyu PAL','Regirock PR','Wobbuffet PHF','Girafarig LOT'])))return false;
  const used=[...view.opponentPublic.discard,...(view.opponentPublic.lostZone??[])];
  if(!used.some(p=>hasName(p,'Target Whistle'))||!used.some(p=>hasName(p,'Captivating Poké Puff')))return false;
  const night=active.attacks?.find(a=>a.name==='Night Watch');
  return !!night&&canPayAttack(active,night,view)&&
    Number.isFinite(estimatedDamage(active,night,view,target))&&
    estimatedDamage(active,night,view,target)>=target.hp-target.damage;
}
function gateWantedIgnoringPrize(view) {
  if(preserveStallSoloNightWatch(view))return false;
  return !boardHas(view, 'Radiant Eternatus') && !handHas(view, 'Radiant Eternatus') &&
    !discardHas(view, 'Radiant Eternatus') &&
    !(view.ownPublic.lostZone ?? []).some(p => hasName(p, 'Radiant Eternatus')) &&
    view.ownPublic.deckCount > 0 &&
    (canPlayRadiantForGate(view) || gatePivotView(view)!==null);
}
function forestSealAccessNeed(view) {
  return (gateAccessNeed(view) || (heavyBallNeed(view) >= 1000 &&
    !handHas(view,'Hisuian Heavy Ball') && !knownFullyPrized(view,'Hisuian Heavy Ball'))) &&
    !knownFullyPrized(view,'Forest Seal Stone') && !handHas(view, 'Forest Seal Stone') &&
    !ownBoard(view).some(slot => (slot.tools ?? []).some(p => hasName(p, 'Forest Seal Stone'))) &&
    view.ownTurnResources?.vstarUsed !== true &&
    view.ownPublic.publicTurnRestrictions?.vstarUsed !== true &&
    ownBoard(view).some(slot => isShadowRiderVTarget(slot) &&
      Array.isArray(slot.tools) && slot.tools.length === 0 &&
      toolsEffectiveForRetreat(view, slot, 'actor') === true && !hasStarAlchemyLock(view, slot));
}
// Ranger clears attack effects, not ongoing abilities. Recognize the public
// continuous Item-lock sources in the card pool. Unknown suppression is not
// permission to spend the only Supporter as though the source were absent.
function hasContinuousItemLock(view){
  const live=(slot,name,ability,seat)=>hasName(slot?.printing,name)&&
    (slot.abilities??[]).includes(ability)&&effectiveAbilityStatus(slot,ability,seat,view)!==false;
  if(ownBoard(view).some(p=>live(p,'Vileplume','Irritating Pollen','actor'))||
     opponentBoard(view).some(p=>live(p,'Vileplume','Irritating Pollen','opponent')))return true;
  const active=view.opponentPublic.active;
  if([['Gothitelle','Magic Room'],['Trevenant','Forest\'s Curse'],
      ['Jellicent ex','Oceanic Curse'],['Tyranitar','Daunting Gaze']]
      .some(([name,ability])=>live(active,name,ability,'opponent')))return true;
  return opponentBoard(view).length<ownBoard(view).length&&
    opponentBoard(view).some(p=>live(p,'Omastar','Fossil Bind','opponent'));
}
function rangerUnlocksUsefulItem(view,receipt) {
  if(!itemLocked(view)||!view.ownHand.some(isItem)||hasContinuousItemLock(view))return false;
  const hand=view.ownHand.slice();
  const rangerIndex=hand.findIndex(p=>hasName(p,'Pokémon Ranger'));
  const ranger=rangerIndex>=0?hand.splice(rangerIndex,1)[0]:'Pokémon Ranger STS';
  const after={...view,ownHand:hand,ownTurnResources:{...view.ownTurnResources,itemPlayLocked:false,supporterPlayedTurn:1},
    ownPublic:{...view.ownPublic,handCount:hand.length,discard:[...view.ownPublic.discard,ranger],
      publicTurnRestrictions:{...view.ownPublic.publicTurnRestrictions,itemPlayLocked:false}}};
  return hand.some(p=>isItem(p)&&!hasName(p,'VS Seeker')&&
    Number.isFinite(scoreTrainerPlay({actorPrinting:p,publicMetadata:{}},after,receipt,null)));
}
function usefulRanger(view,receipt=null) {
  const r = view.ownPublic.publicTurnRestrictions ?? {};
  const active = view.ownPublic.active;
  const a = active?.publicRestrictions ?? {};
  // Native persistent effect flags, not absence of a legal action, support this decision.
  const unlockItems = rangerUnlocksUsefulItem(view,receipt);
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
function rangerReserveNeed(view,printing) {
  if(!hasName(printing,'Pokémon Ranger')||itemLocked(view)||
     view.ownTurnResources?.supporterPlayedTurn!==1||handHas(view,'Pokémon Ranger'))return -Infinity;
  const target=view.opponentPublic.active;
  if(!hasName(target?.printing,'Budew'))return -Infinity;
  const another=view.opponentPublic.bench.some(p=>hasName(p?.printing,'Budew'));
  const best=bestAttackForSlot(view.ownPublic.active,view,target);
  if(!another&&Number.isFinite(best?.damage)&&best.damage>=target.hp-target.damage)return -Infinity;
  return 85;
}
function seekerTargetNeed(view,printing,receipt) {
  return supporterAvailable(view)?supporterNeedScore(view,printing,receipt):rangerReserveNeed(view,printing);
}
function bestRecoverableSupporter(view, receipt) {
  if(!supporterAvailable(view))return Math.max(-Infinity,...view.ownPublic.discard.map(p=>rangerReserveNeed(view,p)));
  const held = Math.max(0, ...view.ownHand.map(p => supporterNeedScore(view, p, receipt)));
  const recover = Math.max(-Infinity, ...view.ownPublic.discard
    .filter(p => !view.ownHand.includes(p)).map(p => supporterNeedScore(view, p, receipt)));
  return recover >= 40 && recover > held ? recover : -Infinity;
}
function recoveryNeedScore(view, printing, receipt) {
  if (hasName(printing, 'Psychic Energy')) {
    const handEnergy = view.ownHand.filter(p => hasName(p, 'Psychic Energy')).length;
    return handEnergy === 0 && (energyAvailableNow(view) ||
      boardAbilityStatus(view,'Underworld Door') === true) ? 95 : handEnergy < 2 ? 25 : -5;
  }
  if (hasName(printing, 'Dialga-GX')) return -5;
  if (hasName(printing, 'Radiant Eternatus')) {
    return !boardHas(view,'Radiant Eternatus') && !handHas(view,'Radiant Eternatus') &&
  (canPlayRadiantForGate(view)||gatePivotView(view)!==null) ? 100 : -5;
  }
  if (hasName(printing, 'Tapu Lele-GX')) {
    return supporterAvailable(view) && !handHas(view,'Tapu Lele-GX') &&
      !boardHas(view,'Tapu Lele-GX') && hasOpenBench(view) && !hasWonderTagLock(view) ? 70 : -5;
  }
  return hasAnyName(printing, ['Shadow Rider Calyrex V','Mimikyu',"Lillie's Clefairy ex",'Latias ex','Trevenant & Dusknoir-GX','Girafarig','Marshadow','Wobbuffet'])
    ? searchNeedScore(view, printing, 'recovery', receipt) : -Infinity;
}
// Marginal Energy demand, rather than an arbitrary board-energy threshold.
// A held Energy satisfies one attachment; additional copies are useful only
// when a live Door or further manual attachment can consume them.
function energyDemand(view, receipt=null) {
  const manual=energyAvailableNow(view) &&
    view.ownTurnResources?.energyPlayLocked!==true &&
    view.ownPublic.publicTurnRestrictions?.energyPlayLocked!==true;
  const recipient=view.ownPublic.bench.some(slot=>slot?.printed?.types?.includes('Psychic'));
  let doors=0;
  if(recipient) {
    for(const [zone,index,slot] of [
      ['active',0,view.ownPublic.active],...view.ownPublic.bench.map((slot,index)=>['bench',index,slot])]) {
      if(!slot||!isShadowRiderVmax(slot)||effectiveAbilityStatus(slot,'Underworld Door','actor',view)!==true)continue;
      if(receipt===null || underworldDoorSourceIsUnspent(receipt,{sourceZone:zone,sourceIndex:index},slot))doors++;
    }
  }
  const current=(manual?1:0)+doors;
  const held=view.ownHand.filter(p=>hasName(p,'Psychic Energy')).length;
  return {held,current,shortfall:Math.max(0,current-held)};
}
function energyTutorNeed(view,receipt=null) {
  const d=energyDemand(view,receipt);
  if(d.shortfall>0)return 85+Math.min(15,5*d.shortfall);
  if(d.held===0&&psychicEnergyCount(view)<3)return 40;
  return -5;
}
function handResetNeed(view, printing) {
  const remaining=view.ownHand.filter(p=>p!==printing);
  const count=Math.max(0,view.ownPublic.handCount-1);
  const draw=hasName(printing,"Lillie's Determination")?(view.ownPublic.prizeCount===6?8:6):
    hasName(printing,'Unfair Stamp')?5:Math.max(0,view.ownPublic.prizeCount);
  // Never voluntarily empty the accessible deck for speculative draw.
  if(view.ownPublic.deckCount+count<=draw)return -Infinity;
  let protectedPieces=0;
  if(remaining.some(p=>hasName(p,'Radiant Eternatus')) &&
    (canPlayRadiantForGate(view)||gatePivotView(view)!==null))protectedPieces+=3;
  if(remaining.some(p=>hasName(p,'Forest Seal Stone')) &&
    !view.ownTurnResources?.vstarUsed && !view.ownPublic.publicTurnRestrictions?.vstarUsed)protectedPieces+=2;
  if(remaining.some(p=>hasName(p,'Shadow Rider Calyrex VMAX'))&&hasUnevolvedShadowRiderV(view))protectedPieces+=2;
  if(remaining.some(p=>hasName(p,'Psychic Energy'))&&energyDemand(view).current>0)protectedPieces++;
  const disruption=hasName(printing,'Unfair Stamp')?Math.max(0,view.opponentPublic.handCount-2):
    hasName(printing,'Iono')?Math.max(0,view.opponentPublic.handCount-view.opponentPublic.prizeCount):0;
  const value=draw-count+disruption*0.8-protectedPieces*1.8;
  return value>=2?Math.min(115,55+value*7):-Infinity;
}
function raihanNeed(view,receipt) {
  if(receipt?.priorOpponentTurnKO?.any!==true||!discardHas(view,'Psychic Energy')||view.ownPublic.deckCount<=0)return -Infinity;
  const funded={...view,ownTurnResources:{...view.ownTurnResources,energyPlayedTurn:false,energyPlayLocked:false},
    ownPublic:{...view.ownPublic,publicTurnRestrictions:{...view.ownPublic.publicTurnRestrictions,energyPlayLocked:false}}};
  const energy=view.ownPublic.discard.find(p=>hasName(p,'Psychic Energy'));
  const scores=[['active',0,view.ownPublic.active],...view.ownPublic.bench.map((slot,index)=>['bench',index,slot])]
    .filter(row=>row[2]).map(([zone,index,slot])=>scoreEnergyPlay({actorPrinting:energy,targetPrinting:slot.printing,
      publicMetadata:{targetSeat:'actor',targetZone:zone,targetIndex:index}},funded));
  const best=Math.max(-Infinity,...scores);
  return best>=2200?160:best>=800?108:best>=400?75:-Infinity;
}
// Exposure is a planning estimate from the public opposing Active only.
// Unknown/unfunded future draws are not treated as guaranteed retaliation.
function visibleCounterattackThreat(view,slot){
  const opponent=view.opponentPublic.active;
  if(!opponent||!Array.isArray(opponent.energies))return 0;
  // This is an exposure heuristic, not a prediction of gust or future draws.
  // Reuse the typed public supply instead of treating every Energy as wild.
  const temple=templeLive(view);
  return Math.max(0,...(opponent.attacks??[]).map(a=>{
    if(publicEnergyCanPay(opponent,a,view,temple,'opponent')!==true)return 0;
    if(a.name==='Terminal Period'&&slot.damage===60)return slot.hp;
    if(a.name==='Apex Dragon')return 160; // unknown copy, heuristic pressure
    let base=parseDamage(a.damage);
    if(a.name==='Full Moon Rondo'&&hasName(opponent.printing,"Lillie's Clefairy ex"))
      base=20+20*(countBench(view.ownPublic)+countBench(view.opponentPublic));
    if(a.name==='Max Geist'&&isShadowRiderVmax(opponent)){
      const supplies=opponentBoard(view).map(p=>publicEnergySupply(p,view,temple,'opponent'));
      if(supplies.every(Array.isArray))
        base=10+30*supplies.flat().filter(unit=>unit.includes('Psychic')).length;
    }
    if(base===null)return 0;
    if(view.opponentPublic.publicTurnRestrictions?.alteredCreationDamage===true)base+=30;
    if(!temple)base=Math.max(0,base-20*opponent.energies.filter(e=>hasName(e,'Double Turbo Energy')).length);
    const bypass=a.name==='Energy Drive'||a.name==='Mind Shock';
    return Math.max(0,base*(bypass?1:weaknessMultiplier(opponent,slot,view,'opponent'))-(bypass?0:resistancePenalty(opponent,slot)));
  }));
}
function acerolaTargetScore(view,slot){
  if(!slot||slot.damage<=0||!Number.isFinite(slot.hp)||!view.opponentPublic.active)return -Infinity;
  const remaining=Math.max(0,slot.hp-slot.damage);
  const active=slot===view.ownPublic.active;
  const bench=view.ownPublic.bench.filter(Boolean);
  if(active&&!bench.length)return -Infinity;
  const current=bestAttackForSlot(view.ownPublic.active,view,view.opponentPublic.active);
  const currentKO=(current?.damage??0)>=Math.max(1,view.opponentPublic.active.hp-view.opponentPublic.active.damage);
  if(currentKO&&prizeLiability(view.opponentPublic.active)>=view.ownPublic.prizeCount)return -Infinity;
  const threat=visibleCounterattackThreat(view,slot);
  const exposed=remaining<=threat||(remaining<=70&&view.opponentPublic.handCount>=2);
  if(!exposed)return -Infinity;
  const others=ownBoard(view).filter(p=>p!==slot);
  if(active){
    const follow=bench.map(p=>{
      const idx=view.ownPublic.bench.indexOf(p);
      const moved=switchedPublic(view,'ownPublic',idx);
      const reduced={...moved,ownPublic:{...moved.ownPublic,bench:moved.ownPublic.bench.map((b,j)=>j===idx?null:b)}};
      return bestAttackForSlot(p,reduced,view.opponentPublic.active);
    }).filter(Boolean).sort((a,b)=>b.score-a.score)[0];
    if(!follow||follow.score<=0)return -Infinity;
    if(currentKO&&follow.damage<Math.max(1,view.opponentPublic.active.hp-view.opponentPublic.active.damage)&&
      prizeLiability(slot)<view.opponentPublic.prizeCount)return -Infinity;
  }
  const attackExposed=remaining<=threat;
  const liability=prizeLiability(slot)+
    (attackExposed&&view.opponentPublic.publicTurnRestrictions?.usedAlteredCreation===true?1:0);
  let score=liability*650+slot.damage*3+(active?350:0);
  if(liability>=view.opponentPublic.prizeCount)score+=1500;
  score-=slotEnergyCount(slot)*180+(isShadowRiderVmax(slot)?500:0);
  if(others.every(p=>!isShadowRiderVmax(p))&&isShadowRiderVmax(slot))score-=500;
  if(!active&&ownBoard(view).length<=2)score-=300;
  return score>=700?score:-Infinity;
}
function acerolaNeed(view){
  const best=Math.max(-Infinity,...ownBoard(view).map(p=>acerolaTargetScore(view,p)));
  return Number.isFinite(best)?best:-Infinity;
}
function supporterNeedScore(view, printing, receipt) {
  const priorOpponentKO = receipt?.priorOpponentTurnKO?.any === true;
  if (hasName(printing, 'Teammates')) return priorOpponentKO ? 100 : -5;
  if (hasName(printing, 'Raihan')) {
    return raihanNeed(view,receipt);
  }
  if (hasName(printing, 'Guzma')) return canGuzmaForAttack(view,receipt) ? 92 : -5;
  if (hasName(printing, 'Arven')) {
    const missingV = !hasBasicShadowRiderV(view) && hasOpenBench(view);
    const missingHood = hasStealthyHoodSearchNeed(view);
    return forestSealAccessNeed(view) ? 101 : missingV || missingHood ? 90 : 40;
  }
  if (hasName(printing, 'Acerola')) {
    const need=acerolaNeed(view);
    return Number.isFinite(need)?Math.min(160,75+need/100):-Infinity;
  }
  if (hasName(printing, "Lillie's Determination")) {
    return handResetNeed(view,printing);
  }
  if (hasName(printing, 'Iono')) {
    return handResetNeed(view,printing);
  }
  if (hasName(printing, 'Pokémon Ranger')) return usefulRanger(view,receipt) ? 110 : -5;
  return -5;
}

function searchNeedScore(view, printing, effectName = '', receipt = null) {
  if (!isText(printing)) return -Infinity;
  if(effectName==='VS Seeker')return seekerTargetNeed(view,printing,receipt);
  if(effectName==='Wonder Tag')return supporterNeedScore(view,printing,receipt);
  if (effectName === 'Star Alchemy') {
    const ordinary = searchNeedScore(view, printing, '', receipt);
    const supporter = supporterNeedScore(view, printing, receipt);
    const score = Math.max(ordinary, supporter);
    return score > 0 ? score + 10 : score;
  }
  if (effectName === 'Arven' && hasAnyName(printing,['Mysterious Treasure','Quick Ball']) && gateAccessNeed(view) && !itemLocked(view)) {
    const next={...view,ownHand:[...view.ownHand,printing],ownPublic:{...view.ownPublic,handCount:view.ownPublic.handCount+1,deckCount:view.ownPublic.deckCount-1}};
    if(hasDiscardableHand(next,1,printing,receipt))return 112;
  }
  if(hasName(printing,'Girafarig')&&needControlGirafarig(view))return 106;
  if(preserveStallSoloNightWatch(view)&&hasAnyName(printing,['Radiant Eternatus','Latias ex','Tapu Lele-GX','Shadow Rider Calyrex V','Girafarig','Wobbuffet','Marshadow',"Lillie's Clefairy ex",'Mimikyu','Dialga-GX']))return -5;
  if (hasName(printing, 'Radiant Eternatus')) {
    if (!gateAccessNeed(view)) return -5;
    const open = openBenchSlots(view);
    return open !== null && open >= 3 ? 120 : 100;
  }
  if (hasName(printing, 'Forest Seal Stone')) return forestSealAccessNeed(view) ? 115 : 0;
  if (hasName(printing,'Temple of Sinnoh')) return !knownFullyPrized(view,'Temple of Sinnoh') && Number.isFinite(usefulTemple(view)) ? 105 : 0;
  if (hasName(printing,'Wobbuffet')) return !boardHas(view,'Wobbuffet') && !handHas(view,'Wobbuffet') && hasOpenBench(view) && opponentHasRegidrago(view) ? 70 : 0;
  if (hasName(printing,'Tapu Lele-GX')) return supporterAvailable(view)&&!hasWonderTagLock(view)&&!boardHas(view,'Tapu Lele-GX')&&!handHas(view,'Tapu Lele-GX')&&openBenchSlots(view)>=4&&forestSealAccessNeed(view)?110:0;
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
    return energyTutorNeed(view,receipt);
  }
  if (hasName(printing, 'Fog Crystal')) {
    const missingBasicV = !hasShadowV &&
      !handHas(view, 'Shadow Rider Calyrex V') && hasOpenBench(view);
    return missingBasicV || energyTutorNeed(view,receipt)>0 ? 60 : 0;
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
    return knownFullyPrized(view,'Hisuian Heavy Ball')?-5:heavyBallNeed(view) >= 1000 ? 125 : 25;
  }
  if (hasName(printing, 'Night Stretcher')) return !itemLocked(view) && view.ownPublic.discard.some(p=>recoveryNeedScore(view,p,receipt)>=70) ? 75 : 0;
  if (hasName(printing, 'Unfair Stamp')) {
    return receipt?.priorOpponentTurnKO?.any === true && Number.isFinite(handResetNeed(view,printing)) ? 80 : 0;
  }
  if (effectName === 'Arven' && hasAnyName(printing, TOOL_NAMES)) return 70;
  return 0;
}

function discardValue(view, printing, receipt=null) {
  if (!isText(printing)) return 1000;
  if(hasName(printing,'Girafarig')&&affordableControlGetLostAccess(view))return 900;
  const duplicates = view.ownHand.filter(item => item === printing).length;
  if (hasName(printing, 'Battle VIP Pass') && view.globalTurn > 1) return 1;
  if (hasName(printing, 'Psychic Energy')) {
    const demand=energyDemand(view,receipt);
    // Existing board Energy does not make the last held attachment surplus.
    // Keep the price below the hard preservation threshold: a two-VMAX Gate
    // route may still justify one Energy if no cheaper payment is available.
    if(demand.current>0&&demand.held<=demand.current)return 650;
    return psychicEnergyCount(view)>=5?2:80;
  }
  if(hasName(printing,'Battle Compressor'))return 5; // copied route unadmitted
  if(hasName(printing,'Radiant Eternatus')&&!boardHas(view,'Radiant Eternatus')&&
     (canPlayRadiantForGate(view)||gatePivotView(view)!==null))return 1000;
  if(hasName(printing,'Forest Seal Stone')&&
     (view.ownTurnResources?.vstarUsed===true||view.ownPublic.publicTurnRestrictions?.vstarUsed===true))return 5;
  if(hasName(printing,'Stealthy Hood')&&duplicates<=1&&hasStealthyHoodSearchNeed(view))return 900;
  if(hasName(printing,'Marshadow')&&hasStadiumRemovalTarget(view)&&
      !boardHas(view,'Marshadow')&&(!handHas(view,'Field Blower')||itemLocked(view)))return 900;
  if(hasName(printing,'Field Blower')&&hasStadiumRemovalTarget(view)&&
      !boardHas(view,'Marshadow')&&!handHas(view,'Marshadow'))return 900;
  if(hasName(printing,'Hisuian Heavy Ball')&&heavyBallNeed(view)>=870)return 950;
  if(hasName(printing,'Tapu Lele-GX')&&supporterAvailable(view)&&hasOpenBench(view)&&
      !hasWonderTagLock(view)&&!boardHas(view,'Tapu Lele-GX')&&
      !view.ownHand.some(p=>hasAnyName(p,["Lillie's Determination",'Iono','Arven','Teammates','Raihan','Guzma','Acerola','Pokémon Ranger'])))return 850;
  if(hasName(printing,'Pokémon Ranger')&&itemLocked(view)&&!hasContinuousItemLock(view))return 850;
  if (hasName(printing, 'Dialga-GX')) {
    return 10; // no executable copied-attack path in this release
  }
  if (hasName(printing, 'Mimikyu')) {
    return 30; // Filch remains a fallback, not a reason to preserve Copycat resources
  }
  if (hasName(printing, 'Shadow Rider Calyrex VMAX') &&
      ownBoard(view).filter(slot => hasName(slot.printing, 'Shadow Rider Calyrex VMAX')).length < 2) return 900;
  if (hasName(printing, "Lillie's Clefairy ex") && opponentHasDragon(view) &&
      !boardHas(view, "Lillie's Clefairy ex")) return 900;
  if (hasName(printing, 'Unfair Stamp') || hasName(printing, 'Forest Seal Stone') ||
      hasName(printing, 'Computer Search')) return 1000;
  if (hasAnyName(printing, ['Guzma', 'Raihan', 'Acerola', 'Teammates', "Lillie's Determination"])) return 850;
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

// Battle Compressor becomes a real access connector only together with a
// *currently held* VS Seeker, a free Supporter turn and a specific live need.
// Ordinary empty-deck thinning, speculative copied attacks, and burning an
// irreplaceable one-of without a recovery action remain unsupported.
const COMPRESSOR_SEEKER_SUPPORTERS=Object.freeze([
  'Pokémon Ranger','Raihan','Teammates'
]);
function compressorSeekerSupporterNeed(view,printing,receipt) {
  if(!COMPRESSOR_SEEKER_SUPPORTERS.some(name=>hasName(printing,name)) ||
     !supporterAvailable(view) || !handHas(view,'VS Seeker') ||
     handHas(view,printing) || discardHas(view,printing) ||
     knownFullyPrized(view,printing) ||
     (view.ownPublic.lostZone??[]).some(p=>hasName(p,printing)))return -Infinity;
  const needed=supporterNeedScore(view,printing,receipt);
  if(!Number.isFinite(needed)||needed<90)return -Infinity;
  const held=Math.max(0,...view.ownHand.map(p=>supporterNeedScore(view,p,receipt)));
  return needed>held?needed:-Infinity;
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
  if (sourceZone === 'deck' && effectName === 'Battle Compressor' &&
      hasName(sourcePrinting, 'Battle Compressor')) {
    // Choose exactly one needed singleton Supporter, not three arbitrary
    // low-discard-value cards. The actor can recover it with VS Seeker.
    rows = choices.map(choice => {
      const need=compressorSeekerSupporterNeed(view,choice.printing,receipt);
      return {choice,score:Number.isFinite(need)?
        2000+need:-discardValue(view,choice.printing,receipt)};
    });
  } else if (sourceZone === 'hand') {
    rows = choices.map(choice => ({
      choice, score: -discardValue(view, choice.printing,receipt)
    }));
  } else {
    rows = choices.map(choice => ({
      choice, score: sourceZone === 'discard' && hasName(sourcePrinting,'VS Seeker')
        ? seekerTargetNeed(view,choice.printing,receipt)
        : (sourceZone === 'discard' && hasName(sourcePrinting,'Night Stretcher') ||
           sourceZone === 'prizes' && hasName(sourcePrinting,'Hisuian Heavy Ball'))
          ? recoveryNeedScore(view,choice.printing,receipt)
          : searchNeedScore(view, choice.printing, scoringEffectName, receipt)
    }));
  }
  // These effects deliver a Basic to the hand, not the discard or directly
  // to a Bench. Re-evaluate the terminal opportunity on actual revealed
  // legal choices rather than persisting an intention across the prompt.
  const clefairyToHand=(sourceZone==='deck'&&hasAnyName(sourcePrinting,['Fog Crystal','Mysterious Treasure','Quick Ball']))||
    (sourceZone==='discard'&&hasName(sourcePrinting,'Night Stretcher'))||
    (sourceZone==='prizes'&&hasName(sourcePrinting,'Hisuian Heavy Ball'));
  if(clefairyToHand&&!handHas(view,"Lillie's Clefairy ex")){
    for(const row of rows)if(hasName(row.choice.printing,"Lillie's Clefairy ex")&&
      fairyZoneFinalProjection(view,row.choice.printing))row.score=10000;
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
  } else if(metadata.sourceZone==='deck' && hasName(prompt.source?.sourcePrinting,'Teammates')) {
    // Re-evaluate remaining needs with the first tutor choice in hand.
    // Two copies of one name are not two resolved access bottlenecks.
    let projected=view;
    const available=[...ranked];
    for(let index=0;index<maximum&&available.length;index++){
      const reranked=available.map(row=>({...row,score:searchNeedScore(projected,row.choice.printing,'Teammates',receipt)}))
        .sort((a,b)=>b.score-a.score||String(a.choice.printing).localeCompare(String(b.choice.printing)));
      const row=reranked[0];
      if(index>=minimum&&row.score<=0)break;
      selected.push(row.choice);
      available.splice(available.findIndex(x=>x.choice.token===row.choice.token),1);
      projected={...projected,ownHand:[...projected.ownHand,row.choice.printing],
        ownPublic:{...projected.ownPublic,handCount:projected.ownPublic.handCount+1,
          deckCount:Math.max(0,projected.ownPublic.deckCount-1)}};
    }
  } else if(metadata.sourceZone==='hand'){
    // Reprice after each paid card: two individually redundant copies are
    // not necessarily jointly redundant.
    let hand=view.ownHand.slice();
    const available=ranked.slice();
    for(let i=0;i<minimum&&available.length;i++){
      const projected={...view,ownHand:hand,ownPublic:{...view.ownPublic,handCount:hand.length}};
      const rows=available.map(row=>({...row,score:-discardValue(projected,row.choice.printing,receipt)}))
        .sort((a,b)=>b.score-a.score||String(a.choice.printing).localeCompare(String(b.choice.printing)));
      const row=rows[0];
      if(!Number.isFinite(row.score))break;
      selected.push(row.choice);
      available.splice(available.findIndex(x=>x.choice.token===row.choice.token),1);
      const at=hand.indexOf(row.choice.printing);if(at>=0)hand.splice(at,1);
    }
  } else if (metadata.sourceZone === 'deck' && prompt.source?.effectName === 'Battle Compressor') {
    selected = ranked.filter(row=>Number.isFinite(row.score)&&row.score>0)
      .slice(0,Math.min(1,maximum)).map(row=>row.choice);
    // Normally minimumCount=0 for this up-to-three deck discard.
    if(selected.length<minimum)
      selected=ranked.slice(0,minimum).map(row=>row.choice);
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

// Project one legal Tool recipient, not the existence of a useful Tool somewhere.
// Strip only effects attributable to a live opposing source Hood actually blocks.
function stealthyHoodTargetScore(view,slot,receipt=null) {
  if(!slot||!Array.isArray(slot.tools)||slot.tools.length!==0||
      view.ownTurnResources?.toolPlayLocked===true||
      view.ownPublic.publicTurnRestrictions?.toolPlayLocked===true)return -Infinity;
  const resolved=resolveAbilityLockSources(view);
  const sources=resolved.active.filter(source=>source.seat==='opponent'&&
    abilityLockSourceSuppressesTarget(source,'actor',slot,view)===true);
  const equipped={...slot,tools:['Stealthy Hood UNB'],
    abilitySuppressions:(slot.abilitySuppressions??[]).filter(row=>
      !(row.suppressed===true&&sources.some(s=>hasName(row.sourcePrinting??'',s.cardName))))};
  const projected={...view,ownPublic:{...view.ownPublic,
    active:view.ownPublic.active===slot?equipped:view.ownPublic.active,
    bench:view.ownPublic.bench.map(p=>p===slot?equipped:p)}};
  if(hasEffectiveStealthyHood(equipped,projected,'actor')!==true)return -Infinity;
  let score=-Infinity;
  if(slot===view.ownPublic.active&&hasActiveStealthyHoodThreat(view))score=1250;
  if(isDragon(slot)&&opponentFairyZoneStatus(view)===true)score=Math.max(score,750);
  if(!sources.length||resolved.unknown)return score;
  const restored=ability=>effectiveAbilityStatus(slot,ability,'actor',view)===false&&
    effectiveAbilityStatus(equipped,ability,'actor',projected)===true&&
    abilityLockSourceStadiumSuppression({slot:equipped},projected)===false&&
    !resolveAbilityLockSources(projected).active.some(s=>
      abilityLockSourceSuppressesTarget(s,'actor',equipped,projected)!==false);
  if(opponentHasDragon(view)&&restored('Fairy Zone')){
    const before=bestAttackForSlot(view.ownPublic.active,view,view.opponentPublic.active);
    const after=bestAttackForSlot(projected.ownPublic.active,projected,projected.opponentPublic.active);
    score=Math.max(score,(after?.score??0)>=(10000)&&(before?.score??0)<10000?1850:1050);
  }
  if(isShadowRiderVmax(slot)&&restored('Underworld Door')){
    const zone=slot===view.ownPublic.active?'active':'bench';
    const index=zone==='active'?0:view.ownPublic.bench.indexOf(slot);
    const now=underworldDoorSourceIsUnspent(receipt,{sourceZone:zone,sourceIndex:index},slot)&&
      handHas(view,'Psychic Energy')&&view.ownPublic.deckCount>2&&
      view.ownPublic.bench.some(p=>p?.printed?.types?.includes('Psychic'));
    score=Math.max(score,now?1450:800);
  }
  return score;
}

function choosePokemonRecipient(view, prompt, receipt=null, profile=null) {
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
    ranked = actorChoices.map(row => ({...row,score:stealthyHoodTargetScore(view,row.target.slot,receipt)}));
  } else if (effectName==='Astral Barrage'&&hasName(prompt.source?.sourcePrinting,'Shadow Rider Calyrex V CRE')&&
      actorChoices.length===0&&(
        (minimum===2&&maximum===2&&opponentChoices.length>=2&&
          (view.opponentPublic.bench.filter(Boolean).length>=2 ||
           paperAstralBarrageTargetsEnabled(profile))) ||
        (paperAstralBarrageTargetsEnabled(profile)&&minimum===1&&maximum===1&&
          opponentChoices.length===1&&opponentBoard(view).length===1)
      )) {
    ranked=opponentChoices.map(row=>({...row,score:astralTargetScore(view.ownPublic.active,row.target.slot,view)}));
  } else if (effectName==='Tapu Cure-GX'&&hasName(prompt.source?.sourcePrinting,'Tapu Lele-GX')&&actorChoices.length>0){
    // Pinned reducer permits Active and one damaged target; use only
    // paper-equivalent two-damaged-Bench admission, never its Active bug.
    const legal=actorChoices.filter(row=>row.target.zone==='bench'&&row.target.slot.damage>0);
    if(legal.length<2||maximum!==2)return abstain('NO_PAPER_EQUIVALENT_TAPU_CURE');
    ranked=legal.map(row=>({...row,score:tapuCureValue(view,row.target.slot)}));
    const chosen=ranked.sort((a,b)=>b.score-a.score||a.target.index-b.target.index).slice(0,2);
    for(const row of ranked)recordPolicyAuditScore(row.choice.token,row.score,'TAPU_CURE_BENCH_TARGET');
    return {kind:'select-choices',tokens:chosen.map(row=>row.choice.token)};
  } else if (effectName === 'Acerola' && actorChoices.length > 0) {
    ranked=actorChoices.map(row=>({...row,score:acerolaTargetScore(view,row.target.slot)}));
  } else if (effectName === 'Guzma' && actorChoices.length > 0) {
    const target=view.opponentPublic.active;
    ranked=actorChoices.map(row=>{
      const moved=guzmaSwitch(view,'ownPublic',row.target.index);
      return {...row,terminal:!!guzmaProjectedFinalAttack(moved),score:guzmaPivotScore(view,moved,row.target.index,receipt)};
    });
    if(ranked.some(row=>row.terminal))ranked=ranked.filter(row=>row.terminal);
  } else if (effectName === 'Guzma' && opponentChoices.length > 0) {
    const plans=guzmaPlans(view,receipt);
    const winning=opponentChoices.filter(row=>plans.some(p=>p.terminal===true&&p.targetIndex===row.target.index));
    ranked=(winning.length?winning:opponentChoices).map(row=>({...row,
      score:Math.max(-Infinity,...plans.filter(p=>p.targetIndex===row.target.index&&(!winning.length||p.terminal===true)).map(p=>p.score))}));
  } else {
    ranked = actorChoices.map(row => {
      const slot = row.target.slot;
      let score = 100 - slotEnergyCount(slot) * 5;
      // Unadmitted Copycat must not consume the primary acceleration route.
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
  setPolicyAuditRule('ENERGY_DISCARD_COST_COUNT', 'DISCARD_VALUE_ASC_PRINTING_ASC_TOKEN_ASC');
  const metadata = prompt.publicMetadata;
  if (!metadata || metadata.selectionType !== 'energy-payment' || typeof metadata.energyType !== 'string') return abstain('UNTRUSTED_ENERGY_SELECTION');
  const costTypes = metadata.energyType.split(',').map(value => value.trim().toLowerCase());
  if (costTypes.length < 1 || costTypes.length > 12 || costTypes.some(type => type !== 'colorless' && type !== 'psychic')) return abstain('NO_SUPPORTED_ENERGY_PAYMENT');
  const energyChoices = prompt.choices.filter(choice => choice.kind === 'energy');
  const rawMaximum = metadata.energyCount ?? metadata.count;
  if (!Number.isSafeInteger(rawMaximum) || rawMaximum < 1) return abstain('NO_VISIBLE_ENERGY_CHOICE');
  const maximum = Math.min(rawMaximum, energyChoices.length);
  const choices = energyChoices.filter(choice => choice.publicMetadata?.ownerSeat === 'actor' && choice.publicMetadata?.isOwnerVisible === true && isText(choice.printing));
  if (choices.length !== energyChoices.length || choices.some(choice => !hasName(choice.printing, 'Psychic Energy') || String(choice.publicMetadata?.energyType ?? '').trim().toLowerCase() !== 'psychic')) return abstain('NO_SUPPORTED_ENERGY_PAYMENT');
  const requested = costTypes.length;
  if (requested > maximum || requested > choices.length) return abstain('NO_VISIBLE_ENERGY_CHOICE');
  const ranked = choices.map(choice => ({ choice, score: discardValue(view, choice.printing) }));
  for (const row of ranked) recordPolicyAuditScore(row.choice.token, row.score, 'NO_DISCARD_VALUE_SCORE');
  ranked.sort((x,y)=>x.score-y.score||String(x.choice.printing).localeCompare(String(y.choice.printing))||String(x.choice.token).localeCompare(String(y.choice.token)));
  const selected = ranked.slice(0, requested);
  if (selected.length !== requested) return abstain('NO_VISIBLE_ENERGY_CHOICE');
  return { kind: 'select-choices', tokens: selected.map(row => row.choice.token) };
}
function chooseEnergyAttachment(view, prompt) {
  setPolicyAuditRule('UNDERWORLD_DOOR_ENERGY_TARGET_SCORE', 'SCORE_DESC_BENCH_INDEX_TOKEN_ASC');
  const metadata = prompt.publicMetadata;
  if(prompt.source?.effectName==='Raihan'&&hasName(prompt.source.sourcePrinting,'Raihan')) {
    if(!metadata||metadata.selectionType!=='energy-attachment'||metadata.sourceZone!=='discard'||
      metadata.ownerSeat!=='actor'||metadata.minimumCount!==1||metadata.maximumCount!==1||
      metadata.isOwnerVisible!==true||metadata.energyType!=='BASIC'||metadata.allowCancel!==false)
      return abstain('UNTRUSTED_ENERGY_SELECTION');
    const candidateView={...view,ownTurnResources:{...view.ownTurnResources,
      energyPlayedTurn:false,energyPlayLocked:false},ownPublic:{...view.ownPublic,
      publicTurnRestrictions:{...view.ownPublic.publicTurnRestrictions,energyPlayLocked:false}}};
    const ranked=prompt.choices.map(choice=>{
      const m=choice.publicMetadata;
      const zone=m?.zone,index=zone==='active'?0:m?.benchIndex;
      const target=zone==='active'?view.ownPublic.active:
        zone==='bench'&&Number.isInteger(index)?view.ownPublic.bench[index]:null;
      const score=choice.kind==='energy'&&hasName(choice.printing,'Psychic Energy')&&target&&
        m.sourceZone==='discard'&&m.ownerSeat==='actor'&&m.isOwnerVisible===true&&m.energyType==='BASIC'?
        scoreEnergyPlay({actorPrinting:choice.printing,targetPrinting:target.printing,
          publicMetadata:{targetSeat:'actor',targetZone:zone,targetIndex:index}},candidateView):-Infinity;
      recordPolicyAuditScore(choice.token,score,'INVALID_RAIHAN_ASSIGNMENT');
      return {choice,score};
    }).filter(row=>Number.isFinite(row.score)).sort((a,b)=>b.score-a.score||a.choice.token.localeCompare(b.choice.token));
    setPolicyAuditRule('RAIHAN_ACCELERATION_THEN_SEARCH','SCORE_DESC_TOKEN_ASC');
    return ranked.length?{kind:'select-choice',token:ranked[0].choice.token}:abstain('NO_VISIBLE_ENERGY_CHOICE');
  }
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
    const attachedView=viewAfterPsychicAttachment(view,'bench',index,choice.printing);
    const now=bestAttackForSlot(view.ownPublic.active,view,view.opponentPublic.active);
    const next=bestAttackForSlot(attachedView?.ownPublic.active,attachedView??view,view.opponentPublic.active);
    if((next?.score??0)>=10000&&(now?.score??0)<10000)score+=6000;
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
  const hand=view.ownHand.length?view.ownHand:cardChoices.map(c=>c.printing);
  const hasV=visible.some(isBasicShadowRiderVPrinting);
  const payment=hand.some(p=>!hasAnyName(p,['Radiant Eternatus','Latias ex','Float Stone','Mysterious Treasure','Quick Ball','Forest Seal Stone','Wobbuffet'])&&!isBasicShadowRiderVPrinting(p));
  const radiantAvailable = visible.some(p => hasName(p, 'Radiant Eternatus')) ||
    (payment&&hand.some(p=>hasAnyName(p,['Mysterious Treasure','Quick Ball']))) ||
    (hasV&&hand.some(p=>hasAnyName(p,['Forest Seal Stone','Arven','Tapu Lele-GX'])));
  const pivotAvailable = visible.some(p => hasAnyName(p, ['Latias ex', 'Float Stone'])) ||
    bench.some(slot => hasName(slot.printing, 'Latias ex'));
const directRadiant = visible.some(p=>hasName(p,'Radiant Eternatus')) ||
  (payment&&hand.some(p=>hasAnyName(p,['Mysterious Treasure','Quick Ball']))) ||
  (hasV&&hand.some(p=>hasAnyName(p,['Forest Seal Stone','Arven'])));
const leleOnlyGate = hasV && visible.some(p=>hasName(p,'Tapu Lele-GX')) && !directRadiant &&
  !hand.some(p=>hasName(p,'Sky Field'));
const heldFloat = hand.some(p=>hasName(p,'Float Stone'));
  const context = {lockbridge,radiantAvailable,pivotAvailable:pivotAvailable&&!(leleOnlyGate&&!heldFloat&&hasV)};
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
  const benchLimit = radiantSpent ? 4 : leleOnlyGate ? 1 : 2;
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
  // On the first player's setup, no opposing turn intervenes before they can
  // play an entry-trigger Basic from hand. Preserve Wonder Tag in that case;
  // keep lone-board insurance when going second or turn orientation is unknown.
  if (room>0 && bench.length+placed===0 &&
      view.turnSeat!==view.actorSeat &&
      hasAnyName(activePrinting,['Girafarig','Mimikyu','Marshadow'])) {
    const lele=candidates.find(row=>hasName(row.choice.printing,'Tapu Lele-GX'));
    if (lele) selected.push(lele.choice);
  }
  // Rank-26 donk exposure makes an otherwise lone Shadow Rider V too costly
  // when a legal backup Basic is already in the setup hand. This fallback is
  // deliberately below every positive-score Bench choice: only sacrifice an
  // entry trigger when the alternative is entering play with exactly one body.
  if(room>0&&bench.length+placed===0&&isBasicShadowRiderVPrinting(activePrinting)){
    const backup=['Dialga-GX','Tapu Lele-GX','Radiant Eternatus']
      .map(name=>candidates.find(row=>hasName(row.choice.printing,name)))
      .find(Boolean);
    if(backup && (view.turnSeat!==view.actorSeat ||
        !isSetupTrigger(backup.choice.printing))) selected.push(backup.choice);
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

// Mandatory replacement after a Knock Out. Every target is a visible owner Bench
// slot; rank funded counterattacks above generic setup and avoid needless prize exposure.
function chooseKnockoutPromotion(view,prompt) {
  const m=prompt.publicMetadata;
  if(view.phase!==3||view.ownPublic.active!==null||
      prompt.promptType!=='ChoosePokemonPrompt'||prompt.description!=='CHOOSE_NEW_ACTIVE_POKEMON'||
      prompt.source.sourcePrinting!==null||prompt.source.effectName!==prompt.description||
      m?.selectionType!=='pokemon'||m.targetZone!=='bench'||m.minimumCount!==1||
      m.maximumCount!==1||m.allowCancel!==false)
    return abstain('UNSUPPORTED_ENGINE_SETUP_PROMPT');
  const rows=[];
  for(const c of prompt.choices){
    if(c.kind!=='pokemon'||c.publicMetadata?.ownerSeat!=='actor'||
       c.publicMetadata?.targetZone!=='bench'||!c.printing)
      return abstain('NO_VISIBLE_POKEMON_TARGET');
    const t=slotForPokemonChoice(view,c);
    if(!t||rows.some(r=>r.index===t.index))return abstain('NO_VISIBLE_POKEMON_TARGET');
    const moved=switchedPublic(view,'ownPublic',t.index);
    const s=moved.ownPublic.active,opp=moved.opponentPublic.active;
    const attack=bestAttackForSlot(s,moved,opp);
    const hp=Math.max(0,s.hp-s.damage);
    if(hp===0)return abstain('NO_VISIBLE_POKEMON_TARGET');
    const cost=ownRetreatCost(moved);
    const exposed=visibleCounterattackThreat(moved,s)>=hp;
    const terminal=opp&&Number.isFinite(attack?.damage)&&attack.damage>=opp.hp-opp.damage&&
      prizeLiability(opp)>=view.ownPublic.prizeCount;
    const score=(terminal?30000:0)+(attack?.score??0)+hp+
      Math.min(5,s.energies.length)*80+
      (cost===0?350:cost===null?-100:-cost*80)+wobLockValue(view,t.slot)-
      prizeLiability(s)*120-(exposed&&!terminal?
        (prizeLiability(s)>=view.opponentPublic.prizeCount?9000:1500):0);
    rows.push({choice:c,index:t.index,score});
    recordPolicyAuditScore(c.token,score);
  }
  if(rows.length===0)return abstain('NO_VISIBLE_POKEMON_TARGET');
  rows.sort((a,b)=>b.score-a.score||a.index-b.index);
  setPolicyAuditRule('KO_PROMOTION_COUNTERATTACK_AND_PRIZE_RISK','SCORE_DESC_NATIVE_TARGET_INDEX');
  return {kind:'select-choices',tokens:[rows[0].choice.token]};
}

function choosePrompt(view, prompt, receipt, profile) {
  if (!prompt || prompt.actingSeat !== view.actorSeat ||
      prompt.source?.classification !== 'actor-choice') {
    return abstain('UNTRUSTED_PROMPT');
  }
  if (prompt.source.sourceKind === 'engine') {
    if(prompt.description==='CHOOSE_NEW_ACTIVE_POKEMON')return chooseKnockoutPromotion(view,prompt);
    if(prompt.description==='CHOOSE_PRIZE_CARD'){
      const m=prompt.publicMetadata;
      if(![2,3].includes(view.phase)||prompt.promptType!=='ChoosePrizePrompt'||
          prompt.source.sourcePrinting!==null||prompt.source.effectName!==prompt.description||
          m?.selectionType!=='prize-slots'||m.ownerSeat!=='actor'||m.sourceZone!=='prizes'||
          m.isOwnerVisible!==false||m.allowCancel!==false||!Number.isSafeInteger(m.requiredCount)||
          m.requiredCount<1||m.requiredCount>6||
          prompt.choices.some(c=>c.kind!=='prize'||c.printing!==undefined||
            c.publicMetadata?.ownerSeat!=='actor'||c.publicMetadata?.sourceZone!=='prizes'||
            c.publicMetadata?.isOwnerVisible!==false||
            !Number.isSafeInteger(c.publicMetadata.selectionIndex)))
        return abstain('UNSUPPORTED_PRIZE_SELECTION');
      if(new Set(prompt.choices.map(c=>c.publicMetadata.selectionIndex)).size!==prompt.choices.length)
        return abstain('NO_LEGAL_PRIZE_SELECTION');
      return choosePrizeSlots(prompt);
    }
    return chooseEngineSetupPrompt(view, prompt, profile);
  }
  if (prompt.source.sourceKind !== 'card-effect') {
    return abstain('UNTRUSTED_PROMPT_SOURCE');
  }
  switch (prompt.promptType) {
    case 'ChooseCardsPrompt':
      if(prompt.source.effectName==='Get Lost'&&hasName(prompt.source.sourcePrinting,'Girafarig')) {
        const m=prompt.publicMetadata;
        if(m?.sourceZone!=='discard'||m.ownerSeat!=='opponent'||m.isOwnerVisible!==true||m.minimumCount!==2||m.maximumCount!==2)return abstain('UNTRUSTED_CARD_SELECTION');
        const rows=prompt.choices.filter(c=>c.kind==='card'&&c.publicMetadata?.ownerSeat==='opponent'&&c.publicMetadata?.isOwnerVisible===true&&view.opponentPublic.discard.includes(c.printing)).map(c=>({choice:c,score:getLostValue(view,c.printing)})).sort((a,b)=>b.score-a.score||a.choice.token.localeCompare(b.choice.token));
        for(const row of rows)recordPolicyAuditScore(row.choice.token,row.score,'GET_LOST_PUBLIC_DISCARD_VALUE');
        if(rows.length<2)return abstain('INSUFFICIENT_SUPPORTED_CARD_CHOICES');
        const pair=getLostPairs(view,rows.map(row=>({...row,printing:row.choice.printing})));
        setPolicyAuditRule('GET_LOST_PUBLIC_DISCARD','PAIR_THREAT_DENIAL');
        return {kind:'select-choices',tokens:pair.rows.map(r=>r.choice.token)};
      }
      return isFieldBlowerPrompt(prompt) &&
        prompt.publicMetadata?.sourceZone === 'tool'
        ? chooseFieldBlowerToolChoice(view, prompt)
        : chooseCardCombination(view, prompt, receipt);
    case 'ChoosePokemonPrompt':
      return isFieldBlowerPrompt(prompt)
        ? chooseFieldBlowerPokemon(view, prompt)
        : choosePokemonRecipient(view, prompt, receipt, profile);
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

function optionalBenchHazard(view,printing){
  // Exact HP of the candidate's ordinary one-Prize utility basics; not an
  // opponent roster lookup. Do not create an exposed third Trifrost target
  // when an already-funded active Apex can finish the game.
  const hp=hasName(printing,'Marshadow')?80:hasName(printing,'Mimikyu')?70:
    hasName(printing,'Girafarig')?90:null;
  if(hp===null)return false;
  const before=apexHazard(view);
  if(!before.known||before.maximum>=view.opponentPublic.prizeCount)return false;
  const board=hazardBoard(view);
  board.push({key:board.length,printing,hp,prizes:1,basic:true,isV:false,damaged:false});
  return apexHazard(view,view.opponentPublic.discard,board).maximum>=view.opponentPublic.prizeCount;
}
function scoreBasicPlay(item, view, profile,receipt) {
  const metadata = item.publicMetadata ?? {};
  if (metadata.targetSeat !== 'actor' || metadata.targetZone !== 'bench') return -Infinity;
  const printing = item.actorPrinting ?? '';
  if (!hasOpenBench(view)||preserveStallSoloNightWatch(view)) return -Infinity;
  if(optionalBenchHazard(view,printing)&&!(hasName(printing,'Marshadow')&&hasStadiumRemovalTarget(view)))return -Infinity;
  if(hasName(printing,'Girafarig')&&affordableControlGetLostAccess(view))return 1080;
  const reserveGate = handHas(view,'Radiant Eternatus') &&
    !boardHas(view,'Radiant Eternatus') && openBenchSlots(view)<=3 &&
    expectedClimacticGateTargets(view,2)>=1 &&
    (canPlayRadiantForGate(view) || gatePivotView(view)!==null);
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
    if(!supporterAvailable(view))return -Infinity;
    const held=Math.max(-Infinity,...view.ownHand.map(p=>supporterNeedScore(view,p,receipt)));
    const rangerAccess=profile?.profileId==='hood-shield-shadow-rider-v1' &&
      usefulRanger(view,receipt)&&!knownFullyPrized(view,'Pokémon Ranger')&&!handHas(view,'Pokémon Ranger');
    const arvenAccess=forestSealAccessNeed(view)&&!handHas(view,'Arven')&&openBenchSlots(view)>=4;
    if(rangerAccess)return held>=110?-Infinity:1120;
    if(arvenAccess)return held>=101?-Infinity:950;
    return held>=75?-Infinity:720;
  }
  if (hasName(printing, 'Trevenant & Dusknoir-GX') &&
      !boardHas(view, 'Trevenant & Dusknoir-GX') && hasOpenBench(view) &&
      view.opponentPublic.handCount >= 4 && canFuelNightWatch(view)) {
    return 700 + Math.min(100, (view.opponentPublic.handCount - 4) * 25);
  }
  // Mimikyu Copycat is not an admitted attack path.
  if (hasName(printing, "Lillie's Clefairy ex") && opponentHasDragon(view) &&
      !boardHas(view, "Lillie's Clefairy ex")) return 900;
  if (hasName(printing, 'Latias ex') && !boardHas(view, 'Latias ex')) {
    if(reserveGate && !hasName(view.ownPublic.active?.printing,'Wobbuffet')) return -Infinity;
    if(reserveGate && openBenchSlots(view)<3)return -Infinity;
    if(hasName(view.ownPublic.active?.printing,'Wobbuffet')&&
      handHas(view,'Radiant Eternatus')&&gatePivotView(view)===null &&
      !hasActiveStadiumLock(view,'Silent Lab') && !hasActiveStadiumLock(view,'Path to the Peak'))return 1050;
    return 650;
  }
  if (hasName(printing, 'Girafarig') && opponentHasRegidrago(view) &&
      !boardHas(view, 'Girafarig')) return 450;
  if (hasName(printing, 'Marshadow') &&
      hasStadiumRemovalTarget(view) && !boardHas(view, 'Marshadow')) return 850;
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
  if (remaining === 0 || deck === 0 || knownFullyPrized(view,'Shadow Rider Calyrex VMAX')) return 0;
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
  if(preserveStallSoloNightWatch(view))return -Infinity;
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

function viewAfterPsychicAttachment(view,zone,index,printing){
  if(!hasName(printing,'Psychic Energy'))return null;
  const target=zone==='active'?view.ownPublic.active:
    zone==='bench'?view.ownPublic.bench[index]:null;
  if(!target)return null;
  const charged={...target,energies:[...target.energies,printing]};
  return {...view,ownPublic:{...view.ownPublic,
    active:zone==='active'?charged:view.ownPublic.active,
    bench:view.ownPublic.bench.map((slot,i)=>zone==='bench'&&i===index?charged:slot)}};
}
function controlGetLostChargeValue(view,index,printing,items){
 if(!observedDenialThreat(view))return -Infinity;
 const own=view.ownPublic,target=view.opponentPublic.active,gir=own.bench[index];
 if(!target||!gir||!hasName(gir.printing,'Girafarig')||
   view.globalTurn<=1||!retreatAvailableNow(view)||
   !items.some(x=>x.kind==='retreat'&&x.publicMetadata?.benchIndex===index&&
      (!x.targetPrinting||x.targetPrinting===gir.printing)))return -Infinity;
 const cost=ownRetreatCost(view);
 if(cost===null||cost>1||slotEnergyCount(own.active)<cost)return -Infinity;
 const old={...own.active,energies:own.active.energies.slice(cost)};
 const movedView={...view,ownPublic:{...own,active:gir,bench:own.bench.map((p,i)=>i===index?old:p)}};
 const attack=gir.attacks.find(a=>a.name==='Get Lost');
 if(!attack||canPayAttack(gir,attack,movedView))return -Infinity;
 const charged={...gir,energies:[...gir.energies,printing]};
 const after={...movedView,ownPublic:{...movedView.ownPublic,active:charged}};
 const score=attackScore(charged,attack,after,target,{requirePayable:true});
 const current=bestAttackForSlot(own.active,view,target)?.score??0;
 if(!Number.isFinite(score)||score<=current+cost*350+100)return -Infinity;
 for(const ret of items.filter(x=>x.kind==='retreat')){
   const i=ret.publicMetadata?.benchIndex,b=own.bench[i];
   if(i===index||!b||!Number.isSafeInteger(i)||(ret.targetPrinting&&ret.targetPrinting!==b.printing))continue;
   const alt={...view,ownPublic:{...own,active:b,bench:own.bench.map((p,j)=>j===i?old:p)}};
   if((bestAttackForSlot(b,alt,target)?.score??0)>score)return -Infinity;
 }
 return 1250;
}
function scoreEnergyPlay(item, view, items = []) {
  const metadata = item.publicMetadata ?? {};
  if (!energyAvailableNow(view) ||
      view.ownTurnResources?.energyPlayLocked === true ||
      view.ownPublic.publicTurnRestrictions?.energyPlayLocked === true ||
      metadata.targetSeat !== 'actor' ||
      !['active', 'bench'].includes(metadata.targetZone) ||
      !hasName(item.actorPrinting, 'Psychic Energy')) return -Infinity;
  const target = metadata.targetZone === 'active'
    ? view.ownPublic.active : view.ownPublic.bench[metadata.targetIndex];
  if (!target || (item.targetPrinting && target.printing !== item.targetPrinting)) return -Infinity;
  const count = slotEnergyCount(target);
  if(target===view.ownPublic.active&&preserveStallSoloNightWatch(view)&&
     count<3+view.ownPublic.prizeCount+2)return 1200;
  const chargedView=viewAfterPsychicAttachment(view,metadata.targetZone,metadata.targetIndex,item.actorPrinting);
  const defender=view.opponentPublic.active;
  if(metadata.targetZone==='bench'){
    const denial=controlGetLostChargeValue(view,metadata.targetIndex,item.actorPrinting,items);
    if(Number.isFinite(denial))return denial;
  }
  if (defender && chargedView?.ownPublic.active && view.globalTurn>1) {
    const before=bestAttackForSlot(view.ownPublic.active,view,defender);
    const after=bestAttackForSlot(chargedView.ownPublic.active,chargedView,defender);
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

function hasDiscardableHand(view, required = 1, playedPrinting = null, receipt=null) {
  const hand=view.ownHand.slice();
  const index=hand.indexOf(playedPrinting);
  if(index>=0)hand.splice(index,1);
  if(hand.length<required)return false;
  for(let i=0;i<required;i++){
    const projected={...view,ownHand:hand,ownPublic:{...view.ownPublic,handCount:hand.length}};
    const best=hand.map((printing,index)=>({index,value:discardValue(projected,printing,receipt)}))
      .sort((a,b)=>a.value-b.value||a.index-b.index)[0];
    if(!best||best.value>=800)return false;
    hand.splice(best.index,1);
  }
  return true;
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

function switchedPublic(view,side,index) {
  const player=view[side],incoming=player.bench[index];
  if(!incoming)return view;
  return {...view,[side]:{...player,active:incoming,
    bench:player.bench.map((slot,i)=>i===index?player.active:slot)}};
}
// Active-only Ability locks cease when the holder leaves the Active Spot.
// Project only the named departure; retain all other suppression evidence.
function activeOnlyLockSource(view,side) {
  const seat=side==='ownPublic'?'actor':'opponent';
  return fairyZoneLockSources(view).find(s=>s.seat===seat&&s.zone==='active'&&s.scope.startsWith('active-'))??null;
}
function guzmaSwitch(view,side,index) {
  const source=activeOnlyLockSource(view,side);
  const moved=switchedPublic(view,side,index);
  if(!source||effectiveAbilityStatus(source.slot,source.abilityName,source.seat,view)!==true)return moved;
  if([moved.ownPublic.active,moved.opponentPublic.active].some(p=>hasName(p?.printing,source.cardName)))return moved;
  const clear=s=>!s||!Array.isArray(s.abilitySuppressions)?s:{...s,
    abilitySuppressions:s.abilitySuppressions.filter(r=>!(r.suppressed===true&&hasName(r.sourcePrinting??'',source.cardName)))};
  const player=p=>({...p,active:clear(p.active),bench:p.bench.map(clear)});
  return {...moved,ownPublic:player(moved.ownPublic),opponentPublic:player(moved.opponentPublic)};
}
function guzmaDoorOpportunity(before,after,ownIndex,receipt,newlyUnlocked) {
  if(!handHas(after,'Psychic Energy')||after.ownPublic.deckCount<=2||
      !after.ownPublic.bench.some(s=>s?.printed?.types?.includes('Psychic')))return 0;
  let count=0;
  for(const [zone,index,slot] of [['active',0,before.ownPublic.active],
      ...before.ownPublic.bench.map((s,i)=>['bench',i,s])]){
    if(!isShadowRiderVmax(slot)||!underworldDoorSourceIsUnspent(receipt,{sourceZone:zone,sourceIndex:index},slot))continue;
    if(newlyUnlocked&&effectiveAbilityStatus(slot,'Underworld Door','actor',before)!==false)continue;
    const target=ownIndex<0?(zone==='active'?after.ownPublic.active:after.ownPublic.bench[index]):
      zone==='active'?after.ownPublic.bench[ownIndex]:
      index===ownIndex?after.ownPublic.active:after.ownPublic.bench[index];
    if(target&&effectiveAbilityStatus(target,'Underworld Door','actor',after)===true)count++;
  }
  return Math.min(count,after.ownHand.filter(p=>hasName(p,'Psychic Energy')).length);
}
function guzmaGateOpportunity(view){
  return handHas(view,'Radiant Eternatus')&&!boardHas(view,'Radiant Eternatus')&&canPlayRadiantForGate(view);
}
function guzmaPivotScore(view,after,ownIndex,receipt){
  const slot=after.ownPublic.active;
  if(!slot)return -Infinity;
  const attack=bestAttackForSlot(slot,after,after.opponentPublic.active);
  const cost=ownRetreatCost(after);
  const exposed=visibleCounterattackThreat(after,slot)>=slot.hp-slot.damage;
  return (attack?.score??-1000)+guzmaDoorOpportunity(view,after,ownIndex,receipt,false)*450+
    (guzmaGateOpportunity(after)?1100:0)+(cost===0?150:0)-prizeLiability(slot)*100-
    (exposed&&prizeLiability(slot)>=after.opponentPublic.prizeCount?3500:0);
}
// Prompt-time projection, not a native frontier certificate. Recheck on next root.
function guzmaProjectedFinalAttack(view) {
  const r=view.ownPublic.publicTurnRestrictions??{};
  if((r.attackMaxEnergyTurnsRemaining??0)>0)return null;
  const names=new Set((view.ownPublic.active?.attacks??[]).filter(a=>!a.gxAttack).map(a=>a.name));
  return publicFinalAttack(view,names);
}
function guzmaPlans(view,receipt=null) {
  if(!view.ownPublic.active||!view.opponentPublic.active)return [];
  const ownIndices=view.ownPublic.bench.map((slot,i)=>slot?i:-1).filter(i=>i>=0);
  if(!ownIndices.length)ownIndices.push(-1);
  const rows=[];
  const departed=activeOnlyLockSource(view,'opponentPublic');
  const departingLive=departed&&effectiveAbilityStatus(departed.slot,departed.abilityName,'opponent',view)===true;
  for(const [targetIndex,target] of view.opponentPublic.bench.entries()){
    if(!target)continue;
    const gusted=guzmaSwitch(view,'opponentPublic',targetIndex);
    for(const ownIndex of ownIndices){
      const moved=ownIndex<0?gusted:guzmaSwitch(gusted,'ownPublic',ownIndex);
      const attacker=moved.ownPublic.active;
      const terminal=guzmaProjectedFinalAttack(moved);
      if(terminal){
        const prizes=prizeLiability(target);
        const score=prizes*1500+attackScore(attacker,terminal.attack,moved,target,{requirePayable:true})-prizeLiability(attacker)*100;
        rows.push({targetIndex,ownIndex,prizes,unlock:0,score,terminal:true});
        continue;
      }
      const attack=bestAttackForSlot(attacker,moved,moved.opponentPublic.active);
      if(attack&&Number.isFinite(attack.damage)&&attack.damage>=Math.max(0,target.hp-target.damage)){
        const prizes=prizeLiability(target);
        rows.push({targetIndex,ownIndex,prizes,unlock:0,score:prizes*1500+attack.score-prizeLiability(attacker)*100});
        continue;
      }
      // No new Active-only locker may be activated in this speculative
      // non-KO unlock route. A remaining continuous lock must still be
      // resolved by the normal public Ability-status logic.
      if(!departingLive||activeOnlyLockSource(moved,'opponentPublic')||
          activeOnlyLockSource(moved,'ownPublic')||resolveAbilityLockSources(moved).unknown)continue;
      const doors=guzmaDoorOpportunity(view,moved,ownIndex,receipt,true);
      const gate=!guzmaGateOpportunity(view)&&guzmaGateOpportunity(moved);
      const unlock=doors*1100+(gate?1800:0);
      if(unlock<=0)continue;
      const pivot=guzmaPivotScore(view,moved,ownIndex,receipt);
      if(pivot<=-3000)continue;
      rows.push({targetIndex,ownIndex,prizes:0,unlock,score:unlock+pivot});
    }
  }
  return rows.sort((a,b)=>Number(b.terminal===true)-Number(a.terminal===true)||Number(b.prizes>0)-Number(a.prizes>0)||b.score-a.score||a.targetIndex-b.targetIndex||a.ownIndex-b.ownIndex);
}
function usefulGuzma(view,receipt=null) {
  const plan=guzmaPlans(view,receipt)[0];
  if(!plan)return -Infinity;
  const current=bestAttackForSlot(view.ownPublic.active,view,view.opponentPublic.active);
  if(current?.damage>=Math.max(0,view.opponentPublic.active.hp-view.opponentPublic.active.damage)&&
      prizeLiability(view.opponentPublic.active)>=plan.prizes)return -Infinity;
  if(plan.prizes===0)return 1180+Math.min(200,plan.unlock/20);
  return plan.prizes>=view.ownPublic.prizeCount?2600:1150+plan.prizes*100;
}
function canGuzmaForAttack(view,receipt=null) {
  return Number.isFinite(usefulGuzma(view,receipt));
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
  return toolsEffectiveForRetreat(view,target,'actor')!==true;
}

function hasStarAlchemyBottleneck(view, receipt, profile) {
  if(profile?.profileId==='lockbridge-shadow-rider-v1' && Number.isFinite(usefulTemple(view)) &&
    !handHas(view,'Temple of Sinnoh') && !knownFullyPrized(view,'Temple of Sinnoh')) return true;
  const missingBasicV = !knownFullyPrized(view,'Shadow Rider Calyrex V') && !hasBasicShadowRiderV(view) &&
    !handHasBasicShadowRiderV(view) && hasOpenBench(view);
  const missingVmax = !knownFullyPrized(view,'Shadow Rider Calyrex VMAX') && hasUnevolvedShadowRiderV(view) &&
    !handHas(view, 'Shadow Rider Calyrex VMAX') && !(handHas(view,'Radiant Eternatus') && canPlayRadiantForGate(view));
  const missingDialga = opponentHasRegidrago(view) &&
    !boardHas(view, 'Dialga-GX') && !handHas(view, 'Dialga-GX') &&
    !discardHas(view, 'Dialga-GX');
  const missingMimikyu = opponentHasRegidrago(view) &&
    !boardHas(view, 'Mimikyu') && !handHas(view, 'Mimikyu');
  const missingClefairy = !knownFullyPrized(view,"Lillie's Clefairy ex") && opponentHasDragon(view) &&
    !boardHas(view, "Lillie's Clefairy ex") &&
    !handHas(view, "Lillie's Clefairy ex");
  const missingStadiumAnswer = hasStadiumRemovalTarget(view) &&
    !handHas(view, 'Field Blower') && !boardHas(view, 'Marshadow');
  const missingStamp = receipt?.priorOpponentTurnKO?.any === true &&
    !handHas(view, 'Unfair Stamp') && !discardHas(view, 'Unfair Stamp');
  const lowHand = view.ownPublic.handCount <= 1 && view.ownPublic.deckCount > 0;
  const paidGateTutor = !itemLocked(view) && view.ownHand.some(p=>hasAnyName(p,['Mysterious Treasure','Quick Ball'])&&hasDiscardableHand(view,1,p,receipt));
  if ((gateAccessNeed(view)&&!paidGateTutor) || (heavyBallNeed(view)>=1000 && !handHas(view,'Hisuian Heavy Ball') && !knownFullyPrized(view,'Hisuian Heavy Ball'))) return true;
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
  if (hasName(name,'Pokémon Ranger') && profile?.profileId==='hood-shield-shadow-rider-v1' && !supporterUsed && usefulRanger(view,receipt)) return 1100;
  if (hasName(name,'Temple of Sinnoh') && profile?.profileId==='lockbridge-shadow-rider-v1') return usefulTemple(view);
  if (hasName(name,'Float Stone')) {
    const target=actionTargetSlot(view,item.publicMetadata);
    if (!target || target.tools?.length!==0 || toolsEffectiveForRetreat(view,target,'actor')!==true ||
        !view.ownPublic.bench.some(Boolean) || hasStealthyHoodSearchNeed(view)) return -Infinity;
    if (target.printed?.subtypes?.includes('Basic') && skylinerStatus(view)===true) return -Infinity;
    if (target===view.ownPublic.active && (ownRetreatCost(view)??0)>0 &&
        ((handHas(view,'Radiant Eternatus') || gateAccessNeed(view)) && hasName(target.printing,'Wobbuffet') ||
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
  if (hasName(name,'Hisuian Heavy Ball') && heavyBallNeed(view)>0) return heavyBallNeed(view);
  if (hasName(name, 'Unfair Stamp') && receipt?.priorOpponentTurnKO?.any === true && Number.isFinite(handResetNeed(view,name))) return 980;
  if (hasName(name, 'Forest Seal Stone')) {
    const target = actionTargetSlot(view, item.publicMetadata);
    if (target && isShadowRiderVTarget(target) &&
        Array.isArray(target.tools) && target.tools.length === 0 &&
        toolsEffectiveForRetreat(view,target,'actor') === true &&
        view.ownTurnResources.vstarUsed !== true &&
        view.ownPublic.publicTurnRestrictions?.vstarUsed !== true &&
        !hasStarAlchemyLock(view, target) &&
        hasStarAlchemyBottleneck(view, receipt,profile)) return gateAccessNeed(view) ? 930 : 550;
  }
  if (hasName(name, 'Field Blower')) {
    if (hasStadiumRemovalTarget(view)) return 950;
    if (hasOpponentToolRemovalTarget(view)) return 720;
  }
  if (hasName(name, 'Teammates') && !supporterUsed &&
      receipt?.priorOpponentTurnKO?.any === true) return 900;
  if (hasName(name, 'Raihan') && !supporterUsed &&
      Number.isFinite(raihanNeed(view,receipt))) return raihanNeed(view,receipt)>=160?2400:raihanNeed(view,receipt)>=100?960:880;
  if (hasName(name,'Acerola')&&!supporterUsed){
    const need=acerolaNeed(view);
    return Number.isFinite(need)?Math.min(1600,700+need/4):-Infinity;
  }
  // Source-real singleton retrieval, not speculative deck-thinning:
  // Compressor -> (Ranger / Raihan / Teammates) in discard -> held VS
  // Seeker -> currently productive Supporter. Ranger is Hood-only.
  if(hasName(name,'Battle Compressor') && !supporterUsed &&
      view.ownPublic.deckCount>0) {
    const candidates=COMPRESSOR_SEEKER_SUPPORTERS.filter(name=>
      name!=='Pokémon Ranger'||profile?.profileId==='hood-shield-shadow-rider-v1');
    const needed=Math.max(-Infinity,...candidates.map(printing=>
      compressorSeekerSupporterNeed(view,printing,receipt)));
    if(Number.isFinite(needed))return 1000+needed;
  }
  const missingBasicV = !knownFullyPrized(view,'Shadow Rider Calyrex V') && !hasBasicShadowRiderV(view) &&
    !handHasBasicShadowRiderV(view) && hasOpenBench(view);
  if (hasName(name, 'Fog Crystal') &&
      (missingBasicV || needControlGirafarig(view) ||
       (opponentHasDragon(view) && !knownFullyPrized(view,"Lillie's Clefairy ex") &&
        !boardHas(view, "Lillie's Clefairy ex") &&
        !handHas(view, "Lillie's Clefairy ex")) ||
       energyTutorNeed(view,receipt)>0)) return 820;
  const needNightWatch = view.opponentPublic.handCount >= 4 &&
    !boardHas(view, 'Trevenant & Dusknoir-GX') &&
    !handHas(view, 'Trevenant & Dusknoir-GX') && canFuelNightWatch(view);
  if (hasName(name, 'Mysterious Treasure') && hasDiscardableHand(view, 1, name,receipt) &&
      (gateAccessNeed(view) || missingBasicV || needNightWatch || needControlGirafarig(view) ||
       (hasUnevolvedShadowRiderV(view)&&!handHas(view,'Shadow Rider Calyrex VMAX')&&!knownFullyPrized(view,'Shadow Rider Calyrex VMAX')))) return 800;
  if (hasName(name, 'Quick Ball') && hasDiscardableHand(view, 1, name,receipt) &&
      (missingBasicV || needNightWatch || gateAccessNeed(view) || needControlGirafarig(view))) return 790;
  if (hasName(name, 'Ultra Ball') && hasDiscardableHand(view, 2, name,receipt) &&
      hasUnevolvedShadowRiderV(view) &&
      !handHas(view, 'Shadow Rider Calyrex VMAX')) return 780;
  if (hasName(name, 'Arven') && !supporterUsed &&
      (missingBasicV || hasStealthyHoodSearchNeed(view) || forestSealAccessNeed(view)))
    return forestSealAccessNeed(view) ? 925 : 760;
  if (hasName(name, 'Guzma') && !supporterUsed) return usefulGuzma(view,receipt);
  if (hasAnyName(name,['Iono',"Lillie's Determination"]) && !supporterUsed) {
    const need=handResetNeed(view,name);
    if(Number.isFinite(need))return 650+need;
  }
  if(hasAnyName(name,['Sky Field','Dimension Valley']))return usefulCandidateStadium(view,name);
  if (isTool(name) && hasName(name, 'Stealthy Hood')) {
    const target=actionTargetSlot(view,item.publicMetadata);
    if(!target||(item.targetPrinting&&item.targetPrinting!==target.printing))return -Infinity;
    return stealthyHoodTargetScore(view,target,receipt);
  }
  return -Infinity;
}

// Public typed-energy feasibility. This is not an opponent-hand prediction.
// Return null for unresolved Special Energy effects rather than fabricate
// either a colored supply or a lock.
const ENERGY_TYPES=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy'];
function publicEnergySupply(slot,view,temple=false,side='opponent'){
  const units=[];
  const add=(n,types)=>{for(let i=0;i<n;i++)units.push(types)};
  const tags=slot.printed?.subtypes??slot.subtypes??[];
  for(const name of slot.energies??[]){
    const basic=/^(?:Basic )?(Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy(?: |$)/.exec(name);
    if(basic){add(1,[basic[1]]);continue;}
    if(temple){add(1,[]);continue;}
    if(hasName(name,'Double Dragon Energy')){if(!isDragon(slot))return null;add(2,ENERGY_TYPES);continue;}
    if(hasAnyName(name,['Double Colorless Energy','Double Turbo Energy'])){add(2,[]);continue;}
    if(hasName(name,'Twin Energy')){add(modernVOrEx(slot)?1:2,[]);continue;}
    if(hasAnyName(name,['Rainbow Energy','Aurora Energy','Legacy Energy'])){add(1,ENERGY_TYPES);continue;}
    if(hasName(name,'Prism Energy')){add(1,isBasicPokemon(slot)?ENERGY_TYPES:[]);continue;}
    if(hasName(name,'Luminous Energy')){add(1,slot.energies.filter(p=>!isBasicEnergyPrinting(p)).length===1?ENERGY_TYPES:[]);continue;}
    if(hasName(name,'Rapid Strike Energy')){if(!tags.includes('Rapid Strike'))return null;add(2,['Water','Fighting']);continue;}
    if(hasName(name,'Single Strike Energy')){if(!tags.includes('Single Strike'))return null;add(1,['Fighting','Darkness']);continue;}
    if(hasName(name,'Triple Acceleration Energy')){if(isBasicPokemon(slot))return null;add(3,[]);continue;}
    if(hasName(name,'Reversal Energy')){
      const holder=side==='opponent'?view.opponentPublic:view.ownPublic;
      const other=side==='opponent'?view.ownPublic:view.opponentPublic;
      add(!isBasicPokemon(slot)&&!isRuleBoxPokemon(slot)&&holder.prizeCount>other.prizeCount?3:1,
        !isBasicPokemon(slot)&&!isRuleBoxPokemon(slot)&&holder.prizeCount>other.prizeCount?ENERGY_TYPES:[]);
      continue;
    }
    if(hasName(name,'Counter Energy')){
      const holder=side==='opponent'?view.opponentPublic:view.ownPublic;
      const other=side==='opponent'?view.ownPublic:view.opponentPublic;
      // Printed CIN Counter Energy excludes GX and EX, not every Rule Box.
      const gxOrEX=tags.some(tag=>tag==='GX'||tag==='EX') ||
        hasAnyName(slot.printing,['-GX','-EX']);
      const empowered=!gxOrEX && holder.prizeCount>other.prizeCount;
      add(empowered?2:1,empowered?ENERGY_TYPES:[]);
      continue;
    }
    if(hasName(name,'Unit Energy')){
      const types=hasAnyName(name,['LPM','LightningPsychicMetal'])?
        ['Lightning','Psychic','Metal']:
        hasAnyName(name,['GFW','GrassFireWater'])?
          ['Grass','Fire','Water']:
        hasAnyName(name,['FDF','FightingDarknessFairy'])?
          ['Fighting','Darkness','Fairy']:null;
      if(!types)return null;
      add(1,types);continue;
    }
    if(hasAnyName(name,['Double Rainbow Energy','Blend Energy','Boost Energy']))return null;
    if(hasAnyName(name,['Jet Energy','Gift Energy','Mist Energy','Capture Energy','Powerful Colorless Energy','Recycle Energy',
      'Lucky Energy','Treasure Energy','V Guard Energy','Draw Energy','Speed Lightning Energy','Wash Water Energy',
      'Horror Psychic Energy','Coating Metal Energy','Stone Fighting Energy','Heat Fire Energy','Hiding Darkness Energy',
      'Aromatic Grass Energy'])) {
      const color=/^(?:Speed|Wash|Horror|Coating|Stone|Heat|Hiding|Aromatic) (Lightning|Water|Psychic|Metal|Fighting|Fire|Darkness|Grass) Energy/.exec(name);
      add(1,color?[color[1]]:[]);continue;
    }
    return null;
  }
  return units;
}
function publicEnergyCanPay(slot,attack,view,temple=false,side='opponent'){
  const supply=publicEnergySupply(slot,view,temple,side);
  if(!supply||!Array.isArray(attack?.cost))return null;
  let cost=attack.cost.slice();
  const stadiums=[...view.ownPublic.stadium,...view.opponentPublic.stadium];
  if(!temple&&stadiums.some(p=>hasName(p,'Dimension Valley'))&&
    stadiumAndToolEffectsLive(view)===true&&slot.printed?.types?.includes('Psychic')){
    const i=cost.indexOf('Colorless');if(i>=0)cost.splice(i,1);
  }
  if(stadiums.some(p=>hasName(p,'Wondrous Labyrinth')) &&
      stadiumAndToolEffectsLive(view)!==false &&
      !slot.printed?.types?.includes('Fairy'))cost.push('Colorless');
  if(slot.publicRestrictions?.attackCostIncreaseWhileActive>0&&
    (slot===view.ownPublic.active||slot===view.opponentPublic.active)){
    cost.push(...Array(slot.publicRestrictions.attackCostIncreaseWhileActive).fill('Colorless'));
  }
  if(supply.length<cost.length)return false;
  const colored=cost.filter(c=>c!=='Colorless').sort((a,b)=>
    supply.filter(u=>u.includes(a)).length-supply.filter(u=>u.includes(b)).length);
  function assign(i,used){
    if(i===colored.length)return true;
    for(let j=0;j<supply.length;j++)if(!(used&(1<<j))&&supply[j].includes(colored[i])&&assign(i+1,used|(1<<j)))return true;
    return false;
  }
  if(supply.length>24)return null;
  return assign(0,0);
}
function templeLive(view){
  return stadiumAndToolEffectsLive(view)===true&&[...view.ownPublic.stadium,...view.opponentPublic.stadium].some(p=>hasName(p,'Temple of Sinnoh'));
}
function templePressure(view) {
  let pressure=0;
  for(const slot of opponentBoard(view)){
    const special=(slot.energies??[]).filter(p=>!isBasicEnergyPrinting(p));
    if(!special.length)continue;
    const before=publicEnergySupply(slot,view,false),after=publicEnergySupply(slot,view,true);
    const attacks=(slot.attacks??[]).slice();
    if(hasName(slot.printing,'Regidrago VSTAR')&&!attacks.some(a=>a.name==='Apex Dragon'))
      attacks.push({name:'Apex Dragon',cost:['Grass','Grass','Fire']});
    const losses=attacks.filter(a=>publicEnergyCanPay(slot,a,view,false)===true&&publicEnergyCanPay(slot,a,view,true)===false);
    if(losses.length){
      const major=losses.some(a=>a.name==='Apex Dragon'||/^[1-9][0-9]{2}/.test(String(a.damage??'')));
      pressure+=major?1200:750;
    }else if(before&&after){
      // One more attachment might restore the attack; score disruption as
      // provisional, not permanent attack denial.
      const lostUnits=Math.max(0,before.length-after.length);
      const coloredLoss=before.filter(u=>u.length>0).length-after.filter(u=>u.length>0).length;
      const stillPaid=attacks.some(a=>publicEnergyCanPay(slot,a,view,true)===true);
      pressure+=stillPaid?Math.min(200,lostUnits*70+coloredLoss*30):
        Math.min(600,lostUnits*250+coloredLoss*175);
    }
  }
  return Math.min(1600,pressure);
}
function projectedStadium(view, printing) {
  if (!view || !isText(printing) || !hasAnyName(printing, ['Sky Field','Dimension Valley','Temple of Sinnoh']) || !view.ownPublic || !view.opponentPublic || !Array.isArray(view.ownPublic.stadium) || !Array.isArray(view.opponentPublic.stadium)) return null;
  const current=[...view.ownPublic.stadium,...view.opponentPublic.stadium];
  if(current.length>1||current.some(card=>hasName(card,printing)))return null;
  const next=viewAfterRemovingAbilityStadiums(view);
  return {...next,ownPublic:{...next.ownPublic,stadium:[printing],stadiumDirection:null}};
}
function opponentAttackUnlockRisk(view,projected){
  for(const slot of opponentBoard(view))for(const attack of slot.attacks??[]){
    const before=publicEnergyCanPay(slot,attack,view,templeLive(view),'opponent'),after=publicEnergyCanPay(slot,attack,projected,templeLive(projected),'opponent');
    if(before===null||after===null)return null;if(before===false&&after===true)return 1500;
  }return 0;
}
function usefulCandidateStadium(view,printing){
  if(!isText(printing)||view.ownTurnResources?.stadiumPlayedTurn===true||view.ownTurnResources?.stadiumPlayLocked===true||view.ownPublic.publicTurnRestrictions?.stadiumPlayLocked===true||stadiumAndToolEffectsLive(view)!==true)return -Infinity;
  const projected=projectedStadium(view,printing);if(!projected)return -Infinity;
  if(!hasName(printing,'Sky Field')&&(countBench(view.ownPublic)>5||countBench(view.opponentPublic)>5))return -Infinity;
  const beforeFinal=publicFinalAttack(view),afterFinal=publicFinalAttack(projected);if(beforeFinal&&!afterFinal)return -Infinity;
  const beforeActive=bestAttackForSlot(view.ownPublic.active,view,view.opponentPublic.active),afterActive=bestAttackForSlot(projected.ownPublic.active,projected,projected.opponentPublic.active);
  if((beforeActive?.score??0)>=10000&&(afterActive?.score??0)<10000)return -Infinity;
  if(hasName(printing,'Sky Field')){
    const beforeGate=(handHas(view,'Radiant Eternatus')&&canPlayRadiantForGate(view))||gateWantedIgnoringPrize(view),afterGate=(handHas(projected,'Radiant Eternatus')&&canPlayRadiantForGate(projected))||gateWantedIgnoringPrize(projected);
    if(beforeGate||!afterGate)return -Infinity;
    if(countBench(view.opponentPublic)>=3||opponentBoard(view).some(slot=>isShadowRiderVmax(slot)||(slot.attacks??[]).some(attack=>attack.name==='Max Geist')))return -Infinity;
    if(templeLive(view)){const risk=opponentAttackUnlockRisk(view,projected);if(risk===null||risk>0)return -Infinity;}
    return 1450;
  }
  if(hasName(printing,'Dimension Valley')){
    const risk=opponentAttackUnlockRisk(view,projected);if(risk===null||risk>0)return -Infinity;
    const before=beforeActive?.score??0,after=afterActive?.score??0;if(after<=before)return -Infinity;
    return 450+Math.min(1200,after-before);
  }
  return -Infinity;
}

function usefulTemple(view) {
  if (view.ownTurnResources?.stadiumPlayedTurn === true ||
      view.ownTurnResources?.stadiumPlayLocked === true ||
      stadiumAndToolEffectsLive(view)!==true ||
      [...view.ownPublic.stadium,...view.opponentPublic.stadium].some(p=>hasName(p,'Temple of Sinnoh'))) return -Infinity;
  // Never force a discard of own occupied Sky Field bench in this slice.
  if (countBench(view.ownPublic)>5||countBench(view.opponentPublic)>5) return -Infinity;
  let pressure=templePressure(view);
  if (opponentBoard(view).some(slot=>hasName(slot.printing,'Marshadow') &&
      effectiveAbilityStatus(slot,'Resetting Hole','opponent',view)===true)) pressure-=250;
  if ([...view.ownPublic.stadium,...view.opponentPublic.stadium].some(p=>hasName(p,'Dimension Valley')) &&
      ownBoard(view).some(slot=>slot.printed?.types?.includes('Psychic') &&
        (slot.attacks??[]).some(a=>a.cost?.includes('Colorless') &&
          canPayAttack(slot,a,view) && slotEnergyCount(slot)<a.cost.length))) pressure-=500;
  const target=view.opponentPublic.active,attacker=view.ownPublic.active;
  if(target&&attacker){
    const before=bestAttackForSlot(attacker,view,target);
    const next=projectedStadium(view,'Temple of Sinnoh ASR');
const after=bestAttackForSlot(next.ownPublic.active,next,next.opponentPublic.active);
    if((before?.score??0)>=10000&&(after?.score??0)<10000)return -Infinity;
  }
  return pressure>=300 ? 660+pressure/4 : -Infinity;
}
function wobLockValue(view, slot) {
  if(!slot||!hasName(slot.printing,'Wobbuffet')||!slot.abilities?.includes('Bide Barricade'))return 0;
  if(hasActiveStadiumLock(view,'Silent Lab'))return 0;
  const active=slot===view.ownPublic.active;
  if(active&&effectiveAbilityStatus(slot,'Bide Barricade','actor',view)!==true)return 0;
  if(!active){
    const index=view.ownPublic.bench.indexOf(slot);
    if(index<0)return 0;
    const incoming={...slot,abilitySuppressions:[]};
    const moved={...view,ownPublic:{...view.ownPublic,active:incoming,
      bench:view.ownPublic.bench.map((p,i)=>i===index?view.ownPublic.active:p)}};
    const sources=resolveAbilityLockSources(view);
    if(sources.unknown||sources.active.some(source=>
      source.slot!==view.ownPublic.active&&abilityLockSourceSuppressesTarget(source,'actor',incoming,moved)!==false))return 0;
  }
  const entryOnly=['Dedechange','Dark Asset','Set Up','Wonder Tag','Squawk and Seize'];
  let value=0;
  for(const target of opponentBoard(view)){
    if(target.printed?.types?.includes('Psychic')||hasEffectiveStealthyHood(target,view,'opponent')!==false)continue;
    for(const name of target.abilities??[]){
      if(entryOnly.includes(name))continue;
      if(name==='Legacy Star'&&view.opponentPublic.publicTurnRestrictions?.vstarUsed===true)continue;
      if(name==='Initialization')value+=900;
      else if(name==='Legacy Star'||name==='Teal Dance'||name==='Fusion Strike System')value+=450;
      else value+=150;
    }
  }
  return Math.min(1500,value);
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

// Narrow paid-retreat lookahead: Wobbuffet can suppress an opposing
// Stoutland Sentinel long enough to make a held Guzma legal. Project only
// Bide Barricade's public Ability suppression; the existing Guzma planner
// must then certify a final-Prize KO before the retreat gets terminal priority.
function projectWobbuffetBideBoard(movedView,target) {
  if(!hasName(target?.printing,'Wobbuffet') ||
      effectiveAbilityStatus(target,'Bide Barricade','actor',movedView)!==true)return null;
  let uncertain=false;
  const suppress=(slot,seat)=>{
    if(!slot||(slot.printed?.types??[]).includes('Psychic')||!(slot.abilities??[]).length)return slot;
    if(seat==='opponent'){
      // Hood protection is evaluated on the post-retreat board. This catches
      // an outgoing Tool Jammer ceasing to suppress Hood as Wobbuffet enters.
      const hood=hasEffectiveStealthyHood(slot,movedView,'opponent');
      if(hood===true)return slot;
      if(hood===null){uncertain=true;return slot;}
    }
    const prior=new Map((slot.abilitySuppressions??[]).map(row=>[row.abilityName,row]));
    return {...slot,abilitySuppressions:slot.abilities.map(abilityName=>({
      ...(prior.get(abilityName)??{abilityName}),abilityName,suppressed:true,
      reasonCode:'PROJECTED_BIDE_BARRICADE',sourcePrinting:target.printing
    }))};
  };
  const player=(p,seat)=>({...p,active:suppress(p.active,seat),
    bench:p.bench.map(slot=>suppress(slot,seat))});
  const projected={...movedView,ownPublic:player(movedView.ownPublic,'actor'),
    opponentPublic:player(movedView.opponentPublic,'opponent')};
  return uncertain?null:projected;
}
function stoutlandSentinelCandidate(view) {
  const sentinel=view.opponentPublic.active;
  return hasName(sentinel?.printing,'Stoutland') &&
    (sentinel.abilities??[]).includes('Sentinel') &&
    effectiveAbilityStatus(sentinel,'Sentinel','opponent',view)===true &&
    !(sentinel.printed?.types??[]).includes('Psychic') ? sentinel : null;
}
function clearProjectedSentinelSupporterLock(projected) {
  if(effectiveAbilityStatus(projected.opponentPublic.active,'Sentinel','opponent',projected)!==false)return null;
  return {...projected,
    ownTurnResources:{...projected.ownTurnResources,supporterPlayLocked:false},
    ownPublic:{...projected.ownPublic,publicTurnRestrictions:{
      ...projected.ownPublic.publicTurnRestrictions,supporterPlayLocked:false}}};
}
function projectWobbuffetSentinelUnlock(view,movedView,target) {
  if(view.ownTurnResources?.supporterPlayLocked!==true ||
      view.ownPublic.publicTurnRestrictions?.supporterPlayLocked!==true ||
      !stoutlandSentinelCandidate(view))return null;
  const projected=projectWobbuffetBideBoard(movedView,target);
  return projected?clearProjectedSentinelSupporterLock(projected):null;
}
function projectWobbuffetFieldBlowerSentinelUnlock(view,movedView,target,profile) {
  const sentinel=stoutlandSentinelCandidate(view);
  if(!sentinel||view.ownTurnResources?.supporterPlayLocked!==true ||
      view.ownPublic.publicTurnRestrictions?.supporterPlayLocked!==true ||
      !handHas(view,'Field Blower')||itemLocked(view)||
      !Array.isArray(sentinel.tools)||sentinel.tools.length!==1||
      !hasName(sentinel.tools[0],'Stealthy Hood')||
      hasEffectiveStealthyHood(sentinel,movedView,'opponent')!==true)return null;

  // This longer certificate is only for the exact continuous Vileplume lock
  // that Wobbuffet demonstrably turns off. A separate raw Item-lock flag is
  // deliberately not cleared by projection.
  const plume=view.opponentPublic.bench.find(slot=>hasName(slot?.printing,'Vileplume AOR')&&
    (slot.abilities??[]).includes('Irritating Pollen')&&
    effectiveAbilityStatus(slot,'Irritating Pollen','opponent',view)===true);
  if(!plume)return null;
  const afterWob=projectWobbuffetBideBoard(movedView,target);
  if(!afterWob||effectiveAbilityStatus(
      afterWob.opponentPublic.bench.find(slot=>slot?.printing===plume.printing),
      'Irritating Pollen','opponent',afterWob)!==false ||
      hasContinuousItemLock(afterWob))return null;
  const fieldBlower=view.ownHand.find(printing=>hasName(printing,'Field Blower'));
  if(!fieldBlower||!Number.isFinite(scoreTrainerPlay(
      {actorPrinting:fieldBlower,publicMetadata:{}},afterWob,null,profile)))return null;

  const hand=view.ownHand.slice();
  const blowerIndex=hand.indexOf(fieldBlower);
  if(blowerIndex<0)return null;
  hand.splice(blowerIndex,1);
  const unhooded={...afterWob.opponentPublic.active,tools:[]};
  const afterBlower={...afterWob,ownHand:hand,
    ownPublic:{...afterWob.ownPublic,handCount:hand.length,
      discard:[...afterWob.ownPublic.discard,fieldBlower]},
    opponentPublic:{...afterWob.opponentPublic,active:unhooded}};
  const afterBide=projectWobbuffetBideBoard(afterBlower,target);
  return afterBide?clearProjectedSentinelSupporterLock(afterBide):null;
}
function terminalWobbuffetRetreatScore(view,movedView,target,cost,profile) {
  if(!handHas(view,'Guzma')||view.ownTurnResources?.supporterPlayedTurn!==0)return -Infinity;
  const current=bestAttackForSlot(view.ownPublic.active,view,view.opponentPublic.active);
  if(current&&Number.isFinite(current.damage)&&
      current.damage>=Math.max(0,view.opponentPublic.active.hp-view.opponentPublic.active.damage)&&
      prizeLiability(view.opponentPublic.active)>=view.ownPublic.prizeCount)return -Infinity;
  const direct=projectWobbuffetSentinelUnlock(view,movedView,target);
  if(direct&&supporterAvailable(direct)){
    const plan=guzmaPlans(direct)[0];
    if(plan&&plan.prizes>=direct.ownPublic.prizeCount)return 3200-cost*100;
  }
  const viaBlower=projectWobbuffetFieldBlowerSentinelUnlock(view,movedView,target,profile);
  if(!viaBlower||!supporterAvailable(viaBlower))return -Infinity;
  const plan=guzmaPlans(viaBlower)[0];
  if(!plan||plan.prizes<viaBlower.ownPublic.prizeCount)return -Infinity;
  return 3000-cost*100;
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
    score=Math.max(score,terminalWobbuffetRetreatScore(view,movedView,target,cost,profile));
    if (profile?.profileId==='lockbridge-shadow-rider-v1') {
      const gate=hasName(old.printing,'Wobbuffet') && handHas(view,'Radiant Eternatus') &&
        !hasName(target.printing,'Wobbuffet') && canPlayRadiantForGate(invalidateDepartedWobbuffet(movedView,old));
      if (gate && (current?.score??0)<10000) score=Math.max(score,1800-cost*350-wobLockValue(view,old)/2);
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
    effectiveAbilityStatus(source, 'Underworld Door','actor',view) === true &&
    underworldDoorSourceIsUnspent(receipt, metadata, source) &&
    handHas(view, 'Psychic Energy') &&
    view.ownPublic.bench.some(slot =>
      slot && slot.printed?.types?.includes('Psychic'));
}

function canUseStarAlchemy(view, item, receipt, profile) {
  const metadata = item.publicMetadata ?? {};
  const source = abilitySourceSlot(view, item);
  return metadata.abilityName === 'Star Alchemy' &&
    source !== null &&
    (!item.actorPrinting || item.actorPrinting === source.printing) &&
    (source.tools ?? []).some(tool => hasName(tool, 'Forest Seal Stone')) &&
    view.ownTurnResources.vstarUsed !== true &&
    view.ownPublic.publicTurnRestrictions?.vstarUsed !== true &&
    !hasStarAlchemyLock(view, source) &&
    hasStarAlchemyBottleneck(view, receipt,profile);
}

// A deliberately narrow deterministic tactical layer. It doesn't predict
// hidden draws, use an opponent list, dispatch native actions, or replace
// the actor's legal frontier. Only a proven direct public final-Prize
// opportunity overrides general resource heuristics.
const FINAL_ATTACKS=new Set(['Max Geist','Night Watch','Full Moon Rondo','Psychic Assault','Power Beam','Shadow Mist','Energy Drive','Mind Shock','Eon Blade']);
// Narrow direct-attack terminal admission. These named abilities have no
// defensive damage, KO prevention, or Prize modification effect for a
// direct hit on their controller's Active. Do not infer this for arbitrary
// unknown Abilities or projected root plans.
function directTerminalHarmlessAbility(slot,name){
  return (name==='Legacy Star'&&hasName(slot.printing,'Regidrago VSTAR')) ||
    (name==='Fairy Zone'&&hasName(slot.printing,"Lillie's Clefairy ex")) ||
    (name==='Farewell Letter'&&hasName(slot.printing,'Unown AOR')) ||
    (name==='Skyliner'&&hasName(slot.printing,'Latias ex')) ||
    (name==='Wonder Tag'&&hasName(slot.printing,'Tapu Lele-GX')) ||
    (name==='Underworld Door'&&isShadowRiderVmax(slot)) ||
    (name==='Climactic Gate'&&hasName(slot.printing,'Radiant Eternatus')) ||
    // On-own-turn search/draw and entry-trigger utilities do not react to a
    // direct hit or modify that hit's damage, Prize payout, or KO timing.
    (name==='Dedechange'&&hasName(slot.printing,'Dedenne-GX')) ||
    (name==='Dark Asset'&&hasName(slot.printing,'Crobat V')) ||
    (name==='Squawk and Seize'&&hasName(slot.printing,'Squawkabilly ex')) ||
    (name==='Flip the Script'&&hasName(slot.printing,'Fezandipiti ex')) ||
    (name==='Happy Match'&&hasName(slot.printing,'Eldegoss V')) ||
    (name==='Quick Search'&&hasName(slot.printing,'Pidgeot ex')) ||
    (name==='Air Mail'&&hasName(slot.printing,'Pidgeotto')) ||
    (name==='Fan Call'&&hasName(slot.printing,'Fan Rotom')) ||
    (name==='Fusion Strike System'&&hasName(slot.printing,'Genesect V')) ||
    (name==='Resetting Hole'&&hasName(slot.printing,'Marshadow')) ||
    (name==='Extra Energy Bomb'&&hasName(slot.printing,'Electrode-GX')) ||
    // These board restrictions affect what actions can be *played* or which
    // Abilities work, not direct incoming damage or a resolved Prize KO.
    // An attack barred by an active lock is still vetoed by its own
    // cannotAttackPublicly/frontier gate; do not use this for projected plans.
    (name==='Initialization'&&hasName(slot.printing,'Iron Thorns ex')) ||
    (name==='Bide Barricade'&&hasName(slot.printing,'Wobbuffet')) ||
    (name==='Irritating Pollen'&&hasName(slot.printing,'Vileplume AOR')) ||
    (name==='Disgusting Pollen'&&hasName(slot.printing,'Vileplume BUS')) ||
    (name==='Sentinel'&&hasName(slot.printing,'Stoutland BCR')) ||
    (name==='Mischievous Lock'&&hasName(slot.printing,'Klefki')) ||
    (name==='Neutralizing Gas'&&hasName(slot.printing,'Galarian Weezing')) ||
    (name==='Power of Alchemy'&&hasName(slot.printing,'Alolan Muk')) ||
    (name==='Midnight Fluttering'&&hasName(slot.printing,'Flutter Mane'));
}
function astralTerminalHarmlessAbility(slot,name){
  return (name==='Safeguard'&&hasName(slot.printing,'Mimikyu PAL')) ||
    (name==='Block'&&hasName(slot.printing,'Snorlax PGO'));
}
// A direct final attack must be permitted by independently live, public lock
// sources, not only by stale per-Pokemon suppression rows in a projected board.
// The candidate's present direct-damage final-Prize attack is not changed by
// these printed Special Energy effects on an opposing Pokémon. This list is
// intentionally closed: Spiky/Horror retaliation, Stone reduction and Legacy
// Prize modification are NOT harmless. In particular, Mist prevents effects
// of attacks, not damage. This helper must never certify effect-based attacks.
const TERMINAL_DIRECT_SAFE_ENERGY_NAMES=Object.freeze([
  'Double Colorless Energy','Capture Energy','Jet Energy',
  'Reversal Energy','Counter Energy','Memory Energy','Recycle Energy',
  'Prism Energy','Powerful Colorless Energy','Mist Energy'
]);
function directTerminalSafeSpecialEnergy(energy,slot) {
  if(!isText(energy))return false;
  const matches=name=>energy===name || energy.startsWith(name+' ');
  if(matches('Double Dragon Energy'))return isDragon(slot);
  if(matches('Unit Energy'))return true; // all three printed Unit families are type-only
  return TERMINAL_DIRECT_SAFE_ENERGY_NAMES.some(matches);
}
// Current, directly offered printed attacks are unaffected by Stadiums that
// only provide optional searches/draws or respond to Stadium replacement.
// This closed Tool set does not modify *incoming* direct attack damage,
// Pokemon HP, Prize liability, or KO prevention. The fixed candidate 60s
// have no attacking Tool damage bonuses that opponent Tool Jammer could erase.
// Do not infer safety for reactive/HP/damage-reduction Tools.
const DIRECT_TERMINAL_SAFE_TOOLS=Object.freeze([
  'Float Stone','Muscle Band','Forest Seal Stone','Tool Jammer',
  'Stealthy Hood','Telescopic Sight','U-Turn Board','Air Balloon','Big Parasol'
]);
function directTerminalSafeTool(tool) {
  return isText(tool) && DIRECT_TERMINAL_SAFE_TOOLS.some(name=>
    tool===name || tool.startsWith(name+' '));
}
function directTerminalSafeStadium(stadium,view){
  if(!isText(stadium))return false;
  if(hasAnyName(stadium,['Tropical Beach','Chaotic Swell','Artazon',
      'Wondrous Labyrinth']))return true; // Extra C checked by effectiveAttackCost.
  // These Stadiums only suppress Abilities. Their current suppression is
  // accounted for by effectiveAbilityStatus/fairyZoneHolderStatus, and cannot
  // prohibit a printed, already-paid direct damaging attack.
  if(hasAnyName(stadium,['Path to the Peak','Silent Lab']))return true;
  // The immutable Hood/Lockbridge lists use no Lightning Pokémon attackers.
  // Still fail closed for a future Lightning-type caller of this helper.
  if(hasName(stadium,'Thunder Mountain') &&
      !view.ownPublic.active?.printed?.types?.includes('Lightning'))return true;
  return false;
}
function terminalAbilityProvablyOff(slot, abilityName, view) {
  if (abilityStatus(slot, abilityName) === true) return false;
  if (abilityLockSourceStadiumSuppression({slot}, view) === true) return true;
  const locks = resolveAbilityLockSources(view);
  return !locks.unknown && locks.active.some(source =>
    abilityLockSourceSuppressesTarget(source, 'opponent', slot, view) === true);
}
function cleanPublicTerminalView(view,direct=false,extraHarmlessAbility=null){
  return view.globalTurn>1&&view.ownPublic.active&&view.opponentPublic.active&&
    opponentBoard(view).every(slot=>
  (slot.abilities??[]).every(a=>
    (direct&&directTerminalHarmlessAbility(slot,a)) ||
    (typeof extraHarmlessAbility==='function'&&extraHarmlessAbility(slot,a)) ||
    ((a==='Garbotoxin'&&hasName(slot.printing,'Garbodor')) ||
      terminalAbilityProvablyOff(slot,a,view))) &&
  (slot.tools??[]).every(t=>hasName(t,'Float Stone') ||
    (direct && directTerminalSafeTool(t))) &&
  (slot.energies??[]).every(p=>
    isBasicEnergyPrinting(p) ||
    (direct && directTerminalSafeSpecialEnergy(p,slot))))&&
    // Poison/Burn do not prevent announcing attacks, and status on the
    // *defending* Pokémon never bars incoming direct damage. A candidate
    // Confused attack is probabilistic (not a certain final); Asleep or
    // Paralyzed cannot attack. Unknown status also fails closed.
    (() => {
      const current=normalizeSpecialConditionNames(view.ownPublic.active.specialConditions);
      const defending=normalizeSpecialConditionNames(view.opponentPublic.active.specialConditions);
      return current!==null && defending!==null &&
        !current.some(name=>['confused','asleep','paralyzed'].includes(name));
    })()&&
    [...view.ownPublic.stadium,...view.opponentPublic.stadium].every(p=>
      hasAnyName(p,['Sky Field','Dimension Valley','Temple of Sinnoh']) ||
      (direct && directTerminalSafeStadium(p,view)));
}
function publicFinalAttack(view,allowedNames=null){
  if(!cleanPublicTerminalView(view,allowedNames!==null))return null;
  const attacker=view.ownPublic.active,target=view.opponentPublic.active;
  const remaining=Math.max(0,target.hp-target.damage);
  const liability=prizeLiability(target);
  const prizeWin=liability>=view.ownPublic.prizeCount;
  const boardEmptyWin=!view.opponentPublic.bench.some(Boolean);
  if((!prizeWin&&!boardEmptyWin)||remaining<=0)return null;
  const candidates=(attacker.attacks??[]).filter(a=>
    FINAL_ATTACKS.has(a.name)&&(!allowedNames||allowedNames.has(a.name))&&
    canPayAttack(attacker,a,view)&&Number.isFinite(attackScore(attacker,a,view,target,{requirePayable:true})))
    .map(attack=>({attack,damage:estimatedDamage(attacker,attack,view,target,allowedNames===null&&opponentBoard(view).some(slot=>(slot.abilities??[]).includes('Garbotoxin'))),
      winCondition:prizeWin?'prizes':'board-empty'}))
    .filter(row=>row.damage!==null&&row.damage>=remaining)
    .sort((a,b)=>a.damage-b.damage||a.attack.name.localeCompare(b.attack.name));
  return candidates[0]??null;
}
// Model one placement, not a search guarantee. Prompt scoring may use the
// printed active attacks, but root selection must use the supplied frontier.
function fairyZoneFinalProjection(view,printing,attackNames=null){
  const defender=view.opponentPublic.active,active=view.ownPublic.active;
  const empty=view.ownPublic.bench.findIndex(slot=>!slot);
  if(!defender||!isDragon(defender)||!active?.printed?.types?.includes('Psychic')||
     fairyZoneStatus(view)!==false||hasEffectiveStealthyHood(defender,view,'opponent')!==false||
     !hasOpenBench(view)||empty<0||view.ownTurnResources?.pokemonPlayLocked===true||
     view.ownPublic.publicTurnRestrictions?.pokemonPlayLocked===true)return false;
  const holder={printing,hp:190,damage:0,
    printed:{types:['Psychic'],subtypes:['Basic','ex'],weakness:[{type:'Metal',value:'×2'}],resistance:[],retreatCost:['Colorless']},
    abilities:['Fairy Zone'],abilitySuppressions:[],tools:[],energies:[],specialConditions:[]};
  const after={...view,ownPublic:{...view.ownPublic,
    bench:view.ownPublic.bench.map((slot,i)=>i===empty?holder:slot)}};
  const names=attackNames??new Set((active.attacks??[]).map(a=>a.name));
  return fairyZoneStatus(after)===true&&!!publicFinalAttack(after,names);
}
function fairyZoneRetrieval(view,items,receipt,profile,attackNames){
  const name="Lillie's Clefairy ex",printing=name+' JTG 56';
  if(itemLocked(view)||handHas(view,name)||!fairyZoneFinalProjection(view,printing,attackNames))return null;
  const held=items.filter(i=>i.kind==='play-card'&&view.ownHand.includes(i.actorPrinting));
  const find=name=>held.find(i=>hasName(i.actorPrinting,name));
  const recovery=find('Night Stretcher');
  if(recovery&&discardHas(view,name))return {item:recovery,reason:'ROOT_TRY_FINAL_BY_CLEFAIRY_RECOVERY',retrieval:true};
  if(knownFullyPrized(view,name)){
    const heavy=find('Hisuian Heavy Ball');
    return heavy?{item:heavy,reason:'ROOT_TRY_FINAL_BY_CLEFAIRY_PRIZE',retrieval:true}:null;
  }
  // Bound public exhaustion by the two immutable candidate inventories.
  // An unaccounted copy might still be Prized: a deck tutor is an attempt.
  const copies=profile?.profileId==='hood-shield-shadow-rider-v1'?2:
    profile?.profileId==='lockbridge-shadow-rider-v1'?1:0;
  const outside=[...ownBoard(view).map(s=>s.printing),...view.ownHand,
    ...view.ownPublic.discard,...view.ownPublic.lostZone].filter(p=>hasName(p,name)).length;
  if(view.ownPublic.deckCount<=0||outside>=copies)return null;
  const free=find('Fog Crystal');
  if(free)return {item:free,reason:'ROOT_TRY_FINAL_BY_CLEFAIRY_TUTOR',retrieval:true};
  for(const n of ['Mysterious Treasure','Quick Ball']){
    const paid=find(n);
    if(paid&&hasDiscardableHand(view,1,paid.actorPrinting,receipt))
      return {item:paid,reason:'ROOT_TRY_FINAL_BY_CLEFAIRY_TUTOR',retrieval:true};
  }
  return null;
}
// An effective opposing Hood is a concrete removable blocker, not a
// reason to abandon an otherwise terminal Fairy Zone line. Restrict this
// projection to the Active's single Hood and an unchanged tool-only mode.
function fieldBlowerHoodFinal(view,items,attackNames){
  const d=view.opponentPublic.active;
  if(itemLocked(view)||!d||!isDragon(d)||d.tools?.length!==1||
     !hasName(d.tools[0],'Stealthy Hood')||
     hasEffectiveStealthyHood(d,view,'opponent')!==true||
     hasStadiumRemovalTarget(view))return null;
  const item=items.find(i=>i.kind==='play-card'&&hasName(i.actorPrinting,'Field Blower')&&
    view.ownHand.includes(i.actorPrinting));
  if(!item)return null;
  const after={...view,opponentPublic:{...view.opponentPublic,active:{...d,tools:[]}}};
  const holder=view.ownHand.find(p=>hasName(p,"Lillie's Clefairy ex"));
  if((fairyZoneStatus(after)===true&&publicFinalAttack(after,attackNames))||
    (holder&&fairyZoneFinalProjection(after,holder,attackNames)))
    return {item,reason:'ROOT_FINAL_BY_FIELD_BLOWER_HOOD'};
  return null;
}
// A known legal retreat target can be funded before the pivot. Restrict
// speculative attacks to the two exact scaling attackers and account for
// Energy paid by the outgoing Active (which reduces Max Geist).
function projectedBenchFinalAttack(view,index){
  const old=view.ownPublic.active,slot=view.ownPublic.bench[index];
  if(!old||!slot||!retreatAvailableNow(view)||
     activeOnlyLockSource(view,'ownPublic')||
     view.ownPublic.publicTurnRestrictions?.attackMaxEnergyTurnsRemaining>0||
     slot.publicRestrictions?.attackCostIncreaseNextTurn>0)return null;
  const cost=ownRetreatCost(view);
  if(cost===null||slotEnergyCount(old)<cost||
      old.energies.some(p=>!hasName(p,'Psychic Energy')))return null;
  const moved={...view,ownPublic:{...view.ownPublic,active:slot,
    bench:view.ownPublic.bench.map((p,i)=>i===index?{...old,energies:old.energies.slice(cost)}:p)}};
  if(activeOnlyLockSource(moved,'ownPublic'))return null;
  const names=new Set(isShadowRiderVmax(slot)?['Max Geist']:
    hasName(slot.printing,"Lillie's Clefairy ex")?['Full Moon Rondo']:[]);
  return names.size?publicFinalAttack(moved,names):null;
}
function benchTerminalCharge(view,item,items){
  const m=item.publicMetadata??{},slot=view.ownPublic.bench[m.targetIndex];
  if(item.kind!=='play-card'||!hasName(item.actorPrinting,'Psychic Energy')||
     !view.ownHand.includes(item.actorPrinting)||m.targetSeat!=='actor'||m.targetZone!=='bench'||
     !Number.isSafeInteger(m.targetIndex)||!slot||
     (item.targetPrinting&&item.targetPrinting!==slot.printing)||
     !energyAvailableNow(view)||
     view.ownTurnResources?.energyPlayLocked===true||
     view.ownPublic.publicTurnRestrictions?.energyPlayLocked===true||
     !items.some(r=>r.kind==='retreat'&&r.publicMetadata?.benchIndex===m.targetIndex&&
       (!r.targetPrinting||r.targetPrinting===slot.printing)))return false;
  if(projectedBenchFinalAttack(view,m.targetIndex))return false;
  const after=viewAfterPsychicAttachment(view,'bench',m.targetIndex,item.actorPrinting);
  return !!(after&&projectedBenchFinalAttack(after,m.targetIndex));
}
// A paper-equivalent, two-target Astral Barrage terminal route.
function publicAstralFinalAttack(view,items,profile=null) {
  const item=items.find(i=>i.kind==='attack'&&i.attackName==='Astral Barrage');
  const attacker=view.ownPublic.active;
  const benchCount=view.opponentPublic.bench.filter(Boolean).length;
  if(!item||!isBasicShadowRiderV(attacker)||
      !cleanPublicTerminalView(view,true,astralTerminalHarmlessAbility)||
      (paperAstralBarrageTargetsEnabled(profile) ? opponentBoard(view).length<1 : benchCount<2))return null;
  const attack=attacker.attacks.find(a=>a.name==='Astral Barrage');
  if(!attack||!canPayAttack(attacker,attack,view)||
      !Number.isFinite(attackScore(attacker,attack,view,view.opponentPublic.active,{
        requirePayable:true,paperAstralBarrageTargets:profile?.paperAstralBarrageTargets
      })))return null;
  const hooked=paperAstralBarrageTargetsEnabled(profile);
  // Match the actual target surface. Unhooked pinned CRE74 can only choose
  // Bench targets; the paper hook expands that surface to all opposing Pokémon.
  const targetPool=hooked?opponentBoard(view):view.opponentPublic.bench.filter(Boolean);
  const rows=targetPool.map(p=>({p,score:astralTargetScore(attacker,p,view)}))
    .sort((a,b)=>b.score-a.score).slice(0,2);
  const koRows=rows.filter(row=>row.score>0&&row.p.hp-row.p.damage>0&&row.p.hp-row.p.damage<=50);
  const prizes=koRows.reduce((sum,row)=>sum+prizeLiability(row.p),0);
  const prizeWin=prizes>=view.ownPublic.prizeCount;
  const board=opponentBoard(view);
  const boardEmptyWin=hooked&&board.length<=2&&koRows.length===board.length&&
    board.every(slot=>koRows.some(row=>row.p===slot));
  if(!prizeWin&&!boardEmptyWin)return null;
  return {item,winCondition:prizeWin?'prizes':'board-empty'};
}
function finalPublicStep(view,items,receipt,profile){
  const astral=publicAstralFinalAttack(view,items,profile);
  if(astral)return {item:astral.item,reason:astral.winCondition==='board-empty'?
    'ROOT_PUBLIC_FINAL_ASTRAL_BOARD_EMPTY':'ROOT_PUBLIC_FINAL_ASTRAL_BARRAGE'};
  const current=publicFinalAttack(view,new Set(items.filter(i=>i.kind==='attack').map(i=>i.attackName)));
  if(current){
    const item=items.find(i=>i.kind==='attack'&&i.attackName===current.attack.name);
    return {item,reason:current.winCondition==='board-empty'?
      'ROOT_PUBLIC_FINAL_BOARD_EMPTY_ATTACK':'ROOT_PUBLIC_FINAL_PRIZE_ATTACK'};
  }
  if(!view.ownPublic.active||view.globalTurn<=1)return null;
  const attackNames=new Set(items.filter(i=>i.kind==='attack').map(i=>i.attackName));
  for(const item of items){
    const m=item.publicMetadata??{};
    if(item.kind==='play-card'&&hasName(item.actorPrinting,"Lillie's Clefairy ex")&&
       m.targetSeat==='actor'&&m.targetZone==='bench'&&view.ownHand.includes(item.actorPrinting)&&
       fairyZoneFinalProjection(view,item.actorPrinting,attackNames))
      return {item,reason:'ROOT_FINAL_BY_FAIRY_ZONE_BENCH'};
  }
  const options=[];
  const offer=(item,next,priority,reason)=>{
    if(next&&publicFinalAttack(next))options.push({item,priority,reason});
  };
  // Door is an extra attachment. Use an explicitly unspent source and an
  // eligible Psychic bench recipient; its continuation uses the same KO score.
  for(const item of items){
    if(benchTerminalCharge(view,item,items))
      options.push({item,priority:350,reason:'ROOT_FINAL_BY_BENCH_CHARGE_RETREAT'});
    if(item.kind==='use-ability'&&canUseUnderworldDoor(view,item,receipt)){
      for(const [index,slot] of view.ownPublic.bench.entries()){
        if(!slot?.printed?.types?.includes('Psychic'))continue;
        const energy=view.ownHand.find(p=>hasName(p,'Psychic Energy'));
        offer(item,viewAfterPsychicAttachment(view,'bench',index,energy),500,'ROOT_FINAL_BY_UNDERWORLD_DOOR');
      }
    }
    if(item.kind==='play-card'&&hasName(item.actorPrinting,'Psychic Energy')&&
      Number.isFinite(scoreEnergyPlay(item,view))){
      const m=item.publicMetadata;
      offer(item,viewAfterPsychicAttachment(view,m.targetZone,m.targetIndex,item.actorPrinting),
        400,'ROOT_FINAL_BY_MANUAL_ENERGY');
    }
if(item.kind==='play-card'&&hasName(item.actorPrinting,'Float Stone')&&
    actionTargetSlot(view,item.publicMetadata)===view.ownPublic.active&&
    view.ownPublic.active.tools?.length===0&&
    retreatAvailableNow(view)&&
    view.ownTurnResources?.toolPlayLocked!==true&&
    view.ownPublic.publicTurnRestrictions?.toolPlayLocked!==true&&
    (ownRetreatCost(view)??0)>0&&
    toolsEffectiveForRetreat(view,view.ownPublic.active,'actor')===true){
  const equipped={...view.ownPublic.active,tools:[item.actorPrinting]};
  const withTool={...view,ownPublic:{...view.ownPublic,active:equipped}};
  if(ownRetreatCost(withTool)===0)for(const [index,slot] of withTool.ownPublic.bench.entries()){
    if(slot)offer(item,switchedPublic(withTool,'ownPublic',index),225,'ROOT_FINAL_BY_FLOAT_STONE_RETREAT');
  }
}
    if(item.kind==='retreat'){
      const index=item.publicMetadata?.benchIndex,cost=ownRetreatCost(view),slot=view.ownPublic.bench[index];
      if(Number.isInteger(index)&&slot&&(!item.targetPrinting||item.targetPrinting===slot.printing)&&
          projectedBenchFinalAttack(view,index))
        options.push({item,priority:325-cost*25,reason:'ROOT_FINAL_BY_FUNDED_BENCH_RETREAT'});
      if(Number.isInteger(index)&&slot&&(!item.targetPrinting||item.targetPrinting===slot.printing)&&cost!==null&&slotEnergyCount(view.ownPublic.active)>=cost){
        const old={...view.ownPublic.active,energies:view.ownPublic.active.energies.slice(cost)};
        const moved={...view,ownPublic:{...view.ownPublic,active:slot,
          bench:view.ownPublic.bench.map((p,i)=>i===index?old:p)}};
        offer(item,moved,300-cost*25,'ROOT_FINAL_BY_RETREAT');
      }
    }
    if(item.kind==='play-card'&&hasAnyName(item.actorPrinting,['Dimension Valley','Sky Field'])&&
      Number.isFinite(usefulCandidateStadium(view,item.actorPrinting))){
      offer(item,projectedStadium(view,item.actorPrinting),250,'ROOT_FINAL_BY_STADIUM');
    }
    if(item.kind==='play-card'&&hasName(item.actorPrinting,'Guzma')&&supporterAvailable(view)&&
      Number.isFinite(usefulGuzma(view,receipt))){
      for(const plan of guzmaPlans(view,receipt).filter(p=>p.prizes>0)){
        if(plan.terminal===true){
          options.push({item,priority:200,reason:'ROOT_FINAL_BY_GUZMA'});
          continue;
        }
        const gusted=guzmaSwitch(view,'opponentPublic',plan.targetIndex);
        const moved=plan.ownIndex<0?gusted:guzmaSwitch(gusted,'ownPublic',plan.ownIndex);
        offer(item,moved,200,'ROOT_FINAL_BY_GUZMA');
      }
    }
  }
  return options.sort((a,b)=>b.priority-a.priority||a.item.token.localeCompare(b.item.token))[0]??
    fieldBlowerHoodFinal(view,items,attackNames)??fairyZoneRetrieval(view,items,receipt,profile,attackNames);
}
function chooseRoot(view, request, profile) {
  const items = request.actionFrontier.items.filter(item =>
    ['play-card', 'attack', 'retreat', 'use-ability', 'use-stadium', 'pass'].includes(item.kind));
  const pass = items.find(item => item.kind === 'pass');
  const active=view.ownPublic.active,target=view.opponentPublic.active;
  const finalStep=finalPublicStep(view,items,request.publicEventReceipt,profile);
  if(finalStep){
    setPolicyAuditRule(finalStep.reason,'PUBLIC_TERMINAL_PRIORITY');
    recordPolicyAuditRule(finalStep.item.token,finalStep.retrieval?
      'PUBLIC_FINAL_PRIZE_RETRIEVAL_ATTEMPT':'PUBLIC_DETERMINISTIC_FINAL_PRIZE_LINE');
    return {kind:'select-action',token:finalStep.item.token};
  }

  const plays = items.filter(item => item.kind === 'play-card');
  const terminalPlays = [];
  const scoredPlays = plays.map(item => {
    const basic = scoreBasicPlay(item, view, profile,request.publicEventReceipt);
    const evolution = scoreEvolutionPlay(item);
    const energy = scoreEnergyPlay(item, view, items);
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
  // Do not spend the last basic Psychic manually before a live Door can
  // attach it and draw two. Preserve the immediate active-KO exception.
  const bestPlay=scoredPlays[0];
  const reset=bestPlay&&hasAnyName(bestPlay.item.actorPrinting,["Lillie's Determination",'Iono','Unfair Stamp']);
  const manual=bestPlay&&hasName(bestPlay.item.actorPrinting,'Psychic Energy')&&bestPlay.score<2200;
  const doorFirst=(reset||manual)&&view.ownPublic.deckCount>2&&items.find(item=>item.kind==='use-ability'&&
      canUseUnderworldDoor(view,item,request.publicEventReceipt));
  if(doorFirst) {
    setPolicyAuditRule(reset?'ROOT_UNDERWORLD_DOOR_BEFORE_HAND_RESET':'ROOT_UNDERWORLD_DOOR_BEFORE_MANUAL','FIRST_FRONTIER_MATCH');
    recordPolicyAuditRule(doorFirst.token,reset?'DOOR_PRESERVES_ENERGY_AND_SUPPORTER_OPTION':'DOOR_PRESERVES_MANUAL_ATTACHMENT_AND_DRAWS');
    return {kind:'select-action',token:doorFirst.token};
  }
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
  const underworldDoor = view.ownPublic.deckCount>2?abilities.find(item => canUseUnderworldDoor(view, item, request.publicEventReceipt)):null;
  const starAlchemy = abilities.find(item =>
    canUseStarAlchemy(view, item, request.publicEventReceipt,profile));
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

  if (active && target) {
    const attacks = items.filter(item => item.kind === 'attack' && item.attackName);
    const scoredAttacks = attacks.map(item => {
      const attack = active.attacks.find(row => row.name === item.attackName);
      const score = attackScore(active, attack, view, target, {
        publicEventReceipt: request.publicEventReceipt,
        paperAstralBarrageTargets: profile?.paperAstralBarrageTargets
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

  // Tropical Beach may be used by either player regardless of the owner of
  // the Stadium. Never infer its identity from raw Twinleaf BWP numbering:
  // source-certified Aichi BWP 50 must be present in the visible Stadium zone
  // and on the actually offered native frontier. Beach ends the turn, so only
  // choose it after every supported play, retreat, Ability and attack.
  const stadiumItems=items.filter(item=>item.kind==='use-stadium');
  const observedStadiums=[...view.ownPublic.stadium,...view.opponentPublic.stadium];
  const beach=stadiumItems.find(item=>
    item.actorPrinting==='Tropical Beach BWP 50' &&
    item.publicMetadata?.stadiumEffectLive===true &&
    observedStadiums.includes(item.actorPrinting) &&
    Array.isArray(view.ownHand) && view.ownHand.length<=5 &&
    Number.isSafeInteger(view.ownPublic.deckCount) &&
    // Its draw-to-seven should leave at least two cards in deck.
    view.ownPublic.deckCount>=9-view.ownHand.length);
  for(const item of stadiumItems) {
    if(beach && item.token===beach.token)
      recordPolicyAuditRule(item.token,'SOURCE_CERTIFIED_BEACH_DRAW_FALLBACK');
    else recordPolicyAuditUnscored(item.token,'UNSUPPORTED_OR_UNSAFE_STADIUM_USE');
  }
  if(beach){
    setPolicyAuditRule('ROOT_BEACH_DRAW_INSTEAD_OF_PASS','FIRST_SOURCE_STAMPED_LEGAL_BEACH');
    return {kind:'select-action',token:beach.token};
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
    paleMoonExtraPsychicAvailable, paleMoonRetreatStatus, paleMoonScore,
    publicEnergySupply, publicEnergyCanPay,
    projectedStadium, usefulCandidateStadium, chooseEnergyPayment, weaknessMultiplier, stealthyHoodTargetScore
  })
});
