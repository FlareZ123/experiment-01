'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

/** @param {string} path @returns {object} */
const load=path=>JSON.parse(fs.readFileSync(path,'utf8'));
/** @param {object} row @returns {object[]} */
const roots=row=>row.actorOnlyDecisionCoverage
  ?.detailedComponentAudits?.root?.nativeRootAcceptances??[];
/** @param {object} row @returns {object[]} */
const acePlays=row=>roots(row).filter(x=>x.kind==='play-ace-trainer');
/** @param {object} row @returns {object} */
const inventory=row=>({
  id:row.trial.id,
  physicalSourceDeal:row.sourceDealFingerprint,
  actualStarterSeat:row.actualStarterSeat,
  sourceFirst:row.sourceActuallyFirst,
  status:row.status??'completed',
  roots:row.rootActionCount,
  rootDigest:row.rootActionLedgerSha256,
  attacks:row.attackDeclarations,
  prizes:row.finalPrizes??null,
  finish:row.finished??null,
  winner:row.winner??null,
  sourceAttackNames:(row.sourceAttackSettlement?.attacks??[]).map(x=>({
    turn:x.turnBefore,attack:x.attackName
  })),
  acePlays:acePlays(row).map(x=>({
    turn:x.globalTurn,seat:x.seat,intent:x.intent,
    accepted:x.accepted,
    physical:x.nativePhysicalEffect
  })),
  turn22Roots:roots(row).filter(x=>x.globalTurn===22&&x.seat===row.candidateSeat)
    .map(x=>({kind:x.kind,intent:x.intent,
      accepted:x.accepted,physical:x.nativePhysicalEffect}))
});

/**
 * Compare a single added actor-owned emergency draw Supporter on identical
 * source-first physical games. Preserve full refusal/failed attempts.
 */
function compare(control,treatment){
  assert.equal(control.attempted,4);
  assert.equal(treatment.attempted,4);
  assert.equal(control.rows.length,4);
  assert.equal(treatment.rows.length,4);
  assert.equal(control.sourceFirstRetrospective,true);
  assert.equal(treatment.sourceFirstRetrospective,true);
  assert.equal(control.competitiveQualifiedGames,0);
  assert.equal(treatment.competitiveQualifiedGames,0);
  const pairs=[];
  for(let i=0;i<4;i++){
    const a=control.rows[i],b=treatment.rows[i];
    assert.deepEqual(a.trial,b.trial,'Changed opponent/candidate registration');
    assert.equal(a.sourceDealFingerprint,b.sourceDealFingerprint,
      'Changed physical source deal');
    assert.equal(a.actualStarterSeat,b.actualStarterSeat);
    assert.equal(a.sourceActuallyFirst,true);
    assert.equal(b.sourceActuallyFirst,true);
    assert.equal(acePlays(a).length,0,
      'ACE control must retain default-off root behavior');
    pairs.push({control:inventory(a),treatment:inventory(b)});
  }
  const idx=control.rows.findIndex(row=>row.trial.rank===11&&
    row.trial.candidateId==='new-moon-lockbreaker-v1');
  assert.ok(idx>=0,'Rank11 source-first New Moon fixture missing');
  const base=control.rows[idx],on=treatment.rows[idx];
  const staged=(r)=>roots(r).find(x=>x.globalTurn===22&&
    x.seat===r.candidateSeat&&x.kind==='attach-basic-energy');
  for(const row of [base,on]){
    const e=staged(row);
    assert.equal(e?.intent?.slot,'bench');
    assert.equal(e?.intent?.attackName,'Poltergeist');
    assert.equal(e?.accepted,true);
  }
  const decided=acePlays(on).filter(x=>x.seat===on.candidateSeat);
  assert.ok(decided.length>0,
    'Owner Ace Trainer root never selected under actual Prize deficit');
  assert.ok(decided.some(x=>x.accepted===true&&
    x.nativePhysicalEffect==='confirmed-public-effect'),
  'Owner Ace Trainer must be publicly confirmed after native Store play');
  return {
    schema:'agent8-emergency-ace-trainer-sourcefirst-same-deal-v1',
    originalBranch:'near-term damaging recipient enabled in both arms',
    modifiedFactor:'actor-owned printed Ace Trainer emergency Supporter',
    selectedNativeOwnerRoots:decided.map(x=>({
      turn:x.globalTurn,kind:x.kind,intent:x.intent,
      accepted:x.accepted,nativePhysicalEffect:x.nativePhysicalEffect
    })),
    pairs,
    competitiveQualified:false,
    caveat:'Selected historical source-first games and unqualified native policy; altered attacks/engine terminal are development-only, not field win evidence'
  };
}
if(require.main===module){
  const [a,b]=process.argv.slice(2);
  assert.ok(a&&b,'Pass control/treatment source-first JSON archives');
  process.stdout.write(JSON.stringify(compare(load(a),load(b)),null,2)+'\n');
}
module.exports={compare,acePlays};
