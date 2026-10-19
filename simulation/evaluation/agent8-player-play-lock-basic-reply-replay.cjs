'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {scheduledArms,assertManifest}=
  require('./agent41-crossrank-actual-decisions.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {withBroadThornsSourceAttack,discardOrder}=
  require('../twinleaf/rank6-broad-thorns-policy.cjs');

const root=path.resolve(__dirname,'../..');
const registration=require('../../results/aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json');

/**
 * Reuse one already observed, fully identified historical rejected Store root.
 * The original source 60s, chosen seed and source wrapper remain immutable.
 * Only a new optional both-actor locked-action Basic Bench reply is applied.
 * This does not add prospective or competitively qualified games.
 * @returns {object}
 */
function run() {
  assertManifest();
  const trial=scheduledArms().find(r=>r.id==='6:2:A:champion-reference');
  assert.ok(trial);
  assert.equal(trial.seed,2394734225);
  assert.equal(trial.candidateSlot,'A');
  const roster=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const champion=roster.decks.find(r=>r.rank===1);
  assert.ok(champion);
  const plan=planAichi({label:'champion-reference',cards:champion.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(r=>r.rank===6);
  assert.equal(source?.status,'ready');
  assert.equal(plan.candidate.cards.length,60);
  assert.equal(source.cards.length,60);
  const sourceSeat=1,candidateSeat=0;
  const request={
    deckA:plan.candidate.cards,deckB:source.cards,
    seed:trial.seed,maxActions:registration.maxRootActions,
    label:'agent8-play-lock-basic-bench-retrospective-'+trial.id,
    ...registration.frozenFlags,
    enforceVisiblePlayLockBothSeats:true,
    visiblePlayLockBasicBenchFallback:true,
    captureRejectedActionEvidence:true
  };
  const discards=discardOrder.slice(0,-5);
  let game=null,error=null;
  try {
    const sourcePolicy=withBroadThornsSourceAttack(()=>
      withBroadThornsSourceAttack(()=>runMatch(request),{
        seat:sourceSeat,turn:3,discardPriority:discards
      }),{
        seat:sourceSeat,turn:2,discardPriority:discards
      });
    game=sourcePolicy.result.result;
  } catch(caught) {
    error=String(caught?.stack||caught);
  }
  if(!game) return {
    schema:'agent8-play-lock-basic-reply-historical-v1',trial:trial.id,
    seed:trial.seed,status:'engine-error',error,
    fullPaperLegalityCertified:false,competitiveQualifiedGames:0
  };
  assert.equal(game.engine,'twinleafgg/'+registration.enginePin);
  assert.equal(game.seed,trial.seed);
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(game.livePlayLockGuardBothSeats,true);
  assert.equal(game.visiblePlayLockBasicBenchFallback,true);
  const events=game.playLockDispatchGuardEvents||[];
  const rootActions=game.rootActionLedger||[];
  const target=events.find(e=>e.seat===sourceSeat && e.turn===3 &&
    e.reason==='stadium-lock' && e.originalCard==='Thunder Mountain Prism Star LOT');
  const sourceBasics=rootActions.filter(row=>row.playerSlot===sourceSeat &&
    row.action==='PlayCardAction' &&
    String(row.card).includes('Iron Thorns ex'));
  return {
    schema:'agent8-play-lock-basic-reply-historical-v1',
    trial:trial.id,seed:trial.seed,
    sourceSeat,candidateSeat,sourceActuallyFirst:game.firstTurnSlot===sourceSeat,
    sourcePrescribedMaxActions:registration.maxRootActions,
    observedPriorKnownBlockedRoot:target??null,
    sourceBasicBenchRootActions:sourceBasics,
    totalOwnerHandLockVetoEvents:events.length,
    lockEvents:events.slice(0,12),
    actionCount:game.actions,turns:game.turns,
    finished:game.finished,winner:game.finished?game.winner:null,
    endReason:game.endReason,prizesRemaining:game.prizesRemaining,
    sourceAttackDeclarations:(game.attackDeclarationTrace||[]).filter(e=>
      e.playerSlot===sourceSeat).length,
    candidateAttackDeclarations:(game.attackDeclarationTrace||[]).filter(e=>
      e.playerSlot===candidateSeat).length,
    expectedHypothesis:'One formerly blocked Stadium root may become a genuine owner-hand Basic Bench play',
    historicalSelectedDeal:true,
    fullPaperLegalityCertified:false,competitiveQualifiedGames:0,
    caveat:'This is new unqualified policy applied to one previously selected source deal; never prospective or competitive evidence.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
