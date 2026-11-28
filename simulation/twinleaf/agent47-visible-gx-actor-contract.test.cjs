'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {visiblePokemon}=require('./actor-observation-contract.cjs');
const {classifyPrintedGXAttack}=require('./printed-gx-attack-classifier.cjs');

function sourceSlot(attack){
  const pokemon={name:'Synthetic exact printing',
    fullName:'Synthetic exact printing SMP',
    hp:200,cardType:['Psychic'],stage:'BASIC',
    attacks:[attack],powers:[],weakness:[],resistance:[],
    retreat:['Colorless']};
  const slot={getPokemonCard:()=>pokemon,cards:[pokemon],energies:{cards:[]},
    tools:[],damage:0};
  return visiblePokemon(slot);
}
for(const name of ['Pale Moon-GX','Tingly Return-GX',
  'Strafe-GX','Altered Creation-GX']){
  test('public actor source repairs omitted printed GX flag for '+name,()=>{
    const attack={name,cost:['Psychic'],damage:100,
      text:"(You can't use more than 1 GX attack in a game.)"};
    assert.equal(classifyPrintedGXAttack(attack),true);
    const view=sourceSlot(attack);
    assert.equal(view.attacks.length,1);
    assert.equal(view.attacks[0].name,name);
    assert.equal(view.attacks[0].gxAttack,true);
    assert.equal(view.attacks[0].text,attack.text);
    assert.deepEqual(view.attacks[0].cost,['Psychic']);
  });
}
for(const name of ['Apex Dragon','Copycat','Foul Play','Max Geist']){
  test('public actor source keeps ordinary attack non-GX for '+name,()=>{
    const attack={name,cost:['Psychic','Colorless'],damage:0,
      text:'Choose 1 attack and use it as this attack.'};
    const view=sourceSlot(attack);
    assert.equal(view.attacks[0].gxAttack,false);
  });
}
test('damaged or already evolved visible Pokémon retains public gx classification',()=>{
  const slot=sourceSlot({name:'Pale Moon-GX',cost:['Psychic','Colorless'],
    damage:0,text:''});
  assert.equal(slot.hp,200);
  assert.equal(slot.printing,'Synthetic exact printing SMP');
  assert.equal(slot.attacks[0].gxAttack,true);
  assert.equal(slot.damage,0);
});
test('unknown source attack identity remains safely non-normal in actor view',()=>{
  assert.equal(classifyPrintedGXAttack({}),null);
  const slot=sourceSlot({name:undefined,cost:[],damage:0});
  assert.equal(slot.attacks[0].gxAttack,true);
});
