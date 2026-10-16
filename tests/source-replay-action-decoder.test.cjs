'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {captureAction}=require('../simulation/twinleaf/source-action-value-codec.cjs');
const {capturePromptAction}=require('../simulation/twinleaf/source-prompt-action-codec.cjs');
const {approvedActionClasses,decodeRecordedAction}=
  require('../simulation/twinleaf/source-replay-action-decoder.cjs');

class AddPlayerAction {
  constructor(id,deck) {this.clientId=id;this.deck=deck;this.artworksMap=undefined;}
}
class ResolvePromptAction {
  constructor(id,result,log) {this.id=id;this.result=result;this.log=log;}
}
class ChooseCardsPrompt {
  constructor(cards) {
    this.id=7;this.playerId=100;this.message='choose';
    this.cards={cards};
  }
}

test('approved constructor registry requires exact class exports',()=>{
  const modules={'game/store/actions/add-player-action':{AddPlayerAction}};
  assert.throws(()=>approvedActionClasses(p=>modules[p]||{}),
    /Pinned action class/);
});

test('plain-valued AddPlayer action survives JSON and type validation',()=>{
  const original=new AddPlayerAction(100,['Pidgey MEW']);
  const event={step:0,action:'AddPlayerAction',
    typedAction:JSON.parse(JSON.stringify(captureAction(original)))};
  const replay=decodeRecordedAction(event,null,{}, {AddPlayerAction});
  assert.ok(replay instanceof AddPlayerAction);
  assert.equal(replay.artworksMap,undefined);
  assert.deepEqual(replay.deck,['Pidgey MEW']);
});

test('nested identical-face card selection restores its original prompt index',()=>{
  const cards=[{fullName:'Pidgey MEW'},{fullName:'Pidgey MEW'}];
  const prompt=new ChooseCardsPrompt(cards);
  const record=capturePromptAction(prompt,
    new ResolvePromptAction(7,[cards[1]]),{});
  const archived=JSON.parse(JSON.stringify({
    step:30,action:'ResolvePromptAction',
    pendingPrompt:{kind:'ChooseCardsPrompt',id:7,playerId:100},
    promptReplayAction:record
  }));
  const freshCards=[{fullName:'Pidgey MEW'},{fullName:'Pidgey MEW'}];
  const current=new ChooseCardsPrompt(freshCards);
  const replay=decodeRecordedAction(archived,current,{},{ResolvePromptAction});
  assert.ok(replay instanceof ResolvePromptAction);
  assert.equal(replay.result[0],freshCards[1]);
});

test('incomplete source input and changed prompt identity are explicit blockers',()=>{
  const pending=new ChooseCardsPrompt([{fullName:'Pidgey MEW'}]);
  const source={step:3,action:'ResolvePromptAction',typedActionError:'Card instance'};
  assert.throws(()=>decodeRecordedAction(source,null,{},{}),/Nonportable source action/);
  assert.throws(()=>decodeRecordedAction({...source,
    pendingPrompt:{kind:'ChooseCardsPrompt',id:10,playerId:100}},pending,{},{}),
    /pending prompt identity/);
  assert.throws(()=>decodeRecordedAction({...source,
    pendingPrompt:{kind:'ChooseCardsPrompt',id:7,playerId:100}},null,{},{}),
    /pending prompt identity/);
});
