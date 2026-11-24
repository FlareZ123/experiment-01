'use strict';

const assert = require('node:assert/strict');
const protocol = require('./agent49-policy-protocol.cjs');
const { createStoreStateSnapshotter } = require('./agent49-native-fixture-game.cjs');

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

function stadiumEffectIsLive(state) {
  if (!Array.isArray(state?.players) || state.players.length !== 2) return false;
  return state.players.every(player =>
    Number.isSafeInteger(player?.stadiumAndToolHaveNoEffectTurnsRemaining) &&
    player.stadiumAndToolHaveNoEffectTurnsRemaining === 0
  );
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
      metadata.isOwnerVisible = true;
      break;
    }
    case 'USE_ABILITY_ACTION':
    case 'USE_TRAINER_ABILITY_ACTION':
    case 'USE_ENERGY_ABILITY_ACTION': {
      const sourceProjection = targetProjection(action.target, state, actorSeat, native);
      if (!sourceProjection || typeof action.name !== 'string') return null;
      item.kind = 'use-ability';
      item.label = 'Use ability ' + action.name;
      if (sourceProjection.targetPrinting) item.actorPrinting = sourceProjection.targetPrinting;
      metadata.abilityName = action.name;
      metadata.sourceZone = sourceProjection.targetZone;
      metadata.sourceSeat = sourceProjection.targetSeat;
      if (sourceProjection.targetIndex !== undefined) metadata.sourceIndex = sourceProjection.targetIndex;
      break;
    }
    case 'USE_STADIUM_ACTION': {
      if (!stadiumEffectIsLive(state)) return null;
      const stadium = native.StateUtils?.getStadiumCard?.(state) ??
        player.stadium.cards[0] ?? state.players[1 - actorSeat]?.stadium?.cards?.[0];
      if (!stadium) return null;
      item.kind = 'use-stadium';
      item.label = 'Use stadium effect';
      item.actorPrinting = cardPrinting(stadium);
      metadata.stadiumEffectLive = true;
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
    if (target.ownerVisible !== undefined) metadata.isOwnerVisible = target.ownerVisible;
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
  if(native.PokemonCard&&card instanceof native.PokemonCard)return 'POKEMON';
  if(native.EnergyCard&&card instanceof native.EnergyCard)return 'ENERGY';
  if(native.TrainerCard&&card instanceof native.TrainerCard){
    const trainerTypes=native.TrainerType??{};
    for(const family of ['SUPPORTER','STADIUM','ITEM','TOOL']){
      if(trainerTypes[family]!==undefined&&card.trainerType===trainerTypes[family])return family;
    }
  }
  return null;
}

const ITEM_CAN_PLAY_PREFLIGHT_PRINTS=Object.freeze({
  'Battle VIP Pass':Object.freeze({number:'225',setAliases:Object.freeze(['fst','swsh8','fusion strike'])}),
  'VS Seeker':Object.freeze({number:'109',setAliases:Object.freeze(['phf','xy4','phantom forces'])}),
  'Unfair Stamp':Object.freeze({number:'165',setAliases:Object.freeze(['twm','sv6','twilight masquerade'])}),
  'Field Blower':Object.freeze({number:'125',setAliases:Object.freeze(['gri','sm2','guardians rising'])}),
  'Night Stretcher':Object.freeze({number:'61',setAliases:Object.freeze(['sfa','sv6a','shrouded fable'])})
});

function isScopedItemCanPlayPreflightPrinting(card){
  const specification=ITEM_CAN_PLAY_PREFLIGHT_PRINTS[card?.name];
  if(!specification)return false;
  const numbers=[card.number,card.setNumber].filter(value=>value!==undefined&&value!==null)
    .map(value=>String(value));
  if(!numbers.includes(specification.number))return false;
  const setValues=[];
  if(typeof card.set==='string')setValues.push(card.set);
  else if(card.set&&typeof card.set==='object')
    setValues.push(card.set.code,card.set.id,card.set.name);
  setValues.push(card.fullName);
  const normalized=setValues.filter(value=>typeof value==='string'&&value.trim().length>0)
    .map(value=>value.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim());
  return specification.setAliases.some(alias=>normalized.some(value=>
    value===alias||value.split(' ').includes(alias)||value.includes(alias)));
}

function itemCanPlayInValidationStore(action,simulator,actorSeat,native){
  if(action?.type!=='PLAY_CARD_ACTION')return true;
  const validationState=simulator.store.state;
  const validationPlayer=validationState.players[actorSeat];
  const card=validationPlayer?.hand?.cards?.[action.handIndex];
  if(!(native.TrainerCard&&card instanceof native.TrainerCard)||
      card.trainerType!==native.TrainerType.ITEM||
      typeof card.canPlay!=='function'||
      !isScopedItemCanPlayPreflightPrinting(card))return true;
  // Night Stretcher's pinned canPlay accepts Special Energy, but its effect
  // only accepts Pokémon or Basic Energy. Mirror the effect here so an Item
  // that will throw CANNOT_PLAY_THIS_CARD is never offered to a policy.
  if(card.name==='Night Stretcher'){
    return validationPlayer.discard.cards.some(discarded=>
      (native.PokemonCard&&discarded instanceof native.PokemonCard)||
      (native.EnergyCard&&discarded instanceof native.EnergyCard&&
        native.EnergyType&&discarded.energyType===native.EnergyType.BASIC));
  }
  const canPlay=card.canPlay(simulator.store,validationState,validationPlayer);
  // Twinleaf's predicate is tri-state: only explicit false proves that the
  // Item is unplayable. true and undefined must both reach cloned-Store native
  // dispatch, which remains the authoritative legality check.
  return canPlay!==false;
}

// Twinleaf's native enumerator proposes Underworld Door even with no Bench
// or compatible Energy.  The CRE 75 effect can defer CANNOT_USE_POWER until
// its queued WaitPrompt is resolved; clone-dispatch alone is insufficient.
function underworldDoorCanUseInValidationStore(action,simulator,actorSeat,native){
  if(action?.type!=='USE_ABILITY_ACTION'||action.name!=='Underworld Door')return true;
  const validationState=simulator.store.state;
  const source=targetProjection(action.target,validationState,actorSeat,native);
  if(source?.targetSeat!=='actor'||
      source.targetPrinting!=='Shadow Rider Calyrex VMAX CRE')return true;
  const player=validationState.players[actorSeat];
  if(!player?.bench?.some(slot=>slotPokemon(slot)))return false;
  // The pinned CRE75 ability enforces this once-per-turn marker only after
  // its asynchronous WaitPrompt. The clone must exclude a spent source now.
  const sourceSlot=action.target?.slot===native.SlotType?.ACTIVE?player.active:
    action.target?.slot===native.SlotType?.BENCH?player.bench?.[action.target.index]:null;
  const sourcePokemon=slotPokemon(sourceSlot);
  if(sourcePokemon && typeof sourcePokemon.UNDERWORLD_DOOR_MARKER==='string' &&
      typeof player.marker?.hasMarker==='function' &&
      player.marker.hasMarker(sourcePokemon.UNDERWORLD_DOOR_MARKER,sourcePokemon))
    return false;
  return Array.isArray(player.hand?.cards)&&player.hand.cards.some(card=>
    native.EnergyCard&&card instanceof native.EnergyCard&&
    native.EnergyType&&card.energyType===native.EnergyType.BASIC&&
    native.CardType&&Array.isArray(card.provides)&&
    card.provides.includes(native.CardType.PSYCHIC));
}

function resolveFirstAbilityWaitPrompt(simulator,action,native){
  if(action?.type!=='USE_ABILITY_ACTION')return;
  assert.equal(typeof native.WaitPrompt,'function',
    'native WaitPrompt constructor is required for deferred ability validation');
  assert.equal(typeof native.ResolvePromptAction,'function',
    'native ResolvePromptAction constructor is required for deferred ability validation');
  const pendingWaitPrompts=(simulator.store.state.prompts??[]).filter(prompt=>
    prompt instanceof native.WaitPrompt&&prompt.result===undefined);
  if(pendingWaitPrompts.length===0)return;
  assert.equal(pendingWaitPrompts.length,1,
    'a cloned UseAbilityAction must create exactly one pending animation WaitPrompt');
  const pending=pendingWaitPrompts[0];
  assert.equal(pending.message,'Ability animation',
    'only the pinned Ability-animation continuation may be resolved');
  // Resolve only the first engine animation/continuation WaitPrompt. Stop at
  // the first real effect prompt; never auto-select cards or other choices.
  simulator.store.dispatch(new native.ResolvePromptAction(pending.id,null));
}

const EXPECTED_REJECTIONS=Object.freeze({
  ATTACK_ACTION:new Set([
    'CANNOT_ATTACK_ON_FIRST_TURN','BLOCKED_BY_SPECIAL_CONDITION',
    'BLOCKED_BY_EFFECT','CANNOT_USE_ATTACK','LEEK_SLAP_CANNOT_BE_USED_AGAIN',
    'NOT_ENOUGH_ENERGY','LABEL_GX_USED'
  ]),
  RETREAT_ACTION:new Set([
    'BLOCKED_BY_EFFECT','BLOCKED_BY_SPECIAL_CONDITION','NOT_ENOUGH_ENERGY'
  ]),
  USE_ABILITY_ACTION:new Set(['CANNOT_USE_POWER','BLOCKED_BY_EFFECT','POWER_ALREADY_USED','LABEL_VSTAR_USED']),
  USE_TRAINER_ABILITY_ACTION:new Set(['CANNOT_USE_POWER','BLOCKED_BY_EFFECT']),
  USE_ENERGY_ABILITY_ACTION:new Set(['CANNOT_USE_POWER','BLOCKED_BY_EFFECT']),
  USE_STADIUM_ACTION:new Set(['STADIUM_ALREADY_USED','BLOCKED_BY_EFFECT','CANNOT_USE_STADIUM'])
});

const EXPECTED_PLAY_CARD_REJECTIONS=Object.freeze({
  ITEM:new Set(['BLOCKED_BY_EFFECT']),
  SUPPORTER:new Set(['CANNOT_PLAY_THIS_CARD','SUPPORTER_ALREADY_PLAYED','BLOCKED_BY_EFFECT']),
  STADIUM:new Set(['STADIUM_ALREADY_PLAYED','SAME_STADIUM_ALREADY_IN_PLAY','BLOCKED_BY_EFFECT']),
  ENERGY:new Set(['ENERGY_ALREADY_ATTACHED','BLOCKED_BY_EFFECT']),
  TOOL:new Set(['BLOCKED_BY_EFFECT','POKEMON_TOOL_ALREADY_ATTACHED']),
  POKEMON:new Set(['BLOCKED_BY_EFFECT','CANNOT_EVOLVE_ON_YOUR_FIRST_TURN','POKEMON_CANT_EVOLVE_THIS_TURN'])
});

function isExpectedActionRejection(action,state,actorSeat,native,error){
  if(!native?.GameError || !(error instanceof native.GameError) ||
      typeof error.message!=='string')return false;
  if(action?.type==='PLAY_CARD_ACTION'){
    const family=playCardRejectionFamily(action,state,actorSeat,native);
    return EXPECTED_PLAY_CARD_REJECTIONS[family]?.has(error.message)===true;
  }
  return EXPECTED_REJECTIONS[action?.type]?.has(error.message)===true;
}

function copyNativeValidationProperties(source,target,seen,skipKeys=new Set()){
  for(const key of Reflect.ownKeys(source)){
    if(skipKeys.has(key))continue;
    const descriptor=Object.getOwnPropertyDescriptor(source,key);
    if(!descriptor)continue;
    if(Object.hasOwn(descriptor,'value'))
      descriptor.value=cloneNativeValidationGraph(descriptor.value,seen);
    Object.defineProperty(target,key,descriptor);
  }
}

/**
 * Twinleaf's deepClone uses Object.create(source), and Simulator preserves Card
 * instances by reference. That combination can leave a validation Card inheriting
 * mutable properties from the live Card. Clone the graph here with each object's
 * actual class prototype and all own string/symbol properties before Simulator's
 * Card-preserving clone. This is a research-owned adapter, not an upstream patch.
 */
function cloneNativeValidationGraph(value,seen=new Map()){
  if(value===null||typeof value!=='object')return value;
  if(seen.has(value))return seen.get(value);
  if(value instanceof WeakMap||value instanceof WeakSet)
    throw new TypeError('validation state cannot contain weak collections');
  if(typeof SharedArrayBuffer==='function'&&value instanceof SharedArrayBuffer)
    throw new TypeError('validation state cannot contain shared array buffers');
  if(value instanceof Promise)
    throw new TypeError('validation state cannot contain promises');

  if(Buffer.isBuffer(value)){
    const copy=Buffer.from(value);
    seen.set(value,copy);
    return copy;
  }
  if(value instanceof ArrayBuffer){
    const copy=value.slice(0);
    seen.set(value,copy);
    return copy;
  }
  if(ArrayBuffer.isView(value)){
    const buffer=cloneNativeValidationGraph(value.buffer,seen);
    const copy=value instanceof DataView?
      new DataView(buffer,value.byteOffset,value.byteLength):
      new value.constructor(buffer,value.byteOffset,value.length);
    seen.set(value,copy);
    const numericKeys=new Set(Reflect.ownKeys(value).filter(key=>
      typeof key==='string'&&/^(0|[1-9]\d*)$/.test(key)));
    copyNativeValidationProperties(value,copy,seen,numericKeys);
    return copy;
  }
  if(value instanceof Date){
    const copy=new Date(value.getTime());
    seen.set(value,copy);
    copyNativeValidationProperties(value,copy,seen);
    return copy;
  }
  if(value instanceof RegExp){
    const copy=new RegExp(value.source,value.flags);
    copy.lastIndex=value.lastIndex;
    seen.set(value,copy);
    copyNativeValidationProperties(value,copy,seen,new Set(['lastIndex']));
    return copy;
  }
  if(value instanceof Map){
    const copy=new Map();
    seen.set(value,copy);
    for(const [key,item] of value)
      copy.set(cloneNativeValidationGraph(key,seen),cloneNativeValidationGraph(item,seen));
    copyNativeValidationProperties(value,copy,seen);
    return copy;
  }
  if(value instanceof Set){
    const copy=new Set();
    seen.set(value,copy);
    for(const item of value)copy.add(cloneNativeValidationGraph(item,seen));
    copyNativeValidationProperties(value,copy,seen);
    return copy;
  }

  const copy=Array.isArray(value)?new Array(value.length):
    Object.create(Object.getPrototypeOf(value));
  seen.set(value,copy);
  copyNativeValidationProperties(value,copy,seen,new Set(Array.isArray(value)?['length']:[]));
  return copy;
}

function createIsolatedValidationSimulator(state,native){
  const detachedState=cloneNativeValidationGraph(state);
  assert.notEqual(detachedState,state,
    'validation seed state must be detached from the live Store state');
  assert.notEqual(detachedState.players,state.players,
    'validation seed player array must be detached from the live Store state');
  const simulator=new native.Simulator(detachedState);
  assert.ok(simulator.store&&typeof simulator.store.dispatch==='function',
    'native Simulator did not expose a validation Store');
  assert.notEqual(simulator.store.state,state,
    'native Simulator must create a distinct cloned validation state');
  assert.notEqual(simulator.store.state.players,state.players,
    'native Simulator must clone the physical player array for validation');
  return simulator;
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
  const snapshotStoreState = createStoreStateSnapshotter();
  const fullStateBefore = snapshotStoreState(state);
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
  let preflightRejectedCount = 0;
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
    const simulator = createIsolatedValidationSimulator(state,native);
    if(!itemCanPlayInValidationStore(action,simulator,actorSeat,native)||
        !underworldDoorCanUseInValidationStore(action,simulator,actorSeat,native)){
      rejectedCount += 1;
      preflightRejectedCount += 1;
      continue;
    }
    try {
      simulator.store.dispatch(action);
      resolveFirstAbilityWaitPrompt(simulator,action,native);
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
  assert.deepEqual(snapshotStoreState(state), fullStateBefore,
    'ActionEnumerator or Simulator validation mutated the full live Store state graph');
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
    // Host-only baseline and sampler: neither is part of the worker frontier.
    liveStateBaseline: fullStateBefore,
    snapshotLiveState: () => snapshotStoreState(state),
    diagnostics: Object.freeze({
      enumeratedCount: candidates.length,
      deduplicatedCount: seen.size,
      validatedCount: items.length,
      rejectedCount,
      preflightRejectedCount,
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

const SAFE_ACTION_DIAGNOSTIC_TYPES=new Set(['PLAY_CARD_ACTION','ATTACK_ACTION','USE_ABILITY_ACTION','USE_TRAINER_ABILITY_ACTION','USE_ENERGY_ABILITY_ACTION','USE_STADIUM_ACTION','RETREAT_ACTION','PASS_TURN']);
const SAFE_ACTION_DIAGNOSTIC_CARD_FAMILIES=new Set(['ITEM','SUPPORTER','STADIUM','ENERGY','TOOL','POKEMON']);

function attachSafeActionDiagnostic(error,action,state,actorSeat,native){
  if(!native?.GameError||!(error instanceof native.GameError)||
      !error||typeof error!=='object')return;
  const actionType=action?.type;
  if(SAFE_ACTION_DIAGNOSTIC_TYPES.has(actionType))
    error.nativeActionType=actionType;
  if(actionType==='PLAY_CARD_ACTION'){
    const family=playCardRejectionFamily(action,state,actorSeat,native);
    if(SAFE_ACTION_DIAGNOSTIC_CARD_FAMILIES.has(family))
      error.nativeActionFamily=family;
  }
}

function selectedCardPredicateOutcome(action,simulator,actorSeat,native,expectedIdentity){
  if(action?.type!=='PLAY_CARD_ACTION')
    return {applicable:false,outcome:'not-play-card'};
  const state=simulator.store.state;
  const player=state.players?.[actorSeat];
  const card=player?.hand?.cards?.[action.handIndex];
  if(!card)return {applicable:true,outcome:'selected-card-missing'};
  if(expectedIdentity?.fullName&&card.fullName!==expectedIdentity.fullName)
    return {applicable:true,outcome:'selected-card-identity-diverged'};
  const snapshotStoreState=createStoreStateSnapshotter();
  const before=snapshotStoreState(state);
  let applicable=true;
  let outcome;
  try{
    const canPlay=card.canPlay;
    if(typeof canPlay!=='function'){
      applicable=false;
      outcome='no-canPlay';
    }else{
      const result=canPlay.call(card,simulator.store,state,player);
      if(result===false)outcome='false';
      else if(result===true)outcome='true';
      else if(result===undefined)outcome='undefined';
      else if(result===null)outcome='null';
      else if(['string','number','boolean','bigint'].includes(typeof result))
        outcome='value:'+String(result);
      else outcome='other:'+typeof result;
    }
  }catch(error){
    outcome='throw:'+String(error?.message??'');
  }
  if(JSON.stringify(snapshotStoreState(state))!==JSON.stringify(before))
    return {applicable:true,outcome:'predicate-mutated-state'};
  return {applicable,outcome};
}

function dispatchSelectedNativeAction({
  store,frontier,token,state,actorSeat,native,withValidationRandom,dispatch=true,
  validationEvidence=null,selectedCardIdentityForDiagnostic=null
}={}){
  assert.ok(store&&typeof store.dispatch==='function');
  assert.ok(actorSeat===0||actorSeat===1);
  assert.equal(typeof withValidationRandom,'function',
    'selected-action revalidation requires an isolated deterministic RNG scope');
  const action=selectedNativeAction(frontier,token);
  // Twinleaf's PlayCardAction stores the owning player ID as `id`; the other
  // enumerated action classes expose it as `clientId`.
  const actionOwnerId=action?.type==='PLAY_CARD_ACTION'?action.id:action?.clientId;
  assert.equal(actionOwnerId,state.players[actorSeat].id,
    'worker-selected action belongs to a different physical seat');
  assert.equal(store.state,state,
    'native Store state changed while the worker decision was pending');
  if(frontier?.liveStateBaseline!==undefined&&
      typeof frontier.snapshotLiveState==='function'){
    const currentFrontierState=frontier.snapshotLiveState();
    if(JSON.stringify(currentFrontierState)!==JSON.stringify(frontier.liveStateBaseline)){
      const error=new Error('frontier-time live Store state diverged before selected validation');
      error.code='FRONTIER_STATE_DIVERGED';
      throw error;
    }
    if(validationEvidence&&typeof validationEvidence==='object')
      validationEvidence.frontierStateBaselineMatched=true;
  }
  const snapshotStoreState=createStoreStateSnapshotter();
  const fullStateBefore=snapshotStoreState(state);
  // Only clone validation uses the deterministic stream. Real gameplay dispatch
  // runs after the scope restores the physical RNG.
  withValidationRandom(()=>{
    try {
      const simulator=createIsolatedValidationSimulator(state,native);
      assert.ok(simulator.store&&typeof simulator.store.dispatch==='function',
        'native Simulator did not expose a validation Store');
      if(action?.type==='PLAY_CARD_ACTION'){
        const comparisonSimulator=createIsolatedValidationSimulator(state,native);
        assert.notEqual(simulator.store.state,comparisonSimulator.store.state,
          'selected-card predicate comparison requires two fresh validation clones');
        const predicateA=selectedCardPredicateOutcome(
          action,simulator,actorSeat,native,selectedCardIdentityForDiagnostic);
        const predicateB=selectedCardPredicateOutcome(
          action,comparisonSimulator,actorSeat,native,selectedCardIdentityForDiagnostic);
        const invalidPredicateOutcome=new Set([
          'selected-card-missing','selected-card-identity-diverged','predicate-mutated-state'
        ]);
        if(predicateA.applicable!==predicateB.applicable||
            predicateA.outcome!==predicateB.outcome||
            invalidPredicateOutcome.has(predicateA.outcome)||
            invalidPredicateOutcome.has(predicateB.outcome)){
          const error=new Error('selected-card legality predicate diverged across fresh validation clones');
          error.code='CLONE_PREDICATE_DIVERGED';
          throw error;
        }
        if(validationEvidence&&typeof validationEvidence==='object'){
          validationEvidence.selectedCardPredicateCompared=predicateA.applicable===true;
          validationEvidence.selectedCardPredicateStableAcrossClones=predicateA.applicable===true;
          validationEvidence.selectedCardPredicateApplicable=predicateA.applicable===true;
        }
      }else if(validationEvidence&&typeof validationEvidence==='object'){
        validationEvidence.selectedCardPredicateCompared=false;
        validationEvidence.selectedCardPredicateStableAcrossClones=false;
        validationEvidence.selectedCardPredicateApplicable=false;
      }
      assert.notEqual(simulator.store,store,
        'selected-action validation must use a distinct native Store');
      assert.notEqual(simulator.store.state,state,
        'selected-action validation must use a cloned native Store state');
      assert.notEqual(simulator.store.state.players,state.players,
        'selected-action validation must use cloned physical player state');
      assert.equal(simulator.store.state.players?.[actorSeat]?.id,state.players[actorSeat]?.id,
        'cloned validation Store must preserve the acting physical player');
      try{
        simulator.store.dispatch(action);
        resolveFirstAbilityWaitPrompt(simulator,action,native);
      }catch(error){
        if(action?.type==='PLAY_CARD_ACTION'&&native?.GameError&&
            error instanceof native.GameError&&
            typeof native?.GameMessage?.CANNOT_PLAY_THIS_CARD==='string'&&
            error?.message===native.GameMessage.CANNOT_PLAY_THIS_CARD&&
            validationEvidence?.selectedCardPredicateCompared===true&&
            validationEvidence?.selectedCardPredicateStableAcrossClones===true&&
            error&&typeof error==='object')
          error.code='PREDICATE_STABLE_DISPATCH_FAILED';
        attachSafeActionDiagnostic(error,action,state,actorSeat,native);
        throw error;
      }
      if(validationEvidence&&typeof validationEvidence==='object') {
        const selectedItem=frontier.actionFrontier.items.find(item=>item.token===token);
        validationEvidence.nativeValidationStoreMode='cloned-store';
        validationEvidence.selectedActionValidated=true;
        validationEvidence.actorSeat=actorSeat;
        validationEvidence.selectedToken=token;
        validationEvidence.actionKind=selectedItem?.kind??null;
        validationEvidence.frontierItemCount=frontier.actionFrontier.items.length;
      }
    } finally {
      assert.deepEqual(snapshotStoreState(state),fullStateBefore,
        'selected-action validation mutated the full live Store state graph');
      if(validationEvidence&&typeof validationEvidence==='object')
        validationEvidence.fullOriginalStoreStateUnchanged=true;
    }
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
  cloneNativeValidationGraph,
  createIsolatedValidationSimulator,
  selectedNativeAction,
  dispatchSelectedNativeAction
};
