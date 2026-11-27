'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  POLICY_VERSION,
  createPolicy
} = require('../../simulation/evaluation/2026-11/agent18-rank24-iron-thorns-opponent-policy.cjs');

function mon({ printing = 'Iron Thorns ex TWM 77', energies = [], tools = [], types = ['Lightning'] } = {}) {
  return { printing, energies, tools, printed: { types }, specialConditions: [] };
}
function observation(options = {}) {
  return {
    actorSeat: 0,
    ownHand: options.ownHand ?? [],
    ownPublic: {
      active: mon({ energies: options.ownEnergies ?? [], tools: options.ownTools ?? [] }),
      bench: [],
      stadium: options.ownStadium ?? [],
      discard: [],
      deckCount: options.ownDeck ?? 30,
      publicTurnRestrictions: {
        supporterPlayLocked: false, itemPlayLocked: false, energyPlayLocked: false,
        specialEnergyPlayLocked: false, stadiumPlayLocked: false, toolPlayLocked: false
      }
    },
    opponentPublic: {
      active: options.opponentActive ?? null,
      stadium: options.opponentStadium ?? [],
      deckCount: options.opponentDeck ?? 20,
      handCount: options.opponentHand ?? 4,
      prizeCount: options.opponentPrizes ?? 6
    },
    ownTurnResources: {
      supporterPlayedTurn: options.supporterPlayedTurn ?? 0,
      itemPlayLocked: options.itemPlayLocked ?? false,
      energyPlayedTurn: options.energyPlayedTurn ?? false,
      energyPlayLocked: false,
      specialEnergyPlayLocked: options.specialEnergyPlayLocked ?? false,
      stadiumPlayedTurn: false,
      stadiumPlayLocked: false,
      toolPlayLocked: false
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
function prompt({ sourcePrinting, promptType, choices, publicMetadata, observationOptions = {} }) {
  return {
    role: 'opponent', seat: 0,
    prompt: {
      promptType,
      source: { sourcePrinting, effectName: null },
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
const speed = {
  token: 'speed', kind: 'play-card',
  actorPrinting: 'Speed Lightning Energy RCL 173',
  targetPrinting: 'Iron Thorns ex TWM 77'
};
const dce = {
  token: 'dce', kind: 'play-card',
  actorPrinting: 'Double Colorless Energy SUM 136',
  targetPrinting: 'Iron Thorns ex TWM 77'
};
const thunder = {
  token: 'thunder', kind: 'play-card',
  actorPrinting: 'Thunder Mountain ♢ LOT 191'
};
const jammer = {
  token: 'jammer', kind: 'play-card',
  actorPrinting: 'Tool Jammer BST 136',
  targetPrinting: 'Iron Thorns ex TWM 77'
};
const tag = { token: 'tag', kind: 'play-card', actorPrinting: 'Tag Call CEC 206' };
const gh = { token: 'gh', kind: 'play-card', actorPrinting: 'Guzma & Hala CEC 193' };

test('Speed Lightning outranks DCE funding', () => {
  const request = root({
    ownHand: ['Speed Lightning Energy RCL 173', 'Double Colorless Energy SUM 136'],
    items: [speed, dce, pass]
  });
  assert.deepEqual(policy.decide(request), { kind: 'select-action', token: 'speed' });
});

test('DCE funds when Speed is unavailable', () => {
  const request = root({
    ownHand: ['Double Colorless Energy SUM 136'],
    items: [dce, pass]
  });
  assert.deepEqual(policy.decide(request), { kind: 'select-action', token: 'dce' });
});

test('special-energy lock suppresses energy funding', () => {
  const request = root({
    ownHand: ['Speed Lightning Energy RCL 173'],
    specialEnergyPlayLocked: true,
    items: [speed, pass]
  });
  assert.deepEqual(policy.decide(request),
    { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ROOT_ACTION' });
});

test('DCE counts as two units for Thunder Mountain reduced CC cost', () => {
  const request = root({
    ownHand: ['Thunder Mountain ♢ LOT 191'],
    ownEnergies: ['Double Colorless Energy SUM 136'],
    items: [thunder, pass]
  });
  assert.deepEqual(policy.decide(request), { kind: 'select-action', token: 'thunder' });
});

test('one single-unit Energy does not trigger Thunder funding', () => {
  const request = root({
    ownHand: ['Thunder Mountain ♢ LOT 191'],
    ownEnergies: ['Speed Lightning Energy RCL 173'],
    items: [thunder, pass]
  });
  assert.deepEqual(policy.decide(request),
    { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ROOT_ACTION' });
});

test('Tool Jammer requires visible opponent Active Tool', () => {
  const opponentWithTool = mon({
    printing: 'Target ex ABC 1',
    tools: ['Float Stone BKT 137'],
    types: ['Colorless']
  });
  assert.deepEqual(policy.decide(root({
    ownHand: ['Tool Jammer BST 136'],
    opponentActive: opponentWithTool,
    items: [jammer, pass]
  })), { kind: 'select-action', token: 'jammer' });

  assert.deepEqual(policy.decide(root({
    ownHand: ['Tool Jammer BST 136'],
    opponentActive: mon({ printing: 'Target ex ABC 1', types: ['Colorless'] }),
    items: [jammer, pass]
  })), { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ROOT_ACTION' });
});

test('Tag Call starts exact-source G&H access line', () => {
  assert.deepEqual(policy.decide(root({
    ownHand: ['Tag Call CEC 206'],
    items: [tag, pass]
  })), { kind: 'select-action', token: 'tag' });
});

test('Tag Call prompt takes G&H plus Cynthia & Caitlin', () => {
  const request = prompt({
    sourcePrinting: 'Tag Call CEC 206',
    promptType: 'ChooseCardsPrompt',
    choices: [
      {
        token: 'gh', kind: 'card', printing: 'Guzma & Hala CEC 193',
        publicMetadata: { ownerSeat: 'actor', sourceZone: 'deck' }
      },
      {
        token: 'cc', kind: 'card', printing: 'Cynthia & Caitlin CEC 189',
        publicMetadata: { ownerSeat: 'actor', sourceZone: 'deck' }
      }
    ],
    publicMetadata: {
      selectionType: 'card-combination', minimumCount: 0, maximumCount: 2
    }
  });
  assert.deepEqual(policy.decide(request),
    { kind: 'select-choices', tokens: ['gh', 'cc'] });
});

test('G&H option chooses discard-two branch with two disposable cards', () => {
  const request = prompt({
    sourcePrinting: 'Guzma & Hala CEC 193',
    promptType: 'SelectOptionPrompt',
    choices: [
      { token: 'stadium', kind: 'option', label: 'Search for a Stadium card from your deck' },
      {
        token: 'discard', kind: 'option',
        label: 'Discard 2 cards from your hand. Search for a Pokemon Tool and Special Energy from your deck'
      }
    ],
    publicMetadata: { selectionType: 'option' },
    observationOptions: {
      ownHand: ['Guzma & Hala CEC 193', 'Handheld Fan TWM 150', "Trainers' Mail ROS 92", "Trainers' Mail ROS 92"]
    }
  });
  assert.deepEqual(policy.decide(request),
    { kind: 'select-choice', token: 'discard' });
});

test('G&H payment protects N and spends expendable Handheld Fan plus duplicate Mail', () => {
  const request = prompt({
    sourcePrinting: 'Guzma & Hala CEC 193',
    promptType: 'ChooseCardsPrompt',
    choices: [
      {
        token: 'fan', kind: 'card', printing: 'Handheld Fan TWM 150',
        publicMetadata: { ownerSeat: 'actor', sourceZone: 'hand' }
      },
      {
        token: 'mail', kind: 'card', printing: "Trainers' Mail ROS 92",
        publicMetadata: { ownerSeat: 'actor', sourceZone: 'hand' }
      },
      {
        token: 'n', kind: 'card', printing: 'N FCO 105',
        publicMetadata: { ownerSeat: 'actor', sourceZone: 'hand' }
      }
    ],
    publicMetadata: {
      selectionType: 'card-combination', minimumCount: 2, maximumCount: 2
    },
    observationOptions: {
      ownHand: [
        'Guzma & Hala CEC 193',
        'Handheld Fan TWM 150',
        "Trainers' Mail ROS 92",
        "Trainers' Mail ROS 92",
        'N FCO 105'
      ]
    }
  });
  assert.deepEqual(policy.decide(request),
    { kind: 'select-choices', tokens: ['fan', 'mail'] });
});

test('G&H search chooses needed Thunder and Jammer, not redundant attached DCE', () => {
  const opponentActive = mon({
    printing: 'Target ex ABC 1',
    tools: ['Float Stone BKT 137'],
    types: ['Colorless']
  });
  const request = prompt({
    sourcePrinting: 'Guzma & Hala CEC 193',
    promptType: 'ChooseCardsPrompt',
    choices: [
      {
        token: 'thunder', kind: 'card', printing: 'Thunder Mountain ♢ LOT 191',
        publicMetadata: { ownerSeat: 'actor', sourceZone: 'deck' }
      },
      {
        token: 'dce', kind: 'card', printing: 'Double Colorless Energy SUM 136',
        publicMetadata: { ownerSeat: 'actor', sourceZone: 'deck' }
      },
      {
        token: 'jammer', kind: 'card', printing: 'Tool Jammer BST 136',
        publicMetadata: { ownerSeat: 'actor', sourceZone: 'deck' }
      }
    ],
    publicMetadata: {
      selectionType: 'card-combination', minimumCount: 0, maximumCount: 3
    },
    observationOptions: {
      ownEnergies: ['Double Colorless Energy SUM 136'],
      opponentActive
    }
  });
  assert.deepEqual(policy.decide(request),
    { kind: 'select-choices', tokens: ['thunder', 'jammer'] });
});

test('G&H root does not start Tool/Energy expansion without two safe discards', () => {
  const opponentActive = mon({
    printing: 'Target ex ABC 1',
    tools: ['Float Stone BKT 137'],
    types: ['Colorless']
  });
  assert.deepEqual(policy.decide(root({
    ownHand: ['Guzma & Hala CEC 193', 'N FCO 105'],
    opponentActive,
    items: [gh, pass]
  })), { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ROOT_ACTION' });
});
