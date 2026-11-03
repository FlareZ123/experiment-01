'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {probeWallyFirstTurnGarbotoxin}=
  require('../simulation/twinleaf/agent4-wally-first-turn-garbotoxin-native.cjs');

test('actual native Wally ROS evolves same-turn Trubbish into tool Garbodor in both physical seats',()=>{
  for(const seat of [0,1]){
    const r=probeWallyFirstTurnGarbotoxin(seat);
    console.log('AGENT4_WALLY_FIRST_TURN_GARBOTOXIN '+JSON.stringify(r));
    assert.equal(r.before.turn,2);
    assert.equal(r.before.playedThisTurn,2);
    assert.equal(r.before.toolHeld,true);
    assert.equal(r.before.wallyHeld,true);
    assert.equal(r.before.garbodorInDeck,true);
    assert.equal(r.toolError,null);
    assert.equal(r.wallyError,null);
    assert.equal(r.firstSearch?.type,'ChooseCardsPrompt');
    assert.equal(r.firstSearch?.sourceCard,'Wally ROS');
    assert.equal(r.firstSearch?.ownerDeck,true);
    assert.equal(r.firstSearch?.nativeValidated,true);
    assert.equal(r.firstSearch?.error,null);
    assert.equal(r.targetPrompt?.type,'ChoosePokemonPrompt');
    assert.equal(r.targetPrompt?.nativeValidated,true);
    assert.equal(r.targetPrompt?.error,null);
    assert.equal(r.after.nowGarbodor,true);
    assert.equal(r.after.toolAttached,true);
    assert.equal(r.after.trubbishStillUnderGarbodor,true);
    assert.equal(r.after.garbodorLeftDeck,true);
    assert.equal(r.after.supporterSpent,true);
    assert.deepEqual(r.after.remainingPending,[]);
  }
});
