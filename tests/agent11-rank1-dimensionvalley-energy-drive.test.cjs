'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,ownerStadiumIndex,probeStadiumThenEnergyDrive}=
  require('../simulation/twinleaf/agent11-rank1-dimensionvalley-energy-drive-probe.cjs');

/** @returns {object} Minimal genuine acting-owner observation facsimile. */
function ownerView(){
  return {decisionKind:'owner-root',globalTurn:16,
    ownPublic:{active:{printing:'Tapu Lele-GX GRI'}},
    ownHand:['Float Stone BKT','Dimension Valley PHF','VS Seeker PHF']};
}

/** @returns {object} Isolated small fake Store state with explicit source owner. */
function stateFixture(){
  return {turn:16,stadium:null,prompts:[],players:[
    {id:1,hand:{cards:ownerView().ownHand.map(fullName=>({fullName}))},
      active:{damage:0,energies:{cards:[{fullName:'Psychic Energy MEE'}]}},
      prizes:[{}, {}, {}, {}, {}, {}]},
    {id:2,hand:{cards:[{fullName:'secret opponent card'}]},
      active:{damage:0,energies:{cards:[]}},
      prizes:[{}, {}, {}, {}, {}, {}]}
  ]};
}

class PlayCardAction{
  constructor(id,handIndex,target){
    this.id=id;this.handIndex=handIndex;this.target=target;
  }
}
class AttackAction{
  constructor(id,name){this.id=id;this.name=name;}
}
class MockStore{
  constructor(){this.state=null;}
  dispatch(action){
    const owner=this.state.players.find(p=>p.id===action.id);
    if(action.constructor===PlayCardAction){
      if(this.state.stadiumBlocked)throw Error('CANNOT_PLAY_STADIUM');
      const card=owner.hand.cards.splice(action.handIndex,1)[0];
      this.state.stadium=card;return this.state;
    }
    if(action.constructor===AttackAction){
      if(!this.state.stadium)throw Error('INSUFFICIENT_ENERGY');
      this.state.players[1].active.damage+=20;return this.state;
    }
    throw Error('unexpected action');
  }
}
const deps={
  utils:{deepClone:state=>JSON.parse(JSON.stringify(state))},
  StoreModule:{Store:MockStore},
  gameActions:{AttackAction},
  playActions:{PlayCardAction,PlayerType:{BOTTOM_PLAYER:2},
    SlotType:{BOARD:0}},
  stateUtils:{StateUtils:{getStadiumCard:state=>state.stadium}}
};

test('owner-only exact target requires real hand-held printing, turn and Active',()=>{
  assert.equal(ownerStadiumIndex(ownerView()),1);
  assert.equal(ownerStadiumIndex({...ownerView(),globalTurn:18}),-1);
  assert.equal(ownerStadiumIndex({...ownerView(),ownHand:[]}),-1);
  assert.equal(ownerStadiumIndex({...ownerView(),
    ownPublic:{active:{printing:'Marshadow UNB'}}}),-1);
});

test('unmodified exact source is cloned for baseline and Stadium then attack',()=>{
  const state=stateFixture(),before=JSON.stringify(state);
  const originalRandom=Math.random;
  const result=probeStadiumThenEnergyDrive(state,1,ownerView(),deps);
  assert.equal(result.schema,VERSION);
  assert.equal(result.targetTurnMatched,true);
  assert.equal(result.baselineAttackAccepted,false);
  assert.equal(result.stadiumNativeAccepted,true);
  assert.equal(result.stadiumPhysicalMove,true);
  assert.equal(result.stadiumEffectiveInPlay,true);
  assert.equal(result.attackNativeAccepted,true);
  assert.equal(result.attackSettled,true);
  assert.equal(result.opponentDamageBefore,0);
  assert.equal(result.opponentDamageAfter,20);
  assert.equal(result.opponentPrizesAfter,6);
  assert.deepEqual(result.activeEnergyPrintings,['Psychic Energy MEE']);
  assert.equal(JSON.stringify(state),before);
  assert.strictEqual(Math.random,originalRandom);
});

test('native Stadium refusal is retained as refusal, original Store preserved',()=>{
  const state=stateFixture();state.stadiumBlocked=true;
  const before=JSON.stringify(state);
  const result=probeStadiumThenEnergyDrive(state,1,ownerView(),deps);
  assert.equal(result.baselineAttackAccepted,false);
  assert.equal(result.status,'stadium-native-rejected');
  assert.equal(result.stadiumNativeAccepted,false);
  assert.equal(result.attackNativeAccepted,false);
  assert.match(result.errors[0].message,/CANNOT_PLAY_STADIUM/);
  assert.equal(JSON.stringify(state),before);
});

test('missing held Stadium is absent without touching Store or random',()=>{
  const view={...ownerView(),ownHand:['Float Stone BKT']};
  const r=probeStadiumThenEnergyDrive(stateFixture(),1,view,deps);
  assert.equal(r.status,'target-state-not-present');
  assert.equal(r.targetTurnMatched,false);
});
