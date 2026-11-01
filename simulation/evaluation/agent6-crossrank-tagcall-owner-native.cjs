'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {withGoFirstChoice}=require('../twinleaf/agent6-go-first-choice.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withOwnerTagCallHala}=
  require('../twinleaf/agent6-owner-tagcall-hala-native.cjs');

const VERSION='agent6-crossrank-firstturn-tagcall-owner-20-deal-native-v1';
const ROOT=path.resolve(__dirname,'../..');
const REG=path.join(ROOT,
  'results/aichi-2026/registrations/agent6-crossrank-tagcall-owner-native-20261101.json');

/**
 * Precommitted genuine Store source-first actor-root and K1 owner search.
 * All registered seeds and both policy arms retained. This is bounded
 * development coverage, not source-bot strength, independent game trials
 * suitable for a competitive success estimate, or an optimized deck.
 * @returns {object}
 */
function run(){
  const reg=JSON.parse(fs.readFileSync(REG,'utf8'));
  assert.equal(reg.schema,
    'agent6-crossrank-tagcall-owner-native-prospective-20261101-v1');
  assert.deepEqual(reg.sourceRanks,[2,6,15,24,29]);
  assert.equal(reg.sourceFirst,true);
  assert.equal(reg.physicalPairs,20);
  assert.equal(reg.nativeArms,40);
  assert.equal(reg.maxActionsPerArm,120);
  const sourceManifest=JSON.parse(fs.readFileSync(
    path.join(ROOT,'results/aichi-2026/full-decklists.json'),'utf8'));
  assert.equal(sourceManifest.decks.length,29);
  const champion=sourceManifest.decks.find(x=>x.rank===1);
  assert.ok(champion);
  const plan=planAichi({label:'champion-reference',
    cards:champion.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true});
  const rows=[];
  for(const {rank,sourceSeat,seeds} of reg.seedsByRankAndSeat){
    assert.ok(reg.sourceRanks.includes(rank));
    assert.ok(sourceSeat===0||sourceSeat===1);
    assert.equal(seeds.length,2);
    const source=plan.opponents.find(x=>x.rank===rank);
    assert.equal(source?.status,'ready','Native source rank unavailable '+rank);
    for(const seed of seeds){
      const deckA=sourceSeat===0?source.cards:plan.candidate.cards;
      const deckB=sourceSeat===1?source.cards:plan.candidate.cards;
      const request={deckA,deckB,seed,maxActions:reg.maxActionsPerArm,
        strictPromptValidation:true,
        captureDecisionTrace:true,
        capturePublicAttackTransitions:true,
        captureInitialSourceDealFingerprintSeat:sourceSeat,
        captureStartingBoard:true
      };
      const preferences=sourceSeat===0?[true,false]:[false,true];
      const arms=[];
      for(const ownerTagStage of [false,true]){
        try{
          const outer=withGoFirstChoice(preferences,()=>
            withCanonicalActorOnlyPolicy(()=>
              ownerTagStage?
                withOwnerTagCallHala([deckA,deckB],
                  ()=>runMatch(request)):
                {result:runMatch(request),audit:null}));
          const nested=outer.result.result;
          const game=nested.result;
          assert.equal(game.firstTurnSlot,sourceSeat);
          assert.equal(game.verifiedByDrawLog,true);
          assert.equal(outer.audit.choices.length,1);
          const first=(game.decisionTrace??[]).find(x=>
            x.playerSlot===sourceSeat&&x.turnBefore===1&&
            x.action!=='ResolvePromptAction'&&
            x.decisionHandBefore?.perspectiveSeat===sourceSeat);
          const sourceRoots=(game.rootActionLedger??[]).filter(x=>
            x.playerSlot===sourceSeat&&x.turnBefore===1);
          arms.push({ownerTagStage,status:'native-complete-or-capped',
            sourceSeat,rank,seed,
            firstSourceHandPrintings:
              first?.decisionHandBefore?.ownHandPrintings??null,
            firstSourceRootActions:sourceRoots.map(x=>({
              ordinal:x.actionOrdinal,action:x.action,
              card:x.card??null,pendingPrompt:x.pendingPrompt??null
            })),
            completeOriginalStoreRootLedger:game.rootActionLedger??[],
            nativeTagCallAudit:nested.audit,
            originalSourceDealDigest:game.initialSourceDealFingerprint?.
              digestSha256??null,
            gameFinished:game.finished??null,
            competitiveQualified:false});
        }catch(error){
          arms.push({ownerTagStage,status:'native-error',
            sourceSeat,rank,seed,
            error:String(error?.message??error).slice(0,900),
            nativeTagCallAudit:error?.ownerTagCallHalaNativeAudit??null,
            physicalFailureLedger:error?.nativePublicRootArchive??null,
            competitiveQualified:false});
        }
      }
      rows.push({rank,sourceSeat,seed,arms,
        originalPhysicalSourceDealMatched:arms.every(x=>
          x.status==='native-complete-or-capped')?
          arms[0].originalSourceDealDigest===
            arms[1].originalSourceDealDigest:null});
    }
  }
  assert.equal(rows.length,20);
  const all=rows.flatMap(x=>x.arms);
  assert.equal(all.length,40);
  const totals={attempts:all.length,
    nativeErrors:all.filter(x=>x.status==='native-error').length,
    matchedPhysicalSourcePairs:rows.filter(x=>
      x.originalPhysicalSourceDealMatched===true).length,
    sourceHeldTagWithNoHeldGH:rows.filter(x=>
      x.arms[1].nativeTagCallAudit?.ownerBySeat?.[
        x.sourceSeat]?.eligibleRoots>0).length,
    acceptedRoots:0,acceptedGHSearches:0,physicalGHHandGains:0,
    firstPositiveWitnessesBySourceRank:{},firstPositiveBySeat:{0:null,1:null},
    competitiveQualifiedGames:0
  };
  for(const row of rows){
    const count=row.arms[1].nativeTagCallAudit?.ownerBySeat?.[
      row.sourceSeat];
    if(!count)continue;
    totals.acceptedRoots+=count.acceptedRoots;
    totals.acceptedGHSearches+=count.acceptedGHDeckPrompts;
    totals.physicalGHHandGains+=count.physicalGHHandGained;
    const witness=row.arms[1].nativeTagCallAudit?.
      firstAcceptedNativePairBySeat?.[row.sourceSeat];
    if(witness){
      const provenance={rank:row.rank,seed:row.seed,
        sourceSeat:row.sourceSeat,...witness};
      if(!totals.firstPositiveWitnessesBySourceRank[row.rank])
        totals.firstPositiveWitnessesBySourceRank[row.rank]=provenance;
      if(!totals.firstPositiveBySeat[row.sourceSeat])
        totals.firstPositiveBySeat[row.sourceSeat]=provenance;
    }
  }
  return {version:VERSION,sourceRankList:reg.sourceRanks,
    registration:'results/aichi-2026/registrations/agent6-crossrank-tagcall-owner-native-20261101.json',
    sourceFirst:true,pinnedOriginalStore:true,
    sourceReferenceAllOriginalSixties:true,
    originalChampionReference60:true,
    prospectiveSeedsButDevelopmentPolicy:true,
    noWinRateOrPolicyOptimalityInference:true,
    totals,rows};
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,run};
