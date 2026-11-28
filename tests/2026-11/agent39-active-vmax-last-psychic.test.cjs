'use strict';

// Narrow decision correction on the exact PR95 worker branch. No Store, game,
// fixture or CI is executed by this source-only contract test.
const test = require('node:test');
const assert = require('node:assert/strict');
const { createPolicy, POLICY_VERSION } =
  require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');

const energy = 'Psychic Energy MEE 13';
const energyRows = n => Array(n).fill(energy);
function pokemon(printing, n, stage = 'VMAX') {
  return {
    printing, hp: stage === 'VMAX' ? 320 : 210, damage: 0, tools: [],
    abilities: [], abilitySuppressions: [], energies: energyRows(n),
    attacks: stage === 'VMAX'
      ? [{ name: 'Max Geist', cost: ['Colorless', 'Colorless', 'Colorless'],
           damage: '10+' }]
      : [{ name: 'Shadow Mist', cost: ['Psychic'], damage: '10' }],
    printed: { stage, subtypes: stage === 'VMAX' ? ['VMAX', 'V'] : ['Basic'],
      types: ['Psychic'], weakness: [], resistance: [],
      retreatCost: ['Colorless', 'Colorless'] }
  };
}
function publicSide(active, bench) {
  return {
    active, bench, stadium: [], discard: [], lostZone: [],
    resolvingSupporter: [], deckCount: 26, handCount: 1,
    publicTurnRestrictions: {
      gxUsed: false, vstarUsed: false,
      stadiumAndToolHaveNoEffectTurnsRemaining: 0
    }
  };
}
function request(seat, { activeEnergy = 1, handPsychic = 1,
    benchEnergy = 6, includeDoor = true } = {}) {
  const active = pokemon('Shadow Rider Calyrex VMAX CRE 75', activeEnergy);
  const benchMax = pokemon('Shadow Rider Calyrex VMAX CRE 75', benchEnergy);
  const benchV = pokemon('Shadow Rider Calyrex V CRE 74', 0, 'BASIC');
  const target = pokemon('Shadow Rider Calyrex V CRE 74', 0, 'BASIC');
  target.printed.types = ['Colorless'];
  target.printing = 'Snorlax PGO 55';
  target.hp = 150;
  target.attacks = [];
  return {
    role: 'candidate', seat, prompt: null, publicEventReceipt: null,
    observation: {
      actorSeat: seat, decisionKind: 'owner-root',
      ownHand: energyRows(handPsychic),
      ownTurnResources: { supporterPlayedTurn: 0 },
      ownPublic: publicSide(active, [benchMax, benchV]),
      opponentPublic: publicSide(target, [])
    },
    actionFrontier: { items: [
      // Lexical tie chooses Bench before Active in the pre-fix worker.
      { token: 'z-active', kind: 'play-card', actorPrinting: energy,
        targetPrinting: active.printing,
        publicMetadata: { targetSeat: 'actor', targetZone: 'active' } },
      { token: 'a-bench', kind: 'play-card', actorPrinting: energy,
        targetPrinting: benchV.printing,
        publicMetadata: { targetSeat: 'actor', targetZone: 'bench',
          targetIndex: 1 } },
      ...(includeDoor ? [{
        token: 'door', kind: 'use-ability',
        actorPrinting: benchMax.printing,
        publicMetadata: { abilityName: 'Underworld Door' }
      }] : []),
      { token: 'pass', kind: 'pass' }
    ] }
  };
}
for (const seat of [0, 1]) {
  const policy = createPolicy({
    role: 'candidate', seat, policyVersion: POLICY_VERSION, config: {}
  });
  const cases = [
    ['last Psychic, Active 1/3, Bench 6, genuine Door competition',
      { activeEnergy: 1, handPsychic: 1 }, 'z-active', 895],
    ['last Psychic, Active 0/3, no immediate next-turn attack: preserve Door',
      { activeEnergy: 0, handPsychic: 1 }, 'door', 600],
    ['two held Psychic preserve Door-then-manual option',
      { activeEnergy: 1, handPsychic: 2 }, 'door', 600],
    ['last Psychic, one card from payable Active, existing 1120 branch',
      { activeEnergy: 2, handPsychic: 1 }, 'z-active', 1120],
    ['last Psychic, Active 1/3, Door suppressed, prefer guaranteed funding',
      { activeEnergy: 1, handPsychic: 1, includeDoor: false },
      'z-active', 895],
    ['last Psychic, Active already paid, do not force redundant attachment',
      { activeEnergy: 3, handPsychic: 1 }, 'door', null]
  ];
  for (const [label, cfg, wanted, activeScore] of cases) {
    test(label + ' seat ' + seat, () => {
      const input = request(seat, cfg);
      const result = policy.decideWithAudit(input);
      assert.deepEqual(result.decision,
        { kind: 'select-action', token: wanted });
      assert.deepEqual(result.policyAudit.selectedTokens, [wanted]);
      assert.ok(input.actionFrontier.items.some(item =>
        item.token === result.decision.token));
      assert.deepEqual(result.policyAudit.evaluations.map(item => item.token),
        input.actionFrontier.items.map(item => item.token));
      const activeRow = result.policyAudit.evaluations.find(row =>
        row.token === 'z-active');
      if (activeScore !== null) assert.equal(activeRow.score, activeScore);
    });
  }
}
