'use strict';

const assert=require('node:assert/strict');
const {publicRoot}=require('./agent2-preattack-supporter-followthrough.cjs');
const VERSION='agent2-native-first-divergent-root-v1';

/** @param {object} event @returns {string} */
function rootKey(event){
  return JSON.stringify(publicRoot(event));
}

/**
 * Match a source-deal intervention to the first actually distinct native
 * accepted root. No policy data, opponent hidden zones, or native cloning.
 * A different RNG trajectory before the intended Supporter is an explicit
 * failure of the direct causal interpretation.
 *
 * @param {object} baseline Native original-policy game row.
 * @param {object} treatment Native modified-policy game row.
 * @param {object[]} selectedIntents Selected typed actor-only plans.
 * @returns {object} Bounded public first-difference and attack-continuity audit.
 */
function auditPreAttackFirstDivergence(baseline,treatment,selectedIntents){
  assert.ok(baseline&&treatment&&Array.isArray(selectedIntents));
  if(selectedIntents.length===0)return {version:VERSION,status:'no-selected-intent'};
  const a=baseline.rootActionLedger,b=treatment.rootActionLedger;
  if(!Array.isArray(a)||!Array.isArray(b))return {
    version:VERSION,status:'native-root-ledger-missing'};
  const out=[];
  for(const selected of selectedIntents){
    const intent=selected.intent??selected;
    const seat=selected.seat,turn=selected.globalTurn;
    if(![0,1].includes(seat)||!Number.isSafeInteger(turn)||
        intent.kind!=='play-conservative-shuffle-supporter'){
      out.push({status:'invalid-selected-intent'});
      continue;
    }
    const shortName=/^(Lillie's Determination|Marnie|Iono) /.
      exec(intent.printing??'')?.[1]??null;
    if(!shortName){out.push({status:'unsupported-printed-intent'});continue;}
    const planned=b.filter(row=>row?.action==='PlayCardAction'&&
      row.playerSlot===seat&&row.turnBefore===turn&&
      row.pendingPrompt===null&&row.card===shortName);
    if(planned.length!==1){
      out.push({status:'native-root-unverified',seat,turn,
        matchingNativeRootCount:planned.length});continue;
    }
    const chosen=planned[0];
    let divergenceIndex=0;
    while(divergenceIndex<Math.min(a.length,b.length)&&
        rootKey(a[divergenceIndex])===rootKey(b[divergenceIndex])){
      divergenceIndex++;
    }
    const firstOriginal=publicRoot(a[divergenceIndex]);
    const firstTreatment=publicRoot(b[divergenceIndex]);
    const firstDifferent=divergenceIndex<Math.max(a.length,b.length);
    const firstDifferenceIsLillie=firstDifferent&&
      firstTreatment?.actionOrdinal===chosen.actionOrdinal&&
      firstTreatment?.action==='PlayCardAction'&&
      firstTreatment?.card===shortName&&
      firstTreatment?.playerSlot===seat;
    const baselineAttacks=a.filter(row=>row?.playerSlot===seat&&
      row.turnBefore===turn&&row.action==='AttackAction').map(publicRoot);
    const treatmentAttacks=b.filter(row=>row?.playerSlot===seat&&
      row.turnBefore===turn&&row.action==='AttackAction').map(publicRoot);
    const laterTreatmentAttacks=treatmentAttacks.filter(row=>
      row.actionOrdinal>chosen.actionOrdinal);
    out.push({
      status:firstDifferenceIsLillie?'direct-native-root-divergence-at-supporter':
        'first-difference-does-not-identify-supporter',
      seat,turn,commonRootPrefixCount:divergenceIndex,
      firstOriginalNativeRoot:firstOriginal,
      firstTreatmentNativeRoot:firstTreatment,
      selectedLillieNativeRoot:publicRoot(chosen),
      firstDifferenceIsSelectedSupporter:Boolean(firstDifferenceIsLillie),
      baselineSameTurnAttackRoots:baselineAttacks,
      treatmentSameTurnAttackRoots:treatmentAttacks,
      treatmentAttacksAfterSupporter:laterTreatmentAttacks,
      alternativeAttackPayability:'not proven by root logs alone',
      strategicImprovement:'not measured'
    });
  }
  return {version:VERSION,selectedCount:selectedIntents.length,
    directDivergences:out.filter(x=>x.firstDifferenceIsSelectedSupporter).length,
    records:out,competitiveGameQualified:false};
}

module.exports={VERSION,publicRoot,rootKey,auditPreAttackFirstDivergence};
