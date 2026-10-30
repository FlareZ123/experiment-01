'use strict';

const assert=require('node:assert/strict');

const VERSION='agent1-owner-visible-team-flare-grunt-denial-v1';
const TEAM_FLARE_GRUNT='Team Flare Grunt XY';

/**
 * Last-resort, owner-only printed Supporter energy-denial opportunity.
 * Read a detached public opponent Active, own hand and owner Supporter quota.
 * Actual legality, energy target, effect and opponent reply require the
 * genuine native Store; no concealed deck, Prize or opponent hand is read.
 *
 * Team Flare Grunt (XY 129) discards an Energy from the opponent's Active.
 * Do not confuse it with Plumeria's discard-two cost.
 *
 * @param {object} view Frozen detached actor-only owner observation.
 * @returns {{kind:'play-team-flare-grunt-denial',handIndex:number,
 *  printing:string,opponentActiveEnergyCount:number}|null}
 */
function chooseTeamFlareGruntDenial(view){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,r=view.ownTurnResources,
    opp=view.opponentPublic;
  if(view.globalTurn<=1||!own?.active||!opp?.active)return null;
  if(r?.supporterPlayedTurn!==0||
      r?.supporterPlayLocked===true||
      own.publicTurnRestrictions?.supporterPlayLocked===true||
      (own.resolvingSupporter?.length??0)>0)return null;
  if(!Array.isArray(opp.active.energies)||opp.active.energies.length===0)
    return null;
  const index=view.ownHand?.indexOf(TEAM_FLARE_GRUNT)??-1;
  if(index<0)return null;
  return {kind:'play-team-flare-grunt-denial',
    handIndex:index,printing:TEAM_FLARE_GRUNT,
    opponentActiveEnergyCount:opp.active.energies.length};
}

module.exports={VERSION,TEAM_FLARE_GRUNT,chooseTeamFlareGruntDenial};
