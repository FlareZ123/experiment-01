'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {preferNewMoonTriadVipRecipient}=require(
  '../../simulation/twinleaf/agent9-battle-vip-owner-after-pass.cjs'
);
const BASIC=0,POKEMON=1;
const PRINTINGS=['Mewtwo & Mew-GX UNM','Gengar & Mimikyu-GX TEU',
  'Latias ex SSP'];

/** @param {string} fullName Printed card name and set. */
const basic=fullName=>({fullName,stage:BASIC,superType:POKEMON});
/** @param {object[]} cards Owner-authorized deck search inventory. */
function prompt(cards){
  return {cards:{cards},validate(chosen){
    return Array.isArray(chosen)&&chosen.length<=2&&
      chosen.every(c=>cards.includes(c)&&c.stage===BASIC&&
        c.superType===POKEMON);
  }};
}
/** @param {string[]} present Visible owner's in-play printings. */
function view(present){
  return {decisionKind:'owner-prompt',pendingOwnerDeckSearch:true,
    ownPublic:{active:{printing:present[0]??'Other Basic'},
      bench:[...present.slice(1).map(printing=>({printing})),
        ...Array.from({length:5-present.slice(1).length},()=>null)]}};
}
const choose=(p,v)=>preferNewMoonTriadVipRecipient(p,v,{BASIC,POKEMON});

test('one already-in-play triad printing selects the two distinct missing Basics',()=>{
  const available=PRINTINGS.map(basic).concat(basic('Unrelated Basic'));
  for(let i=0;i<3;i++){
    const result=choose(prompt(available),view([PRINTINGS[i]]));
    assert.deepEqual(result.map(c=>c.fullName),
      PRINTINGS.filter((_,j)=>j!==i));
    assert.ok(result.every(c=>available.includes(c)));
  }
});
test('without exactly one printed member already in play, preserve generic policy',()=>{
  const p=prompt(PRINTINGS.map(basic));
  assert.equal(choose(p,view([])),null);
  assert.equal(choose(p,view([PRINTINGS[0],PRINTINGS[1]])),null);
  assert.equal(choose(p,view(PRINTINGS)),null);
});
test('two free Bench slots are mandatory',()=>{
  const v=view([PRINTINGS[0]]);
  v.ownPublic.bench=[{printing:'A'},{printing:'B'},
    {printing:'C'},{printing:'D'},null];
  assert.equal(choose(prompt(PRINTINGS.map(basic)),v),null);
});
test('missing deck printing or native disapproval produces no preferred target',()=>{
  const v=view([PRINTINGS[0]]);
  assert.equal(choose(prompt([basic(PRINTINGS[1])]),v),null);
  const p=prompt(PRINTINGS.map(basic));
  p.validate=()=>false;
  assert.equal(choose(p,v),null);
});
test('owner-only deck-search context is enforced before reading deck cards',()=>{
  const p=prompt(PRINTINGS.map(basic));
  const v=view([PRINTINGS[0]]);
  v.pendingOwnerDeckSearch=false;
  assert.throws(()=>choose(p,v),assert.AssertionError);
  v.pendingOwnerDeckSearch=true;
  v.decisionKind='owner-root';
  assert.throws(()=>choose(p,v),assert.AssertionError);
});
