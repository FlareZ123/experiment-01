'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  POLICY_VERSION,
  createPolicy,
  promptDecision
} = require('../../simulation/evaluation/2026-11/agent43-rank10-regidrago-opponent-policy.cjs');

function pokemon(printing, options = {}) {
  return {
    printing,
    hp: options.hp ?? 280,
    damage: options.damage ?? 0,
    printed: { subtypes: options.subtypes ?? ['Basic'], types: options.types ?? ['Dragon'] },
    energies: options.energies ?? [],
    tools: options.tools ?? []
  };
}

function observation(options = {}) {
  return {
    actorSeat: 0,
    ownHand: [],
    ownPublic: {
      active: options.active ?? pokemon('Regidrago VSTAR SIT 136', { hp: 280, subtypes: ['VSTAR'] }),
      bench: [],
      discard: [],
      stadium: [],
      deckCount: 40,
      publicTurnRestrictions: { vstarUsed: false, gxUsed: false },
      prizeCount: options.ownPrizeCount ?? 6
    },
    opponentPublic: {
      active: options.opponentActive ?? pokemon('Shadow Rider Calyrex VMAX CRE 75', {
        hp: 200, subtypes: ['VMAX'], types: ['Psychic']
      }),
      bench: options.opponentBench ?? [],
      discard: [],
      stadium: [],
      publicRestrictions: {},
      prizeCount: 6
    }
  };
}

function workerRequest(obs, prompt) {
  return { role: 'opponent', seat: 0, observation: obs, prompt };
}

function policy(config = {}) {
  return createPolicy({ role: 'opponent', seat: 0, policyVersion: POLICY_VERSION, config });
}

test('policy v3 defaults to disabling Phantom Dive until host allocation projection is enabled', () => {
  const obs = observation({
    opponentBench: [pokemon('Mimikyu GRI 58', { hp: 70 })]
  });
  const prompt = {
    promptType: 'PutDamagePrompt',
    source: { effectName: 'Phantom Dive', sourcePrinting: 'Dragapult ex TWM 130' },
    publicMetadata: {},
    choices: [{ token: 'only', kind: 'allocation', label: 'PD1|b0=60' }]
  };
  assert.deepEqual(policy({}).decide(workerRequest(obs, prompt)), {
    kind: 'abstain', reasonCode: 'PHANTOM_DIVE_ALLOCATION_DISABLED'
  });
});

test('complete-allocation token mode chooses the best Prize allocation from a PutDamagePrompt', () => {
  const obs = observation({
    ownPrizeCount: 3,
    opponentBench: [
      pokemon('Mimikyu GRI 58', { hp: 70 }),
      pokemon('Shadow Rider Calyrex VMAX CRE 75', { hp: 320, damage: 260, subtypes: ['VMAX'] })
    ]
  });
  const prompt = {
    promptType: 'PutDamagePrompt',
    source: { effectName: 'Phantom Dive', sourcePrinting: 'Dragapult ex TWM 130' },
    publicMetadata: {},
    choices: [
      { token: 'mimikyu', kind: 'allocation', label: 'PD1|b0=60' },
      { token: 'vmax', kind: 'allocation', label: 'PD1|b1=60' }
    ]
  };
  assert.deepEqual(policy({ phantomDiveAllocation: 'complete-choice-token-v1' })
    .decide(workerRequest(obs, prompt)), { kind: 'select-choice', token: 'vmax' });
});

test('Apex attack prompt filters Phantom Dive unless complete allocation mode is enabled', () => {
  const obs = observation({
    ownPrizeCount: 3,
    opponentActive: pokemon('Shadow Rider Calyrex VMAX CRE 75', {
      hp: 200, subtypes: ['VMAX'], types: ['Psychic']
    }),
    opponentBench: [
      pokemon('Shadow Rider Calyrex VMAX CRE 75', { hp: 320, damage: 260, subtypes: ['VMAX'] })
    ]
  });
  const prompt = {
    promptType: 'ChooseAttackPrompt',
    source: { effectName: 'Apex Dragon', sourcePrinting: 'Regidrago VSTAR SIT 136' },
    publicMetadata: {},
    choices: [
      { token: 'phantom', kind: 'attack', label: 'Phantom Dive', publicMetadata: { sourceAttack: 'Phantom Dive' } },
      { token: 'timeless', kind: 'attack', label: 'Timeless-GX', publicMetadata: { sourceAttack: 'Timeless-GX' } }
    ]
  };
  assert.deepEqual(policy({}).decide(workerRequest(obs, prompt)), {
    kind: 'select-choice', token: 'timeless'
  });
  assert.deepEqual(policy({ phantomDiveAllocation: 'complete-choice-token-v1' })
    .decide(workerRequest(obs, prompt)), { kind: 'select-choice', token: 'phantom' });
});

test('policy rejects unrecognized allocation modes and unrelated config keys', () => {
  assert.throws(() => policy({ phantomDiveAllocation: true }), /AGENT43_POLICY_INIT_MISMATCH/);
  assert.throws(() => policy({ phantomDiveAllocation: 'native-magic' }), /AGENT43_POLICY_INIT_MISMATCH/);
  assert.throws(() => policy({ secondRunner: true }), /AGENT43_POLICY_INIT_MISMATCH/);
});

test('PutDamagePrompt from another effect fails closed instead of borrowing Phantom Dive policy', () => {
  const obs = observation({ opponentBench: [pokemon('Mimikyu GRI 58', { hp: 70 })] });
  const prompt = {
    promptType: 'PutDamagePrompt',
    source: { effectName: 'Unrecognized damage effect', sourcePrinting: 'Unknown card' },
    publicMetadata: {},
    choices: [{ token: 'one', kind: 'allocation', label: 'PD1|b0=60' }]
  };
  assert.deepEqual(promptDecision(workerRequest(obs, prompt), {
    allowPhantomDiveAllocation: true
  }), { kind: 'abstain', reasonCode: 'UNSUPPORTED_PUT_DAMAGE_PROMPT' });
});
