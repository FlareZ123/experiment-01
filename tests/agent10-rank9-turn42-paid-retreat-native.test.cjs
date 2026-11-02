'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {withRank9Turn42PaidRetreat}=
  require('../simulation/twinleaf/agent10-rank9-turn42-paid-retreat-native.cjs');
class AddPlayerAction{}
class PassTurnAction{}
class RetreatAction{
  constructor(id,benchIndex){this.id=id;this.benchIndex=benchIndex;}
}
class FakeStore{
  constructor(state){this.state=state;this.accepted=[];}
  dispatch(action){this.accepted.push(action.constructor.name);return true;}
}
class FakeBot{
  constructor(){this.client={id:202};this.valid=true;}
  isValidAction(){return this.valid;}
  decodeNextAction(){return new PassTurnAction();}
}
function player(seat){
  const mk=(name,energies=[])=>({
    getPokemonCard:()=>name?{fullName:name}:null,
    energies:{cards:energies.map(fullName=>({fullName}))}
  });
  return {
    id:seat===0?101:202,
    active:seat===1?mk('Electrode-GX CES',
      ['Prism Energy ASC','Darkness Energy MEE']):mk('Klefki SVI'),
    bench:seat===1?[mk('Unown AOR'),
      mk('Mega Absol ex M1L',
        ['Telepath [P] Energy M3','Prism Energy ASC','Prism Energy ASC'])]:[],
    retreatedTurn:0
  };
}
function state(){
  return {turn:42,activePlayer:1,phase:'PLAYER_TURN',prompts:[],
    players:[player(0),player(1)]};
}
test('only second physical Store gets exact source root and reversible correct Bench index',()=>{
  const beforeBot=FakeBot.prototype.decodeNextAction;
  const beforeStore=FakeStore.prototype.dispatch;
  const result=withRank9Turn42PaidRetreat(()=>{
    const controls=[];
    for(let i=0;i<4;i++){
      const s=new FakeStore(state());s.dispatch(new AddPlayerAction());
      s.dispatch(new AddPlayerAction());
      const action=new FakeBot().decodeNextAction(s.state);
      s.dispatch(action);controls.push(action);
    }
    return controls;
  },{Bot:FakeBot,Store:FakeStore,RetreatAction,
    GamePhase:{PLAYER_TURN:'PLAYER_TURN'}});
  assert.equal(result.result.length,4);
  assert.deepEqual(result.result.map(x=>x.constructor.name),
    ['PassTurnAction','RetreatAction','PassTurnAction','PassTurnAction']);
  assert.equal(result.result[1].benchIndex,1);
  assert.equal(result.audit.acceptedRoots.length,1);
  assert.equal(result.audit.attempts.length,1);
  assert.equal(result.audit.attempts[0].nativeIsValidAction,true);
  assert.strictEqual(FakeBot.prototype.decodeNextAction,beforeBot);
  assert.strictEqual(FakeStore.prototype.dispatch,beforeStore);
});

test('native invalid Retreat proposal abstains without changing actor',()=>{
  const result=withRank9Turn42PaidRetreat(()=>{
    for(let i=0;i<2;i++){
      const s=new FakeStore(state());s.dispatch(new AddPlayerAction());
      const bot=new FakeBot();bot.valid=false;
      const action=bot.decodeNextAction(s.state);s.dispatch(action);
    }
    return 'ok';
  },{Bot:FakeBot,Store:FakeStore,RetreatAction,
    GamePhase:{PLAYER_TURN:'PLAYER_TURN'}});
  assert.equal(result.audit.selected,false);
  assert.equal(result.audit.attempts[0].nativeIsValidAction,false);
  assert.equal(result.audit.acceptedRoots.length,0);
});

test('rejected Store sequence carries evidence and restores prototypes',()=>{
  const original=FakeStore.prototype.dispatch;
  const beforeBot=FakeBot.prototype.decodeNextAction;
  assert.throws(()=>withRank9Turn42PaidRetreat(()=>{
    const s=new FakeStore(state());s.dispatch(new AddPlayerAction());
    throw new Error('forced native failure');
  },{Bot:FakeBot,Store:FakeStore,RetreatAction,
    GamePhase:{PLAYER_TURN:'PLAYER_TURN'}}),e=>
    e.message==='forced native failure'&&
    e.agent10Rank9Turn42Fork.storeCount===1);
  assert.strictEqual(FakeStore.prototype.dispatch,original);
  assert.strictEqual(FakeBot.prototype.decodeNextAction,beforeBot);
});
