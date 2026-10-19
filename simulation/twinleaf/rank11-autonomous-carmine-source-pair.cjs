'use strict';
const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots}=require('./new-moon-lockbreak-source-diagnostic.cjs');
const {runArm}=require('./new-moon-second-start-paired.cjs');
const {withAntiPoltergeistCarminePolicy}=
  require('./anti-poltergeist-carmine-policy.cjs');
const FIXTURES=[
  {seed:1111464409,kind:'retrospective-positive'},
  {seed:2026101907,kind:'prospectively-predeclared'}
];
/** @param {object} game */
function observed(game) {
  return {actions:game.actions,turns:game.turns,finished:game.finished,
    winner:game.winner,prizes:game.prizesRemaining,
    firstTurnSlot:game.firstTurnSlot,drawVerified:game.verifiedByDrawLog,
    attacks:game.attackDeclarationTrace.filter(x=>
      ['Poltergeist','Horror House-GX'].includes(x.attackName)).map(x=>({
        turn:x.turnBefore,ordinal:x.actionOrdinal,seat:x.playerSlot,
        name:x.attackName
      }))};
}
/** @param {object} game @param {number} end */
function prefix(game,end) {
  return game.rootActionLedger.filter(x=>x.actionOrdinal<end).map(x=>({
    ordinal:x.actionOrdinal,turn:x.turnBefore,seat:x.playerSlot,
    action:x.action,card:x.card??null
  }));
}
/** @returns {object} */
function run(){
  const opponent=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  }).opponents.find(x=>x.rank===11);
  assert.equal(opponent?.status,'ready');
  const candidate=pairedCandidateSlots().lockbreak;
  assert.equal(opponent.cards.length,60);
  assert.equal(candidate.length,60);
  const rows=[];
  for(const fixture of FIXTURES){
    const args=[candidate,opponent.cards,1,fixture.seed,350,true,true,false,false];
    const baseline=runArm(...args);
    const fork=withAntiPoltergeistCarminePolicy(()=>runArm(...args));
    const contrast=fork.result;
    assert.equal(baseline.verifiedByDrawLog,true);
    assert.equal(contrast.verifiedByDrawLog,true);
    assert.equal(baseline.firstTurnSlot,contrast.firstTurnSlot);
    assert.deepEqual(baseline.deckHashes,contrast.deckHashes);
    const selected=fork.decisions[0];
    if(selected){
      const actual=contrast.rootActionLedger.find(x=>
        x.turnBefore===selected.turn&&x.playerSlot===selected.physicalSeat&&
        x.action==='PlayCardAction'&&x.card==='Carmine');
      assert.ok(actual,'Actual owner Carmine card must be dispatched');
      assert.deepEqual(prefix(contrast,actual.actionOrdinal),
        prefix(baseline,actual.actionOrdinal));
      assert.equal(baseline.rootActionLedger.find(x=>
        x.actionOrdinal===actual.actionOrdinal)?.action,'PassTurnAction');
    }else{
      assert.deepEqual(contrast.rootActionLedger.map(x=>x.action),
        baseline.rootActionLedger.map(x=>x.action));
    }
    rows.push({...fixture,firstTurnSlot:baseline.firstTurnSlot,
      hashes:baseline.deckHashes,policyDecisions:fork.decisions,
      control:observed(baseline),contrast:observed(contrast)});
  }
  return {schema:'rank11-autonomous-carmine-two-source-deal-v1',
    sourceRank:11,qualifiedGames:0,rows,
    limitations:'One retrospectively selected favorable seed plus a prospective seed; no policy competitiveness or paper-clock qualification'};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
