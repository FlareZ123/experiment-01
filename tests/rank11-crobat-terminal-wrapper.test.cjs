'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {withRank11CrobatTerminalPolicy}=
  require('../simulation/twinleaf/rank11-crobat-terminal-policy.cjs');

class StubAi { constructor(id){this.client={id};} decodeNextAction(){return 'ordinary';} }
class PlayCardAction { constructor(...args){this.args=args;} }
class ResolvePromptAction { constructor(...args){this.args=args;} }
class UseStadiumAction { constructor(...args){this.args=args;} }
class UseAbilityAction { constructor(...args){this.args=args;} }
class RetreatAction { constructor(...args){this.args=args;} }
class AttackAction { constructor(...args){this.args=args;} }
/** @param {string} name */
function fakeEngine(name){
 const m={
  'simple-bot/simple-tactics-ai':{SimpleTacticsAi:StubAi},
  'game/store/state/state':{GamePhase:{PLAYER_TURN:'turn'}},
  'game/store/actions/play-card-action':{PlayCardAction,
    PlayerType:{ANY:0,BOTTOM_PLAYER:1},SlotType:{BOARD:0,BENCH:1}},
  'game/store/actions/resolve-prompt-action':{ResolvePromptAction},
  'game/store/actions/game-actions':{UseStadiumAction,UseAbilityAction,RetreatAction,AttackAction}
 };
 assert.ok(m[name], 'Known pinned import: '+name);
 return m[name];
}
/** @param {string} fullName @param {number} hp */
function pokemon(fullName,hp=210){return {fullName,name:fullName.replace(/ (DAA|SSP|UNM|BKP)$/,''),hp};}
/** @param {object|null} p @param {number} energy @param {string[]} tools */
function slot(p,energy=0,tools=[]){return {
 getPokemonCard:()=>p,energies:{cards:Array.from({length:energy},()=>({name:'Darkness Energy'}))},
 tools:tools.map(fullName=>({fullName}))};}
/** @param {{powered?:boolean,bench?:boolean}} [settings] */
function state({powered=true,bench=false}={}){
 const crobat=slot(pokemon('Crobat V DAA'),powered?2:1);
 const own={id:11,prizes:Array.from({length:6},(_,i)=>({cards:i<2?[{}]:[]})),
  active:bench?slot(pokemon('Mega Absol ex MEE')):crobat,
  bench:bench?[crobat,slot(pokemon('Latias ex SSP'),0,['Forest Seal Stone SIT'])]:[],
  hand:{cards:[]},discard:{cards:[{name:'Darkness Energy'}]},
  stadium:{cards:[{fullName:'Shopping Center EVS'}]},usedVSTAR:false};
 const opponent={id:22,active:slot(pokemon('Mewtwo & Mew-GX UNM',270))};
 opponent.active.damage=200;
 return {activePlayer:0,phase:'turn',players:[own,opponent],prompts:[],turn:23};
}
test('reachable owner attack skips hidden-score generic evaluation',()=>{
 const original=Object.getOwnPropertyDescriptor(StubAi.prototype,'decodeNextAction');
 let calls=0;
 StubAi.prototype.decodeNextAction=function(){calls++;throw new Error('hidden scoring was invoked');};
 try{
  const s=state();
  const p=withRank11CrobatTerminalPolicy(0,()=>new StubAi(11).decodeNextAction(s),
    {resolveEngine:fakeEngine});
  assert.ok(p.result instanceof AttackAction);
  assert.deepEqual(p.result.args,[11,'Venomous Fang']);
  assert.equal(calls,0);
  assert.equal(p.audit.attempts[0].status,'attack-declared');
 }finally{Object.defineProperty(StubAi.prototype,'decodeNextAction',original);}
});
test('unreachable state delegates exactly one ordinary decision',()=>{
 const original=Object.getOwnPropertyDescriptor(StubAi.prototype,'decodeNextAction');
 let calls=0;StubAi.prototype.decodeNextAction=function(){calls++;return 'ordinary';};
 try{
  const s=state();s.players[1].active.damage=0;
  const p=withRank11CrobatTerminalPolicy(0,()=>new StubAi(11).decodeNextAction(s),
    {resolveEngine:fakeEngine});
  assert.equal(p.result,'ordinary');assert.equal(calls,1);
  assert.deepEqual(p.audit.attempts,[]);
 }finally{Object.defineProperty(StubAi.prototype,'decodeNextAction',original);}
});
test('transfer route chooses real Store stadium action without generic scoring',()=>{
 const original=Object.getOwnPropertyDescriptor(StubAi.prototype,'decodeNextAction');
 let calls=0;StubAi.prototype.decodeNextAction=function(){calls++;return 'ordinary';};
 try{
  const s=state({powered:false,bench:true});
  const p=withRank11CrobatTerminalPolicy(0,()=>new StubAi(11).decodeNextAction(s),
    {resolveEngine:fakeEngine});
  assert.ok(p.result instanceof UseStadiumAction);
  assert.equal(p.audit.attempts[0].gate.mode,'transfer-stone');
  assert.equal(calls,0);
 }finally{Object.defineProperty(StubAi.prototype,'decodeNextAction',original);}
});
test('source-owner gate remains symmetric in physical seat 1',()=>{
 const original=Object.getOwnPropertyDescriptor(StubAi.prototype,'decodeNextAction');
 let calls=0;StubAi.prototype.decodeNextAction=function(){calls++;return 'ordinary';};
 try{
  const s=state();s.players.reverse();s.activePlayer=1;
  const p=withRank11CrobatTerminalPolicy(1,()=>new StubAi(11).decodeNextAction(s),
    {resolveEngine:fakeEngine});
  assert.ok(p.result instanceof AttackAction);
  assert.equal(p.audit.sourceSeat,1);assert.equal(calls,0);
 }finally{Object.defineProperty(StubAi.prototype,'decodeNextAction',original);}
});
test('temporary patch is reverted even when its child throws',()=>{
 const original=Object.getOwnPropertyDescriptor(StubAi.prototype,'decodeNextAction');
 assert.throws(()=>withRank11CrobatTerminalPolicy(0,
  ()=>{throw new Error('forced child exception');},
  {resolveEngine:fakeEngine}),/forced child exception/);
 assert.equal(StubAi.prototype.decodeNextAction,original.value);
});
