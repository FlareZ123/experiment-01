'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION_PATH='results/aichi-2026/registrations/agent1-rank17-prospective-evolution-policy-20261102.json';
const V2_PATH='simulation/evaluation/agent41-frozen-bilateral-development-v2.json';
const ADMISSION_PATH='results/aichi-2026/original-printed60-admission-v1.json';
const ROSTER_PATH='results/aichi-2026/full-decklists.json';
const VERSION='agent1-prospective-original-rank17-onefactor-evolution-20261102-v1';

/** @param {string} name @returns {object} */
function json(name){
  return JSON.parse(fs.readFileSync(path.join(ROOT,name),'utf8'));
}

/**
 * All four source/seat/seed pairs were published before any native
 * experimentation. No result-dependent recruitment, dropped runs or
 * preselected successful openers.
 * @returns {{registration:object,options:object,trials:object[]}}
 */
function preflight(){
  const registration=json(REGISTRATION_PATH);
  const profile=json(V2_PATH);
  const original=json(ADMISSION_PATH);
  const roster=json(ROSTER_PATH);
  assert.equal(registration.schema,
    'agent1-rank17-original-prospective-onefactor-two-seat-evolution-v1');
  assert.equal(registration.sourceRank,17);
  assert.equal(registration.originalRosterBlobSha,profile.originalRosterGitBlobSha);
  assert.equal(registration.originalRosterBlobSha,original.sourceGitBlobSha);
  assert.equal(registration.pinnedVendor,profile.pinnedVendorRevision);
  const rank17=roster.decks.find(deck=>deck.rank===17);
  const source=original.rows.find(row=>row.rank===17);
  assert.equal(rank17?.player,'Yuya Yamano');
  assert.equal(source?.printed60Sha256,registration.sourcePrinted60Sha256);
  assert.equal(source?.physicalCards,60);
  assert.equal(rank17.cards.reduce((total,card)=>total+card.count,0),60);
  const quantity=(name)=>rank17.cards
    .filter(card=>card.name===name).reduce((n,c)=>n+c.count,0);
  assert.equal(quantity('Unown'),4);
  assert.equal(quantity('Pikachu'),1);
  assert.equal(quantity('Alolan Raichu'),2);
  assert.equal(quantity('Voltorb'),2);
  assert.equal(quantity('Electrode-GX'),3);
  assert.equal(registration.registeredGroups.length,4);
  assert.equal(registration.expectedTrialsPerMode,8);
  assert.equal(registration.expectedNativeArms,16);
  const groupKeys=new Set();
  const allSeeds=new Set();
  const trials=[];
  for(const group of registration.registeredGroups){
    assert.equal(group.rank,17);
    assert.ok(Number.isSafeInteger(group.repeat)&&group.repeat>=0);
    assert.ok(group.candidateSlot==='A'||group.candidateSlot==='B');
    assert.ok(Number.isSafeInteger(group.seed)&&
      group.seed>=0&&group.seed<=0xffffffff);
    const key=[group.rank,group.repeat,group.candidateSlot].join(':');
    assert.ok(!groupKeys.has(key));
    groupKeys.add(key);
    assert.ok(!allSeeds.has(group.seed));
    allSeeds.add(group.seed);
    for(const candidateId of registration.candidateIds){
      assert.ok(['champion-reference','new-moon-lockbreaker-v1']
        .includes(candidateId));
      trials.push({...group,candidateId,id:key+':'+candidateId});
    }
  }
  assert.equal(trials.length,8);
  const options=profile.policyOptions;
  assert.equal(options.actorOnlyComposition,true);
  assert.equal(options.bilateralPublicContextSpecialEnergy,true);
  assert.equal(options.actorNaturalEvolutionRoot,undefined);
  return {registration,options,trials};
}

/**
 * Read only the native acceptance ledger for the original rank17 seat.
 * Names in the printing ledger are observations, not legality or proof that
 * unrecorded optional triggers/attacks were correctly resolved.
 * @param {object} row Native bilateral result.
 * @returns {object}
 */
function sourceWitness(row){
  const sourceSeat=row.trial.candidateSlot==='A'?1:0;
  const roots=Array.isArray(row.rootActionLedger)?row.rootActionLedger:[];
  const own=roots.filter(x=>x.playerSlot===sourceSeat);
  const stage1=own.filter(x=>x.action==='PlayCardAction'&&
    ['Alolan Raichu','Electrode-GX'].some(name=>
      typeof x.card==='string'&&x.card.startsWith(name)));
  const abilities=own.filter(x=>x.action==='UseAbilityAction');
  const attacks=own.filter(x=>x.action==='AttackAction');
  return {
    trialId:row.trial.id,sourceRank:17,sourceSeat,
    status:row.status??null,error:row.error??null,
    nativeFinished:row.finished??null,
    nativeEndReason:row.endReason??null,
    nativeWinnerUnqualified:row.finished===true?
      row.winner??null:null,
    actionCount:row.actionCount??null,
    publicSourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    verifiedFirstTurn:row.verifiedFirstTurn??null,
    sourceFirst:row.actualStarterSeat===sourceSeat,
    sourceStage1PlayRoots:stage1.map(x=>({
      turn:x.turnBefore,ordinal:x.actionOrdinal,card:x.card})),
    sourceAbilityRoots:abilities.map(x=>({
      turn:x.turnBefore,ordinal:x.actionOrdinal,
      ability:x.ability??null,card:x.card??null})),
    sourceAttackRoots:attacks.map(x=>({
      turn:x.turnBefore,ordinal:x.actionOrdinal,
      attack:x.attack??null,card:x.card??null})),
    sourceAttackDeclarations:row.attackDeclarations?.source??null,
    sourceAttackSettlement:row.sourceAttackSettlement??null,
    competitiveQualifiedGame:false
  };
}

/**
 * Comparing the same source-printing/seat/seed across policy modes requires
 * a native source-deal fingerprint, not seed equality alone.
 * @param {object} control
 * @param {object} treatment
 * @returns {'EXACT_SOURCE_DEAL_MATCH'|'DIFFERENT_SOURCE_DEAL'|'UNVERIFIED'}
 */
function sourceDealMatch(control,treatment){
  const a=control?.sourceDealFingerprint;
  const b=treatment?.sourceDealFingerprint;
  if(typeof a!=='string'||typeof b!=='string')return 'UNVERIFIED';
  return a===b?'EXACT_SOURCE_DEAL_MATCH':'DIFFERENT_SOURCE_DEAL';
}

/** @returns {object} */
function run(){
  const {registration,options,trials}=preflight();
  const engine=require('./agent41-bilateral-v2-development.cjs');
  const modes={};
  const previous=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  try{
    process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
    for(const [key,extra] of [
      ['frozenV2Control',{}],
      ['naturalEvolutionOnly',{actorNaturalEvolutionRoot:true}]
    ]){
      const result=engine.runDevelopment({
        ...options,...extra,
        registeredTrials:trials,
        registeredFrameName:VERSION+'-'+key,
        allowAdditionalOriginalSourceRanks:true
      });
      assert.equal(result.attempted,8);
      assert.deepEqual(result.rows.map(row=>row.trial.id),
        trials.map(trial=>trial.id));
      modes[key]={rows:result.rows,sourceWitnesses:result.rows.map(sourceWitness),
        nativeSummary:{attempted:result.attempted,
          errors:result.errors??null,
          competitiveQualifiedGames:result.competitiveQualifiedGames??0}};
    }
  }finally{
    if(previous===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=previous;
  }
  const paired=trials.map((trial,index)=>({
    trial,
    sourceDealMatch:sourceDealMatch(
      modes.frozenV2Control.rows[index],
      modes.naturalEvolutionOnly.rows[index]),
    control:modes.frozenV2Control.sourceWitnesses[index],
    naturalEvolution:modes.naturalEvolutionOnly.sourceWitnesses[index]
  }));
  return {
    version:VERSION,
    registration,sourcePrinted60Sha256:registration.sourcePrinted60Sha256,
    pinnedVendor:registration.pinnedVendor,
    comparedPolicies:'frozenV2 + exactly one symmetrical actorNaturalEvolutionRoot',
    attempted:16,paired,
    modes,
    competitiveQualifiedGames:0,
    certifiedWinRate:null,
    limitation:'Prospective rank17 original 60 versus two unchanged candidate 60s. Same registered seeds and source seat are an input; source physical pair match is checked separately. Every error and censored run retained. Neither pure optional evolution choice nor native terminal certifies paper competitive wins or source policy competence.'
  };
}

if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  process.stderr.write('AGENT1_RANK17_NATIVE_SUMMARY '+
    JSON.stringify(result.paired.map(row=>({
      id:row.trial.id,
      physical:row.sourceDealMatch,
      control:{status:row.control.status,finished:row.control.nativeFinished,
        sourceStage1:row.control.sourceStage1PlayRoots,
        attacks:row.control.sourceAttackRoots,
        abilities:row.control.sourceAbilityRoots,
        sourceAttacks:row.control.sourceAttackDeclarations},
      natural:{status:row.naturalEvolution.status,
        finished:row.naturalEvolution.nativeFinished,
        sourceStage1:row.naturalEvolution.sourceStage1PlayRoots,
        attacks:row.naturalEvolution.sourceAttackRoots,
        abilities:row.naturalEvolution.sourceAbilityRoots,
        sourceAttacks:row.naturalEvolution.sourceAttackDeclarations}
    })))+'\n');
}

module.exports={VERSION,preflight,sourceWitness,sourceDealMatch,run};
