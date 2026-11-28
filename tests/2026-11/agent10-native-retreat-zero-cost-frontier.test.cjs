'use strict';
/*
 * Review-only source-bridge developmental test, no pinned Store or games.
 * The production host enumerator, cloning, frontier projection, strict
 * protocol and the real candidate worker execute unmodified. The native
 * Simulator/Store classes below are narrow mocks of a cited pinned
 * CheckRetreatCostEffect that writes both players' playability on a clone.
 *
 * The point is NOT to prove that Skyliner is globally live. It is to
 * prove the boundary: an actually native-certified zero RETREAT_COST root
 * can be used by the candidate even though its actor observation honestly
 * says printed Skyliner's suppression status is unknown.
 */
const test=require('node:test');
const assert=require('node:assert/strict');
const frontier=require('../../simulation/evaluation/2026-11/agent36-native-action-frontier.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');

const PSYCHIC='Psychic Energy MEE 13';
class FakeTrainerCard {
  constructor() {
    this.fullName='Float Stone BKT 137';this.name='Float Stone';
    this.trainerType='TOOL';
  }
}
class NativeCheckRetreatCostEffect {
  constructor(player) {this.player=player;this.cost=[];}
}
class NativeSimulator {
  constructor(state) {
    this.store={
      state,
      dispatch(action) {
        assert.ok(['RETREAT_ACTION','PLAY_CARD_ACTION','PASS_TURN'].includes(action.type));
      },
      reduceEffect(state,effect) {
        assert.notStrictEqual(state,globalControl.liveState,
          'pinned retreat cost must only be queried on a detached state');
        assert.strictEqual(state,this.state);
        assert.equal(effect.player.id,state.players[state.activePlayer].id);
        effect.cost=Array(effect.player.nativeEffectiveRetreatFee).fill('Colorless');
        for(const p of state.players){
          p.playableCardIds=[];p.playableHandAbilityCardIds=[];
        }
        globalControl.probes++;
      }
    };
  }
}
class NativeEnumerator {
  enumerate(state,player) {
    const actions=[
      {type:'RETREAT_ACTION',clientId:player.id,benchIndex:0}
    ];
    if(player.hand.cards[0] instanceof FakeTrainerCard)
      actions.push({type:'PLAY_CARD_ACTION',id:player.id,handIndex:0,
        target:{player:'BOTTOM',slot:'ACTIVE',index:0}});
    actions.push({type:'PASS_TURN',clientId:player.id});
    return actions;
  }
}
const native={
  Simulator:NativeSimulator,
  ActionEnumerator:NativeEnumerator,
  CheckRetreatCostEffect:NativeCheckRetreatCostEffect,
  TrainerCard:FakeTrainerCard,
  TrainerType:{ITEM:'ITEM',TOOL:'TOOL'},
  PlayerType:{BOTTOM_PLAYER:'BOTTOM',TOP_PLAYER:'TOP'},
  SlotType:{ACTIVE:'ACTIVE',BENCH:'BENCH'}
};
const globalControl={liveState:null,probes:0};
function slot(printing,energy=[],attacks=[],stage=2,ability=null) {
  const card={fullName:printing,name:printing.split(' ').slice(0,-2).join(' '),
    stage,cardType:['Psychic']};
  return {cards:[card],energies:{cards:energy.slice()},
    tools:[],damage:0,
    getPokemonCard(){return this.cards[0]}};
}
function nativeScene(seat,fee,handFloat=false){
  const active=slot('Mimikyu GRI 58',Array(fee).fill(PSYCHIC));
  const target=slot('Latias ex SSP 76',Array(3).fill(PSYCHIC));
  const owner={
    id:51,active,bench:[target],hand:{cards:handFloat?[new FakeTrainerCard()]:[]},
    deck:{cards:[]},discard:{cards:[]},stadium:{cards:[]},supporter:{cards:[]},
    prizes:[],nativeEffectiveRetreatFee:fee,
    playableCardIds:['live-play'],playableHandAbilityCardIds:['live-ability']
  };
  const rival={
    id:61,active:slot('Iron Thorns ex TWM 77'),bench:[],
    hand:{cards:[]},deck:{cards:[]},discard:{cards:[]},
    stadium:{cards:[]},supporter:{cards:[]},prizes:[],
    playableCardIds:['other-play'],playableHandAbilityCardIds:['other-ability']
  };
  const state={turn:5,phase:3,activePlayer:seat,
    players:seat===0?[owner,rival]:[rival,owner],prompts:[]};
  globalControl.liveState=state;globalControl.probes=0;
  return {state,owner,rival};
}
function printable(printing,hp,damage=0,energy=0,stage=2,attack=null,abilities=[],suppression=null){
  return {printing,hp,damage,energies:Array(energy).fill(PSYCHIC),
    tools:[],attacks:attack?[attack]:[],abilities,
    abilitySuppressions:abilities.length?abilities.map(name=>({
      abilityName:name,suppressed:suppression,reasonCode:null,sourcePrinting:null})):[],
    printed:{stage,subtypes:[],types:['Psychic'],retreatCost:['Colorless'],
      weakness:[],resistance:[]}
  };
}
function ownerView(seat,fee,handFloat){
  const active=printable('Mimikyu GRI 58',70,0,fee,2,null);
  const bench=printable('Latias ex SSP 76',210,0,3,2,
    {name:'Eon Blade',cost:['Psychic','Psychic','Colorless'],damage:'200'},
    ['Skyliner'],null);
  const restrictions={gxUsed:false,vstarUsed:false,
    stadiumAndToolHaveNoEffectTurnsRemaining:0};
  const own={active,bench:[bench],stadium:[],discard:[],lostZone:[],
    resolvingSupporter:[],deckCount:30,handCount:handFloat?1:0,
    prizeCount:6,publicTurnRestrictions:{...restrictions}};
  const foe={active:printable('Iron Thorns ex TWM 77',230,150,0),
    bench:[],stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
    deckCount:30,handCount:0,prizeCount:6,publicTurnRestrictions:{...restrictions}};
  return {actorSeat:seat,decisionKind:'owner-root',
    ownHand:handFloat?['Float Stone BKT 137']:[],
    ownPublic:own,opponentPublic:foe,
    ownTurnResources:{supporterPlayedTurn:0}};
}
function decision(seat,fee,handFloat=false){
  const physical=nativeScene(seat,fee,handFloat);
  const livePlayability=physical.state.players.map(player=>({
    cards:player.playableCardIds,ability:player.playableHandAbilityCardIds}));
  const built=frontier.buildNativeActionFrontier({
    state:physical.state,actorSeat:seat,native});
  assert.equal(globalControl.probes,1,
    'one actual state-specific cost probe for all retreat choices');
  physical.state.players.forEach((player,i)=>{
    assert.strictEqual(player.playableCardIds,livePlayability[i].cards);
    assert.strictEqual(player.playableHandAbilityCardIds,livePlayability[i].ability);
  });
  protocol.validateFrontier(built.actionFrontier);
  const retreat=built.actionFrontier.items.find(item=>item.kind==='retreat');
  assert.ok(retreat,'native-seamed legal retreat action must survive');
  assert.equal(retreat.publicMetadata.retreatEnergyCost,fee);
  assert.equal(retreat.publicMetadata.freeRetreat,fee===0);
  const worker=policy.createPolicy({role:'candidate',seat,
    policyVersion:policy.POLICY_VERSION,config:{}});
  const request={role:'candidate',seat,prompt:null,publicEventReceipt:null,
    observation:ownerView(seat,fee,handFloat),
    actionFrontier:built.actionFrontier};
  const got=worker.decideWithAudit(request);
  protocol.validatePolicyAudit(got.policyAudit,request,got.decision,
    policy.POLICY_VERSION);
  return {got,retreat,frontier:built.actionFrontier};
}
for(const seat of [0,1]) {
  test('seat '+seat+' live-unknown Skyliner chooses native-certified free retreat',()=>{
    const {got,retreat}=decision(seat,0);
    assert.deepEqual(got.decision,
      {kind:'select-action',token:retreat.token});
  });
  test('seat '+seat+' positive native retreat cost vetoes speculative Skyliner',()=>{
    const {got}=decision(seat,1);
    assert.deepEqual(got.decision,{kind:'select-action',token:'act-1'});
  });
  test('seat '+seat+' certified free retreat dominates spending held Float Stone',()=>{
    const {got,retreat}=decision(seat,0,true);
    assert.deepEqual(got.decision,
      {kind:'select-action',token:retreat.token});
  });
  test('seat '+seat+' paid retreat can invest Float Stone instead',()=>{
    const {got}=decision(seat,1,true);
    assert.deepEqual(got.decision,{kind:'select-action',token:'act-1'});
  });
}
