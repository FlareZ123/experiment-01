'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const runner = require('../../simulation/evaluation/2026-11/agent36-v3-runner.cjs');
const frontierModule = require('../../simulation/evaluation/2026-11/agent36-native-action-frontier.cjs');
const adapterModule = require('../../simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs');
const { createValidationRandomScope, seededRandom } = require('../../simulation/evaluation/2026-11/agent49-native-fixture-game.cjs');

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
  assert.equal(frontier.diagnostics.enumeratedCount, 9);
  assert.equal(frontier.diagnostics.validatedCount, 9);
  assert.equal(frontier.diagnostics.rejectedCount, 0);
  assert.equal(frontier.diagnostics.unsupportedCount, 0);
  assert.equal(frontier.diagnostics.truncated, false);
  assert.equal(frontier.diagnostics.omittedCount, 0);
  assert.equal(frontier.actionFrontier.items.length, 9);

  for (const item of frontier.actionFrontier.items) {
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
  const zoroark = cloneCard('Zoroark-GX SLG');
  assert.ok(zoroark.powers.some(power => power.name === 'Trade' && power.useWhenInPlay));
  assert.ok(zoroark.attacks.some(attack => attack.name === 'Riotous Beating'));
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

  const candidate = makePlayer(0, zoroark);
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
    .find(action => action.name === 'Riotous Beating');
  const ability = enumerator.abilityActions(state, currentPlayer)
    .find(action => action.name === 'Trade');
  const items = enumerator.playItemActions(state, currentPlayer);
  const itemByName = new Map(items.map(action => [
    currentPlayer.hand.cards[action.handIndex]?.fullName, action
  ]));
  assert.ok(attack, 'adapter must expose Zoroark-GX Riotous Beating');
  assert.ok(ability, 'adapter must expose Zoroark-GX Trade');
  assert.ok(itemByName.has('Battle VIP Pass FST'));
  assert.ok(itemByName.has('VS Seeker PHF'));
  assert.ok(itemByName.has('Quick Ball FST'));
  const pass = enumerator.passTurnActions(state, currentPlayer)[0];
  const selectedActions = [
    attack, ability,
    itemByName.get('Battle VIP Pass FST'),
    itemByName.get('VS Seeker PHF'),
    itemByName.get('Quick Ball FST'),
    pass
  ];
  const quickBallAction=itemByName.get('Quick Ball FST');
  const actionSnapshot=action=>JSON.stringify({
    signature:frontierModule.actionSignature(action),
    keys:Reflect.ownKeys(action).map(String).sort(),
    type:action.type??null,id:action.id??null,handIndex:action.handIndex??null,
    target:action.target&&typeof action.target==='object'?
      Object.fromEntries(Object.keys(action.target).sort().map(key=>[key,action.target[key]])):
      action.target??null
  });
  const quickBallActionBefore=actionSnapshot(quickBallAction);
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
    item.kind === 'attack' && item.attackName === 'Riotous Beating'));
  assert.ok(frontier.actionFrontier.items.some(item =>
    item.kind === 'use-ability' && item.publicMetadata?.abilityName === 'Trade'));
  assert.ok(frontier.actionFrontier.items.some(item =>
    item.kind === 'play-card' && item.actorPrinting === 'Quick Ball FST'));
  assert.equal(frontier.actionFrontier.items.some(item =>
    item.actorPrinting === 'Battle VIP Pass FST' || item.actorPrinting === 'VS Seeker PHF'), false);
  assert.equal(actionSnapshot(quickBallAction),quickBallActionBefore,
    'frontier validation must not mutate the retained Quick Ball PlayCardAction');

  for (const kind of ['attack', 'use-ability','play-card']) {
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
  assert.equal(actionSnapshot(quickBallAction),quickBallActionBefore,
    'selected cloned-Store validation must not mutate the retained Quick Ball PlayCardAction');

  const freshSimulator=withValidationRandom(()=>new native.Simulator(state));
  const freshState=freshSimulator.store.state;
  const freshActor=freshState.players[0];
  const freshEnumerator=adapterModule.createKnownCapFreeActionEnumerator({native,enginePin});
  const freshQuickBallAction=freshEnumerator.playItemActions(freshState,freshActor).find(action=>
    freshActor.hand.cards[action.handIndex]?.fullName==='Quick Ball FST');
  const freshPass=freshEnumerator.passTurnActions(freshState,freshActor)[0];
  assert.ok(freshQuickBallAction,'fresh native enumeration must reconstruct Quick Ball');
  const freshQuickBallActionBefore=actionSnapshot(freshQuickBallAction);
  const freshFrontier=withValidationRandom(()=>frontierModule.buildNativeActionFrontier({
    state:freshState,actorSeat:0,native,
    enumerator:{enumerate:()=>[freshQuickBallAction,freshPass]}
  }));
  const freshQuickBallItem=freshFrontier.actionFrontier.items.find(item=>
    item.actorPrinting==='Quick Ball FST');
  assert.ok(freshQuickBallItem,'fresh Quick Ball must pass the frontier');
  frontierModule.dispatchSelectedNativeAction({
    store:freshSimulator.store,frontier:freshFrontier,token:freshQuickBallItem.token,
    state:freshState,actorSeat:0,native,withValidationRandom
  });
  assert.equal(actionSnapshot(freshQuickBallAction),freshQuickBallActionBefore,
    'freshly enumerated Quick Ball must survive cloned-Store revalidation');
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

  const zoroark = cloneCard('Zoroark-GX SLG');
  assert.ok(zoroark.powers.some(power => power.name === 'Trade' && power.useWhenInPlay));
  assert.ok(zoroark.attacks.some(attack => attack.name === 'Riotous Beating'));
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

  const candidate = makePlayer(1, zoroark);
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
    .find(action => action.name === 'Riotous Beating');
  const ability = enumerator.abilityActions(state, actor)
    .find(action => action.name === 'Trade');
  const items = enumerator.playItemActions(state, actor);
  const itemByName = new Map(items.map(action => [
    actor.hand.cards[action.handIndex]?.fullName, action
  ]));
  assert.ok(attack);
  assert.ok(ability);
  assert.ok(itemByName.has('Battle VIP Pass FST'));
  assert.ok(itemByName.has('VS Seeker PHF'));
  assert.ok(itemByName.has('Quick Ball FST'));
  const pass = enumerator.passTurnActions(state, actor)[0];
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

  for (const kind of ['attack', 'use-ability','play-card']) {
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
  const zoroark = cloneCard('Zoroark-GX SLG');
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

  const candidate = makePlayer(0, zoroark);
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

test('pinned Store rejects an already-used Dedechange ability and preserves Pass', {
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
  const dedenneDefinition = manager.getAllCards().find(card =>
    card instanceof native.PokemonCard &&
    card.name === 'Dedenne-GX' &&
    Array.isArray(card.powers) &&
    card.powers.some(power => power.name === 'Dedechange' && power.useWhenInPlay)
  );
  const basicDefinition = manager.getAllCards().find(card =>
    card instanceof native.PokemonCard &&
    card.stage === native.Stage.BASIC &&
    (!Array.isArray(card.powers) || card.powers.length === 0)
  );
  assert.ok(dedenneDefinition, 'pinned card pool must include Dedenne-GX Dedechange');
  assert.ok(basicDefinition);
  const dedenne = cloneCard(dedenneDefinition.fullName);
  const handCard = cloneCard('Quick Ball FST');
  const opponentActive = cloneCard(basicDefinition.fullName);

  const candidate = new native.Player();
  candidate.id = 0;
  candidate.active = new native.PokemonCardList();
  candidate.active.cards = [dedenne];
  candidate.active.hp = dedenne.hp;
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
    .find(action => action.name === 'Dedechange');
  assert.ok(firstAbility, 'native ActionEnumerator must expose Dedechange');
  withValidationRandom(() => simulator.store.dispatch(firstAbility));
  state = simulator.store.state;
  actor = state.players[0];
  assert.equal((state.prompts ?? []).filter(prompt => prompt.result === undefined).length, 0,
    'the first Dedechange use must settle before the repeated-use witness');
  const repeatedAbility = enumerator.abilityActions(state, actor)
    .find(action => action.name === 'Dedechange');
  assert.ok(repeatedAbility,
    'pinned ActionEnumerator intentionally continues to emit the already-used ability');
  const pass = enumerator.passTurnActions(state, actor)[0];
  const frontier = withValidationRandom(() => frontierModule.buildNativeActionFrontier({
    state,
    actorSeat: 0,
    native,
    enumerator: { enumerate: () => [repeatedAbility, pass] }
  }));
  assert.equal(frontier.diagnostics.rejectedCount, 1);
  assert.deepEqual(frontier.actionFrontier.items.map(item => item.kind), ['pass']);
});


test('pinned Item canPlay predicates prefilter conditional Items on the validation Store and preserve Pass', {
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
    assert.equal(frontier.diagnostics.preflightRejectedCount, 1, fullName);
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
  const state = simulator.store.state;
  state.players[0].usedVSTAR = true;
  const actor = state.players[0];
  const enumerator = adapterModule.createKnownCapFreeActionEnumerator({ native, enginePin });
  const ability = enumerator.abilityActions(state, actor)
    .find(action => action.name === 'Star Alchemy');
  const pass = enumerator.enumerate(state, actor, actor.id)
    .find(action => action.type === 'PASS_TURN');
  assert.ok(ability, 'attached Forest Seal Stone must be enumerated after VSTAR use');
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
  const psychicDefinition = manager.getAllCards().find(card =>
    card instanceof native.EnergyCard &&
    card.energyType === native.EnergyType.PSYCHIC
  );
  assert.ok(psychicDefinition, 'pinned card pool must contain Psychic Energy');
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
  candidate.active.energies.cards = [
    cloneCard(psychicDefinition.fullName),
    cloneCard(psychicDefinition.fullName),
    cloneCard(psychicDefinition.fullName)
  ];
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


test('pinned Night Stretcher effect-target preflight rejects Special Energy-only discard and admits Basic Energy or Pokémon', {
  skip: !fs.existsSync(compiledActionEnumerator),
  timeout: 30000
}, () => {
  const enginePin=runner.V3_FIXTURE.engineCommit;
  const native=runner.loadNativeRoleDependencies({enginePin});
  const withValidationRandom=createValidationRandomScope({
    ambientRandom:Math.random,
    physicalRandom:seededRandom(0x61a7e129)
  });
  const manager=native.CardManager.getInstance();
  let nextCardId=960000;
  function cloneCard(fullName){
    const card=manager.getCardByName(fullName);
    assert.ok(card,'CardManager must resolve '+fullName);
    card.id=nextCardId++;
    return card;
  }
  const specialEnergyDefinition=manager.getAllCards().find(card=>
    card instanceof native.EnergyCard&&card.energyType===native.EnergyType.SPECIAL);
  const basicEnergyDefinition=manager.getAllCards().find(card=>
    card instanceof native.EnergyCard&&card.energyType===native.EnergyType.BASIC);
  const basicPokemonDefinition=manager.getAllCards().find(card=>
    card instanceof native.PokemonCard&&card.stage===native.Stage.BASIC);
  assert.ok(specialEnergyDefinition,'pinned pool must contain Special Energy');
  assert.ok(basicEnergyDefinition,'pinned pool must contain Basic Energy');
  assert.ok(basicPokemonDefinition,'pinned pool must contain Basic Pokémon');

  function makePlayer(id){
    const player=new native.Player();
    player.id=id;
    player.active=new native.PokemonCardList();
    const active=cloneCard(basicPokemonDefinition.fullName);
    player.active.cards=[active];
    player.active.hp=active.hp;
    player.active.damage=0;
    player.active.energies.cards=[];
    player.active.tools=[];
    player.active.specialConditions=[];
    player.bench=Array.from({length:5},()=>new native.PokemonCardList());
    player.prizes=Array.from({length:6},()=>{
      const prize=new native.CardList();
      prize.cards=[cloneCard(basicPokemonDefinition.fullName)];
      return prize;
    });
    player.deck.cards=Array.from({length:20},()=>cloneCard(basicPokemonDefinition.fullName));
    player.hand.cards=[];
    player.discard.cards=[];
    player.playableCardIds=[];
    player.playableHandAbilityCardIds=[];
    player.canEvolve=false;
    return player;
  }
  function makeState(discardDefinition){
    const candidate=makePlayer(0);
    const opponent=makePlayer(1);
    const nightStretcher=cloneCard('Night Stretcher SFA');
    candidate.hand.cards=[nightStretcher];
    candidate.playableCardIds=[nightStretcher.id];
    candidate.discard.cards=[cloneCard(discardDefinition.fullName)];
    const initialState=new native.State();
    initialState.players=[candidate,opponent];
    initialState.activePlayer=0;
    initialState.phase=native.GamePhase.PLAYER_TURN;
    initialState.turn=17;
    initialState.prompts=[];
    initialState.gameSettings.format=native.Format.EXPANDED;
    initialState.gameSettings.sandboxMode=false;
    return withValidationRandom(()=>new native.Simulator(initialState)).store.state;
  }
  const enumeratorFor=state=>adapterModule.createKnownCapFreeActionEnumerator({native,enginePin});
  function nightStretcherAction(state){
    const player=state.players[0];
    const enumerator=enumeratorFor(state);
    const action=enumerator.playItemActions(state,player).find(candidate=>
      player.hand.cards[candidate.handIndex]?.name==='Night Stretcher');
    assert.ok(action,'pinned native enumerator must expose Night Stretcher under its broad canPlay predicate');
    return action;
  }

  const specialState=makeState(specialEnergyDefinition);
  const specialAction=nightStretcherAction(specialState);
  const rawSpecialStore=withValidationRandom(()=>new native.Simulator(specialState)).store;
  assert.throws(()=>withValidationRandom(()=>rawSpecialStore.dispatch(specialAction)),error=>
    error instanceof native.GameError&&error.message===native.GameMessage.CANNOT_PLAY_THIS_CARD,
    'pinned effect must reject Special Energy without a Pokémon or Basic Energy target');
  const specialFrontier=withValidationRandom(()=>frontierModule.buildNativeActionFrontier({
    state:specialState,actorSeat:0,native,enumerator:{enumerate:()=>[specialAction]}
  }));
  assert.equal(specialFrontier.diagnostics.preflightRejectedCount,1);
  assert.equal(specialFrontier.actionFrontier.items.some(item=>item.kind==='play-card'),false,
    'adapter preflight must filter the card before it reaches the policy');

  for(const definition of [basicEnergyDefinition,basicPokemonDefinition]){
    const state=makeState(definition);
    const action=nightStretcherAction(state);
    const frontier=withValidationRandom(()=>frontierModule.buildNativeActionFrontier({
      state,actorSeat:0,native,enumerator:{enumerate:()=>[action]}
    }));
    const item=frontier.actionFrontier.items.find(row=>row.actorPrinting==='Night Stretcher SFA');
    assert.ok(item,'Night Stretcher must be admitted with '+definition.fullName);
    const selectedSimulator=withValidationRandom(()=>new native.Simulator(state));
    frontierModule.dispatchSelectedNativeAction({
      store:selectedSimulator.store,frontier,token:item.token,
      state:selectedSimulator.store.state,actorSeat:0,native,withValidationRandom
    });
  }
});


test('pinned rank-1 Item exact-print preflights filter native CANNOT boundaries and admit valid states', {
  skip: !fs.existsSync(compiledActionEnumerator),
  timeout: 60000
}, () => {
  const enginePin=runner.V3_FIXTURE.engineCommit;
  const native=runner.loadNativeRoleDependencies({enginePin});
  const withValidationRandom=createValidationRandomScope({
    ambientRandom:Math.random,
    physicalRandom:seededRandom(0x71a7e124)
  });
  const manager=native.CardManager.getInstance();
  let nextCardId=980000;
  function cloneCard(fullName){
    const card=manager.getCardByName(fullName);
    assert.ok(card,'CardManager must resolve '+fullName);
    card.id=nextCardId++;
    return card;
  }
  const basicDefinition=manager.getAllCards().find(card=>
    card instanceof native.PokemonCard&&card.stage===native.Stage.BASIC&&
    (!Array.isArray(card.powers)||card.powers.length===0));
  assert.ok(basicDefinition,'pinned pool must contain a Basic Pokémon');
  const psychicSearchTarget=cloneCard('Shadow Rider Calyrex VMAX CRE');
  assert.ok(psychicSearchTarget instanceof native.PokemonCard,
    'Mysterious Treasure positive control requires a Psychic Pokémon target');

  const scenarios=[
    {
      fullName:'Mysterious Treasure FLI',
      configure(player,positive){
        player.hand.cards.push(cloneCard(basicDefinition.fullName));
        player.deck.cards=positive?[cloneCard(psychicSearchTarget.fullName)]:[];
      }
    },
    {
      fullName:'Quick Ball FST',
      configure(player,positive){
        player.hand.cards.push(cloneCard(basicDefinition.fullName));
        player.deck.cards=positive?[cloneCard(basicDefinition.fullName)]:[];
      }
    },
    {
      fullName:'Hisuian Heavy Ball ASR',
      configure(player,positive){
        player.deck.cards=[cloneCard(basicDefinition.fullName)];
        player.prizes.forEach((prize,index)=>{
          prize.isSecret=positive&&index===0;
        });
      }
    },
    {
      fullName:'Battle Compressor PHF',
      configure(player,positive){
        player.deck.cards=positive?
          Array.from({length:5},()=>cloneCard(basicDefinition.fullName)):[];
      }
    }
  ];

  function makePlayer(id){
    const player=new native.Player();
    player.id=id;
    player.active=new native.PokemonCardList();
    const active=cloneCard(basicDefinition.fullName);
    player.active.cards=[active];
    player.active.hp=active.hp;
    player.active.damage=0;
    player.active.energies.cards=[];
    player.active.tools=[];
    player.active.specialConditions=[];
    player.bench=Array.from({length:5},()=>new native.PokemonCardList());
    player.prizes=Array.from({length:6},()=>{
      const prize=new native.CardList();
      prize.cards=[cloneCard(basicDefinition.fullName)];
      prize.isSecret=true;
      return prize;
    });
    player.deck.cards=[];
    player.hand.cards=[];
    player.discard.cards=[];
    player.stadium.cards=[];
    player.lostzone.cards=[];
    player.supporter.cards=[];
    player.playableCardIds=[];
    player.playableHandAbilityCardIds=[];
    player.supporterTurn=0;
    player.canEvolve=false;
    return player;
  }

  function makeScenario(scenario,positive){
    const candidate=makePlayer(0);
    const opponent=makePlayer(1);
    const item=cloneCard(scenario.fullName);
    candidate.hand.cards=[item];
    scenario.configure(candidate,positive);
    candidate.playableCardIds=candidate.hand.cards.map(card=>card.id);
    const initialState=new native.State();
    initialState.players=[candidate,opponent];
    initialState.activePlayer=0;
    initialState.phase=native.GamePhase.PLAYER_TURN;
    initialState.turn=3;
    initialState.prompts=[];
    initialState.gameSettings.format=native.Format.EXPANDED;
    initialState.gameSettings.sandboxMode=false;
    const simulator=withValidationRandom(()=>new native.Simulator(initialState));
    const state=simulator.store.state;
    // Keep the face-down Prize boundary explicit after Simulator cloning.
    if(scenario.fullName==='Hisuian Heavy Ball ASR'){
      state.players[0].prizes.forEach((prize,index)=>{
        prize.isSecret=positive&&index===0;
      });
    }
    const actor=state.players[0];
    const enumerator=adapterModule.createKnownCapFreeActionEnumerator({native,enginePin});
    const action=enumerator.playItemActions(state,actor).find(candidate=>
      actor.hand.cards[candidate.handIndex]?.fullName===scenario.fullName);
    assert.ok(action,'native ActionEnumerator must propose '+scenario.fullName);
    const pass=enumerator.passTurnActions(state,actor)[0];
    assert.ok(pass,'native ActionEnumerator must provide a pass fallback');
    return {simulator,state,actor,enumerator,action,pass};
  }

  for(const scenario of scenarios){
    const valid=makeScenario(scenario,true);
    const validFrontier=withValidationRandom(()=>frontierModule.buildNativeActionFrontier({
      state:valid.state,actorSeat:0,native,
      enumerator:{enumerate:()=>[valid.action,valid.pass]}
    }));
    assert.equal(validFrontier.diagnostics.preflightRejectedCount,0,
      scenario.fullName+' positive state must not be preflight-rejected');
    const validItem=validFrontier.actionFrontier.items.find(item=>
      item.kind==='play-card'&&item.actorPrinting===scenario.fullName);
    assert.ok(validItem,scenario.fullName+' positive state must remain available to the policy');
    assert.doesNotThrow(()=>frontierModule.dispatchSelectedNativeAction({
      store:valid.simulator.store,frontier:validFrontier,token:validItem.token,
      state:valid.state,actorSeat:0,native,withValidationRandom
    }),scenario.fullName+' positive state must survive selected cloned-Store validation');

    const invalid=makeScenario(scenario,false);
    const rawStore=withValidationRandom(()=>new native.Simulator(invalid.state)).store;
    assert.throws(()=>withValidationRandom(()=>rawStore.dispatch(invalid.action)),
      error=>error instanceof native.GameError&&
        error.message===native.GameMessage.CANNOT_PLAY_THIS_CARD,
      scenario.fullName+' negative boundary must be rejected by the pinned native Store');
    const invalidFrontier=withValidationRandom(()=>frontierModule.buildNativeActionFrontier({
      state:invalid.state,actorSeat:0,native,
      enumerator:{enumerate:()=>[invalid.action,invalid.pass]}
    }));
    assert.equal(invalidFrontier.diagnostics.preflightRejectedCount,1,
      scenario.fullName+' negative boundary must be filtered by its exact-print preflight');
    assert.equal(invalidFrontier.diagnostics.rejectedCount,1);
    assert.equal(invalidFrontier.actionFrontier.items.some(item=>
      item.kind==='play-card'&&item.actorPrinting===scenario.fullName),false,
      scenario.fullName+' negative boundary must not reach the policy');
    assert.ok(invalidFrontier.actionFrontier.items.some(item=>item.kind==='pass'),
      scenario.fullName+' negative boundary must leave the legal pass fallback');
  }
});
