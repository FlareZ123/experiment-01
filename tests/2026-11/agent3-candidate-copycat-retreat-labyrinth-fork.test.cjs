'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createPolicy, POLICY_VERSION } =
  require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');

// Frozen candidate has Mimikyu GRI58 and Psychic Energy only.  Copycat copies
// the opponent's last non-GX Apex Dragon, then can choose own discarded Dialga
// Timeless-GX. Wondrous Labyrinth adds a Colorless to the Copycat *cost*.
const psychic = n => Array(n).fill('Psychic Energy MEE 13');
const slot = (printing, hp, type, count, attacks, tools = [], abilities = []) => ({
  printing, hp, damage: 0,
  printed: { stage: 'BASIC', subtypes: ['Basic'], types: [type],
    weakness: [], resistance: [], retreatCost: ['Colorless'] },
  energies: psychic(count), attacks, tools, abilities,
  abilitySuppressions: abilities.map(abilityName =>
    ({ abilityName, suppressed: false }))
});
const vmax = () => slot('Shadow Rider Calyrex VMAX CRE 75', 320,
  'Psychic', 4, [{ name: 'Max Geist',
    cost: ['Colorless', 'Colorless', 'Colorless'], damage: '10+' }],
  ['Float Stone BKT 137']);
const mimikyu = count => slot('Mimikyu GRI 58', 70, 'Psychic', count,
  [{ name: 'Copycat', cost: ['Psychic', 'Colorless'], damage: '' }]);
const clefairy = () => slot("Lillie's Clefairy ex JTG 56", 190,
  'Psychic', 0, [], [], ['Fairy Zone']);
const regidrago = () => slot('Regidrago VSTAR SIT 136', 280, 'Dragon',
  0, [{ name: 'Apex Dragon', cost: ['Grass', 'Grass', 'Fire'], damage: '' }]);
const publicSide = (active, bench, stadium = [], discard = [], gxUsed = false,
  suppression = 0) => ({
  active, bench, stadium, discard, resolvingSupporter: [], lostZone: [],
  handCount: 0, deckCount: 30, publicTurnRestrictions: {
    gxUsed, stadiumAndToolHaveNoEffectTurnsRemaining: suppression
  }
});
const apex = {
  turn: 7, sourcePrinting: 'Regidrago VSTAR SIT 136',
  attackName: 'Apex Dragon', gxAttack: false, copycatAttack: false
};
function eventSlot(pokemon) {
  return pokemon ? {
    printing: pokemon.printing, movedFromBenchToActiveThisTurn: false,
    knownAbilityUse: []
  } : null;
}
function receiptFor(view) {
  return {
    version: protocol.EVENT_RECEIPT_VERSION,
    actorSeat: view.actorSeat, turn: view.globalTurn,
    ownerActive: eventSlot(view.ownPublic.active),
    ownerBench: view.ownPublic.bench.map(eventSlot),
    priorOpponentTurnKO: { any: false, byAttack: false },
    opponentLastTurnAttack: null, opponentLastTurnTurn: 7,
    opponentLastTurnAttacks: [{ ...apex }],
    opponentCopycatChoices: [{ ...apex }],
    // The Copycat user is still on Bench, so the CURRENT Active is not Copycat.
    mimikyuCopycatCompatible: false
  };
}
function request(seat, { labyrinth = false, mimicEnergy = 2,
  copycatReceipt = true, gxUsed = false, suppression = 0 } = {}) {
  const request = {
    role: 'candidate', seat, prompt: null, publicEventReceipt: null,
    observation: {
      actorSeat: seat, globalTurn: 8, decisionKind: 'owner-root', ownHand: [],
      ownPublic: publicSide(vmax(), [mimikyu(mimicEnergy), clefairy()],
        [], ['Dialga-GX UPR 100'], gxUsed, suppression),
      // A lone Regidrago VSTAR is already a Max Geist terminal KO under
      // active Fairy Zone (Psychic Weakness). Keep a real second Pokémon so
      // the counter-ALS choice remains a NONterminal tactical comparison.
      opponentPublic: publicSide(regidrago(),
        [slot('Regidrago V SIT 135', 220, 'Dragon', 0, [])],
        labyrinth ? ['Wondrous Labyrinth ◇ TEU 158'] : [], [], false, suppression),
      ownTurnResources: { supporterPlayedTurn: 0 }
    },
    actionFrontier: { items: [
      { kind: 'retreat', token: 'retreat-mimikyu',
        targetPrinting: 'Mimikyu GRI 58', publicMetadata: { benchIndex: 0 } },
      { kind: 'attack', token: 'attack-max-geist', attackName: 'Max Geist' },
      { kind: 'pass', token: 'pass' }
    ] }
  };
  if (copycatReceipt) request.publicEventReceipt = receiptFor(request.observation);
  return request;
}
const cases = [
  ['Apex receipt: paid Mimikyu retreat is discoverable',
    {}, 'retreat-mimikyu'],
  ['Wondrous: two-Psychic Copycat cannot pay extra Colorless',
    { labyrinth: true }, 'attack-max-geist'],
  ['Wondrous: three-Psychic Copycat can pay extra Colorless',
    { labyrinth: true, mimicEnergy: 3 }, 'retreat-mimikyu'],
  ['No opponent last-attack receipt: never fabricate Copycat',
    { copycatReceipt: false }, 'attack-max-geist'],
  ['Already used GX: no Timeless-GX counter line',
    { gxUsed: true }, 'attack-max-geist']
];
for (const seat of [0, 1]) for (const [label, config, expected] of cases) {
  test(label + ' seat ' + seat, () => {
    const input = request(seat, config);
    protocol.validatePublicEventReceipt(input.publicEventReceipt, input.observation);
    const result = createPolicy({
      role: 'candidate', seat, policyVersion: POLICY_VERSION, config: {}
    }).decideWithAudit(input);
    assert.deepEqual(result.decision, { kind: 'select-action', token: expected });
    assert.deepEqual(result.policyAudit.selectedTokens, [expected]);
    protocol.validateDecision(result.decision, input.prompt,
      new Set(input.actionFrontier.items.map(item => item.token)));
    protocol.validatePolicyAudit(result.policyAudit, input, result.decision,
      POLICY_VERSION);
    assert.deepEqual(result.policyAudit.evaluations.map(x => x.token),
      input.actionFrontier.items.map(x => x.token));
    if (config.labyrinth === true && config.mimicEnergy !== 3) {
      assert.equal(result.policyAudit.evaluations[0].reasonCode,
        'RETREAT_ATTACK_NOT_PAYABLE');
    }
  });
}
