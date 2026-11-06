'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {
  attachedPublicEnergyCount, auditPostPrizeAttempt, auditPostPrizeArchive
} = require('../simulation/evaluation/agent24-v8-postprize-audit.cjs');

/** @param {object[]} roots @returns {string} */
function digest(roots) {
  return createHash('sha256').update(JSON.stringify(roots)).digest('hex');
}

/** @param {boolean} [prize] @returns {object} */
function fixture(prize = true) {
  const roots = [
    {actionOrdinal:0,playerSlot:0,action:'AttackAction',turnBefore:4},
    {actionOrdinal:1,playerSlot:0,action:'ResolvePromptAction',turnBefore:4},
    {actionOrdinal:2,playerSlot:1,action:'PassTurnAction',turnBefore:5},
    {actionOrdinal:3,playerSlot:0,action:'PassTurnAction',turnBefore:6}
  ];
  const before = [
    {active:{printing:'source-active',energyCards:['Lightning']},bench:[]},
    {active:{printing:'funded-active',energyCards:['P','P']},
      bench:[{printing:'bench-card',energyCards:[]}]}
  ];
  const board = [
    {active:{printing:'source-active',energyCards:['Lightning']},bench:[]},
    {active:{printing:'bench-card',energyCards:[]},bench:[]}
  ];
  return {
    id:'source-vs-contender',status:'root-cap-unqualified',
    originalSourceSeat:0,candidateSeat:1,
    publicRootActions:roots,publicRootActionsTruncated:false,
    publicRootActionCount:roots.length,
    publicRootLedgerSha256Computed:digest(roots),
    publicRootLedgerSha256Reported:digest(roots),
    actualSourceAttackSettlement:{declarations:1,settled:1,
      attacks:[{actionOrdinal:0,completionRootOrdinal:1,
        attackName:'TestAttack',settledPromptChain:true,
        prizesBefore:[6,6],prizesAfter:[prize?5:6,6],
        publicBoardBefore:before,publicBoardAfter:board}]},
    candidateAttackSettlement:{declarations:0,settled:0,attacks:[]}
  };
}

test('counts only physically attached public Energy', () => {
  assert.equal(attachedPublicEnergyCount({active:null,bench:[]}),0);
  assert.equal(attachedPublicEnergyCount({active:{energyCards:['a','b']},
    bench:[{energyCards:['c']},{energyCards:[]}]}),3);
});

test('preserves first paid Prize, immediate reply, and source return', () => {
  const row = auditPostPrizeAttempt(fixture());
  assert.equal(row.sourcePrizesBySettledAttacks,1);
  assert.equal(row.firstSourcePrize.completionRootOrdinal,1);
  assert.equal(row.contenderAttachedEnergyBeforePrize,2);
  assert.equal(row.contenderAttachedEnergyAfterPrize,0);
  assert.equal(row.firstPrizeSoleFundedActiveBoardEnergyCollapsed,true);
  assert.equal(row.nextContenderRoot.action,'PassTurnAction');
  assert.equal(row.nextSourceRoot.action,'PassTurnAction');
  assert.equal(row.contenderPostPrizeAttackDeclarations,0);
  assert.equal(row.competitivelyQualified,false);
});

test('keeps zero-Prize contexts and correct denominators', () => {
  const archive = auditPostPrizeArchive({attempts:[fixture(),
    {...fixture(false),id:'other'}]});
  assert.equal(archive.attemptedContexts,2);
  assert.equal(archive.sourcePrizeContexts,1);
  assert.equal(archive.sourcePrizeAttackEvents,1);
  assert.equal(archive.soleFundedActiveCollapseEvents,1);
  assert.equal(archive.recordedContenderCounterattackContexts,0);
  assert.equal(archive.energyFreeContenderBoardAtFirstPrizeContexts,1);
  assert.equal(archive.contenderResponseObservedContexts,1);
  assert.equal(archive.sourceReturnAfterOpponentRootContexts,1);
  assert.equal(archive.rows[1].contenderPostPrizeAttackDeclarations,null);
});

test('detects tampered public-root ledger', () => {
  const row = fixture();
  row.publicRootActions[2].action='AttackAction';
  assert.throws(() => auditPostPrizeAttempt(row), /sha256|Expected values/);
});

test('unsettled source declaration cannot become a Prize event', () => {
  const row = fixture();
  row.actualSourceAttackSettlement.settled=0;
  row.actualSourceAttackSettlement.attacks[0].settledPromptChain=false;
  const audited=auditPostPrizeAttempt(row);
  assert.equal(audited.sourcePrizesBySettledAttacks,0);
  assert.equal(audited.firstSourcePrize,null);
});

test('post-Prize contender AttackAction is distinct from its prior attacks', () => {
  const row = fixture();
  row.publicRootActions[2].action='AttackAction';
  row.candidateAttackSettlement={declarations:1,settled:0,attacks:[{
    actionOrdinal:2,settledPromptChain:false}]};
  row.publicRootLedgerSha256Computed=digest(row.publicRootActions);
  row.publicRootLedgerSha256Reported=digest(row.publicRootActions);
  const audited=auditPostPrizeAttempt(row);
  assert.equal(audited.contenderPostPrizeAttackDeclarations,1);
  assert.equal(audited.nextContenderRoot.action,'AttackAction');
});
