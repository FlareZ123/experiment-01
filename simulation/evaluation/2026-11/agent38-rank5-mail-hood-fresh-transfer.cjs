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

const VERSION='agent38-rank5-mail-hood-fresh-transfer-v1';
const ROOT=path.resolve(__dirname,'../../..');
const REGPATH='results/aichi-2026/registrations/agent38-rank5-mail-hood-fresh-transfer-20261109.json';
const OUTPUT=path.join(ROOT,'agent38-rank5-mail-hood-fresh-transfer-16arm.json');
const SOURCE_SHA='a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05';
const CANDIDATES=['hood-shield-v1','champion-reference'];

/** Read and validate a committed, pre-execution physical game registration. */
function readRegistration(){
  const raw=fs.readFileSync(path.join(ROOT,REGPATH));
  const r=JSON.parse(raw.toString('utf8'));
  assert.equal(r.schema,VERSION);
  assert.equal(r.status,'FROZEN_BEFORE_NATIVE_EXECUTION');
  assert.equal(r.originalSourcePrinted60Sha256,SOURCE_SHA);
  assert.deepEqual(r.fixedCandidates,CANDIDATES);
  assert.equal(r.expectedNativeAttempts,16);
  assert.equal(r.registeredGroups.length,4);
  const historical=new Set(r.excludedPreviousRank5SourceMailSeeds);
  const seeds=new Set();
  for(const g of r.registeredGroups){
    assert.equal(g.rank,5);
    assert.ok(['A','B'].includes(g.candidateSlot));
    assert.ok(Number.isSafeInteger(g.repeat));
    assert.ok(Number.isSafeInteger(g.seed)&&g.seed>0&&g.seed<0x80000000);
    assert.ok(!historical.has(g.seed)&&!seeds.has(g.seed));
    seeds.add(g.seed);
  }
  for(const slot of ['A','B'])
    assert.equal(r.registeredGroups.filter(g=>g.candidateSlot===slot).length,2);
  const original=require('../../../results/aichi-2026/original-printed60-admission-v1.json')
    .rows.find(x=>x.rank===5);
  assert.equal(original?.printed60Sha256,SOURCE_SHA);
  assert.equal(original.physicalCards,60);
  const hood=require('../../../results/aichi-2026/candidate-hood-shadow-rider.json');
  assert.equal(hood.cards.reduce((n,c)=>n+c.count,0),60);
  const source=require('../../../results/aichi-2026/full-decklists.json')
    .decks.find(x=>x.rank===5);
  assert.equal(source.cards.reduce((n,c)=>n+c.count,0),60);
  return {r,hood,
    registrationSha256:createHash('sha256').update(raw).digest('hex')};
}

/** Four immutable original-source physical groups for a fixed contender. */
function schedule(reg,candidateId){
  assert.ok(CANDIDATES.includes(candidateId));
  return reg.registeredGroups.map(g=>({
    ...g,candidateId,id:[g.rank,g.repeat,g.candidateSlot,candidateId].join(':')
  }));
}

/** Convert one native Store return to a failure-inclusive source-perspective record. */
function summarize(row){
  const s=sourceSummary(row);
  const audit=row.ownerMailAfterPassAudit ??
    row.ownerMailAfterPassAbortAudit ?? null;
  return {trial:row.trial,
    nativeDisposition:s.nativeDisposition,
    sourceSeat:s.sourceSeat,
    initialSourceDeal:s.sourceDealFingerprint,
    initialFullDeal:s.fullPhysicalDealFingerprint,
    firstPlayer:s.actualStarterSeat,
    sourceAttackDeclarations:s.sourceAttackDeclarations,
    sourceSettledAttacks:row.sourceAttackSettlement?.settled??null,
    sourcePrizesRemaining:row.finalPrizes?.[s.sourceSeat]??null,
    candidatePrizesRemaining:row.finalPrizes?.[1-s.sourceSeat]??null,
    finished:row.finished===true,
    winner:row.finished===true?row.winner??null:null,
    sourceWon:row.finished===true?row.winner===s.sourceSeat:null,
    nativeActions:row.actionCount??null,
    nativeFailure:row.error?String(row.error?.message??row.error).slice(0,500):null,
    nativeRootFailure:row.nativeAbortEvidence??null,
    sourceMailStoreAccepted:audit?.mailStoreAccepted??null,
    sourceMailPromptsAccepted:audit?.promptAccepted??null,
    sourceMailSelections:audit?.selectedReceipts??[],
    nativeAcceptedSourceMailRoots:row.rootActionLedger?.filter(e=>
      e.playerSlot===s.sourceSeat&&e.action==='PlayCardAction'&&
      e.card==="Trainers' Mail ROS").length??null,
    competitiveQualified:false};
}

/**
 * Compare original same-sixty source deals; no outcome attribution when
 * physical openings differ or the source Mail never actually resolved.
 */
function paired(control,treatment){
  assert.equal(control.trial.id,treatment.trial.id);
  const physicalMatched=Boolean(control.initialFullDeal&&
    control.initialSourceDeal&&
    control.initialFullDeal===treatment.initialFullDeal&&
    control.initialSourceDeal===treatment.initialSourceDeal&&
    control.firstPlayer===treatment.firstPlayer);
  const bothTerminated=control.finished&&treatment.finished;
  const mailSettled=(treatment.sourceMailStoreAccepted??0)>0&&
    (treatment.sourceMailPromptsAccepted??0)>0;
  return {trial:control.trial,physicalMatched,bothTerminated,mailSettled,
    sourceWinnerReversed:physicalMatched&&bothTerminated&&mailSettled&&
      control.sourceWon!==treatment.sourceWon,
    sourceAttackDelta:physicalMatched&&
      Number.isSafeInteger(control.sourceAttackDeclarations)&&
      Number.isSafeInteger(treatment.sourceAttackDeclarations)?
      treatment.sourceAttackDeclarations-control.sourceAttackDeclarations:null,
    control,treatment,
    competitiveQualified:false};
}

/** Run 16 genuine native games with fixed printed sixties and fresh seeds. */
function execute(){
  const {r,hood,registrationSha256}=readRegistration();
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
    actorGenesectFusionDrawRoot:true,
    actorMewUltraBallRoot:true,
    actorMewUltraBallSearch:true,
    actorMewUltraBallPaymentGuard:true,
    actorMewQuickBallPaymentGuard:true,
    registeredCandidateDecks:{
      'hood-shield-v1':{label:'hood-shield-v1',cards:hood.cards}
    },
    allowSingleCandidatePerGroup:true,
    allowAdditionalOriginalSourceRanks:true
  };
  const panels={};
  for(const candidateId of CANDIDATES){
    const trials=schedule(r,candidateId);
    const modes={};
    for(const mode of ['control','sourceMailAfterPass']){
      try{
        const report=runDevelopment({
          ...common,actorOwnerMailAfterPass:mode==='sourceMailAfterPass',
          actorOwnerMailAfterPassSourceOnly:mode==='sourceMailAfterPass',
          registeredTrials:trials,
          registeredFrameName:VERSION+'-'+candidateId+'-'+mode
        });
        assert.equal(report.attempted,4);
        assert.deepEqual(report.rows.map(x=>x.trial.id),trials.map(x=>x.id));
        modes[mode]={rows:report.rows.map(summarize),
          nativeReport:report,batchError:null};
      }catch(error){
        modes[mode]={rows:trials.map(trial=>({
          trial,nativeDisposition:'NATIVE_BATCH_ERROR',
          initialFullDeal:null,initialSourceDeal:null,
          sourceAttackDeclarations:null,finished:false,
          sourceWon:null,nativeFailure:String(error?.message??error),
          competitiveQualified:false
        })),nativeReport:null,
        batchError:String(error?.stack??error)};
      }
    }
    panels[candidateId]={modes,comparison:trials.map((trial,i)=>
      paired(modes.control.rows[i],modes.sourceMailAfterPass.rows[i]))};
  }
  const all=Object.values(panels).flatMap(panel=>panel.comparison);
  return {schema:VERSION,registration:REGPATH,registrationSha256,
    frozenSourceRank:5,fixedCandidates:CANDIDATES,
    originalSourceSha256:SOURCE_SHA,
    expectedNativeAttempts:r.expectedNativeAttempts,
    attemptRowsRecorded:16, // Includes explicit placeholders after batch failure.
    matchedPhysicalGroups:all.filter(x=>x.physicalMatched).length,
    mailSettledGroups:all.filter(x=>x.mailSettled).length,
    completePairedTerminals:all.filter(x=>x.physicalMatched&&
      x.bothTerminated).length,
    witnessedNativeWinnerReversals:all.filter(x=>x.sourceWinnerReversed).length,
    panels,competitiveQualifiedGames:0,certifiedWinRate:null};
}

if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const {r,registrationSha256}=readRegistration();
    process.stdout.write(JSON.stringify({
      schema:VERSION,registrationSha256,
      registeredGroups:r.registeredGroups,
      fixedCandidates:CANDIDATES,
      plannedNativeAttempts:r.expectedNativeAttempts
    },null,2)+'\n');
  }else{
    const data=execute();
    saveAtomic(OUTPUT,data);
    process.stdout.write(JSON.stringify({
      schema:VERSION,registrationSha256:data.registrationSha256,
      expectedAttempts:data.expectedNativeAttempts,
      matchedPhysicalGroups:data.matchedPhysicalGroups,
      mailSettledGroups:data.mailSettledGroups,
      completePairedTerminals:data.completePairedTerminals,
      witnessedNativeWinnerReversals:data.witnessedNativeWinnerReversals,
      comparisons:Object.fromEntries(Object.entries(data.panels)
        .map(([id,p])=>[id,p.comparison.map(x=>({
          trial:x.trial.id,matched:x.physicalMatched,
          bothTerminated:x.bothTerminated,mailSettled:x.mailSettled,
          reversed:x.sourceWinnerReversed,
          control:{sourceWon:x.control.sourceWon,
            prizes:x.control.sourcePrizesRemaining,
            attacks:x.control.sourceAttackDeclarations,
            status:x.control.nativeDisposition},
          treatment:{sourceWon:x.treatment.sourceWon,
            prizes:x.treatment.sourcePrizesRemaining,
            attacks:x.treatment.sourceAttackDeclarations,
            status:x.treatment.nativeDisposition,
            mail:x.treatment.sourceMailStoreAccepted}
        }))])),
      batchErrors:Object.fromEntries(Object.entries(data.panels)
        .flatMap(([id,p])=>Object.entries(p.modes)
          .filter(([,m])=>m.batchError)
          .map(([mode,m])=>[id+':'+mode,m.batchError]))),
      competitiveQualifiedGames:0
    },null,2)+'\n');
    if(Object.values(data.panels).some(p=>
      Object.values(p.modes).some(m=>m.batchError)))process.exitCode=1;
  }
}

module.exports={VERSION,REGPATH,CANDIDATES,readRegistration,
  schedule,summarize,paired,execute};
