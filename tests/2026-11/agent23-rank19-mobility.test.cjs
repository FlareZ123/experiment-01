'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),m=require('../../simulation/evaluation/2026-11/agent23-rank19-mobility.cjs');
const B='Raging Bolt ex TEF',H='Ho-Oh EX DRX',A='Arceus & Dialga & Palkia GX CEC',M='Galarian Moltres V CRE',S='Sandy Shocks ex PAR',L='Latias ex SSP',F='Flutter Mane TEF',DDE='Double Dragon Energy ROS',FS='Float Stone BKT',G='Guzma BUS',VS='VS Seeker PHF',d='Darkness Energy MEE',l='Lightning Energy MEE',f='Fighting Energy MEE',SR='Shadow Rider Calyrex VMAX CRE',SC='Shadow Rider Calyrex V CRE',W='Wobbuffet PHF';
const mon=(printing,energies=[],hp=160,damage=0,extra={})=>({printing,energies,hp,damage,tools:[],specialConditions:[],printed:{retreatCost:[0,0]},publicRestrictions:{},abilitySuppressions:[],...extra});
const target=(printing=SR,hp=320,damage=0)=>mon(printing,[],hp,damage);
const caps={discard:true,attach:true};
const retreat=(i,printing)=>({kind:'retreat',token:'retreat'+i,targetPrinting:printing,publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:i,benchIndex:i}});
const play=(printing,index,targetPrinting,zone='active',targetIndex=0)=>({kind:'play-card',token:'play'+index,actorPrinting:printing,targetPrinting,publicMetadata:{handIndex:index,targetSeat:'actor',targetZone:zone,targetIndex}});
const attack=(printing,attackName)=>({kind:'attack',token:'attack',actorPrinting:printing,attackName,publicMetadata:{attackCostPayable:true}});
function req(seat,active,bench,hand,items,op=target(),opbench=[],extra={}){return {role:'opponent',seat,observation:{actorSeat:seat,globalTurn:4,ownTurnResources:{retreatedTurn:0,supporterTurn:0},ownHand:hand,ownPublic:{active,bench,discard:[],stadium:[],prizeCount:6,publicTurnRestrictions:{gxUsed:true}},opponentPublic:{active:op,bench:opbench,stadium:[],prizeCount:6},...extra},actionFrontier:{items}};}
const select=token=>({kind:'select-action',token});
for(const seat of [0,1]){
 test('Float Stone goes to stranded Ho-Oh, not a benched recipient seat '+seat,()=>{
  const active=mon(H,[d,l,f],160),b=[mon(L),mon(B,[DDE],240),mon(S,[f,f],220),mon(M,[d],220)];
  const r=req(seat,active,b,[FS],[play(FS,0,L,'bench',0),play(FS,0,H)]);
  assert.deepEqual(m.root(r,caps),select('play0'));
  assert.equal(m.root(r,{discard:false,attach:false}),null);
  // Distinguish duplicate token in this synthetic frontier by checking a
  // wrong-target-only frontier separately.
  r.actionFrontier.items=[play(FS,0,L,'bench',0)];
  assert.equal(m.root(r,caps),null);
 });
 test('funded Bellowing recipient is exact physical index after Float Stone seat '+seat,()=>{
  const a=mon(H,[d,l,f],160,0,{tools:[FS]}),b=[mon(S,[f,f],220),mon(B,[DDE],240),mon(M,[d],220)];
  const r=req(seat,a,b,[],[retreat(0,S),retreat(1,B),retreat(2,M)]);
  // 6 attached Basics, enough for a 350 damage knockout.
  assert.deepEqual(m.root(r,caps),select('retreat1'));
  assert.equal(m.root(r,{discard:false,attach:false}),null);
 });
 test('Latias Skyliner already live preserves Float Stone seat '+seat,()=>{
  const a=mon(H,[d,l,f],160),b=[mon(L,[],210,0,{abilitySuppressions:[{abilityName:'Skyliner',suppressed:false}]}),mon(B,[DDE],240),mon(M,[d,l],220)];
  const r=req(seat,a,b,[FS],[play(FS,0,H),retreat(1,B)]);
  assert.deepEqual(m.root(r,caps),select('retreat1'));
 });
 test('terminal direct hit is not replaced by mobility seat '+seat,()=>{
  const a=mon(M,[d,d,l],220),r=req(seat,a,[mon(B,[DDE],240),mon(H,[f,l,d,f],160)],[FS],[play(FS,0,M),attack(M,'Aura Burn')]);
  r.observation.ownPublic.prizeCount=3;
  assert.equal(m.root(r,caps),null);
 });
 test('retreat already used or Temple prevents false DDE promotion seat '+seat,()=>{
  const a=mon(H,[d,l,f],160),b=[mon(B,[DDE],240),mon(M,[d,l],220)],r=req(seat,a,b,[FS],[play(FS,0,H),retreat(0,B)]);
  r.observation.ownTurnResources.retreatedTurn=4;assert.equal(m.root(r,caps),null);
  r.observation.ownTurnResources.retreatedTurn=0;r.observation.opponentPublic.stadium=['Temple of Sinnoh ASR'];
  assert.equal(m.root(r,caps),null);
 });
 test('Guzma prioritizes terminal indexed VMAX target with Bolt-funded donor pool seat '+seat,()=>{
  const a=mon(H,[d,l,f],160),b=[mon(B,[DDE],240),mon(M,[d,l],220)],r=req(seat,a,b,[G],[play(G,0,undefined)],target(W,110),[target(SC,210),target(SR,320)]);
  r.observation.ownPublic.prizeCount=3;
  assert.deepEqual(m.root(r,caps),select('play0'));
  const c=(printing,i,ownerSeat)=>({kind:'pokemon',token:ownerSeat+i,printing,publicMetadata:{ownerSeat,targetZone:'bench',benchIndex:i}});
  r.prompt={promptType:'ChoosePokemonPrompt',source:{sourceKind:'card-effect',effectName:'Guzma',sourcePrinting:G},publicMetadata:{minimumCount:1,maximumCount:1},choices:[c(SC,0,'opponent'),c(SR,1,'opponent')]};
  assert.deepEqual(m.prompt(r,caps),{kind:'select-choices',tokens:['opponent1']});
  r.observation.opponentPublic.active=target(SR,320);
  r.prompt.choices=[c(B,0,'actor'),c(M,1,'actor')];
  assert.deepEqual(m.prompt(r,caps),{kind:'select-choices',tokens:['actor0']});
 });
 test('ADP pre-GX mobility works without draft prompt capabilities seat '+seat,()=>{
  const a=mon(F),b=[mon(A,[DDE],280)],r=req(seat,a,b,[FS],[play(FS,0,F)]);
  r.observation.ownPublic.publicTurnRestrictions.gxUsed=false;
  assert.deepEqual(m.root(r,{discard:false,attach:false}),select('play0'));
 });
 test('Sandy resistance is not a false knockout, Energy Drive uses actual units seat '+seat,()=>{
  const a=mon(S,[f,f,l],220),o=req(seat,a,[],[],[],target(SC,210,20)).observation;
  const s=m.bestAttack(o,o.ownPublic,o.opponentPublic.active,caps);
  assert.equal(s.damage,170);assert.equal(s.lethal,false);
  const lele=mon('Tapu Lele-GX GRI',[d,l],170);
  const t=mon(SR,Array(8).fill('Psychic Energy MEE'),320,120);
  const own={...o.ownPublic,active:lele};
  const x=m.bestAttack(o,own,t,caps);assert.equal(x.damage,200);assert.equal(x.lethal,true);
 });
}
