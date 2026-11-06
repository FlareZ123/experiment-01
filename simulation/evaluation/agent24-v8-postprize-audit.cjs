'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');

const VERSION = 'agent24-v8-postprize-bilateral-readonly-v1';

/** @param {unknown} value @returns {string} */
function sha256(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/**
 * Count physically attached Energy cards on the public in-play board.
 * This says nothing about hand-held Energy, Search effects or paid options.
 * @param {object} board A public board snapshot for one physical seat.
 * @returns {number}
 */
function attachedPublicEnergyCount(board) {
  assert.ok(board && Array.isArray(board.bench));
  const pokemon = [board.active, ...board.bench].filter(Boolean);
  return pokemon.reduce((total, card) => {
    assert.ok(Array.isArray(card.energyCards));
    return total + card.energyCards.length;
  }, 0);
}

/**
 * A conservative witness that the only Energy-bearing in-play Pokemon before
 * a settled source Prize attack was the Active and the visible board then
 * lost all attached Energy. Physical-card KO identity needs a zone audit.
 * @param {object} attack A settled attack with public before/after boards.
 * @param {0|1} seat Contender's physical seat.
 * @returns {object}
 */
function energyCustodyAtPrizeAttack(attack, seat) {
  const before = attack.publicBoardBefore?.[seat];
  const after = attack.publicBoardAfter?.[seat];
  assert.ok(before && after && Array.isArray(before.bench));
  const activeBeforeEnergy = before.active?.energyCards?.length ?? 0;
  const benchBeforeEnergy = before.bench.reduce((sum, p) => {
    assert.ok(Array.isArray(p.energyCards));
    return sum + p.energyCards.length;
  }, 0);
  const beforeEnergy = attachedPublicEnergyCount(before);
  const afterEnergy = attachedPublicEnergyCount(after);
  const activePrinting = before.active?.printing ?? null;
  const afterPokemon = [after.active, ...after.bench].filter(Boolean);
  const activePrintingGone = activePrinting !== null &&
    !afterPokemon.some(p => p.printing === activePrinting);
  const activeSlotPrintingChanged = activePrinting !== null &&
    after.active?.printing !== activePrinting;
  return {beforeEnergy, afterEnergy, activeBeforeEnergy,
    benchBeforeEnergy, activePrintingGone, activeSlotPrintingChanged,
    soleFundedActiveBoardEnergyCollapse: activeBeforeEnergy > 0 &&
      benchBeforeEnergy === 0 && afterEnergy === 0 &&
      activeSlotPrintingChanged};
}

/**
 * Audit one genuine root-bounded development attempt from the archived v8
 * Telepath/Confirm run. This is observational and never certifies legality.
 * @param {object} row An archive attempt with full untruncated public roots.
 * @returns {object}
 */
function auditPostPrizeAttempt(row) {
  assert.ok(typeof row.id === 'string' && row.id.length > 0);
  assert.ok([0, 1].includes(row.originalSourceSeat));
  assert.equal(row.candidateSeat, 1 - row.originalSourceSeat);
  assert.equal(row.publicRootActionsTruncated, false);
  const roots = row.publicRootActions;
  assert.ok(Array.isArray(roots));
  assert.equal(row.publicRootActionCount, roots.length);
  assert.equal(row.publicRootLedgerSha256Computed, sha256(roots));
  assert.equal(row.publicRootLedgerSha256Reported, sha256(roots));
  const source = row.actualSourceAttackSettlement;
  const opponent = row.candidateAttackSettlement;
  assert.ok(Array.isArray(source?.attacks));
  assert.ok(Array.isArray(opponent?.attacks));
  const sourceAttacks = roots.filter(root => root.action === 'AttackAction' &&
    root.playerSlot === row.originalSourceSeat);
  const opponentAttacks = roots.filter(root => root.action === 'AttackAction' &&
    root.playerSlot === row.candidateSeat);
  assert.equal(sourceAttacks.length, source.declarations);
  assert.equal(opponentAttacks.length, opponent.declarations);
  assert.equal(source.attacks.filter(a => a.settledPromptChain === true).length,
    source.settled);
  assert.equal(opponent.attacks.filter(a => a.settledPromptChain === true).length,
    opponent.settled);
  for (const [ordinal, root] of roots.entries()) {
    assert.equal(root.actionOrdinal, ordinal, 'Actual root ledger must be contiguous');
  }
  const prizeAttacks = source.attacks.filter(attack => {
    if (attack.settledPromptChain !== true) return false;
    const before = attack.prizesBefore?.[row.originalSourceSeat];
    const after = attack.prizesAfter?.[row.originalSourceSeat];
    assert.ok(Number.isSafeInteger(before) && Number.isSafeInteger(after));
    assert.ok(before >= after, 'Prize count cannot increase on source attack');
    return after < before;
  }).sort((a, b) => a.actionOrdinal - b.actionOrdinal);
  const sourcePrizesBySettledAttacks = prizeAttacks.reduce((sum, attack) =>
    sum + attack.prizesBefore[row.originalSourceSeat] -
    attack.prizesAfter[row.originalSourceSeat], 0);
  const prizeEnergyEvents = prizeAttacks.map(attack =>
    energyCustodyAtPrizeAttack(attack, row.candidateSeat));
  const soleFundedActiveCollapseEvents = prizeEnergyEvents.filter(
    event => event.soleFundedActiveBoardEnergyCollapse).length;
  if (prizeAttacks.length === 0) return {
    id: row.id, status: row.status, sourceSeat: row.originalSourceSeat,
    contenderSeat: row.candidateSeat, sourceSettledAttacks: source.settled,
    contenderSettledAttacks: opponent.settled,
    sourcePrizesBySettledAttacks, sourcePrizeAttackEvents:0,
    soleFundedActiveCollapseEvents, firstSourcePrize: null,
    contenderPostPrizeAttackDeclarations: null, nextContenderRoot: null,
    nextSourceRoot: null, contenderAttachedEnergyAfterPrize: null,
    contenderAttachedEnergyBeforePrize: null,
    competitivelyQualified: false
  };
  const first = prizeAttacks[0];
  assert.ok(Number.isSafeInteger(first.completionRootOrdinal));
  assert.ok(first.completionRootOrdinal >= first.actionOrdinal &&
    first.completionRootOrdinal < roots.length);
  assert.equal(roots[first.actionOrdinal].action, 'AttackAction');
  assert.equal(roots[first.actionOrdinal].playerSlot, row.originalSourceSeat);
  assert.ok(Array.isArray(first.publicBoardAfter) &&
    first.publicBoardAfter.length === 2);
  const end = first.completionRootOrdinal;
  const after = roots.slice(end + 1);
  const voluntary = root => root.action !== 'ResolvePromptAction';
  const nextContender = after.find(root =>
    root.playerSlot === row.candidateSeat && voluntary(root)) ?? null;
  const nextSource = nextContender ? after.find(root =>
    root.actionOrdinal > nextContender.actionOrdinal &&
    root.playerSlot === row.originalSourceSeat && voluntary(root)) ?? null : null;
  const afterAttackDeclarations = after.filter(root =>
    root.playerSlot === row.candidateSeat && root.action === 'AttackAction').length;
  return {
    id: row.id, status: row.status, sourceSeat: row.originalSourceSeat,
    contenderSeat: row.candidateSeat, sourceSettledAttacks: source.settled,
    contenderSettledAttacks: opponent.settled,
    sourcePrizesBySettledAttacks, sourcePrizeAttackEvents:prizeAttacks.length,
    soleFundedActiveCollapseEvents,
    firstSourcePrize: {attackOrdinal: first.actionOrdinal,
      completionRootOrdinal: end, attack: first.attackName,
      sourcePrizesTaken: first.prizesBefore[row.originalSourceSeat] -
        first.prizesAfter[row.originalSourceSeat]},
    contenderPostPrizeAttackDeclarations: afterAttackDeclarations,
    nextContenderRoot: nextContender && {
      ordinal: nextContender.actionOrdinal, turn: nextContender.turnBefore,
      action: nextContender.action, card: nextContender.card ?? null},
    nextSourceRoot: nextSource && {
      ordinal: nextSource.actionOrdinal, turn: nextSource.turnBefore,
      action: nextSource.action},
    contenderAttachedEnergyBeforePrize:prizeEnergyEvents[0].beforeEnergy,
    contenderAttachedEnergyAfterPrize:prizeEnergyEvents[0].afterEnergy,
    firstPrizeSoleFundedActiveBoardEnergyCollapsed:
      prizeEnergyEvents[0].soleFundedActiveBoardEnergyCollapse,
    competitivelyQualified: false
  };
}

/**
 * Summarize all registered observed contexts, including zero-Prize contexts.
 * @param {object} archive The published treatment archive.
 * @returns {object}
 */
function auditPostPrizeArchive(archive) {
  assert.ok(Array.isArray(archive?.attempts));
  const rows = archive.attempts.map(auditPostPrizeAttempt);
  assert.equal(new Set(rows.map(row => row.id)).size, rows.length);
  const positive = rows.filter(row => row.firstSourcePrize);
  return {
    version: VERSION, attemptedContexts: rows.length,
    sourcePrizeContexts: positive.length,
    sourcePrizeAttackEvents: rows.reduce((sum,row) =>
      sum + row.sourcePrizeAttackEvents,0),
    soleFundedActiveCollapseEvents: rows.reduce((sum,row) =>
      sum + row.soleFundedActiveCollapseEvents,0),
    recordedContenderCounterattackContexts: positive.filter(row =>
      row.contenderPostPrizeAttackDeclarations > 0).length,
    energyFreeContenderBoardAtFirstPrizeContexts: positive.filter(row =>
      row.contenderAttachedEnergyAfterPrize === 0).length,
    contenderResponseObservedContexts: positive.filter(row =>
      row.nextContenderRoot !== null).length,
    sourceReturnAfterOpponentRootContexts: positive.filter(row =>
      row.nextSourceRoot !== null).length,
    paperQualifiedGames: 0,
    qualifier: 'Root-bounded native observation only; no owner-hand opportunity or paper eligibility proof',
    rows
  };
}

module.exports = {VERSION, attachedPublicEnergyCount,
  energyCustodyAtPrizeAttack,
  auditPostPrizeAttempt, auditPostPrizeArchive};
