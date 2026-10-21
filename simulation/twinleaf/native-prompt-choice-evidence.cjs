'use strict';

const {createHash} = require('node:crypto');

/**
 * Extract choice data already observed at native, actor-owned prompt roots.
 * This is a post-game observation, never a bot input. The source of truth is
 * the headless decisionTrace, which captures selectedCardsEvidence and
 * selectedOptionEvidence before each Store.dispatch. A choice is not evidence
 * that its resulting card movement or other effect completed successfully.
 *
 * @param {object[]} decisionTrace Original pinned headless decision trace.
 * @returns {{schema:string,events:object[],sha256:string}}
 */
function nativePromptChoiceEvidence(decisionTrace) {
  const events = decisionTrace.flatMap(row => {
    const choice = row.cardSelection ?? row.optionSelection;
    if(!choice) return [];
    const selection = row.cardSelection ? {
      kind:'ChooseCardsPrompt',
      sourceZone:choice.sourceZone,
      sourcePlayerSlot:choice.sourcePlayerSlot,
      selectedCards:choice.selectedCards,
      selectedIndices:choice.selectedIndices,
      sourceZoneCardCountBefore:choice.sourceZoneCardCountBefore??null,
      publicDiscardCardNamesBefore:choice.publicDiscardCardNamesBefore??null,
      nativePromptMin:choice.nativePromptMin??null,
      nativePromptMax:choice.nativePromptMax??null,
      nativePromptAllowCancel:choice.nativePromptAllowCancel??null
    } : {
      kind:'SelectOptionPrompt',
      selectedOption:choice.selectedOption,
      selectedText:choice.selectedText
    };
    return [{
      ordinal:row.actionOrdinal,
      turn:row.turnBefore,
      actorSeat:row.playerSlot,
      ...selection
    }];
  });
  const sha256 = createHash('sha256').update(JSON.stringify(events))
    .digest('hex');
  return {
    schema:'headless-native-prompt-choice-evidence-v3-public-discard-prompt-bounds',
    events,sha256
  };
}

module.exports={nativePromptChoiceEvidence};
