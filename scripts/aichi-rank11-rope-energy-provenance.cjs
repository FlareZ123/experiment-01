'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const {createHash} = require('node:crypto');

const SOURCE_DEAL = '60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31';
const CONTROL_LEDGER = '3ad102104924c931c612460c19897e4d89b63edaa584cdb3f996212b5ca9eda6';
const ROPE_LEDGER = 'b6810151644e298d8a4bdfcd766e8adf509a5c25e6a73a0f4aa02c4c8fd9f5a6';

/**
 * Recheck original source-first rank11 archived game-state evidence.
 *
 * @param {object} control Control packet from CI artifact 12378308188.
 * @param {object} rope Rope-treatment packet from CI artifact 12378308188.
 * @param {object} owner Source-own T7 packet from CI artifact 12382805740.
 * @returns {object} Validated historical physical-game chronology.
 */
function auditRank11RopeEnergy(control, rope, owner) {
  const chosen = packet => packet.rows.find(row =>
    row.trial?.rank === 11 &&
    row.trial?.candidateId === 'new-moon-lockbreaker-v1');
  const a = chosen(control);
  const b = chosen(rope);
  assert.ok(a && b, 'Source-first rank11 New Moon records required');

  const digest = ledger => createHash('sha256')
    .update(JSON.stringify(ledger)).digest('hex');
  assert.equal(a.rootActionLedgerSha256, digest(a.rootActionLedger));
  assert.equal(b.rootActionLedgerSha256, digest(b.rootActionLedger));
  assert.equal(a.sourceDealFingerprint, SOURCE_DEAL);
  assert.equal(b.sourceDealFingerprint, SOURCE_DEAL);
  assert.equal(a.rootActionLedgerSha256, CONTROL_LEDGER);
  assert.equal(b.rootActionLedgerSha256, ROPE_LEDGER);
  assert.equal(owner.physical?.sourceDealFingerprint, SOURCE_DEAL);
  assert.equal(owner.physical?.rootActionLedgerSha256, ROPE_LEDGER);
  assert.equal(owner.physicalArchiveMatches, true);
  assert.equal(owner.observationUsable, true);

  assert.deepEqual(a.rootActionLedger.slice(0, 38),
    b.rootActionLedger.slice(0, 38));
  assert.equal(a.rootActionLedger[38].action, 'PassTurnAction');
  assert.equal(b.rootActionLedger[38].action, 'PlayCardAction');
  assert.equal(b.rootActionLedger[38].card, 'Escape Rope');

  const sourceRoot = owner.observationAudit.boundedRoots[0].root;
  assert.equal(sourceRoot.turn, 7);
  assert.equal(sourceRoot.actorSeat, 0);
  assert.equal(sourceRoot.active.printing, 'Garbodor BKP');
  assert.deepEqual(sourceRoot.active.energies, []);
  const oranguru = sourceRoot.benched.find(slot =>
    slot?.printing === 'Oranguru V ASR');
  assert.ok(oranguru);
  assert.deepEqual(oranguru.energies, ['Darkness Energy MEE']);
  const psychic = oranguru.attacks.find(attack => attack.name === 'Psychic');
  assert.ok(psychic);
  assert.equal(psychic.cost.length, 3);

  const sourcePlay = row => row.rootActionLedger.filter(e =>
    e.playerSlot === 0 && e.action === 'PlayCardAction');
  const energyBeforeTrap = sourcePlay(b).filter(e =>
    e.turnBefore < 6 && e.card === 'Darkness Energy');
  assert.deepEqual(energyBeforeTrap.map(e => e.turnBefore), [5]);
  const controlAttachments = sourcePlay(a).filter(e =>
    e.card === 'Darkness Energy').map(e => e.turnBefore);
  assert.deepEqual(controlAttachments, [5, 9, 19, 23]);
  const firstAttack = a.rootActionLedger.find(e =>
    e.playerSlot === 0 && e.action === 'AttackAction');
  assert.ok(firstAttack);
  assert.equal(firstAttack.turnBefore, 19);
  assert.equal(b.rootActionLedger.some(e =>
    e.playerSlot === 0 && e.action === 'AttackAction'), false);

  return {
    evidenceClass: 'one retrospectively selected physical source-first deal',
    sharedSourceDeal: SOURCE_DEAL,
    t7BenchedOranguruEnergyCards: oranguru.energies.length,
    t7OranguruPsychicRequiredEnergy: psychic.cost.length,
    t7ActiveGarbodorEnergyCards: sourceRoot.active.energies.length,
    onlySourceEnergyAttachmentBeforeT6: energyBeforeTrap[0].turnBefore,
    sourceControlEnergyAttachmentTurns: controlAttachments,
    controlFirstSourceAttackTurn: firstAttack.turnBefore,
    ropeTreatmentSourceAttacks: 0,
    ropeNativeWinner: b.winner,
    noRopeNativeWinner: a.winner,
    competitiveQualifiedGames: 0
  };
}

if (require.main === module) {
  const [controlPath, ropePath, ownerPath] = process.argv.slice(2);
  const parsed = file => JSON.parse(fs.readFileSync(file, 'utf8'));
  process.stdout.write(JSON.stringify(auditRank11RopeEnergy(
    parsed(controlPath), parsed(ropePath), parsed(ownerPath)
  ), null, 2) + '\n');
}

module.exports = {auditRank11RopeEnergy};
