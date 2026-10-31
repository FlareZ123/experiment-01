'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {rootProjection,digest}=
  require('./agent18-aichi-k0-root-uniqueness.cjs');

/**
 * Measure first-root observation diversity by actual source/reference role,
 * preserving failed scheduled native arms and physically repeated openings.
 * No structural proposal is dispatched by this independent analysis.
 * @param {object} campaign Frozen native original-29 cross-seat output JSON.
 * @returns {object} Failure-inclusive native observer/proposal summary.
 */
function summarize(campaign){
  assert.equal(campaign.preregisteredArms,58);
  assert.equal(campaign.preregisteredFirstOwnerRoots,116);
  assert.equal(campaign.arms.length,58);
  const keys=new Set(campaign.arms.map(a=>`${a.rank}:${a.orientation}`));
  assert.equal(keys.size,58);
  const groups=new Map(),roles={};
  const nativeToolWitnesses=[],sourceByRank={};
  let observed=0,k0Matched=0,nativeAccepted=0,toolEncodingVerified=0;
  for(const arm of campaign.arms){
    if(arm.status==='blocked')continue;
    assert.equal(arm.ownerRoots?.length,2);
    for(const root of arm.ownerRoots){
      observed++;
      if(root.sameRootK0Invariant===true&&
        root.physicalObjectsRestored===true)k0Matched++;
      if(root.nativeStoreFirstActionDispatched===true&&
        root.nativeStoreFirstActionAccepted===true)nativeAccepted++;
      if(root.nativeStoreToolActionEncodingEquivalent===true)
        toolEncodingVerified++;
      const role=root.role;
      assert.ok(['rank1-mirror','rank1-reference','original-source'].includes(role));
      const bucket=roles[role]??{
        roots:0,independentOfferRoots:0,independentOffers:0,
        toolOfferRoots:0,toolOffers:0,basicEnergyOffers:0,
        distinctRecordedOwnerLocalRootProjections:0,
        distinctRecordedOwnerPlusOpponentActiveProjections:0,
        uniquePrintingAndTargetOffers:0
      };
      bucket.roots++;
      const key=rootProjection(root,false),pub=rootProjection(root,true);
      if(!groups.has(role))groups.set(role,{local:new Map(),public:new Map(),
        offers:new Map()});
      const g=groups.get(role);
      if(!g.local.has(key))g.local.set(key,[]);
      g.local.get(key).push({rank:arm.rank,orientation:arm.orientation,
        seat:root.physicalSeat});
      if(!g.public.has(pub))g.public.set(pub,[]);
      g.public.get(pub).push({rank:arm.rank,orientation:arm.orientation,
        seat:root.physicalSeat});
      const offers=root.sameRootReceipt?.offers?.filter(offer=>
        offer.source!=='first-return'&&
        offer.source!=='terminal-hold')??[];
      assert.equal(offers.length,root.sameRootReceipt.supportedAlternativeCount);
      if(offers.length)bucket.independentOfferRoots++;
      bucket.independentOffers+=offers.length;
      const tools=offers.filter(o=>o.source==='owner-tool');
      bucket.toolOfferRoots+=Number(tools.length>0);
      bucket.toolOffers+=tools.length;
      bucket.basicEnergyOffers+=offers.filter(o=>
        o.kind==='attach-basic-energy').length;
      for(const offer of offers){
        const digestKey=digest([offer.source,offer.kind,offer.printing,
          offer.attackName,offer.slot,offer.index,
          offer.proposedDiscardPrinting,offer.proposedDiscardIndex]);
        if(!g.offers.has(digestKey))g.offers.set(digestKey,{
          source:offer.source,kind:offer.kind,
          printing:offer.printing,slot:offer.slot,index:offer.index,
          occurrences:0});
        g.offers.get(digestKey).occurrences++;
      }
      if(root.nativeStoreFirstActionAttachedToolTarget){
        nativeToolWitnesses.push({
          rank:arm.rank,orientation:arm.orientation,role,
          physicalSeat:root.physicalSeat,
          proposedHandPrinting:root.nativeBotProposedHandPrinting,
          attachedTarget:root.nativeStoreFirstActionAttachedToolTarget,
          typedEncodingEquivalent:root.nativeStoreToolActionEncodingEquivalent
        });
      }
      if(role==='original-source'){
        if(!sourceByRank[arm.rank])sourceByRank[arm.rank]={
          ranks:arm.rank,orientations:0,toolOfferRoots:0,toolOffers:0};
        const rank=sourceByRank[arm.rank];rank.orientations++;
        rank.toolOfferRoots+=Number(tools.length>0);
        rank.toolOffers+=tools.length;
      }
      roles[role]=bucket;
    }
  }
  const repeats={};
  for(const [role,g] of groups){
    const bucket=roles[role];
    bucket.distinctRecordedOwnerLocalRootProjections=g.local.size;
    bucket.distinctRecordedOwnerPlusOpponentActiveProjections=g.public.size;
    bucket.uniquePrintingAndTargetOffers=g.offers.size;
    repeats[role]=[...g.local.entries()]
      .map(([sha256,roots])=>({sha256,roots}))
      .sort((a,b)=>b.roots.length-a.roots.length)
      .filter(entry=>entry.roots.length>=2);
  }
  return {
    schema:'agent18-crossseat-original29-K0-root-diversity-summary-v1',
    campaign:campaign.campaign,
    engineRevision:campaign.engineRevision,
    plannedNativeGames:58,plannedFirstOwnerRoots:116,
    completedNativeGames:campaign.passedArms,
    blockedArms:campaign.blockedArms,
    observedFirstOwnerRoots:observed,
    firstRootsWithK0InvariantAndPhysicalRestore:k0Matched,
    firstRootsWithOriginalNativeStoreAcceptance:nativeAccepted,
    firstRootsWithNativeToolActionEncodingEquivalence:toolEncodingVerified,
    bySemanticRole:roles,
    repeatedRecordedOwnerLocalProjections:repeats,
    sourceRankToolCoverage:Object.values(sourceByRank)
      .sort((a,b)=>a.ranks-b.ranks),
    nativeToolFirstActionWitnesses:nativeToolWitnesses,
    competitiveQualifiedGames:0,
    caveat:'Genuine original-source first owner native roots only. Projection equality is narrower than full actor state. All independently proposed Tools remain unplayed and their native availability unverified.'
  };
}
if(require.main===module){
  assert.equal(process.argv.length,3,'Provide original native cross-seat result JSON');
  const raw=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  process.stdout.write(JSON.stringify(summarize(raw),null,2)+'\n');
}
module.exports={summarize};
