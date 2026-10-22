'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {planAichi}=require('./aichi-pilot.cjs');
const {sourceFirstPressureTrials,executeDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {loadNewMoonCandidate}=
  require('../../scripts/aichi-new-moon-candidate.cjs');

const SOURCE_DEAL='60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31';
const CONTROL_LEDGER='b6810151644e298d8a4bdfcd766e8adf509a5c25e6a73a0f4aa02c4c8fd9f5a6';

/** @param {object} row @returns {object} */
function compact(row){
  const roots=row.rootActionLedger??[];
  return {
    trial:row.trial?.id??null,sourceDealFingerprint:row.sourceDealFingerprint??null,
    actualStarterSeat:row.actualStarterSeat??null,sourceSeat:row.sourceSeat??null,
    candidateSeat:row.candidateSeat??null,
    rootActionLedgerSha256:row.rootActionLedgerSha256??null,
    rootActionCount:row.rootActionCount??null,
    nativeSupporterQuotaQualified:row.nativeSupporterQuotaQualified??null,
    actorRootVersion:row.actorAudit?.componentVersions?.root??null,
    actorRootIntents:(row.actorAudit?.detailedComponentAudits?.root?.ownerRootIntents??[])
      .filter(x=>x.intent?.kind==='play-stranded-marnie'),
    sourceOwnerTurnSevenHandTrace:row.agent50SourceOwnerTurnSevenHandTrace??null,
    marnieNativeRootReceipts:(row.actorAudit?.detailedComponentAudits?.root?.nativeRootAcceptances??[])
      .filter(x=>x.kind==='play-stranded-marnie'),
    actualMarnieRoots:roots.filter(x=>x.playerSlot===0&&
      x.action==='PlayCardAction'&&x.card==='Marnie').map(x=>({
        ordinal:x.actionOrdinal,turn:x.turnBefore,card:x.card
      })),
    sourceTurnSeven:roots.filter(x=>x.playerSlot===0&&x.turnBefore===7)
      .map(x=>({ordinal:x.actionOrdinal,turn:x.turnBefore,
        action:x.action,card:x.card??null,pendingPrompt:x.pendingPrompt??null})),
    sourceSettledAttacks:row.sourceAttackSettlement?.settled??null,
    candidateSettledAttacks:row.candidateAttackSettlement?.settled??null,
    finalPrizes:row.finalPrizes??null,
    winner:row.winner??null,finished:row.finished??false,
    endReason:row.endReason??null,
    abort:row.status??null,error:row.error??null,
    // A rejected root must retain its real accepted prefix, original
    // source physical-deal digest and the post-choice public error receipt.
    // Never infer physical-target parity from compact root action labels.
    nativeAbortEvidence:row.nativeAbortEvidence??null,
    fullOriginalNativeRootActionLedger:roots,
    firstThirtyAfterT7:roots.filter(x=>x.turnBefore>=7).slice(0,30)
  };
}

/** Same registered source-first physical trial, with one owner-only switch. */
function run(){
  const deck=loadNewMoonCandidate();
  const plan=planAichi({label:deck.id,cards:deck.cards},{
    allowEquivalentBasicEnergies:true,allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const trial=sourceFirstPressureTrials().find(row=>
    row.rank===11&&row.candidateId==='new-moon-lockbreaker-v1');
  assert.ok(trial,'Source-first rank11 New Moon registration is required');
  assert.equal(trial.seed,482443328);
  assert.equal(trial.candidateSlot,'B');
  assert.equal(plan.candidate.cards.length,60);
  const candidates=new Map([['new-moon-lockbreaker-v1',{plan}]]);
  const savedDev=process.env.AGENT50_STRANDED_MARNIE_DEV;
  const savedSeat=process.env.AGENT50_STRANDED_MARNIE_OWNER_SEAT;
  const arms=[];
  try{
    process.env.AGENT50_STRANDED_MARNIE_OWNER_SEAT='0';
    for(const enabled of [false,true]){
      process.env.AGENT50_STRANDED_MARNIE_DEV=enabled?'true':'false';
      try{
        const execution=()=>executeDevelopment(trial,candidates,{
          mandatoryOptionFallback:true,paperSupporterQuota:true,
          garbotoxinWindow:true
        });
        const observed=withCanonicalActorOnlyPolicy(execution,{},{
          ownerSingleSearch:true,genericFallbackAttribution:true,
          actorHandDiscard:true,actorChoosePokemon:true
        });
        arms.push({enabled,result:{...observed.result,actorAudit:observed.audit}});
      }catch(error){
        arms.push({enabled,result:{status:'engine-error',
          error:String(error?.stack??error).slice(0,6000)}});
      }
    }
  }finally{
    if(savedDev===undefined)delete process.env.AGENT50_STRANDED_MARNIE_DEV;
    else process.env.AGENT50_STRANDED_MARNIE_DEV=savedDev;
    if(savedSeat===undefined)delete process.env.AGENT50_STRANDED_MARNIE_OWNER_SEAT;
    else process.env.AGENT50_STRANDED_MARNIE_OWNER_SEAT=savedSeat;
  }
  const [control,treatment]=arms.map(a=>compact(a.result));
  const a=arms[0].result.rootActionLedger??[];
  const b=arms[1].result.rootActionLedger??[];
  let prefix=0;
  while(prefix<a.length&&prefix<b.length&&
    JSON.stringify(a[prefix])===JSON.stringify(b[prefix]))prefix++;
  const packet={
    schema:'agent50-source-first-stranded-marnie-paired-original-store-v1',
    registration:'results/aichi-2026/registrations/agent50-rank11-post-rope-stranded-marnie-20261021.md',
    sourceRank:11,sourceSeed:482443328,candidateSeat:1,sourceSeat:0,
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    actorRescueSeatOnly:0,onlyIntendedDifference:'source-owned stranded Marnie root enabled',
    expectedOriginalSourceDeal:SOURCE_DEAL,
    sameSourceDeal:control.sourceDealFingerprint!==null&&
      control.sourceDealFingerprint===treatment.sourceDealFingerprint,
    identicalNativeAcceptedPrefixCount:prefix,
    firstDifference:{
      control:a[prefix]??null,treatment:b[prefix]??null
    },
    control,treatment,
    attemptedArms:2,competitiveQualifiedGames:0,winRateCertified:false,
    caveat:'One retrospectively selected development source-first physical deal with weak two-player policy; no paper clock or competitive qualification'
  };
  return packet;
}
if(require.main===module){
  const report=run();
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  assert.equal(report.control.sourceDealFingerprint,SOURCE_DEAL,
    'Control did not reproduce original physical deal');
  assert.equal(report.control.rootActionLedgerSha256,CONTROL_LEDGER,
    'Control did not reproduce Agent42 original 175-root Store game');
  assert.equal(report.sameSourceDeal,true);
  assert.equal(report.treatment.actualStarterSeat,0);
  assert.equal(report.treatment.sourceSeat,0);
  assert.equal(report.treatment.candidateSeat,1);
  assert.ok(report.identicalNativeAcceptedPrefixCount>35);
  assert.equal(report.control.actualMarnieRoots.length,0);
  assert.ok(report.treatment.actualMarnieRoots.every(x=>x.turn>=7),
    'Treatment cannot play Marnie before the archived T6 Rope');
}
module.exports={run,compact,SOURCE_DEAL,CONTROL_LEDGER};
