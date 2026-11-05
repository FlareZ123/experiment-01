'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {runPreservedMailTurn5Aba}=
  require('../simulation/evaluation/agent7-preserved-mail-turn5-original48-aba.cjs');
const {withPlumeriaTurnFrontier}=
  require('../simulation/twinleaf/agent7-shadowmist-plumeria-turn-frontier.cjs');

test('native original eight paid Mail continuation A/B/A',()=>{
  const observed=withPlumeriaTurnFrontier(()=>runPreservedMailTurn5Aba());
  const result=observed.result;
  assert.equal(result.registeredOriginalArmsPerCondition,8);
  assert.equal(result.allTrials.length,8);
  assert.equal(result.paperQualifiedGames,0);
  assert.equal(observed.audit.physicalStores,24);
  const index=result.allTrials.findIndex(x=>x.id===result.target.id);
  assert.ok(index>=0);
  const turn5OwnerSnapshot=store=>store.entries.find(entry=>
    entry.action==='PassTurnAction'&&
    entry.ownerSnapshot.seat===1&&entry.ownerSnapshot.turn===5)
    ?.ownerSnapshot??null;
  const a=turn5OwnerSnapshot(observed.audit.games[index]);
  const c=turn5OwnerSnapshot(observed.audit.games[index+16]);
  assert.ok(a,'Original paid-Plumeria source T5 Pass must exist');
  assert.deepEqual(a,c,'Repeated original source T5 owner board drift');
  assert.equal(a.ownBenchOccupied,0,
    'Native original source T5 must have zero occupied Bench slots');
  console.log('AGENT7_PRESERVED_MAIL_T5_NATIVE '+JSON.stringify({
    result,sourceT5ControlOwner:a,sourceT5RepeatOwner:c,
    sourceT5HasNoBench:true,competitiveGamesQualified:0
  }));
});
