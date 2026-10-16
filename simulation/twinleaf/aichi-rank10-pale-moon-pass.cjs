'use strict';
const {runRank10}=require('./aichi-rank10-koraidon-score.cjs');
const {observeAttackScores}=require('./attack-pass-score-diagnostic.cjs');

/** Compare a scored attack's terminal transition with the authentic source Pass. */
function audit() {
  const traces=[];
  const summary=runRank10(play=>{
    const result=observeAttackScores(play);
    const g=result.game;
    traces.push({
      attacksThroughTurn5:g.attackTrace.filter(a=>a.turn<=5)
        .map(a=>({seat:a.seat,turn:a.turn,name:a.attack})),
      turn5OpponentPass:(g.decisionTrace||[])
        .filter(a=>a.action==='PassTurnAction'&&a.turnBefore===5&&a.playerSlot===1)
        .map(a=>({turnBefore:a.turnBefore,turnAfter:a.turnAfter,
          prizesAfter:a.prizesAfter,actionOrdinal:a.actionOrdinal}))
    });
    return result;
  });
  return {study:'Rank10 Pale Moon delayed knockout versus Koraidon pass',
    sourceSeed:3162592764,qualifiedCompetitiveGames:0,
    cases:summary.output.map((trial,i)=>({
      candidate:trial.candidate,sourceFirstTurnSlot:trial.firstTurnSlot,
      koraidonTurn5:trial.allKoraidonPasses.find(p=>p.turn===5)||null,
      ...traces[i]
    }))};
}
if(require.main===module)console.log(JSON.stringify(audit(),null,2));
module.exports={audit};
