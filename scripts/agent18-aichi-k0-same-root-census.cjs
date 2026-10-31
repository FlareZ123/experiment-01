'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');

/** @param {Record<string,number>} tally @param {string} key */
function count(tally,key){tally[key]=(tally[key]??0)+1;}

/**
 * Compare existing native 29-list first-root receipts without consulting card
 * identities in a physically hidden zone or introducing a new game runner.
 * No proposal here has been natively played by this observer.
 * @param {object[]} surveys Existing preregistered six- and 23-rank survey JSON.
 * @returns {object} Failure-inclusive first-root proposal denominator.
 */
function summarize(surveys){
  assert.equal(surveys.length,2);
  const rows=surveys.flatMap(s=>s.rows??[]).sort((a,b)=>a.rank-b.rank);
  assert.equal(rows.length,29,'All 29 original sources are the denominator');
  assert.equal(new Set(rows.map(r=>r.rank)).size,29,'No duplicated rank');
  const summary={
    schema:'agent18-source-K0-same-root-29-census-v1',
    registrations:surveys.map(s=>s.registration),
    enginePins:[...new Set(surveys.map(s=>s.pinnedEngine))],
    collectorVersions:[...new Set(surveys.map(s=>s.sourceRootSameRootCollectorVersion))],
    attemptedRanks:rows.map(r=>r.rank),
    blockedRanks:[],
    attemptedOwnerRoots:58,
    observedOwnerRoots:0,
    K0PrivacyMatchedRoots:0,
    nativeSourceActionsAccepted:0,
    nativeStoreActionsRejected:0,
    independentOfferRoots:0,
    supportedIndependentOffers:0,
    selectorErrorRoots:0,
    selectorErrorCount:0,
    noIndependentOfferRoots:0,
    baselineKinds:{},independentOfferKinds:{},independentOfferSources:{},
    nativeBotActionClasses:{},
    bySeat:{0:{roots:0,independentOfferRoots:0},
      1:{roots:0,independentOfferRoots:0}},
    passWithIndependentOffer:[],
    sourceFirstToolAndIndependentOffers:[],
    selectorErrorDetails:[],
    competitiveQualifiedGames:0,
    nativeOfferPlayabilityQualified:false
  };
  for(const row of rows){
    if(row.status==='blocked'){
      summary.blockedRanks.push({rank:row.rank,error:row.error});
      continue;
    }
    assert.equal(row.status,'native-source-K0-both-owner-roots-passed');
    assert.equal(row.ownerRoots.length,2);
    for(const root of row.ownerRoots){
      const receipt=root.sameRootReceipt;
      assert.equal(receipt?.mode,'all-proposers-observe');
      assert.equal(receipt?.changed,false);
      assert.equal(root.sameRootAllProposersK0Invariant,true);
      assert.equal(root.nativeStoreFirstActionDispatched,true);
      summary.observedOwnerRoots++;
      summary.K0PrivacyMatchedRoots++;
      summary.bySeat[root.physicalSeat].roots++;
      if(root.nativeStoreFirstActionAccepted)
        summary.nativeSourceActionsAccepted++;
      else summary.nativeStoreActionsRejected++;
      count(summary.baselineKinds,receipt.baselineKind);
      count(summary.nativeBotActionClasses,
        root.nativeBotProposedActionClass??'null');
      const independent=receipt.offers.filter(o=>
        o.source!=='first-return'&&o.source!=='terminal-hold');
      assert.equal(independent.length,receipt.supportedAlternativeCount);
      if(independent.length){
        summary.independentOfferRoots++;
        summary.bySeat[root.physicalSeat].independentOfferRoots++;
      }else summary.noIndependentOfferRoots++;
      summary.supportedIndependentOffers+=independent.length;
      for(const offer of independent){
        count(summary.independentOfferKinds,offer.kind);
        count(summary.independentOfferSources,offer.source);
      }
      if(receipt.selectorErrors.length){
        summary.selectorErrorRoots++;
        summary.selectorErrorCount+=receipt.selectorErrors.length;
        summary.selectorErrorDetails.push({
          rank:row.rank,seat:root.physicalSeat,
          globalTurn:root.globalTurn,errors:receipt.selectorErrors
        });
      }
      const witness={rank:row.rank,seat:root.physicalSeat,
        globalTurn:root.globalTurn,
        firstReturnKind:receipt.baselineKind,
        nativeBotClass:root.nativeBotProposedActionClass,
        nativeBotHandPrinting:root.nativeBotProposedHandPrinting,
        independentOffers:independent.map(o=>({
          source:o.source,kind:o.kind,printing:o.printing,
          attackName:o.attackName,slot:o.slot,index:o.index,
          proposedDiscardPrinting:o.proposedDiscardPrinting,
          score:o.score,reason:o.reason
        }))};
      if(receipt.baselineKind==='pass'&&independent.length)
        summary.passWithIndependentOffer.push(witness);
      if(root.nativeStoreFirstActionAttachedToolTarget&&independent.length)
        summary.sourceFirstToolAndIndependentOffers.push(witness);
    }
  }
  return summary;
}
if(require.main===module){
  assert.equal(process.argv.length,4,
    'Provide preregistered six-rank and remaining-23 result JSON paths');
  const surveyFiles=process.argv.slice(2).map(p=>
    JSON.parse(fs.readFileSync(p,'utf8')));
  process.stdout.write(JSON.stringify(summarize(surveyFiles),null,2)+'\n');
}
module.exports={summarize};
