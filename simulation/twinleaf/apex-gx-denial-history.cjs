'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {preparedRegidrago} = require('./apex-attack-action.cjs');
const {installDeclaredCopyHistoryHook} = require('./copycat-declared-history-hook.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/** @param {string} moduleName @returns {any} */
const load = moduleName => require(path.join(output, moduleName));

/** @param {any} state @returns {any} */
function pendingCopiedAttack(state) {
  return state.prompts.find(prompt =>
    prompt.constructor.name === 'ChooseAttackPrompt' && prompt.result === undefined);
}

/**
 * Characterize declared-attack history when spent-GX Timeless-GX is denied,
 * and a player then cancels the retry instead of selecting ordinary Shred.
 *
 * @param {boolean} useRepair
 * @returns {{declared:string,afterDenial:string,afterCancel:string,attackerDamage:number,usedGX:boolean,usedTurnSkip:boolean}}
 */
function runDeniedCopyAndCancel(useRepair) {
  const undo = useRepair ?
    installDeclaredCopyHistoryHook({regidrago: true, mimikyu: false}) : () => {};
  const {clearCopyAttackSessionsForTests} =
    load('game/store/prefabs/copy-attack-delegation');
  try {
    clearCopyAttackSessionsForTests();
    const {AttackAction} = load('game/store/actions/game-actions');
    const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
    const ready = preparedRegidrago();
    ready.attachFire();
    const dialga = initializeCards().getCardByName('Dialga-GX UPR');
    assert.ok(dialga);
    ready.attacking.discard.cards = [dialga];
    ready.attacking.usedGX = true;
    ready.store.dispatch(new AttackAction(101, 'Apex Dragon'));
    const first = pendingCopiedAttack(ready.state);
    assert.ok(first);
    const history = () => ready.state.playerLastAttack[ready.attacking.id]?.attack?.name;
    const declared = history();
    ready.store.dispatch(new ResolvePromptAction(first.id, dialga.attacks[2]));
    const afterDenial = history();
    const retry = pendingCopiedAttack(ready.state);
    assert.ok(retry && retry.id !== first.id, 'Spent-GX selection must offer a retry');
    ready.store.dispatch(new ResolvePromptAction(retry.id, null));
    const afterCancel = history();
    return {
      declared, afterDenial, afterCancel,
      attackerDamage: ready.defending.active.damage,
      usedGX: ready.attacking.usedGX,
      usedTurnSkip: Boolean(ready.attacking.usedTurnSkip)
    };
  } finally {
    clearCopyAttackSessionsForTests();
    undo();
  }
}

function characterizeDeniedCopyHistory() {
  const baseline = runDeniedCopyAndCancel(false);
  const repaired = runDeniedCopyAndCancel(true);
  assert.equal(baseline.declared, 'Apex Dragon');
  assert.equal(baseline.attackerDamage, 0);
  assert.equal(baseline.usedGX, true);
  assert.equal(baseline.usedTurnSkip, false);
  assert.equal(repaired.declared, 'Apex Dragon');
  assert.equal(repaired.attackerDamage, 0);
  assert.equal(repaired.usedGX, true);
  assert.equal(repaired.usedTurnSkip, false);
  // A denied payload choice is a deferred continuation of Apex Dragon.
  // The printed attack remains the player's declared last attack.
  assert.equal(baseline.afterDenial, 'Timeless-GX',
    'Characterize upstream transient misrecording of rejected GX payload');
  assert.equal(baseline.afterCancel, 'Timeless-GX',
    'Characterize rejected GX payload persisting after canceled retry');
  assert.equal(repaired.afterDenial, 'Apex Dragon');
  assert.equal(repaired.afterCancel, 'Apex Dragon');
  return {
    engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    baseline, repaired,
    conclusion: 'The stock Store misrecords a rejected borrowed GX as last declared attack; reversible research hook preserves Apex Dragon',
    scope: 'Injected paid AttackAction only; not a complete Aichi matchup'
  };
}

if (require.main === module) {
  console.log('DENIED_APEX_GX_HISTORY',
    JSON.stringify(characterizeDeniedCopyHistory(), null, 2));
}

module.exports = {characterizeDeniedCopyHistory};
