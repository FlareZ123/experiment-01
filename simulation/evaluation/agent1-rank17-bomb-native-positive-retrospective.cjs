'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=require('../twinleaf/headless.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withActorOnlyRootPolicy}=
  require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {withOwnerEarlyCompressorAfterPass}=
  require('../twinleaf/agent1-raichu-actor-compressor-bridge.cjs');
const {withSourceBombAfterPass}=
  require('../twinleaf/agent1-rank17-bomb-native-afterpass.cjs');
const {gameplayWitness,PIN}=
  require('./agent1-rank17-electrode-owner-native-aba.cjs');
const {saveResult}=
  require('../twinleaf/agent3-rank26-compressor-settlement-prospective-v2.cjs');
const ADMISSION=require('../../results/aichi-2026/original-printed60-admission-v1.json');
const REG=require('../../results/aichi-2026/registrations/agent1-rank17-bomb-native-positive-retrospective-20261103.json');
const VERSION='agent1-rank17-bomb-native-retrospective-paired-source-v1';
/** @param {unknown} v */
const sha=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');

/** Verify that this explicitly postselected one physical deal stays fixed. */
function preflight(){
  assert.equal(REG.schema,
    'agent1-rank17-source-bomb-ability-retrospective-native-v1');
  assert.equal(REG.cohort,
    'RETROSPECTIVE positive source owner-root from independently archived run 41668094303');
  assert.equal(REG.nativeEnginePin,PIN.split('/')[1]);
  assert.equal(REG.seed,2128426800);
  assert.equal(REG.sourcePhysicalSeat,1);
  assert.equal(REG.nativeActionCap,180);
  assert.equal(REG.abilityTrigger.minPhysicallyDiscardedEnergyCards,3);
  assert.deepEqual(REG.arms,[
    'same-deal-composed-owner-control',
    'same-deal-composed-owner-source-bomb-afterpass-ability-probe'
  ]);
  for(const rank of [1,17]){
    const ledger=ADMISSION.rows.find(r=>r.rank===rank);
    assert.equal(ledger.physicalCards,60);
    assert.equal(ledger.printed60Sha256,
      REG[rank===17?'sourcePrinted60Sha256':'opponentPrinted60Sha256']);
  }
  return REG;
}

/**
 * Run one genuine Store match with the SAME source-only Compressor bridge in
 * both conditions. The second condition injects at most one native Ability
 * on a real source remaining Pass in an already-disclosed favorable deal.
 * @param {object} request Authentic native original-deck request.
 * @param {boolean} treatment Force native probe only if current public
 *   source-relevant preconditions and actual after-bridge Pass hold.
 * @returns {object} Complete arm with mechanics evidence or actual errors.
 */
function arm(request,treatment){
  let bridgeAudit=null,bombAudit=null;
  try{
    const root=work=>withActorOnlyRootPolicy(()=>{
      const bridge=withOwnerEarlyCompressorAfterPass(()=>{
        const bomb=withSourceBombAfterPass(work,REG.sourcePhysicalSeat,{
          enabled:treatment
        });
        bombAudit=bomb.audit;
        return bomb.result;
      },REG.sourcePhysicalSeat);
      bridgeAudit=bridge.audit;
      return bridge.result;
    },{
      naturalEvolutionRoot:true,publicContextSpecialEnergy:true
    });
    const wrapped=withCanonicalActorOnlyPolicy(()=>runMatch(request),{root});
    const native=wrapped.result;
    return {
      error:null,nativeWitness:gameplayWitness(native),
      nativeFinished:native.finished,
      nativeWinner:native.winner??null,
      nativeEndReason:native.endReason??null,
      nativeActionCount:native.actions??null,
      allSourceRoots:native.rootActionLedger?.filter(row=>
        row.playerSlot===REG.sourcePhysicalSeat)??[],
      allNativeRoots:native.rootActionLedger,
      bridgeAudit,bombAudit,
      competitivelyQualifiedGame:false
    };
  }catch(error){
    return {error:String(error?.stack??error),nativeWitness:null,
      allSourceRoots:[],bridgeAudit,bombAudit,
      competitivelyQualifiedGame:false};
  }
}
function run(){
  preflight();
  initializeCards();
  const plan=planAichi(17,{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  });
  const source=plan.candidate.cards,
    opponent=plan.opponents.find(x=>x.rank===1)?.cards;
  assert.equal(source?.length,60);assert.equal(opponent?.length,60);
  const request={
    deckA:opponent,deckB:source,
    seed:REG.seed,maxActions:REG.nativeActionCap,
    strictPromptValidation:true,isolatePolicyRandomness:true,
    captureDecisionTrace:true,captureInitialFullPhysicalDeal:true,
    battleCompressorPositiveSelectionCorrection:true,
    electrodeGXEnergyCorrection:true,electroRainDamageCorrection:true,
    rank4RaichuCompressorSeat:REG.sourcePhysicalSeat,
    label:VERSION
  };
  const control=arm(request,false);
  const treatment=arm(request,true);
  const complete=control.error===null&&treatment.error===null;
  const initialPhysicalMatched=complete&&
    sha(control.nativeWitness.fullPhysicalDeal)===
    sha(treatment.nativeWitness.fullPhysicalDeal);
  const result={
    version:VERSION,registeredBeforeNative:true,registration:REG,
    registrationHash:sha(REG),
    sourceNativeDeckHash:sha(source),
    opponentNativeDeckHash:sha(opponent),
    inputSubstitutions:{
      source:plan.candidate.substitutions,
      opponent:plan.opponents.find(x=>x.rank===1)?.substitutions??[]
    },
    summary:{
      explicitlyRetrospectiveSourceDeals:1,attemptedNativeArms:2,
      nativeErrorArms:[control,treatment].filter(x=>x.error!==null).length,
      initialPhysicalDealMatched:initialPhysicalMatched,
      identicalGameplayWitness:complete&&
        sha(control.nativeWitness)===sha(treatment.nativeWitness),
      originalSourceCompressorAcceptedControl:
        control.bridgeAudit?.accepted??0,
      originalSourceCompressorAcceptedProbe:
        treatment.bridgeAudit?.accepted??0,
      abilityProposedByProbe:treatment.bombAudit?.optedNativeAbilityRootProposals??0,
      nativeAbilityStoreAccepted:treatment.bombAudit?.nativeAbilityActionAccepted??0,
      nativeAbilityStoreRejected:treatment.bombAudit?.nativeAbilityActionRejected??0,
      abilityPublicSnapshots:treatment.bombAudit?.publicSnapshots?.length??0,
      competitivelyQualifiedGames:0,
      winRateInference:'NONE: deliberately hindsight-selected mechanics stress test'
    },
    control,treatment
  };
  return result;
}
if(require.main===module){
  const data=run();
  saveResult(path.resolve(process.cwd(),
    'agent1-rank17-bomb-native-positive-retrospective.json'),data);
  process.stdout.write('AGENT1_RANK17_BOMB_MECHANISM '+
    JSON.stringify(data.summary)+'\n');
  if(data.summary.nativeErrorArms>0||!data.summary.initialPhysicalDealMatched)
    process.exitCode=1;
}
module.exports={VERSION,REG,preflight,arm,run};
