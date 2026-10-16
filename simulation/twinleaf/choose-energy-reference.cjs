'use strict';

/**
 * Reproducible candidate-energy inventory for Twinleaf ChooseEnergyPrompt.
 * Prompt choices are EnergyMap objects: {card, provides}, whose identity is
 * distinct even when printed Energy and provides values are identical.
 *
 * @param {object} prompt Real or replayed ChooseEnergyPrompt.
 * @returns {{printing:string,provides:number[]}[]}
 */
function energySourceInventory(prompt) {
  if (!Array.isArray(prompt.energy)) {
    throw new TypeError('ChooseEnergyPrompt is missing candidate maps');
  }
  return prompt.energy.map(entry => {
    if (typeof entry?.card?.fullName !== 'string' ||
        !Array.isArray(entry.provides)) {
      throw new TypeError('ChooseEnergyPrompt contains an invalid EnergyMap');
    }
    return {printing:entry.card.fullName,provides:entry.provides.slice()};
  });
}

/**
 * Preserve the exact EnergyMap result identities without using fullName
 * equality to collapse duplicate Energy attachments.
 * @param {object|null} prompt
 * @param {object} action
 * @returns {object|null}
 */
function captureChooseEnergyReference(prompt, action) {
  if (prompt?.constructor?.name !== 'ChooseEnergyPrompt' ||
      action?.constructor?.name !== 'ResolvePromptAction') return null;
  const sourceInventory=energySourceInventory(prompt);
  const selections=action.result===null ? null : action.result.map(entry=>{
    const index=prompt.energy.indexOf(entry);
    if (index<0) throw new TypeError('EnergyMap result absent from prompt sources');
    return {index,...sourceInventory[index]};
  });
  return {
    schema:'choose-energy-reference-v1',promptKind:'ChooseEnergyPrompt',
    message:prompt.message ?? null,
    requiredCost:prompt.cost.slice(),sourceInventory,selections
  };
}

/**
 * Restore the corresponding live EnergyMap objects from a new prompt with
 * identical requirements and candidate order.
 * @param {object} prompt
 * @param {object} record
 * @returns {object[]|null}
 */
function restoreChooseEnergyReference(prompt, record) {
  if (prompt?.constructor?.name !== 'ChooseEnergyPrompt' ||
      record?.schema !== 'choose-energy-reference-v1' ||
      record.promptKind !== 'ChooseEnergyPrompt' ||
      (prompt.message ?? null)!==record.message ||
      JSON.stringify(prompt.cost)!==JSON.stringify(record.requiredCost)) {
    throw new TypeError('ChooseEnergyPrompt replay identity differs');
  }
  const current=energySourceInventory(prompt);
  if (JSON.stringify(current)!==JSON.stringify(record.sourceInventory)) {
    throw new Error('ChooseEnergyPrompt candidate maps differ');
  }
  if (record.selections===null) return null;
  return record.selections.map(selected=>{
    if (!Number.isInteger(selected.index) || selected.index<0 ||
        selected.index>=current.length ||
        selected.printing!==current[selected.index].printing ||
        JSON.stringify(selected.provides)!==
        JSON.stringify(current[selected.index].provides)) {
      throw new Error('Selected EnergyMap reference differs');
    }
    return prompt.energy[selected.index];
  });
}
module.exports={energySourceInventory,captureChooseEnergyReference,
  restoreChooseEnergyReference};
