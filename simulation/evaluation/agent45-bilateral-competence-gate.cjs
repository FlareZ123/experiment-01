'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');

const VERSION = 'agent45-bilateral-competence-gate-v1';
const MATERIAL = new Set([
  'AttackAction', 'PlayCardAction', 'RetreatAction', 'UseAbilityAction',
  'UseTrainerAbilityAction', 'UseEnergyAbilityAction', 'UseStadiumAction'
]);
const PAYOFFS = new Set([
  'damage-transition', 'prize-transition', 'energy-custody',
  'position-change', 'resource-transfer', 'status-transition',
  'established-lock', 'opponent-resource-denial', 'information-transition'
]);

/**
 * Hash the exact native public accepted-root array without reordering it.
 * @param {object[]} roots
 * @returns {string}
 */
function rootDigest(roots) {
  return createHash('sha256').update(JSON.stringify(roots)).digest('hex');
}

/**
 * Reject a resolved no-op attack, GX quota spending, or a mere move that
 * consumes a cost without a separately witnessed effect. A witness is a
 * proposed external fact; the library cannot independently authenticate it.
 * @param {object} certificate
 * @returns {boolean}
 */
function verifiedMaterialTransition(certificate) {
  const witness=certificate?.effectWitness;
  return PAYOFFS.has(certificate?.consequenceType) &&
    witness?.type===certificate.consequenceType &&
    witness?.sourceActionRootOrdinal===certificate.rootOrdinal &&
    Number.isSafeInteger(witness.changedUnits) &&
    witness.changedUnits>0 &&
    witness.realNativeStateChange===true &&
    witness.paperRelevantTransition===true &&
    witness.costPaymentOnly===false &&
    witness.independentlyReviewed===true &&
    typeof witness.beforeStateEvidenceRef==='string' &&
    witness.beforeStateEvidenceRef.length>0 &&
    typeof witness.afterStateEvidenceRef==='string' &&
    witness.afterStateEvidenceRef.length>0 &&
    witness.beforeStateEvidenceRef!==witness.afterStateEvidenceRef &&
    typeof witness.effectEvidenceRef==='string' &&
    witness.effectEvidenceRef.length>0;
}

/**
 * An independently supplied payment/target/legal-opportunity certificate is
 * a claim to audit, not a paper legality oracle. Reject ungrounded claims.
 * @param {object} certificate
 * @param {object} root
 * @returns {boolean}
 */
function certifiedMaterialChoice(certificate, root) {
  if (!certificate || !root || !MATERIAL.has(root.action)) return false;
  if (certificate.rootOrdinal !== root.actionOrdinal ||
      certificate.actorSeat !== root.playerSlot ||
      certificate.action !== root.action) return false;
  if (certificate.realStoreAccepted !== true ||
      certificate.paperLegalityReviewed !== true ||
      certificate.paidResourcesVerified !== true ||
      certificate.targetsAndTransitionsVerified !== true ||
      certificate.ownerInformationOnly !== true ||
      !verifiedMaterialTransition(certificate)) return false;
  if (typeof certificate.independentReviewer !== 'string' ||
      certificate.independentReviewer.length === 0 ||
      typeof certificate.paperEvidenceRef !== 'string' ||
      certificate.paperEvidenceRef.length === 0 ||
      typeof certificate.physicalReceiptRef !== 'string' ||
      certificate.physicalReceiptRef.length === 0) return false;
  const audit = certificate.ownerOpportunityAudit;
  if (audit?.actualRootOwnerView !== true ||
      audit?.exhaustivePaperAffordableScan !== true ||
      audit?.independentReview !== true ||
      !Array.isArray(audit.options) || audit.options.length === 0 ||
      typeof audit.evidenceRef !== 'string' || !audit.evidenceRef) return false;
  const selected = audit.options.filter(option =>
    option?.id === certificate.selectedOptionId &&
    option.action === root.action && option.ownerVisible === true &&
    option.paperAffordable === true &&
    typeof option.evidenceRef === 'string' && !!option.evidenceRef);
  if (selected.length !== 1) return false;
  const ids = audit.options.map(option => option?.id);
  return ids.every(id => typeof id === 'string' && !!id) &&
    new Set(ids).size === ids.length;
}

/**
 * Evaluate one frozen trial without converting raw native action counts into
 * an assertion of strategic competence. All certification fields require
 * independent upstream evidence. No game is qualified by this helper alone.
 * @param {object} trial Frozen, source-locked trial and audit packet.
 * @returns {object}
 */
function evaluateBilateralCompetence(trial) {
  assert.ok(trial && typeof trial === 'object');
  const roots = trial.rootActionLedger;
  assert.ok(Array.isArray(roots), 'Native accepted-root ledger required');
  for (let i = 0; i < roots.length; i++) {
    assert.equal(roots[i].actionOrdinal, i,
      'Accepted root ordinals must be contiguous from zero');
    assert.ok(Number.isSafeInteger(roots[i].turnBefore) &&
      (roots[i].playerSlot === 0 || roots[i].playerSlot === 1));
    if (i > 0) assert.ok(roots[i].turnBefore >= roots[i-1].turnBefore,
      'Cannot accept time-regressing native roots');
  }
  const digest = rootDigest(roots);
  assert.equal(trial.rootActionLedgerSha256, digest,
    'Frozen Store ledger SHA256 mismatch');
  const sourceSeat = trial.originalSourceSeat;
  const candidateSeat = trial.candidateSeat;
  assert.ok((sourceSeat === 0 || sourceSeat === 1) &&
    candidateSeat === 1 - sourceSeat, 'The two distinct actual seats are required');
  const nonempty = value => typeof value === 'string' && value.length > 0;
  const source = trial.originalPrinted60Sha256;
  const candidate = trial.candidatePrinted60Sha256;
  const provenanceComplete = [trial.registrationRef, trial.trialId,
    trial.sourcePhysicalDealSha256, trial.fullPhysicalDealSha256,
    trial.vendorCommitSha, trial.researchRevisionSha,
    trial.hookRevisionSha, source, candidate].every(nonempty) &&
    (trial.actualFirstPlayerSeat === 0 || trial.actualFirstPlayerSeat === 1);
  const samePolicy = nonempty(trial.policySha256BySeat?.[0]) &&
    trial.policySha256BySeat[0] === trial.policySha256BySeat[1];
  const nativeTerminal = trial.nativeFinished === true &&
    (trial.nativeWinner === 0 || trial.nativeWinner === 1) &&
    nonempty(trial.nativeEndReason) &&
    Array.isArray(trial.finalPrizes) && trial.finalPrizes.length === 2 &&
    trial.finalPrizes.every(x => Number.isInteger(x) && x >= 0 && x <= 6) &&
    trial.engineError !== true && trial.rootCapReached !== true;
  const evidence = Array.isArray(trial.actionCertificates)?trial.actionCertificates:[];
  const certificateByRoot = new Map();
  for (const cert of evidence) {
    assert.ok(Number.isInteger(cert.rootOrdinal) && cert.rootOrdinal >= 0,
      'Certificate root must be a nonnegative ordinal');
    assert.ok(!certificateByRoot.has(cert.rootOrdinal),
      'Duplicate certificates for a single native root');
    certificateByRoot.set(cert.rootOrdinal,cert);
  }
  const eligible = roots.filter(root => certifiedMaterialChoice(
    certificateByRoot.get(root.actionOrdinal), root));
  let episode = null;
  for (let i = 0; i < eligible.length && !episode; i++) {
    const first = eligible[i];
    if (first.playerSlot !== sourceSeat) continue;
    for (let j = i + 1; j < eligible.length && !episode; j++) {
      const response = eligible[j];
      if (response.playerSlot !== candidateSeat ||
          response.turnBefore !== first.turnBefore + 1 ||
          certificateByRoot.get(response.actionOrdinal)?.linkedEarlierRootOrdinal !==
            first.actionOrdinal ||
          !certificateByRoot.get(response.actionOrdinal)?.causalEvidenceRef) continue;
      for (let k = j + 1; k < eligible.length; k++) {
        const continuation = eligible[k];
        if (continuation.playerSlot === sourceSeat &&
            continuation.turnBefore === response.turnBefore + 1 &&
            certificateByRoot.get(continuation.actionOrdinal)?.linkedEarlierRootOrdinal ===
              response.actionOrdinal &&
            !!certificateByRoot.get(continuation.actionOrdinal)?.causalEvidenceRef) {
          episode = {
            sourceActionOrdinal:first.actionOrdinal,
            opponentReplyOrdinal:response.actionOrdinal,
            sourceContinuationOrdinal:continuation.actionOrdinal,
            turns:[first.turnBefore,response.turnBefore,
              continuation.turnBefore],
            actionTypes:[first.action,response.action,continuation.action]
          };
          break;
        }
      }
    }
  }
  const failures = [];
  if (!provenanceComplete) failures.push('provenance-incomplete');
  if (!samePolicy) failures.push('policy-asymmetry-or-unverified');
  if (!nativeTerminal) failures.push('no-natural-native-terminal');
  if (!episode) failures.push('no-certified-source-reply-source-episode');
  if (trial.independentFullPaperRulesAudit !== true)
    failures.push('independent-paper-audit-pending');
  if (trial.hiddenInformationAudit !== true)
    failures.push('hidden-information-audit-pending');
  if (trial.official25MinuteClockAudit !== true)
    failures.push('official-match-clock-audit-pending');
  const structuralGatePassed = failures.length === 0;
  return {
    schema:VERSION,trialId:trial.trialId??null,
    rootActionLedgerSha256:digest,acceptedNativeRoots:roots.length,
    certifiedMaterialRoots:eligible.length,
    provenanceComplete,samePolicy,nativeTerminal,
    reciprocalEpisodeObserved:episode !== null,episode,
    structuralGatePassed,competitiveAdmission:false,
    externalIndependentReviewRequired:true,failures,
    evidenceStatus:'independent reviewer receipts must be checked at their source; this gate does not adjudicate paper rules or action strategy'
  };
}


/**
 * An observational screening convenience for real native archives.
 * A source-to-opponent-to-source sequence does not establish that the
 * opponent's action was causally responsive, paper-payable or good.
 * @param {object[]} roots Actual public accepted-root action ledger.
 * @param {0|1} sourceSeat Actual original-source seat.
 * @param {0|1} opponentSeat Actual contender seat.
 * @param {{sourceAttackOnly?:boolean}} [options]
 * @returns {object|null}
 */
function screenObservedReciprocalSequence(roots, sourceSeat, opponentSeat, options={}) {
  assert.ok(Array.isArray(roots));
  assert.ok((sourceSeat===0||sourceSeat===1)&&opponentSeat===1-sourceSeat);
  const actions=roots.filter(r=>MATERIAL.has(r.action));
  for(let i=0;i<actions.length;i++){
    const source=actions[i];
    if(source.playerSlot!==sourceSeat ||
       (options.sourceAttackOnly===true&&source.action!=='AttackAction'))continue;
    for(let j=i+1;j<actions.length;j++){
      const reply=actions[j];
      if(reply.playerSlot!==opponentSeat||
         reply.turnBefore!==source.turnBefore+1)continue;
      for(let k=j+1;k<actions.length;k++){
        const continuation=actions[k];
        if(continuation.playerSlot!==sourceSeat||
           continuation.turnBefore!==reply.turnBefore+1)continue;
        const describe=r=>({ordinal:r.actionOrdinal,turn:r.turnBefore,
          action:r.action,card:r.card??null,attack:r.attack??null});
        return {source:describe(source),opponent:describe(reply),
          sourceReturn:describe(continuation),
          paperQualified:false,causalReplyVerified:false,
          ownerAlternativesVerified:false};
      }
    }
  }
  return null;
}

/**
 * Observe a positive change in public Active damage on the defender board.
 * Equal printing is not a physical-card identity certificate; duplicate
 * printings may exist. This says nothing about printed attack legality.
 * @param {object} settledAttack Archived native attack settlement packet.
 * @param {0|1} defenderSeat Actual defending physical seat.
 * @returns {object|null}
 */
function screenPublicDefenderDamageChange(settledAttack, defenderSeat) {
  if(settledAttack?.settledPromptChain!==true||
     (defenderSeat!==0&&defenderSeat!==1))return null;
  const before=settledAttack.publicBoardBefore?.[defenderSeat]?.active;
  const after=settledAttack.publicBoardAfter?.[defenderSeat]?.active;
  if(!before||!after||typeof before.printing!=='string'||
     before.printing!==after.printing||
     !Number.isSafeInteger(before.damage)||!Number.isSafeInteger(after.damage)||
     after.damage<=before.damage||((after.damage-before.damage)%10)!==0)return null;
  return {defenderPrinting:before.printing,
    beforeDamage:before.damage,afterDamage:after.damage,
    addedDamage:after.damage-before.damage,
    damageCounterDelta:(after.damage-before.damage)/10,
    nativePublicChangeObserved:true,
    exactPhysicalCardIdentityProven:false,
    printedPaperLegalityVerified:false};
}

/**
 * Screen every registered actual-native attempt while preserving all
 * dispositions. This is intentionally an UNQUALIFIED action-only census.
 * @param {{attempts:object[]}} archive Source artifact with native roots.
 * @returns {object} Fully source-linked but not competitive information.
 */
function screenArchivedReciprocalAttempts(archive) {
  assert.ok(Array.isArray(archive?.attempts));
  const ids=new Set();
  const rows=archive.attempts.map(a=>{
    assert.ok(typeof a.id==='string'&&!ids.has(a.id));
    ids.add(a.id);
    const roots=a.publicRootActions;
    if(a.publicRootActionsTruncated!==false||!Array.isArray(roots)||
       !Number.isInteger(a.publicRootActionCount)||
       typeof a.publicRootLedgerSha256Computed!=='string'||
       typeof a.publicRootLedgerSha256Reported!=='string'){
      return {trialId:a.id,disposition:a.status??null,
        rootCount:a.publicRootActionCount??null,
        rootActionLedgerSha256:null,sourceSeat:a.originalSourceSeat??null,
        opponentSeat:a.candidateSeat??null,
        generalSequence:null,sourceAttackSequence:null,
        settledSourceAttackBeforeObservedReply:false,
        observedPublicDefenderDamage:null,
        settledSourceAttackCompletionRoot:null,
        settledSourceAttackPrizeChange:null,
        archiveIntegrity:'QUARANTINED-incomplete-public-root-proof',
        fullPaperAudit:false,competitiveAdmission:false};
    }
    assert.equal(a.publicRootActionCount,roots.length);
    for(let i=0;i<roots.length;i++){
      assert.equal(roots[i].actionOrdinal,i);
      if(i>0)assert.ok(roots[i].turnBefore>=roots[i-1].turnBefore);
    }
    const hash=rootDigest(roots);
    assert.equal(a.publicRootLedgerSha256Computed,hash);
    assert.equal(a.publicRootLedgerSha256Reported,hash);
    const general=screenObservedReciprocalSequence(roots,
      a.originalSourceSeat,a.candidateSeat);
    const sourceAttack=screenObservedReciprocalSequence(roots,
      a.originalSourceSeat,a.candidateSeat,{sourceAttackOnly:true});
    const settledSourceAttack=sourceAttack?
      a.actualSourceAttackSettlement?.attacks?.find(attack=>
        attack.actionOrdinal===sourceAttack.source.ordinal &&
        attack.settledPromptChain===true &&
        Number.isInteger(attack.completionRootOrdinal) &&
        attack.completionRootOrdinal<
          sourceAttack.opponent.ordinal)??null:null;
    const settledSourceAttackBeforeObservedReply=settledSourceAttack!==null;
    const observedPublicDefenderDamage=settledSourceAttack?
      screenPublicDefenderDamageChange(settledSourceAttack,a.candidateSeat):null;
    const settledSourceAttackPrizeChange=settledSourceAttack&&
      Number.isInteger(settledSourceAttack.prizesBefore?.[a.originalSourceSeat])&&
      Number.isInteger(settledSourceAttack.prizesAfter?.[a.originalSourceSeat])?
        settledSourceAttack.prizesBefore[a.originalSourceSeat]-
          settledSourceAttack.prizesAfter[a.originalSourceSeat]:null;
    return {trialId:a.id,disposition:a.status,
      rootCount:roots.length,rootActionLedgerSha256:hash,
      sourceSeat:a.originalSourceSeat,opponentSeat:a.candidateSeat,
      generalSequence:general,sourceAttackSequence:sourceAttack,
      settledSourceAttackBeforeObservedReply,
      observedPublicDefenderDamage,
      settledSourceAttackCompletionRoot: settledSourceAttack?.completionRootOrdinal??null,
      settledSourceAttackPrizeChange,
      archiveIntegrity:'VERIFIED-original-public-root-ledger',
      fullPaperAudit:false,competitiveAdmission:false};
  });
  return {schema:'agent45-archive-reciprocal-screen-v1',
    attemptedContexts:rows.length,
    verifiedRootLedgerContexts:rows.filter(r=>r.archiveIntegrity===
      'VERIFIED-original-public-root-ledger').length,
    quarantinedContexts:rows.filter(r=>r.archiveIntegrity!==
      'VERIFIED-original-public-root-ledger').length,
    anyGeneralSequenceContexts:rows.filter(r=>r.generalSequence).length,
    anySourceAttackSequenceContexts:rows.filter(r=>r.sourceAttackSequence).length,
    attackAnchorSettledBeforeReplyContexts:rows.filter(r=>
      r.settledSourceAttackBeforeObservedReply).length,
    publicPositiveDamageBeforeReplyContexts:rows.filter(r=>
      r.observedPublicDefenderDamage!==null).length,
    competitiveGamesQualified:0,
    evidenceClass:'real-native-action-only-not-causal-paper-or-policy-qualified',
    rows};
}

module.exports = {VERSION, rootDigest, verifiedMaterialTransition,
  certifiedMaterialChoice, evaluateBilateralCompetence,
  screenObservedReciprocalSequence, screenPublicDefenderDamageChange,
  screenArchivedReciprocalAttempts};
