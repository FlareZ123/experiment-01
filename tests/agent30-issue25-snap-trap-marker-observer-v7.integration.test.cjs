'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  withStunfiskSnapTrapPromptMarker
} = require('../simulation/twinleaf/agent30-stunfisk-snap-trap-prompt-marker-v2.cjs');
const {
  withIssue25PublicPromptZoneAuditV7
} = require('../simulation/twinleaf/agent30-issue25-public-prompt-zone-audit-v7.cjs');

const GameMessage = {CHOOSE_CARD_TO_DISCARD: 'CHOOSE_CARD_TO_DISCARD'};
const SuperType = {ENERGY: 'ENERGY', POKEMON: 'POKEMON'};

class ChooseCardsPrompt {
  constructor(player, message, cards, filter, options = {}) {
    this.id = 0;
    this.player = player;
    this.playerId = player.id;
    this.message = message;
    this.cards = cards;
    this.filter = filter;
    this.options = options;
  }
}

class PokemonCardList {
  constructor(pokemon, energies = [], damage = 0) {
    this.cards = pokemon ? [pokemon, ...energies] : [...energies];
    this.energies = {cards: energies};
    this.damage = damage;
    this.pokemon = pokemon;
  }

  getPokemonCard() {
    return this.pokemon;
  }
}

class GalarianStunfisk {
  constructor() {
    this.fullName = 'Galarian Stunfisk SSH';
    this.powers = [{name: 'Snap Trap'}];
  }

  reduceEffect(store, state, effect) {
    const owner = state.players.find(player => player.active === effect.target);
    const prompt = new ChooseCardsPrompt(
      owner,
      GameMessage.CHOOSE_CARD_TO_DISCARD,
      effect.source,
      {superType: SuperType.ENERGY},
      {min: 1, max: 1, allowCancel: false, isSecret: false}
    );
    return store.prompt(state, prompt, () => {});
  }
}

class SimpleTacticsAi {
  constructor(client) {
    this.client = client;
  }

  decodeNextAction() {
    return 'unused-decoder';
  }
}

class AttackAction {
  constructor(playerId, name) {
    this.id = playerId;
    this.name = name;
  }
}

class FakeStore {
  constructor(state, sourceCard, effect) {
    this.state = state;
    this.sourceCard = sourceCard;
    this.effect = effect;
  }

  prompt(stateArgument, prompt, callback) {
    assert.strictEqual(stateArgument, this.state);
    assert.equal(prompt.id, 0);
    prompt.id = 173;
    stateArgument.prompts.push(prompt);
    this.lastPromptCallback = callback;
    return stateArgument;
  }

  dispatch(action) {
    if (action instanceof AttackAction) {
      this.sourceCard.reduceEffect(this, this.state, this.effect);
    }
    return action;
  }
}

function makeScenario(ownerSeat) {
  const attackerSeat = 1 - ownerSeat;
  const stunfisk = new GalarianStunfisk();
  const marshadow = {fullName: 'Marshadow UNB', superType: SuperType.POKEMON};
  const energies = Array.from({length: 8}, () => ({
    fullName: 'Psychic Energy MEE',
    superType: SuperType.ENERGY
  }));
  const owner = {
    id: 'owner',
    hand: {cards: []},
    deck: {cards: []},
    prizes: {cards: []},
    discard: {cards: []},
    lostZone: {cards: []},
    active: null,
    bench: []
  };
  const attacker = {
    id: 'attacker',
    hand: {cards: []},
    deck: {cards: []},
    prizes: {cards: []},
    discard: {cards: []},
    lostZone: {cards: []},
    active: null,
    bench: []
  };
  owner.active = new PokemonCardList(stunfisk, [], 10);
  attacker.active = new PokemonCardList(marshadow, energies, 0);
  const players = [];
  players[ownerSeat] = owner;
  players[attackerSeat] = attacker;
  const state = {
    players,
    turn: 54,
    phase: 3,
    activePlayer: attackerSeat,
    prompts: []
  };
  const effect = {
    player: attacker,
    source: attacker.active,
    target: owner.active,
    damage: 10
  };
  const store = new FakeStore(state, stunfisk, effect);
  return {state, store, ownerSeat, attackerSeat, stunfisk};
}

function engine(relative) {
  switch (relative) {
    case 'sets/09-sword-and-shield/set-sword-and-shield/galarian-stunfisk':
      return {GalarianStunfisk};
    case 'simple-bot/simple-tactics-ai':
      return {SimpleTacticsAi};
    case 'game/store/prompts/choose-cards-prompt':
      return {ChooseCardsPrompt};
    case 'game/game-message':
      return {GameMessage};
    case 'game/store/card/card-types':
      return {SuperType};
    default:
      throw new Error('Unexpected fake engine module: ' + relative);
  }
}

test('same source prompt object joins the live Store event and public Active Energy zone in both seats', () => {
  for (const ownerSeat of [0, 1]) {
    const scenario = makeScenario(ownerSeat);
    const {state, store, attackerSeat} = scenario;
    const marked = withStunfiskSnapTrapPromptMarker(getOriginForPrompt => {
      return withIssue25PublicPromptZoneAuditV7(
        () => store.dispatch(new AttackAction('attacker', 'Red Knuckles')),
        {
          Store: FakeStore,
          ChooseCardsPrompt,
          GameMessage,
          SuperType,
          getSourceOriginForPrompt
        }
      );
    }, {engine});

    const {result, audit: zoneAudit} = marked.result;
    const markerAudit = marked.audit;
    assert.equal(result.name, 'Red Knuckles');
    assert.equal(markerAudit.printedSourceInvocations, 1);
    assert.equal(markerAudit.exactSourcePromptsStamped.length, 1);
    assert.equal(markerAudit.blockedPromptOriginEvents.length, 0);
    assert.equal(markerAudit.hiddenCardIdentitiesInspected, false);
    assert.equal(markerAudit.decisionActionsIssuedByMarker, 0);
    assert.equal(state.prompts.length, 1);

    const sourceProof = markerAudit.exactSourcePromptsStamped[0];
    const event = zoneAudit.events[0];
    assert.equal(zoneAudit.promptCount, 1);
    assert.equal(event.promptIdBeforeStore, '0');
    assert.equal(event.promptId, '173');
    assert.equal(event.promptIdAfterStore, '173');
    assert.equal(event.promptIdAssignedByStore, true);
    assert.equal(sourceProof.promptIdBeforeStore, 0);
    assert.equal(sourceProof.promptIdAfterStore, 173);
    assert.equal(sourceProof.promptIdAssignedByStore, true);
    assert.equal(sourceProof.pendingNativePromptId, '173');
    assert.equal(event.sourceMarkerSamePromptObject, true);
    assert.strictEqual(event.sourceMarkerOrigin, sourceProof);
    assert.equal(String(event.sourceMarkerOrigin.promptIdAfterStore), event.promptId);
    assert.equal(event.stateIsLiveStore, true);
    assert.equal(event.promptStateArgumentMatchesLiveState, true);
    assert.equal(event.ownerSeat, ownerSeat);
    assert.equal(event.opponentSeat, attackerSeat);
    assert.equal(event.promptPlayerMatches, true);
    assert.equal(event.promptType, 'ChooseCardsPrompt');
    assert.equal(event.message, 'CHOOSE_CARD_TO_DISCARD');
    assert.equal(event.filterIsExactSuperTypeEnergy, true);
    assert.deepEqual(event.filterKeys, ['superType']);
    assert.equal(event.min, 1);
    assert.equal(event.max, 1);
    assert.equal(event.allowCancel, false);
    assert.equal(event.isSecret, false);
    assert.equal(event.promptSourceMetadataPresent, false);
    assert.equal(event.ownerActive.printing, 'Galarian Stunfisk SSH');
    assert.equal(event.opponentActive.printing, 'Marshadow UNB');
    assert.equal(event.opponentActive.energyCount, 8);
    assert.equal(event.currentAttack.seat, attackerSeat);
    assert.equal(event.currentAttack.attackName, 'Red Knuckles');
    assert.equal(event.currentAttack.turn, 54);
    assert.equal(event.zoneMatches.length, 1);
    assert.equal(event.zoneMatches[0].zone, 'opponent-active-pokemon-list');
    assert.equal(event.zoneMatches[0].match, 'exact-container');
    assert.equal(event.zoneMatches[0].visibility, 'public');
    assert.equal(event.zoneMatches[0].eligibleSubzone, 'energies');
    assert.equal(event.zoneMatches[0].subzoneReferenceMatch, true);
    assert.equal(event.zoneMatches[0].eligibleCount, 8);
    assert.deepEqual(event.offeredPrintings, Array(8).fill('Psychic Energy MEE'));
  }
});
