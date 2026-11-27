'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const l=require('../../simulation/evaluation/2026-11/agent23-rank19-lock-counterplay.cjs');
const B='Raging Bolt ex TEF',M='Galarian Moltres V CRE',F='Flutter Mane TEF',W='Wobbuffet PHF',H='Stealthy Hood UNB',T='Temple of Sinnoh ASR',D='Double Dragon Energy ROS',E='Darkness Energy MEE',A='Marshadow UNB',FB='Field Blower GRI',SK='Sky Field ROS',L='Latias ex SSP';
const p=(printing,hp=120,extra={})=>({printing,hp,damage:0,energies:[],tools:[],abilitySuppressions:[],specialConditions:[],printed:{retreatCost:['Colorless']},...extra});
const sup=(abilityName,suppressed=false)=>({abilityName,suppressed});
const own=(active,bench,extra={})=>({active,bench,prizeCount:6,stadium:[],discard:[E],lostZone:[],publicTurnRestrictions:{gxUsed:false},...extra});
const enemy=(tools=[H],extra={})=>({active:p(W,110,{tools,abilitySuppressions:[sup('Bide Barricade')]}),bench:[],prizeCount:6,stadium:[T],publicTurnRestrictions:{vstarUsed:false},...extra});
const a=(kind,token,actorPrinting,meta={},targetPrinting)=>({kind,token,actorPrinting,publicMetadata:meta,targetPrinting});
const play=(token,printing,index)=>a('play-card',token,printing,{handIndex:index});
function r(seat,active,bench,items,hand=[FB,SK],op=enemy(),extra={}){return {role:'opponent',seat,observation:{actorSeat:seat,globalTurn:4,ownTurnResources:{retreatedTurn:0},ownPublic:own(active,bench),opponentPublic:op,ownHand:hand,...extra},actionFrontier:{items}};}
const molt=p(M,220,{abilitySuppressions:[sup('Direflame Wings',true)]});
const bolt=p(B,240,{energies:[D]});
const flutter=p(F,90);
const reset=a('use-ability','reset',A,{abilityName:'Resetting Hole',sourceSeat:'actor',sourceZone:'bench',sourceIndex:0});
const blower=play('blower',FB,0),sky=play('sky',SK,1);
const sel=token=>({kind:'select-action',token});
const caps={discard:true,attach:true};
function prompt(req,type,choices,meta){return {...req,prompt:{promptType:type,source:{sourceKind:'card-effect',sourcePrinting:FB,effectName:'Field Blower'},choices,publicMetadata:meta}};}
function target(token,printing,ownerSeat,targetZone,i=0){return {kind:'pokemon',token,printing,publicMetadata:{ownerSeat,targetZone,isOwnerVisible:true,...(targetZone==='bench'?{benchIndex:i}:{slotIndex:0})}};}
for(const seat of [0,1]){
 test('dual lock: blower removes Temple and Hood before pivot',()=>{
  const req=r(seat,bolt,[p(A,80),flutter,molt],[reset,blower,sky]);
  assert.deepEqual(l.root(req,caps),sel('blower'));
  assert.deepEqual(l.prompt(prompt(req,'SelectOptionPrompt',[{kind:'option',token:'both',publicMetadata:{choiceIndex:0}},{kind:'option',token:'tools',publicMetadata:{choiceIndex:1}}],{selectionType:'option'})),{kind:'select-choice',token:'both'});
  assert.deepEqual(l.prompt(prompt(req,'ChoosePokemonPrompt',[target('wobb',W,'opponent','active'),target('own',B,'actor','active')],{selectionType:'pokemon',minimumCount:0,maximumCount:1})),{kind:'select-choices',tokens:['wobb']});
 });
 test('Temple without effective Hood combo uses Resetting Hole before spending item',()=>{
  const req=r(seat,bolt,[p(A,80)],[reset,blower,sky]);
  assert.deepEqual(l.root(req,caps),sel('reset'));
 });
 test('Temple irrelevant to basic-only hand and board is not removed blindly',()=>{
  const req=r(seat,molt,[p(A,80)],[reset,blower,sky]);
  assert.equal(l.root(req,caps),null);
 });
 test('unprotected live Wobbuffet can be disabled using exact Flutter retreat',()=>{
  const req=r(seat,p(B,240,{printed:{retreatCost:[]}}),[flutter,molt],[a('retreat','pivot',B,{targetSeat:'actor',targetZone:'bench',targetIndex:0,benchIndex:0},F)],[],enemy([],{stadium:[]}));
  assert.deepEqual(l.root(req,caps),sel('pivot'));
  assert.equal(l.root({...req,observation:{...req.observation,opponentPublic:enemy([H],{stadium:[]})}},caps),null);
 });
 test('do not spend a lock answer instead of a paid terminal Aura Burn',()=>{
  const ready=p(M,220,{energies:[E,E,E]});
  const req=r(seat,ready,[flutter], [a('attack','burn',M,{attackCostPayable:true}),blower], [FB],enemy());
  req.actionFrontier.items[0].attackName='Aura Burn';req.observation.ownPublic.prizeCount=1;
  assert.equal(l.root(req,caps),null);
 });
 test('Field Blower never removes own valuable tool even with optional second selection',()=>{
  const req=r(seat,p(B,240,{tools:['Float Stone BKT']}),[flutter,molt],[],[],enemy([H],{bench:[p('Shadow Rider Calyrex V CRE',210,{tools:['Forest Seal Stone SIT']})]}));
  const pr=prompt(req,'ChoosePokemonPrompt',[target('own',B,'actor','active'),target('hood',W,'opponent','active'),target('fss','Shadow Rider Calyrex V CRE','opponent','bench',0)],{selectionType:'pokemon',minimumCount:0,maximumCount:2});
  assert.deepEqual(l.prompt(pr),{kind:'select-choices',tokens:['hood','fss']});
  pr.prompt.publicMetadata.maximumCount=1;pr.prompt.choices=[target('own',B,'actor','active'),{kind:'empty-selection',token:'none'}];
  assert.deepEqual(l.prompt(pr),{kind:'select-choice',token:'none'});
 });
}
