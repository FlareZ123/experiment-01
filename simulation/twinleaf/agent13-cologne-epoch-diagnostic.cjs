'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {runTwoCologneBoard}=
  require('./canceling-cologne-repeat-paper-gate.cjs');
const {installCancelingCologneOncePerTurnHook}=
  require('./canceling-cologne-once-per-turn-hook.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const pinned=name=>require(path.join(output,name));
const FIELD='__researchCancelingCologneLastPlayedTurn';

/**
 * Read-only native Store.log boundary probe. The existing Cologne paper
 * hook is installed without changing its implementation.
 * @returns {object} Exact marker epoch and native eligibility observations.
 */
function main(){
  const {Store}=pinned('game/store/store');
  const {GameLog}=pinned('game/game-message');
  const restore=installCancelingCologneOncePerTurnHook();
  const old=Store.prototype.log;
  const events=[];
  Store.prototype.log=function(state,message,...args){
    const players=state.players.map(p=>({
      id:p.id,lastTurn:p[FIELD]??null,
      playable:p.hand.cards.filter(card=>
        card.fullName==='Canceling Cologne ASR')
        .map(card=>card.canPlay(this,state,p))
    }));
    const result=old.call(this,state,message,...args);
    if(message===GameLog.LOG_PLAYER_PLAYS_SUPPORTER||
       message===GameLog.LOG_SUDDEN_DEATH){
      events.push({
        kind:message===GameLog.LOG_SUDDEN_DEATH?'sudden-death':'other-log',
        before:players,
        after:state.players.map(p=>({
          id:p.id,lastTurn:p[FIELD]??null,
          playable:p.hand.cards.filter(card=>
            card.fullName==='Canceling Cologne ASR')
            .map(card=>card.canPlay(this,state,p))
        }))
      });
    }
    return result;
  };
  let result;
  try {result=runTwoCologneBoard();}
  finally{
    Store.prototype.log=old;
    restore();
  }
  const diagnostic={
    schema:'agent13-native-cologne-epoch-readonly-diagnostic-v1',
    events,
    corrected:{secondEligible:result.secondEligible,
      nextTurnCanPlay:result.nextTurnCanPlay,
      canPlayAfterUnrelatedLog:result.canPlayAfterUnrelatedLog,
      canPlayAfterRestartLog:result.canPlayAfterRestartLog,
      realRollback:result.stateReplacedAfterFailure},
    competitiveGameQualified:false
  };
  process.stdout.write(JSON.stringify(diagnostic,null,2)+'\n');
  return diagnostic;
}
if(require.main===module)main();
module.exports={main};
