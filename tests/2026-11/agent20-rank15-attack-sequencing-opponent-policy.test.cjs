'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION}=require('../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
const mon=(printing,o={})=>({printing,hp:o.hp??130,damage:o.damage??0,energies:o.energies??[],tools:o.tools??[],printed:{stage:'BASIC',weakness:[],resistance:[]}});
const board=(active,bench=[],other={})=>({active,bench,stadium:[],discard:[],prizeCount:3,...other});
const req=()=>({role:'opponent',seat:0,prompt:null,observation:{actorSeat:0,globalTurn:4,ownHand:[],ownPublic:board(mon('Bunnelby PRC 121')),opponentPublic:board(mon('Mimikyu GRI 58',{hp:230})),ownTurnResources:{supporterPlayedTurn:0}},actionFrontier:{items:[]}});
const decide=r=>createPolicy({role:'opponent',seat:0,policyVersion:POLICY_VERSION,config:{}}).decide(r);
test('nonterminal Gale/Spiky is deferred until Basic Oddish setup is played',()=>{
 const r=req();r.observation.ownPublic.active=mon('Mega Lopunny ex PFL 84',{energies:['Double Colorless Energy SUM 136']});
 r.observation.ownHand=['Oddish UNB 5'];r.actionFrontier.items=[
 {kind:'attack',token:'gale',attackName:'Gale Thrust'},
 {kind:'attack',token:'spiky',attackName:'Spiky Hopper'},
 {kind:'play-card',token:'oddish',actorPrinting:'Oddish UNB 5'}];
 assert.deepEqual(decide(r),{kind:'select-action',token:'oddish'});
 r.actionFrontier.items.splice(2,1);
 assert.deepEqual(decide(r),{kind:'select-action',token:'spiky'});
});
test('immediate terminal Spiky KO outranks playing a new Basic',()=>{
 const r=req();r.observation.ownPublic.active=mon('Mega Lopunny ex PFL 84',{energies:['Double Colorless Energy SUM 136']});
 r.observation.ownPublic.prizeCount=1;r.observation.opponentPublic.active.hp=100;
 r.observation.ownHand=['Oddish UNB 5'];r.actionFrontier.items=[
 {kind:'attack',token:'spiky',attackName:'Spiky Hopper'},
 {kind:'play-card',token:'oddish',actorPrinting:'Oddish UNB 5'}];
 assert.deepEqual(decide(r),{kind:'select-action',token:'spiky'});
});
test('Budew early Itchy Pollen waits for legal Oddish Bench and evolution actions',()=>{
 const r=req();r.observation.globalTurn=2;
 r.observation.ownPublic.active=mon('Budew ASC 16');
 r.observation.ownHand=['Oddish UNB 5'];
 r.actionFrontier.items=[{kind:'attack',token:'itch',attackName:'Itchy Pollen'},
 {kind:'play-card',token:'oddish',actorPrinting:'Oddish UNB 5'}];
 assert.deepEqual(decide(r),{kind:'select-action',token:'oddish'});
 r.actionFrontier.items.splice(1,1);
 assert.deepEqual(decide(r),{kind:'select-action',token:'itch'});
});
test('Bunnelby nonterminal Burrow waits for missing Oddish via Buddy-Buddy Poffin',()=>{
 const r=req();r.observation.ownPublic.active.energies=['Grass Energy BLW 105'];
 r.observation.opponentPublic.deckCount=12;r.observation.ownPublic.deckCount=20;
 r.observation.ownHand=['Buddy-Buddy Poffin TEF 144'];
 r.actionFrontier.items=[{kind:'attack',token:'burrow',attackName:'Burrow'},
  {kind:'play-card',token:'poffin',actorPrinting:'Buddy-Buddy Poffin TEF 144'}];
 assert.deepEqual(decide(r),{kind:'select-action',token:'poffin'});
 r.actionFrontier.items.pop();
 assert.deepEqual(decide(r),{kind:'select-action',token:'burrow'});
});
test('funded Bunnelby TM Evolution waits for safe Gloom hand evolution',()=>{
 const r=req();r.observation.ownPublic.active.tools=['Technical Machine: Evolution PAR 178'];
 r.observation.ownPublic.active.energies=['Grass Energy BLW 105'];
 r.observation.ownPublic.bench=[mon('Oddish UNB 5'),mon('Gloom UNB 7')];
 r.observation.ownHand=['Vileplume AOR 3'];
 r.actionFrontier.items=[{kind:'attack',token:'tm',attackName:'Evolution'},
 {kind:'play-card',token:'aor',actorPrinting:'Vileplume AOR 3',targetPrinting:'Gloom UNB 7'}];
 assert.deepEqual(decide(r),{kind:'select-action',token:'aor'});
 r.actionFrontier.items.pop();
 assert.deepEqual(decide(r),{kind:'select-action',token:'tm'});
});
