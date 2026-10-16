'use strict';

const {captureChooseCardsReferences,restoreChooseCardsReferences} =
  require('./choose-cards-reference.cjs');
const {captureChooseAttackReference,restoreChooseAttackReference} =
  require('./choose-attack-reference.cjs');
const {captureSlotChoice,restoreSlotChoice} =
  require('./choice-slot-reference.cjs');
const {captureChooseEnergyReference,restoreChooseEnergyReference} =
  require('./choose-energy-reference.cjs');
const {captureAttachEnergyReference,restoreAttachEnergyReference} =
  require('./attach-energy-reference.cjs');

const SCHEMA = 'source-prompt-action-v1';

/**
 * Retain source object identity when a ResolvePromptAction result references
 * game Cards, attack objects, slots or energy maps. Every case uses a checked
 * source-inventory codec; unsupported prompt classes fail closed.
 *
 * @param {object|null} prompt Live unresolved prompt
 * @param {object} action Actual ResolvePromptAction
 * @param {object} state Live pre-dispatch Store State
 * @returns {object|null}
 */
function capturePromptAction(prompt, action, state) {
  if (!prompt || action?.constructor?.name !== 'ResolvePromptAction') return null;
  if (!Number.isSafeInteger(action.id) || action.id !== prompt.id) {
    throw new TypeError('Prompt/action ID mismatch');
  }
  if (action.log !== undefined && action.log !== null) {
    throw new TypeError('Nonportable attached StateLog');
  }
  const kind = prompt.constructor.name;
  let selection;
  switch (kind) {
    case 'ChooseCardsPrompt':
      selection = captureChooseCardsReferences(prompt, action); break;
    case 'ChooseAttackPrompt':
      selection = captureChooseAttackReference(prompt, action); break;
    case 'ChoosePokemonPrompt':
    case 'ChoosePrizePrompt':
      selection = captureSlotChoice(prompt, action, state); break;
    case 'ChooseEnergyPrompt':
      selection = captureChooseEnergyReference(prompt, action); break;
    case 'AttachEnergyPrompt':
      selection = captureAttachEnergyReference(prompt, action); break;
    default: return null;
  }
  if (!selection) throw new TypeError('Missing prompt-specific reference capture');
  return {schema:SCHEMA,kind,id:action.id,
    optionalLog: action.log === undefined ? 'undefined' : 'null',
    selection};
}

/**
 * Resolve against a fresh Store's real pending prompt, refusing any changed
 * pool identity or selection. Does not independently certify reducer output.
 *
 * @param {object} prompt Fresh pending engine prompt
 * @param {object} state Fresh Store State
 * @param {object} record Archived capture
 * @param {function} ResolvePromptAction Pinned constructor
 * @returns {object} Actual action with correct current references
 */
function restorePromptAction(prompt, state, record, ResolvePromptAction) {
  if (!prompt || record?.schema !== SCHEMA ||
      record.kind !== prompt.constructor.name ||
      record.id !== prompt.id ||
      !['undefined','null'].includes(record.optionalLog) ||
      ResolvePromptAction?.name !== 'ResolvePromptAction') {
    throw new TypeError('Prompt replay identity differs');
  }
  let result;
  switch (record.kind) {
    case 'ChooseCardsPrompt':
      result = restoreChooseCardsReferences(prompt, record.selection); break;
    case 'ChooseAttackPrompt':
      result = restoreChooseAttackReference(prompt, record.selection); break;
    case 'ChoosePokemonPrompt':
    case 'ChoosePrizePrompt':
      result = restoreSlotChoice(prompt, state, record.selection); break;
    case 'ChooseEnergyPrompt':
      result = restoreChooseEnergyReference(prompt, record.selection); break;
    case 'AttachEnergyPrompt':
      result = restoreAttachEnergyReference(prompt, record.selection); break;
    default: throw new TypeError('Unsupported prompt reference class');
  }
  return new ResolvePromptAction(record.id, result,
    record.optionalLog === 'undefined' ? undefined : null);
}

module.exports = {SCHEMA,capturePromptAction,restorePromptAction};
