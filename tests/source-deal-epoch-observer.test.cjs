'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createSourceDealEpochObserver}=require('../simulation/evaluation/source-deal-epoch-observer.cjs');
const {fingerprintInitialSourceDeal}=require('../simulation/evaluation/source-physical-deal-fingerprint.cjs');
const card=name=>({fullName:name});
const slot=name=>({cards:[card(name)],tools:[],energies:{cards:[]}});
const player=name=>({hand:{cards:[card(name+'-hand')]},deck:{cards:[card(name+'-deck')]},
  prizes:Array.from({length:6},(_,i)=>({cards:[card(name+'-prize'+i)]})),
  active:slot(name+'-active'),bench:[],discard:{cards:[]},lostzone:{cards:[]},
  stadium:{cards:[]},supporter:{cards:[]}});
const state=()=>({turn:1,phase:2,activePlayer:0,isSuddenDeath:false,
  prompts:[],players:[player('a'),player('b')]});

test('source digest persists once per original opening without exposing card names',()=>{
  const s=state(),o=createSourceDealEpochObserver(1);
  o.observe(s,3,0);
  const first=o.result(0);
  assert.equal(first.recordedOpeningDeals,1);
  assert.equal(first.deals[0].sourceDealDigestSha256,
    fingerprintInitialSourceDeal(s,1,0).digestSha256);
  assert.deepEqual(first.deals[0].initialPrizeCounts,[6,6]);
  assert.equal(first.deals[0].firstActualPlayerSeat,0);
  assert.equal(JSON.stringify(first).includes('a-prize'),false);
  assert.equal(JSON.stringify(first).includes('b-hand'),false);
  s.players[1].deck.cards.push(card('another'));
  o.observe(s,4,0);
  assert.deepEqual(o.result(0),first);
});

test('native clock reset requires genuine stable replay opening',()=>{
  const s=state(),o=createSourceDealEpochObserver(1);
  o.observe(s,3,0);
  s.phase=1;s.turn=0;s.isSuddenDeath=true;
  o.observe(s,38,1);
  assert.equal(o.result(1).allEpisodeOpeningsCaptured,false);
  s.players=[player('replay-a'),player('replay-b')];
  s.phase=2;s.turn=1;s.activePlayer=1;
  o.observe(s,54,1);
  const out=o.result(1);
  assert.equal(out.recordedOpeningDeals,2);
  assert.equal(out.allEpisodeOpeningsCaptured,true);
  assert.deepEqual(out.deals.map(x=>x.episodeIndex),[0,1]);
  assert.deepEqual(out.deals.map(x=>x.initialRootActionOrdinal),[3,54]);
  assert.deepEqual(out.deals.map(x=>x.initialPrizeCounts),[[6,6],[6,6]]);
  assert.notEqual(out.deals[0].sourceDealDigestSha256,
    out.deals[1].sourceDealDigestSha256);
  assert.equal(out.deals[1].nativeSuddenDeathAtOpening,true);
  assert.equal(out.provesPaperTiebreakEquivalence,false);
  assert.equal(out.competitiveQualified,false);
});

test('uncaptured initial deal and pending setup prompts fail closed',()=>{
  const s=state(),o=createSourceDealEpochObserver(0);
  s.prompts=[{result:undefined}];
  o.observe(s,1,0);
  assert.equal(o.result(0).recordedOpeningDeals,0);
  s.prompts=[];
  assert.throws(()=>o.observe(s,40,1),/no recorded initial physical-deal prefix/);
});