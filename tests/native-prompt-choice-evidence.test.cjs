'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {nativePromptChoiceEvidence}=
  require('../simulation/twinleaf/native-prompt-choice-evidence.cjs');

const makeRow=(selectedCards)=>({
  actionOrdinal:10,turnBefore:1,playerSlot:1,
  action:'ResolvePromptAction',
  cardSelection:{
    sourceZone:'deck',sourcePlayerSlot:1,
    selectedCards,selectedIndices:null
  }
});

test('different owner search selections break semantic equality even when every recorded root field matches',()=>{
  const energy=nativePromptChoiceEvidence([makeRow(['Psychic Energy MEE'])]);
  const gengar=nativePromptChoiceEvidence([makeRow(['Gengar & Mimikyu-GX TEU'])]);
  assert.deepEqual(energy.events[0],{
    ordinal:10,turn:1,actorSeat:1,kind:'ChooseCardsPrompt',
    sourceZone:'deck',sourcePlayerSlot:1,
    selectedCards:['Psychic Energy MEE'],selectedIndices:null
  });
  assert.notEqual(energy.sha256,gengar.sha256);
  assert.equal(energy.events.length,1);
  assert.equal(energy.schema,'headless-native-prompt-choice-evidence-v1');
});

test('preserves seat identity for source and candidate and real modal alternatives',()=>{
  const cards=makeRow(['Psychic Energy MEE']);
  const mode={
    actionOrdinal:11,turnBefore:1,playerSlot:0,
    optionSelection:{selectedOption:0,selectedText:'Choose a Stadium'}
  };
  const result=nativePromptChoiceEvidence([cards,mode]);
  assert.equal(result.events.length,2);
  assert.deepEqual(result.events[1],{
    ordinal:11,turn:1,actorSeat:0,kind:'SelectOptionPrompt',
    selectedOption:0,selectedText:'Choose a Stadium'
  });
  assert.equal(result.sha256.length,64);
});

test('unobserved prompts and other decisions do not fabricate semantic choices',()=>{
  const result=nativePromptChoiceEvidence([
    {actionOrdinal:1,action:'PassTurnAction'},
    {actionOrdinal:2,action:'ResolvePromptAction'}
  ]);
  assert.deepEqual(result.events,[]);
  assert.equal(result.sha256.length,64);
});
