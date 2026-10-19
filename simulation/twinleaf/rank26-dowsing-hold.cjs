'use strict';
const path=require('node:path');
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * A deliberately narrow first-turn Dowsing Machine hold guard. The triggering
 * observable is a legal source Item proposal while Iono has been discarded.
 * This establishes a follow-on policy falsification, not a universal claim
 * about the strategic superiority of holding Dowsing Machine.
 *
 * @param {object} state Live state
 * @param {object} own Current source player
 * @param {0|1} seat Physical rank26 source seat
 * @param {object|undefined} proposed Bot's proposed tactic action
 * @param {number} playerTurn Native GamePhase.PLAYER_TURN
 * @returns {{card:string,reason:string}|null}
 */
function blockedDowsingProposal(state,own,seat,proposed,playerTurn){
  if(state.turn!==1||state.activePlayer!==seat||
    state.phase!==playerTurn||state.players[seat]!==own||
    state.prompts.some(p=>p.result===undefined)||
    proposed?.type!=='PLAY_CARD_ACTION')return null;
  const card=own.hand.cards[proposed.handIndex];
  if(card?.name!=='Dowsing Machine'||
    !own.discard.cards.some(c=>c.name==='Iono'))return null;
  return {card:card.fullName??card.name,
    reason:'Hold single ACE SPEC instead of immediately reclaiming firstturn-discarded Iono'};
}

/**
 * Replace only pinned PlayTrainerTactic for one synchronous experiment.
 * A rejected candidate yields to other tactics in the same pass, preserving
 * the original action ranking whenever no trigger exists.
 * @template T
 * @param {0|1} seat
 * @param {()=>T} execute
 */
function withRank26DowsingHold(seat,execute){
  if(![0,1].includes(seat)||typeof execute!=='function')
    throw new TypeError('Require rank26 source seat and synchronous experiment');
  const load=n=>require(path.join(OUTPUT,n));
  const definitions=load('simple-bot/simple-bot-definitions');
  const tactics=definitions.allSimpleTactics;
  const index=tactics.findIndex(T=>T.name==='PlayTrainerTactic');
  if(index<0)throw new Error('Pinned PlayTrainerTactic missing');
  const Original=tactics[index];
  const {GamePhase}=load('game/store/state/state');
  const id=seat===0?101:202;
  const blocked=[];
  class Rank26DowsingHold extends Original{
    /** @param {object} state @param {object} player */
    useTactic(state,player){
      const proposal=super.useTactic(state,player);
      if(player.id!==id)return proposal;
      const veto=blockedDowsingProposal(state,player,seat,proposal,
        GamePhase.PLAYER_TURN);
      if(!veto)return proposal;
      blocked.push({sourceSeat:seat,turn:state.turn,
        action:'suppress-PlayTrainerTactic',...veto});
      return;
    }
  }
  tactics.splice(index,1,Rank26DowsingHold);
  try{
    return {result:execute(),audit:{
      version:'rank26-firstturn-Iono-Dowsing-hold-v1',
      sourceSeat:seat,blocked,competitiveGameQualified:false
    }};
  }finally{
    const slot=tactics.indexOf(Rank26DowsingHold);
    if(slot<0)throw new Error('Rank26 Dowsing tactical hook unexpectedly missing');
    tactics.splice(slot,1,Original);
  }
}
module.exports={blockedDowsingProposal,withRank26DowsingHold};
