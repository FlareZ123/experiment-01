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
    tactic.resolvePrompt=function(state,player,prompt){
      const result=oldResolve.call(this,state,player,prompt);
      if(focus && candidate==='Guzma & Hala CEC'){
        prompts.push({
          promptType:prompt.constructor.name,
          message:prompt.message,
          selection:renderSelection(result?.result),
          promptMinimum:prompt.options?.min??null,
          promptMaximum:prompt.options?.max??null
        });
      }
      return result;
    };
    return {result:play(),prompts,evaluations,botCalls:ordinal};
  }finally{
    tactic.resolvePrompt=oldResolve;
    tactic.evaluateAction=oldEvaluate;
    bot.decodeNextAction=oldDecode;
  }
}

/** Compare both genuine source GH hypothetical prompt paths. */
function runGhHypotheticalComparison(){
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
  const byRank=new Map(field.decks.map(d=>[d.rank,d]));
  const [one,two]=[byRank.get(1),byRank.get(2)];
  if(!one?.playableUnderEngine||!two?.playableUnderEngine)
    throw new Error('Rank 1 and rank 2 source 60s required');
  const play=mode=>sourceGame(mode,one.cardIds,two.cardIds);
  const arms=[false,true].map(mode=>{
    const baseline=play(mode);
    const observed=observeGhHypotheticalPrompts(()=>play(mode));
    const game=observed.result;
    const sourceFork=g=>g.decisionTrace.find(e=>
      e.actionOrdinal===68&&e.turnBefore===5&&e.playerSlot===1)?.card??null;
    return {
      mode1:mode,sourceHashes:game.deckHashes,
      firstTurnSlot:game.firstTurnSlot,
      selectedBaseline:sourceFork(baseline),
      selectedObserved:sourceFork(game),
      passiveTraceParity:JSON.stringify(baseline.decisionTrace)===
        JSON.stringify(game.decisionTrace),
      hypotheticalSupporters:observed.evaluations,
      hypotheticalGhPrompts:observed.prompts,
      observedBotCalls:observed.botCalls
    };
  });
  return {
    study:'source-rank2 hypothetical GH prompt and discard evaluation',
    seed:20261023,rank2Seat:1,
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sameSourceHashes:JSON.stringify(arms[0].sourceHashes)===
      JSON.stringify(arms[1].sourceHashes),
    sameFirstTurn:arms[0].firstTurnSlot===arms[1].firstTurnSlot,
    arms,
    caveat:'Observed hypothetical evaluator prompt responses, not played human choices or qualified game outcomes.'
  };
}
if(require.main===module)
  console.log(JSON.stringify(runGhHypotheticalComparison(),null,2));
module.exports={renderSelection,observeGhHypotheticalPrompts,
  runGhHypotheticalComparison};
