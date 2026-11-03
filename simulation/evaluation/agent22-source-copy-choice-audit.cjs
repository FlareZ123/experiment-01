'use strict';
const assert=require('node:assert/strict');

const VERSION='agent22-native-source-copy-choice-join-v1';

/**
 * Join native original-source AttackAction receipts to genuine native
 * ChooseAttackPrompt selections by initiating root ordinal. A named
 * Cross Fusion Strike declaration alone is not evidence of damage,
 * copied-attack choice, or competitive outcome.
 *
 * @param {object} row Genuine native runner result row
 * @returns {object} Auditable per-root source attack selection evidence
 */
function auditSourceCopiedAttacks(row){
  assert.ok(row&&typeof row==='object'&&!Array.isArray(row));
  const ledger=row.rootActionLedger;
  const settlements=row.sourceAttackSettlement?.attacks;
  assert.ok(Array.isArray(ledger)&&Array.isArray(settlements));
  const prompts=new Map();
  for(const action of ledger){
    if(action.pendingPrompt!=='ChooseAttackPrompt')continue;
    const root=action.initiatingRootActionOrdinal;
    if(!Number.isSafeInteger(root))continue;
    const choice=action.attackChoice;
    if(!choice||typeof choice!=='object')continue;
    if(!prompts.has(root))prompts.set(root,[]);
    prompts.get(root).push({
      printing:typeof choice.printing==='string'?choice.printing:null,
      attackName:typeof choice.attackName==='string'?choice.attackName:null,
      rootActionOrdinal:action.actionOrdinal??null,
      ownerSeat:action.playerSlot??null
    });
  }
  const copySettlements=settlements.filter(a=>a.attackName==='Cross Fusion Strike');
  const records=copySettlements.map(attack=>{
    const matching=prompts.get(attack.actionOrdinal)??[];
    const accepted=attack.settledPromptChain===true&&
      attack.settlementCrossesClockReset!==true;
    let qualification='COPY_CHOICE_UNVERIFIED';
    if(accepted&&matching.length===1){
      const chosen=matching[0];
      if(chosen.printing==='Genesect V FST'&&
          chosen.attackName==='Techno Blast')
        qualification='GENESECT_TECHNO_BLAST_SELECTED';
      else if(chosen.printing==='Mew V FST'&&
          chosen.attackName==='Energy Mix')
        qualification='MEW_ENERGY_MIX_SELECTED';
      else qualification='OTHER_COPY_SELECTED';
    }else if(!accepted){
      qualification='SETTLEMENT_UNQUALIFIED';
    }else if(matching.length>1){
      qualification='AMBIGUOUS_MULTIPLE_CHOICES';
    }
    return {attackRootOrdinal:attack.actionOrdinal,
      sourceGlobalTurn:attack.turnBefore??null,
      attackDeclaration:'Cross Fusion Strike',
      nativeSettlementWithinEpoch:accepted,
      matchingCopiedAttackPromptCount:matching.length,
      genuineSelections:matching,
      selectedAttackQualification:qualification,
      paperEffectAndDamageVerified:false,
      candidateReplyAndTournamentQualified:false};
  });
  const counts={};
  for(const item of records)
    counts[item.selectedAttackQualification]=
      (counts[item.selectedAttackQualification]??0)+1;
  return {version:VERSION,sourceTrialId:row.trial?.id??null,
    sourceSeat:row.sourceSeat??null,
    nativeCrossFusionDeclarations:records.length,
    selectedGenesectTechnoBlast:counts.GENESECT_TECHNO_BLAST_SELECTED??0,
    selectedMewEnergyMix:counts.MEW_ENERGY_MIX_SELECTED??0,
    noRecordedAttackSelection:records.filter(x=>
      x.matchingCopiedAttackPromptCount===0).length,
    qualificationCounts:counts,records,
    qualifiedCompetitiveGames:0};
}

module.exports={VERSION,auditSourceCopiedAttacks};
