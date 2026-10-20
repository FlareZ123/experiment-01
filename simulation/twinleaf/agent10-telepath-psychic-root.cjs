'use strict';
const assert = require('node:assert/strict');

const TELEPATH_PRINTING = 'Telepath [P] Energy M3';
const VERSION = 'agent10-telepath-psychic-owner-root-v1';

/**
 * A narrow printed-text setup line: attach Telepathic Psychic Energy from the
 * acting player's hand to a printed Psychic Active while a Bench slot is free.
 * The native Store alone judges legality and creates the owner deck prompt.
 *
 * @param {object} view Detached immutable owner-root observation.
 * @param {object} catalog Public pinned numeric Basic Energy type constants.
 * @returns {object|null} A native-neutral action intent.
 */
function chooseTelepathPsychicRoot(view, catalog) {
  assert.equal(view.decisionKind,'owner-root');
  const active=view.ownPublic.active;
  const r=view.ownTurnResources;
  if(!active?.printed?.types?.includes(catalog.basicEnergyTypes.Psychic) ||
     r.energyPlayLocked===true || r.specialEnergyPlayLocked===true ||
     r.energyPlayedTurn===view.globalTurn ||
     !view.ownPublic.bench.some(slot=>slot===null))
    return null;
  const handIndex=view.ownHand.indexOf(TELEPATH_PRINTING);
  return handIndex<0?null:{kind:'attach-telepath-psychic-energy',
    handIndex,printing:TELEPATH_PRINTING};
}

module.exports={TELEPATH_PRINTING,VERSION,chooseTelepathPsychicRoot};
