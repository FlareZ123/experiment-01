'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {choosePhysicalOwnerSearchOrWhiff}=
  require('../simulation/twinleaf/agent43-owner-secretbox-fog-ko.cjs');

function owner(printings){
  const cards=printings.map(fullName=>({fullName}));
  return {deck:{cards}};
}
function prompt(o,selectedName=null,emptyAllowed=true){
  return {
    cards:o.deck,message:'CHOOSE_CARD_TO_HAND',
    options:{min:emptyAllowed?0:1,max:1},
    validate(selected){
      if(!Array.isArray(selected))return false;
      if(selected.length===0)return emptyAllowed;
      if(selected.length!==1)return false;
      return o.deck.cards.includes(selected[0])&&
        (selectedName===null||selected[0].fullName===selectedName);
    }
  };
}

test('real source-held matching Fog uses one validated original physical object',()=>{
  const o=owner(['Fog Crystal CRE','Psychic Energy MEE 13']);
  const p=prompt(o,'Fog Crystal CRE',true);
  const chosen=choosePhysicalOwnerSearchOrWhiff(p,o,
    x=>x.fullName==='Fog Crystal CRE');
  assert.equal(chosen.whiff,false);
  assert.equal(chosen.cards.length,1);
  assert.strictEqual(chosen.cards[0],o.deck.cards[0]);
  assert.equal(p.validate(chosen.cards),true);
});

test('paid Box with no eligible owner Fog resolves native empty selection',()=>{
  const o=owner(['Ultra Ball MEG','Rescue Carrier EVS']);
  const p=prompt(o,null,true);
  const selected=choosePhysicalOwnerSearchOrWhiff(p,o,
    x=>x.fullName==='Fog Crystal CRE');
  assert.deepEqual(selected,{cards:[],whiff:true});
  assert.equal(p.validate(selected.cards),true);
});

test('paid Fog with no eligible Basic Energy chooses validated empty',()=>{
  const o=owner(['Telepathic Psychic Energy POR',
    'Lillie’s Clefairy ex JTG']);
  const p=prompt(o,'Psychic Energy MEE 13',true);
  const selected=choosePhysicalOwnerSearchOrWhiff(p,o,
    x=>x.fullName.startsWith('Psychic Energy '));
  assert.deepEqual(selected,{cards:[],whiff:true});
  assert.equal(p.validate(selected.cards),true);
});

test('non-optional empty answer delegates without inventing a payment',()=>{
  const o=owner(['Ultra Ball MEG']);
  const p=prompt(o,'Fog Crystal CRE',false);
  assert.equal(choosePhysicalOwnerSearchOrWhiff(p,o,
    x=>x.fullName==='Fog Crystal CRE'),null);
  const other=owner(['Fog Crystal CRE']);
  assert.throws(()=>choosePhysicalOwnerSearchOrWhiff(p,other,
    x=>x.fullName==='Fog Crystal CRE'));
});

test('card may be present but native-ineligible; [] accepted if allowed',()=>{
  const o=owner(['Fog Crystal CRE']);
  const p=prompt(o,'Psychic Energy MEE 13',true);
  const selected=choosePhysicalOwnerSearchOrWhiff(p,o,
    x=>x.fullName==='Fog Crystal CRE');
  assert.deepEqual(selected,{cards:[],whiff:true});
  assert.equal(p.validate(selected.cards),true);
});
