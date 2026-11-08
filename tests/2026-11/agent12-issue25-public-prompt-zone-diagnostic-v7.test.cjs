'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {exactPromptZoneJoin, redactPromptZoneAudit} = require('../../simulation/evaluation/agent36-issue25-public-prompt-zone-diagnostic-v7.cjs');

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

test('frozen v7 observer archive redacts hidden, ambiguous and unmatched count paths', () => {
  const event = (zoneMatches, offeredCount = 8) => ({
    offeredCount,
    offeredPrintings: Array(offeredCount).fill('Physical Energy'),
    zoneMatches,
    promptId: '173'
  });
  const hidden = {zone: 'owner-hand', visibility: 'hidden', eligibleCount: 8};
  const publicMatch = {zone: 'opponent-active-pokemon-list',
    visibility: 'public', eligibleCount: 8};
  const audit = {version: 'frozen-v7', events: [
    event([hidden]),
    event([publicMatch, hidden]),
    event([]),
    event([publicMatch])
  ]};

  const sanitized = redactPromptZoneAudit(audit);
  for (let index = 0; index < 3; index++) {
    const result = sanitized.events[index];
    assert.equal(result.offeredCount, null);
    assert.equal(result.offeredPrintings, null);
    assert.ok(result.zoneMatches.every(match => match.eligibleCount === null));
  }
  assert.equal(sanitized.events[3].offeredCount, 8);
  assert.equal(sanitized.events[3].zoneMatches[0].eligibleCount, 8);
  assert.deepEqual(sanitized.events[3].offeredPrintings,
    Array(8).fill('Physical Energy'));
  assert.equal(audit.events[0].offeredCount, 8);
  assert.equal(audit.events[1].zoneMatches[0].eligibleCount, 8);
  assert.notStrictEqual(sanitized.events[0], audit.events[0]);
  assert.equal(sanitized.version, 'frozen-v7');
});

test('v7 archive sanitization fails closed for missing event metadata', () => {
  assert.equal(redactPromptZoneAudit(null), null);
  const audit = {events: [{offeredCount: 3, offeredPrintings: ['Hidden']} ]};
  const result = redactPromptZoneAudit(audit);
  assert.equal(result.events[0].offeredCount, null);
  assert.equal(result.events[0].offeredPrintings, null);
  assert.deepEqual(result.events[0].zoneMatches, []);
});
