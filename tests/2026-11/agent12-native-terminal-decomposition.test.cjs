'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {classifyNativeTerminal,summarizeNativeTerminals,summarizeArchive}=
  require('../../simulation/evaluation/2026-11/agent12-native-terminal-decomposition.cjs');
const base={
  finished:true,winner:0,turns:75,
  finalPrizes:[4,6],
  finalBoard:[{active:{printing:'Mimikyu PAL'},bench:[]},
    {active:{printing:'Iron Thorns ex TWM'},bench:[]}]
};
test('remaining prizes with opposing Pokemon stays conservatively unclassified by cause',()=>{
  const x=classifyNativeTerminal(base);
  assert.equal(x.category,'native-win-with-prizes-and-opponent-pokemon');
  assert.equal(x.turns,75);
});
test('distinguish zero Prizes and opponent without Pokemon',()=>{
  assert.equal(classifyNativeTerminal({...base,finalPrizes:[0,6]}).category,
    'native-win-with-zero-prizes');
  assert.equal(classifyNativeTerminal({...base,finalBoard:[base.finalBoard[0],
    {active:null,bench:[]}]}).category,'native-win-opponent-without-pokemon');
});
test('record error and unknown board without inventing terminal cause',()=>{
  assert.equal(classifyNativeTerminal({...base,error:'engine'}).category,
    'nonbinary-or-native-abort');
  assert.equal(classifyNativeTerminal({...base,finalBoard:null}).category,
    'insufficient-final-board-evidence');
  const summary=summarizeNativeTerminals([base,{...base,error:'engine'},
    {...base,finalPrizes:[0,6]}]);
  assert.equal(summary.attempts,3);
  assert.equal(summary.categories['native-win-with-prizes-and-opponent-pokemon'],1);
  assert.equal(summary.categories['nonbinary-or-native-abort'],1);
  assert.equal(summary.categories['native-win-with-zero-prizes'],1);
  assert.equal(summary.turnRange['native-win-with-prizes-and-opponent-pokemon'].median,75);
});
test('two-archive adapter preserves exact attempt count',()=>{
  const a=summarizeArchive({rawNativeBatches:[
    {rows:[base]},{rows:[{...base,finalPrizes:[0,6]}]}]});
  assert.equal(a.arms.length,2);
  assert.equal(a.arms[0].attempts,1);
  assert.equal(a.arms[1].attempts,1);
});
