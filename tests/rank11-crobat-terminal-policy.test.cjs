'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {occupiedPrizes,crobatLethalOpportunity}=require('../simulation/twinleaf/rank11-crobat-terminal-policy.cjs');

/** @param {string} fullName @returns {{fullName:string,name:string,hp:number}} */
function card(fullName){return {fullName,name:fullName.replace(/ (UNM|DAA|ASR|SIT|EVS|BKP|SVE|SSH|MEE|SSP|PLF|CRE|TEU|SMP)$/,''),hp:270};}
function slot(name,energy=[],tool=[]){return {getPokemonCard:()=>name?card(name):null,energies:{cards:energy.map(card)},tools:tool.map(card)};}
function state() {
 const own={prizes:Array.from({length:6},(_,i)=>({cards:i<2?[card('Prize')]:[]})),
  usedVSTAR:false,discard:{cards:[card('Darkness Energy SVE')]},
  hand:{cards:[card('Marnie SSH')]},stadium:{cards:[card('Shopping Center EVS')]},
  active:slot('Mega Absol ex MEE'),bench:[slot('Crobat V DAA',['Darkness Energy SVE']),
    slot('Latias ex SSP',[],['Forest Seal Stone SIT']),slot('Garbodor BKP')]};
 const other={active:slot('Mewtwo & Mew-GX UNM')};other.active.damage=200;
 return {players:[own,other],activePlayer:0,prompts:[]};
}
test('occupied prizes count real occupied slots, not persistent containers',()=>{
 assert.equal(occupiedPrizes(state().players[0]),2);
});
test('state-only gate accepts real owner resources before selecting a hidden deck card',()=>{
 const g=crobatLethalOpportunity(state(),0);
 assert.deepEqual(g,{ready:true,mode:'transfer-stone',reason:'transfer-stone',stoneSlot:1,crobatIndex:0,patchInHand:false});
});
test('hand Dark Patch avoids speculative owner deck search',()=>{
 const s=state();s.players[0].hand.cards.push(card('Dark Patch ASR'));
 assert.equal(crobatLethalOpportunity(s,0).mode,'held-dark-patch');
});
test('public target must already be in KO range',()=>{
 const s=state();s.players[1].active.damage=190;
 assert.equal(crobatLethalOpportunity(s,0).ready,false);
});
test('six prize containers with four cards remaining cannot immediately end game',()=>{
 const s=state();s.players[0].prizes[2].cards=[card('Prize')];s.players[0].prizes[3].cards=[card('Prize')];
 assert.equal(crobatLethalOpportunity(s,0).reason,'no-immediate-prize-win');
});
test('search cannot start without public Shop and Stone opportunity',()=>{
 const s=state();s.players[0].stadium.cards=[];
 assert.equal(crobatLethalOpportunity(s,0).ready,false);
});
test('owned Garbotoxin locks the Tool VSTAR Power',()=>{
 const s=state();s.players[0].bench[2].tools=[card('Float Stone PLF')];
 assert.equal(crobatLethalOpportunity(s,0).reason,'own-garbotoxin-blocks-star-alchemy');
});
test('opposing seat is ineligible even with all accessible source cards',()=>{
 const s=state();s.activePlayer=1;
 assert.equal(crobatLethalOpportunity(s,0).ready,false);
});
test('pending prompts prohibit start, preserving search ownership',()=>{
 const s=state();s.prompts.push({result:undefined});
 assert.equal(crobatLethalOpportunity(s,0).reason,'not-owner-decision');
});
test('K0 gate never inspects the unsearched deck',()=>{
 const s=state();
 Object.defineProperty(s.players[0],'deck',{get(){throw new Error('hidden deck read');}});
 assert.equal(crobatLethalOpportunity(s,0).ready,true);
});
test('powered Active Crobat can attack without a Dark Patch or a search',()=>{
 const s=state();s.players[0].active=slot('Crobat V DAA',['Darkness Energy SVE','Darkness Energy SVE']);
 s.players[0].bench[0]=slot('Oranguru V DAA');s.players[0].discard.cards=[];
 assert.equal(crobatLethalOpportunity(s,0).mode,'active-attack');
});
test('powered Bench Crobat can be promoted without a Patch or Stone',()=>{
 const s=state();s.players[0].bench[0].energies.cards.push(card('Darkness Energy SVE'));
 s.players[0].discard.cards=[];s.players[0].usedVSTAR=true;
 assert.equal(crobatLethalOpportunity(s,0).mode,'powered-bench');
});
test('held Stone opens owner-deck search without Shopping Center',()=>{
 const s=state();s.players[0].hand.cards.push(card('Forest Seal Stone SIT'));
 s.players[0].stadium.cards=[];s.players[0].bench[1].tools=[];
 assert.equal(crobatLethalOpportunity(s,0).mode,'held-stone');
});
test('equipped Stone opens VSTAR search without Shopping Center',()=>{
 const s=state();s.players[0].bench[0].tools=[card('Forest Seal Stone SIT')];
 s.players[0].stadium.cards=[];
 assert.equal(crobatLethalOpportunity(s,0).mode,'crobat-equipped-stone');
});
test('Stone can be retrieved from source Active through Shopping Center',()=>{
 const s=state();s.players[0].bench[1].tools=[];
 s.players[0].active.tools=[card('Forest Seal Stone SIT')];
 const g=crobatLethalOpportunity(s,0);
 assert.equal(g.mode,'transfer-stone');assert.equal(g.stoneSlot,-2);
});
test('Crobat with another Tool may still use a held Patch',()=>{
 const s=state();s.players[0].bench[0].tools=[card('Float Stone PLF')];
 s.players[0].hand.cards.push(card('Dark Patch ASR'));s.players[0].usedVSTAR=true;
 assert.equal(crobatLethalOpportunity(s,0).mode,'held-dark-patch');
});
test('fixed champion Shadow Rider VMAX is eligible at a conservative lethal threshold',()=>{
 const s=state();const v=card('Shadow Rider Calyrex VMAX CRE');v.hp=320;
 s.players[1].active.getPokemonCard=()=>v;s.players[1].active.damage=250;
 assert.equal(crobatLethalOpportunity(s,0).mode,'transfer-stone');
});
