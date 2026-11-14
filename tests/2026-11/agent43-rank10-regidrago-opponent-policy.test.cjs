'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  POLICY_VERSION,
  createPolicy,
  scoreAction,
  promptDecision,
  bestAction
} = require('../../simulation/evaluation/2026-11/agent43-rank10-regidrago-opponent-policy.cjs');

function pokemon(printing, options = {}) {
  return {
    printing,
    hp: options.hp ?? 280,
    damage: options.damage ?? 0,
    printed: { subtypes: options.subtypes ?? ['Basic'], types: options.types ?? ['Dragon'] },
    energies: options.energies ?? [],
    tools: options.tools ?? [],
    evolutionPrintings: options.evolutionPrintings ?? []
  };
}

function observation(options = {}) {
  return {
    actorSeat: options.seat ?? 0,
    globalTurn: options.turn ?? 1,
    ownHand: options.hand ?? [],
    ownPublic: {
      active: options.active ?? null,
      bench: options.bench ?? [],
      discard: options.discard ?? [],
      stadium: options.ownStadium ?? [],
      deckCount: options.deckCount ?? 40,
      publicTurnRestrictions: { vstarUsed: options.vstarUsed ?? false, gxUsed: options.gxUsed ?? false },
      prizeCount: options.ownPrizeCount ?? 6
    },
    opponentPublic: {
      active: options.opponentActive ?? null,
      bench: options.opponentBench ?? [],
      discard: options.opponentDiscard ?? [],
      stadium: options.opponentStadium ?? [],
      publicRestrictions: options.opponentRestrictions ?? {},
      prizeCount: options.opponentPrizeCount ?? 6
    }
  };
}

function item(token, kind, printing, extra = {}) {
  return { token, kind, label: printing, publicMetadata: { cardPrinting: printing, ...extra } };
}
function choice(token, printing, extra = {}) {
  return { token, kind: 'card', label: printing, publicMetadata: { printing, ...extra } };
}
function request(obs, items, prompt = null, extra = {}) {
  return {
    role: 'opponent', seat: 0, observation: obs,
    actionFrontier: { items }, prompt,
    publicEventReceipt: extra.publicEventReceipt ?? {}
  };
}

const regidragoV = pokemon('Regidrago V SIT 135');
const regidragoVstar = pokemon('Regidrago VSTAR SIT 136', { subtypes: ['VSTAR'], energies: ['Double Dragon Energy ROS 97'] });
const budew = pokemon('Budew ASC 16', { hp: 30 });
const latias = pokemon('Latias ex SSP 76', { subtypes: ['Basic', 'ex'], types: ['Psychic'] });

test('policy initializes only for the declared opponent role, seat and version', () => {
  assert.throws(() => createPolicy({ role: 'candidate', seat: 0, policyVersion: POLICY_VERSION, config: {} }));
  assert.throws(() => createPolicy({ role: 'opponent', seat: 0, policyVersion: 'wrong', config: {} }));
  assert.doesNotThrow(() => createPolicy({ role: 'opponent', seat: 0, policyVersion: POLICY_VERSION, config: {} }));
});

test('policy abstains on actor-seat mismatch', () => {
  const policy = createPolicy({ role: 'opponent', seat: 0, policyVersion: POLICY_VERSION, config: {} });
  const obs = observation({ seat: 1 });
  assert.equal(policy.decide({ ...request(obs, []), observation: obs }).reasonCode, 'ROLE_SEAT_BINDING_MISMATCH');
});

test('Battle VIP Pass is the top opening action when no Regidrago V is in play', () => {
  const obs = observation({ turn: 1 });
  const result = bestAction(request(obs, [
    item('vip', 'play-card', 'Battle VIP Pass FST 225'),
    item('budew', 'play-card', 'Budew ASC 16'),
    item('pass', 'pass', 'Pass')
  ]));
  assert.deepEqual(result, { kind: 'select-action', token: 'vip' });
});

test('Budew is prioritized as an early Item-lock setup when absent from the board', () => {
  const obs = observation({ bench: [regidragoV, null, null, null, null] });
  assert.equal(scoreAction(item('budew', 'play-card', 'Budew ASC 16'), { observation: obs }), 190);
});

test('Itchy Pollen is scored as the zero-Energy Item-lock attack', () => {
  const obs = observation({ active: budew });
  assert.equal(scoreAction(item('itchy', 'attack', 'Itchy Pollen', { attackName: 'Itchy Pollen' }), { observation: obs }), 205);
});

test('Apex Dragon is prioritized when a Dragon payload is already in discard', () => {
  const obs = observation({ active: regidragoVstar, discard: ['Dragapult ex TWM 130'] });
  assert.equal(scoreAction(item('apex', 'attack', 'Apex Dragon', { attackName: 'Apex Dragon' }), { observation: obs }), 210);
});

test('Legacy Star is prioritized only when VSTAR use is explicitly unused', () => {
  const obs = observation({ active: regidragoVstar, vstarUsed: false });
  assert.equal(scoreAction(item('legacy', 'use-ability', 'Legacy Star', { sourceEffect: 'Legacy Star' }), { observation: obs }), 220);
  const used = observation({ active: regidragoVstar, vstarUsed: true });
  assert.equal(scoreAction(item('legacy', 'use-ability', 'Legacy Star', { sourceEffect: 'Legacy Star' }), { observation: used }), 0);
});

test('Budew retreats to a ready Regidrago line when Latias provides free retreat', () => {
  const obs = observation({ active: budew, bench: [regidragoVstar, latias, null, null, null] });
  assert.equal(scoreAction(item('retreat', 'retreat', 'Retreat'), { observation: obs }), 145);
});

test('Prime Catcher prioritizes a visible Mimikyu or Clefairy threat', () => {
  const obs = observation({ opponentBench: [pokemon('Mimikyu GRI 58', { hp: 70, types: ['Psychic'] }), null, null, null, null] });
  assert.equal(scoreAction(item('prime', 'play-card', 'Prime Catcher TEF 157'), { observation: obs }), 230);
});

test('Apex Dragon attack prompt delegates to the tested choice evaluator', () => {
  const obs = observation({ active: regidragoVstar, opponentActive: pokemon('Shadow Rider Calyrex VMAX CRE 75', { hp: 320, subtypes: ['VMAX'], types: ['Psychic'] }) });
  const prompt = {
    promptType: 'ChooseAttackPrompt',
    source: { effectName: 'Apex Dragon' },
    publicMetadata: {},
    choices: [
      { token: 'k', label: 'Kaiser Tackle', publicMetadata: { sourceAttack: 'Kaiser Tackle' } },
      { token: 't', label: 'Timeless-GX', publicMetadata: { sourceAttack: 'Timeless-GX' } }
    ]
  };
  assert.deepEqual(promptDecision(request(obs, [], prompt)), { kind: 'select-choice', token: 't' });
});

test('Battle Compressor selects distinct, un-discarded Dragon payloads', () => {
  const obs = observation({ discard: [] });
  const prompt = {
    promptType: 'ChooseCardsPrompt', source: { effectName: 'Battle Compressor' },
    publicMetadata: { selectionType: 'card-combination', minimumCount: 3, maximumCount: 3 },
    choices: [
      choice('d', 'Dialga-GX UPR 100'), choice('p', 'Dragapult ex TWM 130'),
      choice('k', 'Koraidon ex TEF 120'), choice('g', 'Hisuian Goodra VSTAR LOR 136')
    ]
  };
  const result = promptDecision(request(obs, [], prompt));
  assert.equal(result.kind, 'select-choices');
  assert.deepEqual(result.tokens, ['d', 'p', 'k']);
});

test('Prime Catcher selects Mimikyu over Clefairy when both are visible', () => {
  const obs = observation({
    opponentBench: [
      pokemon("Lillie's Clefairy ex JTG 56", { hp: 190, subtypes: ['Basic', 'ex'], types: ['Psychic'] }),
      pokemon('Mimikyu GRI 58', { hp: 70, types: ['Psychic'] }), null, null, null
    ]
  });
  const prompt = {
    promptType: 'ChoosePokemonPrompt', source: { effectName: 'Prime Catcher' },
    publicMetadata: { selectionType: 'pokemon', minimumCount: 1, maximumCount: 1 },
    choices: [
      choice('clefairy', "Lillie's Clefairy ex JTG 56"),
      choice('mimikyu', 'Mimikyu GRI 58')
    ]
  };
  assert.deepEqual(promptDecision(request(obs, [], prompt)), { kind: 'select-choices', tokens: ['mimikyu'] });
});

test('Prime Catcher own-switch prompt selects a ready Regidrago VSTAR', () => {
  const obs = observation({
    active: budew,
    bench: [regidragoVstar, latias, null, null, null]
  });
  const prompt = {
    promptType: 'ChoosePokemonPrompt', source: { effectName: 'Prime Catcher' },
    publicMetadata: { selectionType: 'pokemon', minimumCount: 1, maximumCount: 1 },
    choices: [
      choice('latias', 'Latias ex SSP 76', { targetSeat: 0, targetZone: 'bench', targetIndex: 1 }),
      choice('regidrago', 'Regidrago VSTAR SIT 136', { targetSeat: 0, targetZone: 'bench', targetIndex: 0 })
    ]
  };
  assert.deepEqual(promptDecision(request(obs, [], prompt)), { kind: 'select-choices', tokens: ['regidrago'] });
});

test('Dragon Laser Bench prompt prefers a visible Mimikyu target', () => {
  const obs = observation({ opponentBench: [pokemon('Mimikyu GRI 58', { hp: 70, types: ['Psychic'] })] });
  const prompt = {
    promptType: 'ChoosePokemonPrompt', source: { effectName: 'Dragon Laser' },
    publicMetadata: { selectionType: 'pokemon', minimumCount: 1, maximumCount: 1 },
    choices: [choice('mimikyu', 'Mimikyu GRI 58', { targetSeat: 1, targetZone: 'bench', targetIndex: 0 })]
  };
  assert.deepEqual(promptDecision(request(obs, [], prompt)), { kind: 'select-choices', tokens: ['mimikyu'] });
});

test('Phantom Dive damage-counter distribution fails closed until native allocation is implemented', () => {
  const obs = observation();
  const prompt = {
    promptType: 'ChoosePokemonPrompt', source: { effectName: 'Phantom Dive' },
    publicMetadata: { selectionType: 'pokemon', minimumCount: 1, maximumCount: 6 },
    choices: [choice('one', 'Mimikyu GRI 58')]
  };
  assert.deepEqual(promptDecision(request(obs, [], prompt)), {
    kind: 'abstain', reasonCode: 'PHANTOM_DIVE_COUNTER_ALLOCATION_UNSUPPORTED'
  });
});

test('Quick Ball discard-cost prompt discards a payload already in the discard pile', () => {
  const obs = observation({ discard: ['Dragapult ex TWM 130'] });
  const prompt = {
    promptType: 'ChooseCardsPrompt', source: { effectName: 'Quick Ball discard a card from your hand' },
    publicMetadata: { selectionType: 'card-combination', minimumCount: 1, maximumCount: 1 },
    choices: [choice('energy', 'Double Dragon Energy ROS 97'), choice('payload', 'Dragapult ex TWM 130')]
  };
  assert.deepEqual(promptDecision(request(obs, [], prompt)), { kind: 'select-choices', tokens: ['payload'] });
});

test('Quick Ball search prompt finds Regidrago V when the board has none', () => {
  const obs = observation();
  const prompt = {
    promptType: 'ChooseCardsPrompt', source: { effectName: 'Quick Ball search your deck' },
    publicMetadata: { selectionType: 'card-combination', minimumCount: 1, maximumCount: 1 },
    choices: [choice('budew', 'Budew ASC 16'), choice('regidrago', 'Regidrago V SIT 135')]
  };
  assert.deepEqual(promptDecision(request(obs, [], prompt)), { kind: 'select-choices', tokens: ['regidrago'] });
});

test('Parallel City option chooses the opponent Bench cap', () => {
  const obs = observation();
  const prompt = {
    promptType: 'SelectOptionPrompt', source: { effectName: 'Parallel City' },
    publicMetadata: {},
    choices: [
      { token: 'bench', label: "Your opponent's Bench can't have more than 3 Pokémon" },
      { token: 'damage', label: 'Damage from Grass, Fire, and Water Pokémon is reduced by 20' }
    ]
  };
  assert.deepEqual(promptDecision(request(obs, [], prompt)), { kind: 'select-choice', token: 'bench' });
});

test('Wonder Tag selects a gust Supporter when Mimikyu is exposed', () => {
  const obs = observation({ opponentBench: [pokemon('Mimikyu GRI 58', { hp: 70, types: ['Psychic'] })] });
  const prompt = {
    promptType: 'ChooseCardsPrompt', source: { effectName: 'Wonder Tag' },
    publicMetadata: { selectionType: 'card-combination', minimumCount: 1, maximumCount: 1 },
    choices: [choice('research', "Professor's Research BRS 147"), choice('guzma', 'Guzma BUS 115')]
  };
  assert.deepEqual(promptDecision(request(obs, [], prompt)), { kind: 'select-choices', tokens: ['guzma'] });
});

test('Super Rod recovers Pokémon and Basic Energy only', () => {
  const obs = observation();
  const prompt = {
    promptType: 'ChooseCardsPrompt', source: { effectName: 'Super Rod' },
    publicMetadata: { selectionType: 'card-combination', minimumCount: 2, maximumCount: 3 },
    choices: [choice('energy', 'Grass Energy MEE 1'), choice('payload', 'Dragapult ex TWM 130'), choice('filler', 'Budew ASC 16')]
  };
  assert.deepEqual(promptDecision(request(obs, [], prompt)), { kind: 'select-choices', tokens: ['energy', 'payload', 'filler'] });
});

test('unsupported prompts abstain rather than guessing', () => {
  const obs = observation();
  const prompt = { promptType: 'UnknownPrompt', source: {}, publicMetadata: {}, choices: [] };
  assert.deepEqual(promptDecision(request(obs, [], prompt)), { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' });
});

test('no positive action falls back to a legal pass', () => {
  const obs = observation();
  assert.deepEqual(bestAction(request(obs, [item('pass', 'pass', 'Pass')])), { kind: 'select-action', token: 'pass' });
});
