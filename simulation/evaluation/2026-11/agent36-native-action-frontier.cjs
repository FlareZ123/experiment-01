'use strict';

const assert = require('node:assert/strict');
const protocol = require('./agent49-policy-protocol.cjs');

const MAX_ACTION_FRONTIER_ITEMS = 256;

function enumName(enumeration, value) {
  if (!enumeration) return null;
  return Object.keys(enumeration).find(key =>
    !/^\d+$/.test(key) && enumeration[key] === value
  ) ?? null;
}

function cardPrinting(card) {
  return typeof card?.fullName === 'string' && card.fullName.length > 0
    ? card.fullName : null;
}

function slotPokemon(slot) {
  return slot?.getPokemonCard?.() ?? null;
}

function targetProjection(target, state, actorSeat, native) {
  if (!target || typeof target !== 'object') return null;
  const playerType = enumName(native.PlayerType, target.player);
  const slotType = enumName(native.SlotType, target.slot);
  let targetSeat = null;
  if (playerType === 'BOTTOM_PLAYER') targetSeat = actorSeat;
  else if (playerType === 'TOP_PLAYER') targetSeat = 1 - actorSeat;
  if (targetSeat === null || !slotType) return null;

  const targetPlayer = state.players[targetSeat];
  if (!targetPlayer) return null;
  const zoneBySlot = {
    ACTIVE: 'active',
    BENCH: 'bench',
    HAND: 'hand',
    DECK: 'deck',
    DISCARD: 'discard',
    STADIUM: 'stadium',
    PRIZES: 'prizes',
    BOARD: 'board',
    LOST_ZONE: 'lostZone',
    SUPPORTER: 'resolvingSupporter'
  };
  const zone = zoneBySlot[slotType];
  if (!zone) return null;

  const index = Number.isSafeInteger(target.index) && target.index >= 0
    ? target.index : null;
  let visible = false;
  let printing = null;
  let ownerSeat = targetSeat === actorSeat ? 'actor' : 'opponent';

  if (zone === 'active') {
    visible = ownerSeat === 'actor' || !(state.phase === 0 || state.phase === 1);
    if (visible) printing = cardPrinting(slotPokemon(targetPlayer.active));
  } else if (zone === 'bench' && index !== null) {
    const slot = targetPlayer.bench[index];
    visible = Boolean(slot) && (ownerSeat === 'actor' || !(state.phase === 0 || state.phase === 1));
    if (visible) printing = cardPrinting(slotPokemon(slot));
  } else if (zone === 'hand') {
    visible = ownerSeat === 'actor' || targetPlayer.hand?.isPublic === true;
    if (visible && index !== null) printing = cardPrinting(targetPlayer.hand.cards[index]);
  } else if (zone === 'discard') {
    visible = true;
    if (index !== null) printing = cardPrinting(targetPlayer.discard.cards[index]);
  } else if (zone === 'stadium') {
    visible = true;
    if (index !== null) printing = cardPrinting(targetPlayer.stadium.cards[index]);
  } else if (zone === 'lostZone') {
    visible = true;
    if (index !== null) printing = cardPrinting(targetPlayer.lostzone.cards[index]);
  } else if (zone === 'resolvingSupporter') {
    visible = true;
    if (index !== null) printing = cardPrinting(targetPlayer.supporter.cards[index]);
  } else if (zone === 'prizes' && index !== null) {
    const prize = targetPlayer.prizes[index];
    visible = prize?.faceUpPrize === true;
    if (visible && prize.cards.length === 1) printing = cardPrinting(prize.cards[0]);
  }

  const result = {
    targetSeat: ownerSeat,
    targetZone: zone,
    ownerVisible: visible
  };
  if (index !== null && (zone === 'active' || zone === 'bench' ||
      zone === 'discard' || zone === 'stadium' || zone === 'lostZone' ||
      zone === 'resolvingSupporter' || (zone === 'hand' && visible) ||
      (zone === 'prizes' && visible))) {
    result.targetIndex = index;
  }
  if (printing) result.targetPrinting = printing;
  return result;
}

function cardType(card, native) {
  if (native.PokemonCard && card instanceof native.PokemonCard) return 'pokemon';
  if (native.EnergyCard && card instanceof native.EnergyCard) return 'energy';
  if (native.TrainerCard && card instanceof native.TrainerCard) return 'trainer';
  return 'unknown';
}

function actionSignature(action) {
  const target = action.target ?? null;
  return [
    action.type ?? '',
    action.handIndex ?? '',
    action.name ?? '',
    action.benchIndex ?? '',
    target?.player ?? '',
    target?.slot ?? '',
    target?.index ?? ''
  ].join('|');
}

function projectNativeAction(action, state, actorSeat, native, token) {
  const player = state.players[actorSeat];
  const type = action?.type;
  const item = { token, kind: 'unsupported' };
  const metadata = {};
  let actorCard = null;
  let target = null;

  switch (type) {
    case 'PLAY_CARD_ACTION': {
      const card = player.hand.cards[action.handIndex];
      if (!card) return null;
      item.kind = 'play-card';
      item.label = 'Play ' + (card.name || card.fullName);
      const printing = cardPrinting(card);
      if (printing) item.actorPrinting = printing;
      metadata.cardType = cardType(card, native);
      metadata.handIndex = action.handIndex;
      target = targetProjection(action.target, state, actorSeat, native);
      break;
    }
    case 'ATTACK_ACTION': {
      const source = action.__agent3AttackSource;
      const expectedSlot = {
        'active-pokemon': 'ACTIVE',
        'bench-pokemon': 'BENCH',
        'active-tool': 'ACTIVE_TOOL'
      }[source?.sourceKind];
      if (!source || !expectedSlot || source.sourceSlot !== expectedSlot ||
          !Number.isSafeInteger(source.sourceIndex) || source.sourceIndex < 0 ||
          typeof source.sourceCardName !== 'string' || source.sourceCardName.length === 0 ||
          typeof source.sourceCardFullName !== 'string' || source.sourceCardFullName.length === 0 ||
          typeof source.attackName !== 'string' || source.attackName.length === 0 ||
          action.name !== source.attackName) return null;
      item.kind = 'attack';
      item.label = 'Attack ' + source.attackName;
      item.actorPrinting = source.sourceCardFullName;
      item.attackName = source.attackName;
      metadata.attackCostPayable = true;
      metadata.attackSource = {
        sourceKind: source.sourceKind,
        sourceSlot: source.sourceSlot,
        sourceIndex: source.sourceIndex,
        sourceCardName: source.sourceCardName,
        sourceCardFullName: source.sourceCardFullName,
        attackName: source.attackName
      };
      break;
    }
    case 'RETREAT_ACTION': {
      actorCard = slotPokemon(player.active);
      const bench = player.bench[action.benchIndex];
      if (!actorCard || !bench) return null;
      item.kind = 'retreat';
      item.label = 'Retreat to bench ' + (action.benchIndex + 1);
      const actorName = cardPrinting(actorCard);
      const targetName = cardPrinting(slotPokemon(bench));
      if (actorName) item.actorPrinting = actorName;
      if (targetName) item.targetPrinting = targetName;
      metadata.benchIndex = action.benchIndex;
      metadata.targetSeat = 'actor';
      metadata.targetZone = 'bench';
      metadata.targetIndex = action.benchIndex;
      break;
    }
    case 'USE_ABILITY_ACTION':
    case 'USE_TRAINER_ABILITY_ACTION':
    case 'USE_ENERGY_ABILITY_ACTION': {
      target = targetProjection(action.target, state, actorSeat, native);
      if (!target || typeof action.name !== 'string') return null;
      item.kind = 'use-ability';
      item.label = 'Use ability ' + action.name;
      if (target.targetPrinting) item.actorPrinting = target.targetPrinting;
      metadata.abilityName = action.name;
      metadata.sourceZone = target.targetZone;
      metadata.sourceSeat = target.targetSeat;
      if (target.targetIndex !== undefined) metadata.sourceIndex = target.targetIndex;
      break;
    }
    case 'USE_STADIUM_ACTION': {
      const stadium = native.StateUtils?.getStadiumCard?.(state) ??
        player.stadium.cards[0] ?? state.players[1 - actorSeat]?.stadium?.cards?.[0];
      if (!stadium) return null;
      item.kind = 'use-stadium';
      item.label = 'Use stadium effect';
      item.actorPrinting = cardPrinting(stadium);
      break;
    }
    case 'PASS_TURN': {
      item.kind = 'pass';
      item.label = 'Pass turn';
      break;
    }
    default:
      return null;
  }

  if (target) {
    if (target.targetSeat !== undefined) metadata.targetSeat = target.targetSeat;
    if (target.targetZone !== undefined) metadata.targetZone = target.targetZone;
    if (target.targetIndex !== undefined) metadata.targetIndex = target.targetIndex;
    if (target.targetPrinting) item.targetPrinting = target.targetPrinting;
  }
  if (Object.keys(metadata).length) item.publicMetadata = metadata;
  return item;
}

function stateGuard(state) {
  return {
    activePlayer: state.activePlayer,
    phase: state.phase,
    turn: state.turn,
    playerIds: state.players.map(player => player.id),
    promptIds: (state.prompts ?? []).map(prompt => prompt.id ?? prompt.constructor?.name ?? 'prompt')
  };
}

function playCardRejectionFamily(action,state,actorSeat,native){
  if(action?.type!=='PLAY_CARD_ACTION')return null;
  const card=state.players[actorSeat]?.hand?.cards?.[action.handIndex];
  if(native.EnergyCard&&card instanceof native.EnergyCard)return 'ENERGY';
  if(native.TrainerCard&&card instanceof native.TrainerCard){
    const trainerTypes=native.TrainerType??{};
    for(const family of ['SUPPORTER','STADIUM','ITEM','TOOL']){
      if(trainerTypes[family]!==undefined&&card.trainerType===trainerTypes[family])return family;
    }
  }
  return null;
}

const EXPECTED_REJECTIONS=Object.freeze({
  ATTACK_ACTION:new Set([
    'CANNOT_ATTACK_ON_FIRST_TURN','BLOCKED_BY_SPECIAL_CONDITION',
    'BLOCKED_BY_EFFECT','CANNOT_USE_ATTACK','LEEK_SLAP_CANNOT_BE_USED_AGAIN',
    'NOT_ENOUGH_ENERGY'
  ]),
  USE_ABILITY_ACTION:new Set(['CANNOT_USE_POWER','BLOCKED_BY_EFFECT']),
  USE_TRAINER_ABILITY_ACTION:new Set(['CANNOT_USE_POWER','BLOCKED_BY_EFFECT']),
  USE_ENERGY_ABILITY_ACTION:new Set(['CANNOT_USE_POWER','BLOCKED_BY_EFFECT']),
  USE_STADIUM_ACTION:new Set(['STADIUM_ALREADY_USED'])
});

const EXPECTED_PLAY_CARD_REJECTIONS=Object.freeze({
  SUPPORTER:new Set(['CANNOT_PLAY_THIS_CARD','SUPPORTER_ALREADY_PLAYED']),
  STADIUM:new Set(['STADIUM_ALREADY_PLAYED','SAME_STADIUM_ALREADY_IN_PLAY']),
  ENERGY:new Set(['ENERGY_ALREADY_ATTACHED'])
});

function isExpectedActionRejection(action,state,actorSeat,native,error){
  const errorClass=error?.constructor?.name??error?.name;
  if(errorClass!=='GameError'||typeof error.message!=='string')return false;
  if(action?.type==='PLAY_CARD_ACTION'){
    const family=playCardRejectionFamily(action,state,actorSeat,native);
    return EXPECTED_PLAY_CARD_REJECTIONS[family]?.has(error.message)===true;
  }
  return EXPECTED_REJECTIONS[action?.type]?.has(error.message)===true;
}

function buildNativeActionFrontier({
  state,
  actorSeat,
  native,
  enumerator: suppliedEnumerator = null,
  maxItems = MAX_ACTION_FRONTIER_ITEMS
} = {}) {
  assert.ok(state && Array.isArray(state.players) && state.players.length === 2);
  assert.ok(actorSeat === 0 || actorSeat === 1);
  assert.ok(native && typeof native.ActionEnumerator === 'function' &&
    typeof native.Simulator === 'function',
  'pinned ActionEnumerator and Simulator constructors are required');
  assert.ok(Number.isSafeInteger(maxItems) && maxItems > 0 &&
    maxItems <= MAX_ACTION_FRONTIER_ITEMS);
  assert.equal(state.activePlayer, actorSeat,
    'root action frontier must belong to the current active player');
  assert.equal((state.prompts ?? []).some(prompt => prompt.result === undefined), false,
    'root action frontier cannot be built while a prompt is pending');

  const before = stateGuard(state);
  const player = state.players[actorSeat];
  const enumerator = suppliedEnumerator ?? new native.ActionEnumerator();
  assert.ok(enumerator && typeof enumerator.enumerate === 'function',
    'a pinned or explicitly supplied native ActionEnumerator is required');
  const candidates = enumerator.enumerate(state, player, player.id);
  assert.ok(Array.isArray(candidates), 'ActionEnumerator did not return an array');

  const items = [];
  const actionByToken = new Map();
  const seen = new Set();
  let rejectedCount = 0;
  let unsupportedCount = 0;
  let processedCount = 0;
  for (const action of candidates) {
    if (items.length >= maxItems) break;
    processedCount += 1;
    const signature = actionSignature(action);
    if (seen.has(signature)) continue;
    seen.add(signature);
    // Construct the deep-cloned Simulator outside the expected-rejection
    // catch: constructor instability is an engine failure, never an illegal move.
    const simulator = new native.Simulator(state);
    assert.ok(simulator.store&&typeof simulator.store.dispatch==='function',
      'native Simulator did not expose a validation Store');
    try {
      simulator.store.dispatch(action);
    } catch(error) {
      if(!isExpectedActionRejection(action,state,actorSeat,native,error))throw error;
      rejectedCount += 1;
      continue;
    }
    const token = 'act-' + items.length.toString(36);
    const item = projectNativeAction(action, state, actorSeat, native, token);
    if (!item) {
      unsupportedCount += 1;
      continue;
    }
    items.push(item);
    actionByToken.set(token, action);
  }
  assert.deepEqual(stateGuard(state), before,
    'ActionEnumerator or Simulator validation mutated the live Store state');
  assert.ok(items.length > 0, 'No supported legal native actions were enumerated');
  const frontier = Object.freeze({
    schema: protocol.FRONTIER_SCHEMA,
    items: Object.freeze(items.map(item => Object.freeze({
      ...item,
      ...(item.publicMetadata ? {
        publicMetadata: Object.freeze({ ...item.publicMetadata })
      } : {})
    })))
  });
  protocol.validateFrontier(frontier);
  return {
    actionFrontier: frontier,
    actionByToken,
    diagnostics: Object.freeze({
      enumeratedCount: candidates.length,
      deduplicatedCount: seen.size,
      validatedCount: items.length,
      rejectedCount,
      unsupportedCount,
      truncated: processedCount < candidates.length,
      omittedCount: Math.max(0, candidates.length - processedCount)
    })
  };
}

function selectedNativeAction(frontier, token) {
  assert.ok(frontier?.actionByToken instanceof Map,
    'native action token map is required');
  assert.equal(typeof token, 'string');
  const action = frontier.actionByToken.get(token);
  assert.ok(action, 'worker selected an unknown or stale native action token');
  return action;
}

function dispatchSelectedNativeAction({
  store,frontier,token,state,actorSeat,native,withValidationRandom,dispatch=true
}={}){
  assert.ok(store&&typeof store.dispatch==='function');
  assert.ok(actorSeat===0||actorSeat===1);
  assert.equal(typeof withValidationRandom,'function',
    'selected-action revalidation requires an isolated deterministic RNG scope');
  const action=selectedNativeAction(frontier,token);
  assert.equal(action.clientId,state.players[actorSeat].id,
    'worker-selected action belongs to a different physical seat');
  assert.equal(store.state,state,
    'native Store state changed while the worker decision was pending');
  // Only clone validation uses the deterministic stream. Real gameplay dispatch
  // runs after the scope restores the physical RNG.
  withValidationRandom(()=>{
    const simulator=new native.Simulator(state);
    assert.ok(simulator.store&&typeof simulator.store.dispatch==='function',
      'native Simulator did not expose a validation Store');
    simulator.store.dispatch(action);
  });
  return dispatch?store.dispatch(action):action;
}

module.exports = {
  MAX_ACTION_FRONTIER_ITEMS,
  enumName,
  targetProjection,
  cardType,
  actionSignature,
  projectNativeAction,
  buildNativeActionFrontier,
  selectedNativeAction,
  dispatchSelectedNativeAction
};
