'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {isRank11BoostShakeCandidate}=
  require('../simulation/twinleaf/rank11-boostshake-opening-eligibility.cjs');

/**
 * @param {{active?:string,toolCount?:number,benchCount?:number,
 *  vip?:boolean,float?:boolean,turn?:number,playerId?:number,
 *  activePlayer?:number,usedVSTAR?:boolean}} [options]
 */
function position(options={}) {
  const values={active:'Oranguru V',toolCount:0,benchCount:1,
    vip:true,float:true,turn:1,playerId:101,
    activePlayer:0,usedVSTAR:false,...options};
  const state={turn:values.turn,activePlayer:values.activePlayer};
  const player={id:values.playerId,usedVSTAR:values.usedVSTAR,
    active:{getPokemonCard:()=>({name:values.active}),
      tools:Array(values.toolCount).fill({name:'Float Stone'})},
    bench:Array.from({length:5},(_,i)=>({
      getPokemonCard:()=>i<values.benchCount ? {name:'Crobat V'} : null
    })),
    hand:{cards:[
      ...(values.vip?[{name:'Battle VIP Pass'}]:[]),
      ...(values.float?[{name:'Float Stone'}]:[])
    ]}
  };
  return [state,player];
}

test('a first-turn public board and own hand enable a conditional attempt',()=>{
  assert.equal(isRank11BoostShakeCandidate(...position()),true);
});

test('it abstains on unavailable or overcommitted resources',()=>{
  for(const config of [
    {active:'Crobat V'}, {toolCount:1}, {benchCount:5},
    {vip:false}, {turn:2},{activePlayer:1},
    {playerId:202},{usedVSTAR:true}
  ]) assert.equal(isRank11BoostShakeCandidate(...position(config)),false,
    JSON.stringify(config));
});

test('Back Order can obtain Float Stone at K1 when it is absent at K0',()=>{
  assert.equal(isRank11BoostShakeCandidate(...position({float:false})),true);
});

test('the K0 eligibility guard does not access hidden deck or Prize cards',()=>{
  const [state,player]=position();
  Object.defineProperty(player,'deck',{get(){throw Error('deck leak')}});
  Object.defineProperty(player,'prizes',{get(){throw Error('Prize leak')}});
  assert.equal(isRank11BoostShakeCandidate(state,player),true);
});
