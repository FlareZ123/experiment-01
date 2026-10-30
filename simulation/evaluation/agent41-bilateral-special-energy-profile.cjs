'use strict';

const assert = require('node:assert/strict');
const VERSION = 'agent41-bilateral-special-energy-root-profile-v1';

/**
 * Freeze who receives the existing owner-visible Special Energy root.
 * `both` applies identical selector rules at both physical seats. The other
 * modes exist only for separately attributed counterfactual diagnostics.
 * @param {{bilateral?:boolean,source?:boolean,candidate?:boolean}} flags
 * @param {'A'|'B'} candidateSlot
 * @returns {{version:string,mode:string,enabled:boolean,ownerSeat:0|1|null,sharedPolicy:boolean}}
 */
function specialEnergyRootProfile(flags, candidateSlot) {
  assert.ok(candidateSlot === 'A' || candidateSlot === 'B');
  const choices = ['bilateral', 'source', 'candidate'].filter(key => flags[key] === true);
  assert.ok(choices.length <= 1, 'Choose one Special Energy root mode');
  const mode = choices[0] === 'bilateral' ? 'both' : (choices[0] ?? 'none');
  const candidateSeat = candidateSlot === 'A' ? 0 : 1;
  return {
    version: VERSION,
    mode,
    enabled: mode !== 'none',
    ownerSeat: mode === 'source' ? 1 - candidateSeat :
      mode === 'candidate' ? candidateSeat : null,
    sharedPolicy: mode === 'both' || mode === 'none'
  };
}

module.exports = {VERSION, specialEnergyRootProfile};
