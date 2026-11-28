'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const runner = require('../../simulation/evaluation/2026-11/agent36-v3-runner.cjs');
const frontierModule = require('../../simulation/evaluation/2026-11/agent36-native-action-frontier.cjs');
const adapterModule = require('../../simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs');
const { createValidationRandomScope, seededRandom } = require('../../simulation/evaluation/2026-11/agent49-native-fixture-game.cjs');

function resolveNativeSearchPrompts({ store, state, withValidationRandom }) {
  const { ResolvePromptAction } = require(path.join(
    __dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action'
  ));
  const promptNames = [];
  for (let step = 0; step < 16; step++) {
    const prompt = (state.prompts ?? []).find(candidate => candidate.result === undefined);
    if (!prompt) return promptNames;
    promptNames.push(prompt.constructor.name);
    let selected;
    switch (prompt.constructor.name) {
      case 'WaitPrompt':
        selected = null;
        break;
      case 'ChooseCardsPrompt': {
        const ownerId = prompt.getPerspectivePlayerId?.() ?? prompt.playerId;
        const owner = state.players.find(player => player.id === ownerId) ??
          state.players[state.activePlayer];
        selected = [owner.deck.cards[0]];
        assert.ok(selected[0], 'native search prompt must have a card to choose');
        assert.equal(prompt.validate(selected), true, 'native search selection must validate');
        break;
      }
      case 'ShuffleDeckPrompt': {
        const ownerId = prompt.getPerspectivePlayerId?.() ?? prompt.playerId;
        const owner = state.players.find(player => player.id === ownerId) ??
          state.players[state.activePlayer];
        selected = Array.from({ length: owner.deck.cards.length }, (_, index) => index);
        break;
      }
      case 'ShowCardsPrompt':
        selected = true;
        break;
      default:
        throw new Error('Unexpected native search prompt: ' + prompt.constructor.name);
    }
    withValidationRandom(() => store.dispatch(new ResolvePromptAction(prompt.id, selected)));
  }
  throw new Error('native search prompt chain did not settle');
}

function resolveNativeWaitPrompts({ store, state, withValidationRandom }) {
  const { ResolvePromptAction } = require(path.join(
    __dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action'
  ));
  const promptNames = [];
  for (let step = 0; step < 8; step++) {
    const prompt = (state.prompts ?? []).find(candidate => candidate.result === undefined);
    if (!prompt || prompt.constructor.name !== 'WaitPrompt') return promptNames;
    promptNames.push(prompt.constructor.name);
    withValidationRandom(() => store.dispatch(new ResolvePromptAction(prompt.id, null)));
  }
  return promptNames;
}


const compiledActionEnumerator = path.join(
  __dirname,
  '../../vendor/twinleaf/ptcg-server/output/advanced-bot/action-enumerator.js'
);

test('pinned compiled ActionEnumerator and Simulator admit every Basic hand action beyond the native eight-item cap', {
  skip: !fs.existsSync(compiledActionEnumerator),
  timeout: 30000
}, () => {
  const enginePin = runner.V3_FIXTURE.engineCommit;
  const native = runner.loadNativeRoleDependencies({ enginePin });
  const withValidationRandom = createValidationRandomScope({
    ambientRandom: Math.random,
    physicalRandom: seededRandom(0x5eed1234)
  });
  const manager = native.CardManager.getInstance();
  const definitions = manager.getAllCards().filter(card =>
    card instanceof native.PokemonCard &&
    card.stage === native.Stage.BASIC &&
    (!Array.isArray(card.powers) || card.powers.length === 0) &&
    typeof card.fullName === 'string'
  );
  assert.ok(definitions.length >= 11, 'pinned Expanded card pool must contain eleven Basic Pokémon without powers');

  let nextCardId = 100000;
  function cloneCard(definition) {
    const card = manager.getCardByName(definition.fullName);
    assert.ok(card, 'CardManager must resolve ' + definition.fullName);
    card.id = nextCardId++;
    return card;
  }

  const selected = definitions.slice(0, 11).map(cloneCard);
  const handCards = selected.slice(0, 9);
  const activeCard = selected[9];
  const opponentActiveCard = selected[10];
  activeCard.attacks = [];
  opponentActiveCard.attacks = [];

  function makePlayer(id, activePokemon) {
    const player = new native.Player();
    player.id = id;
    player.active = new native.PokemonCardList();
    player.active.cards = [activePokemon];
    player.active.hp = activePokemon.hp;
    player.active.damage = 0;
    player.active.energies.cards = [];
    player.active.tools = [];
    player.bench = Array.from({ length: 5 }, () => new native.PokemonCardList());
    player.prizes = Array.from({ length: 6 }, () => {
      const prize = new native.CardList();
      prize.cards = [cloneCard(definitions[0])];
      return prize;
    });
    player.deck.cards = Array.from({ length: 30 }, () => cloneCard(definitions[1]));
    player.hand.cards = [];
    player.playableCardIds = [];
    player.playableHandAbilityCardIds = [];
    player.canEvolve = false;
    return player;
  }

  const candidate = makePlayer(0, activeCard);
  const opponent = makePlayer(1, opponentActiveCard);
  candidate.hand.cards = handCards;
  candidate.playableCardIds = handCards.map(card => card.id);

  const state = new native.State();
  state.players = [candidate, opponent];
  state.activePlayer = 0;
  state.phase = native.GamePhase.PLAYER_TURN;
  state.turn = 1;
  state.prompts = [];
  state.gameSettings.format = native.Format.EXPANDED;
  state.gameSettings.sandboxMode = false;

  const enumerator = adapterModule.createKnownCapFreeActionEnumerator({ native, enginePin });
  const basicActions = enumerator.playBasicActions(state, candidate);
  assert.equal(basicActions.length, 9, 'adapter must remove the pinned enumerator\'s eight-item Basic-action cap');

  const frontier = frontierModule.buildNativeActionFrontier({
    state,
    actorSeat: 0,
    native,
    enumerator
  });
  const admission = adapterModule.assertKnownCapFreeAdapterAdmissionClear({
    enumerator,
    enginePin,
    frontierDiagnostics: frontier.diagnostics
  });

  assert.equal(admission.adapter.enginePin, enginePin);
  assert.equal(frontier.diagnostics.enumeratedCount, 10);
  assert.equal(frontier.diagnostics.validatedCount, 10);
  assert.equal(frontier.diagnostics.rejectedCount, 0);
  assert.equal(frontier.diagnostics.unsupportedCount, 0);
  assert.equal(frontier.diagnostics.truncated, false);
  assert.equal(frontier.diagnostics.omittedCount, 0);
  assert.equal(frontier.actionFrontier.items.length, 10);

  for (const item of frontier.actionFrontier.items) {
    if (item.kind === 'pass') continue;
    const simulator = new native.Simulator(state);
    frontierModule.dispatchSelectedNativeAction({
      store: simulator.store,
      frontier,
      token: item.token,
      state: simulator.store.state,
      actorSeat: 0,
      native,
      withValidationRandom
    });
    assert.equal(simulator.store.state.players[0].bench[0].cards.length, 1,
      'every projected native action must dispatch through the pinned Store');
  }
});


test('pinned Store validates real attack and ability actions and skips only known unplayable items', {
  skip: !fs.existsSync(compiledActionEnumerator),
  timeout: 30000
}, () => {
  const enginePin = runner.V3_FIXTURE.engineCommit;
  const native = runner.loadNativeRoleDependencies({ enginePin });
  const withValidationRandom = createValidationRandomScope({
    ambientRandom: Math.random,
    physicalRandom: seededRandom(0x51a7e123)
  });
  const manager = native.CardManager.getInstance();
  let nextCardId = 200000;
  function cloneCard(fullName) {
    const card = manager.getCardByName(fullName);
    assert.ok(card, 'CardManager must resolve ' + fullName);
    card.id = nextCardId++;
    return card;
  }
  const pidgeotDefinition = manager.getAllCards().find(card =>
    card instanceof native.PokemonCard &&
    card.name === 'Pidgeot ex' &&
    Array.isArray(card.powers) &&
    card.powers.some(power => power.name === 'Quick Search' && power.useWhenInPlay) &&
    card.attacks.some(attack => attack.name === 'Blustery Wind')
  );
  assert.ok(pidgeotDefinition, 'pinned Expanded pool must contain Pidgeot ex Quick Search');
  const pidgeot = cloneCard(pidgeotDefinition.fullName);
  const battleVipPass = cloneCard('Battle VIP Pass FST');
  const vsSeeker = cloneCard('VS Seeker PHF');
  const quickBall = cloneCard('Quick Ball FST');
  const handBasic = manager.getAllCards().find(card =>
    card instanceof native.PokemonCard &&
    card.stage === native.Stage.BASIC &&
    (!Array.isArray(card.powers) || card.powers.length === 0)
  );
  assert.ok(handBasic, 'pinned Expanded pool must contain a Basic Pokémon for Quick Ball');
  const energyDefinition = manager.getAllCards().find(card => card instanceof native.EnergyCard);
  assert.ok(energyDefinition, 'pinned Expanded pool must contain a basic Energy card');
  const energyOne = cloneCard(energyDefinition.fullName);
  const energyTwo = cloneCard(energyDefinition.fullName);
  const opponentActive = cloneCard(handBasic.fullName);

  function makePlayer(id, activeCard) {
    const player = new native.Player();
    player.id = id;
    player.active = new native.PokemonCardList();
    player.active.cards = [activeCard];
    player.active.hp = activeCard.hp;
    player.active.damage = 0;
    player.active.energies.cards = [];
    player.active.tools = [];
    player.active.specialConditions = [];
    player.bench = Array.from({ length: 5 }, () => new native.PokemonCardList());
    player.prizes = Array.from({ length: 6 }, () => {
      const prize = new native.CardList();
      prize.cards = [cloneCard(handBasic.fullName)];
      return prize;
    });
    player.deck.cards = Array.from({ length: 30 }, () => cloneCard(handBasic.fullName));
    player.hand.cards = [];
    player.discard.cards = [];
    player.stadium.cards = [];
    player.lostzone.cards = [];
    player.supporter.cards = [];
    player.playableCardIds = [];
    player.playableHandAbilityCardIds = [];
    player.supporterTurn = 0;
    player.canEvolve = false;
    return player;
  }

  const candidate = makePlayer(0, pidgeot);
  candidate.active.energies.cards = [energyOne, energyTwo];
  candidate.hand.cards = [battleVipPass, vsSeeker, quickBall, cloneCard(handBasic.fullName)];
  candidate.playableCardIds = candidate.hand.cards.map(card => card.id);
  const opponent = makePlayer(1, opponentActive);
  const initialState = new native.State();
  initialState.players = [candidate, opponent];
  initialState.activePlayer = 0;
  initialState.phase = native.GamePhase.PLAYER_TURN;
  initialState.turn = 3;
  initialState.prompts = [];
  initialState.gameSettings.format = native.Format.EXPANDED;
  initialState.gameSettings.sandboxMode = false;
  const simulator = withValidationRandom(() => new native.Simulator(initialState));
  const state = simulator.store.state;
  const currentPlayer = state.players[0];
  const enumerator = adapterModule.createKnownCapFreeActionEnumerator({ native, enginePin });
  const attack = enumerator.attackActions(state, currentPlayer)
    .find(action => action.name === 'Blustery Wind');
  const ability = enumerator.abilityActions(state, currentPlayer)
    .find(action => action.name === 'Quick Search');
  const items = enumerator.playItemActions(state, currentPlayer);
  const itemByName = new Map(items.map(action => [
    currentPlayer.hand.cards[action.handIndex]?.fullName, action
  ]));
  assert.ok(attack, 'adapter must expose Pidgeot ex Blustery Wind');
  assert.ok(ability, 'adapter must expose Pidgeot ex Quick Search');
  assert.ok(itemByName.has('Battle VIP Pass FST'));
  assert.ok(itemByName.has('VS Seeker PHF'));
  assert.ok(itemByName.has('Quick Ball FST'));
  const pass = enumerator.enumerate(state, currentPlayer, currentPlayer.id)
    .find(action => action.type === 'PASS_TURN');
  const selectedActions = [
    attack, ability,
    itemByName.get('Battle VIP Pass FST'),
    itemByName.get('VS Seeker PHF'),
    itemByName.get('Quick Ball FST'),
    pass
  ];
  const selectedEnumerator = { enumerate: () => selectedActions };
  const frontier = withValidationRandom(() => frontierModule.buildNativeActionFrontier({
    state, actorSeat: 0, native, enumerator: selectedEnumerator
  }));

  assert.equal(frontier.diagnostics.enumeratedCount, 6);
  assert.equal(frontier.diagnostics.validatedCount, 4);
  assert.equal(frontier.diagnostics.rejectedCount, 2);
  assert.equal(frontier.diagnostics.unsupportedCount, 0);
  assert.deepEqual(frontier.actionFrontier.items.map(item => item.kind),
    ['attack', 'use-ability', 'play-card', 'pass']);
  assert.ok(frontier.actionFrontier.items.some(item =>
    item.kind === 'attack' && item.attackName === 'Blustery Wind'));
  assert.ok(frontier.actionFrontier.items.some(item =>
    item.kind === 'use-ability' && item.publicMetadata?.abilityName === 'Quick Search'));
  assert.ok(frontier.actionFrontier.items.some(item =>
    item.kind === 'play-card' && item.actorPrinting === 'Quick Ball FST'));
  assert.equal(frontier.actionFrontier.items.some(item =>
    item.actorPrinting === 'Battle VIP Pass FST' || item.actorPrinting === 'VS Seeker PHF'), false);

  for (const kind of ['attack', 'use-ability']) {
    const item = frontier.actionFrontier.items.find(candidate => candidate.kind === kind);
    const freshSimulator = withValidationRandom(() => new native.Simulator(state));
    frontierModule.dispatchSelectedNativeAction({
      store: freshSimulator.store,
      frontier,
      token: item.token,
      state: freshSimulator.store.state,
      actorSeat: 0,
      native,
      withValidationRandom
    });
  }
});


test('pinned Store frontier projects and revalidates actions for physical seat 1', {
  skip: !fs.existsSync(compiledActionEnumerator),
  timeout: 30000
}, () => {
  const enginePin = runner.V3_FIXTURE.engineCommit;
  const native = runner.loadNativeRoleDependencies({ enginePin });
  const withValidationRandom = createValidationRandomScope({
    ambientRandom: Math.random,
    physicalRandom: seededRandom(0x51a7e124)
  });
  const manager = native.CardManager.getInstance();
  let nextCardId = 400000;
  function cloneCard(fullName) {
    const card = manager.getCardByName(fullName);
    assert.ok(card, 'CardManager must resolve ' + fullName);
    card.id = nextCardId++;
    return card;
  }

  const pidgeotDefinition = manager.getAllCards().find(card =>
    card instanceof native.PokemonCard &&
    card.name === 'Pidgeot ex' &&
    Array.isArray(card.powers) &&
    card.powers.some(power => power.name === 'Quick Search' && power.useWhenInPlay) &&
    card.attacks.some(attack => attack.name === 'Blustery Wind')
  );
  assert.ok(pidgeotDefinition, 'pinned Expanded pool must contain Pidgeot ex Quick Search');
  const pidgeot = cloneCard(pidgeotDefinition.fullName);
  const battleVipPass = cloneCard('Battle VIP Pass FST');
  const vsSeeker = cloneCard('VS Seeker PHF');
  const quickBall = cloneCard('Quick Ball FST');
  const handBasicDefinition = manager.getAllCards().find(card =>
    card instanceof native.PokemonCard &&
    card.stage === native.Stage.BASIC &&
    (!Array.isArray(card.powers) || card.powers.length === 0)
  );
  assert.ok(handBasicDefinition);
  const energyDefinition = manager.getAllCards().find(card => card instanceof native.EnergyCard);
  assert.ok(energyDefinition);
  const energyOne = cloneCard(energyDefinition.fullName);
  const energyTwo = cloneCard(energyDefinition.fullName);
  const opponentActive = cloneCard(handBasicDefinition.fullName);

  function makePlayer(id, activeCard) {
    const player = new native.Player();
    player.id = id;
    player.active = new native.PokemonCardList();
    player.active.cards = [activeCard];
    player.active.hp = activeCard.hp;
    player.active.damage = 0;
    player.active.energies.cards = [];
    player.active.tools = [];
    player.active.specialConditions = [];
    player.bench = Array.from({ length: 5 }, () => new native.PokemonCardList());
    player.prizes = Array.from({ length: 6 }, () => {
      const prize = new native.CardList();
      prize.cards = [cloneCard(handBasicDefinition.fullName)];
      return prize;
    });
    player.deck.cards = Array.from({ length: 30 }, () => cloneCard(handBasicDefinition.fullName));
    player.hand.cards = [];
    player.playableCardIds = [];
    player.playableHandAbilityCardIds = [];
    player.canEvolve = false;
    return player;
  }

  const candidate = makePlayer(1, pidgeot);
  candidate.active.energies.cards = [energyOne, energyTwo];
  candidate.hand.cards = [
    battleVipPass, vsSeeker, quickBall, cloneCard(handBasicDefinition.fullName)
  ];
  candidate.playableCardIds = candidate.hand.cards.map(card => card.id);
  const opponent = makePlayer(0, opponentActive);
  const initialState = new native.State();
  initialState.players = [opponent, candidate];
  initialState.activePlayer = 1;
  initialState.phase = native.GamePhase.PLAYER_TURN;
  initialState.turn = 3;
  initialState.prompts = [];
  initialState.gameSettings.format = native.Format.EXPANDED;
  initialState.gameSettings.sandboxMode = false;
  const simulator = withValidationRandom(() => new native.Simulator(initialState));
  const state = simulator.store.state;
  const actor = state.players[1];
  const enumerator = adapterModule.createKnownCapFreeActionEnumerator({ native, enginePin });
  const attack = enumerator.attackActions(state, actor)
    .find(action => action.name === 'Blustery Wind');
  const ability = enumerator.abilityActions(state, actor)
    .find(action => action.name === 'Quick Search');
  const items = enumerator.playItemActions(state, actor);
  const itemByName = new Map(items.map(action => [
    actor.hand.cards[action.handIndex]?.fullName, action
  ]));
  assert.ok(attack);
  assert.ok(ability);
  assert.ok(itemByName.has('Battle VIP Pass FST'));
  assert.ok(itemByName.has('VS Seeker PHF'));
  assert.ok(itemByName.has('Quick Ball FST'));
  const pass = enumerator.enumerate(state, actor, actor.id).find(action => action.type === 'PASS_TURN');
  const selectedActions = [
    attack, ability,
    itemByName.get('Battle VIP Pass FST'),
    itemByName.get('VS Seeker PHF'),
    itemByName.get('Quick Ball FST'),
    pass
  ];
  const frontier = withValidationRandom(() => frontierModule.buildNativeActionFrontier({
    state, actorSeat: 1, native, enumerator: { enumerate: () => selectedActions }
  }));

  assert.equal(frontier.diagnostics.enumeratedCount, 6);
  assert.equal(frontier.diagnostics.validatedCount, 4);
  assert.equal(frontier.diagnostics.rejectedCount, 2);
  assert.deepEqual(frontier.actionFrontier.items.map(item => item.kind),
    ['attack', 'use-ability', 'play-card', 'pass']);
  const abilityItem = frontier.actionFrontier.items.find(item => item.kind === 'use-ability');
  assert.equal(abilityItem.publicMetadata.isOwnerVisible, true);
  assert.equal(frontier.actionFrontier.items.some(item =>
    item.actorPrinting === 'Battle VIP Pass FST' || item.actorPrinting === 'VS Seeker PHF'), false);

  for (const kind of ['attack', 'use-ability']) {
    const item = frontier.actionFrontier.items.find(candidate => candidate.kind === kind);
    const freshSimulator = withValidationRandom(() => new native.Simulator(state));
    frontierModule.dispatchSelectedNativeAction({
      store: freshSimulator.store,
      frontier,
      token: item.token,
      state: freshSimulator.store.state,
      actorSeat: 1,
      native,
      withValidationRandom
    });
  }
});

test('pinned Store frontier continues after ordinary hand-lock, Stadium-suppression, and retreat rejections', {
  skip: !fs.existsSync(compiledActionEnumerator),
  timeout: 30000
}, () => {
  const enginePin = runner.V3_FIXTURE.engineCommit;
  const native = runner.loadNativeRoleDependencies({ enginePin });
  const withValidationRandom = createValidationRandomScope({
    ambientRandom: Math.random,
    physicalRandom: seededRandom(0x51a7e125)
  });
  const manager = native.CardManager.getInstance();
  let nextCardId = 500000;
  function cloneCard(fullName) {
    const card = manager.getCardByName(fullName);
    assert.ok(card, 'CardManager must resolve ' + fullName);
    card.id = nextCardId++;
    return card;
  }
  const activePokemon = cloneCard('Shadow Rider Calyrex V CRE');
  const basicDefinition = manager.getAllCards().find(card =>
    card instanceof native.PokemonCard &&
    card.stage === native.Stage.BASIC &&
    (!Array.isArray(card.powers) || card.powers.length === 0)
  );
  const supporterDefinition = manager.getAllCards().find(card =>
    card instanceof native.TrainerCard && card.trainerType === native.TrainerType.SUPPORTER
  );
  const toolDefinition = manager.getAllCards().find(card =>
    card instanceof native.TrainerCard && card.trainerType === native.TrainerType.TOOL
  );
  const stadiumDefinitions = manager.getAllCards().filter(card =>
    card instanceof native.TrainerCard && card.trainerType === native.TrainerType.STADIUM
  );
  const energyDefinition = manager.getAllCards().find(card =>
    card instanceof native.EnergyCard && card.energyType !== native.EnergyType.SPECIAL
  );
  assert.ok(basicDefinition && supporterDefinition && toolDefinition && energyDefinition);
  assert.ok(stadiumDefinitions.length >= 2, 'two distinct Stadium printings are required');
  const quickBall = cloneCard('Quick Ball FST');
  const supporter = cloneCard(supporterDefinition.fullName);
  const stadiumInHand = cloneCard(stadiumDefinitions[1].fullName);
  const stadiumInPlay = cloneCard(stadiumDefinitions[0].fullName);
  const tool = cloneCard(toolDefinition.fullName);
  const energy = cloneCard(energyDefinition.fullName);
  const handBasic = cloneCard(basicDefinition.fullName);
  const opponentActive = cloneCard(basicDefinition.fullName);

  function makePlayer(id, activeCard) {
    const player = new native.Player();
    player.id = id;
    player.active = new native.PokemonCardList();
    player.active.cards = [activeCard];
    player.active.hp = activeCard.hp;
    player.active.damage = 0;
    player.active.energies.cards = [];
    player.active.tools = [];
    player.active.specialConditions = [];
    player.bench = Array.from({ length: 5 }, () => new native.PokemonCardList());
    player.prizes = Array.from({ length: 6 }, () => {
      const prize = new native.CardList();
      prize.cards = [cloneCard(basicDefinition.fullName)];
      return prize;
    });
    player.deck.cards = Array.from({ length: 30 }, () => cloneCard(basicDefinition.fullName));
    player.hand.cards = [];
    player.playableCardIds = [];
    player.playableHandAbilityCardIds = [];
    player.canEvolve = false;
    return player;
  }

  const candidate = makePlayer(0, activePokemon);
  const benchPokemon = cloneCard(basicDefinition.fullName);
  candidate.bench[0].cards = [benchPokemon];
  candidate.bench[0].hp = benchPokemon.hp;
  candidate.bench[0].damage = 0;
  candidate.bench[0].energies.cards = [];
  candidate.bench[0].tools = [];
  candidate.bench[0].specialConditions = [];
  candidate.hand.cards = [quickBall, supporter, stadiumInHand, tool, energy, handBasic];
  candidate.playableCardIds = candidate.hand.cards.map(card => card.id);
  candidate.cannotPlayItemCards = true;
  candidate.cannotPlaySupporterCards = true;
  candidate.cannotPlayStadiumCards = true;
  candidate.cannotPlayToolCards = true;
  candidate.cannotPlayEnergyCards = true;
  candidate.cannotPlayPokemonCards = true;
  const opponent = makePlayer(1, opponentActive);
  opponent.stadium.cards = [stadiumInPlay];
  opponent.stadiumAndToolHaveNoEffectTurnsRemaining = 1;

  const initialState = new native.State();
  initialState.players = [candidate, opponent];
  initialState.activePlayer = 0;
  initialState.phase = native.GamePhase.PLAYER_TURN;
  initialState.turn = 3;
  initialState.prompts = [];
  initialState.gameSettings.format = native.Format.EXPANDED;
  initialState.gameSettings.sandboxMode = false;
  const simulator = withValidationRandom(() => new native.Simulator(initialState));
  const state = simulator.store.state;
  const actor = state.players[0];
  assert.equal(state.players[1].stadiumAndToolHaveNoEffectTurnsRemaining, 1);
  const enumerator = adapterModule.createKnownCapFreeActionEnumerator({ native, enginePin });
  const candidates = enumerator.enumerate(state, actor, actor.id);
  assert.ok(candidates.some(action => action.type === 'RETREAT_ACTION'));
  assert.ok(candidates.some(action => action.type === 'USE_STADIUM_ACTION'));
  assert.ok(candidates.some(action => action.type === 'PLAY_CARD_ACTION'));
  const frontier = withValidationRandom(() => frontierModule.buildNativeActionFrontier({
    state, actorSeat: 0, native, enumerator
  }));

  assert.ok(frontier.diagnostics.rejectedCount >= 8,
    'all lock/retreat/stadium candidates must be rejected without aborting the frontier');
  assert.ok(frontier.actionFrontier.items.some(item => item.kind === 'pass'),
    'a later legal Pass action must survive earlier rejected candidates');
  assert.equal(frontier.actionFrontier.items.some(item => item.kind === 'retreat'), false);
  assert.equal(frontier.actionFrontier.items.some(item => item.kind === 'use-stadium'), false);
  const blockedPrintings = [
    'Quick Ball FST', supporter.fullName, stadiumInHand.fullName,
    tool.fullName, energy.fullName, handBasic.fullName
  ];
  assert.equal(frontier.actionFrontier.items.some(item =>
    blockedPrintings.includes(item.actorPrinting)), false);
});

test('pinned Store rejects an already-used Quick Search ability and preserves Pass', {
  skip: !fs.existsSync(compiledActionEnumerator),
  timeout: 30000
}, () => {
  const enginePin = runner.V3_FIXTURE.engineCommit;
  const native = runner.loadNativeRoleDependencies({ enginePin });
  const withValidationRandom = createValidationRandomScope({
    ambientRandom: Math.random,
    physicalRandom: seededRandom(0x51a7e126)
  });
  const manager = native.CardManager.getInstance();
  let nextCardId = 600000;
  function cloneCard(fullName) {
    const card = manager.getCardByName(fullName);
    assert.ok(card, 'CardManager must resolve ' + fullName);
    card.id = nextCardId++;
    return card;
  }
  const pidgeotDefinition = manager.getAllCards().find(card =>
    card instanceof native.PokemonCard &&
    card.name === 'Pidgeot ex' &&
    Array.isArray(card.powers) &&
    card.powers.some(power => power.name === 'Quick Search' && power.useWhenInPlay)
  );
  const basicDefinition = manager.getAllCards().find(card =>
    card instanceof native.PokemonCard &&
    card.stage === native.Stage.BASIC &&
    (!Array.isArray(card.powers) || card.powers.length === 0)
  );
  assert.ok(pidgeotDefinition, 'pinned card pool must include Pidgeot ex Quick Search');
  assert.ok(basicDefinition);
  const pidgeot = cloneCard(pidgeotDefinition.fullName);
  const handCard = cloneCard('Quick Ball FST');
  const opponentActive = cloneCard(basicDefinition.fullName);

  const candidate = new native.Player();
  candidate.id = 0;
  candidate.active = new native.PokemonCardList();
  candidate.active.cards = [pidgeot];
  candidate.active.hp = pidgeot.hp;
  candidate.active.damage = 0;
  candidate.active.energies.cards = [];
  candidate.active.tools = [];
  candidate.active.specialConditions = [];
  candidate.bench = Array.from({ length: 5 }, () => new native.PokemonCardList());
  candidate.prizes = Array.from({ length: 6 }, () => {
    const prize = new native.CardList();
    prize.cards = [cloneCard(basicDefinition.fullName)];
    return prize;
  });
  candidate.deck.cards = Array.from({ length: 30 }, () => cloneCard(basicDefinition.fullName));
  candidate.hand.cards = [handCard];
  candidate.playableCardIds = [handCard.id];
  candidate.playableHandAbilityCardIds = [];
  candidate.canEvolve = false;

  const opponent = new native.Player();
  opponent.id = 1;
  opponent.active = new native.PokemonCardList();
  opponent.active.cards = [opponentActive];
  opponent.active.hp = opponentActive.hp;
  opponent.active.damage = 0;
  opponent.active.energies.cards = [];
  opponent.active.tools = [];
  opponent.active.specialConditions = [];
  opponent.bench = Array.from({ length: 5 }, () => new native.PokemonCardList());
  opponent.prizes = Array.from({ length: 6 }, () => {
    const prize = new native.CardList();
    prize.cards = [cloneCard(basicDefinition.fullName)];
    return prize;
  });
  opponent.deck.cards = Array.from({ length: 30 }, () => cloneCard(basicDefinition.fullName));
  opponent.hand.cards = [];
  opponent.playableCardIds = [];
  opponent.playableHandAbilityCardIds = [];
  opponent.canEvolve = false;

  const initialState = new native.State();
  initialState.players = [candidate, opponent];
  initialState.activePlayer = 0;
  initialState.phase = native.GamePhase.PLAYER_TURN;
  initialState.turn = 3;
  initialState.prompts = [];
  initialState.gameSettings.format = native.Format.EXPANDED;
  initialState.gameSettings.sandboxMode = false;
  const simulator = withValidationRandom(() => new native.Simulator(initialState));
  let state = simulator.store.state;
  let actor = state.players[0];
  const enumerator = adapterModule.createKnownCapFreeActionEnumerator({ native, enginePin });
  const firstAbility = enumerator.abilityActions(state, actor)
    .find(action => action.name === 'Quick Search');
  assert.ok(firstAbility, 'native ActionEnumerator must expose Quick Search');
  withValidationRandom(() => simulator.store.dispatch(firstAbility));
  const resolvedPromptNames = resolveNativeSearchPrompts({
    store: simulator.store,
    state,
    withValidationRandom
  });
  state = simulator.store.state;
  actor = state.players[0];
  assert.ok(resolvedPromptNames.includes('ChooseCardsPrompt'),
    'the first Quick Search use must resolve its native search prompt');
  assert.equal((state.prompts ?? []).filter(prompt => prompt.result === undefined).length, 0,
    'the first Quick Search use must settle before the repeated-use witness');
  const repeatedAbility = enumerator.abilityActions(state, actor)
    .find(action => action.name === 'Quick Search');
  assert.ok(repeatedAbility,
    'pinned ActionEnumerator intentionally continues to emit the already-used Quick Search');
  const pass = enumerator.enumerate(state, actor, actor.id).find(action => action.type === 'PASS_TURN');
  const frontier = withValidationRandom(() => frontierModule.buildNativeActionFrontier({
    state,
    actorSeat: 0,
    native,
    enumerator: { enumerate: () => [repeatedAbility, pass] }
  }));
  assert.equal(frontier.diagnostics.rejectedCount, 1);
  assert.deepEqual(frontier.actionFrontier.items.map(item => item.kind), ['pass']);
});


test('pinned Item canPlay and native rejection paths preserve Pass', {
  skip: !fs.existsSync(compiledActionEnumerator),
  timeout: 30000
}, () => {
  const enginePin = runner.V3_FIXTURE.engineCommit;
  const native = runner.loadNativeRoleDependencies({ enginePin });
  const withValidationRandom = createValidationRandomScope({
    ambientRandom: Math.random,
    physicalRandom: seededRandom(0x51a7e127)
  });
  const manager = native.CardManager.getInstance();
  let nextCardId = 700000;
  function cloneCard(fullName) {
    const card = manager.getCardByName(fullName);
    assert.ok(card, 'CardManager must resolve ' + fullName);
    card.id = nextCardId++;
    return card;
  }
  const basicDefinition = manager.getAllCards().find(card =>
    card instanceof native.PokemonCard &&
    card.stage === native.Stage.BASIC &&
    (!Array.isArray(card.powers) || card.powers.length === 0)
  );
  assert.ok(basicDefinition, 'pinned card pool must contain a Basic Pokémon');

  function makePlayer(id, activeCard) {
    const player = new native.Player();
    player.id = id;
    player.active = new native.PokemonCardList();
    player.active.cards = [activeCard];
    player.active.hp = activeCard.hp;
    player.active.damage = 0;
    player.active.energies.cards = [];
    player.active.tools = [];
    player.active.specialConditions = [];
    player.bench = Array.from({ length: 5 }, () => new native.PokemonCardList());
    player.prizes = Array.from({ length: 6 }, () => {
      const prize = new native.CardList();
      prize.cards = [cloneCard(basicDefinition.fullName)];
      return prize;
    });
    player.deck.cards = Array.from({ length: 30 }, () => cloneCard(basicDefinition.fullName));
    player.hand.cards = [];
    player.discard.cards = [];
    player.stadium.cards = [];
    player.lostzone.cards = [];
    player.supporter.cards = [];
    player.playableCardIds = [];
    player.playableHandAbilityCardIds = [];
    player.canEvolve = false;
    return player;
  }

  for (const fullName of [
    'Unfair Stamp TWM',
    'Quick Ball SSH',
    'Mysterious Treasure FLI'
  ]) {
    const candidate = makePlayer(0, cloneCard(basicDefinition.fullName));
    const opponent = makePlayer(1, cloneCard(basicDefinition.fullName));
    const item = cloneCard(fullName);
    candidate.hand.cards = [item];
    candidate.playableCardIds = [item.id];

    const initialState = new native.State();
    initialState.players = [candidate, opponent];
    initialState.activePlayer = 0;
    initialState.phase = native.GamePhase.PLAYER_TURN;
    initialState.turn = 3;
    initialState.prompts = [];
    initialState.gameSettings.format = native.Format.EXPANDED;
    initialState.gameSettings.sandboxMode = false;

    const simulator = withValidationRandom(() => new native.Simulator(initialState));
    const state = simulator.store.state;
    const actor = state.players[0];
    const enumerator = adapterModule.createKnownCapFreeActionEnumerator({ native, enginePin });
    const itemAction = enumerator.playItemActions(state, actor).find(action =>
      actor.hand.cards[action.handIndex]?.fullName === fullName
    );
    const pass = enumerator.enumerate(state, actor, actor.id)
      .find(action => action.type === 'PASS_TURN');
    assert.ok(itemAction, fullName + ' must remain visible in the native candidate enumeration');
    assert.ok(pass, 'a later legal Pass action must exist');

    const before = {
      hand: actor.hand.cards.map(card => card.fullName),
      deckCount: actor.deck.cards.length,
      discardCount: actor.discard.cards.length,
      supporterCount: actor.supporter.cards.length
    };
    const frontier = withValidationRandom(() => frontierModule.buildNativeActionFrontier({
      state,
      actorSeat: 0,
      native,
      enumerator: { enumerate: () => [itemAction, pass] }
    }));

    assert.equal(frontier.diagnostics.enumeratedCount, 2, fullName);
    assert.equal(frontier.diagnostics.rejectedCount, 1, fullName);
    assert.ok(frontier.diagnostics.preflightRejectedCount <= 1, fullName);
    console.log('AGENT3_ITEM_REJECTION_PATH', JSON.stringify({
      fullName,
      preflightRejectedCount: frontier.diagnostics.preflightRejectedCount,
      nativeRejectedCount: frontier.diagnostics.rejectedCount,
      validatedCount: frontier.diagnostics.validatedCount
    }));
    assert.equal(frontier.diagnostics.validatedCount, 1, fullName);
    assert.deepEqual(frontier.actionFrontier.items.map(item => item.kind), ['pass'], fullName);
    assert.deepEqual({
      hand: actor.hand.cards.map(card => card.fullName),
      deckCount: actor.deck.cards.length,
      discardCount: actor.discard.cards.length,
      supporterCount: actor.supporter.cards.length
    }, before, fullName + ' preflight must not consume or mutate the live Store');
  }
});

test('pinned Store rejects Forest Seal Stone after VSTAR use and preserves Pass', {
  skip: !fs.existsSync(compiledActionEnumerator),
  timeout: 30000
}, () => {
  const enginePin = runner.V3_FIXTURE.engineCommit;
  const native = runner.loadNativeRoleDependencies({ enginePin });
  const withValidationRandom = createValidationRandomScope({
    ambientRandom: Math.random,
    physicalRandom: seededRandom(0x51a7e128)
  });
  const manager = native.CardManager.getInstance();
  let nextCardId = 800000;
  function cloneCard(fullName) {
    const card = manager.getCardByName(fullName);
    assert.ok(card, 'CardManager must resolve ' + fullName);
    card.id = nextCardId++;
    return card;
  }
  const activePokemon = cloneCard('Shadow Rider Calyrex V CRE');
  const forestSealStone = cloneCard('Forest Seal Stone SIT');
  const basicDefinition = manager.getAllCards().find(card =>
    card instanceof native.PokemonCard &&
    card.stage === native.Stage.BASIC &&
    (!Array.isArray(card.powers) || card.powers.length === 0)
  );
  assert.ok(basicDefinition);

  function makePlayer(id, activeCard) {
    const player = new native.Player();
    player.id = id;
    player.active = new native.PokemonCardList();
    player.active.cards = [activeCard];
    player.active.hp = activeCard.hp;
    player.active.damage = 0;
    player.active.energies.cards = [];
    player.active.tools = [];
    player.active.specialConditions = [];
    player.bench = Array.from({ length: 5 }, () => new native.PokemonCardList());
    player.prizes = Array.from({ length: 6 }, () => {
      const prize = new native.CardList();
      prize.cards = [cloneCard(basicDefinition.fullName)];
      return prize;
    });
    player.deck.cards = Array.from({ length: 30 }, () => cloneCard(basicDefinition.fullName));
    player.hand.cards = [];
    player.playableCardIds = [];
    player.playableHandAbilityCardIds = [];
    player.canEvolve = false;
    return player;
  }

  const candidate = makePlayer(0, activePokemon);
  candidate.active.tools = [forestSealStone];
  const opponent = makePlayer(1, cloneCard(basicDefinition.fullName));
  const initialState = new native.State();
  initialState.players = [candidate, opponent];
  initialState.activePlayer = 0;
  initialState.phase = native.GamePhase.PLAYER_TURN;
  initialState.turn = 3;
  initialState.prompts = [];
  initialState.gameSettings.format = native.Format.EXPANDED;
  initialState.gameSettings.sandboxMode = false;

  const simulator = withValidationRandom(() => new native.Simulator(initialState));
  let state = simulator.store.state;
  let actor = state.players[0];
  const enumerator = adapterModule.createKnownCapFreeActionEnumerator({ native, enginePin });
  const firstAbility = enumerator.abilityActions(state, actor)
    .find(action => action.name === 'Star Alchemy');
  assert.ok(firstAbility, 'attached Forest Seal Stone must expose Star Alchemy before use');
  withValidationRandom(() => simulator.store.dispatch(firstAbility));
  const resolvedPromptNames = resolveNativeSearchPrompts({
    store: simulator.store,
    state,
    withValidationRandom
  });
  state = simulator.store.state;
  actor = state.players[0];
  assert.ok(resolvedPromptNames.includes('ChooseCardsPrompt'),
    'first Star Alchemy use must resolve its native search prompt');
  assert.equal(state.players[0].usedVSTAR, true,
    'the real native Store use must mark the VSTAR Power as spent');
  assert.equal((state.prompts ?? []).some(prompt => prompt.result === undefined), false,
    'the first Star Alchemy use must settle before repeated-use validation');
  const ability = enumerator.abilityActions(state, actor)
    .find(action => action.name === 'Star Alchemy');
  const pass = enumerator.enumerate(state, actor, actor.id)
    .find(action => action.type === 'PASS_TURN');
  assert.ok(ability, 'adapter intentionally continues to enumerate the spent VSTAR action');
  assert.ok(pass);

  const frontier = withValidationRandom(() => frontierModule.buildNativeActionFrontier({
    state,
    actorSeat: 0,
    native,
    enumerator: { enumerate: () => [ability, pass] }
  }));

  assert.equal(frontier.diagnostics.rejectedCount, 1);
  assert.equal(frontier.diagnostics.preflightRejectedCount, 0);
  assert.equal(frontier.diagnostics.validatedCount, 1);
  assert.deepEqual(frontier.actionFrontier.items.map(item => item.kind), ['pass']);
  assert.equal(state.players[0].usedVSTAR, true);
  assert.equal(state.players[0].active.tools[0].fullName, 'Forest Seal Stone SIT');
});

test('pinned Store rejects a GX attack after GX use and preserves a legal attack', {
  skip: !fs.existsSync(compiledActionEnumerator),
  timeout: 30000
}, () => {
  const enginePin = runner.V3_FIXTURE.engineCommit;
  const native = runner.loadNativeRoleDependencies({ enginePin });
  const withValidationRandom = createValidationRandomScope({
    ambientRandom: Math.random,
    physicalRandom: seededRandom(0x51a7e129)
  });
  const manager = native.CardManager.getInstance();
  let nextCardId = 900000;
  function cloneCard(fullName) {
    const card = manager.getCardByName(fullName);
    assert.ok(card, 'CardManager must resolve ' + fullName);
    card.id = nextCardId++;
    return card;
  }
  const attacker = cloneCard('Trevenant & Dusknoir-GX SMP');
  assert.ok(attacker.attacks.some(attack => attack.name === 'Pale Moon-GX'));
  assert.ok(attacker.attacks.some(attack => attack.name === 'Night Watch'));
  const psychicDefinition = manager.getCardByName('Psychic Energy SVE');
  assert.ok(psychicDefinition, 'pinned card pool must contain Psychic Energy SVE');
  const basicDefinition = manager.getAllCards().find(card =>
    card instanceof native.PokemonCard &&
    card.stage === native.Stage.BASIC &&
    (!Array.isArray(card.powers) || card.powers.length === 0)
  );
  assert.ok(basicDefinition);

  function makePlayer(id, activeCard) {
    const player = new native.Player();
    player.id = id;
    player.active = new native.PokemonCardList();
    player.active.cards = [activeCard];
    player.active.hp = activeCard.hp;
    player.active.damage = 0;
    player.active.energies.cards = [];
    player.active.tools = [];
    player.active.specialConditions = [];
    player.bench = Array.from({ length: 5 }, () => new native.PokemonCardList());
    player.prizes = Array.from({ length: 6 }, () => {
      const prize = new native.CardList();
      prize.cards = [cloneCard(basicDefinition.fullName)];
      return prize;
    });
    player.deck.cards = Array.from({ length: 30 }, () => cloneCard(basicDefinition.fullName));
    player.hand.cards = [];
    player.playableCardIds = [];
    player.playableHandAbilityCardIds = [];
    player.canEvolve = false;
    return player;
  }

  const candidate = makePlayer(0, attacker);
  candidate.active.energies.cards = Array.from({ length: 4 }, () =>
    cloneCard(psychicDefinition.fullName));
  const opponent = makePlayer(1, cloneCard(basicDefinition.fullName));
  const initialState = new native.State();
  initialState.players = [candidate, opponent];
  initialState.activePlayer = 0;
  initialState.phase = native.GamePhase.PLAYER_TURN;
  initialState.turn = 3;
  initialState.prompts = [];
  initialState.gameSettings.format = native.Format.EXPANDED;
  initialState.gameSettings.sandboxMode = false;

  const simulator = withValidationRandom(() => new native.Simulator(initialState));
  const state = simulator.store.state;
  state.players[0].usedGX = true;
  const actor = state.players[0];
  const enumerator = adapterModule.createKnownCapFreeActionEnumerator({ native, enginePin });
  const attacks = enumerator.attackActions(state, actor);
  const gxAttack = attacks.find(action => action.name === 'Pale Moon-GX');
  const legalAttack = attacks.find(action => action.name === 'Night Watch');
  const pass = enumerator.enumerate(state, actor, actor.id)
    .find(action => action.type === 'PASS_TURN');
  assert.ok(gxAttack, 'the pinned frontier must continue to enumerate the used GX attack');
  assert.ok(legalAttack, 'the pinned frontier must retain the other legal attack');
  assert.ok(pass);

  const frontier = withValidationRandom(() => frontierModule.buildNativeActionFrontier({
    state,
    actorSeat: 0,
    native,
    enumerator: { enumerate: () => [gxAttack, legalAttack, pass] }
  }));

  assert.equal(frontier.diagnostics.rejectedCount, 1);
  assert.equal(frontier.diagnostics.preflightRejectedCount, 0);
  assert.equal(frontier.diagnostics.validatedCount, 2);
  assert.ok(frontier.actionFrontier.items.some(item =>
    item.kind === 'attack' && item.attackName === 'Night Watch'));
  assert.ok(frontier.actionFrontier.items.some(item => item.kind === 'pass'));
  assert.equal(frontier.actionFrontier.items.some(item =>
    item.kind === 'attack' && item.attackName === 'Pale Moon-GX'), false);
  assert.equal(state.players[0].usedGX, true);
});


test('pinned Store attaches Forest Seal Stone and uses Star Alchemy through Vileplume Item lock in both physical seats', {
  skip: !fs.existsSync(compiledActionEnumerator),
  timeout: 30000
}, () => {
  const enginePin = runner.V3_FIXTURE.engineCommit;
  const native = runner.loadNativeRoleDependencies({ enginePin });
  const manager = native.CardManager.getInstance();
  let nextCardId = 900000;
  function cloneCard(fullName) {
    const card = manager.getCardByName(fullName);
    assert.ok(card, 'CardManager must resolve ' + fullName);
    card.id = nextCardId++;
    return card;
  }
  const basicDefinition = manager.getAllCards().find(card =>
    card instanceof native.PokemonCard &&
    card.stage === native.Stage.BASIC &&
    (!Array.isArray(card.powers) || card.powers.length === 0)
  );
  assert.ok(basicDefinition, 'pinned Expanded pool must contain a Basic Pokémon without powers');
  const vileplumeDefinition = manager.getAllCards().find(card =>
    card instanceof native.PokemonCard &&
    card.name === 'Vileplume' &&
    typeof card.fullName === 'string' && card.fullName.includes('AOR') &&
    Array.isArray(card.powers) &&
    card.powers.some(power => power.name === 'Irritating Pollen' && power.useWhenInPlay)
  );
  assert.ok(vileplumeDefinition,
    'pinned Twinleaf CardManager must expose Vileplume AOR3 Irritating Pollen; available Vileplume printings: ' +
    manager.getAllCards().filter(card => card.name === 'Vileplume').map(card => card.fullName).join(', '));

  function makePlayer(id, activeCard) {
    const player = new native.Player();
    player.id = id;
    player.active = new native.PokemonCardList();
    player.active.cards = [activeCard];
    player.active.hp = activeCard.hp;
    player.active.damage = 0;
    player.active.energies.cards = [];
    player.active.tools = [];
    player.active.specialConditions = [];
    player.bench = Array.from({ length: 5 }, () => new native.PokemonCardList());
    player.prizes = Array.from({ length: 6 }, () => {
      const prize = new native.CardList();
      prize.cards = [cloneCard(basicDefinition.fullName)];
      return prize;
    });
    player.deck.cards = Array.from({ length: 30 }, () => cloneCard(basicDefinition.fullName));
    player.hand.cards = [];
    player.discard.cards = [];
    player.stadium.cards = [];
    player.lostzone.cards = [];
    player.supporter.cards = [];
    player.playableCardIds = [];
    player.playableHandAbilityCardIds = [];
    player.supporterTurn = 0;
    player.energyPlayedTurn = 0;
    player.canEvolve = false;
    player.usedVSTAR = false;
    return player;
  }

  for (const actorSeat of [0, 1]) {
    const withValidationRandom = createValidationRandomScope({
      ambientRandom: Math.random,
      physicalRandom: seededRandom(0x51a7e130 + actorSeat)
    });
    const candidate = makePlayer(actorSeat, cloneCard(basicDefinition.fullName));
    const opponent = makePlayer(1 - actorSeat, cloneCard(vileplumeDefinition.fullName));
    const shadowRider = cloneCard('Shadow Rider Calyrex V CRE');
    const forestSealStone = cloneCard('Forest Seal Stone SIT');
    const quickBall = cloneCard('Quick Ball FST');
    candidate.bench[0].cards = [shadowRider];
    candidate.bench[0].hp = shadowRider.hp;
    candidate.bench[0].damage = 0;
    candidate.bench[0].energies.cards = [];
    candidate.bench[0].tools = [];
    candidate.bench[0].specialConditions = [];
    candidate.hand.cards = [forestSealStone, quickBall];
    candidate.playableCardIds = candidate.hand.cards.map(card => card.id);

    const initialState = new native.State();
    initialState.players = actorSeat === 0
      ? [candidate, opponent]
      : [opponent, candidate];
    initialState.activePlayer = actorSeat;
    initialState.phase = native.GamePhase.PLAYER_TURN;
    initialState.turn = 3;
    initialState.prompts = [];
    initialState.gameSettings.format = native.Format.EXPANDED;
    initialState.gameSettings.sandboxMode = false;

    const simulator = withValidationRandom(() => new native.Simulator(initialState));
    const state = simulator.store.state;
    const actor = state.players[actorSeat];
    const enumerator = adapterModule.createKnownCapFreeActionEnumerator({ native, enginePin });
    const toolAction = enumerator.attachToolActions(state, actor).find(action =>
      actor.hand.cards[action.handIndex]?.fullName === 'Forest Seal Stone SIT');
    const itemAction = enumerator.playItemActions(state, actor).find(action =>
      actor.hand.cards[action.handIndex]?.fullName === 'Quick Ball FST');
    const pass = enumerator.enumerate(state, actor, actor.id).find(action => action.type === 'PASS_TURN');
    assert.ok(toolAction, 'adapter must expose Forest Seal Stone attachment to the Benched Pokémon V');
    assert.equal(toolAction.target.slot, native.SlotType.BENCH);
    assert.equal(toolAction.target.index, 0);
    assert.ok(itemAction, 'Quick Ball must remain visible as a candidate Item action');
    assert.ok(pass, 'the native Pass action remains available');

    const attachFrontier = withValidationRandom(() => frontierModule.buildNativeActionFrontier({
      state,
      actorSeat,
      native,
      enumerator: { enumerate: () => [toolAction, itemAction, pass] }
    }));
    const attachAdmission = adapterModule.assertKnownCapFreeAdapterAdmissionClear({
      enumerator,
      enginePin,
      frontierDiagnostics: attachFrontier.diagnostics
    });
    assert.equal(attachAdmission.adapter.enginePin, enginePin);
    assert.equal(attachFrontier.diagnostics.enumeratedCount, 3);
    assert.equal(attachFrontier.diagnostics.validatedCount, 2);
    assert.equal(attachFrontier.diagnostics.rejectedCount, 1,
      'Vileplume Irritating Pollen must reject the Item while preserving the Tool');
    assert.equal(attachFrontier.diagnostics.unsupportedCount, 0);
    assert.equal(attachFrontier.diagnostics.truncated, false);
    assert.equal(attachFrontier.diagnostics.omittedCount, 0);
    const toolItem = attachFrontier.actionFrontier.items.find(item =>
      item.kind === 'play-card' && item.actorPrinting === 'Forest Seal Stone SIT');
    assert.ok(toolItem, 'the Tool attachment must survive the Vileplume Item lock');
    assert.equal(attachFrontier.actionFrontier.items.some(item =>
      item.actorPrinting === 'Quick Ball FST'), false,
      'Quick Ball must be absent from the legal frontier under Irritating Pollen');

    const attachEvidence = {};
    frontierModule.dispatchSelectedNativeAction({
      store: simulator.store,
      frontier: attachFrontier,
      token: toolItem.token,
      state,
      actorSeat,
      native,
      withValidationRandom,
      validationEvidence: attachEvidence
    });
    assert.equal(attachEvidence.selectedActionValidated, true);
    assert.equal(attachEvidence.fullOriginalStoreStateUnchanged, true);
    assert.equal(state.players[actorSeat].bench[0].tools[0].fullName,
      'Forest Seal Stone SIT');

    const ability = enumerator.abilityActions(state, actor)
      .find(action => action.name === 'Star Alchemy');
    assert.ok(ability, 'attached Forest Seal Stone must expose Star Alchemy under the Item lock');
    assert.equal(ability.target.slot, native.SlotType.BENCH);
    assert.equal(ability.target.index, 0);
    const passAfterAttach = enumerator.enumerate(state, actor, actor.id).find(action => action.type === 'PASS_TURN');
    const abilityFrontier = withValidationRandom(() => frontierModule.buildNativeActionFrontier({
      state,
      actorSeat,
      native,
      enumerator: { enumerate: () => [ability, passAfterAttach] }
    }));
    assert.equal(abilityFrontier.diagnostics.enumeratedCount, 2);
    assert.equal(abilityFrontier.diagnostics.validatedCount, 2);
    assert.equal(abilityFrontier.diagnostics.rejectedCount, 0);
    const abilityItem = abilityFrontier.actionFrontier.items.find(item =>
      item.kind === 'use-ability' &&
      item.publicMetadata?.abilityName === 'Star Alchemy');
    assert.ok(abilityItem, 'worker frontier must expose Bench Star Alchemy under the Item lock');

    const abilityEvidence = {};
    frontierModule.dispatchSelectedNativeAction({
      store: simulator.store,
      frontier: abilityFrontier,
      token: abilityItem.token,
      state,
      actorSeat,
      native,
      withValidationRandom,
      validationEvidence: abilityEvidence
    });
    assert.equal(abilityEvidence.selectedActionValidated, true);
    assert.equal(abilityEvidence.fullOriginalStoreStateUnchanged, true);
    const resolvedWaits = resolveNativeWaitPrompts({
      store: simulator.store,
      state,
      withValidationRandom
    });
    assert.ok(resolvedWaits.length > 0, 'native Store must expose the opponent wait boundary');
    const prompt = state.prompts.find(candidate =>
      candidate.result === undefined && candidate.constructor.name === 'ChooseCardsPrompt');
    assert.ok(prompt, 'Star Alchemy must open its native search prompt after the wait boundary');
    assert.equal(prompt.playerId, actor.id);
    console.log('AGENT3_NATIVE_FSS_VILEPLUME', JSON.stringify({
      actorSeat,
      opponentLock: vileplumeDefinition.fullName,
      rejectedItem: 'Quick Ball FST',
      attachedTool: state.players[actorSeat].bench[0].tools[0].fullName,
      selectedAbility: abilityItem.publicMetadata.abilityName,
      promptKind: prompt.constructor.name,
      nativeToolValidated: attachEvidence.selectedActionValidated,
      nativeAbilityValidated: abilityEvidence.selectedActionValidated
    }));
  }
});
