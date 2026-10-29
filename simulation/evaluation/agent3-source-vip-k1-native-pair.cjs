'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const {executeDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withCommonVipPassBridge}=
  require('../twinleaf/agent7-common-vip-pass-bridge.cjs');
const {chooseOwnerEvolutionVipBasics}=
  require('../twinleaf/agent3-owner-evolution-vip-search.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {loadNewMoonCandidate}=
  require('../../scripts/aichi-new-moon-candidate.cjs');

/**
 * Retrospective known VIP-in-hand original rank11 source deal. This is a
 * mechanism comparison, never a prospective deck-strength estimate.
 * @returns {{trial:object,prepared:Map<string,object>,options:object}}
 */
function frozenInputs(){
  const scout=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json'),'utf8'));
  assert.equal(scout.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(scout.seeds['11'].A[0],3149897025);
  const id='champion-reference';
  const trial={rank:11,repeat:0,candidateSlot:'A',candidateId:id,
    seed:scout.seeds['11'].A[0],id:'11:0:A:'+id};
  const roster=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const source=roster.decks.find(d=>d.rank===11);
  const champion=roster.decks.find(d=>d.rank===1);
  assert.ok(source&&champion);
  const candidates=new Map([
    ['champion-reference',{label:'champion-reference',cards:champion.cards}],
    ['new-moon-lockbreaker-v1',
      {label:'new-moon-lockbreaker-v1',cards:loadNewMoonCandidate().cards}]
  ].map(([key,manifest])=>[key,{plan:planAichi(manifest,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true
  })}]));
  return {trial,prepared:candidates,options:scout.frozenRunOptions};
}

/**
 * Run the original canonical runner, adding the VIP target choice only
 * through the existing opt-in owner-only native source bridge.
 * @param {'baseline'|'legacy-vip'|'evolution-vip'} variant
 * @param {ReturnType<typeof frozenInputs>} input
 * @returns {object}
 */
function runVariant(variant,input){
  const {trial,prepared,options}=input;
  const sourceSeat=1;
  const executor=()=>executeDevelopment(trial,prepared,{
    mandatoryOptionFallback:options.mandatoryOptionFallback,
    paperSupporterQuota:options.paperSupporterQuota,
    paperFullBenchCallForFamily:options.paperFullBenchCallForFamily,
    paperSameTargetAttachEnergy:options.paperSameTargetAttachEnergy,
    nativeAcceptedTargets:options.nativeAcceptedTargets,
    registeredTrial:false
  });
  let vipAudit=null;
  const withVip=()=>{
    if(variant==='baseline')return executor();
    const intervention=withCommonVipPassBridge(sourceSeat,executor,
      variant==='evolution-vip'?{
        chooseBasics:chooseOwnerEvolutionVipBasics
      }:{});
    vipAudit=intervention.audit;
    return intervention.result;
  };
  const observed=withCanonicalActorOnlyPolicy(withVip,{
    pokemon:execute=>
      require('../twinleaf/agent8-actor-only-choose-pokemon.cjs')
        .withActorOnlyChoosePokemon(execute,{
          choose:require('../twinleaf/agent1-charged-promotion-choice.cjs')
            .chooseChargedOwnPromotion
        })
  },{
    ownerSingleSearch:options.actorOnlySingleSearch,
    genericFallbackAttribution:options.actorGenericFallbackAttribution,
    actorHandDiscard:options.actorHandDiscard,
    actorChoosePokemon:options.actorChoosePokemon
  });
  const row=observed.result;
  const vipRoots=(row.rootActionLedger??[]).filter(rootAction=>
    rootAction.playerSlot===sourceSeat &&
    rootAction.action==='PlayCardAction' &&
    typeof rootAction.card==='string' &&
    rootAction.card.includes('Battle VIP Pass'));
  return {variant,status:'native-returned',trial:row.trial.id,
    sourceSeat,sourceDealFingerprint:row.sourceDealFingerprint,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint,
    actualStarterSeat:row.actualStarterSeat,
    starterVerified:row.verifiedFirstTurn,
    firstSourceOwnTurn:row.sourceFirstOwnedAffordances??null,
    vipAudit,sourceVipAcceptedRoots:vipRoots,
    sourceVipAcceptedCount:vipRoots.length,
    nativeSourceAudit:row.sourceAudit,
    actorPolicyVersion:observed.audit.version,
    finished:row.finished,winner:row.winner,
    finalPrizeCounts:row.finalPrizeCounts??null,
    rootActionCount:row.rootActionCount,
    rootActionLedgerSha256:row.rootActionLedgerSha256,
    lastRootActions:(row.rootActionLedger??[]).slice(-5),
    competitiveGameQualified:false};
}

/** @returns {object} */
function runComparison(){
  const frozen=frozenInputs(),arms=[];
  for(const variant of ['baseline','legacy-vip','evolution-vip']){
    try{arms.push(runVariant(variant,frozen));}
    catch(error){arms.push({variant,status:'native-error',
      message:String(error?.message??error),
      name:error?.name??null,competitiveGameQualified:false});}
  }
  const completed=arms.filter(a=>a.status==='native-returned');
  if(completed.length>1){
    for(const row of completed.slice(1)){
      assert.equal(row.sourceDealFingerprint,completed[0].sourceDealFingerprint,
        'K0 source physical deal must remain fixed across policies');
      assert.equal(row.actualStarterSeat,completed[0].actualStarterSeat,
        'Actual physical starter changed between policy arms');
      assert.equal(row.fullPhysicalDealFingerprint,
        completed[0].fullPhysicalDealFingerprint,
        'Original two-seat full setup changed between policies');
    }
  }
  return {schema:'agent3-vip-k1-retrospective-three-arm-v1',
    sourceEvent:'Aichi Open League 2026 rank11 original printed 60',
    opponent:'unchanged rank1 Shadow Rider champion reference',
    frozenSeed:frozen.trial.seed,enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    priorSelection:'Source first-turn VIP already known from Agent1 original scout audit',
    errors:arms.filter(a=>a.status==='native-error').length,
    arms,competitiveQualifiedGames:0,
    caveat:'Retrospectively selected development fixture, native Store acceptance and target verification still require separate scrutiny; no field win-rate inference.'};
}

if(require.main===module){
  const result=runComparison();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  assert.equal(result.errors,0,'All native comparison arms must complete; failures preserved in JSON');
}
module.exports={frozenInputs,runVariant,runComparison};
