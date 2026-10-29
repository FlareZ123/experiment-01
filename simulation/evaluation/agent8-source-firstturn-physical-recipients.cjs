'use strict';

const assert=require('node:assert/strict');
const {isDeepStrictEqual}=require('node:util');
const {auditRegisteredSourceDeals}=
  require('./agent8-prospective-source-deal-audit.cjs');

const SCHEMA='agent8-original-source-firstturn-native-recipient-audit-v1';
const TARGET_SCHEMA='actual-store-declared-target-sidecar-v1';
const PROMPT_SCHEMA='headless-native-prompt-choice-evidence-v3-public-discard-prompt-bounds';

/**
 * Project real accepted PlayCard/Retreat target and immediate public board
 * changes; omit Store dispatch ordinals and hand indices, which can differ
 * even for otherwise identical physical actions.
 *
 * @param {object} row Authenticated canonical development row.
 * @param {number} sourceTurn First normal source turn (1 or 2).
 * @returns {object[]|null} Null means observation unavailable.
 */
function sourceTargetReceipts(row,sourceTurn){
  const sidecar=row.nativeAcceptedTargetSidecar;
  if(sidecar?.schema!==TARGET_SCHEMA||
      sidecar.observedLiveStore!==true||
      sidecar.rootOrdinalLinked!==true||
      !Array.isArray(sidecar.events))return null;
  const selected=sidecar.events.filter(e=>
    e.playerSlot===row.sourceSeat&&e.turnBefore===sourceTurn);
  if(selected.some(e=>e.storeAccepted!==true||
      e.declared?.status!=='captured'||
      !['PlayCardAction','RetreatAction'].includes(e.action)))return null;
  return selected.map(e=>({
    action:e.action,printing:e.declared.ownerHandPrinting??null,
    target:e.declared.target??null,
    declaredKind:e.declared.kind??null,
    publicChanges:e.publicBoardChanges
  }));
}

/**
 * Actor's own native prompt selections from first normal turn only.
 * This is passive postchoice evidence, never supplied to the bot.
 * @param {object} row
 * @param {number} sourceTurn
 * @returns {object[]|null}
 */
function sourcePromptReceipts(row,sourceTurn){
  const evidence=row.nativePromptChoices;
  if(evidence?.schema!==PROMPT_SCHEMA||
     !Array.isArray(evidence.events))return null;
  return evidence.events.filter(e=>e.actorSeat===row.sourceSeat&&
      e.turn===sourceTurn)
    .map(e=>({
      kind:e.kind,sourceZone:e.sourceZone,
      sourcePlayerSlot:e.sourcePlayerSlot,
      selectedCards:e.selectedCards,
      selectedIndices:e.selectedIndices,
      sourceZoneCardCountBefore:e.sourceZoneCardCountBefore,
      nativePromptMin:e.nativePromptMin,
      nativePromptMax:e.nativePromptMax,
      nativePromptAllowCancel:e.nativePromptAllowCancel,
      publicDiscardCardNamesBefore:e.publicDiscardCardNamesBefore
    }));
}

/**
 * Fixed source first-turn accepted root action labels, independently of
 * Store dispatch ordinals and prompt index.
 * @param {object} row
 * @param {number} sourceTurn
 * @returns {object[]|null}
 */
function sourceRootReceipts(row,sourceTurn){
  if(!Array.isArray(row.rootActionLedger))return null;
  const roots=row.rootActionLedger.filter(e=>e.playerSlot===row.sourceSeat&&
    e.turnBefore===sourceTurn&&e.pendingPrompt===null);
  if(!roots.length)return null;
  return roots.map(e=>({
    action:e.action,card:e.card??null,ability:e.ability??null,
    attack:e.attack??null
  }));
}

/**
 * Posthoc audit against one frozen preregistered 32-arm campaign.
 *
 * Source-deal alignment is a prerequisite, then separately verify
 * source first-turn accepted targets, public changes, actor-owned prompt
 * choices and accepted root labels. Candidate arms still have different
 * candidate hidden card states and are never full policy A/B matches.
 *
 * @param {object[]} registeredTrials Frozen plannedTrials() output.
 * @param {object} result Archived developmentResult.
 */
function auditSourceOpeningRecipients(registeredTrials,result){
  const provenance=auditRegisteredSourceDeals(registeredTrials,result);
  const byId=new Map(result.rows.map(row=>[row.trial.id,row]));
  const comparisons=provenance.pairs.map(pair=>{
    const opening={pairId:pair.pairId,rank:pair.rank,seed:pair.seed,
      candidateSlot:pair.candidateSlot,
      sourceDealStatus:pair.status,
      sourceActuallyFirst:pair.sourceActuallyFirst,
      sourceFirstNormalTurn:pair.sourceActuallyFirst===null?null:
        (pair.sourceActuallyFirst?1:2)
    };
    if(pair.status!=='aligned-source-deal')
      return {...opening,status:'source-deal-not-aligned',
        sameAcceptedPhysicalTargets:null,sameImmediatePublicChanges:null,
        sameNativeOwnerPromptSelections:null,sameRootActionLabels:null};
    const ids=[
      pair.pairId+':champion-reference',
      pair.pairId+':new-moon-lockbreaker-v1'
    ];
    const arms=ids.map(id=>byId.get(id));
    assert.ok(arms.every(Boolean));
    const t=opening.sourceFirstNormalTurn;
    const targets=arms.map(row=>sourceTargetReceipts(row,t));
    const prompts=arms.map(row=>sourcePromptReceipts(row,t));
    const roots=arms.map(row=>sourceRootReceipts(row,t));
    if([...targets,...prompts,...roots].some(x=>x===null))
      return {...opening,status:'missing-native-source-evidence',
        sameAcceptedPhysicalTargets:null,sameImmediatePublicChanges:null,
        sameNativeOwnerPromptSelections:null,sameRootActionLabels:null};

    const physical=events=>events.map(e=>({
      action:e.action,printing:e.printing,
      target:e.target,declaredKind:e.declaredKind
    }));
    const publics=events=>events.map(e=>e.publicChanges);
    const targetSame=isDeepStrictEqual(physical(targets[0]),physical(targets[1]));
    const publicSame=isDeepStrictEqual(publics(targets[0]),publics(targets[1]));
    const promptSame=isDeepStrictEqual(prompts[0],prompts[1]);
    const rootSame=isDeepStrictEqual(roots[0],roots[1]);
    const identical=targetSame&&publicSame&&promptSame&&rootSame;
    return {...opening,status:identical?
      'same-observed-source-firstturn-actions':'different-observed-source-firstturn-actions',
      sameAcceptedPhysicalTargets:targetSame,
      sameImmediatePublicChanges:publicSame,
      sameNativeOwnerPromptSelections:promptSame,
      sameRootActionLabels:rootSame,
      targetActionCounts:targets.map(x=>x.length),
      ownerPromptCounts:prompts.map(x=>x.length),
      rootActionCounts:roots.map(x=>x.length)};
  });
  const count=status=>comparisons.filter(r=>r.status===status).length;
  return {schema:SCHEMA,preregisteredArms:provenance.attemptedArms,
    preregisteredSourceSeedCells:provenance.registeredSeedCells,
    sourceDealPairsAligned:provenance.alignedSourceDealCells,
    sameObservedFirstTurnActions:
      count('same-observed-source-firstturn-actions'),
    differentObservedFirstTurnActions:
      count('different-observed-source-firstturn-actions'),
    missingNativeSourceEvidence:
      count('missing-native-source-evidence'),
    unpairedSourceDeals:count('source-deal-not-aligned'),
    observedFirstTurnTargetActions:comparisons.reduce((n,row)=>
      n+(row.status==='same-observed-source-firstturn-actions'?
        row.targetActionCounts[0]:0),0),
    comparisons,
    qualifiedForCompetitiveInference:false,
    scope:'Source first normal turn native PlayCard/Retreat geometry, immediate public deltas, actor prompt selections and root labels; no later-turn or entire-game equivalence'
  };
}

module.exports={SCHEMA,sourceTargetReceipts,sourcePromptReceipts,
  sourceRootReceipts,auditSourceOpeningRecipients};
