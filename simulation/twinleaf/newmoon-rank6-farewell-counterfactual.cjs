'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {availableUnown}=require('./newmoon-rank6-pass-farewell-observer.cjs');
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * A narrowly-scoped owner-information policy choice used after the baseline
 * engine bot has already chosen Pass. It proposes the real Benched Unown
 * Farewell Letter action only when its owner, Bench and physical remaining
 * deck support it. A proposed action is never scored from hidden draw order.
 *
 * @param {object} state Source Store state
 * @param {object} own Candidate owner state
 * @param {number} turn Global turn to study
 * @param {number} seat Physical candidate seat
 * @returns {number} Eligible Bench index or -1
 */
function eligiblePassFarewell(state,own,turn,seat) {
  if(state.activePlayer!==seat || state.turn!==turn ||
     own.deck.cards.length===0 ||
     state.prompts.some(p=>p.result===undefined)) return -1;
  return availableUnown(own);
}

/**
 * Run an actual original-source game under a reversible single-root policy:
 * when the candidate generic bot first decides to pass on the requested
 * physical turn, use Unown Farewell once. All later actions fall through
 * to the pinned generic bot. The case-selected turn is not a general policy.
 *
 * @template T
 * @param {()=>T} execute Original rank6 source game
 * @param {{seat:0|1,turn:number}} options Candidate seat and exact turn
 * @returns {{result:T,policyAudit:object}}
 */
function withFarewellInsteadOfFirstPass(execute,{seat,turn}) {
  assert.equal(typeof execute,'function');
  assert.ok(seat===0||seat===1);
  assert.ok(Number.isSafeInteger(turn)&&turn>0);
  const load=name=>require(path.join(OUTPUT,name));
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const {GamePhase}=load('game/store/state/state');
  const {UseAbilityAction}=load('game/store/actions/game-actions');
  const {PlayerType,SlotType}=load('game/store/actions/play-card-action');
  const prior=SimpleTacticsAi.prototype.decodeNextAction;
  const clientId=seat===0?101:202;
  let submitted=0;
  const events=[];

  const handler=function farewellOnPass(state) {
    const action=prior.call(this,state);
    if(this.client?.id!==clientId ||
       state.phase!==GamePhase.PLAYER_TURN ||
       action?.constructor?.name!=='PassTurnAction' ||
       submitted>0) return action;
    const own=state.players[seat];
    const index=eligiblePassFarewell(state,own,turn,seat);
    if(index<0) return action;
    // Owner and public zones only, chosen after original Pass, and the
    // exact same printed Unown ability used in the source-dealt follow-up.
    const replacement=new UseAbilityAction(own.id,'Farewell Letter',{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index
    });
    submitted++;
    events.push({
      kind:'selected-live-owner-farewell-instead-of-pass',
      turn:state.turn,seat,benchIndex:index,
      originalAction:'PassTurnAction',
      ownerDeckCount:own.deck.cards.length,
      ownerHandPrintings:own.hand.cards.map(c=>c.fullName),
      publicOwnerBench:own.bench.map(s=>
        s.getPokemonCard()?.fullName??null),
      sourceActive:state.players[1-seat].active.getPokemonCard()?.fullName??null,
      opponentHandCount:state.players[1-seat].hand.cards.length
    });
    return replacement;
  };
  SimpleTacticsAi.prototype.decodeNextAction=handler;
  try {
    return {result:execute(),policyAudit:{
      schema:'agent25-retrospective-farewell-instead-of-pass-v1',
      requestedTurn:turn,candidateSeat:seat,submitted,
      events,competitivePolicyQualified:false
    }};
  } finally {
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,handler);
    SimpleTacticsAi.prototype.decodeNextAction=prior;
  }
}

module.exports={eligiblePassFarewell,withFarewellInsteadOfFirstPass};
