'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {preflight}=require('./agent2-rank9-special-guzma-retro-native.cjs');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const {actorObservation}=
  require('../twinleaf/actor-observation-contract.cjs');
const {isGuzma}=require('../twinleaf/agent2-held-guzma-mobility-frontier.cjs');
const {publicSpecialAttackPayable}=
  require('../twinleaf/agent17-public-context-special-energy.cjs');
const {chooseRank9SpecialFundedGuzma}=
  require('../twinleaf/agent2-rank9-special-guzma-frontier.cjs');
const {withGuzmaPublicObstacleAudit}=
  require('../twinleaf/agent31-guzma-public-obstacle-audit.cjs');
const {publicCatalog}=
  require('../twinleaf/agent43-guzma-prompt-continuation.cjs');
const VERSION='agent2-rank9-real-owner-public-guzma-exposure-v1';

/**
 * Classify only a live, detached, owner-public root. This reads no opponent
 * hand/deck/prize card identities. Every output is a yes/no affordance,
 * never a claim that an Action was accepted by the native Store.
 * @param {object} view
 * @param {object} catalog
 * @returns {object}
 */
function classifyRank9PublicOpportunity(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,opp=view.opponentPublic,r=view.ownTurnResources;
  const mega=own.bench?.find(x=>x?.printing==='Mega Absol ex M1L');
  const claw=mega?.attacks?.find(x=>x.name==='Claw of Darkness');
  const targets=opp.bench?.filter(x=>x?.name==='Trevenant & Dusknoir-GX')??[];
  const held=view.ownHand.some(isGuzma);
  const types=mega?.printed?.types??[];
  const hasMatchingDarkWeakness=targets.some(target=>
    target.printed?.weakness?.some(x=>
      types.includes(x.type)&&[2,'×2','x2','X2'].includes(x.value)));
  const hasSpecial=mega?.energies?.some(x=>
    catalog.specialEnergies?.has(x))===true;
  const costPayable=Boolean(mega&&claw&&
    publicSpecialAttackPayable(view,catalog,mega,claw));
  const openSupporter=r?.supporterPlayedTurn===0&&
    r?.supporterPlayLocked!==true&&
    own.publicTurnRestrictions?.supporterPlayLocked!==true&&
    (own.resolvingSupporter?.length??0)===0;
  const plan=chooseRank9SpecialFundedGuzma(view,catalog);
  return {
    turn:view.globalTurn,seat:view.actorSeat,
    heldGuzma:held,megaOnBench:Boolean(mega),
    specialOnMega:hasSpecial,
    megaEnergyCount:mega?.energies?.length??0,
    clawPresent:Boolean(claw),clawPubliclyPayable:costPayable,
    trevDusknoirOnOpponentBench:targets.length>0,
    targetDarkWeakness:hasMatchingDarkWeakness,
    supporterQuotaOpen:openSupporter,
    fullNominalProposal:plan!==null,
    plan:plan?{benchIndex:plan.benchIndex,
      opponentBenchIndex:plan.opponentBenchIndex,
      attackName:plan.attackName}:null,
    ownerVisibleOnly:true
  };
}
/** @param {{runDevelopment?:Function,pinNative?:boolean}} [deps] */
function run(deps={}){
  const {trials,base}=preflight();
  const frozen=require('./agent41-frozen-bilateral-development-v1.cjs');
  frozen.assertNoUnreviewedAmbientAgentEnvironment(process.env,profile);
  if(deps.pinNative!==false)frozen.assertPinnedNativeStore(
    require('node:path').resolve(__dirname,'../..'),profile);
  const runner=deps.runDevelopment??require('./agent41-bilateral-v2-development.cjs')
    .runDevelopment;
  const previous={};
  for(const [key,value] of Object.entries(profile.injectedResearchEnvironment)){
    previous[key]=process.env[key];process.env[key]=value;
  }
  const modes={};
  try{
    for(const mode of ['control','treatment']){
      const catalog=publicCatalog();
      const counters={
        observedOwnerRoots:0,heldGuzmaRoots:0,
        megaBenchRoots:0,megaAndHeldRoots:0,
        megaHeldAndTargetRoots:0,fullNominalProposalRoots:0,
        firstGuzmaTurn:null
      };
      const samples=[];
      const observer=(state,seat)=>{
        const view=actorObservation(state,seat);
        const root=classifyRank9PublicOpportunity(view,catalog);
        counters.observedOwnerRoots++;
        if(root.heldGuzma){
          counters.heldGuzmaRoots++;
          if(counters.firstGuzmaTurn===null)
            counters.firstGuzmaTurn=view.globalTurn;
        }
        if(root.megaOnBench)counters.megaBenchRoots++;
        if(root.megaOnBench&&root.heldGuzma)counters.megaAndHeldRoots++;
        if(root.megaOnBench&&root.heldGuzma&&
           root.trevDusknoirOnOpponentBench)
          counters.megaHeldAndTargetRoots++;
        if(root.fullNominalProposal)counters.fullNominalProposalRoots++;
        if(root.megaOnBench&&(root.heldGuzma||root.fullNominalProposal)&&
           samples.length<128)samples.push(root);
        return view;
      };
      try{
        const withReadOnlyAudit=withGuzmaPublicObstacleAudit(
          ()=>runner({...base,
            actorRank9SpecialFundedGuzma:mode==='treatment',
            registeredTrials:trials,
            registeredFrameName:VERSION+'-'+mode,
            allowAdditionalOriginalSourceRanks:true
          }),
          {observe:observer,getCatalog:()=>catalog}
        );
        const rows=withReadOnlyAudit.result.rows??[];
        assert.equal(rows.length,4);
        modes[mode]={
          counters,samples,
          observerAudit:withReadOnlyAudit.audit,
          nativeRows:rows.map(r=>({
            trial:r.trial.id,
            sourceDealFingerprint:r.sourceDealFingerprint??null,
            status:r.status??null,finished:r.finished??null,
            endReason:r.endReason??null,
            actorTypedIntentCounts:
              r.actorOnlyDecisionCoverage?.detailedComponentAudits
                ?.root?.typedIntentCounts??
              r.actorOnlyDecisionCoverage?.typedIntentCounts??null,
            sourceGuzmaRoots:(r.rootActionLedger??[]).filter(x=>
              x.playerSlot===(r.trial.candidateSlot==='A'?1:0)&&
              x.action==='PlayCardAction'&&
              /^Guzma [A-Z0-9]/.test(x.card??'')).length
          }))
        };
      }catch(error){
        modes[mode]={
          counters,samples,batchError:String(error?.stack??error),
          rowsQualified:0
        };
      }
    }
  }finally{
    for(const [k,v] of Object.entries(previous)){
      if(v===undefined)delete process.env[k];else process.env[k]=v;
    }
  }
  return {
    schema:VERSION,sourceRank:9,
    registeredOriginalPhysicalSeedGroups:trials.map(t=>t.id),
    allStatesActingOwnerVisible:true,
    actualMatchActionsModifiedByObserver:false,
    modes,competitiveQualifiedGames:0,
    conclusiveActionChainObserved:false
  };
}
if(require.main===module){
  const result=process.argv.includes('--inspect-only')?
    {schema:VERSION,registration:preflight(),inspectOnly:true}:run();
  const output=process.env.AICHI_RANK9_GUZMA_EXPOSURE_OUTPUT;
  if(output){
    const temp=output+'.tmp-'+process.pid;
    fs.writeFileSync(temp,JSON.stringify(result,null,2)+'\n');
    fs.renameSync(temp,output);
    process.stdout.write(JSON.stringify({
      schema:VERSION,
      modes:Object.fromEntries(Object.entries(result.modes).map(([mode,x])=>
        [mode,{counters:x.counters,batchError:x.batchError??null,
          sampleTail:x.samples?.slice(-8),nativeRows:x.nativeRows}])),
      competitiveQualifiedGames:0},null,2)+'\n');
  }else process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
module.exports={VERSION,classifyRank9PublicOpportunity,run};
