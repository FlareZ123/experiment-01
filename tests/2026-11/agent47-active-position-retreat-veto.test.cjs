'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  hasActivePositionAbilityToPreserve
} = require('../../simulation/twinleaf/agent47-active-position-retreat-veto.cjs');
const {
  chooseOwnerFloatStoneMobility
} = require('../../simulation/twinleaf/agent1-owner-float-stone-mobility.cjs');
const {
  chooseFreeRetreatToPotentialKo
} = require('../../simulation/twinleaf/agent7-actor-free-retreat-frontier.cjs');
const {
  chooseZeroEnergyStrandFloatStone
} = require('../../simulation/twinleaf/agent31-zero-energy-strand-floatstone.cjs');
const {
  proposeTwoUnitPaidRetreat
} = require('../../simulation/twinleaf/agent42-public-two-unit-paid-retreat-proposal.cjs');

const ABILITIES = [
  ['Iron Thorns ex / Initialization',
    'As long as this Pokémon is in the Active Spot, Pokémon with a Rule Box in play (both yours and your opponent\'s) have no Abilities, except for Future Pokémon.'],
  ['Stoutland / Sentinel',
    'As long as this Pokémon is your Active Pokémon, your opponent can\'t play any Supporter cards from his or her hand.'],
  ['Galarian Weezing / Neutralizing Gas',
    'As long as this Pokémon is in the Active Spot, your opponent\'s Pokémon in play have no Abilities, except for Neutralizing Gas.'],
  ['Jellicent ex / Oceanic Curse',
    'As long as this Pokémon is in the Active Spot, your opponent can\'t play any Item cards or Pokémon Tool cards from their hand.'],
  ['Active-status conditional',
    'If this Pokémon is in the Active Spot, your opponent\'s Active Pokémon can\'t retreat.']
];

/** @param {string|null} abilityText */
function fixture(abilityText = null) {
  const active = {
    name: 'Iron Thorns ex',
    printing: 'Iron Thorns ex TWM',
    printed: { stage: 0, retreatCost: [], types: [3] },
    energies: [], tools: [],
    attacks: [{name: 'Volt Cyclone',cost: [3,9,9],damage:140,
      text: 'Move an Energy',damageCalculation:null,gxAttack:false}],
    abilityDetails: abilityText === null ? [] :
      [{ name: 'Owner ability',text: abilityText }],
    publicRestrictions: {},specialConditions: []
  };
  const bench = {
    name: 'Example Basic',printing:'Example Basic MEE',
    energies: ['Psychic Energy MEE'],
    attacks: [{name:'Safe Strike',cost:[5],damage:120,text:'',
      damageCalculation:null,gxAttack:false}],
    publicRestrictions: {},specialConditions:[]
  };
  return {
    decisionKind:'owner-root',actorSeat:0,globalTurn:4,ownHand:[],
    ownPublic: {active,bench:[bench],stadium:[],
      resolvingSupporter:[],
      publicTurnRestrictions:{attackLockTurnsRemaining:0}},
    opponentPublic: {active:{hp:90,damage:0,printed:{},tools:[]},
      bench:[],stadium:[]},
    ownTurnResources: {retreatedTurn:0,toolPlayLocked:false}
  };
}

const catalog = {
  basicEnergies:new Set(['Psychic Energy MEE']),
  basicEnergyTypes:{Psychic:5},
  colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:3},
  stages:{BASIC:0,RESTORED:1}
};

test('unlocked ordinary zero-Energy Active still has a genuine available free-retreat intent', () => {
  const view=fixture();
  assert.equal(hasActivePositionAbilityToPreserve(view),false);
  assert.deepEqual(chooseOwnerFloatStoneMobility(view,catalog),{
    kind:'retreat-emergency-floatstone',
    benchIndex:0,printing:'Example Basic MEE'
  });
  assert.deepEqual(chooseFreeRetreatToPotentialKo(view,catalog),{
    kind:'free-retreat',benchIndex:0,printing:'Example Basic MEE',
    attackName:'Safe Strike'
  });
});

for(const [label,text] of ABILITIES){
  test(label+' actively protected from all generic mobility fallbacks',()=>{
    const view=fixture(text);
    assert.equal(hasActivePositionAbilityToPreserve(view),true);
    assert.equal(chooseOwnerFloatStoneMobility(view,catalog),null);
    assert.equal(chooseFreeRetreatToPotentialKo(view,catalog),null);
    const paidTool={...view,ownPublic:{...view.ownPublic,
      active:{...view.ownPublic.active,
        printed:{stage:0,retreatCost:[9]},energies:[]}}};
    assert.equal(chooseZeroEnergyStrandFloatStone(paidTool,catalog),null);
    const paidTwo={...view,ownPublic:{...view.ownPublic,
      active:{...view.ownPublic.active,
        printed:{stage:0,retreatCost:[9,9]},
        energies:['Psychic Energy MEE','Psychic Energy MEE']}}};
    assert.equal(proposeTwoUnitPaidRetreat(paidTwo,catalog),null);
  });
}

test('Bench-conditioned and voluntary on-turn Abilities do not trigger this active-position veto', () => {
  for(const text of [
    'As long as this Pokémon is on your Bench, your Pokémon take 20 less damage.',
    'Once during your turn, you may draw a card.',
    'When this Pokémon moves from the Active Spot to your Bench, you may draw 2 cards.'
  ]){
    const view=fixture(text);
    assert.equal(hasActivePositionAbilityToPreserve(view),false);
    assert.equal(chooseFreeRetreatToPotentialKo(view,catalog)?.kind,'free-retreat');
  }
});

test('veto observes only the acting player\'s visible Active Ability, never opponent hidden zones', () => {
  const view=fixture();
  view.opponentPublic.hiddenHand=['SENSITIVE', 'ARBITRARY'];
  view.opponentPublic.active.abilityDetails=[{name:'Neutralizing Gas',
    text: ABILITIES[2][1]}];
  assert.equal(hasActivePositionAbilityToPreserve(view),false);
  view.ownPublic.active.abilityDetails=[{name:'Initialization',text:ABILITIES[0][1]}];
  assert.equal(hasActivePositionAbilityToPreserve(view),true);
});
