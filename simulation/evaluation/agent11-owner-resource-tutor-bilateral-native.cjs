'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=require('../twinleaf/headless.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {saveResult}=require('../twinleaf/agent3-rank26-compressor-settlement-prospective-v2.cjs');
const {withCanonicalActorOnlyPolicy}=require('./agent7-canonical-actor-composition.cjs');
const {withOwnerResourceTutorAfterPass,VERSION:BRIDGE_VERSION}=
  require('../twinleaf/agent11-native-owner-resource-tutor-after-pass.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION_VERSION=process.env.AGENT11_TUTOR_REGISTRATION??'v1';
assert.ok(['v1','v2','v3','v4'].includes(REGISTRATION_VERSION));
const REGISTRATION=path.join(ROOT,'results/aichi-2026/registrations/agent11-owner-resource-tutor-bilateral-'+REGISTRATION_VERSION+'.json');
const sha256=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const PIN='twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
// Opt-in read-only retrospective v2 replay. Never silently mutate frozen v2 receipts.
const ATTACK_TRACE_REPLAY=process.env.AGENT11_TUTOR_ATTACK_TRACE_REPLAY==='true';
const SYMMETRIC_KNOWN_DEAD=process.env.AGENT7_KNOWN_DEAD_ATTACK_ROOT_DEV==='true';
// Additional retrospective common actor policy: no source-seat-specific privileges.
const SYMMETRIC_MEW_COMPETENCE=process.env.AGENT11_SYMMETRIC_MEW_COMPETENCE==='true';
const C11_FULLBENCH_PASS=process.env.AGENT11_FULLBENCH_C11_PASS_DEV==='true';

/**
 * Frozen two-seat, two-independent-seed physical-deal development A/B design.
 * The original printed 60s, seeds and policy modes are read from committed
 * preregistration rather than selected from postgame outcomes.
 * No result is a qualified competitive game or fixed-60 contender ranking.
 * @returns {object} All eight attempted native arms including errors.
 */
function run(){
  const registered=JSON.parse(fs.readFileSync(REGISTRATION,'utf8'));
  assert.equal(registered.schema,'agent11-owner-resource-tutor-bilateral-'+REGISTRATION_VERSION);
  assert.equal(registered.arms.length,registered.predeclaredArms??8);
  assert.deepEqual(registered.modes,['control','resource-tutor']);
  assert.deepEqual(registered.sourceRanks,[5,11]);
  const manager=initializeCards();
  assert.ok(manager.getAllCards().length>0);
  const original=planAichi(5,{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  });
  const original5=original.candidate.cards;
  const original11=original.opponents.find(d=>d.rank===11)?.cards;
  assert.equal(original5?.length,60);
  assert.equal(original11?.length,60);
  const nativeSource11Letter=original11.filter(x=>x==='Professors Letter BKT').length;
  const nativeSource11Vip=original11.filter(x=>x==='Battle VIP Pass FST').length;
  assert.equal(nativeSource11Letter,4,'Original rank11 BKT #146 must resolve to pinned exact native fullName');
  assert.equal(nativeSource11Vip,4);
  const resultRows=[];
  for(const arm of registered.arms){
    const deckA=arm.rank5Seat===0?original5:original11;
    const deckB=arm.rank5Seat===1?original5:original11;
    const options={
      deckA,deckB,seed:arm.seed,
      maxActions:arm.maxActions,strictPromptValidation:true,
      isolatePolicyRandomness:true,
      captureDecisionTrace:true,
      captureInitialFullPhysicalDeal:true,
      capturePublicAttackTransitions:ATTACK_TRACE_REPLAY,
      captureFinalPublicBoard:ATTACK_TRACE_REPLAY,
      captureNativeAbortEvidence:ATTACK_TRACE_REPLAY,
      label:'agent11-owner-tutor-'+arm.id
    };
    let tutorAudit=null,actorAudit=null,c11GuardAudit=null,game=null,error=null;
    try{
      const actorWork=()=>{
        if(arm.mode==='control')return runMatch(options);
        const tutor=withOwnerResourceTutorAfterPass(
          ()=>runMatch(options),[deckA,deckB]);
        tutorAudit=tutor.audit;
        return tutor.result;
      };
      const actorAdapters=SYMMETRIC_MEW_COMPETENCE?{
        root:work=>require('../twinleaf/agent34-actor-only-root-policy.cjs')
          .withActorOnlyRootPolicy(work,{genesectFusionDraw:true})
      }:{};
      const actorOptions=SYMMETRIC_MEW_COMPETENCE?
        {preferMewGenesectTechnoBlast:true}:{};
      const guardedActorWork=()=>{
        if(!C11_FULLBENCH_PASS)return actorWork();
        const guarded=require('../twinleaf/agent11-fullbench-call-family-native-pass-guard.cjs')
          .withFullBenchTrubbishPassGuard(actorWork);
        c11GuardAudit=guarded.audit;
        return guarded.result;
      };
      const actual=withCanonicalActorOnlyPolicy(
        guardedActorWork,actorAdapters,actorOptions);
      game=actual.result;
      actorAudit={version:actual.audit.version,
        nativeDecisionCounts:actual.audit.nativeDecisionCounts};
      assert.equal(game.engine,PIN);
    }catch(e){
      error={name:e?.name??null,message:String(e?.message??e).slice(0,1000),
        nativeAuditAttached:Boolean(e?.nativeAudit),
        ...(ATTACK_TRACE_REPLAY?{nativeAbortEvidence:e?.nativeAbortEvidence??null}:{})};
    }
    resultRows.push({
      ...arm,engine:PIN,
      nativeStatus:error?'native-error':game?.finished?'native-terminal':'native-capped',
      error,
      initialFullPhysicalDealDigest:
        game?.initialFullPhysicalDealFingerprint?.digestSha256??null,
      firstTurnSlot:game?.firstTurnSlot??null,
      nativeFinished:game?.finished??false,
      nativeWinner:game?.finished?game.winner:null,
      rootActionLedger:game?.rootActionLedger??null,
      rootActionLedgerSha:game?sha256(game.rootActionLedger??[]):null,
      decisionTraceSha:game?sha256(game.decisionTrace??[]):null,
      ...(ATTACK_TRACE_REPLAY?{
        publicAttackTransitions:game?.publicAttackTransitions??null,
        attackTrace:game?.attackTrace??null,
        attackDeclarationTrace:game?.attackDeclarationTrace??null,
        source11OwnerDecisionHands:game?.decisionTrace?.filter(row=>
          row.playerSlot!==arm.rank5Seat&&
          ['AttackAction','PassTurnAction','PlayCardAction'].includes(row.action))
          .map(row=>({actionOrdinal:row.actionOrdinal,turnBefore:row.turnBefore,
            action:row.action,card:row.card??null,attack:row.attack??null,
            ownHandPrintings:row.decisionHandBefore?.ownHandPrintings??null}))??null,
        finalPublicBoard:game?.finalPublicBoard??null,
        prizesRemaining:game?.prizesRemaining??null,
        source11AttackDeclarations:game?.attackDeclarationTrace?.filter(row=>
          row.playerSlot!==arm.rank5Seat)??null,
      }:{}),
      actorAudit,tutorAudit,
      ...(C11_FULLBENCH_PASS?{c11GuardAudit}:{}),
      paperGameQualified:false
    });
  }
  const pairLedger=[];
  for(const seat of [0,1])for(const seed of registered.seeds){
    const pair=resultRows.filter(row=>row.rank5Seat===seat&&row.seed===seed);
    assert.equal(pair.length,2);
    const control=pair.find(row=>row.mode==='control');
    const tutor=pair.find(row=>row.mode==='resource-tutor');
    pairLedger.push({rank5Seat:seat,seed,
      physicalParityProven:Boolean(control.initialFullPhysicalDealDigest&&
        tutor.initialFullPhysicalDealDigest&&
        control.initialFullPhysicalDealDigest===tutor.initialFullPhysicalDealDigest&&
        control.firstTurnSlot===tutor.firstTurnSlot),
      controlStatus:control.nativeStatus,tutorStatus:tutor.nativeStatus,
      fullRootLedgerSame:Boolean(control.rootActionLedgerSha&&
        control.rootActionLedgerSha===tutor.rootActionLedgerSha),
      tutorAcceptedItems:tutor.tutorAudit?.acceptedItems??null,
      tutorPhysicalTargets:tutor.tutorAudit?.physicalTargetsSettled??null
    });
  }
  return {schema:registered.schema,engine:PIN,
    ...(ATTACK_TRACE_REPLAY?{attackTraceReplay:'read-only-retrospective-v2-source-payoff-audit-v1',
      historicalV2RootAuditComparisonRequired:!SYMMETRIC_KNOWN_DEAD}:{}),
    ...(SYMMETRIC_KNOWN_DEAD?{
      experimentalSymmetricKnownDeadActorRoot:'AGENT7_KNOWN_DEAD_ATTACK_ROOT_DEV=true',
      retrospectiveIntervention:true,competitiveQualifiedGames:0}:{}),
    ...(SYMMETRIC_MEW_COMPETENCE?{
      experimentalSymmetricMewCompetence:{
        actorNaturalEvolution:true,actorSpecialEnergy:true,
        actorPublicContextSpecialEnergy:true,
        actorGenesectFusionDraw:true,actorMewGenesectTechnoBlast:true,
        commonBothPhysicalSeats:true,
        retrospectiveIntervention:true
      },competitiveQualifiedGames:0}:{}),
    ...(C11_FULLBENCH_PASS?{
      experimentalC11FullBenchPassGuard:'retrospective-paper-no-search-equivalent-pass-v1',
      competitiveQualifiedGames:0
    }:{}),
    runGitSha:process.env.GITHUB_SHA??null,
    codeVersion:BRIDGE_VERSION,
    registrationSha256:sha256(registered),
    originalRanks:[5,11],originalDeckCounts:[original5.length,original11.length],
    nativeSource11Letter,nativeSource11Vip,
    scheduledArms:registered.arms.length,observedArms:resultRows.length,
    nativeErrors:resultRows.filter(r=>r.nativeStatus==='native-error').length,
    nativeCaps:resultRows.filter(r=>r.nativeStatus==='native-capped').length,
    nativeTerminals:resultRows.filter(r=>r.nativeStatus==='native-terminal').length,
    sourcePhysicalParityMatched:pairLedger.filter(p=>p.physicalParityProven).length,
    sourcePhysicalPairs:pairLedger.length,
    selectedPassRootCount:resultRows.filter(r=>r.mode==='resource-tutor')
      .reduce((n,row)=>n+(row.tutorAudit?.passRootsObserved??0),0),
    selectedHeldTutorOpportunities:resultRows.filter(r=>r.mode==='resource-tutor')
      .reduce((n,row)=>n+(row.tutorAudit?.registeredOpportunities??0),0),
    selectedProposedItems:resultRows.filter(r=>r.mode==='resource-tutor')
      .reduce((n,row)=>n+(row.tutorAudit?.proposedItems??0),0),
    selectedAcceptedItems:resultRows.filter(r=>r.mode==='resource-tutor')
      .reduce((n,row)=>n+(row.tutorAudit?.acceptedItems??0),0),
    selectedSettledPhysicalTargets:resultRows.filter(r=>r.mode==='resource-tutor')
      .reduce((n,row)=>n+(row.tutorAudit?.physicalTargetsSettled??0),0),
    pairs:pairLedger,rows:resultRows,
    competitiveQualifiedGames:0,
    status:'development-only; observed native action and recipient audits require paper and response certification'
  };
}

if(require.main===module){
  const result=run();
  const destination=path.resolve(process.cwd(),
    'agent11-owner-tutor-native-'+REGISTRATION_VERSION+'.json');
  saveResult(destination,result);
  process.stdout.write('AGENT11_OWNER_TUTOR_NATIVE '+JSON.stringify({
    engine:result.engine,attackTraceReplay:result.attackTraceReplay??null,
    enginePinStillFrozen:result.engine===PIN,observedArms:result.observedArms,
    nativeErrors:result.nativeErrors,nativeCaps:result.nativeCaps,
    nativeTerminals:result.nativeTerminals,
    physicalMatched:result.sourcePhysicalParityMatched,
    physicalPairs:result.sourcePhysicalPairs,
    nativeSource11Letter:result.nativeSource11Letter,
    tutorPassRoots:result.selectedPassRootCount,
    heldTutorOpportunities:result.selectedHeldTutorOpportunities,
    tutorProposals:result.selectedProposedItems,
    nativeAcceptedItems:result.selectedAcceptedItems,
    nativeSettledTargets:result.selectedSettledPhysicalTargets,
    errorArms:result.rows.filter(r=>r.error).map(r=>({id:r.id,error:r.error})),
    competitiveQualifiedGames:result.competitiveQualifiedGames,
    chosenDetails:result.rows.filter(r=>r.mode==='resource-tutor').map(r=>({
      id:r.id,status:r.nativeStatus,pass:r.tutorAudit?.passRootsObserved??null,
      opportunities:r.tutorAudit?.registeredOpportunities??null,
      proposed:r.tutorAudit?.proposedItems??null,
      accepted:r.tutorAudit?.acceptedItems??null,
      prompts:r.tutorAudit?.acceptedPrompts??null,
      moved:r.tutorAudit?.physicalTargetsSettled??null
    }))
  })+'\n');
}
module.exports={run};
