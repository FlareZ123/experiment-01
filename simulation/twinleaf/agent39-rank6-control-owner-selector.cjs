'use strict';
const assert=require('node:assert/strict');
const {unopposedDeckoutRace}=
  require('../../scripts/agent39-rank6-lusamine-handiwork-cycle.cjs');

const LUSAMINE='Lusamine CIN';
const HANDIWORK="Team Rocket's Handiwork FCO";

/**
 * Owner-visible rank6 late-control root opportunity. This is a paper
 * heuristic, not an installed bot or qualified observed decision.
 * Receives detached actorObservation; no rival hand/deck/Prize identities.
 * Own deck count is AFTER mandatory draw; the theoretical race begins
 * BEFORE that draw, so add one for the already-settled owner draw.
 * @param {object} view
 * @param {{minIllustrativeDepletion?:number}} [options]
 * @returns {{kind:string,handIndex:number,printing:string,projected:number,
 *   ownerDeckAtRoot:number,opponentDeckAtRoot:number}|null}
 */
function chooseRank6ControlRoot(view,options={}){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,opponent=view.opponentPublic;
  const r=view.ownTurnResources;
  if(view.globalTurn<=1||r?.supporterPlayedTurn!==0||
     r.supporterPlayLocked===true||
     own?.publicTurnRestrictions?.supporterPlayLocked===true||
     own?.resolvingSupporter?.length>0||
     own?.active?.name!=='Iron Thorns ex'||
     own?.bench?.some(Boolean)||
     !opponent?.active||opponent.active.energies?.length!==0||
     !Number.isSafeInteger(own.deckCount)||own.deckCount<0||
     !Number.isSafeInteger(opponent.deckCount)||opponent.deckCount<0)
    return null;
  const threshold=options.minIllustrativeDepletion??0.5;
  if(typeof threshold!=='number'||threshold<0||threshold>1)
    throw new RangeError('minIllustrativeDepletion must be in [0,1]');
  const race=unopposedDeckoutRace(own.deckCount+1,opponent.deckCount);
  if(race.probability<threshold)return null;
  const hand=view.ownHand??[];
  const discard=own.discard??[];
  let printing=null,kind=null;
  if(hand.includes(HANDIWORK)){
    printing=HANDIWORK;kind='handiwork-from-owner-hand';
  }else if(hand.includes(LUSAMINE)&&discard.includes(HANDIWORK)&&
      discard.includes(LUSAMINE)){
    printing=LUSAMINE;kind='lusamine-recover-distinct-loop-pair';
  }
  if(!printing)return null;
  return {kind,handIndex:hand.indexOf(printing),printing,
    projected:race.probability,ownerDeckAtRoot:own.deckCount,
    opponentDeckAtRoot:opponent.deckCount};
}

module.exports={LUSAMINE,HANDIWORK,chooseRank6ControlRoot};
