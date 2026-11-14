'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  VERSION,
  chooseHoodedBlockBenchAttackRoot
} = require('../simulation/twinleaf/agent43-hooded-block-bench-attack-root.cjs');
const {
  chooseActorRootIntent,
  withActorOnlyRootPolicy
} = require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {
  rootPhysicalSnapshot,
  rootPhysicalWitness
} = require('../simulation/twinleaf/agent5-owner-root-slice.cjs');

const P = 'Psychic Energy MEE';
const C = 9;
const PSY = 5;
const HOOD = 'Stealthy Hood UNB 186';
const catalog = {
  basics: new Set(),
  abilityBasics: new Set(),
  basicEnergies: new Set([P]),
  basicEnergyTypes: { Psychic: PSY },
  specialEnergies: new Set(),
  dragonPokemonPrintings: new Set(),
  ruleboxPokemonPrintings: new Set(),
  colorlessEnergyType: C,
  specialConditions: { ASLEEP: 1, PARALYZED: 2, CONFUSED: 3 },
  stages: { BASIC: 0, STAGE_1: 1, STAGE_2: 2, VMAX: 3, VSTAR: 4 }
};

function restrictions(extra = {}) {
  return {
    cannotAttackNextTurn: false,
    cannotUseAttacksNextTurn: [],
    blockedAttackNameNextTurn: null,
    blockedAttackNameUntilLeavesActive: null,
    onlyAllowedAttackNameNextTurn: null,
    attackCostIncreaseNextTurn: 0,
    attackCostIncreaseWhileActive: 0,
    cannotRetreatNextTurn: false,
    cannotRetreatWhileActive: false,
    ...extra
  };
}

function pokemon(printing, options = {}) {
  return {
    printing,
    name: options.name ?? printing,
    hp: options.hp ?? 100,
    damage: options.damage ?? 0,
    printed: {
      stage: options.stage ?? 0,
      types: [PSY],
      retreatCost: options.retreatCost ?? [C],
      resistance: options.resistance ?? []
    },
    energies: options.energies ?? [],
    tools: options.tools ?? [],
    specialConditions: options.specialConditions ?? [],
    abilityDetails: options.abilityDetails ?? [],
    publicRestrictions: options.publicRestrictions ?? restrictions(),
    attacks: options.attacks ?? []
  };
}

function makeView(options = {}) {
  const active = pokemon('Shadow Rider Calyrex VMAX CRE', {
    stage: 3,
    hp: 320,
    retreatCost: [C, C],
    energies: options.activeEnergies ?? [P, P],
    tools: options.hoodOnActive ? [HOOD] : [],
    publicRestrictions: restrictions({
      cannotRetreatWhileActive: options.cannotRetreatWhileActive === true,
      cannotAttackNextTurn: options.activeCannotAttack === true
    }),
    attacks: [{
      name: 'Max Geist',
      cost: options.activePayable ? [PSY, PSY] : [C, C, C],
      damage: 10,
      damageCalculation: null,
      gxAttack: false
    }]
  });
  const clefairy = pokemon("Lillie's Clefairy ex JTG", {
    hp: 190,
    energies: [P, P, P, P, P, P, P],
    attacks: [{
      name: 'Full Moon Rondo',
      cost: [PSY, C],
      damage: 20,
      damageCalculation: '+',
      text: "This attack does 20 more damage for each Benched Pokémon (both yours and your opponent's).",
      gxAttack: false
    }]
  });
  const ownBench = [
    clefairy,
    pokemon('Bench A'),
    pokemon('Bench B'),
    pokemon('Bench C'),
    pokemon('Bench D')
  ];
  if (options.benchHood) ownBench[1].tools = [HOOD];
  const skyliner = {
    name: 'Skyliner',
    text: 'Your Basic Pokémon in play have no Retreat Cost.'
  };
  if (options.ownBenchLatias) ownBench[1] = pokemon('Latias ex SSP 76', {
    stage: 0, abilityDetails: [skyliner]
  });
  if (options.unsupportedBenchAttack) ownBench[1] = pokemon('Unmodeled attacker', {
    energies: [P],
    attacks: [{
      name: 'Unmodeled effect attack',
      cost: [PSY],
      damage: 999,
      damageCalculation: null,
      gxAttack: false
    }]
  });
  if (options.ownBenchAlolanMuk) ownBench[1] = pokemon('Alolan Muk SUM 58', {
    stage: 1,
    abilityDetails: [{
      name: 'Power of Alchemy',
      text: "Each Basic Pokémon in play, in each player's hand, and in each player's discard pile has no Abilities."
    }]
  });

  const blockAbility = options.block === false ? [] : [{
    name: 'Block',
    text: "As long as this Pokémon is in the Active Spot, your opponent's Active Pokémon can't retreat."
  }];
  const defender = pokemon('Snorlax PGO', {
    hp: options.lethal === false ? 300 : 150,
    damage: options.lethal === false ? 0 : 10,
    retreatCost: [C, C],
    resistance: [],
    abilityDetails: blockAbility,
    tools: options.toolJammer ? ['Tool Jammer BST 136'] : []
  });
  const opponentBench = Array.from({ length: 5 }, (_, index) =>
    pokemon('Opponent Bench ' + index));
  if (options.benchToolJammer) opponentBench[0].tools = ['Tool Jammer BST 136'];
  if (options.opponentBenchLatias) opponentBench[0] = pokemon('Latias ex SSP 76', {
    stage: 0, abilityDetails: [skyliner]
  });
  if (options.opponentBenchMimikyu) opponentBench[0] = pokemon('Mimikyu PAL 97', {
    stage: 0, abilityDetails: [{
      name: 'Safeguard',
      text: "Prevent all damage done to this Pokémon by attacks from your opponent's Pokémon ex and Pokémon V."
    }]
  });
  if (options.opponentBenchAlolanMuk) opponentBench[0] = pokemon('Alolan Muk SUM 58', {
    stage: 1,
    abilityDetails: [{
      name: 'Power of Alchemy',
      text: "Each Basic Pokémon in play, in each player's hand, and in each player's discard pile has no Abilities."
    }]
  });

  const view = {
    decisionKind: 'owner-root',
    actorSeat: options.actorSeat ?? 0,
    globalTurn: 22,
    ownHand: options.hoodInHand === false ? [] : [HOOD],
    ownTurnResources: {
      retreatedTurn: options.retreatedThisTurn ? 22 : 0,
      toolPlayLocked: options.toolPlayLocked === true
    },
    ownPublic: {
      active,
      bench: ownBench,
      prizeCount: options.ownPrizeCount ?? 6,
      stadium: [],
      publicTurnRestrictions: {
        attackLockTurnsRemaining: options.attackLock ? 1 : 0,
        attackMaxEnergy: null,
        attackMaxEnergyTurnsRemaining: 0,
        toolPlayLocked: options.toolPlayLocked === true
      }
    },
    opponentPublic: {
      active: defender,
      bench: opponentBench,
      prizeCount: 6,
      stadium: options.stadium ? [options.stadium] : []
    }
  };
  Object.defineProperty(view, 'opponentPrivate', {
    get() { throw new Error('opponent hidden information was accessed'); }
  });
  return view;
}

test('held Hood is attached only when the post-Hood owner-view line has a nominal KO', () => {
  const view = makeView({ cannotRetreatWhileActive: true });
  const plan = chooseHoodedBlockBenchAttackRoot(view, catalog);
  assert.equal(plan.kind, 'attach-stealthy-hood');
  assert.equal(plan.handIndex, 0);
  assert.equal(plan.targetSlot, 'active');
  assert.equal(plan.benchIndex, 0);
  assert.equal(plan.attackName, 'Full Moon Rondo');
  assert.equal(plan.projectedPrintedDamage, 220);
  assert.equal(plan.projectedPrizeCount, 1);
  assert.equal(plan.projectedTerminalWin, false);
  assert.equal(plan.competitiveGameQualified, false);
  assert.equal(view.ownPublic.active.tools.length, 0);
  assert.equal(view.ownHand[0], HOOD);
});

test('an already attached Active Hood permits only a funded public-KO paid-retreat proposal', () => {
  const view = makeView({ hoodOnActive: true, hoodInHand: false });
  const plan = chooseHoodedBlockBenchAttackRoot(view, catalog);
  assert.equal(plan.kind, 'paid-retreat');
  assert.equal(plan.benchIndex, 0);
  assert.equal(plan.attackName, 'Full Moon Rondo');
  assert.equal(plan.projectedPrintedDamage, 220);
  assert.equal(plan.projectedPrizeCount, 1);
  assert.equal(plan.projectedTerminalWin, false);
  assert.deepEqual(plan.discardEnergyIndices, [0, 1]);
  assert.equal(plan.nativeStorePaymentVerified, false);
});

test('Full Moon Rondo additive damage is derived only from public occupied Bench slots', () => {
  const view = makeView({ hoodOnActive: true, hoodInHand: false });
  const fullBench = chooseHoodedBlockBenchAttackRoot(view, catalog);
  assert.equal(fullBench.projectedPrintedDamage, 220);

  view.ownPublic.bench[4] = null;
  view.opponentPublic.bench[4] = null;
  const reducedBench = chooseHoodedBlockBenchAttackRoot(view, catalog);
  assert.equal(reducedBench.projectedPrintedDamage, 180);

  const unsupportedFormula = makeView({ hoodOnActive: true, hoodInHand: false });
  unsupportedFormula.ownPublic.bench[0].attacks[0].text = 'Unrecognized damage formula';
  assert.equal(chooseHoodedBlockBenchAttackRoot(unsupportedFormula, catalog), null);
});

test('surplus basic Psychic Energy can pay the two-unit retreat while the Active cannot attack', () => {
  const view = makeView({
    hoodOnActive: true, hoodInHand: false,
    activeEnergies: [P, P, P], activeCannotAttack: true
  });
  const plan = chooseHoodedBlockBenchAttackRoot(view, catalog);
  assert.equal(plan.kind, 'paid-retreat');
  assert.deepEqual(plan.discardEnergyIndices, [0, 1]);
  assert.deepEqual(plan.discardEnergyPrintings, [P, P]);
});

test('Path to the Peak leaves Snorlax Block active; Jamming Tower suppresses Hood', () => {
  assert.equal(chooseHoodedBlockBenchAttackRoot(
    makeView({ hoodOnActive: true, hoodInHand: false, stadium: 'Path to the Peak CRE 148' }),
    catalog)?.kind, 'paid-retreat');
  assert.equal(chooseHoodedBlockBenchAttackRoot(
    makeView({ hoodOnActive: true, hoodInHand: false, stadium: 'Jamming Tower TWM 153' }),
    catalog), null);
});

test('opponent Active Tool Jammer suppresses Hood; Bench Tool Jammer does not', () => {
  assert.equal(chooseHoodedBlockBenchAttackRoot(
    makeView({ hoodOnActive: true, hoodInHand: false, toolJammer: true }), catalog), null);
  assert.equal(chooseHoodedBlockBenchAttackRoot(
    makeView({ hoodOnActive: true, hoodInHand: false, benchToolJammer: true }), catalog)?.kind,
    'paid-retreat');
});

test('wrong Hood target, no Hood, occupied Tool slot, or non-Block Active never bypasses retreat lock', () => {
  assert.equal(chooseHoodedBlockBenchAttackRoot(
    makeView({ benchHood: true, hoodInHand: false }), catalog), null);
  assert.equal(chooseHoodedBlockBenchAttackRoot(
    makeView({ hoodInHand: false }), catalog), null);
  const occupied = makeView({ hoodOnActive: true, hoodInHand: false });
  occupied.ownPublic.active.tools = ['Float Stone BKT'];
  assert.equal(chooseHoodedBlockBenchAttackRoot(occupied, catalog), null);
  assert.equal(chooseHoodedBlockBenchAttackRoot(
    makeView({ hoodOnActive: true, hoodInHand: false, block: false }), catalog), null);
});

test('payability, retreat, attack and prize projections fail closed', () => {
  const nextTurnCostIncrease = makeView({ hoodOnActive: true, hoodInHand: false });
  nextTurnCostIncrease.ownPublic.bench[0].publicRestrictions.attackCostIncreaseNextTurn = 1;
  assert.equal(chooseHoodedBlockBenchAttackRoot(nextTurnCostIncrease, catalog), null);
  const whileActiveCostIncrease = makeView({ hoodOnActive: true, hoodInHand: false });
  whileActiveCostIncrease.ownPublic.bench[0].publicRestrictions.attackCostIncreaseWhileActive = 1;
  assert.equal(chooseHoodedBlockBenchAttackRoot(whileActiveCostIncrease, catalog), null);
  const playerAttackCeiling = makeView({ hoodOnActive: true, hoodInHand: false });
  playerAttackCeiling.ownPublic.publicTurnRestrictions.attackMaxEnergy = 1;
  playerAttackCeiling.ownPublic.publicTurnRestrictions.attackMaxEnergyTurnsRemaining = 1;
  assert.equal(chooseHoodedBlockBenchAttackRoot(playerAttackCeiling, catalog), null);
  assert.equal(chooseHoodedBlockBenchAttackRoot(
    makeView({ hoodOnActive: true, hoodInHand: false, activePayable: true }), catalog), null);
  assert.equal(chooseHoodedBlockBenchAttackRoot(
    makeView({ hoodOnActive: true, hoodInHand: false, lethal: false }), catalog), null);
  assert.equal(chooseHoodedBlockBenchAttackRoot(
    makeView({ hoodOnActive: true, hoodInHand: false, cannotRetreatWhileActive: true }), catalog), null);
  assert.equal(chooseHoodedBlockBenchAttackRoot(
    makeView({ hoodOnActive: true, hoodInHand: false, activeEnergies: [P] }), catalog), null);
  assert.equal(chooseHoodedBlockBenchAttackRoot(
    makeView({ hoodOnActive: true, hoodInHand: false, retreatedThisTurn: true }), catalog), null);
  assert.equal(chooseHoodedBlockBenchAttackRoot(
    makeView({ hoodOnActive: true, hoodInHand: false, attackLock: true }), catalog), null);
  const asleep = makeView({ hoodOnActive: true, hoodInHand: false });
  asleep.ownPublic.active.specialConditions = [catalog.specialConditions.ASLEEP];
  assert.equal(chooseHoodedBlockBenchAttackRoot(asleep, catalog), null);
  assert.equal(chooseHoodedBlockBenchAttackRoot(
    makeView({ toolPlayLocked: true }), catalog), null);
});

test('other retreat abilities, Garbotoxin, unsupported stadiums and hidden zones are not bypassed', () => {
  const other = makeView({ hoodOnActive: true, hoodInHand: false });
  other.opponentPublic.bench[0].abilityDetails = [{
    name: 'Other', text: "Your opponent's Active Pokémon cannot retreat."
  }];
  assert.equal(chooseHoodedBlockBenchAttackRoot(other, catalog), null);

  const garbotoxin = makeView({ hoodOnActive: true, hoodInHand: false });
  garbotoxin.opponentPublic.bench[0].tools = ['Tool'];
  garbotoxin.opponentPublic.bench[0].abilityDetails = [{
    name: 'Garbotoxin', text: 'All Abilities have no effect.'
  }];
  assert.equal(chooseHoodedBlockBenchAttackRoot(garbotoxin, catalog), null);

  assert.equal(chooseHoodedBlockBenchAttackRoot(
    makeView({ hoodOnActive: true, hoodInHand: false, stadium: 'Silent Lab PRC 99' }),
    catalog), null);

  assert.equal(chooseHoodedBlockBenchAttackRoot(
    makeView({ hoodOnActive: true, hoodInHand: false }), catalog)?.kind, 'paid-retreat');
});


test('Latias Skyliner on either Bench does not veto an evolved Shadow Rider Active', () => {
  for (const options of [{ ownBenchLatias: true }, { opponentBenchLatias: true }]) {
    const plan = chooseHoodedBlockBenchAttackRoot(
      makeView({ hoodOnActive: true, hoodInHand: false, ...options }), catalog
    );
    assert.equal(plan?.kind, 'paid-retreat');
  }
  const unknownStage = makeView({
    hoodOnActive: true, hoodInHand: false, ownBenchLatias: true
  });
  unknownStage.ownPublic.active.printed.stage = undefined;
  assert.equal(chooseHoodedBlockBenchAttackRoot(unknownStage, catalog), null);
});

test('Mimikyu PAL Safeguard on opponent Bench does not veto an attack against Active Snorlax', () => {
  const view = makeView({
    hoodOnActive: true, hoodInHand: false, opponentBenchMimikyu: true
  });
  assert.equal(chooseHoodedBlockBenchAttackRoot(view, catalog)?.kind, 'paid-retreat');
  view.opponentPublic.bench[0].abilityDetails = [{
    name: 'Other Protection',
    text: "Prevent all damage done to this Pokémon by attacks from your opponent's Pokémon ex and Pokémon V."
  }];
  assert.equal(chooseHoodedBlockBenchAttackRoot(view, catalog), null);
});

test('unmodeled integer-damage attack cannot displace the explicitly modeled Clefairy line', () => {
  const view = makeView({
    hoodOnActive: true, hoodInHand: false, unsupportedBenchAttack: true
  });
  const plan = chooseHoodedBlockBenchAttackRoot(view, catalog);
  assert.equal(plan?.printing, "Lillie's Clefairy ex JTG");
  assert.equal(plan?.attackName, 'Full Moon Rondo');
  assert.equal(plan?.projectedPrintedDamage, 220);
});

test('Alolan Muk Power of Alchemy fails closed because it suppresses Basic Snorlax Block', () => {
  for (const options of [
    { ownBenchAlolanMuk: true },
    { opponentBenchAlolanMuk: true }
  ]) {
    const view = makeView({ hoodOnActive: true, hoodInHand: false, ...options });
    assert.equal(chooseHoodedBlockBenchAttackRoot(view, catalog), null);
  }
});

test('root option is default-off and candidate root returns the typed Hood/Retreat intent', () => {
  const view = makeView();
  assert.notEqual(chooseActorRootIntent(view, catalog)?.source, VERSION);
  assert.equal(chooseActorRootIntent(view, catalog, {
    hoodedBlockBenchAttackRoot: true
  })?.kind, 'attach-stealthy-hood');
});

test('Stealthy Hood attachment has an exact Active Tool physical witness', () => {
  const pokemon = { fullName: 'Shadow Rider Calyrex VMAX CRE' };
  const owner = {
    active: {
      getPokemonCard: () => pokemon,
      energies: { cards: [] },
      tools: []
    },
    bench: [],
    hand: { cards: [{ fullName: HOOD }] },
    stadium: { cards: [] },
    stadiumUsedTurn: 0
  };
  const opponent = { stadium: { cards: [] } };
  const state = { players: [owner, opponent], turn: 22, phase: 2, activePlayer: 0 };
  const intent = { kind: 'attach-stealthy-hood', toolPrinting: HOOD };
  const before = rootPhysicalSnapshot(state, 0, intent);

  owner.active.tools.push({ fullName: HOOD });
  owner.hand.cards.pop();
  const after = rootPhysicalSnapshot(state, 0, intent);

  assert.equal(rootPhysicalWitness(intent, before, after, { FINISHED: 7 }),
    'confirmed-public-effect');
  assert.equal(rootPhysicalWitness(intent, before, {
    ...after, toolRecipientPokemonPrinting: 'Different Active Pokemon'
  }, { FINISHED: 7 }), 'no-confirmed-public-effect');
  assert.equal(rootPhysicalWitness(intent, before, {
    ...after, toolRecipientToolPrintings: ['Other Tool']
  }, { FINISHED: 7 }), 'no-confirmed-public-effect');
});

test('native root maps Hood attachment and paid retreat for either physical seat', () => {
  class AddPlayerAction {}
  class PlayCardAction {
    constructor(id, handIndex, target) { this.id = id; this.handIndex = handIndex; this.target = target; }
  }
  class RetreatAction {
    constructor(id, benchIndex) { this.id = id; this.benchIndex = benchIndex; }
  }
  class AttackAction {}
  class PassTurnAction {}
  class UseAbilityAction {}
  class Store {
    constructor(activePlayer) {
      const empty = () => ({
        getPokemonCard: () => null, cards: [], damage: 0, specialConditions: [],
        energies: { cards: [] }, tools: []
      });
      const player = id => ({
        id, active: empty(), bench: Array.from({ length: 5 }, empty),
        hand: { cards: [] }, deck: { cards: [] }, prizes: [],
        stadium: { cards: [] }, discard: { cards: [] }, lostzone: { cards: [] },
        supporter: { cards: [] }
      });
      this.state = {
        players: [player(10), player(20)], activePlayer, prompts: [],
        turn: 22, phase: 2
      };
    }
    dispatch() { return true; }
  }
  class SimpleTacticsAi {
    constructor(id) { this.client = { id }; }
    decodeNextAction() { throw new Error('hidden-state root must not run'); }
  }

  function run(seat, hoodOnActive) {
    const view = makeView({
      actorSeat: seat,
      hoodOnActive,
      hoodInHand: !hoodOnActive
    });
    const playerId = seat === 0 ? 10 : 20;
    return withActorOnlyRootPolicy(() => {
      const store = new Store(seat);
      store.dispatch(new AddPlayerAction());
      const action = new SimpleTacticsAi(playerId).decodeNextAction(store.state);
      store.dispatch(action);
      return action;
    }, {
      hoodedBlockBenchAttackRoot: true,
      SimpleTacticsAi, Store,
      GamePhase: { PLAYER_TURN: 2, FINISHED: 7 },
      observe: (state, observedSeat) => ({ ...view, actorSeat: observedSeat }),
      getCatalog: () => catalog,
      cardActions: {
        PlayCardAction,
        // Match Twinleaf's pinned PlayerType enum: ANY=0, TOP_PLAYER=1,
        // BOTTOM_PLAYER=2. BOTTOM_PLAYER means the acting player, not
        // physical state.players[0], for either candidate seat.
        PlayerType: { ANY: 0, TOP_PLAYER: 1, BOTTOM_PLAYER: 2 },
        SlotType: { BOARD: 0, ACTIVE: 1, BENCH: 2 }
      },
      gameActions: { AttackAction, PassTurnAction, RetreatAction, UseAbilityAction }
    });
  }

  for (const seat of [0, 1]) {
    const attach = run(seat, false);
    assert.ok(attach.result instanceof PlayCardAction);
    assert.deepEqual(attach.result.target, {
      player: 2, slot: 1, index: 0
    }, 'PlayCardAction targets the acting player for either physical seat');
    assert.equal(attach.audit.hoodedBlockBenchAttackRootOptIn, true);
    assert.equal(attach.audit.hoodedBlockBenchAttackRootHoodAttachmentsSelected, 1);
    assert.equal(attach.audit.hoodedBlockBenchAttackRootRetreatsSelected, 0);
    assert.equal(attach.audit.hoodedBlockBenchAttackRootSelectedBySeat[seat], 1);

    const retreat = run(seat, true);
    assert.ok(retreat.result instanceof RetreatAction);
    assert.equal(retreat.result.benchIndex, 0);
    assert.equal(retreat.audit.hoodedBlockBenchAttackRootRetreatsSelected, 1);
    assert.equal(retreat.audit.hoodedBlockBenchAttackRootSelectedBySeat[seat], 1);
  }
});
