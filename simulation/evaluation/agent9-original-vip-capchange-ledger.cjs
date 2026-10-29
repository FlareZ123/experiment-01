'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const TARGET='11:3:A:new-moon-lockbreaker-v1';
const SCHEMA='agent9-original-source-vip-capchange-native-ledger-replay-v1';

/**
 * Read only existing archived root ledgers, including all original physical
 * targets encoded by the runner. No action is chosen, no game is replayed.
 *
 * @param {object} control Original unchanged 32-arm scouting output.
 * @param {object} treatment Original 32-arm scouting output with VIP root.
 * @param {string} [id] Previously identified cap/terminal discrepancy.
 * @returns {object}
 */
function explain(control,treatment,id=TARGET){
  assert.equal(control.registrationBlob,treatment.registrationBlob);
  assert.equal(control.developmentResult.attempted,32);
  assert.equal(treatment.developmentResult.attempted,32);
  const base=control.developmentResult.rows.find(x=>x.trial.id===id);
  const changed=treatment.developmentResult.rows.find(x=>x.trial.id===id);
  assert.ok(base&&changed);
  assert.equal(base.trial.seed,changed.trial.seed);
  assert.equal(base.sourceDealFingerprint,changed.sourceDealFingerprint);
  assert.equal(base.fullPhysicalDealFingerprint,changed.fullPhysicalDealFingerprint);
  assert.equal(base.actualStarterSeat,changed.actualStarterSeat);
  const rootsA=base.rootActionLedger,rootsB=changed.rootActionLedger;
  assert.ok(Array.isArray(rootsA)&&Array.isArray(rootsB));
  const capture=(row)=>({
    ordinal:row.actionOrdinal,
    turn:row.turnBefore,physicalSeat:row.playerSlot,
    kind:row.action,card:row.card??null,
    attack:row.attack??null,
    pendingPrompt:row.pendingPrompt??null,
    initiatingRoot:row.initiatingRootActionOrdinal??null
  });
  const eq=(a,b)=>a.turn===b.turn&&a.physicalSeat===b.physicalSeat&&
    a.kind===b.kind&&a.card===b.card&&a.attack===b.attack&&
    a.pendingPrompt===b.pendingPrompt;
  const mappedA=rootsA.map(capture),mappedB=rootsB.map(capture);
  let first=0;
  while(first<Math.min(mappedA.length,mappedB.length)&&
    eq(mappedA[first],mappedB[first]))first++;
  const around=(rows,lo,hi)=>rows.slice(lo,hi);
  const sourceSeat=base.trial.candidateSlot==='A'?1:0;
  const candidateSeat=1-sourceSeat;
  const audit=changed.actorOnlyDecisionCoverage
    ?.detailedComponentAudits?.ownerVipAfterPass??null;
  const baseVipRoot=rootsA.filter(x=>x.action==='PlayCardAction'&&
    x.card==='Battle VIP Pass');
  const changedVipRoot=rootsB.filter(x=>x.action==='PlayCardAction'&&
    x.card==='Battle VIP Pass');
  const firstSourceVip=changedVipRoot.find(x=>x.playerSlot===sourceSeat);
  const actualFollower=firstSourceVip?rootsB.find(x=>
    x.playerSlot===candidateSeat&&
    x.turnBefore>firstSourceVip.turnBefore&&
    x.action!=='ResolvePromptAction'&&!x.pendingPrompt):null;
  return {
    schema:SCHEMA,trial:id,
    enginePin:control.developmentResult.enginePin,
    rootObservations:{
      originalTotal:rootsA.length,treatmentTotal:rootsB.length,
      firstDivergentRootIndexZeroBased:first,
      originalRootHash:base.rootActionLedgerSha256,
      treatmentRootHash:changed.rootActionLedgerSha256,
      untouchedRootPrefix:around(mappedA,0,first),
      originalContext:around(mappedA,Math.max(0,first-4),first+25),
      treatmentContext:around(mappedB,Math.max(0,first-4),first+25)
    },
    physicalProvenance:{
      sourceRank:base.trial.rank,sourceSeat,candidateSeat,
      sourceFingerprint:base.sourceDealFingerprint,
      fullFingerprint:base.fullPhysicalDealFingerprint,
      actualFirstSeat:base.actualStarterSeat,
      seed:base.trial.seed
    },
    effects:{
      originalStatus:base.status??(base.finished?'terminal':'capped'),
      treatmentStatus:changed.status??(changed.finished?'terminal':'capped'),
      originalTerminal:base.finished,
      treatmentTerminal:changed.finished,
      originalPrizes:base.finalPrizes,
      treatmentPrizes:changed.finalPrizes,
      originalNativeVipRoots:baseVipRoot.map(capture),
      treatmentNativeVipRoots:changedVipRoot.map(capture),
      treatmentVipAudit:audit,
      firstOpposingReplyAfterSourceVip:actualFollower?capture(actualFollower):null
    },
    archivedGameReplayPerformed:false,
    candidateCompetitivelyQualified:false,
    caveat:'Root-ledger comparison includes chronology and native action labels; hidden discarded/hand changes and target choices are not fully reconstructed. The cap shift is a selected source-deal policy effect, not proof of better or worse deck performance.'
  };
}
if(require.main===module){
  assert.equal(process.argv.length,4,'Need control and treatment archive paths');
  const [control,treatment]=process.argv.slice(2).map(p=>
    JSON.parse(fs.readFileSync(p,'utf8')));
  const output=explain(control,treatment);
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
  process.stderr.write('AGENT9_CAP_DIVERGENCE '+JSON.stringify({
    trial:output.trial,firstRoot:output.rootObservations.firstDivergentRootIndexZeroBased,
    sourceVip:output.effects.treatmentVipAudit?.bySeat?.[output.physicalProvenance.sourceSeat],
    candidateVip:output.effects.treatmentVipAudit?.bySeat?.[output.physicalProvenance.candidateSeat],
    originalFirstAfter:output.rootObservations.originalContext.slice(0,12),
    treatedFirstAfter:output.rootObservations.treatmentContext.slice(0,16),
    opponentFirstReply:output.effects.firstOpposingReplyAfterSourceVip,
    terminalPair:[output.effects.originalTerminal,output.effects.treatmentTerminal]
  })+'\n');
}
module.exports={SCHEMA,TARGET,explain};
