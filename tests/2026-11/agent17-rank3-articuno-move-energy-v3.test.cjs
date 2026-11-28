'use strict';

// Narrow actor-only projected MoveEnergyPrompt regression. Do not confuse
// these fixtures with a pinned Twinleaf Store settlement or a game win.
// Pinned native source: Articuno-GX CES, Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.
const test = require('node:test');
const assert = require('node:assert/strict');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const projector = require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const rank3 = require('../../simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-opponent-policy.cjs');

const native = {
  PlayerType: { BOTTOM_PLAYER: 0, TOP_PLAYER: 1 },
  SlotType: { ACTIVE: 2, BENCH: 3 }
};
const cardList = cards => ({
  cards, getPokemonCard() { return cards.find(card => card.name !== 'Water Energy') ?? null; }
});
const card = (name, fullName) => ({ name, fullName });
const sourceCard = card('Articuno-GX', 'Articuno-GX CES');
class MoveEnergyPrompt {
  constructor(playerId) {
    this.playerId = playerId;
    this.result = undefined;
    this.message = 'MOVE_ENERGY_TO_ACTIVE';
    this.playerType = native.PlayerType.BOTTOM_PLAYER;
    this.slots = [native.SlotType.ACTIVE, native.SlotType.BENCH];
    this.filter = { name: 'Water Energy' };
    this.options = {
      min: 1, max: undefined, allowCancel: false,
      blockedFrom: [{ player: 0, slot: 2, index: 0 }],
      blockedTo: [{ player: 0, slot: 3, index: 0 }],
      blockedMap: []
    };
  }
  getPerspectivePlayerId() { return this.playerId; }
}

function fixture(seat) {
  const player = (id, actor) => ({
    id,
    active: cardList(actor ? [sourceCard] : [card('Regidrago V', 'Regidrago V SIT 135')]),
    bench: actor ? [
      {
        ...cardList([card('Galarian Stunfisk', 'Galarian Stunfisk SSH 132')]),
        energies: cardList([
          card('Water Energy', 'Water Energy MEE 12'),
          card('Water Energy', 'Water Energy MEE 12')
        ])
      },
      {
        ...cardList([card('Snorlax', 'Snorlax PGO 55')]),
        energies: cardList([card('Psychic Energy', 'Psychic Energy MEE 13')])
      }
    ] : [],
    hand: cardList([]), deck: cardList([]), discard: cardList([]),
    lostzone: cardList([]), stadium: cardList([]), supporter: cardList([]),
    prizes: []
  });
  const state = { phase: 3, players: [player(10, seat === 0), player(11, seat === 1)] };
  const prompt = new MoveEnergyPrompt(state.players[seat].id);
  const provenanceHook = {
    getPromptProvenance() {
      return { sourceKind: 'card-effect', sourceCard, effectName: 'Articuno-GX' };
    }
  };
  return { prompt, state, actorSeat: seat, native, store: {}, provenanceHook };
}
function project(seat) { return projector.projectPrompt(fixture(seat)); }
function select(seat, projected) {
  return rank3.createPolicy({
    role: 'opponent', seat, policyVersion: rank3.POLICY_VERSION, config: {}
  }).decide({
    role: 'opponent', seat,
    observation: {
      actorSeat: seat, globalTurn: 4, decisionKind: 'owner-prompt',
      ownHand: [], ownPublic: { active: { printing: 'Articuno-GX CES' }, bench: [] },
      opponentPublic: {}
    },
    prompt: projected.promptProjection,
    actionFrontier: { items: [] }
  });
}

for (const seat of [0, 1]) {
  test('Articuno physically-indexed two-Water prompt and strict selection, seat ' + seat, () => {
    const projected = project(seat);
    assert.equal(projected.hostOnly, false);
    assert.deepEqual(projected.promptProjection.choices.map(choice => choice.printing),
      ['Water Energy MEE 12', 'Water Energy MEE 12']);
    assert.deepEqual([...projected.choiceByToken.values()], [
      {
        from: { player: 0, slot: 3, index: 0 },
        to: { player: 0, slot: 2, index: 0 }, index: 0
      },
      {
        from: { player: 0, slot: 3, index: 0 },
        to: { player: 0, slot: 2, index: 0 }, index: 1
      }
    ]);
    const result = select(seat, projected);
    assert.deepEqual(result, { kind: 'select-choices', tokens: ['prompt-0', 'prompt-1'] });
    protocol.validateDecision(result, projected.promptProjection, new Set());
  });

  test('Articuno requires the actual pinned source and exact ability, seat ' + seat, () => {
    const projected = project(seat);
    const changed = JSON.parse(JSON.stringify(projected.promptProjection));
    changed.source.sourcePrinting = 'Other CES 31';
    assert.throws(() => protocol.validatePrompt(changed, seat), {
      code: 'UNTRUSTED_ENERGY_SELECTION'
    });
    changed.source.sourcePrinting = 'Articuno-GX CES';
    changed.source.effectName = 'Other Ability';
    assert.throws(() => protocol.validatePrompt(changed, seat), {
      code: 'UNTRUSTED_ENERGY_SELECTION'
    });
  });

  test('Articuno fails closed if native transfer format or actor source changes, seat ' + seat, () => {
    const wrongFilter = fixture(seat);
    wrongFilter.prompt.filter.name = 'Psychic Energy';
    assert.throws(() => projector.projectPrompt(wrongFilter), {
      code: 'UNSUPPORTED_ENERGY_TRANSFER_PROMPT'
    });

    const wrongActor = fixture(seat);
    wrongActor.prompt.playerType = native.PlayerType.TOP_PLAYER;
    assert.throws(() => projector.projectPrompt(wrongActor), {
      code: 'UNSUPPORTED_ENERGY_TRANSFER_PROMPT'
    });
  });

  test('Articuno will not manufacture a transfer from a blocked Bench, seat ' + seat, () => {
    const blocked = fixture(seat);
    blocked.prompt.options.blockedFrom.push({
      player: native.PlayerType.BOTTOM_PLAYER, slot: native.SlotType.BENCH, index: 0
    });
    assert.throws(() => projector.projectPrompt(blocked), {
      code: 'NO_ELIGIBLE_ENERGY_TRANSFERS'
    });

    const altered = project(seat);
    const invalid = JSON.parse(JSON.stringify(altered.promptProjection));
    invalid.choices[0].publicMetadata.ownerSeat = 'opponent';
    assert.throws(() => protocol.validatePrompt(invalid, seat), {
      code: 'UNTRUSTED_ENERGY_SELECTION'
    });
  });
}


function confirmRequest(seat, {
  activePrinting = 'Bunnelby PRC 121',
  benchWater = true,
  opponentEnergy = 2,
  gxUsed = false,
  effectName = 'Articuno-GX'
} = {}) {
  return {
    role: 'opponent', seat,
    observation: {
      actorSeat: seat, globalTurn: 5, decisionKind: 'owner-prompt',
      ownHand: [],
      ownTurnResources: { gxUsed },
      ownPublic: {
        active: { printing: activePrinting, energies: [] },
        bench: [
          { printing: 'Articuno-GX CES', energies: [] },
          {
            printing: 'Galarian Stunfisk SSH 132',
            energies: benchWater ? ['Water Energy MEE 12'] : []
          }
        ],
        publicTurnRestrictions: { gxUsed }
      },
      opponentPublic: {
        active: {
          printing: 'Shadow Rider Calyrex VMAX CRE 75',
          energies: Array(opponentEnergy).fill('Psychic Energy MEE 13')
        },
        bench: []
      }
    },
    prompt: {
      schema: protocol.PROMPT_SCHEMA,
      actingSeat: seat,
      promptType: 'ConfirmPrompt', description: 'WANT_TO_USE_ABILITY',
      source: {
        classification: 'actor-choice', sourceKind: 'card-effect',
        sourcePrinting: 'Articuno-GX CES', effectName
      },
      publicMetadata: { selectionType: 'confirm', allowCancel: false },
      choices: [
        { token: 'yes', kind: 'confirm', label: 'Yes' },
        { token: 'no', kind: 'confirm', label: 'No' }
      ]
    }
  };
}
for (const seat of [0, 1]) {
  test('Articuno confirms a payable immediate Cold Crush-GX setup, seat ' + seat, () => {
    const request = confirmRequest(seat);
    const prompt = protocol.validatePrompt(request.prompt, seat);
    const actual = rank3.createPolicy({
      role: 'opponent', seat, policyVersion: rank3.POLICY_VERSION, config: {}
    }).decide(request);
    assert.deepEqual(actual, { kind: 'select-choice', token: 'yes' });
    protocol.validateDecision(actual, prompt, new Set());
  });

  test('Articuno preserves active Snorlax, expended GX and empty Water cases, seat ' + seat, () => {
    const variants = [
      { activePrinting: 'Snorlax PGO 55' },
      { benchWater: false },
      { opponentEnergy: 0 },
      { gxUsed: true },
      { effectName: 'Unrelated Ability' }
    ];
    for (const options of variants) {
      const request = confirmRequest(seat, options);
      protocol.validatePrompt(request.prompt, seat);
      const actual = rank3.createPolicy({
        role: 'opponent', seat, policyVersion: rank3.POLICY_VERSION, config: {}
      }).decide(request);
      assert.deepEqual(actual, { kind: 'select-choice', token: 'no' },
        'should decline ' + JSON.stringify(options));
      protocol.validateDecision(actual, request.prompt, new Set());
    }
  });
}


for (const seat of [0, 1]) {
  test('Articuno optional-zero native hook preserves explicit empty transfer, seat ' + seat, () => {
    const scene = fixture(seat);
    scene.prompt.options.min = 0;
    const projected = projector.projectPrompt(scene);
    const choices = projected.promptProjection.choices;
    assert.deepEqual(choices.map(choice => choice.kind), ['energy', 'energy', 'empty-selection']);
    assert.deepEqual(projected.choiceByToken.get('prompt-2'), []);
    assert.equal(projected.promptProjection.publicMetadata.minimumCount, 0);
    assert.equal(projected.promptProjection.publicMetadata.maximumCount, 2);
    const decision = select(seat, projected);
    assert.deepEqual(decision, { kind: 'select-choices', tokens: ['prompt-0', 'prompt-1'] });
    protocol.validateDecision(decision, projected.promptProjection, new Set());
    protocol.validateDecision({ kind: 'select-choice', token: 'prompt-2' },
      projected.promptProjection, new Set());
  });
}
