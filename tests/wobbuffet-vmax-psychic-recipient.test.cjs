'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');
const {chooseWobbuffetVmaxRecipient,withWobbuffetVmaxPsychicRecipient} =
  require('../simulation/twinleaf/wobbuffet-vmax-psychic-recipient.cjs');

const psychic = () => ({name:'Psychic Energy'});
const spot = (name,energy=0) => ({
  getPokemonCard:() => ({name}),
  energies:{cards:Array.from({length:energy},psychic)}
});
const cardTarget = (slot,index=0) => ({player:'BOTTOM_PLAYER',slot,index});
class PlayCardAction {
  constructor(playerId,handIndex,target){
    this.playerId=playerId;this.handIndex=handIndex;this.target=target;
  }
}
class SimpleTacticsAi {
  constructor(id,proposed,valid=true){
    this.client={id};this.proposed=proposed;this.valid=valid;
  }
  decodeNextAction(){return this.proposed;}
  isValidAction(){return this.valid;}
}
const deps={SimpleTacticsAi,GamePhase:{PLAYER_TURN:'turn'},
  PlayCardAction,PlayerType:{BOTTOM_PLAYER:'BOTTOM_PLAYER'},
  SlotType:{BENCH:'BENCH'}};
const our = (bench,opts={}) => ({
  id:101,hand:{cards:[psychic()]},
  active:spot(opts.active||'Wobbuffet'), bench,
  energyPlayedTurn:opts.energyPlayedTurn||0,
  deck:{cards:[]},prizes:[]
});
const make = (own,proposed,targetId=101) => ({
  state:{turn:12,phase:'turn',activePlayer:0,prompts:[],
    players:[own,{id:202,hand:{cards:[]},deck:{cards:[]},prizes:[]}]},
  bot:new SimpleTacticsAi(targetId,proposed)
});
const evaluate = f => withWobbuffetVmaxPsychicRecipient(0,
  ()=>f.bot.decodeNextAction(f.state),deps);

test('selects closest sub-three Shadow Rider while Wobbuffet remains Active',()=>{
  assert.deepEqual(chooseWobbuffetVmaxRecipient(our([
    spot('Latias ex',2), spot('Shadow Rider Calyrex VMAX',0),
    spot('Shadow Rider Calyrex VMAX',2)])), {index:2,psychicBefore:2});
});
test('rank24-like holder redirects ordinary attachment away from support',()=>{
  const own=our([spot('Latias ex',2),spot('Shadow Rider Calyrex VMAX'),
    spot('Shadow Rider Calyrex VMAX')]);
  const original=new PlayCardAction(101,0,cardTarget('BENCH',0));
  const f=make(own,original);
  const result=evaluate(f);
  assert.deepEqual(result.result.target,cardTarget('BENCH',1));
  assert.equal(result.policyAudit.events[0].kind,'redirect-psychic-to-vmax');
  assert.equal(result.policyAudit.hiddenInformationSafeFullGame,false);
  assert.equal(f.bot.decodeNextAction(f.state),original,'prototype restored');
});
test('already ready or absent Wobbuffet means no redirect',()=>{
  for(const own of [our([spot('Shadow Rider Calyrex VMAX',3)]),
    our([spot('Shadow Rider Calyrex VMAX',0)],{active:'Latias ex'})]){
    const proposed=new PlayCardAction(101,0,cardTarget('ACTIVE'));
    assert.equal(evaluate(make(own,proposed)).result,proposed);
  }
});
test('failed Store validity and decisions of the wrong actor preserve action',()=>{
  const own=our([spot('Shadow Rider Calyrex VMAX',0)]);
  const proposed=new PlayCardAction(101,0,cardTarget('ACTIVE'));
  const f=make(own,proposed);f.bot.valid=false;
  assert.equal(evaluate(f).result,proposed);
  assert.equal(evaluate(make(own,proposed,202)).result,proposed);
});
test('held Psychic without an attachment decision is left to original bot',()=>{
  const proposed={kind:'PassTurnAction'};
  assert.equal(evaluate(make(our([spot('Shadow Rider Calyrex VMAX')]),proposed)).result,proposed);
});
test('pure target and redirect ignore arbitrary concealed opponent zones',()=>{
  const own=our([spot('Latias ex',2),spot('Shadow Rider Calyrex VMAX',1)]);
  const proposed=new PlayCardAction(101,0,cardTarget('ACTIVE'));
  const a=make(own,proposed);
  const b=make(own,proposed);
  b.state.players[1].hand.cards=[{name:'Rare Candy'}];
  b.state.players[1].deck.cards=[{name:'Ultra Ball'}];
  b.state.players[1].prizes=[{cards:[{name:'Boss Orders'}]}];
  assert.deepEqual(evaluate(a).result.target,evaluate(b).result.target);
});
test('unfinished prompt and already spent attachment do not redirect',()=>{
  const own=our([spot('Shadow Rider Calyrex VMAX')],{energyPlayedTurn:12});
  const proposed=new PlayCardAction(101,0,cardTarget('ACTIVE'));
  assert.equal(evaluate(make(own,proposed)).result,proposed);
  own.energyPlayedTurn=0;
  const f=make(own,proposed);f.state.prompts=[{result:undefined}];
  assert.equal(evaluate(f).result,proposed);
});
