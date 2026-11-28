'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {validatePrompt,validateDecision}=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const {
 SOURCE,PIN,exactSource,normalizeEnergy,optimizedTransfer,
 projectMotivatePrompt
}=require('../../simulation/evaluation/2026-11/agent2-rank18-motivate-projection.cjs');
const {
 createPolicy,POLICY_VERSION,SOURCE_BLOB_SHA1
}=require('../../simulation/evaluation/2026-11/agent2-rank18-regidrago-opponent-policy.cjs');
const n={
 PlayerType:{BOTTOM_PLAYER:0,TOP_PLAYER:1},
 SlotType:{BENCH:1,ACTIVE:0},
 SuperType:{ENERGY:'ENERGY'},
 EnergyType:{BASIC:'BASIC',SPECIAL:'SPECIAL'},
 CardType:{GRASS:'GRASS',FIRE:'FIRE',COLORLESS:'COLORLESS'}
};
class EnergyCard{
 constructor(name,more={}){
  this.name=name;this.set='MEE';this.setNumber=name==='Grass Energy'?'9':'10';
  this.fullName=name+' MEE';this.superType=n.SuperType.ENERGY;
  this.energyType=n.EnergyType.BASIC;
  this.provides=[name==='Grass Energy'?n.CardType.GRASS:n.CardType.FIRE];
  Object.assign(this,more);
 }
}
n.EnergyCard=EnergyCard;
const grass=()=>new EnergyCard('Grass Energy');
const fire=()=>new EnergyCard('Fire Energy');
const card=(name,more={})=>({name,...more});
const pk=(name,set,number)=>({
 name,set,setNumber:String(number),fullName:name+' '+set
});
function slot(mon,attached=[]){
 return {cards:mon?[mon,...attached]:[],energies:{cards:attached.slice()},
  getPokemonCard(){return mon??null}};
}
class AttachEnergyPrompt{
 constructor(id,discard){
  this.id=100;this.playerId=id;this.cardList=discard;
  this.message='ATTACH_ENERGY_TO_BENCH';this.playerType=n.PlayerType.BOTTOM_PLAYER;
  this.slots=[n.SlotType.BENCH];this.filter={superType:n.SuperType.ENERGY,
    energyType:n.EnergyType.BASIC};
  this.options={allowCancel:false,min:0,max:2,blocked:[],blockedTo:[],
    differentTypes:false,differentTargets:false,sameTarget:true};
 }
 getPerspectivePlayerId(){return this.playerId}
 decode(raw){
  if(!Array.isArray(raw))throw Error('INVALID_RAW');
  return raw.map(x=>({card:this.cardList.cards[x.index],to:x.to}));
 }
 validate(transfers,state){
  if(!Array.isArray(transfers)||transfers.length>2)return false;
  const refs=new Set();
  for(const transfer of transfers){
   if(!(transfer.card instanceof EnergyCard)||
      transfer.card.energyType!==n.EnergyType.BASIC||refs.has(transfer.card))
     return false;
   refs.add(transfer.card);
   if(transfer.to.player!==n.PlayerType.BOTTOM_PLAYER||
      transfer.to.slot!==n.SlotType.BENCH||
      !Number.isInteger(transfer.to.index))return false;
   const owner=state.players.find(p=>p.id===this.playerId);
   if(!owner?.bench[transfer.to.index]?.getPokemonCard())return false;
   if(transfer.to.index!==transfers[0].to.index)return false;
  }
  return true;
 }
}
const stub={
 makeSource(prompt,state,seat,provenance){
  return {classification:'actor-choice',sourceKind:'card-effect',
    sourcePrinting:provenance.sourceCard.fullName,effectName:provenance.effectName};
 },
 validateRawPromptResult(prompt,raw,state){
  const decoded=prompt.decode(raw,state);
  return {valid:prompt.validate(decoded,state),decoded};
 },
 projectPrompt(){return {hostOnly:true,reason:'unhandled source falls back'};}
};
function env(seat=0,overrides={}){
 const squawk=pk('Squawkabilly ex','PAL',169);
 const active=slot(squawk);
 const vstar=slot(pk('Regidrago VSTAR','SIT',136),[grass()]);
 const opponent={
  id:'opp'+seat,active:slot(pk('Mew','MEW',151)),
  bench:[],discard:{cards:[]},stadium:{cards:[]}};
 const actor={id:'owner'+seat,active,
  bench:[vstar,slot(pk('Regidrago V','SIT',135))],
  discard:{cards:[card('Carmine'),grass(),fire()]},
  stadium:{cards:[]}};
 const players=seat===0?[actor,opponent]:[opponent,actor];
 const state={phase:3,players,prompts:[]};
 const prompt=new AttachEnergyPrompt(actor.id,actor.discard);
 state.prompts.push(prompt);
 const provenance={sourceKind:'card-effect',sourceCard:squawk,effectName:'Motivate'};
 const options={prompt,state,actorSeat:seat,native:n,
   testProjectionApi:stub,
   provenanceHook:{getPromptProvenance:(thePrompt)=>{
     assert.equal(thePrompt,prompt);
     return provenance;
   }}};
 Object.assign(actor,overrides.actor??{});
 Object.assign(state,overrides.state??{});
 Object.assign(prompt,overrides.prompt??{});
 Object.assign(provenance,overrides.provenance??{});
 return {actor,opponent,state,prompt,provenance,options,squawk};
}
function project(e){
 return projectMotivatePrompt(e.options);
}
function mon(printing,energies=[]){
 return {printing,energies,hp:280,damage:0,printed:{types:['Dragon'],
   subtypes:printing.includes('VSTAR')?['VSTAR']:['Basic']}};
}
function obs(seat,e){
 return {actorSeat:seat,globalTurn:2,ownHand:[],
  ownPublic:{active:mon('Squawkabilly ex PAL 169'),
   bench:e.actor.bench.map(s=>s.getPokemonCard()?.fullName==='Regidrago VSTAR SIT'?
     mon('Regidrago VSTAR SIT 136'):
     s.getPokemonCard()?.fullName==='Regidrago V SIT'?
       mon('Regidrago V SIT 135'):null),
   discard:e.actor.discard.cards.map(c=>c instanceof EnergyCard?
     c.name+' MEE '+c.setNumber:c.name),
   stadium:[],deckCount:40,prizeCount:6,
   publicTurnRestrictions:{vstarUsed:false}},
  opponentPublic:{active:mon('Mew VMAX FST 114'),
   bench:[],stadium:[],prizeCount:6}};
}
function worker(seat,enable=true){
 return createPolicy({role:'opponent',seat,policyVersion:POLICY_VERSION,
   config:{rank:18,sourceBlobSha1:SOURCE_BLOB_SHA1,
     motivateProjection:enable?'complete-choice-token-v1':'disabled'}});
}
test('pinned source identity and expected shape are explicitly opt-in',()=>{
 assert.equal(PIN,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
 assert.equal(SOURCE,'Squawkabilly ex PAL');
 for(const seat of [0,1]){
  const e=env(seat);
  assert.equal(exactSource(e.provenance,stub.makeSource(
    e.prompt,e.state,seat,e.provenance)),true);
  assert.deepEqual(e.prompt.options,{allowCancel:false,min:0,max:2,
    blocked:[],blockedTo:[],differentTypes:false,
    differentTargets:false,sameTarget:true});
  assert.equal(e.prompt.cardList,e.actor.discard);
 }
});
test('native-shape composite attaches complementary Grass/Fire to one Bench Regidrago',()=>{
 for(const seat of [0,1]){
  const e=env(seat),out=project(e);
  assert.equal(out.hostOnly,false);
  assert.equal(out.diagnostics.nativeSelectedBasicCount,2);
  assert.equal(out.diagnostics.targetBenchIndex,0);
  const proj=out.promptProjection;
  assert.deepEqual(validatePrompt(proj,seat),proj);
  assert.equal(proj.publicMetadata.selectionType,'energy-attachment');
  assert.equal(proj.publicMetadata.sourceZone,'discard');
  assert.equal(proj.choices.length,1);
  assert.equal(proj.choices[0].kind,'energy');
  const raw=out.choiceByToken.get(proj.choices[0].token);
  assert.deepEqual(raw,[{to:{player:0,slot:1,index:0},index:1},
    {to:{player:0,slot:1,index:0},index:2}]);
  assert.equal(e.prompt.validate(e.prompt.decode(raw),e.state),true);
  const reply=worker(seat).decide({role:'opponent',seat,
    observation:obs(seat,e),prompt:proj});
  assert.deepEqual(reply,{kind:'select-choice',token:proj.choices[0].token});
  assert.deepEqual(validateDecision(reply,proj,new Set()),reply);
 }
});
test('one Basic energy can be selected without forced duplicate energy payment',()=>{
 for(const seat of [0,1]){
  const e=env(seat);
  e.actor.discard.cards=[grass()];
  const out=project(e);
  const raw=[...out.choiceByToken.values()][0];
  assert.equal(raw.length,1);
  assert.equal(raw[0].index,0);
  assert.equal(out.promptProjection.choices[0].publicMetadata.selectedCount,1);
  assert.equal(e.prompt.validate(e.prompt.decode(raw),e.state),true);
 }
});
test('same-target optimizer selects funded VSTAR over weaker unevolved V',()=>{
 for(const seat of [0,1]){
  const e=env(seat);
  e.actor.bench=[slot(pk('Regidrago V','SIT',135)),
    slot(pk('Regidrago VSTAR','SIT',136))];
  const out=project(e);
  assert.equal(out.diagnostics.targetBenchIndex,1);
  const raw=[...out.choiceByToken.values()][0];
  assert.ok(raw.every(x=>x.to.index===1));
 }
});
test('zero-energy composite is legal under original min zero, not a cancellation',()=>{
 for(const seat of [0,1]){
  const e=env(seat);
  e.actor.bench=[slot(pk('Budew','ASC',16))];
  const out=project(e);
  const proj=out.promptProjection;
  const raw=[...out.choiceByToken.values()][0];
  assert.deepEqual(raw,[]);
  assert.equal(e.prompt.validate(e.prompt.decode(raw),e.state),true);
  assert.equal(proj.choices[0].kind,'energy');
  assert.equal(proj.choices[0].publicMetadata.selectedCount,0);
  assert.equal(proj.publicMetadata.minimumCount,0);
  assert.equal(proj.publicMetadata.maximumCount,0);
  assert.deepEqual(validatePrompt(proj,seat),proj);
  const w=worker(seat);
  const state=obs(seat,e);
  assert.deepEqual(w.decide({role:'opponent',seat,observation:state,prompt:proj}),
    {kind:'select-choice',token:proj.choices[0].token});
 }
});
test('Temple suppresses Double Dragon; Basic Motivate attachment still pays color',()=>{
 for(const seat of [0,1]){
  const e=env(seat);
  const dde=new EnergyCard('Double Dragon Energy',{
    superType:n.SuperType.ENERGY,energyType:n.EnergyType.SPECIAL,
    fullName:'Double Dragon Energy ROS',set:'ROS',setNumber:'97',
    provides:[n.CardType.GRASS,n.CardType.FIRE]});
  e.actor.bench=[slot(pk('Regidrago VSTAR','SIT',136),[dde,grass()])];
  e.actor.discard.cards=[fire()];
  assert.equal(project(e).diagnostics.nativeSelectedBasicCount,0);
  e.actor.stadium.cards=[pk('Temple of Sinnoh','ASR',155)];
  const out=project(e);
  assert.equal(out.diagnostics.nativeSelectedBasicCount,1);
  assert.equal([...out.choiceByToken.values()][0][0].index,0);
  assert.equal(e.prompt.validate(e.prompt.decode(
    [...out.choiceByToken.values()][0]),e.state),true);
 }
});
test('strict owner and exact source fail closed; no counterpart hand or opponent discard leak',()=>{
 for(const seat of [0,1]){
  const e=env(seat);
  e.prompt.cardList={cards:[grass(),fire()]};
  assert.throws(()=>project(e),x=>x.code==='R18_MOTIVATE_PROMPT_SHAPE');
  e.prompt.cardList=e.actor.discard;
  e.prompt.options.sameTarget=false;
  assert.throws(()=>project(e),x=>x.code==='R18_MOTIVATE_PROMPT_SHAPE');
  e.prompt.options.sameTarget=true;
  e.provenance.effectName='Squawk and Seize';
  assert.throws(()=>project(e),x=>x.code==='R18_MOTIVATE_SOURCE');
  e.provenance.effectName='Motivate';
  e.squawk.setNumber='999';
  assert.throws(()=>project(e),x=>x.code==='R18_MOTIVATE_SOURCE');
  e.squawk.setNumber='169';
  const stranger=pk('Squawkabilly ex','PAL',169);
  e.actor.active=slot(stranger);
  assert.throws(()=>project(e),x=>x.code==='R18_MOTIVATE_SOURCE');
  e.actor.active=slot(e.squawk);
  e.prompt.playerId='opposite';
  assert.throws(()=>project(e),x=>x.code==='R18_MOTIVATE_PROMPT_OWNER');
 }
});
test('malformed prompt filter, option count, energy type, or phase are refused',()=>{
 for(const seat of [0,1]){
  const e=env(seat);
  e.prompt.filter.name='Grass Energy';
  assert.throws(()=>project(e),x=>x.code==='R18_MOTIVATE_PROMPT_SHAPE');
  delete e.prompt.filter.name;
  e.prompt.options.min=1;
  assert.throws(()=>project(e),x=>x.code==='R18_MOTIVATE_PROMPT_SHAPE');
  e.prompt.options.min=0;
  e.state.phase=1;
  assert.throws(()=>project(e),x=>x.code==='R18_MOTIVATE_ACTOR_PHASE');
  e.state.phase=3;
  e.actor.discard.cards=[new EnergyCard('Grass Energy',{
   energyType:n.EnergyType.SPECIAL})];
  const out=project(e);
  assert.equal(out.diagnostics.nativeSelectedBasicCount,0);
 }
});
test('non-Squawk prompt preserves untouched shared projection behavior',()=>{
 for(const seat of [0,1]){
  const e=env(seat);
  e.provenance.sourceCard=pk('Shadow Rider Calyrex VMAX','CRE',75);
  assert.equal(project(e).reason,'unhandled source falls back');
 }
});
test('Motivate root unavailable until exact opted-in projected continuation',()=>{
 for(const seat of [0,1]){
  const e=env(seat);
  const state=obs(seat,e),items=[
    {kind:'attack',token:'motivate',attackName:'Motivate',actorPrinting:'Squawkabilly ex PAL 169',
      label:'Motivate'},
    {kind:'pass',token:'pass',actorPrinting:'Pass',label:'Pass'}
  ];
  const make=enable=>worker(seat,enable).decide({role:'opponent',seat,
    observation:state,actionFrontier:{schema:'aichi-action-frontier-v1',items}});
  assert.deepEqual(make(false),{kind:'select-action',token:'pass'});
  assert.deepEqual(make(true),{kind:'select-action',token:'motivate'});
 }
});
test('policy rejects forged Motivate composite target and unregistered config',()=>{
 for(const seat of [0,1]){
  const e=env(seat),out=project(e);
  const p=out.promptProjection;
  const forged={...p,choices:[{...p.choices[0],publicMetadata:{
    ...p.choices[0].publicMetadata,benchIndex:17}}]};
  const decision=worker(seat).decide({role:'opponent',seat,
    observation:obs(seat,e),prompt:forged});
  assert.equal(decision.kind,'abstain');
  assert.deepEqual(validateDecision(decision,forged,new Set()),decision);
  assert.throws(()=>createPolicy({role:'opponent',seat,
    policyVersion:POLICY_VERSION,config:{rank:18,sourceBlobSha1:SOURCE_BLOB_SHA1,
      motivateProjection:'unregistered'}}));
 }
});


test('authoritative pinned EnergyCardList overrides incomplete composite card stack',()=>{
 for(const seat of [0,1]){
  const e=env(seat);
  const vstar=e.actor.bench[0];
  // Simulate a native code path that maintains the canonical attachment
  // zone before/without synchronizing auxiliary composite list copies.
  vstar.cards=[vstar.getPokemonCard()];
  vstar.energies.cards=[grass(),grass()];
  e.actor.discard.cards=[fire()];
  const out=project(e);
  assert.equal(out.diagnostics.nativeSelectedBasicCount,1);
  assert.equal(out.diagnostics.targetBenchIndex,0);
  assert.equal(out.diagnostics.policy,'agent2-rank18-motivate-source-v1');
  assert.deepEqual([...out.choiceByToken.values()][0],
    [{to:{player:0,slot:1,index:0},index:0}]);
  // Native selection remains legal and reaches a GGF-enabled attacker.
  assert.equal(e.prompt.validate(e.prompt.decode(
    [...out.choiceByToken.values()][0]),e.state),true);
 }
});
