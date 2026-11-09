'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runDevelopment}=
  require('../agent41-bilateral-v2-development.cjs');
const {sourceSummary}=
  require('../agent37-rank5-fusion-mobility-prospective.cjs');
const {saveAtomic}=
  require('../agent37-rank5-source-quickball-discard-retrospective.cjs');

const VERSION='agent37-original-mew-source-mail-afterpass-native-v1';
const ROOT=path.resolve(__dirname,'../../..');
const REGISTRATION=
  'results/aichi-2026/registrations/agent37-rank5-mew-source-mail-afterpass-20261109.json';
const OUTPUT=path.join(ROOT,'agent37-rank5-mew-source-mail-afterpass-16arm.json');
const SOURCE_SHA=
  'a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05';
const CANDIDATES=['champion-reference','new-moon-lockbreaker-v1'];

function readRegistration(){
  const bytes=fs.readFileSync(path.join(ROOT,REGISTRATION));
  const reg=JSON.parse(bytes.toString('utf8'));
  assert.equal(reg.schema,'agent37-rank5-source-owner-trainers-mail-afterpass-v1');
  assert.equal(reg.status,'frozen-before-native-mail-comparison');
  assert.equal(reg.originalSourcePrinted60Sha256,SOURCE_SHA);
  assert.equal(reg.sourceRank,5);
  assert.deepEqual(reg.fixedCandidates,CANDIDATES);
  assert.equal(reg.expectedNativeAttempts,16);
  assert.equal(reg.registeredGroups.length,4);
  const seeds=new Set();
  for(const g of reg.registeredGroups){
    assert.equal(g.rank,5);
    assert.ok(['A','B'].includes(g.candidateSlot));
    assert.ok(Number.isSafeInteger(g.repeat)&&g.repeat>=0);
    assert.ok(Number.isSafeInteger(g.seed)&&g.seed>0&&g.seed<0x80000000);
    assert.ok(!seeds.has(g.seed));seeds.add(g.seed);
  }
  for(const old of reg.previousSeedsExcluded)
    assert.ok(!seeds.has(old),'No exposed initial physical seed reuse');
  for(const seat of ['A','B'])
    assert.equal(reg.registeredGroups.filter(g=>g.candidateSlot===seat).length,2);
  const original=require('../../../results/aichi-2026/original-printed60-admission-v1.json')
    .rows.find(x=>x.rank===5);
  assert.equal(original.physicalCards,60);
  assert.equal(original.printed60Sha256,SOURCE_SHA);
  const trials=reg.registeredGroups.flatMap(g=>
    CANDIDATES.map(candidateId=>({...g,candidateId,
      id:[g.rank,g.repeat,g.candidateSlot,candidateId].join(':')})));
  return {reg,trials,digest:createHash('sha256').update(bytes).digest('hex')};
}

/** @param {object} row Executed native source arm. */
function sourceRootReceipts(row) {
  const audit=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root??null;
  const events=audit?.nativeRootAcceptances??[];
  const ultra=events.filter(e=>e.kind==='play-mew-ultra-ball'&&
    e.seat===row.sourceSeat);
  const search=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.ownerSearch;
  const targeted=search?.boundedSelections?.filter(e=>
    e.seat===row.sourceSeat&&
    e.printings?.includes('Mew VMAX FST'))??[];
  return {
    sourceRootOptIn:audit?.mewUltraBallEvolutionRootOptIn===true,
    sourceRootOwnerSeat:audit?.mewUltraBallEvolutionRootOwnerSeat??null,
    nativeOwnerUltraBallRoots:ultra.map(e=>({
      globalTurn:e.globalTurn,kind:e.kind,
      accepted:e.accepted,physical:e.nativePhysicalEffect??null
    })),
    searchMewVmaxResults:targeted.map(e=>({
      turn:e.turn,printings:e.printings,promptId:e.promptId
    }))
  };
}

/** Compare actual owner Mail after incumbent Pass over identical full original Mew setup. */
function runPayment() {
  const {reg,trials,digest}=readRegistration();
  const frozen=require('../agent41-frozen-bilateral-development-v2.json');
  assert.equal(frozen.policyOptions.actorOnlyComposition,true);
  const common={
    ...frozen.policyOptions,
    actorNaturalEvolutionRoot:true,
    actorMewGenesectTechnoBlast:true,
    sourceScopedQuickBallRoot:true,
    actorHandDiscard:true,
    actorOnlySingleSearch:true,
    actorMewGenesectQuickBallSearch:true,
    actorDceMewMobilityRoot:true,
    actorMewDceRecipientRoot:true,
    actorMewDceRecipientSourceOnly:true,
    actorGenesectFusionDrawRoot:true
  };
  const modes={};
  for(const [mode,enableMail] of [['noMail',false],['sourceMailAfterPass',true]]){
    try{
      const data=runDevelopment({
        ...common,
        actorMewUltraBallRoot:true,
        actorMewUltraBallSearch:true,
        actorMewUltraBallPaymentGuard:true,
        actorMewQuickBallPaymentGuard:true,
        actorOwnerMailAfterPass:enableMail,
        actorOwnerMailAfterPassSourceOnly:enableMail,
        registeredTrials:trials,
        registeredFrameName:VERSION+'-'+mode,
        allowAdditionalOriginalSourceRanks:true
      });
      assert.equal(data.attempted,8);
      assert.deepEqual(data.rows.map(x=>x.trial.id),trials.map(x=>x.id));
      modes[mode]={
        attempts:data.rows.map(row=>({
          trial:row.trial,
          summary:sourceSummary(row),
          ultraBallReceipts:sourceRootReceipts(row),
          rawNativeRow:row
        })),
        nativeReport:data,batchError:null
      };
    }catch(error) {
      modes[mode]={
        attempts:trials.map(trial=>({
          trial,summary:{nativeDisposition:'NATIVE_BATCH_ERROR',
            sourceDealFingerprint:null,fullPhysicalDealFingerprint:null,
            sourceAttackDeclarations:null},
          ultraBallReceipts:null,rawNativeRow:null
        })),
        nativeReport:null,batchError:String(error?.stack??error)
      };
    }
  }
  const comparison=trials.map((trial,index)=>{
    const arm=mode=>{
      const a=modes[mode].attempts[index],r=a.rawNativeRow,s=a.summary;
      return {
        nativeDisposition:s.nativeDisposition,
        sourceDealFingerprint:s.sourceDealFingerprint??null,
        fullPhysicalDealFingerprint:s.fullPhysicalDealFingerprint??null,
        sourceSeat:s.sourceSeat??null,
        sourceAttackDeclarations:s.sourceAttackDeclarations??null,
        sourceSettledAttacks:r?.sourceAttackSettlement?.settled??null,
        sourcePrizesRemaining:r?.finalPrizes?.[s.sourceSeat]??null,
        winner:r?.winner??null,
        finished:r?.finished===true,
        ultraBallReceipts:a.ultraBallReceipts,
        mailAccepted:r?.ownerMailAfterPassAudit?.mailStoreAccepted??0,
        mailPromptAccepted:r?.ownerMailAfterPassAudit?.promptAccepted??0,
        mailSelections:r?.ownerMailAfterPassAudit?.selectedReceipts??[]
      };
    };
    const baseline=arm('noMail'),treatment=arm('sourceMailAfterPass');
    const matched=Boolean(baseline.sourceDealFingerprint&&
      baseline.sourceDealFingerprint===treatment.sourceDealFingerprint&&
      baseline.fullPhysicalDealFingerprint&&
      baseline.fullPhysicalDealFingerprint===treatment.fullPhysicalDealFingerprint);
    return {trial,matched,baseline,treatment,
      sourceAttackDelta:matched&&
        Number.isSafeInteger(baseline.sourceAttackDeclarations)&&
        Number.isSafeInteger(treatment.sourceAttackDeclarations)?
          treatment.sourceAttackDeclarations-baseline.sourceAttackDeclarations:null,
      competitiveQualified:false};
  });
  return {
    schema:VERSION,registration:REGISTRATION,
    registrationSha256:digest,
    registeredSourceRank:reg.sourceRank,
    frozenOriginalSourcePrinted60Sha256:SOURCE_SHA,
    registeredCandidateIds:reg.fixedCandidates,
    attemptsPerMode:Object.fromEntries(Object.entries(modes)
      .map(([k,v])=>[k,v.attempts.length])),
    matchedSourceAndFullPhysicalDeals:comparison.filter(x=>x.matched).length,
    comparison,modes,postOutcomeSelectedSeedReplay:false,independentFreshSeeds:true,
    sourceMailAfterPassOnlyDifference:true,
    competitiveQualifiedGames:0,
    certifiedWinRate:null
  };
}

if(require.main===module){
  if(process.argv.includes('--inspect-only')) {
    const {reg,trials,digest}=readRegistration();
    process.stdout.write(JSON.stringify({
      schema:VERSION,registrationSha256:digest,
      trials:trials.map(t=>t.id),
      plannedNativeAttempts:reg.expectedNativeAttempts
    },null,2)+'\n');
  }else {
    const result=runPayment();
    saveAtomic(OUTPUT,result);
    process.stdout.write(JSON.stringify({
      schema:result.schema,
      registrationSha256:result.registrationSha256,
      attemptCounts:result.attemptsPerMode,
      matchedPhysicalDeals:result.matchedSourceAndFullPhysicalDeals,
      comparisons:result.comparison,
      batchErrors:Object.fromEntries(Object.entries(result.modes)
        .filter(([,v])=>v.batchError).map(([k,v])=>[k,v.batchError])),
      qualifiedGames:0
    },null,2)+'\n');
    if(Object.values(result.modes).some(x=>x.batchError))process.exitCode=1;
  }
}

module.exports={
  VERSION,REGISTRATION,OUTPUT,readRegistration,sourceRootReceipts,runPayment
};
