'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const ROOT=path.resolve(__dirname,'../..');
const TARGETS=new Map([
  ['6:101:B:champion-reference',31],
  ['6:101:B:new-moon-lockbreaker-v1',38]
]);
const sha256=data=>createHash('sha256').update(data).digest('hex');

/**
 * Read the already completed frozen v10 native archive, and identify whether
 * the same original source ever receives another voluntary decision after its
 * settled attack and the opponent's actual same-epoch reply.
 * Never runs a game, reads concealed game state, or mutates archived bytes.
 * @param {string} [root] Checkout root containing a downloaded Actions artifact.
 * @returns {object} Failure-inclusive observed original source-root audit.
 */
function auditExisting(root=ROOT){
  const folder=path.join(root,'archives','v10');
  const load=name=>{
    const filename=name+'.json';
    const bytes=fs.readFileSync(path.join(folder,filename));
    const sidecar=fs.readFileSync(path.join(folder,filename+'.sha256'),'utf8');
    const digest=sha256(bytes);
    assert.equal(sidecar,digest+'  '+filename+'\n',
      'Original v10 immutable JSON/sha sidecar mismatch: '+filename);
    return JSON.parse(bytes.toString('utf8'));
  };
  const control=load('control-complete');
  const treatment=load('treatment-complete');
  const summary=load('agent5-v10-summary');
  assert.equal(summary.originalTrials,8);
  assert.equal(summary.retrospectiveNativeBranchTargets,2);
  assert.equal(summary.rows.length,8);
  assert.equal(control.attempts.length,8);
  assert.equal(treatment.attempts.length,8);
  assert.equal(summary.controlAndTreatmentSourceInitialDealsAllMatched,true);
  assert.equal(summary.sixNonTargetPublicRootTapesIdentical,true);
  assert.equal(summary.twoTargetPreDceAcceptedRootPrefixesIdentical,true);
  assert.equal(summary.competitiveGamesQualified,0);
  const byId=rows=>new Map(rows.map(x=>[x.id,x]));
  const base=byId(control.attempts);
  const treated=byId(treatment.attempts);
  const observed=byId(summary.rows);
  const checked=new Set();
  const arms=[];
  for(const row of summary.rows){
    assert.ok(!checked.has(row.id),'Repeated original trial ID');
    checked.add(row.id);
    const a=base.get(row.id);
    const b=treated.get(row.id);
    assert.ok(a&&b,'Missing original genuine Store receipt');
    for(const packet of [a,b]){
      const roots=packet.publicRootActions;
      assert.ok(Array.isArray(roots) &&
        packet.publicRootActionsTruncated===false);
      assert.equal(packet.publicRootLedgerSha256Computed,
        sha256(Buffer.from(JSON.stringify(roots))));
      assert.ok(roots.every((r,i)=>r.actionOrdinal===i));
    }
    assert.equal(row.sameOriginalAndCandidateFullPhysicalDeal,true,
      row.id+': mismatched physical initial deal');
    const attackOrdinal=TARGETS.get(row.id);
    if(attackOrdinal===undefined){
      assert.equal(row.fullNonTargetPublicTapeUnchanged,true,
        row.id+': non-target accepted Store tape changed');
      arms.push({id:row.id,target:false,
        disposition:row.treatmentDisposition,
        originalRootCount:a.publicRootActions.length,
        treatmentRootCount:b.publicRootActions.length});
      continue;
    }
    assert.equal(row.unchangedSourceAcceptedPrefixThroughDce,true);
    assert.equal(row.baselineTargetMatchesFrozenRegistration,true);
    assert.equal(row.nativeSourceOwnerLineAudit?.nativeSettledMandatoryEnergyMoves,1);
    const attack=b.actualSourceAttackSettlement?.attacks?.find(x=>
      x.actionOrdinal===attackOrdinal&&x.attackName==='Volt Cyclone');
    assert.ok(attack,'Missing actual settled source Volt Cyclone');
    assert.equal(attack.settledPromptChain,true);
    assert.equal(attack.nextSourceSameEpochProven,true);
    assert.equal(attack.nextSourceRoot?.action,'PlayCardAction');
    assert.equal(attack.nextSourceRoot?.card,'Psychic Energy');
    assert.deepEqual(attack.prizesBefore,[6,6]);
    assert.deepEqual(attack.prizesAfter,[6,6]);
    const voluntarySource=packet=>packet.publicRootActions.filter(x=>
      x.playerSlot===0&&x.turnBefore>=4&&
      x.action!=='ResolvePromptAction').slice(0,8).map(x=>({
        ordinal:x.actionOrdinal,turn:x.turnBefore,
        action:x.action,card:x.card??null,attack:x.attack??null
      }));
    const originalReturn=voluntarySource(a);
    const treatmentReturn=voluntarySource(b);
    const oActive=attack.publicBoardAfter?.[1]?.active??null;
    arms.push({
      id:row.id,target:true,sourceSeat:0,
      disposition:row.treatmentDisposition,
      sourceAttackRoot:attack.actionOrdinal,
      sourcePromptCompletionRoot:attack.completionRootOrdinal,
      opponentActive:attack.publicBoardBefore?.[1]?.active?.name??null,
      opponentActiveDamageAfter:oActive?.damage??null,
      prizeChange:attack.prizesAfter?.map((v,i)=>
        v-attack.prizesBefore[i])??null,
      firstAcceptedOpponentReply:attack.nextSourceRoot,
      originalControlNextSourceVoluntaryRoots:originalReturn,
      treatmentNextSourceVoluntaryRoots:treatmentReturn,
      treatmentNextSourceVoluntaryRootObserved:treatmentReturn.length>0,
      sourceActiveEnergyImmediatelyAfter:
        attack.publicBoardAfter?.[0]?.active?.energyCards??null,
      sourceBenchEnergyImmediatelyAfter:
        attack.publicBoardAfter?.[0]?.bench?.map(x=>x.energyCards)??null
    });
  }
  assert.equal(checked.size,8);
  return {
    schema:'agent36-frozen-v10-original-source-next-turn-postpayoff-v1',
    realOriginalEightAndHashesChecked:true,
    sourceOnlyExactPhysicalDceAttackThenOpponentReply:2,
    arms,qualifiedCompetitiveGames:0
  };
}
if(require.main===module){
  process.stdout.write(JSON.stringify(auditExisting())+'\n');
}
module.exports={auditExisting,TARGETS};
