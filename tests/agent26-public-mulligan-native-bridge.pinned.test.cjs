'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
const {initializeCards,runMatch}=require('../simulation/twinleaf/headless.cjs');
const {publicPrintingNameIndex,opponentPublicFailedHandNames}=
 require('../simulation/evaluation/agent26-public-mulligan-printing-name-bridge.cjs');
const manifest=require('../results/aichi-2026/full-decklists.json');
test('native opponent-visible invalid seven bridges into exact public names',()=>{
 const plan=planAichi(1,{allowEquivalentBasicEnergies:true,
 allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
 const source=plan.opponents.find(x=>x.rank===6);
 assert.equal(source.status,'ready');
 const index=publicPrintingNameIndex(initializeCards().getAllCards());
 const original=new Set(manifest.decks.find(x=>x.rank===6).cards.map(x=>x.name));
 const rows=[];
 for(const seed of [4136149016,1514735430,3730833191]){
  for(const candidateSeat of [0,1]){
   const sourceSeat=1-candidateSeat;
   const result=runMatch({deckA:candidateSeat===0?plan.candidate.cards:source.cards,
    deckB:candidateSeat===1?plan.candidate.cards:source.cards,
    seed,maxActions:110,capturePublicMulliganReveals:true,
    captureStartingBoard:true,captureSetupCompensation:true});
   const receipt=result.initialPublicMulliganReveals;
   const hands=opponentPublicFailedHandNames(receipt,candidateSeat,index);
   assert.equal(hands.length,
     result.initialSetupCompensation.mulligans[sourceSeat]);
   assert.ok(result.initialBoardAtFirstTurn.players[sourceSeat].active
     .startsWith('Iron Thorns ex '));
   rows.push({seed,candidateSeat,sourceMulligans:hands.length,
    firstPublicHand:hands[0]??null,
    unrecognized:[...new Set(hands.flat().filter(n=>!original.has(n)))]});
  }
 }
 console.log('AGENT26_NATIVE_PUBLIC_MULLIGAN_NAME_BRIDGE',JSON.stringify(rows));
 assert.equal(rows.length,6);
 assert.ok(rows.some(x=>x.sourceMulligans>0));
});
