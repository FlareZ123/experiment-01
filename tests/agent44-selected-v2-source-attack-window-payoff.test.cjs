'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {summarizeSourceAttackWindows,validPrizeVector}=require(
  '../simulation/evaluation/agent44-selected-v2-source-attack-window-payoff.cjs');

/** @param {number} turnBefore @param {number[]} before @param {number[]|null} after */
function attack(turnBefore,before,after){
 return {turnBefore,attackName:'Apex Dragon',settledPromptChain:true,
   prizesBefore:before,prizesAfter:after};
}
/** @param {string} id @param {'A'|'B'} slot @param {object[]|null} attacks */
function row(id,slot,attacks){
 return {trial:{id,candidateSlot:slot},
   sourceSeat:slot==='A'?1:0,
   sourceAttackSettlement:attacks===null?null:{
     declarations:attacks.length,
     settled:attacks.filter(x=>x.settledPromptChain===true).length,
     attacks}};
}

test('actual source seat determines native public Prize delta',()=>{
 const a=row('a','A',[attack(6,[6,6],[6,4])]);
 const b=row('b','B',[attack(10,[6,6],[5,6])]);
 const r=summarizeSourceAttackWindows([a,b]);
 assert.equal(r.all.settled,2);
 assert.equal(r.all.originalSourcePrizesTaken,3);
 assert.equal(r.windows['6'].originalSourcePrizesTaken,2);
 assert.equal(r.windows['10'].originalSourcePrizesTaken,3);
 assert.equal(r.windows['6'].rowsWithSettledAttacks,1);
 assert.equal(r.windows['10'].rowsWithSettledAttacks,2);
});

test('late attacks stay outside bounded windows',()=>{
 const a=row('a','A',[attack(21,[6,6],[6,3])]);
 const r=summarizeSourceAttackWindows([a]);
 assert.equal(r.windows['20'].settled,0);
 assert.equal(r.windows['40'].settled,1);
 assert.equal(r.all.originalSourcePrizesTaken,3);
});

test('unsettled declaration and abort remain unresolved',()=>{
 const unresolved={turnBefore:5,attackName:'Terminal Period',
   settledPromptChain:false,prizesBefore:[6,6],prizesAfter:null};
 const r=summarizeSourceAttackWindows([
   row('a','A',[unresolved]),row('b','B',null)]);
 assert.equal(r.declarations,1);
 assert.equal(r.unsettled,1);
 assert.equal(r.unavailableSourceRows,1);
 assert.equal(r.all.settled,0);
 assert.equal(r.missingPrizeReceipts,0);
});

test('missing Prize receipt for settled attack is explicit UNKNOWN',()=>{
 const r=summarizeSourceAttackWindows([
   row('a','A',[attack(6,[6,6],null)])]);
 assert.equal(r.all.settled,1);
 assert.equal(r.missingPrizeReceipts,1);
 assert.equal(r.all.originalSourcePrizesTaken,0);
 assert.equal(validPrizeVector(null),false);
 assert.equal(validPrizeVector([6,0]),true);
});

test('invalid registered seat or settlement tallies throw',()=>{
 const a=row('a','A',[attack(6,[6,6],[6,5])]);
 a.sourceSeat=0;
 assert.throws(()=>summarizeSourceAttackWindows([a]));
 const b=row('b','B',[attack(6,[6,6],[5,6])]);
 b.sourceAttackSettlement.settled=0;
 assert.throws(()=>summarizeSourceAttackWindows([b]));
});
