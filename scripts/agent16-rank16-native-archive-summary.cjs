'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

/**
 * Compact retrospective report of every archived original rank16 Store arm.
 * Missing row.status is expected for successful native rows. Native
 * engine finishes and caps must remain separate. Exact physical deal
 * equality is independently checked, not assumed from the integer seed.
 * @param {object} result Raw preregistered native runner output.
 */
function summarizeArchive(result){
  assert.equal(result.version,
    'agent16-original-rank16-natural-opening-bothseat-v1');
  assert.equal(result.attempted,16);
  assert.equal(result.competitivelyQualifiedGames,0);
  assert.equal(result.allNativeDevelopmentRows.length,16);
  const statuses={},rootChoice={budewAttack:0,boostShake:0,
    otherAttack:0,passWithoutAttack:0,unknown:0};
  let sourceFirst=0,sourceSecond=0,sourceFingerprintPaired=0;
  const pairs=new Map(),rows=[];
  for(const r of result.allNativeDevelopmentRows){
    const status=r.status??(r.finished===true?'engine-terminal':
      r.endReason==='action-limit'?'action-cap':
      r.finished===false?'native-incomplete':'native-disposition-unverified');
    statuses[status]=(statuses[status]??0)+1;
    if(r.sourceActuallyFirst===true)sourceFirst++;
    if(r.sourceActuallyFirst===false)sourceSecond++;
    const group=[r.trial.rank,r.trial.repeat,r.trial.candidateSlot].join(':');
    if(!pairs.has(group))pairs.set(group,[]);
    pairs.get(group).push(r);
    const sourceFirstTurn=r.sourceActuallyFirst?1:2;
    const roots=r.rootActionLedger?.filter(root=>
      root.playerSlot===r.sourceSeat&&root.turnBefore===sourceFirstTurn&&
      root.pendingPrompt==null)??[];
    const budew=roots.some(root=>root.action==='AttackAction'&&
      root.attack==='Itchy Pollen');
    const shake=roots.some(root=>root.action==='PlayCardAction'&&
      root.card==='Boost Shake');
    const attack=roots.find(root=>root.action==='AttackAction');
    const chose=budew?'budewAttack':shake?'boostShake':
      attack?'otherAttack':roots.length?'passWithoutAttack':'unknown';
    rootChoice[chose]++;
    const aff=r.sourceFirstOwnedAffordances??null;
    rows.push({
      trialId:r.trial.id,candidateId:r.trial.candidateId,
      sourceSeat:r.sourceSeat,sourceActuallyFirst:r.sourceActuallyFirst,
      actualStarterSeat:r.actualStarterSeat,sourceDeal:r.sourceDealFingerprint,
      status,engineFinished:r.finished??null,
      engineEndReason:r.endReason??null,
      actions:r.actionCount??null,
      firstOwnerTurn:sourceFirstTurn,
      ownerHandResources:aff?.firstOwnHand?.resources??null,
      initialActiveBudewObserved:'not-recorded',
      sourceActions:roots.map(root=>({
        ordinal:root.actionOrdinal,action:root.action,
        card:root.card??null,attack:root.attack??null
      })),
      turnEndStatus:aff?.terminalKind??null,
      sourceOpponentReplyRoot:
        r.rootActionLedger?.find(root=>
          root.playerSlot===r.candidateSeat&&
          root.turnBefore===sourceFirstTurn+1&&root.pendingPrompt==null)
          ?.action??null,
      competentlySelectedFirstTurn:false
    });
  }
  assert.equal(pairs.size,8);
  const differences=[];
  for(const [key,group] of pairs){
    assert.equal(group.length,2);
    const equal=group[0].sourceDealFingerprint===group[1].sourceDealFingerprint;
    if(equal)sourceFingerprintPaired++;
    else differences.push(key);
  }
  return {
    version:'agent16-original-rank16-native-archive-honesty-summary-v1',
    dataSource:'original preregistered 16 full-Store native attempts',
    independentGroups:8,attempted:16,
    statuses,sourceFirst,sourceSecond,
    sourceDealPairsMatching:sourceFingerprintPaired,
    sourceDealPairsMismatched:differences.length,
    mismatchedGroupIds:differences,rootChoice,rows,
    qualifiedGames:0,
    caveat:'The two candidates are distinct fixed 60s, so source physical deals can differ even under the same seed. A first-turn pass or ordinary attack is not proof that an alternative Budew or Shake action was legal. No first-turn Active or full owner hand transcript was captured and no paper clock was validated.'
  };
}

if(require.main===module){
  const f=process.argv[2]??'agent16-rank16-all-16-native-attempts.json';
  const parsed=JSON.parse(fs.readFileSync(path.resolve(f),'utf8'));
  process.stdout.write('AGENT16_RANK16_NATIVE '+JSON.stringify(summarizeArchive(parsed))+'\n');
}
module.exports={summarizeArchive};
