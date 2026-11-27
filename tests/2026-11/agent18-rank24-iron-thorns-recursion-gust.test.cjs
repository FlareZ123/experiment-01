'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  POLICY_VERSION,
  createPolicy
} = require('../../simulation/evaluation/2026-11/agent18-rank24-iron-thorns-opponent-policy.cjs');

function mon(printing = 'Iron Thorns ex TWM 77', options = {}) {
  return {
    printing,
    hp: options.hp ?? (/Iron Thorns/.test(printing) ? 230 : 200),
    damage: options.damage ?? 0,
    energies: options.energies ?? [],
    tools: options.tools ?? [],
    printed: { types: options.types ?? (/Iron Thorns/.test(printing) ? ['Lightning'] : ['Colorless']) },
    specialConditions: []
  };
}
function observation(options = {}) {
  return {
    actorSeat: 0,
    ownHand: options.ownHand ?? [],
    ownPublic: {
      active: mon(),
      bench: options.ownBench ?? [],
      stadium: options.ownStadium ?? [],
      discard: options.ownDiscard ?? [],
      deckCount: 30,
      prizeCount: 6,
      publicTurnRestrictions: {
        supporterPlayLocked: false, itemPlayLocked: false, energyPlayLocked: false,
        specialEnergyPlayLocked: false, stadiumPlayLocked: false, toolPlayLocked: false
      }
    },
    opponentPublic: {
      active: options.opponentActive ?? mon('Target ex ABC 1'),
      bench: options.opponentBench ?? [],
      stadium: [],
      deckCount: options.opponentDeck ?? 20,
      handCount: options.opponentHand ?? 4,
      prizeCount: options.opponentPrizes ?? 6
    },
    ownTurnResources: {
      supporterPlayedTurn: 0, itemPlayLocked: false, energyPlayedTurn: false,
      energyPlayLocked: false, specialEnergyPlayLocked: false,
      stadiumPlayedTurn: false, stadiumPlayLocked: false, toolPlayLocked: false
    },
    ownerK1: options.ownerK1 ?? null
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
function prompt({ sourcePrinting, effectName, promptType, choices, publicMetadata, observationOptions = {} }) {
  return {
    role: 'opponent', seat: 0,
    prompt: {
      promptType,
      source: { sourcePrinting, effectName: effectName ?? sourcePrinting },
      choices,
      publicMetadata
    },
    observation: observation(observationOptions),
    publicEventReceipt: null,
    actionFrontier: { items: [] }
  };
}
const policy = createPolicy({
  role: 'opponent', seat: 0, policyVersion: POLICY_VERSION, config: {}
});
const pass = { token: 'pass', kind: 'pass' };

test('Gladion starts only when K1 identifies an important prized card', () => {
  const g = { token: 'g', kind: 'play-card', actorPrinting: 'Gladion CIN 95' };
  const ownerK1 = {
    epoch: 1, exactMembershipKnown: true,
    knownPrintings: [{ printing: 'Thunder Mountain ♢ LOT 191', copies: 1 }],
    invalidationReason: null
  };
  assert.deepEqual(policy.decide(root({
    ownHand: ['Gladion CIN 95'], ownerK1, items: [g, pass]
  })), { kind: 'select-action', token: 'g' });

  assert.deepEqual(policy.decide(root({
    ownHand: ['Gladion CIN 95'], items: [g, pass]
  })), { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ROOT_ACTION' });
});

test('Gladion prize prompt takes the highest-valued revealed prize', () => {
  const req = prompt({
    sourcePrinting: 'Gladion CIN 95',
    effectName: 'Gladion',
    promptType: 'ChoosePrizePrompt',
    choices: [
      { token: 'p0', kind: 'prize', printing: 'Palace Book SMP NAN25', label: 'Palace Book' },
      { token: 'p1', kind: 'prize', printing: 'Thunder Mountain ♢ LOT 191', label: 'Thunder Mountain' }
    ],
    publicMetadata: {
      selectionType: 'prize-slots', requiredCount: 1, allowCancel: false, isSecret: false
    }
  });
  assert.deepEqual(policy.decide(req), { kind: 'select-choices', tokens: ['p1'] });
});

test('VS Seeker recovers the best useful Supporter outside terminal mill states', () => {
  const vs = { token: 'vs', kind: 'play-card', actorPrinting: 'VS Seeker PHF 109' };
  assert.deepEqual(policy.decide(root({
    ownHand: ['VS Seeker PHF 109'],
    ownDiscard: ['Eri TEF 146', 'Plumeria BUS 120'],
    opponentActive: mon('Target ex ABC 1', { energies: ['Double Colorless Energy SUM 136'] }),
    items: [vs, pass]
  })), { kind: 'select-action', token: 'vs' });

  const req = prompt({
    sourcePrinting: 'VS Seeker PHF 109', effectName: 'VS Seeker',
    promptType: 'ChooseCardsPrompt',
    choices: [
      {
        token: 'eri', kind: 'card', printing: 'Eri TEF 146', label: 'Eri',
        publicMetadata: { ownerSeat: 'actor', sourceZone: 'discard' }
      },
      {
        token: 'plume', kind: 'card', printing: 'Plumeria BUS 120', label: 'Plumeria',
        publicMetadata: { ownerSeat: 'actor', sourceZone: 'discard' }
      }
    ],
    publicMetadata: {
      selectionType: 'card-combination', minimumCount: 1, maximumCount: 1
    },
    observationOptions: {
      opponentActive: mon('Target ex ABC 1', { energies: ['Double Colorless Energy SUM 136'] })
    }
  });
  assert.deepEqual(policy.decide(req), { kind: 'select-choices', tokens: ['plume'] });
});

test('Lusamine starts when a high-value Supporter or Stadium is recoverable', () => {
  const l = { token: 'l', kind: 'play-card', actorPrinting: 'Lusamine CIN 96' };
  assert.deepEqual(policy.decide(root({
    ownHand: ['Lusamine CIN 96'],
    ownDiscard: ['Plumeria BUS 120', 'Thunder Mountain ♢ LOT 191'],
    opponentActive: mon('Target ex ABC 1', { energies: ['Double Colorless Energy SUM 136'] }),
    items: [l, pass]
  })), { kind: 'select-action', token: 'l' });
});

test('Lusamine prompt prioritizes the highest-value recoverable pair', () => {
  const req = prompt({
    sourcePrinting: 'Lusamine CIN 96',
    effectName: 'Lusamine',
    promptType: 'ChooseCardsPrompt',
    choices: [
      {
        token: 'eri', kind: 'card', printing: 'Eri TEF 146', label: 'Eri',
        publicMetadata: { ownerSeat: 'actor', sourceZone: 'discard' }
      },
      {
        token: 'plume', kind: 'card', printing: 'Plumeria BUS 120', label: 'Plumeria',
        publicMetadata: { ownerSeat: 'actor', sourceZone: 'discard' }
      },
      {
        token: 'thunder', kind: 'card', printing: 'Thunder Mountain ♢ LOT 191', label: 'Thunder',
        publicMetadata: { ownerSeat: 'actor', sourceZone: 'discard' }
      }
    ],
    publicMetadata: {
      selectionType: 'card-combination', minimumCount: 2, maximumCount: 2
    },
    observationOptions: {
      opponentActive: mon('Target ex ABC 1', { energies: ['Double Colorless Energy SUM 136'] })
    }
  });
  assert.deepEqual(policy.decide(req),
    { kind: 'select-choices', tokens: ['plume', 'thunder'] });
});

test('Cynthia & Caitlin uses draw option only when it has a disposable card', () => {
  const req = prompt({
    sourcePrinting: 'Cynthia & Caitlin CEC 189',
    effectName: 'Cynthia & Caitlin',
    promptType: 'SelectOptionPrompt',
    choices: [
      { token: 'recover', kind: 'option', label: 'Put a Supporter card from your discard pile into your hand.' },
      { token: 'draw', kind: 'option', label: 'Put a Supporter card from your discard pile into your hand, and discard another card from your hand to draw 3 cards.' },
      { token: 'cancel', kind: 'cancel', label: 'Cancel' }
    ],
    publicMetadata: { selectionType: 'option' },
    observationOptions: {
      ownHand: ['Cynthia & Caitlin CEC 189', "Player's Ceremony SP 127"]
    }
  });
  assert.deepEqual(policy.decide(req), { kind: 'select-choice', token: 'draw' });
});

test('Guzma starts only with a funded own bench and a useful gust target', () => {
  const g = { token: 'g', kind: 'play-card', actorPrinting: 'Guzma BUS 115' };
  const funded = mon('Iron Thorns ex TWM 77', {
    energies: ['Speed Lightning Energy RCL 173', 'Double Colorless Energy SUM 136']
  });
  const target = mon('Target ex ABC 1', { hp: 120 });
  assert.deepEqual(policy.decide(root({
    ownHand: ['Guzma BUS 115'], ownBench: [funded],
    opponentBench: [target], items: [g, pass]
  })), { kind: 'select-action', token: 'g' });

  assert.deepEqual(policy.decide(root({
    ownHand: ['Guzma BUS 115'], ownBench: [mon('Iron Thorns ex TWM 77')],
    opponentBench: [target], items: [g, pass]
  })), { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ROOT_ACTION' });
});

test('Guzma prompt chooses lowest-HP opponent bench, then funded own bench', () => {
  const oppReq = prompt({
    sourcePrinting: 'Guzma BUS 115', effectName: 'Guzma',
    promptType: 'ChoosePokemonPrompt',
    choices: [
      {
        token: 'opp0', kind: 'pokemon', printing: 'A', label: 'A',
        publicMetadata: { ownerSeat: 'opponent', targetZone: 'bench', benchIndex: 0 }
      },
      {
        token: 'opp1', kind: 'pokemon', printing: 'B', label: 'B',
        publicMetadata: { ownerSeat: 'opponent', targetZone: 'bench', benchIndex: 1 }
      }
    ],
    publicMetadata: {
      selectionType: 'pokemon', minimumCount: 1, maximumCount: 1
    },
    observationOptions: {
      opponentBench: [
        mon('A', { hp: 200, damage: 20 }),
        mon('B', { hp: 150, damage: 30 })
      ]
    }
  });
  assert.deepEqual(policy.decide(oppReq), { kind: 'select-choices', tokens: ['opp1'] });

  const ownReq = prompt({
    sourcePrinting: 'Guzma BUS 115', effectName: 'Guzma',
    promptType: 'ChoosePokemonPrompt',
    choices: [
      {
        token: 'own0', kind: 'pokemon', printing: 'Iron Thorns ex TWM 77', label: '0',
        publicMetadata: { ownerSeat: 'actor', targetZone: 'bench', benchIndex: 0 }
      },
      {
        token: 'own1', kind: 'pokemon', printing: 'Iron Thorns ex TWM 77', label: '1',
        publicMetadata: { ownerSeat: 'actor', targetZone: 'bench', benchIndex: 1 }
      }
    ],
    publicMetadata: {
      selectionType: 'pokemon', minimumCount: 1, maximumCount: 1
    },
    observationOptions: {
      ownBench: [
        mon('Iron Thorns ex TWM 77'),
        mon('Iron Thorns ex TWM 77', {
          energies: ['Speed Lightning Energy RCL 173', 'Double Colorless Energy SUM 136']
        })
      ]
    }
  });
  assert.deepEqual(policy.decide(ownReq), { kind: 'select-choices', tokens: ['own1'] });
});

test('Handheld Fan reactive prompt moves DCE before single-unit Energy', () => {
  const req = prompt({
    sourcePrinting: 'Handheld Fan TWM 150', effectName: 'Handheld Fan',
    promptType: 'AttachEnergyPrompt',
    choices: [
      {
        token: 'speed', kind: 'energy', printing: 'Speed Lightning Energy RCL 173', label: 'Speed',
        publicMetadata: { ownerSeat: 'opponent', sourceZone: 'active', targetZone: 'bench', benchIndex: 0, energyType: 'Special' }
      },
      {
        token: 'dce', kind: 'energy', printing: 'Double Colorless Energy SUM 136', label: 'DCE',
        publicMetadata: { ownerSeat: 'opponent', sourceZone: 'active', targetZone: 'bench', benchIndex: 0, energyType: 'Special' }
      }
    ],
    publicMetadata: { selectionType: 'energy-attachment' },
    observationOptions: { opponentBench: [mon('Target B')] }
  });
  assert.deepEqual(policy.decide(req), { kind: 'select-choice', token: 'dce' });
});

test('Palace Book is a late safe draw line only when no Volt Cyclone is available', () => {
  const book = { token: 'book', kind: 'play-card', actorPrinting: 'Palace Book SMP NAN25' };
  assert.deepEqual(policy.decide(root({
    ownHand: ['Palace Book SMP NAN25'], items: [book, pass]
  })), { kind: 'select-action', token: 'book' });
  const attack = { token: 'volt', kind: 'attack', actorPrinting: 'Iron Thorns ex TWM 77', attackName: 'Volt Cyclone' };
  assert.deepEqual(policy.decide(root({
    ownHand: ['Palace Book SMP NAN25'], items: [book, attack, pass]
  })), { kind: 'select-action', token: 'volt' });
});
