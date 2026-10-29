'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {chooseRank11CoreVipBasics:pick}=
 require('../simulation/twinleaf/agent3-source-rank11-vip-role-selector.cjs');
const card=(name,kind='Basic',evolvesFrom)=>({name,fullName:name+' TEST',kind,evolvesFrom});
const slot=name=>({getPokemonCard:()=>name?card(name):null});
const own=(hand=[])=>({active:slot('Oranguru V'),bench:Array.from({length:5},()=>slot(null)),hand:{cards:hand}});
const prompt=cards=>({cards:{cards},validate:choice=>choice.length>0&&choice.length<=2&&choice.every(c=>c.kind==='Basic')});
test('rank11 source roles beat duplicate Trubbish',()=>{
 const p=prompt([card('Trubbish'),card('Trubbish'),card('Mega Absol ex'),card('Garbodor','Stage1','Trubbish'),card('Crobat V')]);
 assert.deepEqual(pick(own(),p,{}).map(c=>c.name),['Mega Absol ex','Trubbish']);
});
test('held attacker leaves Trubbish as missing role',()=>{
 const p=prompt([card('Trubbish'),card('Crobat V'),card('Garbodor','Stage1','Trubbish')]);
 assert.ok(pick(own([card('Mega Absol ex')]),p,{}).some(c=>c.name==='Trubbish'));
});
test('one Bench space limits choice; full Bench blocks search',()=>{
 const o=own(),p=prompt([card('Trubbish'),card('Mega Absol ex'),card('Garbodor','Stage1','Trubbish')]);
 for(let i=0;i<4;i++)o.bench[i]=slot('Other '+i);
 assert.equal(pick(o,p,{}).length,1);
 o.bench[4]=slot('Other 4');assert.deepEqual(pick(o,p,{}),[]);
});
test('opponent concealed hand cannot affect target identity',()=>{
 const o=own(),p=prompt([card('Trubbish'),card('Mega Absol ex'),card('Garbodor','Stage1','Trubbish')]);
 assert.deepEqual(pick(o,p,{players:[o,{hand:{cards:[card('A')]}}]}),
   pick(o,p,{players:[o,{hand:{cards:[card('B')]}}]}));
});
