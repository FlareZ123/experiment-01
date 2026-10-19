'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots} =
  require('./new-moon-lockbreak-source-diagnostic.cjs');
const {runArm} = require('./new-moon-second-start-paired.cjs');
const {withRank11HeldSeal} = require('./rank11-held-seal-policy.cjs');
const {withNewMoonBlowerAutonomy} =
  require('./newmoon-garbotoxin-blower-autonomy.cjs');

const SOURCE_SEAT = 0;
const CANDIDATE_SEAT = 1;
const ACTION_CAP = 110;

/**
 * The entire source-positive cohort, selected *after* the genuine
 * 128-source-deal opening screen. This is a mechanistic retrospective fixture,
 * not a prospective sample of games or independent trials.
 */
const FIXTURES = Object.freeze([
  {trial:5,seed:1097193676,route:'vip'},
  {trial:16,seed:188431119,route:'hand'},
  {trial:43,seed:3003119583,route:'vip'},
  {trial:59,seed:1056048178,route:'vip'},
  {trial:86,seed:3278716788,route:'vip'}
]);

/** @param {object} game @param {0|1} seat @param {number} turn */
function turnActions(game, seat, turn) {
  return game.decisionTrace.filter(row =>
    row.playerSlot === seat && row.turnBefore === turn
  ).map(row => ({
    ordinal:row.actionOrdinal,action:row.action,
    card:row.card ?? null,ability:row.ability ?? null,
    attack:row.attack ?? null,
    copiedSource:row.attackChoice?.selection?.printing ?? null,
    copiedAttack:row.attackChoice?.selection?.attackName ?? null,
    ownHand:row.decisionHandBefore?.ownHandPrintings ?? null
  }));
}

/** @param {object} game */
function shortGame(game) {
  const candidate=game.decisionTrace.filter(row =>
    row.playerSlot===CANDIDATE_SEAT && row.turnBefore<=10);
  return {
    actualFirstSeat:game.firstTurnSlot,
    drawLogVerified:game.verifiedByDrawLog,
    rootActions:game.actions,globalTurns:game.turns,
    finished:game.finished,engineWinner:game.winner,
    prizesRemaining:game.prizesRemaining,
    candidateFirstTurnActions:turnActions(game,CANDIDATE_SEAT,2),
    candidateFirstTurnVisibleOwnHand:
      turnActions(game,CANDIDATE_SEAT,2).find(row=>row.ownHand)?.ownHand ?? null,
    candidateFirstTwoPassBoards:candidate.filter(row =>
      row.action==='PassTurnAction').slice(0,2).map(row=>({
        turn:row.turnBefore,
        ownPublicBoard:row.publicBoardBeforePass?.[CANDIDATE_SEAT]??null,
        opponentPublicBoard:row.publicBoardBeforePass?.[SOURCE_SEAT]??null
      })),
    candidateEarlyPrintedDeclarations:(game.attackDeclarationTrace||[])
      .filter(row=>row.playerSlot===CANDIDATE_SEAT &&
        row.turnBefore<=10).map(row=>({
          ordinal:row.actionOrdinal,turn:row.turnBefore,
          attack:row.attackName,status:row.resolutionStatus
        })),
    candidateEarlyCopiedSelections:candidate.filter(row =>
      row.attackChoice?.selection).map(row=>({
        ordinal:row.actionOrdinal,turn:row.turnBefore,
        selected:row.attackChoice.selection
      }))
  };
}

/**
 * Compare the real source's held-Seal turn against frozen New Moon without
 * and with the existing owner-information-correct Field Blower / Lillie
 * response policy, keeping the original registered 60s and physical deal.
 *
 * @returns {object}
 */
function run() {
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const opponent=plan.opponents.find(row=>row.rank===11);
  assert.equal(opponent?.status,'ready');
  assert.equal(opponent.cards.length,60);
  const candidate=pairedCandidateSlots().lockbreak;
  assert.equal(candidate.length,60);
  const rows=[];
  for(const fixture of FIXTURES) {
    const play=()=>runArm(candidate,opponent.cards,CANDIDATE_SEAT,
      fixture.seed,ACTION_CAP,true);
    const baseline=withRank11HeldSeal(SOURCE_SEAT,play);
    // Source hook is inside candidate hook: its next-turn lock witness
    // is captured before the candidate can play Field Blower.
    const response=withNewMoonBlowerAutonomy(CANDIDATE_SEAT,
      ()=>withRank11HeldSeal(SOURCE_SEAT,play),
      {lowHandLillieAfterBlower:true});
    const broad=withNewMoonBlowerAutonomy(CANDIDATE_SEAT,
      ()=>withRank11HeldSeal(SOURCE_SEAT,play),
      {lowHandLillieAfterBlower:true,allowAnyActiveBlower:true});
    const baseGame=baseline.result;
    const replyGame=response.result.result;
    const broadGame=broad.result.result;
    const broadSource=broad.result.policyAudit;
    const sourceResponse=response.result.policyAudit;
    for(const game of [baseGame,replyGame,broadGame]) {
      assert.equal(game.firstTurnSlot,SOURCE_SEAT,
        'Retrospective first-source fixture changed actual start');
      assert.equal(game.verifiedByDrawLog,true);
    }
    assert.deepEqual(baseGame.deckHashes,replyGame.deckHashes);
    assert.deepEqual(baseGame.deckHashes,broadGame.deckHashes);
    assert.equal(baseline.policyAudit.completed,true,
      'Previous successful source held-Seal line no longer completes');
    assert.equal(sourceResponse.completed,true,
      'Source held-Seal line changed before candidate can respond');
    assert.equal(broadSource.completed,true,
      'Source opening changed before Active-independent response');
    assert.equal(baseline.policyAudit.route,fixture.route);
    assert.deepEqual(baseline.policyAudit.selectedActions,
      sourceResponse.selectedActions);
    assert.deepEqual(baseline.policyAudit.selectedActions,
      broadSource.selectedActions);
    const sourcePrefix=game=>game.rootActionLedger.filter(row=>
      row.turnBefore<2);
    assert.deepEqual(sourcePrefix(baseGame),sourcePrefix(replyGame),
      'Opponent response affected authentic source initial turn');
    assert.deepEqual(sourcePrefix(baseGame),sourcePrefix(broadGame),
      'Active-independent response changed the authentic source opening');
    rows.push({
      ...fixture,sourceActuallyFirst:true,
      identicalSourceFirstTurnRootLedger:true,
      sourceOpening:{
        selectedActions:baseline.policyAudit.selectedActions,
        route:baseline.policyAudit.route,
        selectedTool:baseline.policyAudit.selectedTrubbishTool,
        nextTurnLockWitness:baseline.policyAudit.nextTurnLockWitness
      },
      sourceResponseOpening:{
        completed:sourceResponse.completed,
        nextTurnLockWitness:sourceResponse.nextTurnLockWitness
      },
      responder:{
        selectedBlowers:response.policyAudit.opportunitySelections,
        confirmedToolRemovals:response.policyAudit.confirmedToolRemovals,
        selectedLillies:response.policyAudit.lowHandLillieSelections,
        policyEvents:response.policyAudit.events
      },
      baseline:shortGame(baseGame),
      withCandidateResponse:shortGame(replyGame),
      anyActiveResponder:{
        selectedBlowers:broad.policyAudit.opportunitySelections,
        confirmedToolRemovals:broad.policyAudit.confirmedToolRemovals,
        selectedLillies:broad.policyAudit.lowHandLillieSelections,
        policyEvents:broad.policyAudit.events
      },
      withAnyActiveResponse:shortGame(broadGame),
      competitiveQualified:false
    });
  }
  return {
    schema:'rank11-held-seal-vs-newmoon-live-response-retrospective-v2',
    objective:'genuine held-Seal source line -> default and any-Active owner-legal Field Blower response',
    selection:'all 5 of 5 detected and completed source-first openings in the same source-A 128-deal frame; outcomes selected retrospectively',
    inputProvenance:{
      sourceRank:11,sourcePhysicalSeat:SOURCE_SEAT,
      candidateSeat:CANDIDATE_SEAT,
      pinnedEngine:plan.engineRevision,
      originalSourceManifest:plan.manifestDigest,
      candidate:'unchanged New Moon Lockbreaker English mechanics proxy 60',
      perArmRootActionCap:ACTION_CAP
    },
    fixtures:FIXTURES,rows,
    qualifiedCompetitiveGames:0,
    caveat:'Frozen retrospective mechanical opportunity fixtures only; no independently qualified full-game winner, paper-clock or strong two-sided policy claim'
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,FIXTURES,turnActions,shortGame};
