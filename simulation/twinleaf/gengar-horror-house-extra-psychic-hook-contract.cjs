'use strict';

const assert = require('node:assert/strict');
const {probe} = require('./gengar-horror-house-rainbow-fidelity.cjs');
const {installHorrorHouseExtraPsychicHook,withHorrorHouseExtraPsychicHook} =
  require('./gengar-horror-house-extra-psychic-hook.cjs');

/** @param {object} observation @param {number} expected */
function assertDraw(observation,expected) {
  assert.equal(observation.sourceHandCount,expected);
  assert.equal(observation.opponentHandCount,expected);
  assert.equal(observation.sourceUsedGX,true);
  assert.equal(observation.opponentItemLocked,true);
}

/** @returns {object} */
function run() {
  const original = Object.fromEntries(
    ['basic','rainbow','prism','colorless'].map(name=>[name,probe(name)]));
  assertDraw(original.basic,7);
  assertDraw(original.rainbow,0);
  assertDraw(original.prism,0);
  assertDraw(original.colorless,0);

  const pinned = require('node:path').resolve(
    __dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {GengarMimikyuGX} = require(require('node:path').join(
    pinned,'sets/08-sun-and-moon/set-team-up/gengar-and-mimikyu-gx'));
  const pristine = GengarMimikyuGX.prototype.reduceEffect;

  const first=installHorrorHouseExtraPsychicHook();
  const second=installHorrorHouseExtraPsychicHook();
  assert.equal(first,second,'reentrant install must be idempotent');
  const corrected = Object.fromEntries(
    ['basic','rainbow','prism','colorless'].map(name=>[name,probe(name)]));
  assertDraw(corrected.basic,7);
  assertDraw(corrected.rainbow,7);
  assertDraw(corrected.prism,7);
  assertDraw(corrected.colorless,0);
  first();
  assert.equal(GengarMimikyuGX.prototype.reduceEffect,pristine,
    'hook must restore upstream reducer identity');
  assertDraw(probe('rainbow'),0);
  assertDraw(withHorrorHouseExtraPsychicHook(()=>probe('rainbow')),7);
  assert.equal(GengarMimikyuGX.prototype.reduceEffect,pristine,
    'scoped wrapper must restore reducer on exit');

  return {
    schema:'horror-house-dynamic-psychic-pinned-paper-hook-v1',
    pinned:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    inputClass:'staged Store setup, not a source-dealt 60-card match',
    original,corrected,
    invariant:'GX use and opponent hand-play lock identical; draw seven only when two Psychic units are supplied',
    restored:true,qualifiedForCompetitiveInference:false
  };
}

if (require.main===module) process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
