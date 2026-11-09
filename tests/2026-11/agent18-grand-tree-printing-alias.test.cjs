'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  CANONICAL, NATIVE_MISSPELLING, installGrandTreePrintingAlias
} = require('../../simulation/twinleaf/2026-11/agent18-grand-tree-printing-alias.cjs');

function manager() {
  const cards = new Map([
    [NATIVE_MISSPELLING, {name:'Grand Tree',set:'SCR',
      setNumber:'136',fullName:NATIVE_MISSPELLING}],
    ['Sky Field ROS', {name:'Sky Field',set:'ROS',
      setNumber:'89',fullName:'Sky Field ROS'}]
  ]);
  return {
    getCardByName(name) {
      const card = cards.get(name);
      return card && {...card};
    },
    isCardDefined(name) {return cards.has(name);}
  };
}

test('canonical printed lookup works only while installed; nested teardown is safe',()=>{
  const cm=manager();
  const originalLookup=cm.getCardByName;
  const originalDefined=cm.isCardDefined;
  assert.equal(cm.getCardByName(CANONICAL),undefined);
  const releaseA=installGrandTreePrintingAlias(cm);
  const releaseB=installGrandTreePrintingAlias(cm);
  assert.equal(cm.isCardDefined(CANONICAL),true);
  assert.equal(cm.getCardByName(CANONICAL).fullName,CANONICAL);
  assert.equal(cm.getCardByName(NATIVE_MISSPELLING).fullName,NATIVE_MISSPELLING);
  assert.equal(cm.getCardByName('Sky Field ROS').fullName,'Sky Field ROS');
  releaseA();
  releaseA();
  assert.equal(cm.getCardByName(CANONICAL).fullName,CANONICAL);
  releaseB();
  releaseB();
  assert.strictEqual(cm.getCardByName,originalLookup);
  assert.strictEqual(cm.isCardDefined,originalDefined);
  assert.equal(cm.isCardDefined(CANONICAL),false);
  assert.equal(cm.getCardByName(CANONICAL),undefined);
});

test('unexpected native identity fails closed without altering manager',()=>{
  const cm=manager();
  const oldLookup=cm.getCardByName;
  cm.getCardByName=name=>name===NATIVE_MISSPELLING?
    {name:'Grand Tree',set:'SCR',setNumber:'999',fullName:name}:
    oldLookup.call(cm,name);
  const before=cm.getCardByName;
  assert.throws(()=>installGrandTreePrintingAlias(cm),/precondition failed/);
  assert.strictEqual(cm.getCardByName,before);
});

test('already corrected native lookup is left unchanged',()=>{
  const cm=manager();
  const oldGet=cm.getCardByName;
  cm.getCardByName=function(name){
    if(name===CANONICAL)return {
      name:'Grand Tree',set:'SCR',setNumber:'136',fullName:CANONICAL
    };
    return oldGet.call(this,name);
  };
  const before=cm.getCardByName;
  const release=installGrandTreePrintingAlias(cm);
  assert.strictEqual(cm.getCardByName,before);
  release();
  assert.strictEqual(cm.getCardByName,before);
});
