'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} relative @returns {object} */
const engine=relative=>require(path.join(output,relative));

/**
 * A single source-authentic, information-set-correct Float Stone target
 * counterfactual. It changes exactly one bot-selected real Store action:
 * rank11's physical own-hand Float Stone when the original bot would play
 * that Stone on its Active Mega Absol ex at global turn 23.
 * No cards, hidden zones, opponent decisions, or printed effects are injected.
 *
 * @template T
 * @param {()=>T} execute Runs one fixed authentic source game.
 * @param {{skipChange?:boolean}} [options] Observe original bot action without alteration.
 * @returns {{result:T,selected:object|null,opportunities:number,firstCandidatePower:object|null}}
 */
function withGarbodorFloatStoneTarget(execute,{skipChange=false}={}) {
  if(typeof execute!=='function')throw new TypeError('A source game function is required');
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {GamePhase}=engine('game/store/state/state');
  const old=Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,'decodeNextAction');
  if(typeof old?.value!=='function')throw new Error('Pinned bot interface missing');
  let selected=null;
  let opportunities=0;
  let firstCandidatePower=null;
  const powerCheck=engine('game/store/prefabs/prefabs').IS_ABILITY_BLOCKED;
  const {Simulator}=engine('game/bots/simulator');
  const changed=function(state) {
    if(!firstCandidatePower && state.turn===24 && state.activePlayer===1 &&
        state.players[1].id===this.client?.id &&
        state.phase===GamePhase.PLAYER_TURN &&
        !state.prompts.some(p=>p.result===undefined)) {
      const shadow=new Simulator(state);
      const copy=shadow.store.state;
      const own=copy.players[1];
      const mew=own.active.getPokemonCard();
      assert.equal(mew?.name,'Mewtwo & Mew-GX');
      firstCandidatePower={
        turn:24,sourceSeat:0,candidateSeat:1,
        candidateActive:mew.fullName,
        blocked:powerCheck(shadow.store,copy,own,mew)
      };
    }
    const ordinary=old.value.call(this,state);
    if(selected || state.turn!==23 || state.activePlayer!==0 ||
        state.phase!==GamePhase.PLAYER_TURN ||
        state.prompts.some(prompt=>prompt.result===undefined) ||
        !(ordinary instanceof PlayCardAction))return ordinary;
    const source=state.players[0];
    if(source.id!==this.client?.id) return ordinary;
    const proposedCard=source.hand.cards[ordinary.handIndex];
    if(proposedCard?.name!=='Float Stone' ||
        source.active.getPokemonCard()?.name!=='Mega Absol ex')return ordinary;
    const targetIndex=source.bench.findIndex(slot=>
      slot.getPokemonCard()?.name==='Garbodor' && slot.tools.length===0);
    if(targetIndex<0) return ordinary;
    const candidate=state.players[1];
    if(candidate.active.getPokemonCard()?.name!=='Mewtwo & Mew-GX')return ordinary;
    opportunities++;
    if(skipChange)return ordinary;
    const target={
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:targetIndex
    };
    selected={
      globalTurn:state.turn,
      sourceId:source.id,
      card:proposedCard.fullName,
      rootOriginalActionType:ordinary.constructor.name,
      sourceActive:source.active.getPokemonCard()?.fullName??null,
      candidateActive:candidate.active.getPokemonCard()?.fullName??null,
      sourceBenchGarbodorIndex:targetIndex,
      GarbodorHadToolBefore:false,
      originalActionOwnHandIndex:ordinary.handIndex,
      choice:'reallocate one existing own-hand Float Stone to Benched Garbodor',
      informationBoundary:'acting owner hand, public source board and public opposing Active only',
      paperStrengthUnverified:true
    };
    return new PlayCardAction(source.id,ordinary.handIndex,target);
  };
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...old,value:changed});
  try {
    const result=execute();
    return {result,selected,opportunities,firstCandidatePower};
  } finally {
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',old);
  }
}

/** @returns {object} */
function run() {
  const {planAichi}=require('../evaluation/aichi-pilot.cjs');
  const {pairedCandidateSlots}=
    require('./new-moon-lockbreak-source-diagnostic.cjs');
  const {runArm}=require('./new-moon-second-start-paired.cjs');
  const source=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  }).opponents.find(opponent=>opponent.rank===11);
  assert.equal(source?.status,'ready');
  assert.equal(source.cards.length,60);
  const candidate=pairedCandidateSlots().lockbreak;
  assert.equal(candidate.length,60);
  const seed=1111464409;
  const args=[candidate,source.cards,1,seed,350,true,true,false,false];
  const unchanged=withGarbodorFloatStoneTarget(()=>runArm(...args),{skipChange:true});
  const control=runArm(...args);
  const alt=withGarbodorFloatStoneTarget(()=>runArm(...args));
  assert.deepEqual(unchanged.result.rootActionLedger,control.rootActionLedger,
    'Read-only cloned power check must not change unchanged-source decisions');
  assert.equal(unchanged.firstCandidatePower?.blocked,false,
    'Untooled source Garbodor should leave Perfection unblocked');
  assert.equal(control.firstTurnSlot,0);
  assert.equal(alt.result.firstTurnSlot,0);
  assert.equal(control.verifiedByDrawLog,true);
  assert.equal(alt.result.verifiedByDrawLog,true);
  assert.equal(alt.opportunities,1,
    'Authentic source turn23 must expose one original Float Stone choice');
  const shift=alt.selected;
  assert.ok(shift && shift.globalTurn===23);
  const atControl=control.rootActionLedger.find(row=>
    row.turnBefore===23 && row.playerSlot===0 &&
    row.action==='PlayCardAction' && row.card==='Float Stone');
  const atAlt=alt.result.rootActionLedger.find(row=>
    row.turnBefore===23 && row.playerSlot===0 &&
    row.action==='PlayCardAction' && row.card==='Float Stone');
  assert.equal(atControl?.actionOrdinal,217);
  assert.equal(atAlt?.actionOrdinal,217,
    'The same source action ordinal should carry the alternative Tool target');
  const prior=game=>game.rootActionLedger
    .filter(row=>row.actionOrdinal<217)
    .map(row=>({
      ordinal:row.actionOrdinal,turn:row.turnBefore,
      action:row.action,card:row.card??null,ability:row.ability??null,
      selection:row.attackChoice??null
    }));
  assert.deepEqual(prior(alt.result),prior(control),
    'Before source Float Stone target choice, root action identities must match');
  const boardBeforePass=game=>game.decisionTrace.find(row=>
    row.turnBefore===23 && row.playerSlot===0 &&
    row.action==='PassTurnAction')?.publicBoardBeforePass?.[0]??null;
  const originalBoard=boardBeforePass(control);
  const alteredBoard=boardBeforePass(alt.result);
  const afterGarbodor=alteredBoard?.bench?.find(slot=>slot.name==='Garbodor');
  const beforeGarbodor=originalBoard?.bench?.find(slot=>slot.name==='Garbodor');
  assert.ok(beforeGarbodor && beforeGarbodor.toolCards.length===0);
  assert.ok(afterGarbodor?.toolCards.includes('Float Stone'),
    'The real alternative action must attach the Tool to Garbodor');
  const candidateAfter=alt.result.copycatTurnStartEvidence.find(row=>
    row.turn>=24 && row.candidateSeat===1);
  assert.ok(candidateAfter,'Need a genuine candidate decision after opponent Tool change');
  assert.equal(alt.firstCandidatePower?.blocked,true,
    'The real equipped Garbodor must suppress candidate active ability');

  return {
    schema:'rank11-source-retrospective-floatstone-garbodor-counterfactual-v1',
    sourceRank:11,candidatePhysicalSeat:1,seed,
    sourceWasRetrospectivelySelected:true,
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceSource60:'results/aichi-2026/full-decklists.json rank 11',
    frozenCandidate:'New Moon Lockbreaker English mechanics proxy 60',
    controlDeckHashes:control.deckHashes,
    alternateDeckHashes:alt.result.deckHashes,
    controlFirstTurnSlot:control.firstTurnSlot,
    alternateFirstTurnSlot:alt.result.firstTurnSlot,
    actionOrdinal:atControl.actionOrdinal,
    alternateTarget:shift,preTargetRootActionsIdentical:true,
    baselinePowerObserverRootParityVerified:true,
    originalCandidateTurn24AbilityCheck:unchanged.firstCandidatePower,
    alternateCandidateTurn24AbilityCheck:alt.firstCandidatePower,
    sourceGarbodorToolsAtOriginalPass:beforeGarbodor.toolCards,
    sourceGarbodorToolsAtAlternatePass:afterGarbodor.toolCards,
    sourceActiveAtOriginalPass:originalBoard.active,
    sourceActiveAtAlternatePass:alteredBoard.active,
    candidateFirstFollowingTurn:{
      turn:candidateAfter.turn,
      sourceGarbotoxinExpectedFromPrintedTool:candidateAfter.board[0].bench.some(
        slot=>slot.name==='Garbodor' && slot.toolCards.length>0),
      candidateActive:candidateAfter.board[1].active?.name??null,
      sourceGarbodor:candidateAfter.board[0].bench
        .find(slot=>slot.name==='Garbodor')??null
    },
    control:{
      actions:control.actions,turns:control.turns,finished:control.finished,
      winner:control.winner,prizes:control.prizesRemaining,
      PerfectionDeclarations:control.abilityTrace.filter(row=>
        row.seat===1&&row.name==='Perfection').length
    },
    alternate:{
      actions:alt.result.actions,turns:alt.result.turns,
      finished:alt.result.finished,
      winner:alt.result.winner,prizes:alt.result.prizesRemaining,
      PerfectionDeclarations:alt.result.abilityTrace.filter(row=>
        row.seat===1&&row.name==='Perfection').length
    },
    qualifiedCompetitiveGames:0,
    caveat:'One retrospectively selected source game, one real owner-public-information Tool target swap. Historical opponent policy and paper fidelity still unqualified; any outcome change is diagnostic only.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={withGarbodorFloatStoneTarget,run};
