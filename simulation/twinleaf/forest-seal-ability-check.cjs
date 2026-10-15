'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');

const server = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/** Verify pinned Twinleaf marks the Tool-given VSTAR Power as lock-exempt. */
function checkForestSealException() {
  const manager = initializeCards();
  const stone = manager.getCardByName('Forest Seal Stone SIT');
  const vmax = manager.getCardByName('Shadow Rider Calyrex VMAX CRE');
  assert.ok(stone && vmax, 'Expected pinned engine cards');
  const {IS_POWER_SUBJECT_TO_ABILITY_LOCK} =
    require(path.join(server, 'game/store/prefabs/ability-lock'));
  const starAlchemy = stone.powers.find(power => power.name === 'Star Alchemy');
  const underworldDoor = vmax.powers.find(power => power.name === 'Underworld Door');
  assert.ok(starAlchemy && underworldDoor, 'Expected printed Abilities');
  assert.equal(starAlchemy.exemptFromAbilityLock, true);
  assert.equal(IS_POWER_SUBJECT_TO_ABILITY_LOCK(starAlchemy), false,
    'The Tool power should survive generic Ability suppression');
  assert.equal(IS_POWER_SUBJECT_TO_ABILITY_LOCK(underworldDoor), true,
    'The VMAX power is subject to Ability suppression');
  return {
    engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    test: 'ability-lock predicate on exact Tool and VMAX powers',
    starAlchemyBlocked: false,
    underworldDoorBlocked: true,
    scope: 'helper-level unit check, no completed board game'
  };
}

if (require.main === module) {
  console.log(JSON.stringify(checkForestSealException(), null, 2));
}
module.exports = {checkForestSealException};
