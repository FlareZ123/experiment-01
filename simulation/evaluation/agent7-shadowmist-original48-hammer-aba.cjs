'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {runStewardSelectedIssue25V4}=
  require('./agent36-issue25-steward-selected-v4.cjs');

const VERSION='agent7-shadowmist-rank6-original48-hammer-afterpass-aba-v1';
const ENV_NAME='AGENT29_HAMMER_AFTER_PASS_DEV';
const TARGET='6:100:A:champion-reference';
const sha256=value=>createHash('sha256').update(
  JSON.stringify(value)).digest('hex');

/**
 * Execute frozen registered eight arms twice; only the original generic
 * both-seat after-Pass Hammer option is toggled, with no rank/seed changes.
 * This is a retrospective same-deal A/B policy diagnostic, not a paper
 * win-rate experiment.
 * @param {(state:'control'|'treatment')=>object} [runner]
 * @returns {object}
 */
function runOriginalShadowMistHammerAB(runner=()=>runStewardSelectedIssue25V4()){
  assert.equal(typeof runner,'function');
  const had=Object.prototype.hasOwnProperty.call(process.env,ENV_NAME);
  const previous=process.env[ENV_NAME];
  let control,treatment;
  try{
    process.env[ENV_NAME]='false';
    control=runner('control');
    process.env[ENV_NAME]='true';
    treatment=runner('treatment');
  }finally{
    if(had)process.env[ENV_NAME]=previous;
    else delete process.env[ENV_NAME];
  }
  const a=control?.rawDevelopment?.rows;
  const b=treatment?.rawDevelopment?.rows;
  assert.ok(Array.isArray(a)&&Array.isArray(b));
  assert.equal(a.length,8);
  assert.equal(b.length,8);
  const left=new Map(a.map(row=>[row.trial.id,row]));
  assert.equal(left.size,8);
  const join=b.map(current=>{
    const earlier=left.get(current.trial.id);
    assert.ok(earlier,'Treatment must preserve registered trial IDs');
    assert.equal(earlier.sourceDealFingerprint,
      current.sourceDealFingerprint,
      'The entire original source physical deal must be preserved');
    assert.equal(earlier.fullPhysicalDealFingerprint,
      current.fullPhysicalDealFingerprint,
      'Both physical initial sixties/deals must match');
    assert.equal(earlier.actualStarterSeat,current.actualStarterSeat);
    const roots=r=>r.rootActionLedger??
      r.nativeAbortEvidence?.rootActionLedger??[];
    const before=roots(earlier),after=roots(current);
    let prefix=0;
    while(prefix<Math.min(before.length,after.length)){
      const first=before[prefix],second=after[prefix];
      const fields=['playerSlot','turnBefore','action','card','attack',
        'pendingPrompt'];
      if(fields.some(key=>(first[key]??null)!==(second[key]??null)))
        break;
      prefix++;
    }
    const sourceSeat=current.sourceSeat??
      current.nativeAbortProvenance?.sourceSeat??
      current.nativeAbortEvidence?.sourceDealFingerprint?.seat??null;
    const compact=root=>({
      ordinal:root.actionOrdinal,turn:root.turnBefore,
      seat:root.playerSlot,action:root.action,
      card:root.card??null,attack:root.attack??null,
      prompt:root.pendingPrompt??null
    });
    const afterFirstChangedRoot=after.slice(prefix,prefix+16)
      .map(compact);
    const firstCandidateActionAfterChange=after.slice(prefix+1)
      .find(root=>root.playerSlot===1-sourceSeat &&
        root.action!=='ResolvePromptAction')??null;
    const firstSourceActionAfterChange=after.slice(prefix+1)
      .find(root=>root.playerSlot===sourceSeat &&
        root.action!=='ResolvePromptAction')??null;
    const acceptedSourceHammerPlayRoots=after.filter(root=>
      root.playerSlot===sourceSeat&&root.action==='PlayCardAction' &&
      root.card==='Crushing Hammer').map(compact);
    const firstDivergence=prefix<Math.max(before.length,after.length)?{
      ordinal:prefix,
      control:before[prefix]?{
        turn:before[prefix].turnBefore,
        seat:before[prefix].playerSlot,
        action:before[prefix].action,
        card:before[prefix].card??null,
        attack:before[prefix].attack??null}:null,
      treatment:after[prefix]?{
        turn:after[prefix].turnBefore,
        seat:after[prefix].playerSlot,
        action:after[prefix].action,
        card:after[prefix].card??null,
        attack:after[prefix].attack??null}:null
    }:null;
    const ownerCoverage=
      current.actorOnlyDecisionCoverage?.detailedComponentAudits??{};
    const plumeria=ownerCoverage.ownerPlumeriaAfterPass??null;
    const hammer=ownerCoverage.ownerHammerAfterPass??null;
    const physicalPlumeriaAudit=plumeria?{
      acceptedPlayRoots:plumeria.acceptedPlumeria,
      nativeAcceptedMandatoryPrompts:plumeria.acceptedPrompts,
      sourceOwnerPaymentsPhysicallyAccepted:
        plumeria.physicallyAcceptedOwnerPayments?.length??null,
      ownerPaymentPrintingReceipts:
        process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV==='true'?
          (plumeria.physicallyAcceptedOwnerPayments??[]).map(receipt=>({
            seat:receipt.seat,turn:receipt.turn,
            payment:receipt.payment.map(card=>({
              handIndex:card.handIndex,printing:card.printing
            })),
            acceptedByOriginalStore:receipt.acceptedByOriginalStore
          })):undefined,
      settledOpponentEnergyDiscards:plumeria.settledEnergyDiscards,
      unresolvedPromptChains:plumeria.unresolvedChains,
      abandonedPromptChains:plumeria.abandonedChains,
      rejectedPlayRoots:plumeria.rejectedPlumeria,
      bySeat:plumeria.bySeat
    }:null;
    const physicalHammerAudit=hammer?{
      acceptedPlayRoots:hammer.acceptedHammerRoots,
      settledOpponentEnergyDiscards:hammer.acceptedEnergyDiscards,
      bySeat:hammer.bySeat
    }:null;
    return {
      id:current.trial.id,
      physicalPlumeriaAudit,physicalHammerAudit,
      originalSourceSeat:sourceSeat,
      acceptedSourceHammerPlayRoots,
      treatmentAcceptedRootsFromFirstChange:afterFirstChangedRoot,
      firstSourceNonpromptAfterChange:
        firstSourceActionAfterChange?compact(firstSourceActionAfterChange):null,
      firstCandidateNonpromptAfterChange:
        firstCandidateActionAfterChange?
          compact(firstCandidateActionAfterChange):null,
      sourceDealSha256:current.sourceDealFingerprint,
      fullInitialDealSha256:current.fullPhysicalDealFingerprint,
      starterSeat:current.actualStarterSeat,
      controlStatus:earlier.status??'returned-unqualified',
      treatmentStatus:current.status??'returned-unqualified',
      controlFinished:earlier.finished??false,
      treatmentFinished:current.finished??false,
      controlRootCount:before.length,treatmentRootCount:after.length,
      commonRootPrefixLength:prefix,firstDivergence,
      controlPublicRootDigestSha256:sha256(before),
      treatmentPublicRootDigestSha256:sha256(after)
    };
  });
  assert.equal(new Set(join.map(x=>x.id)).size,8);
  const target=join.find(row=>row.id===TARGET);
  assert.ok(target);
  return {
    version:VERSION,originalPolicy:'agent36-steward-selected-v4',
    treatmentPolicy:'agent29-both-seat-hammer-after-pass-v1',
    historicalRegisteredTrialCount:8,
    fixedNativeRootActionLimit:48,
    targetTrial:TARGET,target,
    paired:join,
    unchangedOriginalAndFullDeal:true,
    controlPolicyManifest:control.manifest.version,
    treatmentPolicyManifest:treatment.manifest.version,
    sourceIndependentCommonPolicy:
      control.manifest.actualCommonRunnerOptIn===true &&
      treatment.manifest.actualCommonRunnerOptIn===true,
    sourceWinOutcomeCertified:false,
    competitiveGamesQualified:0,paperWinRate:null,
    notes:'Same historic physical deals, two different non-blinded source/contender policies. Capped/errors retained; no prospective result.'
  };
}

module.exports={VERSION,ENV_NAME,TARGET,runOriginalShadowMistHammerAB};
