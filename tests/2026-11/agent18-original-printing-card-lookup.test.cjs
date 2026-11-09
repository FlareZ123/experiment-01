'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  getExactOriginalPrinting
}=require('../../simulation/twinleaf/2026-11/agent18-original-printing-card-lookup.cjs');

function manager(rows) {
  return {
    getAllCards(){return rows;},
    getCardByName(id){
      const x=rows.find(c=>c.fullName===id);
      return x&&{...x};
    }
  };
}

test('distinct original collector numbers retain distinct native physical identifiers',()=>{
  const rows=[
    {name:'Tropical Beach',set:'BWP',setNumber:'28',fullName:'Tropical Beach BWP'},
    {name:'Tropical Beach',set:'BWP',setNumber:'50',fullName:'Tropical Beach BWP 50'},
    {name:'Grand Tree',set:'SCR',setNumber:'136',fullName:'Great Tree SCR'}
  ];
  const cm=manager(rows);
  const a=getExactOriginalPrinting(cm,{
    name:'Tropical Beach',printing:{set:'BWP',number:'28'}});
  const b=getExactOriginalPrinting(cm,{
    name:'Tropical Beach',printing:{set:'bwp',number:'050'}});
  const tree=getExactOriginalPrinting(cm,{
    name:'Grand Tree',printing:{set:'SCR',number:'136'}});
  assert.equal(a.nativeId,'Tropical Beach BWP');
  assert.equal(b.nativeId,'Tropical Beach BWP 50');
  assert.notEqual(a.nativeId,b.nativeId);
  assert.equal(tree.nativeId,'Great Tree SCR');
  assert.equal(tree.card.name,'Grand Tree');
  assert.deepEqual(cm.getAllCards(),rows);
});

test('ambiguous and missing printings fail closed',()=>{
  const rows=[
    {name:'Electrike',set:'PRC',setNumber:'60',fullName:'Electrike PRC A'},
    {name:'Electrike',set:'PRC',setNumber:'60',fullName:'Electrike PRC B'}
  ];
  const cm=manager(rows);
  assert.throws(()=>getExactOriginalPrinting(cm,
    {name:'Electrike',printing:{set:'PRC',number:60}}),
    /exactly one match.*found 2/);
  assert.throws(()=>getExactOriginalPrinting(cm,
    {name:'Electrike',printing:{set:'PRC',number:61}}),
    /exactly one match.*found 0/);
  assert.throws(()=>getExactOriginalPrinting(cm,
    {name:'Electrike',printing:{set:'PRC'}}),
    /Expected exact source/);
  assert.throws(()=>getExactOriginalPrinting({},{}),/CardManager/);
});
