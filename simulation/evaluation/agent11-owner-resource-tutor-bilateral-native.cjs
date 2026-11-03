'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=require('../twinleaf/headless.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {withCanonicalActorOnlyPolicy}=require('./agent7-canonical-actor-composition.cjs');
const {withOwnerResourceTutorAfterPass,VERSION:BRIDGE_VERSION}=
  require('../twinleaf/agent11-native-owner-resource-tutor-after-pass.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION=path.join(ROOT,'results/aichi-2026/registrations/agent11-owner-resource-tutor-bilateral-v1.json');
const sha256=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const PIN='twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * Frozen two-seat, two-independent-seed physical-deal development A/B design.
 * The original printed 60s, seeds and policy modes are read from committed
 * preregistration rather than selected from postgame outcomes.
 * No result is a qualified competitive game or fixed-60 contender ranking.
 * @returns {object} All eight attempted native arms including errors.
 */
function run(){
  const registered=JSON.parse(fs.readFileSync(REGISTRATION,'utf8'));
  assert.equal(registered.schema,'agent11-owner-resource-tutor-bilateral-v1');
  assert.equal(registered.arms.length,8);
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
      label:'agent11-owner-tutor-'+arm.id
    };
    let tutorAudit=null,actorAudit=null,game=null,error=null;
    try{
      const actual=withCanonicalActorOnlyPolicy(()=>{
        if(arm.mode==='control')return runMatch(options);
        const tutor=withOwnerResourceTutorAfterPass(
          ()=>runMatch(options),[deckA,deckB]);
        tutorAudit=tutor.audit;
        return tutor.result;
      });
      game=actual.result;
      actorAudit={version:actual.audit.version,
        nativeDecisionCounts:actual.audit.nativeDecisionCounts};
      assert.equal(game.engine,PIN);
    }catch(e){
      error={name:e?.name??null,message:String(e?.message??e).slice(0,1000),
        nativeAuditAttached:Boolean(e?.nativeAudit)};
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
      actorAudit,tutorAudit,
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
    runGitSha:process.env.GITHUB_SHA??null,
    codeVersion:BRIDGE_VERSION,
    registrationSha256:sha256(registered),
    originalRanks:[5,11],originalDeckCounts:[original5.length,original11.length],
    scheduledArms:registered.arms.length,observedArms:resultRows.length,
    nativeErrors:resultRows.filter(r=>r.nativeStatus==='native-error').length,
    nativeCaps:resultRows.filter(r=>r.nativeStatus==='native-capped').length,
    nativeTerminals:resultRows.filter(r=>r.nativeStatus==='native-terminal').length,
    sourcePhysicalParityMatched:pairLedger.filter(p=>p.physicalParityProven).length,
    sourcePhysicalPairs:pairLedger.length,
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
  const destination=path.resolve(process.cwd(),'agent11-owner-tutor-native-v1.json');
  fs.writeFileSync(destination,JSON.stringify(result,null,2));
  process.stdout.write('AGENT11_OWNER_TUTOR_NATIVE '+JSON.stringify({
    engine:result.engine,observedArms:result.observedArms,
    nativeErrors:result.nativeErrors,nativeCaps:result.nativeCaps,
    nativeTerminals:result.nativeTerminals,
    physicalMatched:result.sourcePhysicalParityMatched,
    physicalPairs:result.sourcePhysicalPairs,
    nativeAcceptedItems:result.selectedAcceptedItems,
    nativeSettledTargets:result.selectedSettledPhysicalTargets,
    errorArms:result.rows.filter(r=>r.error).map(r=>({id:r.id,error:r.error})),
    competitiveQualifiedGames:result.competitiveQualifiedGames
  })+'\n');
}
module.exports={run};
