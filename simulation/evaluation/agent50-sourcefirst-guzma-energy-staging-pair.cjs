'use strict';

const assert=require('node:assert/strict');
const {withAcceptedTargetWitness}=
  require('../twinleaf/native-accepted-target-store-observer.cjs');
const {firstPhysicalTargetDifference}=
  require('../twinleaf/native-accepted-target-sidecar.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {sourceFirstPressureTrials,executeDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {loadNewMoonCandidate}=
  require('../../scripts/aichi-new-moon-candidate.cjs');
const {compact,SOURCE_DEAL}=
  require('./agent50-sourcefirst-stranded-marnie-native-pair.cjs');

const CONTROL_GUZMA_LEDGER='b6ccc668fa4bf99058e57606e4efe7b01e629a9c7505cb2f897b9ea1b6357468';

/** @returns {object} Development-only original Store control/treatment pair. */
function run(seed=482443328){
  const candidate=loadNewMoonCandidate();
  const plan=planAichi({label:candidate.id,cards:candidate.cards},{
    allowEquivalentBasicEnergies:true,allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  assert.equal(plan.candidate.cards.length,60);
  const registered=sourceFirstPressureTrials().find(x=>
    x.rank===11&&x.candidateId==='new-moon-lockbreaker-v1');
  assert.ok(registered);
  const row={...registered,seed,id:'agent50-source-energy-'+seed};
  assert.equal(row.candidateSlot,'B');
  const decks=new Map([['new-moon-lockbreaker-v1',{plan}]]);
  const originalGuzma=process.env.AGENT50_STRANDED_GUZMA_DEV;
  const originalGuzmaSeat=process.env.AGENT50_STRANDED_GUZMA_OWNER_SEAT;
  const originalMarnie=process.env.AGENT50_STRANDED_MARNIE_DEV;
  const originalMarnieSeat=process.env.AGENT50_STRANDED_MARNIE_OWNER_SEAT;
  const originalEnergy=process.env.AGENT50_GUZMA_ENERGY_STAGING_DEV;
  const originalEnergySeat=process.env.AGENT50_GUZMA_ENERGY_STAGING_OWNER_SEAT;
  const arms=[];
  try{
    process.env.AGENT50_STRANDED_MARNIE_DEV='true';
    process.env.AGENT50_STRANDED_MARNIE_OWNER_SEAT='0';
    process.env.AGENT50_STRANDED_GUZMA_OWNER_SEAT='0';
    process.env.AGENT50_STRANDED_GUZMA_DEV='true';
    process.env.AGENT50_GUZMA_ENERGY_STAGING_OWNER_SEAT='0';
    for(const stageEnergy of [false,true]){
      process.env.AGENT50_GUZMA_ENERGY_STAGING_DEV=stageEnergy?'true':'false';
      try{
        const execute=()=>executeDevelopment(row,decks,{
          mandatoryOptionFallback:true,paperSupporterQuota:true,
          garbotoxinWindow:true
        });
        const witnessEnabled=process.env.AGENT8_AGENT50_PHYSICAL_TARGET_DEV==='true';
        const executeObserved=witnessEnabled?()=>{
          const witness=withAcceptedTargetWitness(execute);
          return {...witness.result,agent8AcceptedTargetSidecar:witness.audit};
        }:execute;
        const observed=withCanonicalActorOnlyPolicy(executeObserved,{},{
          ownerSingleSearch:true,genericFallbackAttribution:true,
          actorHandDiscard:true,actorChoosePokemon:true
        });
        arms.push({enabled:stageEnergy,
          result:{...observed.result,actorAudit:observed.audit}});
      }catch(error){
        arms.push({enabled:stageEnergy,result:{
          status:'engine-error',error:String(error?.stack??error).slice(0,7000)}});
      }
    }
  }finally{
    for(const [name,saved] of [
      ['AGENT50_STRANDED_GUZMA_DEV',originalGuzma],
      ['AGENT50_STRANDED_GUZMA_OWNER_SEAT',originalGuzmaSeat],
      ['AGENT50_STRANDED_MARNIE_DEV',originalMarnie],
      ['AGENT50_STRANDED_MARNIE_OWNER_SEAT',originalMarnieSeat],
      ['AGENT50_GUZMA_ENERGY_STAGING_DEV',originalEnergy],
      ['AGENT50_GUZMA_ENERGY_STAGING_OWNER_SEAT',originalEnergySeat]]){
      if(saved===undefined)delete process.env[name];
      else process.env[name]=saved;
    }
  }
  const [control,treatment]=arms.map(({result})=>{
    const c=compact(result);
    const roots=result.rootActionLedger??[];
    const rootAudit=result.actorAudit?.detailedComponentAudits?.root??{};
    const choosePokemon=result.actorAudit?.detailedComponentAudits?.choosePokemon??{};
    return {
      ...c,
      ...(result.agent8AcceptedTargetSidecar?{
        physicalTargetSidecar:result.agent8AcceptedTargetSidecar}:{}),
      actualGuzmaRoots:roots.filter(x=>x.playerSlot===0&&
        x.action==='PlayCardAction'&&x.card==='Guzma')
        .map(x=>({ordinal:x.actionOrdinal,turn:x.turnBefore})),
      guzmaPhysicalReceipts:(rootAudit.nativeRootAcceptances??[])
        .filter(x=>x.kind==='play-stranded-guzma'),
      sourceNativePokemonPromptChoices:(choosePokemon.boundedSelections??[])
        .filter(x=>x.seat===0),
      sourceEnergyReceipts:(rootAudit.nativeRootAcceptances??[])
        .filter(x=>x.kind==='attach-basic-energy'&&x.seat===0),
      sourcePostT7Roots:roots.filter(x=>
        x.playerSlot===0&&x.turnBefore>=7&&x.turnBefore<=19)
    };
  });
  const a=arms[0].result.rootActionLedger??[],
    b=arms[1].result.rootActionLedger??[];
  let prefix=0;
  while(prefix<a.length&&prefix<b.length&&
    JSON.stringify(a[prefix])===JSON.stringify(b[prefix]))prefix++;
  return {
    schema:'agent50-guzma-future-energy-staging-paired-original-store-v1',
    registration:'results/aichi-2026/registrations/agent50-guzma-energy-route-counterfactual-20261021.md',
    sourceSeed:seed,rank:11,sourceSeat:0,candidateSeat:1,
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    unchangedNativePrefixCount:prefix,
    ...(control.physicalTargetSidecar&&treatment.physicalTargetSidecar?{
      firstPhysicalTargetDifference:firstPhysicalTargetDifference(
        control.physicalTargetSidecar,treatment.physicalTargetSidecar)
    }:{}),
    firstDifference:{control:a[prefix]??null,treatment:b[prefix]??null},
    sourceDealEqual:control.sourceDealFingerprint!==null&&
      control.sourceDealFingerprint===treatment.sourceDealFingerprint,
    expectedOriginalSourceDeal:seed===482443328?SOURCE_DEAL:null,
    control,treatment,
    attemptedArms:2,competitiveQualifiedGames:0,winRateCertified:false,
    caveat:'Retrospectively selected one source-first physical deal; source prompt chooser selects the first native-legal visible Pokémon and is not known to be competent'
  };
}
if(require.main===module){
  const report=run();
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  assert.equal(report.control.sourceDealFingerprint,SOURCE_DEAL);
  assert.equal(report.control.rootActionLedgerSha256,CONTROL_GUZMA_LEDGER,
    'Energy staging control did not reproduce prior exact Guzma game');
  assert.equal(report.sourceDealEqual,true);
  assert.ok(report.unchangedNativePrefixCount>45,
    'Energy staging changed before the established Marnie source turn');
  if(process.env.AGENT8_AGENT50_PHYSICAL_TARGET_DEV==='true'){
    const control=report.control.physicalTargetSidecar;
    const treatment=report.treatment.physicalTargetSidecar;
    assert.ok(control&&treatment,'Both native accepted-target audits required');
    assert.equal(control.rootOrdinalLinked,true);
    assert.equal(treatment.rootOrdinalLinked,true);
    assert.equal(control.targetUnobserved,0);
    assert.equal(treatment.targetUnobserved,0);
    assert.deepEqual(report.firstPhysicalTargetDifference,{
      status:'different',index:report.firstPhysicalTargetDifference.index,
      firstOrdinal:49,secondOrdinal:49
    },'First authentic target-bearing divergence must be rank11 source T7 root49');
    for(const ordinal of [49,64]){
      const original=control.events.find(e=>e.rootActionOrdinal===ordinal);
      const intervention=treatment.events.find(e=>e.rootActionOrdinal===ordinal);
      assert.ok(original&&intervention,
        'Missing an accepted original Store Energy destination root '+ordinal);
      assert.equal(original.declared.kind,'play-card');
      assert.equal(intervention.declared.kind,'play-card');
      assert.match(original.declared.ownerHandPrinting,/Darkness Energy/);
      assert.equal(original.declared.target.slot!==intervention.declared.target.slot,true,
        'Matched native Energy card must have a changed physical target');
      assert.ok(original.publicBoardChanges?.length>0);
      assert.ok(intervention.publicBoardChanges?.length>0);
    }
  }
}
module.exports={run,CONTROL_GUZMA_LEDGER};
