'use strict';

/**
 * Record exactly which candidate objects a ChooseCardsPrompt selected.
 * Names alone cannot distinguish identical printings at different positions.
 * @param {object|null} prompt Live pre-dispatch ChooseCardsPrompt.
 * @param {object} action Live ResolvePromptAction.
 * @returns {object|null}
 */
function captureChooseCardsReferences(prompt, action) {
  if (prompt?.constructor?.name !== 'ChooseCardsPrompt' ||
      action?.constructor?.name !== 'ResolvePromptAction') return null;
  const pool = prompt.cards?.cards;
  if (!Array.isArray(pool)) throw new TypeError('ChooseCardsPrompt lacks a candidate CardList');
  const result = action.result;
  if (result === null) {
    return {schema:'choose-card-references-v1', promptKind:'ChooseCardsPrompt',
      message:prompt.message ?? null, poolLength:pool.length, selection:null};
  }
  if (!Array.isArray(result)) throw new TypeError('Expected ChooseCardsPrompt array result');
  const selection = result.map(value => {
    let index;
    let mode;
    if (Number.isInteger(value)) {
      index = value;
      mode = 'index';
    } else if (value && typeof value === 'object') {
      index = pool.indexOf(value);
      mode = 'card-reference';
    } else {
      throw new TypeError('Unrecognized ChooseCardsPrompt result representation');
    }
    if (index < 0 || index >= pool.length || !pool[index]?.fullName) {
      throw new TypeError('Selected card is not a member of the prompted source');
    }
    return {mode, index, fullName:pool[index].fullName};
  });
  return {
    schema:'choose-card-references-v1',
    promptKind:'ChooseCardsPrompt',
    message:prompt.message ?? null,
    poolLength:pool.length,
    selection
  };
}

/**
 * Resolve captured selection against the *current* replay prompt. Refuses
 * differing pool size, card identities or message. This does not certify the
 * full game state; it protects this one prompt's selected object identity.
 * @param {object} prompt Replay ChooseCardsPrompt.
 * @param {object} capture Output from captureChooseCardsReferences.
 * @returns {(number|object)[]|null}
 */
function restoreChooseCardsReferences(prompt, capture) {
  if (prompt?.constructor?.name !== 'ChooseCardsPrompt' ||
      capture?.schema !== 'choose-card-references-v1' ||
      capture.promptKind !== 'ChooseCardsPrompt') {
    throw new TypeError('Expected matching ChooseCardsPrompt and recorded selection');
  }
  const pool = prompt.cards?.cards;
  if (!Array.isArray(pool) || pool.length !== capture.poolLength ||
      (prompt.message ?? null) !== capture.message) {
    throw new Error('Replay prompt differs in candidate count or message');
  }
  if (capture.selection === null) return null;
  if (!Array.isArray(capture.selection)) throw new Error('Malformed recorded card selection');
  return capture.selection.map(item => {
    if (!item || !Number.isInteger(item.index) || item.index < 0 ||
        item.index >= pool.length || item.fullName !== pool[item.index]?.fullName) {
      throw new Error('Replay card selection differs from recorded source printing');
    }
    if (item.mode === 'index') return item.index;
    if (item.mode === 'card-reference') return pool[item.index];
    throw new Error('Unsupported card reference representation');
  });
}

module.exports = {captureChooseCardsReferences, restoreChooseCardsReferences};
