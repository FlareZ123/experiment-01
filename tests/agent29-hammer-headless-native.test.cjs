'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {runDevelopment}=
  require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');

/**
 * Same physical original-source seeds and fixed inventories, each arm run
 * twice with the new two-seat Hammer policy off and on. All four arms remain
 * historical source-first development fixtures; neither wins nor caps are
 * competitive evidence.
 */
test('retrospective original Store both-seat Hammer policy retains original deals and reports settled physical effects',()=>{
  const prior=process.env.AGENT29_HAMMER_AFTER_PASS_DEV;
  const run=flag=>{
    process.env.AGENT29_HAMMER_AFTER_PASS_DEV=flag?'true':'false';
    return runDevelopment({
      sourceFirstRetrospective:true,
      actorOnlyComposition:true,
      actorOnlySingleSearch:true,
      actorHandDiscard:true,
      actorChoosePokemon:true,
      mandatoryOptionFallback:true,
      paperSupporterQuota:true
    });
  };
  let baseline,treated;
  try{
    baseline=run(false);
    treated=run(true);
  }finally{
    if(prior===undefined)delete process.env.AGENT29_HAMMER_AFTER_PASS_DEV;
    else process.env.AGENT29_HAMMER_AFTER_PASS_DEV=prior;
  }
  console.log('AGENT29_RETROSPECTIVE_ROW_STATUS_DEBUG',JSON.stringify({
    baseline:baseline.rows.map(r=>({id:r.trial?.id,status:r.status,
      source:r.sourceDealFingerprint??null,
      error:String(r.error??'').slice(0,700)})),
    treated:treated.rows.map(r=>({id:r.trial?.id,status:r.status,
      source:r.sourceDealFingerprint??null,
      error:String(r.error??'').slice(0,700)}))
  }));
  assert.equal(baseline.attempted,4);
  assert.equal(treated.attempted,4);
  assert.equal(baseline.competitiveQualifiedGames,0);
  assert.equal(treated.competitiveQualifiedGames,0);
  const totals={attempted:4,accepted:0,discarded:0,
    rejected:0,headsNotMeasured:true,byRank:{},capped:0,
    firstOwnerTurnRoots:0,rootHammerOpportunities:0,
    nonPassHammerOpportunities:0,distinctHammerOpportunityTurns:0};
  for(let i=0;i<4;i++){
    const before=baseline.rows[i],after=treated.rows[i];
    assert.equal(before.trial.id,after.trial.id);
    assert.equal(before.sourceDealFingerprint,after.sourceDealFingerprint);
    assert.equal(before.actualStarterSeat,after.actualStarterSeat);
    const a=after.actorOnlyDecisionCoverage?.ownerHammerAfterPassAudit;
    assert.ok(a,'No native owner Hammer audit');
    assert.equal(a.competitiveQualified,false);
    assert.equal(a.policyStrategicallyValidated,false);
    assert.ok(a.nativeStores>=1);
    assert.equal(before.actorOnlyDecisionCoverage?.ownerHammerAfterPassAudit,null);
    assert.equal(a.proposedHammerRoots,
      a.acceptedHammerRoots+a.rejectedHammerRoots);
    assert.ok(a.acceptedEnergyDiscards<=a.acceptedHammerRoots);
    assert.ok(a.firstOwnerTurnRoots>=a.distinctHammerOpportunityTurns);
    assert.ok(a.rootHammerOpportunities>=a.distinctHammerOpportunityTurns);
    assert.ok(a.rootHammerOpportunities>=a.nonPassHammerOpportunities);
    assert.ok(a.distinctHammerOpportunityTurns>=
      a.distinctNonPassFirstOpportunityTurns);
    assert.ok(a.firstOwnerTurnsHoldingHammer<=a.firstOwnerTurnRoots);
    totals.firstOwnerTurnRoots+=a.firstOwnerTurnRoots;
    totals.rootHammerOpportunities+=a.rootHammerOpportunities;
    totals.nonPassHammerOpportunities+=a.nonPassHammerOpportunities;
    totals.distinctHammerOpportunityTurns+=a.distinctHammerOpportunityTurns;
    totals.accepted+=a.acceptedHammerRoots;
    totals.discarded+=a.acceptedEnergyDiscards;
    totals.rejected+=a.rejectedHammerRoots;
    if(after.capped===true)totals.capped++;
    const rank=String(after.trial.rank);
    const row=totals.byRank[rank]??{
      originalPasses:0,eligiblePasses:0,accepted:0,
      energyDiscards:0,bySeat:{0:0,1:0},sampleActions:[],
      firstOwnerTurnRoots:0,holdingHammerAtFirstOwnerRoot:0,
      rootOpportunities:0,nonPassOpportunities:0,
      distinctHammerOpportunityTurns:0,
      distinctNonPassFirstOpportunityTurns:0,
      competingActionClasses:{},sampleOpportunities:[]
    };
    row.originalPasses+=a.originalPasses;
    row.eligiblePasses+=a.eligiblePasses;
    row.accepted+=a.acceptedHammerRoots;
    row.energyDiscards+=a.acceptedEnergyDiscards;
    row.firstOwnerTurnRoots+=a.firstOwnerTurnRoots;
    row.holdingHammerAtFirstOwnerRoot+=a.firstOwnerTurnsHoldingHammer;
    row.rootOpportunities+=a.rootHammerOpportunities;
    row.nonPassOpportunities+=a.nonPassHammerOpportunities;
    row.distinctHammerOpportunityTurns+=a.distinctHammerOpportunityTurns;
    row.distinctNonPassFirstOpportunityTurns+=
      a.distinctNonPassFirstOpportunityTurns;
    for(const [kind,count] of Object.entries(a.competingActionClasses))
      row.competingActionClasses[kind]=
        (row.competingActionClasses[kind]??0)+count;
    row.sampleOpportunities.push(...a.hammerOpportunityExamples.slice(0,6));
    for(const seat of [0,1])
      row.bySeat[seat]+=a.bySeat[seat].roots;
    row.sampleActions.push(...a.examples.slice(0,6));
    totals.byRank[rank]=row;
  }
  console.log('AGENT29_NATIVE_HAMMER_RETROSPECTIVE_PAIR',JSON.stringify(totals));
});
