'use strict';

// A payoff-oriented root decision rather than another abstract accessibility
// count. Competing Handiwork is deliberately offered at 12-deck-card urgency.
const test = require('node:test');
const assert = require('node:assert/strict');
const worker = require('../../simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-opponent-policy.cjs');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');

function state(seat, changes = {}) {
  const active = changes.active ?? 'Bunnelby PRC 121';
  const opponentActive = changes.opponentActive ?? 'Regidrago V SIT 135';
  const energy = changes.water === false ? [] : ['Water Energy SVE'];
  return {
    role: 'opponent', seat,
    observation: {
      actorSeat: seat, globalTurn: 4, decisionKind: 'owner-root',
      ownHand: ['Articuno-GX CES', "Team Rocket's Handiwork FCO 112"],
      ownTurnResources: { supporterPlayedTurn: 0, gxUsed: changes.gxUsed ?? false },
      ownPublic: {
        active: { printing: active, energies: energy },
        bench: [],
        stadium: changes.stadium ? [{ printing: changes.stadium }] : [],
        discard: [],
        publicTurnRestrictions: { gxUsed: changes.gxUsed ?? false }
      },
      opponentPublic: {
        active: {
          printing: opponentActive,
          energies: Array(changes.opponentEnergy ?? 3).fill('Grass Energy SVE')
        },
        bench: [], stadium: [], deckCount: 12, prizeCount: 6
      }
    },
    prompt: null,
    actionFrontier: { items: [
      { token: 'articuno', kind: 'play-card', actorPrinting: 'Articuno-GX CES',
        publicMetadata: { cardType: 'pokemon' } },
      { token: 'mill', kind: 'play-card', actorPrinting: "Team Rocket's Handiwork FCO 112",
        publicMetadata: { cardType: 'supporter' } },
      { token: 'pass', kind: 'pass' }
    ] }
  };
}
function decide(request) {
  return worker.createPolicy({
    role: 'opponent', seat: request.seat,
    policyVersion: worker.POLICY_VERSION, config: {}
  }).decide(request);
}

for (const seat of [0, 1]) {
  test('rank3 root prefers immediately payable Articuno against three-Energy attacker, seat ' + seat, () => {
    const req = state(seat);
    const decision = decide(req);
    assert.deepEqual(decision, { kind: 'select-action', token: 'articuno' });
    const tokens = new Set(req.actionFrontier.items.map(item => item.token));
    protocol.validateDecision(decision, null, tokens);
  });

  test('rank3 declines speculative Articuno when lock/payability is absent, seat ' + seat, () => {
    const failures = [
      { active: 'Snorlax PGO 55' },
      { active: 'Wobbuffet PHF 36' },
      { water: false },
      { opponentEnergy: 1 },
      { gxUsed: true },
      { opponentActive: 'Iron Thorns ex TEF 77' },
      { opponentActive: 'Wobbuffet PHF 36' },
      { stadium: 'Path to the Peak CRE 148' }
    ];
    for (const change of failures) {
      const req = state(seat, change);
      const decision = decide(req);
      assert.deepEqual(decision, { kind: 'select-action', token: 'mill' },
        'overriding candidate trigger: ' + JSON.stringify(change));
      const tokens = new Set(req.actionFrontier.items.map(item => item.token));
      protocol.validateDecision(decision, null, tokens);
    }
  });
}


// Nest Ball SVI 181 and Capture Energy RCL 171 put a Basic directly onto the
// Bench; Quick Ball FST 237 puts it into hand. Articuno-GX CES 31's Ability
// explicitly requires being played from hand (native card text / source pool).
for (const seat of [0, 1]) {
  test('rank3 direct-Bench search does not imply Legendary Ascent, seat ' + seat, () => {
    for (const promptType of ['ChooseCardsPrompt', 'ChoosePokemonPrompt']) {
      const kind = promptType === 'ChooseCardsPrompt' ? 'card' : 'pokemon';
      const choices = [
        { token: 'articuno', kind, printing: 'Articuno-GX CES',
          publicMetadata: { ownerSeat: 'actor', sourceZone: 'deck', targetZone: 'deck' } },
        { token: 'snorlax', kind, printing: 'Snorlax PGO 55',
          publicMetadata: { ownerSeat: 'actor', sourceZone: 'deck', targetZone: 'deck' } }
      ];
      for (const [printing, effectName, token] of [
        ['Nest Ball SVI', 'Nest Ball', 'snorlax'],
        ['Capture Energy RCL', 'Capture Energy', 'snorlax'],
        ['Quick Ball FST', 'Quick Ball', 'articuno']
      ]) {
        const req = state(seat);
        req.observation.ownHand = [printing];
        const prompt = {
          promptType, description: 'Search the deck for Basic Pokémon',
          source: {
            classification: 'actor-choice', sourceKind: 'card-effect',
            sourcePrinting: printing, effectName
          },
          publicMetadata: { selectionType: 'cards', minimumCount: 1, maximumCount: 1 },
          choices
        };
        const actual = worker.createPolicy({
          role: 'opponent', seat, policyVersion: worker.POLICY_VERSION, config: {}
        }).decide({ role: 'opponent', seat, observation: req.observation,
          prompt, actionFrontier: { items: [] } });
        assert.deepEqual(actual, { kind: 'select-choice', token },
          promptType + ': ' + printing);
      }
    }
  });
}


// The native projectNativeAction / actorObservation printing often omits the
// collector number (Name SET), even though the original Aichi manifest has
// Name SET Number. Every relevant fixed-source print must preserve its score
// in both representations, without accepting a *different* numbered card.
for (const seat of [0, 1]) {
  test('native set-only originals score like their numbered source, seat ' + seat, () => {
    const req = state(seat);
    const observation = req.observation;
    const score = (printing, cardType = 'pokemon', targetPrinting = undefined) =>
      worker.scoreAction({
        token: 'probe', kind: 'play-card', actorPrinting: printing,
        ...(targetPrinting ? { targetPrinting } : {}),
        publicMetadata: {
          cardType,
          ...(targetPrinting ? { targetSeat: 'actor', targetZone: 'active', targetIndex: 0 } : {})
        }
      }, { observation, publicEventReceipt: null });
    for (const [source, nativeName, wrong] of [
      ['Bunnelby PRC 121','Bunnelby PRC','Bunnelby PRC 122'],
      ['Galarian Stunfisk SSH 132','Galarian Stunfisk SSH','Galarian Stunfisk SSH 131'],
      ['Regirock XYP 49','Regirock XYP','Regirock XYP 50'],
      ['Mimikyu PAL 97','Mimikyu PAL','Mimikyu PAL 98'],
      ['Girafarig LOT 94','Girafarig LOT','Girafarig LOT 95'],
      ['Rotom V LOR 58','Rotom V LOR','Rotom V LOR 59']
    ]) {
      const actual = score(nativeName);
      assert.ok(actual > 0, nativeName + ' must be a viable native root card');
      assert.equal(actual, score(source), nativeName + ' changed from source score');
      assert.equal(score(wrong), 0, wrong + ' must not impersonate source card');
    }
    const support = card => score(card,'trainer');
    assert.equal(support("Team Rocket's Handiwork FCO"), 130);
    assert.equal(support("Team Rocket's Handiwork FCO"), support("Team Rocket's Handiwork FCO 112"));
    assert.equal(support("Team Rocket's Handiwork FCO 113"), 0);
    // Root Plumeria is only live if the discard cost is payable; make it so.
    observation.ownHand = ['Water Energy SVE','Plumeria BUS','Capture Energy RCL','Faba LOT'];
    assert.equal(support('Plumeria BUS'), support('Plumeria BUS 120'));
    assert.ok(support('Plumeria BUS') > 0);
    assert.equal(support('Plumeria BUS 121'), 0);
    // Slot identity must agree exactly with actor-observed Active printing.
    // The original fixture uses a numbered Bunnelby; native state instead
    // emits set-only printing. Test both self-consistent states, not a mixed
    // target label that publicRootTargetSlot correctly rejects.
    const numberedCapture = score('Capture Energy RCL 171','energy','Bunnelby PRC 121');
    assert.ok(numberedCapture > 0);
    observation.ownPublic.active.printing = 'Bunnelby PRC';
    assert.equal(score('Capture Energy RCL','energy','Bunnelby PRC'), numberedCapture);
    assert.equal(score('Capture Energy RCL 172','energy','Bunnelby PRC'), 0);
  });
}
