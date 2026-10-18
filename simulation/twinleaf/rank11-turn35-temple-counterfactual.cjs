'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots}=
  require('./new-moon-lockbreak-source-diagnostic.cjs');
const {runArm}=require('./new-moon-second-start-paired.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} relative @returns {object} */
const engine=relative=>require(path.join(OUTPUT,relative));
const SEED=1111464409;

/**
 * Play the actually held Temple of Sinnoh from source rank11's own hand
 * instead of its genuine turn35 Pass. This replaces an OWN Shopping Center.
 * Every earlier original source action is left untouched; no information
 * about the opponent's hand or hidden deck is used to select this action.
 * @template T
 * @param {()=>T} execute
 * @returns {{result:T,sourceChoice:object|null,changed:boolean}}
 */
function withTempleOnOriginalPass(execute) {
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {PassTurnAction}=engine('game/store/actions/game-actions');
  const {GamePhase}=engine('game/store/state/state');
  const {StateUtils}=engine('game/store/state-utils');
  const original=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof original?.value,'function');
  let sourceChoice=null;
  let changed=false;
  const redirected=function(state) {
    const ordinary=original.value.call(this,state);
    if(sourceChoice||state.turn!==35||state.activePlayer!==0||
       state.phase!==GamePhase.PLAYER_TURN||
       state.prompts.some(prompt=>prompt.result===undefined)||
       !(ordinary instanceof PassTurnAction))return ordinary;
    const source=state.players[0];
    if(source.id!==this.client?.id)return ordinary;
    const index=source.hand.cards.findIndex(card=>
      card.fullName==='Temple of Sinnoh ASR');
    const stadium=StateUtils.getStadiumCard(state);
    sourceChoice={
      originalAction:ordinary.constructor.name,
      originalTurn:state.turn,
      ownerHand:source.hand.cards.map(card=>card.fullName),
      handTempleIndex:index,
      originalStadium:stadium?.fullName??null,
      stadiumOwner:source.stadium.cards.length>0?'rank11': 'other',
      previousStadiumPlayedTurn:source.stadiumPlayedTurn,
      stadiumHandLocked:source.cannotPlayStadiumCards,
      sourceActive:source.active.getPokemonCard()?.fullName??null,
      opposingActive:state.players[1].active.getPokemonCard()?.fullName??null,
      forcedCounterfactual:true
    };
    if(index<0||source.stadiumPlayedTurn>=state.turn||
       source.cannotPlayStadiumCards||
       stadium?.fullName==='Temple of Sinnoh ASR')return ordinary;
    changed=true;
    return new PlayCardAction(source.id,index,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
  };
  Object.defineProperty(SimpleTacticsAi.prototype,
    'decodeNextAction',{...original,value:redirected});
  try {
    return {result:execute(),sourceChoice,changed};
  } finally {
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',original);
  }
}

/** @returns {object} */
function run() {
  const rank11=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  }).opponents.find(entry=>entry.rank===11);
  assert.equal(rank11?.status,'ready');
  assert.equal(rank11.cards.length,60);
  const candidate=pairedCandidateSlots().lockbreak;
  assert.equal(candidate.length,60);
  const args=[candidate,rank11.cards,1,SEED,350,true,true,false,false];
  const original=runArm(...args);
  const contrast=withTempleOnOriginalPass(()=>runArm(...args));
  const alternate=contrast.result;
  assert.equal(original.firstTurnSlot,0);
  assert.equal(alternate.firstTurnSlot,0);
  assert.equal(original.verifiedByDrawLog,true);
  assert.equal(alternate.verifiedByDrawLog,true);
  assert.deepEqual(alternate.deckHashes,original.deckHashes);
  const pass=original.rootActionLedger.find(row=>
    row.turnBefore===35&&row.playerSlot===0&&
    row.action==='PassTurnAction');
  assert.equal(pass?.actionOrdinal,267);
  const previous=game=>game.rootActionLedger.filter(row=>
    row.actionOrdinal<267).map(row=>({
      ordinal:row.actionOrdinal,
      turn:row.turnBefore,
      seat:row.playerSlot,
      action:row.action,
      card:row.card??null,
      ability:row.ability??null
    }));
  assert.deepEqual(previous(alternate),previous(original),
    'Authentic source roots must match prior to one changed action');
  assert.ok(contrast.sourceChoice?.ownerHand.includes('Temple of Sinnoh ASR'));
  assert.equal(contrast.sourceChoice.originalAction,'PassTurnAction');
  const replacement=alternate.rootActionLedger.find(row=>
    row.actionOrdinal===267);
  if(contrast.changed){
    assert.equal(replacement?.action,'PlayCardAction');
    assert.equal(replacement.card,'Temple of Sinnoh',
      'Alternative must actually dispatch source-held Temple');
  } else {
    assert.equal(replacement?.action,'PassTurnAction');
  }
  const summary=game=>({
    actions:game.actions,turns:game.turns,finished:game.finished,
    engineWinner:game.winner,prizes:game.prizesRemaining,
    sourceTurn35:game.decisionTrace.filter(row=>
      row.turnBefore===35&&row.playerSlot===0).map(row=>({
        ordinal:row.actionOrdinal,action:row.action,
        card:row.card??null,
        ownHandBefore:row.decisionHandBefore?.ownHandPrintings??null
      })),
    copiedAttacksAfter:game.attackDeclarationTrace.filter(row=>
      row.playerSlot===1 && row.turnBefore>=36).slice(0,8).map(row=>({
        turn:row.turnBefore,ordinal:row.actionOrdinal,
        attack:row.attackName,trigger:row.triggerAction
      })),
    nextCandidateTurn:game.copycatTurnStartEvidence.find(row=>
      row.turn>=36 && row.candidateSeat===1)?.board?.[0]??null
  });
  return {
    schema:'rank11-terminal-own-stadium-temple-counterfactual-v1',
    seed:SEED,seedRetrospectivePositiveControl:true,
    sourceRank:11,sourceActualFirstSeat:0,candidateSeat:1,
    originalDeckHashes:original.deckHashes,
    alternateDeckHashes:alternate.deckHashes,
    engine:original.engine,
    originalPassOrdinal:267,sourceChoice:contrast.sourceChoice,
    appliedRealSourceCard:contrast.changed,
    originalPrefixIdentical:true,
    original:summary(original),alternate:summary(alternate),
    opponentPolicyQualified:false,paperEffectQualified:false,
    competitiveQualifiedGames:0,
    caveat:'One original-source owner-hand Temple swap for own Shopping Center instead of a bot Pass; original seed selected after success and intervention is forced, so not a win-rate sample'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={withTempleOnOriginalPass,run};
