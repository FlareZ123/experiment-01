'use strict';

const assert = require('node:assert/strict');

/**
 * Audit the frozen original Aichi rank-5/rank-11 native A/B/A Mail root.
 * Input is the decoded artifact agent9-owner-mail-original-source-v1 JSON.
 * This read-only source-observation audit does not certify the whole
 * delegated policy as paper-legal or information-set safe.
 *
 * @param {object} archive Decoded archive payload.
 * @returns {object} Auditable observed opportunity and Store disposition.
 */
function auditRank5MailRoot(archive) {
  assert.equal(archive.schema, 'agent9-owner-mail-paired-original-source-v1');
  assert.deepStrictEqual(archive.sourceOriginalRanks, [5, 11]);
  assert.equal(archive.attempts, 12);
  assert.equal(archive.physicalGroups, 4);
  assert.equal(archive.allMatchedDeals, true);
  assert.equal(archive.allRepeatedControlsMatch, true);
  assert.equal(archive.competitivelyQualifiedGames, 0);

  const row = archive.cases.find(entry =>
    entry.seed === 465442104 && entry.rank5Seat === 1 &&
    entry.repeat === 1 && entry.slot === 'B');
  assert.ok(row, 'Required registered physical deal must exist');
  assert.equal(row.equalPhysicalDeal, true);
  assert.equal(row.repeatedControlEqual, true);
  assert.equal(row.results.length, 3);

  const [control, treatment, controlRepeat] = row.results;
  assert.equal(control.mail, false);
  assert.equal(treatment.mail, true);
  assert.equal(controlRepeat.mail, false);
  assert.equal(control.runStatus, 'action-capped');
  assert.equal(treatment.runStatus, 'action-capped');
  assert.deepStrictEqual(control.game, controlRepeat.game);

  const seat = 1;
  const turn = 16;
  const controlPass = control.game.decisionTrace.find(x =>
    x.playerSlot === seat && x.turnBefore === turn &&
    x.action === 'PassTurnAction');
  assert.ok(controlPass, 'Genuine physical owner Pass at turn 16 required');
  assert.equal(controlPass.prizesAfter[0], 6);
  assert.equal(controlPass.prizesAfter[1], 6);

  const ownHand = controlPass.decisionHandBefore.ownHandPrintings;
  assert.equal(ownHand.length, 14);
  assert.equal(ownHand.includes("Trainers' Mail ROS"), true);
  assert.equal(ownHand.includes('Special Red Card M4'), true);
  assert.equal(ownHand.filter(x => x === 'Quick Ball FST').length, 2);
  assert.equal(ownHand.filter(x => x === 'Ultra Ball MEG').length, 2);
  const board = controlPass.publicBoardBeforePass;
  assert.equal(board[seat].active.name, 'Dedenne-GX');
  assert.equal(board[seat].bench[0].name, 'Genesect V');
  assert.equal(board[1 - seat].active.name, 'Mega Absol ex');
  assert.equal(board[1 - seat].bench.length, 2);
  assert.equal(board[seat].stadium.length, 0);
  assert.equal(board[1 - seat].stadium.length, 0);

  const frontier = control.commonActorAudit.ownerTrainerFrontier;
  const offer = frontier.examples.find(x => x.seat === seat && x.turn === turn);
  assert.ok(offer, 'Native owner root enumeration witness missing');
  const copy = name => offer.heldUnblocked.find(x => x.printing === name);
  assert.equal(copy("Trainers' Mail ROS").nativeEnumeratorOffered, false);
  assert.equal(copy('Special Red Card M4').nativeEnumeratorOffered, true);
  assert.equal(copy('Quick Ball FST').nativeEnumeratorOffered, true);
  assert.equal(copy('Ultra Ball MEG').nativeEnumeratorOffered, true);

  const receipt = treatment.mailAudit.selectedReceipts.find(x =>
    x.seat === seat && x.turn === turn &&
    x.printing === "Trainers' Mail ROS");
  assert.ok(receipt, 'Actual selected original-source Mail receipt missing');
  assert.equal(receipt.nativeStore, 'accepted');
  assert.equal(receipt.mailPrompt, 'owner-prompt-accepted');
  assert.deepStrictEqual(receipt.chosen, ['Float Stone BKT']);
  assert.equal(receipt.chosenPhysicallySettled, true);
  assert.equal(receipt.publicDeckSize, 38);
  assert.equal(receipt.minimumEligibleInDeck, 17);
  assert.equal(treatment.mailAudit.mailStoreAccepted, 1);
  assert.equal(treatment.mailAudit.liveOwnerMailSearchPrompts, 1);

  const root = (arm, rootTurn, player, action, card) =>
    arm.game.rootActionLedger.some(x =>
      x.playerSlot === player && x.turnBefore === rootTurn &&
      x.action === action && (card === null || x.card === card));
  assert.equal(root(control, 16, 1, 'PassTurnAction', null), true);
  assert.equal(root(treatment, 16, 1, 'PlayCardAction', "Trainers' Mail"), true);
  assert.equal(root(treatment, 17, 0, 'PassTurnAction', null), true);
  assert.equal(root(control, 18, 1, 'PlayCardAction', 'Crobat V'), true);
  assert.equal(root(treatment, 18, 1, 'PassTurnAction', null), true);

  return {
    schema: 'agent9-rank5-mail-bidirectional-enumerator-v1',
    seed: row.seed, rank5Seat: seat, ownerTurn: turn,
    matchedFullPhysicalDeal: row.equalPhysicalDeal,
    repeatedControlEqual: row.repeatedControlEqual,
    exactOwnerHandSize: ownHand.length,
    opponentRemainingPrizes: controlPass.prizesAfter[1 - seat],
    redCardPrintedOpponentPrizeLimit: 3,
    redCardNativeEnumeratedDespitePrintedRestriction:
      copy('Special Red Card M4').nativeEnumeratorOffered,
    trainersMailNativeEnumeratorOffered:
      copy("Trainers' Mail ROS").nativeEnumeratorOffered,
    trainersMailActualStoreAccepted: receipt.nativeStore === 'accepted',
    trainersMailOwnerPromptSettled: receipt.chosenPhysicallySettled,
    recipient: receipt.chosen[0],
    minimumOtherTrainerTargetsInDeck: receipt.minimumEligibleInDeck,
    publicOwnerDeckSize: receipt.publicDeckSize,
    ownerPassInControl: true,
    opponentPassAfterTreatment: true,
    controlTurn18PlayedCrobat: true,
    treatmentTurn18Passed: true,
    paperGameCertified: false,
    competitivelyQualifiedGames: 0
  };
}

module.exports = { auditRank5MailRoot };
