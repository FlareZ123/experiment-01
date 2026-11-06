'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {visibleHnsDiscardCount,DONOR_ORDER,DHELMISE}=
  require('./agent25-dhelmise-compressor-donors.cjs');

const VERSION='agent25-owner-quickball-three-donor-root-v4';
const QUICK_BALL=new Set(['Quick Ball SSH','Quick Ball FST']);
const donors=new Set(DONOR_ORDER);
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(output,name));

/**
 * Pure owner-information-only opportunity flag. This is a heuristic trigger,
 * not proof Item play is currently legal under every opponent lock.
 * @param {object} owner Pinned native owner player
 * @returns {boolean}
 */
function shouldTryThreeDonorQuickBall(owner){
  if(visibleHnsDiscardCount(owner)!==3)return false;
  if(!owner.hand.cards.some(card=>QUICK_BALL.has(card.fullName)))return false;
  if(!owner.hand.cards.some(card=>donors.has(card.fullName)))return false;
  if(!owner.deck.cards.length)return false;
  return [owner.active,...owner.bench].some(slot=>
    slot.getPokemonCard()?.fullName===DHELMISE)||
    owner.hand.cards.some(card=>card.fullName===DHELMISE);
}

/**
 * Insert an owner-seated real PlayCardAction as one proposed root choice.
 * Native SimpleTacticsAi.isValidAction enforces actual Store feasibility
 * before choosing it, so an active Item lock may veto this suggestion.
 * @param {object} options Native SimpleBot tactic constructor options
 * @returns {object} New options; original options unchanged
 */
function withThreeDonorQuickBallRoot(options){
  const {SimpleTactic}=native('simple-bot/simple-tactics/simple-tactics');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  class ThreeDonorQuickBallTactic extends SimpleTactic{
    useTactic(state,owner){
      if(state.prompts.some(prompt=>prompt.result===undefined)||
          !shouldTryThreeDonorQuickBall(owner))return;
      const handIndex=owner.hand.cards.findIndex(card=>
        QUICK_BALL.has(card.fullName));
      assert.ok(handIndex>=0);
      return new PlayCardAction(owner.id,handIndex,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      });
    }
  }
  const index=options.tactics.findIndex(tactic=>
    tactic.name==='DhelmiseCompressorTactic');
  const insertion=index>=0?index:options.tactics.findIndex(tactic=>
    tactic.name==='PlayTrainerTactic');
  assert.ok(insertion>=0);
  return {...options,tactics:[
    ...options.tactics.slice(0,insertion),
    ThreeDonorQuickBallTactic,
    ...options.tactics.slice(insertion)
  ]};
}
module.exports={VERSION,shouldTryThreeDonorQuickBall,
  withThreeDonorQuickBallRoot};
