'use strict';const test=require('node:test');const assert=require('node:assert/strict');
const {certifyCrisisPunchTerminal:c}=require('./crisis_punch_terminal.cjs');
const target=(id,hpRemaining=210,prizes=2,damagePerPunch=280)=>({id,hpRemaining,prizes,damagePerPunch});
const base=o=>({attacker:'Meloetta ex BLK 44',firstTurnGoingFirst:true,debutEffective:true,
  toolEffective:true,attackReady:true,stableAttackConditions:true,energyUnits:3,ownPrizes:6,
  opponentActive:target('a'),opponentBench:[],...o});
const b=o=>base({attacker:'Bunnelby PRC 121',firstTurnGoingFirst:false,barrageEffective:true,...o});
test('Meloetta first player can terminal ordinary singleton but not healthy 300HP',()=>{
 assert.equal(c(base()).terminal,true);assert.equal(c(base({opponentActive:target('a',300,3)})).terminal,false);});
test('Meloetta cannot double attack or eliminate two board targets',()=>assert.equal(c(base({opponentBench:[target('b')]})).terminal,false));
test('disabled Debut and ordinary first-player Bunnelby fail',()=>{
 assert.equal(c(base({debutEffective:false})).terminal,false);assert.equal(c(b({firstTurnGoingFirst:true})).terminal,false);});
test('Bunnelby second player can eliminate two fragile board targets',()=>{
 const r=c(b({opponentBench:[target('b',60,1)]}));assert.equal(r.terminal,true);assert.equal(r.maxAttacks,2);});
test('full VMAX survivor denies the second board KO',()=>assert.equal(c(b({opponentBench:[target('b',320,3)]})).terminal,false));
test('Bunnelby double hit can KO sole 320 HP',()=>assert.equal(c(b({opponentActive:target('a',320,3)})).terminal,true));
test('three bodies deny bench-out but not guaranteed six-Prize sweep',()=>{
 assert.equal(c(b({opponentBench:[target('b'),target('c')]})).terminal,false);
 assert.equal(c(b({opponentActive:target('a',270,3),opponentBench:[target('b',270,3),target('c',270,3)]})).terminal,true);});
test('adversarial promotion choice blocks if one target cannot be KOed',()=>assert.equal(c(b({opponentActive:target('a',270,3),opponentBench:[target('b',270,3),target('c',320,3)]})).terminal,false));
test('first KO may immediately take last Prize regardless of Bench',()=>assert.equal(c(base({ownPrizes:2,opponentBench:[target('b',320,3)]})).terminal,true));
test('unknown damage, stability, missing tool or energy fail closed',()=>{
 for(const o of [{stableAttackConditions:false},{toolEffective:false},{energyUnits:2},{opponentActive:{id:'a',hpRemaining:60,prizes:1}}])assert.equal(c(base(o)).terminal,false);});
test('damage immunity and disabled Barrage do not create second-hit terminal',()=>{
 assert.equal(c(b({opponentActive:target('a',60,1,0)})).terminal,false);
 assert.equal(c(b({barrageEffective:false,opponentActive:target('a',300,3)})).terminal,false);});
