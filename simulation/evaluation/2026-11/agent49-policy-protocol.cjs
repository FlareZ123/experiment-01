'use strict';

const INIT_SCHEMA = 'aichi-policy-worker-init-v2';
const READY_SCHEMA = 'aichi-policy-worker-ready-v3';
const REQUEST_SCHEMA = 'aichi-policy-request-v2';
const RESPONSE_SCHEMA = 'aichi-policy-response-v5';
const POLICY_AUDIT_SCHEMA = 'agent6-policy-audit-v1';
const OBSERVATION_SCHEMA = 'aichi-actor-observation-v4-ability-lock-order';
const PROMPT_SCHEMA = 'aichi-owner-prompt-projection-v3';
const EVENT_RECEIPT_VERSION = 'agent8-public-event-receipt-v3-turn-stamped';
const FRONTIER_SCHEMA = 'aichi-action-frontier-v1';
const ABSTENTION_REASON_CODEBOOK_VERSION = 'agent49-v3-abstention-reasons-v1';
const PUBLIC_ABSTENTION_REASON_CODE = 'POLICY_ABSTAINED';
const ABSTENTION_REASON_CODES = Object.freeze([
  'AMBIGUOUS_SIMPLE_PROMPT',
  'ARVEN_ITEM_TOOL_PAIR_UNAVAILABLE',
  'BAD_CARD_SELECTION_BOUNDS',
  'BAD_GO_FIRST_CONFIRM_CHOICES',
  'BAD_GO_FIRST_SETUP_PROMPT',
  'BAD_MULLIGAN_DRAW_CHOICE_INDEX',
  'BAD_MULLIGAN_DRAW_SETUP_PROMPT',
  'BAD_POKEMON_SELECTION_BOUNDS',
  'BAD_STARTING_POKEMON_EMPTY_CHOICE',
  'BAD_STARTING_POKEMON_SETUP_PROMPT',
  'CARD_ORDER_COUNT_MISMATCH',
  'DECISION_KIND_MISMATCH',
  'ENERGY_COST_EXCEEDS_VISIBLE_CHOICES',
  'HIDDEN_PRIZE_IDENTITY',
  'INCOMPLETE_MULLIGAN_DRAW_INDEXES',
  'INCOMPLETE_MULLIGAN_DRAW_OPTIONS',
  'INSUFFICIENT_STARTING_POKEMON_CHOICES',
  'INVALID_GO_FIRST_CONFIRMATION',
  'INVALID_MULLIGAN_DRAW_INDEX',
  'INVALID_MULLIGAN_DRAW_OPTIONS',
  'INVALID_STARTING_POKEMON_PROMPT',
  'MISSING_ACTIVE_FOR_EXTRA_BENCH',
  'MISSING_PUBLIC_BENCH_FOR_SETUP',
  'MULLIGAN_DRAW_LABEL_INDEX_MISMATCH',
  'NO_COPY_ATTACK_CHOICE',
  'NO_EMPTY_BENCH_SELECTION',
  'NO_EMPTY_PRIZE_CHOICE',
  'NO_EXECUTABLE_ACTION',
  'NO_LEGAL_CARD_SET',
  'NO_LEGAL_PRIZE_SELECTION',
  'NO_MULLIGAN_DRAW_OPTION',
  'NO_POKEMON_SELECTION',
  'NO_STARTING_POKEMON_CHOICE',
  'NO_SUPPORTED_ACTION',
  'NO_SUPPORTED_ATTACK_CHOICE',
  'NO_SUPPORTED_CARD_ORDER',
  'NO_SUPPORTED_CARD_SELECTION',
  'NO_SUPPORTED_ENERGY_PAYMENT',
  'NO_SUPPORTED_POKEMON_CHOICE',
  'NO_SUPPORTED_PRIZE_SELECTION',
  'NO_SUPPORTED_ROOT_ACTION',
  'NO_USEFUL_CARD_CHOICE',
  'NO_VISIBLE_ATTACK_CHOICE',
  'NO_VISIBLE_ENERGY_CHOICE',
  'NO_VISIBLE_POKEMON_TARGET',
  'NO_VISIBLE_PRIZE_SLOT',
  'NO_VISIBLE_STARTING_POKEMON',
  'ROLE_SEAT_BINDING_MISMATCH',
  'ROLE_SEAT_OBSERVATION_MISMATCH',
  'UNCLASSIFIED_POKEMON_PROMPT',
  'UNEXPECTED_MULLIGAN_DRAW_CHOICE',
  'UNEXPECTED_STARTING_POKEMON_CHOICE',
  'UNORDERED_STARTING_POKEMON_CHOICES',
  'UNRECOGNIZED_GO_FIRST_CHOICES',
  'UNRECOGNIZED_SIMPLE_PROMPT',
  'UNSUPPORTED_ATTACK_CHOICE_SOURCE',
  'UNSUPPORTED_CARD_COMBINATION_SOURCE',
  'UNSUPPORTED_CARD_ORDER',
  'UNSUPPORTED_CONFIRMATION_SOURCE',
  'UNSUPPORTED_ENGINE_SETUP_PHASE',
  'UNSUPPORTED_ENGINE_SETUP_PROMPT',
  'UNSUPPORTED_POKEMON_PROMPT',
  'UNSUPPORTED_PRIZE_SELECTION',
  'UNSUPPORTED_PROMPT_TYPE',
  'UNSUPPORTED_STARTING_POKEMON_CARDINALITY',
  'UNTRUSTED_CARD_SELECTION',
  'UNTRUSTED_ENERGY_SELECTION',
  'UNTRUSTED_ENGINE_SETUP_PROMPT',
  'UNTRUSTED_PROMPT',
  'UNTRUSTED_PROMPT_SOURCE',
  'UNTRUSTED_STARTING_POKEMON_CHOICE',
]);
const ABSTENTION_REASON_CODE_SET = new Set(ABSTENTION_REASON_CODES);
function isAbstentionReasonCode(value) {
  return typeof value === 'string' && ABSTENTION_REASON_CODE_SET.has(value);
}
const EXECUTABLE_ACTION_KINDS = new Set([
  'play-card', 'attack', 'retreat', 'use-ability', 'use-stadium', 'pass'
]);
const ANALYSIS_ONLY_ACTION_KINDS = new Set(['projected-attack']);
const MULTI_SELECT_PROMPT_TYPES = new Set([
  'card-combination', 'pokemon', 'energy-payment', 'prize-slots', 'card-order'
]);
const MULTI_SELECT_ITEM_KINDS = Object.freeze({
  'card-combination': 'card',
  pokemon: 'pokemon',
  'energy-payment': 'energy',
  'prize-slots': 'prize',
  'card-order': 'card-order-item'
});

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
const ACTOR_OPTIONAL_KEYS = ['turnSeat'];
const PLAYER_KEYS = [
  'active', 'bench', 'stadium', 'discard', 'lostZone', 'resolvingSupporter',
  'publicHand', 'prizeSlots', 'publicTurnRestrictions', 'handCount', 'deckCount', 'prizeCount'
];
const POKEMON_KEYS = [
  'printing', 'name', 'hp', 'damage', 'lastPlayedOrEvolvedTurn', 'printed',
  'specialConditions', 'publicRestrictions', 'evolutionPrintings', 'energies',
  'tools', 'attacks', 'abilities', 'abilityDetails', 'abilitySuppressions'
];
const POKEMON_OPTIONAL_KEYS = ['abilityLockActivationOrder'];
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
  'energyPlayLocked', 'specialEnergyPlayLocked',
  'stadiumAndToolHaveNoEffectTurnsRemaining'
];
const PLAYER_RESTRICTION_OPTIONAL_KEYS = [
  'alteredCreationDamage', 'usedAlteredCreation'
];
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
  'benchIndex', 'slotIndex', 'targetSeat', 'sourceSeat',
  'targetIndex', 'sourceIndex', 'paymentCount', 'paymentEnergyCount', 'cardType',
  'energyType', 'choiceIndex', 'prizeLiability', 'turnsRemaining', 'abilityLive',
  'abilitySuppressed', 'publicReceiptVersion', 'priorAttackName', 'priorSourcePrinting',
  'priorAttackTurn', 'gxAttack', 'copycatAttack', 'movedFromBenchToActiveThisTurn', 'attackSource',
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

// Selection types are closed and bound to the native prompt classes which
// produce them. A worker cannot reinterpret a prompt under another contract.
const PROMPT_SELECTION_TYPE_TO_PROMPT_TYPES = Object.freeze({
  'card-combination': Object.freeze(['ChooseCardsPrompt', 'NightWatchPrompt']),
  pokemon: Object.freeze(['ChoosePokemonPrompt']),
  'energy-payment': Object.freeze(['ChooseEnergyPrompt']),
  attack: Object.freeze(['ChooseAttackPrompt']),
  'prize-slots': Object.freeze(['ChoosePrizePrompt']),
  'card-order': Object.freeze(['OrderCardsPrompt']),
  confirm: Object.freeze(['ConfirmPrompt']),
  option: Object.freeze(['SelectPrompt', 'SelectOptionPrompt']),
  'energy-attachment': Object.freeze(['AttachEnergyPrompt'])
});
const PROMPT_SELECTION_TYPES = new Set(Object.keys(PROMPT_SELECTION_TYPE_TO_PROMPT_TYPES));
const SINGLE_SELECT_ITEM_KINDS = Object.freeze({
  attack: 'attack',
  confirm: 'confirm',
  option: 'option',
  'energy-attachment': 'energy'
});

// Action metadata uses actor-relative seats. targetSeat is the owner of the
// targeted object; ownerSeat is reserved for prompt metadata, not actions.
const ACTION_META_BOOLEAN_KEYS = new Set([
  'freeRetreat', 'attackCostPayable', 'stadiumEffectLive', 'stadiumEffectSuppressed',
  'hasUnmodeledModifier', 'abilityLive', 'abilitySuppressed', 'gxAttack',
  'copycatAttack', 'movedFromBenchToActiveThisTurn', 'targetHasWeakness',
  'targetHasResistance', 'hasPrevention', 'toolPresent', 'isFreeRetreat',
  'isLegal', 'pokemonPlayLocked', 'attackLocked', 'canAttack', 'canRetreat',
  'canPlay', 'isPublic', 'isOwnerVisible'
]);
const ACTION_META_REQUIRED_BOOLEAN_KEYS = new Set(['isPublic', 'isOwnerVisible']);
const ACTION_META_NUMBER_KEYS = new Set([
  'damage', 'damageAfterWeakness', 'damageAfterResistance', 'targetHp',
  'targetDamage', 'weaknessValue', 'weaknessMultiplier', 'resistanceValue',
  'damagePrevented', 'damageReduced'
]);
const ACTION_META_INTEGER_KEYS = new Set([
  'targetPrizeCount', 'prizeCount', 'ownPrizeCount', 'opponentPrizeCount',
  'energyCount', 'psychicEnergyCount', 'energyAfterRetreat', 'retreatEnergyCost',
  'stadiumSuppressionTurnsRemaining', 'stadiumAndToolHaveNoEffectTurnsRemaining',
  'deckCount', 'ownDeckCount', 'opponentDeckCount', 'handIndex', 'benchIndex',
  'slotIndex', 'targetIndex', 'sourceIndex', 'paymentCount', 'paymentEnergyCount',
  'choiceIndex', 'prizeLiability', 'turnsRemaining', 'priorAttackTurn',
  'ownerPsychicEnergyCount', 'retreatEnergyCount', 'benchCount', 'ownDeckRemaining',
  'supporterCount', 'itemCount', 'handCount'
]);
const ACTION_META_STRING_KEYS = new Set([
  'stadiumPrinting', 'weaknessType', 'resistanceType', 'sourceZone', 'targetZone',
  'cardType', 'energyType', 'publicReceiptVersion', 'priorAttackName',
  'priorSourcePrinting', 'attackCost', 'abilityName', 'stadiumName',
  'retreatPayment', 'restrictionCode', 'damageCalculation', 'damageText'
]);
const ACTION_META_SEAT_KEYS = new Set(['targetSeat', 'sourceSeat']);
const ACTION_META_TYPED_KEYS = new Set([
  ...ACTION_META_BOOLEAN_KEYS, ...ACTION_META_NUMBER_KEYS,
  ...ACTION_META_INTEGER_KEYS, ...ACTION_META_STRING_KEYS,
  ...ACTION_META_SEAT_KEYS, 'attackSource'
]);

function scalarOrNull(value) {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}
function stringArray(value) {
  if (!Array.isArray(value) || value.length > 2048 ||
      value.some(item => typeof item !== 'string' || item.length > 512)) fail('BAD_STRING_ARRAY');
}
// Native Twinleaf SpecialCondition values are numeric codes 0..4.
// Retain the named form for existing worker/test fixtures, but reject other numbers.
const SPECIAL_CONDITION_NAMES = new Set([
  'PARALYZED', 'CONFUSED', 'ASLEEP', 'POISONED', 'BURNED'
]);
function specialConditionArray(value) {
  if (!Array.isArray(value) || value.length > 2048 ||
      value.some(item => {
        if (typeof item === 'string') return item.length > 32 ||
          !SPECIAL_CONDITION_NAMES.has(item.toUpperCase());
        return !Number.isSafeInteger(item) || item < 0 || item > 4;
      })) fail('BAD_SPECIAL_CONDITION');
}
function validateFlatMetadata(value, allowedKeys, code) {
  if (value === undefined) return;
  if (!isRecord(value)) fail(code);
  exactKeys(value, [], allowedKeys);
  for (const child of Object.values(value)) if (!scalarOrNull(child)) fail(code);
}
function validatePromptMetadata(value, requireSelectionType = false) {
  if (value === undefined) {
    if (requireSelectionType) fail('BAD_PROMPT_SELECTION_TYPE');
    return;
  }
  validateFlatMetadata(value, PROMPT_META_KEYS, 'BAD_PROMPT_METADATA');
  if (value.selectionType !== undefined &&
      !PROMPT_SELECTION_TYPES.has(value.selectionType)) fail('BAD_PROMPT_SELECTION_TYPE');
  if (requireSelectionType &&
      !PROMPT_SELECTION_TYPES.has(value.selectionType)) fail('BAD_PROMPT_SELECTION_TYPE');
  if (value.ownerSeat !== undefined &&
      !['actor', 'opponent', 'mixed', 'actor,opponent'].includes(value.ownerSeat)) {
    fail('BAD_PROMPT_METADATA');
  }
  for (const key of ['isPublic', 'isOwnerVisible', 'allowCancel', 'isSecret', 'eligible']) {
    if (value[key] !== undefined && typeof value[key] !== 'boolean') fail('BAD_PROMPT_METADATA');
  }
  for (const key of ['selectionIndex', 'choiceIndex', 'benchIndex', 'slotIndex']) {
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
const ATTACK_SOURCE_META_KEYS = [
  'sourceKind', 'sourceSlot', 'sourceIndex', 'sourceCardName',
  'sourceCardFullName', 'attackName'
];

function validateAttackSourceMetadata(value) {
  if (!isRecord(value)) fail('BAD_ATTACK_SOURCE_METADATA');
  exactKeys(value, [], ATTACK_SOURCE_META_KEYS);
  const expectedSlot = {
    'active-pokemon': 'ACTIVE',
    'bench-pokemon': 'BENCH',
    'active-tool': 'ACTIVE_TOOL'
  }[value.sourceKind];
  if (!expectedSlot || value.sourceSlot !== expectedSlot ||
      !Number.isSafeInteger(value.sourceIndex) || value.sourceIndex < 0 ||
      value.sourceIndex >= (value.sourceKind === 'bench-pokemon' ? 5 : 1) ||
      typeof value.sourceCardName !== 'string' || value.sourceCardName.length === 0 ||
      value.sourceCardName.length > 512 ||
      typeof value.sourceCardFullName !== 'string' || value.sourceCardFullName.length === 0 ||
      value.sourceCardFullName.length > 512 ||
      typeof value.attackName !== 'string' || value.attackName.length === 0 ||
      value.attackName.length > 512) {
    fail('BAD_ATTACK_SOURCE_METADATA');
  }
  return value;
}

function validateActionMetadata(value) {
  if (value === undefined) return;
  if (!isRecord(value)) fail('BAD_ACTION_METADATA');
  const attackSource = value.attackSource;
  const flatMetadata = { ...value };
  delete flatMetadata.attackSource;
  validateFlatMetadata(flatMetadata,
    ACTION_META_KEYS.filter(key => key !== 'attackSource'), 'BAD_ACTION_METADATA');
  if (attackSource !== undefined) validateAttackSourceMetadata(attackSource);
  if ((value.targetSeat !== undefined || value.targetZone !== undefined ||
      value.targetIndex !== undefined) && typeof value.isOwnerVisible !== 'boolean') {
    fail('BAD_ACTION_METADATA_TYPE');
  }
  for (const key of Object.keys(value)) {
    if (!ACTION_META_TYPED_KEYS.has(key)) fail('UNCLASSIFIED_ACTION_METADATA');
  }
  for (const key of ACTION_META_BOOLEAN_KEYS) {
    if (value[key] === undefined) continue;
    if (ACTION_META_REQUIRED_BOOLEAN_KEYS.has(key)) {
      if (typeof value[key] !== 'boolean') fail('BAD_ACTION_METADATA_TYPE');
    } else if (value[key] !== null && typeof value[key] !== 'boolean') {
      fail('BAD_ACTION_METADATA_TYPE');
    }
  }
  for (const key of ACTION_META_NUMBER_KEYS) {
    if (value[key] !== undefined && value[key] !== null &&
        (typeof value[key] !== 'number' || !Number.isFinite(value[key]))) {
      fail('BAD_ACTION_METADATA_TYPE');
    }
  }
  for (const key of ['handIndex', 'benchIndex', 'slotIndex', 'targetIndex', 'sourceIndex']) {
    if (value[key] !== undefined &&
        (!Number.isSafeInteger(value[key]) || value[key] < 0 || value[key] >= LIMITS.maxArrayItems)) {
      fail('BAD_ACTION_INDEX_METADATA');
    }
  }
  for (const key of ACTION_META_INTEGER_KEYS) {
    if (value[key] !== undefined && value[key] !== null &&
        (!Number.isSafeInteger(value[key]) || value[key] < 0)) {
      fail('BAD_ACTION_METADATA_TYPE');
    }
  }
  for (const key of ACTION_META_STRING_KEYS) {
    if (value[key] !== undefined && value[key] !== null &&
        (typeof value[key] !== 'string' || value[key].length > 512)) {
      fail('BAD_ACTION_METADATA_TYPE');
    }
  }
  for (const key of ACTION_META_SEAT_KEYS) {
    if (value[key] !== undefined && !['actor', 'opponent'].includes(value[key])) {
      fail('BAD_ACTION_SEAT_METADATA');
    }
  }
  return value;
}
const PUBLIC_DAMAGE_EFFECT_FILTERS = new Set(['none', 'unknown', 'all', 'basic', 'evolution']);
function validatePublicDamageEffects(d) {
  const keys = ['prevention','effectsPrevention','reduction','reductionFilter',
    'beforeWeaknessReduction','outgoingReduction','outgoingAfterWeaknessReduction',
    'chancePrevention','chanceAttackFailure'];
  exactKeys(d, keys);
  for (const key of ['prevention','effectsPrevention','reductionFilter']) {
    if (!PUBLIC_DAMAGE_EFFECT_FILTERS.has(d[key])) fail('BAD_PUBLIC_DAMAGE_EFFECT');
  }
  for (const key of ['reduction','beforeWeaknessReduction','outgoingReduction',
    'outgoingAfterWeaknessReduction','chanceAttackFailure']) {
    if (d[key] !== null && (!Number.isSafeInteger(d[key]) || d[key] < 0 || d[key] > 10000))
      fail('BAD_PUBLIC_DAMAGE_EFFECT');
  }
  if (typeof d.chancePrevention !== 'boolean') fail('BAD_PUBLIC_DAMAGE_EFFECT');
}
function validatePokemonSlot(slot, allowConcealed, allowPublicDamageEffects = false) {
  if (slot === null) return;
  if (!isRecord(slot)) fail('BAD_POKEMON_SLOT');
  if (allowConcealed && slot.concealed === true) {
    exactKeys(slot, ['concealed']);
    return;
  }
  exactKeys(slot, POKEMON_KEYS, allowPublicDamageEffects
    ? [...POKEMON_OPTIONAL_KEYS, 'publicDamageEffects'] : POKEMON_OPTIONAL_KEYS);
  if (slot.publicDamageEffects !== undefined) validatePublicDamageEffects(slot.publicDamageEffects);
  if (slot.abilityLockActivationOrder !== undefined &&
      !(slot.abilityLockActivationOrder === null || Number.isSafeInteger(slot.abilityLockActivationOrder))) {
    fail('BAD_ABILITY_LOCK_ACTIVATION_ORDER');
  }
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
  specialConditionArray(slot.specialConditions);
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
  if (slot.abilitySuppressions !== null) {
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
function validatePublicPlayer(player, allowConcealed, allowPublicDamageEffects = false) {
  exactKeys(player, PLAYER_KEYS, ['stadiumDirection']);
  validatePokemonSlot(player.active, allowConcealed, allowPublicDamageEffects);
  if (!Array.isArray(player.bench) || player.bench.length > 10) fail('BAD_BENCH');
  for (const slot of player.bench) validatePokemonSlot(slot, allowConcealed, allowPublicDamageEffects);
  for (const key of ['stadium', 'discard', 'lostZone', 'resolvingSupporter']) stringArray(player[key]);
  if (!(player.stadiumDirection === undefined || player.stadiumDirection === null || player.stadiumDirection === 'up' || player.stadiumDirection === 'down')) fail('BAD_STADIUM_DIRECTION');
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
  for (const key of PLAYER_RESTRICTION_OPTIONAL_KEYS) {
    if (player.publicTurnRestrictions[key] !== undefined &&
        typeof player.publicTurnRestrictions[key] !== 'boolean')
      fail('BAD_PLAYER_RESTRICTION');
  }
  for (const key of ['attackLockTurnsRemaining', 'attackMaxEnergyTurnsRemaining', 'ignoreAttackCostTurnsRemaining']) {
    if (!Number.isSafeInteger(player.publicTurnRestrictions[key]) || player.publicTurnRestrictions[key] < 0) fail('BAD_PLAYER_RESTRICTION');
  }
  if (!(player.publicTurnRestrictions.attackMaxEnergy === null ||
      (Number.isSafeInteger(player.publicTurnRestrictions.attackMaxEnergy) && player.publicTurnRestrictions.attackMaxEnergy >= 0))) fail('BAD_PLAYER_RESTRICTION');
  stringArray(player.publicTurnRestrictions.ignoreAttackCostCardTypes);
  const stadiumSuppression=player.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining;
  if (!(stadiumSuppression===null ||
      (Number.isSafeInteger(stadiumSuppression)&&stadiumSuppression>=0)))
    fail('BAD_STADIUM_SUPPRESSION_EPOCH');
  for (const key of ['handCount', 'deckCount', 'prizeCount']) {
    if (!Number.isSafeInteger(player[key]) || player[key] < 0) fail('BAD_PUBLIC_COUNT');
  }
}
function validatePrizeFacts(k, view, profile) {
  const f=k.prizeFacts;
  if (!profile || k.exactMembershipKnown !== false || k.knownPrintings !== null || k.invalidationReason !== null) fail('BAD_PRIZE_FACTS');
  exactKeys(f,['schema','actorSeat','epoch','turn','prizeCount','fullyPrized']);
  if (f.schema!=='agent46-owner-fully-prized-v1' || f.actorSeat!==view.actorSeat ||
      f.epoch!==k.epoch || f.turn!==view.globalTurn || f.prizeCount!==view.ownPublic.prizeCount ||
      !Array.isArray(f.fullyPrized) || f.fullyPrized.length>f.prizeCount) fail('BAD_PRIZE_FACTS');
  const hood=profile.profileId==='hood-shield-shadow-rider-v1';
  const counts={'Radiant Eternatus':1,'Shadow Rider Calyrex V':4,'Shadow Rider Calyrex VMAX':4,
    'Forest Seal Stone':1,'Hisuian Heavy Ball':1,'Tapu Lele-GX':1,'Latias ex':1,
    "Lillie's Clefairy ex":hood?2:1,'Stealthy Hood':2,
    ...(hood?{'Pokémon Ranger':1}:{'Wobbuffet':1,'Temple of Sinnoh':1})};
  const visible=new Set([...view.ownHand,...view.ownPublic.discard,...view.ownPublic.lostZone,
    ...view.ownPublic.stadium,...view.ownPublic.resolvingSupporter]);
  for(const slot of [view.ownPublic.active,...view.ownPublic.bench]){
    if(!slot)continue;
    for(const card of [slot.printing,...slot.evolutionPrintings,...slot.energies,...slot.tools])visible.add(card);
  }
  const prints={'Radiant Eternatus':'CRZ','Shadow Rider Calyrex V':'CRE','Shadow Rider Calyrex VMAX':'CRE',
    'Forest Seal Stone':'SIT','Hisuian Heavy Ball':'ASR','Tapu Lele-GX':'GRI','Latias ex':'SSP',
    "Lillie's Clefairy ex":'JTG','Stealthy Hood':'UNB','Pokémon Ranger':'STS','Wobbuffet':'PHF','Temple of Sinnoh':'ASR'};
  const seen=new Set();let total=0;
  for (const row of f.fullyPrized) {
    exactKeys(row,['cardName','printing','copies']);
    if (!Object.hasOwn(counts,row.cardName) || counts[row.cardName]!==row.copies ||
        !boundedString(row.printing,null,256) || row.printing!==row.cardName+' '+prints[row.cardName] ||
        seen.has(row.cardName) || visible.has(row.printing)) fail('BAD_PRIZE_FACT_ROW');
    seen.add(row.cardName);total+=row.copies;
  }
  if(total>f.prizeCount) fail('BAD_PRIZE_FACT_COUNT');
}
function validateActorObservation(view, seat, profile = null) {
  exactKeys(view, ACTOR_KEYS, ACTOR_OPTIONAL_KEYS);
  if (view.turnSeat !== undefined &&
      !(view.turnSeat === null || view.turnSeat === 0 || view.turnSeat === 1)) {
    fail('BAD_TURN_SEAT');
  }
  if (view.actorSeat !== seat || !Number.isSafeInteger(view.globalTurn) || view.globalTurn < 0 ||
      !Number.isSafeInteger(view.phase) || view.phase < 0 || !['owner-root', 'owner-prompt'].includes(view.decisionKind) ||
      typeof view.pendingOwnerDeckSearch !== 'boolean') fail('BAD_ACTOR_OBSERVATION');
  if (view.pendingPromptType !== null && !boundedString(view.pendingPromptType, /^[A-Za-z][A-Za-z0-9._-]{0,95}$/)) fail('BAD_PENDING_PROMPT_TYPE');
  if (view.decisionKind === 'owner-root' && (view.pendingPromptType !== null || view.pendingOwnerDeckSearch)) fail('ROOT_HAS_PENDING_PROMPT');
  if (view.decisionKind === 'owner-prompt' && view.pendingPromptType === null) fail('PROMPT_TYPE_MISSING');
  if (view.pendingOwnerDeckSearch && (view.decisionKind !== 'owner-prompt' || view.pendingPromptType !== 'ChooseCardsPrompt')) fail('BAD_OWNER_DECK_SEARCH_FLAG');
  stringArray(view.ownHand);
  const allowPublicDamageEffects = profile !== null;
  validatePublicPlayer(view.ownPublic, false, allowPublicDamageEffects);
  validatePublicPlayer(view.opponentPublic, view.phase === 0 || view.phase === 1, allowPublicDamageEffects);
  exactKeys(view.ownTurnResources, TURN_RESOURCE_KEYS);
  assertBoundedJson(view.ownTurnResources);
  if (view.ownerK1 !== null) {
    exactKeys(view.ownerK1, ['epoch', 'exactMembershipKnown', 'knownPrintings', 'invalidationReason'], profile ? ['prizeFacts'] : []);
    if (Object.hasOwn(view.ownerK1, 'prizeFacts')) validatePrizeFacts(view.ownerK1, view, profile);
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
      const choiceSignatures = new Set();
      for (const row of choices) {
        validateEventAttack(row);
        if (row.gxAttack || row.copycatAttack) fail('INELIGIBLE_COPYCAT_ATTACK');
        const signature = eventAttackSignature(row);
        if (choiceSignatures.has(signature)) fail('DUPLICATE_COPYCAT_CHOICE');
        choiceSignatures.add(signature);
        if (!receipt.opponentLastTurnAttacks.some(attack => eventAttackSignature(attack) === signature)) fail('COPYCAT_CHOICE_NOT_IN_HISTORY');
      }
      if (choices.length === 1) {
        if (choices[0].barragePairIndex !== undefined || choices[0].barragePairRole !== undefined) {
          fail('BAD_SINGLE_COPYCAT_CHOICE');
        }
        const latestEligibleUnpaired = [...receipt.opponentLastTurnAttacks].reverse().find(attack =>
          attack.barragePairIndex === undefined &&
          attack.barragePairRole === undefined &&
          !attack.gxAttack &&
          !attack.copycatAttack
        );
        if (!latestEligibleUnpaired ||
            eventAttackSignature(latestEligibleUnpaired) !== eventAttackSignature(choices[0])) {
          fail('STALE_SINGLE_COPYCAT_CHOICE');
        }
      }
      if (choices.length === 2) {
        const [first, second] = choices;
        const firstHasPair = first.barragePairIndex !== undefined || first.barragePairRole !== undefined;
        const secondHasPair = second.barragePairIndex !== undefined || second.barragePairRole !== undefined;
        if (!firstHasPair || !secondHasPair ||
            first.barragePairIndex !== second.barragePairIndex ||
            first.barragePairRole !== 'first' || second.barragePairRole !== 'second' ||
            first.sourcePrinting !== second.sourcePrinting || first.attackName === second.attackName) {
          fail('BAD_COPYCAT_BARRAGE_PAIR');
        }
        const historyPair = receipt.opponentLastTurnAttacks.filter(
          attack => attack.barragePairIndex === first.barragePairIndex
        );
        const pairIndices = receipt.opponentLastTurnAttacks
          .filter(attack => attack.barragePairIndex !== undefined)
          .map(attack => attack.barragePairIndex);
        const latestPairIndex = pairIndices.length ? Math.max(...pairIndices) : null;
        if (historyPair.length !== 2 ||
            first.barragePairIndex !== latestPairIndex ||
            eventAttackSignature(historyPair[0]) !== eventAttackSignature(first) ||
            eventAttackSignature(historyPair[1]) !== eventAttackSignature(second)) {
          fail('BAD_COPYCAT_BARRAGE_PAIR');
        }
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
  if (message.policyVersion === 'agent46-two-profile-v1') {
    if (message.role !== 'candidate') fail('BAD_POLICY_CONFIG');
    exactKeys(message.config, ['schema','profileId','deckSha256'],['paperAstralBarrageTargets']);
    const profileDecks = {
      'hood-shield-shadow-rider-v1': '1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924',
      'lockbridge-shadow-rider-v1': '011cb8481b473c8566935d6835fc9a2a5762e4f09349f23c8284ec19b0cac642'
    };
    if (message.config.schema !== 'agent46-candidate-profile-v1' ||
        !Object.prototype.hasOwnProperty.call(profileDecks,message.config.profileId) ||
        message.config.deckSha256 !== profileDecks[message.config.profileId] ||
        (Object.prototype.hasOwnProperty.call(message.config,'paperAstralBarrageTargets') &&
          message.config.paperAstralBarrageTargets!=='agent4-cre74-hook-v1')) fail('BAD_POLICY_CONFIG');
  } else {
    exactKeys(message.config, []); // Existing frozen workers retain empty init config.
  }
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
  const expectedItemKind = MULTI_SELECT_ITEM_KINDS[metadata.selectionType];
  if (selectableChoices.some(choice => choice.kind !== expectedItemKind)) {
    fail('BAD_MULTI_SELECT_ITEM_KIND');
  }
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

function singleSelectContract(prompt) {
  const metadata = prompt?.publicMetadata;
  const itemKind = SINGLE_SELECT_ITEM_KINDS[metadata?.selectionType];
  if (!itemKind) return null;
  const allowCancel = metadata.allowCancel === true;
  const cancelChoices = prompt.choices.filter(choice => choice.kind === 'cancel');
  const emptyChoices = prompt.choices.filter(choice => choice.kind === 'empty-selection');
  const selectableChoices = prompt.choices.filter(choice =>
    choice.kind !== 'cancel' && choice.kind !== 'empty-selection');
  if ((allowCancel && cancelChoices.length !== 1) ||
      (!allowCancel && cancelChoices.length !== 0)) fail('BAD_SINGLE_SELECT_CANCEL_CHOICE');
  if (emptyChoices.length !== 0) fail('BAD_SINGLE_SELECT_EMPTY_CHOICE');
  if (selectableChoices.some(choice => choice.kind !== itemKind)) fail('BAD_SINGLE_SELECT_ITEM_KIND');
  if (selectableChoices.length === 0 && !allowCancel) fail('BAD_SINGLE_SELECT_CHOICES');
  return { selectionType: metadata.selectionType, itemKind, allowCancel };
}

function validatePrompt(prompt, seat) {
  if (prompt === null) return null;
  exactKeys(prompt, ['schema', 'actingSeat', 'promptType', 'description', 'source', 'choices', 'publicMetadata']);
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
  const nightWatchEffect = prompt.source.sourceKind === 'card-effect' &&
    prompt.source.sourcePrinting === 'Trevenant & Dusknoir-GX SMP' &&
    prompt.source.effectName === 'Night Watch';
  const copiedNightWatchAttack = prompt.source.sourceKind === 'card-effect' &&
    prompt.source.copiedSourcePrinting === 'Trevenant & Dusknoir-GX SMP' &&
    prompt.source.copiedAttackName === 'Night Watch';
  if (nightWatchEffect || copiedNightWatchAttack) fail('HOST_ONLY_PHYSICAL_PROMPT');
  if (!boundedString(prompt.promptType, /^[A-Za-z][A-Za-z0-9._-]{0,95}$/)) fail('BAD_PROMPT_TYPE');
  validatePromptMetadata(prompt.publicMetadata, true);
  const allowedPromptTypes = PROMPT_SELECTION_TYPE_TO_PROMPT_TYPES[prompt.publicMetadata.selectionType];
  if (!allowedPromptTypes.includes(prompt.promptType)) fail('PROMPT_SELECTION_TYPE_MISMATCH');
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
  multiSelectBounds(prompt);
  singleSelectContract(prompt);
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
  validateActorObservation(message.observation, init.seat,
    init.role === 'candidate' && init.policyVersion === 'agent46-two-profile-v1' ? init.config : null);
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
    } else {
      const single = singleSelectContract(prompt);
      if (!single) fail('UNSUPPORTED_PROMPT_SELECTION_TYPE');
      if (choice.kind === 'cancel') {
        if (!single.allowCancel) fail('CANCEL_NOT_ALLOWED');
      } else if (choice.kind === 'empty-selection') {
        fail('EMPTY_SELECTION_NOT_ALLOWED');
      } else if (choice.kind !== single.itemKind) {
        fail('BAD_SINGLE_SELECT_ITEM_KIND');
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
    if (!isAbstentionReasonCode(decision.reasonCode)) fail('BAD_ABSTENTION_CODE');
    return { kind: 'abstain', reasonCode: decision.reasonCode };
  }
  fail('UNKNOWN_DECISION_KIND');
}


function validatePolicyAudit(policyAudit, request, decision, expectedPolicyVersion) {
  if (policyAudit === null) return null;
  exactKeys(policyAudit, [
    'schema', 'policyVersion', 'decisionKind', 'decisionType',
    'selectionRuleCode', 'tieBreakCode', 'selectedTokens', 'evaluations'
  ]);
  if (policyAudit.schema !== POLICY_AUDIT_SCHEMA) fail('BAD_POLICY_AUDIT_SCHEMA');
  if (policyAudit.policyVersion !== expectedPolicyVersion) fail('POLICY_AUDIT_VERSION_MISMATCH');
  if (policyAudit.decisionKind !== request.observation.decisionKind) fail('POLICY_AUDIT_DECISION_KIND_MISMATCH');
  if (policyAudit.decisionType !== decision.kind) fail('POLICY_AUDIT_DECISION_TYPE_MISMATCH');
  if (!boundedString(policyAudit.selectionRuleCode, /^[A-Z0-9_]{1,64}$/, 64)) fail('BAD_POLICY_AUDIT_SELECTION_RULE');
  if (!boundedString(policyAudit.tieBreakCode, /^[A-Z0-9_]{1,64}$/, 64)) fail('BAD_POLICY_AUDIT_TIE_BREAK');
  if (!Array.isArray(policyAudit.selectedTokens) || policyAudit.selectedTokens.length > 512) fail('BAD_POLICY_AUDIT_SELECTED_TOKENS');
  const expectedSelected = decision.kind === 'select-action' || decision.kind === 'select-choice'
    ? [decision.token]
    : decision.kind === 'select-choices' ? decision.tokens : [];
  if (JSON.stringify(policyAudit.selectedTokens) !== JSON.stringify(expectedSelected)) fail('POLICY_AUDIT_SELECTED_TOKEN_MISMATCH');
  const source = request.prompt ? request.prompt.choices : request.actionFrontier.items;
  if (!Array.isArray(policyAudit.evaluations) || policyAudit.evaluations.length !== source.length) {
    fail('POLICY_AUDIT_FRONTIER_COVERAGE_MISMATCH');
  }
  const expectedTokens = new Set(source.map(item => item.token));
  const seen = new Set();
  for (let index = 0; index < policyAudit.evaluations.length; index += 1) {
    const row = policyAudit.evaluations[index];
    exactKeys(row, ['token', 'status', 'score', 'reasonCode'], ['componentScores']);
    assertToken(row.token);
    if (row.token !== source[index]?.token) fail('POLICY_AUDIT_FRONTIER_ORDER_MISMATCH');
    if (!expectedTokens.has(row.token) || seen.has(row.token)) fail('POLICY_AUDIT_TOKEN_COVERAGE_MISMATCH');
    seen.add(row.token);
    if (!['scored', 'rule-selected', 'not-evaluated'].includes(row.status)) fail('BAD_POLICY_AUDIT_STATUS');
    if (row.status === 'scored') {
      if (typeof row.score !== 'number' || !Number.isFinite(row.score) || row.reasonCode !== null) {
        fail('BAD_POLICY_AUDIT_SCORED_ROW');
      }
    } else {
      if (row.score !== null || !boundedString(row.reasonCode, /^[A-Z0-9_]{1,64}$/, 64)) {
        fail('BAD_POLICY_AUDIT_UNSCORED_ROW');
      }
    }
    if (row.componentScores !== undefined) {
      if (!Array.isArray(row.componentScores) || row.componentScores.length > 8) fail('BAD_POLICY_AUDIT_COMPONENTS');
      const componentNames = new Set();
      for (const component of row.componentScores) {
        exactKeys(component, ['name', 'score', 'reasonCode']);
        if (!boundedString(component.name, /^[a-z][a-z0-9-]{0,31}$/, 32) ||
            componentNames.has(component.name)) fail('BAD_POLICY_AUDIT_COMPONENT_NAME');
        componentNames.add(component.name);
        if (component.score === null) {
          if (!boundedString(component.reasonCode, /^[A-Z0-9_]{1,64}$/, 64)) fail('BAD_POLICY_AUDIT_COMPONENT_REASON');
        } else if (typeof component.score !== 'number' || !Number.isFinite(component.score) ||
            component.reasonCode !== null) {
          fail('BAD_POLICY_AUDIT_COMPONENT_SCORE');
        }
      }
    }
  }
  if (seen.size !== expectedTokens.size) fail('POLICY_AUDIT_FRONTIER_COVERAGE_MISMATCH');
  for (const token of expectedSelected) {
    const row = policyAudit.evaluations.find(item => item.token === token);
    if (!row || !['scored', 'rule-selected'].includes(row.status)) fail('POLICY_AUDIT_SELECTED_ITEM_UNEXPLAINED');
  }
  assertBoundedJson(policyAudit);
  assertNoForbiddenFields(policyAudit);
  return policyAudit;
}

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}


module.exports = {
  INIT_SCHEMA,
  READY_SCHEMA,
  REQUEST_SCHEMA,
  RESPONSE_SCHEMA,
  POLICY_AUDIT_SCHEMA,
  OBSERVATION_SCHEMA,
  PROMPT_SCHEMA,
  EVENT_RECEIPT_VERSION,
  FRONTIER_SCHEMA,
  ABSTENTION_REASON_CODEBOOK_VERSION,
  PUBLIC_ABSTENTION_REASON_CODE,
  ABSTENTION_REASON_CODES,
  isAbstentionReasonCode,
  EXECUTABLE_ACTION_KINDS,
  ANALYSIS_ONLY_ACTION_KINDS,
  MULTI_SELECT_PROMPT_TYPES,
  MULTI_SELECT_ITEM_KINDS,
  LIMITS,
  ProtocolError,
  fail,
  isRecord,
  exactKeys,
  boundedString,
  assertBoundedJson,
  assertNoForbiddenFields,
  ACTOR_KEYS,
  ACTOR_OPTIONAL_KEYS,
  PLAYER_KEYS,
  POKEMON_KEYS,
  POKEMON_OPTIONAL_KEYS,
  PRINTED_KEYS,
  PUBLIC_RESTRICTION_KEYS,
  PLAYER_RESTRICTION_KEYS,
  PLAYER_RESTRICTION_OPTIONAL_KEYS,
  TURN_RESOURCE_KEYS,
  ACTION_META_KEYS,
  PROMPT_META_KEYS,
  scalarOrNull,
  stringArray,
  validateFlatMetadata,
  validatePromptMetadata,
  validateActionMetadata,
  validatePokemonSlot,
  validatePublicPlayer,
  validateActorObservation,
  validateEventPokemon,
  validateEventAttack,
  eventAttackSignature,
  validatePublicEventReceipt,
  assertToken,
  uniqueTokens,
  validateInit,
  multiSelectBounds,
  validatePrompt,
  validateFrontier,
  validateRequest,
  validateDecision,
  validatePolicyAudit,
  deepFreeze
};
