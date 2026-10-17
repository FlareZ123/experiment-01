'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {withStoreDispatchTranscript}=require('./store-dispatch-transcript.cjs');
const {withRank8BoardObserver}=require('./hood-rank8-source-board-observer.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');

const SEED=1260748957;
const CANDIDATE_SEAT=1;

/** @param {unknown} value @returns {string} */
const hash=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

/** @param {object} pokemon @returns {object|null} */
function position(pokemon) {
  if(!pokemon)return null;
  return {name:pokemon.name,damage:pokemon.damage,
    energy:pokemon.energyCards,tools:pokemon.toolCards};
}

/** @param {object} snap @param {number} seat @returns {object} */
function side(snap,seat) {
  const board=snap.board[seat];
  return {
    active:position(board.active),
    bench:board.bench.map(position).filter(x=>[
      'Garbodor','Trubbish','Shadow Rider Calyrex VMAX','Shadow Rider Calyrex V'
    ].includes(x.name)),
    stadium:board.stadium,
    hand:seat===snap.activePlayer?snap.actingHand:null
  };
}

/** @param {object} event @returns {object} */
function condense(event) {
  const player=event.actingSeat;
  const attacker=side(event.before,player);
  const defender=side(event.before,1-player);
  const after=event.after;
  const defenderDamage=defender.active?.damage??null;
  return {
    ordinal:event.ordinal,turn:event.turn,actingSeat:player,
    action:event.action,card:event.card,declaredName:event.declaredName,
    attackBefore:attacker.active,
    targetBefore:defender.active,
    opponentActiveExactly60: event.action==='AttackAction' &&
      event.declaredName==='Terminal Period'?defenderDamage===60:null,
    opponentDarknessDiscardBefore:event.before.opponentDarknessDiscard,
    visibleBefore:{actor:attacker,other:defender},
    after:{
      actor:side(after,player),other:side(after,1-player),
      prizes:after.prizes
    }
  };
}

/**
 * All public Pokemon positions for actual source Tool play, including
 * unrelated Basics omitted by the narrow Garbodor/Shadow Rider projection.
 * This is extracted from the read-only root Store observer only.
 * @param {object} event
 * @returns {object}
 */
function fullToolAction(event) {
  const seat = event.actingSeat;
  /** @param {object} snap */
  const ownBoard = snap => ({
    active: position(snap.board[seat].active),
    bench: snap.board[seat].bench.map(position),
    stadium: snap.board[seat].stadium
  });
  return {
    ordinal:event.ordinal,turn:event.turn,actingSeat:seat,
    card:event.card,actingHandBefore:event.before.actingHand,
    boardBefore:ownBoard(event.before),boardAfter:ownBoard(event.after),
    error:event.dispatchError
  };
}

/**
 * Detached sequence of every actual source-player turn-7 Store dispatch.
 * Only the acting player's own hand and public board are retained, so a
 * prospective Tool hold can be judged from pre-search information.
 * @param {object} event
 * @returns {object}
 */
function sourceTurnSevenAction(event) {
  const board = snap => ({
    active: position(snap.board[0].active),
    bench: snap.board[0].bench.map(position)
  });
  return {
    ordinal:event.ordinal,turn:event.turn,action:event.action,
    card:event.card,declaredName:event.declaredName,
    beforeHand:event.before.actingHand,
    afterHand:event.after.actingHand,
    pendingPromptsBefore:event.before.unresolvedPrompts,
    beforeBoard:board(event.before),afterBoard:board(event.after),
    dispatchError:event.dispatchError
  };
}

/**
 * Fixed candidate-second rank8 source deal, identical to compiled natural
 * Hood v1 CI 39052628800. Compare unchanged-observed-unchanged root
 * Store action input streams in one process, and expose source action state.
 * This reports a diagnostic only, never a verified competitive win.
 */
function main() {
  const candidate=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
  const manifest=require('../../results/aichi-2026/full-decklists.json');
  const source=manifest.decks.find(d=>d.rank===8);
  assert.ok(source);
  const plan=planAichi(candidate,{allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
  const opponent=plan.opponents.find(d=>d.rank===8);
  assert.equal(opponent?.status,'ready');
  assert.ok(plan.candidate.cards?.length===60);
  const request={
    deckA:opponent.cards,deckB:plan.candidate.cards,seed:SEED,maxActions:800,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    doubleDragonRecovery:true,supporterDecisionCorrection:true,
    isolatePolicyRandomness:true,leleEntryAbilityLockCorrection:true,
    radiantGateLockCorrection:true,entryDrawLockCorrection:true,
    captureDecisionTrace:true,label:'agent15-rank8-hood-source-observer'
  };
  initializeCards();
  const {Store}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const record=()=>withStoreDispatchTranscript(Store,()=>runMatch(request),{
    liveStoreOnly:true,typedActionValues:true,
    promptReferenceActionValues:true,sourceZoneEveryDispatch:true
  });
  const before=record();
  const observed=withRank8BoardObserver(Store,record);
  const after=record();
  const controlTrace=hash(before.actionTrace);
  const observedTrace=hash(observed.result.actionTrace);
  const repeatTrace=hash(after.actionTrace);
  assert.equal(observedTrace,controlTrace,'Observer changed root Store stream');
  assert.equal(repeatTrace,controlTrace,'Observer left side effects in process');
  const game=observed.result.result;
  assert.equal(game.firstTurnSlot,0,'Candidate must genuinely start second');
  assert.equal(game.verifiedByDrawLog,true);
  const facts=observed.records.map(condense);
  const terminal= facts.filter(x=>x.action==='AttackAction' &&
    x.declaredName==='Terminal Period');
  const garbo= facts.filter(x=>x.card==='Garbodor');
  const hood= facts.filter(x=>x.card==='Stealthy Hood');
  const doors=facts.filter(x=>x.action==='UseAbilityAction' &&
    x.declaredName==='Underworld Door');
  return {
    schema:'agent15-rank8-hood-live-store-opponent-action-v1',
    sourceResearchRevision:process.env.GITHUB_SHA||'local-unpinned',
    sourceCompiledReferenceRun:39052628800,
    pinnedEngine:game.engine,policy:game.policy,randomness:game.randomnessProtocol,
    seed:SEED,physicalCandidateSeat:'B',actualCandidateTurn:'second',
    candidateSourceDigest:hash(candidate.cards),opponentSourceDigest:hash(source.cards),
    sourceStoreRecords:observed.liveDispatches,
    exactFullActionStreamNoninterference:true,
    actionStreamSha256:controlTrace,
    originalControlOutcome:{turns:before.result.turns,finished:before.result.finished,
      winner:before.result.winner,prizesRemaining:before.result.prizesRemaining},
    observedOutcome:{turns:game.turns,finished:game.finished,winner:game.winner,
      prizesRemaining:game.prizesRemaining,actionCount:game.actions},
    attackCounts:game.attackTrace.reduce((a,x)=>{a[x.seat]++;return a;},[0,0]),
    keyEvents:{
      hood,garbodor:garbo,underworldDoor:doors,
      terminalPeriod:terminal,
      darknessEnergyAndPatch:facts.filter(x=>x.actingSeat===0 && (
        x.card==='Darkness Energy'||x.card==='Dark Patch'
      ))
    },
    chronologicalBoardEvents:facts,
    fullPublicToolPlays:observed.records
      .filter(x=>x.action==='PlayCardAction' &&
        ['Float Stone','Stealthy Hood','Forest Seal Stone'].includes(x.card))
      .map(fullToolAction),
    sourceTurnSevenTimeline:observed.records
      .filter(x=>x.turn===7 && x.before.activePlayer===0)
      .map(sourceTurnSevenAction),
    qualifiedForCompetitiveInference:false,
    limitations:[
      'This is one previously selected source deal; 3 repeats are noninterference controls',
      'The generic opponent bot may omit search, Energy acceleration or superior attacks',
      'Terminal Period is conditionally a Knock Out, not ordinary direct damage',
      'Paper rule fidelity and realistic opponent replies remain unqualified'
    ]
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={main,condense,position,side,fullToolAction,sourceTurnSevenAction};
