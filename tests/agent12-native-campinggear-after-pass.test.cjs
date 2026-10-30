'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {GEAR,chooseCampingGearBeforePass,chooseActualCampingGearCard}=require('../simulation/twinleaf/agent12-native-campinggear-after-pass.cjs');
const view=()=>({decisionKind:'owner-root',globalTurn:1,actorSeat:1,ownHand:[GEAR,'Speed Lightning Energy RCL'],ownPublic:{deckCount:40,publicTurnRestrictions:{itemPlayLocked:false}},ownTurnResources:{itemPlayLocked:false}});
test('owner-visible first-turn candidate',()=>{assert.deepEqual(chooseCampingGearBeforePass(view()),{kind:'play-camping-gear',handIndex:0,printing:GEAR,terminalIfSettled:true});});
test('first-turn, printing, deck and lock negative gates',()=>{for(const fn of [v=>{v.globalTurn=2},v=>{v.ownHand[0]='Other'},v=>{v.ownPublic.deckCount=0},v=>{v.ownTurnResources.itemPlayLocked=true},v=>{v.ownPublic.publicTurnRestrictions.itemPlayLocked=true}]){const v=view();fn(v);assert.equal(chooseCampingGearBeforePass(v),null);}});
test('actual owner prompt one-card validated selection',()=>{const cards=[{fullName:'Other'},{fullName:'Double Colorless Energy SUM'}];const p={constructor:{name:'ChooseCardsPrompt'},cards:{cards},validate:(a,s)=>a.length===1&&cards.includes(a[0])&&s.ok};assert.equal(chooseActualCampingGearCard(p,{ok:true}),cards[1]);});
test('never selects an unvalidated source card',()=>{const cards=[{fullName:'Double Colorless Energy SUM'}];const p={constructor:{name:'ChooseCardsPrompt'},cards:{cards},validate:()=>false};assert.throws(()=>chooseActualCampingGearCard(p,{}));});
