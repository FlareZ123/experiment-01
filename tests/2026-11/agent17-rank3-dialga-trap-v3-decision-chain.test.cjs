'use strict';

// One actual strict-V3 actor-only root->gust choice chain per physical seat.
// Does not execute a pinned native Store turn or assert a matchup win.
const test = require('node:test');
const assert = require('node:assert/strict');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const worker = require('../../simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-opponent-policy.cjs');

const restrictions = () => Object.fromEntries(
  protocol.PUBLIC_RESTRICTION_KEYS.map(key => [key,
    key === 'cannotUseAttacksNextTurn' ? [] :
    key.startsWith('attackCost') ? 0 :
    key.startsWith('blockedAttack') || key.startsWith('onlyAllowed') ? null : false])
);
const playerRestrictions = () => Object.fromEntries(
  protocol.PLAYER_RESTRICTION_KEYS.map(key => [key,
    key === 'ignoreAttackCostCardTypes' ? [] :
    key === 'attackMaxEnergy' || key === 'stadiumAndToolHaveNoEffectTurnsRemaining' ? null :
    key.endsWith('TurnsRemaining') ? 0 : false])
);
const turnResources = () => Object.fromEntries(
  protocol.TURN_RESOURCE_KEYS.map(key =>
    [key, key === 'supporterPlayedTurn' ? 0 : key.endsWith('Turn') ? -1 : false])
);
function pokemon(printing, hp, energy = [], stage = 'BASIC') {
  return {
    printing, name: printing.split(' ').slice(0, -2).join(' '),
    hp, damage: 0, lastPlayedOrEvolvedTurn: 0,
    printed: {
      stage, subtypes: [stage === 'BASIC' ? 'Basic' : stage],
      types: ['Colorless'], retreatCost: [], weakness: [], resistance: []
    },
    specialConditions: [], publicRestrictions: restrictions(),
    evolutionPrintings: [], energies: energy, tools: [], attacks: [],
    abilities: [], abilityDetails: [], abilitySuppressions: []
  };
}
function player(active, bench, prizeCount) {
  return {
    active, bench, stadium: [], discard: [], lostZone: [],
    resolvingSupporter: [], publicHand: null, prizeSlots: [],
    publicTurnRestrictions: playerRestrictions(),
    handCount: 3, deckCount: 32, prizeCount
  };
}
function observation(seat, decisionKind) {
  return {
    actorSeat: seat, globalTurn: 9, phase: 4, decisionKind,
    pendingPromptType: decisionKind === 'owner-prompt' ? 'ChoosePokemonPrompt' : null,
    pendingOwnerDeckSearch: false,
    ownHand: ['Counter Catcher PAR 160', "Team Rocket's Handiwork FCO 112"],
    ownPublic: player(
      pokemon('Snorlax PGO 55', 150),
      [pokemon('Bunnelby PRC 121', 70)], 4
    ),
    opponentPublic: player(
      pokemon('Shadow Rider Calyrex VMAX CRE 75', 320, [], 'VMAX'),
      [
        pokemon('Dialga-GX UPR 100', 180),
        pokemon('Shadow Rider Calyrex V CRE 74', 210, ['Psychic Energy MEE 13'])
      ], 2
    ),
    ownTurnResources: turnResources(), ownerK1: null
  };
}
function request(seat, stage) {
  const isPrompt = stage === 'prompt';
  return {
    schema: protocol.REQUEST_SCHEMA,
    type: 'decision', requestId: 'rank3-dialga-' + stage + '-' + seat,
    sequence: 1, role: 'opponent', seat,
    observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: observation(seat, isPrompt ? 'owner-prompt' : 'owner-root'),
    prompt: isPrompt ? {
      schema: protocol.PROMPT_SCHEMA, actingSeat: seat,
      promptType: 'ChoosePokemonPrompt', description: null,
      source: {
        classification: 'actor-choice', sourceKind: 'card-effect',
        sourcePrinting: 'Counter Catcher PAR 160', effectName: 'Counter Catcher'
      },
      publicMetadata: {
        selectionType: 'pokemon', minimumCount: 1, maximumCount: 1, allowCancel: false
      },
      choices: [
        { kind: 'pokemon', token: 'dialga', printing: 'Dialga-GX UPR 100',
          publicMetadata: { ownerSeat: 'opponent', targetZone: 'bench', benchIndex: 0 } },
        { kind: 'pokemon', token: 'v', printing: 'Shadow Rider Calyrex V CRE 74',
          publicMetadata: { ownerSeat: 'opponent', targetZone: 'bench', benchIndex: 1 } }
      ]
    } : null,
    publicEventReceipt: null,
    actionFrontier: {
      schema: protocol.FRONTIER_SCHEMA,
      items: isPrompt ? [] : [
        { kind: 'play-card', token: 'catch', actorPrinting: 'Counter Catcher PAR 160',
          publicMetadata: { cardType: 'trainer' } },
        { kind: 'play-card', token: 'hand', actorPrinting: "Team Rocket's Handiwork FCO 112",
          publicMetadata: { cardType: 'supporter' } },
        { kind: 'pass', token: 'pass' }
      ]
    }
  };
}
for (const seat of [0, 1]) {
  test('rank3 v1.4 strict V3 terminal-safe counter-gust root, seat ' + seat, () => {
    const req = request(seat, 'root');
    const checked = protocol.validateRequest(req, { role: 'opponent', seat }, 1, new Set());
    const selected = worker.createPolicy({
      role: 'opponent', seat,
      policyVersion: worker.POLICY_VERSION, config: {}
    }).decide(req);
    assert.deepEqual(selected, { kind: 'select-action', token: 'catch' });
    protocol.validateDecision(selected, checked.prompt, checked.actionTokens);
  });
  test('rank3 v1.4 strict V3 physically indexed Dialga gust prompt, seat ' + seat, () => {
    const req = request(seat, 'prompt');
    const checked = protocol.validateRequest(req, { role: 'opponent', seat }, 1, new Set());
    const selected = worker.createPolicy({
      role: 'opponent', seat,
      policyVersion: worker.POLICY_VERSION, config: {}
    }).decide(req);
    assert.deepEqual(selected, { kind: 'select-choices', tokens: ['dialga'] });
    protocol.validateDecision(selected, checked.prompt, checked.actionTokens);
  });
}
