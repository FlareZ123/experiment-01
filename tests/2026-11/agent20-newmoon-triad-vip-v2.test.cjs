'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {preferNewMoonTriadV2VipRecipient:select}=
  require('../../simulation/twinleaf/agent9-battle-vip-owner-after-pass.cjs');

const BASIC=0,POKEMON=1;
const M='Mewtwo & Mew-GX UNM';
const G='Gengar & Mimikyu-GX TEU';
const L='Latias ex SSP';
const names=[M,G,L];
/** @param {string} fullName Exact printing name. */
const basic=fullName=>({fullName,superType:POKEMON,stage:BASIC});
/** @param {string[]} found Native deck-search visible printings. */
function prompt(found=names){
  const cards=found.map(basic);
  return {cards:{cards},validate(selected){
    return selected.length>=1&&selected.length<=2&&
      selected.every(card=>cards.includes(card));
  }};
}
/**
 * @param {string[]} present Owner public Active and Benched printings.
 * @param {string[]} hand Owner private held printings.
 * @param {number} slots Empty Bench slots.
 */
function view(present=[],hand=[],slots=5-Math.max(0,present.length-1)){
  return {decisionKind:'owner-prompt',pendingOwnerDeckSearch:true,
    ownHand:hand,ownPublic:{
      active:{printing:present[0]??'Lunatone OBF'},
      bench:[...present.slice(1).map(printing=>({printing})),
        ...Array.from({length:slots},()=>null),
        ...Array.from({length:5-present.slice(1).length-slots},
          (_,i)=>({printing:'Unrelated '+i}))]
    }};
}
const choose=(p,v)=>select(p,v,{BASIC,POKEMON})?.map(c=>c.fullName)??null;

test('no established triad chooses the Perfection attacker and Gengar donor',()=>{
  assert.deepEqual(choose(prompt(),view([])),[M,G]);
  assert.deepEqual(choose(prompt(),view([],[],3)),[M,G]);
});
test('held Mewtwo preserves deck search slots for Gengar plus mobility',()=>{
  assert.deepEqual(choose(prompt(),view([],[M],3)),[G,L]);
});
test('any one of three established triad members completes missing two',()=>{
  for(const member of names)
    assert.deepEqual(choose(prompt(),view([member])),names.filter(x=>x!==member));
});
test('one empty Bench slot can still claim the single missing triad member',()=>{
  for(const missing of names){
    const present=names.filter(x=>x!==missing);
    assert.deepEqual(choose(prompt(),view(present,[],1)),[missing]);
  }
});
test('will not displace Bench slots, select absent cards or treat full triad as missing',()=>{
  assert.equal(choose(prompt(),view([],[],1)),null);
  assert.equal(choose(prompt(),view([M],[],1)),null);
  assert.equal(choose(prompt(),view([M,G,L])),null);
  assert.equal(choose(prompt([G,L]),view([])),null);
  assert.equal(choose(prompt([M,G]),view([],[M])),null);
  assert.equal(choose(prompt(),view([M,G],[],0)),null);
});
test('real native prompt validation and owner authorization are mandatory',()=>{
  const p=prompt();
  p.validate=()=>false;
  assert.equal(choose(p,view([])),null);
  const wrongView=view([]);
  wrongView.pendingOwnerDeckSearch=false;
  assert.throws(()=>choose(prompt(),wrongView),assert.AssertionError);
  wrongView.pendingOwnerDeckSearch=true;
  wrongView.decisionKind='owner-root';
  assert.throws(()=>choose(prompt(),wrongView),assert.AssertionError);
});
