'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {installGlobalDarkAssetHook}=
  require('../simulation/twinleaf/crobat-global-dark-asset-hook.cjs');
const native=n=>require(path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output',n));

/** @param {0|1} seat @param {boolean} corrected */
function run(seat,corrected){
  const restore=corrected?installGlobalDarkAssetHook():null;
  try{
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
    const play=(card,index,promptExpected)=>{
      const handIndex=x.owner.hand.cards.indexOf(card);
      assert.ok(handIndex>=0);
      x.store.dispatch(new PlayCardAction(x.owner.id,handIndex,{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index
      }));
      const prompt=x.state.prompts.find(q=>q.result===undefined);
      if(promptExpected){
        assert.equal(prompt?.constructor.name,'ConfirmPrompt');
        x.store.dispatch(new ResolvePromptAction(prompt.id,true));
        assert.equal(x.store.hasPrompts(),false);
      }else{
        assert.equal(prompt,undefined);
        assert.equal(x.store.hasPrompts(),false);
      }
    };
    play(first,0,true);
    assert.equal(x.owner.hand.cards.length,6);
    assert.equal(x.owner.marker.hasMarker('DARK_ASSET_MARKER',first),true);
    assert.equal(x.owner.marker.hasMarker('DARK_ASSET_MARKER',second),false);
    const afterFirst=x.owner.hand.cards.length;
    play(second,2,!corrected);
    const secondUsed=x.owner.marker.hasMarker('DARK_ASSET_MARKER',second);
    const secondDraw=x.owner.hand.cards.length-(afterFirst-1);
    assert.equal(secondUsed,!corrected);
    assert.equal(secondDraw,corrected?0:1);
    return {seat,corrected,firstAbilityActivated:true,
      secondAbilityActivated:secondUsed,extraSecondDraw:secondDraw,
      sourceRanks:[4,16],competitiveQualifiedGames:0};
  }finally{restore?.();}
}

for(const seat of [0,1]){
  test('duplicate Crobat printed global Dark Asset bound, seat '+seat,()=>{
    const raw=run(seat,false);
    const repaired=run(seat,true);
    assert.equal(raw.extraSecondDraw,1);
    assert.equal(repaired.extraSecondDraw,0);
    console.log('AGENT8_NATIVE_DOUBLE_CROBAT',
      JSON.stringify({seat,raw,repaired}));
  });
}
