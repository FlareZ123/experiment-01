'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {runDevelopment}=
  require('../agent41-bilateral-v2-development.cjs');
const {sourceSummary}=
  require('../agent37-rank5-fusion-mobility-prospective.cjs');
const {saveAtomic}=
  require('../agent37-rank5-source-quickball-discard-retrospective.cjs');

const VERSION='agent37-rank5-klefki-genesect-ability-lock-retrospective-v1';
const TRIAL=Object.freeze({
  rank:5,repeat:14,candidateSlot:'B',
  candidateId:'new-moon-lockbreaker-v1',seed:936150192,
  id:'5:14:B:new-moon-lockbreaker-v1'
});
const OUTPUT=path.resolve(__dirname,
  '../../../agent37-rank5-klefki-genesect-retrospective.json');

/**
 * Replay one historical, already outcome-selected native fatal Klefki root.
 * Explicitly diagnostic; no effect estimate or prospective evidence.
 */
function run(){
  const frozen=require('../agent41-frozen-bilateral-development-v2.json');
  assert.equal(frozen.policyOptions.actorOnlyComposition,true);
  const options={
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
    actorOwnerMailAfterPass:true,
    actorOwnerMailAfterPassSourceOnly:true,
    registeredTrials:[TRIAL],
    allowSingleCandidateArm:true,
    allowAdditionalOriginalSourceRanks:true,
    registeredFrameName:VERSION
  };
  const data=runDevelopment(options);
  assert.equal(data.attempted,1);
  assert.equal(data.rows.length,1);
  assert.deepEqual(data.rows[0].trial,TRIAL);
  const row=data.rows[0];
  const result={
    schema:VERSION,
    sampleClassification:'retrospective single previously exposed physical seed and source 60',
    notAnIndependentGame:true,
    sourceRank:5,
    originalSourcePrinted60Sha256:
      'a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05',
    originalNativeFailure:{
      actionOrdinal:56,globalTurn:6,
      action:'UseAbilityAction',reason:'UNKNOWN_POWER',
      cause:'Active Klefki SVI suppresses Basic Genesect V Fusion Strike System'
    },
    intervention:'Same source actor now consults native CheckPokemonPowersEffect for real Genesect ability before proposing UseAbilityAction',
    sameRegisteredOriginalSourceAndCandidateDecks:true,
    afterSource:sourceSummary(row),
    result:row,
    competitiveQualifiedGames:0,
    certifiedWinRate:null
  };
  return result;
}

if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    process.stdout.write(JSON.stringify({schema:VERSION,trial:TRIAL,
      retrospective:true,plannedNativeAttempts:1},null,2)+'\n');
  }else{
    const out=run();
    saveAtomic(OUTPUT,out);
    process.stdout.write(JSON.stringify({
      schema:out.schema,trial:TRIAL,
      source:out.afterSource,
      disposition:out.result.status,
      nativeError:out.result.nativeAbortEvidence?.errorMessage??null,
      ownerMailAfterPassAudit:out.result.ownerMailAfterPassAudit??null,
      ownerMailAfterPassAbortAudit:out.result.ownerMailAfterPassAbortAudit??null,
      sourceSettledAttacks:out.result.sourceAttackSettlement?.settled??null,
      finalPrizes:out.result.finalPrizes??null,
      winner:out.result.winner??null,
      qualifiedGames:0
    },null,2)+'\n');
  }
}

module.exports={VERSION,TRIAL,OUTPUT,run};
