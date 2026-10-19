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

test('discard and Bench Gengar stop search; held Gengar does not',()=>{
  const {state,player}=fixture();
  player.discard.cards=[{fullName:GENGAR}];
  assert.equal(shouldSeekPayload(state,player,3),false);
  player.discard.cards=[];
  player.bench[0].getPokemonCard=()=>({fullName:GENGAR});
  assert.equal(shouldSeekPayload(state,player,3),false);
  player.bench[0].getPokemonCard=()=>undefined;
  player.hand.cards.push({fullName:GENGAR});
  assert.equal(shouldSeekPayload(state,player,3),true,
    'A Gengar held in hand cannot supply the Perfection donor zone');
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

test('public Item lock removes the Compressor action opportunity',()=>{
  const {state,player}=fixture();
  player.cannotPlayItemCards=true;
  assert.equal(shouldSeekPayload(state,player,3),false);
  player.cannotPlayItemCards=false;
  assert.equal(shouldSeekPayload(state,player,3),true);
});

test('benched Mewtwo can trigger anticipatory setup only in explicit v2 mode',()=>{
  const {state,player}=fixture();
  player.active.getPokemonCard=()=>({fullName:'Trevenant & Dusknoir-GX SMP'});
  player.bench[0].getPokemonCard=()=>({fullName:MEWTWO});
  assert.equal(shouldSeekPayload(state,player,3),false,
    'Archived source control remains Active-Mewtwo-only');
  assert.equal(shouldSeekPayload(state,player,3,{
    allowBenchedMewtwo:true
  }),true);
  player.cannotPlayItemCards=true;
  assert.equal(shouldSeekPayload(state,player,3,{
    allowBenchedMewtwo:true
  }),false);
  player.cannotPlayItemCards=false;
  player.discard.cards=[{fullName:GENGAR}];
  assert.equal(shouldSeekPayload(state,player,3,{
    allowBenchedMewtwo:true
  }),false,'Existing donor must suppress anticipatory discard');
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
