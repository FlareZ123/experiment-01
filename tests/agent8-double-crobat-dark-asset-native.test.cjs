'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const native=n=>require(path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output',n));

for(const seat of [0,1])test('double Crobat V Dark Asset source-global restriction, seat '+seat,()=>{
  const x=stage(seat),manager=initializeCards();
  let id=81000+seat*1000;
  const make=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,name);c.id=id++;return c;
  };
  x.owner.hand.cards.length=0;
  const first=make('Crobat V DAA'),second=make('Crobat V DAA');
  x.owner.hand.cards.push(first,second,make('Psychic Energy SVE'));
  x.owner.bench[0].cards.length=0;
  x.owner.bench[2].cards.length=0;
  x.owner.deck.cards.length=0;
  for(let i=0;i<12;i++)x.owner.deck.cards.push(make('Psychic Energy SVE'));
  x.state.turn=4;

  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const play=(card,index)=>{
    const handIndex=x.owner.hand.cards.indexOf(card);
    assert.ok(handIndex>=0);
    x.store.dispatch(new PlayCardAction(x.owner.id,handIndex,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index
    }));
    const prompt=x.state.prompts.find(q=>q.result===undefined);
    assert.equal(prompt?.constructor.name,'ConfirmPrompt');
    x.store.dispatch(new ResolvePromptAction(prompt.id,true));
    assert.equal(x.store.hasPrompts(),false);
  };
  play(first,0);
  assert.equal(x.owner.hand.cards.length,6);
  assert.equal(x.owner.marker.hasMarker('DARK_ASSET_MARKER',first),true);
  assert.equal(x.owner.marker.hasMarker('DARK_ASSET_MARKER',second),false);
  const afterFirst=x.owner.hand.cards.length;
  play(second,2);
  assert.equal(x.owner.hand.cards.length,6);
  assert.equal(x.owner.marker.hasMarker('DARK_ASSET_MARKER',second),true);
  const extraDraw=x.owner.hand.cards.length-(afterFirst-1);
  assert.equal(extraDraw,1);
  console.log('AGENT8_NATIVE_DOUBLE_CROBAT',JSON.stringify({
    seat,firstAbilityActivated:true,
    secondAbilityActivated:true,extraSecondDraw:extraDraw,
    sourceRanks:[4,16],competitiveQualifiedGames:0
  }));
});
