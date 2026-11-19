'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  choosePhantomDiveAllocation,
  enumeratePhantomDiveAllocationChoices,
  enumerateWeakCompositions,
  evaluatePhantomDiveAllocationChoice,
  parsePhantomDiveAllocationLabel
} = require('../../simulation/evaluation/2026-11/agent43-phantom-dive-allocation.cjs');
const { paperPutDamageRejectReason } = require('../../simulation/twinleaf/put-damage-zero-cap-paper-hook.cjs');

function target(index, maxAllowedDamage = 60) {
  return {
    target: { player: 1, slot: 2, index },
    ownerSeat: 'opponent', zone: 'bench', index, maxAllowedDamage
  };
}
function pokemon(printing, hp, damage = 0, subtypes = ['Basic']) {
  return { printing, hp, damage, printed: { subtypes } };
}
function observation(bench, prizeCount = 6) {
  return {
    ownPublic: { prizeCount },
    opponentPublic: { bench, discard: [], active: pokemon('Shadow Rider Calyrex V CRE 74', 320) }
  };
}
function projected(targets) {
  return enumeratePhantomDiveAllocationChoices({
    damage: 60, damageMultiple: 10, allowPlacePartialDamage: false, targets
  });
}

test('six counters across five legal Bench slots produce 210 complete token choices', () => {
  const result = projected([target(0), target(1), target(2), target(3), target(4)]);
  assert.equal(result.ok, true);
  assert.equal(result.choices.length, 210);
  assert.equal(result.choiceByToken.size, 210);
  for (const choice of result.choices) {
    const rows = parsePhantomDiveAllocationLabel(choice.label);
    assert.ok(rows);
    assert.equal(rows.reduce((sum, row) => sum + row.damage, 0), 60);
    assert.ok(rows.every(row => row.ownerSeat === 'opponent' && row.zone === 'bench'));
    assert.equal(new Set(rows.map(row => row.index)).size, rows.length);
    assert.deepEqual(result.choiceByToken.get(choice.token).map(x => x.damage).sort((a,b)=>a-b),
      rows.map(x => x.damage).sort((a,b)=>a-b));
  }
});

test('six-target upper bound is 462, below the existing 512-choice protocol cap', () => {
  assert.equal(enumerateWeakCompositions(6, 6).length, 462);
  const result = projected(Array.from({ length: 6 }, (_, i) => target(i)));
  assert.equal(result.ok, true);
  assert.equal(result.choices.length, 462);
});

test('zero-cap target is excluded; positive maxAllowedDamage is not treated as a cap', () => {
  const result = projected([target(0, 0), target(1, 10)]);
  assert.equal(result.ok, true);
  assert.equal(result.choices.length, 1);
  const placements = result.choiceByToken.get(result.choices[0].token);
  assert.deepEqual(placements, [{ target: { player: 1, slot: 2, index: 1 }, damage: 60 }]);
});

test('duplicate target descriptors fail closed', () => {
  const result = projected([target(0), target(0)]);
  assert.equal(result.ok, false);
  assert.equal(result.reasonCode, 'DUPLICATE_PHANTOM_DIVE_TARGET');
});

test('wrong slot, owner, or malformed native geometry fails closed', () => {
  for (const row of [
    { ...target(0), ownerSeat: 'actor' },
    { ...target(0), zone: 'active' },
    { ...target(0), index: -1 },
    { ...target(0), maxAllowedDamage: -1 }
  ]) {
    const result = projected([row]);
    assert.equal(result.ok, false);
  }
});

test('partial, non-60, and non-10-packet prompt contracts are not silently generalized', () => {
  const base = { damage: 60, damageMultiple: 10, allowPlacePartialDamage: false, targets: [target(0)] };
  assert.equal(enumeratePhantomDiveAllocationChoices({ ...base, allowPlacePartialDamage: true }).reasonCode,
    'UNSUPPORTED_PUT_DAMAGE_CONTRACT');
  assert.equal(enumeratePhantomDiveAllocationChoices({ ...base, damage: 50 }).reasonCode,
    'UNSUPPORTED_PUT_DAMAGE_CONTRACT');
  assert.equal(enumeratePhantomDiveAllocationChoices({ ...base, damageMultiple: 5 }).reasonCode,
    'UNSUPPORTED_PUT_DAMAGE_CONTRACT');
});

test('choice cap is enforced before exposing a partial menu', () => {
  const result = enumeratePhantomDiveAllocationChoices({
    damage: 60, damageMultiple: 10, allowPlacePartialDamage: false,
    targets: Array.from({ length: 6 }, (_, i) => target(i)), maxChoices: 100
  });
  assert.equal(result.ok, false);
  assert.equal(result.reasonCode, 'PHANTOM_DIVE_CHOICE_LIMIT_EXCEEDED');
  assert.equal(result.choices.length, 0);
  assert.equal(enumeratePhantomDiveAllocationChoices({
    damage: 60, damageMultiple: 10, allowPlacePartialDamage: false,
    targets: [target(0)], maxChoices: 513
  }).ok, false);
});

test('host validator callback filters native-invalid allocations before exposing tokens', () => {
  const result = enumeratePhantomDiveAllocationChoices({
    damage: 60, damageMultiple: 10, allowPlacePartialDamage: false,
    targets: [target(0), target(1)],
    validateResult: placements => ({ valid: placements.every(row => row.damage <= 40) })
  });
  assert.equal(result.ok, true);
  assert.equal(result.nativeValidated, true);
  assert.equal(result.nativeValidationCount, 7);
  assert.equal(result.choices.length, 3);
  assert.ok(result.choices.every(choice =>
    result.choiceByToken.get(choice.token).every(row => row.damage <= 40)));
});

test('all native-rejected allocations produce no partial choice menu', () => {
  const result = enumeratePhantomDiveAllocationChoices({
    damage: 60, damageMultiple: 10, allowPlacePartialDamage: false,
    targets: [target(0)], validateResult: () => false
  });
  assert.equal(result.ok, false);
  assert.equal(result.reasonCode, 'NO_NATIVE_VALID_ALLOCATION');
  assert.equal(result.choices.length, 0);
  assert.equal(result.nativeValidationCount, 1);
});

test('generated allocations pass the existing paper PutDamage guard before token exposure', () => {
  const nativeTargets = [target(0, 0), target(1, 10), target(2, 60)];
  const prompt = {
    damage: 60,
    options: { damageMultiple: 10, allowPlacePartialDamage: false },
    maxAllowedDamage: nativeTargets.map(row => ({ target: row.target, damage: row.maxAllowedDamage })),
    validate(answer) {
      return Array.isArray(answer) && answer.reduce((sum, row) => sum + row.damage, 0) === 60 &&
        answer.every(row => this.maxAllowedDamage.some(cap =>
          cap.target.player === row.target.player && cap.target.slot === row.target.slot &&
          cap.target.index === row.target.index && cap.damage > 0));
    }
  };
  const result = enumeratePhantomDiveAllocationChoices({
    damage: 60, damageMultiple: 10, allowPlacePartialDamage: false,
    targets: nativeTargets.map(row => ({ ...row, ownerSeat: 'opponent', zone: 'bench' })),
    validateResult: placements => paperPutDamageRejectReason(prompt, placements, {}) === null
  });
  assert.equal(result.ok, true);
  assert.equal(result.nativeValidated, true);
  assert.equal(result.choices.length, 7);
  for (const choice of result.choices) {
    assert.equal(paperPutDamageRejectReason(prompt, result.choiceByToken.get(choice.token), {}), null);
  }
});

test('paper guard rejects a zero-cap target even when the prompt validator accepts it', () => {
  const zero = target(0, 0);
  const prompt = {
    damage: 60,
    options: { damageMultiple: 10, allowPlacePartialDamage: false },
    maxAllowedDamage: [{ target: zero.target, damage: 0 }],
    validate: () => true
  };
  assert.equal(paperPutDamageRejectReason(prompt, [{ target: zero.target, damage: 60 }], {}),
    'PRINTED_TARGET_ZERO_CAP');
});

test('allocation labels reject wrong totals, duplicates, and non-packet damage', () => {
  assert.equal(parsePhantomDiveAllocationLabel('PD1|b0=50'), null);
  assert.equal(parsePhantomDiveAllocationLabel('PD1|b0=30,b0=30'), null);
  assert.equal(parsePhantomDiveAllocationLabel('PD1|b0=25,b1=35'), null);
  assert.deepEqual(parsePhantomDiveAllocationLabel('PD1|b0=60'), [
    { ownerSeat: 'opponent', zone: 'bench', index: 0, damage: 60 }
  ]);
});

test('one-target allocation is valid and parser preserves the exact total', () => {
  assert.deepEqual(parsePhantomDiveAllocationLabel('PD1|b0=60'), [
    { ownerSeat: 'opponent', zone: 'bench', index: 0, damage: 60 }
  ]);
});

test('highest Prize value allocation wins over a lower-value spread', () => {
  const obs = observation([
    pokemon('Shadow Rider Calyrex VMAX CRE 75', 320, 260, ['VMAX']),
    pokemon('Mimikyu GRI 58', 70, 0),
    pokemon('Tapu Lele-GX GRI 60', 170, 0, ['Basic', 'GX'])
  ]);
  const choices = [
    { token: 'spread', kind: 'allocation', label: 'PD1|b1=30,b2=30' },
    { token: 'vmax', kind: 'allocation', label: 'PD1|b0=60' }
  ];
  assert.deepEqual(choosePhantomDiveAllocation(choices, obs), { kind: 'select-choice', token: 'vmax' });
  assert.equal(evaluatePhantomDiveAllocationChoice(choices[1], obs).prizes, 3);
});

test('two one-Prize KOs beat one two-Prize KO when both take the same total Prizes', () => {
  const obs = observation([
    pokemon('Tapu Lele-GX GRI 60', 170, 150, ['Basic', 'GX']),
    pokemon('Mimikyu GRI 58', 70, 0),
    pokemon('Budew ASC 16', 30, 0),
    pokemon('Radiant Eternatus CRZ 105', 30, 0, ['Basic', 'Radiant'])
  ]);
  const choices = [
    { token: 'one', kind: 'allocation', label: 'PD1|b0=20,b1=40' },
    { token: 'two', kind: 'allocation', label: 'PD1|b2=30,b3=30' }
  ];
  const selected = choosePhantomDiveAllocation(choices, obs);
  assert.deepEqual(selected, { kind: 'select-choice', token: 'two' });
});

test('an immediate Prize win outranks non-winning allocations', () => {
  const obs = observation([
    pokemon('Tapu Lele-GX GRI 60', 170, 150, ['Basic', 'GX']),
    pokemon('Radiant Eternatus CRZ 105', 30, 0, ['Basic', 'Radiant'])
  ], 3);
  const choices = [
    { token: 'win', kind: 'allocation', label: 'PD1|b0=20,b1=40' },
    { token: 'partial', kind: 'allocation', label: 'PD1|b0=60' }
  ];
  assert.deepEqual(choosePhantomDiveAllocation(choices, obs), { kind: 'select-choice', token: 'win' });
  assert.equal(evaluatePhantomDiveAllocationChoice(choices[0], obs).immediateWin, true);
});

test('without KOs, damage is concentrated on the highest-priority exposed target', () => {
  const obs = observation([
    pokemon('Mimikyu GRI 58', 70, 0),
    pokemon("Lillie's Clefairy ex JTG 56", 190, 0, ['Basic', 'ex'])
  ]);
  const choices = [
    { token: 'split', kind: 'allocation', label: 'PD1|b0=30,b1=30' },
    { token: 'mimikyu', kind: 'allocation', label: 'PD1|b0=60' }
  ];
  assert.deepEqual(choosePhantomDiveAllocation(choices, obs), { kind: 'select-choice', token: 'mimikyu' });
});

test('Prize valuation recognizes fullName-only VMAX printings', () => {
  const obs = observation([
    { fullName: 'Shadow Rider Calyrex VMAX CRE 75', hp: 320, damage: 260, printed: { subtypes: [] } },
    pokemon('Tapu Lele-GX GRI 60', 170, 110, ['Basic', 'GX'])
  ]);
  const choices = [
    { token: 'vmax', kind: 'allocation', label: 'PD1|b0=60' },
    { token: 'gx', kind: 'allocation', label: 'PD1|b1=60' }
  ];
  assert.deepEqual(choosePhantomDiveAllocation(choices, obs), { kind: 'select-choice', token: 'vmax' });
  assert.equal(evaluatePhantomDiveAllocationChoice(choices[0], obs).prizes, 3);
});

test('target priority recognizes fullName-only Mimikyu printings', () => {
  const obs = observation([
    { fullName: 'Mimikyu GRI 58', hp: 70, damage: 0, printed: { subtypes: ['Basic'] } },
    pokemon('Pidgeot', 61, 0, ['Basic'])
  ]);
  const choices = [
    { token: 'mimikyu', kind: 'allocation', label: 'PD1|b0=60' },
    { token: 'pidgeot', kind: 'allocation', label: 'PD1|b1=60' }
  ];
  assert.deepEqual(choosePhantomDiveAllocation(choices, obs), { kind: 'select-choice', token: 'mimikyu' });
});

test('selected allocation reaches the maximum Prize value available in the complete choice set', () => {
  const obs = observation([
    pokemon('Shadow Rider Calyrex VMAX CRE 75', 320, 250, ['VMAX']),
    pokemon('Tapu Lele-GX GRI 60', 170, 140, ['Basic', 'GX']),
    pokemon('Budew ASC 16', 30, 0),
    pokemon('Mimikyu GRI 58', 70, 50),
    pokemon('Latias ex SSP 76', 210, 170, ['Basic', 'ex'])
  ]);
  const result = projected([0, 1, 2, 3, 4].map(i => target(i)));
  const selected = choosePhantomDiveAllocation(result.choices, obs);
  const selectedChoice = result.choices.find(choice => choice.token === selected.token);
  const selectedValue = evaluatePhantomDiveAllocationChoice(selectedChoice, obs);
  const maximumPrizeValue = Math.max(...result.choices.map(choice =>
    evaluatePhantomDiveAllocationChoice(choice, obs)?.prizes ?? -1));
  assert.equal(selectedValue.prizes, maximumPrizeValue);
});

test('allocation selector requires an allocation-kind choice', () => {
  const obs = observation([pokemon('Budew ASC 16', 30)]);
  assert.deepEqual(choosePhantomDiveAllocation([
    { token: 'wrong-kind', kind: 'option', label: 'PD1|b0=60' }
  ], obs), { kind: 'abstain', reasonCode: 'NO_LEGAL_PHANTOM_DIVE_ALLOCATION' });
});

test('unknown Active HP does not fabricate an immediate win', () => {
  const obs = observation([pokemon('Budew ASC 16', 30)], 6);
  obs.opponentPublic.active = null;
  const evaluation = evaluatePhantomDiveAllocationChoice(
    { token: 'one', kind: 'allocation', label: 'PD1|b0=60' }, obs);
  assert.equal(evaluation.immediateWin, false);
});

test('malformed and missing allocations fail closed', () => {
  const obs = observation([pokemon('Budew ASC 16', 30)]);
  assert.deepEqual(choosePhantomDiveAllocation([
    { token: 'bad', kind: 'allocation', label: 'PD1|b0=50' }
  ], obs), { kind: 'abstain', reasonCode: 'NO_LEGAL_PHANTOM_DIVE_ALLOCATION' });
  assert.deepEqual(choosePhantomDiveAllocation([], obs),
    { kind: 'abstain', reasonCode: 'NO_LEGAL_PHANTOM_DIVE_ALLOCATION' });
});
