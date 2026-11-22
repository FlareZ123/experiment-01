'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const candidate = require('../../simulation/evaluation/2026-11/agent47-hood-candidate-v2.cjs');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const { stagedAstralBarrage } =
  require('../../simulation/twinleaf/agent4-astral-barrage-native-probe.cjs');
const { withPaperAstralBarrageTargets } =
  require('../../simulation/twinleaf/agent4-astral-barrage-active-target-hook.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const { AttackAction } =
  require(path.join(output, 'game/store/actions/game-actions'));
const { ResolvePromptAction } =
  require(path.join(output, 'game/store/actions/resolve-prompt-action'));

const POLICY_CONFIG = Object.freeze({
  paperAstralBarrageTargets: 'agent4-cre74-hook-v1'
});

function publicRestrictions() {
  return {
    gxUsed: false, vstarUsed: false, attackLockTurnsRemaining: 0,
    attackMaxEnergy: null, attackMaxEnergyTurnsRemaining: 0,
    ignoreAttackCostCardTypes: [], ignoreAttackCostTurnsRemaining: 0,
    cannotUseGXAttacks: false, pokemonPlayLocked: false,
    abilityPokemonPlayLocked: false, evolutionPlayLocked: false,
    itemPlayLocked: false, supporterPlayLocked: false,
    stadiumPlayLocked: false, toolPlayLocked: false,
    energyPlayLocked: false, specialEnergyPlayLocked: false,
    stadiumAndToolHaveNoEffectTurnsRemaining: 0
  };
}

function pokemonSlot(printing, hp, energies = [], attacks = []) {
  return {
    printing, hp, damage: 0, energies, attacks,
    abilities: [], abilityDetails: [], abilitySuppressions: [],
    printed: {
      stage: 'BASIC', subtypes: ['Basic'], types: ['Psychic'],
      retreatCost: [], weakness: [], resistance: []
    },
    publicRestrictions: {
      cannotAttackNextTurn: false, cannotUseAttacksNextTurn: [],
      blockedAttackNameNextTurn: null, blockedAttackNameUntilLeavesActive: null,
      onlyAllowedAttackNameNextTurn: null, attackCostIncreaseNextTurn: 0,
      attackCostIncreaseWhileActive: 0, cannotRetreat: false,
      cannotRetreatNextTurn: false, cannotRetreatWhileActive: false,
      cannotEvolveNextTurn: false
    },
    tools: [], evolutionPrintings: []
  };
}

function publicPlayer(active, bench = []) {
  return {
    active, bench: [...bench, ...Array(Math.max(0, 5 - bench.length)).fill(null)],
    stadium: [], discard: [], lostZone: [], resolvingSupporter: [],
    publicHand: null, prizeSlots: [], publicTurnRestrictions: publicRestrictions(),
    handCount: 0, deckCount: 30, prizeCount: 6
  };
}

function observation(seat, { active, opponentActive, opponentBench = [],
  decisionKind = 'owner-root' } = {}) {
  return {
    actorSeat: seat, globalTurn: 3, phase: 2, decisionKind,
    pendingPromptType: decisionKind === 'owner-prompt'
      ? 'ChoosePokemonPrompt' : null,
    pendingOwnerDeckSearch: false, ownHand: [],
    ownPublic: publicPlayer(active),
    opponentPublic: publicPlayer(opponentActive, opponentBench),
    ownTurnResources: {
      supporterPlayedTurn: 0, retreatedTurn: 0, extraTurnActive: false,
      energyPlayedTurn: false, stadiumPlayedTurn: false, stadiumUsedTurn: false,
      vstarUsed: false, pokemonPlayLocked: false, abilityPokemonPlayLocked: false,
      evolutionPlayLocked: false, itemPlayLocked: false, supporterPlayLocked: false,
      stadiumPlayLocked: false, toolPlayLocked: false, energyPlayLocked: false,
      specialEnergyPlayLocked: false
    },
    ownerK1: null
  };
}

function makePolicy(seat) {
  return candidate.createPolicy({
    role: 'candidate', seat, policyVersion: candidate.POLICY_VERSION,
    config: POLICY_CONFIG
  });
}

function nativePolicyView(seat) {
  const attacker = pokemonSlot(
    'Shadow Rider Calyrex V CRE', 210,
    ['Psychic Energy SVE', 'Psychic Energy SVE', 'Psychic Energy SVE'],
    [{
      name: 'Astral Barrage',
      cost: ['Colorless', 'Colorless', 'Colorless'],
      damage: null, damageCalculation: null, text: null, gxAttack: false
    }]
  );
  const targetActive = pokemonSlot('Shadow Rider Calyrex V CRE', 210);
  const targetBench = pokemonSlot('Shadow Rider Calyrex V CRE', 210);
  return observation(seat, {
    active: attacker, opponentActive: targetActive,
    opponentBench: [targetBench]
  });
}

function nativePromptProjection(seat, view) {
  // The existing Agent4 hook emits slots in [BENCH, ACTIVE] order.
  const bench = view.opponentPublic.bench[0];
  const active = view.opponentPublic.active;
  return {
    schema: protocol.PROMPT_SCHEMA,
    actingSeat: seat,
    promptType: 'ChoosePokemonPrompt',
    description: null,
    source: {
      classification: 'actor-choice', sourceKind: 'card-effect',
      sourcePrinting: 'Shadow Rider Calyrex V CRE',
      effectName: 'Astral Barrage'
    },
    choices: [
      {
        token: 'bench1', kind: 'pokemon', printing: bench.printing,
        label: 'Opponent bench 1: ' + bench.printing,
        publicMetadata: {
          selectionIndex: 0, selectedCount: 1, selectionType: 'pokemon',
          ownerSeat: 'opponent', targetZone: 'bench', isOwnerVisible: true
        }
      },
      {
        token: 'active', kind: 'pokemon', printing: active.printing,
        label: 'Opponent active: ' + active.printing,
        publicMetadata: {
          selectionIndex: 1, selectedCount: 1, selectionType: 'pokemon',
          ownerSeat: 'opponent', targetZone: 'active', isOwnerVisible: true
        }
      }
    ],
    publicMetadata: {
      minimumCount: 2, maximumCount: 2, allowCancel: false,
      isSecret: false, selectionType: 'pokemon', targetZone: 'bench,active'
    }
  };
}

test('candidate v2 chooses Astral Barrage, projects the real corrected target prompt, and resolves both target choices in native Store for both seats', () => {
  for (const seat of [0, 1]) {
    const fixture = stagedAstralBarrage(1, seat);
    withPaperAstralBarrageTargets(() => {
      const policy = makePolicy(seat);
      const rootView = nativePolicyView(seat);
      const rootRequest = {
        role: 'candidate', seat, observation: rootView,
        prompt: null, publicEventReceipt: null,
        actionFrontier: {
          items: [
            {
              token: 'astral-barrage', kind: 'attack',
              actorPrinting: 'Shadow Rider Calyrex V CRE',
              attackName: 'Astral Barrage',
              publicMetadata: { attackCostPayable: true }
            },
            { token: 'pass', kind: 'pass' }
          ]
        }
      };
      assert.deepEqual(policy.decide(rootRequest),
        { kind: 'select-action', token: 'astral-barrage' });

      fixture.store.dispatch(new AttackAction(fixture.a.id, 'Astral Barrage'));
      const nativePrompt = fixture.state.prompts.find(prompt =>
        prompt.result === undefined &&
        prompt.constructor.name === 'ChoosePokemonPrompt');
      assert.ok(nativePrompt, 'real Store must create the attack target prompt');
      assert.equal(nativePrompt.options.min, 2);
      assert.equal(nativePrompt.options.max, 2);

      const promptView = {
        ...rootView, decisionKind: 'owner-prompt',
        pendingPromptType: 'ChoosePokemonPrompt'
      };
      const prompt = nativePromptProjection(seat, promptView);
      const decision = policy.decide({
        role: 'candidate', seat, observation: promptView,
        prompt, publicEventReceipt: null
      });
      assert.deepEqual(decision,
        { kind: 'select-choices', tokens: ['bench1', 'active'] });

      const nativeTargets = decision.tokens.map(token =>
        token === 'bench1' ? fixture.b.bench[0] : fixture.b.active);
      assert.equal(new Set(nativeTargets).size, 2);
      fixture.store.dispatch(new ResolvePromptAction(nativePrompt.id, nativeTargets));

      assert.deepEqual([
        fixture.b.active.damage, fixture.b.bench[0].damage
      ], [50, 50], 'the policy-selected distinct targets each receive five damage counters');
      assert.deepEqual(
        fixture.state.prompts.filter(prompt => prompt.result === undefined)
          .map(prompt => prompt.constructor.name),
        ['WaitPrompt'],
        'the opponent WaitPrompt remains after the real Store effect resolves'
      );
    });
  }
});
