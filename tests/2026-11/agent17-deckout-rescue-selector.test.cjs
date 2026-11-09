'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseDeckoutRescue}=require('../../simulation/twinleaf/2026-11/agent17-deckout-rescue-selector.cjs');

function observation({
  deck=1,prizes=2,hand=['Iono PAL 185','Psychic Energy','Psychic Energy',
    'Psychic Energy','Psychic Energy','Psychic Energy'],
  turn=15,played=0,locked=false,active='Shadow Rider Calyrex VMAX',
  kind='owner-root'
}={}){
  return {
    decisionKind:kind,globalTurn:turn,ownHand:hand,
    ownPublic:{deckCount:deck,prizeCount:prizes,active,
      publicTurnRestrictions:{supporterPlayLocked:locked},
      resolvingSupporter:[]},
    ownTurnResources:{supporterPlayedTurn:played,supporterPlayLocked:locked},
    opponentPublic:{handCount:99,deckCount:99,prizeCount:6}
  };
}

test('high-hand Iono preserves later compulsory turn draw',()=>{
  const result=chooseDeckoutRescue(observation());
  assert.equal(result.family,'iono');
  assert.equal(result.handIndex,0);
  assert.equal(result.drawEstimate.ownDeckAfterReturn,6);
  assert.equal(result.drawEstimate.ownDraw,2);
  assert.equal(result.drawEstimate.ownDeckAfterDraw,4);
  assert.equal(result.score,3);
});
test('prefers greater preserved deck when two shuffle families are held',()=>{
  const hand=['Lillie\'s Determination MEG 119','Iono PAL 185',
    ...Array(7).fill('Psychic Energy')];
  const result=chooseDeckoutRescue(observation({hand}));
  assert.equal(result.family,'iono');
  assert.equal(result.handIndex,1);
  assert.equal(result.drawEstimate.ownDeckAfterDraw,7);
});
test('Marnie rescues only when enough hand cards return',()=>{
  const result=chooseDeckoutRescue(observation({deck:1,prizes:3,
    hand:['Marnie SSH 169',...Array(7).fill('Psychic Energy')]}));
  assert.equal(result.family,'marnie');
  assert.equal(result.drawEstimate.ownDeckAfterDraw,3);
});
test('declines shuffle which would still leave no additional deck cards',()=>{
  assert.equal(chooseDeckoutRescue(observation({
    deck:1,hand:['Iono PAL 185','Psychic Energy','Psychic Energy']
  })),null);
});
test('declines late hand shuffle with no other hand cards',()=>{
  assert.equal(chooseDeckoutRescue(observation({
    deck:0,hand:['Iono PAL 185']
  })),null);
});
test('declines rescue when a healthy deck remains',()=>{
  assert.equal(chooseDeckoutRescue(observation({deck:3})),null);
});
test('honors Supporter lock, spent quota and opening turn',()=>{
  assert.equal(chooseDeckoutRescue(observation({locked:true})),null);
  assert.equal(chooseDeckoutRescue(observation({played:1})),null);
  assert.equal(chooseDeckoutRescue(observation({turn:1})),null);
});
test('requires legal owner root and an active Pokémon',()=>{
  assert.equal(chooseDeckoutRescue(observation({kind:'prompt'})),null);
  assert.equal(chooseDeckoutRescue(observation({active:null})),null);
});
test('uses no opposing private cards or future game-state fields',()=>{
  const view=observation();
  const original=chooseDeckoutRescue(view);
  delete view.opponentPublic;
  assert.deepEqual(chooseDeckoutRescue(view),original);
});
test('keeps printed six-Prize Lillie draw at eight and refuses deck depletion',()=>{
  assert.equal(chooseDeckoutRescue(observation({prizes:6,deck:1,
    hand=['Lillie\'s Determination MEG 119',...Array(8).fill('Psychic Energy')]})),null);
  const result=chooseDeckoutRescue(observation({prizes:6,deck:1,
    hand=['Lillie\'s Determination MEG 119',...Array(10).fill('Psychic Energy')]}));
  assert.equal(result.family,'lillie');
  assert.equal(result.drawEstimate.ownDraw,8);
  assert.equal(result.drawEstimate.ownDeckAfterDraw,3);
});
test('does not create an emergency action without a held named Supporter',()=>{
  assert.equal(chooseDeckoutRescue(observation({
    hand:Array(6).fill('Psychic Energy')
  })),null);
});
