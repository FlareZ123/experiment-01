'use strict';

const path=require('node:path');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {sourceGame}=require('./rank2-gh-root-score-probe.cjs');
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(OUTPUT,name));

/** @param {unknown} selection */
function renderSelection(selection) {
  if(Array.isArray(selection))
    return selection.map(card=>card?.fullName??card);
  if(selection && typeof selection==='object')
    return selection.fullName??selection.constructor?.name??'object';
  return selection??null;
}

/**
 * Read existing evaluator prompt returns on the actual turn-five source root.
 * @template T
 * @param {()=>T} play
 * @param {number} [targetOrdinal]
 */
function observeGhHypotheticalPrompts(play,targetOrdinal=59){
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {SimpleTactic}=engine('simple-bot/simple-tactics/simple-tactics');
  const bot=SimpleTacticsAi.prototype,tactic=SimpleTactic.prototype;
  const oldDecode=bot.decodeNextAction;
  const oldEvaluate=tactic.evaluateAction;
  const oldResolve=tactic.resolvePrompt;
  let ordinal=0,focus=false,candidate=null;
  const prompts=[],evaluations=[];
  try{
    bot.decodeNextAction=function(state){
      const prior=focus;
      focus=++ordinal===targetOrdinal&&state.turn===5&&state.activePlayer===1;
      try{return oldDecode.call(this,state);}
      finally{focus=prior;}
    };
    tactic.evaluateAction=function(state,id,action,passScore){
      const prior=candidate;
      const current=state.players[state.activePlayer].hand.cards[action.handIndex];
      candidate=focus&&this.constructor.name==='PlaySupporterTactic'?
        current?.fullName??null:null;
      try{
        const score=oldEvaluate.call(this,state,id,action,passScore);
        if(candidate)evaluations.push({candidate,score:score??null});
        return score;
      }finally{candidate=prior;}
    };
