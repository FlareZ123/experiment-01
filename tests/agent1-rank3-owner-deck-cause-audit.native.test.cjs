'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {run}=require('../simulation/evaluation/agent1-rank3-owner-deck-cause-audit.cjs');

test('frozen rank-3/rank-1 source deal preserves native controls and attributes the turn-15 owner loss',()=>{
  const result=run();
  assert.equal(result.controlsPass,true,JSON.stringify(result.controls));
  const event=result.turn15ExtraOwnerDeckLoss;
  assert.ok(event,'the frozen one-card turn-15 decrement must be observed');
  assert.equal(event.action.actionClass,'ResolvePromptAction');
  assert.equal(event.turnBefore,15);
  assert.equal(event.activeSeat,1);
  assert.equal(event.deckBefore[1],20);
  assert.equal(event.deckAfter[1],19);
  assert.ok(event.pendingPromptsBefore.length>0,
    'the deck decrement must be associated with a pending native prompt');
  assert.ok(result.artifactPath===null||
    result.artifactPath.endsWith('agent1-rank3-owner-deck-cause-audit.json'));
  process.stdout.write(JSON.stringify({
    controls:result.controls,
    turn15ExtraOwnerDeckLoss:event,
    actions:result.actions,
    turns:result.turns,
    winner:result.winner
  },null,2)+'\n');
});
