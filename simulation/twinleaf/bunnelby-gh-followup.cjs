'use strict';
const path=require('node:path');
const {stageGuzmaHand}=require('./bunnelby-gh-discard-policy-probe.cjs');
const {withBunnelbyEvolutionLine}=require('./bunnelby-evolution-policy.cjs');
const {withToolAttackAwareness}=require('./tool-attack-policy.cjs');
const {withMandatoryOptionFallback}=require('./mandatory-option-policy.cjs');
const {withBunnelbyGuzmaHalaMode1}=require('./bunnelby-guzma-hala-policy.cjs');
const {withGhBunnelbyResourceSelection}=require('./bunnelby-gh-search-policy.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(output,name));
/** Conditioned source-full board: GH and two-card discard are available. */
function followup(prizeGloom=false,maxActions=50){
 const f=stageGuzmaHand(prizeGloom),defs=load('simple-bot/simple-bot-definitions');
 const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
 const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
 const {ShuffleDeckPrompt}=load('game/store/prompts/shuffle-deck-prompt');
 const {PlayCardAction,PlayerType,SlotType}=load('game/store/actions/play-card-action');
 let o={tactics:defs.allSimpleTactics,promptResolvers:defs.allPromptResolvers,
   scores:defs.defaultStateScores,arbiter:defs.defaultArbiterOptions};
 o=withToolAttackAwareness(o);
 o=withBunnelbyEvolutionLine(o,{sourceCards:f.sourceCards,targetAwareEvolution:true});
 o=withMandatoryOptionFallback(o);
 o=withBunnelbyGuzmaHalaMode1(o,f.sourceCards);
 o=withGhBunnelbyResourceSelection(o,(state,player,prompt)=>
   state===f.store.state&&state.players.includes(player)&&
   state.prompts.includes(prompt)&&prompt.result===undefined);
 const bot=new SimpleTacticsAi({id:f.player.id},o,null);
 const ghIndex=f.player.hand.cards.findIndex(c=>c.fullName==='Guzma & Hala CEC');
 f.store.dispatch(new PlayCardAction(f.player.id,ghIndex,
   {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
 const trace=[];let reason='action-cap';
 for(let i=0;i<maxActions;i++){
   const pending=f.store.state.prompts.find(x=>x.result===undefined);
   let action;
   if(pending instanceof ShuffleDeckPrompt){
     action=new ResolvePromptAction(pending.id,
       f.player.deck.cards.map((_,index)=>index));
   }else{
     action=bot.decodeNextAction(f.store.state);
   }
   if(!action){reason='no-bot-action';break;}
   const kind=action.constructor.name;
   const played=kind==='PlayCardAction' ?
     f.player.hand.cards[action.handIndex]?.fullName:null;
   const selected=Array.isArray(action.result) ?
     action.result.map(x=>x?.fullName??x?.name??null):null;
   trace.push({step:i,kind,pending:pending?.constructor.name||null,
     played,attack:kind==='AttackAction'?action.name:null,
     option:pending?.constructor.name==='SelectOptionPrompt'?action.result:null,
     selected:pending?.constructor.name==='ChooseCardsPrompt'?selected:null});
   f.store.dispatch(action);
   if(kind==='PassTurnAction'||kind==='AttackAction'){
     reason=kind;break;
   }
 }
 return {prizeGloom,reason,trace,
   bench:f.player.bench.map(slot=>slot.getPokemonCard()?.name),
   active:f.player.active.getPokemonCard()?.name,
   tools:f.player.active.tools.map(c=>c.fullName),
   energies:f.player.active.energies.cards.map(c=>c.fullName),
   source:'conditioned physically conserved rank-2 60, not a natural game or win rate'};
}
if(require.main===module)console.log(JSON.stringify({unprized:followup(false),bothPrized:followup(true)},null,2));
module.exports={followup};
