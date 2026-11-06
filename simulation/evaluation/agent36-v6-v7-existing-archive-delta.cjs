'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const registration=require('../../results/aichi-2026/registrations/agent36-issue25-common-v6-96root-20261106.json');

const ROOT=path.resolve(__dirname,'../..');
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const FROZEN=[
  {name:'v6',sha:'ecff915c5cb7a8c573fb790c00b7c5134949ec6f70a2bb6b357c6cceb55bd964',
    version:'agent36-issue25-common-owner-root-v6-prospective-96'},
  {name:'v7',sha:'e54944b2592917b6578267b523718dd9cad6f929f3a2b3deffce01f8e205cb7a',
    version:'agent36-issue25-common-volt-v7-retro-96root'}
];
/**
 * Verify exact v6/v7 locked native artifacts without running new games.
 * @param {string} root Checkout containing actual GitHub Actions artifacts.
 * @returns {object}
 */
function compare(root=ROOT){
  const archives={};
  for(const input of FROZEN){
    const dir=path.join(root,'archives',input.name);
    const file='issue25-steward-'+input.name+'.json';
    const bytes=fs.readFileSync(path.join(dir,file));
    const digest=sha256(bytes);
    const sidecar=fs.readFileSync(path.join(dir,
      'issue25-steward-'+input.name+'.sha256'),'utf8');
    assert.equal(digest,input.sha,input.name+' published digest mismatch');
    assert.equal(sidecar,digest+'  '+file+'\n',
      input.name+' atomically written sidecar mismatch');
    const receipt=JSON.parse(bytes.toString('utf8'));
    assert.equal(receipt.actuallyExecutingManifest?.version,input.version);
    assert.equal(receipt.actuallyExecutingManifest?.nativeRootActionLimit,96);
    assert.equal(receipt.actuallyExecutingManifest?.releaseQualified,false);
    assert.equal(receipt.qualifiedCompetitiveGames,0);
    assert.equal(receipt.registration?.exactJoinedByTrialId,true);
    assert.equal(receipt.registration?.registeredReconciliation?.exactUniqueMatch,true);
    archives[input.name]=receipt;
  }
  const expected=registration.trials.map(t=>t.id);
  const asMap=rows=>new Map(rows.map(x=>[x.id,x]));
  const a=asMap(archives.v6.attempts);
  const b=asMap(archives.v7.attempts);
  assert.equal(a.size,8);
  assert.equal(b.size,8);
  assert.deepEqual([...a.keys()].sort(),expected.slice().sort());
  assert.deepEqual([...b.keys()].sort(),expected.slice().sort());
  const matches=[];
  for(const id of expected){
    const before=a.get(id),after=b.get(id);
    const beforeSource=before.sourceDealFingerprint??null;
    const afterSource=after.sourceDealFingerprint??null;
    const beforeFull=before.fullPhysicalDealFingerprint??null;
    const afterFull=after.fullPhysicalDealFingerprint??null;
    assert.ok(beforeSource&&afterSource&&beforeFull&&afterFull,
      'Expected initial physical deal fingerprints: '+id);
    assert.equal(beforeSource,afterSource,id+' source opening changed');
    assert.equal(beforeFull,afterFull,id+' entire initial physical deal changed');
    const sourceSeat=before.originalSourceSeat??
      before.nativeAbortProvenance?.sourceSeat??
      (id.includes(':A:')?1:0);
    assert.equal(sourceSeat,after.originalSourceSeat??
      after.nativeAbortProvenance?.sourceSeat??sourceSeat);
    const roots1=before.publicRootActions??[];
    const roots2=after.publicRootActions??[];
    assert.equal(before.publicRootActionsTruncated,false);
    assert.equal(after.publicRootActionsTruncated,false);
    const samePrefixLength=(()=>{
      let n=0;
      while(n<Math.min(roots1.length,roots2.length)&&
        JSON.stringify(roots1[n])===JSON.stringify(roots2[n]))n++;
      return n;
    })();
    const initialVolt=roots1.find(r=>r.playerSlot===sourceSeat&&
      r.action==='AttackAction'&&r.attack==='Volt Cyclone');
    const treatedVolt=roots2.find(r=>r.playerSlot===sourceSeat&&
      r.action==='AttackAction'&&r.attack==='Volt Cyclone');
    const attacks=(after.actualSourceAttackSettlement?.attacks??[]).map(attack=>{
      const publicOwnerBefore=attack.publicBoardBefore?.[sourceSeat]??null;
      const publicOwnerAfter=attack.publicBoardAfter?.[sourceSeat]??null;
      const publicOtherBefore=attack.publicBoardBefore?.[1-sourceSeat]??null;
      const publicOtherAfter=attack.publicBoardAfter?.[1-sourceSeat]??null;
      const reply=attack.nextSourceRoot??null;
      const laterOwner=roots2.find(r=>
        r.playerSlot===sourceSeat&&r.turnBefore>=attack.turnBefore+2&&
        r.action!=='ResolvePromptAction'&&
        r.actionOrdinal>(reply?.ordinal??attack.actionOrdinal))??null;
      return {
        ordinal:attack.actionOrdinal,
        name:attack.attackName,
        genuineNativePromptSettled:attack.settledPromptChain===true,
        completionOrdinal:attack.completionRootOrdinal,
        crossedEpochReset:attack.settlementCrossesClockReset===true,
        sameEpochOpponentReplyProven:attack.nextSourceSameEpochProven===true,
        opponentFirstReply:reply,
        nextSourceVoluntaryRoot:laterOwner?{
          ordinal:laterOwner.actionOrdinal,
          turn:laterOwner.turnBefore,
          action:laterOwner.action,
          card:laterOwner.card??null,
          attack:laterOwner.attack??null
        }:null,
        sourceActiveEnergyBefore:publicOwnerBefore?.active?.energyCards??null,
        sourceActiveEnergyAfter:publicOwnerAfter?.active?.energyCards??null,
        sourceBenchEnergiesBefore:publicOwnerBefore?.bench?.map(x=>
          x?.energyCards??null)??null,
        sourceBenchEnergiesAfter:publicOwnerAfter?.bench?.map(x=>
          x?.energyCards??null)??null,
        opponentActiveHpBefore:publicOtherBefore?.active?.hp??null,
        opponentActiveDamageBefore:publicOtherBefore?.active?.damage??null,
        opponentActiveDamageAfter:publicOtherAfter?.active?.damage??null,
        prizeBefore:attack.prizesBefore??null,
        prizeAfter:attack.prizesAfter??null
      };
    });
    matches.push({
      id,sourceSeat,
      matchingFullDeal:true,matchingSourceDeal:true,
      controlDisposition:before.rawDisposition,
      treatmentDisposition:after.rawDisposition,
      controlRootCount:before.publicRootActionCount,
      treatmentRootCount:after.publicRootActionCount,
      controlAttackOrdinal:initialVolt?.actionOrdinal??null,
      treatmentAttackOrdinal:treatedVolt?.actionOrdinal??null,
      sourceVoltOrdinalPreserved:!!initialVolt&&
        initialVolt.actionOrdinal===treatedVolt?.actionOrdinal,
      exactPublicRootPrefix: samePrefixLength,
      controlSourceAttackSettlementIsUnknown:
        before.actualSourceAttackSettlement===null,
      treatmentSourceAttackDeclarations:attacks.length,
      treatmentSettledAttackCount:attacks.filter(a=>
        a.genuineNativePromptSettled).length,
      attacks
    });
  }
  return {
    schema:'agent36-issue25-real-native-v6-to-v7-same-deal-independent-audit-v1',
    controlOriginalArtifactSha256:FROZEN[0].sha,
    treatedOriginalArtifactSha256:FROZEN[1].sha,
    pairedActualOriginalPhysicalDeals:8,
    sameRegistrationAndActualNativeEight:true,
    controlledTreatment:'allturn-owner-native-Volt-AttachEnergyPrompt-only',
    totalVerifiedSettledSourceAttacks:matches.reduce((n,row)=>
      n+row.treatmentSettledAttackCount,0),
    totalVerifiedSameEpochOpponentReplies:matches.reduce((n,row)=>
      n+row.attacks.filter(a=>a.genuineNativePromptSettled&&
        a.sameEpochOpponentReplyProven).length,0),
    attempts:matches,
    competitiveGamesQualified:0,
    verdict:'FAIL-retrospective-paper-policy-competence-and-clock-unverified'
  };
}
if(require.main===module)
  process.stdout.write('AGENT36_V6_V7_SAMEDEAL '+
    JSON.stringify(compare())+'\n');
module.exports={FROZEN,compare};
