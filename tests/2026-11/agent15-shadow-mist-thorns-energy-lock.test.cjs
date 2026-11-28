'use strict';
const assert=require('node:assert/strict');
const {shadowMistScreen}=require('../../scripts/2026-11/agent15-shadow-mist-thorns-energy-lock.cjs');
// Physical exact 60-card synthetic cards preserve the complete original
// ranks 6/24/29 counts of Thorns, DCE, Mountain, GH, Tag, Trainers' Mail;
// all remaining source cards are indistinguishable filler for this test.
// A candidate Shadow Mist is counted only when Rider CRE74 is in opening
// seven, is selected Active, and a Psychic hand/Fog/Arven→Fog is payable.
// Results compare *opportunities* rather than game or matchup success.
const z=shadowMistScreen(2000,28112029);
assert.equal(z.n,2000);
assert.equal(z[6].both,721);
assert.equal(z[6].mist,315);
assert.equal(z[6].sourceDirect,5);
assert.equal(z[6].sourceSetup,233);
assert.equal(z[24].both,668);
assert.equal(z[24].mist,282);
assert.equal(z[24].sourceDirect,26);
assert.equal(z[24].sourceSetup,260);
assert.equal(z[29].both,680);
assert.equal(z[29].mist,279);
assert.equal(z[29].sourceDirect,8);
assert.equal(z[29].sourceSetup,226);
for (const rank of [6,24,29]) {
  const r=z[rank];
  assert.ok(r.sourceDirect<=r.sourceSetup);
  assert.ok(r.earlyWindow<=r.mist);
  assert.ok(r.windowAfterMailExpected<=r.earlyWindow+1e-9);
  assert.ok(r.sourceFirstReadyExpected>=r.sourceDirect);
  assert.equal(r.paidP+r.energyTutor,r.mist);
  assert.ok(r.sourceValid<=z.n&&r.candValid<=z.n&&r.both<=z.n);
}
assert.ok(z[24].sourceDirectRate>z[6].sourceDirectRate);
assert.ok(z[24].sourceSetupRate>z[29].sourceSetupRate);
console.log('Rider Shadow Mist versus original all-Special Thorns opener regression passed');
