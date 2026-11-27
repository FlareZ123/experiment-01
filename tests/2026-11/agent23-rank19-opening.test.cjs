'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),opening=require('../../simulation/evaluation/2026-11/agent23-rank19-opening.cjs');
const A='Arceus & Dialga & Palkia GX CEC',B='Raging Bolt ex TEF',M='Galarian Moltres V CRE',F='Flutter Mane TEF',L='Latias ex SSP',D='Dedenne-GX UNB',S='Sudowoodo GRI',C='Crobat V DAA',H='Ho-Oh-EX DRX',E='Double Dragon Energy ROS',X='Darkness Energy MEE';
const obs=(seat,h,active=null,bench=[],extras={})=>({actorSeat:seat,phase:1,globalTurn:0,turnSeat:1-seat,ownHand:h,ownPublic:{active:active?{printing:active}:null,bench:bench.map(p=>({printing:p})),deckCount:47},...extras});
const source=effectName=>({classification:'actor-choice',sourceKind:'engine',sourcePrinting:null,effectName});
function card(h,i){return {kind:'card',token:'card'+i,printing:h[i],publicMetadata:{selectionIndex:i,ownerSeat:'actor',sourceZone:'hand',isOwnerVisible:true}};}
function req(seat,h,inds,minimumCount=1,active=null,bench=[],extras={}){return {role:'opponent',seat,observation:obs(seat,h,active,bench,extras),prompt:{promptType:'ChooseCardsPrompt',source:source('CHOOSE_STARTING_POKEMONS'),publicMetadata:{selectionType:'card-combination',ownerSeat:'actor',sourceZone:'hand',isOwnerVisible:true,minimumCount,maximumCount:Math.min(6,inds.length),allowCancel:false},choices:[...inds.map(i=>card(h,i)),...(minimumCount===0?[{kind:'empty-selection',token:'empty'}]:[])]}};}
const out=(...tokens)=>({kind:'select-choices',tokens});
for(const seat of [0,1]){
 test('second on pre-deal coin choice seat '+seat,()=>assert.deepEqual(opening.decide({role:'opponent',seat,observation:obs(seat,[]),prompt:{promptType:'ConfirmPrompt',source:source('GO_FIRST'),publicMetadata:{selectionType:'confirm'},choices:[{kind:'confirm',token:'Y',label:'Yes'},{kind:'confirm',token:'N',label:'No'}]}}),{kind:'select-choice',token:'N'}));
 test('select ADP before hand-index earlier basics and reserve draw engines seat '+seat,()=>{
  const h=[F,D,L,A,B,E,M];
  assert.deepEqual(opening.decide(req(seat,h,[0,1,2,3,4,6])),out('card3','card2','card4','card6'));
 });
 test('Flutter disruption starter without DDE, bench Moltres/Latias seat '+seat,()=>{
  const h=[D,F,M,L,X,S,B];
  assert.deepEqual(opening.decide(req(seat,h,[0,1,2,3,5,6])),out('card1','card3','card2','card6'));
 });
 test('forced support start reserves other draw support seat '+seat,()=>{
  assert.deepEqual(opening.decide(req(seat,[D,C,H],[0,1,2])),out('card1'));
 });
 test('fragile only starter with draw backup seat '+seat,()=>{
  assert.deepEqual(opening.decide(req(seat,[F,D],[0,1])),out('card0','card1'));
 });
 test('post-bonus chooses only new strategic basics seat '+seat,()=>{
  const h=[L,B,C,M,X];
  assert.deepEqual(opening.decide(req(seat,h,[0,1,2,3],0,A,[L])),out('card3','card1'));
 });
 test('post-bonus preserves draw support and no active replacement seat '+seat,()=>{
  assert.deepEqual(opening.decide(req(seat,[D,C,H],[0,1,2],0,A,[L,B,M])),{kind:'select-choice',token:'empty'});
 });
 test('mulligan bonus takes maximum without depleting deck seat '+seat,()=>{
  const request={role:'opponent',seat,observation:obs(seat,[],A,[],{ownPublic:{active:{printing:A},bench:[],deckCount:2}}),prompt:{promptType:'SelectPrompt',source:source('WANT_TO_DRAW_CARDS'),publicMetadata:{selectionType:'option',allowCancel:false},choices:[{kind:'option',token:'2',label:'Draw 2 card(s)'},{kind:'option',token:'1',label:'Draw 1 card(s)'},{kind:'option',token:'0',label:'Draw 0 card(s)'}]}};
  assert.deepEqual(opening.decide(request),{kind:'select-choice',token:'1'});
 });
 test('reject malformed physical hand index/foreign source/phase seat '+seat,()=>{
  const r=req(seat,[A,L,E],[0,1]);r.prompt.choices[0].publicMetadata.selectionIndex=1;assert.equal(opening.decide(r),null);
  const s=req(seat,[A,L,E],[0,1]);s.prompt.source.sourceKind='card-effect';assert.equal(opening.decide(s),null);
  const t=req(seat,[A,L,E],[0,1]);t.observation.phase=2;assert.equal(opening.decide(t),null);
 });
}
