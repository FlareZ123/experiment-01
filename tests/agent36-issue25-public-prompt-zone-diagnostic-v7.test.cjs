'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {exactPromptZoneJoin} = require('../simulation/evaluation/agent36-issue25-public-prompt-zone-diagnostic-v7.cjs');

test('v7 requires the exact same-object source origin and zero-to-assigned prompt ID join', () => {
  const sourceProof = {
    pendingNativePromptId: '173',
    promptIdBeforeStore: 0,
    promptIdAfterStore: 173,
    promptIdAssignedByStore: true,
    turn: 54,
    promptOwnerSeat: 0,
    attackerSeat: 1,
    promptType: 'ChooseCardsPrompt',
    promptMessage: 'CHOOSE_CARD_TO_DISCARD',
    eligibleEnergyCount: 8,
    eligibleEnergyPrintings: Array(8).fill('Psychic Energy MEE'),
    sourcePrinting: 'Galarian Stunfisk SSH',
    sourceAbility: 'Snap Trap',
    sourceCardPublic: true,
    sourceZone: 'owner-active-pokemon-list',
    attackerZone: 'opponent-active-pokemon-list',
    sourceSeat: 0,
    attackerPrinting: 'Marshadow UNB',
    promptCardsIsAttackingPokemonList: true,
    promptEnergyListIsAttackingEnergySublist: true
  };
  const event = {
    sourceOrigin: sourceProof,
    promptId: '173',
    promptIdBeforeStore: '0',
    promptIdAfterStore: '173',
    promptIdAssignedByStore: true,
    stateIsLiveStore: true,
    promptStateArgumentMatchesLiveState: true,
    promptPlayerMatches: true,
    turn: 54,
    activePlayerSeat: 1,
    ownerSeat: 0,
    opponentSeat: 1,
    promptType: 'ChooseCardsPrompt',
    message: 'CHOOSE_CARD_TO_DISCARD',
    filterIsExactSuperTypeEnergy: true,
    filterMatchesEnergySubzone: true,
    eligibleSubzone: 'energies',
    offeredCount: 8,
    offeredPrintings: sourceProof.eligibleEnergyPrintings,
    zoneMatches: [{
      zone: 'opponent-active-pokemon-list',
      match: 'exact-container',
      visibility: 'public',
      eligibleSubzone: 'energies',
      subzoneReferenceMatch: true,
      eligibleCount: 8
    }],
    ownerActive: {printing: 'Galarian Stunfisk SSH'},
    opponentActive: {printing: 'Marshadow UNB', energyCount: 8},
    lastAttack: {seat: 1, turn: 54},
    promptSourceMetadataPresent: false
  };

  assert.equal(exactPromptZoneJoin(event, sourceProof), true);
  event.sourceOrigin = {...sourceProof};
  assert.equal(exactPromptZoneJoin(event, sourceProof), false);
});
