'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorCopiedAttack}=
 require('../simulation/twinleaf/agent13-actor-only-choose-attack.cjs');
const menu=[
 {index:0,printing:'Noivern ex PAL',attacks:[
   {index:0,name:'Covert Flight',gxAttack:false,blocked:false},
   {index:1,name:'Dominating Echo',gxAttack:false,blocked:false}]},
 {index:1,printing:'Dragapult ex TWM',attacks:[
   {index:0,name:'Jet Headbutt',gxAttack:false,blocked:false},
   {index:1,name:'Phantom Dive',gxAttack:false,blocked:false}]}
];
function input(seat,active='Regidrago VSTAR SIT'){
 return {actor:{decisionKind:'owner-prompt',actorSeat:seat,
   ownPublic:{active:{printing:active},publicTurnRestrictions:{}}},
   prompt:{kind:'ChooseAttackPrompt',offered:menu,allowCancel:false}};
}
test('default native chooser selects first offered source attack',()=>{
 assert.deepEqual(chooseActorCopiedAttack(input(1)),{
   sourceIndex:0,attackIndex:0});
});
test('explicit source-seat native offered Phantom Dive selects exact attack',()=>{
 assert.deepEqual(chooseActorCopiedAttack(input(1),{
   preferRank13DragapultPhantomDive:true,rank13SourceSeat:1}),{
   sourceIndex:1,attackIndex:1});
});
test('does not leak source-only choice to opposing physical seat',()=>{
 assert.deepEqual(chooseActorCopiedAttack(input(0),{
   preferRank13DragapultPhantomDive:true,rank13SourceSeat:1}),{
   sourceIndex:0,attackIndex:0});
});
test('declines source-only preference if the actual Active is different',()=>{
 assert.deepEqual(chooseActorCopiedAttack(input(1,'Tapu Lele-GX GRI'),{
   preferRank13DragapultPhantomDive:true,rank13SourceSeat:1}),{
   sourceIndex:0,attackIndex:0});
});
test('cannot select blocked native attack or absent source',()=>{
 const a=input(1);
 a.prompt.offered[1]={...menu[1],attacks:[
   menu[1].attacks[0],{...menu[1].attacks[1],blocked:true}]};
 assert.deepEqual(chooseActorCopiedAttack(a,{
   preferRank13DragapultPhantomDive:true,rank13SourceSeat:1}),{
   sourceIndex:0,attackIndex:0});
});
