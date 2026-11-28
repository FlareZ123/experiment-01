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
      return { sourceKind: 'card-effect', sourceCard, effectName: 'Legendary Ascent' };
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
