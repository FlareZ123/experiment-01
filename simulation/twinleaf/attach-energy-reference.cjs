'use strict';

/** @param {object} to Engine CardTarget enum triple */
function targetValues(to) {
  if (!to || !Number.isInteger(to.player) ||
      !Number.isInteger(to.slot) || !Number.isInteger(to.index)) {
    throw new TypeError('Attachment has nonportable CardTarget');
  }
  return {player:to.player,slot:to.slot,index:to.index};
}

/**
 * Serialize live AttachEnergyPrompt CardAssign[] selections as indices into
 * the actual candidate CardList and exact target enums. Duplicate physical
 * copies of the same printed Energy remain distinguishable.
 * @param {object|null} prompt
 * @param {object} action
 * @returns {object|null}
 */
function captureAttachEnergyReference(prompt, action) {
  if (prompt?.constructor?.name!=='AttachEnergyPrompt' ||
      action?.constructor?.name!=='ResolvePromptAction') return null;
  const cards=prompt.cardList?.cards;
  if (!Array.isArray(cards)) throw new TypeError('Missing attachment card source');
  const pool=cards.map(card=>card.fullName);
  const selected=action.result===null ? null : action.result.map(assign=>{
    const index=cards.indexOf(assign.card);
    if(index===-1) throw new TypeError('Selected Energy absent from source CardList');
    return {index,printing:pool[index],to:targetValues(assign.to)};
  });
  return {schema:'attach-energy-reference-v1',promptKind:'AttachEnergyPrompt',
    message:prompt.message ?? null,sourcePool:pool,
    sourcePlayerType:prompt.playerType,sourceSlots:prompt.slots.slice(),
    selections:selected};
}

/**
 * Recreate the actual CardAssign objects using the replayed prompt's card
 * identities. Reject prompt pool, metadata or selected-index drift.
 * @param {object} prompt
 * @param {object} record
 * @returns {object[]|null}
 */
function restoreAttachEnergyReference(prompt, record) {
  if (prompt?.constructor?.name!=='AttachEnergyPrompt' ||
      record?.schema!=='attach-energy-reference-v1' ||
      record.promptKind!=='AttachEnergyPrompt' ||
      record.message!==(prompt.message??null) ||
      record.sourcePlayerType!==prompt.playerType ||
      JSON.stringify(record.sourceSlots)!==JSON.stringify(prompt.slots)) {
    throw new TypeError('Attachment prompt identity differs');
  }
  const cards=prompt.cardList?.cards;
  if (!Array.isArray(cards) ||
      JSON.stringify(cards.map(c=>c.fullName))!==
      JSON.stringify(record.sourcePool)) {
    throw new Error('Attachment source pool differs');
  }
  if (record.selections===null) return null;
  return record.selections.map(row=>{
    if (!Number.isInteger(row.index) || row.index<0 || row.index>=cards.length ||
        row.printing!==cards[row.index].fullName) {
      throw new Error('Attachment selected source index differs');
    }
    return {card:cards[row.index],to:targetValues(row.to)};
  });
}
module.exports={targetValues,captureAttachEnergyReference,
  restoreAttachEnergyReference};
