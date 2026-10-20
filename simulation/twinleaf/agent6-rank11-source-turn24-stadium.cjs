'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const STADIUM_PRINTINGS=Object.freeze([
  'Shopping Center EVS','Temple of Sinnoh ASR'
]);

/**
 * One narrowly selected physical source-owner Stadium action on the genuine
 * turn immediately before the second observed Poltergeist attack. No card
 * staging and no selection from concealed opponent information.
 *
 * @template T
 * @param {0|1} sourceSeat
 * @param {()=>T} execute
 * @param {{turn?:number,priority?:readonly string[]}} [options]
 * @returns {{result:T,policyAudit:object}}
 */
function withRank11SourceTurn24Stadium(sourceSeat,execute,
  {turn=24,priority=STADIUM_PRINTINGS}={}) {
  assert.ok(sourceSeat===0||sourceSeat===1);
  assert.equal(typeof execute,'function');
  assert.ok(Number.isSafeInteger(turn)&&turn>=1);
  const load=name=>require(path.join(OUTPUT,name));
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const {PlayCardAction}=load('game/store/actions/play-card-action');
  const {GamePhase}=load('game/store/state/state');
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const sourceId=sourceSeat===0?101:202;
  let attempted=false,ownerOpportunitySeen=false,selected=null;
  let firstHand=null,blockingReason=null;
  const optionsChecked=[];

  const sourceStadium=function sourceStadium(state) {
    const own=state.players.find(p=>p.id===this.client?.id);
    if(!own||own.id!==sourceId||attempted||
        state.turn!==turn||state.activePlayer!==sourceSeat||
        state.phase!==GamePhase.PLAYER_TURN||
        state.prompts.some(p=>p.result===undefined)) {
      return original.call(this,state);
    }
    ownerOpportunitySeen=true;
    if(!firstHand)firstHand=own.hand.cards.map(card=>card.fullName);
    for(const name of priority) {
      const index=own.hand.cards.findIndex(card=>card.fullName===name);
      if(index<0)continue;
      const action=new PlayCardAction(own.id,index);
      const legal=this.isValidAction(state,action);
      optionsChecked.push({printing:name,nativeLegality:legal});
      if(legal) {
        attempted=true;selected=name;
        return action;
      }
    }
    blockingReason='no-owner-held-native-legal-listed-Stadium';
    return original.call(this,state);
  };
  SimpleTacticsAi.prototype.decodeNextAction=sourceStadium;
  try {
    const result=execute();
    return {result,policyAudit:{
      schema:'rank11-source-native-owner-Stadium-turn-v1',
      sourceSeat,turn,priority,
      ownerOpportunitySeen,firstHand,optionsChecked,
      attempted,selected,blockingReason,
      qualification:'retrospective exact-source-owned Store action; no game win-rate inference'
    }};
  }finally{
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,sourceStadium);
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

module.exports={withRank11SourceTurn24Stadium,STADIUM_PRINTINGS};
