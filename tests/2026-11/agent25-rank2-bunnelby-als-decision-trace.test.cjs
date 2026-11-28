'use strict';

// Ten policy decision frames from the source rank2 Aichi Bunnelby ALS:
// Tag Call -> Guzma & Hala -> (discard 2, find Grand Tree + TM + Jet) ->
// attach TM to Bunnelby -> attach Jet to that Bunnelby, promote -> attack
// Evolution with Barrage -> choose Evolution again.
// These are manually transitioned actor-visible frames, NOT native Store,
// end-to-end game execution, or a proven tournament line frequency.
const test = require('node:test');
const assert = require('node:assert/strict');
const { POLICY_VERSION, createPolicy } =
  require('../../simulation/evaluation/2026-11/agent45-rank2-vileplume-control-opponent-policy-v2.cjs');
const TM = 'Technical Machine: Evolution PAR 178';
const JET = 'Jet Energy PAL 190';
const BUNNELBY = 'Bunnelby PRC 121';
function state(seat) {
  return {
    actorSeat: seat, globalTurn: 2, ownerK1: null,
    ownHand: ['Tag Call CEC 206', 'Grass Energy MEE 9', 'Grass Energy MEE 9'],
    ownPublic: {
      active: { printing: 'Fan Rotom SCR 118', hp: 70, damage: 0,
        tools: [], energies: [] },
      bench: [
        { printing: BUNNELBY, hp: 70, damage: 0, tools: [], energies: [] },
        { printing: 'Oddish UNB 5', hp: 50, damage: 0, tools: [],
          printed: { stage: 'BASIC' }, lastPlayedOrEvolvedTurn: 2 },
        { printing: 'Lillipup BLW 80', hp: 60, damage: 0, tools: [],
          printed: { stage: 'BASIC' }, lastPlayedOrEvolvedTurn: 2 },
        null, null
      ],
      discard: [], lostZone: [], deckCount: 42, prizeCount: 6,
      publicTurnRestrictions: { itemPlayLocked: false, toolPlayLocked: false }
    },
    opponentPublic: {
      active: { printing: 'Shadow Rider Calyrex V CRE 74', hp: 210, damage: 0 },
      bench: [null, null, null, null, null], deckCount: 42, prizeCount: 6,
      publicTurnRestrictions: { itemPlayLocked: false }
    },
    ownTurnResources: {
      supporterPlayedTurn: 0, supporterPlayLocked: false,
      itemPlayLocked: false, toolPlayLocked: false
    }
  };
}
function rootCard(token, printing, targetZone = null, targetIndex = null) {
  const action = { token, kind: 'play-card', actorPrinting: printing,
    publicMetadata: { cardType: /^Jet Energy/.test(printing) ? 'energy' : 'trainer' } };
  if (targetZone !== null) {
    action.targetPrinting = BUNNELBY;
    Object.assign(action.publicMetadata, {
      targetSeat: 'actor', targetZone, targetIndex, isOwnerVisible: true
    });
  }
  return action;
}
function choose(policy, seat, obs, items, prompt = null) {
  return policy.decide({
    role: 'opponent', seat, observation: obs, prompt,
    actionFrontier: { items }
  });
}
function cardChoice(token, printing, zone) {
  return { token, kind: 'card', printing,
    label: printing, publicMetadata: { targetZone: zone, selectionType: 'card' } };
}
function cardPrompt(source, cards, min, max) {
  return {
    promptType: 'ChooseCardsPrompt',
    source: { sourcePrinting: source, effectName: source.startsWith('Tag Call') ?
      'Tag Call' : 'Guzma & Hala' },
    publicMetadata: { selectionType: 'card-combination',
      minimumCount: min, maximumCount: max },
    choices: cards
  };
}
const pick = token => ({ kind: 'select-action', token });
const picks = tokens => ({ kind: 'select-choices', tokens });

for (const seat of [0, 1]) {
  test('seat ' + seat + ': ten-frame Tag Call/Hala/Bunnelby Barrage ALS chooses the right tools and actions', () => {
    const p = createPolicy({ role: 'opponent', seat, policyVersion: POLICY_VERSION,
      config: {} });
    const v = state(seat);
    const pass = { token: 'pass', kind: 'pass' };

    // 1. Tag Call is the only useful root before the Supporter arrives.
    assert.deepEqual(choose(p, seat, v, [pass,
      rootCard('tag', 'Tag Call CEC 206')]), pick('tag'));

    // 2. Tag Call searches the source rank2 list's Guzma & Hala.
    assert.deepEqual(choose(p, seat, v, [], cardPrompt('Tag Call CEC 206',
      [cardChoice('hala-found', 'Guzma & Hala CEC 193', 'deck')], 1, 1)),
      picks(['hala-found']));

    // 3. Hala is playable going second (turn 2) with two disposable Energy.
    v.ownHand = ['Guzma & Hala CEC 193', 'Grass Energy MEE 9',
      'Grass Energy MEE 9'];
    assert.deepEqual(choose(p, seat, v,
      [pass, rootCard('hala', 'Guzma & Hala CEC 193')]), pick('hala'));

    // 4. Discard-2 search mode, not stadium-only mode.
    assert.deepEqual(choose(p, seat, v, [], {
      promptType: 'SelectOptionPrompt',
      source: { sourcePrinting: 'Guzma & Hala CEC 193',
        effectName: 'Guzma & Hala' },
      publicMetadata: { selectionType: 'option' },
      choices: [
        { token: 'mode0', kind: 'option', label: 'Find a Stadium',
          publicMetadata: { choiceIndex: 0 } },
        { token: 'mode1', kind: 'option',
          label: 'Discard 2 cards. Search Stadium, Tool and Special Energy',
          publicMetadata: { choiceIndex: 1 } }
      ]
    }), { kind: 'select-choice', token: 'mode1' });

    // 5. Hala's discard cost uses the two Grass Energy cards.
    assert.deepEqual(choose(p, seat, v, [], cardPrompt(
      'Guzma & Hala CEC 193', [
        cardChoice('grass0', 'Grass Energy MEE 9', 'hand'),
        cardChoice('grass1', 'Grass Energy MEE 9', 'hand')
      ], 2, 2)), picks(['grass0', 'grass1']));

    // 6. One Stadium, one Tool, one Special Energy from that search.
    v.ownHand = [];
    const search = choose(p, seat, v, [], cardPrompt(
      'Guzma & Hala CEC 193', [
        cardChoice('tree', 'Grand Tree SCR 136', 'deck'),
        cardChoice('tm', TM, 'deck'),
        cardChoice('jet', JET, 'deck')
      ], 1, 3));
    assert.equal(search.kind, 'select-choices');
    assert.deepEqual(new Set(search.tokens), new Set(['tree', 'tm', 'jet']));

    // 7. With both tools in hand, attach TM before Jet's switch.
    v.ownHand = ['Grand Tree SCR 136', TM, JET];
    v.ownTurnResources.supporterPlayedTurn = 1;
    const tm = rootCard('tm', TM, 'bench', 0);
    const jet = rootCard('jet', JET, 'bench', 0);
    const tree = rootCard('tree', 'Grand Tree SCR 136');
    assert.deepEqual(choose(p, seat, v, [pass, tm, jet, tree]), pick('tm'));

    // 8. The same Bunnelby holding TM is now the best Jet target.
    v.ownPublic.bench[0].tools = [TM];
    v.ownHand = ['Grand Tree SCR 136', JET];
    assert.deepEqual(choose(p, seat, v, [pass, jet, tree]), pick('jet'));

    // 9. Jet attaches from hand to the Benched Bunnelby and promotes it.
    const priorActive = v.ownPublic.active;
    v.ownPublic.active = v.ownPublic.bench[0];
    v.ownPublic.bench[0] = priorActive;
    v.ownPublic.active.energies = [JET];
    v.ownHand = ['Grand Tree SCR 136'];
    const attack = { token: 'evolution', kind: 'attack', attackName: 'Evolution' };
    assert.deepEqual(choose(p, seat, v, [pass, attack, tree]), pick('evolution'));

    // 10. Barrage's second attack-choice prompt prefers TM Evolution.
    assert.deepEqual(choose(p, seat, v, [], {
      promptType: 'ChooseAttackPrompt',
      source: { sourcePrinting: BUNNELBY, effectName: 'Barrage' },
      publicMetadata: { selectionType: 'attack' },
      choices: [
        { token: 'evolution-again', kind: 'attack', label: 'Evolution',
          publicMetadata: { sourceAttack: 'Evolution' } },
        { token: 'burrow', kind: 'attack', label: 'Burrow',
          publicMetadata: { sourceAttack: 'Burrow' } }
      ]
    }), { kind: 'select-choice', token: 'evolution-again' });
  });
}
