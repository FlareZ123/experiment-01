'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');

const VERSION='agent13-rank5-quickball-raw-twelvearm-custody-audit-v1';
const BASE='vip_only_control';
const FULL='vip_plus_quickball_full_owner_prompt';

/**
 * Selected public native root ledger projection. Using event ordinal rather
 * than array position ensures a missing, duplicated or reordered event cannot
 * silently match. Original raw rows remain untouched.
 * @param {object} event
 * @returns {Array<string|number|null>}
 */
function publicRootSignature(event){
  return [event.actionOrdinal,event.turnBefore,event.playerSlot,
    event.action,event.card??null,event.attack??null,
    event.pendingPrompt??null];
}

/** @param {object[]} a @param {object[]} b */
function firstPublicDivergence(a,b){
  assert.ok(Array.isArray(a)&&Array.isArray(b));
  let n=0;
  while(n<Math.min(a.length,b.length)&&
    JSON.stringify(publicRootSignature(a[n]))===
      JSON.stringify(publicRootSignature(b[n])))n++;
  return {
    matchedLeadingEvents:n,
    control:n<a.length?publicRootSignature(a[n]):null,
    treatment:n<b.length?publicRootSignature(b[n]):null,
    sameFullPublicRootLedger:n===a.length&&n===b.length
  };
}

/**
 * Read-only audit of a retained original native 12-arm archive, by trial ID.
 * No retrospective inference of full paper legality or competitive wins.
 *
 * @param {object} data Parsed original experiment JSON.
 * @returns {object} Compact owner-public root and paid-discard custody audit.
 */
function auditTwelveArmArchive(data){
  assert.equal(data.schema,'agent13-rank5-vip-quickball-native-twelvearm-v1');
  assert.equal(data.attempts,12);
  assert.equal(data.registeredSourcePhysicalDeals,4);
  const mode=new Map(data.modes.map(m=>[m.id,m]));
  assert.equal(mode.size,3);
  const control=mode.get(BASE)?.native?.rows;
  const treated=mode.get(FULL)?.native?.rows;
  assert.equal(control?.length,4);
  assert.equal(treated?.length,4);
  const comparisons=[];
  for(let i=0;i<4;i++){
    const a=control[i],b=treated[i];
    assert.equal(a.trial.id,b.trial.id);
    assert.equal(a.sourceSeat,b.sourceSeat);
    const sourcePair=a.sourceDealFingerprint===b.sourceDealFingerprint;
    const physicalPair=a.fullPhysicalDealFingerprint===
      b.fullPhysicalDealFingerprint;
    assert.ok(sourcePair&&physicalPair,
      'A true same-physical-deal A/B pair is required');
    const first=firstPublicDivergence(a.rootActionLedger,b.rootActionLedger);
    const source=b.sourceSeat;
    const paid=b.nativeQuickBallOwnerTransactions?.rows??[];
    const qb=paid.filter(x=>x.seat===source).map(x=>({
      rootOrdinal:x.rootOrdinal,globalTurn:x.globalTurn,
      paidPrinting:x.paymentSelection,
      beforeCopies:x.paymentCopiesBefore,
      afterCopies:x.paymentCopiesAfter,
      searchedPrintings:x.searchedPrintings,
      nativeAccepted:x.nativePaymentChoiceAccepted,
      publicDiscardPostconditionVerified:
        x.publicDiscardPostconditionVerified
    }));
    const ownDce=raw=>raw.rootActionLedger.filter(x=>
      x.playerSlot===source&&
      x.action==='PlayCardAction'&&
      x.card==='Double Colorless Energy')
      .map(x=>({ordinal:x.actionOrdinal,turn:x.turnBefore}));
    const sourceAttackCount=raw=>raw.rootActionLedger.filter(x=>
      x.playerSlot===source&&x.action==='AttackAction').length;
    // Positive public board receipt plus owner-held resources only.
    // This is an *opportunity witness*, never a claim that a move is legal
    // or that all its omitted status and competing effects are satisfied.
    const confirmedDceBench=(b.actorOnlyDecisionCoverage
      ?.detailedComponentAudits?.root?.nativeRootAcceptances??[])
      .filter(x=>x.seat===source&&x.accepted===true&&
        x.kind==='attach-special-energy'&&
        x.intent?.printing==='Double Colorless Energy SUM'&&
        x.intent?.slot==='bench'&&Number.isInteger(x.intent?.index));
    const heldPasses=b.sourceOwnerPostPassMobility?.observations??[];
    const ownerVisibleLateGuzmaAttackCandidates=heldPasses.flatMap(pass=>{
      if(!pass?.mobilityHeld||pass.mobilityHeld.Guzma<1||
        pass.activeEnergyCards?.length!==0||
        !Array.isArray(pass.benchNames))return [];
      return confirmedDceBench.filter(x=>x.globalTurn===pass.globalTurn&&
        pass.benchNames[x.intent.index]==='Mew VMAX')
        .map(x=>({
          sourceSeat:source,turn:pass.globalTurn,ownerPassOrdinal:pass.ordinal,
          activeName:pass.activeName,activeEnergyCount:0,
          activeToolCount:pass.activeToolCards?.length??null,
          heldGuzma:pass.mobilityHeld.Guzma,
          heldFloatStone:pass.mobilityHeld['Float Stone']??0,
          candidateMewBenchIndex:x.intent.index,
          candidateMewBenchName:pass.benchNames[x.intent.index],
          ownerBenchCount:pass.benchNames.length,
          opponentBenchCount:x.before?.benchCounts?.[1-source]??null,
          sourceDceBenchNativeAccepted:true,
          attackOrSupporterPlayabilityProven:false
        }));
    });
    comparisons.push({
      trialId:a.trial.id,sourceSeat:source,
      sameOriginalSourcePhysicalDeal:sourcePair,
      sameBothPlayersPhysicalDeal:physicalPair,
      firstDifferentPublicRootEvent:first,
      sourceDceAttachmentsControl:ownDce(a),
      sourceDceAttachmentsTreatment:ownDce(b),
      sourceQuickBallNativePaymentEvents:qb,
      ownerVisibleLateGuzmaAttackCandidates,
      sourceAttackRootsControl:sourceAttackCount(a),
      sourceAttackRootsTreatment:sourceAttackCount(b),
      controlNativeEndReason:a.endReason,
      treatmentNativeEndReason:b.endReason,
      controlNativeActionCount:a.actionCount,
      treatmentNativeActionCount:b.actionCount,
      nativeCompetitiveQualification:false
    });
  }
  return {
    version:VERSION,archiveSchema:data.schema,
    originalPrinted60Sha256:data.sourceOriginalPrinted60Sha256,
    nativeVendorRevision:data.vendorRevision,
    registeredTrials:comparisons.length,
    matchedFullPhysicalDeals:comparisons.filter(x=>
      x.sameBothPlayersPhysicalDeal).length,
    comparisons,qualifiedCompetitiveGames:0
  };
}

/**
 * CLI for a previously downloaded verified original JSON, a caller-supplied
 * local path; no internet or native Twinleaf dependencies.
 */
function main(file){
  assert.equal(typeof file,'string');
  const bytes=fs.readFileSync(file);
  const sha256=crypto.createHash('sha256').update(bytes).digest('hex');
  const report=auditTwelveArmArchive(JSON.parse(bytes.toString('utf8')));
  return {...report,archivedJsonSha256:sha256};
}

if(require.main===module){
  const file=process.argv[2];
  if(!file)throw new Error('Provide local original archive JSON path');
  process.stdout.write(JSON.stringify(main(file),null,2)+'\n');
}

module.exports={
  VERSION,publicRootSignature,firstPublicDivergence,
  auditTwelveArmArchive,main
};
