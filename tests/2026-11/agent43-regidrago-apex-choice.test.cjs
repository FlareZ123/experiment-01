'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  chooseApexAttack,
  evaluateApexAttackChoice,
  maxBenchPrizeValueWithCounters,
  rankApexChoices
} = require('../../simulation/evaluation/2026-11/agent43-regidrago-apex-choice.cjs');

function pokemon(printing, options = {}) {
  return {
    printing,
    hp: options.hp ?? 280,
    damage: options.damage ?? 0,
    printed: {
      subtypes: options.subtypes ?? ['Basic'],
      types: options.types ?? ['Dragon'],
      weakness: options.weakness ?? [],
      resistance: options.resistance ?? []
    },
    energies: options.energies ?? [],
    tools: options.tools ?? []
  };
}

function observation(options = {}) {
  return {
    ownHand: options.ownHand ?? [],
    ownPublic: {
      active: options.ownActive ?? pokemon('Regidrago VSTAR SIT 136', {
        hp: 280, subtypes: ['VSTAR'], energies: ['Double Dragon Energy XY 97']
      }),
      bench: options.ownBench ?? [],
      stadium: options.ownStadium ?? [],
      deckCount: options.deckCount ?? 20,
      publicTurnRestrictions: { gxUsed: options.gxUsed ?? false },
      prizeCount: options.ownPrizeCount ?? 6
    },
    opponentPublic: {
      active: options.opponentActive ?? pokemon('Shadow Rider Calyrex VMAX CRE 75', {
        hp: 320, subtypes: ['VMAX'], types: ['Psychic'], weakness: [{ type: 'Darkness', value: '×2' }]
      }),
      bench: options.opponentBench ?? [],
      stadium: options.opponentStadium ?? [],
      prizeCount: options.opponentPrizeCount ?? 6
    }
  };
}

function choice(token, attackName, extra = {}) {
  return {
    token,
    kind: 'attack',
    label: attackName,
    publicMetadata: { sourceAttack: attackName, ...extra }
  };
}

test('Timeless-GX is preferred when GX is unused and the target is not an immediate Kaiser KO', () => {
  const obs = observation();
  const choices = [choice('k', 'Kaiser Tackle'), choice('t', 'Timeless-GX')];
  assert.deepEqual(chooseApexAttack(choices, obs), { kind: 'select-choice', token: 't' });
});

test('an immediate prize win outranks the extra-turn preference', () => {
  const obs = observation({
    ownPrizeCount: 2,
    opponentActive: pokemon('Regidrago VSTAR SIT 136', { hp: 280, subtypes: ['VSTAR'], types: ['Dragon'] })
  });
  const choices = [choice('t', 'Timeless-GX'), choice('k', 'Kaiser Tackle')];
  assert.deepEqual(chooseApexAttack(choices, obs), { kind: 'select-choice', token: 'k' });
  assert.equal(evaluateApexAttackChoice(choices[1], obs).immediateWin, true);
});

test('a self-KOing Kaiser Tackle is still selected if it wins the game immediately', () => {
  const obs = observation({
    ownPrizeCount: 3,
    ownActive: pokemon('Regidrago VSTAR SIT 136', { hp: 280, damage: 230, subtypes: ['VSTAR'] }),
    opponentActive: pokemon('Shadow Rider Calyrex VMAX CRE 75', {
      hp: 320, subtypes: ['VMAX'], types: ['Psychic'], weakness: [{ type: 'Dragon', value: '×2' }]
    })
  });
  const result = evaluateApexAttackChoice(choice('k', 'Kaiser Tackle'), obs);
  assert.equal(result.selfKnockout, true);
  assert.equal(result.immediateWin, true);
  assert.equal(result.score, 300);
});

test('Timeless-GX is rejected when GX use is already recorded', () => {
  const obs = observation({ gxUsed: true });
  const choices = [choice('t', 'Timeless-GX'), choice('k', 'Kaiser Tackle')];
  assert.deepEqual(chooseApexAttack(choices, obs), { kind: 'select-choice', token: 'k' });
  assert.equal(evaluateApexAttackChoice(choices[0], obs).score, -1);
});

test('Timeless-GX fails closed when GX status is unknown', () => {
  const obs = observation();
  delete obs.ownPublic.publicTurnRestrictions.gxUsed;
  assert.equal(evaluateApexAttackChoice(choice('t', 'Timeless-GX'), obs).score, -1);
});

test('Kaiser Tackle includes Muscle Band before Dragon Weakness', () => {
  const obs = observation({
    ownActive: pokemon('Regidrago VSTAR SIT 136', {
      hp: 280, subtypes: ['VSTAR'], tools: ['Muscle Band XY 121']
    }),
    opponentActive: pokemon('Dialga-GX UPR 100', {
      hp: 280, subtypes: ['Basic', 'GX'], weakness: [{ type: 'Dragon', value: '×2' }]
    })
  });
  const result = evaluateApexAttackChoice(choice('k', 'Kaiser Tackle'), obs);
  assert.equal(result.damage, 600);
  assert.equal(result.activeKnockout, true);
});

test('Kaiser Tackle is heavily penalized if its 60 self-damage would Knock Out Regidrago', () => {
  const obs = observation({
    ownActive: pokemon('Regidrago VSTAR SIT 136', { hp: 280, damage: 230, subtypes: ['VSTAR'] }),
    opponentActive: pokemon('Shadow Rider Calyrex VMAX CRE 75', {
      hp: 280, subtypes: ['VMAX'], types: ['Psychic']
    })
  });
  const result = evaluateApexAttackChoice(choice('k', 'Kaiser Tackle'), obs);
  assert.equal(result.selfKnockout, true);
  assert.equal(result.score, 110);
});

test('Phantom Dive allocates six counters to maximize actual bench Prizes', () => {
  const bench = [
    pokemon("Lillie's Clefairy ex JTG 56", { hp: 190, subtypes: ['Basic', 'ex'], types: ['Psychic'] }),
    pokemon('Radiant Eternatus CRZ 105', { hp: 30, subtypes: ['Basic', 'Radiant'], types: ['Dragon'] }),
    pokemon('Tapu Lele-GX GRI 60', { hp: 30, subtypes: ['Basic', 'GX'], types: ['Psychic'] })
  ];
  const result = maxBenchPrizeValueWithCounters(bench, 6);
  assert.deepEqual(result, { prizes: 3, kos: 2, spent: 6 });
});

test('Prize allocation counts TAG TEAM Pokémon-GX as three Prizes', () => {
  const bench = [
    pokemon('Trevenant & Dusknoir-GX UNB 166', {
      hp: 270, damage: 210, subtypes: ['Basic', 'GX', 'TAG TEAM'], types: ['Psychic']
    })
  ];
  assert.deepEqual(maxBenchPrizeValueWithCounters(bench, 6), { prizes: 3, kos: 1, spent: 6 });
});

test('Phantom Dive values bench KOs in addition to its Active damage', () => {
  const obs = observation({
    opponentBench: [
      pokemon('Radiant Eternatus CRZ 105', { hp: 30, subtypes: ['Basic', 'Radiant'] }),
      pokemon('Tapu Lele-GX GRI 60', { hp: 30, subtypes: ['Basic', 'GX'] })
    ]
  });
  const result = evaluateApexAttackChoice(choice('p', 'Phantom Dive'), obs);
  assert.equal(result.benchPrizeValue, 3);
  assert.equal(result.benchKnockouts, 2);
});

test('Trifrost values multiple KOs across Active and Bench', () => {
  const obs = observation({
    opponentActive: pokemon('Dialga-GX UPR 100', {
      hp: 110, subtypes: ['Basic', 'GX'], weakness: [{ type: 'Dragon', value: '×2' }]
    }),
    opponentBench: [
      pokemon("Lillie's Clefairy ex JTG 56", { hp: 110, subtypes: ['Basic', 'ex'] }),
      pokemon('Tapu Lele-GX GRI 60', { hp: 110, subtypes: ['Basic', 'GX'] })
    ]
  });
  const result = evaluateApexAttackChoice(choice('t', 'Trifrost'), obs);
  assert.equal(result.damage, 220);
  assert.equal(result.targetKnockouts, 3);
  assert.equal(result.targetPrizeValue, 6);
});

test('Rolling Iron is valued as a 200-damage attack with a defensive follow-up effect', () => {
  const obs = observation({
    ownActive: pokemon('Regidrago VSTAR SIT 136', { hp: 280, damage: 100, subtypes: ['VSTAR'] })
  });
  const result = evaluateApexAttackChoice(choice('r', 'Rolling Iron'), obs);
  assert.equal(result.damage, 200);
  assert.equal(result.score, 162);
});

test('Outrage scales from damage counters on the attacking Regidrago', () => {
  const obs = observation({
    ownActive: pokemon('Regidrago VSTAR SIT 136', { hp: 280, damage: 100, subtypes: ['VSTAR'] }),
    opponentActive: pokemon('Shadow Rider Calyrex VMAX CRE 75', {
      hp: 120, subtypes: ['VMAX'], types: ['Psychic']
    })
  });
  const result = evaluateApexAttackChoice(choice('o', 'Outrage'), obs);
  assert.equal(result.damage, 120);
  assert.equal(result.activeKnockout, true);
});

test('Overclock is useful when the actor hand is short', () => {
  const obs = observation({ ownHand: ['Grass Energy MEE 1', 'Double Dragon Energy XY 97'] });
  assert.ok(evaluateApexAttackChoice(choice('o', 'Overclock'), obs).score > 90);
});

test('Celestial Roar is a fallback acceleration line when Regidrago has little Energy', () => {
  const obs = observation({
    ownActive: pokemon('Regidrago VSTAR SIT 136', {
      hp: 280, subtypes: ['VSTAR'], energies: ['Double Dragon Energy XY 97']
    })
  });
  assert.equal(evaluateApexAttackChoice(choice('c', 'Celestial Roar'), obs).score, 68);
});

test('Jet Headbutt is a supported 70-damage Dragon payload and values an Active Knock Out', () => {
  const ordinary = evaluateApexAttackChoice(choice('j', 'Jet Headbutt'), observation());
  assert.equal(ordinary.damage, 70);
  assert.equal(ordinary.score, 85);
  const knockout = evaluateApexAttackChoice(choice('j', 'Jet Headbutt'), observation({
    opponentActive: pokemon('Basic low-HP Pokémon', { hp: 70, subtypes: ['Basic'], types: ['Colorless'] })
  }));
  assert.equal(knockout.activeKnockout, true);
  assert.equal(knockout.score, 123);
});

test('Covert Flight values its Basic-attack protection only when the current Active is Basic', () => {
  const basic = evaluateApexAttackChoice(choice('c', 'Covert Flight'), observation({
    opponentActive: pokemon('Basic attacker', { hp: 180, subtypes: ['Basic'], types: ['Colorless'] })
  }));
  const evolved = evaluateApexAttackChoice(choice('c', 'Covert Flight'), observation({
    opponentActive: pokemon('Shadow Rider Calyrex VMAX CRE 75', {
      hp: 320, subtypes: ['VMAX'], types: ['Psychic']
    })
  }));
  assert.equal(basic.protectedAgainstBasic, true);
  assert.equal(basic.score, 130);
  assert.equal(evolved.protectedAgainstBasic, false);
  assert.equal(evolved.score, 60);
});

test('Dominating Echo values visible Stadium or Special Energy use as lock targets', () => {
  const noVisibleTarget = evaluateApexAttackChoice(choice('d', 'Dominating Echo'), observation());
  const opponentOwnedStadium = evaluateApexAttackChoice(choice('d', 'Dominating Echo'), observation({
    opponentStadium: ['Path to the Peak']
  }));
  const attackerOwnedStadium = evaluateApexAttackChoice(choice('d', 'Dominating Echo'), observation({
    ownStadium: ['Path to the Peak']
  }));
  const specialEnergyTarget = evaluateApexAttackChoice(choice('d', 'Dominating Echo'), observation({
    opponentBench: [pokemon('Opponent Pokémon', { energies: ['Double Dragon Energy XY 97'] })]
  }));
  assert.equal(noVisibleTarget.score, 185);
  assert.equal(opponentOwnedStadium.stadiumInPlay, true);
  assert.equal(opponentOwnedStadium.score, 260);
  assert.equal(attackerOwnedStadium.stadiumInPlay, true);
  assert.equal(attackerOwnedStadium.score, 260);
  assert.equal(specialEnergyTarget.opponentHasSpecialEnergy, true);
  assert.equal(specialEnergyTarget.score, 260);
});

test('Ryuno Glide values a 330-damage Knock Out while recording its two-Energy resource cost', () => {
  const knockout = evaluateApexAttackChoice(choice('r', 'Ryuno Glide'), observation({
    opponentActive: pokemon('Shadow Rider Calyrex VMAX CRE 75', {
      hp: 320, subtypes: ['VMAX'], types: ['Psychic']
    })
  }));
  const noKnockout = evaluateApexAttackChoice(choice('r', 'Ryuno Glide'), observation({
    opponentActive: pokemon('Large Pokémon', { hp: 400, subtypes: ['VMAX'], types: ['Psychic'] })
  }));
  assert.equal(knockout.damage, 330);
  assert.equal(knockout.activeKnockout, true);
  assert.equal(knockout.energyDiscard, 2);
  assert.equal(knockout.energyDiscardPenalty, 30);
  assert.equal(knockout.score, 270);
  assert.equal(noKnockout.activeKnockout, false);
  assert.equal(noKnockout.score, 150);
});

test('all newly supported Dragon payloads still fail closed when native cost is not payable', () => {
  for (const name of ['Jet Headbutt', 'Covert Flight', 'Dominating Echo', 'Ryuno Glide']) {
    const result = evaluateApexAttackChoice(choice(name, name, { attackCostPayable: false }), observation());
    assert.equal(result.score, -1, name);
    assert.equal(result.reason, 'ATTACK_COST_NOT_PAYABLE', name);
  }
});

test('unknown or non-Apex attack choices fail closed', () => {
  const obs = observation();
  assert.deepEqual(chooseApexAttack([choice('x', 'Unknown Attack')], obs), {
    kind: 'abstain', reasonCode: 'NO_SUPPORTED_APEX_ATTACK'
  });
});

test('attack choice ranking is deterministic and preserves source order on ties', () => {
  const obs = observation({ gxUsed: true });
  const choices = [choice('a', 'Overclock'), choice('b', 'Overclock')];
  const ranked = rankApexChoices(choices, obs);
  assert.equal(ranked[0].choice.token, 'a');
});
