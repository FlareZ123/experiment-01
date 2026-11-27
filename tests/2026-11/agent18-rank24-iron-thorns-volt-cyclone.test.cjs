'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  POLICY_VERSION,
  createPolicy
} = require('../../simulation/evaluation/2026-11/agent18-rank24-iron-thorns-opponent-policy.cjs');

function mon(printing, { hp = 230, damage = 0, energies = [] } = {}) {
  return {
    printing, hp, damage, energies, tools: [],
    printed: { types: /Iron Thorns/.test(printing) ? ['Lightning'] : ['Colorless'] },
    specialConditions: []
  };
}
function observation(options = {}) {
  return {
    actorSeat: 0,
    ownHand: [],
    ownPublic: {
      active: mon('Iron Thorns ex TWM 77', { energies: options.ownEnergies ?? [] }),
      bench: options.ownBench ?? [],
      stadium: [], discard: [], deckCount: 30,
      publicTurnRestrictions: {
        supporterPlayLocked: false, itemPlayLocked: false, energyPlayLocked: false,
        specialEnergyPlayLocked: false, stadiumPlayLocked: false, toolPlayLocked: false
      }
    },
    opponentPublic: {
      active: options.opponentActive ?? mon('Target ex ABC 1', { hp: 300 }),
      bench: [], stadium: [], deckCount: 20, handCount: 4, prizeCount: 6
    },
    ownTurnResources: {
      supporterPlayedTurn: 0, itemPlayLocked: false, energyPlayedTurn: false,
      energyPlayLocked: false, specialEnergyPlayLocked: false,
      stadiumPlayedTurn: false, stadiumPlayLocked: false, toolPlayLocked: false
    }
  };
}
function root(options = {}) {
  return {
    role: 'opponent', seat: 0, prompt: null,
    observation: observation(options),
    publicEventReceipt: { opponentLastTurnAttacks: [] },
    actionFrontier: { items: options.items ?? [] }
  };
}
const policy = createPolicy({
  role: 'opponent', seat: 0, policyVersion: POLICY_VERSION, config: {}
});
const attack = {
  token: 'volt', kind: 'attack',
  actorPrinting: 'Iron Thorns ex TWM 77',
  attackName: 'Volt Cyclone'
};
const pass = { token: 'pass', kind: 'pass' };

test('retreat pivots only to a funded bench when the Active cannot attack', () => {
  const retreat = {
    token: 'retreat1', kind: 'retreat',
    actorPrinting: 'Iron Thorns ex TWM 77',
    targetPrinting: 'Iron Thorns ex TWM 77',
    publicMetadata: { benchIndex: 0, targetIndex: 0 }
  };
  const funded = mon('Iron Thorns ex TWM 77', {
    energies: ['Speed Lightning Energy RCL 173', 'Double Colorless Energy SUM 136']
  });
  assert.deepEqual(policy.decide(root({
    ownBench: [funded],
    items: [retreat, pass]
  })), { kind: 'select-action', token: 'retreat1' });

  assert.deepEqual(policy.decide(root({
    ownBench: [mon('Iron Thorns ex TWM 77')],
    items: [retreat, pass]
  })), { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ROOT_ACTION' });
});

test('certified final-Prize Volt Cyclone overrides Megaton Blower', () => {
  const terminalAttack = {
    token: 'terminal-volt', kind: 'attack',
    actorPrinting: 'Iron Thorns ex TWM 77',
    attackName: 'Volt Cyclone',
    publicMetadata: {
      prizeLiability: 2,
      hasPrevention: false,
      hasUnmodeledModifier: false,
      attackCostPayable: true,
      isLegal: true,
      damage: 140
    }
  };
  const megaton = { token: 'meg', kind: 'play-card', actorPrinting: 'Megaton Blower SSP 182' };
  const request = root({
    opponentActive: mon('Target ex ABC 1', {
      hp: 200, damage: 70,
      energies: ['Double Colorless Energy SUM 136'],
      tools: ['Float Stone BKT 137']
    }),
    items: [megaton, terminalAttack, pass]
  });
  request.observation.ownPublic.prizeCount = 2;
  assert.deepEqual(policy.decide(request),
    { kind: 'select-action', token: 'terminal-volt' });
});

test('terminal attack layer fails closed without liability proof or with prevention/Legacy Energy', () => {
  const megaton = { token: 'meg', kind: 'play-card', actorPrinting: 'Megaton Blower SSP 182' };
  const baseMeta = {
    prizeLiability: 2, hasPrevention: false, hasUnmodeledModifier: false,
    attackCostPayable: true, isLegal: true, damage: 140
  };
  for (const variant of [
    { meta: { ...baseMeta, prizeLiability: undefined }, energies: ['Double Colorless Energy SUM 136'] },
    { meta: { ...baseMeta, hasPrevention: true }, energies: ['Double Colorless Energy SUM 136'] },
    { meta: baseMeta, energies: ['Legacy Energy TWM 167'] }
  ]) {
    const attack = {
      token: 'terminal-volt', kind: 'attack',
      actorPrinting: 'Iron Thorns ex TWM 77',
      attackName: 'Volt Cyclone',
      publicMetadata: variant.meta
    };
    const request = root({
      opponentActive: mon('Target ex ABC 1', {
        hp: 200, damage: 70, energies: variant.energies,
        tools: ['Float Stone BKT 137']
      }),
      items: [megaton, attack, pass]
    });
    request.observation.ownPublic.prizeCount = 2;
    assert.deepEqual(policy.decide(request), { kind: 'select-action', token: 'meg' });
  }
});

test('Volt Cyclone is selected when it is the best remaining executable action', () => {
  assert.deepEqual(policy.decide(root({ items: [attack, pass] })),
    { kind: 'select-action', token: 'volt' });
});

test('Volt Cyclone KO outranks ordinary setup funding', () => {
  const speed = {
    token: 'speed', kind: 'play-card',
    actorPrinting: 'Speed Lightning Energy RCL 173',
    targetPrinting: 'Iron Thorns ex TWM 77'
  };
  assert.deepEqual(policy.decide(root({
    opponentActive: mon('Target ex ABC 1', { hp: 150, damage: 20 }),
    items: [speed, attack, pass]
  })), { kind: 'select-action', token: 'volt' });
});

test('non-KO Volt Cyclone waits behind setup actions', () => {
  const tag = {
    token: 'tag', kind: 'play-card',
    actorPrinting: 'Tag Call CEC 206'
  };
  assert.deepEqual(policy.decide(root({ items: [tag, attack, pass] })),
    { kind: 'select-action', token: 'tag' });
});

test('Volt Cyclone transfer prefers Capture, then Speed, over DCE', () => {
  const request = {
    role: 'opponent', seat: 0,
    prompt: {
      promptType: 'AttachEnergyPrompt',
      source: {
        sourcePrinting: 'Iron Thorns ex TWM 77',
        effectName: 'Volt Cyclone'
      },
      choices: [
        {
          token: 'dce', kind: 'energy', printing: 'Double Colorless Energy SUM 136',
          publicMetadata: { benchIndex: 0 }
        },
        {
          token: 'speed', kind: 'energy', printing: 'Speed Lightning Energy RCL 173',
          publicMetadata: { benchIndex: 0 }
        },
        {
          token: 'capture', kind: 'energy', printing: 'Capture Energy RCL 171',
          publicMetadata: { benchIndex: 0 }
        }
      ],
      publicMetadata: { selectionType: 'energy-attachment' }
    },
    observation: observation({
      ownBench: [mon('Iron Thorns ex TWM 77')]
    }),
    publicEventReceipt: null,
    actionFrontier: { items: [] }
  };
  assert.deepEqual(policy.decide(request),
    { kind: 'select-choice', token: 'capture' });
});

test('Volt Cyclone tie goes to the less-funded bench target', () => {
  const request = {
    role: 'opponent', seat: 0,
    prompt: {
      promptType: 'AttachEnergyPrompt',
      source: {
        sourcePrinting: 'Iron Thorns ex TWM 77',
        sourceAttack: 'Volt Cyclone',
        effectName: 'Volt Cyclone'
      },
      choices: [
        {
          token: 'speed0', kind: 'energy', printing: 'Speed Lightning Energy RCL 173',
          publicMetadata: { benchIndex: 0 }
        },
        {
          token: 'speed1', kind: 'energy', printing: 'Speed Lightning Energy RCL 173',
          publicMetadata: { benchIndex: 1 }
        }
      ],
      publicMetadata: { selectionType: 'energy-attachment' }
    },
    observation: observation({
      ownBench: [
        mon('Iron Thorns ex TWM 77', { energies: ['Capture Energy RCL 171'] }),
        mon('Iron Thorns ex TWM 77')
      ]
    }),
    publicEventReceipt: null,
    actionFrontier: { items: [] }
  };
  assert.deepEqual(policy.decide(request),
    { kind: 'select-choice', token: 'speed1' });
});
