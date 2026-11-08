'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  QUARANTINE_ACTIVE,
  VERSION: QUARANTINE_VERSION,
  CODE: QUARANTINE_CODE
} = require('../../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');
const {
  SOURCE_PRINTING,
  SOURCE_ABILITY
} = require('../../simulation/twinleaf/agent30/stunfisk-snap-trap-prompt-marker-v3.cjs');
const {
  withSnapTrapOwnerPromptEvidenceV1
} = require('../../simulation/twinleaf/agent36/snap-trap-owner-prompt-evidence-v1.cjs');

const GameMessage = { CHOOSE_CARD_TO_DISCARD: 'CHOOSE_CARD_TO_DISCARD' };
const SuperType = { ENERGY: 'ENERGY' };

class FakeAi {}
Object.defineProperty(FakeAi.prototype, QUARANTINE_ACTIVE, {
  value: { version: QUARANTINE_VERSION, code: QUARANTINE_CODE },
  configurable: true
});

class ChooseCardsPrompt {
  constructor(playerId, cards) {
    this.playerId = playerId;
    this.cards = cards;
    this.message = GameMessage.CHOOSE_CARD_TO_DISCARD;
    this.filter = { superType: SuperType.ENERGY };
    this.options = { min: 1, max: 1, allowCancel: false, isSecret: false };
    this.id = null;
    this.result = undefined;
  }
  validate(value) {
    return Array.isArray(value) && value.length === 1 &&
      this.cards.energies.cards.includes(value[0]);
  }
}

class ConfirmPrompt {
  constructor(playerId) {
    this.playerId = playerId;
    this.message = 'NEXT_OWNER_PROMPT';
    this.options = { min: 0, max: 0, allowCancel: false, isSecret: false };
    this.id = null;
    this.result = undefined;
  }
}

class ResolvePromptAction {
  constructor(id, result) {
    this.id = id;
    this.result = result;
  }
}

class FakeStore {
  constructor(state) {
    this.state = state;
    this.promptItems = [];
  }
  prompt(state, prompt) {
    prompt.id = String(state.nextPromptId++);
    state.prompts.push(prompt);
    this.promptItems.push({ ids: [prompt.id], then() {} });
    return prompt;
  }
  dispatch(action) {
    const prompt = this.state.prompts.find(candidate =>
      candidate.result === undefined &&
      String(candidate.id) === String(action.id)
    );
    assert.ok(prompt);
    const promptItem = this.promptItems.find(item =>
      item.ids.includes(prompt.id)
    );
    assert.ok(promptItem);
    prompt.result = action.result;
    this.state.prompts = this.state.prompts.filter(candidate =>
      candidate !== prompt
    );
    this.promptItems.splice(this.promptItems.indexOf(promptItem), 1);
    if (prompt.constructor.name === 'ChooseCardsPrompt') {
      const selected = action.result[0];
      const attacker = this.state.players[1];
      attacker.active.energies.cards =
        attacker.active.energies.cards.filter(card => card !== selected);
      attacker.active.cards =
        attacker.active.cards.filter(card => card !== selected);
      attacker.discard.cards.push(selected);
      this.prompt(this.state, new ConfirmPrompt(attacker.id));
    }
    return action;
  }
}

function buildState() {
  const energy = {
    fullName: 'Psychic Energy',
    superType: SuperType.ENERGY
  };
  const sourcePokemon = {
    fullName: SOURCE_PRINTING,
    powers: [{ name: SOURCE_ABILITY }]
  };
  const attackerPokemon = { fullName: 'Marshadow UNB' };
  const sourceActive = {
    cards: [sourcePokemon],
    energies: { cards: [] },
    getPokemonCard: () => sourcePokemon
  };
  const attackerActive = {
    cards: [attackerPokemon, energy],
    energies: { cards: [energy] },
    getPokemonCard: () => attackerPokemon
  };
  const source = {
    id: 'p0',
    active: sourceActive,
    discard: { cards: [] },
    lostzone: { cards: [] }
  };
  const attacker = {
    id: 'p1',
    active: attackerActive,
    discard: { cards: [] },
    lostzone: { cards: [] }
  };
  Object.defineProperty(source, 'hand', {
    get() { throw new Error('opponent hand must remain unread'); }
  });
  Object.defineProperty(source, 'deck', {
    get() { throw new Error('opponent deck must remain unread'); }
  });
  Object.defineProperty(attacker, 'hand', {
    get() { throw new Error('owner hand is supplied only by detached observation'); }
  });
  Object.defineProperty(attacker, 'deck', {
    get() { throw new Error('owner deck identities must remain unread'); }
  });
  return {
    energy,
    state: {
      players: [source, attacker],
      turn: 54,
      phase: 'MAIN',
      prompts: [],
      nextPromptId: 1
    }
  };
}

test('captures the exact Snap Trap owner view, native response, physical move and next prompt', () => {
  const originalPrompt = FakeStore.prototype.prompt;
  const originalDispatch = FakeStore.prototype.dispatch;
  const { state, energy } = buildState();
  const store = new FakeStore(state);
  const observations = [];
  const rootActionContext = {};
  const actorObservation = (liveState, seat) => {
    observations.push(seat);
    const pending = liveState.prompts.find(prompt =>
      prompt.result === undefined
    );
    return Object.freeze({
      actorSeat: seat,
      globalTurn: liveState.turn,
      phase: liveState.phase,
      decisionKind: 'owner-prompt',
      pendingPromptType: pending?.constructor?.name ?? null,
      ownHand: ['visible-owner-card'],
      opponentPublic: {
        active: liveState.players[1 - seat].active.getPokemonCard().fullName
      }
    });
  };
  const prompt = new ChooseCardsPrompt('p0', state.players[1].active);
  const result = withSnapTrapOwnerPromptEvidenceV1(() => {
    store.prompt(state, prompt);
    const snapTrapAction = new ResolvePromptAction(prompt.id, [energy]);
    store.dispatch(snapTrapAction);
    rootActionContext.onRootActionDispatched(
      store, snapTrapAction, 250, 0, 54
    );
    const nextPrompt = state.prompts[0];
    assert.ok(nextPrompt instanceof ConfirmPrompt);
    const nextAction = new ResolvePromptAction(nextPrompt.id, true);
    store.dispatch(nextAction);
    rootActionContext.onRootActionDispatched(
      store, nextAction, 251, 1, 54
    );
    return { settled: true };
  }, {
    Store: FakeStore,
    SimpleTacticsAi: FakeAi,
    types: { GameMessage, SuperType },
    actorObservation,
    getRootStore: () => store,
    rootActionContext
  });

  assert.deepEqual(result.result, { settled: true });
  const audit = result.audit;
  assert.equal(audit.quarantineActiveAtInstall, true);
  assert.equal(audit.snapTrapPromptCount, 1);
  assert.equal(audit.nextOwnerPromptCount, 1);
  assert.equal(audit.snapTrapPrompt.promptIdAfterStore, '1');
  assert.equal(audit.snapTrapPrompt.sameRootStore, true);
  assert.equal(
    audit.snapTrapPrompt.snapTrapIdentity.sourcePrinting,
    SOURCE_PRINTING
  );
  assert.equal(
    audit.snapTrapPrompt.snapTrapIdentity.attackerPrinting,
    'Marshadow UNB'
  );
  assert.equal(audit.snapTrapPrompt.options.min, 1);
  assert.equal(audit.snapTrapPrompt.options.max, 1);
  assert.equal(audit.snapTrapPrompt.filter.values.superType, 'ENERGY');
  assert.equal(
    audit.snapTrapPrompt.ownerObservationAtPromptCreation.actorSeat,
    0
  );
  assert.equal(audit.responseRecords.length, 2);
  assert.equal(audit.responseRecords[0].promptId, '1');
  assert.equal(audit.responseRecords[0].actionOrdinal, 250);
  assert.equal(audit.responseRecords[0].actingSeat, 0);
  assert.equal(audit.responseRecords[0].responseLength, 1);
  assert.equal(audit.responseRecords[0].selectedCardPrinting, 'Psychic Energy');
  assert.equal(audit.responseRecords[0].nativeValidateAccepted, true);
  assert.equal(audit.responseRecords[0].promptResultDefined, true);
  assert.equal(audit.responseRecords[0].promptResultMatches, true);
  assert.equal(audit.responseRecords[0].promptItemFoundBeforeDispatch, true);
  assert.deepEqual(audit.responseRecords[0].promptItemIdsBeforeDispatch, ['1']);
  assert.equal(audit.responseRecords[0].promptItemRemovedAfterDispatch, true);
  assert.equal(audit.responseRecords[0].physicalZoneSettled, true);
  assert.equal(
    audit.responseRecords[0].physicalZoneAfter.destination,
    'attacker-discard'
  );
  assert.equal(audit.nextOwnerPrompt.ownerSeat, 1);
  assert.equal(
    audit.nextOwnerPrompt.ownerObservationAtPromptCreation.actorSeat,
    1
  );
  assert.equal(audit.responseRecords[1].responseBoolean, true);
  assert.equal(audit.responseRecords[1].actionOrdinal, 251);
  assert.equal(audit.responseRecords[1].actingSeat, 1);
  assert.equal(audit.readsOpponentHidden, false);
  assert.equal(audit.readsOpponentHand, false);
  assert.equal(audit.readsOpponentDeck, false);
  assert.equal(audit.readsFaceDownPrizeIdentities, false);
  assert.ok(observations.includes(0));
  assert.ok(observations.includes(1));
  assert.strictEqual(FakeStore.prototype.prompt, originalPrompt);
  assert.strictEqual(FakeStore.prototype.dispatch, originalDispatch);
});

test('refuses to install the owner prompt observer outside Agent4 quarantine', () => {
  class UnquarantinedAi {}
  const store = new FakeStore({
    players: [],
    turn: 1,
    phase: 'MAIN',
    prompts: [],
    nextPromptId: 1
  });
  assert.throws(() => withSnapTrapOwnerPromptEvidenceV1(
    () => null,
    {
      Store: FakeStore,
      SimpleTacticsAi: UnquarantinedAi,
      types: { GameMessage, SuperType },
      actorObservation: () => ({}),
      getRootStore: () => store
    }
  ), /Agent4 raw-State quarantine/);
});
