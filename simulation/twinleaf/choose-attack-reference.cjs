'use strict';

/**
 * A copied attack uses a live Attack object from one specific source card.
 * Attack names alone are insufficient because duplicate source printings may
 * be simultaneously eligible. This records the exact prompt index, printing,
 * and attack index without changing the action or prompt.
 *
 * @param {object|null} prompt Actual pre-dispatch ChooseAttackPrompt.
 * @param {object} action Actual ResolvePromptAction.
 * @returns {object|null}
 */
function captureChooseAttackReference(prompt, action) {
  if (prompt?.constructor?.name !== 'ChooseAttackPrompt' ||
      action?.constructor?.name !== 'ResolvePromptAction') return null;
  const cards = prompt.cards;
  if (!Array.isArray(cards)) {
    throw new TypeError('ChooseAttackPrompt lacks source cards');
  }
  const sources = cards.map(card => {
    if (typeof card.fullName !== 'string' || !Array.isArray(card.attacks)) {
      throw new TypeError('ChooseAttackPrompt contains unsupported source card');
    }
    return {printing:card.fullName, attackNames:card.attacks.map(a => a.name)};
  });
  if (action.result === null) {
    return {schema:'choose-attack-reference-v1', promptKind:'ChooseAttackPrompt',
      message:prompt.message ?? null,sources,selection:null};
  }
  let selected = null;
  for (let index = 0; index < cards.length; index += 1) {
    const attackIndex = cards[index].attacks.indexOf(action.result);
    if (attackIndex !== -1) {
      selected = {index,printing:cards[index].fullName,
        attackIndex,attackName:cards[index].attacks[attackIndex].name};
      break;
    }
  }
  if (!selected) throw new TypeError('Selected attack is not a member of the prompt');
  return {schema:'choose-attack-reference-v1',promptKind:'ChooseAttackPrompt',
    message:prompt.message ?? null,sources,selection:selected};
}

/**
 * Restore original Attack object reference on a replayed prompt. This rejects
 * different source inventory, order, or attack position before replay.
 * @param {object} prompt
 * @param {object} capture
 * @returns {object|null}
 */
function restoreChooseAttackReference(prompt, capture) {
  if (prompt?.constructor?.name !== 'ChooseAttackPrompt' ||
      capture?.schema !== 'choose-attack-reference-v1' ||
      capture.promptKind !== 'ChooseAttackPrompt') {
    throw new TypeError('Expected matching ChooseAttackPrompt selection');
  }
  const sources = prompt.cards;
  if (!Array.isArray(sources) || sources.length !== capture.sources.length ||
      (prompt.message ?? null) !== capture.message) {
    throw new Error('Replay ChooseAttackPrompt identity differs');
  }
  for (let i = 0; i < sources.length; i += 1) {
    const expected = capture.sources[i];
    if (sources[i].fullName !== expected.printing ||
        !Array.isArray(sources[i].attacks) ||
        sources[i].attacks.length !== expected.attackNames.length ||
        sources[i].attacks.some((attack,j) => attack.name !== expected.attackNames[j])) {
      throw new Error('Replay ChooseAttackPrompt candidate list differs');
    }
  }
  if (capture.selection === null) return null;
  const selected = capture.selection;
  if (!Number.isInteger(selected.index) || selected.index < 0 ||
      selected.index >= sources.length ||
      !Number.isInteger(selected.attackIndex) ||
      selected.attackIndex < 0 ||
      selected.attackIndex >= sources[selected.index].attacks.length ||
      sources[selected.index].fullName !== selected.printing ||
      sources[selected.index].attacks[selected.attackIndex].name !== selected.attackName) {
    throw new Error('Replay chosen attack no longer matches source');
  }
  return sources[selected.index].attacks[selected.attackIndex];
}
module.exports = {captureChooseAttackReference,restoreChooseAttackReference};
