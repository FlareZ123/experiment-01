'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {visibleFundedVmaxPass} =
  require('./agent31-shadow-rider-visible-pass-frontier.cjs');

const VERSION = 'agent31-bilateral-all-owner-pass-evidence-v1';
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Post-choice, read-only reconciliation of EVERY original/native Pass root
 * to its owner's genuinely observed hand and both public boards. It never
 * feeds observations into the decision policy or exposes opponent's hand.
 * A complete native-root record is required; aborts need separate custody.
 *
 * @param {object[]} decisionTrace Genuine native post-choice trace.
 * @param {object[]} rootTrace Genuine accepted Store root ledger.
 * @param {{id:string}} trial Registered printed physical trial identity.
 * @param {0|1} sourceSeat Physical original opponent seat.
 * @returns {object} Owner-only evidence for both seats.
 */
function auditAllOwnerPasses(decisionTrace, rootTrace, trial, sourceSeat) {
  assert.ok(Array.isArray(decisionTrace));
  assert.ok(Array.isArray(rootTrace));
  assert.ok(sourceSeat === 0 || sourceSeat === 1);
  assert.equal(typeof trial?.id, 'string');
  const byOrdinal = new Map();
  for (const observed of decisionTrace.filter(row => row.action === 'PassTurnAction')) {
    assert.ok(Number.isSafeInteger(observed.actionOrdinal));
    assert.ok(!byOrdinal.has(observed.actionOrdinal), 'duplicate native decision Pass receipt');
    byOrdinal.set(observed.actionOrdinal, observed);
  }
  const realPasses = rootTrace.filter(root => root.action === 'PassTurnAction');
  assert.equal(byOrdinal.size, realPasses.length,
    'native Store Pass roots must match owner-typed decision Pass receipts');
  const receipts = [], roleCounts = {
    source: {passes:0,heldFloatStone:0,visibleFundedVmaxPasses:0},
    candidate: {passes:0,heldFloatStone:0,visibleFundedVmaxPasses:0}
  };
  const rowContext = {trial,rootActionLedger:rootTrace};
  for (const root of realPasses) {
    assert.ok(root.playerSlot === 0 || root.playerSlot === 1);
    const observed = byOrdinal.get(root.actionOrdinal);
    assert.ok(observed, 'missing actual owner Pass receipt');
    assert.equal(observed.playerSlot, root.playerSlot);
    assert.equal(observed.turnBefore, root.turnBefore);
    assert.equal(observed.decisionHandBefore?.perspectiveSeat, root.playerSlot,
      'Pass owner hand must have the acting seat as perspective');
    const ownerHand = observed.decisionHandBefore.ownHandPrintings;
    assert.ok(Array.isArray(ownerHand));
    assert.ok(ownerHand.every(printing => typeof printing === 'string'));
    const board = observed.publicBoardBeforePass;
    assert.ok(Array.isArray(board) && board.length === 2,
      'Pass receipt must include both public native board states');
    const role = root.playerSlot === sourceSeat ? 'source' : 'candidate';
    const hold = ownerHand.filter(card => /^Float Stone(?: |$)/.test(card)).length;
    const visible = visibleFundedVmaxPass({
      ...rowContext,candidateSeat:root.playerSlot
    },{
      ordinal:root.actionOrdinal,turn:root.turnBefore,
      ownerHandAfterDecision:ownerHand,publicBoardBeforePass:board
    });
    const count = roleCounts[role];
    count.passes++;
    count.heldFloatStone += Number(hold > 0);
    count.visibleFundedVmaxPasses += Number(Boolean(visible));
    receipts.push({
      actionOrdinal:root.actionOrdinal,
      turn:root.turnBefore,actorSeat:root.playerSlot,role,
      ownerHandSha256:digest(ownerHand),
      publicBoardSha256:digest(board),
      ownerHandAtChosenPass:[...ownerHand],
      publicBoardBeforePass:board,
      visibleFundedVmax:visible,
      paperQualified:false
    });
  }
  return {
    version:VERSION,trialId:trial.id,sourceSeat,candidateSeat:1-sourceSeat,
    actualNativePassRoots:realPasses.length,
    observedOwnerPassRoots:receipts.length,
    completeNativePassCoverage:true,
    counts:roleCounts,receipts,
    scope:'one owner hand and both public boards at each post-choice actual Pass',
    competitivePaperQualifiedGames:0
  };
}
module.exports = {VERSION, auditAllOwnerPasses};
