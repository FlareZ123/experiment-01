'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots} =
  require('./new-moon-lockbreak-source-diagnostic.cjs');
const {runArm} = require('./new-moon-second-start-paired.cjs');

const ENGINE_ROOT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {object} */
const engine = name => require(path.join(ENGINE_ROOT, name));
const SOURCE_SEED = 1111464409;

/**
 * Intercept exactly one legitimate source opponent action choice, after the
 * historical bot has decided to Pass. Carmine is from its real own hand.
 * No deck order, hand, prize, printed card, or opponent policy is staged.
 * The changed policy is forced and not an autonomous quality result.
 *
 * @template T
 * @param {()=>T} execute
 * @returns {{result:T,opportunity:object|null,changed:boolean}}
 */
function withSourceCarmineAtTurn35(execute) {
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType} =
    engine('game/store/actions/play-card-action');
  const {PassTurnAction}=engine('game/store/actions/game-actions');
  const {GamePhase}=engine('game/store/state/state');
  const original = Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof original?.value,'function');
  let opportunity=null;
  let changed=false;
  const redirected = function(state) {
    const ordinary=original.value.call(this,state);
    if(opportunity || state.turn!==35 || state.activePlayer!==0 ||
       state.phase!==GamePhase.PLAYER_TURN ||
       state.prompts.some(prompt=>prompt.result===undefined) ||
       !(ordinary instanceof PassTurnAction))return ordinary;
    const source=state.players[0];
    if(source.id!==this.client?.id)return ordinary;
    const index=source.hand.cards.findIndex(card=>card.fullName==='Carmine TWM');
    const card=index>=0 ? source.hand.cards[index] : null;
    opportunity={
      originalAction:ordinary.constructor.name,
      sourceTurn:state.turn,
      sourceCard:card?.fullName??null,
      sourceOwnHand:source.hand.cards.map(entry=>entry.fullName),
      sourceDeckCards:source.deck.cards.length,
      supporterTurnMarker:source.supporterTurn,
      supporterHandLocked:source.cannotPlaySupporterCards,
      printedCanPlay:card ? card.canPlay(null,state,source) : false,
      originalActive:source.active.getPokemonCard()?.name??null,
      candidateActive:state.players[1].active.getPokemonCard()?.name??null,
      status:'observed before a single owner-hand action counterfactual'
    };
    if(!card||source.supporterTurn!==0||source.cannotPlaySupporterCards||
       source.deck.cards.length===0||!opportunity.printedCanPlay)return ordinary;
    changed=true;
    return new PlayCardAction(source.id,index,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
  };
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...original,value:redirected
  });
  try {
    return {result:execute(),opportunity,changed};
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
  const args=[candidate,rank11.cards,1,SOURCE_SEED,350,true,true,false,false];
  const control=runArm(...args);
  const contrast=withSourceCarmineAtTurn35(()=>runArm(...args));
  const alternate=contrast.result;
  assert.equal(control.verifiedByDrawLog,true);
  assert.equal(alternate.verifiedByDrawLog,true);
  assert.equal(control.firstTurnSlot,0);
  assert.equal(alternate.firstTurnSlot,0);
  assert.deepEqual(alternate.deckHashes,control.deckHashes);
  const pass=control.rootActionLedger.find(entry=>
    entry.turnBefore===35 && entry.playerSlot===0 &&
    entry.action==='PassTurnAction');
  assert.ok(pass && pass.actionOrdinal===267);
  const prefix=game=>game.rootActionLedger.filter(entry=>
    entry.actionOrdinal<pass.actionOrdinal).map(entry=>({
      ordinal:entry.actionOrdinal,
      turn:entry.turnBefore,
      player:entry.playerSlot,
      action:entry.action,
      card:entry.card??null,
      ability:entry.ability??null
    }));
  assert.deepEqual(prefix(alternate),prefix(control),
    'True source game must match through every root action before change');
  assert.ok(contrast.opportunity?.sourceOwnHand.includes('Carmine TWM'));
  assert.equal(contrast.opportunity.originalAction,'PassTurnAction');
  const replacement=alternate.rootActionLedger.find(entry=>
    entry.actionOrdinal===pass.actionOrdinal);
  if(contrast.changed) {
    assert.equal(replacement?.card,'Carmine',
      'Real replaced source action must dispatch an actual Carmine card');
    assert.equal(replacement.action,'PlayCardAction');
  } else {
    assert.equal(replacement?.action,'PassTurnAction');
  }
  const followingAttacks=game=>game.attackDeclarationTrace.filter(entry=>
    entry.turnBefore>=36 && entry.playerSlot===1).slice(0,8).map(entry=>({
      turn:entry.turnBefore,ordinal:entry.actionOrdinal,
      attack:entry.attackName,trigger:entry.triggerAction
    }));
  const sourceTurn35=game=>game.decisionTrace.filter(entry=>
    entry.turnBefore===35 && entry.playerSlot===0).map(entry=>({
      ordinal:entry.actionOrdinal,action:entry.action,
      card:entry.card??null,
      ownHandBefore:entry.decisionHandBefore?.ownHandPrintings??null
    }));
  return {
    schema:'rank11-terminal-carmine-single-source-action-counterfactual-v1',
    seed:SOURCE_SEED,seedRetrospectivelySelected:true,
    fixedSourceRank:11,candidateSeat:1,actualFirstSeat:0,
    deckHashes:control.deckHashes,engine:control.engine,
    originalPassOrdinal:pass.actionOrdinal,
    opportunity:contrast.opportunity,changed:contrast.changed,
    priorSourceActionsEqual:true,
    original:{
      actions:control.actions,turns:control.turns,
      finished:control.finished,engineWinner:control.winner,
      prizes:control.prizesRemaining,
      sourceTurn35:sourceTurn35(control),
      candidateAttacksAfter:followingAttacks(control)
    },
    alternate:{
      actions:alternate.actions,turns:alternate.turns,
      finished:alternate.finished,engineWinner:alternate.winner,
      prizes:alternate.prizesRemaining,
      sourceTurn35:sourceTurn35(alternate),
      candidateAttacksAfter:followingAttacks(alternate)
    },
    policyQualityValidated:false,paperEffectValidated:false,
    qualifiedCompetitiveGames:0,
    scope:'One read-only detection and one forced own-hand Carmine action in a previously favorable source deal; not prospective, autonomous or win-rate evidence'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={withSourceCarmineAtTurn35,run};
