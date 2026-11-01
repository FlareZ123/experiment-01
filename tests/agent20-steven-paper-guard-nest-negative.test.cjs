'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {run}=require('../simulation/twinleaf/agent20-steven-paper-guard-nest-negative.cjs');

test('Steven-only guard preserves paper-valid zero choice of original rank7 Nest Ball',()=>{
  const outcome=run();
  assert.equal(outcome.competitiveQualifiedGames,0);
  assert.equal(outcome.rows.length,2);
  for(const row of outcome.rows){
    assert.equal(row.originalRank,7);
    assert.equal(row.printing,'Nest Ball SVI 181');
    assert.equal(row.ownDeck,true);
    assert.equal(row.promptPrinting,'Nest Ball SVI');
    assert.equal(row.validatorAcceptedZero,true);
    assert.equal(row.accepted,true,JSON.stringify(row));
    assert.equal(row.thrown,null);
    assert.equal(row.deckAfter,row.deckBefore);
    assert.deepEqual(row.guardAudit,{
      sourceStampedOwnDeckPrompts:0,nonemptyAccepted:0,emptyVetoed:0
    });
  }
});
