'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnerRondoRetreatFromPass}=require(
  '../simulation/twinleaf/agent6-rank30-actor-rondo-retreat.cjs');

class PassTurnAction{}
class AttackAction{}

/** @returns {object} Mock native source state with only owner-public cards. */
function example(){
  const clefairy={fullName:"Lillie's Clefairy ex JTG",
    attacks:[{name:'Full Moon Rondo'}]};
  return {turn:30,phase:2,activePlayer:1,prompts:[],
    players:[null,{
      id:202,retreatedTurn:21,
      active:{getPokemonCard:()=>({fullName:'Latias ex SSP',
        powers:[{name:'Skyliner'}]}),specialConditions:[]},
      bench:[{getPokemonCard:()=>clefairy,
        energies:{cards:[{fullName:'Psychic Energy MEE'},
          {fullName:'Psychic Energy MEE'}]}}]
    }]};
}
const CONFIG={sourceSeat:1,targetTurn:30};
const select=(state,action=new PassTurnAction(),id=202)=>
  chooseOwnerRondoRetreatFromPass(state,action,id,CONFIG);

test('owner active Latias and two Psychic on Clefairy proposes one retreat',()=>{
  assert.deepEqual(select(example()),{
    index:0,active:'Latias ex SSP',
    bench:"Lillie's Clefairy ex JTG",turn:30
  });
});

test('no mutation or reads of the opponent public or hidden state',()=>{
  const state=example(),owner=state.players[1];
  state.players=new Proxy(state.players,{
    get(target,key){if(key==='0')throw Error('opponent accessed');
      return Reflect.get(target,key);}
  });
  assert.equal(select(state)?.index,0);
  assert.equal(owner.bench[0].energies.cards.length,2);
});

test('never intercepts an actual attack or different owner',()=>{
  assert.equal(select(example(),new AttackAction()),null);
  assert.equal(select(example(),new PassTurnAction(),101),null);
});

test('retreat may occur only on the scoped owner turn and before retreat use',()=>{
  for(const [field,value] of [
    ['turn',31],['phase',1],['activePlayer',0]]){
    const state=example();state[field]=value;
    assert.equal(select(state),null);
  }
  const state=example();state.players[1].retreatedTurn=30;
  assert.equal(select(state),null);
});

test('preserves mandatory native prompts and blocked status',()=>{
  const prompt=example();prompt.prompts=[{result:undefined}];
  assert.equal(select(prompt),null);
  for(const condition of ['ASLEEP','PARALYZED']){
    const state=example();state.players[1].active.specialConditions=[
      condition];
    assert.equal(select(state),null);
  }
});

test('requires printed exact Active ability and target attack',()=>{
  const noSkyliner=example();
  noSkyliner.players[1].active.getPokemonCard=()=>
    ({fullName:'Latias ex SSP',powers:[]});
  assert.equal(select(noSkyliner),null);
  const other=example();other.players[1].bench[0].getPokemonCard=()=>
    ({fullName:"Lillie's Clefairy ex JTG",attacks:[]});
  assert.equal(select(other),null);
});

test('requires two real attached Psychic cards to the same target',()=>{
  for(const energy of [
    [{fullName:'Psychic Energy MEE'}],
    [{fullName:'Psychic Energy MEE'},{fullName:'Double Colorless Energy XY'}]
  ]){
    const state=example();state.players[1].bench[0].energies.cards=energy;
    assert.equal(select(state),null);
  }
});

test('chooses first eligible occupied Bench index without inspecting others',()=>{
  const state=example(),p=state.players[1];
  const funded=p.bench[0];p.bench=[
    {getPokemonCard:()=>({fullName:'Mimikyu SM12'}),energies:{cards:[]}},
    funded
  ];
  assert.equal(select(state)?.index,1);
});
