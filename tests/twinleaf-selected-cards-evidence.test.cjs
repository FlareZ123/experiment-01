'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {selectedCardsEvidence,selectedOptionEvidence}=require('../simulation/twinleaf/selected-cards-evidence.cjs');

class ChooseCardsPrompt {}
class ResolvePromptAction {}
class CoinFlipPrompt {}

test('capture exact selected physical printings from a hand-discard prompt',()=>{
  const hand={cards:[{fullName:'Guzma BUS 115'},{fullName:'Eri TEF 146'},
    {fullName:'Lusamine CIN 96'}]};
  const player={id:101,hand,deck:{cards:[]}};
  const state={players:[player,{id:202,hand:{cards:[]},deck:{cards:[]}}]};
  const prompt=new ChooseCardsPrompt();
  prompt.cards=hand;
  prompt.message='DISCARD_TWO';
  const action=new ResolvePromptAction();
  action.result=[0,2];
  const before=JSON.stringify(state);
  const evidence=selectedCardsEvidence(prompt,action,state);
  assert.equal(evidence.sourceZone,'hand');
  assert.equal(evidence.sourcePlayerSlot,0);
  assert.equal(evidence.sourceZoneCardCountBefore,3);
  assert.equal(evidence.publicDiscardCardNamesBefore,null,
    'Hand identities may never enter the public discard-name channel');
  assert.deepEqual(evidence.selectedCards,['Guzma BUS 115','Lusamine CIN 96']);
  assert.deepEqual(evidence.selectedIndices,[0,2]);
  assert.equal(evidence.message,'DISCARD_TWO');
  assert.equal(JSON.stringify(state),before);
});

test('distinguish deck search and canceled selection without editing card order',()=>{
  const deck={cards:[{fullName:'Double Colorless Energy SUM 136'}]};
  const state={players:[{deck,hand:{cards:[]}}]};
  const prompt=new ChooseCardsPrompt();
  prompt.cards=deck;
  const action=new ResolvePromptAction();
  action.result=[0];
  assert.equal(selectedCardsEvidence(prompt,action,state).sourceZone,'deck');
  action.result=null;
  const declined=selectedCardsEvidence(prompt,action,state);
  assert.equal(declined.selectedCards,null);
  assert.equal(declined.sourceZoneCardCountBefore,1,
    'Null response should not erase actual pre-dispatch zone size');
  action.result=[];
  const empty=selectedCardsEvidence(prompt,action,state);
  assert.deepEqual(empty.selectedCards,[]);
  assert.equal(empty.sourceZoneCardCountBefore,1);
  assert.equal(deck.cards[0].fullName,'Double Colorless Energy SUM 136');
});

test('unrelated or non-selection prompts are not captured',()=>{
  const state={players:[]};
  const prompt=new CoinFlipPrompt();
  const action=new ResolvePromptAction();
  action.result=true;
  assert.equal(selectedCardsEvidence(prompt,action,state),null);
});


test('accept object-valued prompt selections from the engine',()=>{
  const a={fullName:'Guzma BUS 115'};
  const b={fullName:'Lusamine CIN 96'};
  const cards={cards:[a,b]};
  const prompt=new ChooseCardsPrompt();prompt.cards=cards;
  const action=new ResolvePromptAction();action.result=[a,b];
  const evidence=selectedCardsEvidence(prompt,action,{players:[{hand:cards}]});
  assert.deepEqual(evidence.selectedCards,['Guzma BUS 115','Lusamine CIN 96']);
  assert.equal(evidence.selectedIndices,null);
  assert.equal(evidence.unmappedSelectedCards,0);
});


test('capture choice number and source menu text for tagged Supporter',()=>{
  class SelectOptionPrompt {}
  const prompt=new SelectOptionPrompt();
  prompt.message='CHOOSE_OPTION';
  prompt.values=['Stadium only','Discard 2; search Tool and Special Energy'];
  const action=new ResolvePromptAction();
  action.result=1;
  const info=selectedOptionEvidence(prompt,action);
  assert.equal(info.selectedOption,1);
  assert.equal(info.message,'CHOOSE_OPTION');
  assert.equal(info.selectedText,prompt.values[1]);
  assert.equal(selectedOptionEvidence(new CoinFlipPrompt(),action),null);
});


test('only public discard prompt exposes pre-choice cards and native selection bounds',()=>{
  const discard={cards:[{fullName:'Mega Absol ex M1L'}]};
  const state={players:[{discard,hand:{cards:[{fullName:'PRIVATE'}]}}]};
  const prompt=new ChooseCardsPrompt();
  prompt.cards=discard;
  prompt.options={min:2,max:2,allowCancel:true};
  const action=new ResolvePromptAction();
  action.result=null;
  const before=JSON.stringify(state);
  const choice=selectedCardsEvidence(prompt,action,state);
  assert.deepEqual(choice.publicDiscardCardNamesBefore,['Mega Absol ex M1L']);
  assert.equal(choice.sourceZoneCardCountBefore,1);
  assert.equal(choice.nativePromptMin,2);
  assert.equal(choice.nativePromptMax,2);
  assert.equal(choice.nativePromptAllowCancel,true);
  assert.equal(choice.selectedCards,null);
  assert.equal(JSON.stringify(state),before);
});
