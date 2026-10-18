'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=n=>require(path.join(output,n));

/** @template T @param {()=>T} execute @param {boolean} enabled */
function withVIP(execute,enabled){
 const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
 const {PlayCardAction,PlayerType,SlotType}=load('game/store/actions/play-card-action');
 const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
 const {GamePhase}=load('game/store/state/state');
 const prior=SimpleTacticsAi.prototype.decodeNextAction;
 let opening=null,phase='ready';const events=[];
 const handler=function(state){
  const own=state.players.find(p=>p.id===this.client?.id);
  if(own?.id!==202)return prior.call(this,state);
  const pending=state.prompts.find(p=>p.result===undefined);
  const turn=state.activePlayer===1 && state.phase===GamePhase.PLAYER_TURN;
  if(turn&&!pending&&!opening)opening={turn:state.turn,
   hand:own.hand.cards.map(c=>c.fullName),
   active:own.active.getPokemonCard()?.fullName,
   bench:own.bench.map(s=>s.getPokemonCard()?.fullName||null)};
  if(phase==='search' && pending?.constructor.name==='ChooseCardsPrompt' &&
     pending.playerId===own.id && pending.cards===own.deck){
   const names=['Mewtwo & Mew-GX UNM','Gengar & Mimikyu-GX TEU'];
   const room=own.bench.filter(s=>!s.getPokemonCard()).length;
   const choices=names.map(n=>pending.cards.cards.find(c=>c.fullName===n))
     .filter(Boolean).slice(0,Math.min(room,2));
   if(choices.length && pending.validate(choices,state)){
    phase='chosen';events.push({kind:'owner-prompt',selected:choices.map(c=>c.fullName)});
    return new ResolvePromptAction(pending.id,choices);
   }
   phase='missing-prompt-target';
  }
  if(phase==='chosen'&&turn&&!pending){
   events.push({kind:'bench-after-selection',
    bench:own.bench.map(s=>s.getPokemonCard()?.fullName||null)});
   phase='done';
  }
  if(enabled&&phase==='ready'&&turn&&!pending&&state.turn<=2 &&
     own.bench.some(s=>!s.getPokemonCard())){
   const index=own.hand.cards.findIndex(c=>c.fullName==='Battle VIP Pass FST');
   if(index>=0){
    const action=new PlayCardAction(own.id,index,
      {player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
    const valid=this.isValidAction(state,action);
    events.push({kind:'source-first-turn-VIP-check',valid,turn:state.turn});
    if(valid){phase='search';return action;}
    phase='rejected';
   }
  }
  return prior.call(this,state);
 };
 SimpleTacticsAi.prototype.decodeNextAction=handler;
 try{return {game:execute(),audit:{enabled,opening,phase,events}};}
 finally{assert.equal(SimpleTacticsAi.prototype.decodeNextAction,handler);
  SimpleTacticsAi.prototype.decodeNextAction=prior;}
}

/** @returns {object} Exact deal, two policy arms, no outcome-selection claim. */
function run(){
 const {planAichi}=require('../evaluation/aichi-pilot.cjs');
 const {loadNewMoonCandidate}=require('../../scripts/aichi-new-moon-candidate.cjs');
 const {runMatch}=require('./headless.cjs');
 const {withRank11DirectBoostShake}=require('./rank11-direct-boostshake.cjs');
 const candidate=loadNewMoonCandidate();
 const plan=planAichi({label:candidate.id,cards:candidate.cards},{
  allowEquivalentBasicEnergies:true,allowBasicEnergyMirrorPrintings:true,
  allowJapanesePromoHooks:true});
 const rank11=plan.opponents.find(o=>o.rank===11);
 assert.equal(rank11?.status,'ready');
 const base={deckA:rank11.cards,deckB:plan.candidate.cards,seed:2809154458,
  maxActions:100,strictPromptValidation:true,forestSealSearchCorrection:true,
  battleCompressorPositiveSelectionCorrection:true,isolatePolicyRandomness:true,
  captureDecisionTrace:true};
 const play=enabled=>withRank11DirectBoostShake(0,()=>withVIP(
  ()=>runMatch({...base,label:'rank11-first-vip:'+enabled}),enabled)).result;
 const baseline=play(false),alternative=play(true);
 for(const p of [baseline,alternative]){
  assert.equal(p.game.verifiedByDrawLog,true);
  assert.equal(p.game.firstTurnSlot,1);
  assert.equal(p.game.engine,'twinleafgg/'+plan.engineRevision);
 }
 assert.deepEqual(baseline.audit.opening,alternative.audit.opening);
 return {schema:'rank11-newmoon-first-vip-source-v1',seed:base.seed,
  baseline:{audit:baseline.audit,
   firstActions:baseline.game.decisionTrace.filter(x=>x.playerSlot===1&&x.turnBefore<=3).slice(0,20)},
  alternative:{audit:alternative.audit,
   firstActions:alternative.game.decisionTrace.filter(x=>x.playerSlot===1&&x.turnBefore<=3).slice(0,20)},
  qualifiedCompetitiveGames:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={withVIP,run};
