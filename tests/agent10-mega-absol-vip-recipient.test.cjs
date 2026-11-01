'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {preferMegaAbsolVipRecipient}=require(
  '../simulation/twinleaf/agent10-battle-vip-before-attack.cjs');
const TYPES={BASIC:2,POKEMON:0};
const pokemon=(name,fullName,stage=2)=>({
  name,fullName,stage,superType:0
});
const TOED=pokemon('Toedscool','Toedscool PAR');
const MEGA=pokemon('Mega Absol ex','Mega Absol ex M1L');
const DEDENNE=pokemon('Dedenne GX','Dedenne GX UNB');
const cards=[TOED,MEGA,DEDENNE];
const prompt=(available=cards)=>({
  cards:{cards:available},
  validate(selection){return selection.length<=2&&selection.every(c=>available.includes(c));}
});
const view=(active='Voltorb')=>({
  decisionKind:'owner-prompt',pendingOwnerDeckSearch:true,
  ownPublic:{active:{name:active},bench:[null,null,null,null,null]}
});
test('authorized owner VIP search chooses original physical Toedscool and Mega Absol',()=>{
  assert.deepEqual(preferMegaAbsolVipRecipient(prompt(),view(),TYPES),
    [TOED,MEGA]);
});
test('other active or unavailable printed source lines cannot trigger specialized selection',()=>{
  assert.equal(preferMegaAbsolVipRecipient(prompt(),view('Sableye V'),TYPES),null);
  assert.equal(preferMegaAbsolVipRecipient(prompt([TOED,DEDENNE]),view(),TYPES),null);
  assert.equal(preferMegaAbsolVipRecipient(prompt([MEGA,DEDENNE]),view(),TYPES),null);
  const full=view();full.ownPublic.bench=[{name:'A'},null,{name:'B'},null,{name:'C'}];
  assert.deepEqual(preferMegaAbsolVipRecipient(prompt(),full,TYPES),[TOED,MEGA]);
  full.ownPublic.bench[1]={name:'D'};
  assert.equal(preferMegaAbsolVipRecipient(prompt(),full,TYPES),null);
});
test('native search prompt veto is authoritative and never replaced by a different target',()=>{
  const p=prompt();p.validate=selected=>selected.length<=1;
  assert.equal(preferMegaAbsolVipRecipient(p,view(),TYPES),null);
  assert.deepEqual(cards.map(c=>c.fullName),
    ['Toedscool PAR','Mega Absol ex M1L','Dedenne GX UNB'],
    'selector preserves exact original card object identities');
});
test('specialized owner deck query requires authenticated owner search observation',()=>{
  const unauth=view();unauth.pendingOwnerDeckSearch=false;
  assert.throws(()=>preferMegaAbsolVipRecipient(prompt(),unauth,TYPES));
});
