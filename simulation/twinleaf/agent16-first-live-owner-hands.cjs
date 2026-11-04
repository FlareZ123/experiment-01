'use strict';

const {decisionHandEvidence}=require('./decision-hand-evidence.cjs');
function createFirstLiveOwnerHandsObserver({playerTurnPhase}){
  const first=[null,null];
  return {
    observe(state,actionOrdinal,pendingPrompt){
      if(pendingPrompt||state.phase!==playerTurnPhase||(state.turn!==1&&state.turn!==2))return;
      const seat=state.activePlayer;
      if((seat!==0&&seat!==1)||first[seat])return;
      const hand=decisionHandEvidence(state,seat);
      first[seat]={seat,turn:state.turn,actionOrdinal,ownHandPrintings:hand.ownHandPrintings.slice(),opponentHandSize:hand.opponentHandSize};
    },
    result(){return {schema:'first-live-owner-hand-prebot-v1',bySeat:first.map(row=>row?{...row,ownHandPrintings:row.ownHandPrintings.slice()}:null)};}
  };
}
module.exports={createFirstLiveOwnerHandsObserver};
