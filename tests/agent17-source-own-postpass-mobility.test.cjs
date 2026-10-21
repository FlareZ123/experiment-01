'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {sourceOwnerPostPassMobility}=
  require('../simulation/evaluation/agent17-source-own-postpass-mobility.cjs');

/** @param {string[]} hand @param {string[]} tools */
function evidence(hand,tools=[]){
  const roots=[{actionOrdinal:0,turnBefore:9,action:'PassTurnAction',playerSlot:0}];
  const decisions=[{
    actionOrdinal:0,turnBefore:9,action:'PassTurnAction',playerSlot:0,
    decisionHandBefore:{perspectiveSeat:0,ownHandPrintings:hand,opponentHandSize:5},
    publicBoardBeforePass:[
      {active:{name:'Garbodor',energyCards:['Darkness Energy'],toolCards:tools},
        bench:[{name:'Oranguru V'}],stadium:[]},
      {active:{name:'Duskull'},bench:[],stadium:[]}]
  }];
  return {roots,decisions};
}
test('Actually held Float Stone after a native source Pass is counted',()=>{
  const {roots,decisions}=evidence(['Float Stone BKT 137','Darkness Energy MEE 15']);
  const p=sourceOwnerPostPassMobility(decisions,roots,0);
  assert.equal(p.strippedGarbodorHeldMobility,1);
  assert.equal(p.observations[0].mobilityHeld['Float Stone'],1);
  assert.equal(p.qualifyForGameStrength,false);
});
test('No-opportunity and equipped-controls preserved',()=>{
  const a=evidence(['Darkness Energy MEE 15']);
  const none=sourceOwnerPostPassMobility(a.decisions,a.roots,0);
  assert.equal(none.strippedGarbodorHeldMobility,0);
  const b=evidence(['Guzma BUS 115'],['Float Stone']);
  const equipped=sourceOwnerPostPassMobility(b.decisions,b.roots,0);
  assert.equal(equipped.strippedGarbodorPasses,0);
  assert.equal(equipped.passesHoldingMobility,1);
});
test('Other actor hidden-hand size cannot influence post-Pass source census',()=>{
  const a=evidence(['Escape Rope BST 125']);
  const baseline=sourceOwnerPostPassMobility(a.decisions,a.roots,0);
  a.decisions[0].decisionHandBefore.opponentHandSize=1;
  assert.deepEqual(sourceOwnerPostPassMobility(a.decisions,a.roots,0),baseline);
});
test('Native root and actor-perspective witnesses required',()=>{
  const a=evidence(['Float Stone BKT 137']);
  a.roots[0].turnBefore=8;
  assert.throws(()=>sourceOwnerPostPassMobility(a.decisions,a.roots,0));
  a.roots[0].turnBefore=9;
  a.decisions[0].decisionHandBefore.perspectiveSeat=1;
  assert.throws(()=>sourceOwnerPostPassMobility(a.decisions,a.roots,0));
});
