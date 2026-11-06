'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {actorObservation}=
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const {VERSION,RANGER,observePublicPaidGxEffects,
  proposeRangerAfterPaidGx}=
  require('../simulation/twinleaf/agent30-ranger-public-gx-frontier.cjs');

/** @param {string} fullName Printed card, with owner-known identity only. */
const card=fullName=>({fullName,name:fullName});

/** @param {number} id */
function player(id){
  return {
    id,
    active:{cards:[],getPokemonCard:()=>null},
    bench:[],
    hand:{cards:[]},
    deck:{cards:[card('Secret Unknown')]},
    prizes:[{cards:[card('Secret Prize')]}],
    discard:{cards:[]},lostzone:{cards:[]},
    stadium:{cards:[]},supporter:{cards:[]},
    supporterTurn:0,energyPlayedTurn:0,stadiumPlayedTurn:0,
    usedGX:true,usedVSTAR:false,
    alteredCreationDamage:false,
    usedAlteredCreation:false,
    cannotPlaySupporterCards:false
  };
}

function pair(){
  const players=[player(101),player(202)];
  players[0].hand.cards=[card(RANGER),card('Fog Crystal CRE')];
  players[1].alteredCreationDamage=true;
  players[1].usedAlteredCreation=true;
  return {players,turn:6,phase:5,activePlayer:0,prompts:[]};
}

test('owner-only public effect augmentation proposes paid GX Ranger, both seats',()=>{
  for(const seat of [0,1]){
    const state=pair();
    if(seat===1){
      state.players[1].hand.cards=state.players[0].hand.cards;
      state.players[0].hand.cards=[];
      state.players[0].alteredCreationDamage=true;
      state.players[0].usedAlteredCreation=true;
      state.players[1].alteredCreationDamage=false;
      state.players[1].usedAlteredCreation=false;
      state.activePlayer=1;
    }
    const original=actorObservation(state,seat);
    assert.equal(original.opponentPublic.continuingPaidGxAttack,undefined);
    const view=observePublicPaidGxEffects(state,seat,original);
    assert.ok(Object.isFrozen(view));
    assert.ok(Object.isFrozen(view.opponentPublic.continuingPaidGxAttack));
    assert.equal(view.opponentPublic.continuingPaidGxAttack
      .alteredCreationBonusPrize,true);
    assert.equal(view.ownPublic.continuingPaidGxAttack
      .alteredCreationBonusPrize,false);
    assert.deepEqual(proposeRangerAfterPaidGx(view),{
      kind:'play-ranger-paid-gx',printing:RANGER,handIndex:0,
      source:VERSION,
      trigger:'opponent-active-paid-Altered-Creation-extra-Prize'
    });
    assert.equal(state.players[seat].hand.cards.length,2);
    assert.equal(original.opponentPublic.continuingPaidGxAttack,undefined);
    assert.throws(()=>{
      view.opponentPublic.continuingPaidGxAttack
        .alteredCreationBonusPrize=false;
    },TypeError);
  }
});

test('native actor state vetoes illegal/competing Ranger proposals',()=>{
  const cases=[
    {label:'untriggered',modify:s=>{
      s.players[1].usedAlteredCreation=false;}},
    {label:'not held',modify:s=>{s.players[0].hand.cards=[];}},
    {label:'supporter already played',modify:s=>{
      s.players[0].supporterTurn=1;}},
    {label:'Supporter play locked',modify:s=>{
      s.players[0].cannotPlaySupporterCards=true;}},
    {label:'owner had paid GX too',modify:s=>{
      s.players[0].usedAlteredCreation=true;}},
    {label:'active Stoutland Sentinel negative',modify:s=>{
      const mon={fullName:'Stoutland BCR',name:'Stoutland',
        hp:140,attacks:[],powers:[{name:'Sentinel'}],
        cardType:[],retreat:[],weakness:[],resistance:[]};
      s.players[1].active={cards:[mon],getPokemonCard:()=>mon,
        damage:0,specialConditions:[],energies:{cards:[]},tools:[]};
    }}
  ];
  for(const {label,modify} of cases){
    const s=pair();modify(s);
    const view=observePublicPaidGxEffects(s,0);
    assert.equal(proposeRangerAfterPaidGx(view),null,label);
  }
});

test('public effect flags are absent if Ranger already cleared native state',()=>{
  const s=pair();
  s.players[1].alteredCreationDamage=false;
  s.players[1].usedAlteredCreation=false;
  const view=observePublicPaidGxEffects(s,0);
  assert.equal(view.opponentPublic.publicTurnRestrictions.gxUsed,true,
    'Original GX quota is visible and remains spent');
  assert.equal(view.opponentPublic.continuingPaidGxAttack
    .alteredCreationBonusPrize,false);
  assert.equal(proposeRangerAfterPaidGx(view),null);
});

test('poison concealed zones cannot disclose hidden deck/hand/Prizes',()=>{
  const s=pair();
  const poison=count=>new Proxy({length:count},{
    get(target,key){
      if(key==='length')return count;
      throw Error('Forbidden concealed card read '+String(key));
    }
  });
  s.players[0].deck.cards=poison(30);
  s.players[1].deck.cards=poison(35);
  s.players[1].hand.cards=poison(5);
  s.players[0].prizes[0].cards=poison(1);
  s.players[1].prizes[0].cards=poison(1);
  const view=observePublicPaidGxEffects(s,0);
  assert.equal(view.opponentPublic.handCount,5);
  assert.equal(view.ownPublic.deckCount,30);
  assert.equal(view.opponentPublic.deckCount,35);
  assert.equal(proposeRangerAfterPaidGx(view)?.kind,'play-ranger-paid-gx');
});
