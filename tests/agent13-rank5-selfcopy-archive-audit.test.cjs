'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {sourceSelfCopyChoices,auditNativeArchive}=
  require('../simulation/evaluation/agent13-rank5-selfcopy-archive-audit.cjs');
/** @param {string} name @param {number} damage @param {number} prizes */
function row(name='Cross Fusion Strike',damage=0,prizes=0,changed=true){
  const choice={seat:0,turn:9,sourceIndex:0,
    attackIndex:name==='Max Miracle'?1:0,
    printing:'Mew VMAX FST',attack:name};
  const prompt={actionOrdinal:56,playerSlot:0,turnBefore:9,
    action:'ResolvePromptAction',pendingPrompt:'ChooseAttackPrompt',
    initiatingRootActionOrdinal:55,
    attackChoice:{printing:'Mew VMAX FST',attackName:name,
      sourceIndex:0,attackIndex:choice.attackIndex}};
  const before=[{active:{name:'Mew VMAX',damage:0}},
    {active:{name:'Squawkabilly ex',damage:0}}];
  const after=[{active:{name:'Mew VMAX',damage:0}},
    {active:{name:'Squawkabilly ex',damage}}];
  return {trial:{id:'5:0:B:champion-reference',repeat:0},
    sourceSeat:0,actualStarterSeat:0,
    sourceDealFingerprint:'source-hash',fullPhysicalDealFingerprint:'full-hash',
    rootActionLedger:changed?[{actionOrdinal:55,playerSlot:0,
      action:'AttackAction',attack:'Cross Fusion Strike'},prompt]:[],
    rootActionLedgerSha256:name==='Max Miracle'?'treatment-root':'control-root',
    actorOnlyDecisionCoverage:{detailedComponentAudits:{
      chooseAttack:{selections:changed?[choice]:[]}}},
    sourceAttackSettlement:{attacks:changed?[{
      actionOrdinal:55,turnBefore:9,attackName:'Cross Fusion Strike',
      settledPromptChain:true,settlementCrossesClockReset:false,
      publicBoardBefore:before,publicBoardAfter:after,
      prizesBefore:[6,6],prizesAfter:[6-prizes,6],
      nextSourceRoot:{ordinal:60,turn:10,action:'PlayCardAction',
        card:'Psychic Energy'},nextSourceSameEpochProven:true
    }]:[]},
    finished:true,winner:1,turns:16,actionCount:91};
}
function archive(){
  const controls=[],treatments=[];
  for(let i=0;i<16;i++){
    const a=row('Cross Fusion Strike',0,0,i===0);
    const b=row(i===0?'Max Miracle':'Cross Fusion Strike',i===0?130:0,
      i===0?2:0,i===0);
    a.trial={id:'5:'+Math.floor(i/4)+':'+(i%2?'B':'A')+':'+
      (i%4<2?'champion-reference':'new-moon-lockbreaker-v1'),
      repeat:Math.floor(i/4)};
    b.trial={...a.trial};
    // Identical roots and digests when neither arm presents this option.
    if(i>0){
      a.rootActionLedgerSha256='identity'+i;
      b.rootActionLedgerSha256='identity'+i;
    }
    controls.push(a);treatments.push(b);
  }
  return {schema:'agent13-rank5-selfcopy-maxmiracle-prospective-v1',
    modes:[{native:{rows:controls}},{native:{rows:treatments}}]};
}
test('root-joined original donor attack and physical two-Prize custody',()=>{
  const x=sourceSelfCopyChoices(row('Max Miracle',130,2));
  assert.equal(x.length,1);
  assert.equal(x[0].sourcePrizesTaken,2);
  assert.equal(x[0].observedSameActiveDamageDelta,130);
  assert.equal(x[0].rootOrdinal,56);
  assert.equal(x[0].attackOrdinal,55);
  assert.equal(x[0].nextOpponentRoot.action,'PlayCardAction');
});
test('value comparison and actor-own prompt evidence classify full pairs',()=>{
  const report=auditNativeArchive(archive());
  assert.equal(report.retainedNativeAttempts,32);
  assert.equal(report.identicalPhysicalPairs,16);
  assert.equal(report.summed.controlSelfCopies,1);
  assert.equal(report.summed.treatmentMaxMiracles,1);
  assert.equal(report.summed.changedRootHistories,1);
  assert.equal(report.summed.treatmentTwoPrizeAttacks,1);
  assert.equal(report.summed.treatmentSameTarget130Damage,1);
  assert.equal(report.summed.freshChangedRootHistories,0);
  assert.equal(report.summed.sameNativeWinners,16);
  assert.equal(report.competitivelyQualifiedGames,0);
  assert.equal(report.pairs[0].firstDivergence.index,1);
});
test('read-only archive audit does not inspect arbitrary opponent private zones',()=>{
  const x=archive();
  x.modes[0].native.rows[0].secretOpponentHand=['CANARY'];
  x.modes[1].native.rows[0].secretOpponentHand=['OTHER'];
  const report=auditNativeArchive(x);
  assert.equal(JSON.stringify(report).includes('CANARY'),false);
  assert.equal(JSON.stringify(report).includes('OTHER'),false);
});
test('source deck and full physical opening parity are mandatory',()=>{
  const x=archive();x.modes[1].native.rows[0].sourceDealFingerprint='wrong';
  assert.throws(()=>auditNativeArchive(x));
});
test('unproven copied attack menu is rejected as evidence',()=>{
  const x=row('Max Miracle',130,2);
  x.actorOnlyDecisionCoverage.detailedComponentAudits.
    chooseAttack.selections[0].attack='Cross Fusion Strike';
  assert.throws(()=>sourceSelfCopyChoices(x),
    /actor-only observation/);
});
