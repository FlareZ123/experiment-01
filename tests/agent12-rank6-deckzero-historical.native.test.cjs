'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {run}=require('../simulation/evaluation/agent12-rank6-deckzero-pass-retrospective.cjs');
test('native rank6 unchanged root-ledger deckout and owner-only same-state Lillie affordance',()=>{
  const output=run();
  assert.equal(output.exactHistoricalRootParity,true);
  assert.equal(output.passAudit.realGames,2);
  assert.equal(output.competitiveQualifiedGames,0);
  console.log('DECKZERO_OWNER_PASS_NATIVE '+JSON.stringify({
    sourceRows:output.rows,events:output.passAudit.events,
    competitiveQualifiedGames:0}));
});
