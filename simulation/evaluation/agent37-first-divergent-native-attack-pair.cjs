'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const headless=require('../twinleaf/headless.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {candidateAttackSettlement}=
  require('./agent37-candidate-attack-settlement.cjs');
const {firstPhysicalTargetDifference}=
  require('../twinleaf/native-accepted-target-sidecar.cjs');

const VERSION='agent37-first-divergent-native-attack-pair-v1';
const ROOT_SHA=rows=>createHash('sha256').update(JSON.stringify(rows))
  .digest('hex');

/**
 * Find the first accepted Store action whose complete public ledger row differs.
 * All earlier native successful actions must be byte-equivalent.
 *
 * @param {object[]} baseline Native accepted root ledger.
 * @param {object[]} treatment Native accepted root ledger.
 * @returns {{ordinal:number,baseline:object|null,treatment:object|null}|null}
 */
function firstRootDivergence(baseline,treatment){
  assert.ok(Array.isArray(baseline)&&Array.isArray(treatment));
  for(let i=0;i<Math.max(baseline.length,treatment.length);i++){
    if(JSON.stringify(baseline[i])===JSON.stringify(treatment[i]))continue;
    return {ordinal:i,baseline:baseline[i]??null,
      treatment:treatment[i]??null};
  }
  return null;
}

/**
 * Compare only *accepted* native target-bearing roots, at original root
 * ordinals. An earlier physical target choice defeats causal isolation of a
 * later legacy label divergence. Prompt choices remain outside this witness.
 * @param {object} control Canonical trial with optional target-sidecar.
 * @param {object} treatment Paired canonical trial.
 * @param {object|null} labelDifference First root-label divergence.
 * @returns {object} Scoped physical target comparison with fail-closed status.
 */
function acceptedTargetContrast(control,treatment,labelDifference){
  const left=control?.nativeAcceptedTargetSidecar;
  const right=treatment?.nativeAcceptedTargetSidecar;
  const comparison=firstPhysicalTargetDifference(left,right);
  const index=comparison.index;
  const a=Number.isSafeInteger(index)?left?.events?.[index]:null;
  const b=Number.isSafeInteger(index)?right?.events?.[index]:null;
  const ordinalA=a?.rootActionOrdinal??null;
  const ordinalB=b?.rootActionOrdinal??null;
  const linked=Number.isSafeInteger(ordinalA)&&
    Number.isSafeInteger(ordinalB);
  const beforeLabel=Boolean(comparison.status==='different'&&
    (labelDifference===null||(linked&&
      Math.min(ordinalA,ordinalB)<labelDifference.ordinal)));
  return {
    ...comparison,
    baseline:{sha256:left?.sha256??null,
      acceptedTargetRoots:left?.observedTargetActions??null,
      rootOrdinalLinked:left?.rootOrdinalLinked??null},
    treatment:{sha256:right?.sha256??null,
      acceptedTargetRoots:right?.observedTargetActions??null,
      rootOrdinalLinked:right?.rootOrdinalLinked??null},
    firstDifferingAcceptedRootOrdinals:comparison.status==='different'?
      {baseline:ordinalA,treatment:ordinalB}:null,
    observedPhysicalTargetChangeBeforeRootLabelChange:beforeLabel,
    firstObservedPhysicalDifferenceIsCausallyPriorToLabel:beforeLabel,
    evidenceScope:'Accepted PlayCardAction / RetreatAction targets only; typed prompts and hidden state unobserved'
  };
}

/**
 * Retrospectively describe the complete physical attack effect at a specific
 * root, using public Store observations. No hidden source hand or Prize card
 * identities enter this audit or the players' decisions.
 *
 * @param {object} game Genuine Store output.
 * @param {0|1} physicalSeat Acting player's seat.
 * @param {number} ordinal Native root action ordinal.
 * @returns {object|null}
 */
function sourceAttackAtRoot(game,physicalSeat,ordinal){
  assert.ok(physicalSeat===0||physicalSeat===1);
  const packet=candidateAttackSettlement(game,physicalSeat);
  const event=packet.attacks.find(row=>row.actionOrdinal===ordinal);
  if(!event)return null;
  return {
    attackName:event.attackName,actorSeat:physicalSeat,
    actionOrdinal:ordinal,globalTurn:event.turnBefore,
    delegatedCopy:event.delegatedCopy,
    promptSettled:event.settledPromptChain,
    settlementCrossesClockReset:event.settlementCrossesClockReset,
    afterGameEpochResetOrdinal:event.firstClockResetAfterAttackOrdinal,
    nativePublicBoardBefore:event.publicBoardBefore,
    nativePublicBoardAfter:event.publicBoardAfter,
    prizesBefore:event.prizesBefore,
    prizesAfter:event.prizesAfter,
    independentlyVerifiedNextSourceTurn:event.nextSourceSameEpochProven
  };
}

/**
 * Run four frozen, historical actual-Store games under one symmetric,
 * actor-only development profile. The sole treatment factor is whether
 * Agent49's printed attack selector is enabled. Both seats use one setting.
 * The original native bot remains unqualified and may fall back to concealed
 * information. The game artifacts are retrospective diagnostics.
 *
 * @param {boolean} enabled Enable the potential-knockout selector.
 * @param {(options:object)=>object} [execute] Test dependency seam.
 * @param {boolean} [nativeAcceptedTargets] Original Store target observer.
 * @param {boolean} [nativePromptPublicDeltas] Accepted public prompt deltas.
 * @returns {{development:object,games:Map<string,object>,promptAudits:Map<string,object>}}
 */
function replayNativePolicy(enabled,execute=runDevelopment,nativeAcceptedTargets=true,
  nativePromptPublicDeltas=true){
  assert.equal(typeof nativeAcceptedTargets,'boolean');
  assert.equal(typeof nativePromptPublicDeltas,'boolean');
  assert.equal(typeof execute,'function');
  const original=headless.runMatch;
  const savedFlag=process.env.AGENT49_POTENTIAL_KO_ROOT_DEV;
  const games=new Map();
  const promptAudits=new Map();
  headless.runMatch=request=>{
    const observed=nativePromptPublicDeltas?
      require('../twinleaf/accepted-energy-prompt-public-witness.cjs')
        .withAcceptedEnergyPromptPublicWitness(()=>original(request)):
      {result:original(request),audit:null};
    const game=observed.result;
    assert.ok(!games.has(request.label),'Duplicate frozen native match label');
    games.set(request.label,game);
    if(observed.audit)promptAudits.set(request.label,observed.audit);
    return game;
  };
  let development;
  try{
    process.env.AGENT49_POTENTIAL_KO_ROOT_DEV=enabled?'true':'false';
    development=execute({
      actorOnlyComposition:true,
      nativeAcceptedTargets,
      mandatoryOptionFallback:true,
      nativePressureWindows:true,
      paperSupporterQuota:true,
      paperCologneQuota:false,
      actorGenericFallbackAttribution:false
    });
  }finally{
    headless.runMatch=original;
    if(savedFlag===undefined)
      delete process.env.AGENT49_POTENTIAL_KO_ROOT_DEV;
    else process.env.AGENT49_POTENTIAL_KO_ROOT_DEV=savedFlag;
  }
  assert.strictEqual(headless.runMatch,original,'Native read-only capture restored');
  assert.equal(development.rows.length,4,'Original fixed four arms required');
  return {development,games,promptAudits};
}

/**
 * Compare paired source-dealt executions without hiding native aborts.
 *
 * @param {object} a Baseline observation containing development and games.
 * @param {object} b Treatment observation containing development and games.
 * @returns {object} Four paired first-Store-divergence and native settlement rows.
 */
function compareNativePairs(a,b){
  assert.equal(a.development.rows.length,4);
  assert.equal(b.development.rows.length,4);
  const pairs=a.development.rows.map((control,i)=>{
    const treatment=b.development.rows[i];
    assert.equal(control.trial?.id,treatment.trial?.id);
    assert.equal(control.trial?.seed,treatment.trial?.seed);
    const sourceDealMatched=Boolean(control.sourceDealFingerprint &&
      control.sourceDealFingerprint===treatment.sourceDealFingerprint);
    const starterMatched=Boolean(control.verifiedFirstTurn &&
      treatment.verifiedFirstTurn &&
      control.actualStarterSeat===treatment.actualStarterSeat);
    const aGame=[...a.games.entries()].find(([label])=>
      label.endsWith(control.trial.id))?.[1];
    const bGame=[...b.games.entries()].find(([label])=>
      label.endsWith(treatment.trial.id))?.[1];
    const nativeGamePair=Boolean(aGame&&bGame);
    const promptFor=(bundle,id)=>[...(bundle.promptAudits??new Map()).entries()]
      .find(([label])=>label.endsWith(id))?.[1]??null;
    const aPrompt=promptFor(a,control.trial.id);
    const bPrompt=promptFor(b,treatment.trial.id);
    const firstDifference=nativeGamePair?
      firstRootDivergence(aGame.rootActionLedger,bGame.rootActionLedger):null;
    const acceptedTargetComparison=acceptedTargetContrast(
      control,treatment,firstDifference);
    const attackClassChange=Boolean(firstDifference &&
      firstDifference.baseline?.action==='AttackAction' &&
      firstDifference.treatment?.action==='AttackAction' &&
      firstDifference.baseline?.playerSlot===firstDifference.treatment?.playerSlot &&
      firstDifference.baseline?.turnBefore===firstDifference.treatment?.turnBefore);
    const actorSeat=attackClassChange?
      firstDifference.baseline.playerSlot:null;
    const baselineAttack=attackClassChange?
      sourceAttackAtRoot(aGame,actorSeat,firstDifference.ordinal):null;
    const changedAttack=attackClassChange?
      sourceAttackAtRoot(bGame,actorSeat,firstDifference.ordinal):null;
    const identicalPublicBefore=Boolean(baselineAttack&&changedAttack&&
      JSON.stringify(baselineAttack.nativePublicBoardBefore)===
      JSON.stringify(changedAttack.nativePublicBoardBefore));
    const outcome=row=>({
      status:row.status??null,error:row.error??null,
      actions:row.actionCount??null,finished:row.finished??null,
      winner:row.winner??null,finalPrizes:row.finalPrizes??null,
      endReason:row.endReason??null
    });
    return {
      trialId:control.trial.id,seed:control.trial.seed,
      sourceSeat:control.sourceSeat??null,
      candidateSeat:control.candidateSeat??null,
      actualStarterSeat:control.actualStarterSeat??null,
      originalPhysicalSourceDealMatched:sourceDealMatched,
      originalPhysicalStarterMatched:starterMatched,
      hasBothNativeGames:nativeGamePair,
      rootSha256:{
        baseline:nativeGamePair?ROOT_SHA(aGame.rootActionLedger):null,
        treatment:nativeGamePair?ROOT_SHA(bGame.rootActionLedger):null
      },
      rootShaMatchesCanonicalOutput:nativeGamePair&&
        ROOT_SHA(aGame.rootActionLedger)===control.rootActionLedgerSha256&&
        ROOT_SHA(bGame.rootActionLedger)===treatment.rootActionLedgerSha256,
      priorNativeRootsIdentical:nativeGamePair&&
        (firstDifference===null||firstDifference.ordinal>0),
      priorNativeRootLabelsIdentical:nativeGamePair&&
        (firstDifference===null||firstDifference.ordinal>0),
      acceptedTargetComparison,
      acceptedPromptComparison:{left:aPrompt?.sha256??null,
        right:bPrompt?.sha256??null,
        samePublicLedger:Boolean(aPrompt&&bPrompt&&aPrompt.sha256===bPrompt.sha256),
        leftCount:aPrompt?.acceptedEnergyPromptResolutions??null,
        rightCount:bPrompt?.acceptedEnergyPromptResolutions??null,
        leftUnobserved:aPrompt?.publicDeltaUnobserved??null,
        rightUnobserved:bPrompt?.publicDeltaUnobserved??null,
        rootOrdinalLinked:false},
      firstDifference,
      firstDifferenceIsSameActorPrintedAttack:attackClassChange,
      baselineNativeAttackSettlement:baselineAttack,
      treatmentNativeAttackSettlement:changedAttack,
      samePhysicalPublicBoardBeforeDivergence:identicalPublicBefore,
      sameActorPrintedAttackObservationAvailable:
        Boolean(baselineAttack&&changedAttack),
      baseline:outcome(control),treatment:outcome(treatment),
      competitiveQualified:false
    };
  });
  return {
    schema:VERSION,
    frozenTrials:pairs.length,
    enginePin:a.development.enginePin,
    sourceRegistration:a.development.sourceRegistration,
    onlyIntervention:'AGENT49_POTENTIAL_KO_ROOT_DEV false versus true',
    nativeGamesObserved:{baseline:a.games.size,treatment:b.games.size},
    pairs,
    limitations:[
      'Retrospective source-selected seed, not prospective performance',
      'Original generic bot fallback and source-pressure policy remain unqualified',
      'Native paper card mechanics and official tournament clock unverified',
      'Source and candidate use the same optional attack choice policy',
      'First divergent attack proves policy sensitivity, not an independent win rate',
      'Native target sidecar proves accepted PlayCard/Retreat geometry only; prompt targets remain unobserved'
    ],
    qualifiedCompetitiveGames:0
  };
}

/**
 * Same-checkout, same-printed-attack-policy observer OFF/ON check. The native
 * Store's accepted action labels, source deal and public outcome must agree;
 * this remains a projection-level test because OFF has no target receipts.
 * @param {object} off Actual four-arm replay without target observer.
 * @param {object} on Actual four-arm replay with read-only target observer.
 */
function compareObserverProjection(off,on){
  assert.equal(off.development.rows.length,4);
  assert.equal(on.development.rows.length,4);
  const rows=off.development.rows.map((before,i)=>{
    const after=on.development.rows[i];
    const registrationMatched=before.trial?.id===after.trial?.id&&
      before.trial?.seed===after.trial?.seed;
    const sourceDealMatched=Boolean(before.sourceDealFingerprint&&
      before.sourceDealFingerprint===after.sourceDealFingerprint);
    const startMatched=before.actualStarterSeat===after.actualStarterSeat&&
      before.verifiedFirstTurn===true&&after.verifiedFirstTurn===true;
    const matchingGame=(bundle,trialId)=>[...bundle.games.entries()]
      .find(([name])=>name.endsWith(trialId))?.[1]??null;
    const a=matchingGame(off,before.trial?.id);
    const b=matchingGame(on,after.trial?.id);
    const bothComplete=Boolean(a&&b);
    const rootLabelsEqual=bothComplete&&
      ROOT_SHA(a.rootActionLedger)===ROOT_SHA(b.rootActionLedger);
    const outcomesEqual=before.status===after.status&&
      before.error===after.error&&
      before.actionCount===after.actionCount&&
      before.finished===after.finished&&
      before.winner===after.winner&&
      JSON.stringify(before.finalPrizes)===JSON.stringify(after.finalPrizes)&&
      before.endReason===after.endReason;
    const targetLinked=after.nativeAcceptedTargetSidecar?.rootOrdinalLinked===true;
    return {
      trialId:before.trial?.id??null,registrationMatched,
      sourceDealMatched,startMatched,bothComplete,rootLabelsEqual,
      outcomesEqual,targetLinked,
      projectionParity:registrationMatched&&sourceDealMatched&&startMatched&&
        bothComplete&&rootLabelsEqual&&outcomesEqual&&targetLinked
    };
  });
  return {schema:'agent37-native-target-observer-projection-parity-v1',
    checked:rows.length,passed:rows.filter(row=>row.projectionParity).length,
    complete:rows.every(row=>row.projectionParity),
    rows,limitations:[
      'Identical accepted root labels and terminal results are not full physical noninterference',
      'OFF arm has no independent capture of prompt targets or card attachments',
      'Each matched pair retains the same source seed and actual physical starter'
    ]};
}

/** @returns {object} Full read-only paired native source decision packet. */
function run(){
  const original=replayNativePolicy(false);
  const treatment=replayNativePolicy(true);
  const observerOffControl=replayNativePolicy(false,runDevelopment,false,false);
  const observerOffTreatment=replayNativePolicy(true,runDevelopment,false,false);
  const paired=compareNativePairs(original,treatment);
  paired.nativeTargetObserverProjectionParity={
    printedAttackOff:compareObserverProjection(observerOffControl,original),
    printedAttackOn:compareObserverProjection(observerOffTreatment,treatment)
  };
  return paired;
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');

module.exports={VERSION,firstRootDivergence,acceptedTargetContrast,
  sourceAttackAtRoot,replayNativePolicy,compareNativePairs,
  compareObserverProjection,run};
