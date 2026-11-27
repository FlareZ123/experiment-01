'use strict';
// Synthetic actor-view and prompt projection regression suite; no native fixture game.
const assert=require('node:assert/strict');
const test=require('node:test');
const A=require('./agent21-rank26-meloetta-opponent-policy.cjs');
const V=require('./agent49-policy-protocol.cjs');
const P=require('./agent36-prompt-projection.cjs');
const card=(printing,damage=0,hp=60,extra={})=>({printing,damage,hp,energies:[],tools:[],abilities:[],abilitySuppressions:[],printed:{resistance:[]},...extra});
function funded(){
 return {actorSeat:0,globalTurn:1,ownHand:["Damage Pump LOR","Damage Pump LOR","Damage Pump LOR"],ownPublic:{active:card("Meloetta ex BLK",0,200,{energies:["Double Colorless Energy SUM","Lightning Energy"],tools:["Technical Machine: Crisis Punch PAF"],abilitySuppressions:[{abilityName:"Debut Performance",suppressed:false}]}),bench:[card("Exeggcute PLF",20,30),card("Exeggcute PLF",20,30),card("Unown AOR",20),card("Dedenne-GX UNB",20,160)],stadium:["Risky Ruins MEG"],discard:[],deckCount:30,prizeCount:6,publicTurnRestrictions:{}},opponentPublic:{active:card("Shadow Rider Calyrex V CRE",0,210),bench:[],prizeCount:6,stadium:[]},ownTurnResources:{energyPlayedTurn:1,retreatedTurn:1}};
}
function policy(){return A.createPolicy({role:'opponent',seat:0,policyVersion:A.POLICY_VERSION,config:{}})}
const req=(o,rows,prompt)=>({role:'opponent',seat:0,observation:o,actionFrontier:{items:rows},...(prompt?{prompt}:{})});
const attack={kind:'attack',token:'finish',attackName:'Crisis Punch',publicMetadata:{attackCostPayable:true,attackSource:{sourceKind:'active-tool',sourceCardFullName:'Technical Machine: Crisis Punch PAF'}}};
const slots=o=>[{zone:'active',index:0,p:o.ownPublic.active},...o.ownPublic.bench.map((p,index)=>({zone:'bench',index,p}))].filter(x=>x.p);
const rootRows=o=>[...o.ownHand.map((actorPrinting,handIndex)=>({kind:'play-card',actorPrinting,token:'h'+handIndex,publicMetadata:{handIndex}})),...o.ownPublic.discard.map((actorPrinting,sourceIndex)=>({kind:'use-ability',actorPrinting,token:'d'+sourceIndex,publicMetadata:{sourceZone:'discard',sourceIndex,sourceSeat:'actor',abilityName:'Propagation'}})),{kind:'pass',token:'pass'},...(o.opponentPublic.prizeCount===1?[attack]:[])];
class EnergyCard{constructor(name){this.name=name;this.fullName=name;this.energyType=1;this.provides=[name==='Lightning Energy'?2:3];}}
const native={EnergyCard,EnergyType:{BASIC:1},SuperType:{ENERGY:2},CardType:{LIGHTNING:2,PSYCHIC:3},PlayerType:{BOTTOM_PLAYER:1,TOP_PLAYER:2},SlotType:{ACTIVE:1,BENCH:2}};
const c=fullName=>({fullName,name:fullName});
const mkSlot=(pokemon,damage=0)=>({cards:pokemon?[pokemon]:[],getPokemonCard(){return pokemon},damage,energies:{cards:[]},tools:[]});
function fixture(o=funded()){
 const pump=c('Damage Pump LOR'),koko=c('Tapu Koko Prism Star TEU');
 const owner={id:1,active:mkSlot(c(o.ownPublic.active.printing),o.ownPublic.active.damage),bench:o.ownPublic.bench.map(p=>p?mkSlot(c(p.printing),p.damage):mkSlot(null)),hand:{cards:[pump]},discard:{cards:[new EnergyCard('Lightning Energy')]},deck:{cards:[]},prizes:[]};
 const other={id:2,active:mkSlot(c('Shadow Rider Calyrex V CRE')),bench:[],hand:{cards:[]},deck:{cards:[]},discard:{cards:[]},prizes:[]};
 const state={phase:2,players:[owner,other]};
 return {pump,koko,owner,state};
}
class MoveDamagePrompt{constructor(){this.playerId=1;this.message='MOVE_DAMAGE';this.playerType=1;this.slots=[1,2];this.options={min:1,max:2,allowCancel:false,blockedFrom:[],blockedTo:[]};}getPerspectivePlayerId(){return 1}decode(x){return x}validate(){return true}}
class AttachEnergyPrompt{constructor(owner){this.playerId=1;this.message='ATTACH_ENERGY_TO_ACTIVE';this.playerType=1;this.slots=[2];this.filter={superType:2,energyType:1,name:'Lightning Energy'};this.options={min:1,max:2,allowCancel:false,differentTargets:true};this.cardList=owner.discard;}getPerspectivePlayerId(){return 1}decode(x){return x}validate(){return true}}
function proj(f,prompt,sourceCard,effectName){
 return P.projectPrompt({prompt,state:f.state,actorSeat:0,native,provenanceHook:{getPromptProvenance:()=>({sourceKind:'card-effect',sourceCard,effectName})}});
}
function kokofixture(){const f=fixture();f.owner.bench.push(mkSlot(f.koko));return f;}
test('Pump frontier: each whole allocation uses a single physical donor and one/two nonself destinations',()=>{
 const f=kokofixture(),q=proj(f,new MoveDamagePrompt(),f.pump,'Damage Pump');
 assert.equal(q.promptProjection.choices.length,80);
 for(const x of q.choiceByToken.values()){assert.ok(x.length>=1&&x.length<=2);assert.ok(x.every(y=>JSON.stringify(y.from)===JSON.stringify(x[0].from)&&JSON.stringify(y.to)!==JSON.stringify(y.from)));}
 V.validateDecision({kind:'select-choice',token:q.promptProjection.choices[0].token},q.promptProjection,new Set());
});
test('Pump frontier: one counter cannot move two',()=>{const f=kokofixture();f.owner.bench[2].damage=10;const q=proj(f,new MoveDamagePrompt(),f.pump,'Damage Pump');assert.equal(q.promptProjection.choices.filter(x=>x.publicMetadata.sourceIndex===2&&x.publicMetadata.sourceZone==='bench').length,5);});
test('Pump frontier: reject other source',()=>{const f=kokofixture();assert.throws(()=>proj(f,new MoveDamagePrompt(),f.koko,'Dance of the Ancients'));});
test('Koko one Lightning permits each of five benches including itself',()=>{const f=kokofixture(),q=proj(f,new AttachEnergyPrompt(f.owner),f.koko,'Dance of the Ancients');assert.equal(q.promptProjection.choices.length,5);assert.ok([...q.choiceByToken.values()].every(x=>x.length===1));});
test('Koko two Lightning uses distinct cards and targets',()=>{const f=kokofixture();f.owner.discard.cards.push(new EnergyCard('Lightning Energy'));const q=proj(f,new AttachEnergyPrompt(f.owner),f.koko,'Dance of the Ancients');assert.equal(q.promptProjection.choices.length,10);assert.ok([...q.choiceByToken.values()].every(x=>x.length===2&&x[0].index!==x[1].index&&x[0].to.index!==x[1].to.index));});
test('Koko rejects wrong zone',()=>{const f=kokofixture(),p=new AttachEnergyPrompt(f.owner);p.cardList=f.owner.hand;assert.throws(()=>proj(f,p,f.koko,'Dance of the Ancients'));});
test('Koko ignores non-Lightning and requires two benches',()=>{const f=kokofixture();f.owner.discard.cards.push(new EnergyCard('Psychic Energy'));const q=proj(f,new AttachEnergyPrompt(f.owner),f.koko,'Dance of the Ancients');assert.equal(q.promptProjection.choices.length,5);f.owner.bench=[mkSlot(f.koko)];assert.throws(()=>proj(f,new AttachEnergyPrompt(f.owner),f.koko,'Dance of the Ancients'));});
test('Donation refuses opposing bench, unknown Debut, unknown target, and insufficient pumps',()=>{
 for(const change of [o=>o.opponentPublic.bench.push(card('Unown AOR')),o=>o.ownPublic.active.abilitySuppressions=[],o=>o.opponentPublic.active=card('Unknown V',0,150),o=>o.ownHand.pop()]){const o=funded();change(o);assert.equal(A.donationPlan(o),null);}
});
test('Known-resource power search finds Koko + one Lightning + Float pivot',()=>{
 const o=funded();o.ownHand=['Double Colorless Energy SUM','Technical Machine: Crisis Punch PAF','Float Stone BKT','Meloetta ex BLK','Tapu Koko Prism Star TEU'];o.ownPublic.active=card('Unown AOR');o.ownPublic.bench=[];o.ownPublic.discard=['Lightning Energy'];o.ownTurnResources={energyPlayedTurn:0,retreatedTurn:0};
 const line=A.powerPlan(o);assert.ok(line);assert.ok(line.result.actions.some(x=>x.kind==='dance'&&x.lightning===1));assert.ok(line.result.actions.some(x=>x.kind==='retreat'));assert.equal(policy().decide(req(o,rootRows(o))).token,'h3');
});
test('Power search finds Escape Rope away from starting Meloetta then returns it funded',()=>{
 const o=funded();o.ownPublic.active.energies=[];o.ownPublic.active.tools=[];o.ownPublic.bench=[];o.ownPublic.discard=['Lightning Energy'];o.ownHand=['Double Colorless Energy SUM','Technical Machine: Crisis Punch PAF','Float Stone BKT','Tapu Koko Prism Star TEU','Escape Rope BST','Unown AOR'];o.ownTurnResources={energyPlayedTurn:0,retreatedTurn:0};const line=A.powerPlan(o);assert.ok(line);assert.ok(line.result.actions.some(x=>x.kind==='escape-rope'));assert.ok(line.result.actions.some(x=>x.kind==='dance'));assert.ok(line.result.actions.some(x=>x.kind==='retreat'));
});
test('Full actor-root / projected-prompt trace: three Pumps, four Propagations, final Crisis Punch',()=>{
 const o=funded(),worker=policy(),donations=[];let finish=false,propagations=0;
 for(let i=0;i<20;i++){
  const rows=rootRows(o),d=worker.decide(req(o,rows));assert.equal(d.kind,'select-action');if(d.token==='finish'){finish=true;break;}
  const x=rows.find(x=>x.token===d.token);assert.ok(x);
  if(x.kind==='use-ability'){o.ownHand.push(o.ownPublic.discard.splice(x.publicMetadata.sourceIndex,1)[0]);propagations++;continue;}
  if(x.actorPrinting==='Exeggcute PLF'){o.ownHand.splice(x.publicMetadata.handIndex,1);let idx=o.ownPublic.bench.findIndex(x=>!x);if(idx<0)idx=o.ownPublic.bench.length;o.ownPublic.bench[idx]=card('Exeggcute PLF',20,30);continue;}
  assert.equal(x.actorPrinting,'Damage Pump LOR');
  const f=fixture(o),q=proj(f,new MoveDamagePrompt(),f.pump,'Damage Pump');const d2=worker.decide(req(o,[],q.promptProjection));V.validateDecision(d2,q.promptProjection,new Set());
  const moves=q.choiceByToken.get(d2.token);assert.ok(moves);const slot=x=>x.slot===1?o.ownPublic.active:o.ownPublic.bench[x.index];
  for(const move of moves){slot(move.from).damage-=10;slot(move.to).damage+=10;}
  o.ownHand.splice(x.publicMetadata.handIndex,1);
  for(const sl of slots(o)){if(sl.p.damage>=sl.p.hp){assert.equal(sl.zone,'bench');o.ownPublic.discard.push(sl.p.printing);o.ownPublic.bench[sl.index]=null;o.opponentPublic.prizeCount--;}}
  donations.push(o.opponentPublic.prizeCount);
 }
 assert.equal(finish,true);assert.deepEqual(donations,[4,2,1]);assert.equal(propagations,4);
});
test('A pending Damage Pump choice cannot be used without matching root context',()=>{
 const o=funded(),f=fixture(o),q=proj(f,new MoveDamagePrompt(),f.pump,'Damage Pump');assert.equal(policy().decide(req(o,[],q.promptProjection)).kind,'abstain');
 const w=policy();w.decide(req(o,rootRows(o)));o.ownPublic.bench[2].damage=10;assert.equal(w.decide(req(o,[],q.promptProjection)).kind,'abstain');
});
test('Funded Crisis Punch beats more setup when opponent has one Prize',()=>{const o=funded();o.opponentPublic.prizeCount=1;assert.equal(policy().decide(req(o,rootRows(o))).token,'finish');});

test('Exact candidate singleton Trevenant survives Fighting resistance only, not Psychic Crisis Punch',()=>{
 const o=funded();o.opponentPublic.active=card('Trevenant & Dusknoir-GX SMP',0,270,{printed:{resistance:[{type:'FIGHTING',value:-20}]}});const proof=A.terminalReady(o);assert.ok(proof);assert.equal(proof.damage,280);assert.equal(proof.certificate.terminal,true);
});
test('Iron Thorns requires actual Debut restoration, not a discarded Cologne',()=>{
 const o=funded();o.opponentPublic.active=card('Iron Thorns ex TWM',0,230,{abilities:['Initialization']});o.ownPublic.active.abilitySuppressions=[{abilityName:'Debut Performance',suppressed:true}];o.ownPublic.discard=['Canceling Cologne ASR'];assert.equal(A.terminalReady(o),null);o.ownHand.push('Canceling Cologne ASR');const d=policy().decide(req(o,rootRows(o)));assert.equal(d.token,'h3');
});
