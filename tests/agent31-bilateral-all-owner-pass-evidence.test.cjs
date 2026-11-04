'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {auditAllOwnerPasses} =
  require('../simulation/evaluation/agent31-bilateral-all-owner-pass-evidence.cjs');

function physicalFixture() {
  const roots = [
    {actionOrdinal:137,turnBefore:29,playerSlot:1,action:'PassTurnAction'},
    {actionOrdinal:141,turnBefore:30,playerSlot:0,action:'PassTurnAction'}
  ];
  const board = [
    {active:{name:'Mega Absol ex',toolCards:[]},
      bench:[{name:'Oranguru V',toolCards:[]}],stadium:[]},
    {active:{name:'Shadow Rider Calyrex VMAX',
        energyCards:['Psychic Energy MEE'],toolCards:[]},
      bench:[{name:'Shadow Rider Calyrex VMAX',
        energyCards:['Psychic Energy MEE','Psychic Energy MEE','Psychic Energy MEE'],
        printedAttacks:[{name:'Max Geist',cost:[9,9,9]}]}],stadium:[]}
  ];
  const decisions = [
    {actionOrdinal:137,turnBefore:29,playerSlot:1,action:'PassTurnAction',
      decisionHandBefore:{perspectiveSeat:1,ownHandPrintings:['Float Stone BKT']},
      publicBoardBeforePass:board},
    {actionOrdinal:141,turnBefore:30,playerSlot:0,action:'PassTurnAction',
      decisionHandBefore:{perspectiveSeat:0,ownHandPrintings:['Ultra Ball SUM']},
      publicBoardBeforePass:board}
  ];
  return {decisions,roots,trial:{id:'11:3:B:champion-reference'}};
}
test('strict two-seat hand ownership and complete accepted Pass root count', () => {
  const {decisions,roots,trial}=physicalFixture();
  const result=auditAllOwnerPasses(decisions,roots,trial,0);
  assert.equal(result.actualNativePassRoots,2);
  assert.equal(result.observedOwnerPassRoots,2);
  assert.equal(result.completeNativePassCoverage,true);
  assert.deepEqual(result.counts,{
    source:{passes:1,heldFloatStone:0,visibleFundedVmaxPasses:0},
    candidate:{passes:1,heldFloatStone:1,visibleFundedVmaxPasses:1}
  });
  assert.equal(result.receipts[0].visibleFundedVmax.passRoot,137);
  assert.equal(result.receipts[1].ownerHandAtChosenPass[0],'Ultra Ball SUM');
  assert.equal(result.competitivePaperQualifiedGames,0);
});
test('missing or duplicate Pass decision evidence fails closed', () => {
  const {decisions,roots,trial}=physicalFixture();
  assert.throws(()=>auditAllOwnerPasses(decisions.slice(0,1),roots,trial,0),
    /Store Pass roots must match/);
  assert.throws(()=>auditAllOwnerPasses([...decisions,decisions[0]],roots,trial,0),
    /duplicate native decision/);
});
test('wrong acting owner perspective is rejected without hand disclosure', () => {
  const {decisions,roots,trial}=physicalFixture();
  decisions[1].decisionHandBefore.perspectiveSeat=1;
  assert.throws(()=>auditAllOwnerPasses(decisions,roots,trial,0),
    /Pass owner hand must have the acting seat/);
});
test('accepted Pass actor, ordinal and turn must equal exact native root', () => {
  for(const field of ['playerSlot','turnBefore']) {
    const {decisions,roots,trial}=physicalFixture();
    decisions[0][field]+=1;
    assert.throws(()=>auditAllOwnerPasses(decisions,roots,trial,0));
  }
});
test('no raw State, and no opponent private hand, enters the emitted receipt', () => {
  const {decisions,roots,trial}=physicalFixture();
  decisions[0].privateDeck=['secret-opponent-topcard'];
  decisions[0].decisionHandBefore.opponentHandPrintings=['secret-opponent-hand'];
  const r=auditAllOwnerPasses(decisions,roots,trial,0);
  const asText=JSON.stringify(r);
  assert.ok(!asText.includes('secret-opponent-hand'));
  assert.ok(!asText.includes('secret-opponent-topcard'));
  assert.ok(asText.includes('Float Stone BKT'));
});
test('changing source physical seat changes attribution, not a known hidden card', () => {
  const {decisions,roots,trial}=physicalFixture();
  const r=auditAllOwnerPasses(decisions,roots,trial,1);
  assert.equal(r.counts.source.visibleFundedVmaxPasses,1);
  assert.equal(r.counts.candidate.visibleFundedVmaxPasses,0);
});
