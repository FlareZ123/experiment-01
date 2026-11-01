'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {digestNativePromptChoices}=require(
  '../simulation/evaluation/agent12-native-prompt-choice-digest.cjs');

const card=(ordinal,names)=>({
  ordinal,kind:'ChooseCardsPrompt',sourceZone:'hand',sourcePlayerSlot:1,
  selectedCards:names
});

test('same public prompt root with different physical printing choices differs',()=>{
  const a=digestNativePromptChoices({events:[card(33,['Dark Patch ASR','Garbodor BKP'])]});
  const b=digestNativePromptChoices({events:[card(33,['Dark Patch ASR','Temple of Sinnoh ASR'])]});
  assert.notEqual(a.digestSha256,b.digestSha256);
  assert.equal(a.completePhysicalSelectedPrintings,true);
  assert.equal(b.selectedPrintingNamesKnown,1);
});

test('same physical choices remain digest equal irrespective of sidecar order',()=>{
  const a=digestNativePromptChoices({events:[
    card(3,['A','B']),card(4,['C'])]});
  const b=digestNativePromptChoices({events:[
    card(4,['C']),card(3,['A','B'])]});
  assert.equal(a.digestSha256,b.digestSha256);
});

test('unknown exact print names are explicitly incomplete',()=>{
  const r=digestNativePromptChoices({events:[
    card(1,null),card(2,['A'])]});
  assert.equal(r.totalPromptChoiceEvents,2);
  assert.equal(r.selectedPrintingNamesUnknown,1);
  assert.equal(r.completePhysicalSelectedPrintings,false);
});

test('missing or duplicate root ordinal is rejected rather than hashed',()=>{
  assert.throws(()=>digestNativePromptChoices({events:[
    card(3,['A']),card(3,['B'])]}));
  assert.throws(()=>digestNativePromptChoices({events:[
    {ordinal:null,kind:'ChooseCardsPrompt',selectedCards:[]}]}));
});

test('empty evidence has a stable checksum but no broad paper certification',()=>{
  const a=digestNativePromptChoices({events:[]});
  assert.equal(a.totalPromptChoiceEvents,0);
  assert.equal(a.selectedPrintingNamesKnown,0);
  assert.equal(a.digestSha256.length,64);
  assert.match(a.note,/cannot independently certify/);
});
