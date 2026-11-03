'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {withOwnerEarlyCompressorAfterPass}=
 require('../simulation/twinleaf/agent1-raichu-actor-compressor-bridge.cjs');
const GamePhase={PLAYER_TURN:1};
class PassTurnAction{constructor(id){this.playerId=id;}}
class PlayCardAction{
 constructor(id,handIndex,target){this.playerId=id;this.handIndex=handIndex;
  this.target=target;}
}
class AddPlayerAction{}
class Bot{
 constructor(id){this.client={id};}
 decodeNextAction(){return new PassTurnAction(this.client.id);}
}
class Store{
 constructor(state){this.state=state;}
 dispatch(action){
  if(action instanceof PlayCardAction){
   const owner=this.state.players.find(p=>p.id===action.playerId);
   owner.discard.cards.push(owner.hand.cards.splice(action.handIndex,1)[0]);
  }
  return action;
 }
}
const deps={SimpleTacticsAi:Bot,Store,GamePhase,
 cardActions:{PlayCardAction,PlayerType:{ANY:0},SlotType:{BOARD:0}}};
function game({seat=1,turn=2,name='Pikachu XY',locked=false,
 held=true,canPlay=true}={}){
 const own={id:20,active:{getPokemonCard:()=>({fullName:name})},
  bench:[],hand:{cards:held?[{name:'Battle Compressor',
   fullName:'Battle Compressor PHF',canPlay:()=>canPlay}]:[]},
  deck:{cards:[{}]},discard:{cards:[]},cannotPlayItemCards:locked};
 const opponent={id:10,
  get hand(){throw Error('opponent private hand read');},
  get deck(){throw Error('opponent private deck read');}};
 const players=seat===1?[opponent,own]:[own,opponent];
 return {turn,players,activePlayer:seat,phase:GamePhase.PLAYER_TURN,
  prompts:[]};
}
function run(opts,mutator){
 const state=game(opts),store=new Store(state),seat=opts?.seat??1;
 return withOwnerEarlyCompressorAfterPass(()=>{
  store.dispatch(new AddPlayerAction());
  const action=new Bot(20).decodeNextAction(mutator?mutator(state):state);
  if(!mutator)store.dispatch(action);
  return {action,state};
 },seat,deps);
}
test('genuine owner early Pass yields native-accepted physical Item',()=>{
 const {result,audit}=run();
 assert.ok(result.action instanceof PlayCardAction);
 assert.equal(audit.ownerPrerequisitesMet,1);
 assert.equal(audit.nativeCanPlayTrue,1);
 assert.equal(audit.proposed,1);
 assert.equal(audit.accepted,1);
 assert.equal(audit.rejected,0);
 assert.equal(result.state.players[1].discard.cards[0].name,'Battle Compressor');
 assert.equal(audit.events[0].genuineOwnerDiscardObserved,true);
 assert.equal(Bot.prototype.decodeNextAction.name,'decodeNextAction');
});
test('source cannot play a missing, locked, or late Compressor',()=>{
 for(const options of [{held:false},{locked:true},
  {name:'Unown AOR'},{turn:3}]){
  const x=run(options);
  assert.ok(x.result.action instanceof PassTurnAction);
  assert.equal(x.audit.accepted,0);
 }
});
test('native canPlay refusal preserves actual root Pass',()=>{
 const x=run({canPlay:false});
 assert.ok(x.result.action instanceof PassTurnAction);
 assert.equal(x.audit.ownerPrerequisitesMet,1);
 assert.equal(x.audit.nativeCanPlayTrue,0);
 assert.equal(x.audit.events[0].preflight,'native-canPlay-false');
});
test('genuine source seat zero can use identical owner-only policy',()=>{
 const x=run({seat:0,name:'Voltorb ROS'});
 assert.ok(x.result.action instanceof PlayCardAction);
 assert.equal(x.audit.accepted,1);
});
test('cloned hypothetical State does not receive native intervention',()=>{
 const x=run({},state=>({...state}));
 assert.ok(x.result.action instanceof PassTurnAction);
 assert.equal(x.audit.proposed,0);
});
test('observer restores both original native prototypes on exception',()=>{
 const decode=Bot.prototype.decodeNextAction;
 const dispatch=Store.prototype.dispatch;
 assert.throws(()=>withOwnerEarlyCompressorAfterPass(
  ()=>{throw Error('native engine aborted');},1,deps));
 assert.strictEqual(Bot.prototype.decodeNextAction,decode);
 assert.strictEqual(Store.prototype.dispatch,dispatch);
});
