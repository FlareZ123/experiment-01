'use strict';
const test=require('node:test'), assert=require('node:assert/strict');
const {S,D,G}=require('../../simulation/evaluation/2026-11/agent26-rank13-energy-root.cjs');
const h=require('../../simulation/evaluation/2026-11/agent26-rank13-temple-break.cjs');
const base=require('../../simulation/evaluation/2026-11/agent24-rank13-regidrago-opponent-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const {LAB,BLOWER,TEMPLE}=h;
const pass={kind:'pass',token:'pass',label:'Pass turn'};
const trainer=(printing,i)=>({kind:'play-card',token:'t'+i,label:'Play '+printing,actorPrinting:printing,publicMetadata:{cardType:'trainer',handIndex:i}});
const req=({hand=[LAB],energy=[D,G],stadium=[TEMPLE],seat=0,tools=[],discard=['Noivern ex PAL 153'],restrictions={},extra=[]}={})=>({
role:'opponent',seat,prompt:null,observation:{actorSeat:seat,globalTurn:3,ownHand:hand,ownPublic:{active:{printing:S,energies:energy,printed:{types:['Dragon']},hp:280,damage:0},bench:[],discard,stadium:[],publicTurnRestrictions:restrictions},opponentPublic:{stadium,active:{printing:'Shadow Rider Calyrex VMAX CRE 75',tools},bench:[],handCount:5},ownTurnResources:{energyPlayedTurn:false}},actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[...hand.map(trainer),...extra,pass]}});
const choose=r=>h.chooseRank13WithTempleBreak(r,base);
test('both seats: v1 passes, lab replaces live Temple and re-enables DDE',()=>{
 for(const seat of [0,1]){const r=req({seat});assert.equal(base.bestAction(r).token,'pass');
 const a=h.templeBreak(r,base);assert.equal(a.lockedGap,2);assert.equal(a.unlockedGap,0);
 const d=choose(r);assert.equal(d.token,'t0');
 protocol.validateDecision(d,null,protocol.validateFrontier(r.actionFrontier));}
});
test('preserve ACE SPEC when ordinary stadium accomplishes same unlock',()=>{
 const r=req({hand:[BLOWER,LAB]});assert.equal(choose(r).token,'t1');
});
test('Megaton clears Temple when no ordinary stadium offered',()=>{
 assert.equal(choose(req({hand:[BLOWER]})).token,'t0');
});
test('Megaton strips opposing tools as well, unlike lab',()=>{
 assert.equal(choose(req({hand:[LAB,BLOWER],tools:['Stealthy Hood UNB 186']})).token,'t1');
});
test('do not force removal without payload, live Temple or payable post-break cost',()=>{
 for(const r of [req({discard:[]}),req({stadium:[]}),req({energy:[D]}),req({energy:[G,G,G]}),req({restrictions:{stadiumAndToolHaveNoEffectTurnsRemaining:1}})])assert.equal(h.templeBreak(r,base),null);
});
test('respect already offered Apex and exact hand binding',()=>{
 const r=req({extra:[{kind:'attack',token:'apex',label:'Apex Dragon',attackName:'Apex Dragon'}]});assert.equal(h.templeBreak(r,base),null);
 const invalid=req();invalid.actionFrontier.items[0].publicMetadata.handIndex=1;assert.equal(h.templeBreak(invalid,base),null);
});
test('never manufacture a nonoffered action or choose unestablished Parallel City continuation',()=>{
 const r=req();r.actionFrontier.items=[pass];assert.equal(h.templeBreak(r,base),null);
 assert.equal(h.templeBreak(req({hand:['Parallel City BKT 145']}),base),null);
});