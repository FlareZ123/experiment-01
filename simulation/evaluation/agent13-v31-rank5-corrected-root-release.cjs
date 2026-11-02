'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobHash,assertExternallyPinnedSelectedProfile}=
  require('./agent36-profile-provenance-gate.cjs');

const ROOT=path.resolve(__dirname,'../..');
const VERSION='agent13-integrated-rank5-v31-corrected-root-release-v1';
const PROFILE_PATH='simulation/evaluation/agent13-v31-rank5-policy-profile-20261102.json';
const REGISTRATION_PATH='results/aichi-2026/registrations/agent13-rank5-v31-corrected-root-20261102.json';
const PROFILE_BLOB='14195053fbe11c2f6e35dae994c1cf8e0a73cc33';
const REGISTRATION_BLOB='e8c0b27c498b25d88426272509036217b6c96fc8';

/** Independently freeze selected policy bytes and both source printed 60 and code. */
function preflight(){
  const registeredBytes=fs.readFileSync(path.join(ROOT,REGISTRATION_PATH));
  assert.equal(gitBlobHash(registeredBytes),REGISTRATION_BLOB,
    'Externally registered rank5 seeds and policy identity changed');
  const registration=JSON.parse(registeredBytes.toString('utf8'));
  const profile=JSON.parse(fs.readFileSync(path.join(ROOT,PROFILE_PATH),'utf8'));
  assert.equal(registration.profileBlobSha,PROFILE_BLOB);
  assertExternallyPinnedSelectedProfile(ROOT,PROFILE_PATH,profile,PROFILE_BLOB);
  assert.equal(profile.originalRosterGitBlobSha,
    registration.sourceRosterBlobSha);
  assert.equal(profile.sourcePrinted60Sha256,registration.sourcePrinted60Sha256);
  assert.equal(profile.sourceRank,5);
  assert.deepEqual(profile.registeredSeeds,registration.registeredGroups);
  assert.equal(registration.plannedArms,16);
  assert.equal(profile.expectedTotalNativeArms,16);
  for(const [file,sha] of Object.entries(profile.effectiveSelectedCodeBlobShas)){
    assert.equal(gitBlobHash(fs.readFileSync(path.join(ROOT,file))),sha,
      'Selected release code changed from preregistered profile: '+file);
  }
  const rosterFile=path.join(ROOT,profile.originalRoster);
  assert.equal(gitBlobHash(fs.readFileSync(rosterFile)),
    profile.originalRosterGitBlobSha,'Authentic source roster bytes changed');
  const admissionFile=path.join(ROOT,profile.sourceAdmissionLedger);
  assert.equal(gitBlobHash(fs.readFileSync(admissionFile)),
    profile.originalAdmissionLedgerGitBlobSha,
    'Original-source printed identity ledger changed');
  const admission=JSON.parse(fs.readFileSync(admissionFile,'utf8'));
  const rank5=admission.rows.find(x=>x.rank===5);
  assert.equal(rank5.printed60Sha256,profile.sourcePrinted60Sha256);
  assert.equal(rank5.physicalCards,60);
  const v2=JSON.parse(fs.readFileSync(path.join(ROOT,
    'simulation/evaluation/agent41-frozen-bilateral-development-v2.json'),'utf8'));
  assert.deepEqual(profile.policyModes.frozenV2Control.options,v2.policyOptions);
  assert.deepEqual(profile.policyModes.integratedV3.options,{
    ...v2.policyOptions,actorNaturalEvolutionRoot:true,
    actorMewGenesectTechnoBlast:true
  });
  const groups=registration.registeredGroups;
  assert.equal(groups.length,4);
  assert.deepEqual(groups.map(x=>x.candidateSlot),['A','B','A','B']);
  assert.equal(new Set(groups.map(x=>x.seed)).size,4);
  for(const group of groups){
    assert.equal(group.rank,5);
    assert.ok(Number.isSafeInteger(group.seed)&&group.seed>=0&&
      group.seed<=0xffffffff);
  }
  return {profile,registration};
}

/**
 * Classify the actual outcome of a native development attempt using the
 * complete settled row. These are engine dispositions, never competitive wins.
 * A native abort has a raw error or raw status; preserve its precise reason.
 * @param {object} row Retained raw native development row.
 * @returns {'ENGINE_TERMINAL_UNQUALIFIED'|'CENSORED'|'NATIVE_ERROR'|'UNVERIFIED'}
 */
function nativeDevelopmentDisposition(row){
  if(row.error!=null||row.status!=null)return 'NATIVE_ERROR';
  if(row.finished===true&&row.endReason==='engine-game-end')
    return 'ENGINE_TERMINAL_UNQUALIFIED';
  if(row.finished===false&&row.endReason==='action-limit')
    return 'CENSORED';
  return 'UNVERIFIED';
}

/** @param {object} row Retained raw native development row. */
function sourceWitness(row){
  const sourceSeat=row.trial?.candidateSlot==='A'?1:0;
  const roots=Array.isArray(row.rootActionLedger)?row.rootActionLedger:[];
  const acceptedSourceMewVMAX=roots.filter(x=>x.playerSlot===sourceSeat&&
    x.action==='PlayCardAction'&&
    typeof x.card==='string'&&x.card.startsWith('Mew VMAX'));
  const copied=row.actorOnlyDecisionCoverage?.detailedComponentAudits
    ?.chooseAttack?.selections??[];
  return {
    sourceSeat,
    actualSourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    status:nativeDevelopmentDisposition(row),
    nativeRawStatus:row.status??null,
    nativeFinished:row.finished??null,
    nativeEndReason:row.endReason??null,
    nativeActionCount:row.actionCount??null,
    nativeWinnerUnqualified:row.finished===true&&
      row.endReason==='engine-game-end'?row.winner??null:null,
    nativeError:row.error??null,
    originalSourceAttackDeclarations:row.attackDeclarations?.source??null,
    sourceMewVMAXPlayRoots:acceptedSourceMewVMAX.map(x=>({
      turnBefore:x.turnBefore,actionOrdinal:x.actionOrdinal,card:x.card
    })),
    ownerSourceGenesectCopiedSelections:copied.filter(x=>
      x.seat===sourceSeat&&x.printing==='Genesect V FST'&&
      x.attack==='Techno Blast').map(x=>({turn:x.turn,sourceIndex:x.sourceIndex,
        attackIndex:x.attackIndex})),
    sourceAttackSettlement:row.sourceAttackSettlement??null,
    candidatePostSourceAttackReplies:row.candidateRepliesAfterSourceAttacks??null,
    actualSourceFirstTurn:row.actualStarterSeat===sourceSeat,
    paperActionQualified:false,
    competitiveGameQualified:false
  };
}

/** Same seed alone cannot prove identical physical source opening. */
function physicalPairStatus(a,b){
  const x=a?.sourceDealFingerprint;
  const y=b?.sourceDealFingerprint;
  if(typeof x!=='string'||typeof y!=='string')
    return 'UNVERIFIED';
  return x===y?'EXACT_SOURCE_DEAL_MATCH':'SOURCE_DEAL_DIFFERENT';
}

/**
 * Two prospective registered source-seed groups, both fixed candidate 60s,
 * baseline frozen v2 against one integrated both-seat v3 policy.
 * @param {{runDevelopment?:Function,pinNative?:boolean}} [deps]
 * @returns {object}
 */
function runRelease(deps={}){
  const {profile,registration}=preflight();
  const frozen=require('./agent41-frozen-bilateral-development-v1.cjs');
  frozen.assertNoUnreviewedAmbientAgentEnvironment(process.env);
  if(deps.pinNative!==false)frozen.assertPinnedNativeStore(ROOT,profile);
  const run=deps.runDevelopment??require('./agent41-bilateral-v2-development.cjs')
    .runDevelopment;
  assert.equal(typeof run,'function');
  const trials=registration.registeredGroups.flatMap(g=>
    registration.candidateIds.map(candidateId=>({
      ...g,candidateId,
      id:[g.rank,g.repeat,g.candidateSlot,candidateId].join(':')
    })));
  assert.equal(trials.length,8);
  const modes={};
  const previous=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  try {
    process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
    for(const [name,entry] of Object.entries(profile.policyModes)){
      try{
        const result=run({...entry.options,
          registeredTrials:trials,
          registeredFrameName:VERSION+'-'+name,
          allowAdditionalOriginalSourceRanks:true
        });
        assert.equal(result.attempted,8);
        assert.deepEqual(result.rows.map(x=>x.trial.id),trials.map(x=>x.id));
        modes[name]={attempts:result.rows.map(row=>({
          trial:row.trial,evidence:sourceWitness(row),rawNativeRow:row
        })),nativeReport:result};
      }catch(error){
        modes[name]={attempts:trials.map(trial=>({
          trial,evidence:{status:'NATIVE_ERROR',error:String(error?.message??error),
            competitiveGameQualified:false},rawNativeRow:null
        })),batchError:String(error?.stack??error)};
      }
    }
  }finally{
    if(previous===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=previous;
  }
  const paired=trials.map((trial,i)=>{
    const baseline=modes.frozenV2Control.attempts[i];
    const treatment=modes.integratedV3.attempts[i];
    return {
      trial,controlledSameSourceDeal:
        physicalPairStatus(baseline.rawNativeRow,treatment.rawNativeRow),
      baseline:baseline.evidence,integratedV3:treatment.evidence,
      observedAttackDelta:Number.isSafeInteger(
        baseline.evidence.originalSourceAttackDeclarations)&&
        Number.isSafeInteger(treatment.evidence.originalSourceAttackDeclarations)&&
        physicalPairStatus(baseline.rawNativeRow,treatment.rawNativeRow)===
          'EXACT_SOURCE_DEAL_MATCH'?
          treatment.evidence.originalSourceAttackDeclarations-
          baseline.evidence.originalSourceAttackDeclarations:null
    };
  });
  return {
    schema:VERSION,registeredBeforeNativeOutcomes:true,
    registrationGitBlobSha:REGISTRATION_BLOB,profileGitBlobSha:PROFILE_BLOB,
    actualSourcePrinted60Sha256:profile.sourcePrinted60Sha256,
    enginePin:profile.pinnedVendorRevision,
    attempted:16,allNativeArmsRetained:true,
    comparisons:paired,modes,
    competitiveQualifiedGames:0,certifiedWinRate:null,
    remainingVetoes:profile.qualificationVetoes
  };
}

if(require.main===module){
  const result=process.argv.includes('--inspect-only')?
    {version:VERSION,preflight:preflight(),mode:'NO_NATIVE_EXECUTION',
      competitiveQualifiedGames:0}:runRelease();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}

module.exports={VERSION,PROFILE_BLOB,REGISTRATION_BLOB,preflight,
  nativeDevelopmentDisposition,sourceWitness,physicalPairStatus,runRelease};
