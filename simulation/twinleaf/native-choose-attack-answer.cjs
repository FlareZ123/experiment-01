'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Convert a serialized ChooseAttackPrompt selection into the actual Attack
 * reference required by pinned Store.dispatch(ResolvePromptAction).
 *
 * Pinned Store.reducePrompt preserves raw action.result and does not itself
 * call prompt.decode(). Submitting { index, attack } directly can appear
 * accepted while findAttackIndex later receives an object without .name and
 * silently skips copied attack effects. The wrapper closes that interface gap
 * for research-side native Store tests without modifying vendor code.
 *
 * @param {object} prompt Original ChooseAttackPrompt from current Store.
 * @param {object} state Current Store.state.
 * @param {number} index Index into prompt.cards.
 * @param {string} attackName Exact printed attack name.
 * @returns {object} A validated native Attack instance from prompt.cards.
 */
function decodeNativeChooseAttack(prompt,state,index,attackName){
  assert.equal(prompt?.constructor?.name,'ChooseAttackPrompt');
  assert.ok(Number.isInteger(index)&&index>=0);
  assert.equal(typeof attackName,'string');
  assert.ok(attackName.length>0);
  assert.equal(typeof prompt.decode,'function');
  assert.equal(typeof prompt.validate,'function');
  const attack=prompt.decode({index,attack:attackName},state);
  assert.ok(attack && typeof attack.name==='string',
    'Native ChooseAttackPrompt must decode to a real Attack object');
  assert.equal(prompt.validate(attack,state),true,
    'Use exact Attack instance and permitted native choice');
  return attack;
}

/**
 * Submit a validated native attack choice through actual pinned Store.
 *
 * @param {object} store Real pinned Store.
 * @param {object} prompt Outstanding pinned ChooseAttackPrompt.
 * @param {number} index Source Pokémon index.
 * @param {string} attackName Printed attack.
 * @returns {object} The actual Attack instance that Store accepted.
 */
function resolveNativeChooseAttack(store,prompt,index,attackName){
  assert.ok(store?.state);
  assert.equal(store.state.prompts.includes(prompt),true,
    'Resolve only an actual outstanding native Store prompt');
  assert.equal(prompt.result,undefined);
  const attack=decodeNativeChooseAttack(
    prompt,store.state,index,attackName);
  const {ResolvePromptAction}=require(path.join(
    OUTPUT,'game/store/actions/resolve-prompt-action'));
  store.dispatch(new ResolvePromptAction(prompt.id,attack));
  return attack;
}

module.exports={decodeNativeChooseAttack,resolveNativeChooseAttack};
