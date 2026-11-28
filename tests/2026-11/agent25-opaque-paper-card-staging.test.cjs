'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  opaquePaperCard,getOpaque,assertOpaqueQuarantined,
  resolvePaperPrintedCard,EXACT_PAPER_PRINTING_ALIASES
}=require('../../simulation/twinleaf/agent25-opaque-paper-card-staging.cjs');

class StubCard{
  constructor(){this.name='';this.fullName='';}
}
const native={TrainerCard:StubCard,PokemonCard:StubCard,EnergyCard:StubCard};
const item=(name,set,number,category='Trainer')=>({
  name,printing:{set,number},category
});
function stateWith(opaque,zone){
  const slot=()=>({cards:[],tools:[],energies:{cards:[]}});
  const player=()=>({
    active:slot(),bench:Array.from({length:5},slot),
    hand:{cards:[]},discard:{cards:[]},stadium:{cards:[]},
    supporter:{cards:[]},deck:{cards:[]},prizes:[{cards:[]}]
  });
  const state={players:[player(),player()]};
  if(zone==='prizes')state.players[0].prizes[0].cards.push(opaque);
  else if(zone==='bench')state.players[0].bench[0].cards.push(opaque);
  else state.players[0][zone].cards.push(opaque);
  return state;
}
test('native Great Tree and ASCII Pokemon Ranger are aliases only under matching actual printed collector',()=>{
  const manager={getCardByName:name=>({
    'Great Tree SCR':{set:'SCR',setNumber:'136',fullName:name},
    'Pokemon Ranger STS':{set:'STS',setNumber:'104',fullName:name}
  })[name]??null};
  assert.deepEqual(resolvePaperPrintedCard(manager,item('Grand Tree','SCR','136')).alias,{
    sourcePrinting:'Grand Tree SCR',nativePrinting:'Great Tree SCR',printId:'SCR 136'
  });
  assert.deepEqual(resolvePaperPrintedCard(manager,item('Pokémon Ranger','STS','104')).alias,{
    sourcePrinting:'Pokémon Ranger STS',nativePrinting:'Pokemon Ranger STS',printId:'STS 104'
  });
  assert.throws(()=>resolvePaperPrintedCard(manager,item('Grand Tree','SCR','137')));
  assert.throws(()=>resolvePaperPrintedCard(manager,item('Pokémon Ranger','STS','105')));
  assert.equal(EXACT_PAPER_PRINTING_ALIASES['Grand Tree SCR'].number,'136');
});
test('semantic-only Lillie native M1L bridge requires complete shuffle/draw 6 or 8 wording',()=>{
  const good={fullName:"Lillie's Determination M1L",text:'Shuffle your hand into your deck. Then, draw 6 cards. If you have exactly 6 Prize cards remaining, draw 8 cards instead.'};
  const bad={...good,text:'Draw 3 cards.'};
  const manager=card=>({getCardByName:name=>
    name==="Lillie's Determination M1L"?card:null});
  const row=item("Lillie's Determination",'MEG','119');
  const hit=resolvePaperPrintedCard(manager(good),row);
  assert.equal(hit.alias.aliasKind,'verified-semantic-reprint');
  assert.equal(hit.card,good);
  assert.equal(resolvePaperPrintedCard(manager(bad),row).card,null);
  assert.equal(resolvePaperPrintedCard(manager(good),item("Lillie's Determination",'MEG','120')).card,null);
});
test('unsupported original printing is inert only in hidden zones, never playable or exposed',()=>{
  const row=item('Unsupported Original','XYZ','10');
  const opaque=opaquePaperCard(row,native);
  assert.equal(opaque.fullName,'Unsupported Original XYZ');
  assert.equal(opaque.canPlay(),false);
  assert.deepEqual(getOpaque(opaque),{
    category:'Trainer',printing:'Unsupported Original XYZ',set:'XYZ',number:'10'
  });
  const deck=stateWith(opaque,'deck');
  assert.equal(assertOpaqueQuarantined(deck),1);
  assert.equal(opaque.reduceEffect(null,deck,{}),deck,
    'a generic Store broadcast to a hidden inert original cannot invoke its effect');
  const prizes=stateWith(opaque,'prizes');
  assert.equal(assertOpaqueQuarantined(prizes),1);
  assert.equal(opaque.reduceEffect(null,prizes,{}),prizes);
  const hand=stateWith(opaque,'hand');
  assert.throws(()=>assertOpaqueQuarantined(hand),/outside deck\/prize/);
  assert.throws(()=>opaque.reduceEffect(null,hand,{}),/UNIMPLEMENTED_PAPER_PRINTING_EFFECT/);
  assert.throws(()=>opaque.reduceEffect(null,deck,{card:opaque}),/UNIMPLEMENTED_PAPER_PRINTING_EFFECT/);
  const bench=stateWith(opaque,'bench');
  assert.throws(()=>opaque.reduceEffect(null,bench,{}),/UNIMPLEMENTED_PAPER_PRINTING_EFFECT/);
});
