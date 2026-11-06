'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent1-conservative-mimikyu-filch-public-owner-v1';
const THRESHOLD=24;

/** @param {string} modulePath @returns {object} */
const native=modulePath=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',modulePath));

/**
 * After the existing native policy *proposes* the printed Mimikyu Filch
 * AttackAction, replace it by a legal owner Pass if the actor's own deck
 * contains 24 or fewer cards. The prior threshold is independently fixed by
 * Agent 2's original-rank3 developmental comparison.
 *
 * This opt-in adapter never reads opposing concealed cards or the player's
 * own card identities. Install inside the live per-match native actor stack.
 *
 * @template T
 * @param {()=>T} execute Native match, called synchronously.
 * @param {{SimpleTacticsAi?:Function,PassTurnAction?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withConservativeOwnerFilch(execute,deps={}){
  assert.equal(typeof execute,'function');
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const PassTurnAction=deps.PassTurnAction??
    native('game/store/actions/game-actions').PassTurnAction;
  const previous=SimpleTacticsAi.prototype.decodeNextAction;
  assert.equal(typeof previous,'function');
  const audit={version:VERSION,threshold:THRESHOLD,
    proposedPrintedOwnerFilch:0,acceptedOriginalFilch:0,
    selectedOwnerPasses:0,
    replacementEvents:[],ownerOnly:true,
    nativePassSettlementIndependentlyAttested:false,
    competitiveGamesQualified:0};
  const guarded=function conservativeOwnerFilch(state,...args){
    const proposal=previous.call(this,state,...args);
    if(proposal?.constructor?.name!=='AttackAction'||
       proposal.name!=='Filch'||state.prompts.some(x=>x.result===undefined))
      return proposal;
    const seat=state.activePlayer;
    if(seat!==0&&seat!==1)return proposal;
    const owner=state.players[seat];
    if(owner.active.getPokemonCard()?.name!=='Mimikyu')return proposal;
    audit.proposedPrintedOwnerFilch++;
    const ownDeckRemaining=owner.deck.cards.length;
    if(ownDeckRemaining>THRESHOLD){
      audit.acceptedOriginalFilch++;
      return proposal;
    }
    audit.selectedOwnerPasses++;
    audit.replacementEvents.push({
      globalTurn:state.turn,ownerSeat:seat,
      ownDeckRemaining,originalAction:'AttackAction',
      originalAttack:'Filch',replacement:'PassTurnAction'
    });
    return new PassTurnAction(owner.id);
  };
  SimpleTacticsAi.prototype.decodeNextAction=guarded;
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,guarded);
    SimpleTacticsAi.prototype.decodeNextAction=previous;
  }
}
module.exports={VERSION,THRESHOLD,withConservativeOwnerFilch};
