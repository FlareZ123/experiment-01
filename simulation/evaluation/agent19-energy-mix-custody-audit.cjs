'use strict';
const assert=require('node:assert/strict');

const VERSION='agent19-original-source-energy-mix-public-custody-v1';
const DCE='Double Colorless Energy SUM';

/** @param {object[]} side Snapshot of both public player boards. @param {0|1} seat */
function attachedEnergyCount(side,seat){
  const owner=side?.[seat];
  if(!owner||!Array.isArray(owner.bench)||
     !Array.isArray(owner.active?.energyCards))return null;
  const slots=[owner.active,...owner.bench];
  if(slots.some(s=>!Array.isArray(s.energyCards)))return null;
  return slots.reduce((sum,s)=>sum+s.energyCards.length,0);
}

/** @param {string[]} before @param {string[]} after */
function addedEnergyNames(before,after){
  if(!Array.isArray(before)||!Array.isArray(after))return null;
  const counts=new Map();
  for(const name of before)counts.set(name,(counts.get(name)??0)-1);
  for(const name of after)counts.set(name,(counts.get(name)??0)+1);
  const added=[],removed=[];
  for(const [name,qty] of counts)
    for(let i=0;i<Math.abs(qty);i++)
      (qty>0?added:removed).push(name);
  return {added,removed};
}

/**
 * Audit actual selected Mew V Energy Mix copies using independent native
 * AttachEnergyPrompt public board receipts. Each receipt is attributed to
 * the same initiating source AttackAction and its settlement epoch. This
 * cannot prove the selected card's hidden deck origin or paper-valid
 * destination; no whole-game result is qualified by this auditor.
 *
 * @param {object} row Original-source full Store trace.
 * @returns {object}
 */
function auditSourceEnergyMixCustody(row){
  assert.ok(row&&typeof row==='object');
  assert.ok(row.sourceSeat===0||row.sourceSeat===1);
  assert.ok(Array.isArray(row.rootActionLedger));
  assert.ok(Array.isArray(row.sourceAttackSettlement?.attacks));
  assert.ok(Array.isArray(row.nativeAcceptedEnergyPromptSidecar?.events));
  const prompts=new Map();
  for(const action of row.rootActionLedger){
    if(action.pendingPrompt!=='ChooseAttackPrompt'||!action.attackChoice)
      continue;
    const root=action.initiatingRootActionOrdinal;
    if(!Number.isSafeInteger(root))continue;
    if(!prompts.has(root))prompts.set(root,[]);
    prompts.get(root).push(action.attackChoice);
  }
  const records=[];
  for(const attack of row.sourceAttackSettlement.attacks){
    if(attack.attackName!=='Cross Fusion Strike')continue;
    const chosen=prompts.get(attack.actionOrdinal)??[];
    if(chosen.length!==1||chosen[0].printing!=='Mew V FST'||
       chosen[0].attackName!=='Energy Mix')continue;
    const before=attachedEnergyCount(attack.publicBoardBefore,row.sourceSeat);
    const after=attachedEnergyCount(attack.publicBoardAfter,row.sourceSeat);
    const stable=attack.settledPromptChain===true&&
      attack.settlementCrossesClockReset!==true&&
      Number.isSafeInteger(attack.completionRootOrdinal);
    const sidecar=stable?row.nativeAcceptedEnergyPromptSidecar.events.filter(e=>
      e.promptType==='AttachEnergyPrompt'&&
      e.action==='ResolvePromptAction'&&
      e.playerSlot===row.sourceSeat&&
      e.dispatchOrdinal>attack.actionOrdinal&&
      e.dispatchOrdinal<=attack.completionRootOrdinal):[];
    const changed=sidecar.flatMap(e=>
      (e.publicChanges??[]).map(c=>({
        dispatchOrdinal:e.dispatchOrdinal,seat:c.seat,position:c.position,
        index:c.index,pokemonBefore:c.before?.pokemon??null,
        pokemonAfter:c.after?.pokemon??null,
        energyDifference:addedEnergyNames(
          c.before?.energies,c.after?.energies)
      })));
    const added=changed.flatMap(x=>x.energyDifference?.added??[]);
    const removed=changed.flatMap(x=>x.energyDifference?.removed??[]);
    const accepted=sidecar.length===1&&
      sidecar[0].nativeDispatchAccepted===true&&
      sidecar[0].publicAfterDispatch===true;
    let classification='UNVERIFIED_NATIVE_PROMPT_OR_EPOCH';
    if(stable&&accepted&&before!==null&&after!==null){
      if(after===before+1&&added.length===1&&added[0]===DCE&&
         removed.length===0&&changed.every(c=>c.seat===row.sourceSeat))
        classification='PUBLIC_DCE_GAIN_CONFIRMED';
      else if(after===before&&added.length===0&&removed.length===0)
        classification='NO_PUBLIC_ENERGY_GAIN';
      else classification='OTHER_OR_AMBIGUOUS_ENERGY_CHANGE';
    }
    records.push({trialId:row.trial?.id??null,sourceSeat:row.sourceSeat,
      attackRootOrdinal:attack.actionOrdinal,turn:attack.turnBefore??null,
      copiedAttack:'Mew V FST / Energy Mix',
      publicSourceEnergyBefore:before,publicSourceEnergyAfter:after,
      nativePromptReceiptCount:sidecar.length,
      addedPublicEnergyNames:added,
      publicChangedTargets:changed,
      classification,
      hiddenDeckCardIdentityVerified:false,
      paperDestinationAndShuffleVerified:false,
      competitiveGameQualified:false});
  }
  const counts={};
  for(const record of records)
    counts[record.classification]=(counts[record.classification]??0)+1;
  return {version:VERSION,trialId:row.trial?.id??null,
    sourceSeat:row.sourceSeat,
    selectedEnergyMixCopies:records.length,
    publicDceGains:counts.PUBLIC_DCE_GAIN_CONFIRMED??0,
    noPublicEnergyGains:counts.NO_PUBLIC_ENERGY_GAIN??0,
    unverified:records.length-
      (counts.PUBLIC_DCE_GAIN_CONFIRMED??0)-
      (counts.NO_PUBLIC_ENERGY_GAIN??0),
    counts,records,competitiveQualifiedGames:0};
}

module.exports={VERSION,DCE,attachedEnergyCount,addedEnergyNames,
  auditSourceEnergyMixCustody};
