'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {runMirroredIssue25V6}=
  require('./agent1-issue25-mirrored-r6-r11-v6.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {runIssue25PrizeCustodyV14}=
  require('./agent20-issue25-prize-custody-v14.cjs');

const VERSION='agent20-issue25-v16-symmetric-conservative-shuffle-development';
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const idOf=row=>row?.trial?.id??row?.id??null;

/**
 * Paired actual native Store records; preserve every source/contender
 * opening and record the first differing Store root. A first difference is
 * attributable to Supporter opt-in ONLY if the actual selected action is a
 * Supporter and the pre-difference physical action prefixes match.
 * @param {object} control
 * @param {object} treatment
 * @param {Array<object>} original
 * @param {Array<object>} enabled
 * @returns {object}
 */
function compareConservativeSourceSupporters(control,treatment,original,enabled){
  assert.equal(control?.schema,
    'agent20-issue25-v14-verified-native-owner-prize-zone-counts');
  assert.equal(treatment?.schema,control.schema);
  assert.equal(original?.length,8);
  assert.equal(enabled?.length,8);
  const byId=rows=>new Map(rows.map(row=>[idOf(row),row]));
  const before=byId(original),after=byId(enabled);
  assert.equal(before.size,8);
  assert.equal(after.size,8);
  const rows=control.allEightAttemptDispositions.map(b=>{
    const t=treatment.allEightAttemptDispositions.find(x=>x.id===b.id);
    const a=before.get(b.id),c=after.get(b.id);
    assert.ok(t&&a&&c);
    const left=a.rootActionLedger??[],right=c.rootActionLedger??[];
    const first=Array.from({length:Math.min(left.length,right.length)},
      (_,index)=>index).find(i=>sha(left[i])!==sha(right[i]))??null;
    const source=b.originalSourceSeat??b.nativeAbortProvenance?.sourceSeat??null;
    assert.ok(source===0||source===1);
    const originalSourceActions=left.filter(x=>x.playerSlot===source);
    const treatedSourceActions=right.filter(x=>x.playerSlot===source);
    const sourcePlayCard=roots=>roots.filter(x=>
      x.action==='PlayCardAction').map(x=>({
        root:x.actionOrdinal,turn:x.turnBefore,
        card:x.card??null
      }));
    return {
      id:b.id,originalSourceSeat:source,
      physicalSourceDealEqual:
        b.sourceDealFingerprint===t.sourceDealFingerprint,
      completePhysicalDealEqual:
        b.fullPhysicalDealFingerprint===t.fullPhysicalDealFingerprint,
      originalSourceInitialDealMatchesV6:
        b.sourceDealFingerprint===control.allEightAttemptDispositions
          .find(x=>x.id===b.id).sourceDealFingerprint,
      beforeActualRootCount:left.length,
      afterActualRootCount:right.length,
      beforeStatus:b.status,afterStatus:t.status,
      sameWholeNativeLedger:sha(left)===sha(right),
      initialCommonRootCount:first??Math.min(left.length,right.length),
      firstDivergentRootOrdinal:first,
      firstBaselineNativeRoot:first===null?null:left[first],
      firstTreatmentNativeRoot:first===null?null:right[first],
      firstDivergenceActedByOriginalSource:first===null?null:
        right[first]?.playerSlot===source,
      originalSourcePlayCards:sourcePlayCard(originalSourceActions),
      treatedSourcePlayCards:sourcePlayCard(treatedSourceActions),
      originalSourceAcceptedPasses:originalSourceActions.filter(x=>
        x.action==='PassTurnAction').length,
      treatedSourceAcceptedPasses:treatedSourceActions.filter(x=>
        x.action==='PassTurnAction').length,
      paperPlayableSupporterCertified:false
    };
  });
  return {
    schema:VERSION,rows,
    sourceAndCompletePhysicalDealsMatched:rows.every(x=>
      x.physicalSourceDealEqual&&x.completePhysicalDealEqual),
    changedNativeRootsInRows:rows.filter(x=>!x.sameWholeNativeLedger).length,
    firstChangedRootOriginalSourceCount:rows.filter(x=>
      x.firstDivergenceActedByOriginalSource===true).length,
    sourcePlayerNewPlayCardsObserved:rows.filter(x=>
      x.treatedSourcePlayCards.length>x.originalSourcePlayCards.length).length,
    firstRootDirectPrintedSupporterProofRequiresCardType:true,
    originalEightRootLimit:48,
    qualifiedGames:0
  };
}

/**
 * Genuine same 8 registered original source sixties, fixed eight physical
 * deals and both-seat strategy. The sole experimental root option is the
 * pre-existing actor-only bilateralConservativeShuffleRoot flag. Other
 * Prize, promotion and public-zone custody layers stay unchanged.
 */
function runConservativeSourceSupporterV16(){
  let rawA=null,rawB=null;
  const baseline=runIssue25PrizeCustodyV14({runner:()=>{
    const x=runMirroredIssue25V6();
    rawA=x.rawDevelopment.rows;return x;
  }});
  const treated=runIssue25PrizeCustodyV14({runner:()=>{
    const x=runMirroredIssue25V6({runner:opts=>
      runDevelopment({...opts,bilateralConservativeShuffleRoot:true})});
    rawB=x.rawDevelopment.rows;return x;
  }});
  return {
    ...compareConservativeSourceSupporters(baseline,treated,rawA,rawB),
    originalFrozenV6Run:41894027367,
    originalOwnerPrizeAndPromotionV14Run:41932203013,
    nativeOriginalTwinleafGitPin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    exactBothSeatPolicyOption:'bilateralConservativeShuffleRoot',
    originalNativeSourceIndependentPolicyPreserved:true,
    sourceOwnerPrizeAndBenchPromotionPreserved:true,
    candidateSelectionNeutralToOriginalRank:true,
    paperLegalAndGameCompletionUnproven:true,
    qualifiedGames:0
  };
}

module.exports={VERSION,compareConservativeSourceSupporters,runConservativeSourceSupporterV16};
