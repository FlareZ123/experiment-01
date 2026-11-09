'use strict';

const {certifiedMaterialChoice}=require('./agent45-bilateral-competence-gate.cjs');

const VERSION='agent45-mew-techno-blast-cooldown-bridge-v1';
const EXPECTED_EFFECT="During your next turn, this Pokémon can't attack.";
const OFFICIAL_RULING_SECTIONS=['C-18','C-15','E-02'];

/**
 * Structural exception for one precisely known Pokémon paper interaction.
 * A Mew VMAX copying a Benched Genesect V's Techno Blast inherits the
 * attack's "this Pokémon can't attack" effect for its next turn.
 * This is a *potential* explanation for an ensuing Pass. An independent
 * reviewer MUST also audit every owner alternative; an unsupported Pass
 * does not become competent merely from the copied attack's printed text.
 *
 * This module only constructs a conditional postgame certificate. It never
 * verifies an external paper witness, authorizes reviewers or grants a win.
 *
 * @param {object} trial Independent full-game bundle trial.
 * @returns {object}
 */
function inspectMewTechnoCooldownBridge(trial){
  const result=(episode,reason)=>({
    schema:VERSION,conditionallyCertified:episode!==null,
    episode,reason,competitiveAdmission:false,independentReviewRequired:true
  });
  const roots=trial?.rootActionLedger;
  const certs=trial?.actionCertificates;
  const claims=trial?.cooldownCertificates;
  if(!Array.isArray(roots)||!Array.isArray(certs)||!Array.isArray(claims))
    return result(null,'missing-owner-action-or-cooldown-evidence');
  const isSeat=x=>x===0||x===1;
  if(!isSeat(trial.originalSourceSeat)||
      trial.candidateSeat!==1-trial.originalSourceSeat)
    return result(null,'missing-real-two-seat-provenance');
  const source=trial.originalSourceSeat,opponent=trial.candidateSeat;
  const byCert=new Map(certs.map(c=>[c.rootOrdinal,c]));
  const byOrdinal=new Map(roots.map(r=>[r.actionOrdinal,r]));
  const positive=root=>certifiedMaterialChoice(
    byCert.get(root.actionOrdinal),root);
  for(const claim of claims){
    const a=byOrdinal.get(claim?.sourceAttackOrdinal);
    const prompt=byOrdinal.get(claim?.copiedAttackPromptOrdinal);
    const b=byOrdinal.get(claim?.opponentReplyOrdinal);
    const pass=byOrdinal.get(claim?.cooldownPassOrdinal);
    const c=byOrdinal.get(claim?.sourceReturnOrdinal);
    if(!a||!prompt||!b||!pass||!c)continue;
    const t=a.turnBefore;
    if(a.playerSlot!==source||a.action!=='AttackAction'||
       a.attack!=='Cross Fusion Strike'||!positive(a)||
       prompt.playerSlot!==source||prompt.action!=='ResolvePromptAction'||
       prompt.turnBefore!==t||
       prompt.initiatingRootActionOrdinal!==a.actionOrdinal||
       prompt.actionOrdinal<=a.actionOrdinal||
       prompt.attackChoice?.printing!=='Genesect V FST'||
       prompt.attackChoice?.attackName!=='Techno Blast'||
       b.playerSlot!==opponent||b.turnBefore!==t+1||
       b.actionOrdinal<=prompt.actionOrdinal||!positive(b)||
       pass.playerSlot!==source||pass.turnBefore!==t+2||
       pass.action!=='PassTurnAction'||pass.actionOrdinal<=b.actionOrdinal||
       c.playerSlot!==source||c.turnBefore!==t+4||
       c.actionOrdinal<=pass.actionOrdinal||
       c.action!=='AttackAction'||!positive(c))continue;
    if(byCert.get(b.actionOrdinal)?.linkedEarlierRootOrdinal!==
        a.actionOrdinal||!byCert.get(b.actionOrdinal)?.causalEvidenceRef||
       byCert.get(c.actionOrdinal)?.linkedEarlierRootOrdinal!==
        b.actionOrdinal||!byCert.get(c.actionOrdinal)?.causalEvidenceRef)
      continue;
    if(claim.rule!=='Mew-Genesect-Techno-Blast-next-turn-no-attack'||
       claim.technoBlastPrintedEffect!==EXPECTED_EFFECT||
       claim.copyingRuleSections?.join('|')!==
         OFFICIAL_RULING_SECTIONS.join('|')||
       claim.actualActivePokemonPrinting!=='Mew VMAX FST'||
       claim.samePhysicalActiveThroughCooldown!==true||
       claim.paperAttackEffectReviewed!==true||
       claim.nativeSettlementChainReviewed!==true||
       claim.ownerAlternativesIndependentlyReviewed!==true||
       claim.otherMaterialLinesReviewed!==true||
       claim.continuationAttackPaperPaidReviewed!==true||
       typeof claim.officialPrintedCardEvidenceRef!=='string'||
       !claim.officialPrintedCardEvidenceRef||
       typeof claim.paperCopyRuleEvidenceRef!=='string'||
       !claim.paperCopyRuleEvidenceRef||
       typeof claim.physicalActiveIdentityEvidenceRef!=='string'||
       !claim.physicalActiveIdentityEvidenceRef||
       typeof claim.sourcePassOpportunityEvidenceRef!=='string'||
       !claim.sourcePassOpportunityEvidenceRef||
       typeof claim.actualAttackSettlementEvidenceRef!=='string'||
       !claim.actualAttackSettlementEvidenceRef||
       typeof claim.independentReviewer!=='string'||
       !claim.independentReviewer||
       !Number.isInteger(claim.settlementCompletionOrdinal)||
       claim.settlementCompletionOrdinal<=prompt.actionOrdinal||
       claim.settlementCompletionOrdinal>=b.actionOrdinal)
      continue;
    const settled=roots.find(r=>r.actionOrdinal===
      claim.settlementCompletionOrdinal);
    if(!settled||settled.initiatingRootActionOrdinal!==a.actionOrdinal||
       settled.action!=='ResolvePromptAction'||
       settled.turnBefore!==t&&settled.turnBefore!==t+1)continue;
    // The natural next source turn is the cooldown; the next following
    // source turn may still be a real attack. This bridge never excuses
    // more than this single precisely demonstrated cooldown interval.
    const interveningSourceAttack=roots.some(r=>
      r.playerSlot===source&&r.action==='AttackAction'&&
      r.turnBefore===t+2);
    if(interveningSourceAttack)continue;
    return result({
      sourceAttackOrdinal:a.actionOrdinal,
      copiedAttackPromptOrdinal:prompt.actionOrdinal,
      opponentReplyOrdinal:b.actionOrdinal,
      cooldownPassOrdinal:pass.actionOrdinal,
      sourceReturnOrdinal:c.actionOrdinal,
      turns:[t,t+1,t+2,t+4],
      actualPrintedCooldownEffect:EXPECTED_EFFECT,
      samePhysicalActiveIndependentlyClaimed:true,
      ownerAlternativesExternallyClaimed:true,
      onlyConditionalStructuralEvidence:true
    },'paper-cooldown-episode-asserted-pending-authenticated-review');
  }
  return result(null,'no-precisely-received-mew-techno-cooldown-episode');
}
module.exports={VERSION,EXPECTED_EFFECT,OFFICIAL_RULING_SECTIONS,
  inspectMewTechnoCooldownBridge};
