'use strict';

const assert = require('node:assert/strict');

const SOURCE_SEED = 1111464409;
const SOURCE_RANK = 11;
const SOURCE_TURN = 23;
const SOURCE_SEAT = 0;

/**
 * Extract the actual source player's information set at each recorded decision,
 * without using unrevealed opponent cards to select an action.
 *
 * Does not infer policy competence from a low-energy board: a manual Energy
 * attachment may remain available and needs explicit own-hand inspection.
 * @param {object} game Authentic completed source game.
 * @param {number} [turn=23] Global turn.
 * @param {0|1} [seat=0] Source player physical seat.
 * @returns {object}
 */
function auditSourcePass(game, turn=SOURCE_TURN, seat=SOURCE_SEAT) {
  const ledger = game.rootActionLedger;
  const decisions = game.decisionTrace;
  assert.ok(Array.isArray(ledger) && Array.isArray(decisions));
  const actions = ledger.filter(row=>row.turnBefore===turn);
  const ownerActions = actions.filter(row=>row.playerSlot===seat);
  const passRows = decisions.filter(row=>row.turnBefore===turn &&
    row.playerSlot===seat && row.action==='PassTurnAction');
  assert.equal(passRows.length,1,'Need one actual source PassTurnAction decision');
  const pass = passRows[0];
  const hand = pass.decisionHandBefore;
  assert.ok(hand && hand.perspectiveSeat===seat,
    'Missing acting-player own-hand evidence at Pass');
  assert.ok(Array.isArray(hand.ownHandPrintings));
  const board = pass.publicBoardBeforePass;
  assert.ok(Array.isArray(board));
  const active = board[seat]?.active;
  assert.ok(active?.name && Array.isArray(active.energyCards));
  const energyCandidates=hand.ownHandPrintings.filter(name=>
    /(?:^| )Energy(?: |$)/i.test(name));
  const basicDarkness=energyCandidates.filter(name=>
    /^(?:Basic )?Darkness Energy(?: |$)/i.test(name));
  const attachedOnTurn=ownerActions.filter(row=>
    /AttachEnergy/.test(row.action));
  const beforeMarnie=decisions.find(row=>
    row.turnBefore===turn && row.playerSlot===seat &&
    row.action==='PlayCardAction' && row.card==='Marnie');
  const first=decisions.find(row=>
    row.turnBefore===turn && row.playerSlot===seat &&
    row.action==='PlayCardAction');
  const sourceDecisionActions=decisions.filter(row=>
    row.turnBefore===turn && row.playerSlot===seat).map(row=>({
      ordinal:row.actionOrdinal,
      action:row.action,
      card:row.card??null,
      ownHandBefore:row.decisionHandBefore?.ownHandPrintings??null
    }));
  return {
    schema:'rank11-real-source-pass-resource-witness-v1',
    globalTurn:turn,sourceSeat:seat,
    firstSourceOwnHand:first?.decisionHandBefore?.ownHandPrintings??null,
    preMarnieOwnHand:beforeMarnie?.decisionHandBefore?.ownHandPrintings??null,
    ownHandBeforePass:hand.ownHandPrintings,
    opponentHandSizeBeforePass:hand.opponentHandSize,
    sourceDecisions:sourceDecisionActions,
    rootActions:ownerActions,
    sourceActiveAtPass:active,
    activePrintedAttacks:active.printedAttacks??[],
    activeEnergyPrintings:active.energyCards,
    handEnergyPrintings:energyCandidates,
    handBasicDarknessPrintings:basicDarkness,
    observedManualEnergyActions:attachedOnTurn,
    printedSingleDarknessInsufficientForMegaAbsolTerminalPeriod:
      active.name==='Mega Absol ex' && active.energyCards.length===1 &&
      active.energyCards[0].startsWith('Darkness Energy'),
    potentialBasicDarknessAttachmentMiss:
      basicDarkness.length>0 && attachedOnTurn.length===0 &&
      active.name==='Mega Absol ex' && active.energyCards.length===1,
    policyQualified:false,
    paperQualified:false,
    interpretation:'Retrospective own-hand and public-board observation. A positive basic-Darkness flag warrants a legal action/policy test; a negative result does not establish policy competence.'
  };
}

/**
 * Re-run the immutable actual game through the existing source-tested runner.
 * The runner's normal policy/seed and first-turn pivot are unchanged.
 * @returns {object}
 */
function run() {
  const {planAichi}=require('../evaluation/aichi-pilot.cjs');
  const {pairedCandidateSlots}=require('./new-moon-lockbreak-source-diagnostic.cjs');
  const {runArm}=require('./new-moon-second-start-paired.cjs');
  const rank11=planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  }).opponents.find(row=>row.rank===SOURCE_RANK);
  assert.equal(rank11?.status,'ready');
  const candidate=pairedCandidateSlots().lockbreak;
  assert.equal(rank11.cards.length,60);
  assert.equal(candidate.length,60);
  const game=runArm(candidate,rank11.cards,1,SOURCE_SEED,350,true,true,false,false);
  assert.equal(game.firstTurnSlot,SOURCE_SEAT);
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(game.finished,true);
  assert.deepEqual(game.prizesRemaining,[2,0]);
  const event=game.attackDeclarationTrace.find(row=>
    row.playerSlot===1 && row.turnBefore===22 &&
    row.attackName==='Poltergeist' && row.triggerAction!=='AttackAction');
  assert.ok(event && event.actionOrdinal===210,
    'Frozen actual source copied attack drifted');
  const result=auditSourcePass(game);
  assert.ok(result.rootActions.some(row=>
    row.action==='PlayCardAction' && row.card==='Shopping Center'));
  assert.ok(result.rootActions.some(row=>
    row.action==='PlayCardAction' && row.card==='Marnie'));
  assert.ok(result.rootActions.some(row=>row.action==='PassTurnAction'));
  return {
    ...result,
    seed:SOURCE_SEED,engine:game.engine,
    sourceRank:SOURCE_RANK,candidateSeat:1,
    actualFirstSeat:game.firstTurnSlot,
    fixedCandidate:'New Moon Lockbreaker English mechanics proxy',
    opponent:'exact Aichi rank11 Absol/Garbodor',
    copiedAttackOrdinal:event.actionOrdinal,
    policy:game.policy,
    outcomeStatus:'historical retrospective source replay, no qualified games'
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={auditSourcePass,run};
