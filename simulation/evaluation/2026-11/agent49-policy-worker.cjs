'use strict';

const { once } = require('node:events');

const INIT_SCHEMA = 'aichi-policy-worker-init-v2';
const READY_SCHEMA = 'aichi-policy-worker-ready-v2';
const REQUEST_SCHEMA = 'aichi-policy-request-v2';
const RESPONSE_SCHEMA = 'aichi-policy-response-v3';
const OBSERVATION_SCHEMA = 'aichi-actor-observation-v2';
const PROMPT_SCHEMA = 'aichi-owner-prompt-projection-v3';
const EVENT_RECEIPT_VERSION = 'agent8-public-event-receipt-v3-turn-stamped';
const FRONTIER_SCHEMA = 'aichi-action-frontier-v1';
const EXECUTABLE_ACTION_KINDS = new Set([
  'play-card', 'attack', 'retreat', 'use-ability', 'use-stadium', 'pass'
]);
const ANALYSIS_ONLY_ACTION_KINDS = new Set(['projected-attack']);
const MULTI_SELECT_PROMPT_TYPES = new Set([
  'card-combination', 'pokemon', 'energy-payment', 'prize-slots', 'card-order'
]);

const LIMITS = Object.freeze({
  maxLineBytes: 1024 * 1024,
  maxTotalInputBytes: 64 * 1024 * 1024,
  maxMessages: 4096,
  maxDepth: 24,
  maxObjectKeys: 256,
  maxArrayItems: 2048,
  maxStringLength: 8192,
  maxTokenLength: 128,
  maxResponseBytes: 16 * 1024
});

class ProtocolError extends Error {
  constructor(code) {
    super(code);
    this.name = 'ProtocolError';
    this.code = code;
  }
}

function fail(code) {
  throw new ProtocolError(code);
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function exactKeys(value, required, optional = []) {
  if (!isRecord(value)) fail('EXPECTED_OBJECT');
  const allowed = new Set([...required, ...optional]);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) fail('UNKNOWN_FIELD');
  }
  for (const key of required) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) fail('MISSING_FIELD');
  }
}

function boundedString(value, pattern, max = LIMITS.maxStringLength) {
  return typeof value === 'string' && value.length > 0 &&
    value.length <= max && (!pattern || pattern.test(value));
}

function assertBoundedJson(value, depth = 0) {
  if (depth > LIMITS.maxDepth) fail('JSON_TOO_DEEP');
  if (value === null || typeof value === 'boolean') return;
  if (typeof value === 'string') {
    if (value.length > LIMITS.maxStringLength) fail('STRING_TOO_LONG');
    return;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) fail('NONFINITE_NUMBER');
    return;
  }
  if (Array.isArray(value)) {
    if (value.length > LIMITS.maxArrayItems) fail('ARRAY_TOO_LARGE');
    for (const item of value) assertBoundedJson(item, depth + 1);
    return;
  }
  if (!isRecord(value)) fail('NON_JSON_VALUE');
  const keys = Object.keys(value);
  if (keys.length > LIMITS.maxObjectKeys) fail('OBJECT_TOO_LARGE');
  for (const key of keys) {
    if (key.length > 128) fail('KEY_TOO_LONG');
    assertBoundedJson(value[key], depth + 1);
  }
}

function assertNoForbiddenFields(value) {
  if (Array.isArray(value)) {
    for (const item of value) assertNoForbiddenFields(item);
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, child] of Object.entries(value)) {
    if (/seed|rng|entropy|random/i.test(key)) fail('FORBIDDEN_RANDOM_FIELD');
    if (/^(state|store|nativeState|nativeStore|fullState|fullStateBefore|promptResolverContext|nativePrompt|validator|validate|deckOrder|opponentDeck|opponentHand|opponentPrizes|hiddenZone|hiddenZones)$/i.test(key)) {
      fail('FORBIDDEN_NATIVE_OR_HIDDEN_FIELD');
    }
    assertNoForbiddenFields(child);
  }
}

const ACTOR_KEYS = [
  'actorSeat', 'globalTurn', 'phase', 'decisionKind', 'pendingPromptType',
  'pendingOwnerDeckSearch', 'ownHand', 'ownPublic', 'opponentPublic',
  'ownTurnResources', 'ownerK1'
];
const PLAYER_KEYS = [
  'active', 'bench', 'stadium', 'discard', 'lostZone', 'resolvingSupporter',
  'publicHand', 'prizeSlots', 'publicTurnRestrictions', 'handCount', 'deckCount', 'prizeCount'
];
const POKEMON_KEYS = [
  'printing', 'name', 'hp', 'damage', 'lastPlayedOrEvolvedTurn', 'printed',
  'specialConditions', 'publicRestrictions', 'evolutionPrintings', 'energies',
  'tools', 'attacks', 'abilities', 'abilityDetails'
];
const POKEMON_OPTIONAL_KEYS = ['abilitySuppressions'];
const PRINTED_KEYS = ['stage', 'subtypes', 'types', 'retreatCost', 'weakness', 'resistance'];
const PUBLIC_RESTRICTION_KEYS = [
  'cannotAttackNextTurn', 'cannotUseAttacksNextTurn', 'blockedAttackNameNextTurn',
  'blockedAttackNameUntilLeavesActive', 'onlyAllowedAttackNameNextTurn',
  'attackCostIncreaseNextTurn', 'attackCostIncreaseWhileActive', 'cannotRetreat',
  'cannotRetreatNextTurn', 'cannotRetreatWhileActive', 'cannotEvolveNextTurn'
];
const PLAYER_RESTRICTION_KEYS = [
  'gxUsed', 'vstarUsed', 'attackLockTurnsRemaining', 'attackMaxEnergy',
  'attackMaxEnergyTurnsRemaining', 'ignoreAttackCostCardTypes',
  'ignoreAttackCostTurnsRemaining', 'cannotUseGXAttacks', 'pokemonPlayLocked',
  'abilityPokemonPlayLocked', 'evolutionPlayLocked', 'itemPlayLocked',
  'supporterPlayLocked', 'stadiumPlayLocked', 'toolPlayLocked',
  'energyPlayLocked', 'specialEnergyPlayLocked'
];
const PLAYER_RESTRICTION_OPTIONAL_KEYS = ['stadiumAndToolHaveNoEffectTurnsRemaining'];
const TURN_RESOURCE_KEYS = [
  'supporterPlayedTurn', 'retreatedTurn', 'extraTurnActive', 'energyPlayedTurn',
  'stadiumPlayedTurn', 'stadiumUsedTurn', 'vstarUsed', 'pokemonPlayLocked',
  'abilityPokemonPlayLocked', 'evolutionPlayLocked', 'itemPlayLocked',
  'supporterPlayLocked', 'stadiumPlayLocked', 'toolPlayLocked',
  'energyPlayLocked', 'specialEnergyPlayLocked'
];
const ACTION_META_KEYS = [
  'damage', 'damageAfterWeakness', 'damageAfterResistance', 'targetHp', 'targetDamage',
  'targetPrizeCount', 'prizeCount', 'ownPrizeCount', 'opponentPrizeCount',
  'energyCount', 'psychicEnergyCount', 'energyAfterRetreat', 'retreatEnergyCost',
  'freeRetreat', 'attackCostPayable', 'stadiumPrinting', 'stadiumEffectLive',
  'stadiumEffectSuppressed', 'stadiumSuppressionTurnsRemaining', 'weaknessType',
  'weaknessValue', 'weaknessMultiplier', 'resistanceType', 'resistanceValue',
  'damagePrevented', 'damageReduced', 'hasUnmodeledModifier', 'stadiumAndToolHaveNoEffectTurnsRemaining', 'deckCount',
  'ownDeckCount', 'opponentDeckCount', 'sourceZone', 'targetZone', 'handIndex',
  'benchIndex', 'slotIndex', 'ownerSeat', 'targetSeat', 'sourceSeat',
  'targetIndex', 'sourceIndex', 'paymentCount', 'paymentEnergyCount', 'cardType',
  'energyType', 'choiceIndex', 'prizeLiability', 'turnsRemaining', 'abilityLive',
  'abilitySuppressed', 'publicReceiptVersion', 'priorAttackName', 'priorSourcePrinting',
  'priorAttackTurn', 'gxAttack', 'copycatAttack', 'movedFromBenchToActiveThisTurn',
  'attackCost', 'abilityName', 'stadiumName', 'retreatPayment', 'targetHasWeakness',
  'targetHasResistance', 'hasPrevention', 'toolPresent', 'restrictionCode',
  'damageCalculation', 'damageText', 'ownerPsychicEnergyCount', 'retreatEnergyCount',
  'benchCount', 'ownDeckRemaining', 'isFreeRetreat', 'isLegal', 'supporterCount',
  'itemCount', 'handCount', 'pokemonPlayLocked', 'attackLocked', 'canAttack',
  'canRetreat', 'canPlay', 'isPublic', 'isOwnerVisible'
];
const PROMPT_META_KEYS = [
  'sourceZone', 'targetZone', 'handIndex', 'benchIndex', 'slotIndex', 'cardType',
  'energyType', 'amount', 'count', 'selectionIndex', 'isPublic', 'isOwnerVisible',
  'sourcePrinting', 'sourceAttack', 'sourceEffect', 'eligible', 'energyCount',
  'choiceIndex', 'selectedCount', 'minimumCount', 'maximumCount', 'requiredCount',
  'sourceCardType', 'selectionType', 'zone', 'ownerSeat', 'allowCancel', 'isSecret'
];

function scalarOrNull(value) {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}
function stringArray(value) {
  if (!Array.isArray(value) || value.length > 2048 ||
      value.some(item => typeof item !== 'string' || item.length > 512)) fail('BAD_STRING_ARRAY');
}
function validateFlatMetadata(value, allowedKeys, code) {
  if (value === undefined) return;
  if (!isRecord(value)) fail(code);
  exactKeys(value, [], allowedKeys);
  for (const child of Object.values(value)) if (!scalarOrNull(child)) fail(code);
}
function validatePromptMetadata(value) {
  if (value === undefined) return;
  validateFlatMetadata(value, PROMPT_META_KEYS, 'BAD_PROMPT_METADATA');
  if (value.ownerSeat !== undefined &&
      !['actor', 'opponent', 'mixed', 'actor,opponent'].includes(value.ownerSeat)) {
    fail('BAD_PROMPT_METADATA');
  }
  for (const key of ['isPublic', 'isOwnerVisible', 'allowCancel', 'isSecret', 'eligible']) {
    if (value[key] !== undefined && typeof value[key] !== 'boolean') fail('BAD_PROMPT_METADATA');
  }
  for (const key of ['selectionIndex', 'choiceIndex']) {
    if (value[key] !== undefined &&
        (!Number.isSafeInteger(value[key]) || value[key] < 0 || value[key] >= LIMITS.maxArrayItems)) {
      fail('BAD_PROMPT_METADATA');
    }
  }
  for (const key of ['amount', 'count', 'energyCount', 'selectedCount', 'minimumCount',
    'maximumCount', 'requiredCount']) {
    if (value[key] !== undefined &&
        (!Number.isSafeInteger(value[key]) || value[key] < 0 || value[key] > LIMITS.maxArrayItems)) {
      fail('BAD_PROMPT_METADATA');
    }
  }
  return value;
}
function validateActionMetadata(value) {
  if (value === undefined) return;
  validateFlatMetadata(value, ACTION_META_KEYS, 'BAD_ACTION_METADATA');
  for (const key of ['ownerSeat', 'targetSeat', 'sourceSeat']) {
    if (value[key] !== undefined && !['actor', 'opponent'].includes(value[key])) {
      fail('BAD_ACTION_SEAT_METADATA');
    }
  }
  for (const key of ['handIndex', 'benchIndex', 'slotIndex', 'targetIndex', 'sourceIndex']) {
    if (value[key] !== undefined &&
        (!Number.isSafeInteger(value[key]) || value[key] < 0 || value[key] >= LIMITS.maxArrayItems)) {
      fail('BAD_ACTION_INDEX_METADATA');
    }
  }
  return value;
}
function validatePokemonSlot(slot, allowConcealed) {
  if (slot === null) return;
  if (!isRecord(slot)) fail('BAD_POKEMON_SLOT');
  if (allowConcealed && slot.concealed === true) {
    exactKeys(slot, ['concealed']);
    return;
  }
  exactKeys(slot, POKEMON_KEYS, POKEMON_OPTIONAL_KEYS);
  if (!boundedString(slot.printing, null, 256) || !boundedString(slot.name, null, 128)) fail('BAD_POKEMON_IDENTITY');
  if (!Number.isFinite(slot.hp) || !Number.isFinite(slot.damage)) fail('BAD_POKEMON_VITALS');
  if (slot.lastPlayedOrEvolvedTurn !== null && !Number.isSafeInteger(slot.lastPlayedOrEvolvedTurn)) fail('BAD_POKEMON_TURN');
  exactKeys(slot.printed, PRINTED_KEYS);
  if (!scalarOrNull(slot.printed.stage)) fail('BAD_PRINTED_STAGE');
  for (const key of ['subtypes', 'types', 'retreatCost']) {
    if (!Array.isArray(slot.printed[key])) fail('BAD_PRINTED_ARRAY');
    assertBoundedJson(slot.printed[key]);
  }
  for (const key of ['weakness', 'resistance']) {
    if (!Array.isArray(slot.printed[key])) fail('BAD_PRINTED_MODIFIERS');
    for (const row of slot.printed[key]) {
      exactKeys(row, ['type', 'value']);
      if (!scalarOrNull(row.type) || !scalarOrNull(row.value)) fail('BAD_PRINTED_MODIFIER');
    }
  }
  stringArray(slot.specialConditions);
  exactKeys(slot.publicRestrictions, PUBLIC_RESTRICTION_KEYS);
  for (const key of ['cannotAttackNextTurn', 'cannotRetreat', 'cannotRetreatNextTurn', 'cannotRetreatWhileActive', 'cannotEvolveNextTurn']) {
    if (typeof slot.publicRestrictions[key] !== 'boolean') fail('BAD_POKEMON_RESTRICTION');
  }
  stringArray(slot.publicRestrictions.cannotUseAttacksNextTurn);
  for (const key of ['blockedAttackNameNextTurn', 'blockedAttackNameUntilLeavesActive', 'onlyAllowedAttackNameNextTurn']) {
    if (!(slot.publicRestrictions[key] === null || boundedString(slot.publicRestrictions[key], null, 128))) fail('BAD_POKEMON_RESTRICTION');
  }
  for (const key of ['attackCostIncreaseNextTurn', 'attackCostIncreaseWhileActive']) {
    if (!Number.isSafeInteger(slot.publicRestrictions[key]) || slot.publicRestrictions[key] < 0) fail('BAD_POKEMON_RESTRICTION');
  }
  for (const key of ['evolutionPrintings', 'energies', 'tools', 'abilities']) stringArray(slot[key]);
  if (!Array.isArray(slot.attacks)) fail('BAD_ATTACKS');
  for (const attack of slot.attacks) {
    exactKeys(attack, ['name', 'cost', 'damage', 'damageCalculation', 'text', 'gxAttack', 'barrage'], ['canUseOnFirstTurn']);
    if (!boundedString(attack.name, null, 128) || !Array.isArray(attack.cost) ||
        !scalarOrNull(attack.damage) || !scalarOrNull(attack.damageCalculation) ||
        !(attack.text === null || typeof attack.text === 'string') ||
        typeof attack.gxAttack !== 'boolean' || typeof attack.barrage !== 'boolean' ||
        (attack.canUseOnFirstTurn !== undefined && typeof attack.canUseOnFirstTurn !== 'boolean')) fail('BAD_ATTACK_RECORD');
    assertBoundedJson(attack.cost);
  }
  if (!Array.isArray(slot.abilityDetails)) fail('BAD_ABILITY_DETAILS');
  for (const ability of slot.abilityDetails) {
    exactKeys(ability, ['name', 'powerType', 'text']);
    if (!boundedString(ability.name, null, 128) || !scalarOrNull(ability.powerType) ||
        !(ability.text === null || typeof ability.text === 'string')) fail('BAD_ABILITY_RECORD');
  }
  if (slot.abilitySuppressions !== undefined) {
    if (!Array.isArray(slot.abilitySuppressions) || slot.abilitySuppressions.length > 8) fail('BAD_ABILITY_SUPPRESSIONS');
    const knownAbilityNames = new Set([...slot.abilities, ...slot.abilityDetails.map(x => x.name)]);
    const seen = new Set();
    for (const suppression of slot.abilitySuppressions) {
      exactKeys(suppression, ['abilityName', 'suppressed', 'reasonCode', 'sourcePrinting']);
      if (!boundedString(suppression.abilityName, null, 128) || !knownAbilityNames.has(suppression.abilityName) ||
          !(suppression.suppressed === null || typeof suppression.suppressed === 'boolean') ||
          !(suppression.reasonCode === null || boundedString(suppression.reasonCode, /^[A-Z][A-Z0-9_]{0,63}$/)) ||
          !(suppression.sourcePrinting === null || boundedString(suppression.sourcePrinting, null, 256)) ||
          seen.has(suppression.abilityName)) fail('BAD_ABILITY_SUPPRESSION');
      if (suppression.suppressed !== true && (suppression.reasonCode !== null || suppression.sourcePrinting !== null)) fail('INCONSISTENT_ABILITY_SUPPRESSION');
      if (suppression.suppressed === true && (suppression.reasonCode === null || suppression.sourcePrinting === null)) fail('MISSING_ABILITY_SUPPRESSION_SOURCE');
      seen.add(suppression.abilityName);
    }
    if (seen.size !== knownAbilityNames.size) fail('INCOMPLETE_ABILITY_SUPPRESSION_VIEW');
  }
}
function validatePublicPlayer(player, allowConcealed) {
  exactKeys(player, PLAYER_KEYS);
  validatePokemonSlot(player.active, allowConcealed);
  if (!Array.isArray(player.bench) || player.bench.length > 10) fail('BAD_BENCH');
  for (const slot of player.bench) validatePokemonSlot(slot, allowConcealed);
  for (const key of ['stadium', 'discard', 'lostZone', 'resolvingSupporter']) stringArray(player[key]);
  if (player.publicHand !== null) stringArray(player.publicHand);
  if (!Array.isArray(player.prizeSlots)) fail('BAD_PRIZE_SLOTS');
  for (const slot of player.prizeSlots) {
    exactKeys(slot, ['index'], ['printing']);
    if (!Number.isSafeInteger(slot.index) || slot.index < 0 || slot.index > 5 ||
        (slot.printing !== undefined && !boundedString(slot.printing, null, 256))) fail('BAD_PRIZE_SLOT');
  }
  exactKeys(player.publicTurnRestrictions, PLAYER_RESTRICTION_KEYS, PLAYER_RESTRICTION_OPTIONAL_KEYS);
  for (const key of ['gxUsed', 'vstarUsed', 'cannotUseGXAttacks', 'pokemonPlayLocked',
    'abilityPokemonPlayLocked', 'evolutionPlayLocked', 'itemPlayLocked', 'supporterPlayLocked',
    'stadiumPlayLocked', 'toolPlayLocked', 'energyPlayLocked', 'specialEnergyPlayLocked']) {
    if (typeof player.publicTurnRestrictions[key] !== 'boolean') fail('BAD_PLAYER_RESTRICTION');
  }
  for (const key of ['attackLockTurnsRemaining', 'attackMaxEnergyTurnsRemaining', 'ignoreAttackCostTurnsRemaining']) {
    if (!Number.isSafeInteger(player.publicTurnRestrictions[key]) || player.publicTurnRestrictions[key] < 0) fail('BAD_PLAYER_RESTRICTION');
  }
  if (!(player.publicTurnRestrictions.attackMaxEnergy === null ||
      (Number.isSafeInteger(player.publicTurnRestrictions.attackMaxEnergy) && player.publicTurnRestrictions.attackMaxEnergy >= 0))) fail('BAD_PLAYER_RESTRICTION');
  stringArray(player.publicTurnRestrictions.ignoreAttackCostCardTypes);
  if (player.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining !== undefined &&
      (!Number.isSafeInteger(player.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining) ||
       player.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining < 0)) fail('BAD_STADIUM_SUPPRESSION_EPOCH');
  for (const key of ['handCount', 'deckCount', 'prizeCount']) {
    if (!Number.isSafeInteger(player[key]) || player[key] < 0) fail('BAD_PUBLIC_COUNT');
  }
}
function validateActorObservation(view, seat) {
  exactKeys(view, ACTOR_KEYS);
  if (view.actorSeat !== seat || !Number.isSafeInteger(view.globalTurn) || view.globalTurn < 0 ||
      !Number.isSafeInteger(view.phase) || view.phase < 0 || !['owner-root', 'owner-prompt'].includes(view.decisionKind) ||
      typeof view.pendingOwnerDeckSearch !== 'boolean') fail('BAD_ACTOR_OBSERVATION');
  if (view.pendingPromptType !== null && !boundedString(view.pendingPromptType, /^[A-Za-z][A-Za-z0-9._-]{0,95}$/)) fail('BAD_PENDING_PROMPT_TYPE');
  if (view.decisionKind === 'owner-root' && (view.pendingPromptType !== null || view.pendingOwnerDeckSearch)) fail('ROOT_HAS_PENDING_PROMPT');
  if (view.decisionKind === 'owner-prompt' && view.pendingPromptType === null) fail('PROMPT_TYPE_MISSING');
  if (view.pendingOwnerDeckSearch && (view.decisionKind !== 'owner-prompt' || view.pendingPromptType !== 'ChooseCardsPrompt')) fail('BAD_OWNER_DECK_SEARCH_FLAG');
  stringArray(view.ownHand);
  validatePublicPlayer(view.ownPublic, false);
  validatePublicPlayer(view.opponentPublic, view.phase === 0 || view.phase === 1);
  exactKeys(view.ownTurnResources, TURN_RESOURCE_KEYS);
  assertBoundedJson(view.ownTurnResources);
  if (view.ownerK1 !== null) {
    exactKeys(view.ownerK1, ['epoch', 'exactMembershipKnown', 'knownPrintings', 'invalidationReason']);
    if (!Number.isSafeInteger(view.ownerK1.epoch) || view.ownerK1.epoch < 0 ||
        typeof view.ownerK1.exactMembershipKnown !== 'boolean' ||
        !(view.ownerK1.invalidationReason === null || typeof view.ownerK1.invalidationReason === 'string')) fail('BAD_OWNER_K1');
    if (view.ownerK1.knownPrintings !== null) {
      if (!Array.isArray(view.ownerK1.knownPrintings)) fail('BAD_OWNER_K1_PRINTINGS');
      for (const row of view.ownerK1.knownPrintings) {
        exactKeys(row, ['printing', 'copies']);
        if (!boundedString(row.printing, null, 256) || !Number.isSafeInteger(row.copies) || row.copies < 0) fail('BAD_OWNER_K1_PRINTING');
      }
    }
  }
  assertBoundedJson(view);
}
function validateEventPokemon(slot, viewPokemon) {
  if (slot === null) return;
  exactKeys(slot, ['printing', 'movedFromBenchToActiveThisTurn', 'knownAbilityUse']);
  if (!boundedString(slot.printing, null, 256) ||
      !(slot.movedFromBenchToActiveThisTurn === null || typeof slot.movedFromBenchToActiveThisTurn === 'boolean') ||
      !Array.isArray(slot.knownAbilityUse)) fail('BAD_EVENT_POKEMON');
  const knownAbilityNames = new Set([...(viewPokemon?.abilities ?? []), ...(viewPokemon?.abilityDetails ?? []).map(x => x.name)]);
  for (const ability of slot.knownAbilityUse) {
    exactKeys(ability, ['name', 'usedThisTurn']);
    if (!boundedString(ability.name, null, 128) || !knownAbilityNames.has(ability.name) ||
        !(ability.usedThisTurn === null || typeof ability.usedThisTurn === 'boolean')) fail('BAD_EVENT_ABILITY');
  }
}
function validateEventAttack(row) {
  exactKeys(row, ['turn', 'sourcePrinting', 'attackName', 'gxAttack', 'copycatAttack'], ['barragePairIndex', 'barragePairRole']);
  if (!Number.isSafeInteger(row.turn) || !boundedString(row.sourcePrinting, null, 256) ||
      !boundedString(row.attackName, null, 128) || typeof row.gxAttack !== 'boolean' ||
      typeof row.copycatAttack !== 'boolean') fail('BAD_EVENT_ATTACK');
  if (row.barragePairIndex !== undefined && (!Number.isSafeInteger(row.barragePairIndex) || row.barragePairIndex < 0)) fail('BAD_BARRAGE_INDEX');
  if (row.barragePairRole !== undefined && !['first', 'second'].includes(row.barragePairRole)) fail('BAD_BARRAGE_ROLE');
  if ((row.barragePairIndex === undefined) !== (row.barragePairRole === undefined)) fail('INCOMPLETE_BARRAGE_PAIR');
}
function eventAttackSignature(row) {
  return JSON.stringify([row.turn, row.sourcePrinting, row.attackName, row.gxAttack, row.copycatAttack,
    row.barragePairIndex ?? null, row.barragePairRole ?? null]);
}

function validatePublicEventReceipt(receipt, view) {
  if (receipt === null) return;
  exactKeys(receipt, [
    'version', 'actorSeat', 'turn', 'ownerActive', 'ownerBench', 'priorOpponentTurnKO',
    'opponentLastTurnAttack', 'opponentLastTurnTurn', 'opponentLastTurnAttacks'
  ], ['opponentCopycatChoices', 'mimikyuCopycatCompatible']);
  if (receipt.version !== EVENT_RECEIPT_VERSION ||
      receipt.actorSeat !== view.actorSeat || receipt.turn !== view.globalTurn) fail('BAD_PUBLIC_EVENT_RECEIPT');
  validateEventPokemon(receipt.ownerActive, view.ownPublic.active);
  const viewActivePrinting = view.ownPublic.active === null ? null : view.ownPublic.active.printing;
  const receiptActivePrinting = receipt.ownerActive === null ? null : receipt.ownerActive.printing;
  if (viewActivePrinting !== receiptActivePrinting) fail('EVENT_OWNER_ACTIVE_MISMATCH');
  if (!Array.isArray(receipt.ownerBench) || receipt.ownerBench.length > 10 ||
      receipt.ownerBench.length !== view.ownPublic.bench.length) fail('BAD_EVENT_BENCH');
  for (let i = 0; i < receipt.ownerBench.length; i++) {
    const slot = receipt.ownerBench[i];
    validateEventPokemon(slot, view.ownPublic.bench[i]);
    const viewPrinting = view.ownPublic.bench[i] === null ? null : view.ownPublic.bench[i].printing;
    const receiptPrinting = slot === null ? null : slot.printing;
    if (viewPrinting !== receiptPrinting) fail('EVENT_OWNER_BENCH_MISMATCH');
  }
  exactKeys(receipt.priorOpponentTurnKO, ['any', 'byAttack']);
  for (const key of ['any', 'byAttack']) {
    if (!(receipt.priorOpponentTurnKO[key] === null || typeof receipt.priorOpponentTurnKO[key] === 'boolean')) fail('BAD_PRIOR_KO');
  }
  if (receipt.opponentLastTurnAttack !== null) fail('LEGACY_ATTACK_RECEIPT_FORBIDDEN');
  if (receipt.opponentLastTurnTurn !== null && (!Number.isSafeInteger(receipt.opponentLastTurnTurn) || receipt.opponentLastTurnTurn >= view.globalTurn)) fail('BAD_PREVIOUS_TURN');
  if (receipt.opponentLastTurnAttacks !== null) {
    if (!Array.isArray(receipt.opponentLastTurnAttacks) || receipt.opponentLastTurnAttacks.length > 32 || receipt.opponentLastTurnTurn === null) fail('BAD_EVENT_ATTACKS');
    for (const row of receipt.opponentLastTurnAttacks) {
      validateEventAttack(row);
      if (row.turn !== receipt.opponentLastTurnTurn) fail('EVENT_ATTACK_TURN_MISMATCH');
    }
  } else if (receipt.opponentLastTurnTurn !== null) fail('EVENT_TURN_WITHOUT_ATTACK_HISTORY');
  const hasCopycatChoices = Object.prototype.hasOwnProperty.call(receipt, 'opponentCopycatChoices');
  const hasCopycatCompatibility = Object.prototype.hasOwnProperty.call(receipt, 'mimikyuCopycatCompatible');
  if (hasCopycatChoices !== hasCopycatCompatibility) fail('INCOMPLETE_COPYCAT_RECEIPT');
  if (hasCopycatChoices) {
    if (receipt.opponentCopycatChoices === null) {
      if (receipt.mimikyuCopycatCompatible !== null) fail('BAD_COPYCAT_COMPATIBILITY');
    } else {
      const choices = receipt.opponentCopycatChoices;
      if (!Array.isArray(choices) || choices.length > 2 || !Array.isArray(receipt.opponentLastTurnAttacks)) fail('BAD_COPYCAT_CHOICES');
      for (const row of choices) {
        validateEventAttack(row);
        if (row.gxAttack || row.copycatAttack) fail('INELIGIBLE_COPYCAT_ATTACK');
        if (!receipt.opponentLastTurnAttacks.some(attack => eventAttackSignature(attack) === eventAttackSignature(row))) fail('COPYCAT_CHOICE_NOT_IN_HISTORY');
      }
      if (choices.length === 1 && (choices[0].barragePairIndex !== undefined || choices[0].barragePairRole !== undefined)) fail('BAD_SINGLE_COPYCAT_CHOICE');
      if (choices.length === 2) {
        const [first, second] = choices;
        const firstHasPair = first.barragePairIndex !== undefined || first.barragePairRole !== undefined;
        const secondHasPair = second.barragePairIndex !== undefined || second.barragePairRole !== undefined;
        if (firstHasPair !== secondHasPair) fail('BAD_COPYCAT_BARRAGE_PAIR');
        if (firstHasPair && (first.barragePairIndex === undefined || first.barragePairIndex !== second.barragePairIndex ||
            first.barragePairRole !== 'first' || second.barragePairRole !== 'second' ||
            first.sourcePrinting !== second.sourcePrinting || first.attackName === second.attackName)) fail('BAD_COPYCAT_BARRAGE_PAIR');
      }
      const active = view.ownPublic.active;
      const activeHasCopycat = active !== null && active.name === 'Mimikyu' &&
        active.attacks.some(attack => attack.name === 'Copycat');
      const expectedCompatibility = activeHasCopycat && choices.length > 0;
      if (typeof receipt.mimikyuCopycatCompatible !== 'boolean' ||
          receipt.mimikyuCopycatCompatible !== expectedCompatibility) fail('BAD_COPYCAT_COMPATIBILITY');
    }
  }
  assertBoundedJson(receipt);
}

function assertToken(value) {
  if (!boundedString(value, /^[A-Za-z0-9._:-]+$/, LIMITS.maxTokenLength)) {
    fail('INVALID_TOKEN');
  }
}

function uniqueTokens(rows, field) {
  if (!Array.isArray(rows) || rows.length > LIMITS.maxArrayItems) fail('INVALID_TOKEN_LIST');
  const seen = new Set();
  for (const row of rows) {
    if (!isRecord(row)) fail('INVALID_TOKEN_ROW');
    assertToken(row[field]);
    if (seen.has(row[field])) fail('DUPLICATE_TOKEN');
    seen.add(row[field]);
  }
  return seen;
}

function validateInit(message) {
  exactKeys(message,
    ['schema', 'type', 'role', 'seat', 'policyVersion', 'bundleSha256', 'config']);
  if (message.schema !== INIT_SCHEMA || message.type !== 'init') fail('BAD_INIT_SCHEMA');
  if (!['candidate', 'opponent'].includes(message.role)) fail('BAD_ROLE');
  if (message.seat !== 0 && message.seat !== 1) fail('BAD_SEAT');
  if (!boundedString(message.policyVersion, /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/)) fail('BAD_POLICY_VERSION');
  if (!boundedString(message.bundleSha256, /^[a-f0-9]{64}$/)) fail('BAD_BUNDLE_DIGEST');
  if (!isRecord(message.config)) fail('BAD_POLICY_CONFIG');
  exactKeys(message.config, []); // Policy-specific settings are frozen in the role-only bundle.
  assertBoundedJson(message.config);
  assertNoForbiddenFields(message);
  return message;
}

function multiSelectBounds(prompt) {
  const metadata = prompt?.publicMetadata;
  if (!metadata || !MULTI_SELECT_PROMPT_TYPES.has(metadata.selectionType)) return null;
  if (!Array.isArray(prompt.choices) || typeof metadata.allowCancel !== 'boolean') {
    fail('BAD_MULTI_SELECT_METADATA');
  }

  let minimumCount;
  let maximumCount;
  switch (metadata.selectionType) {
    case 'card-combination':
    case 'pokemon':
      minimumCount = metadata.minimumCount;
      maximumCount = metadata.maximumCount;
      break;
    case 'energy-payment':
      minimumCount = 1;
      maximumCount = metadata.energyCount ?? metadata.count;
      break;
    case 'prize-slots':
      minimumCount = metadata.requiredCount;
      maximumCount = metadata.requiredCount;
      break;
    case 'card-order':
      minimumCount = metadata.count;
      maximumCount = metadata.count;
      break;
    default:
      fail('BAD_MULTI_SELECT_METADATA');
  }

  if (!Number.isSafeInteger(minimumCount) || !Number.isSafeInteger(maximumCount) ||
      minimumCount < 0 || maximumCount < minimumCount ||
      maximumCount > LIMITS.maxArrayItems) {
    fail('BAD_MULTI_SELECT_BOUNDS');
  }
  const cancelChoices = prompt.choices.filter(choice => choice.kind === 'cancel');
  const emptyChoices = prompt.choices.filter(choice => choice.kind === 'empty-selection');
  const selectableChoices = prompt.choices.filter(choice =>
    choice.kind !== 'cancel' && choice.kind !== 'empty-selection');
  if ((metadata.allowCancel && cancelChoices.length !== 1) ||
      (!metadata.allowCancel && cancelChoices.length !== 0)) {
    fail('BAD_MULTI_SELECT_CANCEL_CHOICE');
  }
  if ((minimumCount === 0 && emptyChoices.length !== 1) ||
      (minimumCount !== 0 && emptyChoices.length !== 0)) {
    fail('BAD_MULTI_SELECT_EMPTY_CHOICE');
  }
  const effectiveMaximum = Math.min(maximumCount, selectableChoices.length);
  if (minimumCount > effectiveMaximum) fail('BAD_MULTI_SELECT_BOUNDS');
  return {
    selectionType: metadata.selectionType,
    minimumCount,
    maximumCount: effectiveMaximum,
    allowCancel: metadata.allowCancel
  };
}

function validatePrompt(prompt, seat) {
  if (prompt === null) return null;
  exactKeys(prompt, ['schema', 'actingSeat', 'promptType', 'description', 'source', 'choices'], ['publicMetadata']);
  if (seat !== 0 && seat !== 1) fail('BAD_SEAT');
  if (prompt.schema !== PROMPT_SCHEMA || prompt.actingSeat !== seat) fail('BAD_PROMPT_PROJECTION');
  exactKeys(prompt.source, ['classification', 'sourceKind', 'sourcePrinting', 'effectName'], ['copiedSourcePrinting', 'copiedAttackName']);
  if (prompt.source.classification !== 'actor-choice') fail('NON_ACTOR_PROMPT_CLASS');
  if (!['card-effect', 'engine'].includes(prompt.source.sourceKind) ||
      !boundedString(prompt.source.effectName, null, 256)) fail('BAD_PROMPT_SOURCE');
  if (prompt.source.sourceKind === 'card-effect' && !boundedString(prompt.source.sourcePrinting, null, 256)) fail('UNKNOWN_PROMPT_SOURCE');
  if (prompt.source.sourceKind === 'engine' && prompt.source.sourcePrinting !== null) fail('BAD_ENGINE_PROMPT_SOURCE');
  for (const key of ['sourcePrinting', 'effectName', 'copiedSourcePrinting', 'copiedAttackName']) {
    if (prompt.source[key] !== undefined && prompt.source[key] !== null &&
        !boundedString(prompt.source[key], null, 256)) fail('BAD_PROMPT_SOURCE');
  }
  const hasCopiedSource = prompt.source.copiedSourcePrinting !== undefined || prompt.source.copiedAttackName !== undefined;
  if (hasCopiedSource && prompt.source.sourceKind !== 'card-effect') fail('BAD_ENGINE_PROMPT_SOURCE');
  if (hasCopiedSource &&
      (!boundedString(prompt.source.copiedSourcePrinting, null, 256) ||
       !boundedString(prompt.source.copiedAttackName, null, 256))) fail('INCOMPLETE_COPIED_PROMPT_SOURCE');
  if (prompt.source.effectName === 'Copycat' && (prompt.source.sourceKind !== 'card-effect' || !hasCopiedSource)) fail('COPYCAT_SOURCE_MISSING');
  if (/night\s*watch/i.test(String(prompt.source.effectName ?? '')) ||
      /night\s*watch/i.test(String(prompt.source.copiedAttackName ?? ''))) fail('HOST_ONLY_PHYSICAL_PROMPT');
  if (!boundedString(prompt.promptType, /^[A-Za-z][A-Za-z0-9._-]{0,95}$/)) fail('BAD_PROMPT_TYPE');
  if (prompt.description !== null && !boundedString(prompt.description, null, 2048)) fail('BAD_PROMPT_DESCRIPTION');
  if (!Array.isArray(prompt.choices) || prompt.choices.length > 512) fail('BAD_PROMPT_CHOICES');
  uniqueTokens(prompt.choices, 'token');
  for (const choice of prompt.choices) {
    exactKeys(choice, ['token', 'kind'], ['printing', 'label', 'publicMetadata']);
    if (!boundedString(choice.kind, /^[A-Za-z][A-Za-z0-9._-]{0,63}$/)) fail('BAD_CHOICE_KIND');
    if (choice.printing !== undefined && !boundedString(choice.printing, null, 256)) fail('BAD_CHOICE_PRINTING');
    if (choice.label !== undefined && !boundedString(choice.label, null, 256)) fail('BAD_CHOICE_LABEL');
    if (choice.publicMetadata !== undefined) validatePromptMetadata(choice.publicMetadata);
  }
  if (prompt.publicMetadata !== undefined) validatePromptMetadata(prompt.publicMetadata);
  multiSelectBounds(prompt);
  return prompt;
}

function validateFrontier(frontier) {
  exactKeys(frontier, ['schema', 'items']);
  if (frontier.schema !== FRONTIER_SCHEMA) fail('BAD_ACTION_FRONTIER_SCHEMA');
  if (!Array.isArray(frontier.items) || frontier.items.length > 512) fail('BAD_ACTION_FRONTIER');
  uniqueTokens(frontier.items, 'token');
  const selectableTokens = new Set();
  for (const item of frontier.items) {
    exactKeys(item, ['token', 'kind'], ['label', 'actorPrinting', 'targetPrinting', 'attackName', 'publicMetadata']);
    if (!boundedString(item.kind, /^[A-Za-z][A-Za-z0-9._-]{0,63}$/) ||
        (!EXECUTABLE_ACTION_KINDS.has(item.kind) && !ANALYSIS_ONLY_ACTION_KINDS.has(item.kind))) {
      fail('BAD_ACTION_KIND');
    }
    if (EXECUTABLE_ACTION_KINDS.has(item.kind)) selectableTokens.add(item.token);
    for (const key of ['label', 'actorPrinting', 'targetPrinting', 'attackName']) {
      if (item[key] !== undefined && !boundedString(item[key], null, 256)) fail('BAD_ACTION_METADATA');
    }
    if (item.publicMetadata !== undefined) validateActionMetadata(item.publicMetadata);
  }
  return selectableTokens;
}

function validateRequest(message, init, expectedSequence, seenRequestIds) {
  exactKeys(message, [
    'schema', 'type', 'requestId', 'sequence', 'role', 'seat',
    'observationSchema', 'observation', 'prompt', 'publicEventReceipt', 'actionFrontier'
  ]);
  if (message.schema !== REQUEST_SCHEMA || message.type !== 'decision') fail('BAD_REQUEST_SCHEMA');
  if (!boundedString(message.requestId, /^[A-Za-z0-9._:-]{1,128}$/, 128)) fail('BAD_REQUEST_ID');
  if (seenRequestIds.has(message.requestId)) fail('DUPLICATE_REQUEST_ID');
  if (!Number.isSafeInteger(message.sequence) || message.sequence !== expectedSequence) fail('BAD_SEQUENCE');
  if (message.role !== init.role || message.seat !== init.seat) fail('ROLE_SEAT_CHANGED');
  if (message.observationSchema !== OBSERVATION_SCHEMA) fail('BAD_OBSERVATION_SCHEMA');
  validateActorObservation(message.observation, init.seat);
  if (message.prompt !== null && message.observation.decisionKind !== 'owner-prompt') fail('PROMPT_ROOT_MISMATCH');
  if (message.prompt === null && message.observation.decisionKind === 'owner-prompt') fail('MISSING_PROMPT_PROJECTION');
  const prompt = validatePrompt(message.prompt, init.seat);
  if (prompt && message.observation.pendingPromptType !== prompt.promptType) fail('PROMPT_TYPE_MISMATCH');
  validatePublicEventReceipt(message.publicEventReceipt, message.observation);
  const actionTokens = validateFrontier(message.actionFrontier);
  assertBoundedJson(message);
  assertNoForbiddenFields(message);
  seenRequestIds.add(message.requestId);
  return { prompt, actionTokens };
}

function validateDecision(decision, prompt, actionTokens) {
  if (!isRecord(decision)) fail('POLICY_RETURNED_NON_OBJECT');
  if (decision.kind === 'select-action') {
    if (prompt !== null) fail('ACTION_DURING_PROMPT');
    exactKeys(decision, ['kind', 'token']);
    assertToken(decision.token);
    if (!actionTokens.has(decision.token)) fail('POLICY_SELECTED_UNKNOWN_ACTION');
    return { kind: 'select-action', token: decision.token };
  }
  if (decision.kind === 'select-choice') {
    if (prompt === null) fail('CHOICE_DURING_ROOT');
    exactKeys(decision, ['kind', 'token']);
    assertToken(decision.token);
    const choice = prompt?.choices?.find(item => item.token === decision.token);
    if (!choice) fail('POLICY_SELECTED_UNKNOWN_CHOICE');
    const bounds = multiSelectBounds(prompt);
    if (bounds) {
      if (choice.kind === 'cancel') {
        if (!bounds.allowCancel) fail('CANCEL_NOT_ALLOWED');
      } else if (choice.kind === 'empty-selection') {
        if (bounds.minimumCount !== 0) fail('EMPTY_SELECTION_NOT_ALLOWED');
      } else {
        fail('MULTI_SELECT_REQUIRES_SELECT_CHOICES');
      }
    }
    return { kind: 'select-choice', token: decision.token };
  }
  if (decision.kind === 'select-choices') {
    if (prompt === null) fail('CHOICE_DURING_ROOT');
    exactKeys(decision, ['kind', 'tokens']);
    const bounds = multiSelectBounds(prompt);
    if (!bounds) fail('MULTI_SELECT_NOT_SUPPORTED');
    if (!Array.isArray(decision.tokens) || decision.tokens.length === 0 ||
        decision.tokens.length > 512) fail('BAD_MULTI_SELECT_TOKENS');
    const choiceByToken = new Map(prompt.choices.map(choice => [choice.token, choice]));
    const seen = new Set();
    for (const token of decision.tokens) {
      assertToken(token);
      if (seen.has(token)) fail('DUPLICATE_MULTI_SELECT_TOKEN');
      seen.add(token);
      const choice = choiceByToken.get(token);
      if (!choice) fail('POLICY_SELECTED_UNKNOWN_CHOICE');
      if (choice.kind === 'cancel' || choice.kind === 'empty-selection') {
        fail('SPECIAL_CHOICE_IN_MULTI_SELECT');
      }
    }
    if (decision.tokens.length < bounds.minimumCount ||
        decision.tokens.length > bounds.maximumCount) {
      fail('BAD_MULTI_SELECT_COUNT');
    }
    return { kind: 'select-choices', tokens: decision.tokens.slice() };
  }
  if (decision.kind === 'abstain') {
    exactKeys(decision, ['kind', 'reasonCode']);
    if (!boundedString(decision.reasonCode, /^[A-Z][A-Z0-9_]{0,63}$/)) fail('BAD_ABSTENTION_CODE');
    return { kind: 'abstain', reasonCode: decision.reasonCode };
  }
  fail('UNKNOWN_DECISION_KIND');
}

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

async function writeLine(value) {
  const bytes = Buffer.from(JSON.stringify(value) + '\n', 'utf8');
  if (bytes.length > LIMITS.maxResponseBytes) fail('RESPONSE_TOO_LARGE');
  if (!process.stdout.write(bytes)) await once(process.stdout, 'drain');
}

/* No physical-game RNG or seed is accepted by this IPC schema. This worker is
 * not a sandbox for the policy's own ambient Node RNG; policy bundles must be
 * deterministic and audited until the owner approves a separate policy RNG. */

async function run() {
  const policyModule = require('./policy.cjs');
  let initialized = false;
  let init = null;
  let policy = null;
  let expectedSequence = 1;
  let messageCount = 0;
  let totalInputBytes = 0;
  const seenRequestIds = new Set();
  let pending = Buffer.alloc(0);

  async function handleLine(line) {
    if (line.length === 0) fail('EMPTY_LINE');
    if (line.length > LIMITS.maxLineBytes) fail('LINE_TOO_LARGE');
    let message;
    try {
      message = JSON.parse(line.toString('utf8'));
    } catch {
      fail('MALFORMED_JSON');
    }
    assertBoundedJson(message);
    if (!initialized) {
      init = validateInit(message);
      if (policyModule.POLICY_VERSION !== init.policyVersion ||
          typeof policyModule.createPolicy !== 'function') fail('POLICY_MODULE_MISMATCH');
      policy = await policyModule.createPolicy(deepFreeze({
        role: init.role,
        seat: init.seat,
        policyVersion: init.policyVersion,
        config: init.config
      }));
      if (!policy || typeof policy.decide !== 'function') fail('POLICY_FACTORY_INVALID');
      initialized = true;
      await writeLine({
        schema: READY_SCHEMA,
        type: 'ready',
        role: init.role,
        seat: init.seat,
        policyVersion: init.policyVersion,
        bundleSha256: init.bundleSha256
      });
      return;
    }

    const validated = validateRequest(message, init, expectedSequence, seenRequestIds);
    const frozenRequest = deepFreeze(message);
    const rawDecision = await policy.decide(frozenRequest);
    const decision = validateDecision(rawDecision, validated.prompt, validated.actionTokens);
    const response = {
      schema: RESPONSE_SCHEMA,
      type: 'response',
      requestId: message.requestId,
      sequence: message.sequence,
      role: init.role,
      seat: init.seat,
      policyVersion: init.policyVersion,
      decision
    };
    assertNoForbiddenFields(response);
    await writeLine(response);
    expectedSequence++;
  }

  try {
    for await (const chunk of process.stdin) {
      const bytes = Buffer.from(chunk);
      totalInputBytes += bytes.length;
      if (totalInputBytes > LIMITS.maxTotalInputBytes) fail('TOTAL_INPUT_TOO_LARGE');
      let offset = 0;
      while (offset < bytes.length) {
        const newline = bytes.indexOf(0x0a, offset);
        const end = newline === -1 ? bytes.length : newline;
        const part = bytes.subarray(offset, end);
        if (pending.length + part.length > LIMITS.maxLineBytes) fail('LINE_TOO_LARGE');
        pending = pending.length ? Buffer.concat([pending, part]) : Buffer.from(part);
        if (newline === -1) break;
        messageCount++;
        if (messageCount > LIMITS.maxMessages) fail('TOO_MANY_MESSAGES');
        const line = pending;
        pending = Buffer.alloc(0);
        await handleLine(line);
        offset = newline + 1;
      }
    }
    if (pending.length > 0) fail('UNTERMINATED_LINE');
    if (!initialized) fail('MISSING_INIT');
  } catch (error) {
    const code = error instanceof ProtocolError ? error.code : 'WORKER_FAILURE';
    process.stderr.write('AGENT49_POLICY_WORKER_ERROR ' + code + '\n');
    process.exitCode = 1;
    process.stdin.destroy();
  }
}

if (require.main === module) {
  run().catch(() => {
    process.stderr.write('AGENT49_POLICY_WORKER_ERROR WORKER_FAILURE\n');
    process.exitCode = 1;
    process.stdin.destroy();
  });
}

module.exports = {
  INIT_SCHEMA, READY_SCHEMA, REQUEST_SCHEMA, RESPONSE_SCHEMA,
  OBSERVATION_SCHEMA, PROMPT_SCHEMA, EVENT_RECEIPT_VERSION, FRONTIER_SCHEMA,
  LIMITS, validateInit, validateRequest, validateDecision, validateActorObservation,
  validatePrompt, validateFrontier, validatePublicEventReceipt, validateFlatMetadata
};
