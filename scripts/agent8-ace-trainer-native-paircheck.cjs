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
  candidateAttackProof:(row.candidateAttackSettlement?.attacks??[])
    .map(x=>({turn:x.turnBefore,attack:x.attackName,
      before:x.prizesBefore,after:x.prizesAfter})),
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
  const chosen=[];
  for(let i=0;i<control.rows.length;i++){
    const base=control.rows[i],on=treatment.rows[i];
    const decisions=acePlays(on).filter(x=>x.seat===on.candidateSeat);
    for(const decision of decisions){
      assert.equal(decision.accepted,true,'Native Ace Trainer rejected');
      assert.equal(decision.nativePhysicalEffect,'confirmed-public-effect',
        'Native Ace Trainer missing public Supporter spend');
      const sourceReply=on.rootActionLedger.find(x=>
        x.playerSlot===on.sourceSeat&&
        x.turnBefore>decision.globalTurn&&
        x.action==='AttackAction');
      assert.ok(sourceReply,
        'Opponent source did not continue with a real printed attack');
      chosen.push({trial:on.trial.id,turn:decision.globalTurn,
        actionOrdinal:on.rootActionLedger.find(x=>
          x.turnBefore===decision.globalTurn&&
          x.playerSlot===on.candidateSeat&&
          x.action==='PlayCardAction'&&x.card==='Ace Trainer')?.actionOrdinal??null,
        supported:true,sourceReply:{
          turn:sourceReply.turnBefore,actionOrdinal:sourceReply.actionOrdinal,
          attack:sourceReply.attack
        }});
    }
  }
  const onlyNewMoon=chosen.filter(x=>
    x.trial.includes('new-moon-lockbreaker-v1'));
  assert.equal(onlyNewMoon.length,2,
    'Expected two confirmed owner Ace Trainer developments');
  assert.deepEqual(onlyNewMoon.map(x=>x.turn),[14,20],
    'First intervention clock changed from registered fixture');
  for(const pair of pairs.filter(x=>
    x.control.id.includes('champion-reference'))){
    assert.equal(pair.control.rootDigest,pair.treatment.rootDigest,
      'Ace absent but champion source-first replay changed');
  }
  return {
    schema:'agent8-emergency-ace-trainer-sourcefirst-same-deal-v2',
    independentVariable:'Owner-only emergency Ace Trainer Supporter root',
    otherPolicy:'Near-term damaging Energy recipient enabled in both arms',
    confirmedSourceReplyAfterAce:chosen,
    pairs,
    competitiveQualified:false,
    caveat:'Selected historical same-initial-deal source-first games; one new owner decision changes subsequent RNG/plays and proves no expected win rate'
  };
}
if(require.main===module){
  const [a,b]=process.argv.slice(2);
  assert.ok(a&&b,'Pass control/treatment source-first JSON archives');
  process.stdout.write(JSON.stringify(compare(load(a),load(b)),null,2)+'\n');
}
module.exports={compare,acePlays};
