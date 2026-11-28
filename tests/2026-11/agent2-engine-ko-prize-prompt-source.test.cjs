'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {ENGINE_PIN,P,PROMOTION,PRIZE_TO_HAND,PRIZE_TO_DISCARD,
  classifyNativeEngineContinuation}=require(
  '../../simulation/evaluation/2026-11/agent2-engine-ko-prize-prompt-source.cjs');

class ChoosePokemonPrompt{
 constructor(playerId,message,playerType=P.BOTTOM_PLAYER,slots=[P.BENCH],
  options={min:1,max:1,allowCancel:false}){
   Object.assign(this,{playerId,message,playerType,slots,options});
 }
 getPerspectivePlayerId(){return this.playerId}
}
class ChoosePrizePrompt{
 constructor(playerId,message,options={count:1,max:1,allowCancel:false,
   useOpponentPrizes:false}){
  Object.assign(this,{playerId,message,options});
 }
 getPerspectivePlayerId(){return this.playerId}
}
const s=(opts={})=>{
 const act={id:13,active:{cards:opts.active??[]},
  bench:opts.bench??[{cards:[{name:'Regidrago VSTAR'}]}],
  discard:{cards:[]},prizes:Array.from({length:6},(_,i)=>({
    cards:i<(opts.prizeLeft??4)?[{name:'SECRET'}]:[]}))};
 const other={id:27,active:{cards:opts.oppActive??[{name:'Vileplume'}]},
  bench:opts.oppBench??[],discard:{cards:[]}};
 return {phase:opts.phase??P.AFTER_ATTACK,players:[act,other],
  isSuddenDeath:opts.isSuddenDeath??false};
};
const classify=(state,prompt,override={})=>classifyNativeEngineContinuation({
 prompt,state,actorSeat:0,provenance:null,enginePin:ENGINE_PIN,...override
});
test('exact pin, numeric game phases and native messages are pinned',()=>{
 assert.equal(ENGINE_PIN,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
 assert.equal(P.BOTTOM_PLAYER,2);assert.equal(P.BENCH,2);
 assert.equal(P.SETUP,1);assert.equal(P.FINISHED,7);
 assert.equal(PROMOTION,'CHOOSE_NEW_ACTIVE_POKEMON');
 assert.equal(PRIZE_TO_HAND,'CHOOSE_PRIZE_CARD');
 assert.equal(PRIZE_TO_DISCARD,'CHOOSE_PRIZE_CARD_TO_DISCARD');
});
test('real pinned check-effect.ts promotion shape passes both physical seats',()=>{
 for(const seat of [0,1]){
  const state=s();
  if(seat===1)state.players.reverse();
  const actor=state.players[seat];
  const p=new ChoosePokemonPrompt(actor.id,PROMOTION);
  assert.deepEqual(classify(state,p,{actorSeat:seat}),{
   classification:'actor-choice',sourceKind:'engine',
   sourcePrinting:null,effectName:PROMOTION});
 }
});
test('promotion only if actor active empty and Bench occupied',()=>{
 const state=s(),p=new ChoosePokemonPrompt(13,PROMOTION);
 assert.equal(classify(state,p).effectName,PROMOTION);
 state.players[0].active.cards.push({name:'not-empty'});
 assert.equal(classify(state,p),null);
 state.players[0].active.cards.length=0;
 state.players[0].bench.length=0;
 assert.equal(classify(state,p),null);
});
test('promotion reject wrong physical target, wrong cardinality, cancel and wrong message',()=>{
 const state=s();
 for(const p of [
  new ChoosePokemonPrompt(13,PROMOTION,1),
  new ChoosePokemonPrompt(13,PROMOTION,2,[1]),
  new ChoosePokemonPrompt(13,PROMOTION,2,[2],{min:0,max:1,allowCancel:false}),
  new ChoosePokemonPrompt(13,PROMOTION,2,[2],{min:1,max:2,allowCancel:false}),
  new ChoosePokemonPrompt(13,PROMOTION,2,[2],{min:1,max:1,allowCancel:true}),
  new ChoosePokemonPrompt(13,'MYSTERIOUS_OTHER_SWITCH')
 ])assert.equal(classify(state,p),null);
});
test('engine Prize selection and discard destination get distinct exact source names',()=>{
 for(const seat of [0,1]){
  const state=s({prizeLeft:4});
  if(seat===1)state.players.reverse();
  const actor=state.players[seat];
  const ordinary=new ChoosePrizePrompt(actor.id,PRIZE_TO_HAND,
   {count:2,max:2,allowCancel:false,useOpponentPrizes:false,
    destination:{cards:[]}});
  assert.equal(classify(state,ordinary,{actorSeat:seat}).effectName,
   PRIZE_TO_HAND);
  const discard=new ChoosePrizePrompt(actor.id,PRIZE_TO_DISCARD,
   {count:1,max:1,allowCancel:false,useOpponentPrizes:false,
    destination:actor.discard});
  assert.equal(classify(state,discard,{actorSeat:seat}).effectName,
   PRIZE_TO_DISCARD);
 }
});
test('Prize selectors stop when auto-take or game termination is mandatory',()=>{
 const st=s({prizeLeft:2});
 const p=new ChoosePrizePrompt(13,PRIZE_TO_HAND,
  {count:2,max:2,allowCancel:false,useOpponentPrizes:false});
 assert.equal(classify(st,p),null); // >= remaining => auto-win
 p.options.count=1;p.options.max=1;
 assert.equal(classify(st,p).effectName,PRIZE_TO_HAND);
 st.isSuddenDeath=true;
 assert.equal(classify(st,p),null);
 st.isSuddenDeath=false;st.players[1].active.cards=[];
 assert.equal(classify(st,p),null); // last Pokemon => auto-take, no prompt
});
test('Prize selector cannot expose opponent Prize ownership or cancel',()=>{
 const st=s(),p=new ChoosePrizePrompt(13,PRIZE_TO_HAND);
 assert.equal(classify(st,p).effectName,PRIZE_TO_HAND);
 p.options.useOpponentPrizes=true;
 assert.equal(classify(st,p),null);
 p.options.useOpponentPrizes=false;p.options.allowCancel=true;
 assert.equal(classify(st,p),null);
 p.options.allowCancel=false;p.options.count=0;
 assert.equal(classify(st,p),null);
 p.options.count=1;p.options.max=2;
 assert.equal(classify(st,p),null);
 p.options.count=1;p.options.max=1;p.options.destination=st.players[0].discard;
 assert.equal(classify(st,p),null); // must have TO_DISCARD source
});
test('provenance, pending prompt and perspective cannot be laundered',()=>{
 const st=s(),p=new ChoosePokemonPrompt(13,PROMOTION);
 assert.equal(classify(st,p,{enginePin:'wrong-pin'}),null);
 assert.equal(classify(st,p,{provenance:{sourceKind:'card-effect',
   effectName:PROMOTION}}),null);
 assert.equal(classify(st,p,{actorSeat:1}),null);
 p.result=[];
 assert.equal(classify(st,p),null);
 delete p.result;p.playerId=27;
 assert.equal(classify(st,p),null);
 p.playerId=13;p.getPerspectivePlayerId=()=>27;
 assert.equal(classify(st,p),null);
});
test('no engine continuation before setup or after finished; ordinary typed source unaffected',()=>{
 const st=s(),p=new ChoosePokemonPrompt(13,PROMOTION);
 for(const phase of [P.WAITING,P.SETUP,P.FINISHED,999,null]){
  st.phase=phase;assert.equal(classify(st,p),null);
 }
 st.phase=P.AFTER_ATTACK;
 assert.equal(classify(st,p).effectName,PROMOTION);
});
