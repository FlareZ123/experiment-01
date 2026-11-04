'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {selectStoneRecipient,FSS}=
  require('./forest-stone-v-recipient-policy.cjs');

const FLOAT='Float Stone BKT';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {object} */
const engine=name=>require(path.join(OUTPUT,name));

/**
 * An explicitly developmental owner-hand-only counterfactual. It restores
 * one otherwise suppressed Float Stone proposal when the existing Stone
 * owner policy would hold, the actual Active is untooled, has printed
 * nonzero retreat, and there is a real Benched Pokémon available.
 *
 * The returned proposal is not automatically strategically superior. The
 * native Store must still validate and accept any real PlayCardAction.
 *
 * @param {object} player Exact own hand, own Active/Bench and own VSTAR marker.
 * @param {{toolType:number,vTags:readonly number[],selfType:number,
 *   cardPlayer:number,activeSlot:number}} enums Pinned runtime enums.
 * @returns {{kind:'delegate'|'propose',handIndex?:number,target?:object,
 *   reason?:string,activeName?:string}}
 */
function selectFloatStoneAfterFssHold(player,enums){
  const firstTool=player.hand.cards.find(c=>c.trainerType===enums.toolType);
  if(firstTool?.fullName!==FSS)return {kind:'delegate'};
  const hold=selectStoneRecipient(player,{
    toolType:enums.toolType,vTags:enums.vTags,
    ownerPlayerType:enums.selfType
  });
  if(hold.kind!=='hold')return {kind:'delegate'};
  const handIndex=player.hand.cards.findIndex(c=>
    c.trainerType===enums.toolType&&c.fullName===FLOAT);
  if(handIndex<0)return {kind:'delegate'};
  const active=player.active.getPokemonCard();
  if(!active||!Array.isArray(active.retreat)||active.retreat.length===0||
      player.active.tools.length!==0)return {kind:'delegate'};
  if(!player.bench.some(slot=>slot.getPokemonCard()))
    return {kind:'delegate'};
  return {kind:'propose',handIndex,
    target:{player:enums.cardPlayer,slot:enums.activeSlot,index:0},
    reason:hold.reason,activeName:active.fullName};
}

/**
 * Optional single-seat native decision adapter. Nest this INSIDE the
 * existing withStoneVRecipient hook so the Float proposal is considered
 * before its FSS-first HOLD result. Use the same adapter on both physical
 * seats before claiming symmetric candidate/opponent policy behavior.
 *
 * It does not inspect the opponent's concealed zones, rerank cards using
 * the native scorer, or replace the game engine's legality checks.
 *
 * @template T
 * @param {0|1} seat Actual physical owner seat.
 * @param {()=>T} execute Synchronous pinned native Store replay.
 * @returns {{result:T,audit:object}}
 */
function withFloatStoneAfterFssHold(seat,execute){
  assert.ok(seat===0||seat===1);
  assert.equal(typeof execute,'function');
  const {AttachToolTactic}=
    engine('simple-bot/simple-tactics/attach-tool-tactic');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {GamePhase}=engine('game/store/state/state');
  const {TrainerType,CardTag}=engine('game/store/card/card-types');
  const enums={toolType:TrainerType.TOOL,
    vTags:[CardTag.POKEMON_V,CardTag.POKEMON_VSTAR,
      CardTag.POKEMON_VMAX,CardTag.POKEMON_VUNION],
    selfType:PlayerType.BOTTOM_PLAYER,cardPlayer:PlayerType.BOTTOM_PLAYER,
    activeSlot:SlotType.ACTIVE};
  const original=AttachToolTactic.prototype.useTactic;
  const expectedId=seat===0?101:202;
  const events=[];
  const adapted=function sourceIndependentOwnerFloatStone(state,player){
    if(player.id!==expectedId||state.activePlayer!==seat||
      state.phase!==GamePhase.PLAYER_TURN||
      state.prompts.some(p=>p.result===undefined))
      return original.call(this,state,player);
    const choice=selectFloatStoneAfterFssHold(player,enums);
    if(choice.kind!=='propose')return original.call(this,state,player);
    const proposed=new PlayCardAction(player.id,choice.handIndex,choice.target);
    events.push({turn:state.turn,seat,kind:'owner-fss-hold-float-proposal',
      activeName:choice.activeName,reason:choice.reason,
      chosenPrinting:FLOAT,handIndex:choice.handIndex,
      actualNativeStoreAcceptance:null});
    return proposed;
  };
  AttachToolTactic.prototype.useTactic=adapted;
  try{
    return {result:execute(),audit:{
      version:'agent2-fss-held-try-float-owner-v1',seat,events,
      scope:'owner held Tool printings and publicly visible own board only',
      proofOfStoreAcceptance:false,competitivelyQualifiedGames:0
    }};
  }finally{
    assert.equal(AttachToolTactic.prototype.useTactic,adapted);
    AttachToolTactic.prototype.useTactic=original;
  }
}
module.exports={FLOAT,selectFloatStoneAfterFssHold,
  withFloatStoneAfterFssHold};