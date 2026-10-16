'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} moduleName */
const load=moduleName=>require(path.join(root,moduleName));

/**
 * Observe computations already performed by AttackTactic. No extra simulated
 * actions, prompt resolutions, score evaluations, or RNG calls are made.
 * @param {()=>object} play Deterministic headless experiment.
 * @returns {{game:object,passes:object[]}}
 */
function observeAttackScores(play) {
  const {SimpleTactic}=load('simple-bot/simple-tactics/simple-tactics');
  const {AttackTactic}=load('simple-bot/simple-tactics/attack-tactic');
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const oldEval=SimpleTactic.prototype.evaluateAction;
  const oldGet=SimpleTactic.prototype.getStateScore;
  const oldAttack=AttackTactic.prototype.useTactic;
  const oldDecode=SimpleTacticsAi.prototype.decodeNextAction;
  const last=new Map(),passes=[];
  let active=null;
  try {
    SimpleTactic.prototype.getStateScore=function(state,id) {
      const score=oldGet.call(this,state,id);
      if(active&&this instanceof AttackTactic&&active.base===null)active.base=score;
      return score;
    };
    SimpleTactic.prototype.evaluateAction=function(state,id,action,passScore) {
      const score=oldEval.call(this,state,id,action,passScore);
      if(active&&this instanceof AttackTactic&&action?.constructor.name==='AttackAction')
        active.evaluations.push({attack:action.name,score:score??null});
      return score;
    };
    AttackTactic.prototype.useTactic=function(state,player) {
      const probe={turn:state.turn,playerId:player.id,base:null,
        bonus:this.options.scores.tactics.attackBonus,evaluations:[]};
      const previous=active;
      active=probe;
      try{return oldAttack.call(this,state,player);}
      finally{last.set(player.id,probe);active=previous;}
    };
    SimpleTacticsAi.prototype.decodeNextAction=function(state) {
      const player=state.players.find(p=>p.id===this.client.id);
      const action=oldDecode.call(this,state);
      if(action?.constructor.name==='PassTurnAction'&&
          player?.active.getPokemonCard()?.name==='Koraidon ex') {
        const probe=last.get(player.id);
        const current=probe?.turn===state.turn?probe:null;
        const threshold=current?.base===null?null:current.base-current.bonus;
        passes.push({turn:state.turn,id:player.id,
          energy:player.active.energies.cards.map(c=>c.fullName),
          threshold,evaluations:current?.evaluations||[],
          classification:!current?'tactic-not-reached':
            current.evaluations.some(e=>e.score!==null&&e.score>threshold)
              ?'post-tactic-veto-or-other':'score-rejected-or-no-resolved-score'});
      }
      return action;
    };
    return {game:play(),passes};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction=oldDecode;
    AttackTactic.prototype.useTactic=oldAttack;
    SimpleTactic.prototype.evaluateAction=oldEval;
    SimpleTactic.prototype.getStateScore=oldGet;
  }
}
/** @param {object} game */
function gameSummary(game) {
  return ['winner','finished','actions','turns','attackTrace','prizesRemaining',
    'cardsPlayedBySeat','abilityTrace','actionCounts'].map(key=>game[key]);
}
function audit() {
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const d=new Map(field.decks.map(x=>[x.rank,x]));
  assert.ok(d.get(1).playableUnderEngine&&d.get(10).playableUnderEngine);
  const trials=[];
  for(const seat of [0,1]) {
    for(const seed of [20261016,20261049]) {
      const request={deckA:d.get(seat===0?10:1).cardIds,
        deckB:d.get(seat===0?1:10).cardIds,seed,maxActions:300,
        isolatePolicyRandomness:true,doubleDragonRecovery:true};
      const baseline=runMatch(request);
      const observed=observeAttackScores(()=>runMatch(request));
      assert.deepEqual(gameSummary(observed.game),gameSummary(baseline),
        'Passive observer changed the source-game trace');
      trials.push({seat,seed,finished:baseline.finished,
        passes:observed.passes});
    }
  }
  return {study:'Koraidon printed attack: score versus pass',
    twinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    qualifiedCompetitiveGames:0,trials};
}
if(require.main===module)console.log(JSON.stringify(audit(),null,2));
module.exports={observeAttackScores,gameSummary,audit};
