'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const policyModule = require('../../simulation/evaluation/2026-11/agent23-rank19-raging-bolt-opponent-policy.cjs');

const POLICY_VERSION = policyModule.POLICY_VERSION;
const EMPTY_BENCH = () => Array.from({ length: 5 }, () => null);

function publicRestrictions(overrides = {}) {
  return {
    gxUsed: false, vstarUsed: false, attackLockTurnsRemaining: 0,
    attackMaxEnergy: null, attackMaxEnergyTurnsRemaining: 0,
    ignoreAttackCostCardTypes: [], ignoreAttackCostTurnsRemaining: 0,
    cannotUseGXAttacks: false, pokemonPlayLocked: false,
    abilityPokemonPlayLocked: false, evolutionPlayLocked: false,
    itemPlayLocked: false, supporterPlayLocked: false,
    stadiumPlayLocked: false, toolPlayLocked: false,
    energyPlayLocked: false, specialEnergyPlayLocked: false,
    stadiumAndToolHaveNoEffectTurnsRemaining: null,
    ...overrides
  };
}
function pokemonRestrictions() {
  return {
    cannotAttackNextTurn: false, cannotUseAttacksNextTurn: [],
    blockedAttackNameNextTurn: null, blockedAttackNameUntilLeavesActive: null,
    onlyAllowedAttackNameNextTurn: null, attackCostIncreaseNextTurn: 0,
    attackCostIncreaseWhileActive: 0, cannotRetreat: false,
    cannotRetreatNextTurn: false, cannotRetreatWhileActive: false,
    cannotEvolveNextTurn: false
  };
}
function pokemon({
  printing, name, hp = 240, damage = 0, subtypes = ['Basic'], types = ['Dragon'],
  energies = [], tools = [], abilities = [], attacks = [], weakness = [], resistance = [],
  retreatCost = [], stage = 'Basic', abilitySuppressions
}) {
  const suppressions = abilitySuppressions ?? abilities.map(abilityName => ({
    abilityName, suppressed: false, reasonCode: null, sourcePrinting: null
  }));
  return {
    printing, name: name ?? printing, hp, damage, lastPlayedOrEvolvedTurn: 1,
    printed: { stage, subtypes, types, retreatCost, weakness, resistance },
    specialConditions: [], publicRestrictions: pokemonRestrictions(),
    evolutionPrintings: [], energies, tools, attacks, abilities,
    abilityDetails: abilities.map(abilityName => ({ name: abilityName, powerType: 'ABILITY', text: null })),
    abilitySuppressions: suppressions
  };
}
function publicPlayer({
  active = null, bench = EMPTY_BENCH(), stadium = [], discard = [], lostZone = [],
  resolvingSupporter = [], publicHand = null, prizeSlots = [],
  restrictions = {}, handCount = 0, deckCount = 35, prizeCount = 6
} = {}) {
  return {
    active, bench, stadium, discard, lostZone, resolvingSupporter, publicHand, prizeSlots,
    publicTurnRestrictions: publicRestrictions(restrictions),
    handCount, deckCount, prizeCount
  };
}
function observation({
  seat = 0, turn = 1, ownActive = null, ownBench = EMPTY_BENCH(),
  opponentActive = null, opponentBench = EMPTY_BENCH(), ownHand = [],
  ownDiscard = [], ownStadium = [], opponentStadium = [],
  ownRestrictions = {}, opponentRestrictions = {}, ownPrizeCount = 6,
  opponentPrizeCount = 6, opponentHandCount = 0, decisionKind = 'owner-root',
  promptType = null
} = {}) {
  return {
    actorSeat: seat, globalTurn: turn, phase: 2, decisionKind,
    pendingPromptType: promptType, pendingOwnerDeckSearch: false,
    ownHand,
    ownPublic: publicPlayer({
      active: ownActive, bench: ownBench, stadium: ownStadium, discard: ownDiscard,
      restrictions: ownRestrictions, handCount: ownHand.length, prizeCount: ownPrizeCount
    }),
    opponentPublic: publicPlayer({
      active: opponentActive, bench: opponentBench, stadium: opponentStadium,
      restrictions: opponentRestrictions, handCount: opponentHandCount, prizeCount: opponentPrizeCount
    }),
    ownTurnResources: {
      supporterPlayedTurn: 0, retreatedTurn: 0, extraTurnActive: false,
      energyPlayedTurn: false, stadiumPlayedTurn: false, stadiumUsedTurn: false,
      vstarUsed: false, pokemonPlayLocked: false, abilityPokemonPlayLocked: false,
      evolutionPlayLocked: false, itemPlayLocked: false, supporterPlayLocked: false,
      stadiumPlayLocked: false, toolPlayLocked: false, energyPlayLocked: false,
      specialEnergyPlayLocked: false
    },
    ownerK1: null
  };
}
function init(seat = 0, role = 'opponent') {
  return {
    schema: protocol.INIT_SCHEMA, type: 'init', role, seat,
    policyVersion: POLICY_VERSION, bundleSha256: 'a'.repeat(64), config: {}
  };
}
function prompt(seat, promptType, effectName, sourcePrinting, choices, publicMetadata) {
  const indexedChoices = choices.map((choice, index) => ({
    ...choice,
    ...(choice.publicMetadata ? {
      publicMetadata: { ...choice.publicMetadata, selectionIndex: index, selectedCount: 1 }
    } : {})
  }));
  return {
    schema: protocol.PROMPT_SCHEMA, actingSeat: seat, promptType,
    description: effectName, source: {
      classification: 'actor-choice', sourceKind: 'card-effect',
      sourcePrinting, effectName
    },
    choices: indexedChoices, publicMetadata
  };
}
function cardChoice(token, printing, extra = {}) {
  return {
    token, kind: 'card', printing,
    publicMetadata: { selectionIndex: 0, selectedCount: 1, sourceZone: 'deck',
      ownerSeat: 'actor', isOwnerVisible: true, ...extra }
  };
}
function pokemonChoice(token, pokemonCard, ownerSeat = 'actor', targetZone = 'bench') {
  return {
    token, kind: 'pokemon', printing: pokemonCard.printing,
    publicMetadata: { selectionIndex: 0, selectedCount: 1, selectionType: 'pokemon',
      ownerSeat, targetZone, isOwnerVisible: true }
  };
}
function energyChoice(token, printing, energyType, ownerSeat = 'actor') {
  return {
    token, kind: 'energy', printing,
    publicMetadata: { selectionIndex: 0, selectedCount: 1, sourceZone: 'play',
      ownerSeat, isOwnerVisible: true, energyType }
  };
}
function emptyChoice(token) {
  return { token, kind: 'empty-selection' };
}
function action(token, kind, fields = {}) {
  return { token, kind, ...fields };
}
function runDecision({
  obs, items = [], promptValue = null, receipt = null, seat = 0,
  role = 'opponent', requestId = 'rank19-test-request'
}) {
  const initMessage = init(seat, role);
  protocol.validateInit(initMessage);
  const request = {
    schema: protocol.REQUEST_SCHEMA, type: 'decision', requestId, sequence: 1,
    role, seat, observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: obs, prompt: promptValue, publicEventReceipt: receipt,
    actionFrontier: { schema: protocol.FRONTIER_SCHEMA, items }
  };
  const validated = protocol.validateRequest(request, initMessage, 1, new Set());
  const policy = policyModule.createPolicy({
    role, seat, policyVersion: POLICY_VERSION, config: {}
  });
  const decision = policy.decide(request);
  const accepted = protocol.validateDecision(decision, validated.prompt, validated.actionTokens);
  return { decision: accepted, request, validated };
}

const RAGING = 'Raging Bolt ex TEF 123';
const ADP = 'Arceus & Dialga & Palkia-GX CEC 156';
const SANDY = 'Sandy Shocks ex PAR 108';
const MOLTRES = 'Galarian Moltres V CRE 97';
const HOOH = 'Ho-Oh-EX DRX 22';
const DDE = 'Double Dragon Energy ROS 97';
const LIGHTNING = 'Lightning Energy MEE 12';
const FIGHTING = 'Fighting Energy MEE 14';
const DARKNESS = 'Darkness Energy MEE 15';

test('source identity and protocol dependency are explicit', () => {
  assert.equal(policyModule.SOURCE_RANK, 19);
  assert.match(policyModule.SOURCE_LIST_BLOB_SHA1, /^[a-f0-9]{40}$/);
  assert.equal(policyModule.SOURCE_FINGERPRINT_SHA256, '8fc9b7cf236a50ea34cdf10746bfc01d5f226739d106e4afcf438ed5c8f491eb');
  assert.equal(policyModule.ENGINE_PIN, 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(policyModule.basicEnergyType(LIGHTNING), 'lightning');
  assert.equal(policyModule.basicEnergyType('Lightning Energy MEG 12'), 'lightning');
  assert.equal(policyModule.basicEnergyType('Fighting Energy BKT 136'), 'fighting');
  assert.equal(policyModule.basicEnergyType(DDE), null);
});

test('init rejects candidate role and unknown policy version', () => {
  assert.throws(() => policyModule.createPolicy({
    role: 'candidate', seat: 0, policyVersion: POLICY_VERSION, config: {}
  }), /AGENT23_RANK19_POLICY_INIT_MISMATCH/);
  assert.throws(() => policyModule.createPolicy({
    role: 'opponent', seat: 0, policyVersion: 'other', config: {}
  }), /AGENT23_RANK19_POLICY_INIT_MISMATCH/);
});

test('first-turn Battle VIP Pass outranks a second basic setup action', () => {
  const obs = observation({
    turn: 1,
    ownHand: ['Battle VIP Pass FST 225', RAGING],
    ownBench: EMPTY_BENCH()
  });
  const result = runDecision({ obs, items: [
    action('pass', 'pass'),
    action('bolt', 'play-card', { actorPrinting: RAGING }),
    action('vip', 'play-card', { actorPrinting: 'Battle VIP Pass FST 225' })
  ]});
  assert.deepEqual(result.decision, { kind: 'select-action', token: 'vip' });
});

test('first-turn setup is legal on either seat’s first turn, Hammer only going second', () => {
  for(const seat of [0,1]){
    for(const turn of [1,2,3]){
      const entries=[
        ['vip','Battle VIP Pass FST 225',turn<=2],
        ['squawk','Squawkabilly ex PAL 169',turn<=2],
        ['carmine','Carmine TWM 145',turn<=2]
      ];
      for(const [token,printing,available] of entries){
        const obs=observation({seat,turn,ownHand:[printing]});
        const d=runDecision({seat,obs,items:[
          action(token,'play-card',{actorPrinting:printing}),
          action('pass','pass')]});
        assert.deepEqual(d.decision,{kind:'select-action',token:available?token:'pass'});
      }
      const obs=observation({seat,turn,ownHand:[FIGHTING]});
      const a=runDecision({seat,obs,items:[
        action('squawk-ability','use-ability',
          {actorPrinting:'Squawkabilly ex PAL 169',
            publicMetadata:{abilityName:'Squawk and Seize'}}),
        action('pass','pass')]});
      assert.deepEqual(a.decision,
        {kind:'select-action',token:turn<=2?'squawk-ability':'pass'});
    }
    const target=pokemon({printing:ADP,energies:[LIGHTNING],
      subtypes:['Basic','TAG TEAM','GX']});
    for(const turn of [1,2,3]){
      const obs=observation({seat,turn,
        ownHand:['Wait and See Hammer LOT 192'],opponentActive:target});
      const d=runDecision({seat,obs,items:[
        action('hammer','play-card',{actorPrinting:'Wait and See Hammer LOT 192'}),
        action('pass','pass')]});
      assert.deepEqual(d.decision,
        {kind:'select-action',token:turn===2?'hammer':'pass'});
    }
  }
});

test('Professor Sada is selected only when Basic Energy is already in discard and an Ancient target exists', () => {
  const bolt = pokemon({ printing: RAGING, subtypes: ['Basic', 'ex', 'Ancient'], energies: [] });
  const obs = observation({
    ownActive: bolt, ownHand: ["Professor Sada's Vitality PAR 170"],
    ownDiscard: [LIGHTNING]
  });
  const result = runDecision({ obs, items: [
    action('sada', 'play-card', { actorPrinting: "Professor Sada's Vitality PAR 170" }),
    action('pass', 'pass')
  ]});
  assert.deepEqual(result.decision, { kind: 'select-action', token: 'sada' });

  const noFuel = observation({ ownActive: bolt, ownHand: ["Professor Sada's Vitality PAR 170"] });
  const declined = runDecision({ obs: noFuel, items: [
    action('sada', 'play-card', { actorPrinting: "Professor Sada's Vitality PAR 170" }),
    action('pass', 'pass')
  ]});
  assert.deepEqual(declined.decision, { kind: 'select-action', token: 'pass' });
});

test('ADP uses Altered Creation-GX with attached Double Dragon Energy before Ultimate Ray', () => {
  const adp = pokemon({ printing: ADP, subtypes: ['Basic', 'TAG TEAM', 'GX'], energies: [DDE] });
  const obs = observation({ ownActive: adp, ownRestrictions: { gxUsed: false } });
  const result = runDecision({ obs, items: [
    action('altered', 'attack', { attackName: 'Altered Creation-GX' }),
    action('ray', 'attack', { attackName: 'Ultimate Ray' }),
    action('pass', 'pass')
  ]});
  assert.deepEqual(result.decision, { kind: 'select-action', token: 'altered' });

  const afterGx = observation({ ownActive: adp, ownRestrictions: { gxUsed: true } });
  const next = runDecision({ obs: afterGx, items: [
    action('altered', 'attack', { attackName: 'Altered Creation-GX' }),
    action('ray', 'attack', { attackName: 'Ultimate Ray' }),
    action('pass', 'pass')
  ]});
  assert.deepEqual(next.decision, { kind: 'select-action', token: 'ray' });
});

test('Sky Field replaces Temple of Sinnoh when ADP is established', () => {
  const adp = pokemon({ printing: ADP, subtypes: ['Basic', 'TAG TEAM', 'GX'], energies: [DDE] });
  const obs = observation({
    ownActive: adp, ownStadium: ['Temple of Sinnoh ASR 155'],
    ownBench: [null, null, null, null, null]
  });
  const result = runDecision({ obs, items: [
    action('sky', 'use-stadium', { actorPrinting: 'Sky Field ROS 89' }),
    action('pass', 'pass')
  ]});
  assert.deepEqual(result.decision, { kind: 'select-action', token: 'sky' });
});

test('Bellowing Thunder discards Basic Energy only and preserves Double Dragon Energy', () => {
  const bolt = pokemon({
    printing: RAGING, subtypes: ['Basic', 'ex', 'Ancient'],
    energies: [LIGHTNING, FIGHTING, DDE]
  });
  const target = pokemon({ printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX', hp: 320, damage: 80,
    subtypes: ['VMAX'], types: ['Psychic'] });
  const obs = observation({ ownActive: bolt, opponentActive: target, decisionKind: 'owner-prompt',
    promptType: 'ChooseEnergyPrompt' });
  const choices = [
    energyChoice('e-l', LIGHTNING, 'Lightning'),
    energyChoice('e-f', FIGHTING, 'Fighting'),
    energyChoice('e-d', DARKNESS, 'Darkness'),
    energyChoice('e-l2', 'Lightning Energy MEE 12', 'Lightning'),
    energyChoice('e-dde', DDE, 'Colorless/Dragon')
  ];
  const p = prompt(0, 'ChooseEnergyPrompt', 'Bellowing Thunder', RAGING, choices, {
    selectionType: 'energy-payment', energyCount: 5, count: 5,
    energyType: 'Basic Energy', allowCancel: false
  });
  const result = runDecision({ obs, promptValue: p });
  assert.equal(result.decision.kind, 'select-choices');
  assert.equal(result.decision.tokens.length, 4);
  assert.equal(result.decision.tokens.includes('e-dde'), false);
});

test('Bellowing Thunder abstains when other Pokémon Basic Energy cannot be attributed', () => {
  const bolt = pokemon({ printing: RAGING, subtypes: ['Basic', 'ex', 'Ancient'], energies: [LIGHTNING, FIGHTING, DDE] });
  const sandy = pokemon({ printing: SANDY, subtypes: ['Basic', 'ex', 'Ancient'], energies: [DARKNESS] });
  const target = pokemon({ printing: 'Shadow Rider Calyrex VMAX CRE 75',
    hp: 320, damage: 0, subtypes: ['VMAX'], types: ['Psychic'] });
  const obs = observation({ ownActive: bolt, ownBench: [sandy, null, null, null, null],
    opponentActive: target, decisionKind: 'owner-prompt', promptType: 'ChooseEnergyPrompt' });
  const choices = [
    energyChoice('e-l', LIGHTNING, 'Lightning'),
    energyChoice('e-f', FIGHTING, 'Fighting'),
    energyChoice('e-d', DARKNESS, 'Darkness'),
    energyChoice('e-dde', DDE, 'Colorless/Dragon')
  ];
  const p = prompt(0, 'ChooseEnergyPrompt', 'Bellowing Thunder', RAGING, choices, {
    selectionType: 'energy-payment', energyCount: 4, count: 4,
    energyType: 'Basic Energy', allowCancel: false
  });
  const result = runDecision({ obs, promptValue: p });
  assert.deepEqual(result.decision, {
    kind: 'abstain', reasonCode: 'UNTRUSTED_ENERGY_SELECTION'
  });

  const root = observation({ ownActive: bolt, ownBench: [sandy, null, null, null, null],
    opponentActive: target });
  const rootResult = runDecision({ obs: root, items: [
    action('attack', 'attack', { attackName: 'Bellowing Thunder',
      publicMetadata: { damageAfterWeakness: 280, targetHp: 320, targetDamage: 0 } }),
    action('pass', 'pass')
  ]});
  assert.deepEqual(rootResult.decision, { kind: 'select-action', token: 'pass' });
});

test('Bellowing Thunder is not selected when no Basic Energy can be discarded', () => {
  const bolt = pokemon({ printing: RAGING, subtypes: ['Basic', 'ex', 'Ancient'], energies: [DDE] });
  const target = pokemon({ printing: 'Shadow Rider Calyrex VMAX CRE 75',
    hp: 320, subtypes: ['VMAX'], types: ['Psychic'] });
  const obs = observation({ ownActive: bolt, opponentActive: target });
  const result = runDecision({ obs, items: [
    action('attack', 'attack', { attackName: 'Bellowing Thunder' }),
    action('pass', 'pass')
  ]});
  assert.deepEqual(result.decision, { kind: 'select-action', token: 'pass' });
});

test('Bellowing Thunder fails closed when GX or opponent Ability modifiers are unresolved', () => {
  const bolt = pokemon({ printing: RAGING, subtypes: ['Basic', 'ex', 'Ancient'], energies: [LIGHTNING, FIGHTING] });
  const target = pokemon({ printing: 'Test Active Pokémon', hp: 240, damage: 0,
    abilities: ['Unresolved Active Ability'] });
  const obs = observation({ ownActive: bolt, opponentActive: target,
    ownRestrictions: { gxUsed: true }, decisionKind: 'owner-prompt',
    promptType: 'ChooseEnergyPrompt' });
  const choices = [
    energyChoice('l', LIGHTNING, 'Lightning'),
    energyChoice('f', FIGHTING, 'Fighting')
  ];
  const p = prompt(0, 'ChooseEnergyPrompt', 'Bellowing Thunder', RAGING, choices, {
    selectionType: 'energy-payment', energyCount: 2, count: 2,
    energyType: 'Basic Energy', allowCancel: false
  });
  const result = runDecision({ obs, promptValue: p });
  assert.deepEqual(result.decision, {
    kind: 'abstain', reasonCode: 'UNTRUSTED_ENERGY_SELECTION'
  });
});

test('Wait and See Hammer targets an opponent Energy and prioritizes Double Dragon Energy', () => {
  const rootObs = observation({
    ownHand: ['Wait and See Hammer LOT 192'], turn: 2,
    opponentActive: pokemon({ printing: 'Arceus & Dialga & Palkia-GX CEC 156',
      subtypes: ['Basic', 'TAG TEAM', 'GX'], energies: [DDE, LIGHTNING] })
  });
  const result = runDecision({ obs: rootObs, items: [
    action('hammer', 'play-card', { actorPrinting: 'Wait and See Hammer LOT 192' }),
    action('pass', 'pass')
  ]});
  const obs = observation({
    ownHand: ['Wait and See Hammer LOT 192'], turn: 2,
    opponentActive: pokemon({ printing: 'Arceus & Dialga & Palkia-GX CEC 156',
      subtypes: ['Basic', 'TAG TEAM', 'GX'], energies: [DDE, LIGHTNING] }),
    decisionKind: 'owner-prompt', promptType: 'ChooseEnergyPrompt'
  });
  assert.deepEqual(result.decision, { kind: 'select-action', token: 'hammer' });

  const choices = [
    energyChoice('dde', DDE, 'Dragon/Colorless', 'opponent'),
    energyChoice('lightning', LIGHTNING, 'Lightning', 'opponent')
  ];
  const p = prompt(0, 'ChooseEnergyPrompt', 'Wait and See Hammer',
    'Wait and See Hammer LOT 192', choices, {
      selectionType: 'energy-payment', energyCount: 2, count: 2,
      energyType: 'Energy', allowCancel: false
    });
  const selected = runDecision({ obs, promptValue: p });
  assert.deepEqual(selected.decision, { kind: 'select-choices', tokens: ['dde'] });
});

test('Bellowing Thunder accounts for Dragon Weakness without over-discarding', () => {
  const bolt = pokemon({ printing: RAGING, subtypes: ['Basic', 'ex', 'Ancient'], energies: [LIGHTNING, FIGHTING, DDE] });
  const target = pokemon({
    printing: 'Test Dragon-weak Pokémon', hp: 240, damage: 0, types: ['Psychic'],
    weakness: [{ type: 'Dragon', value: '×2' }]
  });
  const obs = observation({ ownActive: bolt, opponentActive: target, decisionKind: 'owner-prompt',
    promptType: 'ChooseEnergyPrompt' });
  const choices = [
    energyChoice('e1', LIGHTNING, 'Lightning'), energyChoice('e2', FIGHTING, 'Fighting'),
    energyChoice('e3', DARKNESS, 'Darkness'), energyChoice('e4', 'Lightning Energy MEE 12', 'Lightning'),
    energyChoice('dde', DDE, 'Colorless/Dragon')
  ];
  const p = prompt(0, 'ChooseEnergyPrompt', 'Bellowing Thunder', RAGING, choices, {
    selectionType: 'energy-payment', energyCount: 5, count: 5,
    energyType: 'Basic Energy', allowCancel: false
  });
  const result = runDecision({ obs, promptValue: p });
  assert.deepEqual(result.decision, { kind: 'select-choices', tokens: ['e1', 'e2'] });
});

test('Battle Compressor chooses Ho-Oh plus missing Basic Energy types when one type is already discarded', () => {
  const obs = observation({ ownDiscard: [LIGHTNING], ownHand: ['Battle Compressor PHF 92'],
    decisionKind: 'owner-prompt', promptType: 'ChooseCardsPrompt' });
  const choices = [
    cardChoice('hooh', HOOH), cardChoice('fighting', FIGHTING),
    cardChoice('darkness', DARKNESS), cardChoice('dde', DDE),
    cardChoice('lightning', LIGHTNING), emptyChoice('empty')
  ];
  const p = prompt(0, 'ChooseCardsPrompt', 'Battle Compressor', 'Battle Compressor PHF 92', choices, {
    selectionType: 'card-combination', minimumCount: 0, maximumCount: 3,
    allowCancel: false, sourceZone: 'deck', ownerSeat: 'actor',
    isOwnerVisible: true, isSecret: false
  });
  const result = runDecision({ obs, promptValue: p });
  assert.deepEqual(new Set(result.decision.tokens), new Set(['hooh', 'fighting', 'darkness']));
});

test('Professor Sada energy selection chooses up to two useful Basic Energy cards', () => {
  const obs = observation({ ownActive: pokemon({ printing: RAGING,
    subtypes: ['Basic', 'ex', 'Ancient'] }), ownDiscard: [LIGHTNING, FIGHTING, DARKNESS],
    decisionKind: 'owner-prompt', promptType: 'ChooseEnergyPrompt' });
  const choices = [
    energyChoice('l', LIGHTNING, 'Lightning'),
    energyChoice('f', FIGHTING, 'Fighting'),
    energyChoice('d', DARKNESS, 'Darkness')
  ];
  const p = prompt(0, 'ChooseEnergyPrompt', "Professor Sada's Vitality",
    "Professor Sada's Vitality PAR 170", choices, {
      selectionType: 'energy-payment', energyCount: 3, count: 3,
      energyType: 'Basic Energy', allowCancel: false
    });
  const result = runDecision({ obs, promptValue: p });
  assert.deepEqual(result.decision, { kind: 'select-choices', tokens: ['l', 'f'] });
});

test('Tapu Koko energy selection takes two Lightning Energy cards', () => {
  const obs = observation({ ownActive: pokemon({ printing: RAGING,
    subtypes: ['Basic', 'ex', 'Ancient'] }), ownDiscard: [LIGHTNING, LIGHTNING],
    decisionKind: 'owner-prompt', promptType: 'ChooseEnergyPrompt' });
  const choices = [
    energyChoice('l1', LIGHTNING, 'Lightning'),
    energyChoice('l2', LIGHTNING, 'Lightning'),
    energyChoice('f', FIGHTING, 'Fighting')
  ];
  const p = prompt(0, 'ChooseEnergyPrompt', 'Dance of the Ancients',
    'Tapu Koko ◇ TEU 51', choices, {
      selectionType: 'energy-payment', energyCount: 3, count: 3,
      energyType: 'Lightning', allowCancel: false
    });
  const result = runDecision({ obs, promptValue: p });
  assert.deepEqual(result.decision, { kind: 'select-choices', tokens: ['l1', 'l2'] });
});

test('Ho-Oh Rebirth chooses three distinct Basic Energy types', () => {
  const obs = observation({ ownActive: pokemon({ printing: RAGING,
    subtypes: ['Basic', 'ex', 'Ancient'] }), ownDiscard: [HOOH, LIGHTNING, FIGHTING, DARKNESS],
    decisionKind: 'owner-prompt', promptType: 'ChooseEnergyPrompt' });
  const choices = [
    energyChoice('l1', LIGHTNING, 'Lightning'),
    energyChoice('l2', LIGHTNING, 'Lightning'),
    energyChoice('f', FIGHTING, 'Fighting'),
    energyChoice('d', DARKNESS, 'Darkness'),
    energyChoice('dde', DDE, 'Colorless/Dragon')
  ];
  const p = prompt(0, 'ChooseEnergyPrompt', 'Rebirth', HOOH, choices, {
    selectionType: 'energy-payment', energyCount: 5, count: 5,
    energyType: 'Basic Energy', allowCancel: false
  });
  const result = runDecision({ obs, promptValue: p });
  assert.deepEqual(new Set(result.decision.tokens), new Set(['l1', 'f', 'd']));
});

test('Ultimate Ray energy selection prefers distinct Basic Energy types', () => {
  const obs = observation({ ownActive: pokemon({ printing: ADP,
    subtypes: ['Basic', 'TAG TEAM', 'GX'], energies: [DDE] }),
    decisionKind: 'owner-prompt', promptType: 'ChooseEnergyPrompt' });
  const choices = [
    energyChoice('l1', LIGHTNING, 'Lightning'),
    energyChoice('l2', LIGHTNING, 'Lightning'),
    energyChoice('f', FIGHTING, 'Fighting'),
    energyChoice('d', DARKNESS, 'Darkness')
  ];
  const p = prompt(0, 'ChooseEnergyPrompt', 'Ultimate Ray', ADP, choices, {
    selectionType: 'energy-payment', energyCount: 4, count: 4,
    energyType: 'Basic Energy', allowCancel: false
  });
  const result = runDecision({ obs, promptValue: p });
  assert.deepEqual(new Set(result.decision.tokens), new Set(['l1', 'f', 'd']));
});

test('Sada chooses only Ancient Pokémon and prefers Raging Bolt plus Sandy Shocks', () => {
  const bolt = pokemon({ printing: RAGING, subtypes: ['Basic', 'ex', 'Ancient'] });
  const sandy = pokemon({ printing: SANDY, subtypes: ['Basic', 'ex', 'Ancient'] });
  const latias = pokemon({ printing: 'Latias ex SSP 76', subtypes: ['Basic', 'ex'], abilities: ['Skyliner'] });
  const obs = observation({ ownActive: bolt, ownBench: [sandy, latias, null, null, null],
    opponentPrizeCount: 4, decisionKind: 'owner-prompt', promptType: 'ChoosePokemonPrompt' });
  const choices = [
    pokemonChoice('bolt', bolt, 'actor', 'active'),
    pokemonChoice('sandy', sandy, 'actor', 'bench'),
    pokemonChoice('latias', latias, 'actor', 'bench')
  ];
  const p = prompt(0, 'ChoosePokemonPrompt', "Professor Sada's Vitality", "Professor Sada's Vitality PAR 170",
    choices, { selectionType: 'pokemon', minimumCount: 1, maximumCount: 2,
      allowCancel: false });
  const result = runDecision({ obs, promptValue: p });
  assert.deepEqual(new Set(result.decision.tokens), new Set(['bolt', 'sandy']));
});

test('Tapu Koko selects two high-value Benched recipients', () => {
  const bolt = pokemon({ printing: RAGING, subtypes: ['Basic', 'ex', 'Ancient'] });
  const adp = pokemon({ printing: ADP, subtypes: ['Basic', 'TAG TEAM', 'GX'] });
  const sandy = pokemon({ printing: SANDY, subtypes: ['Basic', 'ex', 'Ancient'] });
  const obs = observation({ ownActive: pokemon({ printing: 'Flutter Mane TEF 78',
    subtypes: ['Basic', 'Ancient'], abilities: ['Midnight Fluttering'] }),
    ownBench: [bolt, adp, sandy, null, null],
    decisionKind: 'owner-prompt', promptType: 'ChoosePokemonPrompt' });
  const choices = [pokemonChoice('bolt', bolt), pokemonChoice('adp', adp), pokemonChoice('sandy', sandy)];
  const p = prompt(0, 'ChoosePokemonPrompt', 'Dance of the Ancients', 'Tapu Koko ◇ TEU 51', choices, {
    selectionType: 'pokemon', minimumCount: 2, maximumCount: 2,
    allowCancel: false, targetZone: 'bench'
  });
  const result = runDecision({ obs, promptValue: p });
  assert.deepEqual(new Set(result.decision.tokens), new Set(['bolt', 'adp']));
});

test('Guzma selects a low-HP two-Prize target from the opponent Bench', () => {
  const bolt = pokemon({ printing: RAGING, subtypes: ['Basic', 'ex', 'Ancient'] });
  const clefairy = pokemon({ printing: "Lillie's Clefairy ex JTG 56", hp: 190, damage: 100,
    subtypes: ['Basic', 'ex'], types: ['Psychic'] });
  const shadow = pokemon({ printing: 'Shadow Rider Calyrex VMAX CRE 75', hp: 320,
    subtypes: ['VMAX'], types: ['Psychic'] });
  const obs = observation({ ownActive: bolt, opponentActive: shadow,
    opponentBench: [clefairy, null, null, null, null],
    decisionKind: 'owner-prompt', promptType: 'ChoosePokemonPrompt' });
  const choices = [pokemonChoice('clefairy', clefairy, 'opponent')];
  const p = prompt(0, 'ChoosePokemonPrompt', 'Guzma', 'Guzma BUS 115', choices, {
    selectionType: 'pokemon', minimumCount: 1, maximumCount: 1,
    allowCancel: false, targetZone: 'bench'
  });
  const result = runDecision({ obs, promptValue: p });
  assert.deepEqual(result.decision, { kind: 'select-choices', tokens: ['clefairy'] });
});

test('Quick Ball discard protects DDE and singleton Supporters', () => {
  const obs = observation({
    ownHand: [DDE, "Professor Sada's Vitality PAR 170", LIGHTNING, FIGHTING],
    decisionKind: 'owner-prompt', promptType: 'ChooseCardsPrompt'
  });
  const choices = [
    cardChoice('dde', DDE, { sourceZone: 'hand' }),
    cardChoice('sada', "Professor Sada's Vitality PAR 170", { sourceZone: 'hand' }),
    cardChoice('lightning', LIGHTNING, { sourceZone: 'hand' }),
    cardChoice('fighting', FIGHTING, { sourceZone: 'hand' })
  ];
  const p = prompt(0, 'ChooseCardsPrompt', 'Quick Ball', 'Quick Ball FST 237', choices, {
    selectionType: 'card-combination', minimumCount: 1, maximumCount: 1,
    allowCancel: false, sourceZone: 'hand', ownerSeat: 'actor',
    isOwnerVisible: true, isSecret: false
  });
  const result = runDecision({ obs, promptValue: p });
  assert.equal(result.decision.kind, 'select-choices');
  assert.equal(result.decision.tokens.length, 1);
  assert.notEqual(result.decision.tokens[0], 'dde');
  assert.notEqual(result.decision.tokens[0], 'sada');
});

test('Hisuian Heavy Ball does not guess hidden prize identities', () => {
  const obs = observation({ decisionKind: 'owner-prompt', promptType: 'ChoosePrizePrompt' });
  const hiddenChoices = [
    { token: 'p1', kind: 'prize', label: 'Prize 1',
      publicMetadata: { selectionIndex: 0, selectedCount: 1, ownerSeat: 'actor', isOwnerVisible: false } },
    { token: 'p2', kind: 'prize', label: 'Prize 2',
      publicMetadata: { selectionIndex: 1, selectedCount: 1, ownerSeat: 'actor', isOwnerVisible: false } }
  ];
  const hiddenPrompt = prompt(0, 'ChoosePrizePrompt', 'Hisuian Heavy Ball',
    'Hisuian Heavy Ball ASR 146', hiddenChoices, {
      selectionType: 'prize-slots', requiredCount: 1, allowCancel: false
    });
  const hidden = runDecision({ obs, promptValue: hiddenPrompt });
  assert.deepEqual(hidden.decision, {
    kind: 'abstain', reasonCode: 'NO_VISIBLE_PRIZE_SLOT'
  });

  const visibleChoices = [
    { token: 'raging', kind: 'prize', label: RAGING, printing: RAGING,
      publicMetadata: { selectionIndex: 0, selectedCount: 1, ownerSeat: 'actor', isOwnerVisible: true } },
    { token: 'sada', kind: 'prize', label: "Professor Sada's Vitality PAR 170",
      printing: "Professor Sada's Vitality PAR 170",
      publicMetadata: { selectionIndex: 1, selectedCount: 1, ownerSeat: 'actor', isOwnerVisible: true } }
  ];
  const visiblePrompt = prompt(0, 'ChoosePrizePrompt', 'Hisuian Heavy Ball',
    'Hisuian Heavy Ball ASR 146', visibleChoices, {
      selectionType: 'prize-slots', requiredCount: 1, allowCancel: false
    });
  const visible = runDecision({ obs, promptValue: visiblePrompt });
  assert.deepEqual(visible.decision, { kind: 'select-choices', tokens: ['raging'] });
});

test('unsupported native prompt types fail closed', () => {
  const obs = observation({ decisionKind: 'owner-prompt', promptType: 'DiscardEnergyPrompt' });
  const p = prompt(0, 'DiscardEnergyPrompt', 'Bellowing Thunder', RAGING, [], {});
  // Unknown host prompt classes are rejected by the shared validator.
  // Test worker fail-closed behavior without claiming native acceptance.
  const worker = policyModule.createPolicy({
    role: 'opponent', seat: 0, policyVersion: POLICY_VERSION, config: {}
  });
  const decision = worker.decide({
    role: 'opponent', seat: 0, observation: obs, prompt: p,
    actionFrontier: { items: [] }
  });
  assert.deepEqual(decision, {
    kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE'
  });
});

test('analysis-only projected attacks cannot be selected', () => {
  const obs = observation();
  const result = runDecision({ obs, items: [
    action('analysis', 'projected-attack', { attackName: 'Bellowing Thunder' }),
    action('pass', 'pass')
  ]});
  assert.deepEqual(result.decision, { kind: 'select-action', token: 'pass' });
});

test('protocol rejects forbidden policy seed fields before policy execution', () => {
  const initMessage = init();
  protocol.validateInit(initMessage);
  const obs = observation();
  const request = {
    schema: protocol.REQUEST_SCHEMA, type: 'decision', requestId: 'forbidden-seed',
    sequence: 1, role: 'opponent', seat: 0, observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: obs, prompt: null, publicEventReceipt: null,
    actionFrontier: { schema: protocol.FRONTIER_SCHEMA, items: [
      action('pass', 'pass', { publicMetadata: { seed: 1 } })
    ]}
  };
  assert.throws(() => protocol.validateRequest(request, initMessage, 1, new Set()));
});

test('seat mismatch abstains without inventing a token', () => {
  const obs = observation({ seat: 0 });
  const policy = policyModule.createPolicy({
    role: 'opponent', seat: 1, policyVersion: POLICY_VERSION, config: {}
  });
  const request = {
    role: 'opponent', seat: 0, observation: obs,
    actionFrontier: { items: [action('pass', 'pass')] }, prompt: null
  };
  assert.deepEqual(policy.decide(request), {
    kind: 'abstain', reasonCode: 'ROLE_SEAT_BINDING_MISMATCH'
  });
});
