'use strict';

/** @param {object} cards Live CardList or PokemonCardList. */
function sourceSignature(cards) {
  return cards.cards.map(card => card.fullName);
}

/**
 * Return exact object identities for the two selection classes that resolve
 * to mutable live game slots. The signature disambiguates identical faces
 * occupying different physical Bench or Prize locations.
 *
 * @param {object} prompt Real pre-dispatch pinned-engine prompt.
 * @param {object} state Real pre-dispatch pinned-engine State.
 * @returns {object[]}
 */
function catalog(prompt, state) {
  if (prompt.constructor.name === 'ChoosePokemonPrompt') {
    return state.players.flatMap(player => [
      {playerId:player.id,zone:'active',index:0,
        signature:sourceSignature(player.active),reference:player.active},
      ...player.bench.map((slot,index) => ({
        playerId:player.id,zone:'bench',index,
        signature:sourceSignature(slot),reference:slot
      }))
    ]);
  }
  if (prompt.constructor.name === 'ChoosePrizePrompt') {
    return state.players.flatMap(player =>
      player.prizes.map((prize,index)=>({
        playerId:player.id,zone:'prizes',index,
        signature:sourceSignature(prize),reference:prize
      })));
  }
  throw new TypeError('Unsupported source slot-choice prompt');
}

/**
 * Nonmutating representation of ChoosePokemon / ChoosePrize resolutions.
 * Encodes exact player and zone positions, including duplicate printings.
 * Does not infer legal targets from prompt text or mutate action.result.
 *
 * @param {object|null} prompt
 * @param {object} action
 * @param {object} state
 * @returns {object|null}
 */
function captureSlotChoice(prompt, action, state) {
  if (!['ChoosePokemonPrompt','ChoosePrizePrompt'].includes(
    prompt?.constructor?.name) ||
    action?.constructor?.name !== 'ResolvePromptAction') return null;
  const entries=catalog(prompt,state);
  const selected=action.result;
  const selections=selected===null ? null : selected.map(slot=>{
    const found=entries.find(e=>e.reference===slot);
    if (!found) throw new TypeError('Chosen live slot absent from actual source State');
    return {playerId:found.playerId,zone:found.zone,index:found.index,
      signature:found.signature};
  });
  return {
    schema:'live-slot-choice-v1',promptKind:prompt.constructor.name,
    message:prompt.message ?? null,
    perspectivePlayerId:prompt.getPerspectivePlayerId ?
      prompt.getPerspectivePlayerId() : prompt.playerId,
    sourceCatalog:entries.map(({reference,...rest})=>rest),
    selections
  };
}

/**
 * A future replayed State must have exactly the same source-zone structure,
 * order, and printed contents. The returned objects are the replay State's
 * actual live slot references, never copied diagnostic data.
 * @param {object} prompt New pre-dispatch prompt.
 * @param {object} state New replay State.
 * @param {object} evidence Captured object.
 * @returns {object[]|null}
 */
function restoreSlotChoice(prompt,state,evidence) {
  if (!['ChoosePokemonPrompt','ChoosePrizePrompt'].includes(
    prompt?.constructor?.name) ||
    evidence?.schema!=='live-slot-choice-v1' ||
    evidence.promptKind!==prompt.constructor.name ||
    evidence.message!==(prompt.message??null) ||
    evidence.perspectivePlayerId!==(prompt.getPerspectivePlayerId ?
      prompt.getPerspectivePlayerId() : prompt.playerId)) {
    throw new TypeError('Slot-choice prompt identity differs');
  }
  const entries=catalog(prompt,state);
  const available=entries.map(({reference,...rest})=>rest);
  if (JSON.stringify(available)!==JSON.stringify(evidence.sourceCatalog)) {
    throw new Error('Slot-choice source inventory differs during replay');
  }
  if (evidence.selections===null) return null;
  return evidence.selections.map(selected=>{
    const slot=entries.find(e=>e.playerId===selected.playerId &&
      e.zone===selected.zone && e.index===selected.index &&
      JSON.stringify(e.signature)===JSON.stringify(selected.signature));
    if (!slot) throw new Error('Slot-choice selected source differs during replay');
    return slot.reference;
  });
}
module.exports={sourceSignature,catalog,captureSlotChoice,restoreSlotChoice};
