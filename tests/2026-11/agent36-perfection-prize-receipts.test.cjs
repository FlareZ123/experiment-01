'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {remainingPrizes,perfectionPrizeReceipts}=
  require('../../simulation/evaluation/2026-11/agent36-perfection-prize-receipts.cjs');

const crobat={printing:'Crobat V DAA',id:72};
const cards=(n)=>Array.from({length:6},(_,i)=>i<n?[{id:100+i}]:[]);
const zone=(n,active=null,discard=[])=>({
  prizes:cards(n),active:{cards:active?[active]:[]},discard
});
const snapshot=(rootOrdinal,n=6,active=crobat,discard=[])=>({
  rootOrdinal,physicalZones:[
    zone(n,{printing:'Mewtwo & Mew-GX UNM',id:1}),
    zone(6,active,discard)
  ]
});
const root=(actionOrdinal,turnBefore,playerSlot,action,ability=null)=>({
  actionOrdinal,turnBefore,playerSlot,action,...(ability ? {ability} : {})
});

test('actual Perfection KO and two Prizes are counted without AttackAction',()=>{
  const roots=[
    root(0,20,0,'PlayCardAction'),
    root(1,20,0,'UseAbilityAction','Perfection'),
    root(2,20,0,'ResolvePromptAction'),
    root(3,20,0,'ResolvePromptAction'),
    root(4,21,1,'PassTurnAction')
  ];
  const tape={postAcceptedRoots:[
    snapshot(0),
    snapshot(1),
    snapshot(2,6,null,[crobat]),
    snapshot(3,4,null,[crobat]),
    snapshot(4,4,null,[crobat])
  ]};
  const events=perfectionPrizeReceipts(roots,tape,0);
  assert.equal(events.length,1);
  assert.equal(events[0].initiatingRoot,1);
  assert.equal(events[0].actualPrizesTaken,2);
  assert.equal(events[0].endOfSameTurnRoot,3);
  assert.deepEqual(events[0].prizeEvents,[{
    root:3,prizesTaken:2,
    newlyDiscardedOpponentActive:{
      physicalId:72,printing:'Crobat V DAA',removalRoot:2
    }
  }]);
  assert.equal(events[0].paperQualified,false);
});

test('normal AttackAction does not count as a Perfection initiation',()=>{
  const roots=[root(0,20,0,'PlayCardAction'),root(1,20,0,'AttackAction')];
  const tape={postAcceptedRoots:[snapshot(0),snapshot(1,4,null,[crobat])]};
  assert.deepEqual(perfectionPrizeReceipts(roots,tape,0),[]);
});

test('a second same-turn Perfection is never double-attributed to the first',()=>{
  const roots=[
    root(0,20,0,'PlayCardAction'),
    root(1,20,0,'UseAbilityAction','Perfection'),
    root(2,20,0,'ResolvePromptAction'),
    root(3,20,0,'UseAbilityAction','Perfection'),
    root(4,20,0,'ResolvePromptAction'),
    root(5,21,1,'PassTurnAction')
  ];
  const tape={postAcceptedRoots:[
    snapshot(0),snapshot(1),snapshot(2),snapshot(3),
    snapshot(4,4,null,[crobat]),snapshot(5,4,null,[crobat])
  ]};
  const found=perfectionPrizeReceipts(roots,tape,0);
  assert.equal(found.length,2);
  assert.deepEqual(found.map(x=>x.actualPrizesTaken),[0,2]);
});

test('incomplete physical or mismatched ordinal join cannot produce a receipt',()=>{
  const roots=[root(0,20,0,'PlayCardAction'),
    root(1,20,0,'UseAbilityAction','Perfection')];
  assert.throws(()=>perfectionPrizeReceipts(roots,{
    postAcceptedRoots:[snapshot(0)]},0),/mandatory/);
  assert.throws(()=>perfectionPrizeReceipts(roots,{
    postAcceptedRoots:[snapshot(0),snapshot(3)]},0),/ordinal/);
  assert.throws(()=>perfectionPrizeReceipts(roots,{
    postAcceptedRoots:[snapshot(0),snapshot(1)]},2));
});

test('physical Prize count uses occupied slots rather than slot count',()=>{
  assert.equal(remainingPrizes(zone(3)),3);
  assert.equal(remainingPrizes(zone(6)),6);
  assert.equal(remainingPrizes(zone(0)),0);
});
