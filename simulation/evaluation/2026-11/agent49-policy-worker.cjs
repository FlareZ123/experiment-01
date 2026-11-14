'use strict';

const { once } = require('node:events');

const INIT_SCHEMA = 'aichi-policy-worker-init-v2';
const READY_SCHEMA = 'aichi-policy-worker-ready-v2';
const REQUEST_SCHEMA = 'aichi-policy-request-v2';
const RESPONSE_SCHEMA = 'aichi-policy-response-v2';
const OBSERVATION_SCHEMA = 'aichi-actor-observation-v2';
const PROMPT_SCHEMA = 'aichi-owner-prompt-projection-v2';
const EVENT_SCHEMA = 'aichi-public-event-receipt-v1';
const FRONTIER_SCHEMA = 'aichi-action-frontier-v1';

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
  'benchIndex', 'slotIndex', 'paymentCount', 'paymentEnergyCount', 'cardType',
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
  'sourceCardType', 'selectionType', 'zone', 'ownerSeat'
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
  if (!Array.isArray(slot.specialConditions)) fail('BAD_SPECIAL_CONDITIONS');
  assertBoundedJson(slot.specialConditions);
  exactKeys(slot.publicRestrictions, PUBLIC_RESTRICTION_KEYS);
  assertBoundedJson(slot.publicRestrictions);
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
      if (suppression.suppressed === true && suppression.reasonCode === null) fail('MISSING_ABILITY_SUPPRESSION_REASON');
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
    if (!Number.isSafeInteger(slot.index) || slot.index < 0 ||
        (slot.printing !== undefined && !boundedString(slot.printing, null, 256))) fail('BAD_PRIZE_SLOT');
  }
  exactKeys(player.publicTurnRestrictions, PLAYER_RESTRICTION_KEYS, PLAYER_RESTRICTION_OPTIONAL_KEYS);
  if (player.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining !== undefined &&
      (!Number.isSafeInteger(player.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining) ||
       player.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining < 0)) fail('BAD_STADIUM_SUPPRESSION_EPOCH');
  assertBoundedJson(player.publicTurnRestrictions);
  for (const key of ['handCount', 'deckCount', 'prizeCount']) {
    if (!Number.isSafeInteger(player[key]) || player[key] < 0) fail('BAD_PUBLIC_COUNT');
  }
}
function validateActorObservation(view, seat) {
  exactKeys(view, ACTOR_KEYS);
  if (view.actorSeat !== seat || !Number.isSafeInteger(view.globalTurn) ||
      !Number.isSafeInteger(view.phase) || !['owner-root', 'owner-prompt'].includes(view.decisionKind) ||
      typeof view.pendingOwnerDeckSearch !== 'boolean') fail('BAD_ACTOR_OBSERVATION');
  if (view.pendingPromptType !== null && !boundedString(view.pendingPromptType, /^[A-Za-z][A-Za-z0-9._-]{0,95}$/)) fail('BAD_PENDING_PROMPT_TYPE');
  if (view.decisionKind === 'owner-root' && (view.pendingPromptType !== null || view.pendingOwnerDeckSearch)) fail('ROOT_HAS_PENDING_PROMPT');
  if (view.decisionKind === 'owner-prompt' && view.pendingPromptType === null) fail('PROMPT_TYPE_MISSING');
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
function validateEventPokemon(slot) {
  if (slot === null) return;
  exactKeys(slot, ['printing', 'movedFromBenchToActiveThisTurn', 'knownAbilityUse']);
  if (!boundedString(slot.printing, null, 256) ||
      !(slot.movedFromBenchToActiveThisTurn === null || typeof slot.movedFromBenchToActiveThisTurn === 'boolean') ||
      !Array.isArray(slot.knownAbilityUse)) fail('BAD_EVENT_POKEMON');
  for (const ability of slot.knownAbilityUse) {
    exactKeys(ability, ['name', 'usedThisTurn']);
    if (!boundedString(ability.name, null, 128) ||
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
function validatePublicEventReceipt(receipt, view) {
  if (receipt === null) return;
  exactKeys(receipt, [
    'version', 'actorSeat', 'turn', 'ownerActive', 'ownerBench', 'priorOpponentTurnKO',
    'opponentLastTurnAttack', 'opponentLastTurnTurn', 'opponentLastTurnAttacks'
  ], ['opponentCopycatChoices', 'mimikyuCopycatCompatible']);
  if (receipt.version !== 'agent8-public-event-receipt-v3-turn-stamped' ||
      receipt.actorSeat !== view.actorSeat || receipt.turn !== view.globalTurn) fail('BAD_PUBLIC_EVENT_RECEIPT');
  validateEventPokemon(receipt.ownerActive);
  const viewActivePrinting = view.ownPublic.active === null ? null : view.ownPublic.active.printing;
  const receiptActivePrinting = receipt.ownerActive === null ? null : receipt.ownerActive.printing;
  if (viewActivePrinting !== receiptActivePrinting) fail('EVENT_OWNER_ACTIVE_MISMATCH');
  if (!Array.isArray(receipt.ownerBench) || receipt.ownerBench.length > 10 ||
      receipt.ownerBench.length !== view.ownPublic.bench.length) fail('BAD_EVENT_BENCH');
  for (let i = 0; i < receipt.ownerBench.length; i++) {
    const slot = receipt.ownerBench[i];
    validateEventPokemon(slot);
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
  if (receipt.opponentCopycatChoices !== undefined && receipt.opponentCopycatChoices !== null) {
    if (!Array.isArray(receipt.opponentCopycatChoices) || receipt.opponentCopycatChoices.length > 2) fail('BAD_COPYCAT_CHOICES');
    for (const row of receipt.opponentCopycatChoices) {
      validateEventAttack(row);
      if (!receipt.opponentLastTurnAttacks ||
          !receipt.opponentLastTurnAttacks.some(attack => JSON.stringify(attack) === JSON.stringify(row))) fail('COPYCAT_CHOICE_NOT_IN_HISTORY');
    }
  }
  if (receipt.mimikyuCopycatCompatible !== undefined &&
      !(receipt.mimikyuCopycatCompatible === null || typeof receipt.mimikyuCopycatCompatible === 'boolean')) fail('BAD_COPYCAT_COMPATIBILITY');
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

function validatePrompt(prompt, seat) {
  if (prompt === null) return null;
  exactKeys(prompt, ['schema', 'actingSeat', 'promptType', 'description', 'source', 'choices']);
  if (prompt.schema !== PROMPT_SCHEMA || prompt.actingSeat !== seat) fail('BAD_PROMPT_PROJECTION');
  exactKeys(prompt.source, ['classification', 'sourcePrinting', 'effectName'], ['copiedSourcePrinting', 'copiedAttackName']);
  if (prompt.source.classification !== 'actor-choice') fail('NON_ACTOR_PROMPT_CLASS');
  if (!boundedString(prompt.source.sourcePrinting, null, 256) ||
      !boundedString(prompt.source.effectName, null, 256)) fail('UNKNOWN_PROMPT_SOURCE');
  for (const key of ['sourcePrinting', 'effectName', 'copiedSourcePrinting', 'copiedAttackName']) {
    if (prompt.source[key] !== undefined && prompt.source[key] !== null &&
        !boundedString(prompt.source[key], null, 256)) fail('BAD_PROMPT_SOURCE');
  }
  if (/night\s*watch/i.test(String(prompt.source.effectName ?? '')) ||
      /night\s*watch/i.test(String(prompt.source.copiedAttackName ?? '')) ||
      (prompt.source.effectName === 'Copycat' &&
       prompt.source.copiedSourcePrinting === 'Trevenant & Dusknoir-GX')) fail('HOST_ONLY_PHYSICAL_PROMPT');
  if (!boundedString(prompt.promptType, /^[A-Za-z][A-Za-z0-9._-]{0,95}$/)) fail('BAD_PROMPT_TYPE');
  if (prompt.description !== null && !boundedString(prompt.description, null, 2048)) fail('BAD_PROMPT_DESCRIPTION');
  if (!Array.isArray(prompt.choices) || prompt.choices.length > 512) fail('BAD_PROMPT_CHOICES');
  uniqueTokens(prompt.choices, 'token');
  for (const choice of prompt.choices) {
    exactKeys(choice, ['token', 'kind'], ['printing', 'label', 'publicMetadata']);
    if (!boundedString(choice.kind, /^[A-Za-z][A-Za-z0-9._-]{0,63}$/)) fail('BAD_CHOICE_KIND');
    if (choice.printing !== undefined && !boundedString(choice.printing, null, 256)) fail('BAD_CHOICE_PRINTING');
    if (choice.label !== undefined && !boundedString(choice.label, null, 256)) fail('BAD_CHOICE_LABEL');
    if (choice.publicMetadata !== undefined) validateFlatMetadata(choice.publicMetadata, PROMPT_META_KEYS, 'BAD_PROMPT_METADATA');
  }
  return prompt;
}

function validateFrontier(frontier) {
  exactKeys(frontier, ['schema', 'items']);
  if (frontier.schema !== FRONTIER_SCHEMA) fail('BAD_ACTION_FRONTIER_SCHEMA');
  if (!Array.isArray(frontier.items) || frontier.items.length > 512) fail('BAD_ACTION_FRONTIER');
  const tokens = uniqueTokens(frontier.items, 'token');
  for (const item of frontier.items) {
    exactKeys(item, ['token', 'kind'], ['label', 'actorPrinting', 'targetPrinting', 'attackName', 'publicMetadata']);
    if (!boundedString(item.kind, /^[A-Za-z][A-Za-z0-9._-]{0,63}$/)) fail('BAD_ACTION_KIND');
    for (const key of ['label', 'actorPrinting', 'targetPrinting', 'attackName']) {
      if (item[key] !== undefined && !boundedString(item[key], null, 256)) fail('BAD_ACTION_METADATA');
    }
    if (item.publicMetadata !== undefined) validateFlatMetadata(item.publicMetadata, ACTION_META_KEYS, 'BAD_ACTION_METADATA');
  }
  return tokens;
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
    if (!prompt || !prompt.choices.some(choice => choice.token === decision.token)) {
      fail('POLICY_SELECTED_UNKNOWN_CHOICE');
    }
    return { kind: 'select-choice', token: decision.token };
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
  OBSERVATION_SCHEMA, PROMPT_SCHEMA, EVENT_SCHEMA, FRONTIER_SCHEMA,
  LIMITS, validateInit, validateRequest, validateDecision, validateActorObservation,
  validatePublicEventReceipt, validateFlatMetadata
};
