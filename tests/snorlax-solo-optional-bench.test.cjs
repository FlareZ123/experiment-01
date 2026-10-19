'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {withSoloSnorlaxOpening} =
  require('../simulation/twinleaf/snorlax-solo-opening-policy.cjs');

const firstSnorlax = {fullName:'Snorlax PGO',stage:'BASIC',superType:'POKEMON'};
const secondSnorlax = {fullName:'Snorlax PGO',stage:'BASIC',superType:'POKEMON'};
const otherBasic = {fullName:'Mimikyu PAL',stage:'BASIC',superType:'POKEMON'};

class ChooseCardsPrompt {
  /** @param {{id:number,phase:string,playerId?:number}} args */
  constructor({id,phase,playerId=101}) {
    this.id=id;
    this.message='starting';
    this.playerId=playerId;
    this.phase=phase;
  }
  /** @param {object[]} cards */
  validate(cards) {
    if(this.phase==='active')return cards.length===1;
    if(this.phase==='bench')return cards.length<=5;
    return false;
  }
}
class ResolvePromptAction {
  /** @param {number} id @param {object[]} result */
  constructor(id,result) {this.id=id;this.result=result;}
}
class ChooseCardsPromptResolver {
  resolvePrompt(_state,player,prompt) {
    return new ResolvePromptAction(prompt.id,player.hand.cards);
  }
}
const types={
  ChooseCardsPrompt,ResolvePromptAction,ChooseCardsPromptResolver,
  GameMessage:{CHOOSE_STARTING_POKEMONS:'starting'}
};

/** @param {object} options @param {object[]} events */
function getResolver(options,events) {
  return new (withSoloSnorlaxOpening(
    {promptResolvers:[ChooseCardsPromptResolver]},types,events,options
  ).promptResolvers[0])();
}

test('opt-in selects first Active Snorlax and declines legal optional second Bench prompt',()=>{
  const events=[];
  const resolver=getResolver({declineOptionalBench:true},events);
  const board={pokemon:null,bench:[]};
  const player={
    id:101,hand:{cards:[firstSnorlax,otherBasic]},
    active:{getPokemonCard:()=>board.pokemon},
    bench:board.bench
  };
  const first=resolver.resolvePrompt({},player,
    new ChooseCardsPrompt({id:5,phase:'active'}));
  assert.deepEqual(first.result,[firstSnorlax]);
  board.pokemon=firstSnorlax;
  player.hand.cards=[secondSnorlax,otherBasic];
  const second=resolver.resolvePrompt({},player,
    new ChooseCardsPrompt({id:12,phase:'bench'}));
  assert.deepEqual(second.result,[]);
  assert.equal(events.length,2);
  assert.equal(events[0].appliedSoloSnorlax,true);
  assert.equal(events[1].alreadySoloBefore,true);
  assert.equal(events[1].declinedOptionalBench,true);
  assert.equal(events[1].selectedCount,0);
});

test('default and non-solo board retain the original held-Snorlax selection',()=>{
  for(const [options,active] of [[{},firstSnorlax],
    [{declineOptionalBench:true},otherBasic]]) {
    const events=[];
    const resolver=getResolver(options,events);
    const player={
      id:101,hand:{cards:[secondSnorlax,otherBasic]},
      active:{getPokemonCard:()=>active},
      bench:[{getPokemonCard:()=>null}]
    };
    const result=resolver.resolvePrompt({},player,
      new ChooseCardsPrompt({id:12,phase:'bench'}));
    assert.deepEqual(result.result,[secondSnorlax]);
    assert.equal(events[0].declinedOptionalBench,false);
  }
});

test('a nonoptional second prompt cannot be answered with an empty Bench selection',()=>{
  const events=[];
  const resolver=getResolver({declineOptionalBench:true},events);
  const player={
    id:101,hand:{cards:[secondSnorlax]},
    active:{getPokemonCard:()=>firstSnorlax},
    bench:[]
  };
  const p=new ChooseCardsPrompt({id:12,phase:'active'});
  const result=resolver.resolvePrompt({},player,p);
  assert.deepEqual(result.result,[secondSnorlax]);
  assert.equal(events[0].declinedOptionalBench,false);
});
