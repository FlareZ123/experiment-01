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

test('explicit second-donor activation repairs Gengar-established Night Watch blind spot',()=>{
  const {state,player}=fixture();
  player.discard.cards=[{fullName:GENGAR}];
  assert.equal(shouldSeekPayload(state,player,3),false,
    'The archived first-donor policy must remain unchanged');
  assert.equal(shouldSeekPayload(state,player,3,{allowTrevenantOnly:true}),true,
    'A missing Trevenant donor can justify owner Compressor after Gengar is established');
  player.hand.cards.push({fullName:TREV});
  assert.equal(shouldSeekPayload(state,player,3,{allowTrevenantOnly:true}),false,
    'A held Trevenant is unavailable to the deck search and must not trigger it');
  player.hand.cards.pop();
  player.discard.cards.push({fullName:TREV});
  assert.equal(shouldSeekPayload(state,player,3,{allowTrevenantOnly:true}),false);
  player.discard.cards.pop();
  player.bench[0].getPokemonCard=()=>({fullName:TREV});
  assert.equal(shouldSeekPayload(state,player,3,{allowTrevenantOnly:true}),false);
  player.bench[0].getPokemonCard=()=>undefined;
  player.cannotPlayItemCards=true;
  assert.equal(shouldSeekPayload(state,player,3,{allowTrevenantOnly:true}),false);
  player.cannotPlayItemCards=false;
  player.deck.cards=[{name:'Unknown A'},{name:'Unknown B'}];
  assert.equal(shouldSeekPayload(state,player,3,{allowTrevenantOnly:true}),true,
    'Pre-search decision must be independent of unidentified owner deck-card identities');
  player.deck.cards=[{name:'Unknown C'},{name:'Unknown D'}];
  assert.equal(shouldSeekPayload(state,player,3,{allowTrevenantOnly:true}),true);
  player.discard.cards=[];
  player.bench[0].getPokemonCard=()=>({fullName:GENGAR});
  assert.equal(shouldSeekPayload(state,player,3),false);
  assert.equal(shouldSeekPayload(state,player,3,{allowTrevenantOnly:true}),true);
});

test('versioned late turn window opens the observed owner-only midgame opportunity',()=>{
  const {state,player}=fixture();
  state.turn=11;
  assert.equal(shouldSeekPayload(state,player,3),false);
  assert.equal(shouldSeekPayload(state,player,3,{maxGlobalTurn:14}),true);
  state.turn=13;
  assert.equal(shouldSeekPayload(state,player,3,{maxGlobalTurn:14}),true);
  state.turn=15;
  assert.equal(shouldSeekPayload(state,player,3,{maxGlobalTurn:14}),false);
  player.cannotPlayItemCards=true;
  state.turn=11;
  assert.equal(shouldSeekPayload(state,player,3,{maxGlobalTurn:14}),false);
});

test('observed turn-31 and turn-33 owner Compressor frontier requires explicit any-turn opt-in',()=>{
  const {state,player}=fixture();
  const anyTurn={maxGlobalTurn:Number.POSITIVE_INFINITY};
  for(const turn of [31,33]){
    state.turn=turn;
    assert.equal(shouldSeekPayload(state,player,3),false);
    assert.equal(shouldSeekPayload(state,player,3,{maxGlobalTurn:14}),false);
    assert.equal(shouldSeekPayload(state,player,3,anyTurn),true);
  }
  // Pre-search decisions must not inspect identities in the unknown deck.
  player.deck.cards=[{fullName:'Opaque A'}];
  assert.equal(shouldSeekPayload(state,player,3,anyTurn),true);
  player.deck.cards=[{fullName:'Opaque B'}];
  assert.equal(shouldSeekPayload(state,player,3,anyTurn),true);
  player.cannotPlayItemCards=true;
  assert.equal(shouldSeekPayload(state,player,3,anyTurn),false);
  player.cannotPlayItemCards=false;
  player.discard.cards=[{fullName:GENGAR}];
  assert.equal(shouldSeekPayload(state,player,3,anyTurn),false);
  player.discard.cards=[];
  state.prompts=[{result:undefined}];
  assert.equal(shouldSeekPayload(state,player,3,anyTurn),false);
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
