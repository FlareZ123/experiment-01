'use strict';

const assert = require('node:assert/strict');
const protocol = require('./agent49-policy-worker.cjs');
const { enumName } = require('./agent36-native-action-frontier.cjs');

const MAX_PROMPT_CHOICES = 512;

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

function validateRawPromptResult(prompt, rawResult, state) {
  try {
    const decoded = typeof prompt.decode === 'function'
      ? prompt.decode(rawResult, state) : rawResult;
    const valid = typeof prompt.validate === 'function'
      ? prompt.validate(decoded, state) : true;
    return { valid: valid !== false, decoded };
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

function makeSource(prompt, state, actorSeat, provenance) {
  const sourceCard = provenance?.sourceCard ?? prompt.sourceCard ?? null;
  if (sourceCard) {
    const location = locateCard(state, actorSeat, sourceCard);
    if (!location?.visible) {
      throw Object.assign(new Error('Prompt source card is not actor-visible'), {
        code: 'PROMPT_SOURCE_NOT_ACTOR_VISIBLE'
      });
    }
    const sourcePrinting = printing(sourceCard);
    const effectName = provenance?.effectName ?? sourceCard.name ?? sourceCard.fullName;
    if (!sourcePrinting || typeof effectName !== 'string' || !effectName) {
      throw Object.assign(new Error('Card-effect prompt lacks typed source provenance'), {
        code: 'PROMPT_SOURCE_PROVENANCE_INCOMPLETE'
      });
    }
    if (effectName === 'Copycat') {
      throw Object.assign(new Error('Copycat prompt requires copied-source and copied-attack provenance'), {
        code: 'UNSUPPORTED_COPYCAT_PROMPT'
      });
    }
    return {
      classification: 'actor-choice',
      sourceKind: 'card-effect',
      sourcePrinting,
      effectName
    };
  }
  if (state.phase === 0 || state.phase === 1) {
    return {
      classification: 'actor-choice',
      sourceKind: 'engine',
      sourcePrinting: null,
      effectName: prompt.constructor?.name ?? 'EngineSetupPrompt'
    };
  }
  throw Object.assign(new Error('Prompt has no trusted card-effect or engine source'), {
    code: 'PROMPT_SOURCE_PROVENANCE_MISSING'
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
  const max = Math.min(cards.length,
    Number.isSafeInteger(prompt.options?.max) ? prompt.options.max : cards.length);
  const indices = cards.map((_, index) => index)
    .filter(index => !(prompt.options?.blocked ?? []).includes(index));
  const combinations = enumerateCombinations(indices, min, max);
  for (const selected of combinations) {
    const names = selected.map(index => printing(cards[index]) ?? ('Card ' + (index + 1)));
    addChoice(choices, choiceByToken, selected, {
      kind: selected.length > 1 ? 'card-set' : 'card',
      label: selected.length ? names.join(' + ') : 'Choose no cards',
      ...(selected.length === 1 && printing(cards[selected[0]])
        ? { printing: printing(cards[selected[0]]) } : {}),
      publicMetadata: {
        selectionIndex: choices.length,
        selectedCount: selected.length,
        sourceZone: visibility.sourceZone,
        ownerSeat: visibility.ownerSeat,
        isOwnerVisible: visibility.isOwnerVisible
      }
    }, prompt, state);
  }
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
  const combinations = enumerateCombinations(available.map((_, index) => index), min, max);
  for (const selected of combinations) {
    const raw = selected.map(index => available[index].target);
    const labels = selected.map(index => available[index].label);
    const printings = selected.map(index => available[index].printing).filter(Boolean);
    addChoice(choices, choiceByToken, raw, {
      kind: selected.length > 1 ? 'pokemon-set' : 'pokemon',
      label: labels.length ? labels.join(' + ') : 'Choose no Pokémon',
      ...(printings.length === 1 && selected.length === 1 ? { printing: printings[0] } : {}),
      publicMetadata: {
        selectionIndex: choices.length,
        selectedCount: selected.length,
        selectionType: 'pokemon',
        ownerSeat: [...new Set(selected.map(index => available[index].ownerSeat))].join(',') || 'mixed',
        targetZone: [...new Set(selected.map(index => available[index].zone))].join(',') || 'board',
        isOwnerVisible: selected.every(index => available[index].visible)
      }
    }, prompt, state);
  }
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
  const indices = energy.map((_, index) => index);
  const combinations = enumerateCombinations(indices, 1, indices.length);
  for (const selected of combinations) {
    const names = selected.map(index => {
      const item = energy[index];
      const types = Array.isArray(item.provides) ? item.provides.join('/') : '';
      return (printing(item.card) ?? ('Energy ' + (index + 1))) +
        (types ? ' (' + types + ')' : '');
    });
    addChoice(choices, choiceByToken, selected, {
      kind: selected.length > 1 ? 'energy-set' : 'energy',
      label: names.join(' + '),
      ...(selected.length === 1 && printing(energy[selected[0]].card)
        ? { printing: printing(energy[selected[0]].card) } : {}),
      publicMetadata: {
        selectionIndex: choices.length,
        selectedCount: selected.length,
        sourceZone: visibility.sourceZone,
        ownerSeat: visibility.ownerSeat,
        isOwnerVisible: visibility.isOwnerVisible,
        energyType: selected.map(index => energy[index].provides.join('/')).join(',')
      }
    }, prompt, state);
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
  const combinations = enumerateCombinations(
    available.map(item => item.filteredIndex), required, required
  );
  for (const selected of combinations) {
    const labels = selected.map(index => {
      const item = nonEmpty[index];
      return (targetSeat === actorSeat ? 'Your' : 'Opponent') +
        ' Prize slot ' + (item.originalIndex + 1);
    });
    addChoice(choices, choiceByToken, selected, {
      kind: selected.length > 1 ? 'prize-set' : 'prize',
      label: labels.join(' + '),
      publicMetadata: {
        selectionIndex: choices.length,
        selectedCount: selected.length,
        sourceZone: 'prizes',
        ownerSeat: targetSeat === actorSeat ? 'actor' : 'opponent',
        isOwnerVisible: false,
        requiredCount: required
      }
    }, prompt, state);
  }
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
    const permutations = enumeratePermutations(cards.map((_, index) => index));
    for (const order of permutations) {
      const label = order.map(index => printing(cards[index]) ?? ('Card ' + (index + 1))).join(' → ');
      addChoice(choices, choiceByToken, order, {
        kind: 'card-order',
        label,
        publicMetadata: {
          selectionIndex: choices.length,
          selectedCount: order.length,
          sourceZone: visibility.sourceZone,
          ownerSeat: visibility.ownerSeat,
          isOwnerVisible: visibility.isOwnerVisible
        }
      }, prompt, state);
    }
    addCancelChoice(choices, choiceByToken, prompt, state);
    return { count: cards.length, allowCancel: prompt.options?.allowCancel === true,
      selectionType: 'card-order' };
  }
  return null;
}

function hostOnlyPrompt(prompt, provenance) {
  const name = prompt?.constructor?.name ?? '';
  if (['CoinFlipPrompt', 'ShuffleDeckPrompt', 'ShuffleHandPrompt', 'WaitPrompt',
    'AlertPrompt', 'ShowCardsPrompt', 'ShowMulliganPrompt', 'InvitePlayerPrompt'].includes(name)) {
    return { hostOnly: true, reason: name };
  }
  const sourceName = provenance?.effectName ?? prompt?.message ?? prompt?.type ?? '';
  if (/night\s*watch/i.test(String(sourceName))) {
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
  prompt, state, store, native, physicalRandom, provenanceHook
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

  const validation = validateRawPromptResult(prompt, rawResult, state);
  assert.equal(validation.valid, true, 'host-selected prompt result failed native validation');
  const action = new native.ResolvePromptAction(prompt.id, rawResult);
  const result = store.dispatch(action);
  return {
    result,
    summary: Object.freeze(summary),
    rawResult
  };
}

function projectPrompt({ prompt, state, actorSeat, native, provenanceHook } = {}) {
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

  const source = makeSource(prompt, state, actorSeat, provenance);
  const choices = [];
  const choiceByToken = new Map();
  let publicMetadata = null;
  const type = prompt.constructor?.name;

  switch (type) {
    case 'ChooseCardsPrompt':
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

function dispatchPromptChoice({ store, prompt, state, actorSeat, projection, token, native } = {}) {
  assert.ok(store && typeof store.dispatch === 'function');
  assert.ok(projection?.choiceByToken instanceof Map);
  assert.equal(store.state, state, 'native Store state changed while the prompt decision was pending');
  assert.equal(state.prompts.includes(prompt), true, 'native prompt is stale');
  assert.equal(prompt.result, undefined, 'native prompt has already been resolved');
  assert.equal(prompt.playerId, state.players[actorSeat].id);
  assert.ok(projection.choiceByToken.has(token),
    'worker selected an unknown or stale native prompt choice token');
  const rawResult = projection.choiceByToken.get(token);
  const validation = validateRawPromptResult(prompt, rawResult, state);
  assert.equal(validation.valid, true, 'worker-selected prompt choice failed native decode/validation');
  const action = new native.ResolvePromptAction(prompt.id, rawResult);
  const result = store.dispatch(action);
  return { result, rawResult, decoded: validation.decoded };
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
  resolveHostOnlyPrompt,
  projectPrompt,
  dispatchPromptChoice
};
