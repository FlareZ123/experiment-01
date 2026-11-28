'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {projectPrompt}=require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const {validateDecision,validatePrompt}=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');

class ChoosePokemonPrompt{
 constructor(id,message,opts={}){
  this.playerId=id;this.id=321;this.message=message;
  this.playerType=2;this.slots=[2];
  this.options={min:1,max:1,allowCancel:false,...opts};
 }
 getPerspectivePlayerId(){return this.playerId}
}
class ChoosePrizePrompt{
 constructor(id,message,opts={}){
  this.playerId=id;this.id=322;this.message=message;
  this.options={count:1,max:1,allowCancel:false,
    useOpponentPrizes:false,isSecret:true,blocked:[],...opts};
 }
 getPerspectivePlayerId(){return this.playerId}
}
const native={
 PlayerType:{ANY:0,TOP_PLAYER:1,BOTTOM_PLAYER:2},
 SlotType:{BOARD:0,ACTIVE:1,BENCH:2,HAND:3,DISCARD:4,LOSTZONE:5,DECK:6}
};
const card=(fullName)=>({fullName,name:fullName.split(' ').slice(0,-2).join(' ')});
const slot=(p)=>({cards:p?[p]:[],getPokemonCard(){return this.cards[0]??null}});
function fixture(seat=0){
 const a={id:71,active:slot(null),bench:[slot(card('Regidrago VSTAR SIT 136')),
    slot(card('Budew ASC 16'))],
   hand:{cards:[]},deck:{cards:[]},discard:{cards:[]},lostzone:{cards:[]},
   stadium:{cards:[]},supporter:{cards:[]},
   prizes:Array.from({length:6},(_,i)=>({
     cards:i<4?[card('PRIVATE_PRIZE_CARD MUST_BE_HIDDEN 0')]:[],
     isSecret:true
   }))};
 const o={id:82,active:slot(card('Shadow Rider Calyrex VMAX CRE 75')),
   bench:[],hand:{cards:[]},deck:{cards:[]},discard:{cards:[]},
   lostzone:{cards:[]},stadium:{cards:[]},supporter:{cards:[]},
   prizes:Array.from({length:6},()=>({cards:[card('OTHER_SECRET CARD 0')]}))};
 return {phase:4,players:seat===0?[a,o]:[o,a],actor:a,opponent:o};
}
const source=(x)=>x.promptProjection.source;
test('default host projection stays frozen and rejects new KO engine source',()=>{
 for(const seat of [0,1]){
  const {phase,players,actor}=fixture(seat);
  const prompt=new ChoosePokemonPrompt(actor.id,'CHOOSE_NEW_ACTIVE_POKEMON');
  assert.throws(()=>projectPrompt({prompt,state:{phase,players},actorSeat:seat,native}),
    /Prompt has no trusted card-effect or allowlisted engine source/);
 }
});
test('opted-in pinned KO promotion projects actor Bench only with exact tokens',()=>{
 for(const seat of [0,1]){
  const {phase,players,actor}=fixture(seat);
  const prompt=new ChoosePokemonPrompt(actor.id,'CHOOSE_NEW_ACTIVE_POKEMON');
  const projected=projectPrompt({prompt,state:{phase,players},actorSeat:seat,native,
    allowPinnedKoPrizeEngineSource:true});
  assert.equal(projected.hostOnly,false);
  assert.deepEqual(source(projected),{
    classification:'actor-choice',sourceKind:'engine',sourcePrinting:null,
    effectName:'CHOOSE_NEW_ACTIVE_POKEMON'});
  assert.equal(projected.promptProjection.promptType,'ChoosePokemonPrompt');
  assert.equal(projected.promptProjection.publicMetadata.selectionType,'pokemon');
  assert.equal(projected.promptProjection.publicMetadata.minimumCount,1);
  assert.equal(projected.promptProjection.choices.length,2);
  assert.ok(projected.promptProjection.choices.every(x=>
    x.kind==='pokemon'&&x.publicMetadata.ownerSeat==='actor'&&
    x.publicMetadata.targetZone==='bench'));
  const choice=projected.promptProjection.choices[0];
  const decision={kind:'select-choices',tokens:[choice.token]};
  assert.deepEqual(validateDecision(decision,projected.promptProjection,new Set()),decision);
 }
});
test('opted-in native Prize slot projection hides every card face, both seats',()=>{
 for(const seat of [0,1]){
  const {phase,players,actor}=fixture(seat);
  const prompt=new ChoosePrizePrompt(actor.id,'CHOOSE_PRIZE_CARD',
    {count:2,max:2});
  const projected=projectPrompt({prompt,state:{phase,players},actorSeat:seat,native,
    allowPinnedKoPrizeEngineSource:true});
  assert.deepEqual(source(projected),{
    classification:'actor-choice',sourceKind:'engine',sourcePrinting:null,
    effectName:'CHOOSE_PRIZE_CARD'});
  const p=projected.promptProjection;
  assert.equal(p.publicMetadata.selectionType,'prize-slots');
  assert.equal(p.publicMetadata.requiredCount,2);
  assert.equal(p.choices.length,4);
  assert.ok(p.choices.every(x=>x.kind==='prize'&&
    x.publicMetadata.ownerSeat==='actor'&&
    x.publicMetadata.isOwnerVisible===false&&
    x.publicMetadata.sourceZone==='prizes'));
  assert.ok(!JSON.stringify(p).includes('PRIVATE_PRIZE_CARD'));
  const decision={kind:'select-choices',tokens:p.choices.slice(0,2).map(x=>x.token)};
  assert.deepEqual(validateDecision(decision,p,new Set()),decision);
 }
});
test('optional source refuses hidden opponent Prizes and abnormal native count',()=>{
 const {phase,players,actor}=fixture(0);
 const state={phase,players};
 for(const options of [
  {useOpponentPrizes:true},{count:4,max:4},{allowCancel:true},
  {count:2,max:1}
 ]){
  const prompt=new ChoosePrizePrompt(actor.id,'CHOOSE_PRIZE_CARD',options);
  assert.throws(()=>projectPrompt({prompt,state,actorSeat:0,native,
    allowPinnedKoPrizeEngineSource:true}),
    /Prompt has no trusted card-effect or allowlisted engine source/);
 }
});
test('Prize-to-discard source requires the actor discard object and correct message',()=>{
 const {phase,players,actor}=fixture(0),state={phase,players};
 const prompt=new ChoosePrizePrompt(actor.id,'CHOOSE_PRIZE_CARD_TO_DISCARD',
   {destination:actor.discard});
 const p=projectPrompt({prompt,state,actorSeat:0,native,
   allowPinnedKoPrizeEngineSource:true}).promptProjection;
 assert.equal(p.source.effectName,'CHOOSE_PRIZE_CARD_TO_DISCARD');
 prompt.options.destination={cards:[]};
 assert.throws(()=>projectPrompt({prompt,state,actorSeat:0,native,
   allowPinnedKoPrizeEngineSource:true}),
   /Prompt has no trusted card-effect or allowlisted engine source/);
});

test('opt-in host tokens pass rank-27 worker and strict protocol end-to-end',()=>{
 const {createPolicy,POLICY_VERSION,SOURCE_BLOB_SHA1}=
   require('../../simulation/evaluation/2026-11/agent2-rank27-regidrago-opponent-policy.cjs');
 for(const seat of [0,1]){
  const {phase,players,actor}=fixture(seat);
  const ownPublic={
    active:null,
    bench:[
      {printing:'Regidrago VSTAR SIT 136',hp:280,damage:0,
       energies:[],tools:[],printed:{subtypes:['VSTAR']}},
      {printing:'Budew ASC 16',hp:30,damage:0,energies:[],tools:[],
       printed:{subtypes:['Basic']}}
    ],
    stadium:[],discard:['Dialga-GX UPR 100'],deckCount:25,
    publicTurnRestrictions:{vstarUsed:false,gxUsed:false}
  };
  const obs={actorSeat:seat,phase,globalTurn:4,ownHand:[],
    ownPublic,opponentPublic:{
     active:{printing:'Shadow Rider Calyrex VMAX CRE 75',
       hp:320,damage:0,energies:[],printed:{subtypes:['VMAX']}},
     bench:[],discard:[],stadium:[]
    }};
  const worker=createPolicy({role:'opponent',seat,
    policyVersion:POLICY_VERSION,
    config:{rank:27,sourceBlobSha1:SOURCE_BLOB_SHA1}});
  const promotion=projectPrompt({
    prompt:new ChoosePokemonPrompt(actor.id,'CHOOSE_NEW_ACTIVE_POKEMON'),
    state:{phase,players},actorSeat:seat,native,
    allowPinnedKoPrizeEngineSource:true
  }).promptProjection;
  const r=worker.decide({role:'opponent',seat,observation:obs,prompt:promotion});
  assert.deepEqual(validateDecision(r,promotion,new Set()),r);
  assert.equal(r.kind,'select-choices');
  assert.deepEqual(r.tokens,[promotion.choices[0].token]);
  const prize=projectPrompt({
    prompt:new ChoosePrizePrompt(actor.id,'CHOOSE_PRIZE_CARD',
      {count:2,max:2}),
    state:{phase,players},actorSeat:seat,native,
    allowPinnedKoPrizeEngineSource:true
  }).promptProjection;
  const d=worker.decide({role:'opponent',seat,observation:obs,prompt:prize});
  assert.deepEqual(validateDecision(d,prize,new Set()),d);
  assert.deepEqual(d.tokens,prize.choices.slice(0,2).map(x=>x.token));
 }
});
