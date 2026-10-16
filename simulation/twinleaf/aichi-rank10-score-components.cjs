'use strict';
const path=require('node:path');
const {runRank10}=require('./aichi-rank10-koraidon-score.cjs');
const {observeAttackScores}=require('./attack-pass-score-diagnostic.cjs');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load=name=>require(path.join(root,name));

/**
 * Record score components during the original Koraidon AttackTactic call.
 * @param {()=>object} play Existing observer-wrapped game.
 * @returns {{observed:object,scores:object[]}}
 */
function componentAudit(play) {
  const {StateScore}=load('simple-bot/state-score/state-score');
  const {SimpleTactic}=load('simple-bot/simple-tactics/simple-tactics');
  const {AttackTactic}=load('simple-bot/simple-tactics/attack-tactic');
  const keys=[
    ['hand','hand-score','HandScore'],
    ['opponent','opponent-score','OpponentScore'],
    ['player','player-score','PlayerScore'],
    ['conditions','special-conditions-score','SpecialConditionsScore'],
    ['active','active-score','ActiveScore'],
    ['bench','bench-score','BenchScore'],
    ['energy','energy-score','EnergyScore'],
    ['damage','damage-score','DamageScore'],
    ['tools','tools-score','ToolsScore']
  ];
  const oldScore=StateScore.prototype.getScore;
  const oldAttack=AttackTactic.prototype.useTactic;
  const oldEvaluate=SimpleTactic.prototype.evaluateAction;
  const restored=[];
  const scores=[];
  let attacking=null,selected=null,frame=null;
  try {
    for(const [key,moduleName,className] of keys) {
      const cls=load('simple-bot/state-score/'+moduleName)[className];
      const original=cls.prototype.getScore;
      cls.prototype.getScore=function(state,id) {
        const value=original.call(this,state,id);
        if(frame)frame.components[key]=value;
        return value;
      };
      restored.push(()=>{cls.prototype.getScore=original;});
    }
    StateScore.prototype.getScore=function(state,id) {
      if(!attacking||attacking.playerId!==id||attacking.turn!==5)
        return oldScore.call(this,state,id);
      const prior=frame;
      const entry={decisionTurn:attacking.turn,attack:selected,components:{}};
      frame=entry;
      try {
        const total=oldScore.call(this,state,id);
        const self=state.players.find(x=>x.id===id);
        const foe=state.players.find(x=>x.id!==id);
        entry.total=total;
        entry.stateTurn=state.turn;
        entry.prizes=[self,foe].map(x=>x.prizes.filter(z=>z.cards.length).length);
        entry.active=self.active.getPokemonCard()?.fullName||null;
        entry.activeDamage=self.active.damage;
        entry.opponentActive=foe.active.getPokemonCard()?.fullName||null;
        entry.opponentDamage=foe.active.damage;
        entry.winner=state.winner;
        scores.push(entry);
        return total;
      } finally {frame=prior;}
    };
    AttackTactic.prototype.useTactic=function(state,player) {
      const previous=attacking;
      attacking=player.active.getPokemonCard()?.name==='Koraidon ex'?
        {playerId:player.id,turn:state.turn}:null;
      try {return oldAttack.call(this,state,player);}
      finally {attacking=previous;}
    };
    SimpleTactic.prototype.evaluateAction=function(state,id,action,passScore) {
      const previous=selected;
      if(attacking&&this instanceof AttackTactic)selected=action.name;
      try {return oldEvaluate.call(this,state,id,action,passScore);}
      finally {selected=previous;}
    };
    const observed=play();
    return {observed,scores};
  } finally {
    SimpleTactic.prototype.evaluateAction=oldEvaluate;
    AttackTactic.prototype.useTactic=oldAttack;
    StateScore.prototype.getScore=oldScore;
    for(const restore of restored.reverse())restore();
  }
}
function audit() {
  const components=[];
  const summary=runRank10(play=>{
    const result=componentAudit(()=>observeAttackScores(play));
    components.push(result.scores);
    return result.observed;
  });
  return {study:'Exact rank10 Koraidon attack evaluation score components',
    qualifiedCompetitiveGames:0,
    perCandidate:summary.output.map((x,i)=>({
      candidate:x.candidate,
      koraidonTurn5Pass:x.allKoraidonPasses.find(pass=>pass.turn===5)||null,
      componentSnapshots:components[i]
    }))};
}
if(require.main===module)console.log(JSON.stringify(audit(),null,2));
module.exports={audit,componentAudit};
