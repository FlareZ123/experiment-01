'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseSourceEnergy,shouldPrepareRaichu}=
  require('../simulation/twinleaf/rank4-raichu-compressor-policy.cjs');
const card=fullName=>({fullName,
  name:fullName.startsWith('Battle Compressor')?'Battle Compressor':fullName
});
const state=(held=true,setup=true)=>({phase:4,turn:1,prompts:[],players:[],actor:{
  id:101,active:{getPokemonCard:()=>({fullName:setup?'Dedenne-GX UNB':'Crobat V DAA'})},
  bench:[{getPokemonCard:()=>({fullName:setup?'Voltorb ROS':'Crobat V DAA'})}],
  hand:{cards:held?[card('Battle Compressor PHF')]:[]},
  deck:{cards:[card('Reversal Energy PAL')]},cannotPlayItemCards:false
}});
test('source first-turn tactic needs owned Compressor, precursor and legal phase',()=>{
  const s=state();
  assert.equal(shouldPrepareRaichu(s,s.actor,4),true);
  const empty=state(false);assert.equal(shouldPrepareRaichu(empty,empty.actor,4),false);
  const noSetup=state(true,false);
  assert.equal(shouldPrepareRaichu(noSetup,noSetup.actor,4),false);
  s.actor.cannotPlayItemCards=true;
  assert.equal(shouldPrepareRaichu(s,s.actor,4),false);
  s.actor.cannotPlayItemCards=false;
  s.turn=3;assert.equal(shouldPrepareRaichu(s,s.actor,4),false);
  s.turn=1;s.prompts=[{}];
  assert.equal(shouldPrepareRaichu(s,s.actor,4),false);
  s.prompts=[];s.phase=7;
  assert.equal(shouldPrepareRaichu(s,s.actor,4),false);
});
test('prompt keeps owner-deck object identities, prioritizing each printed Energy',()=>{
  const cards=['Counter Energy CIN','Counter Energy CIN',
    'Reversal Energy PAL','Unit Energy LPM UPR','Reversal Energy PAL'].map(card);
  const selected=chooseSourceEnergy(cards,3);
  assert.deepEqual(selected,[cards[2],cards[0],cards[3]]);
  assert.ok(selected.every(c=>cards.includes(c)));
  assert.equal(new Set(selected).size,3);
  assert.deepEqual(chooseSourceEnergy(cards,0),[]);
  assert.deepEqual(chooseSourceEnergy([cards[0],card('Sky Field ROS')],3),[cards[0]]);
  const nonEnergy=[card('Rescue Stretcher GRI'),card('Sky Field ROS')];
  assert.deepEqual(chooseSourceEnergy(nonEnergy,3),[nonEnergy[0]]);
});
test('opponent private zones are never consulted by the opening predicate',()=>{
  const s=state();
  Object.defineProperty(s,'players',{get(){throw Error('private opponent access')}});
  assert.equal(shouldPrepareRaichu(s,s.actor,4),true);
});
