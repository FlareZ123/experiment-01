'use strict';

/**
 * Read only accepted native owner roots. A paper-mandatory shuffle must be
 * observed after the AttachEnergyPrompt in the SAME actual Energy Mix attack
 * lineage. This audit never runs a bot, alters physical cards, or upgrades any
 * native attempt to paper or competitive qualification.
 *
 * @param {object} row Source-dealt native attempt with rootActionLedger.
 * @returns {object} Source-owned copy chains and positive/negative evidence.
 */
function auditOriginalEnergyMixShuffleLineages(row){
  const roots=row?.rootActionLedger;
  const sourceSeat=row?.sourceSeat;
  if(!Array.isArray(roots)||![0,1].includes(sourceSeat))
    return {status:'UNOBSERVABLE',reason:'missing native owner root ledger or seat',
      observedChoices:null,withPhysicalAttachPrompt:null,
      withPrintedShuffleAfterAttach:null,missingPrintedShuffle:null,
      chains:[],competitiveQualifiedGames:0};
  const byOrdinal=new Map(roots
    .filter(x=>Number.isSafeInteger(x?.actionOrdinal))
    .map(x=>[x.actionOrdinal,x]));
  const chainRows=[];
  for(const choice of roots){
    if(choice?.action!=='ResolvePromptAction'||
       choice.pendingPrompt!=='ChooseAttackPrompt'||
       choice.playerSlot!==sourceSeat||
       choice.attackChoice?.attackName!=='Energy Mix')
      continue;
    const rootOrdinal=choice.initiatingRootActionOrdinal;
    const attack=byOrdinal.get(rootOrdinal);
    const rootIsEnergyMix=attack?.action==='AttackAction'&&
      attack.playerSlot===sourceSeat&&
      ['Cross Fusion Strike','Energy Mix'].includes(attack.attack);
    const decisions=roots.filter(x=>
      x?.initiatingRootActionOrdinal===rootOrdinal&&
      x.action==='ResolvePromptAction').sort((a,b)=>
        a.actionOrdinal-b.actionOrdinal);
    const prompts=decisions.map(x=>x.pendingPrompt);
    const attach=decisions.find(x=>
      x.pendingPrompt==='AttachEnergyPrompt');
    const laterShuffle=attach?decisions.find(x=>
      x.pendingPrompt==='ShuffleDeckPrompt'&&
      x.actionOrdinal>attach.actionOrdinal):null;
    const status=!rootIsEnergyMix?'UNVERIFIED_SOURCE_ATTACK':
      !attach?'ATTACH_PROMPT_UNOBSERVED':
      laterShuffle?'SHUFFLE_SETTLED_AFTER_ATTACH':
      'PRINTED_SHUFFLE_MISSING';
    chainRows.push({
      sourceSeat,choiceActionOrdinal:choice.actionOrdinal,
      initiatingRootActionOrdinal:rootOrdinal,
      originalAttack:attack?.attack??null,
      matchedSourceAttack:Boolean(rootIsEnergyMix),
      attachActionOrdinal:attach?.actionOrdinal??null,
      shuffleActionOrdinal:laterShuffle?.actionOrdinal??null,
      sameRootPromptKinds:prompts,
      status,paperComplete:false,
      competitiveQualifiedGames:0
    });
  }
  return {
    status:'AUDITED_NATIVE_ROOTS',
    observedChoices:chainRows.length,
    withPhysicalAttachPrompt:chainRows.filter(x=>
      x.attachActionOrdinal!==null&&x.matchedSourceAttack).length,
    withPrintedShuffleAfterAttach:chainRows.filter(x=>
      x.status==='SHUFFLE_SETTLED_AFTER_ATTACH').length,
    missingPrintedShuffle:chainRows.filter(x=>
      x.status==='PRINTED_SHUFFLE_MISSING').length,
    unverifiedLineages:chainRows.filter(x=>
      ['UNVERIFIED_SOURCE_ATTACK','ATTACH_PROMPT_UNOBSERVED']
        .includes(x.status)).length,
    chains:chainRows,
    competitiveQualifiedGames:0
  };
}

/**
 * @param {object[]} rows Actual native source-dealt rows, including aborts.
 * @returns {object} No failed row or source-no-opportunity is silently removed.
 */
function auditSourceRows(rows){
  if(!Array.isArray(rows))throw new TypeError('Actual native rows array required');
  const perRow=rows.map(row=>({
    trialId:row?.trial?.id??null,
    ...auditOriginalEnergyMixShuffleLineages(row)
  }));
  return {observedRows:rows.length,
    unobservableRows:perRow.filter(x=>x.status==='UNOBSERVABLE').length,
    totalChoices:perRow.reduce((n,x)=>n+(x.observedChoices??0),0),
    withAttach:perRow.reduce((n,x)=>n+(x.withPhysicalAttachPrompt??0),0),
    withShuffle:perRow.reduce((n,x)=>n+(x.withPrintedShuffleAfterAttach??0),0),
    missingShuffle:perRow.reduce((n,x)=>n+(x.missingPrintedShuffle??0),0),
    perRow,competitiveQualifiedGames:0};
}

module.exports={auditOriginalEnergyMixShuffleLineages,auditSourceRows};
