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

    const fullCards = prompt.cards.cards;
    const attachedEnergies = prompt.cards.energies.cards;
    const eligible = fullCards
      .filter((card, index) => attachedEnergies.includes(card)
        && matchesPromptFilter(card, prompt.filter)
        && !prompt.options.blocked.includes(index))
      .sort((a, b) => a.id - b.id);

    assert.ok(eligible.length >= prompt.options.min,
      'mandatory Snap Trap prompt has no eligible public Energy');
    const selected = [eligible[0]];
    assert.equal(prompt.validate(selected), true,
      'the exact physical Energy selection must pass native prompt validation');

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
      throw new Error('Policy attempted concealed identity access: '
        + label + ':' + String(property));
    }
  });
  return () => {
    cardList.cards = original;
  };
}

/**
 * Reproduce a genuine Galarian Stunfisk SSH Snap Trap prompt and resolve it
 * through SimpleTacticsAi with a deterministic public-zone-only resolver.
 * @returns {object}
 */
function runSnapTrapChoiceContract() {
  const cardManager = initializeCards();
  let nextCardId = 9100;
  const card = fullName => {
    const value = cardManager.getCardByName(fullName);
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
  const {SimpleTacticsAi} = load('simple-bot/simple-tactics-ai');

  const store = new Store({onStateChange() {}});
  const state = store.state;
  const owner = new Player();
  const attacker = new Player();
  owner.id = 101;
  owner.name = 'Snap Trap owner';
  attacker.id = 202;
  attacker.name = 'Red Knuckles attacker';
  state.players = [owner, attacker];
  state.activePlayer = 1;
  state.turn = 54;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;

  const stunfisk = card('Galarian Stunfisk SSH');
  const marshadow = card('Marshadow UNB');
  const energy1 = card('Psychic Energy MEE');
  const energy2 = card('Psychic Energy MEE');
  owner.active.cards.push(stunfisk);
  attacker.active.cards.push(marshadow, energy1, energy2);
  attacker.active.energies.cards.push(energy1, energy2);

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

  store.dispatch(new AttackAction(attacker.id, 'Red Knuckles'));
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

  const fullIndex = prompt.cards.cards.indexOf(energy1);
  const energySublistIndex = prompt.cards.energies.cards.indexOf(energy1);
  const fullListCountBefore = prompt.cards.cards.length;
  const attachedEnergyCountBefore = prompt.cards.energies.cards.length;
  const eligibleEnergyCountBefore = prompt.cards.cards.filter((card, index) =>
    prompt.cards.energies.cards.includes(card)
    && prompt.filter.superType === SuperType.ENERGY
    && card.superType === SuperType.ENERGY
    && !prompt.options.blocked.includes(index)
  ).length;
  assert.equal(eligibleEnergyCountBefore, 2);
  const fullIndexDecoded = prompt.decode([fullIndex]);
  const sublistIndexDecoded = prompt.decode([energySublistIndex]);
  const fullIndexValid = prompt.validate(fullIndexDecoded);
  const sublistIndexValid = prompt.validate(sublistIndexDecoded);
  assert.equal(fullIndex, 1,
    'the full PokemonCardList contains Marshadow first and Energy second');
  assert.equal(energySublistIndex, 0,
    'the selected Energy is first in the attached-Energy sublist');
  assert.strictEqual(fullIndexDecoded[0], energy1,
    'client indices decode against the full PokemonCardList.cards array');
  assert.strictEqual(sublistIndexDecoded[0], marshadow,
    'using an Energy-sublist index would select the wrong full-list object');
  assert.equal(fullIndexValid, true);
  assert.equal(sublistIndexValid, false);
  assert.equal(prompt.validate(null), false,
    'the mandatory prompt cannot be cancelled');

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

  assert.deepEqual(hiddenReadAttempts, [],
    'the deterministic prompt policy must not read concealed card identities');
  assert.ok(action instanceof ResolvePromptAction);
  assert.ok(Array.isArray(action.result),
    'SimpleTacticsAi prompt actions carry Card[] rather than numeric indices');
  assert.equal(action.result.length, 1);
  assert.strictEqual(action.result[0], energy1);
  const actionPromptValid = prompt.validate(action.result);
  assert.equal(actionPromptValid, true);

  let moveEffectReceipt = null;
  const ownReduceEffect = Object.getOwnPropertyDescriptor(store, 'reduceEffect');
  const originalReduceEffect = store.reduceEffect;
  store.reduceEffect = function(stateArg, effect) {
    if (moveEffectReceipt === null && effect?.constructor?.name === 'MoveCardsEffect') {
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
  try {
    store.dispatch(action);
  } finally {
    if (ownReduceEffect) {
      Object.defineProperty(store, 'reduceEffect', ownReduceEffect);
    } else {
      delete store.reduceEffect;
    }
  }

  const after = store.state;
  const attackerAfter = after.players.find(player => player.id === attacker.id);
  assert.ok(!attackerAfter.active.cards.includes(energy1),
    'the selected physical Energy must leave the full active PokemonCardList');
  assert.ok(!attackerAfter.active.energies.cards.includes(energy1),
    'the selected physical Energy must leave the attached-Energy sublist');
  assert.ok(attackerAfter.discard.cards.includes(energy1),
    'the actual Snap Trap callback must move the selected Energy to attacker discard');
  assert.ok(attackerAfter.active.cards.includes(energy2),
    'the unselected physical Energy must remain attached');
  assert.ok(attackerAfter.active.cards.includes(marshadow),
    'the attacking Pokémon remains in the Active slot');
  assert.ok(moveEffectReceipt, 'the real Snap Trap callback must issue MoveCardsEffect');
  assert.strictEqual(moveEffectReceipt.source, liveAttacker.active);
  assert.strictEqual(moveEffectReceipt.destination, liveAttacker.discard);
  assert.equal(moveEffectReceipt.type, 'MoveCardsEffect');
  assert.equal(moveEffectReceipt.cards.length, 1);
  assert.strictEqual(moveEffectReceipt.cards[0], energy1);
  assert.strictEqual(moveEffectReceipt.sourceCard, stunfisk);
  assert.strictEqual(moveEffectReceipt.sourceEffect, stunfisk.powers[0]);

  return {
    schema: 'agent35-snap-trap-choice-response-contract-v1',
    pinnedTwinleaf: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    scenario: {
      source: stunfisk.fullName,
      sourceAbility: stunfisk.powers[0].name,
      attacker: marshadow.fullName,
      attack: marshadow.attacks[0].name,
      attackDamage: marshadow.attacks[0].damage,
      turn: liveState.turn
    },
    prompt: {
      type: prompt.constructor.name,
      message: prompt.message,
      promptId: prompt.id,
      ownerPlayerId: prompt.playerId,
      cardsIsAttackingPokemonList: prompt.cards === liveAttacker.active,
      energiesIsAttachedEnergySublist: prompt.cards.energies === liveAttacker.active.energies,
      filterSuperType: prompt.filter.superType,
      min: prompt.options.min,
      max: prompt.options.max,
      allowCancel: prompt.options.allowCancel,
      isSecret: prompt.options.isSecret,
      fullPokemonCardListCount: fullListCountBefore,
      attachedEnergyCountBefore,
      eligibleEnergyCountBefore,
      selectedEnergyPrinting: energy1.fullName,
      selectedEnergyId: energy1.id,
      remainingEnergyPrinting: energy2.fullName
    },
    indexContract: {
      selectedEnergyFullListIndex: fullIndex,
      selectedEnergySublistIndex: energySublistIndex,
      fullListDecodeReturnsSameObject: fullIndexDecoded[0] === energy1,
      sublistIndexWouldReturnPokemon: sublistIndexDecoded[0] === marshadow,
      fullListDecodeValid: fullIndexValid,
      sublistIndexDecodeValid: sublistIndexValid
    },
    aiContract: {
      resolver: 'test-local deterministic public attached-Energy selector',
      entryPoint: 'SimpleTacticsAi.resolvePrompt',
      actionType: action.constructor.name,
      actionResultType: 'Card[]',
      actionContainsSamePhysicalEnergy: action.result[0] === energy1,
      explicitPromptValidationBeforeDispatch: actionPromptValid,
      hiddenIdentityReadAttempts: hiddenReadAttempts.length
    },
    moveCardsEffect: {
      type: moveEffectReceipt.type,
      sourceIsAttackingPokemonList: moveEffectReceipt.source === liveAttacker.active,
      destinationIsAttackerDiscard: moveEffectReceipt.destination === liveAttacker.discard,
      cardsCount: moveEffectReceipt.cards.length,
      sameSelectedEnergyReference: moveEffectReceipt.cards[0] === energy1,
      sourceCardIsGalarianStunfisk: moveEffectReceipt.sourceCard === stunfisk,
      sourceEffectIsSnapTrap: moveEffectReceipt.sourceEffect === stunfisk.powers[0]
    },
    resolution: {
      actualPromptCallbackMovedEnergy: attackerAfter.discard.cards.includes(energy1),
      removedFromFullPokemonCardList: !attackerAfter.active.cards.includes(energy1),
      removedFromEnergySublist: !attackerAfter.active.energies.cards.includes(energy1),
      attackerActiveRemains: attackerAfter.active.cards.includes(marshadow),
      secondEnergyRemains: attackerAfter.active.cards.includes(energy2)
    },
    competitiveGamesQualified: 0,
    winRateEstimate: null
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(runSnapTrapChoiceContract(), null, 2) + '\n');
}

module.exports = {runSnapTrapChoiceContract};
