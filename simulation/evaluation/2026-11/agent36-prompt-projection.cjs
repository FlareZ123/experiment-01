'use strict';

const assert = require('node:assert/strict');
const protocol = require('./agent49-policy-protocol.cjs');
const { enumName, cloneNativeValidationGraph } = require('./agent36-native-action-frontier.cjs');

const MAX_PROMPT_CHOICES = 512;

// Twinleaf a9905a76's ShuffleDeckPrompt.validate() calls Array.sort() without
// a comparator. JavaScript therefore sorts numeric indices lexicographically,
// rejecting valid permutations for decks of 11+ cards. Correct only this
// known pinned validator defect in the research adapter; leave vendor untouched.
const PINNED_SHUFFLE_DECK_VALIDATION_HOOK = Object.freeze({
  engineCommit: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
  id: 'agent12-twinleaf-shuffle-deck-numeric-permutation-validation-v1'
});

function isNumericPermutation(result, expectedLength) {
  if (!Array.isArray(result) || !Number.isSafeInteger(expectedLength) ||
      expectedLength < 0 || result.length !== expectedLength) return false;
  const seen = new Uint8Array(expectedLength);
  for (const value of result) {
    if (!Number.isSafeInteger(value) || value < 0 ||
        value >= expectedLength || seen[value] !== 0) return false;
    seen[value] = 1;
  }
  return true;
}

function printing(card) {
  return typeof card?.fullName === 'string' && card.fullName.length > 0
    ? card.fullName : null;
}

function cardListCards(list) {
  return Array.isArray(list?.cards) ? list.cards : [];
}

function locateCard(state, actorSeat, card) {
  if (!card) return null;
  for (let seat = 0; seat < state.players.length; seat += 1) {
    const player = state.players[seat];
    const zones = [
      ['hand', player.hand, seat === actorSeat || player.hand?.isPublic === true],
      ['deck', player.deck, seat === actorSeat],
      ['discard', player.discard, true],
      ['lostZone', player.lostzone, true],
      ['stadium', player.stadium, true],
      ['supporter', player.supporter, true]
    ];
    for (const [zone, list, visible] of zones) {
      if (cardListCards(list).includes(card)) {
        return { zone, ownerSeat: seat === actorSeat ? 'actor' : 'opponent', visible };
      }
    }
    const slots = [{ zone: 'active', slot: player.active }, ...player.bench.map((slot, index) => ({
      zone: 'bench', slot, index
    }))];
    for (const entry of slots) {
      const slot = entry.slot;
      const lists = [
        ['board', slot?.cards],
        ['energy', slot?.energies?.cards],
        ['tool', slot?.tools]
      ];
      for (const [zone, cards] of lists) {
        if (Array.isArray(cards) && cards.includes(card)) {
          const visible = seat === actorSeat || !(state.phase === 0 || state.phase === 1);
          return {
            zone,
            ownerSeat: seat === actorSeat ? 'actor' : 'opponent',
            visible,
            boardZone: entry.zone,
            slotIndex: entry.index ?? 0
          };
        }
      }
    }
    for (let index = 0; index < (player.prizes ?? []).length; index += 1) {
      const prize = player.prizes[index];
      if (cardListCards(prize).includes(card)) {
        return {
          zone: 'prizes',
          ownerSeat: seat === actorSeat ? 'actor' : 'opponent',
          visible: prize.faceUpPrize === true,
          slotIndex: index
        };
      }
    }
  }
  return null;
}

function cardCollectionVisibility(state, actorSeat, cards) {
  const locations = cards.map(card => locateCard(state, actorSeat, card));
  if (locations.some(location => !location || !location.visible)) {
    throw Object.assign(new Error('Prompt contains a card not visible to the acting player'), {
      code: 'PROMPT_CHOICE_NOT_ACTOR_VISIBLE'
    });
  }
  const zones = [...new Set(locations.map(location => location.zone))];
  const owners = [...new Set(locations.map(location => location.ownerSeat))];
  return {
    sourceZone: zones.length === 1 ? zones[0] : 'mixed',
    ownerSeat: owners.length === 1 ? owners[0] : 'mixed',
    isOwnerVisible: true
  };
}

function combinationCount(n, min, max, cap) {
  const choose = (n, k) => {
    if (k < 0 || k > n) return 0;
    k = Math.min(k, n - k);
    let result = 1;
    for (let i = 1; i <= k; i += 1) {
      result = result * (n - k + i) / i;
      if (result > cap) return cap + 1;
    }
    return Math.round(result);
  };
  let total = 0;
  for (let size = min; size <= max; size += 1) {
    total += choose(n, size);
    if (total > cap) return cap + 1;
  }
  return total;
}

function enumerateCombinations(values, min, max, cap = MAX_PROMPT_CHOICES) {
  assert.ok(Number.isSafeInteger(min) && Number.isSafeInteger(max));
  assert.ok(min >= 0 && max >= min && max <= values.length);
  if (combinationCount(values.length, min, max, cap) > cap) {
    throw Object.assign(new Error('Prompt combination frontier exceeds the bounded choice limit'), {
      code: 'PROMPT_FRONTIER_TOO_LARGE'
    });
  }
  const output = [];
  for (let size = min; size <= max; size += 1) {
    const current = [];
    function visit(start) {
      if (current.length === size) {
        output.push(current.slice());
        return;
      }
      const needed = size - current.length;
      for (let i = start; i <= values.length - needed; i += 1) {
        current.push(values[i]);
        visit(i + 1);
        current.pop();
      }
    }
    visit(0);
  }
  return output;
}

function enumeratePermutations(values, cap = MAX_PROMPT_CHOICES) {
  let count = 1;
  for (let i = 2; i <= values.length; i += 1) {
    count *= i;
    if (count > cap) {
      throw Object.assign(new Error('Prompt ordering frontier exceeds the bounded choice limit'), {
        code: 'PROMPT_FRONTIER_TOO_LARGE'
      });
    }
  }
  const output = [];
  const current = [];
  const used = new Set();
  function visit() {
    if (current.length === values.length) {
      output.push(current.slice());
      return;
    }
    for (const value of values) {
      if (used.has(value)) continue;
      used.add(value);
      current.push(value);
      visit();
      current.pop();
      used.delete(value);
    }
  }
  visit();
  return output;
}

function validateRawPromptResult(prompt, rawResult, state, { enginePin } = {}) {
  try {
    const decoded = typeof prompt.decode === 'function'
      ? prompt.decode(rawResult, state) : rawResult;
    const nativeValidatorResult = typeof prompt.validate === 'function'
      ? prompt.validate(decoded, state) : true;

    if (prompt.constructor?.name === 'ShuffleDeckPrompt' &&
        enginePin === PINNED_SHUFFLE_DECK_VALIDATION_HOOK.engineCommit) {
      const ownerId = prompt.getPerspectivePlayerId?.() ?? prompt.playerId;
      const owner = state.players.find(player => player.id === ownerId);
      const expectedLength = owner?.deck?.cards?.length;
      return {
        valid: owner !== undefined && isNumericPermutation(decoded, expectedLength),
        decoded,
        validatorResult: nativeValidatorResult,
        validationHookId: PINNED_SHUFFLE_DECK_VALIDATION_HOOK.id
      };
    }

    return { valid: nativeValidatorResult !== false, decoded, validatorResult: nativeValidatorResult };
  } catch {
    return { valid: false, decoded: null };
  }
}

function targetPlayerSeat(target, perspectiveSeat, native) {
  const playerType = enumName(native.PlayerType, target.player);
  if (playerType === 'BOTTOM_PLAYER') return perspectiveSeat;
  if (playerType === 'TOP_PLAYER') return 1 - perspectiveSeat;
  return null;
}

function targetChoice(target, state, actorSeat, native) {
  const seat = targetPlayerSeat(target, actorSeat, native);
  const slotName = enumName(native.SlotType, target.slot);
  if (seat === null || !slotName) return null;
  const player = state.players[seat];
  const ownerSeat = seat === actorSeat ? 'actor' : 'opponent';
  let slot = null;
  let zone = null;
  if (slotName === 'ACTIVE') {
    slot = player.active;
    zone = 'active';
  } else if (slotName === 'BENCH') {
    slot = player.bench[target.index];
    zone = 'bench';
  } else {
    return null;
  }
  if (!slot || !slot.cards?.length) return null;
  const visible = ownerSeat === 'actor' || !(state.phase === 0 || state.phase === 1);
  const card = visible ? slot.getPokemonCard?.() : null;
  const name = printing(card);
  const index = slotName === 'ACTIVE' ? 0 : target.index;
  return {
    target: {
      player: target.player,
      slot: target.slot,
      index
    },
    label: (ownerSeat === 'actor' ? 'Your ' : 'Opponent ') +
      (zone === 'active' ? 'active' : 'bench ' + (index + 1)) +
      (name ? ': ' + name : ''),
    printing: name,
    ownerSeat,
    zone,
    index,
    visible
  };
}

function makeSource(prompt, state, actorSeat, provenance, native) {
  // After a genuine KO the pinned check-effect reducer (not the attacking
  // card's reducer) creates CHOOSE_NEW_ACTIVE_POKEMON. This exact shape is
  // an engine decision, not an untrusted missing card-effect provenance.
  const owner=state.players?.[actorSeat];
  const koPromotion=prompt?.constructor?.name==='ChoosePokemonPrompt'&&
    prompt.message==='CHOOSE_NEW_ACTIVE_POKEMON'&&
    state.phase!==0&&state.phase!==1&&
    owner?.id===prompt.playerId&&
    prompt.getPerspectivePlayerId?.()===owner.id&&
    Array.isArray(owner.active?.cards)&&owner.active.cards.length===0&&
    Array.isArray(owner.bench)&&owner.bench.some(slot=>
      Array.isArray(slot?.cards)&&slot.cards.length>0)&&
    prompt.playerType===native?.PlayerType?.BOTTOM_PLAYER&&
    Array.isArray(prompt.slots)&&prompt.slots.length===1&&
    prompt.slots[0]===native?.SlotType?.BENCH&&
    prompt.options?.min===1&&prompt.options?.max===1&&
    prompt.options?.allowCancel===false&&
    Array.isArray(prompt.options.blocked)&&prompt.options.blocked.length===0;
  if(koPromotion)return {
    classification:'actor-choice',sourceKind:'engine',
    sourcePrinting:null,effectName:'CHOOSE_NEW_ACTIVE_POKEMON'
  };
  if(provenance?.sourceKind==='card-effect') {
    const sourceCard=provenance.sourceCard??null;
    const effectName=provenance.effectName;
    if(!sourceCard||typeof effectName!=='string'||!effectName) {
      throw Object.assign(new Error('Card-effect prompt lacks active typed source provenance'), {
        code:'PROMPT_SOURCE_PROVENANCE_INCOMPLETE'
      });
    }
    const location=locateCard(state,actorSeat,sourceCard);
    if(!location?.visible) {
      throw Object.assign(new Error('Prompt source card is not actor-visible'), {
        code:'PROMPT_SOURCE_NOT_ACTOR_VISIBLE'
      });
    }
    const sourcePrinting=printing(sourceCard);
    if(!sourcePrinting) {
      throw Object.assign(new Error('Card-effect prompt source has no printable identity'), {
        code:'PROMPT_SOURCE_PROVENANCE_INCOMPLETE'
      });
    }
    if(effectName==='Copycat') {
      throw Object.assign(new Error('Copycat prompt requires copied-source and copied-attack provenance'), {
        code:'UNSUPPORTED_COPYCAT_PROMPT'
      });
    }
    return {
      classification:'actor-choice',
      sourceKind:'card-effect',
      sourcePrinting,
      effectName
    };
  }
  const promptType=prompt?.constructor?.name??'';
  const message=typeof prompt?.message==='string'?prompt.message:null;
  const engineSetupPrompt=state.phase===1&&(
    (promptType==='ChooseCardsPrompt'&&message==='CHOOSE_STARTING_POKEMONS')||
    (promptType==='ConfirmPrompt'&&message==='GO_FIRST')||
    (promptType==='SelectPrompt'&&message==='WANT_TO_DRAW_CARDS')
  );
  if(engineSetupPrompt) {
    return {
      classification:'actor-choice',
      sourceKind:'engine',
      sourcePrinting:null,
      effectName:message
    };
  }
  throw Object.assign(new Error('Prompt has no trusted card-effect or allowlisted engine source'), {
    code:'PROMPT_SOURCE_PROVENANCE_MISSING'
  });
}

function addChoice(choices, choiceByToken, rawResult, fields, prompt, state) {
  const validation = validateRawPromptResult(prompt, rawResult, state);
  if (!validation.valid) return;
  if (choices.length >= MAX_PROMPT_CHOICES) {
    throw Object.assign(new Error('Prompt choice frontier exceeds the bounded choice limit'), {
      code: 'PROMPT_FRONTIER_TOO_LARGE'
    });
  }
  const token = 'prompt-' + choices.length.toString(36);
  const choice = { token, ...fields };
  choices.push(Object.freeze(choice));
  choiceByToken.set(token, rawResult);
}

function addSelectableItem(choices, choiceByToken, rawItem, fields) {
  if (choices.length >= MAX_PROMPT_CHOICES) {
    throw Object.assign(new Error('Prompt choice frontier exceeds the bounded choice limit'), {
      code: 'PROMPT_FRONTIER_TOO_LARGE'
    });
  }
  const token = 'prompt-' + choices.length.toString(36);
  const choice = { token, ...fields };
  choices.push(Object.freeze(choice));
  choiceByToken.set(token, rawItem);
}

function addEmptySelectionChoice(choices, choiceByToken, prompt, state) {
  addChoice(choices, choiceByToken, [], {
    kind: 'empty-selection',
    label: 'Choose no items'
  }, prompt, state);
}

function addCancelChoice(choices, choiceByToken, prompt, state) {
  if (prompt.options?.allowCancel !== true) return;
  addChoice(choices, choiceByToken, null, {
    kind: 'cancel',
    label: 'Cancel selection'
  }, prompt, state);
}

function projectChooseCards(prompt, state, actorSeat, choices, choiceByToken) {
  const cards = cardListCards(prompt.cards);
  const visibility = cardCollectionVisibility(state, actorSeat, cards);
  const min = Math.max(0, Number.isSafeInteger(prompt.options?.min) ? prompt.options.min : 0);
  const requestedMax = Number.isSafeInteger(prompt.options?.max) ? prompt.options.max : cards.length;
  const blocked = new Set(prompt.options?.blocked ?? []);
  const indices = cards.map((_, index) => index).filter(index => !blocked.has(index));
  const max = Math.min(indices.length, requestedMax);
  for (const index of indices) {
    const name = printing(cards[index]) ?? ('Card ' + (index + 1));
    addSelectableItem(choices, choiceByToken, index, {
      kind: 'card',
      label: name,
      ...(printing(cards[index]) ? { printing: printing(cards[index]) } : {}),
      publicMetadata: {
        selectionIndex: index,
        selectedCount: 1,
        sourceZone: visibility.sourceZone,
        ownerSeat: visibility.ownerSeat,
        isOwnerVisible: visibility.isOwnerVisible
      }
    });
  }
  if (min === 0) addEmptySelectionChoice(choices, choiceByToken, prompt, state);
  addCancelChoice(choices, choiceByToken, prompt, state);
  return {
    sourceZone: visibility.sourceZone,
    ownerSeat: visibility.ownerSeat,
    isOwnerVisible: visibility.isOwnerVisible,
    minimumCount: min,
    maximumCount: max,
    allowCancel: prompt.options?.allowCancel === true,
    isSecret: prompt.options?.isSecret === true,
    selectionType: 'card-combination'
  };
}

function projectChoosePokemon(prompt, state, actorSeat, native, choices, choiceByToken) {
  const perspectiveId = prompt.getPerspectivePlayerId();
  if (state.players[actorSeat].id !== perspectiveId) {
    throw Object.assign(new Error('Prompt board perspective differs from the acting seat'), {
      code: 'PROMPT_PERSPECTIVE_MISMATCH'
    });
  }
  const playerType = enumName(native.PlayerType, prompt.playerType);
  const seats = playerType === 'BOTTOM_PLAYER' ? [actorSeat]
    : playerType === 'TOP_PLAYER' ? [1 - actorSeat] : [actorSeat, 1 - actorSeat];
  const targets = [];
  for (const seat of seats) {
    const relativePlayer = seat === actorSeat
      ? native.PlayerType.BOTTOM_PLAYER : native.PlayerType.TOP_PLAYER;
    for (const slot of prompt.slots) {
      const slotName = enumName(native.SlotType, slot);
      if (slotName === 'ACTIVE') {
        const target = { player: relativePlayer, slot, index: 0 };
        const projected = targetChoice(target, state, actorSeat, native);
        if (projected) targets.push(projected);
      } else if (slotName === 'BENCH') {
        for (let index = 0; index < state.players[seat].bench.length; index += 1) {
          const target = { player: relativePlayer, slot, index };
          const projected = targetChoice(target, state, actorSeat, native);
          if (projected) targets.push(projected);
        }
      }
    }
  }
  const blocked = new Set((prompt.options?.blocked ?? []).map(target =>
    [target.player, target.slot, target.index].join('|')));
  const available = targets.filter(entry =>
    !blocked.has([entry.target.player, entry.target.slot, entry.target.index].join('|')));
  const min = Math.max(0, prompt.options?.min ?? 0);
  const max = Math.min(available.length, prompt.options?.max ?? available.length);
  for (let index = 0; index < available.length; index += 1) {
    const entry = available[index];
    addSelectableItem(choices, choiceByToken, entry.target, {
      kind: 'pokemon',
      label: entry.label,
      ...(entry.printing ? { printing: entry.printing } : {}),
      publicMetadata: {
        selectionIndex: index,
        selectedCount: 1,
        selectionType: 'pokemon',
        ownerSeat: entry.ownerSeat,
        targetZone: entry.zone,
        ...(entry.zone === 'bench' ? { benchIndex: entry.index } : { slotIndex: 0 }),
        isOwnerVisible: entry.visible
      }
    });
  }
  if (min === 0) addEmptySelectionChoice(choices, choiceByToken, prompt, state);
  addCancelChoice(choices, choiceByToken, prompt, state);
  return {
    minimumCount: min,
    maximumCount: max,
    allowCancel: prompt.options?.allowCancel === true,
    isSecret: prompt.options?.isSecret === true,
    selectionType: 'pokemon',
    targetZone: prompt.slots.map(slot => enumName(native.SlotType, slot).toLowerCase()).join(',')
  };
}

function projectChooseEnergy(prompt, state, actorSeat, choices, choiceByToken) {
  const energy = Array.isArray(prompt.energy) ? prompt.energy : [];
  const cards = energy.map(item => item.card);
  const visibility = cardCollectionVisibility(state, actorSeat, cards);
  for (let index = 0; index < energy.length; index += 1) {
    const item = energy[index];
    const types = Array.isArray(item.provides) ? item.provides.join('/') : '';
    const label = (printing(item.card) ?? ('Energy ' + (index + 1))) +
      (types ? ' (' + types + ')' : '');
    addSelectableItem(choices, choiceByToken, index, {
      kind: 'energy',
      label,
      ...(printing(item.card) ? { printing: printing(item.card) } : {}),
      publicMetadata: {
        selectionIndex: index,
        selectedCount: 1,
        sourceZone: visibility.sourceZone,
        ownerSeat: visibility.ownerSeat,
        isOwnerVisible: visibility.isOwnerVisible,
        energyType: types
      }
    });
  }
  addCancelChoice(choices, choiceByToken, prompt, state);
  return {
    count: energy.length,
    energyCount: energy.length,
    energyType: (prompt.cost ?? []).join(','),
    allowCancel: prompt.options?.allowCancel === true,
    selectionType: 'energy-payment'
  };
}

function projectChooseAttack(prompt, state, actorSeat, choices, choiceByToken) {
  const visibility = cardCollectionVisibility(state, actorSeat, prompt.cards ?? []);
  const blocked = new Set((prompt.options?.blocked ?? []).map(item =>
    item.index + '|' + item.attack));
  for (let index = 0; index < (prompt.cards ?? []).length; index += 1) {
    const card = prompt.cards[index];
    for (const attack of card.attacks ?? []) {
      if (blocked.has(index + '|' + attack.name)) continue;
      addChoice(choices, choiceByToken, { index, attack: attack.name }, {
        kind: 'attack',
        label: (printing(card) ?? ('Pokémon ' + (index + 1))) + ' — ' + attack.name,
        ...(printing(card) ? { printing: printing(card) } : {}),
        publicMetadata: {
          choiceIndex: index,
          sourceAttack: attack.name,
          sourceZone: visibility.sourceZone,
          ownerSeat: visibility.ownerSeat,
          isOwnerVisible: visibility.isOwnerVisible
        }
      }, prompt, state);
    }
  }
  addCancelChoice(choices, choiceByToken, prompt, state);
  return {
    count: choices.length,
    allowCancel: prompt.options?.allowCancel === true,
    selectionType: 'attack'
  };
}

function projectChoosePrize(prompt, state, actorSeat, choices, choiceByToken) {
  const perspectiveId = prompt.getPerspectivePlayerId();
  if (state.players[actorSeat].id !== perspectiveId) {
    throw Object.assign(new Error('Prize prompt perspective differs from acting seat'), {
      code: 'PROMPT_PERSPECTIVE_MISMATCH'
    });
  }
  const targetSeat = prompt.options?.useOpponentPrizes ? 1 - actorSeat : actorSeat;
  const player = state.players[targetSeat];
  const nonEmpty = player.prizes.map((prize, originalIndex) => ({ prize, originalIndex }))
    .filter(item => item.prize.cards.length > 0);
  const blocked = new Set(prompt.options?.blocked ?? []);
  const available = nonEmpty.map((item, filteredIndex) => ({ ...item, filteredIndex }))
    .filter(item => !blocked.has(item.filteredIndex));
  const required = Math.min(prompt.options?.count ?? 1, nonEmpty.length);
  for (const item of available) {
    addSelectableItem(choices, choiceByToken, item.filteredIndex, {
      kind: 'prize',
      label: (targetSeat === actorSeat ? 'Your' : 'Opponent') +
        ' Prize slot ' + (item.originalIndex + 1),
      publicMetadata: {
        selectionIndex: item.filteredIndex,
        selectedCount: 1,
        sourceZone: 'prizes',
        ownerSeat: targetSeat === actorSeat ? 'actor' : 'opponent',
        isOwnerVisible: false,
        requiredCount: required
      }
    });
  }
  if (required === 0) addEmptySelectionChoice(choices, choiceByToken, prompt, state);
  addCancelChoice(choices, choiceByToken, prompt, state);
  return {
    count: nonEmpty.length,
    requiredCount: required,
    allowCancel: prompt.options?.allowCancel === true,
    isSecret: prompt.options?.isSecret === true,
    sourceZone: 'prizes',
    ownerSeat: targetSeat === actorSeat ? 'actor' : 'opponent',
    isOwnerVisible: false,
    selectionType: 'prize-slots'
  };
}

function projectSimplePrompt(prompt, state, choices, choiceByToken) {
  if (prompt.constructor?.name === 'ConfirmPrompt') {
    addChoice(choices, choiceByToken, true, { kind: 'confirm', label: 'Yes' }, prompt, state);
    addChoice(choices, choiceByToken, false, { kind: 'confirm', label: 'No' }, prompt, state);
    return { selectionType: 'confirm' };
  }
  if (prompt.constructor?.name === 'SelectPrompt' ||
      prompt.constructor?.name === 'SelectOptionPrompt') {
    const values = Array.isArray(prompt.values) ? prompt.values : [];
    const disabled = prompt.options?.disabled ?? [];
    values.forEach((value, index) => {
      if (disabled[index] === true) return;
      addChoice(choices, choiceByToken, index, {
        kind: 'option',
        label: String(value),
        publicMetadata: { choiceIndex: index }
      }, prompt, state);
    });
    addCancelChoice(choices, choiceByToken, prompt, state);
    return { count: values.length, allowCancel: prompt.options?.allowCancel === true,
      selectionType: 'option' };
  }
  if (prompt.constructor?.name === 'OrderCardsPrompt') {
    const cards = cardListCards(prompt.cards);
    const visibility = cardCollectionVisibility(state, state.players.findIndex(p =>
      p.id === prompt.playerId), cards);
    for (let index = 0; index < cards.length; index += 1) {
      addSelectableItem(choices, choiceByToken, index, {
        kind: 'card-order-item',
        label: printing(cards[index]) ?? ('Card ' + (index + 1)),
        ...(printing(cards[index]) ? { printing: printing(cards[index]) } : {}),
        publicMetadata: {
          selectionIndex: index,
          selectedCount: 1,
          sourceZone: visibility.sourceZone,
          ownerSeat: visibility.ownerSeat,
          isOwnerVisible: visibility.isOwnerVisible
        }
      });
    }
    if (cards.length === 0) addEmptySelectionChoice(choices, choiceByToken, prompt, state);
    addCancelChoice(choices, choiceByToken, prompt, state);
    return { count: cards.length, allowCancel: prompt.options?.allowCancel === true,
      selectionType: 'card-order' };
  }
  return null;
}

function projectRaichuElectroRainDamagePackets({
  prompt,state,actorSeat,native,source,choices,choiceByToken
}) {
  // Pinned UNM57 Electro Rain offers one 30-damage choice for *each
  // Lightning Energy unit*, and permits repeatedly targeting one Pokémon.
  // Each packet/target pair gets a unique opaque token; the worker must
  // return exactly one token from each packet ordinal.
  if(source?.sourceKind!=='card-effect'||
     source.sourcePrinting!=='Alolan Raichu UNM'||
     source.effectName!=='Electro Rain'||
     prompt?.constructor?.name!=='PutDamagePrompt'||
     prompt.message!=='CHOOSE_POKEMON_TO_DAMAGE'||
     prompt.playerType!==native?.PlayerType?.TOP_PLAYER||
     !Array.isArray(prompt.slots)||prompt.slots.length!==2||
     prompt.slots[0]!==native.SlotType.ACTIVE||
     prompt.slots[1]!==native.SlotType.BENCH||
     prompt.options?.allowCancel!==false||
     prompt.options?.damageMultiple!==30||
     prompt.options?.allowPlacePartialDamage!==false||
     !Array.isArray(prompt.options?.blocked)||prompt.options.blocked.length!==0||
     !Number.isSafeInteger(prompt.damage)||prompt.damage<30||
     prompt.damage%30!==0||
     !Array.isArray(prompt.maxAllowedDamage))
    throw Object.assign(new Error('Unsupported pinned Alolan Raichu Electro Rain packet prompt'),
      {code:'UNSUPPORTED_ELECTRO_RAIN_DAMAGE_PROMPT_SHAPE'});
  const count=prompt.damage/30, opponent=state.players[1-actorSeat];
  const targets=[];
  const record=(slot,zone,index,slotType)=>{
    const card=slot?.getPokemonCard?.();
    if(!card)return;
    const to={player:native.PlayerType.TOP_PLAYER,slot:slotType,index};
    if(!prompt.maxAllowedDamage.some(row=>row?.target?.player===to.player&&
      row.target.slot===to.slot&&row.target.index===to.index&&
      Number.isFinite(row.damage)&&row.damage>=30))
      throw Object.assign(new Error('Electro Rain native target declaration is inconsistent'),
        {code:'BAD_ELECTRO_RAIN_DAMAGE_TARGET'});
    targets.push({to,zone,index,printing:printing(card)});
  };
  record(opponent.active,'active',0,native.SlotType.ACTIVE);
  opponent.bench.forEach((slot,index)=>record(slot,'bench',index,native.SlotType.BENCH));
  if(targets.length===0||count*targets.length>MAX_PROMPT_CHOICES)
    throw Object.assign(new Error('Electro Rain packet target frontier is not bounded'),
      {code:'PROMPT_FRONTIER_TOO_LARGE'});
  for(let packet=0;packet<count;packet++){
    for(const target of targets){
      addSelectableItem(choices,choiceByToken,{
        packetIndex:packet,target:{...target.to},damage:30
      },{
        kind:'pokemon',printing:target.printing,
        label:'Electro Rain hit '+(packet+1)+' of '+count+' to '+target.zone+
          (target.zone==='bench'?' '+(target.index+1):'')+': '+target.printing,
        publicMetadata:{
          selectionType:'damage-packets',selectionIndex:packet,
          amount:30,ownerSeat:'opponent',targetZone:target.zone,
          ...(target.zone==='bench'?{benchIndex:target.index}:{slotIndex:0}),
          isOwnerVisible:true
        }
      });
    }
  }
  return {
    selectionType:'damage-packets',minimumCount:count,maximumCount:count,
    amount:prompt.damage,count,ownerSeat:'opponent',isOwnerVisible:true,
    allowCancel:false
  };
}

function projectElectrodeBombTransfers({
  prompt,state,actorSeat,native,source,choices,choiceByToken
}) {
  const actor=state.players[actorSeat];
  // Pinned CES48 initially uses min:0, while the reversible paper rule
  // correction in simulation/twinleaf/electrode-gx-energy-hook.cjs sets
  // min:min(5,available). Both represent this exact same source prompt.
  // The native validator does NOT enforce blockedTo. Our dispatch does.
  assert.ok(typeof native.EnergyCard==='function'&&native.EnergyType&&
    native.PlayerType&&native.SlotType&&native.SuperType,
    'pinned Extra Energy Bomb native bindings missing');
  const energies=cardListCards(actor.discard).map((card,index)=>({card,index}))
    .filter(({card})=>card instanceof native.EnergyCard&&
      card.superType===native.SuperType.ENERGY);
  const mandatory=Math.min(5,energies.length);
  const validSource=source?.sourceKind==='card-effect'&&
    source.sourcePrinting==='Electrode-GX CES'&&
    source.effectName==='Extra Energy Bomb';
  const opt=prompt.options;
  const validShape=validSource&&prompt.message==='ATTACH_ENERGY_CARDS'&&
    prompt.cardList===actor.discard&&
    prompt.playerType===native.PlayerType.BOTTOM_PLAYER&&
    Array.isArray(prompt.slots)&&prompt.slots.length===2&&
    prompt.slots[0]===native.SlotType.BENCH&&
    prompt.slots[1]===native.SlotType.ACTIVE&&
    prompt.filter?.superType===native.SuperType.ENERGY&&
    Object.keys(prompt.filter).length===1&&
    opt?.allowCancel===false&&
    (opt?.min===0||opt?.min===mandatory)&&opt?.max===5&&
    Array.isArray(opt.blockedTo)&&Array.isArray(opt.blocked)&&
    opt.blocked.length===0&&!opt.differentTypes&&!opt.sameTarget&&!opt.differentTargets;
  if(!validShape)throw Object.assign(
    new Error('Unsupported pinned Electrode-GX Extra Energy Bomb prompt shape'),
    {code:'UNSUPPORTED_ELECTRODE_BOMB_PROMPT_SHAPE'});
  const blocked=new Set(opt.blockedTo.map(t=>[t.player,t.slot,t.index].join('|')));
  const targets=[];
  const pushTarget=(slot,slotType,index)=>{
    const card=slot?.getPokemonCard?.();
    if(!card)return;
    const target={player:native.PlayerType.BOTTOM_PLAYER,slot:slotType,index};
    if(blocked.has([target.player,target.slot,target.index].join('|')))return;
    // Redundant printed-name veto, in addition to pinned blockedTo.
    if(/-(?:GX|EX)(?:\s|$)/.test(card.fullName??''))return;
    targets.push({target,card,zone:slotType===native.SlotType.ACTIVE?'active':'bench',index});
  };
  pushTarget(actor.active,native.SlotType.ACTIVE,0);
  actor.bench.forEach((slot,index)=>pushTarget(slot,native.SlotType.BENCH,index));
  if(energies.length===0||targets.length===0)throw Object.assign(
    new Error('No playable public Energy and unblocked recipient for Extra Energy Bomb'),
    {code:'NO_ELIGIBLE_ELECTRODE_BOMB_TRANSFER'});
  if(energies.length*targets.length>MAX_PROMPT_CHOICES)throw Object.assign(
    new Error('Extra Energy Bomb transfer frontier exceeds protocol limit'),
    {code:'PROMPT_FRONTIER_TOO_LARGE'});
  for(const {card,index} of energies){
    const energyPrinting=printing(card);
    if(!energyPrinting)throw Object.assign(
      new Error('Extra Energy Bomb public discard Energy is missing identity'),
      {code:'UNKNOWN_ELECTRODE_BOMB_ENERGY'});
    for(const entry of targets){
      addSelectableItem(choices,choiceByToken,{
        index,to:{...entry.target}
      },{
        kind:'energy',printing:energyPrinting,
        label:'Attach '+energyPrinting+' to '+entry.zone+
          (entry.zone==='bench'?' '+(entry.index+1):'')+
          ': '+(printing(entry.card)??entry.card.name),
        publicMetadata:{
          selectionIndex:index,sourceZone:'discard',ownerSeat:'actor',
          isOwnerVisible:true,selectedCount:1,
          energyType:card.energyType===native.EnergyType.BASIC?'BASIC':'SPECIAL',
          zone:entry.zone,slotIndex:entry.index
        }
      });
    }
  }
  const needed=Math.min(5,energies.length);
  return {
    selectionType:'energy-transfers',count:choices.length,
    minimumCount:needed,maximumCount:needed,allowCancel:false,
    sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true
  };
}


/**
 * Source-specific physical discard frontier for the paper-corrected CES48
 * Crush and Burn-GX. The pinned native DiscardEnergyPrompt enumerates
 * attached Energy cards by actual CardTarget + index within slot.cards;
 * each token must identify one concrete physical occurrence, not a
 * theoretical Lightning unit or a chosen Pokémon.
 */
function projectElectrodeCrushBurnDiscard({
  prompt,state,actorSeat,native,source,choices,choiceByToken
}={}){
  const actor=state.players[actorSeat],opt=prompt.options;
  if(source?.sourceKind!=='card-effect'||
     source.sourcePrinting!=='Electrode-GX CES'||
     source.effectName!=='Crush and Burn-GX')
    throw Object.assign(
      new Error('DiscardEnergyPrompt source is not printed CES48 Crush and Burn-GX'),
      {code:'UNSUPPORTED_GX_DISCARD_PROMPT_SOURCE'});
  const shape=prompt.message==='CHOOSE_ENERGIES_TO_DISCARD'&&
    prompt.playerType===native.PlayerType.BOTTOM_PLAYER&&
    Array.isArray(prompt.slots)&&prompt.slots.length===2&&
    prompt.slots[0]===native.SlotType.ACTIVE&&
    prompt.slots[1]===native.SlotType.BENCH&&
    prompt.filter?.superType===native.SuperType.ENERGY&&
    opt?.allowCancel===false&&opt?.min===1&&
    Number.isSafeInteger(opt.max)&&opt.max>=1&&
    Array.isArray(opt.blockedFrom)&&opt.blockedFrom.length===0&&
    Array.isArray(opt.blockedMap)&&opt.blockedMap.length===0&&
    typeof native.EnergyCard==='function'&&
    Array.isArray(actor.bench);
  if(!shape)throw Object.assign(
    new Error('Pinned CES48 DiscardEnergyPrompt shape changed'),
    {code:'UNSUPPORTED_GX_DISCARD_PROMPT_SHAPE'});
  const list=[];
  const append=(slot,zone,slotType,slotIndex)=>{
    if(!slot?.getPokemonCard?.())return;
    for(let index=0;index<cardListCards(slot).length;index++){
      const card=slot.cards[index];
      if(card instanceof native.EnergyCard&&
         card.superType===native.SuperType.ENERGY)
        list.push({card,index,zone,slotIndex,slotType});
    }
  };
  append(actor.active,'active',native.SlotType.ACTIVE,0);
  actor.bench.forEach((slot,i)=>append(slot,'bench',native.SlotType.BENCH,i));
  if(list.length!==opt.max||list.length<1||list.length>MAX_PROMPT_CHOICES)
    throw Object.assign(
      new Error('CES48 board physical Energy differs from native discard maximum'),
      {code:'GX_DISCARD_PHYSICAL_COUNT_MISMATCH'});
  for(const row of list){
    const name=printing(row.card);
    if(!name)throw Object.assign(
      new Error('CES48 attached Energy printing not public'),
      {code:'GX_DISCARD_ENERGY_PRINTING_MISSING'});
    addSelectableItem(choices,choiceByToken,{
      from:{player:native.PlayerType.BOTTOM_PLAYER,slot:row.slotType,index:row.slotIndex},
      index:row.index
    },{
      kind:'energy',printing:name,
      label:'Discard '+name+' from '+row.zone+
        (row.zone==='bench'?' '+(row.slotIndex+1):''),
      publicMetadata:{
        selectionIndex:row.index,selectedCount:1,
        sourceZone:'energy',zone:row.zone,slotIndex:row.slotIndex,
        ownerSeat:'actor',isOwnerVisible:true
      }
    });
  }
  return {
    selectionType:'energy-payment',
    count:list.length,energyCount:list.length,
    minimumCount:1,maximumCount:list.length,allowCancel:false,
    ownerSeat:'actor',isOwnerVisible:true,sourceZone:'energy'
  };
}

function projectAttachEnergyPrompt({
  prompt,state,actorSeat,native,store,source,choices,choiceByToken
}={}){
  const actor=state.players[actorSeat];
  if(source?.sourceKind==='card-effect'&&
      source.sourcePrinting==='Electrode-GX CES'&&
      source.effectName==='Extra Energy Bomb')
    return projectElectrodeBombTransfers({prompt,state,actorSeat,native,source,choices,choiceByToken});
  const supportedSource=source?.sourceKind==='card-effect'&&
    source.effectName==='Underworld Door'&&
    typeof source.sourcePrinting==='string'&&
    source.sourcePrinting.startsWith('Shadow Rider Calyrex VMAX CRE');
  if(!supportedSource){
    throw Object.assign(new Error('AttachEnergyPrompt is not from the pinned Underworld Door source'),{
      code:'UNSUPPORTED_ATTACH_ENERGY_PROMPT_SOURCE'
    });
  }
  assert.ok(store&&typeof store.reduceEffect==='function',
    'AttachEnergyPrompt projection requires the native Store dynamic-type evaluator');
  assert.ok(typeof native.CheckPokemonTypeEffect==='function'&&
    native.EnergyCard&&native.EnergyType&&native.CardType&&native.SuperType&&
    native.PlayerType&&native.SlotType,
    'pinned AttachEnergyPrompt projection bindings are incomplete');
  const exactPrompt=prompt.message==='ATTACH_ENERGY_TO_BENCH'&&
    prompt.cardList===actor.hand&&
    prompt.playerType===native.PlayerType.BOTTOM_PLAYER&&
    Array.isArray(prompt.slots)&&prompt.slots.length===1&&
    prompt.slots[0]===native.SlotType.BENCH&&
    prompt.filter?.superType===native.SuperType.ENERGY&&
    prompt.filter?.energyType===native.EnergyType.BASIC&&
    prompt.filter?.name==='Psychic Energy'&&
    prompt.options?.min===1&&prompt.options?.max===1;
  if(!exactPrompt){
    throw Object.assign(new Error('AttachEnergyPrompt does not match the pinned Underworld Door contract'),{
      code:'UNSUPPORTED_ATTACH_ENERGY_PROMPT_SHAPE'
    });
  }

  const energies=cardListCards(prompt.cardList).map((card,index)=>({card,index})).filter(entry=>{
    const card=entry.card;
    return card instanceof native.EnergyCard&&
      card.energyType===native.EnergyType.BASIC&&
      card.name==='Psychic Energy'&&
      Array.isArray(card.provides)&&card.provides.includes(native.CardType.PSYCHIC);
  });
  const psychicBench=[];
  for(let index=0;index<actor.bench.length;index++){
    const slot=actor.bench[index];
    const pokemon=slot?.getPokemonCard?.();
    if(!pokemon)continue;
    const effect=new native.CheckPokemonTypeEffect(slot);
    store.reduceEffect(state,effect);
    if(Array.isArray(effect.cardTypes)&&effect.cardTypes.includes(native.CardType.PSYCHIC)){
      psychicBench.push({index,pokemon});
    }
  }
  if(energies.length===0||psychicBench.length===0){
    if(prompt.options?.allowCancel===true){
      addCancelChoice(choices,choiceByToken,prompt,state);
      if(choices.length>0){
        return {
          selectionType:'energy-attachment',
          count:choices.length,
          minimumCount:1,
          maximumCount:1,
          allowCancel:true,
          sourceZone:'hand',
          ownerSeat:'actor',
          isOwnerVisible:true,
          energyType:'BASIC',
          zone:'bench'
        };
      }
      throw Object.assign(new Error('Underworld Door cancel choice failed native prompt validation'),{
        code:'NO_VALID_ATTACH_ENERGY_CHOICES'
      });
    }
    throw Object.assign(new Error('Underworld Door AttachEnergyPrompt has no eligible actor-owned Psychic Energy/Bench assignment'),{
      code:'NO_ELIGIBLE_ATTACH_ENERGY_CHOICES'
    });
  }

  for(const target of psychicBench){
    for(const energyEntry of energies){
      const energy=energyEntry.card;
      const rawResult=[{
        to:{player:native.PlayerType.BOTTOM_PLAYER,slot:native.SlotType.BENCH,index:target.index},
        index:energyEntry.index
      }];
      addChoice(choices,choiceByToken,rawResult,{
        kind:'energy',
        printing:printing(energy)??energy.name,
        label:'Attach '+(printing(energy)??energy.name)+' to Bench '+(target.index+1)+
          ': '+(printing(target.pokemon)??target.pokemon.name??'Psychic Pokemon'),
        publicMetadata:{
          sourceZone:'hand',ownerSeat:'actor',isOwnerVisible:true,
          energyType:'BASIC',zone:'bench',benchIndex:target.index,
          choiceIndex:choices.length,selectedCount:1
        }
      },prompt,state);
    }
  }
  if(prompt.options?.allowCancel===true){
    addCancelChoice(choices,choiceByToken,prompt,state);
  }
  if(choices.length===0){
    throw Object.assign(new Error('No Underworld Door assignment passed native prompt validation'),{
      code:'NO_VALID_ATTACH_ENERGY_CHOICES'
    });
  }
  return {
    selectionType:'energy-attachment',
    count:choices.length,
    minimumCount:1,
    maximumCount:1,
    allowCancel:prompt.options?.allowCancel===true,
    sourceZone:'hand',
    ownerSeat:'actor',
    isOwnerVisible:true,
    energyType:'BASIC',
    zone:'bench'
  };
}

function hostOnlyPrompt(prompt, provenance) {
  const name = prompt?.constructor?.name ?? '';
  if (['CoinFlipPrompt', 'ShuffleDeckPrompt', 'ShuffleHandPrompt', 'WaitPrompt',
    'AlertPrompt', 'ShowCardsPrompt', 'ShowMulliganPrompt'].includes(name)) {
    return { hostOnly: true, reason: name };
  }
  // Night Watch's physical random selection is host-owned only for the exact
  // pinned Trevenant & Dusknoir-GX SMP printing and a typed card-effect source.
  // Prompt messages, prompt types, and free-form effect names are not authority.
  const sourceCard = provenance?.sourceCard;
  if (provenance?.sourceKind === 'card-effect' &&
      provenance.effectName === 'Night Watch' &&
      sourceCard?.name === 'Trevenant & Dusknoir-GX' &&
      sourceCard?.set === 'SMP' &&
      printing(sourceCard) === 'Trevenant & Dusknoir-GX SMP') {
    return { hostOnly: true, reason: 'NightWatchPhysicalRandom' };
  }
  return null;
}

function randomPermutation(length, physicalRandom) {
  assert.ok(Number.isSafeInteger(length) && length >= 0);
  assert.equal(typeof physicalRandom, 'function');
  const values = Array.from({ length }, (_, index) => index);
  for (let i = values.length - 1; i > 0; i -= 1) {
    const sample = physicalRandom();
    assert.ok(Number.isFinite(sample) && sample >= 0 && sample < 1,
      'physical RNG must return a finite value in [0,1)');
    const j = Math.floor(sample * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

function resolveHostOnlyPrompt({
  prompt, state, store, native, physicalRandom, provenanceHook, enginePin, dispatch=true
} = {}) {
  assert.ok(prompt && state && store && native);
  assert.equal(store.state, state, 'native Store state changed before host prompt resolution');
  assert.equal(state.prompts.includes(prompt), true, 'host-only prompt is stale');
  assert.equal(prompt.result, undefined, 'host-only prompt has already been resolved');
  const provenance = provenanceHook?.getPromptProvenance?.(prompt) ?? null;
  const classification = hostOnlyPrompt(prompt, provenance);
  assert.ok(classification?.hostOnly, 'prompt is not classified as host-only');
  const name = prompt.constructor?.name ?? '';
  const ownerId = prompt.getPerspectivePlayerId?.() ?? prompt.playerId;
  const ownerSeat = state.players.findIndex(player => player.id === ownerId);
  let rawResult;
  let summary;

  if (name === 'ShuffleDeckPrompt' || name === 'ShuffleHandPrompt') {
    assert.ok(ownerSeat === 0 || ownerSeat === 1,
      'physical shuffle prompt has no valid owner seat');
    assert.equal(typeof physicalRandom, 'function',
      'physical shuffle prompt requires the host-only physical RNG');
    const owner = state.players[ownerSeat];
    const length = name === 'ShuffleDeckPrompt'
      ? owner.deck.cards.length : owner.prizes.length;
    rawResult = randomPermutation(length, physicalRandom);
    summary = { kind: name, ownerSeat, itemCount: length };
  } else if (name === 'CoinFlipPrompt') {
    assert.equal(typeof physicalRandom, 'function',
      'coin flip prompt requires the host-only physical RNG');
    const sample = physicalRandom();
    assert.ok(Number.isFinite(sample) && sample >= 0 && sample < 1,
      'physical RNG must return a finite value in [0,1)');
    rawResult = sample < 0.5;
    summary = { kind: name, result: rawResult };
  } else if (name === 'WaitPrompt') {
    rawResult = null;
    summary = { kind: name, ownerSeat: ownerSeat === -1 ? null : ownerSeat };
  } else if (name === 'AlertPrompt' || name === 'ShowCardsPrompt' ||
      name === 'ShowMulliganPrompt') {
    rawResult = true;
    summary = { kind: name, acknowledged: true };
  } else if (classification.reason === 'NightWatchPhysicalRandom') {
    assert.equal(typeof physicalRandom, 'function',
      'Night Watch random selection requires the host-only physical RNG');
    const cards = cardListCards(prompt.cards);
    const min = Math.max(0, Number.isSafeInteger(prompt.options?.min) ? prompt.options.min : 1);
    const max = Math.min(cards.length,
      Number.isSafeInteger(prompt.options?.max) ? prompt.options.max : min);
    const blocked = new Set(prompt.options?.blocked ?? []);
    const indices = cards.map((_, index) => index).filter(index => !blocked.has(index));
    const combinations = enumerateCombinations(indices, min, max);
    const legal = combinations.filter(result =>
      validateRawPromptResult(prompt, result, state).valid);
    assert.ok(legal.length > 0, 'Night Watch prompt has no legal random selection');
    const sample = physicalRandom();
    assert.ok(Number.isFinite(sample) && sample >= 0 && sample < 1,
      'physical RNG must return a finite value in [0,1)');
    rawResult = legal[Math.floor(sample * legal.length)];
    summary = { kind: 'NightWatchPhysicalRandom', selectedCount: rawResult.length };
  } else {
    throw Object.assign(new Error('Unsupported host-only prompt: ' + name), {
      code: 'UNSUPPORTED_HOST_ONLY_PROMPT'
    });
  }

  const validation = validateRawPromptResult(prompt, rawResult, state, { enginePin });
  if (validation.validationHookId) {
    summary = {
      ...summary,
      validationHookId: validation.validationHookId,
      nativeValidatorResult: validation.validatorResult ?? null
    };
  }
  assert.equal(validation.valid, true, 'host-selected prompt result failed native validation');
  const action = new native.ResolvePromptAction(prompt.id, validation.decoded);
  const result = dispatch?store.dispatch(action):undefined;
  return {
    result,action,
    summary: Object.freeze(summary),
    rawResult,
    decoded: validation.decoded
  };
}

function projectPrompt({ prompt, state, actorSeat, native, store, provenanceHook } = {}) {
  assert.ok(prompt && state && native);
  assert.ok(actorSeat === 0 || actorSeat === 1);
  const actor = state.players[actorSeat];
  assert.equal(prompt.result, undefined, 'only unresolved prompts may be projected');
  assert.equal(prompt.playerId, actor.id, 'only the prompted actor may receive a prompt projection');
  assert.equal(prompt.getPerspectivePlayerId?.(), actor.id,
    'prompt perspective must match the physical actor');

  const provenance = provenanceHook?.getPromptProvenance?.(prompt) ?? null;
  const hostOnly = hostOnlyPrompt(prompt, provenance);
  if (hostOnly) return { ...hostOnly, choiceByToken: new Map() };

  const source = makeSource(prompt, state, actorSeat, provenance, native);
  const choices = [];
  const choiceByToken = new Map();
  let publicMetadata = null;
  const type = prompt.constructor?.name;

  switch (type) {
    case 'ChooseCardsPrompt':
    case 'NightWatchPrompt':
      publicMetadata = projectChooseCards(prompt, state, actorSeat, choices, choiceByToken);
      break;
    case 'ChoosePokemonPrompt':
      publicMetadata = projectChoosePokemon(prompt, state, actorSeat, native, choices, choiceByToken);
      break;
    case 'ChooseEnergyPrompt':
      publicMetadata = projectChooseEnergy(prompt, state, actorSeat, choices, choiceByToken);
      break;
    case 'ChooseAttackPrompt':
      publicMetadata = projectChooseAttack(prompt, state, actorSeat, choices, choiceByToken);
      break;
    case 'ChoosePrizePrompt':
      publicMetadata = projectChoosePrize(prompt, state, actorSeat, choices, choiceByToken);
      break;
    case 'DiscardEnergyPrompt':
      publicMetadata=projectElectrodeCrushBurnDiscard({
        prompt,state,actorSeat,native,source,choices,choiceByToken
      });
      break;
    case 'AttachEnergyPrompt':
      publicMetadata=projectAttachEnergyPrompt({
        prompt,state,actorSeat,native,store,source,choices,choiceByToken
      });
      break;
    case 'PutDamagePrompt':
      publicMetadata=projectRaichuElectroRainDamagePackets({
        prompt,state,actorSeat,native,source,choices,choiceByToken
      });
      break;
    default:
      publicMetadata = projectSimplePrompt(prompt, state, choices, choiceByToken);
      if (publicMetadata === null) {
        throw Object.assign(new Error('Unsupported native prompt type: ' + type), {
          code: 'UNSUPPORTED_NATIVE_PROMPT'
        });
      }
  }

  assert.ok(choices.length > 0, 'native prompt produced no legal choices');
  const promptProjection = {
    schema: protocol.PROMPT_SCHEMA,
    actingSeat: actorSeat,
    promptType: type,
    description: typeof prompt.message === 'string'
      ? prompt.message : String(prompt.type ?? type),
    source,
    choices: Object.freeze(choices)
  };
  if (publicMetadata && Object.keys(publicMetadata).length) {
    promptProjection.publicMetadata = Object.freeze(publicMetadata);
  }
  const frozen = Object.freeze(promptProjection);
  protocol.validatePrompt(frozen, actorSeat);
  return {
    hostOnly: false,
    promptProjection: frozen,
    choiceByToken,
    diagnostics: Object.freeze({
      promptType: type,
      sourceKind: source.sourceKind,
      sourcePrinting: source.sourcePrinting,
      choiceCount: choices.length,
      selectionType: publicMetadata?.selectionType ?? null
    })
  };
}


function createIsolatedValidationPromptStore({ store, state, prompt, native } = {}) {
  assert.ok(typeof native?.Store === 'function',
    'pinned Twinleaf Store is required for cloned prompt validation');
  assert.ok(Array.isArray(store?.promptItems),
    'live Twinleaf Store prompt continuation queue is unavailable');

  const liveGroups = store.promptItems.map(item => {
    assert.ok(Array.isArray(item?.ids) && item.ids.length > 0,
      'live Twinleaf Store contains an invalid prompt continuation group');
    const ids = item.ids.slice();
    assert.ok(ids.every(Number.isSafeInteger),
      'live Twinleaf Store prompt continuation IDs must be integers');
    assert.equal(new Set(ids).size, ids.length,
      'live Twinleaf Store prompt continuation group contains duplicate IDs');
    return ids;
  });
  const allGroupIds = liveGroups.flat();
  assert.equal(new Set(allGroupIds).size, allGroupIds.length,
    'live Twinleaf Store prompt continuation groups overlap');

  const targetGroupIndex = liveGroups.findIndex(ids => ids.includes(prompt.id));
  assert.notEqual(targetGroupIndex, -1,
    'live Twinleaf Store has no continuation registered for the pending owner prompt');
  const targetPromptIndex = liveGroups[targetGroupIndex].indexOf(prompt.id);

  const detachedState = cloneNativeValidationGraph(state);
  assert.notEqual(detachedState, state,
    'prompt validation seed state must be detached from the live Store');
  assert.notEqual(detachedState.prompts, state.prompts,
    'prompt validation queue must be detached from the live Store');

  const clonedGroups = liveGroups.map(ids => ids.map(id =>
    detachedState.prompts.find(item => item.id === id)));
  assert.ok(clonedGroups.every(group => group.every(item => item)),
    'cloned native state is missing a prompt from a registered continuation group');
  const clonedPrompt = clonedGroups[targetGroupIndex][targetPromptIndex];
  assert.ok(clonedPrompt && clonedPrompt.result === undefined,
    'cloned native Store is missing the unresolved owner prompt');

  const groupedIds = new Set(allGroupIds);
  const promptsBeforeRegistration = detachedState.prompts.length;
  detachedState.prompts = detachedState.prompts.filter(item => !groupedIds.has(item.id));
  assert.equal(promptsBeforeRegistration - detachedState.prompts.length, allGroupIds.length,
    'cloned native state did not contain each registered prompt exactly once');

  const validationStore = new native.Store({ onStateChange() {} });
  validationStore.state = detachedState;
  for (const group of clonedGroups) {
    // The original continuation closes over live game state and must never run
    // during isolated validation. Preserve the native prompt grouping with a
    // no-op continuation instead.
    validationStore.prompt(detachedState, group, () => {});
  }
  assert.equal(validationStore.state, detachedState,
    'prompt-aware validation Store did not retain the detached state');
  assert.ok(Array.isArray(validationStore.promptItems),
    'prompt-aware validation Store did not register native continuations');

  const registeredTargetGroup = validationStore.promptItems.find(item =>
    Array.isArray(item?.ids) && item.ids.includes(clonedPrompt.id));
  assert.ok(registeredTargetGroup,
    'prompt-aware validation Store did not register the target prompt continuation');
  assert.deepEqual(registeredTargetGroup.ids, clonedGroups[targetGroupIndex].map(item => item.id),
    'prompt-aware validation Store changed native prompt-group membership');

  return { store: validationStore, state: detachedState, prompt: clonedPrompt };
}

function dispatchPromptChoice({
  store, prompt, state, actorSeat, projection, decision, token, native, dispatch=true,
  withValidationRandom=null
} = {}) {
  assert.ok(store && typeof store.dispatch === 'function');
  assert.ok(projection?.choiceByToken instanceof Map);
  assert.equal(store.state, state, 'native Store state changed while the prompt decision was pending');
  assert.equal(state.prompts.includes(prompt), true, 'native prompt is stale');
  assert.equal(prompt.result, undefined, 'native prompt has already been resolved');
  assert.equal(prompt.playerId, state.players[actorSeat].id);

  const selected = protocol.validateDecision(
    decision ?? { kind: 'select-choice', token },
    projection.promptProjection,
    new Set()
  );
  assert.ok(selected && typeof selected === 'object', 'worker prompt decision must be typed');
  let rawResult;
  if (selected.kind === 'select-choice') {
    assert.equal(typeof selected.token, 'string');
    assert.ok(projection.choiceByToken.has(selected.token),
      'worker selected an unknown or stale native prompt choice token');
    rawResult = projection.choiceByToken.get(selected.token);
  } else if (selected.kind === 'select-choices') {
    assert.ok(Array.isArray(selected.tokens) && selected.tokens.length > 0,
      'multi-select decision requires a nonempty token array');
    const unique = new Set(selected.tokens);
    assert.equal(unique.size, selected.tokens.length, 'multi-select decision contains duplicate tokens');
    const selectionType = projection.promptProjection?.publicMetadata?.selectionType;
    assert.ok(['card-combination', 'pokemon', 'energy-payment', 'energy-transfers', 'damage-packets', 'prize-slots', 'card-order'].includes(selectionType),
      'multi-select decision is unsupported for this prompt type');
    rawResult = selected.tokens.map(selectedToken => {
      assert.equal(typeof selectedToken, 'string');
      assert.ok(projection.choiceByToken.has(selectedToken),
        'worker selected an unknown or stale native prompt choice token');
      const value = projection.choiceByToken.get(selectedToken);
      assert.notEqual(value, null, 'multi-select cannot include cancellation');
      assert.ok(!Array.isArray(value), 'multi-select item token must map to one native item');
      return value;
    });
  } else {
    throw Object.assign(new Error('Unsupported typed worker prompt decision'), {
      code: 'UNSUPPORTED_WORKER_PROMPT_DECISION'
    });
  }

  // Pinned DiscardEnergyPrompt.decode() checks duplicate card target/index
  // but validate() only checks length. Reject malformed or re-used physical
  // attached Energy references before live Store dispatch.
  if(projection.promptProjection?.promptType==='DiscardEnergyPrompt'){
    const src=projection.promptProjection.source;
    const meta=projection.promptProjection.publicMetadata;
    assert.equal(src.sourceKind,'card-effect');
    assert.equal(src.sourcePrinting,'Electrode-GX CES');
    assert.equal(src.effectName,'Crush and Burn-GX');
    assert.equal(meta.selectionType,'energy-payment');
    const actor=state.players[actorSeat];
    assert.equal(prompt.message,'CHOOSE_ENERGIES_TO_DISCARD');
    assert.equal(prompt.options.allowCancel,false);
    assert.ok(Array.isArray(rawResult)&&rawResult.length>=1);
    assert.ok(rawResult.length<=prompt.options.max);
    const seen=new Set();
    for(const selection of rawResult){
      const from=selection?.from,index=selection?.index;
      assert.equal(from?.player,native.PlayerType.BOTTOM_PLAYER);
      assert.ok(from.slot===native.SlotType.ACTIVE||
        from.slot===native.SlotType.BENCH);
      assert.ok(Number.isSafeInteger(from.index)&&from.index>=0);
      assert.ok(Number.isSafeInteger(index)&&index>=0);
      const slot=from.slot===native.SlotType.ACTIVE?
        actor.active:actor.bench[from.index];
      assert.ok(slot?.getPokemonCard?.());
      const card=slot?.cards?.[index];
      assert.ok(card instanceof native.EnergyCard);
      assert.equal(card.superType,native.SuperType.ENERGY);
      const key=[from.player,from.slot,from.index,index].join('|');
      assert.equal(seen.has(key),false,
        'CES48 GX discard cannot spend one physical Energy twice');
      seen.add(key);
    }
  }

  // The pinned native AttachEnergyPrompt.validate() neither checks duplicate
  // physical card indices nor blockedTo recipients. Reject either before
  // cloned/live Store dispatch; one token represents one physical transfer.
  if(projection.promptProjection?.publicMetadata?.selectionType==='energy-transfers'){
    const source=projection.promptProjection.source;
    assert.equal(source.sourceKind,'card-effect');
    assert.equal(source.sourcePrinting,'Electrode-GX CES');
    assert.equal(source.effectName,'Extra Energy Bomb');
    const actor=state.players[actorSeat];
    assert.equal(prompt.cardList,actor.discard);
    assert.ok(Array.isArray(rawResult)&&rawResult.length>0&&rawResult.length<=5);
    const knownEnergy=cardListCards(actor.discard).filter(card=>
      card instanceof native.EnergyCard&&card.superType===native.SuperType.ENERGY).length;
    assert.equal(rawResult.length,Math.min(5,knownEnergy),
      'Extra Energy Bomb must use distinct physical Energy up to five');
    const used=new Set();
    const blocked=new Set((prompt.options?.blockedTo??[]).map(t=>
      [t.player,t.slot,t.index].join('|')));
    for(const transfer of rawResult){
      const idx=transfer?.index,to=transfer?.to;
      assert.ok(Number.isSafeInteger(idx)&&idx>=0&&idx<actor.discard.cards.length);
      assert.equal(used.has(idx),false,'Extra Energy Bomb cannot reuse the same Energy');
      used.add(idx);
      assert.ok(actor.discard.cards[idx] instanceof native.EnergyCard);
      assert.equal(actor.discard.cards[idx].superType,native.SuperType.ENERGY);
      assert.equal(to?.player,native.PlayerType.BOTTOM_PLAYER);
      assert.ok(to?.slot===native.SlotType.ACTIVE||to?.slot===native.SlotType.BENCH);
      assert.ok(Number.isSafeInteger(to.index)&&to.index>=0);
      assert.equal(blocked.has([to.player,to.slot,to.index].join('|')),false,
        'Extra Energy Bomb target cannot be EX/GX');
      const slot=to.slot===native.SlotType.ACTIVE?actor.active:actor.bench[to.index];
      const target=slot?.getPokemonCard?.();
      assert.ok(target,'Extra Energy Bomb target must remain occupied');
      assert.equal(/-(?:GX|EX)(?:\s|$)/.test(target.fullName??''),false,
        'Extra Energy Bomb cannot attach to printed EX/GX');
    }
  }

  // A multi-choice token identifies one unique 30-damage *packet*, not a
  // freely repeated source. Native PutDamagePrompt.validate() checks only
  // total damage and card-zone validity; enforce exact packet conservation.
  if(projection.promptProjection?.publicMetadata?.selectionType==='damage-packets'){
    const src=projection.promptProjection.source;
    assert.equal(src.sourceKind,'card-effect');
    assert.equal(src.sourcePrinting,'Alolan Raichu UNM');
    assert.equal(src.effectName,'Electro Rain');
    assert.equal(prompt.message,'CHOOSE_POKEMON_TO_DAMAGE');
    assert.ok(Array.isArray(rawResult));
    const expected=prompt.damage/30,used=new Set();
    assert.equal(rawResult.length,expected);
    const foe=state.players[1-actorSeat];
    for(const hit of rawResult){
      assert.equal(hit.damage,30,'Electro Rain packets must each equal 30');
      assert.ok(Number.isSafeInteger(hit.packetIndex)&&
        hit.packetIndex>=0&&hit.packetIndex<expected);
      assert.equal(used.has(hit.packetIndex),false,
        'Electro Rain may not reuse a physical damage packet');
      used.add(hit.packetIndex);
      assert.equal(hit.target?.player,native.PlayerType.TOP_PLAYER);
      assert.ok(hit.target.slot===native.SlotType.ACTIVE||
        hit.target.slot===native.SlotType.BENCH);
      assert.ok(Number.isSafeInteger(hit.target.index)&&hit.target.index>=0);
      const target=hit.target.slot===native.SlotType.ACTIVE?
        foe.active:foe.bench[hit.target.index];
      assert.ok(target?.getPokemonCard?.(),
        'Electro Rain packet target must remain occupied');
      assert.ok(prompt.maxAllowedDamage.some(row=>
        row.target?.player===hit.target.player&&
        row.target.slot===hit.target.slot&&row.target.index===hit.target.index));
    }
    // Only the pinned native schema reaches the Store/decode callback.
    rawResult=rawResult.map(hit=>({
      target:{...hit.target},damage:hit.damage
    }));
  }

  let validationReceipt = null;
  if (typeof withValidationRandom === 'function' &&
      typeof native?.ResolvePromptAction === 'function') {
    assert.ok(typeof native?.Store === 'function',
      'pinned Twinleaf Store is required for cloned prompt validation');
    const originalStateBefore = cloneNativeValidationGraph(state);
    const originalPromptContinuationGroups = store.promptItems?.map(item =>
      Array.isArray(item?.ids) ? item.ids.slice() : null);
    validationReceipt = withValidationRandom(() => {
      const validation = createIsolatedValidationPromptStore({ store, state, prompt, native });
      const clonedState = validation.state;
      const clonedPrompt = validation.prompt;
      assert.equal(clonedPrompt.playerId, clonedState.players[actorSeat].id,
        'cloned owner prompt belongs to a different physical seat');
      const clonedValidation = validateRawPromptResult(clonedPrompt, rawResult, clonedState);
      assert.equal(clonedValidation.valid, true,
        'worker-selected prompt choice failed cloned native decode/validation');
      const clonedAction = new native.ResolvePromptAction(
        clonedPrompt.id, clonedValidation.decoded
      );
      validation.store.dispatch(clonedAction);
      const settledPrompt = validation.store.state.prompts?.find(item =>
        item.id === clonedPrompt.id);
      const clonedPromptResolved = Boolean(settledPrompt && settledPrompt.result !== undefined);
      assert.equal(clonedPromptResolved, true,
        'cloned native Store did not resolve the same pending owner prompt');
      return {
        schema: 'agent6-cloned-store-prompt-validation-v1',
        actorSeat,
        promptId: prompt.id,
        selectedTokens: selected.kind === 'select-choice' ? [selected.token] : selected.tokens.slice(),
        selectedCount: selected.kind === 'select-choice' ? 1 : selected.tokens.length,
        nativeValidationStoreMode: 'cloned-store',
        promptDecodeValidated: true,
        clonedPromptResolved
      };
    });
    assert.deepStrictEqual(state, originalStateBefore,
      'cloned prompt validation mutated the full live Store state graph');
    assert.deepStrictEqual(store.promptItems?.map(item =>
      Array.isArray(item?.ids) ? item.ids : null), originalPromptContinuationGroups,
    'cloned prompt validation mutated the live Store prompt continuation queue');
    validationReceipt.fullOriginalStoreStateUnchanged = true;
  }
  const validation = validateRawPromptResult(prompt, rawResult, state);
  assert.equal(validation.valid, true, 'worker-selected prompt choice failed native decode/validation');
  const action = new native.ResolvePromptAction(prompt.id, validation.decoded);
  const result = dispatch?store.dispatch(action):undefined;
  return { result, action, rawResult, decoded: validation.decoded, validationReceipt };
}

module.exports = {
  MAX_PROMPT_CHOICES,
  locateCard,
  cardCollectionVisibility,
  combinationCount,
  enumerateCombinations,
  enumeratePermutations,
  validateRawPromptResult,
  makeSource,
  hostOnlyPrompt,
  randomPermutation,
  isNumericPermutation,
  PINNED_SHUFFLE_DECK_VALIDATION_HOOK,
  resolveHostOnlyPrompt,
  projectPrompt,
  dispatchPromptChoice
};
