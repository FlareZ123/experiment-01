'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {GENGAR,TREV,MEWTWO,shouldSeekPayload,selectPayloads} =
  require('../simulation/twinleaf/new-moon-compressor-payload-policy.cjs');

/** @returns {{state:object,player:object}} */
function fixture() {
  return {
    state:{phase:3,turn:2,prompts:[]},
    player:{
      active:{getPokemonCard:()=>({fullName:MEWTWO})},
      hand:{cards:[{name:'Battle Compressor',fullName:'Battle Compressor PHF'}]},
      deck:{cards:[{name:'opaque hidden deck card'}]},
      discard:{cards:[]},
      bench:[{getPokemonCard:()=>undefined}]
    }
  };
}

test('early Mewtwo and a held Compressor is an own-hand opportunity',()=>{
  const {state,player}=fixture();
  assert.equal(shouldSeekPayload(state,player,3),true);
});

test('search is declined if an attack payload is already accessible',()=>{
  const {state,player}=fixture();
  player.discard.cards=[{fullName:GENGAR}];
  assert.equal(shouldSeekPayload(state,player,3),false);
  player.discard.cards=[];
  player.bench[0].getPokemonCard=()=>({fullName:GENGAR});
  assert.equal(shouldSeekPayload(state,player,3),false);
  player.bench[0].getPokemonCard=()=>undefined;
  player.hand.cards.push({fullName:GENGAR});
  assert.equal(shouldSeekPayload(state,player,3),false);
});

test('source turn and action gates do not read hidden card identities',()=>{
  const {state,player}=fixture();
  state.turn=7;
  assert.equal(shouldSeekPayload(state,player,3),false);
  state.turn=2;state.phase=2;
  assert.equal(shouldSeekPayload(state,player,3),false);
  state.phase=3;state.prompts=[{result:undefined}];
  assert.equal(shouldSeekPayload(state,player,3),false);
  state.prompts=[];player.deck.cards=[];
  assert.equal(shouldSeekPayload(state,player,3),false);
});

test('owner prompt selects Gengar and Trevenant in priority order',()=>{
  const gengar={fullName:GENGAR},trev={fullName:TREV};
  const junk={fullName:'Battle VIP Pass FST'};
  assert.deepEqual(selectPayloads([junk,trev,gengar],3),[gengar,trev]);
  assert.deepEqual(selectPayloads([junk,trev,gengar],1),[gengar]);
  assert.deepEqual(selectPayloads([junk,trev],3),[trev]);
  assert.deepEqual(selectPayloads([junk],3),[]);
  assert.deepEqual(selectPayloads([gengar],0),[]);
});
