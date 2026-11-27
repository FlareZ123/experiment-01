'use strict';
const test=require('node:test'), assert=require('node:assert/strict');
const h=require('../../simulation/evaluation/2026-11/agent26-rank13-energy-root.cjs');
const base=require('../../simulation/evaluation/2026-11/agent24-rank13-regidrago-opponent-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const {G,F,D,V,S,DIA}=h;
const p=(printing,energies=[])=>({printing,energies,printed:{types:['Dragon']},hp:printing===V?220:280,damage:0});
const budew={printing:'Budew ASC 16',energies:[],printed:{types:['Grass']},hp:30,damage:0};
const pass={token:'pass',kind:'pass',label:'Pass turn'};
const attack=(name,token=name)=>({kind:'attack',token,label:'Attack '+name,attackName:name});
const attach=(token,printing,handIndex,target,zone='active',targetIndex=0)=>({kind:'play-card',token,label:'Play '+printing,actorPrinting:printing,targetPrinting:target,publicMetadata:{cardType:'energy',handIndex,targetSeat:'actor',targetZone:zone,targetIndex,isOwnerVisible:true}});
const req=({active=p(S,[D]),bench=[],hand=[G],items=[attach('g',G,0,S),pass],discard=['Noivern ex PAL 153'],seat=0,resources={},restrictions={},opponentStadium=[]}={})=>({
 role:'opponent',seat,prompt:null,observation:{actorSeat:seat,globalTurn:3,ownHand:hand,ownPublic:{active,bench:[...bench,...Array(Math.max(0,5-bench.length)).fill(null)],discard,stadium:[],publicTurnRestrictions:restrictions},opponentPublic:{stadium:opponentStadium,handCount:5},ownTurnResources:{energyPlayedTurn:false,...resources}},actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items}
});
const choose=r=>h.chooseRank13WithEnergy(r,base);
test('actual rank13 v1 passes with a payable, completion-critical attachment; proposed composition selects it in both seats',()=>{
 for(const seat of [0,1]){
  const r=req({seat});
  assert.equal(base.scoreAction(r.actionFrontier.items[0],r),0);
  assert.deepEqual(base.bestAction(r),{kind:'select-action',token:'pass'});
  const decision=choose(r);
  assert.deepEqual(decision,{kind:'select-action',token:'g'});
  const tokens=protocol.validateFrontier(r.actionFrontier);
  // Frontier validation returns the exact actionable-token set.
  protocol.validateDecision(decision,null,tokens);
 }
});
test('DDE supplies two flexible units, not six simultaneous typed units',()=>{
 assert.equal(h.apexGap(h.energyUnits([D])),1);
 assert.equal(h.apexGap(h.energyUnits([D,F])),0);
 assert.equal(h.apexGap(h.energyUnits([D,G])),0);
 assert.equal(h.apexGap(h.energyUnits([D,D])),0);
 assert.equal(h.apexGap(h.energyUnits([F,F,F])),2);
 assert.equal(h.apexGap(h.energyUnits([G,G,G])),1);
});
test('basic completion preserves DDE for the second attacker',()=>{
 const r=req({hand:[D,F],items:[attach('dde',D,0,S),attach('fire',F,1,S),pass]});
 assert.equal(choose(r).token,'fire');
});
test('when no basic completes, choose DDE completing two missing units',()=>{
 const r=req({active:p(S,[F]),hand:[F,D],items:[attach('fire',F,0,S),attach('dde',D,1,S),pass]});
 assert.equal(choose(r).token,'dde');
});
test('do not overattach to a fully funded active or replace a ready Apex with a speculative backup attachment',()=>{
 const r=req({active:p(S,[D,G]),bench:[p(V,[])],hand:[D],items:[attach('excess',D,0,S),attach('backup',D,0,V,'bench',0),attack('Apex Dragon','apex'),pass]});
 assert.equal(h.assessment(r.actionFrontier.items[0],r),null);
 assert.equal(choose(r).token,'apex');
});
test('charge the precise benched Regidrago before the Budew lock attack',()=>{
 const r=req({active:budew,bench:[p(V,[]),p(V,[D])],hand:[G],items:[attach('first',G,0,V,'bench',0),attach('second',G,0,V,'bench',1),attack('Itchy Pollen','lock'),pass]});
 assert.equal(choose(r).token,'second');
 assert.equal(h.rank13EnergyCandidates(r)[0].newGap,0);
});
test('first attach DDE to a fresh Regidrago V over a basic Energy',()=>{
 const r=req({active:p(V,[]),hand:[G,D],items:[attach('grass',G,0,V),attach('dde',D,1,V),pass]});
 assert.equal(choose(r).token,'dde');
});
test('Temple of Sinnoh makes attached DDE Colorless; basic can still complete a colored cost',()=>{
 const r=req({active:p(S,[D,G,G]),hand:[D,F],items:[attach('dde',D,0,S),attach('fire',F,1,S),pass],opponentStadium:['Temple of Sinnoh ASR 155']});
 assert.equal(h.apexGap(h.energyUnits([D,G,G],true)),1);
 assert.equal(choose(r).token,'fire');
});
test('Temple suppression restores two flexible DDE units',()=>{
 const r=req({active:p(S,[D]),opponentStadium:['Temple of Sinnoh ASR 155'],restrictions:{stadiumAndToolHaveNoEffectTurnsRemaining:1}});
 assert.equal(h.rank13EnergyCandidates(r)[0].newGap,0);
});
test('reject spent quota, Energy lock, Special Energy lock, unknown attached Energy',()=>{
 for(const r of [req({resources:{energyPlayedTurn:true}}),req({resources:{energyPlayLocked:true}}),req({active:p(S,['Unknown Energy'])}),req({hand:[D],items:[attach('d',D,0,S),pass],resources:{specialEnergyPlayLocked:true}})])assert.equal(h.rank13EnergyCandidates(r).length,0);
});
test('reject wrong owner, wrong index, unbound hand index, mismatched printing, non-root and hidden target',()=>{
 for(const patch of [{targetSeat:'opponent'},{targetIndex:2},{handIndex:1},{isOwnerVisible:false}]){
  const r=req();Object.assign(r.actionFrontier.items[0].publicMetadata,patch);assert.equal(h.rank13EnergyCandidates(r).length,0);
 }
 const r=req();r.actionFrontier.items[0].targetPrinting=V;assert.equal(h.rank13EnergyCandidates(r).length,0);
 const prompt=req();prompt.prompt={promptType:'ChooseCardsPrompt'};assert.equal(h.rank13EnergyCandidates(prompt).length,0);
});
test('direct Dialga fallback completes Shred with a basic, but does not take Energy from an established Regidrago',()=>{
 const make=bench=>req({active:p(DIA,[D]),bench,hand:[F],items:[attach('fire',F,0,DIA),pass]});
 assert.equal(choose(make([])).token,'fire');
 assert.equal(h.rank13EnergyCandidates(make([p(V,[])] )).length,0);
});
test('direct Timeless requires three Metal units and total five, honors used GX',()=>{
 const make=restrictions=>req({active:p(DIA,[D,D]),hand:[F],items:[attach('fire',F,0,DIA),pass],restrictions});
 assert.equal(h.dialgaGap(h.energyUnits([D,D,F]),3,5),0);
 assert.equal(h.rank13EnergyCandidates(make({gxUsed:false}))[0].reason,'DIRECT_TIMELESS_COST_COMPLETE');
 assert.equal(h.rank13EnergyCandidates(make({gxUsed:true})).length,0);
});
