'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pendingPaleMoonGXKnockOut,choosePaleMoonEscapeRetreat}=require('../../simulation/twinleaf/2026-11/agent34-pale-moon-escape.cjs');
const {actorObservation}=require('../../simulation/twinleaf/actor-observation-contract.cjs');
const {validateActorObservation}=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');

const effect=(target,attack='Pale Moon-GX',type='knock_out')=>
  ({target,attack:{name:attack},type});
const retreat=(index=0,token='native:retreat:0')=>
  ({token,kind:'retreat',publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:index,benchIndex:index}});
const choiceView=(flag=true,bench=[{printing:'Mimikyu GRI 58'}])=>
  ({decisionKind:'owner-root',ownPublic:{
    active:{publicRestrictions:{pendingPaleMoonGXKnockOut:flag}},bench
  }});

function slot(name) {
  const card={fullName:name,name:name.split(' ').slice(0,2).join(' '),
    hp:310,stage:5,cardType:[5],retreat:[9],
    weakness:[],resistance:[],attacks:[],powers:[],tags:['VMAX']};
  return {cards:[card],getPokemonCard:()=>card,pokemonPlayedTurn:1,damage:0,
    specialConditions:[],energies:{cards:[]},tools:[]};
}
function player(id,name) {
  const active=slot(name);
  return {id,active,bench:[],pendingEndOfTurnEffects:[],
    stadium:{cards:[]},discard:{cards:[]},lostzone:{cards:[]},
    supporter:{cards:[]},hand:{cards:[],isPublic:false},deck:{cards:[]},
    prizes:Array.from({length:6},()=>({cards:[]})),supporterTurn:0,
    retreatedTurn:0,energyPlayedTurn:0,stadiumPlayedTurn:0,stadiumUsedTurn:0};
}
test('physical exact-target projection, both seats; no hidden-zone copying',()=>{
  for(const seat of [0,1]){
    const players=[player(17,'Shadow Rider Calyrex VMAX CRE 75'),
      player(19,'Regidrago VSTAR SIT 136')];
    const owner=players[seat];
    owner.bench=[slot('Mimikyu GRI 58')];
    owner.pendingEndOfTurnEffects=[effect(owner.active),
      effect(owner.bench[0],'other attack'), effect({fake:true})];
    const enemy=players[1-seat];
    enemy.hand.cards=[{fullName:'secret card never revealed'}];
    const state={players,activePlayer:seat,turn:6,phase:2,prompts:[]};
    const view=actorObservation(state,seat);
    assert.equal(view.ownPublic.active.publicRestrictions.pendingPaleMoonGXKnockOut,true);
    assert.equal(view.ownPublic.bench[0].publicRestrictions.pendingPaleMoonGXKnockOut,false);
    assert.equal(view.opponentPublic.active.publicRestrictions.pendingPaleMoonGXKnockOut,false);
    assert.equal(view.opponentPublic.handCount,1);
    assert.equal(view.opponentPublic.publicHand,null);
    assert.ok(!JSON.stringify(view).includes('secret card never revealed'));
    validateActorObservation(view,seat);
    assert.equal(pendingPaleMoonGXKnockOut({},owner.active),null);
  }
});
test('exact pending-target flag changes independently of an identical printed board',()=>{
  const state={players:[player(17,'Shadow Rider Calyrex VMAX CRE 75'),
    player(19,'Regidrago VSTAR SIT 136')],activePlayer:0,turn:6,phase:2,prompts:[]};
  const active=state.players[0].active;
  state.players[0].pendingEndOfTurnEffects=[effect(active)];
  const threatened=actorObservation(state,0);
  state.players[0].pendingEndOfTurnEffects=[];
  const safe=actorObservation(state,0);
  assert.equal(threatened.ownPublic.active.publicRestrictions.pendingPaleMoonGXKnockOut,true);
  assert.equal(safe.ownPublic.active.publicRestrictions.pendingPaleMoonGXKnockOut,false);
  validateActorObservation(safe,0);
});
test('one real native retreat token selected under pending KO and no competing attack',()=>{
  const offered=[{token:'pass',kind:'pass'},retreat(0,'retreat-action-123')];
  assert.deepEqual(choosePaleMoonEscapeRetreat(choiceView(),offered),{
    token:'retreat-action-123',reason:'PUBLIC_PALE_MOON_PENDING_KO_SINGLE_LEGAL_RETREAT'
  });
});
test('hard negatives: unknown / absent KO, no legal root, multiple benches, attacking option',()=>{
  const offered=[{token:'pass',kind:'pass'},retreat()];
  for(const flag of [null,false]){
    assert.equal(choosePaleMoonEscapeRetreat(choiceView(flag),offered),null);
  }
  assert.equal(choosePaleMoonEscapeRetreat(choiceView(),[{token:'pass',kind:'pass'}]),null);
  assert.equal(choosePaleMoonEscapeRetreat(choiceView(true,[{},{}]),offered),null);
  assert.equal(choosePaleMoonEscapeRetreat(choiceView(true,[]),offered),null);
  assert.equal(choosePaleMoonEscapeRetreat(choiceView(),[...offered,{token:'attack',kind:'attack'}]),null);
  assert.equal(choosePaleMoonEscapeRetreat(choiceView(),[...offered,{token:'fog',kind:'play-card'}]),null);
  assert.equal(choosePaleMoonEscapeRetreat(choiceView(),[...offered,retreat()]),null);
  assert.equal(choosePaleMoonEscapeRetreat(choiceView(),[{...retreat(),
    publicMetadata:{targetSeat:'opponent',targetZone:'bench',targetIndex:0,benchIndex:0}}]),null);
});
