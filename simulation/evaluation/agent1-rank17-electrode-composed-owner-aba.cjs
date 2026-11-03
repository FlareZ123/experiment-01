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
const {gameplayWitness,PIN}=
  require('./agent1-rank17-electrode-owner-native-aba.cjs');
const {saveResult}=
  require('../twinleaf/agent3-rank26-compressor-settlement-prospective-v2.cjs');
const ADMISSION=require('../../results/aichi-2026/original-printed60-admission-v1.json');
const REG=require('../../results/aichi-2026/registrations/agent1-rank17-electrode-composed-owner-aba-20261103.json');
const VERSION='agent1-rank17-electrode-composed-native-owner-aba-v1';
/** @param {unknown} value @returns {string} */
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/** Freeze source identity, all 16 physical deals and 48 native arms. */
function preflight(){
  assert.equal(REG.schema,
    'agent1-rank17-composed-owner-ability-opportunity-aba-registration-v1');
  assert.equal(REG.enginePinnedCommit,PIN.split('/')[1]);
  assert.equal(REG.totalNativeArms,48);
  assert.equal(REG.nativeActionCap,180);
  assert.deepEqual(REG.nativePolicy.bothSeats,
    {naturalEvolutionRoot:true,publicContextSpecialEnergy:true});
  assert.deepEqual(REG.seeds,[
    1523304803,375363988,2128426800,1788683046,
    1150092985,1205137347,1332353683,2150778830
  ]);
  assert.deepEqual(REG.sourcePhysicalSeats,[0,1]);
  assert.equal(new Set(REG.seeds).size,8);
  assert.deepEqual(REG.arms,[
    'composed-owner-control','composed-owner-readonly-observer',
    'composed-owner-control-repeat'
  ]);
  for(const rank of [1,17]){
    const ledger=ADMISSION.rows.find(x=>x.rank===rank);
    assert.ok(ledger&&ledger.physicalCards===60);
    assert.equal(ledger.printed60Sha256,
      REG[rank===17?'sourcePrinted60Sha256':'opponentPrinted60Sha256']);
  }
  return REG;
}

/**
 * Same actual two-seat policy and source-only Compressor adapter all arms.
 * Only the owner-root **read-only** census toggles.
 * @param {object} request Complete native request.
 * @param {0|1} sourceSeat Original source physical player index.
 * @param {boolean} observed Run observer without action mutation.
 * @returns {object} Full arm including failures.
 */
function arm(request,sourceSeat,observed){
  let bridgeAudit=null;
  try{
    const root=work=>withActorOnlyRootPolicy(()=>{
      const bridge=withOwnerEarlyCompressorAfterPass(work,sourceSeat);
      bridgeAudit=bridge.audit;
      return bridge.result;
    },{
      naturalEvolutionRoot:true,
      publicContextSpecialEnergy:true,
      ...(observed?{rank17ElectrodeBombCensus:true}:{})
    });
    const wrapped=withCanonicalActorOnlyPolicy(
      ()=>runMatch(request),{root},{
        ...(observed?{ownerElectrodeBombCensus:true}:{})
      });
    const audit=observed?wrapped.audit.ownerElectrodeBombCensusAudit:null;
    if(observed)assert.ok(audit?.ownerRootDecisions>0,
      'No genuine source owner roots reached observer');
    const sourceRoots=wrapped.result.rootActionLedger?.filter(row=>
      row.playerSlot===sourceSeat)??[];
    const acceptedSourceCompressors=sourceRoots.filter(row=>
      row.action==='PlayCardAction'&&row.card==='Battle Compressor').length;
    return {
      error:null,
      witness:gameplayWitness(wrapped.result),
      sourceObserverAudit:audit,
      sourceBridgeAudit:bridgeAudit,
      sourceAcceptedCompressorRoots:acceptedSourceCompressors,
      sourceNativeRoots:sourceRoots,
      nativeSummary:{
        finished:wrapped.result.finished,
        firstTurnSlot:wrapped.result.firstTurnSlot,
        winner:wrapped.result.winner??null,
        actions:wrapped.result.actions??null,
        endReason:wrapped.result.endReason??null
      }
    };
  }catch(error){
    return {
      error:String(error?.stack??error),witness:null,
      sourceObserverAudit:null,sourceBridgeAudit:bridgeAudit,
      sourceAcceptedCompressorRoots:0,sourceNativeRoots:[],
      nativeSummary:null
    };
  }
}

/** No post-hoc selection: every preregistered source seat/seed/arm retained. */
function run(){
  preflight();
  initializeCards();
  const plan=planAichi(17,{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  });
  const source=plan.candidate.cards;
  const opponent=plan.opponents.find(x=>x.rank===1)?.cards;
  assert.equal(source?.length,60);assert.equal(opponent?.length,60);
  const groups=[];
  for(const seed of REG.seeds){
    for(const sourceSeat of REG.sourcePhysicalSeats){
      const request={
        deckA:sourceSeat===0?source:opponent,
        deckB:sourceSeat===1?source:opponent,
        seed,maxActions:REG.nativeActionCap,
        strictPromptValidation:true,
        isolatePolicyRandomness:true,
        captureDecisionTrace:true,
        captureInitialFullPhysicalDeal:true,
        battleCompressorPositiveSelectionCorrection:true,
        electrodeGXEnergyCorrection:true,
        electroRainDamageCorrection:true,
        rank4RaichuCompressorSeat:sourceSeat,
        label:VERSION+'-original-source-seat-'+sourceSeat+'-seed-'+seed
      };
      const arms=REG.arms.map((name,index)=>({
        name,...arm(request,sourceSeat,index===1)
      }));
      const digests=arms.map(x=>x.witness===null?null:hash(x.witness));
      const physical=arms.map(x=>
        x.witness?.fullPhysicalDeal?.digestSha256??null);
      const complete=arms.every(x=>x.error===null);
      groups.push({
        seed,sourceSeat,
        complete,
        fingerprints:physical,gameplayHashes:digests,
        physicalABAMatched:complete&&physical[0]!==null&&
          physical.every(x=>x===physical[0]),
        fullGameplayABAMatched:complete&&digests.every(x=>x===digests[0]),
        sourceCompressorNativeActionsByArm:
          arms.map(x=>x.sourceAcceptedCompressorRoots),
        arms
      });
    }
  }
  const actual=groups.map(g=>g.arms[1].sourceObserverAudit).filter(Boolean);
  const add=key=>actual.reduce((sum,x)=>sum+(x[key]??0),0);
  const sourceCompressorItems=groups.reduce(
    (n,g)=>n+g.arms[1].sourceAcceptedCompressorRoots,0);
  return {
    version:VERSION,enginePin:PIN,registration:REG,
    registrationHash:hash(REG),
    sourceEngineDeckHash:hash(source),
    opponentEngineDeckHash:hash(opponent),
    inputSubstitutions:{
      source:plan.candidate.substitutions,
      opponent:plan.opponents.find(x=>x.rank===1)?.substitutions??[]
    },
    summary:{
      prospectiveIndependentSourceDealGroups:groups.length,
      attemptedNativeArms:groups.length*REG.arms.length,
      nativeErrorArms:groups.flatMap(g=>g.arms).filter(a=>a.error!==null).length,
      identicalFullGameplayABAGroups:groups.filter(g=>g.fullGameplayABAMatched).length,
      identicalFullPhysicalABAGroups:groups.filter(g=>g.physicalABAMatched).length,
      sourceCompressorNativeItemRootsInObserverArms:sourceCompressorItems,
      sourceOwnerRootObservationsBothSeats:add('ownerRootDecisions'),
      sourceElectrodeVisibleRoots:add('electrodeInPlayRoots'),
      sourceRaichuVisibleRoots:add('raichuRecipientInPlayRoots'),
      sourceBothLinePokemonVisibleRoots:add('lineCoPresentRoots'),
      sourceLineZeroDiscardEnergyRoots:add('lineWithZeroDiscardEnergyRoots'),
      sourceLinePartialOneToFourEnergyRoots:add('lineWithOneToFourDiscardEnergyRoots'),
      sourceLineFullFivePlusEnergyRoots:add('lineWithFivePlusDiscardEnergyRoots'),
      sourcePhysicallyNecessaryLineRoots:add('physicalNecessaryRoots'),
      policySelectedExtraEnergyBombRoots:add('sourceAbilityRootsActuallySelected'),
      competitiveQualifiedGames:0,
      qualification:'NO: source-specific development bridge, generic prompt fallbacks, 25-minute clock absent'
    },
    groups
  };
}
if(require.main===module){
  const result=run();
  saveResult(path.resolve(process.cwd(),
    'agent1-rank17-electrode-composed-owner-aba.json'),result);
  process.stdout.write('AGENT1_ELECTRODE_COMPOSED_ABA '+
    JSON.stringify(result.summary)+'\n');
  if(result.summary.nativeErrorArms>0||
     result.summary.identicalFullGameplayABAGroups!==result.groups.length||
     result.summary.identicalFullPhysicalABAGroups!==result.groups.length)
    process.exitCode=1;
}
module.exports={VERSION,REG,preflight,arm,run};
