'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');

const VERSION='agent45-v8-one-native-terminal-mirror-public-episode-audit-v1';
const TARGET='1:212:B:champion-reference';

/**
 * Count only actual Store public roots. Summary does not infer available
 * alternative actions or infer competence from a pass/attack frequency.
 * @param {object[]} roots
 * @param {0|1} sourceSeat
 * @param {0|1} candidateSeat
 */
function publicTurnAndAttackEpisodes(roots,sourceSeat,candidateSeat){
  assert.ok(Array.isArray(roots));
  const turnMap=new Map(),byRole={
    source:{passes:0,attacks:0,nonPassNonPrompt:0,attackNames:{}},
    candidate:{passes:0,attacks:0,nonPassNonPrompt:0,attackNames:{}}
  };
  let clockResets=0;
  for(let i=0;i<roots.length;i++){
    const root=roots[i];
    assert.equal(root.actionOrdinal,i,'real public root ordinals must be contiguous');
    assert.ok(Number.isSafeInteger(root.turnBefore)&&root.turnBefore>=0);
    if(root.turnAfter<root.turnBefore)clockResets++;
    const role=root.playerSlot===sourceSeat?'source':
      root.playerSlot===candidateSeat?'candidate':'other';
    const turn=turnMap.get(root.turnBefore)??{
      turn:root.turnBefore,sourceActions:0,candidateActions:0,
      sourcePasses:0,candidatePasses:0,sourceAttacks:[],candidateAttacks:[],
      sourcePlays:[],candidatePlays:[],promptResolutions:0
    };
    if(role==='source'||role==='candidate'){
      const bucket=byRole[role];
      turn[role+'Actions']++;
      if(root.action==='PassTurnAction'){
        bucket.passes++;
        turn[role+'Passes']++;
      }
      if(root.action==='AttackAction'||(
        root.action==='ResolvePromptAction'&&typeof root.attack==='string')){
        bucket.attacks++;
        const attack=root.attack??'unlabelled';
        bucket.attackNames[attack]=(bucket.attackNames[attack]??0)+1;
        turn[role+'Attacks'].push({ordinal:root.actionOrdinal,attack});
      }
      if(root.action!=='PassTurnAction'&&
          root.action!=='ResolvePromptAction')bucket.nonPassNonPrompt++;
      if(root.action==='PlayCardAction'){
        turn[role+'Plays'].push({ordinal:root.actionOrdinal,
          card:root.card??'unlabelled'});
      }
    }
    if(root.action==='ResolvePromptAction')turn.promptResolutions++;
    turnMap.set(root.turnBefore,turn);
  }
  return {
    rootCount:roots.length,clockResets,
    byRole,
    turns:[...turnMap.values()].sort((a,b)=>a.turn-b.turn),
    distinctSourceAttackTurns:[...turnMap.values()].filter(
      t=>t.sourceAttacks.length>0).length,
    distinctCandidateAttackTurns:[...turnMap.values()].filter(
      t=>t.candidateAttacks.length>0).length
  };
}

/**
 * Preserve strict per-attack settlement and compare Prize deltas with
 * native end-of-game Prize state; non-attack Prizes must remain unknown.
 * @param {object|null} packet
 * @param {0|1} seat
 */
function settledAttackPayoffs(packet,seat){
  const attacks=Array.isArray(packet?.attacks)?packet.attacks:[];
  return {
    declarations:packet?.declarations??null,
    settled:packet?.settled??null,
    withVerifiedSameEpochOpponentRoot:
      packet?.withVerifiedSameEpochSourceReturn??null,
    attacks:attacks.map(a=>{
      const fullySettled=a.settledPromptChain===true;
      const before=fullySettled?a.prizesBefore?.[seat]:null;
      const after=fullySettled?a.prizesAfter?.[seat]:null;
      return {
        ordinal:a.actionOrdinal??null,turn:a.turnBefore??null,
        attack:a.attackName??null,triggerAction:a.triggerAction??null,
        settled:fullySettled,completionRoot:a.completionRootOrdinal??null,
        actorPrizesBefore:Number.isSafeInteger(before)?before:null,
        actorPrizesAfter:Number.isSafeInteger(after)?after:null,
        prizesTakenByAttack:Number.isSafeInteger(before)&&
          Number.isSafeInteger(after)?before-after:null,
        nextOpponentRootVerified:a.nextSourceSameEpochProven===true,
        nextOpponentRoot:a.nextSourceRoot?{
          ordinal:a.nextSourceRoot.ordinal,
          turn:a.nextSourceRoot.turn,
          action:a.nextSourceRoot.action,
          card:a.nextSourceRoot.card??null,
          attack:a.nextSourceRoot.attack??null
        }:null
      };
    })
  };
}

/**
 * Pure, source-independent readout. Only original Store's public ledger,
 * resolved public Prize and attack event packets and manifest facts.
 * @param {{manifest:object,diagnostic:object,rawDevelopment:{rows:object[]}}} result
 */
function auditOriginalV8MirrorTerminal(result){
  const raw=result.rawDevelopment?.rows??[];
  const ids=result.diagnostic?.registered??[];
  assert.equal(raw.length,8);
  assert.equal(ids.length,8);
  const byId=new Map(raw.map(row=>[row.trial?.id??row.id,row]));
  assert.equal(byId.size,8);
  assert.deepEqual([...byId.keys()].sort(),[...ids].sort());
  const row=byId.get(TARGET);
  assert.ok(row);
  assert.equal(row.trial?.rank,1);
  assert.equal(row.trial?.candidateId,'champion-reference');
  assert.equal(row.trial?.candidateSlot,'B');
  const sourceSeat=0,candidateSeat=1;
  assert.equal(row.finished,true);
  assert.equal(row.winner,candidateSeat);
  assert.deepEqual(row.finalPrizes,[6,0]);
  const ledger=row.rootActionLedger;
  assert.ok(Array.isArray(ledger));
  const digest=createHash('sha256').update(JSON.stringify(ledger)).digest('hex');
  assert.equal(digest,row.rootActionLedgerSha256);
  const episodes=publicTurnAndAttackEpisodes(ledger,sourceSeat,candidateSeat);
  const candidate=settledAttackPayoffs(row.candidateAttackSettlement,candidateSeat);
  const source=settledAttackPayoffs(row.sourceAttackSettlement,sourceSeat);
  const prizeFromAttacks=side=>side.attacks.reduce((s,a)=>
    s+(a.prizesTakenByAttack??0),0);
  const detailedStatus=raw.map(r=>({
    id:r.trial?.id??r.id,status:r.status??null,finished:r.finished??null,
    acceptedPublicRootCount:r.rootActionCount??r.rootActionLedger?.length??
      r.nativeAbortEvidence?.rootActionLedger?.length??null,
    sourceRank:r.trial?.rank??null
  }));
  return {
    schema:VERSION,originalFrozenEight:true,
    sourceAndCandidateBothOriginalRank1Printed60:true,
    mirrorRelation:'Candidate champion-reference is loaded from the same exact original rank1 roster entry as the registered original rank1 source. Same list, independent physical shuffles.',
    registeredTrialId:TARGET,sourceSeat,candidateSeat,
    originalSeed:row.trial?.seed??null,initialSourceDealSha256:
      row.sourceDealFingerprint??null,
    initialFullDealSha256:row.fullPhysicalDealFingerprint??null,
    actualStarterSeat:row.actualStarterSeat??null,
    nativeFinished:row.finished,nativeWinner:row.winner,
    nativeEndReason:row.endReason??null,nativeActionCount:row.actionCount,
    finalPrizes:row.finalPrizes,
    publicRootLedgerSha256:digest,rootCount:episodes.rootCount,
    rootChronologyContiguous:true,clockResetsInRootTape:episodes.clockResets,
    byRole:episodes.byRole,
    distinctSourceAttackTurns:episodes.distinctSourceAttackTurns,
    distinctCandidateAttackTurns:episodes.distinctCandidateAttackTurns,
    sourceSettledAttacks:source,candidateSettledAttacks:candidate,
    prizesFromSettledSourceAttacks:prizeFromAttacks(source),
    prizesFromSettledCandidateAttacks:prizeFromAttacks(candidate),
    perTurnPublicActions:episodes.turns,
    fullOriginalEightDispositions:detailedStatus,
    paperGamesQualified:0,competitiveWinRate:null,
    limitations:[
      'Identical rank1 source and champion candidate printings form a mirror. The native terminal is not evidence of structural fixed-deck improvement.',
      'Public roots report selected actions, not feasible alternatives; Pass roots cannot certify a competent opponent choice.',
      'No official match-clock audit, complete paper-rule/print audit, or hidden-information policy qualification.'
    ]
  };
}

module.exports={VERSION,TARGET,publicTurnAndAttackEpisodes,
  settledAttackPayoffs,auditOriginalV8MirrorTerminal};
