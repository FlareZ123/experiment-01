'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {validatePrompt,validateDecision}=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const {projectHeavyBallPrompt,SOURCE,PIN,sourcePrinting}=require('../../simulation/evaluation/2026-11/agent2-rank18-heavy-ball-projection.cjs');
const {createPolicy,POLICY_VERSION,SOURCE_BLOB_SHA1}=require('../../simulation/evaluation/2026-11/agent2-rank18-regidrago-opponent-policy.cjs');
const n={SuperType:{POKEMON:'POKEMON',ENERGY:'ENERGY',TRAINER:'TRAINER'},
 Stage:{BASIC:'BASIC',STAGE_1:'STAGE_1',VSTAR:'VSTAR'}};
const pk=(name,set,num,stage=n.Stage.BASIC)=>({
 name,fullName:name+' '+set,set,setNumber:String(num),
 superType:n.SuperType.POKEMON,stage
});
const regV=()=>pk('Regidrago V','SIT',135);
const squawk=()=>pk('Squawkabilly ex','PAL',169);
const budew=()=>pk('Budew','ASC',16);
const goodra=()=>pk('Hisuian Goodra VSTAR','LOR',136,n.Stage.VSTAR);
const energy=()=>({name:'Fire Energy',fullName:'Fire Energy MEE',
 superType:n.SuperType.ENERGY,set:'MEE',setNumber:'10'});
const card=(name,more={})=>({name,fullName:name,superType:n.SuperType.TRAINER,...more});
class ChooseCardsPrompt{
 constructor(player,cards){
  this.id=5;this.playerId=player.id;this.player=player;
  this.cards=cards;this.message='CHOOSE_CARD_TO_HAND';
  this.filter={superType:n.SuperType.POKEMON,stage:n.Stage.BASIC};
  this.options={min:0,max:1,allowCancel:false,blocked:[],isSecret:false,
   differentTypes:false,allowDifferentSuperTypes:true};
 }
 getPerspectivePlayerId(){return this.playerId}
 decode(raw){if(!Array.isArray(raw))throw Error('BAD_RAW');return raw.map(i=>this.cards.cards[i]);}
 validate(cards){
  return Array.isArray(cards)&&cards.length<=1&&
   cards.every(c=>this.cards.cards.includes(c)&&
     c?.superType===n.SuperType.POKEMON&&c.stage===n.Stage.BASIC);
 }
}
const stub={
 makeSource(prompt,state,seat,provenance){
  return {classification:'actor-choice',sourceKind:'card-effect',
    sourcePrinting:provenance.sourceCard.fullName,effectName:provenance.effectName};
 },
 validateRawPromptResult(prompt,raw,state){
  const decoded=prompt.decode(raw);
  return {valid:prompt.validate(decoded,state),decoded};
 },
 projectPrompt(){return {hostOnly:true,reason:'delegated non-Heavy Ball'};}
};
function env(seat=0){
 const source={name:'Hisuian Heavy Ball',fullName:SOURCE,
   set:'ASR',setNumber:'146',superType:n.SuperType.TRAINER};
 const actor={id:'owner'+seat,active:{cards:[regV()]},
  bench:[],hand:{cards:[]},deck:{cards:[]},discard:{cards:[]},
  supporter:{cards:[source]},prizes:[
   {cards:[energy()],isSecret:false,faceUpPrize:false},
   {cards:[regV()],isSecret:false,faceUpPrize:false},
   {cards:[squawk()],isSecret:false,faceUpPrize:false},
   {cards:[goodra()],isSecret:false,faceUpPrize:false},
   {cards:[card('Sky Field')],isSecret:false,faceUpPrize:false},
   {cards:[],isSecret:false,faceUpPrize:false}]};
 const opp={id:'opp'+seat,active:{cards:[pk('Mew VMAX','FST',114,n.Stage.VSTAR)]},
   bench:[],hand:{cards:[]},deck:{cards:[]},discard:{cards:[]},
   supporter:{cards:[]},prizes:[
     {cards:[budew()],isSecret:true,faceUpPrize:false}]};
 const state={phase:3,players:seat===0?[actor,opp]:[opp,actor],prompts:[]};
 const cards={cards:actor.prizes.flatMap(p=>p.cards)};
 const prompt=new ChooseCardsPrompt(actor,cards);state.prompts.push(prompt);
 const provenance={sourceKind:'card-effect',sourceCard:source,effectName:'Hisuian Heavy Ball'};
 const options={state,prompt,actorSeat:seat,native:n,
  testProjectionApi:stub,provenanceHook:{
   getPromptProvenance:(x)=>{assert.equal(x,prompt);return provenance;}}};
 return {actor,opp,state,prompt,provenance,options,source};
}
function project(e){return projectHeavyBallPrompt(e.options);}
function mon(printing){return {printing,hp:200,damage:0,energies:[],
 printed:{types:['Dragon'],subtypes:['Basic']}};}
function observation(seat,e){
 return {actorSeat:seat,globalTurn:3,ownHand:[],
 ownPublic:{active:mon('Regidrago V SIT 135'),bench:[],stadium:[],
  discard:[],prizeCount:6,deckCount:35},
 opponentPublic:{active:mon('Mew VMAX FST 114'),bench:[],stadium:[],prizeCount:6}};
}
function worker(seat){
 return createPolicy({role:'opponent',seat,policyVersion:POLICY_VERSION,
   config:{rank:18,sourceBlobSha1:SOURCE_BLOB_SHA1}});
}
test('pinned source temporarily reveals owner prizes without flipping faceUpPrize',()=>{
 assert.equal(PIN,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
 for(const seat of [0,1]){
  const e=env(seat);
  assert.ok(e.actor.prizes.every(p=>p.isSecret===false));
  assert.ok(e.actor.prizes.every(p=>p.faceUpPrize===false));
  assert.ok(e.opp.prizes.every(p=>p.isSecret===true));
  assert.equal(e.prompt.cards.cards.length,5);
  assert.notEqual(e.prompt.cards,e.actor.prizes[0]);
  assert.equal(e.actor.supporter.cards.includes(e.source),true);
 }
});
test('actual-source Basic prize chooser exposes only actor Prizes and an empty option',()=>{
 for(const seat of [0,1]){
  const e=env(seat),out=project(e),p=out.promptProjection;
  assert.equal(out.hostOnly,false);
  assert.equal(out.diagnostics.eligibleBasicCount,2);
  assert.equal(out.diagnostics.originalPrizeCount,5);
  assert.deepEqual(validatePrompt(p,seat),p);
  assert.equal(p.choices.length,3);
  assert.equal(p.publicMetadata.minimumCount,0);
  assert.equal(p.publicMetadata.maximumCount,1);
  assert.equal(p.publicMetadata.isOwnerVisible,true);
  assert.equal(p.publicMetadata.sourceZone,'prizes');
  assert.deepEqual(p.choices.filter(x=>x.kind==='card').map(x=>x.printing),
    ['Regidrago V SIT 135','Squawkabilly ex PAL 169']);
  assert.ok(!p.choices.some(x=>x.printing==='Budew ASC 16'));
  const selected=p.choices.find(x=>x.printing==='Regidrago V SIT 135');
  assert.equal(out.choiceByToken.get(selected.token),1);
  assert.equal(e.prompt.validate(e.prompt.decode([1])),true);
  const decision=worker(seat).decide({role:'opponent',seat,
    observation:observation(seat,e),prompt:p});
  assert.deepEqual(decision,{kind:'select-choices',tokens:[selected.token]});
  assert.deepEqual(validateDecision(decision,p,new Set()),decision);
 }
});
test('no Basic in revealed Prize returns native-valid empty selection',()=>{
 for(const seat of [0,1]){
  const e=env(seat);
  e.actor.prizes=[{cards:[energy()],isSecret:false,faceUpPrize:false}];
  e.prompt.cards.cards=e.actor.prizes.flatMap(p=>p.cards);
  const out=project(e),p=out.promptProjection;
  assert.equal(out.diagnostics.eligibleBasicCount,0);
  assert.equal(p.choices.length,1);
  assert.equal(p.choices[0].kind,'empty-selection');
  assert.deepEqual(out.choiceByToken.get(p.choices[0].token),[]);
  assert.equal(e.prompt.validate(e.prompt.decode([])),true);
  const decision=worker(seat).decide({role:'opponent',seat,
    observation:observation(seat,e),prompt:p});
  assert.deepEqual(decision,{kind:'select-choice',token:p.choices[0].token});
  assert.deepEqual(validateDecision(decision,p,new Set()),decision);
 }
});
test('one-taken-Prize order and duplicate Basic printings preserve raw identity',()=>{
 for(const seat of [0,1]){
  const e=env(seat);
  e.actor.prizes[0].cards=[];e.actor.prizes[2].cards=[regV()];
  e.prompt.cards.cards=e.actor.prizes.flatMap(p=>p.cards);
  const out=project(e),p=out.promptProjection;
  assert.deepEqual(p.choices.filter(x=>x.kind==='card').map(x=>x.printing),
    ['Regidrago V SIT 135','Regidrago V SIT 135']);
  assert.deepEqual(p.choices.filter(x=>x.kind==='card').map(x=>
    out.choiceByToken.get(x.token)),[0,1]);
  assert.equal(p.choices.length,3);
 }
});
test('source normalization is literal printing exact and refuses forged numbers',()=>{
 assert.equal(sourcePrinting('Regidrago V SIT'),'Regidrago V SIT 135');
 assert.equal(sourcePrinting('Regidrago V SIT 135'),'Regidrago V SIT 135');
 assert.equal(sourcePrinting('Regidrago V SIT 999'),null);
 assert.equal(sourcePrinting('Foreign Pokémon ZZ 42'),null);
});
test('foreign card in concealed source pool cannot leak despite source capability',()=>{
 for(const seat of [0,1]){
  const e=env(seat);
  e.actor.prizes[1].cards=[pk('Mew V','FST',113)];
  e.prompt.cards.cards=e.actor.prizes.flatMap(p=>p.cards);
  assert.throws(()=>project(e),x=>x.code==='R18_HEAVY_BALL_FOREIGN_PRINTING');
 }
});
test('temporary reveal is required, no K0 or concealed opponent Prize access',()=>{
 for(const seat of [0,1]){
  const e=env(seat);
  e.actor.prizes[1].isSecret=true;
  assert.throws(()=>project(e),x=>x.code==='R18_HEAVY_BALL_PRIZE_REVEAL');
  e.actor.prizes[1].isSecret=false;
  e.prompt.cards.cards=[e.opp.prizes[0].cards[0],...e.prompt.cards.cards];
  assert.throws(()=>project(e),x=>x.code==='R18_HEAVY_BALL_PRIZE_REVEAL');
  e.prompt.cards.cards=e.actor.prizes.flatMap(p=>p.cards);
  e.prompt.cards.cards.reverse();
  assert.throws(()=>project(e),x=>x.code==='R18_HEAVY_BALL_PRIZE_REVEAL');
 }
});
test('source must be exact ASR146 already in own supporter zone',()=>{
 for(const seat of [0,1]){
  const e=env(seat);
  e.source.setNumber='999';
  assert.throws(()=>project(e),x=>x.code==='R18_HEAVY_BALL_SOURCE');
  e.source.setNumber='146';e.actor.supporter.cards=[];
  assert.throws(()=>project(e),x=>x.code==='R18_HEAVY_BALL_SOURCE');
  e.actor.supporter.cards=[e.source];e.provenance.effectName='Other Item';
  assert.throws(()=>project(e),x=>x.code==='R18_HEAVY_BALL_SOURCE');
 }
});
test('native prompt class/source/filter/card-count/actor ownership fail closed',()=>{
 for(const seat of [0,1]){
  const e=env(seat);
  e.prompt.filter.stage='STAGE_1';
  assert.throws(()=>project(e),x=>x.code==='R18_HEAVY_BALL_SHAPE');
  e.prompt.filter.stage=n.Stage.BASIC;e.prompt.options.max=2;
  assert.throws(()=>project(e),x=>x.code==='R18_HEAVY_BALL_SHAPE');
  e.prompt.options.max=1;e.prompt.playerId='wrong';
  assert.throws(()=>project(e),x=>x.code==='R18_HEAVY_BALL_OWNER');
  e.prompt.playerId=e.actor.id;e.state.phase=1;
  assert.throws(()=>project(e),x=>x.code==='R18_HEAVY_BALL_ACTOR_PHASE');
 }
});
test('non-Heavy Ball prompt delegates generic existing projector untouched',()=>{
 for(const seat of [0,1]){
  const e=env(seat);e.provenance.sourceCard=card('Quick Ball');
  assert.equal(project(e).reason,'delegated non-Heavy Ball');
 }
});
