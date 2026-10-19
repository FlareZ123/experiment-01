'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {loadNewMoonCandidate} = require('../../scripts/aichi-new-moon-candidate.cjs');
const {runWithResearchProfile,RANK11_AUTONOMOUS_PROFILE} = require('./policy-profiles.cjs');
const {withNewMoonBlowerAutonomy} = require('./newmoon-garbotoxin-blower-autonomy.cjs');

const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const engine = name => require(path.join(OUTPUT, name));
const SEED = 1244180408;
const SOURCE_SEAT = 0;
const CANDIDATE_SEAT = 1;
const QUICK = 'Quick Ball FST';
const DISCARD = ['Boost Shake EVS', 'VS Seeker PHF', 'Carmine TWM'];

/**
 * Explicit, retrospective, owner-information-limited source counterfactual.
 * Every action is passed through the live pinned Store and prompt validators.
 * No earlier source decisions, starting order, cards, RNG seed, or vendor files
 * are altered. All changes are scoped to the opponent's authentic turn 49.
 *
 * @template T
 * @param {0|1} sourceSeat
 * @param {()=>T} execute
 * @returns {{result:T,audit:object}}
 */
function withRank11Turn49QuickBalls(sourceSeat, execute) {
  const {SimpleTacticsAi} = engine('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType} = engine('game/store/actions/play-card-action');
  const {ResolvePromptAction} = engine('game/store/actions/resolve-prompt-action');
  const {GamePhase} = engine('game/store/state/state');
  const original = SimpleTacticsAi.prototype.decodeNextAction;
  const sourceId = sourceSeat === 0 ? 101 : 202;
  const events = [];
  let phase = 'play';
  let completed = 0;
  let activated = false;
  let blocked = null;
  let firstHand = null;
  let deckAtStart = null;
  const fail = (reason, state, pending) => {
    blocked = {reason,phase,completed,turn:state.turn,
      pending:pending?.constructor?.name ?? null};
    events.push({kind:'blocked',...blocked});
    phase = 'blocked';
  };

  const override = function rank11HandBurn(state) {
    const own = state.players.find(player => player.id === this.client?.id);
    if (!own || own.id !== sourceId ||
        state.turn !== 49 || state.activePlayer !== sourceSeat ||
        state.phase !== GamePhase.PLAYER_TURN ||
        phase === 'blocked' || completed === 3) {
      return original.call(this,state);
    }
    const pending = state.prompts.find(prompt => prompt.result === undefined);
    if (!activated) {
      if (pending) return original.call(this,state);
      firstHand = own.hand.cards.map(card => card.fullName);
      deckAtStart = own.deck.cards.length;
      if (firstHand.filter(name => name === QUICK).length !== 3 ||
          deckAtStart !== 14 ||
          DISCARD.some(name => !firstHand.includes(name))) {
        fail('source-dealt-opening-guard-drift',state,pending);
        return original.call(this,state);
      }
      activated = true;
      events.push({kind:'owner-start',turn:state.turn,
        hand:firstHand,deckRemaining:deckAtStart});
    }
    if (phase === 'discard') {
      if (!pending || pending.constructor.name !== 'ChooseCardsPrompt' ||
          pending.playerId !== own.id ||
          !pending.cards?.cards?.every(card=>own.hand.cards.includes(card))) {
        fail('unexpected-discard-prompt',state,pending);
        return original.call(this,state);
      }
      const name=DISCARD[completed];
      const card=pending.cards.cards.find(item=>item.fullName===name);
      if (!card || !pending.validate([card],state)) {
        fail('planned-owner-discard-rejected',state,pending);
        return original.call(this,state);
      }
      phase='search';
      events.push({kind:'validated-discard',turn:state.turn,card:name,
        promptId:pending.id});
      return new ResolvePromptAction(pending.id,[card]);
    }
    if (phase === 'search') {
      if (!pending || pending.constructor.name !== 'ChooseCardsPrompt' ||
          pending.playerId !== own.id || pending.cards !== own.deck) {
        if (pending?.constructor?.name === 'WaitPrompt') {
          return original.call(this,state);
        }
        fail('unexpected-deck-search-prompt',state,pending);
        return original.call(this,state);
      }
      if (!pending.validate([],state)) {
        fail('zero-basic-search-rejected',state,pending);
        return original.call(this,state);
      }
      phase='verify';
      events.push({kind:'validated-zero-basic-search',turn:state.turn,
        promptId:pending.id,ownDeckSize:own.deck.cards.length});
      return new ResolvePromptAction(pending.id,[]);
    }
    if (phase === 'verify') {
      if (pending) return original.call(this,state);
      completed++;
      events.push({kind:'search-resolved',turn:state.turn,completed,
        trainersLeft:own.hand.cards.filter(c=>c.superType===2).length,
        hand:own.hand.cards.map(c=>c.fullName)});
      phase='play';
      if (completed===3) return original.call(this,state);
    }
    if (pending) return original.call(this,state);
    const index=own.hand.cards.findIndex(card=>card.fullName===QUICK);
    if (index<0) {
      fail('missing-next-quick-ball',state,pending);
      return original.call(this,state);
    }
    const action=new PlayCardAction(own.id,index,
      {player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
    if (!this.isValidAction(state,action)) {
      fail('live-store-item-legality-rejected',state,pending);
      return original.call(this,state);
    }
    phase='discard';
    events.push({kind:'live-legal-quick-ball',turn:state.turn,
      ordinalWithinCounterfactual:completed+1,
      hand:own.hand.cards.map(c=>c.fullName)});
    return action;
  };

  SimpleTacticsAi.prototype.decodeNextAction=override;
  try {
    const result=execute();
    return {result,audit:{seed:SEED,sourceSeat,turn:49,
      target:'three live-store Quick Ball Items with three owner-hand Trainer discards',
      promptedSearchChoice:'zero Basic (allowed by restricted deck search)',
      activated,initialOwnerHand:firstHand,initialOwnerDeckSize:deckAtStart,
      successfulSearchPromptCycles:completed,phaseAtEnd:phase,blocked,
      events,competitiveGamesQualified:0}};
  } finally {
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,override,
      'Another wrapper overwrote source hand-burn prototype without restoration');
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

/** @param {object} game */
function tail(game) {
  return {
    actions:game.actions,turns:game.turns,winner:game.winner,
    prizes:game.prizesRemaining,finished:game.finished,endReason:game.endReason,
    sourceTurn49Actions:(game.rootActionLedger||[]).filter(row=>
      row.playerSlot===SOURCE_SEAT && row.turnBefore===49),
    candidateLaterActions:(game.rootActionLedger||[]).filter(row=>
      row.playerSlot===CANDIDATE_SEAT && row.turnBefore>=50 &&
      row.turnBefore<=54),
    latePrintedEffects:(game.poltergeistEffectTrace||[]).filter(row=>
      row.turnBefore>=48).map(row=>({
        turn:row.turnBefore,ordinal:row.actionOrdinal,
        sourceHandTrainers:row.before?.[SOURCE_SEAT]?.handTrainerCount,
        assessment:row.assessment,
        opponentPrizesBefore:row.before?.[SOURCE_SEAT]?.prizesRemaining,
        opponentPrizesAfter:row.after?.[SOURCE_SEAT]?.prizesRemaining
      })),
    sourceAttackActions:(game.attackTrace||[]).filter(row=>
      row.seat===SOURCE_SEAT && row.turn>=47),
    candidateDeclarations:(game.attackDeclarationTrace||[]).filter(row=>
      row.playerSlot===CANDIDATE_SEAT && row.turnBefore>=48)
  };
}

function run() {
  const candidate=loadNewMoonCandidate();
  const plan=planAichi({label:candidate.id,cards:candidate.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const opponent=plan.opponents.find(row=>row.rank===11);
  assert.equal(opponent?.status,'ready');
  const request={
    deckA:opponent.cards,deckB:plan.candidate.cards,
    seed:SEED,maxActions:450,rank11SourceSeat:SOURCE_SEAT,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    capturePoltergeistEffectTrace:true,
    label:'rank11-turn49-owner-conserved-QuickBall-fork-unqualified'
  };
  const play=()=>runWithResearchProfile(request,RANK11_AUTONOMOUS_PROFILE);
  const baseline=withNewMoonBlowerAutonomy(CANDIDATE_SEAT,play,
    {lowHandLillieAfterBlower:true});
  const fork=withNewMoonBlowerAutonomy(CANDIDATE_SEAT,
    ()=>withRank11Turn49QuickBalls(SOURCE_SEAT,play),
    {lowHandLillieAfterBlower:true});
  const restored=withNewMoonBlowerAutonomy(CANDIDATE_SEAT,play,
    {lowHandLillieAfterBlower:true});
  const baselineGame=baseline.result;
  const altered=fork.result.result;
  assert.equal(baselineGame.firstTurnSlot,SOURCE_SEAT);
  assert.equal(altered.firstTurnSlot,SOURCE_SEAT);
  assert.equal(baselineGame.verifiedByDrawLog,true);
  assert.equal(altered.verifiedByDrawLog,true);
  assert.deepEqual(baselineGame.deckHashes,altered.deckHashes);
  assert.deepEqual(baselineGame.deckHashes,restored.result.deckHashes);
  assert.deepEqual(baselineGame.rootActionLedger,restored.result.rootActionLedger,
    'Restored source+candidate automatic policies must exactly replay baseline');
  const prefix=game=>(game.rootActionLedger||[]).filter(row=>
    row.turnBefore<49);
  assert.deepEqual(prefix(baselineGame),prefix(altered),
    'Counterfactual may not modify any pre-turn49 true source dispatch');
  const witnessed=baselineGame.decisionTrace.filter(row=>
    row.playerSlot===SOURCE_SEAT && row.turnBefore===49);
  assert.ok(witnessed.some(row=>row.actionOrdinal===288 &&
    row.card==='Darkness Energy'), 'Baseline turn49 provenance changed');
  assert.equal(fork.result.audit.activated,true,
    'Explicit alternative must encounter authentic own-hand opportunity');
  const rootLiveQuickBalls=(altered.rootActionLedger||[]).filter(row=>
    row.playerSlot===SOURCE_SEAT && row.turnBefore===49 &&
    row.action==='PlayCardAction' && row.card==='Quick Ball');
  return {
    schema:'rank11-source-turn49-three-QuickBall-live-Store-fork-v1',
    adversarialCounterfactual:true,retrospectiveSelectedSeed:true,
    sourceRank:11,seed:SEED,actualSourceFirst:true,
    enginePinned:plan.engineRevision,
    sourceDeckHashes:baselineGame.deckHashes,
    sourcePrintCount:opponent.cards.length,candidateProxyCount:plan.candidate.cards.length,
    sourceRootBaselineAt49:288,
    counterfactualAudit:fork.result.audit,
    threeCompleteCycles:fork.result.audit.successfulSearchPromptCycles===3,
    realStoreQuickBallDispatches:rootLiveQuickBalls,
    sourcePrefixIdentical:true,restorationReplayIdentical:true,
    baseline:tail(baselineGame),counterfactual:tail(altered),
    qualification:'Retrospectively selected seed and adversarial policy counterfactual; all engine wins are unqualified and not a measured game win rate',
    qualifiedCompetitiveGames:0
  };
}
if(require.main===module) process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,withRank11Turn49QuickBalls};
