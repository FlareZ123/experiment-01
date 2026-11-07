'use strict';

const assert=require('node:assert/strict');

const VERSION='agent24-postchoice-perfection-root-public-board-join-v1';

/**
 * Independently reconcile source-bound funded-Perfection observations with
 * already recorded, actual headless Store-root and pre-Pass board evidence.
 * This is a strict native-observation gate, never a legality/skill certificate.
 * @param {{rootActionLedger:object[],candidateRepliesAfterSourceAttacks:object[],
 *   fundedPerfectionObserver:object}} input Unmodified same-match receipts.
 * @returns {object} Unqualified provenance readout.
 */
function verifyFundedPerfectionRootProvenance(input){
  const roots=input?.rootActionLedger;
  const replies=input?.candidateRepliesAfterSourceAttacks;
  const observer=input?.fundedPerfectionObserver;
  assert.ok(Array.isArray(roots)&&Array.isArray(replies));
  assert.ok(observer&&Array.isArray(observer.records));
  const passRoots=roots.filter(root=>root.action==='PassTurnAction');
  assert.equal(observer.passRootCount,passRoots.length,
    'Observer must account for every actually dispatched Pass');
  assert.equal(observer.missingPreStateCount,0,
    'One or more Pass roots lacked a genuine pre-dispatch state');
  assert.equal(observer.sampler?.passRootsChecked,passRoots.length);
  assert.equal(observer.sampler?.recorded,observer.records.length);
  assert.equal(observer.sampler?.completeOpportunityCensus,false,
    'Bounded samples cannot certify an exhaustive owner legal-action census');
  const sampledOrdinals=observer.records.map(row=>row.actionOrdinal);
  assert.deepEqual(sampledOrdinals,
    observer.sampler.sampledActionOrdinals,
    'Observer sample ordinals must match the root sampler ledger');
  assert.equal(new Set(sampledOrdinals).size,sampledOrdinals.length,
    'Same physical Pass cannot count twice');
  for(let i=0;i<roots.length;i++)
    assert.equal(roots[i].actionOrdinal,i,'Original root ledger must be contiguous');
  const finalPassByOrdinal=new Map();
  for(const reply of replies){
    if(reply.sameEpochCandidateReplyVerified!==true)continue;
    const pass=reply.candidateReplyTurnFinalPass;
    if(!pass)continue;
    if(finalPassByOrdinal.has(pass.ordinal)){
      const prior=finalPassByOrdinal.get(pass.ordinal);
      assert.deepEqual(prior,pass,
        'Multiple source correlations disagree about the same Pass');
    }
    finalPassByOrdinal.set(pass.ordinal,pass);
  }
  const samples=observer.records.map(sample=>{
    assert.ok(Number.isSafeInteger(sample.actionOrdinal));
    const root=roots[sample.actionOrdinal];
    assert.ok(root&&root.action==='PassTurnAction',
      'Sampled action was not a real accepted Pass root');
    assert.equal(root.playerSlot,sample.seat);
    assert.equal(root.turnBefore,sample.turnBefore);
    assert.equal(sample.eligible,true);
    assert.equal(sample.reason,'funded-donor-present');
    assert.ok(sample.energyCards>0&&sample.donorCount>0);
    assert.equal(sample.optionPaperAffordabilityCertified,false);
    assert.equal(sample.ownerEligibilityFilterReadsOpponentHiddenZones,false);
    assert.equal(sample.detachedNativeProbeUsesFullStateClone,true);
    assert.equal(sample.hiddenInformationIndependenceCertified,false);
    assert.equal(sample.livePolicyChangedByObserver,false);
    const pass=finalPassByOrdinal.get(sample.actionOrdinal);
    assert.ok(pass&&Array.isArray(pass.publicBoardBeforePass),
      'No independent same-epoch pre-Pass public board for sampled root');
    assert.equal(pass.ordinal,sample.actionOrdinal);
    assert.equal(pass.turn,sample.turnBefore);
    const own=pass.publicBoardBeforePass[sample.seat];
    assert.ok(own&&Array.isArray(own.bench));
    assert.equal(own.active?.name,'Mewtwo & Mew-GX');
    assert.ok(Array.isArray(own.active.energyCards));
    assert.equal(own.active.energyCards.length,sample.energyCards,
      'Sampled funded prestate disagrees with independently captured public pre-Pass Energy');
    const source=sample.detachedMenu?.sourceEligibility;
    assert.ok(source&&Array.isArray(source.bench)&&Array.isArray(source.discard),
      'Detached copy-source provenance is absent');
    assert.equal(source.sourcePokemonCount,sample.donorCount);
    const publicBenchPrintings=new Set(own.bench.map(p=>p.printing));
    for(const donor of source.bench){
      assert.ok(publicBenchPrintings.has(donor.printing),
        'Claimed GX/EX donor is missing from independent pre-Pass Bench');
    }
    return {
      ordinal:sample.actionOrdinal,turn:sample.turnBefore,seat:sample.seat,
      energyCards:sample.energyCards,publicBenchDonorsCorroborated:source.bench.length,
      ownerDiscardDonorsNotIndependentlyJoined:source.discard.length,
      copyMenuNames:sample.detachedMenu.validAttackNames??[],
      copiedAttackPaperCostCertified:false,
      actorHiddenInformationIndependenceCertified:false,
      selectedAction:'PassTurnAction'
    };
  });
  return {
    version:VERSION,verifiedActualPassRoots:passRoots.length,
    verifiedFundedPerfectionSamples:samples.length,
    sampleBudgetCensored:observer.sampler.budgetCensored??0,
    paperQualifiedGames:0,competitiveWinRate:null,
    caveat:'All samples are retrospective native afterchoice observations. Exact owner-discard identity, dynamic printed costs, true hidden-info invariance, alternative attack settlement and independent paper review remain unverified.',
    samples
  };
}

module.exports={VERSION,verifyFundedPerfectionRootProvenance};
