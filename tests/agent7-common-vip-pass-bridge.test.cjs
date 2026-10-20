'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {VIP, eligibleFirstTurnVip,chooseCommonVipBasics,withCommonVipPassBridge} =
  require('../simulation/twinleaf/agent7-common-vip-pass-bridge.cjs');

/** @param {string|null} fullName */
const slot = fullName => ({getPokemonCard:()=>fullName?{fullName}:null});
const printed = fullName => ({fullName});
const owned = () => ({id:101,hand:{cards:[printed(VIP)]},active:slot('Eternatus V'),
  bench:[slot(null),slot(null)],deck:{cards:[]}});
const state = (own=owned()) => ({turn:1,activePlayer:0,phase:7,
  prompts:[],players:[own,{id:202,hand:{cards:[]}}]});

class PassTurnAction {}
class PlayCardAction {
  constructor(id,index,target){Object.assign(this,{id,index,target});}
}
class ResolvePromptAction {
  constructor(id,cards){Object.assign(this,{id,cards});}
}
class SimpleTacticsAi {
  constructor(id=101){this.client={id};this.isValidAction=()=>true;}
  decodeNextAction(){return new PassTurnAction();}
}
const deps={SimpleTacticsAi:{SimpleTacticsAi},
  playActions:{PlayCardAction,PlayerType:{ANY:0},SlotType:{BOARD:9}},
  promptActions:{ResolvePromptAction},phase:{GamePhase:{PLAYER_TURN:7}}};

test('public-first-turn predicate ignores private opponent mutations',()=>{
  for (const [turn,seat] of [[1,0],[2,1]]) {
    const s=state();s.turn=turn;s.activePlayer=seat;
    assert.equal(eligibleFirstTurnVip(s,s.players[0],seat,7),true);
  }
  const s=state();s.players[1].hand.cards=[printed('Hidden hypothetical V')];
  assert.equal(eligibleFirstTurnVip(s,s.players[0],0,7),true);
  s.players[1].hand.cards=[printed('Different concealed card')];
  assert.equal(eligibleFirstTurnVip(s,s.players[0],0,7),true);
  s.turn=3;
  assert.equal(eligibleFirstTurnVip(s,s.players[0],0,7),false);
  s.turn=1;s.prompts=[{result:undefined}];
  assert.equal(eligibleFirstTurnVip(s,s.players[0],0,7),false);
  s.prompts=[];s.players[0].bench=[slot('Full'),slot('Full')];
  assert.equal(eligibleFirstTurnVip(s,s.players[0],0,7),false);
});

test('owner prompt validates actual physical pairs, rejects missing targets',()=>{
  const own=owned();
  const a=printed('Mewtwo & Mew-GX UNM');
  const b=printed('Shadow Rider Calyrex V CRE');
  const nonbasic=printed('Shadow Rider Calyrex VMAX CRE');
  const p={cards:{cards:[nonbasic,b,a]},
    validate:cards=>cards.length<=2 && cards.every(c=>[a,b].includes(c))};
  assert.deepEqual(chooseCommonVipBasics(own,p,{}),[a,b]);
  own.bench=[slot('Occupied'),slot('Occupied')];
  assert.deepEqual(chooseCommonVipBasics(own,p,{}),[]);
  own.bench=[slot('Occupied'),slot(null)];
  assert.deepEqual(chooseCommonVipBasics(own,p,{}),[a]);
  p.validate=()=>false;
  assert.deepEqual(chooseCommonVipBasics(own,p,{}),[]);
});

test('mock native root offer, owner prompt and hook restoration',()=>{
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const own=owned();
  const s=state(own);
  const ai=new SimpleTacticsAi();
  const cards=[printed('Mewtwo & Mew-GX UNM'),printed('Shadow Rider Calyrex V CRE')];
  const output=withCommonVipPassBridge(0,()=>{
    const first=ai.decodeNextAction(s);
    assert.ok(first instanceof PlayCardAction);
    assert.equal(first.index,0);
    const prompt={id:11,playerId:101,cards:own.deck,
      validate:choice=>choice.length===2};
    prompt.constructor={name:'ChooseCardsPrompt'};
    own.deck.cards=cards;
    s.prompts=[prompt];
    const next=ai.decodeNextAction(s);
    assert.ok(next instanceof ResolvePromptAction);
    assert.deepEqual(next.cards,cards);
    s.prompts=[];
    assert.ok(ai.decodeNextAction(s) instanceof PassTurnAction);
    return {mockSelected:true};
  },deps);
  assert.deepEqual(output.result,{mockSelected:true});
  assert.equal(output.audit.events.length,2);
  assert.equal(output.audit.events[0].nativeValid,true);
  assert.equal(output.audit.events[1].validated,true);
  assert.equal(SimpleTacticsAi.prototype.decodeNextAction,original);
});

test('no offer after failed legality and reversible hook on exception',()=>{
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const ai=new SimpleTacticsAi();
  ai.isValidAction=()=>false;
  const result=withCommonVipPassBridge(0,()=>ai.decodeNextAction(state()),deps);
  assert.ok(result.result instanceof PassTurnAction);
  assert.equal(result.audit.events[0].nativeValid,false);
  assert.equal(SimpleTacticsAi.prototype.decodeNextAction,original);
  const boom=new Error('dispatch failed');
  assert.throws(()=>withCommonVipPassBridge(0,()=>{throw boom;},deps),e=>e===boom);
  assert.equal(SimpleTacticsAi.prototype.decodeNextAction,original);
  assert.throws(()=>withCommonVipPassBridge(4,()=>{},deps));
});
