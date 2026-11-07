'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('../headless.cjs');

const output = path.resolve(__dirname, '../../../vendor/twinleaf/ptcg-server/output');
const load = relativePath => require(path.join(output, relativePath));

/**
 * Test-only resolver for the exact mandatory Snap Trap prompt.
 * It reads only the public attached-Energy sublist on prompt.cards.
 */
class PublicSnapTrapEnergyResolver {
  resolvePrompt(_state, player, prompt) {
    const {ChooseCardsPrompt, matchesPromptFilter} =
      load('game/store/prompts/choose-cards-prompt');
    const {GameMessage} = load('game/game-message');
    const {SuperType} = load('game/store/card/card-types');
    const {ResolvePromptAction} =
      load('game/store/actions/resolve-prompt-action');

    if (!(prompt instanceof ChooseCardsPrompt)
      || prompt.message !== GameMessage.CHOOSE_CARD_TO_DISCARD) {
      return undefined;
    }

    assert.equal(prompt.playerId, player.id);
    assert.equal(prompt.filter.superType, SuperType.ENERGY);

    const eligible = prompt.cards.cards
      .filter((card, index) => prompt.cards.energies.cards.includes(card)
        && matchesPromptFilter(card, prompt.filter)
        && !prompt.options.blocked.includes(index))
      .sort((a, b) => a.id - b.id);

    assert.ok(eligible.length >= prompt.options.min,
      'mandatory Snap Trap prompt has no eligible public Energy');
    const selected = [eligible[0]];
    assert.equal(prompt.validate(selected), true,
      'the physical Beast Energy selection must pass native prompt validation');

    return new ResolvePromptAction(prompt.id, selected);
  }
}

/**
 * Temporarily prevents iteration or element access to a concealed CardList.
 * Length and constructor metadata remain available.
 * @param {{cards: object[]}} cardList
 * @param {string} label
 * @param {string[]} attemptedReads
 * @returns {() => void}
 */
function blockHiddenCardIdentities(cardList, label, attemptedReads) {
  const original = cardList.cards;
  cardList.cards = new Proxy(original, {
    get(target, property, receiver) {
      if (property === 'length'
        || property === 'constructor'
        || property === Symbol.toStringTag) {
        return Reflect.get(target, property, receiver);
      }
      attemptedReads.push(label + ':' + String(property));
      throw new Error('Policy attempted concealed card identity access: '
        + label + ':' + String(property));
    }
  });
  return () => {
    cardList.cards = original;
  };
}

/**
 * Prove that the real Snap Trap callback routes a selected Prism Star Energy
 * to Lost Zone while retaining discard as the requested MoveCardsEffect
 * destination.
 * @returns {object}
 */
function runSnapTrapPrismStarDestinationContract() {
  const cardManager = initializeCards();
  let nextCardId = 9200;
  const card = fullName => {
    let value = cardManager.getCardByName(fullName);
    if (!value && fullName === 'Beast Energy ◇ FLI') {
      const alternatives = [
        'Beast Energy ◇',
        'Beast Energy',
        'Beast Energy FLI',
        'Beast Energy Prism Star FLI',
        'Beast Energy Prism Star'
      ];
      for (const alternative of alternatives) {
        value = cardManager.getCardByName(alternative);
        if (value) break;
      }
      if (!value && typeof cardManager.getCardById === 'function') {
        value = cardManager.getCardById('sm6-117');
      }
      if (!value) {
        throw new Error('Unable to resolve sm6-117 Beast Energy. '
          + JSON.stringify({
            attemptedNames: [fullName, ...alternatives],
            hasGetCardById: typeof cardManager.getCardById === 'function',
            managerMethods: Object.getOwnPropertyNames(Object.getPrototypeOf(cardManager)),
            managerKeys: Object.keys(cardManager)
          }));
      }
    }
    assert.ok(value, 'missing pinned printing ' + fullName);
    value.id = nextCardId++;
    return value;
  };

  const {Store} = load('game/store/store');
  const {Player} = load('game/store/state/player');
  const {CardList} = load('game/store/state/card-list');
  const {GamePhase} = load('game/store/state/state');
  const {Format, SuperType} = load('game/store/card/card-types');
  const {GameMessage} = load('game/game-message');
  const {AttackAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} =
    load('game/store/actions/resolve-prompt-action');
  const {ChooseCardsPrompt} =
    load('game/store/prompts/choose-cards-prompt');
  const {WaitPrompt} = load('game/store/prompts/wait-prompt');
  const {SimpleTacticsAi} = load('simple-bot/simple-tactics-ai');

  let store;
  store = new Store({
    onStateChange(nextState) {
      store.state = nextState;
    }
  });
  const state = store.state;
  const owner = new Player();
  const attacker = new Player();
  owner.id = 301;
  owner.name = 'Snap Trap owner';
  attacker.id = 402;
  attacker.name = 'Prism Star attacker';
  state.players = [owner, attacker];
  state.activePlayer = 1;
  state.turn = 54;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;

  const stunfisk = card('Galarian Stunfisk SSH');
  const marshadow = card('Marshadow UNB');
  const beastEnergy = card('Beast Energy ◇ FLI');
  const psychicEnergy = card('Psychic Energy MEE');
  owner.active.cards.push(stunfisk);
  attacker.active.cards.push(marshadow, beastEnergy, psychicEnergy);
  attacker.active.energies.cards.push(beastEnergy, psychicEnergy);

  for (const player of [owner, attacker]) {
    for (let i = 0; i < 8; i++) {
      player.deck.cards.push(card('Psychic Energy MEE'));
    }
    for (let i = 0; i < 6; i++) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      player.prizes.push(prize);
    }
  }

  assert.equal(stunfisk.powers[0].name, 'Snap Trap');
  assert.equal(marshadow.attacks[0].name, 'Red Knuckles');
  assert.equal(marshadow.attacks[0].damage, 10);
  assert.equal(marshadow.attacks[0].cost.length, 1);
  assert.ok((beastEnergy.fullName || beastEnergy.name).includes('Beast Energy'));

  const afterAttack = store.dispatch(new AttackAction(attacker.id, 'Red Knuckles'));
  store.state = afterAttack;
  const animationWaitPrompts = store.state.prompts.filter(prompt =>
    prompt instanceof WaitPrompt
    && prompt.message === 'Attack animation'
    && prompt.result === undefined
  );
  assert.equal(animationWaitPrompts.length, 1,
    'the attack should pause on exactly one animation WaitPrompt before damage');
  const animationWaitPrompt = animationWaitPrompts[0];
  const afterAnimation = store.dispatch(
    new ResolvePromptAction(animationWaitPrompt.id, null)
  );
  store.state = afterAnimation;
  const animationWaitPromptAfter = store.state.prompts.find(prompt =>
    prompt.id === animationWaitPrompt.id
  );
  assert.strictEqual(animationWaitPromptAfter.result, null,
    'the animation WaitPrompt must be resolved with null, not the undefined sentinel');

  const liveState = store.state;
  const liveOwner = liveState.players.find(player => player.id === owner.id);
  const liveAttacker = liveState.players.find(player => player.id === attacker.id);
  const pending = liveState.prompts.filter(prompt => prompt.result === undefined);
  const snapTrapPrompts = pending.filter(prompt =>
    prompt instanceof ChooseCardsPrompt
    && prompt.message === GameMessage.CHOOSE_CARD_TO_DISCARD
  );
  assert.equal(snapTrapPrompts.length, 1,
    'the genuine attack must create exactly one pending Snap Trap ChooseCardsPrompt');
  const prompt = snapTrapPrompts[0];

  assert.equal(prompt.playerId, liveOwner.id);
  assert.strictEqual(prompt.player, liveOwner);
  assert.strictEqual(prompt.cards, liveAttacker.active);
  assert.strictEqual(prompt.cards.energies, liveAttacker.active.energies);
  assert.equal(prompt.filter.superType, SuperType.ENERGY);
  assert.equal(prompt.options.min, 1);
  assert.equal(prompt.options.max, 1);
  assert.equal(prompt.options.allowCancel, false);
  assert.equal(prompt.options.isSecret, false);

  const fullIndex = prompt.cards.cards.indexOf(beastEnergy);
  const energySublistIndex = prompt.cards.energies.cards.indexOf(beastEnergy);
  const fullIndexDecoded = prompt.decode([fullIndex]);
  const sublistIndexDecoded = prompt.decode([energySublistIndex]);
  assert.equal(fullIndex, 1);
  assert.equal(energySublistIndex, 0);
  assert.strictEqual(fullIndexDecoded[0], beastEnergy);
  assert.strictEqual(sublistIndexDecoded[0], marshadow);
  assert.equal(prompt.validate(fullIndexDecoded), true);
  assert.equal(prompt.validate(sublistIndexDecoded), false);
  assert.equal(prompt.validate(null), false);

  const hiddenReadAttempts = [];
  const restore = [];
  for (const player of [liveOwner, liveAttacker]) {
    restore.push(blockHiddenCardIdentities(player.hand, 'hand', hiddenReadAttempts));
    restore.push(blockHiddenCardIdentities(player.deck, 'deck', hiddenReadAttempts));
    player.prizes.forEach((prize, index) => {
      restore.push(blockHiddenCardIdentities(
        prize, 'prize-' + player.id + '-' + index, hiddenReadAttempts
      ));
    });
  }

  let action;
  try {
    const ai = new SimpleTacticsAi(
      {id: liveOwner.id},
      {
        tactics: [],
        promptResolvers: [PublicSnapTrapEnergyResolver],
        scores: {},
        arbiter: {}
      },
      null
    );
    action = ai.resolvePrompt(liveOwner, liveState, prompt);
  } finally {
    restore.reverse().forEach(restoreZone => restoreZone());
  }

  assert.deepEqual(hiddenReadAttempts, []);
  assert.ok(action instanceof ResolvePromptAction);
  assert.ok(Array.isArray(action.result));
  assert.equal(action.result.length, 1);
  assert.strictEqual(action.result[0], beastEnergy);
  assert.equal(prompt.validate(action.result), true);

  let moveEffectReceipt = null;
  const ownReduceEffect = Object.getOwnPropertyDescriptor(store, 'reduceEffect');
  const originalReduceEffect = store.reduceEffect;
  store.reduceEffect = function(stateArg, effect) {
    if (moveEffectReceipt === null
      && effect?.constructor?.name === 'MoveCardsEffect'
      && effect.sourceCard === stunfisk
      && effect.sourceEffect === stunfisk.powers[0]) {
      moveEffectReceipt = {
        type: effect.constructor.name,
        source: effect.source,
        destination: effect.destination,
        cards: Array.isArray(effect.cards) ? [...effect.cards] : effect.cards,
        sourceCard: effect.sourceCard,
        sourceEffect: effect.sourceEffect
      };
    }
    return originalReduceEffect.call(this, stateArg, effect);
  };
  let afterResponse;
  try {
    afterResponse = store.dispatch(action);
    store.state = afterResponse;
  } finally {
    if (ownReduceEffect) {
      Object.defineProperty(store, 'reduceEffect', ownReduceEffect);
    } else {
      delete store.reduceEffect;
    }
  }

  const afterResponseState = store.state;
  const resolvedPromptAfterResponse =
    afterResponseState.prompts.find(item => item.id === prompt.id);
  const pendingAfter = afterResponseState.prompts.filter(item => item.result === undefined);
  const unresolvedSamePrompt = pendingAfter.filter(item => item.id === prompt.id);
  const otherPendingPrompts = pendingAfter
    .filter(item => item.id !== prompt.id)
    .map(item => ({
      id: item.id,
      type: item.constructor?.name,
      message: item.message
    }));

  assert.ok(Array.isArray(resolvedPromptAfterResponse.result),
    'the native prompt must retain the resolved Card[] result');
  assert.equal(resolvedPromptAfterResponse.result.length, 1);
  assert.strictEqual(resolvedPromptAfterResponse.result[0], beastEnergy,
    'prompt.result must contain the exact selected physical Beast Energy');
  assert.equal(unresolvedSamePrompt.length, 0,
    'the same Snap Trap prompt ID must no longer be pending');
  assert.equal(otherPendingPrompts.length, 1,
    'exactly one post-response animation prompt should remain');
  const postResponseWaitPrompt = pendingAfter.find(item => item.id !== prompt.id);
  assert.ok(postResponseWaitPrompt instanceof WaitPrompt,
    'the remaining prompt must be the native post-damage WaitPrompt');
  const postResponseWaitPromptId = postResponseWaitPrompt.id;
  const afterFinalWait = store.dispatch(
    new ResolvePromptAction(postResponseWaitPrompt.id, null)
  );
  store.state = afterFinalWait;
  const finalWaitPrompt = store.state.prompts.find(item =>
    item.id === postResponseWaitPromptId
  );
  assert.strictEqual(finalWaitPrompt.result, null,
    'the post-response WaitPrompt must be resolved with null');
  const pendingFinal = store.state.prompts.filter(item => item.result === undefined);
  assert.equal(pendingFinal.length, 0,
    'the full attack effect generator must have no unresolved prompts after the final WaitPrompt');

  const after = store.state;
  const attackerAfter = after.players.find(player => player.id === attacker.id);
  const resolvedPrompt = after.prompts.find(item => item.id === prompt.id);
  assert.ok(Array.isArray(resolvedPrompt.result));
  assert.strictEqual(resolvedPrompt.result[0], beastEnergy);

  assert.ok(!attackerAfter.active.cards.includes(beastEnergy),
    'the selected Prism Star Energy must leave the full active PokemonCardList');
  assert.ok(!attackerAfter.active.energies.cards.includes(beastEnergy),
    'the selected Prism Star Energy must leave the attached-Energy sublist');
  assert.ok(attackerAfter.lostzone.cards.includes(beastEnergy),
    'the same physical Prism Star Energy must enter the attacker Lost Zone');
  assert.ok(!attackerAfter.discard.cards.includes(beastEnergy),
    'the Prism Star Energy must not enter the discard pile');
  assert.ok(attackerAfter.active.cards.includes(psychicEnergy),
    'the unselected ordinary Energy must remain attached');
  assert.ok(attackerAfter.active.energies.cards.includes(psychicEnergy));
  assert.ok(attackerAfter.active.cards.includes(marshadow),
    'the attacking Pokémon remains in the Active slot');

  assert.ok(moveEffectReceipt, 'the real Snap Trap callback must issue MoveCardsEffect');
  assert.strictEqual(moveEffectReceipt.source, liveAttacker.active);
  assert.strictEqual(moveEffectReceipt.destination, liveAttacker.discard,
    'MoveCardsEffect retains the requested discard destination');
  assert.equal(moveEffectReceipt.type, 'MoveCardsEffect');
  assert.equal(moveEffectReceipt.cards.length, 1);
  assert.strictEqual(moveEffectReceipt.cards[0], beastEnergy);
  assert.strictEqual(moveEffectReceipt.sourceCard, stunfisk);
  assert.strictEqual(moveEffectReceipt.sourceEffect, stunfisk.powers[0]);

  return {
    schema: 'agent12-snap-trap-prism-star-destination-v1',
    pinnedTwinleaf: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    scenario: {
      source: stunfisk.fullName,
      sourceAbility: stunfisk.powers[0].name,
      attacker: marshadow.fullName,
      attack: marshadow.attacks[0].name,
      selectedEnergy: beastEnergy.fullName || beastEnergy.name,
      unselectedEnergy: psychicEnergy.fullName,
      selectedEnergyId: beastEnergy.id,
      turn: liveState.turn
    },
    prompt: {
      promptId: prompt.id,
      ownerPlayerId: prompt.playerId,
      cardsIsAttackingPokemonList: prompt.cards === liveAttacker.active,
      energiesIsAttachedEnergySublist: prompt.cards.energies === liveAttacker.active.energies,
      selectedEnergyFullListIndex: fullIndex,
      selectedEnergySublistIndex: energySublistIndex,
      fullListDecodeReturnsSameObject: fullIndexDecoded[0] === beastEnergy,
      sublistIndexWouldReturnPokemon: sublistIndexDecoded[0] === marshadow,
      promptResultIsSamePhysicalEnergy: resolvedPrompt.result[0] === beastEnergy,
      unresolvedPromptCountAfterResponse: unresolvedSamePrompt.length,
      otherPendingPromptCountAfterResponse: otherPendingPrompts.length,
      otherPendingPromptsAfterResponse: otherPendingPrompts,
      postResponseWaitPromptId,
      postResponseWaitPromptType: postResponseWaitPrompt.constructor.name,
      postResponseWaitPromptResolvedWithNull: finalWaitPrompt.result === null,
      unresolvedPromptCountAfterFinalWait: pendingFinal.length
    },
    moveCardsEffect: {
      sourceIsAttackingPokemonList: moveEffectReceipt.source === liveAttacker.active,
      requestedDestinationIsDiscard: moveEffectReceipt.destination === liveAttacker.discard,
      sameSelectedEnergyReference: moveEffectReceipt.cards[0] === beastEnergy,
      sourceCardIsGalarianStunfisk: moveEffectReceipt.sourceCard === stunfisk,
      sourceEffectIsSnapTrap: moveEffectReceipt.sourceEffect === stunfisk.powers[0]
    },
    resolution: {
      selectedEnergyInLostZone: attackerAfter.lostzone.cards.includes(beastEnergy),
      selectedEnergyAbsentFromDiscard: !attackerAfter.discard.cards.includes(beastEnergy),
      removedFromFullPokemonCardList: !attackerAfter.active.cards.includes(beastEnergy),
      removedFromEnergySublist: !attackerAfter.active.energies.cards.includes(beastEnergy),
      unselectedPsychicEnergyRemains: attackerAfter.active.cards.includes(psychicEnergy)
        && attackerAfter.active.energies.cards.includes(psychicEnergy),
      attackerActiveRemains: attackerAfter.active.cards.includes(marshadow)
    },
    competitiveGamesQualified: 0,
    winRateEstimate: null
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(runSnapTrapPrismStarDestinationContract(), null, 2) + '\n');
}

module.exports = {runSnapTrapPrismStarDestinationContract};
