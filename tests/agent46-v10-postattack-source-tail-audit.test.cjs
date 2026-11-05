'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {audit,TARGETS}=
  require('../simulation/evaluation/agent46-v10-postattack-source-tail-audit.cjs');
const sha=rows=>createHash('sha256').update(
  Buffer.from(JSON.stringify(rows))).digest('hex');
const IDS=[
  '6:100:A:champion-reference',
  '6:100:A:new-moon-lockbreaker-v1',
  '6:101:B:champion-reference',
  '6:101:B:new-moon-lockbreaker-v1',
  '11:102:A:champion-reference',
  '11:102:A:new-moon-lockbreaker-v1',
  '11:103:B:champion-reference',
  '11:103:B:new-moon-lockbreaker-v1'
];

/** @param {string} id @param {object[]} roots @returns {object} */
function row(id,roots){
  const digest=sha(roots);
  return {id,sourceDealFingerprint:'synthetic-source:'+id,
    fullPhysicalDealFingerprint:'synthetic-full:'+id,
    originalSourceSeat:id.includes(':B:')?0:1,status:'root-cap',
    publicRootActions:roots,publicRootActionsTruncated:false,
    publicRootActionCount:roots.length,
    publicRootLedgerSha256Computed:digest,
    publicRootLedgerSha256Reported:digest,
    actualSourceAttackSettlement:{declarations:0,attacks:[]}};
}
/** @param {object[]} roots @param {number} index @returns {void} */
function refresh(row,index){
  const digest=sha(row.publicRootActions);
  row.publicRootLedgerSha256Computed=digest;
  row.publicRootLedgerSha256Reported=digest;
  row.publicRootActionCount=row.publicRootActions.length;
}
/** @returns {[object,object]} Synthetic pair, not native outcomes. */
function pair(){
  const original=IDS.map(id=>row(id,Array.from({length:48},(_,i)=>({
    actionOrdinal:i,turnBefore:2,turnAfter:2,action:'ResolvePromptAction',
    playerSlot:id.includes(':B:')?0:1
  }))));
  const treatment=structuredClone(original);
  for(const b of treatment){
    const spec=TARGETS[b.id];
    if(!spec)continue;
    b.publicRootActions[spec.attackRoot]={
      actionOrdinal:spec.attackRoot,turnBefore:2,turnAfter:2,
      playerSlot:0,action:'AttackAction',attack:'Volt Cyclone'};
    const reply=spec.attackRoot+5;
    b.publicRootActions[reply]={
      actionOrdinal:reply,turnBefore:3,turnAfter:3,
      playerSlot:1,action:'PlayCardAction',card:'Psychic Energy'};
    const source=reply+2;
    b.publicRootActions[source]={
      actionOrdinal:source,turnBefore:4,turnAfter:4,
      playerSlot:0,action:'PassTurnAction'};
    b.actualSourceAttackSettlement={
      declarations:1,attacks:[{
        actionOrdinal:spec.attackRoot,turnBefore:2,
        attackName:'Volt Cyclone',settledPromptChain:true,
        completionRootOrdinal:spec.attackRoot+4,
        nextSourceSameEpochProven:true,
        nextSourceRoot:{ordinal:reply,turn:3,action:'PlayCardAction'},
        publicBoardAfter:[{},{}]
      }]};
    refresh(b);
  }
  const receipt=attempts=>({
    schema:'agent1-issue25-joined-v4-public-execution-receipt-v1',
    attempts,registration:{expectedIds:[...IDS]}
  });
  return [receipt(original),receipt(treatment)];
}
test('same-start synthetic two-source-attack archive returns actual next-source roots',()=>{
  const [a,b]=pair();
  const x=audit(a,b);
  assert.equal(x.registeredAttempts,8);
  assert.equal(x.matchedFullPhysicalStarts,8);
  assert.equal(x.nonTargetRootHistoriesUnchanged,6);
  assert.equal(x.settledSourceVoltCyclones,2);
  assert.equal(x.ownSourceNextTurnVoluntaryObserved,2);
  assert.equal(x.qualifiedCompetitiveGames,0);
});
test('absence of an observed next source turn remains censored, not a paper miss',()=>{
  const [a,b]=pair();
  const row=b.attempts.find(x=>x.id==='6:101:B:new-moon-lockbreaker-v1');
  const spec=TARGETS[row.id];
  row.publicRootActions.splice(spec.attackRoot+7);
  refresh(row);
  const x=audit(a,b);
  assert.equal(x.ownSourceNextTurnVoluntaryObserved,1);
  assert.equal(x.rows.find(y=>y.id===row.id).
    nextSourceVoluntaryTurnObserved,false);
});
test('different physical starts under a fixed registered ID cannot compare',()=>{
  const [a,b]=pair();
  b.attempts[0].fullPhysicalDealFingerprint='different-secret-deal';
  assert.throws(()=>audit(a,b),/full deal changed/);
});
test('changed original accepted DCE-root prefix fails retrospective pairing',()=>{
  const [a,b]=pair();
  const x=b.attempts.find(r=>r.id==='6:101:B:champion-reference');
  x.publicRootActions[15].action='PlayCardAction';
  refresh(x);
  assert.throws(()=>audit(a,b),/original paid-DCE accepted root prefix changed/);
});
test('a tampered native accepted tape fails internal digest custody',()=>{
  const [a,b]=pair();
  b.attempts[1].publicRootActions[19].action='AttackAction';
  assert.throws(()=>audit(a,b),/computed ledger mismatch/);
});
test('an attempt ID collision cannot become eight original outcomes',()=>{
  const [a,b]=pair();
  b.attempts[0].id=b.attempts[1].id;
  assert.throws(()=>audit(a,b),/duplicate treatment IDs/);
});
