'use strict';

// Narrow native-card-rule regression for the fixed rank-3 source. Run with:
// node --test tests/2026-11/agent17-rank3-eri-arven-tool-contract.test.cjs
// Pin: Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.
// ForestSealStone.trainerType=TOOL; Eri filters ITEM;
// Arven sets min=0, max=min(items,1)+min(tools,1).
const test = require('node:test');
const assert = require('node:assert/strict');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const worker = require('../../simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-opponent-policy.cjs');

function decision(request) {
  return worker.createPolicy({
    role: 'opponent', seat: request.seat,
    policyVersion: worker.POLICY_VERSION, config: {}
  }).decide(request);
}

function rootRequest(seat, supporter, opponentHand = [], ownDiscard = [], opponentDeckCount = 12) {
  const handiwork = "Team Rocket's Handiwork FCO 112";
  return {
    role: 'opponent', seat, prompt: null,
    observation: {
      actorSeat: seat, globalTurn: 8,
      ownHand: [supporter, handiwork],
      ownTurnResources: { supporterPlayedTurn: 0 },
      ownPublic: {
        active: { printing: 'Snorlax PGO 55', energies: [], tools: [] },
        bench: [], discard: ownDiscard, stadium: [], lostZone: [],
        resolvingSupporter: [],
        publicTurnRestrictions: { supporterPlayLocked: false }
      },
      opponentPublic: {
        active: { printing: 'Shadow Rider Calyrex V CRE 74', energies: [] },
        bench: [], publicHand: opponentHand, handCount: opponentHand.length,
        deckCount: opponentDeckCount
      }
    },
    actionFrontier: { items: [
      { kind: 'play-card', token: 'supporter', actorPrinting: supporter },
      { kind: 'play-card', token: 'handi', actorPrinting: handiwork }
    ] }
  };
}

const toolsExhausted = [
  'Forest Seal Stone SIT 156', 'Float Stone BKT 137',
  'Stealthy Hood UNB 186', 'Tool Jammer BST 136'
];
const itemsExhausted = [
  ...Array(3).fill('Nest Ball SVI 181'),
  ...Array(3).fill('VS Seeker PHF 109'),
  ...Array(2).fill('Enhanced Hammer TWM 148'),
  ...Array(2).fill("Trainers' Mail ROS 92"),
  ...Array(2).fill('Counter Catcher PAR 160'),
  'Scoop Up Cyclone TWM 162', 'Quick Ball FST 237',
  'Hisuian Heavy Ball ASR 146', 'Night Stretcher ASC 196'
];

function arvenPromptRequest(seat, printings) {
  const choices = printings.map((printing, index) => ({
    token: 'choice-' + index, kind: 'card', printing,
    publicMetadata: { ownerSeat: 'actor', sourceZone: 'deck' }
  }));
  choices.push({ token: 'empty', kind: 'empty-selection' });
  const prompt = {
    schema: protocol.PROMPT_SCHEMA,
    actingSeat: seat,
    promptType: 'ChooseCardsPrompt',
    description: null,
    source: {
      classification: 'actor-choice',
      sourceKind: 'card-effect',
      sourcePrinting: 'Arven OBF 186',
      effectName: 'Arven'
    },
    choices,
    publicMetadata: {
      selectionType: 'card-combination',
      minimumCount: 0,
      maximumCount: Math.min(2, printings.length),
      allowCancel: false
    }
  };
  protocol.validatePrompt(prompt, seat);
  return {
    role: 'opponent', seat,
    observation: {
      actorSeat: seat, globalTurn: 8, ownHand: [],
      ownPublic: { active: { printing: 'Snorlax PGO 55' }, bench: [] },
      opponentPublic: {}
    },
    prompt
  };
}

for (const seat of [0, 1]) {
  test('rank3 Eri excludes old-label Pokemon Tool and retains actual Item, seat ' + seat, () => {
    const eri = 'Eri TEF 146';
    assert.deepEqual(
      decision(rootRequest(seat, eri, ['Forest Seal Stone SIT 156'])),
      { kind: 'select-action', token: 'handi' }
    );
    assert.deepEqual(
      decision(rootRequest(seat, eri, ['Fog Crystal CRE 140'])),
      { kind: 'select-action', token: 'supporter' }
    );
    assert.deepEqual(
      decision(rootRequest(seat, eri, ['Float Stone BKT 137'])),
      { kind: 'select-action', token: 'handi' }
    );
  });

  test('rank3 Arven root accepts exactly one available category, seat ' + seat, () => {
    const arven = 'Arven OBF 186';
    assert.deepEqual(
      decision(rootRequest(seat, arven, [], toolsExhausted, 40)),
      { kind: 'select-action', token: 'supporter' },
      'one Item can still be searched with every Tool exhausted'
    );
    assert.deepEqual(
      decision(rootRequest(seat, arven, [], itemsExhausted, 40)),
      { kind: 'select-action', token: 'supporter' },
      'one Tool can still be searched with every Item exhausted'
    );
    assert.deepEqual(
      decision(rootRequest(seat, arven, [], [...toolsExhausted, ...itemsExhausted], 40)),
      { kind: 'select-action', token: 'handi' },
      'no Item and no Tool is not useful'
    );
  });

  test('rank3 Arven resolves legal partial, paired and empty native prompts, seat ' + seat, () => {
    const cases = [
      [['Nest Ball SVI 181'], { kind: 'select-choices', tokens: ['choice-0'] }],
      [['Forest Seal Stone SIT 156'], { kind: 'select-choices', tokens: ['choice-0'] }],
      [['Forest Seal Stone SIT 156', 'Tool Jammer BST 136'],
        { kind: 'select-choices', tokens: ['choice-1'] }],
      [['Nest Ball SVI 181', 'Forest Seal Stone SIT 156'],
        { kind: 'select-choices', tokens: ['choice-0', 'choice-1'] }],
      [[], { kind: 'select-choice', token: 'empty' }]
    ];
    for (const [printings, expected] of cases) {
      const request = arvenPromptRequest(seat, printings);
      const actual = decision(request);
      assert.deepEqual(actual, expected, 'one native category contract: ' + printings.join(','));
      protocol.validateDecision(actual, request.prompt, new Set());
    }
  });
}
