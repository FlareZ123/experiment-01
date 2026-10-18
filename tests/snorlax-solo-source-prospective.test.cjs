'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {schedule,summarizeGame}=
  require('../simulation/twinleaf/snorlax-solo-source-prospective.cjs');

test('outcome-blind schedule covers ranks, both seats and fixed repeat set',()=>{
  const rows=schedule();
  assert.equal(rows.length,12);
  assert.deepEqual([...new Set(rows.map(x=>x.rank))],[3,7]);
  assert.deepEqual([...new Set(rows.map(x=>x.sourceSeat))],[0,1]);
  assert.equal(new Set(rows.map(x=>[x.rank,x.sourceSeat,x.repeat].join(':'))).size,12);
  assert.ok(rows.every(x=>Number.isInteger(x.seed)&&x.seed>=0&&x.seed<=0xffffffff));
  const paired=rows.filter(x=>x.rank===3&&x.repeat===0);
  assert.equal(paired.length,2);
  assert.notEqual(paired[0].seed,paired[1].seed);
});

test('real-source summary separates opportunity, selection and attack declaration',()=>{
  const event={playerId:101,sawSnorlax:true,appliedSoloSnorlax:true,
    selectedCount:1,selectedNames:['Snorlax PGO'],otherBasicCountInOwnHand:2};
  const game={
    firstTurnSlot:1,verifiedByDrawLog:true,
    snorlaxSoloOpeningEvents:[event],
    attackDeclarationTrace:[{actionOrdinal:10,playerSlot:1,
      attackName:'Max Geist',resolutionStatus:'not-independently-verified'}],
    rootActionLedger:[{actionOrdinal:0,turnBefore:1,playerSlot:0,action:'ResolvePromptAction'}],
    actionsBySeat:[{ResolvePromptAction:1},{AttackAction:1}],
    finished:false,winner:null,actions:12,turns:3,
    endReason:'action-limit',prizesRemaining:[6,6],
    deckHashes:['one','two'],rules:{format:'EXPANDED'}
  };
  const row=summarizeGame(game,0);
  assert.equal(row.opponentSoloOpportunities,1);
  assert.equal(row.opponentSoloSelections,1);
  assert.equal(row.attackDeclarations[0].resolutionStatus,'not-independently-verified');
  assert.equal(row.finished,false);
  assert.equal(row.competitiveGameQualified,false);
  assert.equal(row.sourceActionCounts.ResolvePromptAction,1);
});

test('no policy event never manufactures an opportunity',()=>{
  const row=summarizeGame({finished:false,attackDeclarationTrace:[],
    rootActionLedger:[],actionsBySeat:[{},{}]},1);
  assert.equal(row.opponentSoloOpportunities,null);
  assert.equal(row.opponentSoloSelections,null);
  assert.equal(row.competitiveGameQualified,false);
});
