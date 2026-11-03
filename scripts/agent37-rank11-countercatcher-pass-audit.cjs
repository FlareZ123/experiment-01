'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const VERSION='agent37-rank11-native-pass-window-audit-v1';
/** @param {object} row Authentic original rank11 native result. */
function auditTrial(row){
  assert.equal(row.trial?.rank,11);
  const source=row.sourceSeat,candidate=row.candidateSeat;
  assert.ok((source===0||source===1)&&candidate===1-source);
  const roots=new Map(row.rootActionLedger.map(r=>[r.actionOrdinal,r]));
  const attacks=new Map(row.sourceAttackSettlement.attacks.map(a=>[a.actionOrdinal,a]));
  const windows=[];
  for(const reply of row.candidateRepliesAfterSourceAttacks){
    const pass=reply.candidateReplyTurnFinalPass;
    if(reply.sourceAttackName!=='Claw of Darkness'||!pass)continue;
    const attack=attacks.get(reply.sourceAttackOrdinal);
    assert.equal(attack?.attackName,'Claw of Darkness');
    assert.equal(roots.get(reply.sourceAttackOrdinal)?.action,'AttackAction');
    assert.equal(roots.get(reply.sourceAttackOrdinal)?.playerSlot,source);
    assert.equal(roots.get(pass.ordinal)?.action,'PassTurnAction');
    assert.equal(roots.get(pass.ordinal)?.playerSlot,candidate);
    assert.equal(roots.get(pass.ordinal)?.turnBefore,pass.turn);
    const own=attack.prizesAfter[candidate],opponent=attack.prizesAfter[source];
    const hand=pass.ownerHandAfterDecision;
    const bench=pass.publicBoardBeforePass[source].bench.filter(Boolean);
    const eligible=reply.sameEpochCandidateReplyVerified===true&&
      own>opponent&&hand.includes('Counter Catcher PAR')&&bench.length>0;
    windows.push({sourceAttackOrdinal:reply.sourceAttackOrdinal,
      passOrdinal:pass.ordinal,candidateTurn:pass.turn,
      candidatePrizesAfterClaw:own,sourcePrizesAfterClaw:opponent,
      handCount:hand.length,heldCatcher:hand.includes('Counter Catcher PAR'),
      heldLillie:hand.includes("Lillie's Determination M1L"),
      bench:bench.map(p=>({name:p.name,energyCards:p.energyCards.length})),
      eligible,nativeCanPlayVerified:false,promptValidated:false});
  }
  return {trial:row.trial.id,source,candidate,
    physicalDeal:row.sourceDealFingerprint,windows,
    count:windows.filter(w=>w.eligible).length,competitiveGamesQualified:0};
}
/** @param {object} archive Full frozen native release archive. */
function auditArchive(archive){
  const trials=archive.cohorts.flatMap(c=>c.raw.rows)
    .filter(r=>r.trial?.rank===11).map(auditTrial);
  return {schema:VERSION,attempts:trials.length,
    structuralWindows:trials.reduce((n,t)=>n+t.count,0),trials,
    competitiveGamesQualified:0};
}
if(require.main===module){
  const archive=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  process.stdout.write(JSON.stringify(auditArchive(archive),null,2)+'\n');
}
module.exports={VERSION,auditTrial,auditArchive};
