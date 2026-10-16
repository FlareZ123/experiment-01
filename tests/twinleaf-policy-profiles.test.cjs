'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');
const {resolveManifestFile} = require('../simulation/twinleaf/resolve-field.cjs');
const {runWithResearchProfile,withTempleUnlockTactic,DEFAULT_PROFILE,
  REGIDRAGO_PROFILE,SUPPORTER_PROFILE,REGIDRAGO_SUPPORTER_PROFILE} =
  require('../simulation/twinleaf/policy-profiles.cjs');

const output = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');

/** @returns {object} */
function sourceInput() {
  const file = path.resolve(__dirname, '../results/aichi-2026/full-decklists.json');
  const field = resolveManifestFile(file, {
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const byRank = new Map(field.decks.map(deck => [deck.rank,deck]));
  return {deckA:byRank.get(10).cardIds,deckB:byRank.get(1).cardIds,
    seed:20261016,maxActions:120,label:'policy rollback smoke'};
}

test('profile hooks restore shared tactic identity after success and failure', () => {
  initializeCards();
  const definitions = require(path.join(output,'simple-bot/simple-bot-definitions'));
  const before = definitions.allSimpleTactics.slice();
  const count = before.length;
  assert.throws(() => withTempleUnlockTactic(() => {
    assert.equal(definitions.allSimpleTactics.length,count+1);
    throw new Error('sentinel failure');
  }),/sentinel failure/);
  assert.deepEqual(definitions.allSimpleTactics,before);

  const first = runWithResearchProfile(sourceInput(),DEFAULT_PROFILE);
  const upgraded = runWithResearchProfile(sourceInput(),REGIDRAGO_PROFILE);
  assert.equal(upgraded.researchPolicyProfile,REGIDRAGO_PROFILE);
  assert.equal(upgraded.doubleDragonRecovery,true);
  assert.deepEqual(definitions.allSimpleTactics,before);
  const last = runWithResearchProfile(sourceInput(),DEFAULT_PROFILE);
  assert.deepEqual(last,first);
});

test('Supporter and combined policy profiles are opt-in, distinct and reversible', () => {
  initializeCards();
  const definitions = require(path.join(output,'simple-bot/simple-bot-definitions'));
  const before = definitions.allSimpleTactics.slice();
  for(const name of [SUPPORTER_PROFILE,REGIDRAGO_SUPPORTER_PROFILE]) {
    const outcome = runWithResearchProfile(sourceInput(),name);
    assert.equal(outcome.supporterDecisionCorrection,true);
    assert.equal(outcome.policyRandomIsolation,true);
    assert.equal(outcome.researchPolicyProfile,name);
    assert.deepEqual(definitions.allSimpleTactics,before);
  }
  const original = runWithResearchProfile(sourceInput(),DEFAULT_PROFILE);
  assert.equal(original.supporterDecisionCorrection,false);
  assert.equal(original.doubleDragonRecovery,false);
});
