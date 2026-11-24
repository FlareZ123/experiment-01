'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const { POLICY_VERSION, createPolicy, __test: policyInternals } =
  require('../../simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs');

const policies = new Map();
function policyForSeat(seat) {
  if (!policies.has(seat)) {
    policies.set(seat, createPolicy({
      role: 'opponent',
      seat,
      policyVersion: POLICY_VERSION,
      config: {}
    }));
  }
  return policies.get(seat);
}
const policy = policyForSeat(0);
const init = {
  schema: protocol.INIT_SCHEMA,
  type: 'init',
  role: 'opponent',
  seat: 0,
  policyVersion: POLICY_VERSION,
  bundleSha256: 'a'.repeat(64),
  config: {}
};
function initForSeat(seat) {
  return { ...init, seat };
}

function restrictions() {
  return {
    cannotAttackNextTurn: false,
    cannotUseAttacksNextTurn: [],
    blockedAttackNameNextTurn: null,
    blockedAttackNameUntilLeavesActive: null,
    onlyAllowedAttackNameNextTurn: null,
    attackCostIncreaseNextTurn: 0,
    attackCostIncreaseWhileActive: 0,
    cannotRetreat: false,
    cannotRetreatNextTurn: false,
    cannotRetreatWhileActive: false,
    cannotEvolveNextTurn: false
  };
}

function pokemon(printing, options = {}) {
  const abilities = options.abilities ?? [];
  const abilitySuppressions = Object.prototype.hasOwnProperty.call(options, 'abilitySuppressions')
    ? options.abilitySuppressions
    : abilities.map(abilityName => ({
      abilityName,
      suppressed: null,
      reasonCode: null,
      sourcePrinting: null
    }));
  return {
    printing,
    name: options.name ?? printing.split(' ').slice(0, -2).join(' '),
    hp: options.hp ?? 200,
    damage: options.damage ?? 0,
    lastPlayedOrEvolvedTurn: options.lastPlayedOrEvolvedTurn ?? 1,
    printed: {
      stage: options.stage ?? 'BASIC',
      subtypes: options.subtypes ?? ['Basic'],
      types: options.types ?? ['Psychic'],
      retreatCost: options.retreatCost ?? [],
      weakness: options.weakness ?? [],
      resistance: options.resistance ?? []
    },
    specialConditions: [],
    publicRestrictions: restrictions(),
    evolutionPrintings: options.evolutionPrintings ?? [],
    energies: options.energies ?? [],
    tools: options.tools ?? [],
    attacks: options.attacks ?? [],
    abilities,
    abilityDetails: abilities.map(name => ({
      name,
      powerType: 'ABILITY',
      text: 'Once during your turn.'
    })),
    abilitySuppressions
  };
}

function publicRestrictions(options = {}) {
  const result = {
    gxUsed: false,
    vstarUsed: false,
    attackLockTurnsRemaining: 0,
    attackMaxEnergy: null,
    attackMaxEnergyTurnsRemaining: 0,
    ignoreAttackCostCardTypes: [],
    ignoreAttackCostTurnsRemaining: 0,
    cannotUseGXAttacks: false,
    pokemonPlayLocked: false,
    abilityPokemonPlayLocked: false,
    evolutionPlayLocked: false,
    itemPlayLocked: false,
    supporterPlayLocked: false,
    stadiumPlayLocked: false,
    toolPlayLocked: false,
    energyPlayLocked: false,
    specialEnergyPlayLocked: false
  };
  result.stadiumAndToolHaveNoEffectTurnsRemaining =
    options.omitStadiumSuppression
      ? null
      : (options.stadiumAndToolHaveNoEffectTurnsRemaining ?? 0);
  return result;
}

function player(options = {}) {
  const bench = (options.bench ?? []).slice(0, 5);
  while (bench.length < 5) bench.push(null);
  return {
    active: options.active ?? null,
    bench,
    stadium: options.stadium ?? [],
    discard: options.discard ?? [],
    lostZone: options.lostZone ?? [],
    resolvingSupporter: options.resolvingSupporter ?? [],
    publicHand: null,
    prizeSlots: options.prizeSlots ?? [],
    publicTurnRestrictions: publicRestrictions(options),
    handCount: options.handCount ?? 0,
    deckCount: options.deckCount ?? 30,
    prizeCount: options.prizeCount ?? 6
  };
}

function turnResources() {
  return {
    supporterPlayedTurn: 0,
    retreatedTurn: 0,
    extraTurnActive: false,
    energyPlayedTurn: false,
    stadiumPlayedTurn: false,
    stadiumUsedTurn: false,
    vstarUsed: false,
    pokemonPlayLocked: false,
    abilityPokemonPlayLocked: false,
    evolutionPlayLocked: false,
    itemPlayLocked: false,
    supporterPlayLocked: false,
    stadiumPlayLocked: false,
    toolPlayLocked: false,
    energyPlayLocked: false,
    specialEnergyPlayLocked: false
  };
}

function observation(options = {}) {
  return {
    actorSeat: options.seat ?? 0,
    globalTurn: options.globalTurn ?? 3,
    phase: 2,
    decisionKind: options.prompt ? 'owner-prompt' : 'owner-root',
    pendingPromptType: options.prompt?.promptType ?? null,
    pendingOwnerDeckSearch: false,
    ownHand: options.ownHand ?? [],
    ownPublic: options.ownPublic ?? player(),
    opponentPublic: options.opponentPublic ?? player(),
    ownTurnResources: options.ownTurnResources ?? turnResources(),
    ownerK1: null
  };
}

function rootRequest(options = {}) {
  const seat = options.seat ?? 0;
  const obs = observation({ ...options, seat });
  return {
    schema: protocol.REQUEST_SCHEMA,
    type: 'decision',
    requestId: options.requestId ?? 'agent6-root-1',
    sequence: options.sequence ?? 1,
    role: 'opponent',
    seat,
    observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: obs,
    prompt: null,
    publicEventReceipt: options.receipt ?? null,
    actionFrontier: {
      schema: protocol.FRONTIER_SCHEMA,
      items: options.items ?? [{ token: 'pass', kind: 'pass', label: 'Pass turn' }]
    }
  };
}

function actorChoiceSource(sourcePrinting, effectName) {
  return {
    classification: 'actor-choice',
    sourceKind: sourcePrinting === null ? 'engine' : 'card-effect',
    sourcePrinting,
    effectName
  };
}

function promptRequest(options = {}) {
  const seat = options.seat ?? 0;
  const prompt = {
    schema: protocol.PROMPT_SCHEMA,
    actingSeat: seat,
    promptType: options.promptType,
    description: options.description ?? 'Choose a legal option',
    source: options.source,
    choices: options.choices,
    ...(options.publicMetadata ? { publicMetadata: options.publicMetadata } : {})
  };
  const obs = observation({
    ...(options.observation ?? {}),
    prompt,
    seat
  });
  return {
    schema: protocol.REQUEST_SCHEMA,
    type: 'decision',
    requestId: options.requestId ?? 'agent6-prompt-1',
    sequence: options.sequence ?? 1,
    role: 'opponent',
    seat,
    observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: obs,
    prompt,
    publicEventReceipt: options.receipt ?? null,
    actionFrontier: {
      schema: protocol.FRONTIER_SCHEMA,
      items: []
    }
  };
}

function checkedDecision(request, seat = 0) {
  const validated = protocol.validateRequest(request, initForSeat(seat), request.sequence, new Set());
  const decision = policyForSeat(seat).decide(request);
  protocol.validateDecision(decision, validated.prompt, validated.actionTokens);
  return decision;
}

function eventPokemon(slot) {
  return slot ? {
    printing: slot.printing,
    movedFromBenchToActiveThisTurn: null,
    knownAbilityUse: []
  } : null;
}

function paleMoonReceipt(ownPublic, turn = 3) {
  return {
    version: protocol.EVENT_RECEIPT_VERSION,
    actorSeat: 0,
    turn,
    ownerActive: eventPokemon(ownPublic.active),
    ownerBench: ownPublic.bench.map(eventPokemon),
    priorOpponentTurnKO: { any: false, byAttack: false },
    opponentLastTurnAttack: null,
    opponentLastTurnTurn: turn - 1,
    opponentLastTurnAttacks: [{
      turn: turn - 1,
      sourcePrinting: 'Trevenant & Dusknoir-GX SMP 217',
      attackName: 'Pale Moon-GX',
      gxAttack: true,
      copycatAttack: false
    }]
  };
}

test('rank1 response recovers the three discarded Psychic Energy before evolving', () => {
  const latias = pokemon('Latias ex SSP 76', { hp: 210, damage: 40, abilities: ['Skyliner'] });
  const own = player({
    active: pokemon('Girafarig LOT 94', { hp: 90 }),
    bench: [
      latias,
      pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 }),
      pokemon("Lillie's Clefairy ex JTG 56", { hp: 190 }),
      pokemon('Dialga-GX UPR 100', { hp: 180 }),
      pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 })
    ],
    discard: [
      'Psychic Energy MEE 13',
      'Psychic Energy MEE 13',
      'Psychic Energy MEE 13'
    ]
  });
  const request = rootRequest({
    ownHand: [
      'Tulip PAR 181',
      'Shadow Rider Calyrex VMAX CRE 75',
      'Shadow Rider Calyrex VMAX CRE 75',
      'Acerola BUS 112',
      'Unfair Stamp TWM 165'
    ],
    ownPublic: own,
    opponentPublic: player({ handCount: 4 }),
    items: [
      { token: 'tulip', kind: 'play-card', actorPrinting: 'Tulip PAR 181',
        publicMetadata: { cardType: 'trainer', handIndex: 0 } },
      { token: 'acerola', kind: 'play-card', actorPrinting: 'Acerola BUS 112',
        publicMetadata: { cardType: 'trainer', handIndex: 3 } },
      { token: 'evolve', kind: 'play-card',
        actorPrinting: 'Shadow Rider Calyrex VMAX CRE 75',
        targetPrinting: 'Shadow Rider Calyrex V CRE 74',
        publicMetadata: { cardType: 'pokemon', handIndex: 1,
          targetSeat: 'actor', targetZone: 'bench', targetIndex: 1,
          isOwnerVisible: true } },
      { token: 'stamp', kind: 'play-card', actorPrinting: 'Unfair Stamp TWM 165',
        publicMetadata: { cardType: 'trainer', handIndex: 4 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'tulip' });
});

test('rank1 clears an observed Pale Moon-GX threat with Acerola when Latias is Active', () => {
  const active = pokemon('Latias ex SSP 76', { hp: 210, damage: 50, abilities: ['Skyliner'] });
  const own = player({
    active,
    bench: [pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 })],
    discard: ['Psychic Energy MEE 13', 'Psychic Energy MEE 13', 'Psychic Energy MEE 13']
  });
  const request = rootRequest({
    ownHand: ['Acerola BUS 112', 'Tulip PAR 181'],
    ownPublic: own,
    opponentPublic: player({ handCount: 4 }),
    receipt: paleMoonReceipt(own),
    items: [
      { token: 'acerola', kind: 'play-card', actorPrinting: 'Acerola BUS 112',
        publicMetadata: { cardType: 'trainer', handIndex: 0 } },
      { token: 'tulip', kind: 'play-card', actorPrinting: 'Tulip PAR 181',
        publicMetadata: { cardType: 'trainer', handIndex: 1 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'acerola' });
});

test('Tulip prompt selects the available Basic Psychic Energy cards and not the empty token', () => {
  const choices = [
    { token: 'psychic-0', kind: 'card', printing: 'Psychic Energy MEE 13',
      label: 'Psychic Energy', publicMetadata: { sourceZone: 'discard' } },
    { token: 'psychic-1', kind: 'card', printing: 'Psychic Energy MEE 13',
      label: 'Psychic Energy', publicMetadata: { sourceZone: 'discard' } },
    { token: 'psychic-2', kind: 'card', printing: 'Psychic Energy MEE 13',
      label: 'Psychic Energy', publicMetadata: { sourceZone: 'discard' } },
    { token: 'empty', kind: 'empty-selection', label: 'Select none' }
  ];
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Tulip PAR 181', 'Tulip'),
    choices,
    publicMetadata: {
      sourceZone: 'discard',
      minimumCount: 0,
      maximumCount: 3,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownPublic: player({ discard: [
        'Psychic Energy MEE 13',
        'Psychic Energy MEE 13',
        'Psychic Energy MEE 13'
      ] })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['psychic-0', 'psychic-1', 'psychic-2']
  });
});

test('Underworld Door targets Latias until its two-Energy Eon Blade line is funded', () => {
  const latias = pokemon('Latias ex SSP 76', { hp: 210, abilities: ['Skyliner'] });
  const rider = pokemon('Shadow Rider Calyrex VMAX CRE 75', { hp: 320, stage: 'VMAX' });
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Shadow Rider Calyrex VMAX CRE 75', 'Underworld Door'),
    choices: [
      { token: 'latias', kind: 'pokemon', printing: latias.printing, label: 'Latias ex',
        publicMetadata: { selectionIndex: 0, selectedCount: 1,
          selectionType: 'pokemon', ownerSeat: 'actor', targetZone: 'bench',
          isOwnerVisible: true } },
      { token: 'rider', kind: 'pokemon', printing: rider.printing, label: 'Shadow Rider Calyrex VMAX',
        publicMetadata: { selectionIndex: 1, selectedCount: 1,
          selectionType: 'pokemon', ownerSeat: 'actor', targetZone: 'bench',
          isOwnerVisible: true } }
    ],
    publicMetadata: {
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'pokemon'
    },
    observation: {
      ownPublic: player({
        active: pokemon('Girafarig LOT 94', { hp: 90 }),
        bench: [latias, rider]
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['latias']
  });
});

test('active promotion avoids a 150-damage-exposed one-Prize Girafarig and prefers a durable two-Prize body', () => {
  const girafarig = pokemon('Girafarig LOT 94', { hp: 90 });
  const dialga = pokemon('Dialga-GX UPR 100', { hp: 180 });
  const clefairy = pokemon("Lillie's Clefairy ex JTG 56", { hp: 190 });
  const riderV = pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 });
  const riderVmax = pokemon('Shadow Rider Calyrex VMAX CRE 75', { hp: 320, stage: 'VMAX' });
  const entries = [girafarig, dialga, clefairy, riderV, riderVmax];
  const choices = entries.map((slot, index) => ({
    token: 'bench-' + index,
    kind: 'pokemon',
    printing: slot.printing,
    label: slot.name,
    publicMetadata: {
      selectionIndex: index,
      selectedCount: 1,
      selectionType: 'pokemon',
      ownerSeat: 'actor',
      targetZone: 'bench',
      isOwnerVisible: true
    }
  }));
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource(null, 'Promote a Pokémon'),
    choices,
    publicMetadata: {
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'pokemon'
    },
    observation: {
      ownPublic: player({ active: null, bench: entries })
    }
  });
  const decision = checkedDecision(request);
  assert.equal(decision.kind, 'select-choices');
  assert.equal(decision.tokens.length, 1);
  assert.equal(decision.tokens[0], 'bench-3');
});

test('unknown card-effect Pokemon prompts do not fall through to engine promotion', () => {
  const candidate = pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 });
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Unknown Supporter XYZ 1', 'Unknown Pokémon selection'),
    choices: [{
      token: 'candidate',
      kind: 'pokemon',
      printing: candidate.printing,
      label: candidate.name,
      publicMetadata: {
        selectionIndex: 0,
        selectedCount: 1,
        selectionType: 'pokemon',
        ownerSeat: 'actor',
        targetZone: 'bench',
        isOwnerVisible: true
      }
    }],
    publicMetadata: {
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'pokemon'
    },
    observation: {
      ownPublic: player({ active: null, bench: [candidate] })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain',
    reasonCode: 'UNCLASSIFIED_POKEMON_PROMPT'
  });
});

test('energy-payment selection pays the visible cost count, not every attached Energy', () => {
  const choices = [0, 1, 2].map(index => ({
    token: 'energy-' + index,
    kind: 'energy',
    printing: 'Psychic Energy MEE 13',
    label: 'Psychic Energy',
    publicMetadata: { energyType: 'Psychic' }
  }));
  const request = promptRequest({
    promptType: 'ChooseEnergyPrompt',
    source: actorChoiceSource(null, 'Attack cost payment'),
    choices,
    publicMetadata: {
      count: 3,
      energyCount: 3,
      energyType: 'Psychic,Colorless',
      allowCancel: false,
      selectionType: 'energy-payment'
    }
  });
  const decision = checkedDecision(request);
  assert.equal(decision.kind, 'select-choices');
  assert.equal(decision.tokens.length, 2);
});

test('Underworld Door energy assignment uses actor-visible exact bench index and native choice token', () => {
  const source = actorChoiceSource('Shadow Rider Calyrex VMAX CRE', 'Underworld Door');
  const energyPrinting = 'Psychic Energy MEE 13';
  const request = promptRequest({
    promptType: 'AttachEnergyPrompt',
    source,
    choices: [0, 1].map(index => ({
      token: 'attach-bench-' + index,
      kind: 'energy',
      printing: energyPrinting,
      label: 'Attach ' + energyPrinting + ' to Bench ' + (index + 1) + ': Shadow Rider Calyrex V CRE',
      publicMetadata: {
        sourceZone: 'hand', ownerSeat: 'actor', isOwnerVisible: true,
        energyType: 'BASIC', zone: 'bench', benchIndex: index,
        choiceIndex: index, selectedCount: 1
      }
    })),
    publicMetadata: {
      selectionType: 'energy-attachment', count: 2, minimumCount: 1,
      maximumCount: 1, allowCancel: false, sourceZone: 'hand',
      ownerSeat: 'actor', isOwnerVisible: true, energyType: 'BASIC', zone: 'bench'
    },
    observation: {
      ownPublic: player({
        active: pokemon('Shadow Rider Calyrex VMAX CRE 75', { hp: 320, stage: 'VMAX' }),
        bench: [
          pokemon('Shadow Rider Calyrex V CRE', {
            energies: [energyPrinting, energyPrinting]
          }),
          pokemon('Shadow Rider Calyrex V CRE')
        ]
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice', token: 'attach-bench-1'
  });
  const audited = policy.decideWithAudit(request);
  assert.equal(audited.policyAudit.selectionRuleCode, 'UNDERWORLD_ATTACH_BENCH_SCORE');
  protocol.validatePolicyAudit(audited.policyAudit, request, audited.decision, POLICY_VERSION);
});

test('Underworld Door selects the native cancel-only choice with no Psychic Bench target', () => {
  for (const seat of [0, 1]) {
    const request = promptRequest({
      seat,
      promptType: 'AttachEnergyPrompt',
      source: actorChoiceSource('Shadow Rider Calyrex VMAX CRE 75', 'Underworld Door'),
      choices: [{ token: 'cancel', kind: 'cancel', label: 'Cancel' }],
      publicMetadata: {
        selectionType: 'energy-attachment', count: 1,
        minimumCount: 1, maximumCount: 1, allowCancel: true,
        sourceZone: 'hand', ownerSeat: 'actor', isOwnerVisible: true,
        energyType: 'BASIC', zone: 'bench'
      },
      observation: {
        ownHand: ['Psychic Energy MEE 13'],
        ownPublic: player({
          active: pokemon('Shadow Rider Calyrex VMAX CRE 75', {
            stage: 'VMAX', abilities: ['Underworld Door']
          }),
          bench: [pokemon('Marshadow UNB 81', { types: ['Fighting'] })]
        })
      }
    });
    assert.deepEqual(checkedDecision(request, seat), {
      kind: 'select-choice', token: 'cancel'
    });
  }
});

test('Pale Moon-GX values its unconditional delayed Knock Out and conditional Energy discard', () => {
  const paleMoonScore = request => {
    const audited = policy.decideWithAudit(request);
    return audited.policyAudit.evaluations.find(row => row.token === 'pale-moon')?.score;
  };
  const ownActive = energies => pokemon('Trevenant & Dusknoir-GX SMP 217', {
    hp: 270, energies
  });
  const opponentActive = options => pokemon('Regidrago VSTAR SIT 136', {
    hp: 280, types: ['Dragon'], ...options
  });
  const paleMoonOnly = [
    { token: 'pale-moon', kind: 'attack', attackName: 'Pale Moon-GX' },
    { token: 'pass', kind: 'pass' }
  ];

  const noExtra = rootRequest({
    ownPublic: player({ active: ownActive([
      'Psychic Energy MEE 13', 'Psychic Energy MEE 13'
    ]) }),
    opponentPublic: player({
      active: opponentActive({ energies: [
        'Grass Energy SVE 1', 'Grass Energy SVE 1', 'Grass Energy SVE 1'
      ] })
    }),
    items: paleMoonOnly
  });
  const noExtraScore = paleMoonScore(noExtra);
  assert.ok(noExtraScore > 0,
    'the unconditional delayed Knock Out is valuable even without the extra-Energy clause');

  const dimensionValleyExtra = rootRequest({
    ownPublic: player({
      active: ownActive(['Psychic Energy MEE 13', 'Psychic Energy MEE 13']),
      stadium: ['Dimension Valley PHF 93']
    }),
    opponentPublic: player({
      active: opponentActive({ energies: [
        'Grass Energy SVE 1', 'Grass Energy SVE 1', 'Grass Energy SVE 1'
      ] })
    }),
    items: paleMoonOnly
  });
  assert.ok(paleMoonScore(dimensionValleyExtra) > noExtraScore,
    'Dimension Valley makes two Psychic Energy sufficient for the extra-Psychic Energy denial');

  const escapeOuts = rootRequest({
    ownPublic: player({ active: ownActive([
      'Psychic Energy MEE 13', 'Psychic Energy MEE 13'
    ]) }),
    opponentPublic: player({
      active: opponentActive({
        energies: ['Grass Energy SVE 1'],
        retreatCost: ['Colorless']
      }),
      bench: [pokemon('Dratini OBF 105')],
      handCount: 5
    }),
    items: paleMoonOnly
  });
  assert.ok(paleMoonScore(escapeOuts) < noExtraScore,
    'a visible retreat path and larger hidden hand discount the delayed-KO estimate');

  const immediateKnockout = rootRequest({
    ownPublic: player({ active: ownActive([
      'Psychic Energy MEE 13',
      'Psychic Energy MEE 13',
      'Psychic Energy MEE 13'
    ]) }),
    opponentPublic: player({
      active: opponentActive({
        hp: 150,
        energies: ['Grass Energy SVE 1', 'Grass Energy SVE 1', 'Grass Energy SVE 1']
      })
    }),
    items: [
      { token: 'pale-moon', kind: 'attack', attackName: 'Pale Moon-GX' },
      { token: 'night-watch', kind: 'attack', attackName: 'Night Watch' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(immediateKnockout), {
    kind: 'select-action', token: 'night-watch'
  });
});


test('Energy Drive counts only both Active Pokémon and ignores Weakness', () => {
  const fairy = pokemon("Lillie's Clefairy ex JTG 56", {
    abilities: ['Fairy Zone'],
    abilitySuppressions: [{
      abilityName: 'Fairy Zone', suppressed: false,
      reasonCode: null, sourcePrinting: null
    }]
  });
  const request = rootRequest({
    ownPublic: player({
      active: pokemon('Tapu Lele-GX GRI 60', {
        energies: ['Psychic Energy MEE 13']
      }),
      bench: [
        fairy,
        pokemon('Shadow Rider Calyrex VMAX CRE 75', {
          stage: 'VMAX',
          energies: [
            'Psychic Energy MEE 13',
            'Psychic Energy MEE 13',
            'Psychic Energy MEE 13'
          ]
        })
      ]
    }),
    opponentPublic: player({
      active: pokemon('Regidrago VSTAR SIT 136', {
        hp: 240, types: ['Dragon'], energies: ['Grass Energy SVE 1']
      }),
      bench: [pokemon('Shadow Rider Calyrex VMAX CRE 75', {
        energies: ['Psychic Energy MEE 13', 'Psychic Energy MEE 13']
      })]
    }),
    items: [
      { token: 'energy-drive', kind: 'attack', attackName: 'Energy Drive' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  const audited = policy.decideWithAudit(request);
  const energyDriveScore = audited.policyAudit.evaluations
    .find(row => row.token === 'energy-drive')?.score;
  assert.equal(energyDriveScore, 91,
    'two Active Energy cards yield 40 damage; Benched Energy and Dragon weakness do not count');
});

test('rank1 policy abstains rather than guessing on an unsupported prompt type', () => {
  const request = promptRequest({
    promptType: 'UnmodeledPrompt',
    source: actorChoiceSource(null, 'Unknown engine choice'),
    choices: [{ token: 'x', kind: 'option', label: 'Unknown' }],
    publicMetadata: { selectionType: 'option', allowCancel: false }
  });
  assert.throws(() => checkedDecision(request), /PROMPT_SELECTION_TYPE_MISMATCH/);
});

test('Unfair Stamp is not fired merely because the opponent took a Prize on an earlier turn', () => {
  const request = rootRequest({
    ownHand: ['Unfair Stamp TWM 165'],
    ownPublic: player({ handCount: 1, prizeCount: 5 }),
    opponentPublic: player({ handCount: 2, prizeCount: 6 }),
    items: [
      { token: 'stamp', kind: 'play-card', actorPrinting: 'Unfair Stamp TWM 165',
        publicMetadata: { cardType: 'trainer', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'pass' });
});


test('Tulip with fewer than the maximum recoverable cards never includes the empty token in an array', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Tulip PAR 181', 'Tulip'),
    choices: [
      { token: 'psychic-only', kind: 'card', printing: 'Psychic Energy MEE 13',
        label: 'Psychic Energy', publicMetadata: { sourceZone: 'discard' } },
      { token: 'empty', kind: 'empty-selection', label: 'Select none' }
    ],
    publicMetadata: {
      sourceZone: 'discard',
      minimumCount: 0,
      maximumCount: 3,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: { ownPublic: player({ discard: ['Psychic Energy MEE 13'] }) }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['psychic-only']
  });
});

test('zero-count prize prompt uses the special empty-selection token', () => {
  const request = promptRequest({
    promptType: 'ChoosePrizePrompt',
    source: actorChoiceSource(null, 'Prize selection'),
    choices: [{ token: 'empty', kind: 'empty-selection', label: 'Select none' }],
    publicMetadata: {
      count: 0,
      requiredCount: 0,
      allowCancel: false,
      isSecret: false,
      selectionType: 'prize-slots'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice',
    token: 'empty'
  });
});

test('zero-count card-order prompt uses the special empty-selection token', () => {
  const request = promptRequest({
    promptType: 'OrderCardsPrompt',
    source: actorChoiceSource(null, 'Order cards'),
    choices: [{ token: 'empty', kind: 'empty-selection', label: 'Select none' }],
    publicMetadata: {
      count: 0,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-order'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice',
    token: 'empty'
  });
});

test('card-order and prize multi-selects return only their exact item kinds', () => {
  const orderRequest = promptRequest({
    promptType: 'OrderCardsPrompt',
    source: actorChoiceSource(null, 'Order cards'),
    choices: [
      { token: 'order-energy', kind: 'card-order-item', printing: 'Psychic Energy MEE 13',
        label: 'Psychic Energy', publicMetadata: { selectionIndex: 0 } },
      { token: 'order-v', kind: 'card-order-item', printing: 'Shadow Rider Calyrex V CRE 74',
        label: 'Shadow Rider Calyrex V', publicMetadata: { selectionIndex: 1 } },
      { token: 'cancel', kind: 'cancel', label: 'Cancel' }
    ],
    publicMetadata: {
      count: 2,
      allowCancel: true,
      isSecret: false,
      selectionType: 'card-order'
    }
  });
  assert.deepEqual(checkedDecision(orderRequest), {
    kind: 'select-choices',
    tokens: ['order-v', 'order-energy']
  });

  const prizeRequest = promptRequest({
    promptType: 'ChoosePrizePrompt',
    source: actorChoiceSource(null, 'Prize selection'),
    choices: [
      { token: 'prize-0', kind: 'prize', label: 'Prize 1',
        publicMetadata: { choiceIndex: 0 } },
      { token: 'prize-1', kind: 'prize', label: 'Prize 2',
        publicMetadata: { choiceIndex: 1 } },
      { token: 'cancel', kind: 'cancel', label: 'Cancel' }
    ],
    publicMetadata: {
      count: 2,
      requiredCount: 2,
      allowCancel: true,
      isSecret: false,
      selectionType: 'prize-slots'
    }
  });
  assert.deepEqual(checkedDecision(prizeRequest), {
    kind: 'select-choices',
    tokens: ['prize-0', 'prize-1']
  });
});


test('Raihan search chooses a setup card rather than a second Basic Psychic Energy', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Raihan EVS 152', 'Raihan'),
    choices: [
      { token: 'energy', kind: 'card', printing: 'Psychic Energy MEE 13',
        label: 'Psychic Energy', publicMetadata: { sourceZone: 'deck' } },
      { token: 'vmax', kind: 'card', printing: 'Shadow Rider Calyrex VMAX CRE 75',
        label: 'Shadow Rider Calyrex VMAX', publicMetadata: { sourceZone: 'deck' } },
      { token: 'v', kind: 'card', printing: 'Shadow Rider Calyrex V CRE 74',
        label: 'Shadow Rider Calyrex V', publicMetadata: { sourceZone: 'deck' } }
    ],
    publicMetadata: {
      sourceZone: 'deck',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['Raihan EVS 152'],
      ownPublic: player({
        active: pokemon('Girafarig LOT 94', { hp: 90 }),
        bench: [pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 })]
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['vmax']
  });
});

test('Fog Crystal searches Shadow Rider V before Energy when no V is visible or in hand', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Fog Crystal CRE 140', 'Fog Crystal'),
    choices: [
      { token: 'energy', kind: 'card', printing: 'Psychic Energy MEE 13',
        label: 'Psychic Energy', publicMetadata: { sourceZone: 'deck' } },
      { token: 'v', kind: 'card', printing: 'Shadow Rider Calyrex V CRE 74',
        label: 'Shadow Rider Calyrex V', publicMetadata: { sourceZone: 'deck' } }
    ],
    publicMetadata: {
      sourceZone: 'deck',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['Fog Crystal CRE 140'],
      ownPublic: player({ active: pokemon('Girafarig LOT 94', { hp: 90 }) })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['v']
  });
});

test('Battle Compressor selects Basic Psychic Energy for a held Tulip recovery line', () => {
  const choices = [
    'Psychic Energy MEE 13',
    'Psychic Energy MEE 13',
    'Psychic Energy MEE 13',
    'Shadow Rider Calyrex VMAX CRE 75'
  ].map((printing, index) => ({
    token: 'deck-' + index,
    kind: 'card',
    printing,
    label: printing,
    publicMetadata: { sourceZone: 'deck' }
  }));
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Battle Compressor PHF 92', 'Battle Compressor'),
    choices,
    publicMetadata: {
      sourceZone: 'deck',
      minimumCount: 1,
      maximumCount: 3,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['Battle Compressor PHF 92', 'Tulip PAR 181'],
      ownPublic: player({ active: pokemon('Girafarig LOT 94', { hp: 90 }) })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['deck-0', 'deck-1', 'deck-2']
  });
});

test('VS Seeker retrieves Tulip when the discard contains a recoverable Psychic package', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('VS Seeker PHF 109', 'VS Seeker'),
    choices: [
      { token: 'acerola', kind: 'card', printing: 'Acerola BUS 112',
        label: 'Acerola', publicMetadata: { sourceZone: 'discard' } },
      { token: 'tulip', kind: 'card', printing: 'Tulip PAR 181',
        label: 'Tulip', publicMetadata: { sourceZone: 'discard' } },
      { token: 'raihan', kind: 'card', printing: 'Raihan EVS 152',
        label: 'Raihan', publicMetadata: { sourceZone: 'discard' } }
    ],
    publicMetadata: {
      sourceZone: 'discard',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['VS Seeker PHF 109'],
      ownPublic: player({
        discard: ['Psychic Energy MEE 13', 'Psychic Energy MEE 13', 'Psychic Energy MEE 13']
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['tulip']
  });
});


test('VS Seeker does not prioritize a second Tulip already held in hand', () => {
  const ownPublic = player({
    handCount: 2,
    discard: ['Psychic Energy MEE 13', 'Psychic Energy MEE 13', 'Psychic Energy MEE 13']
  });
  const receipt = paleMoonReceipt(ownPublic);
  receipt.priorOpponentTurnKO = { ...receipt.priorOpponentTurnKO, any: true, byAttack: true };
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('VS Seeker PHF 109', 'VS Seeker'),
    choices: [
      { token: 'tulip', kind: 'card', printing: 'Tulip PAR 181',
        label: 'Tulip', publicMetadata: { sourceZone: 'discard' } },
      { token: 'raihan', kind: 'card', printing: 'Raihan EVS 152',
        label: 'Raihan', publicMetadata: { sourceZone: 'discard' } }
    ],
    publicMetadata: {
      sourceZone: 'discard',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['VS Seeker PHF 109', 'Tulip PAR 181'],
      ownPublic
    },
    receipt
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['raihan']
  });
});

test('unknown card-combination source abstains instead of selecting a plausible-looking card', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource(null, 'Unknown search effect'),
    choices: [
      { token: 'v', kind: 'card', printing: 'Shadow Rider Calyrex V CRE 74',
        label: 'Shadow Rider Calyrex V', publicMetadata: { sourceZone: 'deck' } }
    ],
    publicMetadata: {
      sourceZone: 'deck',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain',
    reasonCode: 'UNSUPPORTED_CARD_COMBINATION_SOURCE'
  });
});

test('unknown confirmation source abstains rather than selecting Yes', () => {
  const request = promptRequest({
    promptType: 'ConfirmPrompt',
    source: actorChoiceSource(null, 'Unknown confirmation'),
    choices: [
      { token: 'yes', kind: 'confirm', label: 'Yes' },
      { token: 'no', kind: 'confirm', label: 'No' }
    ],
    publicMetadata: { selectionType: 'confirm' }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain',
    reasonCode: 'UNSUPPORTED_CONFIRMATION_SOURCE'
  });
});

test('known Star Alchemy confirmation selects Yes', () => {
  const request = promptRequest({
    promptType: 'ConfirmPrompt',
    source: actorChoiceSource('Forest Seal Stone SIT 156', 'Star Alchemy'),
    choices: [
      { token: 'yes', kind: 'confirm', label: 'Yes' },
      { token: 'no', kind: 'confirm', label: 'No' }
    ],
    publicMetadata: { selectionType: 'confirm' }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice',
    token: 'yes'
  });
});

test('Copycat attack choice prefers Max Geist over Eon Blade and excludes Night Watch', () => {
  const request = promptRequest({
    promptType: 'ChooseAttackPrompt',
    source: {
      classification: 'actor-choice',
      sourceKind: 'card-effect',
      sourcePrinting: 'Mimikyu GRI 58',
      effectName: 'Copycat',
      copiedSourcePrinting: 'Shadow Rider Calyrex VMAX CRE 75',
      copiedAttackName: 'Max Geist'
    },
    choices: [
      { token: 'eon', kind: 'attack', label: 'Eon Blade',
        publicMetadata: { sourceAttack: 'Eon Blade' } },
      { token: 'max', kind: 'attack', label: 'Max Geist',
        publicMetadata: { sourceAttack: 'Max Geist' } }
    ],
    publicMetadata: { selectionType: 'attack', allowCancel: false }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice',
    token: 'max'
  });
});

test('non-Copycat attack-choice source abstains', () => {
  const request = promptRequest({
    promptType: 'ChooseAttackPrompt',
    source: actorChoiceSource('Tapu Lele-GX GRI 60', 'Choose an attack'),
    choices: [
      { token: 'energy-drive', kind: 'attack', label: 'Energy Drive',
        publicMetadata: { sourceAttack: 'Energy Drive' } }
    ],
    publicMetadata: { selectionType: 'attack', allowCancel: false }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain',
    reasonCode: 'UNSUPPORTED_ATTACK_CHOICE_SOURCE'
  });
});


test('Mysterious Treasure discards a low-value card token, never a cancel or empty token', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Mysterious Treasure FLI 113', 'Mysterious Treasure'),
    choices: [
      { token: 'energy', kind: 'card', printing: 'Psychic Energy MEE 13',
        label: 'Psychic Energy', publicMetadata: { sourceZone: 'hand' } },
      { token: 'stamp', kind: 'card', printing: 'Unfair Stamp TWM 165',
        label: 'Unfair Stamp', publicMetadata: { sourceZone: 'hand' } },
      { token: 'carmine', kind: 'card', printing: 'Carmine TWM 145',
        label: 'Carmine', publicMetadata: { sourceZone: 'hand' } },
      { token: 'cancel', kind: 'cancel', label: 'Cancel' }
    ],
    publicMetadata: {
      sourceZone: 'hand',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: true,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: [
        'Mysterious Treasure FLI 113',
        'Psychic Energy MEE 13',
        'Unfair Stamp TWM 165',
        'Carmine TWM 145'
      ]
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['energy']
  });
});

test('Mysterious Treasure protects the fixed-list singleton Pokémon and Trainer cards', () => {
  const protectedCards = [
    'Trevenant & Dusknoir-GX SMP 217',
    'Latias ex SSP 76',
    'Dialga-GX UPR 100',
    'Girafarig LOT 94',
    'Mimikyu GRI 58',
    'Marshadow UNB 81',
    'Radiant Eternatus CRZ 105',
    'Carmine TWM 145',
    'Iono PAL 185',
    'Teammates PRC 160',
    'Raihan CRZ 140',
    'Acerola BUS 112',
    'Guzma BUS 115',
    'Tulip PAR 181',
    'Quick Ball FST 237',
    'Hisuian Heavy Ball ASR 146',
    'Battle Compressor PHF 92',
    'Field Blower GRI 125',
    'Night Stretcher SFA 61',
    'Unfair Stamp TWM 165',
    'Float Stone BKT 137',
    'Forest Seal Stone SIT 156',
    'Dimension Valley PHF 93'
  ];
  const choices = [
    { token: 'psychic-0', kind: 'card', printing: 'Psychic Energy MEE 13',
      label: 'Psychic Energy', publicMetadata: { sourceZone: 'hand' } },
    { token: 'psychic-1', kind: 'card', printing: 'Psychic Energy MEE 13',
      label: 'Psychic Energy', publicMetadata: { sourceZone: 'hand' } },
    ...protectedCards.map((printing, index) => ({
      token: 'protected-' + index,
      kind: 'card',
      printing,
      label: printing,
      publicMetadata: { sourceZone: 'hand' }
    }))
  ];
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Mysterious Treasure FLI 113', 'Mysterious Treasure'),
    choices,
    publicMetadata: {
      sourceZone: 'hand', minimumCount: 1, maximumCount: 1,
      allowCancel: false, isSecret: false, selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['Mysterious Treasure FLI 113', 'Psychic Energy MEE 13',
        'Psychic Energy MEE 13', ...protectedCards]
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['psychic-0']
  });
});

test('Mysterious Treasure search chooses a missing Shadow Rider V from the deck', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Mysterious Treasure FLI 113', 'Mysterious Treasure'),
    choices: [
      { token: 'vmax', kind: 'card', printing: 'Shadow Rider Calyrex VMAX CRE 75',
        label: 'Shadow Rider Calyrex VMAX', publicMetadata: { sourceZone: 'deck' } },
      { token: 'v', kind: 'card', printing: 'Shadow Rider Calyrex V CRE 74',
        label: 'Shadow Rider Calyrex V', publicMetadata: { sourceZone: 'deck' } }
    ],
    publicMetadata: {
      sourceZone: 'deck',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['Mysterious Treasure FLI 113'],
      ownPublic: player({
        active: pokemon('Girafarig LOT 94', { hp: 90 }),
        bench: [pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 })]
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['v']
  });
});

test('Guzma abstains rather than returning fewer targets than a multi-target prompt requires', () => {
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Guzma BUS 115', 'Guzma'),
    choices: [
      { token: 'bench-a', kind: 'pokemon', printing: 'Shadow Rider Calyrex V CRE 74',
        label: 'Shadow Rider Calyrex V', publicMetadata: {
          selectionIndex: 0, selectedCount: 1, selectionType: 'pokemon',
          ownerSeat: 'opponent', targetZone: 'bench', isOwnerVisible: true
        } },
      { token: 'bench-b', kind: 'pokemon', printing: 'Dialga-GX UPR 100',
        label: 'Dialga-GX', publicMetadata: {
          selectionIndex: 1, selectedCount: 1, selectionType: 'pokemon',
          ownerSeat: 'opponent', targetZone: 'bench', isOwnerVisible: true
        } }
    ],
    publicMetadata: {
      minimumCount: 2,
      maximumCount: 2,
      allowCancel: false,
      isSecret: false,
      selectionType: 'pokemon'
    },
    observation: {
      ownPublic: player({ active: pokemon('Girafarig LOT 94', { hp: 90 }) }),
      opponentPublic: player({
        active: pokemon('Mimikyu GRI 58', { hp: 70 }),
        bench: [
          pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 }),
          pokemon('Dialga-GX UPR 100', { hp: 180 })
        ]
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain',
    reasonCode: 'UNCLASSIFIED_POKEMON_PROMPT'
  });
});


test('Raihan attaches to Latias when it is one Psychic Energy short of Eon Blade', () => {
  const latias = pokemon('Latias ex SSP 76', {
    hp: 210,
    energies: ['Psychic Energy MEE 13']
  });
  const rider = pokemon('Shadow Rider Calyrex VMAX CRE 75', { hp: 320, stage: 'VMAX' });
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Raihan EVS 152', 'Raihan'),
    choices: [
      { token: 'active', kind: 'pokemon', printing: 'Girafarig LOT 94',
        label: 'Girafarig', publicMetadata: { selectionIndex: 0, selectedCount: 1,
          selectionType: 'pokemon', ownerSeat: 'actor', targetZone: 'active',
          isOwnerVisible: true } },
      { token: 'latias', kind: 'pokemon', printing: latias.printing,
        label: 'Latias ex', publicMetadata: { selectionIndex: 1, selectedCount: 1,
          selectionType: 'pokemon', ownerSeat: 'actor', targetZone: 'bench',
          isOwnerVisible: true } },
      { token: 'rider', kind: 'pokemon', printing: rider.printing,
        label: 'Shadow Rider Calyrex VMAX', publicMetadata: { selectionIndex: 2,
          selectedCount: 1, selectionType: 'pokemon', ownerSeat: 'actor',
          targetZone: 'bench', isOwnerVisible: true } }
    ],
    publicMetadata: {
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'pokemon'
    },
    observation: {
      ownPublic: player({
        active: pokemon('Girafarig LOT 94', { hp: 90 }),
        bench: [latias, rider]
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['latias']
  });
});

test('Field Blower removes the opponent stadium and tool, not the owner stadium', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Field Blower GRI 125', 'Field Blower'),
    choices: [
      { token: 'path', kind: 'card', printing: 'Path to the Peak CRE 148',
        label: 'Path to the Peak', publicMetadata: {
          sourceZone: 'play', targetZone: 'stadium', ownerSeat: 'opponent',
          isOwnerVisible: true
        } },
      { token: 'tool', kind: 'card', printing: 'Float Stone BKT 137',
        label: 'Float Stone', publicMetadata: {
          sourceZone: 'play', targetZone: 'tool', ownerSeat: 'opponent',
          isOwnerVisible: true
        } },
      { token: 'own-stadium', kind: 'card', printing: 'Dimension Valley PHF 93',
        label: 'Dimension Valley', publicMetadata: {
          sourceZone: 'play', targetZone: 'stadium', ownerSeat: 'actor',
          isOwnerVisible: true
        } },
      { token: 'empty', kind: 'empty-selection', label: 'Select none' }
    ],
    publicMetadata: {
      sourceZone: 'play',
      minimumCount: 0,
      maximumCount: 2,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['path', 'tool']
  });
});

test('Get Lost removes the opponent recovery cards before Basic Psychic Energy', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Girafarig LOT 94', 'Get Lost'),
    choices: [
      { token: 'energy', kind: 'card', printing: 'Psychic Energy MEE 13',
        label: 'Psychic Energy', publicMetadata: {
          sourceZone: 'discard', ownerSeat: 'opponent', isOwnerVisible: true
        } },
      { token: 'seeker', kind: 'card', printing: 'VS Seeker PHF 109',
        label: 'VS Seeker', publicMetadata: {
          sourceZone: 'discard', ownerSeat: 'opponent', isOwnerVisible: true
        } },
      { token: 'charge', kind: 'card', printing: 'Special Charge STS 105',
        label: 'Special Charge', publicMetadata: {
          sourceZone: 'discard', ownerSeat: 'opponent', isOwnerVisible: true
        } },
      { token: 'empty', kind: 'empty-selection', label: 'Select none' }
    ],
    publicMetadata: {
      sourceZone: 'discard',
      minimumCount: 0,
      maximumCount: 2,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      opponentPublic: player({
        discard: ['Psychic Energy MEE 13', 'VS Seeker PHF 109', 'Special Charge STS 105']
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['seeker', 'charge']
  });
});


test('Wonder Tag searches Tulip for the visible recoverable Psychic package', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Tapu Lele-GX GRI 60', 'Wonder Tag'),
    choices: [
      { token: 'carmine', kind: 'card', printing: 'Carmine TWM 145',
        label: 'Carmine', publicMetadata: { sourceZone: 'deck' } },
      { token: 'tulip', kind: 'card', printing: 'Tulip PAR 181',
        label: 'Tulip', publicMetadata: { sourceZone: 'deck' } },
      { token: 'raihan', kind: 'card', printing: 'Raihan EVS 152',
        label: 'Raihan', publicMetadata: { sourceZone: 'deck' } }
    ],
    publicMetadata: {
      sourceZone: 'deck',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['Tapu Lele-GX GRI 60'],
      ownPublic: player({
        discard: ['Psychic Energy MEE 13', 'Psychic Energy MEE 13', 'Psychic Energy MEE 13']
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['tulip']
  });
});

test('Star Alchemy searches Field Blower to remove the opponent Path to the Peak', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Forest Seal Stone SIT 156', 'Star Alchemy'),
    choices: [
      { token: 'field-blower', kind: 'card', printing: 'Field Blower GRI 125',
        label: 'Field Blower', publicMetadata: { sourceZone: 'deck' } },
      { token: 'stamp', kind: 'card', printing: 'Unfair Stamp TWM 165',
        label: 'Unfair Stamp', publicMetadata: { sourceZone: 'deck' } },
      { token: 'vmax', kind: 'card', printing: 'Shadow Rider Calyrex VMAX CRE 75',
        label: 'Shadow Rider Calyrex VMAX', publicMetadata: { sourceZone: 'deck' } }
    ],
    publicMetadata: {
      sourceZone: 'deck',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['Forest Seal Stone SIT 156'],
      ownPublic: player({ discard: ['Psychic Energy MEE 13'] }),
      opponentPublic: player({
        stadium: ['Path to the Peak CRE 148'],
        handCount: 2
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['field-blower']
  });
});

test('Star Alchemy does not prioritize a second Tulip already held in hand', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Forest Seal Stone SIT 156', 'Star Alchemy'),
    choices: [
      { token: 'tulip', kind: 'card', printing: 'Tulip PAR 181',
        label: 'Tulip', publicMetadata: { sourceZone: 'deck' } },
      { token: 'vmax', kind: 'card', printing: 'Shadow Rider Calyrex VMAX CRE 75',
        label: 'Shadow Rider Calyrex VMAX', publicMetadata: { sourceZone: 'deck' } }
    ],
    publicMetadata: {
      sourceZone: 'deck',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['Forest Seal Stone SIT 156', 'Tulip PAR 181'],
      ownPublic: player({
        discard: ['Psychic Energy MEE 13', 'Psychic Energy MEE 13'],
        bench: [pokemon('Shadow Rider Calyrex VMAX CRE 75', { hp: 320, stage: 'VMAX' })]
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['vmax']
  });
});

test('Mysterious Treasure searches Mimikyu when the opponent Active exposes a non-GX attack to Copycat', () => {
  const opponentActive = pokemon('Shadow Rider Calyrex VMAX CRE 75', {
    hp: 320,
    stage: 'VMAX',
    attacks: [{
      name: 'Max Geist',
      cost: ['Psychic'],
      damage: '10+30',
      damageCalculation: '10+30 per Psychic Energy attached to your Pokémon',
      text: '10+30 damage.',
      gxAttack: false,
      barrage: false
    }]
  });
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Mysterious Treasure FLI 113', 'Mysterious Treasure'),
    choices: [
      { token: 'vmax', kind: 'card', printing: 'Shadow Rider Calyrex VMAX CRE 75',
        label: 'Shadow Rider Calyrex VMAX', publicMetadata: { sourceZone: 'deck' } },
      { token: 'mimikyu', kind: 'card', printing: 'Mimikyu GRI 58',
        label: 'Mimikyu', publicMetadata: { sourceZone: 'deck' } }
    ],
    publicMetadata: {
      sourceZone: 'deck',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['Mysterious Treasure FLI 113'],
      ownPublic: player({
        active: pokemon('Girafarig LOT 94', { hp: 90 }),
        bench: [
          pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 }),
          pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 })
        ]
      }),
      opponentPublic: player({ active: opponentActive })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['mimikyu']
  });
});


test('Marshadow is played to trigger Resetting Hole against Path to the Peak', () => {
  const request = rootRequest({
    ownHand: ['Marshadow UNB 81'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94', { hp: 90 }) }),
    opponentPublic: player({ stadium: ['Path to the Peak CRE 148'] }),
    items: [
      { token: 'marshadow', kind: 'play-card', actorPrinting: 'Marshadow UNB 81',
        publicMetadata: { cardType: 'pokemon', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'marshadow'
  });
});

test('Resetting Hole ability is prioritized only while a disabling stadium is active', () => {
  const request = rootRequest({
    ownPublic: player({
      active: pokemon('Girafarig LOT 94', { hp: 90 }),
      bench: [pokemon('Marshadow UNB 81', { hp: 70 })]
    }),
    opponentPublic: player({ stadium: ['Path to the Peak CRE 148'] }),
    items: [
      { token: 'resetting-hole', kind: 'use-ability',
        publicMetadata: { abilityName: 'Resetting Hole', sourceZone: 'bench',
          sourceSeat: 'actor', sourceIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'resetting-hole'
  });
});

test('Mysterious Treasure searches Marshadow to remove Path to the Peak when the board lacks it', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Mysterious Treasure FLI 113', 'Mysterious Treasure'),
    choices: [
      { token: 'vmax', kind: 'card', printing: 'Shadow Rider Calyrex VMAX CRE 75',
        label: 'Shadow Rider Calyrex VMAX', publicMetadata: { sourceZone: 'deck' } },
      { token: 'marshadow', kind: 'card', printing: 'Marshadow UNB 81',
        label: 'Marshadow', publicMetadata: { sourceZone: 'deck' } }
    ],
    publicMetadata: {
      sourceZone: 'deck',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['Mysterious Treasure FLI 113'],
      ownPublic: player({
        active: pokemon('Girafarig LOT 94', { hp: 90 }),
        bench: [
          pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 }),
          pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 })
        ]
      }),
      opponentPublic: player({ stadium: ['Path to the Peak CRE 148'] })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['marshadow']
  });
});


test('Mimikyu is played when the opponent Active exposes a non-GX Copycat target', () => {
  const opponentActive = pokemon('Shadow Rider Calyrex VMAX CRE 75', {
    hp: 320,
    stage: 'VMAX',
    attacks: [{
      name: 'Max Geist',
      cost: ['Psychic'],
      damage: '10+30',
      damageCalculation: '10+30 per Psychic Energy attached to your Pokémon',
      text: '10+30 damage.',
      gxAttack: false,
      barrage: false
    }]
  });
  const request = rootRequest({
    ownHand: ['Mimikyu GRI 58'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94', { hp: 90 }) }),
    opponentPublic: player({ active: opponentActive }),
    items: [
      { token: 'mimikyu', kind: 'play-card', actorPrinting: 'Mimikyu GRI 58',
        publicMetadata: { cardType: 'pokemon', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'mimikyu'
  });
});

test('Mimikyu Copycat attack is selected when a legal non-GX target is visible', () => {
  const opponentActive = pokemon('Shadow Rider Calyrex VMAX CRE 75', {
    hp: 320,
    stage: 'VMAX',
    attacks: [{
      name: 'Max Geist',
      cost: ['Psychic'],
      damage: '10+30',
      damageCalculation: '10+30 per Psychic Energy attached to your Pokémon',
      text: '10+30 damage.',
      gxAttack: false,
      barrage: false
    }]
  });
  const request = rootRequest({
    ownPublic: player({ active: pokemon('Mimikyu GRI 58', { hp: 70 }) }),
    opponentPublic: player({ active: opponentActive }),
    items: [
      { token: 'copycat', kind: 'attack', attackName: 'Copycat' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'copycat'
  });
});

test('Mimikyu is not played for Copycat when the opponent Active has no known non-GX attack', () => {
  const opponentActive = pokemon('Shadow Rider Calyrex VMAX CRE 75', {
    hp: 320,
    stage: 'VMAX',
    attacks: [{
      name: 'Night Watch',
      cost: ['Psychic', 'Psychic', 'Colorless'],
      damage: '150',
      damageCalculation: '150',
      text: '150 damage.',
      gxAttack: false,
      barrage: false
    }]
  });
  const request = rootRequest({
    ownHand: ['Mimikyu GRI 58'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94', { hp: 90 }) }),
    opponentPublic: player({ active: opponentActive }),
    items: [
      { token: 'mimikyu', kind: 'play-card', actorPrinting: 'Mimikyu GRI 58',
        publicMetadata: { cardType: 'pokemon', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'pass' });
});


test('Mysterious Treasure completes the second Shadow Rider V before optional Copycat setup', () => {
  const opponentActive = pokemon('Shadow Rider Calyrex VMAX CRE 75', {
    hp: 320,
    stage: 'VMAX',
    attacks: [{
      name: 'Max Geist',
      cost: ['Psychic'],
      damage: '10+30',
      damageCalculation: '10+30 per Psychic Energy attached to your Pokémon',
      text: '10+30 damage.',
      gxAttack: false,
      barrage: false
    }]
  });
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Mysterious Treasure FLI 113', 'Mysterious Treasure'),
    choices: [
      { token: 'mimikyu', kind: 'card', printing: 'Mimikyu GRI 58',
        label: 'Mimikyu', publicMetadata: { sourceZone: 'deck' } },
      { token: 'v', kind: 'card', printing: 'Shadow Rider Calyrex V CRE 74',
        label: 'Shadow Rider Calyrex V', publicMetadata: { sourceZone: 'deck' } }
    ],
    publicMetadata: {
      sourceZone: 'deck',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['Mysterious Treasure FLI 113'],
      ownPublic: player({
        active: pokemon('Girafarig LOT 94', { hp: 90 }),
        bench: [pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 })]
      }),
      opponentPublic: player({ active: opponentActive })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['v']
  });
});


test('Tapu Lele-GX is played to access a Supporter when none is held', () => {
  const request = rootRequest({
    ownHand: ['Tapu Lele-GX GRI 60'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94', { hp: 90 }) }),
    items: [
      { token: 'lele', kind: 'play-card', actorPrinting: 'Tapu Lele-GX GRI 60',
        publicMetadata: { cardType: 'pokemon', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'lele'
  });
});

test('N in hand counts as a Supporter and prevents Tapu Lele-GX from being played', () => {
  const request = rootRequest({
    ownHand: ['Tapu Lele-GX GRI 60', 'N FCO 105'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94', { hp: 90 }) }),
    items: [
      { token: 'pass', kind: 'pass' },
      { token: 'lele', kind: 'play-card', actorPrinting: 'Tapu Lele-GX GRI 60',
        publicMetadata: { cardType: 'pokemon', handIndex: 0 } }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'pass'
  });
});

test('Mysterious Treasure searches Tapu Lele-GX when setup is complete and no Supporter is held', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Mysterious Treasure FLI 113', 'Mysterious Treasure'),
    choices: [
      { token: 'clefairy', kind: 'card', printing: "Lillie's Clefairy ex JTG 56",
        label: "Lillie's Clefairy ex", publicMetadata: { sourceZone: 'deck' } },
      { token: 'lele', kind: 'card', printing: 'Tapu Lele-GX GRI 60',
        label: 'Tapu Lele-GX', publicMetadata: { sourceZone: 'deck' } }
    ],
    publicMetadata: {
      sourceZone: 'deck',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['Mysterious Treasure FLI 113'],
      ownPublic: player({
        active: pokemon('Girafarig LOT 94', { hp: 90 }),
        bench: [
          pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 }),
          pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 }),
          pokemon('Shadow Rider Calyrex VMAX CRE 75', { hp: 320, stage: 'VMAX' }),
          pokemon('Shadow Rider Calyrex VMAX CRE 75', { hp: 320, stage: 'VMAX' })
        ]
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['lele']
  });
});


test('Climactic Gate is not a root ability action; Radiant Eternatus starts the line', () => {
  const request = rootRequest({
    ownHand: ['Psychic Energy MEE 13'],
    ownPublic: player({
      active: pokemon('Girafarig LOT 94', { hp: 90 }),
      bench: [pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 })]
    }),
    items: [
      { token: 'gate', kind: 'use-ability',
        publicMetadata: { abilityName: 'Climactic Gate', sourceZone: 'bench',
          sourceSeat: 'actor', sourceIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'pass'
  });
});

test('Climactic Gate selects two VMAX Pokémon and excludes Basic Pokémon choices', () => {
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Radiant Eternatus CRZ 105', 'Climactic Gate'),
    choices: [
      { token: 'vmax-a', kind: 'pokemon', printing: 'Shadow Rider Calyrex VMAX CRE 75',
        label: 'Shadow Rider Calyrex VMAX', publicMetadata: {
          selectionIndex: 0, selectedCount: 2, selectionType: 'pokemon',
          ownerSeat: 'actor', targetZone: 'deck', isOwnerVisible: true
        } },
      { token: 'basic-v', kind: 'pokemon', printing: 'Shadow Rider Calyrex V CRE 74',
        label: 'Shadow Rider Calyrex V', publicMetadata: {
          selectionIndex: 1, selectedCount: 2, selectionType: 'pokemon',
          ownerSeat: 'actor', targetZone: 'deck', isOwnerVisible: true
        } },
      { token: 'empty', kind: 'empty-selection', label: 'Select none' },
      { token: 'vmax-b', kind: 'pokemon', printing: 'Shadow Rider Calyrex VMAX CRE 75',
        label: 'Shadow Rider Calyrex VMAX', publicMetadata: {
          selectionIndex: 2, selectedCount: 2, selectionType: 'pokemon',
          ownerSeat: 'actor', targetZone: 'deck', isOwnerVisible: true
        } }
    ],
    publicMetadata: {
      minimumCount: 0,
      maximumCount: 2,
      allowCancel: false,
      isSecret: false,
      selectionType: 'pokemon'
    },
    observation: { ownPublic: player({
      bench: [pokemon('Radiant Eternatus CRZ 105')],
      deckCount: 30, prizeCount: 6
    }) }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['vmax-a', 'vmax-b']
  });
});


test('Fairy Zone doubles Max Geist damage against Dragon and changes attack choice', () => {
  const clefairy = pokemon("Lillie's Clefairy ex JTG 56", {
    hp: 190,
    abilities: ['Fairy Zone'],
    abilitySuppressions: [{
      abilityName: 'Fairy Zone',
      suppressed: false,
      reasonCode: null,
      sourcePrinting: null
    }]
  });
  const opponentDragon = pokemon('Regidrago VSTAR SIT 136', {
    hp: 240,
    stage: 'VSTAR',
    types: ['Dragon']
  });
  const request = rootRequest({
    ownPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 75', {
        hp: 320,
        stage: 'VMAX',
        energies: [
          'Psychic Energy MEE 13',
          'Psychic Energy MEE 13',
          'Psychic Energy MEE 13',
          'Psychic Energy MEE 13'
        ]
      }),
      bench: [clefairy]
    }),
    opponentPublic: player({ active: opponentDragon, handCount: 4 }),
    items: [
      { token: 'max-geist', kind: 'attack', attackName: 'Max Geist' },
      { token: 'night-watch', kind: 'attack', attackName: 'Night Watch' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'max-geist'
  });
});

test('Fairy Zone is not applied when publicly suppressed by Path to the Peak', () => {
  const clefairy = pokemon("Lillie's Clefairy ex JTG 56", {
    hp: 190,
    abilities: ['Fairy Zone'],
    abilitySuppressions: [{
      abilityName: 'Fairy Zone',
      suppressed: true,
      reasonCode: 'PATH_TO_THE_PEAK',
      sourcePrinting: 'Path to the Peak CRE 148'
    }]
  });
  const opponentDragon = pokemon('Regidrago VSTAR SIT 136', {
    hp: 240,
    stage: 'VSTAR',
    types: ['Dragon']
  });
  const request = rootRequest({
    ownPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 75', {
        hp: 320,
        stage: 'VMAX',
        energies: [
          'Psychic Energy MEE 13',
          'Psychic Energy MEE 13',
          'Psychic Energy MEE 13',
          'Psychic Energy MEE 13'
        ]
      }),
      bench: [clefairy],
      stadium: ['Path to the Peak CRE 148']
    }),
    opponentPublic: player({ active: opponentDragon, handCount: 5 }),
    items: [
      { token: 'max-geist', kind: 'attack', attackName: 'Max Geist' },
      { token: 'night-watch', kind: 'attack', attackName: 'Night Watch' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'night-watch'
  });
});

test('retreat pivots into Shadow Rider VMAX when active Fairy Zone makes Max Geist lethal', () => {
  const clefairy = pokemon("Lillie's Clefairy ex JTG 56", {
    hp: 190,
    abilities: ['Fairy Zone'],
    abilitySuppressions: [{
      abilityName: 'Fairy Zone',
      suppressed: false,
      reasonCode: null,
      sourcePrinting: null
    }]
  });
  const rider = pokemon('Shadow Rider Calyrex VMAX CRE 75', {
    hp: 320,
    stage: 'VMAX',
    energies: [
      'Psychic Energy MEE 13',
      'Psychic Energy MEE 13',
      'Psychic Energy MEE 13',
      'Psychic Energy MEE 13'
    ]
  });
  const opponentDragon = pokemon('Regidrago VSTAR SIT 136', {
    hp: 240,
    stage: 'VSTAR',
    types: ['Dragon']
  });
  const request = rootRequest({
    ownPublic: player({
      active: pokemon('Girafarig LOT 94', { hp: 90 }),
      bench: [rider, pokemon('Latias ex SSP 76', { hp: 210 }), clefairy]
    }),
    opponentPublic: player({ active: opponentDragon }),
    items: [
      { token: 'retreat-rider', kind: 'retreat',
        publicMetadata: { benchIndex: 0, targetZone: 'bench', isOwnerVisible: true } },
      { token: 'retreat-latias', kind: 'retreat',
        publicMetadata: { benchIndex: 1, targetZone: 'bench', isOwnerVisible: true } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'retreat-rider'
  });
});

test('Mysterious Treasure searches Lillie’s Clefairy ex against an opposing Dragon Active', () => {
  const opponentDragon = pokemon('Regidrago VSTAR SIT 136', {
    hp: 240,
    stage: 'VSTAR',
    types: ['Dragon']
  });
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Mysterious Treasure FLI 113', 'Mysterious Treasure'),
    choices: [
      { token: 'clefairy', kind: 'card', printing: "Lillie's Clefairy ex JTG 56",
        label: "Lillie's Clefairy ex", publicMetadata: { sourceZone: 'deck' } },
      { token: 'dialga', kind: 'card', printing: 'Dialga-GX UPR 100',
        label: 'Dialga-GX', publicMetadata: { sourceZone: 'deck' } }
    ],
    publicMetadata: {
      sourceZone: 'deck',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['Mysterious Treasure FLI 113'],
      ownPublic: player({
        active: pokemon('Girafarig LOT 94', { hp: 90 }),
        bench: [
          pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 }),
          pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 }),
          pokemon('Shadow Rider Calyrex VMAX CRE 75', { hp: 320, stage: 'VMAX' }),
          pokemon('Shadow Rider Calyrex VMAX CRE 75', { hp: 320, stage: 'VMAX' })
        ]
      }),
      opponentPublic: player({ active: opponentDragon })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['clefairy']
  });
});

test('Lillie’s Clefairy ex is played to activate Fairy Zone against a Dragon Active', () => {
  const opponentDragon = pokemon('Regidrago VSTAR SIT 136', {
    hp: 240,
    stage: 'VSTAR',
    types: ['Dragon']
  });
  const request = rootRequest({
    ownHand: ["Lillie's Clefairy ex JTG 56"],
    ownPublic: player({ active: pokemon('Girafarig LOT 94', { hp: 90 }) }),
    opponentPublic: player({ active: opponentDragon }),
    items: [
      { token: 'clefairy', kind: 'play-card',
        actorPrinting: "Lillie's Clefairy ex JTG 56",
        publicMetadata: { cardType: 'pokemon', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'clefairy'
  });
});


test('Path to the Peak is not treated as active when the stadium suppression epoch is unknown', () => {
  const request = rootRequest({
    ownHand: ['Marshadow UNB 81'],
    ownPublic: player({
      active: pokemon('Girafarig LOT 94', { hp: 90 }),
      stadium: ['Path to the Peak CRE 148'],
      omitStadiumSuppression: true
    }),
    opponentPublic: player(),
    items: [
      { token: 'marshadow', kind: 'play-card', actorPrinting: 'Marshadow UNB 81',
        publicMetadata: { cardType: 'pokemon', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'pass'
  });
});

test('Path to the Peak is not treated as active while stadium effects are suppressed', () => {
  const request = rootRequest({
    ownPublic: player({
      active: pokemon('Girafarig LOT 94', { hp: 90 }),
      bench: [pokemon('Marshadow UNB 81', { hp: 70 })],
      stadium: ['Path to the Peak CRE 148'],
      stadiumAndToolHaveNoEffectTurnsRemaining: 1
    }),
    opponentPublic: player(),
    items: [
      { token: 'resetting-hole', kind: 'use-ability',
        publicMetadata: { abilityName: 'Resetting Hole', sourceZone: 'bench',
          sourceSeat: 'actor', sourceIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'pass'
  });
});

test('Lillie’s Clefairy ex is not played when Path to the Peak status is unknown', () => {
  const opponentDragon = pokemon('Regidrago VSTAR SIT 136', {
    hp: 240,
    stage: 'VSTAR',
    types: ['Dragon']
  });
  const request = rootRequest({
    ownHand: ["Lillie's Clefairy ex JTG 56"],
    ownPublic: player({
      active: pokemon('Girafarig LOT 94', { hp: 90 }),
      stadium: ['Path to the Peak CRE 148'],
      omitStadiumSuppression: true
    }),
    opponentPublic: player({ active: opponentDragon }),
    items: [
      { token: 'clefairy', kind: 'play-card',
        actorPrinting: "Lillie's Clefairy ex JTG 56",
        publicMetadata: { cardType: 'pokemon', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'pass'
  });
});


test('Fairy Zone remains inactive when suppression status is unknown', () => {
  const clefairy = pokemon("Lillie's Clefairy ex JTG 56", {
    hp: 190,
    abilities: ['Fairy Zone']
  });
  const opponentDragon = pokemon('Regidrago VSTAR SIT 136', {
    hp: 240,
    stage: 'VSTAR',
    types: ['Dragon']
  });
  const request = rootRequest({
    ownPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 75', {
        hp: 320,
        stage: 'VMAX',
        energies: [
          'Psychic Energy MEE 13',
          'Psychic Energy MEE 13',
          'Psychic Energy MEE 13',
          'Psychic Energy MEE 13'
        ]
      }),
      bench: [clefairy]
    }),
    opponentPublic: player({ active: opponentDragon, handCount: 5 }),
    items: [
      { token: 'max-geist', kind: 'attack', attackName: 'Max Geist' },
      { token: 'night-watch', kind: 'attack', attackName: 'Night Watch' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'night-watch'
  });
});

test('Field Blower is not prioritized when a visible stadium has unknown effect status', () => {
  const request = rootRequest({
    ownHand: ['Field Blower GRI 125'],
    ownPublic: player({
      active: pokemon('Girafarig LOT 94', { hp: 90 }),
      bench: [pokemon('Shadow Rider Calyrex VMAX CRE 75', {
        hp: 320,
        stage: 'VMAX',
        abilities: ['Underworld Door']
      })],
      stadium: ['Path to the Peak CRE 148'],
      omitStadiumSuppression: true
    }),
    opponentPublic: player(),
    items: [
      { token: 'field-blower', kind: 'play-card', actorPrinting: 'Field Blower GRI 125',
        publicMetadata: { cardType: 'item', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'pass'
  });
});


test('rank1 decideWithAudit preserves root choices and reports same-pass action scores', () => {
  const request = rootRequest({
    items: [
      { token: 'pass', kind: 'pass' },
      { token: 'stadium', kind: 'use-stadium' }
    ]
  });
  const plain = policy.decide(request);
  const audited = policy.decideWithAudit(request);
  assert.deepEqual(audited.decision, plain);
  assert.deepEqual(plain, { kind: 'select-action', token: 'stadium' });
  assert.equal(audited.policyAudit.schema, 'agent6-policy-audit-v1');
  assert.equal(audited.policyAudit.selectionRuleCode, 'ROOT_MAX_ACTION_SCORE');
  assert.equal(audited.policyAudit.tieBreakCode, 'STRICT_GREATER_THAN_FIRST_NATIVE_FRONTIER_ORDER');
  assert.deepEqual(audited.policyAudit.selectedTokens, ['stadium']);
  assert.deepEqual(audited.policyAudit.evaluations.map(row => row.token), ['pass', 'stadium']);
  assert.equal(audited.policyAudit.evaluations[0].status, 'scored');
  assert.equal(audited.policyAudit.evaluations[0].score, 0);
  assert.equal(audited.policyAudit.evaluations[1].status, 'scored');
  assert.equal(audited.policyAudit.evaluations[1].score, 45);
  protocol.validatePolicyAudit(audited.policyAudit, request, plain, POLICY_VERSION);
});

test('rank1 deterministic energy-payment prompt is marked rule-selected without a fabricated score', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Energy Search FLI', 'Energy Payment'),
    choices: [
      { token: 'energy-0', kind: 'energy', printing: 'Psychic Energy SVE', label: 'Psychic Energy' },
      { token: 'energy-1', kind: 'energy', printing: 'Psychic Energy SVE', label: 'Psychic Energy' }
    ],
    publicMetadata: {
      selectionType: 'energy-payment',
      minimumCount: 1,
      maximumCount: 1,
      energyCount: 1,
      energyType: 'Psychic'
    }
  });
  const plain = policy.decide(request);
  const audited = policy.decideWithAudit(request);
  assert.deepEqual(audited.decision, plain);
  assert.deepEqual(plain, { kind: 'select-choices', tokens: ['energy-0'] });
  assert.equal(audited.policyAudit.selectionRuleCode, 'ENERGY_PAYMENT_FIRST_ELIGIBLE');
  const selected = audited.policyAudit.evaluations.find(row => row.token === 'energy-0');
  assert.equal(selected.status, 'rule-selected');
  assert.equal(selected.score, null);
  assert.equal(selected.reasonCode, 'SELECTED_BY_POLICY_RULE');
  protocol.validatePolicyAudit(audited.policyAudit, request, plain, POLICY_VERSION);
});


test('Basic Shadow Rider V is played from hand into an empty Bench slot', () => {
  const request = rootRequest({
    ownHand: ['Shadow Rider Calyrex V CRE 74'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94', { hp: 90 }) }),
    items: [
      { token: 'bench-v', kind: 'play-card',
        actorPrinting: 'Shadow Rider Calyrex V CRE 74',
        publicMetadata: { cardType: 'pokemon', handIndex: 0,
          targetSeat: 'actor', targetZone: 'bench', targetIndex: 0,
          isOwnerVisible: true } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'bench-v'
  });
});

test('Basic Shadow Rider V is not redundantly benched after two V are established', () => {
  const request = rootRequest({
    ownHand: ['Shadow Rider Calyrex V CRE 74'],
    ownPublic: player({
      active: pokemon('Shadow Rider Calyrex V CRE 74'),
      bench: [pokemon('Shadow Rider Calyrex V CRE 74')]
    }),
    items: [
      { token: 'bench-v', kind: 'play-card',
        actorPrinting: 'Shadow Rider Calyrex V CRE 74',
        publicMetadata: { cardType: 'pokemon', handIndex: 0,
          targetSeat: 'actor', targetZone: 'bench', targetIndex: 1,
          isOwnerVisible: true } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'pass'
  });
});

test('manual Psychic Energy attaches to the active VMAX ahead of a less-developed V', () => {
  const vmax = pokemon('Shadow Rider Calyrex VMAX CRE 75', {
    hp: 320, stage: 'VMAX',
    energies: ['Psychic Energy MEE 13', 'Psychic Energy MEE 13']
  });
  const request = rootRequest({
    ownHand: ['Psychic Energy MEE 13'],
    ownPublic: player({
      active: vmax,
      bench: [pokemon('Shadow Rider Calyrex V CRE 74')]
    }),
    items: [
      { token: 'energy-vmax', kind: 'play-card',
        actorPrinting: 'Psychic Energy MEE 13',
        targetPrinting: 'Shadow Rider Calyrex VMAX CRE 75',
        publicMetadata: { cardType: 'energy', handIndex: 0,
          targetSeat: 'actor', targetZone: 'active', isOwnerVisible: true } },
      { token: 'energy-v', kind: 'play-card',
        actorPrinting: 'Psychic Energy MEE 13',
        targetPrinting: 'Shadow Rider Calyrex V CRE 74',
        publicMetadata: { cardType: 'energy', handIndex: 0,
          targetSeat: 'actor', targetZone: 'bench', targetIndex: 0,
          isOwnerVisible: true } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'energy-vmax'
  });
});

test('manual Psychic Energy is not attached after the turn attachment was used', () => {
  const request = rootRequest({
    ownHand: ['Psychic Energy MEE 13'],
    ownPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 75', { stage: 'VMAX' })
    }),
    ownTurnResources: { ...turnResources(), energyPlayedTurn: true },
    items: [
      { token: 'energy', kind: 'play-card',
        actorPrinting: 'Psychic Energy MEE 13',
        targetPrinting: 'Shadow Rider Calyrex VMAX CRE 75',
        publicMetadata: { cardType: 'energy', handIndex: 0,
          targetSeat: 'actor', targetZone: 'active', isOwnerVisible: true } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'pass'
  });
});

test('Latias, Girafarig and Trevenant have conditional positive Bench-play branches', () => {
  const latias = rootRequest({
    ownHand: ['Latias ex SSP 76'],
    ownPublic: player({ active: pokemon('Shadow Rider Calyrex V CRE 74') }),
    items: [
      { token: 'latias', kind: 'play-card', actorPrinting: 'Latias ex SSP 76',
        publicMetadata: { cardType: 'pokemon', handIndex: 0,
          targetSeat: 'actor', targetZone: 'bench', targetIndex: 0,
          isOwnerVisible: true } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(latias), { kind: 'select-action', token: 'latias' });

  const girafarig = rootRequest({
    ownHand: ['Girafarig LOT 94'],
    ownPublic: player({ active: pokemon('Shadow Rider Calyrex V CRE 74') }),
    opponentPublic: player({ active: pokemon('Regidrago V SIT'),
      discard: ['VS Seeker PHF 109', 'Psychic Energy SVE 5'] }),
    items: [
      { token: 'girafarig', kind: 'play-card', actorPrinting: 'Girafarig LOT 94',
        publicMetadata: { cardType: 'pokemon', handIndex: 0,
          targetSeat: 'actor', targetZone: 'bench', targetIndex: 0,
          isOwnerVisible: true } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(girafarig), {
    kind: 'select-action', token: 'girafarig'
  });

  const trevenant = rootRequest({
    ownHand: ['Trevenant & Dusknoir-GX SMP SM217'],
    ownPublic: player({ active: pokemon('Shadow Rider Calyrex V CRE 74') }),
    opponentPublic: player({ active: pokemon('Regidrago V SIT'), handCount: 5 }),
    items: [
      { token: 'trevenant', kind: 'play-card',
        actorPrinting: 'Trevenant & Dusknoir-GX SMP SM217',
        publicMetadata: { cardType: 'pokemon', handIndex: 0,
          targetSeat: 'actor', targetZone: 'bench', targetIndex: 0,
          isOwnerVisible: true } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(trevenant), {
    kind: 'select-action', token: 'trevenant'
  });
});

test('Radiant Eternatus is played only when a VMAX remains plausibly in the deck', () => {
  const radiantAction = {
    token: 'radiant',
    kind: 'play-card',
    actorPrinting: 'Radiant Eternatus CRZ 105',
    publicMetadata: { cardType: 'pokemon', handIndex: 0,
      targetSeat: 'actor', targetZone: 'bench', targetIndex: 0,
      isOwnerVisible: true }
  };
  const useful = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94'), deckCount: 30, prizeCount: 6 }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(useful), {
    kind: 'select-action', token: 'radiant'
  });

  const exhausted = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({
      active: pokemon('Girafarig LOT 94'),
      discard: [
        'Shadow Rider Calyrex VMAX CRE 75',
        'Shadow Rider Calyrex VMAX CRE 75',
        'Shadow Rider Calyrex VMAX CRE 75',
        'Shadow Rider Calyrex VMAX CRE 75'
      ],
      deckCount: 30, prizeCount: 6
    }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(exhausted), {
    kind: 'select-action', token: 'pass'
  });
});

test('Radiant Eternatus is a terminal last-use action after manual Energy and other positive actions', () => {
  const radiantAction = {
    token: 'radiant',
    kind: 'play-card',
    actorPrinting: 'Radiant Eternatus CRZ 105',
    publicMetadata: { cardType: 'pokemon', handIndex: 0,
      targetSeat: 'actor', targetZone: 'bench', targetIndex: 0,
      isOwnerVisible: true }
  };
  const energyAction = {
    token: 'energy',
    kind: 'play-card',
    actorPrinting: 'Psychic Energy MEE 13',
    targetPrinting: 'Shadow Rider Calyrex VMAX CRE 75',
    publicMetadata: { cardType: 'energy', handIndex: 1,
      targetSeat: 'actor', targetZone: 'active', isOwnerVisible: true }
  };
  const ownPublic = player({
    active: pokemon('Shadow Rider Calyrex VMAX CRE 75', {
      stage: 'VMAX', energies: ['Psychic Energy MEE 13']
    }),
    deckCount: 30, prizeCount: 6
  });
  const first = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105', 'Psychic Energy MEE 13'],
    ownPublic,
    items: [radiantAction, energyAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(first), {
    kind: 'select-action', token: 'energy'
  });

  const afterPreGate = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic,
    ownTurnResources: { ...turnResources(), energyPlayedTurn: true },
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(afterPreGate), {
    kind: 'select-action', token: 'radiant'
  });
});

test('Climactic Gate confirmation is source-bound and probability-conditioned', () => {
  const confirm = (source, observationOptions = {}) => promptRequest({
    promptType: 'ConfirmPrompt',
    source,
    choices: [
      { token: 'yes', kind: 'confirm', label: 'Yes' },
      { token: 'no', kind: 'confirm', label: 'No' }
    ],
    publicMetadata: { selectionType: 'confirm' },
    observation: { ownPublic: player({
      bench: [pokemon('Radiant Eternatus CRZ 105')],
      ...observationOptions
    }) }
  });
  const yes = confirm(actorChoiceSource('Radiant Eternatus CRZ 105', 'Climactic Gate'),
    { deckCount: 30, prizeCount: 6 });
  const auditedYes = policy.decideWithAudit(yes);
  assert.deepEqual(auditedYes.decision, { kind: 'select-choice', token: 'yes' },
    JSON.stringify(auditedYes.policyAudit));
  assert.equal(auditedYes.policyAudit.tieBreakCode, 'EXPECTED_FETCH_1.989_MIN_0_75');
  assert.deepEqual(checkedDecision(yes), { kind: 'select-choice', token: 'yes' });

  const noKnownTargets = confirm(
    actorChoiceSource('Radiant Eternatus CRZ 105', 'Climactic Gate'),
    {
      deckCount: 30, prizeCount: 6,
      discard: [
        'Shadow Rider Calyrex VMAX CRE 75',
        'Shadow Rider Calyrex VMAX CRE 75',
        'Shadow Rider Calyrex VMAX CRE 75',
        'Shadow Rider Calyrex VMAX CRE 75'
      ]
    });
  assert.deepEqual(checkedDecision(noKnownTargets), {
    kind: 'select-choice', token: 'no'
  });

  const lowProbability = confirm(
    actorChoiceSource('Radiant Eternatus CRZ 105', 'Climactic Gate'),
    {
      deckCount: 1, prizeCount: 6,
      discard: [
        'Shadow Rider Calyrex VMAX CRE 75',
        'Shadow Rider Calyrex VMAX CRE 75',
        'Shadow Rider Calyrex VMAX CRE 75'
      ]
    });
  assert.deepEqual(checkedDecision(lowProbability), {
    kind: 'select-choice', token: 'no'
  });

  const wrongSource = confirm(
    actorChoiceSource('Shadow Rider Calyrex VMAX CRE 75', 'Climactic Gate'),
    { deckCount: 30, prizeCount: 6 });
  assert.deepEqual(checkedDecision(wrongSource), {
    kind: 'abstain', reasonCode: 'UNSUPPORTED_CONFIRMATION_SOURCE'
  });
});

test('Climactic Gate accepts up to two actor-visible VMAX choices from the deck only', () => {
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Radiant Eternatus CRZ 105', 'Climactic Gate'),
    choices: [
      { token: 'vmax', kind: 'pokemon', printing: 'Shadow Rider Calyrex VMAX CRE 75',
        label: 'Shadow Rider Calyrex VMAX', publicMetadata: {
          selectionIndex: 0, selectedCount: 1, selectionType: 'pokemon',
          ownerSeat: 'actor', targetZone: 'deck', isOwnerVisible: true
        } },
      { token: 'basic', kind: 'pokemon', printing: 'Shadow Rider Calyrex V CRE 74',
        label: 'Shadow Rider Calyrex V', publicMetadata: {
          selectionIndex: 1, selectedCount: 1, selectionType: 'pokemon',
          ownerSeat: 'actor', targetZone: 'deck', isOwnerVisible: true
        } },
      { token: 'empty', kind: 'empty-selection', label: 'Select none' },
      { token: 'opponent-vmax', kind: 'pokemon', printing: 'Shadow Rider Calyrex VMAX CRE 75',
        label: 'Opponent VMAX', publicMetadata: {
          selectionIndex: 2, selectedCount: 1, selectionType: 'pokemon',
          ownerSeat: 'opponent', targetZone: 'deck', isOwnerVisible: true
        } }
    ],
    publicMetadata: {
      minimumCount: 0,
      maximumCount: 2,
      allowCancel: false,
      isSecret: false,
      selectionType: 'pokemon'
    },
    observation: { ownPublic: player({
      bench: [pokemon('Radiant Eternatus CRZ 105')],
      deckCount: 30, prizeCount: 6
    }) }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['vmax']
  });
});

test('Climactic Gate declines a source-mismatched ChoosePokemonPrompt', () => {
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Shadow Rider Calyrex VMAX CRE 75', 'Climactic Gate'),
    choices: [
      { token: 'empty', kind: 'empty-selection', label: 'Select none' },
      { token: 'vmax', kind: 'pokemon', printing: 'Shadow Rider Calyrex VMAX CRE 75',
        label: 'Shadow Rider Calyrex VMAX', publicMetadata: {
          selectionIndex: 0, selectedCount: 1, selectionType: 'pokemon',
          ownerSeat: 'actor', targetZone: 'deck', isOwnerVisible: true
        } }
    ],
    publicMetadata: {
      minimumCount: 0,
      maximumCount: 2,
      allowCancel: false,
      isSecret: false,
      selectionType: 'pokemon'
    },
    observation: { ownPublic: player({
      bench: [pokemon('Radiant Eternatus CRZ 105')],
      deckCount: 30, prizeCount: 6
    }) }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain', reasonCode: 'UNSUPPORTED_POKEMON_PROMPT'
  });
});

test('rank-1 core actions are actor-relative and work from physical seat one', () => {
  const root = rootRequest({
    seat: 1,
    ownHand: ['Shadow Rider Calyrex V CRE 74'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94') }),
    items: [
      { token: 'bench-v', kind: 'play-card',
        actorPrinting: 'Shadow Rider Calyrex V CRE 74',
        publicMetadata: { cardType: 'pokemon', handIndex: 0,
          targetSeat: 'actor', targetZone: 'bench', targetIndex: 0,
          isOwnerVisible: true } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(root, 1), {
    kind: 'select-action', token: 'bench-v'
  });

  const prompt = promptRequest({
    seat: 1,
    promptType: 'ConfirmPrompt',
    source: actorChoiceSource('Radiant Eternatus CRZ 105', 'Climactic Gate'),
    choices: [
      { token: 'yes', kind: 'confirm', label: 'Yes' },
      { token: 'no', kind: 'confirm', label: 'No' }
    ],
    publicMetadata: { selectionType: 'confirm' },
    observation: { ownPublic: player({
      bench: [pokemon('Radiant Eternatus CRZ 105')],
      deckCount: 30, prizeCount: 6
    }) }
  });
  assert.deepEqual(checkedDecision(prompt, 1), {
    kind: 'select-choice', token: 'yes'
  });
});


test('Radiant Eternatus is not played when its Bench slot would leave no VMAX slot', () => {
  const request = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({
      active: pokemon('Girafarig LOT 94'),
      bench: [
        pokemon('Mimikyu GRI 58'),
        pokemon('Tapu Lele-GX GRI 60'),
        pokemon('Shadow Rider Calyrex V CRE 74'),
        pokemon('Trevenant & Dusknoir-GX SMP SM217'),
        null
      ],
      deckCount: 30, prizeCount: 6
    }),
    items: [
      { token: 'radiant', kind: 'play-card',
        actorPrinting: 'Radiant Eternatus CRZ 105',
        publicMetadata: { cardType: 'pokemon', handIndex: 0,
          targetSeat: 'actor', targetZone: 'bench', targetIndex: 4,
          isOwnerVisible: true } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action', token: 'pass'
  });
});

test('face-up VMAX prizes are excluded from the hidden prize pool in the Gate estimate', () => {
  const request = promptRequest({
    promptType: 'ConfirmPrompt',
    source: actorChoiceSource('Radiant Eternatus CRZ 105', 'Climactic Gate'),
    choices: [
      { token: 'yes', kind: 'confirm', label: 'Yes' },
      { token: 'no', kind: 'confirm', label: 'No' }
    ],
    publicMetadata: { selectionType: 'confirm' },
    observation: {
      ownPublic: player({
        bench: [pokemon('Radiant Eternatus CRZ 105')],
        deckCount: 1, prizeCount: 6,
        prizeSlots: [{ index: 0, printing: 'Shadow Rider Calyrex VMAX CRE 75' }],
        discard: [
          'Shadow Rider Calyrex VMAX CRE 75',
          'Shadow Rider Calyrex VMAX CRE 75',
          'Shadow Rider Calyrex VMAX CRE 75'
        ]
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice', token: 'no'
  });
});


test('manual Psychic Energy root targeting is actor-relative from physical seat one', () => {
  const request = rootRequest({
    seat: 1,
    ownHand: ['Psychic Energy MEE 13'],
    ownPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 75', { stage: 'VMAX' })
    }),
    items: [
      { token: 'energy', kind: 'play-card',
        actorPrinting: 'Psychic Energy MEE 13',
        targetPrinting: 'Shadow Rider Calyrex VMAX CRE 75',
        publicMetadata: { cardType: 'energy', handIndex: 0,
          targetSeat: 'actor', targetZone: 'active', isOwnerVisible: true } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request, 1), {
    kind: 'select-action', token: 'energy'
  });
});

test('a claimed Radiant source is rejected when no Radiant is on the actor Bench', () => {
  const request = promptRequest({
    promptType: 'ConfirmPrompt',
    source: actorChoiceSource('Radiant Eternatus CRZ 105', 'Climactic Gate'),
    choices: [
      { token: 'yes', kind: 'confirm', label: 'Yes' },
      { token: 'no', kind: 'confirm', label: 'No' }
    ],
    publicMetadata: { selectionType: 'confirm' },
    observation: { ownPublic: player({ deckCount: 30, prizeCount: 6 }) }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain', reasonCode: 'UNSUPPORTED_CONFIRMATION_SOURCE'
  });
});


test('one remaining VMAX uses the deck/prize hypergeometric estimate, not a guaranteed-deck assumption', () => {
  const request = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({
      active: pokemon('Girafarig LOT 94'),
      discard: [
        'Shadow Rider Calyrex VMAX CRE 75',
        'Shadow Rider Calyrex VMAX CRE 75',
        'Shadow Rider Calyrex VMAX CRE 75'
      ],
      deckCount: 30, prizeCount: 6
    }),
    items: [
      { token: 'radiant', kind: 'play-card',
        actorPrinting: 'Radiant Eternatus CRZ 105',
        publicMetadata: { cardType: 'pokemon', handIndex: 0,
          targetSeat: 'actor', targetZone: 'bench', targetIndex: 0,
          isOwnerVisible: true } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action', token: 'radiant'
  });
});

test('Aichi Wobbuffet suppresses Radiant only from the Active Spot', () => {
  const radiantAction = {
    token: 'radiant', kind: 'play-card',
    actorPrinting: 'Radiant Eternatus CRZ 105',
    publicMetadata: { cardType: 'pokemon', handIndex: 0,
      targetSeat: 'actor', targetZone: 'bench', targetIndex: 0,
      isOwnerVisible: true }
  };
  const activeLock = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94'), deckCount: 30, prizeCount: 6 }),
    opponentPublic: player({
      active: pokemon('Wobbuffet PHF 36', { abilities: ['Bide Barricade'] })
    }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(activeLock), {
    kind: 'select-action', token: 'pass'
  });

  const benchedWobbuffet = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94'), deckCount: 30, prizeCount: 6 }),
    opponentPublic: player({
      active: pokemon('Regidrago V SIT'),
      bench: [pokemon('Wobbuffet PHF 36', { abilities: ['Bide Barricade'] })]
    }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(benchedWobbuffet), {
    kind: 'select-action', token: 'radiant'
  });
});

test('Path to the Peak suppresses Gate unless Stadium effects are disabled', () => {
  const radiantAction = {
    token: 'radiant', kind: 'play-card',
    actorPrinting: 'Radiant Eternatus CRZ 105',
    publicMetadata: { cardType: 'pokemon', handIndex: 0,
      targetSeat: 'actor', targetZone: 'bench', targetIndex: 0,
      isOwnerVisible: true }
  };
  const activePath = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({
      active: pokemon('Girafarig LOT 94'),
      stadium: ['Path to the Peak CRE 148'],
      deckCount: 30, prizeCount: 6
    }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(activePath), {
    kind: 'select-action', token: 'pass'
  });

  const unknownPathEpoch = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({
      active: pokemon('Girafarig LOT 94'),
      stadium: ['Path to the Peak CRE 148'],
      omitStadiumSuppression: true,
      deckCount: 30, prizeCount: 6
    }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(unknownPathEpoch), {
    kind: 'select-action', token: 'pass'
  });

  const disabledPath = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({
      active: pokemon('Girafarig LOT 94'),
      stadium: ['Path to the Peak CRE 148'],
      stadiumAndToolHaveNoEffectTurnsRemaining: 1,
      deckCount: 30, prizeCount: 6
    }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(disabledPath), {
    kind: 'select-action', token: 'radiant'
  });
});

test('Iron Thorns Initialization is an Active-only Radiant Gate lock', () => {
  const radiantAction = {
    token: 'radiant', kind: 'play-card',
    actorPrinting: 'Radiant Eternatus CRZ 105',
    publicMetadata: { cardType: 'pokemon', handIndex: 0,
      targetSeat: 'actor', targetZone: 'bench', targetIndex: 0,
      isOwnerVisible: true }
  };
  const activeLock = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94'), deckCount: 30, prizeCount: 6 }),
    opponentPublic: player({
      active: pokemon('Iron Thorns ex TWM 77', { abilities: ['Initialization'] })
    }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(activeLock), {
    kind: 'select-action', token: 'pass'
  });

  const benchedIronThorns = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94'), deckCount: 30, prizeCount: 6 }),
    opponentPublic: player({
      active: pokemon('Regidrago V SIT'),
      bench: [pokemon('Iron Thorns ex TWM 77', { abilities: ['Initialization'] })]
    }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(benchedIronThorns), {
    kind: 'select-action', token: 'radiant'
  });
});

test('Garbodor suppresses Gate only with a Tool attached and live Garbotoxin', () => {
  const radiantAction = {
    token: 'radiant', kind: 'play-card',
    actorPrinting: 'Radiant Eternatus CRZ 105',
    publicMetadata: { cardType: 'pokemon', handIndex: 0,
      targetSeat: 'actor', targetZone: 'bench', targetIndex: 0,
      isOwnerVisible: true }
  };
  const garbotoxin = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94'), deckCount: 30, prizeCount: 6 }),
    opponentPublic: player({
      active: pokemon('Regidrago V SIT'),
      bench: [pokemon('Garbodor BKP 57', {
        abilities: ['Garbotoxin'], tools: ['Stealthy Hood DRX 96']
      })]
    }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(garbotoxin), {
    kind: 'select-action', token: 'pass'
  });

  const bareGarbodor = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94'), deckCount: 30, prizeCount: 6 }),
    opponentPublic: player({
      active: pokemon('Regidrago V SIT'),
      bench: [pokemon('Garbodor BKP 57', { abilities: ['Garbotoxin'] })]
    }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(bareGarbodor), {
    kind: 'select-action', token: 'radiant'
  });
});

test('Snorlax Block does not suppress Radiant, and Wobbuffet does not block Psychic Wonder Tag', () => {
  const radiantAction = {
    token: 'radiant', kind: 'play-card',
    actorPrinting: 'Radiant Eternatus CRZ 105',
    publicMetadata: { cardType: 'pokemon', handIndex: 0,
      targetSeat: 'actor', targetZone: 'bench', targetIndex: 0,
      isOwnerVisible: true }
  };
  const snorlax = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94'), deckCount: 30, prizeCount: 6 }),
    opponentPublic: player({
      active: pokemon('Snorlax PGO 55', { abilities: ['Block'] })
    }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(snorlax), {
    kind: 'select-action', token: 'radiant'
  });

  const wonderTag = rootRequest({
    ownHand: ['Tapu Lele-GX GRI 60'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94') }),
    opponentPublic: player({
      active: pokemon('Wobbuffet PHF 36', { abilities: ['Bide Barricade'] })
    }),
    items: [
      { token: 'wonder-tag', kind: 'use-ability',
        publicMetadata: { abilityName: 'Wonder Tag', sourceSeat: 'actor',
          sourceZone: 'bench', sourceIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(wonderTag), {
    kind: 'select-action', token: 'wonder-tag'
  });
});

test('a live Wobbuffet lock declines an already-open Radiant confirmation', () => {
  const request = promptRequest({
    promptType: 'ConfirmPrompt',
    source: actorChoiceSource('Radiant Eternatus CRZ 105', 'Climactic Gate'),
    choices: [
      { token: 'yes', kind: 'confirm', label: 'Yes' },
      { token: 'no', kind: 'confirm', label: 'No' }
    ],
    publicMetadata: { selectionType: 'confirm' },
    observation: {
      ownPublic: player({
        bench: [pokemon('Radiant Eternatus CRZ 105')],
        deckCount: 30, prizeCount: 6
      }),
      opponentPublic: player({
        active: pokemon('Wobbuffet PHF 36', { abilities: ['Bide Barricade'] })
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice', token: 'no'
  });
});


test('Quick Ball mandatory hand discard protects singleton Shadow Rider copies', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    description: 'CHOOSE_CARD_TO_DISCARD',
    source: actorChoiceSource('Quick Ball FST 237', 'Quick Ball'),
    choices: [
      { token: 'rider-v', kind: 'card', printing: 'Shadow Rider Calyrex V CRE 74',
        label: 'Shadow Rider Calyrex V' },
      { token: 'mail', kind: 'card', printing: "Trainers' Mail ROS 92",
        label: "Trainers' Mail" },
      { token: 'psychic', kind: 'card', printing: 'Psychic Energy MEE 13',
        label: 'Psychic Energy' }
    ],
    publicMetadata: {
      sourceZone: 'hand', ownerSeat: 'actor',
      minimumCount: 1, maximumCount: 1,
      allowCancel: false, isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: [
        'Shadow Rider Calyrex V CRE 74',
        "Trainers' Mail ROS 92",
        'Psychic Energy MEE 13'
      ]
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['mail']
  });
});

test('Quick Ball mandatory payment chooses the least-bad legal card instead of abstaining', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    description: 'CHOOSE_CARD_TO_DISCARD',
    source: actorChoiceSource('Quick Ball FST 237', 'Quick Ball'),
    choices: [
      { token: 'unfair', kind: 'card', printing: 'Unfair Stamp TWM 165',
        label: 'Unfair Stamp' },
      { token: 'tulip', kind: 'card', printing: 'Tulip PAR 181',
        label: 'Tulip' },
      { token: 'rider-v', kind: 'card', printing: 'Shadow Rider Calyrex V CRE 74',
        label: 'Shadow Rider Calyrex V' },
      { token: 'rider-vmax', kind: 'card', printing: 'Shadow Rider Calyrex VMAX CRE 75',
        label: 'Shadow Rider Calyrex VMAX' }
    ],
    publicMetadata: {
      sourceZone: 'hand', ownerSeat: 'actor',
      minimumCount: 1, maximumCount: 1,
      allowCancel: false, isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: [
        'Unfair Stamp TWM 165',
        'Tulip PAR 181',
        'Shadow Rider Calyrex V CRE 74',
        'Shadow Rider Calyrex VMAX CRE 75'
      ]
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['unfair']
  });
});

test('Quick Ball deck search remains search-scored after the mandatory discard phase', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    description: 'CHOOSE_CARD_TO_HAND',
    source: actorChoiceSource('Quick Ball FST 237', 'Quick Ball'),
    choices: [
      { token: 'clefairy', kind: 'card', printing: "Lillie's Clefairy ex JTG 56",
        label: "Lillie's Clefairy ex" },
      { token: 'rider-v', kind: 'card', printing: 'Shadow Rider Calyrex V CRE 74',
        label: 'Shadow Rider Calyrex V' },
      { token: 'empty', kind: 'empty-selection', label: 'Select none' },
      { token: 'cancel', kind: 'cancel', label: 'Cancel' }
    ],
    publicMetadata: {
      sourceZone: 'deck', ownerSeat: 'actor',
      minimumCount: 0, maximumCount: 1,
      allowCancel: true, isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['Quick Ball FST 237'],
      ownPublic: player(),
      opponentPublic: player({ active: pokemon('Shadow Rider Calyrex V CRE 74') })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['rider-v']
  });
});

test('Silent Lab suppresses Radiant Gate unless global Stadium and Tool effects are disabled', () => {
  const radiantAction = {
    token: 'radiant', kind: 'play-card',
    actorPrinting: 'Radiant Eternatus CRZ 105',
    publicMetadata: { cardType: 'pokemon', handIndex: 0,
      targetSeat: 'actor', targetZone: 'bench', targetIndex: 0,
      isOwnerVisible: true }
  };
  const activeLab = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({
      active: pokemon('Girafarig LOT 94'),
      stadium: ['Silent Lab PRC 140'],
      deckCount: 30, prizeCount: 6
    }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(activeLab), {
    kind: 'select-action', token: 'pass'
  });

  const opponentEpochDisablesLab = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({
      active: pokemon('Girafarig LOT 94'),
      stadium: ['Silent Lab PRC 140'],
      deckCount: 30, prizeCount: 6
    }),
    opponentPublic: player({ stadiumAndToolHaveNoEffectTurnsRemaining: 1 }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(opponentEpochDisablesLab), {
    kind: 'select-action', token: 'radiant'
  });
});

test('Path to the Peak uses either player global Stadium suppression epoch', () => {
  const radiantAction = {
    token: 'radiant', kind: 'play-card',
    actorPrinting: 'Radiant Eternatus CRZ 105',
    publicMetadata: { cardType: 'pokemon', handIndex: 0,
      targetSeat: 'actor', targetZone: 'bench', targetIndex: 0,
      isOwnerVisible: true }
  };
  const opponentEpoch = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({
      active: pokemon('Girafarig LOT 94'),
      stadium: ['Path to the Peak CRE 148'],
      deckCount: 30, prizeCount: 6
    }),
    opponentPublic: player({ stadiumAndToolHaveNoEffectTurnsRemaining: 1 }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(opponentEpoch), {
    kind: 'select-action', token: 'radiant'
  });
});

test('Active Klefki suppresses Radiant Gate while Benched Klefki does not', () => {
  const radiantAction = {
    token: 'radiant', kind: 'play-card',
    actorPrinting: 'Radiant Eternatus CRZ 105',
    publicMetadata: { cardType: 'pokemon', handIndex: 0,
      targetSeat: 'actor', targetZone: 'bench', targetIndex: 0,
      isOwnerVisible: true }
  };
  const activeKlefki = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94'), deckCount: 30, prizeCount: 6 }),
    opponentPublic: player({
      active: pokemon('Klefki SVI 96', { abilities: ['Mischievous Lock'] })
    }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(activeKlefki), {
    kind: 'select-action', token: 'pass'
  });

  const benchedKlefki = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94'), deckCount: 30, prizeCount: 6 }),
    opponentPublic: player({
      active: pokemon('Regidrago V SIT'),
      bench: [pokemon('Klefki SVI 96', { abilities: ['Mischievous Lock'] })]
    }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(benchedKlefki), {
    kind: 'select-action', token: 'radiant'
  });
});

test('Garbodor LTR 68 and BKP 57 both suppress Gate only while a Tool is attached', () => {
  const radiantAction = {
    token: 'radiant', kind: 'play-card',
    actorPrinting: 'Radiant Eternatus CRZ 105',
    publicMetadata: { cardType: 'pokemon', handIndex: 0,
      targetSeat: 'actor', targetZone: 'bench', targetIndex: 0,
      isOwnerVisible: true }
  };
  const ltrWithTool = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94'), deckCount: 30, prizeCount: 6 }),
    opponentPublic: player({
      active: pokemon('Regidrago V SIT'),
      bench: [pokemon('Garbodor LTR 68', {
        abilities: ['Garbotoxin'], tools: ['Float Stone BKT 137']
      })]
    }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(ltrWithTool), {
    kind: 'select-action', token: 'pass'
  });

  const ltrWithoutTool = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94'), deckCount: 30, prizeCount: 6 }),
    opponentPublic: player({
      active: pokemon('Regidrago V SIT'),
      bench: [pokemon('Garbodor LTR 68', { abilities: ['Garbotoxin'] })]
    }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(ltrWithoutTool), {
    kind: 'select-action', token: 'radiant'
  });
});

test('Clefairy search and play recognize a Dragon on the opponent Bench', () => {
  const clefairyAction = {
    token: 'clefairy', kind: 'play-card',
    actorPrinting: "Lillie's Clefairy ex JTG 56",
    publicMetadata: { cardType: 'pokemon', handIndex: 0,
      targetSeat: 'actor', targetZone: 'bench', targetIndex: 0,
      isOwnerVisible: true }
  };
  const benchDragon = rootRequest({
    ownHand: ["Lillie's Clefairy ex JTG 56"],
    ownPublic: player({ active: pokemon('Girafarig LOT 94') }),
    opponentPublic: player({
      active: pokemon('Shadow Rider Calyrex V CRE 74'),
      bench: [pokemon('Dialga-GX UPR 100', { types: ['Dragon'] })]
    }),
    items: [clefairyAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(benchDragon), {
    kind: 'select-action', token: 'clefairy'
  });

  const noDragon = rootRequest({
    ownHand: ["Lillie's Clefairy ex JTG 56"],
    ownPublic: player({ active: pokemon('Girafarig LOT 94') }),
    opponentPublic: player({
      active: pokemon('Shadow Rider Calyrex V CRE 74'),
      bench: [pokemon('Regidrago V SIT', { types: ['Psychic'] })]
    }),
    items: [clefairyAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(noDragon), {
    kind: 'select-action', token: 'pass'
  });
});

test('Fairy Zone requires explicit active status and remains target-aware for Stealthy Hood', () => {
  const attacks = [
    { token: 'max', kind: 'attack', attackName: 'Max Geist' },
    { token: 'eon', kind: 'attack', attackName: 'Eon Blade' },
    { token: 'pass', kind: 'pass' }
  ];
  const rider = pokemon('Shadow Rider Calyrex VMAX CRE 75', {
    hp: 320,
    stage: 'VMAX',
    energies: [
      'Psychic Energy MEE 13',
      'Psychic Energy MEE 13',
      'Psychic Energy MEE 13'
    ]
  });
  const activeFairyZone = pokemon("Lillie's Clefairy ex JTG 56", {
    abilities: ['Fairy Zone'],
    abilitySuppressions: [{
      abilityName: 'Fairy Zone', suppressed: false,
      reasonCode: null, sourcePrinting: null
    }]
  });
  const unknownFairyZone = pokemon("Lillie's Clefairy ex JTG 56", {
    abilities: ['Fairy Zone']
  });

  const knownActive = rootRequest({
    ownPublic: player({ active: rider, bench: [activeFairyZone] }),
    opponentPublic: player({
      active: pokemon('Dialga-GX UPR 100', { hp: 250, types: ['Dragon'] })
    }),
    items: attacks
  });
  assert.deepEqual(checkedDecision(knownActive), {
    kind: 'select-action', token: 'eon'
  });

  const unknownStatus = rootRequest({
    ownPublic: player({ active: rider, bench: [unknownFairyZone] }),
    opponentPublic: player({
      active: pokemon('Dialga-GX UPR 100', { hp: 250, types: ['Dragon'] })
    }),
    items: attacks
  });
  assert.deepEqual(checkedDecision(unknownStatus), {
    kind: 'select-action', token: 'max'
  });

  const hoodProtected = rootRequest({
    ownPublic: player({ active: rider, bench: [activeFairyZone] }),
    opponentPublic: player({
      active: pokemon('Dialga-GX UPR 100', {
        hp: 250, types: ['Dragon'], tools: ['Stealthy Hood UNB 186']
      })
    }),
    items: attacks
  });
  assert.deepEqual(checkedDecision(hoodProtected), {
    kind: 'select-action', token: 'max'
  });

  const hoodDisabled = rootRequest({
    ownPublic: player({
      active: rider, bench: [activeFairyZone],
      stadiumAndToolHaveNoEffectTurnsRemaining: 1
    }),
    opponentPublic: player({
      active: pokemon('Dialga-GX UPR 100', {
        hp: 250, types: ['Dragon'], tools: ['Stealthy Hood UNB 186']
      })
    }),
    items: attacks
  });
  assert.deepEqual(checkedDecision(hoodDisabled), {
    kind: 'select-action', token: 'eon'
  });
});

test('Field Blower is played for opponent Tools even without a lock Stadium', () => {
  const request = rootRequest({
    ownHand: ['Field Blower GRI 125'],
    ownPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 75', {
        stage: 'VMAX', abilities: ['Underworld Door']
      })
    }),
    opponentPublic: player({
      active: pokemon('Regidrago V SIT', {
        tools: ['Stealthy Hood UNB 186']
      })
    }),
    items: [
      { token: 'blower', kind: 'play-card', actorPrinting: 'Field Blower GRI 125',
        publicMetadata: { cardType: 'trainer', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action', token: 'blower'
  });
});

test('Field Blower selects Stadium-plus-Tool mode for an effective lock Stadium', () => {
  const request = promptRequest({
    promptType: 'SelectOptionPrompt',
    source: actorChoiceSource('Field Blower GRI 125', 'Field Blower'),
    choices: [
      { token: 'stadium-plus-tool', kind: 'option',
        label: 'Discard a Stadium and up to one Pokémon Tool',
        publicMetadata: { choiceIndex: 0 } },
      { token: 'two-tools', kind: 'option',
        label: 'Discard up to two Pokémon Tools',
        publicMetadata: { choiceIndex: 1 } }
    ],
    publicMetadata: {
      selectionType: 'option', minimumCount: 1, maximumCount: 1,
      allowCancel: false, isSecret: false
    },
    observation: {
      ownPublic: player({ stadium: ['Silent Lab PRC 140'] }),
      opponentPublic: player({
        active: pokemon('Garbodor LTR 68', { tools: ['Float Stone BKT 137'] })
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice', token: 'stadium-plus-tool'
  });
});

test('Field Blower selects two-Tool mode when no effective lock Stadium is present', () => {
  const request = promptRequest({
    promptType: 'SelectOptionPrompt',
    source: actorChoiceSource('Field Blower GRI 125', 'Field Blower'),
    choices: [
      { token: 'stadium-plus-tool', kind: 'option',
        label: 'Discard a Stadium and up to one Pokémon Tool',
        publicMetadata: { choiceIndex: 0 } },
      { token: 'two-tools', kind: 'option',
        label: 'Discard up to two Pokémon Tools',
        publicMetadata: { choiceIndex: 1 } }
    ],
    publicMetadata: {
      selectionType: 'option', minimumCount: 1, maximumCount: 1,
      allowCancel: false, isSecret: false
    },
    observation: {
      ownPublic: player({ stadium: ['Sky Field ROS 89'] }),
      opponentPublic: player({
        active: pokemon('Garbodor LTR 68', { tools: ['Float Stone BKT 137'] }),
        bench: [pokemon('Regidrago V SIT', { tools: ['Stealthy Hood UNB 186'] })]
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice', token: 'two-tools'
  });
});

test('Field Blower preserves our Sky Field and Dimension Valley against one opposing Tool', () => {
  const makeRequest = (seat, stadium) => promptRequest({
    seat,
    promptType: 'SelectOptionPrompt',
    source: actorChoiceSource('Field Blower GRI 125', 'Field Blower'),
    choices: [
      { token: 'stadium-plus-tool', kind: 'option',
        label: 'Discard a Stadium and up to one Pokémon Tool',
        publicMetadata: { choiceIndex: 0 } },
      { token: 'tools-only', kind: 'option',
        label: 'Discard up to two Pokémon Tools',
        publicMetadata: { choiceIndex: 1 } }
    ],
    publicMetadata: {
      selectionType: 'option', minimumCount: 1, maximumCount: 1,
      allowCancel: false, isSecret: false
    },
    observation: {
      ownPublic: player({ stadium: [stadium] }),
      opponentPublic: player({
        active: pokemon('Regidrago V SIT 135', {
          types: ['Dragon'], tools: ['Stealthy Hood UNB 186']
        })
      })
    }
  });

  for (const seat of [0, 1]) {
    for (const stadium of ['Sky Field ROS 89', 'Dimension Valley PHF 93']) {
      assert.deepEqual(checkedDecision(makeRequest(seat, stadium), seat), {
        kind: 'select-choice', token: 'tools-only'
      });
    }
    assert.deepEqual(checkedDecision(
      makeRequest(seat, 'Path to the Peak CRE 148'), seat
    ), { kind: 'select-choice', token: 'stadium-plus-tool' });
  }
});

test('Field Blower selects visible opponent Pokémon with Tools and ignores own targets', () => {
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Field Blower GRI 125', 'Field Blower'),
    choices: [
      { token: 'own-tool', kind: 'pokemon', printing: 'Shadow Rider Calyrex V CRE 74',
        label: 'Shadow Rider Calyrex V',
        publicMetadata: { selectionIndex: 0, ownerSeat: 'actor',
          targetZone: 'bench', isOwnerVisible: true, benchIndex: 0 } },
      { token: 'opponent-garbo', kind: 'pokemon', printing: 'Garbodor LTR 68',
        label: 'Garbodor',
        publicMetadata: { selectionIndex: 1, ownerSeat: 'opponent',
          targetZone: 'bench', isOwnerVisible: true, benchIndex: 0 } },
      { token: 'opponent-no-tool', kind: 'pokemon', printing: 'Dratini OBF 105',
        label: 'Dratini',
        publicMetadata: { selectionIndex: 2, ownerSeat: 'opponent',
          targetZone: 'bench', isOwnerVisible: true, benchIndex: 1 } },
      { token: 'empty', kind: 'empty-selection', label: 'Select none' }
    ],
    publicMetadata: {
      selectionType: 'pokemon', minimumCount: 0, maximumCount: 2,
      allowCancel: false, isSecret: false
    },
    observation: {
      ownPublic: player({
        active: pokemon('Shadow Rider Calyrex VMAX CRE 75', {
          stage: 'VMAX', abilities: ['Underworld Door']
        }),
        bench: [pokemon('Shadow Rider Calyrex V CRE 74', {
          tools: ['Float Stone BKT 137']
        })]
      }),
      opponentPublic: player({
        active: pokemon('Regidrago V SIT'),
        bench: [
          pokemon('Garbodor LTR 68', {
            abilities: ['Garbotoxin'], tools: ['Float Stone BKT 137']
          }),
          pokemon('Dratini OBF 105')
        ]
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['opponent-garbo']
  });
});

test('Field Blower chooses the empty selection when no opponent Pokémon has a Tool', () => {
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Field Blower GRI 125', 'Field Blower'),
    choices: [
      { token: 'own-tool', kind: 'pokemon', printing: 'Shadow Rider Calyrex V CRE 74',
        label: 'Shadow Rider Calyrex V',
        publicMetadata: { selectionIndex: 0, ownerSeat: 'actor',
          targetZone: 'bench', isOwnerVisible: true, benchIndex: 0 } },
      { token: 'empty', kind: 'empty-selection', label: 'Select none' }
    ],
    publicMetadata: {
      selectionType: 'pokemon', minimumCount: 0, maximumCount: 2,
      allowCancel: false, isSecret: false
    },
    observation: {
      ownPublic: player({
        active: pokemon('Girafarig LOT 94'),
        bench: [pokemon('Shadow Rider Calyrex V CRE 74', {
          tools: ['Float Stone BKT 137']
        })]
      }),
      opponentPublic: player({ active: pokemon('Regidrago V SIT') })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice', token: 'empty'
  });
});


test('Mysterious Treasure least-bad discard preserves a singleton Shadow Rider V', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Mysterious Treasure FLI 113', 'Mysterious Treasure'),
    choices: [
      { token: 'rider-v', kind: 'card', printing: 'Shadow Rider Calyrex V CRE 74',
        label: 'Shadow Rider Calyrex V', publicMetadata: { sourceZone: 'hand' } },
      { token: 'psychic', kind: 'card', printing: 'Psychic Energy MEE 13',
        label: 'Psychic Energy', publicMetadata: { sourceZone: 'hand' } }
    ],
    publicMetadata: {
      sourceZone: 'hand', minimumCount: 1, maximumCount: 1,
      allowCancel: false, isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: [
        'Mysterious Treasure FLI 113',
        'Shadow Rider Calyrex V CRE 74',
        'Psychic Energy MEE 13'
      ]
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['psychic']
  });
});

test('Field Blower does not spend a Tool-only turn while global Tool effects are disabled', () => {
  const request = rootRequest({
    ownHand: ['Field Blower GRI 125'],
    ownPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 75', {
        stage: 'VMAX', abilities: ['Underworld Door']
      })
    }),
    opponentPublic: player({
      active: pokemon('Regidrago V SIT', {
        tools: ['Stealthy Hood UNB 186']
      }),
      stadiumAndToolHaveNoEffectTurnsRemaining: 1
    }),
    items: [
      { token: 'blower', kind: 'play-card', actorPrinting: 'Field Blower GRI 125',
        publicMetadata: { cardType: 'trainer', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action', token: 'pass'
  });
});

test('Field Blower declines opponent Tool targets while Tool effects are disabled', () => {
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Field Blower GRI 125', 'Field Blower'),
    choices: [
      { token: 'opponent-tool', kind: 'pokemon', printing: 'Garbodor LTR 68',
        label: 'Garbodor',
        publicMetadata: { selectionIndex: 0, ownerSeat: 'opponent',
          targetZone: 'bench', isOwnerVisible: true, benchIndex: 0 } },
      { token: 'empty', kind: 'empty-selection', label: 'Select none' }
    ],
    publicMetadata: {
      selectionType: 'pokemon', minimumCount: 0, maximumCount: 2,
      allowCancel: false, isSecret: false
    },
    observation: {
      ownPublic: player({}),
      opponentPublic: player({
        bench: [pokemon('Garbodor LTR 68', {
          abilities: ['Garbotoxin'], tools: ['Float Stone BKT 137']
        })],
        stadiumAndToolHaveNoEffectTurnsRemaining: 1
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice', token: 'empty'
  });
});


test('Neutralizing Gas suppresses Gate only from the opponent Active Spot', () => {
  const radiantAction = {
    token: 'radiant', kind: 'play-card',
    actorPrinting: 'Radiant Eternatus CRZ 105',
    publicMetadata: { cardType: 'pokemon', handIndex: 0,
      targetSeat: 'actor', targetZone: 'bench', targetIndex: 0,
      isOwnerVisible: true }
  };
  const opponentActiveGas = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94'), deckCount: 30, prizeCount: 6 }),
    opponentPublic: player({
      active: pokemon('Galarian Weezing RCL 113', {
        abilities: ['Neutralizing Gas']
      })
    }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(opponentActiveGas), {
    kind: 'select-action', token: 'pass'
  });

  const opponentBenchedGas = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94'), deckCount: 30, prizeCount: 6 }),
    opponentPublic: player({
      active: pokemon('Regidrago V SIT'),
      bench: [pokemon('Galarian Weezing RCL 113', {
        abilities: ['Neutralizing Gas']
      })]
    }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(opponentBenchedGas), {
    kind: 'select-action', token: 'radiant'
  });

  const ownActiveGas = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({
      active: pokemon('Galarian Weezing RCL 113', {
        abilities: ['Neutralizing Gas']
      }),
      deckCount: 30, prizeCount: 6
    }),
    opponentPublic: player({ active: pokemon('Regidrago V SIT') }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(ownActiveGas), {
    kind: 'select-action', token: 'radiant'
  });
});

test('Alolan Muk Power of Alchemy suppresses Gate from either public Bench', () => {
  const radiantAction = {
    token: 'radiant', kind: 'play-card',
    actorPrinting: 'Radiant Eternatus CRZ 105',
    publicMetadata: { cardType: 'pokemon', handIndex: 0,
      targetSeat: 'actor', targetZone: 'bench', targetIndex: 0,
      isOwnerVisible: true }
  };
  const ownBenchMuk = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({
      active: pokemon('Girafarig LOT 94'),
      bench: [pokemon('Alolan Muk SUM 58', { abilities: ['Power of Alchemy'] })],
      deckCount: 30, prizeCount: 6
    }),
    opponentPublic: player({ active: pokemon('Regidrago V SIT') }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(ownBenchMuk), {
    kind: 'select-action', token: 'pass'
  });

  const opponentBenchMuk = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({
      active: pokemon('Girafarig LOT 94'),
      deckCount: 30, prizeCount: 6
    }),
    opponentPublic: player({
      active: pokemon('Regidrago V SIT'),
      bench: [pokemon('Alolan Muk SUM 58', { abilities: ['Power of Alchemy'] })]
    }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(opponentBenchMuk), {
    kind: 'select-action', token: 'pass'
  });
});


test('Quick Ball discards duplicate search cards before a singleton Field Blower', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    description: 'CHOOSE_CARD_TO_DISCARD',
    source: actorChoiceSource('Quick Ball FST 237', 'Quick Ball'),
    choices: [
      { token: 'field-blower', kind: 'card', printing: 'Field Blower GRI 125',
        label: 'Field Blower' },
      { token: 'fog-crystal', kind: 'card', printing: 'Fog Crystal CRE 140',
        label: 'Fog Crystal' }
    ],
    publicMetadata: {
      sourceZone: 'hand', ownerSeat: 'actor',
      minimumCount: 1, maximumCount: 1,
      allowCancel: false, isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: [
        'Field Blower GRI 125',
        'Fog Crystal CRE 140',
        'Fog Crystal CRE 140'
      ]
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['fog-crystal']
  });
});

test('Quick Ball may discard a duplicate Clefairy but protects singleton Radiant Eternatus', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    description: 'CHOOSE_CARD_TO_DISCARD',
    source: actorChoiceSource('Quick Ball FST 237', 'Quick Ball'),
    choices: [
      { token: 'radiant', kind: 'card', printing: 'Radiant Eternatus CRZ 105',
        label: 'Radiant Eternatus' },
      { token: 'clefairy', kind: 'card', printing: "Lillie's Clefairy ex JTG 56",
        label: "Lillie's Clefairy ex" }
    ],
    publicMetadata: {
      sourceZone: 'hand', ownerSeat: 'actor',
      minimumCount: 1, maximumCount: 1,
      allowCancel: false, isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: [
        'Radiant Eternatus CRZ 105',
        "Lillie's Clefairy ex JTG 56",
        "Lillie's Clefairy ex JTG 56"
      ]
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['clefairy']
  });
});


test('Field Blower targets Dragon Stealthy Hood before a generic opponent Tool', () => {
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Field Blower GRI 125', 'Field Blower'),
    choices: [
      { token: 'generic-tool', kind: 'pokemon', printing: 'Dratini OBF 105',
        label: 'Dratini',
        publicMetadata: { selectionIndex: 0, ownerSeat: 'opponent',
          targetZone: 'bench', isOwnerVisible: true, benchIndex: 0 } },
      { token: 'dragon-hood', kind: 'pokemon', printing: 'Regidrago V SIT 135',
        label: 'Regidrago V',
        publicMetadata: { selectionIndex: 1, ownerSeat: 'opponent',
          targetZone: 'active', isOwnerVisible: true } },
      { token: 'empty', kind: 'empty-selection', label: 'Select none' }
    ],
    publicMetadata: {
      selectionType: 'pokemon', minimumCount: 0, maximumCount: 1,
      allowCancel: false, isSecret: false
    },
    observation: {
      ownPublic: player(),
      opponentPublic: player({
        active: pokemon('Regidrago V SIT 135', {
          types: ['Dragon'], tools: ['Stealthy Hood UNB 186']
        }),
        bench: [pokemon('Dratini OBF 105', {
          tools: ['Float Stone BKT 137']
        })]
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['dragon-hood']
  });
});

test('Field Blower selects Stealthy Hood when a Dragon is protected by it', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Field Blower GRI 125', 'Field Blower'),
    choices: [
      { token: 'float-stone', kind: 'card', printing: 'Float Stone BKT 137',
        label: 'Float Stone',
        publicMetadata: { sourceZone: 'tool', ownerSeat: 'opponent',
          isOwnerVisible: true } },
      { token: 'stealthy-hood', kind: 'card', printing: 'Stealthy Hood UNB 186',
        label: 'Stealthy Hood',
        publicMetadata: { sourceZone: 'tool', ownerSeat: 'opponent',
          isOwnerVisible: true } }
    ],
    publicMetadata: {
      sourceZone: 'tool', ownerSeat: 'opponent',
      minimumCount: 1, maximumCount: 1,
      allowCancel: false, isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownPublic: player(),
      opponentPublic: player({
        active: pokemon('Regidrago V SIT 135', {
          types: ['Dragon'], tools: ['Stealthy Hood UNB 186']
        })
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['stealthy-hood']
  });
});


test('Fairy Zone never infers active status from an incomplete public-suppressor inventory', () => {
  const fairy = (abilitySuppressions) => pokemon("Lillie's Clefairy ex JTG 56", {
    abilities: ['Fairy Zone'],
    ...(abilitySuppressions ? { abilitySuppressions } : {})
  });
  const observation = (slot, own = {}, opponent = {}) => ({
    ownPublic: player({
      active: pokemon('Girafarig LOT 94'),
      bench: [slot],
      ...own
    }),
    opponentPublic: player({
      active: pokemon('Regidrago V SIT'),
      ...opponent
    })
  });
  const active = value => policyInternals.fairyZoneActive(value);

  assert.equal(active(observation(fairy())), false);
  assert.equal(active(observation(fairy(), { stadium: ['Path to the Peak CRE 148'] })), false);
  assert.equal(active(observation(fairy(), {}, { stadium: ['Silent Lab PRC 140'] })), false);
  assert.equal(active(observation(fairy(), {
    active: pokemon('Klefki SVI 96', { abilities: ['Mischievous Lock'] })
  })), false);
  assert.equal(active(observation(fairy(), {}, {
    active: pokemon('Iron Thorns ex TWM 77', { abilities: ['Initialization'] })
  })), false);

  assert.equal(active(observation(fairy([{
    abilityName: 'Fairy Zone', suppressed: false,
    reasonCode: null, sourcePrinting: null
  }]))), true);
  assert.equal(active(observation(fairy([{
    abilityName: 'Fairy Zone', suppressed: true,
    reasonCode: 'PATH_TO_THE_PEAK',
    sourcePrinting: 'Path to the Peak CRE 148'
  }]))), false);
});


test('Climactic Gate veto includes opponent Active Slaking but not own Active Slaking', () => {
  const radiantAction = {
    token: 'radiant', kind: 'play-card',
    actorPrinting: 'Radiant Eternatus CRZ 105',
    publicMetadata: { cardType: 'pokemon', handIndex: 0,
      targetSeat: 'actor', targetZone: 'bench', targetIndex: 0,
      isOwnerVisible: true }
  };
  const opponentSlaking = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94'), deckCount: 30, prizeCount: 6 }),
    opponentPublic: player({
      active: pokemon('Slaking SUM 115', { abilities: ['Lazy'] })
    }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(opponentSlaking), {
    kind: 'select-action', token: 'pass'
  });

  const ownSlaking = rootRequest({
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownPublic: player({
      active: pokemon('Slaking SUM 115', { abilities: ['Lazy'] }),
      deckCount: 30, prizeCount: 6
    }),
    opponentPublic: player({ active: pokemon('Regidrago V SIT') }),
    items: [radiantAction, { token: 'pass', kind: 'pass' }]
  });
  assert.deepEqual(checkedDecision(ownSlaking), {
    kind: 'select-action', token: 'radiant'
  });
});
