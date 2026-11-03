'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {compressorOpportunity,withCompressorOpportunityCensus}=
 require('../simulation/twinleaf/agent1-rank17-compressor-opportunity-census.cjs');
const GamePhase={PLAYER_TURN:'PLAYER_TURN'};
function state({turn=2,held=true,predecessor='Pikachu XY',
 locked=false,deckEmpty=false,prompt=false}={}){
 const own={id:20,active:{getPokemonCard:()=>({fullName:predecessor})},
  bench:[],hand:{cards:held?[{name:'Battle Compressor'}]:[]},
  deck:{cards:deckEmpty?[]:[{}]},cannotPlayItemCards:locked};
 const enemy={id:10,get hand(){throw Error('opponent private hand read');},
  get deck(){throw Error('opponent private deck read');}};
 return {turn,activePlayer:1,phase:GamePhase.PLAYER_TURN,
  prompts:prompt?[{result:undefined}]:[],players:[enemy,own]};
}
test('original Pikachu XY enables the held early Item tactic',()=>{
 const v=compressorOpportunity(state(),1,GamePhase);
 assert.equal(v.tacticPrerequisitesSatisfied,true);
 assert.equal(v.ownedHandCompressorCount,1);
 assert.deepEqual(v.visiblePredecessors,['Pikachu XY']);
});
test('tactic requires physically held card and usable public board',()=>{
 assert.equal(compressorOpportunity(state({held:false}),1,GamePhase)
  .tacticPrerequisitesSatisfied,false);
 assert.equal(compressorOpportunity(state({locked:true}),1,GamePhase)
  .tacticPrerequisitesSatisfied,false);
 assert.equal(compressorOpportunity(state({predecessor:'Unown AOR'}),1,GamePhase)
  .tacticPrerequisitesSatisfied,false);
 assert.equal(compressorOpportunity(state({deckEmpty:true}),1,GamePhase)
  .tacticPrerequisitesSatisfied,false);
 assert.equal(compressorOpportunity(state({prompt:true}),1,GamePhase)
  .tacticPrerequisitesSatisfied,false);
 assert.equal(compressorOpportunity(state({turn:3}),1,GamePhase),null);
});
test('read-only native wrapper preserves exact selected action and restores prototype',()=>{
 class Bot{constructor(){this.client={id:20};}
  decodeNextAction(){return new PlayCardAction();}}
 class PlayCardAction{constructor(){this.handIndex=0;}}
 const prior=Bot.prototype.decodeNextAction;
 const stateBefore=state();
 const output=withCompressorOpportunityCensus(
  ()=>new Bot().decodeNextAction(stateBefore),1,{SimpleTacticsAi:Bot,GamePhase});
 assert.equal(output.result.constructor.name,'PlayCardAction');
 assert.equal(output.audit.eligibleDecisions,1);
 assert.equal(output.audit.eligibleCompressorSelected,1);
 assert.equal(output.audit.heldCompressorDecisions,1);
 assert.equal(output.audit.rootCensus[0].selectedCard,'Battle Compressor');
 assert.equal(Bot.prototype.decodeNextAction,prior);
 assert.equal(stateBefore.players[1].hand.cards[0].name,'Battle Compressor');
});
test('Pass is audited as an unselected legal opportunity',()=>{
 class Bot{constructor(){this.client={id:20};}
  decodeNextAction(){return {constructor:{name:'PassTurnAction'}};}}
 const o=withCompressorOpportunityCensus(
  ()=>new Bot().decodeNextAction(state()),1,{SimpleTacticsAi:Bot,GamePhase});
 assert.equal(o.audit.eligibleDecisions,1);
 assert.equal(o.audit.eligibleCompressorSelected,0);
 assert.equal(o.audit.rootCensus[0].selectedActionKind,'PassTurnAction');
});
test('observer always restores the selected policy on native failure',()=>{
 class Bot{decodeNextAction(){return null;}}
 const prior=Bot.prototype.decodeNextAction;
 assert.throws(()=>withCompressorOpportunityCensus(
  ()=>{throw Error('native aborted');},1,{SimpleTacticsAi:Bot,GamePhase}));
 assert.equal(Bot.prototype.decodeNextAction,prior);
});
